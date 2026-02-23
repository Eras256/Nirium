// ═══════════════════════════════════════════════════════════════
// Nirium — xAI Grok Provider
// ═══════════════════════════════════════════════════════════════

import { LLMProvider } from './base.js';
import { AIDecision, MarketState } from '../../types/database.types.js';

export class GrokProvider extends LLMProvider {
    name = 'grok';
    model: string;
    private apiKey: string;
    private baseUrl = 'https://api.x.ai/v1';

    constructor(apiKey?: string, model?: string) {
        super();
        this.apiKey = apiKey || process.env.XAI_API_KEY || '';
        this.model = model || 'grok-2';
    }

    async analyze(marketSnapshot: MarketState, context: string): Promise<AIDecision> {
        if (!this.apiKey) {
            return this.fallbackDecision('xAI API key not configured');
        }

        try {
            const response = await fetch(`${this.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.apiKey}`,
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: [
                        { role: 'system', content: this.buildSystemPrompt() },
                        { role: 'user', content: this.buildUserPrompt(marketSnapshot, context) },
                    ],
                    temperature: 0.3,
                    max_tokens: 1000,
                }),
            });

            if (!response.ok) {
                const error = await response.text();
                return this.fallbackDecision(`Grok API error: ${response.status} — ${error}`);
            }

            const data = await response.json() as {
                choices: Array<{ message: { content: string } }>;
            };
            const content = data.choices[0]?.message?.content;

            if (!content) {
                return this.fallbackDecision('Empty response from Grok');
            }

            return this.parseDecision(content);
        } catch (error) {
            return this.fallbackDecision(`Grok request failed: ${error}`);
        }
    }
}
