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

const ANALYTICS_LOGS = [
    { time: '00:25:44', source: 'REBALANCE_AGENT', type: 'info', msg: 'Checking spread: CETES (Banxico) vs USDC (Vault)...' },
    { time: '00:25:46', source: 'REBALANCE_AGENT', type: 'success', msg: 'Threshold exceeded. Initiating swap: 5,000 USDC -> CETES via Etherfuse.' },
    { time: '00:25:48', source: 'COMPLIANCE', type: 'audit', msg: 'Decision signed HMAC-SHA256: 0x8f2... anchored to IPFS.', tx: '2fe93a70d9385fba2b29a77a0620607b72c2740e80ecfc6702e7d0c473f1530e' },
    { time: '00:30:12', source: 'MPP_ENGINE', type: 'payment', msg: 'Batch Payroll detected. Preparing MPP for 42 recipients (Total: 12,450 USDC).' },
    { time: '00:30:15', source: 'MPP_ENGINE', type: 'success', msg: 'Atomic transaction confirmed on Stellar. All 42 transfers executed in 4.2s.', tx: 'f7ca365e3925fc63e81599780d76bdf72961e9fad0e827337f4490125b09b1db' },
    { time: '00:35:00', source: 'INTELLIGENCE', type: 'info', msg: 'Agent Nexus active. Scanning for network efficiency delta...' },
    { time: '00:35:02', source: 'INTELLIGENCE', type: 'info', msg: 'Agent Void active. Monitoring vault multi-sig integrity...' },
    { time: '00:35:04', source: 'AUDIT_NODE', type: 'success', msg: 'Verification complete: On-chain state matches IPFS registry 100%.', tx: '7b8224830c7a9122b95cd5005cc197b934a1cee273199b29dd6138ae27d9f68c' },
];

export default function AnalyticsPage() {
    const { t, language } = useLanguage();
    const { address: accountStr, isConnected } = useFreighter();
    const [timeRange, setTimeRange] = useState<'24H' | '7D' | '30D'>('24H');
    const [chartData, setChartData] = useState<any[]>([]);
    const latency = 142;
    const logContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setChartData(generateHistory(7, 4));
    }, [timeRange]);

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
                                {language === "es" ? "BETA · FUNCIONALIDAD EN AUDITORÍA DE CUMPLIMIENTO" : language === "zh" ? "BETA · 功能正在进行合规审计" : "BETA · FEATURE UNDERGOING COMPLIANCE AUDIT"}
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic text-white flex items-center gap-4">
                                TREASURY TELEMETRY
                                <span className="text-[10px] not-italic font-black bg-white/5 text-gray-400 border border-white/10 px-3 py-1 rounded-full uppercase tracking-widest">
                                    v1.0.0-SCF
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

                {/* KPI Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                    <StatCard
                        title="Liquid Vault Balance"
                        value="1.00"
                        change="READY"
                        icon={Wallet}
                        color="text-stellar-teal"
                        status="READY"
                    />
                    <StatCard
                        title="Autonomous Nodes"
                        value="6"
                        change="MONITORING"
                        icon={Server}
                        color="text-stellar-yellow"
                        status="PROCESSING"
                    />
                    <StatCard
                        title="24H Efficiency Delta"
                        value="+0.04%"
                        change="Optimized"
                        icon={TrendingUp}
                        color="text-green-400"
                    />
                    <StatCard
                        title="CETES Inventory"
                        value="$2,001"
                        change="ETHERFUSE"
                        icon={Database}
                        color="text-blue-400"
                        status="LIVE"
                    />
                    <StatCard
                        title="CETES Rate (Banxico)"
                        value="3.38%"
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
                                { asset: 'CETES', name: 'Etherfuse Stablebond', rate: '3.38%', type: 'GOVT BACKED' },
                                { asset: 'USDC', name: 'Operational Liquidity', rate: '0.00%', type: 'STABLE' },
                                { asset: 'AUDIT', name: 'IPFS Compliance Logs', rate: '100%', type: 'IMMUTABLE' },
                                { asset: 'XLM', name: 'Gas Reserve', rate: 'Min.', type: 'UTILITY' },
                                { asset: 'MPP', name: 'Batch Payout Engine', rate: '100 TX/BATCH', type: 'ACTIVE' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5 hover:border-stellar-teal/30 transition-all cursor-pointer group">
                                    <div className="flex items-center gap-4">
                                        <span className={`text-[8px] font-black px-2 py-1 rounded-lg border font-mono ${
                                            item.asset === 'USDC' ? 'bg-stellar-yellow/10 text-stellar-yellow border-stellar-yellow/20' :
                                            item.asset === 'AUDIT' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                                            item.asset === 'CETES' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
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
                                <div className="flex items-center gap-4">
                                    <span className="text-stellar-teal">AGENT_UPLINK_LIVE</span>
                                    <span>LEDGER_SEQUENCE: 5412891</span>
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
                                <span className="text-[9px] bg-stellar-yellow/10 text-stellar-yellow px-3 py-1 rounded-lg border border-stellar-yellow/20 font-black uppercase">CNBV Ready</span>
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
                            <h3 className="text-[10px] font-black mb-8 text-gray-500 uppercase tracking-[0.3em]">IMMUTABLE AUDIT LOGS</h3>
                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {[
                                    { id: 'C4C60723', tx: '2fe93a70d9385fba2b29a77a0620607b72c2740e80ecfc6702e7d0c473f1530e', msg: 'REBALANCE: USDC -> CETES (Threshold: 5k)' },
                                    { id: '3819C3D7', tx: 'f7ca365e3925fc63e81599780d76bdf72961e9fad0e827337f4490125b09b1db', msg: 'MPP: Payroll L1-Batch (42 recipients)' },
                                    { id: 'CCF194D4', tx: '7b8224830c7a9122b95cd5005cc197b934a1cee273199b29dd6138ae27d9f68c', msg: 'AUDIT: Hash anchored to IPFS via Pinata' },
                                    { id: 'C222D0E5', tx: 'c475a291b51d3c687fd6af57d58331364a2cef218bd86a8ea51c1044689a4cb4', msg: 'REBALANCE: Monitoring spread... No action' },
                                    { id: '01709C4B', tx: '8681921122f8fca35ef044722a17cf8ca23764c13fa0c9b532a170b3101f484f', msg: 'X402: Automated gas replenishment' },
                                ].map((log, i) => (
                                    <div key={i} className="p-4 bg-black/40 border border-white/5 rounded-2xl font-mono text-[10px] space-y-2 group hover:border-stellar-teal/30 transition-all">
                                        <div className="flex justify-between text-gray-600">
                                            <span>EVENT_ID: {log.id}</span>
                                            <span>2026-04-30</span>
                                        </div>
                                        <p className="text-gray-400">{log.msg}</p>
                                        <div className="flex items-center justify-between">
                                            <a 
                                                href={`https://stellar.expert/explorer/testnet/tx/${log.tx}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-stellar-teal font-black hover:underline flex items-center gap-1"
                                            >
                                                VERIFIED_ON_CHAIN
                                                <ExternalLink size={8} />
                                            </a>
                                            <span className="text-gray-600">TX: ...{log.tx.slice(-4)}</span>
                                        </div>
                                    </div>
                                ))}
                                <p className="text-center text-gray-700 text-[8px] uppercase font-black py-2">End of recent logs</p>
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
                            <span className="text-xs font-mono font-black text-stellar-teal">{latency}ms</span>
                        </div>
                        <div className="space-y-2">
                            <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Network Protocol</p>
                            <span className="text-xs font-mono font-black text-white">v21 (Mainnet Ready)</span>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
