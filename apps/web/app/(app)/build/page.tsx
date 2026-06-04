"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
    Rocket, Bot, Wallet, Gift, Wand2, ScrollText, PlayCircle, Clock,
    Code2, ArrowRight, Globe, Zap, Download, Layers, Webhook,
    KeyRound, Send, Coins, Radio, Lock, LineChart, Brain, Trophy,
    Terminal as TerminalIcon, Package, Github, Shield,
    Landmark, ShieldCheck, Image, Database, Handshake, Cpu
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.55, delay },
});

const STARTUP_CARDS = [
    { id: "global_payroll",    icon: Globe,       accent: "#2DEBE8" },
    { id: "m2m_exchange",      icon: Zap,         accent: "#FFD700" },
    { id: "forensic_treasury", icon: Shield,      accent: "#34D399" },
    { id: "savings_neobank",     icon: LineChart,   accent: "#EC4899" },
    { id: "grant_distributor", icon: Trophy,      accent: "#A78BFA" },
    { id: "logistics_settle",  icon: Send,        accent: "#F97316" },
    { id: "energy_grid",       icon: Cpu,         accent: "#10B981" },
    { id: "rwa_market",        icon: Landmark,    accent: "#FBBF24" },
    { id: "defi_insurance",    icon: ShieldCheck, accent: "#EF4444" },
    { id: "content_license",   icon: Image,       accent: "#8B5CF6" },
    { id: "oracle_bridge",     icon: Database,    accent: "#3B82F6" },
    { id: "escrow_fleet",      icon: Handshake,   accent: "#6366F1" },
] as const;

const API_ENDPOINTS = [
    { id: "auth",     icon: KeyRound,     path: "/v1/auth",    method: "POST" },
    { id: "market",   icon: LineChart,    path: "/v1/market",  method: "GET"  },
    { id: "exec",     icon: TerminalIcon, path: "/v1/execute", method: "POST" },
    { id: "skills",   icon: Brain,        path: "/v1/skills",  method: "POST" },
    { id: "billing",  icon: Coins,        path: "/v1/x402",    method: "POST" },
    { id: "settle",   icon: Send,         path: "/v1/mpp",     method: "POST" },
    { id: "vault",    icon: Lock,         path: "/v1/vault",   method: "POST" },
    { id: "elo",      icon: Trophy,       path: "/v1/elo",     method: "GET"  },
    { id: "webhooks", icon: Webhook,      path: "/v1/hooks",   method: "SUB"  },
    { id: "mcp",      icon: Radio,        path: "/v1/mcp",     method: "WS"   },
];

const SDK_ICONS: Record<string, any> = {
    ts: Package, py: Package, mcp: Radio, rest: Webhook, tauri: Download, studio: Layers,
};

const SDK_HREFS: Record<string, string> = {
    ts: 'https://www.npmjs.com/package/nirium',
    py: 'https://pypi.org/project/nirium/',
};

export default function BuildPage() {
    const { t } = useLanguage();
    const si = t.home.institutional_use_cases.startup_ideas;
    const ah = t.home.institutional_use_cases.api_hub;

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-stellar-teal/30 overflow-x-hidden">
{/* ── HERO ──────────────────────────────────────────────────────── */}
            <section className="relative pt-8 sm:pt-8 pb-16 sm:pb-20 overflow-hidden">
                {/* Grid texture */}
                <div
                    className="absolute inset-0 opacity-[0.035] pointer-events-none"
                    style={{
                        backgroundImage:
                            "linear-gradient(rgba(255,255,255,0.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.6) 1px,transparent 1px)",
                        backgroundSize: "48px 48px",
                        maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%,black,transparent)",
                    }}
                />
                {/* Glows */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[radial-gradient(ellipse,rgba(255,215,0,0.08),transparent_70%)] pointer-events-none" />
                <div className="absolute top-20 right-0 w-72 h-72 bg-stellar-teal/5 blur-[100px] rounded-full pointer-events-none" />

                <div className="container mx-auto px-4 text-center relative z-10 max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                        className="space-y-6"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-stellar-yellow/10 border border-stellar-yellow/30 text-stellar-yellow text-[9px] sm:text-[10px] font-black uppercase tracking-[0.25em]">
                            <Rocket className="w-3 h-3" />
                            <span>{si.badge}</span>
                        </div>

                        <h1 className="text-4xl xs:text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter uppercase italic leading-[0.85]">
                            {si.title}{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-stellar-yellow via-orange-400 to-stellar-teal">
                                {si.title_span}
                            </span>
                        </h1>

                        <p className="text-gray-400 text-base sm:text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
                            {si.subtitle}
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-8">
                            <a
                                href="https://nirium-agent.fly.dev/docs"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-stellar-yellow text-black font-black text-sm uppercase tracking-tight hover:bg-stellar-yellow/90 transition-all shadow-[0_10px_30px_rgba(255,215,0,0.25)]"
                            >
                                <Code2 className="w-4 h-4" />
                                {si.cta_button}
                            </a>
                            <Link
                                href="/sandbox"
                                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-white/5 border border-white/10 text-white font-bold text-sm uppercase tracking-tight hover:bg-white/10 transition-all"
                            >
                                <TerminalIcon className="w-4 h-4" />
                                {ah.cta_sandbox}
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ── STARTUP IDEA CARDS ────────────────────────────────────────── */}
            <section className="py-16 sm:py-20">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {STARTUP_CARDS.map((card, idx) => {
                            const data = si.items[card.id as keyof typeof si.items];
                            const Icon = card.icon;
                            return (
                                <motion.article
                                    key={card.id}
                                    {...fadeUp(idx * 0.08)}
                                    className="group relative rounded-2xl overflow-hidden bg-[#0A0A0A] border border-white/10 hover:border-white/20 transition-all duration-500"
                                >
                                    {/* Accent top strip */}
                                    <div
                                        className="h-1 w-full transition-all duration-300 group-hover:h-[3px]"
                                        style={{ background: `linear-gradient(90deg,${card.accent},transparent)` }}
                                    />
                                    <div className="p-5 sm:p-6 space-y-5">
                                        {/* Icon + time badge */}
                                        <div className="flex items-start justify-between gap-3">
                                            <div
                                                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
                                                style={{ background: `${card.accent}14`, border: `1px solid ${card.accent}33`, color: card.accent }}
                                            >
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold tracking-wide text-gray-500 bg-white/[0.03] border border-white/5 rounded-full px-2.5 py-1 shrink-0">
                                                <Clock className="w-3 h-3" />
                                                <span className="uppercase">{data.time}</span>
                                            </div>
                                        </div>

                                        {/* Name + tagline */}
                                        <div>
                                            <h2 className="text-xl sm:text-2xl font-black tracking-tighter text-white mb-2 leading-none">
                                                {data.name}
                                            </h2>
                                            <p className="text-sm text-gray-400 leading-relaxed">
                                                {data.tagline}
                                            </p>
                                        </div>

                                        {/* Stack pills */}
                                        <div className="pt-8 border-t border-white/5 space-y-2">
                                            <div className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-gray-600">
                                                {si.stack_label}
                                            </div>
                                            <div className="flex flex-wrap gap-1.5">
                                                {(data.stack as string[]).map((tech: string) => (
                                                    <span
                                                        key={tech}
                                                        className="text-[10px] font-mono font-bold px-2 py-1 rounded-md bg-white/5 border border-white/10 text-gray-300"
                                                    >
                                                        {tech}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Blueprint link */}
                                        <Link
                                            href="/docs?tab=blueprints"
                                            className="flex items-center justify-between pt-8 group/lnk"
                                        >
                                            <span className="text-[11px] font-black uppercase tracking-wider transition-colors" style={{ color: card.accent }}>
                                                {si.blueprint}
                                            </span>
                                            <ArrowRight className="w-4 h-4 transition-transform group-hover/lnk:translate-x-1" style={{ color: card.accent }} />
                                        </Link>
                                    </div>

                                    {/* Ambient glow */}
                                    <div
                                        className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-50 transition-opacity pointer-events-none"
                                        style={{ background: card.accent }}
                                    />
                                </motion.article>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── SEPARATOR ─────────────────────────────────────────────────── */}
            <div className="container mx-auto px-4">
                <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>

            {/* ── DEVELOPER TOOLKIT ─────────────────────────────────────────── */}
            <section className="py-16 sm:py-20 lg:py-24 relative overflow-hidden">
                <div className="absolute -top-32 -right-20 w-72 h-72 bg-stellar-yellow/5 blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute -bottom-32 -left-20 w-72 h-72 bg-stellar-teal/10 blur-[120px] rounded-full pointer-events-none" />

                <div className="container mx-auto px-4 relative z-10">
                    {/* Section header */}
                    <motion.div {...fadeUp()} className="text-center mb-12 space-y-4 max-w-2xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-stellar-teal/10 border border-stellar-teal/30 text-stellar-teal text-[10px] font-black uppercase tracking-widest">
                            <Code2 className="w-3 h-3" />
                            <span>{ah.badge} // OPEN SOURCE & VERIFIED IMPACT</span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter uppercase italic leading-[0.9]">
                            {ah.title}
                        </h2>
                        <p className="text-gray-400 text-base sm:text-lg leading-relaxed">
                            {ah.subtitle}
                        </p>
                    </motion.div>

                    {/* API endpoints grid */}
                    <div className="mb-14 sm:mb-16">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
                            <span className="text-[10px] font-mono font-black tracking-[0.3em] text-gray-500 uppercase">
                                {ah.endpoints_title}
                            </span>
                            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                            {API_ENDPOINTS.map((api, idx) => {
                                const ep = ah.endpoints[api.id as keyof typeof ah.endpoints];
                                return (
                                    <motion.a
                                        key={api.id}
                                        {...fadeUp(idx * 0.04)}
                                        href="https://nirium-agent.fly.dev/docs"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group relative p-4 rounded-2xl bg-black/60 border border-white/10 hover:border-stellar-teal/40 hover:bg-black/80 transition-all overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 w-24 h-24 blur-2xl rounded-full bg-stellar-teal/0 group-hover:bg-stellar-teal/10 transition-colors pointer-events-none" />
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-stellar-teal/10 group-hover:border-stellar-teal/30 transition-all">
                                                    <api.icon className="w-4 h-4 text-gray-400 group-hover:text-stellar-teal transition-colors" />
                                                </div>
                                                <span className="text-[8px] font-mono font-black tracking-wider text-stellar-teal/70 bg-stellar-teal/5 border border-stellar-teal/20 rounded-md px-1.5 py-0.5">
                                                    {api.method}
                                                </span>
                                            </div>
                                            <div>
                                                <div className="font-black text-xs uppercase tracking-tight text-white/90 leading-tight">
                                                    {ep.label}
                                                </div>
                                                <div className="text-[10px] text-gray-500 leading-snug mt-1 line-clamp-2">
                                                    {ep.desc}
                                                </div>
                                            </div>
                                            <div className="text-[9px] font-mono text-gray-600 group-hover:text-stellar-teal/70 transition-colors truncate">
                                                {api.path}
                                            </div>
                                        </div>
                                    </motion.a>
                                );
                            })}
                        </div>
                    </div>

                    {/* Code block + SDK cards */}
                    <div className="grid lg:grid-cols-5 gap-6 mb-14">
                        {/* Code preview */}
                        <motion.div {...fadeUp(0.1)} className="lg:col-span-3 rounded-2xl bg-[#050505] border border-white/10 overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
                            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                                <div className="flex gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                                </div>
                                <div className="flex items-center gap-1 overflow-x-auto">
                                    {[ah.code_tabs.ts_label, ah.code_tabs.py_label, ah.code_tabs.curl_label, ah.code_tabs.mcp_label].map((tab, i) => (
                                        <span
                                            key={tab}
                                            className={`text-[9px] sm:text-[10px] font-mono font-bold px-2 py-1 rounded-md tracking-wider uppercase shrink-0 ${
                                                i === 0
                                                    ? "text-stellar-teal bg-stellar-teal/10 border border-stellar-teal/30"
                                                    : "text-gray-500"
                                            }`}
                                        >
                                            {tab}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <pre className="p-4 sm:p-6 text-[11px] sm:text-[13px] font-mono leading-relaxed overflow-x-auto text-gray-300">
<code>
<span className="text-purple-400">import</span> {"{"} <span className="text-stellar-teal">Nirium</span> {"}"} <span className="text-purple-400">from</span> <span className="text-green-400">'nirium'</span>;{"\n\n"}
<span className="text-blue-400">const</span> nirium = <span className="text-blue-400">new</span> <span className="text-stellar-teal">Nirium</span>({"{"} apiKey: <span className="text-yellow-300">'sk_live_...'</span> {"}"});{"\n\n"}
<span className="text-gray-500">// 1. Create a vault on Stellar</span>{"\n"}
<span className="text-blue-400">const</span> vault = <span className="text-purple-400">await</span> nirium.vaults.<span className="text-cyan-400">create</span>({"{"} asset: <span className="text-green-400">'USDC'</span>, signers: <span className="text-yellow-300">2</span> {"}"});{"\n\n"}
<span className="text-gray-500">// 2. Deploy an AI helper with x402 micro-billing</span>{"\n"}
<span className="text-blue-400">const</span> agent = <span className="text-purple-400">await</span> nirium.agents.<span className="text-cyan-400">deploy</span>({"{"}{"\n"}
{"  "}name: <span className="text-green-400">'TreasuryBot'</span>, vault: vault.id,{"\n"}
{"  "}billing: {"{"} trigger: <span className="text-green-400">'inference'</span>, unit: <span className="text-yellow-300">0.001</span> {"}"},{"\n"}
{"}"});{"\n\n"}
<span className="text-gray-500">// 3. Subscribe to on-chain events</span>{"\n"}
nirium.events.<span className="text-cyan-400">on</span>(<span className="text-green-400">'vault.settled'</span>, (tx) =&gt; {"{"}{"\n"}
{"  "}console.<span className="text-cyan-400">log</span>(<span className="text-green-400">'Settled on Stellar'</span>, tx.hash);{"\n"}
{"}"});
</code>
                            </pre>
                        </motion.div>

                        {/* SDK cards */}
                        <motion.div {...fadeUp(0.2)} className="lg:col-span-2 grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-1 gap-3">
                            {(Object.keys(ah.sdks) as Array<keyof typeof ah.sdks>).map((key) => {
                                const sdk = ah.sdks[key];
                                const IconComp = SDK_ICONS[key as string] || Package;
                                const href = SDK_HREFS[key as string];
                                const Wrapper = href ? 'a' : 'div';
                                return (
                                    <Wrapper
                                        key={key}
                                        {...(href ? { href, target: '_blank', rel: 'noopener noreferrer' } : {})}
                                        className="group p-4 rounded-2xl bg-gradient-to-br from-white/[0.03] to-transparent border border-white/10 hover:border-stellar-teal/30 transition-all"
                                    >
                                        <div className="flex items-start justify-between gap-3 mb-2">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-lg bg-stellar-teal/5 border border-stellar-teal/20 flex items-center justify-center shrink-0">
                                                    <IconComp className="w-4 h-4 text-stellar-teal" />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-black text-xs sm:text-sm text-white truncate">{sdk.name}</div>
                                                    <div className="text-[10px] font-mono text-gray-500 truncate">{sdk.sub}</div>
                                                </div>
                                            </div>
                                            <span className="text-[9px] font-mono font-black text-stellar-teal bg-stellar-teal/10 border border-stellar-teal/20 rounded-full px-2 py-0.5 shrink-0">
                                                {sdk.badge}
                                            </span>
                                        </div>
                                        <div className="px-2.5 py-1.5 bg-black/60 border border-white/5 rounded-lg">
                                            <code className="text-[10px] sm:text-[11px] font-mono text-stellar-teal/90 block truncate">{sdk.cmd}</code>
                                        </div>
                                    </Wrapper>
                                );
                            })}
                        </motion.div>
                    </div>

                    {/* Highlights strip */}
                    <motion.div {...fadeUp(0.2)} className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-12">
                        {[
                            { icon: Globe, key: "stellar" },
                            { icon: Zap,   key: "x402"    },
                            { icon: Bot,   key: "mcp"     },
                            { icon: Github, key: "open"   },
                        ].map((h) => (
                            <div key={h.key} className="flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-stellar-teal/20 transition-colors">
                                <div className="w-8 h-8 rounded-lg bg-stellar-teal/5 border border-stellar-teal/20 flex items-center justify-center shrink-0">
                                    <h.icon className="w-4 h-4 text-stellar-teal" />
                                </div>
                                <span className="text-[11px] sm:text-xs font-bold text-white/80 leading-tight">
                                    {ah.highlights[h.key as keyof typeof ah.highlights]}
                                </span>
                            </div>
                        ))}
                    </motion.div>

                    {/* CTAs */}
                    <motion.div {...fadeUp(0.3)} className="flex flex-col sm:flex-row flex-wrap justify-center gap-3">
                        <a
                            href="https://nirium-agent.fly.dev/docs"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-stellar-teal text-black font-black text-xs sm:text-sm uppercase tracking-tight hover:bg-stellar-teal/90 transition-all shadow-[0_10px_30px_rgba(45,235,232,0.2)]"
                        >
                            <Code2 className="w-4 h-4" />
                            {ah.cta_docs}
                        </a>
                        <Link href="/sandbox" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white font-bold text-xs sm:text-sm uppercase tracking-tight hover:bg-white/10 transition-all">
                            <TerminalIcon className="w-4 h-4" />
                            {ah.cta_sandbox}
                        </Link>
                        <a
                            href="https://github.com/nirium"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white font-bold text-xs sm:text-sm uppercase tracking-tight hover:bg-white/10 transition-all"
                        >
                            <Github className="w-4 h-4" />
                            {ah.cta_github}
                        </a>
                    </motion.div>
                </div>
            </section>

            {/* ── FOOTER CTA ────────────────────────────────────────────────── */}
            <section className="py-16 sm:py-20 relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,rgba(255,215,0,0.06),transparent_60%)] pointer-events-none" />
                <div className="container mx-auto px-4 relative z-10">
                    <motion.div
                        {...fadeUp()}
                        className="relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-stellar-yellow/5 via-black to-stellar-teal/5 p-6 sm:p-10 lg:p-14"
                    >
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(255,215,0,0.07),transparent_60%)] pointer-events-none" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_50%,rgba(45,235,232,0.07),transparent_60%)] pointer-events-none" />

                        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                            <div className="flex items-start gap-5 max-w-xl">
                                <div className="w-12 h-12 rounded-xl bg-stellar-yellow/10 border border-stellar-yellow/30 flex items-center justify-center shrink-0">
                                    <Rocket className="w-6 h-6 text-stellar-yellow" />
                                </div>
                                <div>
                                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight uppercase italic leading-tight">
                                        {si.cta_title}
                                    </h2>
                                    <p className="text-sm sm:text-base text-gray-400 mt-2 leading-relaxed">
                                        {si.cta_subtitle}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto shrink-0">
                                <Link
                                    href="/docs?tab=blueprints"
                                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-stellar-yellow text-black font-black text-sm uppercase tracking-tight hover:bg-stellar-yellow/90 transition-all shadow-[0_10px_30px_rgba(255,215,0,0.2)]"
                                >
                                    <Code2 className="w-4 h-4" />
                                    {si.cta_button}
                                </Link>
                                <a
                                    href="https://discord.gg/nirium"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-white/5 border border-white/10 text-white font-bold text-sm uppercase tracking-tight hover:bg-white/10 transition-all"
                                >
                                    {si.cta_discord}
                                    <ArrowRight className="w-4 h-4" />
                                </a>
                            </div>
                        </div>

                        {/* Developer Ethics Footer */}
                        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 opacity-60 hover:opacity-100 transition-opacity">
                            <div className="flex items-center gap-3">
                                <Shield className="w-5 h-5 text-stellar-teal" />
                                <div className="text-left">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-stellar-teal">Developer Ethics & Conduct</div>
                                    <p className="text-[9px] text-gray-500 max-w-sm leading-tight mt-0.5">
                                        All products built with the Nirium SDK must adhere to the Stellar Community Code of Conduct. We enforce zero-tolerance for malicious agents, financial spam, or deceptive practices.
                                    </p>
                                </div>
                            </div>
                            <Link href="/terms" className="text-[10px] font-bold text-white/50 hover:text-stellar-teal transition-colors underline underline-offset-4 decoration-white/10">
                                Read Full Conduct Guidelines
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
