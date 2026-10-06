/** Nirium - home x402-first (rediseño 4-oct-2026) **/
'use client';

// La home dejó de ser un catálogo de nodos: abre con lo único que un dev puede
// hacer en cinco minutos - cobrarle a un agente por su API con x402Serve().
// Lo que vivía aquí antes no se borró: las secciones para CFO/tesorería están
// en /treasury (components/home/TreasuryPlainTerms), el catálogo de nodos en
// /agents y GET /api/nodes, y el resto de productos en "More from Nirium".

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import {
    ArrowRight, ChevronRight, ExternalLink, FileCheck, GitPullRequest,
    Lock, Send, ShieldCheck, BarChart3, Layers, Zap, Activity, Terminal,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/context/LanguageContext";
import LegalDisclaimer from "@/components/legal/LegalDisclaimer";
import { MAINNET_API_URL, PROOF_TX_HASH, PROOF_TX_URL, TREASURY_ACCOUNT, TREASURY_ACCOUNT_URL } from "@/lib/constants";

// El snippet de abajo se corrió TAL CUAL contra nirium@0.16.0 el 4-oct-2026
// (Node 22, express 5, @x402/* 2.28.0, facilitador de OpenZeppelin en testnet):
// 402 sin pago, 200 con pago, 0.05 USDC liquidado en esta tx. Si se edita el
// snippet, hay que volver a correrlo y cambiar este hash.
const SNIPPET_TESTNET_TX = 'd121b61cbf916790086837d0d9df2604fd3c0d69e9d6bfa7fcb42d64e35b1076';
const SNIPPET_TESTNET_TX_URL = `https://stellar.expert/explorer/testnet/tx/${SNIPPET_TESTNET_TX}`;

const SERVE_SNIPPET = `import express from 'express';
import { x402Serve } from 'nirium';

const app = express();
app.use(x402Serve({
  payTo: process.env.PAY_TO,                       // your G... address
  facilitatorApiKey: process.env.FACILITATOR_KEY,  // free testnet key
  routes: { 'GET /weather': '$0.05' },             // testnet by default
}));
app.get('/weather', (_req, res) => res.json({ tempC: 21 }));
app.listen(3000);`;

const INSTALL_CMD = 'npm i nirium express @x402/express @x402/core @x402/stellar';

const PAY_SNIPPET = `import { Agent } from 'nirium';

const agent = new Agent({ apiKey: 'unused' });
agent.initX402({ secretKey: process.env.PAYER_SECRET, network: 'stellar:testnet' });
const res = await agent.x402Fetch('http://localhost:3000/weather'); // 402 → sign → 200`;

const CHANGELOG_URL = 'https://github.com/nirium-protocol/nirium/blob/main/packages/sdk/CHANGELOG.md';
const PR_98_URL = 'https://github.com/nirium-protocol/nirium/pull/98';
const ISSUE_96_URL = 'https://github.com/nirium-protocol/nirium/issues/96';

// "Built with Nirium": maquetada y vacía a propósito. Cada ficha entra solo
// cuando el equipo dueño del proyecto aprobó su propio texto - nunca antes.
type BuiltWith = { name: string; url: string; en: string; es: string };
const BUILT_WITH: BuiltWith[] = [];

function CodeBlock({ code, filename, copyLabel, copiedLabel }: { code: string; filename: string; copyLabel: string; copiedLabel: string }) {
    const [copied, setCopied] = useState(false);
    return (
        <div className="relative rounded-xl border border-white/10 bg-black overflow-hidden text-left">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 bg-white/[0.02]">
                <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                    <span className="ml-3 text-xs text-white/40 font-mono">{filename}</span>
                </div>
                <button
                    type="button"
                    onClick={() => {
                        navigator.clipboard.writeText(code);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                    }}
                    className="text-xs text-white/50 hover:text-stellar-teal transition-colors font-mono"
                >
                    {copied ? copiedLabel : copyLabel}
                </button>
            </div>
            <pre className="p-4 sm:p-5 text-[12px] sm:text-[13px] text-white/80 font-mono leading-relaxed overflow-x-auto">
                <code>{code}</code>
            </pre>
        </div>
    );
}

export default function Home() {
    const { language } = useLanguage();
    const lang = (en: string, es: string) => (language === 'es' ? es : en);
    const copy = lang('Copy', 'Copiar');
    const copied = lang('Copied!', '¡Copiado!');

    const adds = [
        {
            icon: ShieldCheck,
            tag: lang('Since 0.15.0 · opt-in', 'Desde 0.15.0 · opcional'),
            title: lang('Replay guard and rate limit', 'Protección contra replay y rate limit'),
            body: lang(
                'Pass a guard store to x402Serve() and a replayed payment proof is refused: one payment, one response. Add a per-IP sliding-window rate limit on top. Replay protection fails closed (503) if the store is down. Generalized from a production integrator’s own implementation, credited in the changelog.',
                'Pásale un store en guard a x402Serve() y una prueba de pago repetida se rechaza: un pago, una respuesta. Encima puedes poner un rate limit por IP con ventana deslizante. La protección contra replay falla cerrada (503) si el store no responde. Generalizado de la implementación propia de un integrador en producción, acreditado en el changelog.'),
            link: { href: CHANGELOG_URL, label: 'CHANGELOG' },
        },
        {
            icon: FileCheck,
            tag: lang('Live on mainnet · free beta', 'En vivo en mainnet · beta gratis'),
            title: lang('Verifiable receipts with Audit Trail', 'Recibos verificables con Audit Trail'),
            body: lang(
                'Anchor the settlement hash, or the sha-256 of any record, and get back an IPFS receipt anyone can check from the CID alone. Sign it with any Stellar key and the receipt also proves who declared it. One API call. Anchor hashes, not raw personal data.',
                'Ancla el hash de la liquidación, o el sha-256 de cualquier registro, y recibe un recibo IPFS que cualquiera puede revisar solo con el CID. Fírmalo con cualquier llave de Stellar y el recibo prueba también quién lo declaró. Una llamada de API. Ancla hashes, no datos personales crudos.'),
            link: { href: `${MAINNET_API_URL}/api/audit/info`, label: 'GET /api/audit/info' },
        },
        {
            icon: Lock,
            tag: lang('New in 0.16.0 · experimental', 'Nuevo en 0.16.0 · experimental'),
            title: lang('Buyer-side policy hook', 'Hook de políticas del comprador'),
            body: lang(
                'On the paying side, initX402({ policy }) asks your policy engine after the Stellar authorization is built and before anything is signed. Only an ALLOW bound to that exact authorization reaches the signer. Not solved yet: L01, concurrent requests that see the same remaining capacity, and L02, code in the same process that holds the raw signer. The shape can still change before 1.0.',
                'Del lado que paga, initX402({ policy }) le pregunta a tu motor de políticas después de armar la autorización de Stellar y antes de firmar nada. Solo un ALLOW atado a esa autorización exacta llega al firmante. Sin resolver todavía: L01, peticiones concurrentes que ven la misma capacidad restante, y L02, código en el mismo proceso que tiene el firmante crudo. La forma todavía puede cambiar antes de 1.0.'),
            link: { href: PR_98_URL, label: 'PR #98 · #96' },
        },
    ];

    const proofs = [
        {
            icon: Activity,
            title: lang('Live mainnet endpoint', 'Endpoint vivo en mainnet'),
            detail: 'GET /api/v1/premium/market',
            cta: lang('answers 402 right now', 'responde 402 ahora mismo'),
            href: `${MAINNET_API_URL}/api/v1/premium/market`,
        },
        {
            icon: Zap,
            title: lang('First mainnet x402 settlement', 'Primer settlement x402 en mainnet'),
            detail: `${PROOF_TX_HASH.slice(0, 20)}…`,
            cta: 'stellar.expert',
            href: PROOF_TX_URL,
        },
        {
            icon: Lock,
            title: lang('Public revenue account', 'Cuenta de ingresos pública'),
            detail: `${TREASURY_ACCOUNT.slice(0, 12)}…${TREASURY_ACCOUNT.slice(-6)}`,
            cta: lang('every payment on-chain', 'cada pago on-chain'),
            href: TREASURY_ACCOUNT_URL,
        },
        {
            icon: BarChart3,
            title: lang('Usage stats, including who pays', 'Estadísticas de uso, incluido quién paga'),
            detail: '/stats',
            cta: lang('counted from Horizon', 'contado desde Horizon'),
            href: '/stats',
            internal: true,
        },
        {
            icon: GitPullRequest,
            title: lang('Policy hook, merged in public', 'Hook de políticas, mergeado en público'),
            detail: 'nirium-protocol/nirium#98',
            cta: 'GitHub',
            href: PR_98_URL,
        },
        {
            icon: Terminal,
            title: lang('The snippet above, run verbatim', 'El snippet de arriba, corrido tal cual'),
            detail: `${SNIPPET_TESTNET_TX.slice(0, 20)}…`,
            cta: lang('testnet, 2026-10-04', 'testnet, 2026-10-04'),
            href: SNIPPET_TESTNET_TX_URL,
        },
    ];

    const more = [
        {
            icon: FileCheck,
            title: 'Audit Trail',
            status: lang('Mainnet · free beta', 'Mainnet · beta gratis'),
            tone: 'live' as const,
            body: lang('Immutable IPFS receipts for any record, optionally signed by the agent that declared it.', 'Recibos IPFS inmutables para cualquier registro, opcionalmente firmados por el agente que lo declaró.'),
            href: '/developers',
        },
        {
            icon: BarChart3,
            title: 'Reporting',
            status: lang('Mainnet · read-only', 'Mainnet · solo lectura'),
            tone: 'live' as const,
            body: lang('Summaries and CSV/JSON exports of payments, payout runs and receipts. What you file with a regulator stays your responsibility.', 'Resúmenes y exportes CSV/JSON de pagos, corridas de payouts y recibos. Lo que presentes ante un regulador sigue siendo tu responsabilidad.'),
            href: `${MAINNET_API_URL}/api/reporting/summary?network=mainnet`,
        },
        {
            icon: Layers,
            title: 'Treasury',
            status: lang('Mainnet · invite-only', 'Mainnet · solo invitación'),
            tone: 'gated' as const,
            body: lang('Idle capital moves into a CETES strategy and back over a DeFindex vault you own. Invite-only while legal review closes.', 'El capital ocioso entra a una estrategia de CETES y regresa, sobre una bóveda DeFindex tuya. Solo por invitación mientras cierra la revisión legal.'),
            href: '/treasury',
        },
        {
            icon: Send,
            title: 'Payouts',
            status: lang('Mainnet · early access', 'Mainnet · early access'),
            tone: 'gated' as const,
            body: lang('Pay up to 100 recipients in one batch you sign yourself: your own contractors and suppliers. Independent service payments only, not employee salary.', 'Paga hasta 100 destinatarios en un lote que firmas tú: tus propios contratistas y proveedores. Solo pagos por prestación de servicios, no salario de empleados.'),
            href: '/payouts',
        },
        {
            icon: Zap,
            title: 'MPP Charge',
            status: lang('Experimental · not available on mainnet', 'Experimental · no disponible en mainnet'),
            tone: 'experimental' as const,
            body: lang('A client for MPP Charge ships in the package. It has not been verified end to end against our hosted endpoints; use x402 for paid access.', 'El paquete trae un cliente de MPP Charge. No se ha verificado de punta a punta contra nuestros endpoints alojados; para acceso pagado usa x402.'),
            note: lang(
                'Update, 2026-10-04 (checked against the nirium 0.16.0 changelog that day): this page used to say MPP Charge was live on mainnet. That was wrong.',
                'Actualización, 2026-10-04 (verificado contra el changelog de nirium 0.16.0 ese día): esta página decía que MPP Charge estaba en vivo en mainnet. Era incorrecto.'),
            href: '/developers',
        },
    ];

    const toneClass = {
        live: 'border-emerald-400/25 bg-emerald-400/10 text-emerald-400',
        gated: 'border-stellar-teal/25 bg-stellar-teal/10 text-stellar-teal',
        experimental: 'border-amber-400/25 bg-amber-400/10 text-amber-400',
    };

    return (
        <main className="min-h-screen bg-black text-white antialiased overflow-x-hidden">
            <Navbar />

            <div className="w-full pt-[115px] sm:pt-[140px] px-0 sm:px-4 flex justify-center relative z-50">
                <LegalDisclaimer variant="banner" locale={language === 'es' ? 'es' : 'en'} className="w-full max-w-[1600px] sm:rounded-xl shadow-2xl" />
            </div>

            {/* HERO */}
            <section className="relative pt-8 sm:pt-12 pb-16 sm:pb-20 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(45,235,232,0.08),transparent_60%)]" />
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-12">
                        <div className="flex-1 min-w-0 flex flex-col items-center lg:items-start text-center lg:text-left lg:pt-6">
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
                                {lang('x402 on Stellar · live on mainnet', 'x402 en Stellar · en vivo en mainnet')}
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.05 }}
                                className="text-4xl sm:text-5xl xl:text-6xl font-black leading-[1.05] tracking-tight"
                            >
                                {language === 'es' ? (
                                    <>Cobra a agentes de IA <span className="bg-gradient-to-r from-stellar-teal to-stellar-yellow bg-clip-text text-transparent">por tu API.</span></>
                                ) : (
                                    <>Charge AI agents <span className="bg-gradient-to-r from-stellar-teal to-stellar-yellow bg-clip-text text-transparent">for your API.</span></>
                                )}
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                                className="mt-5 text-base sm:text-lg text-white/60 max-w-xl leading-relaxed"
                            >
                                {lang(
                                    'Try it on testnet in 5 minutes: your API answers 402, the agent pays in USDC on Stellar, settled in ~4s. Funds go straight from payer to you - Nirium never touches them.',
                                    'Pruébalo en testnet en 5 minutos: tu API responde 402, el agente paga en USDC sobre Stellar, liquidado en ~4s. El dinero va directo del pagador a ti - Nirium nunca lo toca.')}
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.15 }}
                                className="mt-8 grid grid-cols-3 gap-4 sm:gap-6 w-full max-w-sm"
                            >
                                <div>
                                    <div className="text-2xl sm:text-3xl font-black text-white">$0.05</div>
                                    <div className="text-[10px] uppercase tracking-widest text-white/40 mt-1">{lang('Per x402 request', 'Por request x402')}</div>
                                </div>
                                <div className="border-x border-white/5 px-3 sm:px-4">
                                    <div className="text-2xl sm:text-3xl font-black text-white">~4s</div>
                                    <div className="text-[10px] uppercase tracking-widest text-white/40 mt-1">{lang('On-chain settlement', 'Liquidación on-chain')}</div>
                                </div>
                                <div>
                                    <div className="text-2xl sm:text-3xl font-black text-white">0</div>
                                    <div className="text-[10px] uppercase tracking-widest text-white/40 mt-1">{lang('Funds custodied', 'Fondos en custodia')}</div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="mt-8 flex flex-col sm:flex-row gap-3 w-full sm:w-auto"
                            >
                                <a href="#try-testnet">
                                    <Button size="lg" variant="premium" className="w-full sm:w-auto">
                                        {lang('Try on testnet', 'Pruébalo en testnet')}
                                        <ArrowRight className="ml-2 w-4 h-4" />
                                    </Button>
                                </a>
                                <a href="mailto:niriumprotocol@gmail.com?subject=Mainnet%20access%20request">
                                    <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/20 hover:bg-white/5">
                                        {lang('Request mainnet access', 'Solicita acceso a mainnet')}
                                    </Button>
                                </a>
                            </motion.div>
                            <p className="mt-3 text-[11px] text-white/35 leading-relaxed max-w-xl">
                                {lang(
                                    'Third-party facilitator use of x402Serve() on mainnet is invite-only while legal review closes - same gate as Treasury and Payouts.',
                                    'Usar x402Serve() como facilitador de terceros en mainnet es solo por invitación mientras cierra la revisión legal - la misma puerta que Treasury y Payouts.')}
                            </p>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.25 }}
                            className="w-full lg:w-[560px] xl:w-[600px] shrink-0 min-w-0"
                        >
                            <CodeBlock code={SERVE_SNIPPET} filename="server.js" copyLabel={copy} copiedLabel={copied} />
                            <p className="mt-3 text-[11px] text-white/40 font-mono leading-relaxed">
                                {lang('Ran verbatim with nirium@0.16.0 on testnet: ', 'Corrido tal cual con nirium@0.16.0 en testnet: ')}
                                <a href={SNIPPET_TESTNET_TX_URL} target="_blank" rel="noopener noreferrer" className="text-stellar-teal/80 hover:text-stellar-teal underline underline-offset-2">
                                    {lang('402, then paid, then 200', '402, luego pago, luego 200')}
                                </a>
                                .
                            </p>
                            <p className="mt-2 text-[11px] text-white/35 leading-relaxed">
                                {lang(
                                    'x402Serve() is a library that runs on your own server, with your own facilitator key. You remain responsible for compliance in your jurisdiction; ',
                                    'x402Serve() es una librería que corre en tu propio servidor, con tu propia llave de facilitador. Tú sigues siendo responsable del cumplimiento en tu jurisdicción; ')}
                                <a href="/legal/restricted-jurisdictions-v1.md" className="underline underline-offset-2 hover:text-white/60">
                                    {lang('restricted jurisdictions apply', 'aplican jurisdicciones restringidas')}
                                </a>
                                .
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* TRY IT ON TESTNET - los mismos tres pasos que se corrieron para verificar el snippet */}
            <section id="try-testnet" className="py-16 sm:py-20 border-t border-white/5 scroll-mt-28">
                <div className="max-w-5xl mx-auto px-4 sm:px-6">
                    <h2 className="text-2xl sm:text-3xl font-bold text-center">
                        {lang('Try it on testnet', 'Pruébalo en testnet')}
                    </h2>
                    <p className="mt-4 text-center text-white/55 max-w-xl mx-auto text-sm">
                        {lang('Three steps, no real money. Node.js 22.12 or newer.', 'Tres pasos, sin dinero real. Node.js 22.12 o más reciente.')}
                    </p>

                    <div className="mt-12 grid lg:grid-cols-3 gap-6">
                        <div className="min-w-0 p-6 rounded-xl border border-white/10 bg-white/[0.02]">
                            <div className="text-xs font-mono text-white/30 mb-3">01</div>
                            <h3 className="text-lg font-bold mb-2">{lang('Install', 'Instala')}</h3>
                            <p className="text-sm text-white/60 leading-relaxed mb-4">
                                {lang('The package plus the x402 pieces x402Serve() loads on demand.', 'El paquete más las piezas de x402 que x402Serve() carga al montarse.')}
                            </p>
                            <pre className="p-3 rounded-lg bg-black border border-white/10 text-[11px] font-mono text-white/75 whitespace-pre-wrap break-all">{INSTALL_CMD}</pre>
                        </div>
                        <div className="min-w-0 p-6 rounded-xl border border-white/10 bg-white/[0.02]">
                            <div className="text-xs font-mono text-white/30 mb-3">02</div>
                            <h3 className="text-lg font-bold mb-2">{lang('Charge per request', 'Cobra por request')}</h3>
                            <p className="text-sm text-white/60 leading-relaxed">
                                {lang(
                                    'Get a free testnet facilitator key from OpenZeppelin, set PAY_TO to a testnet address with a USDC trustline, and run server.js. Without payment, GET /weather answers 402 with the price.',
                                    'Saca una llave gratis de facilitador de testnet en OpenZeppelin, pon en PAY_TO una dirección de testnet con trustline de USDC y corre server.js. Sin pago, GET /weather responde 402 con el precio.')}
                            </p>
                            <a href="https://channels.openzeppelin.com/testnet/gen" target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-xs text-stellar-teal hover:underline">
                                channels.openzeppelin.com/testnet/gen <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>
                        <div className="min-w-0 p-6 rounded-xl border border-white/10 bg-white/[0.02]">
                            <div className="text-xs font-mono text-white/30 mb-3">03</div>
                            <h3 className="text-lg font-bold mb-2">{lang('Pay it from an agent', 'Págalo desde un agente')}</h3>
                            <p className="text-sm text-white/60 leading-relaxed mb-4">
                                {lang('Any x402 client works. With the same package, from a testnet account that holds USDC:', 'Sirve cualquier cliente x402. Con el mismo paquete, desde una cuenta de testnet con USDC:')}
                            </p>
                            <CodeBlock code={PAY_SNIPPET} filename="pay.mjs" copyLabel={copy} copiedLabel={copied} />
                        </div>
                    </div>
                </div>
            </section>

            {/* WHAT NIRIUM ADDS */}
            <section className="py-16 sm:py-20 border-t border-white/5 bg-gradient-to-b from-black to-stellar-teal/[0.03]">
                <div className="max-w-5xl mx-auto px-4 sm:px-6">
                    <h2 className="text-2xl sm:text-3xl font-bold text-center">
                        {lang('What Nirium adds on top of x402', 'Lo que Nirium agrega encima de x402')}
                    </h2>
                    <p className="mt-4 text-center text-white/55 max-w-xl mx-auto text-sm">
                        {lang('x402 moves the payment. These are the parts you would otherwise write yourself.', 'x402 mueve el pago. Esto es lo que de otro modo escribirías tú.')}
                    </p>
                    <div className="mt-12 grid md:grid-cols-3 gap-6">
                        {adds.map((a) => (
                            <div key={a.title} className="min-w-0 flex flex-col p-6 rounded-xl border border-white/10 bg-black/50">
                                <div className="flex items-center justify-between gap-3 mb-4">
                                    <div className="p-2.5 rounded-lg bg-stellar-teal/10">
                                        <a.icon className="w-5 h-5 text-stellar-teal" />
                                    </div>
                                    <span className="text-[9px] font-mono uppercase tracking-widest text-white/40 text-right">{a.tag}</span>
                                </div>
                                <h3 className="text-lg font-bold mb-2">{a.title}</h3>
                                <p className="text-sm text-white/60 leading-relaxed flex-1">{a.body}</p>
                                <a href={a.link.href} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-1.5 text-xs font-mono text-stellar-teal/80 hover:text-stellar-teal">
                                    {a.link.label} <ExternalLink className="w-3 h-3" />
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* PROOF - no nos creas: verifícanos */}
            <section className="py-14 border-t border-emerald-400/10 bg-gradient-to-b from-emerald-400/[0.04] to-transparent">
                <div className="max-w-5xl mx-auto px-4 sm:px-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
                        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-emerald-400">
                            {lang("Don't trust us. Verify us.", 'No nos creas. Verifícanos.')}
                        </h2>
                        <p className="text-[11px] text-white/40 font-mono text-center">
                            {lang('Every claim below resolves to something public.', 'Cada claim de abajo resuelve en algo público.')}
                        </p>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {proofs.map((p) => {
                            const inner = (
                                <>
                                    <p.icon className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                    <div className="min-w-0">
                                        <div className="text-xs font-bold text-white/90">{p.title}</div>
                                        <div className="text-[10px] font-mono text-white/35 truncate mt-0.5">{p.detail}</div>
                                        <div className="text-[10px] text-emerald-400/70 mt-1 inline-flex items-center gap-1">{p.cta} {!p.internal && <ExternalLink className="w-2.5 h-2.5" />}</div>
                                    </div>
                                </>
                            );
                            const cls = "flex items-start gap-3 p-4 rounded-xl border border-emerald-400/15 bg-black/40 hover:border-emerald-400/40 transition-colors";
                            return p.internal ? (
                                <Link key={p.title} href={p.href} className={cls}>{inner}</Link>
                            ) : (
                                <a key={p.title} href={p.href} target="_blank" rel="noopener noreferrer" className={cls}>{inner}</a>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* BUILT WITH NIRIUM - sin fichas hasta que cada equipo apruebe su texto */}
            <section className="py-16 sm:py-20 border-t border-white/5">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
                    <h2 className="text-2xl sm:text-3xl font-bold">{lang('Built with Nirium', 'Hecho con Nirium')}</h2>
                    <p className="mt-4 text-white/55 max-w-xl mx-auto text-sm">
                        {lang('Projects charging for their own API with x402Serve(). Each listing goes up once its team approves the text.', 'Proyectos que cobran por su propia API con x402Serve(). Cada ficha se publica cuando su equipo aprueba el texto.')}
                    </p>
                    {BUILT_WITH.length > 0 ? (
                        <div className="mt-10 grid sm:grid-cols-2 gap-6 text-left">
                            {BUILT_WITH.map((b) => (
                                <a key={b.name} href={b.url} target="_blank" rel="noopener noreferrer" className="min-w-0 p-6 rounded-xl border border-white/10 bg-white/[0.02] hover:border-stellar-teal/30 transition-colors">
                                    <h3 className="text-lg font-bold mb-2 inline-flex items-center gap-2">{b.name} <ExternalLink className="w-3.5 h-3.5 text-white/40" /></h3>
                                    <p className="text-sm text-white/60 leading-relaxed">{lang(b.en, b.es)}</p>
                                </a>
                            ))}
                        </div>
                    ) : (
                        <div className="mt-10 rounded-xl border border-dashed border-white/15 px-6 py-10 text-sm text-white/40">
                            {lang('Listings coming soon.', 'Fichas próximamente.')}{' '}
                            <a href="mailto:niriumprotocol@gmail.com" className="text-stellar-teal/80 hover:text-stellar-teal underline underline-offset-2">
                                {lang('Built something with x402Serve()? Tell us.', '¿Construiste algo con x402Serve()? Cuéntanos.')}
                            </a>
                        </div>
                    )}
                </div>
            </section>

            {/* MORE FROM NIRIUM */}
            <section className="py-16 sm:py-20 border-t border-white/5">
                <div className="max-w-5xl mx-auto px-4 sm:px-6">
                    <h2 className="text-xl sm:text-2xl font-bold">{lang('More from Nirium', 'Más de Nirium')}</h2>
                    <p className="mt-2 text-sm text-white/45">
                        {lang('Everything here is non-custodial. Each status is what runs today, not a roadmap.', 'Todo aquí es non-custodial. Cada estado es lo que corre hoy, no un roadmap.')}
                    </p>
                    <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {more.map((m) => {
                            const external = m.href.startsWith('http');
                            const inner = (
                                <>
                                    <div className="flex items-center justify-between gap-2 mb-3">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <m.icon className="w-4 h-4 text-white/60 shrink-0" />
                                            <h3 className="text-sm font-bold text-white/90 truncate">{m.title}</h3>
                                        </div>
                                        <ChevronRight className="w-3.5 h-3.5 text-white/30 shrink-0" />
                                    </div>
                                    <span className={`inline-flex px-1.5 py-0.5 rounded border text-[8px] font-black uppercase tracking-widest ${toneClass[m.tone]}`}>{m.status}</span>
                                    <p className="mt-3 text-xs text-white/50 leading-relaxed">{m.body}</p>
                                    {m.note && <p className="mt-2 text-[10px] text-white/35 leading-relaxed">{m.note}</p>}
                                </>
                            );
                            const cls = "min-w-0 block p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:border-white/25 transition-colors";
                            return external ? (
                                <a key={m.title} href={m.href} target="_blank" rel="noopener noreferrer" className={cls}>{inner}</a>
                            ) : (
                                <Link key={m.title} href={m.href} className={cls}>{inner}</Link>
                            );
                        })}
                    </div>
                    <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs">
                        <Link href="/dashboard" className="text-stellar-teal/80 hover:text-stellar-teal inline-flex items-center gap-1">
                            {lang('Open the testnet dashboard', 'Abrir el dashboard de testnet')} <ChevronRight className="w-3 h-3" />
                        </Link>
                        <Link href="/agents" className="text-stellar-teal/80 hover:text-stellar-teal inline-flex items-center gap-1">
                            {lang('All execution nodes', 'Todos los nodos de ejecución')} <ChevronRight className="w-3 h-3" />
                        </Link>
                        <Link href="/pricing" className="text-stellar-teal/80 hover:text-stellar-teal inline-flex items-center gap-1">
                            {lang('Pricing', 'Precios')} <ChevronRight className="w-3 h-3" />
                        </Link>
                    </div>

                    {/* Aviso legal - puntero corto; el texto canónico vive en /disclaimers. */}
                    <p className="mt-10 text-[10px] text-white/30 font-mono leading-relaxed border border-white/5 rounded-lg px-5 py-3 bg-white/[0.01]">
                        <span className="text-white/45 font-semibold uppercase tracking-widest">
                            {lang('Legal notice', 'Aviso legal')} -{' '}
                        </span>
                        {lang(
                            'Nirium is B2B software-only infrastructure and never custodies funds; financial services (SPEI onramp, CETES custody) are operated by regulated partners.',
                            'Nirium es infraestructura de software B2B y nunca custodia fondos; los servicios financieros (onramp SPEI, custodia de CETES) los operan partners regulados.')}
                        {' '}
                        <Link href="/disclaimers" className="text-stellar-teal/80 hover:text-stellar-teal underline underline-offset-2 font-bold">
                            {lang('Read full legal notice →', 'Ver aviso legal completo →')}
                        </Link>
                    </p>
                </div>
            </section>

            {/* FINAL CTA */}
            <section className="py-20 sm:py-24 border-t border-white/5">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
                    <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
                        {lang('Your API, paid per request.', 'Tu API, pagada por request.')}
                    </h2>
                    <p className="mt-4 text-white/60 max-w-xl mx-auto">
                        {lang('Start on testnet in five minutes. Mainnet for third-party facilitators is invite-only while legal review closes.', 'Empieza en testnet en cinco minutos. Mainnet para facilitadores de terceros es solo por invitación mientras cierra la revisión legal.')}
                    </p>
                    <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
                        <a href="#try-testnet">
                            <Button size="lg" variant="premium" className="w-full sm:w-auto">
                                {lang('Try on testnet', 'Pruébalo en testnet')}
                                <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </a>
                        <a href="https://github.com/nirium-protocol/nirium" target="_blank" rel="noopener noreferrer">
                            <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/20 hover:bg-white/5">
                                GitHub
                                <ExternalLink className="ml-2 w-4 h-4" />
                            </Button>
                        </a>
                    </div>
                    <Link href="/stats" className="mt-6 inline-flex items-center gap-1.5 text-sm text-stellar-teal hover:underline">
                        {lang('See live usage', 'Ver uso en vivo')} <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
            </section>

            {/* BUILT ON OPEN STANDARDS */}
            <section className="py-12 border-t border-white/5 bg-black/50 text-center">
                <div className="max-w-3xl mx-auto px-4 sm:px-6">
                    <h3 className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-4">Built on Open Standards</h3>
                    <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-white/60 mb-6">
                        <span className="font-mono">x402</span>
                        <span className="text-white/20">•</span>
                        <span className="font-mono">MPP <span className="text-white/35">({lang('experimental', 'experimental')})</span></span>
                        <span className="text-white/20">•</span>
                        <span className="font-mono">LCP <span className="text-white/35">({lang('in legal review', 'en revisión legal')})</span></span>
                        <span className="text-white/20">•</span>
                        <span className="font-mono">Apache 2.0</span>
                        <span className="text-white/20">•</span>
                        <span className="font-mono text-emerald-400">Stellar Mainnet</span>
                        <span className="text-white/20">+</span>
                        <span className="font-mono text-stellar-teal">Testnet</span>
                    </div>
                    <p className="text-[10px] text-zinc-500 font-mono">
                        {lang('All rate data shown is protocol reference information only - not a return projection or guarantee.', 'Toda tasa mostrada es información de referencia del protocolo - no una proyección ni garantía de retorno.')}
                    </p>
                </div>
            </section>

            <Footer />
        </main>
    );
}
