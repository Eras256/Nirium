/** Nirium Protocol - Final Institutional Build (April 2026) **/
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
    Brain, Puzzle, LineChart, User, Smartphone,
    KeyRound, Send, Webhook, Package, Github, Coins, Radio,
    Rocket, Wallet, Gift, Wand2, ScrollText, PlayCircle, Clock,
    AlertTriangle, Check, X as XIcon, Timer, DollarSign, ShieldCheck,
    Apple
} from "lucide-react";
import { motion } from "framer-motion";
import dynamic from 'next/dynamic';

const ProtocolCanvas = dynamic(() => import('@/components/3d/ProtocolCanvas').then((mod) => mod.ProtocolCanvas), { ssr: false });
import { SectionBrandLogo } from "@/components/ui/SectionBrandLogo";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/context/LanguageContext";
import { supabase } from "@/lib/supabase";
import ProtocolRevenue from "@/components/dashboard/ProtocolRevenue";
import OpsConsole from "@/components/layout/OpsConsole";

const getAgentData = (t: any) => [
    { name: 'Titan', role: t.home.institutional_use_cases.agent_roles.coordinator, color: '#FFD700' },
    { name: 'Eliza', role: t.home.institutional_use_cases.agent_roles.sentiment, color: '#2DEBE8' },
    { name: 'Maux', role: t.home.institutional_use_cases.agent_roles.liquidity, color: '#A78BFA' },
    { name: 'Chronos', role: t.home.institutional_use_cases.agent_roles.arbitrage, color: '#F97316' },
    { name: 'Astra', role: t.home.institutional_use_cases.agent_roles.explorer, color: '#34D399' },
    { name: 'Void', role: t.home.institutional_use_cases.agent_roles.strategy, color: '#6B7280' },
    { name: 'Nexus', role: t.home.institutional_use_cases.agent_roles.signals, color: '#EC4899' },
    { name: 'Gaia', role: t.home.institutional_use_cases.agent_roles.optimizer, color: '#10B981' },
    { name: 'Orion', role: t.home.institutional_use_cases.agent_roles.hunter, color: '#3B82F6' },
    { name: 'Sentinel', role: t.home.institutional_use_cases.agent_roles.auditor, color: '#EF4444' },
    { name: 'Core', role: t.home.institutional_use_cases.agent_roles.analyst, color: '#8B5CF6' },
    { name: 'Atlas', role: t.home.institutional_use_cases.agent_roles.support, color: '#F59E0B' },
    { name: 'Nova', role: t.home.institutional_use_cases.agent_roles.listings, color: '#60A5FA' },
    { name: 'Cyber', role: t.home.institutional_use_cases.agent_roles.mcp, color: '#2DEBE8' },
    { name: 'Nirium-1', role: t.home.institutional_use_cases.agent_roles.maintenance, color: '#FCD34D' },
];

const getContractData = (t: any) => [
    { name: t.home.institutional_use_cases.contract_display.vault, addr: 'CAARZ...JZV', full: 'CBTWMZCG3P72EHFAQ4ZLSEBIOFYJC244H5J6DHZIJ56FHFWJ2CFAWSZU', role_key: 'vault', color: '#00F3FF' },
    { name: 'NiriumProtocol', addr: 'CBIJ2...MSE', full: 'CC2TU5BDTKTPRRRQPEF77I54XYHFQ25XGIRO2TCWKSR7NRJDFR5L5NR5', role_key: 'elo', color: '#A78BFA' },
];




export default function Home() {
    const { t } = useLanguage();
    const router = useRouter();
    const { address: accountStr, isConnected } = useFreighter();
    const [agentLog, setAgentLog] = useState<string[]>([]);
    const [ticker, setTicker] = useState(0);

    const handleLaunch = () => {
        if (!isConnected) {
            toast.error(t.nav.auth_session, { description: t.nav.stellar_connected });
            return;
        }
        router.push("/dashboard");
    };

    useEffect(() => {
        const FALLBACK_LOGS = [
            "[System] Protocol Connection established. Telemetry broadcasting on-chain...",
            "[Coordinator] Vault architecture synchronized — 3 asset classes active",
            "[Explorer] DeFindex USDC route analysis complete — evaluating testnet paths",
        ];

        const fetchLogs = async () => {
            try {
                const res = await fetch('/api/logs');
                if (!res.ok) return;
                const data: any[] = await res.json();

                if (data && data.length > 0) {
                    setAgentLog(data.slice(0, 8).map((l: any) => `[${l.agent_id}] ${l.message}`).reverse());
                }
            } catch (e) {
                console.warn("[Telemetry Feed] fetch error:", e);
            }
        };

        setAgentLog(FALLBACK_LOGS);
        fetchLogs();
        const pollInterval = setInterval(fetchLogs, 5000);
        return () => clearInterval(pollInterval);
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
{/* Background Gradients */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-stellar-yellow/10 to-transparent opacity-50" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(45,235,232,0.03),transparent_70%)]" />
            </div>

            {/* ── HERO ─────────────────────────────────────────────────── */}
            <section className="relative z-10 container mx-auto px-4 pt-8 sm:pt-8 pb-20 sm:pb-32">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="space-y-6 sm:space-y-8 flex flex-col items-center md:items-start"
                    >
                        <div className="flex flex-wrap justify-center md:justify-start gap-2 sm:gap-3 mb-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] sm:text-[10px] font-mono text-stellar-teal">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-stellar-teal opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-stellar-teal"></span>
                                </span>
                                v0.6.1 // {t.home.institutional_use_cases.extra.mpp_enabled}
                            </div>
                        </div>
 
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 sm:gap-12 w-full">
                            <SectionBrandLogo className="mb-0 !opacity-100 shrink-0" size="w-40 xs:w-48 sm:w-56 md:w-64" />
                            <div className="flex-1 w-full">
                                <h1 className="text-4xl xs:text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.8] lg:leading-[0.75] uppercase italic text-center md:text-left">
                                    {t.home.hero_title_1} <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-stellar-teal to-stellar-yellow">{t.home.hero_title_2}</span>
                                </h1>
                            </div>
                        </div>

                        <p className="text-zinc-400 text-base sm:text-lg md:text-xl max-w-xl leading-relaxed text-center md:text-left">
                            {t.home.hero_subtitle}
                        </p>

                        {/* Disclaimer */}
                        {t.home.hero_disclaimer && (
                            <p className="text-[10px] sm:text-xs text-zinc-600 font-mono max-w-xl leading-relaxed text-center md:text-left border-l-2 border-zinc-700 pl-3">
                                {t.home.hero_disclaimer}
                            </p>
                        )}

                        {/* Live swarm counter pill */}
                        <div className="flex flex-wrap justify-center md:justify-start gap-2 sm:gap-3">
                            <StatPill label={t.home.stat_agents} value="1.4%" color="teal" />
                            <StatPill label={t.home.stat_contracts} value="5s" color="yellow" />
                            <StatPill label={t.home.stat_throughput} value="✓" color="purple" />
                        </div>

                        <div className="flex flex-wrap justify-center md:justify-start gap-3 sm:gap-4 pt-8">
                            <Link href="/dashboard" className="w-full sm:w-auto">
                                <Button size="hero" className="w-full sm:w-auto bg-stellar-yellow text-black hover:bg-stellar-yellow/90 font-black italic tracking-tight rounded-full px-8">
                                    {t.home.launch_dashboard} <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            </Link>
                            <Link href="/docs" className="w-full sm:w-auto">
                                <Button size="hero" variant="outline" className="w-full sm:w-auto border-white/10 hover:border-white/20 text-white font-bold rounded-full px-8">
                                    {t.home.read_protocol}
                                </Button>
                            </Link>
                        </div>
                    </motion.div>

                    <div className="relative mt-12 lg:mt-0 lg:h-[600px]">
                        {/* Neural Orb (Desktop only or static on mobile) */}
                        <div className="hidden lg:block absolute inset-0">
                            <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-stellar-teal font-mono animate-pulse">{t.home.institutional_use_cases.extra.connecting_core}</div>}>
                                <ProtocolCanvas />
                            </Suspense>
                        </div>

                        {/* Responsive Duo (Neural Feed + Protocol Revenue) */}
                        <div className="relative lg:absolute lg:-bottom-5 lg:left-4 xl:left-12 flex flex-col xl:flex-row items-center xl:items-end gap-6 lg:gap-8 z-20 pointer-events-auto px-4 lg:px-0">
                            {/* 1. OpsConsole Terminal Style (Telemetry Feed) */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8, duration: 0.8 }}
                                className="w-full lg:w-[300px] max-w-[400px] shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                            >
                                <OpsConsole 
                                    isExpanded={false} 
                                    onToggleExpand={() => {}} 
                                    walletAddress={accountStr || undefined}
                                    heightClass="h-[280px]"
                                />
                            </motion.div>

                            {/* 2. Protocol Revenue (Compact) */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.1, duration: 0.8 }}
                                className="w-full lg:w-[300px] max-w-[400px] shadow-[0_20px_60px_rgba(45,235,232,0.15)]"
                            >
                                <div className="w-full lg:w-[300px] max-w-[400px] h-[280px]">
                                    <ProtocolRevenue compact={true} />
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── VALUE PROPOSITION — COMPETITOR COMPARISON ─────────────── */}
            {t.home.value_prop && (
            <section className="py-20 sm:py-28 border-y border-white/5 bg-gradient-to-b from-black via-stellar-teal/[0.02] to-black relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(45,235,232,0.04),transparent_60%)] pointer-events-none" />
                <div className="container mx-auto px-4 relative z-10">
                    <motion.div {...fadeUp()} className="text-center mb-16 space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-stellar-teal/10 border border-stellar-teal/30 text-stellar-teal text-[10px] font-black uppercase tracking-widest mb-4">
                            <DollarSign className="w-3 h-3" />
                            <span>CROSS-BORDER PAYMENTS</span>
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-none">
                            {t.home.value_prop.title} <span className="text-stellar-teal">{t.home.value_prop.span}</span>
                        </h2>
                        <p className="text-gray-400 max-w-2xl mx-auto text-lg">{t.home.value_prop.subtitle}</p>
                    </motion.div>

                    {/* Comparison Table */}
                    <motion.div {...fadeUp(0.1)} className="max-w-4xl mx-auto">
                        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/60 backdrop-blur-sm">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="text-left px-6 py-4 text-gray-500 font-mono text-[10px] uppercase tracking-widest">{t.home.value_prop.col_provider}</th>
                                        <th className="text-left px-6 py-4 text-gray-500 font-mono text-[10px] uppercase tracking-widest">{t.home.value_prop.col_cost}</th>
                                        <th className="text-left px-6 py-4 text-gray-500 font-mono text-[10px] uppercase tracking-widest">{t.home.value_prop.col_speed}</th>
                                        <th className="text-left px-6 py-4 text-gray-500 font-mono text-[10px] uppercase tracking-widest">{t.home.value_prop.col_custody}</th>
                                        <th className="text-left px-6 py-4 text-gray-500 font-mono text-[10px] uppercase tracking-widest">{t.home.value_prop.col_yield}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(t.home.value_prop.competitors as any[]).map((c: any, i: number) => {
                                        const isNoCustody = c.custody?.startsWith('No') || c.custody?.startsWith('无');
                                        const isNoYield = c.yield?.startsWith('No') || c.yield?.startsWith('无');
                                        return (
                                            <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                                <td className="px-6 py-4 text-gray-300 font-medium">{c.name}</td>
                                                <td className="px-6 py-4 text-red-400/80 font-mono text-xs">{c.cost}</td>
                                                <td className="px-6 py-4 text-gray-500 font-mono text-xs">{c.speed}</td>
                                                <td className="px-6 py-4">
                                                    {isNoCustody ? (
                                                        <span className="inline-flex items-center gap-1 text-red-400/70 text-xs"><XIcon className="w-3 h-3" /> {c.custody}</span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-green-400/70 text-xs"><Check className="w-3 h-3" /> {c.custody}</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {isNoYield ? (
                                                        <span className="inline-flex items-center gap-1 text-red-400/70 text-xs"><XIcon className="w-3 h-3" /> {c.yield}</span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-green-400/70 text-xs"><Check className="w-3 h-3" /> {c.yield}</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {/* Nirium Row — highlighted */}
                                    <tr className="bg-stellar-teal/5 border-t-2 border-stellar-teal/30">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-stellar-teal shadow-[0_0_8px_rgba(45,235,232,0.8)]" />
                                                <span className="text-white font-black text-sm">{t.home.value_prop.nirium_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="text-stellar-teal font-black text-lg">{t.home.value_prop.nirium_cost}</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="text-stellar-yellow font-bold text-sm">{t.home.value_prop.nirium_speed}</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="inline-flex items-center gap-1 text-green-400 font-bold text-xs"><ShieldCheck className="w-4 h-4" /> {t.home.value_prop.nirium_custody}</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="inline-flex items-center gap-1 text-green-400 font-bold text-xs"><Check className="w-4 h-4" /> {t.home.value_prop.nirium_yield}</span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Savings callout + CTA */}
                        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                            <motion.div {...fadeUp(0.2)} className="flex items-center gap-6">
                                <div className="text-center">
                                    <div className="text-5xl md:text-6xl font-black text-stellar-teal tracking-tighter">{t.home.value_prop.savings_value}</div>
                                    <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mt-1">{t.home.value_prop.savings_title}</div>
                                </div>
                                <p className="text-gray-400 text-sm max-w-xs">{t.home.value_prop.savings_desc}</p>
                            </motion.div>
                            <Link href="/sandbox">
                                <Button size="hero" className="bg-stellar-teal text-black hover:bg-stellar-teal/90 font-black italic tracking-tight rounded-full px-8">
                                    {t.home.value_prop.cta} <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            </Link>
                        </div>

                        {/* Legal disclaimer */}
                        <p className="mt-8 text-[9px] text-zinc-600 font-mono text-center max-w-3xl mx-auto leading-relaxed">
                            {t.home.value_prop.disclaimer}
                        </p>
                    </motion.div>
                </div>
            </section>
            )}

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
                                src="/logos/logo.png"
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
                        <ProtocolItem icon={Zap} name="x402 STANDARD" />
                        <ProtocolItem icon={Activity} name="MPP PROTOCOL" />
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
                            { item: t.home.pro_features_list.agents, icon: Activity },
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

            {/* ── SETTLEMENT LAYER SECTION (x402 & MPP) ──────────────────── */}
            <section className="py-24 bg-gradient-to-b from-black to-stellar-teal/5 border-y border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(circle_at_100%_0%,rgba(45,235,232,0.05),transparent_70%)]" />
                
                <div className="container mx-auto px-4 relative z-10">
                    <motion.div {...fadeUp()} className="text-center mb-20 space-y-4">
                        <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-none">
                            {t.home.settlement_layer.title} <span className="text-stellar-teal">{t.home.settlement_layer.span}</span>
                        </h2>
                        <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                            {t.home.settlement_layer.subtitle}
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                        {/* x402 Card */}
                        <motion.div {...fadeUp(0.1)} className="group relative p-8 rounded-3xl bg-black/60 border border-white/10 hover:border-stellar-teal/40 transition-all duration-500 shadow-2xl">
                            <div className="absolute top-4 right-8 text-[40px] opacity-10 font-black italic tracking-tighter text-stellar-teal group-hover:opacity-20 transition-opacity">x402</div>
                            <div className="space-y-6">
                                <div className="w-16 h-16 rounded-2xl bg-stellar-teal/10 flex items-center justify-center border border-stellar-teal/30 group-hover:scale-110 transition-transform">
                                    <Zap className="w-8 h-8 text-stellar-teal" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black tracking-tight mb-3 uppercase italic text-white flex items-center gap-2">
                                        {t.home.settlement_layer.x402_title}
                                    </h3>
                                    <p className="text-gray-400 leading-relaxed text-sm md:text-base">
                                        {t.home.settlement_layer.x402_desc}
                                    </p>
                                </div>
                                <div className="flex items-center gap-4 py-4 border-t border-white/5">
                                    <div className="text-[10px] font-mono text-stellar-teal uppercase tracking-[0.2em] font-bold italic">{t.home.institutional_use_cases.extra.soroban_verified}</div>
                                    <div className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            whileInView={{ width: "100%" }}
                                            transition={{ duration: 1.5, ease: "easeOut" }}
                                            className="h-full bg-stellar-teal"
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* MPP Card */}
                        <motion.div {...fadeUp(0.2)} className="group relative p-8 rounded-3xl bg-black/60 border border-white/10 hover:border-stellar-yellow/40 transition-all duration-500 shadow-2xl">
                            <div className="absolute top-4 right-8 text-[40px] opacity-10 font-black italic tracking-tighter text-stellar-yellow group-hover:opacity-20 transition-opacity">MPP</div>
                            <div className="space-y-6">
                                <div className="w-16 h-16 rounded-2xl bg-stellar-yellow/10 flex items-center justify-center border border-stellar-yellow/30 group-hover:scale-110 transition-transform">
                                    <Layers className="w-8 h-8 text-stellar-yellow" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black tracking-tight mb-3 uppercase italic text-white">
                                        {t.home.settlement_layer.mpp_title}
                                    </h3>
                                    <p className="text-gray-400 leading-relaxed text-sm md:text-base">
                                        {t.home.settlement_layer.mpp_desc}
                                    </p>
                                </div>
                                <div className="flex items-center gap-4 py-4 border-t border-white/5">
                                    <div className="text-[10px] font-mono text-stellar-yellow uppercase tracking-[0.2em] font-bold italic">{t.home.institutional_use_cases.extra.freighter_ready}</div>
                                    <div className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            whileInView={{ width: "100%" }}
                                            transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                                            className="h-full bg-stellar-yellow"
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    <div className="mt-16 flex justify-center">
                        <Link href="/docs/settlement" className="group inline-flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-full font-bold hover:bg-white/10 transition-all">
                            <span>{t.home.institutional_use_cases.extra.explore_infra}</span>
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── INSTITUTIONAL USE CASES ──────────────────────────────── */}
            <section className="py-24 bg-black border-y border-white/5 relative">
                <div className="absolute top-0 right-0 w-1/3 h-[500px] bg-stellar-teal/5 blur-[120px] rounded-full pointer-events-none" />
                <div className="container mx-auto px-4 relative z-10">
                    <motion.div {...fadeUp()} className="text-center mb-16 space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-stellar-yellow/10 border border-stellar-yellow/30 text-stellar-yellow text-[10px] font-black uppercase tracking-widest mb-4">
                            <Zap className="w-3 h-3" />
                            <span>{t.home.institutional_use_cases.badge}</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic leading-none text-white">
                            {t.home.institutional_use_cases.title} <span className="text-stellar-teal">{t.home.institutional_use_cases.title_span}</span>
                        </h2>
                        <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed mt-4">
                            {t.home.institutional_use_cases.description}
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                        {[
                            { id: "liquidity", tags: ["MXN", "USDC", "1.4%"] },
                            { id: "b2b", tags: ["Global Bonds", "Etherfuse"] },
                            { id: "treasury", tags: ["Blend", "USDC"] },
                            { id: "audit", tags: ["IPFS", "RegTech"] },
                            { id: "settlement", tags: ["x402", "MPP"] },
                            { id: "vault", tags: ["Soroban", "Multisig"] }
                        ].map((item, idx) => {
                            const poc = t.home.institutional_use_cases.items[item.id as keyof typeof t.home.institutional_use_cases.items];
                            return (
                                <motion.div 
                                    key={item.id}
                                    {...fadeUp(idx * 0.1)}
                                    className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-8 hover:border-stellar-teal/20 transition-all group relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 blur-3xl rounded-full bg-stellar-teal/5 opacity-0 group-hover:opacity-40 transition-opacity" />
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 group-hover:text-stellar-teal transition-colors">
                                            <Cpu size={24} />
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-black text-white mb-3 tracking-tighter uppercase">{poc.name}</h3>
                                    <p className="text-xs text-gray-400 font-mono leading-relaxed mb-8">
                                        {poc.desc}
                                    </p>
                                    <div className="flex flex-wrap gap-2 pt-8 border-t border-white/5">
                                        {item.tags.map((tag: string) => (
                                            <span key={tag} className="text-[9px] font-mono font-bold uppercase tracking-widest text-gray-600">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                </motion.div>
                            );
                        })}
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
                            className="relative group w-full"
                        >
                            {/* Mockup Browser Window */}
                            <div className="relative bg-[#0A0A0A] rounded-2xl border border-white/10 shadow-2xl overflow-hidden aspect-video lg:aspect-[1.4/1]">
                                {/* Header */}
                                <div className="h-10 border-b border-white/5 bg-white/[0.02] flex items-center justify-between px-4">
                                    <div className="flex gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                                    </div>
                                    <span className="text-[10px] font-mono text-gray-600 tracking-widest uppercase">{t.home.institutional_use_cases.extra.treasury_auto}</span>
                                </div>

                                {/* Builder Body */}
                                <div className="flex h-full">
                                    {/* Sidebar */}
                                    <div className="w-1/3 border-r border-white/5 p-4 space-y-4 bg-black/20">
                                        <div className="text-[10px] text-gray-600 font-bold uppercase tracking-wider mb-2">{t.home.institutional_use_cases.extra.rules}</div>
                                        {[
                                            t.home.institutional_use_cases.builder_data.rule_fx,
                                            t.home.institutional_use_cases.builder_data.rule_spei,
                                            t.home.institutional_use_cases.builder_data.rule_kyc
                                        ].map((trigger, i) => (
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
                                                <span className="text-[10px] font-bold uppercase">{t.home.institutional_use_cases.extra.fx_trigger}</span>
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
                                                <span className="text-[10px] font-bold uppercase">{t.home.institutional_use_cases.extra.settle_cetes}</span>
                                            </motion.div>
                                        </div>

                                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[9px] text-gray-600 font-mono tracking-wide">
                                            {t.home.institutional_use_cases.extra.builder_hint}
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
                        PROTOCOL <span className="text-stellar-teal">TELEMETRY</span>
                    </h2>
                    <p className="text-gray-400 max-w-2xl mx-auto text-lg">{t.home.fleet_subtitle}</p>
                </motion.div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                        { label: t.home.stat_agents, value: "1.4%", sub: t.home.stat_agents_sub, icon: Bot, color: "teal" },
                        { label: t.home.stat_throughput_label, value: "~112", sub: t.home.stat_throughput_sub, icon: Repeat2, color: "yellow" },
                        { label: t.home.stat_latency_label, value: "3-5s", sub: t.home.stat_latency_sub, icon: Activity, color: "purple" },
                        { label: t.home.stat_capacity_label, value: "Institutional", sub: t.home.stat_capacity_sub, icon: BarChart3, color: "green" },
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
                                { tier: 'Strategic', elo: '≥ 2000', color: '#2DEBE8', label: t.home.elo_tier_strategic },
                                { tier: 'Gold', elo: '≥ 1500', color: '#FFD700', label: t.home.elo_tier_gold },
                                { tier: 'Silver', elo: '≥ 1000', color: '#A78BFA', label: t.home.elo_tier_silver },
                            ].map(t2 => (
                                <div key={t2.tier} className="flex items-center gap-4 p-4 bg-white/[0.03] rounded-xl border border-white/10">
                                    <Trophy className="w-5 h-5 shrink-0" style={{ color: t2.color }} />
                                    <div>
                                        <div className="font-bold" style={{ color: t2.color }}>{t2.tier} {t.home.institutional_use_cases.extra.elo_tier_suffix} {t2.elo}</div>
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
                            {getAgentData(t).map((agent, i) => (
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
                        {getContractData(t).map((c, i) => (
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
                        <h3 className="text-3xl md:text-5xl font-black leading-tight tracking-tighter">{t.home.sdk_title_1} <br /><span className="text-stellar-yellow">{t.home.sdk_span}</span></h3>
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
                                <span className="text-purple-400">import</span> {"{"}Agent{"}"} <span className="text-purple-400">from</span> <span className="text-green-400">&apos;nirium&apos;</span>;<br />
                                <span className="text-blue-400">const</span> bot = <span className="text-blue-400">new</span> Agent(<span className="text-yellow-300">&quot;sk_live_...&quot;</span>);<br />
                                <span className="text-gray-500">{t.home.institutional_use_cases.builder_data.code_comment}</span><br />
                                bot.bill(<span className="text-cyan-400">&apos;user_402&apos;</span>, {"{"} units: 1, trigger: <span className="text-green-400">&apos;inference&apos;</span> {"}"});
                            </code>
                            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-r from-transparent to-stellar-teal/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <SDKCard name="TypeScript SDK" lang="NPM package" command="npm install nirium" icon={TerminalIcon} href="https://www.npmjs.com/package/nirium" />
                        <SDKCard name="Python SDK" lang="PyPI package" command="pip install nirium" icon={Shield} href="https://pypi.org/project/nirium/" />
                        <SDKCard name="REST API" lang="API REST" command="nirium-agent.fly.dev" icon={Cpu} href="https://nirium-agent.fly.dev" />
                        <SDKCard name="CLI" lang="npx" command="npx nirium create-unit" icon={TerminalIcon} comingSoon />
                        <SDKCard name="Nirium MCP" lang="Claude & Grok" command="Model Context Protocol" icon={Bot} comingSoon />
                        <SDKCard name="Desktop Studio" lang="Visual GUI" command="No Code Needed" icon={Layers} comingSoon />
                        <SDKCard name="PWA" lang="Progressive Web App" command="Install from browser" icon={Smartphone} comingSoon />
                        <SDKCard name="Android App" lang="Google Play" command="Android native" icon={Smartphone} comingSoon />
                        <SDKCard name="iOS App" lang="App Store" command="Apple native" icon={Apple} comingSoon />
                    </div>
                </div>
            </section>

            {/* ── FINAL CTA ─────────────────────────────────────────────────── */}
            <section className="py-24 sm:py-32 md:py-40 text-center relative px-4">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,rgba(45,235,232,0.1),transparent_50%)]" />
                <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-8 sm:mb-12 tracking-tighter uppercase italic leading-[0.85]">
                    {t.home.ignite_the_loop_part1} <br className="sm:hidden" />
                    <span className="text-stellar-teal">{t.home.ignite_the_loop_part2}</span>
                </h2>
                <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4 sm:gap-6 relative z-10 w-full px-4 max-w-2xl mx-auto">
                    <button
                        onClick={handleLaunch}
                        className="w-full sm:w-auto px-6 sm:px-12 py-4 sm:py-5 bg-gradient-to-r from-stellar-teal to-stellar-yellow text-black font-black text-base sm:text-xl rounded-full transition-all hover:scale-105 hover:shadow-[0_0_50px_rgba(255,200,0,0.4)] active:scale-95"
                    >
                        {t.home.enter_protocol}
                    </button>
                    <Link
                        href="/sandbox"
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



function SDKCard({ name, lang, command, icon: Icon, href, comingSoon }: { name: string, lang: string, command: string, icon: any, href?: string, comingSoon?: boolean }) {
    const isLink = !!href && !comingSoon;
    const Component: any = isLink ? 'a' : 'div';
    return (
        <Component
            href={isLink ? href : undefined}
            target={isLink ? "_blank" : undefined}
            rel={isLink ? "noopener noreferrer" : undefined}
            className={`relative block bg-[#0A0A0A] border border-white/10 rounded-xl p-6 group transition-all ${comingSoon ? 'opacity-70 cursor-default' : 'hover:border-white/30 cursor-pointer'}`}
        >
            {comingSoon && (
                <span className="absolute top-2 right-2 px-1.5 py-0.5 bg-stellar-yellow/15 border border-stellar-yellow/30 rounded text-[8px] font-black text-stellar-yellow uppercase tracking-widest">
                    Coming Soon
                </span>
            )}
            <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-lg transition-colors ${comingSoon ? 'bg-white/[0.03]' : 'bg-white/5 group-hover:bg-stellar-teal/10'}`}>
                    <Icon className={`w-5 h-5 ${comingSoon ? 'text-gray-600' : 'text-gray-400 group-hover:text-stellar-teal'}`} />
                </div>
                <span className="text-[10px] font-mono text-gray-600">{lang}</span>
            </div>
            <div className="text-sm font-bold mb-1">{name}</div>
            <div className="text-[10px] font-mono text-gray-500 overflow-hidden text-ellipsis whitespace-nowrap">{command}</div>
        </Component>
    );
}
