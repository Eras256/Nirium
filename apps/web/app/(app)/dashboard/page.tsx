// @ts-nocheck
'use client';

import { SectionBrandLogo } from "@/components/ui/SectionBrandLogo";

import { Suspense, useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { Float, Sphere, MeshTransmissionMaterial } from "@react-three/drei";
import { CanvasErrorBoundary } from "@/components/3d/CanvasErrorBoundary";
import Link from 'next/link';
import { useFreighter } from "@/hooks/useFreighter";
import { TransactionBuilder, Networks, Asset, Operation, Keypair } from "@stellar/stellar-sdk";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { ExternalLink, Shield, X, AlertTriangle, Trash2, Info, ChevronRight, RefreshCw, Zap, Plus, Code, Cpu, Filter, Download, Activity, StopCircle, Database, Globe } from "lucide-react";
import ProtocolRevenue from "@/components/dashboard/ProtocolRevenue";
import PaymentStreams from "@/components/dashboard/PaymentStreams";
import TelemetryFeed from "@/components/dashboard/TelemetryFeed";
import { writeLog } from "@/lib/logger";
import { stellarClient } from "@/lib/stellarClient";
import { useVault, useEloReputation } from "@/hooks/useNiriumContracts";
import { getWebSocketUrl } from "@/lib/constants";
import { simulateSorobanTx } from "@/lib/stellarSim";
import { handleWalletError } from "@/components/wallet/WalletErrorHandler";
import { NATIVE_ASSET_ID, USDC_ASSET_ID, CETES_ASSET_ID, vaultDeposit, vaultWithdraw, vaultCreate, vaultClose, vaultRevokeAgent, vaultDelegateAgent, vaultGetVaultCount, CETES_ASSET, getCETESBalance, hasCETESTrustline, eloGetTotalSentinels } from "@/lib/sorobanContracts";
import { generateOnboardingUrl, getOrCreateCustomerIds } from "@/lib/etherfuseApi";
import MarketTicker from "@/components/dashboard/MarketTicker";
import AuditTrailViewer from "@/components/dashboard/AuditTrailViewer";
import ProtocolKernel from "@/components/dashboard/ProtocolKernel";
import StatusBadge from "@/components/ui/StatusBadge";
import { useLanguage } from "@/context/LanguageContext";
import { useSecurityKillSwitch } from "@/lib/securityHooks";

import { ComplianceBanner } from "@/components/ui/ComplianceBanner";

// WebSocket hook removed as it was unused and redundant

function ProtocolKernelSmall() {
    return (
        <CanvasErrorBoundary>
            <Canvas
                camera={{ position: [0, 0, 4], fov: 45 }}
                gl={{ antialias: true, alpha: true }}
                style={{ background: 'transparent', pointerEvents: 'none', width: '100%', height: '100%' }}
                onCreated={({ gl }) => {
                    gl.domElement.addEventListener('webglcontextlost', (e: Event) => {
                        e.preventDefault();
                    }, false);
                }}
            >
                <Suspense fallback={null}>
                    <ambientLight intensity={0.6} />
                    <pointLight position={[5, 5, 5]} intensity={1.5} color="#FFC800" />
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
                </Suspense>
            </Canvas>
        </CanvasErrorBoundary>
    );
}

function DashboardContent() {
    const { t, language } = useLanguage();
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
    const [currentMarketState, setCurrentMarketState] = useState<{ etherfuseApy: number; baseFee: number; pathPaymentRoutes: any[] } | null>(null);
    const [walletBalance, setWalletBalance] = useState<number>(0);
    const [cetesBalance, setCetesBalance] = useState<string>('0');
    const [hasCetesTrust, setHasCetesTrust] = useState<boolean>(false);
    const [onChainVaultCount, setOnChainVaultCount] = useState<number | null>(null);
    const [onChainTotalFees, setOnChainTotalFees] = useState<number | null>(null);
    const [onChainElo, setOnChainElo] = useState<number | null>(null);
    const [globalActiveAgents, setGlobalActiveAgents] = useState<number | null>(null);
    const [thoughts, setThoughts] = useState<any[]>([
        { id: 'demo-1', agent: 'CORE', content: 'Strategic execution network online — broadcasting on-chain...', timestamp: new Date().toISOString(), type: 'execution' },
        { id: 'demo-2', agent: 'VAULT', content: 'Vault architecture synchronized — asset classes active', timestamp: new Date(Date.now() - 15000).toISOString(), type: 'execution' },
        { id: 'demo-3', agent: 'ROUTER', content: 'Liquidity route optimized for USDC — spread minimized', timestamp: new Date(Date.now() - 45000).toISOString(), type: 'execution' },
    ]);
    const vault = useVault();
    const elo = useEloReputation();

    // Fetch live on-chain data from Soroban RPC
    useEffect(() => {
        const fetchOnChainData = async () => {
            try {
                const [count, fees, sentinels] = await Promise.all([
                    vault.getVaultCount(),
                    vault.getTotalFees(),
                    eloGetTotalSentinels(),
                ]);
                setOnChainVaultCount(count);
                setOnChainTotalFees(fees / 10_000_000);
                setGlobalActiveAgents(Number(sentinels));
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

    // Fetch global active agents count from Supabase
    useEffect(() => {
        const fetchGlobalAgents = async () => {
            try {
                const { supabase } = await import('@/lib/supabase');
                const { count } = await supabase
                    .from('nirium_protocol_records')
                    .select('*', { count: 'exact', head: true })
                    .eq('record_type', 'STRATEGY')
                    .eq('status', 'RUNNING');
                setGlobalActiveAgents(count ?? 0);
            } catch {
                setGlobalActiveAgents(null);
            }
        };
        fetchGlobalAgents();
    }, []);

    // Fetch telemetry from /api/logs (combines agent_logs + activity + Horizon), polling every 8s
    useEffect(() => {
        const fetchThoughts = async () => {
            try {
                const res = await fetch('/api/logs');
                const data = await res.json();
                if (!Array.isArray(data) || data.length === 0) return;
                setThoughts(data.slice(0, 20).map((d: any) => ({
                    id: d.id,
                    agent: d.agent_id ?? 'CORE',
                    content: d.message ?? '',
                    timestamp: d.created_at ?? new Date().toISOString(),
                    type: (d.level === 'error' || d.level === 'warn') ? 'security' : 'execution',
                })));
            } catch {
                // silently ignore — empty state handles it
            }
        };
        fetchThoughts();
        const interval = setInterval(fetchThoughts, 8000);
        return () => clearInterval(interval);
    }, []);

    const [vaultBalance, setVaultBalance] = useState<number>(0);
    const [vaultId, setVaultId] = useState<number | null>(null);
    const [autoRebalance, setAutoRebalance] = useState<boolean>(false);
    const [autoRebalanceLoading, setAutoRebalanceLoading] = useState<boolean>(false);
    const [delegationId, setDelegationId] = useState<string | null>(null);
    const [autoExit, setAutoExit] = useState<boolean>(false);
    const [autoExitLoading, setAutoExitLoading] = useState<boolean>(false);
    const [delegationTxHash, setDelegationTxHash] = useState<string | null>(null);
    const [rebalanceThreshold, setRebalanceThreshold] = useState<number>(4.0);
    const [reverseThreshold, setReverseThreshold] = useState<number>(3.5);
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
                const { stellarClient } = await import("@/lib/stellarClient");
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

                // Blend/Phoenix rates not used in main stats — CETES rate from Etherfuse is the reference
                // These remain available for the Strategy Builder internal calculations
                setBlendData({ supplyApy: 0, borrowApy: 0 });
                setPhoenixData({ supplyApy: 0, borrowApy: 0 });

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
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://nirium-agent.fly.dev'}/api/public/protocol-meta`);
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

    // Fetch live market state (CETES rate, base fee, corridors)
    useEffect(() => {
        const fetchMarket = async () => {
            try {
                const res = await fetch('/api/market');
                const data = await res.json();
                setCurrentMarketState({
                    etherfuseApy: data.cetesRate ?? 0,
                    baseFee: data.baseFee ?? 100,
                    pathPaymentRoutes: data.pathPaymentRoutes ?? [],
                });
            } catch { /* use fallback */ }
        };
        fetchMarket();
        const interval = setInterval(fetchMarket, 30_000);
        return () => clearInterval(interval);
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

                        // Filter out DRAFT strategies - show any RUNNING/active status
                        const activeOnly = finalDeduped.filter(s => {
                            const st = (s.status || '').toUpperCase();
                            return st !== 'DRAFT' && st !== '';
                        });

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
            const { stellarClient } = await import("@/lib/stellarClient");
            const nativeBalance = await stellarClient.getBalance({ owner: account.address, coinType: 'XLM' }).then(b => Number(BigInt(b.totalBalance)) / 10_000_000);

            if (nativeBalance < REQUIRED_BALANCE) {
                toast.error(t.dashboard.toasts.insufficient_balance.replace('{amount}', REQUIRED_BALANCE.toString()), {
                    description: `Detected: ${nativeBalance.toFixed(4)} XLM.`
                });
                return;
            }

            // REAL INSTITUTIONAL SOROBAN CALL
            toast.loading(t.dashboard.toasts.deploying_vault, { id: toastId });
            const result = await vault.createVault(account.address, NATIVE_ASSET_ID, currentStrategy.name);

            if (!result.success || !result.txHash) {
                toast.dismiss(toastId);
                toast.error(t.dashboard.toasts.deployment_failed, {
                    description: result.error || t.dashboard.toasts.check_freighter
                });
                return;
            }

            const txHash = result.txHash;

            // Extract vault ID and store so stop flow can call close_vault
            const newVaultData = result.result as any;
            const newVaultId = newVaultData
                ? Number(newVaultData.vault_id ?? newVaultData.vaultId ?? newVaultData[0] ?? NaN)
                : NaN;
            if (!isNaN(newVaultId)) {
                const storageData = {
                    vaultId: newVaultId,
                    ownerCapId: `cap_${newVaultId}_${Date.now()}`,
                    createdAt: Date.now(),
                    txHash,
                };
                localStorage.setItem(`nirium-vault-v2-XLM-${account.address}`, JSON.stringify(storageData));
                setVaultId(newVaultId);
            }

            toast.dismiss(toastId);
            toast.success(`${currentStrategy.emoji} ${currentStrategy.name} Active!`, {
                description: "Institutional Soroban Vault created.",
                action: {
                    label: "Verify on Explorer",
                    onClick: () => window.open(`https://stellar.expert/explorer/testnet/tx/${txHash}`, "_blank")
                }
            });

            // Save to Supabase & State (vault_id in config so stop works after page reload)
            const { StrategyService } = await import("@/lib/strategyService");
            StrategyService.deployStrategy(account.address, {
                strategy_id: strategyId,
                name: currentStrategy.name,
                emoji: currentStrategy.emoji,
                status: "RUNNING",
                yield: "~6.5%",
                tx_digest: txHash,
                config: !isNaN(newVaultId) ? { vault_id: newVaultId } : {}
            }).then((newStrategy: any) => {
                const strategyToAdd = {
                    id: newStrategy?.id || strategyId,
                    strategy_id: strategyId,
                    name: currentStrategy.name,
                    emoji: currentStrategy.emoji,
                    status: "RUNNING",
                    yield: "~6.5%",
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
            // Resolve vaultId: state → localStorage → Supabase config
            let resolvedVaultId = vaultId;
            if (resolvedVaultId === null && account?.address) {
                for (const asset of ['USDC', 'XLM', 'CETES']) {
                    try {
                        const saved = localStorage.getItem(`nirium-vault-v2-${asset}-${account.address}`);
                        if (saved) {
                            const parsed = JSON.parse(saved);
                            if (parsed?.vaultId != null && !isNaN(Number(parsed.vaultId))) {
                                resolvedVaultId = Number(parsed.vaultId);
                                break;
                            }
                        }
                    } catch { /* skip */ }
                }
            }
            // Last resort: read vault_id from the strategy's config in Supabase/localStorage
            if (resolvedVaultId === null) {
                const found = activeStrategies.find(s => s.id === dbId || s.strategy_id === dbId);
                const configVaultId = found?.config?.vault_id;
                if (configVaultId != null && !isNaN(Number(configVaultId))) {
                    resolvedVaultId = Number(configVaultId);
                }
            }

            // Close vault on-chain — proper Soroban invocation, 1 Freighter signature
            const localVaultId = resolvedVaultId;
            const closeResult = localVaultId !== null
                ? await vaultClose(account.address, localVaultId)
                : null;

            toast.dismiss(toastId);
            if (closeResult?.success && closeResult?.txHash) {
                toast.success("Vault Closed", {
                    description: `Vault #${localVaultId} terminated on Stellar Testnet.`,
                    action: {
                        label: "View Tx",
                        onClick: () => window.open(`https://stellar.expert/explorer/testnet/tx/${closeResult.txHash}`, "_blank")
                    }
                });
                writeLog(`VAULT CLOSED: #${localVaultId} | tx: ${closeResult.txHash.slice(0, 12)}...`, 'warn', account?.address);
            } else {
                // Fallback: signed memo tx so Freighter still prompts
                const { Operation, Asset, Memo } = await import("@stellar/stellar-sdk");
                const stratName = activeStrategies.find(s => s.id === dbId)?.name || dbId;
                const tx = await buildStellarTransaction(account.address);
                tx.addOperation(Operation.payment({
                    destination: account.address,
                    asset: Asset.native(),
                    amount: "0.0001"
                })).addMemo(Memo.text(`NIRIUM:STOP:${stratName.slice(0, 16)}`));
                const builtTx = tx.build();
                const result = await signAndSubmitTransaction({ transaction: builtTx });
                toast.success("Agent Terminated", {
                    description: "Termination logged on Stellar Testnet.",
                    action: {
                        label: "View Tx",
                        onClick: () => window.open(`https://stellar.expert/explorer/testnet/tx/${result.hash}`, "_blank")
                    }
                });
                writeLog(`AGENT TERMINATED: ${stratName} | tx: ${result.hash.slice(0, 12)}...`, 'warn', account?.address);
            }

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

    // --- RESTORE AUTO-REBALANCE STATE FROM LOCALSTORAGE ---
    useEffect(() => {
        if (!account?.address) return;
        try {
            const saved = localStorage.getItem(`nirium-autorebalance-${account.address}`);
            if (!saved) return;

            const { autoRebalance: ar, delegationId: di, autoExit: ae, txHash: th, rebalanceThreshold: rt, reverseThreshold: rv } = JSON.parse(saved);
            if (ar) { setAutoRebalance(true); setDelegationId(di ?? null); if (th) setDelegationTxHash(th); }
            if (ae) setAutoExit(true);
            if (rt) setRebalanceThreshold(rt);
            if (rv) setReverseThreshold(rv);

            // If the saved delegation ID is a fake demo-del-xxx (created when the agent was unreachable),
            // re-register in Supabase now that CORS + service role key are configured.
            // The Soroban delegation already exists on-chain — no Freighter signature needed.
            if (ar && di && (di.startsWith('demo-del-') || !di.includes('-'))) {
                const savedVaultId = (() => {
                    for (const asset of ['USDC', 'XLM', 'CETES']) {
                        try {
                            const v = localStorage.getItem(`nirium-vault-v2-${asset}-${account.address}`);
                            if (v) { const p = JSON.parse(v); if (p?.vaultId) return p.vaultId; }
                        } catch { /* skip */ }
                    }
                    return null;
                })();

                if (savedVaultId) {
                    const AGENT_API_URL = process.env.NEXT_PUBLIC_AGENT_URL || 'https://nirium-agent.fly.dev';
                    const token = localStorage.getItem('nirium-token') || 'demo-token';
                    fetch(`${AGENT_API_URL}/api/vault/delegate`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                        body: JSON.stringify({
                            user_wallet: account.address,
                            vault_id: savedVaultId,
                            rebalance_threshold: rt ?? 4.0,
                        }),
                    }).then(async r => {
                        if (r.ok) {
                            const data = await r.json();
                            const realId = data.delegation?.id;
                            if (realId) {
                                setDelegationId(realId);
                                const updated = JSON.parse(localStorage.getItem(`nirium-autorebalance-${account.address}`) ?? '{}');
                                updated.delegationId = realId;
                                localStorage.setItem(`nirium-autorebalance-${account.address}`, JSON.stringify(updated));
                            }
                        }
                    }).catch(() => { /* silent — agent may be starting up */ });
                }
            }
        } catch { /* ignore */ }
    }, [account?.address]);

    // --- RECONCILE WITH SUPABASE (DB es la fuente de verdad por wallet) ---
    // Poll cada 15s al endpoint de la wallet conectada para mantener el toggle
    // sincronizado con DB, incluso si un STOP/activate no se propagó por timeouts de red.
    useEffect(() => {
        if (!account?.address) return;
        const AGENT_API_URL = process.env.NEXT_PUBLIC_AGENT_URL || 'https://nirium-agent.fly.dev';
        const wallet = account.address;

        const sync = async () => {
            const ctrl = new AbortController();
            const t = setTimeout(() => ctrl.abort(), 8000);
            try {
                const r = await fetch(`${AGENT_API_URL}/api/vault/delegate/${wallet}`, { signal: ctrl.signal });
                if (!r.ok) return;
                const data = await r.json();
                const d = data?.delegation;
                if (d && d.is_active) {
                    setAutoRebalance(true);
                    setDelegationId(d.id);
                    if (d.rebalance_threshold) setRebalanceThreshold(Number(d.rebalance_threshold));
                    if (d.reverse_rebalance) {
                        setAutoExit(true);
                        if (d.reverse_threshold) setReverseThreshold(Number(d.reverse_threshold));
                    } else {
                        setAutoExit(false);
                    }
                    const stored = JSON.parse(localStorage.getItem(`nirium-autorebalance-${wallet}`) ?? '{}');
                    localStorage.setItem(`nirium-autorebalance-${wallet}`, JSON.stringify({
                        ...stored,
                        autoRebalance: true,
                        delegationId: d.id,
                        rebalanceThreshold: Number(d.rebalance_threshold),
                        autoExit: !!d.reverse_rebalance,
                        reverseThreshold: Number(d.reverse_threshold),
                    }));
                } else {
                    // No hay fila activa en Supabase. Antes de borrar el estado, verificamos
                    // si tenemos una delegación on-chain pendiente de sincronizar (placeholder
                    // demo-del-* con txHash real). Si la hay, re-intentamos el registro.
                    const stored = localStorage.getItem(`nirium-autorebalance-${wallet}`);
                    if (stored) {
                        try {
                            const parsed = JSON.parse(stored);
                            const isPending = parsed?.autoRebalance === true
                                && typeof parsed?.delegationId === 'string'
                                && parsed.delegationId.startsWith('demo-del-')
                                && parsed?.txHash;
                            if (isPending) {
                                const resolvedVaultId = (() => {
                                    for (const asset of ['USDC', 'XLM', 'CETES']) {
                                        try {
                                            const v = localStorage.getItem(`nirium-vault-v2-${asset}-${wallet}`);
                                            if (v) { const p = JSON.parse(v); if (p?.vaultId) return p.vaultId; }
                                        } catch { /* skip */ }
                                    }
                                    return null;
                                })();
                                if (resolvedVaultId) {
                                    const token = localStorage.getItem('nirium-token') || 'demo-token';
                                    fetch(`${AGENT_API_URL}/api/vault/delegate`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                        body: JSON.stringify({
                                            user_wallet: wallet,
                                            vault_id: resolvedVaultId,
                                            rebalance_threshold: parsed.rebalanceThreshold ?? 4.0,
                                        }),
                                    }).then(async r2 => {
                                        if (!r2.ok) return;
                                        const data2 = await r2.json();
                                        const realId = data2?.delegation?.id;
                                        if (realId) {
                                            setDelegationId(realId);
                                            const updated = { ...parsed, delegationId: realId };
                                            localStorage.setItem(`nirium-autorebalance-${wallet}`, JSON.stringify(updated));
                                        }
                                    }).catch(() => { /* siguiente tick re-intenta */ });
                                    return; // No borramos el estado mientras retry está en curso
                                }
                            }
                        } catch { /* ignore parse error */ }
                    }
                    setAutoRebalance(false);
                    setAutoExit(false);
                    setDelegationId(null);
                    setDelegationTxHash(null);
                    localStorage.removeItem(`nirium-autorebalance-${wallet}`);
                }
            } catch { /* timeout o offline — conserva estado actual */ }
            finally { clearTimeout(t); }
        };

        sync();
        const interval = setInterval(sync, 15000);
        return () => clearInterval(interval);
    }, [account?.address]);

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
    
    // 🧪 Production Diagnostics: Test Supabase link on first load
    useEffect(() => {
        const testConn = async () => {
            const hasTested = sessionStorage.getItem('nirium_diag_v1');
            if (!hasTested) {
                console.log('🧪 [Diag] Testing Supabase connectivity...');
                const { writeLog } = await import('@/lib/logger');
                await writeLog('SYSTEM_DIAGNOSTIC: Dashboard session initialized. Bridge status: OK.', 'system', 'DASHBOARD_UI');
                sessionStorage.setItem('nirium_diag_v1', 'true');
            }
        };
        testConn();
    }, []);



    // SVG Chart Data Generator (Mock)
    const chartPath = "M0,100 C20,90 40,110 60,80 C80,50 100,90 120,40 C140,20 160,60 180,30 C200,10 220,40 240,20 L240,150 L0,150 Z";
    const linePath = "M0,100 C20,90 40,110 60,80 C80,50 100,90 120,40 C140,20 160,60 180,30 C200,10 220,40 240,20";

    // Load Vault & OwnerCap from LocalStorage on mount
    useEffect(() => {
        if (account?.address) {
            const CURRENT_VAULT_CONTRACT = process.env.NEXT_PUBLIC_CONTRACT_VAULT || 'CBTWMZCG3P72EHFAQ4ZLSEBIOFYJC244H5J6DHZIJ56FHFWJ2CFAWSZU';
            const savedData = localStorage.getItem(`nirium-vault-v2-${baseAsset}-${account.address}`);
            if (savedData) {
                try {
                    const vaultData = JSON.parse(savedData);
                    // If vault was created on a different contract, clear it — it's an orphaned vault
                    if (vaultData.contractId && vaultData.contractId !== CURRENT_VAULT_CONTRACT) {
                        console.warn('[Vault] Orphaned vault detected — contract changed. Clearing cache.');
                        localStorage.removeItem(`nirium-vault-v2-${baseAsset}-${account.address}`);
                        localStorage.removeItem(`nirium-autorebalance-${account.address}`);
                        setVaultId(null);
                        setOwnerCapId(null);
                    } else if (typeof vaultData === 'object' && vaultData.vaultId !== undefined) {
                        const numericId = typeof vaultData.vaultId === 'number'
                            ? vaultData.vaultId
                            : parseInt(String(vaultData.vaultId), 10);
                        if (!isNaN(numericId)) {
                            setVaultId(numericId);
                            if (vaultData.ownerCapId) setOwnerCapId(vaultData.ownerCapId);
                        } else {
                            localStorage.removeItem(`nirium-vault-v2-${baseAsset}-${account.address}`);
                            setVaultId(null);
                            setOwnerCapId(null);
                        }
                    } else {
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

                toast.success(t.dashboard.toasts.deposit_success, {
                    description: t.dashboard.toasts.deposit_desc.replace('{amount}', amount).replace('{asset}', baseAsset),
                    action: result.txHash ? {
                        label: t.dashboard.toasts.view_tx,
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

    const executeWithdraw = async (amount: string, retryCount = 0) => {
        const MAX_RETRIES = 3;

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

        // Validate withdrawal amount
        const withdrawAmount = parseFloat(amount);
        if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
            toast.error("Invalid Amount", {
                description: "Please enter a positive number to withdraw."
            });
            return;
        }

        // Check vault has sufficient balance
        if (withdrawAmount > vaultBalance) {
            toast.error(`Insufficient ${baseAsset} in Vault`, {
                description: `Vault balance: ${vaultBalance.toFixed(7)} ${baseAsset}. You requested ${withdrawAmount} ${baseAsset}.`
            });
            return;
        }

        // CETES trustline pre-check (Stellar requires trustline before receiving non-native assets)
        // Reference: https://developers.stellar.org/docs/build/guides/basics/verify-trustlines
        if (baseAsset === 'CETES' && !hasCetesTrust) {
            toast.error("CETES Trustline Not Found", {
                description: "Your wallet needs a CETES trustline to receive this asset. Add the trustline in Freighter first.",
                action: {
                    label: "Add via Etherfuse",
                    onClick: () => window.open('https://devnet.etherfuse.com', '_blank')
                }
            });
            return;
        }

        // USDC trustline pre-check (SAC assets also need trustline on classic side for withdrawal)
        if (baseAsset === 'USDC') {
            try {
                const { Horizon } = await import('@stellar/stellar-sdk');
                const horizonServer = new Horizon.Server(process.env.NEXT_PUBLIC_HORIZON_URL || 'https://horizon-testnet.stellar.org');
                const acct = await horizonServer.loadAccount(account.address);
                const hasUSDC = acct.balances.some(
                    (b: any) => b.asset_type !== 'native' && b.asset_code === 'USDC'
                );
                if (!hasUSDC) {
                    toast.error("USDC Trustline Not Found", {
                        description: "Your wallet needs a USDC trustline to receive this asset. Add it in Freighter settings."
                    });
                    return;
                }
            } catch {
                // If Horizon is unreachable, proceed — the contract will catch it
            }
        }

        const isRetry = retryCount > 0;
        const toastId = toast.loading(
            isRetry
                ? `Retrying withdrawal (${retryCount}/${MAX_RETRIES})...`
                : `Withdrawing ${amount} ${baseAsset}...`
        );

        try {
            // Convert amount to stroops (1 XLM/USDC/CETES = 10^7 stroops — Stellar 7-decimal precision)
            const amountInStroops = BigInt(Math.floor(withdrawAmount * 10_000_000));

            const result = await vaultWithdraw(account.address, vaultId, amountInStroops);

            toast.dismiss(toastId);

            if (result.success) {
                setVaultBalance(prev => Math.max(0, prev - withdrawAmount));
                setWalletBalance(prev => prev + withdrawAmount);

                toast.success(t.dashboard.toasts.withdrawal_success, {
                    description: t.dashboard.toasts.withdrawal_desc
                        .replace('{amount}', amount)
                        .replace('{asset}', baseAsset),
                    action: result.txHash ? {
                        label: t.dashboard.toasts.view_tx,
                        onClick: () => window.open(`https://stellar.expert/explorer/testnet/tx/${result.txHash}`, "_blank")
                    } : undefined
                });

                writeLog(`VAULT WITHDRAW: ${amount} ${baseAsset} | Vault ID: ${vaultId} | Tx: ${result.txHash?.slice(0, 12)}...`, 'success');
            } else {
                // Classify the error for actionable user feedback
                const err = result.error || 'Withdrawal failed';

                if (err.includes('insufficient vault balance') || err.includes('balance')) {
                    toast.error(`Insufficient ${baseAsset} in Vault`, {
                        description: `The vault does not have enough ${baseAsset}. Current balance: ${vaultBalance.toFixed(7)} ${baseAsset}.`
                    });
                } else if (err.includes('vault not found')) {
                    toast.error("Vault Not Found", {
                        description: "This vault may have been closed or the contract was redeployed. Clear cache and reconnect."
                    });
                } else if (err.includes('not_paused') || err.includes('paused')) {
                    toast.error("Contract Paused", {
                        description: "The NiriumVault contract is temporarily paused for maintenance."
                    });
                } else if (result.isSimulationError) {
                    toast.error("Transaction Simulation Failed", {
                        description: "The Soroban RPC rejected this transaction during simulation. This usually means the contract state changed. Try again."
                    });
                } else {
                    throw new Error(err);
                }

                writeLog(`VAULT WITHDRAW FAILED: ${err}`, 'error');
            }
        } catch (e: any) {
            console.error('Withdrawal error:', e);
            toast.dismiss(toastId);

            const errorMsg = e.message || 'Unknown error';

            // Retry on transient network errors (exponential backoff: 2s, 4s, 8s)
            const isTransient = errorMsg.includes('timeout') ||
                errorMsg.includes('fetch') ||
                errorMsg.includes('network') ||
                errorMsg.includes('ECONNREFUSED') ||
                errorMsg.includes('504') ||
                errorMsg.includes('503');

            if (isTransient && retryCount < MAX_RETRIES) {
                const delay = Math.pow(2, retryCount + 1) * 1000; // 2s, 4s, 8s
                toast.info(`Network issue detected. Retrying in ${delay / 1000}s...`, {
                    description: `Attempt ${retryCount + 1} of ${MAX_RETRIES}`
                });
                setTimeout(() => executeWithdraw(amount, retryCount + 1), delay);
                return;
            }

            if (isTransient) {
                toast.error("Network Unavailable", {
                    description: "Could not reach the Stellar network after 3 attempts. Please check your connection and try again."
                });
            } else if (errorMsg.includes('User declined')) {
                toast.error("Transaction Cancelled", {
                    description: "You declined the transaction in Freighter."
                });
            } else {
                toast.error("Withdrawal Failed", {
                    description: errorMsg
                });
            }

            writeLog(`VAULT WITHDRAW FAILED: ${errorMsg}`, 'error');
        }
    };

    // Nirium agent public key — receives delegation to execute on user vaults
    const NIRIUM_AGENT_KEY = 'GAVU2GH5RZUIQKLHM4FTVGTUY2V4XNVGWNGO2T6LVU7U74IYJGGYZ667';
    const AGENT_API = process.env.NEXT_PUBLIC_AGENT_URL || 'https://nirium-agent.fly.dev';

    const handleAutoRebalanceToggle = async () => {
        if (!account || !vaultId) {
            toast.error("Connect wallet and create a vault first");
            return;
        }
        setAutoRebalanceLoading(true);
        try {
            if (!autoRebalance) {
                // Preflight: verifica que la wallet conectada sea el owner on-chain del vault.
                // Sin esto, delegate_agent fallaría en vault.owner.require_auth() después de
                // que el usuario firme con Freighter — y el auto-recovery dispararía 2 firmas
                // adicionales que también fallan.
                try {
                    const vData = await vault.getVault(Number(vaultId));
                    const onChainOwner = (vData as any)?.owner;
                    if (onChainOwner && onChainOwner !== account.address) {
                        toast.error(`Esta bóveda pertenece a otra wallet (${String(onChainOwner).slice(0, 8)}…). Conecta esa wallet en Freighter o crea una nueva bóveda.`);
                        return;
                    }
                } catch { /* si la lectura falla, dejamos que el flujo siga — peor caso, falla la tx */ }

                // 1. Delegate vault to Nirium's agent key on Soroban — capture TX hash
                const delegateResult = await vaultDelegateAgent(account.address, vaultId, NIRIUM_AGENT_KEY);
                const txHash = (delegateResult as any)?.txHash;
                const txSuccess = (delegateResult as any)?.success;
                const txError = (delegateResult as any)?.error;

                // Si el contrato rechazó la llamada, casi siempre es porque el agente ya está delegado
                // para este vault (estado previo no revocado). Intentamos revoke + re-delegate.
                if (txSuccess === false) {
                    if (typeof txError === 'string' && txError.includes('failed on-chain')) {
                        try {
                            await vaultRevokeAgent(account.address, vaultId, NIRIUM_AGENT_KEY, true);
                            const retry = await vaultDelegateAgent(account.address, vaultId, NIRIUM_AGENT_KEY);
                            if ((retry as any)?.success === false) {
                                toast.error(`Soroban rechazó la delegación: ${(retry as any)?.error ?? 'unknown'}`);
                                return;
                            }
                            (delegateResult as any).txHash = (retry as any).txHash;
                        } catch (e: any) {
                            toast.error(`No se pudo delegar on-chain: ${e?.message ?? txError}`);
                            return;
                        }
                    } else {
                        toast.error(`Soroban rechazó la delegación: ${txError ?? 'unknown'}`);
                        return;
                    }
                }
                const finalTxHash = (delegateResult as any).txHash ?? txHash;

                // Optimistic UI: la delegación on-chain ya quedó firmada. Marcamos el nodo
                // activo *antes* del POST a Supabase para que (a) el usuario vea feedback
                // inmediato (1/10) y (b) si vuelve a clickear, dispare el flujo de STOP
                // (revoke) en vez de un nuevo delegate_agent on-chain.
                const pendingDelegationId = `demo-del-${Date.now()}`;
                setDelegationTxHash(finalTxHash ?? null);
                setAutoRebalance(true);
                setDelegationId(pendingDelegationId);
                localStorage.setItem(`nirium-autorebalance-${account.address}`, JSON.stringify({
                    autoRebalance: true,
                    delegationId: pendingDelegationId,
                    autoExit,
                    txHash: finalTxHash ?? null,
                    rebalanceThreshold,
                    reverseThreshold,
                }));

                // 2. Register delegation in agent backend — reintenta hasta 3 veces si la red Fly→Supabase está degradada
                const token = localStorage.getItem('nirium-token') || 'demo-token';
                let newDelegationId: string | null = null;
                for (let attempt = 0; attempt < 3 && !newDelegationId; attempt++) {
                    try {
                        const res = await fetch(`${AGENT_API}/api/vault/delegate`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                            body: JSON.stringify({ user_wallet: account.address, vault_id: vaultId, rebalance_threshold: rebalanceThreshold }),
                        });
                        if (res.ok) {
                            const data = await res.json();
                            if (data.delegation?.id) newDelegationId = data.delegation.id;
                        }
                    } catch { /* siguiente intento */ }
                    if (!newDelegationId && attempt < 2) await new Promise(r => setTimeout(r, 1500));
                }

                if (!newDelegationId) {
                    // El registro en Supabase falló — el reconcile sync re-intentará en el próximo tick
                    // (usa el placeholder demo-del-* para detectar que la fila aún no está sincronizada).
                    toast.warning('Delegación on-chain confirmada — sincronizando con backend en segundo plano…', {
                        action: finalTxHash ? {
                            label: t.dashboard.toasts.view_tx,
                            onClick: () => window.open(`https://stellar.expert/explorer/testnet/tx/${finalTxHash}`, '_blank'),
                        } : undefined,
                    });
                    return;
                }

                setDelegationId(newDelegationId);
                localStorage.setItem(`nirium-autorebalance-${account.address}`, JSON.stringify({ autoRebalance: true, delegationId: newDelegationId, autoExit, txHash: finalTxHash ?? null, rebalanceThreshold, reverseThreshold }));

                toast.success(t.dashboard.auto_rebalance.toast_enabled, {
                    action: finalTxHash ? {
                        label: t.dashboard.toasts.view_tx,
                        onClick: () => window.open(`https://stellar.expert/explorer/testnet/tx/${finalTxHash}`, '_blank'),
                    } : undefined,
                });
            } else {
                // 1. Mark inactive in backend FIRST — para detener el loop incluso si el usuario cancela la firma Freighter
                {
                    const token = localStorage.getItem('nirium-token');
                    await fetch(`${AGENT_API}/api/vault/delegate/${delegationId ?? 'none'}`, {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                        body: JSON.stringify({ user_wallet: account.address }),
                    }).catch(() => {});
                }

                // 2. Update UI state inmediatamente — el toggle/nodo desaparece sin esperar Freighter
                setAutoRebalance(false);
                setAutoExit(false);
                setDelegationId(null);
                setDelegationTxHash(null);
                localStorage.removeItem(`nirium-autorebalance-${account.address}`);

                // 3. Revocar delegación on-chain en Soroban (best-effort — si el usuario cancela, el loop ya está detenido)
                let revokeTxHash: string | undefined;
                try {
                    const revokeResult = await vaultRevokeAgent(account.address, vaultId, NIRIUM_AGENT_KEY);
                    revokeTxHash = (revokeResult as any)?.txHash;
                } catch { /* el usuario canceló o falló la firma — la DB ya está inactiva */ }

                toast.success(t.dashboard.auto_rebalance.toast_disabled, {
                    action: revokeTxHash ? {
                        label: t.dashboard.toasts.view_tx,
                        onClick: () => window.open(`https://stellar.expert/explorer/testnet/tx/${revokeTxHash}`, '_blank'),
                    } : undefined,
                });
            }
        } catch (e: any) {
            toast.error(`${t.dashboard.auto_rebalance.toast_error}: ${e.message}`);
        } finally {
            setAutoRebalanceLoading(false);
        }
    };

    const handleAutoExitToggle = async () => {
        if (!account || !vaultId) {
            toast.error("Connect wallet and create a vault first");
            return;
        }
        if (!delegationId) {
            toast.error(t.dashboard.auto_exit.delegation_required);
            return;
        }
        setAutoExitLoading(true);
        try {
            const newAutoExit = !autoExit;
            const token = localStorage.getItem('nirium-token') || 'demo-token';
            // Optimistic update — persist locally first, then try backend
            setAutoExit(newAutoExit);
            localStorage.setItem(`nirium-autorebalance-${account.address}`, JSON.stringify({ autoRebalance: true, delegationId, autoExit: newAutoExit, txHash: delegationTxHash }));
            try {
                const res = await fetch(`${AGENT_API}/api/vault/delegate/${delegationId}/reverse`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ enabled: newAutoExit, reverse_threshold: reverseThreshold }),
                });
                if (!res.ok) console.warn('[Auto-Exit] Backend update failed silently:', await res.text().catch(() => ''));
            } catch { /* API unreachable — state already saved locally */ }
            toast.success(autoExit ? t.dashboard.auto_exit.toast_disabled : t.dashboard.auto_exit.toast_enabled);
        } catch (e: any) {
            toast.error(`${t.dashboard.auto_exit.toast_error}: ${e.message}`);
        } finally {
            setAutoExitLoading(false);
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
                    txHash: result.txHash,
                    contractId: process.env.NEXT_PUBLIC_CONTRACT_VAULT || 'CBTWMZCG3P72EHFAQ4ZLSEBIOFYJC244H5J6DHZIJ56FHFWJ2CFAWSZU',
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
        <div className="min-h-screen bg-nirium-obsidian pt-8 pb-12 px-4 md:px-8 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-10 px-2 lg:px-0">
                <SectionBrandLogo size="w-24 sm:w-32 md:w-40" className="!justify-start mb-0" />
                <div className="flex flex-col">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight uppercase italic" style={{ fontFamily: 'Orbitron, sans-serif' }}>{t.dashboard.title}</h1>
                    <div className="flex items-center gap-3">
                        <div className="px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded text-[8px] font-black text-amber-500 uppercase tracking-widest">{t.dashboard.version_live}</div>
                        <div className="flex gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-stellar-teal animate-pulse" />
                            <div className="w-1.5 h-1.5 rounded-full bg-stellar-yellow animate-pulse delay-75" />
                        </div>
                    </div>
                </div>
            </div>

            <ComplianceBanner />

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
                            <h2 className="text-xl font-bold text-white mb-1.5 leading-tight">{t.dashboard.modals.deploy_title.replace('{name}', currentStrategy.name)}</h2>
                            <div className="bg-stellar-teal/5 border border-stellar-teal/20 p-3 rounded-lg mb-4">
                                <div className="flex justify-between items-center text-[9px] text-gray-400 uppercase tracking-widest mb-0.5 font-mono">
                                    <span>{t.dashboard.modals.fee_label}</span>
                                    <span>{t.dashboard.modals.fee_approved}</span>
                                </div>
                                <p className="text-stellar-teal font-mono text-base font-bold flex justify-between items-baseline">
                                    <span>0.10</span>
                                    <span className="text-[10px] ml-1 opacity-70 font-sans">XLM TESTNET</span>
                                </p>
                            </div>
                            <p className="text-gray-400 mb-6 text-xs leading-relaxed max-w-[280px] mx-auto">
                                {t.dashboard.modals.deploy_desc}
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowAutoStartModal(false)}
                                    className="flex-1 px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-colors font-mono font-bold text-[10px]"
                                >
                                    {t.dashboard.modals.cancel}
                                </button>
                                <button
                                    onClick={confirmAutoStart}
                                    className="flex-1 px-3 py-2.5 rounded-lg bg-stellar-teal/20 border border-stellar-teal/50 text-stellar-teal hover:bg-stellar-teal hover:text-black transition-all font-mono font-bold text-[10px] shadow-[0_0_20px_rgba(0,243,255,0.2)] flex items-center justify-center gap-1.5 group"
                                >
                                    {t.dashboard.modals.confirm}
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
                                        <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">FX Execution Rate</p>
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
                                    CLOSE
                                </button>
                                <button
                                    onClick={() => {
                                        stopStrategy(selectedStrategy.id);
                                        setSelectedStrategy(null);
                                    }}
                                    className="flex-1 px-4 py-3 rounded-xl font-bold text-xs bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 transition-colors flex items-center justify-center gap-2 group"
                                >
                                    <Trash2 size={14} className="group-hover:scale-110 transition-transform" />
                                    STOP HELPER
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
                                        {t.dashboard.toasts.dismiss}
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
            <div className="w-full max-w-[1600px] mx-auto grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-4 mb-4 relative z-10">
                <div className="glass-panel p-4 rounded-xl border border-stellar-teal/20 bg-stellar-teal/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-stellar-teal/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                    <h3 className="text-xs text-stellar-teal uppercase tracking-wider mb-1 font-bold flex items-center gap-1.5 relative z-10">
                        <Shield size={12} />
                        {t.dashboard.stats.reputation}
                    </h3>
                    <div className="text-xl font-mono text-stellar-teal font-black flex items-baseline gap-2 relative z-10">
                        {onChainElo !== null ? onChainElo : '...'}
                        <span className="text-[10px] text-stellar-teal/60">SCORE</span>
                    </div>
                    <div className="text-[10px] text-gray-500 mt-1 font-mono flex items-center gap-1.5 relative z-10">
                        <div className="w-1.5 h-1.5 rounded-full bg-stellar-teal animate-pulse" />
                        {t.dashboard.stats.trust_verified}
                    </div>
                </div>
                <div className="glass-panel p-4 rounded-xl border border-white/5">
                    <h3 className="text-xs text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <Activity size={12} />
                        {t.dashboard.stats.wallets}
                    </h3>
                    <div className="text-xl font-mono text-white font-bold flex items-baseline gap-2">
                        {onChainVaultCount !== null ? onChainVaultCount : '--'}
                        <span className="text-[10px] text-gray-600">DEPLOYS</span>
                    </div>
                </div>
                <div className="glass-panel p-4 rounded-xl border border-white/5">
                    <h3 className="text-xs text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <Globe size={12} />
                        {t.dashboard.stats.helpers}
                    </h3>
                    <div className="text-xl font-mono text-white font-bold flex items-baseline gap-2">
                        {activeStrategies.length + (autoRebalance ? 1 : 0) + (autoExit ? 1 : 0)}
                        <span className="text-[10px] text-gray-600">NODES</span>
                    </div>
                </div>
                <div className="glass-panel p-4 rounded-xl border border-stellar-yellow/20 bg-stellar-yellow/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-stellar-yellow/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                    <h3 className="text-xs text-stellar-yellow uppercase tracking-wider mb-1 font-bold flex items-center gap-1.5 relative z-10">
                        <Database size={12} />
                        {t.dashboard.stats.treasury}
                        <span className="text-[8px] font-mono text-stellar-yellow/50 border border-stellar-yellow/20 px-1 py-0.5 rounded">TESTNET</span>
                    </h3>
                    <div className="text-xl font-mono text-stellar-yellow font-black flex items-baseline gap-2 relative z-10">
                        {onChainTotalFees !== null ? onChainTotalFees.toFixed(4) : '0.0000'}
                        <span className="text-[10px] text-stellar-yellow/60">XLM</span>
                    </div>
                </div>
            </div>

            {/* Real-Time Analytics Bar */}
            <div className="w-full max-w-[1600px] mx-auto grid grid-cols-1 xs:grid-cols-2 md:grid-cols-5 gap-4 mb-8 relative z-10">
                <div className="glass-panel p-4 rounded-xl border border-white/5">
                    <h3 className="text-xs text-gray-400 uppercase tracking-wider mb-1">{t.dashboard.stats.secured_capital}</h3>
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
                        {t.dashboard.payment_streams.cetes_banxico}
                    </h3>
                    <div className="text-xl font-mono text-stellar-teal font-bold flex items-center gap-2">
                        {(currentMarketState?.etherfuseApy ?? 0) > 0
                            ? `${currentMarketState!.etherfuseApy.toFixed(2)}%`
                            : '...'}
                        <span className="text-[10px] bg-stellar-teal/20 text-stellar-teal px-1.5 rounded animate-pulse">LIVE</span>
                    </div>
                    <div className="text-[10px] text-gray-500 mt-1 font-mono">
                        {t.dashboard.payment_streams.cetes_rate_label} · Etherfuse · NON-FINANCIAL ADVICE
                    </div>
                </div>
                <div className="glass-panel p-4 rounded-xl border border-white/5">
                    <h3 className="text-xs text-gray-400 uppercase tracking-wider mb-1">{t.dashboard.payment_streams.network_fee}</h3>
                    <div className="text-xl font-mono text-white font-bold">
                        {currentMarketState?.baseFee ?? 100} <span className="text-xs text-gray-500">stroops</span>
                    </div>
                    <div className="text-[10px] text-gray-500 mt-1 font-mono">~${((currentMarketState?.baseFee ?? 100) * 0.0000001 * 0.155).toFixed(6)} USD</div>
                </div>
                <div className="glass-panel p-4 rounded-xl border border-white/5">
                    <h3 className="text-xs text-gray-400 uppercase tracking-wider mb-1">{t.dashboard.stats.helpers}</h3>
                    <div className="text-xl font-mono text-purple-400 font-bold">
                        {activeStrategies.length + (autoRebalance ? 1 : 0) + (autoExit ? 1 : 0)} <span className="text-xs text-gray-500">AGENTS</span>
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
                    <div data-vault-section className="glass-panel rounded-2xl p-6 relative overflow-hidden border border-white/5 hover:border-white/10 transition-all">
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
                                            {t.dashboard.vault_control.title}
                                            {vaultId && <span className="text-[10px] bg-stellar-teal/10 text-stellar-teal px-2 py-0.5 rounded-full border border-stellar-teal/20">{t.dashboard.stats.status_active}</span>}
                                        </h3>
                                        <div className="flex flex-wrap items-center bg-black/40 border border-white/10 rounded-lg p-1 gap-1">
                                            <button
                                                onClick={() => setBaseAsset('USDC')}
                                                className={`flex-1 sm:flex-none px-2 sm:px-3 py-1 rounded-md text-[10px] sm:text-xs font-bold transition-colors ${baseAsset === 'USDC' ? 'bg-stellar-yellow text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                                            >
                                                USDC
                                            </button>
                                            <button
                                                onClick={() => setBaseAsset('XLM')}
                                                className={`flex-1 sm:flex-none px-2 sm:px-3 py-1 rounded-md text-[10px] sm:text-xs font-bold transition-colors ${baseAsset === 'XLM' ? 'bg-[#4ca2ff] text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                                            >
                                                XLM
                                            </button>
                                            <button
                                                onClick={() => setBaseAsset('CETES')}
                                                className={`flex-1 sm:flex-none px-2 sm:px-3 py-1 rounded-md text-[10px] sm:text-xs font-bold transition-colors ${baseAsset === 'CETES' ? 'bg-green-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                                                title="Mexican Treasury Bonds (Etherfuse)"
                                            >
                                                🇲🇽 CETES
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-[10px] sm:text-xs text-gray-500 font-mono mt-1">
                                        {vaultId ? `ID: ${vaultId}` : 'Vault ID: Not Created'} • {vaultBalance.toFixed(2)} {baseAsset} Locked
                                    </p>
                                    <div className="flex flex-wrap items-center gap-2 pt-1">
                                        {vaultId ? (
                                            <span className="text-[10px] font-bold text-green-400 flex items-center gap-1.5 bg-green-500/5 px-2 py-1 rounded-lg border border-green-500/10">
                                                <RefreshCw size={10} className="animate-spin-slow" />
                                                {t.dashboard.vault_control.unlocked} 🔓
                                            </span>
                                        ) : (
                                            <span className="text-[10px] font-bold text-orange-400 flex items-center gap-1.5 bg-orange-500/5 px-2 py-1 rounded-lg border border-orange-500/10">
                                                <Shield size={10} />
                                                {t.dashboard.vault_control.locked} 🔒
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

                            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                                {!vaultId ? (
                                    <button
                                        onClick={handleCreateVault}
                                        className="w-full sm:w-auto bg-stellar-yellow text-black font-bold text-xs px-6 py-3 rounded-xl hover:bg-stellar-yellow/80 transition-all shadow-[0_0_20px_rgba(255,200,0,0.3)] animate-pulse"
                                    >
                                        {t.dashboard.vault_control.create_vault}
                                    </button>
                                ) : (
                                    <div className="flex flex-row sm:flex-row gap-2 w-full sm:w-auto">
                                        <button
                                            onClick={handleDeposit}
                                            className="flex-1 sm:px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-all hover:scale-105 active:scale-95 shadow-lg"
                                        >
                                            {t.dashboard.vault_control.deposit}
                                        </button>
                                        <button
                                            onClick={handleWithdraw}
                                            className="flex-1 sm:px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs font-bold transition-all hover:scale-105 active:scale-95"
                                        >
                                            {t.dashboard.vault_control.withdraw}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Auto-Rebalance Toggle — only for USDC vaults */}
                        {vaultId && baseAsset === 'USDC' && (
                            <div className="relative z-10 mt-4 pt-4 border-t border-white/5 space-y-3">
                                {/* Threshold config — visible only when toggle is OFF */}
                                {!autoRebalance && (
                                    <div className="bg-white/[0.03] rounded-xl p-3 border border-white/5">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-[10px] text-gray-400 font-mono uppercase tracking-widest">
                                                {language === 'es' ? 'Mover cuando CETES supere' : language === 'zh' ? '当 CETES 超过时移动' : 'Move when CETES exceeds'}
                                            </p>
                                            <span className="text-xs font-black text-stellar-teal font-mono">{rebalanceThreshold.toFixed(1)}%</span>
                                        </div>
                                        <input
                                            type="range"
                                            min={2.0} max={8.0} step={0.1}
                                            value={rebalanceThreshold}
                                            onChange={e => setRebalanceThreshold(parseFloat(e.target.value))}
                                            className="w-full h-1.5 accent-stellar-teal cursor-pointer"
                                        />
                                        <div className="flex justify-between text-[9px] text-gray-600 font-mono mt-1">
                                            <span>2%</span>
                                            {(currentMarketState?.etherfuseApy ?? 0) > 0 ? (
                                                <span className="text-stellar-teal/60">
                                                    {language === 'es' ? 'Hoy' : 'Today'}: {currentMarketState!.etherfuseApy.toFixed(2)}%
                                                </span>
                                            ) : null}
                                            <span>8%</span>
                                        </div>
                                    </div>
                                )}
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <p className="text-xs font-bold text-white flex items-center gap-2">
                                            <Zap size={12} className={autoRebalance ? 'text-stellar-teal animate-pulse' : 'text-gray-600'} />
                                            {t.dashboard.auto_rebalance.label}
                                        </p>
                                        <p className="text-[10px] text-gray-500 mt-0.5 font-mono">
                                            {autoRebalance
                                                ? `CETES > ${rebalanceThreshold.toFixed(1)}% — ${t.dashboard.auto_rebalance.enabled_desc}`
                                                : t.dashboard.auto_rebalance.disabled_desc}
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleAutoRebalanceToggle}
                                        disabled={autoRebalanceLoading}
                                        className={`relative w-12 h-6 rounded-full transition-all duration-300 flex items-center shrink-0 ${
                                            autoRebalance ? 'bg-stellar-teal' : 'bg-white/10'
                                        } ${autoRebalanceLoading ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
                                    >
                                        <span className={`absolute w-4 h-4 bg-white rounded-full shadow-lg transition-all duration-300 ${autoRebalance ? 'left-7' : 'left-1'}`} />
                                    </button>
                                </div>
                            </div>
                        )}
                        {vaultId && baseAsset === 'CETES' && (
                            <div className="relative z-10 mt-4 pt-4 border-t border-white/5 space-y-3">
                                {!autoExit && delegationId && (
                                    <div className="bg-white/[0.03] rounded-xl p-3 border border-white/5">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-[10px] text-gray-400 font-mono uppercase tracking-widest">
                                                {language === 'es' ? 'Salir a USDC si CETES baja de' : language === 'zh' ? '当 CETES 低于时退出至 USDC' : 'Exit to USDC if CETES drops below'}
                                            </p>
                                            <span className="text-xs font-black text-amber-400 font-mono">{reverseThreshold.toFixed(1)}%</span>
                                        </div>
                                        <input
                                            type="range"
                                            min={1.0} max={6.0} step={0.1}
                                            value={reverseThreshold}
                                            onChange={e => setReverseThreshold(parseFloat(e.target.value))}
                                            className="w-full h-1.5 accent-amber-400 cursor-pointer"
                                        />
                                        <div className="flex justify-between text-[9px] text-gray-600 font-mono mt-1">
                                            <span>1%</span>
                                            {(currentMarketState?.etherfuseApy ?? 0) > 0 ? (
                                                <span className="text-amber-400/60">
                                                    {language === 'es' ? 'Hoy' : 'Today'}: {currentMarketState!.etherfuseApy.toFixed(2)}%
                                                </span>
                                            ) : null}
                                            <span>6%</span>
                                        </div>
                                    </div>
                                )}
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <p className="text-xs font-bold text-white flex items-center gap-2">
                                            <Zap size={12} className={autoExit ? 'text-amber-400 animate-pulse' : 'text-gray-600'} />
                                            {t.dashboard.auto_exit.label}
                                        </p>
                                        <p className="text-[10px] text-gray-500 mt-0.5 font-mono">
                                            {autoExit
                                                ? `CETES < ${reverseThreshold.toFixed(1)}% — ${t.dashboard.auto_exit.enabled_desc}`
                                                : t.dashboard.auto_exit.disabled_desc}
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleAutoExitToggle}
                                        disabled={autoExitLoading || !delegationId}
                                        title={!delegationId ? t.dashboard.auto_exit.delegation_required : ''}
                                        className={`relative w-12 h-6 rounded-full transition-all duration-300 flex items-center shrink-0 ${
                                            autoExit ? 'bg-amber-400' : 'bg-white/10'
                                        } ${(autoExitLoading || !delegationId) ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                                    >
                                        <span className={`absolute w-4 h-4 bg-white rounded-full shadow-lg transition-all duration-300 ${autoExit ? 'left-7' : 'left-1'}`} />
                                    </button>
                                </div>
                            </div>
                        )}
                        {vaultId && baseAsset === 'XLM' && (
                            <div className="relative z-10 mt-4 pt-4 border-t border-white/5 flex items-center gap-2">
                                <Info size={11} className="text-gray-500 shrink-0" />
                                <p className="text-[10px] text-gray-500 font-mono">
                                    {t.dashboard.xlm_vault_info}
                                </p>
                            </div>
                        )}

                        {/* Background Glow Effect */}
                        <div className={`absolute -right-20 -bottom-20 w-64 h-64 rounded-full blur-[100px] opacity-10 transition-colors duration-1000 ${activeStrategies.length > 0 ? 'bg-green-500' : 'bg-stellar-teal'}`}></div>
                    </div>

                    {/* Fleet Grid Section */}
                    <div className="glass-panel rounded-2xl p-6 min-h-[400px]">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-sm text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <RefreshCw size={14} className={(activeStrategies.length > 0 || autoRebalance) ? "animate-spin-slow text-stellar-teal" : "text-gray-600"} />
                                {t.dashboard.stats.helpers} ({activeStrategies.length + (autoRebalance ? 1 : 0)}/10)
                            </h2>
                            {activeStrategies.length === 0 && !autoRebalance && (
                                <button onClick={handleDeploy} className="text-[10px] bg-stellar-yellow/10 text-stellar-yellow px-3 py-1.5 rounded-lg border border-stellar-yellow/20 hover:bg-stellar-yellow/20 transition-colors">
                                    {t.common.strategies}
                                </button>
                            )}
                        </div>

                        {(activeStrategies.length > 0 || autoRebalance || autoExit) ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Nirium Auto-Rebalance Agent Node */}
                                {autoRebalance && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-stellar-teal/5 border border-stellar-teal/30 rounded-xl p-4 flex flex-col relative overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-stellar-teal/5 to-transparent pointer-events-none" />
                                        <div className="flex justify-between items-start mb-2 relative z-10">
                                            <div className="flex items-center gap-2">
                                                <span className="text-2xl">🤖</span>
                                                <div>
                                                    <h3 className="font-bold text-sm leading-tight text-white">{t.dashboard.auto_rebalance.node_title}</h3>
                                                    <span className="text-[10px] text-stellar-teal font-mono flex items-center gap-1">
                                                        <span className="w-1.5 h-1.5 bg-stellar-teal rounded-full animate-pulse"></span>
                                                        {t.dashboard.auto_rebalance.agent_active}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 my-2 relative z-10">
                                            <div className="bg-black/30 rounded-lg p-2 text-center">
                                                <p className="text-[9px] text-gray-500 uppercase tracking-widest">{t.dashboard.auto_rebalance.node_trigger}</p>
                                                <p className="text-xs font-bold text-stellar-teal">CETES &gt; {rebalanceThreshold.toFixed(1)}%</p>
                                            </div>
                                            <div className="bg-black/30 rounded-lg p-2 text-center">
                                                <p className="text-[9px] text-gray-500 uppercase tracking-widest">{t.dashboard.auto_rebalance.node_vault}</p>
                                                <p className="text-xs font-bold text-white">#{vaultId}</p>
                                            </div>
                                        </div>
                                        <div className="mt-auto pt-3 border-t border-stellar-teal/10 flex gap-2 relative z-10 items-center justify-between">
                                            {delegationTxHash ? (
                                                <a
                                                    href={`https://stellar.expert/explorer/testnet/tx/${delegationTxHash}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-[10px] font-mono text-stellar-teal/70 hover:text-stellar-teal flex items-center gap-1 transition-colors"
                                                >
                                                    <ExternalLink size={9} />
                                                    Tx: {delegationTxHash.slice(0, 8)}...{delegationTxHash.slice(-4)}
                                                </a>
                                            ) : (
                                                <span className="text-[10px] font-mono text-gray-500">{t.dashboard.auto_rebalance.node_footer}</span>
                                            )}
                                            <button
                                                onClick={handleAutoRebalanceToggle}
                                                className="bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] px-2.5 py-1.5 rounded-lg border border-red-500/10 transition-colors"
                                            >
                                                STOP
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                                {/* Auto-Exit Node */}
                                {autoExit && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-amber-500/5 border border-amber-500/30 rounded-xl p-4 flex flex-col relative overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none" />
                                        <div className="flex justify-between items-start mb-2 relative z-10">
                                            <div className="flex items-center gap-2">
                                                <span className="text-2xl">🔄</span>
                                                <div>
                                                    <h3 className="font-bold text-sm leading-tight text-white">{t.dashboard.auto_exit.node_title}</h3>
                                                    <span className="text-[10px] text-amber-400 font-mono flex items-center gap-1">
                                                        <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse"></span>
                                                        {t.dashboard.auto_exit.agent_active}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 my-2 relative z-10">
                                            <div className="bg-black/30 rounded-lg p-2 text-center">
                                                <p className="text-[9px] text-gray-500 uppercase tracking-widest">{t.dashboard.auto_exit.node_trigger}</p>
                                                <p className="text-xs font-bold text-amber-400">CETES &lt; {reverseThreshold.toFixed(1)}%</p>
                                            </div>
                                            <div className="bg-black/30 rounded-lg p-2 text-center">
                                                <p className="text-[9px] text-gray-500 uppercase tracking-widest">{t.dashboard.auto_exit.node_vault}</p>
                                                <p className="text-xs font-bold text-white">#{vaultId}</p>
                                            </div>
                                        </div>
                                        <div className="mt-auto pt-3 border-t border-amber-500/10 flex gap-2 relative z-10 items-center justify-between">
                                            <span className="text-[10px] font-mono text-gray-500">{t.dashboard.auto_exit.node_footer}</span>
                                            <button
                                                onClick={handleAutoExitToggle}
                                                className="bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] px-2.5 py-1.5 rounded-lg border border-red-500/10 transition-colors"
                                            >
                                                STOP
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
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
                                                            {t.dashboard.stats.status_active}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-stellar-teal font-mono font-bold animate-pulse-slow">{dynamicYield} <span className="text-[9px] font-normal text-gray-500">est.</span></div>
                                                    <div className="text-[9px] text-gray-500">{t.dashboard.stats.efficiency}</div>
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
                                                    <span className="text-[10px] font-mono text-gray-500">Starting up...</span>
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
                                    <p className="text-gray-400 font-medium">{t.dashboard.no_helpers}</p>
                                    <p className="text-xs text-gray-600 max-w-xs mx-auto">{t.dashboard.onboarding_desc}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* x402 Protocol Revenue & M2M Streams */}
                    <div className="relative rounded-2xl h-[400px] flex flex-col mt-6 overflow-hidden">
                        <ProtocolRevenue />
                    </div>

                    {/* LIQUIDACIÓN B2B EN TIEMPO REAL — horizontal, below ProtocolRevenue */}
                    <PaymentStreams horizontal />
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
                        <div className="absolute -right-4 -top-4 h-48 w-48 opacity-40 pointer-events-none scale-150">
                            <ProtocolKernelSmall />
                        </div>

                        <h3 className="text-sm text-gray-400 uppercase tracking-widest mb-4 flex items-center justify-between">
                            {t.dashboard.your_helpers}
                            <span className="text-stellar-teal font-mono text-xs">{activeStrategies.length + (autoRebalance ? 1 : 0) + (autoExit ? 1 : 0)} ACTIVE</span>
                        </h3>

                        {activeStrategies.length === 0 && !autoRebalance && !autoExit ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center space-y-3 relative z-10">
                                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-gray-600">
                                    <span className="text-2xl">💤</span>
                                </div>
                                <p className="text-sm text-gray-400">{t.dashboard.no_helpers}</p>
                                <p className="text-[10px] text-gray-600 max-w-[180px]">{t.dashboard.no_helpers_desc}</p>
                                <button
                                    onClick={() => {
                                        // Scroll to vault section to enable auto-rebalance toggle
                                        document.querySelector('[data-vault-section]')?.scrollIntoView({ behavior: 'smooth' });
                                        if (!vaultId) toast.info(t.dashboard.no_helpers_desc);
                                    }}
                                    className="text-xs bg-stellar-yellow/10 text-stellar-yellow px-3 py-1.5 rounded-lg border border-stellar-yellow/20 hover:bg-stellar-yellow/20 transition-colors"
                                >
                                    {t.dashboard.start_first_node}
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
                                                <div className="text-[9px] text-gray-500">{t.dashboard.payment_streams.target_yield}</div>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setSelectedStrategy(strat); }}
                                                className="flex-1 min-w-[70px] py-1.5 rounded bg-white/5 border border-white/10 text-[9px] font-bold text-gray-400 hover:text-white transition-colors"
                                            >
                                                DETAILS
                                            </button>
                                            <div className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 px-2 py-1 rounded bg-stellar-blue/5 border border-stellar-blue/20">
                                                <Shield size={10} className="text-stellar-blue" />
                                                <span className="text-[8px] font-bold text-stellar-blue whitespace-nowrap uppercase tracking-tighter">
                                                    {t.common.atomic_execution} — AUDITED
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => stopStrategy(strat.id)}
                                                className="flex-none px-3 bg-red-500/10 hover:bg-red-500/20 text-[10px] py-1.5 rounded transition-colors text-red-400 border border-red-500/20"
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
                            <button
                                onClick={() => {
                                    const vaultSection = document.querySelector('[data-vault-section]');
                                    if (vaultSection) {
                                        vaultSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                        // Brief highlight
                                        (vaultSection as HTMLElement).style.transition = 'box-shadow 0.3s';
                                        (vaultSection as HTMLElement).style.boxShadow = '0 0 0 2px rgba(45,235,232,0.4)';
                                        setTimeout(() => { (vaultSection as HTMLElement).style.boxShadow = ''; }, 1500);
                                    }
                                    if (!vaultId) toast.info(t.dashboard.no_helpers_desc);
                                }}
                                className="w-full bg-white/5 hover:bg-white/10 text-[11px] font-bold py-2 rounded-xl transition-all border border-white/10 text-gray-300 flex items-center justify-center gap-2"
                            >
                                <Zap className="w-3 h-3 text-stellar-teal" />
                                {t.dashboard.add_node}
                            </button>
                            <Link href="/treasury/builder" className="w-full">
                                <button className="w-full bg-stellar-yellow/10 hover:bg-stellar-yellow/20 text-[11px] font-bold py-2 rounded-xl transition-all border border-stellar-yellow/20 text-stellar-yellow flex items-center justify-center gap-2">
                                    <Plus className="w-3 h-3" />
                                    {t.dashboard.build_node}
                                </button>
                            </Link>
                        </div>
                    </motion.div>

                    {/* CETES Reference Rate (replaces Blend/Phoenix) */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 }}
                        className="glass-panel p-4 rounded-xl border border-white/5"
                    >
                        <h3 className="text-xs text-gray-400 uppercase tracking-widest mb-3">{t.dashboard.payment_streams.market_rates}</h3>
                        <div className="bg-white/5 p-3 rounded-lg border border-stellar-teal/10 mb-3">
                            <div className="text-[10px] text-stellar-teal font-bold mb-2 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-stellar-teal animate-pulse"></span>
                                {t.dashboard.payment_streams.cetes_banxico}
                            </div>
                            <div className="flex justify-between items-end">
                                <span className="text-gray-400 text-xs">{t.dashboard.payment_streams.cetes_rate_label}</span>
                                <span className="text-stellar-teal font-mono text-xl font-black">
                                    {(currentMarketState?.etherfuseApy ?? 0) > 0
                                        ? `${currentMarketState!.etherfuseApy.toFixed(2)}%`
                                        : '...'}
                                </span>
                            </div>
                            <p className="text-[9px] text-gray-600 mt-1 font-mono">NON-FINANCIAL ADVICE · EST DATA</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-white/[0.03] p-2 rounded border border-white/5">
                                <p className="text-[9px] text-gray-500 uppercase tracking-wider mb-1">{t.dashboard.payment_streams.network_fee}</p>
                                <p className="text-xs font-mono text-white/70">
                                    {currentMarketState?.baseFee ? `${currentMarketState.baseFee} stroops` : '100 stroops'}
                                </p>
                            </div>
                            <div className="bg-white/[0.03] p-2 rounded border border-white/5">
                                <p className="text-[9px] text-gray-500 uppercase tracking-wider mb-1">{t.dashboard.payment_streams.corridors}</p>
                                <p className="text-xs font-mono text-white/70">
                                    {currentMarketState?.pathPaymentRoutes?.length ?? 0} XLM→USDC
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Telemetry Network Thought Process */}
                    <TelemetryFeed thoughts={thoughts} />

                    {/* Immutable IPFS Audit Trail — Deliverable 3 Instaward #1 */}
                    <AuditTrailViewer />
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
    const { t } = useLanguage();
    return (
        <main className="min-h-screen">
            {/* @ts-ignore - React 19 type mismatch in Next.js */}
            <Suspense fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-stellar-teal border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-stellar-teal font-mono animate-pulse">{t.dashboard.loading_dashboard}</p>
                    </div>
                </div>
            }>
                <DashboardContent />
            </Suspense>
        </main>
    )
}
