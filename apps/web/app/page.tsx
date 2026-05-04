/** Nirium Protocol — Autonomous Treasury for LatAm Fintechs (April 2026) **/
'use client';

import Link from "next/link";
import { useState, Suspense } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import {
    ArrowRight, Bot, FileCheck,
    Check, ExternalLink, Sparkles, TrendingUp, Lock,
    Building2, Workflow, ChevronRight, Zap, Layers
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import OpsConsole from "@/components/layout/OpsConsole";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/context/LanguageContext";

const TreasuryCanvas = dynamic(
    () => import('@/components/3d/TreasuryCanvas').then((m) => m.TreasuryCanvas),
    { ssr: false }
);

export default function Home() {
    const { language } = useLanguage();
    const lang = (en: string, es: string, zh: string) =>
        language === 'zh' ? zh : language === 'es' ? es : en;
    const [copied, setCopied] = useState(false);

    const codeSnippet = `import { NiriumAgent } from '@nirium/sdk';

const agent = new NiriumAgent({ apiKey: process.env.NIRIUM_KEY });

await agent.start({
    base: 'USDC',
    targetAssets: ['CETES'],
    strategy: 'spread_auto_rebalance',
    threshold: 1.5, // minimum % spread to trigger swap
});`;

    const handleCopy = () => {
        navigator.clipboard.writeText(codeSnippet);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <main className="min-h-screen bg-black text-white antialiased">
            <Navbar />

            {/* HERO */}
            <section className="relative pt-28 pb-16 sm:pt-36 sm:pb-20 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(45,235,232,0.08),transparent_60%)]" />

                <div className="relative max-w-7xl mx-auto px-6">
                    <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-0">

                        {/* ── LEFT: text column ── */}
                        <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left lg:pr-12 pt-8 lg:pt-16">
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-stellar-teal/20 bg-stellar-teal/5 text-stellar-teal text-[10px] font-black uppercase tracking-widest mb-6"
                            >
                                <Sparkles className="w-3 h-3" />
                                Powered by Etherfuse · Stellar Testnet · Mainnet Q3 2026
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.05 }}
                                className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.05] tracking-tight"
                            >
                                {language === 'zh' ? (
                                    <>
                                        您的 USDC 闲置无收益。
                                        <br />
                                        <span className="bg-gradient-to-r from-stellar-teal to-stellar-yellow bg-clip-text text-transparent">
                                            Nirium 自动投资 CETES。
                                        </span>
                                    </>
                                ) : language === 'es' ? (
                                    <>
                                        Tu USDC parado no genera nada.
                                        <br />
                                        <span className="bg-gradient-to-r from-stellar-teal to-stellar-yellow bg-clip-text text-transparent">
                                            Nirium lo invierte en CETES automáticamente.
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        Your idle USDC earns nothing.
                                        <br />
                                        <span className="bg-gradient-to-r from-stellar-teal to-stellar-yellow bg-clip-text text-transparent">
                                            Nirium invests it in CETES automatically.
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
                                    'Non-custodial software that rebalances your treasury between liquid USDC and Mexican government bonds (CETES) tokenized via Etherfuse — no dedicated CFO, no spreadsheets, no custody risk.',
                                    'Software no custodial que rebalancea tu tesorería entre USDC líquido y bonos del gobierno mexicano (CETES) tokenizados vía Etherfuse — sin CFO dedicado, sin Excel, sin riesgo de custodia.',
                                    '非托管软件，通过 Etherfuse 将您的财库在流动性 USDC 和代币化墨西哥政府债券 (CETES) 之间重新平衡 — 无需专门的 CFO，无需表格，无托管风险。'
                                )}
                            </motion.p>

                            {/* 3 numbers */}
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.15 }}
                                className="mt-10 grid grid-cols-3 gap-6 w-full max-w-sm"
                            >
                                <div>
                                    <div className="text-2xl sm:text-3xl font-black text-white">~3.38%</div>
                                    <div className="text-[10px] uppercase tracking-widest text-white/40 mt-1">
                                        {lang('CETES Rate', 'Tasa CETES', 'CETES 利率')}
                                    </div>
                                </div>
                                <div className="border-x border-white/5 px-4">
                                    <div className="text-2xl sm:text-3xl font-black text-white">~4s</div>
                                    <div className="text-[10px] uppercase tracking-widest text-white/40 mt-1">
                                        {lang('Settlement', 'Liquidación', '结算时间')}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-2xl sm:text-3xl font-black text-white">~0.8%</div>
                                    <div className="text-[10px] uppercase tracking-widest text-white/40 mt-1">
                                        {lang('Total cost', 'Costo total', '总成本')}
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
                                <Link href="/docs">
                                    <Button size="lg" variant="premium" className="w-full sm:w-auto">
                                        {lang('View Documentation', 'Ver Documentación', '查看文档')}
                                        <ArrowRight className="ml-2 w-4 h-4" />
                                    </Button>
                                </Link>
                                <a href="mailto:hello@nirium.xyz">
                                    <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/20 hover:bg-white/5">
                                        {lang('Request Pilot Access', 'Solicitar Acceso Piloto', '申请试点访问')}
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
                                    {lang('Testnet live', 'Testnet en vivo', '测试网运行中')}
                                </span>
                                <span>·</span>
                                <span>{lang('Mainnet Q3 2026 after audit', 'Mainnet Q3 2026 tras auditoría', '主网 Q3 2026 审计后上线')}</span>
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
                                    <span className="text-[9px] font-mono text-stellar-yellow/80">CETES 3.38% (Banxico)</span>
                                </div>
                                <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-stellar-teal/40 font-mono text-xs animate-pulse">Loading vault...</div>}>
                                    <TreasuryCanvas />
                                </Suspense>
                            </motion.div>

                            {/* Live agent terminal */}
                            <motion.div
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.9 }}
                            >
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

            {/* THE PROBLEM */}
            <section className="py-20 border-t border-white/5">
                <div className="max-w-4xl mx-auto px-6">
                    <h2 className="text-2xl sm:text-3xl font-bold text-center text-white/90">
                        {lang('The problem', 'El problema', '问题所在')}
                    </h2>
                    <div className="mt-12 grid sm:grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="text-5xl font-black text-red-400/80">$0</div>
                            <p className="mt-3 text-sm text-white/60">
                                {lang('Return from idle USDC in treasury', 'Retorno generado por USDC parado en treasury', 'USDC 闲置产生的回报')}
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="text-5xl font-black text-red-400/80">7+</div>
                            <p className="mt-3 text-sm text-white/60">
                                {lang('Days a CFO locks capital in traditional bonds', 'Días que un CFO bloquea capital en bonos tradicionales', 'CFO 锁定资金于传统债券的天数')}
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="text-5xl font-black text-red-400/80">~150bps</div>
                            <p className="mt-3 text-sm text-white/60">
                                {lang('MX↔USA FX spread on traditional rails', 'Spread FX MX↔USA en bancos tradicionales', '传统银行 MX↔美国外汇点差')}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* HOW IT WORKS */}
            <section className="py-20 border-t border-white/5">
                <div className="max-w-5xl mx-auto px-6">
                    <h2 className="text-2xl sm:text-3xl font-bold text-center">
                        {lang('How it works', 'Cómo funciona', '工作原理')}
                    </h2>
                    <p className="mt-4 text-center text-white/60 max-w-xl mx-auto">
                        {lang(
                            'Three steps. No CFO. No spreadsheets. No WhatsApp.',
                            'Tres pasos. Sin CFO. Sin Excel. Sin WhatsApp.',
                            '三步。无需 CFO。无需表格。无需 WhatsApp。'
                        )}
                    </p>

                    <div className="mt-14 grid md:grid-cols-3 gap-6">
                        {[
                            {
                                num: '01',
                                icon: Workflow,
                                title: lang('Connect your wallet', 'Conecta tu wallet', '连接钱包'),
                                body: lang(
                                    'Non-custodial 2-of-3 Soroban vault. You hold the keys. Nirium never touches your funds.',
                                    'Vault Soroban 2-de-3 non-custodial. Tú controlas las llaves. Nirium nunca toca tus fondos.',
                                    'Soroban 2-of-3 非托管保险库。您持有密钥。Nirium 永远无法触及您的资金。'
                                ),
                            },
                            {
                                num: '02',
                                icon: Bot,
                                title: lang('Agent reads the spread', 'El agente analiza el spread', '智能体读取价差'),
                                body: lang(
                                    '24/7 monitoring: CETES rate via Etherfuse vs USDC on Blend. Rebalances only when spread exceeds your threshold.',
                                    'Monitoreo 24/7: tasa CETES vía Etherfuse vs USDC en Blend. Decide rebalanceo solo si el spread supera tu umbral.',
                                    '全天候监控：通过 Etherfuse 获取 CETES 利率与 Blend 上的 USDC 利率对比。仅在价差超过阈值时才触发再平衡。'
                                ),
                            },
                            {
                                num: '03',
                                icon: TrendingUp,
                                title: lang('Rebalances automatically', 'Rebalancea automáticamente', '自动再平衡'),
                                body: lang(
                                    'Stellar tx settled in ~4s. Every action signed with HMAC-SHA256 and IPFS-anchored for CNBV.',
                                    'Tx en Stellar liquidada en ~4s. Cada acción firmada con HMAC-SHA256 y anclada en IPFS para CNBV.',
                                    'Stellar 交易约 4 秒完成。每个操作均经 HMAC-SHA256 签名并锚定至 IPFS 供合规使用。'
                                ),
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
                        <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 bg-stellar-teal/10 border border-stellar-teal/20 rounded-full text-stellar-teal text-[10px] font-black uppercase tracking-widest">
                            <Zap className="w-3 h-3" />
                            {lang('Settlement infrastructure', 'Infraestructura de liquidación', '结算基础设施')}
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold">
                            {lang('The rails underneath', 'Los rieles por debajo', '底层通道')}
                        </h2>
                        <p className="mt-4 text-white/50 max-w-xl mx-auto text-sm">
                            {lang(
                                'x402 and MPP are the two open standards Nirium implements natively on Stellar to enable machine-to-machine billing and session-scoped institutional flows.',
                                'x402 y MPP son los dos estándares abiertos que Nirium implementa de forma nativa en Stellar para habilitar facturación máquina a máquina y flujos institucionales acotados por sesión.',
                                'x402 和 MPP 是 Nirium 在 Stellar 上原生实现的两个开放标准，用于支持机器间计费和会话范围的机构流程。'
                            )}
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
                                {lang('x402 — Per-request micropayment', 'x402 — Micropago por solicitud', 'x402 — 按请求微支付')}
                            </h3>
                            <p className="text-sm text-white/55 leading-relaxed mb-6">
                                {lang(
                                    'HTTP 402 native billing. Every agent action triggers an on-chain payment before execution — no subscriptions, no prepaid credits. One request, one signed transaction, one immutable record.',
                                    'Facturación nativa HTTP 402. Cada acción del agente activa un pago on-chain antes de ejecutarse — sin suscripciones, sin créditos prepagados. Una solicitud, una transacción firmada, un registro inmutable.',
                                    'HTTP 402 原生计费。每个智能体操作在执行前触发链上支付 — 无订阅、无预充值。一次请求，一笔签名交易，一条不可变记录。'
                                )}
                            </p>
                            <div className="flex items-center gap-3 pt-4 border-t border-white/[0.06]">
                                <div className="text-[9px] font-mono text-stellar-teal uppercase tracking-widest font-bold">Soroban Verified</div>
                                <div className="h-px flex-1 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        whileInView={{ width: '100%' }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 1.5, ease: 'easeOut' }}
                                        className="h-full bg-stellar-teal"
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
                                {lang('MPP — Session budget protocol', 'MPP — Protocolo de presupuesto por sesión', 'MPP — 会话预算协议')}
                            </h3>
                            <p className="text-sm text-white/55 leading-relaxed mb-6">
                                {lang(
                                    'Machine Payment Protocol scopes a XLM budget to a single authenticated session. Optimized for passive funding and mass payroll execution, agents operate within a capped spend window — enabling institutional-grade spend controls.',
                                    'Machine Payment Protocol acota un presupuesto XLM a una sesión autenticada. Optimizado para fondeos pasivos y pagos de nómina masivos, los agentes operan dentro de una ventana de gasto limitada — habilitando controles de gasto de nivel institucional.',
                                    'Machine Payment Protocol 将 XLM 预算限定在单个已认证会话中。针对被动资金和大规模工资发放进行了优化，智能体在有限的消费窗口内运行 — 实现机构级消费控制。'
                                )}
                            </p>
                            <div className="flex items-center gap-3 pt-4 border-t border-white/[0.06]">
                                <div className="text-[9px] font-mono text-stellar-yellow uppercase tracking-widest font-bold">Freighter Ready</div>
                                <div className="h-px flex-1 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        whileInView={{ width: '100%' }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 }}
                                        className="h-full bg-stellar-yellow"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* USE CASES */}
            <section className="py-20 border-t border-white/5">
                <div className="max-w-5xl mx-auto px-6">
                    <h2 className="text-2xl sm:text-3xl font-bold text-center">
                        {lang('Core use cases', 'Casos de uso principales', '核心使用场景')}
                    </h2>
                    <p className="mt-4 text-center text-white/50 max-w-xl mx-auto text-sm">
                        {lang(
                            'Built on Soroban. Integrates Blend, Soroswap, Phoenix, and Etherfuse Stablebonds.',
                            'Construido en Soroban. Integra Blend, Soroswap, Phoenix y Etherfuse Stablebonds.',
                            '构建于 Soroban。集成 Blend、Soroswap、Phoenix 和 Etherfuse 稳定债券。'
                        )}
                    </p>

                    <div className="mt-12 grid md:grid-cols-3 gap-6">
                        {[
                            {
                                num: '01',
                                color: 'border-stellar-teal/30 bg-stellar-teal/[0.04]',
                                accent: 'text-stellar-teal',
                                title: lang('Cross-border treasury automation', 'Automatización de tesorería cross-border', '跨境财库自动化'),
                                body: lang(
                                    'Programmable rules for MXN↔USDC routing via Stellar Path Payments. Configurable thresholds, SPEI windows, and CETES allocation through Etherfuse Stablebonds. Replaces manual treasury desks with rule-based execution and immutable audit logs.',
                                    'Reglas programables para rutas MXN↔USDC vía Stellar Path Payments. Umbrales configurables, ventanas SPEI y asignación a CETES via Etherfuse Stablebonds. Reemplaza mesas de tesorería manuales con ejecución basada en reglas y logs inmutables.',
                                    '通过 Stellar Path Payments 实现 MXN↔USDC 可编程路由规则。可配置阈值、SPEI 窗口，并通过 Etherfuse 稳定债券分配至 CETES。以规则驱动执行和不可变审计日志替代人工财库操作。'
                                ),
                                tag: 'Stellar Path Payments · Etherfuse · CETES',
                            },
                            {
                                num: '02',
                                color: 'border-purple-500/20 bg-purple-500/[0.03]',
                                accent: 'text-purple-400',
                                title: lang('Institutional settlement rails', 'Rieles de liquidación institucional', '机构结算通道'),
                                body: lang(
                                    'Native x402 integration for per-request micro-billing and MPP for session-based institutional flows. Sponsored XLM gas, sub-5-second finality, and on-chain reconciliation for high-frequency operations.',
                                    'Integración nativa de x402 para micro-billing por solicitud y MPP para flujos institucionales por sesión. Gas XLM patrocinado, finalidad sub-5 segundos y reconciliación on-chain para operaciones de alta frecuencia.',
                                    '原生 x402 集成用于按请求微计费，MPP 用于基于会话的机构流程。赞助 XLM gas、5 秒以内结算以及面向高频操作的链上对账。'
                                ),
                                tag: 'x402 · MPP · Sponsored Transactions',
                            },
                            {
                                num: '03',
                                color: 'border-stellar-yellow/20 bg-stellar-yellow/[0.03]',
                                accent: 'text-stellar-yellow',
                                title: lang('DeFi-integrated treasury management', 'Gestión de tesorería integrada con DeFi', 'DeFi 集成财库管理'),
                                body: lang(
                                    'Automated allocation across Blend lending vaults and Soroswap liquidity pools, with risk parameters set by treasury operators. All execution is bundled into atomic Soroban transactions with all-or-nothing semantics.',
                                    'Asignación automatizada en vaults de lending de Blend y pools de liquidez de Soroswap, con parámetros de riesgo configurables. Toda ejecución se agrupa en transacciones Soroban atómicas con semántica todo-o-nada.',
                                    '跨 Blend 借贷金库和 Soroswap 流动性池的自动化分配，由财库运营商设置风险参数。所有执行均打包为具有全有或全无语义的原子 Soroban 交易。'
                                ),
                                tag: 'Blend · Soroswap · Atomic Soroban txs',
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
                    <h2 className="text-2xl sm:text-3xl font-bold text-center">
                        {lang('Five lines of code', 'Cinco líneas de código', '五行代码')}
                    </h2>
                    <p className="mt-4 text-center text-white/60 max-w-xl mx-auto">
                        {lang(
                            'Connect your API key. Define your rules. The agent does the rest.',
                            'Conecta tu API key. Define tus reglas. El agente hace el resto.',
                            '连接您的 API 密钥。定义规则。智能体完成其余操作。'
                        )}
                    </p>

                    <div className="mt-10 relative rounded-xl border border-white/10 bg-black overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                                <span className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                                <span className="ml-3 text-xs text-white/40 font-mono">treasury.ts</span>
                            </div>
                            <button
                                onClick={handleCopy}
                                className="text-xs text-white/50 hover:text-stellar-teal transition-colors font-mono"
                            >
                                {copied
                                    ? lang('Copied!', '¡Copiado!', '已复制！')
                                    : lang('Copy', 'Copiar', '复制')}
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
                            {lang('Full developer docs', 'Ver documentación completa', '完整开发者文档')}
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
                            {lang('Infrastructure layer', 'Capa de infraestructura', '基础设施层')}
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
                            {lang('Who plugs into Nirium', '¿Quién conecta Nirium?', '谁在接入 Nirium')}
                        </h2>
                        <p className="mt-4 text-white/45 max-w-lg mx-auto text-sm leading-relaxed">
                            {lang(
                                "Nirium is not a remittance product — it's the autonomous treasury layer that remittance fintechs, SaaS, and on-chain protocols connect to.",
                                'Nirium no es un producto de remesas — es la capa de tesorería autónoma a la que fintechs, SaaS y protocolos on-chain se conectan.',
                                'Nirium 不是汇款产品 — 而是汇款金融科技、SaaS 和链上协议接入的自主财库层。'
                            )}
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
                                        {lang('LATAM Fintech', 'LATAM Fintech', 'LATAM 金融科技')}
                                    </span>
                                    <span className="text-[9px] font-mono text-white/20">01</span>
                                </div>
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="w-10 h-10 rounded-xl bg-stellar-teal/10 border border-stellar-teal/20 flex items-center justify-center shrink-0 group-hover:border-stellar-teal/40 transition-colors">
                                        <Building2 className="w-5 h-5 text-stellar-teal" />
                                    </div>
                                    <h3 className="text-base font-black text-white leading-tight">
                                        {lang('Mexican fintechs & PSPs', 'Fintechs y PSPs mexicanos', '墨西哥金融科技与支付机构')}
                                    </h3>
                                </div>
                                <div className="space-y-2 mb-5">
                                    <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg bg-red-500/[0.06] border border-red-500/10">
                                        <span className="text-red-400/60 text-[9px] font-black uppercase tracking-widest shrink-0 pt-px">BEFORE</span>
                                        <span className="text-[11px] text-white/50 leading-snug">
                                            {lang('USDC sits idle between SPEI windows — 0% yield on treasury float', 'USDC parado entre ventanas SPEI — rendimiento 0% sobre el float', 'USDC 在 SPEI 窗口间闲置 — 财库浮动零收益')}
                                        </span>
                                    </div>
                                    <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg bg-stellar-teal/[0.06] border border-stellar-teal/10">
                                        <span className="text-stellar-teal text-[9px] font-black uppercase tracking-widest shrink-0 pt-px">AFTER</span>
                                        <span className="text-[11px] text-white/70 leading-snug">
                                            {lang('Agent auto-parks float in CETES. Redeems before the next SPEI cycle.', 'Agente estaciona el float en CETES y redime antes del ciclo SPEI.', '智能体自动将浮动存入 CETES，并在下一 SPEI 周期前赎回。')}
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-auto pt-4 border-t border-white/[0.06] flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-stellar-teal animate-pulse" />
                                        <span className="text-[10px] font-mono text-stellar-teal">~3.38% annual on idle float</span>
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
                                        {lang('Corporate treasury', 'Tesorería corporativa', '企业财库')}
                                    </span>
                                    <span className="text-[9px] font-mono text-white/20">02</span>
                                </div>
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="w-10 h-10 rounded-xl bg-stellar-yellow/10 border border-stellar-yellow/20 flex items-center justify-center shrink-0 group-hover:border-stellar-yellow/40 transition-colors">
                                        <Bot className="w-5 h-5 text-stellar-yellow" />
                                    </div>
                                    <h3 className="text-base font-black text-white leading-tight">
                                        {lang('SaaS & SMBs $1M–$10M ARR', 'SaaS y PyMEs $1M–$10M ARR', 'SaaS 及中小企业 $1M–$10M ARR')}
                                    </h3>
                                </div>
                                <div className="space-y-2 mb-5">
                                    <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg bg-red-500/[0.06] border border-red-500/10">
                                        <span className="text-red-400/60 text-[9px] font-black uppercase tracking-widest shrink-0 pt-px">BEFORE</span>
                                        <span className="text-[11px] text-white/50 leading-snug">
                                            {lang('CFO manually decides where to park USDC between billing cycles', 'CFO decide manualmente dónde estacionar USDC entre ciclos de facturación', 'CFO 在计费周期间手动决定 USDC 存放')}
                                        </span>
                                    </div>
                                    <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg bg-stellar-yellow/[0.06] border border-stellar-yellow/10">
                                        <span className="text-stellar-yellow text-[9px] font-black uppercase tracking-widest shrink-0 pt-px">AFTER</span>
                                        <span className="text-[11px] text-white/70 leading-snug">
                                            {lang('Autonomous agent rebalances 24/7. Treasury ops require zero human decisions.', 'Agente autónomo rebalancea 24/7. Tesorería opera sin decisiones humanas.', '自主智能体全天候再平衡。财库无需人工决策。')}
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-auto pt-4 border-t border-white/[0.06] flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-stellar-yellow animate-pulse" />
                                        <span className="text-[10px] font-mono text-stellar-yellow">0 manual decisions / week</span>
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
                                        {lang('On-chain protocols', 'Protocolos on-chain', '链上协议')}
                                    </span>
                                    <span className="text-[9px] font-mono text-white/20">03</span>
                                </div>
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0 group-hover:border-purple-500/40 transition-colors">
                                        <Layers className="w-5 h-5 text-purple-400" />
                                    </div>
                                    <h3 className="text-base font-black text-white leading-tight">
                                        {lang('Protocols on Stellar / Soroban', 'Protocolos en Stellar / Soroban', 'Stellar / Soroban 链上协议')}
                                    </h3>
                                </div>
                                <div className="space-y-2 mb-5">
                                    <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg bg-red-500/[0.06] border border-red-500/10">
                                        <span className="text-red-400/60 text-[9px] font-black uppercase tracking-widest shrink-0 pt-px">BEFORE</span>
                                        <span className="text-[11px] text-white/50 leading-snug">
                                            {lang('Protocol treasury sits idle or needs human operators to rebalance', 'Treasury del protocolo parado o necesita operadores para rebalancear', '协议财库闲置或需要人工操作员再平衡')}
                                        </span>
                                    </div>
                                    <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg bg-purple-500/[0.06] border border-purple-500/10">
                                        <span className="text-purple-400 text-[9px] font-black uppercase tracking-widest shrink-0 pt-px">AFTER</span>
                                        <span className="text-[11px] text-white/70 leading-snug">
                                            {lang('SDK integration — the protocol self-manages its treasury. Zero human ops.', 'Integración SDK — el protocolo autogestiona su tesorería. Cero humanos.', 'SDK 集成 — 协议自主管理财库。零人工操作。')}
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-auto pt-4 border-t border-white/[0.06] flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                                        <span className="text-[10px] font-mono text-purple-400">lending pools · DAO treasuries</span>
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
                        {lang('Why Nirium', 'Por qué Nirium', '为什么选择 Nirium')}
                    </h2>

                    {/* Arbiter callout */}
                    <div className="mt-10 relative rounded-xl border border-stellar-yellow/20 bg-stellar-yellow/[0.04] px-6 py-5 text-center overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,200,0,0.06),transparent_70%)]" />
                        <p className="relative text-base sm:text-lg font-black text-white tracking-tight">
                            {lang(
                                '"Soroban is the immutable arbiter — the LLM suggests, the contract decides. A committed AI cannot transfer funds."',
                                '"Soroban es el árbitro inmutable — el LLM sugiere, el contrato decide. Un agente comprometido no puede transferir fondos."',
                                '"Soroban 是不可变的仲裁者 — LLM 建议，合约决定。被攻击的 AI 无法转移资金。"'
                            )}
                        </p>
                        <p className="relative mt-2 text-xs text-stellar-yellow/60 font-mono uppercase tracking-widest">
                            Nirium Security Model — Soroban + HMAC-SHA256 + IPFS
                        </p>
                    </div>

                    <div className="mt-10 grid md:grid-cols-3 gap-6">
                        {[
                            {
                                icon: Lock,
                                title: lang('100% non-custodial', '100% non-custodial', '100% 非托管'),
                                body:  lang(
                                    'Soroban 2-of-3 vault. Owner + 2 cosigners. Nirium never has access to your funds.',
                                    'Vault Soroban 2-de-3. Owner + 2 cosignatarios. Nirium nunca tiene acceso a tus fondos.',
                                    'Soroban 2-of-3 保险库。Owner + 2 共签人。Nirium 永远无法访问您的资金。'
                                ),
                                link: '/security',
                            },
                            {
                                icon: FileCheck,
                                title: lang('CNBV-ready compliance', 'Compliance CNBV-ready', '符合 CNBV 合规'),
                                body:  lang(
                                    'Every decision signed with HMAC-SHA256 and IPFS-anchored. Exportable reports for regulators.',
                                    'Cada decisión firmada con HMAC-SHA256 y anclada en IPFS. Reporte exportable para reguladores.',
                                    '每个决策均经 HMAC-SHA256 签名并锚定至 IPFS。可导出报告供监管机构使用。'
                                ),
                                link: '/compliance',
                            },
                            {
                                icon: Building2,
                                title: lang('Powered by Etherfuse', 'Powered by Etherfuse', '由 Etherfuse 驱动'),
                                body:  lang(
                                    'Direct access to tokenized CETES — Mexican government T-bills — via Etherfuse. KYC onramp for humans. Swap without KYC for agents.',
                                    'Acceso directo a CETES tokenizados — Bonos del Gobierno Mexicano — vía Etherfuse. Onramp KYC para humanos. Swap sin KYC para agentes.',
                                    '通过 Etherfuse 直接访问代币化 CETES — 墨西哥政府国库券。人工 KYC 通道。智能体无需 KYC 即可兑换。'
                                ),
                                link: '/treasury',
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
                                    {lang('Learn more', 'Ver más', '了解更多')}
                                    <ChevronRight className="w-3 h-3" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* PRICING */}
            <section className="py-20 border-t border-white/5">
                <div className="max-w-5xl mx-auto px-6">
                    <h2 className="text-2xl sm:text-3xl font-bold text-center">
                        {lang('Public pricing', 'Precios públicos', '公开定价')}
                    </h2>
                    <p className="mt-4 text-center text-white/60">
                        {lang('No enterprise contracts until the big plan.', 'Sin contratos enterprise hasta el plan grande.', '大计划前无需企业合同。')}
                    </p>

                    <div className="mt-12 grid md:grid-cols-3 gap-6">
                        {/* Free */}
                        <div className="p-6 rounded-xl border border-white/10 bg-white/[0.02]">
                            <div className="text-xs uppercase tracking-widest text-white/40 mb-2">Sandbox</div>
                            <div className="text-3xl font-black mb-1">{lang('Free', 'Gratis', '免费')}</div>
                            <div className="text-sm text-white/40 mb-6">
                                {lang('Full testnet access', 'Testnet completo', '完整测试网访问')}
                            </div>
                            <ul className="space-y-2.5 text-sm text-white/70 mb-8">
                                <li className="flex gap-2"><Check className="w-4 h-4 text-stellar-teal shrink-0 mt-0.5" />{lang('1 test wallet', '1 wallet de prueba', '1 个测试钱包')}</li>
                                <li className="flex gap-2"><Check className="w-4 h-4 text-stellar-teal shrink-0 mt-0.5" />{lang('All APIs', 'Todas las APIs', '所有 API')}</li>
                                <li className="flex gap-2"><Check className="w-4 h-4 text-stellar-teal shrink-0 mt-0.5" />{lang('Unlimited requests', 'Sin límite de requests', '无限请求')}</li>
                            </ul>
                            <Link href="/dashboard">
                                <Button variant="outline" className="w-full border-white/20 hover:bg-white/5">
                                    {lang('Get started', 'Empezar', '开始使用')}
                                </Button>
                            </Link>
                        </div>

                        {/* Growth */}
                        <div className="relative p-6 rounded-xl border border-stellar-teal/40 bg-stellar-teal/[0.05]">
                            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-stellar-teal text-black text-[10px] font-black uppercase tracking-widest">
                                {lang('Recommended', 'Recomendado', '推荐')}
                            </div>
                            <div className="text-xs uppercase tracking-widest text-stellar-teal mb-2">Growth</div>
                            <div className="text-3xl font-black mb-1">$99<span className="text-base text-white/50">/mo</span></div>
                            <div className="text-sm text-white/40 mb-6">
                                {lang('+ 0.5% performance fee', '+ 0.5% comisión de desempeño', '+ 0.5% 绩效费')}
                            </div>
                            <ul className="space-y-2.5 text-sm text-white/80 mb-8">
                                <li className="flex gap-2"><Check className="w-4 h-4 text-stellar-teal shrink-0 mt-0.5" />{lang('Mainnet (when available)', 'Mainnet (cuando esté disponible)', '主网（可用时）')}</li>
                                <li className="flex gap-2"><Check className="w-4 h-4 text-stellar-teal shrink-0 mt-0.5" />{lang('5 production wallets', '5 wallets de producción', '5 个生产钱包')}</li>
                                <li className="flex gap-2"><Check className="w-4 h-4 text-stellar-teal shrink-0 mt-0.5" />{lang('Audit trail + IPFS', 'Audit trail + IPFS', '审计追踪 + IPFS')}</li>
                                <li className="flex gap-2"><Check className="w-4 h-4 text-stellar-teal shrink-0 mt-0.5" />{lang('CNBV reports', 'Reportes CNBV', 'CNBV 报告')}</li>
                                <li className="flex gap-2"><Check className="w-4 h-4 text-stellar-teal shrink-0 mt-0.5" />{lang('Email support', 'Email support', '邮件支持')}</li>
                            </ul>
                            <Link href="/dashboard">
                                <Button variant="premium" className="w-full">
                                    {lang('Reserve access', 'Reservar acceso', '预约访问')}
                                </Button>
                            </Link>
                        </div>

                        {/* Enterprise */}
                        <div className="p-6 rounded-xl border border-white/10 bg-white/[0.02]">
                            <div className="text-xs uppercase tracking-widest text-white/40 mb-2">Enterprise</div>
                            <div className="text-3xl font-black mb-1">Custom</div>
                            <div className="text-sm text-white/40 mb-6">
                                {lang('For CNBV-regulated fintechs', 'Para fintechs CNBV', '适用于 CNBV 监管金融科技')}
                            </div>
                            <ul className="space-y-2.5 text-sm text-white/70 mb-8">
                                <li className="flex gap-2"><Check className="w-4 h-4 text-stellar-teal shrink-0 mt-0.5" />{lang('Unlimited wallets', 'Wallets ilimitadas', '无限钱包')}</li>
                                <li className="flex gap-2"><Check className="w-4 h-4 text-stellar-teal shrink-0 mt-0.5" />{lang('SLA guarantee', 'SLA garantizado', 'SLA 保障')}</li>
                                <li className="flex gap-2"><Check className="w-4 h-4 text-stellar-teal shrink-0 mt-0.5" />{lang('Multi-tenant', 'Multi-tenant', '多租户')}</li>
                                <li className="flex gap-2"><Check className="w-4 h-4 text-stellar-teal shrink-0 mt-0.5" />{lang('On-premise option', 'On-premise opcional', '本地部署选项')}</li>
                                <li className="flex gap-2"><Check className="w-4 h-4 text-stellar-teal shrink-0 mt-0.5" />{lang('Dedicated support', 'Soporte dedicado', '专属支持')}</li>
                            </ul>
                            <a href="mailto:hello@nirium.xyz">
                                <Button variant="outline" className="w-full border-white/20 hover:bg-white/5">
                                    {lang('Contact us', 'Contactar', '联系我们')}
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
                        {lang('Credentials and stack', 'Reconocimientos y stack', '资质与技术栈')}
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
                        {[
                            'Stellar Scale Program',
                            'SCF Ecosystem Alignment',
                            'JARGUS Internal Test (78/78 Vectors)',
                            'External Audit Pending',
                            'Stellar Testnet',
                            'Soroban',
                            'Etherfuse',
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
                            {lang('Live on Testnet', 'En vivo en Testnet', '测试网实时运行')}
                        </div>
                        <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
                            {lang('The full product.', 'El producto completo.', '完整产品。')}{' '}
                            <span className="text-stellar-teal">{lang('Behind one click.', 'Detrás de un clic.', '一键即达。')}</span>
                        </h2>
                        <p className="mt-4 text-white/50 max-w-xl mx-auto text-sm">
                            {lang(
                                'Connect your Freighter wallet and access the full institutional dashboard — agents, analytics, vault, x402, MPP, and IPFS audit trail.',
                                'Conecta tu wallet Freighter y accede al dashboard institucional completo — agentes, analytics, vault, x402, MPP y rastro de auditoría IPFS.',
                                '连接 Freighter 钱包，访问完整的机构级仪表板 — 代理、分析、金库、x402、MPP 和 IPFS 审计追踪。'
                            )}
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
                                    { label: 'Dashboard',         active: true,  color: '#2DEBE8' },
                                    { label: 'Nodos de Ejecución', active: false, color: '#FFD700' },
                                    { label: 'Analytics',         active: false, color: '#34D399' },
                                    { label: 'Compliance',        active: false, color: '#2DEBE8' },
                                    { category: 'TREASURY', mt: true },
                                    { label: 'Blueprints',        active: false, color: '#A78BFA' },
                                    { label: 'Strategy Builder',  active: false, color: '#F97316' },
                                    { label: 'Fiat Hub',          active: false, color: '#34D399' },
                                    { category: 'DEVELOPER', mt: true },
                                    { label: 'Docs',              active: false, color: '#FFFFFF' },
                                    { label: 'Developers',        active: false, color: '#FFFFFF' },
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
                                        { label: 'Treasury Balance', value: '$127,430', sub: 'CETES 3.38% (gov. rate)', color: 'text-stellar-teal' },
                                        { label: 'Active Agents',    value: '3 / 30',  sub: '24/7 Autonomous', color: 'text-stellar-yellow' },
                                        { label: 'USDC → CETES',     value: '82%',     sub: 'Auto-rebalanced', color: 'text-purple-400' },
                                        { label: 'Audit Entries',    value: '1,847',   sub: 'IPFS Immutable',  color: 'text-green-400' },
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
                                        <span className="flex items-center gap-1 text-[9px] text-green-400 font-mono">
                                            <span className="w-1 h-1 rounded-full bg-green-400 animate-pulse" />
                                            LIVE
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        {[
                                            { time: '23:41:02', msg: '[AGENT-01] Rebalanced 2,400 USDC -> CETES via Etherfuse', type: 'success' },
                                            { time: '23:40:47', msg: '[AGENT-02] x402 micropayment: 0.05 USDC - API call billed', type: 'info' },
                                            { time: '23:40:31', msg: '[SENTINEL] Vault health check passed - all systems nominal', type: 'success' },
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
                                        {lang('Launch App — Free Testnet', 'Lanzar App — Testnet Gratis', '启动应用 — 免费测试网')}
                                        <ArrowRight className="ml-2 w-4 h-4" />
                                    </Button>
                                </Link>
                                <p className="text-[10px] text-white/30 font-mono">
                                    {lang('No funds at risk · Non-custodial · Freighter wallet', 'Sin fondos en riesgo · No custodial · Freighter', '无资金风险 · 非托管 · Freighter 钱包')}
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
                            'Ready to automate your treasury?',
                            '¿Listo para automatizar tu tesorería?',
                            '准备好自动化您的财库了吗？'
                        )}
                    </h2>
                    <p className="mt-4 text-white/60 max-w-xl mx-auto">
                        {lang(
                            'Five minutes setup. Zero sales calls. Free on testnet.',
                            'Cinco minutos de setup. Cero llamadas de ventas. Testnet completamente gratis.',
                            '五分钟设置。无销售电话。测试网完全免费。'
                        )}
                    </p>
                    <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
                        <Link href="/dashboard">
                            <Button size="lg" variant="premium" className="w-full sm:w-auto">
                                {lang('Get started free', 'Comenzar gratis', '免费开始')}
                                <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </Link>
                        <a href="https://github.com/Eras256/Nirium" target="_blank" rel="noopener">
                            <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/20 hover:bg-white/5">
                                GitHub
                                <ExternalLink className="ml-2 w-4 h-4" />
                            </Button>
                        </a>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
