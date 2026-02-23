import { LLMProvider } from './base.js';
import { AIDecision, MarketState } from '../../types/database.types.js';
export declare class OllamaProvider extends LLMProvider {
    name: string;
    model: string;
    private baseUrl;
    constructor(baseUrl?: string, model?: string);
    analyze(marketSnapshot: MarketState, context: string): Promise<AIDecision>;
    /**
     * Deterministic local market analysis when Ollama is unavailable.
     * Uses simple heuristics based on market conditions.
     */
    private generateLocalDecision;
}
//# sourceMappingURL=ollama.d.ts.map