// ═══════════════════════════════════════════════════════════════
// Nirium Agent — Public Demo Endpoints
// ═══════════════════════════════════════════════════════════════
//
// Public endpoints that don't require authentication:
// - Demo wallet authentication
// - Wallet signature authentication (real Ed25519 verification)
// - Sample market data
// - Public health checks
// - API documentation
//
// ═══════════════════════════════════════════════════════════════

import { Router, Request, Response } from 'express';
import type { Router as RouterType } from 'express';
import { Keypair } from '@stellar/stellar-sdk';
import { generateToken, TIER_QUOTAS } from '../middleware/index.js';
import { createRateLimiter } from '../middleware/rateLimit.js';

// ═══════════════════════════════════════════════════════════════
// STELLAR SIGNATURE VERIFICATION (Ed25519)
// ═══════════════════════════════════════════════════════════════

/**
 * Verifies an Ed25519 signature produced by a Stellar wallet (Freighter, etc.)
 *
 * Supports two formats:
 *  1. Raw base64-encoded signature (Freighter / stellar-wallets-kit output)
 *  2. Hex-encoded signature
 */
function verifyStellarSignature(
    walletAddress: string,
    message: string,
    signature: string
): boolean {
    try {
        const keypair = Keypair.fromPublicKey(walletAddress);
        const messageBuffer = Buffer.from(message);

        // Try base64 first (Freighter default)
        try {
            const sigBuffer = Buffer.from(signature, 'base64');
            if (keypair.verify(messageBuffer, sigBuffer)) return true;
        } catch { /* not base64 */ }

        // Try hex
        try {
            const sigBuffer = Buffer.from(signature, 'hex');
            if (keypair.verify(messageBuffer, sigBuffer)) return true;
        } catch { /* not hex */ }

        return false;
    } catch {
        return false;
    }
}

const router: RouterType = Router();
const publicLimiter = createRateLimiter('standard');

// ═══════════════════════════════════════════════════════════════
// DEMO AUTHENTICATION
// ═══════════════════════════════════════════════════════════════

/**
 * POST /api/public/demo-auth
 * Generate a demo token without signature verification
 * Useful for testing and onboarding
 */
router.post('/demo-auth', publicLimiter, (req: Request, res: Response) => {
    const { walletAddress } = req.body;

    // Validate wallet address format (Stellar)
    if (!walletAddress || !/^G[A-Z0-9]{55}$/.test(walletAddress)) {
        res.status(400).json({
            error: 'Invalid wallet address',
            hint: 'Provide a valid Stellar address (starts with G, 56 chars)',
            example: 'GAAAA...',
        });
        return;
    }

    // Generate free-tier token (1h validity)
    const token = generateToken(walletAddress, ['user'], 'free');

    res.json({
        success: true,
        token,
        expiresIn: '1h',
        userId: walletAddress,
        tier: 'free',
        quotas: TIER_QUOTAS.free,
        warning: '⚠️ This is a DEMO token for testing only. For production, use proper wallet signature authentication.',
        usage: {
            authentication: `Authorization: Bearer ${token}`,
            example: `curl -H "Authorization: Bearer ${token}" https://api.nirium.xyz/api/market`,
        },
    });
});

/**
 * POST /api/public/authenticate
 * Wallet signature authentication — real Ed25519 verification.
 * Works on both testnet and mainnet.
 */
router.post('/authenticate', publicLimiter, (req: Request, res: Response) => {
    const { walletAddress, signature, message } = req.body;

    if (!walletAddress || !signature || !message) {
        res.status(400).json({
            error: 'Missing required fields',
            required: ['walletAddress', 'signature', 'message'],
            hint: 'Sign the message with your Stellar wallet (Freighter or compatible)',
            example: {
                walletAddress: 'G...',
                message: 'Login to Nirium Agent API\nTimestamp: 1711710000000',
                signature: '<base64_or_hex_ed25519_signature>',
            },
        });
        return;
    }

    // Validate Stellar address format
    if (!/^G[A-Z0-9]{55}$/.test(walletAddress)) {
        res.status(400).json({
            error: 'Invalid wallet address',
            hint: 'Must be a valid Stellar address (G..., 56 chars)',
        });
        return;
    }

    // Enforce message freshness — timestamp is REQUIRED in the message to prevent replay attacks
    const timestampMatch = message.match(/Timestamp:\s*(\d+)/);
    if (!timestampMatch) {
        res.status(400).json({
            error: 'Message missing required timestamp',
            hint: 'The signed message must include "Timestamp: <unix_ms>" to prevent replay attacks.',
            example: `Login to Nirium Agent API\nTimestamp: ${Date.now()}`,
        });
        return;
    }
    const msgTime = parseInt(timestampMatch[1], 10);
    const ageSeconds = (Date.now() - msgTime) / 1000;
    if (ageSeconds > 300) {
        res.status(401).json({
            error: 'Message expired',
            hint: 'The signed message timestamp is older than 5 minutes. Generate a new message and sign again.',
        });
        return;
    }

    // Verify Ed25519 signature
    const isValid = verifyStellarSignature(walletAddress, message, signature);

    if (!isValid) {
        res.status(401).json({
            error: 'Invalid signature',
            hint: 'The signature does not match the wallet address. Ensure you are signing the exact message string.',
        });
        return;
    }

    const network = process.env.STELLAR_NETWORK || 'testnet';
    const token = generateToken(walletAddress, ['user'], 'free');

    res.json({
        success: true,
        token,
        expiresIn: '1h',
        userId: walletAddress,
        tier: 'free',
        quotas: TIER_QUOTAS.free,
        network,
        authenticated: true,
    });
});

// ═══════════════════════════════════════════════════════════════
// PROTOCOL METADATA (CENTRALIZED)
// ═══════════════════════════════════════════════════════════════

const PROTOCOL_METADATA = {
    strategies: {
        "nirium-usdc-loop": { name: "XLM/USDC Kinetic Loop", logPrefix: "ARBITRAGE", emoji: "🔄", category: "arbitrage" },
        "soroswap-sniper": { name: "Meme Volatility Sniper", logPrefix: "SNIPER", emoji: "🎯", category: "trading" },
        "peg-arbitrage": { name: "LST Peg Restoration", logPrefix: "PEG-ARB", emoji: "💧", category: "arbitrage" },
        "eliza-sentiment": { name: "Eliza Sentiment Engine", logPrefix: "AI-SENTIMENT", emoji: "🧠", category: "intelligence" },
        "lending-loop-max": { name: "Blend-Phoenix Recursive Yield", logPrefix: "LENDING", emoji: "📈", category: "yield" },
        "blue-chip-dca": { name: "Weighted DCA Accumulator", logPrefix: "DCA", emoji: "💰", category: "portfolio" },
        "stable-yield-agg": { name: "Stablecoin Optimization Loop", logPrefix: "STABLE", emoji: "🏦", category: "yield" },
        "soroswap-clmm-active": { name: "CLMM Active Provisioner", logPrefix: "CLMM", emoji: "🛠️", category: "liquidity" },
        "bluefin-delta-neutral": { name: "Delta Neutral Funding Farmer", logPrefix: "DELTA", emoji: "⚖️", category: "delta-neutral" },
        "mev-capture": { name: "MEV Extraction Engine", logPrefix: "MEV", emoji: "⚡", category: "mev" },
        "perp-funding-arb": { name: "Perp Funding Rate Arbitrage", logPrefix: "PERP-FUND", emoji: "📊", category: "arbitrage" },
        "pyth-oracle-sniper": { name: "Oracle Latency Arbitrageur", logPrefix: "ORACLE-ARB", emoji: "🔭", category: "arbitrage" },
        "dual-yield-compounder": { name: "Dual Token Yield Compounder", logPrefix: "DUAL-YIELD", emoji: "🌀", category: "yield" },
        "liquidation-hunter": { name: "Liquidation Vector", logPrefix: "LIQUIDATION", emoji: "🩸", category: "liquidation" },
        "cross-chain-bridge-arb": { name: "Cross-Chain Spread Capture", logPrefix: "BRIDGE-ARB", emoji: "🌉", category: "arbitrage" },
    },
    skills: {
        'flash-loan-executor': { slug: 'flash-loan-executor', name: 'Flash Loan Executor', version: '0.0.7', category: 'trading', isGlobal: false },
        'price-oracle': { slug: 'price-oracle', name: 'Multi-Source Price Oracle', version: '1.5.0', category: 'data', isGlobal: true },
        'telegram-alerts-pro': { slug: 'telegram-alerts-pro', name: 'Telegram Alerts Pro', version: '3.0.0', category: 'notification', isGlobal: true },
        'whale-tracker': { slug: 'whale-tracker', name: 'Whale Tracker', version: '1.2.0', category: 'analysis', isGlobal: false },
        'lst-arbitrage': { slug: 'lst-arbitrage', name: 'LST Arbitrage Bot', version: '2.0.0', category: 'trading', isGlobal: false },
        'blend-optimizer': { slug: 'blend-optimizer', name: 'Blend Yield Optimizer', version: '1.8.0', category: 'trading', isGlobal: false },
        'discord-integration': { slug: 'discord-integration', name: 'Discord Bot Integration', version: '2.5.0', category: 'integration', isGlobal: true },
        'portfolio-tracker': { slug: 'portfolio-tracker', name: 'Portfolio Tracker', version: '1.3.0', category: 'analysis', isGlobal: false },
        'pyth-oracle': { slug: 'pyth-oracle', name: 'Pyth Network Oracle', version: '2.1.0', category: 'data', isGlobal: true },
        'twitter-sentiment': { slug: 'twitter-sentiment', name: 'Twitter/X Sentiment Analyzer', version: '0.0.7', category: 'analysis', isGlobal: false },
        'phoenix-lp-manager': { slug: 'phoenix-lp-manager', name: 'Phoenix LP Manager', version: '2.0.0', category: 'trading', isGlobal: false },
        'gas-optimizer': { slug: 'gas-optimizer', name: 'Gas Optimizer', version: '1.0.0', category: 'utility', isGlobal: false },
        'nirium-deep-research': { slug: 'nirium-deep-research', name: 'Stellar Deep Research', version: '0.1.0', category: 'intelligence', isGlobal: true },
        'social-sentiment': { slug: 'social-sentiment', name: 'Social Sentiment', version: '0.0.7', category: 'intelligence', isGlobal: true },
        'knowledge-graph': { slug: 'knowledge-graph', name: 'Knowledge Graph', version: '0.0.7', category: 'intelligence', isGlobal: true },
        'flash-loan-engine': { slug: 'flash-loan-engine', name: 'Flash Loan Engine', version: '0.0.7', category: 'defi', isGlobal: false },
        'onchain-oracle': { slug: 'onchain-oracle', name: 'On-Chain Oracle', version: '0.0.7', category: 'data', isGlobal: true },
        'risk-shield': { slug: 'risk-shield', name: 'Risk Shield', version: '0.0.7', category: 'risk', isGlobal: false },
        'auto-compounder': { slug: 'auto-compounder', name: 'Auto-Compounder', version: '0.0.7', category: 'yield', isGlobal: false },
        'portfolio-rebalancer': { slug: 'portfolio-rebalancer', name: 'Portfolio Rebalancer', version: '0.0.7', category: 'portfolio', isGlobal: false },
        'mev-interceptor': { slug: 'mev-interceptor', name: 'MEV Interceptor', version: '0.0.7', category: 'mev', isGlobal: false },
        'liquidity-sniper': { slug: 'liquidity-sniper', name: 'Liquidity Sniper', version: '0.0.7', category: 'sniping', isGlobal: false },
        'blend-lending-bot': { slug: 'blend-lending-bot', name: 'Blend Lending Bot', version: '1.1.0', category: 'trading', isGlobal: false },
        'sdex-market-maker': { slug: 'sdex-market-maker', name: 'SDEX Market Maker', version: '0.9.2', category: 'trading', isGlobal: false },
        'stop-loss-guardian': { slug: 'stop-loss-guardian', name: 'Stop-Loss Guardian', version: '2.2.0', category: 'utility', isGlobal: false },
        'eliza-trading-brain': { slug: 'eliza-trading-brain', name: 'ElizaOS Trading Brain', version: '0.0.7', category: 'analysis', isGlobal: true },
        'neural-archive-logger': { slug: 'neural-archive-logger', name: 'Neural Archive Logger', version: '1.0.0', category: 'utility', isGlobal: true },
        'cross-dex-aggregator': { slug: 'cross-dex-aggregator', name: 'Cross-DEX Aggregator', version: '3.1.0', category: 'trading', isGlobal: true },
        'pnl-reporter': { slug: 'pnl-reporter', name: 'P&L Real-Time Reporter', version: '1.4.0', category: 'analysis', isGlobal: false },
        'webhook-trigger': { slug: 'webhook-trigger', name: 'Webhook Event Trigger', version: '2.0.0', category: 'integration', isGlobal: false },
        'nirium-blackbox-logger': { slug: 'nirium-blackbox-logger', name: 'Neural Blackbox Logger', version: '0.0.7', category: 'utility', isGlobal: true },
        'usdc-vault-manager': { slug: 'usdc-vault-manager', name: 'USDC Vault Manager', version: '0.0.7', category: 'trading', isGlobal: false },
    },
    bootLogs: {
        'nirium-usdc-loop': [{ msg: 'ARBITRAGE: Scanning XLM/USDC spread on SDEX...', level: 'info' }, { msg: 'ARBITRAGE: Spread window detected (0.47%). Executing atomic swap.', level: 'success' }],
        'soroswap-sniper': [{ msg: 'SNIPER: Monitoring Soroswap for new liquidity...', level: 'info' }, { msg: 'SNIPER: Entry point confirmed. Strategy live.', level: 'warn' }],
        'blend-loop-max': [{ msg: 'LENDING: Optimizing Blend recursive positions...', level: 'info' }, { msg: 'LENDING: Yield loop active on Stellar Testnet.', level: 'success' }],
    }
};

/**
 * GET /api/public/protocol-meta
 * Get centralized strategy and skill metadata for the frontend
 */
router.get('/protocol-meta', publicLimiter, (_req: Request, res: Response) => {
    res.json({
        success: true,
        ...PROTOCOL_METADATA,
        timestamp: new Date().toISOString()
    });
});

// ═══════════════════════════════════════════════════════════════
// PUBLIC MARKET DATA (LIMITED)
// ═══════════════════════════════════════════════════════════════

/**
 * GET /api/public/market-snapshot
 * Get a limited market data snapshot without authentication
 */
router.get('/market-snapshot', publicLimiter, async (_req: Request, res: Response) => {
    // Return limited, public market data
    res.json({
        timestamp: new Date().toISOString(),
        network: process.env.STELLAR_NETWORK || 'testnet',
        assets: [
            {
                code: 'XLM',
                name: 'Stellar Lumens',
                price: 'N/A (native asset)',
                status: 'operational',
            },
            {
                code: 'USDC',
                name: 'USD Coin',
                issuer: 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5',
                status: 'operational',
            },
        ],
        note: 'This is limited public data. Authenticate for full market access.',
        authenticate: 'POST /api/public/demo-auth',
    });
});

// ═══════════════════════════════════════════════════════════════
// API DOCUMENTATION & EXAMPLES
// ═══════════════════════════════════════════════════════════════

/**
 * GET /api/public/examples
 * Code examples for various languages
 */
router.get('/examples', (_req: Request, res: Response) => {
    res.json({
        curl: {
            'Get Demo Token': `curl -X POST https://api.nirium.xyz/api/public/demo-auth \\
  -H "Content-Type: application/json" \\
  -d '{"walletAddress": "GABC..."}'`,
            'Get Market Data': `curl -H "Authorization: Bearer <token>" \\
  https://api.nirium.xyz/api/market`,
            'Execute Strategy': `curl -X POST https://api.nirium.xyz/api/execute \\
  -H "Authorization: Bearer <token>" \\
  -H "Content-Type: application/json" \\
  -d '{"strategy": "buy", "asset": "XLM", "params": {"amount": 1000}}'`,
        },
        javascript: {
            'Get Demo Token': `const response = await fetch('https://api.nirium.xyz/api/public/demo-auth', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ walletAddress: 'GABC...' })
});
const { token } = await response.json();`,
            'Get Market Data': `const response = await fetch('https://api.nirium.xyz/api/market', {
  headers: { 'Authorization': \`Bearer \${token}\` }
});
const marketData = await response.json();`,
        },
        python: {
            'Get Demo Token': `import requests
 
response = requests.post('https://api.nirium.xyz/api/public/demo-auth',
    json={'walletAddress': 'GABC...'})
token = response.json()['token']`,
            'Get Market Data': `response = requests.get('https://api.nirium.xyz/api/market',
    headers={'Authorization': f'Bearer {token}'})
market_data = response.json()`,
        },
        documentation: 'https://nirium.xyz/docs',
        support: 'https://discord.gg/nirium',
    });
});

/**
 * GET /api/public/quickstart
 * Quick start guide
 */
router.get('/quickstart', (_req: Request, res: Response) => {
    res.json({
        title: 'Nirium Agent API - Quick Start Guide',
        steps: [
            {
                step: 1,
                title: 'Get a Demo Token',
                endpoint: 'POST /api/public/demo-auth',
                body: { walletAddress: 'YOUR_STELLAR_ADDRESS' },
                note: 'Use your Stellar wallet address (starts with G)',
            },
            {
                step: 2,
                title: 'Test Authentication',
                endpoint: 'GET /api/market',
                headers: { Authorization: 'Bearer <your-token>' },
                note: 'You should receive market data',
            },
            {
                step: 3,
                title: 'Execute a Demo Strategy',
                endpoint: 'POST /api/execute-demo',
                body: { strategy: 'scan', asset: 'XLM' },
                note: 'This runs in simulation mode',
            },
            {
                step: 4,
                title: 'Request Sandbox Account (Optional)',
                endpoint: 'POST /api/sandbox/request',
                body: {
                    companyName: 'Your Company',
                    contactEmail: 'you@company.com',
                    walletAddress: 'YOUR_STELLAR_ADDRESS',
                },
                note: 'Get higher quotas for institutional testing',
            },
        ],
        tiers: {
            free: {
                quotas: TIER_QUOTAS.free,
                auth: 'Demo tokens via /api/public/demo-auth',
            },
            sandbox: {
                quotas: TIER_QUOTAS.sandbox,
                auth: 'Request via /api/sandbox/request',
            },
            institutional: {
                quotas: TIER_QUOTAS.institutional,
                auth: 'Contact sales',
            },
        },
        resources: {
            documentation: 'https://nirium.xyz/docs',
            examples: 'GET /api/public/examples',
            status: 'GET /health',
            support: 'sandbox@nirium.xyz',
        },
    });
});

export default router;
