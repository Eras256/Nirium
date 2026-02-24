"use client";

import Navbar from "@/components/layout/Navbar";
import {
    Download, Star, Search, Filter, TrendingUp, Sparkles,
    CheckCircle, Package, ExternalLink, ChevronRight, Zap,
    Code2, Bell, BarChart3, Database, Link2, Settings, Play, UserPlus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { writeLog } from "@/lib/logger";
import InstallSkillModal from "@/components/marketplace/InstallSkillModal";

// Types
interface MarketplaceSkill {
    id: string;
    name: string;
    slug: string;
    version: string;
    description: string;
    author: string;
    category: string;
    tags: string[];
    downloads: number;
    rating: number;
    reviewCount: number;
    isVerified: boolean;
    isFeatured: boolean;
    actions?: { name: string; description: string }[];
}

interface Category {
    id: string;
    name: string;
    count: number;
    icon: string;
}

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

export default function MarketplacePage() {
    const [skills, setSkills] = useState<MarketplaceSkill[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [featuredSkills, setFeaturedSkills] = useState<MarketplaceSkill[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<"downloads" | "rating" | "newest">("downloads");
    const [installedSkills, setInstalledSkills] = useState<{ [key: string]: boolean }>({});
    const [stats, setStats] = useState({ totalSkills: 0, totalDownloads: 0 });
    const [selectedSkillToInstall, setSelectedSkillToInstall] = useState<MarketplaceSkill | null>(null);
    const [selectedSkillToExecute, setSelectedSkillToExecute] = useState<MarketplaceSkill | null>(null);

    // Fetch marketplace data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // In production, these would be real API calls
                // For now, we'll use mock data

                const mockSkills: MarketplaceSkill[] = [
                    {
                        id: 'flash-loan-executor',
                        name: 'Flash Loan Executor',
                        slug: 'flash-loan-executor',
                        version: '0.1.0',
                        description: 'Execute atomic flash loans using Soroban single-invocation primitives.',
                        author: 'Nirium Team',
                        category: 'trading',
                        tags: ['flash-loan', 'stellar', 'atomic'],
                        downloads: 12453,
                        rating: 4.8,
                        reviewCount: 234,
                        isVerified: true,
                        isFeatured: true
                    },
                    {
                        id: 'price-oracle',
                        name: 'Multi-Source Price Oracle',
                        slug: 'price-oracle',
                        version: '1.5.0',
                        description: 'Aggregate prices from CoinGecko, DeFiLlama, Pyth.',
                        author: 'DeFi Labs',
                        category: 'data',
                        tags: ['oracle', 'price', 'data'],
                        downloads: 8932,
                        rating: 4.6,
                        reviewCount: 156,
                        isVerified: true,
                        isFeatured: true
                    },
                    {
                        id: 'telegram-alerts-pro',
                        name: 'Telegram Alerts Pro',
                        slug: 'telegram-alerts-pro',
                        version: '3.0.0',
                        description: 'Advanced Telegram notifications with rich formatting.',
                        author: 'NotifyBot',
                        category: 'notification',
                        tags: ['telegram', 'alerts', 'bot'],
                        downloads: 15678,
                        rating: 4.9,
                        reviewCount: 412,
                        isVerified: true,
                        isFeatured: true
                    },
                    {
                        id: 'whale-tracker',
                        name: 'Whale Tracker',
                        slug: 'whale-tracker',
                        version: '1.2.0',
                        description: 'Track large wallet movements on Stellar.',
                        author: 'OnChainInsights',
                        category: 'analysis',
                        tags: ['whale', 'tracking', 'analysis'],
                        downloads: 6234,
                        rating: 4.5,
                        reviewCount: 89,

                        isVerified: true,
                        isFeatured: false,
                        actions: [
                            { name: 'scanWhales', description: 'Trigger manual whale scan' }
                        ]
                    },
                    {
                        id: 'lst-arbitrage',
                        name: 'LST Arbitrage Bot',
                        slug: 'lst-arbitrage',
                        version: '2.0.0',
                        description: 'Automated arbitrage between liquid staking tokens.',
                        author: 'ArbitrageDAO',
                        category: 'trading',
                        tags: ['lst', 'arbitrage', 'automation'],
                        downloads: 4521,
                        rating: 4.4,
                        reviewCount: 67,
                        isVerified: true,
                        isFeatured: false
                    },
                    {
                        id: 'blend-optimizer',
                        name: 'Blend Yield Optimizer',
                        slug: 'blend-optimizer',
                        version: '1.8.0',
                        description: 'Optimize Blend lending positions for best APY.',
                        author: 'YieldFarm',
                        category: 'trading',
                        tags: ['blend', 'lending', 'yield'],
                        downloads: 7845,
                        rating: 4.7,
                        reviewCount: 134,
                        isVerified: true,
                        isFeatured: false
                    },
                    {
                        id: 'discord-integration',
                        name: 'Discord Bot Integration',
                        slug: 'discord-integration',
                        version: '2.5.0',
                        description: 'Full Discord integration with slash commands.',
                        author: 'DiscordDevs',
                        category: 'integration',
                        tags: ['discord', 'bot', 'integration'],
                        downloads: 9123,
                        rating: 4.6,
                        reviewCount: 178,
                        isVerified: true,
                        isFeatured: false
                    },
                    {
                        id: 'portfolio-tracker',
                        name: 'Portfolio Tracker',
                        slug: 'portfolio-tracker',
                        version: '1.3.0',
                        description: 'Track DeFi portfolio with P&L analytics.',
                        author: 'PortfolioLabs',
                        category: 'analysis',
                        tags: ['portfolio', 'tracking', 'analytics'],
                        downloads: 5678,
                        rating: 4.3,
                        reviewCount: 92,
                        isVerified: false,
                        isFeatured: false
                    },
                    {
                        id: 'pyth-oracle',
                        name: 'Pyth Network Oracle',
                        slug: 'pyth-oracle',
                        version: '2.1.0',
                        description: 'Pyth Network high-fidelity price feeds for 200+ assets.',
                        author: 'Pyth Contributors',
                        category: 'data',
                        tags: ['pyth', 'oracle', 'price'],
                        downloads: 9876,
                        rating: 4.9,
                        reviewCount: 234,
                        isVerified: true,
                        isFeatured: true
                    },
                    {
                        id: 'twitter-sentiment',
                        name: 'Twitter/X Sentiment Analyzer',
                        slug: 'twitter-sentiment',
                        version: '0.0.7',
                        description: 'Real-time sentiment analysis of crypto Twitter.',
                        author: 'SocialFi',
                        category: 'analysis',
                        tags: ['twitter', 'sentiment', 'ai'],
                        downloads: 8765,
                        rating: 4.6,
                        reviewCount: 145,
                        isVerified: true,
                        isFeatured: true
                    },
                    {
                        id: 'soroswap-lp-manager',
                        name: 'Soroswap LP Manager',
                        slug: 'soroswap-lp-manager',
                        version: '2.0.0',
                        description: 'Manage Soroswap AMM positions with auto-rebalance.',
                        author: 'LPMasters',
                        category: 'trading',
                        tags: ['soroswap', 'lp', 'liquidity'],
                        downloads: 6789,
                        rating: 4.5,
                        reviewCount: 112,
                        isVerified: true,
                        isFeatured: false
                    },
                    {
                        id: 'gas-optimizer',
                        name: 'Gas Optimizer',
                        slug: 'gas-optimizer',
                        version: '1.0.0',
                        description: 'Optimize transaction gas costs with batching.',
                        author: 'GasDAO',
                        category: 'utility',
                        tags: ['gas', 'optimization', 'cost'],
                        downloads: 3421,
                        rating: 4.2,
                        reviewCount: 45,
                        isVerified: false,
                        isFeatured: false
                    },
                    {
                        id: 'blend-lending-bot',
                        name: 'Blend Lending Bot',
                        slug: 'blend-lending-bot',
                        version: '1.1.0',
                        description: 'Auto-manages lending positions on Blend Protocol. Monitors health factor and rebalances collateral to avoid liquidation.',
                        author: 'ProtocolLabs',
                        category: 'trading',
                        tags: ['phoenix', 'lending', 'health-factor'],
                        downloads: 5230,
                        rating: 4.6,
                        reviewCount: 98,
                        isVerified: true,
                        isFeatured: true
                    },
                    {
                        id: 'sdex-market-maker',
                        name: 'SDEX Market Maker',
                        slug: 'sdex-market-maker',
                        version: '0.9.2',
                        description: 'Places and manages limit orders on SDEX. Earns maker rebates by providing continuous two-sided liquidity.',
                        author: 'MMGuild',
                        category: 'trading',
                        tags: ['sdex', 'market-making', 'limit-orders'],
                        downloads: 3870,
                        rating: 4.4,
                        reviewCount: 61,
                        isVerified: true,
                        isFeatured: false
                    },
                    {
                        id: 'stop-loss-guardian',
                        name: 'Stop-Loss Guardian',
                        slug: 'stop-loss-guardian',
                        version: '2.2.0',
                        description: 'Monitors position prices and executes atomic stop-loss orders on DeepBook when thresholds are breached. Zero-latency protection.',
                        author: 'RiskArsenal',
                        category: 'utility',
                        tags: ['stop-loss', 'risk', 'protection', 'sdex'],
                        downloads: 11230,
                        rating: 4.8,
                        reviewCount: 203,
                        isVerified: true,
                        isFeatured: true
                    },
                    {
                        id: 'eliza-trading-brain',
                        name: 'ElizaOS Trading Brain',
                        slug: 'eliza-trading-brain',
                        version: '0.0.7',
                        description: 'Embeds an ElizaOS AI agent as a decision-making layer for your strategies. The agent evaluates market context before each execution.',
                        author: 'Nirium Team',
                        category: 'analysis',
                        tags: ['eliza', 'ai', 'decision-engine'],
                        downloads: 7654,
                        rating: 4.7,
                        reviewCount: 127,
                        isVerified: true,
                        isFeatured: true
                    },
                    {
                        id: 'ipfs-blackbox-logger',
                        name: 'IPFS Blackbox Logger',
                        slug: 'ipfs-blackbox-logger',
                        version: '1.0.0',
                        description: 'Archives all agent execution logs to decentralized IPFS storage. Provides permanent, verifiable audit trails.',
                        author: 'Nirium Team',
                        category: 'utility',
                        tags: ['ipfs', 'storage', 'logs', 'audit'],
                        downloads: 2980,
                        rating: 4.3,
                        reviewCount: 44,
                        isVerified: true,
                        isFeatured: false
                    },
                    {
                        id: 'cross-dex-aggregator',
                        name: 'Cross-DEX Aggregator',
                        slug: 'cross-dex-aggregator',
                        version: '3.1.0',
                        description: 'Routes swaps across Phoenix, Soroswap, and SDEX to ensure best execution price. Atomic multi-hop routing supported.',
                        author: 'AggregateDAO',
                        category: 'trading',
                        tags: ['dex', 'aggregator', 'swap', 'routing'],
                        downloads: 14320,
                        rating: 4.9,
                        reviewCount: 298,
                        isVerified: true,
                        isFeatured: true
                    },
                    {
                        id: 'pnl-reporter',
                        name: 'P&L Real-Time Reporter',
                        slug: 'pnl-reporter',
                        version: '1.4.0',
                        description: 'Calculates realized and unrealized P&L across all agent positions. Sends daily summaries to Telegram or Discord.',
                        author: 'PortfolioLabs',
                        category: 'analysis',
                        tags: ['pnl', 'reporting', 'analytics'],
                        downloads: 4560,
                        rating: 4.5,
                        reviewCount: 78,
                        isVerified: true,
                        isFeatured: false
                    },
                    {
                        id: 'webhook-trigger',
                        name: 'Webhook Event Trigger',
                        slug: 'webhook-trigger',
                        version: '2.0.0',
                        description: 'Exposes a secure webhook endpoint to trigger agent actions from external systems (TradingView, Zapier, custom bots).',
                        author: 'IntegrationHub',
                        category: 'integration',
                        tags: ['webhook', 'trigger', 'external', 'automation'],
                        downloads: 6780,
                        rating: 4.6,
                        reviewCount: 115,
                        isVerified: true,
                        isFeatured: false
                    },
                    {
                        id: 'neural-archive-logger',
                        name: 'Neural Archive Logger',
                        slug: 'neural-archive-logger',
                        version: '0.1.0',
                        description: 'Immutable decentralized forensic logging. Every agent decision is cryptographically sealed and archived. Tamper-proof audit trail.',
                        author: 'Nirium Team',
                        category: 'utility',
                        tags: ['archive', 'logs', 'audit', 'decentralized', 'forensic'],
                        downloads: 3100,
                        rating: 4.7,
                        reviewCount: 52,
                        isVerified: true,
                        isFeatured: true
                    },
                    {
                        id: 'usdc-vault-manager',
                        name: 'USDC Vault Manager',
                        slug: 'usdc-vault-manager',
                        version: '0.0.7',
                        description: 'Full lifecycle management for USDC vaults. Handles deposit, withdrawal, yield routing, and auto-rotation across Phoenix and Blend USDC lending pools.',
                        author: 'Nirium Team',
                        category: 'trading',
                        tags: ['usdc', 'vault', 'multi-asset', 'phoenix', 'blend'],
                        downloads: 4200,
                        rating: 4.6,
                        reviewCount: 71,
                        isVerified: true,
                        isFeatured: false
                    }
                ];

                const mockCategories: Category[] = [
                    { id: 'trading', name: 'Trading', count: 8, icon: '📈' },
                    { id: 'analysis', name: 'Analysis', count: 4, icon: '🔍' },
                    { id: 'notification', name: 'Notifications', count: 1, icon: '🔔' },
                    { id: 'integration', name: 'Integrations', count: 2, icon: '🔗' },
                    { id: 'data', name: 'Data', count: 2, icon: '📊' },
                    { id: 'utility', name: 'Utilities', count: 4, icon: '🛠️' }
                ];

                setSkills(mockSkills);
                setCategories(mockCategories);
                setFeaturedSkills(mockSkills.filter(s => s.isFeatured));
                setStats({
                    totalSkills: mockSkills.length,
                    totalDownloads: mockSkills.reduce((sum, s) => sum + s.downloads, 0)
                });

                // Fetch installed skills from Agent
                try {
                    const installedRes = await fetch('/api/marketplace/installed');
                    if (installedRes.ok) {
                        const installedData = await installedRes.json();
                        if (installedData.success && installedData.skills) {
                            const installedMap: { [key: string]: boolean } = {};
                            installedData.skills.forEach((s: any) => {
                                installedMap[s.slug] = true;
                                // Map both slug and potentially matching ID
                                installedMap[s.id || s.slug] = true;
                            });
                            // Merge with LocalStorage (Offline Persistence)
                            const local = JSON.parse(localStorage.getItem('nirium-skills') || '{}');
                            console.log('[Marketplace] Syncing installed skills + local:', { ...installedMap, ...local });
                            setInstalledSkills({ ...installedMap, ...local });
                        }
                    } else {
                        throw new Error('API Error');
                    }
                } catch (e) {
                    console.warn("Could not fetch installed skills, falling back to local", e);
                    // Fallback to local
                    const local = JSON.parse(localStorage.getItem('nirium-skills') || '{}');
                    setInstalledSkills(local);
                }

            } catch (error) {
                console.error('Failed to fetch marketplace data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Filter and sort skills
    const filteredSkills = skills
        .filter(skill => {
            const matchesSearch = searchQuery === "" ||
                skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                skill.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                skill.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesCategory = !selectedCategory || skill.category === selectedCategory;

            return matchesSearch && matchesCategory;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case "downloads": return b.downloads - a.downloads;
                case "rating": return b.rating - a.rating;
                case "newest": return 0; // In production, compare dates
                default: return 0;
            }
        });

    const handleInstall = async (agentId: string) => {
        if (!selectedSkillToInstall) return;

        const skill = selectedSkillToInstall;
        setSelectedSkillToInstall(null); // Close modal

        const toastId = toast.loading(`Installing ${skill.name} to unit ${agentId.slice(0, 10)}...`);

        try {
            // El backend está proxyado en Next.js (rewrites) o accesible directamente
            // Asumimos que /api está configurado correctamente
            const response = await fetch(`/api/marketplace/install/${skill.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': 'Bearer ...' // In a real app
                },
                body: JSON.stringify({ targetAgent: agentId }) // Send agent ID
            });
            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`Server returned ${response.status}: ${errText.slice(0, 50)}`);
            }

            const data = await response.json();

            if (data.success) {
                toast.dismiss(toastId);

                // Update local persistence (per-agent)
                const agentLocalKey = `nirium-skills-${agentId}`;
                const existingLocal = JSON.parse(localStorage.getItem(agentLocalKey) || '{}');
                const newInstalled = { ...existingLocal, [skill.id]: true, [skill.slug]: true };
                localStorage.setItem(agentLocalKey, JSON.stringify(newInstalled));
                setInstalledSkills(prev => ({ ...prev, [skill.id]: true, [skill.slug]: true }));

                // Log the install event to Supabase (shows in Ops Console)
                writeLog(`SKILL INSTALLED: ${skill.name} → agent ${agentId}`, 'success', agentId);

                // Skill-specific bootup logs (sequential, simulates skill activating)
                const SKILL_BOOT_LOGS: Record<string, Array<{ msg: string; level: 'info' | 'success' | 'warn' }>> = {
                    'flash-loan-executor': [{ msg: 'SKILL: Flash Loan Executor binding to Soroban atomic module...', level: 'info' }, { msg: 'SKILL: Atomic flash loan ready. Reviewing arbitrage routes.', level: 'success' }],
                    'price-oracle': [{ msg: 'SKILL: Multi-Source Oracle aggregating CoinGecko + DeFiLlama + Pyth...', level: 'info' }, { msg: 'SKILL: Price feeds live — 200+ assets tracked.', level: 'success' }],
                    'telegram-alerts-pro': [{ msg: 'SKILL: Telegram bot connecting to notification channel...', level: 'info' }, { msg: 'SKILL: Telegram Alerts Pro active. Test message sent.', level: 'success' }],
                    'whale-tracker': [{ msg: 'SKILL: Whale Tracker initializing top-100 wallet scanner...', level: 'info' }, { msg: 'SKILL: 3 whale wallets flagged for accumulation. Monitoring.', level: 'warn' }],
                    'lst-arbitrage': [{ msg: 'SKILL: LST Arbitrage Bot reading yXLM/XLM peg status...', level: 'info' }, { msg: 'SKILL: Peg deviation within range. Watching for redemption window.', level: 'success' }],
                    'blend-optimizer': [{ msg: 'SKILL: Blend Optimizer reading current lending APY...', level: 'info' }, { msg: 'SKILL: Optimal supply allocation found — rebalancing 12% collateral.', level: 'success' }],
                    'discord-integration': [{ msg: 'SKILL: Discord Bot binding to guild via OAuth2...', level: 'info' }, { msg: 'SKILL: Slash commands registered. Discord integration live.', level: 'success' }],
                    'portfolio-tracker': [{ msg: 'SKILL: Portfolio Tracker indexing wallet positions...', level: 'info' }, { msg: 'SKILL: 12 open positions tracked. P&L dashboard ready.', level: 'success' }],
                    'pyth-oracle': [{ msg: 'SKILL: Pyth Network Oracle subscribing to price feeds...', level: 'info' }, { msg: 'SKILL: 230 Pyth price feeds active. Staleness guard enabled.', level: 'success' }],
                    'twitter-sentiment': [{ msg: 'SKILL: X/Twitter Sentiment scanning #Stellar ecosystem keywords...', level: 'info' }, { msg: 'SKILL: Bullish sentiment index: 72%. Signal feed active.', level: 'success' }],
                    'phoenix-lp-manager': [{ msg: 'SKILL: Phoenix LP Manager reading AMM position ranges...', level: 'info' }, { msg: 'SKILL: 2 positions in range. Auto-rebalance armed.', level: 'success' }],
                    'gas-optimizer': [{ msg: 'SKILL: Fee Optimizer analyzing transaction multi-op opportunities...', level: 'info' }, { msg: 'SKILL: Multi-op mode enabled. Estimated 45% fee savings.', level: 'success' }],
                    'blend-lending-bot': [{ msg: 'SKILL: Blend Lending Bot reading health factor across positions...', level: 'info' }, { msg: 'SKILL: Health factor 1.82 — safe. Auto-rebalance threshold set.', level: 'success' }],
                    'deepbook-market-maker': [{ msg: 'SKILL: DeepBook Market Maker placing two-sided limit orders...', level: 'info' }, { msg: 'SKILL: 4 limit orders placed. Maker rebate capture active.', level: 'success' }],
                    'stop-loss-guardian': [{ msg: 'SKILL: Stop-Loss Guardian monitoring 3 open positions...', level: 'info' }, { msg: 'SKILL: Stop orders armed at -8% threshold. Protection active.', level: 'warn' }],
                    'eliza-trading-brain': [{ msg: 'SKILL: ElizaOS Trading Brain loading LLM context model...', level: 'info' }, { msg: 'SKILL: AI decision layer active. Pre-execution analysis enabled.', level: 'success' }],
                    'neural-storage-logger': [{ msg: 'SKILL: Neural Logger connecting to decentralized storage...', level: 'info' }, { msg: 'SKILL: Storage endpoint active. Logs will be archived on-chain.', level: 'success' }],
                    'cross-dex-aggregator': [{ msg: 'SKILL: Cross-DEX Aggregator indexing Phoenix, Soroswap, SDEX...', level: 'info' }, { msg: 'SKILL: 3 DEXes indexed. Best-route execution enabled.', level: 'success' }],
                    'pnl-reporter': [{ msg: 'SKILL: P&L Reporter calculating realized/unrealized positions...', level: 'info' }, { msg: 'SKILL: Daily P&L report scheduled. Delivery target: Telegram.', level: 'success' }],
                    'webhook-trigger': [{ msg: 'SKILL: Webhook Trigger generating secure endpoint key...', level: 'info' }, { msg: 'SKILL: Webhook live at /api/hook/{agentId}. Ready for TradingView.', level: 'success' }],
                    'neural-blackbox': [{ msg: 'SKILL: Neural Archive establishing uplink to IPFS network...', level: 'info' }, { msg: 'SKILL: Blob storage active. Forensic logging armed. Tamper-proof seal enabled.', level: 'success' }],
                    'usdc-vault-manager': [{ msg: 'SKILL: USDC Vault Manager scanning for existing USDC vaults...', level: 'info' }, { msg: 'SKILL: Phoenix & Blend USDC pools indexed. Auto-rotation active.', level: 'success' }],
                };

                const bootLogs = SKILL_BOOT_LOGS[skill.slug];
                if (bootLogs) {
                    bootLogs.forEach((entry, i) => {
                        setTimeout(() => {
                            writeLog(entry.msg, entry.level, agentId);
                        }, (i + 1) * 1500);
                    });
                }

                toast.success(`${skill.name} installed successfully!`, {
                    description: "The skill is now available in your agent and ready to use. Check the Dashboard for logs.",
                    action: {
                        label: "View Dashboard",
                        onClick: () => window.location.href = "/dashboard"
                    }
                });
            } else {
                throw new Error(data.error || 'Installation failed');
            }
        } catch (error) {
            toast.error(`Failed to install ${skill.name}`, {
                description: String(error) || "Please try again later or check your connection."
            });
        }
    };

    const handleExecuteAction = async (skillSlug: string, actionName: string) => {
        const toastId = toast.loading(`Executing ${actionName}...`);
        try {
            // Use execute-demo to allow execution without explicit authentication for this demo
            const response = await fetch('/api/execute-demo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ strategy: `${skillSlug}:${actionName}` })
            });
            const data = await response.json();

            if (data.success) {
                toast.success('Action executed successfully', { id: toastId });
                setSelectedSkillToExecute(null);
            } else {
                throw new Error(data.error);
            }
        } catch (e) {
            toast.error(`Execution failed: ${String(e)}`, { id: toastId });
        }
    };





    return (
        <main className="min-h-screen bg-[#050505]">
            <Navbar />

            {/* Hero Section */}
            <section className="relative pt-36 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(45,235,232,0.1),transparent_70%)]" />

                <div className="max-w-[1600px] w-full mx-auto relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-12"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-stellar-teal/10 border border-stellar-teal/30 mb-6">
                            <Package className="w-4 h-4 text-stellar-teal" />
                            <span className="text-sm text-stellar-teal">Nirium Matrix Hub</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent mb-4">
                            Extend Your Agent
                        </h1>
                        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                            Discover and install community-built skills to supercharge your Nirium agent.
                        </p>

                        {/* Stats */}
                        <div className="flex justify-center gap-8 mt-8">
                            <div className="text-center">
                                <div className="text-4xl font-black font-mono text-stellar-teal animate-pulse-slow">{stats.totalSkills}</div>
                                <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1">Skills</div>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl font-black font-mono text-stellar-teal animate-pulse-slow">
                                    {(stats.totalDownloads / 1000).toFixed(1)}K
                                </div>
                                <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1">Downloads</div>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl font-black font-mono text-stellar-teal animate-pulse-slow">{categories.length}</div>
                                <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1">Categories</div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Search Bar */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="max-w-2xl mx-auto mb-12"
                    >
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search skills by name, description, or tag..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-[#080808] border border-white/5 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-stellar-teal/50 focus:border-stellar-teal transition-all"
                            />
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Featured Skills Carousel */}
            {featuredSkills.length > 0 && (
                <section className="px-4 sm:px-6 lg:px-8 mb-12">
                    <div className="max-w-[1600px] w-full mx-auto">
                        <div className="flex items-center gap-2 mb-6">
                            <Sparkles className="w-5 h-5 text-yellow-400" />
                            <h2 className="text-xl font-semibold text-white">Featured Skills</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {featuredSkills.slice(0, 3).map((skill, idx) => (
                                <motion.div
                                    key={skill.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 + idx * 0.1 }}
                                    className="group relative overflow-hidden rounded-2xl bg-[#080808] border border-white/5 p-6 hover:border-stellar-teal/50 hover:shadow-[0_0_30px_rgba(45,235,232,0.1)] transition-all cursor-pointer"
                                >
                                    <div className="absolute top-4 right-4">
                                        <span className="px-2 py-1 text-xs bg-stellar-yellow/20 text-stellar-yellow rounded-full flex items-center gap-1">
                                            <Sparkles className="w-3 h-3" /> Featured
                                        </span>
                                    </div>

                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${CATEGORY_COLORS[skill.category] || 'from-slate-500 to-slate-600'} flex items-center justify-center mb-4`}>
                                        {(() => {
                                            const Icon = CATEGORY_ICONS[skill.category] || Code2;
                                            return <Icon className="w-6 h-6 text-white" />;
                                        })()}
                                    </div>

                                    <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-stellar-teal transition-colors">
                                        {skill.name}
                                    </h3>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1 mb-4 line-clamp-2">
                                        {skill.description}
                                    </p>

                                    <div className="flex items-center justify-between text-sm text-slate-500">
                                        <div className="flex items-center gap-3">
                                            <span className="flex items-center gap-1">
                                                <Download className="w-4 h-4" />
                                                {(skill.downloads / 1000).toFixed(1)}K
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                                {skill.rating}
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
                                                className="flex items-center gap-2 px-3 py-1.5 bg-slate-700/50 hover:bg-stellar-yellow hover:text-black text-white rounded-lg text-sm font-bold transition-colors border border-slate-600/50 hover:border-stellar-yellow z-10 relative"
                                            >
                                                <Zap className="w-3.5 h-3.5" />
                                                Install
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Categories */}
            <section className="px-4 sm:px-6 lg:px-8 mb-8">
                <div className="max-w-[1600px] w-full mx-auto">
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() => setSelectedCategory(null)}
                            className={`px-4 py-2 rounded-xl font-medium transition-all ${!selectedCategory
                                ? 'bg-purple-500 text-white'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                }`}
                        >
                            All Skills
                        </button>
                        {categories.map(cat => {
                            const Icon = CATEGORY_ICONS[cat.id] || Code2;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${selectedCategory === cat.id
                                        ? 'bg-purple-500 text-white'
                                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {cat.name}
                                    <span className="text-xs opacity-60">({cat.count})</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Sort Options */}
            <section className="px-4 sm:px-6 lg:px-8 mb-6">
                <div className="max-w-[1600px] w-full mx-auto flex items-center justify-between">
                    <p className="text-slate-400">
                        {filteredSkills.length} skills found
                    </p>
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-slate-500" />
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-stellar-teal/50"
                        >
                            <option value="downloads">Most Downloads</option>
                            <option value="rating">Highest Rated</option>
                            <option value="newest">Newest</option>
                        </select>
                    </div>
                </div>
            </section>

            {/* Skills Grid */}
            <section className="px-4 sm:px-6 lg:px-8 pb-24">
                <div className="max-w-[1600px] w-full mx-auto">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="bg-slate-800/50 rounded-2xl h-64 border border-slate-700/50" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={selectedCategory || 'all'}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                            >
                                {filteredSkills.map((skill, idx) => (
                                    <motion.div
                                        key={skill.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="group bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6 hover:border-purple-500/30 hover:bg-slate-800/80 transition-all"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${CATEGORY_COLORS[skill.category] || 'from-slate-500 to-slate-600'} flex items-center justify-center`}>
                                                {(() => {
                                                    const Icon = CATEGORY_ICONS[skill.category] || Code2;
                                                    return <Icon className="w-5 h-5 text-white" />;
                                                })()}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {skill.isVerified && (
                                                    <span title="Verified">
                                                        <CheckCircle className="w-4 h-4 text-green-400" aria-label="Verified" />
                                                    </span>
                                                )}
                                                <span className="text-xs text-slate-500">v{skill.version}</span>
                                            </div>
                                        </div>

                                        <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-stellar-teal transition-colors">
                                            {skill.name}
                                        </h3>
                                        <p className="text-sm text-slate-500 mb-1">by {skill.author}</p>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1 mb-4 line-clamp-2">
                                            {skill.description}
                                        </p>

                                        {/* Tags */}
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {skill.tags.slice(0, 3).map(tag => (
                                                <span
                                                    key={tag}
                                                    className="px-2 py-1 text-xs bg-slate-700/50 text-slate-300 rounded-md"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>

                                        {/* Stats & Install */}
                                        <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                                            <div className="flex items-center gap-4 text-sm text-slate-500">
                                                <span className="flex items-center gap-1">
                                                    <Download className="w-4 h-4" />
                                                    {skill.downloads.toLocaleString()}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                                    {skill.rating} ({skill.reviewCount})
                                                </span>
                                            </div>

                                            {installedSkills[skill.id] || installedSkills[skill.slug] ? (
                                                <div className="flex gap-2">
                                                    <Link href="/agents">
                                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 text-green-400 rounded-lg text-sm font-medium border border-green-500/20 hover:bg-green-500/20 transition-all cursor-pointer">
                                                            <span className="relative flex h-2 w-2">
                                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                                            </span>
                                                            Monitor
                                                        </div>
                                                    </Link>

                                                    {skill.actions && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                setSelectedSkillToExecute(skill);
                                                            }}
                                                            className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 text-sm font-medium transition-colors border border-blue-500/20"
                                                            title="Run Action"
                                                        >
                                                            <Play className="w-3 h-3" />
                                                        </button>
                                                    )}

                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            setSelectedSkillToInstall(skill);
                                                        }}
                                                        className="flex items-center gap-2 px-3 py-1.5 bg-stellar-teal/10 text-stellar-teal rounded-lg hover:bg-stellar-teal/20 text-sm font-medium transition-colors border border-stellar-teal/20"
                                                        title="Install to another agent"
                                                    >
                                                        <UserPlus className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setSelectedSkillToInstall(skill)}
                                                    className="px-3 py-1.5 bg-stellar-yellow text-black rounded-lg text-sm font-bold hover:shadow-[0_0_20px_rgba(255,200,0,0.3)] transition-colors flex items-center gap-1"
                                                >
                                                    <Zap className="w-3.5 h-3.5" />
                                                    Install
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </AnimatePresence>
                    )}

                    {!loading && filteredSkills.length === 0 && (
                        <div className="text-center py-16">
                            <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-white mb-2">No skills found</h3>
                            <p className="text-slate-400">
                                Try adjusting your search or filter criteria.
                            </p>
                        </div>
                    )}
                </div>
            </section>

            {/* CTA Section */}
            <section className="px-4 sm:px-6 lg:px-8 pb-24">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-[#080808] rounded-2xl border border-white/5 p-8 text-center mt-12 mb-20">
                        <Code2 className="w-12 h-12 text-stellar-teal mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-white mb-2">Build Your Own Skill</h3>
                        <p className="text-slate-400 mb-6">
                            Create and publish skills for the Nirium community.
                            Share your trading strategies, integrations, and automation tools.
                        </p>
                        <div className="flex flex-wrap justify-center gap-3">
                            <Link
                                href="/docs"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-xl font-medium hover:bg-purple-600 transition-colors"
                            >
                                Read the Developer Docs
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                            <Link
                                href="/strategies/builder"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 text-white border border-white/10 rounded-xl font-medium hover:bg-white/10 transition-colors"
                            >
                                Open Strategy Builder
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Install Modal */}
            <InstallSkillModal
                skill={selectedSkillToInstall}
                isOpen={!!selectedSkillToInstall}
                onClose={() => setSelectedSkillToInstall(null)}
                //@ts-ignore
                onInstall={handleInstall}
            />
            {/* Execute Modal */}
            <AnimatePresence>
                {selectedSkillToExecute && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        onClick={() => setSelectedSkillToExecute(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-md bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 shadow-2xl"
                        >
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <Play className="w-5 h-5 text-stellar-teal" />
                                Execute {selectedSkillToExecute.name}
                            </h3>
                            <div className="space-y-3">
                                {selectedSkillToExecute.actions?.map(action => (
                                    <button
                                        key={action.name}
                                        onClick={() => handleExecuteAction(selectedSkillToExecute.slug, action.name)}
                                        className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-stellar-teal/30 transition-all group"
                                    >
                                        <div className="text-left">
                                            <div className="font-mono text-stellar-teal text-sm group-hover:text-white transition-colors">{action.name}</div>
                                            <div className="text-xs text-gray-500">{action.description}</div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-stellar-teal" />
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main >
    );
}
