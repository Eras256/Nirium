/**
 * Nirium — Stellar Transaction & Data Client (Mock)
 * This acts as the standard client during development and testing.
 */
export const stellarClient = {
    // Stellar uses 7 decimals (1 XLM = 10,000,000 stroops)
    // Stellar Assets use 7 decimals internally (1 unit = 10,000,000 subunits)
    getBalance: async ({ owner, coinType }: { owner: string, coinType?: string }) => {
        try {
            const resp = await fetch(`https://horizon-testnet.stellar.org/accounts/${owner}`);
            if (!resp.ok) throw new Error("Account not found");
            const data = await resp.json();

            let targetBalance;
            if (coinType === 'USDC') {
                const USDC_ISSUER_TESTNET = 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5';
                targetBalance = data.balances.find((b: { asset_code?: string, asset_issuer?: string }) =>
                    b.asset_code === 'USDC' && b.asset_issuer === USDC_ISSUER_TESTNET
                );
            } else {
                targetBalance = data.balances.find((b: { asset_type: string }) => b.asset_type === 'native');
            }

            // Convert string balance to raw integer units (BigInt)
            const raw = BigInt(Math.floor(Number(targetBalance?.balance || "0") * 10_000_000));
            return {
                totalBalance: raw.toString(),
                asset: coinType || 'native'
            };
        } catch (e) {
            console.error("Error fetching balance:", e);
            // Return 0 if account not found or network error occurs (Safe Institutional Fallback)
            return { totalBalance: "0", asset: coinType || 'native' };
        }
    },

    // Equivalent to getting account or contract data
    getObject: async ({ id }: { id: string }) => ({
        data: {
            id: id,
            content: {
                balance: "100000000",
                last_update: Date.now()
            },
            owner: owner,
            matrix_authorized: true
        }
    }),

    // Asset balances
    getCoins: async ({ owner, coinType }: { owner: string, coinType: string }) => ({
        data: [{
            assetCode: coinType,
            balance: "10000",
            issuer: "GA5Z..."
        }]
    }),

    // Submission primitives
    submitTransaction: async (...args: any[]) => ({
        hash: 'stellar_' + Math.random().toString(36).substring(7),
        ledger: 1234567,
        successful: true
    }),



    waitForTransaction: async (...args: any[]) => ({
        status: 'success',
        ledger: 1234568
    }),
};

const owner = "GAIH3ULLFQ4DGSECF2AR555KZ4KNDGEKN4AFI4SU2M7B43MGK3QJZNSR";
