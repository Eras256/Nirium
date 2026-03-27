import { LLMProvider } from './base.js';
import { MarketState, AIDecision } from '../../types/database.types.js';
/**
 * MiniMax LLM Provider (China's high-efficiency choice).
 * Supports the abab6.5s-chat and newer models.
 */
export declare class MiniMaxProvider extends LLMProvider {
    name: string;
    model: string;
    apiKey: string | undefined;
    analyze(market: MarketState, context?: string): Promise<AIDecision>;
}
//# sourceMappingURL=minimax.d.ts.map