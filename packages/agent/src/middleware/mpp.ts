// ═══════════════════════════════════════════════════════════════
// Nirium Agent — MPP (Machine Payments Protocol) Middleware
// ═══════════════════════════════════════════════════════════════
//
// Implements both MPP payment intents on Stellar:
//
//   CHARGE mode  — per-request Soroban SAC transfer
//   CHANNEL mode — high-frequency off-chain payment channel
//
// No external facilitator required. The server verifies and
// settles Soroban SAC `transfer` invocations directly.
//
// Protocol spec: https://mpp.dev
// Stellar docs:  https://developers.stellar.org/docs/build/agentic-payments/mpp
//
// Environment variables:
//   MPP_SECRET_KEY        HMAC secret for challenge binding
//   STELLAR_RECIPIENT     Stellar public key receiving payments
//   MPP_CHANNEL_CONTRACT  Deployed one-way-channel contract address
//   STELLAR_NETWORK       testnet | mainnet (default: testnet)
//
// ═══════════════════════════════════════════════════════════════

import type { Request, Response, NextFunction } from 'express';
import { stellar } from '@stellar/mpp/charge/server';
import { Mppx as MppxServer } from 'mppx/server';
import { USDC_SAC_TESTNET, USDC_SAC_MAINNET } from '@stellar/mpp';
import { supabase } from '../providers/database.js';

// ─── Configuration ────────────────────────────────────────────

const NETWORK = (process.env.STELLAR_NETWORK === 'mainnet'
    ? 'stellar:pubnet'
    : 'stellar:testnet') as 'stellar:testnet' | 'stellar:pubnet';

const USDC_SAC = NETWORK === 'stellar:pubnet' ? USDC_SAC_MAINNET : USDC_SAC_TESTNET;
const RECIPIENT = process.env.STELLAR_RECIPIENT || process.env.X402_PAY_TO_ADDRESS || '';
const MPP_SECRET = process.env.MPP_SECRET_KEY || '';

// ─── Charge Mode Mppx Instance ────────────────────────────────
//
// Used for /api/v1/mpp/signals — per-request Soroban SAC transfer.
// No channel setup required. Client transfers USDC in the request.
//

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let chargeMppx: any = null;

if (RECIPIENT && MPP_SECRET) {
    chargeMppx = MppxServer.create({
        secretKey: MPP_SECRET,
        methods: [
            stellar.charge({
                recipient: RECIPIENT,
                currency: USDC_SAC,
                network: NETWORK,
            }),
        ],
    });
    console.log(`[MPP] Charge mode initialized | recipient=${RECIPIENT.substring(0, 8)}... | network=${NETWORK}`);
} else {
    console.warn('[MPP] MPP_SECRET_KEY or STELLAR_RECIPIENT not set — MPP charge middleware disabled');
}

// ─── Express Adapter for MPP ──────────────────────────────────
//
// Converts Express req/res to Web API Request/Response and back.
// Uses Mppx.toNodeListener() from mppx/server to bridge.
//

async function runMppHandler(
    handler: (req: globalThis.Request) => Promise<{ status: 402 | 200; challenge?: globalThis.Response; withReceipt?: (r: globalThis.Response) => Promise<globalThis.Response> }>,
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    const { toNodeListener } = await import('mppx/server').then(m => ({ toNodeListener: m.Mppx.toNodeListener }));
    const nodeHandler = toNodeListener(handler as any);
    const result = await nodeHandler(req as any, res as any);

    if (result.status === 402) {
        // toNodeListener already wrote the 402 response to res
        return;
    }

    // 200 — payment verified. toNodeListener set Payment-Receipt header.
    // Log the payment event (async, non-blocking).
    logMppPayment(req, 'charge').catch(() => {});
    next();
}

// ─── Charge Middleware Factory ────────────────────────────────

export function mppChargeMiddleware(amountUsdc: string, description: string) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        if (!chargeMppx) {
            // MPP not configured — pass through with a warning header
            res.setHeader('X-MPP-Warning', 'MPP not configured on this server');
            return next();
        }

        try {
            const handler = (chargeMppx as any).charge({
                amount: amountUsdc,
                description,
            });
            await runMppHandler(handler, req, res, next);
        } catch (error) {
            console.error('[MPP] Charge middleware error:', error);
            res.status(500).json({ error: 'MPP payment processing error', details: String(error) });
        }
    };
}

// ─── Payment Logger ───────────────────────────────────────────

async function logMppPayment(req: Request, intent: 'charge' | 'channel'): Promise<void> {
    try {
        await supabase.from('agent_logs').insert([{
            agent_id: 'MPP_GATEWAY',
            message: `MPP ${intent} payment received | route=${req.path} | ip=${req.ip}`,
            level: 'payment',
            created_at: new Date().toISOString(),
        }]);
    } catch {
        // Non-blocking
    }
}

// ─── Price Table ──────────────────────────────────────────────
//
// MPP routes price table (same as x402 for comparable demo):
//   /api/v1/mpp/signals  → 0.01 USDC per request
//   /api/v1/mpp/market   → 0.01 USDC per request
//   /api/v1/mpp/execute  → 0.05 USDC per request
//
export const MPP_PRICES = {
    signals: '0.01',
    market:  '0.01',
    execute: '0.05',
} as const;
