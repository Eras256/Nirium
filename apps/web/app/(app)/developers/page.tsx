/** Nirium Developers — SDK + x402 + MPP + MCP server **/
'use client';

import Link from "next/link";
import {
    Code2, Terminal, Zap, ArrowRight, CheckCircle2,
    Copy, Sparkles, Package, Cpu, Globe, ChevronRight,
    Server, Boxes, Layers, Shield, ExternalLink, Activity, 
    Lock, TrendingUp, Layers as LayersIcon
} from "lucide-react";
import { ComplianceBanner } from "@/components/ui/ComplianceBanner";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/context/LanguageContext";
import { useState } from "react";
import { motion } from "framer-motion";

function CodeBlock({ code, lang: langLabel = "typescript" }: { code: string; lang?: string }) {
    const [copied, setCopied] = useState(false);
    return (
        <div className="relative rounded-2xl border border-white/10 bg-[#080808] overflow-hidden group">
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

const QUICKSTART_CODE = `import { NiriumAgent } from "nirium";

const agent = new NiriumAgent({ apiKey: process.env.NIRIUM_API_KEY });

// Rebalance: keep 60% in CETES (gov. rate), 40% USDC (liquid)
await agent.rebalance({ cetes: 60, usdc: 40 });

// Send cross-border: USD → MXN receiver gets USDC instantly
await agent.transfer({ to: "G...", amount: 1000, asset: "USDC" });`;

const X402_CODE = `import { NiriumAgent } from "nirium";

const agent = new NiriumAgent({ apiKey: process.env.NIRIUM_API_KEY });

// x402: per-call payment — agent pays $0.05 per API call automatically
const result = await agent.callPaidEndpoint({
  url: "https://api.example.com/data",
  maxFee: "0.05",          // USD, reject if server asks more
  asset: "USDC",
});`;

const MPP_CODE = `import { NiriumAgent } from "nirium";

const agent = new NiriumAgent({ apiKey: process.env.NIRIUM_API_KEY });

// MPP session: pre-authorize $10 budget, pay per use
const session = await agent.openMPPSession({
  vendor: "G...",          // vendor Stellar address
  budget: "10",            // USDC budget
  maxPerCall: "0.05",
});

await session.call("/analyze");   // deducts $0.05
await session.call("/summarize"); // deducts $0.05
await session.settle();           // returns unspent balance
`;

const MCP_CODE = `// Claude Desktop config (~/.claude/claude_desktop_config.json)
{
  "mcpServers": {
    "nirium": {
      "command": "npx",
      "args": ["@nirium/mcp-server"],
      "env": {
        "NIRIUM_API_KEY": "your_key_here"
      }
    }
  }
}`;

const ENDPOINTS = [
    { method: 'POST', path: '/v1/agent/rebalance',       desc_en: 'Trigger USDC↔CETES rebalance',          desc_es: 'Dispara rebalanceo USDC↔CETES',           desc_zh: '触发 USDC↔CETES 再平衡' },
    { method: 'POST', path: '/v1/agent/transfer',        desc_en: 'Cross-border USDC transfer',            desc_es: 'Transferencia USDC cross-border',         desc_zh: '跨境 USDC 转账' },
    { method: 'GET',  path: '/v1/vault/status',          desc_en: 'Get vault balances + rates',            desc_es: 'Balances y tasas del vault',              desc_zh: '获取保险库余额 + 利率' },
    { method: 'POST', path: '/v1/vault/create',          desc_en: 'Deploy new 2-of-3 Soroban vault',       desc_es: 'Deploya vault Soroban 2-de-3',            desc_zh: '部署新的 2-of-3 Soroban 保险库' },
    { method: 'POST', path: '/v1/vault/pause',           desc_en: 'Emergency pause (2-of-3 required)',     desc_es: 'Pausa de emergencia (requiere 2-de-3)',    desc_zh: '紧急暂停（需 2-of-3 签名）' },
    { method: 'POST', path: '/v1/vault/withdraw',        desc_en: 'Withdraw >$10K (2-of-3 required)',      desc_es: 'Retiro >$10K (requiere 2-de-3)',           desc_zh: '提款 >$10K（需 2-of-3 签名）' },
    { method: 'POST', path: '/v1/x402/challenge',        desc_en: 'Create x402 payment challenge',         desc_es: 'Crea challenge de pago x402',             desc_zh: '创建 x402 支付挑战' },
    { method: 'POST', path: '/v1/x402/verify',           desc_en: 'Verify x402 payment proof',             desc_es: 'Verifica prueba de pago x402',            desc_zh: '验证 x402 支付证明' },
    { method: 'POST', path: '/v1/mpp/session',           desc_en: 'Open MPP payment session',              desc_es: 'Abre sesión de pago MPP',                 desc_zh: '开启 MPP 支付会话' },
    { method: 'POST', path: '/v1/mpp/charge',            desc_en: 'Charge within MPP session',             desc_es: 'Cobra dentro de sesión MPP',              desc_zh: '在 MPP 会话内扣费' },
    { method: 'POST', path: '/v1/mpp/settle',            desc_en: 'Settle and close MPP session',          desc_es: 'Liquida y cierra sesión MPP',             desc_zh: '结算并关闭 MPP 会话' },
    { method: 'POST', path: '/v1/compliance/audit',      desc_en: 'Generate HMAC-signed audit entry',      desc_es: 'Genera entrada de auditoría HMAC-firmada',desc_zh: '生成 HMAC 签名审计条目' },
    { method: 'POST', path: '/v1/compliance/export',     desc_en: 'Export CNBV-format JSON report',        desc_es: 'Exporta reporte JSON formato CNBV',       desc_zh: '导出 CNBV 格式 JSON 报告' },
    { method: 'POST', path: '/v1/compliance/ipfs',       desc_en: 'Pin report to IPFS (Pinata)',           desc_es: 'Ancla reporte en IPFS (Pinata)',           desc_zh: '将报告固定至 IPFS（Pinata）' },
    { method: 'GET',  path: '/v1/compliance/verify/:cid',desc_en: 'Verify IPFS report integrity',          desc_es: 'Verifica integridad del reporte IPFS',    desc_zh: '验证 IPFS 报告完整性' },
    { method: 'GET',  path: '/v1/market/rates',          desc_en: 'Get live CETES rate + USDC rates',     desc_es: 'Tasa CETES + USDC en tiempo real',       desc_zh: '获取实时 CETES 利率 + USDC 利率' },
];

const MCP_TOOLS = [
    { name: 'nirium_get_vault_status',  desc_en: 'Get balances, rates, and pending operations',      desc_es: 'Balances, tasas y operaciones pendientes',  desc_zh: '获取余额、利率和待处理操作' },
    { name: 'nirium_rebalance',         desc_en: 'Rebalance USDC↔CETES with target allocation',     desc_es: 'Rebalancea USDC↔CETES con asignación objetivo', desc_zh: '按目标配置再平衡 USDC↔CETES' },
    { name: 'nirium_transfer',          desc_en: 'Send cross-border payment to any Stellar address', desc_es: 'Envía pago cross-border a dirección Stellar', desc_zh: '向任意 Stellar 地址发送跨境支付' },
    { name: 'nirium_get_rates',         desc_en: 'Get live CETES rate and USDC lending rates',      desc_es: 'Tasa CETES y lending USDC en tiempo real',  desc_zh: '获取实时 CETES 利率和 USDC 借贷利率' },
    { name: 'nirium_audit_log',         desc_en: 'Query audit trail (last N records)',               desc_es: 'Consulta audit trail (últimos N registros)', desc_zh: '查询审计追踪（最近 N 条记录）' },
    { name: 'nirium_export_cnbv',       desc_en: 'Export CNBV-format compliance report',             desc_es: 'Exporta reporte compliance formato CNBV', desc_zh: '导出 CNBV 格式合规报告' },
    { name: 'nirium_create_vault',      desc_en: 'Deploy new Soroban multisig vault',                desc_es: 'Deploya nuevo vault multisig Soroban', desc_zh: '部署新的 Soroban 多签保险库' },
    { name: 'nirium_pause_vault',       desc_en: 'Emergency vault pause (requires 2-of-3)',          desc_es: 'Pausa de emergencia (requiere 2-de-3)', desc_zh: '紧急暂停保险库（需 2-of-3 签名）' },
    { name: 'nirium_open_mpp_session',  desc_en: 'Open MPP budget session with vendor',              desc_es: 'Abre sesión MPP con proveedor', desc_zh: '与供应商开启 MPP 预算会话' },
    { name: 'nirium_x402_pay',          desc_en: 'Pay x402 challenge from agent wallet',             desc_es: 'Paga challenge x402 desde wallet del agente', desc_zh: '从智能体钱包支付 x402 挑战' },
    { name: 'nirium_simulate_tx',       desc_en: 'Simulate Soroban transaction before signing',      desc_es: 'Simula tx Soroban antes de firmar', desc_zh: '签名前模拟 Soroban 交易' },
    { name: 'nirium_get_contract_state',desc_en: 'Read NiriumVault contract storage',                desc_es: 'Lee almacenamiento del contrato NiriumVault', desc_zh: '读取 NiriumVault 合约存储' },
];

export default function DevelopersPage() {
    const { t, language } = useLanguage();

    return (
        <main className="min-h-screen bg-[#030303] text-white antialiased">
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
                            <div className="group p-8 rounded-3xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-all">
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
                            </div>

                            <div className="group p-8 rounded-3xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-all">
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
                    </div>
                </section>

                {/* MCP SERVER */}
                <section className="py-24 border-t border-white/5 bg-white/[0.01]">
                    <div className="max-w-6xl mx-auto px-6">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            <div>
                                <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-stellar-teal/30 bg-stellar-teal/10 text-stellar-teal text-[10px] font-black uppercase tracking-widest mb-8">
                                    <Server className="w-3.5 h-3.5" />
                                    {t.developers_page.mcp.title}
                                </div>
                                <h2 className="text-4xl sm:text-6xl font-black uppercase italic tracking-tighter text-white mb-6">
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
                                            <div key={tool.name} className="flex items-start gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-stellar-teal/30 transition-all group">
                                                <div className="p-1.5 rounded-lg bg-white/5 group-hover:bg-stellar-teal/10">
                                                    <ChevronRight className="w-3 h-3 text-gray-500 group-hover:text-stellar-teal" />
                                                </div>
                                                <div>
                                                    <code className="text-[10px] text-stellar-teal font-black font-mono block mb-0.5">{tool.name}</code>
                                                    <p className="text-[10px] text-gray-500 uppercase tracking-tight">
                                                        {language === 'zh' ? tool.desc_zh : language === 'es' ? tool.desc_es : tool.desc_en}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                        <div className="text-center pt-2">
                                            <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">+ 4 MORE TOOLS IN DOCUMENTATION</span>
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
                                <span className="text-[10px] font-black text-stellar-teal uppercase tracking-[0.2em]">Live Protocol Surface v0.5.0</span>
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
                                <h3 className="text-sm font-black text-white uppercase tracking-[0.4em] italic whitespace-nowrap">
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
                                        className="group p-5 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-stellar-teal/30 transition-all cursor-default"
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
                                            {language === 'zh' ? ep.desc_zh : language === 'es' ? ep.desc_es : ep.desc_en}
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
                                    <h3 className="text-xl font-black text-white uppercase italic tracking-tight">
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
                                        cat: language === 'zh' ? '安全与认证' : language === 'es' ? 'Seguridad y Auth' : 'Auth & Security', 
                                        icon: Lock,
                                        eps: [
                                            { m: 'POST', p: '/api/auth/token', d: 'JWT session generation', s: 'CORE' },
                                            { m: 'POST', p: '/api/auth/keys', d: 'Permanent API key provisioning', s: 'CORE' },
                                            { m: 'GET', p: '/api/health', d: 'Global cluster status', s: 'LIVE' },
                                            { m: 'POST', p: '/api/authenticate', d: 'Wallet-signature verification', s: 'LIVE' },
                                        ]
                                    },
                                    { 
                                        cat: language === 'zh' ? '国库引擎' : language === 'es' ? 'Motor de Tesorería' : 'Treasury Engine', 
                                        icon: Cpu,
                                        eps: [
                                            { m: 'POST', p: '/api/loop/start', d: 'Autonomous rebalance trigger', s: 'PREMIUM' },
                                            { m: 'POST', p: '/api/loop/stop', d: 'Emergency circuit breaker', s: 'CORE' },
                                            { m: 'POST', p: '/api/execute', d: 'Single-invocation agent task', s: 'PREMIUM' },
                                            { m: 'GET', p: '/api/loop/status', d: 'Real-time rebalance telemetry', s: 'LIVE' },
                                        ]
                                    },
                                    { 
                                        cat: language === 'zh' ? '合规与 IPFS' : language === 'es' ? 'Compliance e IPFS' : 'Compliance & IPFS', 
                                        icon: Shield,
                                        eps: [
                                            { m: 'POST', p: '/v1/compliance/audit', d: 'HMAC-SHA256 audit log entry', s: 'PRO' },
                                            { m: 'POST', p: '/v1/compliance/ipfs', d: 'Inmutable Pinata CID pinning', s: 'PRO' },
                                            { m: 'POST', p: '/v1/compliance/export', d: 'CNBV Art. 80 JSON generator', s: 'PRO' },
                                            { m: 'GET', p: '/v1/compliance/verify/:cid', d: 'Decentralized proof verify', s: 'LIVE' },
                                        ]
                                    },
                                    { 
                                        cat: language === 'zh' ? '市场情报' : language === 'es' ? 'Inteligencia de Mercado' : 'Market Intelligence', 
                                        icon: TrendingUp,
                                        eps: [
                                            { m: 'GET', p: '/api/market', d: 'High-frequency orderbook', s: 'LIVE' },
                                            { m: 'GET', p: '/api/tickers', d: 'Cross-asset price feeds', s: 'LIVE' },
                                            { m: 'GET', p: '/api/strategies', d: 'Strategy marketplace', s: 'LIVE' },
                                            { m: 'GET', p: '/api/signals/recent', d: 'AI-generated trade signals', s: 'PREMIUM' },
                                        ]
                                    },
                                ].map((group, gIdx) => (
                                    <motion.div 
                                        key={group.cat}
                                        initial={{ opacity: 0, x: gIdx % 2 === 0 ? -20 : 20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        className="relative p-8 rounded-[2rem] border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] transition-all overflow-hidden group/card"
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
                <section className="py-32 border-t border-white/5 bg-[#050505]">
                    <div className="max-w-5xl mx-auto px-6">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-1.5 h-6 bg-stellar-teal rounded-full" />
                                    <span className="text-xs font-black text-stellar-teal uppercase tracking-[0.3em]">Soroban Mainnet Readiness</span>
                                </div>
                                <h2 className="text-4xl sm:text-6xl font-black uppercase italic tracking-tighter text-white">
                                    {t.developers_page.nodes.title}
                                </h2>
                            </div>
                            <p className="text-gray-500 font-mono text-xs uppercase tracking-widest max-w-sm text-right">
                                {t.developers_page.nodes.subtitle}
                            </p>
                        </div>

                        <div className="grid gap-4">
                            {[
                                { name: 'NiriumVault (Core)', id: 'CAU2XBJTQUBTMPAUFRX7GMZ337I5WLBI4GYPWHZEVXTMJ66D3CP6DEL4', desc_en: 'Primary institutional multisig vault', desc_es: 'Vault multisig institucional principal', desc_zh: '主机构多签保险库' },
                                { name: 'ELO Reputation', id: 'CC6Z3WJWRKVEAXEKIQ5S3LFEMKRF4L2FTN5YZDQU27MQRQAWA5QBJWF2', desc_en: 'Agent performance & reputation scoring', desc_es: 'Reputación y scoring de agentes', desc_zh: '智能体性能与声誉评分系统' },
                                { name: 'Strategy Marketplace', id: 'CB6Q3LKBJ7CAAZY4MK7EG5R6FDDTJHB52ZEENI6BQLBJNFKBQRIAUABC', desc_en: 'Strategy registry & discovery hub', desc_es: 'Registro y hub de estrategias', desc_zh: '策略注册与发现中心' },
                                { name: 'Compliance Sentinel', id: 'CCP5OY3TTDVIREQYGOUZUXS2MZJO3LLJD6Z22Z3VROWFCPJAON22WPY2', desc_en: 'Security monitoring & emergency pause', desc_es: 'Monitoreo y pausa de emergencia', desc_zh: '安全监控与紧急暂停系统' },
                                { name: 'Settlement Hub', id: 'CANZP2OJUS2Y5VXE4YHRR75LE2WKE7QTJOCCWENR7X65DWE6QEJZV6KS', desc_en: 'x402 & MPP protocol controller', desc_es: 'Controlador de x402 y MPP', desc_zh: 'x402 与 MPP 协议控制器' },
                                { name: 'Skill Vault', id: 'CB4JM3PP7GWKJUAYIZ7ZULWFTFJ57FTTUFZTFIDF4JCAPF664OJCXIEI', desc_en: 'AI skill monetization & access control', desc_es: 'Monetización de skills IA', desc_zh: 'AI 技能货币化与访问控制' },
                                { name: 'CETES (Mexican Bonds)', id: 'CC72F57YTPX76HAA64JQOEGHQAPSADQWSY5DWVBR66JINPFDLNCQYHIC', desc_en: 'Government Bond Asset (Etherfuse)', desc_es: 'Activo de Bonos (Etherfuse)', desc_zh: '政府债券资产 (Etherfuse)' },
                                { name: 'USDC (Stellar Testnet)', id: 'CBIELTK6YBZJU5UP2WWQEQ4YkVDt3QOF4D7TaNz5WBqVIJgF57e', desc_en: 'Primary liquidity asset', desc_es: 'Activo de liquidez principal', desc_zh: '主要流动性资产' },
                            ].map((contract) => (
                                <div key={contract.name} className="p-8 rounded-3xl border border-white/10 bg-black/40 backdrop-blur-md group hover:border-stellar-teal/40 transition-all">
                                    <div className="flex items-start justify-between gap-6">
                                        <div className="flex-1 overflow-hidden">
                                            <div className="flex items-center gap-3 mb-4">
                                                <span className="text-2xl font-black uppercase italic text-white tracking-tight">{contract.name}</span>
                                                <div className="h-px flex-1 bg-white/5" />
                                                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-mono shrink-0">
                                                    {language === 'zh' ? contract.desc_zh : language === 'es' ? contract.desc_es : contract.desc_en}
                                                </span>
                                            </div>
                                            <code className="text-[10px] sm:text-xs text-stellar-teal/70 font-mono break-all bg-stellar-teal/5 px-3 py-2 rounded-lg select-all hover:text-stellar-teal transition-colors block border border-stellar-teal/10">{contract.id}</code>
                                        </div>
                                        <div className="p-3 rounded-2xl bg-white/5 group-hover:bg-stellar-teal/10 transition-colors">
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
                                { icon: Package,  title: 'NPM SDK',     desc_en: 'Official Node.js SDK', desc_es: 'SDK oficial para Node.js', desc_zh: 'Node.js 官方 SDK',                    href: 'https://www.npmjs.com/package/nirium' },
                                { icon: Terminal, title: 'PyPI SDK',    desc_en: 'Official Python SDK', desc_es: 'SDK oficial para Python', desc_zh: 'Python 官方 SDK',                      href: 'https://pypi.org/project/nirium/' },
                                { icon: Globe,    title: 'Stellar RPC',  desc_en: 'Node RPC and testnet endpoints', desc_es: 'Node RPC y testnet endpoints', desc_zh: 'Node RPC 和测试网端点',    href: 'https://developers.stellar.org/docs/data/rpc' },
                                { icon: Code2,    title: 'Soroban SDK',  desc_en: 'Official Rust + JS docs', desc_es: 'Docs oficiales Rust + JS', desc_zh: '官方 Rust + JS 文档',                href: 'https://developers.stellar.org/docs/smart-contracts' },
                                { icon: Terminal, title: 'Stellar CLI', desc_en: 'Local deploy and test', desc_es: 'Deploy y test local', desc_zh: '本地部署和测试',                              href: 'https://developers.stellar.org/docs/tools/developer-tools/cli/stellar-cli' },
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
                                            {language === 'zh' ? res.desc_zh : language === 'es' ? res.desc_es : res.desc_en}
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
                        <p className="text-xl text-gray-400 font-mono uppercase tracking-widest mb-12">
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
