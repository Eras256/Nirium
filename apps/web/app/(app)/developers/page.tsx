/** Nirium Developers — SDK + x402 + MPP + MCP server **/
'use client';

import Link from "next/link";
import {
    Code2, Terminal, Zap, ArrowRight, CheckCircle2,
    Copy, Sparkles, Package, Cpu, Globe, ChevronRight,
    Server, Boxes, Layers, Shield, ExternalLink, Activity, 
    Lock, TrendingUp, Layers as LayersIcon, Send
} from "lucide-react";
import { ComplianceBanner } from "@/components/ui/ComplianceBanner";
import { PollarPayCard } from "@/components/shared/PollarPayCard";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/context/LanguageContext";
import { useState } from "react";
import { motion } from "framer-motion";

function CodeBlock({ code, lang: langLabel = "typescript" }: { code: string; lang?: string }) {
    const [copied, setCopied] = useState(false);
    return (
        <div className="relative rounded-2xl border border-white/10 bg-[#080808] overflow-hidden group w-full">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 bg-white/[0.02]">
                <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/40" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/40" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/40" />
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">{langLabel}</span>
                    <button
                        onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                        className="flex items-center gap-1.5 text-[10px] text-stellar-teal opacity-50 group-hover:opacity-100 transition-opacity"
                    >
                        <Copy className="w-3 h-3" />
                        {copied ? 'COPIED' : 'COPY'}
                    </button>
                </div>
            </div>
            <div className="p-6 font-mono text-xs sm:text-sm leading-relaxed overflow-x-auto selection:bg-stellar-teal/30">
                <code className="text-gray-300 whitespace-pre">{code}</code>
            </div>
        </div>
    );
}

const INSTALL_CODE = `npm install nirium`;

const QUICKSTART_CODE = `import { Agent } from "nirium";

const agent = new Agent({
  apiKey: process.env.NIRIUM_API_KEY,
  baseUrl: "https://nirium-agent.fly.dev",
});

// Live market data — rates attributed to their source
const market = await agent.getMarket();

// The node catalog: what runs, on which network
const nodes = await agent.getNodes();

// Anchor evidence to IPFS and get a verifiable CID back
const { cid } = await agent.anchorAuditRecord({ hash: "<sha256>" });`;

const X402_CODE = `import { Agent } from "nirium";

const agent = new Agent({ baseUrl: "https://nirium-agent-mainnet.fly.dev" });

// PAY for someone else's API. The 402, the signature and the retry
// happen underneath — you just await a fetch.
agent.initX402({
  secretKey: process.env.STELLAR_SECRET_KEY,   // or { signer } from a wallet
  network: "stellar:pubnet",
});

const res = await agent.x402Fetch(
  "https://nirium-agent-mainnet.fly.dev/api/v1/premium/market",   // $0.05 USDC
);
const data = await res.json();

// ─────────────────────────────────────────────────────────────
// CHARGE for YOUR OWN API. Same rail, other side of the counter.
// Funds go payer → you. They never touch Nirium.
import { x402Serve } from "nirium";

app.use("/premium", x402Serve({
  payTo: "G...",                                  // your Stellar address
  routes: { "GET /signals": "$0.02" },
  facilitatorApiKey: process.env.X402_FACILITATOR_API_KEY,
}));`;

const MPP_CODE = `import { Agent } from "nirium";

const agent = new Agent({ baseUrl: "https://nirium-agent-mainnet.fly.dev" });

// MPP Charge: the client signs a full USDC transfer inside each request.
// No external facilitator — the server validates by simulation and submits.
agent.initMpp({
  secretKey: process.env.STELLAR_SECRET_KEY,
  network: "stellar:pubnet",
});

// $0.05 USDC — charges and delivers on mainnet
const res = await agent.mppFetch(
  "https://nirium-agent-mainnet.fly.dev/api/v1/mpp/market",
);

// Note: /signals and /execute are testnet-only. Signals come from the
// autonomous loop and execution needs a signing key; the mainnet box has
// neither by design, so it answers 501 without charging you.
`;

const MCP_CODE = `// Claude Desktop config (~/.claude/claude_desktop_config.json)
{
  "mcpServers": {
    "nirium": {
      "command": "npx",
      "args": ["-y", "nirium-mcp"],
      "env": {
        "NIRIUM_API_KEY": "your_key_here"
      }
    }
  }
}`;

// Cada ruta de esta tabla existe y fue probada contra la API viva: 200 donde es
// pública, 401 donde pide credencial, 402 donde pide pago x402, 400 donde faltan
// parámetros — ninguna 404. La tabla anterior listaba `/v1/vault/*`,
// `/v1/x402/*` y `/v1/compliance/*`, que nunca existieron: copiar cualquiera de
// esas filas devolvía 404 en la página que un desarrollador abre primero.
const ENDPOINTS = [
    // Público
    { method: 'GET',  path: '/health',                    desc_en: 'Liveness probe',                          desc_es: 'Sonda de disponibilidad' },
    { method: 'GET',  path: '/api/info',                  desc_en: 'Agent metadata, network and version',     desc_es: 'Metadatos del agente, red y versión' },
    { method: 'GET',  path: '/api/tickers',               desc_en: 'CETES + Blend reference rates',           desc_es: 'Tasas de referencia CETES + Blend' },
    { method: 'GET',  path: '/api/nodes',                 desc_en: 'Execution Node catalog (status + custody)', desc_es: 'Catálogo de Execution Nodes (estado + custodia)' },
    { method: 'GET',  path: '/api/loop/status',           desc_en: 'Autonomous loop state + last decision',   desc_es: 'Estado del loop autónomo + última decisión' },
    { method: 'POST', path: '/api/execute-demo',          desc_en: 'Run a demo rebalance — no key required',  desc_es: 'Corre un rebalanceo demo — sin llave' },

    // Auth
    { method: 'POST', path: '/api/auth/token',            desc_en: 'Exchange credentials for a JWT',          desc_es: 'Cambia credenciales por un JWT' },
    { method: 'POST', path: '/api/auth/keys',             desc_en: 'Issue an API key (also GET / DELETE)',    desc_es: 'Emite una API key (también GET / DELETE)' },

    // x402 — pago por request
    { method: 'GET',  path: '/api/v1/premium/signals',    desc_en: 'Premium signals — $0.02 USDC (x402)',     desc_es: 'Señales premium — $0.02 USDC (x402)' },
    { method: 'GET',  path: '/api/v1/premium/market',     desc_en: 'Enriched market state — $0.05 USDC (x402)', desc_es: 'Estado de mercado — $0.05 USDC (x402)' },
    { method: 'POST', path: '/api/v1/premium/execute',    desc_en: 'Paid strategy execution — $0.25 USDC (x402)', desc_es: 'Ejecución pagada — $0.25 USDC (x402)' },

    // MPP Charge
    { method: 'GET',  path: '/api/v1/mpp/signals',        desc_en: 'Premium signals — $0.02 USDC per call',  desc_es: 'Señales premium — $0.02 USDC por llamada' },
    { method: 'GET',  path: '/api/v1/mpp/market',         desc_en: 'Enriched market state — $0.05 USDC',     desc_es: 'Estado de mercado enriquecido — $0.05 USDC' },
    { method: 'POST', path: '/api/v1/mpp/execute',        desc_en: 'Paid strategy execution — $0.25 USDC',   desc_es: 'Ejecución de estrategia pagada — $0.25 USDC' },
    { method: 'GET',  path: '/api/v1/mpp/info',           desc_en: 'Active mode, routes and pricing',        desc_es: 'Modo activo, rutas y precios' },

    // Audit Trail
    { method: 'POST', path: '/api/audit/log',             desc_en: 'Anchor a record to IPFS — optional agent signature', desc_es: 'Ancla un registro en IPFS — firma de agente opcional' },
    { method: 'GET',  path: '/api/audit/info',            desc_en: 'Audit node metadata and limits',          desc_es: 'Metadatos y límites del nodo de auditoría' },

    // Reporting
    { method: 'GET',  path: '/api/reporting/summary',     desc_en: 'Consolidated summary by period and network', desc_es: 'Sumario consolidado por periodo y red' },
    { method: 'GET',  path: '/api/reporting/export',      desc_en: 'Institutional-format export (CSV / JSON)', desc_es: 'Export en formato institucional (CSV / JSON)' },

    // Payouts
    { method: 'POST', path: '/api/payroll/run',          desc_en: 'Build a batch payout (unsigned XDR)',   desc_es: 'Arma un pago batch (XDR sin firmar)' },
    { method: 'POST', path: '/api/payroll/submit',       desc_en: 'Broadcast company-signed payout',       desc_es: 'Transmite el pago firmado por la empresa' },
    { method: 'POST', path: '/api/payroll/onboard',      desc_en: 'Add a USDC trustline (self-signed)',    desc_es: 'Agrega trustline USDC (self-signed)' },
    { method: 'GET',  path: '/api/payroll/runs',         desc_en: 'Payout history + IPFS/LCP receipts',    desc_es: 'Historial de pagos + recibos IPFS/LCP' },
];

const MCP_TOOLS = [
    { name: 'get_market_state',        desc_en: 'Get live tickers: XLM/USDC price, base fee, Blend supply rate', desc_es: 'Tasas en vivo: precio XLM/USDC, base fee y tasa de suministro de Blend' },
    { name: 'get_loop_status',         desc_en: 'Check autonomous loop status, scan count, and uptime', desc_es: 'Estado del lazo autónomo: scans, uptime y telemetría' },
    { name: 'start_loop',              desc_en: 'Start the autonomous market scanning loop (Auth)',      desc_es: 'Inicia el lazo autónomo de escaneo de mercado (Auth)' },
    { name: 'stop_loop',               desc_en: 'Stop the autonomous market scanning loop (Auth)',       desc_es: 'Detiene el lazo autónomo de escaneo de mercado (Auth)' },
    { name: 'execute_demo',            desc_en: 'Simulate a strategy via Soroban dry-run (Free)',        desc_es: 'Simula una estrategia vía Soroban dry-run (Gratis)' },
    { name: 'get_premium_signals',     desc_en: 'Market signals from the autonomous loop, testnet only — factual data, not a recommendation ($0.02 USDC)',   desc_es: 'Señales del loop autónomo, solo testnet — datos, no recomendación ($0.02 USDC)' },
    { name: 'get_premium_market',      desc_en: 'Market state with reference rates attributed to their source, via x402 ($0.05 USDC)',       desc_es: 'Estado de mercado con tasas de referencia y su fuente, vía x402 ($0.05 USDC)' },
    { name: 'execute_paid_strategy',   desc_en: 'Execute strategy on-chain via x402 ($0.25 USDC)',       desc_es: 'Ejecuta estrategia on-chain vía x402 ($0.25 USDC)' },
    { name: 'get_wallet_info',         desc_en: 'Show wallet address and session tools (Free)',          desc_es: 'Muestra la wallet y herramientas de la sesión (Gratis)' },
    { name: 'get_mpp_signals',         desc_en: 'Get premium signals settled via MPP ($0.02 USDC)',      desc_es: 'Señales premium liquidadas vía MPP ($0.02 USDC)' },
    { name: 'get_mpp_market',          desc_en: 'Get enriched market state settled via MPP ($0.05 USDC)',  desc_es: 'Estado de mercado enriquecido vía MPP ($0.05 USDC)' },
];

export default function DevelopersPage() {
    const { t, language } = useLanguage();
    const lang = (en: string, es: string) =>
        language === "es" ? es : en;

    return (
        <main className="min-h-screen bg-black text-white antialiased">
            {/* Background FX */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,_rgba(45,235,232,0.08),transparent_70%)]" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black,transparent)]" />
            </div>

            <div className="relative z-10">
                {/* HERO */}
                <section className="relative pt-16 pb-24">
                    <div className="max-w-5xl mx-auto px-6">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex justify-center mb-10"
                        >
                            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-stellar-teal/30 bg-stellar-teal/10 text-stellar-teal text-xs font-black uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(45,235,232,0.15)]">
                                <Code2 className="w-4 h-4" />
                                SDK + API + MCP
                            </div>
                        </motion.div>

                        <motion.h1 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-center text-5xl sm:text-7xl lg:text-9xl font-black leading-[0.9] tracking-tight uppercase italic"
                        >
                            {t.developers_page.hero.title}
                            <br />
                            <span className="bg-gradient-to-r from-stellar-teal via-white to-stellar-yellow bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(45,235,232,0.3)]">
                                Nirium
                            </span>
                        </motion.h1>
                        <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="mt-10 text-center text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed font-mono uppercase tracking-tighter"
                        >
                            {t.developers_page.hero.subtitle}
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                            className="mt-16 max-w-sm mx-auto"
                        >
                            <CodeBlock code={INSTALL_CODE} lang="bash" />
                            <div className="mt-3 flex items-center justify-center gap-3">
                                <a href="https://www.npmjs.com/package/nirium" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-mono hover:bg-red-500/20 transition-colors">
                                    npm ↗
                                </a>
                                <a href="https://pypi.org/project/nirium/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-stellar-blue/10 border border-stellar-blue/20 text-stellar-blue text-[10px] font-mono hover:bg-stellar-blue/20 transition-colors">
                                    pip ↗
                                </a>
                            </div>
                        </motion.div>
                    </div>
                </section>

                <div className="max-w-5xl mx-auto px-6 mb-16">
                    <ComplianceBanner />
                </div>

                {/* QUICKSTART */}
                <section className="py-24 border-y border-white/5 relative overflow-hidden">
                    <div className="max-w-5xl mx-auto px-6">
                        <div className="flex flex-col items-center mb-16">
                            <h2 className="text-3xl sm:text-5xl font-black uppercase italic tracking-tighter text-white mb-4">
                                {t.developers_page.quickstart.title}
                            </h2>
                            <p className="text-gray-500 font-mono text-sm uppercase tracking-widest">
                                {t.developers_page.quickstart.subtitle}
                            </p>
                        </div>
                        <CodeBlock code={QUICKSTART_CODE} lang="typescript" />
                    </div>
                </section>

                {/* AGENTIC PAYMENTS */}
                <section className="py-24 relative">
                    <div className="max-w-6xl mx-auto px-6">
                        <div className="flex flex-col items-center mb-16 text-center">
                            <h2 className="text-3xl sm:text-5xl font-black uppercase italic tracking-tighter text-white mb-4">
                                {t.developers_page.agentic_payments.title}
                            </h2>
                            <p className="text-gray-500 font-mono text-sm uppercase tracking-widest max-w-2xl">
                                {t.developers_page.agentic_payments.subtitle}
                            </p>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-10">
                            <div className="group p-5 sm:p-8 rounded-3xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-all min-w-0 overflow-hidden">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="p-3 rounded-2xl bg-stellar-yellow/10 border border-stellar-yellow/20">
                                        <Zap className="w-6 h-6 text-stellar-yellow" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black uppercase italic text-white tracking-tight">{t.developers_page.agentic_payments.x402.title}</h3>
                                        <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">Linux Foundation Standard</p>
                                    </div>
                                </div>
                                <CodeBlock code={X402_CODE} lang="typescript" />
                                <div className="mt-6 flex items-center gap-4 text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                                    <span className="px-2 py-0.5 rounded border border-white/10">No Custodian</span>
                                    <span className="px-2 py-0.5 rounded border border-white/10">Atomic On-chain</span>
                                </div>
                                {/* Vive junto al ejemplo de x402 y no en /keys: quien llega
                                    a /keys viene por credenciales, quien llega aquí viene a
                                    decidir si esto sirve — y un pago que ocurre de verdad
                                    convence más que el bloque de código de arriba. */}
                                <PollarPayCard lang={lang} />
                            </div>

                            <div className="group p-5 sm:p-8 rounded-3xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-all min-w-0 overflow-hidden">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                                        <Package className="w-6 h-6 text-purple-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black uppercase italic text-white tracking-tight">{t.developers_page.agentic_payments.mpp.title}</h3>
                                        <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">Stripe/Tempo Spec</p>
                                    </div>
                                </div>
                                <CodeBlock code={MPP_CODE} lang="typescript" />
                                <div className="mt-6 flex items-center gap-4 text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                                    <span className="px-2 py-0.5 rounded border border-white/10">Balance Returned</span>
                                    <span className="px-2 py-0.5 rounded border border-white/10">Ideal for Agents</span>
                                </div>
                            </div>
                        </div>

                        {/* Comparison Table */}
                        <div className="mt-16 overflow-x-auto rounded-3xl border border-white/10 bg-[#080808]">
                            <table className="w-full text-left">
                                <thead className="border-b border-white/5 bg-white/[0.02]">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] text-gray-500 uppercase tracking-[0.2em] font-black">Feature</th>
                                        <th className="px-6 py-4 text-[10px] text-gray-500 uppercase tracking-[0.2em] font-black text-center">x402</th>
                                        <th className="px-6 py-4 text-[10px] text-gray-500 uppercase tracking-[0.2em] font-black text-center">MPP Charge</th>
                                        <th className="px-6 py-4 text-[10px] text-gray-500 uppercase tracking-[0.2em] font-black text-center">MPP Channel</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 font-mono text-xs">
                                    {[
                                        [t.developers_page.agentic_payments.table.tx_per_call, '✓', '✓', '✗'],
                                        [t.developers_page.agentic_payments.table.facilitator, '✓', '✗', '✗'],
                                        [t.developers_page.agentic_payments.table.needs_xlm, '✗', t.developers_page.agentic_payments.table.optional, '✓'],
                                        [t.developers_page.agentic_payments.table.best_for, t.developers_page.agentic_payments.table.quick_setup, t.developers_page.agentic_payments.table.no_third_party, t.developers_page.agentic_payments.table.high_freq],
                                    ].map(([label, a, b, c]) => (
                                        <tr key={label as string} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="px-6 py-4 text-gray-400">{label}</td>
                                            <td className="px-6 py-4 text-center text-white">{a}</td>
                                            <td className="px-6 py-4 text-center text-white">{b}</td>
                                            <td className="px-6 py-4 text-center text-white">{c}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {/* La tabla compara protocolos, no inventario: Channel está apagado en ambos boxes. */}
                        <p className="mt-4 text-[11px] leading-relaxed text-gray-500">
                            {t.developers_page.agentic_payments.table.note}
                        </p>
                    </div>
                </section>

                {/* MCP SERVER */}
                <section className="py-24 border-t border-white/5 bg-white/[0.01]">
                    <div className="max-w-6xl mx-auto px-6">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            <div className="min-w-0">
                                <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-stellar-teal/30 bg-stellar-teal/10 text-stellar-teal text-[10px] font-black uppercase tracking-widest mb-8">
                                    <Server className="w-3.5 h-3.5" />
                                    {t.developers_page.mcp.title}
                                </div>
                                <h2 className="text-3xl sm:text-6xl font-black uppercase italic tracking-tighter text-white mb-6 break-words">
                                    MCP Server<br />
                                    <span className="text-stellar-teal">Claude & Cursor</span>
                                </h2>
                                <p className="text-gray-400 text-lg mb-10 leading-relaxed">
                                    {t.developers_page.mcp.subtitle}
                                </p>
                                <CodeBlock code={MCP_CODE} lang="json" />
                            </div>

                            <div className="relative">
                                <div className="absolute inset-0 bg-stellar-teal/10 blur-[100px] rounded-full opacity-30" />
                                <div className="relative p-8 rounded-3xl border border-white/10 bg-black/50 backdrop-blur-xl">
                                    <h3 className="text-lg font-black uppercase italic mb-6 flex items-center gap-3">
                                        <Cpu className="w-5 h-5 text-stellar-teal" />
                                        {t.developers_page.mcp.tools_count}
                                    </h3>
                                    <div className="grid gap-3">
                                        {MCP_TOOLS.slice(0, 8).map((tool) => (
                                            <div key={tool.name} className="flex items-start gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-stellar-teal/30 transition-all group min-w-0">
                                                <div className="p-1.5 rounded-lg bg-white/5 group-hover:bg-stellar-teal/10 shrink-0">
                                                    <ChevronRight className="w-3 h-3 text-gray-500 group-hover:text-stellar-teal" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <code className="text-[10px] sm:text-[11px] text-stellar-teal font-black font-mono block mb-0.5 break-all">{tool.name}</code>
                                                    <p className="text-[9px] sm:text-[10px] text-gray-500 uppercase tracking-tight line-clamp-2">
                                                        {language === 'es' ? tool.desc_es : tool.desc_en}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                        <div className="text-center pt-2">
                                            <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">+ 3 MORE TOOLS IN DOCUMENTATION</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* API ENDPOINTS — PREMIUM EXECUTION HUB */}
                <section className="py-32 relative overflow-hidden border-t border-white/5">
                    {/* Background Accents */}
                    <div className="absolute top-1/4 -right-64 w-[600px] h-[600px] bg-stellar-teal/5 blur-[120px] rounded-full pointer-events-none" />
                    <div className="absolute bottom-1/4 -left-64 w-[600px] h-[600px] bg-stellar-blue/5 blur-[120px] rounded-full pointer-events-none" />

                    <div className="max-w-7xl mx-auto px-6 relative z-10">
                        <div className="flex flex-col items-center mb-24 text-center">
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                className="mb-6 px-4 py-1.5 rounded-full bg-stellar-teal/10 border border-stellar-teal/30 flex items-center gap-2"
                            >
                                <Activity className="w-3 h-3 text-stellar-teal animate-pulse" />
                                <span className="text-[10px] font-black text-stellar-teal uppercase tracking-[0.2em]">Live Protocol Surface v0.10.2</span>
                            </motion.div>
                            
                            <h2 className="text-4xl sm:text-7xl font-black uppercase italic tracking-tighter text-white mb-6 leading-none">
                                {t.developers_page.hub.title}
                            </h2>
                            <p className="text-gray-500 font-mono text-sm uppercase tracking-widest max-w-2xl">
                                {t.developers_page.hub.subtitle}
                            </p>
                        </div>

                        {/* CORE HIGHLIGHTS — PREMIUM CARDS */}
                        <div className="mb-32">
                            <div className="flex items-center gap-6 mb-12">
                                <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-widest sm:tracking-[0.4em] italic">
                                    {t.developers_page.hub.infrastructure}
                                </h3>
                                <div className="h-px w-full bg-gradient-to-r from-white/10 to-transparent" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {ENDPOINTS.slice(0, 8).map((ep, i) => (
                                    <motion.div 
                                        key={ep.path}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="group p-5 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-stellar-teal/30 transition-all cursor-default min-w-0"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <span className={`text-[10px] font-black px-2 py-0.5 rounded ${ep.method === 'GET' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-stellar-blue/10 text-stellar-blue'}`}>
                                                {ep.method}
                                            </span>
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                                                <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Live</span>
                                            </div>
                                        </div>
                                        <code className="text-[11px] text-white font-mono block mb-3 truncate group-hover:text-stellar-teal transition-colors">{ep.path}</code>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-tighter leading-relaxed line-clamp-2">
                                            {language === 'es' ? ep.desc_es : ep.desc_en}
                                        </p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* FULL CATALOG — HIGH DENSITY EXPLORER */}
                        <div className="space-y-12">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                        <Terminal className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg sm:text-xl font-black text-white uppercase italic tracking-tight break-words">
                                        {t.developers_page.hub.explorer}
                                    </h3>
                                </div>
                                <div className="hidden sm:flex items-center gap-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded bg-emerald-500/20 border border-emerald-500/50" />
                                        Production
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded bg-stellar-blue/20 border border-stellar-blue/50" />
                                        x402/MPP
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {[
                                    { 
                                        cat: language === 'es' ? 'Seguridad y Auth' : 'Auth & Security', 
                                        icon: Lock,
                                        eps: [
                                            { m: 'POST', p: '/api/auth/token', d: 'JWT session generation', s: 'CORE' },
                                            { m: 'POST', p: '/api/auth/keys', d: 'Permanent API key provisioning', s: 'CORE' },
                                            { m: 'GET', p: '/api/health', d: 'Global cluster status', s: 'LIVE' },
                                            { m: 'POST', p: '/api/authenticate', d: 'Wallet-signature verification', s: 'LIVE' },
                                        ]
                                    },
                                    { 
                                        cat: language === 'es' ? 'Motor de Tesorería' : 'Treasury Engine', 
                                        icon: Cpu,
                                        eps: [
                                            { m: 'POST', p: '/api/loop/start', d: 'Autonomous rebalance trigger', s: 'PREMIUM' },
                                            { m: 'POST', p: '/api/loop/stop', d: 'Emergency circuit breaker', s: 'CORE' },
                                            { m: 'POST', p: '/api/execute', d: 'Single-invocation agent task', s: 'PREMIUM' },
                                            { m: 'GET', p: '/api/loop/status', d: 'Real-time rebalance telemetry', s: 'LIVE' },
                                        ]
                                    },
                                    { 
                                        cat: language === 'es' ? 'Compliance e IPFS' : 'Compliance & IPFS', 
                                        icon: Shield,
                                        eps: [
                                            { m: 'POST', p: '/api/audit/log', d: 'Anchor a record to IPFS, optionally agent-signed', s: 'LIVE' },
                                            { m: 'GET', p: '/api/audit/info', d: 'Audit node metadata and limits', s: 'LIVE' },
                                            { m: 'GET', p: '/api/reporting/summary', d: 'Consolidated summary by period and network', s: 'LIVE' },
                                            { m: 'GET', p: '/api/reporting/export', d: 'Institutional-format export (CSV / JSON)', s: 'LIVE' },
                                        ]
                                    },
                                    { 
                                        cat: language === 'es' ? 'Inteligencia de Mercado' : 'Market Intelligence', 
                                        icon: TrendingUp,
                                        eps: [
                                            { m: 'GET', p: '/api/market', d: 'Live market state and reference rates', s: 'LIVE' },
                                            { m: 'GET', p: '/api/tickers', d: 'Cross-asset price feeds', s: 'LIVE' },
                                            { m: 'GET', p: '/api/strategies', d: 'Strategy marketplace', s: 'LIVE' },
                                            { m: 'GET', p: '/api/signals/recent', d: 'Recent signals from the autonomous loop (testnet)', s: 'PREMIUM' },
                                        ]
                                    },
                                    {
                                        cat: language === 'es' ? 'Dispersión y Nodos' : 'Disbursement & Nodes',
                                        icon: Send,
                                        eps: [
                                            { m: 'GET', p: '/api/nodes', d: 'Execution Node catalog', s: 'LIVE' },
                                            { m: 'POST', p: '/api/payroll/run', d: 'Build batch payout (unsigned)', s: 'CORE' },
                                            { m: 'POST', p: '/api/payroll/submit', d: 'Broadcast signed payout + LCP receipt', s: 'CORE' },
                                            { m: 'POST', p: '/api/payroll/onboard', d: 'Self-signed USDC trustline', s: 'CORE' },
                                        ]
                                    },
                                ].map((group, gIdx) => (
                                    <motion.div 
                                        key={group.cat}
                                        initial={{ opacity: 0, x: gIdx % 2 === 0 ? -20 : 20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        className="relative p-5 sm:p-8 rounded-[2rem] border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] transition-all overflow-hidden group/card min-w-0"
                                    >
                                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover/card:opacity-10 transition-opacity">
                                            <group.icon className="w-24 h-24 text-white" />
                                        </div>

                                        <div className="flex items-center gap-4 mb-8">
                                            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-stellar-teal">
                                                <group.icon className="w-5 h-5" />
                                            </div>
                                            <h4 className="text-xl font-black uppercase italic text-white tracking-tight">{group.cat}</h4>
                                        </div>

                                        <div className="grid gap-3">
                                            {group.eps.map((ep) => (
                                                <div key={ep.p} className="flex items-center justify-between gap-4 p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all group/row">
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded shrink-0 ${ep.m === 'GET' ? 'text-emerald-400 bg-emerald-400/10' : 'text-stellar-blue bg-stellar-blue/10'}`}>
                                                            {ep.m}
                                                        </span>
                                                        <code className="text-[10px] text-gray-400 font-mono truncate group-hover/row:text-stellar-teal transition-colors">{ep.p}</code>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[9px] text-gray-600 uppercase tracking-tighter whitespace-nowrap hidden sm:block">{ep.d}</span>
                                                        <span className={`text-[7px] font-black px-1.5 py-0.5 rounded border ${
                                                            ep.s === 'PREMIUM' ? 'border-stellar-blue/30 text-stellar-blue bg-stellar-blue/5' : 
                                                            ep.s === 'PRO' ? 'border-stellar-yellow/30 text-stellar-yellow bg-stellar-yellow/5' :
                                                            'border-white/10 text-gray-500 bg-white/5'
                                                        }`}>
                                                            {ep.s}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="text-center pt-12">
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    className="inline-flex flex-col items-center gap-4"
                                >
                                    <div className="flex -space-x-2">
                                        {[1,2,3,4].map(i => (
                                            <div key={i} className="w-8 h-8 rounded-full border-2 border-black bg-white/5 flex items-center justify-center text-[10px] font-black text-gray-500">
                                                +{i*4}
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">
                                        {t.developers_page.hub.subsystems}
                                    </p>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CONTRACTS — INSTITUTIONAL NODES */}
                <section className="py-32 border-t border-white/5 bg-black">
                    <div className="max-w-5xl mx-auto px-6">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-1.5 h-6 bg-stellar-teal rounded-full" />
                                    <span className="text-xs font-black text-stellar-teal uppercase tracking-[0.3em]">Soroban Mainnet Readiness</span>
                                </div>
                                <h2 className="text-3xl sm:text-6xl font-black uppercase italic tracking-tighter text-white break-words">
                                    {t.developers_page.nodes.title}
                                </h2>
                            </div>
                            <p className="text-gray-500 font-mono text-xs uppercase tracking-widest max-w-sm text-right">
                                {t.developers_page.nodes.subtitle}
                            </p>
                        </div>

                        <div className="grid gap-4">
                            {[
                                { name: 'NiriumVault', id: 'CBTWMZCG3P72EHFAQ4ZLSEBIOFYJC244H5J6DHZIJ56FHFWJ2CFAWSZU', desc_en: 'Core treasury: vaults, agent delegation, strategy execution, 2-of-3 multisig', desc_es: 'Tesorería core: vaults, delegación de agentes, ejecución de estrategias, multisig 2-de-3' },
                                { name: 'NiriumProtocol', id: 'CC2TU5BDTKTPRRRQPEF77I54XYHFQ25XGIRO2TCWKSR7NRJDFR5L5NR5', desc_en: 'Unified registry: ELO reputation, strategy marketplace, agent scoring, skill gate', desc_es: 'Registro unificado: reputación ELO, marketplace, scoring de agentes, skill gate' },
                                { name: 'CETES (Mexican Bonds)', id: 'CC72F57YTPX76HAA64JQOEGHQAPSADQWSY5DWVBR66JINPFDLNCQYHIC', desc_en: 'Government Bond Asset (Etherfuse)', desc_es: 'Activo de Bonos (Etherfuse)' },
                                { name: 'USDC (Stellar Testnet SAC)', id: 'CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA', desc_en: 'Primary liquidity asset', desc_es: 'Activo de liquidez principal' },
                            ].map((contract) => (
                                <div key={contract.name} className="p-5 sm:p-8 rounded-3xl border border-white/10 bg-black/40 backdrop-blur-md group hover:border-stellar-teal/40 transition-all min-w-0">
                                    <div className="flex items-start justify-between gap-4 sm:gap-6 min-w-0">
                                        <div className="flex-1 overflow-hidden min-w-0">
                                            <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-3 mb-4">
                                                <span className="text-xl sm:text-2xl font-black uppercase italic text-white tracking-tight break-words">{contract.name}</span>
                                                <div className="hidden lg:block h-px flex-1 bg-white/5" />
                                                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">
                                                    {language === 'es' ? contract.desc_es : contract.desc_en}
                                                </span>
                                            </div>
                                            <code className="text-[10px] sm:text-xs text-stellar-teal/70 font-mono break-all bg-stellar-teal/5 px-3 py-2 rounded-lg select-all hover:text-stellar-teal transition-colors block border border-stellar-teal/10">{contract.id}</code>
                                        </div>
                                        <div className="hidden sm:block p-3 rounded-2xl bg-white/5 group-hover:bg-stellar-teal/10 transition-colors shrink-0">
                                            <Shield className="w-6 h-6 text-white/20 group-hover:text-stellar-teal" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* RESOURCES */}
                <section className="py-24 border-t border-white/5">
                    <div className="max-w-6xl mx-auto px-6">
                        <div className="grid md:grid-cols-3 gap-6">
                            {[
                                { icon: Package,  title: 'NPM SDK',     desc_en: 'Official Node.js SDK', desc_es: 'SDK oficial para Node.js',                    href: 'https://www.npmjs.com/package/nirium' },
                                { icon: Terminal, title: 'PyPI SDK',    desc_en: 'Official Python SDK', desc_es: 'SDK oficial para Python',                      href: 'https://pypi.org/project/nirium/' },
                                { icon: Globe,    title: 'Stellar RPC',  desc_en: 'Node RPC and testnet endpoints', desc_es: 'Node RPC y testnet endpoints',    href: 'https://developers.stellar.org/docs/data/rpc' },
                                { icon: Code2,    title: 'Soroban SDK',  desc_en: 'Official Rust + JS docs', desc_es: 'Docs oficiales Rust + JS',                href: 'https://developers.stellar.org/docs/smart-contracts' },
                                { icon: Terminal, title: 'Stellar CLI', desc_en: 'Local deploy and test', desc_es: 'Deploy y test local',                              href: 'https://developers.stellar.org/docs/tools/developer-tools/cli/stellar-cli' },
                            ].map((res) => {
                                const Icon = res.icon;
                                return (
                                    <a
                                        key={res.title}
                                        href={res.href}
                                        target="_blank"
                                        rel="noopener"
                                        className="group p-8 rounded-3xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-all"
                                    >
                                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 group-hover:border-stellar-teal/30 transition-colors mb-6 inline-block">
                                            <Icon className="w-6 h-6 text-stellar-teal group-hover:scale-110 transition-transform" />
                                        </div>
                                        <h3 className="text-xl font-black uppercase italic text-white mb-2 tracking-tight">{res.title}</h3>
                                        <p className="text-sm text-gray-500 mb-6">
                                            {language === 'es' ? res.desc_es : res.desc_en}
                                        </p>
                                        <div className="flex items-center gap-2 text-[10px] font-black text-stellar-teal uppercase tracking-widest opacity-50 group-hover:opacity-100 transition-opacity">
                                            {t.developers_page.resources.view_docs}
                                            <ExternalLink size={10} />
                                        </div>
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* FINAL CTA */}
                <section className="py-32 relative overflow-hidden">
                    <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                        <motion.h2 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="text-5xl sm:text-8xl font-black uppercase italic tracking-tighter mb-8 leading-[0.9]"
                        >
                            {t.developers_page.cta.title}
                        </motion.h2>
                        <p className="text-xs sm:text-xl text-gray-400 font-mono uppercase tracking-wider sm:tracking-widest mb-12 px-2 sm:px-0 break-words">
                            {t.developers_page.cta.subtitle}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/sandbox">
                                <Button size="lg" variant="premium" className="px-12 py-8 text-xl rounded-2xl">
                                    {t.developers_page.cta.get_key}
                                    <ArrowRight className="ml-2 w-6 h-6" />
                                </Button>
                            </Link>
                            <a href="https://github.com/Eras256/Nirium" target="_blank" rel="noopener">
                                <Button size="lg" variant="outline" className="px-12 py-8 text-xl rounded-2xl border-white/10 hover:bg-white/5">
                                    <Boxes className="mr-2 w-6 h-6" />
                                    GitHub
                                </Button>
                            </a>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}
