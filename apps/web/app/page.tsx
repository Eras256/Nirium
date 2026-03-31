'use client';

import { useFreighter } from "@/hooks/useFreighter";
import Link from "next/link";
import { Suspense, useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
    Zap, Shield, Cpu, Layers, Terminal as TerminalIcon,
    ArrowRight, Bot, Activity, Landmark, Database,
    Download, ChevronRight, Workflow, TrendingUp, Lock,
    Globe, Code2, BarChart3, Repeat2, Trophy, ExternalLink,
    Brain, Puzzle, LineChart, User, Smartphone
} from "lucide-react";
import { motion } from "framer-motion";
import dynamic from 'next/dynamic';

const NeuralCanvas = dynamic(() => import('@/components/3d/NeuralCanvas').then((mod) => mod.NeuralCanvas), { ssr: false });
import Navbar from "@/components/layout/Navbar";
import { SectionBrandLogo } from "@/components/ui/SectionBrandLogo";
import { useLanguage } from "@/context/LanguageContext";
import { supabase } from "@/lib/supabase";

const AGENT_NAMES = [
    { name: 'Titan', role: 'Swarm Coordinator', color: '#FFD700' },
    { name: 'Eliza', role: 'Sentiment Analysis', color: '#2DEBE8' },
    { name: 'Maux', role: 'SDEX Liquidity', color: '#A78BFA' },
    { name: 'Chronos', role: 'Temporal Arbitrage', color: '#F97316' },
    { name: 'Astra', role: 'Pool Explorer', color: '#34D399' },
    { name: 'Void', role: 'Dark Pool Strategy', color: '#6B7280' },
    { name: 'Nexus', role: 'Inter-Agent Signals', color: '#EC4899' },
    { name: 'Gaia', role: 'Yield Optimizer', color: '#10B981' },
    { name: 'Orion', role: 'Micro-pair Hunter', color: '#3B82F6' },
    { name: 'Sentinel', role: 'Vault Auditor', color: '#EF4444' },
    { name: 'Matrix', role: 'Data Analyst', color: '#8B5CF6' },
    { name: 'Atlas', role: 'Capital Support', color: '#F59E0B' },
    { name: 'Nova', role: 'New Listings', color: '#60A5FA' },
    { name: 'Cyber', role: 'MCP Audit Link', color: '#2DEBE8' },
    { name: 'Nirium-1', role: 'Protocol Maintenance', color: '#FCD34D' },
];

const CONTRACTS = [
    { name: 'Nirium Vault', addr: 'CDMN...3DHU', full: 'CDMNZIICSHWQMRLWOAVE5VACRY5LVTLGMB75PS3JB5KFMR6TUJXV3DHU', role_key: 'vault', color: '#00F3FF' },
    { name: 'ELO Registry', addr: 'CC6Z...JWF2', full: 'CC6Z3WJWRKVEAXEKIQ5S3LFEMKRF4L2FTN5YZDQU27MQRQAWA5QBJWF2', role_key: 'elo', color: '#A78BFA' },
    { name: 'Marketplace', addr: 'CB6Q...UABC', full: 'CB6Q3LKBJ7CAAZY4MK7EG5R6FDDTJHB52ZEENI6BQLBJNFKBQRIAUABC', role_key: 'marketplace', color: '#34D399' },
];

export default function Home() {
    const { t } = useLanguage();
    const router = useRouter();
    const { address: accountStr, isConnected } = useFreighter();
    const [agentLog, setAgentLog] = useState<string[]>([]);
    const [ticker, setTicker] = useState(0);

    const handleLaunch = () => {
        if (!isConnected) {
            toast.error(t.nav.auth_matrix, { description: t.nav.stellar_connected });
            return;
        }
        router.push("/dashboard");
    };

    useEffect(() => {
        const client = supabase;
        const FALLBACK_LOGS = [
            "[Matrix] Neural Matrix Uplink established. Swarm broadcasting on-chain...",
            "[Titan] Vault architecture synchronized — 3 asset classes active",
            "[Astra] DeFindex USDC yield route optimized — APY 14.2%",
        ];

        if (!client) {
            setAgentLog(FALLBACK_LOGS);
            return;
        }

        // Fetch logs via REST polling (reliable without Realtime enabled)
        const fetchLogs = async () => {
            try {
                const { data } = await client
                    .from('logs')
                    .select('*')
                    .order('timestamp', { ascending: false })
                    .limit(8);
                
                if (data && data.length > 0) {
                    setAgentLog(data.map((l: any) => `[${l.agent_id}] ${l.message}`).reverse());
                }
                // If empty, keep whatever is currently shown
            } catch (e) {
                console.warn("[Neural Feed] fetch error:", e);
            }
        };

        // Show fallback immediately, then replace with real data
        setAgentLog(FALLBACK_LOGS);
        fetchLogs();

        // Poll every 5 seconds
        const pollInterval = setInterval(fetchLogs, 5000);

        return () => {
            clearInterval(pollInterval);
        };
    }, []);

    // Animate swarm count ticker
    useEffect(() => {
        const interval = setInterval(() => setTicker(t => t + Math.floor(Math.random() * 3 + 1)), 4000);
        return () => clearInterval(interval);
    }, []);

    const fadeUp = (delay = 0) => ({
        initial: { opacity: 0, y: 30 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.6, delay },
    });

    return (
        <main className="min-h-screen bg-[#050505] text-white selection:bg-stellar-teal/30 overflow-hidden relative">
            <Navbar />

            {/* Background Gradients */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-stellar-yellow/10 to-transparent opacity-50" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(45,235,232,0.03),transparent_70%)]" />
            </div>

            {/* ── HERO ─────────────────────────────────────────────────────── */}
            <section className="relative z-10 container mx-auto px-4 pt-48 pb-32">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="space-y-8"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-mono text-stellar-teal mb-4">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-stellar-teal opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-stellar-teal"></span>
                            </span>
                            v0.3.0 // {t.footer.testnet_live}
                        </div>

                        <div className="flex flex-col xl:flex-row items-center xl:items-start gap-10">
                            <SectionBrandLogo className="!justify-start mb-0 !opacity-100" size="w-32 md:w-48 lg:w-56" />
                            <div>
                                <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] lg:leading-[0.85] uppercase italic">
                                    {t.home.hero_title_1} <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-stellar-teal to-stellar-yellow">{t.home.hero_title_2}</span>
                                </h1>
                            </div>
                        </div>

                        <p className="text-gray-400 text-lg md:text-xl max-w-xl leading-relaxed">
                            {t.home.hero_subtitle}
                        </p>

                        {/* Live swarm counter pill */}
                        <div className="flex flex-wrap gap-3">
                            <StatPill label={t.home.stat_agents} value="15" color="teal" />
                            <StatPill label={t.home.stat_contracts} value="4" color="yellow" />
                            <StatPill label={t.home.stat_throughput} value="~112 tx/min" color="purple" />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4 w-full">
                            <button
                                onClick={handleLaunch}
                                className="w-full sm:w-auto group relative px-6 sm:px-8 py-4 bg-stellar-yellow text-black font-black rounded-lg transition-all hover:shadow-[0_0_30px_rgba(255,200,0,0.5)] active:scale-95 flex justify-center"
                            >
                                <span className="flex items-center gap-2">
                                    {t.home.launch_dashboard} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </span>
                            </button>
                            <Link
                                href="/docs"
                                className="w-full sm:w-auto px-6 sm:px-8 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-lg hover:bg-white/10 transition-all text-center flex justify-center items-center"
                            >
                                {t.home.read_protocol}
                            </Link>
                        </div>
                    </motion.div>

                    <div className="relative h-[600px] hidden lg:block">
                        {/* @ts-ignore */}
                        <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-stellar-teal font-mono animate-pulse">CONNECTING NEURAL ORB...</div>}>
                            <NeuralCanvas />
                        </Suspense>
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1 }}
                            className="absolute bottom-10 -left-10 w-[400px] bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl p-4 font-mono text-[11px] shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
                                <span className="text-stellar-teal uppercase tracking-widest text-[10px] font-bold">Neural Feed // Uplink</span>
                                <div className="flex gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-stellar-teal/50 animate-pulse" />
                                    <div className="w-2 h-2 rounded-full bg-stellar-yellow/50 animate-pulse" />
                                </div>
                            </div>
                            <div className="space-y-1.5 h-32 overflow-hidden">
                                {agentLog.map((log, i) => {
                                    const parts = log.split('|');
                                    const mainMsg = parts[0];
                                    const hashPart = parts[1];
                                    
                                    return (
                                        <div key={i} className="flex gap-2 text-[10px]">
                                            <span className="text-white/20 select-none">{i.toString().padStart(2, '0')}</span>
                                            <span className="text-gray-300">
                                                {mainMsg}
                                                {hashPart && (
                                                    <span className="text-stellar-yellow/80 ml-1 font-bold">
                                                        {hashPart.trim()}
                                                    </span>
                                                )}
                                            </span>
                                        </div>
                                    );
                                })}
                                <div className="flex gap-2 text-stellar-teal">
                                    <span className="text-stellar-teal animate-pulse">{">"}</span>
                                    <span className="animate-pulse">_</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ── PROTOCOL INTEGRATIONS ──────────────────────────────────────── */}
            <section className="py-20 border-y border-white/5 bg-black/50">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col items-center gap-6 mb-12">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1 }}
                            className="relative"
                        >
                            <img 
                                src="/brand/NiLo.png" 
                                alt="Nirium Logo" 
                                className="w-48 sm:w-64 h-auto object-contain drop-shadow-[0_0_40px_rgba(45,235,232,0.4)]"
                            />
                        </motion.div>
                        <h3 className="text-center text-[10px] font-mono text-gray-500 tracking-[0.4em] uppercase font-bold">{t.home.built_for_stellar}</h3>
                    </div>
                    <div className="flex flex-wrap justify-center gap-6 sm:gap-12 md:gap-24 items-center grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-700">
                        <ProtocolItem icon={Landmark} name="BLEND Protocol" />
                        <ProtocolItem icon={Zap} name="SOROSWAP" />
                        <ProtocolItem icon={ChevronRight} name="PHOENIX DEX" />
                        <ProtocolItem icon={Cpu} name="SOROBAN" />
                        <ProtocolItem icon={Database} name="HORIZON" />
                    </div>
                </div>
            </section>

            {/* ── HOW TO GET STARTED ──────────────────────────────────────── */}
            <section className="py-24 container mx-auto px-4">
                <motion.div {...fadeUp()} className="text-center mb-16 space-y-4">
                    <h2 className="text-4xl md:text-6xl font-black tracking-tighter">
                        {t.home.how_to_title} <span className="text-stellar-teal">{t.home.how_to_span}</span>
                    </h2>
                    <p className="text-gray-400 max-w-xl mx-auto text-lg">{t.home.how_to_subtitle}</p>
                </motion.div>
                <div className="relative max-w-6xl mx-auto">
                    {/* Connecting line: Vertical on mobile, Horizontal on large screens */}
                    <div className="absolute left-1/2 md:top-10 md:left-0 md:w-full md:h-[2px] w-[2px] h-full bg-gradient-to-b md:bg-gradient-to-r from-stellar-teal/40 via-stellar-yellow/30 to-transparent -translate-x-1/2 md:translate-x-0 z-0" />

                    <div className="relative z-10 space-y-12 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-8 lg:gap-12">
                        {t.home.how_to_steps.map((s, i) => (
                            <motion.div key={i} {...fadeUp(i * 0.15)} className="relative flex flex-col items-center text-center group">
                                <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black mb-6 border border-stellar-teal/30 bg-[#0A0A0A] group-hover:border-stellar-teal/60 group-hover:bg-stellar-teal/10 transition-all shadow-lg" style={{ boxShadow: '0 0 30px rgba(45,235,232,0.08)' }}>
                                    <span className="text-stellar-teal font-mono text-lg">{s.step}</span>
                                </div>
                                <h3 className="text-xl font-black tracking-tight mb-3">{s.title}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed max-w-[240px]">{s.desc}</p>
                            </motion.div>
                        ))}
                    </div>

                </div>
            </section>

            {/* ── PRO FEATURES GRID ─────────────────────────────────────────── */}
            <section className="py-24 bg-white/[0.02] border-y border-white/5">
                <div className="container mx-auto px-4">
                    <motion.div {...fadeUp()} className="text-center mb-16 space-y-4">
                        <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic">
                            {t.home.pro_features_title} <span className="text-stellar-teal">{t.home.pro_features_span}</span>
                        </h2>
                        <p className="text-gray-400 max-w-xl mx-auto text-lg">{t.home.pro_features_subtitle}</p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                        {[
                            { item: t.home.pro_features_list.plugins, icon: Puzzle },
                            { item: t.home.pro_features_list.skills, icon: Brain },
                            { item: t.home.pro_features_list.leaderboard, icon: Trophy },
                            { item: t.home.pro_features_list.analytics, icon: LineChart },
                            { item: t.home.pro_features_list.agents, icon: Cpu },
                        ].map((f, i) => (
                            <motion.div key={i} {...fadeUp(i * 0.1)} className="p-8 rounded-2xl bg-black/40 border border-white/10 hover:border-stellar-teal/30 transition-all group">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-stellar-teal/5 border border-stellar-teal/20 group-hover:scale-110 transition-transform`}>
                                    <f.icon className="w-6 h-6 text-stellar-teal" />
                                </div>
                                <h3 className="text-xl font-black tracking-tight mb-3 uppercase italic">{f.item.title}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">{f.item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── DUAL SPECIES INTERFACE SECTION ──────────────────────────── */}
            <section className="py-24 relative overflow-hidden">
                <div className="container mx-auto px-4">
                    <motion.div {...fadeUp()} className="text-center mb-16 space-y-4">
                        <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic leading-none">
                            {t.home.dual_species_title} <span className="text-stellar-teal">{t.home.dual_species_span}</span>
                        </h2>
                        <p className="text-gray-400 max-w-xl mx-auto text-lg">{t.home.dual_species_subtitle}</p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                        {/* Human Operators Card */}
                        <motion.div {...fadeUp(0.1)} className="group relative p-1 rounded-3xl bg-gradient-to-b from-white/10 to-transparent hover:from-stellar-teal/20 transition-all duration-500">
                            <div className="bg-[#0A0A0A] rounded-[calc(1.5rem-4px)] p-10 h-full flex flex-col items-start text-left space-y-6 relative overflow-hidden">
                                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-stellar-teal/40 transition-colors">
                                    <User className="w-6 h-6 text-stellar-teal" />
                                </div>
                                <h3 className="text-3xl font-black tracking-tighter uppercase italic">{t.home.dual_species_human_title}</h3>
                                <p className="text-gray-400 leading-relaxed grow">
                                    {t.home.dual_species_human_desc}
                                </p>
                                <Link href="/dashboard" className="flex items-center gap-2 text-white font-bold group/btn hover:text-stellar-teal transition-colors">
                                    {t.home.dual_species_human_cta} <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </motion.div>

                        {/* Autonomous Agents Card */}
                        <motion.div {...fadeUp(0.2)} className="group relative p-1 rounded-3xl bg-gradient-to-b from-white/10 to-transparent hover:from-stellar-yellow/20 transition-all duration-500">
                            <div className="bg-[#0A0A0A] rounded-[calc(1.5rem-4px)] p-10 h-full flex flex-col items-start text-left space-y-6 relative overflow-hidden">
                                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-stellar-yellow/40 transition-colors">
                                    <Bot className="w-6 h-6 text-stellar-yellow" />
                                </div>
                                <h3 className="text-3xl font-black tracking-tighter uppercase italic">{t.home.dual_species_agent_title}</h3>
                                <p className="text-gray-400 leading-relaxed grow">
                                    {t.home.dual_species_agent_desc}
                                </p>
                                <Link href="/agents" className="flex items-center gap-2 text-white font-bold group/btn hover:text-stellar-yellow transition-colors">
                                    {t.home.dual_species_agent_cta} <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ── UNIVERSAL TOOLKIT SECTION ─────────────────────────────── */}
            <section className="py-24 bg-white/[0.01] border-y border-white/5">
                <div className="container mx-auto px-4">
                    <motion.div {...fadeUp()} className="text-center mb-16 space-y-4">
                        <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic">
                            {t.home.stack_title} <span className="text-stellar-yellow">{t.home.stack_span}</span>
                        </h2>
                        <p className="text-gray-400 max-w-xl mx-auto text-lg leading-relaxed">
                            {t.home.stack_subtitle}
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-8 max-w-6xl mx-auto">
                        {[
                            { item: t.home.stack_list.python, icon: Code2, label: "Python" },
                            { item: t.home.stack_list.ts, icon: Layers, label: "TypeScript" },
                            { item: t.home.stack_list.cli, icon: TerminalIcon, label: "CLI" },
                            { item: t.home.stack_list.mcp, icon: Workflow, label: "MCP" },
                            { item: t.home.stack_list.companion, icon: Smartphone, label: "App" },
                        ].map((s, i) => (
                            <motion.div key={i} {...fadeUp(i * 0.1)} className="p-6 rounded-2xl bg-[#0A0A0A] border border-white/5 hover:border-stellar-yellow/20 transition-all text-center group">
                                <div className="w-12 h-12 rounded-full bg-white/5 mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <s.icon className="w-6 h-6 text-stellar-yellow/60 group-hover:text-stellar-yellow transition-colors" />
                                </div>
                                <h4 className="text-sm font-bold uppercase tracking-wider mb-1">{s.item.title}</h4>
                                <p className="text-[10px] text-gray-500 font-mono uppercase italic">{s.item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── VISUAL STRATEGY BUILDER SECTION ───────────────────────── */}
            <section className="py-24 relative overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div {...fadeUp()} className="space-y-8">
                            <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-[0.9]">
                                {t.home.builder_section_title} <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-stellar-teal to-purple-500">{t.home.builder_section_span}</span>
                            </h2>
                            <p className="text-gray-400 text-lg leading-relaxed max-w-xl">
                                {t.home.builder_section_subtitle}
                            </p>
                            <ul className="space-y-4">
                                {(t.home.builder_section_features as string[]).map((feature, i) => (
                                    <li key={i} className="flex items-center gap-3 text-white/80 font-medium">
                                        <div className="w-2 h-2 rounded-full bg-stellar-teal shadow-[0_0_10px_rgba(45,235,232,0.8)]" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="relative group"
                        >
                            {/* Mockup Browser Window */}
                            <div className="relative bg-[#0A0A0A] rounded-2xl border border-white/10 shadow-2xl overflow-hidden aspect-[1.4/1]">
                                {/* Header */}
                                <div className="h-10 border-b border-white/5 bg-white/[0.02] flex items-center justify-between px-4">
                                    <div className="flex gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                                    </div>
                                    <span className="text-[10px] font-mono text-gray-600 tracking-widest uppercase">Strategy Builder</span>
                                </div>

                                {/* Builder Body */}
                                <div className="flex h-full">
                                    {/* Sidebar */}
                                    <div className="w-1/3 border-r border-white/5 p-4 space-y-4 bg-black/20">
                                        <div className="text-[10px] text-gray-600 font-bold uppercase tracking-wider mb-2">Triggers</div>
                                        {["Price > $2.50", "Every 1 Hour", "High Gas"].map((trigger, i) => (
                                            <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-3 text-[10px] text-gray-400 font-mono">
                                                {trigger}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Canvas Area */}
                                    <div className="flex-1 relative p-8">
                                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(45,235,232,0.05)_0%,transparent_100%)]" />

                                        {/* Animated Nodes */}
                                        <div className="relative flex items-center justify-around h-full">
                                            {/* Node 1 */}
                                            <motion.div
                                                animate={{ y: [0, -5, 0] }}
                                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                                className="bg-stellar-yellow text-black p-3 rounded-lg flex items-center gap-2 shadow-lg z-10"
                                            >
                                                <Zap className="w-3 h-3 fill-black" />
                                                <span className="text-[10px] font-bold uppercase">Every 1 Hour</span>
                                            </motion.div>

                                            {/* Pulsing Connector */}
                                            <div className="absolute top-1/2 left-1/4 right-1/4 h-[2px] -translate-y-1/2">
                                                <div className="w-full h-full bg-gradient-to-r from-stellar-yellow to-stellar-teal opacity-20" />
                                                <motion.div
                                                    animate={{ left: ["0%", "100%"] }}
                                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                                    className="absolute top-0 w-8 h-full bg-stellar-teal blur-sm"
                                                />
                                            </div>

                                            {/* Node 2 */}
                                            <motion.div
                                                animate={{ y: [0, 5, 0] }}
                                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                                className="bg-stellar-teal text-black p-3 rounded-lg flex items-center gap-2 shadow-lg z-10"
                                            >
                                                <Zap className="w-3 h-3 fill-black" />
                                                <span className="text-[10px] font-bold uppercase">Execute Swap</span>
                                            </motion.div>
                                        </div>

                                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[9px] text-gray-600 font-mono tracking-wide">
                                            Drag nodes to connect
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Decorative Background Elements */}
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl" />
                            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-stellar-teal/10 rounded-full blur-3xl" />
                        </motion.div>
                    </div>
                </div>
            </section>

            <section className="py-24 container mx-auto px-4">
                <motion.div {...fadeUp()} className="text-center mb-16 space-y-4">
                    <h2 className="text-4xl md:text-6xl font-black tracking-tighter">
                        {t.home.swarm_title} <span className="text-stellar-teal">{t.home.swarm_title_span}</span>
                    </h2>
                    <p className="text-gray-400 max-w-2xl mx-auto text-lg">{t.home.swarm_subtitle}</p>
                </motion.div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                        { label: t.home.stat_agents, value: "15", sub: t.home.stat_agents_sub, icon: Bot, color: "teal" },
                        { label: t.home.stat_throughput_label, value: "~112", sub: t.home.stat_throughput_sub, icon: Repeat2, color: "yellow" },
                        { label: t.home.stat_latency_label, value: "<100ms", sub: t.home.stat_latency_sub, icon: Activity, color: "purple" },
                        { label: t.home.stat_capacity_label, value: "~1M", sub: t.home.stat_capacity_sub, icon: BarChart3, color: "green" },
                    ].map((s, i) => (
                        <motion.div key={i} {...fadeUp(i * 0.1)} className={`p-6 rounded-2xl bg-white/[0.03] border border-white/10 group hover:border-${s.color === 'teal' ? 'stellar-teal' : s.color === 'yellow' ? 'stellar-yellow' : 'white'}/30 transition-all`}>
                            <s.icon className={`w-6 h-6 mb-3 ${s.color === 'teal' ? 'text-stellar-teal' : s.color === 'yellow' ? 'text-stellar-yellow' : s.color === 'purple' ? 'text-purple-400' : 'text-green-400'}`} />
                            <div className="text-3xl font-black tracking-tight">{s.value}</div>
                            <div className="text-sm font-bold text-white/80 mt-1">{s.label}</div>
                            <div className="text-xs text-gray-500 mt-0.5">{s.sub}</div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ── DEPLOY YOUR AGENT CTA ─────────────────────────────────────── */}
            <section className="py-32 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(45,235,232,0.05),transparent_60%)]" />
                <div className="container mx-auto px-4 relative z-10">
                    <motion.div {...fadeUp()} className="text-center mb-4">
                        <div className="flex flex-col items-center gap-8 mb-6">
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 1 }}
                                className="relative"
                            >
                                <img 
                                    src="/brand/NiLo.png" 
                                    alt="Nirium Logo" 
                                    className="w-48 sm:w-64 h-auto object-contain drop-shadow-[0_0_40px_rgba(45,235,232,0.4)]"
                                />
                            </motion.div>
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-stellar-teal/10 border border-stellar-teal/30 rounded-full text-xs font-mono text-stellar-teal">
                                <span className="w-1.5 h-1.5 rounded-full bg-stellar-teal animate-ping" />
                                {t.home.deploy_cta_badge}
                            </div>
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-4">
                            {t.home.deploy_cta_title} <span className="text-transparent bg-clip-text bg-gradient-to-r from-stellar-teal to-stellar-yellow">{t.home.deploy_cta_span}</span>
                        </h2>
                        <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">{t.home.deploy_cta_subtitle}</p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-6 mt-14 mb-14">
                        {[
                            { title: t.home.deploy_cta_card1_title, desc: t.home.deploy_cta_card1_desc, tag: t.home.deploy_cta_card1_tag, color: '#2DEBE8', icon: '🔗' },
                            { title: t.home.deploy_cta_card2_title, desc: t.home.deploy_cta_card2_desc, tag: t.home.deploy_cta_card2_tag, color: '#FFD700', icon: '🤖' },
                            { title: t.home.deploy_cta_card3_title, desc: t.home.deploy_cta_card3_desc, tag: t.home.deploy_cta_card3_tag, color: '#A78BFA', icon: '💡' },
                        ].map((card, i) => (
                            <motion.div key={i} {...fadeUp(i * 0.12)} whileHover={{ y: -8, scale: 1.01 }} className="relative p-6 rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden group transition-all">
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: `radial-gradient(circle at 50% 0%,${card.color}08,transparent 60%)` }} />
                                <div className="text-3xl mb-4">{card.icon}</div>
                                <div className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-mono mb-4" style={{ background: `${card.color}15`, color: card.color, border: `1px solid ${card.color}30` }}>
                                    {card.tag}
                                </div>
                                <h3 className="text-xl font-black tracking-tight mb-3">{card.title}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">{card.desc}</p>
                            </motion.div>
                        ))}
                    </div>

                    <motion.div {...fadeUp(0.3)} className="flex flex-col sm:flex-row justify-center gap-4">
                        <button
                            onClick={handleLaunch}
                            className="group px-8 py-4 bg-stellar-teal text-black font-black rounded-xl transition-all hover:shadow-[0_0_40px_rgba(45,235,232,0.5)] hover:scale-105 active:scale-95"
                        >
                            <span className="flex items-center justify-center gap-2">
                                {t.home.deploy_cta_primary} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </span>
                        </button>
                        <Link href="/docs" className="px-8 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-all text-center">
                            {t.home.deploy_cta_secondary}
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* ── FEATURES MATRIX ───────────────────────────────────────────── */}
            <section className="py-32 bg-black/30 border-t border-white/5">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-20 space-y-4">
                        <h2 className="text-4xl md:text-6xl font-black tracking-tighter">{t.home.atomic_capabilities_title} <span className="text-stellar-teal">{t.home.atomic_capabilities_span}</span></h2>
                        <p className="text-gray-400 max-w-2xl mx-auto text-lg">{t.home.atomic_capabilities_subtitle}</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <FeatureCard icon={Zap} title={t.home.features.path_arb.title} desc={t.home.features.path_arb.desc} color="cyan" />
                        <FeatureCard icon={Shield} title={t.home.features.vaults.title} desc={t.home.features.vaults.desc} color="purple" />
                        <FeatureCard icon={Workflow} title={t.home.features.bundling.title} desc={t.home.features.bundling.desc} color="blue" />
                        <FeatureCard icon={Database} title={t.home.features.archive.title} desc={t.home.features.archive.desc} color="pink" />
                    </div>
                </div>
            </section>

            {/* ── ELO REPUTATION SECTION ────────────────────────────────────── */}
            <section className="py-32 container mx-auto px-4">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <motion.div {...fadeUp()} className="space-y-6">
                        <h2 className="text-4xl md:text-6xl font-black tracking-tighter">
                            {t.home.elo_title_1} <br /><span className="text-stellar-yellow">{t.home.elo_title_2}</span>
                        </h2>
                        <p className="text-gray-400 text-lg leading-relaxed">{t.home.elo_subtitle}</p>
                        <div className="space-y-4">
                            {[
                                { tier: 'Matrix', elo: '≥ 2000', color: '#2DEBE8', label: t.home.elo_tier_matrix },
                                { tier: 'Gold', elo: '≥ 1500', color: '#FFD700', label: t.home.elo_tier_gold },
                                { tier: 'Silver', elo: '≥ 1000', color: '#A78BFA', label: t.home.elo_tier_silver },
                            ].map(t2 => (
                                <div key={t2.tier} className="flex items-center gap-4 p-4 bg-white/[0.03] rounded-xl border border-white/10">
                                    <Trophy className="w-5 h-5 shrink-0" style={{ color: t2.color }} />
                                    <div>
                                        <div className="font-bold" style={{ color: t2.color }}>{t2.tier} Tier — ELO {t2.elo}</div>
                                        <div className="text-xs text-gray-500">{t2.label}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Link href="/leaderboard" className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-lg font-bold hover:bg-white/10 transition-all">
                            {t.home.elo_cta} <ExternalLink className="w-4 h-4" />
                        </Link>
                    </motion.div>

                    {/* Swarm Roster */}
                    <motion.div {...fadeUp(0.2)}>
                        <div className="grid grid-cols-3 gap-3">
                            {AGENT_NAMES.map((agent, i) => (
                                <motion.div
                                    key={agent.name}
                                    whileHover={{ scale: 1.05 }}
                                    className="p-3 bg-white/[0.03] border border-white/10 rounded-xl text-center cursor-pointer hover:border-white/30 transition-all"
                                >
                                    <div className="w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center text-[10px] font-black" style={{ background: `${agent.color}20`, color: agent.color, border: `1px solid ${agent.color}40` }}>
                                        {agent.name.slice(0, 2)}
                                    </div>
                                    <div className="text-[10px] font-bold">{agent.name}</div>
                                    <div className="text-[9px] text-gray-600 leading-tight">{agent.role}</div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ── LIVE CONTRACTS ────────────────────────────────────────────── */}
            <section className="py-24 bg-black/40 border-t border-white/5">
                <div className="container mx-auto px-4">
                    <motion.div {...fadeUp()} className="text-center mb-16 space-y-4">
                        <h2 className="text-4xl md:text-6xl font-black tracking-tighter">
                            {t.home.contracts_title} <span className="text-stellar-teal">{t.home.contracts_span}</span>
                        </h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">{t.home.contracts_subtitle}</p>
                    </motion.div>
                    <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                        {CONTRACTS.map((c, i) => (
                            <motion.a
                                key={c.name}
                                {...fadeUp(i * 0.1)}
                                href={`https://stellar.expert/explorer/testnet/contract/${c.full}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-4 p-5 bg-white/[0.03] border border-white/10 rounded-xl hover:border-white/30 transition-all group"
                            >
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${c.color}15`, border: `1px solid ${c.color}30` }}>
                                    <Lock className="w-4 h-4" style={{ color: c.color }} />
                                </div>
                                <div className="min-w-0">
                                    <div className="font-bold text-sm">{c.name}</div>
                                    <div className="text-xs font-mono text-gray-500 truncate">{c.addr}</div>
                                    <div className="text-[10px] text-gray-600 mt-0.5">{t.home[`contract_role_${c.role_key}` as keyof typeof t.home] as string}</div>
                                </div>
                                <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-white ml-auto shrink-0 transition-colors" />
                            </motion.a>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── SDK SECTION ───────────────────────────────────────────────── */}
            <section className="py-32 border-t border-white/5">
                <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-6">
                        <h3 className="text-3xl md:text-5xl font-black leading-tight tracking-tighter">{t.home.sdk_title_1} <br /><span className="text-stellar-yellow">{t.home.sdk_title_2}</span></h3>
                        <p className="text-gray-400 text-lg">{t.home.sdk_subtitle}</p>
                        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6 font-mono text-sm group relative overflow-hidden">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex gap-2">
                                    <span className="text-gray-500">npm</span>
                                    <span className="text-gray-500">pnpm</span>
                                    <span className="text-blue-400 font-bold border-b border-blue-400">sdk</span>
                                </div>
                                <Activity className="w-4 h-4 text-stellar-teal" />
                            </div>
                            <code className="text-white block overflow-x-auto whitespace-nowrap text-xs sm:text-sm custom-scrollbar pb-2">
                                <span className="text-purple-400">import</span> {"{"}Agent{"}"} <span className="text-purple-400">from</span> <span className="text-green-400">&apos;@nirium/sdk&apos;</span>;<br />
                                <span className="text-blue-400">const</span> bot = <span className="text-blue-400">new</span> Agent(<span className="text-yellow-300">&quot;sk_live_...&quot;</span>);<br />
                                <span className="text-gray-500">// Subscribe to Path Arb signals</span><br />
                                bot.subscribe(<span className="text-cyan-400">&apos;path_arb&apos;</span>, (signal) ={">"} bot.execute(signal));
                            </code>
                            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-r from-transparent to-stellar-teal/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        <SDKCard name="Nirium CLI" lang="Commander" command="npx nirium create" icon={TerminalIcon} />
                        <SDKCard name="Python SDK" lang="v0.1.0" command="pip install nirium" icon={Shield} />
                        <SDKCard name="Companion App" lang="Tauri v2" command="Direct Downloads" icon={Download} />
                        <SDKCard name="Nirium MCP" lang="Claude & Grok" command="npm run start" icon={Bot} />
                        <SDKCard name="Market Docs" lang="API REST" command="GET /api/market" icon={Cpu} />
                        <SDKCard name="Web Studio" lang="Visual GUI" command="No Code Needed" icon={Layers} />
                    </div>
                </div>
            </section>

            {/* ── FINAL CTA ─────────────────────────────────────────────────── */}
            <section className="py-40 text-center relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,rgba(138,43,226,0.1),transparent_50%)]" />
                <h2 className="text-4xl sm:text-5xl md:text-8xl font-black mb-12 tracking-tighter">
                    {t.home.ignite_the_loop_part1} <span className="text-stellar-teal font-bold">{t.home.ignite_the_loop_part2}</span>
                </h2>
                <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4 sm:gap-6 relative z-10 w-full px-4 max-w-2xl mx-auto">
                    <button
                        onClick={handleLaunch}
                        className="w-full sm:w-auto px-6 sm:px-12 py-4 sm:py-5 bg-gradient-to-r from-stellar-teal to-stellar-yellow text-black font-black text-base sm:text-xl rounded-full transition-all hover:scale-105 hover:shadow-[0_0_50px_rgba(255,200,0,0.4)] active:scale-95"
                    >
                        {t.home.enter_matrix}
                    </button>
                    <Link
                        href="/strategies"
                        className="w-full sm:w-auto px-6 sm:px-12 py-4 sm:py-5 border border-white/20 text-white font-bold text-base sm:text-xl rounded-full hover:bg-white/5 transition-all text-center"
                    >
                        {t.home.browse_agents}
                    </Link>
                </div>
            </section>
        </main>
    );
}

function StatPill({ label, value, color }: { label: string, value: string, color: 'teal' | 'yellow' | 'purple' }) {
    const colorMap = {
        teal: 'bg-stellar-teal/10 text-stellar-teal border-stellar-teal/30',
        yellow: 'bg-stellar-yellow/10 text-stellar-yellow border-stellar-yellow/30',
        purple: 'bg-purple-400/10 text-purple-400 border-purple-400/30',
    };
    return (
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono ${colorMap[color]}`}>
            <span className="font-black">{value}</span>
            <span className="opacity-70">{label}</span>
        </div>
    );
}

function ProtocolItem({ icon: Icon, name }: { icon: any, name: string }) {
    return (
        <div className="flex items-center gap-2 group cursor-pointer">
            <Icon className="w-6 h-6 text-gray-400 group-hover:text-stellar-teal transition-colors" />
            <span className="text-lg font-bold tracking-tight text-gray-300 group-hover:text-white transition-colors uppercase">{name}</span>
        </div>
    );
}

function FeatureCard({ icon: Icon, title, desc, color }: { icon: any, title: string, desc: string, color: 'cyan' | 'purple' | 'blue' | 'pink' }) {
    const colorMap = {
        cyan: 'text-stellar-teal border-stellar-teal/20 bg-stellar-teal/5',
        purple: 'text-stellar-yellow border-stellar-yellow/20 bg-stellar-yellow/5',
        blue: 'text-blue-400 border-blue-400/20 bg-blue-400/5',
        pink: 'text-pink-500 border-pink-500/20 bg-pink-500/5'
    };
    return (
        <motion.div whileHover={{ y: -10 }} className={`p-8 rounded-2xl border ${colorMap[color]} group transition-all`}>
            <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Icon className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold mb-3 tracking-tighter">{title}</h3>
            <p className="text-gray-400 leading-relaxed">{desc}</p>
        </motion.div>
    );
}

function SDKCard({ name, lang, command, icon: Icon }: { name: string, lang: string, command: string, icon: any }) {
    return (
        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6 group hover:border-white/30 transition-all cursor-pointer">
            <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-white/5 rounded-lg group-hover:bg-stellar-teal/10 transition-colors">
                    <Icon className="w-5 h-5 text-gray-400 group-hover:text-stellar-teal" />
                </div>
                <span className="text-[10px] font-mono text-gray-600">{lang}</span>
            </div>
            <div className="text-sm font-bold mb-1">{name}</div>
            <div className="text-[10px] font-mono text-gray-500">{command}</div>
        </div>
    );
}
