import { LLMProvider } from './base.js';
import { MarketState, AIDecision } from '../../types/database.types.js';
/**
 * OpenRouter Provider
 * Aggregates multiple models through a unified API.
 */
export declare class OpenRouterProvider extends LLMProvider {
    name: string;
    model: string;
    apiKey: string | undefined;
    analyze(market: MarketState, context?: string): Promise<AIDecision>;
}
//# sourceMappingURL=openrouter.d.ts.map