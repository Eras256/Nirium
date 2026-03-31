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
    const tierPrefix = tier === 'institutional' ? 'inst' : tier === 'sandbox' ? 'sbox' : tier === 'enterprise' ? 'ent' : 'free';
    const key = `sk_${tierPrefix}_${crypto.randomBytes(32).toString('hex')}`;
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
export async function createSandboxAccount(companyName, contactEmail, walletAddress, tier = 'sandbox', durationDays = 90) {
    const id = crypto.randomBytes(16).toString('hex');
    const apiKey = await generateApiKey(walletAddress, `${companyName} Sandbox`, ['user', 'sandbox'], tier, durationDays);
    const expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();
    const createdAt = new Date().toISOString();
    const account = {
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
            }
            else {
                console.log(`[Sandbox] ✅ Created ${tier} account for ${companyName} (Supabase)`);
            }
        }
        catch (err) {
            console.error('[Sandbox] Supabase unavailable, using memory fallback:', err);
            sandboxAccountsMemory.set(id, account);
        }
    }
    else {
        sandboxAccountsMemory.set(id, account);
        console.log(`[Sandbox] ✅ Created ${tier} account for ${companyName} (memory)`);
    }
    return account;
}
export async function getSandboxAccount(apiKey) {
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
                if (new Date(data.expires_at) < new Date())
                    return null;
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
        }
        catch { /* fallback below */ }
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
export async function listSandboxAccounts() {
    if (SUPABASE_AVAILABLE && supabase) {
        try {
            const { data, error } = await supabase
                .from('sandbox_accounts')
                .select('id, company_name, contact_email, wallet_address, tier, quotas, is_active, expires_at, created_at')
                .order('created_at', { ascending: false });
            if (!error && data) {
                return data.map((row) => ({
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
        }
        catch { /* fallback */ }
    }
    return Array.from(sandboxAccountsMemory.values());
}
export async function revokeSandboxAccount(id) {
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
        }
        catch { /* fallback */ }
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
        docs: 'https://nirium.xyz/docs/authentication',
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
            hint: 'Request a sandbox account at https://nirium.xyz/sandbox',
        });
        return;
    }
    next();
}
//# sourceMappingURL=auth.js.map