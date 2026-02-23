import { LLMProvider } from './base.js';
export type ProviderName = 'openai' | 'anthropic' | 'gemini' | 'grok' | 'ollama';
/**
 * Get the active LLM provider based on environment configuration.
 * Caches the provider instance for reuse.
 */
export declare function getLLMProvider(): LLMProvider;
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
//# sourceMappingURL=index.d.ts.map