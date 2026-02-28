import { ExecutionResult } from '../types/database.types.js';
export interface AuditRecord {
    version: string;
    network: string;
    txHash: string;
    strategy: string;
    profit: number;
    timestamp: string;
    integrity_hash: string;
}
/**
 * Publishes an execution summary to IPFS via Pinata.
 * Returns the CID for on-chain anchoring / forensic audit trail.
 */
export declare function auditExecution(result: ExecutionResult): Promise<string | null>;
//# sourceMappingURL=walrusStellarBridge.d.ts.map