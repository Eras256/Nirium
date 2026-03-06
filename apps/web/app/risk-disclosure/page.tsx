'use client';

import Navbar from "@/components/layout/Navbar";
import { AlertTriangle, Shield, Scale, ExternalLink } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function RiskDisclosurePage() {
    const { t } = useLanguage();
    const risk = t.risk_disclosure || {
        title: "Algorithmic Risk Disclosure",
        mandatory: "MANDATORY ACKNOWLEDGEMENT: You are using algorithmic, highly experimental open-source software.",
        sections: {
            execution: { title: "1. Autonomous Execution Risks", content: "..." },
            custody: { title: "2. Use At Your Own Risk", content: "..." }
        },
        footer: "By connecting your wallet, you accept all risks outlined above."
    };

    return (
        <div className="min-h-screen pt-32 pb-12 px-4 md:px-8 relative bg-[#050505] overflow-x-hidden">
            <Navbar />

            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-500/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-3xl mx-auto relative z-10 glass-panel p-6 md:p-12 rounded-[2rem] border border-red-500/20 text-gray-300 space-y-8 bg-red-950/5">
                <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8">
                    <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.1)]">
                        <AlertTriangle className="text-red-500 w-7 h-7" />
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter leading-none">
                            {risk.title}
                        </h1>
                        <p className="mt-2 text-xs font-mono text-red-500/70 font-bold tracking-widest uppercase">
                            Emergency Protocol Activated
                        </p>
                    </div>
                </div>

                <div className="font-mono text-[11px] md:text-xs uppercase text-red-500 font-bold border-l-4 border-red-500 pl-5 py-4 bg-red-500/5 rounded-r-xl">
                    {risk.mandatory}
                </div>

                <div className="space-y-10 pt-4">
                    {Object.values(risk.sections).map((section: any, idx) => (
                        <section key={idx} className="space-y-4 group">
                            <div className="flex items-center gap-3">
                                <div className="h-[1px] w-8 bg-red-500/30 group-hover:w-12 transition-all" />
                                <h2 className="text-lg font-black text-white uppercase tracking-tight group-hover:text-red-400 transition-colors">
                                    {section.title}
                                </h2>
                            </div>
                            <p className="text-sm leading-relaxed text-gray-400 pl-11">
                                {section.content}
                            </p>
                        </section>
                    ))}
                </div>

                <div className="mt-12 p-6 bg-white/5 border border-white/10 rounded-2xl text-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <p className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-gray-500 font-black relative z-10">
                        {risk.footer}
                    </p>
                </div>

                {/* Footer Links */}
                <div className="flex justify-center gap-6 pt-4">
                    <button onClick={() => window.history.back()} className="text-[10px] font-black uppercase tracking-widest text-stellar-teal hover:text-white transition-colors flex items-center gap-2">
                        <ChevronRight className="rotate-180 w-3 h-3" /> Return to Matrix
                    </button>
                </div>
            </div>
        </div>
    );
}

// Simple Chevron for the return button
function ChevronRight({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m9 18 6-6-6-6" /></svg>
    )
}
