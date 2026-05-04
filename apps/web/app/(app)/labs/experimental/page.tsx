'use client';

import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { 
    FlaskConical, 
    Zap, 
    Activity, 
    AlertCircle, 
    ArrowLeft,
    Monitor,
    Database,
    Network,
    Terminal
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

const EXPERIMENTAL_AGENTS = [
    { name: 'Titan', role: 'Coordinator', color: '#FFD700' },
    { name: 'Eliza', role: 'Sentiment', color: '#2DEBE8' },
    { name: 'Maux', role: 'Liquidity', color: '#A78BFA' },
    { name: 'Chronos', role: 'Arbitrage', color: '#F97316' },
    { name: 'Astra', role: 'Explorer', color: '#34D399' },
    { name: 'Void', role: 'Strategy', color: '#6B7280' },
    { name: 'Nexus', role: 'Signals', color: '#EC4899' },
    { name: 'Gaia', role: 'Optimizer', color: '#10B981' },
    { name: 'Orion', role: 'Hunter', color: '#3B82F6' },
    { name: 'Sentinel', role: 'Auditor', color: '#EF4444' },
    { name: 'Core', role: 'Analyst', color: '#8B5CF6' },
    { name: 'Atlas', role: 'Support', color: '#F59E0B' },
    { name: 'Nova', role: 'Listings', color: '#60A5FA' },
    { name: 'Cyber', role: 'MCP Audit', color: '#2DEBE8' },
    { name: 'Nirium-1', role: 'Maintenance', color: '#FCD34D' },
    { name: 'Echo', role: 'Telemetry', color: '#6EE7B7' },
    { name: 'Pulse', role: 'Heartbeat', color: '#F472B6' },
    { name: 'Flux', role: 'Bridge', color: '#93C5FD' },
    { name: 'Vector', role: 'Routing', color: '#818CF8' },
    { name: 'Matrix', role: 'Neural', color: '#10B981' },
    { name: 'Zenith', role: 'High-Freq', color: '#F87171' },
    { name: 'Apex', role: 'Best-Ex', color: '#FB923C' },
    { name: 'Quantum', role: 'Compute', color: '#C084FC' },
    { name: 'Helix', role: 'DNA-Trade', color: '#4ADE80' },
    { name: 'Prism', role: 'Refraction', color: '#22D3EE' },
    { name: 'Omni', role: 'Universal', color: '#FBBF24' },
];

export default function ExperimentalLabs() {
    const { t } = useLanguage();
    const [spreads, setSpreads] = useState<Record<string, string>>({});

    useEffect(() => {
        const interval = setInterval(() => {
            const newSpreads: Record<string, string> = {};
            EXPERIMENTAL_AGENTS.forEach(agent => {
                newSpreads[agent.name] = (Math.random() * 0.5 + 0.1).toFixed(4) + '%';
            });
            setSpreads(newSpreads);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-12">
                    <Link 
                        href="/agents" 
                        className="inline-flex items-center gap-2 text-gray-500 hover:text-stellar-teal transition-colors mb-6 text-sm group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        BACK TO PRODUCTION INFRASTRUCTURE
                    </Link>
                    
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-purple-500/20 rounded-xl border border-purple-500/30">
                            <FlaskConical className="w-8 h-8 text-purple-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black tracking-tighter uppercase italic">
                                NIRIUM <span className="text-purple-400">LABS</span>
                            </h1>
                            <p className="text-gray-500 font-mono text-sm uppercase tracking-widest">
                                Experimental Swarm Research Node // v0.4.2 Legacy
                            </p>
                        </div>
                    </div>

                    <div className="bg-purple-900/10 border border-purple-500/20 p-4 rounded-xl max-w-3xl">
                        <div className="flex gap-3">
                            <AlertCircle className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                            <div className="text-sm text-gray-400 leading-relaxed">
                                <span className="font-bold text-purple-300 uppercase tracking-tight">Legacy Telemetry Disclaimer:</span> This page visualizes the historical "Swarm" architecture (26 experimental agents). These nodes are no longer part of the institutional production core but remain active for testnet spread-condition research and algorithmic stress testing. Use production-grade nodes for institutional treasury operations.
                            </div>
                        </div>
                    </div>
                </div>

                {/* Swarm Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                    {EXPERIMENTAL_AGENTS.map((agent, i) => (
                        <motion.div
                            key={agent.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.02 }}
                            className="bg-white/[0.03] border border-white/10 p-4 rounded-xl relative overflow-hidden group hover:border-purple-500/40 transition-colors"
                        >
                            <div 
                                className="absolute top-0 right-0 w-16 h-16 opacity-10 pointer-events-none transition-transform group-hover:scale-125"
                                style={{ background: `radial-gradient(circle at top right, ${agent.color}, transparent)` }}
                            />
                            
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-1.5 rounded-lg bg-black/40 border border-white/5">
                                    <Zap className="w-3 h-3" style={{ color: agent.color }} />
                                </div>
                                <div className="flex gap-1">
                                    <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                                    <div className="w-1 h-1 rounded-full bg-green-500/40" />
                                </div>
                            </div>

                            <div className="space-y-1 mb-4">
                                <h3 className="font-black text-sm uppercase tracking-tight">{agent.name}</h3>
                                <p className="text-[10px] text-gray-500 font-mono uppercase">{agent.role}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div className="bg-black/40 p-1.5 rounded border border-white/5">
                                    <span className="block text-[8px] text-gray-600 uppercase mb-0.5 font-bold">Spread</span>
                                    <span className="text-[10px] font-mono text-purple-400">{spreads[agent.name] || '0.0000%'}</span>
                                </div>
                                <div className="bg-black/40 p-1.5 rounded border border-white/5">
                                    <span className="block text-[8px] text-gray-600 uppercase mb-0.5 font-bold">Latency</span>
                                    <span className="text-[10px] font-mono text-gray-400">{Math.floor(Math.random() * 50 + 20)}ms</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Bottom Stats */}
                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-[#050505] border border-white/5 p-6 rounded-2xl flex items-center gap-4">
                        <Monitor className="w-10 h-10 text-gray-600" />
                        <div>
                            <div className="text-2xl font-black tracking-tighter">26 / 26</div>
                            <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">EXPERIMENTAL NODES ACTIVE</div>
                        </div>
                    </div>
                    <div className="bg-[#050505] border border-white/5 p-6 rounded-2xl flex items-center gap-4">
                        <Database className="w-10 h-10 text-gray-600" />
                        <div>
                            <div className="text-2xl font-black tracking-tighter">TESTNET-04</div>
                            <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">RESEARCH ENVIRONMENT</div>
                        </div>
                    </div>
                    <div className="bg-[#050505] border border-white/5 p-6 rounded-2xl flex items-center gap-4">
                        <Network className="w-10 h-10 text-gray-600" />
                        <div>
                            <div className="text-2xl font-black tracking-tighter">SWARM-A</div>
                            <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">DEPLOYMENT MESH</div>
                        </div>
                    </div>
                </div>
                
                {/* Visual Terminal */}
                <div className="mt-8 bg-black border border-white/10 rounded-xl overflow-hidden font-mono text-[10px]">
                    <div className="bg-white/5 px-4 py-2 flex items-center gap-2 border-b border-white/5">
                        <Terminal className="w-3 h-3 text-purple-400" />
                        <span className="text-gray-500 uppercase tracking-widest">LAB_UPLINK_FEED</span>
                    </div>
                    <div className="p-4 h-32 overflow-hidden text-gray-500 space-y-1">
                        <div>[LAB] Initializing experimental agent mesh...</div>
                        <div className="text-purple-500/70">[SWARM] Titan broadcasting spread conditions to 25 followers</div>
                        <div>[SCAN] Detecting SDEX liquidity depth for XLM/MXN corridor...</div>
                        <div>[WARN] Spread exceeded threshold on agent 'Void' (0.88%)</div>
                        <div className="text-green-500/50">[OK] Best-Ex path found via agent 'Astra'</div>
                        <div className="animate-pulse">_</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
