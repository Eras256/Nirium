// ═══════════════════════════════════════════════════════════════
// Nirium — Multi-Tier Authentication & Sandbox System
// ═══════════════════════════════════════════════════════════════
//
// Features:
// - JWT Tokens (short-lived, web apps)
// - API Keys (long-lived, integrations)
// - Sandbox Accounts (institutional testing with quotas)
// - Wallet Signature Verification (Stellar native)
// - Fallback: Works without Supabase using in-memory store
//
// ═══════════════════════════════════════════════════════════════

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// Try to import Supabase, but don't fail if unavailable
let supabase: any = null;
let SUPABASE_AVAILABLE = false;
try {
    const db = await import('../providers/database.js');
    supabase = db.supabase;
    SUPABASE_AVAILABLE = process.env.SUPABASE_URL ? true : false;
    console.log(`✅ Supabase ${SUPABASE_AVAILABLE ? 'connected' : 'not configured'}`);
} catch (error) {
    console.warn('⚠️ Supabase not available, using in-memory fallback');
}

// ⚠️ SECURITY: These secrets MUST be set in environment variables
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

let secret = process.env.JWT_SECRET;
if (!secret || secret.length < 32) {
    if (IS_PRODUCTION) {
        console.error('FATAL: JWT_SECRET environment variable not set or too short in production. Exiting.');
        process.exit(1);
    }
    console.warn('⚠️ WARNING: JWT_SECRET not set — using ephemeral dev secret. DO NOT use in production.');
    secret = crypto.randomBytes(32).toString('hex');
}

export const JWT_SECRET = secret;

let adminKey = process.env.ADMIN_API_KEY;
if (!adminKey || adminKey.length < 32) {
    if (IS_PRODUCTION) {
        console.error('FATAL: ADMIN_API_KEY environment variable not set in production. Exiting.');
        process.exit(1);
    }
    console.warn('⚠️ WARNING: ADMIN_API_KEY not set — using ephemeral dev key. DO NOT use in production.');
    adminKey = crypto.randomBytes(32).toString('hex');
}

const ADMIN_API_KEY = adminKey;

// ═══════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════

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

interface ApiKeyData {
    id: string;
    userId: string;
    keyHash: string;
    name: string;
    permissions: string[];
    tier: UserTier;
    isActive: boolean;
    createdAt: string;
    expiresAt?: string;
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

// ═══════════════════════════════════════════════════════════════
// IN-MEMORY FALLBACK STORES
// ═══════════════════════════════════════════════════════════════

const apiKeysMemory = new Map<string, ApiKeyData>();
const sandboxAccountsMemory = new Map<string, SandboxAccount>();
const usageTracking = new Map<string, { requests: number; lastReset: number; dailyRequests: number }>();

// AUTH-MEMLEAK-01: Clean up expired usageTracking entries every 5 minutes
// to prevent unbounded memory growth with many unique users.
setInterval(() => {
    const now = Date.now();
    const DAY_MS = 24 * 60 * 60 * 1000;
    for (const [userId, entry] of usageTracking.entries()) {
        if (now - entry.lastReset > DAY_MS * 2) {
            usageTracking.delete(userId);
        }
    }
}, 5 * 60 * 1000);

// ═══════════════════════════════════════════════════════════════
// TIER CONFIGURATIONS & QUOTAS
// ═══════════════════════════════════════════════════════════════

export const TIER_QUOTAS: Record<UserTier, { requestsPerMinute: number; requestsPerDay: number; maxStrategiesPerDay: number }> = {
    free: {
        requestsPerMinute: 10,
        requestsPerDay: 100,
        maxStrategiesPerDay: 5,
    },
    sandbox: {
        requestsPerMinute: 60,
        requestsPerDay: 1000,
        maxStrategiesPerDay: 50,
    },
    institutional: {
        requestsPerMinute: 300,
        requestsPerDay: 10000,
        maxStrategiesPerDay: 500,
    },
    enterprise: {
        requestsPerMinute: 1000,
        requestsPerDay: 100000,
        maxStrategiesPerDay: 10000,
    },
};

// ═══════════════════════════════════════════════════════════════
// USAGE TRACKING & RATE LIMITING
// ═══════════════════════════════════════════════════════════════
// Implements a sliding-window rate limiter with BOTH:
//   1. Per-minute enforcement (requestsPerMinute quota)
//   2. Per-day enforcement (requestsPerDay quota)
// Fix: Previous version only enforced daily quotas. Per-minute
// enforcement was tracked but never checked (OWASP API4 gap).

interface UsageEntry {
    requests: number;
    lastReset: number;
    dailyRequests: number;
    // Sliding window for per-minute tracking
    minuteWindow: number[];    // timestamps of requests in last 60s
}

function checkQuota(userId: string, quotas: typeof TIER_QUOTAS.free): boolean {
    const now = Date.now();
    const MINUTE_MS = 60 * 1000;
    const DAY_MS = 24 * 60 * 60 * 1000;

    const usage: UsageEntry = usageTracking.get(userId) as UsageEntry || {
        requests: 0,
        lastReset: now,
        dailyRequests: 0,
        minuteWindow: [],
    };

    // Ensure minuteWindow exists (backward compat with old entries)
    if (!usage.minuteWindow) usage.minuteWindow = [];

    // Reset daily counter (every 24 hours)
    if (now - usage.lastReset > DAY_MS) {
        usage.dailyRequests = 0;
        usage.lastReset = now;
    }

    // Slide the per-minute window — keep only timestamps within last 60s
    usage.minuteWindow = usage.minuteWindow.filter(ts => now - ts < MINUTE_MS);

    // ── Check per-minute limit ──
    if (usage.minuteWindow.length >= quotas.requestsPerMinute) {
        usageTracking.set(userId, usage);
        return false; // 429 — per-minute quota exhausted
    }

    // ── Check per-day limit ──
    if (usage.dailyRequests >= quotas.requestsPerDay) {
        usageTracking.set(userId, usage);
        return false; // 429 — daily quota exhausted
    }

    // Record this request
    usage.minuteWindow.push(now);
    usage.requests++;
    usage.dailyRequests++;
    usageTracking.set(userId, usage);
    return true;
}

export function getUsageStats(userId: string) {
    const now = Date.now();
    const MINUTE_MS = 60 * 1000;
    const entry = usageTracking.get(userId) as UsageEntry | undefined;
    if (!entry) return { requests: 0, lastReset: now, dailyRequests: 0, requestsThisMinute: 0 };
    const requestsThisMinute = (entry.minuteWindow || []).filter(ts => now - ts < MINUTE_MS).length;
    return { ...entry, requestsThisMinute };
}

export function resetUsageStats(userId: string) {
    usageTracking.delete(userId);
}

// ═══════════════════════════════════════════════════════════════
// JWT TOKEN GENERATION & VERIFICATION
// ═══════════════════════════════════════════════════════════════

export function generateToken(
    userId: string,
    permissions: string[] = ['user'],
    tier: UserTier = 'free'
): string {
    return jwt.sign(
        {
            userId,
            permissions,
            tier,
            quotas: TIER_QUOTAS[tier],
        },
        JWT_SECRET,
        { expiresIn: '1h' }  // AUTH-JWT-TIER-01: 1h expiry limits window if tier is downgraded
    );
}

export function verifyToken(token: string): { userId: string; permissions: string[]; tier: UserTier; quotas?: typeof TIER_QUOTAS.free } | null {
    try {
        // JWT-ALG-01: Explicitly lock to HS256 to prevent alg:none / RS256 confusion attacks.
        // Without this, a crafted token with "alg":"none" could bypass signature verification
        // on older jsonwebtoken versions, or RS256 confusion could allow public-key forgery.
        const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] }) as {
            userId: string;
            permissions: string[];
            tier: UserTier;
            quotas?: typeof TIER_QUOTAS.free;
        };
        return decoded;
    } catch {
        return null;
    }
}

// ═══════════════════════════════════════════════════════════════
// API KEY MANAGEMENT
// ═══════════════════════════════════════════════════════════════

export async function generateApiKey(
    userId: string,
    name: string,
    permissions: string[] = ['user'],
    tier: UserTier = 'free',
    durationDays?: number
): Promise<string> {
    const tierPrefix = tier === 'institutional' ? 'inst' : tier === 'sandbox' ? 'sbox' : tier === 'enterprise' ? 'ent' : 'free';
    const key = `sk_${tierPrefix}_${crypto.randomBytes(32).toString('hex')}`;
    const keyHash = crypto.createHash('sha256').update(key).digest('hex');
    const expiresAt = durationDays
        ? new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString()
        : undefined;

    const keyData: ApiKeyData = {
        id: crypto.randomBytes(16).toString('hex'),
        userId,
        keyHash,
        name,
        permissions,
        tier,
        isActive: true,
        createdAt: new Date().toISOString(),
        expiresAt,
    };

    // Try Supabase first, fallback to memory
    if (SUPABASE_AVAILABLE && supabase) {
        try {
            const { error } = await supabase.from('auth_keys').insert({
                id: keyData.id,
                user_address: userId,
                api_key: keyHash,
                permissions: permissions,
                name: name,
                tier: tier,
                is_active: true,
                expires_at: expiresAt,
            });

            if (error) {
                console.error('[Auth] Supabase insert failed, using memory fallback:', error);
                apiKeysMemory.set(keyHash, keyData);
            }
        } catch (error) {
            console.error('[Auth] Supabase error, using memory fallback:', error);
            apiKeysMemory.set(keyHash, keyData);
        }
    } else {
        apiKeysMemory.set(keyHash, keyData);
    }

    console.log(`[Auth] ✅ Generated ${tier} API key for user ${userId}: ${name}`);
    return key; // Return the raw key (only time it's visible)
}

async function validateApiKey(key: string): Promise<{ userId: string; permissions: string[]; tier: UserTier } | null> {
    // ═══ SECURITY FIX: Timing-Safe Admin Key Comparison (CWE-208) ═══
    // Using crypto.timingSafeEqual prevents timing side-channel attacks
    // that could leak the admin key length or prefix via response time differences.
    try {
        const keyBuf = Buffer.from(key);
        const adminBuf = Buffer.from(ADMIN_API_KEY);
        if (keyBuf.length === adminBuf.length && crypto.timingSafeEqual(keyBuf, adminBuf)) {
            return { userId: 'admin', permissions: ['admin', 'user'], tier: 'enterprise' };
        }
    } catch {
        // Buffer comparison failed (different lengths handled above) — not admin
    }

    const keyHash = crypto.createHash('sha256').update(key).digest('hex');

    // Try Supabase first
    if (SUPABASE_AVAILABLE && supabase) {
        try {
            const { data, error } = await supabase
                .from('auth_keys')
                .select('user_address, permissions, tier, is_active, expires_at')
                .eq('api_key', keyHash)
                .eq('is_active', true)
                .single();

            if (!error && data) {
                // Check expiration
                if (data.expires_at && new Date(data.expires_at) < new Date()) {
                    return null;
                }
                return {
                    userId: data.user_address,
                    permissions: data.permissions || ['user'],
                    tier: data.tier || 'free',
                };
            }
        } catch (error) {
            console.error('[Auth] Supabase validation error, trying memory fallback:', error);
        }
    }

    // Fallback to in-memory store
    const keyData = apiKeysMemory.get(keyHash);
    if (keyData && keyData.isActive) {
        // Check expiration
        if (keyData.expiresAt && new Date(keyData.expiresAt) < new Date()) {
            return null;
        }
        return {
            userId: keyData.userId,
            permissions: keyData.permissions,
            tier: keyData.tier,
        };
    }

    return null;
}

export async function getUserApiKeys(
    userId: string
): Promise<Array<{ id: string; name: string; permissions: string[]; tier: UserTier; created: string }>> {
    // Try Supabase first
    if (SUPABASE_AVAILABLE && supabase) {
        try {
            const { data, error } = await supabase
                .from('auth_keys')
                .select('id, name, permissions, tier, created_at')
                .eq('user_address', userId)
                .eq('is_active', true);

            if (!error && data) {
                return data.map((key: any) => ({
                    id: key.id,
                    name: key.name,
                    permissions: key.permissions || ['user'],
                    tier: key.tier || 'free',
                    created: key.created_at,
                }));
            }
        } catch (error) {
            console.error('[Auth] Supabase query error:', error);
        }
    }

    // Fallback to in-memory store
    return Array.from(apiKeysMemory.values())
        .filter((k) => k.userId === userId && k.isActive)
        .map((k) => ({
            id: k.id,
            name: k.name,
            permissions: k.permissions,
            tier: k.tier,
            created: k.createdAt,
        }));
}

export async function revokeApiKey(keyId: string): Promise<boolean> {
    // Try Supabase first
    if (SUPABASE_AVAILABLE && supabase) {
        try {
            const { error } = await supabase
                .from('auth_keys')
                .update({ is_active: false, revoked_at: new Date().toISOString() })
                .eq('id', keyId);

            if (!error) {
                console.log(`[Auth] ✅ Revoked API key: ${keyId}`);
                return true;
            }
        } catch (error) {
            console.error('[Auth] Supabase revoke error:', error);
        }
    }

    // Fallback to in-memory store
    for (const [hash, keyData] of apiKeysMemory.entries()) {
        if (keyData.id === keyId) {
            keyData.isActive = false;
            apiKeysMemory.set(hash, keyData);
            console.log(`[Auth] ✅ Revoked API key (memory): ${keyId}`);
            return true;
        }
    }

    return false;
}

// ═══════════════════════════════════════════════════════════════
// SANDBOX ACCOUNT MANAGEMENT (Institutional Clients)
// ═══════════════════════════════════════════════════════════════

export async function createSandboxAccount(
    companyName: string,
    contactEmail: string,
    walletAddress: string,
    tier: UserTier = 'sandbox',
    durationDays: number = 90
): Promise<SandboxAccount> {
    const id = crypto.randomBytes(16).toString('hex');
    const apiKey = await generateApiKey(
        walletAddress,
        `${companyName} Sandbox`,
        ['user', 'sandbox'],
        tier,
        durationDays
    );

    const expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();
    const createdAt = new Date().toISOString();

    const account: SandboxAccount = {
        id,
        companyName,
        contactEmail,
        walletAddress,
        apiKey,
        tier,
        quotas: TIER_QUOTAS[tier],
        createdAt,
        expiresAt,
        isActive: true,
    };

    // Persist to Supabase first
    if (SUPABASE_AVAILABLE && supabase) {
        try {
            const apiKeyHash = crypto.createHash('sha256').update(apiKey).digest('hex');
            const { error } = await supabase.from('sandbox_accounts').insert({
                id,
                company_name: companyName,
                contact_email: contactEmail,
                wallet_address: walletAddress,
                api_key_hash: apiKeyHash,
                tier,
                quotas: TIER_QUOTAS[tier],
                is_active: true,
                expires_at: expiresAt,
                created_at: createdAt,
            });

            if (error) {
                console.error('[Sandbox] Supabase insert error, using memory fallback:', error.message);
                sandboxAccountsMemory.set(id, account);
            } else {
                console.log(`[Sandbox] ✅ Created ${tier} account for ${companyName} (Supabase)`);
            }
        } catch (err) {
            console.error('[Sandbox] Supabase unavailable, using memory fallback:', err);
            sandboxAccountsMemory.set(id, account);
        }
    } else {
        sandboxAccountsMemory.set(id, account);
        console.log(`[Sandbox] ✅ Created ${tier} account for ${companyName} (memory)`);
    }

    return account;
}

export async function getSandboxAccount(apiKey: string): Promise<SandboxAccount | null> {
    // Try Supabase first
    if (SUPABASE_AVAILABLE && supabase) {
        try {
            const apiKeyHash = crypto.createHash('sha256').update(apiKey).digest('hex');
            const { data, error } = await supabase
                .from('sandbox_accounts')
                .select('id, company_name, contact_email, wallet_address, tier, quotas, is_active, expires_at, created_at')
                .eq('api_key_hash', apiKeyHash)
                .eq('is_active', true)
                .single();

            if (!error && data) {
                if (new Date(data.expires_at) < new Date()) return null;
                return {
                    id: data.id,
                    companyName: data.company_name,
                    contactEmail: data.contact_email,
                    walletAddress: data.wallet_address,
                    apiKey,
                    tier: data.tier,
                    quotas: data.quotas,
                    createdAt: data.created_at,
                    expiresAt: data.expires_at,
                    isActive: true,
                };
            }
        } catch { /* fallback below */ }
    }

    // Memory fallback
    for (const account of sandboxAccountsMemory.values()) {
        if (account.apiKey === apiKey && account.isActive) {
            if (new Date(account.expiresAt) < new Date()) {
                account.isActive = false;
                return null;
            }
            return account;
        }
    }
    return null;
}

export async function listSandboxAccounts(): Promise<SandboxAccount[]> {
    if (SUPABASE_AVAILABLE && supabase) {
        try {
            const { data, error } = await supabase
                .from('sandbox_accounts')
                .select('id, company_name, contact_email, wallet_address, tier, quotas, is_active, expires_at, created_at')
                .order('created_at', { ascending: false });

            if (!error && data) {
                return data.map((row: any) => ({
                    id: row.id,
                    companyName: row.company_name,
                    contactEmail: row.contact_email,
                    walletAddress: row.wallet_address,
                    apiKey: '[hidden]',
                    tier: row.tier,
                    quotas: row.quotas,
                    createdAt: row.created_at,
                    expiresAt: row.expires_at,
                    isActive: row.is_active,
                }));
            }
        } catch { /* fallback */ }
    }
    return Array.from(sandboxAccountsMemory.values());
}

export async function revokeSandboxAccount(id: string): Promise<boolean> {
    if (SUPABASE_AVAILABLE && supabase) {
        try {
            const { error } = await supabase
                .from('sandbox_accounts')
                .update({ is_active: false })
                .eq('id', id);

            if (!error) {
                console.log(`[Sandbox] ❌ Revoked sandbox account: ${id} (Supabase)`);
                return true;
            }
        } catch { /* fallback */ }
    }

    const account = sandboxAccountsMemory.get(id);
    if (account) {
        account.isActive = false;
        console.log(`[Sandbox] ❌ Revoked sandbox account: ${account.companyName} (memory)`);
        return true;
    }
    return false;
}

// ═══════════════════════════════════════════════════════════════
// HMAC SIGNATURES (for webhooks)
// ═══════════════════════════════════════════════════════════════

export function createHmacSignature(payload: string, secret: string): string {
    return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

export function verifyHmacSignature(payload: string, signature: string, secret: string): boolean {
    const expected = createHmacSignature(payload, secret);
    return crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expected, 'hex'));
}

// ═══════════════════════════════════════════════════════════════
// AUTHENTICATION MIDDLEWARE
// ═══════════════════════════════════════════════════════════════

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
            // Check quota
            if (!checkQuota(decoded.userId, decoded.quotas || TIER_QUOTAS.free)) {
                res.status(429).json({
                    error: 'Rate limit exceeded',
                    tier: decoded.tier,
                    quotas: decoded.quotas || TIER_QUOTAS.free,
                });
                return;
            }

            req.user = {
                userId: decoded.userId,
                permissions: decoded.permissions,
                authMethod: 'jwt',
                tier: decoded.tier,
                quotas: decoded.quotas,
            };
            next();
            return;
        }
    }

    // Try API key
    const apiKey = req.headers['x-api-key'] as string;
    if (apiKey) {
        const keyData = await validateApiKey(apiKey);
        if (keyData) {
            // Check quota
            if (!checkQuota(keyData.userId, TIER_QUOTAS[keyData.tier])) {
                res.status(429).json({
                    error: 'Rate limit exceeded',
                    tier: keyData.tier,
                    quotas: TIER_QUOTAS[keyData.tier],
                });
                return;
            }

            req.user = {
                userId: keyData.userId,
                permissions: keyData.permissions,
                authMethod: 'api_key',
                tier: keyData.tier,
                quotas: TIER_QUOTAS[keyData.tier],
            };
            next();
            return;
        }
    }

    res.status(401).json({
        error: 'Unauthorized',
        message: 'Valid JWT token or API key required',
        hint: 'Use Authorization: Bearer <token> or x-api-key: <key>',
        docs: 'https://nirium.xyz/docs/authentication',
    });
}

// ═══════════════════════════════════════════════════════════════
// ROLE-BASED MIDDLEWARE
// ═══════════════════════════════════════════════════════════════

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

export function sandboxMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
    const hasSandboxAccess = req.user?.permissions.includes('sandbox') ||
                             req.user?.permissions.includes('admin') ||
                             req.user?.tier === 'institutional' ||
                             req.user?.tier === 'enterprise';

    if (!hasSandboxAccess) {
        res.status(403).json({
            error: 'Forbidden',
            message: 'Sandbox, institutional, or enterprise access required',
            hint: 'Request a sandbox account at https://nirium.xyz/sandbox',
        });
        return;
    }
    next();
}
