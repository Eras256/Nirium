import { NextResponse } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function GET() {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
        return NextResponse.json([], { status: 200 });
    }

    try {
        const res = await fetch(
            `${SUPABASE_URL}/rest/v1/nirium_swarm_agents?select=*&order=total_txs.desc,id.asc`,
            {
                headers: {
                    apikey: SUPABASE_KEY,
                    Authorization: `Bearer ${SUPABASE_KEY}`,
                },
                next: { revalidate: 0 },
            }
        );

        if (!res.ok) {
            return NextResponse.json([], { status: 200 });
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (e) {
        console.error('[API /agents] Error:', e);
        return NextResponse.json([], { status: 200 });
    }
}
