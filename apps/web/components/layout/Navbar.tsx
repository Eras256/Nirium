"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useFreighter } from "@/hooks/useFreighter";
import {
    LayoutDashboard, Compass, BarChart2, FileText,
    Menu, X, Zap, Bot, Package, Cpu, Shield, Activity,
    House, Wrench
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
    const pathname = usePathname();
    const { address, isConnected, connect } = useFreighter();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleScroll = useCallback(() => {
        setIsScrolled(window.scrollY > 20);
    }, []);

    useEffect(() => {
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [handleScroll]);

    const navLinks = [
        { name: "Home", href: "/", icon: House },
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Strategies", href: "/strategies", icon: Compass },
        { name: "Builder", href: "/strategies/builder", icon: Wrench },
        { name: "Marketplace", href: "/marketplace", icon: Package },
        { name: "Plugins", href: "/plugins", icon: Zap },
        { name: "Agents", href: "/agents", icon: Bot },
        { name: "Analytics", href: "/analytics", icon: BarChart2 },
        { name: "Docs", href: "/docs", icon: FileText },
    ];

    return (
        <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${isScrolled ? "py-4 bg-black/60 backdrop-blur-xl border-b border-white/10" : "py-6 bg-transparent"
            }`}>
            <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="relative">
                        <div className="absolute inset-0 bg-stellar-teal/20 blur-lg rounded-full group-hover:bg-stellar-teal/40 transition-all"></div>
                        <div className="relative bg-black border border-white/20 p-2 rounded-lg group-hover:border-stellar-teal/50 transition-all transform group-hover:rotate-12">
                            <Cpu className="w-6 h-6 text-stellar-teal" />
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-black tracking-tighter text-white leading-none">
                            NIRIUM
                        </span>
                        <span className="text-[10px] font-mono text-gray-500 tracking-[0.2em] uppercase">
                            Stellar Matrix
                        </span>
                    </div>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden xl:flex items-center gap-1 mx-4">
                    {navLinks.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`px-2 xl:px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 group ${isActive
                                    ? "text-stellar-yellow bg-white/5 border border-white/10"
                                    : "text-gray-400 hover:text-stellar-yellow hover:bg-white/5"
                                    }`}
                            >
                                <Icon className={`w-3.5 h-3.5 transition-transform ${isActive ? "scale-110" : "group-hover:scale-110"}`} />
                                {link.name}
                            </Link>
                        );
                    })}
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-4">
                    {isConnected ? (
                        <div className="hidden sm:flex items-center gap-3">
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Stellar Connected</span>
                                <span className="text-xs font-mono text-stellar-teal">
                                    {address?.slice(0, 4)}...{address?.slice(-4)}
                                </span>
                            </div>
                            <div className="w-8 h-8 rounded-lg bg-stellar-teal/10 border border-stellar-teal/30 flex items-center justify-center">
                                <Shield className="w-4 h-4 text-stellar-teal" />
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => connect()}
                            className="bg-white text-black text-xs font-black px-6 py-2.5 rounded-lg hover:bg-stellar-yellow hover:text-black hover:shadow-[0_0_20px_rgba(255,200,0,0.4)] transition-all uppercase tracking-tighter"
                        >
                            Auth Matrix
                        </button>
                    )}

                    {/* Mobile Toggle */}
                    <button
                        className="xl:hidden p-2 text-gray-400 hover:text-stellar-yellow transition-colors"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 100 }}
                        className="fixed inset-0 top-[78px] bg-black/98 backdrop-blur-3xl z-50 xl:hidden p-4 sm:p-6 overflow-y-auto pb-32"
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
                                        <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                                        {link.name}
                                    </Link>
                                );
                            })}
                            {!isConnected && (
                                <button
                                    onClick={() => {
                                        connect();
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="mt-2 w-full bg-white text-black p-4 rounded-xl font-black tracking-tighter"
                                >
                                    Login to Matrix
                                </button>
                            )}

                            <div className="mt-6 p-6 rounded-2xl bg-white/5 border border-white/10 text-center">
                                <span className="text-[10px] uppercase font-mono text-gray-500 tracking-widest block mb-1">Status</span>
                                <span className="text-xs text-stellar-teal animate-pulse">UPLINK_READY_v0.1.0</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
