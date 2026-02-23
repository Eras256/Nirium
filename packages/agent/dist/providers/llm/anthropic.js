// ═══════════════════════════════════════════════════════════════
// Nirium — Anthropic Claude Provider
// ═══════════════════════════════════════════════════════════════
import { LLMProvider } from './base.js';
export class AnthropicProvider extends LLMProvider {
    name = 'anthropic';
    model;
    apiKey;
    baseUrl = 'https://api.anthropic.com/v1';
    constructor(apiKey, model) {
        super();
        this.apiKey = apiKey || process.env.ANTHROPIC_API_KEY || '';
        this.model = model || 'claude-3-5-sonnet-20241022';
    }
    async analyze(marketSnapshot, context) {
        if (!this.apiKey) {
            return this.fallbackDecision('Anthropic API key not configured');
        }
        try {
            const response = await fetch(`${this.baseUrl}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.apiKey,
                    'anthropic-version': '2023-06-01',
                },
                body: JSON.stringify({
                    model: this.model,
                    max_tokens: 1000,
                    system: this.buildSystemPrompt(),
                    messages: [
                        { role: 'user', content: this.buildUserPrompt(marketSnapshot, context) },
                    ],
                    temperature: 0.3,
                }),
            });
            if (!response.ok) {
                const error = await response.text();
                return this.fallbackDecision(`Anthropic API error: ${response.status} — ${error}`);
            }
            const data = await response.json();
            const content = data.content?.[0]?.text;
            if (!content) {
                return this.fallbackDecision('Empty response from Anthropic');
            }
            return this.parseDecision(content);
        }
        catch (error) {
            return this.fallbackDecision(`Anthropic request failed: ${error}`);
        }
    }
}
//# sourceMappingURL=anthropic.js.map