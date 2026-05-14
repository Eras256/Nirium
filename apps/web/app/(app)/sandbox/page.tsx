'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
    Key, Shield, Zap, Send, Building2, Mail, Wallet,
    Copy, CheckCircle2, Server, Activity, Lock, Terminal, ChevronRight
} from 'lucide-react';
import { useFreighter } from '@/hooks/useFreighter';
import { useLanguage } from '@/context/LanguageContext';

export default function SandboxPage() {
    const { t } = useLanguage();
    const { address, isConnected } = useFreighter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [copied, setCopied] = useState(false);
    const [mounted, setMounted] = useState(false);

    const [formData, setFormData] = useState({
        companyName: '',
        contactEmail: '',
        walletAddress: '',
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    // Auto-fill wallet address if connected
    useEffect(() => {
        if (isConnected && address && !formData.walletAddress) {
            setFormData(prev => ({ ...prev, walletAddress: address }));
        }
    }, [isConnected, address, formData.walletAddress]);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success(t.sandbox.result.copy_success);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.companyName || !formData.contactEmail || !formData.walletAddress) {
            toast.error(t.legal_modal.consent_required);
            return;
        }

        setIsSubmitting(true);
        const loadingToast = toast.loading(t.sandbox.form.button_loading);

        try {
            const res = await fetch('/api/sandbox/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    companyName: formData.companyName,
                    contactEmail: formData.contactEmail,
                    walletAddress: formData.walletAddress,
                    tier: 'sandbox',
                }),
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data.message || data.error || 'Request failed');
            }

            setResult(data);
            toast.dismiss(loadingToast);
            toast.success(t.sandbox.result.success_toast);

        } catch (error: any) {
            toast.dismiss(loadingToast);
            toast.error(error.message || t.toasts.broadcast_failed);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!mounted) return null;

    return (
        <main className="min-h-screen pt-8 sm:pt-8 md:pt-8 lg:pt-8 pb-20 relative bg-[#080808]">
<div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-stellar-teal/5 to-transparent pointer-events-none" />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-stellar-teal/10 border border-stellar-teal/20 text-stellar-teal text-xs font-black uppercase tracking-widest mb-8">
                            <Shield className="w-3.5 h-3.5" />
                            <span>{t.sandbox.header.badge}</span>
                        </div>
                        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black mb-6 md:mb-8 tracking-tighter uppercase italic leading-[0.85]">
                            {t.sandbox.header.title_pre} <span className="text-stellar-teal">{t.sandbox.header.title_span}</span>
                        </h1>
                        <p className="text-base sm:text-lg text-gray-500 leading-relaxed font-medium">
                            {t.sandbox.header.subtitle}
                        </p>
                    </motion.div>
                </div>

                <div className="grid lg:grid-cols-2 gap-16 items-start">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="space-y-10"
                    >
                        <div className="bg-[#121212] border border-white/5 rounded-[1.5rem] sm:rounded-[2.5rem] p-6 sm:p-10 hover:border-stellar-teal/20 transition-all duration-500 shadow-2xl group overflow-hidden relative">
                            <div className="absolute -top-24 -right-24 w-48 h-48 bg-stellar-teal opacity-5 rounded-full blur-[80px] group-hover:opacity-10 transition-opacity" />
                            
                            <div className="flex items-center gap-6 mb-10">
                                <div className="w-16 h-16 rounded-2xl bg-stellar-teal/10 border border-stellar-teal/20 flex items-center justify-center text-stellar-teal shadow-inner">
                                    <Server className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black uppercase tracking-tight italic">{t.sandbox.features.title}</h3>
                                    <p className="text-gray-500 font-mono text-sm uppercase tracking-widest">{t.sandbox.features.subtitle}</p>
                                </div>
                            </div>

                            <ul className="space-y-6 mb-10">
                                {t.sandbox.features.items.map((item: any, idx: number) => (
                                    <li key={idx} className="flex items-start gap-4">
                                        <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                        </div>
                                        <div>
                                            <div className="text-white font-black uppercase text-sm tracking-tight">{item.title}</div>
                                            <div className="text-gray-500 text-xs uppercase font-mono mt-0.5">{item.desc}</div>
                                        </div>
                                    </li>
                                ))}
                            </ul>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="bg-black/40 border border-white/5 rounded-2xl p-5 group-hover:border-stellar-teal/10 transition-colors">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Activity className="w-4 h-4 text-purple-400" />
                                        <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t.sandbox.features.speed_limit}</div>
                                    </div>
                                    <div className="font-mono text-xl font-black text-white italic tracking-tighter">300 / MIN</div>
                                </div>
                                <div className="bg-black/40 border border-white/5 rounded-2xl p-5 group-hover:border-stellar-teal/10 transition-colors">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Zap className="w-4 h-4 text-amber-400" />
                                        <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t.sandbox.features.support}</div>
                                    </div>
                                    <div className="font-mono text-xl font-black text-white italic tracking-tighter uppercase">{t.sandbox.features.priority}</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#121212]/50 border border-white/5 rounded-[2rem] p-8">
                            <h4 className="font-black text-sm uppercase tracking-[0.2em] mb-4 flex items-center gap-3 text-gray-400">
                                <Lock className="w-4 h-4" />
                                {t.sandbox.safety.title}
                            </h4>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                {t.sandbox.safety.desc}
                            </p>
                        </div>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <AnimatePresence mode="wait">
                            {!result ? (
                                <motion.div 
                                    key="form"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="bg-[#121212] p-6 sm:p-10 rounded-[1.5rem] sm:rounded-[2.5rem] border border-white/5 relative overflow-hidden shadow-2xl"
                                >
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-stellar-teal opacity-5 rounded-full blur-[100px] pointer-events-none" />
                                    
                                    <h3 className="text-3xl font-black mb-2 uppercase tracking-tighter italic">{t.sandbox.form.title}</h3>
                                    <p className="text-gray-500 text-sm mb-10 pb-10 border-b border-white/5 uppercase tracking-widest font-mono">
                                        {t.sandbox.form.subtitle}
                                    </p>

                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="space-y-2.5">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">{t.sandbox.form.company}</label>                                            
                                            <div className="relative group">
                                                <div className="absolute inset-0 bg-stellar-teal/5 blur-md rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
                                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-stellar-teal transition-colors pointer-events-none z-20" />
                                                <input 
                                                    type="text"
                                                    required
                                                    value={formData.companyName}
                                                    onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                                                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-stellar-teal/30 transition-all font-medium placeholder:text-gray-800 relative z-10"
                                                    placeholder={t.sandbox.form.company_placeholder}
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-2.5">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">{t.sandbox.form.email}</label>
                                            <div className="relative group">
                                                <div className="absolute inset-0 bg-stellar-teal/5 blur-md rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-stellar-teal transition-colors pointer-events-none z-20" />
                                                <input 
                                                    type="email"
                                                    required
                                                    value={formData.contactEmail}
                                                    onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
                                                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-stellar-teal/30 transition-all font-medium placeholder:text-gray-800 relative z-10"
                                                    placeholder={t.sandbox.form.email_placeholder}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2.5">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1 flex justify-between">
                                                <span>{t.sandbox.form.wallet}</span>
                                                {isConnected && <span className="text-stellar-teal lowercase tracking-tighter">{t.sandbox.form.auto_filled}</span>}
                                            </label>
                                            <div className="relative group">
                                                <div className="absolute inset-0 bg-stellar-teal/5 blur-md rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
                                                <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-stellar-teal transition-colors pointer-events-none z-20" />
                                                <input 
                                                    type="text"
                                                    required
                                                    value={formData.walletAddress}
                                                    onChange={(e) => setFormData({...formData, walletAddress: e.target.value})}
                                                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-stellar-teal/30 transition-all font-mono text-sm placeholder:text-gray-800 relative z-10"
                                                    placeholder="G..."
                                                />
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full py-5 mt-4 bg-white text-black font-black uppercase tracking-[0.2em] rounded-[1.5rem] hover:bg-stellar-teal transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl active:scale-95 group"
                                        >
                                            {isSubmitting ? t.sandbox.form.button_loading : t.sandbox.form.button}
                                            {!isSubmitting && <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                                        </button>

                                        <div className="mt-4 pt-8 border-t border-white/5 flex items-center justify-center gap-2 text-[9px] text-gray-600 uppercase tracking-widest font-mono italic">
                                            <Shield size={10} className="text-stellar-teal" />
                                            <span>Aligned with Stellar Code of Conduct (April 2026)</span>
                                        </div>
                                    </form>
                                </motion.div>
                            ) : (
                                <motion.div 
                                    key="result"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-[#121212] p-6 sm:p-10 rounded-[1.5rem] sm:rounded-[2.5rem] border border-emerald-500/20 bg-emerald-500/5 relative overflow-hidden shadow-2xl"
                                >
                                    <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500 opacity-5 rounded-full blur-[80px]" />
                                    
                                    <div className="flex items-center gap-5 mb-10">
                                        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-inner">
                                            <Key className="w-8 h-8" />
                                        </div>
                                        <h3 className="text-3xl font-black uppercase tracking-tighter italic">{t.sandbox.result.title}</h3>
                                    </div>

                                    <p className="text-amber-500 text-[10px] font-black uppercase tracking-widest mb-6 py-2 px-4 bg-amber-500/10 border border-amber-500/20 rounded-full inline-flex items-center gap-2">
                                        {t.sandbox.result.warning}
                                    </p>

                                    <div className="bg-black/60 border border-white/10 rounded-2xl p-4 sm:p-6 mb-8 relative group overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
                                        <code className="text-emerald-500 font-mono whitespace-pre-wrap break-all text-xs sm:text-sm block pr-10 sm:pr-12">
                                            {result.account?.apiKey}
                                        </code>
                                        <button 
                                            onClick={() => copyToClipboard(result.account.apiKey)}
                                            className="absolute top-1/2 -translate-y-1/2 right-2 sm:right-4 p-2 sm:p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 text-white transition-all active:scale-90"
                                        >
                                            {copied ? <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" /> : <Copy className="w-4 h-4 sm:w-5 sm:h-5" />}
                                        </button>
                                    </div>

                                    <div className="space-y-4 mb-10">
                                        {[
                                            { label: t.sandbox.result.environment, value: 'Testnet', color: 'text-white' },
                                            { label: t.sandbox.result.tier, value: result.account?.tier ?? 'sandbox', color: 'text-stellar-teal' },
                                            { label: t.sandbox.result.valid_until, value: result.account?.expiresAt ? new Date(result.account.expiresAt).toLocaleDateString() : '90 days', color: 'text-white' }
                                        ].map((row, i) => (
                                            <div key={i} className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] py-3 border-b border-white/5">
                                                <span className="text-gray-600">{row.label}</span>
                                                <span className={`${row.color} font-mono italic`}>{row.value}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="bg-black/40 border border-white/5 rounded-2xl p-6 mb-8 relative group">
                                        <h4 className="flex items-center gap-3 text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 font-mono">
                                            <Terminal className="w-4 h-4" />
                                            {t.sandbox.result.try_it}
                                        </h4>
                                        <div className="relative">
                                            <pre className="text-xs text-gray-400 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">
                                                curl -H "x-api-key: {result.account?.apiKey?.slice(0, 12)}..." https://nirium-agent.fly.dev/sandbox/status
                                            </pre>
                                        </div>
                                    </div>

                                    <a
                                        href="/docs"
                                        className="inline-flex w-full items-center justify-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-white bg-white/5 hover:bg-white/10 border border-white/10 py-5 rounded-[1.5rem] transition-all group"
                                    >
                                        {t.sandbox.result.open_docs}
                                        <ChevronRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                                    </a>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </div>
        </main>
    );
}
