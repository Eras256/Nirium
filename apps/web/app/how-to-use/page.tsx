"use client";

import Navbar from "@/components/layout/Navbar";
import {
    BookOpen,
    ChevronRight,
    ArrowRight,
    Zap,
    Shield,
    Cpu,
    Wallet,
    MousePointer2,
    Settings,
    LayoutDashboard,
    Play,
    Terminal,
    CheckCircle2
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import Footer from "@/components/layout/Footer";

export default function HowToUsePage() {
    return (
        <main className="min-h-screen bg-black text-white font-sans selection:bg-stellar-teal/30">
            <Navbar />

            {/* Background Effects */}
            <div className="fixed inset-0 z-0">
                <div className="absolute top-0 right-0 w-full h-[600px] bg-gradient-to-b from-stellar-teal/10 to-transparent opacity-50" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-stellar-yellow/5 blur-[150px] rounded-full" />
            </div>

            <div className="relative z-10 pt-40 pb-20">
                <div className="max-w-5xl mx-auto px-6">
                    {/* Header */}
                    <div className="text-center mb-20 section-lift">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-stellar-teal/10 border border-stellar-teal/30 rounded-full text-stellar-teal text-xs font-mono mb-6">
                            <BookOpen size={14} />
                            OPERATIONS MANUAL v0.0.7
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6">
                            HOW TO <span className="text-gradient">OPERATE</span>
                        </h1>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            Master the Nirium Neural Matrix. From visual strategy architecture to autonomous agent deployment.
                        </p>
                    </div>

                    {/* Step by Step Guide */}
                    <div className="space-y-12">
                        {STEPS.map((step, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="glass-panel p-8 rounded-3xl border border-white/10 hover:border-white/20 transition-all group section-lift"
                            >
                                <div className="flex flex-col md:flex-row gap-8">
                                    <div className="shrink-0">
                                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center text-black shadow-lg group-hover:scale-110 transition-transform`}>
                                            <step.icon size={32} />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="text-stellar-teal font-mono text-sm tracking-widest uppercase opacity-50">Step {i + 1}</span>
                                            <h2 className="text-2xl font-bold">{step.title}</h2>
                                        </div>
                                        <p className="text-gray-400 leading-relaxed mb-6">
                                            {step.description}
                                        </p>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {step.features.map((feature, idx) => (
                                                <div key={idx} className="flex items-center gap-3 text-sm text-gray-300">
                                                    <CheckCircle2 size={16} className="text-stellar-teal shrink-0" />
                                                    {feature}
                                                </div>
                                            ))}
                                        </div>

                                        {step.actionLabel && (
                                            <Link
                                                href={step.actionHref}
                                                className="inline-flex items-center gap-2 mt-8 text-stellar-teal font-bold hover:gap-3 transition-all"
                                            >
                                                {step.actionLabel} <ArrowRight size={18} />
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Pro Tips Section */}
                    <div className="mt-32 section-lift">
                        <div className="glass-panel p-12 rounded-3xl border border-stellar-yellow/20 bg-gradient-to-br from-stellar-yellow/5 to-transparent relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <Zap size={120} className="text-stellar-yellow" />
                            </div>

                            <h3 className="text-3xl font-bold mb-8 flex items-center gap-4">
                                <Settings className="text-stellar-yellow" />
                                ADVANCED PROTOCOLS
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h4 className="text-white font-bold flex items-center gap-2">
                                        <Shield size={18} className="text-stellar-teal" />
                                        Non-Custodial Safety
                                    </h4>
                                    <p className="text-sm text-gray-400 leading-relaxed">
                                        Nirium uses a dual-auth system. Your <span className="text-white font-bold">Owner Key</span> never leaves your cold wallet, meaning only you can withdraw funds. The <span className="text-stellar-yellow font-bold">Agent Auth</span> only authorizes execution, preventing any unauthorized outflows.
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="text-white font-bold flex items-center gap-2">
                                        <Terminal size={18} className="text-stellar-yellow" />
                                        Developer Uplink
                                    </h4>
                                    <p className="text-sm text-gray-400 leading-relaxed">
                                        Power users can scaffold custom units using our CLI. Run <code className="bg-white/5 px-1 rounded text-stellar-teal">npx nirium create-unit</code> to inject custom Soroban kernels or Python/Node.js logic directly into the Neural Matrix.
                                        All agent decisions are cryptographically signed and archived for tamper-proof forensic auditing.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CTA Footer */}
                    <div className="mt-32 text-center section-lift">
                        <h2 className="text-3xl font-bold mb-8">Ready to initiate the Matrix?</h2>
                        <div className="flex flex-wrap justify-center gap-6">
                            <Link
                                href="/strategies"
                                className="bg-stellar-yellow text-black font-bold px-10 py-4 rounded-full hover:shadow-[0_0_30px_rgba(255,200,0,0.4)] transition-all flex items-center gap-2"
                            >
                                <Zap size={20} /> Deploy Now
                            </Link>
                            <Link
                                href="/agents"
                                className="border border-stellar-yellow/40 text-stellar-yellow font-bold px-10 py-4 rounded-full hover:bg-stellar-yellow/10 transition-all"
                            >
                                Agents Console
                            </Link>
                            <Link
                                href="/docs"
                                className="border border-white/10 text-white font-bold px-10 py-4 rounded-full hover:bg-white/5 transition-all"
                            >
                                Technical Specs
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

        </main>
    );
}

const STEPS = [
    {
        title: "Uplink Session",
        description: "Connect your Stellar wallet to establish an encrypted session. Nirium supports all major Stellar wallets (Freighter, Albedo, xBull) with persistent session restoration and auto-reconnect.",
        icon: Wallet,
        color: "from-blue-400 to-cyan-400",
        features: [
            "Support for Freighter & Albedo",
            "Hardware wallet compatible",
            "Auto-restores session",
            "Phoenix & SDEX Integration"
        ],
        actionLabel: "Connect Now",
        actionHref: "/dashboard"
    },
    {
        title: "Deploy Core Unit",
        description: "Deploy your autonomous agent base. This Soroban-native contract grants your account withdrawal control, ensuring only you can withdraw funds while the Agent Auth delegates execution rights.",
        icon: Shield,
        color: "from-stellar-teal to-teal-500",
        features: [
            "Single-block deployment",
            "Withdrawal Control",
            "Non-custodial by design",
            "Soroban Atomic Safety"
        ],
        actionLabel: "Initialize Agent",
        actionHref: "/dashboard"
    },
    {
        title: "Skill Integration",
        description: "Empower your agent via the Neural Marketplace. Install modular skills like 'Atomic Flash Loan', 'Price Monitor', or 'Whale Tracker' to customize your unit's intelligence.",
        icon: Cpu, // Changed icon to represent modular chips/skills
        color: "from-stellar-yellow to-purple-600",
        features: [
            "Modular Skill Architecture",
            "One-Click Installation",
            "Agent-Specific Memory",
            "Hot-Swappable Logic"
        ],
        actionLabel: "Browse Marketplace",
        actionHref: "/marketplace"
    },
    {
        title: "Strategy Builder",
        description: "Design custom logic loops in the Visual Editor. Connect 6 node categories including the Atomic Engine (Path Payments, Execute Tx), AI Intelligence, and Trading & Swap connectors. Select XLM or USDC vault asset before compiling your kernel.",
        icon: MousePointer2,
        color: "from-pink-500 to-rose-500",
        features: [
            "Visual Node Editor (drag & drop)",
            "Atomic Engine: PATH_PAYMENT, EXECUTE_TX",
            "XLM / USDC asset selector",
            "Export Schema as JSON"
        ],
        actionLabel: "Open Builder",
        actionHref: "/strategies/builder"
    },
    {
        title: "Live Monitoring",
        description: "Watch your fleet in action. The Command Center and Agents Console provide real-time telemetry, Horizon latency, transaction traces, and forensic logs backed by decentralized IPFS storage.",
        icon: Terminal,
        color: "from-amber-400 to-orange-500",
        features: [
            "Real-Time Telemetry & Horizon Latency",
            "Neural Archive Logs (immutable)",
            "Decentralized Auditing",
            "Circuit Breaker Triggers"
        ],
        actionLabel: "Agents Console",
        actionHref: "/agents"
    }
];
