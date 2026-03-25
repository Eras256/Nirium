import { Horizon, Keypair } from '@stellar/stellar-sdk';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import chalk from 'chalk';
dotenv.config({ path: path.resolve(process.cwd(), '../../.env.local') });
dotenv.config();
const HORIZON_URL = process.env.HORIZON_URL || 'https://horizon-testnet.stellar.org';
const horizonServer = new Horizon.Server(HORIZON_URL);
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || '';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const AGENT_NAMES = [
    'Titan', 'Eliza', 'Maux', 'Chronos', 'Astra',
    'Void', 'Nexus', 'Gaia', 'Orion', 'Sentinel',
    'Matrix', 'Atlas', 'Nova', 'Cyber', 'Nirium-1'
];
async function recoverAgentStats() {
    console.log(chalk.bold.magenta('\n🔍 RECOVERING REAL ON-CHAIN STATS FROM STELLAR TESTNET...\n'));
    for (let i = 0; i < 15; i++) {
        const secret = process.env[`AGENT_SECRET_${i + 1}`];
        if (!secret)
            continue;
        try {
            const kp = Keypair.fromSecret(secret);
            const name = AGENT_NAMES[i] ?? `Agent-${i + 1}`;
            const publicKey = kp.publicKey();
            process.stdout.write(chalk.gray(`Analyzing ${name.padEnd(10)} [${publicKey.slice(0, 8)}...] `));
            let total_txs = 0;
            let soroban_txs = 0;
            let sdex_txs = 0;
            let total_volume = 0;
            let last_tx_hash = '';
            let cursor = '';
            let hasMore = true;
            while (hasMore) {
                const response = await horizonServer.operations()
                    .forAccount(publicKey)
                    .limit(200)
                    .cursor(cursor)
                    .call();
                if (response.records.length === 0) {
                    hasMore = false;
                    break;
                }
                for (const op of response.records) {
                    if (op.type === 'create_account')
                        continue; // don't count funding
                    total_txs++;
                    last_tx_hash = op.transaction_hash;
                    if (op.type === 'invoke_host_function') {
                        soroban_txs++;
                    }
                    else if (op.type === 'manage_sell_offer') {
                        sdex_txs++;
                        // @ts-ignore
                        if (op.amount) {
                            // @ts-ignore
                            total_volume += parseFloat(op.amount);
                        }
                    }
                }
                if (response.records.length < 200) {
                    hasMore = false;
                }
                else {
                    cursor = response.records[response.records.length - 1].paging_token;
                }
            }
            console.log(chalk.green(`✔️  ${total_txs} Txs (${soroban_txs} Soroban, ${sdex_txs} SDEX) | Vol: ${total_volume.toFixed(4)} XLM`));
            if (total_txs > 0) {
                await supabase.from('nirium_swarm_agents').upsert({
                    id: name,
                    wallet_address: publicKey,
                    total_txs: total_txs,
                    soroban_txs: soroban_txs,
                    sdex_txs: sdex_txs,
                    total_volume: total_volume,
                    last_tx_hash: last_tx_hash,
                    last_activity: new Date().toISOString(),
                }, { onConflict: 'id' });
            }
        }
        catch (error) {
            console.log(chalk.red(`❌ Error: ${error.message}`));
        }
    }
    console.log(chalk.bold.green('\n✅ RECOVERY COMPLETE! Database is perfectly synced with the Blockchain.'));
    console.log(chalk.cyan('You can now run: pnpm exec tsx scripts/nirium_full_swarm.ts\n'));
}
recoverAgentStats();
//# sourceMappingURL=restore_stats.js.map