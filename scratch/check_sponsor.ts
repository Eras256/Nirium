import { Horizon, Keypair } from '@stellar/stellar-sdk';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function check() {
    const server = new Horizon.Server("https://horizon-testnet.stellar.org");
    const secret = process.env.STELLAR_SECRET_KEY;
    if (!secret) return console.log("No secret");
    const kp = Keypair.fromSecret(secret);
    try {
        const account = await server.loadAccount(kp.publicKey());
        console.log("Sponsor:", kp.publicKey());
        console.log(JSON.stringify(account.balances, null, 2));
    } catch (e) {
        console.error(e);
    }
}
check();
