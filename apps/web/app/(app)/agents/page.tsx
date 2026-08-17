"use client";

import { motion } from "framer-motion";
import {
    Shield, Cpu, Globe, Lock, CheckCircle, Clock,
    Activity, Server, Zap, AlertTriangle, FlaskConical, ArrowRight,
    FileSearch, Send
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useFreighter } from "@/hooks/useFreighter";
import OpsConsole from "@/components/layout/OpsConsole";
import Link from "next/link";
import SecurityDisclaimer from "@/components/shared/SecurityDisclaimer";
import { useEffect, useState } from "react";
import { useEloReputation } from "@/hooks/useNiriumContracts";
import { eloGetTotalSentinels } from "@/lib/sorobanContracts";

export default function AgentsPage() {
    const { language } = useLanguage();
    const lang = (en: string, es: string) =>
        language === "es" ? es : en;

    const { address: walletAddress, isConnected } = useFreighter();
    const elo = useEloReputation();
    const [eloScore, setEloScore] = useState<number | null>(null);
    const [totalSentinels, setTotalSentinels] = useState<number | null>(null);

    useEffect(() => {
        eloGetTotalSentinels().then(n => setTotalSentinels(Number(n))).catch(() => {});
        if (walletAddress) {
            elo.getScore(walletAddress).then(s => setEloScore(s)).catch(() => {});
        }
    }, [walletAddress]);

    const nodes = [
        {
            id: "rebalance-node",
            statusLabel: "LIVE · MAINNET · INVITE-ONLY",
            statusColor: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
            dotColor: "bg-stellar-teal",
            accentBorder: "border-stellar-teal/20",
            icon: Activity,
            iconColor: "text-stellar-teal",
            name: lang(
                "Rebalance Node",
                "Nodo de Rebalanceo"),
            role: lang(
                "Autonomous rebalancing between USDC and CETES (Etherfuse) based on operator thresholds. Operates 24/7 with zero human intervention.",
                "Rebalanceo autónomo entre USDC y CETES (Etherfuse) basado en umbrales del operador. Opera 24/7 sin intervención humana."),
            cycle: lang("Continuous / 24h active", "Continuo / 24h activo"),
            trigger: lang(
                "Spread exceeds operator-configured threshold",
                "Spread supera umbral configurado por el operador"),
            authorized: lang(
                "Invest and Unwind between the vault own strategies — no swaps, no destination address",
                "Invest y Unwind entre las estrategias de la propia bóveda — sin swaps y sin dirección de destino"),
            audit: lang(
                "HMAC-SHA256 + IPFS anchor per execution",
                "HMAC-SHA256 + anclaje IPFS por ejecución"),
            metric: lang(
                "Last execution: success · Monitoring: continuous",
                "Última ejecución: exitosa · Monitoreo: continuo 24h"),
            locked: false,
        },
        {
            id: "payroll-node",
            statusLabel: "MAINNET · EARLY ACCESS",
            statusColor: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
            dotColor: "bg-stellar-teal",
            accentBorder: "border-stellar-teal/20",
            icon: Send,
            iconColor: "text-stellar-teal",
            name: lang(
                "Disbursement Node (Bulk Payouts)",
                "Nodo de Dispersión (Pagos Masivos)"),
            role: lang(
                "Disburse funds from one treasury to up to 100 recipients (contractors, freelancers, B2B partners) in a single signed batch payment. Non-custodial — the company signs in its own wallet, Nirium never holds funds.",
                "Dispersa fondos de una tesorería a hasta 100 destinatarios (contratistas, freelancers, socios B2B) en un solo lote de pago firmado. Non-custodial — la empresa firma en su propia wallet, Nirium nunca custodia fondos."),
            cycle: lang("On-demand / per run", "Bajo demanda / por corrida"),
            trigger: lang(
                "Company builds and signs a payout run",
                "La empresa arma y firma una corrida de pago"),
            authorized: lang(
                "Batch USDC/XLM payment (≤100 recipients) + sponsored USDC trustline onboarding",
                "Pago batch USDC/XLM (≤100 destinatarios) + alta de trustline USDC"),
            audit: lang(
                "Immutable IPFS receipt per run (optional LCP legal layer — in legal review)",
                "Recibo IPFS inmutable por corrida (capa legal LCP opcional — en revisión legal)"),
            metric: lang(
                "Mainnet early access · independent service payments only · Freighter-signed",
                "Mainnet early access · solo pagos de servicios independientes · firmado con Freighter"),
            locked: false,
        },
        {
            id: "compliance-sentinel",
            statusLabel: "ARCHITECTED",
            statusColor: "bg-white/5 text-white/40 border-white/10",
            dotColor: "bg-green-400",
            accentBorder: "border-green-500/20",
            icon: Shield,
            iconColor: "text-green-400",
            name: lang(
                "Compliance Sentinel",
                "Centinela de Cumplimiento"),
            role: lang(
                "Designed to validate vault movements against compliance policies before signature. Backend service exists; public surface ships after the external audit.",
                "Diseñado para validar movimientos del vault contra políticas de cumplimiento antes de firmar. El servicio backend existe; la superficie pública llega tras la auditoría externa."),
            cycle: lang("Continuous", "Continuo"),
            trigger: lang("Any vault event", "Cualquier evento del vault"),
            authorized: lang(
                "Transaction validation, event filtering, policy enforcement",
                "Validación de transacciones, filtrado de eventos, aplicación de políticas"),
            audit: lang(
                "Audit logs anchored on IPFS",
                "Logs de auditoría anclados en IPFS"),
            metric: lang(
                "Status: architected · not yet public",
                "Estado: en diseño · aún no público"),
            locked: false,
        },
        {
            id: "settlement-hub",
            statusLabel: "LIVE · MAINNET",
            statusColor: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
            dotColor: "bg-purple-400",
            accentBorder: "border-purple-500/20",
            icon: Globe,
            iconColor: "text-purple-400",
            name: lang(
                "Settlement Hub",
                "Hub de Liquidación"),
            role: lang(
                "Orchestrates x402 micro-billing and MPP Charge settlement, per request. Direct integration with the Horizon API.",
                "Orquestra micro-facturación x402 y liquidación MPP Charge, por request. Integración directa con la Horizon API."),
            cycle: lang("On-demand", "Bajo demanda"),
            trigger: lang("Authenticated API calls", "Llamadas API autenticadas"),
            authorized: lang(
                "Payment verification, on-chain settlement",
                "Verificación de pagos, liquidación en cadena"),
            audit: lang(
                "Transaction hash anchored per payment",
                "Hash de transacción anclado por pago"),
            metric: lang(
                "Active protocols: x402 · MPP — LIVE ON MAINNET",
                "Protocolos activos: x402 · MPP — EN VIVO EN MAINNET"),
            locked: false,
        },
        {
            id: "audit-node",
            statusLabel: "LIVE · MAINNET",
            statusColor: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
            dotColor: "bg-stellar-yellow",
            accentBorder: "border-stellar-yellow/20",
            icon: FileSearch,
            iconColor: "text-stellar-yellow",
            name: lang(
                "Audit Node",
                "Nodo de Auditoría"),
            role: lang(
                "Anchors every operation to IPFS as an immutable, publicly verifiable receipt, and powers institutional-format exports. Optional Legal Context Protocol layer in legal review.",
                "Ancla cada operación a IPFS como recibo inmutable y públicamente verificable, y alimenta exportes con formato institucional. Capa opcional Legal Context Protocol en revisión legal."),
            cycle: lang("Continuous", "Continuo"),
            trigger: lang("Every signed execution", "Cada ejecución firmada"),
            authorized: lang(
                "IPFS pinning, report generation, signature verification",
                "Pinning en IPFS, generación de reportes, verificación de firmas"),
            audit: lang(
                "Self-auditing — every report is verifiable on IPFS",
                "Auto-auditable — cada reporte es verificable en IPFS"),
            metric: lang(
                "Audit trail status: 100% anchored",
                "Estado del rastro de auditoría: 100% anclado"),
            locked: false,
        },
        {
            id: "vault-operations",
            statusLabel: lang("2-OF-3 MULTISIG · TESTNET", "MULTISIG 2-DE-3 · TESTNET"),
            statusColor: "bg-red-500/10 text-red-400 border-red-500/20",
            dotColor: "bg-red-400",
            accentBorder: "border-red-500/20",
            icon: Lock,
            iconColor: "text-red-400",
            name: lang(
                "Vault Operations Node",
                "Nodo de Operaciones de Vault"),
            role: lang(
                "Critical treasury operations requiring human 2-of-3 multisig authorization. This node never executes autonomously.",
                "Operaciones críticas de tesorería que requieren autorización multisig humana 2-de-3. Este nodo nunca ejecuta de forma autónoma."),
            cycle: lang("Manual only", "Solo manual"),
            trigger: lang(
                "Multisig request from Owner/Cosigners",
                "Solicitud multisig de Owner/Cosignatarios"),
            authorized: lang(
                "Protocol pause/unpause · cosigner changes · vault closure",
                "Pausa/reanudación del protocolo · cambio de cosignatarios · cierre de bóveda"),
            audit: lang(
                "On-chain multisig event history",
                "Historial de eventos multisig on-chain"),
            metric: lang(
                "Requires human signatures — no autonomous risk",
                "Requiere firmas humanas — sin riesgo autónomo"),
            locked: false,
        },
    ];

    return (
        <main className="min-h-screen bg-black text-white">
            {/* Background blobs */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-stellar-teal/4 rounded-full blur-[140px]" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/4 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-6 py-24">

                {/* ── HEADER ─────────────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-5xl sm:text-7xl font-black tracking-tight mb-4">
                        {lang("Execution Architecture", "Arquitectura de Ejecución")}
                    </h1>
                    <p className="text-white/50 max-w-xl mx-auto text-base">
                        {lang(
                            "6 specialized nodes. Each with a defined role, authorized actions, and cryptographic audit trail.",
                            "6 nodos especializados. Cada uno con un rol definido, acciones autorizadas y rastro de auditoría criptográfico.")}
                    </p>
                </motion.div>

                {/* ── LIVE STATUS BAR ─────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mb-14 flex flex-wrap items-center justify-center gap-4 sm:gap-8 px-5 py-3 bg-white/[0.03] border border-white/10 rounded-2xl text-xs font-mono"
                >
                    <div className="flex items-center gap-1.5">
                        <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-stellar-teal opacity-75" />
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-stellar-teal" />
                        </span>
                        <span className="text-white/40">{lang("Connection", "Conexión")}</span>
                        <span className="text-stellar-teal ml-1">Stellar Mainnet + Testnet</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Server className="w-3 h-3 text-white/20" />
                        <span className="text-white/40">{lang("Latency", "Latencia")}</span>
                        <span className="text-white/80 ml-1">~5s / ledger</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Cpu className="w-3 h-3 text-white/20" />
                        <span className="text-white/40">{lang("Protocol", "Protocolo")}</span>
                        <span className="text-white/80 ml-1">Soroban · Protocol 23</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Globe className="w-3 h-3 text-white/20" />
                        <span className="text-white/40">{lang("Network", "Red")}</span>
                        <span className="text-white/80 ml-1">Horizon API</span>
                    </div>
                    {eloScore !== null && eloScore > 0 && (
                        <div className="flex items-center gap-1.5">
                            <Activity className="w-3 h-3 text-stellar-teal/60" />
                            <span className="text-white/40">ELO</span>
                            <span className="text-stellar-teal ml-1 font-bold">{eloScore}</span>
                        </div>
                    )}
                    {totalSentinels !== null && totalSentinels > 0 && (
                        <div className="flex items-center gap-1.5">
                            <Shield className="w-3 h-3 text-green-400/60" />
                            <span className="text-white/40">{lang("Sentinels", "Centinelas")}</span>
                            <span className="text-green-400 ml-1 font-bold">{totalSentinels}</span>
                        </div>
                    )}
                </motion.div>

                {/* ── NODE CARDS ─────────────────────────────────────────── */}
                <div className="space-y-5 mb-16">
                    {nodes.map((node, i) => (
                        <motion.div
                            key={node.id}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.08 }}
                            className={`bg-white/[0.03] border ${node.accentBorder} rounded-2xl p-7 ${node.locked ? "opacity-50" : ""}`}
                        >
                            <div className="flex flex-col sm:flex-row sm:items-start gap-5">
                                {/* Icon */}
                                <div className={`p-3 rounded-xl bg-white/5 border border-white/10 shrink-0 ${node.locked ? "opacity-40" : ""}`}>
                                    {node.locked ? (
                                        <Lock className="w-5 h-5 text-white/30" />
                                    ) : (
                                        <node.icon className={`w-5 h-5 ${node.iconColor}`} />
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                        <h3 className="text-base font-black text-white">{node.name}</h3>
                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-widest ${node.statusColor}`}>
                                            {node.statusLabel}
                                        </span>
                                    </div>
                                    <p className="text-white/50 text-sm mb-5 leading-relaxed">{node.role}</p>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-xs">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-1">
                                                {lang("Cycle / Trigger", "Ciclo / Disparador")}
                                            </p>
                                            <p className="text-white/60">{node.cycle} — {node.trigger}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-1">
                                                {lang("Authorized Action", "Acción Autorizada")}
                                            </p>
                                            <p className="text-white/60">{node.authorized}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-1">
                                                {lang("Audit Trail", "Rastro de Auditoría")}
                                            </p>
                                            <p className="text-white/60">{node.audit}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Metric bar */}
                            <div className={`mt-5 pt-4 border-t border-white/5 flex items-center gap-2 text-[10px] font-mono ${node.locked ? "text-white/20" : "text-white/40"}`}>
                                <span className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 ${node.dotColor}`} />
                                {node.metric}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* ── WHAT WE REMOVED ────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mb-16"
                >
                    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6 flex items-start gap-3">
                        <AlertTriangle className="w-4 h-4 text-stellar-yellow/40 mt-0.5 shrink-0" />
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">
                                {lang("What we removed and why", "Qué removimos y por qué")}
                            </p>
                            <p className="text-white/40 text-xs leading-relaxed">
                                {lang(
                                    "Previous versions showed 26 experimental agent names (Astra, Titan, Eliza, etc.) running \"spread condition\" checks. These were testnet research nodes that confused the institutional narrative. The 6 nodes above represent the actual production architecture — each with a defined role, authorized scope, and audit trail.",
                                    "Versiones anteriores mostraban 26 nombres de agentes experimentales (Astra, Titan, Eliza, etc.) ejecutando verificaciones de \"condiciones de spread\". Estos eran nodos de investigación en testnet que confundían la narrativa institucional. Los 6 nodos anteriores representan la arquitectura de producción real — cada uno con un rol definido, alcance autorizado y rastro de auditoría.")}
                            </p>
                            <Link 
                                href="/labs/experimental" 
                                className="inline-flex items-center gap-1 mt-3 text-[10px] font-bold text-purple-400 hover:text-purple-300 transition-colors uppercase tracking-widest group"
                            >
                                <FlaskConical className="w-3 h-3" />
                                {lang("Access Experimental Labs", "Acceder a Laboratorios Experimentales")}
                                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </motion.div>

                <SecurityDisclaimer />

                {/* ── LIVE ACTIVITY FEED ─────────────────────────────────── */}
                <motion.section
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-xs font-black uppercase tracking-widest text-white/40 mb-5">
                        {lang("Live Activity Feed", "Feed de Actividad en Vivo")}
                    </h2>
                    <OpsConsole
                        isExpanded={false}
                        onToggleExpand={() => {}}
                        walletAddress={(isConnected && walletAddress) ? walletAddress : undefined}
                        heightClass="h-[300px]"
                    />
                </motion.section>

            </div>
        </main>
    );
}
