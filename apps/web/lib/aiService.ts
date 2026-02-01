/**
 * Nirium AI Service Helper
 * Manages LLM provider configuration and synchronization with the agent backend.
 */

export interface LLMConfig {
    provider: 'nirium' | 'openai' | 'anthropic' | 'ollama' | 'minimax' | 'gemini' | 'grok' | 'bedrock' | 'openrouter';
    model: string;
    apiKey?: string;
    ollamaUrl?: string;
}

const STORAGE_KEY = 'nirium_ai_config';

export const aiService = {
    /**
     * Save AI configuration to local storage and sync with backend
     */
    async saveConfig(config: LLMConfig): Promise<{ success: boolean; message: string }> {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(config));

        try {
            const response = await fetch('/api/config/llm', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(config),
            });

            const data = await response.json();
            return {
                success: data.success,
                message: data.message || (data.success ? 'Configuration synced' : 'Sync failed')
            };
        } catch (error) {
            console.error('[AI Service] Failed to sync config:', error);
            // Even if sync fails, we keep it in local storage for the UI
            return { success: false, message: 'Backend sync failed. Config saved locally.' };
        }
    },

    /**
     * Get current AI configuration
     */
    getConfig(): LLMConfig {
        if (typeof window === 'undefined') {
            return {
                provider: 'nirium',
                model: 'nirium-matrix-v1',
            };
        }

        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error('[AI Service] Invalid config record:', e);
            }
        }
        return {
            provider: 'nirium',
            model: 'nirium-matrix-v1',
        };
    },

    /**
     * Test connection to a local Ollama instance
     */
    async testOllama(url: string): Promise<boolean> {
        try {
            const response = await fetch(`${url}/api/tags`, {
                method: 'GET',
            });
            return response.ok;
        } catch (error) {
            console.error('[AI Service] Ollama connection failed:', error);
            return false;
        }
    }
};
