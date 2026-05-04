import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const TREASURY = "GC4Q5TWWXI7IHN6DYCBEKCOWJWCKY4JE2NLKLU5SE3YL44IUUFPKUOPC";
const USDC_ISSUER = 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5';

export async function GET() {
    try {
        // 1. Fetch from agent_logs (Payments, M2M, x402 metadata)
        const agentLogsPromise = (SUPABASE_URL && SUPABASE_KEY) ? fetch(
            `${SUPABASE_URL}/rest/v1/agent_logs?select=*&order=created_at.desc&limit=30`,
            {
                headers: {
                    apikey: SUPABASE_KEY,
                    Authorization: `Bearer ${SUPABASE_KEY}`,
                },
                next: { revalidate: 0 },
            }
        ).then(res => res.ok ? res.json() : []) : Promise.resolve([]);

        // 2. Fetch from logs (Soroban Intelligence, Activity)
        const activityLogsPromise = (SUPABASE_URL && SUPABASE_KEY) ? fetch(
            `${SUPABASE_URL}/rest/v1/logs?select=*&order=timestamp.desc&limit=30`,
            {
                headers: {
                    apikey: SUPABASE_KEY,
                    Authorization: `Bearer ${SUPABASE_KEY}`,
                },
                next: { revalidate: 0 },
            }
        ).then(res => res.ok ? res.json() : []) : Promise.resolve([]);

        // 3. Fetch from Horizon (Live On-chain Settlements) — 5s timeout so we never block OpsConsole
        const horizonPromise = fetch(
            `https://horizon-testnet.stellar.org/accounts/${TREASURY}/operations?order=desc&limit=20`,
            { signal: AbortSignal.timeout(5000) }
        ).then(res => res.ok ? res.json() : { _embedded: { records: [] } })
         .catch(() => ({ _embedded: { records: [] } }));

        const [agentData, activityData, horizonData] = await Promise.all([
            agentLogsPromise, 
            activityLogsPromise, 
            horizonPromise
        ]);

        // Normalize Horizon Settlements
        const settlements = (horizonData?._embedded?.records ?? []).reduce((acc: any[], r: any) => {
            let amount: string | null = null;
            if (r.type === 'invoke_host_function') {
                const change = r.asset_balance_changes?.find(
                    (c: any) => c.to === TREASURY && c.asset_code === 'USDC' && c.asset_issuer === USDC_ISSUER
                );
                if (change) amount = change.amount;
            } else if ((r.type === 'payment' || r.type === 'path_payment_strict_receive') && r.to === TREASURY && r.asset_code === 'USDC') {
                amount = r.amount;
            }

            if (!amount) return acc;
            const val = parseFloat(amount);
            let pType = 'SETTLEMENT';
            let route = '';
            
            if (val === 0.02) { pType = 'x402'; route = '/signals'; }
            else if (val === 0.05) { pType = 'x402'; route = '/market-data'; }
            else if (val === 0.25) { pType = 'MPP'; route = '/execution'; }
            else if (val >= 1.0) { pType = 'MPP'; route = '/mpp/session-init'; }
            else { return acc; } // Skip non-protocol payments

            acc.push({
                id: r.id,
                agent_id: pType,
                message: `Resolved: ${route} settlement confirmed (+${amount} USDC) | tx=${r.transaction_hash || r.transaction_id}`,
                level: 'success',
                created_at: r.created_at,
                source: 'horizon',
                tx_hash: r.transaction_hash || r.transaction_id,
                sortDate: new Date(r.created_at).getTime()
            });
            return acc;
        }, []);

        // Normalize and merge everything
        const unified = [
            ...agentData.map((l: any) => ({
                ...l,
                source: 'agent_logs',
                sortDate: new Date(l.created_at).getTime()
            })),
            ...activityData.map((l: any) => ({
                id: l.id,
                agent_id: 'INTELLIGENCE',
                message: l.message,
                level: l.level || 'info',
                created_at: l.timestamp,
                source: 'logs',
                sortDate: new Date(l.timestamp).getTime()
            })),
            ...settlements
        ];

        unified.sort((a, b) => b.sortDate - a.sortDate);

        return NextResponse.json(unified.slice(0, 50));
    } catch (e) {
        console.error('[API /logs] GET Error:', e);
        return NextResponse.json([], { status: 200 });
    }
}

export async function POST(req: NextRequest) {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
        return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
    }

    try {
        const body = await req.json();
        const { message, level, agent_id } = body;

        if (!message) {
            return NextResponse.json({ error: 'message is required' }, { status: 400 });
        }

        const res = await fetch(`${SUPABASE_URL}/rest/v1/agent_logs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Prefer': 'return=minimal',
            },
            body: JSON.stringify({
                agent_id: agent_id || 'UI_CLIENT',
                message,
                level: level || 'info',
            }),
        });

        if (!res.ok) {
            const errText = await res.text();
            console.error('[API /logs] POST Error:', res.status, errText);
            return NextResponse.json({ error: errText }, { status: res.status });
        }

        return NextResponse.json({ success: true }, { status: 201 });
    } catch (e) {
        console.error('[API /logs] POST Exception:', e);
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}
