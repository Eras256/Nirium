"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useFreighter } from "@/hooks/useFreighter";
import { Home, LayoutDashboard, Compass, BarChart2, FileText, Menu, X, Rocket, Zap, Bot, Package, Cpu } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
    const pathname = usePathname();
    const { address: accountStr, isConnected, connect, disconnect } = useFreighter();
    const account = isConnected && accountStr ? { address: accountStr, chains: ['stellar:testnet'] } : null;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Handle scroll effect for navbar
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close mobile menu on route change or resize
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [pathname]);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setMobileMenuOpen(false);
            }
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [mobileMenuOpen]);

    const navLinks = [
        { name: "HOME", href: "/", icon: Home },
        { name: "DASHBOARD", href: "/dashboard", icon: LayoutDashboard },
        { name: "ANALYTICS", href: "/analytics", icon: BarChart2 },
        { name: "STRATEGIES", href: "/strategies", icon: Zap },
        { name: "MARKETPLACE", href: "/marketplace", icon: Package },
        { name: "PLUGINS", href: "/plugins", icon: Cpu },
        { name: "BUILDER", href: "/strategies/builder", icon: Compass },
        { name: "AGENTS", href: "/agents", icon: Bot },
        { name: "DOCS", href: "/docs", icon: FileText },
    ];

    const closeMobileMenu = useCallback(() => {
        setMobileMenuOpen(false);
    }, []);

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-50 px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-5 pointer-events-none">
                {/* Main navbar container */}
                <div
                    className={`
                        pointer-events-auto w-[98%] 2xl:w-[96%] mx-auto 
                        backdrop-blur-md border border-white/10 
                        rounded-2xl sm:rounded-full 
                        px-4 xl:px-8 py-2 xl:py-3
                        flex items-center justify-between 
                        shadow-[0_4px_30px_rgba(0,0,0,0.1)]
                        transition-all duration-300
                        ${scrolled ? "bg-black/60" : "bg-black/40"}
                    `}
                >
                    {/* Left side: Logo + Badge */}
                    <div className="flex items-center gap-4 xl:gap-8 min-w-0 shrink-0">
                        {/* Logo Section - Responsive */}
                        <Link href="/" className="flex items-center gap-2 group shrink-0">
                            <div className="relative flex items-center justify-center w-8 h-8 xl:w-10 xl:h-10 group-hover:scale-110 transition-transform">
                                <img src="/logo_transparent.png" alt="Nirium Logo" className="w-full h-full object-contain object-center scale-[1.3] drop-shadow-[0_0_10px_rgba(189,0,255,0.4)]" />
                            </div>
                            {/* Logo text - Optimized visibility */}
                            <div className="hidden min-[1150px]:flex flex-col">
                                <span className="font-bold text-white tracking-tighter leading-none text-xs xl:text-lg group-hover:text-neon-cyan transition-colors">
                                    XLMLOOP
                                </span>
                                <span className="hidden 2xl:block text-[9px] text-gray-500 font-mono tracking-widest leading-none">
                                    PROTOCOL
                                </span>
                            </div>
                        </Link>
                    </div>

                    {/* Center: Desktop Navigation - visible on laptop (lg) and up */}
                    <div className="hidden lg:flex items-center gap-1 xl:gap-3 flex-1 justify-center mx-2 xl:mx-6">
                        <div className="flex items-center gap-1 p-1 bg-white/[0.03] border border-white/5 rounded-full backdrop-blur-md">
                            {navLinks.map((link) => {
                                const isActive = pathname === link.href;
                                const Icon = link.icon;
                                return (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        className={`
                                            relative px-3 xl:px-4 py-2 rounded-full text-[10px] xl:text-xs font-bold 
                                            transition-colors duration-300 flex items-center gap-2 whitespace-nowrap group
                                            ${isActive ? "text-white" : "text-gray-400 hover:text-white"}
                                        `}
                                    >
                                        {/* Shared Layout Background Animation */}
                                        {isActive && (
                                            <motion.div
                                                layoutId="nav-active"
                                                className="absolute inset-0 bg-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)] rounded-full border border-white/10"
                                                transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                                            />
                                        )}

                                        <Icon className={`
                                            relative z-10 w-3.5 h-3.5 xl:w-4 xl:h-4 transition-transform group-hover:scale-110
                                            ${isActive ? "text-neon-cyan" : "text-gray-500"}
                                        `} />

                                        <span className={`
                                            relative z-10
                                            ${isActive ? "inline" : "hidden min-[1650px]:inline"}
                                        `}>
                                            {link.name}
                                        </span>

                                        {/* Hover Label Tooltip - below the pill */}
                                        {!isActive && (
                                            <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/80 backdrop-blur-md border border-white/10 rounded text-[8px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                                                {link.name}
                                            </span>
                                        )}

                                        {isActive && (
                                            <motion.span
                                                layoutId="nav-dot"
                                                className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-neon-cyan shadow-[0_0_10px_#00f3ff] rounded-full"
                                            />
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right Side: Status + Wallet + CTA + Mobile Toggle */}
                    <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 shrink-0">
                        {/* Agent Status Indicator - lg+ */}
                        {mounted && (
                            <div className={`hidden min-[1400px]:flex items-center gap-1 xl:gap-2 px-1.5 xl:px-3 py-1.5 rounded-full border transition-all ${account
                                ? 'bg-green-500/10 border-green-500/20'
                                : 'bg-white/5 border-white/10'
                                }`}>
                                <span className="relative flex h-1 w-1 xl:h-1.5 xl:w-1.5">
                                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${account ? 'bg-green-400' : 'bg-gray-400'}`}></span>
                                    <span className={`relative inline-flex rounded-full h-1 w-1 xl:h-1.5 xl:w-1.5 ${account ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                                </span>
                                <span className={`text-[8px] xl:text-[10px] font-mono font-bold whitespace-nowrap ${account ? 'text-green-400' : 'text-gray-500'}`}>
                                    {account ? 'XLM TESTNET' : 'OFFLINE'}
                                </span>
                            </div>
                        )}

                        {/* Connect Button - Responsive scaling */}
                        <div className="navbar-connect-btn scale-[0.85] xl:scale-100 origin-right">
                            <button onClick={isConnected ? disconnect : connect} className="bg-neon-cyan text-black font-bold px-4 xl:px-5 py-2 rounded-full text-[11px] xl:text-xs hover:shadow-[0_0_20px_rgba(0,243,255,0.4)] transition-all whitespace-nowrap">
                                {isConnected && accountStr ? `${accountStr.slice(0, 4)}...${accountStr.slice(-4)}` : 'Connect Wallet'}
                            </button>
                        </div>

                        {/* CTA Button - Hidden on mobile/tablet, shown on lg+ as icon, full on xl */}
                        <Link
                            href="/strategies"
                            className="hidden min-[1300px]:flex items-center gap-1 bg-neon-cyan text-black px-2 xl:px-3 py-2 rounded-full font-mono text-[9px] xl:text-[10px] font-bold hover:bg-white transition-all shadow-[0_0_15px_rgba(0,243,255,0.4)] hover:shadow-[0_0_25px_rgba(255,255,255,0.6)] whitespace-nowrap"
                        >
                            <Rocket className="w-3 h-3 xl:w-3.5 xl:h-3.5" />
                            <span className="hidden min-[1550px]:inline">STRATEGIES</span>
                        </Link>

                        {/* Mobile Menu Toggle - Visible on lg and below */}
                        <button
                            className="lg:hidden shrink-0 min-w-[36px] min-h-[36px] sm:min-w-[44px] sm:min-h-[44px] w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 active:bg-neon-cyan/10 transition-colors ml-1 group"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                            aria-expanded={mobileMenuOpen}
                        >
                            <motion.div
                                animate={{ rotate: mobileMenuOpen ? 90 : 0 }}
                                transition={{ duration: 0.2 }}
                                className="text-gray-400 group-hover:text-white"
                            >
                                {mobileMenuOpen ? <X size={20} className="sm:w-6 sm:h-6" /> : <Menu size={20} className="sm:w-6 sm:h-6" />}
                            </motion.div>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Overlay & Dropdown */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 xl:hidden"
                            onClick={closeMobileMenu}
                            aria-hidden="true"
                        />

                        {/* Menu Panel */}
                        <motion.div
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                            className="fixed top-[72px] sm:top-[80px] left-3 right-3 sm:left-4 sm:right-4 z-50 p-2 sm:p-4 rounded-2xl glass-panel lg:hidden overflow-hidden max-h-[85vh] overflow-y-auto custom-scrollbar"
                        >

                            {/* Mobile Status Badge */}
                            {mounted && (
                                <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 border border-white/5">
                                        <span className="relative flex h-2 w-2">
                                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${account ? 'bg-green-400' : 'bg-gray-400'}`}></span>
                                            <span className={`relative inline-flex rounded-full h-2 w-2 ${account ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                                        </span>
                                        <span className="text-[10px] text-gray-400 font-mono">
                                            {account ? `${account.address.slice(0, 6)}...${account.address.slice(-4)}` : 'WALLET NOT CONNECTED'}
                                        </span>
                                    </div>
                                    {account && (
                                        <div className="flex items-center gap-1">
                                            <span className="text-[9px] bg-blue-500/20 text-[#4ca2ff] px-1.5 py-0.5 rounded font-mono font-bold">XLM</span>
                                            <span className="text-[9px] bg-neon-purple/20 text-neon-purple px-1.5 py-0.5 rounded font-mono font-bold">USDC</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Navigation Links */}
                            <div className="space-y-1">
                                {navLinks.map((link, index) => {
                                    const isActive = pathname === link.href;
                                    const Icon = link.icon;

                                    return (
                                        <motion.div
                                            key={link.name}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <Link
                                                href={link.href}
                                                onClick={closeMobileMenu}
                                                className={`
                                                    min-h-[48px] p-3 sm:p-4 rounded-xl flex items-center gap-3 sm:gap-4 
                                                    transition-all duration-200 active:scale-[0.98]
                                                    ${isActive
                                                        ? "bg-white/10 text-white border border-neon-cyan/30"
                                                        : "hover:bg-white/5 text-gray-300 hover:text-white"
                                                    }
                                                `}
                                            >
                                                <div className={`
                                                    w-10 h-10 rounded-lg flex items-center justify-center
                                                    ${isActive ? "bg-neon-cyan/20" : "bg-white/5"}
                                                `}>
                                                    <Icon
                                                        size={20}
                                                        className={isActive ? "text-neon-cyan" : "text-gray-400"}
                                                    />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-sm sm:text-base">{link.name}</span>
                                                    {isActive && (
                                                        <span className="text-[10px] text-neon-cyan font-mono">CURRENT PAGE</span>
                                                    )}
                                                </div>
                                            </Link>
                                        </motion.div>
                                    );
                                })}
                            </div>

                            {/* Divider */}
                            <div className="h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent my-4"></div>

                            {/* CTA Button */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <Link
                                    href="/strategies"
                                    onClick={closeMobileMenu}
                                    className="min-h-[52px] p-4 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-purple text-black font-bold border border-white/20 flex items-center justify-center gap-3 hover:opacity-90 transition-all active:scale-[0.98] shadow-[0_0_20px_rgba(0,243,255,0.3)]"
                                >
                                    <Zap size={20} className="text-black" />
                                    <span className="text-sm sm:text-base">INITIALIZE VECTOR</span>
                                    <Rocket size={18} className="text-black" />
                                </Link>
                            </motion.div>

                            {/* Builder secondary CTA */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.35 }}
                                className="mt-2"
                            >
                                <Link
                                    href="/strategies/builder"
                                    onClick={closeMobileMenu}
                                    className="min-h-[48px] p-4 rounded-xl bg-white/5 border border-neon-purple/30 text-neon-purple font-bold flex items-center justify-center gap-3 hover:bg-neon-purple/10 transition-all active:scale-[0.98]"
                                >
                                    <Cpu size={18} />
                                    <span className="text-sm sm:text-base">STRATEGY BUILDER</span>
                                </Link>
                            </motion.div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence >
        </>
    );
}
