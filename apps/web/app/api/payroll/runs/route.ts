import { NextRequest, NextResponse } from 'next/server';
import { agentGet, asAgentNetwork } from '@/lib/agentProxy';

export const dynamic = 'force-dynamic';

// Recent settled runs (each with tx hash + IPFS receipt CID). Public on the agent.
export async function GET(req: NextRequest) {
    try {
        const net = asAgentNetwork(req.nextUrl.searchParams.get('network'));
        const { status, data } = await agentGet('/api/payroll/runs', net);
        // Cinturón extra: ambos boxes comparten la tabla payroll_runs — filtrar
        // aquí también por si el agente aún no filtra por red.
        if (Array.isArray(data?.runs)) data.runs = data.runs.filter((r: any) => !r.network || r.network === net);
        return NextResponse.json(data, { status });
    } catch (e) {
        return NextResponse.json({ runs: [], error: e instanceof Error ? e.message : 'proxy error' }, { status: 200 });
    }
}
