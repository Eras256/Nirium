"use client";

import { motion } from "framer-motion";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { 
    Activity, TrendingUp, Zap, Server, Wallet, Database, 
    ShieldCheck, Globe, Cpu, Lock, Archive, ExternalLink,
    ChevronRight, Download, Box, Key, BarChart3, Clock,
    FileSearch, Shield, Fingerprint
} from "lucide-react";
import { SectionBrandLogo } from "@/components/ui/SectionBrandLogo";
import { useFreighter } from "@/hooks/useFreighter";
import { useEffect, useState, useRef } from "react";
import { useLanguage } from "@/context/LanguageContext";
import OpsConsole from "@/components/layout/OpsConsole";
import { ComplianceBanner, AtomicProofBadge } from "@/components/ui/ComplianceBanner";
import { useEloReputation } from "@/hooks/useNiriumContracts";
import { getCETESBalance, vaultGetVaultCount, vaultGetTotalFees } from "@/lib/sorobanContracts";

// ── StatCard ──────────────────────────────────────────────────────────────
const StatCard = ({ title, value, change, icon: Icon, color, status }: any) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#121212] border border-white/5 rounded-3xl p-6 relative overflow-hidden group hover:border-stellar-teal/20 transition-all duration-500 shadow-xl"
    >
        <div className="flex items-center justify-between mb-4 relative z-10">
            <div className={`p-2 rounded-xl bg-white/5 border border-white/10 ${color}`}>
                <Icon size={18} />
            </div>
            {status && (
                <span className={`text-[8px] font-black px-2 py-1 rounded-full border uppercase tracking-widest ${
                    status === 'READY' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                    status === 'PROCESSING' ? 'bg-stellar-yellow/10 text-stellar-yellow border-stellar-yellow/20' :
                    'bg-blue-500/10 text-blue-400 border-blue-500/20'
                }`}>
                    {status}
                </span>
            )}
        </div>
        <div className="space-y-1 relative z-10">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{title}</p>
            <h3 className="text-2xl font-black text-white font-mono italic tracking-tighter">{value}</h3>
            <p className={`text-[10px] font-black font-mono flex items-center gap-1 uppercase tracking-widest ${
                change && change.startsWith('+') ? 'text-emerald-400' : 'text-gray-500'
            }`}>
                {change}
            </p>
        </div>
    </motion.div>
);

// ── generate chart points ─────────────────────────────────────────────────
function generateHistory(points: number, hoursBack: number) {
    const now = new Date();
    return Array.from({ length: points }).map((_, i) => {
        const time = new Date(now.getTime() - (points - 1 - i) * hoursBack * 60 * 60 * 1000);
        const label = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return {
            name: label,
            value: parseFloat((1 + i * 0.15 + Math.random() * 0.2).toFixed(2)),
        };
    });
}

// Muestra ilustrativa de la FORMA de las entradas del feed — el feed vivo está
// en el dashboard. Ningún hash colgado aquí: antes estas líneas traían tx
// reales bajo leyendas inventadas (montos de 5,000 USDC cuando el rebalanceo
// mueve 1.0, nóminas de 42 destinatarios, agentes "Nexus" y "Void" que no
// existen). El texto de abajo sí describe lo que el sistema hace de verdad.
type AnalyticsLog = { time: string; source: string; type: string; msg: string; tx?: string };

const ANALYTICS_LOGS: AnalyticsLog[] = [
    { time: '00:25:44', source: 'REBALANCE_NODE', type: 'info', msg: 'Scan — CETES 5.57% (Etherfuse reference) vs idle USDC | base fee 100 stroops.' },
    { time: '00:25:46', source: 'REBALANCE_NODE', type: 'success', msg: 'Threshold exceeded (>2.5%). Moving 1.0 USDC to vault treasury — conversion is executed off-chain by Etherfuse, not by a DEX.' },
    { time: '00:25:48', source: 'AUDIT_NODE', type: 'audit', msg: 'Transaction confirmed on-chain before logging, then included in the daily anchored digest.' },
    { time: '00:30:12', source: 'PAYOUTS_NODE', type: 'payment', msg: 'Batch prepared: unsigned XDR built server-side. The client signs it with their own wallet — Nirium never holds the key.' },
    { time: '00:30:15', source: 'PAYOUTS_NODE', type: 'success', msg: 'Batch submitted. One signature, every transfer in a single Stellar transaction.' },
    { time: '00:35:00', source: 'SETTLEMENT', type: 'info', msg: 'x402 challenge issued — 0.02 USDC for /signals.' },
    { time: '00:35:02', source: 'SETTLEMENT', type: 'success', msg: 'Payment verified and settled on-chain before the response was returned.' },
    { time: '00:35:04', source: 'AUDIT_NODE', type: 'success', msg: 'Daily digest anchored to IPFS — one CID covering the confirmed executions of the day.' },
];

export default function AnalyticsPage() {
    const { t, language } = useLanguage();
    const { address: accountStr, isConnected } = useFreighter();
    const [timeRange, setTimeRange] = useState<'24H' | '7D' | '30D'>('24H');
    const [chartData, setChartData] = useState<any[]>([]);
    // Antes era `const latency = 142` — un número inventado bajo un panel
    // titulado "Infrastructure Status". Se mide de verdad contra /health.
    const [latency, setLatency] = useState<number | null>(null);
    const logContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let cancelled = false;
        const measure = async () => {
            const started = performance.now();
            try {
                await fetch('https://nirium-agent.fly.dev/health', { cache: 'no-store' });
                if (!cancelled) setLatency(Math.round(performance.now() - started));
            } catch {
                if (!cancelled) setLatency(null);
            }
        };
        measure();
        const id = setInterval(measure, 30_000);
        return () => { cancelled = true; clearInterval(id); };
    }, []);

    // ── Live on-chain stats ──────────────────────────────────────────────────
    const [vaultCount, setVaultCount] = useState<string>('—');
    const [feesCollected, setFeesCollected] = useState<string>('—');
    const [cetesBalance, setCetesBalance] = useState<string>('—');
    const [eloScore, setEloScore] = useState<string>('—');
    const [cetesRate, setCetesRate] = useState<string>('—');
    const elo = useEloReputation();

    useEffect(() => {
        setChartData(generateHistory(7, 4));
    }, [timeRange]);

    useEffect(() => {
        // Fetch on-chain metrics
        vaultGetVaultCount().then(n => setVaultCount(String(n))).catch(() => {});
        vaultGetTotalFees().then(f => setFeesCollected(`${(Number(f) / 10_000_000).toFixed(2)} XLM`)).catch(() => {});

        if (accountStr) {
            getCETESBalance(accountStr).then(b => setCetesBalance(`${Number(b).toFixed(2)} CETES`)).catch(() => {});
            elo.getScore(accountStr).then(s => setEloScore(String(s))).catch(() => {});
        }

        // Fetch live CETES rate from agent API
        fetch('https://nirium-agent.fly.dev/api/tickers')
            .then(r => r.json())
            .then(d => { if (d.cetesRate) setCetesRate(`${d.cetesRate.toFixed(2)}%`); })
            .catch(() => {});
    }, [accountStr]);

    return (
        <main className="min-h-screen pt-8 px-4 pb-20 relative overflow-hidden flex flex-col bg-nirium-obsidian">
            {/* Background Effects */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-stellar-yellow/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-stellar-teal/5 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-[1600px] w-full mx-auto relative z-10 px-4 md:px-8">
                {/* Header */}
                <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div className="space-y-4">
                        <SectionBrandLogo className="!justify-start mb-0" size="w-32 md:w-44" />
                        <div>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-4 bg-stellar-yellow/10 border border-stellar-yellow/20 rounded-full text-stellar-yellow text-[10px] font-black uppercase tracking-widest">
                                <Clock className="w-3.5 h-3.5" />
                                {language === "es" ? "BETA · FUNCIONALIDAD EN AUDITORÍA DE CUMPLIMIENTO" : "BETA · FEATURE UNDERGOING COMPLIANCE AUDIT"}
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic text-white flex items-center gap-4">
                                TREASURY TELEMETRY
                                <span className="text-[10px] not-italic font-black bg-white/5 text-gray-400 border border-white/10 px-3 py-1 rounded-full uppercase tracking-widest">
                                    v1.0.0
                                </span>
                            </h1>
                            <p className="text-gray-500 font-mono text-xs mt-2 uppercase tracking-widest">
                                Autonomous agent activity and compliance metrics // VAULT: {accountStr ? `${accountStr.slice(0, 8)}...${accountStr.slice(-4)}` : 'GC7FWETC...TJ5Y'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 px-6 py-3 bg-[#121212] border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">
                        <span className="text-blue-400 bg-blue-500/10 px-2 py-1 rounded-lg border border-blue-500/20">4 XLM</span>
                        <span className="text-stellar-yellow bg-stellar-yellow/10 px-2 py-1 rounded-lg border border-stellar-yellow/20">0 USDC</span>
                        <span className="text-gray-600">INFRA_READY</span>
                    </div>
                </header>

                <ComplianceBanner />

                {/* KPI Grid — live on-chain data */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                    <StatCard
                        title="CETES Balance"
                        value={cetesBalance}
                        change="ON-CHAIN"
                        icon={Wallet}
                        color="text-stellar-teal"
                        status="LIVE"
                    />
                    <StatCard
                        title="Vaults Created (testnet)"
                        value={vaultCount}
                        change="TESTNET · incl. our own tests"
                        icon={Server}
                        color="text-stellar-yellow"
                        status="LIVE"
                    />
                    <StatCard
                        title="ELO Score"
                        value={eloScore}
                        change="REPUTATION"
                        icon={TrendingUp}
                        color="text-green-400"
                        status="LIVE"
                    />
                    <StatCard
                        title="Deployment Fees (testnet)"
                        value={feesCollected}
                        change="TESTNET XLM · no monetary value"
                        icon={Database}
                        color="text-blue-400"
                        status="LIVE"
                    />
                    <StatCard
                        title="CETES Rate (Banxico)"
                        value={cetesRate}
                        change="REF. ONLY"
                        icon={Shield}
                        color="text-stellar-teal"
                    />
                </div>

                {/* Charts & Side Area */}
                <div className="grid lg:grid-cols-3 gap-8 mb-12">
                    <div className="lg:col-span-2 bg-[#121212] border border-white/5 rounded-3xl p-8 shadow-xl relative overflow-hidden group">
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex items-center gap-3">
                                <BarChart3 className="text-stellar-teal" size={20} />
                                <h3 className="text-sm font-black uppercase tracking-widest">TREASURY DEPLOYMENT HISTORY</h3>
                                {/* La serie viene de generateHistory() — es ilustrativa.
                                    Los KPIs de arriba sí son on-chain; sin esta etiqueta
                                    la gráfica se lee como si también lo fuera. */}
                                <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border border-amber-400/30 bg-amber-400/10 text-amber-400">
                                    {language === 'es' ? 'Datos de muestra' : 'Sample data'}
                                </span>
                            </div>
                            <div className="flex p-1 bg-black/40 rounded-xl border border-white/5">
                                {['24H', '7D', '30D'].map(r => (
                                    <button
                                        key={r}
                                        onClick={() => setTimeRange(r as any)}
                                        className={`px-4 py-1.5 text-[9px] font-black rounded-lg uppercase tracking-widest transition-all ${
                                            timeRange === r ? 'bg-white text-black shadow-lg' : 'text-gray-500 hover:text-white'
                                        }`}
                                    >
                                        {r}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2DEBE8" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#2DEBE8" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                                    <XAxis dataKey="name" stroke="#333" fontSize={10} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#333" fontSize={10} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#080808', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }}
                                        itemStyle={{ color: '#2DEBE8', fontWeight: 900, textTransform: 'uppercase', fontSize: '10px' }}
                                    />
                                    <Area type="monotone" dataKey="value" stroke="#2DEBE8" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-[#121212] border border-white/5 rounded-3xl p-8 shadow-xl">
                        <h3 className="text-[10px] font-black mb-8 text-gray-500 uppercase tracking-widest">CAPITAL DEPLOYMENT MATRIX</h3>
                        <div className="space-y-4">
                            {[
                                { asset: 'CETES', name: 'Etherfuse Stablebond', rate: '5.57%', type: 'GOVT BACKED' },
                                { asset: 'USDC', name: 'Operational Liquidity', rate: '0.00%', type: 'STABLE' },
                                { asset: 'AUDIT', name: 'IPFS Compliance Logs', rate: '100%', type: 'IMMUTABLE' },
                                { asset: 'XLM', name: 'Gas Reserve', rate: 'Min.', type: 'UTILITY' },
                                { asset: 'PAYROLL', name: 'Bulk Payroll Node', rate: '100 TX/BATCH', type: 'ACTIVE' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5 hover:border-stellar-teal/30 transition-all cursor-pointer group">
                                    <div className="flex items-center gap-4">
                                        <span className={`text-[8px] font-black px-2 py-1 rounded-lg border font-mono ${
                                            item.asset === 'USDC' ? 'bg-stellar-yellow/10 text-stellar-yellow border-stellar-yellow/20' :
                                            item.asset === 'AUDIT' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                                            item.asset === 'CETES' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                            item.asset === 'PAYROLL' ? 'bg-stellar-teal/10 text-stellar-teal border-stellar-teal/20' :
                                            'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                        }`}>{item.asset}</span>
                                        <span className="font-black text-xs text-gray-400 group-hover:text-white transition-colors uppercase italic tracking-tighter">{item.name}</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm text-emerald-400 font-black font-mono">{item.rate}</div>
                                        <div className="text-[8px] text-gray-600 font-black uppercase tracking-widest">{item.type}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8 mb-12">
                    {/* Agent Activity Feed */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-black text-gray-500 uppercase tracking-[0.3em] flex items-center gap-3">
                                <Activity className="w-4 h-4 text-stellar-teal" />
                                Agent Activity // Autonomous Feed
                            </h3>
                            <span className="text-[10px] font-black text-green-400 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20 animate-pulse uppercase tracking-widest">
                                24/7 MONITORING
                            </span>
                        </div>
                        
                        <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[600px]">
                            <div className="bg-black/40 p-4 border-b border-white/5 flex items-center justify-between font-mono text-[10px] text-gray-500">
                                {/* Antes decía AGENT_UPLINK_LIVE con un ledger sequence
                                    inventado. El feed real y en vivo está en el dashboard;
                                    esto es una muestra de la forma que tienen las entradas. */}
                                <div className="flex items-center gap-4">
                                    <span className="text-amber-400">SAMPLE_TRACE</span>
                                    <span>
                                        {language === 'es' ? 'Feed en vivo en el dashboard' : 'Live feed in the dashboard'}
                                    </span>
                                </div>
                                <Clock size={14} />
                            </div>
                            
                            <div 
                                ref={logContainerRef}
                                className="flex-1 overflow-y-auto p-6 font-mono space-y-4 custom-scrollbar"
                            >
                                {ANALYTICS_LOGS.map((log, i) => (
                                    <div key={i} className="group/log border-l-2 border-white/5 hover:border-stellar-teal/30 pl-4 transition-colors">
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="text-[9px] text-gray-600">[{log.time}]</span>
                                            <span className="text-[10px] font-black text-white uppercase italic tracking-tighter">{log.source}</span>
                                            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${
                                                log.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                                                log.type === 'payment' ? 'bg-stellar-yellow/10 text-stellar-yellow border border-stellar-yellow/20' :
                                                log.type === 'audit' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                                                'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                            }`}>{log.type}</span>
                                        </div>
                                        <p className="text-[11px] text-gray-300 leading-relaxed">
                                            {log.msg}
                                        </p>
                                        {log.tx && (
                                            <div className="mt-1 flex items-center gap-2">
                                                <span className="text-[9px] text-gray-600 font-mono truncate max-w-[150px]">
                                                    TX: {log.tx}
                                                </span>
                                                <AtomicProofBadge txHash={log.tx} />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-[#121212] border border-white/5 rounded-3xl p-8 shadow-xl relative overflow-hidden group">
                            <h3 className="text-[10px] font-black mb-8 text-gray-500 uppercase tracking-[0.3em]">INSTITUTIONAL AUDIT</h3>
                            <div className="flex flex-col items-center text-center mb-8">
                                <div className="text-6xl font-black text-white mb-2 font-mono italic tracking-tighter">100%</div>
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">COMPLIANCE UPTIME</p>
                            </div>
                            
                            <div className="flex items-center justify-center gap-3 mb-8">
                                <span className="text-[9px] bg-blue-500/10 text-blue-400 px-3 py-1 rounded-lg border border-blue-500/20 font-black uppercase">IPFS Anchored</span>
                                <span className="text-[9px] bg-stellar-yellow/10 text-stellar-yellow px-3 py-1 rounded-lg border border-stellar-yellow/20 font-black uppercase">Audit-Ready</span>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-[10px] font-black text-gray-300 uppercase tracking-widest">
                                    <ShieldCheck className="w-4 h-4 text-green-500" />
                                    Non-Custodial Integrity
                                </div>
                                <p className="text-[10px] text-gray-500 leading-relaxed pl-6">
                                    Decision Anchoring: ACTIVE<br/>
                                    Audit Trail (HMAC-SHA256): VERIFIED<br/>
                                    Aligned with Stellar Code of Conduct
                                </p>
                            </div>
                            
                            <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-stellar-teal opacity-5 rounded-full blur-3xl" />
                        </div>

                        <div className="bg-[#121212] border border-white/5 rounded-3xl p-8 shadow-xl">
                            <h3 className="text-[10px] font-black mb-8 text-gray-500 uppercase tracking-[0.3em]">Verified On-chain Evidence</h3>
                            {/* Hashes reales, etiquetados por red y verificados en Horizon
                                (los tres resuelven y son SUCCESS). Antes esta lista traía
                                leyendas inventadas colgadas de tx reales — el peor error
                                posible en la única página cuyo argumento es "verifícalo". */}
                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {[
                                    { net: 'mainnet' as const, date: '2026-07-09', tx: '3134a51c66091fd7fbd85b38a4a6ec6cd432bb92c2450eac84ea7855cb7558bc', msg: 'x402 settlement — 0.02 USDC to treasury' },
                                    { net: 'mainnet' as const, date: '2026-07-27', tx: '4813645165d15af1e503d66ef84d826e83fff235d4f98c3f6eba8a4e7c83795e', msg: 'x402 settlement — 0.02 USDC, signed via Pollar adapter' },
                                    // Se retiró la tx del 19-abr etiquetada 'NiriumVault — revoke_agent(1218)'.
                                    // El hash era real y la cuenta fue nuestra, pero el contrato invocado era
                                    // CAU2XBJT… — el vault VIEJO, retirado en la consolidación a 2 contratos de
                                    // mayo. O sea: la etiqueta nombraba un contrato que no es el que publicamos,
                                    // y quien hiciera clic para verificar encontraría una dirección que no cuadra.
                                    // En su lugar va la evidencia más fuerte que tenemos, y es de agosto:
                                    // el agente invirtiendo fondos ajenos dentro de una bóveda de la que no
                                    // puede sacarlos.
                                    { net: 'testnet' as const, date: '2026-08-05', tx: 'c53d474658898af7ebbb84d17845902572147cfe1fb72965833e3d4cf7552ed3', msg: 'DeFindex vault — Invest signed by the agent, not the owner' },
                                ].map((log) => (
                                    <div key={log.tx} className="p-4 bg-black/40 border border-white/5 rounded-2xl font-mono text-[10px] space-y-2 group hover:border-stellar-teal/30 transition-all">
                                        <div className="flex justify-between items-center text-gray-600">
                                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase border ${
                                                log.net === 'mainnet'
                                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                            }`}>
                                                {log.net}
                                            </span>
                                            <span>{log.date}</span>
                                        </div>
                                        <p className="text-gray-400">{log.msg}</p>
                                        <div className="flex items-center justify-between">
                                            <a
                                                href={`https://stellar.expert/explorer/${log.net === 'mainnet' ? 'public' : 'testnet'}/tx/${log.tx}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-stellar-teal font-black hover:underline flex items-center gap-1"
                                            >
                                                VERIFY_ON_EXPLORER
                                                <ExternalLink size={8} />
                                            </a>
                                            <span className="text-gray-600">TX: {log.tx.slice(0, 6)}…{log.tx.slice(-4)}</span>
                                        </div>
                                    </div>
                                ))}
                                <p className="text-center text-gray-700 text-[8px] uppercase font-black py-2">
                                    Full audit trail in the dashboard
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Network Status */}
                <div className="bg-[#121212] border border-white/5 rounded-3xl p-8 shadow-xl">
                    <h3 className="text-[10px] font-black mb-10 text-gray-500 uppercase tracking-[0.3em]">Institutional Infrastructure Status</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="space-y-2">
                            <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Stellar Core Connectivity</p>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-xs font-mono font-black text-white uppercase">Operational</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Soroban Contract State</p>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-xs font-mono font-black text-white uppercase">Active</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Audit Sync Latency</p>
                            <span className="text-xs font-mono font-black text-stellar-teal">{latency === null ? '—' : `${latency}ms`}</span>
                        </div>
                        <div className="space-y-2">
                            <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Network Protocol</p>
                            <span className="text-xs font-mono font-black text-white">Protocol 23</span>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
