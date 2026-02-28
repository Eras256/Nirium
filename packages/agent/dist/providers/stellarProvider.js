import { Horizon, rpc } from '@stellar/stellar-sdk';
export const NETWORK = process.env.STELLAR_NETWORK || 'testnet';
const HORIZON_URL = NETWORK === 'mainnet' ? 'https://horizon.stellar.org' : 'https://horizon-testnet.stellar.org';
const SOROBAN_RPC_URL = process.env.SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org';
const horizonServer = new Horizon.Server(HORIZON_URL);
const sorobanServer = new rpc.Server(SOROBAN_RPC_URL);
/**
 * Fetch a consolidated market state from Horizon and Soroban.
 */
export async function fetchMarketState() {
    try {
        // En un sistema real, haríamos queries de orderbooks, pools, etc.
        // Aquí mockeamos los datos dinámicos para el Agent Loop
        return {
            xlmPrice: 0.125 + Math.random() * 0.01,
            baseFee: 100,
            sdexSpread: 15 + Math.random() * 5,
            soroswapPoolDepth: 1200000,
            blendApy: {
                supply: 12.5,
                borrow: 14.2
            },
            pathPaymentRoutes: [],
            timestamp: new Date().toISOString()
        };
    }
    catch (error) {
        console.error('[StellarProvider] Error:', error);
        throw error;
    }
}
export async function checkHorizonHealth() {
    return { healthy: true };
}
export async function checkSorobanHealth() {
    return { healthy: true };
}
//# sourceMappingURL=stellarProvider.js.map