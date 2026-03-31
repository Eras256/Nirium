"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useFreighter } from "@/hooks/useFreighter";
import {
    LayoutDashboard, Compass, BarChart2, FileText,
    Menu, X, Zap, Bot, Package, Cpu, Shield, Activity,
    House, Wrench, LogOut
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
        { name: t.nav.strategies, href: "/strategies", icon: Compass },
        { name: t.nav.builder, href: "/strategies/builder", icon: Wrench },
        { name: t.nav.marketplace, href: "/marketplace", icon: Package },
        { name: t.nav.leaderboard, href: "/leaderboard", icon: Activity },
        { name: t.nav.plugins, href: "/plugins", icon: Zap },
        { name: t.nav.agents, href: "/agents", icon: Bot },
        { name: t.nav.analytics, href: "/analytics", icon: BarChart2 },
        { name: t.nav.docs, href: "/docs", icon: FileText },
    ];

    return (
        <nav className={`fixed left-0 right-0 z-[100] transition-all duration-500 ${isScrolled
            ? "top-10 py-3 bg-black/80 backdrop-blur-xl border-b border-white/10"
            : "top-10 sm:top-14 px-0 sm:px-4 py-4 sm:py-2 bg-transparent"
            }`}>
            <div className={`max-w-[1600px] w-full mx-auto px-4 sm:px-6 flex items-center justify-between transition-all duration-500 ${!isScrolled ? "bg-black/40 sm:rounded-2xl border border-white/5 sm:border-white/10 backdrop-blur-md py-3 sm:py-4" : ""
                }`}>
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 group shrink-0">
                    <div className="relative">
                        <div className="absolute inset-0 bg-stellar-teal/10 blur-xl rounded-full group-hover:bg-stellar-teal/30 transition-all"></div>
                        <div className="relative bg-black border border-white/5 rounded-xl group-hover:border-stellar-teal/30 transition-all transform group-hover:scale-105 overflow-hidden w-20 sm:w-28 h-10 sm:h-12 flex items-center justify-center p-1">
                            <img src="/brand/NiLo.png" alt="Nirium Logo" className="w-full h-full object-contain" />
                        </div>
                    </div>
                </Link>

                {/* Desktop Nav - Optimized for medium screens */}
                <div className="hidden lg:flex items-center gap-0.5 xl:gap-1 mx-2">
                    {navLinks.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`px-2 xl:px-3 py-2 rounded-lg text-[10px] xl:text-xs font-bold transition-all flex items-center gap-1.5 group ${isActive
                                    ? "text-stellar-yellow bg-white/5 border border-white/10 shadow-[0_0_15px_rgba(255,200,0,0.1)]"
                                    : "text-gray-400 hover:text-stellar-yellow hover:bg-white/5"
                                    }`}
                            >
                                <Icon className={`w-3 h-3 xl:w-3.5 xl:h-3.5 transition-transform shrink-0 ${isActive ? "scale-110" : "group-hover:scale-110"}`} />
                                <span className="hidden xl:inline">{link.name}</span>
                                {isActive && <span className="xl:hidden">{link.name}</span>}
                            </Link>
                        );
                    })}
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 sm:gap-4">
                    <button
                        onClick={() => setIsAIModalOpen(true)}
                        className={`relative group p-2 rounded-lg border transition-all ${aiConfig.provider === 'ollama'
                            ? 'bg-green-500/10 border-green-500/20 hover:border-green-500/50'
                            : 'bg-stellar-blue/10 border-stellar-blue/20 hover:border-stellar-blue/50'
                            }`}
                    >
                        <div className={`absolute inset-0 blur-md rounded-full opacity-40 group-hover:opacity-70 transition-opacity ${aiConfig.provider === 'ollama' ? 'bg-green-500' : 'bg-stellar-blue'
                            }`}></div>
                        <Brain className={`w-4 h-4 relative z-10 ${aiConfig.provider === 'ollama' ? 'text-green-400' : 'text-stellar-blue'
                            }`} />
                    </button>

                    <div className="flex items-center gap-1 sm:gap-1.5 bg-white/5 border border-white/10 rounded-lg p-1 shrink-0">
                        <img src="/brand/logo.png" alt="Nirium Logo" title="Nirium Language Selector" className="w-4 h-4 object-contain ml-1 hidden sm:block p-0.5" />
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value as any)}
                            aria-label="Select Language"
                            title="Select Language"
                            className="bg-transparent text-[10px] sm:text-xs text-gray-300 font-bold focus:outline-none cursor-pointer p-0.5"
                        >
                            <option value="en" className="bg-black text-white">EN</option>
                            <option value="es" className="bg-black text-white">ES</option>
                            <option value="zh" className="bg-black text-white">ZH</option>
                        </select>
                    </div>

                    {isConnected ? (
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="hidden xs:flex flex-col items-end">
                                <span className="text-[8px] sm:text-[10px] text-gray-500 uppercase tracking-widest font-bold">{t.nav.stellar_connected}</span>
                                <span className="text-[10px] sm:text-xs font-mono text-stellar-teal">
                                    {address?.slice(0, 4)}...{address?.slice(-4)}
                                </span>
                            </div>
                            <button
                                onClick={() => disconnect()}
                                title={t.nav.disconnect}
                                className="w-8 h-8 rounded-lg bg-stellar-teal/10 border border-stellar-teal/30 flex items-center justify-center hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-400 text-stellar-teal transition-all group shrink-0"
                            >
                                <Shield className="w-4 h-4 group-hover:hidden" />
                                <LogOut className="w-4 h-4 hidden group-hover:block" />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => connect()}
                            className="bg-white text-black text-[10px] sm:text-xs font-black px-3 sm:px-6 py-2 sm:py-2.5 rounded-lg hover:bg-stellar-yellow hover:text-black hover:shadow-[0_0_20_px_rgba(255,200,0,0.4)] transition-all uppercase tracking-tighter"
                        >
                            {t.nav.auth_matrix.split(' ')[0]} <span className="hidden sm:inline">{t.nav.auth_matrix.split(' ')[1]}</span>
                        </button>
                    )}

                    {/* Mobile Toggle */}
                    <button
                        className="lg:hidden p-1.5 sm:p-2 text-gray-400 hover:text-stellar-yellow transition-colors shrink-0"
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
                        className="fixed inset-x-0 top-0 mt-[60px] sm:mt-[78px] mx-4 sm:mx-6 rounded-2xl bg-black/95 backdrop-blur-3xl z-50 lg:hidden p-4 sm:p-6 overflow-y-auto max-h-[calc(100vh-100px)] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                    >
                        <div className="flex flex-col gap-2.5 sm:gap-4 min-h-full pb-10">
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

                            <div className="mt-6 p-6 rounded-2xl bg-white/5 border border-white/10 text-center">
                                <span className="text-[10px] uppercase font-mono text-gray-500 tracking-widest block mb-1">{t.nav.status}</span>
                                <span className="text-xs text-stellar-teal animate-pulse">UPLINK_READY_v0.1.0</span>
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
