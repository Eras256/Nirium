"use client";

import Link from "next/link";
import { ArrowLeft, Calendar, MapPin, Building2, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "../../../../context/LanguageContext";
import { posts } from "../posts";

const SLUG = "bbva-open-deal-room";
const localeFor = (lang: string) => (lang === "es" ? "es-MX" : "en-US");

export default function BbvaOpenDealRoomPost() {
    const { t, language } = useLanguage();
    const meta = (t.blog.posts as Record<string, any>)[SLUG];
    const postMeta = posts.find((p) => p.slug === SLUG)!;
    const readLabel = `${postMeta.readMinutes} ${t.blog.min_read}`;

    return (
        <main className="min-h-screen bg-black text-white selection:bg-stellar-teal/30">
            <article className="max-w-3xl mx-auto px-6 pt-8 pb-24 relative overflow-hidden">
                {/* Background decor */}
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

                    {/* Event facts strip */}
                    <div className="flex flex-wrap gap-4 mb-10 text-sm text-white/50">
                        <span className="inline-flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-stellar-teal/70" /> {meta.fact_date}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-stellar-teal/70" /> {meta.fact_place}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <Building2 className="w-4 h-4 text-stellar-teal/70" /> {meta.fact_startups}
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

                    <h2 className="text-2xl font-bold text-white pt-4">{meta.h_pitch}</h2>
                    <blockquote className="my-2 rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
                        <p className="text-2xl md:text-3xl font-bold tracking-tight text-white leading-snug m-0">
                            &ldquo;{meta.pitch_hook_quote}&rdquo;
                        </p>
                        <cite className="block mt-4 text-sm not-italic text-white/40 font-mono uppercase tracking-widest">
                            {meta.pitch_hook_attr}
                        </cite>
                    </blockquote>
                    <p>{meta.pitch_problem}</p>
                    <p>{meta.pitch_solution}</p>
                    <p>{meta.pitch_team}</p>

                    <h2 className="text-2xl font-bold text-white pt-4">{meta.h_presented}</h2>
                    <p>{meta.presented_p1}</p>
                    <p>{meta.presented_p2}</p>

                    <p className="text-xl font-semibold text-stellar-teal border-l-2 border-stellar-teal/40 pl-5 my-2">
                        {meta.pattern_quote}
                    </p>

                    <h2 className="text-2xl font-bold text-white pt-4">{meta.h_venue}</h2>
                    <p>{meta.venue_p1}</p>

                    <h2 className="text-2xl font-bold text-white pt-4">{meta.h_takeaway}</h2>
                    <p>{meta.takeaway_p1}</p>

                    <div className="rounded-2xl border border-stellar-teal/20 bg-stellar-teal/[0.04] p-6 mt-10">
                        <div className="flex items-center gap-2 mb-2 text-stellar-teal text-xs font-mono uppercase tracking-widest">
                            <Shield className="w-3.5 h-3.5" />
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
                        href="/treasury"
                        className="inline-flex items-center gap-2 h-10 px-5 bg-white text-black text-sm font-bold rounded-full hover:bg-stellar-yellow transition-all uppercase tracking-tight"
                    >
                        {t.blog.see_product}
                    </Link>
                </motion.div>
            </article>
        </main>
    );
}
