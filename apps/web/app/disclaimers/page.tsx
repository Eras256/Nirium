'use client';

import Navbar from "@/components/layout/Navbar";
import { AlertTriangle, Shield, Bot, Beaker, Scale, FileWarning, Code2 } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";

export default function DisclaimersPage() {
    const { t } = useLanguage();
    const disclaimers = t.disclaimers || { 
        title: "Disclaimers", 
        last_updated: "", 
        mandatory: "Mandatory Reading",
        sections: {},
        footer: ""
    };

    const icons = [AlertTriangle, Scale, Code2, Bot, Beaker, FileWarning, Shield];
    const colors = ["text-red-500", "text-amber-400", "text-blue-400", "text-purple-400", "text-stellar-teal", "text-orange-400", "text-green-400"];
    const borderColors = ["border-red-500/20", "border-amber-400/20", "border-blue-400/20", "border-purple-400/20", "border-stellar-teal/20", "border-orange-400/20", "border-green-400/20"];
    const bgColors = ["bg-red-500/5", "bg-amber-400/5", "bg-blue-400/5", "bg-purple-400/5", "bg-stellar-teal/5", "bg-orange-400/5", "bg-green-400/5"];

    const fadeUp = (delay = 0) => ({
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5, delay },
    });

    return (
        <div className="min-h-screen pt-48 pb-24 px-4 md:px-8 relative bg-[#050505] overflow-x-hidden">
            <Navbar />

            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-red-500/5 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-amber-500/5 blur-[150px] rounded-full pointer-events-none" />

            <div className="max-w-3xl mx-auto relative z-10">
                {/* Header */}
                <motion.div {...fadeUp()} className="mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/30 rounded-full text-[10px] font-mono text-red-400 mb-4 uppercase tracking-widest font-bold">
                        <AlertTriangle className="w-3 h-3" /> {disclaimers.mandatory.split(':')[0]}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4 uppercase">
                        {disclaimers.title}
                    </h1>
                    <p className="text-stellar-teal font-mono text-sm uppercase tracking-widest bg-white/5 border border-white/10 px-4 py-2 rounded-lg inline-block">
                        {disclaimers.last_updated}
                    </p>
                </motion.div>

                {/* Alert Box */}
                <motion.div {...fadeUp(0.1)} className="mb-10 p-6 bg-red-500/5 border border-red-500/20 rounded-2xl">
                    <p className="text-xs font-mono text-red-400 font-bold uppercase leading-relaxed">
                        ⚠️ {disclaimers.mandatory}
                    </p>
                </motion.div>

                {/* Sections */}
                <div className="space-y-6">
                    {Object.values(disclaimers.sections).map((section: any, idx: number) => {
                        const Icon = icons[idx % icons.length];
                        const color = colors[idx % colors.length];
                        const borderColor = borderColors[idx % borderColors.length];
                        const bgColor = bgColors[idx % bgColors.length];

                        return (
                            <motion.section
                                key={idx}
                                {...fadeUp(0.1 + idx * 0.05)}
                                className={`p-8 rounded-2xl border ${borderColor} ${bgColor} space-y-4`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bgColor} border ${borderColor}`}>
                                        <Icon className={`w-5 h-5 ${color}`} />
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

                {/* Footer */}
                <motion.div {...fadeUp(0.6)} className="mt-12 p-6 bg-white/5 border border-white/10 rounded-2xl text-center">
                    <p className="text-[10px] md:text-xs uppercase tracking-[0.15em] text-gray-500 font-bold">
                        {disclaimers.footer}
                    </p>
                </motion.div>

                {/* Back Link */}
                <div className="flex justify-center gap-6 pt-6">
                    <a href="/" className="text-[10px] font-black uppercase tracking-widest text-stellar-teal hover:text-white transition-colors">
                        ← {t.docs?.overview?.back || "Return to Home"}
                    </a>
                    <a href="/terms" className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors">
                        {t.footer?.terms || "Terms of Service"} →
                    </a>
                </div>
            </div>
        </div>
    );
}
