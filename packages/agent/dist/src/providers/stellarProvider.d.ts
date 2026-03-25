import { MarketState } from '../types/database.types.js';
export declare const NETWORK: string;
/**
 * Fetch a consolidated market state from Horizon and Soroban — 100% REAL data.
 */
export declare function fetchMarketState(): Promise<MarketState>;
/**
 * Health check — actually pings Horizon.
 */
export declare function checkHorizonHealth(): Promise<{
    healthy: boolean;
    latencyMs?: number;
    error?: string;
}>;
/**
 * Health check — actually pings Soroban RPC.
 */
export declare function checkSorobanHealth(): Promise<{
    healthy: boolean;
    latencyMs?: number;
    error?: string;
}>;
//# sourceMappingURL=stellarProvider.d.ts.map