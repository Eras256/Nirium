import { ExecutionResult } from '../types/database.types.js';
type LogFn = (level: string, message: string, details?: Record<string, unknown>) => void;
/**
 * Routes the execution request to either the real live executor or the demo simulator.
 */
export declare function routeExecution(strategy: string, asset: string, params: Record<string, unknown>, log: LogFn): Promise<ExecutionResult>;
export {};
//# sourceMappingURL=router.d.ts.map