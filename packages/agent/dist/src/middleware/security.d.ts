import { Request, Response, NextFunction } from 'express';
interface SecurityOptions {
    allowedOrigins?: string[];
}
export declare function helmetConfig(): (_req: Request, res: Response, next: NextFunction) => void;
export declare function corsStrictPolicy(options?: SecurityOptions): (req: Request, res: Response, next: NextFunction) => void;
export declare function xdrValidator(): (req: Request, res: Response, next: NextFunction) => void;
export declare function stellarAddressValidator(): (req: Request, res: Response, next: NextFunction) => void;
export declare function sqlInjectionGuard(): (req: Request, res: Response, next: NextFunction) => void;
export declare function promptInjectionGuard(): (req: Request, res: Response, next: NextFunction) => void;
export declare function cryptoCurveValidator(): (req: Request, res: Response, next: NextFunction) => void;
export declare function timingSafeAdminKeyCheck(expectedKey: string): (req: Request, res: Response, next: NextFunction) => void;
export declare function replayProtectionMiddleware(): (req: Request, res: Response, next: NextFunction) => void;
export declare function requestSizeLimit(maxBytes?: number): (req: Request, res: Response, next: NextFunction) => void;
export declare function prototypePollutionGuard(): (req: Request, res: Response, next: NextFunction) => void;
export declare function rateLimitPerMinute(maxPerMinute?: number): (req: Request, res: Response, next: NextFunction) => void;
export {};
//# sourceMappingURL=security.d.ts.map