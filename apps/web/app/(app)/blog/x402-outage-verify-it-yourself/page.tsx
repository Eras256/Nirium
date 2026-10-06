"use client";

import Link from "next/link";
import {
    ArrowLeft,
    Calendar,
    Link2,
    Clock,
    ExternalLink,
    Wrench,
    CheckCircle2,
    Globe,
    Users,
    Eye,
} from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "../../../../context/LanguageContext";
import { posts } from "../posts";

const SLUG = "x402-outage-verify-it-yourself";

const EVIDENCE_LINKS = [
    {
        key: "evidence_tx1_label",
        href: "https://stellar.expert/explorer/public/tx/bf9a1ca6b9b157c7010f0774107e4140f8a7b0e3c6c0227908936447de9aac24",
        mono: "bf9a1ca6…9aac24",
    },
    {
        key: "evidence_tx2_label",
        href: "https://stellar.expert/explorer/public/tx/1de356eeaaf334719d04e0b47ac5b62a3dc821785852fe5bbbae2957b5e3b522",
        mono: "1de356ee…e3b522",
    },
    {
        key: "evidence_issue_label",
        href: "https://github.com/OpenZeppelin/relayer-plugin-x402-facilitator/issues/47",
        mono: "#47 · closed",
    },
    {
        key: "evidence_rootcause_label",
        href: "https://github.com/OpenZeppelin/relayer-plugin-x402-facilitator/issues/47#issuecomment-5634717619",
        mono: "@zeljkoX, Sep 11",
    },
    {
        key: "evidence_devlog_label",
        href: "https://github.com/nirium-protocol/nirium/blob/main/docs/devlog.md",
        mono: "docs/devlog.md",
    },
];

const IMPACT_CARDS = [
    { key: "openzeppelin", Icon: Wrench },
    { key: "fernando", Icon: CheckCircle2 },
    { key: "stellar", Icon: Globe },
    { key: "clients", Icon: Users },
    { key: "nirium", Icon: Eye },
] as const;

export default function X402OutageVerifyItYourselfPost() {
    const { t, language } = useLanguage();
    const meta = (t.blog.posts as Record<string, any>)[SLUG];
    const postMeta = posts.find((p) => p.slug === SLUG)!;
    const readLabel = `${postMeta.readMinutes} ${t.blog.min_read}`;

    return (
        <main className="min-h-screen bg-black text-white selection:bg-stellar-teal/30">
            <article className="max-w-3xl mx-auto px-6 pt-8 pb-24 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-stellar-teal/5 rounded-full blur-[100px] pointer-events-none -z-10" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                >
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white transition-colors mb-8"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        {t.blog.back_to_blog}
                    </Link>

                    <div className="flex items-center gap-3 mb-5 text-[11px] font-mono uppercase tracking-widest text-white/40">
                        <span className="px-2 py-0.5 rounded-full border border-stellar-teal/30 text-stellar-teal/80">
                            {meta.tag}
                        </span>
                        <span>{readLabel}</span>
                    </div>

                    <h1 className="text-3xl md:text-5xl font-black tracking-tighter leading-[1.02] mb-6">
                        {meta.h1}
                    </h1>

                    <div className="flex flex-wrap gap-4 mb-10 text-sm text-white/50">
                        <span className="inline-flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-stellar-teal/70" /> {meta.fact_date}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <Link2 className="w-4 h-4 text-stellar-teal/70" /> {meta.fact_network}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-stellar-teal/70" /> {meta.fact_duration}
                        </span>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="space-y-6 text-[17px] leading-relaxed text-gray-300 font-light"
                >
                    <p>{meta.p1}</p>
                    <p>{meta.p2}</p>

                    <h2 className="text-2xl font-bold text-white pt-4">{meta.h_fact}</h2>
                    <p>{meta.fact_p1}</p>
                    <p>{meta.fact_p2}</p>
                    <p>{meta.fact_p3}</p>

                    {/* Evidence box */}
                    <div className="my-2 rounded-2xl border border-stellar-teal/20 bg-white/[0.03] p-5 md:p-6">
                        <div className="mb-3 text-xs font-mono uppercase tracking-widest text-stellar-teal/80">
                            {meta.evidence_label}
                        </div>
                        <ul className="space-y-2.5">
                            {EVIDENCE_LINKS.map((item) => (
                                <li key={item.key}>
                                    <a
                                        href={item.href}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="group flex items-center justify-between gap-3 text-sm text-gray-300 hover:text-white transition-colors"
                                    >
                                        <span className="flex items-center gap-2 min-w-0">
                                            <ExternalLink className="w-3.5 h-3.5 shrink-0 text-white/30 group-hover:text-stellar-teal transition-colors" />
                                            <span className="truncate">{meta[item.key]}</span>
                                        </span>
                                        <span className="shrink-0 font-mono text-xs text-white/40 group-hover:text-stellar-teal/80 transition-colors">
                                            {item.mono}
                                        </span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <h2 className="text-2xl font-bold text-white pt-4">{meta.h_why}</h2>
                    <p>{meta.why_p1}</p>
                    <p className="text-xl font-semibold text-stellar-teal border-l-2 border-stellar-teal/40 pl-5 my-2">
                        {meta.why_p2}
                    </p>

                    <h2 className="text-2xl font-bold text-white pt-4">{meta.h_impact}</h2>
                    <p>{meta.impact_intro}</p>

                    {/* Impact grid */}
                    <div className="not-prose grid grid-cols-1 md:grid-cols-2 gap-4 my-2">
                        {IMPACT_CARDS.map(({ key, Icon }) => (
                            <div
                                key={key}
                                className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 md:p-6"
                            >
                                <div className="flex items-center gap-2 mb-2.5 text-white">
                                    <Icon className="w-4 h-4 text-stellar-teal/80" />
                                    <h3 className="text-base font-bold m-0">
                                        {meta[`impact_${key}_h`]}
                                    </h3>
                                </div>
                                <div className="space-y-2.5 text-sm leading-relaxed text-gray-400 font-light">
                                    {(meta[`impact_${key}_p`] as string)
                                        .split("\n\n")
                                        .map((para, i) => (
                                            <p key={i} className="m-0">
                                                {para}
                                            </p>
                                        ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <h2 className="text-2xl font-bold text-white pt-4">{meta.h_close}</h2>
                    <p>{meta.close_p1}</p>

                    <div className="rounded-2xl border border-stellar-teal/20 bg-stellar-teal/[0.04] p-6 mt-10">
                        <div className="flex items-center gap-2 mb-2 text-stellar-teal text-xs font-mono uppercase tracking-widest">
                            <Clock className="w-3.5 h-3.5" />
                            {meta.where_label}
                        </div>
                        <p className="text-gray-300 text-base m-0">{meta.where_body}</p>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="mt-12 pt-8 border-t border-white/10 flex flex-wrap items-center justify-between gap-4"
                >
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        {t.blog.all_articles}
                    </Link>
                    <Link
                        href="/developers"
                        className="inline-flex items-center gap-2 h-10 px-5 bg-white text-black text-sm font-bold rounded-full hover:bg-stellar-yellow transition-all uppercase tracking-tight"
                    >
                        {t.blog.see_product}
                    </Link>
                </motion.div>
            </article>
        </main>
    );
}
