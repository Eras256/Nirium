/**
 * Write a log entry via /api/logs (server-side insert to Supabase).
 * Routing through the API route avoids CORS issues and surfaces errors.
 */
export async function writeLog(
    message: string,
    level: 'info' | 'warn' | 'error' | 'success' | 'system' = 'info',
    agentId?: string
) {
    try {
        const res = await fetch('/api/logs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                agent_id: agentId || 'UI_CLIENT',
                message,
                level,
            }),
        });
        if (!res.ok) {
            console.warn('[writeLog] Insert failed:', res.status, await res.text());
        }
    } catch (e) {
        console.warn('[writeLog] Failed:', e);
    }
}
