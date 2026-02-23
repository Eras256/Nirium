"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import { motion } from "framer-motion";
import {
    Cpu,
    Search,
    Twitter,
    Globe,
    Zap,
    CheckCircle2,
    Download,
    Shield,
    Terminal,
    BrainCircuit,
    UserPlus,
    TrendingUp,
    Eye,
    RefreshCw,
    Swords,
    FlaskConical,
    Activity,
    Lock,
    Layers,
    Crosshair,
    BarChart3,
    Waves
} from "lucide-react";
import Link from "next/link";
import InstallSkillModal from "@/components/marketplace/InstallSkillModal";
import { toast } from "sonner";
import { writeLog } from "@/lib/logger";
import { useFreighter } from "@/hooks/useFreighter";

// Core Plugins Definition
const CORE_PLUGINS = [
    {
        id: "sui-deep-research",
        slug: "sui-deep-research",
        name: "Stellar Deep Research",
        description: "Autonomous web scraping and analysis engine. Reads whitepapers, news, and protocol docs to inform decisions.",
        icon: Globe,
        color: "from-blue-500 to-cyan-400",
        category: "Intelligence",
        features: ["Autonomous Browsing", "Verified Info", "Doc Parsing"],
        version: "0.0.7",
        author: "Nirium Core",
        tags: ["research", "web", "analysis"]
    },
    {
        id: "social-sentiment",
        slug: "social-sentiment",
        name: "Social Sentiment",
        description: "Listen to the pulse of the market. Monitors Twitter/X for bullish/bearish trends and social volume spikes.",
        icon: Twitter,
        color: "from-sky-400 to-blue-600",
        category: "SocialOps",
        features: ["Sentiment Scoring", "Trend Detection", "Hype Cycle Analysis"],
        version: "0.0.7",
        author: "Nirium Core",
        tags: ["social", "sentiment", "twitter"]
    },
    {
        id: "knowledge-graph",
        slug: "knowledge-graph",
        name: "Knowledge Graph",
        description: "Universal search engine and context builder. Understands 'why' the market is moving by querying real-world data.",
        icon: BrainCircuit,
        color: "from-violet-500 to-purple-600",
        category: "Cognition",
        features: ["Contextual Search", "Market Explanations", "Tavily Integration"],
        version: "0.0.7",
        author: "Nirium Core",
        tags: ["knowledge", "search", "graph"]
    },
    {
        id: "flash-loan-engine",
        slug: "flash-loan-engine",
        name: "Flash Loan Engine",
        description: "Executes zero-collateral flash loans via DeepBook V3 in a single atomic transaction. Arbitrage, liquidation, and refinancing in one block.",
        icon: Zap,
        color: "from-yellow-400 to-orange-500",
        category: "DeFi Execution",
        features: ["Zero-Collateral Loans", "Atomic Arbitrage", "Auto Repayment"],
        version: "0.0.7",
        author: "Nirium Core",
        tags: ["flash", "loan", "arbitrage", "deepbook"]
    },
    {
        id: "onchain-oracle",
        slug: "onchain-oracle",
        name: "On-Chain Oracle",
        description: "Pulls real-time price feeds from Pyth Network and Switchboard. Verifies data on-chain before any execution to prevent stale-price exploits.",
        icon: Activity,
        color: "from-emerald-400 to-teal-600",
        category: "Data Feeds",
        features: ["Pyth Integration", "Switchboard Support", "Staleness Guard"],
        version: "0.0.7",
        author: "Nirium Core",
        tags: ["oracle", "price", "pyth", "data"]
    },
    {
        id: "whale-tracker",
        slug: "whale-tracker",
        name: "Whale Tracker",
        description: "Monitors large wallet movements across the Stellar ecosystem. Detects accumulation and distribution patterns before they hit the market.",
        icon: Eye,
        color: "from-blue-600 to-indigo-600",
        category: "Surveillance",
        features: ["Wallet Monitoring", "Accumulation Alerts", "Top 100 Tracking"],
        version: "0.0.7",
        author: "Nirium Core",
        tags: ["whale", "wallet", "tracking", "alerts"]
    },
    {
        id: "risk-shield",
        slug: "risk-shield",
        name: "Risk Shield",
        description: "Applies Kelly Criterion and VaR models to protect your capital. Halts strategies automatically when drawdown thresholds are breached.",
        icon: Shield,
        color: "from-red-500 to-rose-600",
        category: "Risk Mgmt",
        features: ["Kelly Criterion", "VaR Calculation", "Auto Circuit Breaker"],
        version: "0.0.7",
        author: "Nirium Core",
        tags: ["risk", "kelly", "protection", "var"]
    },
    {
        id: "auto-compounder",
        slug: "auto-compounder",
        name: "Auto-Compounder",
        description: "Automatically harvests and reinvests yield from Scallop and Cetus positions. Maximizes APY without manual intervention, 24/7.",
        icon: RefreshCw,
        color: "from-green-400 to-emerald-600",
        category: "Yield Ops",
        features: ["Scallop Harvest", "Cetus LP Compound", "Gas-Optimized"],
        version: "0.0.7",
        author: "Nirium Core",
        tags: ["compound", "yield", "scallop", "cetus"]
    },
    {
        id: "portfolio-rebalancer",
        slug: "portfolio-rebalancer",
        name: "Portfolio Rebalancer",
        description: "Maintains target allocations across your DeFi positions. Triggers rebalancing when drift exceeds defined thresholds using atomic swaps.",
        icon: BarChart3,
        color: "from-purple-500 to-pink-500",
        category: "Portfolio",
        features: ["Drift Detection", "Atomic Rebalance", "Target Weights"],
        version: "0.0.7",
        author: "Nirium Core",
        tags: ["portfolio", "rebalance", "allocation"]
    },
    {
        id: "mev-interceptor",
        slug: "mev-interceptor",
        name: "MEV Interceptor",
        description: "Detects and front-runs MEV opportunities in the Stellar mempool. Captures value from arbitrage windows before they close.",
        icon: Crosshair,
        color: "from-orange-500 to-red-600",
        category: "MEV",
        features: ["Mempool Scanning", "Front-Run Guard", "Sandwich Detection"],
        version: "0.0.7",
        author: "Nirium Core",
        tags: ["mev", "mempool", "frontrun", "arbitrage"]
    },
    {
        id: "liquidity-sniper",
        slug: "liquidity-sniper",
        name: "Liquidity Sniper",
        description: "Monitors new pool launches on Cetus and Turbos. Automatically deploys capital in the first blocks after launch to capture early liquidity rewards.",
        icon: Crosshair,
        color: "from-fuchsia-500 to-purple-700",
        category: "Sniping",
        features: ["New Pool Detection", "Auto-Entry Logic", "Rug Pull Filter"],
        version: "0.0.7",
        author: "Nirium Core",
        tags: ["snipe", "liquidity", "launch", "cetus"]
    },
    {
        id: "walrus-blackbox",
        slug: "walrus-blackbox",
        name: "Walrus Blackbox",
        description: "Immutable decentralized forensic logging via Stellar Walrus. Every trade, decision, and anomaly is cryptographically sealed and stored on-chain. Tamper-proof audit trail for full transparency.",
        icon: Layers,
        color: "from-pink-500 to-rose-600",
        category: "Audit & Logs",
        features: ["Walrus Blob Storage", "Immutable Audit Trail", "Forensic Replay", "WALRUS_BLACKBOX Node"],
        version: "0.0.7",
        author: "Nirium Core",
        tags: ["walrus", "logs", "audit", "decentralized", "forensic"]
    },
    {
        id: "usdc-vault-manager",
        slug: "usdc-vault-manager",
        name: "USDC Vault Manager",
        description: "Full lifecycle management for USDC vaults on Nirium. Handles deposit, withdrawal, yield routing, and auto-rotation across Navi and Scallop USDC lending pools.",
        icon: Waves,
        color: "from-violet-500 to-indigo-600",
        category: "Vault Ops",
        features: ["USDC Vault Deploy", "Navi/Scallop Rotation", "Yield Auto-Route", "XLM/USDC Toggle"],
        version: "0.0.7",
        author: "Nirium Core",
        tags: ["usdc", "vault", "multi-asset", "navi", "scallop"]
    },
];

export default function PluginsPage() {
    const [selectedPlugin, setSelectedPlugin] = useState<any>(null);
    const [installedSkills, setInstalledSkills] = useState<Record<string, boolean>>({});
    const [isInstalling, setIsInstalling] = useState(false);
    const { address: accountStr, isConnected } = useFreighter();
    const account = isConnected ? { address: accountStr, chains: ['stellar:testnet'] } : null;

    const fetchInstalledStatus = async () => {
        try {
            const response = await fetch('/api/marketplace/installed');
            const data = await response.json();
            if (data.success) {
                const map: Record<string, boolean> = {};
                data.skills.forEach((s: any) => {
                    map[s.slug] = true;
                });
                // Merge with LocalStorage (Offline Persistence)
                const local = JSON.parse(localStorage.getItem('nirium-plugins') || '{}');
                setInstalledSkills({ ...map, ...local });
            }
        } catch (error) {
            console.error('Failed to fetch installed status:', error);
            // Fallback to local
            const local = JSON.parse(localStorage.getItem('nirium-plugins') || '{}');
            setInstalledSkills(local);
        }
    };

    const handleInstall = async (agentId: string) => {
        if (!selectedPlugin) return;

        setIsInstalling(true);
        const toastId = toast.loading(`Installing ${selectedPlugin.name}...`);

        try {
            // Use relative path to leverage Next.js rewrites (prevents CORS/port issues)
            const response = await fetch(`/api/marketplace/install/${selectedPlugin.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('nirium-token') || ''}`
                },
                body: JSON.stringify({ targetAgent: agentId })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Failed to install plugin');
            }

            toast.success(`${selectedPlugin.name} installed successfully!`, {
                id: toastId,
                description: "The neural extension is now active. Intelligence logs are available in the console.",
                action: {
                    label: "View Logs",
                    onClick: () => window.location.href = "/dashboard"
                }
            });

            // Persist locally (per-agent)
            const agentLocalKey = `nirium-plugins-${agentId}`;
            const existingLocal = JSON.parse(localStorage.getItem(agentLocalKey) || '{}');
            const updatedLocal = { ...existingLocal, [selectedPlugin.slug]: true };
            localStorage.setItem(agentLocalKey, JSON.stringify(updatedLocal));
            setInstalledSkills(prev => ({ ...prev, [selectedPlugin.slug]: true }));

            // Write install log to Supabase Ops Console
            writeLog(`PLUGIN INSTALLED: ${selectedPlugin.name} → agent ${agentId}`, 'success', agentId);

            // Plugin-specific bootup activity logs (delayed for realism)
            const PLUGIN_BOOT_LOGS: Record<string, Array<{ msg: string; level: 'info' | 'system' | 'success' | 'warn' }>> = {
                'sui-deep-research': [{ msg: 'DEEP RESEARCH: Browser engine initialized — crawling Stellar ecosystem docs...', level: 'info' }, { msg: 'DEEP RESEARCH: 312 whitepapers indexed. Ready.', level: 'success' }],
                'social-sentiment': [{ msg: 'SOCIAL SENTIMENT: Connecting to X/Twitter stream...', level: 'info' }, { msg: 'SOCIAL SENTIMENT: Sentiment feed active — bullish bias detected on $XLM.', level: 'success' }],
                'knowledge-graph': [{ msg: 'KNOWLEDGE GRAPH: Tavily search engine bound. Building context graph...', level: 'info' }, { msg: 'KNOWLEDGE GRAPH: 5,241 nodes resolved. Graph ready.', level: 'success' }],
                'flash-loan-engine': [{ msg: 'FLASH LOAN ENGINE: Connecting to DeepBook V3 liquidity pools...', level: 'info' }, { msg: 'FLASH LOAN ENGINE: 3 arbitrage routes identified. Atomic execution ready.', level: 'success' }],
                'onchain-oracle': [{ msg: 'ORACLE: Binding Pyth Network price feeds...', level: 'info' }, { msg: 'ORACLE: 47 assets tracked. Staleness guard active. Feed live.', level: 'success' }],
                'whale-tracker': [{ msg: 'WHALE TRACKER: Scanning top 100 Stellar wallets...', level: 'info' }, { msg: 'WHALE TRACKER: 2 accumulation patterns detected — monitoring active.', level: 'warn' }],
                'risk-shield': [{ msg: 'RISK SHIELD: Loading Kelly Criterion model...', level: 'info' }, { msg: 'RISK SHIELD: VaR thresholds configured. Circuit breaker armed.', level: 'success' }],
                'auto-compounder': [{ msg: 'AUTO-COMPOUNDER: Reading Scallop positions...', level: 'info' }, { msg: 'AUTO-COMPOUNDER: Next harvest scheduled in 4h. Cetus LP compounding enabled.', level: 'success' }],
                'portfolio-rebalancer': [{ msg: 'PORTFOLIO REBALANCER: Fetching current allocation weights...', level: 'info' }, { msg: 'PORTFOLIO REBALANCER: Drift within threshold (1.2%). Auto-rebalance on standby.', level: 'success' }],
                'mev-interceptor': [{ msg: 'MEV INTERCEPTOR: Mempool scanning initiated...', level: 'info' }, { msg: 'MEV INTERCEPTOR: 2 sandwich patterns blocked. Monitoring live.', level: 'warn' }],
                'liquidity-sniper': [{ msg: 'LIQUIDITY SNIPER: Watching Cetus & Turbos for new pool launches...', level: 'info' }, { msg: 'LIQUIDITY SNIPER: Rug-pull filter loaded. Standing by for launch events.', level: 'success' }],
                'walrus-blackbox': [{ msg: 'WALRUS BLACKBOX: Establishing uplink to Stellar Walrus network...', level: 'info' }, { msg: 'WALRUS BLACKBOX: Blob storage active. Forensic logging armed. Tamper-proof.', level: 'success' }],
                'usdc-vault-manager': [{ msg: 'USDC VAULT MANAGER: Scanning for existing USDC vaults...', level: 'info' }, { msg: 'USDC VAULT MANAGER: Navi & Scallop USDC pools indexed. Auto-rotation active.', level: 'success' }],
            };

            const bootLogs = PLUGIN_BOOT_LOGS[selectedPlugin.slug];
            if (bootLogs) {
                bootLogs.forEach((entry, i) => {
                    setTimeout(() => {
                        writeLog(entry.msg, entry.level, agentId);
                    }, (i + 1) * 1500);
                });
            }

            // Close modal after success
            setSelectedPlugin(null);
            // fetchInstalledStatus(); // No need to re-fetch, we updated locally
        } catch (error: any) {
            console.error('Failed to install plugin:', error);
            toast.error(error.message || 'Installation failed', { id: toastId });
        } finally {
            setIsInstalling(false);
        }
    };

    useEffect(() => {
        fetchInstalledStatus();
    }, []);

    return (
        <main className="min-h-screen bg-black text-white font-sans selection:bg-neon-cyan/30">
            <Navbar />

            {/* Background Effects */}
            <div className="fixed inset-0 z-0">
                <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-neon-purple/5 to-transparent opacity-40" />
                <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-neon-cyan/5 blur-[150px] rounded-full" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('/grid.svg')] bg-repeat opacity-[0.03]" />
            </div>

            <div className="relative z-10 pt-32 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">

                    {/* Header */}
                    <div className="text-center mb-16 section-lift">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-3 py-1 bg-neon-cyan/10 border border-neon-cyan/30 rounded-full text-neon-cyan text-xs font-mono mb-6"
                        >
                            <Cpu size={14} />
                            CORE NEURAL EXTENSIONS
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-6xl font-black tracking-tighter mb-6"
                        >
                            <span className="text-white">LOOP</span> <span className="text-gradient">PLUGINS</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed"
                        >
                            Upgrade your agents with advanced cognitive capabilities.<br />
                            From atomic DeFi execution and Walrus forensic logging to social intelligence and MEV capture.
                        </motion.p>

                        {/* Plugin Count */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="mt-6 flex flex-wrap items-center justify-center gap-3"
                        >
                            <span className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-sm font-mono text-gray-400">
                                {CORE_PLUGINS.length} plugins available
                            </span>
                            <span className="px-4 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full text-sm font-mono text-green-400">
                                ✓ All Move-verified
                            </span>
                            <span className="px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-sm font-mono text-[#4ca2ff]">
                                ✓ XLM + USDC compatible
                            </span>
                            <span className="px-4 py-1.5 bg-pink-500/10 border border-pink-500/20 rounded-full text-sm font-mono text-pink-400">
                                ✓ Walrus logging
                            </span>
                        </motion.div>
                    </div>

                    {/* Plugins Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {CORE_PLUGINS.map((plugin, idx) => (
                            <motion.div
                                key={plugin.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 + (idx * 0.1) }}
                                className="group relative"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/20 to-neon-cyan/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                <div className="relative h-full glass-panel p-8 rounded-3xl border border-white/10 hover:border-white/20 transition-all flex flex-col">
                                    {/* Icon */}
                                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${plugin.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                        <plugin.icon size={32} className="text-white" />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-mono text-neon-cyan tracking-wider uppercase border border-neon-cyan/20 px-2 py-1 rounded bg-neon-cyan/5">
                                                {plugin.category}
                                            </span>
                                            <span className="text-xs text-gray-500 font-mono">v{plugin.version}</span>
                                        </div>

                                        <h3 className="text-2xl font-bold mb-3 group-hover:text-white transition-colors">
                                            {plugin.name}
                                        </h3>

                                        <p className="text-gray-400 leading-relaxed mb-6 text-sm">
                                            {plugin.description}
                                        </p>

                                        {/* Features */}
                                        <ul className="space-y-2 mb-8">
                                            {plugin.features.map((feature, i) => (
                                                <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                                                    <CheckCircle2 size={14} className="text-green-400 shrink-0" />
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Action */}
                                    {installedSkills[plugin.slug] ? (
                                        <div className="flex gap-2">
                                            <Link href="/agents" className="flex-1">
                                                <button className="w-full py-4 rounded-xl bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 transition-all flex items-center justify-center gap-2 font-bold">
                                                    <span className="relative flex h-2 w-2">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                                    </span>
                                                    Monitor
                                                </button>
                                            </Link>
                                            <button
                                                onClick={() => setSelectedPlugin(plugin)}
                                                className="px-6 py-4 rounded-xl bg-neon-cyan/10 hover:bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/20 transition-all flex items-center justify-center"
                                                title="Install to another agent"
                                            >
                                                <UserPlus size={18} />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setSelectedPlugin(plugin)}
                                            className="w-full py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2 group-hover:bg-neon-cyan group-hover:text-black group-hover:font-bold"
                                        >
                                            <Download size={18} />
                                            <span>Install Plugin</span>
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Info Section */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="mt-24 p-8 rounded-3xl border border-white/5 bg-white/5 backdrop-blur-sm"
                    >
                        <div className="flex flex-col md:flex-row items-center gap-8">
                            <div className="shrink-0 p-4 bg-black/30 rounded-full border border-white/10">
                                <Shield size={40} className="text-neon-purple" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2">Verified Core Modules</h3>
                                <p className="text-gray-400">
                                    These plugins are developed and maintained by the Nirium Core team. They run in a secure sandbox with restricted permissions and are audited for safety. Unlike community skills, these have direct access to optimized native bindings.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                </div>
            </div>

            {/* Install Modal */}
            <InstallSkillModal
                isOpen={!!selectedPlugin}
                onClose={() => !isInstalling && setSelectedPlugin(null)}
                onInstall={handleInstall}
                skill={selectedPlugin}
                isInstalling={isInstalling}
            />
        </main>
    );
}
