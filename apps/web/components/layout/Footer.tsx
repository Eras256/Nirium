"use client";

import Link from "next/link";
import { ExternalLink, Zap, Shield, Activity, Database, CheckCircle, Heart } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

const COLOR_MAP: Record<string, string> = {
    cyan: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    orange: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    pink: "bg-pink-500/10 text-pink-400 border-pink-500/20",
    green: "bg-green-500/10 text-green-400 border-green-500/20",
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    violet: "bg-violet-500/10 text-violet-300 border-violet-500/20",
};

export default function Footer() {
    const { t } = useLanguage();

    const PROTOCOL_LINKS = [
        { label: t.nav.treasury,   href: "/treasury"   },
        { label: t.nav.security,   href: "/security"   },
        { label: t.nav.developers, href: "/developers" },
        { label: t.nav.pricing,    href: "/pricing"    },
        { label: t.nav.compliance, href: "/compliance" },
    ];

    const contractHref = "https://stellar.expert/explorer/testnet/contract/CAU2XBJTQUBTMPAUFRX7GMZ337I5WLBI4GYPWHZEVXTMJ66D3CP6DEL4";

    const INTEL_LINKS = [
        { label: t.footer.developer_docs, href: "/docs" },
        { label: t.footer.agents_control, href: "/agents" },
        { label: t.footer.protocol_manifesto, href: "/manifesto" },
        { label: t.footer.mission_manual, href: "/how-to-use" },
        {
            label: t.footer.soroban_source,
            href: contractHref,
            external: true,
        },
    ];

    const TECH_BADGES = [
        { label: "Soroban",        color: "cyan"    },
        { label: "Etherfuse",      color: "blue"    },
        { label: "CETES",          color: "purple"  },
        { label: "Stellar SDEX",   color: "orange"  },
        { label: "IPFS Archive",   color: "pink"    },
        { label: "Blend Protocol", color: "green"   },
        { label: "Soroswap DEX",   color: "orange"  },
        { label: "USDC Anchor",    color: "emerald" },
        { label: "Non-Custodial",  color: "violet"  },
    ];

    const METRICS = [
        { label: "Contracts",    value: "6 Testnet", color: "text-stellar-teal" },
        { label: "Settlement",   value: "~4 sec",    color: "text-stellar-yellow" },
        { label: "Network",      value: "Stellar",   color: "text-green-400" },
        { label: "Platform fee", value: "0.2%",      color: "text-yellow-400" },
    ];

    return (
        <footer className="w-full relative z-10 border-t border-white/5 bg-[#050505] overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-1/4 w-1/2 h-px bg-gradient-to-r from-transparent via-stellar-teal/20 to-transparent" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-stellar-teal/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-stellar-yellow/5 blur-[120px] rounded-full pointer-events-none" />

            {/* Protocol Status Banner - Simplified for Mobile */}
            <div className="border-b border-white/5 py-3 px-4 bg-white/[0.01]">
                <div className="max-w-[1600px] w-full mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-6 text-[9px] sm:text-[10px] font-mono tracking-tight">
                        <span className="flex items-center gap-1.5 text-green-400 font-bold bg-green-400/5 px-2 py-1 rounded-md border border-green-400/10">
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
                            </span>
                            {t.footer.connection_established}
                        </span>
                        <span className="text-gray-500 hover:text-gray-400 transition-colors cursor-default">{t.footer.kernel_version}</span>
                        <span className="flex items-center gap-1.5 text-blue-400/80">
                            <Shield className="w-3 h-3" />
                            <span className="hidden sm:inline">{t.footer.soroban_verified}</span>
                            <span className="sm:hidden">SOROBAN</span>
                        </span>
                        <span className="hidden lg:flex items-center gap-1.5 text-stellar-teal/80">
                            <CheckCircle className="w-3 h-3" />
                            {t.footer.scf_verified}
                        </span>
                    </div>
                    <div className="flex items-center gap-4 text-[9px] sm:text-[10px] font-mono text-gray-500">
                        <span className="hidden lg:flex items-center gap-1.5 text-pink-400/70 hover:text-pink-400 transition-colors cursor-default">
                            <Heart className="w-3 h-3" />
                            {t.footer.ecosystem_ready}
                        </span>
                        <div className="flex items-center gap-2 px-2 py-1 bg-white/[0.03] rounded-md border border-white/5">
                            <Database className="w-3 h-3 text-stellar-yellow/80" />
                            <span className="hidden xs:inline">{t.footer.powered_by}</span>
                            <span className="xs:hidden">{t.footer.stellar_native}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Footer Grid */}
            <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-8 pt-12 sm:pt-16 pb-10 sm:pb-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-12 lg:gap-16">

                {/* Brand Column */}
                <div className="flex flex-col items-center sm:items-start space-y-6">
                    <Link href="/" className="flex items-center gap-3 group w-fit">
                        <div className="relative flex items-center justify-center w-40 h-20 group-hover:scale-105 transition-all bg-black border border-white/10 rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)] p-2">
                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <img src="/brand/NiLo.png" alt="Nirium Logo" className="w-full h-full object-contain relative z-10" />
                        </div>
                    </Link>

                    <p className="text-gray-400 text-sm leading-relaxed max-w-xs text-center sm:text-left">
                        {t.footer.brand_desc}
                    </p>

                    {/* Tech Badges */}
                    <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                        {TECH_BADGES.map((b) => (
                            <span
                                key={b.label}
                                className={`px-2.5 py-1 text-[9px] font-mono font-bold border rounded-md transition-all hover:scale-105 ${COLOR_MAP[b.color] || "border-white/10 text-gray-500"}`}
                            >
                                {b.label}
                            </span>
                        ))}
                    </div>

                    {/* Social */}
                    <div className="flex items-center justify-center sm:justify-start gap-3 pt-2">
                        <SocialLink href="https://x.com/Niriumstellar" label="X">
                            <svg viewBox="0 0 24 24" aria-hidden="true" className="w-4 h-4 fill-current">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                        </SocialLink>
                    </div>
                </div>

                {/* Protocol Links */}
                <div className="flex flex-col items-center sm:items-start space-y-6">
                    <h4 className="text-white font-black text-xs tracking-[0.2em] uppercase font-mono italic flex items-center gap-2">
                        <span className="w-2 h-2 bg-stellar-teal rounded-full animate-pulse" /> {t.footer.protocol}
                    </h4>
                    <ul className="space-y-4 w-full text-center sm:text-left">
                        {PROTOCOL_LINKS.map((link) => (
                            <li key={link.href}>
                                <Link
                                    href={link.href}
                                    className="text-sm text-gray-400 hover:text-white transition-all flex items-center justify-center sm:justify-start gap-3 group"
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-stellar-teal/20 group-hover:bg-stellar-teal group-hover:scale-125 transition-all" />
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Intelligence Links */}
                <div className="flex flex-col items-center sm:items-start space-y-6">
                    <h4 className="text-white font-black text-xs tracking-[0.2em] uppercase font-mono italic flex items-center gap-2">
                        <span className="w-2 h-2 bg-stellar-yellow rounded-full animate-pulse" /> {t.footer.intel_hub}
                    </h4>
                    <ul className="space-y-4 w-full text-center sm:text-left">
                        {INTEL_LINKS.map((link) => (
                            <li key={link.href}>
                                {"external" in link && link.external ? (
                                    <a
                                        href={link.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-gray-400 hover:text-white transition-all flex items-center justify-center sm:justify-start gap-3 group"
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full bg-stellar-yellow/20 group-hover:bg-stellar-yellow group-hover:scale-125 transition-all" />
                                        {link.label}
                                        <ExternalLink className="w-3 h-3 opacity-30 group-hover:opacity-100 transition-opacity" />
                                    </a>
                                ) : (
                                    <Link
                                        href={link.href}
                                        className="text-sm text-gray-400 hover:text-white transition-all flex items-center justify-center sm:justify-start gap-3 group"
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full bg-stellar-yellow/20 group-hover:bg-stellar-yellow group-hover:scale-125 transition-all" />
                                        {link.label}
                                    </Link>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Stats / CTA Column */}
                <div className="flex flex-col space-y-6">
                    <h4 className="text-white font-black text-xs tracking-[0.2em] uppercase font-mono italic flex items-center gap-2 justify-center sm:justify-start">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" /> {t.footer.metrics}
                    </h4>

                    <div className="space-y-3 bg-white/[0.02] border border-white/5 rounded-2xl p-5 backdrop-blur-sm shadow-inner">
                        {METRICS.map((stat) => (
                            <div key={stat.label} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                                <span className="text-[10px] text-gray-500 font-mono uppercase font-bold tracking-wider">{stat.label}</span>
                                <span className={`text-[10px] font-mono font-black ${stat.color} tracking-tighter`}>{stat.value}</span>
                            </div>
                        ))}
                    </div>

                    {/* CTA */}
                    <Link
                        href="/dashboard"
                        className="flex items-center justify-center gap-3 w-full py-4 bg-stellar-yellow text-black font-black uppercase rounded-xl text-xs transition-all hover:shadow-[0_0_40px_rgba(255,200,0,0.3)] hover:scale-[1.02] active:scale-95 group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
                        <Zap className="w-4 h-4" />
                        {t.nav.launch_app}
                    </Link>
                </div>
            </div>

            {/* Compliance Disclaimer - Enhanced Typography */}
            <div className="border-t border-white/5 bg-black/40">
                <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-8 py-6 text-[10px] sm:text-[11px] text-gray-500 font-mono leading-relaxed text-center italic opacity-80 hover:opacity-100 transition-opacity">
                    <p className="max-w-5xl mx-auto">
                        <span className="text-stellar-yellow font-bold uppercase mr-2">[ COMPLIANCE ]</span>
                        {t.footer.compliance_disclaimer}
                    </p>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-white/5 bg-black/90 backdrop-blur-xl py-8 sm:py-10">
                <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-8 flex flex-col lg:flex-row justify-between items-center gap-8 text-[9px] sm:text-[10px] text-gray-500 font-mono uppercase tracking-widest text-center lg:text-left">
                    <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6">
                        <span className="font-bold text-gray-400">{t.footer.copyright}</span>
                        <span className="hidden sm:block text-white/5">|</span>
                        <div className="flex items-center gap-2 px-3 py-1 bg-stellar-yellow/5 border border-stellar-yellow/20 rounded-full text-stellar-yellow">
                            <Activity className="w-3 h-3" />
                            <span className="font-black tracking-tighter">{t.footer.testnet_live}</span>
                        </div>
                        <span className="hidden sm:block text-white/5">|</span>
                        <span className="text-stellar-teal/80 font-bold">{t.footer.institutional_protocol}</span>
                    </div>
                    
                    <div className="flex flex-wrap justify-center items-center gap-5 sm:gap-8">
                        <Link href="/docs?tab=security" className="text-stellar-yellow hover:text-white transition-all flex items-center gap-2 group">
                            <Activity className="w-3 h-3 group-hover:animate-pulse" />
                            {t.footer.coc_aligned}
                        </Link>
                        <Link href="/jargus-audit" className="text-stellar-teal hover:text-white transition-all flex items-center gap-2 group">
                            <Shield className="w-3 h-3 group-hover:rotate-12 transition-transform" />
                            {t.footer.jargus_link}
                        </Link>
                        <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 lg:border-l lg:border-white/10 lg:pl-8">
                            <Link href="/risk-disclosure" className="hover:text-red-400/80 transition-colors">{t.footer.risk_disclosure}</Link>
                            <Link href="/disclaimers" className="hover:text-red-400/80 transition-colors">{t.footer.disclaimers_label}</Link>
                            <Link href="/privacy" className="hover:text-white transition-colors">{t.footer.privacy}</Link>
                            <Link href="/terms" className="hover:text-white transition-colors">{t.footer.terms}</Link>
                            <span className="text-gray-600 font-bold border border-white/5 px-2 py-0.5 rounded bg-white/[0.02]">v0.5.0-STABLE</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

function SocialLink({ href, label, children }: { href: string, label: string, children: React.ReactNode }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-stellar-teal hover:text-black hover:border-stellar-teal transition-all hover:shadow-[0_0_20px_rgba(45,235,232,0.3)] shadow-inner"
        >
            {children}
        </a>
    );
}
