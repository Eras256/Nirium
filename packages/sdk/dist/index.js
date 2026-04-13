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
    apiKey;
    baseUrl;
    wsUrl;
    ws = null;
    reconnectAttempts = 0;
    maxReconnectAttempts = 5;
    signalCallbacks = [];
    logCallbacks = [];
    token = null;
    x402Client = null;
    mppClient = null;
    constructor(config) {
        this.apiKey = config.apiKey;
        this.baseUrl = (config.baseUrl || 'http://localhost:3001').replace(/\/$/, '');
        this.wsUrl = config.wsUrl || this.baseUrl.replace(/^http/, 'ws') + '/ws/signals';
        this.token = config.token || null;
    }
    // ─── HTTP Methods ────────────────────────────────────────
    async request(method, path, body) {
        const url = `${this.baseUrl}${path}`;
        const headers = {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
        };
        const options = { method, headers };
        if (body) {
            options.body = JSON.stringify(body);
        }
        const response = await fetch(url, options);
        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: response.statusText }));
            throw new Error(`Nirium API Error [${response.status}]: ${JSON.stringify(error)}`);
        }
        return response.json();
    }
    // ─── Health ──────────────────────────────────────────────
    /** Health check — returns true if agent is reachable. */
    async ping() {
        try {
            const data = await this.request('GET', '/health');
            return data.status === 'operational' || data.status === 'online';
        }
        catch {
            return false;
        }
    }
    /** Detailed health information. */
    async health() {
        return this.request('GET', '/health');
    }
    /** Detailed system health (Horizon, Soroban, WebSocket, IPFS, LLM). */
    async systemHealth() {
        return this.request('GET', '/api/system/health');
    }
    // ─── Execution ───────────────────────────────────────────
    /**
     * Execute a strategy (routed to actual Soroban contract).
     * Strategy names: flash-loan-arb, path-arbitrage, cross-dex, blend-yield, soroswap-swap
     */
    async execute(strategy, asset, params) {
        return this.request('POST', '/api/execute', { strategy, asset, params });
    }
    /**
     * Demo execution (Soroban dry-run simulation, no TX submitted).
     */
    async executeDemo(strategy, asset) {
        return this.request('POST', '/api/execute-demo', { strategy, asset });
    }
    // ─── Market Data ─────────────────────────────────────────
    /** Get current market state (real data from Horizon). */
    async getMarket() {
        return this.request('GET', '/api/market');
    }
    /** Get autonomous loop status. */
    async getLoopStatus() {
        return this.request('GET', '/api/loop/status');
    }
    /** Start the autonomous scanning loop. */
    async startLoop(config) {
        return this.request('POST', '/api/loop/start', { config });
    }
    /** Stop the autonomous scanning loop. */
    async stopLoop() {
        return this.request('POST', '/api/loop/stop');
    }
    /** Trigger a manual market scan. */
    async triggerScan() {
        return this.request('POST', '/api/loop/scan');
    }
    // ─── Subscriptions ───────────────────────────────────────
    /** Create a signal subscription with filters. */
    async createSubscription(options) {
        return this.request('POST', '/api/subscriptions', { filters: options });
    }
    /** Get recent signals. */
    async getRecentSignals(count = 20) {
        return this.request('GET', `/api/signals/recent?count=${count}`);
    }
    // ─── Skills ──────────────────────────────────────────────
    /** List all loaded skills (built-in + user-installed). */
    async getSkills() {
        return this.request('GET', '/api/skills');
    }
    /** Install a skill by slug. */
    async installSkill(source) {
        return this.request('POST', '/api/skills/install', { source });
    }
    /** Uninstall a user-installed skill by slug. */
    async uninstallSkill(slug) {
        return this.request('DELETE', `/api/skills/${slug}`);
    }
    // ─── Webhooks ────────────────────────────────────────────
    /** Register a webhook endpoint. */
    async registerWebhook(url, events, secret) {
        return this.request('POST', '/api/webhooks', { url, events, secret });
    }
    /** List all registered webhooks. */
    async getWebhooks() {
        return this.request('GET', '/api/webhooks');
    }
    /** Delete a webhook by ID. */
    async deleteWebhook(id) {
        return this.request('DELETE', `/api/webhooks/${id}`);
    }
    /** Test a webhook (sends a test event). */
    async testWebhook(id) {
        return this.request('POST', `/api/webhooks/${id}/test`);
    }
    // ─── WebSocket ───────────────────────────────────────────
    /**
     * Subscribe to real-time signals via WebSocket.
     * Optionally filter by subscription ID.
     */
    subscribe(callback, subscriptionId) {
        this.signalCallbacks.push(callback);
        this.connectWebSocket(subscriptionId);
    }
    /**
     * Subscribe to real-time log messages.
     */
    onLog(callback) {
        this.logCallbacks.push(callback);
        this.connectWebSocket();
    }
    connectWebSocket(subscriptionId) {
        if (this.ws?.readyState === WebSocket.OPEN)
            return;
        const authQuery = this.token ? `?token=${this.token}` : '';
        this.ws = new WebSocket(`${this.wsUrl}${authQuery}`);
        this.ws.on('open', () => {
            console.log('[Nirium SDK] WebSocket connected');
            this.reconnectAttempts = 0;
            if (subscriptionId) {
                this.ws?.send(JSON.stringify({ type: 'subscribe', subscriptionId }));
            }
        });
        this.ws.on('message', (data) => {
            try {
                const message = JSON.parse(data.toString());
                if (message.type === 'signal') {
                    this.signalCallbacks.forEach(cb => cb(message));
                }
                else if (message.type === 'log') {
                    this.logCallbacks.forEach(cb => cb(message));
                }
            }
            catch (error) {
                // Ignore parse errors
            }
        });
        this.ws.on('close', () => {
            console.log('[Nirium SDK] WebSocket disconnected');
            this.attemptReconnect(subscriptionId);
        });
        this.ws.on('error', (error) => {
            console.error('[Nirium SDK] WebSocket error:', error.message);
        });
    }
    attemptReconnect(subscriptionId) {
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
    initX402(config) {
        const network = config.network || 'stellar:testnet';
        const signer = createEd25519Signer(config.secretKey, network);
        const rpcUrl = network.includes('testnet')
            ? 'https://soroban-testnet.stellar.org'
            : 'https://soroban.stellar.org';
        const client = new X402ClientClass().register('stellar:*', new ExactStellarScheme(signer, { url: rpcUrl }));
        this.x402Client = { fetch: wrapFetchWithPayment(fetch, client) };
    }
    /**
     * Fetch a paid resource via x402 protocol.
     * The client automatically handles 402 negotiation, auth-entry signing, and payment.
     * Returns the Response object — call .json() or .text() for the payload.
     */
    async x402Fetch(url, init) {
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
    initMpp(config) {
        const Mppx = MppxModule.default || MppxModule;
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
    async mppFetch(url, init) {
        if (!this.mppClient) {
            throw new Error('MPP client not initialized. Call agent.initMpp() first.');
        }
        return this.mppClient.fetch(url, init);
    }
    // ─── Connection ─────────────────────────────────────────
    /** Close the WebSocket connection. */
    disconnect() {
        this.maxReconnectAttempts = 0; // Prevent reconnection
        this.ws?.close();
        this.ws = null;
        this.signalCallbacks = [];
        this.logCallbacks = [];
    }
}
export default Agent;
//# sourceMappingURL=index.js.map