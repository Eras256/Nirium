// ═══════════════════════════════════════════════════════════════
// nirium — Official TypeScript SDK (x402 + MPP)
// Versión: solo en package.json (no aquí: un número en un comentario se
// desincroniza y ya mintió antes — decía 0.6.2 estando en 0.7.0).
// ═══════════════════════════════════════════════════════════════
import WebSocket from 'ws';
// @ts-ignore — ESM subpath imports
import { x402Client as X402ClientClass, wrapFetchWithPayment } from '@x402/fetch';
// @ts-ignore
import { createEd25519Signer } from '@x402/stellar';
// @ts-ignore
import { ExactStellarScheme } from '@x402/stellar/exact/client';
import * as MppxModule from 'mppx';
/** Build a `?a=1&b=2` suffix, dropping undefined values. Returns '' when empty. */
function queryString(params) {
    if (!params)
        return '';
    const pairs = Object.entries(params).filter(([, v]) => v !== undefined && v !== null);
    return pairs.length ? `?${new URLSearchParams(pairs.map(([k, v]) => [k, String(v)])).toString()}` : '';
}
/**
 * NiriumClient — Full API + WebSocket wrapper for the Nirium Agent.
 *
 * @example
 * ```typescript
 * import { Agent } from 'nirium';
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
        return this.requestWithHeaders(method, path, body, {});
    }
    async requestWithHeaders(method, path, body, extraHeaders) {
        const url = `${this.baseUrl}${path}`;
        const headers = {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
            ...extraHeaders,
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
     * Execute a strategy via a real Soroban contract transaction on Stellar.
     * Strategy names: flash-loan-arb, path-arbitrage, cross-dex, blend-yield, soroswap-swap
     *
     * @param stellarAccount - Your Stellar wallet address (required for legal consent verification)
     */
    async execute(strategy, asset, params, stellarAccount) {
        const extraHeaders = {};
        if (stellarAccount) {
            extraHeaders['x-stellar-account'] = stellarAccount;
        }
        return this.requestWithHeaders('POST', '/api/execute', { strategy, asset, ...params }, extraHeaders);
    }
    /**
     * Demo execution (Soroban dry-run simulation, no TX submitted).
     * Returns a professional market assessment message.
     */
    async executeDemo(strategy, asset) {
        return this.request('POST', '/api/execute-demo', { strategy, asset });
    }
    // ─── Market Data ─────────────────────────────────────────
    /** Get asset price tickers (XLM, USDC) from Stellar Horizon. */
    async getTickers() {
        return this.request('GET', '/api/tickers');
    }
    /** Get current market state (real data from Horizon). */
    async getMarket() {
        return this.request('GET', '/api/market');
    }
    /** Get global protocol statistics. */
    async getStats() {
        return this.request('GET', '/api/stats/global');
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
    /** List all active subscriptions for the current user. */
    async getSubscriptions() {
        return this.request('GET', '/api/subscriptions');
    }
    /** Delete a subscription by ID. */
    async deleteSubscription(id) {
        return this.request('DELETE', `/api/subscriptions/${id}`);
    }
    /** Get subscription stats (total, connected clients, recent signals). */
    async getSubscriptionStats() {
        return this.request('GET', '/api/subscriptions/stats');
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
    /** List skills available in the marketplace. */
    async getSkillMarketplace() {
        return this.request('GET', '/api/skills/marketplace');
    }
    /** Execute a custom action on an installed skill. */
    async executeSkillAction(slug, action, params, context) {
        return this.request('POST', `/api/skills/${slug}/actions/${action}`, { params, context });
    }
    /** List available strategies (from loaded skills). */
    async getStrategies() {
        return this.request('GET', '/api/strategies');
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
    // ─── Auth Management ─────────────────────────────────────
    /** Get a JWT token for a Stellar wallet address. */
    async getAuthToken(walletAddress) {
        return this.request('POST', '/api/auth/token', { walletAddress });
    }
    /** Create a new API key. Requires auth. */
    async createAuthKey(name, tier) {
        return this.request('POST', '/api/auth/keys', { name, tier });
    }
    /** List API keys for the current user. Requires auth. */
    async getAuthKeys() {
        return this.request('GET', '/api/auth/keys');
    }
    /** Revoke an API key by ID. Requires auth. */
    async revokeAuthKey(id) {
        return this.request('DELETE', `/api/auth/keys/${id}`);
    }
    // ─── Revenue & Info ──────────────────────────────────────
    /** Get x402/MPP revenue stats and payment feed. */
    async getRevenue() {
        return this.request('GET', '/api/revenue');
    }
    /** Get protocol info (endpoints, LLM, version). */
    async getInfo() {
        return this.request('GET', '/api/info');
    }
    // ─── Execution Nodes ─────────────────────────────────────
    /** List execution nodes with live status, custody model and network. */
    async getNodes() {
        return this.request('GET', '/api/nodes');
    }
    // ─── Payouts / Disbursements ─────────────────────────────
    //
    // Non-custodial by construction: the node builds an unsigned XDR, you sign
    // it with your own wallet and broadcast it via submitPayout. Nirium never
    // holds funds and never sees your keys.
    //
    // Licensed for independent service payments only (contractors, freelancers,
    // B2B) — never for subordinate-employee salary. See getPayoutTerms().
    /**
     * Build a batch payout (up to 100 recipients in one classic Stellar tx).
     * Returns an unsigned XDR to sign with your own wallet.
     *
     * `acknowledgeTerms: true` is mandatory on every network — the node replies
     * 403 without it. On mainnet the node is invite-only (institutional tier)
     * and additionally requires `clientInfo`.
     */
    async createPayoutRun(options) {
        return this.request('POST', '/api/payroll/run', options);
    }
    /** Broadcast the payout XDR after signing it with your own wallet. */
    async submitPayout(runId, signedXdr) {
        return this.request('POST', '/api/payroll/submit', { runId, signedXdr });
    }
    /** Build a self-signed USDC trustline so a new recipient can receive payouts. */
    async onboardPayoutRecipient(employee, options) {
        return this.request('POST', '/api/payroll/onboard', { employee, ...options });
    }
    /** Broadcast the signed trustline XDR from onboardPayoutRecipient. */
    async submitPayoutOnboard(signedXdr) {
        return this.request('POST', '/api/payroll/onboard/submit', { signedXdr });
    }
    /** Payout history for the current network, each with tx hash and IPFS receipt CID. */
    async getPayoutRuns() {
        return this.request('GET', '/api/payroll/runs');
    }
    /** Payouts Terms v1.0 — the text `acknowledgeTerms` accepts. */
    async getPayoutTerms() {
        return this.request('GET', '/api/payroll/terms');
    }
    /** Payouts node metadata: pricing tiers, mainnet access, legal notice. */
    async getPayoutInfo() {
        return this.request('GET', '/api/payroll/info');
    }
    // ─── Audit Trail ─────────────────────────────────────────
    /**
     * Anchor evidence to IPFS and get back a CID — an integrity seal, not
     * notarization and not legal proof of content.
     *
     * Anchor a `hash` of your data rather than the data itself: IPFS content
     * cannot be deleted, so raw personal data would outlive any erasure request.
     */
    async anchorAuditRecord(options) {
        return this.request('POST', '/api/audit/log', options);
    }
    /** Audit Trail node metadata: limits, pricing and disclaimer. */
    async getAuditInfo() {
        return this.request('GET', '/api/audit/info');
    }
    // ─── Reporting ───────────────────────────────────────────
    /**
     * Institutional-format summary of payouts, x402/MPP receipts and anchors.
     * Not certified regulatory reporting — what you file remains your responsibility.
     */
    async getReportingSummary(period) {
        return this.request('GET', `/api/reporting/summary${queryString(period)}`);
    }
    /** Export rows as JSON. Use `format: 'csv'` via getReportingExportUrl for a file download. */
    async getReportingExport(type, period) {
        return this.request('GET', `/api/reporting/export${queryString({ ...period, type, format: 'json' })}`);
    }
    /** URL for the CSV export, for handing to a browser download or a spreadsheet. */
    getReportingExportUrl(type, period) {
        return `${this.baseUrl}/api/reporting/export${queryString({ ...period, type, format: 'csv' })}`;
    }
    // ─── Treasury (DeFindex) ─────────────────────────────────
    //
    // Nirium never holds these funds — it holds the RebalanceManager role of
    // a DeFindex vault the client deploys and owns. Every write below returns
    // an unsigned XDR; sign it yourself and call submitTreasuryTx.
    /** Treasury node metadata: role, custody model, fees, security notes. */
    async getTreasuryInfo() {
        return this.request('GET', '/api/treasury/info');
    }
    /** Read a vault's roles, assets and managed funds. Pass `holder` to also get its balance in the vault asset. */
    async getTreasuryVault(vaultId, holder) {
        return this.request('GET', `/api/treasury/vault/${vaultId}${queryString({ holder })}`);
    }
    /** List vaults Nirium has deployed or read, on the current network. */
    async getTreasuryVaults(manager) {
        return this.request('GET', `/api/treasury/vaults${queryString({ manager })}`);
    }
    /** Read which asset a strategy manages, as declared by the strategy itself — pairs it correctly before you deploy. */
    async getTreasuryStrategyAsset(strategyId) {
        return this.request('GET', `/api/treasury/strategy/${strategyId}`);
    }
    /**
     * Build an unsigned XDR to deploy a DeFindex vault. `manager` keeps
     * control (rescue, pause, revoke); Nirium only ever holds
     * `rebalanceManager`, which cannot withdraw or change roles. Sign with
     * `caller` and submit via submitTreasuryTx.
     */
    async deployTreasuryVault(options) {
        return this.request('POST', '/api/treasury/deploy', options);
    }
    /** Build an unsigned deposit XDR. Sign with `from` and submit via submitTreasuryTx. */
    async depositToTreasuryVault(options) {
        return this.request('POST', '/api/treasury/deposit', options);
    }
    /** Build an unsigned withdraw XDR. Sign with `from` and submit via submitTreasuryTx. Omit `shares` to withdraw everything. */
    async withdrawFromTreasuryVault(options) {
        return this.request('POST', '/api/treasury/withdraw', options);
    }
    /**
     * Build an unsigned XDR handing the RebalanceManager role to a new
     * address. Only the vault's current Manager can sign it — the same door
     * that grants Nirium the role also revokes it.
     */
    async setTreasuryRebalanceManager(options) {
        return this.request('POST', '/api/treasury/set-rebalance-manager', options);
    }
    /**
     * Build an unsigned rebalance XDR (Unwind/Invest between the vault's own
     * strategies — no other instruction is expressible). Sign with the
     * vault's RebalanceManager and submit via submitTreasuryTx. To have
     * Nirium sign with its own key instead, see executeTreasuryRebalance.
     */
    async buildTreasuryRebalance(options) {
        return this.request('POST', '/api/treasury/rebalance', options);
    }
    /**
     * Sign and submit a rebalance with Nirium's own RebalanceManager key and
     * wait for confirmation. Only available where that key actually lives —
     * mainnet's receive-only box returns 501 by design, not a broken 500.
     */
    async executeTreasuryRebalance(options) {
        return this.request('POST', '/api/treasury/rebalance/execute', options);
    }
    /** Broadcast an XDR you already signed (deploy/deposit/withdraw/rebalance/set-rebalance-manager) and wait for confirmation. */
    async submitTreasuryTx(xdr) {
        return this.request('POST', '/api/treasury/submit', { xdr });
    }
    // ─── Admin ───────────────────────────────────────────────
    /** Update the active LLM provider (admin only). */
    async configureLLM(config) {
        return this.request('POST', '/api/config/llm', config);
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
     * Sign with a raw key server-side, or with a SEP-43 wallet in the browser —
     * the same call either way.
     *
     * @example
     * ```typescript
     * // Server: raw key
     * agent.initX402({ secretKey: 'S...', network: 'stellar:testnet' });
     *
     * // Browser: the key never leaves the wallet
     * agent.initX402({ signer: freighterSigner, network: 'stellar:pubnet' });
     *
     * const data = await agent.x402Fetch('https://nirium-agent.fly.dev/api/v1/premium/signals');
     * ```
     */
    initX402(config) {
        const network = config.network || 'stellar:testnet';
        // Un signer externo o una llave cruda — nunca los dos, nunca ninguno.
        // Se valida aquí y no al pagar: un config mal armado debe fallar al
        // inicializar, no a mitad de un cobro.
        if (!config.signer && !config.secretKey) {
            throw new Error('initX402 requires either `secretKey` (server-side) or `signer` (SEP-43 wallet, browser-safe).');
        }
        if (config.signer && config.secretKey) {
            throw new Error('initX402 got both `secretKey` and `signer` — pass only one, so it is unambiguous which key signs.');
        }
        const signer = config.signer ?? createEd25519Signer(config.secretKey, network);
        // Pubnet: el SDF NO corre RPC público de mainnet — soroban.stellar.org no
        // existe. Default al RPC público de gateway.fm (mismo default que
        // @stellar/mpp); siempre overrideable por config.rpcUrl.
        const rpcUrl = config.rpcUrl || (network.includes('testnet')
            ? 'https://soroban-testnet.stellar.org'
            : 'https://soroban-rpc.mainnet.stellar.gateway.fm');
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
const X402_FACILITATORS = {
    'stellar:pubnet': 'https://channels.openzeppelin.com/x402',
    'stellar:testnet': 'https://channels.openzeppelin.com/x402/testnet',
};
export function x402Serve(config) {
    if (!config.payTo || !/^G[A-Z2-7]{55}$/.test(config.payTo)) {
        throw new Error('x402Serve: `payTo` must be a Stellar public key (G...). Without it there is nobody to pay.');
    }
    const entries = Object.entries(config.routes || {});
    if (entries.length === 0) {
        throw new Error('x402Serve: `routes` is empty — nothing would ever be charged for.');
    }
    const network = config.network || 'stellar:testnet';
    // Falla al montar, no al primer cobro. Y aplica a las DOS redes: probado
    // el 5-ago-2026, el facilitador de OpenZeppelin responde 401 a
    // `getSupported` también en testnet, así que sin llave el servidor no
    // llega ni a ofrecer un 402.
    if (!config.facilitatorApiKey && !config.facilitatorUrl) {
        throw new Error('x402Serve: `facilitatorApiKey` is required — the facilitator rejects unauthenticated '
            + 'servers on testnet too. Keys are PER NETWORK and free: '
            + 'channels.openzeppelin.com/testnet/gen for testnet, channels.openzeppelin.com/gen for '
            + 'mainnet. A mainnet key returns 401 against testnet. '
            + 'Or point `facilitatorUrl` at your own facilitator.');
    }
    // `import()` dinámico, no `require`.
    //
    // El dist del SDK se evalúa como ESM, donde `require` sencillamente no
    // existe — así que el try/catch lo leía como "falta el paquete" y decía
    // que instalaras algo que ya estaba instalado. Verificado el 5-ago-2026
    // desde una instalación limpia en Windows. `import()` funciona en los dos
    // formatos y distingue de verdad entre ausente y roto.
    const load = async (m) => {
        try {
            return await import(/* @vite-ignore */ m);
        }
        catch (err) {
            const missing = /cannot find (module|package)/i.test(String(err?.message));
            throw new Error(missing
                ? `x402Serve needs "${m}". Install it alongside the SDK: npm i @x402/express @x402/core @x402/stellar`
                : `x402Serve could not load "${m}": ${err?.message}`);
        }
    };
    const authHeader = config.facilitatorAuthHeader || 'Authorization';
    const headers = () => ({
        [authHeader]: authHeader.toLowerCase() === 'authorization'
            ? `Bearer ${config.facilitatorApiKey}`
            : String(config.facilitatorApiKey),
    });
    // 'GET /signals' y '/signals' significan lo mismo: el método se omite
    // porque casi todo cobro es un GET, y obligar a escribirlo es fricción.
    const routes = {};
    for (const [key, value] of entries) {
        const spec = typeof value === 'string' ? { price: value } : value;
        const routeKey = /^[A-Z]+\s/.test(key) ? key : `GET ${key}`;
        routes[routeKey] = {
            accepts: {
                scheme: 'exact',
                price: spec.price,
                network,
                payTo: config.payTo,
                ...(spec.description ? { description: spec.description } : {}),
            },
        };
    }
    // El middleware se construye en la PRIMERA petición, no aquí.
    //
    // `paymentMiddlewareFromConfig` dispara su inicialización contra el
    // facilitador de forma asíncrona al construirse, y si esa llamada falla
    // —llave mala, facilitador caído— la promesa rechaza sin dueño y **tumba
    // el proceso** con un stack de dentro de @x402/core. Verificado el
    // 5-ago-2026 con una llave inválida.
    //
    // Construyéndolo dentro del request, esa promesa es nuestra y se captura.
    // Un helper de tres líneas no puede matar el servidor de nadie: falla en
    // un 503 que dice qué revisar y deja el resto de la app en pie.
    const facilitatorUrl = config.facilitatorUrl || X402_FACILITATORS[network];
    // Preflight OBLIGATORIO antes de construir.
    //
    // No basta con capturar el error: `paymentMiddlewareFromConfig` guarda su
    // propia promesa de inicialización, y si el facilitador rechaza la llave
    // esa promesa queda sin dueño y **mata el proceso** aunque nosotros
    // respondamos 503. Verificado el 5-ago-2026.
    //
    // Así que se pregunta primero. Si el facilitador no acepta la llave, el
    // middleware nunca se construye y no hay promesa que explote.
    const preflight = async () => {
        const r = await fetch(`${facilitatorUrl}/supported`, {
            headers: config.facilitatorApiKey ? headers() : {},
            signal: AbortSignal.timeout(10000),
        });
        if (!r.ok) {
            throw new Error(r.status === 401 || r.status === 403
                ? `facilitator rejected the API key (${r.status}) — check facilitatorApiKey`
                : `facilitator returned ${r.status}`);
        }
    };
    let cached;
    const build = async () => {
        const [{ paymentMiddlewareFromConfig }, { HTTPFacilitatorClient }, { ExactStellarScheme: ServerScheme }] = await Promise.all([
            load('@x402/express'),
            load('@x402/core/server'),
            load('@x402/stellar/exact/server'),
        ]);
        const facilitator = new HTTPFacilitatorClient({
            url: facilitatorUrl,
            ...(config.facilitatorApiKey ? {
                createAuthHeaders: async () => ({ verify: headers(), settle: headers(), supported: headers() }),
            } : {}),
        });
        return paymentMiddlewareFromConfig(routes, facilitator, [{ network, server: new ServerScheme() }], {
            appName: config.appName || 'Nirium',
            ...(config.appLogo ? { appLogo: config.appLogo } : {}),
            testnet: network === 'stellar:testnet',
        });
    };
    const explain = (res, err) => {
        if (res.headersSent)
            return;
        const detail = err?.message ? String(err.message).slice(0, 200) : undefined;
        res.status(503).json({
            error: 'x402 payments unavailable',
            detail,
            hint: /401|unauthor/i.test(detail || '')
                ? 'the facilitator rejected the API key — check facilitatorApiKey'
                : 'the facilitator could not be reached',
        });
    };
    return async function niriumX402(req, res, next) {
        try {
            if (!cached) {
                await preflight();
                cached = await build();
            }
            await cached(req, res, next);
        }
        catch (err) {
            cached = undefined; // que el siguiente request reintente
            explain(res, err);
        }
    };
}
export default Agent;
//# sourceMappingURL=index.js.map