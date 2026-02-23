import Link from "next/link";
import { ExternalLink, Zap, Shield, Activity, Github, Cpu, Database } from "lucide-react";

const PROTOCOL_LINKS = [
    { label: "Neural Matrix", href: "/dashboard" },
    { label: "Market Analytics", href: "/analytics" },
    { label: "Signal Pool", href: "/strategies" },
    { label: "Matrix Builder", href: "/strategies/builder" },
    { label: "Marketplace", href: "/marketplace" },
    { label: "Neural Plugins", href: "/plugins" },
];

const INTEL_LINKS = [
    { label: "Agents Control", href: "/agents" },
    { label: "Protocol Manifesto", href: "/manifesto" },
    { label: "Mission Manual", href: "/how-to-use" },
    { label: "Developer Docs", href: "/docs" },
    {
        label: "Soroban Source",
        href: "https://stellar.expert/explorer/testnet",
        external: true,
    },
];

const TECH_BADGES = [
    { label: "Soroban", color: "cyan" },
    { label: "Horizon", color: "blue" },
    { label: "Stellar SDEX", color: "purple" },
    { label: "Orbit DB", color: "orange" },
    { label: "IPFS Blackbox", color: "pink" },
    { label: "AI Failover", color: "green" },
    { label: "XLM Native", color: "emerald" },
    { label: "USDC Anchor", color: "violet" },
];

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
    return (
        <footer className="w-full relative z-10 border-t border-white/5 bg-[#050505]">
            {/* Glow accent top */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-stellar-teal/30 to-transparent" />

            {/* Protocol Status Banner */}
            <div className="border-b border-white/5 py-3 px-4">
                <div className="max-w-[1600px] w-full mx-auto flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-6 text-[10px] font-mono">
                        <span className="flex items-center gap-1.5 text-green-400">
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
                            </span>
                            UPLINK ESTABLISHED
                        </span>
                        <span className="text-gray-600">KERNEL v0.1.0 // ENCRYPTED</span>
                        <span className="hidden sm:flex items-center gap-1.5 text-blue-400">
                            <Shield className="w-3 h-3" />
                            SOROBAN VERIFIED
                        </span>
                        <span className="hidden md:flex items-center gap-1.5 text-stellar-teal">
                            <Activity className="w-3 h-3" />
                            STELLAR TESTNET LIVE
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-gray-500">
                        <Database className="w-3 h-3 text-stellar-yellow" />
                        Forged in the Stellar Neural Matrix
                    </div>
                </div>
            </div>

            {/* Main Footer Grid */}
            <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 pt-12 pb-10 grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">

                {/* Brand Column */}
                <div className="col-span-2 md:col-span-1 space-y-6">
                    <Link href="/" className="flex items-center gap-3 group w-fit">
                        <div className="relative flex items-center justify-center w-10 h-10 group-hover:scale-110 transition-transform bg-black border border-white/10 rounded-lg p-2">
                            <Cpu className="w-full h-full text-stellar-teal" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-black text-white tracking-tighter text-xl leading-none group-hover:text-stellar-teal transition-colors uppercase tracking-tighter">NIRIUM</span>
                            <span className="text-[9px] text-gray-500 font-mono tracking-widest leading-none uppercase">Neural Matrix</span>
                        </div>
                    </Link>

                    <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                        Institutional-grade autonomous AI agents for the Stellar Network.
                        Precision execution via Soroban smart contracts and native atomic multi-operation transactions.
                    </p>

                    {/* Tech Badges */}
                    <div className="flex flex-wrap gap-1.5">
                        {TECH_BADGES.map((b) => (
                            <span
                                key={b.label}
                                className={`px-2 py-0.5 text-[9px] font-mono border rounded-full ${COLOR_MAP[b.color] || "border-white/10 text-gray-500"}`}
                            >
                                {b.label}
                            </span>
                        ))}
                    </div>

                    {/* Social */}
                    <div className="flex items-center gap-3 pt-2">
                        <SocialLink href="https://x.com/Vaiosx" label="X">
                            <svg viewBox="0 0 24 24" aria-hidden="true" className="w-4 h-4 fill-current">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                        </SocialLink>
                        <SocialLink href="https://github.com/Eras256/Nirium" label="GitHub">
                            <Github className="w-4 h-4" />
                        </SocialLink>
                    </div>
                </div>

                {/* Protocol Links */}
                <div>
                    <h4 className="text-white font-black mb-5 text-xs tracking-widest uppercase font-mono italic">
                        <span className="text-stellar-teal mr-1">{'>'}</span> Protocol
                    </h4>
                    <ul className="space-y-3">
                        {PROTOCOL_LINKS.map((link) => (
                            <li key={link.href}>
                                <Link
                                    href={link.href}
                                    className="text-sm text-gray-400 hover:text-stellar-teal transition-colors flex items-center gap-2 group"
                                >
                                    <span className="w-1 h-px bg-gray-700 group-hover:w-3 group-hover:bg-stellar-teal transition-all" />
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Intelligence Links */}
                <div>
                    <h4 className="text-white font-black mb-5 text-xs tracking-widest uppercase font-mono italic">
                        <span className="text-stellar-yellow mr-1">{'>'}</span> Intel Hub
                    </h4>
                    <ul className="space-y-3">
                        {INTEL_LINKS.map((link) => (
                            <li key={link.href}>
                                {"external" in link && link.external ? (
                                    <a
                                        href={link.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-gray-400 hover:text-stellar-teal transition-colors flex items-center gap-2 group"
                                    >
                                        <span className="w-1 h-px bg-gray-700 group-hover:w-3 group-hover:bg-stellar-teal transition-all" />
                                        {link.label}
                                        <ExternalLink className="w-2.5 h-2.5 opacity-40 group-hover:opacity-80 ml-auto" />
                                    </a>
                                ) : (
                                    <Link
                                        href={link.href}
                                        className="text-sm text-gray-400 hover:text-stellar-teal transition-colors flex items-center gap-2 group"
                                    >
                                        <span className="w-1 h-px bg-gray-700 group-hover:w-3 group-hover:bg-stellar-teal transition-all" />
                                        {link.label}
                                    </Link>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Stats / CTA Column */}
                <div className="col-span-2 md:col-span-1 space-y-4">
                    <h4 className="text-white font-black mb-5 text-xs tracking-widest uppercase font-mono italic">
                        <span className="text-green-400 mr-1">{'>'}</span> Metrics
                    </h4>

                    <div className="space-y-3 bg-white/5 border border-white/10 rounded-xl p-4">
                        {[
                            { label: "Active Nodes", value: "342", color: "text-stellar-teal" },
                            { label: "Matrix Tier", value: "L-v1", color: "text-stellar-yellow" },
                            { label: "Net Health", value: "OPTIMAL", color: "text-green-400" },
                            { label: "Arb Vectors", value: "Locked", color: "text-yellow-400" },
                        ].map((stat) => (
                            <div key={stat.label} className="flex items-center justify-between py-1 border-b border-white/5 last:border-0">
                                <span className="text-[10px] text-gray-500 font-mono uppercase">{stat.label}</span>
                                <span className={`text-[10px] font-mono font-bold ${stat.color}`}>{stat.value}</span>
                            </div>
                        ))}
                    </div>

                    {/* CTA */}
                    <Link
                        href="/dashboard"
                        className="flex items-center justify-center gap-2 w-full py-4 bg-stellar-teal text-black font-black italic rounded-lg text-xs transition-all hover:shadow-[0_0_30px_rgba(45,235,232,0.4)] hover:scale-[1.02] active:scale-95 group"
                    >
                        <Zap className="w-3.5 h-3.5" />
                        IGNITE MATRIX
                    </Link>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-white/5 bg-black/80 backdrop-blur-md">
                <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-gray-600 font-mono uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                        <span>© 2026 NIRIUM NEURAL SYSTEMS</span>
                        <span className="text-gray-800">|</span>
                        <span className="text-stellar-teal">ENCRYPTED PROTOCOL</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <a href="#" className="hover:text-white transition-colors">Private Mode</a>
                        <a href="#" className="hover:text-white transition-colors">Terms of Matrix</a>
                        <span className="text-gray-400">v0.1.0-STABLE</span>
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
