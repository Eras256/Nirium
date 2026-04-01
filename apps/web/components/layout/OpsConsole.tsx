"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Terminal, Maximize2, Minimize2 } from 'lucide-react';
import { motion } from 'framer-motion';

const DEMO_LOGS = [
    { agent_id: 'Matrix', message: 'Neural Matrix Uplink established. Swarm broadcasting on-chain...', level: 'system', timestamp: new Date().toISOString() },
    { agent_id: 'Titan', message: 'Vault architecture synchronized — 3 asset classes active', level: 'info', timestamp: new Date().toISOString() },
    { agent_id: 'Astra', message: 'DeFindex USDC yield route optimized — APY 14.2%', level: 'success', timestamp: new Date().toISOString() },
    { agent_id: 'Nexus', message: 'Inter-agent signal relay: 30 agents online, consensus reached', level: 'system', timestamp: new Date().toISOString() },
];

function formatTime(ts: string) {
    const d = new Date(ts);
    return `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}:${d.getSeconds().toString().padStart(2,'0')}`;
}

export default function OpsConsole({ isExpanded, onToggleExpand, walletAddress }: { isExpanded: boolean, onToggleExpand: () => void, walletAddress?: string }) {
    const [logs, setLogs] = useState<any[]>(DEMO_LOGS);
    const [status, setStatus] = useState<'connecting' | 'online' | 'unavailable'>('connecting');
    const logContainerRef = useRef<HTMLDivElement>(null);
    const lastIdRef = useRef<string | null>(null);

    const fetchLogs = useCallback(async () => {
        try {
            const res = await fetch('/api/logs');
            if (!res.ok) return;
            const rows: any[] = await res.json();
            if (rows && rows.length > 0) {
                const newestId = rows[0]?.id;
                if (newestId !== lastIdRef.current) {
                    lastIdRef.current = newestId;
                    setLogs(rows.reverse());
                    setStatus('online');
                }
            }
        } catch (e) {
            console.warn('[Neural Feed] Fetch error:', e);
        }
    }, []);

    useEffect(() => {
        fetchLogs();
        const poll = setInterval(fetchLogs, 3000);
        return () => clearInterval(poll);
    }, [fetchLogs]);

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

    return (
        <motion.div
            layout
            className={`bg-[#050505] border border-white/10 rounded-xl overflow-hidden flex flex-col transition-all duration-300 ${isExpanded ? 'fixed inset-4 z-[100] h-auto shadow-2xl' : 'h-[300px]'}`}
        >
            <div className="bg-white/5 border-b border-white/5 px-4 py-3 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-stellar-teal" />
                    <span className="text-xs font-mono font-bold text-gray-300 uppercase tracking-widest">Neural Feed // Uplink</span>
                    <span className={`flex items-center gap-1.5 ml-2 px-1.5 py-0.5 rounded ${s.bg} text-[10px] ${s.text} border`}>
                        <span className={`w-1 h-1 rounded-full ${s.dot} ${status === 'online' ? 'animate-pulse' : ''}`}></span>
                        {s.label}
                    </span>
                </div>
                <button onClick={onToggleExpand} className="text-gray-500 hover:text-white transition-colors">
                    {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
            </div>

            <div ref={logContainerRef} className="flex-1 bg-black/50 p-4 font-mono text-[10px] overflow-y-auto custom-scrollbar">
                <div className="space-y-1.5">
                    {status === 'unavailable' && (
                        <div className="text-yellow-600 italic">No database connection.</div>
                    )}
                    {logs.map((log, i) => {
                        const parts = (log.message || '').split('|');
                        const mainMsg = parts[0];
                        const hashPart = parts[1];
                        return (
                            <div key={log.id || i} className="break-all flex flex-wrap gap-x-1 items-start leading-relaxed">
                                <span className="text-gray-600">[{formatTime(log.timestamp)}]</span>
                                <span className={`${log.level === 'error' ? 'text-red-500' :
                                    log.level === 'warn' ? 'text-yellow-500' :
                                        log.level === 'success' ? 'text-green-400' :
                                            log.level === 'system' ? 'text-stellar-teal' :
                                                'text-blue-400'
                                    } font-bold min-w-[50px]`}>
                                    {log.level?.toUpperCase()}
                                </span>
                                <span className="text-gray-300">
                                    {log.agent_id && <span className="text-stellar-teal/80 font-bold mr-1">[{log.agent_id}]</span>}
                                    {mainMsg}
                                </span>
                                {hashPart && (
                                    <span className="text-stellar-yellow/80 font-bold bg-white/5 px-1 rounded text-[9px] h-fit mt-0.5">
                                        {hashPart.trim()}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
}
