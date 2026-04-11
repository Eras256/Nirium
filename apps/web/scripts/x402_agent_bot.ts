
import { 
    Keypair, 
    TransactionBuilder, 
    Networks, 
    Horizon
} from '@stellar/stellar-sdk';

/**
 * NIRIUM x402 AGENT FLEET (Zero-Dep Version)
 * 
 * Uses native fetch to avoid axios dependency issues.
 */

const BASE_URL = 'http://localhost:3001'; 

async function runAgent() {
    const agentKeys = Keypair.random();
    console.log(`\n💳 New Agent: ${agentKeys.publicKey().substring(0, 10)}...`);

    try {
        // 1. Fund via Friendbot
        await fetch(`https://friendbot.stellar.org/?addr=${agentKeys.publicKey()}`);
        console.log("💧 Funded!");
        await new Promise(r => setTimeout(r, 2000));

        // 2. Request Skill (Trigger 402)
        const skillId = 'flash-loan-executor';
        const firstCall = await fetch(`${BASE_URL}/api/marketplace/install/${skillId}`, {
            method: 'POST',
            headers: { 'x-stellar-account': agentKeys.publicKey() }
        });

        if (firstCall.status !== 402) {
            console.log("⚠️ No payment required or error:", firstCall.status);
            return;
        }

        const data = await firstCall.json();
        const { transactionXdr, amount, assetSymbol } = data.paymentInstructions;
        console.log(`💰 x402 Challenge: Paying ${amount} ${assetSymbol}`);

        // 3. Sign
        const transaction = TransactionBuilder.fromXDR(transactionXdr, Networks.TESTNET);
        transaction.sign(agentKeys);
        const signedXdr = transaction.toXDR();

        // 4. Submit Payment Proof
        const secondCall = await fetch(`${BASE_URL}/api/marketplace/install/${skillId}`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'x-stellar-account': agentKeys.publicKey(),
                'X-PAYMENT': signedXdr
            }
        });

        const result = await secondCall.json();
        if (result.success) {
            console.log(`✅ SUCCESS! Tx Hash: ${result.txHash.substring(0, 15)}...`);
        } else {
            console.log("❌ Payment rejected:", result);
        }
    } catch (error: any) {
        console.error("❌ Agent error:", error.message);
    }
}

async function startFleet() {
    console.log("🚀 NIRIUM AGENT FLEET ACTIVE. Using native fetch.");
    let count = 1;
    while (true) {
        console.log(`\n🤖 Cycle #${count}`);
        await runAgent();
        console.log(`⏳ Waiting 12s for next agent...`);
        await new Promise(r => setTimeout(r, 12000)); 
        count++;
    }
}

startFleet();
