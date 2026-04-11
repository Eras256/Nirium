// ═══════════════════════════════════════════════════════════════
// Nirium Agent — Coordination Service (M2M)
// ═══════════════════════════════════════════════════════════════
//
// Implements Agent-to-Agent payments via x402.
// Before critical executions, the Nirium agent can "buy" a security
// report from an external Specialized Auditor Agent.
//
// Pattern: Request → 402 → Pay (Sign) → Retry → Success
// ═══════════════════════════════════════════════════════════════

import { createEd25519Signer, getNetworkPassphrase } from "@x402/stellar";
import { ExactStellarScheme } from "@x402/stellar/exact/client";
import { x402HTTPClient } from "@x402/fetch";

const NETWORK = (process.env.STELLAR_NETWORK === "mainnet" ? "stellar:pubnet" : "stellar:testnet") as `${string}:${string}`;

/**
 * Audit a strategy execution using an external x402 agent.
 */
export async function auditWithExternalAgent(strategyId: string, context: any): Promise<boolean> {
    const agentSecret = process.env.STELLAR_SECRET_KEY;
    if (!agentSecret) {
        console.log("[Coordination] No agent secret — skipping external audit");
        return true; 
    }

    try {
        console.log(`[Coordination] Requesting security audit for ${strategyId}...`);
        
        // Setup x402 client for the agent
        const signer = createEd25519Signer(agentSecret, getNetworkPassphrase(NETWORK));
        const client = x402HTTPClient({ signer, schemes: [ExactStellarScheme] });

        // Target: A mock external auditor (could be another Nirium instance or a partner API)
        // For the hackathon demo, we point to a known x402-enabled endpoint
        const AUDITOR_URL = process.env.EXTERNAL_AUDITOR_URL || "https://api.nirium.xyz/api/v1/premium/audit";

        const response = await client.fetch(AUDITOR_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ strategyId, context })
        });

        if (response.status === 200) {
            const result = await response.json();
            console.log(`[Coordination] Audit success: ${result.safe ? 'SAFE' : 'UNSAFE'}`);
            return !!result.safe;
        }

        console.warn(`[Coordination] External agent returned ${response.status} — proceeding with caution`);
        return true;

    } catch (err: any) {
        console.error("[Coordination] M2M Payment/Audit flow failed:", err.message);
        return true; // Don't block if service is down
    }
}
