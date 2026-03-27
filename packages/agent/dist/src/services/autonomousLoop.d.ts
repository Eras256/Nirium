import { MarketState, Signal, OpportunityConfig, AIDecision } from '../types/database.types.js';
type BroadcastFn = (level: string, message: string, details?: Record<string, unknown>) => void;
type SignalBroadcastFn = (signal: Signal) => void;
/**
 * Initialize the autonomous loop with broadcast functions.
 */
export declare function initializeLoop(logFn: BroadcastFn, signalFn: SignalBroadcastFn): void;
/**
 * Perform a single market scan cycle.
 */
export declare function performScan(): Promise<MarketState>;
/**
 * Start the autonomous scanning loop.
 */
export declare function startLoop(userConfig?: Partial<OpportunityConfig>): {
    success: boolean;
    message: string;
};
/**
 * Stop the autonomous scanning loop.
 */
export declare function stopLoop(): {
    success: boolean;
    message: string;
};
/**
 * Get the current loop status.
 */
export declare function getLoopStatus(): {
    isRunning: boolean;
    scanCount: number;
    uptime: number;
    marketState: MarketState | null;
    config: OpportunityConfig;
    lastAiDecision: AIDecision | null;
};
/**
 * Get the current market state (last fetched).
 */
export declare function getCurrentMarketState(): MarketState | null;
export {};
//# sourceMappingURL=autonomousLoop.d.ts.map