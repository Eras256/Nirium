import { LLMProvider } from './base.js';
import axios from 'axios';
/**
 * xAI Grok Provider for Nirium Agent.
 * Configured for high-performance Vision & Chat capabilities.
 */
export class GrokProvider extends LLMProvider {
    name = 'grok';
    model = this.config.model || process.env.GROK_MODEL || 'grok-beta';
    apiKey = this.config.apiKey || process.env.XAI_API_KEY;
    async analyze(market, context) {
        if (!this.apiKey) {
            console.error('[Grok] AUTH_REQUIRED: X.AI API key is missing.');
            throw new Error('LLM_AUTH_FAILURE: xAI Grok provider requires an active API key.');
        }
        const isVisionModel = this.model.includes('vision');
        try {
            const res = await axios.post('https://api.x.ai/v1/chat/completions', {
                model: this.model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are the Nirium Protocol Intelligence Layer. Analyzing Stellar-native market signals with institutional-grade precision. Always return valid JSON.'
                    },
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'text',
                                text: `
                                    ANALYZE_MARKET_STATE:
                                    XLM Price: $${market.xlmPrice.toFixed(6)}
                                    SDEX Spread: ${market.sdexSpread.toFixed(2)} bps
                                    Liquidity: ${market.soroswapPoolDepth.toLocaleString()} XLM
                                    
                                    CONTEXT: ${context || 'General equilibrium scan'}
                                    
                                    RESPONSE_JSON:
                                    {"action": "buy"|"sell"|"hold", "confidence": float, "reasoning": "string"}
                                `
                            }
                        ]
                    }
                ],
                temperature: 0,
                response_format: { type: 'json_object' }
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 20000 // 20s for neural complex deep-scan
            });
            if (!res.data || !res.data.choices || res.data.choices.length === 0) {
                throw new Error('GROK_NULL_RESPONSE: X.AI returned empty completion choices.');
            }
            const content = res.data.choices[0].message.content;
            return this.parseDecision(content);
        }
        catch (error) {
            const axiosError = error;
            console.error('[Grok] Interface failure:', axiosError.response?.data || axiosError.message);
            if (axiosError.response?.status === 401) {
                throw new Error('LLM_AUTH_INVALID: X.AI rejected the provided API key.');
            }
            throw error;
        }
    }
}
//# sourceMappingURL=grok.js.map