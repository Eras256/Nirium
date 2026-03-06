import { isAllowed, setAllowed, getAddress, getNetwork, isConnected as getIsFreighterConnected } from "@stellar/freighter-api";
import { useState, useEffect } from "react";
import { Horizon } from "@stellar/stellar-sdk";

export function useFreighter() {
    const [address, setAddress] = useState<string | null>(null);
    const [network, setNetwork] = useState<string | null>(null);
    const [balance, setBalance] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');

    const fetchAccountDetails = async (pubKey: string) => {
        try {
            const networkObj = await getNetwork();
            const currentNetwork = networkObj.network;
            setNetwork(currentNetwork);

            const serverUrl = currentNetwork === 'TESTNET'
                ? 'https://horizon-testnet.stellar.org'
                : 'https://horizon.stellar.org';

            const server = new Horizon.Server(serverUrl);
            try {
                const account = await server.loadAccount(pubKey);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const nativeBalance = account.balances.find((b: any) => b.asset_type === 'native');
                if (nativeBalance) {
                    setBalance(nativeBalance.balance);
                } else {
                    setBalance('0');
                }
            } catch (err) {
                console.warn("Account not funded or error fetching balance:", err);
                setBalance('0');
            }
        } catch (e) {
            console.error("Error fetching network/balance:", e);
        }
    };

    // Helper to timeout hanging promises from Freighter API
    const withTimeout = <T>(promise: Promise<T>, ms: number = 2000): Promise<T> => {
        return Promise.race([
            promise,
            new Promise<T>((_, reject) => setTimeout(() => reject(new Error("Timeout")), ms))
        ]);
    };

    useEffect(() => {
        const verifyExistingConnection = async () => {
            try {
                // Fast check: Did we already authorize before?
                const allowed = await withTimeout(isAllowed(), 1500).catch(() => false);
                if (allowed) {
                    const response = await withTimeout(getAddress(), 2000);
                    if (response.address) {
                        setAddress(response.address);
                        setIsConnected(true);
                        setStatus('connected');
                        await fetchAccountDetails(response.address);
                    }
                }
            } catch (e) {
                console.log("No previous freighter connection detected.");
            }
        };
        verifyExistingConnection();
    }, []);

    const connect = async () => {
        setStatus('connecting');
        try {
            // Check if user has Freighter installed (Extension OR App Browser)
            const connStatus = await withTimeout(getIsFreighterConnected(), 1500).catch(() => ({ isConnected: false }));

            if (!connStatus.isConnected) {
                alert("Freighter Wallet is not installed or not detected.\\n\\nIf you are on Mobile: Open this site INSIDE the Freighter App's DApp Browser.\\nIf you are on PC: Install the Freighter Chrome Extension.");
                setStatus('error');
                return;
            }

            // Request connection to the wallet
            const isAllowedResult = await setAllowed();
            if (isAllowedResult) {
                const response = await getAddress();
                if (response.address) {
                    setAddress(response.address);
                    setIsConnected(true);
                    setStatus('connected');
                    await fetchAccountDetails(response.address);
                } else {
                    setStatus('error');
                    console.error("No address found");
                }
            } else {
                setStatus('error');
                console.error("User refused connection");
            }
        } catch (e: any) {
            setStatus('error');
            console.error("Error connecting to Freighter:", e);

            // Handle edge case where Freighter API hangs entirely 
            if (e.message === "Timeout") {
                alert("Freighter is not responding.\\n\\nPlease ensure you are inside the Freighter App Browser on mobile.");
            } else {
                alert("Connection failed. Please unlock your Freighter wallet and try again.");
            }
        }
    };

    const disconnect = async () => {
        setAddress(null);
        setNetwork(null);
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
    }

    return {
        address,
        network,
        balance,
        isConnected,
        status,
        connect,
        disconnect,
        runWithFreighter
    };
}
