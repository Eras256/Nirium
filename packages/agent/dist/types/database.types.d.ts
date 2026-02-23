export interface Strategy {
    id: string;
    user_id: string;
    name: string;
    status: 'RUNNING' | 'STOPPED' | 'PENDING' | 'ERROR' | 'COMPLETED';
    config: StrategyConfig;
    created_at: string;
}
export interface StrategyConfig {
    type: string;
    asset: string;
    amount?: number;
    params?: Record<string, unknown>;
    risk_level?: 'low' | 'medium' | 'high' | 'extreme';
    auto_compound?: boolean;
    stop_loss_percentage?: number;
    take_profit_percentage?: number;
    max_base_fee?: number;
}
export interface LogEntry {
    id: string;
    message: string;
    level: 'info' | 'warn' | 'error' | 'success' | 'debug';
    agent_id?: string;
    details?: Record<string, unknown>;
    created_at: string;
}
export interface ApiKey {
    id: string;
    user_id: string;
    key_hash: string;
    name?: string;
    permissions: string[];
    created_at: string;
    last_used_at?: string;
    is_active: boolean;
}
export interface Webhook {
    id: string;
    user_id: string;
    url: string;
    events: WebhookEventType[];
    secret: string;
    is_active: boolean;
    failure_count: number;
    last_triggered_at?: string;
    created_at: string;
}
export type WebhookEventType = 'opportunity.detected' | 'execution.started' | 'execution.completed' | 'execution.failed' | 'strategy.activated' | 'strategy.deactivated' | 'market.alert' | 'health.warning';
export interface Subscription {
    id: string;
    user_id: string;
    filters: SubscriptionFilter;
    is_active: boolean;
    created_at: string;
}
export interface SubscriptionFilter {
    signal_types?: SignalType[];
    min_confidence?: number;
    min_profit_percentage?: number;
    pairs?: string[];
}
export type SignalType = 'path_arbitrage_opportunity' | 'cross_dex_opportunity' | 'price_deviation' | 'liquidity_change' | 'fee_spike' | 'flash_loan_opportunity' | 'blend_yield_shift' | 'strategy_trigger';
export interface Signal {
    id: string;
    type: SignalType;
    pair: string;
    data: {
        expectedProfit: number;
        profitPercentage: number;
        urgency: 'low' | 'medium' | 'high' | 'critical';
        confidence: number;
        timeToLive: number;
        details: string;
    };
    timestamp: string;
    expiresAt: string;
}
export interface MarketState {
    xlmPrice: number;
    /** Stellar base fee in stroops (not "gas price") */
    baseFee: number;
    lastUpdate: string;
    blendApy: {
        supply: number;
        borrow: number;
    };
    soroswapPoolDepth: number;
    /** Best bid/ask spread on the native SDEX */
    sdexSpread: number;
    /** Discovered profitable multi-hop paths from Horizon /paths/strict-receive */
    pathPaymentRoutes: PathPaymentRoute[];
    network: 'testnet' | 'mainnet';
}
export interface PathPaymentRoute {
    source: string;
    destination: string;
    path: string[];
    sourceAmount: number;
    destinationAmount: number;
    profitPercentage: number;
}
export interface AIDecision {
    action: 'path_arbitrage' | 'cross_dex_arb' | 'flash_loan' | 'blend_lend' | 'blend_borrow' | 'soroswap_swap' | 'hold' | 'rebalance' | 'exit';
    confidence: number;
    reasoning: string;
    params?: Record<string, unknown>;
}
export interface OpportunityConfig {
    minProfitPercentage: number;
    maxBaseFee: number;
    minLiquidity: number;
    minConfidence: number;
}
export interface SkillManifest {
    name: string;
    slug: string;
    version: string;
    description: string;
    author: string;
    category: SkillCategory;
    tags: string[];
    permissions: string[];
    actions: SkillAction[];
    triggers: string[];
    providers: string[];
    isBuiltIn: boolean;
    isInstalled: boolean;
    rating?: number;
    downloadCount?: number;
}
export type SkillCategory = 'trading' | 'analysis' | 'notification' | 'integration' | 'data' | 'utility' | 'security' | 'defi';
export interface SkillAction {
    name: string;
    description: string;
    parameters: SkillParameter[];
    handler: string;
}
export interface SkillParameter {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'object';
    description: string;
    required: boolean;
    default?: unknown;
}
export interface ExecutionResult {
    success: boolean;
    txHash?: string;
    profit?: number;
    gasUsed?: number;
    error?: string;
    timestamp: string;
    network: 'testnet' | 'mainnet';
    details?: Record<string, unknown>;
}
//# sourceMappingURL=database.types.d.ts.map