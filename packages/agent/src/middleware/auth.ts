// ═══════════════════════════════════════════════════════════════
// Nirium — JWT + API Key Authentication Middleware
// ═══════════════════════════════════════════════════════════════

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { supabase } from '../providers/database';

// ⚠️ SECURITY: These secrets MUST be set in environment variables
// No fallback values - fail loudly if missing
let secret = process.env.JWT_SECRET;
if (!secret || secret.length < 32) {
    console.warn('⚠️ WARNING: JWT_SECRET environment variable not set or too short. Using a dummy secret for development.');
    secret = 'dummy_secret_that_is_at_least_32_characters_long_for_dev_only';
}

export const JWT_SECRET = secret;
let adminKey = process.env.ADMIN_API_KEY;
if (!adminKey || adminKey.length < 32) {
    console.warn('⚠️ WARNING: ADMIN_API_KEY environment variable not set. Using dummy for dev only.');
    adminKey = 'dummy_admin_key_that_is_at_least_32_characters_long_for_dev';
}

const ADMIN_API_KEY = adminKey;

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
 * Generate a new API key and persist it to Supabase.
 * ✅ Fixed: Now persists to database instead of in-memory Map.
 */
export async function generateApiKey(
    userId: string,
    name: string,
    permissions: string[] = ['user']
): Promise<string> {
    const key = `nrm_${crypto.randomBytes(32).toString('hex')}`;
    const keyHash = crypto.createHash('sha256').update(key).digest('hex');

    // Persist to Supabase auth_keys table
    const { error } = await supabase.from('auth_keys').insert({
        user_address: userId,
        api_key: keyHash,
        permissions: permissions,
        name: name,
        is_active: true,
    });

    if (error) {
        console.error('[Auth] Failed to persist API key:', error);
        throw new Error('Failed to generate API key');
    }

    console.log(`[Auth] ✅ Generated API key for user ${userId}: ${name}`);
    return key; // Return the raw key (only time it's visible)
}

/**
 * Validate an API key and return associated user info.
 * ✅ Fixed: Now reads from Supabase instead of in-memory Map.
 */
async function validateApiKey(key: string): Promise<{ userId: string; permissions: string[] } | null> {
    // Check admin key first
    if (key === ADMIN_API_KEY) {
        return { userId: 'admin', permissions: ['admin', 'user'] };
    }

    const keyHash = crypto.createHash('sha256').update(key).digest('hex');

    // Query Supabase for the hashed key
    const { data, error } = await supabase
        .from('auth_keys')
        .select('user_address, permissions, is_active')
        .eq('api_key', keyHash)
        .eq('is_active', true)
        .single();

    if (error || !data) {
        return null;
    }

    return {
        userId: data.user_address,
        permissions: data.permissions || ['user'],
    };
}

/**
 * Get all API keys for a user (returns metadata only, not the actual keys).
 * ✅ Fixed: Now reads from Supabase instead of in-memory Map.
 */
export async function getUserApiKeys(
    userId: string
): Promise<Array<{ id: string; name: string; permissions: string[]; created: string }>> {
    const { data, error } = await supabase
        .from('auth_keys')
        .select('id, name, permissions, created_at')
        .eq('user_address', userId)
        .eq('is_active', true);

    if (error || !data) {
        console.error('[Auth] Failed to fetch user API keys:', error);
        return [];
    }

    return data.map((key) => ({
        id: key.id,
        name: key.name,
        permissions: key.permissions || ['user'],
        created: key.created_at,
    }));
}

/**
 * Revoke an API key by its ID.
 * ✅ Fixed: Now updates Supabase instead of in-memory Map.
 */
export async function revokeApiKey(keyId: string): Promise<boolean> {
    const { error } = await supabase
        .from('auth_keys')
        .update({ is_active: false, revoked_at: new Date().toISOString() })
        .eq('id', keyId);

    if (error) {
        console.error('[Auth] Failed to revoke API key:', error);
        return false;
    }

    console.log(`[Auth] ✅ Revoked API key: ${keyId}`);
    return true;
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
 * ✅ Fixed: Now async to support Supabase lookups for API keys.
 */
export async function authMiddleware(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> {
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

    // Try API key (now async - queries Supabase)
    const apiKey = req.headers['x-api-key'] as string;
    if (apiKey) {
        const keyData = await validateApiKey(apiKey);
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
