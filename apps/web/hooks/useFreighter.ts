import { isConnected as getIsFreighterConnected, requestAccess, getAddress, getNetwork, isAllowed } from "@stellar/freighter-api";
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

    // ── Auto-reconnect on load ──────────────────────────────────
    useEffect(() => {
        const verifyExistingConnection = async () => {
            try {
                // 1. Check if Freighter extension/app is present
                const connResult = await getIsFreighterConnected();
                if (!("isConnected" in connResult && connResult.isConnected)) return;

                // 2. Check if this dApp was previously allowed
                const allowedResult = await isAllowed();
                if (!("isAllowed" in allowedResult && allowedResult.isAllowed)) return;

                // 3. Retrieve user public key silently
                const addrResult = await getAddress();
                if (addrResult.error || !addrResult.address) return;

                setAddress(addrResult.address);
                setIsConnected(true);
                setStatus('connected');
                await fetchAccountDetails(addrResult.address);
            } catch (e) {
                console.log("No previous Freighter connection detected.");
            }
        };
        verifyExistingConnection();
    }, []);

    // ── Connect button handler ──────────────────────────────────
    const connect = async () => {
        setStatus('connecting');
        try {
            // 1. Check if Freighter is installed (extension or mobile app browser)
            const connResult = await getIsFreighterConnected();

            if (!("isConnected" in connResult && connResult.isConnected)) {
                alert(
                    "Freighter Wallet is not detected.\n\n" +
                    "• Mobile: Open this site inside the Freighter App's DApp Browser.\n" +
                    "• PC: Install the Freighter Chrome Extension from freighter.app"
                );
                setStatus('error');
                return;
            }

            // 2. Use requestAccess — this prompts the user AND returns the public key in one step
            //    This is the officially recommended flow from docs.freighter.app
            const accessResult = await requestAccess();

            if (accessResult.error) {
                console.error("Freighter requestAccess error:", accessResult.error);
                setStatus('error');
                alert("Connection refused or failed: " + accessResult.error);
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
            alert("Connection failed. Please unlock your Freighter wallet and try again.");
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
