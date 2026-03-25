import { LLMProvider } from './base.js';
import axios from 'axios';
/**
 * Google Gemini Provider for Nirium Agent.
 * Supports BYOK (Bring Your Own Key) via constructor config.
 */
export class GeminiProvider extends LLMProvider {
    name = 'gemini';
    model = this.config.model || process.env.GEMINI_MODEL || 'gemini-1.5-pro';
    apiKey = this.config.apiKey || process.env.GEMINI_API_KEY;
    async analyze(market, context) {
        if (!this.apiKey) {
            console.error('[Gemini] MISSION_CRITICAL: API key is null. Verification failed.');
            throw new Error('LLM_AUTH_FAILURE: Google Gemini API key is missing.');
        }
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
        try {
            const systemPrompt = `
                You are the Nirium Protocol's Neural Kernel.
                Analyze the Stellar market state and emit a structured decision.
                
                PROTOCOL_RULES:
                1. Output ONLY a valid JSON block. No markdown, no commentary.
                2. Be precise: 'buy', 'sell', or 'hold'.
                3. Confidence must be 0.0 to 1.0.
                
                RESPONSE_TEMPLATE:
                {
                    "action": "buy" | "sell" | "hold",
                    "confidence": float,
                    "reasoning": "brief alphanumeric summary"
                }
            `;
            const marketData = `
                MARKET_STATE:
                - XLM_PRICE: $${market.xlmPrice.toFixed(6)}
                - SDEX_SPREAD: ${market.sdexSpread.toFixed(2)} bps
                - BLEND_SUPPLY_APY: ${market.blendApy.supply.toFixed(2)}%
                - CONTEXT: ${context || 'Neutral objective'}
            `;
            const res = await axios.post(url, {
                contents: [{
                        parts: [{ text: `${systemPrompt}\n\n${marketData}` }]
                    }],
                generationConfig: {
                    temperature: 0.1,
                    maxOutputTokens: 256,
                    topP: 0.95,
                    topK: 40
                }
            }, {
                timeout: 15000,
                headers: { 'Content-Type': 'application/json' }
            });
            if (!res.data || !res.data.candidates || res.data.candidates.length === 0) {
                throw new Error('GEMINI_NULL_RESPONSE: Node returned empty candidates array.');
            }
            const text = res.data.candidates[0].content.parts[0].text;
            return this.parseDecision(text);
        }
        catch (error) {
            const axiosError = error;
            console.error('[Gemini] Protocol error during inference:', axiosError.response?.data || axiosError.message);
            if (axiosError.response?.status === 401 || axiosError.response?.status === 403) {
                throw new Error('LLM_AUTH_INVALID: Google Gemini credentials rejected by network.');
            }
            throw error;
        }
    }
}
//# sourceMappingURL=gemini.js.map