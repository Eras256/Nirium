/**
 * Nirium — Stellar Transaction & Data Client (Mock)
 * This replaces the legacy SuiClient during the migration phase.
 */
export const stellarClient = {
    // Stellar uses 7 decimals for most assets, 9 for stroops/native
    getBalance: async ({ owner, coinType }: { owner: string, coinType: string }) => ({
        totalBalance: "10000000000",
        asset: coinType === 'XLM' ? 'native' : 'USDC'
    }),

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

    // Legacy compatibility for dashboard (mapping to submitTransaction)
    executeTransactionBlock: async (...args: any[]) => ({
        digest: 'stellar_' + Math.random().toString(36).substring(7),
        status: { status: 'success' }
    }),

    waitForTransaction: async (...args: any[]) => ({
        status: 'success',
        ledger: 1234568
    }),
};

const owner = "GAIH3ULLFQ4DGSECF2AR555KZ4KNDGEKN4AFI4SU2M7B43MGK3QJZNSR";
