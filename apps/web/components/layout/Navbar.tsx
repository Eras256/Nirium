"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useFreighter } from "@/hooks/useFreighter";
import {
    LayoutDashboard, Compass, BarChart2, FileText,
    Menu, X, Zap, Bot, Package, Cpu, Shield, Activity,
    House, Wrench, LogOut, CreditCard, FlaskConical, Building2, Trophy,
    Rocket
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../../context/LanguageContext";
import { Globe, Brain } from "lucide-react";
import AISettingsModal from "./AISettingsModal";
import { aiService } from "@/lib/aiService";

export default function Navbar() {
    const pathname = usePathname();
    const { address, isConnected, connect, disconnect } = useFreighter();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);
    const [aiConfig, setAIConfig] = useState<any>({ provider: 'nirium', model: 'nirium-matrix-v1' });
    const { language, setLanguage, t } = useLanguage();

    useEffect(() => {
        // Load initial config on client mount
        setAIConfig(aiService.getConfig());

        const interval = setInterval(() => {
            setAIConfig(aiService.getConfig());
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const handleScroll = useCallback(() => {
        setIsScrolled(window.scrollY > 20);
    }, []);

    useEffect(() => {
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [handleScroll]);

    const navLinks = [
        { name: t.nav.home, href: "/", icon: House },
        { name: t.nav.dashboard, href: "/dashboard", icon: LayoutDashboard },
        { name: t.nav.build, href: "/build", icon: Rocket },
        { name: t.nav.strategies, href: "/marketplace", icon: Compass },
        { name: t.nav.treasury, href: "/treasury", icon: Building2 },
        { name: t.nav.sandbox, href: "/sandbox", icon: FlaskConical },
        { name: t.nav.ramp, href: "/ramp", icon: CreditCard },
        { name: t.nav.leaderboard, href: "/leaderboard", icon: Trophy },
        { name: t.nav.analytics, href: "/analytics", icon: BarChart2 },
        { name: t.nav.agents, href: "/agents", icon: Bot },
        { name: t.nav.docs, href: "/docs", icon: FileText },
    ];

    return (
        <nav className={`fixed left-0 right-0 z-[100] transition-all duration-500 ${isScrolled
            ? "top-9 py-2 bg-black/90 backdrop-blur-2xl border-b border-white/5"
            : "top-9 sm:top-12 px-0 sm:px-4 py-2 bg-transparent"
            }`}>
            <div className={`relative z-[60] max-w-[1600px] w-full mx-auto px-4 sm:px-6 flex items-center justify-between transition-all duration-500 ${!isScrolled ? "bg-black/40 sm:rounded-2xl border border-white/5 sm:border-white/10 backdrop-blur-md py-3 sm:py-4" : ""
                }`}>
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group shrink-0">
                    <div className="relative">
                        <div className="absolute inset-0 bg-stellar-teal/10 blur-xl rounded-full group-hover:bg-stellar-teal/30 transition-all"></div>
                        <div className="relative bg-black border border-white/5 rounded-xl group-hover:border-stellar-teal/30 transition-all transform group-hover:scale-105 overflow-hidden w-14 xs:w-20 sm:w-28 h-8 xs:h-10 sm:h-12 flex items-center justify-center p-1">
                            <img src="/brand/NiLo.png" alt="Nirium Logo" className="w-full h-full object-contain" />
                        </div>
                    </div>
                    <div className="hidden xs:flex px-1.5 py-0.5 border border-amber-500/30 bg-amber-500/10 text-amber-500 text-[8px] font-black rounded uppercase tracking-widest">
                        Testnet
                    </div>
                </Link>

                {/* Desktop Nav - Optimized for medium screens */}
                <div className="hidden xl:flex items-center gap-0.5 mx-2">
                    {navLinks.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1.5 group ${isActive
                                    ? "text-stellar-yellow bg-white/5 border border-white/10 shadow-[0_0_15px_rgba(255,200,0,0.1)]"
                                    : "text-gray-400 hover:text-stellar-yellow hover:bg-white/5"
                                    }`}
                            >
                                <Icon className={`w-3 h-3 transition-transform shrink-0 ${isActive ? "scale-110" : "group-hover:scale-110"}`} />
                                <span>{link.name}</span>
                            </Link>
                        );
                    })}
                </div>

                {/* Desktop Nav - Icons only for mid screens (lg) */}
                <div className="hidden lg:flex xl:hidden items-center gap-1 mx-2">
                    {navLinks.slice(0, 7).map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                title={link.name}
                                className={`p-2 rounded-lg transition-all ${isActive
                                    ? "text-stellar-yellow bg-white/5"
                                    : "text-gray-400 hover:text-stellar-yellow hover:bg-white/5"
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                            </Link>
                        );
                    })}
                </div>

                {/* Compliance Badge - Desktop */}
                <div className="hidden lg:flex items-center gap-4 px-4 border-l border-white/5 mr-4">
                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-stellar-teal/10 border border-stellar-teal/20 rounded-full text-[8px] font-black tracking-widest text-stellar-teal uppercase">
                            <Shield className="w-2 h-2" />
                            {t.footer.scf_verified}
                        </div>
                        <Link href="/docs?tab=security" className="text-[7px] font-mono text-gray-500 hover:text-stellar-yellow transition-colors mt-1 uppercase tracking-tighter">
                            {t.footer.coc_aligned}
                        </Link>
                    </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-1 sm:gap-4">
                    {/* Language Selector (Refined for Space) */}
                    <div className="flex items-center gap-1 bg-white/[0.03] border border-white/10 rounded-xl px-1.5 sm:px-2.5 py-1.5 sm:py-2 transition-colors hover:bg-white/[0.05]">
                        <Globe className="hidden xs:block w-3 sm:w-3.5 h-3 sm:h-3.5 text-zinc-500" />
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value as any)}
                            className="bg-transparent text-[9px] sm:text-[10px] text-zinc-300 font-bold focus:outline-none cursor-pointer uppercase tracking-tight"
                        >
                            <option value="en" className="bg-[#0A0A0A] text-white">EN</option>
                            <option value="es" className="bg-[#0A0A0A] text-white">ES</option>
                            <option value="zh" className="bg-[#0A0A0A] text-white">ZH</option>
                        </select>
                    </div>

                    {/* AI Configuration Button */}
                    <button
                        onClick={() => setIsAIModalOpen(true)}
                        className={`relative p-2 sm:p-2.5 rounded-xl transition-all duration-300 ${
                            aiConfig.provider === 'ollama'
                                ? 'bg-green-500/10 hover:bg-green-500/20 text-green-400'
                                : 'bg-stellar-blue/10 hover:bg-stellar-blue/20 text-stellar-blue'
                        }`}
                        title={t.ai_modal.title}
                    >
                        <Brain className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <motion.div 
                            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className={`absolute top-1 right-1 w-1 h-1 rounded-full ${
                                aiConfig.provider === 'ollama' ? 'bg-green-400' : 'bg-stellar-blue'
                            }`}
                        />
                    </button>

                    {/* Connected Wallet Status (Optimized) */}
                    {isConnected ? (
                        <div className="flex items-center gap-1.5">
                            <div className="h-7 sm:h-8 flex items-center gap-1.5 sm:gap-2 pl-2 sm:pl-3 pr-0.5 sm:pr-1 bg-white/[0.03] border border-white/10 rounded-full hover:bg-white/[0.05] transition-all group">
                                <Activity className="w-2.5 h-2.5 text-stellar-teal animate-pulse" />
                                <span className="text-[9px] sm:text-[11px] font-mono font-bold text-white/80">
                                    {address?.slice(0, 4)}<span className="text-zinc-600">.</span>{address?.slice(-4)}
                                </span>
                                <button
                                    onClick={() => disconnect()}
                                    className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/5 flex items-center justify-center hover:bg-red-500/20 text-zinc-500 hover:text-red-400 transition-all"
                                    title={t.nav.disconnect}
                                >
                                    <LogOut className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => connect()}
                            className="h-8 sm:h-9 px-3 sm:px-5 bg-white text-black text-[9px] sm:text-[11px] font-bold rounded-full hover:bg-stellar-yellow transition-all uppercase tracking-tight flex items-center gap-1.5 sm:gap-2 shadow-[0_4px_12px_rgba(255,255,255,0.1)]"
                        >
                            <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" />
                            {t.nav.login_matrix}
                        </button>
                    )}

                    {/* Mobile Toggle */}
                    <button
                        className="lg:hidden p-1.5 sm:p-2 text-gray-400 hover:text-stellar-yellow transition-colors shrink-0 relative z-[200]"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-x-0 top-0 mt-[60px] sm:mt-[78px] mx-4 sm:mx-6 rounded-2xl bg-black/95 backdrop-blur-3xl z-[150] lg:hidden p-4 sm:p-6 overflow-y-auto max-h-[calc(100vh-100px)] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                    >
                        <div className="flex flex-col gap-2.5 sm:gap-4 min-h-full pb-10">
                            {/* Close button inside menu for safety */}
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="self-end p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-stellar-yellow transition-colors mb-1"
                            >
                                <X size={18} />
                            </button>
                            {navLinks.map((link) => {
                                const Icon = link.icon;
                                const isActive = pathname === link.href;
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`flex items-center gap-4 p-3.5 sm:p-4 rounded-xl text-base sm:text-lg font-bold border transition-all ${isActive
                                            ? "bg-stellar-yellow text-black border-stellar-yellow shadow-[0_0_20px_rgba(255,200,0,0.2)]"
                                            : "bg-white/5 text-gray-400 border-white/5 hover:text-stellar-yellow"
                                            }`}
                                    >
                                        <Icon className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
                                        {link.name}
                                    </Link>
                                );
                            })}
                            {isConnected ? (
                                <button
                                    onClick={() => {
                                        disconnect();
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="mt-2 w-full bg-red-500/10 text-red-500 border border-red-500/20 p-4 rounded-xl font-black tracking-tighter hover:bg-red-500/20"
                                >
                                    {t.nav.disconnect_matrix}
                                </button>
                            ) : (
                                <button
                                    onClick={() => {
                                        connect();
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="mt-2 w-full bg-white text-black p-4 rounded-xl font-black tracking-tighter"
                                >
                                    {t.nav.login_matrix}
                                </button>
                            )}

                            <div className="mt-6 p-6 rounded-2xl bg-white/5 border border-white/10 text-center space-y-3">
                                <span className="text-[10px] uppercase font-mono text-gray-500 tracking-widest block mb-1">{t.nav.status}</span>
                                <div className="flex flex-col items-center gap-2">
                                    <span className="text-xs text-stellar-teal animate-pulse">{t.nav.uplink_ready.replace('{v}', 'v0.5.0')}</span>
                                    <div className="flex items-center gap-2 px-2 py-0.5 bg-stellar-teal/10 border border-stellar-teal/20 rounded-full text-[8px] font-black tracking-widest text-stellar-teal uppercase">
                                        <Shield className="w-2 h-2" />
                                        {t.footer.scf_verified}
                                    </div>
                                    <Link href="/docs?tab=security" className="text-[8px] font-mono text-gray-500 uppercase tracking-tighter">
                                        {t.footer.coc_aligned}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AISettingsModal
                isOpen={isAIModalOpen}
                onClose={() => setIsAIModalOpen(false)}
            />
        </nav>
    );
}
