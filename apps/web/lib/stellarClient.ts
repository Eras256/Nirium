/**
 * Nirium — Stellar Transaction & Data Client (Mock)
 * This acts as the standard client during development and testing.
 */
export const stellarClient = {
    // Stellar uses 7 decimals (1 XLM = 10,000,000 stroops)
    getBalance: async ({ owner, coinType }: { owner: string, coinType?: string }) => {
        try {
            const resp = await fetch(`https://horizon-testnet.stellar.org/accounts/${owner}`);
            if (!resp.ok) throw new Error("Account not found");
            const data = await resp.json();
            const nativeBalance = data.balances.find((b: { asset_type: string }) => b.asset_type === 'native');
            // Convert XLM balance string to stroops (BigInt) for consistency
            const stroops = BigInt(Math.floor(Number(nativeBalance?.balance || "0") * 10_000_000));
            return {
                totalBalance: stroops.toString(),
                asset: 'native'
            };
        } catch (e) {
            console.error("Error fetching balance:", e);
            // Default 10k XLM fallback if fetch fails or account new
            return { totalBalance: "100000000000", asset: 'native' };
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
