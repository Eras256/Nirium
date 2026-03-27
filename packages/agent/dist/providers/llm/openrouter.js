import { LLMProvider } from './base.js';
import axios from 'axios';
/**
 * OpenRouter Provider
 * Aggregates multiple models through a unified API.
 */
export class OpenRouterProvider extends LLMProvider {
    name = 'openrouter';
    model = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3-70b-instruct';
    apiKey = process.env.OPENROUTER_API_KEY;
    async analyze(market, context) {
        if (!this.apiKey)
            throw new Error('OpenRouter API key missing');
        const prompt = `
Analyze Stellar market state. Response in JSON format: {"action": "buy"|"sell"|"hold", "confidence": float, "reasoning": "string"}

DATA:
- XLM: $${market.xlmPrice}
- SDEX Spread: ${market.sdexSpread}
- Blend Supply APY: ${market.blendApy.supply}%
Context: ${context}
`;
        try {
            const res = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
                model: this.model,
                messages: [{ role: 'user', content: prompt }],
                response_format: { type: 'json_object' }
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'HTTP-Referer': 'https://nirium.io',
                    'X-Title': 'Nirium Agent'
                }
            });
            return this.parseDecision(res.data.choices[0].message.content);
        }
        catch (error) {
            console.error('[OpenRouter] Error:', error);
            throw error;
        }
    }
}
//# sourceMappingURL=openrouter.js.map