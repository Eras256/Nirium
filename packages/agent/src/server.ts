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
    authMiddleware,
    adminMiddleware,
    generateToken,
    generateApiKey,
    getUserApiKeys,
    revokeApiKey,
    AuthenticatedRequest,
} from './middleware/index.js';
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

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
}));

app.use(express.json({ limit: '10mb' }));

const standardLimiter = createRateLimiter('standard');
const aggressiveLimiter = createRateLimiter('aggressive');

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
        documentation: 'https://nirium.dev/docs',
        endpoints: {
            health: 'GET /health',
            auth: {
                token: 'POST /api/auth/token',
                keys: 'POST|GET|DELETE /api/auth/keys',
            },
            execution: {
                execute: 'POST /api/execute',
                demo: 'POST /api/execute-demo',
            },
            market: {
                data: 'GET /api/market',
                loop: 'POST /api/loop/start|stop|scan, GET /api/loop/status',
            },
            webhooks: 'POST|GET|DELETE /api/webhooks',
            subscriptions: 'POST|GET|DELETE /api/subscriptions',
            skills: 'GET|POST|DELETE /api/skills',
            signals: 'GET /api/signals/recent',
        },
        llm: {
            active: getLLMProvider().name,
            available: getAvailableProviders(),
        },
    });
});

// ═══════════════════════════════════════════════════════════════
// AUTHENTICATION ENDPOINTS
// ═══════════════════════════════════════════════════════════════

app.post('/api/auth/token', standardLimiter, (req: Request, res: Response) => {
    const { walletAddress, signature } = req.body;

    if (!walletAddress) {
        res.status(400).json({ error: 'walletAddress required' });
        return;
    }

    // In production: verify the Stellar signature against the public key
    // For now, issue a token for any valid-looking address
    const token = generateToken(walletAddress, ['user']);

    broadcastLog('info', `[Auth] Token issued for ${walletAddress.substring(0, 12)}...`);

    res.json({
        token,
        expiresIn: '24h',
        userId: walletAddress,
        permissions: ['user'],
    });
});

app.post('/api/auth/keys', authMiddleware as any, adminMiddleware as any, (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const { name } = req.body;

    const apiKey = generateApiKey(
        authReq.user!.userId,
        name || 'Default Key',
        ['user']
    );

    broadcastLog('info', `[Auth] API key generated for ${authReq.user!.userId}`);

    res.json({
        apiKey,
        name: name || 'Default Key',
        message: 'Store this key securely — it will not be shown again.',
    });
});

app.get('/api/auth/keys', authMiddleware as any, (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const keys = getUserApiKeys(authReq.user!.userId);
    res.json({ keys });
});

app.delete('/api/auth/keys/:id', authMiddleware as any, (req: Request, res: Response) => {
    const revoked = revokeApiKey(req.params.id as string);
    if (revoked) {
        res.json({ message: 'API key revoked' });
    } else {
        res.status(404).json({ error: 'API key not found' });
    }
});

// ═══════════════════════════════════════════════════════════════
// EXECUTION ENDPOINTS
// ═══════════════════════════════════════════════════════════════

app.post('/api/execute', authMiddleware as any, aggressiveLimiter, async (req: Request, res: Response) => {
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
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: String(error) });
    }
});

// ═══════════════════════════════════════════════════════════════
// MARKET DATA ENDPOINTS
// ═══════════════════════════════════════════════════════════════

app.get('/api/market', standardLimiter, async (_req: Request, res: Response) => {
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

app.post('/api/loop/start', authMiddleware as any, (req: Request, res: Response) => {
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

app.post('/api/webhooks', authMiddleware as any, (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const { url, events, secret } = req.body;

    if (!url || !events?.length) {
        res.status(400).json({ error: 'url and events[] required' });
        return;
    }

    const webhook = registerWebhook(authReq.user!.userId, url, events, secret);
    broadcastLog('info', `[Webhook] Registered: ${url} → ${events.join(', ')}`);
    res.json(webhook);
});

app.get('/api/webhooks', authMiddleware as any, (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const webhooks = getUserWebhooks(authReq.user!.userId);
    res.json({ webhooks });
});

app.delete('/api/webhooks/:id', authMiddleware as any, (req: Request, res: Response) => {
    const deleted = deleteWebhook(req.params.id as string);
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

app.get('/api/system/health', async (_req: Request, res: Response) => {
    const [horizon, soroban] = await Promise.all([
        checkHorizonHealth(),
        checkSorobanHealth(),
    ]);

    res.json({
        agent: { healthy: true, uptime: Math.floor((Date.now() - startTime) / 1000) },
        horizon,
        soroban,
        websocket: { healthy: true, clients: getSubscriptionStats().connectedClients },
        ipfs: { gateway: PINATA_GATEWAY },
        llm: { provider: getLLMProvider().name, model: getLLMProvider().model },
    });
});

app.post('/api/config/llm', (req: Request, res: Response) => {
    const { provider, model, apiKey, ollamaUrl } = req.body;

    // In a real production environment, these would be validated and encrypted
    // For Nirium v1.0, we update the runtime configuration
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
        if (provider === 'bedrock') process.env.AWS_ACCESS_KEY_ID = apiKey; // Simplified
        if (provider === 'openrouter') process.env.OPENROUTER_API_KEY = apiKey;
    }
    if (ollamaUrl) process.env.OLLAMA_URL = ollamaUrl;

    resetProvider();
    broadcastLog('system', `[Config] LLM Provider shifted to ${provider} (${model})`);
    res.json({ success: true, message: `Neural Link shifted to ${provider}` });
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
