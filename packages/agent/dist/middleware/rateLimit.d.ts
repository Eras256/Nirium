import { Request, Response, NextFunction } from 'express';
export declare function createRateLimiter(type: 'standard' | 'aggressive'): (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
//# sourceMappingURL=rateLimit.d.ts.map