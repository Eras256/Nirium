import { MarketState, PathPaymentRoute } from '../types/database.types.js';
declare const HORIZON_URL: string;
declare const SOROBAN_RPC_URL: string;
declare const NETWORK: "testnet" | "mainnet";
/**
 * Fetch current XLM price from CoinGecko.
 * Falls back to Horizon trades for a synthetic price on testnet.
 */
export declare function fetchXlmPrice(): Promise<number>;
/**
 * Fetch current Stellar base fee from Horizon fee_stats.
 * Returns base fee in stroops (1 XLM = 10^7 stroops).
 */
export declare function fetchBaseFee(): Promise<number>;
/**
 * Query Horizon /paths/strict-receive for profitable multi-hop routes.
 * This discovers atomic arbitrage paths built into Stellar's base protocol.
 */
export declare function discoverPathPaymentRoutes(): Promise<PathPaymentRoute[]>;
/**
 * Fetch SDEX orderbook spread for XLM/USDC.
 * Returns spread in basis points.
 */
export declare function fetchSdexSpread(): Promise<number>;
/**
 * Generate Blend APYs.
 * On mainnet, these would come from live Blend Protocol Soroban queries.
 * On testnet, we use deterministic values derived from base fee or timestamp, no random.
 */
export declare function generateBlendApys(): Promise<{
    supply: number;
    borrow: number;
}>;
/**
 * Fetch Soroswap pool depth (testnet fallback).
 * Querying actual SDEX liquidity for XLM/USDC as a proxy for pool depth.
 */
export declare function generatePoolDepth(): Promise<number>;
/**
 * Fetch complete market state snapshot with Stellar-native data.
 * Combines real Horizon data with synthetic protocol data.
 */
export declare function fetchMarketState(): Promise<MarketState>;
/**
 * Check Horizon server health.
 */
export declare function checkHorizonHealth(): Promise<{
    healthy: boolean;
    latency: number;
    ledger?: number;
}>;
/**
 * Check Soroban RPC health.
 */
export declare function checkSorobanHealth(): Promise<{
    healthy: boolean;
    latency: number;
}>;
export { HORIZON_URL, SOROBAN_RPC_URL, NETWORK };
//# sourceMappingURL=stellarProvider.d.ts.map