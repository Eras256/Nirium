"use client";

import { useState, useEffect, useRef } from 'react';
import { Terminal, Maximize2, Minimize2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { writeLog } from '@/lib/logger';

export default function OpsConsole({ isExpanded, onToggleExpand, walletAddress }: { isExpanded: boolean, onToggleExpand: () => void, walletAddress?: string }) {
    const [logs, setLogs] = useState<any[]>([]);
    const [status, setStatus] = useState<'connecting' | 'online' | 'unavailable'>('connecting');
    const logsEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Guard: if Supabase is not configured, show graceful message
        if (!supabase) {
            setStatus('unavailable');
            return;
        }
        const db = supabase;

        // Initial fetch of recent logs from the unified protocol records table
        const fetchInitialLogs = async () => {
            try {
                let query = db
                    .from('nirium_protocol_records')
                    .select('*')
                    .eq('record_type', 'LOG')
                    .order('created_at', { ascending: false })
                    .limit(30);

                if (walletAddress) {
                    // Filter for logs relevant to this user or global logs
                    query = query.or(`tx_hash.eq.${walletAddress},owner_address.eq.UI_CLIENT`);
                }

                const { data, error } = await query;

                if (data && !error) {
                    // Map created_at to timestamp for UI compatibility
                    const mappedData = data.map((d: any) => ({
                        ...d,
                        timestamp: d.created_at
                    }));
                    setLogs(mappedData.reverse()); // oldest first
                }
            } catch (e) {
                console.error("Failed to fetch initial logs", e);
            }
        };
        fetchInitialLogs();

        // Realtime subscription for new logs in the protocol records table
        const channel = db
            .channel(`realtime-ops-console-${walletAddress || 'global'}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'nirium_protocol_records',
                    filter: 'record_type=eq.LOG'
                },
                (payload) => {
                    const newLog = payload.new as any;

                    // Client-side filtering check for relevance
                    const isRelevant = !walletAddress ||
                        newLog.tx_hash === walletAddress ||
                        newLog.owner_address === 'UI_CLIENT';

                    if (!isRelevant) return;

                    // Map created_at to timestamp
                    const logWithTimestamp = {
                        ...newLog,
                        timestamp: newLog.created_at
                    };

                    setLogs(prev => {
                        const exists = prev.some(l => l.id === payload.new.id);
                        if (exists) return prev;
                        return [...prev, logWithTimestamp].slice(-50);
                    });
                }
            )
            .subscribe((s) => {
                if (s === 'SUBSCRIBED') {
                    setStatus('online');
                    // Write a system log to indicate connection
                    writeLog('Neural Matrix Uplink Active — Monitoring Protocol Records', 'system', walletAddress);
                } else if (s === 'CLOSED' || s === 'CHANNEL_ERROR') {
                    setStatus('unavailable');
                }
            });

        return () => {
            db.removeChannel(channel);
        };
    }, [walletAddress]);

    // Auto-scroll to bottom when new logs arrive
    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
                    <span className="text-xs font-mono font-bold text-gray-300">OPS CONSOLE // LIVE FEED</span>
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
            <div className="flex-1 bg-black/50 p-4 font-mono text-[11px] overflow-y-auto custom-scrollbar">
                <div className="space-y-1">
                    {status === 'unavailable' && (
                        <div className="text-yellow-600 italic">
                            No database connection. Check Supabase configuration.
                        </div>
                    )}
                    {status === 'connecting' && logs.length === 0 && (
                        <div className="text-gray-600 italic">Connecting to Supabase Realtime...</div>
                    )}
                    {logs.map((log, i) => (
                        <div
                            key={log.id ? `${log.id}-${i}` : i}
                            className="break-all border-l-2 pl-2 py-0.5 hover:bg-white/5 transition-colors"
                            style={{
                                borderColor:
                                    log.level === 'error' ? '#ef4444' :
                                        log.level === 'success' ? '#4ade80' :
                                            log.level === 'system' ? '#06b6d4' :
                                                log.level === 'warn' ? '#f59e0b' :
                                                    '#3b82f6',
                            }}
                        >
                            <span className="text-gray-600 mr-2">
                                [{new Date(log.timestamp).toLocaleTimeString()}]
                            </span>
                            <span
                                className={`font-bold mr-2 ${log.level === 'error' ? 'text-red-500' :
                                    log.level === 'warn' ? 'text-yellow-500' :
                                        log.level === 'success' ? 'text-green-400' :
                                            log.level === 'system' ? 'text-stellar-teal' :
                                                'text-blue-400'
                                    }`}
                            >
                                {log.level?.toUpperCase()}
                            </span>
                            <span className="text-gray-300">{log.message}</span>
                        </div>
                    ))}
                    <div ref={logsEndRef} />
                </div>
            </div>
        </motion.div>
    );
}
