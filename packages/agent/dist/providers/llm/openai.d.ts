import { LLMProvider } from './base.js';
import { AIDecision, MarketState } from '../../types/database.types.js';
export declare class OpenAIProvider extends LLMProvider {
    name: string;
    model: string;
    private apiKey;
    private baseUrl;
    constructor(apiKey?: string, model?: string);
    analyze(marketSnapshot: MarketState, context: string): Promise<AIDecision>;
}
//# sourceMappingURL=openai.d.ts.map