import { Webhook, WebhookEventType } from '../types/database.types.js';
/**
 * Register a new webhook.
 */
export declare function registerWebhook(userId: string, url: string, events: WebhookEventType[], secret?: string): Webhook;
/**
 * Get all webhooks for a user.
 */
export declare function getUserWebhooks(userId: string): Webhook[];
/**
 * Delete a webhook.
 */
export declare function deleteWebhook(webhookId: string): boolean;
/**
 * Dispatch a webhook event to all matching subscribers.
 */
export declare function dispatchWebhookEvent(event: WebhookEventType, payload: Record<string, unknown>): Promise<void>;
/**
 * Send a test payload to a specific webhook.
 */
export declare function testWebhook(webhookId: string): Promise<{
    success: boolean;
    statusCode?: number;
    error?: string;
}>;
//# sourceMappingURL=webhookService.d.ts.map