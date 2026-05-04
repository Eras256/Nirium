export type SignalType =
    | 'path_arbitrage_opportunity'
    | 'cross_dex_opportunity'
    | 'blend_yield_shift'
    | 'fee_spike'
    | 'flash_loan_opportunity'
    | 'liquidity_change'
    | 'strategy_trigger';

export interface Signal {
    id: string;
    signal_type: SignalType;
    pair: string;
    timestamp: string;
    expiresAt: string;
    data: {
        expectedProfit: number;
        profitPercentage: number;
        urgency: 'low' | 'medium' | 'high' | 'critical';
        confidence: number;
        timeToLive: number;
        details: string;
    };
}

export interface MarketState {
    xlmPrice: number;
    baseFee: number;
    sdexSpread: number | null;
    soroswapPoolDepth: number;
    blendApy: {
        supply: number;
        borrow: number;
    };
    etherfuseApy: number;
    pathPaymentRoutes: Array<{
        source: string;
        destination: string;
        sourceAmount: number;
        destinationAmount: number;
        profitPercentage: number;
        path: string[];
    }>;
    timestamp: string;
}

export interface AIDecision {
    action: 'buy' | 'sell' | 'hold';
    confidence: number;
    reasoning: string;
    timestamp: string;
}

export interface OpportunityConfig {
    minProfitPercentage: number;
    maxBaseFee: number;
    minLiquidity: number;
    minConfidence: number;
}

export interface LogEntry {
    id: string;
    message: string;
    level: 'info' | 'warn' | 'error' | 'success' | 'system';
    details?: Record<string, unknown>;
    created_at: string;
}

export interface Subscription {
    id: string;
    user_id: string;
    filters: SubscriptionFilter;
    is_active: boolean;
    created_at: string;
}

export interface SubscriptionFilter {
    pairs?: string[];
    minConfidence?: number;
    types?: SignalType[];
}

export interface ExecutionResult {
    success: boolean;
    txHash?: string;
    profit?: number;
    gasUsed?: number;
    error?: string;
    timestamp: string;
    network: string;
    details?: {
        strategy: string;
        asset: string;
        executionTime: number;
        contractId?: string;
        amount?: number;
        profitPercentage?: number;
        simulatedPrices?: Record<string, number>;
        [key: string]: any;
    };
}
