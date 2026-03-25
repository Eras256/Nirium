import { LLMProvider } from './base.js';
import { MarketState, AIDecision } from '../../types/database.types.js';
export declare class OllamaProvider extends LLMProvider {
    name: string;
    model: string;
    baseUrl: string;
    analyze(market: MarketState, context?: string): Promise<AIDecision>;
}
//# sourceMappingURL=ollama.d.ts.map