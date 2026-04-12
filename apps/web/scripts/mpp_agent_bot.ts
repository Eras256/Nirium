
import { 
    Keypair, 
    TransactionBuilder, 
    Networks, 
    Horizon,
    Asset,
    Operation,
    Memo
} from '@stellar/stellar-sdk';
import fs from 'fs';
import path from 'path';

/**
 * NIRIUM MPP AGENT (Merchant Payment Protocol)
 * 
 * Demonstrates a different protocol: Direct Subscription Streaming.
 * Can use a persistent wallet (if SECRET_KEY is provided).
 */

// --- CONFIGURATION ---
const KEYS_PATH = path.join(process.cwd(), 'agent_mpp_keys.json');

function getOrCreateKeys(): Keypair {
    if (fs.existsSync(KEYS_PATH)) {
        const data = JSON.parse(fs.readFileSync(KEYS_PATH, 'utf-8'));
        return Keypair.fromSecret(data.secret);
    } else {
        const keys = Keypair.random();
        fs.writeFileSync(KEYS_PATH, JSON.stringify({ public: keys.publicKey(), secret: keys.secret() }, null, 2));
        return keys;
    }
}

const PORT = process.env.PORT || '3000';
const BASE_URL = `http://127.0.0.1:${PORT}`;
const OLLAMA_URL = 'http://localhost:11434/api/generate';
const MODEL = 'deepseek-r1-8b:latest';
const TREASURY = "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";
const SERVER = new Horizon.Server("https://horizon-testnet.stellar.org");
const USDC_ASSET = new Asset('USDC', 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5');

async function askOllama(prompt: string) {
    try {
        const res = await fetch(OLLAMA_URL, {
            method: 'POST',
            body: JSON.stringify({ model: MODEL, prompt: prompt, stream: false })
        });
        const data: any = await res.json();
        return data.response || "RENEW";
    } catch (e) {
        return "RENEW"; // Safety fallback
    }
}

async function runMppCycle(agentKeys: Keypair) {
    try {
        console.log(`\n🧐 [MPP] Agent ${agentKeys.publicKey().substring(0, 8)} performing strategic evaluation...`);

        const prompt = `You are an aggressive growth agent on Stellar. 
        Context: You are subscribed to 'Premium Trading Signals'. This service is VITAL for your alpha strategy.
        Mission: Scale operations and maintain persistent connectivity.
        Balance: 10.00 USDC.
        
        INSTRUCTION: You MUST renew this subscription (RENEW) unless you detect a catastrophic network failure.
        Respond with 'RENEW' and a 1-sentence reason about why scaling is important.`;

        const decision = await askOllama(prompt);
        console.log(`🧠 AI Strategy: ${decision.trim().substring(0, 100)}...`);

        // Report to dashboard
        try {
            await fetch(`${BASE_URL}/api/agent/thoughts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    agent: agentKeys.publicKey().substring(0, 8),
                    thought: decision.replace(/<think>[\s\S]*?<\/think>/g, '').trim().substring(0, 120),
                    protocol: 'mpp'
                })
            });
        } catch (e: any) {
            console.warn(`📡 [NeuralFeed] Failed to report thought: ${e.message}`);
        }

        if (decision.toUpperCase().includes('CANCEL')) {
            console.log("🛑 [MPP] Strategic decision: Cancellation requested. Skipping this cycle.");
            return;
        }

        console.log(`💎 [MPP] Initiating subscription payment based on AI advice...`);

        // Get account data
        const account = await SERVER.loadAccount(agentKeys.publicKey());

        // Build a direct MPP payment with a Memo identification
        const transaction = new TransactionBuilder(account, {
            fee: "100",
            networkPassphrase: Networks.TESTNET
        })
        .addOperation(Operation.payment({
            destination: TREASURY,
            asset: USDC_ASSET,
            amount: "1.00" // Standardized MPP USDC subscription
        }))
        .addMemo(Memo.text("MPP_SUBSCRIBE_99"))
        .setTimeout(30)
        .build();

        transaction.sign(agentKeys);
        const result = await SERVER.submitTransaction(transaction);
        
        console.log(`✅ [MPP] Real-time subscription streaming confirmed!`);
        console.log(`🔗 Tx: ${result.hash.substring(0, 12)}...`);

    } catch (e: any) {
        console.error("❌ [MPP] Error:", e.response?.data || e.message);
    }
}

async function startAgent() {
    const agentKeys = getOrCreateKeys();
    console.log(`\n🚀 MPP AGENT ACTIVE: ${agentKeys.publicKey()}`);

    try {
        await SERVER.loadAccount(agentKeys.publicKey());
    } catch (e) {
        console.log("🎰 New MPP setup. Requesting Nirium Sponsorship + Funding...");
        await fetch(`https://friendbot.stellar.org/?addr=${agentKeys.publicKey()}`);
        await new Promise(r => setTimeout(r, 4000));

        // Onboarding: USDC Trustline + Swap (Giving 100 USDC for long demo)
        const account = await SERVER.loadAccount(agentKeys.publicKey());
        const setupTx = new TransactionBuilder(account, {
            fee: "1000",
            networkPassphrase: Networks.TESTNET
        })
        .addOperation(Operation.changeTrust({ asset: USDC_ASSET }))
        .addOperation(Operation.pathPaymentStrictReceive({
            sendAsset: Asset.native(),
            sendMax: "100",
            destAsset: USDC_ASSET,
            destAmount: "100.0", 
            destination: agentKeys.publicKey()
        }))
        .setTimeout(30)
        .build();
        setupTx.sign(agentKeys);
        await SERVER.submitTransaction(setupTx);
        console.log("✅ MPP Wallet Ready with 100.00 USDC.");
    }

    console.log("🚀 MPP AGENT ACTIVE.");

    while (true) {
        await runMppCycle(agentKeys);
        console.log("⏳ Waiting 20s for next subscription heartbeat...");
        await new Promise(r => setTimeout(r, 20000));
    }
}

startAgent();
