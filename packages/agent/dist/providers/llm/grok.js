import { LLMProvider } from './base.js';
import axios from 'axios';
export class GrokProvider extends LLMProvider {
    name = 'grok';
    model = process.env.GROK_MODEL || 'grok-1';
    apiKey = process.env.XAI_API_KEY;
    async analyze(market, context) {
        if (!this.apiKey)
            throw new Error('X.AI API key missing');
        try {
            const res = await axios.post('https://api.x.ai/v1/chat/completions', {
                model: this.model,
                messages: [{ role: 'user', content: `Analyze Stellar market. JSON: {"action": "...", "confidence": ..., "reasoning": "..."}. Data: ${JSON.stringify(market)}` }]
            }, {
                headers: { 'Authorization': `Bearer ${this.apiKey}` }
            });
            return this.parseDecision(res.data.choices[0].message.content);
        }
        catch (error) {
            console.error('[Grok] Error:', error);
            throw error;
        }
    }
}
//# sourceMappingURL=grok.js.map