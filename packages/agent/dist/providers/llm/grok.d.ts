import { LLMProvider } from './base.js';
import { MarketState, AIDecision } from '../../types/database.types.js';
export declare class GrokProvider extends LLMProvider {
    name: string;
    model: string;
    apiKey: string | undefined;
    analyze(market: MarketState, context?: string): Promise<AIDecision>;
}
//# sourceMappingURL=grok.d.ts.map