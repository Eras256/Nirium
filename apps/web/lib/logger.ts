/**
 * Write a log entry to the Supabase `logs` table.
 * Used by Dashboard (strategy events), Marketplace, and Plugins (install events).
 *
 * Uses raw fetch to avoid Supabase TS generic issues with dynamically-added tables.
 */
export async function writeLog(
    message: string,
    level: 'info' | 'warn' | 'error' | 'success' | 'system' = 'info',
    agentId?: string
) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return; // Silently skip if not configured

    try {
        await fetch(`${url}/rest/v1/nirium_protocol_records`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': key,
                'Authorization': `Bearer ${key}`,
                'Prefer': 'return=minimal',
            },
            body: JSON.stringify({
                owner_address: 'UI_CLIENT',
                record_type: 'LOG',
                message,
                level,
                tx_hash: agentId ?? null, // re-using field for trace id if needed
            }),
        });
    } catch (e) {
        // Silently fail — logs are non-critical
        console.warn('[writeLog] Failed:', e);
    }
}
