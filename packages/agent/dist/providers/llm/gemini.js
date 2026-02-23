// ═══════════════════════════════════════════════════════════════
// Nirium — Google Gemini Provider
// ═══════════════════════════════════════════════════════════════
import { LLMProvider } from './base.js';
export class GeminiProvider extends LLMProvider {
    name = 'gemini';
    model;
    apiKey;
    baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
    constructor(apiKey, model) {
        super();
        this.apiKey = apiKey || process.env.GOOGLE_AI_API_KEY || '';
        this.model = model || 'gemini-1.5-pro';
    }
    async analyze(marketSnapshot, context) {
        if (!this.apiKey) {
            return this.fallbackDecision('Google AI API key not configured');
        }
        try {
            const url = `${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`;
            const fullPrompt = `${this.buildSystemPrompt()}\n\n${this.buildUserPrompt(marketSnapshot, context)}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: fullPrompt }] }],
                    generationConfig: {
                        temperature: 0.3,
                        maxOutputTokens: 1000,
                        responseMimeType: 'application/json',
                    },
                }),
            });
            if (!response.ok) {
                const error = await response.text();
                return this.fallbackDecision(`Gemini API error: ${response.status} — ${error}`);
            }
            const data = await response.json();
            const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!content) {
                return this.fallbackDecision('Empty response from Gemini');
            }
            return this.parseDecision(content);
        }
        catch (error) {
            return this.fallbackDecision(`Gemini request failed: ${error}`);
        }
    }
}
//# sourceMappingURL=gemini.js.map