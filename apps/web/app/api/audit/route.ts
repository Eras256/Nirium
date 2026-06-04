import { NextResponse } from 'next/server';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const PINATA_GATEWAY = process.env.NEXT_PUBLIC_PINATA_GATEWAY || 'https://gateway.pinata.cloud';

export interface AuditLogEntry {
    id: string;
    cid: string;
    gateway_url: string;
    log_count: number;
    created_at: string;
    agent_id: string;
    level: string;
    message: string;
}

/**
 * GET /api/audit — Fetch IPFS audit trail records from Supabase logs.
 * Filters for log entries that contain IPFS CIDs (archived batches).
 * Optional query params: ?agent=AGENT_NAME&from=ISO_DATE&to=ISO_DATE&limit=50
 */
export async function GET(req: Request) {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
        return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const agent = searchParams.get('agent');
        const from = searchParams.get('from');
        const to = searchParams.get('to');
        const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 200);

        // Query logs table for IPFS archival entries
        // The agent broadcasts these with message containing "archived to IPFS"
        let logsUrl = `${SUPABASE_URL}/rest/v1/logs?select=*&order=timestamp.desc&limit=${limit}`;
        logsUrl += `&message=ilike.*IPFS*`;

        if (agent) logsUrl += `&agent_id=eq.${encodeURIComponent(agent)}`;
        if (from) logsUrl += `&timestamp=gte.${encodeURIComponent(from)}`;
        if (to) logsUrl += `&timestamp=lte.${encodeURIComponent(to)}`;

        // Also query agent_logs for audit entries
        let agentLogsUrl = `${SUPABASE_URL}/rest/v1/agent_logs?select=*&order=created_at.desc&limit=${limit}`;
        agentLogsUrl += `&message=ilike.*IPFS*`;

        if (agent) agentLogsUrl += `&agent_id=eq.${encodeURIComponent(agent)}`;
        if (from) agentLogsUrl += `&created_at=gte.${encodeURIComponent(from)}`;
        if (to) agentLogsUrl += `&created_at=lte.${encodeURIComponent(to)}`;

        const headers = {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
        };

        const [logsRes, agentRes] = await Promise.all([
            fetch(logsUrl, { headers, next: { revalidate: 0 } }).then(r => r.ok ? r.json() : []),
            fetch(agentLogsUrl, { headers, next: { revalidate: 0 } }).then(r => r.ok ? r.json() : []),
        ]);

        // Extract CIDs from log messages and structure the response
        const cidRegex = /(?:CID|cid|Qm)[:\s]*([Qb][a-zA-Z0-9]{44,})/;
        const gatewayRegex = /https?:\/\/[^\s]+\/ipfs\/([Qb][a-zA-Z0-9]{44,})/;

        const auditEntries: AuditLogEntry[] = [];

        const processEntry = (entry: any, source: string) => {
            const msg = entry.message || '';
            const cidMatch = msg.match(cidRegex) || msg.match(gatewayRegex);
            if (!cidMatch) return;

            const cid = cidMatch[1];
            const logCountMatch = msg.match(/(\d+)\s*logs?/i);
            const logCount = logCountMatch ? parseInt(logCountMatch[1]) : 0;

            auditEntries.push({
                id: entry.id || `${source}-${entry.created_at || entry.timestamp}`,
                cid,
                gateway_url: `${PINATA_GATEWAY}/ipfs/${cid}`,
                log_count: logCount,
                created_at: entry.created_at || entry.timestamp,
                agent_id: entry.agent_id || 'SYSTEM',
                level: entry.level || 'info',
                message: msg,
            });
        };

        (logsRes || []).forEach((e: any) => processEntry(e, 'logs'));
        (agentRes || []).forEach((e: any) => processEntry(e, 'agent_logs'));

        // Deduplicate by CID
        const seen = new Set<string>();
        const deduplicated = auditEntries.filter(e => {
            if (seen.has(e.cid)) return false;
            seen.add(e.cid);
            return true;
        });

        deduplicated.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        return NextResponse.json({
            total: deduplicated.length,
            gateway: PINATA_GATEWAY,
            entries: deduplicated.slice(0, limit),
        });
    } catch (e) {
        console.error('[API /audit] Error:', e);
        return NextResponse.json({ total: 0, entries: [] }, { status: 200 });
    }
}
