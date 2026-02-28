import { LLMProvider } from './base.js';
import axios from 'axios';
export class GeminiProvider extends LLMProvider {
    name = 'gemini';
    model = process.env.GEMINI_MODEL || 'gemini-1.5-pro';
    apiKey = process.env.GEMINI_API_KEY;
    async analyze(market, context) {
        if (!this.apiKey)
            throw new Error('Gemini API key missing');
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
        try {
            const res = await axios.post(url, {
                contents: [{ parts: [{ text: `Stellar Market Analysis. Output JSON: {"action": "buy"|"sell"|"hold", "confidence": float, "reasoning": "string"}. Data: ${JSON.stringify(market)}` }] }]
            });
            return this.parseDecision(res.data.candidates[0].content.parts[0].text);
        }
        catch (error) {
            console.error('[Gemini] Error:', error);
            throw error;
        }
    }
}
//# sourceMappingURL=gemini.js.map