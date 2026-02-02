/**
 * Nirium Deployed Contracts
 * 
 * Auto-generated configuration for connecting to the Neural/Stellar ecosystem.
 * These addresses correspond to the latest deployment on Testnet.
 */

export const NIRIUM_CONTRACTS = {
    VERIFIER: process.env.NEXT_PUBLIC_VERIFIER_CONTRACT_ID as string,
    IDENTITY_POOL: process.env.NEXT_PUBLIC_IDENTITY_POOL_CONTRACT_ID as string,
    PAYMENT_GATE: process.env.NEXT_PUBLIC_PAYMENT_GATE_CONTRACT_ID as string,
    NETWORK: process.env.NEXT_PUBLIC_STELLAR_NETWORK || 'testnet',
};

// Contract Methods (Helper Constants)
export const METHODS = {
    IDENTITY_POOL: {
        DEPOSIT: 'deposit',
        WITHDRAW: 'withdraw',
    },
    PAYMENT_GATE: {
        PAY: 'pay',
        VERIFY_ACCESS: 'verify_access',
    },
};

// Validate configuration
if (!NIRIUM_CONTRACTS.VERIFIER || !NIRIUM_CONTRACTS.IDENTITY_POOL) {
    console.warn('⚠️ Nirium Contracts not fully configured. Check .env.local');
}
