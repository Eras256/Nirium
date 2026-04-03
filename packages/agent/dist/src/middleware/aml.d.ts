import { Request, Response, NextFunction } from 'express';
export interface TravelRuleParty {
    name: string;
    accountNumber: string;
    address?: string;
    dateOfBirth?: string;
    nationalId?: string;
}
export interface AmlEventRecord {
    eventType: 'travel_rule' | 'ofac_check' | 'high_value_tx' | 'proof_of_reserves';
    timestamp: string;
    walletAddress?: string;
    amount?: number;
    asset?: string;
    originator?: TravelRuleParty;
    beneficiary?: TravelRuleParty;
    ofacResult?: 'cleared' | 'flagged' | 'error';
    meta?: Record<string, unknown>;
}
export declare function travelRuleMiddleware(): (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare function ofacCheckMiddleware(): (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare function amlEventLogger(): (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare function checkProofOfReserves(walletAddress: string): Promise<void>;
/**
 * Starts periodic proof-of-reserves verification for the given address.
 * Safe to call multiple times — only one interval runs at a time.
 */
export declare function startProofOfReservesSchedule(walletAddress: string): void;
/**
 * Stops the proof-of-reserves schedule (useful for graceful shutdown
 * or testing).
 */
export declare function stopProofOfReservesSchedule(): void;
export declare function amlMiddlewareStack(): ((req: Request, res: Response, next: NextFunction) => Promise<void>)[];
//# sourceMappingURL=aml.d.ts.map