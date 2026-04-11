#!/usr/bin/env tsx
// ═══════════════════════════════════════════════════════════════
// Nirium — MPP Buyer Agent
// ═══════════════════════════════════════════════════════════════
//
// Demonstrates the full MPP (Machine Payments Protocol) charge flow:
//   1. Call /api/v1/mpp/* → receive 402 + challenge
//   2. Sign a Soroban USDC transfer on Stellar testnet
//   3. Server verifies + settles — receive 200 + data
//
// Unlike x402, MPP uses no external facilitator — the server
// verifies the Soroban SAC transfer directly.
//
// Usage:
//   BUYER_SECRET_KEY=S... pnpm mpp:buy
//   or without secret → generates + funds a new wallet
//
// ═══════════════════════════════════════════════════════════════

import dotenv from 'dotenv';
dotenv.config();

import { Keypair, Asset, Operation, TransactionBuilder, BASE_FEE, Networks } from '@stellar/stellar-sdk';
import { Mppx } from 'mppx/client';
import { stellar } from '@stellar/mpp/charge/client';
import { getHorizonClient } from '@x402/stellar';
import axios from 'axios';

const NIRIUM_BASE = process.env.NIRIUM_API_URL || 'https://api.nirium.xyz';
const USDC_ISSUER = 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5';
const USDC_ASSET  = new Asset('USDC', USDC_ISSUER);

const COLOR = {
    reset:  '\x1b[0m',
    teal:   '\x1b[36m',
    green:  '\x1b[32m',
    yellow: '\x1b[33m',
    red:    '\x1b[31m',
    dim:    '\x1b[2m',
    bold:   '\x1b[1m',
};

function log(label: string, color: string, msg: string) {
    const ts = new Date().toISOString().slice(11, 19);
    console.log(`${COLOR.dim}[${ts}]${COLOR.reset} ${color}[${label}]${COLOR.reset} ${msg}`);
}

// ─── Wallet Setup ─────────────────────────────────────────────

async function setupWallet(): Promise<Keypair> {
    const secretKey = process.env.BUYER_SECRET_KEY;
    if (secretKey) {
        const kp = Keypair.fromSecret(secretKey);
        log('WALLET', COLOR.teal, `Using wallet: ${kp.publicKey().slice(0, 8)}...`);
        return kp;
    }

    const kp = Keypair.random();
    log('WALLET', COLOR.yellow, `New wallet: ${kp.publicKey()}`);
    log('WALLET', COLOR.yellow, `Secret: ${kp.secret()}`);

    log('FUND', COLOR.teal, 'Requesting XLM from Friendbot...');
    await axios.get(`https://friendbot.stellar.org?addr=${kp.publicKey()}`);
    log('FUND', COLOR.green, '✅ Funded with 10,000 XLM');

    const horizon = getHorizonClient('stellar:testnet');
    const account = await horizon.loadAccount(kp.publicKey());
    const tx = new TransactionBuilder(account, { fee: BASE_FEE, networkPassphrase: Networks.TESTNET })
        .addOperation(Operation.changeTrust({ asset: USDC_ASSET }))
        .setTimeout(30)
        .build();
    tx.sign(kp);
    await horizon.submitTransaction(tx);
    log('FUND', COLOR.green, '✅ USDC trustline created');
    log('FUND', COLOR.yellow, `Wallet: ${kp.publicKey()} — fund with USDC to proceed`);
    return kp;
}

// ─── Ensure USDC balance ──────────────────────────────────────

async function ensureUsdc(keypair: Keypair): Promise<void> {
    const horizon = getHorizonClient('stellar:testnet');
    const account = await horizon.loadAccount(keypair.publicKey());
    const balances = account.balances as any[];
    const usdc = balances.find(b => b.asset_code === 'USDC' && b.asset_issuer === USDC_ISSUER);
    const xlm  = balances.find(b => b.asset_type === 'native');
    log('BALANCE', COLOR.teal, `XLM: ${xlm?.balance} | USDC: ${usdc?.balance ?? 'no trustline'}`);

    if (!usdc || parseFloat(usdc.balance) < 0.01) {
        // Try swapping XLM → USDC via testnet DEX
        log('SWAP', COLOR.teal, 'Insufficient USDC — swapping XLM → 2 USDC via testnet DEX...');
        try {
            const acc2 = await horizon.loadAccount(keypair.publicKey());
            const swapTx = new TransactionBuilder(acc2, { fee: BASE_FEE, networkPassphrase: Networks.TESTNET })
                .addOperation(Operation.pathPaymentStrictReceive({
                    sendAsset: Asset.native(),
                    sendMax: '50',
                    destination: keypair.publicKey(),
                    destAsset: USDC_ASSET,
                    destAmount: '2',
                    path: [],
                }))
                .setTimeout(30)
                .build();
            swapTx.sign(keypair);
            await horizon.submitTransaction(swapTx);
            log('SWAP', COLOR.green, '✅ Got 2 USDC from DEX');
        } catch (e: any) {
            log('SWAP', COLOR.red, `❌ DEX swap failed: ${e.message?.slice(0, 80)}`);
            log('SWAP', COLOR.yellow, `Fund manually: ${keypair.publicKey()}`);
            process.exit(1);
        }
    }
}

// ─── MPP fetch wrapper ────────────────────────────────────────

async function fetchWithMpp(mppFetch: typeof fetch, url: string, method: 'GET' | 'POST' = 'GET', body?: unknown): Promise<unknown> {
    const endpoint = `${NIRIUM_BASE}${url}`;
    log('MPP', COLOR.teal, `${method} ${url}`);

    const res = await mppFetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        ...(body ? { body: JSON.stringify(body) } : {}),
    });

    if (res.status === 200) {
        log('MPP', COLOR.green, `✅ 200 OK — payment verified!`);
        return await res.json();
    }

    if (res.status === 402) {
        log('MPP', COLOR.yellow, `← 402 (mppx should have auto-handled this — check config)`);
        const text = await res.text();
        throw new Error(`Still 402 after mppx: ${text.slice(0, 200)}`);
    }

    throw new Error(`Unexpected ${res.status}: ${await res.text().then(t => t.slice(0, 100))}`);
}

// ─── Main ─────────────────────────────────────────────────────

async function main() {
    console.log(`\n${COLOR.bold}${COLOR.teal}═══ Nirium MPP Buyer Agent ═══${COLOR.reset}\n`);

    const keypair = await setupWallet();
    await ensureUsdc(keypair);

    // Create mppx client with Stellar charge method
    // mppx intercepts 402 responses, signs the Soroban SAC transfer, and retries automatically
    log('MPP', COLOR.teal, 'Initializing MPP client with Stellar charge method...');
    const mppClient = Mppx.create({
        methods: [
            stellar.charge({
                keypair,
                // 'pull' mode: client signs, server broadcasts (server-sponsored fees)
                mode: 'pull',
            }),
        ],
        polyfill: false, // don't touch globalThis.fetch
    });
    log('MPP', COLOR.green, `✅ MPP client ready | wallet: ${keypair.publicKey().slice(0, 8)}...`);

    // ─ Buy Signals ─────────────────────────────────────────────
    console.log(`\n${COLOR.bold}[ MPP Signals — $0.01 USDC ]${COLOR.reset}`);
    try {
        const signals = await fetchWithMpp(mppClient.fetch as typeof fetch, '/api/v1/mpp/signals?count=5') as any;
        log('SIGNALS', COLOR.green, `Got ${signals?.signals?.length ?? 0} signals`);
        if (signals?.signals?.length) {
            signals.signals.slice(0, 3).forEach((s: any, i: number) => {
                console.log(`   [${i+1}] confidence=${s.confidence?.toFixed(2) ?? 'N/A'} profit=${s.estimatedProfit ?? 'N/A'}`);
            });
        }
        console.log(`   meta: network=${signals?.meta?.network} protocol=${signals?.meta?.protocol}`);
    } catch (err: any) {
        log('SIGNALS', COLOR.red, `❌ ${err.message}`);
    }

    // ─ Buy Market State ────────────────────────────────────────
    console.log(`\n${COLOR.bold}[ MPP Market — $0.01 USDC ]${COLOR.reset}`);
    try {
        const market = await fetchWithMpp(mppClient.fetch as typeof fetch, '/api/v1/mpp/market') as any;
        log('MARKET', COLOR.green, `recommendation=${market?.enriched?.recommendation ?? 'N/A'} feeAlert=${market?.enriched?.feeAlert ?? 'N/A'}`);
    } catch (err: any) {
        log('MARKET', COLOR.red, `❌ ${err.message}`);
    }

    console.log(`\n${COLOR.bold}${COLOR.green}═══ Done ═══${COLOR.reset}\n`);
}

main().catch(err => {
    log('ERROR', COLOR.red, err.message);
    process.exit(1);
});
