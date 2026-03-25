import { Horizon, Keypair } from '@stellar/stellar-sdk';
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '../../.env.local') });
const server = new Horizon.Server('https://horizon-testnet.stellar.org');
async function checkTitanActivity() {
    const secret = process.env.AGENT_SECRET_1;
    if (!secret) {
        console.error("No AGENT_SECRET_1 found");
        return;
    }
    const kp = Keypair.fromSecret(secret);
    console.log(`Checking Titan: ${kp.publicKey()}`);
    try {
        const txs = await server.transactions().forAccount(kp.publicKey()).order('desc').limit(5).call();
        console.log("Recent Transactions:");
        for (const tx of txs.records) {
            console.log(`- Hash: ${tx.hash}, Created: ${tx.created_at}, Successful: ${tx.successful}`);
            const ops = await tx.operations();
            for (const op of ops.records) {
                console.log(`  -> Operation Type: ${op.type}`);
                if (op.type === 'payment') {
                    console.log(`     Asset: ${op.asset_code || 'XLM'} Amount: ${op.amount}`);
                }
                if (op.type === 'invoke_host_function') {
                    console.log(`     Function invoked on Soroban!`);
                }
            }
        }
    }
    catch (e) {
        console.log("Failed to fetch:", e.message);
    }
}
checkTitanActivity();
//# sourceMappingURL=check_activity.js.map