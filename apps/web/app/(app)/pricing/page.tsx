/** Nirium Pricing — Transparent, public **/
'use client';

import Link from "next/link";
import {
    CheckCircle2, ArrowRight, Sparkles, AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/context/LanguageContext";

type Feature = { en: string; es: string };

const FEATURES_FREE: Feature[] = [
    { en: 'Testnet vault (2-of-3 Soroban)', es: 'Vault testnet (2-de-3 Soroban)' },
    { en: 'Up to 10 test transactions/day',  es: 'Hasta 10 txs de prueba/día' },
    { en: 'Audit trail (SHA-256 · IPFS)',  es: 'Audit trail (SHA-256 · IPFS)' },
    { en: 'Payouts node (batch disbursement)', es: 'Nodo de dispersiones (batch)' },
    { en: 'SDK access (npm: nirium)',          es: 'Acceso SDK (npm: nirium)' },
    { en: 'MCP server (Claude/Cursor)',       es: 'MCP server (Claude/Cursor)' },
    // Estas dos cobran donde existe la capacidad, no donde queda mejor en el
    // copy: la señal la produce el loop autónomo y la ejecución necesita una
    // llave firmante. El box de mainnet no tiene ninguna de las dos y responde
    // 501 sin cobrar, así que anunciarlas allá sería vender una puerta cerrada.
    { en: 'x402 signals — $0.02 per call (the autonomous loop produces them here)', es: 'Señales x402 — $0.02 por llamada (aquí es donde el loop autónomo las produce)' },
    { en: 'x402 execute — $0.25 per call (execution needs a signing key; mainnet box holds none)', es: 'Execute x402 — $0.25 por llamada (ejecutar necesita llave firmante; el box de mainnet no tiene)' },
];

const FEATURES_MAINNET: Feature[] = [
    // Cada renglón dice QUÉ hace y POR QUÉ es software y no servicio financiero.
    // No es adorno legal: el encuadre se defiende explicando el flujo de fondos,
    // y el mejor lugar para explicarlo es donde alguien decide comprar.
    { en: 'x402 market state — $0.05 per call. You pay us for our own data; we are the payee, never an intermediary', es: 'Market state x402 — $0.05 por llamada. Nos pagas por nuestros propios datos; somos el vendedor, nunca un intermediario' },
    { en: 'x402Serve() — charge for YOUR API in ten lines, same rail. Funds go payer → you; they never touch Nirium', es: 'x402Serve() — cobra por TU API en diez líneas, el mismo riel. El dinero va del pagador a ti; nunca toca a Nirium' },
    { en: 'MPP Charge — per-request settlement with no external facilitator. The payment is to us, for our service', es: 'MPP Charge — liquidación por request, sin facilitador externo. El pago es hacia nosotros, por nuestro servicio' },
    // "Desplegar y depositar" se quedaba corto y justo donde no conviene: RETIRAR
    // también corre en mainnet y lo firmas tú, sin pedirnos permiso. Es la primera
    // pregunta de cualquiera que va a meter dinero en un contrato, y omitirla se
    // lee como que la salida está gated. El costo va medido, no adjetivado.
    { en: 'Treasury vault on DeFindex — deploy, deposit and withdraw, all with your own signature; the vault is yours, Nirium cannot move anything, and you pay only the network fee (~1.4 XLM to deploy, measured on mainnet)', es: 'Bóveda de tesorería en DeFindex — desplegar, depositar y retirar, todo con tu propia firma; la bóveda es tuya, Nirium no puede mover nada, y solo pagas el fee de red (~1.4 XLM el despliegue, medido en mainnet)' },
    // El precio de payouts dejó de ser por-destinatario: cobrar por pago procesado
    // es como cobra un procesador de pagos, y contradecía los propios términos.
    // Ahora es licencia mensual por capacidad — misma economía, otra forma jurídica.
    { en: 'Batch payouts — monthly software licence by permitted volume ($99 up to 250 records/mo, $249 up to 1,000), never a per-payment charge and never a percentage of what you disburse; mainnet is private Beta, invite-only (early access: network fee only today)', es: 'Payouts en lote — licencia mensual de software por volumen permitido ($99 hasta 250 registros/mes, $249 hasta 1,000), nunca un cargo por pago ni un porcentaje de lo que dispersas; mainnet en Beta privada, solo por invitación (early access: hoy solo fee de red)' },
    { en: 'Audit anchoring — free during beta. Anchor hashes, not personal data: IPFS cannot be edited or deleted', es: 'Anclaje de auditoría — gratis en beta. Ancla hashes, no datos personales: IPFS no se edita ni se borra' },
    { en: 'Reporting API — free (read-only). Institutional format; what you file with a regulator remains yours to decide', es: 'API de reportería — gratis (lectura). Formato institucional; lo que presentes ante un regulador lo decides tú' },
    { en: 'Settled on-chain in USDC, per request', es: 'Liquidado on-chain en USDC, por request' },
    { en: 'Not offered in restricted jurisdictions — see the policy before you integrate', es: 'No se ofrece en jurisdicciones restringidas — revisa la política antes de integrar' },
];

const FEATURES_GROWTH: Feature[] = [
    { en: 'Everything in Free',                 es: 'Todo lo de Free' },
    // Dos bóvedas distintas y hay que decirlo, o se lee como que la audit-gated
    // ya está viva: NiriumVault es contrato nuestro y espera auditoría; la de
    // DeFindex es contrato ajeno ya auditado y del cliente — por eso una puede
    // ir a mainnet hoy y la otra no.
    { en: 'Nirium’s own mainnet vault (once audited)', es: 'Vault propio de Nirium en mainnet (post-auditoría)' },
    { en: 'Treasury node — autonomously moves idle capital into the yield strategy and back out, on a DeFindex vault you own (early access, no cost during beta \u2014 invite-only on mainnet while the legal review closes)', es: 'Nodo de tesorería — mueve solo el capital ocioso hacia la estrategia de rendimiento y de regreso, sobre una bóveda DeFindex tuya (early access, sin costo durante la beta — invite-only en mainnet mientras cierra la revisión legal)' },
    { en: 'Unlimited transactions',             es: 'Transacciones ilimitadas' },
    { en: 'Institutional-format exports (CSV/JSON)', es: 'Exportes formato institucional (CSV/JSON)' },
    { en: 'IPFS anchoring (Pinata)',             es: 'Anclaje IPFS (Pinata)' },
    { en: 'x402 + MPP agentic payments',        es: 'Pagos agénticos x402 + MPP' },
    { en: 'Payouts / batch disbursement',       es: 'Dispersiones / pagos por lote' },
    { en: 'LCP legal layer (in legal review)',  es: 'Capa legal LCP (en revisión legal)' },
    { en: 'Cross-border USDC transfers',        es: 'Transfers cross-border USDC' },
    { en: 'CETES and USDC reference rates, attributed to their source', es: 'Tasas de referencia CETES y USDC, con su fuente' },
    { en: 'Visual Strategy Builder (drag & drop)', es: 'Strategy Builder visual (drag & drop)' },
    { en: 'Priority support (48h SLA)',            es: 'Soporte prioritario (48h SLA)' },
    { en: 'Dedicated Slack channel',               es: 'Canal Slack dedicado' },
];

const FEATURES_ENTERPRISE: Feature[] = [
    { en: 'Everything in Growth',                           es: 'Todo lo de Growth' },
    { en: 'Volume API pricing',                              es: 'Precios por volumen de API' },
    { en: 'White-label option',                             es: 'Opción white-label' },
    { en: 'Custom Soroban vault logic',                     es: 'Lógica de vault Soroban custom' },
    { en: 'Audit-readiness support',                        es: 'Soporte de preparación para auditorías' },
    { en: 'On-premise deployment option',                   es: 'Opción despliegue on-premise' },
    { en: 'SLA 99.9% uptime',                               es: 'SLA 99.9% uptime' },
    { en: '24/7 dedicated support',                         es: 'Soporte dedicado 24/7' },
    { en: 'Custom integrations (ERP, Core Banking)',        es: 'Integraciones custom (ERP, Core Banking)' },
    { en: 'Joint go-to-market',                             es: 'Go-to-market conjunto' },
];

type ComparisonRow = {
    feature: Feature;
    free:       string | Feature;
    growth:     string | Feature;
    enterprise: string | Feature;
};

const COMPARISON: ComparisonRow[] = [
    { feature: { en: 'Vault type',       es: 'Tipo de vault'       }, free: 'Testnet', growth: 'Mainnet', enterprise: 'Custom' },
    { feature: { en: 'Transactions',     es: 'Transacciones'         }, free: '10/day', growth: { en: 'Unlimited', es: 'Ilimitadas' }, enterprise: { en: 'Unlimited', es: 'Ilimitadas' } },
    { feature: { en: 'Multisig',         es: 'Multisig'             }, free: '2-of-3', growth: '2-of-3', enterprise: { en: 'Configurable', es: 'Configurable' } },
    { feature: { en: 'Institutional export',      es: 'Export institucional'        }, free: '✗', growth: '✓', enterprise: '✓' },
    { feature: { en: 'IPFS anchoring',   es: 'Anclaje IPFS'        }, free: '✗', growth: '✓', enterprise: '✓' },
    { feature: { en: 'x402 / MPP',       es: 'x402 / MPP'       }, free: '✗', growth: '✓', enterprise: '✓' },
    { feature: { en: 'API pricing',      es: 'Precio API'         }, free: { en: 'Free (testnet)', es: 'Gratis (testnet)' }, growth: { en: '$0.02–0.25/call', es: '$0.02–0.25/call' }, enterprise: { en: 'Volume discount', es: 'Descuento por volumen' } },
    { feature: { en: 'Support',          es: 'Soporte'             }, free: '✗', growth: '48h SLA', enterprise: '24/7' },
];

export default function PricingPage() {
    const { language } = useLanguage();
    const lang = (en: string, es: string) =>
        language === 'es' ? es : en;

    const f = (feat: Feature) => language === 'es' ? feat.es : feat.en;
    const cellVal = (v: string | Feature) => typeof v === 'string' ? v : f(v);

    return (
        <main className="min-h-screen bg-black text-white antialiased">
{/* HERO */}
            <section className="relative pt-8 pb-16 sm:pt-8 sm:pb-20">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(45,235,232,0.06),transparent_60%)]" />
                <div className="relative max-w-5xl mx-auto px-6">
                    <div className="flex justify-center mb-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-stellar-teal/20 bg-stellar-teal/5 text-stellar-teal text-xs font-mono">
                            <Sparkles className="w-3 h-3" />
                            {lang('Transparent pricing', 'Precios transparentes')}
                        </div>
                    </div>

                    <h1 className="text-center text-4xl sm:text-6xl font-black leading-[1.05] tracking-tight">
                        {lang('No surprises.', 'Sin sorpresas.')}
                        <br />
                        <span className="bg-gradient-to-r from-stellar-teal to-stellar-yellow bg-clip-text text-transparent">
                            {lang('No fine print.', 'Sin letra chica.')}
                        </span>
                    </h1>
                    <p className="mt-6 text-center text-lg text-white/60 max-w-2xl mx-auto">
                        {lang(
                            'Start free. On mainnet you pay per request — your agent settles in USDC on-chain, no card needed.',
                            'Empieza gratis. En mainnet pagas por request — tu agente liquida en USDC on-chain, sin tarjeta.')}
                    </p>
                </div>
            </section>

            {/* PLANS */}
            <section className="py-16 border-t border-white/5">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

                        {/* MAINNET PAY-PER-USE — lo que cobra HOY */}
                        <div className="flex flex-col p-6 rounded-2xl border border-emerald-400/30 bg-emerald-400/[0.04] relative">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                <span className="px-3 py-1 bg-emerald-400 text-[#0b0b0b] text-[10px] font-black uppercase rounded-full tracking-widest inline-flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#0b0b0b] animate-pulse" />
                                    {lang('Live on Mainnet', 'En vivo en Mainnet')}
                                </span>
                            </div>
                            <div className="mb-6">
                                <div className="text-xs font-mono uppercase tracking-widest text-emerald-400/70 mb-2">Mainnet · Pay-per-use</div>
                                <div className="text-4xl font-black mb-1">$0<span className="text-lg text-white/40 font-normal">/mo</span></div>
                                <p className="text-sm text-white/50">
                                    {lang('Pay per settled request — no card, no subscription', 'Pagas por request liquidado — sin tarjeta, sin suscripción')}
                                </p>
                                <p className="text-xs text-emerald-400/60 mt-1">
                                    {lang('Your agent pays on-chain via x402 (USDC)', 'Tu agente paga on-chain vía x402 (USDC)')}
                                </p>
                            </div>
                            <ul className="space-y-2.5 flex-1 mb-8">
                                {FEATURES_MAINNET.map((feat) => (
                                    <li key={feat.en} className="flex items-start gap-2 text-sm text-white/70">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400/80 shrink-0 mt-0.5" />
                                        {f(feat)}
                                    </li>
                                ))}
                            </ul>
                            <Link href="/developers">
                                <Button variant="premium" className="w-full">
                                    {lang('Make your first paid call', 'Haz tu primera llamada pagada')}
                                    <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                            </Link>
                        </div>

                        {/* FREE */}
                        <div className="flex flex-col p-6 rounded-2xl border border-white/10 bg-white/[0.02]">
                            <div className="mb-6">
                                <div className="text-xs font-mono uppercase tracking-widest text-white/40 mb-2">Sandbox</div>
                                <div className="text-4xl font-black mb-1">$0</div>
                                <p className="text-sm text-white/50">
                                    {lang('Free forever on testnet', 'Para siempre en testnet')}
                                </p>
                            </div>
                            <ul className="space-y-2.5 flex-1 mb-8">
                                {FEATURES_FREE.map((feat) => (
                                    <li key={feat.en} className="flex items-start gap-2 text-sm text-white/70">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400/80 shrink-0 mt-0.5" />
                                        {f(feat)}
                                    </li>
                                ))}
                            </ul>
                            <Link href="/sandbox">
                                <Button variant="outline" className="w-full border-white/20 hover:bg-white/5">
                                    {lang('Start free', 'Empezar gratis')}
                                </Button>
                            </Link>
                        </div>

                        {/* GROWTH — highlighted */}
                        <div className="flex flex-col p-6 rounded-2xl border border-stellar-teal/30 bg-stellar-teal/[0.04] relative">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                <span className="px-3 py-1 bg-stellar-teal text-[#0b0b0b] text-[10px] font-black uppercase rounded-full tracking-widest">
                                    {lang('Most popular', 'Más popular')}
                                </span>
                            </div>
                            <div className="mb-6">
                                <div className="text-xs font-mono uppercase tracking-widest text-stellar-teal/60 mb-2">Growth</div>
                                <div className="text-4xl font-black mb-1">
                                    $299
                                    <span className="text-lg text-white/40 font-normal">/mo</span>
                                </div>
                                <p className="text-sm text-white/50">
                                    {lang('+ $0.02–0.25 per API call', '+ $0.02–0.25 por llamada API')}
                                </p>
                                <p className="text-xs text-white/30 mt-1">
                                    {lang('Software license — no % of capital', 'Licencia de software — sin % del capital')}
                                </p>
                            </div>
                            <ul className="space-y-2.5 flex-1 mb-8">
                                {FEATURES_GROWTH.map((feat) => (
                                    <li key={feat.en} className="flex items-start gap-2 text-sm text-white/70">
                                        <CheckCircle2 className="w-4 h-4 text-stellar-teal/80 shrink-0 mt-0.5" />
                                        {f(feat)}
                                    </li>
                                ))}
                            </ul>
                            <Link href="/sandbox">
                                <Button variant="premium" className="w-full">
                                    {lang('Try on testnet', 'Probar en testnet')}
                                    <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                            </Link>
                        </div>

                        {/* ENTERPRISE */}
                        <div className="flex flex-col p-6 rounded-2xl border border-white/10 bg-white/[0.02]">
                            <div className="mb-6">
                                <div className="text-xs font-mono uppercase tracking-widest text-white/40 mb-2">Enterprise</div>
                                <div className="text-4xl font-black mb-1">Custom</div>
                                <p className="text-sm text-white/50">
                                    {lang('For regulated fintechs, banks, and DAOs', 'Para fintechs reguladas, bancos y DAOs')}
                                </p>
                            </div>
                            <ul className="space-y-2.5 flex-1 mb-8">
                                {FEATURES_ENTERPRISE.map((feat) => (
                                    <li key={feat.en} className="flex items-start gap-2 text-sm text-white/70">
                                        <CheckCircle2 className="w-4 h-4 text-stellar-yellow/80 shrink-0 mt-0.5" />
                                        {f(feat)}
                                    </li>
                                ))}
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

            {/* FEE BREAKDOWN */}
            <section className="py-16 border-t border-white/5">
                <div className="max-w-3xl mx-auto px-6">
                    <h2 className="text-2xl sm:text-3xl font-bold text-center">
                        {lang('Fee breakdown', 'Desglose de fees')}
                    </h2>
                    <p className="mt-3 text-center text-white/50 text-sm">
                        {lang('Who charges what? Full transparency.', '¿Cuánto cobra quién? Transparencia total.')}
                    </p>

                    <div className="mt-10 space-y-4">
                        {[
                            {
                                label: lang('Nirium Software License', 'Licencia de Software Nirium'),
                                rows: [
                                    { who: lang('Platform fee (Growth)', 'Cuota plataforma (Growth)'), fee: '$299/mo', note: lang('Flat monthly — no % of capital', 'Mensual fijo — sin % del capital'), highlight: true, total: false },
                                    { who: lang('API calls (execution, market, signals)', 'Llamadas API (ejecución, mercado, señales)'), fee: '$0.02–0.25', note: lang('Per call, pay-as-you-go', 'Por llamada, pago por uso'), highlight: false, total: false },
                                    { who: lang('x402 premium endpoints', 'Endpoints premium x402'), fee: '$0.02–0.25', note: lang('USDC micropayment per request', 'Micropago USDC por request'), highlight: false, total: false },
                                ],
                            },
                            {
                                label: lang('Regulated Partner Fees (not Nirium)', 'Fees del Partner Regulado (no Nirium)'),
                                rows: [
                                    { who: lang('Etherfuse (CETES execution)', 'Etherfuse (ejecución CETES)'), fee: 'etherfuse.com', feeLink: 'https://etherfuse.com', note: lang('Charged by Etherfuse directly — Nirium does not receive or manage this fee', 'Cobrado por Etherfuse directamente — Nirium no recibe ni administra este fee'), highlight: false, total: false },
                                    { who: lang('Stellar network (gas)', 'Red Stellar (gas)'), fee: '<$0.01', note: lang('Per transaction', 'Por transacción'), highlight: false, total: false },
                                    { who: lang('Regulated operator commission', 'Comisión del operador regulado'), fee: lang('Set by partner', 'Definida por partner'), note: lang('ITF/Casa de bolsa sets their own fee', 'ITF/Casa de bolsa define su propio fee'), highlight: true, total: false },
                                ],
                            },
                        ].map((section) => (
                            <div key={section.label} className="rounded-xl border border-white/10 overflow-hidden">
                                <div className="px-4 py-3 bg-white/[0.03] border-b border-white/5">
                                    <span className="text-sm font-bold">{section.label}</span>
                                </div>
                                <table className="w-full">
                                    <tbody className="divide-y divide-white/5">
                                        {section.rows.map((row) => (
                                            <tr key={row.who} className={row.total ? 'bg-stellar-teal/5' : ''}>
                                                <td className={`px-4 py-2.5 text-sm ${row.total ? 'font-bold text-stellar-teal' : 'text-white/70'}`}>{row.who}</td>
                                                <td className={`px-4 py-2.5 text-sm font-mono ${row.total ? 'font-black text-stellar-teal' : row.highlight ? 'text-white' : 'text-white/60'}`}>
                                                    {(row as any).feeLink ? (
                                                        <a href={(row as any).feeLink} target="_blank" rel="noopener noreferrer" className="text-stellar-teal/70 hover:text-stellar-teal underline underline-offset-2 transition-colors">
                                                            {row.fee} ↗
                                                        </a>
                                                    ) : row.fee}
                                                </td>
                                                <td className="px-4 py-2.5 text-xs text-white/40 hidden sm:table-cell">{row.note}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FULL COMPARISON TABLE */}
            <section className="py-16 border-t border-white/5">
                <div className="max-w-4xl mx-auto px-6">
                    <h2 className="text-2xl sm:text-3xl font-bold text-center">
                        {lang('Comparison table', 'Tabla comparativa')}
                    </h2>

                    <div className="mt-8 overflow-hidden rounded-xl border border-white/10">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/[0.02]">
                                    <th className="text-left px-4 py-3 text-xs text-white/40 uppercase tracking-wider font-mono">
                                        {lang('Feature', 'Característica')}
                                    </th>
                                    <th className="text-center px-4 py-3 text-xs text-white/40 uppercase tracking-wider font-mono">Free</th>
                                    <th className="text-center px-4 py-3 text-xs text-stellar-teal/60 uppercase tracking-wider font-mono">Growth</th>
                                    <th className="text-center px-4 py-3 text-xs text-white/40 uppercase tracking-wider font-mono">Enterprise</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {COMPARISON.map((row) => (
                                    <tr key={row.feature.en} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="px-4 py-3 text-white/70 text-xs">{f(row.feature)}</td>
                                        <td className="px-4 py-3 text-center text-xs text-white/60">{cellVal(row.free)}</td>
                                        <td className="px-4 py-3 text-center text-xs text-stellar-teal/80 font-medium">{cellVal(row.growth)}</td>
                                        <td className="px-4 py-3 text-center text-xs text-white/60">{cellVal(row.enterprise)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-16 border-t border-white/5">
                <div className="max-w-3xl mx-auto px-6">
                    <h2 className="text-2xl sm:text-3xl font-bold text-center">FAQ</h2>

                    <div className="mt-10 space-y-4">
                        {[
                            {
                                q: lang('Why flat pricing instead of % of capital?', '¿Por qué precio fijo y no % del capital?'),
                                a: lang(
                                    'Nirium is a software company, not a fund manager. We sell technology licenses — like Bloomberg or Refinitiv. Financial commissions (% of AUM, swap fees) are charged by your Regulated Partner (ITF, casa de bolsa), not by us.',
                                    'Nirium es una empresa de software, no una administradora de fondos. Vendemos licencias de tecnología — como Bloomberg o Refinitiv. Las comisiones financieras (% del AUM, fees de swap) las cobra tu Partner Regulado (ITF, casa de bolsa), no nosotros.'),
                            },
                            {
                                q: lang('What is on mainnet today and how is it billed?', '¿Qué está en mainnet hoy y cómo se cobra?'),
                                a: lang(
                                    'Settlement (x402/MPP), audit anchoring and reporting run on Stellar mainnet now. x402 endpoints bill per request in USDC ($0.02 signals · $0.05 market · $0.25 execute), settled on-chain before the response — every payment is a verifiable transaction. Audit anchoring is free during beta; the reporting API is free read-only.',
                                    'La liquidación (x402/MPP), el anclaje de auditoría y la reportería ya corren en Stellar mainnet. Los endpoints x402 cobran por request en USDC ($0.02 señales · $0.05 market · $0.25 execute), liquidado on-chain antes de responder — cada pago es una transacción verificable. El anclaje de auditoría es gratis en beta; el API de reportería es gratis en lectura.'),
                            },
                            {
                                q: lang('What does the treasury node cost?', '¿Cuánto cuesta el nodo de tesorería?'),
                                a: lang(
                                    'Deploying the vault costs nothing beyond the Stellar network fee (about 0.04 XLM), which you pay from your own wallet — the vault is yours from the first block. Autonomous rebalancing is early access and carries no cost during the beta. On mainnet it is invite-only while the legal review closes — not a technical limit: the signer runs, but rebalancing someone else’s funds is the question sitting with counsel, so we do not open it before the answer. One thing we do not charge but you should know: DeFindex, the protocol behind the vault, takes 20% of the yield generated. Nirium never takes a percentage of your capital.',
                                    'Desplegar la bóveda no cuesta nada más que el fee de red de Stellar (unos 0.04 XLM), que pagas desde tu propia wallet — la bóveda es tuya desde el primer bloque. El rebalanceo autónomo es early access y no tiene costo durante la beta. En mainnet es invite-only mientras cierra la revisión legal — y no por un límite técnico: el firmante corre, pero reacomodar fondos de otra persona es justo la pregunta que está con el abogado, así que no lo abrimos antes de la respuesta. Algo que no cobramos nosotros pero conviene que sepas: DeFindex, el protocolo de la bóveda, se lleva 20% sobre el rendimiento generado. Nirium nunca cobra un porcentaje de tu capital.'),
                            },
                            {
                                q: lang('How do I pay $0.02 if there is no card on file?', '¿Cómo pago $0.02 si no hay tarjeta?'),
                                // El cierre decía que los developers nuevos reciben un starter credit
                                // patrocinado. No existe: nada lo emite ni lo redime. Se reemplaza por lo
                                // que sí es gratis de verdad — testnet — que además responde mejor la
                                // pregunta real detrás de la pregunta: "¿puedo probar sin gastar?".
                                a: lang(
                                    'Your agent pays, not your finance team: the API replies 402, the SDK signs a USDC payment from your wallet, the facilitator settles it on-chain (network fees sponsored), and the API responds. One request, one payment, one receipt. To try it without spending, the same endpoints run on testnet with free faucet USDC.',
                                    'Paga tu agente, no tu equipo de finanzas: el API responde 402, el SDK firma un pago USDC desde tu wallet, el facilitador lo liquida on-chain (fees de red patrocinados) y el API responde. Un request, un pago, un recibo. Para probarlo sin gastar, los mismos endpoints corren en testnet con USDC de faucet.'),
                            },
                            {
                                q: lang('When does the treasury vault reach mainnet?', '¿Cuándo llega el vault de tesorería a mainnet?'),
                                a: lang(
                                    'The vault (the only component that touches client funds) stays on testnet until it clears a formal external Soroban audit — by design, not by limitation. The non-custodial nodes above did not need that gate because they never hold funds.',
                                    'El vault (el único componente que toca fondos de clientes) permanece en testnet hasta pasar una auditoría externa formal de Soroban — por diseño, no por limitación. Los nodos non-custodial de arriba no requieren ese gate porque nunca custodian fondos.'),
                            },
                            {
                                q: lang('Does Nirium custody my funds?', '¿Nirium custodia mis fondos?'),
                                a: lang(
                                    "No. The vault is 100% non-custodial. Nirium cannot move your funds without your signatures. It's a technical impossibility at the contract level.",
                                    'No. El vault es 100% non-custodial. Nirium no puede mover tus fondos sin tus firmas. Es una imposibilidad técnica al nivel del contrato.'),
                            },
                            {
                                q: lang('Who charges the financial commissions?', '¿Quién cobra las comisiones financieras?'),
                                a: lang(
                                    'Your Regulated Partner (ITF, casa de bolsa, or licensed fintech) sets and collects all financial fees. Etherfuse — an independent regulated operator — publishes its own fee schedule at etherfuse.com. Nirium only charges software license fees in fiat.',
                                    'Tu Partner Regulado (ITF, casa de bolsa o fintech licenciada) establece y cobra todos los fees financieros. Etherfuse — operador regulado independiente — publica su propio esquema de tarifas en etherfuse.com. Nirium solo cobra licencias de software en fiat.'),
                            },
                            {
                                q: lang('Are there volume discounts?', '¿Hay descuentos por volumen?'),
                                a: lang(
                                    'Yes on Enterprise. For high API volume or multi-tenant deployments, pricing is negotiable. Contact niriumprotocol@gmail.com.',
                                    'Sí en Enterprise. Para alto volumen de API o despliegues multi-tenant, los precios son negociables. Contacta a niriumprotocol@gmail.com.'),
                            },
                        ].map((faq) => (
                            <div key={faq.q} className="p-5 rounded-xl border border-white/10 bg-white/[0.02]">
                                <h3 className="text-sm font-bold mb-2">{faq.q}</h3>
                                <p className="text-sm text-white/60 leading-relaxed">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* DISCLAIMER */}
            <section className="py-8 border-t border-white/5">
                <div className="max-w-3xl mx-auto px-6">
                    <div className="p-5 rounded-xl border border-amber-500/20 bg-amber-500/[0.03]">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                            <p className="text-sm text-white/70 leading-relaxed">
                                {language === 'es' ? (
                                    <>Nirium opera actualmente en <strong>Stellar Testnet</strong>. Los precios de mainnet son indicativos y pueden cambiar antes del lanzamiento oficial. La tasa CETES (~5.57%) es una tasa de referencia Banxico, no una garantía de Nirium. No es asesoría financiera.</>
                                ) : (
                                    <>Nirium currently operates on <strong>Stellar Testnet</strong>. Mainnet prices are indicative and may change before official launch. CETES rate (~5.57%) is a Banxico reference rate, not a Nirium guarantee. Not financial advice.</>
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 border-t border-white/5">
                <div className="max-w-3xl mx-auto px-6 text-center">
                    <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
                        {lang('Start today.', 'Empieza hoy.')}
                    </h2>
                    <p className="mt-4 text-white/60">
                        {lang('No card. No contract. Cancel anytime.', 'Sin tarjeta. Sin contrato. Cancela cuando quieras.')}
                    </p>
                    <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
                        <Link href="/sandbox">
                            <Button size="lg" variant="premium">
                                {lang('Create free vault', 'Crear vault gratis')}
                                <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </Link>
                        <Link href="/developers">
                            <Button size="lg" variant="outline" className="border-white/20 hover:bg-white/5">
                                {lang('View docs', 'Ver documentación')}
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
