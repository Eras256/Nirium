import { MarketState } from '../types/database.types.js';
export declare const NETWORK: string;
/**
 * Fetch a consolidated market state from Horizon and Soroban.
 */
export declare function fetchMarketState(): Promise<MarketState>;
export declare function checkHorizonHealth(): Promise<{
    healthy: boolean;
}>;
export declare function checkSorobanHealth(): Promise<{
    healthy: boolean;
}>;
//# sourceMappingURL=stellarProvider.d.ts.map