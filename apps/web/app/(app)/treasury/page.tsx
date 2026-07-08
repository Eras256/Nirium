/** Nirium Treasury — Product page (Autonomous Treasury) **/
'use client';

import Link from "next/link";
import { motion } from "framer-motion";
import {
    Bot, TrendingUp, Workflow, Coins, ArrowRight, ChevronRight,
    Sparkles, Activity, Zap, BarChart3, RefreshCw, AlertTriangle,
    CheckCircle2, ExternalLink, Globe
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/context/LanguageContext";
import { ComplianceBanner } from "@/components/ui/ComplianceBanner";

export default function TreasuryPage() {
    const { t } = useLanguage();

    return (
        <main className="min-h-screen bg-black text-white antialiased">
            {/* HERO */}
            <section className="relative pt-8 pb-16 sm:pt-8 sm:pb-20">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(45,235,232,0.06),transparent_60%)]" />
                <div className="relative max-w-5xl mx-auto px-6">
                    <div className="flex justify-center mb-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-stellar-teal/20 bg-stellar-teal/5 text-stellar-teal text-xs font-mono">
                            <Sparkles className="w-3 h-3" />
                            {t.treasury_page.hero.badge}
                        </div>
                    </div>

                    <h1 className="text-center text-4xl sm:text-6xl font-black leading-[1.05] tracking-tight">
                        {t.treasury_page.hero.title}
                    </h1>
                    <p className="mt-6 text-center text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
                        {t.treasury_page.hero.subtitle}
                    </p>
                </div>
            </section>

            <div className="max-w-5xl mx-auto px-6 mb-12">
                <ComplianceBanner />
            </div>

            {/* HOW THE AGENT WORKS */}
            <section className="py-16 border-t border-white/5">
                <div className="max-w-5xl mx-auto px-6">
                    <h2 className="text-2xl sm:text-3xl font-bold text-center">
                        {t.treasury_page.how_it_works.title}
                    </h2>

                    <div className="mt-12 space-y-4">
                        {[
                            {
                                step: '01',
                                icon: BarChart3,
                                title: t.treasury_page.how_it_works.step1.title,
                                body: t.treasury_page.how_it_works.step1.body,
                            },
                            {
                                step: '02',
                                icon: Bot,
                                title: t.treasury_page.how_it_works.step2.title,
                                body: t.treasury_page.how_it_works.step2.body,
                            },
                            {
                                step: '03',
                                icon: RefreshCw,
                                title: t.treasury_page.how_it_works.step3.title,
                                body: t.treasury_page.how_it_works.step3.body,
                            },
                            {
                                step: '04',
                                icon: Zap,
                                title: t.treasury_page.how_it_works.step4.title,
                                body: t.treasury_page.how_it_works.step4.body,
                            },
                            {
                                step: '05',
                                icon: Activity,
                                title: t.treasury_page.how_it_works.step5.title,
                                body: t.treasury_page.how_it_works.step5.body,
                            },
                        ].map((item) => (
                            <div
                                key={item.step}
                                className="flex gap-4 p-5 rounded-xl border border-white/10 bg-white/[0.02] hover:border-stellar-teal/30 transition-colors"
                            >
                                <div className="shrink-0">
                                    <div className="p-2.5 rounded-lg bg-stellar-teal/10">
                                        <item.icon className="w-5 h-5 text-stellar-teal" />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="text-xs font-mono text-white/30">{item.step}</span>
                                        <h3 className="text-lg font-bold">{item.title}</h3>
                                    </div>
                                    <p className="text-sm text-white/60 leading-relaxed">{item.body}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* SUPPORTED ASSETS */}
            <section className="py-16 border-t border-white/5">
                <div className="max-w-5xl mx-auto px-6">
                    <h2 className="text-2xl sm:text-3xl font-bold text-center">
                        {t.treasury.sidebar.asset_selector}
                    </h2>
                    <p className="mt-4 text-center text-white/60">
                        {t.treasury_page.assets.coming_soon}
                    </p>

                    <div className="mt-12 grid md:grid-cols-2 gap-6">
                        {/* USDC */}
                        <div className="p-6 rounded-xl border border-white/10 bg-white/[0.02]">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                                        <Coins className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <div className="text-lg font-bold">USDC</div>
                                        <div className="text-xs text-white/40">{t.treasury_page.assets.usdc.desc}</div>
                                    </div>
                                </div>
                                <div className="text-xs uppercase tracking-widest text-emerald-400/80">
                                    {t.treasury_page.assets.usdc.status}
                                </div>
                            </div>
                            <div className="space-y-2 text-sm text-white/60">
                                <div className="flex justify-between">
                                    <span>{t.treasury_page.assets.usdc.yield_label}</span>
                                    <span className="text-white/50 text-xs italic">Variable — live from Blend</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>{t.treasury_page.assets.usdc.liquidity_label}</span>
                                    <span className="text-white">{t.treasury_page.assets.usdc.liquidity_value}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>{t.treasury_page.assets.usdc.risk_label}</span>
                                    <span className="text-white">{t.treasury_page.assets.usdc.risk_value}</span>
                                </div>
                            </div>
                        </div>

                        {/* Global Bonds */}
                        <div className="p-6 rounded-xl border border-[#00FFC3]/30 bg-[#00FFC3]/[0.03]">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-[#00FFC3]/20 flex items-center justify-center">
                                        <TrendingUp className="w-5 h-5 text-[#00FFC3]" />
                                    </div>
                                    <div>
                                        <div className="text-lg font-bold">{t.treasury_page.assets.bonds.title}</div>
                                        <div className="text-xs text-white/40">{t.treasury_page.assets.bonds.desc}</div>
                                    </div>
                                </div>
                                <div className="text-xs uppercase tracking-widest text-stellar-teal">
                                    Live
                                </div>
                            </div>
                            <div className="space-y-2 text-sm text-white/60">
                                <div className="flex justify-between">
                                    <span>{t.treasury_page.assets.bonds.yield_label}</span>
                                    <span className="text-white">~5.57% <span className="text-white/40 text-xs">(Banxico ref.)</span></span>
                                </div>
                                <div className="flex justify-between">
                                    <span>{t.treasury_page.assets.bonds.liquidity_label}</span>
                                    <span className="text-white">{t.treasury_page.assets.bonds.liquidity_value}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>{t.treasury_page.assets.bonds.rating_label}</span>
                                    <span className="text-white">{t.treasury_page.assets.bonds.rating_value}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            {/* OUTPUT: CROSS-BORDER */}
            <section className="py-16 border-t border-white/5">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="flex items-start gap-4 mb-8">
                        <div className="p-2.5 rounded-lg bg-stellar-teal/10 shrink-0">
                            <Globe className="w-5 h-5 text-stellar-teal" />
                        </div>
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-bold">
                                {t.treasury_page.cross_border.title}
                            </h2>
                            <p className="mt-2 text-white/60">
                                {t.treasury_page.cross_border.subtitle}
                            </p>
                        </div>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
                        <div className="grid sm:grid-cols-3 gap-4 text-center">
                            <div>
                                <div className="text-xs uppercase tracking-widest text-white/40 mb-2">
                                    {t.treasury_page.cross_border.traditional}
                                </div>
                                <div className="text-2xl font-black text-red-400/70">~4.5%</div>
                                <div className="text-xs text-white/50 mt-1">Western Union</div>
                            </div>
                            <div className="border-x border-white/5">
                                <div className="text-xs uppercase tracking-widest text-white/40 mb-2">
                                    {t.treasury_page.cross_border.best_crypto}
                                </div>
                                <div className="text-2xl font-black text-yellow-400/80">1.5%</div>
                                <div className="text-xs text-white/50 mt-1">Bridge</div>
                            </div>
                            <div>
                                <div className="text-xs uppercase tracking-widest text-stellar-teal mb-2">
                                    {t.treasury_page.cross_border.nirium}
                                </div>
                                <div className="text-2xl font-black text-stellar-teal">~0.8%</div>
                                <div className="text-xs text-white/50 mt-1">{t.treasury_page.cross_border.total_to_user}</div>
                            </div>
                        </div>
                        <p className="mt-6 text-sm text-white/50 text-center max-w-2xl mx-auto leading-relaxed">
                            {t.treasury_page.cross_border.explanation}
                        </p>
                    </div>
                </div>
            </section>

            {/* HUMAN VS AGENT PATHS */}
            <section className="py-16 border-t border-white/5">
                <div className="max-w-5xl mx-auto px-6">
                    <h2 className="text-2xl sm:text-3xl font-bold text-center">
                        {t.treasury_page.paths.title}
                    </h2>

                    <div className="mt-12 grid md:grid-cols-2 gap-6">
                        <div className="p-6 rounded-xl border border-white/10 bg-white/[0.02]">
                            <div className="text-xs uppercase tracking-widest text-white/40 mb-3">
                                {t.treasury_page.paths.path1.label}
                            </div>
                            <h3 className="text-lg font-bold mb-3">{t.treasury_page.paths.path1.title}</h3>
                            <p className="text-sm text-white/60 mb-4 leading-relaxed">
                                {t.treasury_page.paths.path1.desc}
                            </p>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2 text-white/70">
                                    <CheckCircle2 className="w-4 h-4 text-stellar-teal" />
                                    {t.treasury_page.paths.path1.item1}
                                </div>
                                <div className="flex items-center gap-2 text-white/70">
                                    <CheckCircle2 className="w-4 h-4 text-stellar-teal" />
                                    {t.treasury_page.paths.path1.item2}
                                </div>
                                <div className="flex items-center gap-2 text-white/70">
                                    <CheckCircle2 className="w-4 h-4 text-stellar-teal" />
                                    {t.treasury_page.paths.path1.item3}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 rounded-xl border border-stellar-teal/30 bg-stellar-teal/[0.03]">
                            <div className="text-xs uppercase tracking-widest text-stellar-teal mb-3">
                                {t.treasury_page.paths.path2.label}
                            </div>
                            <h3 className="text-lg font-bold mb-3">{t.treasury_page.paths.path2.title}</h3>
                            <p className="text-sm text-white/60 mb-4 leading-relaxed">
                                {t.treasury_page.paths.path2.desc}
                            </p>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2 text-white/70">
                                    <CheckCircle2 className="w-4 h-4 text-stellar-teal" />
                                    {t.treasury_page.paths.path2.item1}
                                </div>
                                <div className="flex items-center gap-2 text-white/70">
                                    <CheckCircle2 className="w-4 h-4 text-stellar-teal" />
                                    {t.treasury_page.paths.path2.item2}
                                </div>
                                <div className="flex items-center gap-2 text-white/70">
                                    <CheckCircle2 className="w-4 h-4 text-stellar-teal" />
                                    {t.treasury_page.paths.path2.item3}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* DEEP LINKS */}
            <section className="py-16 border-t border-white/5">
                <div className="max-w-5xl mx-auto px-6">
                    <h2 className="text-2xl sm:text-3xl font-bold text-center">
                        {t.treasury_page.links.title}
                    </h2>
                    <div className="mt-10 grid md:grid-cols-3 gap-4">
                        {[
                            {
                                label: 'Strategy Builder',
                                desc: t.treasury_page.links.builder,
                                href: '/treasury/builder',
                            },
                            {
                                label: 'Soroban 2-of-3 Vault',
                                desc: t.treasury_page.links.security,
                                href: '/security',
                            },
                            {
                                label: 'Audit Trail + IPFS',
                                desc: t.treasury_page.links.compliance,
                                href: '/compliance',
                            },
                        ].map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="group p-5 rounded-xl border border-white/10 bg-white/[0.02] hover:border-stellar-teal/30 transition-colors"
                            >
                                <div className="text-sm font-bold mb-1 text-white">{link.label}</div>
                                <div className="text-xs text-white/50 mb-3">{link.desc}</div>
                                <div className="text-xs text-stellar-teal/80 group-hover:text-stellar-teal flex items-center gap-1.5">
                                    {t.treasury_page.links.view}
                                    <ChevronRight className="w-3 h-3" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 border-t border-white/5">
                <div className="max-w-3xl mx-auto px-6 text-center">
                    <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
                        {t.treasury_page.cta.title}
                    </h2>
                    <p className="mt-4 text-white/60">
                        {t.treasury_page.cta.subtitle}
                    </p>
                    <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
                        <Link href="/sandbox">
                            <Button size="lg" variant="premium">
                                {t.treasury_page.cta.start}
                                <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </Link>
                        <Link href="/pricing">
                            <Button size="lg" variant="outline" className="border-white/20 hover:bg-white/5">
                                {t.treasury_page.cta.pricing}
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
