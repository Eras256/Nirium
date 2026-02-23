"use client";

import { motion } from "framer-motion";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { Activity, TrendingUp, DollarSign, Zap, Server, Wallet, Database } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useFreighter } from "@/hooks/useFreighter";
import { useEffect, useState } from "react";

// ── Helpers ──────────────────────────────────────────────────────────────
type ChangeVariant = 'positive' | 'negative' | 'neutral' | 'status';

function changeColor(change: string): string {
    if (change.startsWith('+')) return 'text-green-400';
    if (change.startsWith('-')) return 'text-red-400';
    // status strings like READY / ENGAGED / STANDBY / LIVE
    if (['ENGAGED', 'LIVE', 'ACTIVE'].includes(change)) return 'text-stellar-teal';
    if (['STANDBY', 'IDLE'].includes(change)) return 'text-amber-400';
    return 'text-gray-400';
}

function changeIcon(change: string) {
    if (change.startsWith('+')) return <TrendingUp className="w-3 h-3" />;
    if (change.startsWith('-')) return <Activity className="w-3 h-3" />;
    return <Zap className="w-3 h-3" />;
}

// ── StatCard ──────────────────────────────────────────────────────────────
const StatCard = ({ title, value, change, icon: Icon, color }: any) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden group hover:border-white/20 transition-colors"
    >
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Icon className="w-24 h-24" style={{
                color: color === 'stellar-teal' ? '#2DEBE8' :
                    color === 'stellar-yellow' ? '#FFC800' :
                        color === 'amber-500' ? '#f59e0b' :
                            color === 'green-500' ? '#22c55e' :
                                color === 'blue-500' ? '#3b82f6' : '#ffffff'
            }} />
        </div>
        <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-white/10">
                <Icon className="w-5 h-5 text-white" />
            </div>
            <span className="text-gray-400 text-sm font-medium">{title}</span>
        </div>
        <div className="text-3xl font-bold text-white mb-1 font-mono">{value}</div>
        <div className={`text-xs font-mono flex items-center gap-1 ${changeColor(change)}`}>
            {changeIcon(change)}
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
    const { address: accountStr, isConnected } = useFreighter();
    const account = isConnected ? { address: accountStr, chains: ['stellar:testnet'] } : null;
    const [activeStrategies, setActiveStrategies] = useState<any[]>([]);
    const [blendData, setBlendData] = useState<any>(null);
    const [timeRange, setTimeRange] = useState<TimeRange>('24H');
    const [chartData, setChartData] = useState<any[]>([]);

    // Get XLM Balance
    const balanceData = { totalBalance: "1000000000" };

    const userBalance = balanceData ? parseInt(balanceData.totalBalance) / 1_000_000_000 : 0;

    // Rebuild chart whenever timeRange or balance changes
    useEffect(() => {
        const cfg: Record<TimeRange, { points: number; hoursBack: number }> = {
            '24H': { points: 7, hoursBack: 4 },
            '7D': { points: 7, hoursBack: 24 },
            '30D': { points: 10, hoursBack: 72 },
        };
        const { points, hoursBack } = cfg[timeRange];
        setChartData(generateHistory(points, hoursBack, userBalance));
    }, [timeRange, userBalance]);

    // Load strategies & Blend data
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

    // Derived metrics
    const dailyYield = userBalance * ((blendData?.supplyApy || 12) / 100 / 365);
    const tvl = activeStrategies.length * 500 + userBalance;
    const xlmStrategies = activeStrategies.filter(s => !s.asset || s.asset === 'XLM').length;
    const usdcStrategies = activeStrategies.filter(s => s.asset === 'USDC').length;

    return (
        <main className="min-h-screen pt-36 px-4 pb-12 relative overflow-hidden flex flex-col">
            <Navbar />

            {/* Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] right-[-20%] w-[800px] h-[800px] bg-stellar-yellow/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-20%] left-[-20%] w-[600px] h-[600px] bg-stellar-teal/5 rounded-full blur-[120px]"></div>
            </div>

            <div className="max-w-[1600px] w-full mx-auto relative z-10 flex-1">
                {/* Header */}
                <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-4xl font-bold text-white tracking-tight">INTELLIGENCE OPS</h1>
                            <span className="px-2 py-0.5 bg-stellar-teal/10 text-stellar-teal text-[10px] font-mono rounded border border-stellar-teal/20">
                                v0.0.7
                            </span>
                        </div>
                        <p className="text-gray-400 font-mono text-sm">
                            Real-time surveillance of on-chain liquidity vectors{" "}
                            {account && account.address
                                ? `// TARGET: ${account.address.slice(0, 6)}...${account.address.slice(-4)}`
                                : '// GUEST MODE'}
                        </p>
                    </div>

                    {/* Asset breakdown pill */}
                    <div className="flex items-center gap-3 flex-wrap">
                        {activeStrategies.length > 0 && (
                            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-mono">
                                <span className="bg-blue-500/20 text-[#4ca2ff] px-2 py-0.5 rounded font-bold">{xlmStrategies} XLM</span>
                                <span className="bg-stellar-yellow/20 text-stellar-yellow px-2 py-0.5 rounded font-bold">{usdcStrategies} USDC</span>
                                <span className="text-gray-500">VAULTS</span>
                            </div>
                        )}
                        {!account && (
                            <div className="px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 rounded-lg text-xs font-mono animate-pulse">
                                [!] ENCRYPTED FEED - CONNECT WALLET
                            </div>
                        )}
                    </div>
                </header>

                {/* KPI Grid — 5 cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
                    <StatCard
                        title="Wallet Balance"
                        value={userBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        change="READY"
                        icon={Wallet}
                        color="stellar-teal"
                    />
                    <StatCard
                        title="Active Agents"
                        value={activeStrategies.length}
                        change={activeStrategies.length > 0 ? "ENGAGED" : "STANDBY"}
                        icon={Server}
                        color="amber-500"
                    />
                    <StatCard
                        title="Alpha Capture (24h)"
                        value={`+${dailyYield.toFixed(3)}`}
                        change={`+$${(dailyYield * 3.42).toFixed(2)} USD`}
                        icon={TrendingUp}
                        color="green-500"
                    />
                    <StatCard
                        title="TVL Managed"
                        value={`$${tvl.toFixed(0)}`}
                        change={tvl > 0 ? `LIVE` : "STANDBY"}
                        icon={Database}
                        color="blue-500"
                    />
                    <StatCard
                        title="Benchmark Rate (XLM)"
                        value={`${blendData?.supplyApy.toFixed(2) || '0.00'}%`}
                        change="+0.45% (24h)"
                        icon={Activity}
                        color="stellar-yellow"
                    />
                </div>

                {/* Charts Area */}
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Main Chart */}
                    <div className="lg:col-span-2 glass-panel border border-white/10 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold flex items-center gap-2 tracking-tight">
                                PERFORMANCE VECTOR
                                <span className="text-xs font-normal text-gray-500 bg-white/5 px-2 py-0.5 rounded font-mono">[PROJECTION]</span>
                            </h3>
                            <div className="flex gap-1.5">
                                {(['24H', '7D', '30D'] as TimeRange[]).map(r => (
                                    <button
                                        key={r}
                                        onClick={() => setTimeRange(r)}
                                        className={`px-3 py-1 text-xs rounded-full font-mono transition-all ${timeRange === r
                                            ? 'bg-stellar-teal text-black font-bold'
                                            : 'bg-white/10 text-white hover:bg-white/20'
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
                                            <stop offset="5%" stopColor="#2DEBE8" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#2DEBE8" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis dataKey="name" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                        itemStyle={{ color: '#2DEBE8' }}
                                    />
                                    <Area type="monotone" dataKey="value" stroke="#2DEBE8" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Side Stats */}
                    <div className="space-y-6">
                        <div className="glass-panel border border-white/10 rounded-2xl p-6">
                            <h3 className="text-lg font-bold mb-4 text-gray-200 tracking-tight">TARGET ACQUISITION RADAR</h3>
                            <div className="space-y-3">
                                {[
                                    { name: "Blend XLM Supply", vol: "STABLE", apy: `${(blendData?.supplyApy || 11).toFixed(2)}%`, asset: 'XLM' },
                                    { name: "Blend USDC Lending", vol: "STABLE", apy: "9.40%", asset: 'USDC' },
                                    { name: "Soroswap XLM/USDC", vol: "VOLATILE", apy: "45.2%", asset: 'XLM' },
                                    { name: "SDEX Orderbook", vol: "LOW RISK", apy: "8.5%", asset: 'XLM' },
                                    { name: "Neural Archive Log", vol: "LIVE", apy: "100%", asset: 'LOG' },
                                ].map((pool, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5 hover:border-stellar-teal/30 transition-colors cursor-pointer group">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono ${pool.asset === 'USDC' ? 'bg-stellar-yellow/20 text-stellar-yellow' :
                                                pool.asset === 'LOG' ? 'bg-pink-500/20 text-pink-400' :
                                                    'bg-blue-500/20 text-[#4ca2ff]'
                                                }`}>{pool.asset}</span>
                                            <span className="font-mono text-sm text-gray-300 group-hover:text-white transition-colors">{pool.name}</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs text-green-400 font-bold font-mono">{pool.apy}</div>
                                            <div className="text-[10px] text-gray-500 font-mono">{pool.vol}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="glass-panel border border-stellar-yellow/30 rounded-2xl p-6 relative overflow-hidden">
                            <div className="relative z-10">
                                <h3 className="text-lg font-bold mb-2 text-white tracking-tight">ATOMIC INTEGRITY</h3>
                                <div className="text-4xl font-bold text-white mb-1 font-mono">100%</div>
                                <div className="text-sm text-gray-300 mb-3 font-mono">ZERO_SLIPPAGE_ACTIVE</div>
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="text-[10px] bg-blue-500/20 text-[#4ca2ff] px-2 py-0.5 rounded font-mono font-bold">XLM</span>
                                    <span className="text-[10px] bg-stellar-yellow/20 text-stellar-yellow px-2 py-0.5 rounded font-mono font-bold">USDC</span>
                                    <span className="text-[10px] text-gray-500 font-mono">VAULT TYPES ACTIVE</span>
                                </div>
                                <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                                    <div className="h-full bg-stellar-yellow w-full rounded-full shadow-[0_0_10px_#FFC800]" />
                                </div>
                                <div className="mt-3 text-[10px] font-mono text-gray-500 flex items-center gap-1">
                                    <span className="text-pink-400">◉</span> Neural Archive log: ARMED
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </main>
    );
}
