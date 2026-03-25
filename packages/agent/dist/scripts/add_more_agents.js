import { Keypair } from '@stellar/stellar-sdk';
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import chalk from 'chalk';
// Load .env.local from project root
const envPath = path.resolve(process.cwd(), '../../.env.local');
dotenv.config({ path: envPath });
async function main() {
    const START_INDEX = 16;
    const END_INDEX = 30;
    const newSecrets = [];
    console.log(chalk.bold.blue(`\n🚀 GENERATING 15 ADDITIONAL AGENTS (16-30)...\n`));
    for (let i = START_INDEX; i <= END_INDEX; i++) {
        const kp = Keypair.random();
        const publicKey = kp.publicKey();
        const secretKey = kp.secret();
        console.log(chalk.yellow(`[Agent ${i}] Funding ${publicKey.slice(0, 8)}... via Friendbot`));
        try {
            await axios.get(`https://friendbot.stellar.org/?addr=${publicKey}`);
            console.log(chalk.green(`[Agent ${i}] Funded successfully.`));
            newSecrets.push(`AGENT_SECRET_${i}=${secretKey} # ${publicKey}`);
        }
        catch (error) {
            console.error(chalk.red(`[Agent ${i}] Friendbot Error:`), error?.response?.data || error.message);
            // Even if friendbot fails, we might still want to add it, but it's risky
            newSecrets.push(`AGENT_SECRET_${i}=${secretKey} # ${publicKey} (FAILED FUNDING)`);
        }
        // Delay to avoid friendbot rate limits
        if (i < END_INDEX) {
            await new Promise(r => setTimeout(r, 2000));
        }
    }
    if (newSecrets.length > 0) {
        console.log(chalk.bold.cyan(`\n✍️ Appending to .env.local...\n`));
        const currentEnv = await fs.readFile(envPath, 'utf-8');
        const appendContent = '\n# --- Swarm V2 Additional Agents ---\n' + newSecrets.join('\n') + '\n';
        await fs.writeFile(envPath, currentEnv + appendContent);
        console.log(chalk.green(`✅ Successfully added 15 agents to .env.local`));
    }
}
main().catch(console.error);
//# sourceMappingURL=add_more_agents.js.map