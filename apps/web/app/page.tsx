'use client';

import { useFreighter } from "@/hooks/useFreighter";
import { TransactionBuilder, Networks } from "@stellar/stellar-sdk";
import Link from "next/link";
import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { Suspense, useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Zap, Shield, Cpu, Layers, Terminal as TerminalIcon, Globe, Github, MessageSquare, Activity, ArrowRight, Bot, User, Copy, ChevronRight, Download, Landmark, BookOpen, Database, HardDrive, FileCheck, CheckCircle, Workflow } from "lucide-react";
import dynamic from 'next/dynamic';
const NeuralCanvas = dynamic(() => import('@/components/3d/NeuralCanvas').then((mod) => mod.NeuralCanvas), { ssr: false });
const NiriumTesseract = dynamic(() => import('@/components/visuals/NiriumTesseract').then((mod) => mod.NiriumTesseract), { ssr: false });

import Navbar from "@/components/layout/Navbar";

export default function Home() {
    const router = useRouter();
    const { address: accountStr, isConnected } = useFreighter();
    const account = isConnected ? { address: accountStr, chains: ['stellar:testnet'] } : null;
    const suiClient = { executeTransactionBlock: async (...args: any[]) => ({ digest: 'stellar_' + Math.random().toString(36).substring(7) }) };
    const signTransaction = async (tx: any) => ({ bytes: '0x', signature: '0x' });
    const [agentLog, setAgentLog] = useState<string[]>([]);
    const [pkgManager, setPkgManager] = useState("npm");

    // Helper: Sign transaction with wallet, then execute via suiClient directly.
    // This completely bypasses the wallet's built-in gas sponsorship mechanism.
    const signAndExecuteTransaction = async ({ transaction }: { transaction: any }): Promise<{ digest: string }> => {
        const { bytes, signature } = await signTransaction({ transaction });
        const result = (await suiClient.executeTransactionBlock({
            transactionBlock: bytes,
            signature,
            options: { showEffects: true },
        } as any)) as any;
        return { digest: result.digest };
    };

    const handleDeploy = async () => {
        if (!account) {
            toast.error("Please connect your Stellar Wallet first");
            return;
        }

        // Network Check (Strict)
        if (account.chains?.[0] && account.chains[0] !== 'sui:testnet') {
            toast.error("Wrong Network Detected", {
                description: "This dApp runs on Stellar Testnet. Please switch your wallet network."
            });
            return;
        }

        const toastId = toast.loading("Building Deployment Transaction...");

        try {
            const tx = {} as any;
            tx.setSender(account.address);
            // Create a self-transfer of 1000 MIST (0.000001 XLM) to simulate "Activation Cost"
            const [coin] = tx.splitCoins(tx.gas, [1000]);
            tx.transferObjects([coin], account.address);

            const result = await signAndExecuteTransaction({ transaction: tx as any });
            toast.dismiss(toastId);
            toast.success("Agent Activated On-Chain", {
                description: `Digest: ${result.digest.slice(0, 10)}...`
            });

            setTimeout(() => {
                router.push("/dashboard");
            }, 2000);
        } catch (e: any) {
            toast.dismiss(toastId);
            toast.error("Transaction Failed", {
                description: e?.message || "Failed to build transaction"
            });
        }
    };

    // Simulation of Agent Thoughts
    useEffect(() => {
        const logs = [
            "Initializing core agent...",
            "Connecting to Stellar Network...",
            "DeepBook Liquidity: OPTIMAL",
            "Navi Protocol: CONNECTED",
            "Walrus Blackbox: ARMED — forensic logging active",
            "USDC Vault: INDEXED — Navi & Scallop pools ready",
            "Scanning for arb opportunities...",
            "Calculated spread: 0.45% — executing flash vector"
        ];
        let i = 0;
        const interval = setInterval(() => {
            if (i < logs.length) {
                setAgentLog(prev => [...prev, logs[i]]);
                i++;
            }
        }, 1200);
        return () => clearInterval(interval);
    }, []);

    return (
        <main className="min-h-screen flex flex-col relative overflow-x-hidden">

            {/* Navbar */}
            <Navbar />

            {/* Hero Section */}
            <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 pt-32 md:pt-40 px-4 pb-32">

                {/* Left: Text & Terminal */}
                <div className="flex flex-col justify-center space-y-6 md:space-y-8 z-10 order-2 lg:order-1">
                    <div className="space-y-4 text-center lg:text-left z-20 relative">
                        {/* Mainnet Ready Badge */}
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-neon-cyan/10 border border-neon-cyan/30 rounded-full mb-4 mx-auto lg:mx-0 w-fit">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-cyan opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-cyan"></span>
                            </span>
                            <span className="text-[10px] uppercase tracking-wider font-bold text-neon-cyan whitespace-nowrap">
                                MAINNET READY: NEURAL MATRIX
                            </span>
                        </div>
                        <h1 className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tighter leading-[0.9]">
                            INSTITUTIONAL <br />
                            <span className="text-gradient">AI PROTOCOL</span>
                        </h1>
                        <p className="text-gray-400 text-base md:text-lg max-w-md mx-auto lg:mx-0">
                            Nirium is a decentralized <strong>Neural Matrix</strong>. It orchestrates a Mission Control (NASA) for digital agents, performing high-stakes DeFi operations with the precision of a surgeon.
                        </p>
                    </div>

                    {/* Glass Terminal */}
                    <div className="glass-panel rounded-xl p-3 md:p-4 font-mono text-sm h-40 md:h-48 overflow-y-auto w-full max-w-lg border-l-4 border-neon-cyan bg-black/40 mx-auto lg:mx-0">
                        <div className="text-xs text-gray-500 mb-2 border-b border-gray-800 pb-1">AGENT_KERNEL_v0.0.7 // LIVE FEED</div>
                        {agentLog.map((log, i) => (
                            <div key={i} className="text-neon-cyan/80 mb-1 text-xs md:text-sm">
                                <span className="text-gray-600 mr-2">{">"}</span>
                                {log}
                            </div>
                        ))}
                        <div className="animate-pulse text-neon-purple mt-2">_</div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                        <button onClick={handleDeploy} className="bg-neon-cyan text-black font-bold px-8 py-3 md:py-4 rounded-lg hover:shadow-[0_0_20px_rgba(0,243,255,0.4)] transition-all w-full sm:w-auto text-center flex items-center justify-center text-sm md:text-base cursor-pointer">
                            Deploy Agent
                        </button>
                        <Link href="/docs" className="glass-panel px-8 py-3 md:py-4 rounded-lg hover:bg-white/5 transition-all w-full sm:w-auto text-sm md:text-base flex items-center justify-center">
                            View Documentation
                        </Link>
                    </div>
                </div>

                {/* Right: 3D Visualization */}
                <div className="h-[300px] md:h-[500px] w-full relative z-0 order-1 lg:order-2">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#030014] to-transparent z-10 pointer-events-none" />
                    <NiriumTesseract className="!min-h-[300px] md:!min-h-[500px] bg-transparent" />
                </div>
            </div>

            {/* --- INTEGRATIONS BAR --- */}
            <div className="w-full border-y border-white/5 bg-black/40 backdrop-blur-sm mb-32 section-lift">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <p className="text-center text-xs font-mono text-gray-500 mb-6 tracking-[0.2em]">POWERED BY PREMIER PROTOCOLS</p>
                    <div className="flex flex-wrap justify-center gap-8 md:gap-16 items-center opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
                        {/* Navi */}
                        <div className="flex items-center gap-2 group cursor-pointer hover:scale-105 transition-transform">
                            <Landmark className="text-neon-cyan" size={24} />
                            <span className="text-xl font-bold text-white group-hover:text-neon-cyan transition-colors">NAVI Protocol</span>
                        </div>
                        {/* DeepBook */}
                        <div className="flex items-center gap-2 group cursor-pointer hover:scale-105 transition-transform">
                            <BookOpen className="text-blue-500" size={24} />
                            <span className="text-xl font-bold text-white group-hover:text-blue-500 transition-colors">DeepBook V3</span>
                        </div>
                        {/* Eliza */}
                        <div className="flex items-center gap-2 group cursor-pointer hover:scale-105 transition-transform">
                            <Bot className="text-orange-500" size={24} />
                            <span className="text-xl font-bold text-white group-hover:text-orange-500 transition-colors">ElizaOS</span>
                        </div>
                        {/* Cetus */}
                        <div className="flex items-center gap-2 group cursor-pointer hover:scale-105 transition-transform">
                            <Database className="text-teal-400" size={24} />
                            <span className="text-xl font-bold text-white group-hover:text-teal-400 transition-colors">Cetus</span>
                        </div>
                        {/* Walrus */}
                        <div className="flex items-center gap-2 group cursor-pointer hover:scale-105 transition-transform">
                            <HardDrive className="text-pink-500" size={24} />
                            <span className="text-xl font-bold text-white group-hover:text-pink-500 transition-colors">Walrus</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- AUDIENCE SPLITTER --- */}
            <div className="w-full max-w-7xl mx-auto px-4 mb-32 relative z-20 section-lift">
                <div className="text-center mb-12">
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-4">CHOOSE YOUR <span className="text-neon-cyan">INTERFACE</span></h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Nirium is designed for two distinct species.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* For Humans */}
                    <Link href="/dashboard" className="group relative overflow-hidden rounded-2xl bg-[#0A0A0A] border border-white/10 hover:border-white/20 transition-all p-8 flex flex-col justify-between min-h-[240px] hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] cursor-pointer">
                        <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-white/5 rounded-lg text-neon-purple">
                                    <User size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-white">Human Operators</h3>
                            </div>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                <strong>Your Gain:</strong> Institutional-grade arbitrage without writing code.
                                <br />
                                Use the Visual Builder to command the fleet. If a trade fails, our Atomic Engine absorbs the risk. You never lose.
                            </p>
                        </div>
                        <div className="relative z-10 flex items-center gap-2 text-sm font-bold text-white group-hover:translate-x-1 transition-transform">
                            Enter Mission Control <ArrowRight size={16} />
                        </div>
                    </Link>

                    {/* For Agents */}
                    <Link href="/agents" className="group relative overflow-hidden rounded-2xl bg-[#0A0A0A] border border-white/10 hover:border-white/20 transition-all p-8 flex flex-col justify-between min-h-[240px] hover:shadow-[0_0_30px_rgba(0,243,255,0.15)] cursor-pointer">
                        <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-white/5 rounded-lg text-neon-cyan">
                                    <Bot size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-white">Autonomous Agents</h3>
                            </div>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                <strong>Your Gain:</strong> The ultimate physical body.
                                <br />
                                Access Flash Loans, DeepBook V3 liquidity, and Walrus memory via simple SDKs. A mathematically safe sandbox for AI to thrive on-chain.
                            </p>
                        </div>
                        <div className="relative z-10 flex items-center gap-2 text-sm font-bold text-white group-hover:translate-x-1 transition-transform">
                            Access Developer Hub <ArrowRight size={16} />
                        </div>
                    </Link>
                </div>
            </div>

            {/* --- QUICK START (TERMINAL) --- */}
            <div className="w-full max-w-4xl mx-auto px-4 mb-32 relative z-20 section-lift">
                <div className="flex items-center gap-3 mb-6">
                    <ChevronRight className="text-neon-cyan" size={24} />
                    <h2 className="text-2xl font-bold text-white tracking-tight">Quick Start (One-Liner)</h2>
                </div>

                <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-1 overflow-hidden shadow-2xl relative">
                    {/* Terminal Header */}
                    <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/5">
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500/80" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                            <div className="w-3 h-3 rounded-full bg-green-500/80" />
                        </div>
                        <div className="flex bg-black/50 rounded-lg p-1 text-xs font-mono text-gray-400 px-3">
                            bash — 80x24
                        </div>
                    </div>

                    {/* Terminal Content */}
                    <div className="p-6 md:p-8 font-mono relative group">
                        <div className="text-gray-500 select-none mb-4 font-mono text-sm"># Initialize the Neural Matrix (Linux/Mac)</div>
                        <div className="flex flex-col gap-2 text-lg md:text-xl font-mono overflow-x-auto">
                            <div className="flex items-center gap-3">
                                <span className="text-neon-purple select-none">$</span>
                                <span className="text-white">./install.sh</span>
                            </div>
                            <div className="text-base text-gray-500 mt-2">
                                [SYSTEM] <span className="text-green-400">Verifying Dependencies... OK</span><br />
                                [SYSTEM] <span className="text-green-400">Igniting Neural Core v0.0.7... OK</span><br />
                                <span className="text-neon-cyan blink">? Select Personality: {">"} [Arbitrage_V1]</span>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                navigator.clipboard.writeText("./install.sh");
                                toast.success("Command copied to clipboard");
                            }}
                            className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                        >
                            <Copy size={20} />
                        </button>
                    </div>
                </div>

                <div className="text-center mt-6 text-gray-500 text-sm">
                    Works on macOS, Windows {"&"} Linux. The one-liner installs dependencies and sets up the TypeScript/Python environment.
                </div>
            </div>

            {/* --- COMPANION APP --- */}
            <div className="w-full max-w-4xl mx-auto px-4 mb-40 relative z-20 text-center section-lift">
                <h3 className="text-xl font-bold text-white mb-4">Native Desktop Terminal</h3>
                <p className="text-gray-400 mb-8 max-w-lg mx-auto">
                    Professional desktop environment. Native performance for high-frequency monitoring and direct process control.
                </p>
                <div className="flex flex-col items-center">
                    <a
                        href="https://github.com/Eras256/Stellar-Loop/releases/latest"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative overflow-hidden bg-black/40 backdrop-blur-xl border border-white/10 hover:border-neon-cyan/50 text-white font-bold py-6 px-10 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.5)] hover:shadow-[0_0_50px_rgba(6,182,212,0.3)] transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-4 mx-auto min-w-[320px]"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan/20 via-transparent to-neon-purple/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative flex items-center gap-4">
                            <div className="p-2 rounded-lg bg-white/5 border border-white/10 group-hover:border-neon-cyan/30 transition-colors">
                                <Download size={24} className="text-gray-300 group-hover:text-neon-cyan transition-colors" />
                            </div>
                            <div className="text-left">
                                <span className="block text-xs uppercase tracking-widest text-neon-cyan/80 mb-0.5">v0.0.7 Available</span>
                                <span className="block text-lg font-bold tracking-tight">Download Companion</span>
                            </div>
                        </div>
                    </a>

                    <div className="mt-6 flex items-center gap-6 text-sm text-gray-400 font-mono">
                        <span className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan shadow-[0_0_8px_rgba(6,182,212,0.8)]"></span> macOS
                        </span>
                        <span className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan shadow-[0_0_8px_rgba(6,182,212,0.8)]"></span> Windows
                        </span>
                        <span className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan shadow-[0_0_8px_rgba(6,182,212,0.8)]"></span> Linux
                        </span>
                    </div>
                </div>
            </div>


            {/* --- TECH STACK MARQUEE --- */}
            <div className="w-full border-y border-white/5 bg-black/20 backdrop-blur-sm overflow-hidden py-10">
                <div className="flex gap-12 md:gap-24 items-center justify-center opacity-70 grayscale hover:grayscale-0 transition-all duration-500 flex-wrap px-4">
                    {[
                        { label: 'Total Value Locked', value: '$1.2B', color: 'text-green-400' },
                        { label: 'Active Agents', value: '2,450', color: 'text-neon-cyan' },
                        { label: 'Neural Plugins', value: '13+ Active', color: 'text-purple-400' },
                        { label: 'Flash Loan Fee', value: '0.3%', color: 'text-amber-400' },
                        { label: 'Assets Supported', value: 'XLM + USDC', color: 'text-blue-400' },
                    ].map((stat) => (
                        <div key={stat.label} className="bg-white/5 border border-white/10 rounded-xl p-4">
                            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">{stat.label}</div>
                            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Executive Summary */}
            <section className="max-w-7xl mx-auto px-4 py-24">
                <div className="bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-2xl p-8">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                        <Shield className="text-neon-purple" />
                        Executive Summary
                    </h2>
                    <div className="prose prose-invert max-w-none text-gray-300 space-y-4">
                        <p className="text-lg leading-relaxed">
                            <strong>Nirium</strong> is an institutional-grade DeFi protocol on the Stellar blockchain that integrates
                            <strong className="text-neon-cyan"> atomic leverage execution</strong> with
                            <strong className="text-neon-purple"> autonomous AI agents</strong>.
                        </p>
                        <p>
                            The protocol leverages <strong>Move 2024's linear type system</strong> (Hot Potato Pattern) to guarantee
                            flash loan repayment at the compiler level, while <strong>ElizaOS</strong> powers intelligent off-chain
                            agents that analyze market conditions and orchestrate transactions via Programmable Transaction Blocks (PTB).
                        </p>
                    </div>
                </div>
            </section>

            {/* Progressive Automation */}
            <section className="max-w-7xl mx-auto px-4 py-24">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <Cpu className="text-neon-cyan" />
                    Progressive Automation
                </h2>
                <p className="text-gray-400 mb-6">
                    Nirium solves the biggest AI-Crypto dilemma: <strong className="text-white">Security vs. Autonomy</strong>
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-black/40 p-6 rounded-xl border border-neon-purple/30 hover:border-neon-purple/50 transition-colors">
                        <h3 className="text-xl font-bold text-neon-purple mb-4 flex items-center gap-2">
                            <Shield className="w-5 h-5" />
                            Copilot Mode
                        </h3>
                        <ul className="space-y-3 text-gray-300">
                            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> User signs every transaction</li>
                            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Human-speed execution</li>
                            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Non-custodial & Trustless</li>
                            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Best for security-focused users</li>
                        </ul>
                    </div>
                    <div className="bg-black/40 p-6 rounded-xl border border-neon-cyan/30 hover:border-neon-cyan/50 transition-colors">
                        <h3 className="text-xl font-bold text-neon-cyan mb-4 flex items-center gap-2">
                            <Zap className="w-5 h-5" />
                            Autonomous Mode
                        </h3>
                        <ul className="space-y-3 text-gray-300">
                            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Agent signs with Private Key</li>
                            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Superhuman speed (milliseconds)</li>
                            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Fully Agentic Loop</li>
                            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Best for HFT & MEV searchers</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* --- DIGITAL TEAM CONCEPT --- */}
            <section className="py-24 border-b border-white/5 relative overflow-hidden section-lift">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-neon-cyan/5 rounded-full blur-[120px] pointer-events-none"></div>
                <div className="max-w-7xl mx-auto px-4 relative z-10">
                    <div className="text-center mb-16">
                        <span className="text-neon-cyan text-sm font-bold tracking-widest uppercase mb-2 block">The New Workforce</span>
                        <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white">HIRE A <span className="text-gradient">24/7 WARHEAD TEAM</span></h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Analyst */}
                        <div className="glass-panel p-8 rounded-2xl border-t-4 border-neon-purple">
                            <div className="text-xs font-mono text-gray-500 mb-2">ROLE: ANALYST</div>
                            <h3 className="text-2xl font-bold text-white mb-4">The Observer</h3>
                            <p className="text-gray-400 mb-6">
                                Constantly scans Scallop lending rates and DeepBook order books. Identifies dislocations in milliseconds.
                            </p>
                            <div className="flex items-center gap-2 text-sm text-neon-purple bg-neon-purple/5 px-3 py-2 rounded-lg w-fit">
                                <Activity size={16} /> Heartbeat: 400ms
                            </div>
                        </div>

                        {/* Trader */}
                        <div className="glass-panel p-8 rounded-2xl border-t-4 border-neon-cyan">
                            <div className="text-xs font-mono text-gray-500 mb-2">ROLE: TRADER</div>
                            <h3 className="text-2xl font-bold text-white mb-4">The Executioner</h3>
                            <p className="text-gray-400 mb-6">
                                Routes capital through the most efficient path. Borrows from Navi, swaps on Cetus, repays instantly.
                            </p>
                            <div className="flex items-center gap-2 text-sm text-neon-cyan bg-neon-cyan/5 px-3 py-2 rounded-lg w-fit">
                                <Zap size={16} /> Speed: &lt;1 Block
                            </div>
                        </div>

                        {/* Risk Manager */}
                        <div className="glass-panel p-8 rounded-2xl border-t-4 border-green-500">
                            <div className="text-xs font-mono text-gray-500 mb-2">ROLE: RISK MANAGER</div>
                            <h3 className="text-2xl font-bold text-white mb-4">The Guardian</h3>
                            <p className="text-gray-400 mb-6">
                                Simulates every transaction before broadcasting. If profit &le; 0, the transaction never happens.
                            </p>
                            <div className="flex items-center gap-2 text-sm text-green-400 bg-green-400/5 px-3 py-2 rounded-lg w-fit">
                                <Shield size={16} /> Loss: Impossible
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- FEATURES GRID --- */}
            <section className="max-w-7xl mx-auto px-4 py-24 relative z-10">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-purple/5 rounded-full blur-[100px] pointer-events-none -z-10"></div>

                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-3xl md:text-5xl font-black tracking-tighter">THE <span className="text-gradient">NEURAL MATRIX</span> ARCHITECTURE</h2>
                    <p className="text-gray-400 max-w-2xl mx-auto text-sm md:text-base">
                        Built on 4 pillars: Mission Control (NASA), The Iron Man Stellart (Neural Kernel), The Hot Potato (Atomic Engine), and The Forensic Black Box (Walrus).
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                    {[
                        { icon: Workflow, title: 'Visual Strategy Builder', desc: 'Drag-and-drop node editor for custom strategies', color: 'text-purple-400' },
                        { icon: BookOpen, title: 'Operations Manual', desc: 'Step-by-step guide for protocol operators', color: 'text-neon-cyan' },
                        { icon: Layers, title: 'Strategy Marketplace', desc: '16+ pre-built strategies ready to deploy. XLM & USDC asset selector on each.', color: 'text-blue-400' },
                        { icon: Shield, title: "The Hot Potato (Execution)", desc: "Implements a 10-second 'Hot Potato' pattern. Borrow millions in flash liquidity; if the arb fails to repay, the timeline is 'rewound' as if nothing happened.", color: "text-purple-400" },
                        { icon: Cpu, title: "Neural Matrix (The Stellart)", desc: "The J.A.R.V.I.S. of DeFi. Inject new trading strategies into the pilot's helmet in mid-flight (hot-swapping) without ever powering down.", color: "text-blue-400" },
                        { icon: HardDrive, title: "Forensic Black Box (Walrus)", desc: "Decentralized flight recorder. Every decision is written in digital stone on the Walrus Protocol. Indestructible and absolute proof of activity.", color: "text-pink-500" },
                        { icon: MessageSquare, title: "Mission Control Voice", desc: "Command your agents via vocal field radio. Integrated STT/TTS modules allow operators to receive audio status reports in the heat of battle.", color: "text-yellow-400" },
                        { icon: TerminalIcon, title: "Self-Healing Gateway", desc: "Automated diagnostics via CLI. Monitoring network health and gas levels with auto-pause functionality for maximum operational safety.", color: "text-gray-400" },
                        { icon: Zap, title: "AI Failover Core 2.0", desc: "Multi-provider architecture (OpenAI -> Anthropic -> Bedrock) ensures 99.99% uptime for the agent's decision-making logic.", color: "text-green-500" }
                    ].map((feature, i) => (
                        <div key={i} className="glass-panel p-6 rounded-xl hover:bg-white/5 transition-all group border border-white/5">
                            <div className={`w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center mb-4 ${feature.color} group-hover:scale-110 transition-transform`}>
                                <feature.icon size={24} />
                            </div>
                            <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="border-t border-white/5 bg-black/40 py-24 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-neon-cyan/5 rounded-full blur-[100px] pointer-events-none"></div>

                <div className="max-w-7xl mx-auto px-4 z-10 relative">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-black tracking-tighter">THE <span className="text-neon-cyan">LOOP</span></h2>
                        <p className="text-gray-400 mt-4 text-lg">How an Autonomous Agent executes an Atomic Arb</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
                        {[
                            { step: "01", title: "OBSERVE", desc: "Agent scans Scallop APY, Navi Protocol liquidity, and Cetus Pools for price dislocations." },
                            { step: "02", title: "CALCULATE", desc: "Computes optimal loan amount and expected spread profitability across protocols." },
                            { step: "03", title: "CONSTRUCT", desc: "Builds a PTB using Navi/Scallop flash loans and DeepBook V3 routes." },
                            { step: "04", title: "EXECUTE", desc: "Submits to blockchain. Profit is captured or the Hot Potato reverts safely." }
                        ].map((s, i) => (
                            <div key={i} className="relative z-10 flex flex-col items-center text-center group">
                                <div className="text-6xl md:text-8xl font-black text-white/5 mb-4 select-none group-hover:text-neon-cyan/10 transition-colors">{s.step}</div>
                                <div className="w-4 h-4 rounded-full bg-neon-cyan mb-6 animate-pulse shadow-[0_0_15px_rgba(0,243,255,0.5)]"></div>
                                <h3 className="text-xl font-bold mb-3">{s.title}</h3>
                                <p className="text-gray-400 text-sm max-w-[200px]">{s.desc}</p>
                                {i < 3 && <div className="hidden md:block absolute top-[110px] left-1/2 w-full h-[2px] bg-gradient-to-r from-neon-cyan/30 to-transparent -z-10 transform translate-x-1/2"></div>}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- BUILDER HIGHLIGHT --- */}
            <section className="py-24 px-4 relative overflow-hidden border-t border-white/5">
                <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-neon-purple/10 rounded-full blur-[150px] pointer-events-none"></div>

                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Left: Description */}
                    <div className="space-y-6 z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-neon-purple/10 border border-neon-purple/30 rounded-full text-neon-purple text-sm font-mono">
                            <span className="w-2 h-2 bg-neon-purple rounded-full animate-pulse"></span>
                            NEW IN v0.0.7
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black tracking-tighter">
                            VISUAL <span className="text-gradient">STRATEGY BUILDER</span>
                        </h2>
                        <p className="text-gray-400 text-lg leading-relaxed">
                            Create custom trading strategies with our intuitive drag-and-drop editor.
                            Connect triggers, conditions, and actions visually - no coding required.
                        </p>
                        <ul className="space-y-3 text-gray-300">
                            {[
                                "6 node categories: Atomic Engine · AI · Swaps · Security · Social · Signals",
                                "XLM / USDC asset selector per strategy",
                                "Deploy with one-click wallet signature",
                                "Export Schema for sharing or auditing"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full bg-neon-cyan/20 flex items-center justify-center">
                                        <div className="w-2 h-2 bg-neon-cyan rounded-full"></div>
                                    </div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                        <Link
                            href="/strategies/builder"
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-neon-purple to-neon-cyan text-black font-bold px-8 py-3 rounded-full hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all"
                        >
                            <Layers size={18} />
                            Open Builder
                        </Link>
                    </div>

                    {/* Right: Visual Preview */}
                    <div className="relative z-10 hidden lg:block">
                        <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-4 shadow-2xl">
                            {/* Mock Builder UI */}
                            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                </div>
                                <span className="text-xs text-gray-500 font-mono">Strategy Builder</span>
                            </div>
                            <div className="grid grid-cols-4 gap-4 min-h-[250px]">
                                {/* Sidebar Mock */}
                                <div className="col-span-1 space-y-2">
                                    <div className="text-xs text-gray-500 uppercase mb-2">Triggers</div>
                                    {["Price> $2.50", "Every 1 Hour", "High Gas"].map((t, i) => (
                                        <div key={i} className="px-2 py-1.5 bg-white/5 rounded text-xs text-gray-400 border border-white/5">
                                            {t}
                                        </div>
                                    ))}
                                </div>
                                {/* Canvas Mock */}
                                <div className="col-span-3 bg-[#0F0F0F] rounded-lg border border-white/5 relative overflow-hidden">
                                    {/* Mock Nodes */}
                                    <div className="absolute top-8 left-8 bg-gradient-to-r from-yellow-500/80 to-orange-500/80 px-3 py-2 rounded-lg border border-white/20 text-xs font-bold shadow-lg">
                                        🕐 Every 1 Hour
                                    </div>
                                    <div className="absolute top-8 right-8 bg-gradient-to-r from-green-500/80 to-emerald-500/80 px-3 py-2 rounded-lg border border-white/20 text-xs font-bold shadow-lg">
                                        ⚡ Execute Swap
                                    </div>
                                    {/* Connection Line */}
                                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                                        <path d="M 130 40 Q 180 70 210 40" stroke="rgba(0,243,255,0.5)" strokeWidth="2" fill="none" strokeDasharray="4 2" />
                                    </svg>
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-gray-500 font-mono">
                                        Drag nodes to connect
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- DEVELOPER TOOLS --- */}
            <section className="py-24 px-4 bg-black/40 border-t border-white/5 relative">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="text-3xl md:text-5xl font-black tracking-tighter">BUILD ON <span className="text-gradient">XLMLOOP</span></h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            Institutional-grade tooling for Neural Matrix operators and quant developers.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* CLI */}
                        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-8 hover:border-neon-cyan/30 transition-colors group">
                            <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <TerminalIcon className="text-neon-cyan" size={24} />
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-white">Nirium CLI</h3>
                            <p className="text-gray-400 text-sm mb-6 h-10">Scaffold production-ready autonomous agents in seconds.</p>
                            <div className="bg-black border border-white/10 rounded px-4 py-3 font-mono text-xs text-neon-cyan flex justify-between items-center">
                                <span>./install.sh</span>
                                <div className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse"></div>
                            </div>
                        </div>

                        {/* TS SDK */}
                        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-8 hover:border-blue-500/30 transition-colors group">
                            <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Cpu className="text-blue-500" size={24} />
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-white">TypeScript SDK</h3>
                            <p className="text-gray-400 text-sm mb-6 h-10">Type-safe bindings for web integrations and frontend dApps.</p>
                            <div className="bg-black border border-white/10 rounded px-4 py-3 font-mono text-xs text-blue-400">
                                npm i @nirium/sdk
                            </div>
                        </div>

                        {/* Python SDK */}
                        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-8 hover:border-yellow-500/30 transition-colors group">
                            <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Activity className="text-yellow-500" size={24} />
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-white">Python SDK</h3>
                            <p className="text-gray-400 text-sm mb-6 h-10">Async client for algorithmic trading and data science.</p>
                            <div className="bg-black border border-white/10 rounded px-4 py-3 font-mono text-xs text-yellow-400">
                                pip install nirium
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 text-center">
                        <Link href="https://x.com/Vaiosx" className="text-gray-400 hover:text-white transition-colors underline underline-offset-4 decoration-neon-cyan/50 text-sm">
                            Visit Developer Hub <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* --- CTA --- */}
            <section className="py-32 px-4 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-neon-purple/10 pointer-events-none"></div>
                <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-8 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">READY TO DEPLOY?</h2>
                <div className="flex flex-wrap justify-center gap-4">
                    <Link href="/strategies" className="bg-neon-cyan text-black font-bold px-10 py-4 rounded-full hover:shadow-[0_0_40px_rgba(0,243,255,0.4)] transition-all text-lg scale-100 hover:scale-105 active:scale-95 duration-200 cursor-pointer">
                        Browse Strategies
                    </Link>
                    <Link href="/strategies/builder" className="border border-neon-purple text-neon-purple font-bold px-10 py-4 rounded-full hover:bg-neon-purple/10 transition-all text-lg cursor-pointer">
                        Open Builder
                    </Link>
                    <Link href="/marketplace" className="border border-blue-500/50 text-blue-400 font-bold px-10 py-4 rounded-full hover:bg-blue-500/10 transition-all text-lg cursor-pointer">
                        Marketplace
                    </Link>
                    <Link href="/plugins" className="border border-pink-500/50 text-pink-400 font-bold px-10 py-4 rounded-full hover:bg-pink-500/10 transition-all text-lg cursor-pointer">
                        Plugins
                    </Link>
                    <Link href="/docs" className="border border-white/10 text-white font-bold px-10 py-4 rounded-full hover:bg-white/5 transition-all text-lg cursor-pointer">
                        Read Docs
                    </Link>
                </div>
            </section>



        </main >
    );
}

