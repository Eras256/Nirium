import { Keypair } from '@stellar/stellar-sdk';
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
// Load .env.local from project root
dotenv.config({ path: path.resolve(process.cwd(), '../../.env.local') });
dotenv.config();
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY; // Or Service role key if available
const supabase = SUPABASE_URL && SUPABASE_KEY ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;
async function main() {
    const SWARM_SIZE = 20;
    const swarm = [];
    console.log(`[Swarm] Generating ${SWARM_SIZE} independent agents for Testnet...`);
    for (let i = 1; i <= SWARM_SIZE; i++) {
        const kp = Keypair.random();
        const alias = `agent-stellar-${i.toString().padStart(2, '0')}`;
        const publicKey = kp.publicKey();
        const secretKey = kp.secret();
        console.log(`[Swarm] [${alias}] Requesting 10,000 XLM from Friendbot for ${publicKey}...`);
        let status = 'generated';
        try {
            // Friendbot funding
            await axios.get(`https://friendbot.stellar.org/?addr=${publicKey}`);
            console.log(`[Swarm] [${alias}] Funded successfully.`);
            status = 'funded';
        }
        catch (error) {
            console.error(`[Swarm] [${alias}] Friendbot Error:`, error?.response?.data || error.message);
            status = 'generated_unfunded';
        }
        const agentData = {
            alias,
            publicKey,
            secretKey,
            status
        };
        swarm.push(agentData);
        // Inject into Supabase "strategies" or "protocol_records" to simulate profile setup
        if (supabase && status === 'funded') {
            try {
                await supabase.from('nirium_protocol_records').insert({
                    owner_address: publicKey,
                    record_type: 'SWARM_AGENT',
                    name: alias,
                    message: `Agent deployed and funded in swarm test.`,
                    data: {
                        default_strategy: "XLM-USDC Path Vector",
                        capabilities: ["auth", "path_arbitrage"]
                    }
                });
                console.log(`[Swarm] [${alias}] Inserted profile into Data Matrix.`);
            }
            catch (err) {
                console.warn(`[Swarm] [${alias}] Failed to insert into DB.`);
            }
        }
        // Jitter to respect friendbot rate limits
        if (i < SWARM_SIZE) {
            const delay = 2000 + Math.random() * 1000;
            console.log(`[Swarm] Cooling down for ${(delay / 1000).toFixed(1)}s...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    const outPath = path.resolve(process.cwd(), 'swarm_addresses.json');
    await fs.writeFile(outPath, JSON.stringify(swarm, null, 2));
    console.log(`\n[Swarm] ✅ Generation complete. Data saved to ${outPath}`);
    console.log(`[Swarm] Ready to run: npx tsx scripts/run_swarm.ts`);
}
main().catch(console.error);
//# sourceMappingURL=generate_swarm.js.map