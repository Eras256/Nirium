// ═══════════════════════════════════════════════════════════════
// Nirium — Webhook Service (Supabase-persisted + in-memory fallback)
// ═══════════════════════════════════════════════════════════════

import crypto from 'crypto';
import { supabase } from '../providers/database.js';

const SUPABASE_AVAILABLE = !!(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY);

// ═══════════════════════════════════════════════════════════════
// SSRF PROTECTION — Block requests to internal/private networks
// ═══════════════════════════════════════════════════════════════

const PRIVATE_IP_PATTERNS = [
    /^localhost$/i,
    /^127\./,
    /^10\./,
    /^172\.(1[6-9]|2\d|3[01])\./,
    /^192\.168\./,
    /^169\.254\./,          // Link-local
    /^::1$/,                // IPv6 loopback
    /^fc00:/i,              // IPv6 unique local
    /^fe80:/i,              // IPv6 link-local
    /^0\./,                 // Invalid
    /^metadata\.google/i,  // GCP metadata
    /^169\.254\.169\.254/, // AWS/Azure metadata
];

function validateWebhookUrl(rawUrl: string): { valid: boolean; reason?: string } {
    let parsed: URL;
    try {
        parsed = new URL(rawUrl);
    } catch {
        return { valid: false, reason: 'Invalid URL format' };
    }

    if (!['https:', 'http:'].includes(parsed.protocol)) {
        return { valid: false, reason: 'Only http/https protocols allowed' };
    }

    const hostname = parsed.hostname;

    for (const pattern of PRIVATE_IP_PATTERNS) {
        if (pattern.test(hostname)) {
            return { valid: false, reason: 'Webhook URL must point to a public internet endpoint' };
        }
    }

    return { valid: true };
}

export interface Webhook {
    id: string;
    userId: string;
    url: string;
    events: string[];
    secret: string;
    active: boolean;
    createdAt: string;
    lastTriggeredAt?: string;
    failureCount: number;
}

// In-memory store (persisted per agent session; for production, use Supabase)
const webhooks = new Map<string, Webhook>();

/**
 * Register a new webhook endpoint.
 */
export async function registerWebhook(
    userId: string,
    url: string,
    events: string[],
    secret?: string
): Promise<Webhook> {
    const urlCheck = validateWebhookUrl(url);
    if (!urlCheck.valid) {
        throw new Error(`Invalid webhook URL: ${urlCheck.reason}`);
    }

    const ALLOWED_EVENTS = [
        'execution.started', 'execution.completed', 'execution.failed',
        'signal.generated', 'loop.started', 'loop.stopped', 'test',
    ];
    const invalidEvents = events.filter(e => !ALLOWED_EVENTS.includes(e));
    if (invalidEvents.length > 0) {
        throw new Error(`Unknown events: ${invalidEvents.join(', ')}. Allowed: ${ALLOWED_EVENTS.join(', ')}`);
    }

    const id = crypto.randomUUID();
    const webhookSecret = secret || crypto.randomBytes(32).toString('hex');
    const createdAt = new Date().toISOString();

    const webhook: Webhook = {
        id,
        userId,
        url,
        events,
        secret: webhookSecret,
        active: true,
        createdAt,
        failureCount: 0,
    };

    // Persist to Supabase
    if (SUPABASE_AVAILABLE) {
        try {
            const { error } = await supabase.from('webhooks').insert({
                id,
                user_id: userId,
                url,
                events,
                secret: webhookSecret,
                active: true,
                failure_count: 0,
                created_at: createdAt,
            });
            if (error) {
                console.error('[Webhook] Supabase insert failed, using memory fallback:', error.message);
                webhooks.set(id, webhook);
            }
        } catch {
            webhooks.set(id, webhook);
        }
    } else {
        webhooks.set(id, webhook);
    }

    console.log(`[Webhook] Registered ${events.length} event(s) for user`);
    return webhook;
}

/**
 * Get all webhooks for a user.
 */
export async function getUserWebhooks(userId: string): Promise<Webhook[]> {
    if (SUPABASE_AVAILABLE) {
        try {
            const { data, error } = await supabase
                .from('webhooks')
                .select('id, user_id, url, events, secret, active, failure_count, created_at, last_triggered_at')
                .eq('user_id', userId)
                .eq('active', true);

            if (!error && data) {
                return data.map((row: any) => ({
                    id: row.id,
                    userId: row.user_id,
                    url: row.url,
                    events: row.events,
                    secret: row.secret,
                    active: row.active,
                    failureCount: row.failure_count,
                    createdAt: row.created_at,
                    lastTriggeredAt: row.last_triggered_at,
                }));
            }
        } catch { /* fallback */ }
    }
    return Array.from(webhooks.values()).filter(w => w.userId === userId);
}

/**
 * Delete a webhook.
 */
export async function deleteWebhook(id: string): Promise<boolean> {
    if (SUPABASE_AVAILABLE) {
        try {
            const { error } = await supabase
                .from('webhooks')
                .update({ active: false })
                .eq('id', id);
            if (!error) {
                console.log(`[Webhook] Deleted: ${id} (Supabase)`);
                return true;
            }
        } catch { /* fallback */ }
    }
    const existed = webhooks.has(id);
    webhooks.delete(id);
    if (existed) console.log(`[Webhook] Deleted: ${id} (memory)`);
    return existed;
}

/**
 * Send a test event to a webhook.
 */
export async function testWebhook(id: string): Promise<{ success: boolean; message: string; statusCode?: number }> {
    // Try Supabase first
    let webhook: Webhook | undefined;
    if (SUPABASE_AVAILABLE) {
        try {
            const { data } = await supabase
                .from('webhooks')
                .select('id, user_id, url, events, secret, active, failure_count, created_at')
                .eq('id', id)
                .single();
            if (data) {
                webhook = { id: data.id, userId: data.user_id, url: data.url, events: data.events, secret: data.secret, active: data.active, failureCount: data.failure_count, createdAt: data.created_at };
            }
        } catch { /* fallback */ }
    }
    if (!webhook) webhook = webhooks.get(id);
    if (!webhook) return { success: false, message: 'Webhook not found' };

    return deliverPayload(webhook, {
        event: 'test',
        timestamp: new Date().toISOString(),
        data: { message: 'Nirium webhook test — if you receive this, your endpoint is configured correctly.' },
    });
}

/**
 * Dispatch a real event to all matching webhooks.
 */
export async function dispatchWebhookEvent(event: string, payload: any): Promise<void> {
    let matching: Webhook[] = [];
    if (SUPABASE_AVAILABLE) {
        try {
            const { data } = await supabase
                .from('webhooks')
                .select('id, user_id, url, events, secret, active, failure_count, created_at')
                .eq('active', true)
                .contains('events', [event]);
            if (data) {
                matching = data.map((row: any) => ({ id: row.id, userId: row.user_id, url: row.url, events: row.events, secret: row.secret, active: row.active, failureCount: row.failure_count, createdAt: row.created_at }));
            }
        } catch { /* fallback */ }
    }
    if (matching.length === 0) {
        matching = Array.from(webhooks.values()).filter(w => w.active && w.events.includes(event));
    }

    if (matching.length === 0) return;

    console.log(`[Webhook] Dispatching "${event}" to ${matching.length} endpoint(s)`);

    const deliveries = matching.map(webhook =>
        deliverPayload(webhook, {
            event,
            timestamp: new Date().toISOString(),
            data: payload,
        }).catch(err => {
            console.error(`[Webhook] Delivery failed for ${webhook.url}:`, err);
        })
    );

    await Promise.allSettled(deliveries);
}

/**
 * Deliver a payload to a single webhook with HMAC signature.
 */
async function deliverPayload(
    webhook: Webhook,
    body: Record<string, unknown>
): Promise<{ success: boolean; message: string; statusCode?: number }> {
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
        } else {
            webhook.failureCount++;
            // Auto-disable after 10 consecutive failures
            if (webhook.failureCount >= 10) {
                webhook.active = false;
                console.warn(`[Webhook] Auto-disabled ${webhook.url} after 10 consecutive failures.`);
            }
            return { success: false, message: `HTTP ${res.status}`, statusCode: res.status };
        }
    } catch (error) {
        webhook.failureCount++;
        if (webhook.failureCount >= 10) {
            webhook.active = false;
        }
        return { success: false, message: `Delivery error: ${error}` };
    }
}
