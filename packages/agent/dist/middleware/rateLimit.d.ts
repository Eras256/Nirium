import { Request, Response, NextFunction } from 'express';
/**
 * Create a rate limiter middleware with the specified tier.
 */
export declare function createRateLimiter(tier?: 'standard' | 'aggressive' | 'admin'): (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=rateLimit.d.ts.map