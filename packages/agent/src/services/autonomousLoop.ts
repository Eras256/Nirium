// ═══════════════════════════════════════════════════════════════
// Nirium — Autonomous Market Scanner Loop
// Corrected for Stellar-native atomic primitives
// ═══════════════════════════════════════════════════════════════

import { v4 as uuidv4 } from 'uuid';
import { fetchMarketState } from '../providers/stellarProvider.js';
import { getLLMProvider } from '../providers/llm/index.js';
import { MarketState, Signal, SignalType, OpportunityConfig, AIDecision } from '../types/database.types.js';

type BroadcastFn = (level: string, message: string, details?: Record<string, unknown>) => void;
type SignalBroadcastFn = (signal: Signal) => void;

const DEFAULT_CONFIG: OpportunityConfig = {
    minProfitPercentage: 0.3,
    maxBaseFee: 500,
    minLiquidity: 50000,
    minConfidence: 0.5,
};

let isRunning = false;
let loopInterval: ReturnType<typeof setInterval> | null = null;
let currentMarketState: MarketState | null = null;
let scanCount = 0;
let startTime: number | null = null;
let config: OpportunityConfig = { ...DEFAULT_CONFIG };
let broadcastLog: BroadcastFn = () => { };
let broadcastSignal: SignalBroadcastFn = () => { };
let lastAiDecision: AIDecision | null = null;

/**
 * Initialize the autonomous loop with broadcast functions.
 */
export function initializeLoop(logFn: BroadcastFn, signalFn: SignalBroadcastFn): void {
    broadcastLog = logFn;
    broadcastSignal = signalFn;
}

/**
 * Perform a single market scan cycle.
 */
export async function performScan(): Promise<MarketState> {
    scanCount++;
    broadcastLog('info', `[Scan #${scanCount}] Fetching market data...`);

    const market = await fetchMarketState();
    currentMarketState = market;

    broadcastLog('info', `[Scan #${scanCount}] XLM: $${market.xlmPrice.toFixed(4)} | Base Fee: ${market.baseFee} stroops | Blend APY: ${market.blendApy.supply.toFixed(2)}% | SDEX Spread: ${market.sdexSpread.toFixed(1)} bps`);

    // Check for signal conditions
    await checkOpportunities(market);

    return market;
}

/**
 * Check market conditions against configured thresholds and emit signals.
 * Uses Stellar-native market data: path payments, SDEX orderbook, Blend.
 */
async function checkOpportunities(market: MarketState): Promise<void> {
    // 1. PATH PAYMENT ARBITRAGE — Check discovered routes from Horizon
    for (const route of market.pathPaymentRoutes) {
        if (route.profitPercentage >= config.minProfitPercentage) {
            emitSignal('path_arbitrage_opportunity', `${route.source}-${route.destination}`, {
                expectedProfit: route.destinationAmount - route.sourceAmount,
                profitPercentage: route.profitPercentage,
                urgency: route.profitPercentage > 1 ? 'high' : 'medium',
                confidence: Math.min(0.9, 0.5 + route.profitPercentage * 0.2),
                timeToLive: 60, // Path routes expire fast
                details: `PathPaymentStrictReceive: ${route.path.join(' → ')}. Profit: ${route.profitPercentage.toFixed(3)}%. Route: atomic multi-hop via Horizon.`,
            });
        }
    }

    // 2. SDEX vs SOROSWAP ARBITRAGE — Compare native orderbook vs AMM reserves
    if (market.sdexSpread > 20 && market.soroswapPoolDepth > config.minLiquidity) {
        const spreadProfitEst = (market.sdexSpread / 10000) * 100; // Convert bps to %
        if (spreadProfitEst >= config.minProfitPercentage) {
            emitSignal('cross_dex_opportunity', 'XLM-USDC', {
                expectedProfit: spreadProfitEst * 1000,
                profitPercentage: spreadProfitEst,
                urgency: spreadProfitEst > 0.5 ? 'high' : 'medium',
                confidence: Math.min(0.85, 0.4 + spreadProfitEst * 0.3),
                timeToLive: 90,
                details: `SDEX spread: ${market.sdexSpread.toFixed(1)} bps vs Soroswap pool depth: ${market.soroswapPoolDepth.toLocaleString()} XLM. Cross-DEX arbitrage viable via multi-operation transaction.`,
            });
        }
    }

    // 3. BLEND YIELD SHIFT — Monitor supply/borrow rate changes
    if (market.blendApy.supply > 5 && market.soroswapPoolDepth > config.minLiquidity) {
        const profitPct = (market.blendApy.supply - 3.5) * 0.3;
        if (profitPct >= config.minProfitPercentage) {
            emitSignal('blend_yield_shift', 'XLM-BLEND', {
                expectedProfit: profitPct * 1000,
                profitPercentage: profitPct,
                urgency: profitPct > 1 ? 'high' : 'medium',
                confidence: Math.min(0.85, 0.5 + profitPct * 0.15),
                timeToLive: 120,
                details: `Blend supply APY elevated at ${market.blendApy.supply.toFixed(2)}%. Recursive borrow/lend cycle viable.`,
            });
        }
    }

    // 4. BASE FEE SPIKE — Stellar uses base fee, not gas price
    if (market.baseFee > config.maxBaseFee) {
        emitSignal('fee_spike', 'NETWORK', {
            expectedProfit: 0,
            profitPercentage: 0,
            urgency: market.baseFee > 1000 ? 'critical' : 'high',
            confidence: 0.9,
            timeToLive: 60,
            details: `Base fee spike: ${market.baseFee} stroops (threshold: ${config.maxBaseFee}). Operations may be costly.`,
        });
    }

    // 5. FLASH LOAN OPPORTUNITY — Supply/borrow spread via Soroban single-invocation
    if (market.blendApy.borrow < market.blendApy.supply && market.soroswapPoolDepth > 200000) {
        const spread = market.blendApy.supply - market.blendApy.borrow;
        if (spread > 0.5) {
            emitSignal('flash_loan_opportunity', 'XLM-BLEND', {
                expectedProfit: spread * 500,
                profitPercentage: spread * 0.1,
                urgency: spread > 2 ? 'high' : 'medium',
                confidence: Math.min(0.8, 0.4 + spread * 0.1),
                timeToLive: 180,
                details: `Supply-borrow spread: ${spread.toFixed(2)}%. Single-invocation Soroban flash loan viable (panic! = auto-revert).`,
            });
        }
    }

    // 6. LIQUIDITY CHANGES
    if (market.soroswapPoolDepth < config.minLiquidity) {
        emitSignal('liquidity_change', 'SOROSWAP', {
            expectedProfit: 0,
            profitPercentage: 0,
            urgency: 'medium',
            confidence: 0.7,
            timeToLive: 300,
            details: `Soroswap pool depth dropped to ${market.soroswapPoolDepth.toLocaleString()} XLM (min: ${config.minLiquidity.toLocaleString()}).`,
        });
    }

    // 7. AI ANALYSIS (every 5th scan to conserve API calls)
    if (scanCount % 5 === 0) {
        try {
            const llm = getLLMProvider();
            const context = lastAiDecision
                ? `Previous decision: ${lastAiDecision.action} (confidence: ${lastAiDecision.confidence})`
                : 'First analysis cycle.';
            const decision = await llm.analyze(market, context);
            lastAiDecision = decision;

            broadcastLog('info', `[AI ${llm.name}] Decision: ${decision.action} (${(decision.confidence * 100).toFixed(0)}%) — ${decision.reasoning}`);

            if (decision.confidence >= config.minConfidence && decision.action !== 'hold') {
                emitSignal('strategy_trigger', 'AI-DECISION', {
                    expectedProfit: 0,
                    profitPercentage: 0,
                    urgency: decision.confidence > 0.8 ? 'high' : 'medium',
                    confidence: decision.confidence,
                    timeToLive: 300,
                    details: `AI recommends: ${decision.action}. ${decision.reasoning}`,
                });
            }
        } catch (error) {
            broadcastLog('warn', `[AI] Analysis failed: ${error}`);
        }
    }
}

/**
 * Emit a signal to all subscribers.
 */
function emitSignal(type: SignalType, pair: string, data: Signal['data']): void {
    const signal: Signal = {
        id: uuidv4(),
        type,
        pair,
        data,
        timestamp: new Date().toISOString(),
        expiresAt: new Date(Date.now() + data.timeToLive * 1000).toISOString(),
    };

    broadcastLog('success', `[Signal] ${type}: ${data.details}`);
    broadcastSignal(signal);
}

/**
 * Start the autonomous scanning loop.
 */
export function startLoop(userConfig?: Partial<OpportunityConfig>): { success: boolean; message: string } {
    if (isRunning) {
        return { success: false, message: 'Loop is already running' };
    }

    if (userConfig) {
        config = { ...DEFAULT_CONFIG, ...userConfig };
    }

    isRunning = true;
    startTime = Date.now();
    scanCount = 0;

    broadcastLog('success', '🚀 Autonomous scanning loop started');
    broadcastLog('info', `Config: minProfit=${config.minProfitPercentage}%, maxBaseFee=${config.maxBaseFee}, minLiquidity=${config.minLiquidity}`);

    // Initial scan
    performScan().catch(err => broadcastLog('error', `Scan error: ${err}`));

    // Schedule recurring scans every 30 seconds
    loopInterval = setInterval(() => {
        performScan().catch(err => broadcastLog('error', `Scan error: ${err}`));
    }, 30_000);

    return { success: true, message: 'Autonomous loop started' };
}

/**
 * Stop the autonomous scanning loop.
 */
export function stopLoop(): { success: boolean; message: string } {
    if (!isRunning) {
        return { success: false, message: 'Loop is not running' };
    }

    if (loopInterval) {
        clearInterval(loopInterval);
        loopInterval = null;
    }

    isRunning = false;
    broadcastLog('warn', '⏹ Autonomous scanning loop stopped');

    return { success: true, message: 'Autonomous loop stopped' };
}

/**
 * Get the current loop status.
 */
export function getLoopStatus(): {
    isRunning: boolean;
    scanCount: number;
    uptime: number;
    marketState: MarketState | null;
    config: OpportunityConfig;
    lastAiDecision: AIDecision | null;
} {
    return {
        isRunning,
        scanCount,
        uptime: startTime ? Math.floor((Date.now() - startTime) / 1000) : 0,
        marketState: currentMarketState,
        config,
        lastAiDecision,
    };
}

/**
 * Get the current market state (last fetched).
 */
export function getCurrentMarketState(): MarketState | null {
    return currentMarketState;
}
