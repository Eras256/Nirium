// ═══════════════════════════════════════════════════════════════
// Nirium — OpenAI GPT-4o / o1 Provider
// ═══════════════════════════════════════════════════════════════

import { LLMProvider } from './base.js';
import { AIDecision, MarketState } from '../../types/database.types.js';

export class OpenAIProvider extends LLMProvider {
    name = 'openai';
    model: string;
    private apiKey: string;
    private baseUrl = 'https://api.openai.com/v1';

    constructor(apiKey?: string, model?: string) {
        super();
        this.apiKey = apiKey || process.env.OPENAI_API_KEY || '';
        this.model = model || 'gpt-4o';
    }

    async analyze(marketSnapshot: MarketState, context: string): Promise<AIDecision> {
        if (!this.apiKey) {
            return this.fallbackDecision('OpenAI API key not configured');
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
                    response_format: { type: 'json_object' },
                    temperature: 0.3,
                    max_tokens: 1000,
                }),
            });

            if (!response.ok) {
                const error = await response.text();
                return this.fallbackDecision(`OpenAI API error: ${response.status} — ${error}`);
            }

            const data = await response.json() as {
                choices: Array<{ message: { content: string } }>;
            };
            const content = data.choices[0]?.message?.content;

            if (!content) {
                return this.fallbackDecision('Empty response from OpenAI');
            }

            return this.parseDecision(content);
        } catch (error) {
            return this.fallbackDecision(`OpenAI request failed: ${error}`);
        }
    }
}
