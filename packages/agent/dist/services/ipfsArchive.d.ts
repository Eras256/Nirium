/**
 * Archive recent logs to IPFS to ensure immutable audit trails.
 * Reads from the unified `nirium_protocol_records` table.
 * Runs every 5 minutes capturing "LOG" records.
 */
export declare function archiveLogsToIPFS(): Promise<string | undefined>;
export declare function startArchiver(): void;
export declare function stopArchiver(): void;
//# sourceMappingURL=ipfsArchive.d.ts.map