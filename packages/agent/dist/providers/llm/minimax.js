import { LLMProvider } from './base.js';
import axios from 'axios';
/**
 * MiniMax LLM Provider (China's high-efficiency choice).
 * Supports the abab6.5s-chat and newer models.
 */
export class MiniMaxProvider extends LLMProvider {
    name = 'minimax';
    model = this.config.model || process.env.MINIMAX_MODEL || 'abab6.5s-chat';
    apiKey = this.config.apiKey || process.env.MINIMAX_API_KEY;
    async analyze(market, context) {
        if (!this.apiKey) {
            console.error('[MiniMax] MISSION_CRITICAL: API key is null.');
            throw new Error('LLM_AUTH_FAILURE: MiniMax API key is missing.');
        }
        try {
            const res = await axios.post('https://api.minimax.chat/v1/text/chatcompletion_v2', {
                model: this.model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are the Nirium Neural Interface. Analyze market signals with high efficiency. Return JSON format only.'
                    },
                    {
                        role: 'user',
                        content: `
                            ANALYZE: XLM $${market.xlmPrice.toFixed(6)}, Spread ${market.sdexSpread}bps, Context ${context || 'Scan'}
                            Format: {"action": "buy"|"sell"|"hold", "confidence": 0-1, "reasoning": "..."}
                        `
                    }
                ],
                response_format: { type: 'json_object' },
                temperature: 0.1
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000 // 30s for high-efficiency deep-scan
            });
            if (!res.data || !res.data.choices || res.data.choices.length === 0) {
                throw new Error('MINIMAX_NULL_RESPONSE: Provider returned no completion choices.');
            }
            const content = res.data.choices[0].message.content;
            return this.parseDecision(content);
        }
        catch (error) {
            console.error('[MiniMax] Engine Error:', error.response?.data || error.message);
            throw error;
        }
    }
}
//# sourceMappingURL=minimax.js.map