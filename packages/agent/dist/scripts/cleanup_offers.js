import { Horizon, Keypair, TransactionBuilder, Operation, Networks, Asset } from '@stellar/stellar-sdk';
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '../../.env.local') });
const server = new Horizon.Server('https://horizon-testnet.stellar.org');
function toAsset(offerAsset) {
    if (offerAsset.asset_type === 'native')
        return Asset.native();
    return new Asset(offerAsset.asset_code, offerAsset.asset_issuer);
}
async function cleanAgent(secret) {
    const kp = Keypair.fromSecret(secret);
    const pub = kp.publicKey();
    let acc = await server.loadAccount(pub);
    let offers = await server.offers().forAccount(pub).limit(200).call();
    while (offers.records.length > 0) {
        console.log(`Cleaning ${offers.records.length} offers for ${pub.slice(0, 8)}...`);
        const tx = new TransactionBuilder(acc, { fee: '100000', networkPassphrase: Networks.TESTNET });
        let count = 0;
        for (const offer of offers.records) {
            if (count >= 100)
                break;
            tx.addOperation(Operation.manageSellOffer({
                selling: toAsset(offer.selling),
                buying: toAsset(offer.buying),
                amount: '0', // 0 cancels the offer
                price: offer.price_r,
                offerId: offer.id
            }));
            count++;
        }
        const built = tx.setTimeout(60).build();
        built.sign(kp);
        await server.submitTransaction(built);
        acc = await server.loadAccount(pub);
        offers = await server.offers().forAccount(pub).limit(200).call();
        await new Promise(r => setTimeout(r, 1000));
    }
}
async function main() {
    console.log("Cleaning up stuck offers...");
    for (let i = 1; i <= 30; i++) {
        const secret = process.env[`AGENT_SECRET_${i}`];
        if (secret) {
            try {
                await cleanAgent(secret);
            }
            catch (e) {
                console.error(`Failed ${i}:`, e?.response?.data || e.message);
            }
        }
    }
    console.log("Cleanup complete!");
}
main();
//# sourceMappingURL=cleanup_offers.js.map