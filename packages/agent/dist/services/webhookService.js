export async function registerWebhook(userId, url, events, secret) {
    return { id: Math.random().toString(36).substring(7), url, events, active: true };
}
export function getUserWebhooks(userId) {
    return [];
}
export function deleteWebhook(id) {
    return true;
}
export async function testWebhook(id) {
    return { success: true, message: 'Test event sent' };
}
export async function dispatchWebhookEvent(event, payload) {
    console.log(`[Webhook] Dispatching \${event}...`);
}
//# sourceMappingURL=webhookService.js.map