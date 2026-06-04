import { NextResponse } from 'next/server';

const AGENT_URL = process.env.AGENT_INTERNAL_URL ?? 'https://nirium-agent.fly.dev';

const FALLBACK = {
    cetesRate: 5.78,
    xlmPrice: 0.1732,
    baseFee: 100,
    sdexSpread: 0.84,
    pathPaymentRoutes: [],
};

export async function GET() {
    try {
        const res = await fetch(`${AGENT_URL}/api/tickers`, {
            next: { revalidate: 30 },
        });

        if (!res.ok) throw new Error(`Agent responded ${res.status}`);

        const data = await res.json();
        const m = data.market ?? {};

        return NextResponse.json({
            cetesRate: m.cetesRate ?? m.cetesApy ?? FALLBACK.cetesRate,
            xlmPrice: m.xlmPrice ?? FALLBACK.xlmPrice,
            baseFee: m.baseFee ?? FALLBACK.baseFee,
            sdexSpread: m.sdexSpread ?? FALLBACK.sdexSpread,
            pathPaymentRoutes: data.pathPaymentRoutes ?? FALLBACK.pathPaymentRoutes,
        });
    } catch {
        return NextResponse.json(FALLBACK);
    }
}
