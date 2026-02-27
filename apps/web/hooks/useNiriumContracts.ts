'use client';

/**
 * ═══════════════════════════════════════════════════════
 * Nirium — React Hook: useNiriumContracts
 * ═══════════════════════════════════════════════════════
 *
 * Provides easy access to all 3 Soroban contracts from
 * any component. All write transactions prompt Freighter.
 */

import { useState, useCallback } from 'react';
import {
    vaultGetTotalFees,
    vaultGetVaultCount,
    vaultCreate,
    vaultWithdraw,
    eloGetScore,
    eloGetProfile,
    eloGetTotalSentinels,
    eloRegisterSentinel,
    marketplaceGetStrategy,
    marketplaceGetStrategyCount,
    marketplacePublishStrategy,
    marketplaceSubscribe,
    CONTRACT_IDS,
} from '../lib/sorobanContracts';

export type TxStatus = 'idle' | 'signing' | 'submitting' | 'confirmed' | 'error';

export interface TxState {
    status: TxStatus;
    txHash?: string;
    error?: string;
}

function useTxState() {
    const [tx, setTx] = useState<TxState>({ status: 'idle' });

    const begin = () => setTx({ status: 'signing' });
    const submitting = () => setTx(s => ({ ...s, status: 'submitting' }));
    const confirm = (txHash: string) => setTx({ status: 'confirmed', txHash });
    const fail = (error: string) => setTx({ status: 'error', error });
    const reset = () => setTx({ status: 'idle' });

    return { tx, begin, submitting, confirm, fail, reset };
}

// ═══════════════════════════════════════════════════════
// VAULT HOOK
// ═══════════════════════════════════════════════════════
export function useVault() {
    const { tx, begin, confirm, fail, reset } = useTxState();

    const getTotalFees = useCallback(() => vaultGetTotalFees(), []);
    const getVaultCount = useCallback(() => vaultGetVaultCount(), []);

    const createVault = useCallback(async (callerAddress: string, amountXlm: bigint) => {
        begin();
        try {
            const result = await vaultCreate(callerAddress, amountXlm);
            if (result.success && result.txHash) {
                confirm(result.txHash);
            } else {
                fail(result.error ?? 'Unknown error');
            }
            return result;
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : String(e);
            fail(msg);
            return { success: false, error: msg };
        }
    }, []);

    const withdraw = useCallback(async (callerAddress: string, vaultId: number) => {
        begin();
        try {
            const result = await vaultWithdraw(callerAddress, vaultId);
            if (result.success && result.txHash) {
                confirm(result.txHash);
            } else {
                fail(result.error ?? 'Unknown error');
            }
            return result;
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : String(e);
            fail(msg);
            return { success: false, error: msg };
        }
    }, []);

    return {
        tx,
        reset,
        contractId: CONTRACT_IDS.VAULT,
        getTotalFees,
        getVaultCount,
        createVault,
        withdraw,
    };
}

// ═══════════════════════════════════════════════════════
// ELO REPUTATION HOOK
// ═══════════════════════════════════════════════════════
export function useEloReputation() {
    const { tx, begin, confirm, fail, reset } = useTxState();

    const getScore = useCallback((address: string) => eloGetScore(address), []);
    const getProfile = useCallback((address: string) => eloGetProfile(address), []);
    const getTotalSentinels = useCallback(() => eloGetTotalSentinels(), []);

    const registerSentinel = useCallback(async (callerAddress: string) => {
        begin();
        try {
            const result = await eloRegisterSentinel(callerAddress);
            if (result.success && result.txHash) {
                confirm(result.txHash);
            } else {
                fail(result.error ?? 'Unknown error');
            }
            return result;
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : String(e);
            fail(msg);
            return { success: false, error: msg };
        }
    }, []);

    return {
        tx,
        reset,
        contractId: CONTRACT_IDS.ELO,
        getScore,
        getProfile,
        getTotalSentinels,
        registerSentinel,
    };
}

// ═══════════════════════════════════════════════════════
// MARKETPLACE HOOK
// ═══════════════════════════════════════════════════════
export function useMarketplace() {
    const { tx, begin, confirm, fail, reset } = useTxState();

    const getStrategy = useCallback((id: number) => marketplaceGetStrategy(id), []);
    const getStrategyCount = useCallback(() => marketplaceGetStrategyCount(), []);

    const publishStrategy = useCallback(async (
        callerAddress: string,
        name: string,
        ipfsCid: string,
        feeUsdc: bigint,
    ) => {
        begin();
        try {
            const result = await marketplacePublishStrategy(callerAddress, name, ipfsCid, feeUsdc);
            if (result.success && result.txHash) {
                confirm(result.txHash);
            } else {
                fail(result.error ?? 'Unknown error');
            }
            return result;
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : String(e);
            fail(msg);
            return { success: false, error: msg };
        }
    }, []);

    const subscribe = useCallback(async (
        callerAddress: string,
        strategyId: number,
        usdcTokenAddress: string,
    ) => {
        begin();
        try {
            const result = await marketplaceSubscribe(callerAddress, strategyId, usdcTokenAddress);
            if (result.success && result.txHash) {
                confirm(result.txHash);
            } else {
                fail(result.error ?? 'Unknown error');
            }
            return result;
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : String(e);
            fail(msg);
            return { success: false, error: msg };
        }
    }, []);

    return {
        tx,
        reset,
        contractId: CONTRACT_IDS.MARKETPLACE,
        getStrategy,
        getStrategyCount,
        publishStrategy,
        subscribe,
    };
}

// ═══════════════════════════════════════════════════════
// TX STATUS DISPLAY COMPONENT HELPER
// ═══════════════════════════════════════════════════════
export function getTxStatusText(tx: TxState): string {
    switch (tx.status) {
        case 'signing': return '✍️ Waiting for Freighter signature...';
        case 'submitting': return '📡 Submitting to Stellar network...';
        case 'confirmed': return `✅ Confirmed! Tx: ${tx.txHash?.substring(0, 12)}...`;
        case 'error': return `❌ Error: ${tx.error}`;
        default: return '';
    }
}

export function getTxExplorerUrl(txHash: string): string {
    return `https://stellar.expert/explorer/testnet/tx/${txHash}`;
}
