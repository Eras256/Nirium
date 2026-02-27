'use client';

import Navbar from "@/components/layout/Navbar";
import { useLanguage } from "../../context/LanguageContext";
import { Shield, Sparkles, Activity, Star } from "lucide-react";
import { motion } from "framer-motion";

export default function LeaderboardPage() {
    const { t } = useLanguage();

    // Mock data for top Sentinels/Creators
    const leaderboard = [
        { rank: 1, name: "Matrix Core", elo: 2450, winRate: "92.4%", volume: "1.2M", tier: "matrix" },
        { rank: 2, name: "Alpha Arbitrage", elo: 2210, winRate: "88.1%", volume: "840K", tier: "matrix" },
        { rank: 3, name: "Yield Hunter", elo: 2150, winRate: "85.2%", volume: "620K", tier: "matrix" },
        { rank: 4, name: "Stable Sentinel", elo: 1950, winRate: "78.4%", volume: "410K", tier: "gold" },
        { rank: 5, name: "Blend Sniper", elo: 1820, winRate: "72.0%", volume: "250K", tier: "gold" },
        { rank: 6, name: "Cross-Chain Bot", elo: 1540, winRate: "68.5%", volume: "105K", tier: "silver" },
        { rank: 7, name: "SDEX Sweeper", elo: 1490, winRate: "64.1%", volume: "90K", tier: "silver" }
    ];

    const getTierBadgeProps = (tier: string) => {
        switch (tier) {
            case 'matrix': return { bg: "bg-purple-500/20", border: "border-purple-500/50", text: "text-purple-400", label: t.leaderboard.tiers.matrix, icon: Sparkles };
            case 'gold': return { bg: "bg-yellow-500/20", border: "border-yellow-500/50", text: "text-yellow-500", label: t.leaderboard.tiers.gold, icon: Star };
            case 'silver': return { bg: "bg-slate-300/20", border: "border-slate-300/50", text: "text-slate-300", label: t.leaderboard.tiers.silver, icon: Shield };
            default: return { bg: "bg-white/5", border: "border-white/10", text: "text-gray-400", label: "Unranked", icon: Activity };
        }
    };

    return (
        <div className="min-h-screen pt-32 pb-12 px-4 md:px-8 relative overflow-hidden bg-[#050505]">
            <Navbar />

            <div className="max-w-5xl mx-auto relative z-10">
                <div className="text-center mb-12">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4 uppercase"
                    >
                        {t.leaderboard.title}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-gray-400 max-w-2xl mx-auto font-mono text-sm uppercase tracking-widest"
                    >
                        {t.leaderboard.subtitle}
                    </motion.p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-panel border border-white/10 rounded-2xl overflow-hidden"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-black/40 border-b border-white/5">
                                <tr>
                                    <th className="p-4 text-xs text-gray-500 font-bold uppercase tracking-wider">{t.leaderboard.columns.rank}</th>
                                    <th className="p-4 text-xs text-gray-500 font-bold uppercase tracking-wider">{t.leaderboard.columns.sentinel}</th>
                                    <th className="p-4 text-xs text-gray-500 font-bold uppercase tracking-wider">{t.leaderboard.columns.winRate}</th>
                                    <th className="p-4 text-xs text-gray-500 font-bold uppercase tracking-wider text-right">{t.leaderboard.columns.elo}</th>
                                    <th className="p-4 text-xs text-gray-500 font-bold uppercase tracking-wider text-right hidden md:table-cell">{t.leaderboard.columns.volume}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaderboard.map((item, index) => {
                                    const tierData = getTierBadgeProps(item.tier);
                                    const TierIcon = tierData.icon;

                                    return (
                                        <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                            <td className="p-4">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${item.rank <= 3 ? 'bg-stellar-teal/20 text-stellar-teal border border-stellar-teal/30 shadow-[0_0_15px_rgba(0,243,255,0.2)]' : 'bg-white/5 text-gray-400'}`}>
                                                    {item.rank}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-white text-lg tracking-tight">{item.name}</span>
                                                    <div className="flex items-center gap-1.5 mt-1">
                                                        <span className={`text-[10px] px-2 py-0.5 rounded-sm border flex items-center gap-1 ${tierData.bg} ${tierData.border} ${tierData.text} uppercase font-bold tracking-wider`}>
                                                            <TierIcon size={10} />
                                                            {tierData.label}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-white font-mono font-bold">{item.winRate}</span>
                                                    <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden hidden sm:block">
                                                        <div className="h-full bg-stellar-teal rounded-full" style={{ width: item.winRate }}></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-right">
                                                <span className="text-2xl font-black text-white tracking-tighter">{item.elo}</span>
                                                <span className="text-[10px] text-gray-500 block uppercase font-mono">ELO</span>
                                            </td>
                                            <td className="p-4 text-right hidden md:table-cell">
                                                <span className="text-sm font-mono text-gray-400 block">{item.volume}</span>
                                                <span className="text-[10px] text-gray-500 uppercase">USDC</span>
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
