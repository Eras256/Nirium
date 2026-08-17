import { NextRequest, NextResponse } from 'next/server';
import { agentGet, asAgentNetwork } from '@/lib/agentProxy';

// Bóvedas registradas para esta red. El agente filtra por red del lado suyo
// porque la tabla es compartida entre los dos boxes.
export async function GET(req: NextRequest) {
    try {
        const network = asAgentNetwork(req.nextUrl.searchParams.get('network'));
        const manager = req.nextUrl.searchParams.get('manager');
        const path = manager ? `/api/treasury/vaults?manager=${encodeURIComponent(manager)}` : '/api/treasury/vaults';
        const { status, data } = await agentGet(path, network);
        return NextResponse.json(data, { status });
    } catch (e) {
        return NextResponse.json({ error: e instanceof Error ? e.message : 'proxy error' }, { status: 502 });
    }
}
