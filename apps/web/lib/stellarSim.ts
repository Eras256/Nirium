// ═══════════════════════════════════════════════════════════════
// Nirium — Soroban Simulation Utility (Pre-flight Engine)
// ═══════════════════════════════════════════════════════════════
import { Transaction, rpc, Networks } from '@stellar/stellar-sdk';

const RPC_URL = process.env.NEXT_PUBLIC_SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org';

export interface SimResult {
    success: boolean;
    error?: string;
    resources?: {
        cpu_instructions: number;
        mem_bytes: number;
        footprint: any;
    };
    suggestedFee?: string;
}

/**
 * Perform a dry-run "Pre-flight" of a Soroban transaction.
 * Ensures the agent knows the precise resource cost before asking for signature.
 */
export async function simulateSorobanTx(xdr: string): Promise<SimResult> {
    const server = new rpc.Server(RPC_URL);

    try {
        // 1. Reconstruct transaction from XDR
        const tx = new Transaction(xdr, Networks.TESTNET);

        const response = await server.simulateTransaction(tx);

        // 3. Handle Resource Consumption or Errors
        if (rpc.Api.isSimulationSuccess(response)) {
            const res = (response as any).result; // Using any to bypass SDK version type drift
            return {
                success: true,
                resources: {
                    cpu_instructions: Number(res.auth[0]?.cpuInstructions || 0),
                    mem_bytes: Number(res.auth[0]?.memoryBytes || 0),
                    footprint: (response as any).footprint
                },
                suggestedFee: (response as any).minResourceFee
            };
        } else if (rpc.Api.isSimulationError(response)) {
            return {
                success: false,
                error: `Simulation Error: ${response.error}`
            };
        }

        return {
            success: false,
            error: 'Simulation returned unknown response format.'
        };

    } catch (err: any) {
        return {
            success: false,
            error: `RPC Connection Failure: ${err.message}`
        };
    }
}
