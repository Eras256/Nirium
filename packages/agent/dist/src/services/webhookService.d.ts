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
/**
 * Register a new webhook endpoint.
 */
export declare function registerWebhook(userId: string, url: string, events: string[], secret?: string): Promise<Webhook>;
/**
 * Get all webhooks for a user.
 */
export declare function getUserWebhooks(userId: string): Webhook[];
/**
 * Delete a webhook.
 */
export declare function deleteWebhook(id: string): boolean;
/**
 * Send a test event to a webhook.
 */
export declare function testWebhook(id: string): Promise<{
    success: boolean;
    message: string;
    statusCode?: number;
}>;
/**
 * Dispatch a real event to all matching webhooks.
 */
export declare function dispatchWebhookEvent(event: string, payload: any): Promise<void>;
//# sourceMappingURL=webhookService.d.ts.map