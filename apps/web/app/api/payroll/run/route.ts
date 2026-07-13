import { NextRequest, NextResponse } from 'next/server';
import { agentPost, asAgentNetwork } from '@/lib/agentProxy';

// Build (unsigned) a payroll run. The company signs the returned XDR in-browser.
export async function POST(req: NextRequest) {
    try {
        const { walletAddress, recipients, asset, memo, network, acknowledgeTerms, clientInfo } = await req.json();
        if (!walletAddress) return NextResponse.json({ error: 'walletAddress required' }, { status: 400 });
        // The connected wallet IS the treasury/source, so its Freighter signature is valid.
        // acknowledgeTerms viaja tal cual — el agente responde 403 sin aceptación (blindaje legal).
        // clientInfo viaja tal cual — el agente exige { legalName, taxId, repName } en mainnet
        // (403 sin ella), preparación adelantada de cara a LFPIORPI fracc. XVI (17-ene-2027).
        const { status, data } = await agentPost('/api/payroll/run', { recipients, asset, memo, treasury: walletAddress, acknowledgeTerms, clientInfo }, walletAddress, asAgentNetwork(network));
        return NextResponse.json(data, { status });
    } catch (e) {
        return NextResponse.json({ error: e instanceof Error ? e.message : 'proxy error' }, { status: 502 });
    }
}
