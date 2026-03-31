"use client";

import { useState } from 'react';
import { useFreighter } from "@/hooks/useFreighter";
import { Key, Lock, Copy, CheckCircle, RefreshCw, AlertTriangle, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { API_URL } from '@/lib/constants';

interface ApiKeyData {
    apiKey: string;
    keyInfo: {
        name: string;
        permissions: string[];
        createdAt: string;
    };
}

export default function ApiKeyManager() {
    const { address: accountStr, isConnected, signMessage } = useFreighter();
    const account = isConnected ? { address: accountStr, chains: ['stellar:testnet'] } : null;

    const [isLoading, setIsLoading] = useState(false);
    const [generatedKey, setGeneratedKey] = useState<ApiKeyData | null>(null);
    const [hasCopied, setHasCopied] = useState(false);

    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const handleGenerateKey = async () => {
        setErrorMsg(null);
        console.log("Generating key initiated...");

        if (!account) {
            const msg = "Please connect your wallet first using the button in the navbar.";
            toast.error(msg);
            setErrorMsg(msg);
            return;
        }

        setIsLoading(true);
        try {
            console.log("1. Requesting signature...");
            // 1. Sign Message to Authenticate with Freighter
            const messageText = `Login to Nirium Agent API\nTimestamp: ${Date.now()}`;

            if (!signMessage) {
                throw new Error('Freighter signMessage not available');
            }

            // StellarWalletsKit.signMessage returns { signedMessage: string }
            const { signedMessage } = await signMessage(messageText);
            console.log("Signature obtained:", signedMessage);

            // 2. Get JWT Token
            console.log(`2. Fetching JWT token from ${API_URL}/api/auth/token...`);
            const tokenRes = await fetch(`${API_URL}/api/auth/token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    walletAddress: account.address,
                    signature: signedMessage,
                    message: messageText
                })
            }).catch(err => {
                throw new Error(`Connection to Agent API failed: ${err.message}. Is the server running at ${API_URL}?`);
            });

            if (!tokenRes.ok) {
                const text = await tokenRes.text();
                throw new Error(`API Error (${tokenRes.status}): ${text}`);
            }

            const tokenData = await tokenRes.json();
            if (!tokenData.success && !tokenData.token) throw new Error(tokenData.error || 'Failed to authenticate');

            const jwt = tokenData.token;
            console.log("JWT obtained.");

            // 3. Generate API Key
            console.log("3. Requesting API Key...");
            const keyRes = await fetch(`${API_URL}/api/auth/keys`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${jwt}`
                },
                body: JSON.stringify({
                    name: `Dashboard Key - ${new Date().toLocaleDateString()}`,
                    permissions: ['execute', 'subscribe']
                })
            });

            const keyData = await keyRes.json();
            if (!keyData.success && !keyData.apiKey) throw new Error(keyData.error || 'Failed to generate key');

            setGeneratedKey(keyData);
            toast.success("API Key Generated Successfully!");

        } catch (error: any) {
            console.error("Key Generation Error:", error);
            const msg = error.message || "Failed to generate API Key";
            setErrorMsg(msg);
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };


    const copyToClipboard = () => {
        if (generatedKey) {
            navigator.clipboard.writeText(generatedKey.apiKey);
            setHasCopied(true);
            toast.success("Copied to clipboard");
            setTimeout(() => setHasCopied(false), 2000);
        }
    };

    return (
        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6 max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-stellar-yellow/20 p-2 rounded-lg">
                    <Key className="w-6 h-6 text-stellar-yellow" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">Agent Console</h3>
                    <p className="text-sm text-gray-400">Generate secure credentials for your external agents.</p>
                </div>
            </div>

            {!account ? (
                <div className="flex flex-col items-center justify-center py-8 bg-white/5 rounded-lg border border-dashed border-white/20">
                    <Lock className="w-8 h-8 text-gray-500 mb-3" />
                    <p className="text-gray-300 font-medium">Wallet Not Connected</p>
                    <p className="text-sm text-gray-500 mb-4">Connect your wallet to generate keys</p>
                    {/* Note: The user should use the main Navbar connect button */}
                    <div className="text-xs text-stellar-teal bg-stellar-teal/10 px-3 py-1 rounded-full">
                        Use Navbar to Connect
                    </div>
                </div>
            ) : !generatedKey ? (
                <div className="space-y-4">
                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-start gap-3">
                        <Shield className="w-5 h-5 text-blue-400 mt-0.5" />
                        <div className="text-sm text-blue-200">
                            <strong>Security Note:</strong> You will be asked to sign a message to prove ownership of this wallet.
                            This signature is used securely to generate your unique API Key.
                        </div>
                    </div>

                    {errorMsg && (
                        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                            <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                            <div className="text-sm text-red-200">
                                <strong>Error:</strong> {errorMsg}
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handleGenerateKey}
                        disabled={isLoading}
                        className="w-full py-3 bg-gradient-to-r from-stellar-yellow to-stellar-teal text-black font-bold rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <RefreshCw className="w-5 h-5 animate-spin" />
                                Generating Secure Key...
                            </>
                        ) : (
                            <>
                                <Key className="w-5 h-5" />
                                Generate New API Key
                            </>
                        )}
                    </button>
                </div>
            ) : (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2 text-green-400">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-bold">API Key Generated Successfully</span>
                    </div>

                    <div className="relative">
                        <div className="text-xs text-gray-500 mb-1 ml-1 uppercase font-bold tracking-wider">Your Secret API Key</div>
                        <div className="flex items-center gap-2 bg-black border border-stellar-teal/50 rounded-lg p-1 pr-2">
                            <div className="flex-1 bg-transparent font-mono text-stellar-teal px-3 py-2 text-lg truncate">
                                {generatedKey.apiKey}
                            </div>
                            <button
                                onClick={copyToClipboard}
                                className="p-2 hover:bg-white/10 rounded-md transition-colors text-gray-400 hover:text-white"
                                title="Copy to clipboard"
                            >
                                {hasCopied ? <CheckCircle className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                            </button>
                        </div>
                        <div className="mt-2 flex items-center gap-2 text-xs text-amber-500">
                            <AlertTriangle className="w-3 h-3" />
                            Warning: This key will not be shown again. Copy it now.
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="bg-white/5 p-3 rounded-lg">
                            <span className="text-gray-500 block text-xs">Permission Scope</span>
                            <span className="text-white font-mono">execute, subscribe</span>
                        </div>
                        <div className="bg-white/5 p-3 rounded-lg">
                            <span className="text-gray-500 block text-xs">Limit</span>
                            <span className="text-white font-mono">60 req/min</span>
                        </div>
                    </div>

                    <button
                        onClick={() => setGeneratedKey(null)}
                        className="text-sm text-gray-500 hover:text-white underline w-full text-center"
                    >
                        Close and Clear from Screen
                    </button>
                </div>
            )}
        </div>
    );
}
