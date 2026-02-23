// ═══════════════════════════════════════════════════════════════
// Nirium — JWT + API Key Authentication Middleware
// ═══════════════════════════════════════════════════════════════

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'nirium-jwt-secret-change-me';
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'nirium-admin-key-change-me';

export interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
        permissions: string[];
        authMethod: 'jwt' | 'api_key';
    };
}

// In-memory API key store (production would use database)
const apiKeys = new Map<string, { userId: string; permissions: string[]; name: string }>();

/**
 * Generate a JWT token for a user.
 */
export function generateToken(userId: string, permissions: string[] = ['user']): string {
    return jwt.sign({ userId, permissions }, JWT_SECRET, { expiresIn: '24h' });
}

/**
 * Verify and decode a JWT token.
 */
export function verifyToken(token: string): { userId: string; permissions: string[] } | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; permissions: string[] };
        return decoded;
    } catch {
        return null;
    }
}

/**
 * Generate a new API key.
 */
export function generateApiKey(userId: string, name: string, permissions: string[] = ['user']): string {
    const key = `nrm_${crypto.randomBytes(32).toString('hex')}`;
    const keyHash = crypto.createHash('sha256').update(key).digest('hex');
    apiKeys.set(keyHash, { userId, permissions, name });
    return key;
}

/**
 * Validate an API key and return associated user info.
 */
function validateApiKey(key: string): { userId: string; permissions: string[] } | null {
    // Check admin key first
    if (key === ADMIN_API_KEY) {
        return { userId: 'admin', permissions: ['admin', 'user'] };
    }

    const keyHash = crypto.createHash('sha256').update(key).digest('hex');
    const keyData = apiKeys.get(keyHash);
    if (keyData) {
        return { userId: keyData.userId, permissions: keyData.permissions };
    }
    return null;
}

/**
 * Get all API keys for a user (returns metadata only, not the actual keys).
 */
export function getUserApiKeys(userId: string): Array<{ id: string; name: string; permissions: string[]; created: string }> {
    const keys: Array<{ id: string; name: string; permissions: string[]; created: string }> = [];
    apiKeys.forEach((value, hash) => {
        if (value.userId === userId) {
            keys.push({
                id: hash.substring(0, 16),
                name: value.name,
                permissions: value.permissions,
                created: new Date().toISOString(),
            });
        }
    });
    return keys;
}

/**
 * Revoke an API key by its hash prefix.
 */
export function revokeApiKey(keyIdPrefix: string): boolean {
    for (const [hash] of apiKeys) {
        if (hash.startsWith(keyIdPrefix)) {
            apiKeys.delete(hash);
            return true;
        }
    }
    return false;
}

/**
 * Create HMAC-SHA256 signature for webhook payloads.
 */
export function createHmacSignature(payload: string, secret: string): string {
    return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

/**
 * Verify HMAC-SHA256 signature for incoming webhook payloads.
 */
export function verifyHmacSignature(payload: string, signature: string, secret: string): boolean {
    const expected = createHmacSignature(payload, secret);
    return crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expected, 'hex'));
}

/**
 * Authentication middleware — supports JWT Bearer tokens and API keys.
 */
export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
    // Try JWT Bearer token first
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const decoded = verifyToken(token);
        if (decoded) {
            req.user = { ...decoded, authMethod: 'jwt' };
            next();
            return;
        }
    }

    // Try API key
    const apiKey = req.headers['x-api-key'] as string;
    if (apiKey) {
        const keyData = validateApiKey(apiKey);
        if (keyData) {
            req.user = { ...keyData, authMethod: 'api_key' };
            next();
            return;
        }
    }

    res.status(401).json({
        error: 'Unauthorized',
        message: 'Valid JWT token or API key required',
        hint: 'Use Authorization: Bearer <token> or x-api-key: <key>',
    });
}

/**
 * Admin-only middleware — must be used AFTER authMiddleware.
 */
export function adminMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
    if (!req.user?.permissions.includes('admin')) {
        res.status(403).json({
            error: 'Forbidden',
            message: 'Admin permissions required',
        });
        return;
    }
    next();
}
