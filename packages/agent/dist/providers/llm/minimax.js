import { LLMProvider } from './base.js';
import axios from 'axios';
/**
 * MiniMax LLM Provider
 * Implements support for Abab model family.
 */
export class MiniMaxProvider extends LLMProvider {
    name = 'minimax';
    model = process.env.MINIMAX_MODEL || 'abab6.5s-chat';
    apiKey = process.env.MINIMAX_API_KEY;
    async analyze(market, context) {
        if (!this.apiKey)
            throw new Error('MiniMax API key missing');
        const prompt = `
Analyze Stellar market state. Response in JSON format: {"action": "buy"|"sell"|"hold", "confidence": float, "reasoning": "string"}

DATA:
- XLM: $${market.xlmPrice}
- SDEX Spread: ${market.sdexSpread}
- Blend Supply APY: ${market.blendApy.supply}%
Context: ${context}
`;
        try {
            const res = await axios.post('https://api.minimax.chat/v1/text/chatcompletion_v2', {
                model: this.model,
                messages: [{ role: 'user', content: prompt }],
                response_format: { type: 'json_object' }
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            const content = res.data.choices[0].message.content;
            return this.parseDecision(content);
        }
        catch (error) {
            console.error('[MiniMax] Error:', error);
            throw error;
        }
    }
}
//# sourceMappingURL=minimax.js.map