"use client";

import { SectionBrandLogo } from "@/components/ui/SectionBrandLogo";
import Navbar from "@/components/layout/Navbar";
import { Copy, ArrowRight, Zap, TrendingUp, ShieldAlert, Cpu, Plus, Sparkles, Download, Star, Code2, UserPlus, Database, Bell, Settings, BarChart3, Link2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import InstallSkillModal from "@/components/marketplace/InstallSkillModal";

const BASE_STRATEGIES = [
    {
        id: "nirium-usdc-loop",
        name: "XLM-USDC Kinetic Vector",
        description: "High-frequency triangular arbitrage secured by Soroban multi-op transactions. Executes only when spread > 0.4% with atomic safety.",
        risk: "Low",
        tags: ["Stable", "Blue Chip"],
        color: "from-blue-500 to-cyan-500",
        baseApy: 14.2,
        elo: 2127
    },
    {
        id: "turbo-sniper",
        name: "Micro-Liquidity Optimizer",
        description: "Responds to sudden liquidity events and market inefficiencies in new Soroban pools. High-speed execution with risk-managed entry/exit.",
        risk: "High",
        tags: ["Volatility", "DeFi"],
        color: "from-purple-500 to-pink-500",
        baseApy: 32.8,
        elo: 1541
    },
    {
        id: "liquid-staking-arb",
        name: "LST Peg Restoration",
        description: "Arbitrages de-pegged afXLM/vXLM against native XLM during unstaking epochs.",
        risk: "Very Low",
        tags: ["Safe", "Institutional"],
        color: "from-green-500 to-emerald-500",
        baseApy: 8.5,
        elo: 1454
    },
    {
        id: "eliza-sentiment",
        name: "Eliza Sentiment Engine",
        description: "AI-driven strategy that scans X/Twitter for bullish sentiment signals on XLM ecosystem tokens.",
        risk: "Medium",
        tags: ["AI Agent", "Social"],
        color: "from-orange-500 to-red-500",
        baseApy: 45.2,
        elo: 1609
    }
];

const CATEGORY_ICONS: Record<string, any> = {
    trading: TrendingUp,
    analysis: BarChart3,
    notification: Bell,
    integration: Link2,
    data: Database,
    utility: Settings
};

const CATEGORY_COLORS: Record<string, string> = {
    trading: "from-emerald-500 to-green-600",
    analysis: "from-blue-500 to-indigo-600",
    notification: "from-orange-500 to-amber-600",
    integration: "from-purple-500 to-violet-600",
    data: "from-cyan-500 to-teal-600",
    utility: "from-gray-500 to-slate-600"
};

const BASE_PLUGINS = [
    {
        id: "flash-loan-executor",
        name: "Flash Loan Executor",
        slug: "flash-loan-executor",
        description: "EXECUTE ATOMIC FLASH LOANS USING SOROBAN SINGLE-INVOCATION PRIMITIVES. BILLED VIA X402.",
        category: "trading",
        tags: ["flash-loan", "stellar", "x402"],
        color: "from-emerald-500 to-green-600",
        downloads: 12500,
        elo: 1200,
        isPremium: false,
        price: null
    },
    {
        id: "price-oracle",
        name: "Multi-Source Price Oracle",
        slug: "price-oracle",
        description: "AGGREGATE PRICES FROM COINGECKO, DEFILLAMA, PYTH. REAL-TIME MPP SUBSCRIPTION.",
        category: "data",
        tags: ["oracle", "price", "MPP"],
        color: "from-cyan-500 to-teal-600",
        downloads: 8900,
        elo: 1200,
        isPremium: true,
        price: "1.00 USDC/mo"
    },
    {
        id: "telegram-alerts-pro",
        name: "Telegram Alerts Pro",
        slug: "telegram-alerts-pro",
        description: "ADVANCED TELEGRAM NOTIFICATIONS WITH RICH FORMATTING. MPP ENABLED.",
        category: "notification",
        tags: ["telegram", "alerts", "MPP"],
        color: "from-orange-500 to-amber-600",
        downloads: 15700,
        elo: 1200,
        isPremium: true,
        price: "1.00 USDC/mo"
    },
    {
        id: "soroswap-lp-manager",
        name: "Soroswap LP Manager",
        slug: "soroswap-lp-manager",
        description: "AUTOMATED REBALANCE AND YIELD FARMING FOR SOROSWAP LIQUIDITY POOLS.",
        category: "trading",
        tags: ["soroswap", "lp"],
        color: "from-pink-500 to-rose-500",
        downloads: 6789,
        elo: 1200,
        isPremium: true,
        price: "0.50 USDC/mo"
    },
    {
        id: "ipfs-blackbox-logger",
        name: "IPFS Blackbox Logger",
        slug: "ipfs-blackbox-logger",
        description: "ARCHIVES ALL AGENT EXECUTION LOGS TO DECENTRALIZED IPFS STORAGE FOR AUDIT.",
        category: "utility",
        tags: ["ipfs", "audit", "logs"],
        color: "from-gray-500 to-slate-500",
        downloads: 2980,
        elo: 1200,
        isPremium: false,
        price: null
    },
    {
        id: "eliza-trading-brain",
        name: "ElizaOS Trading Brain",
        slug: "eliza-trading-brain",
        description: "EMBEDS AN ELIZAOS AI AGENT AS A DECISION-MAKING LAYER FOR TRADING STRATEGIES.",
        category: "analysis",
        tags: ["eliza", "ai"],
        color: "from-blue-500 to-indigo-600",
        downloads: 7654,
        elo: 1200,
        isPremium: false,
        price: null
    }
];

import { useFreighter } from "@/hooks/useFreighter";

export default function StrategiesPage() {
    const { address: accountStr, isConnected } = useFreighter();
    const account = isConnected ? { address: accountStr, chains: ['stellar:testnet'] } : null;
    const router = useRouter();
    const [deployingId, setDeployingId] = useState<string | null>(null);
    const [selectedAssets, setSelectedAssets] = useState<Record<string, 'XLM' | 'USDC'>>({});
    const [installedSkills, setInstalledSkills] = useState<{ [key: string]: boolean }>({});
    const [selectedSkillToInstall, setSelectedSkillToInstall] = useState<any | null>(null);
    const [strategies, setStrategies] = useState(BASE_STRATEGIES.map(s => ({
        ...s, apy: `${s.baseApy}%`, tvl: "Loading..."
    })));
    const [plugins, setPlugins] = useState(BASE_PLUGINS);

    // Load Live Market Data (Simulated Realism)
    useEffect(() => {
        const fetchMarketData = async () => {
            // Simulate API latency
            await new Promise(r => setTimeout(r, 600));

            // Dynamic updates based on "current market conditions"
            const updated = BASE_STRATEGIES.map(s => {
                let dynamicApy = s.baseApy;
                let dynamicTvl = 0;

                // Add market fluctuation noise
                if (s.id === 'turbo-sniper') {
                    // Meme coins are volatile
                    dynamicApy += (Math.random() * 50 - 20);
                    dynamicTvl = 450 + Math.random() * 50;
                } else if (s.id === 'liquid-staking-arb') {
                    // LST is more stable but fluctuates with epoch
                    dynamicApy = 8 + (Math.random() * 1.5);
                    dynamicTvl = 2800 + Math.random() * 100;
                } else if (s.id === 'eliza-sentiment') {
                    dynamicApy += (Math.random() > 0.8 ? 15 : -5);
                    dynamicTvl = 800 + Math.random() * 200;
                } else if (s.id === 'lending-loop-max') {
                    dynamicApy += (Math.random() * 2 - 1);
                    dynamicTvl = 5200 + Math.random() * 50;
                } else if (s.id === 'blue-chip-dca') {
                    dynamicApy = 12 + (Math.random() * 0.2);
                    dynamicTvl = 15000 + Math.random() * 500;
                } else if (s.id === 'stable-yield-agg') {
                    dynamicApy = 18 + (Math.random() * 1.5);
                    dynamicTvl = 8500 + Math.random() * 100;
                } else if (s.id === 'soroswap-clmm-active') {
                    dynamicApy += (Math.random() * 20 - 10);
                    dynamicTvl = 600 + Math.random() * 50;
                } else if (s.id === 'bluefin-delta-neutral') {
                    dynamicApy = 28 + (Math.random() * 4 - 2);
                    dynamicTvl = 3200 + Math.random() * 150;
                } else if (s.id === 'mev-capture') {
                    dynamicApy = 90 + (Math.random() * 60 - 20);
                    dynamicTvl = 380 + Math.random() * 80;
                } else if (s.id === 'perp-funding-arb') {
                    dynamicApy = 30 + (Math.random() * 6 - 2);
                    dynamicTvl = 2100 + Math.random() * 120;
                } else if (s.id === 'pyth-oracle-sniper') {
                    dynamicApy = 18 + (Math.random() * 4 - 2);
                    dynamicTvl = 720 + Math.random() * 60;
                } else if (s.id === 'dual-yield-compounder') {
                    dynamicApy = 19 + (Math.random() * 1.5);
                    dynamicTvl = 6800 + Math.random() * 200;
                } else if (s.id === 'liquidation-hunter') {
                    dynamicApy = 75 + (Math.random() * 30 - 10);
                    dynamicTvl = 540 + Math.random() * 100;
                } else if (s.id === 'cross-chain-bridge-arb') {
                    dynamicApy = 38 + (Math.random() * 10 - 4);
                    dynamicTvl = 1450 + Math.random() * 90;
                } else {
                    // Kinetic loop depends on volume
                    dynamicApy = 12 + (Math.random() * 4);
                    dynamicTvl = 1200 + Math.random() * 50;
                }

                return {
                    ...s,
                    apy: `${dynamicApy.toFixed(2)}%`,
                    tvl: `$${dynamicTvl.toFixed(0)}K`
                };
            });
            setStrategies(updated);
        };

        fetchMarketData();
        const interval = setInterval(fetchMarketData, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleDeploy = async (strategy: typeof strategies[0]) => {
        if (!account?.address) {
            toast.error("Connect Wallet to deploy strategies");
            return;
        }

        setDeployingId(strategy.id);
        const toastId = toast.loading(`Initializing ${strategy.name}...`);

        try {
            // Import Service
            const { StrategyService } = await import("@/lib/strategyService");

            // 1. Persist Strategy as DRAFT immediately (so it appears in dashboard)
            await StrategyService.deployStrategy(account.address, {
                strategy_id: strategy.id,
                name: strategy.name,
                emoji: '⚡',
                status: 'DRAFT',  // Will be updated to RUNNING after tx confirmation in Dashboard
                yield: strategy.apy,
                created_at: new Date().toISOString()
            });

            toast.dismiss(toastId);
            toast.success("Strategy Template Loaded", { duration: 1000 });

            // 2. Redirect to Dashboard with Auto-Start, name, and selected asset for immediate display
            const targetAsset = selectedAssets[strategy.id] || 'XLM';
            router.push(`/dashboard?autostart=true&strategy=${strategy.id}&name=${encodeURIComponent(strategy.name)}&asset=${targetAsset}`);

        } catch (e) {
            console.error(e);
            toast.error("Failed to initialize strategy");
        } finally {
            setDeployingId(null);
        }
    };

    return (
        <main className="min-h-screen relative overflow-x-hidden flex flex-col pt-56 pb-20">
            {/* Background elements */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-stellar-yellow/20 rounded-full blur-[120px] opacity-50"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-stellar-teal/10 rounded-full blur-[120px] opacity-50"></div>
            </div>

            <Navbar />

            <div className="max-w-[1600px] w-full mx-auto px-6 relative z-10">

                {/* Header */}
                <div className="flex flex-col lg:flex-row items-center lg:items-center justify-between gap-12 mb-20 px-4">
                    <div className="flex flex-col lg:flex-row items-center lg:items-center gap-8">
                        <SectionBrandLogo className="!justify-start mb-0" size="w-32 lg:w-48" />
                        <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 leading-none uppercase">
                                PROTOCOL <span className="text-stellar-teal italic">MARKETPLACE</span>
                            </h1>
                            <p className="text-gray-400 max-w-2xl text-lg leading-relaxed">
                                Deploy autonomous kernels to the Stellar Network targeting <span className="text-stellar-teal font-bold uppercase tracking-widest text-[11px] border border-stellar-teal/20 px-2 rounded ml-1 mr-1">XLM</span> or <span className="text-stellar-yellow font-bold uppercase tracking-widest text-[11px] border border-stellar-yellow/20 px-2 rounded">USDC</span> vaults. <span className="text-[10px] text-gray-500 block mt-2 italic font-mono uppercase tracking-widest">// Aligned with Stellar Code of Conduct & SCF 7.0 Merit Criteria</span>
                            </p>
                        </div>
                    </div>

                    {/* Stats or Action */}
                    <Link href="/treasury" className="group relative px-8 py-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all overflow-hidden hidden xl:block">
                        <div className="absolute inset-0 bg-gradient-to-r from-stellar-teal/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative flex items-center gap-3">
                            <Plus className="w-5 h-5 text-stellar-teal" />
                            <div className="text-left">
                                <div className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-1">Architect Unit</div>
                                <div className="text-sm font-bold text-white tracking-tight leading-none group-hover:text-stellar-teal transition-colors">Launch Treasury Builder</div>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Strategies Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {strategies.map((strat, i) => (
                        <motion.div
                            key={strat.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ y: -5 }}
                            className="bg-[#080808] p-6 rounded-2xl flex flex-col border border-white/5 hover:border-stellar-teal/30 hover:shadow-[0_0_30px_rgba(45,235,232,0.1)] transition-all group"
                        >
                            <div className={`h-32 w-full rounded-xl bg-white/5 border-b border-white/5 mb-6 relative overflow-hidden`}>
                                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] to-transparent"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Cpu size={48} className="text-white opacity-90 drop-shadow-lg" />
                                </div>
                                <div className="absolute top-2 right-2 bg-black/40 backdrop-blur-md px-2 py-1 rounded text-xs font-mono border border-white/10 flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                    SECURE KERNEL v0.5.0
                                </div>
                            </div>

                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-2xl font-black tracking-tighter text-white">{strat.name}</h3>
                                <div className={`text-[10px] px-2 py-1 rounded font-bold font-mono uppercase ${strat.risk === 'Very Low' ? 'bg-emerald-500/20 text-emerald-400' :
                                    strat.risk === 'Low' ? 'bg-green-500/20 text-green-400' :
                                        strat.risk === 'Medium' ? 'bg-amber-500/20 text-amber-400' :
                                            'bg-red-500/20 text-red-400'
                                    }`}>
                                    {strat.risk} Risk
                                </div>
                            </div>

                            <p className="text-xs text-gray-400 mb-4 flex-1 leading-relaxed">
                                {strat.description}
                            </p>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-1.5 mb-5">
                                {strat.tags.map(tag => (
                                    <span key={tag} className="text-[9px] font-mono uppercase tracking-wide px-2 py-0.5 rounded bg-white/5 border border-white/10 text-gray-400">
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="bg-[#111] border border-white/5 rounded-lg p-3 group-hover:border-stellar-teal/20 transition-colors">
                                    <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Alpha Coefficient</div>
                                    <div className="text-xl font-mono text-stellar-teal animate-pulse-slow">{strat.apy}</div>
                                </div>
                                <div className="bg-[#111] border border-white/5 rounded-lg p-3 group-hover:border-white/10 transition-colors">
                                    <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Liquidity Depth</div>
                                    <div className="text-xl font-mono text-white">{strat.tvl}</div>
                                </div>
                            </div>

                            {/* ELO & MATRIX FEE SUMMARY */}
                            <div className="bg-[#111] border border-white/5 rounded-lg p-3 mb-6 group-hover:border-white/10 transition-colors relative overflow-hidden">
                                <div className="flex justify-between items-center mb-1 relative z-10">
                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">CREATOR ELO</span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${strat.elo >= 2000 ? "bg-purple-500/20 text-purple-400" : strat.elo >= 1800 ? "bg-yellow-500/20 text-yellow-500" : "bg-slate-500/20 text-slate-400"}`}>
                                        {strat.elo >= 2000 ? "Matrix Tier" : strat.elo >= 1800 ? "Gold Tier" : "Silver Tier"}
                                    </span>
                                </div>
                                <div className="text-sm font-mono text-white mb-2 relative z-10 font-bold">{strat.elo}</div>

                                <div className="flex justify-between items-center pt-2 border-t border-white/5 relative z-10">
                                    <span className="text-[10px] text-gray-500 uppercase tracking-widest">PROTOCOL FEE</span>
                                    <span className="text-[10px] text-stellar-teal font-mono font-bold">1% ON PROFITS</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center mb-4">
                                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">TARGET VAULT</span>
                                <div className="flex items-center bg-black/40 border border-white/10 rounded-lg p-1">
                                    <button
                                        onClick={() => setSelectedAssets({ ...selectedAssets, [strat.id]: 'USDC' })}
                                        className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${(selectedAssets[strat.id] || 'XLM') === 'USDC' ? 'bg-stellar-yellow text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                                    >
                                        USDC
                                    </button>
                                    <button
                                        onClick={() => setSelectedAssets({ ...selectedAssets, [strat.id]: 'XLM' })}
                                        className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${(selectedAssets[strat.id] || 'XLM') === 'XLM' ? 'bg-[#4ca2ff] text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                                    >
                                        XLM
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-2 mt-auto">
                                <button
                                    onClick={() => toast.info('Backtesting module coming soon — compile this kernel in the Builder to preview performance.', { duration: 3000 })}
                                    className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 group-hover:bg-white/10 font-mono">
                                    <Copy size={16} /> BACKTEST
                                </button>
                                <button
                                    onClick={() => handleDeploy(strat)}
                                    disabled={deployingId === strat.id}
                                    className="flex-1 bg-stellar-yellow text-black py-3 rounded-lg text-sm font-bold hover:shadow-[0_0_20px_rgba(255,200,0,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-mono">
                                    {deployingId === strat.id ? (
                                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <>INITIALIZE <ArrowRight size={16} /></>
                                    )}
                                </button>
                            </div>
                            <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2 text-[8px] text-gray-600 uppercase tracking-widest font-mono italic">
                                <ShieldAlert size={10} className="text-gray-700" />
                                <span>Follows Stellar Community Ethics</span>
                            </div>
                        </motion.div>
                    ))}

                    {/* "Create New" Card */}
                    <Link href="/treasury" className="border border-dashed border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-4 hover:bg-white/5 hover:border-stellar-teal/30 transition-all text-gray-400 hover:text-white cursor-pointer min-h-[400px] group">
                        <div className="w-16 h-16 rounded-full bg-white/5 group-hover:bg-stellar-teal/10 flex items-center justify-center mb-2 transition-colors border border-white/5 group-hover:border-stellar-teal/20">
                            <Zap size={32} className="group-hover:text-stellar-teal transition-colors" />
                        </div>
                        <h3 className="text-xl font-bold font-mono tracking-tight group-hover:text-stellar-teal transition-colors">ARCHITECT TREASURY RULES</h3>
                        <p className="text-sm max-w-xs text-gray-400">
                            Visual drag-and-drop Builder for institutional flows:<br />
                            <span className="text-stellar-teal font-mono text-[10px] uppercase">Fiat Integrations · Triggers · Allocation · Compliance</span>
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-[10px] font-mono bg-blue-500/10 text-[#4ca2ff] px-2 py-0.5 rounded">XLM</span>
                            <span className="text-[10px] font-mono bg-stellar-yellow/10 text-stellar-yellow px-2 py-0.5 rounded">USDC</span>
                            <span className="text-[10px] font-mono bg-white/5 text-gray-500 px-2 py-0.5 rounded">+ Export Schema</span>
                        </div>
                    </Link>
                </div>

                {/* Plugins Section */}
                <div className="mt-32 mb-12">
                    <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic leading-none text-white">
                        PROTOCOL <span className="text-stellar-yellow">PLUGINS</span>
                    </h2>
                    <p className="text-gray-400 max-w-2xl text-lg mt-4 leading-relaxed">
                        Extend your agent's capabilities with modular on-chain integrations and data feeds.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plugins.map((skill, idx) => (
                        <motion.div
                            key={skill.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + idx * 0.1 }}
                            className="group relative overflow-hidden flex flex-col rounded-2xl bg-[#080808] border border-white/5 p-6 hover:border-stellar-teal/50 hover:shadow-[0_0_30px_rgba(45,235,232,0.1)] transition-all cursor-pointer"
                        >
                            {skill.isPremium && (
                                <div className="absolute top-4 right-4">
                                    <span className="px-2 py-1 text-xs bg-stellar-yellow/20 text-stellar-yellow rounded-full flex items-center gap-1">
                                        <Sparkles className="w-3 h-3" /> Premium
                                    </span>
                                </div>
                            )}

                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${CATEGORY_COLORS[skill.category] || 'from-slate-500 to-slate-600'} flex items-center justify-center mb-4`}>
                                {(() => {
                                    const Icon = CATEGORY_ICONS[skill.category] || Code2;
                                    return <Icon className="w-6 h-6 text-white" />;
                                })()}
                            </div>

                            <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-stellar-teal transition-colors">
                                {skill.name}
                            </h3>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1 mb-6 flex-1 line-clamp-2">
                                {skill.description}
                            </p>

                            <div className="flex items-center justify-between text-sm text-slate-500 mt-auto pt-4 border-t border-white/5">
                                <div className="flex items-center gap-3">
                                    <span className="flex items-center gap-1">
                                        <Download className="w-4 h-4" />
                                        {(skill.downloads / 1000).toFixed(1)}K
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                        {skill.elo}
                                    </span>
                                </div>

                                {installedSkills[skill.id] || installedSkills[skill.slug] ? (
                                    <div className="flex gap-2 z-20 relative">
                                        <Link href="/agents">
                                            <button
                                                onClick={(e) => e.stopPropagation()}
                                                className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 text-green-400 rounded-lg hover:bg-green-500/20 text-sm font-medium transition-colors border border-green-500/20"
                                            >
                                                <span className="relative flex h-2 w-2">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                                </span>
                                                Monitor
                                            </button>
                                        </Link>

                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setSelectedSkillToInstall(skill);
                                            }}
                                            className="flex items-center justify-center p-2 bg-stellar-teal/10 text-stellar-teal rounded-lg hover:bg-stellar-teal/20 transition-all border border-stellar-teal/20"
                                            title="Install to another unit"
                                        >
                                            <UserPlus size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedSkillToInstall(skill);
                                        }}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors border z-10 relative ${
                                            skill.isPremium 
                                            ? 'bg-stellar-teal/20 hover:bg-stellar-teal text-white border-stellar-teal/50 hover:text-black shadow-lg shadow-stellar-teal/5' 
                                            : 'bg-slate-700/50 hover:bg-stellar-yellow hover:text-black text-white border-slate-600/50 hover:border-stellar-yellow'
                                        }`}
                                    >
                                        <Zap className="w-3.5 h-3.5" />
                                        {skill.isPremium ? `Pay ${skill.price}` : 'Install'}
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            <InstallSkillModal
                skill={selectedSkillToInstall}
                isOpen={!!selectedSkillToInstall}
                onClose={() => setSelectedSkillToInstall(null)}
                onInstall={() => {
                    setInstalledSkills((prev) => ({ ...prev, [selectedSkillToInstall?.id]: true }));
                    setSelectedSkillToInstall(null);
                    toast.success(`${selectedSkillToInstall?.name} installed successfully!`);
                }}
            />
        </main>
    )
}
