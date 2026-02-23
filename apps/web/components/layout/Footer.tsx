import Link from "next/link";
import { ExternalLink, Zap, Shield, Activity, Github } from "lucide-react";

const PROTOCOL_LINKS = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Analytics", href: "/analytics" },
    { label: "Strategies", href: "/strategies" },
    { label: "Strategy Builder", href: "/strategies/builder" },
    { label: "Marketplace", href: "/marketplace" },
    { label: "Plugins", href: "/plugins" },
];

const INTEL_LINKS = [
    { label: "Agents Console", href: "/agents" },
    { label: "Protocol Manifesto", href: "/manifesto" },
    { label: "How To Use", href: "/how-to-use" },
    { label: "Technical Docs", href: "/docs" },
    {
        label: "Kernel Source",
        href: "https://suiscan.xyz/testnet/object/0x673686ac6a1a259b1d39553e6cdb2fb2478a13db4bccd83ea6f7c079af89a7fb",
        external: true,
    },
];

const TECH_BADGES = [
    { label: "Scallop", color: "teal" },
    { label: "Cetus", color: "cyan" },
    { label: "Navi", color: "blue" },
    { label: "ElizaOS", color: "purple" },
    { label: "DeepBook V3", color: "indigo" },
    { label: "Walrus Storage", color: "orange" },
    { label: "Move Verified", color: "green" },
    { label: "Supabase", color: "emerald" },
    { label: "USDC", color: "violet" },
    { label: "Pyth Network", color: "amber" },
];

const COLOR_MAP: Record<string, string> = {
    teal: "bg-teal-500/10 text-teal-400 border-teal-500/20",
    cyan: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    indigo: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    orange: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    green: "bg-green-500/10 text-green-400 border-green-500/20",
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    violet: "bg-violet-500/10 text-violet-300 border-violet-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

export default function Footer() {
    return (
        <footer className="w-full relative z-10 border-t border-white/5 bg-[#030303]">
            {/* Glow accent top */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon-cyan/30 to-transparent" />

            {/* Protocol Status Banner */}
            <div className="border-b border-white/5 py-3 px-4">
                <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-6 text-[10px] font-mono">
                        <span className="flex items-center gap-1.5 text-green-400">
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
                            </span>
                            UPLINK ESTABLISHED
                        </span>
                        <span className="text-gray-600">KERNEL v0.0.7 // ENCRYPTED</span>
                        <span className="hidden sm:flex items-center gap-1.5 text-blue-400">
                            <Shield className="w-3 h-3" />
                            MOVE VERIFIED
                        </span>
                        <span className="hidden md:flex items-center gap-1.5 text-neon-cyan">
                            <Activity className="w-3 h-3" />
                            TESTNET ACTIVE
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-gray-500">
                        <Zap className="w-3 h-3 text-yellow-500" />
                        Built for the Stellar Ecosystem
                    </div>
                </div>
            </div>

            {/* Main Footer Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-10 grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">

                {/* Brand Column */}
                <div className="col-span-2 md:col-span-1 space-y-5">
                    <Link href="/" className="flex items-center gap-2.5 group w-fit">
                        <div className="relative flex items-center justify-center w-9 h-9 group-hover:scale-110 transition-transform">
                            <img src="/logo_transparent.png" alt="Nirium Logo" className="w-full h-full object-contain object-center scale-[1.3] drop-shadow-[0_0_10px_rgba(189,0,255,0.4)]" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-white tracking-tighter text-lg leading-none group-hover:text-neon-cyan transition-colors">XLMLOOP</span>
                            <span className="text-[9px] text-gray-500 font-mono tracking-widest leading-none">PROTOCOL</span>
                        </div>
                    </Link>

                    <p className="text-gray-400 text-sm leading-relaxed">
                        The first Atomic Intelligence Protocol on Stellar.
                        Autonomous financial execution via ElizaOS agents,
                        DeepBook V3 flash vectors, and Move-verified contracts.
                    </p>

                    {/* Tech Badges */}
                    <div className="flex flex-wrap gap-1.5">
                        {TECH_BADGES.map((b) => (
                            <span
                                key={b.label}
                                className={`px-2 py-0.5 text-[9px] font-mono border rounded-full ${COLOR_MAP[b.color]}`}
                            >
                                {b.label}
                            </span>
                        ))}
                    </div>

                    {/* Social */}
                    <div className="flex items-center gap-3 pt-1">
                        <a
                            href="https://x.com/Vaiosx"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="X / Twitter"
                            className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-white hover:text-black transition-all hover:shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                        >
                            <svg viewBox="0 0 24 24" aria-hidden="true" className="w-4 h-4 fill-current">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                        </a>
                        <a
                            href="https://github.com/Eras256/Stellar-Loop"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="GitHub"
                            className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-white hover:text-black transition-all hover:shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                        >
                            <Github className="w-4 h-4" />
                        </a>
                        <a
                            href="https://t.me/Vaiosx"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Telegram"
                            className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-sky-500 hover:text-white transition-all hover:shadow-[0_0_15px_rgba(14,165,233,0.4)]"
                        >
                            {/* Telegram SVG */}
                            <svg viewBox="0 0 24 24" aria-hidden="true" className="w-4 h-4 fill-current">
                                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                            </svg>
                        </a>
                    </div>
                </div>

                {/* Protocol Links */}
                <div>
                    <h4 className="text-white font-bold mb-5 text-xs tracking-widest uppercase font-mono">
                        <span className="text-neon-cyan mr-1">{'>'}</span> Mainframe
                    </h4>
                    <ul className="space-y-3">
                        {PROTOCOL_LINKS.map((link) => (
                            <li key={link.href}>
                                <Link
                                    href={link.href}
                                    className="text-sm text-gray-400 hover:text-neon-cyan transition-colors flex items-center gap-1.5 group"
                                >
                                    <span className="w-1 h-1 rounded-full bg-gray-700 group-hover:bg-neon-cyan transition-colors" />
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Intelligence Links */}
                <div>
                    <h4 className="text-white font-bold mb-5 text-xs tracking-widest uppercase font-mono">
                        <span className="text-neon-purple mr-1">{'>'}</span> Intelligence
                    </h4>
                    <ul className="space-y-3">
                        {INTEL_LINKS.map((link) => (
                            <li key={link.href}>
                                {"external" in link && link.external ? (
                                    <a
                                        href={link.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-gray-400 hover:text-neon-cyan transition-colors flex items-center gap-1.5 group"
                                    >
                                        <span className="w-1 h-1 rounded-full bg-gray-700 group-hover:bg-neon-cyan transition-colors" />
                                        {link.label}
                                        <ExternalLink className="w-2.5 h-2.5 opacity-40 group-hover:opacity-80" />
                                    </a>
                                ) : (
                                    <Link
                                        href={link.href}
                                        className="text-sm text-gray-400 hover:text-neon-cyan transition-colors flex items-center gap-1.5 group"
                                    >
                                        <span className="w-1 h-1 rounded-full bg-gray-700 group-hover:bg-neon-cyan transition-colors" />
                                        {link.label}
                                    </Link>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Stats / CTA Column */}
                <div className="col-span-2 md:col-span-1 space-y-4">
                    <h4 className="text-white font-bold mb-5 text-xs tracking-widest uppercase font-mono">
                        <span className="text-green-400 mr-1">{'>'}</span> Protocol Stats
                    </h4>

                    <div className="space-y-3">
                        {[
                            { label: "Active Strategies", value: "16+", color: "text-neon-cyan", dot: "bg-neon-cyan" },
                            { label: "Kernel Version", value: "v0.0.7", color: "text-neon-purple", dot: "bg-neon-purple" },
                            { label: "Network", value: "Stellar Testnet", color: "text-green-400", dot: "bg-green-400" },
                            { label: "Assets", value: "XLM + USDC", color: "text-blue-400", dot: "bg-blue-400" },
                            { label: "Walrus Logs", value: "LIVE ◉", color: "text-pink-400", dot: "bg-pink-400" },
                            { label: "Uptime", value: "99.9%", color: "text-yellow-400", dot: "bg-yellow-400" },
                        ].map((stat) => (
                            <div key={stat.label} className="flex items-center justify-between py-2 border-b border-white/5">
                                <div className="flex items-center gap-2">
                                    <span className={`w-1.5 h-1.5 rounded-full ${stat.dot}`} />
                                    <span className="text-xs text-gray-500 font-mono">{stat.label}</span>
                                </div>
                                <span className={`text-xs font-mono font-bold ${stat.color}`}>{stat.value}</span>
                            </div>
                        ))}
                    </div>

                    {/* CTA */}
                    <Link
                        href="/dashboard"
                        className="mt-4 flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-neon-cyan/10 to-neon-purple/10 border border-neon-cyan/20 rounded-xl text-xs font-bold text-neon-cyan font-mono hover:bg-neon-cyan/20 transition-all hover:shadow-[0_0_20px_rgba(0,243,255,0.2)] group"
                    >
                        <Zap className="w-3.5 h-3.5 group-hover:animate-pulse" />
                        LAUNCH DASHBOARD
                    </Link>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row justify-between items-center gap-3 text-[11px] text-gray-600 font-mono">
                    <div className="flex items-center gap-2">
                        <span>© 2026 Nirium Autonomous Systems.</span>
                        <span className="text-gray-700">•</span>
                        <a
                            href="https://t.me/Vaiosx"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-neon-cyan hover:text-white transition-colors"
                        >
                            Architect: Vaiosx
                        </a>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-700">All transactions are atomic &amp; Move-verified.</span>
                        <a
                            href="https://suiscan.xyz/testnet/object/0x673686ac6a1a259b1d39553e6cdb2fb2478a13db4bccd83ea6f7c079af89a7fb"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 hover:text-neon-cyan transition-colors"
                        >
                            Contract <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
