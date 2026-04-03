// ═══════════════════════════════════════════════════════════════
// Nirium Agent — MPP Payment Routes
// ═══════════════════════════════════════════════════════════════
//
// HTTP endpoints protected by MPP (Machine Payments Protocol).
//
// Unlike x402 (which uses an external facilitator), MPP Charge
// verifies Soroban SAC transfers directly on the server —
// no intermediary required.
//
// Charge mode: each request = one on-chain Soroban SAC transfer
// Channel mode: open once, sign off-chain commitments, settle once
//
// Docs: https://developers.stellar.org/docs/build/agentic-payments/mpp
//
// ═══════════════════════════════════════════════════════════════

import { Router } from 'express';
import type { IRouter, Request, Response } from 'express';
import { mppChargeMiddleware, MPP_PRICES } from '../middleware/mpp.js';
import { getRecentSignals } from '../services/subscriptionService.js';
import { getCurrentMarketState } from '../services/autonomousLoop.js';
import { fetchMarketState, NETWORK } from '../providers/stellarProvider.js';
import { routeExecution } from '../execution/router.js';
import { supabase } from '../providers/database.js';

const router: IRouter = Router();

// ─── GET /api/v1/mpp/signals ──────────────────────────────────
//
// Premium arbitrage signals via MPP Charge.
// Cost: 0.01 USDC per request.
// No facilitator — server verifies SAC transfer directly.
//
router.get(
    '/signals',
    mppChargeMiddleware(MPP_PRICES.signals, 'Nirium premium arbitrage signals (MPP)'),
    async (req: Request, res: Response) => {
        const count = Math.min(parseInt(req.query.count as string) || 20, 100);
        const signals = getRecentSignals(count);

        supabase.from('agent_logs').insert([{
            agent_id: 'MPP_GATEWAY',
            message: `[MPP] Signal feed accessed | count=${count}`,
            level: 'info',
            created_at: new Date().toISOString(),
        }]).then(() => {});

        res.json({
            signals: signals.map((s: any) => ({
                ...s,
                executionPath: s.arbitragePath || null,
                estimatedProfit: s.profitBps ? `${(s.profitBps / 100).toFixed(3)}%` : null,
                confidence: s.confidence || 0.85,
                validUntilLedger: s.ledger ? s.ledger + 30 : null,
                source: 'nirium-mpp',
            })),
            meta: {
                count: signals.length,
                network: NETWORK,
                protocol: 'mpp',
                intent: 'charge',
                paidWith: 'USDC/Stellar',
                noFacilitator: true,
                timestamp: new Date().toISOString(),
            },
        });
    },
);

// ─── GET /api/v1/mpp/market ───────────────────────────────────
//
// Enriched market intelligence via MPP Charge.
// Cost: 0.01 USDC per request.
//
router.get(
    '/market',
    mppChargeMiddleware(MPP_PRICES.market, 'Nirium enriched market state (MPP)'),
    async (_req: Request, res: Response) => {
        try {
            const market = getCurrentMarketState() || await fetchMarketState();

            res.json({
                market,
                enriched: {
                    arbitrageWindows: extractArbitrageWindows(market),
                    yieldRanking:     extractYieldRanking(market),
                    feeAlert:         (market as any)?.baseFee > 200 ? 'HIGH_FEE_PRESSURE' : 'NORMAL',
                    recommendation:   buildRecommendation(market),
                },
                meta: {
                    network: NETWORK,
                    protocol: 'mpp',
                    intent: 'charge',
                    noFacilitator: true,
                    timestamp: new Date().toISOString(),
                },
            });
        } catch (error) {
            res.status(500).json({ error: String(error) });
        }
    },
);

// ─── POST /api/v1/mpp/execute ─────────────────────────────────
//
// Strategy execution via MPP Charge.
// Cost: 0.05 USDC per request.
//
router.post(
    '/execute',
    mppChargeMiddleware(MPP_PRICES.execute, 'Nirium strategy execution (MPP)'),
    async (req: Request, res: Response) => {
        const { strategy, asset, params } = req.body;
        if (!strategy || !asset) {
            return res.status(400).json({ error: 'strategy and asset are required' });
        }

        try {
            const result = await routeExecution(strategy, asset, params || {}, () => {});
            res.json({ result, meta: { protocol: 'mpp', intent: 'charge', strategy, asset, network: NETWORK } });
        } catch (error) {
            res.status(500).json({ error: String(error) });
        }
    },
);

// ─── GET /api/v1/mpp/info ─────────────────────────────────────
//
// Free endpoint — returns MPP configuration for this server.
// Clients use this to discover supported intents and pricing.
//
router.get('/info', (_req: Request, res: Response) => {
    res.json({
        protocol: 'mpp',
        version:  '1.0',
        network:  NETWORK,
        intents:  {
            charge: {
                enabled:   !!process.env.MPP_SECRET_KEY,
                routes: {
                    signals: { path: '/api/v1/mpp/signals', price: '0.01 USDC' },
                    market:  { path: '/api/v1/mpp/market',  price: '0.01 USDC' },
                    execute: { path: '/api/v1/mpp/execute', price: '0.05 USDC' },
                },
            },
            channel: {
                enabled:      !!process.env.MPP_CHANNEL_CONTRACT,
                channelContract: process.env.MPP_CHANNEL_CONTRACT || null,
                routes: {
                    stream: { path: '/api/v1/mpp/stream/signals', price: 'variable (off-chain)' },
                },
                docs: 'https://developers.stellar.org/docs/build/agentic-payments/mpp/channel-guide',
            },
        },
        docs: 'https://developers.stellar.org/docs/build/agentic-payments/mpp',
    });
});

// ─── Helpers ──────────────────────────────────────────────────

function extractArbitrageWindows(market: any): any[] {
    return market?.opportunities?.slice(0, 5) || [];
}

function extractYieldRanking(market: any): any[] {
    if (!market?.yieldRates) return [];
    return Object.entries(market.yieldRates)
        .sort(([, a]: any, [, b]: any) => b - a)
        .slice(0, 3)
        .map(([protocol, apy]) => ({ protocol, apy }));
}

function buildRecommendation(market: any): string {
    const fee = (market as any)?.baseFee || 0;
    if (fee > 500) return 'WAIT — High fee pressure';
    if (fee < 100) return 'EXECUTE — Low fees, favorable';
    return 'MONITOR — Normal conditions';
}

export default router;
