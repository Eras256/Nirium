'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ExternalLink, Search, RefreshCw, FileCheck, Clock, Hash, ChevronDown, ChevronUp } from 'lucide-react';

interface AuditEntry {
    id: string;
    cid: string;
    gateway_url: string;
    log_count: number;
    created_at: string;
    agent_id: string;
    level: string;
    message: string;
}

interface AuditApiResponse {
    total: number;
    gateway: string;
    entries: AuditEntry[];
}

interface ExpandedPayload {
    cid: string;
    loading: boolean;
    data: any | null;
    error: string | null;
}

export default function AuditTrailViewer() {
    const [entries, setEntries] = useState<AuditEntry[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [expandedCid, setExpandedCid] = useState<ExpandedPayload | null>(null);

    const fetchAuditLogs = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (dateFilter) params.set('from', new Date(dateFilter).toISOString());
            params.set('limit', '100');

            const res = await fetch(`/api/audit?${params.toString()}`);
            if (!res.ok) throw new Error(`API error: ${res.status}`);

            const data: AuditApiResponse = await res.json();
            setEntries(data.entries || []);
            setTotal(data.total || 0);
        } catch (err) {
            console.error('[AuditTrail] Fetch error:', err);
            setEntries([]);
        } finally {
            setLoading(false);
        }
    }, [dateFilter]);

    useEffect(() => {
        fetchAuditLogs();
        const interval = setInterval(fetchAuditLogs, 60_000);
        return () => clearInterval(interval);
    }, [fetchAuditLogs]);

    const filteredEntries = entries.filter(e => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            e.cid.toLowerCase().includes(q) ||
            e.agent_id.toLowerCase().includes(q) ||
            e.message.toLowerCase().includes(q)
        );
    });

    const handleExpandCid = async (cid: string, gatewayUrl: string) => {
        if (expandedCid?.cid === cid) {
            setExpandedCid(null);
            return;
        }

        setExpandedCid({ cid, loading: true, data: null, error: null });

        try {
            // Read through our server-side proxy (the public gateway sends no CORS headers).
            const res = await fetch(`/api/ipfs?cid=${encodeURIComponent(cid)}`, { signal: AbortSignal.timeout(12_000) });
            if (!res.ok) throw new Error(`Gateway returned ${res.status}`);
            const data = await res.json();
            setExpandedCid({ cid, loading: false, data, error: null });
        } catch (err: any) {
            setExpandedCid({ cid, loading: false, data: null, error: err.message || 'Failed to fetch from IPFS gateway' });
        }
    };

    return (
        <div className="bg-[#050505] border border-white/10 rounded-xl flex flex-col overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="px-5 py-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                        <Shield className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest">Immutable Audit Trail</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-[10px] text-emerald-500/80 font-mono font-medium tracking-wide">
                                IPFS_PINATA // {total} RECORDS
                            </span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={fetchAuditLogs}
                    disabled={loading}
                    className="p-2 rounded-lg border border-white/10 hover:bg-white/5 transition-colors disabled:opacity-50"
                >
                    <RefreshCw className={`w-3.5 h-3.5 text-white/40 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Search & Filter Bar */}
            <div className="px-5 py-3 border-b border-white/5 flex gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search by CID, agent, or message..."
                        className="w-full bg-black/40 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white font-mono placeholder:text-white/20 focus:border-emerald-500/40 outline-none transition-colors"
                    />
                </div>
                <input
                    type="date"
                    value={dateFilter}
                    onChange={e => setDateFilter(e.target.value)}
                    className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/60 font-mono focus:border-emerald-500/40 outline-none transition-colors"
                />
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[520px] custom-scrollbar">
                <AnimatePresence mode="popLayout">
                    {loading && entries.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center py-16 space-y-3"
                        >
                            <RefreshCw className="w-8 h-8 text-white/20 animate-spin" />
                            <p className="text-[11px] font-mono text-white/40 uppercase tracking-widest">Loading audit records...</p>
                        </motion.div>
                    ) : filteredEntries.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center py-16 space-y-3"
                        >
                            <div className="w-12 h-12 rounded-full border border-dashed border-white/20 flex items-center justify-center">
                                <FileCheck className="w-5 h-5 text-white/30" />
                            </div>
                            <p className="text-[11px] font-mono text-white/40 uppercase tracking-widest">No audit records found</p>
                            <p className="text-[10px] text-white/20 max-w-[240px] text-center">
                                IPFS audit logs are generated every 5 minutes by the autonomous agent.
                            </p>
                        </motion.div>
                    ) : (
                        filteredEntries.map((entry, idx) => (
                            <motion.div
                                key={entry.cid}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.03 }}
                                className="border-b border-white/5 last:border-0"
                            >
                                <div
                                    className="px-5 py-3 hover:bg-white/[0.02] transition-colors cursor-pointer"
                                    onClick={() => handleExpandCid(entry.cid, entry.gateway_url)}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            {/* CID Row */}
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <Hash className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                                                <span className="text-[11px] font-mono text-emerald-400 truncate">
                                                    {entry.cid}
                                                </span>
                                                <a
                                                    href={entry.gateway_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={e => e.stopPropagation()}
                                                    className="flex-shrink-0 p-1 rounded hover:bg-emerald-500/10 transition-colors"
                                                    title="View on IPFS Gateway"
                                                >
                                                    <ExternalLink className="w-3 h-3 text-emerald-400/60" />
                                                </a>
                                            </div>

                                            {/* Metadata Row */}
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <span className="text-[10px] font-mono text-white/30 flex items-center gap-1">
                                                    <Clock className="w-2.5 h-2.5" />
                                                    {new Date(entry.created_at).toLocaleString(undefined, {
                                                        month: 'short', day: 'numeric',
                                                        hour: '2-digit', minute: '2-digit', second: '2-digit',
                                                        hour12: false
                                                    })}
                                                </span>
                                                <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                                                    entry.level === 'success' ? 'text-emerald-400 bg-emerald-500/10' :
                                                    entry.level === 'error' ? 'text-red-400 bg-red-500/10' :
                                                    'text-white/40 bg-white/5'
                                                }`}>
                                                    {entry.agent_id}
                                                </span>
                                                {entry.log_count > 0 && (
                                                    <span className="text-[9px] font-mono text-white/20">
                                                        {entry.log_count} logs
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Expand Indicator */}
                                        <div className="flex-shrink-0 pt-1">
                                            {expandedCid?.cid === entry.cid
                                                ? <ChevronUp className="w-3.5 h-3.5 text-white/30" />
                                                : <ChevronDown className="w-3.5 h-3.5 text-white/20" />
                                            }
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded IPFS Payload */}
                                <AnimatePresence>
                                    {expandedCid?.cid === entry.cid && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-5 pb-4">
                                                <div className="bg-black/60 border border-white/5 rounded-lg p-3 overflow-x-auto">
                                                    {expandedCid.loading ? (
                                                        <div className="flex items-center gap-2 py-2">
                                                            <RefreshCw className="w-3 h-3 text-emerald-400 animate-spin" />
                                                            <span className="text-[10px] font-mono text-white/40">Fetching from IPFS gateway...</span>
                                                        </div>
                                                    ) : expandedCid.error ? (
                                                        <div className="text-[10px] font-mono text-red-400/80 py-1">
                                                            {expandedCid.error}
                                                        </div>
                                                    ) : (
                                                        <pre className="text-[10px] font-mono text-white/60 whitespace-pre-wrap break-all leading-relaxed max-h-[300px] overflow-y-auto custom-scrollbar">
                                                            {JSON.stringify(expandedCid.data, null, 2)}
                                                        </pre>
                                                    )}
                                                </div>
                                                <div className="flex items-center justify-between mt-2">
                                                    <span className="text-[9px] font-mono text-white/20">
                                                        HMAC-SHA256 verified // Pinata Gateway
                                                    </span>
                                                    <a
                                                        href={entry.gateway_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-[9px] font-mono text-emerald-400/60 hover:text-emerald-400 transition-colors"
                                                    >
                                                        Open in new tab
                                                    </a>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            {/* Footer */}
            {filteredEntries.length > 0 && (
                <div className="px-5 py-3 border-t border-white/5 bg-white/[0.02] flex items-center justify-between">
                    <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest">
                        Showing {filteredEntries.length} of {total} records
                    </span>
                    <span className="text-[9px] font-mono text-white/20">
                        Archival interval: 5 min // IPFS Pinata
                    </span>
                </div>
            )}
        </div>
    );
}
