import { isAllowed, setAllowed, getAddress, getNetwork } from "@stellar/freighter-api";
import { useState, useEffect } from "react";
import { Horizon } from "@stellar/stellar-sdk";

declare global {
    interface Window {
        freighter?: any;
        stellar?: any;
    }
}


export function useFreighter() {
    const [address, setAddress] = useState<string | null>(null);
    const [network, setNetwork] = useState<string | null>(null);
    const [balance, setBalance] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');

    const fetchAccountDetails = async (pubKey: string) => {
        try {
            const networkObj = await getNetwork();
            // freighter-api returns network usually as 'PUBLIC' or 'TESTNET' (could vary slightly, handle safely)
            // But getNetwork() returns object { network: string; ... } wrapped in promise.
            // Actually based on index.d.ts: getNetwork: () => Promise<{ network: string; networkPassphrase: string; ... }>

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

    useEffect(() => {
        const checkConnection = async () => {
            try {
                // Check if Freighter is available in window
                if (typeof window !== 'undefined' && (window.freighter || window.stellar)) {
                    const isAllowedResult = await isAllowed();
                    if (isAllowedResult) {
                        const response = await getAddress();
                        if (response.address) {
                            setAddress(response.address);
                            setIsConnected(true);
                            setStatus('connected');
                            await fetchAccountDetails(response.address);
                        }
                    }
                }
            } catch (e) {
                console.error("Error checking Freighter connection:", e);
            }
        };
        checkConnection();
    }, []);

    const connect = async () => {
        setStatus('connecting');
        try {
            // First check if extension is actually totally missing in mobile context
            if (typeof window !== 'undefined' && !window.freighter && !window.stellar) {
                alert("Freighter Wallet is not installed or not detected on this browser/device.");
                setStatus('error');
                return;
            }

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
            console.error("Error connecting to Freighter", e);
            if (e.message && e.message.includes("is not installed")) {
                alert("Please install Freighter wallet extension or use a supported browser.");
            } else {
                alert("Could not connect to Freighter wallet.");
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
