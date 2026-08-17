"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard, BarChart2,
    Shield, ShieldCheck, Code2, BookOpen,
    Menu, X, ChevronRight, Activity, Zap, Globe,
    Layers, Cpu, Send, Building2
, KeyRound, Home
} from "lucide-react";
import { useFreighter } from "@/hooks/useFreighter";
import { useLanguage } from "@/context/LanguageContext";
import { useNetwork } from "@/context/NetworkContext";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export function AppSidebar({ onClose }: { onClose?: () => void }) {
    const pathname = usePathname();
    const { address, isConnected, connect, disconnect } = useFreighter();
    const { language, setLanguage, t } = useLanguage();
    const { network, setNetwork } = useNetwork();

    const appNav = [
        {
            label: "CORE",
            items: [
                { href: "/",                 label: t.nav.home,        icon: Home,            accent: "#3B82F6" },
                { href: "/dashboard",        label: t.nav.dashboard,   icon: LayoutDashboard, accent: "#2DEBE8" },
                { href: "/agents",           label: t.nav.agents,      icon: Cpu,             accent: "#FFD700" },
                { href: "/payroll",          label: t.nav.payroll,     icon: Send,            accent: "#2DEBE8" },
                { href: "/security",         label: t.nav.security,    icon: ShieldCheck,     accent: "#10B981" },
                { href: "/compliance",       label: t.nav.compliance,  icon: Shield,          accent: "#2DEBE8" },
            ]
        },
        {
            label: "TREASURY",
            items: [
                { href: "/treasury",         label: t.nav.treasury,    icon: Building2,       accent: "#3B82F6" },
                { href: "/treasury/vault",   label: t.nav.vault,       icon: ShieldCheck,     accent: "#2DEBE8" },
                { href: "/treasury/builder", label: t.nav.builder,    icon: Zap,             accent: "#A78BFA" },
                { href: "/ramp",             label: t.nav.ramp,        icon: Globe,           accent: "#EC4899" },
            ]
        },
        {
            label: "DEVELOPER",
            items: [
                { href: "/docs",             label: t.nav.docs,        icon: BookOpen,        accent: "#8B5CF6" },
                { href: "/developers",       label: t.nav.developers,  icon: Code2,           accent: "#6366F1" },
                { href: "/keys",             label: t.nav.apikeys,     icon: KeyRound,        accent: "#FFD23F" },
            ]
        }
    ];

    const soonNav = [
        { href: "/analytics",   label: t.nav.analytics,   icon: BarChart2, badge: "BETA"  },
        { href: "/marketplace", label: t.nav.marketplace, icon: Layers,    badge: "SOON"  },
    ];

    return (
        <aside className="w-64 h-full bg-nirium-obsidian border-r border-white/[0.06] flex flex-col">
            {/* Logo */}
            <div className="flex items-center justify-between px-5 py-5 border-b border-white/[0.06] shrink-0">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="overflow-hidden flex items-center">
                        <img src="/brand/logo.png" alt="Nirium" className="h-7 w-auto object-contain" />
                    </div>
                </Link>
                {onClose && (
                    <button onClick={onClose} className="lg:hidden p-1 text-white/30 hover:text-white">
                        <X size={16} />
                    </button>
                )}
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto custom-scrollbar">
                {appNav.map((section) => (
                    <div key={section.label}>
                        <p className="px-3 mb-2 text-[9px] font-black uppercase tracking-[0.2em] text-white/20">
                            {section.label}
                        </p>
                        <ul className="space-y-0.5">
                            {section.items.map(({ href, label, icon: Icon, accent }) => {
                                const isActive = pathname === href || (href !== "/" && href !== "/dashboard" && pathname.startsWith(href));
                                return (
                                    <li key={href}>
                                        <Link
                                            href={href}
                                            onClick={onClose}
                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative ${
                                                isActive
                                                    ? "bg-white/[0.08] text-white"
                                                    : "text-white/40 hover:text-white/80 hover:bg-white/[0.04]"
                                            }`}
                                        >
                                            {isActive && (
                                                <span
                                                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                                                    style={{ background: accent }}
                                                />
                                            )}
                                            <Icon
                                                size={15}
                                                className="shrink-0 transition-colors"
                                                style={isActive ? { color: accent } : {}}
                                            />
                                            <span className="truncate text-[13px]">{label}</span>
                                            {isActive && (
                                                <ChevronRight size={12} className="ml-auto text-white/30" />
                                            )}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
                {/* SOON section */}
                <div>
                    <p className="px-3 mb-2 text-[9px] font-black uppercase tracking-[0.2em] text-white/20">
                        {t.nav.coming_soon_nav}
                    </p>
                    <ul className="space-y-0.5">
                        {soonNav.map(({ href, label, icon: Icon, badge }) => (
                            <li key={href}>
                                <Link
                                    href={href}
                                    onClick={onClose}
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative text-white/25 hover:text-white/40 hover:bg-white/[0.02]"
                                >
                                    <Icon size={15} className="shrink-0" />
                                    <span className="truncate text-[13px]">{label}</span>
                                    <span className="ml-auto text-[8px] font-black px-1.5 py-0.5 rounded border border-white/10 text-white/30 uppercase tracking-widest">
                                        {badge}
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </nav>

            {/* Status pill — dual red: settlement/audit en mainnet, vault en testnet */}
            <div className="px-3 pb-3 shrink-0">
                <div className="flex flex-col gap-1.5 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    {/* Los cuatro nodos non-custodial de mainnet, no dos: el resto
                        del sitio (home, disclaimer legal) ya listaba los cuatro. */}
                    <div className="flex items-start gap-2">
                        <span className="relative flex h-1.5 w-1.5 shrink-0 mt-[3px]">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
                        </span>
                        <span className="text-[9px] font-mono font-bold text-green-400 uppercase tracking-widest leading-[1.5]">
                            MAINNET · SETTLEMENT · AUDIT · PAYOUTS · REPORTING
                        </span>
                    </div>
                    <div className="flex items-start gap-2">
                        <span className="relative flex h-1.5 w-1.5 shrink-0 mt-[3px]">
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-400" />
                        </span>
                        <span className="text-[9px] font-mono font-bold text-amber-400/80 uppercase tracking-widest leading-[1.5]">
                            TESTNET · TREASURY
                        </span>
                    </div>

                    {/* El interruptor vive pegado a la píldora a propósito: lo que
                        corre en cada red y en cuál estás parado son la misma
                        pregunta, y separarlos fue lo que hizo firmar contra la red
                        equivocada. Pasar a mainnet abre la confirmación
                        (la puerta está en NetworkContext, no aquí). */}
                    <div className="flex items-center gap-1 mt-1 pt-2 border-t border-white/[0.06]">
                        {(['testnet', 'mainnet'] as const).map((n) => {
                            const on = network === n;
                            return (
                                <button
                                    key={n}
                                    onClick={() => setNetwork(n)}
                                    aria-pressed={on}
                                    className={`flex-1 px-2 py-1 rounded-lg text-[9px] font-mono font-bold uppercase tracking-widest transition-all ${
                                        on
                                            ? n === 'mainnet'
                                                ? 'bg-emerald-400/20 text-emerald-400 border border-emerald-400/30'
                                                : 'bg-amber-400/20 text-amber-400 border border-amber-400/30'
                                            : 'text-white/35 hover:text-white/70 border border-transparent'
                                    }`}
                                >
                                    {n === 'mainnet' ? 'Main' : 'Test'}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Language + Theme */}
            <div className="px-3 pb-2 shrink-0 flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] group hover:border-white/10 transition-colors">
                    <Globe size={13} className="text-white/30 group-hover:text-white/60 transition-colors" />
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value as any)}
                        className="flex-1 bg-transparent text-[10px] text-white/50 font-bold focus:outline-none cursor-pointer uppercase tracking-widest"
                    >
                        <option value="en" className="bg-nirium-obsidian text-white">English</option>
                        <option value="es" className="bg-nirium-obsidian text-white">Español</option>
                    </select>
                </div>
                <ThemeToggle />
            </div>

            {/* Wallet */}
            <div className="px-3 pb-4 shrink-0 border-t border-white/[0.06] pt-3">
                {isConnected && address ? (
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-stellar-teal/5 border border-stellar-teal/20">
                        <Activity size={13} className="text-stellar-teal shrink-0 animate-pulse" />
                        <span className="text-[10px] font-mono text-white/60 truncate">
                            {address.slice(0, 6)}…{address.slice(-4)}
                        </span>
                        <button
                            onClick={() => disconnect()}
                            className="ml-auto text-[9px] text-red-400/60 hover:text-red-400 font-bold uppercase transition-colors"
                        >
                            {t.nav.disconnect.split(' ')[0]}
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => connect()}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-stellar-yellow text-[#0b0b0b] text-xs font-black uppercase tracking-tight hover:bg-stellar-yellow/90 transition-all active:scale-95"
                    >
                        <Zap size={13} />
                        {t.nav.auth_session}
                    </button>
                )}
            </div>

            {/* Marketing Back Link */}
            <div className="px-3 pb-6 shrink-0">
                <Link
                    href="/"
                    className="flex items-center justify-center gap-2 px-3 py-2 text-[9px] font-black uppercase tracking-[0.2em] text-white/20 hover:text-white/60 transition-all border border-transparent hover:border-white/5 rounded-lg"
                >
                    <ChevronRight size={10} className="rotate-180" />
                    {t.nav.home}
                </Link>
            </div>
        </aside>
    );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const pathname = usePathname();
    const { t } = useLanguage();

    useEffect(() => {
        setMobileSidebarOpen(false);
    }, [pathname]);

    return (
        <div className="min-h-screen bg-black text-white flex">
            {/* Desktop sidebar */}
            <div className="hidden lg:block w-64 shrink-0 sticky top-9 h-[calc(100vh-36px)]">
                <AppSidebar />
            </div>

            {/* Mobile overlay */}
            <AnimatePresence>
                {mobileSidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-30 bg-black/70 backdrop-blur-sm lg:hidden"
                            onClick={() => setMobileSidebarOpen(false)}
                        />
                        <motion.div
                            initial={{ x: -256 }}
                            animate={{ x: 0 }}
                            exit={{ x: -256 }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed top-9 bottom-0 left-0 z-40 lg:hidden"
                        >
                            <AppSidebar onClose={() => setMobileSidebarOpen(false)} />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile top bar */}
                <header className="lg:hidden sticky top-9 z-20 flex items-center gap-3 px-4 py-3 bg-black/90 backdrop-blur-xl border-b border-white/[0.06]">
                    <button
                        onClick={() => setMobileSidebarOpen(true)}
                        className="p-1.5 rounded-lg bg-white/5 text-white/50 hover:text-white transition-colors"
                    >
                        <Menu size={18} />
                    </button>
                    <img src="/brand/logo.png" alt="Nirium" className="h-7 w-auto object-contain" />
                    <Link href="/" className="ml-auto text-[9px] font-mono text-white/30 hover:text-white transition-colors uppercase tracking-widest">
                        {t.nav.back_to_marketing}
                    </Link>
                </header>

                <main className="flex-1 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
