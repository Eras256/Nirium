import { Request, Response, NextFunction } from 'express';
/**
 * Legal Shield Middleware
 * Verifies that the user has signed the legal consent terms on-chain.
 * Required for critical operations on Soroban/Mainnet.
 *
 * Behavior by environment:
 *  - production  + Supabase configured : strict — fails closed on any DB error
 *  - production  + no Supabase         : blocks with 503 (misconfigured deploy)
 *  - development + no Supabase         : warns and passes through (dev ergonomics)
 *  - development + Supabase configured : always validates against DB
 */
export declare function legalShieldMiddleware(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
//# sourceMappingURL=legalShield.d.ts.map