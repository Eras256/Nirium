import { LLMProvider } from './base.js';
import axios from 'axios';
export class OpenAIProvider extends LLMProvider {
    name = 'openai';
    model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    apiKey = process.env.OPENAI_API_KEY;
    async analyze(market, context) {
        if (!this.apiKey)
            throw new Error('OpenAI API key missing');
        const prompt = `
Analyze Stellar market state. Response in JSON format: {"action": "buy"|"sell"|"hold", "confidence": float, "reasoning": "string"}

DATA:
- XLM: $${market.xlmPrice}
- SDEX Spread: ${market.sdexSpread}
- Blend Supply APY: ${market.blendApy.supply}%
Context: ${context}
`;
        try {
            const res = await axios.post('https://api.openai.com/v1/chat/completions', {
                model: this.model,
                messages: [{ role: 'user', content: prompt }],
                response_format: { type: 'json_object' }
            }, {
                headers: { 'Authorization': `Bearer ${this.apiKey}` }
            });
            return this.parseDecision(res.data.choices[0].message.content);
        }
        catch (error) {
            console.error('[OpenAI] Error:', error);
            throw error;
        }
    }
}
//# sourceMappingURL=openai.js.map