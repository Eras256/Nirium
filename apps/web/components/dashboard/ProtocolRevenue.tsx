"use client";

/**
 * Nirium Protocol — x402 Revenue Dashboard
 *
 * Shows per-request USDC earnings from the x402 payment protocol.
 * Data source: agent_logs table (level='payment'), polled every 15s.
 */

import { useEffect, useState, useCallback } from "react";
import { Zap, TrendingUp, DollarSign, RefreshCw } from "lucide-react";

interface PaymentEvent {
    id: string;
    message: string;
    created_at: string;
    from?: string;
    route?: string;
    amount?: string;
}

interface RevenueStats {
    totalUsdc: number;
    last24h: number;
    requestCount: number;
    lastPayment: string | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.nirium.xyz';

function parsePaymentMessage(msg: string): Pick<PaymentEvent, 'from' | 'route' | 'amount'> {
    const from   = msg.match(/from=([^\s|]+)/)?.[1];
    const route  = msg.match(/route=([^\s|]+)/)?.[1];
    const amount = msg.match(/amount=([\d.]+)/)?.[1];
    return { from, route, amount };
}

export default function ProtocolRevenue() {
    const [events, setEvents]   = useState<PaymentEvent[]>([]);
    const [stats, setStats]     = useState<RevenueStats>({ totalUsdc: 0, last24h: 0, requestCount: 0, lastPayment: null });
    const [loading, setLoading] = useState(true);

    const fetchRevenue = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/api/revenue`);
            if (!res.ok) return;
            const rows: Array<{ id: string; message: string; created_at: string }> = await res.json();

            const parsed = rows.map(r => ({ id: r.id, message: r.message, created_at: r.created_at, ...parsePaymentMessage(r.message) }));

            const total  = parsed.reduce((sum, e) => sum + parseFloat(e.amount || '0'), 0);
            const cutoff = new Date(Date.now() - 86_400_000).toISOString();
            const last24 = parsed.filter(e => e.created_at > cutoff).reduce((sum, e) => sum + parseFloat(e.amount || '0'), 0);

            setEvents(parsed);
            setStats({
                totalUsdc:    Math.round(total * 1000) / 1000,
                last24h:      Math.round(last24 * 1000) / 1000,
                requestCount: parsed.length,
                lastPayment:  parsed[0]?.created_at || null,
            });
        } catch {
            // silent — not critical
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRevenue();
        const interval = setInterval(fetchRevenue, 15_000);
        return () => clearInterval(interval);
    }, [fetchRevenue]);

    const timeAgo = (iso: string) => {
        const diff = Date.now() - new Date(iso).getTime();
        if (diff < 60_000)  return `${Math.floor(diff / 1000)}s ago`;
        if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
        return `${Math.floor(diff / 3_600_000)}h ago`;
    };

    return (
        <div className="rounded-2xl border border-stellar-teal/20 bg-black/40 backdrop-blur-sm p-4 mt-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Zap size={16} className="text-stellar-yellow" />
                    <span className="font-mono text-sm text-white/80">Protocol Revenue</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stellar-yellow/20 text-stellar-yellow border border-stellar-yellow/30">x402</span>
                </div>
                <button
                    onClick={fetchRevenue}
                    className="text-white/40 hover:text-stellar-teal transition-colors"
                    title="Refresh"
                >
                    <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-stellar-teal/5 border border-stellar-teal/10 rounded-lg p-3">
                    <div className="flex items-center gap-1 mb-1">
                        <DollarSign size={10} className="text-stellar-teal" />
                        <span className="text-[10px] font-mono text-white/40">Total Earned</span>
                    </div>
                    <div className="font-mono text-sm text-stellar-teal font-bold">
                        {loading ? '—' : `$${stats.totalUsdc.toFixed(3)}`}
                    </div>
                    <div className="text-[9px] font-mono text-white/30 mt-0.5">USDC / Stellar</div>
                </div>

                <div className="bg-stellar-yellow/5 border border-stellar-yellow/10 rounded-lg p-3">
                    <div className="flex items-center gap-1 mb-1">
                        <TrendingUp size={10} className="text-stellar-yellow" />
                        <span className="text-[10px] font-mono text-white/40">Last 24h</span>
                    </div>
                    <div className="font-mono text-sm text-stellar-yellow font-bold">
                        {loading ? '—' : `$${stats.last24h.toFixed(3)}`}
                    </div>
                    <div className="text-[9px] font-mono text-white/30 mt-0.5">USDC earned</div>
                </div>

                <div className="bg-white/5 border border-white/5 rounded-lg p-3">
                    <div className="flex items-center gap-1 mb-1">
                        <Zap size={10} className="text-white/40" />
                        <span className="text-[10px] font-mono text-white/40">Requests</span>
                    </div>
                    <div className="font-mono text-sm text-white/70 font-bold">
                        {loading ? '—' : stats.requestCount}
                    </div>
                    <div className="text-[9px] font-mono text-white/30 mt-0.5">paid API calls</div>
                </div>
            </div>

            {/* Recent payments */}
            <div className="space-y-1.5 max-h-[140px] overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
                {events.length === 0 && !loading && (
                    <div className="text-[11px] font-mono text-white/30 text-center py-4">
                        No x402 payments yet. Deploy the agent and call /api/v1/premium/signals.
                    </div>
                )}
                {events.slice(0, 10).map(e => (
                    <div key={e.id} className="flex items-center justify-between text-[10px] font-mono py-1 border-b border-white/5">
                        <div className="flex items-center gap-2 min-w-0">
                            <span className="text-green-400 shrink-0">+${e.amount || '?'}</span>
                            <span className="text-white/40 truncate">{e.route?.replace('/api/v1/premium/', '') || 'unknown'}</span>
                            {e.from && e.from !== 'unknown' && (
                                <span className="text-white/20 truncate">
                                    {e.from.substring(0, 6)}…{e.from.slice(-4)}
                                </span>
                            )}
                        </div>
                        <span className="text-white/30 shrink-0 ml-2">{timeAgo(e.created_at)}</span>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between">
                <span className="text-[9px] font-mono text-white/20">
                    Powered by x402 · Stellar testnet USDC
                </span>
                {stats.lastPayment && (
                    <span className="text-[9px] font-mono text-white/20">
                        Last: {timeAgo(stats.lastPayment)}
                    </span>
                )}
            </div>
        </div>
    );
}
