import { NextRequest, NextResponse } from 'next/server';
import { agentPost, asAgentNetwork } from '@/lib/agentProxy';

// Broadcast the company-signed payroll XDR + anchor the IPFS receipt.
export async function POST(req: NextRequest) {
    try {
        const { walletAddress, runId, signedXdr, network } = await req.json();
        if (!walletAddress || !runId || !signedXdr)
            return NextResponse.json({ error: 'walletAddress, runId and signedXdr required' }, { status: 400 });
        const { status, data } = await agentPost('/api/payroll/submit', { runId, signedXdr }, walletAddress, asAgentNetwork(network));
        return NextResponse.json(data, { status });
    } catch (e) {
        return NextResponse.json({ error: e instanceof Error ? e.message : 'proxy error' }, { status: 502 });
    }
}
