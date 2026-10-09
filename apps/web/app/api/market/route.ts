import { NextResponse } from 'next/server';

const AGENT_URL = process.env.AGENT_INTERNAL_URL ?? 'https://nirium-agent.fly.dev';

// Sin dato no se inventa uno. xlmPrice (0.1732) y sdexSpread (0.84) eran
// snapshots fijos de hace meses que se servían como si fueran la lectura
// en vivo cada vez que el agente no respondía — exactamente el mismo
// problema que la tasa de CETES, pero sin ni siquiera decir que eran fijos.
// `cetesRate` sí sigue siendo un valor real (aunque fijo, ver
// services/referenceRates.ts del agente) y `baseFee` 100 es el mínimo real
// del protocolo de Stellar (no una lectura de mercado), así que ninguno de
// los dos es un dato fabricado.
const CETES_FIXED_RATE = 5.57;
const CETES_FIXED_REF = { kind: 'fixed' as const, asOf: '2026-06', source: 'app.etherfuse.com/b/cetes' };
const STELLAR_MIN_BASE_FEE = 100;

const DOWN = {
    cetesRate: CETES_FIXED_RATE,
    cetesRateRef: CETES_FIXED_REF,
    xlmPrice: null,
    baseFee: STELLAR_MIN_BASE_FEE,
    sdexSpread: null,
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
            cetesRate: m.cetesRate ?? m.cetesApy ?? CETES_FIXED_RATE,
            cetesRateRef: m.cetesRateRef ?? CETES_FIXED_REF,
            xlmPrice: m.xlmPrice ?? null,
            baseFee: m.baseFee ?? STELLAR_MIN_BASE_FEE,
            sdexSpread: m.sdexSpread ?? null,
            pathPaymentRoutes: data.pathPaymentRoutes ?? [],
        });
    } catch {
        return NextResponse.json(DOWN);
    }
}
