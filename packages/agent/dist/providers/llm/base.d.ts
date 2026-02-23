import { AIDecision, MarketState } from '../../types/database.types.js';
export declare abstract class LLMProvider {
    abstract name: string;
    abstract model: string;
    /**
     * Analyze market data and return an AI decision.
     */
    abstract analyze(marketSnapshot: MarketState, context: string): Promise<AIDecision>;
    /**
     * Generate a system prompt for market analysis.
     */
    protected buildSystemPrompt(): string;
    /**
     * Build the user prompt with current market data.
     */
    protected buildUserPrompt(market: MarketState, context: string): string;
    /**
     * Parse and validate an AI response into a structured decision.
     */
    protected parseDecision(raw: string): AIDecision;
    /**
     * Return a safe fallback decision when parsing fails.
     */
    protected fallbackDecision(reason: string): AIDecision;
}
//# sourceMappingURL=base.d.ts.map