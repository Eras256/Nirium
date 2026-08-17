"use client";

import Link from "next/link";
import { ArrowUpRight, Newspaper } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "../../../context/LanguageContext";
import { posts } from "./posts";

const localeFor = (lang: string) => (lang === "es" ? "es-MX" : "en-US");

export default function BlogPage() {
    const { t, language } = useLanguage();
    const fmtDate = (iso: string) =>
        new Date(iso).toLocaleDateString(localeFor(language), { year: "numeric", month: "long", day: "numeric" });

    return (
        <main className="min-h-screen bg-black text-white selection:bg-stellar-teal/30">
            <div className="max-w-5xl mx-auto px-6 pt-8 pb-24 relative overflow-hidden">
                {/* Background decor */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-stellar-teal/5 rounded-full blur-[100px] pointer-events-none -z-10" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-stellar-yellow/5 rounded-full blur-[100px] pointer-events-none -z-10" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 border border-white/20 rounded-full text-xs font-mono text-gray-400 uppercase tracking-widest">
                        <Newspaper className="w-3 h-3" />
                        {t.blog.badge}
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-[0.95] uppercase mb-4">
                        {t.blog.heading_lead} <span className="text-stellar-teal">{t.blog.heading_accent}</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-400 font-light leading-relaxed mb-16 max-w-2xl">
                        {t.blog.intro}
                    </p>
                </motion.div>

                <div className="flex flex-col gap-5">
                    {posts.map((post, i) => {
                        const meta = (t.blog.posts as Record<string, any>)[post.slug];
                        if (!meta) return null;
                        return (
                            <motion.div
                                key={post.slug}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 + i * 0.07 }}
                            >
                                <Link
                                    href={`/blog/${post.slug}`}
                                    className="group block rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-8 hover:border-stellar-teal/30 hover:bg-white/[0.04] transition-all"
                                >
                                    <div className="flex items-center gap-3 mb-4 text-[11px] font-mono uppercase tracking-widest text-white/40">
                                        <span className="px-2 py-0.5 rounded-full border border-stellar-teal/30 text-stellar-teal/80">
                                            {meta.tag}
                                        </span>
                                        <span>{fmtDate(post.date)}</span>
                                        <span className="text-white/20">·</span>
                                        <span>{post.readMinutes} {t.blog.min_read}</span>
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3 group-hover:text-stellar-teal transition-colors">
                                        {meta.title}
                                    </h2>
                                    <p className="text-gray-400 font-light leading-relaxed mb-4 max-w-3xl">
                                        {meta.excerpt}
                                    </p>
                                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/70 group-hover:text-white transition-colors">
                                        {t.blog.read_article}
                                        <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                    </span>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </main>
    );
}
