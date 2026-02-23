// ═══════════════════════════════════════════════════════════════
// Nirium — Webhook Service with HMAC Signing + Retry Logic
// ═══════════════════════════════════════════════════════════════
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
const webhooks = new Map();
const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 5000, 30000]; // 1s, 5s, 30s
const MAX_CONSECUTIVE_FAILURES = 10;
/**
 * Register a new webhook.
 */
export function registerWebhook(userId, url, events, secret) {
    const webhook = {
        id: uuidv4(),
        user_id: userId,
        url,
        events,
        secret: secret || crypto.randomBytes(32).toString('hex'),
        is_active: true,
        failure_count: 0,
        created_at: new Date().toISOString(),
    };
    webhooks.set(webhook.id, webhook);
    return webhook;
}
/**
 * Get all webhooks for a user.
 */
export function getUserWebhooks(userId) {
    return Array.from(webhooks.values()).filter(w => w.user_id === userId);
}
/**
 * Delete a webhook.
 */
export function deleteWebhook(webhookId) {
    return webhooks.delete(webhookId);
}
/**
 * Sign a payload with HMAC-SHA256.
 */
function signPayload(payload, secret) {
    return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}
/**
 * Dispatch a webhook event to all matching subscribers.
 */
export async function dispatchWebhookEvent(event, payload) {
    const matchingWebhooks = Array.from(webhooks.values()).filter(w => w.is_active && w.events.includes(event));
    const promises = matchingWebhooks.map(webhook => deliverWebhook(webhook, event, payload));
    await Promise.allSettled(promises);
}
/**
 * Deliver a webhook with retry logic.
 */
async function deliverWebhook(webhook, event, payload) {
    const body = JSON.stringify({
        event,
        payload,
        webhook_id: webhook.id,
        timestamp: new Date().toISOString(),
        delivery_id: uuidv4(),
    });
    const signature = signPayload(body, webhook.secret);
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
            const response = await fetch(webhook.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Nirium-Signature': signature,
                    'X-Nirium-Event': event,
                    'X-Nirium-Delivery': uuidv4(),
                    'User-Agent': 'Nirium-Webhook/0.1.0',
                },
                body,
                signal: AbortSignal.timeout(10_000), // 10s timeout
            });
            if (response.ok) {
                // Reset failure count on success
                webhook.failure_count = 0;
                webhook.last_triggered_at = new Date().toISOString();
                webhooks.set(webhook.id, webhook);
                return;
            }
            console.warn(`[Webhook] ${webhook.url} returned ${response.status} (attempt ${attempt + 1})`);
        }
        catch (error) {
            console.warn(`[Webhook] ${webhook.url} failed (attempt ${attempt + 1}): ${error}`);
        }
        // Wait before retry (except on last attempt)
        if (attempt < MAX_RETRIES) {
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAYS[attempt]));
        }
    }
    // All retries exhausted — increment failure count
    webhook.failure_count++;
    if (webhook.failure_count >= MAX_CONSECUTIVE_FAILURES) {
        webhook.is_active = false;
        console.error(`[Webhook] ${webhook.url} disabled after ${MAX_CONSECUTIVE_FAILURES} consecutive failures`);
    }
    webhooks.set(webhook.id, webhook);
}
/**
 * Send a test payload to a specific webhook.
 */
export async function testWebhook(webhookId) {
    const webhook = webhooks.get(webhookId);
    if (!webhook) {
        return { success: false, error: 'Webhook not found' };
    }
    const testPayload = {
        event: 'health.warning',
        payload: {
            message: 'This is a test webhook delivery from Nirium',
            test: true,
            timestamp: new Date().toISOString(),
        },
    };
    const body = JSON.stringify(testPayload);
    const signature = signPayload(body, webhook.secret);
    try {
        const response = await fetch(webhook.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Nirium-Signature': signature,
                'X-Nirium-Event': 'health.warning',
                'X-Nirium-Test': 'true',
                'User-Agent': 'Nirium-Webhook/0.1.0',
            },
            body,
            signal: AbortSignal.timeout(10_000),
        });
        return { success: response.ok, statusCode: response.status };
    }
    catch (error) {
        return { success: false, error: String(error) };
    }
}
//# sourceMappingURL=webhookService.js.map