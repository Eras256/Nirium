// ═══════════════════════════════════════════════════════════════
// Nirium — Webhook Service (Real Implementation)
// ═══════════════════════════════════════════════════════════════
import crypto from 'crypto';
// In-memory store (persisted per agent session; for production, use Supabase)
const webhooks = new Map();
/**
 * Register a new webhook endpoint.
 */
export async function registerWebhook(userId, url, events, secret) {
    const id = crypto.randomUUID();
    const webhook = {
        id,
        userId,
        url,
        events,
        secret: secret || crypto.randomBytes(32).toString('hex'),
        active: true,
        createdAt: new Date().toISOString(),
        failureCount: 0,
    };
    webhooks.set(id, webhook);
    console.log(`[Webhook] Registered: ${url} for events: [${events.join(', ')}]`);
    return webhook;
}
/**
 * Get all webhooks for a user.
 */
export function getUserWebhooks(userId) {
    return Array.from(webhooks.values()).filter(w => w.userId === userId);
}
/**
 * Delete a webhook.
 */
export function deleteWebhook(id) {
    const existed = webhooks.has(id);
    webhooks.delete(id);
    if (existed)
        console.log(`[Webhook] Deleted: ${id}`);
    return existed;
}
/**
 * Send a test event to a webhook.
 */
export async function testWebhook(id) {
    const webhook = webhooks.get(id);
    if (!webhook) {
        return { success: false, message: 'Webhook not found' };
    }
    return deliverPayload(webhook, {
        event: 'test',
        timestamp: new Date().toISOString(),
        data: { message: 'Nirium webhook test — if you receive this, your endpoint is configured correctly.' },
    });
}
/**
 * Dispatch a real event to all matching webhooks.
 */
export async function dispatchWebhookEvent(event, payload) {
    const matching = Array.from(webhooks.values()).filter(w => w.active && w.events.includes(event));
    if (matching.length === 0)
        return;
    console.log(`[Webhook] Dispatching "${event}" to ${matching.length} endpoint(s)`);
    const deliveries = matching.map(webhook => deliverPayload(webhook, {
        event,
        timestamp: new Date().toISOString(),
        data: payload,
    }).catch(err => {
        console.error(`[Webhook] Delivery failed for ${webhook.url}:`, err);
    }));
    await Promise.allSettled(deliveries);
}
/**
 * Deliver a payload to a single webhook with HMAC signature.
 */
async function deliverPayload(webhook, body) {
    const bodyStr = JSON.stringify(body);
    // Sign payload with HMAC-SHA256
    const signature = crypto
        .createHmac('sha256', webhook.secret)
        .update(bodyStr)
        .digest('hex');
    try {
        const res = await fetch(webhook.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Nirium-Signature': `sha256=${signature}`,
                'X-Nirium-Event': String(body.event),
                'X-Nirium-Delivery': crypto.randomUUID(),
                'User-Agent': 'Nirium-Webhook/1.0',
            },
            body: bodyStr,
            signal: AbortSignal.timeout(10000),
        });
        webhook.lastTriggeredAt = new Date().toISOString();
        if (res.ok) {
            webhook.failureCount = 0;
            return { success: true, message: `Delivered (${res.status})`, statusCode: res.status };
        }
        else {
            webhook.failureCount++;
            // Auto-disable after 10 consecutive failures
            if (webhook.failureCount >= 10) {
                webhook.active = false;
                console.warn(`[Webhook] Auto-disabled ${webhook.url} after 10 consecutive failures.`);
            }
            return { success: false, message: `HTTP ${res.status}`, statusCode: res.status };
        }
    }
    catch (error) {
        webhook.failureCount++;
        if (webhook.failureCount >= 10) {
            webhook.active = false;
        }
        return { success: false, message: `Delivery error: ${error}` };
    }
}
//# sourceMappingURL=webhookService.js.map