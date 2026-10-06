/** Nirium Play — HackMeridian evidence page (nirium.xyz/nirium-play)
 * Standalone from the (app) shell, same pattern as /pitch and
 * /branding-nirium: MinimalNav only, no sidebar/navbar. Unlike those two,
 * this page is fully bilingual and actually retranslates on language
 * switch (dictionaries/{en,es}.json under `nirium_play_page`) — the
 * MinimalNav toggle isn't decorative here.
 *
 * Brand identity reused from packages already shipped by the branding-pack
 * skill run for Nirium (see /branding-nirium): the gold N-stroke mark
 * (#F5D57A → #D4AF37 → #8B6F2E gradient) and the site's real theme tokens
 * (#0A0A0C dark / #F5F3EF light), not invented colors.
 *
 * Every fact on this page (the PR links, the tx hashes, the Trustless Work
 * merge acknowledgments) was independently verified against the GitHub API
 * and Horizon before this file was written — see the commit history for
 * that verification. The Trustless Work merge comments are cited because
 * they were independently checked (real account, bio says "CEO Trustless
 * Work", real comment text on the real PRs) — not because of an
 * unverifiable social-media claim about a tweet, which this page
 * deliberately does not cite.
 */
'use client';

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import MinimalNav from "@/components/layout/MinimalNav";
import { useLanguage } from "@/context/LanguageContext";

const GOLD_GRADIENT_ID = "niriumPlayGold";

function NiriumMark({ className = "" }: { className?: string }) {
    return (
        <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
            <defs>
                <linearGradient id={GOLD_GRADIENT_ID} x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                    <stop offset="0" stopColor="#F5D57A" />
                    <stop offset="0.5" stopColor="#D4AF37" />
                    <stop offset="1" stopColor="#8B6F2E" />
                </linearGradient>
            </defs>
            <path d="M25,85 L25,15 L75,85 L75,15" fill="none" stroke={`url(#${GOLD_GRADIENT_ID})`} strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="25" cy="15" r="7" className="fill-[#F5F3EF] dark:fill-[#0A0A0C]" />
            <circle cx="50" cy="50" r="7" className="fill-[#F5F3EF] dark:fill-[#0A0A0C]" />
            <circle cx="75" cy="85" r="7" className="fill-[#F5F3EF] dark:fill-[#0A0A0C]" />
        </svg>
    );
}

function Badge({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
    return (
        <span
            className={
                "font-mono text-[11px] sm:text-xs px-3 py-1.5 rounded-full border inline-flex items-center gap-1.5 " +
                (accent
                    ? "border-[#D4AF37]/60 bg-[#D4AF37]/10 text-[#8B6F2E] dark:text-[#F5D57A] font-semibold"
                    : "border-black/10 dark:border-white/10 text-black/60 dark:text-white/60")
            }
        >
            {children}
        </span>
    );
}

function FlowStep({ n, title, desc }: { n: string; title: string; desc: string }) {
    return (
        <div className="flex-1 p-4 sm:p-5 border-b sm:border-b-0 sm:border-r border-black/10 dark:border-white/10 last:border-0">
            <div className="font-mono text-xs text-[#8B6F2E] dark:text-[#D4AF37] mb-2">{n}</div>
            <div className="font-semibold text-sm mb-1">{title}</div>
            <div className="text-xs text-black/60 dark:text-white/50">{desc}</div>
        </div>
    );
}

function EvidenceCard({
    kind,
    title,
    desc,
    href,
    linkLabel,
    hash,
}: {
    kind: "pr" | "tx";
    title: string;
    desc?: string;
    href: string;
    linkLabel: string;
    hash?: string;
}) {
    return (
        <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/[0.03] p-4 sm:p-5 flex flex-wrap items-center gap-x-4 gap-y-2">
            <span
                className={
                    "font-mono text-[10px] font-bold tracking-wide px-2 py-0.5 rounded shrink-0 " +
                    (kind === "pr"
                        ? "bg-[#D4AF37]/15 text-[#8B6F2E] dark:text-[#F5D57A]"
                        : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400")
                }
            >
                {kind.toUpperCase()}
            </span>
            <span className="font-semibold text-sm flex-1 min-w-[180px]">{title}</span>
            <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs shrink-0 whitespace-nowrap border border-black/10 dark:border-white/15 rounded-md px-2.5 py-1 text-[#8B6F2E] dark:text-[#F5D57A] hover:border-[#D4AF37] transition-colors inline-flex items-center gap-1"
            >
                {linkLabel}
                <ExternalLink size={11} />
            </a>
            {desc && <span className="w-full text-xs text-black/50 dark:text-white/40 order-3">{desc}</span>}
            {hash && <span className="w-full font-mono text-xs text-black/40 dark:text-white/35 order-3 break-all">{hash}</span>}
        </div>
    );
}

export default function NiriumPlayPage() {
    const { t } = useLanguage();
    const c = t.nirium_play_page;

    return (
        <main className="min-h-screen bg-[#F5F3EF] dark:bg-[#0A0A0C] text-[#0A0A0C] dark:text-[#F5F3EF] antialiased">
            <div className="bg-black">
                <MinimalNav />
            </div>

            <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-20">
                {/* Header */}
                <div className="flex items-center gap-2 mb-5">
                    <NiriumMark className="w-6 h-6 shrink-0" />
                    <span className="font-mono text-[11px] sm:text-xs uppercase tracking-[0.14em] text-[#8B6F2E] dark:text-[#D4AF37] font-semibold">
                        {c.eyebrow} ·{" "}
                        <a
                            href="https://meridian.stellar.org/hackmeridian"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline decoration-dotted hover:text-[#D4AF37]"
                        >
                            {c.eyebrow_event}
                        </a>
                    </span>
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.08] mb-4 max-w-2xl">
                    {c.title}
                </h1>
                <p className="text-base sm:text-lg text-black/60 dark:text-white/60 max-w-xl mb-6">
                    {c.subtitle}
                </p>

                <div className="flex flex-wrap gap-2 mb-12 sm:mb-16">
                    <Badge>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        {c.badge_settled}
                    </Badge>
                    <Badge>{c.badge_stack}</Badge>
                    <Badge>{c.badge_bugs}</Badge>
                    <Link
                        href="/nirium-play/game/"
                        className="font-mono text-[11px] sm:text-xs px-4 py-1.5 rounded-full font-bold inline-flex items-center gap-1.5 text-[#0A0A0C] bg-gradient-to-br from-[#F5D57A] via-[#D4AF37] to-[#8B6F2E] hover:opacity-90 transition-opacity"
                    >
                        ▶ {c.play_cta}
                    </Link>
                </div>

                {/* Flow */}
                <section className="mb-12 sm:mb-16">
                    <h2 className="text-base sm:text-lg font-bold mb-1.5">{c.flow_title}</h2>
                    <p className="text-xs sm:text-sm text-black/50 dark:text-white/50 mb-5 max-w-xl">{c.flow_note}</p>
                    <div className="flex flex-col sm:flex-row rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/[0.02] overflow-hidden">
                        <FlowStep n="01" title={c.flow_1_title} desc={c.flow_1_desc} />
                        <FlowStep n="02" title={c.flow_2_title} desc={c.flow_2_desc} />
                        <FlowStep n="03" title={c.flow_3_title} desc={c.flow_3_desc} />
                        <FlowStep n="04" title={c.flow_4_title} desc={c.flow_4_desc} />
                    </div>
                </section>

                {/* Evidence */}
                <section className="mb-12 sm:mb-16">
                    <h2 className="text-base sm:text-lg font-bold mb-1.5">{c.evidence_title}</h2>
                    <p className="text-xs sm:text-sm text-black/50 dark:text-white/50 mb-5 max-w-xl">{c.evidence_note}</p>
                    <div className="flex flex-col gap-2.5">
                        <EvidenceCard
                            kind="pr"
                            title={c.pr87_title}
                            desc={c.pr87_desc}
                            href="https://github.com/nirium-protocol/nirium/pull/87"
                            linkLabel={c.pr87_link}
                        />
                        <EvidenceCard
                            kind="pr"
                            title={c.pr88_title}
                            desc={c.pr88_desc}
                            href="https://github.com/nirium-protocol/nirium/pull/88"
                            linkLabel={c.pr88_link}
                        />
                        <EvidenceCard
                            kind="pr"
                            title={c.pr89_title}
                            desc={c.pr89_desc}
                            href="https://github.com/nirium-protocol/nirium/pull/89"
                            linkLabel={c.pr89_link}
                        />
                        <EvidenceCard
                            kind="tx"
                            title={c.tx_editor_title}
                            hash="3e0beb9993222ccfa62150304e4a9bb402226630cf3923082ff0cf256f12c811"
                            href="https://stellar.expert/explorer/testnet/tx/3e0beb9993222ccfa62150304e4a9bb402226630cf3923082ff0cf256f12c811"
                            linkLabel={c.tx_link}
                        />
                        <EvidenceCard
                            kind="tx"
                            title={c.tx_second_title}
                            hash="09a5378081e48352e4140c3782b33db238d872273205c700aa7800380299e1aa"
                            href="https://stellar.expert/explorer/testnet/tx/09a5378081e48352e4140c3782b33db238d872273205c700aa7800380299e1aa"
                            linkLabel={c.tx_link}
                        />
                        <EvidenceCard
                            kind="tx"
                            title={c.tx_browser_title}
                            hash="53436eb549600517d9c6e098cee6776db2be5fb48e3c6d9020db9b5fea384c60"
                            href="https://stellar.expert/explorer/testnet/tx/53436eb549600517d9c6e098cee6776db2be5fb48e3c6d9020db9b5fea384c60"
                            linkLabel={c.tx_link}
                        />
                    </div>
                </section>

                {/* External validation — Trustless Work */}
                <section className="mb-12 sm:mb-16">
                    <h2 className="text-base sm:text-lg font-bold mb-1.5">{c.external_title}</h2>
                    <p className="text-xs sm:text-sm text-black/50 dark:text-white/50 mb-5 max-w-xl">{c.external_note}</p>
                    <div className="flex flex-col gap-2.5">
                        <EvidenceCard
                            kind="pr"
                            title={c.tw1_title}
                            desc={c.tw1_desc}
                            href="https://github.com/Trustless-Work/agentic-escrow-research/pull/1"
                            linkLabel={c.tw_link}
                        />
                        <EvidenceCard
                            kind="pr"
                            title={c.tw2_title}
                            desc={c.tw2_desc}
                            href="https://github.com/Trustless-Work/agentic-escrow-research/pull/2"
                            linkLabel={c.tw_link}
                        />
                        <EvidenceCard
                            kind="pr"
                            title={c.tw3_title}
                            desc={c.tw3_desc}
                            href="https://github.com/Trustless-Work/agentic-escrow-research/pull/3"
                            linkLabel={c.tw_link}
                        />
                        <EvidenceCard
                            kind="pr"
                            title={c.tw4_title}
                            desc={c.tw4_desc}
                            href="https://github.com/Trustless-Work/agentic-escrow-research/pull/4"
                            linkLabel={c.tw_link}
                        />
                    </div>
                </section>

                {/* Pending / honest caveat */}
                <section className="mb-12">
                    <div className="rounded-xl border border-dashed border-black/15 dark:border-white/15 bg-black/[0.02] dark:bg-white/[0.02] p-5 sm:p-6">
                        <span className="font-mono text-[10px] uppercase tracking-wider text-black/50 dark:text-white/40 border border-black/10 dark:border-white/10 rounded-full px-2.5 py-1 inline-block mb-3">
                            {c.pending_tag}
                        </span>
                        <h3 className="font-semibold text-sm mb-1.5">{c.pending_title}</h3>
                        <p className="text-xs sm:text-[13.5px] text-black/60 dark:text-white/50 max-w-xl leading-relaxed">
                            {c.pending_body}
                        </p>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-black/10 dark:border-white/10 pt-5 flex flex-wrap justify-between gap-3 text-xs sm:text-sm text-black/50 dark:text-white/40">
                    <span>{c.footer_tagline}</span>
                    <span className="flex gap-2">
                        <a href="https://nirium.xyz" target="_blank" rel="noopener noreferrer" className="hover:text-[#D4AF37]">
                            nirium.xyz
                        </a>
                        ·
                        <a
                            href="https://github.com/nirium-protocol/nirium"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-[#D4AF37]"
                        >
                            GitHub
                        </a>
                    </span>
                </footer>
            </div>
        </main>
    );
}
