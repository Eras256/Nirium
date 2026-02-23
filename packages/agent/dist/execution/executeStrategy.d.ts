import { ExecutionResult } from '../types/database.types.js';
type LogFn = (level: string, message: string, details?: Record<string, unknown>) => void;
/**
 * Execute a strategy on Stellar mainnet/testnet.
 * Builds real XDR transaction envelopes, submits to Horizon, and awaits confirmation.
 */
export declare function executeStrategy(strategy: string, asset: string, params: Record<string, unknown>, log: LogFn): Promise<ExecutionResult>;
export {};
//# sourceMappingURL=executeStrategy.d.ts.map