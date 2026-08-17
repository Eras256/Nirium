import { NextRequest, NextResponse } from 'next/server';
import { agentPost, asAgentNetwork } from '@/lib/agentProxy';

// Pide al agente que ejecute un rebalanceo. Lo firma ÉL, con su propia llave,
// porque el RebalanceManager es el agente — no el usuario. Por eso aquí no
// vuelve ningún XDR para firmar: vuelve un hash ya confirmado.
//
// En mainnet el box no tiene llave (receive-only) y el agente responde 501
// diciendo por qué. Es una ausencia deliberada, no una falla.
export async function POST(req: NextRequest) {
    try {
        const { walletAddress, vault, instructions, network } = await req.json();
        if (!walletAddress || !vault || !Array.isArray(instructions))
            return NextResponse.json({ error: 'walletAddress, vault and instructions required' }, { status: 400 });

        const { status, data } = await agentPost(
            '/api/treasury/rebalance/execute',
            { vault, instructions },
            walletAddress,
            asAgentNetwork(network),
        );
        return NextResponse.json(data, { status });
    } catch (e) {
        return NextResponse.json({ error: e instanceof Error ? e.message : 'proxy error' }, { status: 502 });
    }
}
