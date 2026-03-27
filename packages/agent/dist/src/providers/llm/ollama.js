import { LLMProvider } from './base.js';
import axios from 'axios';
export class OllamaProvider extends LLMProvider {
    name = 'ollama';
    model = process.env.OLLAMA_MODEL || 'mistral';
    baseUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
    async analyze(market, context) {
        const prompt = `
Analyze the following Stellar (Soroban) market data and provide a trading decision.
Return ONLY a valid JSON object: {"action": "buy"|"sell"|"hold", "confidence": 0-1, "reasoning": "..."}

MARKET DATA:
- XLM Price: $${market.xlmPrice}
- SDEX Spread: ${market.sdexSpread} bps
- Soroswap Depth: ${market.soroswapPoolDepth} XLM
- Blend APY (Supply): ${market.blendApy.supply}%
- Base Fee: ${market.baseFee} stroops

CONTEXT:
${context || 'None'}
`;
        try {
            const res = await axios.post(`${this.baseUrl}/api/generate`, {
                model: this.model,
                prompt,
                stream: false,
                format: 'json'
            });
            return this.parseDecision(res.data.response);
        }
        catch (error) {
            console.error('[Ollama] API Error:', error);
            throw error;
        }
    }
}
//# sourceMappingURL=ollama.js.map