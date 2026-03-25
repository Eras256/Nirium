import { Request, Response, NextFunction } from 'express';
/**
 * Legal Shield Middleware
 * Verifies that the user has signed the legal consent terms on-chain.
 * Required for critical operations on Soroban/Mainnet.
 */
export declare function legalShieldMiddleware(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=legalShield.d.ts.map