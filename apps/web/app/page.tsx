/** Nirium Protocol — Autonomous Treasury for LatAm Fintechs (July 2026) **/
'use client';

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import {
    ArrowRight, Bot, FileCheck,
    Check, ExternalLink, Sparkles, TrendingUp, Lock,
    Building2, Workflow, ChevronRight, Zap, Layers, Send
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import OpsConsole from "@/components/layout/OpsConsole";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/context/LanguageContext";
import LegalDisclaimer from "@/components/legal/LegalDisclaimer";
import { MAINNET_API_URL, PROOF_TX_HASH, PROOF_TX_URL, TREASURY_ACCOUNT, TREASURY_ACCOUNT_URL } from "@/lib/constants";

const TreasuryCanvas = dynamic(
    () => import('@/components/3d/TreasuryCanvas').then((m) => m.TreasuryCanvas),
    { ssr: false }
);

// ── Node Catalog vivo ─────────────────────────────────────────
// Consume GET /api/nodes del box mainnet: los estados y la red de cada nodo
// vienen del registry del protocolo, no de copy hardcodeado — el sitio no
// puede afirmar algo distinto a lo que el API declara. Fallback estático
// (espejo del registry) solo si el fetch falla.
interface CatalogNode {
    id: string;
    name: string;
    status: 'active' | 'architected' | 'proposed';
    custody: string;
    network: 'testnet' | 'mainnet' | 'both';
    summary: string;
}

const NODE_FALLBACK: CatalogNode[] = [
    { id: 'settlement', name: 'Settlement / Agent Payments', status: 'active', custody: 'non-custodial', network: 'both', summary: 'x402 per-request billing + MPP Charge settlement.' },
    { id: 'audit', name: 'Audit Trail', status: 'active', custody: 'non-custodial', network: 'both', summary: 'Immutable IPFS receipts for any app.' },
    { id: 'payroll', name: 'Payouts / Disbursement', status: 'active', custody: 'non-custodial', network: 'both', summary: 'Batch payouts, company-signed. Mainnet early access — independent service payments only (contractors/freelancers/B2B).' },
    { id: 'rebalance', name: 'Treasury Rebalance', status: 'active', custody: 'non-custodial', network: 'both', summary: 'Moves idle treasury into a CETES yield strategy and back, on its own. Live on mainnet over a DeFindex vault you own — invite-only while legal review closes.' },
        { id: 'compliance-sentinel', name: 'Compliance Sentinel', status: 'proposed', custody: 'non-custodial', network: 'testnet', summary: 'Not built. The intent is to validate every proposed transfer against a policy before it is signed. Do not rely on it as a control today.' },
    { id: 'reporting', name: 'Reporting', status: 'active', custody: 'non-custodial', network: 'both', summary: 'Institutional-format summaries and exports.' },
];

function useNodeCatalog(): { nodes: CatalogNode[]; live: boolean } {
    const [nodes, setNodes] = useState<CatalogNode[]>(NODE_FALLBACK);
    const [live, setLive] = useState(false);
    useEffect(() => {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 6000);
        fetch(`${MAINNET_API_URL}/api/nodes`, { signal: ctrl.signal })
            .then((r) => (r.ok ? r.json() : null))
            .then((data) => {
                if (data?.nodes?.length) {
                    setNodes(data.nodes);
                    setLive(true);
                }
            })
            .catch(() => {})
            .finally(() => clearTimeout(timer));
        return () => { ctrl.abort(); clearTimeout(timer); };
    }, []);
    return { nodes, live };
}

export default function Home() {
    const { language, t } = useLanguage();
    const lang = (en: string, es: string) =>
        language === 'es' ? es : en;
    const [copied, setCopied] = useState(false);
    const { nodes, live: catalogLive } = useNodeCatalog();

    // Quickstart REAL — el mismo flujo que liquidó el primer pago mainnet (jul 2026).
    const codeSnippet = `import { Agent } from 'nirium'; // npm install nirium

const agent = new Agent({ apiKey: 'demo', baseUrl: '${MAINNET_API_URL}' });

// One paid request on Stellar MAINNET: 402 → sign → 0.05 USDC → 200 OK
agent.initX402({ secretKey: process.env.STELLAR_SECRET_KEY, network: 'stellar:pubnet' });

const res = await agent.x402Fetch('${MAINNET_API_URL}/api/v1/premium/market');
console.log(await res.json()); // paid for by your agent, settled on-chain`;

    const handleCopy = () => {
        navigator.clipboard.writeText(codeSnippet);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <main className="min-h-screen bg-black text-white antialiased">
            <Navbar />
            
            <div className="w-full pt-[115px] sm:pt-[140px] px-0 sm:px-4 flex justify-center relative z-50">
                <LegalDisclaimer variant="banner" locale={language === 'es' ? 'es' : 'en'} className="w-full max-w-[1600px] sm:rounded-xl shadow-2xl" />
            </div>

            {/* HERO */}
            <section className="relative pt-8 sm:pt-12 pb-16 sm:pb-20 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(45,235,232,0.08),transparent_60%)]" />

                <div className="relative max-w-7xl mx-auto px-6">
                    <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-0">

                        {/* ── LEFT: text column ── */}
                        <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left lg:pr-12 pt-8 lg:pt-16">
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-6"
                            >
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                                </span>
                                {lang('Live on Stellar Mainnet — verify it on-chain', 'En vivo en Stellar Mainnet — verifícalo on-chain')}
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.05 }}
                                className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.05] tracking-tight"
                            >
                                {language === 'es' ? (
                                    <>
                                        Rieles de pago y auditoría
                                        <br />
                                        <span className="bg-gradient-to-r from-stellar-teal to-stellar-yellow bg-clip-text text-transparent">
                                            para la economía de agentes.
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        Payment &amp; audit rails
                                        <br />
                                        <span className="bg-gradient-to-r from-stellar-teal to-stellar-yellow bg-clip-text text-transparent">
                                            for the agent economy.
                                        </span>
                                    </>
                                )}
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                                className="mt-5 text-base sm:text-lg text-white/60 max-w-xl leading-relaxed"
                            >
                                {lang(
                                    'Machine-to-machine settlement, immutable audit receipts and institutional reporting — live on Stellar mainnet today, non-custodial by design. So is the autonomous treasury: it runs on mainnet over a DeFindex vault you own, invite-only while legal review closes. No spreadsheets. No manual transfers.',
                                    'Liquidación machine-to-machine, recibos de auditoría inmutables y reportería institucional — en vivo en Stellar mainnet hoy, non-custodial por diseño. La tesorería autónoma también: corre en mainnet sobre una bóveda DeFindex que tú posees, invite-only mientras cierra la revisión legal. Sin Excel. Sin transferencias manuales.')}
                            </motion.p>

                            {/* 3 numbers */}
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.15 }}
                                className="mt-10 grid grid-cols-3 gap-6 w-full max-w-sm"
                            >
                                <div>
                                    <div className="text-2xl sm:text-3xl font-black text-white">$0.02</div>
                                    <div className="text-[10px] uppercase tracking-widest text-white/40 mt-1">
                                        {lang('Per x402 request', 'Por request x402')}
                                    </div>
                                </div>
                                <div className="border-x border-white/5 px-4">
                                    <div className="text-2xl sm:text-3xl font-black text-white">~4s</div>
                                    <div className="text-[10px] uppercase tracking-widest text-white/40 mt-1">
                                        {lang('On-chain settlement', 'Liquidación on-chain')}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-2xl sm:text-3xl font-black text-white">0</div>
                                    <div className="text-[10px] uppercase tracking-widest text-white/40 mt-1">
                                        {lang('Funds custodied', 'Fondos en custodia')}
                                    </div>
                                </div>
                            </motion.div>

                            {/* CTAs */}
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="mt-8 flex flex-col sm:flex-row gap-3"
                            >
                                <Link href="/dashboard">
                                    <Button size="lg" variant="premium" className="w-full sm:w-auto">
                                        {lang('Try it free', 'Pruébalo gratis')}
                                        <ArrowRight className="ml-2 w-4 h-4" />
                                    </Button>
                                </Link>
                                <a href="mailto:niriumprotocol@gmail.com">
                                    <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/20 hover:bg-white/5">
                                        {lang('Talk to us', 'Habla con nosotros')}
                                    </Button>
                                </a>
                            </motion.div>

                            {/* Status line */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.6, delay: 0.3 }}
                                className="mt-6 flex items-center gap-3 text-xs text-white/40"
                            >
                                <span className="inline-flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    <span className="text-emerald-400/80">{lang('Mainnet — settlement · audit · payouts · reporting', 'Mainnet — liquidación · auditoría · payouts · reportería')}</span>
                                </span>
                                <span>·</span>
                                <span className="inline-flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                                    <span className="text-amber-400/70">{lang('Testnet — NiriumVault, our own contract (audit-gated)', 'Testnet — NiriumVault, contrato propio (audit-gated)')}</span>
                                </span>
                            </motion.div>
                        </div>

                        {/* ── RIGHT: 3D vault orb + live terminal ── */}
                        <div className="w-full lg:w-[520px] xl:w-[580px] shrink-0 flex flex-col gap-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 1, delay: 0.2 }}
                                className="w-full h-[340px] sm:h-[420px] lg:h-[480px] relative"
                            >
                                {/* Orbit labels */}
                                <div className="absolute top-[8%] right-[6%] z-10 flex items-center gap-1.5 px-2 py-1 rounded-full border border-stellar-teal/20 bg-black/60 backdrop-blur-sm">
                                    <span className="w-1.5 h-1.5 rounded-full bg-stellar-teal animate-pulse" />
                                    <span className="text-[9px] font-mono text-stellar-teal/80">USDC</span>
                                </div>
                                <div className="absolute bottom-[18%] left-[4%] z-10 flex items-center gap-1.5 px-2 py-1 rounded-full border border-stellar-yellow/20 bg-black/60 backdrop-blur-sm">
                                    <span className="w-1.5 h-1.5 rounded-full bg-stellar-yellow animate-pulse" />
                                    <span className="text-[9px] font-mono text-stellar-yellow/80">CETES 5.57% (Banxico)</span>
                                </div>
                                <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-stellar-teal/40 font-mono text-xs animate-pulse">Loading vault...</div>}>
                                    <TreasuryCanvas />
                                </Suspense>
                            </motion.div>

                            {/* Live agent terminal — flagship testnet, siempre etiquetado */}
                            <motion.div
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.9 }}
                            >
                                <div className="flex items-center gap-2 mb-1.5 px-1">
                                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-amber-400/25 bg-amber-400/10 text-amber-400 text-[9px] font-black uppercase tracking-widest">
                                        <span className="w-1 h-1 rounded-full bg-amber-400 animate-pulse" />
                                        {lang('Live testnet feed', 'Feed testnet en vivo')}
                                    </span>
                                    <span className="text-[9px] font-mono text-white/25">
                                        {lang('NiriumVault — our own contract, audit-gated. Autonomous treasury runs on mainnet over DeFindex.',
                                              'NiriumVault — contrato propio, audit-gated. La tesorería autónoma corre en mainnet sobre DeFindex.')}
                                    </span>
                                </div>
                                <OpsConsole
                                    isExpanded={false}
                                    onToggleExpand={() => {}}
                                    heightClass="h-[200px]"
                                />
                            </motion.div>
                        </div>

                    </div>
                </div>
            </section>

            {/* PROOF BAR — no nos creas: verifícanos */}
            <section className="py-10 border-t border-emerald-400/10 bg-gradient-to-b from-emerald-400/[0.04] to-transparent">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-5">
                        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-emerald-400">
                            {lang("Don't trust us. Verify us.", 'No nos creas. Verifícanos.')}
                        </h2>
                        <p className="text-[11px] text-white/40 font-mono">
                            {lang('Every claim below resolves on a public ledger.', 'Cada claim de abajo resuelve en un ledger público.')}
                        </p>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-3">
                        <a href={PROOF_TX_URL} target="_blank" rel="noopener noreferrer"
                            className="group flex items-start gap-3 p-4 rounded-xl border border-emerald-400/15 bg-black/40 hover:border-emerald-400/40 transition-colors">
                            <Zap className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            <div className="min-w-0">
                                <div className="text-xs font-bold text-white/90">{lang('First mainnet x402 settlement', 'Primer settlement x402 en mainnet')}</div>
                                <div className="text-[10px] font-mono text-white/35 truncate mt-0.5">{PROOF_TX_HASH.slice(0, 20)}…</div>
                                <div className="text-[10px] text-emerald-400/70 mt-1 inline-flex items-center gap-1">stellar.expert <ExternalLink className="w-2.5 h-2.5" /></div>
                            </div>
                        </a>
                        <a href={TREASURY_ACCOUNT_URL} target="_blank" rel="noopener noreferrer"
                            className="group flex items-start gap-3 p-4 rounded-xl border border-emerald-400/15 bg-black/40 hover:border-emerald-400/40 transition-colors">
                            <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            <div className="min-w-0">
                                <div className="text-xs font-bold text-white/90">{lang('Public revenue account', 'Cuenta de ingresos pública')}</div>
                                <div className="text-[10px] font-mono text-white/35 truncate mt-0.5">{TREASURY_ACCOUNT.slice(0, 12)}…{TREASURY_ACCOUNT.slice(-6)}</div>
                                <div className="text-[10px] text-emerald-400/70 mt-1 inline-flex items-center gap-1">{lang('watch it grow live', 'mírala crecer en vivo')} <ExternalLink className="w-2.5 h-2.5" /></div>
                            </div>
                        </a>
                        <a href={`${MAINNET_API_URL}/api/reporting/summary?network=mainnet`} target="_blank" rel="noopener noreferrer"
                            className="group flex items-start gap-3 p-4 rounded-xl border border-emerald-400/15 bg-black/40 hover:border-emerald-400/40 transition-colors">
                            <FileCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            <div className="min-w-0">
                                <div className="text-xs font-bold text-white/90">{lang('Live reporting API', 'API de reportería en vivo')}</div>
                                <div className="text-[10px] font-mono text-white/35 truncate mt-0.5">GET /api/reporting/summary</div>
                                <div className="text-[10px] text-emerald-400/70 mt-1 inline-flex items-center gap-1">{lang('raw JSON, no login', 'JSON crudo, sin login')} <ExternalLink className="w-2.5 h-2.5" /></div>
                            </div>
                        </a>
                    </div>
                </div>
            </section>

            {/* PRICING BAND — precio mainnet destacado (teal) */}
            <section className="py-8 border-t border-stellar-teal/15 bg-gradient-to-b from-stellar-teal/[0.05] to-transparent">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-5">
                        <div className="flex items-baseline gap-3">
                            <span className="text-3xl sm:text-4xl font-black text-stellar-teal">$0.02</span>
                            <div className="text-left">
                                <div className="text-sm font-bold text-white/90">{lang('per x402 request on mainnet', 'por request x402 en mainnet')}</div>
                                <div className="text-[11px] text-white/45 font-mono">{lang('settled on-chain in USDC · no card · no subscription', 'liquidado on-chain en USDC · sin tarjeta · sin suscripción')}</div>
                            </div>
                        </div>
                        <div className="hidden md:block h-10 w-px bg-white/10" />
                        <div className="flex items-center gap-6 text-center">
                            <div>
                                <div className="text-lg font-black text-stellar-teal">{lang('Free', 'Gratis')}</div>
                                <div className="text-[10px] text-white/40 font-mono uppercase tracking-widest">{lang('audit anchoring · beta', 'anclaje auditoría · beta')}</div>
                            </div>
                            <div>
                                <div className="text-lg font-black text-stellar-teal">$0</div>
                                <div className="text-[10px] text-white/40 font-mono uppercase tracking-widest">{lang('start on mainnet today', 'empieza en mainnet hoy')}</div>
                            </div>
                        </div>
                        <Link href="/pricing">
                            <Button variant="premium" className="whitespace-nowrap">
                                {lang('See pricing', 'Ver precios')}
                                <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </Link>
                    </div>
                    <p className="mt-3 text-center md:text-left text-[10px] text-white/30 font-mono">
                        {lang('Software license — Nirium never takes a percentage of your capital. DeFindex, the protocol behind the vault, takes 20% of the yield it generates; other financial fees are charged by regulated partners.', 'Licencia de software — Nirium nunca cobra un porcentaje de tu capital. DeFindex, el protocolo de la bóveda, se lleva 20% del rendimiento que genera; los demás fees financieros los cobran partners regulados.')}
                    </p>
                </div>
            </section>

            {/* THE PROBLEM */}
            <section className="py-20 border-t border-white/5">
                <div className="max-w-4xl mx-auto px-6">
                    <h2 className="text-2xl sm:text-3xl font-bold text-center text-white/90">
                        {lang('Sound familiar?', '¿Te suena familiar?')}
                    </h2>
                    <p className="mt-4 text-center text-white/50 max-w-lg mx-auto text-sm">
                        {lang(
                            'Every CFO we talk to has the same three problems.',
                            'Todos los CFO con los que hablamos tienen los mismos tres problemas.')}
                    </p>
                    {/* md y no sm: a 640px (el breakpoint sm) las 3 columnas dejan
                        133px útiles y el número en text-5xl pide 184 — desbordaba
                        la página 4px. Desde 768px sí cabe sin encoger la tipografía. */}
                    <div className="mt-12 grid md:grid-cols-3 gap-6">
                        <div className="text-center p-6 rounded-xl border border-red-500/10 bg-red-500/[0.03]">
                            <div className="text-5xl font-black text-red-400/80">$0</div>
                            <p className="mt-3 text-sm font-semibold text-white/80">
                                {lang('Your idle cash earns nothing', 'Tu caja genera cero')}
                            </p>
                            <p className="mt-1 text-xs text-white/40">
                                {lang('Inflation eats it while it sits in the bank.', 'La inflación lo reduce cada mes.')}
                            </p>
                        </div>
                        <div className="text-center p-6 rounded-xl border border-red-500/10 bg-red-500/[0.03]">
                            <div className="text-5xl font-black text-red-400/80">{lang('Hours', 'Horas')}</div>
                            <p className="mt-3 text-sm font-semibold text-white/80">
                                {lang('Lost every week to manual transfers', 'Perdidas cada semana en transferencias manuales')}
                            </p>
                            <p className="mt-1 text-xs text-white/40">
                                {lang('Your team moves money by hand. Every. Single. Day.', 'Tu equipo mueve dinero a mano todos los días.')}
                            </p>
                        </div>
                        <div className="text-center p-6 rounded-xl border border-red-500/10 bg-red-500/[0.03]">
                            <div className="text-5xl font-black text-red-400/80">{lang('Months', 'Meses')}</div>
                            <p className="mt-3 text-sm font-semibold text-white/80">
                                {lang('To build a secure in-house solution', 'Para construir una solución propia segura')}
                            </p>
                            <p className="mt-1 text-xs text-white/40">
                                {lang('If you can build it at all.', 'Si es que puedes construirla.')}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* HOW IT WORKS */}
            <section className="py-20 border-t border-white/5">
                <div className="max-w-5xl mx-auto px-6">
                    <h2 className="text-2xl sm:text-3xl font-bold text-center">
                        {lang('Three steps. That\'s it.', 'Tres pasos. Nada más.')}
                    </h2>
                    <p className="mt-4 text-center text-white/60 max-w-xl mx-auto">
                        {lang(
                            'Integrate in minutes. No complex setups. Start billing other agents and anchoring audit trails today.',
                            'Integra en minutos. Sin configuraciones complejas. Empieza a cobrar a otros agentes y a anclar registros de auditoría hoy mismo.')}
                    </p>

                    <div className="mt-14 grid md:grid-cols-3 gap-6">
                        {[
                            {
                                num: '01',
                                icon: Workflow,
                                title: lang('Install the package', 'Instala el paquete'),
                                body: lang(
                                    'Add Nirium to your agent with a single package import. Work in TypeScript or Python, no blockchain knowledge required.',
                                    'Agrega Nirium a tu agente importando un solo paquete. Trabaja en TypeScript o Python sin necesidad de saber de blockchain.'),
                            },
                            {
                                num: '02',
                                icon: Bot,
                                title: lang('Enable M2M Payouts', 'Habilita pagos M2M'),
                                body: lang(
                                    'Activate x402 or MPP Charge on your endpoints. Your agent pays per request — settled on-chain in USDC before the response.',
                                    'Activa x402 o MPP Charge en tus endpoints. Tu agente paga por llamada — liquidado on-chain en USDC antes de responder.'),
                            },
                            {
                                num: '03',
                                icon: FileCheck,
                                title: lang('Anchor Audit Trails', 'Ancla tu auditoría'),
                                body: lang(
                                    'Anchor every execution on IPFS and Stellar mainnet. Generate verified reports and immutable records ready for compliance.',
                                    'Ancla cada ejecución en IPFS y Stellar mainnet. Genera reportes verificados y registros inmutables listos para cumplimiento.'),
                            },
                        ].map((step) => (
                            <div
                                key={step.num}
                                className="relative p-6 rounded-xl border border-white/10 bg-white/[0.02] hover:border-stellar-teal/30 transition-colors"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-2.5 rounded-lg bg-stellar-teal/10">
                                        <step.icon className="w-5 h-5 text-stellar-teal" />
                                    </div>
                                    <div className="text-xs font-mono text-white/30">{step.num}</div>
                                </div>
                                <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                                <p className="text-sm text-white/60 leading-relaxed">{step.body}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* SETTLEMENT RAILS: x402 & MPP */}
            <section className="py-20 border-t border-white/5 bg-gradient-to-b from-black to-stellar-teal/[0.03] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(circle_at_100%_0%,rgba(45,235,232,0.04),transparent_70%)] pointer-events-none" />
                <div className="max-w-5xl mx-auto px-6 relative z-10">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 bg-emerald-400/10 border border-emerald-400/25 rounded-full text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
                            </span>
                            {lang('Live on Stellar Mainnet', 'En vivo en Stellar Mainnet')}
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold">
                            {lang('Nodes you can use today — no trust required', 'Nodos que puedes usar hoy — sin pedirte confianza')}
                        </h2>
                        <p className="mt-4 text-white/50 max-w-xl mx-auto text-sm">
                            {lang(
                                'Per-request billing, immutable audit anchoring and institutional reporting run on mainnet right now — non-custodial, no contracts of ours holding funds. Batch payouts are live in mainnet early access; the LCP legal layer follows after final terms review.',
                                'Facturación por request, anclaje de auditoría inmutable y reportería institucional corren en mainnet ahora mismo — non-custodial, sin contratos nuestros custodiando fondos. Los pagos en lote ya están en mainnet (early access); la capa legal LCP llega tras la revisión final de términos.')}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* x402 */}
                        <div className="group relative p-8 rounded-2xl bg-black/60 border border-white/10 hover:border-stellar-teal/40 transition-all duration-500">
                            <div className="absolute top-4 right-6 text-[36px] opacity-[0.07] font-black italic text-stellar-teal group-hover:opacity-[0.14] transition-opacity select-none">x402</div>
                            <div className="w-14 h-14 rounded-xl bg-stellar-teal/10 border border-stellar-teal/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Zap className="w-7 h-7 text-stellar-teal" />
                            </div>
                            <h3 className="text-xl font-black uppercase tracking-tight mb-3">
                                {lang('x402 — Pay per use', 'x402 — Pago por uso')}
                            </h3>
                            <p className="text-sm text-white/55 leading-relaxed mb-6">
                                {lang(
                                    'Like a vending machine for software. Your app requests data → pays automatically → gets the data. No invoices, no subscriptions, no human in the loop.',
                                    'Como una máquina expendedora de software. Tu app solicita datos → paga automáticamente → recibe los datos. Sin facturas, sin suscripciones, sin humanos en el medio.')}
                            </p>
                            <div className="flex items-center gap-3 pt-4 border-t border-white/[0.06]">
                                <div className="inline-flex items-center gap-1.5 text-[9px] font-mono text-emerald-400 uppercase tracking-widest font-bold">
                                    <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                                    {lang('Live on Mainnet', 'En vivo en Mainnet')}
                                </div>
                                <div className="h-px flex-1 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        whileInView={{ width: '100%' }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 1.5, ease: 'easeOut' }}
                                        className="h-full bg-emerald-400"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* MPP */}
                        <div className="group relative p-8 rounded-2xl bg-black/60 border border-white/10 hover:border-stellar-yellow/40 transition-all duration-500">
                            <div className="absolute top-4 right-6 text-[36px] opacity-[0.07] font-black italic text-stellar-yellow group-hover:opacity-[0.14] transition-opacity select-none">MPP</div>
                            <div className="w-14 h-14 rounded-xl bg-stellar-yellow/10 border border-stellar-yellow/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Layers className="w-7 h-7 text-stellar-yellow" />
                            </div>
                            <h3 className="text-xl font-black uppercase tracking-tight mb-3">
                                {lang('MPP — Charge, without a middleman', 'MPP — Cobro, sin intermediario')}
                            </h3>
                            <p className="text-sm text-white/55 leading-relaxed mb-6">
                                {lang(
                                    'Your client signs a full USDC transfer inside the request. We validate it by simulation and broadcast it — no external facilitator in the middle, and the network fee can be sponsored. Nothing is deposited, nothing is held.',
                                    'Tu cliente firma una transferencia completa de USDC dentro del request. La validamos por simulación y la transmitimos — sin facilitador externo de por medio, y la comisión de red puede ir patrocinada. No se deposita ni se retiene nada.')}
                            </p>
                            <div className="flex items-center gap-3 pt-4 border-t border-white/[0.06]">
                                <div className="inline-flex items-center gap-1.5 text-[9px] font-mono text-emerald-400 uppercase tracking-widest font-bold">
                                    <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                                    {lang('Live on Mainnet · Charge mode', 'En vivo en Mainnet · Modo charge')}
                                </div>
                                <div className="h-px flex-1 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        whileInView={{ width: '100%' }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 }}
                                        className="h-full bg-emerald-400"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Audit Trail — mainnet, beta gratis */}
                        <div className="group relative p-8 rounded-2xl bg-black/60 border border-white/10 hover:border-emerald-400/40 transition-all duration-500">
                            <div className="absolute top-4 right-6 text-[30px] opacity-[0.07] font-black italic text-emerald-400 group-hover:opacity-[0.14] transition-opacity select-none">CID</div>
                            <div className="w-14 h-14 rounded-xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <FileCheck className="w-7 h-7 text-emerald-400" />
                            </div>
                            <h3 className="text-xl font-black uppercase tracking-tight mb-3">
                                {lang('Audit Trail — Anchor your evidence', 'Audit Trail — Ancla tu evidencia')}
                            </h3>
                            <p className="text-sm text-white/55 leading-relaxed mb-6">
                                {lang(
                                    'POST a sha-256 hash of any document or event and get back an immutable, publicly verifiable IPFS receipt. Optionally sign it: the receipt then proves not just that the record was never altered, but who declared it — verifiable from the CID alone, with any Stellar key. One API call, no infrastructure. Free during beta. Anchor hashes, not raw personal data.',
                                    'Manda el hash sha-256 de cualquier documento o evento y recibe un recibo IPFS inmutable y públicamente verificable. Puedes firmarlo: entonces el recibo no solo prueba que el registro no se alteró, sino quién lo declaró — verificable con solo el CID, con cualquier llave de Stellar. Una llamada de API, sin infraestructura. Gratis en beta. Ancla hashes, no datos personales crudos.')}
                            </p>
                            <div className="flex items-center gap-3 pt-4 border-t border-white/[0.06]">
                                <div className="inline-flex items-center gap-1.5 text-[9px] font-mono text-emerald-400 uppercase tracking-widest font-bold">
                                    <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                                    {lang('Live on Mainnet · Free beta', 'En vivo en Mainnet · Beta gratis')}
                                </div>
                                <div className="h-px flex-1 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div initial={{ width: 0 }} whileInView={{ width: '100%' }} viewport={{ once: true }} transition={{ duration: 1.5, ease: 'easeOut' }} className="h-full bg-emerald-400" />
                                </div>
                            </div>
                        </div>

                        {/* Reporting — mainnet */}
                        <div className="group relative p-8 rounded-2xl bg-black/60 border border-white/10 hover:border-purple-400/40 transition-all duration-500">
                            <div className="absolute top-4 right-6 text-[30px] opacity-[0.07] font-black italic text-purple-400 group-hover:opacity-[0.14] transition-opacity select-none">CSV</div>
                            <div className="w-14 h-14 rounded-xl bg-purple-400/10 border border-purple-400/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <TrendingUp className="w-7 h-7 text-purple-400" />
                            </div>
                            <h3 className="text-xl font-black uppercase tracking-tight mb-3">
                                {lang('Reporting — Institutional exports', 'Reporting — Exportes institucionales')}
                            </h3>
                            <p className="text-sm text-white/55 leading-relaxed mb-6">
                                {lang(
                                    'Summaries and CSV/JSON exports over everything anchored — payments received, payout runs, audit receipts — filtered by date and network. Institutional-format output; what you file with any regulator remains your responsibility.',
                                    'Resúmenes y exportes CSV/JSON de todo lo anclado — pagos recibidos, corridas de payouts, recibos de auditoría — filtrados por fecha y red. Formato institucional; lo que presentes ante cualquier regulador sigue siendo tu responsabilidad.')}
                            </p>
                            <div className="flex items-center gap-3 pt-4 border-t border-white/[0.06]">
                                <div className="inline-flex items-center gap-1.5 text-[9px] font-mono text-emerald-400 uppercase tracking-widest font-bold">
                                    <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                                    {lang('Live on Mainnet · Read-only', 'En vivo en Mainnet · Solo lectura')}
                                </div>
                                <div className="h-px flex-1 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div initial={{ width: 0 }} whileInView={{ width: '100%' }} viewport={{ once: true }} transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 }} className="h-full bg-purple-400" />
                                </div>
                            </div>
                        </div>

                        {/* Payroll */}
                        <Link href="/payroll" className="group relative block p-8 rounded-2xl bg-black/60 border border-white/10 hover:border-stellar-teal/40 transition-all duration-500">
                            <div className="absolute top-4 right-6 text-[30px] opacity-[0.07] font-black italic text-stellar-teal group-hover:opacity-[0.14] transition-opacity select-none">PAY</div>
                            <div className="w-14 h-14 rounded-xl bg-stellar-teal/10 border border-stellar-teal/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Send className="w-7 h-7 text-stellar-teal" />
                            </div>
                            <h3 className="text-xl font-black uppercase tracking-tight mb-3">
                                {lang('Payouts — Pay contractors & suppliers', 'Payouts — Paga a contractors y proveedores')}
                            </h3>
                            <p className="text-sm text-white/55 leading-relaxed mb-6">
                                {lang(
                                    'Pay up to 100 recipients in one signed batch — contractors, freelancers, B2B suppliers. You sign in your own wallet, Nirium never holds your funds, and every run gets an immutable IPFS receipt. Mainnet early access — independent service payments only, not employee salary; you keep your tax and labor responsibilities.',
                                    'Paga hasta 100 destinatarios en un solo lote firmado — contratistas, freelancers, proveedores B2B. Firmas en tu propia wallet, Nirium nunca custodia tus fondos, y cada corrida obtiene un recibo IPFS inmutable. Early access en mainnet — solo pagos por prestación de servicios, no salario de empleados; tus obligaciones fiscales y laborales siguen siendo tuyas.')}
                            </p>
                            <div className="flex items-center gap-3 pt-4 border-t border-white/[0.06]">
                                <div className="inline-flex items-center gap-1.5 text-[9px] font-mono text-emerald-400 uppercase tracking-widest font-bold">
                                    <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                                    {lang('Mainnet early access · Non-custodial', 'Mainnet early access · Non-custodial')}
                                </div>
                                <div className="h-px flex-1 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div initial={{ width: 0 }} whileInView={{ width: '100%' }} viewport={{ once: true }} transition={{ duration: 1.5, ease: 'easeOut' }} className="h-full bg-stellar-teal" />
                                </div>
                            </div>
                        </Link>

                        {/* LCP */}
                        <div className="group relative p-8 rounded-2xl bg-black/60 border border-white/10 hover:border-emerald-400/40 transition-all duration-500">
                            <div className="absolute top-4 right-6 text-[36px] opacity-[0.07] font-black italic text-emerald-400 group-hover:opacity-[0.14] transition-opacity select-none">LCP</div>
                            <div className="w-14 h-14 rounded-xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <FileCheck className="w-7 h-7 text-emerald-400" />
                            </div>
                            <h3 className="text-xl font-black uppercase tracking-tight mb-3">
                                {lang('LCP — from verifiable to legally binding', 'LCP — de verificable a legalmente vinculante')}
                            </h3>
                            <p className="text-sm text-white/55 leading-relaxed mb-6">
                                {lang(
                                    'An optional legal layer: receipts can bind to a versioned agreement via its SHA-256 hash, referencing an AAA-ICDR dispute-resolution clause. Built on the open Legal Context Protocol (Draft v1.0) — ships once our terms clear legal review.',
                                    'Una capa legal opcional: los recibos pueden vincularse a un acuerdo versionado mediante su hash SHA-256, referenciando una cláusula de disputa AAA-ICDR. Construida sobre el Legal Context Protocol abierto (Draft v1.0) — se activa cuando nuestros términos pasen revisión legal.')}
                            </p>
                            <div className="flex items-center gap-3 pt-4 border-t border-white/[0.06]">
                                <div className="text-[9px] font-mono text-white/40 uppercase tracking-widest font-bold">{lang('In legal review · Draft v1.0 · not yet active', 'En revisión legal · Draft v1.0 · aún no activo')}</div>
                                <div className="h-px flex-1 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div initial={{ width: 0 }} whileInView={{ width: '100%' }} viewport={{ once: true }} transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 }} className="h-full bg-emerald-400" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* NODE CATALOG — estados vivos desde el API del protocolo */}
            <section className="py-16 border-t border-white/5">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 mb-8">
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold">
                                {lang('Execution Node framework', 'Framework de Execution Nodes')}
                            </h2>
                            <p className="mt-2 text-sm text-white/45 max-w-lg">
                                {lang(
                                    'One vault, up to 10 composable nodes. Statuses below come straight from the protocol API — the site cannot claim more than the registry does.',
                                    'Un vault, hasta 10 nodos componibles. Los estados de abajo vienen directo del API del protocolo — el sitio no puede afirmar más de lo que declara el registry.')}
                            </p>
                        </div>
                        <a href={`${MAINNET_API_URL}/api/nodes`} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-[10px] font-mono text-white/40 hover:text-stellar-teal transition-colors shrink-0">
                            {catalogLive ? (
                                <><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />{lang('live from GET /api/nodes', 'en vivo desde GET /api/nodes')}</>
                            ) : (
                                <>GET /api/nodes</>
                            )}
                            <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {nodes.map((node) => {
                            const isActive = node.status === 'active';
                            const onMainnet = isActive && (node.network === 'mainnet' || node.network === 'both');
                            const testnetOnly = node.network === 'testnet';
                            return (
                                <div key={node.id} className={`p-4 rounded-xl border bg-white/[0.02] ${isActive ? 'border-white/10' : 'border-white/[0.06] opacity-70'}`}>
                                    <div className="flex items-center justify-between gap-2 mb-2">
                                        <span className="text-[13px] font-bold text-white/90 leading-tight">{node.name}</span>
                                        {isActive ? (
                                            onMainnet ? (
                                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-emerald-400/25 bg-emerald-400/10 text-emerald-400 text-[8px] font-black uppercase tracking-widest shrink-0">
                                                    <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />Mainnet
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-amber-400/25 bg-amber-400/10 text-amber-400 text-[8px] font-black uppercase tracking-widest shrink-0">
                                                    <span className="w-1 h-1 rounded-full bg-amber-400 animate-pulse" />Testnet
                                                </span>
                                            )
                                        ) : (
                                            <span className="px-1.5 py-0.5 rounded border border-white/10 text-white/30 text-[8px] font-black uppercase tracking-widest shrink-0">
                                                {node.status === 'architected' ? lang('In design', 'En diseño') : 'Roadmap'}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[11px] text-white/45 leading-snug line-clamp-2">{node.summary}</p>
                                    <div className="mt-2.5 flex items-center gap-2 text-[9px] font-mono uppercase tracking-widest">
                                        <span className={node.custody === 'non-custodial' ? 'text-stellar-teal/70' : 'text-white/30'}>
                                            {node.custody === 'non-custodial' ? 'Non-custodial' : lang('Audit-gated', 'Audit-gated')}
                                        </span>
                                        {testnetOnly && isActive && (
                                            <span className="text-white/25">{lang('· mainnet after audit', '· mainnet tras auditoría')}</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* USE CASES */}
            <section className="py-20 border-t border-white/5">
                <div className="max-w-5xl mx-auto px-6">
                    <h2 className="text-2xl sm:text-3xl font-bold text-center">
                        {lang('Who is Nirium for?', '¿Para quién es Nirium?')}
                    </h2>
                    <p className="mt-4 text-center text-white/50 max-w-xl mx-auto text-sm">
                        {lang(
                            'If your company moves money, Nirium saves you time and eliminates errors.',
                            'Si tu empresa mueve dinero, Nirium te ahorra tiempo y elimina errores.')}
                    </p>

                    <div className="mt-12 grid md:grid-cols-3 gap-6">
                        {[
                            {
                                num: '01',
                                color: 'border-emerald-400/30 bg-emerald-400/[0.04]',
                                accent: 'text-emerald-400',
                                title: lang('Charge per API call — on mainnet', 'Cobra por llamada API — en mainnet'),
                                body: lang(
                                    'Your API or AI agent bills per request in USDC, settled on-chain in seconds. No subscriptions, no cards, no human in the loop. Live on Stellar mainnet today.',
                                    'Tu API o agente de IA cobra por request en USDC, liquidado on-chain en segundos. Sin suscripciones, sin tarjetas, sin humano en medio. En vivo en Stellar mainnet hoy.'),
                                tag: lang('APIs · AI agents · x402', 'APIs · Agentes IA · x402'),
                            },
                            {
                                num: '02',
                                color: 'border-emerald-400/30 bg-emerald-400/[0.04]',
                                accent: 'text-emerald-400',
                                title: lang('Prove every move — on mainnet', 'Prueba cada movimiento — en mainnet'),
                                body: lang(
                                    'Anchor any payment or event to an immutable IPFS receipt anyone can verify on a public ledger. Institutional-format exports in one call. Live on mainnet.',
                                    'Ancla cualquier pago o evento a un recibo IPFS inmutable que cualquiera verifica en un ledger público. Exportes con formato institucional en una llamada. En vivo en mainnet.'),
                                tag: lang('Fintechs · B2B · audit teams', 'Fintechs · B2B · auditoría'),
                            },
                            {
                                num: '03',
                                color: 'border-amber-400/25 bg-amber-400/[0.04]',
                                accent: 'text-amber-400',
                                title: lang('Autonomous treasury — mainnet', 'Tesorería autónoma — mainnet'),
                                body: lang(
                                    'Idle capital moves into the yield strategy and back on its own, over a DeFindex vault you own — a deterministic rule on mainnet, no model in the signing path. Invite-only while legal review closes.',
                                    'El capital ocioso entra a la estrategia de rendimiento y sale solo, sobre una bóveda DeFindex tuya — una regla determinista en mainnet, sin modelo en el camino que firma. Invite-only mientras cierra la revisión legal.'),
                                tag: lang('SaaS · treasuries · invite-only', 'SaaS · tesorerías · invite-only'),
                            },
                        ].map((item) => (
                            <div key={item.num} className={`p-6 rounded-xl border ${item.color} flex flex-col gap-4`}>
                                <div className="flex items-center justify-between">
                                    <span className={`text-[10px] font-mono font-bold ${item.accent}`}>{item.num}</span>
                                    <span className={`text-[9px] font-mono ${item.accent}/60 text-right leading-tight max-w-[160px]`}>{item.tag}</span>
                                </div>
                                <h3 className="text-base font-black text-white leading-tight">{item.title}</h3>
                                <p className="text-sm text-white/55 leading-relaxed">{item.body}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CODE SNIPPET */}
            <section className="py-20 border-t border-white/5">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 bg-emerald-400/10 border border-emerald-400/25 rounded-full text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            {lang('This code runs against mainnet, today', 'Este código corre contra mainnet, hoy')}
                        </div>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-center">
                        {lang('Your first on-chain payment in five minutes', 'Tu primer pago on-chain en cinco minutos')}
                    </h2>
                    <p className="mt-4 text-center text-white/60 max-w-xl mx-auto">
                        {lang(
                            'npm install nirium — the exact flow that settled our first mainnet payment. Charging AI agents for YOUR API takes the same five minutes.',
                            'npm install nirium — el mismo flujo que liquidó nuestro primer pago en mainnet. Cobrarle a agentes de IA por TU API toma los mismos cinco minutos.')}
                    </p>

                    <div className="mt-10 relative rounded-xl border border-white/10 bg-black overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                                <span className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                                <span className="ml-3 text-xs text-white/40 font-mono">x402-quickstart.ts</span>
                            </div>
                            <button
                                onClick={handleCopy}
                                className="text-xs text-white/50 hover:text-stellar-teal transition-colors font-mono"
                            >
                                {copied
                                    ? lang('Copied!', '¡Copiado!')
                                    : lang('Copy', 'Copiar')}
                            </button>
                        </div>
                        <pre className="p-6 text-sm text-white/80 font-mono leading-relaxed overflow-x-auto">
                            <code>{codeSnippet}</code>
                        </pre>
                    </div>

                    <div className="mt-6 text-center">
                        <Link
                            href="/developers"
                            className="inline-flex items-center gap-2 text-sm text-stellar-teal hover:underline"
                        >
                            {lang('Full developer docs', 'Ver documentación completa')}
                            <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* WHO USES NIRIUM */}
            <section className="py-24 border-t border-white/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_60%,rgba(45,235,232,0.04),transparent_55%)] pointer-events-none" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(255,200,0,0.03),transparent_55%)] pointer-events-none" />

                <div className="max-w-6xl mx-auto px-6 relative z-10">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-5 bg-white/[0.04] border border-white/10 rounded-full text-white/40 text-[10px] font-mono uppercase tracking-widest">
                            <span className="w-1 h-1 rounded-full bg-stellar-teal" />
                            {lang('Who is it for?', '¿Para quién es?')}
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
                            {lang('If your company moves money, Nirium is for you.', 'Si tu empresa mueve dinero, Nirium es para ti.')}
                        </h2>
                        <p className="mt-4 text-white/45 max-w-lg mx-auto text-sm leading-relaxed">
                            {lang(
                                "You don't need to understand crypto. You just need the problem we solve.",
                                'No necesitas entender de cripto. Solo necesitas tener el problema que resolvemos.')}
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-5">

                        {/* Card 1 — LATAM Fintechs */}
                        <motion.div
                            whileHover={{ y: -4 }}
                            transition={{ duration: 0.2 }}
                            className="group relative rounded-2xl border border-white/10 bg-gradient-to-b from-stellar-teal/[0.06] to-black/40 overflow-hidden hover:border-stellar-teal/30 transition-colors duration-300"
                        >
                            <div className="absolute top-0 right-0 w-40 h-40 bg-stellar-teal/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative p-7 flex flex-col h-full">
                                <div className="flex items-center justify-between mb-6">
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-stellar-teal/70 font-mono">
                                        {lang('Fintechs · PSPs · Mexico', 'Fintechs · PSPs · México')}
                                    </span>
                                    <span className="text-[9px] font-mono text-white/20">01</span>
                                </div>
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="w-10 h-10 rounded-xl bg-stellar-teal/10 border border-stellar-teal/20 flex items-center justify-center shrink-0 group-hover:border-stellar-teal/40 transition-colors">
                                        <Building2 className="w-5 h-5 text-stellar-teal" />
                                    </div>
                                    <h3 className="text-base font-black text-white leading-tight">
                                        {lang('Charge for your API — automatically', 'Cobra por tu API — automático')}
                                    </h3>
                                </div>
                                <div className="space-y-2 mb-5">
                                    <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg bg-red-500/[0.06] border border-red-500/10">
                                        <span className="text-red-400/60 text-[9px] font-black uppercase tracking-widest shrink-0 pt-px">ANTES</span>
                                        <span className="text-[11px] text-white/50 leading-snug">
                                            {lang('Charging per use meant Stripe, subscriptions, invoices — none built for machines paying machines.', 'Cobrar por uso significaba Stripe, suscripciones, facturas — nada hecho para máquinas pagando máquinas.')}
                                        </span>
                                    </div>
                                    <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg bg-stellar-teal/[0.06] border border-stellar-teal/10">
                                        <span className="text-stellar-teal text-[9px] font-black uppercase tracking-widest shrink-0 pt-px">AHORA</span>
                                        <span className="text-[11px] text-white/70 leading-snug">
                                            {lang('Your agent pays per request in USDC, settled on-chain in seconds. One request, one payment, one receipt.', 'Tu agente paga por request en USDC, liquidado on-chain en segundos. Un request, un pago, un recibo.')}
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-auto pt-4 border-t border-white/[0.06] flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-stellar-teal animate-pulse" />
                                        <span className="text-[10px] font-mono text-stellar-teal">{lang('Live on mainnet', 'En vivo en mainnet')}</span>
                                    </div>
                                    <ChevronRight className="w-3.5 h-3.5 text-white/20 group-hover:text-stellar-teal transition-colors" />
                                </div>
                            </div>
                        </motion.div>

                        {/* Card 2 — SMBs / No-CFO */}
                        <motion.div
                            whileHover={{ y: -4 }}
                            transition={{ duration: 0.2 }}
                            className="group relative rounded-2xl border border-white/10 bg-gradient-to-b from-stellar-yellow/[0.05] to-black/40 overflow-hidden hover:border-stellar-yellow/30 transition-colors duration-300"
                        >
                            <div className="absolute top-0 right-0 w-40 h-40 bg-stellar-yellow/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative p-7 flex flex-col h-full">
                                <div className="flex items-center justify-between mb-6">
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-stellar-yellow/70 font-mono">
                                        {lang('SaaS · Companies $1M–$10M', 'SaaS · Empresas $1M–$10M')}
                                    </span>
                                    <span className="text-[9px] font-mono text-white/20">02</span>
                                </div>
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="w-10 h-10 rounded-xl bg-stellar-yellow/10 border border-stellar-yellow/20 flex items-center justify-center shrink-0 group-hover:border-stellar-yellow/40 transition-colors">
                                        <Bot className="w-5 h-5 text-stellar-yellow" />
                                    </div>
                                    <h3 className="text-base font-black text-white leading-tight">
                                        {lang('Prove what happened — verifiably', 'Prueba lo que pasó — verificable')}
                                    </h3>
                                </div>
                                <div className="space-y-2 mb-5">
                                    <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg bg-red-500/[0.06] border border-red-500/10">
                                        <span className="text-red-400/60 text-[9px] font-black uppercase tracking-widest shrink-0 pt-px">ANTES</span>
                                        <span className="text-[11px] text-white/50 leading-snug">
                                            {lang('Proving a payment happened meant screenshots, PDFs, and trusting a third party.', 'Probar que un pago pasó significaba capturas, PDFs y confiar en un tercero.')}
                                        </span>
                                    </div>
                                    <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg bg-stellar-yellow/[0.06] border border-stellar-yellow/10">
                                        <span className="text-stellar-yellow text-[9px] font-black uppercase tracking-widest shrink-0 pt-px">AHORA</span>
                                        <span className="text-[11px] text-white/70 leading-snug">
                                            {lang('Every move anchored to an immutable IPFS receipt anyone can verify on-chain. Institutional-format exports in one call.', 'Cada movimiento anclado a un recibo IPFS inmutable que cualquiera verifica on-chain. Exportes con formato institucional en una llamada.')}
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-auto pt-4 border-t border-white/[0.06] flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-stellar-yellow animate-pulse" />
                                        <span className="text-[10px] font-mono text-stellar-yellow">{lang('Live on mainnet', 'En vivo en mainnet')}</span>
                                    </div>
                                    <ChevronRight className="w-3.5 h-3.5 text-white/20 group-hover:text-stellar-yellow transition-colors" />
                                </div>
                            </div>
                        </motion.div>

                        {/* Card 3 — DeFi Protocols */}
                        <motion.div
                            whileHover={{ y: -4 }}
                            transition={{ duration: 0.2 }}
                            className="group relative rounded-2xl border border-white/10 bg-gradient-to-b from-purple-500/[0.05] to-black/40 overflow-hidden hover:border-purple-500/30 transition-colors duration-300"
                        >
                            <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative p-7 flex flex-col h-full">
                                <div className="flex items-center justify-between mb-6">
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-purple-400/70 font-mono">
                                        {lang('Fintech builders · Developers', 'Builders fintech · Developers')}
                                    </span>
                                    <span className="text-[9px] font-mono text-white/20">03</span>
                                </div>
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0 group-hover:border-purple-500/40 transition-colors">
                                        <Layers className="w-5 h-5 text-purple-400" />
                                    </div>
                                    <h3 className="text-base font-black text-white leading-tight">
                                        {lang('Idle cash that works for you', 'Caja ociosa que trabaja por ti')}
                                    </h3>
                                </div>
                                <div className="space-y-2 mb-5">
                                    <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg bg-red-500/[0.06] border border-red-500/10">
                                        <span className="text-red-400/60 text-[9px] font-black uppercase tracking-widest shrink-0 pt-px">ANTES</span>
                                        <span className="text-[11px] text-white/50 leading-snug">
                                            {lang('Building autonomous treasury infrastructure from scratch takes months and a brokerage.', 'Construir infraestructura de tesorería autónoma desde cero tarda meses y una casa de bolsa.')}
                                        </span>
                                    </div>
                                    <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg bg-purple-500/[0.06] border border-purple-500/10">
                                        <span className="text-purple-400 text-[9px] font-black uppercase tracking-widest shrink-0 pt-px">AHORA</span>
                                        <span className="text-[11px] text-white/70 leading-snug">
                                            {lang('Idle capital works on its own inside a vault you own — and the signer literally cannot take it out. Live on mainnet, invite-only while legal review closes.', 'El capital ocioso trabaja solo dentro de una bóveda tuya — y quien firma literalmente no puede sacarlo. En vivo en mainnet, invite-only mientras cierra la revisión legal.')}
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-auto pt-4 border-t border-white/[0.06] flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                                        <span className="text-[10px] font-mono text-purple-400">{lang('Mainnet · invite-only', 'Mainnet · invite-only')}</span>
                                    </div>
                                    <ChevronRight className="w-3.5 h-3.5 text-white/20 group-hover:text-purple-400 transition-colors" />
                                </div>
                            </div>
                        </motion.div>

                    </div>
                </div>
            </section>

            {/* WHY NIRIUM */}
            <section className="py-20 border-t border-white/5">
                <div className="max-w-5xl mx-auto px-6">
                    <h2 className="text-2xl sm:text-3xl font-bold text-center">
                        {lang('Why trust Nirium with your money?', '¿Por qué confiar tu dinero a Nirium?')}
                    </h2>

                    {/* Guarantee callout */}
                    <div className="mt-10 relative rounded-xl border border-stellar-yellow/20 bg-stellar-yellow/[0.04] px-6 py-5 text-center overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,200,0,0.06),transparent_70%)]" />
                        <p className="relative text-base sm:text-lg font-black text-white tracking-tight">
                            {lang(
                                '"The software suggests. The contract decides. Your money never moves without your authorization."',
                                '"El software propone. El contrato decide. Tu dinero nunca se mueve sin tu autorización."')}
                        </p>
                        <p className="relative mt-2 text-xs text-stellar-yellow/60 font-mono uppercase tracking-widest">
                            {lang('Nirium Security Model — You always hold the keys', 'Modelo de seguridad Nirium — Tú siempre tienes las llaves')}
                        </p>
                    </div>

                    <div className="mt-10 grid md:grid-cols-3 gap-6">
                        {[
                            {
                                icon: Lock,
                                title: lang('Your money, your keys', 'Tu dinero, tus llaves'),
                                body:  lang(
                                    'Nirium never holds your funds. You control everything. We just run the automation on your behalf.',
                                    'Nirium nunca toca tu dinero. Tú controlas todo. Nosotros solo corremos la automatización por ti.'),
                                link: '/security',
                            },
                            {
                                icon: FileCheck,
                                title: lang('Every move, recorded', 'Cada movimiento, registrado'),
                                body:  lang(
                                    'Every action is signed and archived automatically. Export for auditors in one click. Always ready for regulators.',
                                    'Cada acción queda firmada y archivada automáticamente. Exporta para auditores en un clic. Siempre listo para reguladores.'),
                                link: '/compliance',
                            },
                            {
                                icon: Building2,
                                title: lang('Etherfuse converts your MXN — we never touch it', 'Etherfuse convierte tus MXN — nosotros nunca los tocamos'),
                                body:  lang(
                                    'To get tokenized CETES you contract directly with Etherfuse, a regulated operator: you send MXN to their CLABE and they issue the token to your wallet. Nirium never receives, holds or converts fiat — we only show you the instructions and read the resulting balance. Sandbox today.',
                                    'Para tener CETES tokenizados contratas directamente con Etherfuse, operador regulado: tú envías MXN a su CLABE y ellos emiten el token a tu wallet. Nirium nunca recibe, sostiene ni convierte fiat — solo te muestra las instrucciones y lee el saldo resultante. Hoy en sandbox.'),
                                link: '/ramp',
                            },
                        ].map((feature) => (
                            <Link
                                key={feature.title}
                                href={feature.link}
                                className="group p-6 rounded-xl border border-white/10 bg-white/[0.02] hover:border-stellar-teal/30 transition-colors"
                            >
                                <div className="p-2.5 rounded-lg bg-stellar-teal/10 w-fit mb-4">
                                    <feature.icon className="w-5 h-5 text-stellar-teal" />
                                </div>
                                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                                <p className="text-sm text-white/60 leading-relaxed mb-4">{feature.body}</p>
                                <div className="text-xs text-stellar-teal/80 group-hover:text-stellar-teal flex items-center gap-1.5">
                                    {lang('Learn more', 'Ver más')}
                                    <ChevronRight className="w-3 h-3" />
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* SPEI Legal Disclaimer */}
                    <div className="mt-8 border border-white/5 rounded-lg px-5 py-4 bg-white/[0.01]">
                        <p className="text-[10px] text-white/30 font-mono leading-relaxed">
                            <span className="text-white/45 font-semibold uppercase tracking-widest">
                                {lang('Legal notice', 'Aviso legal')} —{' '}
                            </span>
                            {lang(
                                'Nirium is treasury automation software, not a financial intermediary. SPEI onramp and CETES custody are operated exclusively by Etherfuse, an independent regulated entity subject to Mexican Fintech Law and Banxico/CNBV regulations. Nirium does not hold or custody funds at any time. The CETES rate shown is the Banxico official reference rate — not a guaranteed return by Nirium. SPEI funding requires KYC/KYB completion with Etherfuse. XLM is a volatile digital asset; SDF provides no guarantees on its value. Settlement (x402/MPP), batch payouts (early access), audit anchoring and reporting operate on Stellar Mainnet. Autonomous rebalancing operates on DeFindex vaults — third-party audited contracts owned by the client — invite-only while legal review concludes; the role Nirium holds cannot withdraw funds. NiriumVault, Nirium’s own contract, operates on Stellar Testnet only, pending external audit. Nirium never custodies funds in any case.',
                                'Nirium es software de automatización de tesorería, no un intermediario financiero. El onramp SPEI y la custodia de CETES son operados exclusivamente por Etherfuse, entidad regulada independiente sujeta a la Ley Fintech y normativa Banxico/CNBV. Nirium no custodia fondos en ningún momento. La tasa CETES mostrada es la tasa de referencia oficial Banxico — no es un rendimiento garantizado por Nirium. El fondeo vía SPEI requiere completar KYC/KYB con Etherfuse. XLM es un activo digital volátil; SDF no garantiza su valor. La liquidación (x402/MPP), las dispersiones en lote (early access), el anclaje de auditoría y la reportería operan en Stellar Mainnet. El rebalanceo autónomo opera sobre bóvedas de DeFindex —contratos de terceros, auditados y propiedad del cliente— en modo invitación mientras concluye la revisión legal; el rol que Nirium sostiene no puede retirar fondos. NiriumVault, el contrato propio de Nirium, opera únicamente en Stellar Testnet en espera de auditoría externa. Nirium no custodia fondos en ningún caso.')}
                        </p>
                    </div>
                </div>
            </section>

            {/* PRICING */}
            <section className="py-20 border-t border-white/5">
                <div className="max-w-5xl mx-auto px-6">
                    <h2 className="text-2xl sm:text-3xl font-bold text-center">
                        {lang('B2B Pricing', 'Precios B2B')}
                    </h2>
                    <p className="mt-4 text-center text-white/60">
                        {lang('Start on mainnet for free — pay per request, no card. Financial fees are charged by regulated partners.', 'Empieza en mainnet gratis — pagas por request, sin tarjeta. Los fees financieros los cobran partners regulados.')}
                    </p>

                    <div className="mt-12 grid md:grid-cols-3 gap-6">
                        {/* Developer — the mainnet plan */}
                        <div className="relative p-6 rounded-xl border border-emerald-400/30 bg-emerald-400/[0.04]">
                            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-400 text-[#0b0b0b] text-[10px] font-black uppercase tracking-widest">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#0b0b0b] animate-pulse" />
                                    {lang('Live on Mainnet', 'En vivo en Mainnet')}
                                </span>
                            </div>
                            <div className="text-xs uppercase tracking-widest text-emerald-400/70 mb-2">{lang('Developer · Mainnet', 'Developer · Mainnet')}</div>
                            <div className="text-3xl font-black mb-1">$0<span className="text-base text-white/40 font-normal">/mo</span></div>
                            <div className="text-sm text-white/50 mb-1">
                                {lang('Pay per request: $0.05 market state on mainnet · signals $0.02 and execute $0.25 on testnet', 'Pago por request: $0.05 market state en mainnet · señales $0.02 y execute $0.25 en testnet')}
                            </div>
                            <div className="text-[10px] text-emerald-400/70 font-mono mb-6">
                                {lang('settled on-chain in USDC · no card', 'liquidado on-chain en USDC · sin tarjeta')}
                            </div>
                            <ul className="space-y-2.5 text-sm text-white/70 mb-8">
                                <li className="flex gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />{lang('x402 quickstart on mainnet (pay-per-call)', 'Quickstart x402 en mainnet (pago por llamada)')}</li>
                                <li className="flex gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />{lang('Audit anchoring — free beta (mainnet)', 'Anclaje de auditoría — beta gratis (mainnet)')}</li>
                                <li className="flex gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />{/* La unidad tiene que coincidir con GET /api/payroll/info: es POR DESTINATARIO
    con escalones de volumen, no por corrida. Decía "$0.25/corrida" y una corrida
    de 100 personas cobra $40, no $0.25. */}
{lang('Batch payouts — monthly software licence by permitted volume, never a per-payment charge (mainnet early access, invite-only)', 'Payouts en lote — licencia mensual de software por volumen permitido, nunca un cargo por pago (mainnet early access, solo por invitación)')}</li>
                                <li className="flex gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />{lang('Treasury vault on DeFindex — deploy, fund and withdraw with your own signature; you pay only the network fee', 'Bóveda de tesorería en DeFindex — desplegar, fondear y retirar con tu propia firma; solo pagas el fee de red')}</li>
                                <li className="flex gap-2"><Check className="w-4 h-4 text-stellar-teal shrink-0 mt-0.5" />{lang('NiriumVault on testnet (2-of-3 Soroban)', 'NiriumVault en testnet (2-de-3 Soroban)')}</li>
                                <li className="flex gap-2"><Check className="w-4 h-4 text-stellar-teal shrink-0 mt-0.5" />{lang('SDK — nirium 0.11.0 on npm, 0.9.0 on PyPI · MCP v0.6.0 server', 'SDK — nirium 0.11.0 en npm, 0.9.0 en PyPI · Servidor MCP v0.6.0')}</li>
                            </ul>
                            <Link href="/dashboard">
                                <Button variant="outline" className="w-full border-white/20 hover:bg-white/5">
                                    {lang('Start free', 'Empezar gratis')}
                                </Button>
                            </Link>
                        </div>

                        {/* Growth */}
                        <div className="relative p-6 rounded-xl border border-stellar-teal/40 bg-stellar-teal/[0.05]">
                            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-stellar-teal text-[#0b0b0b] text-[10px] font-black uppercase tracking-widest">
                                {lang('Most popular', 'Más popular')}
                            </div>
                            <div className="text-xs uppercase tracking-widest text-stellar-teal mb-2">Growth</div>
                            <div className="text-3xl font-black mb-1">$299<span className="text-base text-white/50">/mo</span></div>
                            <div className="text-sm text-white/40 mb-1">
                                {lang('+ $0.02–0.25 per API call', '+ $0.02–0.25 por llamada API')}
                            </div>
                            <div className="text-[10px] text-stellar-teal/70 font-mono mb-6">
                                {lang('Software license — no % of capital', 'Licencia de software — sin % del capital')}
                            </div>
                            <ul className="space-y-2.5 text-sm text-white/80 mb-8">
                                <li className="flex gap-2"><Check className="w-4 h-4 text-stellar-teal shrink-0 mt-0.5" />{lang('Treasury node — idle capital moves into the yield strategy and back on its own (invite-only while legal review closes)', 'Nodo de tesorería — el capital ocioso entra a la estrategia de rendimiento y sale solo (invite-only mientras cierra la revisión legal)')}</li>
                                <li className="flex gap-2"><Check className="w-4 h-4 text-stellar-teal shrink-0 mt-0.5" />{lang('NiriumVault on mainnet (once audited)', 'NiriumVault en mainnet (tras auditoría)')}</li>
                                <li className="flex gap-2"><Check className="w-4 h-4 text-stellar-teal shrink-0 mt-0.5" />{lang('Institutional-format exports (CSV/JSON)', 'Exportes con formato institucional (CSV/JSON)')}</li>
                                <li className="flex gap-2"><Check className="w-4 h-4 text-stellar-teal shrink-0 mt-0.5" />{lang('IPFS anchoring (Pinata)', 'Anclaje IPFS (Pinata)')}</li>
                                <li className="flex gap-2"><Check className="w-4 h-4 text-stellar-teal shrink-0 mt-0.5" />{lang('x402 + MPP agentic payments', 'Pagos agénticos x402 + MPP')}</li>
                                <li className="flex gap-2"><Check className="w-4 h-4 text-stellar-teal shrink-0 mt-0.5" />{lang('CETES and USDC reference rates, attributed to their source', 'Tasas de referencia CETES y USDC, con su fuente')}</li>
                                <li className="flex gap-2"><Check className="w-4 h-4 text-stellar-teal shrink-0 mt-0.5" />{lang('Priority support (48h SLA)', 'Soporte prioritario (SLA 48h)')}</li>
                            </ul>
                            <Link href="/dashboard">
                                <Button variant="premium" className="w-full">
                                    {lang('Talk to sales →', 'Habla con ventas →')}
                                </Button>
                            </Link>
                        </div>

                        {/* Enterprise */}
                        <div className="p-6 rounded-xl border border-white/10 bg-white/[0.02]">
                            <div className="text-xs uppercase tracking-widest text-white/40 mb-2">Enterprise</div>
                            <div className="text-3xl font-black mb-1">Custom</div>
                            <div className="text-sm text-white/40 mb-6">
                                {lang('For regulated fintechs, banks and DAOs', 'Para fintechs reguladas, bancos y DAOs')}
                            </div>
                            <ul className="space-y-2.5 text-sm text-white/70 mb-8">
                                <li className="flex gap-2"><Check className="w-4 h-4 text-stellar-teal shrink-0 mt-0.5" />{lang('White-label option', 'Opción white-label')}</li>
                                <li className="flex gap-2"><Check className="w-4 h-4 text-stellar-teal shrink-0 mt-0.5" />{lang('Custom Soroban vault logic', 'Lógica Soroban personalizada')}</li>
                                <li className="flex gap-2"><Check className="w-4 h-4 text-stellar-teal shrink-0 mt-0.5" />{lang('Audit-readiness support', 'Soporte de preparación para auditorías')}</li>
                                <li className="flex gap-2"><Check className="w-4 h-4 text-stellar-teal shrink-0 mt-0.5" />{lang('On-premise deployment', 'Despliegue on-premise')}</li>
                                <li className="flex gap-2"><Check className="w-4 h-4 text-stellar-teal shrink-0 mt-0.5" />{lang('Joint go-to-market', 'Go-to-market conjunto')}</li>
                            </ul>
                            <a href="mailto:niriumprotocol@gmail.com">
                                <Button variant="outline" className="w-full border-white/20 hover:bg-white/5">
                                    {lang('Talk to the team', 'Hablar con el equipo')}
                                </Button>
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* CREDIBILITY STRIP */}
            <section className="py-16 border-t border-white/5">
                <div className="max-w-5xl mx-auto px-6">
                    <p className="text-center text-xs uppercase tracking-widest text-white/40 mb-8">
                        {lang('Verified by', 'Verificado por')}
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
                        {[
                            lang('Stellar Mainnet — settlement · audit · payouts · reporting LIVE', 'Stellar Mainnet — liquidación · auditoría · payouts · reportería EN VIVO'),
                            lang('SCF Kickstart grantee', 'Beneficiario SCF Kickstart'),
                            lang('External audit — pending (gates NiriumVault, not the DeFindex treasury)', 'Auditoría externa — pendiente (gatea NiriumVault, no la tesorería en DeFindex)'),
                            lang('Etherfuse Integration ✓', 'Integración Etherfuse ✓'),
                            lang('Stellar Testnet — NiriumVault (2-of-3 multisig)', 'Stellar Testnet — NiriumVault (multisig 2-de-3)'),
                        ].map((item) => (
                            <div key={item} className="text-[10px] text-white/40 font-mono uppercase tracking-[0.2em]">
                                {item}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* DASHBOARD PREVIEW */}
            <section className="py-24 border-t border-white/5 overflow-hidden">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-stellar-teal/10 border border-stellar-teal/20 rounded-full text-stellar-teal text-[10px] font-black uppercase tracking-widest mb-4">
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-stellar-teal opacity-75" />
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-stellar-teal" />
                            </span>
                            {lang('Live on Testnet', 'En vivo en Testnet')}
                        </div>
                        <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
                            {lang('The full product.', 'El producto completo.')}{' '}
                            <span className="text-stellar-teal">{lang('Behind one click.', 'Detrás de un clic.')}</span>
                        </h2>
                        <p className="mt-4 text-white/50 max-w-xl mx-auto text-sm">
                            {lang(
                                'Connect your Freighter wallet and access the full institutional dashboard — agents, analytics, vault, x402, MPP, and IPFS audit trail.',
                                'Conecta tu wallet Freighter y accede al dashboard institucional completo — agentes, analytics, vault, x402, MPP y rastro de auditoría IPFS.')}
                        </p>
                    </div>

                    {/* Dashboard mockup */}
                    <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(45,235,232,0.08)]">
                        {/* Browser chrome */}
                        <div className="flex items-center gap-2 px-4 py-3 bg-[#0A0A0A] border-b border-white/[0.06]">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-500/40" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/40" />
                                <div className="w-3 h-3 rounded-full bg-green-500/40" />
                            </div>
                            <div className="flex-1 mx-4">
                                <div className="max-w-xs mx-auto bg-white/5 border border-white/[0.08] rounded-md px-3 py-1 text-[10px] font-mono text-white/30">
                                    app.nirium.xyz/dashboard
                                </div>
                            </div>
                        </div>

                        {/* Fake dashboard UI */}
                        <div className="bg-[#050505] flex min-h-[420px]">
                            {/* Sidebar */}
                            <div className="w-44 shrink-0 border-r border-white/[0.05] p-3 space-y-1 hidden sm:block">
                                {[
                                    { category: 'CORE' },
                                    { label: t.nav.dashboard,     active: true,  color: '#2DEBE8' },
                                    { label: t.nav.agents,        active: false, color: '#FFD700' },
                                    { label: t.nav.analytics,     active: false, color: '#34D399' },
                                    { label: t.nav.compliance,    active: false, color: '#2DEBE8' },
                                    { category: 'TREASURY', mt: true },
                                    { label: t.nav.marketplace,   active: false, color: '#A78BFA' },
                                    { label: t.nav.builder,       active: false, color: '#F97316' },
                                    { label: t.nav.payroll,       active: false, color: '#EF4444' },
                                    { label: t.nav.ramp,          active: false, color: '#34D399' },
                                    { category: 'DEVELOPER', mt: true },
                                    { label: t.nav.docs,          active: false, color: '#FFFFFF' },
                                    { label: t.nav.developers,    active: false, color: '#FFFFFF' },
                                ].map((item, i) => (
                                    item.category ? (
                                        <div key={item.category} className={`text-[9px] font-black text-white/20 uppercase tracking-[0.2em] px-3 pb-1 ${item.mt ? 'pt-4' : 'pt-2'}`}>
                                            {item.category}
                                        </div>
                                    ) : (
                                        <div
                                            key={item.label}
                                            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-medium ${
                                                item.active ? 'bg-white/[0.08] text-white' : 'text-white/30'
                                            }`}
                                        >
                                            {item.active && (
                                                <span className="w-0.5 h-3.5 rounded-full absolute left-3" style={{ background: item.color }} />
                                            )}
                                            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: item.active ? item.color : 'rgba(255,255,255,0.1)' }} />
                                            {item.label}
                                        </div>
                                    )
                                ))}
                            </div>

                            {/* Main content */}
                            <div className="flex-1 p-5 space-y-4 overflow-hidden">
                                {/* Stats row */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {[
                                        { label: 'Vault',            value: '2-of-3',  sub: 'Soroban multisig (testnet)', color: 'text-stellar-teal' },
                                        { label: 'Active Agents',    value: '1 / 10',  sub: '24/7 Autonomous', color: 'text-stellar-yellow' },
                                        { label: 'Rebalance cycle',  value: '~20 min', sub: 'per asset, alternating', color: 'text-purple-400' },
                                        { label: 'Audit receipts',   value: 'IPFS',    sub: 'immutable, verifiable', color: 'text-green-400' },
                                    ].map(({ label, value, sub, color }) => (
                                        <div key={label} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
                                            <div className="text-[9px] font-mono text-white/30 uppercase mb-1">{label}</div>
                                            <div className={`text-lg font-black ${color}`}>{value}</div>
                                            <div className="text-[9px] text-white/30 mt-0.5">{sub}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Agent feed */}
                                <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Agent Activity</span>
                                        {/* NUNCA "LIVE" aquí: este panel es una maqueta con datos de ejemplo.
                                            Tenía $127,430 de tesorería, 1,847 recibos y un AGENT-02 inexistente
                                            junto a un badge LIVE — se contradecía con el "$0 en custodia" de
                                            arriba y es justo el "números inflados" que costó 3 rechazos de SCF. */}
                                        <span className="text-[9px] text-white/35 font-mono uppercase tracking-widest">
                                            {lang('sample data', 'datos de ejemplo')}
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        {[
                                            // Montos y actores reales: 1.0 USDC por ciclo (no 2,400), un solo
                                            // agente (no existe AGENT-02) y nada de SENTINEL, que sigue en diseño.
                                            { time: '23:41:02', msg: '[AGENT-01] Moved 1.0 USDC -> vault treasury (testnet)', type: 'success' },
                                            { time: '23:40:47', msg: '[AGENT-01] x402 micropayment: 0.02 USDC - API call billed', type: 'info' },
                                            { time: '23:40:31', msg: '[AUDIT-NODE] Receipt anchored to IPFS - CID: QmYNvmR7C...', type: 'success' },
                                        ].map(({ time, msg, type }) => (
                                            <div key={time} className="flex items-start gap-2 text-[10px] font-mono">
                                                <span className="text-white/20 shrink-0">{time}</span>
                                                <span className={type === 'success' ? 'text-green-400/80' : 'text-stellar-teal/80'}>{msg}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Launch CTA overlay */}
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/80 via-transparent to-transparent">
                            <div className="absolute bottom-8 flex flex-col items-center gap-3">
                                <Link href="/dashboard">
                                    <Button size="lg" variant="premium" className="shadow-[0_0_40px_rgba(255,215,0,0.3)]">
                                        {lang('Launch App — Free Testnet', 'Lanzar App — Testnet Gratis')}
                                        <ArrowRight className="ml-2 w-4 h-4" />
                                    </Button>
                                </Link>
                                <p className="text-[10px] text-white/30 font-mono">
                                    {lang('No funds at risk · Non-custodial · Freighter wallet', 'Sin fondos en riesgo · No custodial · Freighter')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FINAL CTA */}
            <section className="py-24 border-t border-white/5">
                <div className="max-w-3xl mx-auto px-6 text-center">
                    <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
                        {lang(
                            'Your rails are live. Verify them.',
                            'Tus rieles están en vivo. Verifícalos.')}
                    </h2>
                    <p className="mt-4 text-white/60 max-w-xl mx-auto">
                        {lang(
                            'Make your first mainnet payment in five minutes, or explore the treasury flagship free on testnet. No commitments.',
                            'Haz tu primer pago en mainnet en cinco minutos, o explora el flagship de tesorería gratis en testnet. Sin compromisos.')}
                    </p>
                    <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
                        <Link href="/dashboard">
                            <Button size="lg" variant="premium" className="w-full sm:w-auto">
                                {lang('Get started free', 'Comenzar gratis')}
                                <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </Link>
                        <a href="https://github.com/nirium-protocol/nirium-sdk" target="_blank" rel="noopener noreferrer">
                            <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/20 hover:bg-white/5">
                                GitHub
                                <ExternalLink className="ml-2 w-4 h-4" />
                            </Button>
                        </a>
                    </div>
                </div>
            </section>

            {/* BUILT ON OPEN STANDARDS */}
            <section className="py-12 border-t border-white/5 bg-black/50 text-center">
                <div className="max-w-3xl mx-auto px-6">
                    <h3 className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-4">Built on Open Standards</h3>
                    <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-white/60 mb-6">
                        <span className="font-mono">x402</span>
                        <span className="text-white/20">•</span>
                        <span className="font-mono">MPP</span>
                        <span className="text-white/20">•</span>
                        <span className="font-mono">LCP</span>
                        <span className="text-white/20">•</span>
                        <span className="font-mono">Apache 2.0</span>
                        <span className="text-white/20">•</span>
                        <span className="font-mono text-emerald-400">Stellar Mainnet</span>
                        <span className="text-white/20">+</span>
                        <span className="font-mono text-stellar-teal">Testnet</span>
                    </div>
                    <div className="flex items-center justify-center gap-6 text-sm mb-6">
                        <a href="https://github.com/nirium-protocol/nirium-sdk" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors underline underline-offset-4">GitHub Repository</a>
                        <Link href="/disclaimers" className="text-white/60 hover:text-white transition-colors underline underline-offset-4">Legal Disclaimers</Link>
                    </div>
                    <p className="text-[10px] text-zinc-500 font-mono">
                        All rate data shown is protocol reference information only — not a return projection or guarantee.
                    </p>
                </div>
            </section>

            <Footer />
        </main>
    );
}

