import { Request, Response, NextFunction } from 'express';
export interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
        permissions: string[];
        authMethod: 'jwt' | 'api_key';
    };
}
/**
 * Generate a JWT token for a user.
 */
export declare function generateToken(userId: string, permissions?: string[]): string;
/**
 * Verify and decode a JWT token.
 */
export declare function verifyToken(token: string): {
    userId: string;
    permissions: string[];
} | null;
/**
 * Generate a new API key.
 */
export declare function generateApiKey(userId: string, name: string, permissions?: string[]): string;
/**
 * Get all API keys for a user (returns metadata only, not the actual keys).
 */
export declare function getUserApiKeys(userId: string): Array<{
    id: string;
    name: string;
    permissions: string[];
    created: string;
}>;
/**
 * Revoke an API key by its hash prefix.
 */
export declare function revokeApiKey(keyIdPrefix: string): boolean;
/**
 * Create HMAC-SHA256 signature for webhook payloads.
 */
export declare function createHmacSignature(payload: string, secret: string): string;
/**
 * Verify HMAC-SHA256 signature for incoming webhook payloads.
 */
export declare function verifyHmacSignature(payload: string, signature: string, secret: string): boolean;
/**
 * Authentication middleware — supports JWT Bearer tokens and API keys.
 */
export declare function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void;
/**
 * Admin-only middleware — must be used AFTER authMiddleware.
 */
export declare function adminMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void;
//# sourceMappingURL=auth.d.ts.map