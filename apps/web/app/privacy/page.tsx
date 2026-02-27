'use client';

import Navbar from "@/components/layout/Navbar";
import { useLanguage } from "../../context/LanguageContext";
import { motion } from "framer-motion";
import { Shield, Lock, Eye, FileCheck } from "lucide-react";

export default function PrivacyPage() {
    const { t } = useLanguage();

    return (
        <div className="min-h-screen pt-32 pb-24 px-4 md:px-8 relative overflow-hidden bg-[#050505]">
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
                        Last Updated: February 27, 2026
                    </p>
                </motion.div>

                <div className="grid gap-8">
                    <section className="glass-panel p-8 rounded-2xl border border-white/10">
                        <div className="flex items-center gap-3 mb-4 text-stellar-teal">
                            <Shield className="w-6 h-6" />
                            <h2 className="text-xl font-bold uppercase tracking-tight">Data Sovereignty</h2>
                        </div>
                        <p className="text-gray-400 leading-relaxed mb-4">
                            Nirium is a decentralized protocol. We do not store your private keys, seed phrases, or personal identity information on our servers. Your interaction with the protocol is primarily mediated through your Stellar wallet (e.g., Freighter).
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
                        <div className="flex items-center gap-3 mb-4 text-purple-400">
                            <Lock className="w-6 h-6" />
                            <h2 className="text-xl font-bold uppercase tracking-tight">Analytics</h2>
                        </div>
                        <p className="text-gray-400 leading-relaxed mb-4">
                            We may collect anonymous usage statistics to improve the user interface and protocol performance. This data is never linked to your specific wallet address or identifiable personal information.
                        </p>
                    </section>

                    <section className="bg-white/5 p-8 rounded-2xl border border-white/10 italic text-gray-400 text-sm">
                        For institutional inquiries regarding data compliance and private deployments, please contact our core development team.
                    </section>
                </div>
            </div>
        </div>
    );
}
