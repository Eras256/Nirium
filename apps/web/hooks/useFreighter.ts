import { requestAccess, getAddress, getNetwork, isAllowed } from "@stellar/freighter-api";
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

    // ── Auto-reconnect: check if previously allowed ─────────────
    useEffect(() => {
        const verifyExistingConnection = async () => {
            try {
                const allowedResult = await isAllowed();
                if ("isAllowed" in allowedResult && allowedResult.isAllowed) {
                    const addrResult = await getAddress();
                    if (addrResult.address && !addrResult.error) {
                        setAddress(addrResult.address);
                        setIsConnected(true);
                        setStatus('connected');
                        await fetchAccountDetails(addrResult.address);
                    }
                }
            } catch (e) {
                // Freighter not available — silently ignore on page load
                console.log("Freighter not detected on page load.");
            }
        };
        verifyExistingConnection();
    }, []);

    // ── Connect: just call requestAccess directly ───────────────
    const connect = async () => {
        setStatus('connecting');
        try {
            // requestAccess() does everything:
            // - If Freighter is not installed, it throws an error
            // - If the user hasn't allowed this app, it prompts them
            // - If the user accepts, it returns { address: "G..." }
            const accessResult = await requestAccess();

            if (accessResult.error) {
                console.error("Freighter requestAccess error:", accessResult.error);
                setStatus('error');
                alert(
                    "Could not connect to Freighter.\n\n" +
                    "• Mobile: Open this site inside the Freighter App's DApp Browser.\n" +
                    "• PC: Install the Freighter Chrome Extension from freighter.app\n\n" +
                    "Error: " + accessResult.error
                );
                return;
            }

            if (accessResult.address) {
                setAddress(accessResult.address);
                setIsConnected(true);
                setStatus('connected');
                await fetchAccountDetails(accessResult.address);
            } else {
                setStatus('error');
                console.error("No address returned from Freighter");
            }
        } catch (e: any) {
            setStatus('error');
            console.error("Error connecting to Freighter:", e);
            alert(
                "Freighter Wallet not detected.\n\n" +
                "• Mobile: Open this site inside the Freighter App's DApp Browser.\n" +
                "• PC: Install the Freighter Chrome Extension from freighter.app"
            );
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
