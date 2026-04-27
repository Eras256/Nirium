"use client";

import { motion } from "framer-motion";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { Activity, TrendingUp, Zap, Server, Wallet, Database, ShieldCheck } from "lucide-react";
import { SectionBrandLogo } from "@/components/ui/SectionBrandLogo";
import Navbar from "@/components/layout/Navbar";
import { useFreighter } from "@/hooks/useFreighter";
import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

// ── Helpers ──────────────────────────────────────────────────────────────
function changeColor(change: string, t: any): string {
    if (change.startsWith('+')) return 'text-emerald-400';
    if (change.startsWith('-')) return 'text-rose-400';
    
    const status = t.analytics.stats.status;
    if ([status.ready, status.running, status.live].includes(change)) return 'text-stellar-teal';
    if ([status.standby, status.idle].includes(change)) return 'text-amber-400';
    
    return 'text-gray-500';
}

function changeIcon(change: string) {
    if (change.startsWith('+')) return <TrendingUp className="w-3 h-3" />;
    if (change.startsWith('-')) return <Activity className="w-3 h-3" />;
    return <Zap className="w-3 h-3" />;
}

// ── StatCard ──────────────────────────────────────────────────────────────
const StatCard = ({ title, value, change, icon: Icon, color, t }: any) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#121212] border border-white/5 rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-8 relative overflow-hidden group hover:border-stellar-teal/20 transition-all duration-500 shadow-2xl"
    >
        <div className="absolute -top-12 -right-12 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Icon className="w-32 h-32" style={{
                color: color === 'stellar-teal' ? '#2DEBE8' :
                    color === 'stellar-yellow' ? '#FFC800' :
                        color === 'amber-500' ? '#f59e0b' :
                            color === 'green-500' ? '#22c55e' :
                                color === 'blue-500' ? '#3b82f6' : '#ffffff'
            }} />
        </div>
        <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 group-hover:text-white transition-colors">
                <Icon className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{title}</span>
        </div>
        <div className="text-3xl sm:text-4xl font-black text-white mb-2 font-mono italic tracking-tighter relative z-10">{value}</div>
        <div className={`text-[10px] font-black font-mono flex items-center gap-2 uppercase tracking-widest relative z-10 ${changeColor(change, t)}`}>
            <div className="p-1 rounded-full bg-current opacity-10 animate-pulse" />
            {change}
        </div>
    </motion.div>
);

// ── generate chart points ─────────────────────────────────────────────────
function generateHistory(points: number, hoursBack: number, baseBalance: number) {
    const now = new Date();
    return Array.from({ length: points }).map((_, i) => {
        const time = new Date(now.getTime() - (points - 1 - i) * hoursBack * 60 * 60 * 1000);
        const label = hoursBack < 24
            ? time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : time.toLocaleDateString([], { month: 'short', day: 'numeric' });
        const base = baseBalance > 0 ? baseBalance : 1000;
        return {
            name: label,
            value: parseFloat((base * (1 + i * 0.0008 + Math.random() * 0.001)).toFixed(2)),
            apy: parseFloat((10 + Math.random() * 2).toFixed(2))
        };
    });
}

// ── Page ──────────────────────────────────────────────────────────────────
type TimeRange = '24H' | '7D' | '30D';

export default function AnalyticsPage() {
    const { t } = useLanguage();
    const { address: accountStr, isConnected } = useFreighter();
    const account = isConnected ? { address: accountStr, chains: ['stellar:testnet'] } : null;
    const [activeStrategies, setActiveStrategies] = useState<any[]>([]);
    const [blendData, setBlendData] = useState<any>(null);
    const [timeRange, setTimeRange] = useState<TimeRange>('24H');
    const [chartData, setChartData] = useState<any[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const balanceData = { totalBalance: "1000000000" };
    const userBalance = balanceData ? parseInt(balanceData.totalBalance) / 1_000_000_000 : 0;

    useEffect(() => {
        const cfg: Record<TimeRange, { points: number; hoursBack: number }> = {
            '24H': { points: 7, hoursBack: 4 },
            '7D': { points: 7, hoursBack: 24 },
            '30D': { points: 10, hoursBack: 72 },
        };
        const { points, hoursBack } = cfg[timeRange];
        setChartData(generateHistory(points, hoursBack, userBalance));
    }, [timeRange, userBalance]);

    useEffect(() => {
        if (account?.address) {
            const saved = localStorage.getItem(`nirium-fleet-${account.address}`);
            if (saved) {
                const parsed = JSON.parse(saved);
                setActiveStrategies(parsed.filter((s: any) => s.status !== 'DRAFT'));
            }
        } else {
            setActiveStrategies([]);
        }

        const mockDiff = (Math.random() * 0.5).toFixed(2);
        setBlendData({ supplyApy: 11.45 + Number(mockDiff), borrowApy: 8.2 });
    }, [account?.address]);

    if (!mounted) return null;

    const dailyYield = userBalance * ((blendData?.supplyApy || 12) / 100 / 365);
    const tvl = activeStrategies.length * 500 + userBalance;
    const xlmStrategies = activeStrategies.filter(s => !s.asset || s.asset === 'XLM').length;
    const usdcStrategies = activeStrategies.filter(s => s.asset === 'USDC').length;

    const OPPORTUNITIES = [
        { name: t.analytics.opportunities.items.blend_xlm, vol: t.analytics.opportunities.types.stable, apy: `${(blendData?.supplyApy || 11).toFixed(2)}%`, asset: 'XLM' },
        { name: t.analytics.opportunities.items.blend_usdc, vol: t.analytics.opportunities.types.stable, apy: "9.40%", asset: 'USDC' },
        { name: t.analytics.opportunities.items.soroswap, vol: t.analytics.opportunities.types.volatile, apy: "45.2%", asset: 'XLM' },
        { name: t.analytics.opportunities.items.sdex, vol: t.analytics.opportunities.types.low_risk, apy: "8.5%", asset: 'XLM' },
        { name: t.analytics.opportunities.items.neural_log, vol: t.analytics.opportunities.types.live, apy: "100%", asset: 'LOG' },
    ];

    return (
        <main className="min-h-screen pt-32 sm:pt-40 md:pt-48 lg:pt-56 px-4 pb-12 relative overflow-hidden flex flex-col bg-[#080808]">
            <Navbar />

            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] right-[-20%] w-[800px] h-[800px] bg-stellar-yellow/5 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-20%] left-[-20%] w-[600px] h-[600px] bg-stellar-teal/5 rounded-full blur-[120px]"></div>
            </div>

            <div className="max-w-[1600px] w-full mx-auto relative z-10 flex-1 px-4 lg:px-12">
                {/* Header */}
                <header className="mb-16 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-12">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <SectionBrandLogo className="!justify-start mb-0" size="w-32 md:w-44" />
                        <div className="h-16 w-px bg-white/10 hidden md:block" />
                        <div>
                            <div className="flex items-center gap-4 mb-2">
                                <h1 className="text-3xl sm:text-5xl md:text-7xl font-black text-white tracking-tighter uppercase italic leading-none">
                                    {t.analytics.header.title_pre} <span className="text-stellar-teal">{t.analytics.header.title_span}</span>
                                </h1>
                                <span className="px-3 py-1 bg-stellar-teal/10 text-stellar-teal text-[10px] font-black rounded-lg border border-stellar-teal/20 animate-pulse uppercase tracking-widest">
                                    v0.5.0
                                </span>
                            </div>
                            <p className="text-gray-500 font-mono text-[10px] uppercase tracking-[0.3em] font-black">
                                {t.analytics.header.subtitle} //{" "}
                                {account && account.address
                                    ? `${t.analytics.header.wallet_prefix}: ${account.address.slice(0, 8)}...${account.address.slice(-4)}`
                                    : t.analytics.header.guest_view}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 flex-wrap">
                        {activeStrategies.length > 0 && (
                            <div className="flex items-center gap-3 px-6 py-3 bg-[#121212] border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">
                                <span className="text-blue-400 bg-blue-500/10 px-2 py-1 rounded-lg border border-blue-500/20">{xlmStrategies} XLM</span>
                                <span className="text-stellar-yellow bg-stellar-yellow/10 px-2 py-1 rounded-lg border border-stellar-yellow/20">{usdcStrategies} USDC</span>
                                <span className="text-gray-600">VAULTS</span>
                            </div>
                        )}
                        {!account && (
                            <div className="px-6 py-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl text-[10px] font-black uppercase tracking-widest animate-pulse shadow-xl">
                                {t.analytics.header.connect_prompt}
                            </div>
                        )}
                    </div>
                </header>

                {/* KPI Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-12">
                    <StatCard
                        title={t.analytics.stats.wallet_balance}
                        value={userBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        change={t.analytics.stats.status.ready}
                        icon={Wallet}
                        color="stellar-teal"
                        t={t}
                    />
                    <StatCard
                        title={t.analytics.stats.active_helpers}
                        value={activeStrategies.length}
                        change={activeStrategies.length > 0 ? t.analytics.stats.status.running : t.analytics.stats.status.standby}
                        icon={Server}
                        color="amber-500"
                        t={t}
                    />
                    <StatCard
                        title={t.analytics.stats.earned_today}
                        value={`+${dailyYield.toFixed(3)}`}
                        change={`+$${(dailyYield * 3.42).toFixed(2)} USD`}
                        icon={TrendingUp}
                        color="green-500"
                        t={t}
                    />
                    <StatCard
                        title={t.analytics.stats.money_at_work}
                        value={`$${tvl.toFixed(0)}`}
                        change={tvl > 0 ? t.analytics.stats.status.live : t.analytics.stats.status.standby}
                        icon={Database}
                        color="blue-500"
                        t={t}
                    />
                    <StatCard
                        title={t.analytics.stats.current_rate}
                        value={`${blendData?.supplyApy.toFixed(2) || '0.00'}%`}
                        change="+0.45% (24h)"
                        icon={Activity}
                        color="stellar-yellow"
                        t={t}
                    />
                </div>

                {/* Charts & Side Area */}
                <div className="grid xl:grid-cols-3 gap-8 mb-20">
                    <div className="xl:col-span-2 bg-[#121212] border border-white/5 rounded-[1.5rem] sm:rounded-[2.5rem] p-6 sm:p-10 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-stellar-teal opacity-5 rounded-full blur-[100px] pointer-events-none" />
                        
                        <div className="flex items-center justify-between mb-12 flex-wrap gap-6">
                            <h3 className="text-2xl font-black flex items-center gap-3 tracking-tighter uppercase italic">
                                {t.analytics.chart.title}
                                <span className="text-[10px] font-black text-gray-500 bg-white/5 px-3 py-1 rounded-lg border border-white/5 font-mono not-italic uppercase tracking-widest">
                                    {t.analytics.chart.projected}
                                </span>
                            </h3>
                            <div className="flex p-1 bg-black/40 rounded-2xl border border-white/5 overflow-x-auto scrollbar-none">
                                {(['day', 'week', 'month'] as const).map(r => (
                                    <button
                                        key={r}
                                        onClick={() => setTimeRange(r === 'day' ? '24H' : r === 'week' ? '7D' : '30D')}
                                        className={`px-4 sm:px-5 py-2 text-[9px] sm:text-[10px] rounded-xl font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                                            (timeRange === '24H' && r === 'day') || (timeRange === '7D' && r === 'week') || (timeRange === '30D' && r === 'month')
                                            ? 'bg-white text-black shadow-lg'
                                            : 'text-gray-500 hover:text-white'
                                        }`}
                                    >
                                        {t.analytics.chart.ranges[r]}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="h-[300px] sm:h-[400px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2DEBE8" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#2DEBE8" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                                    <XAxis dataKey="name" stroke="#333" fontSize={10} tickLine={false} axisLine={false} tick={{ fontWeight: 800, fontFamily: 'monospace' }} />
                                    <YAxis stroke="#333" fontSize={10} tickLine={false} axisLine={false} domain={['auto', 'auto']} tick={{ fontWeight: 800, fontFamily: 'monospace' }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#080808', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '12px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}
                                        itemStyle={{ color: '#2DEBE8', fontWeight: 900, textTransform: 'uppercase', fontSize: '12px' }}
                                        labelStyle={{ color: '#666', fontWeight: 800, fontSize: '10px', marginBottom: '4px' }}
                                    />
                                    <Area type="monotone" dataKey="value" stroke="#2DEBE8" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="bg-[#121212] border border-white/5 rounded-[1.5rem] sm:rounded-[2.5rem] p-6 sm:p-10 shadow-2xl">
                            <h3 className="text-[10px] font-black mb-8 text-gray-500 uppercase tracking-[0.3em]">{t.analytics.opportunities.title}</h3>
                            <div className="space-y-4">
                                {OPPORTUNITIES.map((pool, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5 hover:border-stellar-teal/30 hover:bg-black/60 transition-all cursor-pointer group">
                                        <div className="flex items-center gap-4">
                                            <span className={`text-[8px] font-black px-2 py-1 rounded-lg border font-mono uppercase tracking-widest ${
                                                pool.asset === 'USDC' ? 'bg-stellar-yellow/10 text-stellar-yellow border-stellar-yellow/20' :
                                                pool.asset === 'LOG' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                                                'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                            }`}>{pool.asset}</span>
                                            <span className="font-black text-xs text-gray-400 group-hover:text-white transition-colors uppercase italic tracking-tighter">{pool.name}</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm text-emerald-400 font-black font-mono">{pool.apy}</div>
                                            <div className="text-[9px] text-gray-600 font-black uppercase tracking-widest">{pool.vol}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-stellar-teal/5 border border-stellar-teal/20 rounded-[1.5rem] sm:rounded-[2.5rem] p-6 sm:p-10 relative overflow-hidden shadow-2xl group">
                            <div className="absolute -bottom-12 -right-12 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <ShieldCheck className="w-48 h-48 text-stellar-teal" />
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-[10px] font-black mb-6 text-stellar-teal uppercase tracking-[0.3em]">{t.analytics.safety.title}</h3>
                                <div className="text-4xl sm:text-6xl font-black text-white mb-2 font-mono italic tracking-tighter">100%</div>
                                <div className="text-[10px] text-gray-400 mb-8 font-black uppercase tracking-widest">{t.analytics.safety.subtitle}</div>
                                <div className="flex items-center gap-3 mb-8">
                                    <span className="text-[9px] bg-blue-500/10 text-blue-400 px-2 py-1 rounded-lg border border-blue-500/20 font-black uppercase tracking-widest font-mono italic">XLM</span>
                                    <span className="text-[9px] bg-stellar-yellow/10 text-stellar-yellow px-2 py-1 rounded-lg border border-stellar-yellow/20 font-black uppercase tracking-widest font-mono italic">USDC</span>
                                    <span className="text-[9px] text-gray-600 font-black uppercase tracking-widest">{t.analytics.safety.wallets_ready}</span>
                                </div>
                                <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden border border-white/5">
                                    <div className="h-full bg-gradient-to-r from-stellar-teal to-blue-500 w-full rounded-full shadow-[0_0_20px_rgba(45,235,232,0.3)] transition-all duration-1000" />
                                </div>
                                <div className="mt-6 flex flex-col gap-2">
                                    <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                        {t.analytics.safety.record_status}
                                    </div>
                                    <div className="text-[8px] font-mono text-stellar-teal/50 uppercase tracking-widest flex items-center gap-1.5 border-t border-white/5 pt-2 mt-1">
                                        <ShieldCheck size={10} />
                                        Aligned with Stellar Code of Conduct
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </main>
    );
}
