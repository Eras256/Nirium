import { LLMProvider } from './base.js';
import axios from 'axios';
export class AnthropicProvider extends LLMProvider {
    name = 'anthropic';
    model = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-latest';
    apiKey = process.env.ANTHROPIC_API_KEY;
    async analyze(market, context) {
        if (!this.apiKey)
            throw new Error('Anthropic API key missing');
        try {
            const res = await axios.post('https://api.anthropic.com/v1/messages', {
                model: this.model,
                max_tokens: 1024,
                messages: [{ role: 'user', content: `Analyze Stellar market. JSON output: {"action": "...", "confidence": ..., "reasoning": "..."}. Data: ${JSON.stringify(market)}` }]
            }, {
                headers: {
                    'x-api-key': this.apiKey,
                    'anthropic-version': '2023-06-01'
                }
            });
            return this.parseDecision(res.data.content[0].text);
        }
        catch (error) {
            console.error('[Anthropic] Error:', error);
            throw error;
        }
    }
}
//# sourceMappingURL=anthropic.js.map