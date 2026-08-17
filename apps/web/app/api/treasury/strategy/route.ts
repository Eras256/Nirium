import { NextRequest, NextResponse } from 'next/server';
import { agentGet, asAgentNetwork } from '@/lib/agentProxy';

// Qué activo maneja una estrategia. La consola lo consulta en vez de dejar que
// alguien empareje activo y estrategia a mano: el vault rechaza el par
// desalineado en su constructor, con un error que no dice cuál fue el problema.
export async function GET(req: NextRequest) {
    try {
        const strategy = req.nextUrl.searchParams.get('strategy');
        if (!strategy) return NextResponse.json({ error: 'strategy required' }, { status: 400 });
        const network = asAgentNetwork(req.nextUrl.searchParams.get('network'));
        const { status, data } = await agentGet(`/api/treasury/strategy/${encodeURIComponent(strategy)}`, network);
        return NextResponse.json(data, { status });
    } catch (e) {
        return NextResponse.json({ error: e instanceof Error ? e.message : 'proxy error' }, { status: 502 });
    }
}
