import { 
    Keypair, 
    TransactionBuilder, 
    Networks, 
    Horizon,
    Asset,
    Operation
} from '@stellar/stellar-sdk';
import fs from 'fs';
import path from 'path';

const KEYS_PATH = path.join(process.cwd(), 'agent_neural_keys.json');

function getOrCreateKeys(): Keypair {
    if (fs.existsSync(KEYS_PATH)) {
        const data = JSON.parse(fs.readFileSync(KEYS_PATH, 'utf-8'));
        console.log("🔐 Loading existing persistent wallet...");
        return Keypair.fromSecret(data.secret);
    } else {
        const keys = Keypair.random();
        fs.writeFileSync(KEYS_PATH, JSON.stringify({
            public: keys.publicKey(),
            secret: keys.secret()
        }, null, 2));
        console.log("🎰 Generated and SAVED new persistent wallet.");
        return keys;
    }
}

/**
 * NIRIUM NEURAL REASONER BOT (Ollama + DeepSeek Version)
 * 
 * An autonomous agent that decides its own tool upgrades
 * based on reasoning and budget constraints on Stellar.
 */

const PORT = process.env.PORT || '3000';
const BASE_URL = `http://127.0.0.1:${PORT}`; 
const OLLAMA_URL = 'http://localhost:11434/api/generate';
const MODEL = 'deepseek-r1-8b:latest'; // Exact name from ollama list
const TREASURY = "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";
const USDC_ASSET = new Asset('USDC', 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5');
const SERVER = new Horizon.Server("https://horizon-testnet.stellar.org");

async function askOllama(prompt: string) {
    try {
        const res = await fetch(OLLAMA_URL, {
            method: 'POST',
            body: JSON.stringify({
                model: MODEL,
                prompt: prompt,
                stream: false
            })
        });
        
        if (!res.ok) {
            const err = await res.text();
            console.error(`❌ Ollama Error (${res.status}):`, err);
            return "WAIT";
        }

        const data: any = await res.json();
        return data.response || "WAIT";
    } catch (e: any) {
        console.error("❌ Could not connect to Ollama:", e.message);
        return "WAIT";
    }
}

async function startNeuralAgent() {
    const agentKeys = getOrCreateKeys();
    console.log(`\n🧠 Neural Agent Identity: ${agentKeys.publicKey()}`);

    // Check if account exists, if not, fund it
    try {
        await SERVER.loadAccount(agentKeys.publicKey());
    } catch (e) {
        console.log("💧 Account not found. Requesting Nirium Sponsorship...");
        try {
            const resp = await fetch(`${BASE_URL}/api/agent/sponsor`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ agentPublicKey: agentKeys.publicKey() })
            });
            const data: any = await resp.json();
            if (data.sponsored) {
                console.log(`🛡️ Protocol Sponsorship SECURED via ${data.funder}`);
            }
        } catch (sponErr) { /* fallback */ }
        
        await fetch(`https://friendbot.stellar.org/?addr=${agentKeys.publicKey()}`);
        await new Promise(r => setTimeout(r, 4000));
        
        // Setup trustline + swap XLM for USDC (10 USDC instead of 5 for more "power")
        const account = await SERVER.loadAccount(agentKeys.publicKey());
        const setupTx = new TransactionBuilder(account, { fee: "1000", networkPassphrase: Networks.TESTNET })
            .addOperation(Operation.changeTrust({ asset: USDC_ASSET }))
            .addOperation(Operation.pathPaymentStrictReceive({
                sendAsset: Asset.native(),
                sendMax: "50",
                destAsset: USDC_ASSET,
                destAmount: "10.0",
                destination: agentKeys.publicKey()
            }))
            .setTimeout(30).build();
        setupTx.sign(agentKeys);
        await SERVER.submitTransaction(setupTx);
        console.log("💎 Onboarding complete. 10.00 USDC loaded.");
    }
    
    // Check balance
    const updatedAccount = await SERVER.loadAccount(agentKeys.publicKey());
    const usdcBalance = updatedAccount.balances.find((b: any) => b.asset_code === 'USDC')?.balance || "0";
    console.log(`💰 Current Balance: ${usdcBalance} USDC`);

    const skills = [
        { id: 'flash-loan-executor', name: 'Flash Loan Tool', price: '0.01 USDC', desc: 'Execute atomic loans' },
        { id: 'whale-tracker', name: 'Whale Tracker', price: '0.01 USDC', desc: 'Monitor large wallets' }
    ];

    while (true) {
        console.log("\n🤔 Agent is analyzing market opportunities...");
        const prompt = `CRITICAL MISSION: You are an elite autonomous agent on the Stellar network. 
        Your goal is to acquire high-value tools to maximize arbitrage efficiency.
        Wallet: ${agentKeys.publicKey()} | Balance: 5.00 USDC.
        
        AVAILABLE TOOLS:
        ${JSON.stringify(skills)}
        
        INSTRUCTION: You MUST select the best tool from the list above to fulfill your mission immediately.
        Respond ONLY with the 'id' of the tool you choose. 
        Example Response: flash-loan-executor`;

        const decision: string = await askOllama(prompt);
        const lowerDecision = decision.toLowerCase();
        
        console.log(`💬 LLM Thought Process: ${decision.substring(0, 100).replace(/\n/g, ' ')}...`);

        // Report to dashboard
        try {
            await fetch(`${BASE_URL}/api/agent/thoughts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    agent: agentKeys.publicKey().substring(0, 8),
                    thought: decision.replace(/<think>[\s\S]*?<\/think>/g, '').trim().substring(0, 120),
                    protocol: 'x402'
                })
            });
        } catch (e: any) {
            console.warn(`📡 [NeuralFeed] Failed to report thought: ${e.message}`);
        }
        
        // Find if any skill ID is mentioned in the response
        const foundSkill = skills.find(s => lowerDecision.includes(s.id.toLowerCase()));
        
        if (foundSkill) {
            console.log(`🎯 AGGRESSIVE DECISION: LLM opted to acquire [${foundSkill.id}]`);
            await executeX402Purchase(agentKeys, foundSkill.id);
        } else if (lowerDecision.includes('wait')) {
            console.log("🥱 DECISION: Agent decided to wait anyway.");
        } else {
            console.log(`🤔 DECISION: Unclear. LLM said something else.`);
        }

        console.log("⏳ Thinking for next 30s...");
        await new Promise(r => setTimeout(r, 30000));
    }
}

async function executeX402Purchase(keys: Keypair, skillId: string) {
    try {
        // 1. Trigger 402
        const firstCall = await fetch(`${BASE_URL}/api/marketplace/install/${skillId}`, {
            method: 'POST',
            headers: { 'x-stellar-account': keys.publicKey() }
        });

        if (firstCall.status === 402) {
            const data = await firstCall.json();
            const { transactionXdr } = data.paymentInstructions;
            console.log(`💰 x402 Challenge Received. Signing payment...`);

            // 2. Sign and retry
            const tx = TransactionBuilder.fromXDR(transactionXdr, Networks.TESTNET);
            tx.sign(keys);
            const secondCall = await fetch(`${BASE_URL}/api/marketplace/install/${skillId}`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'x-stellar-account': keys.publicKey(),
                    'X-PAYMENT': tx.toXDR()
                }
            });
            const result = await secondCall.json();
            if (result.success) console.log(`✅ PURCHASE COMPLETE: Skill ${skillId} active.`);
        }
    } catch (e: any) {
        console.error("❌ Neural execution error:", e.message);
    }
}

startNeuralAgent();
