"use client";

import { useState, useEffect, useRef } from 'react';
import { Terminal, Maximize2, Minimize2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { writeLog } from '@/lib/logger';

export default function OpsConsole({ isExpanded, onToggleExpand, walletAddress }: { isExpanded: boolean, onToggleExpand: () => void, walletAddress?: string }) {
    const [logs, setLogs] = useState<any[]>([]);
    const [status, setStatus] = useState<'connecting' | 'online' | 'unavailable'>('connecting');
    const logContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // ... (existing Supabase logic remains same)
        // Guard: if Supabase is not configured, show graceful message
        if (!supabase) {
            setStatus('unavailable');
            return;
        }
        const db = supabase;

        // Initial fetch of recent logs from the swarm logs table
        const fetchInitialLogs = async () => {
            try {
                const { data, error } = await db
                    .from('logs')
                    .select('*')
                    .order('timestamp', { ascending: false })
                    .limit(50);

                if (data && !error) {
                    setLogs(data.reverse()); // oldest first
                    setStatus('online');
                }
            } catch (e) {
                console.error("Failed to fetch initial logs", e);
            }
        };
        fetchInitialLogs();

        // Realtime subscription for new logs in the swarm logs table
        const channel = db
            .channel(`realtime-ops-console-global`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'logs'
                },
                (payload) => {
                    const newLog = payload.new as any;
                    
                    // Fallback: if we are getting data, we are online
                    if (status !== 'online') setStatus('online');

                    setLogs(prev => {
                        const exists = prev.some(l => l.id === payload.new.id);
                        if (exists) return prev;
                        return [...prev, newLog].slice(-50);
                    });
                }
            )
            .subscribe((status, err) => {
                if (status === 'SUBSCRIBED') {
                    setStatus('online');
                } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
                    // Transient disconnects are normal — only warn, don't error
                    console.warn(`[Supabase Realtime] ${status} (will auto-reconnect)`);
                    // Keep 'online' status if we already loaded logs via REST
                    setLogs(prev => {
                        if (prev.length === 0) setStatus('unavailable');
                        return prev;
                    });
                }
            });

        return () => {
            console.log(`[Supabase Realtime] Cleaning up channel...`);
            db.removeChannel(channel);
        };
    }, []);

    // Secure scroll: only scroll the container, not the window
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
            {/* Header */}
            <div className="bg-white/5 border-b border-white/5 px-4 py-3 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-stellar-teal" />
                    <span className="text-xs font-mono font-bold text-gray-300 uppercase tracking-widest">Neural Feed // Uplink</span>
                    <span className={`flex items-center gap-1.5 ml-2 px-1.5 py-0.5 rounded ${s.bg} text-[10px] ${s.text} border`}>
                        <span className={`w-1 h-1 rounded-full ${s.dot} ${status === 'online' ? 'animate-pulse' : ''}`}></span>
                        {s.label}
                    </span>
                </div>
                <button
                    onClick={onToggleExpand}
                    className="text-gray-500 hover:text-white transition-colors"
                >
                    {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
            </div>

            {/* Logs Area */}
            <div 
                ref={logContainerRef}
                className="flex-1 bg-black/50 p-4 font-mono text-[10px] overflow-y-auto custom-scrollbar"
            >
                <div className="space-y-1.5">
                    {status === 'unavailable' && (
                        <div className="text-yellow-600 italic">
                            No database connection. Check Supabase configuration.
                        </div>
                    )}
                    {status === 'connecting' && logs.length === 0 && (
                        <div className="text-gray-600 italic">Establishing Neural Uplink...</div>
                    )}
                    {logs.map((log, i) => {
                        const parts = log.message.split('|');
                        const mainMsg = parts[0];
                        const hashPart = parts[1];

                        return (
                            <div key={i} className="break-all flex flex-wrap gap-x-1 items-start leading-relaxed">
                                <span className="text-gray-600">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
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
