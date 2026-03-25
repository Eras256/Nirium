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
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
// Try to import Supabase, but don't fail if unavailable
let supabase = null;
let SUPABASE_AVAILABLE = false;
try {
    const db = await import('../providers/database.js');
    supabase = db.supabase;
    SUPABASE_AVAILABLE = process.env.SUPABASE_URL ? true : false;
    console.log(`✅ Supabase ${SUPABASE_AVAILABLE ? 'connected' : 'not configured'}`);
}
catch (error) {
    console.warn('⚠️ Supabase not available, using in-memory fallback');
}
// ⚠️ SECURITY: These secrets MUST be set in environment variables
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
// ═══════════════════════════════════════════════════════════════
// IN-MEMORY FALLBACK STORES
// ═══════════════════════════════════════════════════════════════
const apiKeysMemory = new Map();
const sandboxAccountsMemory = new Map();
const usageTracking = new Map();
// ═══════════════════════════════════════════════════════════════
// TIER CONFIGURATIONS & QUOTAS
// ═══════════════════════════════════════════════════════════════
export const TIER_QUOTAS = {
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
function checkQuota(userId, quotas) {
    const now = Date.now();
    const usage = usageTracking.get(userId) || { requests: 0, lastReset: now, dailyRequests: 0 };
    // Reset daily counter (every 24 hours)
    if (now - usage.lastReset > 24 * 60 * 60 * 1000) {
        usage.dailyRequests = 0;
        usage.lastReset = now;
    }
    // Check daily limit
    if (usage.dailyRequests >= quotas.requestsPerDay) {
        return false;
    }
    usage.requests++;
    usage.dailyRequests++;
    usageTracking.set(userId, usage);
    return true;
}
export function getUsageStats(userId) {
    return usageTracking.get(userId) || { requests: 0, lastReset: Date.now(), dailyRequests: 0 };
}
export function resetUsageStats(userId) {
    usageTracking.delete(userId);
}
// ═══════════════════════════════════════════════════════════════
// JWT TOKEN GENERATION & VERIFICATION
// ═══════════════════════════════════════════════════════════════
export function generateToken(userId, permissions = ['user'], tier = 'free') {
    return jwt.sign({
        userId,
        permissions,
        tier,
        quotas: TIER_QUOTAS[tier],
    }, JWT_SECRET, { expiresIn: '24h' });
}
export function verifyToken(token) {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded;
    }
    catch {
        return null;
    }
}
// ═══════════════════════════════════════════════════════════════
// API KEY MANAGEMENT
// ═══════════════════════════════════════════════════════════════
export async function generateApiKey(userId, name, permissions = ['user'], tier = 'free', durationDays) {
    const key = `nrm_${tier.substring(0, 3)}_${crypto.randomBytes(32).toString('hex')}`;
    const keyHash = crypto.createHash('sha256').update(key).digest('hex');
    const expiresAt = durationDays
        ? new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString()
        : undefined;
    const keyData = {
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
        }
        catch (error) {
            console.error('[Auth] Supabase error, using memory fallback:', error);
            apiKeysMemory.set(keyHash, keyData);
        }
    }
    else {
        apiKeysMemory.set(keyHash, keyData);
    }
    console.log(`[Auth] ✅ Generated ${tier} API key for user ${userId}: ${name}`);
    return key; // Return the raw key (only time it's visible)
}
async function validateApiKey(key) {
    // Check admin key first
    if (key === ADMIN_API_KEY) {
        return { userId: 'admin', permissions: ['admin', 'user'], tier: 'enterprise' };
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
        }
        catch (error) {
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
export async function getUserApiKeys(userId) {
    // Try Supabase first
    if (SUPABASE_AVAILABLE && supabase) {
        try {
            const { data, error } = await supabase
                .from('auth_keys')
                .select('id, name, permissions, tier, created_at')
                .eq('user_address', userId)
                .eq('is_active', true);
            if (!error && data) {
                return data.map((key) => ({
                    id: key.id,
                    name: key.name,
                    permissions: key.permissions || ['user'],
                    tier: key.tier || 'free',
                    created: key.created_at,
                }));
            }
        }
        catch (error) {
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
export async function revokeApiKey(keyId) {
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
        }
        catch (error) {
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
export async function createSandboxAccount(companyName, contactEmail, walletAddress, tier = 'sandbox', durationDays = 30) {
    const id = crypto.randomBytes(16).toString('hex');
    const apiKey = await generateApiKey(walletAddress, `${companyName} Sandbox`, ['user', 'sandbox'], tier, durationDays);
    const account = {
        id,
        companyName,
        contactEmail,
        walletAddress,
        apiKey,
        tier,
        quotas: TIER_QUOTAS[tier],
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true,
    };
    sandboxAccountsMemory.set(id, account);
    console.log(`[Sandbox] ✅ Created ${tier} account for ${companyName} (${contactEmail})`);
    return account;
}
export function getSandboxAccount(apiKey) {
    for (const account of sandboxAccountsMemory.values()) {
        if (account.apiKey === apiKey && account.isActive) {
            // Check expiration
            if (new Date(account.expiresAt) < new Date()) {
                account.isActive = false;
                return null;
            }
            return account;
        }
    }
    return null;
}
export function listSandboxAccounts() {
    return Array.from(sandboxAccountsMemory.values());
}
export function revokeSandboxAccount(id) {
    const account = sandboxAccountsMemory.get(id);
    if (account) {
        account.isActive = false;
        console.log(`[Sandbox] ❌ Revoked sandbox account: ${account.companyName}`);
        return true;
    }
    return false;
}
// ═══════════════════════════════════════════════════════════════
// HMAC SIGNATURES (for webhooks)
// ═══════════════════════════════════════════════════════════════
export function createHmacSignature(payload, secret) {
    return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}
export function verifyHmacSignature(payload, signature, secret) {
    const expected = createHmacSignature(payload, secret);
    return crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expected, 'hex'));
}
// ═══════════════════════════════════════════════════════════════
// AUTHENTICATION MIDDLEWARE
// ═══════════════════════════════════════════════════════════════
export async function authMiddleware(req, res, next) {
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
    const apiKey = req.headers['x-api-key'];
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
        docs: 'https://nirium.dev/docs/authentication',
    });
}
// ═══════════════════════════════════════════════════════════════
// ROLE-BASED MIDDLEWARE
// ═══════════════════════════════════════════════════════════════
export function adminMiddleware(req, res, next) {
    if (!req.user?.permissions.includes('admin')) {
        res.status(403).json({
            error: 'Forbidden',
            message: 'Admin permissions required',
        });
        return;
    }
    next();
}
export function sandboxMiddleware(req, res, next) {
    const hasSandboxAccess = req.user?.permissions.includes('sandbox') ||
        req.user?.permissions.includes('admin') ||
        req.user?.tier === 'institutional' ||
        req.user?.tier === 'enterprise';
    if (!hasSandboxAccess) {
        res.status(403).json({
            error: 'Forbidden',
            message: 'Sandbox, institutional, or enterprise access required',
            hint: 'Request a sandbox account at https://nirium.dev/sandbox',
        });
        return;
    }
    next();
}
//# sourceMappingURL=auth.js.map