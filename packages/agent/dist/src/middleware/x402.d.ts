import type { Request, Response, NextFunction } from 'express';
export declare const x402Middleware: ((req: Request, res: Response, next: NextFunction) => Promise<void>) | ((req: Request, res: Response, next: NextFunction) => void);
export declare function logPaymentReceived(fromAddress: string, route: string, amountUsdc: string, txHash?: string): Promise<void>;
//# sourceMappingURL=x402.d.ts.map