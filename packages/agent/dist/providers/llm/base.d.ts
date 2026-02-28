import { MarketState, AIDecision } from '../../types/database.types.js';
export interface LLMConfig {
    apiKey?: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
}
export declare abstract class LLMProvider {
    protected config: LLMConfig;
    abstract name: string;
    abstract model: string;
    constructor(config?: LLMConfig);
    /**
     * Override provider configuration (BYOK support).
     */
    overrideConfig(newConfig: LLMConfig): this;
    /**
     * Analyze a market state and return a structured decision.
     */
    abstract analyze(market: MarketState, context?: string): Promise<AIDecision>;
    /**
     * Internal helper to parse structured JSON from LLM responses.
     */
    protected parseDecision(text: string): AIDecision;
}
//# sourceMappingURL=base.d.ts.map