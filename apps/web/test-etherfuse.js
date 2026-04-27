const crypto = require('crypto');
const API_KEY = process.env.ETHERFUSE_API_KEY || "api_sand:c26df867-8c9c-4a34-900b-0a3140c14f24:cd29e3d9-6fa3-446b-82e9-9e52edb1d27d";
const BASE_URL = 'https://api.sand.etherfuse.com';

const walletAddress = "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";
const getUUID = (base) => {
    const hash = crypto.createHash('sha256').update(base).digest('hex').slice(0, 32);
    return [hash.slice(0, 8), hash.slice(8, 12), hash.slice(12, 16), hash.slice(16, 20), hash.slice(20, 32)].join('-');
};
const customerId = getUUID(walletAddress + 'cust');
const bankAccountId = getUUID(walletAddress + 'bank');

async function test() {
    console.log("Testing auth...");
    const kycRes = await fetch(`${BASE_URL}/ramp/onboarding-url`, {
        method: 'POST',
        headers: { 'Authorization': API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            customerId,
            bankAccountId,
            publicKey: walletAddress,
            blockchain: 'stellar',
            claimOwnership: true
        })
    });
    console.log("Status:", kycRes.status);
    console.log("Body:", await kycRes.text());
}
test();
