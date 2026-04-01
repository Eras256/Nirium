// ═══════════════════════════════════════════════════════════════
// Nirium v0.1.0 — Autonomous Agent Backend Server
// ═══════════════════════════════════════════════════════════════
//
// Express server exposing REST API endpoints for:
// - Health & Info
// - Authentication (JWT + API Keys)
// - Strategy Execution (Testnet/Mainnet)
// - Market Data & Autonomous Loop
// - Webhooks (HMAC-signed)
// - WebSocket Subscriptions
// - Skill/Plugin Management
//
// ═══════════════════════════════════════════════════════════════

import express, { Request, Response, Application } from 'express';
import cors from 'cors';
import { createServer } from 'http';
import {
    helmetConfig,
    requestSizeLimit,
    sqlInjectionGuard,
    promptInjectionGuard,
    xdrValidator,
    stellarAddressValidator,
    cryptoCurveValidator,
    rateLimitPerMinute,
} from './middleware/security.js';

import {
    authMiddleware,
    adminMiddleware,
    legalShieldMiddleware,
    generateToken,
    generateApiKey,
    getUserApiKeys,
    revokeApiKey,
    AuthenticatedRequest,
    sandboxMiddleware,
} from './middleware/index.js';
import sandboxRoutes from './routes/sandbox.js';
import publicRoutes from './routes/public.js';
import { createRateLimiter } from './middleware/rateLimit.js';
import {
    initializeWebSocket,
    broadcastLog,
    broadcastSignal,
    createSubscription,
    getUserSubscriptions,
    deleteSubscription,
    getSubscriptionStats,
    getRecentSignals,
    drainLogBatch,
} from './services/subscriptionService.js';
import {
    initializeLoop,
    startLoop,
    stopLoop,
    getLoopStatus,
    performScan,
    getCurrentMarketState,
} from './services/autonomousLoop.js';
import {
    registerWebhook,
    getUserWebhooks,
    deleteWebhook,
    testWebhook,
    dispatchWebhookEvent,
} from './services/webhookService.js';
import * as skillManager from './services/skillManager.js';
import { uploadToIpfs, PINATA_GATEWAY } from './services/ipfsService.js';
import { routeExecution } from './execution/router.js';
import { fetchMarketState, checkHorizonHealth, checkSorobanHealth, NETWORK } from './providers/stellarProvider.js';
import { getLLMProvider, getAvailableProviders, resetProvider } from './providers/llm/index.js';

const PORT = parseInt(process.env.AGENT_PORT || '3001');
const VERSION = '0.1.0';
const startTime = Date.now();

// ═══════════════════════════════════════════════════════════════
// EXPRESS APP SETUP
// ═══════════════════════════════════════════════════════════════

const app: Application = express();

const envOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()) : [];
const ALLOWED_ORIGINS = [...new Set([...envOrigins, 'http://localhost:3000', 'http://localhost:3001', 'https://nirium.xyz', 'https://www.nirium.xyz'])];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (server-to-server, curl, Postman)
        if (!origin) return callback(null, true);
        if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
        callback(new Error('CORS policy: origin not allowed'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
    credentials: true,
}));

app.use(express.json({ limit: '10mb' }));

// ═══════════════════════════════════════════════════════════════
// SECURITY MIDDLEWARE — applied before all route handlers
// ═══════════════════════════════════════════════════════════════

// 1. Harden HTTP response headers
app.use(helmetConfig());

// 2. Block oversized payloads (belt-and-suspenders on top of express.json limit)
app.use(requestSizeLimit(10 * 1024 * 1024)); // 10 MiB

// 3. Block SQL injection in body / query / params
app.use(sqlInjectionGuard());

// 4. Sanitize LLM prompt inputs
app.use(promptInjectionGuard());

// 5. Validate any XDR fields in request bodies
app.use(xdrValidator());

// 6. Validate Stellar G-addresses in request bodies
app.use(stellarAddressValidator());

// 7. Validate Ed25519 signature/key fields (CVE-2026-32323 curve confusion)
app.use(cryptoCurveValidator());

// 8. Per-minute sliding window rate limiter (supplements tier-based daily quotas)
app.use(rateLimitPerMinute(120));

const standardLimiter = createRateLimiter('standard');
const aggressiveLimiter = createRateLimiter('aggressive');

// ═══════════════════════════════════════════════════════════════
// MOUNT ROUTE MODULES
// ═══════════════════════════════════════════════════════════════

app.use('/api/sandbox', sandboxRoutes);
app.use('/api/public', publicRoutes);

// ═══════════════════════════════════════════════════════════════
// PUBLIC ENDPOINTS (No Auth)
// ═══════════════════════════════════════════════════════════════

app.get('/health', (_req: Request, res: Response) => {
    res.json({
        status: 'operational',
        version: VERSION,
        uptime: Math.floor((Date.now() - startTime) / 1000),
        network: NETWORK,
        timestamp: new Date().toISOString(),
    });
});

app.get('/api/info', (_req: Request, res: Response) => {
    res.json({
        name: 'Nirium Agent',
        version: VERSION,
        network: NETWORK,
        documentation: 'https://nirium.xyz/docs',
        endpoints: {
            health: 'GET /health',
            public: {
                demoAuth: 'POST /api/public/demo-auth',
                authenticate: 'POST /api/public/authenticate',
                marketSnapshot: 'GET /api/public/market-snapshot',
                examples: 'GET /api/public/examples',
                quickstart: 'GET /api/public/quickstart',
            },
            sandbox: {
                request: 'POST /api/sandbox/request',
                info: 'GET /api/sandbox/info',
                status: 'GET /api/sandbox/status (auth required)',
                accounts: 'GET /api/sandbox/accounts (admin only)',
            },
            auth: {
                token: 'POST /api/auth/token',
                keys: 'POST|GET|DELETE /api/auth/keys',
            },
            market: {
                data: 'GET /api/market',
                tickers: 'GET /api/tickers',
                stats: 'GET /api/stats/global',
                loop: 'POST /api/loop/start|stop|scan, GET /api/loop/status',
            },
            execution: {
                execute: 'POST /api/execute',
                demo: 'POST /api/execute-demo',
                strategies: 'GET /api/strategies',
            },
            webhooks: 'POST|GET|DELETE /api/webhooks, POST /api/webhooks/:id/test',
            subscriptions: 'POST|GET|DELETE /api/subscriptions, GET /api/subscriptions/stats',
            skills: 'GET|POST|DELETE /api/skills, GET /api/skills/marketplace',
            signals: 'GET /api/signals/recent',
        },
        llm: {
            active: getLLMProvider().name,
            available: getAvailableProviders(),
        },
        quickstart: 'GET /api/public/quickstart',
    });
});

// ═══════════════════════════════════════════════════════════════
// AUTHENTICATION ENDPOINTS
// ═══════════════════════════════════════════════════════════════

app.post('/api/auth/token', standardLimiter, (req: Request, res: Response) => {
    const { walletAddress } = req.body;

    if (!walletAddress) {
        res.status(400).json({ error: 'walletAddress required' });
        return;
    }

    // SECURITY FIX (OWASP API2): Validate Stellar address format before issuing JWT
    if (typeof walletAddress !== 'string' || !/^G[A-Z2-7]{55}$/.test(walletAddress)) {
        res.status(400).json({
            error: 'Invalid Stellar wallet address',
            hint: 'Must be a valid Stellar public key starting with G (56 chars, base32)',
        });
        return;
    }

    // In production: verify the Stellar signature against the public key
    // For now, issue a token for any valid-looking address
    const token = generateToken(walletAddress, ['user'], 'free');

    broadcastLog('info', `[Auth] Token issued for ${walletAddress.substring(0, 12)}...`);

    res.json({
        success: true,
        token,
        expiresIn: '24h',
        userId: walletAddress,
        permissions: ['user'],
        tier: 'free',
    });
});

app.post('/api/auth/keys', authMiddleware as any, async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const { name, tier: requestedTier } = req.body;

    // ═══ SECURITY FIX: Tier Escalation Prevention (OWASP API3) ═══
    // Users cannot self-elevate to a higher tier than their current auth tier.
    // Only admins can issue keys of any tier. Everyone else is capped at their own tier.
    const TIER_RANK: Record<string, number> = { free: 0, sandbox: 1, institutional: 2, enterprise: 3 };
    const callerTier = authReq.user!.tier;
    const isAdmin = authReq.user!.permissions.includes('admin');

    let resolvedTier = (requestedTier as string) || callerTier || 'free';
    if (!isAdmin) {
        const requestedRank = TIER_RANK[resolvedTier] ?? 0;
        const callerRank = TIER_RANK[callerTier] ?? 0;
        if (requestedRank > callerRank) {
            res.status(403).json({
                error: 'Forbidden',
                message: `Cannot create a key with tier '${resolvedTier}' — your current tier is '${callerTier}'.`,
                hint: 'Contact institutional@nirium.xyz to upgrade your account.',
            });
            return;
        }
    }

    // Validate tier is a known value
    const VALID_TIERS = ['free', 'sandbox', 'institutional', 'enterprise'];
    if (!VALID_TIERS.includes(resolvedTier)) {
        res.status(400).json({ error: 'Invalid tier. Must be: free | sandbox | institutional | enterprise' });
        return;
    }

    try {
        const apiKey = await generateApiKey(
            authReq.user!.userId,
            name || 'Default Key',
            ['user'],
            resolvedTier as any
        );

        broadcastLog('info', `[Auth] API key generated for ${authReq.user!.userId} (tier: ${resolvedTier})`);

        res.json({
            success: true,
            apiKey,
            name: name || 'Default Key',
            tier: resolvedTier,
            message: 'Store this key securely — it will not be shown again.',
        });
    } catch (error) {
        console.error('[Auth] Key generation failed:', error);
        res.status(500).json({ error: 'Failed to generate API key' });
    }
});

app.get('/api/auth/keys', authMiddleware as any, async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    try {
        const keys = await getUserApiKeys(authReq.user!.userId);
        res.json({ keys });
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve API keys' });
    }
});

app.delete('/api/auth/keys/:id', authMiddleware as any, async (req: Request, res: Response) => {
    try {
        const revoked = await revokeApiKey(req.params.id as string);
        if (revoked) {
            res.json({ message: 'API key revoked' });
        } else {
            res.status(404).json({ error: 'API key not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to revoke API key' });
    }
});

// ═══════════════════════════════════════════════════════════════
// EXECUTION ENDPOINTS
// ═══════════════════════════════════════════════════════════════

app.post('/api/execute', authMiddleware as any, legalShieldMiddleware as any, aggressiveLimiter, async (req: Request, res: Response) => {
    const { strategy, asset, params } = req.body;

    if (!strategy || !asset) {
        res.status(400).json({ error: 'strategy and asset required' });
        return;
    }

    try {
        broadcastLog('info', `[Execute] Strategy: ${strategy} | Asset: ${asset}`);
        await dispatchWebhookEvent('execution.started', { strategy, asset });

        const result = await routeExecution(strategy, asset, params || {}, broadcastLog);

        if (result.success) {
            await dispatchWebhookEvent('execution.completed', { ...result });
        } else {
            await dispatchWebhookEvent('execution.failed', { ...result });
        }

        res.json(result);
    } catch (error) {
        broadcastLog('error', `[Execute] Error: ${error}`);
        res.status(500).json({ error: String(error) });
    }
});

app.post('/api/execute-demo', standardLimiter, async (req: Request, res: Response) => {
    const { strategy, asset } = req.body;

    if (!strategy) {
        res.status(400).json({ error: 'strategy required' });
        return;
    }

    try {
        const result = await routeExecution(
            strategy,
            asset || 'XLM',
            { amount: 1000, demo: true },
            broadcastLog
        );
        
        // Response Filtering (Audit Fix #3) - Prevent XDR/Soroban metadata leakage 
        res.json({
            success: result.success || true,
            simulated_profit: result.profit || 0,
            gas_consumed: (result as any).gas || 24500, // Simulation estimate if undefined
            message: result.success ? 'Demo execution successful' : 'Demo execution failed'
        });
    } catch (error) {
        res.status(500).json({ error: String(error) });
    }
});

// ═══════════════════════════════════════════════════════════════
// MARKET DATA ENDPOINTS
// ═══════════════════════════════════════════════════════════════

app.get('/api/market', authMiddleware, standardLimiter, async (_req: Request, res: Response) => {
    try {
        const cached = getCurrentMarketState();
        if (cached) {
            res.json(cached);
            return;
        }
        const market = await fetchMarketState();
        res.json(market);
    } catch (error) {
        res.status(500).json({ error: String(error) });
    }
});

app.post('/api/loop/start', authMiddleware as any, legalShieldMiddleware as any, (req: Request, res: Response) => {
    const { config } = req.body;
    const result = startLoop(config);
    res.json(result);
});

app.post('/api/loop/stop', authMiddleware as any, (_req: Request, res: Response) => {
    const result = stopLoop();
    res.json(result);
});

app.get('/api/loop/status', standardLimiter, (_req: Request, res: Response) => {
    const status = getLoopStatus();
    res.json(status);
});

app.post('/api/loop/scan', authMiddleware as any, async (_req: Request, res: Response) => {
    try {
        const market = await performScan();
        res.json({ success: true, marketState: market });
    } catch (error) {
        res.status(500).json({ error: String(error) });
    }
});

// ═══════════════════════════════════════════════════════════════
// WEBHOOK ENDPOINTS
// ═══════════════════════════════════════════════════════════════

app.post('/api/webhooks', authMiddleware as any, async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const { url, events, secret } = req.body;

    if (!url || !events?.length) {
        res.status(400).json({ error: 'url and events[] required' });
        return;
    }

    try {
        const webhook = await registerWebhook(authReq.user!.userId, url, events, secret);
        broadcastLog('info', `[Webhook] Registered for ${events.length} event(s)`);
        res.json(webhook);
    } catch (error) {
        res.status(400).json({ error: String(error) });
    }
});

app.get('/api/webhooks', authMiddleware as any, async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const webhookList = await getUserWebhooks(authReq.user!.userId);
    res.json({ webhooks: webhookList });
});

app.delete('/api/webhooks/:id', authMiddleware as any, async (req: Request, res: Response) => {
    const deleted = await deleteWebhook(req.params.id as string);
    if (deleted) {
        res.json({ message: 'Webhook deleted' });
    } else {
        res.status(404).json({ error: 'Webhook not found' });
    }
});

app.post('/api/webhooks/:id/test', authMiddleware as any, async (req: Request, res: Response) => {
    const result = await testWebhook(req.params.id as string);
    res.json(result);
});

// ═══════════════════════════════════════════════════════════════
// SUBSCRIPTION ENDPOINTS
// ═══════════════════════════════════════════════════════════════

app.post('/api/subscriptions', authMiddleware as any, (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const { filters } = req.body;
    const sub = createSubscription(authReq.user!.userId, filters || {});
    res.json(sub);
});

app.get('/api/subscriptions', authMiddleware as any, (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const subs = getUserSubscriptions(authReq.user!.userId);
    res.json({ subscriptions: subs });
});

app.delete('/api/subscriptions/:id', authMiddleware as any, (req: Request, res: Response) => {
    const deleted = deleteSubscription(req.params.id as string);
    if (deleted) {
        res.json({ message: 'Subscription deleted' });
    } else {
        res.status(404).json({ error: 'Subscription not found' });
    }
});

app.get('/api/subscriptions/stats', standardLimiter, (_req: Request, res: Response) => {
    const stats = getSubscriptionStats();
    res.json(stats);
});

app.get('/api/signals/recent', standardLimiter, (req: Request, res: Response) => {
    const count = Math.min(parseInt(req.query.count as string) || 20, 100);
    const signals = getRecentSignals(count);
    res.json({ signals });
});

// ═══════════════════════════════════════════════════════════════
// MARKET EXTENDED ENDPOINTS
// ═══════════════════════════════════════════════════════════════

app.get('/api/tickers', standardLimiter, async (_req: Request, res: Response) => {
    try {
        const market = getCurrentMarketState() || await fetchMarketState();
        const tickers = (market as any)?.assets?.map((a: any) => ({
            symbol: a.code || a.asset_code,
            price: a.price || a.last_price || null,
            volume24h: a.volume || null,
            change24h: a.change24h || null,
            network: NETWORK,
        })) || [
            { symbol: 'XLM', price: null, volume24h: null, change24h: null, network: NETWORK },
            { symbol: 'USDC', price: null, volume24h: null, change24h: null, network: NETWORK },
        ];
        res.json({ tickers, timestamp: new Date().toISOString(), network: NETWORK });
    } catch (error) {
        res.status(500).json({ error: String(error) });
    }
});

app.get('/api/stats/global', standardLimiter, (_req: Request, res: Response) => {
    const loopStatus = getLoopStatus();
    const subStats = getSubscriptionStats();
    const skills = skillManager.getLoadedSkills();

    res.json({
        protocol: {
            version: VERSION,
            network: NETWORK,
            uptime: Math.floor((Date.now() - startTime) / 1000),
        },
        execution: {
            loopActive: (loopStatus as any)?.running || false,
            totalScans: (loopStatus as any)?.totalScans || 0,
        },
        connectivity: {
            websocketClients: subStats.connectedClients,
            activeSubscriptions: subStats.totalSubscriptions,
        },
        plugins: {
            loaded: skills.length,
        },
        timestamp: new Date().toISOString(),
    });
});

app.get('/api/strategies', standardLimiter, (_req: Request, res: Response) => {
    const skills = skillManager.getLoadedSkills();
    const strategies = skills.map((s: any) => ({
        id: s.slug || s.id,
        name: s.name,
        description: s.description,
        category: s.category || 'general',
        assets: s.supportedAssets || ['XLM', 'USDC'],
        riskLevel: s.riskLevel || 'medium',
        isBuiltIn: s.isBuiltIn || false,
        enabled: s.isLoaded !== false,
    }));

    res.json({ strategies, total: strategies.length, network: NETWORK });
});

// ═══════════════════════════════════════════════════════════════
// SKILL/PLUGIN ENDPOINTS
// ═══════════════════════════════════════════════════════════════

app.get('/api/skills', standardLimiter, (_req: Request, res: Response) => {
    const skills = skillManager.getLoadedSkills();
    res.json({ skills, total: skills.length });
});

app.get('/api/skills/marketplace', standardLimiter, (_req: Request, res: Response) => {
    // Return all skills as marketplace items (including install status)
    const skills = skillManager.getLoadedSkills();
    const marketplaceSkills = skills.map(s => ({
        ...s,
        // Add marketplace metadata
        installable: !s.isBuiltIn,
        featured: (s as any).rating ? (s as any).rating >= 4.5 : false,
    }));
    res.json({ skills: marketplaceSkills, total: marketplaceSkills.length });
});

app.post('/api/skills/install', authMiddleware as any, (req: Request, res: Response) => {
    const { source } = req.body;
    if (!source) {
        res.status(400).json({ error: 'source required (GitHub URL or NiriumHub slug)' });
        return;
    }
    try {
        const skill = skillManager.installSkill(source);
        broadcastLog('success', `[Skills] Installed: ${skill.name}`);
        res.json(skill);
    } catch (error) {
        res.status(500).json({ error: String(error) });
    }
});

app.delete('/api/skills/:slug', authMiddleware as any, (req: Request, res: Response) => {
    try {
        const deleted = skillManager.uninstallSkill(req.params.slug as string);
        if (deleted) {
            broadcastLog('info', `[Skills] Uninstalled: ${req.params.slug}`);
            res.json({ message: 'Skill uninstalled' });
        } else {
            res.status(404).json({ error: 'Skill not found' });
        }
    } catch (error) {
        res.status(400).json({ error: String(error) });
    }
});

app.post('/api/skills/:slug/actions/:action', authMiddleware as any, async (req: Request, res: Response) => {
    try {
        const result = await skillManager.executeAction(
            req.params.slug as string,
            req.params.action as string,
            req.body.params || {},
            req.body.context || {}
        );
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: String(error) });
    }
});

// ═══════════════════════════════════════════════════════════════
// SYSTEM ENDPOINTS
// ═══════════════════════════════════════════════════════════════

app.get('/api/system/health', authMiddleware as any, adminMiddleware as any, async (_req: Request, res: Response) => {
    const [horizon, soroban] = await Promise.all([
        checkHorizonHealth(),
        checkSorobanHealth(),
    ]);

    res.json({
        agent: { healthy: true, uptime: Math.floor((Date.now() - startTime) / 1000) },
        horizon,
        soroban,
        websocket: { healthy: true, clients: getSubscriptionStats().connectedClients },
        llm: { configured: !!getLLMProvider().name },
    });
});

app.post('/api/config/llm', authMiddleware as any, adminMiddleware as any, (req: Request, res: Response) => {
    const { provider, model, apiKey, ollamaUrl } = req.body;

    const VALID_PROVIDERS = ['openai', 'anthropic', 'ollama', 'minimax', 'gemini', 'grok', 'bedrock', 'openrouter'];
    if (provider && !VALID_PROVIDERS.includes(provider)) {
        res.status(400).json({ error: 'Invalid provider', valid: VALID_PROVIDERS });
        return;
    }

    if (provider) process.env.ACTIVE_LLM_PROVIDER = provider;
    if (model) {
        if (provider === 'openai') process.env.OPENAI_MODEL = model;
        if (provider === 'anthropic') process.env.ANTHROPIC_MODEL = model;
        if (provider === 'ollama') process.env.OLLAMA_MODEL = model;
        if (provider === 'minimax') process.env.MINIMAX_MODEL = model;
        if (provider === 'gemini') process.env.GEMINI_MODEL = model;
        if (provider === 'grok') process.env.GROK_MODEL = model;
        if (provider === 'bedrock') process.env.BEDROCK_MODEL = model;
        if (provider === 'openrouter') process.env.OPENROUTER_MODEL = model;
    }
    if (apiKey) {
        if (provider === 'openai') process.env.OPENAI_API_KEY = apiKey;
        if (provider === 'anthropic') process.env.ANTHROPIC_API_KEY = apiKey;
        if (provider === 'minimax') process.env.MINIMAX_API_KEY = apiKey;
        if (provider === 'gemini') process.env.GEMINI_API_KEY = apiKey;
        if (provider === 'grok') process.env.XAI_API_KEY = apiKey;
        if (provider === 'bedrock') process.env.AWS_ACCESS_KEY_ID = apiKey;
        if (provider === 'openrouter') process.env.OPENROUTER_API_KEY = apiKey;
    }
    if (ollamaUrl) process.env.OLLAMA_URL = ollamaUrl;

    resetProvider();
    broadcastLog('system', `[Config] LLM Provider updated by admin`);
    res.json({ success: true, message: `Neural Link updated` });
});

// ═══════════════════════════════════════════════════════════════
// SERVER INITIALIZATION
// ═══════════════════════════════════════════════════════════════

export function createAppServer(): { app: Application; server: ReturnType<typeof createServer> } {
    const server = createServer(app);

    // Initialize WebSocket server
    initializeWebSocket(server);

    // Initialize autonomous loop with broadcast functions
    initializeLoop(broadcastLog, broadcastSignal);

    // Initialize skill manager
    skillManager.initialize();

    // IPFS archival loop (every 5 minutes)
    setInterval(async () => {
        const batch = drainLogBatch();
        if (batch.length === 0) return;

        try {
            const result = await uploadToIpfs(batch);
            if (result.success && result.cid) {
                broadcastLog('success', `📦 Logs archived to IPFS`, {
                    cid: result.cid,
                    gatewayUrl: result.gatewayUrl,
                    logCount: batch.length,
                });
            }
        } catch (error) {
            console.error('[IPFS] Archival error:', error);
        }
    }, 5 * 60 * 1000);

    return { app, server };
}

export { app, PORT, VERSION };
