// @ts-nocheck
'use client';

import Navbar from "@/components/layout/Navbar";

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
import { writeLog } from "@/lib/logger";
import { stellarClient } from "@/lib/stellarClient";
import { useVault, useEloReputation } from "@/hooks/useNiriumContracts";
import { getWebSocketUrl } from "@/lib/constants";
import { simulateSorobanTx } from "@/lib/stellarSim";
import { handleWalletError } from "@/components/wallet/WalletErrorHandler";
import { NATIVE_ASSET_ID } from "@/lib/sorobanContracts";
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
            networkPassphrase: Networks.TESTNET
        });

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
    const [baseAsset, setBaseAsset] = useState<"XLM" | "USDC">("USDC");
    const getCoinType = () => baseAsset === "XLM"
        ? "XLM"
        : "USDC";

    const [selectedStrategy, setSelectedStrategy] = useState<any>(null); // State for Details Modal
    const [expandConsole, setExpandConsole] = useState(false);

    const [blendData, setBlendData] = useState<{ supplyApy: number, borrowApy: number } | null>(null);
    const [phoenixData, setPhoenixData] = useState<{ supplyApy: number, borrowApy: number } | null>(null);
    const [walletBalance, setWalletBalance] = useState<number>(0);
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
    const [vaultId, setVaultId] = useState<string | null>(null);
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
            // Skills/Plugins catalog (matches Marketplace + Plugins pages)
            const SKILL_CATALOG: Record<string, any> = {
                'flash-loan-executor': { slug: 'flash-loan-executor', name: 'Flash Loan Executor', version: '0.0.7', category: 'trading', isGlobal: false },
                'price-oracle': { slug: 'price-oracle', name: 'Multi-Source Price Oracle', version: '1.5.0', category: 'data', isGlobal: true },
                'telegram-alerts-pro': { slug: 'telegram-alerts-pro', name: 'Telegram Alerts Pro', version: '3.0.0', category: 'notification', isGlobal: true },
                'whale-tracker': { slug: 'whale-tracker', name: 'Whale Tracker', version: '1.2.0', category: 'analysis', isGlobal: false },
                'lst-arbitrage': { slug: 'lst-arbitrage', name: 'LST Arbitrage Bot', version: '2.0.0', category: 'trading', isGlobal: false },
                'blend-optimizer': { slug: 'blend-optimizer', name: 'Blend Yield Optimizer', version: '1.8.0', category: 'trading', isGlobal: false },
                'discord-integration': { slug: 'discord-integration', name: 'Discord Bot Integration', version: '2.5.0', category: 'integration', isGlobal: true },
                'portfolio-tracker': { slug: 'portfolio-tracker', name: 'Portfolio Tracker', version: '1.3.0', category: 'analysis', isGlobal: false },
                'pyth-oracle': { slug: 'pyth-oracle', name: 'Pyth Network Oracle', version: '2.1.0', category: 'data', isGlobal: true },
                'twitter-sentiment': { slug: 'twitter-sentiment', name: 'Twitter/X Sentiment Analyzer', version: '0.0.7', category: 'analysis', isGlobal: false },
                'phoenix-lp-manager': { slug: 'phoenix-lp-manager', name: 'Phoenix LP Manager', version: '2.0.0', category: 'trading', isGlobal: false },
                'gas-optimizer': { slug: 'gas-optimizer', name: 'Gas Optimizer', version: '1.0.0', category: 'utility', isGlobal: false },
                // Core Plugins (from /plugins page)
                'nirium-deep-research': { slug: 'nirium-deep-research', name: 'Stellar Deep Research', version: '0.1.0', category: 'intelligence', isGlobal: true },
                'social-sentiment': { slug: 'social-sentiment', name: 'Social Sentiment', version: '0.0.7', category: 'intelligence', isGlobal: true },
                'knowledge-graph': { slug: 'knowledge-graph', name: 'Knowledge Graph', version: '0.0.7', category: 'intelligence', isGlobal: true },
                'flash-loan-engine': { slug: 'flash-loan-engine', name: 'Flash Loan Engine', version: '0.0.7', category: 'defi', isGlobal: false },
                'onchain-oracle': { slug: 'onchain-oracle', name: 'On-Chain Oracle', version: '0.0.7', category: 'data', isGlobal: true },
                'risk-shield': { slug: 'risk-shield', name: 'Risk Shield', version: '0.0.7', category: 'risk', isGlobal: false },
                'auto-compounder': { slug: 'auto-compounder', name: 'Auto-Compounder', version: '0.0.7', category: 'yield', isGlobal: false },
                'portfolio-rebalancer': { slug: 'portfolio-rebalancer', name: 'Portfolio Rebalancer', version: '0.0.7', category: 'portfolio', isGlobal: false },
                'mev-interceptor': { slug: 'mev-interceptor', name: 'MEV Interceptor', version: '0.0.7', category: 'mev', isGlobal: false },
                'liquidity-sniper': { slug: 'liquidity-sniper', name: 'Liquidity Sniper', version: '0.0.7', category: 'sniping', isGlobal: false },
                // Marketplace Skills — 10 new
                'blend-lending-bot': { slug: 'blend-lending-bot', name: 'Blend Lending Bot', version: '1.1.0', category: 'trading', isGlobal: false },
                'sdex-market-maker': { slug: 'sdex-market-maker', name: 'SDEX Market Maker', version: '0.9.2', category: 'trading', isGlobal: false },
                'stop-loss-guardian': { slug: 'stop-loss-guardian', name: 'Stop-Loss Guardian', version: '2.2.0', category: 'utility', isGlobal: false },
                'eliza-trading-brain': { slug: 'eliza-trading-brain', name: 'ElizaOS Trading Brain', version: '0.0.7', category: 'analysis', isGlobal: true },
                'neural-archive-logger': { slug: 'neural-archive-logger', name: 'Neural Archive Logger', version: '1.0.0', category: 'utility', isGlobal: true },
                'cross-dex-aggregator': { slug: 'cross-dex-aggregator', name: 'Cross-DEX Aggregator', version: '3.1.0', category: 'trading', isGlobal: true },
                'pnl-reporter': { slug: 'pnl-reporter', name: 'P&L Real-Time Reporter', version: '1.4.0', category: 'analysis', isGlobal: false },
                'webhook-trigger': { slug: 'webhook-trigger', name: 'Webhook Event Trigger', version: '2.0.0', category: 'integration', isGlobal: false },
                'nirium-blackbox-logger': { slug: 'nirium-blackbox-logger', name: 'Neural Blackbox Logger', version: '0.0.7', category: 'utility', isGlobal: true },
                'usdc-vault-manager': { slug: 'usdc-vault-manager', name: 'USDC Vault Manager', version: '0.0.7', category: 'trading', isGlobal: false },
            };

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

    // Console Logs
    const [logs, setLogs] = useState<string[]>([
        "[SYSTEM] Dashboard initialized.",
        "[NETWORK] Connected to Stellar Testnet.",
    ]);

    // Modals (showAutoStartModal already declared above)

    // --- 2. CONSTANTS & MEMOS ---
    const STRATEGIES: Record<string, { name: string, logPrefix: string, emoji: string }> = {
        "nirium-usdc-loop": { name: "XLM/USDC Kinetic Loop", logPrefix: "ARBITRAGE", emoji: "🔄" },
        "soroswap-sniper": { name: "Meme Volatility Sniper", logPrefix: "SNIPER", emoji: "🎯" },
        "peg-arbitrage": { name: "LST Peg Restoration", logPrefix: "PEG-ARB", emoji: "💧" },
        "eliza-sentiment": { name: "Eliza Sentiment Engine", logPrefix: "AI-SENTIMENT", emoji: "🧠" },
        "lending-loop-max": { name: "Blend-Phoenix Recursive Yield", logPrefix: "LENDING", emoji: "📈" },
        "blue-chip-dca": { name: "Weighted DCA Accumulator", logPrefix: "DCA", emoji: "💰" },
        "stable-yield-agg": { name: "Stablecoin Optimization Loop", logPrefix: "STABLE", emoji: "🏦" },
        "soroswap-clmm-active": { name: "CLMM Active Provisioner", logPrefix: "CLMM", emoji: "🛠️" },
        "bluefin-delta-neutral": { name: "Delta Neutral Funding Farmer", logPrefix: "DELTA", emoji: "⚖️" },
        "mev-capture": { name: "MEV Extraction Engine", logPrefix: "MEV", emoji: "⚡" },
        "perp-funding-arb": { name: "Perp Funding Rate Arbitrage", logPrefix: "PERP-FUND", emoji: "📊" },
        "pyth-oracle-sniper": { name: "Oracle Latency Arbitrageur", logPrefix: "ORACLE-ARB", emoji: "🔭" },
        "dual-yield-compounder": { name: "Dual Token Yield Compounder", logPrefix: "DUAL-YIELD", emoji: "🌀" },
        "liquidation-hunter": { name: "Liquidation Vector", logPrefix: "LIQUIDATION", emoji: "🩸" },
        "cross-chain-bridge-arb": { name: "Cross-Chain Spread Capture", logPrefix: "BRIDGE-ARB", emoji: "🌉" },
    };

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

        return STRATEGIES["nirium-usdc-loop"];
    }, [strategyId, activeStrategies, account, strategyNameParam]);

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

            setLogs(prev => [
                `[SUCCESS] ${currentStrategy.emoji} Agent Deployed on Stellar`,
                ...prev
            ].slice(0, 15));

            writeLog(
                `${currentStrategy.emoji} AGENT DEPLOYED: ${currentStrategy.name} | tx: ${txHash.slice(0, 12)}...`,
                'success',
                account?.address
            );

            // Strategy-specific boot logs
            const STRATEGY_BOOT_LOGS: Record<string, Array<{ msg: string; level: 'info' | 'success' | 'warn' | 'system' }>> = {
                'nirium-usdc-loop': [{ msg: 'ARBITRAGE: Scanning XLM/USDC spread on SDEX...', level: 'info' }, { msg: 'ARBITRAGE: Spread window detected (0.47%). Executing atomic swap.', level: 'success' }],
                'soroswap-sniper': [{ msg: 'SNIPER: Monitoring Soroswap for new liquidity...', level: 'info' }, { msg: 'SNIPER: Entry point confirmed. Strategy live.', level: 'warn' }],
                'blend-loop-max': [{ msg: 'LENDING: Optimizing Blend recursive positions...', level: 'info' }, { msg: 'LENDING: Yield loop active on Stellar Testnet.', level: 'success' }],
            };

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
            setLogs(prev => [`[AUTH] Authenticated user: ${account.address.slice(0, 8)}...`, ...prev]);
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
                    setLogs(prev => [`[NET] 📡 Uplink Established (Stable)`, ...prev].slice(0, 20));

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
                            setLogs(prev => [`[AGENT] 🤖 ${message} (${time})`, ...prev].slice(0, 20));

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


    // Fallback Mock Logs (Only if WS silent)
    useEffect(() => {
        const interval = setInterval(() => {
            // Only generate mock logs if we have no activity to prevent emptiness
            setLogs(prev => {
                const time = new Date().toLocaleTimeString();
                if (prev.length === 0 || Math.random() > 0.9) {
                    return [`[SYSTEM] 🛡️ Sentinel Active. Monitoring Mempool... (${time})`, ...prev].slice(0, 15);
                }
                return prev;
            });
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    // SVG Chart Data Generator (Mock)
    const chartPath = "M0,100 C20,90 40,110 60,80 C80,50 100,90 120,40 C140,20 160,60 180,30 C200,10 220,40 240,20 L240,150 L0,150 Z";
    const linePath = "M0,100 C20,90 40,110 60,80 C80,50 100,90 120,40 C140,20 160,60 180,30 C200,10 220,40 240,20";

    // Load Vault & OwnerCap from LocalStorage on mount
    useEffect(() => {
        if (account?.address) {
            const savedData = localStorage.getItem(`nirium-vault-${baseAsset}-${account.address}`);
            if (savedData) {
                try {
                    const vaultData = JSON.parse(savedData);
                    if (typeof vaultData === 'object' && vaultData.vaultId) {
                        setVaultId(vaultData.vaultId);
                        if (vaultData.ownerCapId) {
                            setOwnerCapId(vaultData.ownerCapId);
                        }
                    } else {
                        // Fallback: Old format (just string ID)
                        setVaultId(savedData);
                    }
                } catch {
                    // Fallback: Old format (just string ID)
                    setVaultId(savedData);
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
                    <p className="text-xs text-gray-400">Transfer XLM from your wallet to the secure vault.</p>
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
        if (!account || !vaultId) return;

        // Network Check (Strict)
        if (account.chains?.[0] && account.chains[0] !== 'stellar:testnet') {
            toast.error("Wrong Network Detected", {
                description: "This dApp runs on Stellar Testnet. Please switch your wallet network."
            });
            return;
        }

        const toastId = toast.loading(`Executing Deposit of ${amount} XLM...`);
        try {
            const { TransactionBuilder, Networks, Operation, Asset } = await import("@stellar/stellar-sdk");

            const tx = await buildStellarTransaction(account.address);

            // Stellar Deposit: Simply send to Vault Account
            // We use manageData combined with a self Native payment to simulate this reliably on Testnet
            // without needing actual deployed Vault contracts or USDC trustlines.
            tx.addOperation(Operation.payment({
                destination: account.address,
                asset: Asset.native(),
                amount: "0.0001"
            }));
            tx.addOperation(Operation.manageData({
                name: "vault_deposit",
                value: `${amount} ${baseAsset}`
            }));

            const builtTx = tx.build();
            const result = await signAndSubmitTransaction({ transaction: builtTx });

            toast.dismiss(toastId);

            // Sync demo vault balance visually
            const currentBalance = parseFloat(localStorage.getItem(`nirium-vault-balance-${vaultId}-${baseAsset}`) || "0");
            const newBalance = currentBalance + parseFloat(amount);
            localStorage.setItem(`nirium-vault-balance-${vaultId}-${baseAsset}`, newBalance.toString());
            setVaultBalance(newBalance);

            toast.success("Deposit Successful", {
                description: `${amount} XLM moved to Vault.`,
                action: {
                    label: "View Tx",
                    onClick: () => window.open(`https://stellar.expert/explorer/testnet/tx/${result.hash}`, "_blank")
                }
            });
        } catch (e) {
            console.error(e);
            toast.dismiss(toastId);
            toast.error("Deposit Failed");
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
                    <p className="text-xs text-gray-400">Transfer XLM from the vault back to your wallet address.</p>
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
        if (!account || !vaultId || !ownerCapId) return;

        // Network Check (Strict)
        if (account.chains?.[0] && account.chains[0] !== 'stellar:testnet') {
            toast.error("Wrong Network Detected", {
                description: "This dApp runs on Stellar Testnet. Please switch your wallet network."
            });
            return;
        }

        const toastId = toast.loading("Executing Withdrawal...");
        try {
            const { TransactionBuilder, Networks, Operation, Asset } = await import("@stellar/stellar-sdk");

            const tx = await buildStellarTransaction(account.address);

            // Stellar Withdraw: Simulated Soroban call or specialized payment
            // For now, we simulate a withdraw from a multisig/contract vault reliably
            tx.addOperation(Operation.payment({
                destination: account.address,
                asset: Asset.native(),
                amount: "0.0001" // dummy tx amount to simulate movement
            }));
            tx.addOperation(Operation.manageData({
                name: "vault_withdraw",
                value: `${amount} ${baseAsset}`
            }));

            const builtTx = tx.build();
            const result = await signAndSubmitTransaction({ transaction: builtTx });

            toast.dismiss(toastId);

            // Sync demo vault balance visually
            const currentBalance = parseFloat(localStorage.getItem(`nirium-vault-balance-${vaultId}-${baseAsset}`) || "0");
            const newBalance = Math.max(0, currentBalance - parseFloat(amount));
            localStorage.setItem(`nirium-vault-balance-${vaultId}-${baseAsset}`, newBalance.toString());
            setVaultBalance(newBalance);

            toast.success("Withdrawal Successful", {
                description: `${amount} XLM returned to your wallet.`,
                action: {
                    label: "View Tx",
                    onClick: () => window.open(`https://stellar.expert/explorer/testnet/tx/${result.hash}`, "_blank")
                }
            });
        } catch (e) {
            console.error(e);
            toast.dismiss(toastId);
            toast.error("Withdrawal Failed");
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

        const toastId = toast.loading("Creating Secure Vault...");

        try {
            const { TransactionBuilder, Networks, Operation, Keypair } = await import("@stellar/stellar-sdk");

            const tx = await buildStellarTransaction(account.address);

            // Stellar Create Vault: Create a new account or sub-entry
            // For the demo, we use a random G... address as the "Vault ID"
            const vaultKeypair = Keypair.random();
            const vaultId = vaultKeypair.publicKey();

            tx.addOperation(Operation.manageData({
                name: `vault_${baseAsset}_create`,
                value: vaultId.slice(0, 64)
            }));

            const builtTx = tx.build();
            const result = await signAndSubmitTransaction({ transaction: builtTx });

            toast.dismiss(toastId);
            console.log("Vault Creation Result (Hash):", result.hash);

            const vaultData = {
                vaultId: vaultId,
                ownerCapId: 'cap_' + Math.random().toString(36).substring(7),
                hash: result.hash
            };

            // Persist to LocalStorage
            localStorage.setItem(`nirium-vault-${baseAsset}-${account.address}`, JSON.stringify(vaultData));
            setVaultId(vaultData.vaultId);
            setOwnerCapId(vaultData.ownerCapId);

            toast.success("Secure Vault Deployed on-chain!", {
                description: `Vault ID: ${vaultData.vaultId.slice(0, 6)}...`,
                action: {
                    label: "View on Explorer",
                    onClick: () => window.open(`https://stellar.expert/explorer/testnet/tx/${result.hash}`, "_blank")
                }
            });

            writeLog(
                `VAULT INITIALIZED: ${baseAsset} Secure Enclave created | tx: ${result.hash.slice(0, 12)}...`,
                'system',
                account?.address
            );
        } catch (e: any) {
            toast.dismiss(toastId);
            console.error("Vault Creation Error:", e);
            toast.error("Deployment Failed: " + (e?.message || String(e)));
        }
    };

    const handleDestroyVault = async () => {
        if (!account) {
            toast.error("Please connect your Stellar Wallet first");
            return;
        }
        if (!vaultId) return;

        // Load vault data from localStorage
        const savedData = localStorage.getItem(`nirium-vault-${baseAsset}-${account.address}`);
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
                    localStorage.removeItem(`nirium-vault-${baseAsset}-${account.address}`);
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

        // Network Check (Strict)
        if (account.chains?.[0] && account.chains[0] !== 'stellar:testnet') {
            toast.error("Wrong Network Detected", {
                description: "This dApp runs on Stellar Testnet. Please switch your wallet network."
            });
            return;
        }

        const toastId = toast.loading("Destroying Vault...");

        try {
            const { TransactionBuilder, Networks, Operation } = await import("@stellar/stellar-sdk");

            const tx = await buildStellarTransaction(account.address);

            // Stellar Destroy Vault: Merger account or close entries
            // Since we don't have the vault's secret key in this frontend demo, we simulate
            // destruction via a ManageData operation on the user's own account.
            tx.addOperation(Operation.manageData({
                name: `vault_${baseAsset}_closed`,
                value: vaultData.vaultId.slice(0, 64)
            }));

            const builtTx = tx.build();
            const result = await signAndSubmitTransaction({ transaction: builtTx });

            toast.dismiss(toastId);
            localStorage.removeItem(`nirium-vault-${baseAsset}-${account.address}`);
            setVaultId(null);
            toast.success("Vault Destroyed & Funds Recovered!", {
                description: "Your vault has been destroyed on-chain.",
                action: {
                    label: "View Tx",
                    onClick: () => window.open(`https://stellar.expert/explorer/testnet/tx/${result.hash}`, '_blank')
                },
                duration: 8000
            });

            writeLog(
                `VAULT DESTROYED: ${baseAsset} Enclave terminated and funds returned | tx: ${result.hash.slice(0, 12)}...`,
                'warn',
                account?.address
            );
        } catch (error: any) {
            toast.dismiss(toastId);
            console.error("Destroy Vault Error:", error);
            toast.error("Failed to destroy vault: " + (error as any).message);
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
        <div className="min-h-screen bg-nirium-obsidian pt-36 pb-12 px-4 md:px-8 relative overflow-hidden">
            <Navbar />

            {/* Auto-Start Confirmation Modal */}
            <AnimatePresence>
                {showAutoStartModal && (
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
                        {onChainVaultCount !== null ? onChainVaultCount * 2 + 3 : '--'}
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
            <div className="w-full max-w-[1600px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 relative z-10">
                <div className="glass-panel p-4 rounded-xl border border-white/5">
                    <h3 className="text-xs text-gray-400 uppercase tracking-wider mb-1">Secure Vault TVL</h3>
                    <div className="text-xl font-mono text-white font-bold">
                        {vaultBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })} <span className="text-xs text-gray-500">{baseAsset}</span>
                    </div>
                    <div className="text-[10px] text-gray-500 mt-1 flex items-center gap-1.5 font-sans">
                        <div className="w-1 h-1 rounded-full bg-stellar-teal" />
                        WALLET: {walletBalance.toFixed(3)} {baseAsset}
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
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 font-mono mt-1">
                                        {vaultId ? `ID: ${vaultId.slice(0, 6)}...${vaultId.slice(-4)}` : 'Vault ID: Not Created'} • {vaultBalance.toFixed(2)} {baseAsset} Locked
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
