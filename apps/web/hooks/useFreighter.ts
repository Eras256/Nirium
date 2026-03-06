"use client";

import { useState, useEffect } from "react";
import { Horizon } from "@stellar/stellar-sdk";

// @ts-ignore - Ignore module resolution for bundler due to TS bugs in SWK package
import { StellarWalletsKit, Networks } from "@creit.tech/stellar-wallets-kit";
// @ts-ignore
import { FreighterModule, FREIGHTER_ID } from "@creit.tech/stellar-wallets-kit/modules/freighter";
// @ts-ignore
import { defaultModules } from '@creit.tech/stellar-wallets-kit/modules/utils';

let isInitialized = false;

function ensureInit() {
    if (!isInitialized) {
        StellarWalletsKit.init({
            modules: [new FreighterModule()],
            network: Networks.TESTNET
        });
        isInitialized = true;
    }
}

export function useFreighter() {
    const [address, setAddress] = useState<string | null>(null);
    const [network, setNetwork] = useState<string | null>("TESTNET");
    const [balance, setBalance] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);
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
                    setIsConnected(true);
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

            // This is the native Stellar Wallets Kit modal that works out-of-the-box in mobile app browser!
            const { address: addr } = await StellarWalletsKit.authModal();

            if (addr) {
                setAddress(addr);
                setIsConnected(true);
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
        setIsConnected(false);
        setStatus('idle');
    };

    const runWithFreighter = async (fn: () => Promise<void>) => {
        if (!isConnected) {
            await connect();
        }
        if (isConnected) {
            await fn();
        }
    };

    return {
        address,
        network,
        balance,
        isConnected,
        status,
        connect,
        disconnect,
        runWithFreighter,
    };
}
