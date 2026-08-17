import { NextRequest, NextResponse } from 'next/server';
import { agentGet, asAgentNetwork } from '@/lib/agentProxy';

// Lectura de una bóveda: roles, activos y fondos administrados.
// Es la comprobación que sostiene todo el argumento — cualquiera puede ver
// que el Manager es el cliente y que Nirium solo tiene el rol de rebalanceo.
export async function GET(req: NextRequest) {
    try {
        const vault = req.nextUrl.searchParams.get('vault');
        if (!vault) return NextResponse.json({ error: 'vault required' }, { status: 400 });
        const network = asAgentNetwork(req.nextUrl.searchParams.get('network'));
        // `holder` opcional: devuelve tu saldo del activo de la bóveda, para
        // poder avisar "no tienes este token" antes de que alguien firme.
        const holder = req.nextUrl.searchParams.get('holder');
        const path = `/api/treasury/vault/${encodeURIComponent(vault)}${holder ? `?holder=${encodeURIComponent(holder)}` : ''}`;
        const { status, data } = await agentGet(path, network);
        return NextResponse.json(data, { status });
    } catch (e) {
        return NextResponse.json({ error: e instanceof Error ? e.message : 'proxy error' }, { status: 502 });
    }
}
