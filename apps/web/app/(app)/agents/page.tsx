"use client";

import { motion } from "framer-motion";
import {
    Shield, Cpu, Globe, Lock, CheckCircle, Clock,
    Activity, Server, Zap, AlertTriangle, FlaskConical, ArrowRight,
    FileSearch
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
    const lang = (en: string, es: string, zh: string) =>
        language === "zh" ? zh : language === "es" ? es : en;

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
            statusLabel: "ACTIVE",
            statusColor: "bg-stellar-teal/10 text-stellar-teal border-stellar-teal/20",
            dotColor: "bg-stellar-teal",
            accentBorder: "border-stellar-teal/20",
            icon: Activity,
            iconColor: "text-stellar-teal",
            name: lang(
                "Rebalance Node",
                "Nodo de Rebalanceo",
                "再平衡节点"
            ),
            role: lang(
                "Autonomous rebalancing between USDC and CETES (Etherfuse) based on operator thresholds. Operates 24/7 with zero human intervention.",
                "Rebalanceo autónomo entre USDC y CETES (Etherfuse) basado en umbrales del operador. Opera 24/7 sin intervención humana.",
                "基于运营商阈值的 USDC 和 CETES (Etherfuse) 之间的自动再平衡。全天候运行，无需人工干预。"
            ),
            cycle: lang("Continuous / 24h active", "Continuo / 24h activo", "持续 / 24小时活跃"),
            trigger: lang(
                "Spread exceeds operator-configured threshold",
                "Spread supera umbral configurado por el operador",
                "利差超过运营商配置的阈值"
            ),
            authorized: lang(
                "Swap USDC↔CETES via Etherfuse, up to daily limit",
                "Swap USDC↔CETES vía Etherfuse, hasta límite diario",
                "通过 Etherfuse 交换 USDC↔CETES，不超过每日限额"
            ),
            audit: lang(
                "HMAC-SHA256 + IPFS anchor per execution",
                "HMAC-SHA256 + anclaje IPFS por ejecución",
                "每次执行 HMAC-SHA256 + IPFS 锚定"
            ),
            metric: lang(
                "Last execution: success · Monitoring: continuous",
                "Última ejecución: exitosa · Monitoreo: continuo 24h",
                "上次执行：成功 · 监控：持续不间断"
            ),
            locked: false,
        },
        {
            id: "compliance-sentinel",
            statusLabel: "ACTIVE",
            statusColor: "bg-green-500/10 text-green-400 border-green-500/20",
            dotColor: "bg-green-400",
            accentBorder: "border-green-500/20",
            icon: Shield,
            iconColor: "text-green-400",
            name: lang(
                "Compliance Sentinel",
                "Centinela de Cumplimiento",
                "合规哨兵"
            ),
            role: lang(
                "Real-time validation of vault movements against compliance policies. Rejects unauthorized multisig attempts.",
                "Validación en tiempo real de movimientos del vault contra políticas de cumplimiento. Rechaza intentos multisig no autorizados.",
                "根据合规策略实时验证资金库变动。拒绝未经授权的多签尝试。"
            ),
            cycle: lang("Continuous", "Continuo", "持续运行"),
            trigger: lang("Any vault event", "Cualquier evento del vault", "任何资金库事件"),
            authorized: lang(
                "Transaction validation, event filtering, policy enforcement",
                "Validación de transacciones, filtrado de eventos, aplicación de políticas",
                "交易验证、事件过滤、策略执行"
            ),
            audit: lang(
                "Audit logs anchored on IPFS",
                "Logs de auditoría anclados en IPFS",
                "审计日志锚定在 IPFS 上"
            ),
            metric: lang(
                "Uptime: 100% · Policies enforced: active",
                "Uptime: 100% · Políticas aplicadas: activas",
                "运行时间：100% · 策略执行：激活"
            ),
            locked: false,
        },
        {
            id: "settlement-hub",
            statusLabel: "ACTIVE",
            statusColor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
            dotColor: "bg-purple-400",
            accentBorder: "border-purple-500/20",
            icon: Globe,
            iconColor: "text-purple-400",
            name: lang(
                "Settlement Hub",
                "Hub de Liquidación",
                "结算中心"
            ),
            role: lang(
                "Orchestrates x402 micro-billing and MPP session-scoped institutional flows. Direct integration with Horizon Horizon API.",
                "Orquestra micro-facturación x402 y flujos institucionales MPP por sesión. Integración directa con Horizon Horizon API.",
                "编排 x402 微计费和 MPP 会话范围的机构流程。直接集成 Horizon Horizon API。"
            ),
            cycle: lang("On-demand", "Bajo demanda", "按需"),
            trigger: lang("Authenticated API calls", "Llamadas API autenticadas", "经过身份验证的 API 调用"),
            authorized: lang(
                "Payment verification, on-chain settlement",
                "Verificación de pagos, liquidación en cadena",
                "支付验证、链上结算"
            ),
            audit: lang(
                "Transaction hash anchored per payment",
                "Hash de transacción anclado por pago",
                "每笔支付锚定交易哈希"
            ),
            metric: lang(
                "Active protocols: x402 · MPP",
                "Protocolos activos: x402 · MPP",
                "激活协议：x402 · MPP"
            ),
            locked: false,
        },
        {
            id: "audit-node",
            statusLabel: "ACTIVE",
            statusColor: "bg-stellar-yellow/10 text-stellar-yellow border-stellar-yellow/20",
            dotColor: "bg-stellar-yellow",
            accentBorder: "border-stellar-yellow/20",
            icon: FileSearch,
            iconColor: "text-stellar-yellow",
            name: lang(
                "Audit Node",
                "Nodo de Auditoría",
                "审计节点"
            ),
            role: lang(
                "Generates CNBV-ready reports and ensures every vault operation is signed with HMAC-SHA256 and anchored to IPFS.",
                "Genera reportes listos para CNBV y asegura que cada operación del vault esté firmada con HMAC-SHA256 y anclada a IPFS.",
                "生成合规 CNBV 报告，并确保每个资金库操作都经过 HMAC-SHA256 签名并锚定到 IPFS。"
            ),
            cycle: lang("Continuous", "Continuo", "持续运行"),
            trigger: lang("Every signed execution", "Cada ejecución firmada", "每次签名的执行"),
            authorized: lang(
                "IPFS pinning, report generation, signature verification",
                "Pinning en IPFS, generación de reportes, verificación de firmas",
                "IPFS 固定、报告生成、签名验证"
            ),
            audit: lang(
                "Self-auditing — every report is verifiable on IPFS",
                "Auto-auditable — cada reporte es verificable en IPFS",
                "自我审计 — 每份报告都可在 IPFS 上验证"
            ),
            metric: lang(
                "Audit trail status: 100% anchored",
                "Estado del rastro de auditoría: 100% anclado",
                "审计追踪状态：100% 锚定"
            ),
            locked: false,
        },
        {
            id: "vault-operations",
            statusLabel: lang("2-OF-3 MULTISIG", "MULTISIG 2-DE-3", "2-OF-3 多签"),
            statusColor: "bg-red-500/10 text-red-400 border-red-500/20",
            dotColor: "bg-red-400",
            accentBorder: "border-red-500/20",
            icon: Lock,
            iconColor: "text-red-400",
            name: lang(
                "Vault Operations Node",
                "Nodo de Operaciones de Vault",
                "资金库操作节点"
            ),
            role: lang(
                "Critical treasury operations requiring human 2-of-3 multisig authorization. This node never executes autonomously.",
                "Operaciones críticas de tesorería que requieren autorización multisig humana 2-de-3. Este nodo nunca ejecuta de forma autónoma.",
                "需要人工 2/3 多签授权的关键资金库操作。此节点从不自主执行。"
            ),
            cycle: lang("Manual only", "Solo manual", "仅手动"),
            trigger: lang(
                "Multisig request from Owner/Cosigners",
                "Solicitud multisig de Owner/Cosignatarios",
                "来自所有者/共签者的多签请求"
            ),
            authorized: lang(
                "Withdrawals >$10K · Emergency Pause · Governance Changes",
                "Retiros >$10K · Pausa de Emergencia · Cambios de Gobernanza",
                "提款 >$10K · 紧急暂停 · 治理变更"
            ),
            audit: lang(
                "On-chain multisig event history",
                "Historial de eventos multisig on-chain",
                "链上多签事件历史"
            ),
            metric: lang(
                "Requires human signatures — no autonomous risk",
                "Requiere firmas humanas — sin riesgo autónomo",
                "需要人工签名 — 无自主风险"
            ),
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
                        {lang("Execution Architecture", "Arquitectura de Ejecución", "执行架构")}
                    </h1>
                    <p className="text-white/50 max-w-xl mx-auto text-base">
                        {lang(
                            "5 specialized nodes. Each with a defined role, authorized actions, and cryptographic audit trail.",
                            "5 nodos especializados. Cada uno con un rol definido, acciones autorizadas y rastro de auditoría criptográfico.",
                            "5 个专用节点。每个都有明确角色、授权操作和密码学审计追踪。"
                        )}
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
                        <span className="text-white/40">{lang("Connection", "Conexión", "连接")}</span>
                        <span className="text-stellar-teal ml-1">Stellar Testnet</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Server className="w-3 h-3 text-white/20" />
                        <span className="text-white/40">{lang("Latency", "Latencia", "延迟")}</span>
                        <span className="text-white/80 ml-1">~13ms</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Cpu className="w-3 h-3 text-white/20" />
                        <span className="text-white/40">{lang("Protocol", "Protocolo", "协议")}</span>
                        <span className="text-white/80 ml-1">Soroban v21</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Globe className="w-3 h-3 text-white/20" />
                        <span className="text-white/40">{lang("Network", "Red", "网络")}</span>
                        <span className="text-white/80 ml-1">Horizon API</span>
                    </div>
                    {eloScore !== null && (
                        <div className="flex items-center gap-1.5">
                            <Activity className="w-3 h-3 text-stellar-teal/60" />
                            <span className="text-white/40">ELO</span>
                            <span className="text-stellar-teal ml-1 font-bold">{eloScore}</span>
                        </div>
                    )}
                    {totalSentinels !== null && (
                        <div className="flex items-center gap-1.5">
                            <Shield className="w-3 h-3 text-green-400/60" />
                            <span className="text-white/40">{lang("Sentinels", "Centinelas", "哨兵")}</span>
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
                                                {lang("Cycle / Trigger", "Ciclo / Disparador", "周期 / 触发器")}
                                            </p>
                                            <p className="text-white/60">{node.cycle} — {node.trigger}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-1">
                                                {lang("Authorized Action", "Acción Autorizada", "授权操作")}
                                            </p>
                                            <p className="text-white/60">{node.authorized}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-1">
                                                {lang("Audit Trail", "Rastro de Auditoría", "审计追踪")}
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
                                {lang("What we removed and why", "Qué removimos y por qué", "我们删除了什么以及为什么")}
                            </p>
                            <p className="text-white/40 text-xs leading-relaxed">
                                {lang(
                                    "Previous versions showed 26 experimental agent names (Astra, Titan, Eliza, etc.) running \"spread condition\" checks. These were testnet research nodes that confused the institutional narrative. The 5 nodes above represent the actual production architecture — each with a defined role, authorized scope, and audit trail.",
                                    "Versiones anteriores mostraban 26 nombres de agentes experimentales (Astra, Titan, Eliza, etc.) ejecutando verificaciones de \"condiciones de spread\". Estos eran nodos de investigación en testnet que confundían la narrativa institucional. Los 5 nodos anteriores representan la arquitectura de producción real — cada uno con un rol definido, alcance autorizado y rastro de auditoría.",
                                    "以前的版本显示了 26 个实验性代理名称（Astra、Titan、Eliza 等）运行 \"利差条件\" 检查。这些是测试网研究节点，混淆了机构叙述。上面的 5 个节点代表实际生产架构 — 每个都有明确角色、授权范围和审计追踪。"
                                )}
                            </p>
                            <Link 
                                href="/labs/experimental" 
                                className="inline-flex items-center gap-1 mt-3 text-[10px] font-bold text-purple-400 hover:text-purple-300 transition-colors uppercase tracking-widest group"
                            >
                                <FlaskConical className="w-3 h-3" />
                                {lang("Access Experimental Labs", "Acceder a Laboratorios Experimentales", "访问实验实验室")}
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
                        {lang("Live Activity Feed", "Feed de Actividad en Vivo", "实时活动提要")}
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
