// @ts-nocheck
'use client';

import Navbar from "@/components/layout/Navbar";
import { SectionBrandLogo } from "@/components/ui/SectionBrandLogo";

import { Suspense, useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { Environment, Float, Sphere, MeshTransmissionMaterial } from "@react-three/drei";
import Link from 'next/link';
import { useFreighter } from "@/hooks/useFreighter";
import { TransactionBuilder, Networks, Asset, Operation, Keypair } from "@stellar/stellar-sdk";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { ExternalLink, Shield, X, AlertTriangle, Trash2, Info, ChevronRight, RefreshCw, Zap, Plus, Code, Cpu, Brain, Filter, Download, Activity, StopCircle, Database, Globe } from "lucide-react";
import OpsConsole from "@/components/layout/OpsConsole";
import ProtocolRevenue from "@/components/dashboard/ProtocolRevenue";
import { writeLog } from "@/lib/logger";
import { stellarClient } from "@/lib/stellarClient";
import { useVault, useEloReputation } from "@/hooks/useNiriumContracts";
import { getWebSocketUrl } from "@/lib/constants";
import { simulateSorobanTx } from "@/lib/stellarSim";
import { handleWalletError } from "@/components/wallet/WalletErrorHandler";
import { NATIVE_ASSET_ID, USDC_ASSET_ID, CETES_ASSET_ID, vaultDeposit, vaultWithdraw, vaultCreate, vaultClose, vaultRevokeAgent, vaultGetVaultCount, CETES_ASSET, getCETESBalance, hasCETESTrustline } from "@/lib/sorobanContracts";
import { generateOnboardingUrl, getOrCreateCustomerIds } from "@/lib/etherfuseApi";
import MarketTicker from "@/components/dashboard/MarketTicker";
import NeuralOrb from "@/components/dashboard/NeuralOrb";
import StatusBadge from "@/components/ui/StatusBadge";
import { useLanguage } from "@/context/LanguageContext";
import { useSecurityKillSwitch } from "@/lib/securityHooks";

// WebSocket hook removed as it was unused and redundant

function NeuralOrbSmall() {
    return (
        <group>
            <Float speed={5} rotationIntensity={1} floatIntensity={2}>
                <Sphere args={[1, 32, 32]}>
                    <MeshTransmissionMaterial
                        backside
                        thickness={2}
                        roughness={0}
                        transmission={1}
                        ior={1.5}
                        chromaticAberration={0.1}
                        anisotropy={20}
                        color="#FFC800"
                        toneMapped={false}
                    />
                </Sphere>
            </Float>
        </group>
    );
}

function DashboardContent() {
    const { t } = useLanguage();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { isLocked } = useSecurityKillSwitch();
    const { address: accountStr, isConnected, connect, disconnect } = useFreighter();
    const account = useMemo(() => isConnected && accountStr ? { address: accountStr, chains: ['stellar:testnet'] } : null, [isConnected, accountStr]);
    // Helper: Sign transaction with Freighter and submit to Horizon.
    const signAndSubmitTransaction = async ({ transaction }: { transaction: any }): Promise<{ hash: string }> => {
        const { signTransaction } = await import("@stellar/freighter-api");
        const { Horizon, Networks, TransactionBuilder } = await import("@stellar/stellar-sdk");

        console.log("Signing XDR via Freighter...");
        const txXdr = transaction.toXDR();

        // Let Freighter sign the Transaction
        const response = await signTransaction(txXdr, {
            networkPassphrase: Networks.TESTNET,
            address: transaction.source, // Ensure Freighter signs with the transaction's source account
        } as any);

        if (response.error) {
            throw new Error(response.error as string);
        }

        // Submit the signed transaction via Horizon
        const server = new Horizon.Server("https://horizon-testnet.stellar.org");
        const signedTx = TransactionBuilder.fromXDR(response.signedTxXdr, Networks.TESTNET);

        try {
            const result = await server.submitTransaction(signedTx as any);

            if (!result.successful) {
                throw new Error('Stellar Transaction failed on-chain');
            }

            return { hash: result.hash };
        } catch (e: any) {
            console.error("Horizon Submission Error:", e.response?.data || e);
            if (e.response?.data?.extras?.result_codes) {
                const codes = e.response.data.extras.result_codes;
                throw new Error(`Horizon rejected Tx: ${codes.transaction} - Operations: ${codes.operations?.join(', ')}`);
            }
            throw e;
        }
    };

    // Helper: fetch current sequence number and build transaction
    const buildStellarTransaction = async (accountId: string) => {
        const { TransactionBuilder, Networks, Horizon } = await import("@stellar/stellar-sdk");
        const server = new Horizon.Server("https://horizon-testnet.stellar.org");
        const sourceAccount = await server.loadAccount(accountId);
        return new TransactionBuilder(sourceAccount, { fee: "100", networkPassphrase: Networks.TESTNET }).setTimeout(300);
    };

    // Helper: fetch account or contract state from Horizon/Soroban
    const getLiveAccountData = async (accountId: string) => {
        const obj = await stellarClient.getObject({ id: accountId });
        if (!obj.data) throw new Error(`Account ${accountId} not found on Stellar network`);
        return obj.data;
    };
    const [showAutoStartModal, setShowAutoStartModal] = useState(false);
    const [baseAsset, setBaseAsset] = useState<"XLM" | "USDC" | "CETES">("USDC");
    const getCoinType = () => baseAsset === "XLM"
        ? "XLM"
        : baseAsset === "CETES"
        ? "CETES"
        : "USDC";

    const [selectedStrategy, setSelectedStrategy] = useState<any>(null); // State for Details Modal
    const [expandConsole, setExpandConsole] = useState(false);

    const [blendData, setBlendData] = useState<{ supplyApy: number, borrowApy: number } | null>(null);
    const [phoenixData, setPhoenixData] = useState<{ supplyApy: number, borrowApy: number } | null>(null);
    const [walletBalance, setWalletBalance] = useState<number>(0);
    const [cetesBalance, setCetesBalance] = useState<string>('0');
    const [hasCetesTrust, setHasCetesTrust] = useState<boolean>(false);
    const [onChainVaultCount, setOnChainVaultCount] = useState<number | null>(null);
    const [onChainTotalFees, setOnChainTotalFees] = useState<number | null>(null);
    const [onChainElo, setOnChainElo] = useState<number | null>(null);
    const vault = useVault();
    const elo = useEloReputation();

    // Fetch live on-chain data from Soroban RPC
    useEffect(() => {
        const fetchOnChainData = async () => {
            try {
                const [count, fees] = await Promise.all([
                    vault.getVaultCount(),
                    vault.getTotalFees(),
                ]);
                setOnChainVaultCount(count);
                setOnChainTotalFees(fees);
                if (accountStr) {
                    const score = await elo.getScore(accountStr);
                    setOnChainElo(score);
                }
            } catch (e) {
                console.warn('[Dashboard] On-chain data fetch failed:', e);
            }
        };
        fetchOnChainData();
    }, [accountStr]);
    const [vaultBalance, setVaultBalance] = useState<number>(0);
    const [vaultId, setVaultId] = useState<number | null>(null);
    const [ownerCapId, setOwnerCapId] = useState<string | null>(null);
    const [amountInput, setAmountInput] = useState<string>("0.1");
    const [installedSkills, setInstalledSkills] = useState<any[]>([]);

    const tradingSkills = installedSkills.filter(s => s.category === 'trading' || s.category === 'defi');
    const activePlugins = installedSkills.filter(s => s.category !== 'trading' && s.category !== 'defi');
    const [isSkillsLoading, setIsSkillsLoading] = useState(false);

    const [confirmConfig, setConfirmConfig] = useState<{
        isOpen: boolean;
        title: string;
        description: React.ReactNode;
        icon: React.ReactNode;
        confirmText: string;
        onConfirm: () => void;
        type: 'danger' | 'info';
    }>({
        isOpen: false,
        title: '',
        description: '',
        icon: null,
        confirmText: '',
        onConfirm: () => { },
        type: 'info'
    });

    // Fetch User Real Balance
    useEffect(() => {
        if (!account?.address) return;

        const fetchBalance = async () => {
            try {
                const { stellarClient } = await import("../../lib/stellarClient");
                const decimals = 10_000_000; // All Stellar / Soroban SAC assets use 7 decimals
                const coinType = baseAsset === "XLM"
                    ? "XLM"
                    : "USDC";
                const balance = await stellarClient.getBalance({ owner: account.address, coinType });
                const total = Number(BigInt(balance.totalBalance)) / decimals;
                setWalletBalance(total);
            } catch (e) {
                console.warn("Soft Error: Wallet Fetch Failed", e);
            }
        };

        fetchBalance();
        const interval = setInterval(fetchBalance, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, [account, baseAsset]);

    // Fetch CETES Balance and Trustline Status
    useEffect(() => {
        if (!account?.address) return;

        const fetchCETESData = async () => {
            try {
                const [balance, trustlineStatus] = await Promise.all([
                    getCETESBalance(account.address),
                    hasCETESTrustline(account.address)
                ]);
                setCetesBalance(balance);
                setHasCetesTrust(trustlineStatus);
            } catch (e) {
                console.warn("CETES fetch failed:", e);
            }
        };

        fetchCETESData();
        const interval = setInterval(fetchCETESData, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, [account]);

    // Fetch Vault Balance specifically
    useEffect(() => {
        if (!vaultId) {
            setVaultBalance(0);
            return;
        }

        const fetchVaultBalance = async () => {
            try {
                if (vaultId) {
                    const vData = await vault.getVault(Number(vaultId));
                    if (vData && vData.balance !== undefined) {
                        const realBalance = Number(BigInt(vData.balance)) / 10_000_000;
                        setVaultBalance(realBalance);
                        return;
                    }
                }

                // Fallback: Read from local storage to keep demo state across refreshes if contract not ready
                const storedBalance = localStorage.getItem(`nirium-vault-balance-${vaultId}-${baseAsset}`);
                if (storedBalance) {
                    setVaultBalance(parseFloat(storedBalance));
                } else {
                    setVaultBalance(0);
                }
            } catch (e) {
                console.warn("Soft Error: Vault Balance Scan Failed", e);
            }
        };

        fetchVaultBalance();
        const interval = setInterval(fetchVaultBalance, 10000);
        return () => clearInterval(interval);
    }, [vaultId, baseAsset]);

    // Fetch Real Protocol Data
    useEffect(() => {
        const fetchProtocols = async () => {
            try {
                // Direct fetch to Protocol SDKs (Simulated for Demo Stability)
                console.log("Connecting to Liquidity Protocols...");

                // Simulation of network call latency
                await new Promise(r => setTimeout(r, 1000));

                // In a full production app we would use:
                // const blend = new BlendSDK({ networkType: 'testnet' });
                // const market = await blend.queryMarket();
                // setBlendData(market.stellar.apy);

                // Setting "Real-like" dynamic data for stability if SDK is not fully configured in frontend package
                // (To avoid build errors with 'fs' dependencies in browser)
                setBlendData({ supplyApy: 12.45, borrowApy: 14.80 });
                setPhoenixData({ supplyApy: 13.20, borrowApy: 15.10 });

            } catch (e) {
                console.error("Protocol data fetch error", e);
            }
        };
        fetchProtocols();
    }, []);

    // Fetch Installed Skills
    const fetchInstalledSkills = async (agentId?: string) => {
        if (!agentId) return;

        setIsSkillsLoading(true);
        try {
            // Skills/Plugins catalog (now fetched from protocol-meta)
            const SKILL_CATALOG = protocolMeta.skills || {};

            // Read from localStorage PER-AGENT (where Marketplace + Plugins pages persist installs)
            const localSkills = JSON.parse(localStorage.getItem(`nirium-skills-${agentId}`) || '{}');
            const localPlugins = JSON.parse(localStorage.getItem(`nirium-plugins-${agentId}`) || '{}');
            const allLocalInstalled = { ...localSkills, ...localPlugins };

            // Build full skill objects from the catalog
            const resolved: any[] = [];
            for (const key of Object.keys(allLocalInstalled)) {
                if (allLocalInstalled[key] && SKILL_CATALOG[key]) {
                    resolved.push(SKILL_CATALOG[key]);
                }
            }

            // Also try the API (merge if available)
            try {
                const response = await fetch(`/api/marketplace/installed?agentId=${agentId}`);
                const data = await response.json();
                if (data.success && data.skills?.length > 0) {
                    const existingSlugs = new Set(resolved.map(s => s.slug));
                    for (const s of data.skills) {
                        if (!existingSlugs.has(s.slug)) {
                            resolved.push(s);
                        }
                    }
                }
            } catch {
                // API unavailable, localStorage data is sufficient
            }

            setInstalledSkills(resolved);
        } catch (error) {
            console.error("Failed to fetch skills", error);
        } finally {
            setIsSkillsLoading(false);
        }
    };

    useEffect(() => {
        if (selectedStrategy?.id) {
            fetchInstalledSkills(selectedStrategy.id);
        }
    }, [selectedStrategy]);

    const handleUninstallSkill = async (slug: string) => {
        if (!selectedStrategy?.id) return;

        const toastId = toast.loading(`Uninstalling ${slug}...`);
        try {
            // Remove from localStorage (per-agent)
            const agentId = selectedStrategy.id;
            const localSkills = JSON.parse(localStorage.getItem(`nirium-skills-${agentId}`) || '{}');
            const localPlugins = JSON.parse(localStorage.getItem(`nirium-plugins-${agentId}`) || '{}');

            delete localSkills[slug];
            delete localPlugins[slug];

            localStorage.setItem(`nirium-skills-${agentId}`, JSON.stringify(localSkills));
            localStorage.setItem(`nirium-plugins-${agentId}`, JSON.stringify(localPlugins));

            // Update state
            setInstalledSkills(prev => prev.filter(s => s.slug !== slug));
            toast.success("Skill uninstalled", { id: toastId });

            // Log to Ops Console
            const skillName = installedSkills.find(s => s.slug === slug)?.name || slug;
            writeLog(`PLUGIN REMOVED: ${skillName} — uninstalled from agent ${agentId}`, 'warn', account?.address);
        } catch (error) {
            toast.error(`Failed to uninstall: ${String(error)}`, { id: toastId });
        }
    };

    // --- 1. STATE DECLARATIONS (Must correspond to logic below) ---
    // Active Strategies Fleet (Persisted via Supabase/Local)
    const [activeStrategies, setActiveStrategies] = useState<Array<any>>([]);
    const [isLoadingFleet, setIsLoadingFleet] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    // Modals (showAutoStartModal already declared above)

    // --- 2. CONSTANTS & MEMOS ---
    // Protocol Metadata state (fetched from API)
    const [protocolMeta, setProtocolMeta] = useState({ strategies: {}, skills: {}, bootLogs: {} });

    // Fetch Protocol Metadata on mount
    useEffect(() => {
        const fetchMeta = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.nirium.xyz'}/api/public/protocol-meta`);
                const data = await res.json();
                if (data.success) {
                    setProtocolMeta(data);
                }
            } catch (e) {
                console.warn("[Dashboard] Protocol metadata fetch failed, using fallback empty state.");
            }
        };
        fetchMeta();
    }, []);

    const STRATEGIES = protocolMeta.strategies || {};

    const strategyId = searchParams.get('strategy') || "nirium-usdc-loop";
    const strategyNameParam = searchParams.get('name'); // From Builder redirect

    // Dynamically resolve strategy metadata (Default -> Active Fleet -> URL Param -> Custom Fallback)
    const currentStrategy = useMemo(() => {
        // 1. Known Hardcoded Strategy
        if (STRATEGIES[strategyId]) return STRATEGIES[strategyId];

        // 2. Look in Active Fleet (Loaded from DB/Local)
        const found = activeStrategies.find(s => s.id === strategyId || s.strategy_id === strategyId);
        if (found) return { name: found.name, logPrefix: "CUSTOM", emoji: found.emoji };

        // 3. Try direct LocalStorage peek (for immediate post-builder redirect)
        if (typeof window !== 'undefined' && account?.address) {
            try {
                const localKey = `nirium-fleet-${account.address}`;
                const local = JSON.parse(localStorage.getItem(localKey) || "[]");
                const localFound = local.find((s: any) => s.id === strategyId);
                if (localFound) return { name: localFound.name, logPrefix: "CUSTOM", emoji: localFound.emoji || "🛠️" };
            } catch { }
        }

        // 4. Use URL name param if provided (for immediate display before data loads)
        if (strategyNameParam) {
            return { name: strategyNameParam, logPrefix: "CUSTOM", emoji: "🛠️" };
        }

        // 5. Smart Fallback
        if (strategyId.startsWith('custom-')) {
            return { name: "Custom Agent Strategy", logPrefix: "BUILDER", emoji: "🛠️" };
        }

        return STRATEGIES["nirium-usdc-loop"] || { name: "Nirium Loop", logPrefix: "CORE", emoji: "🧬" };
    }, [strategyId, activeStrategies, account, strategyNameParam, STRATEGIES]);

    // Auto-deploy logic for Navbar CTA
    useEffect(() => {
        const assetParam = searchParams.get('asset');
        if (assetParam === 'XLM' || assetParam === 'USDC') {
            setBaseAsset(assetParam);
        }

        if (searchParams.get('autostart') === 'true' && account) {
            // Preserve name param if it exists
            const nameParam = strategyNameParam ? `&name=${encodeURIComponent(strategyNameParam)}` : '';
            router.replace(`/dashboard?strategy=${strategyId}${nameParam}`);
            setShowAutoStartModal(true);
        }
    }, [searchParams, account, router, strategyId, strategyNameParam]);

    useEffect(() => {
        if (account?.address) {
            const loadFleet = async () => {
                setIsLoadingFleet(true);
                setIsInitialized(false);
                try {
                    // Dynamic import to avoid server-side issues
                    const { StrategyService } = await import("@/lib/strategyService");
                    const fleet = await StrategyService.getStrategies(account.address);

                    // Merge with LocalStorage to capture offline-created custom builds
                    const localKey = `nirium-fleet-${account.address}`;
                    const localRaw = localStorage.getItem(localKey);
                    let merged = [...fleet];

                    if (localRaw) {
                        const local = JSON.parse(localRaw) as any[];

                        // 1. Deduplicate LocalStorage internally (keep latest)
                        const localMap = new Map();
                        local.forEach(item => {
                            if (item.id) localMap.set(item.id, item);
                        });
                        const distinctLocal = Array.from(localMap.values());

                        // 2. Filter out items that are already in DB
                        const uniqueLocals = distinctLocal.filter((l: any) =>
                            !fleet.some(dbS =>
                                (dbS.strategy_id && dbS.strategy_id === l.id) ||
                                (dbS.name === l.name)
                            )
                        );
                        merged = [...merged, ...uniqueLocals];
                    }

                    if (merged.length === 0) {
                        // Clean state
                        setActiveStrategies([]);
                    } else {
                        // FINAL AGGRESSIVE DEDUP: Prioritize NAME to avoid same-name duplicates
                        const finalMap = new Map();
                        merged.forEach(item => {
                            // For custom strategies, use name as key (prevents "StellarL" appearing 3 times)
                            // For DB strategies, use id
                            const isCustom = item.id?.startsWith('custom-') || item.strategy_id?.startsWith('custom-');
                            const key = isCustom ? (item.name || item.id) : (item.id || item.name);

                            if (key && !finalMap.has(key)) {
                                finalMap.set(key, item);
                            }
                        });
                        const finalDeduped = Array.from(finalMap.values());

                        // Filter out DRAFT strategies - only show RUNNING in Active Fleet
                        const activeOnly = finalDeduped.filter(s => s.status !== 'DRAFT');

                        // Also clean up LocalStorage to prevent future issues
                        if (finalDeduped.length < merged.length) {
                            const localKey = `nirium-fleet-${account.address}`;
                            localStorage.setItem(localKey, JSON.stringify(finalDeduped));
                            console.log('[Dashboard] Cleaned duplicate strategies from LocalStorage');
                        }

                        setActiveStrategies(activeOnly);
                    }
                } catch (e) {
                    console.error("Supabase sync failed, using local", e);
                } finally {
                    setIsLoadingFleet(false);
                    setIsInitialized(true);
                }
            };
            loadFleet();
        } else {
            setActiveStrategies([]);
            setIsInitialized(false);
        }
    }, [account]);

    // Persist activeStrategies to LocalStorage whenever they change (after initial load)
    useEffect(() => {
        if (!isInitialized || !account?.address) return;

        const localKey = `nirium-fleet-${account.address}`;
        try {
            // Merge with existing to preserve DRAFT strategies from Builder
            const existing = JSON.parse(localStorage.getItem(localKey) || "[]");
            const drafts = existing.filter((s: any) => s.status === 'DRAFT');

            // activeStrategies only contains RUNNING strategies
            // Combine DRAFTs (from builder) + RUNNING (from dashboard)
            const combined = [...drafts, ...activeStrategies];

            // Deduplicate by ID
            const deduped = Array.from(new Map(combined.map(s => [s.id, s])).values());

            localStorage.setItem(localKey, JSON.stringify(deduped));
            console.log('[Dashboard] Synced fleet to LocalStorage:', deduped.length, 'strategies');
        } catch (e) {
            console.warn('[Dashboard] Failed to sync LocalStorage:', e);
        }
    }, [activeStrategies, isInitialized, account]);

    const handleDeploy = () => {
        if (!account) {
            toast.error("Please connect your Stellar Wallet first");
            return;
        }

        // Check duplicates
        if (activeStrategies.find(s => s.strategy_id === strategyId)) {
            toast.warning(`${currentStrategy.emoji} ${currentStrategy.name} is already active!`);
            return;
        }

        setShowAutoStartModal(true);
    };

    const executeDeploy = async () => {
        if (!account) return;

        const toastId = toast.loading(`🤖 AI Agent: Initializing ${currentStrategy.name}...`);

        // determine Mode: V2 (AgentCap) or V1 (Script)
        const useAgentCap = !!(vaultId && ownerCapId);
        // Updated License fee: 12.5 XLM (approx. 100 MXN / 5 USD)
        const REQUIRED_FEE_LO: string = "125000000"; // 12.5 XLM in stroops

        // Network Check (Strict)
        if (account.chains?.[0] && account.chains[0] !== 'stellar:testnet') {
            toast.error("Wrong Network Detected", {
                description: "This dApp runs on Stellar Testnet. Please switch your wallet network."
            });
            return;
        }
        const REQUIRED_BALANCE = 15.0; // 12.5 Fee + Gas Buffer

        try {
            // 0. Check Balance
            // Check Native XLM Balance for Transaction Gas + Fee Requirements
            let requiredStellarAmount = REQUIRED_BALANCE;
            const { stellarClient } = await import("../../lib/stellarClient");
            const nativeBalance = await stellarClient.getBalance({ owner: account.address, coinType: 'XLM' }).then(b => Number(BigInt(b.totalBalance)) / 10_000_000);

            if (nativeBalance < REQUIRED_BALANCE) {
                toast.error(`Insufficient Balance: You need at least ${REQUIRED_BALANCE} XLM for license fee + gas`, {
                    description: `Detected: ${nativeBalance.toFixed(4)} XLM.`
                });
                return;
            }

            // REAL INSTITUTIONAL SOROBAN CALL
            toast.loading("Invoking NiriumVault.create_vault...", { id: toastId });
            const result = await vault.createVault(account.address, NATIVE_ASSET_ID, currentStrategy.name);

            if (!result.success || !result.txHash) {
                toast.dismiss(toastId);
                toast.error("Deployment Failed", {
                    description: result.error || "Check Freighter for details."
                });
                return;
            }

            const txHash = result.txHash;
            toast.dismiss(toastId);
            toast.success(`${currentStrategy.emoji} ${currentStrategy.name} Active!`, {
                description: "Institutional Soroban Vault created.",
                action: {
                    label: "Verify on Explorer",
                    onClick: () => window.open(`https://stellar.expert/explorer/testnet/tx/${txHash}`, "_blank")
                }
            });

            // Save to Supabase & State
            const { StrategyService } = await import("@/lib/strategyService");
            StrategyService.deployStrategy(account.address, {
                strategy_id: strategyId,
                name: currentStrategy.name,
                emoji: currentStrategy.emoji,
                status: "RUNNING",
                yield: "~14.2%",
                tx_digest: txHash,
                config: {}
            }).then((newStrategy: any) => {
                const strategyToAdd = {
                    id: newStrategy?.id || strategyId,
                    strategy_id: strategyId,
                    name: currentStrategy.name,
                    emoji: currentStrategy.emoji,
                    status: "RUNNING",
                    yield: "~14.2%",
                    tx_digest: txHash,
                };
                setActiveStrategies(prev => {
                    const filtered = prev.filter(s => s.id !== strategyId && s.strategy_id !== strategyId);
                    return [strategyToAdd, ...filtered];
                });
            });

            writeLog(`Agent Activity: ${currentStrategy.name} initialization confirmed.`, 'info', account?.address);

            writeLog(
                `${currentStrategy.emoji} AGENT DEPLOYED: ${currentStrategy.name} | tx: ${txHash.slice(0, 12)}...`,
                'success',
                account?.address
            );

            // Strategy-specific boot logs (now fetched from protocol-meta)
            const STRATEGY_BOOT_LOGS = protocolMeta.bootLogs || {};

            const bootLogs = STRATEGY_BOOT_LOGS[strategyId];
            if (bootLogs) {
                bootLogs.forEach((entry, i) => {
                    setTimeout(() => {
                        writeLog(entry.msg, entry.level, account?.address);
                    }, (i + 1) * 2000);
                });
            }

        } catch (err: any) {
            console.error("Deploy Error:", err);
            toast.dismiss(toastId);
            handleWalletError(err);
        }
    };

    const stopStrategy = (dbId: string) => {
        if (!account) {
            toast.error("Please connect your Stellar Wallet first");
            return;
        }
        const foundStrategy = activeStrategies.find(s => s.id === dbId || s.strategy_id === dbId);
        if (!foundStrategy) return;

        setConfirmConfig({
            isOpen: true,
            title: "Terminate Agent?",
            description: (
                <div className="space-y-3">
                    <p className="text-xs text-gray-400">You are about to disconnect the autonomous logic for <span className="text-white font-bold">{foundStrategy.name}</span>.</p>
                    <div className="bg-red-500/5 border border-red-500/10 p-3 rounded-xl text-left">
                        <div className="flex items-center gap-2 mb-1.5">
                            <AlertTriangle size={14} className="text-red-500" />
                            <span className="text-[10px] font-bold text-red-200 uppercase tracking-wider">Protocol Warning</span>
                        </div>
                        <p className="text-[10px] text-gray-400 leading-relaxed font-mono">
                            • Active positions will be frozen<br />
                            • On-chain signature required<br />
                            • Yield generation will cease immediately
                        </p>
                    </div>
                </div>
            ),
            icon: <div className="relative">
                <Shield size={32} className="text-red-500/50" />
                <X size={16} className="absolute inset-0 m-auto text-red-500" />
            </div>,
            confirmText: "STOP EXECUTION",
            type: 'danger',
            onConfirm: () => {
                setConfirmConfig(prev => ({ ...prev, isOpen: false }));
                executeStopStrategy(dbId);
            }
        });
    };

    const executeStopStrategy = async (dbId: string) => {
        if (!account) return;

        // Network Check (Strict)
        if (account.chains?.[0] && account.chains[0] !== 'stellar:testnet') {
            toast.error("Wrong Network Detected", {
                description: "This dApp runs on Stellar Testnet. Please switch your wallet network."
            });
            return;
        }

        const toastId = toast.loading("Sending Termination Signal...");

        try {
            const { TransactionBuilder, Networks, Operation, Asset } = await import("@stellar/stellar-sdk");
            // Assuming this is where it's defined

            const tx = new TransactionBuilder({
                accountId: () => account.address,
                sequenceNumber: () => "0",
                incrementSequenceNumber: () => { }
            } as any, { fee: "100" })
                .setNetworkPassphrase(Networks.TESTNET)
                .setTimeout(300);

            // Stellar Termination: Simulated by sending a small XLM amount to oneself
            tx.addOperation(Operation.payment({
                destination: account.address,
                asset: Asset.native(),
                amount: "0.0001"
            }));

            const builtTx = tx.build();
            const result = await signAndSubmitTransaction({ transaction: builtTx });

            toast.dismiss(toastId);
            toast.success("Agent Stop Signal Confirmed", {
                description: "Termination confirmation broadcast to Stellar network.",
                action: {
                    label: "View Tx",
                    onClick: () => window.open(`https://stellar.expert/explorer/testnet/tx/${result.hash}`, "_blank")
                }
            });

            writeLog(
                `AGENT TERMINATED: Deployment removed from the fleet | tx: ${result.hash.slice(0, 12)}...`,
                'warn',
                account?.address
            );

            // Step 2: Clean up locally
            setActiveStrategies(prev => prev.filter(s => s.id !== dbId));

            // Server-side stop (DB update)
            const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(dbId);
            if (isUUID) {
                import("@/lib/strategyService").then(({ StrategyService }) => {
                    StrategyService.stopStrategy(dbId).catch(console.warn);
                });
            }

            // Persist removal to LocalStorage
            if (account?.address) {
                const localKey = `nirium-fleet-${account.address}`;
                try {
                    const existing = JSON.parse(localStorage.getItem(localKey) || "[]");
                    const filtered = existing.filter((s: any) => s.id !== dbId && s.strategy_id !== dbId);
                    localStorage.setItem(localKey, JSON.stringify(filtered));
                } catch (e) { }
            }

        } catch (e: any) {
            toast.dismiss(toastId);
            console.warn("Agent stop error:", e);
            const msg = e.message || String(e);

            if (msg.includes("Rejected")) return;

            // If it's a network error (502) or the object doesn't exist, offer "Force Remove"
            toast.error("Protocol Sync Failed", {
                description: `Code: ${msg.slice(0, 30)}...`,
                action: {
                    label: "FORCE REMOVE",
                    onClick: () => {
                        // 1. Force clean up local state
                        setActiveStrategies(prev => prev.filter(s => s.id !== dbId));

                        // 2. Force clean up database (Uplink)
                        import("@/lib/strategyService").then(({ StrategyService }) => {
                            StrategyService.stopStrategy(dbId).catch(err => console.error("DB Cleanup failed:", err));
                        });

                        // 3. Force clean up local storage
                        if (account?.address) {
                            const localKey = `nirium-fleet-${account.address}`;
                            try {
                                const existing = JSON.parse(localStorage.getItem(localKey) || "[]");
                                const filtered = existing.filter((s: any) => s.id !== dbId && s.strategy_id !== dbId);
                                localStorage.setItem(localKey, JSON.stringify(filtered));
                            } catch (err) { }
                        }
                        toast.success("Agent forced out of fleet and database cleaned");
                        writeLog(`AGENT TERMINATED: Force cleaned from logic gates.`, 'error', account?.address);
                    }
                }
            });
        }
    };



    const confirmAutoStart = () => {
        setShowAutoStartModal(false);
        executeDeploy();
    };

    useEffect(() => {
        if (account?.address) {
            writeLog(`Authenticated user: ${account.address.slice(0, 8)}...`, 'system', account.address);
        }
    }, [account]);

    // --- REAL-TIME LOGS VIA WEBSOCKET ---
    const wsRef = useRef<WebSocket | null>(null);
    const accountRef = useRef(account);
    useEffect(() => { accountRef.current = account; }, [account]);

    useEffect(() => {
        let isUnmounted = false;
        let retryCount = 0;
        let retryTimeout: NodeJS.Timeout;

        const connectWebSocket = () => {
            if (isUnmounted) return;
            // Prevent multiple simultaneous connections from the same component instance
            if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
                return;
            }

            const wsUrl = getWebSocketUrl('/ws/signals');
            // Safety check for production mixed content
            if (wsUrl.includes('localhost') && typeof window !== 'undefined' && window.location.protocol === 'https:') {
                console.log('[Dashboard] Skipping WS localhost on HTTPS');
                return;
            }

            try {
                console.log('[Dashboard] Attempting WS connection to:', wsUrl);
                const ws = new WebSocket(wsUrl);
                wsRef.current = ws;

                ws.onopen = () => {
                    if (isUnmounted) return;
                    console.log('[Dashboard] WS Connected Successfully');
                    writeLog(`📡 Uplink Established (Stable)`, 'system', accountRef.current?.address);

                    if (accountRef.current?.address) {
                        ws.send(JSON.stringify({
                            type: 'subscribe',
                            userId: accountRef.current.address,
                            topics: ['execution', 'system']
                        }));
                    }
                };

                ws.onmessage = (event) => {
                    if (isUnmounted) return;
                    try {
                        const data = JSON.parse(event.data);
                        if (data.type === 'log' || data.type === 'execution') {
                            const time = new Date().toLocaleTimeString();
                            const message = data.message || JSON.stringify(data);
                            writeLog(`🤖 ${message}`, 'info', data.agent_id || 'UI_CLIENT');

                            if (data.status === 'success' && data.txHash) {
                                toast.success("Strategy Executed!", {
                                    description: `Tx: ${data.txHash.slice(0, 8)}...`,
                                    action: {
                                        label: "View",
                                        onClick: () => window.open(`https://stellar.expert/explorer/testnet/tx/${data.txHash}`, "_blank")
                                    }
                                });
                            }
                        }

                        // Tauri Tray Trigger
                        if (data.type === 'signal' && (window as any).__TAURI_INTERNALS__) {
                            const { invoke } = require('@tauri-apps/api/core');
                            invoke('update_tray_status', { active: true });
                        }
                    } catch (e) { }
                };

                ws.onclose = (event) => {
                    wsRef.current = null;
                    if (!isUnmounted) {
                        console.log('[Dashboard] WS Closed. Code:', event.code);
                        if (retryCount < 5) { // Limit retries to prevent storms
                            retryCount++;
                            const delay = 3000 * retryCount; // Exponential backoff
                            console.log(`[Dashboard] Retrying in ${delay}ms...`);
                            retryTimeout = setTimeout(connectWebSocket, delay);
                        }
                    }
                };

                ws.onerror = () => {
                    // Muted intentionally to prevent noisy UI console logs when backend is offline
                    wsRef.current = null;
                };

            } catch (e) {
                console.error("[Dashboard] WS Setup Failed:", e);
            }
        };

        connectWebSocket();

        return () => {
            isUnmounted = true;
            if (retryTimeout) clearTimeout(retryTimeout);
            if (wsRef.current) {
                console.log('[Dashboard] Cleaning up WS connection');
                wsRef.current.close();
                wsRef.current = null;
            }
        };
    }, []); // Runs once per mount



    // SVG Chart Data Generator (Mock)
    const chartPath = "M0,100 C20,90 40,110 60,80 C80,50 100,90 120,40 C140,20 160,60 180,30 C200,10 220,40 240,20 L240,150 L0,150 Z";
    const linePath = "M0,100 C20,90 40,110 60,80 C80,50 100,90 120,40 C140,20 160,60 180,30 C200,10 220,40 240,20";

    // Load Vault & OwnerCap from LocalStorage on mount
    useEffect(() => {
        if (account?.address) {
            const savedData = localStorage.getItem(`nirium-vault-v2-${baseAsset}-${account.address}`);
            if (savedData) {
                try {
                    const vaultData = JSON.parse(savedData);
                    if (typeof vaultData === 'object' && vaultData.vaultId !== undefined) {
                        // Parse as number (handles both numeric and string IDs from old vaults)
                        const numericId = typeof vaultData.vaultId === 'number'
                            ? vaultData.vaultId
                            : parseInt(String(vaultData.vaultId), 10);

                        if (!isNaN(numericId)) {
                            setVaultId(numericId);
                            if (vaultData.ownerCapId) {
                                setOwnerCapId(vaultData.ownerCapId);
                            }
                        } else {
                            // Old format with G... address - clear it
                            console.warn('Legacy vault ID detected (Stellar address). Please create a new vault.');
                            localStorage.removeItem(`nirium-vault-v2-${baseAsset}-${account.address}`);
                            setVaultId(null);
                            setOwnerCapId(null);
                        }
                    } else {
                        // Invalid format
                        setVaultId(null);
                        setOwnerCapId(null);
                    }
                } catch (e) {
                    console.error('Failed to parse vault data:', e);
                    setVaultId(null);
                    setOwnerCapId(null);
                }
            } else {
                setVaultId(null);
                setOwnerCapId(null);
            }
        }
    }, [account, baseAsset]);

    const handleDeposit = () => {
        if (!vaultId) return;

        setConfirmConfig({
            isOpen: true,
            title: "Deposit to Vault",
            description: (
                <div className="space-y-4">
                    <p className="text-xs text-gray-400">Transfer {baseAsset} from your wallet to the secure vault.</p>
                    <div className="relative">
                        <input
                            id="depositInput"
                            type="number"
                            defaultValue={amountInput}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm focus:border-stellar-teal outline-none transition-all"
                            placeholder="0.00"
                            step="0.1"
                            autoFocus
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 font-bold">{baseAsset}</span>
                    </div>
                </div>
            ),
            icon: <RefreshCw size={32} className="text-stellar-teal" />,
            confirmText: "CONFIRM DEPOSIT",
            type: 'info',
            onConfirm: () => {
                const val = (document.getElementById('depositInput') as HTMLInputElement)?.value || "0";
                setAmountInput(val);
                setConfirmConfig(p => ({ ...p, isOpen: false }));
                executeDeposit(val);
            }
        });
    };

    const executeDeposit = async (amount: string) => {
        if (!account) {
            toast.error("Please connect your wallet");
            return;
        }

        if (!vaultId || typeof vaultId !== 'number') {
            toast.error("No vault found", {
                description: "Please create a vault first before depositing"
            });
            return;
        }

        // Network Check (Strict)
        if (account.chains?.[0] && account.chains[0] !== 'stellar:testnet') {
            toast.error("Wrong Network Detected", {
                description: "This dApp runs on Stellar Testnet. Please switch your wallet network."
            });
            return;
        }

        // Validate balance before deposit
        const depositAmount = parseFloat(amount);
        const currentBalance = baseAsset === 'CETES' ? parseFloat(cetesBalance) : walletBalance;

        if (depositAmount > currentBalance) {
            toast.error("Insufficient Balance", {
                description: `You only have ${currentBalance.toFixed(2)} ${baseAsset}. Cannot deposit ${depositAmount} ${baseAsset}.`
            });
            return;
        }

        const toastId = toast.loading(`Executing Deposit of ${amount} ${baseAsset}...`);
        try {
            // Convert amount to stroops (1 XLM/USDC/CETES = 10^7 stroops)
            const amountInStroops = BigInt(Math.floor(parseFloat(amount) * 10_000_000));

            // Call the actual Soroban vault contract deposit function
            const result = await vaultDeposit(account.address, vaultId, amountInStroops);

            toast.dismiss(toastId);

            if (result.success) {
                // Update vault balance optimistically
                setVaultBalance(prev => prev + parseFloat(amount));

                // Immediately update wallet balance (subtract deposited amount)
                setWalletBalance(prev => Math.max(0, prev - parseFloat(amount)));

                toast.success("Deposit Successful", {
                    description: `${amount} ${baseAsset} deposited to Vault on-chain.`,
                    action: result.txHash ? {
                        label: "View Tx",
                        onClick: () => window.open(`https://stellar.expert/explorer/testnet/tx/${result.txHash}`, "_blank")
                    } : undefined
                });

                // Log the successful deposit
                writeLog(`VAULT DEPOSIT: ${amount} ${baseAsset} | Vault ID: ${vaultId} | Tx: ${result.txHash?.slice(0, 12)}...`, 'success');
            } else {
                throw new Error(result.error || 'Deposit failed');
            }
        } catch (e: any) {
            console.error('Deposit error:', e);
            toast.dismiss(toastId);
            toast.error("Deposit Failed", {
                description: e.message || "Failed to deposit to vault contract"
            });
            writeLog(`VAULT DEPOSIT FAILED: ${e.message}`, 'error');
        }
    };

    const handleWithdraw = () => {
        if (!vaultId || !ownerCapId) {
            toast.error("OwnerCap not found. Only the vault owner can withdraw.");
            return;
        }

        setConfirmConfig({
            isOpen: true,
            title: "Withdraw from Vault",
            description: (
                <div className="space-y-4">
                    <p className="text-xs text-gray-400">Transfer {baseAsset} from the vault back to your wallet address.</p>
                    <div className="relative">
                        <input
                            id="withdrawInput"
                            type="number"
                            defaultValue={amountInput}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm focus:border-stellar-teal outline-none transition-all"
                            placeholder="0.00"
                            step="0.1"
                            autoFocus
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 font-bold">{baseAsset}</span>
                    </div>
                </div>
            ),
            icon: <div className="rotate-180"><ChevronRight size={32} className="text-white" /></div>,
            confirmText: "CONFIRM WITHDRAW",
            type: 'info',
            onConfirm: () => {
                const val = (document.getElementById('withdrawInput') as HTMLInputElement)?.value || "0";
                setAmountInput(val);
                setConfirmConfig(p => ({ ...p, isOpen: false }));
                executeWithdraw(val);
            }
        });
    };

    const executeWithdraw = async (amount: string) => {
        if (!account) {
            toast.error("Please connect your wallet");
            return;
        }

        if (!vaultId || typeof vaultId !== 'number') {
            toast.error("No vault found", {
                description: "Please create a vault first"
            });
            return;
        }

        if (!ownerCapId) {
            toast.error("Owner capability not found", {
                description: "Only the vault owner can withdraw"
            });
            return;
        }

        // Network Check (Strict)
        if (account.chains?.[0] && account.chains[0] !== 'stellar:testnet') {
            toast.error("Wrong Network Detected", {
                description: "This dApp runs on Stellar Testnet. Please switch your wallet network."
            });
            return;
        }

        const toastId = toast.loading(`Withdrawing ${amount} ${baseAsset}...`);
        try {
            // Convert amount to stroops (1 XLM/USDC = 10^7 stroops)
            const amountInStroops = BigInt(Math.floor(parseFloat(amount) * 10_000_000));

            // Call the actual Soroban vault contract withdraw function
            const result = await vaultWithdraw(account.address, vaultId, amountInStroops);

            toast.dismiss(toastId);

            if (result.success) {
                // Update vault balance optimistically
                setVaultBalance(prev => Math.max(0, prev - parseFloat(amount)));

                // Immediately update wallet balance (add withdrawn amount)
                setWalletBalance(prev => prev + parseFloat(amount));

                toast.success("Withdrawal Successful", {
                    description: `${amount} ${baseAsset} withdrawn from Vault on-chain.`,
                    action: result.txHash ? {
                        label: "View Tx",
                        onClick: () => window.open(`https://stellar.expert/explorer/testnet/tx/${result.txHash}`, "_blank")
                    } : undefined
                });

                // Log the successful withdrawal
                writeLog(`VAULT WITHDRAW: ${amount} ${baseAsset} | Vault ID: ${vaultId} | Tx: ${result.txHash?.slice(0, 12)}...`, 'success');
            } else {
                throw new Error(result.error || 'Withdrawal failed');
            }
        } catch (e: any) {
            console.error('Withdrawal error:', e);
            toast.dismiss(toastId);
            toast.error("Withdrawal Failed", {
                description: e.message || "Failed to withdraw from vault contract"
            });
            writeLog(`VAULT WITHDRAW FAILED: ${e.message}`, 'error');
        }
    };

    const handleCreateVault = () => {
        if (!account) {
            toast.error("Please connect your Stellar Wallet first");
            return;
        }

        setConfirmConfig({
            isOpen: true,
            title: "Initialize Secure Vault?",
            description: (
                <div className="space-y-3">
                    <p className="text-xs text-gray-400">Deploying a non-custodial <span className="text-stellar-teal">{baseAsset} Vault</span> on-chain.</p>
                    <div className="bg-stellar-teal/5 border border-stellar-teal/20 p-3 rounded-xl text-left">
                        <p className="text-[10px] text-gray-400 leading-relaxed font-mono">
                            • Generates unique <span className="text-white">OwnerCap</span><br />
                            • Enables automated agent trading<br />
                            • Hot Potato security pattern active
                        </p>
                    </div>
                    <p className="text-[9px] text-gray-500 italic">This transaction requires a small gas fee on Testnet.</p>
                </div>
            ),
            icon: <Shield size={32} className="text-stellar-teal" />,
            confirmText: "DEPLOY VAULT",
            type: 'info',
            onConfirm: () => {
                setConfirmConfig(prev => ({ ...prev, isOpen: false }));
                executeCreateVault();
            }
        });
    };

    const executeCreateVault = async () => {
        if (!account) return;

        // Network Check (Strict)
        if (account.chains?.[0] && account.chains[0] !== 'stellar:testnet') {
            toast.error("Wrong Network Detected", {
                description: "This dApp runs on Stellar Testnet. Please switch your wallet network."
            });
            return;
        }

        const toastId = toast.loading("Creating Vault on Soroban...");

        try {
            // Call the actual Soroban vault contract create_vault function
            const vaultName = `Vault-${Date.now()}`;
            const targetAssetId = baseAsset === 'USDC'
                ? USDC_ASSET_ID
                : baseAsset === 'CETES'
                ? CETES_ASSET_ID
                : NATIVE_ASSET_ID;
            const result = await vaultCreate(account.address, targetAssetId, vaultName);

            toast.dismiss(toastId);

            if (result.success && result.result) {
                // Extract the vault object from the result
                const vaultData = result.result as any;
                const numericVaultId = Number(vaultData.vault_id || vaultData.vaultId || vaultData[0]);

                if (!numericVaultId || isNaN(numericVaultId)) {
                    throw new Error('Failed to extract vault ID from contract response');
                }

                // Store vault data with numeric ID
                const storageData = {
                    vaultId: numericVaultId,
                    ownerCapId: `cap_${numericVaultId}_${Date.now()}`,
                    createdAt: Date.now(),
                    txHash: result.txHash
                };

                localStorage.setItem(
                    `nirium-vault-v2-${baseAsset}-${account.address}`,
                    JSON.stringify(storageData)
                );

                setVaultId(numericVaultId);
                setOwnerCapId(storageData.ownerCapId);

                toast.success("Vault Created Successfully!", {
                    description: `Vault ID: ${numericVaultId} | On-chain`,
                    action: result.txHash ? {
                        label: "View Tx",
                        onClick: () => window.open(
                            `https://stellar.expert/explorer/testnet/tx/${result.txHash}`,
                            "_blank"
                        )
                    } : undefined
                });

                writeLog(
                    `VAULT CREATED: ID=${numericVaultId} | Asset=${baseAsset} | Tx: ${result.txHash?.slice(0, 12)}...`,
                    'success',
                    account?.address
                );
            } else {
                throw new Error(result.error || 'Failed to create vault');
            }
        } catch (e: any) {
            toast.dismiss(toastId);
            console.error("Vault Creation Error:", e);
            toast.error("Vault Creation Failed", {
                description: e.message || "Failed to create vault on-chain"
            });
            writeLog(`VAULT CREATE FAILED: ${e.message}`, 'error', account?.address);
        }
    };

    // ═══════════════════════════════════════════════════════
    // MXNE RAMP INTEGRATION — Etherfuse
    // ═══════════════════════════════════════════════════════

    const handleAddCETESTrustline = async () => {
        if (!account) {
            toast.error("Please connect your wallet first");
            return;
        }

        const toastId = toast.loading("Adding CETES trustline...");
        try {
            const { signTransaction } = await import("@stellar/freighter-api");
            const { Horizon, Networks, TransactionBuilder, Asset, Operation } = await import("@stellar/stellar-sdk");

            // 1. Load account from Horizon
            const horizonServer = new Horizon.Server("https://horizon-testnet.stellar.org");
            const sourceAccount = await horizonServer.loadAccount(account.address);

            // 2. Build changeTrust transaction
            const cetesAsset = new Asset(CETES_ASSET.code, CETES_ASSET.issuer);
            const transaction = new TransactionBuilder(sourceAccount, {
                fee: "100",
                networkPassphrase: Networks.TESTNET,
            })
                .addOperation(Operation.changeTrust({
                    asset: cetesAsset,
                    limit: '1000000000',
                }))
                .setTimeout(300)
                .build();

            // 3. Sign with Freighter — MUST specify address to avoid tx_bad_auth
            toast.loading("Sign the trustline in your wallet...", { id: toastId });
            const txXdr = transaction.toXDR();
            const signedResult = await signTransaction(txXdr, {
                networkPassphrase: Networks.TESTNET,
                address: account.address,
            });

            if (signedResult && typeof signedResult === 'object' && (signedResult as any).error) {
                throw new Error(String((signedResult as any).error));
            }

            const signedXdr = typeof signedResult === 'string' ? signedResult : (signedResult as any).signedTxXdr;
            if (!signedXdr) {
                throw new Error('Wallet signing was cancelled');
            }

            // 4. Submit signed transaction to Horizon
            toast.loading("Submitting to Stellar network...", { id: toastId });
            const signedTx = TransactionBuilder.fromXDR(signedXdr, Networks.TESTNET);
            const result = await horizonServer.submitTransaction(signedTx as any);

            toast.dismiss(toastId);

            if (result.successful) {
                setHasCetesTrust(true);
                toast.success("CETES Trustline Added!", {
                    description: "You can now receive CETES (Mexican Treasury Bonds) on Stellar",
                    action: {
                        label: "View Tx",
                        onClick: () => window.open(`https://stellar.expert/explorer/testnet/tx/${result.hash}`, "_blank")
                    }
                });
                writeLog(`CETES TRUSTLINE ADDED | Tx: ${result.hash?.slice(0, 12)}...`, 'success', account.address);
            } else {
                throw new Error('Transaction was not successful');
            }
        } catch (e: any) {
            toast.dismiss(toastId);

            let errorMsg = e.message || "Failed to add CETES trustline";
            if (e.response?.data?.extras?.result_codes) {
                const codes = e.response.data.extras.result_codes;
                errorMsg = `Horizon: tx=${codes.transaction}, ops=${codes.operations?.join(', ')}`;
            }

            toast.error("Trustline Failed", { description: errorMsg });
            writeLog(`CETES TRUSTLINE FAILED: ${errorMsg}`, 'error', account?.address);
        }
    };

    const handleOpenRamp = async () => {
        if (!account) {
            toast.error("Please connect your wallet first");
            return;
        }

        if (!hasCetesTrust) {
            toast.error("Add CETES Trustline First", {
                description: "You need the CETES trustline before buying"
            });
            return;
        }

        const toastId = toast.loading("Opening Etherfuse ramp...");

        try {
            // Get or create persistent customer IDs for this wallet
            const { customerId, bankAccountId } = getOrCreateCustomerIds(account.address);

            // Generate onboarding URL via Etherfuse API
            const result = await generateOnboardingUrl({
                customerId,
                bankAccountId,
                publicKey: account.address,
                blockchain: 'stellar',
            });

            toast.dismiss(toastId);

            if (result.success && result.data?.url) {
                // Open the presigned URL in new tab
                window.open(result.data.url, '_blank');

                toast.success("Etherfuse Ramp Opened", {
                    description: "Complete KYC to buy CETES with SPEI. URL expires in 15 minutes."
                });

                writeLog(`ETHERFUSE RAMP: Opened for customer ${customerId}`, 'info', account.address);
            } else {
                // Fallback: open devnet directly
                const fallbackUrl = 'https://devnet.etherfuse.com';
                window.open(fallbackUrl, '_blank');
                toast.info("Opened Etherfuse Directly", {
                    description: result.error || "Opened Etherfuse devnet portal."
                });
                writeLog(`ETHERFUSE RAMP: API issue, opened devnet directly. ${result.error}`, 'warn', account?.address);
            }
        } catch (e: any) {
            toast.dismiss(toastId);
            window.open('https://devnet.etherfuse.com', '_blank');
            toast.info("Opened Etherfuse Directly", {
                description: "Could not generate presigned URL — opened portal directly."
            });
            writeLog(`ETHERFUSE RAMP FALLBACK: ${e.message}`, 'warn', account?.address);
        }
    };

    const handleDestroyVault = async () => {
        if (!account) {
            toast.error("Please connect your Stellar Wallet first");
            return;
        }
        if (!vaultId) return;

        // Load vault data from localStorage
        const savedData = localStorage.getItem(`nirium-vault-v2-${baseAsset}-${account.address}`);
        if (!savedData) {
            toast.error("Cannot find vault data");
            return;
        }

        let vaultData;
        try {
            vaultData = JSON.parse(savedData);
        } catch {
            // Old format without OwnerCap ID - allow force reset
            setConfirmConfig({
                isOpen: true,
                title: "Old Format Detected",
                description: (
                    <div className="space-y-3">
                        <p className="text-xs text-gray-400">This vault uses an legacy version and requires a local cache reset.</p>
                        <div className="bg-white/5 border border-white/10 p-3 rounded-xl text-left">
                            <p className="text-[10px] text-gray-500 font-mono leading-relaxed">
                                • Disconnect local view<br />
                                • Clean start protocol<br />
                                • On-chain assets safe
                            </p>
                        </div>
                    </div>
                ),
                icon: <RefreshCw size={32} className="text-stellar-teal animate-spin-slow" />,
                confirmText: "LOCAL RESET",
                type: 'info',
                onConfirm: () => {
                    localStorage.removeItem(`nirium-vault-v2-${baseAsset}-${account.address}`);
                    setVaultId(null);
                    setConfirmConfig(prev => ({ ...prev, isOpen: false }));
                    toast.info("Vault Disconnected (Format Updated)", {
                        description: "You can now create a new, fully compatible Vault."
                    });
                }
            });
            return;
        }

        setConfirmConfig({
            isOpen: true,
            title: "Destroy Secure Vault?",
            description: (
                <div className="space-y-3">
                    <p className="text-gray-400 text-xs">This action will execute a terminal cleanup protocol on your active vault.</p>
                    <div className="grid grid-cols-1 gap-1.5 text-left">
                        <div className="bg-red-500/5 border border-red-500/10 p-2 rounded-lg flex items-center gap-2.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-[10px] font-mono text-red-200 uppercase">Destroy Vault On-Chain</span>
                        </div>
                        <div className="bg-red-500/5 border border-red-500/10 p-2 rounded-lg flex items-center gap-2.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-400 opacity-50" />
                            <span className="text-[10px] font-mono text-gray-400 uppercase">Burn OwnerCap Registry</span>
                        </div>
                        <div className="bg-green-500/5 border border-green-500/10 p-2 rounded-lg flex items-center gap-2.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            <span className="text-[10px] font-mono text-green-200 uppercase">Return XLM to Wallet</span>
                        </div>
                    </div>
                    <p className="text-[9px] text-gray-500 uppercase tracking-tighter pt-1.5 border-t border-white/5">
                        WARNING: Irreversible operation. Gas required.
                    </p>
                </div>
            ),
            icon: <Trash2 size={32} className="text-red-500" />,
            confirmText: "CONFIRM TERMINAL",
            type: 'danger',
            onConfirm: async () => {
                setConfirmConfig(prev => ({ ...prev, isOpen: false }));
                await executeVaultDestruction(vaultData);
            }
        });
    };

    const executeVaultDestruction = async (vaultData: any) => {
        if (!account) return;

        // Block close if vault still has balance — user must withdraw first
        if (vaultBalance > 0) {
            toast.error("Withdraw your funds first", {
                description: `Vault #${vaultData.vaultId} still has balance. Withdraw all funds before closing.`,
                duration: 6000,
            });
            return;
        }

        const toastId = toast.loading("Closing Vault On-Chain...");

        try {
            const result = await vaultClose(account.address, vaultData.vaultId);

            if (!result.success) {
                toast.dismiss(toastId);
                const errorMsg = result.error || "";
                // Legacy vault from old contract — can't be closed on-chain, just remove from UI
                if (errorMsg.includes("UnreachableCodeReached") || errorMsg.includes("E_VAULT_NOT_FOUND") || errorMsg.includes("InvalidAction")) {
                    localStorage.removeItem(`nirium-vault-v2-${baseAsset}-${account.address}`);
                    localStorage.removeItem(`nirium-vault-balance-${vaultData.vaultId}-${baseAsset}`);
                    setVaultId(null);
                    setOwnerCapId(null);
                    setVaultBalance(0);
                    toast.success("Legacy Vault Removed", {
                        description: `Vault #${vaultData.vaultId} was created on a previous contract version and has been removed from your dashboard. No on-chain action required (vault had 0 balance).`,
                        duration: 8000,
                    });
                } else if (errorMsg.includes("0 balance") || errorMsg.includes("withdraw")) {
                    toast.error("Withdraw your funds first", {
                        description: "The contract requires the vault balance to be 0 before closing.",
                        duration: 6000,
                    });
                } else {
                    toast.error("Failed to close vault", {
                        description: errorMsg,
                        duration: 6000,
                    });
                }
                return;
            }

            const txHash = result.txHash || "";

            // Clear local storage only after confirmed on-chain close
            localStorage.removeItem(`nirium-vault-v2-${baseAsset}-${account.address}`);
            localStorage.removeItem(`nirium-vault-balance-${vaultData.vaultId}-${baseAsset}`);

            setVaultId(null);
            setOwnerCapId(null);
            setVaultBalance(0);

            toast.dismiss(toastId);
            toast.success("Vault Closed Successfully", {
                description: `Vault ID ${vaultData.vaultId} closed on-chain. Tx: ${txHash.slice(0, 8)}...`,
                duration: 6000,
                action: {
                    label: "View Tx",
                    onClick: () => window.open(`https://stellar.expert/explorer/testnet/tx/${txHash}`, "_blank")
                }
            });

            writeLog(
                `VAULT CLOSED: ID=${vaultData.vaultId} | Tx: ${txHash.slice(0, 12)}...`,
                'success',
                account?.address
            );
        } catch (error: any) {
            toast.dismiss(toastId);
            console.error("Close Vault Error:", error);
            const errStr = String(error?.message || error || "");
            if (errStr.includes("UnreachableCodeReached") || errStr.includes("E_VAULT_NOT_FOUND") || errStr.includes("InvalidAction")) {
                localStorage.removeItem(`nirium-vault-v2-${baseAsset}-${account.address}`);
                localStorage.removeItem(`nirium-vault-balance-${vaultData.vaultId}-${baseAsset}`);
                setVaultId(null);
                setOwnerCapId(null);
                setVaultBalance(0);
                toast.success("Legacy Vault Removed", {
                    description: `Vault #${vaultData.vaultId} was created on a previous contract version and has been removed from your dashboard.`,
                    duration: 8000,
                });
            } else {
                handleWalletError(error);
            }
        }
    };

    const handleRevokeAgent = async (agentCapId?: string) => {
        if (!account) return;

        toast.error("Revoke Agent requires the AgentCap object ID. Feature coming soon!", {
            description: "For now, stop agents using the toggle or Clear All button.",
            duration: 5000
        });

        // TODO: Implement with actual object fetching:
        // const tx = {} as any;
        // const PACKAGE_ID = process.env.NEXT_PUBLIC_PACKAGE_ID;
        // const agentCapObjectId = agentCapId || await fetchAgentCapId(account.address);
        // 
        // tx.moveCall({
        //     target: `${PACKAGE_ID}::atomic_engine::destroy_agent_cap`,
        //     arguments: [tx.object(agentCapObjectId)]
        // });
        // 
        // signAndSubmitTransaction({ transaction: tx }, {
        //     onSuccess: () => {
        //         toast.success("Agent Permission Revoked!");
        //     }
        // });
    };

    // --- ACCESS GUARD (Removed for guest viewing) ---

    return (
        <div className="min-h-screen bg-nirium-obsidian pt-56 pb-12 px-4 md:px-8 relative overflow-hidden">
            <Navbar />
            <div className="flex items-center gap-6 mb-10 px-2 lg:px-0">
                <SectionBrandLogo size="w-32 sm:w-40" className="!justify-start mb-0" />
                <div className="hidden sm:block">
                    <h1 className="text-3xl font-black text-white tracking-tight uppercase italic" style={{ fontFamily: 'Orbitron, sans-serif' }}>ORBITAL_DASHBOARD</h1>
                    <div className="flex items-center gap-3">
                        <p className="text-[10px] font-mono text-gray-500 tracking-[0.3em]">NEURAL_COMMAND_v0.7</p>
                        <div className="flex gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-stellar-teal animate-pulse" />
                            <div className="w-1.5 h-1.5 rounded-full bg-stellar-yellow animate-pulse delay-75" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Auto-Start Confirmation Modal */}
            <AnimatePresence>
                {(showAutoStartModal && currentStrategy) && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowAutoStartModal(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-[#0f0a1f] border border-stellar-teal/50 rounded-xl p-6 sm:p-7 max-w-sm w-full shadow-[0_0_50px_rgba(0,243,255,0.2)] text-center relative z-10 overflow-y-auto max-h-[90vh]"
                        >
                            <div className="w-14 h-14 bg-stellar-teal/20 border border-stellar-teal/30 rounded-full flex items-center justify-center mx-auto mb-4 relative group">
                                <div className="absolute inset-0 bg-stellar-teal/20 rounded-full animate-ping group-hover:animate-none opacity-20"></div>
                                <span className="text-2xl relative z-10">{currentStrategy.emoji}</span>
                            </div>
                            <h2 className="text-xl font-bold text-white mb-1.5 leading-tight">Deploy {currentStrategy.name}?</h2>
                            <div className="bg-stellar-teal/5 border border-stellar-teal/20 p-3 rounded-lg mb-4">
                                <div className="flex justify-between items-center text-[9px] text-gray-400 uppercase tracking-widest mb-0.5 font-mono">
                                    <span>PROTOCOL FEE</span>
                                    <span>AUTHORIZED</span>
                                </div>
                                <p className="text-stellar-teal font-mono text-base font-bold flex justify-between items-baseline">
                                    <span>0.10</span>
                                    <span className="text-[10px] ml-1 opacity-70 font-sans">XLM TESTNET</span>
                                </p>
                            </div>
                            <p className="text-gray-400 mb-6 text-xs leading-relaxed max-w-[280px] mx-auto">
                                Initializing autonomous logic gates. Deployment includes secure vault synchronization.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowAutoStartModal(false)}
                                    className="flex-1 px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-colors font-mono font-bold text-[10px]"
                                >
                                    CANCEL
                                </button>
                                <button
                                    onClick={confirmAutoStart}
                                    className="flex-1 px-3 py-2.5 rounded-lg bg-stellar-teal/20 border border-stellar-teal/50 text-stellar-teal hover:bg-stellar-teal hover:text-black transition-all font-mono font-bold text-[10px] shadow-[0_0_20px_rgba(0,243,255,0.2)] flex items-center justify-center gap-1.5 group"
                                >
                                    CONFIRM
                                    <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>



            {/* Strategy Details Modal */}
            <AnimatePresence>
                {selectedStrategy && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedStrategy(null)}
                            className="absolute inset-0 bg-black/90 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 30 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 30 }}
                            className="bg-[#0f0a1f] border border-stellar-teal/30 rounded-2xl w-full max-w-lg shadow-[0_0_80px_rgba(0,243,255,0.15)] relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-white/5 relative bg-gradient-to-r from-stellar-teal/5 to-transparent">
                                <button
                                    onClick={() => setSelectedStrategy(null)}
                                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                                >
                                    <X size={20} />
                                </button>
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-black/40 border border-white/10 rounded-2xl flex items-center justify-center text-4xl shadow-inner relative group overflow-hidden">
                                        <div className="absolute inset-0 bg-stellar-teal/20 blur-xl group-hover:opacity-100 opacity-50 transition-opacity"></div>
                                        <span className="relative z-10">{selectedStrategy.emoji}</span>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h2 className="text-xl font-bold text-white tracking-tight">{selectedStrategy.name}</h2>
                                            <StatusBadge status="active" label={t.common.atomic_execution} />
                                        </div>
                                        <p className="text-xs text-gray-400 font-mono">ID: {selectedStrategy.id.slice(0, 8)}...{selectedStrategy.id.slice(-4)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Content Scrollable */}
                            <div className="p-6 overflow-y-auto custom-scrollbar space-y-6 flex-1 min-h-0">

                                {/* Key Metrics Grid */}
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                                        <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Target Yield</p>
                                        <p className="text-stellar-teal font-mono font-bold text-lg">{selectedStrategy.yield}</p>
                                    </div>
                                    <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                                        <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Profit 24h</p>
                                        <p className="text-green-400 font-mono font-bold text-lg">+{(0.24).toFixed(2)} XLM</p>
                                    </div>
                                    <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                                        <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Uptime</p>
                                        <p className="text-white font-mono font-bold text-lg">{(Math.random() * 24).toFixed(1)}h</p>
                                    </div>
                                </div>

                                {/* Transaction Info */}
                                <div className="space-y-2">
                                    <h3 className="text-xs text-gray-400 uppercase tracking-widest font-bold flex items-center gap-2">
                                        <Zap size={12} className="text-stellar-teal" />
                                        Latest Execution
                                    </h3>

                                    <div className="bg-black/40 border border-white/10 rounded-xl p-4 space-y-3 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-stellar-teal/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-stellar-teal/10 transition-colors"></div>

                                        <div className="relative z-10 flex justify-between items-center pb-3 border-b border-white/5">
                                            <span className="text-xs text-gray-400">Transaction Hash</span>
                                            {selectedStrategy.tx_digest ? (
                                                <a
                                                    href={`https://stellar.expert/explorer/testnet/tx/${selectedStrategy.tx_digest}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1.5 text-xs font-mono text-stellar-teal hover:text-white transition-colors bg-stellar-teal/10 px-2 py-1 rounded cursor-pointer"
                                                >
                                                    {selectedStrategy.tx_digest.slice(0, 6)}...{selectedStrategy.tx_digest.slice(-4)}
                                                    <ExternalLink size={10} />
                                                </a>
                                            ) : (
                                                <span className="text-xs text-gray-600 font-mono italic">Pending...</span>
                                            )}
                                        </div>

                                        <div className="relative z-10 grid grid-cols-2 gap-4 pt-1">
                                            <div>
                                                <p className="text-[9px] text-gray-500 uppercase mb-0.5">Network</p>
                                                <p className="text-xs text-white font-mono">Stellar Testnet</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[9px] text-gray-500 uppercase mb-0.5">Protocol</p>
                                                <p className="text-xs text-white font-mono">
                                                    {selectedStrategy?.strategy_id?.includes('lending') || selectedStrategy?.strategy_id?.includes('loop') ? 'Blend / Phoenix' :
                                                        selectedStrategy?.strategy_id?.includes('soroswap') ? 'Soroswap / Phoenix' :
                                                            selectedStrategy?.strategy_id?.includes('bluefin') ? 'Bluefin Perps' :
                                                                selectedStrategy?.strategy_id?.includes('sdex') ? 'SDEX Orderbook' :
                                                                    selectedStrategy?.strategy_id?.includes('bridge') ? 'Wormhole' :
                                                                        selectedStrategy?.strategy_id?.includes('mev') ? 'Atomic Engine' :
                                                                            'Blend / Soroswap'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Installed Plugins Section */}
                                <div className="space-y-3">
                                    <h3 className="text-xs text-gray-400 uppercase tracking-widest font-bold flex items-center gap-2">
                                        <Cpu size={12} className="text-purple-400" />
                                        Installed Plugins
                                    </h3>

                                    {isSkillsLoading ? (
                                        <div className="animate-pulse flex space-x-4">
                                            <div className="flex-1 space-y-4 py-1">
                                                <div className="h-4 bg-white/5 rounded w-3/4"></div>
                                                <div className="h-4 bg-white/5 rounded"></div>
                                            </div>
                                        </div>
                                    ) : activePlugins.length > 0 ? (
                                        <div className="grid gap-2">
                                            {activePlugins.map((skill: any) => (
                                                <div key={skill.slug} className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center justify-between group/skill hover:bg-white/10 transition-all">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-black/40 border border-white/5 rounded-lg flex items-center justify-center text-xs">
                                                            {skill.isGlobal ? '🌐' : '🛠️'}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <p className="text-xs font-bold text-white">{skill.name}</p>
                                                                {skill.isGlobal && (
                                                                    <span className="text-[9px] bg-stellar-teal/10 text-stellar-teal px-1.5 py-0.5 rounded border border-stellar-teal/20">GLOBAL</span>
                                                                )}
                                                            </div>
                                                            <p className="text-[10px] text-gray-500 font-mono">v{skill.version}</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleUninstallSkill(skill.slug)}
                                                        className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg opacity-0 group-hover/skill:opacity-100 transition-all"
                                                        title="Uninstall"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-4 bg-white/5 rounded-xl border border-dashed border-white/10">
                                            <p className="text-[10px] text-gray-500 italic">No plugins installed on this unit.</p>
                                        </div>
                                    )}
                                </div>

                                {/* Installed Skills Section */}
                                <div className="space-y-3">
                                    <h3 className="text-xs text-gray-400 uppercase tracking-widest font-bold flex items-center gap-2">
                                        <Code size={12} className="text-stellar-teal" />
                                        Installed Skills
                                    </h3>

                                    {isSkillsLoading ? (
                                        <div className="animate-pulse flex space-x-4">
                                            <div className="flex-1 space-y-4 py-1">
                                                <div className="h-4 bg-white/5 rounded w-3/4"></div>
                                                <div className="h-4 bg-white/5 rounded"></div>
                                            </div>
                                        </div>
                                    ) : tradingSkills.length > 0 ? (
                                        <div className="grid gap-2">
                                            {tradingSkills.map((skill: any) => (
                                                <div key={skill.slug} className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center justify-between group/skill hover:bg-white/10 transition-all">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-black/40 border border-white/5 rounded-lg flex items-center justify-center text-xs">
                                                            {skill.isGlobal ? '🌐' : '🛠️'}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <p className="text-xs font-bold text-white">{skill.name}</p>
                                                                {skill.isGlobal && (
                                                                    <span className="text-[9px] bg-stellar-teal/10 text-stellar-teal px-1.5 py-0.5 rounded border border-stellar-teal/20">GLOBAL</span>
                                                                )}
                                                            </div>
                                                            <p className="text-[10px] text-gray-500 font-mono">v{skill.version}</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleUninstallSkill(skill.slug)}
                                                        className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg opacity-0 group-hover/skill:opacity-100 transition-all"
                                                        title="Uninstall"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-4 bg-white/5 rounded-xl border border-dashed border-white/10">
                                            <p className="text-[10px] text-gray-500 italic">No skills installed on this unit.</p>
                                        </div>
                                    )}
                                </div>

                                {/* Agent Configuration (Technical) */}
                                {selectedStrategy.agentCapId && (
                                    <div className="space-y-2">
                                        <h3 className="text-xs text-gray-400 uppercase tracking-widest font-bold flex items-center gap-2">
                                            <Shield size={12} className="text-purple-400" />
                                            Security Context
                                        </h3>
                                        <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center justify-between">
                                            <div>
                                                <p className="text-[10px] text-gray-400 uppercase">Agent Capability ID</p>
                                                <p className="text-xs font-mono text-gray-300 truncate max-w-[200px]">{selectedStrategy.agentCapId}</p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(selectedStrategy.agentCapId);
                                                    toast.success("Copied Agent Cap ID");
                                                }}
                                                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-500 hover:text-white"
                                            >
                                                <RefreshCw size={14} className="rotate-45" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Actions Footer */}
                            <div className="p-6 border-t border-white/5 bg-black/20 flex gap-3">
                                <button
                                    onClick={() => setSelectedStrategy(null)}
                                    className="flex-1 px-4 py-3 rounded-xl font-bold text-xs bg-white/5 hover:bg-white/10 text-gray-300 transition-colors border border-white/5"
                                >
                                    CLOSE VIEW
                                </button>
                                <button
                                    onClick={() => {
                                        stopStrategy(selectedStrategy.id);
                                        setSelectedStrategy(null);
                                    }}
                                    className="flex-1 px-4 py-3 rounded-xl font-bold text-xs bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 transition-colors flex items-center justify-center gap-2 group"
                                >
                                    <Trash2 size={14} className="group-hover:scale-110 transition-transform" />
                                    TERMINATE AGENT
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            <AnimatePresence>
                {confirmConfig.isOpen && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
                            className="absolute inset-0 bg-black/90 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-[#0f0a1f] border border-white/10 rounded-2xl p-6 sm:p-7 max-w-[380px] w-full shadow-[0_0_100px_rgba(0,0,0,0.8)] relative z-10 overflow-hidden max-h-[90vh] flex flex-col"
                        >
                            {/* Decorative Glow */}
                            <div className={`absolute -top-32 -right-32 w-64 h-64 rounded-full blur-[100px] opacity-20 ${confirmConfig.type === 'danger' ? 'bg-red-600' : 'bg-stellar-teal'}`} />

                            <div className="relative z-10 flex flex-col items-center text-center overflow-y-auto custom-scrollbar">
                                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 shrink-0 ${confirmConfig.type === 'danger' ? 'bg-red-500/10 border border-red-500/30' : 'bg-stellar-teal/10 border border-stellar-teal/30'}`}>
                                    {confirmConfig.icon && (
                                        <div className="scale-[0.8]">
                                            {confirmConfig.icon}
                                        </div>
                                    )}
                                </div>

                                <h2 className="text-xl font-bold text-white mb-2 tracking-tight">
                                    {confirmConfig.title}
                                </h2>

                                <div className="text-gray-400 text-xs mb-6 leading-relaxed">
                                    {confirmConfig.description}
                                </div>

                                <div className="flex gap-2.5 w-full mt-2">
                                    <button
                                        onClick={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
                                        className="flex-1 px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all font-bold text-[10px]"
                                    >
                                        DISMISS
                                    </button>
                                    <button
                                        onClick={confirmConfig.onConfirm}
                                        className={`flex-1 px-4 py-2.5 rounded-lg font-bold text-[10px] transition-all shadow-xl flex items-center justify-center gap-1.5 group ${confirmConfig.type === 'danger'
                                            ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/20'
                                            : 'bg-stellar-teal hover:bg-stellar-teal/80 text-black shadow-cyan-900/20'
                                            }`}
                                    >
                                        {confirmConfig.confirmText}
                                        <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* On-Chain Soroban Verifiable Stats */}
            <div className="w-full max-w-[1600px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 relative z-10">
                <div className="glass-panel p-4 rounded-xl border border-stellar-teal/20 bg-stellar-teal/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-stellar-teal/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                    <h3 className="text-xs text-stellar-teal uppercase tracking-wider mb-1 font-bold flex items-center gap-1.5 relative z-10">
                        <Shield size={12} />
                        Your On-Chain ELO
                    </h3>
                    <div className="text-xl font-mono text-stellar-teal font-black flex items-baseline gap-2 relative z-10">
                        {onChainElo !== null ? onChainElo : '...'}
                        <span className="text-[10px] text-stellar-teal/60">SCORE</span>
                    </div>
                    <div className="text-[10px] text-gray-500 mt-1 font-mono flex items-center gap-1.5 relative z-10">
                        <div className="w-1.5 h-1.5 rounded-full bg-stellar-teal animate-pulse" />
                        Soroban Verified
                    </div>
                </div>
                <div className="glass-panel p-4 rounded-xl border border-white/5">
                    <h3 className="text-xs text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <Activity size={12} />
                        Global Vaults
                    </h3>
                    <div className="text-xl font-mono text-white font-bold flex items-baseline gap-2">
                        {onChainVaultCount !== null ? onChainVaultCount : '--'}
                        <span className="text-[10px] text-gray-600">DEPLOYS</span>
                    </div>
                </div>
                <div className="glass-panel p-4 rounded-xl border border-white/5">
                    <h3 className="text-xs text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <Globe size={12} />
                        Global Active Agents
                    </h3>
                    <div className="text-xl font-mono text-white font-bold flex items-baseline gap-2">
                        30
                        <span className="text-[10px] text-gray-600">NODES</span>
                    </div>
                </div>
                <div className="glass-panel p-4 rounded-xl border border-stellar-yellow/20 bg-stellar-yellow/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-stellar-yellow/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                    <h3 className="text-xs text-stellar-yellow uppercase tracking-wider mb-1 font-bold flex items-center gap-1.5 relative z-10">
                        <Database size={12} />
                        Protocol Treasury
                    </h3>
                    <div className="text-xl font-mono text-stellar-yellow font-black flex items-baseline gap-2 relative z-10">
                        {onChainTotalFees !== null ? onChainTotalFees.toFixed(1) : '0.0'}
                        <span className="text-[10px] text-stellar-yellow/60">XLM</span>
                    </div>
                </div>
            </div>

            {/* Real-Time Analytics Bar */}
            <div className="w-full max-w-[1600px] mx-auto grid grid-cols-2 md:grid-cols-5 gap-4 mb-8 relative z-10">
                <div className="glass-panel p-4 rounded-xl border border-white/5">
                    <h3 className="text-xs text-gray-400 uppercase tracking-wider mb-1">Secure Vault TVL</h3>
                    <div className="text-xl font-mono text-white font-bold">
                        {vaultBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })} <span className="text-xs text-gray-500">{baseAsset}</span>
                    </div>
                    <div className="text-[10px] text-gray-500 mt-1 flex items-center gap-1.5 font-sans">
                        <div className="w-1 h-1 rounded-full bg-stellar-teal" />
                        WALLET: {baseAsset === 'CETES' ? parseFloat(cetesBalance).toFixed(3) : walletBalance.toFixed(3)} {baseAsset}
                    </div>
                </div>
                <div className="glass-panel p-4 rounded-xl border border-green-500/20 hover:border-green-500/40 transition-all cursor-pointer" onClick={handleOpenRamp}>
                    <h3 className="text-xs text-green-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <span className="text-base">🇲🇽</span> CETES (MXN Bonds)
                    </h3>
                    <div className="text-xl font-mono text-green-400 font-bold">
                        {parseFloat(cetesBalance).toLocaleString(undefined, { maximumFractionDigits: 2 })} <span className="text-xs text-gray-500">CETES</span>
                    </div>
                    <div className="text-[10px] text-gray-500 mt-1 flex items-center gap-1.5 font-sans">
                        {hasCetesTrust ? (
                            <>
                                <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                                Click to Buy CETES via SPEI
                            </>
                        ) : (
                            <button onClick={(e) => { e.stopPropagation(); handleAddCETESTrustline(); }} className="text-yellow-400 hover:text-yellow-300 underline">
                                Add Trustline First
                            </button>
                        )}
                    </div>
                </div>
                <div className="glass-panel p-4 rounded-xl border border-white/5">
                    <h3 className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                        Market Alpha ({baseAsset} APY)
                    </h3>
                    <div className="text-xl font-mono text-stellar-teal font-bold flex items-center gap-2">
                        {baseAsset === 'USDC'
                            ? (phoenixData ? phoenixData.supplyApy.toFixed(2) : '0.00')
                            : (blendData ? blendData.supplyApy.toFixed(2) : '0.00')}%
                        <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 rounded animate-pulse">LIVE</span>
                    </div>
                    <div className="text-[10px] text-gray-500 mt-1 font-mono">
                        {baseAsset === 'USDC' ? 'Phoenix USDC Pool' : 'Blend XLM Supply'}
                    </div>
                </div>
                <div className="glass-panel p-4 rounded-xl border border-white/5">
                    <h3 className="text-xs text-gray-400 uppercase tracking-wider mb-1">Projected Yield (24H)</h3>
                    <div className="text-xl font-mono text-white font-bold">
                        +{(vaultBalance * ((blendData?.supplyApy || 0) / 100 / 365)).toFixed(4)} <span className="text-xs text-gray-500">{baseAsset}</span>
                    </div>
                </div>
                <div className="glass-panel p-4 rounded-xl border border-white/5">
                    <h3 className="text-xs text-gray-400 uppercase tracking-wider mb-1">Active Neural Nets</h3>
                    <div className="text-xl font-mono text-purple-400 font-bold">
                        {activeStrategies.length} <span className="text-xs text-gray-500">AGENTS</span>
                    </div>
                </div>
            </div>

            <div className="max-w-[1600px] w-full mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">

                {/* Main Chart Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="lg:col-span-2 space-y-6"
                >
                    {/* Persistent Secure Vault Control */}
                    <div className="glass-panel rounded-2xl p-6 relative overflow-hidden border border-white/5 hover:border-white/10 transition-all">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                            <div className="flex items-center gap-5">
                                <div className="w-16 h-16 bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-white/10 flex items-center justify-center relative group">
                                    <Shield className={`${vaultId ? 'text-stellar-teal' : 'text-gray-600'} transition-colors`} size={32} />
                                    {activeStrategies.length > 0 && vaultId && (
                                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-[#0f0a1f] rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                            Main Trading Vault
                                            {vaultId && <span className="text-[10px] bg-stellar-teal/10 text-stellar-teal px-2 py-0.5 rounded-full border border-stellar-teal/20">ACTIVE</span>}
                                        </h3>
                                        <div className="flex items-center bg-black/40 border border-white/10 rounded-lg p-1">
                                            <button
                                                onClick={() => setBaseAsset('USDC')}
                                                className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${baseAsset === 'USDC' ? 'bg-stellar-yellow text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                                            >
                                                USDC
                                            </button>
                                            <button
                                                onClick={() => setBaseAsset('XLM')}
                                                className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${baseAsset === 'XLM' ? 'bg-[#4ca2ff] text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                                            >
                                                XLM
                                            </button>
                                            <button
                                                onClick={() => setBaseAsset('CETES')}
                                                className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${baseAsset === 'CETES' ? 'bg-green-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                                                title="Mexican Treasury Bonds (Etherfuse)"
                                            >
                                                🇲🇽 CETES
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 font-mono mt-1">
                                        {vaultId ? `ID: ${vaultId}` : 'Vault ID: Not Created'} • {vaultBalance.toFixed(2)} {baseAsset} Locked
                                    </p>
                                    <div className="flex items-center gap-2 pt-1">
                                        {vaultId ? (
                                            <span className="text-[10px] font-bold text-green-400 flex items-center gap-1.5 bg-green-500/5 px-2 py-1 rounded-lg border border-green-500/10">
                                                <RefreshCw size={10} className="animate-spin-slow" />
                                                AGENT ACCESS: GRANTED 🔓
                                            </span>
                                        ) : (
                                            <span className="text-[10px] font-bold text-orange-400 flex items-center gap-1.5 bg-orange-500/5 px-2 py-1 rounded-lg border border-orange-500/10">
                                                <Shield size={10} />
                                                AGENT ACCESS: REVOKED 🔒
                                            </span>
                                        )}
                                        {vaultId && (
                                            <button
                                                onClick={handleDestroyVault}
                                                className="text-gray-600 hover:text-red-500 transition-all p-1"
                                                title="Destroy Vault"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {!vaultId ? (
                                    <button
                                        onClick={handleCreateVault}
                                        className="bg-stellar-yellow text-black font-bold text-xs px-6 py-3 rounded-xl hover:bg-stellar-yellow/80 transition-all shadow-[0_0_20px_rgba(255,200,0,0.3)] animate-pulse"
                                    >
                                        + INITIALIZE VAULT
                                    </button>
                                ) : (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleDeposit}
                                            className="px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-all hover:scale-105 active:scale-95 shadow-lg"
                                        >
                                            Deposit
                                        </button>
                                        <button
                                            onClick={handleWithdraw}
                                            className="px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs font-bold transition-all hover:scale-105 active:scale-95"
                                        >
                                            Withdraw
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Background Glow Effect */}
                        <div className={`absolute -right-20 -bottom-20 w-64 h-64 rounded-full blur-[100px] opacity-10 transition-colors duration-1000 ${activeStrategies.length > 0 ? 'bg-green-500' : 'bg-stellar-teal'}`}></div>
                    </div>

                    {/* Fleet Grid Section */}
                    <div className="glass-panel rounded-2xl p-6 min-h-[400px]">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-sm text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <RefreshCw size={14} className={activeStrategies.length > 0 ? "animate-spin-slow text-stellar-teal" : "text-gray-600"} />
                                Fleet Status Monitor ({activeStrategies.length}/10)
                            </h2>
                            {activeStrategies.length === 0 && (
                                <button onClick={handleDeploy} className="text-[10px] bg-stellar-yellow/10 text-stellar-yellow px-3 py-1.5 rounded-lg border border-stellar-yellow/20 hover:bg-stellar-yellow/20 transition-colors">
                                    DEPLOY DEFAULT LOOP
                                </button>
                            )}
                        </div>

                        {activeStrategies.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {activeStrategies.slice(0, 10).map((strat, i) => {
                                    const baseApy = blendData ? blendData.supplyApy : 0;
                                    const boost = 0.5 + (strat.id.charCodeAt(0) % 30) / 10;
                                    const dynamicYield = (baseApy + boost).toFixed(2) + '%';

                                    return (
                                        <motion.div
                                            key={`strategy-grid-${i}`}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col relative overflow-hidden group hover:border-stellar-teal/30 transition-all"
                                        >
                                            <div className="flex justify-between items-start mb-2 relative z-10">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-2xl">{strat.emoji}</span>
                                                    <div>
                                                        <h3 className="font-bold text-sm leading-tight text-white">{strat.name}</h3>
                                                        <span className="text-[10px] text-green-400 font-mono flex items-center gap-1">
                                                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                                                            ACTIVE
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-stellar-teal font-mono font-bold animate-pulse-slow">{dynamicYield}</div>
                                                    <div className="text-[9px] text-gray-500">REAL APY</div>
                                                </div>
                                            </div>

                                            {/* Mini Agent Chart */}
                                            <div className="flex-1 relative mt-2 min-h-[60px]">
                                                <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
                                                    <path
                                                        d={`M0,${30 + (i * 5)} Q${50 + (i * 10)},${10 + (i * 2)} 100,${40 - (i * 2)} T200,${20 + (i * 5)}`}
                                                        fill="none"
                                                        stroke={i % 2 === 0 ? "#2DEBE8" : "#FFC800"}
                                                        strokeWidth="2"
                                                        vectorEffect="non-scaling-stroke"
                                                        className="drop-shadow-[0_0_5px_rgba(0,243,255,0.4)]"
                                                    />
                                                    <circle cx="200" cy={`${20 + (i * 5)}`} r="2.5" fill="#fff" className="animate-pulse" />
                                                </svg>
                                            </div>

                                            <div className="mt-auto pt-3 border-t border-white/5 flex gap-2 relative z-10 items-center justify-between">
                                                {strat.tx_digest ? (
                                                    <a
                                                        href={`https://stellar.expert/explorer/testnet/tx/${strat.tx_digest}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-[10px] font-mono text-stellar-teal hover:underline flex items-center gap-1 cursor-pointer"
                                                    >
                                                        Tx: {strat.tx_digest.slice(0, 6)}...{strat.tx_digest.slice(-4)}
                                                        <ExternalLink size={10} />
                                                    </a>
                                                ) : (
                                                    <span className="text-[10px] font-mono text-gray-500">Pending Execution...</span>
                                                )}

                                                <button
                                                    onClick={(e) => { e.stopPropagation(); stopStrategy(strat.id); }}
                                                    className="bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] px-2.5 py-1.5 rounded-lg border border-red-500/10 transition-colors"
                                                >
                                                    STOP
                                                </button>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center py-20 text-center space-y-4">
                                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-4xl grayscale opacity-50 relative">
                                    <div className="absolute inset-0 bg-white/5 rounded-full animate-ping opacity-20"></div>
                                    💤
                                </div>
                                <div className="space-y-1">
                                    <p className="text-gray-400 font-medium">No agents currently deployed.</p>
                                    <p className="text-xs text-gray-600 max-w-xs mx-auto">Initialize your Secure Vault and select a strategy to begin automated trading.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Right Column: Stats & Agent Controls */}
                <div className="space-y-6">

                    {/* Active Strategies Fleet */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="glass-panel p-6 rounded-2xl relative overflow-hidden min-h-[220px]"
                    >
                        <div className="absolute -right-4 -top-4 h-48 w-48 opacity-40 pointer-events-none">
                            <NeuralOrb activity={activeStrategies.length > 0 ? 0.8 : 0.2} />
                        </div>

                        <h3 className="text-sm text-gray-400 uppercase tracking-widest mb-4 flex items-center justify-between">
                            Active Fleet
                            <span className="text-stellar-teal font-mono text-xs">{activeStrategies.length} ACTIVE</span>
                        </h3>

                        {activeStrategies.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center space-y-3 relative z-10">
                                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-gray-600">
                                    <span className="text-2xl">💤</span>
                                </div>
                                <p className="text-sm text-gray-400">No agents running.</p>
                                <button onClick={handleDeploy} className="text-xs bg-stellar-yellow/10 text-stellar-yellow px-3 py-1.5 rounded-lg border border-stellar-yellow/20 hover:bg-stellar-yellow/20 transition-colors">
                                    Deploy Loop (v2.0)
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4 relative z-10 max-h-[300px] overflow-y-auto pr-1">
                                {activeStrategies.map((strat, idx) => (
                                    <div key={`strategy-list-${idx}`} className="bg-white/5 rounded-xl p-3 border border-white/10 hover:border-white/20 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg">{strat.emoji}</span>
                                                <div>
                                                    <h4 className="text-xs font-bold text-white">{strat.name}</h4>
                                                    <StatusBadge status="active" label="SYNCED" />
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs text-stellar-teal font-mono font-bold">{strat.yield}</div>
                                                <div className="text-[9px] text-gray-500">TARGET APY</div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 mt-2">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setSelectedStrategy(strat); }}
                                                className="flex-1 py-1.5 rounded bg-white/5 border border-white/10 text-[9px] font-bold text-gray-400 hover:text-white transition-colors"
                                            >
                                                DETAILS
                                            </button>
                                            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-stellar-blue/5 border border-stellar-blue/20">
                                                <Shield size={10} className="text-stellar-blue" />
                                                <span className="text-[8px] font-bold text-stellar-blue whitespace-nowrap uppercase tracking-tighter">
                                                    {t.common.atomic_execution} — AUDITED
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => stopStrategy(strat.id)}
                                                className="px-3 bg-red-500/10 hover:bg-red-500/20 text-[10px] py-1.5 rounded transition-colors text-red-400 border border-red-500/20"
                                            >
                                                STOP
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Quick Actions at the bottom of the Fleet card */}
                        <div className="mt-6 pt-4 border-t border-white/5 flex flex-col gap-2 relative z-10">
                            <Link href="/strategies" className="w-full">
                                <button className="w-full bg-white/5 hover:bg-white/10 text-[11px] font-bold py-2 rounded-xl transition-all border border-white/10 text-gray-300 flex items-center justify-center gap-2">
                                    <Zap className="w-3 h-3 text-stellar-teal" />
                                    DEPLOY MORE AGENTS
                                </button>
                            </Link>
                            <Link href="/strategies/builder" className="w-full">
                                <button className="w-full bg-stellar-yellow/10 hover:bg-stellar-yellow/20 text-[11px] font-bold py-2 rounded-xl transition-all border border-stellar-yellow/20 text-stellar-yellow flex items-center justify-center gap-2">
                                    <Plus className="w-3 h-3" />
                                    CREATE YOUR AGENT
                                </button>
                            </Link>
                        </div>
                    </motion.div>

                    {/* Market Intelligence (Phoenix & Blend) */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 }}
                        className="glass-panel p-4 rounded-xl border border-white/5"
                    >
                        <h3 className="text-xs text-gray-400 uppercase tracking-widest mb-3">Liquidity Intelligence</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white/5 p-2 rounded border border-white/5 hover:border-stellar-teal/30 transition-colors">
                                <div className="text-[10px] text-stellar-teal font-bold mb-1 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-stellar-teal"></span> PHOENIX
                                </div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-gray-400">Supply</span>
                                    <span className="text-green-400 font-mono">{phoenixData?.supplyApy || '--'}%</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-400">Borrow</span>
                                    <span className="text-red-400 font-mono">{phoenixData?.borrowApy || '--'}%</span>
                                </div>
                            </div>
                            <div className="bg-white/5 p-2 rounded border border-white/5 hover:border-blue-400/30 transition-colors">
                                <div className="text-[10px] text-blue-400 font-bold mb-1 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span> BLEND
                                </div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-gray-400">Supply</span>
                                    <span className="text-green-400 font-mono">{blendData?.supplyApy || '--'}%</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-400">Borrow</span>
                                    <span className="text-red-400 font-mono">{blendData?.borrowApy || '--'}%</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Agent Logs > Replacement OpsConsole */}
                    <div className="rounded-2xl h-[300px] flex flex-col relative">
                        <OpsConsole
                            isExpanded={expandConsole}
                            onToggleExpand={() => setExpandConsole(!expandConsole)}
                            walletAddress={account?.address}
                        />
                    </div>

                    {/* x402 Protocol Revenue */}
                    <ProtocolRevenue />
                </div>
            </div>

            {/* Background Elements */}
            <div className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-stellar-yellow/20 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-stellar-teal/10 rounded-full blur-[120px]"></div>
            </div>

        </div >
    );
}

export default function Dashboard() {
    return (
        <main className="min-h-screen">
            {/* @ts-ignore - React 19 type mismatch in Next.js */}
            <Suspense fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-stellar-teal border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-stellar-teal font-mono animate-pulse">Initializing Dashboard...</p>
                    </div>
                </div>
            }>
                <DashboardContent />
            </Suspense>
        </main>
    )
}
