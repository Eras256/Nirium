// ═══════════════════════════════════════════════════════════════
// Nirium — Abstract LLM Provider Base Class
// ═══════════════════════════════════════════════════════════════
export class LLMProvider {
    /**
     * Generate a system prompt for market analysis.
     */
    buildSystemPrompt() {
        return `You are Nirium, an autonomous DeFi AI agent operating on the Stellar Network.
Your role is to analyze market conditions and make optimal trading decisions.

You MUST respond in valid JSON format with this exact structure:
{
  "action": "path_arbitrage" | "cross_dex_arb" | "flash_loan" | "blend_lend" | "blend_borrow" | "soroswap_swap" | "hold" | "rebalance" | "exit",
  "confidence": 0.0 to 1.0,
  "reasoning": "Clear explanation of your decision",
  "params": { optional parameters for the action }
}

Stellar-native Decision Guidelines:
- "path_arbitrage": Profitable PathPaymentStrictReceive route discovered (> 0.1%), confidence > 0.7
- "cross_dex_arb": SDEX orderbook vs Soroswap AMM price spread > threshold, multi-op tx
- "flash_loan": Supply-borrow spread viable via Soroban single-invocation flash loan
- "blend_lend": Blend supply APY > 3% and pool utilization < 80%
- "blend_borrow": Blend borrow rate attractive for leveraged yield farming
- "soroswap_swap": AMM swap optimal for rebalancing or position entry
- "hold": Uncertain conditions, insufficient data, or confidence < 0.5
- "rebalance": Portfolio drift > 10% from target allocation
- "exit": Extreme volatility, base fee spike > 2x normal, or risk signals detected

Always prioritize capital preservation. Never suggest actions with confidence below 0.3.`;
    }
    /**
     * Build the user prompt with current market data.
     */
    buildUserPrompt(market, context) {
        const pathRoutesSummary = market.pathPaymentRoutes.length > 0
            ? market.pathPaymentRoutes.map(r => `  ${r.path.join(' → ')} (${r.profitPercentage.toFixed(3)}%)`).join('\n')
            : '  No profitable routes discovered';
        return `Current Market State (${market.network}):
- XLM Price: $${market.xlmPrice.toFixed(6)}
- Base Fee: ${market.baseFee} stroops
- Last Update: ${market.lastUpdate}
- Blend Supply APY: ${market.blendApy.supply.toFixed(2)}%
- Blend Borrow APY: ${market.blendApy.borrow.toFixed(2)}%
- Soroswap Pool Depth: ${market.soroswapPoolDepth.toLocaleString()} XLM
- SDEX Spread: ${market.sdexSpread.toFixed(1)} bps
- Path Payment Routes:
${pathRoutesSummary}

Additional Context:
${context}

Analyze the market and return your decision as JSON.`;
    }
    /**
     * Parse and validate an AI response into a structured decision.
     */
    parseDecision(raw) {
        try {
            // Extract JSON from potential markdown code blocks
            let jsonStr = raw;
            const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
            if (jsonMatch) {
                jsonStr = jsonMatch[1].trim();
            }
            const parsed = JSON.parse(jsonStr);
            // Validate required fields
            const validActions = ['path_arbitrage', 'cross_dex_arb', 'flash_loan', 'blend_lend', 'blend_borrow', 'soroswap_swap', 'hold', 'rebalance', 'exit'];
            if (!validActions.includes(parsed.action)) {
                return this.fallbackDecision('Invalid action returned by LLM');
            }
            const confidence = Math.min(1, Math.max(0, Number(parsed.confidence) || 0));
            return {
                action: parsed.action,
                confidence,
                reasoning: parsed.reasoning || 'No reasoning provided',
                params: parsed.params || {},
            };
        }
        catch (error) {
            return this.fallbackDecision(`Failed to parse LLM response: ${error}`);
        }
    }
    /**
     * Return a safe fallback decision when parsing fails.
     */
    fallbackDecision(reason) {
        return {
            action: 'hold',
            confidence: 0.1,
            reasoning: `Fallback: ${reason}`,
            params: {},
        };
    }
}
//# sourceMappingURL=base.js.map