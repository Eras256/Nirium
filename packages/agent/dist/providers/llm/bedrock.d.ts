import { LLMProvider } from './base.js';
import { MarketState, AIDecision } from '../../types/database.types.js';
/**
 * AWS Bedrock Provider
 * Institutional-grade inference via Amazon.
 * Note: Requires AWS SDK v3 for SigV4 signing in production.
 */
export declare class BedrockProvider extends LLMProvider {
    name: string;
    model: string;
    accessKeyId: string | undefined;
    secretAccessKey: string | undefined;
    region: string;
    analyze(market: MarketState, context?: string): Promise<AIDecision>;
}
//# sourceMappingURL=bedrock.d.ts.map