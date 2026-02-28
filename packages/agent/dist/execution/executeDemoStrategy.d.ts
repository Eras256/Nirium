import { ExecutionResult } from '../types/database.types.js';
type LogFn = (level: string, message: string, details?: Record<string, unknown>) => void;
/**
 * Execute a strategy in demo mode using REAL Soroban simulation (dry-run).
 * Does NOT submit the transaction — only simulates it to verify it would succeed.
 * This lets users see realistic results without spending any testnet funds.
 */
export declare function executeDemoStrategy(strategy: string, asset: string, params: Record<string, unknown>, log: LogFn): Promise<ExecutionResult>;
export {};
//# sourceMappingURL=executeDemoStrategy.d.ts.map