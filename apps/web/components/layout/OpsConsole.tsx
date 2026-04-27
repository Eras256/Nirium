"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Terminal, Maximize2, Minimize2, Brain, CreditCard, Activity, Shield, Cpu, Database, Zap, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';

const DEMO_LOGS = [
    { agent_id: 'Matrix', message: 'Neural Matrix Uplink established. Swarm broadcasting on-chain...', level: 'system', created_at: new Date().toISOString() },
    { agent_id: 'Titan', message: 'Vault architecture synchronized — 3 asset classes active', level: 'info', created_at: new Date().toISOString() },
    { agent_id: 'Astra', message: 'DeFindex USDC yield route optimized — APY 14.2%', level: 'success', created_at: new Date().toISOString() },
];

function formatTime(ts: string) {
    const d = new Date(ts);
    return `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}:${d.getSeconds().toString().padStart(2,'0')}`;
}

export default function OpsConsole({ isExpanded, onToggleExpand, walletAddress, heightClass }: { isExpanded: boolean, onToggleExpand: () => void, walletAddress?: string, heightClass?: string }) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    
    const [logs, setLogs] = useState<any[]>(DEMO_LOGS);
    const [status, setStatus] = useState<'connecting' | 'online' | 'unavailable'>('connecting');
    const logContainerRef = useRef<HTMLDivElement>(null);
    const lastIdRef = useRef<string | null>(null);

    const fetchLogs = useCallback(async () => {
        try {
            const res = await fetch('/api/logs');
            if (!res.ok) {
                setStatus('unavailable');
                return;
            }
            const rows: any[] = await res.json();
            setStatus('online');
            
            if (rows) {
                const newestId = rows[0]?.id;
                if (newestId !== lastIdRef.current) {
                    lastIdRef.current = newestId;
                    setLogs(rows.length > 0 ? rows.reverse() : []);
                } else if (rows.length === 0 && logs.length !== 0) {
                    setLogs([]);
                }
            }
        } catch (e) {
            console.warn('[Neural Feed] Fetch error:', e);
            setStatus('unavailable');
        }
    }, [logs.length]);

    useEffect(() => {
        fetchLogs();
        const poll = setInterval(fetchLogs, 4000);
        return () => clearInterval(poll);
    }, [fetchLogs]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setStatus(prev => prev === 'connecting' ? 'unavailable' : prev);
        }, 8000);
        return () => clearTimeout(timeout);
    }, []);

    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [logs]);

    const statusColors = {
        connecting: { dot: 'bg-yellow-400', text: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20', label: 'CONNECTING' },
        online: { dot: 'bg-green-400', text: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20', label: 'ONLINE' },
        unavailable: { dot: 'bg-gray-500', text: 'text-gray-400', bg: 'bg-gray-500/10 border-gray-500/20', label: 'UNAVAILABLE' },
    };
    const s = statusColors[status];

    const { t } = useLanguage();
    
    return (
        <motion.div
            layout
            className={`bg-[#050505] border border-white/10 rounded-xl overflow-hidden flex flex-col transition-all duration-300 ${isExpanded ? 'fixed inset-4 z-[100] h-auto shadow-2xl' : (heightClass || 'h-full')}`}
        >
            <div className="bg-white/5 border-b border-white/5 px-4 py-3 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-stellar-teal" />
                    <span className="text-xs font-mono font-bold text-gray-300 uppercase tracking-widest">{t.dashboard.neural_feed.uplink}</span>
                    <span className={`flex items-center gap-1.5 ml-2 px-1.5 py-0.5 rounded ${s.bg} text-[10px] ${s.text} border`}>
                        <span className={`w-1 h-1 rounded-full ${s.dot} ${status === 'online' ? 'animate-pulse' : ''}`}></span>
                        {s.label}
                    </span>
                </div>
                <button onClick={onToggleExpand} className="text-gray-500 hover:text-white transition-colors">
                    {isExpanded ? <Maximize2 size={16} /> : <Maximize2 size={16} />}
                </button>
            </div>

            <div ref={logContainerRef} className="flex-1 bg-black/50 p-4 font-mono text-[10px] overflow-y-auto custom-scrollbar">
                <div className="space-y-1.5">
                    {status === 'unavailable' && (
                        <div className="text-yellow-600 italic">No database connection.</div>
                    )}
                    <AnimatePresence mode="popLayout">
                    {logs.map((log, i) => {
                        const rawMsg = (log.message || '');
                        const parts = rawMsg.split('|');
                        // Strip any inline "IPFS: ..." fragments from the visible message (coming soon)
                        const mainMsg = (parts[0] || '').replace(/IPFS:\s*\S+/gi, '').replace(/\s{2,}/g, ' ').trim();
                        const isIpfsHash = (s?: string) => !!s && /IPFS:|^bafy|^Qm/i.test(s.trim());
                        const hashPart = !isIpfsHash(parts[1]) ? parts[1] : undefined;

                        // Detect agent type for branding
                        const isIntelligence = log.agent_id === 'INTELLIGENCE';
                        const isSettlement = log.agent_id === 'x402' || log.agent_id === 'MPP' || log.agent_id === 'SETTLEMENT' || log.source === 'horizon';
                        const isX402 = log.agent_id === 'x402';
                        const isMPP = log.agent_id === 'MPP';
                        const isSystem = log.level === 'system' || log.agent_id === 'Matrix';
                        const isPayment = log.agent_id?.includes('GATEWAY') || log.level === 'payment';
                        
                        return (
                            <motion.div 
                                initial={{ opacity: 0, x: -10 }} 
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                key={log.id || i} 
                                className={`group relative flex flex-col gap-1.5 py-2 px-3 rounded-lg border-l-2 mb-1 transition-all ${
                                    isSettlement ? 'bg-stellar-teal/5 border-stellar-teal/30 hover:bg-stellar-teal/10' :
                                    isIntelligence ? 'bg-pink-500/5 border-pink-500/30 hover:bg-pink-500/10' :
                                    'bg-white/[0.02] border-white/10 hover:bg-white/[0.04]'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[8px] text-gray-500 font-mono">
                                            [{mounted ? formatTime(log.created_at || log.timestamp) : '--:--:--'}]
                                        </span>
                                        
                                        <div className="flex items-center gap-1.5">
                                            {isIntelligence && <Brain className="w-3 h-3 text-pink-400" />}
                                            {(isSettlement || isX402) && <Zap className="w-3 h-3 text-stellar-yellow" />}
                                            {isMPP && <Shield className="w-3 h-3 text-purple-400" />}
                                            {isSystem && <Cpu className="w-3 h-3 text-stellar-teal" />}
                                            {isPayment && <CreditCard className="w-3 h-3 text-blue-400" />}
                                            
                                            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter ${
                                                isIntelligence ? 'bg-pink-500/20 text-pink-400' :
                                                isSettlement ? 'bg-stellar-yellow/20 text-stellar-yellow' :
                                                'bg-white/10 text-gray-400'
                                            }`}>
                                                {log.agent_id}
                                            </span>
                                        </div>
                                    </div>

                                    <span className={`${
                                        log.level === 'error' ? 'text-red-500' :
                                        log.level === 'warn' ? 'text-yellow-500' :
                                        log.level === 'success' ? 'text-green-400' :
                                        log.level === 'system' ? 'text-stellar-teal' :
                                        'text-blue-400/50'
                                    } font-mono text-[8px] tracking-widest uppercase`}>
                                        {log.level}
                                    </span>
                                </div>

                                <div className="pl-1">
                                    <span className={`leading-relaxed text-[10px] ${
                                        isSettlement ? 'text-stellar-teal font-medium' : 'text-gray-300'
                                    }`}>
                                        {mainMsg.replace(/Soroban Intelligence: /i, '')}
                                    </span>
                                    
                                    <div className="mt-1 flex flex-wrap gap-2">
                                        {(hashPart || log.tx_hash) && (
                                            <a 
                                                href={`https://stellar.expert/explorer/testnet/tx/${(hashPart || log.tx_hash || '').trim().replace(/^tx=/, '')}`}
                                                target="_blank"
                                                className="flex items-center gap-1.5 px-2 py-0.5 bg-black/40 border border-white/5 rounded hover:border-stellar-yellow/50 transition-colors"
                                            >
                                                <Activity className="w-2.5 h-2.5 text-stellar-yellow/50" />
                                                <span className="text-stellar-yellow/80 font-mono text-[8px] truncate max-w-[100px]">
                                                    {(hashPart || log.tx_hash || '').trim().replace(/^tx=/, '')}
                                                </span>
                                                <ExternalLink size={8} className="text-white/20" />
                                            </a>
                                        )}
                                        
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
}
