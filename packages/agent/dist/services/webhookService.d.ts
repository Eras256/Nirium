export declare function registerWebhook(userId: string, url: string, events: string[], secret?: string): Promise<{
    id: string;
    url: string;
    events: string[];
    active: boolean;
}>;
export declare function getUserWebhooks(userId: string): never[];
export declare function deleteWebhook(id: string): boolean;
export declare function testWebhook(id: string): Promise<{
    success: boolean;
    message: string;
}>;
export declare function dispatchWebhookEvent(event: string, payload: any): Promise<void>;
//# sourceMappingURL=webhookService.d.ts.map