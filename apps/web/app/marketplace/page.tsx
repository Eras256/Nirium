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
import { useX402 } from "@/hooks/useX402";
import { StrategyService } from "@/lib/strategyService";
import { useLanguage } from "@/context/LanguageContext";
import { useFreighter } from "@/hooks/useFreighter";

const BASE_STRATEGIES = [
    {
        id: "nirium-usdc-loop",
        risk: "low",
        tags: ["Stable", "Blue Chip"],
        color: "from-blue-500 to-cyan-500",
        baseApy: 14.2,
        elo: 2127
    },
    {
        id: "turbo-sniper",
        risk: "high",
        tags: ["Degen", "High Yield"],
        color: "from-purple-500 to-pink-500",
        baseApy: 420.69,
        elo: 1541
    },
    {
        id: "liquid-staking-arb",
        risk: "very_low",
        tags: ["Safe", "Institutional"],
        color: "from-green-500 to-emerald-500",
        baseApy: 8.5,
        elo: 1454
    },
    {
        id: "eliza-sentiment",
        risk: "medium",
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
        slug: "flash-loan-executor",
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
        slug: "price-oracle",
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
        slug: "telegram-alerts-pro",
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
        slug: "soroswap-lp-manager",
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
        slug: "ipfs-blackbox-logger",
        category: "utility",
        tags: ["ipfs", "audit", "logs"],
        color: "from-gray-500 to-slate-500",
        downloads: 2980,
        elo: 1200,
        isPremium: false,
        price: null
    },
];

export default function StrategiesPage() {
    const { t } = useLanguage();
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
    const [isInstalling, setIsInstalling] = useState(false);
    const { fetchPaid } = useX402();

    const handleInstall = async (agentId: string) => {
        if (!selectedSkillToInstall) return;
        
        setIsInstalling(true);
        const skill = selectedSkillToInstall;
        const localizedSkill = t.marketplace.plugins.items[skill.id as keyof typeof t.marketplace.plugins.items] || { name: skill.id };
        const toastId = toast.loading(`Installing ${localizedSkill.name} to unit ${agentId}...`);

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.nirium.xyz";
            const response = await fetchPaid(`${API_URL}/api/marketplace/install/${skill.id || skill.slug}`, {
                method: 'POST',
                headers: {
                    'x-stellar-account': account?.address || ""
                }
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || "Installation failed");
            }

            const result = await response.json();

            await StrategyService.registerSkill(account?.address || "anonymous", skill.id || skill.slug, {
                agentId,
                txHash: result.txHash
            });

            setInstalledSkills((prev) => ({ ...prev, [skill.id]: true }));
            
            toast.dismiss(toastId);
            toast.success(`${localizedSkill.name} integrated successfully into unit ${agentId}!`, {
                description: result.message || "Capability online.",
                duration: 5000
            });

            setSelectedSkillToInstall(null);
        } catch (error: any) {
            console.error(error);
            toast.dismiss(toastId);
            toast.error("Installation failed", {
                description: error.message
            });
        } finally {
            setIsInstalling(false);
        }
    };

    useEffect(() => {
        if (account?.address) {
            StrategyService.getInstalledSkills(account.address).then(setInstalledSkills);
        }
    }, [account?.address]);

    useEffect(() => {
        const fetchMarketData = async () => {
            await new Promise(r => setTimeout(r, 600));

            const updated = BASE_STRATEGIES.map(s => {
                let dynamicApy = s.baseApy;
                let dynamicTvl = 0;

                if (s.id === 'turbo-sniper') {
                    dynamicApy += (Math.random() * 50 - 20);
                    dynamicTvl = 450 + Math.random() * 50;
                } else if (s.id === 'liquid-staking-arb') {
                    dynamicApy = 8 + (Math.random() * 1.5);
                    dynamicTvl = 2800 + Math.random() * 100;
                } else if (s.id === 'eliza-sentiment') {
                    dynamicApy += (Math.random() > 0.8 ? 15 : -5);
                    dynamicTvl = 800 + Math.random() * 200;
                } else {
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
        const localized = t.marketplace.strategies.items[strategy.id as keyof typeof t.marketplace.strategies.items];
        const toastId = toast.loading(`Initializing ${localized.name}...`);

        try {
            await StrategyService.deployStrategy(account.address, {
                strategy_id: strategy.id,
                name: localized.name,
                emoji: '⚡',
                status: 'DRAFT', 
                yield: strategy.apy,
                created_at: new Date().toISOString()
            });

            toast.dismiss(toastId);
            toast.success("Strategy Template Loaded", { duration: 1000 });

            const targetAsset = selectedAssets[strategy.id] || 'XLM';
            router.push(`/dashboard?autostart=true&strategy=${strategy.id}&name=${encodeURIComponent(localized.name)}&asset=${targetAsset}`);

        } catch (e) {
            console.error(e);
            toast.error("Failed to initialize strategy");
        } finally {
            setDeployingId(null);
        }
    };

    return (
        <main className="min-h-screen relative overflow-x-hidden flex flex-col pt-32 sm:pt-40 md:pt-48 lg:pt-56 pb-20">
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-stellar-yellow/10 rounded-full blur-[120px] opacity-40"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-stellar-teal/5 rounded-full blur-[120px] opacity-40"></div>
            </div>

            <Navbar />

            <div className="max-w-[1600px] w-full mx-auto px-6 relative z-10">

                <div className="flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-12 mb-16 lg:mb-24 px-2 sm:px-4">
                    <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
                        <SectionBrandLogo className="!justify-start mb-0" size="w-24 sm:w-32 lg:w-48" />
                        <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-4 leading-[0.85] uppercase flex flex-wrap justify-center lg:justify-start gap-x-3 sm:gap-x-4">
                                {t.marketplace.header.title} <span className="text-stellar-teal italic">{t.marketplace.header.span}</span>
                            </h1>
                            <p className="text-gray-400 max-w-2xl text-base sm:text-lg leading-relaxed font-medium">
                                {t.marketplace.header.subtitle}
                            </p>
                        </div>
                    </div>

                    <Link href="/treasury" className="group relative px-10 py-5 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-all overflow-hidden hidden xl:block shadow-2xl">
                        <div className="absolute inset-0 bg-gradient-to-r from-stellar-teal/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-stellar-teal/10 flex items-center justify-center border border-stellar-teal/20 group-hover:scale-110 transition-transform">
                                <Plus className="w-6 h-6 text-stellar-teal" />
                            </div>
                            <div className="text-left">
                                <div className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.3em] mb-1">{t.marketplace.builder_cta.title}</div>
                                <div className="text-base font-bold text-white tracking-tight leading-none group-hover:text-stellar-teal transition-colors">{t.marketplace.builder_cta.subtitle}</div>
                            </div>
                        </div>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {strategies.map((strat, i) => {
                        const localized = t.marketplace.strategies.items[strat.id as keyof typeof t.marketplace.strategies.items];
                        const riskKey = strat.risk as keyof typeof t.marketplace.strategies.risk_levels;
                        
                        return (
                            <motion.div
                                key={strat.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1, type: "spring", stiffness: 100 }}
                                whileHover={{ y: -8 }}
                                className="bg-[#080808] p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] flex flex-col border border-white/5 hover:border-stellar-teal/30 hover:shadow-[0_0_50px_rgba(45,235,232,0.05)] transition-all group relative overflow-hidden"
                            >
                                <div className={`aspect-video w-full rounded-2xl bg-white/5 border border-white/5 mb-8 relative overflow-hidden group-hover:bg-white/[0.08] transition-colors`}>
                                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#080808]/80 group-hover:to-[#080808]/60 transition-all"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Cpu size={56} className="text-white/20 group-hover:text-stellar-teal/40 group-hover:scale-110 transition-all duration-500" />
                                    </div>
                                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-xl px-3 py-1.5 rounded-xl text-[10px] font-bold font-mono border border-white/10 flex items-center gap-2 group-hover:border-stellar-teal/30 transition-colors">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                        {t.marketplace.strategies.buttons.verified} v0.5.0
                                    </div>
                                </div>

                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="text-2xl font-black tracking-tighter text-white group-hover:text-stellar-teal transition-colors">
                                        {localized.name}
                                    </h3>
                                    <div className={`text-[10px] px-2.5 py-1 rounded-lg font-black font-mono uppercase tracking-wider ${
                                        strat.risk === 'very_low' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                        strat.risk === 'low' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                        strat.risk === 'medium' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                                        'bg-red-500/10 text-red-500 border border-red-500/20'
                                    }`}>
                                        {t.marketplace.strategies.risk_levels[riskKey]} {t.marketplace.strategies.risk_levels.risk_label}
                                    </div>
                                </div>

                                <p className="text-sm text-gray-400 mb-6 flex-1 leading-relaxed font-medium">
                                    {localized.description}
                                </p>

                                <div className="flex flex-wrap gap-2 mb-8">
                                    {strat.tags.map(tag => (
                                        <span key={tag} className="text-[10px] font-bold uppercase tracking-[0.1em] px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400 group-hover:border-white/20 transition-colors">
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-[#111] border border-white/5 rounded-2xl p-4 group-hover:border-stellar-teal/20 transition-all">
                                        <div className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mb-1 font-bold">{t.marketplace.strategies.stats.historical_rate}</div>
                                        <div className="text-2xl font-mono text-stellar-teal font-black">{strat.apy}</div>
                                    </div>
                                    <div className="bg-[#111] border border-white/5 rounded-2xl p-4 group-hover:border-white/10 transition-all">
                                        <div className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mb-1 font-bold">{t.marketplace.strategies.stats.money_running}</div>
                                        <div className="text-2xl font-mono text-white font-black">{strat.tvl}</div>
                                    </div>
                                </div>

                                <div className="bg-[#111] border border-white/5 rounded-2xl p-4 mb-8 group-hover:border-white/10 transition-all relative overflow-hidden">
                                    <div className="flex justify-between items-center mb-2 relative z-10">
                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">{t.marketplace.strategies.stats.creator_score}</span>
                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase ${
                                            strat.elo >= 2100 ? "bg-purple-500/20 text-purple-400 border border-purple-500/20" : 
                                            strat.elo >= 1800 ? "bg-yellow-500/20 text-yellow-500 border border-yellow-500/20" : 
                                            "bg-slate-500/20 text-slate-400 border border-slate-500/20"
                                        }`}>
                                            {strat.elo >= 2100 ? t.marketplace.strategies.tiers.matrix : 
                                             strat.elo >= 1800 ? t.marketplace.strategies.tiers.gold : 
                                             t.marketplace.strategies.tiers.silver}
                                        </span>
                                    </div>
                                    <div className="text-lg font-mono text-white mb-3 relative z-10 font-bold">{strat.elo}</div>

                                    <div className="flex justify-between items-center pt-3 border-t border-white/5 relative z-10">
                                        <span className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">{t.marketplace.strategies.stats.our_fee}</span>
                                        <span className="text-[10px] text-stellar-teal font-mono font-black">{t.marketplace.strategies.stats.fee_desc}</span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center mb-6 px-1">
                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">{t.marketplace.strategies.stats.wallet_label}</span>
                                    <div className="flex items-center bg-black/60 border border-white/10 rounded-xl p-1 shadow-inner">
                                        <button
                                            onClick={() => setSelectedAssets({ ...selectedAssets, [strat.id]: 'USDC' })}
                                            className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${
                                                (selectedAssets[strat.id] || 'XLM') === 'USDC' 
                                                ? 'bg-stellar-yellow text-black shadow-lg shadow-stellar-yellow/10' 
                                                : 'text-gray-500 hover:text-white'
                                            }`}
                                        >
                                            USDC
                                        </button>
                                        <button
                                            onClick={() => setSelectedAssets({ ...selectedAssets, [strat.id]: 'XLM' })}
                                            className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${
                                                (selectedAssets[strat.id] || 'XLM') === 'XLM' 
                                                ? 'bg-[#4ca2ff] text-white shadow-lg shadow-blue-500/10' 
                                                : 'text-gray-500 hover:text-white'
                                            }`}
                                        >
                                            XLM
                                        </button>
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-auto">
                                    <button
                                        onClick={() => toast.info('Historical benchmarks loading...', { icon: '📊' })}
                                        className="flex-1 bg-white/5 hover:bg-white/10 text-white py-4 rounded-xl text-[11px] font-black tracking-widest transition-all flex items-center justify-center gap-2 border border-white/5 font-mono uppercase">
                                        <Copy size={16} /> {t.marketplace.strategies.buttons.test}
                                    </button>
                                    <button
                                        onClick={() => handleDeploy(strat)}
                                        disabled={deployingId === strat.id}
                                        className="flex-1 bg-stellar-yellow text-black py-4 rounded-xl text-[11px] font-black tracking-widest hover:shadow-[0_0_30px_rgba(255,200,0,0.2)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-mono uppercase">
                                        {deployingId === strat.id ? (
                                            <div className="w-5 h-5 border-3 border-black border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <>{t.marketplace.strategies.buttons.deploy} <ArrowRight size={16} /></>
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}

                    <Link href="/treasury" className="border-2 border-dashed border-white/10 rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-10 flex flex-col items-center justify-center text-center gap-6 hover:bg-white/[0.03] hover:border-stellar-teal/30 transition-all text-gray-400 hover:text-white cursor-pointer min-h-[400px] sm:min-h-[500px] group relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-stellar-teal/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="w-24 h-24 rounded-3xl bg-white/5 group-hover:bg-stellar-teal/10 flex items-center justify-center mb-2 transition-all border border-white/5 group-hover:border-stellar-teal/20 group-hover:scale-110 group-hover:-rotate-3 shadow-2xl">
                            <Zap size={48} className="group-hover:text-stellar-teal transition-all duration-500" />
                        </div>
                        <div className="space-y-2 relative z-10">
                            <h3 className="text-2xl font-black font-mono tracking-tighter group-hover:text-stellar-teal transition-colors uppercase italic">{t.marketplace.custom_builder.title}</h3>
                            <p className="text-sm max-w-xs text-gray-500 font-medium leading-relaxed">
                                {t.marketplace.custom_builder.subtitle}<br />
                                <span className="text-stellar-teal font-mono text-[10px] uppercase tracking-widest font-black">{t.marketplace.custom_builder.features}</span>
                            </p>
                        </div>
                        <div className="flex items-center gap-3 mt-4 relative z-10">
                            <span className="text-[10px] font-black font-mono bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20 shadow-sm">XLM</span>
                            <span className="text-[10px] font-black font-mono bg-stellar-yellow/10 text-stellar-yellow px-3 py-1 rounded-full border border-stellar-yellow/20 shadow-sm">USDC</span>
                            <span className="text-[10px] font-black font-mono bg-white/5 text-gray-600 px-3 py-1 rounded-full border border-white/5">{t.marketplace.custom_builder.export}</span>
                        </div>
                    </Link>
                </div>

                <div className="mt-32 sm:mt-48 mb-12 sm:mb-16 px-4">
                    <h2 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tighter uppercase italic leading-[0.85] text-white flex flex-wrap gap-x-3 sm:gap-x-4">
                        {t.marketplace.plugins.title} <span className="text-stellar-yellow">{t.marketplace.plugins.span}</span>
                    </h2>
                    <p className="text-gray-400 max-w-2xl text-base sm:text-xl mt-6 leading-relaxed font-medium">
                        {t.marketplace.plugins.subtitle}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
                    {plugins.map((skill, idx) => {
                        const localized = t.marketplace.plugins.items[skill.id as keyof typeof t.marketplace.plugins.items];
                        return (
                            <motion.div
                                key={skill.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.1 + idx * 0.1 }}
                                whileHover={{ scale: 1.02 }}
                                className="group relative overflow-hidden flex flex-col rounded-[1.5rem] sm:rounded-3xl bg-[#080808] border border-white/5 p-6 sm:p-8 hover:border-stellar-teal/50 hover:shadow-[0_0_40px_rgba(45,235,232,0.08)] transition-all cursor-pointer"
                            >
                                {skill.isPremium && (
                                    <div className="absolute top-6 right-6">
                                        <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-stellar-yellow/10 text-stellar-yellow rounded-full flex items-center gap-1.5 border border-stellar-yellow/20">
                                            <Sparkles className="w-3 h-3" /> {t.marketplace.plugins.buttons.premium}
                                        </span>
                                    </div>
                                )}

                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${CATEGORY_COLORS[skill.category] || 'from-slate-500 to-slate-600'} flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 transition-transform duration-500`}>
                                    {(() => {
                                        const Icon = CATEGORY_ICONS[skill.category] || Code2;
                                        return <Icon className="w-7 h-7 text-white" />;
                                    })()}
                                </div>

                                <h3 className="text-xl font-black text-white mb-3 group-hover:text-stellar-teal transition-colors tracking-tight">
                                    {localized.name}
                                </h3>
                                <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-black mt-1 mb-8 flex-1 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                                    {localized.description}
                                </p>

                                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mt-auto pt-6 border-t border-white/5">
                                    <div className="flex items-center gap-4">
                                        <span className="flex items-center gap-1.5 hover:text-white transition-colors">
                                            <Download className="w-4 h-4 text-stellar-teal" />
                                            {(skill.downloads / 1000).toFixed(1)}K
                                        </span>
                                        <span className="flex items-center gap-1.5 hover:text-white transition-colors">
                                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                            {skill.elo}
                                        </span>
                                    </div>

                                    {installedSkills[skill.id] || installedSkills[skill.slug] ? (
                                        <div className="flex gap-2 z-20 relative">
                                            <Link href="/dashboard">
                                                <button
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-400 rounded-xl hover:bg-green-500/20 text-[10px] font-black uppercase tracking-widest transition-all border border-green-500/20"
                                                >
                                                    <span className="relative flex h-1.5 w-1.5">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                                                    </span>
                                                    {t.marketplace.plugins.buttons.monitor}
                                                </button>
                                            </Link>

                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setSelectedSkillToInstall(skill);
                                                }}
                                                className="flex items-center justify-center p-2.5 bg-stellar-teal/10 text-stellar-teal rounded-xl hover:bg-stellar-teal/20 transition-all border border-stellar-teal/20"
                                                title="Install to another unit"
                                            >
                                                <UserPlus size={18} />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedSkillToInstall(skill);
                                            }}
                                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border z-10 relative ${
                                                skill.isPremium 
                                                ? 'bg-stellar-teal/20 hover:bg-stellar-teal text-white border-stellar-teal/50 hover:text-black shadow-lg shadow-stellar-teal/20 hover:scale-105 active:scale-95' 
                                                : 'bg-white/5 hover:bg-stellar-yellow hover:text-black text-white border-white/10 hover:border-stellar-yellow hover:scale-105 active:scale-95'
                                            }`}
                                        >
                                            <Zap className="w-4 h-4" />
                                            {skill.isPremium ? `Pay ${skill.price}` : t.marketplace.plugins.buttons.install}
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

            </div>

            <InstallSkillModal
                skill={selectedSkillToInstall}
                isOpen={!!selectedSkillToInstall}
                onClose={() => setSelectedSkillToInstall(null)}
                isInstalling={isInstalling}
                onInstall={handleInstall}
            />

            {/* Marketplace Governance Footer */}
            <div className="max-w-[1600px] w-full mx-auto px-6 mt-24 pt-12 border-t border-white/5 opacity-50 hover:opacity-100 transition-opacity">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-stellar-teal/10 border border-stellar-teal/20 flex items-center justify-center">
                            <ShieldAlert className="w-5 h-5 text-stellar-teal" />
                        </div>
                        <div className="text-left">
                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-stellar-teal mb-1">Marketplace Governance</div>
                            <p className="text-[11px] text-gray-500 max-w-xl leading-relaxed">
                                All strategies and plugins listed in the Nirium Marketplace are vetted for technical compatibility with the Soroban environment. 
                                By installing any capability, users agree to operate within the <strong className="text-white/70">Stellar Community Code of Conduct</strong>. 
                                Nirium reserves the right to delist any agent that violates SDF/SCF ethical standards.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <Link href="/terms" className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-colors">Ethics Protocol</Link>
                        <Link href="/disclaimers" className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-colors">Risk Policy</Link>
                        <a href="https://stellar.org/community" target="_blank" rel="noopener noreferrer" className="text-[10px] font-black uppercase tracking-widest text-stellar-teal hover:brightness-125 transition-all underline underline-offset-4 decoration-stellar-teal/30">Stellar Ecosystem</a>
                    </div>
                </div>
            </div>
        </main>
    );
}
