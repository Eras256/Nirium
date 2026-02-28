import { LLMProvider } from './base.js';
export type ProviderName = 'openai' | 'anthropic' | 'gemini' | 'grok' | 'ollama' | 'minimax' | 'bedrock' | 'openrouter';
/**
 * Get the active LLM provider based on environment configuration or explicit config.
 * Caches the provider instance for reuse unless new config is provided.
 */
export declare function getLLMProvider(config?: any): LLMProvider;
/**
 * Get all available provider names.
 */
export declare function getAvailableProviders(): ProviderName[];
/**
 * Invalidate the cached provider (forces re-initialization on next call).
 */
export declare function resetProvider(): void;
export { LLMProvider } from './base.js';
export { OpenAIProvider } from './openai.js';
export { AnthropicProvider } from './anthropic.js';
export { GeminiProvider } from './gemini.js';
export { GrokProvider } from './grok.js';
export { OllamaProvider } from './ollama.js';
export { MiniMaxProvider } from './minimax.js';
export { BedrockProvider } from './bedrock.js';
export { OpenRouterProvider } from './openrouter.js';
//# sourceMappingURL=index.d.ts.map