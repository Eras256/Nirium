'use client';

import Navbar from "@/components/layout/Navbar";
import { useLanguage } from "@/context/LanguageContext";

export default function TermsPage() {
    const { t } = useLanguage();
    const terms = t.terms || { title: "Terms of Service", last_updated: "", sections: {} };

    return (
        <div className="min-h-screen pt-32 pb-12 px-4 md:px-8 relative bg-[#050505]">
            <Navbar />
            <div className="max-w-3xl mx-auto relative z-10 glass-panel p-8 md:p-12 rounded-2xl border border-white/10 text-gray-300 space-y-6">
                <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-8">{terms.title}</h1>
                <p className="font-mono text-xs uppercase text-stellar-teal">{terms.last_updated}</p>

                {Object.values(terms.sections).map((section: any, index: number) => (
                    <section key={index} className="space-y-4">
                        <h2 className="text-xl font-bold text-white uppercase tracking-tight">{section.title}</h2>
                        <p className="text-sm leading-relaxed whitespace-pre-line">
                            {section.content}
                        </p>
                    </section>
                ))}
            </div>
        </div>
    );
}
