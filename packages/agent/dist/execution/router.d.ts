import { ExecutionResult } from '../types/database.types.js';
type LogFn = (level: string, message: string, details?: Record<string, unknown>) => void;
/**
 * Route execution to the appropriate handler based on network configuration.
 * The frontend remains completely agnostic to which mode is active.
 */
export declare function routeExecution(strategy: string, asset: string, params?: Record<string, unknown>, broadcastLog?: LogFn): Promise<ExecutionResult>;
export {};
//# sourceMappingURL=router.d.ts.map