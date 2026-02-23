// ═══════════════════════════════════════════════════════════════
// @nirium/sdk v0.1.0 — Official TypeScript SDK
// ═══════════════════════════════════════════════════════════════

import WebSocket from 'ws';

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
    blendApy: { supply: number; borrow: number };
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
export class Agent {
    private apiKey: string;
    private baseUrl: string;
    private wsUrl: string;
    private ws: WebSocket | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private signalCallbacks: Array<(signal: Signal) => void> = [];
    private logCallbacks: Array<(log: Record<string, unknown>) => void> = [];

    constructor(config: AgentConfig) {
        this.apiKey = config.apiKey;
        this.baseUrl = (config.baseUrl || 'http://localhost:3001').replace(/\/$/, '');
        this.wsUrl = config.wsUrl || this.baseUrl.replace(/^http/, 'ws') + '/ws/signals';
    }

    // ─── HTTP Methods ────────────────────────────────────────

    private async request<T>(
        method: string,
        path: string,
        body?: Record<string, unknown>
    ): Promise<T> {
        const url = `${this.baseUrl}${path}`;
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
        };

        const options: RequestInit = { method, headers };
        if (body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(url, options);

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: response.statusText }));
            throw new Error(`Nirium API Error [${response.status}]: ${JSON.stringify(error)}`);
        }

        return response.json() as Promise<T>;
    }

    // ─── Health ──────────────────────────────────────────────

    /** Health check — returns true if agent is reachable. */
    async ping(): Promise<boolean> {
        try {
            const data = await this.request<{ status: string }>('GET', '/health');
            return data.status === 'operational';
        } catch {
            return false;
        }
    }

    /** Detailed health information. */
    async health(): Promise<Record<string, unknown>> {
        return this.request('GET', '/health');
    }

    /** Detailed system health (Horizon, Soroban, WebSocket, IPFS). */
    async systemHealth(): Promise<Record<string, unknown>> {
        return this.request('GET', '/api/system/health');
    }

    // ─── Execution ───────────────────────────────────────────

    /** Execute a strategy (routed through Testnet/Mainnet). */
    async execute(
        strategy: string,
        asset: string,
        params?: Record<string, unknown>
    ): Promise<ExecutionResult> {
        return this.request('POST', '/api/execute', { strategy, asset, params });
    }

    /** Demo execution (rate-limited, public). */
    async executeDemo(strategy: string, asset: string): Promise<ExecutionResult> {
        return this.request('POST', '/api/execute-demo', { strategy, asset });
    }

    // ─── Market Data ─────────────────────────────────────────

    /** Get current market state. */
    async getMarket(): Promise<MarketState> {
        return this.request('GET', '/api/market');
    }

    /** Get autonomous loop status. */
    async getLoopStatus(): Promise<LoopStatus> {
        return this.request('GET', '/api/loop/status');
    }

    /** Start the autonomous scanning loop. */
    async startLoop(config?: Record<string, unknown>): Promise<{ success: boolean; message: string }> {
        return this.request('POST', '/api/loop/start', { config });
    }

    /** Stop the autonomous scanning loop. */
    async stopLoop(): Promise<{ success: boolean; message: string }> {
        return this.request('POST', '/api/loop/stop');
    }

    /** Trigger a manual market scan. */
    async triggerScan(): Promise<{ success: boolean; marketState: MarketState }> {
        return this.request('POST', '/api/loop/scan');
    }

    // ─── Subscriptions ───────────────────────────────────────

    /** Create a signal subscription with filters. */
    async createSubscription(
        options?: SubscriptionOptions
    ): Promise<Record<string, unknown>> {
        return this.request('POST', '/api/subscriptions', { filters: options });
    }

    /** Get recent signals. */
    async getRecentSignals(count = 20): Promise<{ signals: Signal[] }> {
        return this.request('GET', `/api/signals/recent?count=${count}`);
    }

    // ─── Skills ──────────────────────────────────────────────

    /** List all loaded skills. */
    async getSkills(): Promise<{ skills: Record<string, unknown>[]; total: number }> {
        return this.request('GET', '/api/skills');
    }

    /** Install a skill from source. */
    async installSkill(source: string): Promise<Record<string, unknown>> {
        return this.request('POST', '/api/skills/install', { source });
    }

    // ─── WebSocket ───────────────────────────────────────────

    /**
     * Subscribe to real-time signals via WebSocket.
     * Optionally filter by subscription ID.
     */
    subscribe(
        callback: (signal: Signal) => void,
        subscriptionId?: string
    ): void {
        this.signalCallbacks.push(callback);
        this.connectWebSocket(subscriptionId);
    }

    /**
     * Subscribe to real-time log messages.
     */
    onLog(callback: (log: Record<string, unknown>) => void): void {
        this.logCallbacks.push(callback);
        this.connectWebSocket();
    }

    private connectWebSocket(subscriptionId?: string): void {
        if (this.ws?.readyState === WebSocket.OPEN) return;

        this.ws = new WebSocket(this.wsUrl);

        this.ws.on('open', () => {
            console.log('[Nirium SDK] WebSocket connected');
            this.reconnectAttempts = 0;

            if (subscriptionId) {
                this.ws?.send(JSON.stringify({ type: 'subscribe', subscriptionId }));
            }
        });

        this.ws.on('message', (data: WebSocket.RawData) => {
            try {
                const message = JSON.parse(data.toString());

                if (message.type === 'signal') {
                    this.signalCallbacks.forEach(cb => cb(message as Signal));
                } else if (message.type === 'log') {
                    this.logCallbacks.forEach(cb => cb(message));
                }
            } catch (error) {
                // Ignore parse errors
            }
        });

        this.ws.on('close', () => {
            console.log('[Nirium SDK] WebSocket disconnected');
            this.attemptReconnect(subscriptionId);
        });

        this.ws.on('error', (error: Error) => {
            console.error('[Nirium SDK] WebSocket error:', error.message);
        });
    }

    private attemptReconnect(subscriptionId?: string): void {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('[Nirium SDK] Max reconnect attempts reached');
            return;
        }

        this.reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);

        setTimeout(() => {
            console.log(`[Nirium SDK] Reconnecting (attempt ${this.reconnectAttempts})...`);
            this.connectWebSocket(subscriptionId);
        }, delay);
    }

    /** Close the WebSocket connection. */
    disconnect(): void {
        this.maxReconnectAttempts = 0; // Prevent reconnection
        this.ws?.close();
        this.ws = null;
        this.signalCallbacks = [];
        this.logCallbacks = [];
    }
}

export default Agent;
