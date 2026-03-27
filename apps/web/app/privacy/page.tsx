'use client';

import Navbar from "@/components/layout/Navbar";
import { useLanguage } from "../../context/LanguageContext";
import { motion } from "framer-motion";
import { Shield, Lock, Eye, FileCheck, Brain } from "lucide-react";

export default function PrivacyPage() {
    const { t } = useLanguage();

    return (
        <div className="min-h-screen pt-56 pb-24 px-4 md:px-8 relative overflow-hidden bg-[#050505]">
            <Navbar />

            <div className="max-w-4xl mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4 uppercase">
                        Privacy Policy
                    </h1>
                    <p className="text-gray-400 font-mono text-sm uppercase tracking-widest bg-white/5 border border-white/10 px-4 py-2 rounded-lg inline-block">
                        Last Updated: March 27, 2026
                    </p>
                </motion.div>

                <div className="grid gap-8">
                    <section className="glass-panel p-8 rounded-2xl border border-white/10">
                        <div className="flex items-center gap-3 mb-4 text-stellar-teal">
                            <Shield className="w-6 h-6" />
                            <h2 className="text-xl font-bold uppercase tracking-tight">Data Sovereignty</h2>
                        </div>
                        <p className="text-gray-400 leading-relaxed mb-4">
                            Nirium is a decentralized protocol. We do not store your private keys, seed phrases, or personal identity information on our servers. Your interaction with the protocol is primarily mediated through your Stellar wallet (e.g., Freighter) and your own AI API keys.
                        </p>
                    </section>

                    <section className="glass-panel p-8 rounded-2xl border border-white/10">
                        <div className="flex items-center gap-3 mb-4 text-blue-400">
                            <Brain className="w-6 h-6" />
                            <h2 className="text-xl font-bold uppercase tracking-tight">AI & LLM Providers</h2>
                        </div>
                        <p className="text-gray-400 leading-relaxed mb-4">
                            When using the Autonomous Loop, market data is processed through third-party LLM providers (OpenAI, Anthropic, Gemini, etc.). We do not share your wallet address or personal identifiers with these providers. Only anonymized market telemetry and strategy parameters are transmitted for signal generation.
                        </p>
                    </section>

                    <section className="glass-panel p-8 rounded-2xl border border-white/10">
                        <div className="flex items-center gap-3 mb-4 text-stellar-yellow">
                            <Eye className="w-6 h-6" />
                            <h2 className="text-xl font-bold uppercase tracking-tight">On-Chain Data</h2>
                        </div>
                        <p className="text-gray-400 leading-relaxed">
                            Please be aware that all transactions, smart contract interactions, and ELO rankings are recorded on the public Stellar blockchain. This data is immutable and transparently available to anyone with access to a blockchain explorer.
                        </p>
                    </section>

                    <section className="glass-panel p-8 rounded-2xl border border-white/10">
                        <div className="flex items-center gap-3 mb-4 text-green-400">
                            <FileCheck className="w-6 h-6" />
                            <h2 className="text-xl font-bold uppercase tracking-tight">RWA & Compliance</h2>
                        </div>
                        <p className="text-gray-400 leading-relaxed mb-4">
                            For Real World Asset (RWA) operations like CETES, Nirium acts as a technical bridge to regulated providers (Etherfuse/Indeval). Any Personal Identifiable Information (PII) required for bank-level KYC is processed directly by these partners under their own privacy standards and bank secrecy laws.
                        </p>
                    </section>

                    <section className="glass-panel p-8 rounded-2xl border border-white/10">
                        <div className="flex items-center gap-3 mb-4 text-purple-400">
                            <Lock className="w-6 h-6" />
                            <h2 className="text-xl font-bold uppercase tracking-tight">Analytics & Security</h2>
                        </div>
                        <p className="text-gray-400 leading-relaxed mb-4">
                            We collect anonymous telemetry (e.g., error rates, latency) to improve protocol performance. This data is stored in our forensic archive on IPFS for auditability but remains decoupled from your off-chain identity.
                        </p>
                    </section>

                    <section className="bg-white/5 p-8 rounded-2xl border border-white/10 italic text-gray-400 text-sm">
                        For institutional partners regarding regulatory reporting, CNBV compliance, and private data siloing, please contact institucional@nirium.xyz.
                    </section>
                </div>
            </div>
        </div>
    );
}
