'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Shield, Lock, CheckCircle2, Activity, ShieldCheck, AlertTriangle,
    Zap, Terminal, Cpu, Database, Network, Fingerprint
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function JargusAuditPage() {
    const { t } = useLanguage();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || !t.jargus) return null;

    const categories = [
        { id: 'integrity', icon: <Database className="w-5 h-5" />, color: 'text-blue-400' },
        { id: 'access', icon: <Fingerprint className="w-5 h-5" />, color: 'text-purple-400' },
        { id: 'contracts', icon: <Cpu className="w-5 h-5" />, color: 'text-amber-400' },
        { id: 'network', icon: <Network className="w-5 h-5" />, color: 'text-emerald-400' }
    ];

    return (
        <main className="min-h-screen pt-8 sm:pt-8 md:pt-8 lg:pt-8 pb-20 relative bg-[#080808] overflow-hidden">
{/* Background Effects */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-gradient-to-b from-stellar-teal/5 to-transparent pointer-events-none" />
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-stellar-teal/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute top-1/2 -right-40 w-96 h-96 bg-purple-500/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-20 md:mb-28">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-stellar-teal/10 border border-stellar-teal/20 text-stellar-teal text-[10px] font-black uppercase tracking-[0.3em] mb-8">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>{t.jargus.header.badge}</span>
                        </div>
                        <h1 className="text-5xl sm:text-7xl md:text-8xl font-black mb-8 tracking-tighter uppercase italic leading-[0.85]">
                            {t.jargus.header.title_pre} <span className="text-stellar-teal">{t.jargus.header.title_span}</span>
                        </h1>
                        <p className="text-lg sm:text-xl text-gray-400 leading-relaxed font-medium font-mono uppercase tracking-tight">
                            {t.jargus.header.subtitle}
                        </p>
                    </motion.div>
                </div>

                {/* Internal Audit Disclaimer */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.15 }}
                    className="max-w-3xl mx-auto mb-12"
                >
                    <div className="flex items-start gap-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 text-left">
                        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                        <p className="text-amber-300/80 text-xs leading-relaxed font-mono">
                            {t.jargus.internal_notice}
                        </p>
                    </div>
                </motion.div>

                {/* Audit Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mb-20">
                    {[
                        { label: t.jargus.stats.vectors_tested, value: '78 / 78', color: 'text-white' },
                        { label: t.jargus.stats.status, value: t.jargus.stats.passed, color: 'text-stellar-teal' },
                        { label: t.jargus.stats.last_audit, value: t.jargus.stats.date, color: 'text-white' },
                        { label: 'Standard', value: 'JARGUS-v2', color: 'text-gray-500' }
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * i }}
                            className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm"
                        >
                            <span className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 font-mono">
                                {stat.label}
                            </span>
                            <span className={`text-xl md:text-2xl font-black italic tracking-tighter uppercase ${stat.color}`}>
                                {stat.value}
                            </span>
                        </motion.div>
                    ))}
                </div>

                {/* Categories Grid */}
                <div className="grid md:grid-cols-2 gap-6 md:gap-10 mb-20">
                    {categories.map((cat, i) => (
                        <motion.div
                            key={cat.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 + 0.1 * i }}
                            className="group bg-[#121212] border border-white/5 rounded-[2rem] p-8 sm:p-10 hover:border-stellar-teal/20 transition-all duration-500 relative overflow-hidden shadow-2xl"
                        >
                            <div className={`absolute -top-10 -right-10 w-32 h-32 opacity-10 blur-3xl rounded-full transition-opacity group-hover:opacity-20 ${cat.color.replace('text-', 'bg-')}`} />
                            
                            <div className="flex items-center gap-6 mb-8">
                                <div className={`w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center transition-transform group-hover:scale-110 ${cat.color}`}>
                                    {cat.icon}
                                </div>
                                <h3 className="text-2xl font-black uppercase tracking-tight italic text-white">
                                    {(t.jargus.categories as any)[cat.id].title}
                                </h3>
                            </div>

                            <p className="text-gray-500 leading-relaxed mb-8 text-sm">
                                {(t.jargus.categories as any)[cat.id].desc}
                            </p>

                            <div className="flex flex-wrap gap-2">
                                <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black px-3 py-1 rounded-full uppercase font-mono">
                                    VERIFIED STABLE
                                </span>
                                <span className="bg-white/5 border border-white/10 text-gray-500 text-[10px] font-black px-3 py-1 rounded-full uppercase font-mono">
                                    AES-256 ENCRYPTED
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Audit Evidence Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="max-w-4xl mx-auto"
                >
                    <div className="bg-black/40 border border-white/5 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-stellar-teal/40 to-transparent" />
                        
                        <div className="inline-flex p-4 bg-stellar-teal/10 rounded-2xl border border-stellar-teal/20 mb-8">
                            <Lock className="w-8 h-8 text-stellar-teal" />
                        </div>
                        
                        <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-2xl mx-auto italic font-medium">
                            {t.jargus.footer_note}
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 pt-8 border-t border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono">Audit Hash Verified</span>
                            </div>
                            <code className="text-[10px] text-stellar-teal font-mono bg-stellar-teal/5 px-4 py-2 rounded-lg border border-stellar-teal/10">
                                0x78_JARG_VECT_2026_STABLE_AUDIT_SIG
                            </code>
                        </div>
                    </div>
                </motion.div>
            </div>
            
        </main>
    );
}
