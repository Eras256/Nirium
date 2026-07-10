"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useFreighter } from "@/hooks/useFreighter";
import {
    Menu, X, Zap, Shield, Activity,
    LogOut, CreditCard, Building2, Code2, ArrowUpRight
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../../context/LanguageContext";
import { Globe, Brain, Home } from "lucide-react";
import AISettingsModal from "./AISettingsModal";
import { aiService } from "@/lib/aiService";

export default function Navbar() {
    const pathname = usePathname();
    const { address, isConnected, connect, disconnect } = useFreighter();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);
    const [aiConfig, setAIConfig] = useState<any>({ provider: 'nirium', model: 'nirium-core-v1' });
    const { language, setLanguage, t } = useLanguage();

    useEffect(() => {
        setAIConfig(aiService.getConfig());
        const interval = setInterval(() => { setAIConfig(aiService.getConfig()); }, 2000);
        return () => clearInterval(interval);
    }, []);

    const handleScroll = useCallback(() => { setIsScrolled(window.scrollY > 20); }, []);
    useEffect(() => {
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [handleScroll]);

    // Marketing nav — 5 clean links (SCF-optimised)
    // Logo → / | "Launch app" → /dashboard
    const navLinks = [
        { name: t.nav.home,       href: "/"           },
        { name: t.nav.treasury,   href: "/treasury"   },
        { name: t.nav.security,   href: "/security"   },
        { name: t.nav.developers, href: "/developers" },
        { name: t.nav.pricing,    href: "/pricing"    },
    ];

    return (
        <nav className={`fixed left-0 right-0 z-[100] transition-all duration-500 ${isScrolled
            ? "top-9 py-2 bg-black/95 backdrop-blur-2xl border-b border-white/5"
            : "top-9 sm:top-[44px] px-0 sm:px-4 py-2 bg-transparent"
        }`}>
            <div className={`relative z-[60] max-w-[1600px] w-full mx-auto px-4 sm:px-6 flex items-center justify-between transition-all duration-500 ${
                !isScrolled ? "bg-black/50 sm:rounded-2xl border border-white/5 sm:border-white/10 backdrop-blur-md py-3 sm:py-4" : ""
            }`}>

                {/* ── Logo ── */}
                <Link href="/" className="flex items-center gap-2 group shrink-0">
                    <div className="relative">
                        <div className="absolute inset-0 bg-stellar-teal/10 blur-xl rounded-full group-hover:bg-stellar-teal/30 transition-all" />
                        <div className="relative bg-black/40 border border-white/5 rounded-lg p-1 transition-all group-hover:scale-105 overflow-hidden w-14 xs:w-20 sm:w-28 h-8 xs:h-10 sm:h-12 flex items-center justify-center">
                            <img src="/logos/logo.png" alt="Nirium" className="w-full h-full object-contain" />
                        </div>
                    </div>
                </Link>

                {/* ── Desktop nav — full labels (xl+) ── */}
                <div className="hidden xl:flex items-center gap-1 mx-4">
                    {navLinks.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold tracking-wide transition-all ${
                                    isActive
                                        ? "text-white bg-white/8 border border-white/10"
                                        : "text-white/50 hover:text-white hover:bg-white/5"
                                }`}
                            >
                                {link.name}
                            </Link>
                        );
                    })}
                </div>

                {/* ── Desktop nav — icons only (lg–xl) ── */}
                <div className="hidden lg:flex xl:hidden items-center gap-1 mx-2">
                    {[
                        { href: "/",           Icon: Home,       name: t.nav.home       },
                        { href: "/treasury",   Icon: Building2,  name: t.nav.treasury   },
                        { href: "/security",   Icon: Shield,     name: t.nav.security   },
                        { href: "/developers", Icon: Code2,      name: t.nav.developers },
                        { href: "/pricing",    Icon: CreditCard, name: t.nav.pricing    },
                    ].map(({ href, Icon, name }) => (
                        <Link
                            key={href}
                            href={href}
                            title={name}
                            className={`p-2 rounded-lg transition-all ${
                                pathname === href
                                    ? "text-white bg-white/8"
                                    : "text-white/40 hover:text-white hover:bg-white/5"
                            }`}
                        >
                            <Icon className="w-4 h-4" />
                        </Link>
                    ))}
                </div>

                {/* ── Right actions ── */}
                <div className="flex items-center gap-2 sm:gap-3">

                    {/* Language */}
                    <div className="flex items-center gap-1 bg-white/[0.03] border border-white/10 rounded-lg px-2 py-1.5 hover:bg-white/[0.06] transition-colors">
                        <Globe className="hidden xs:block w-3 h-3 text-white/30" />
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value as any)}
                            className="bg-transparent text-[9px] sm:text-[10px] text-white/50 font-bold focus:outline-none cursor-pointer uppercase tracking-tight"
                        >
                            <option value="en" className="bg-[#0A0A0A] text-white">EN</option>
                            <option value="es" className="bg-[#0A0A0A] text-white">ES</option>
                            <option value="zh" className="bg-[#0A0A0A] text-white">ZH</option>
                        </select>
                    </div>

                    {/* AI config — subtle dot indicator */}
                    <button
                        onClick={() => setIsAIModalOpen(true)}
                        className={`relative p-2 rounded-lg transition-all ${
                            aiConfig.provider === 'ollama'
                                ? 'bg-green-500/10 hover:bg-green-500/20 text-green-400'
                                : 'bg-white/[0.03] hover:bg-white/[0.06] text-white/30 hover:text-white/60'
                        }`}
                        title={t.ai_modal.title}
                    >
                        <Brain className="w-3.5 h-3.5" />
                        <motion.div
                            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className={`absolute top-1 right-1 w-1 h-1 rounded-full ${
                                aiConfig.provider === 'ollama' ? 'bg-green-400' : 'bg-white/30'
                            }`}
                        />
                    </button>

                    {/* Wallet */}
                    {isConnected ? (
                        <div className="hidden sm:flex h-8 items-center gap-1.5 pl-3 pr-1 bg-white/[0.03] border border-white/10 rounded-full">
                            <Activity className="w-2.5 h-2.5 text-stellar-teal animate-pulse" />
                            <span className="text-[10px] font-mono font-bold text-white/70">
                                {address?.slice(0, 4)}<span className="text-white/20">…</span>{address?.slice(-4)}
                            </span>
                            <button
                                onClick={() => disconnect()}
                                className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center hover:bg-red-500/20 text-white/30 hover:text-red-400 transition-all"
                                title={t.nav.disconnect}
                            >
                                <LogOut className="w-3 h-3" />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => connect()}
                            className="hidden sm:flex items-center gap-1.5 h-8 px-3 sm:px-4 bg-white/[0.03] text-white/60 border border-white/10 rounded-full text-[10px] font-bold hover:bg-white/[0.06] hover:text-white transition-all uppercase tracking-tight"
                        >
                            <Zap className="w-3 h-3" />
                            {t.nav.login_session}
                        </button>
                    )}

                    {/* ── Launch app — primary CTA ── */}
                    <Link
                        href="/dashboard"
                        className="hidden sm:flex items-center gap-1.5 h-8 sm:h-9 px-4 sm:px-5 bg-white text-black text-[10px] sm:text-[11px] font-bold rounded-full hover:bg-stellar-yellow transition-all uppercase tracking-tight shadow-[0_4px_16px_rgba(255,255,255,0.12)]"
                    >
                        {t.nav.launch_app}
                        <ArrowUpRight className="w-3 h-3" />
                    </Link>

                    {/* Mobile toggle */}
                    <button
                        className="lg:hidden p-1.5 text-white/40 hover:text-white transition-colors shrink-0 relative z-[200]"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>

            {/* ── Mobile menu ── */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.18 }}
                        className="fixed inset-x-0 top-0 mt-[60px] sm:mt-[72px] mx-3 sm:mx-5 rounded-2xl bg-black/98 backdrop-blur-3xl z-[150] lg:hidden p-5 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
                    >
                        <div className="flex flex-col gap-2">
                            {/* Close */}
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="self-end p-2 rounded-xl bg-white/5 text-white/40 hover:text-white transition-colors mb-1"
                            >
                                <X size={16} />
                            </button>

                            {/* Nav links */}
                            {navLinks.map((link) => {
                                const isActive = pathname === link.href;
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`flex items-center px-4 py-3.5 rounded-xl text-sm font-semibold border transition-all ${
                                            isActive
                                                ? "bg-white text-black border-white"
                                                : "bg-white/[0.03] text-white/60 border-white/5 hover:text-white hover:bg-white/[0.06]"
                                        }`}
                                    >
                                        {link.name}
                                    </Link>
                                );
                            })}

                            {/* Launch app — prominent in mobile */}
                            <Link
                                href="/dashboard"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="mt-2 flex items-center justify-center gap-2 px-4 py-4 rounded-xl bg-stellar-yellow text-black text-sm font-black uppercase tracking-tight"
                            >
                                {t.nav.launch_app}
                                <ArrowUpRight className="w-4 h-4" />
                            </Link>

                            {/* Wallet connect (mobile) */}
                            {isConnected ? (
                                <button
                                    onClick={() => { disconnect(); setIsMobileMenuOpen(false); }}
                                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 text-sm font-bold"
                                >
                                    <LogOut className="w-4 h-4" />
                                    {t.nav.disconnect_session}
                                </button>
                            ) : (
                                <button
                                    onClick={() => { connect(); setIsMobileMenuOpen(false); }}
                                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/[0.03] text-white/60 border border-white/10 text-sm font-bold hover:bg-white/[0.06]"
                                >
                                    <Zap className="w-4 h-4" />
                                    {t.nav.login_session}
                                </button>
                            )}

                            {/* Status strip */}
                            <div className="mt-3 pt-4 border-t border-white/5 flex items-center justify-between text-[9px] font-mono text-white/20 uppercase tracking-widest">
                                <span>{t.nav.uplink_ready.replace('{v}', 'v0.6.1')}</span>
                                <div className="flex items-center gap-1 text-stellar-teal/60">
                                    <Shield className="w-2.5 h-2.5" />
                                    {t.footer.scf_verified}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AISettingsModal isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} />
        </nav>
    );
}
