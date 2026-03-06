"use client";

import { useState, useEffect } from "react";
import { Horizon } from "@stellar/stellar-sdk";

// @ts-ignore - Ignore module resolution for bundler due to TS bugs in SWK package
import { StellarWalletsKit, Networks } from "@creit.tech/stellar-wallets-kit";
// @ts-ignore
import { FreighterModule } from "@creit.tech/stellar-wallets-kit/modules/freighter";
// @ts-ignore
import { WalletConnectModule } from "@creit.tech/stellar-wallets-kit/modules/wallet-connect";
// @ts-ignore
import { defaultModules } from '@creit.tech/stellar-wallets-kit/modules/utils';
// @ts-ignore
import { SwkAppDarkTheme } from '@creit.tech/stellar-wallets-kit/types';
// @ts-ignore
import { isConnected } from "@stellar/freighter-api";

// ──────────────────────────────────────────────────────────────────
// OVERRIDE FREIGHTER MODULE
// The official kit hardblocks the Freighter mobile app and forces
// developers to use WalletConnect. We override isAvailable to
// let the user try native injection just in case the app supports it.
class NativeFreighterModule extends FreighterModule {
    async isAvailable() {
        if (typeof window !== "undefined" && (window as any).stellar?.provider === "freighter") {
            return true;
        }
        try {
            const response = await isConnected();
            return !response.error && response.isConnected;
        } catch {
            return false;
        }
    }
}
// ──────────────────────────────────────────────────────────────────

let isInitialized = false;

function ensureInit() {
    if (!isInitialized) {

        // 1. All default DApp wallets from the ecosystem (xBull, Albedo, LOBSTR, etc)
        // EXCEPT Freighter (we filter it out to inject our extended version)
        const defaults = defaultModules().filter((m: any) => m.productId !== "freighter");

        // 2. Native Freighter (PC Extension & Mobile attempt)
        const nativeFreighter = new NativeFreighterModule();

        // 3. WalletConnect (The officially supported method for Mobile)
        const wcModule = new WalletConnectModule({
            projectId: "5e98f060f64c1bd7e543bc8836528d22",
            metadata: {
                name: 'Nirium Protocol',
                description: 'Institutional-grade autonomous Stellar AI Agent Swarm.',
                url: 'https://nirium-stellar.vercel.app',
                icons: ['https://nirium-stellar.vercel.app/icon.png']
            }
        });

        // Use custom dark theme parameters exactly as Soroswap
        StellarWalletsKit.init({
            modules: [...defaults, nativeFreighter, wcModule],
            network: Networks.TESTNET,
            theme: SwkAppDarkTheme,
            authModal: {
                hideUnsupportedWallets: true
            }
        });
        isInitialized = true;
    }
}

export function useFreighter() {
    const [address, setAddress] = useState<string | null>(null);
    const [network, setNetwork] = useState<string | null>("TESTNET");
    const [balance, setBalance] = useState<string | null>(null);
    const [isConnectedState, setIsConnectedState] = useState(false);
    const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');

    const fetchBalance = async (pubKey: string) => {
        try {
            const server = new Horizon.Server('https://horizon-testnet.stellar.org');
            const account = await server.loadAccount(pubKey);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const nativeBalance = account.balances.find((b: any) => b.asset_type === 'native');
            setBalance(nativeBalance ? nativeBalance.balance : '0');
        } catch {
            setBalance('0');
        }
    };

    // Check for existing connection on mount
    useEffect(() => {
        const check = async () => {
            try {
                ensureInit();
                const { address: addr } = await StellarWalletsKit.getAddress();
                if (addr) {
                    setAddress(addr);
                    setIsConnectedState(true);
                    setStatus('connected');
                    await fetchBalance(addr);
                }
            } catch {
                // Not connected — fine
            }
        };
        check();
    }, []);

    const connect = async () => {
        setStatus('connecting');
        try {
            ensureInit();

            // This is the native Stellar Wallets Kit modal!
            const { address: addr } = await StellarWalletsKit.authModal();

            if (addr) {
                setAddress(addr);
                setIsConnectedState(true);
                setStatus('connected');
                await fetchBalance(addr);
            } else {
                setStatus('error');
            }
        } catch (e: any) {
            setStatus('error');
            console.error("Wallet connection failed:", e);
        }
    };

    const disconnect = async () => {
        try {
            ensureInit();
            await StellarWalletsKit.disconnect();
        } catch (e) {
            console.error("Disconnect error:", e);
        }
        setAddress(null);
        setBalance(null);
        setIsConnectedState(false);
        setStatus('idle');
    };

    const runWithFreighter = async (fn: () => Promise<void>) => {
        if (!isConnectedState) {
            await connect();
        }
        if (isConnectedState) {
            await fn();
        }
    };

    const signTransaction = async (xdr: string, opts?: { networkPassphrase?: string, address?: string }) => {
        ensureInit();
        return await StellarWalletsKit.signTransaction(xdr, opts);
    };

    const signAuthEntry = async (authEntry: string, opts?: { networkPassphrase?: string, address?: string }) => {
        ensureInit();
        return await StellarWalletsKit.signAuthEntry(authEntry, opts);
    };

    const signMessage = async (message: string, opts?: { networkPassphrase?: string, address?: string }) => {
        ensureInit();
        return await StellarWalletsKit.signMessage(message, opts);
    };

    return {
        address,
        network,
        balance,
        isConnected: isConnectedState,
        status,
        connect,
        disconnect,
        runWithFreighter,
        signTransaction,
        signAuthEntry,
        signMessage,
    };
}
