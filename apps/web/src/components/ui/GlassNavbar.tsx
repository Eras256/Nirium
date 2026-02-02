'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFreighter } from '@/hooks/useFreighter';

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '◈' },
    { href: '/markets', label: 'Markets', icon: '◊' },
    { href: '/governance', label: 'Governance', icon: '⬡' },
    { href: '/lab', label: 'Neural Lab', icon: '⌬' },
];

interface GlassNavbarProps {
    className?: string;
}

export function GlassNavbar({ className = '' }: GlassNavbarProps) {
    const pathname = usePathname();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { connect, disconnect, isConnected, address, balance } = useFreighter();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            <motion.nav
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className={`
          fixed top-6 left-1/2 -translate-x-1/2 z-50
          w-[95%] max-w-4xl
          px-3 py-2.5 rounded-2xl
          backdrop-blur-xl
          border border-white/10
          shadow-[0_8px_32px_rgba(212,175,55,0.1),inset_0_1px_0_rgba(255,255,255,0.1)]
          transition-all duration-500
          ${scrolled ? 'bg-black/40 border-white/20' : 'bg-black/20'}
          ${className}
        `}
                style={{
                    background: scrolled
                        ? 'linear-gradient(135deg, rgba(15,10,30,0.9) 0%, rgba(5,5,20,0.95) 100%)'
                        : 'linear-gradient(135deg, rgba(15,10,30,0.6) 0%, rgba(5,5,20,0.7) 100%)',
                }}
            >
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 px-2">
                        <div className="relative w-8 h-8 flex-shrink-0">
                            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#8C7018] animate-pulse" />
                            <div className="absolute inset-[2px] rounded-lg bg-black/90 flex items-center justify-center">
                                <span className="text-[#D4AF37] font-bold text-sm">N</span>
                            </div>
                        </div>
                        <span className="hidden sm:block font-semibold text-white/90 tracking-wide">
                            Nirium
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`
                    relative px-4 py-2 rounded-xl text-sm font-medium
                    transition-all duration-300 ease-out
                    group overflow-hidden
                    ${isActive
                                            ? 'text-[#D4AF37]'
                                            : 'text-white/60 hover:text-white/90'
                                        }
                  `}
                                >
                                    {/* Hover/Active background */}
                                    <motion.div
                                        className={`
                      absolute inset-0 rounded-xl
                      ${isActive
                                                ? 'bg-gradient-to-r from-[#D4AF37]/20 to-[#8C7018]/20'
                                                : 'bg-white/0 group-hover:bg-white/5'
                                            }
                    `}
                                        layoutId="navbar-indicator"
                                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                    />

                                    {/* Glow effect for active item */}
                                    {isActive && (
                                        <motion.div
                                            className="absolute -inset-[1px] rounded-xl opacity-50"
                                            style={{
                                                background: 'linear-gradient(135deg, rgba(212,175,55,0.2), rgba(160,120,40,0.2))',
                                                filter: 'blur(8px)',
                                            }}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 0.5 }}
                                            transition={{ duration: 0.3 }}
                                        />
                                    )}

                                    <span className="relative flex items-center gap-2">
                                        <span className="text-lg opacity-60 group-hover:opacity-100 transition-opacity">
                                            {item.icon}
                                        </span>
                                        {item.label}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Connect Wallet Button */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={isConnected ? disconnect : connect}
                            className="
                  hidden md:flex px-4 py-2 rounded-xl
                  bg-gradient-to-r from-[#D4AF37]/80 to-[#A08020]/80
                  text-white font-medium text-sm
                  shadow-[0_4px_20px_rgba(212,175,55,0.2)]
                  hover:shadow-[0_4px_30px_rgba(212,175,55,0.4)]
                  transition-all duration-300
                  border border-[#D4AF37]/30
                "
                        >
                            <span className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-white/50'} animate-pulse`} />
                                {isConnected ? (
                                    <div className="flex items-center gap-2 font-mono">
                                        {balance && (
                                            <span className="text-[#D4AF37] border-r border-white/20 pr-2 mr-1">
                                                {parseFloat(balance || '0').toFixed(2)} XLM
                                            </span>
                                        )}
                                        <span>
                                            {address?.slice(0, 4)}...{address?.slice(-4)}
                                        </span>
                                    </div>
                                ) : (
                                    "Connect"
                                )}
                            </span>
                        </motion.button>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
                        >
                            <div className="w-6 h-5 flex flex-col justify-between">
                                <motion.span
                                    animate={mobileMenuOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
                                    className="w-full h-0.5 bg-white/80 rounded-full origin-left"
                                />
                                <motion.span
                                    animate={mobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                                    className="w-full h-0.5 bg-white/80 rounded-full"
                                />
                                <motion.span
                                    animate={mobileMenuOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
                                    className="w-full h-0.5 bg-white/80 rounded-full origin-left"
                                />
                            </div>
                        </button>
                    </div>
                </div>
            </motion.nav>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="
              fixed top-24 left-4 right-4 z-40
              p-4 rounded-2xl
              backdrop-blur-xl bg-black/90
              border border-white/10
              shadow-2xl
              md:hidden
              max-h-[80vh] overflow-y-auto
            "
                    >
                        <div className="flex flex-col gap-2">
                            {navItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`
                      px-4 py-3 rounded-xl text-sm font-medium
                      flex items-center gap-3
                      transition-all duration-200
                      ${isActive
                                                ? 'bg-cyan-500/20 text-cyan-300'
                                                : 'text-white/60 hover:text-white/90 hover:bg-white/5'
                                            }
                    `}
                                    >
                                        <span className="text-lg">{item.icon}</span>
                                        {item.label}
                                    </Link>
                                );
                            })}
                            <div className="h-px bg-white/10 my-2" />
                            <button
                                onClick={() => {
                                    if (isConnected) disconnect();
                                    else connect();
                                    setMobileMenuOpen(false);
                                }}
                                className="
                w-full px-4 py-4 rounded-xl
                bg-gradient-to-r from-cyan-500/20 to-purple-600/20
                hover:from-cyan-500/30 hover:to-purple-600/30
                text-white font-medium text-sm
                border border-cyan-400/30
                transition-all
              ">
                                {isConnected ? (
                                    <div className="flex flex-col items-center gap-1">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                            <span>Connected</span>
                                        </div>
                                        <div className="font-mono text-xs opacity-70">
                                            {address?.slice(0, 6)}...{address?.slice(-6)}
                                        </div>
                                        {balance && (
                                            <div className="text-cyan-300 font-mono text-sm">
                                                {parseFloat(balance || '0').toFixed(2)} XLM
                                            </div>
                                        )}
                                        <span className="text-xs text-red-400 mt-1">Tap to disconnect</span>
                                    </div>
                                ) : (
                                    "Connect Wallet"
                                )}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

export default GlassNavbar;
