// ═══════════════════════════════════════════════════════════════
// nirium v0.3.0 — Official TypeScript SDK (x402 + MPP)
// ═══════════════════════════════════════════════════════════════

import WebSocket from 'ws';
// @ts-ignore — ESM subpath imports
import { x402Client as X402ClientClass, wrapFetchWithPayment } from '@x402/fetch';
// @ts-ignore
import { createEd25519Signer } from '@x402/stellar';
// @ts-ignore
import { ExactStellarScheme } from '@x402/stellar/exact/client';
import * as MppxModule from 'mppx';

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
    blendApy: { supply: number; borrow: number };
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
    agent: { healthy: boolean; uptime: number };
    horizon: { healthy: boolean; latencyMs?: number; error?: string };
    soroban: { healthy: boolean; latencyMs?: number; error?: string };
    websocket: { healthy: boolean; clients: number };
    ipfs: { gateway: string };
    llm: { provider: string; model: string };
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
export class Agent {
    private apiKey: string;
    private baseUrl: string;
    private wsUrl: string;
    private ws: WebSocket | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private signalCallbacks: Array<(signal: Signal) => void> = [];
    private logCallbacks: Array<(log: Record<string, unknown>) => void> = [];

    private token: string | null = null;

    private x402Client: { fetch: typeof fetch } | null = null;
    private mppClient: { fetch: typeof fetch } | null = null;

    constructor(config: AgentConfig) {
        this.apiKey = config.apiKey;
        this.baseUrl = (config.baseUrl || 'http://localhost:3001').replace(/\/$/, '');
        this.wsUrl = config.wsUrl || this.baseUrl.replace(/^http/, 'ws') + '/ws/signals';
        this.token = config.token || null;
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
            return data.status === 'operational' || data.status === 'online';
        } catch {
            return false;
        }
    }

    /** Detailed health information. */
    async health(): Promise<Record<string, unknown>> {
        return this.request('GET', '/health');
    }

    /** Detailed system health (Horizon, Soroban, WebSocket, IPFS, LLM). */
    async systemHealth(): Promise<SystemHealth> {
        return this.request('GET', '/api/system/health');
    }

    // ─── Execution ───────────────────────────────────────────

    /**
     * Execute a strategy (routed to actual Soroban contract).
     * Strategy names: flash-loan-arb, path-arbitrage, cross-dex, blend-yield, soroswap-swap
     */
    async execute(
        strategy: string,
        asset: string,
        params?: Record<string, unknown>
    ): Promise<ExecutionResult> {
        return this.request('POST', '/api/execute', { strategy, asset, params });
    }

    /**
     * Demo execution (Soroban dry-run simulation, no TX submitted).
     */
    async executeDemo(strategy: string, asset: string): Promise<ExecutionResult> {
        return this.request('POST', '/api/execute-demo', { strategy, asset });
    }

    // ─── Market Data ─────────────────────────────────────────

    /** Get current market state (real data from Horizon). */
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

    /** List all loaded skills (built-in + user-installed). */
    async getSkills(): Promise<{ skills: Skill[]; total: number }> {
        return this.request('GET', '/api/skills');
    }

    /** Install a skill by slug. */
    async installSkill(source: string): Promise<Skill> {
        return this.request('POST', '/api/skills/install', { source });
    }

    /** Uninstall a user-installed skill by slug. */
    async uninstallSkill(slug: string): Promise<{ success: boolean }> {
        return this.request('DELETE', `/api/skills/${slug}`);
    }

    // ─── Webhooks ────────────────────────────────────────────

    /** Register a webhook endpoint. */
    async registerWebhook(
        url: string,
        events: string[],
        secret?: string
    ): Promise<Webhook> {
        return this.request('POST', '/api/webhooks', { url, events, secret });
    }

    /** List all registered webhooks. */
    async getWebhooks(): Promise<Webhook[]> {
        return this.request('GET', '/api/webhooks');
    }

    /** Delete a webhook by ID. */
    async deleteWebhook(id: string): Promise<{ success: boolean }> {
        return this.request('DELETE', `/api/webhooks/${id}`);
    }

    /** Test a webhook (sends a test event). */
    async testWebhook(id: string): Promise<{ success: boolean; message: string }> {
        return this.request('POST', `/api/webhooks/${id}/test`);
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

        const authQuery = this.token ? `?token=${this.token}` : '';
        this.ws = new WebSocket(`${this.wsUrl}${authQuery}`);

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

    // ─── x402 Protocol ────────────────────────────────────────

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
    initX402(config: X402Config): void {
        const network = config.network || 'stellar:testnet';
        const signer = (createEd25519Signer as any)(config.secretKey, network);
        const rpcUrl = network.includes('testnet')
            ? 'https://soroban-testnet.stellar.org'
            : 'https://soroban.stellar.org';
        const client = new (X402ClientClass as any)().register(
            'stellar:*',
            new (ExactStellarScheme as any)(signer, { url: rpcUrl })
        );
        this.x402Client = { fetch: wrapFetchWithPayment(fetch, client) } as any;
    }

    /**
     * Fetch a paid resource via x402 protocol.
     * The client automatically handles 402 negotiation, auth-entry signing, and payment.
     * Returns the Response object — call .json() or .text() for the payload.
     */
    async x402Fetch(url: string, init?: RequestInit): Promise<Response> {
        if (!this.x402Client) {
            throw new Error('x402 client not initialized. Call agent.initX402() first.');
        }
        return this.x402Client.fetch(url, init);
    }

    // ─── MPP Protocol (Charge Mode) ────────────────────────────

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
    initMpp(config: MppConfig): void {
        const Mppx = (MppxModule as any).default || MppxModule;
        const mppx = Mppx.create({
            stellar: {
                charge: {
                    secretKey: config.secretKey,
                    network: config.network || 'stellar:testnet',
                    mode: config.mode || 'pull',
                },
            },
        });
        this.mppClient = mppx;
    }

    /**
     * Fetch a paid resource via MPP Charge protocol.
     * The client automatically handles 402 challenge, auth-entry signing,
     * and Soroban SAC USDC settlement.
     * Returns the Response object.
     */
    async mppFetch(url: string, init?: RequestInit): Promise<Response> {
        if (!this.mppClient) {
            throw new Error('MPP client not initialized. Call agent.initMpp() first.');
        }
        return this.mppClient.fetch(url, init);
    }

    // ─── Connection ─────────────────────────────────────────

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
