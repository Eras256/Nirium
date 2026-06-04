"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Clock, Building2, Bot, Layers, ArrowRight,
    Mail, Lock, ShieldCheck, Activity
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import SecurityDisclaimer from "@/components/shared/SecurityDisclaimer";
import { marketplaceGetStrategyCount } from "@/lib/sorobanContracts";

export default function MarketplacePage() {
    const { language } = useLanguage();
    const lang = (en: string, es: string, zh: string) =>
        language === "zh" ? zh : language === "es" ? es : en;

    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [strategyCount, setStrategyCount] = useState<number | null>(null);

    useEffect(() => {
        marketplaceGetStrategyCount().then(n => setStrategyCount(Number(n))).catch(() => {});
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) setSubmitted(true);
    };

    const templates = [
        {
            icon: Building2,
            title: lang(
                "Conservative Rebalance USDC↔CETES",
                "Rebalanceo Conservador USDC↔CETES",
                "保守型再平衡 USDC↔CETES"
            ),
            audience: lang(
                "For B2B fintechs",
                "Para fintechs B2B",
                "面向 B2B 金融科技"
            ),
            description: lang(
                "Maintains 60% minimum USDC liquidity. Rebalances when spread exceeds operator-configured threshold (default 1.5%). Full CNBV audit trail anchored on IPFS.",
                "Mantiene liquidez mínima del 60% en USDC. Rebalancea cuando el spread supera el umbral configurado (default 1.5%). Rastro de auditoría CNBV completo anclado en IPFS.",
                "保持最低 60% USDC 流动性。当利差超过运营商配置的阈值（默认 1.5%）时重新平衡。完整 CNBV 审计追踪锚定在 IPFS 上。"
            ),
            status: lang(
                "Design public · Mainnet Q4 2026",
                "Diseño público · Mainnet Q4 2026",
                "设计公开 · 主网 Q4 2026"
            ),
            statusColor: "text-stellar-teal",
            borderColor: "border-stellar-teal/20",
        },
        {
            icon: Layers,
            title: lang(
                "Idle Capital Optimization",
                "Optimización de Capital Ocioso",
                "闲置资本优化"
            ),
            audience: lang(
                "For SMBs $1M–$10M ARR",
                "Para PYMEs $1M–$10M ARR",
                "面向年收入 $1M–$10M 的中小企业"
            ),
            description: lang(
                "Allocates USDC idle between payroll cycles into short-duration instruments. Auto-rebalances according to the company's operational calendar.",
                "Asigna USDC ocioso entre ciclos de nómina a instrumentos de corta duración. Rebalancea automáticamente según el calendario operativo de la empresa.",
                "将薪资周期之间的闲置 USDC 分配到短期工具中。根据公司运营日历自动重新平衡。"
            ),
            status: lang("In development", "En desarrollo", "开发中"),
            statusColor: "text-stellar-yellow",
            borderColor: "border-stellar-yellow/20",
        },
        {
            icon: Bot,
            title: lang(
                "DeFi Protocol Treasury",
                "Tesorería de Protocolo DeFi",
                "DeFi 协议金库"
            ),
            audience: lang(
                "For DAOs on Stellar",
                "Para DAOs en Stellar",
                "面向 Stellar 上的 DAO"
            ),
            description: lang(
                "Programmatic treasury management 24/7. No human operators. Policy-based rules defined as Soroban smart contracts with full on-chain audit trail.",
                "Gestión de tesorería programática 24/7. Sin operadores humanos. Reglas basadas en políticas definidas como contratos inteligentes Soroban con rastro de auditoría completo en cadena.",
                "全天候程序化资金库管理。无需人工操作员。基于策略的规则定义为 Soroban 智能合约，完整链上审计追踪。"
            ),
            status: lang("Design public", "Diseño público", "设计公开"),
            statusColor: "text-purple-400",
            borderColor: "border-purple-400/20",
        },
    ];

    const steps = [
        {
            number: "01",
            label: lang("Discover", "Descubrir", "发现"),
            desc: lang(
                "Browse auditable treasury templates designed for LATAM compliance",
                "Navega plantillas de tesorería auditables diseñadas para cumplimiento en LATAM",
                "浏览专为 LATAM 合规设计的可审计资金库模板"
            ),
        },
        {
            number: "02",
            label: lang("Customize", "Personalizar", "定制"),
            desc: lang(
                "Set your thresholds, limits, and operational calendar via config UI",
                "Configura tus umbrales, límites y calendario operativo via interfaz",
                "通过配置界面设置阈值、限额和运营日历"
            ),
        },
        {
            number: "03",
            label: lang("Deploy", "Desplegar", "部署"),
            desc: lang(
                "Deploy as a Soroban smart contract — immutable, auditable policy",
                "Despliega como contrato inteligente Soroban — política inmutable y auditable",
                "部署为 Soroban 智能合约 — 不可变、可审计的策略"
            ),
        },
        {
            number: "04",
            label: lang("Audit", "Auditar", "审计"),
            desc: lang(
                "Every execution anchored to IPFS. Full CNBV-ready audit trail",
                "Cada ejecución anclada en IPFS. Rastro de auditoría listo para CNBV",
                "每次执行锚定到 IPFS。完整的 CNBV 就绪审计追踪"
            ),
        },
    ];

    return (
        <main className="min-h-screen bg-black text-white">
            {/* Background blobs */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-stellar-teal/5 rounded-full blur-[140px]" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-stellar-yellow/4 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-6 py-24">

                {/* ── HEADER ─────────────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-20"
                >
                    <div className="flex items-center justify-center gap-3 mb-6 flex-wrap">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-stellar-yellow/10 border border-stellar-yellow/20 rounded-full text-stellar-yellow text-[10px] font-black uppercase tracking-widest">
                            <Clock className="w-3 h-3" />
                            {lang(
                                "COMING SOON · POST-MAINNET Q4 2026",
                                "PRÓXIMAMENTE · POST-MAINNET Q4 2026",
                                "即将推出 · 主网后 Q4 2026"
                            )}
                        </div>
                        {strategyCount !== null && (
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-stellar-teal/10 border border-stellar-teal/20 rounded-full text-stellar-teal text-[10px] font-black uppercase tracking-widest">
                                <Activity className="w-3 h-3" />
                                {strategyCount} {lang("strategies on-chain", "estrategias on-chain", "链上策略")}
                            </div>
                        )}
                    </div>

                    <h1 className="text-5xl sm:text-7xl font-black tracking-tight mb-6">
                        {lang("Strategy Marketplace", "Marketplace de Estrategias", "策略市场")}
                    </h1>

                    <p className="text-white/50 max-w-2xl mx-auto text-base leading-relaxed">
                        {lang(
                            "A planned institutional treasury template marketplace. CFOs and operators will discover, customize, and deploy auditable treasury policies as Soroban smart contracts — not trading products, not speculation.",
                            "Un marketplace planificado de plantillas institucionales de tesorería. CFOs y operadores podrán descubrir, personalizar y desplegar políticas de tesorería auditables como contratos inteligentes Soroban — no productos de trading, no especulación.",
                            "计划中的机构资金库模板市场。CFO 和运营者将发现、定制和部署可审计的资金库策略作为 Soroban 智能合约 — 非交易产品，非投机。"
                        )}
                    </p>
                </motion.div>

                {/* ── WHY A MARKETPLACE ──────────────────────────────────── */}
                <motion.section
                    initial={{ opacity: 0, y: 32 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mb-20"
                >
                    <h2 className="text-xs font-black uppercase tracking-widest text-white/40 mb-8 text-center">
                        {lang("Why a Marketplace", "Por qué un Marketplace", "为什么需要市场")}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8">
                            <p className="text-[10px] font-black uppercase tracking-widest text-red-400/70 mb-3">
                                {lang("The Problem", "El Problema", "问题")}
                            </p>
                            <h3 className="text-xl font-black mb-4 text-white">
                                {lang(
                                    "Excel rules. WhatsApp decisions.",
                                    "Reglas en Excel. Decisiones por WhatsApp.",
                                    "Excel 规则，WhatsApp 决策。"
                                )}
                            </h3>
                            <p className="text-white/50 text-sm leading-relaxed">
                                {lang(
                                    "LATAM CFOs currently define treasury rules in spreadsheets and communicate policy changes over messaging apps. Nothing is auditable, nothing is reproducible, and nothing scales.",
                                    "Los CFOs de LATAM actualmente definen reglas de tesorería en hojas de cálculo y comunican cambios de política por apps de mensajería. Nada es auditable, nada es reproducible y nada escala.",
                                    "LATAM 的 CFO 目前在电子表格中定义资金库规则，并通过消息应用传达政策变更。没有任何内容可审计、可重现或可扩展。"
                                )}
                            </p>
                        </div>
                        <div className="bg-white/[0.03] border border-stellar-teal/20 rounded-2xl p-8">
                            <p className="text-[10px] font-black uppercase tracking-widest text-stellar-teal/70 mb-3">
                                {lang("The Solution", "La Solución", "解决方案")}
                            </p>
                            <h3 className="text-xl font-black mb-4 text-white">
                                {lang(
                                    "Programmatic, auditable, replicable.",
                                    "Programático, auditable, replicable.",
                                    "程序化、可审计、可复制。"
                                )}
                            </h3>
                            <p className="text-white/50 text-sm leading-relaxed">
                                {lang(
                                    "Treasury policies codified as Soroban smart contracts. Every parameter is on-chain, every execution is IPFS-anchored, every change requires multisig authorization.",
                                    "Políticas de tesorería codificadas como contratos inteligentes Soroban. Cada parámetro está en cadena, cada ejecución está anclada en IPFS, cada cambio requiere autorización multisig.",
                                    "资金库策略编码为 Soroban 智能合约。每个参数都在链上，每次执行都锚定在 IPFS 上，每次变更都需要多签授权。"
                                )}
                            </p>
                        </div>
                    </div>
                </motion.section>

                {/* ── PLANNED TEMPLATES ──────────────────────────────────── */}
                <motion.section
                    initial={{ opacity: 0, y: 32 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mb-20"
                >
                    <h2 className="text-xs font-black uppercase tracking-widest text-white/40 mb-8 text-center">
                        {lang("Planned Templates", "Plantillas Planificadas", "计划模板")}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {templates.map((tpl, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                className={`bg-white/[0.03] border ${tpl.borderColor} rounded-2xl p-7 flex flex-col gap-4 hover:bg-white/[0.05] transition-colors duration-300`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                                        <tpl.icon className="w-5 h-5 text-white/60" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
                                        {tpl.audience}
                                    </span>
                                </div>
                                <h3 className="text-base font-black text-white leading-snug">
                                    {tpl.title}
                                </h3>
                                <p className="text-white/50 text-xs leading-relaxed flex-1">
                                    {tpl.description}
                                </p>
                                <div className={`text-[10px] font-black uppercase tracking-widest ${tpl.statusColor}`}>
                                    {tpl.status}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.section>

                {/* ── HOW IT WILL WORK ───────────────────────────────────── */}
                <motion.section
                    initial={{ opacity: 0, y: 32 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mb-20"
                >
                    <h2 className="text-xs font-black uppercase tracking-widest text-white/40 mb-8 text-center">
                        {lang("How it will work", "Cómo funcionará", "工作原理")}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {steps.map((step, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 16 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 relative overflow-hidden"
                            >
                                <div className="text-5xl font-black text-white/5 absolute top-2 right-4 select-none">
                                    {step.number}
                                </div>
                                <div className="p-2 w-fit rounded-lg bg-stellar-teal/10 mb-4">
                                    <Activity className="w-4 h-4 text-stellar-teal" />
                                </div>
                                <p className="text-stellar-teal text-[10px] font-black uppercase tracking-widest mb-2">
                                    {step.number}
                                </p>
                                <h3 className="text-base font-black text-white mb-2">
                                    {step.label}
                                </h3>
                                <p className="text-white/40 text-xs leading-relaxed">
                                    {step.desc}
                                </p>
                                {i < steps.length - 1 && (
                                    <ArrowRight className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/10 z-10" />
                                )}
                            </motion.div>
                        ))}
                    </div>
                </motion.section>

                {/* ── WAITLIST ───────────────────────────────────────────── */}
                <motion.section
                    initial={{ opacity: 0, y: 32 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mb-20"
                >
                    <div className="bg-white/[0.03] border border-stellar-teal/20 rounded-2xl p-10 text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-stellar-teal/10 border border-stellar-teal/20 rounded-full text-stellar-teal text-[10px] font-black uppercase tracking-widest mb-6">
                            <Mail className="w-3 h-3" />
                            {lang("Early Access", "Acceso Anticipado", "早期访问")}
                        </div>
                        <h2 className="text-3xl font-black mb-3">
                            {lang("Join early access", "Únete al acceso anticipado", "加入早期访问")}
                        </h2>
                        <p className="text-white/50 text-sm mb-8 max-w-md mx-auto">
                            {lang(
                                "Get notified when the marketplace launches and access template previews before public release.",
                                "Recibe una notificación cuando el marketplace se lance y accede a previews de plantillas antes del lanzamiento público.",
                                "在市场上线时获得通知，并在公开发布前访问模板预览。"
                            )}
                        </p>
                        {submitted ? (
                            <div className="flex items-center justify-center gap-2 text-stellar-teal font-black text-sm uppercase tracking-widest">
                                <ShieldCheck className="w-5 h-5" />
                                {lang("You're on the list!", "¡Estás en la lista!", "您已加入列表！")}
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder={lang("your@company.com", "tu@empresa.com", "您的@公司.com")}
                                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-stellar-teal/40 transition-colors"
                                />
                                <button
                                    type="submit"
                                    className="shrink-0 px-6 py-3 bg-stellar-teal text-black text-sm font-black rounded-xl hover:bg-stellar-teal/90 transition-colors"
                                >
                                    {lang("Notify me", "Notificarme", "通知我")}
                                </button>
                            </form>
                        )}
                    </div>
                </motion.section>

                <SecurityDisclaimer />

                {/* ── DISCLAIMER ─────────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="bg-white/[0.02] border border-white/5 rounded-xl p-6 flex items-start gap-3"
                >
                    <Lock className="w-4 h-4 text-white/20 mt-0.5 shrink-0" />
                    <p className="text-white/30 text-xs leading-relaxed">
                        {lang(
                            "Marketplace pending launch. Templates shown are non-operative preliminary designs. Nirium does not offer investment products, financial instruments, or speculative trading strategies.",
                            "Marketplace pendiente de lanzamiento. Las plantillas mostradas son diseños preliminares no operativos. Nirium no ofrece productos de inversión, instrumentos financieros ni estrategias de trading especulativo.",
                            "市场待上线。所示模板为非运营的初步设计。Nirium 不提供投资产品、金融工具或投机性交易策略。"
                        )}
                    </p>
                </motion.div>

            </div>
        </main>
    );
}
