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
    const lang = (en: string, es: string) =>
        language === "es" ? es : en;

    const [strategyCount, setStrategyCount] = useState<number | null>(null);

    useEffect(() => {
        marketplaceGetStrategyCount().then(n => setStrategyCount(Number(n))).catch(() => {});
    }, []);

    const templates = [
        {
            icon: Building2,
            title: lang(
                "Conservative Rebalance USDC↔CETES",
                "Rebalanceo Conservador USDC↔CETES"),
            audience: lang(
                "For B2B fintechs",
                "Para fintechs B2B"),
            description: lang(
                "Maintains 60% minimum USDC liquidity. Rebalances when spread exceeds operator-configured threshold (default 1.5%). Full immutable audit trail anchored on IPFS.",
                "Mantiene liquidez mínima del 60% en USDC. Rebalancea cuando el spread supera el umbral configurado (default 1.5%). Rastro de auditoría inmutable completo anclado en IPFS."),
            status: lang(
                "Design public · Mainnet Q4 2026",
                "Diseño público · Mainnet Q4 2026"),
            statusColor: "text-stellar-teal",
            borderColor: "border-stellar-teal/20",
        },
        {
            icon: Layers,
            title: lang(
                "Idle Capital Optimization",
                "Optimización de Capital Ocioso"),
            audience: lang(
                "For SMBs $1M–$10M ARR",
                "Para PYMEs $1M–$10M ARR"),
            description: lang(
                "Allocates USDC idle between payment cycles into short-duration instruments. Auto-rebalances according to the company's operational calendar.",
                "Asigna USDC ocioso entre ciclos de pago a instrumentos de corta duración. Rebalancea automáticamente según el calendario operativo de la empresa."),
            status: lang("In development", "En desarrollo"),
            statusColor: "text-stellar-yellow",
            borderColor: "border-stellar-yellow/20",
        },
        {
            icon: Bot,
            title: lang(
                "DeFi Protocol Treasury",
                "Tesorería de Protocolo DeFi"),
            audience: lang(
                "For DAOs on Stellar",
                "Para DAOs en Stellar"),
            description: lang(
                "Programmatic treasury management 24/7. No human operators. Policy-based rules defined as Soroban smart contracts with full on-chain audit trail.",
                "Gestión de tesorería programática 24/7. Sin operadores humanos. Reglas basadas en políticas definidas como contratos inteligentes Soroban con rastro de auditoría completo en cadena."),
            status: lang("Design public", "Diseño público"),
            statusColor: "text-purple-400",
            borderColor: "border-purple-400/20",
        },
    ];

    const steps = [
        {
            number: "01",
            label: lang("Discover", "Descubrir"),
            desc: lang(
                "Browse auditable treasury templates designed for LATAM compliance",
                "Navega plantillas de tesorería auditables diseñadas para cumplimiento en LATAM"),
        },
        {
            number: "02",
            label: lang("Customize", "Personalizar"),
            desc: lang(
                "Set your thresholds, limits, and operational calendar via config UI",
                "Configura tus umbrales, límites y calendario operativo via interfaz"),
        },
        {
            number: "03",
            label: lang("Deploy", "Desplegar"),
            desc: lang(
                "Deploy as a Soroban smart contract — immutable, auditable policy",
                "Despliega como contrato inteligente Soroban — política inmutable y auditable"),
        },
        {
            number: "04",
            label: lang("Audit", "Auditar"),
            desc: lang(
                "Every execution anchored to IPFS. Full immutable audit trail",
                "Cada ejecución anclada en IPFS. rastro de auditoría auditor-ready"),
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
                                "PRÓXIMAMENTE · POST-MAINNET Q4 2026")}
                        </div>
                        {strategyCount !== null && (
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-stellar-teal/10 border border-stellar-teal/20 rounded-full text-stellar-teal text-[10px] font-black uppercase tracking-widest">
                                <Activity className="w-3 h-3" />
                                {strategyCount} {lang("strategies on-chain", "estrategias on-chain")}
                            </div>
                        )}
                    </div>

                    <h1 className="text-5xl sm:text-7xl font-black tracking-tight mb-6">
                        {lang("Strategy Marketplace", "Marketplace de Estrategias")}
                    </h1>

                    <p className="text-white/50 max-w-2xl mx-auto text-base leading-relaxed">
                        {lang(
                            "A planned institutional treasury template marketplace. CFOs and operators will discover, customize, and deploy auditable treasury policies as Soroban smart contracts — not trading products, not speculation.",
                            "Un marketplace planificado de plantillas institucionales de tesorería. CFOs y operadores podrán descubrir, personalizar y desplegar políticas de tesorería auditables como contratos inteligentes Soroban — no productos de trading, no especulación.")}
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
                        {lang("Why a Marketplace", "Por qué un Marketplace")}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8">
                            <p className="text-[10px] font-black uppercase tracking-widest text-red-400/70 mb-3">
                                {lang("The Problem", "El Problema")}
                            </p>
                            <h3 className="text-xl font-black mb-4 text-white">
                                {lang(
                                    "Excel rules. WhatsApp decisions.",
                                    "Reglas en Excel. Decisiones por WhatsApp.")}
                            </h3>
                            <p className="text-white/50 text-sm leading-relaxed">
                                {lang(
                                    "LATAM CFOs currently define treasury rules in spreadsheets and communicate policy changes over messaging apps. Nothing is auditable, nothing is reproducible, and nothing scales.",
                                    "Los CFOs de LATAM actualmente definen reglas de tesorería en hojas de cálculo y comunican cambios de política por apps de mensajería. Nada es auditable, nada es reproducible y nada escala.")}
                            </p>
                        </div>
                        <div className="bg-white/[0.03] border border-stellar-teal/20 rounded-2xl p-8">
                            <p className="text-[10px] font-black uppercase tracking-widest text-stellar-teal/70 mb-3">
                                {lang("The Solution", "La Solución")}
                            </p>
                            <h3 className="text-xl font-black mb-4 text-white">
                                {lang(
                                    "Programmatic, auditable, replicable.",
                                    "Programático, auditable, replicable.")}
                            </h3>
                            <p className="text-white/50 text-sm leading-relaxed">
                                {lang(
                                    "Treasury policies codified as Soroban smart contracts. Every parameter is on-chain, every execution is IPFS-anchored, every change requires multisig authorization.",
                                    "Políticas de tesorería codificadas como contratos inteligentes Soroban. Cada parámetro está en cadena, cada ejecución está anclada en IPFS, cada cambio requiere autorización multisig.")}
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
                        {lang("Planned Templates", "Plantillas Planificadas")}
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
                        {lang("How it will work", "Cómo funcionará")}
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
                            {lang("Early Access", "Acceso Anticipado")}
                        </div>
                        <h2 className="text-3xl font-black mb-3">
                            {lang("Join early access", "Únete al acceso anticipado")}
                        </h2>
                        <p className="text-white/50 text-sm mb-8 max-w-md mx-auto">
                            {lang(
                                "Get notified when the marketplace launches and access template previews before public release.",
                                "Recibe una notificación cuando el marketplace se lance y accede a previews de plantillas antes del lanzamiento público.")}
                        </p>
                        {/* El formulario anterior guardaba el correo en useState y nada más:
                            "Notificarme" prometía un aviso que nadie iba a recibir, y de paso
                            recogía un dato personal para tirarlo. Un mailto no recoge nada,
                            no promete nada, y sí llega. */}
                        <a
                            href="mailto:niriumprotocol@gmail.com?subject=Marketplace%20de%20estrategias%20%E2%80%94%20avisenme%20cuando%20abra"
                            className="inline-flex items-center justify-center px-6 py-3 bg-stellar-teal text-[#0b0b0b] text-sm font-black rounded-xl hover:bg-stellar-teal/90 transition-colors uppercase tracking-widest"
                        >
                            {lang('Write to us', 'Escríbenos')}
                        </a>
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
                            "Marketplace pendiente de lanzamiento. Las plantillas mostradas son diseños preliminares no operativos. Nirium no ofrece productos de inversión, instrumentos financieros ni estrategias de trading especulativo.")}
                    </p>
                </motion.div>

            </div>
        </main>
    );
}
