export interface AgentConfig {
    apiKey: string;
    baseUrl?: string;
    wsUrl?: string;
}
export interface Signal {
    id: string;
    type: string;
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
    lastUpdate: string;
    blendApy: {
        supply: number;
        borrow: number;
    };
    soroswapPoolDepth: number;
    /** Best bid/ask spread on the native SDEX in basis points */
    sdexSpread: number;
    /** Discovered profitable multi-hop paths from Horizon */
    pathPaymentRoutes: PathPaymentRoute[];
    network: string;
}
export interface LoopStatus {
    isRunning: boolean;
    scanCount: number;
    uptime: number;
    marketState: MarketState | null;
    config: Record<string, unknown>;
    lastAiDecision: Record<string, unknown> | null;
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
 * // Get market data
 * const market = await agent.getMarket();
 * console.log('XLM Price:', market.xlmPrice);
 *
 * // Execute a strategy
 * const result = await agent.execute('flash-loan-arb', 'XLM', { amount: 5000 });
 * console.log('Profit:', result.profit);
 *
 * // Subscribe to real-time signals
 * agent.subscribe((signal) => {
 *   console.log('Signal:', signal.type, signal.data.details);
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
    constructor(config: AgentConfig);
    private request;
    /** Health check — returns true if agent is reachable. */
    ping(): Promise<boolean>;
    /** Detailed health information. */
    health(): Promise<Record<string, unknown>>;
    /** Detailed system health (Horizon, Soroban, WebSocket, IPFS). */
    systemHealth(): Promise<Record<string, unknown>>;
    /** Execute a strategy (routed through Testnet/Mainnet). */
    execute(strategy: string, asset: string, params?: Record<string, unknown>): Promise<ExecutionResult>;
    /** Demo execution (rate-limited, public). */
    executeDemo(strategy: string, asset: string): Promise<ExecutionResult>;
    /** Get current market state. */
    getMarket(): Promise<MarketState>;
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
    /** List all loaded skills. */
    getSkills(): Promise<{
        skills: Record<string, unknown>[];
        total: number;
    }>;
    /** Install a skill from source. */
    installSkill(source: string): Promise<Record<string, unknown>>;
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
    /** Close the WebSocket connection. */
    disconnect(): void;
}
export default Agent;
//# sourceMappingURL=index.d.ts.map