import { Request, Response, NextFunction } from 'express';
export declare function createRateLimiter(type?: 'standard' | 'aggressive' | string): (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=rateLimit.d.ts.map