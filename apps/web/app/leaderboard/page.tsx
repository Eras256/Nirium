'use client';

import Navbar from "@/components/layout/Navbar";
import { useLanguage } from "../../context/LanguageContext";
import { Shield, Sparkles, Activity, Star, UserPlus, Trophy, Zap, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { useEloReputation } from "@/hooks/useNiriumContracts";
import { useFreighter } from "@/hooks/useFreighter";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export default function LeaderboardPage() {
    const { t } = useLanguage();
    const { address, isConnected } = useFreighter();
    const elo = useEloReputation();
    const [userProfile, setUserProfile] = useState<any>(null);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // 1. Fetch ELO data if connected
                if (address) {
                    const profile = await elo.getProfile(address);
                    setUserProfile(profile);
                }

                // 2. Fetch real strategies from Supabase
                if (supabase) {
                    const { data, error } = await supabase
                        .from('nirium_protocol_records')
                        .select('*')
                        .eq('record_type', 'STRATEGY')
                        .order('apy', { ascending: false });

                    if (!error && data && data.length > 0) {
                        const mapped = data.map((item: any, index: number) => ({
                            rank: index + 1,
                            name: item.name || "UNNAMED_KERNEL",
                            address: item.owner_address,
                            elo: Math.floor((item.apy || 0) * 10) + 1200,
                            winRate: item.yield_text || `${item.apy || 0}%`,
                            volume: item.tvl > 1000 ? `${(item.tvl / 1000).toFixed(1)}K` : (item.tvl || 0).toString(),
                            tier: (item.apy || 0) > 50 ? 'matrix' : (item.apy || 0) > 20 ? 'gold' : 'silver'
                        }));
                        setLeaderboard(mapped);
                    } else {
                        // Use higher-quality mock data if database is empty
                        setLeaderboard([
                            { rank: 1, name: "Matrix Core", address: "GBAA...R52X", elo: 2450, winRate: "92.4%", volume: "1.2M", tier: "matrix" },
                            { rank: 2, name: "Alpha Arbitrage", address: "GBCC...TQ6Y", elo: 2210, winRate: "88.1%", volume: "840K", tier: "matrix" },
                            { rank: 3, name: "Yield Hunter", address: "GBDD...L91Z", elo: 2150, winRate: "85.2%", volume: "620K", tier: "matrix" },
                            { rank: 4, name: "Stable Sentinel", address: "GBEE...P42W", elo: 1950, winRate: "78.4%", volume: "410K", tier: "gold" },
                            { rank: 5, name: "Blend Sniper", address: "GBFF...K88V", elo: 1820, winRate: "72.0%", volume: "250K", tier: "gold" }
                        ]);
                    }
                }
            } catch (err) {
                console.error("Leaderboard fetch error:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [address]);

    const handleRegister = async () => {
        if (!address) return;
        const result = await elo.registerSentinel(address);
        if (result.success) {
            toast.success("Sentinel registered successfully!");
            const profile = await elo.getProfile(address);
            setUserProfile(profile);
        } else {
            toast.error(result.error || "Registration failed");
        }
    };

    const getTierBadgeProps = (tier: string) => {
        switch (tier) {
            case 'matrix': return { bg: "bg-purple-500/20", border: "border-purple-500/50", text: "text-purple-400", label: t.leaderboard.tiers.matrix, icon: Sparkles };
            case 'gold': return { bg: "bg-yellow-500/20", border: "border-yellow-500/50", text: "text-yellow-500", label: t.leaderboard.tiers.gold, icon: Star };
            case 'silver': return { bg: "bg-slate-300/20", border: "border-slate-300/50", text: "text-slate-300", label: t.leaderboard.tiers.silver, icon: Shield };
            default: return { bg: "bg-white/5", border: "border-white/10", text: "text-gray-400", label: "Unranked", icon: Activity };
        }
    };

    return (
        <div className="min-h-screen pt-32 pb-24 px-4 md:px-8 relative overflow-hidden bg-[#030303]">
            <Navbar />

            {/* Background elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-purple-900/10 blur-[150px] rounded-full pointer-events-none"></div>

            <div className="max-w-6xl mx-auto relative z-10">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-mono uppercase tracking-widest mb-6"
                    >
                        <Trophy size={14} /> Global Reputation Layer
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-4 uppercase italic"
                        style={{ fontFamily: 'Orbitron, sans-serif' }}
                    >
                        {t.leaderboard.title}
                    </motion.h1>
                    <p className="text-gray-500 font-mono text-sm max-w-xl mx-auto uppercase tracking-tighter">
                        {t.leaderboard.subtitle}
                    </p>
                </div>

                {/* PODIUM SECTION */}
                {!isLoading && leaderboard.length >= 3 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 items-end">
                        {/* Rank 2 */}
                        <PodiumCard sentinel={leaderboard[1]} rank={2} t={t} delay={0.2} getTierBadgeProps={getTierBadgeProps} />
                        {/* Rank 1 */}
                        <PodiumCard sentinel={leaderboard[0]} rank={1} t={t} delay={0} getTierBadgeProps={getTierBadgeProps} />
                        {/* Rank 3 */}
                        <PodiumCard sentinel={leaderboard[2]} rank={3} t={t} delay={0.4} getTierBadgeProps={getTierBadgeProps} />
                    </div>
                )}

                {isLoading && (
                    <div className="flex justify-center py-20">
                        <Zap className="w-12 h-12 text-stellar-teal animate-pulse" />
                    </div>
                )}

                {/* Registration Call for Connected Users */}
                {isConnected && !userProfile && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-12 p-8 glass-panel border border-stellar-teal/30 bg-stellar-teal/5 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6"
                    >
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-2xl bg-stellar-teal/20 flex items-center justify-center text-stellar-teal shadow-[0_0_20px_rgba(45,235,232,0.2)]">
                                <Shield size={32} />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-xl uppercase tracking-tighter" style={{ fontFamily: 'Orbitron, sans-serif' }}>Neural Identity Required</h3>
                                <p className="text-gray-400 text-sm font-mono uppercase">Register your sentinel to join the sovereign reputation matrix.</p>
                            </div>
                        </div>
                        <button
                            onClick={handleRegister}
                            className="px-8 py-4 bg-stellar-teal text-black font-black uppercase text-sm rounded-2xl hover:bg-[#1de2df] transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(45,235,232,0.3)] flex items-center gap-2"
                        >
                            <UserPlus size={18} />
                            Register Now
                        </button>
                    </motion.div>
                )}

                {/* TABLE SECTION */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="glass-panel border border-white/5 rounded-3xl overflow-hidden bg-black/40 backdrop-blur-xl"
                >
                    <div className="overflow-x-auto scrollbar-hide">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 border-b border-white/5">
                                <tr>
                                    <th className="p-6 text-[10px] text-gray-500 font-black uppercase tracking-widest">{t.leaderboard.columns.rank}</th>
                                    <th className="p-6 text-[10px] text-gray-500 font-black uppercase tracking-widest">{t.leaderboard.columns.sentinel}</th>
                                    <th className="p-6 text-[10px] text-gray-500 font-black uppercase tracking-widest">{t.leaderboard.columns.winRate}</th>
                                    <th className="p-6 text-[10px] text-gray-500 font-black uppercase tracking-widest text-right">{t.leaderboard.columns.elo}</th>
                                    <th className="p-6 text-[10px] text-gray-500 font-black uppercase tracking-widest text-right hidden lg:table-cell">{t.leaderboard.columns.volume}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaderboard.map((item, index) => {
                                    const tierData = getTierBadgeProps(item.tier);
                                    const TierIcon = tierData.icon;

                                    return (
                                        <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                            <td className="p-6">
                                                <span className={`font-mono text-lg ${item.rank <= 3 ? 'text-stellar-teal font-black' : 'text-gray-500'}`}>
                                                    #{item.rank.toString().padStart(2, '0')}
                                                </span>
                                            </td>
                                            <td className="p-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 flex items-center justify-center text-gray-400 group-hover:bg-white/20 transition-all">
                                                        <Activity size={20} />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-white text-base tracking-tight" style={{ fontFamily: 'Orbitron, sans-serif' }}>{item.name}</span>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-[10px] font-mono text-gray-500 break-all max-w-[150px] sm:max-w-none">
                                                                {item.address}
                                                            </span>
                                                            <span className={`text-[8px] px-1.5 py-0.5 rounded border flex items-center gap-1 ${tierData.bg} ${tierData.border} ${tierData.text} uppercase font-black tracking-tighter`}>
                                                                <TierIcon size={8} />
                                                                {tierData.label}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <div className="flex flex-col gap-1.5 w-full max-w-[120px]">
                                                    <div className="flex justify-between items-center text-[10px] font-mono">
                                                        <span className="text-gray-500 uppercase">WIN RATE</span>
                                                        <span className="text-green-400 font-bold">{item.winRate}</span>
                                                    </div>
                                                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                                        <div className="h-full bg-green-500" style={{ width: item.winRate }}></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6 text-right">
                                                <div className="flex flex-col items-end">
                                                    <span className="text-2xl font-black text-white tracking-tighter font-mono" style={{ fontFamily: 'Orbitron, sans-serif' }}>{item.elo}</span>
                                                    <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest">ELO SCORE</span>
                                                </div>
                                            </td>
                                            <td className="p-6 text-right hidden lg:table-cell">
                                                <div className="flex flex-col items-end">
                                                    <span className="text-sm font-mono text-white flex items-center gap-1">
                                                        {item.volume} <span className="text-gray-500">USDC</span>
                                                    </span>
                                                    <div className="flex items-center gap-1 text-[9px] text-green-400 font-bold uppercase mt-1">
                                                        <TrendingUp size={10} /> Live Capturing
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

function PodiumCard({ sentinel, rank, t, delay, getTierBadgeProps }: any) {
    const isFirst = rank === 1;
    const tierData = getTierBadgeProps(sentinel.tier);

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.8, ease: "easeOut" }}
            className={`relative group ${isFirst ? 'z-20' : 'z-10'}`}
        >
            {/* Rank Indicator */}
            <div className={`absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest z-30 shadow-2xl ${rank === 1 ? 'bg-stellar-teal text-black shadow-stellar-teal/50' :
                rank === 2 ? 'bg-slate-300 text-black shadow-slate-300/30' :
                    'bg-orange-500 text-black shadow-orange-500/30'
                }`}>
                RANK #{rank}
            </div>

            <div className={`
                relative h-full overflow-hidden rounded-3xl p-8 transition-all duration-500
                ${isFirst ? 'bg-gradient-to-b from-stellar-teal/20 to-transparent border-t-2 border-stellar-teal pb-12' : 'bg-white/5 border border-white/10'}
                group-hover:translate-y-[-8px] group-hover:bg-white/10
            `}>
                {/* Glow Effect */}
                {isFirst && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-stellar-teal/20 blur-[80px] rounded-full"></div>}

                <div className="relative z-10 text-center">
                    <div className={`mx-auto mb-6 w-20 h-20 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 ${isFirst ? 'bg-stellar-teal/10 border-stellar-teal/50 rotate-3 group-hover:rotate-6' : 'bg-white/5 border-white/10 group-hover:rotate-1'
                        }`}>
                        {rank === 1 ? <Zap size={36} className="text-stellar-teal" /> :
                            rank === 2 ? <Shield size={36} className="text-slate-300" /> :
                                <Trophy size={36} className="text-orange-500" />}
                    </div>

                    <h2 className="text-2xl font-black text-white mb-1 tracking-tighter truncate" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                        {sentinel.name}
                    </h2>

                    {/* Full Address visibility */}
                    <div className="font-mono text-[10px] text-gray-500 uppercase mb-6 break-all px-2 overflow-hidden h-8">
                        {sentinel.address}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 rounded-2xl bg-black/40 border border-white/5 text-center">
                            <span className="text-[10px] text-gray-500 block uppercase font-black tracking-widest mb-1">ELO</span>
                            <span className="text-xl font-black text-white font-mono">{sentinel.elo}</span>
                        </div>
                        <div className="p-3 rounded-2xl bg-black/40 border border-white/5 text-center">
                            <span className="text-[10px] text-gray-500 block uppercase font-black tracking-widest mb-1">YIELD</span>
                            <span className="text-xl font-black text-green-400 font-mono">{sentinel.winRate}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Background platform line */}
            {isFirst && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-stellar-teal/50 to-transparent shadow-[0_0_15px_rgba(45,235,232,0.5)]"></div>}
        </motion.div>
    );
}
