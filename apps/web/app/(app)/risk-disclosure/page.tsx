'use client';

import { useLanguage } from "@/context/LanguageContext";
import { motion } from "framer-motion";
import { AlertTriangle, Shield, Scale, Activity, Cpu } from "lucide-react";
import Link from "next/link";

export default function RiskDisclosurePage() {
    const { t } = useLanguage();
    const risk = t.risk_disclosure || {
        title: "Algorithmic Risk Disclosure",
        mandatory: "MANDATORY ACKNOWLEDGEMENT: You are using algorithmic, highly experimental open-source software.",
        sections: {},
        footer: "By connecting your wallet, you accept all risks outlined above."
    };

    const icons = [Activity, Shield, Scale, Cpu, AlertTriangle];

    return (
        <div className="min-h-screen pt-8 pb-24 px-4 md:px-8 relative bg-black overflow-x-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-500/5 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-red-900/5 blur-[150px] rounded-full pointer-events-none" />

            <div className="max-w-3xl mx-auto relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-12"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/30 rounded-full text-[10px] font-mono text-red-500 mb-4 uppercase tracking-widest font-bold shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                        <AlertTriangle className="w-3 h-3" /> Emergency Protocol Notice
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4 uppercase">
                        {risk.title}
                    </h1>
                    
                    <div className="font-mono text-[11px] md:text-xs uppercase text-red-500 font-bold border-l-4 border-red-500 pl-4 py-3 bg-red-500/5 rounded-r-lg mt-6">
                        {risk.mandatory}
                    </div>
                </motion.div>

                {/* Sections */}
                <div className="space-y-6">
                    {Object.values(risk.sections).map((section: any, idx: number) => {
                        const Icon = icons[idx % icons.length];

                        return (
                            <motion.section
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 + idx * 0.05 }}
                                className="p-8 rounded-2xl border border-red-500/20 bg-red-950/10 space-y-4 group hover:bg-red-950/20 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-500/10 border border-red-500/30 group-hover:scale-110 transition-transform">
                                        <Icon className="w-5 h-5 text-red-400" />
                                    </div>
                                    <h2 className="text-xl font-bold text-white uppercase tracking-tight">
                                        {section.title}
                                    </h2>
                                </div>
                                <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-line pl-[52px]">
                                    {section.content}
                                </p>
                            </motion.section>
                        );
                    })}
                </div>

                {/* Footer Notice */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-12 p-6 bg-red-500/5 border border-red-500/20 rounded-2xl text-center relative overflow-hidden"
                >
                    <p className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-red-400 font-black">
                        {risk.footer}
                    </p>
                </motion.div>

                {/* Back Links */}
                <div className="flex justify-center gap-6 pt-8">
                    <Link href="/" className="text-[10px] font-black uppercase tracking-widest text-stellar-teal hover:text-white transition-colors">
                        ← Return to Home
                    </Link>
                    <Link href="/privacy" className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors">
                        Privacy Policy →
                    </Link>
                </div>
            </div>
        </div>
    );
}
