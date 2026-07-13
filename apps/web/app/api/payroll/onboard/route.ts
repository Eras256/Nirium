import { NextRequest, NextResponse } from 'next/server';
import { agentPost, asAgentNetwork } from '@/lib/agentProxy';

// Build a treasury-sponsored USDC trustline for a new employee (sponsored reserves).
export async function POST(req: NextRequest) {
    try {
        const { walletAddress, employee, asset, limit, network } = await req.json();
        if (!walletAddress || !employee)
            return NextResponse.json({ error: 'walletAddress and employee required' }, { status: 400 });
        // Connected wallet = the sponsoring treasury.
        const { status, data } = await agentPost('/api/payroll/onboard', { employee, asset, limit, sponsor: walletAddress }, walletAddress, asAgentNetwork(network));
        return NextResponse.json(data, { status });
    } catch (e) {
        return NextResponse.json({ error: e instanceof Error ? e.message : 'proxy error' }, { status: 502 });
    }
}
