'use client';

import { useLanguage } from "@/context/LanguageContext";
import { motion } from "framer-motion";
import { Scale, FileText, Shield, Gavel, Cpu, Lock, AlertTriangle, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function CocPage() {
    const { t } = useLanguage();
    const coc = t.coc_page || { title: "Code of Conduct", last_updated: "", sections: {} };

    const icons = [CheckCircle, FileText, Shield, Gavel, Cpu, Lock, AlertTriangle, Scale];
    const colors = ["text-stellar-teal", "text-blue-400", "text-amber-400", "text-purple-400", "text-emerald-400", "text-pink-400", "text-red-400", "text-stellar-yellow"];
    const borderColors = ["border-stellar-teal/20", "border-blue-400/20", "border-amber-400/20", "border-purple-400/20", "border-emerald-400/20", "border-pink-400/20", "border-red-400/20", "border-stellar-yellow/20"];
    const bgColors = ["bg-stellar-teal/5", "bg-blue-400/5", "bg-amber-400/5", "bg-purple-400/5", "bg-emerald-400/5", "bg-pink-400/5", "bg-red-400/5", "bg-stellar-yellow/5"];

    return (
        <div className="min-h-screen pt-8 pb-24 px-4 md:px-8 relative bg-[#050505] overflow-x-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-stellar-teal/5 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/5 blur-[150px] rounded-full pointer-events-none" />

            <div className="max-w-3xl mx-auto relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-12"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-stellar-teal/10 border border-stellar-teal/30 rounded-full text-[10px] font-mono text-stellar-teal mb-4 uppercase tracking-widest font-bold">
                        <CheckCircle className="w-3 h-3" /> Compliance Verification
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4 uppercase">
                        {coc.title}
                    </h1>
                    <p className="text-stellar-teal font-mono text-sm uppercase tracking-widest bg-white/5 border border-white/10 px-4 py-2 rounded-lg inline-block">
                        {coc.last_updated}
                    </p>
                </motion.div>

                {/* Sections */}
                <div className="space-y-6">
                    {Object.values(coc.sections).map((section: any, idx: number) => {
                        const Icon = icons[idx % icons.length];
                        const color = colors[idx % colors.length];
                        const borderColor = borderColors[idx % borderColors.length];
                        const bgColor = bgColors[idx % bgColors.length];

                        return (
                            <motion.section
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 + idx * 0.05 }}
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
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-12 p-6 bg-white/5 border border-white/10 rounded-2xl text-center"
                >
                    <p className="text-[10px] md:text-xs uppercase tracking-[0.15em] text-gray-500 font-bold">
                        By participating in the Nirium Protocol ecosystem, you agree to these standards.
                    </p>
                </motion.div>

                {/* Back Links */}
                <div className="flex justify-center gap-6 pt-8">
                    <Link href="/" className="text-[10px] font-black uppercase tracking-widest text-stellar-teal hover:text-white transition-colors">
                        ← Return to Home
                    </Link>
                    <Link href="/compliance" className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors">
                        Compliance Dashboard →
                    </Link>
                </div>
            </div>
        </div>
    );
}
