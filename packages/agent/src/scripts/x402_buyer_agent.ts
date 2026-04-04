#!/usr/bin/env tsx
// ═══════════════════════════════════════════════════════════════
// Nirium — x402 Buyer Agent
// ═══════════════════════════════════════════════════════════════
//
// Demonstrates the full x402 payment flow:
//   1. Call /api/v1/premium/* → receive 402 Payment Required
//   2. Sign a Soroban USDC transfer on Stellar testnet
//   3. Retry with PAYMENT-SIGNATURE header → receive 200 + data
//
// Usage:
//   BUYER_SECRET_KEY=SXXX... tsx src/scripts/x402_buyer_agent.ts
//   or just run it — it will generate & fund a new testnet wallet
//
// ═══════════════════════════════════════════════════════════════

import dotenv from 'dotenv';
dotenv.config();

import { x402Client } from '@x402/core/client';
import {
    x402HTTPClient,
    decodePaymentRequiredHeader,
    encodePaymentSignatureHeader,
} from '@x402/core/http';
import {
    createEd25519Signer,
    ExactStellarScheme,
    STELLAR_TESTNET_CAIP2,
    USDC_TESTNET_ADDRESS,
    getHorizonClient,
} from '@x402/stellar';
import { Keypair, Asset, Operation, TransactionBuilder, BASE_FEE, Networks } from '@stellar/stellar-sdk';
import axios from 'axios';

const NIRIUM_BASE = process.env.NIRIUM_API_URL || 'https://api.nirium.xyz';
const NETWORK = STELLAR_TESTNET_CAIP2; // stellar:testnet

const USDC_ISSUER = 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5';
const USDC_ASSET = new Asset('USDC', USDC_ISSUER);

const COLOR = {
    reset: '\x1b[0m',
    teal: '\x1b[36m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    dim: '\x1b[2m',
    bold: '\x1b[1m',
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
        log('WALLET', COLOR.teal, `Using provided wallet: ${kp.publicKey().slice(0, 8)}...`);
        return kp;
    }

    // Generate fresh testnet wallet
    const kp = Keypair.random();
    log('WALLET', COLOR.yellow, `Generated new wallet: ${kp.publicKey()}`);
    log('WALLET', COLOR.yellow, `Secret (save this!): ${kp.secret()}`);

    // Fund with XLM via Friendbot
    log('FUND', COLOR.teal, 'Requesting XLM from Friendbot...');
    await axios.get(`https://friendbot.stellar.org?addr=${kp.publicKey()}`);
    log('FUND', COLOR.green, '✅ Funded with 10,000 XLM');

    // Set up USDC trustline
    const horizon = getHorizonClient(NETWORK);
    const account = await horizon.loadAccount(kp.publicKey());
    const tx = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET,
    })
        .addOperation(Operation.changeTrust({ asset: USDC_ASSET }))
        .setTimeout(30)
        .build();
    tx.sign(kp);
    await horizon.submitTransaction(tx);
    log('FUND', COLOR.green, '✅ USDC trustline created');
    log('FUND', COLOR.yellow, `⚠️  Fund this wallet with USDC: ${kp.publicKey()}`);
    log('FUND', COLOR.yellow, '   Use Circle testnet faucet or transfer from another account');

    return kp;
}

// ─── x402 Client Setup ────────────────────────────────────────

function createX402Client(keypair: Keypair) {
    const signer = createEd25519Signer(keypair.secret(), NETWORK);
    const scheme = new ExactStellarScheme(signer);

    const client = x402Client.fromConfig({
        schemes: [{ network: NETWORK, client: scheme }],
    });

    const httpClient = new x402HTTPClient(client);
    return httpClient;
}

// ─── Pay-and-Fetch ────────────────────────────────────────────

async function fetchWithX402(
    httpClient: x402HTTPClient,
    url: string,
    method: 'GET' | 'POST' = 'GET',
    body?: unknown
): Promise<unknown> {
    const endpoint = `${NIRIUM_BASE}${url}`;
    log('x402', COLOR.teal, `${method} ${url}`);

    // Step 1: Initial request — expect 402
    const init1 = await axios({
        url: endpoint,
        method,
        data: body,
        headers: { 'Content-Type': 'application/json' },
        validateStatus: () => true, // don't throw on 402
    });

    if (init1.status !== 402) {
        if (init1.status === 200) {
            log('x402', COLOR.green, '✅ No payment required — returned 200 directly');
            return init1.data;
        }
        throw new Error(`Unexpected status ${init1.status}: ${JSON.stringify(init1.data)}`);
    }

    log('x402', COLOR.yellow, `← 402 Payment Required`);

    // Step 2: Decode PAYMENT-REQUIRED header
    const paymentRequiredHeader = init1.headers['payment-required'];
    if (!paymentRequiredHeader) {
        throw new Error('Missing PAYMENT-REQUIRED header in 402 response');
    }
    const paymentRequired = decodePaymentRequiredHeader(paymentRequiredHeader);
    const req = paymentRequired.accepts[0];
    log('x402', COLOR.dim, `   scheme=${req.scheme} network=${req.network} amount=${req.amount} payTo=${(req.payTo as string).slice(0, 8)}...`);

    // Step 3: Create and sign payment payload (Soroban USDC transfer)
    log('x402', COLOR.teal, '→ Signing Stellar USDC payment...');
    let paymentPayload;
    try {
        paymentPayload = await httpClient.createPaymentPayload(paymentRequired);
    } catch (err: any) {
        throw new Error(`Payment signing failed: ${err.message}\n   → Make sure the wallet has USDC on Stellar testnet`);
    }

    // Step 4: Encode as header
    const paymentHeaders = httpClient.encodePaymentSignatureHeader(paymentPayload);
    log('x402', COLOR.green, '✅ Payment signed');

    // Step 5: Retry with payment header
    log('x402', COLOR.teal, '→ Retrying with payment proof...');
    const init2 = await axios({
        url: endpoint,
        method,
        data: body,
        headers: {
            'Content-Type': 'application/json',
            ...paymentHeaders,
        },
        validateStatus: () => true,
    });

    if (init2.status === 200) {
        log('x402', COLOR.green, `✅ 200 OK — payment accepted!`);
        return init2.data;
    }

    throw new Error(`Payment rejected: ${init2.status} ${JSON.stringify(init2.data)}`);
}

// ─── Main ─────────────────────────────────────────────────────

async function main() {
    console.log(`\n${COLOR.bold}${COLOR.teal}═══ Nirium x402 Buyer Agent ═══${COLOR.reset}\n`);

    const keypair = await setupWallet();
    const httpClient = createX402Client(keypair);

    // Check USDC balance
    try {
        const horizon = getHorizonClient(NETWORK);
        const account = await horizon.loadAccount(keypair.publicKey());
        const usdcBalance = account.balances.find(
            (b: any) => b.asset_type !== 'native' && b.asset_code === 'USDC' && b.asset_issuer === USDC_ISSUER
        );
        const xlmBalance = account.balances.find((b: any) => b.asset_type === 'native');
        log('BALANCE', COLOR.teal, `XLM: ${xlmBalance?.balance ?? '0'} | USDC: ${usdcBalance?.balance ?? '0 (no trustline)'}`);

        if (!usdcBalance || parseFloat(usdcBalance.balance) < 0.01) {
            log('BALANCE', COLOR.red, '⚠️  Insufficient USDC. Need at least 0.01 USDC to pay for signals.');
            log('BALANCE', COLOR.yellow, `   Wallet: ${keypair.publicKey()}`);
            log('BALANCE', COLOR.yellow, '   Fund via: https://friendbot.stellar.org or transfer USDC from another account');
            process.exit(1);
        }
    } catch {
        log('BALANCE', COLOR.yellow, 'Could not load account — will attempt payment anyway');
    }

    // ─ Buy Signals ─────────────────────────────────────────────
    console.log(`\n${COLOR.bold}[ Premium Signals — $0.01 USDC ]${COLOR.reset}`);
    try {
        const signals = await fetchWithX402(httpClient, '/api/v1/premium/signals?count=5') as any;
        log('SIGNALS', COLOR.green, `Got ${signals?.signals?.length ?? 0} signals`);
        if (signals?.signals?.length) {
            signals.signals.slice(0, 3).forEach((s: any, i: number) => {
                console.log(`   [${i + 1}] confidence=${s.confidence?.toFixed(2) ?? 'N/A'} profit=${s.estimatedProfit ?? 'N/A'} path=${JSON.stringify(s.executionPath ?? [])}`);
            });
        }
        console.log(`   meta: network=${signals?.meta?.network} protocol=${signals?.meta?.protocol}`);
    } catch (err: any) {
        log('SIGNALS', COLOR.red, `❌ ${err.message}`);
    }

    // ─ Buy Market State ────────────────────────────────────────
    console.log(`\n${COLOR.bold}[ Premium Market State — $0.01 USDC ]${COLOR.reset}`);
    try {
        const market = await fetchWithX402(httpClient, '/api/v1/premium/market') as any;
        const rec = market?.enriched?.recommendation ?? 'N/A';
        const feeAlert = market?.enriched?.feeAlert ?? 'N/A';
        log('MARKET', COLOR.green, `recommendation=${rec} feeAlert=${feeAlert}`);
    } catch (err: any) {
        log('MARKET', COLOR.red, `❌ ${err.message}`);
    }

    console.log(`\n${COLOR.bold}${COLOR.green}═══ Done ═══${COLOR.reset}\n`);
}

main().catch((err) => {
    log('ERROR', COLOR.red, err.message);
    process.exit(1);
});
