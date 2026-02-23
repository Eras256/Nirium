import { ExecutionResult } from '../types/database.types.js';
type LogFn = (level: string, message: string, details?: Record<string, unknown>) => void;
/**
 * Execute a strategy in demo/testnet mode.
 * Generates realistic mock results with 0.3%-1.2% profit yields.
 */
export declare function executeDemoStrategy(strategy: string, asset: string, params: Record<string, unknown>, log: LogFn): Promise<ExecutionResult>;
export {};
//# sourceMappingURL=executeDemoStrategy.d.ts.map