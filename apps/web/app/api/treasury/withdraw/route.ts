import { NextRequest, NextResponse } from 'next/server';
import { agentPost, asAgentNetwork } from '@/lib/agentProxy';

// Saca fondos de la bóveda hacia la wallet del dueño. Devuelve XDR SIN firmar
// porque lo firma quien tiene las participaciones — el agente no puede llamar
// esto ni queriendo: el rol de RebalanceManager no lo autoriza, y ese es todo
// el argumento del nodo.
export async function POST(req: NextRequest) {
    try {
        const { walletAddress, vault, shares, network } = await req.json();
        if (!walletAddress || !vault)
            return NextResponse.json({ error: 'walletAddress and vault required' }, { status: 400 });

        const { status, data } = await agentPost(
            '/api/treasury/withdraw',
            // Sin `shares` el nodo retira todo, que es lo que se quiere casi siempre.
            { vault, from: walletAddress, ...(shares ? { shares: String(shares) } : {}) },
            walletAddress,
            asAgentNetwork(network),
        );
        return NextResponse.json(data, { status });
    } catch (e) {
        return NextResponse.json({ error: e instanceof Error ? e.message : 'proxy error' }, { status: 502 });
    }
}
