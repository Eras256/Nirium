export interface AgentConfig {
    apiKey: string;
    baseUrl?: string;
    wsUrl?: string;
    /** JWT token for WebSocket auth (obtained from /api/auth/token) */
    token?: string;
}
export interface X402Config {
    /** Stellar secret key (S...) for auth-entry signing */
    secretKey: string;
    /** CAIP-2 network ID (e.g. 'stellar:testnet' or 'stellar:pubnet') */
    network?: string;
}
export interface MppConfig {
    /** Stellar secret key (S...) for Soroban auth-entry signing */
    secretKey: string;
    /** CAIP-2 network ID */
    network?: string;
    /** 'pull' = server assembles+broadcasts, 'push' = client broadcasts */
    mode?: 'pull' | 'push';
}
export interface Signal {
    id: string;
    signal_type: string;
    pair: string;
    data: {
        expectedProfit: number;
        profitPercentage: number;
        urgency: string;
        confidence: number;
        timeToLive: number;
        details: string;
    };
    timestamp: string;
    expiresAt: string;
}
export interface ExecutionResult {
    success: boolean;
    txHash?: string;
    profit?: number;
    gasUsed?: number;
    error?: string;
    timestamp: string;
    network: string;
    details?: Record<string, unknown>;
}
export interface Ticker {
    symbol: string;
    price: number | null;
    volume24h: number | null;
    change24h: number | null;
    network: string;
}
export interface TickersResponse {
    tickers: Ticker[];
    timestamp: string;
    network: string;
}
export interface GlobalStats {
    totalExecutions: number;
    totalProfit: number;
    activeAgents: number;
    network: string;
    timestamp: string;
}
export interface PathPaymentRoute {
    source: string;
    destination: string;
    path: string[];
    sourceAmount: number;
    destinationAmount: number;
    profitPercentage: number;
}
export interface MarketState {
    xlmPrice: number;
    /** Stellar base fee in stroops */
    baseFee: number;
    /** Best bid/ask spread on the native SDEX in basis points */
    sdexSpread: number;
    /** Soroswap AMM pool depth (XLM/USDC) */
    soroswapPoolDepth: number;
    blendApy: {
        supply: number;
        borrow: number;
    };
    /** Discovered profitable multi-hop paths from Horizon */
    pathPaymentRoutes: PathPaymentRoute[];
    /** ISO timestamp of when market data was fetched */
    timestamp: string;
}
export interface LoopStatus {
    isRunning: boolean;
    scanCount: number;
    uptime: number;
    marketState: MarketState | null;
    config: Record<string, unknown>;
    lastAiDecision: Record<string, unknown> | null;
}
export interface SystemHealth {
    agent: {
        healthy: boolean;
        uptime: number;
    };
    horizon: {
        healthy: boolean;
        latencyMs?: number;
        error?: string;
    };
    soroban: {
        healthy: boolean;
        latencyMs?: number;
        error?: string;
    };
    websocket: {
        healthy: boolean;
        clients: number;
    };
    ipfs: {
        gateway: string;
    };
    llm: {
        provider: string;
        model: string;
    };
}
export interface Webhook {
    id: string;
    url: string;
    events: string[];
    active: boolean;
    createdAt: string;
    lastTriggeredAt?: string;
    failureCount: number;
}
export interface Skill {
    slug: string;
    name: string;
    version: string;
    description?: string;
    isBuiltIn: boolean;
    installedAt?: string;
}
export interface SubscriptionOptions {
    signal_types?: string[];
    min_confidence?: number;
    min_profit_percentage?: number;
    pairs?: string[];
}
/**
 * NiriumClient — Full API + WebSocket wrapper for the Nirium Agent.
 *
 * @example
 * ```typescript
 * import { Agent } from '@nirium/sdk';
 *
 * const agent = new Agent({
 *   apiKey: 'nrm_your_key_here',
 *   baseUrl: 'http://localhost:3001',
 * });
 *
 * // Check health
 * const healthy = await agent.ping();
 * console.log('Agent alive:', healthy);
 *
 * // Get market data (REAL data from Horizon)
 * const market = await agent.getMarket();
 * console.log('XLM Price:', market.xlmPrice);
 *
 * // Execute a strategy
 * const result = await agent.execute('flash-loan-arb', 'XLM-USDC', { amount: 5000 });
 * console.log('Profit:', result.profit);
 *
 * // Subscribe to real-time signals
 * agent.subscribe((signal) => {
 *   console.log('Signal:', signal.signal_type, signal.data.details);
 * });
 * ```
 */
export declare class Agent {
    private apiKey;
    private baseUrl;
    private wsUrl;
    private ws;
    private reconnectAttempts;
    private maxReconnectAttempts;
    private signalCallbacks;
    private logCallbacks;
    private token;
    private x402Client;
    private mppClient;
    constructor(config: AgentConfig);
    private request;
    private requestWithHeaders;
    /** Health check — returns true if agent is reachable. */
    ping(): Promise<boolean>;
    /** Detailed health information. */
    health(): Promise<Record<string, unknown>>;
    /** Detailed system health (Horizon, Soroban, WebSocket, IPFS, LLM). */
    systemHealth(): Promise<SystemHealth>;
    /**
     * Execute a strategy via a real Soroban contract transaction on Stellar.
     * Strategy names: flash-loan-arb, path-arbitrage, cross-dex, blend-yield, soroswap-swap
     *
     * @param stellarAccount - Your Stellar wallet address (required for legal consent verification)
     */
    execute(strategy: string, asset: string, params?: Record<string, unknown>, stellarAccount?: string): Promise<ExecutionResult>;
    /**
     * Demo execution (Soroban dry-run simulation, no TX submitted).
     * Returns a professional market assessment message.
     */
    executeDemo(strategy: string, asset: string): Promise<{
        success: boolean;
        simulated_profit: number;
        gas_consumed: number;
        message: string;
    }>;
    /** Get asset price tickers (XLM, USDC) from Stellar Horizon. */
    getTickers(): Promise<TickersResponse>;
    /** Get current market state (real data from Horizon). */
    getMarket(): Promise<MarketState>;
    /** Get global protocol statistics. */
    getStats(): Promise<GlobalStats>;
    /** Get autonomous loop status. */
    getLoopStatus(): Promise<LoopStatus>;
    /** Start the autonomous scanning loop. */
    startLoop(config?: Record<string, unknown>): Promise<{
        success: boolean;
        message: string;
    }>;
    /** Stop the autonomous scanning loop. */
    stopLoop(): Promise<{
        success: boolean;
        message: string;
    }>;
    /** Trigger a manual market scan. */
    triggerScan(): Promise<{
        success: boolean;
        marketState: MarketState;
    }>;
    /** Create a signal subscription with filters. */
    createSubscription(options?: SubscriptionOptions): Promise<Record<string, unknown>>;
    /** Get recent signals. */
    getRecentSignals(count?: number): Promise<{
        signals: Signal[];
    }>;
    /** List all loaded skills (built-in + user-installed). */
    getSkills(): Promise<{
        skills: Skill[];
        total: number;
    }>;
    /** Install a skill by slug. */
    installSkill(source: string): Promise<Skill>;
    /** Uninstall a user-installed skill by slug. */
    uninstallSkill(slug: string): Promise<{
        success: boolean;
    }>;
    /** Register a webhook endpoint. */
    registerWebhook(url: string, events: string[], secret?: string): Promise<Webhook>;
    /** List all registered webhooks. */
    getWebhooks(): Promise<Webhook[]>;
    /** Delete a webhook by ID. */
    deleteWebhook(id: string): Promise<{
        success: boolean;
    }>;
    /** Test a webhook (sends a test event). */
    testWebhook(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * Subscribe to real-time signals via WebSocket.
     * Optionally filter by subscription ID.
     */
    subscribe(callback: (signal: Signal) => void, subscriptionId?: string): void;
    /**
     * Subscribe to real-time log messages.
     */
    onLog(callback: (log: Record<string, unknown>) => void): void;
    private connectWebSocket;
    private attemptReconnect;
    /**
     * Initialize the x402 client for pay-per-request micropayments.
     * Uses canonical @x402/fetch with ExactStellarScheme + OZ Channels facilitator.
     * Agent signs Soroban auth entries only — facilitator sponsors all network fees.
     *
     * @example
     * ```typescript
     * agent.initX402({ secretKey: 'S...', network: 'stellar:testnet' });
     * const data = await agent.x402Fetch('http://localhost:3402/skills/whale-tracker');
     * ```
     */
    initX402(config: X402Config): void;
    /**
     * Fetch a paid resource via x402 protocol.
     * The client automatically handles 402 negotiation, auth-entry signing, and payment.
     * Returns the Response object — call .json() or .text() for the payload.
     */
    x402Fetch(url: string, init?: RequestInit): Promise<Response>;
    /**
     * Initialize the MPP Charge client for per-request Soroban SAC payments.
     * Uses canonical @stellar/mpp charge mode with mppx.
     * In pull mode, the server assembles and broadcasts the transaction.
     *
     * @example
     * ```typescript
     * agent.initMpp({ secretKey: 'S...', network: 'stellar:testnet', mode: 'pull' });
     * const data = await agent.mppFetch('http://localhost:3403/signals/trading');
     * ```
     */
    initMpp(config: MppConfig): void;
    /**
     * Fetch a paid resource via MPP Charge protocol.
     * The client automatically handles 402 challenge, auth-entry signing,
     * and Soroban SAC USDC settlement.
     * Returns the Response object.
     */
    mppFetch(url: string, init?: RequestInit): Promise<Response>;
    /** Close the WebSocket connection. */
    disconnect(): void;
}
export default Agent;
//# sourceMappingURL=index.d.ts.map