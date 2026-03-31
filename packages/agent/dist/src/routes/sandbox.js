// ═══════════════════════════════════════════════════════════════
// Nirium Agent — Sandbox & Institutional Endpoints
// ═══════════════════════════════════════════════════════════════
//
// Public endpoints for institutional clients to:
// - Request sandbox accounts
// - Test the API with demo data
// - View quotas and usage
//
// ═══════════════════════════════════════════════════════════════
import { Router } from 'express';
import { createSandboxAccount, listSandboxAccounts, revokeSandboxAccount, getUsageStats, TIER_QUOTAS, authMiddleware, adminMiddleware, sandboxMiddleware, } from '../middleware/index.js';
import { createRateLimiter } from '../middleware/rateLimit.js';
const router = Router();
const sandboxLimiter = createRateLimiter('aggressive');
// ═══════════════════════════════════════════════════════════════
// PUBLIC SANDBOX ENDPOINTS (No Auth Required)
// ═══════════════════════════════════════════════════════════════
/**
 * POST /api/sandbox/request
 * Request a new sandbox account for institutional testing
 */
router.post('/request', sandboxLimiter, async (req, res) => {
    const { companyName, contactEmail, walletAddress, tier, message } = req.body;
    // Validation
    if (!companyName || !contactEmail || !walletAddress) {
        res.status(400).json({
            error: 'Missing required fields',
            required: ['companyName', 'contactEmail', 'walletAddress'],
        });
        return;
    }
    // Sanitize free-text fields: strip HTML tags and limit length to prevent stored XSS
    const sanitize = (s, max) => String(s).replace(/<[^>]*>/g, '').replace(/[<>'"]/g, '').trim().slice(0, max);
    const safeCompanyName = sanitize(companyName, 100);
    const safeMessage = message ? sanitize(message, 500) : undefined;
    if (!safeCompanyName) {
        res.status(400).json({ error: 'companyName contains only invalid characters' });
        return;
    }
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactEmail)) {
        res.status(400).json({ error: 'Invalid email address' });
        return;
    }
    // Wallet address validation (Stellar format)
    if (!/^G[A-Z0-9]{55}$/.test(walletAddress)) {
        res.status(400).json({
            error: 'Invalid Stellar wallet address',
            hint: 'Must start with G and be 56 characters',
        });
        return;
    }
    try {
        // Determine tier (default to sandbox for requests)
        const requestedTier = tier === 'institutional' ? 'institutional' : 'sandbox';
        // Create sandbox account (90 days expiration — consistent with Next.js route)
        const account = await createSandboxAccount(safeCompanyName, contactEmail, walletAddress, requestedTier, 90);
        res.json({
            success: true,
            message: 'Sandbox account created successfully',
            account: {
                id: account.id,
                companyName: account.companyName,
                contactEmail: account.contactEmail,
                walletAddress: account.walletAddress,
                apiKey: account.apiKey, // ⚠️ Only shown once!
                tier: account.tier,
                quotas: account.quotas,
                expiresAt: account.expiresAt,
            },
            warning: '⚠️ Store your API key securely. It will not be shown again.',
            usage: {
                authentication: 'Use header: x-api-key: <your-api-key>',
                documentation: 'https://nirium.xyz/docs/sandbox',
                example: `curl -H "x-api-key: ${account.apiKey}" https://api.nirium.xyz/api/market`,
            },
        });
    }
    catch (error) {
        console.error('[Sandbox] Error creating account:', error);
        res.status(500).json({ error: 'Failed to create sandbox account' });
    }
});
/**
 * GET /api/sandbox/info
 * Public information about sandbox tiers and quotas
 */
router.get('/info', (_req, res) => {
    res.json({
        name: 'Nirium Sandbox Program',
        description: 'Test Nirium Agent API with institutional-grade quotas',
        tiers: {
            sandbox: {
                description: 'For testing and integration development',
                quotas: TIER_QUOTAS.sandbox,
                duration: '90 days',
                cost: 'Free',
            },
            institutional: {
                description: 'For institutional clients and trading firms',
                quotas: TIER_QUOTAS.institutional,
                duration: '90 days',
                cost: 'Contact sales',
            },
            enterprise: {
                description: 'Custom solutions for large-scale operations',
                quotas: TIER_QUOTAS.enterprise,
                duration: 'Custom',
                cost: 'Contact sales',
            },
        },
        features: [
            'Full API access on Stellar testnet',
            'Real-time market data and signals',
            'Strategy execution testing',
            'WebSocket subscriptions',
            'Webhook integrations',
            'Technical support',
        ],
        howToRequest: 'POST /api/sandbox/request',
        documentation: 'https://nirium.xyz/docs/sandbox',
        support: 'sandbox@nirium.xyz',
    });
});
// ═══════════════════════════════════════════════════════════════
// AUTHENTICATED SANDBOX ENDPOINTS
// ═══════════════════════════════════════════════════════════════
/**
 * GET /api/sandbox/status
 * Get current sandbox account status and usage
 */
router.get('/status', authMiddleware, sandboxMiddleware, (req, res) => {
    const authReq = req;
    const usage = getUsageStats(authReq.user.userId);
    res.json({
        account: {
            userId: authReq.user.userId,
            tier: authReq.user.tier,
            permissions: authReq.user.permissions,
        },
        quotas: authReq.user.quotas,
        usage: {
            totalRequests: usage.requests,
            dailyRequests: usage.dailyRequests,
            lastReset: new Date(usage.lastReset).toISOString(),
            remainingToday: (authReq.user.quotas?.requestsPerDay || 0) - usage.dailyRequests,
        },
        limits: {
            requestsPerDay: authReq.user.quotas?.requestsPerDay,
            requestsPerMinute: authReq.user.quotas?.requestsPerMinute,
            maxStrategiesPerDay: authReq.user.quotas?.maxStrategiesPerDay,
        },
    });
});
// ═══════════════════════════════════════════════════════════════
// ADMIN SANDBOX MANAGEMENT
// ═══════════════════════════════════════════════════════════════
/**
 * GET /api/sandbox/accounts
 * List all sandbox accounts (admin only)
 */
router.get('/accounts', authMiddleware, adminMiddleware, async (_req, res) => {
    const accounts = await listSandboxAccounts();
    res.json({
        total: accounts.length,
        accounts: accounts.map(acc => ({
            id: acc.id,
            companyName: acc.companyName,
            contactEmail: acc.contactEmail,
            walletAddress: acc.walletAddress,
            tier: acc.tier,
            quotas: acc.quotas,
            createdAt: acc.createdAt,
            expiresAt: acc.expiresAt,
            isActive: acc.isActive,
        })),
    });
});
/**
 * DELETE /api/sandbox/accounts/:id
 * Revoke a sandbox account (admin only)
 */
router.delete('/accounts/:id', authMiddleware, adminMiddleware, async (req, res) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const revoked = await revokeSandboxAccount(id);
    if (revoked) {
        res.json({ success: true, message: 'Sandbox account revoked' });
    }
    else {
        res.status(404).json({ error: 'Sandbox account not found' });
    }
});
export default router;
//# sourceMappingURL=sandbox.js.map