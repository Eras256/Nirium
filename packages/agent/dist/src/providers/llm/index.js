// ═══════════════════════════════════════════════════════════════
// Nirium — Dynamic LLM Provider Router
// ═══════════════════════════════════════════════════════════════
import { OpenAIProvider } from './openai.js';
import { AnthropicProvider } from './anthropic.js';
import { GeminiProvider } from './gemini.js';
import { GrokProvider } from './grok.js';
import { OllamaProvider } from './ollama.js';
import { MiniMaxProvider } from './minimax.js';
import { BedrockProvider } from './bedrock.js';
import { OpenRouterProvider } from './openrouter.js';
const PROVIDER_CONSTRUCTORS = {
    openai: () => new OpenAIProvider(),
    anthropic: () => new AnthropicProvider(),
    gemini: () => new GeminiProvider(),
    grok: () => new GrokProvider(),
    ollama: () => new OllamaProvider(),
    minimax: () => new MiniMaxProvider(),
    bedrock: () => new BedrockProvider(),
    openrouter: () => new OpenRouterProvider(),
};
let cachedProvider = null;
let cachedProviderName = null;
/**
 * Get the active LLM provider based on environment configuration or explicit config.
 * Caches the provider instance for reuse unless new config is provided.
 */
export function getLLMProvider(config) {
    const providerName = (config?.provider || process.env.ACTIVE_LLM_PROVIDER || 'ollama');
    // If a specific config is provided, we bypass the cache and return a new instance
    if (config && Object.keys(config).length > 0) {
        const constructor = PROVIDER_CONSTRUCTORS[providerName];
        if (constructor) {
            return constructor().overrideConfig(config);
        }
    }
    if (cachedProvider && cachedProviderName === providerName) {
        return cachedProvider;
    }
    const constructor = PROVIDER_CONSTRUCTORS[providerName];
    if (!constructor) {
        console.warn(`[LLM Router] Unknown provider "${providerName}", falling back to Ollama`);
        cachedProvider = new OllamaProvider();
        cachedProviderName = 'ollama';
        return cachedProvider;
    }
    cachedProvider = constructor();
    cachedProviderName = providerName;
    console.log(`[LLM Router] Active provider: ${cachedProvider.name} (${cachedProvider.model})`);
    return cachedProvider;
}
/**
 * Get all available provider names.
 */
export function getAvailableProviders() {
    return Object.keys(PROVIDER_CONSTRUCTORS);
}
/**
 * Invalidate the cached provider (forces re-initialization on next call).
 */
export function resetProvider() {
    cachedProvider = null;
    cachedProviderName = null;
}
export { LLMProvider } from './base.js';
export { OpenAIProvider } from './openai.js';
export { AnthropicProvider } from './anthropic.js';
export { GeminiProvider } from './gemini.js';
export { GrokProvider } from './grok.js';
export { OllamaProvider } from './ollama.js';
export { MiniMaxProvider } from './minimax.js';
export { BedrockProvider } from './bedrock.js';
export { OpenRouterProvider } from './openrouter.js';
//# sourceMappingURL=index.js.map