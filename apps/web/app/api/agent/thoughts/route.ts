
import { NextResponse } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const dynamic = 'force-dynamic';

export async function GET() {
    if (!SUPABASE_URL || !SUPABASE_KEY) return NextResponse.json([]);

    try {
        // We must encode % and the emoji correctly for the URL
        const filter = encodeURIComponent('%⚙️%');
        const res = await fetch(
            `${SUPABASE_URL}/rest/v1/agent_logs?message=like.${filter}&select=*&order=created_at.desc&limit=10`,
            {
                headers: {
                    apikey: SUPABASE_KEY,
                    Authorization: `Bearer ${SUPABASE_KEY}`,
                },
                cache: 'no-store',
            }
        );
        const data = await res.json();
        if (!Array.isArray(data)) return NextResponse.json([]);

        return NextResponse.json(data.map((d: any) => ({
            id: d.id,
            agent: d.agent_id,
            thought: d.message.replace('⚙️ [LOG] ', ''),
            protocol: 'telemetry',
            timestamp: d.created_at || d.timestamp || new Date().toISOString()
        })));
    } catch (e) {
        return NextResponse.json([]);
    }
}

export async function POST(req: Request) {
    if (!SUPABASE_URL || !SUPABASE_KEY) return NextResponse.json({ error: 'Config missing' });

    try {
        const { agent, thought, protocol } = await req.json();
        console.log(`📡 [TelemetryFeed] Attempting to save log from ${agent}...`);

        const res = await fetch(`${SUPABASE_URL}/rest/v1/agent_logs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
                agent_id: agent,
                message: `⚙️ [LOG] ${thought}`,
                level: 'info',
            }),
        });
        
        if (res.ok) {
            console.log(`✅ [TelemetryFeed] Log saved to Supabase.`);
        } else {
            console.warn(`❌ [TelemetryFeed] Supabase rejected log:`, res.status, await res.text());
        }

        return NextResponse.json({ success: res.ok });
    } catch (e: any) {
        console.error(`🚨 [TelemetryFeed] API Crash:`, e.message);
        return NextResponse.json({ error: 'Invalid thought' }, { status: 400 });
    }
}
