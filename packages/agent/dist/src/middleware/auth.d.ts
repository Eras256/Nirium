import { Request, Response, NextFunction } from 'express';
export declare const JWT_SECRET: string;
export type UserTier = 'free' | 'sandbox' | 'institutional' | 'enterprise';
export interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
        permissions: string[];
        authMethod: 'jwt' | 'api_key';
        tier: UserTier;
        quotas?: {
            requestsPerMinute: number;
            requestsPerDay: number;
            maxStrategiesPerDay: number;
        };
    };
}
interface SandboxAccount {
    id: string;
    companyName: string;
    contactEmail: string;
    walletAddress: string;
    apiKey: string;
    tier: UserTier;
    quotas: {
        requestsPerMinute: number;
        requestsPerDay: number;
        maxStrategiesPerDay: number;
    };
    createdAt: string;
    expiresAt: string;
    isActive: boolean;
}
export declare const TIER_QUOTAS: Record<UserTier, {
    requestsPerMinute: number;
    requestsPerDay: number;
    maxStrategiesPerDay: number;
}>;
export declare function getUsageStats(userId: string): {
    requests: number;
    lastReset: number;
    dailyRequests: number;
    requestsThisMinute: number;
} | {
    requestsThisMinute: number;
    requests: number;
    lastReset: number;
    dailyRequests: number;
    minuteWindow: number[];
};
export declare function resetUsageStats(userId: string): void;
export declare function generateToken(userId: string, permissions?: string[], tier?: UserTier): string;
export declare function verifyToken(token: string): {
    userId: string;
    permissions: string[];
    tier: UserTier;
    quotas?: typeof TIER_QUOTAS.free;
} | null;
export declare function generateApiKey(userId: string, name: string, permissions?: string[], tier?: UserTier, durationDays?: number): Promise<string>;
export declare function getUserApiKeys(userId: string): Promise<Array<{
    id: string;
    name: string;
    permissions: string[];
    tier: UserTier;
    created: string;
}>>;
export declare function revokeApiKey(keyId: string): Promise<boolean>;
export declare function createSandboxAccount(companyName: string, contactEmail: string, walletAddress: string, tier?: UserTier, durationDays?: number): Promise<SandboxAccount>;
export declare function getSandboxAccount(apiKey: string): Promise<SandboxAccount | null>;
export declare function listSandboxAccounts(): Promise<SandboxAccount[]>;
export declare function revokeSandboxAccount(id: string): Promise<boolean>;
export declare function createHmacSignature(payload: string, secret: string): string;
export declare function verifyHmacSignature(payload: string, signature: string, secret: string): boolean;
export declare function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
export declare function adminMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void;
export declare function sandboxMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void;
export {};
//# sourceMappingURL=auth.d.ts.map