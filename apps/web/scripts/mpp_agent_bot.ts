
import { 
    Keypair, 
    TransactionBuilder, 
    Networks, 
    Horizon,
    Asset,
    Operation,
    Memo
} from '@stellar/stellar-sdk';

/**
 * NIRIUM MPP AGENT (Merchant Payment Protocol)
 * 
 * Demonstrates a different protocol: Direct Subscription Streaming.
 * Can use a persistent wallet (if SECRET_KEY is provided).
 */

// --- CONFIGURATION ---
const SECRET_KEY = process.env.AGENT_SECRET; // Optional: Provide your own
const TREASURY = "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";
const SERVER = new Horizon.Server("https://horizon-testnet.stellar.org");
const USDC_ASSET = new Asset('USDC', 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5');

async function runMppCycle(agentKeys: Keypair) {
    try {
        console.log(`\n💎 [MPP] Agent ${agentKeys.publicKey().substring(0, 8)} initiating subscription payment...`);

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
    let agentKeys: Keypair;

    if (SECRET_KEY) {
        agentKeys = Keypair.fromSecret(SECRET_KEY);
        console.log("🔐 Using provided persistent wallet.");
    } else {
        agentKeys = Keypair.random();
        console.log("🎰 Generating new wallet for MPP agent...");
        console.log(`🔑 Public: ${agentKeys.publicKey()}`);
        console.log("💧 Funding...");
        await fetch(`https://friendbot.stellar.org/?addr=${agentKeys.publicKey()}`);
        console.log("💧 Funding with XLM...");
        await new Promise(r => setTimeout(r, 2000));

        // 🪙 Onboarding: USDC Trustline + Swap
        console.log("🪙 Preparing MPP subscription wallet (USDC)...");
        const account = await SERVER.loadAccount(agentKeys.publicKey());
        const setupTx = new TransactionBuilder(account, {
            fee: "1000",
            networkPassphrase: Networks.TESTNET
        })
        .addOperation(Operation.changeTrust({ asset: USDC_ASSET }))
        .addOperation(Operation.pathPaymentStrictReceive({
            sendAsset: Asset.native(),
            sendMax: "20",
            destAsset: USDC_ASSET,
            destAmount: "10.0", // Get enough for 10 cycles
            destination: agentKeys.publicKey()
        }))
        .setTimeout(30)
        .build();
        setupTx.sign(agentKeys);
        await SERVER.submitTransaction(setupTx);
        console.log("✅ MPP Wallet Ready.");
    }

    console.log("🚀 MPP AGENT ACTIVE.");

    while (true) {
        await runMppCycle(agentKeys);
        console.log("⏳ Waiting 20s for next subscription heartbeat...");
        await new Promise(r => setTimeout(r, 20000));
    }
}

startAgent();
