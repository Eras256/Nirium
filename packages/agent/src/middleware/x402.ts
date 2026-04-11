// ═══════════════════════════════════════════════════════════════
// Nirium Agent — x402 Payment Middleware
// ═══════════════════════════════════════════════════════════════
//
// Protects premium API endpoints with per-request USDC payments
// using the x402 HTTP payment protocol on Stellar/Soroban.
//
// Protocol flow:
//   1. AI agent requests /api/v1/premium/*
//   2. Server returns HTTP 402 with payment requirements
//   3. Agent signs Soroban auth entry (0.01 USDC)
//   4. Facilitator (x402.org) verifies + settles on-chain
//   5. Agent retries with X-PAYMENT header → 200 OK
//
// Facilitator: https://www.x402.org/facilitator (testnet sponsored)
// Network:     stellar:testnet / stellar:pubnet
//
// ═══════════════════════════════════════════════════════════════

import { paymentMiddlewareFromConfig } from '@x402/express';
import { HTTPFacilitatorClient } from '@x402/core/server';
import { ExactStellarScheme } from '@x402/stellar/exact/server';
import type { SchemeRegistration } from '@x402/express';
import { supabase } from '../providers/database.js';

// ─── Configuration ────────────────────────────────────────────

const FACILITATOR_URL = process.env.X402_FACILITATOR_URL || 'https://www.x402.org/facilitator';

const NETWORK = (process.env.STELLAR_NETWORK === 'mainnet'
    ? 'stellar:pubnet'
    : 'stellar:testnet') as 'stellar:testnet' | 'stellar:pubnet';

const PAY_TO = process.env.X402_PAY_TO_ADDRESS || '';

const facilitatorClient = new HTTPFacilitatorClient({ url: FACILITATOR_URL });

const schemes: SchemeRegistration[] = [
    { network: NETWORK, server: new ExactStellarScheme() },
];

// ─── Route price table ────────────────────────────────────────
//
// Prices in USD (paid in USDC on Stellar):
//   premium signals  → $0.01 per call  (arbitrage opportunities)
//   premium market   → $0.01 per call  (enriched market state)
//   premium execute  → $0.05 per call  (strategy execution)
//
// NOTE: paths are sub-paths relative to the /api/v1/premium mount point,
// because x402Middleware is mounted via app.use('/api/v1/premium', ...).
// Express strips the prefix, so req.path inside the middleware is /signals, /market, etc.
const PREMIUM_ROUTES = {
    'GET /signals': {
        accepts: {
            scheme: 'exact' as const,
            price: '$0.01',
            network: NETWORK,
            payTo: PAY_TO,
            description: 'Nirium premium arbitrage signals (x402)',
        },
    },
    'GET /market': {
        accepts: {
            scheme: 'exact' as const,
            price: '$0.01',
            network: NETWORK,
            payTo: PAY_TO,
            description: 'Nirium enriched market state (x402)',
        },
    },
    'POST /execute': {
        accepts: {
            scheme: 'exact' as const,
            price: '$0.05',
            network: NETWORK,
            payTo: PAY_TO,
            description: 'Nirium strategy execution via x402',
        },
    },
};

// ─── Export middleware ─────────────────────────────────────────
// If X402_PAY_TO_ADDRESS is not configured, the payment middleware
// cannot initialize (payTo is required). We fall back to a pass-through
// so premium routes remain accessible and log a startup warning.

import type { Request, Response, NextFunction } from 'express';

let _x402Middleware: ReturnType<typeof paymentMiddlewareFromConfig> | ((req: Request, res: Response, next: NextFunction) => void);

if (!PAY_TO) {
    console.warn('[x402] ⚠️  X402_PAY_TO_ADDRESS not set — premium routes open (no payment required). Set this env var to enable monetization.');
    _x402Middleware = (_req: Request, _res: Response, next: NextFunction) => next();
} else {
    try {
        _x402Middleware = paymentMiddlewareFromConfig(
            PREMIUM_ROUTES,
            facilitatorClient,
            schemes,
            {
                appName: 'Nirium Protocol',
                appLogo: 'https://nirium.xyz/favicon.ico',
                testnet: NETWORK === 'stellar:testnet',
            },
        );
        console.log(`[x402] ✅ Payment middleware active | payTo: ${PAY_TO.slice(0, 8)}… | network: ${NETWORK}`);
    } catch (err) {
        console.error('[x402] ❌ Failed to initialize payment middleware:', err);
        _x402Middleware = (_req: Request, _res: Response, next: NextFunction) => next();
    }
}

export const x402Middleware = _x402Middleware;

// ─── Payment receipt logger ────────────────────────────────────
//
// Inserts an x402 payment event into agent_logs (level='payment').
// Called from premium route handlers — non-blocking.
//
export async function logPaymentReceived(
    fromAddress: string,
    route: string,
    amountUsdc: string,
    txHash?: string,
): Promise<void> {
    try {
        await supabase.from('agent_logs').insert([{
            agent_id: 'X402_GATEWAY',
            message: `x402 payment received | from=${fromAddress} | route=${route} | amount=${amountUsdc} USDC | tx=${txHash || 'pending'}`,
            level: 'payment',
            created_at: new Date().toISOString(),
        }]);
    } catch {
        // Non-blocking — never fail a request due to logging
    }
}
