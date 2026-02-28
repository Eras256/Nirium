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
 * Publishes an execution summary to an immutable storage layer (Walrus/IPFS).
 * Returns the CID/BlobID for on-chain anchoring.
 */
export declare function auditExecution(result: ExecutionResult): Promise<string | null>;
//# sourceMappingURL=walrusStellarBridge.d.ts.map