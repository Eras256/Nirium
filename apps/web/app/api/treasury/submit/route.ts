import { NextRequest, NextResponse } from 'next/server';
import { agentPost, asAgentNetwork } from '@/lib/agentProxy';

// Transmite un XDR ya firmado por la wallet del cliente. El agente espera la
// confirmación antes de responder, así que el hash que llega aquí siempre
// resuelve en el explorador.
export async function POST(req: NextRequest) {
    try {
        const { walletAddress, signedXdr, network } = await req.json();
        if (!walletAddress || !signedXdr)
            return NextResponse.json({ error: 'walletAddress and signedXdr required' }, { status: 400 });

        const { status, data } = await agentPost(
            '/api/treasury/submit',
            { xdr: signedXdr },
            walletAddress,
            asAgentNetwork(network),
        );
        return NextResponse.json(data, { status });
    } catch (e) {
        return NextResponse.json({ error: e instanceof Error ? e.message : 'proxy error' }, { status: 502 });
    }
}
