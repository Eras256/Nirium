import { LogEntry } from '../types/database.types.js';
declare const PINATA_GATEWAY: string;
interface IpfsUploadResult {
    success: boolean;
    cid?: string;
    gatewayUrl?: string;
    error?: string;
    size?: number;
}
/**
 * Upload a JSON log batch to IPFS via Pinata.
 */
export declare function uploadToIpfs(logs: LogEntry[], metadata?: Record<string, string>): Promise<IpfsUploadResult>;
/**
 * Retrieve content from IPFS by CID.
 */
export declare function getFromIpfs(cid: string): Promise<{
    success: boolean;
    data?: unknown;
    error?: string;
}>;
export { PINATA_GATEWAY };
//# sourceMappingURL=ipfsService.d.ts.map