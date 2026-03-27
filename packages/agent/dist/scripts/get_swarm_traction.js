import { Keypair } from '@stellar/stellar-sdk';
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '../../.env.local') });
async function getSwarmTraction() {
    let totalTxs = 0;
    let agentsCount = 0;
    console.log("Fetching metrics for 30 agents...\n");
    for (let i = 1; i <= 30; i++) {
        const secret = process.env[`AGENT_SECRET_${i}`];
        if (!secret)
            continue;
        try {
            const kp = Keypair.fromSecret(secret);
            const pubKey = kp.publicKey();
            // Limit 200 is max per page on Horizon. For testnet demo, a single page is often enough, 
            // but we can just get the total record count from the paging structure or just count the page.
            const response = await fetch(`https://horizon-testnet.stellar.org/accounts/${pubKey}/transactions?limit=200&order=desc`);
            if (response.ok) {
                const data = await response.json();
                const txCount = data._embedded?.records?.length || 0;
                totalTxs += txCount;
                agentsCount++;
                process.stdout.write(`Agent ${i} (${pubKey.substring(0, 8)}...): ${txCount} TXs\n`);
            }
        }
        catch (e) {
            console.error(`Error fetching Agent ${i}: ${e.message}`);
        }
    }
    console.log(`\n=== SCARM OUTCOME ===`);
    console.log(`Total Active Agents: ${agentsCount}`);
    console.log(`Aggregated Testnet TXs: ${totalTxs}+`);
}
getSwarmTraction();
//# sourceMappingURL=get_swarm_traction.js.map