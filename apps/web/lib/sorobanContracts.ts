/**
 * ═══════════════════════════════════════════════════════
 * Nirium — Soroban Contract Layer (Freighter-signed)
 * ═══════════════════════════════════════════════════════
 *
 * This module provides typed wrappers for calling all 3
 * deployed Nirium Soroban contracts on Stellar Testnet.
 *
 * All mutative calls are signed via Freighter wallet.
 * Read-only calls go directly to the Soroban RPC.
 *
 * Contracts:
 *  - NiriumVault:     CCSPRXZNSMY5EEDT43L22IH2H76K7WAPGOTYHCRXINHZLED44KSP3LGN
 *  - ELO Reputation:  CB4RCN4YHLCX2SIFMEJJSMDBWO6NPJHMDLSSKA4CT4HRTD2TFCU6XW4H
 *  - Marketplace:     CCUDDIF6BIIA6NZNSDD63KNWMEAPYTB5WHRDMU2IGOATBCZF6KV6BLEN
 */

import {
    rpc as SorobanRpc,
    TransactionBuilder,
    Networks,
    Contract,
    Address,
    nativeToScVal,
    scValToNative,
    BASE_FEE,
    Keypair,
    Transaction,
} from '@stellar/stellar-sdk';
import { signTransaction } from '@stellar/freighter-api';

// ─── Config ──────────────────────────────────────────────────────────
const RPC_URL = process.env.NEXT_PUBLIC_SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org';
const NETWORK_PASSPHRASE = Networks.TESTNET;
const HORIZON_URL = process.env.NEXT_PUBLIC_HORIZON_URL || 'https://horizon-testnet.stellar.org';

export const CONTRACT_IDS = {
    VAULT: process.env.NEXT_PUBLIC_CONTRACT_SENTINEL || 'CATYFAFL7QCBKSK3OSVNWA4O2VXWOADJ6IPNLCT2INXHP24OIUHZOUEK',
    ELO: process.env.NEXT_PUBLIC_CONTRACT_ELO || 'CB4RCN4YHLCX2SIFMEJJSMDBWO6NPJHMDLSSKA4CT4HRTD2TFCU6XW4H',
    MARKETPLACE: process.env.NEXT_PUBLIC_CONTRACT_MARKETPLACE || 'CCUDDIF6BIIA6NZNSDD63KNWMEAPYTB5WHRDMU2IGOATBCZF6KV6BLEN',
} as const;

// Soroban Native Token Address (XLM) on Stellar Testnet
export const NATIVE_ASSET_ID = 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC';

export type ContractName = keyof typeof CONTRACT_IDS;

// ─── Core RPC Server ─────────────────────────────────────────────────
export function getRpcServer(): SorobanRpc.Server {
    return new SorobanRpc.Server(RPC_URL, { allowHttp: false });
}

interface InvokeParams {
    contractId: string;
    method: string;
    args: ReturnType<typeof nativeToScVal>[];
    callerAddress: string;
}

const networks = Networks;
const SOROBAN_BASE_FEE = '500000'; // Higher safety fee for Soroban resource overhead

export async function invokeContract({
    contractId,
    method,
    args,
    callerAddress,
}: InvokeParams): Promise<{ success: boolean; result?: unknown; txHash?: string; error?: string }> {
    const server = getRpcServer();
    console.log(`[Soroban] Invoking ${method} on contract ${contractId} with args:`, args);

    try {
        // 1. Load source account (sequence number)
        const account = await server.getAccount(callerAddress);

        // 2. Build the initial transaction for simulation
        const contract = new Contract(contractId);
        const transaction = new TransactionBuilder(account, {
            fee: SOROBAN_BASE_FEE,
            networkPassphrase: NETWORK_PASSPHRASE,
        })
            .addOperation(contract.call(method, ...args))
            .setTimeout(60)
            .build();

        // 3. Simulate to get footprint and soroban data
        const simResult = await server.simulateTransaction(transaction);

        if (SorobanRpc.Api.isSimulationError(simResult)) {
            console.error('[Soroban] Simulation error details:', JSON.stringify(simResult));
            return { success: false, error: `Simulation failed: ${simResult.error}` };
        }

        // 4. Assemble the final transaction with simulation data
        const assembledTx = SorobanRpc.assembleTransaction(transaction, simResult).build();
        const txXdr = assembledTx.toXDR();

        // 4. Sign with Freighter
        const signedResult = await signTransaction(txXdr, {
            networkPassphrase: NETWORK_PASSPHRASE,
        });

        if (signedResult.error || !signedResult.signedTxXdr) {
            return { success: false, error: signedResult.error || 'Freighter signing failed' };
        }

        // 6. Submit signed transaction
        const submitResult = await server.sendTransaction(
            TransactionBuilder.fromXDR(signedResult.signedTxXdr, NETWORK_PASSPHRASE) as Parameters<typeof server.sendTransaction>[0]
        );

        if (submitResult.status === 'ERROR') {
            return { success: false, error: `Submit error: ${JSON.stringify(submitResult.errorResult)}` };
        }

        // 7. Poll for confirmation
        const txHash = submitResult.hash;
        let status = submitResult.status;
        let attempts = 0;

        while (status === 'PENDING' && attempts < 10) {
            await new Promise(r => setTimeout(r, 2000));
            const pollResult = await server.getTransaction(txHash);
            if (pollResult.status === SorobanRpc.Api.GetTransactionStatus.SUCCESS) {
                const returnValue = pollResult.returnValue ? scValToNative(pollResult.returnValue) : null;
                return { success: true, txHash, result: returnValue };
            }
            if (pollResult.status === SorobanRpc.Api.GetTransactionStatus.FAILED) {
                return { success: false, error: 'Transaction failed on-chain', txHash };
            }
            attempts++;
        }

        return { success: true, txHash }; // Pending but submitted

    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return { success: false, error: message };
    }
}

// ─── Read-only simulation ─────────────────────────────────────────────
export async function simulateContractRead({
    contractId,
    method,
    args,
}: Omit<InvokeParams, 'callerAddress'>): Promise<unknown> {
    const server = getRpcServer();

    // Use a well-known Stellar testnet funded address for simulation (no auth needed for reads)
    const { Account } = await import('@stellar/stellar-sdk');
    const simulatorKey = 'GBJRFWVFN4VYVFAO755XPDSO22VWSNVGKDGQNC4SLEH7EBKXJZH3V2O4';
    const fakeAccount = new Account(simulatorKey, '0');

    try {
        const contract = new Contract(contractId);
        const tx = new TransactionBuilder(fakeAccount, {
            fee: BASE_FEE,
            networkPassphrase: NETWORK_PASSPHRASE,
        })
            .addOperation(contract.call(method, ...args))
            .setTimeout(30)
            .build();

        const simResult = await server.simulateTransaction(tx);
        if (SorobanRpc.Api.isSimulationSuccess(simResult) && simResult.result) {
            return scValToNative(simResult.result.retval);
        }
        return null;
    } catch {
        return null;
    }
}

// ═══════════════════════════════════════════════════════
// VAULT CONTRACT — NiriumVault
// ═══════════════════════════════════════════════════════

/**
 * Get total fees collected by the treasury
 */
export async function vaultGetTotalFees(): Promise<number> {
    const result = await simulateContractRead({
        contractId: CONTRACT_IDS.VAULT,
        method: 'get_total_fees',
        args: [],
    });
    return Number(result ?? 0);
}

/**
 * Get vault count
 */
export async function vaultGetVaultCount(): Promise<number> {
    const result = await simulateContractRead({
        contractId: CONTRACT_IDS.VAULT,
        method: 'get_vault_count',
        args: [],
    });
    return Number(result ?? 0);
}

/**
 * Create a new vault position with a name
 */
export async function vaultCreate(callerAddress: string, tokenAddress: string, name: string) {
    return invokeContract({
        contractId: CONTRACT_IDS.VAULT,
        method: 'create_vault',
        args: [
            Address.fromString(callerAddress).toScVal(),
            Address.fromString(tokenAddress).toScVal(),
            nativeToScVal(name, { type: 'string' }),
        ],
        callerAddress,
    });
}

/**
 * Deposit into vault
 */
export async function vaultDeposit(callerAddress: string, vaultId: number, amount: bigint) {
    return invokeContract({
        contractId: CONTRACT_IDS.VAULT,
        method: 'deposit',
        args: [
            nativeToScVal(vaultId, { type: 'u64' }),
            nativeToScVal(amount, { type: 'i128' }),
        ],
        callerAddress,
    });
}

/**
 * Withdraw from vault
 */
export async function vaultWithdraw(callerAddress: string, vaultId: number, amount: bigint) {
    return invokeContract({
        contractId: CONTRACT_IDS.VAULT,
        method: 'withdraw',
        args: [
            nativeToScVal(vaultId, { type: 'u64' }),
            nativeToScVal(amount, { type: 'i128' }),
        ],
        callerAddress,
    });
}

// ═══════════════════════════════════════════════════════
// ELO CONTRACT — Reputation System
// ═══════════════════════════════════════════════════════

/**
 * Get ELO score for a public key
 */
export async function eloGetScore(sentinelAddress: string): Promise<number> {
    const result = await simulateContractRead({
        contractId: CONTRACT_IDS.ELO,
        method: 'get_elo',
        args: [Address.fromString(sentinelAddress).toScVal()],
    });
    return Number(result ?? 0);
}

/**
 * Get total registered sentinels
 */
export async function eloGetTotalSentinels(): Promise<number> {
    const result = await simulateContractRead({
        contractId: CONTRACT_IDS.ELO,
        method: 'get_total_sentinels',
        args: [],
    });
    return Number(result ?? 0);
}

/**
 * Get full profile for a sentinel
 */
export async function eloGetProfile(sentinelAddress: string): Promise<{
    elo_score: number;
    total_trades: number;
    winning_trades: number;
    total_volume_usdc: number;
    tier: string;
} | null> {
    const result = await simulateContractRead({
        contractId: CONTRACT_IDS.ELO,
        method: 'get_profile',
        args: [Address.fromString(sentinelAddress).toScVal()],
    }) as Record<string, unknown> | null;

    if (!result) return null;
    return {
        elo_score: Number(result.elo_score ?? 0),
        total_trades: Number(result.total_trades ?? 0),
        winning_trades: Number(result.winning_trades ?? 0),
        total_volume_usdc: Number(result.total_volume_usdc ?? 0),
        tier: String(result.tier ?? 'Unranked'),
    };
}

/**
 * Register the connected wallet as a Sentinel (Freighter-signed)
 */
export async function eloRegisterSentinel(callerAddress: string) {
    return invokeContract({
        contractId: CONTRACT_IDS.ELO,
        method: 'register_sentinel',
        args: [Address.fromString(callerAddress).toScVal()],
        callerAddress,
    });
}

// ═══════════════════════════════════════════════════════
// MARKETPLACE CONTRACT — Strategy Registry
// ═══════════════════════════════════════════════════════

/**
 * Get strategy listing by ID
 */
export async function marketplaceGetStrategy(strategyId: number): Promise<{
    id: number;
    creator: string;
    name: string;
    ipfs_cid: string;
    subscription_fee_usdc: number;
    elo_score: number;
    subscriber_count: number;
    total_revenue_usdc: number;
    is_active: boolean;
} | null> {
    const result = await simulateContractRead({
        contractId: CONTRACT_IDS.MARKETPLACE,
        method: 'get_strategy',
        args: [nativeToScVal(strategyId, { type: 'u64' })],
    }) as Record<string, unknown> | null;

    if (!result) return null;
    return {
        id: Number(result.id ?? strategyId),
        creator: String(result.creator ?? ''),
        name: String(result.name ?? ''),
        ipfs_cid: String(result.ipfs_cid ?? ''),
        subscription_fee_usdc: Number(result.subscription_fee_usdc ?? 0),
        elo_score: Number(result.elo_score ?? 1200),
        subscriber_count: Number(result.subscriber_count ?? 0),
        total_revenue_usdc: Number(result.total_revenue_usdc ?? 0),
        is_active: Boolean(result.is_active ?? true),
    };
}

/**
 * Get total strategies count
 */
export async function marketplaceGetStrategyCount(): Promise<number> {
    const result = await simulateContractRead({
        contractId: CONTRACT_IDS.MARKETPLACE,
        method: 'get_strategy_count',
        args: [],
    });
    return Number(result ?? 0);
}

/**
 * Publish a new strategy (Freighter-signed)
 */
export async function marketplacePublishStrategy(
    callerAddress: string,
    name: string,
    ipfsCid: string,
    subscriptionFeeUsdc: bigint,
) {
    return invokeContract({
        contractId: CONTRACT_IDS.MARKETPLACE,
        method: 'publish_strategy',
        args: [
            Address.fromString(callerAddress).toScVal(),
            nativeToScVal(name, { type: 'string' }),
            nativeToScVal(ipfsCid, { type: 'string' }),
            nativeToScVal(subscriptionFeeUsdc, { type: 'i128' }),
        ],
        callerAddress,
    });
}

/**
 * Subscribe to a strategy (Freighter-signed)
 */
export async function marketplaceSubscribe(
    callerAddress: string,
    strategyId: number,
    usdcTokenAddress: string,
) {
    return invokeContract({
        contractId: CONTRACT_IDS.MARKETPLACE,
        method: 'subscribe',
        args: [
            Address.fromString(callerAddress).toScVal(),
            nativeToScVal(strategyId, { type: 'u64' }),
            Address.fromString(usdcTokenAddress).toScVal(),
        ],
        callerAddress,
    });
}
