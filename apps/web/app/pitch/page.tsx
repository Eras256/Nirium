/** Nirium — SCF Build Award readiness dossier (nirium.xyz/pitch)
 * Slide-deck format (vertical stack of numbered cards), same pattern as
 * kumply.xyz/pitch — no carousel JS, just a scrollable sequence of
 * self-contained slides, one idea per card.
 *
 * English-only, standalone from the i18n dictionaries on purpose: this page
 * is written for one audience (SCF panel reviewers and third-party
 * diligence), not general marketing copy. Every claim links to a primary
 * source — a Stellar Expert tx, a GitHub commit/PR, an npm/PyPI package
 * page — so a reviewer never has to take our word for anything.
 *
 * Framing note: Nirium is not an active SCF submission right now (three
 * prior prescreen rejections put it on a timeout). This deck is a readiness
 * dossier, structured against SCF's real Build Award panel-review criteria
 * (verified live against stellar.gitbook.io/scf-handbook), for whenever
 * that timeout clears — never worded as "under review" or "submitted."
 */
'use client';

import Link from "next/link";
import {
    ArrowUpRight, CheckCircle2, ShieldCheck, GitBranch, Package,
    Layers, ExternalLink, Hash, AlertTriangle, ChevronRight
} from "lucide-react";
import MinimalNav from "@/components/layout/MinimalNav";
import SnapshotBanner from "@/components/shared/SnapshotBanner";

const TOTAL_SLIDES = 13;

function Slide({ n, eyebrow, title, children }: { n: number; eyebrow: string; title?: string; children: React.ReactNode }) {
    return (
        <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-7 sm:p-12">
            <div className="flex justify-between items-baseline mb-7 gap-4">
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] font-bold text-stellar-teal">
                    {eyebrow}
                </span>
                <span className="font-mono text-xs text-gray-600 shrink-0">
                    {String(n).padStart(2, "0")} / {TOTAL_SLIDES}
                </span>
            </div>
            {title && (
                <h2 className="text-2xl sm:text-4xl font-black leading-tight tracking-tight mb-6">{title}</h2>
            )}
            {children}
        </section>
    );
}

function EvidenceLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-stellar-teal hover:text-stellar-yellow transition-colors underline decoration-stellar-teal/30 underline-offset-4 font-mono text-sm break-all"
        >
            {children}
            <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
        </a>
    );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`rounded-xl border border-white/10 bg-white/[0.03] p-5 sm:p-6 ${className}`}>
            {children}
        </div>
    );
}

const rebalanceTxs = [
    { hash: "b7bf6d7079aa128081ac2a5091cbff2da2b1e9f2157232209cf03eab00f840a9", time: "01:54:25 UTC", amount: "0.9999999 CETES" },
    { hash: "9f0e7e03cf3f17655b7e1b755c6a3fb5e65c499835424e440e601ecc8b68f033", time: "02:02:59 UTC", amount: "0.9999999 CETES" },
    { hash: "d8bec2b44a0b053d45f843aed21f87e217a2fe87d2761c1e2d3b04318f6330b1", time: "02:21:07 UTC", amount: "0.9999998 CETES" },
    { hash: "ccae5347739e1f65d319f4ce4c2b586661365ffc919e572a758fd2e11a9b7f45", time: "02:29:05 UTC", amount: "0.9999998 CETES" },
];

const mcpToolGroups = [
    { tier: "Free", count: 10 },
    { tier: "Authenticated", count: 9 },
    { tier: "Info", count: 1 },
    { tier: "Paid — x402", count: 3 },
    { tier: "Paid — MPP", count: 2 },
];

const packages = [
    { name: "nirium (npm)", version: "0.12.0", url: "https://www.npmjs.com/package/nirium" },
    { name: "nirium (PyPI)", version: "0.9.0", url: "https://pypi.org/project/nirium/" },
    { name: "nirium-cli (npm)", version: "1.0.5", url: "https://www.npmjs.com/package/nirium-cli" },
    { name: "nirium-mcp (npm)", version: "0.6.0", url: "https://www.npmjs.com/package/nirium-mcp" },
    { name: "nirium-pollar-adapter (npm)", version: "0.4.1", url: "https://www.npmjs.com/package/nirium-pollar-adapter" },
];

const nodes = [
    { name: "Settlement Node", desc: "x402 micropayments and MPP charge — an AI agent pays per-request in USDC via a signed Stellar authorization entry, verified by a facilitator, settled on-chain." },
    { name: "Treasury Node", desc: "The agent holds only the RebalanceManager role on a client-owned DeFindex vault. rebalance() accepts Invest and Unwind — neither accepts a destination address. Withdrawal isn't blocked, it's structurally absent." },
    { name: "Audit Trail Node", desc: "SHA-256 content hash anchored to IPFS, with an optional ed25519 signature (a Stellar G... address doubling as a public key) proving who declared a fact." },
    { name: "Payroll Node", desc: "Non-custodial batch USDC disbursement to up to 100 recipients in one classic Stellar transaction, with sponsored-reserve onboarding." },
    { name: "Reporting Node", desc: "Aggregation and export layer over the other four nodes' on-chain activity." },
];

export default function PitchPage() {
    return (
        <main className="min-h-screen bg-black text-white antialiased selection:bg-stellar-teal/30">
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,_rgba(45,235,232,0.08),transparent_70%)]" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black,transparent)]" />
            </div>

            <MinimalNav />
            <SnapshotBanner date="2026-09-14" />
            <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 pb-14 sm:pb-20 pt-8 flex flex-col gap-6">

                {/* COVER */}
                <Slide n={1} eyebrow="Readiness Dossier · August 2026">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-stellar-yellow/30 bg-stellar-yellow/10 text-stellar-yellow text-[10px] font-black uppercase tracking-[0.18em] mb-6">
                        Not an active SCF submission — timing note below
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-black leading-[1.05] tracking-tight mb-5">
                        Nirium — autonomous treasury &amp; agentic payments infrastructure for Stellar
                    </h1>
                    <p className="text-gray-400 leading-relaxed max-w-xl">
                        A developer SDK, CLI and MCP server that let any team give an AI agent a
                        Stellar-native way to get paid, move idle treasury without ever taking
                        custody, and anchor an immutable audit trail — shipped and verifiable
                        on-chain today, not proposed.
                    </p>
                    <p className="mt-5 text-xs text-gray-600 leading-relaxed max-w-xl">
                        Structured against the Stellar Community Fund&apos;s real Build Award
                        panel-review criteria, one slide per criterion, verified live against{" "}
                        <a href="https://stellar.gitbook.io/scf-handbook/scf-awards/build-award/submission-criteria" target="_blank" rel="noopener noreferrer" className="underline decoration-dotted">
                            stellar.gitbook.io/scf-handbook
                        </a>.
                    </p>
                </Slide>

                {/* PROBLEM */}
                <Slide n={2} eyebrow="Problem" title="Idle treasury, and no agent-native payment rail">
                    <p className="text-gray-400 leading-relaxed">
                        Corporate treasury sits idle in a bank account earning nothing while it
                        waits to be needed, and there&apos;s no Stellar-native way for an autonomous
                        AI agent to pay for a resource, or get paid for providing one, without a
                        human wiring a subscription or a card on file first. Both are integration
                        problems, not product problems — the primitives exist on Stellar, nobody
                        had packaged them into something a developer installs in one command.
                    </p>
                </Slide>

                {/* SOLUTION / ARCHITECTURE */}
                <Slide n={3} eyebrow="Stellar Use Case &amp; Technical Integration" title="Five nodes, one runtime, all on Stellar">
                    <p className="text-gray-400 mb-6 leading-relaxed">
                        An Express 5 agent runtime with a modular node architecture. Each node is
                        independently toggleable and none require trusting Nirium with custody.
                    </p>
                    <div className="space-y-3">
                        {nodes.map((node) => (
                            <div key={node.name} className="flex gap-3 p-4 rounded-lg border border-white/10 bg-white/[0.02]">
                                <Layers className="w-4 h-4 text-stellar-yellow shrink-0 mt-0.5" />
                                <div>
                                    <div className="font-black text-white text-sm mb-0.5">{node.name}</div>
                                    <p className="text-xs text-gray-400 leading-relaxed">{node.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <Card className="mt-5">
                        <p className="text-xs text-gray-400 leading-relaxed">
                            <strong className="text-white">Why DeFindex, not our own vault, for mainnet:</strong>{" "}
                            NiriumVault stays testnet-only, audit-gated. Mainnet treasury runs over a
                            third-party DeFindex vault audited by OtterSec (March 2025 — 16 findings,
                            13 vulnerabilities all marked resolved) on a Blend V2 strategy. Confirmed
                            independently: the deployed Etherfuse-strategy contract&apos;s WASM hashes to{" "}
                            <span className="font-mono text-gray-300">11329c24…5da988</span>, matching
                            the audited public 1.0.0 release exactly.
                        </p>
                    </Card>
                </Slide>

                {/* TRACTION — packages */}
                <Slide n={4} eyebrow="Product Readiness &amp; Traction" title="Working today — every claim clickable">
                    <div className="grid sm:grid-cols-2 gap-4">
                        <Card>
                            <div className="flex items-center gap-2 mb-3 text-stellar-teal">
                                <Package className="w-4 h-4" />
                                <span className="text-[11px] font-black uppercase tracking-widest">Published packages</span>
                            </div>
                            <ul className="space-y-2 text-sm">
                                {packages.map((p) => (
                                    <li key={p.name} className="flex justify-between items-baseline gap-2">
                                        <span className="text-gray-300 font-mono text-xs">{p.name}</span>
                                        <EvidenceLink href={p.url}>v{p.version}</EvidenceLink>
                                    </li>
                                ))}
                            </ul>
                        </Card>
                        <Card>
                            <div className="flex items-center gap-2 mb-3 text-stellar-teal">
                                <ShieldCheck className="w-4 h-4" />
                                <span className="text-[11px] font-black uppercase tracking-widest">MCP server — 25 tools</span>
                            </div>
                            <p className="text-[11px] text-gray-500 mb-3">
                                Counted directly from source, not carried over from an old draft.
                            </p>
                            <ul className="space-y-1 text-xs text-gray-300">
                                {mcpToolGroups.map((g) => (
                                    <li key={g.tier} className="flex justify-between gap-3">
                                        <span>{g.tier}</span>
                                        <span className="font-mono text-gray-500">{g.count}</span>
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    </div>
                </Slide>

                {/* TRACTION — mainnet txs */}
                <Slide n={5} eyebrow="Product Readiness &amp; Traction" title="Real mainnet transactions">
                    <p className="text-sm text-gray-400 mb-4 leading-relaxed">
                        Four real <code className="text-gray-300">Invest</code> operations confirmed
                        on mainnet, all 2026-08-06 — Nirium holds only the RebalanceManager role, the
                        vault is client-owned:
                    </p>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-gray-500 text-[11px] uppercase tracking-wider">
                                    <th className="pb-2 font-bold">Tx hash</th>
                                    <th className="pb-2 font-bold">Time (UTC)</th>
                                    <th className="pb-2 font-bold">Moved</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {rebalanceTxs.map((tx) => (
                                    <tr key={tx.hash}>
                                        <td className="py-2 pr-4">
                                            <EvidenceLink href={`https://stellar.expert/explorer/public/tx/${tx.hash}`}>
                                                {tx.hash.slice(0, 10)}…
                                            </EvidenceLink>
                                        </td>
                                        <td className="py-2 pr-4 text-gray-400 font-mono text-xs">{tx.time}</td>
                                        <td className="py-2 text-gray-400 font-mono text-xs">{tx.amount}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p className="mt-4 text-sm text-gray-400 leading-relaxed">
                        Plus the first x402 micropayment settled on mainnet, 2026-07-09:{" "}
                        <EvidenceLink href="https://stellar.expert/explorer/public/tx/3134a51c66091fd7fbd85b38a4a6ec6cd432bb92c2450eac84ea7855cb7558bc">
                            3134a51c…8bc
                        </EvidenceLink>.
                    </p>
                </Slide>

                {/* TRACTION — upstream */}
                <Slide n={6} eyebrow="Product Readiness &amp; Traction" title="Real upstream engagement">
                    <ul className="space-y-3 text-sm text-gray-300">
                        <li className="flex gap-2">
                            <CheckCircle2 className="w-4 h-4 text-stellar-teal shrink-0 mt-0.5" />
                            <span>
                                <EvidenceLink href="https://github.com/stellar/stellar-dev-skill/pull/96">stellar/stellar-dev-skill#96</EvidenceLink> — our
                                own fix, merged, listing Nirium in Stellar&apos;s official developer skills catalog.
                            </span>
                        </li>
                        <li className="flex gap-2">
                            <CheckCircle2 className="w-4 h-4 text-stellar-teal shrink-0 mt-0.5" />
                            <span>
                                <EvidenceLink href="https://github.com/x402-foundation/x402/issues/3171">x402-foundation/x402#3171</EvidenceLink> — bug
                                reported against our own production endpoint, fixed by an unrelated
                                external contributor (<EvidenceLink href="https://github.com/x402-foundation/x402/pull/3180">PR #3180</EvidenceLink>).
                            </span>
                        </li>
                        <li className="flex gap-2">
                            <GitBranch className="w-4 h-4 text-stellar-teal shrink-0 mt-0.5" />
                            <span>
                                Community-driven expansion via a GrantFox OSS campaign — 15 open,
                                labeled issues on{" "}
                                <EvidenceLink href="https://github.com/nirium-protocol/nirium-sdk/issues?q=is%3Aissue+label%3A%22Official+Campaign+%7C+Third+Campaign%22">
                                    nirium-protocol/nirium-sdk
                                </EvidenceLink>, 2 already assigned after a real technical-plan review.
                            </span>
                        </li>
                    </ul>
                </Slide>

                {/* WHY STELLAR */}
                <Slide n={7} eyebrow="Stellar Relevance" title="Stellar is the mechanism, not a detail">
                    <ul className="space-y-3 text-sm text-gray-300">
                        <li className="flex gap-3">
                            <ChevronRight className="w-4 h-4 text-stellar-yellow shrink-0 mt-0.5" />
                            <span><strong className="text-white">Non-custodial by contract, not by policy</strong> — the RebalanceManager role&apos;s inability to withdraw is a function signature with no destination-address parameter, enforced by the Soroban contract itself.</span>
                        </li>
                        <li className="flex gap-3">
                            <ChevronRight className="w-4 h-4 text-stellar-yellow shrink-0 mt-0.5" />
                            <span><strong className="text-white">Settlement only viable because finality is fast and fees near-zero</strong> — $0.02 micropayments only work because a Stellar tx confirms in seconds for fractions of a cent.</span>
                        </li>
                        <li className="flex gap-3">
                            <ChevronRight className="w-4 h-4 text-stellar-yellow shrink-0 mt-0.5" />
                            <span><strong className="text-white">Identity reuses Stellar&apos;s own keypairs</strong> — audit-trail ed25519 signatures decode directly from a Stellar G... address via StrKey, no separate identity system.</span>
                        </li>
                    </ul>
                </Slide>

                {/* BUILD READINESS */}
                <Slide n={8} eyebrow="Build Readiness" title="Already built, not a plan to build">
                    <ul className="space-y-3 text-sm text-gray-300">
                        <li className="flex gap-3"><ChevronRight className="w-4 h-4 text-stellar-teal shrink-0 mt-0.5" /> Two live API boxes: full testnet + a partial, receive-only mainnet box with no signing key on it, by design.</li>
                        <li className="flex gap-3"><ChevronRight className="w-4 h-4 text-stellar-teal shrink-0 mt-0.5" /> Mainnet rebalances signed by a separate process with its own key and zero HTTP surface.</li>
                        <li className="flex gap-3"><ChevronRight className="w-4 h-4 text-stellar-teal shrink-0 mt-0.5" /> A vault allowlist enforced in code before any signature — the agent refuses to sign for a vault it wasn&apos;t explicitly given.</li>
                        <li className="flex gap-3"><ChevronRight className="w-4 h-4 text-stellar-teal shrink-0 mt-0.5" /> Existing tools leveraged, not reimplemented: DeFindex for vault custody, Etherfuse for CETES on/off-ramp, OpenZeppelin&apos;s relayer as the x402 facilitator on mainnet.</li>
                    </ul>
                </Slide>

                {/* OPEN SOURCE */}
                <Slide n={9} eyebrow="Open Source Plan (for Smart Contracts)" title="Already open where it has to be">
                    <div className="grid sm:grid-cols-2 gap-4">
                        <Card>
                            <div className="text-[11px] font-black uppercase tracking-widest text-stellar-teal mb-2">Public today — Apache 2.0</div>
                            <p className="text-sm text-gray-400 leading-relaxed">
                                SDKs, CLI, MCP server, examples — <EvidenceLink href="https://github.com/nirium-protocol/nirium-sdk">nirium-protocol/nirium-sdk</EvidenceLink>.
                            </p>
                        </Card>
                        <Card>
                            <div className="text-[11px] font-black uppercase tracking-widest text-stellar-yellow mb-2">Contracts — testnet, open-source planned</div>
                            <p className="text-sm text-gray-400 leading-relaxed">
                                NiriumVault &amp; NiriumProtocol stay testnet-only until a funded audit — exactly what a Build Award would fund. Apache 2.0 release planned alongside it.
                            </p>
                        </Card>
                    </div>
                    <p className="mt-4 text-xs text-gray-500">SCF&apos;s requirement is scoped to smart contracts — the rest of the codebase is explicitly allowed to stay private.</p>
                </Slide>

                {/* BUDGET / TRANCHES */}
                <Slide n={10} eyebrow="Budget Alignment &amp; Tranche Structure" title="What a future ask would actually fund">
                    <p className="text-gray-400 leading-relaxed mb-5 text-sm">
                        Most MVP/testnet work is already live — a future ask is realistically scoped
                        to the independent audit and completing the mainnet path it gates. Dollar
                        amounts aren&apos;t fixed here; they&apos;d be set at actual submission per SCF&apos;s
                        Budget Guidelines.
                    </p>
                    <div className="space-y-3">
                        {[
                            { t: "T1 — MVP", d: "Largely complete: SDKs, CLI, MCP, x402/MPP, audit trail, payroll — all shipped." },
                            { t: "T2 — Testnet", d: "NiriumVault/NiriumProtocol testnet-complete with a documented threat model + on-chain monitoring plan, per SCF's Tranche 2 requirement." },
                            { t: "T3 — Mainnet", d: "Independent audit completed, findings remediated, contracts released Apache 2.0, mainnet deployment." },
                        ].map((tr) => (
                            <div key={tr.t} className="p-4 rounded-lg border border-white/10 bg-white/[0.02]">
                                <div className="font-black text-white text-sm mb-1">{tr.t}</div>
                                <p className="text-xs text-gray-400 leading-relaxed">{tr.d}</p>
                            </div>
                        ))}
                    </div>
                </Slide>

                {/* DIFFERENTIATION */}
                <Slide n={11} eyebrow="Ecosystem Value &amp; Differentiation" title="The rail is empty, the treasury thesis isn't">
                    <p className="text-gray-400 leading-relaxed mb-4 text-sm">
                        Tokenized treasury on Stellar has real, funded incumbents — Bando (SCF #42,
                        $75K) closest, same CETES-via-Etherfuse thesis. In a review of 728 catalogued
                        SCF-adjacent projects, agentic-payment primitives — x402, HTTP-native
                        facilitators — appeared in zero of them.
                    </p>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <Card>
                            <div className="text-[11px] font-black uppercase tracking-widest text-gray-500 mb-2">Bando &amp; similar</div>
                            <p className="text-sm text-gray-400">Dashboard for humans to manually move idle cash into CETES.</p>
                        </Card>
                        <Card>
                            <div className="text-[11px] font-black uppercase tracking-widest text-stellar-teal mb-2">Nirium</div>
                            <p className="text-sm text-gray-400">SDK + agent runtime other developers build on — treasury is one of five nodes, not the whole product.</p>
                        </Card>
                    </div>
                </Slide>

                {/* WHAT THIS DOESN'T CLAIM */}
                <Slide n={12} eyebrow="What This Deck Does Not Claim">
                    <ul className="space-y-2 text-sm text-gray-400">
                        <li className="flex gap-2"><AlertTriangle className="w-4 h-4 text-gray-600 shrink-0 mt-0.5" /> NiriumVault and NiriumProtocol have <strong className="text-gray-300">not</strong> been independently audited — they stay on testnet until they are.</li>
                        <li className="flex gap-2"><AlertTriangle className="w-4 h-4 text-gray-600 shrink-0 mt-0.5" /> Nirium does not currently custody client funds on mainnet, on any contract.</li>
                        <li className="flex gap-2"><AlertTriangle className="w-4 h-4 text-gray-600 shrink-0 mt-0.5" /> Nirium is a software provider; regulated activity in any flow is performed by the regulated partner in that flow.</li>
                        <li className="flex gap-2"><AlertTriangle className="w-4 h-4 text-gray-600 shrink-0 mt-0.5" /> This deck is not an active SCF submission and does not represent Nirium as currently under panel review.</li>
                    </ul>
                </Slide>

                {/* VERIFY EVERYTHING */}
                <Slide n={13} eyebrow="Verify Everything" title="No summary in between">
                    <div className="grid sm:grid-cols-2 gap-2.5 text-sm">
                        {[
                            { label: "SDK &amp; CLI source", href: "https://github.com/nirium-protocol/nirium-sdk" },
                            { label: "npm package", href: "https://www.npmjs.com/package/nirium" },
                            { label: "PyPI package", href: "https://pypi.org/project/nirium/" },
                            { label: "MCP server package", href: "https://www.npmjs.com/package/nirium-mcp" },
                            { label: "GrantFox campaign issues", href: "https://github.com/nirium-protocol/nirium-sdk/issues?q=is%3Aissue+label%3A%22Official+Campaign+%7C+Third+Campaign%22" },
                            { label: "DeFindex audit (OtterSec)", href: "https://github.com/paltalabs/defindex/tree/main/audits" },
                            { label: "First mainnet x402 tx", href: "https://stellar.expert/explorer/public/tx/3134a51c66091fd7fbd85b38a4a6ec6cd432bb92c2450eac84ea7855cb7558bc" },
                            { label: "SCF Build Award criteria", href: "https://stellar.gitbook.io/scf-handbook/scf-awards/build-award/submission-criteria" },
                        ].map((l) => (
                            <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-2 p-3 rounded-lg border border-white/10 bg-white/[0.02] hover:border-stellar-teal/40 transition-colors group">
                                <span className="text-gray-300 group-hover:text-white text-xs" dangerouslySetInnerHTML={{ __html: l.label }} />
                                <ExternalLink className="w-3.5 h-3.5 text-gray-600 group-hover:text-stellar-teal shrink-0" />
                            </a>
                        ))}
                    </div>
                    <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-[11px] text-gray-600">
                            Prepared by the Nirium team as a standalone reference. Not paid content, not a solicitation, not investment advice.
                        </p>
                        <Link href="/" className="text-xs font-black uppercase tracking-widest text-stellar-teal hover:text-stellar-yellow transition-colors flex items-center gap-1">
                            nirium.xyz <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </Slide>

            </div>
        </main>
    );
}
