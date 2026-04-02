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
 *  - NiriumVault:     CDYVJU7PKC2XHSA6U4GM5QHKFT4LEFTXVUWKGTDUV2T76FO5MVDOJ3EE
 *  - ELO Reputation:  CC6Z3WJWRKVEAXEKIQ5S3LFEMKRF4L2FTN5YZDQU27MQRQAWA5QBJWF2
 *  - Marketplace:     CB6Q3LKBJ7CAAZY4MK7EG5R6FDDTJHB52ZEENI6BQLBJNFKBQRIAUABC
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
    VAULT: process.env.NEXT_PUBLIC_CONTRACT_VAULT || 'CDYVJU7PKC2XHSA6U4GM5QHKFT4LEFTXVUWKGTDUV2T76FO5MVDOJ3EE',
    ELO: process.env.NEXT_PUBLIC_CONTRACT_ELO || 'CC6Z3WJWRKVEAXEKIQ5S3LFEMKRF4L2FTN5YZDQU27MQRQAWA5QBJWF2',
    MARKETPLACE: process.env.NEXT_PUBLIC_CONTRACT_MARKETPLACE || 'CB6Q3LKBJ7CAAZY4MK7EG5R6FDDTJHB52ZEENI6BQLBJNFKBQRIAUABC',
} as const;

// Soroban Native Token Address (XLM) on Stellar Testnet
export const NATIVE_ASSET_ID = 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC';

// USDC Asset ID on Stellar Testnet (GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5)
export const USDC_ASSET_ID = 'CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA';

// ─── CETES Asset — Etherfuse Stablebonds on Stellar ──────────────────
// CETES = Mexican Federal Treasury Certificates, tokenized by Etherfuse
// This issuer EXISTS on Stellar TESTNET (confirmed via Horizon)
// Reference: https://github.com/ElliotFriend/regional-starter-pack
export const CETES_ASSET = {
    code: 'CETES',
    issuer: 'GC3CW7EDYRTWQ635VDIGY6S4ZUF5L6TQ7AA4MWS7LEQDBLUSZXV7UPS4',
} as const;

// CETES Contract Address (for Soroban vaults) - SAC Wrapper
export const CETES_ASSET_ID = 'CC72F57YTPX76HAA64JQOEGHQAPSADQWSY5DWVBR66JINPFDLNCQYHIC';

// Etherfuse On/Off Ramp URLs
export const ETHERFUSE_RAMP_URL = 'https://devnet.etherfuse.com';

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
    silent = false,
}: InvokeParams & { silent?: boolean }): Promise<{ success: boolean; result?: unknown; txHash?: string; error?: string; isSimulationError?: boolean }> {
    const server = getRpcServer();
    if (!silent) console.log(`[Soroban] Invoking ${method} on contract ${contractId} with args:`, args);

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
            .setTimeout(300)
            .build();

        // 3. Simulate to get footprint and soroban data
        const simResult = await server.simulateTransaction(transaction);

        if (SorobanRpc.Api.isSimulationError(simResult)) {
            if (!silent) console.error('[Soroban] Simulation error details:', JSON.stringify(simResult));
            return { 
                success: false, 
                error: `Simulation failed: ${simResult.error}`,
                isSimulationError: true 
            };
        }

        // 4. Assemble the final transaction with simulation data
        const assembledTx = SorobanRpc.assembleTransaction(transaction, simResult).build();
        const txXdr = assembledTx.toXDR();

        // 4. Sign with Freighter (handles both string and object with error)
        const signedResult = await signTransaction(txXdr, {
            networkPassphrase: NETWORK_PASSPHRASE,
            address: callerAddress,
            accountToSign: callerAddress,
        } as any);

        if (signedResult && typeof signedResult === 'object' && ('error' in signedResult)) {
            return { success: false, error: (signedResult as any).error as string };
        }

        const signedXdr = typeof signedResult === 'string' ? signedResult : (signedResult as any).signedTxXdr;
        if (!signedXdr) {
            return { success: false, error: 'Freighter signing failed' };
        }

        // 6. Submit signed transaction
        const submitResult = await server.sendTransaction(
            TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE) as any
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
    const simulatorKey = 'GC4Q5TWWXI7IHN6DYCBEKCOWJWCKY4JE2NLKLU5SE3YL44IUUFPKUOPC';
    const fakeAccount = new Account(simulatorKey, '0');

    try {
        const contract = new Contract(contractId);
        const tx = new TransactionBuilder(fakeAccount, {
            fee: BASE_FEE,
            networkPassphrase: NETWORK_PASSPHRASE,
        })
            .addOperation(contract.call(method, ...args))
            .setTimeout(300)
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
 * Get detailed vault info including real on-chain balance
 */
export async function vaultGetVault(vaultId: number): Promise<any> {
    const result = await simulateContractRead({
        contractId: CONTRACT_IDS.VAULT,
        method: 'get_vault',
        args: [nativeToScVal(vaultId, { type: 'u64' })],
    });
    return result;
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
            Address.fromString(NATIVE_ASSET_ID).toScVal(),
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

/**
 * Revoke an agent's access to a vault (Used as on-chain termination log)
 */
export async function vaultRevokeAgent(callerAddress: string, vaultId: number, agentAddress: string, silent = false) {
    return invokeContract({
        contractId: CONTRACT_IDS.VAULT,
        method: 'revoke_agent',
        args: [
            nativeToScVal(vaultId, { type: 'u64' }),
            Address.fromString(agentAddress).toScVal(),
        ],
        callerAddress,
        silent,
    });
}

/**
 * Permanently close a vault on-chain (Final Termination Log)
 */
export async function vaultClose(callerAddress: string, vaultId: number) {
    return invokeContract({
        contractId: CONTRACT_IDS.VAULT,
        method: 'close_vault',
        args: [
            nativeToScVal(vaultId, { type: 'u64' }),
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

// ═══════════════════════════════════════════════════════
// CETES INTEGRATION — Etherfuse Ramp Support
// ═══════════════════════════════════════════════════════



/**
 * Get CETES balance for a user's wallet.
 */
export async function getCETESBalance(walletAddress: string): Promise<string> {
    const { Horizon } = await import('@stellar/stellar-sdk');

    try {
        const horizonServer = new Horizon.Server(HORIZON_URL);
        const account = await horizonServer.loadAccount(walletAddress);

        const cetesBalance = account.balances.find(
            (balance: any) =>
                balance.asset_type !== 'native' &&
                balance.asset_code === CETES_ASSET.code &&
                balance.asset_issuer === CETES_ASSET.issuer
        );

        return cetesBalance ? cetesBalance.balance : '0';
    } catch {
        return '0';
    }
}

/**
 * Check if user has CETES trustline established.
 */
export async function hasCETESTrustline(walletAddress: string): Promise<boolean> {
    const { Horizon } = await import('@stellar/stellar-sdk');

    try {
        const horizonServer = new Horizon.Server(HORIZON_URL);
        const account = await horizonServer.loadAccount(walletAddress);

        return account.balances.some(
            (balance: any) =>
                balance.asset_type !== 'native' &&
                balance.asset_code === CETES_ASSET.code &&
                balance.asset_issuer === CETES_ASSET.issuer
        );
    } catch {
        return false;
    }
}
