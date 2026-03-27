"use client";

import { SectionBrandLogo } from "@/components/ui/SectionBrandLogo";
import Navbar from "@/components/layout/Navbar";
import { Copy, ArrowRight, Zap, TrendingUp, ShieldAlert, Cpu, Plus } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Base Template Definitions
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
        name: "Memetic Volatility Hunter",
        description: "Monitors creating pools for high-velocity meme tokens. Enters and exits within the same block.",
        risk: "High",
        tags: ["Degen", "High Yield"],
        color: "from-purple-500 to-pink-500",
        baseApy: 420.69,
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
    },
    {
        id: "lending-loop-max",
        name: "Blend Recursive Yield",
        description: "Maximizes yield by recursively borrowing and supplying XLM across Blend protocol.",
        risk: "Medium",
        tags: ["Leverage", "Lending"],
        color: "from-indigo-500 to-blue-600",
        baseApy: 22.4,
        elo: 2037
    },
    {
        id: "blue-chip-dca",
        name: "Weighted DCA Accumulator",
        description: "Intelligently buys XLM dips using TWAP over 4-hour intervals. Best for long-term holding.",
        risk: "Low",
        tags: ["Savings", "Long Term"],
        color: "from-gray-700 to-gray-500",
        baseApy: 12.1,
        elo: 2104
    },
    {
        id: "stable-yield-agg",
        name: "Lending Optimization Loop",
        description: "Auto-rotates USDC capital between Blend and Phoenix to capture the highest lending rates.",
        risk: "Very Low",
        tags: ["Stablecoin", "Savings"],
        color: "from-teal-500 to-cyan-600",
        baseApy: 18.5,
        elo: 1427
    },
    {
        id: "soroswap-amm-active",
        name: "Soroswap AMM Position",
        description: "Concentrated liquidity provision with automated range rebalancing to maximize trading fees.",
        risk: "High",
        tags: ["Liquidity", "High Yield"],
        color: "from-pink-500 to-rose-500",
        baseApy: 65.4,
        elo: 1660
    },
    {
        id: "phoenix-delta-neutral",
        name: "Delta Neutral Phoenix Farmer",
        description: "Farms funding rates by longing Spot XLM and shorting Perp XLM. Market neutral strategy.",
        risk: "Low",
        tags: ["Hedging", "Complex"],
        color: "from-slate-800 to-blue-900",
        baseApy: 28.3,
        elo: 2167
    },
    {
        id: "mev-capture",
        name: "MEV Extraction Engine",
        description: "Front-runs low-slippage DEX transactions by detecting pending swaps in the mempool and executing ahead of them atomically.",
        risk: "High",
        tags: ["MEV", "Degen"],
        color: "from-orange-600 to-red-700",
        baseApy: 112.5,
        elo: 1892
    },
    {
        id: "perp-funding-arb",
        name: "Perp Funding Rate Arbitrage",
        description: "Continuously harvests positive funding rates on Bluefin perpetuals. Holds delta-neutral exposure to capture funding every 8 hours.",
        risk: "Low",
        tags: ["Derivatives", "Safe"],
        color: "from-violet-700 to-indigo-800",
        baseApy: 32.8,
        elo: 1987
    },
    {
        id: "pyth-oracle-sniper",
        name: "Oracle Latency Arbitrageur",
        description: "Exploits latency between on-chain Pyth price updates and DEX spot prices. Executes within the same block as oracle refresh.",
        risk: "Medium",
        tags: ["Oracle", "Technical"],
        color: "from-emerald-600 to-teal-700",
        baseApy: 58.1,
        elo: 1469
    },
    {
        id: "dual-yield-compounder",
        name: "Dual Token Yield Compounder",
        description: "Simultaneously earns XLM staking rewards and USDC lending yield by splitting capital across Blend and native validators.",
        risk: "Very Low",
        tags: ["Savings", "Staking"],
        color: "from-cyan-600 to-blue-700",
        baseApy: 19.3,
        elo: 1897
    },
    {
        id: "liquidation-hunter",
        name: "Liquidation Vector",
        description: "Monitors undercollateralized positions across Blend protocol. Triggers liquidations at protocol discount.",
        risk: "High",
        tags: ["Liquidation", "High Yield"],
        color: "from-red-700 to-rose-800",
        baseApy: 87.4,
        elo: 1573
    },
    {
        id: "cross-chain-bridge-arb",
        name: "Cross-Chain Spread Capture",
        description: "Detects price discrepancies between Stellar and other chains via Wormhole. Bridges and trades atomically before spread closes.",
        risk: "Medium",
        tags: ["Bridge", "Arbitrage"],
        color: "from-fuchsia-600 to-purple-700",
        baseApy: 41.7,
        elo: 1584
    },
];

import { useFreighter } from "@/hooks/useFreighter";

export default function StrategiesPage() {
    const { address: accountStr, isConnected } = useFreighter();
    const account = isConnected ? { address: accountStr, chains: ['stellar:testnet'] } : null;
    const router = useRouter();
    const [deployingId, setDeployingId] = useState<string | null>(null);
    const [selectedAssets, setSelectedAssets] = useState<Record<string, 'XLM' | 'USDC'>>({});
    const [strategies, setStrategies] = useState(BASE_STRATEGIES.map(s => ({
        ...s, apy: `${s.baseApy}%`, tvl: "Loading..."
    })));

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
                    dynamicApy = 50 + (Math.random() * 20 - 8);
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
        <main className="min-h-screen relative overflow-x-hidden flex flex-col pt-36 pb-20">
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
                                PROTOCOL <span className="text-stellar-teal italic">ARSENAL</span>
                            </h1>
                            <p className="text-gray-400 max-w-2xl text-lg leading-relaxed">
                                Deploy autonomous kernels to the Stellar Network targeting <span className="text-stellar-teal font-bold uppercase tracking-widest text-[11px] border border-stellar-teal/20 px-2 rounded ml-1 mr-1">XLM</span> or <span className="text-stellar-yellow font-bold uppercase tracking-widest text-[11px] border border-stellar-yellow/20 px-2 rounded">USDC</span> vaults.
                            </p>
                        </div>
                    </div>

                    {/* Stats or Action */}
                    <Link href="/strategies/builder" className="group relative px-8 py-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all overflow-hidden hidden xl:block">
                        <div className="absolute inset-0 bg-gradient-to-r from-stellar-teal/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative flex items-center gap-3">
                            <Plus className="w-5 h-5 text-stellar-teal" />
                            <div className="text-left">
                                <div className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-1">Architect Unit</div>
                                <div className="text-sm font-bold text-white tracking-tight leading-none group-hover:text-stellar-teal transition-colors">Launch Strategy Builder</div>
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
                                    SECURE KERNEL v0.0.7
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
                        </motion.div>
                    ))}

                    {/* "Create New" Card */}
                    <Link href="/strategies/builder" className="border border-dashed border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-4 hover:bg-white/5 hover:border-stellar-teal/30 transition-all text-gray-400 hover:text-white cursor-pointer min-h-[400px] group">
                        <div className="w-16 h-16 rounded-full bg-white/5 group-hover:bg-stellar-teal/10 flex items-center justify-center mb-2 transition-colors border border-white/5 group-hover:border-stellar-teal/20">
                            <Zap size={32} className="group-hover:text-stellar-teal transition-colors" />
                        </div>
                        <h3 className="text-xl font-bold font-mono tracking-tight group-hover:text-stellar-teal transition-colors">ARCHITECT NEW PROTOCOL</h3>
                        <p className="text-sm max-w-xs text-gray-400">
                            Visual drag-and-drop Builder with 6 node categories:<br />
                            <span className="text-stellar-teal font-mono text-[10px] uppercase">Atomic Engine · AI Intelligence · Swaps · Security · Social · Signals</span>
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-[10px] font-mono bg-blue-500/10 text-[#4ca2ff] px-2 py-0.5 rounded">XLM</span>
                            <span className="text-[10px] font-mono bg-stellar-yellow/10 text-stellar-yellow px-2 py-0.5 rounded">USDC</span>
                            <span className="text-[10px] font-mono bg-white/5 text-gray-500 px-2 py-0.5 rounded">+ Export Schema</span>
                        </div>
                    </Link>
                </div>
            </div>
        </main>
    )
}
