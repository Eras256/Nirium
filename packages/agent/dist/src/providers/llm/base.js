export class LLMProvider {
    config;
    constructor(config = {}) {
        this.config = config;
    }
    /**
     * Override provider configuration (BYOK support).
     */
    overrideConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        return this;
    }
    /**
     * Internal helper to parse structured JSON from LLM responses.
     */
    parseDecision(text) {
        try {
            // Find JSON block if LLM added surrounding text
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            const jsonStr = jsonMatch ? jsonMatch[0] : text;
            const parsed = JSON.parse(jsonStr);
            return {
                action: parsed.action || 'hold',
                confidence: parsed.confidence || 0,
                reasoning: parsed.reasoning || text.substring(0, 500),
                timestamp: new Date().toISOString()
            };
        }
        catch (e) {
            console.warn('[LLM Provider] Failed to parse decision JSON, falling back to hold.');
            return {
                action: 'hold',
                confidence: 0,
                reasoning: 'Failed to parse AI response.',
                timestamp: new Date().toISOString()
            };
        }
    }
}
//# sourceMappingURL=base.js.map