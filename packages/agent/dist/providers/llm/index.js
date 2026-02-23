// ═══════════════════════════════════════════════════════════════
// Nirium — Dynamic LLM Provider Router
// ═══════════════════════════════════════════════════════════════
import { OpenAIProvider } from './openai.js';
import { AnthropicProvider } from './anthropic.js';
import { GeminiProvider } from './gemini.js';
import { GrokProvider } from './grok.js';
import { OllamaProvider } from './ollama.js';
const PROVIDER_CONSTRUCTORS = {
    openai: () => new OpenAIProvider(),
    anthropic: () => new AnthropicProvider(),
    gemini: () => new GeminiProvider(),
    grok: () => new GrokProvider(),
    ollama: () => new OllamaProvider(),
};
let cachedProvider = null;
let cachedProviderName = null;
/**
 * Get the active LLM provider based on environment configuration.
 * Caches the provider instance for reuse.
 */
export function getLLMProvider() {
    const providerName = (process.env.ACTIVE_LLM_PROVIDER || 'ollama');
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
//# sourceMappingURL=index.js.map