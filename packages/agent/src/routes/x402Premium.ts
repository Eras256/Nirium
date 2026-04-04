// ═══════════════════════════════════════════════════════════════
// Nirium Agent — x402 Premium Endpoints
// ═══════════════════════════════════════════════════════════════
//
// These endpoints are protected by the x402 payment middleware.
// Each request requires a valid USDC payment on Stellar.
//
// Accessible by any AI agent with a funded Stellar wallet.
// No API key or account registration required.
//
// ═══════════════════════════════════════════════════════════════

import { Router, Request, Response, IRouter } from 'express';
import { getRecentSignals } from '../services/subscriptionService.js';
import { getCurrentMarketState } from '../services/autonomousLoop.js';
import { fetchMarketState, NETWORK } from '../providers/stellarProvider.js';
import { routeExecution } from '../execution/router.js';
import { logPaymentReceived } from '../middleware/x402.js';
import { supabase } from '../providers/database.js';

const router: IRouter = Router();

// ─── Helper ───────────────────────────────────────────────────
// x402 v2 uses PAYMENT-SIGNATURE header; v1 used X-PAYMENT.
// Extract the payer address from whichever header is present.
function extractPayerAndLog(req: Request, route: string, amount: string): void {
    const raw = (req.headers['payment-signature'] || req.headers['x-payment']) as string | undefined;
    if (!raw) return;
    try {
        const decoded = JSON.parse(Buffer.from(raw, 'base64').toString());
        // v2: decoded.payload.from  |  v1: decoded.payload.from (same field)
        const fromAddress = decoded?.payload?.from || decoded?.accepted?.payTo || 'unknown';
        logPaymentReceived(fromAddress, route, amount).catch(() => {});
    } catch {
        // Non-blocking — log with unknown address anyway
        logPaymentReceived('unknown', route, amount).catch(() => {});
    }
}

// ─── Enriched Signal Feed ─────────────────────────────────────
//
// Returns premium arbitrage signals with full execution parameters.
// Public /api/signals/recent returns limited data; this returns
// confidence scores, execution paths, and entry/exit amounts.
//
router.get('/signals', async (req: Request, res: Response) => {
    const count = Math.min(parseInt(req.query.count as string) || 20, 100);
    const signals = getRecentSignals(count);

    extractPayerAndLog(req, 'GET /api/v1/premium/signals', '0.01');

    supabase.from('agent_logs').insert([{ agent_id: 'X402_GATEWAY', message: `[x402] Premium signal feed accessed | count=${count}`, level: 'info', created_at: new Date().toISOString() }]).then(() => {});

    res.json({
        signals: signals.map((s: any) => ({
            ...s,
            // Premium fields: execution parameters
            executionPath: s.arbitragePath || null,
            estimatedProfit: s.profitBps ? `${(s.profitBps / 100).toFixed(3)}%` : null,
            confidence: s.confidence || 0.85,
            entryAmount: s.amount || null,
            validUntilLedger: s.ledger ? s.ledger + 30 : null, // ~2.5 min window
            source: 'nirium-x402',
        })),
        meta: {
            count: signals.length,
            network: NETWORK,
            protocol: 'x402',
            paidWith: 'USDC/Stellar',
            timestamp: new Date().toISOString(),
        },
    });
});

// ─── Enriched Market State ────────────────────────────────────
//
// Full market intelligence: DEX depth, yield rates, fee pressure,
// arbitrage windows. Enriched vs the free /api/market endpoint.
//
router.get('/market', async (req: Request, res: Response) => {
    extractPayerAndLog(req, 'GET /api/v1/premium/market', '0.01');
    try {
        const market = getCurrentMarketState() || await fetchMarketState();

        supabase.from('agent_logs').insert([{ agent_id: 'X402_GATEWAY', message: '[x402] Premium market state accessed', level: 'info', created_at: new Date().toISOString() }]).then(() => {});

        res.json({
            market,
            enriched: {
                arbitrageWindows: extractArbitrageWindows(market),
                yieldRanking: extractYieldRanking(market),
                feeAlert: (market as any)?.baseFee > 200 ? 'HIGH_FEE_PRESSURE' : 'NORMAL',
                recommendation: buildRecommendation(market),
            },
            meta: {
                network: NETWORK,
                protocol: 'x402',
                timestamp: new Date().toISOString(),
            },
        });
    } catch (error) {
        res.status(500).json({ error: String(error) });
    }
});

// ─── Pay-per-execute ─────────────────────────────────────────
//
// Strategy execution behind x402. No Nirium account required.
// External agents pay $0.05 USDC per execution.
//
router.post('/execute', async (req: Request, res: Response) => {
    const { strategy, asset, params } = req.body;

    if (!strategy || !asset) {
        return res.status(400).json({ error: 'strategy and asset are required' });
    }

    extractPayerAndLog(req, 'POST /api/v1/premium/execute', '0.05');

    try {
        const result = await routeExecution(strategy, asset, params || {}, () => {});
        supabase.from('agent_logs').insert([{ agent_id: 'X402_GATEWAY', message: `[x402] Pay-per-execute | strategy=${strategy} | asset=${asset}`, level: 'info', created_at: new Date().toISOString() }]).then(() => {});
        res.json({ result, meta: { protocol: 'x402', strategy, asset, network: NETWORK } });
    } catch (error) {
        res.status(500).json({ error: String(error) });
    }
});

// ─── Helpers ──────────────────────────────────────────────────

function extractArbitrageWindows(market: any): any[] {
    if (!market) return [];
    return market.opportunities?.slice(0, 5) || [];
}

function extractYieldRanking(market: any): any[] {
    if (!market?.yieldRates) return [];
    return Object.entries(market.yieldRates)
        .sort(([, a]: any, [, b]: any) => b - a)
        .slice(0, 3)
        .map(([protocol, apy]) => ({ protocol, apy }));
}

function buildRecommendation(market: any): string {
    if (!market) return 'HOLD — Market data unavailable';
    const baseFee = (market as any)?.baseFee || 0;
    if (baseFee > 500) return 'WAIT — High fee pressure, avoid low-margin ops';
    if (baseFee < 100) return 'EXECUTE — Low fees, favorable for arbitrage';
    return 'MONITOR — Normal conditions';
}

export default router;
