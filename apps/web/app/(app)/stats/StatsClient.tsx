/** Nirium - Public Usage Stats. Every number is fetched live from a
 *  third-party source (Horizon, npm, PyPI, GitHub) at /api/stats - nothing
 *  here is hardcoded or updated by hand. See that route's source for the
 *  exact queries. No strategy, no rejections, no budgets on this page. */
'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ExternalLink, Loader2, RefreshCcw } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

type Freshness = { status: 'live' | 'stale' | 'unavailable'; asOf: string | null; error: string | null };

interface StatsResponse {
    generatedAt: string;
    freshness: {
        x402: Freshness; rebalances: Freshness; reporting: Freshness; pypi: Freshness; externalPRs: Freshness; community: Freshness;
        npm: Record<string, Freshness>;
    };
    x402Settlements: null | {
        totalSettlements: number;
        distinctPayers: number;
        externalPayerCount: number;
        externalSettlements: number;
        integrationTests: {
            ledger: null | { freshness?: Freshness; pageUrl: string; apiUrl: string; ok: false; status: number | null } | {
                freshness?: Freshness;
                pageUrl: string; apiUrl: string; ok: true; chainVerified: boolean; entriesRead: number;
                found: { txHash: string; seq: number; at: string; resource: string; httpStatus: number | null; verdict: string; amountUsdc: number; network: string; requestedByNirium: boolean }[];
            };
            address: string; shortName: string | null; count: number; firstAt: string; lastAt: string; hashes: string[];
            funding: { funder: string; funderIsNirium: boolean; startingBalanceXlm: number; ownSwapToUsdc: boolean } | null;
        }[];
        payers: {
            address: string; count: number; firstAt: string; lastAt: string; totalUsdc: number | null; hashes: string[];
            kind: 'internal' | 'external' | 'integration-test'; label: string | null; shortName: string | null; note: string; evidenceUrl: string | null;
            funding: { funder: string; funderIsNirium: boolean; startingBalanceXlm: number; ownSwapToUsdc: boolean } | null;
        }[];
        firstAt: string | null;
        lastAt: string | null;
        source: string;
        explorer: string;
    };
    escrowReleases: null | {
        count: number;
        allInternal: boolean;
        toReceiverUsdc: number;
        feeUsdc: number;
        totalUsdc: number;
        items: { hash: string; at: string; contract: string; fn: string | null; signer?: string; toReceiverUsdc: number; feeUsdc: number; totalUsdc: number; internal: boolean }[];
        note: string;
        source: string;
    };
    treasuryRebalances: null | { total: number; lastAt: string | null; source: string; explorer: string };
    auditTrailAnchors: { count: number | null; latestCid: string | null; unlabeledCount: number | null; source: string; note: string };
    payoutsSettledRuns: { count: number | null; source: string };
    npm: Record<string, null | { package: string; downloads: number | null; source: string; npmUrl?: string }>;
    pypi: null | { total: number; since: string; firstUpload: string | null; fullHistory: boolean; days: number; source: string; humanUrl?: string };
    externalMergedPRs: null | {
        count: number;
        unavailable?: number;
        items: { title: string; url: string; repo: string; number: number; mergedAt: string; mergedBy?: string }[];
    };
    builtWithNirium: (
        | {
            kind: 'x402-seller';
            githubUser: string;
            endpoint: string;
            repoUrl: string;
            packageJsonUrl: string;
            sourceRefs: { label: string; url: string }[];
            checks: {
                endpoint: { checked: boolean; is402: boolean; status: number | null; error?: string };
                packageJson: { checked: boolean; dependsOnNirium: boolean; version: string | null; error?: string };
            };
            settlements: { checked: boolean; payTo: string | null; count: number | null; source?: string; error?: string | null; freshness?: Freshness };
        }
        | {
            kind: 'connector';
            company: string;
            companyUrl: string;
            connectorUrl: string;
            network: 'testnet' | 'mainnet' | 'unknown';
            statedScope: { privateProofOfConcept: boolean; noRealFunds: boolean };
            checks: { checked: boolean; ok: boolean; status: number | null; mentionsNirium: boolean; error?: string };
        }
    )[];
    integrations: {
        name: string;
        description: string;
        demoUrl: string;
        badge: string;
        network: 'testnet' | 'mainnet' | 'unknown';
        links: { label: string; url: string }[];
        origin?: { text: string; links: { label: string; url: string; status: string | null }[] };
        checks: { ok: boolean; items: { label: string; ok: boolean; detail?: string }[] };
    }[];
    communityContributions:
        | null
        | { available: false; status: number | null; source: string }
        | {
            available: true;
            reposScanned: number;
            campaigns: { count: number; items: { name: string; bountyIssues: number }[] };
            bountyIssues: { total: number };
            mergedPRs: { count: number; linkedToGrantfoxIssue: number; items: { repo: string; number: number; title: string; url: string; author: string; mergedAt: string; linkedToGrantfoxIssue: boolean }[] };
            closedIssues: { count: number; items: { repo: string; number: number; title: string; url: string; author: string; closedAt: string; grantfoxLabeled: boolean }[] };
            failedRequests: number;
            platformUrl: string;
            source: string;
            note: string;
        };
}

const INSTAWARDS = [
    {
        label: { en: 'Instaward #1', es: 'Instaward #1' },
        hash: 'fd0f7469ae78b76ca5c4186cd7e1b24c081c407758a92cff3a56f376d01e91d1',
    },
    {
        label: { en: 'Instaward #2', es: 'Instaward #2' },
        hash: '7784ad6eb2b27ace75ce2fe4b7290fb1b8241da425331bfbda2e939b47759b7e',
    },
];

function fmtDate(iso: string | null, lang: (en: string, es: string) => string): string {
    if (!iso) return lang('never', 'nunca');
    return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
}

function fmtUtc(iso: string | null): string {
    return iso ? `${iso.replace('T', ' ').slice(0, 19)} UTC` : '-';
}

// Shown next to any card whose third-party source failed: the last good value
// with its UTC read time, or an explicit "nothing to show" - never a number
// without a date.
function Stale({ f, lang }: { f: Freshness | undefined; lang: (en: string, es: string) => string }) {
    if (!f || f.status === 'live') return null;
    return (
        <span className="block text-xs text-amber-300/90">
            {f.status === 'stale'
                ? lang(`source failed (${f.error}). Showing the last good value, read ${fmtUtc(f.asOf)}.`, `la fuente falló (${f.error}). Se muestra el último valor bueno, leído ${fmtUtc(f.asOf)}.`)
                : lang(`source failed (${f.error}) and there is no earlier read on record. Nothing shown rather than a guess.`, `la fuente falló (${f.error}) y no hay una lectura anterior registrada. No se muestra nada en vez de adivinar.`)}
        </span>
    );
}

const EMPTY_X402: NonNullable<StatsResponse['x402Settlements']> = {
    totalSettlements: 0, distinctPayers: 0, externalPayerCount: 0, externalSettlements: 0, integrationTests: [], payers: [],
    firstAt: null, lastAt: null, source: 'https://horizon.stellar.org', explorer: 'https://stellar.expert/explorer/public',
};
const EMPTY_ESCROW: NonNullable<StatsResponse['escrowReleases']> = {
    count: 0, allInternal: false, toReceiverUsdc: 0, feeUsdc: 0, totalUsdc: 0, items: [], note: '', source: 'https://horizon.stellar.org',
};

function fundingSentence(
    p: NonNullable<StatsResponse['x402Settlements']>['payers'][number],
    lang: (en: string, es: string) => string,
): string | null {
    const f = p.funding;
    if (!f) return null;
    if (p.kind === 'integration-test' && f.funderIsNirium) {
        return lang(
            'wallet initially funded by Nirium\u2019s founder',
            'wallet fondeada inicialmente por el fundador de Nirium',
        );
    }
    const who = p.shortName ?? lang('the operator', 'el operador');
    const xlm = Number.isInteger(f.startingBalanceXlm) ? String(f.startingBalanceXlm) : f.startingBalanceXlm.toFixed(2);
    if (f.funderIsNirium) {
        return lang(
            `wallet initially funded with ${xlm} XLM by Nirium's founder; ${f.ownSwapToUsdc ? `${who}'s own key and USDC swap` : `${who}'s own key`}`,
            `wallet fondeada inicialmente con ${xlm} XLM por el fundador de Nirium; llave${f.ownSwapToUsdc ? ' y swap a USDC' : ''} de ${who}`,
        );
    }
    return lang(
        `wallet initially funded with ${xlm} XLM by another account (${f.funder.slice(0, 8)}…), not one we control`,
        `wallet fondeada inicialmente con ${xlm} XLM por otra cuenta (${f.funder.slice(0, 8)}…), que no es nuestra`,
    );
}

function StatCard({
    label, value, sourceUrl, sourceLabel, footnote,
}: { label: string; value: React.ReactNode; sourceUrl: string; sourceLabel: string; footnote?: React.ReactNode }) {
    return (
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 flex flex-col gap-2">
            <span className="text-xs font-mono uppercase tracking-widest text-white/50">{label}</span>
            <span className="text-4xl font-black tracking-tight text-white">{value}</span>
            {footnote}
            <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-xs text-stellar-teal hover:underline"
            >
                {sourceLabel} <ExternalLink className="w-3 h-3" />
            </a>
        </div>
    );
}

export default function StatsClient({ initialData }: { initialData: StatsResponse }) {
    const { language } = useLanguage();
    const lang = (en: string, es: string) => (language === 'es' ? es : en);

    const [data, setData] = useState<StatsResponse | null>(initialData);
    const [error, setError] = useState<string | null>(null);

    const load = () => {
        setError(null);
        fetch('/api/stats')
            .then((r) => {
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                return r.json();
            })
            .then(setData)
            .catch((e) => setError(String(e?.message ?? e)));
    };

    // Data already arrived server-rendered (see page.tsx) - what a visitor,
    // a crawler, or Wayback Machine's save-page fetch sees on first paint is
    // the same numbers this page reports, not a loading state. `load()` below
    // stays wired to the manual refresh button only.

    const F = data?.freshness;
    const xs = data?.x402Settlements ?? EMPTY_X402;
    const esc = data?.escrowReleases ?? EMPTY_ESCROW;
    const rb = data?.treasuryRebalances ?? { total: 0, lastAt: null, source: 'https://horizon.stellar.org', explorer: 'https://stellar.expert/explorer/public' };
    const py = data?.pypi ?? null;
    const prs = data?.externalMergedPRs ?? { count: 0, unavailable: 0, items: [] };
    const com = data?.communityContributions ?? { available: false as const, status: null, source: 'https://api.github.com/orgs/nirium-protocol/repos' };
    const noX = !data?.x402Settlements;

    return (
        <main className="min-h-screen bg-black text-white antialiased">
            {/* HERO */}
            <section className="relative pt-8 pb-12 sm:pt-8 sm:pb-16">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(45,235,232,0.06),transparent_60%)]" />
                <div className="relative max-w-5xl mx-auto px-6">
                    <h1 className="text-4xl sm:text-6xl font-black leading-[1.05] tracking-tight">
                        {lang('Usage.', 'Uso.')}{' '}
                        <span className="bg-gradient-to-r from-stellar-teal to-stellar-yellow bg-clip-text text-transparent">
                            {lang('Not claims.', 'No promesas.')}
                        </span>
                    </h1>
                    <p className="mt-6 text-lg text-white/60 max-w-2xl">
                        {lang(
                            'Every number below is fetched live from a third-party source - Horizon, npm, PyPI, GitHub - at the moment you load this page. Nothing here is typed in by hand. Each card links to the exact query that produced it.',
                            'Cada número de abajo se lee en vivo de una fuente de terceros - Horizon, npm, PyPI, GitHub - al momento en que cargas esta página. Nada aquí se escribe a mano. Cada tarjeta enlaza a la consulta exacta que lo produjo.')}
                    </p>
                    {data && (
                        <p className="mt-4 text-xs font-mono text-white/40">
                            {lang('Generated', 'Generado')} {new Date(data.generatedAt).toLocaleString(undefined, { timeZone: 'UTC' })} UTC · {lang('dates on this page are UTC', 'las fechas de esta página son UTC')} ·{' '}
                            <button onClick={load} className="inline-flex items-center gap-1 text-stellar-teal hover:underline">
                                <RefreshCcw className="w-3 h-3" /> {lang('refresh', 'actualizar')}
                            </button>
                            {' '}· <a href="/api/stats" target="_blank" rel="noopener noreferrer" className="text-stellar-teal hover:underline">{lang('raw JSON', 'JSON crudo')}</a>
                        </p>
                    )}
                </div>
            </section>

            {error && (
                <div className="max-w-5xl mx-auto px-6 mb-8">
                    <div className="rounded-lg border border-red-500/30 bg-red-500/5 text-red-300 text-sm p-4">
                        {lang('Could not load live stats: ', 'No se pudieron cargar los stats en vivo: ')}{error}
                    </div>
                </div>
            )}

            {!data && !error && (
                <div className="max-w-5xl mx-auto px-6 py-24 flex justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-white/40" />
                </div>
            )}

            {data && (
                <>
                    {/* MAINNET USAGE */}
                    <section className="py-10 border-t border-white/5">
                        <div className="max-w-5xl mx-auto px-6">
                            <div className="flex items-center gap-2 mb-6">
                                <span className="px-2 py-0.5 rounded bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 text-[10px] font-mono uppercase tracking-widest">
                                    Mainnet
                                </span>
                                <h2 className="text-xl font-bold">{lang('Real, on-chain activity', 'Actividad real, on-chain')}</h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <StatCard
                                    label={lang('x402 settlements - total', 'Liquidaciones x402 - total')}
                                    value={noX ? '-' : xs.totalSettlements}
                                    sourceUrl={xs.explorer}
                                    sourceLabel="stellar.expert"
                                    footnote={
                                        <span className="text-xs text-white/40">
                                            {!noX && <>{xs.distinctPayers} {lang('distinct payers - most of it our own testing, labeled below', 'pagadores distintos - casi todo son pruebas nuestras, etiquetadas abajo')}</>}
                                            <Stale f={F?.x402} lang={lang} />
                                        </span>
                                    }
                                />
                                <StatCard
                                    label={lang('x402 - external payers', 'x402 - pagadores externos')}
                                    value={noX ? '-' : xs.externalPayerCount}
                                    sourceUrl={xs.explorer}
                                    sourceLabel="stellar.expert"
                                    footnote={
                                        <span className="text-xs text-white/40 space-y-1 block">
                                            <Stale f={F?.x402} lang={lang} />
                                            {!noX && <span className="block">
                                                {xs.externalPayerCount === 0
                                                    ? lang('0 today - not counting the third-party integration test listed below', '0 por ahora - sin contar la prueba de integración de un tercero listada abajo')
                                                    : `${xs.externalSettlements} ${lang('settlements', 'liquidaciones')}`}
                                            </span>}
                                            {xs.integrationTests.map((t) => {
                                                const pp = xs.payers.find((x) => x.address === t.address);
                                                return (
                                                    <span key={t.address} className="block text-amber-300/80">
                                                        {lang('Integration test', 'Prueba de integración')} · {fmtDate(t.firstAt, lang)}{t.lastAt.slice(0, 10) !== t.firstAt.slice(0, 10) ? ` - ${fmtDate(t.lastAt, lang)}` : ''}: {t.count} {lang('settlements', 'liquidaciones')} - {lang('integration tests by a third party', 'pruebas de integración de un tercero')} ({t.shortName ?? t.address.slice(0, 8)}){pp && fundingSentence(pp, lang) ? `; ${fundingSentence(pp, lang)}` : ''}
                                                    </span>
                                                );
                                            })}
                                        </span>
                                    }
                                />
                                <StatCard
                                    label={lang('Treasury Node rebalances', 'Rebalanceos del Treasury Node')}
                                    value={data?.treasuryRebalances ? rb.total : '-'}
                                    sourceUrl={rb.explorer}
                                    sourceLabel="stellar.expert"
                                    footnote={
                                        <span className="text-xs text-white/40">
                                            {data?.treasuryRebalances && <>{lang('last', 'último')}: {fmtDate(rb.lastAt, lang)}</>}
                                            <Stale f={F?.rebalances} lang={lang} />
                                        </span>
                                    }
                                />
                                <StatCard
                                    label={lang('Audit Trail anchors - mainnet', 'Anclajes de Audit Trail - mainnet')}
                                    value={data.auditTrailAnchors.count ?? '-'}
                                    sourceUrl={data.auditTrailAnchors.source}
                                    sourceLabel={lang("Nirium's own live API", 'API propia de Nirium, en vivo')}
                                    footnote={
                                        <span className="text-xs text-white/40">
                                            <Stale f={F?.reporting} lang={lang} />
                                            {data.auditTrailAnchors.count === null
                                                ? null
                                                : data.auditTrailAnchors.unlabeledCount
                                                ? lang(`${data.auditTrailAnchors.unlabeledCount} older anchors carry no network label - not counted here. Own API, not a third party.`, `${data.auditTrailAnchors.unlabeledCount} anclajes antiguos sin etiqueta de red - no se cuentan aquí. API propia, no un tercero.`)
                                                : lang('own API, not a third party - verify by calling it yourself', 'API propia, no un tercero - verifícalo llamándola tú mismo')}
                                        </span>
                                    }
                                />
                                <StatCard
                                    label={lang('Payroll runs', 'Corridas de Payroll')}
                                    value={data.payoutsSettledRuns.count ?? '-'}
                                    sourceUrl={data.payoutsSettledRuns.source}
                                    sourceLabel={lang("Nirium's own live API", 'API propia de Nirium, en vivo')}
                                    footnote={<span className="text-xs text-white/40">{lang('What the Payroll node registers today (mainnet-labeled). Mainnet is invite-only.', 'Lo que el nodo de Payroll registra hoy (etiquetado mainnet). Mainnet es solo por invitación.')}<Stale f={F?.reporting} lang={lang} /></span>}
                                />
                                <StatCard
                                    label={lang('Milestone releases via Trustless Work escrow (mainnet)', 'Liberaciones de milestone vía escrow de Trustless Work (mainnet)')}
                                    value={data?.escrowReleases ? esc.count : '-'}
                                    sourceUrl={esc.count === 1 ? `https://stellar.expert/explorer/public/tx/${esc.items[0].hash}` : esc.source}
                                    sourceLabel={esc.count === 1 ? `Horizon · ${esc.items[0].hash.slice(0, 8)}…` : 'Horizon'}
                                    footnote={
                                        <span className="text-xs text-white/40">
                                            {!data?.escrowReleases ? null : esc.allInternal
                                                ? lang(`internal test with our own accounts, ${esc.totalUsdc.toFixed(2)} USDC, no client`, `prueba interna con nuestras propias cuentas, ${esc.totalUsdc.toFixed(2)} USDC, sin cliente`)
                                                : lang('read from Horizon: release from the escrow contract to the receiving account', 'leído de Horizon: release desde el contrato de escrow a la cuenta receptora')}
                                            {data?.escrowReleases && <span className="block mt-1">
                                                {lang(
                                                    `${esc.toReceiverUsdc} to the receiving account + ${esc.feeUsdc} fee to Trustless Work`,
                                                    `${esc.toReceiverUsdc} a la cuenta receptora + ${esc.feeUsdc} de fee a Trustless Work`)}
                                            </span>}
                                            <Stale f={F?.x402} lang={lang} />
                                        </span>
                                    }
                                />
                            </div>

                            <div className="mt-6 rounded-lg border border-white/10 bg-white/[0.02] p-4">
                                <p className="text-xs font-mono uppercase tracking-widest text-white/40 mb-3">
                                    {lang('Every distinct payer, labeled', 'Cada pagador distinto, etiquetado')}
                                </p>
                                <div className="space-y-4">
                                    {xs.payers.map((p) => (
                                        <div key={p.address} className="flex flex-wrap items-start justify-between gap-2 text-xs">
                                            <div className="min-w-0 max-w-2xl">
                                                <a
                                                    href={`https://stellar.expert/explorer/public/account/${p.address}`}
                                                    target="_blank" rel="noopener noreferrer"
                                                    className="font-mono text-stellar-teal hover:underline"
                                                >
                                                    {p.address.slice(0, 8)}…{p.address.slice(-6)}
                                                </a>
                                                {p.label && <span className="text-white/80 ml-2">{p.label}</span>}
                                                <p className="text-white/50 mt-0.5 leading-relaxed">{p.note}</p>
                                                {p.kind !== 'internal' && fundingSentence(p, lang) && (
                                                    <p className="text-amber-300/80 mt-0.5 leading-relaxed">{fundingSentence(p, lang)}</p>
                                                )}
                                                <p className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
                                                    {p.evidenceUrl && (
                                                        <a href={p.evidenceUrl} target="_blank" rel="noopener noreferrer" className="text-stellar-teal hover:underline inline-flex items-center gap-1">
                                                            {lang('operator’s public statement', 'declaración pública del operador')} <ExternalLink className="w-3 h-3" />
                                                        </a>
                                                    )}
                                                    {p.kind !== 'internal' && p.hashes.map((h) => (
                                                        <a key={h} href={`https://stellar.expert/explorer/public/tx/${h}`} target="_blank" rel="noopener noreferrer" className="font-mono text-white/40 hover:text-stellar-teal">
                                                            {h.slice(0, 8)}…
                                                        </a>
                                                    ))}
                                                </p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-widest ${p.kind === 'internal' ? 'bg-white/5 text-white/40 border border-white/10' : p.kind === 'integration-test' ? 'bg-amber-400/10 text-amber-300 border border-amber-400/20' : 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20'}`}>
                                                    {p.kind === 'internal' ? lang('internal', 'interna') : p.kind === 'integration-test' ? lang('integration test', 'prueba de integración') : lang('external', 'externa')}
                                                </span>
                                                <p className="text-white/40 mt-1">{p.count} {p.count === 1 ? lang('payment', 'pago') : lang('payments', 'pagos')} · {fmtDate(p.firstAt, lang)}{p.lastAt.slice(0, 10) !== p.firstAt.slice(0, 10) ? ` - ${fmtDate(p.lastAt, lang)}` : ''}{p.totalUsdc !== null ? ` · ${p.totalUsdc.toFixed(2)} USDC` : ''}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* DOWNLOADS */}
                    <section className="py-10 border-t border-white/5">
                        <div className="max-w-5xl mx-auto px-6">
                            <h2 className="text-xl font-bold mb-6">{lang('Package downloads', 'Descargas de paquetes')}</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {Object.entries(data.npm).map(([name, pkg]) => (
                                    <StatCard
                                        key={name}
                                        label={`npm: ${name}`}
                                        value={pkg?.downloads ?? '-'}
                                        sourceUrl={pkg?.npmUrl ?? `https://www.npmjs.com/package/${name}`}
                                        sourceLabel={lang('last 12 months, npmjs.org', 'últimos 12 meses, npmjs.org')}
                                        footnote={<Stale f={F?.npm[name]} lang={lang} />}
                                    />
                                ))}
                                <StatCard
                                    label="PyPI: nirium"
                                    value={py ? py.total : '-'}
                                    sourceUrl={py?.humanUrl ?? 'https://pypistats.org/packages/nirium'}
                                    sourceLabel={py?.fullHistory
                                        ? lang('total since the first release, pypistats.org', 'total desde el primer release, pypistats.org')
                                        : lang('last 180 days (all pypistats keeps), pypistats.org', 'últimos 180 días (lo único que conserva pypistats), pypistats.org')}
                                    footnote={
                                        <span className="text-xs text-white/40">
                                            {py && (py.fullHistory
                                                ? lang(`all downloads since ${py.firstUpload}, excluding mirrors`, `todas las descargas desde ${py.firstUpload}, sin contar mirrors`)
                                                : lang(`from ${py.since}, excluding mirrors. pypistats keeps only ~180 days, so this is not the all-time total`, `desde ${py.since}, sin contar mirrors. pypistats solo conserva ~180 días, así que no es el total histórico`))}
                                            <Stale f={F?.pypi} lang={lang} />
                                        </span>
                                    }
                                />
                            </div>
                        </div>
                    </section>

                    {/* EXTERNAL VALIDATION */}
                    <section className="py-10 border-t border-white/5">
                        <div className="max-w-5xl mx-auto px-6">
                            <h2 className="text-xl font-bold mb-2">{lang('External merged PRs', 'PRs externos mergeados')}</h2>
                            <p className="text-sm text-white/50 mb-6">
                                {lang(
                                    'Pull requests we opened against repositories we don’t control, merged by their own maintainers.',
                                    'Pull requests que abrimos contra repositorios que no controlamos, mergeados por sus propios maintainers.')}
                            </p>
                            <Stale f={F?.externalPRs} lang={lang} />
                            {!!prs.unavailable && (
                                <p className="mb-3 text-xs text-red-400">
                                    {lang(`${prs.unavailable} PR lookups failed (GitHub unavailable or rate-limited) - the list below may be incomplete.`, `${prs.unavailable} consultas de PR fallaron (GitHub no disponible o con límite) - la lista de abajo puede estar incompleta.`)}
                                </p>
                            )}
                            <div className="rounded-xl border border-white/10 divide-y divide-white/5">
                                {prs.items.map((pr) => (
                                    <a
                                        key={pr.url}
                                        href={pr.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-between gap-4 p-4 hover:bg-white/[0.02] transition-colors"
                                    >
                                        <div className="min-w-0">
                                            <p className="text-sm text-white truncate">{pr.title}</p>
                                            <p className="text-xs text-white/40 font-mono mt-0.5">
                                                {pr.repo}#{pr.number} · {fmtDate(pr.mergedAt, lang)}
                                                {pr.mergedBy && <> · {lang('merged by', 'mergeado por')} @{pr.mergedBy}</>}
                                            </p>
                                        </div>
                                        <ArrowUpRight className="w-4 h-4 text-white/30 shrink-0" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* INTEGRATIONS / DEMOS - built BY Nirium, distinct from third parties building on their own */}
                    {data.integrations.length > 0 && (
                        <section className="py-10 border-t border-white/5">
                            <div className="max-w-5xl mx-auto px-6">
                                <h2 className="text-xl font-bold mb-2">{lang('Integrations and demos', 'Integraciones y demos')}</h2>
                                <p className="text-sm text-white/50 mb-6">
                                    {lang(
                                        'Built by Nirium - distinct from "Built with Nirium" below, where third parties build on their own. Every check runs live on each load; a failing check turns the card red.',
                                        'Construido por Nirium - distinto de "Built with Nirium" abajo, donde terceros construyen por su cuenta. Cada chequeo corre en vivo en cada carga; si uno falla, la tarjeta se pone en rojo.')}
                                </p>
                                <div className="space-y-4">
                                    {data.integrations.map((i) => {
                                        const failing = i.checks.items.filter((c) => !c.ok);
                                        return (
                                            <div key={i.demoUrl} className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
                                                <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                                                    <span className="text-lg font-bold text-white">{i.name}</span>
                                                    <div className="flex gap-2">
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-widest border ${i.checks.ok ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                                            {i.checks.ok
                                                                ? lang('checks: all live', 'chequeos: todos en vivo')
                                                                : lang(`FAILED: ${failing.map((c) => c.label).join('; ')}`, `FALLÓ: ${failing.map((c) => c.label).join('; ')}`)}
                                                        </span>
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-widest border ${i.network === 'unknown' ? 'bg-white/5 text-white/40 border-white/10' : 'bg-amber-400/10 text-amber-400 border-amber-400/20'}`}>
                                                            {i.network}
                                                        </span>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-white/50 mb-1">{i.description}</p>
                                                <p className="text-xs text-white/40 font-mono mb-3">{i.badge}</p>
                                                <ul className="mb-3 space-y-0.5">
                                                    {i.checks.items.map((c) => (
                                                        <li key={c.label} className={`text-[11px] font-mono ${c.ok ? 'text-white/40' : 'text-red-400'}`}>
                                                            {c.ok ? '\u2713' : '\u2717'} {c.label}{c.detail ? ` - ${c.detail}` : ''}
                                                        </li>
                                                    ))}
                                                </ul>
                                                {i.origin && (
                                                    <p className="text-xs text-white/50 mb-3">
                                                        {i.origin.text}{' '}
                                                        {i.origin.links.map((l) => (
                                                            <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" className="text-stellar-teal hover:underline mr-2">
                                                                {l.label}{l.status ? ` (${l.status})` : ''}
                                                            </a>
                                                        ))}
                                                    </p>
                                                )}
                                                <div className="flex flex-wrap gap-3">
                                                    <a href={i.demoUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-stellar-teal hover:underline inline-flex items-center gap-1">
                                                        {lang('open', 'abrir')} <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                    {i.links.map((l) => (
                                                        <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" className="text-xs text-stellar-teal hover:underline inline-flex items-center gap-1">
                                                            {l.label} <ExternalLink className="w-3 h-3" />
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </section>
                    )}

                    {/* COMMUNITY CONTRIBUTIONS (GrantFox) - never counted as organic adoption; no claim about payment */}
                    <section className="py-10 border-t border-white/5">
                        <div className="max-w-5xl mx-auto px-6">
                            <h2 className="text-xl font-bold mb-2">{lang('Community contributions', 'Contribuciones de la comunidad')}</h2>
                            <p className="text-sm text-white/60 mb-1">
                                {lang('Merged PRs from external contributors in GrantFox campaigns.', 'PRs mergeados de contribuidores externos en campañas de GrantFox.')}
                            </p>
                            <p className="text-xs text-white/40 mb-6">
                                {lang(
                                    'Not counted in "external payers" or in "Built with Nirium", and not organic adoption. No amounts are shown, and this page says nothing about whether any bounty was settled - that is decided by GrantFox.',
                                    'No se cuentan en "pagadores externos" ni en "Built with Nirium", y no son adopción orgánica. No se muestran montos, y esta página no dice nada sobre si algún bounty se liquidó - eso lo decide GrantFox.')}
                            </p>
                            {!com.available ? (
                                <div className="rounded-lg border border-red-500/30 bg-red-500/5 text-red-300 text-sm p-4">
                                    {lang('GitHub source unavailable right now', 'Fuente de GitHub no disponible ahora')} ({com.status ?? 'network'})
                                    <Stale f={F?.community} lang={lang} />
                                </div>
                            ) : (
                                <>
                                    <div className="mb-3"><Stale f={F?.community} lang={lang} /></div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                                        <StatCard
                                            label={lang('GrantFox campaigns (labeled in the repo)', 'Campañas de GrantFox (etiquetadas en el repo)')}
                                            value={com.campaigns.count}
                                            sourceUrl="https://github.com/nirium-protocol/nirium/labels"
                                            sourceLabel="GitHub labels"
                                            footnote={<span className="text-xs text-white/40">{com.campaigns.items.map((c) => `${c.name}: ${c.bountyIssues}`).join(' · ')} {lang('bounty issues (a reposted issue can carry two campaigns)', 'issues de bounty (uno repostado puede llevar dos campañas)')}</span>}
                                        />
                                        <StatCard
                                            label={lang('Community PRs merged', 'PRs de la comunidad mergeados')}
                                            value={com.mergedPRs.count}
                                            sourceUrl={`https://github.com/nirium-protocol/nirium/pulls?q=is%3Apr+is%3Amerged+-author%3AEras256+-author%3AM0nsxx+-author%3Aapp%2Fdependabot`}
                                            sourceLabel="GitHub"
                                            footnote={<span className="text-xs text-white/40">{com.mergedPRs.linkedToGrantfoxIssue} {lang('linked to a GrantFox-labeled issue', 'vinculados a un issue con etiqueta GrantFox')} · {com.bountyIssues.total} {lang('bounty issues published in total', 'issues de bounty publicados en total')}</span>}
                                        />
                                        <StatCard
                                            label={lang('Issues opened by external contributors, closed as completed', 'Issues abiertos por contribuidores externos, cerrados como completados')}
                                            value={com.closedIssues.count}
                                            sourceUrl={`https://github.com/nirium-protocol/nirium/issues?q=is%3Aissue+is%3Aclosed+-author%3AEras256+-author%3AM0nsxx`}
                                            sourceLabel="GitHub"
                                            footnote={<span className="text-xs text-white/40">{lang('the bounty issues are written by our team, so they are not in this count', 'los issues de bounty los escribe nuestro equipo, así que no entran en esta cuenta')}</span>}
                                        />
                                    </div>
                                    <div className="rounded-xl border border-white/10 divide-y divide-white/5">
                                        {[...com.mergedPRs.items.map((x) => ({ ...x, kind: 'PR' as const, at: x.mergedAt })), ...com.closedIssues.items.map((x) => ({ ...x, kind: 'issue' as const, at: x.closedAt }))]
                                            .sort((a, b) => (a.at < b.at ? 1 : -1))
                                            .map((x) => (
                                                <a key={x.url} href={x.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-4 p-4 hover:bg-white/[0.02] transition-colors">
                                                    <div className="min-w-0">
                                                        <p className="text-sm text-white truncate">{x.title}</p>
                                                        <p className="text-xs text-white/40 font-mono mt-0.5">
                                                            {x.kind} · {x.repo}#{x.number} · @{x.author} · {fmtDate(x.at, lang)}
                                                        </p>
                                                    </div>
                                                    <ArrowUpRight className="w-4 h-4 text-white/30 shrink-0" />
                                                </a>
                                            ))}
                                    </div>
                                    <p className="mt-3 text-xs text-white/40">
                                        {lang('Platform: ', 'Plataforma: ')}
                                        <a href={com.platformUrl} target="_blank" rel="noopener noreferrer" className="text-stellar-teal hover:underline">GrantFox</a>
                                        {' · '}{lang('no public page for our specific campaigns was found, so this links the platform, not a campaign.', 'no se encontró una página pública de nuestras campañas, así que esto enlaza la plataforma, no una campaña.')}
                                    </p>
                                </>
                            )}
                        </div>
                    </section>

                    {/* BUILT WITH NIRIUM */}
                    {data.builtWithNirium.length > 0 && (
                        <section className="py-10 border-t border-white/5">
                            <div className="max-w-5xl mx-auto px-6">
                                <h2 className="text-xl font-bold mb-2">{lang('Built with Nirium', 'Construido con Nirium')}</h2>
                                <p className="text-sm text-white/50 mb-6">
                                    {lang(
                                        'Third parties selling their own API over x402 using our tooling - independently verified, not self-reported.',
                                        'Terceros que venden su propia API por x402 usando nuestro tooling - verificado de forma independiente, no auto-reportado.')}
                                </p>
                                <div className="space-y-4">
                                    {data.builtWithNirium.map((b) => b.kind === 'connector' ? (
                                        <div key={b.connectorUrl} className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
                                            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                                                <a href={b.companyUrl} target="_blank" rel="noopener noreferrer" className="text-lg font-bold text-white hover:text-stellar-teal transition-colors">
                                                    {b.company}
                                                </a>
                                                <div className="flex flex-wrap gap-2">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-widest border ${b.checks.ok && b.checks.mentionsNirium ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                                        {b.checks.ok && b.checks.mentionsNirium
                                                            ? lang('connector: live', 'conector: en vivo')
                                                            : lang(`connector: FAILED (${b.checks.status ?? b.checks.error ?? 'unreachable'})`, `conector: FALLÓ (${b.checks.status ?? b.checks.error ?? 'inalcanzable'})`)}
                                                    </span>
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-widest border ${b.network === 'unknown' ? 'bg-white/5 text-white/40 border-white/10' : 'bg-amber-400/10 text-amber-400 border-amber-400/20'}`}>
                                                        {b.network}
                                                    </span>
                                                    {b.statedScope.privateProofOfConcept && (
                                                        <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-widest border bg-white/5 text-white/50 border-white/10">
                                                            {lang('private PoC', 'PoC privada')}
                                                        </span>
                                                    )}
                                                    {b.statedScope.noRealFunds && (
                                                        <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-widest border bg-white/5 text-white/50 border-white/10">
                                                            {lang('no real funds', 'sin fondos reales')}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-xs text-white/50 mb-3">
                                                {lang(
                                                    'A governance connector for Nirium, built and hosted by AgentLedger. Scope, network and funds are read live from the connector page itself, not restated by us. Listed with the operator\u2019s permission.',
                                                    'Un conector de gobernanza para Nirium, construido y alojado por AgentLedger. El alcance, la red y los fondos se leen en vivo de la propia página del conector, no los reescribimos nosotros. Publicado con permiso del operador.')}
                                            </p>
                                            <a href={b.connectorUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-mono text-stellar-teal hover:underline break-all">
                                                {b.connectorUrl}
                                            </a>
                                            <p className="text-xs text-white/40 mt-3">
                                                {lang('AgentLedger\u2019s mainnet payments are integration tests by a third party, listed apart in the payer table above; they are not counted as external payers or as a paying customer.', 'Los pagos de AgentLedger en mainnet son pruebas de integración de un tercero, listadas aparte en la tabla de pagadores arriba; no se cuentan como pagadores externos ni como cliente de pago.')}
                                            </p>
                                            {xs.integrationTests.filter((t) => t.ledger).map((t) => {
                                                const pp = xs.payers.find((x) => x.address === t.address);
                                                const L = t.ledger!;
                                                return (
                                                    <div key={t.address} className="mt-4 rounded-lg border border-amber-400/20 bg-amber-400/[0.03] p-4 text-xs space-y-2">
                                                        <p className="font-mono uppercase tracking-widest text-amber-300/80">{lang('Verifiable evidence', 'Evidencia verificable')}</p>
                                                        {pp && fundingSentence(pp, lang) && <p className="text-amber-300/80">{fundingSentence(pp, lang)}</p>}
                                                        <a href={L.pageUrl} target="_blank" rel="noopener noreferrer" className="text-stellar-teal hover:underline inline-flex items-center gap-1">
                                                            {lang('AgentLedger public ledger', 'Ledger público de AgentLedger')} <ExternalLink className="w-3 h-3" />
                                                        </a>
                                                        <Stale f={F?.x402?.status !== 'live' ? F?.x402 : (L as { freshness?: Freshness }).freshness} lang={lang} />
                                                        {!L.ok && (
                                                            <p className="text-red-400">{lang(`ledger could not be read right now (${L.status ?? 'unreachable'})`, `el ledger no se pudo leer ahora (${L.status ?? 'inalcanzable'})`)}</p>
                                                        )}
                                                        {L.ok && (
                                                            <p className="text-white/40">
                                                                {L.chainVerified
                                                                    ? lang(`hash chain reported intact by the ledger (${L.entriesRead} entries read)`, `cadena de hashes reportada íntegra por el ledger (${L.entriesRead} entradas leídas)`)
                                                                    : lang('the ledger did not report an intact hash chain', 'el ledger no reportó una cadena de hashes íntegra')}
                                                            </p>
                                                        )}
                                                        {L.ok && L.found.map((f) => (
                                                            <div key={f.txHash} className="text-white/60 leading-relaxed">
                                                                <p>
                                                                    {fmtDate(f.at, lang)} · {f.amountUsdc} USDC · HTTP {f.httpStatus ?? '?'} · {f.verdict} · {lang('ledger entry', 'entrada del ledger')} #{f.seq}
                                                                </p>
                                                                <p className="text-amber-300/80">
                                                                    {lang('payment governed by AgentLedger\u2019s gate on mainnet', 'pago gobernado por el gate de AgentLedger en mainnet')}{f.requestedByNirium ? lang(', requested by Nirium', ', solicitado por Nirium') : ''} ({lang('integration test', 'prueba de integración')})
                                                                </p>
                                                                <a href={`https://stellar.expert/explorer/public/tx/${f.txHash}`} target="_blank" rel="noopener noreferrer" className="font-mono text-stellar-teal hover:underline">
                                                                    tx {f.txHash.slice(0, 8)}…
                                                                </a>
                                                            </div>
                                                        ))}
                                                        {L.ok && L.found.length === 0 && (
                                                            <p className="text-white/40">{lang('none of this wallet\u2019s settlements appear in the ledger window read', 'ninguna liquidación de esta wallet aparece en la ventana del ledger leída')}</p>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div key={b.endpoint} className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
                                            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                                                <a href={b.repoUrl} target="_blank" rel="noopener noreferrer" className="text-lg font-bold text-white hover:text-stellar-teal transition-colors">
                                                    @{b.githubUser}
                                                </a>
                                                <div className="flex gap-2">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-widest border ${b.checks.endpoint.is402 ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                                        {b.checks.endpoint.is402
                                                            ? lang('endpoint: live (402)', 'endpoint: en vivo (402)')
                                                            : lang(`endpoint: FAILED (${b.checks.endpoint.status ?? b.checks.endpoint.error ?? 'unreachable'})`, `endpoint: FALLÓ (${b.checks.endpoint.status ?? b.checks.endpoint.error ?? 'inalcanzable'})`)}
                                                    </span>
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-widest border ${b.checks.packageJson.dependsOnNirium ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                                        {b.checks.packageJson.dependsOnNirium
                                                            ? `nirium@${b.checks.packageJson.version}`
                                                            : lang('package.json: no nirium dep FOUND', 'package.json: SIN dependencia nirium')}
                                                    </span>
                                                </div>
                                            </div>
                                            <a href={b.endpoint} target="_blank" rel="noopener noreferrer" className="text-sm font-mono text-stellar-teal hover:underline break-all">
                                                {b.endpoint}
                                            </a>
                                            <p className="text-xs text-white/40 mt-3">
                                                {lang('Settlements received', 'Liquidaciones recibidas')}: {b.settlements.count ?? '-'} -{' '}
                                                {lang('payer not identified; not presented as a client', 'pagador sin identificar; no se presenta como cliente')}
                                                {b.settlements.source && (
                                                    <> · <a href={b.settlements.source} target="_blank" rel="noopener noreferrer" className="text-stellar-teal hover:underline">{lang('source', 'fuente')}</a></>
                                                )}
                                                <Stale f={b.settlements.freshness} lang={lang} />
                                            </p>
                                            <div className="flex flex-wrap gap-3 mt-3">
                                                <a href={b.packageJsonUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-white/50 hover:text-stellar-teal inline-flex items-center gap-1">
                                                    package.json <ExternalLink className="w-3 h-3" />
                                                </a>
                                                {b.sourceRefs.map((ref) => (
                                                    <a key={ref.url} href={ref.url} target="_blank" rel="noopener noreferrer" className="text-xs text-white/50 hover:text-stellar-teal inline-flex items-center gap-1">
                                                        {ref.label} <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}

                    {/* DELIVERY HISTORY */}
                    <section className="py-10 border-t border-white/5">
                        <div className="max-w-5xl mx-auto px-6">
                            <h2 className="text-xl font-bold mb-6">{lang('Delivery history', 'Historial de entrega')}</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {INSTAWARDS.map((iw) => (
                                    <div
                                        key={iw.hash}
                                        className="rounded-xl border border-white/10 bg-white/[0.02] p-6 flex flex-col gap-2"
                                    >
                                        <span className="text-xs font-mono uppercase tracking-widest text-white/50">
                                            {lang(iw.label.en, iw.label.es)} - Stellar Community Fund
                                        </span>
                                        <span className="text-sm font-mono text-white/70 break-all">{iw.hash}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* METHODOLOGY */}
                    <section className="py-10 border-t border-white/5">
                        <div className="max-w-5xl mx-auto px-6">
                            <h2 className="text-sm font-mono uppercase tracking-widest text-white/40 mb-4">
                                {lang('How this page works', 'Cómo funciona esta página')}
                            </h2>
                            <ul className="space-y-2 text-sm text-white/50 list-disc list-inside">
                                <li>{lang('Every metric is fetched server-side at /api/stats on every load (5-minute cache) - nothing is precomputed or hand-edited.', 'Cada métrica se obtiene del lado del servidor en /api/stats en cada carga (cache de 5 min) - nada se precalcula ni se edita a mano.')}</li>
                                <li>{lang('x402 settlements and Treasury rebalances are counted directly from Horizon operations on the mainnet accounts - see the source link on each card.', 'Las liquidaciones x402 y los rebalanceos del Treasury se cuentan directo de las operaciones en Horizon sobre las cuentas de mainnet - ver el link de fuente en cada tarjeta.')}</li>
                                <li>{lang('GitHub-backed lists (external merged PRs, community contributions) are cached up to 1 hour to stay inside GitHub\u2019s unauthenticated rate limit. A request that fails is shown as a failure, never silently dropped.', 'Las listas que vienen de GitHub (PRs externos mergeados, contribuciones de la comunidad) se cachean hasta 1 hora para no pasarse del límite sin autenticación de GitHub. Una consulta que falla se muestra como falla, nunca se omite en silencio.')}</li>
                                <li>{lang('Testnet activity is not shown here - it includes automated development/testing traffic and would not represent real usage.', 'La actividad de testnet no se muestra aquí - incluye tráfico automatizado de desarrollo/pruebas y no representaría uso real.')}</li>
                                <li>{lang('Payers are read from the USDC transfer itself, not the transaction source (x402 routes every payment through a per-transaction facilitator account). A wallet counts as internal only with proof we hold its key, and as external only with its operator\u2019s own public statement; a third party\u2019s wallet that we coordinated and initially funded is listed apart as an integration test, not as an external payer. Who created or funded a wallet is never treated as proof of who controls it, and funding origin is disclosed.', 'Los pagadores se leen de la transferencia de USDC, no de la fuente de la transacción (x402 pasa cada pago por una cuenta de facilitador distinta). Una wallet cuenta como interna solo con prueba de que tenemos su llave, y como externa solo con declaración pública de su operador; la wallet de un tercero que coordinamos y fondeamos al inicio se lista aparte como prueba de integración, no como pagador externo. Quién creó o fondeó una wallet nunca se toma como prueba de quién la controla, y el origen del fondeo se revela.')}</li>
                                <li>{lang('Audit Trail and Payouts figures come from Nirium\u2019s own public reporting API, filtered to mainnet-labeled rows only - older rows with no network label are disclosed, not counted. It is not an independent third party: the link on each card lets you call it yourself and see the raw response.', 'Las cifras de Audit Trail y Payouts vienen de la API pública de reportería de Nirium, filtradas a filas etiquetadas mainnet - las filas antiguas sin etiqueta de red se revelan, no se cuentan. No es un tercero independiente: el link de cada tarjeta te deja llamarla tú mismo y ver la respuesta cruda.')}</li>
                                <li>
                                    {lang('This page is server-rendered, so the numbers are already in the HTML a crawler sees - not behind a client-only fetch. Once a day, a snapshot of this exact data is committed, hashed and published at ', 'Esta página se renderiza en el servidor, así que los números ya están en el HTML que ve un crawler - no detrás de un fetch solo del cliente. Una vez al día se comitea, hashea y publica un snapshot de estos mismos datos en ')}
                                    <a href="/stats/history.json" target="_blank" rel="noopener noreferrer" className="text-stellar-teal hover:underline">/stats/history.json</a>
                                    {lang(', and the rendered page is sent to the ', ', y la página renderizada se manda al ')}
                                    <a href="https://web.archive.org/web/2/https://nirium.xyz/stats" target="_blank" rel="noopener noreferrer" className="text-stellar-teal hover:underline">Wayback Machine</a>
                                    {lang('. Anyone can compare what this page said on a past date against what it says today.', '. Cualquiera puede comparar lo que esta página decía en una fecha pasada contra lo que dice hoy.')}
                                </li>
                            </ul>
                        </div>
                    </section>
                </>
            )}
        </main>
    );
}
