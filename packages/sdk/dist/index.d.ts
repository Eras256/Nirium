export interface AgentConfig {
    apiKey: string;
    baseUrl?: string;
    wsUrl?: string;
    /** JWT token for WebSocket auth (obtained from /api/auth/token) */
    token?: string;
}
/**
 * SEP-43 signer. Only `address` and `signAuthEntry` are required — that is all
 * x402 needs, and it is what browser wallets expose (Freighter, Stellar Wallets
 * Kit, Pollar). Lets the SDK pay from a browser without ever holding a secret.
 * @see https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0043.md
 */
export interface X402Signer {
    address: string;
    signAuthEntry: (authEntry: string, opts?: {
        networkPassphrase?: string;
        address?: string;
    }) => Promise<{
        signedAuthEntry: string;
        signerAddress?: string;
    }>;
    signTransaction?: (...args: any[]) => Promise<any>;
}
export interface X402Config {
    /**
     * Stellar secret key (S...) for auth-entry signing. Server-side only —
     * pass `signer` instead when running in a browser.
     */
    secretKey?: string;
    /**
     * SEP-43 signer to sign with instead of a raw key. Use this for wallets:
     * the key never leaves the wallet, so the SDK works client-side.
     * Exactly one of `secretKey` or `signer` is required.
     */
    signer?: X402Signer;
    /** CAIP-2 network ID (e.g. 'stellar:testnet' or 'stellar:pubnet') */
    network?: string;
    /** Soroban RPC endpoint override (defaults per network) */
    rpcUrl?: string;
}
export interface MppConfig {
    /**
     * Stellar secret key (S...) for Soroban auth-entry signing.
     *
     * SERVER-SIDE ONLY, and unlike x402 there is no wallet alternative: the
     * upstream `mppx` client takes a raw key and exposes no SEP-43 signer hook
     * (verified against mppx 0.6.31 — zero references to one). Do not ship this
     * to a browser. For browser payments use x402 with `initX402({ signer })`.
     */
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
export interface Subscription {
    id: string;
    userId: string;
    filters: SubscriptionOptions;
    createdAt: string;
}
export interface SubscriptionStats {
    totalSubscriptions: number;
    connectedClients: number;
    recentSignals: number;
}
export interface Strategy {
    id: string;
    name: string;
    description?: string;
    category: string;
    assets: string[];
    riskLevel: string;
    isBuiltIn: boolean;
    enabled: boolean;
}
export interface AuthKey {
    id: string;
    name: string;
    tier: string;
    createdAt: string;
    lastUsedAt?: string;
    isActive: boolean;
}
export interface RevenueStats {
    total: string;
    currency: string;
    count: number;
    feed: Array<{
        id: string;
        message: string;
        created_at: string;
    }>;
}
export interface LLMConfig {
    provider: 'openai' | 'anthropic' | 'ollama' | 'minimax' | 'gemini' | 'grok' | 'bedrock' | 'openrouter';
    model?: string;
    apiKey?: string;
    ollamaUrl?: string;
}
export interface ExecutionNode {
    id: string;
    name: string;
    status: 'active' | 'architected' | 'proposed';
    custody: string;
    network: 'testnet' | 'mainnet' | 'both';
    summary: string;
}
export interface PayoutRecipient {
    wallet: string;
    amount: string | number;
}
/**
 * Identity of the paying company. Required on mainnet — the Payouts node
 * collects it ahead of Mexico's LFPIORPI Fracción XVI (effective 2027-01-17).
 */
export interface PayoutClientInfo {
    legalName: string;
    taxId: string;
    repName: string;
}
export interface PayoutRunOptions {
    recipients: PayoutRecipient[];
    /** Must be true — the node returns 403 without it, on both networks. */
    acknowledgeTerms: boolean;
    asset?: string;
    memo?: string;
    runId?: string;
    /** Paying treasury (G-address). Defaults to the node's configured treasury. */
    treasury?: string;
    clientInfo?: PayoutClientInfo;
}
export interface PayoutRun {
    runId: string;
    /** Unsigned transaction — sign it with your own wallet, then call submitPayout. */
    xdr?: string;
    recipientCount?: number;
    totalAmount?: string;
    asset?: string;
    txHash?: string;
    cid?: string;
    pricing?: Record<string, unknown>;
    [key: string]: unknown;
}
export interface AgentAttestationInput {
    /** ed25519 public key of the agent, as a Stellar address (G...). */
    key: string;
    /** base64 or hex ed25519 signature over `nirium-audit-v1:<content_sha256>`. */
    signature: string;
    /** Optional free-form label for the agent (max 64 chars). */
    id?: string;
}
export interface AuditAnchorOptions {
    /** sha-256 hex (64 chars) of your evidence. Provide this or `record`. */
    hash?: string;
    /** Small JSON object (max 8KB) anchored verbatim. Anchor hashes, not personal data. */
    record?: Record<string, unknown>;
    txHash?: string;
    network?: string;
    tag?: string;
    /**
     * Attests *who* produced the evidence. The CID alone proves the fact wasn't
     * altered; this proves which agent declared it. An invalid signature is
     * rejected with 400 — nothing is anchored.
     */
    agent?: AgentAttestationInput;
}
export interface AuditAnchor {
    cid: string;
    contentSha256: string;
    gatewayUrl?: string;
    anchoredAt: string;
    /** Present when the anchor carried a verified agent attestation. */
    attestedBy?: string;
    [key: string]: unknown;
}
export interface ReportingPeriod {
    from?: string;
    to?: string;
    network?: 'testnet' | 'mainnet';
}
export interface ReportingSummary {
    node: string;
    period: {
        from: string | null;
        to: string | null;
    };
    network: string;
    payroll: {
        settledRuns: number;
        recipientsPaid: number;
        totalsByAsset: Record<string, string>;
        lastSettledAt: string | null;
    };
    payments: {
        count: number;
        totalUsdc: string;
        byGateway: Record<string, {
            count: number;
            totalUsdc: number;
        }>;
    };
    anchors: {
        count: number;
        latestCid: string | null;
    };
    generatedAt: string;
    disclaimer: string;
}
export interface TreasuryStrategyInput {
    address: string;
    name: string;
}
export interface TreasuryAssetInput {
    address: string;
    strategies: TreasuryStrategyInput[];
}
export interface TreasuryDeployOptions {
    /** Account that pays to deploy the vault and signs the returned XDR. */
    caller: string;
    /** Owns the vault: can rescue funds, pause strategies, and revoke rebalanceManager. */
    manager: string;
    /** Defaults to `manager`. */
    emergencyManager?: string;
    /** Defaults to `manager`. */
    feeReceiver?: string;
    /** Defaults to Nirium's configured role address; required as an explicit value on mainnet. */
    rebalanceManager?: string;
    assets: TreasuryAssetInput[];
    name: string;
    symbol: string;
}
export interface TreasuryDeployResult {
    ok: true;
    network: string;
    /** Unsigned — sign with `caller` and pass to submitTreasuryTx. */
    xdr: string;
    signWith: string;
    roles: {
        manager: string;
        emergencyManager: string;
        feeReceiver: string;
        rebalanceManager: string;
    };
    note: string;
}
export interface TreasuryDepositOptions {
    vault: string;
    /** Account funding the deposit; also who signs the returned XDR. */
    from: string;
    /** One amount per vault asset, in stroops, as strings — an i128 does not survive a JSON number. */
    amounts: Array<string | number>;
    /** Invest the deposit into the strategy immediately. Default true. */
    invest?: boolean;
    maxSlippageBps?: number;
}
export interface TreasuryWithdrawOptions {
    vault: string;
    /** Account holding the vault shares; also who signs the returned XDR. */
    from: string;
    /** Omit to withdraw everything the account holds. */
    shares?: string | number;
    maxSlippageBps?: number;
}
export interface TreasuryWithdrawResult {
    ok: true;
    network: string;
    vault: string;
    xdr: string;
    signWith: string;
    shares: string;
    heldShares: string;
    minAmountsOut: string[];
}
export interface TreasurySetRebalanceManagerOptions {
    vault: string;
    /** Must match the vault's current Manager on-chain — verified before building. */
    manager: string;
    rebalanceManager: string;
}
export interface TreasuryInstruction {
    kind: 'Unwind' | 'Invest';
    strategy: string;
    /** Stroops, as a string — an i128 does not survive a JSON number. */
    amount: string | number;
}
export interface TreasuryRebalanceOptions {
    vault: string;
    instructions: TreasuryInstruction[];
    /** Defaults to Nirium's configured rebalanceManager address. */
    caller?: string;
}
export interface TreasuryRebalanceResult {
    ok: true;
    network: string;
    vault: string;
    xdr: string;
    signWith: string;
    instructionCount: number;
}
export interface TreasuryRebalanceExecuteResult {
    ok: true;
    network: string;
    vault: string;
    hash: string;
    explorer: string;
    instructionCount: number;
    /** Present when an instruction amount was reduced to what the vault actually held. */
    clamped?: Array<{
        strategy: string;
        asked: string;
        used: string;
    }>;
}
export interface TreasurySubmitResult {
    ok: true;
    network: string;
    hash: string;
    explorer: string;
    /** Present when the submitted tx deployed a new vault. */
    contract?: string;
}
export interface TreasuryVaultRoles {
    manager: string;
    emergencyManager: string;
    feeReceiver: string;
    rebalanceManager: string;
}
export interface TreasuryVaultState {
    ok: true;
    network: string;
    vault: string;
    roles: TreasuryVaultRoles;
    assets?: unknown;
    totalManagedFunds?: unknown;
    /** Balance of `holder` in the vault's asset — only present when you passed `holder`. */
    holderBalance?: string;
    /** True only when Nirium holds RebalanceManager and NOT Manager on this vault. */
    niriumIsRebalanceManagerOnly: boolean | null;
    autonomousRebalancing: 'enabled' | 'invite-only' | 'not-managed-by-nirium';
}
export interface TreasuryVaultSummary {
    vault: string;
    manager: string;
    asset: string | null;
    strategy: string | null;
    label: string | null;
    deploy_tx: string | null;
    created_at: string;
    last_rebalance: string | null;
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
    /** List all active subscriptions for the current user. */
    getSubscriptions(): Promise<{
        subscriptions: Subscription[];
    }>;
    /** Delete a subscription by ID. */
    deleteSubscription(id: string): Promise<{
        message: string;
    }>;
    /** Get subscription stats (total, connected clients, recent signals). */
    getSubscriptionStats(): Promise<SubscriptionStats>;
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
    /** List skills available in the marketplace. */
    getSkillMarketplace(): Promise<{
        skills: Skill[];
        total: number;
    }>;
    /** Execute a custom action on an installed skill. */
    executeSkillAction(slug: string, action: string, params?: Record<string, unknown>, context?: Record<string, unknown>): Promise<Record<string, unknown>>;
    /** List available strategies (from loaded skills). */
    getStrategies(): Promise<{
        strategies: Strategy[];
        total: number;
        network: string;
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
    /** Get a JWT token for a Stellar wallet address. */
    getAuthToken(walletAddress: string): Promise<{
        token: string;
        expiresIn: string;
        userId: string;
    }>;
    /** Create a new API key. Requires auth. */
    createAuthKey(name: string, tier?: string): Promise<{
        apiKey: string;
        name: string;
        tier: string;
    }>;
    /** List API keys for the current user. Requires auth. */
    getAuthKeys(): Promise<{
        keys: AuthKey[];
    }>;
    /** Revoke an API key by ID. Requires auth. */
    revokeAuthKey(id: string): Promise<{
        message: string;
    }>;
    /** Get x402/MPP revenue stats and payment feed. */
    getRevenue(): Promise<RevenueStats>;
    /** Get protocol info (endpoints, LLM, version). */
    getInfo(): Promise<Record<string, unknown>>;
    /** List execution nodes with live status, custody model and network. */
    getNodes(): Promise<{
        nodes: ExecutionNode[];
    }>;
    /**
     * Build a batch payout (up to 100 recipients in one classic Stellar tx).
     * Returns an unsigned XDR to sign with your own wallet.
     *
     * `acknowledgeTerms: true` is mandatory on every network — the node replies
     * 403 without it. On mainnet the node is invite-only (institutional tier)
     * and additionally requires `clientInfo`.
     */
    createPayoutRun(options: PayoutRunOptions): Promise<PayoutRun>;
    /** Broadcast the payout XDR after signing it with your own wallet. */
    submitPayout(runId: string, signedXdr: string): Promise<PayoutRun>;
    /** Build a self-signed USDC trustline so a new recipient can receive payouts. */
    onboardPayoutRecipient(employee: string, options?: {
        asset?: string;
        sponsor?: string;
        limit?: string;
    }): Promise<{
        xdr: string;
        [key: string]: unknown;
    }>;
    /** Broadcast the signed trustline XDR from onboardPayoutRecipient. */
    submitPayoutOnboard(signedXdr: string): Promise<Record<string, unknown>>;
    /** Payout history for the current network, each with tx hash and IPFS receipt CID. */
    getPayoutRuns(): Promise<{
        runs: PayoutRun[];
    }>;
    /** Payouts Terms v1.0 — the text `acknowledgeTerms` accepts. */
    getPayoutTerms(): Promise<Record<string, unknown>>;
    /** Payouts node metadata: pricing tiers, mainnet access, legal notice. */
    getPayoutInfo(): Promise<Record<string, unknown>>;
    /**
     * Anchor evidence to IPFS and get back a CID — an integrity seal, not
     * notarization and not legal proof of content.
     *
     * Anchor a `hash` of your data rather than the data itself: IPFS content
     * cannot be deleted, so raw personal data would outlive any erasure request.
     */
    anchorAuditRecord(options: AuditAnchorOptions): Promise<AuditAnchor>;
    /** Audit Trail node metadata: limits, pricing and disclaimer. */
    getAuditInfo(): Promise<Record<string, unknown>>;
    /**
     * Institutional-format summary of payouts, x402/MPP receipts and anchors.
     * Not certified regulatory reporting — what you file remains your responsibility.
     */
    getReportingSummary(period?: ReportingPeriod): Promise<ReportingSummary>;
    /** Export rows as JSON. Use `format: 'csv'` via getReportingExportUrl for a file download. */
    getReportingExport(type: 'payroll' | 'payments' | 'anchors', period?: ReportingPeriod & {
        limit?: number;
    }): Promise<Record<string, unknown>>;
    /** URL for the CSV export, for handing to a browser download or a spreadsheet. */
    getReportingExportUrl(type: 'payroll' | 'payments' | 'anchors', period?: ReportingPeriod & {
        limit?: number;
    }): string;
    /** Treasury node metadata: role, custody model, fees, security notes. */
    getTreasuryInfo(): Promise<Record<string, unknown>>;
    /** Read a vault's roles, assets and managed funds. Pass `holder` to also get its balance in the vault asset. */
    getTreasuryVault(vaultId: string, holder?: string): Promise<TreasuryVaultState>;
    /** List vaults Nirium has deployed or read, on the current network. */
    getTreasuryVaults(manager?: string): Promise<{
        ok: boolean;
        network: string;
        vaults: TreasuryVaultSummary[];
    }>;
    /** Read which asset a strategy manages, as declared by the strategy itself — pairs it correctly before you deploy. */
    getTreasuryStrategyAsset(strategyId: string): Promise<{
        ok: boolean;
        network: string;
        strategy: string;
        asset: string;
    }>;
    /**
     * Build an unsigned XDR to deploy a DeFindex vault. `manager` keeps
     * control (rescue, pause, revoke); Nirium only ever holds
     * `rebalanceManager`, which cannot withdraw or change roles. Sign with
     * `caller` and submit via submitTreasuryTx.
     */
    deployTreasuryVault(options: TreasuryDeployOptions): Promise<TreasuryDeployResult>;
    /** Build an unsigned deposit XDR. Sign with `from` and submit via submitTreasuryTx. */
    depositToTreasuryVault(options: TreasuryDepositOptions): Promise<{
        ok: boolean;
        network: string;
        vault: string;
        xdr: string;
        signWith: string;
    }>;
    /** Build an unsigned withdraw XDR. Sign with `from` and submit via submitTreasuryTx. Omit `shares` to withdraw everything. */
    withdrawFromTreasuryVault(options: TreasuryWithdrawOptions): Promise<TreasuryWithdrawResult>;
    /**
     * Build an unsigned XDR handing the RebalanceManager role to a new
     * address. Only the vault's current Manager can sign it — the same door
     * that grants Nirium the role also revokes it.
     */
    setTreasuryRebalanceManager(options: TreasurySetRebalanceManagerOptions): Promise<{
        ok: boolean;
        network: string;
        vault: string;
        xdr: string;
        signWith: string;
        previous: string;
    }>;
    /**
     * Build an unsigned rebalance XDR (Unwind/Invest between the vault's own
     * strategies — no other instruction is expressible). Sign with the
     * vault's RebalanceManager and submit via submitTreasuryTx. To have
     * Nirium sign with its own key instead, see executeTreasuryRebalance.
     */
    buildTreasuryRebalance(options: TreasuryRebalanceOptions): Promise<TreasuryRebalanceResult>;
    /**
     * Sign and submit a rebalance with Nirium's own RebalanceManager key and
     * wait for confirmation. Only available where that key actually lives —
     * mainnet's receive-only box returns 501 by design, not a broken 500.
     */
    executeTreasuryRebalance(options: TreasuryRebalanceOptions): Promise<TreasuryRebalanceExecuteResult>;
    /** Broadcast an XDR you already signed (deploy/deposit/withdraw/rebalance/set-rebalance-manager) and wait for confirmation. */
    submitTreasuryTx(xdr: string): Promise<TreasurySubmitResult>;
    /** Update the active LLM provider (admin only). */
    configureLLM(config: LLMConfig): Promise<{
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
export interface X402ServeConfig {
    /** Cuenta Stellar que recibe los pagos. Sin esto no hay a quién cobrarle. */
    payTo: string;
    /** `'GET /signals': '$0.02'` — el método es opcional y default GET. */
    routes: Record<string, string | {
        price: string;
        description?: string;
    }>;
    network?: 'stellar:testnet' | 'stellar:pubnet';
    /** Default: OpenZeppelin Channels, el facilitador canónico de Stellar. */
    facilitatorUrl?: string;
    /** Mainnet lo exige; testnet no. */
    facilitatorApiKey?: string;
    facilitatorAuthHeader?: string;
    appName?: string;
    appLogo?: string;
}
export declare function x402Serve(config: X402ServeConfig): any;
export default Agent;
//# sourceMappingURL=index.d.ts.map