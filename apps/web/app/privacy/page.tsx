'use client';

import Navbar from "@/components/layout/Navbar";
import { useLanguage } from "../../context/LanguageContext";
import { motion } from "framer-motion";
import { Shield, Lock, Eye, FileCheck, Brain } from "lucide-react";

export default function PrivacyPage() {
    const { t } = useLanguage();
    const privacy = t.privacy_policy || { title: "Privacy Policy", last_updated: "", sections: {} };

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
                        {privacy.title}
                    </h1>
                    <p className="text-stellar-teal font-mono text-sm uppercase tracking-widest bg-white/5 border border-white/10 px-4 py-2 rounded-lg inline-block">
                        {privacy.last_updated}
                    </p>
                </motion.div>

                <div className="grid gap-8">
                    {Object.values(privacy.sections).map((section: any, idx: number) => {
                        const icons = [Shield, Brain, Eye, FileCheck, Lock];
                        const colors = ["text-stellar-teal", "text-blue-400", "text-stellar-yellow", "text-green-400", "text-purple-400"];
                        const Icon = icons[idx % icons.length];
                        const colorClass = colors[idx % colors.length];

                        return (
                            <section key={idx} className="glass-panel p-8 rounded-2xl border border-white/10">
                                <div className={`flex items-center gap-3 mb-4 ${colorClass}`}>
                                    <Icon className="w-6 h-6" />
                                    <h2 className="text-xl font-bold uppercase tracking-tight">{section.title}</h2>
                                </div>
                                <p className="text-gray-400 leading-relaxed mb-4 whitespace-pre-line">
                                    {section.content}
                                </p>
                            </section>
                        );
                    })}

                    <section className="bg-white/5 p-8 rounded-2xl border border-white/10 italic text-gray-400 text-sm">
                        For institutional partners regarding regulatory reporting, CNBV compliance, and private data siloing, please contact institucional@nirium.xyz.
                    </section>
                </div>
            </div>
        </div>
    );
}
