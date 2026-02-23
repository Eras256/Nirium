// ═══════════════════════════════════════════════════════════════
// Nirium — Ollama Local LLM Provider
// ═══════════════════════════════════════════════════════════════
import { LLMProvider } from './base.js';
export class OllamaProvider extends LLMProvider {
    name = 'ollama';
    model;
    baseUrl;
    constructor(baseUrl, model) {
        super();
        this.baseUrl = baseUrl || process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
        this.model = model || 'llama3.1';
    }
    async analyze(marketSnapshot, context) {
        try {
            const response = await fetch(`${this.baseUrl}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: this.model,
                    messages: [
                        { role: 'system', content: this.buildSystemPrompt() },
                        { role: 'user', content: this.buildUserPrompt(marketSnapshot, context) },
                    ],
                    stream: false,
                    format: 'json',
                    options: {
                        temperature: 0.3,
                        num_predict: 1000,
                    },
                }),
            });
            if (!response.ok) {
                // Ollama might not be running — fall back gracefully
                return this.generateLocalDecision(marketSnapshot);
            }
            const data = await response.json();
            const content = data.message?.content;
            if (!content) {
                return this.generateLocalDecision(marketSnapshot);
            }
            return this.parseDecision(content);
        }
        catch (error) {
            // Ollama not available — use deterministic local analysis
            console.log('[Ollama] Not available, using local heuristic engine');
            return this.generateLocalDecision(marketSnapshot);
        }
    }
    /**
     * Deterministic local market analysis when Ollama is unavailable.
     * Uses simple heuristics based on market conditions.
     */
    generateLocalDecision(market) {
        // Check for path arbitrage opportunity
        if (market.pathPaymentRoutes.length > 0) {
            const bestRoute = market.pathPaymentRoutes.reduce((best, route) => route.profitPercentage > best.profitPercentage ? route : best, market.pathPaymentRoutes[0]);
            if (bestRoute.profitPercentage > 0.1) {
                return {
                    action: 'path_arbitrage',
                    confidence: Math.min(0.8, 0.5 + bestRoute.profitPercentage * 0.15),
                    reasoning: `Local heuristic: PathPayment route ${bestRoute.path.join(' \u2192 ')} profitable at ${bestRoute.profitPercentage.toFixed(3)}%.`,
                    params: { source: 'local_heuristic', model: 'deterministic', route: bestRoute.path },
                };
            }
        }
        // Check for cross-DEX arbitrage
        if (market.sdexSpread > 20 && market.soroswapPoolDepth > 100000) {
            return {
                action: 'cross_dex_arb',
                confidence: 0.65,
                reasoning: `Local heuristic: SDEX spread (${market.sdexSpread.toFixed(1)} bps) elevated with deep Soroswap pools (${market.soroswapPoolDepth.toLocaleString()} XLM). Cross-DEX arbitrage viable.`,
                params: { source: 'local_heuristic', model: 'deterministic' },
            };
        }
        // Check for Blend lending opportunity
        if (market.blendApy.supply > 3 && market.baseFee < 200) {
            return {
                action: 'blend_lend',
                confidence: 0.55,
                reasoning: `Local heuristic: Blend supply APY (${market.blendApy.supply.toFixed(2)}%) attractive. Base fee low (${market.baseFee} stroops).`,
                params: { source: 'local_heuristic', model: 'deterministic' },
            };
        }
        // Base fee spike — suggest exit
        if (market.baseFee > 500) {
            return {
                action: 'exit',
                confidence: 0.7,
                reasoning: `Local heuristic: Base fee spike detected (${market.baseFee} stroops). Network congestion likely.`,
                params: { source: 'local_heuristic', model: 'deterministic' },
            };
        }
        // Default: hold
        return {
            action: 'hold',
            confidence: 0.4,
            reasoning: `Local heuristic: No strong signals detected. XLM at $${market.xlmPrice.toFixed(4)}, standard conditions.`,
            params: { source: 'local_heuristic', model: 'deterministic' },
        };
    }
}
//# sourceMappingURL=ollama.js.map