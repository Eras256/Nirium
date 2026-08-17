import { NextRequest, NextResponse } from 'next/server';
import { agentGet, asAgentNetwork } from '@/lib/agentProxy';

// Metadatos del nodo de tesorería. Público: lo que declara sobre su propio
// alcance debe poder leerse sin credenciales, o la afirmación no vale nada.
export async function GET(req: NextRequest) {
    try {
        const network = asAgentNetwork(req.nextUrl.searchParams.get('network'));
        const { status, data } = await agentGet('/api/treasury/info', network);
        return NextResponse.json(data, { status });
    } catch (e) {
        return NextResponse.json({ error: e instanceof Error ? e.message : 'proxy error' }, { status: 502 });
    }
}
