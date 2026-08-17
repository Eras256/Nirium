import { NextRequest, NextResponse } from 'next/server';
import { agentPost, asAgentNetwork } from '@/lib/agentProxy';

// Arma el XDR SIN firmar del depósito. El dinero es del cliente y lo firma el
// cliente: Nirium no participa — el depósito ni siquiera toca el rol de
// RebalanceManager.
export async function POST(req: NextRequest) {
    try {
        const { walletAddress, vault, amounts, invest, network } = await req.json();
        if (!walletAddress || !vault || !Array.isArray(amounts))
            return NextResponse.json({ error: 'walletAddress, vault and amounts required' }, { status: 400 });

        const { status, data } = await agentPost(
            '/api/treasury/deposit',
            { vault, from: walletAddress, amounts, invest },
            walletAddress,
            asAgentNetwork(network),
        );
        return NextResponse.json(data, { status });
    } catch (e) {
        return NextResponse.json({ error: e instanceof Error ? e.message : 'proxy error' }, { status: 502 });
    }
}
