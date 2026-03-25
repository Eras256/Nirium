// ═══════════════════════════════════════════════════════════════
// Nirium Agent — Public Demo Endpoints
// ═══════════════════════════════════════════════════════════════
//
// Public endpoints that don't require authentication:
// - Demo wallet authentication
// - Sample market data
// - Public health checks
// - API documentation
//
// ═══════════════════════════════════════════════════════════════

import { Router, Request, Response } from 'express';
import type { Router as RouterType } from 'express';
import { generateToken, TIER_QUOTAS } from '../middleware/index.js';
import { createRateLimiter } from '../middleware/rateLimit.js';

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

    // Generate free-tier token (24h validity)
    const token = generateToken(walletAddress, ['user'], 'free');

    res.json({
        success: true,
        token,
        expiresIn: '24h',
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
 * Proper wallet signature authentication
 * For production use
 */
router.post('/authenticate', publicLimiter, (req: Request, res: Response) => {
    const { walletAddress, signature, message } = req.body;

    if (!walletAddress || !signature) {
        res.status(400).json({
            error: 'Missing required fields',
            required: ['walletAddress', 'signature'],
            hint: 'Sign the message with your Stellar wallet',
        });
        return;
    }

    // TODO: Implement proper Stellar signature verification
    // For now, we'll accept any signature for testnet
    const isTestnet = process.env.STELLAR_NETWORK !== 'mainnet';

    if (isTestnet) {
        // In testnet, be lenient
        const token = generateToken(walletAddress, ['user'], 'free');
        res.json({
            success: true,
            token,
            expiresIn: '24h',
            userId: walletAddress,
            tier: 'free',
            quotas: TIER_QUOTAS.free,
            network: 'testnet',
        });
    } else {
        // In mainnet, require proper verification
        res.status(501).json({
            error: 'Not implemented',
            message: 'Signature verification for mainnet not yet implemented',
            hint: 'Use demo-auth for testing or contact support',
        });
    }
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
