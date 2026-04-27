const crypto = require('crypto');
const API_KEY = process.env.ETHERFUSE_API_KEY || "api_sand:c26df867-8c9c-4a34-900b-0a3140c14f24:cd29e3d9-6fa3-446b-82e9-9e52edb1d27d";
const BASE_URL = 'https://api.sand.etherfuse.com';
const walletAddress = "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";
const getUUID = (base) => {
    const hash = crypto.createHash('sha256').update(base).digest('hex').slice(0, 32);
    return [hash.slice(0, 8), hash.slice(8, 12), hash.slice(12, 16), hash.slice(16, 20), hash.slice(20, 32)].join('-');
};
const customerId = getUUID(walletAddress + 'cust');

async function test() {
    const quoteId = crypto.randomUUID();
    console.log("Testing quote API...");
    const res = await fetch(`${BASE_URL}/ramp/quote`, {
        method: 'POST',
        headers: { 'Authorization': API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            quoteId,
            customerId,
            quoteAssets: {
                type: 'onramp',
                sourceAsset: 'MXN',
                targetAsset: 'CETES:GC3CW7EDYRTWQ635VDIGY6S4ZUF5L6TQ7AA4MWS7LEQDBLUSZXV7UPS4'
            },
            blockchain: 'stellar',
            sourceAmount: '100'
        })
    });
    console.log("Status:", res.status);
    console.log("Body:", await res.text());
}
test();
