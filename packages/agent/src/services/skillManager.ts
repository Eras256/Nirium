// ═══════════════════════════════════════════════════════════════
// Nirium — Skill/Plugin Manager
// ═══════════════════════════════════════════════════════════════

import { v4 as uuidv4 } from 'uuid';
import { SkillManifest, SkillAction, SkillCategory } from '../types/database.types.js';

const loadedSkills = new Map<string, SkillManifest>();

/**
 * Built-in skills manifest data.
 */
const BUILT_IN_SKILLS: SkillManifest[] = [
    {
        name: 'Stellar Deep Research',
        slug: 'stellar-deep-research',
        version: '0.1.0',
        description: 'AI-powered deep research on Stellar ecosystem tokens, protocols, and market dynamics using multi-source analysis.',
        author: 'Nirium Core',
        category: 'analysis',
        tags: ['research', 'ai', 'stellar', 'analysis'],
        permissions: ['read:market', 'read:network'],
        actions: [
            { name: 'analyze_token', description: 'Deep analysis of a Stellar token', parameters: [{ name: 'token', type: 'string', description: 'Token address or symbol', required: true }], handler: 'analyzeToken' },
            { name: 'market_report', description: 'Generate comprehensive market report', parameters: [], handler: 'generateMarketReport' },
        ],
        triggers: ['market.update'],
        providers: ['llm'],
        isBuiltIn: true,
        isInstalled: true,
        rating: 4.8,
        downloadCount: 12500,
    },
    {
        name: 'Twitter Sentiment Ops',
        slug: 'twitter-sentiment',
        version: '0.1.0',
        description: 'Real-time X/Twitter crypto sentiment analysis using NLP. Tracks whale activity, community mood, and viral trends.',
        author: 'Nirium Core',
        category: 'analysis',
        tags: ['twitter', 'sentiment', 'nlp', 'social'],
        permissions: ['read:external_api'],
        actions: [
            { name: 'scan_sentiment', description: 'Scan Twitter for crypto sentiment', parameters: [{ name: 'query', type: 'string', description: 'Search query', required: true }], handler: 'scanSentiment' },
            { name: 'track_influencer', description: 'Track a crypto influencer', parameters: [{ name: 'handle', type: 'string', description: 'Twitter handle', required: true }], handler: 'trackInfluencer' },
        ],
        triggers: ['schedule.interval'],
        providers: ['twitter_api'],
        isBuiltIn: true,
        isInstalled: true,
        rating: 4.5,
        downloadCount: 8900,
    },
    {
        name: 'Knowledge Graph',
        slug: 'knowledge-graph',
        version: '0.1.0',
        description: 'Build and query a knowledge graph of DeFi protocols, tokens, and market relationships for enhanced AI context.',
        author: 'Nirium Core',
        category: 'data',
        tags: ['knowledge', 'graph', 'ai', 'context'],
        permissions: ['read:market', 'write:memory'],
        actions: [
            { name: 'query_graph', description: 'Query the knowledge graph', parameters: [{ name: 'query', type: 'string', description: 'Natural language query', required: true }], handler: 'queryGraph' },
            { name: 'update_graph', description: 'Add new knowledge to the graph', parameters: [{ name: 'data', type: 'object', description: 'Knowledge data', required: true }], handler: 'updateGraph' },
        ],
        triggers: ['market.update'],
        providers: ['llm'],
        isBuiltIn: true,
        isInstalled: true,
        rating: 4.6,
        downloadCount: 6700,
    },
    {
        name: 'Flash Loan Executor',
        slug: 'flash-loan-executor',
        version: '0.1.0',
        description: 'Single-invocation Soroban flash loan engine. Borrows, executes, and verifies repayment atomically — panic!() on failure = full revert.',
        author: 'Nirium Core',
        category: 'trading',
        tags: ['flash-loan', 'arbitrage', 'soroban', 'atomic'],
        permissions: ['execute:transaction', 'read:market'],
        actions: [
            { name: 'simulate_flash_loan', description: 'Simulate a single-invocation flash loan', parameters: [{ name: 'amount', type: 'number', description: 'Borrow amount', required: true }, { name: 'pool_id', type: 'string', description: 'Pool ID', required: true }], handler: 'simulateFlashLoan' },
            { name: 'flash_loan_execute', description: 'Execute atomic flash loan (borrow + swap + verify + repay)', parameters: [{ name: 'amount', type: 'number', description: 'Borrow amount', required: true }], handler: 'flashLoanExecute' },
        ],
        triggers: ['signal.flash_loan_opportunity'],
        providers: ['soroban'],
        isBuiltIn: true,
        isInstalled: true,
        rating: 4.9,
        downloadCount: 15200,
    },
    {
        name: 'On-Chain Oracle',
        slug: 'onchain-oracle',
        version: '0.1.0',
        description: 'Multi-source on-chain price oracle aggregating data from Soroswap, Phoenix, and external feeds.',
        author: 'Nirium Core',
        category: 'data',
        tags: ['oracle', 'price', 'on-chain'],
        permissions: ['read:network'],
        actions: [
            { name: 'get_price', description: 'Get aggregated price for a token pair', parameters: [{ name: 'pair', type: 'string', description: 'Token pair (e.g., XLM-USDC)', required: true }], handler: 'getPrice' },
        ],
        triggers: ['schedule.interval'],
        providers: ['horizon', 'soroban'],
        isBuiltIn: true,
        isInstalled: true,
        rating: 4.7,
        downloadCount: 11000,
    },
    {
        name: 'Whale Tracker',
        slug: 'whale-tracker',
        version: '0.1.0',
        description: 'Monitor large Stellar wallet movements and alert on whale activity that could impact market prices.',
        author: 'Nirium Core',
        category: 'analysis',
        tags: ['whale', 'monitoring', 'alerts'],
        permissions: ['read:network', 'write:notification'],
        actions: [
            { name: 'track_wallet', description: 'Start tracking a whale wallet', parameters: [{ name: 'address', type: 'string', description: 'Stellar address', required: true }], handler: 'trackWallet' },
            { name: 'get_whale_activity', description: 'Get recent whale activity', parameters: [], handler: 'getWhaleActivity' },
        ],
        triggers: ['network.transaction'],
        providers: ['horizon'],
        isBuiltIn: true,
        isInstalled: true,
        rating: 4.4,
        downloadCount: 7800,
    },
    {
        name: 'Risk Shield',
        slug: 'risk-shield',
        version: '0.1.0',
        description: 'Real-time portfolio risk assessment with automatic stop-loss triggers and exposure management.',
        author: 'Nirium Core',
        category: 'security',
        tags: ['risk', 'protection', 'stop-loss'],
        permissions: ['read:portfolio', 'execute:transaction'],
        actions: [
            { name: 'assess_risk', description: 'Assess current portfolio risk', parameters: [], handler: 'assessRisk' },
            { name: 'set_stop_loss', description: 'Configure stop-loss parameters', parameters: [{ name: 'percentage', type: 'number', description: 'Stop-loss trigger percentage', required: true }], handler: 'setStopLoss' },
        ],
        triggers: ['market.update', 'signal.fee_spike'],
        providers: ['llm'],
        isBuiltIn: true,
        isInstalled: true,
        rating: 4.8,
        downloadCount: 9400,
    },
    {
        name: 'Yield Compounder',
        slug: 'yield-compounder',
        version: '0.1.0',
        description: 'Automated yield compounding across Blend Protocol lending pools. Optimizes reinvestment timing.',
        author: 'Nirium Core',
        category: 'defi',
        tags: ['yield', 'compound', 'blend', 'auto'],
        permissions: ['execute:transaction', 'read:market'],
        actions: [
            { name: 'compound_yields', description: 'Trigger yield compounding', parameters: [], handler: 'compoundYields' },
            { name: 'estimate_compound', description: 'Estimate compounding benefits', parameters: [{ name: 'amount', type: 'number', description: 'Principal amount', required: true }], handler: 'estimateCompound' },
        ],
        triggers: ['schedule.daily'],
        providers: ['soroban', 'blend'],
        isBuiltIn: true,
        isInstalled: true,
        rating: 4.6,
        downloadCount: 8100,
    },
    {
        name: 'Portfolio Rebalancer',
        slug: 'portfolio-rebalancer',
        version: '0.1.0',
        description: 'Intelligent portfolio rebalancing with drift detection and optimal trade routing via Soroswap.',
        author: 'Nirium Core',
        category: 'trading',
        tags: ['rebalance', 'portfolio', 'optimization'],
        permissions: ['execute:transaction', 'read:portfolio'],
        actions: [
            { name: 'check_drift', description: 'Check portfolio drift from target allocation', parameters: [], handler: 'checkDrift' },
            { name: 'rebalance', description: 'Execute portfolio rebalancing', parameters: [{ name: 'threshold', type: 'number', description: 'Drift threshold percentage', required: false, default: 10 }], handler: 'rebalance' },
        ],
        triggers: ['schedule.daily'],
        providers: ['soroban', 'soroswap'],
        isBuiltIn: true,
        isInstalled: true,
        rating: 4.5,
        downloadCount: 6300,
    },
    {
        name: 'MEV Guard',
        slug: 'mev-guard',
        version: '0.1.0',
        description: 'Protection against MEV (Maximum Extractable Value) attacks. Monitors transaction ordering and front-running.',
        author: 'Nirium Core',
        category: 'security',
        tags: ['mev', 'protection', 'security', 'front-running'],
        permissions: ['read:network', 'write:notification'],
        actions: [
            { name: 'scan_mempool', description: 'Scan for potential MEV activity', parameters: [], handler: 'scanMempool' },
            { name: 'protect_transaction', description: 'Apply MEV protection to a transaction', parameters: [{ name: 'tx_hash', type: 'string', description: 'Transaction hash', required: true }], handler: 'protectTransaction' },
        ],
        triggers: ['network.transaction'],
        providers: ['horizon'],
        isBuiltIn: true,
        isInstalled: true,
        rating: 4.3,
        downloadCount: 5200,
    },
    {
        name: 'Liquidity Sniper',
        slug: 'liquidity-sniper',
        version: '0.1.0',
        description: 'Detect and capitalize on new liquidity pool launches and significant liquidity events on Soroswap.',
        author: 'Nirium Core',
        category: 'trading',
        tags: ['liquidity', 'sniper', 'soroswap', 'launch'],
        permissions: ['read:network', 'execute:transaction'],
        actions: [
            { name: 'monitor_launches', description: 'Monitor for new pool launches', parameters: [], handler: 'monitorLaunches' },
            { name: 'snipe_pool', description: 'Execute snipe on a new pool', parameters: [{ name: 'pool_address', type: 'string', description: 'Pool address', required: true }, { name: 'amount', type: 'number', description: 'Investment amount', required: true }], handler: 'snipePool' },
        ],
        triggers: ['network.contract_event'],
        providers: ['soroban', 'soroswap'],
        isBuiltIn: true,
        isInstalled: true,
        rating: 4.2,
        downloadCount: 4800,
    },
    {
        name: 'IPFS Blackbox Logger',
        slug: 'ipfs-blackbox',
        version: '0.1.0',
        description: 'Immutable, decentralized audit trail via IPFS/Pinata. Archives all agent activity for transparency and compliance.',
        author: 'Nirium Core',
        category: 'utility',
        tags: ['ipfs', 'logging', 'audit', 'compliance'],
        permissions: ['read:logs', 'write:external_api'],
        actions: [
            { name: 'archive_logs', description: 'Archive current logs to IPFS', parameters: [], handler: 'archiveLogs' },
            { name: 'get_archive', description: 'Retrieve archived logs by CID', parameters: [{ name: 'cid', type: 'string', description: 'IPFS CID', required: true }], handler: 'getArchive' },
        ],
        triggers: ['schedule.interval'],
        providers: ['ipfs'],
        isBuiltIn: true,
        isInstalled: true,
        rating: 4.7,
        downloadCount: 10200,
    },
];

/**
 * Initialize the skill manager and load built-in skills.
 */
export function initialize(): void {
    loadBuiltInSkills();
    console.log(`[SkillManager] Initialized with ${loadedSkills.size} built-in skills`);
}

/**
 * Load all built-in skills.
 */
function loadBuiltInSkills(): void {
    for (const skill of BUILT_IN_SKILLS) {
        loadedSkills.set(skill.slug, skill);
    }
}

/**
 * Get all loaded skills.
 */
export function getLoadedSkills(): SkillManifest[] {
    return Array.from(loadedSkills.values());
}

/**
 * Get a skill by slug.
 */
export function getSkill(slug: string): SkillManifest | undefined {
    return loadedSkills.get(slug);
}

/**
 * Install a skill from a source (GitHub URL or NiriumHub slug).
 */
export function installSkill(source: string): SkillManifest {
    // In production, this would download from GitHub or NiriumHub
    const mockInstalled: SkillManifest = {
        name: `Custom: ${source}`,
        slug: source.replace(/[^a-z0-9-]/gi, '-').toLowerCase(),
        version: '1.0.0',
        description: `Custom skill installed from ${source}`,
        author: 'Community',
        category: 'utility',
        tags: ['custom'],
        permissions: ['read:market'],
        actions: [],
        triggers: [],
        providers: [],
        isBuiltIn: false,
        isInstalled: true,
    };

    loadedSkills.set(mockInstalled.slug, mockInstalled);
    console.log(`[SkillManager] Installed skill: ${mockInstalled.name}`);
    return mockInstalled;
}

/**
 * Uninstall a skill (cannot uninstall built-in skills).
 */
export function uninstallSkill(slug: string): boolean {
    const skill = loadedSkills.get(slug);
    if (!skill) return false;
    if (skill.isBuiltIn) {
        throw new Error('Cannot uninstall built-in skills');
    }
    return loadedSkills.delete(slug);
}

/**
 * Execute an action on a skill.
 */
export async function executeAction(
    slug: string,
    actionName: string,
    params: Record<string, unknown>,
    context: Record<string, unknown>
): Promise<Record<string, unknown>> {
    const skill = loadedSkills.get(slug);
    if (!skill) {
        throw new Error(`Skill not found: ${slug}`);
    }

    const action = skill.actions.find(a => a.name === actionName);
    if (!action) {
        throw new Error(`Action not found: ${actionName} on skill ${slug}`);
    }

    // Execute with sandboxed context
    console.log(`[SkillManager] Executing ${slug}/${actionName} with params:`, params);

    // Simulated execution result
    return {
        success: true,
        skill: slug,
        action: actionName,
        result: {
            timestamp: new Date().toISOString(),
            executionId: uuidv4(),
            data: `Executed ${action.description} successfully`,
        },
    };
}

/**
 * Get all available actions across all skills for LLM prompt generation.
 */
export function getAvailableActions(): Array<{
    skill: string;
    action: string;
    description: string;
    parameters: SkillManifest['actions'][0]['parameters'];
}> {
    const actions: Array<{
        skill: string;
        action: string;
        description: string;
        parameters: SkillManifest['actions'][0]['parameters'];
    }> = [];

    loadedSkills.forEach((skill) => {
        for (const action of skill.actions) {
            actions.push({
                skill: skill.slug,
                action: action.name,
                description: action.description,
                parameters: action.parameters,
            });
        }
    });

    return actions;
}

/**
 * Generate a structured prompt of all available actions for LLM context.
 */
export function generateActionPrompt(): string {
    const actions = getAvailableActions();
    let prompt = 'Available Nirium Skills and Actions:\n\n';

    const bySkill = new Map<string, typeof actions>();
    for (const action of actions) {
        const arr = bySkill.get(action.skill) || [];
        arr.push(action);
        bySkill.set(action.skill, arr);
    }

    bySkill.forEach((skillActions, skillSlug) => {
        const skill = loadedSkills.get(skillSlug);
        if (skill) {
            prompt += `[${skill.name}] (${skill.slug})\n`;
            prompt += `  ${skill.description}\n`;
            for (const action of skillActions) {
                prompt += `  - ${action.action}: ${action.description}\n`;
                for (const param of action.parameters) {
                    prompt += `    * ${param.name} (${param.type}${param.required ? ', required' : ''}): ${param.description}\n`;
                }
            }
            prompt += '\n';
        }
    });

    return prompt;
}
