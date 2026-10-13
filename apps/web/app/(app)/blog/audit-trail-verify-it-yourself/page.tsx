"use client";

import Link from "next/link";
import {
    ArrowLeft,
    Calendar,
    Link2,
    Clock,
    ExternalLink,
    Hash,
    KeyRound,
    Send,
    CheckCircle2,
    XCircle,
    EyeOff,
    Gauge,
} from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "../../../../context/LanguageContext";
import { posts } from "../posts";
import {
    ANCHOR_STEPS,
    REQUEST,
    RESPONSE,
    DOCUMENT,
    VERIFY_CODE,
    VERIFY_OUTPUT,
    EXAMPLE_CID,
    EXAMPLE_GATEWAY,
} from "./snippets";

const SLUG = "audit-trail-verify-it-yourself";

const EVIDENCE_LINKS = [
    {
        key: "evidence_info_label",
        href: "https://nirium-agent.fly.dev/api/audit/info",
        mono: "GET /api/audit/info",
    },
    {
        key: "evidence_doc_label",
        href: EXAMPLE_GATEWAY,
        mono: `${EXAMPLE_CID.slice(0, 8)}…${EXAMPLE_CID.slice(-6)}`,
    },
];

const STEPS = [
    { key: "step1", Icon: Hash },
    { key: "step2", Icon: KeyRound },
    { key: "step3", Icon: Send },
] as const;

const LIMITS = [
    { key: "limit1", Icon: CheckCircle2 },
    { key: "limit2", Icon: XCircle },
    { key: "limit3", Icon: EyeOff },
    { key: "limit4", Icon: Gauge },
] as const;

function Code({ children }: { children: string }) {
    return (
        <pre className="overflow-x-auto rounded-xl border border-white/10 bg-white/[0.03] p-4 text-[13px] leading-relaxed font-mono text-gray-300 whitespace-pre">
            <code>{children}</code>
        </pre>
    );
}

export default function AuditTrailVerifyItYourselfPost() {
    const { t } = useLanguage();
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

                    <h2 className="text-2xl font-bold text-white pt-4">{meta.h_how}</h2>
                    <p>{meta.how_intro}</p>

                    <div className="grid grid-cols-1 gap-4 my-2">
                        {STEPS.map(({ key, Icon }) => (
                            <div
                                key={key}
                                className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 md:p-6"
                            >
                                <div className="flex items-center gap-2 mb-2.5 text-white">
                                    <Icon className="w-4 h-4 text-stellar-teal/80" />
                                    <h3 className="text-base font-bold m-0">{meta[`${key}_h`]}</h3>
                                </div>
                                <p className="m-0 text-sm leading-relaxed text-gray-400 font-light">
                                    {meta[`${key}_p`]}
                                </p>
                            </div>
                        ))}
                    </div>

                    <h2 className="text-2xl font-bold text-white pt-4">{meta.h_example}</h2>
                    <p>{meta.example_p1}</p>
                    <Code>{ANCHOR_STEPS}</Code>
                    <p>{meta.example_p2}</p>
                    <Code>{REQUEST}</Code>
                    <p>{meta.example_p3}</p>
                    <Code>{RESPONSE}</Code>
                    <p>{meta.example_p4}</p>
                    <Code>{DOCUMENT}</Code>
                    <p>{meta.example_p5}</p>

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

                    <h2 className="text-2xl font-bold text-white pt-4">{meta.h_verify}</h2>
                    <p>{meta.verify_p1}</p>
                    <Code>{VERIFY_CODE}</Code>
                    <p>{meta.verify_p2}</p>
                    <Code>{VERIFY_OUTPUT}</Code>
                    <p>{meta.verify_p3}</p>

                    <h2 className="text-2xl font-bold text-white pt-4">{meta.h_limits}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-2">
                        {LIMITS.map(({ key, Icon }) => (
                            <div
                                key={key}
                                className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 md:p-6"
                            >
                                <div className="flex items-center gap-2 mb-2.5 text-white">
                                    <Icon className="w-4 h-4 text-stellar-teal/80" />
                                    <h3 className="text-base font-bold m-0">{meta[`${key}_h`]}</h3>
                                </div>
                                <p className="m-0 text-sm leading-relaxed text-gray-400 font-light">
                                    {meta[`${key}_p`]}
                                </p>
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
