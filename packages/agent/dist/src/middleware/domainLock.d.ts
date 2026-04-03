import { Request, Response, NextFunction } from 'express';
export interface DomainLockOptions {
    /** Origins allowed without penalty (default: nirium.xyz + localhost) */
    approvedOrigins?: string[];
    /** Block entirely unknown origins in production (default: false — just rate-limit) */
    blockUnknownOrigins?: boolean;
    /** Max requests/minute from unknown origins before hard-block (default: 5) */
    unknownOriginBurstLimit?: number;
    /** Custom logger — defaults to console.warn */
    logger?: (event: CrossOriginEvent) => void;
}
export interface CrossOriginEvent {
    type: 'unknown_origin' | 'spoofed_origin' | 'rate_limited' | 'blocked';
    origin: string | null;
    referer: string | null;
    ip: string;
    userAgent: string;
    path: string;
    method: string;
    timestamp: string;
    requestId: string;
}
/**
 * Server-side domain lock and origin validation middleware.
 *
 * Apply before route handlers. For maximum security, apply after
 * helmetConfig() and corsStrictPolicy() from security.ts.
 */
export declare function domainLockMiddleware(options?: DomainLockOptions): (req: Request, res: Response, next: NextFunction) => void;
/**
 * Returns true if the request carries a valid internal service token.
 * Used for service-to-service calls (e.g. cron jobs, webhooks) that
 * don't have a browser Origin header.
 */
export declare function isInternalRequest(req: Request): boolean;
//# sourceMappingURL=domainLock.d.ts.map