'use client';

import { useFreighter } from "@/hooks/useFreighter";
import Link from "next/link";
import { Suspense, useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
    Zap, Shield, Cpu, Layers, Terminal as TerminalIcon,
    ArrowRight, Bot, Activity, Landmark, Database,
    Download, ChevronRight, Workflow, CheckCircle
} from "lucide-react";
import { motion } from "framer-motion";
import dynamic from 'next/dynamic';

const NeuralCanvas = dynamic(() => import('@/components/3d/NeuralCanvas').then((mod) => mod.NeuralCanvas), { ssr: false });
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function Home() {
    const router = useRouter();
    const { address: accountStr, isConnected } = useFreighter();
    const [agentLog, setAgentLog] = useState<string[]>([]);

    const handleLaunch = () => {
        if (!isConnected) {
            toast.error("Bridge Connection Required", {
                description: "Please connect your Freighter wallet to access the Neural Matrix."
            });
            return;
        }
        router.push("/dashboard");
    };

    // Simulation of Nirium Neural Feed
    useEffect(() => {
        const logs = [
            "Initializing Nirium Neural Kernel v0.1.0...",
            "Establishing Stellar Horizon Uplink... [OK]",
            "Soroban RPC Handshake: COMPLETED",
            "Market Scanner: DEPLOYED (XLM/USDC Vectors)",
            "Path Payment Router: OPTIMIZED — 12ms latency",
            "Multi-Op Transaction Engine: ARMED",
            "Flash Loan Callback Hook: VALIDATED (Mathematical Safety)",
            "Scanning live SDEX vs Soroswap spreads...",
            "Anomaly detected: 0.12% Arb opportunity found.",
            "Uplink Status: OPERATIONAL — All systems nominal."
        ];
        let i = 0;
        const interval = setInterval(() => {
            if (i < logs.length) {
                setAgentLog(prev => [...prev, logs[i]].slice(-8));
                i++;
            }
        }, 1500);
        return () => clearInterval(interval);
    }, []);

    return (
        <main className="min-h-screen bg-[#050505] text-white selection:bg-stellar-teal/30 overflow-hidden relative">
            <Navbar />

            {/* Background Grain & Gradients */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-stellar-yellow/10 to-transparent opacity-50" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(45,235,232,0.03),transparent_70%)]" />
            </div>

            {/* Hero Section */}
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
                            v0.1.0 // STELLAR TESTNET LIVE
                        </div>

                        <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85]">
                            AUTONOMOUS <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-stellar-teal to-stellar-yellow">INTELLIGENCE</span>
                        </h1>

                        <p className="text-gray-400 text-lg md:text-xl max-w-xl leading-relaxed">
                            Deploy AI agents that execute path arbitrage, flash loans, and yield farming — secured by <strong>Soroban Smart Contracts</strong> and Stellar&apos;s native <strong>atomic multi-operation transactions</strong>.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <button
                                onClick={handleLaunch}
                                className="group relative px-8 py-4 bg-stellar-yellow text-black font-black rounded-lg transition-all hover:shadow-[0_0_30px_rgba(255,200,0,0.5)] active:scale-95"
                            >
                                <span className="flex items-center gap-2">
                                    LAUNCH DASHBOARD <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </span>
                            </button>
                            <Link
                                href="/docs"
                                className="px-8 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-lg hover:bg-white/10 transition-all text-center"
                            >
                                READ PROTOCOL
                            </Link>
                        </div>
                    </motion.div>

                    <div className="relative h-[600px] hidden lg:block">
                        <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-stellar-teal font-mono animate-pulse">CONNECTING NEURAL ORB...</div>}>
                            <NeuralCanvas />
                        </Suspense>
                        {/* Terminal Overlay */}
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
                                {agentLog.map((log, i) => (
                                    <div key={i} className="flex gap-2">
                                        <span className="text-white/20 select-none">{i.toString().padStart(2, '0')}</span>
                                        <span className="text-gray-300">{log}</span>
                                    </div>
                                ))}
                                <div className="flex gap-2 text-stellar-teal">
                                    <span className="text-stellar-teal animate-pulse">{">"}</span>
                                    <span className="animate-pulse">_</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Protocol Integrations */}
            <section className="py-20 border-y border-white/5 bg-black/50">
                <div className="container mx-auto px-4">
                    <h3 className="text-center text-[10px] font-mono text-gray-500 mb-12 tracking-[0.4em] uppercase">Built for the Stellar Ecosystem</h3>
                    <div className="flex flex-wrap justify-center gap-12 md:gap-24 items-center grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-700">
                        <ProtocolItem icon={Landmark} name="BLEND Protocol" />
                        <ProtocolItem icon={Zap} name="SOROSWAP" />
                        <ProtocolItem icon={ChevronRight} name="PHOENIX DEX" />
                        <ProtocolItem icon={Cpu} name="SOROBAN" />
                        <ProtocolItem icon={Database} name="HORIZON" />
                    </div>
                </div>
            </section>

            {/* Features Matrix */}
            <section className="py-32 container mx-auto px-4">
                <div className="text-center mb-20 space-y-4">
                    <h2 className="text-4xl md:text-6xl font-black tracking-tighter">Atomic <span className="text-stellar-teal">Capabilities</span></h2>
                    <p className="text-gray-400 max-w-2xl mx-auto text-lg">Four architectural pillars enabling absolute autonomy in the Stellar neural matrix.</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <FeatureCard
                        icon={Zap}
                        title="Atomic Path Arbs"
                        desc="Utilize Stellar's native PathPaymentStrictReceive for zero-contract, multi-hop arbitrage routes with instant finality."
                        color="cyan"
                    />
                    <FeatureCard
                        icon={Shield}
                        title="Soroban Vaults"
                        desc="Institutional non-custodial vaults with Control Key/Agent Auth delegation logic. Absolute security for your XLM & USDC."
                        color="purple"
                    />
                    <FeatureCard
                        icon={Workflow}
                        title="Multi-Op Bundling"
                        desc="Chain up to 100 Stellar operations atomically. Borrow, swap, hedge, and repay in a single transaction unit."
                        color="blue"
                    />
                    <FeatureCard
                        icon={Database}
                        title="Neural Archive"
                        desc="Every agent decision is etched into the forensic blackbox archived via IPFS. Indestructible proof of automated integrity."
                        color="pink"
                    />
                </div>
            </section>

            {/* SDK Section */}
            <section className="py-32 bg-black/40 border-t border-white/5">
                <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-6">
                        <h3 className="text-3xl md:text-5xl font-black leading-tight tracking-tighter">PROGRAMMABLE <br /><span className="text-stellar-yellow">AUTONOMY</span></h3>
                        <p className="text-gray-400 text-lg">Scaffold a combat-ready agent in seconds using our SDKs. Full parity between TypeScript and Python for institutional quants.</p>

                        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6 font-mono text-sm group relative overflow-hidden">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex gap-2">
                                    <span className="text-gray-500">npm</span>
                                    <span className="text-gray-500">pnpm</span>
                                    <span className="text-blue-400 font-bold border-b border-blue-400">sdk</span>
                                </div>
                                <Activity className="w-4 h-4 text-stellar-teal" />
                            </div>
                            <code className="text-white block">
                                <span className="text-purple-400">import</span> {"{"} Agent {"}"} <span className="text-purple-400">from</span> <span className="text-green-400">&apos;@nirium/sdk&apos;</span>;<br />
                                <span className="text-blue-400">const</span> bot = <span className="text-blue-400">new</span> Agent(<span className="text-yellow-300">&quot;sk_live_...&quot;</span>);<br />
                                <span className="text-gray-500">// Subscribe to Path Arb signals</span><br />
                                bot.subscribe(<span className="text-cyan-400">&apos;path_arb&apos;</span>, (signal) ={">"} bot.execute(signal));
                            </code>
                            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-r from-transparent to-stellar-teal/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <SDKCard name="Nirium CLI" lang="Commander" command="npx nirium create" icon={TerminalIcon} />
                        <SDKCard name="Python SDK" lang="v0.1.0" command="pip install nirium" icon={Shield} />
                        <SDKCard name="Companion App" lang="Tauri v2" command="GitHub Downloads" icon={Download} />
                        <SDKCard name="Market Docs" lang="API REST" command="GET /api/market" icon={Cpu} />
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-40 text-center relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,rgba(138,43,226,0.1),transparent_50%)]" />
                <h2 className="text-5xl md:text-8xl font-black mb-12 tracking-tighter">IGNITE THE <span className="text-stellar-teal font-bold">LOOP</span></h2>
                <div className="flex flex-wrap justify-center gap-6 relative z-10">
                    <button
                        onClick={handleLaunch}
                        className="px-12 py-5 bg-gradient-to-r from-stellar-teal to-stellar-yellow text-black font-black text-xl rounded-full transition-all hover:scale-105 hover:shadow-[0_0_50px_rgba(255,200,0,0.4)] active:scale-95"
                    >
                        ENTER NEURAL MATRIX
                    </button>
                    <Link
                        href="/strategies"
                        className="px-12 py-5 border border-white/20 text-white font-bold text-xl rounded-full hover:bg-white/5 transition-all"
                    >
                        BROWSE AGENTS
                    </Link>
                </div>
            </section>

        </main>
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
        <motion.div
            whileHover={{ y: -10 }}
            className={`p-8 rounded-2xl border ${colorMap[color]} group transition-all`}
        >
            <div className={`w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
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
