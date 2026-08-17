import { NextRequest, NextResponse } from 'next/server';
import { agentPost, asAgentNetwork } from '@/lib/agentProxy';

// Arma el XDR SIN firmar para desplegar la bóveda. El cliente la firma con su
// propia wallet: por eso `manager` viaja explícito y nunca se deriva de nada
// nuestro. Ninguna llave de Nirium participa en este paso.
export async function POST(req: NextRequest) {
    try {
        const { walletAddress, network, ...body } = await req.json();
        if (!walletAddress) return NextResponse.json({ error: 'walletAddress required' }, { status: 400 });

        const { status, data } = await agentPost(
            '/api/treasury/deploy',
            // El firmante es también el Manager por default: quien paga el
            // despliegue desde esta consola es el dueño de la bóveda.
            { caller: walletAddress, manager: walletAddress, ...body },
            walletAddress,
            asAgentNetwork(network),
        );
        return NextResponse.json(data, { status });
    } catch (e) {
        return NextResponse.json({ error: e instanceof Error ? e.message : 'proxy error' }, { status: 502 });
    }
}
