import { Keypair } from '@stellar/stellar-sdk';
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '../../.env.local') });
const secret = process.env.AGENT_SECRET_1;
if (!secret)
    throw new Error('No AGENT_SECRET_1');
const kp = Keypair.fromSecret(secret);
console.log(`Agent 1: ${kp.publicKey()}`);
fetch(`https://horizon-testnet.stellar.org/accounts/${kp.publicKey()}`)
    .then(r => r.json())
    .then(d => {
    console.log("XLM Balance:", d.balances.find((b) => b.asset_type === 'native')?.balance);
    console.log("Subentry Count:", d.subentry_count);
});
//# sourceMappingURL=check_titan.js.map