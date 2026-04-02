import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function GET() {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
        return NextResponse.json([], { status: 200 });
    }

    try {
        const res = await fetch(
            `${SUPABASE_URL}/rest/v1/logs?select=*&order=timestamp.desc&limit=50`,
            {
                headers: {
                    apikey: SUPABASE_KEY,
                    Authorization: `Bearer ${SUPABASE_KEY}`,
                },
                next: { revalidate: 0 },
            }
        );

        if (!res.ok) {
            return NextResponse.json([], { status: res.status });
        }

        const data = await res.json();
        return NextResponse.json(data);
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

        const res = await fetch(`${SUPABASE_URL}/rest/v1/logs`, {
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
