export interface LLMConfig {
    provider: 'nirium' | 'openai' | 'anthropic' | 'ollama' | 'minimax' | 'gemini' | 'grok' | 'bedrock' | 'openrouter';
    model: string;
    apiKey?: string;
    ollamaUrl?: string;
}

const STORAGE_KEY = 'nirium_ai_config';
const DEFAULT_CONFIG: LLMConfig = { provider: 'nirium', model: 'nirium-core-v1' };

export const aiService = {
    async saveConfig(config: LLMConfig): Promise<{ success: boolean; message: string }> {
        // Always persist locally first so the UI stays responsive
        localStorage.setItem(STORAGE_KEY, JSON.stringify(config));

        try {
            const res = await fetch('/api/config/llm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config),
            });

            const data = await res.json();
            if (!res.ok) {
                return { success: false, message: data.message || 'Sync rejected by server' };
            }
            return {
                success: data.success,
                message: data.message || (data.success ? 'Protocol synced' : 'Sync failed'),
            };
        } catch (err) {
            console.error('[AI Service] Sync failed:', err);
            return { success: false, message: 'Config saved locally — server unreachable' };
        }
    },

    getConfig(): LLMConfig {
        if (typeof window === 'undefined') return DEFAULT_CONFIG;

        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                return JSON.parse(saved) as LLMConfig;
            } catch {
                localStorage.removeItem(STORAGE_KEY);
            }
        }
        return DEFAULT_CONFIG;
    },

    async disconnect(): Promise<{ success: boolean; message: string }> {
        localStorage.removeItem(STORAGE_KEY);
        try {
            const res = await fetch('/api/config/llm', { method: 'DELETE' });
            const data = await res.json();
            return { success: true, message: data.message || 'Disconnected' };
        } catch {
            return { success: true, message: 'Disconnected locally' };
        }
    },

    // Tests reachability of a local Ollama instance directly from the browser.
    // The server cannot proxy this because Ollama runs on the user's machine.
    async testOllama(url: string): Promise<boolean> {
        try {
            const res = await fetch(`${url}/api/tags`, { method: 'GET' });
            return res.ok;
        } catch {
            return false;
        }
    },
};
