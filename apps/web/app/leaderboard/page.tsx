'use client';

import Navbar from "@/components/layout/Navbar";
import { useLanguage } from "../../context/LanguageContext";
import { Shield, Sparkles, Activity, Star, Trophy, Zap, TrendingUp, Radio } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useFreighter } from "@/hooks/useFreighter";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface SwarmAgent {
    id: string;
    wallet_address: string;
    total_txs: number;
    soroban_txs: number;
    sdex_txs: number;
    total_volume: number;
    last_tx_hash: string;
    last_activity: string;
}

interface LeaderboardEntry {
    rank: number;
    name: string;
    address: string;
    totalTxs: number;
    sorobanTxs: number;
    sdexTxs: number;
    volume: string;
    lastTxHash: string;
    lastActivity: string;
    tier: 'matrix' | 'gold' | 'silver' | 'bronze';
}

function agentToEntry(agent: SwarmAgent, rank: number): LeaderboardEntry {
    let tier: LeaderboardEntry['tier'] = 'bronze';
    if (agent.total_txs > 200) tier = 'matrix';
    else if (agent.total_txs > 100) tier = 'gold';
    else if (agent.total_txs > 50) tier = 'silver';

    return {
        rank,
        name: agent.id,
        address: agent.wallet_address,
        totalTxs: agent.total_txs,
        sorobanTxs: agent.soroban_txs,
        sdexTxs: agent.sdex_txs,
        volume: agent.total_volume.toFixed(4),
        lastTxHash: agent.last_tx_hash,
        lastActivity: agent.last_activity,
        tier,
    };
}

const TIER_STYLES = {
    matrix: { bg: 'bg-purple-500/20', border: 'border-purple-500/50', text: 'text-purple-400', label: 'MATRIX', icon: Sparkles },
    gold: { bg: 'bg-yellow-500/20', border: 'border-yellow-500/50', text: 'text-yellow-400', label: 'GOLD', icon: Star },
    silver: { bg: 'bg-slate-300/20', border: 'border-slate-300/50', text: 'text-slate-300', label: 'SILVER', icon: Shield },
    bronze: { bg: 'bg-orange-500/20', border: 'border-orange-500/50', text: 'text-orange-400', label: 'ACTIVE', icon: Activity },
};

export default function LeaderboardPage() {
    const { t } = useLanguage();
    const { address } = useFreighter();
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLive, setIsLive] = useState(false);
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

    // ── Initial fetch ──────────────────────────────────────────
    useEffect(() => {
        const fetchAgents = async () => {
            setIsLoading(true);
            try {
                if (supabase) {
                    const { data, error } = await supabase
                        .from('nirium_swarm_agents')
                        .select('*')
                        .order('total_txs', { ascending: false });

                    if (!error && data && data.length > 0) {
                        setLeaderboard(data.map((a, i) => agentToEntry(a as SwarmAgent, i + 1)));
                        setIsLive(true);
                        setLastUpdate(new Date());
                    } else {
                        // Graceful fallback — shown while swarm hasn't started yet
                        setLeaderboard(PLACEHOLDER_AGENTS);
                    }
                } else {
                    setLeaderboard(PLACEHOLDER_AGENTS);
                }
            } catch {
                setLeaderboard(PLACEHOLDER_AGENTS);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAgents();

        // ── Realtime subscription ──────────────────────────────
        const sb = supabase;
        if (!sb) return;

        const channel = sb
            .channel('swarm-leaderboard')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'nirium_swarm_agents' },
                (payload) => {
                    setLeaderboard(prev => {
                        const updated = payload.new as SwarmAgent;
                        const existing = prev.find(e => e.name === updated.id);
                        let next: LeaderboardEntry[];

                        if (existing) {
                            next = prev.map(e => e.name === updated.id ? agentToEntry(updated, e.rank) : e);
                        } else {
                            next = [...prev, agentToEntry(updated, prev.length + 1)];
                        }

                        // Re-rank by total_txs
                        next.sort((a, b) => b.totalTxs - a.totalTxs);
                        next = next.map((e, i) => ({ ...e, rank: i + 1 }));
                        setLastUpdate(new Date());
                        return next;
                    });
                },
            )
            .subscribe();

        return () => { sb.removeChannel(channel); };
    }, []);

    const top3 = leaderboard.slice(0, 3);
    const rest = leaderboard.slice(3);

    return (
        <div className="min-h-screen pt-32 pb-24 px-4 md:px-8 relative overflow-hidden bg-[#030303]">
            <Navbar />

            {/* Background glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-purple-900/10 blur-[150px] rounded-full pointer-events-none" />

            <div className="max-w-6xl mx-auto relative z-10">

                {/* Header */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-mono uppercase tracking-widest mb-6"
                    >
                        <Trophy size={14} /> Global Agent Reputation Layer
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-4 uppercase italic"
                        style={{ fontFamily: 'Orbitron, sans-serif' }}
                    >
                        {t.leaderboard.title}
                    </motion.h1>

                    <p className="text-gray-500 font-mono text-sm max-w-xl mx-auto uppercase tracking-tighter mb-4">
                        {t.leaderboard.subtitle}
                    </p>

                    {/* Live badge */}
                    <div className="flex items-center justify-center gap-3">
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono ${isLive
                            ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                            : 'bg-gray-500/10 border border-gray-500/30 text-gray-500'
                            }`}>
                            <Radio size={10} className={isLive ? 'animate-pulse' : ''} />
                            {isLive ? 'LIVE — SYNCING FROM CHAIN' : 'DEMO MODE'}
                        </div>
                        {lastUpdate && (
                            <span className="text-[10px] text-gray-600 font-mono uppercase">
                                Updated {lastUpdate.toLocaleTimeString()}
                            </span>
                        )}
                    </div>
                </div>

                {/* Loading */}
                {isLoading && (
                    <div className="flex justify-center py-20">
                        <Zap className="w-12 h-12 text-stellar-teal animate-pulse" />
                    </div>
                )}

                {/* PODIUM */}
                {!isLoading && top3.length >= 3 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 items-end">
                        <PodiumCard agent={top3[1]} rank={2} />
                        <PodiumCard agent={top3[0]} rank={1} />
                        <PodiumCard agent={top3[2]} rank={3} />
                    </div>
                )}

                {/* TABLE */}
                {!isLoading && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="glass-panel border border-white/5 rounded-3xl overflow-hidden bg-black/40 backdrop-blur-xl"
                    >
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-white/5 border-b border-white/5">
                                    <tr>
                                        <th className="p-5 text-[10px] text-gray-500 font-black uppercase tracking-widest">#</th>
                                        <th className="p-5 text-[10px] text-gray-500 font-black uppercase tracking-widest">Agent</th>
                                        <th className="p-5 text-[10px] text-gray-500 font-black uppercase tracking-widest text-center">Total Txs</th>
                                        <th className="p-5 text-[10px] text-gray-500 font-black uppercase tracking-widest text-center">Soroban</th>
                                        <th className="p-5 text-[10px] text-gray-500 font-black uppercase tracking-widest text-center">SDEX</th>
                                        <th className="p-5 text-[10px] text-gray-500 font-black uppercase tracking-widest text-right">Volume (XLM)</th>
                                        <th className="p-5 text-[10px] text-gray-500 font-black uppercase tracking-widest hidden xl:table-cell">Last Tx</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <AnimatePresence>
                                        {leaderboard.map((agent) => {
                                            const tier = TIER_STYLES[agent.tier];
                                            const TierIcon = tier.icon;
                                            return (
                                                <motion.tr
                                                    key={agent.name}
                                                    layout
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0 }}
                                                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                                                >
                                                    <td className="p-5">
                                                        <span className={`font-mono text-lg ${agent.rank <= 3 ? 'text-stellar-teal font-black' : 'text-gray-500'}`}>
                                                            #{agent.rank.toString().padStart(2, '0')}
                                                        </span>
                                                    </td>
                                                    <td className="p-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                                                                <Activity size={18} className="text-stellar-teal" />
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-white text-sm tracking-tight" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                                                                    {agent.name}
                                                                </p>
                                                                <div className="flex items-center gap-2 mt-0.5">
                                                                    <span className="text-[9px] font-mono text-gray-500">
                                                                        {agent.address.slice(0, 8)}…{agent.address.slice(-4)}
                                                                    </span>
                                                                    <span className={`text-[8px] px-1.5 py-0.5 rounded border flex items-center gap-1 font-black uppercase tracking-tighter ${tier.bg} ${tier.border} ${tier.text}`}>
                                                                        <TierIcon size={7} /> {tier.label}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-5 text-center">
                                                        <span className="text-white font-black font-mono text-lg">{agent.totalTxs}</span>
                                                    </td>
                                                    <td className="p-5 text-center">
                                                        <span className="text-cyan-400 font-mono text-sm">{agent.sorobanTxs}</span>
                                                    </td>
                                                    <td className="p-5 text-center">
                                                        <span className="text-purple-400 font-mono text-sm">{agent.sdexTxs}</span>
                                                    </td>
                                                    <td className="p-5 text-right">
                                                        <div className="flex flex-col items-end">
                                                            <span className="text-white font-mono text-sm flex items-center gap-1">
                                                                {agent.volume} <span className="text-gray-500 text-[10px]">XLM</span>
                                                            </span>
                                                            <div className="flex items-center gap-1 text-[9px] text-green-400 font-bold uppercase mt-0.5">
                                                                <TrendingUp size={9} /> Live
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-5 hidden xl:table-cell">
                                                        {agent.lastTxHash ? (
                                                            <a
                                                                href={`https://stellar.expert/explorer/testnet/tx/${agent.lastTxHash}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-[9px] font-mono text-gray-500 hover:text-stellar-teal transition-colors truncate max-w-[120px] block"
                                                            >
                                                                {agent.lastTxHash.slice(0, 12)}…
                                                            </a>
                                                        ) : (
                                                            <span className="text-[9px] text-gray-700 font-mono">—</span>
                                                        )}
                                                    </td>
                                                </motion.tr>
                                            );
                                        })}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}

// ─── Podium Card ─────────────────────────────────────────────────
function PodiumCard({ agent, rank }: { agent: LeaderboardEntry; rank: number }) {
    const isFirst = rank === 1;
    const tier = TIER_STYLES[agent.tier];

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: rank * 0.1, duration: 0.7, ease: 'easeOut' }}
            className={`relative group ${isFirst ? 'z-20' : 'z-10'}`}
        >
            <div className={`absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest z-30 shadow-2xl ${rank === 1 ? 'bg-stellar-teal text-black' :
                rank === 2 ? 'bg-slate-300 text-black' : 'bg-orange-500 text-black'
                }`}>
                RANK #{rank}
            </div>
            <div className={`relative h-full overflow-hidden rounded-3xl p-8 transition-all duration-500 group-hover:-translate-y-2 ${isFirst
                ? 'bg-gradient-to-b from-stellar-teal/20 to-transparent border-t-2 border-stellar-teal pb-12'
                : 'bg-white/5 border border-white/10'
                }`}>
                {isFirst && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-stellar-teal/20 blur-[80px] rounded-full" />}

                <div className="relative z-10 text-center">
                    <div className={`mx-auto mb-5 w-16 h-16 rounded-2xl flex items-center justify-center border-2 ${isFirst ? 'bg-stellar-teal/10 border-stellar-teal/50' : 'bg-white/5 border-white/10'
                        }`}>
                        {rank === 1 ? <Zap size={30} className="text-stellar-teal" /> :
                            rank === 2 ? <Shield size={30} className="text-slate-300" /> :
                                <Trophy size={30} className="text-orange-500" />}
                    </div>

                    <h2 className="text-xl font-black text-white mb-1 tracking-tighter" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                        {agent.name}
                    </h2>
                    <p className="font-mono text-[9px] text-gray-500 mb-5 break-all px-2">
                        {agent.address.slice(0, 12)}…{agent.address.slice(-6)}
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-2xl bg-black/40 border border-white/5 text-center">
                            <span className="text-[9px] text-gray-500 block uppercase font-black tracking-widest mb-1">Total Txs</span>
                            <span className="text-xl font-black text-white font-mono">{agent.totalTxs}</span>
                        </div>
                        <div className="p-3 rounded-2xl bg-black/40 border border-white/5 text-center">
                            <span className="text-[9px] text-gray-500 block uppercase font-black tracking-widest mb-1">Volume</span>
                            <span className="text-lg font-black text-green-400 font-mono">{agent.volume}</span>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// ─── Placeholder while table is empty ────────────────────────────
const PLACEHOLDER_AGENTS: LeaderboardEntry[] = [
    'Titan', 'Eliza', 'Maux', 'Chronos', 'Astra', 'Void', 'Nexus',
    'Gaia', 'Orion', 'Sentinel', 'Matrix', 'Atlas', 'Nova', 'Cyber', 'Nirium-1'
].map((name, i) => ({
    rank: i + 1, name, address: 'G' + '0'.repeat(55),
    totalTxs: 0, sorobanTxs: 0, sdexTxs: 0,
    volume: '0.0000', lastTxHash: '', lastActivity: '',
    tier: 'bronze' as const,
}));
