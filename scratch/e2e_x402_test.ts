/**
 * E2E Test: x402 payment flow on Stellar Testnet
 *
 * 1. Create agent keypair, fund with Friendbot + swap for USDC
 * 2. Start x402 server
 * 3. Agent pays for a skill using canonical x402 flow
 * 4. Capture tx hash for evidence
 */

import * as StellarSdk from "@stellar/stellar-sdk";
// @ts-ignore
import { x402Client, wrapFetchWithPayment } from "@x402/fetch";
// @ts-ignore
import { createEd25519Signer } from "@x402/stellar";
// @ts-ignore
import { ExactStellarScheme } from "@x402/stellar/exact/client";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const X402_SERVER = "http://localhost:3402";
const NETWORK = "stellar:testnet";
const HORIZON = new StellarSdk.Horizon.Server("https://horizon-testnet.stellar.org");
const USDC = new StellarSdk.Asset("USDC", "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5");

async function main() {
    // Use a pre-funded agent key or create one
    const agentKeys = StellarSdk.Keypair.random();
    console.log(`[Test] Agent: ${agentKeys.publicKey()}`);

    // Fund via Friendbot
    console.log("[Test] Funding agent via Friendbot...");
    await fetch(`https://friendbot.stellar.org/?addr=${agentKeys.publicKey()}`);
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

    // Create x402 client
    console.log("[Test] Creating x402 client...");
    const signer = createEd25519Signer(agentKeys.secret(), NETWORK);
    const client = new x402Client().register(
        "stellar:*",
        new ExactStellarScheme(signer, { url: "https://soroban-testnet.stellar.org" })
    );
    const paidFetch = wrapFetchWithPayment(fetch, client);

    // Try to buy a skill
    const skills = [
        { name: "flash-loan-executor", price: "$0.01" },
        { name: "whale-tracker", price: "$0.05" },
        { name: "arbitrage-bot", price: "$0.02" },
    ];

    for (const skill of skills) {
        console.log(`\n[Test] Buying ${skill.name} (${skill.price}) via x402...`);
        try {
            const res = await paidFetch(`${X402_SERVER}/skills/${skill.name}`);
            console.log(`[Test] Status: ${res.status}`);
            if (res.ok) {
                const data = await res.json();
                console.log(`[Test] SUCCESS! Payload:`, JSON.stringify(data).substring(0, 200));
                // Check for settlement response headers
                const paymentResponse = res.headers.get("payment-response");
                if (paymentResponse) {
                    try {
                        const decoded = JSON.parse(atob(paymentResponse));
                        console.log(`[Test] Settlement TX: ${decoded.txHash || decoded.transaction || JSON.stringify(decoded).substring(0, 100)}`);
                    } catch {
                        console.log(`[Test] Payment response header: ${paymentResponse.substring(0, 100)}`);
                    }
                }
            } else {
                const text = await res.text();
                console.log(`[Test] Failed: ${text.substring(0, 200)}`);
            }
        } catch (e: any) {
            console.error(`[Test] Error: ${e.message}`);
        }
        // Small delay between requests
        await new Promise(r => setTimeout(r, 2000));
    }

    // Check final balance
    const finalAcct = await HORIZON.loadAccount(agentKeys.publicKey());
    const usdcBal = finalAcct.balances.find((b: any) => b.asset_code === "USDC")?.balance || "0";
    console.log(`\n[Test] Final USDC balance: ${usdcBal}`);
    console.log("[Test] Done!");
}

main().catch(e => {
    console.error("Fatal:", e.message);
    process.exit(1);
});
