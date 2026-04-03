import type { Request, Response, NextFunction } from 'express';
export declare function mppChargeMiddleware(amountUsdc: string, description: string): (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const MPP_PRICES: {
    readonly signals: "0.01";
    readonly market: "0.01";
    readonly execute: "0.05";
};
//# sourceMappingURL=mpp.d.ts.map