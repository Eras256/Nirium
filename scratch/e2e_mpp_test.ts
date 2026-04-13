/**
 * E2E Test: MPP Charge payment flow on Stellar Testnet
 *
 * 1. Create agent keypair, fund with Friendbot + swap for USDC
 * 2. Start MPP server
 * 3. Agent pays for a signal using canonical MPP Charge flow
 * 4. Capture tx hash for evidence
 */

import * as StellarSdk from "@stellar/stellar-sdk";
// @ts-ignore
import { Mppx, stellar } from "@stellar/mpp/charge/client";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const MPP_SERVER = "http://localhost:3403";
const HORIZON = new StellarSdk.Horizon.Server("https://horizon-testnet.stellar.org");
const USDC = new StellarSdk.Asset("USDC", "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5");

async function main() {
    const agentKeys = StellarSdk.Keypair.random();
    console.log(`[Test] Agent: ${agentKeys.publicKey()}`);

    // Fund via Friendbot
    console.log("[Test] Funding agent via Friendbot...");
    await globalThis.fetch(`https://friendbot.stellar.org/?addr=${agentKeys.publicKey()}`);
    await new Promise(r => setTimeout(r, 3000));

    // Setup USDC trustline + swap
    console.log("[Test] Setting up USDC...");
    const account = await HORIZON.loadAccount(agentKeys.publicKey());
    const tx = new StellarSdk.TransactionBuilder(account, {
        fee: "10000",
        networkPassphrase: StellarSdk.Networks.TESTNET,
    })
        .addOperation(StellarSdk.Operation.changeTrust({ asset: USDC }))
        .addOperation(StellarSdk.Operation.pathPaymentStrictReceive({
            sendAsset: StellarSdk.Asset.native(),
            sendMax: "100",
            destAsset: USDC,
            destAmount: "5.0",
            destination: agentKeys.publicKey(),
        }))
        .setTimeout(60)
        .build();
    tx.sign(agentKeys);
    const setupResult = await HORIZON.submitTransaction(tx);
    console.log(`[Test] USDC setup tx: ${setupResult.hash}`);

    // Create MPP Charge client
    // Mppx.create polyfills globalThis.fetch to handle 402 automatically
    console.log("[Test] Creating MPP Charge client...");
    const mppClient = Mppx.create({
        methods: [
            stellar.charge({
                keypair: agentKeys,
                mode: "pull",
                onProgress(event: any) {
                    console.log(`[MPP Progress] ${event.type}${event.hash ? ': ' + event.hash : ''}`);
                },
            }),
        ],
    });

    // Buy signals
    const endpoints = [
        { name: "Trading Signals", path: "/signals/trading" },
        { name: "Whale Alerts", path: "/signals/whale-alerts" },
        { name: "Sentiment Analysis", path: "/analytics/sentiment" },
    ];

    for (const endpoint of endpoints) {
        console.log(`\n[Test] Buying ${endpoint.name} via MPP Charge...`);
        try {
            const res = await mppClient.fetch(`${MPP_SERVER}${endpoint.path}`);
            console.log(`[Test] Status: ${res.status}`);
            if (res.ok) {
                const data = await res.json();
                console.log(`[Test] SUCCESS! Payload:`, JSON.stringify(data).substring(0, 200));
            } else {
                const text = await res.text();
                console.log(`[Test] Failed: ${text.substring(0, 200)}`);
            }
        } catch (e: any) {
            console.error(`[Test] Error: ${e.message}`);
        }
        await new Promise(r => setTimeout(r, 3000));
    }

    // Check final balance
    const finalAcct = await HORIZON.loadAccount(agentKeys.publicKey());
    const usdcBal = finalAcct.balances.find((b: any) => b.asset_code === "USDC")?.balance || "0";
    console.log(`\n[Test] Final USDC balance: ${usdcBal}`);
    console.log("[Test] Done!");
}

main().catch(e => {
    console.error("Fatal:", e);
    process.exit(1);
});
