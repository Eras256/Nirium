import { Keypair } from '@stellar/stellar-sdk';
import * as fs from 'fs';
import * as path from 'path';
const envPath = path.resolve(process.cwd(), '../../.env.local');
let envContent = fs.readFileSync(envPath, 'utf-8');
for (let i = 1; i <= 30; i++) {
    const freshKey = Keypair.random().secret();
    // If the line exists, replace it
    if (envContent.includes(`AGENT_SECRET_${i}=`)) {
        envContent = envContent.replace(new RegExp(`AGENT_SECRET_${i}=.*`, 'g'), `AGENT_SECRET_${i}=${freshKey}`);
    }
    else {
        // Otherwise append it
        envContent += `\nAGENT_SECRET_${i}=${freshKey}`;
    }
}
fs.writeFileSync(envPath, envContent);
console.log("Successfully rotated all 30 Swarm Agents to fresh accounts to clear subentry limits.");
//# sourceMappingURL=regenerate_keys.js.map