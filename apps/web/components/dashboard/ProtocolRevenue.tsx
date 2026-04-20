"use client";

import { useEffect, useState, useCallback } from "react";
import { Zap, TrendingUp, DollarSign, RefreshCw } from "lucide-react";

interface PaymentEvent {
    id: string;
    txHash?: string;
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
    eloHealth: number;
}

export default function ProtocolRevenue({ compact = false }: { compact?: boolean }) {
    const [events, setEvents]   = useState<PaymentEvent[]>([]);
    const [stats, setStats]     = useState<RevenueStats>({
        totalUsdc: 0,
        last24h: 0,
        requestCount: 0,
        lastPayment: null,
        eloHealth: 1450
    });
    const [loading, setLoading] = useState(true);

    const treasury = "GC4Q5TWWXI7IHN6DYCBEKCOWJWCKY4JE2NLKLU5SE3YL44IUUFPKUOPC"; 

    const fetchRevenue = useCallback(async () => {
        try {
            // Fetch up to 200 ops (4 pages) for full historical revenue
            const USDC_ISSUER = 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5';
            // Buyer cycles: x402_signal → x402_market → mpp_signal → mpp_market (all $0.01)
            const CYCLE_ROUTES = ['/x402/signal', '/x402/market', '/mpp/signal', '/mpp/market'];

            let allRecords: any[] = [];
            let url = `https://horizon-testnet.stellar.org/accounts/${treasury}/operations?order=desc&limit=50`;
            for (let page = 0; page < 4; page++) {
                const res = await fetch(`${url}&_t=${Date.now()}`);
                const json = await res.json();
                const records: any[] = json?._embedded?.records ?? [];
                allRecords = allRecords.concat(records);
                const nextUrl = json?._links?.next?.href;
                if (!nextUrl || records.length < 50) break;
                url = nextUrl.replace(/_t=\d+/, '');
            }

            const parsed = allRecords.reduce((acc: PaymentEvent[], r: any) => {
                let amount: string | null = null;
                let from = r.from || 'Contract';

                if (r.type === 'invoke_host_function') {
                    const change = r.asset_balance_changes?.find(
                        (c: any) => c.to === treasury &&
                            c.asset_code === 'USDC' && c.asset_issuer === USDC_ISSUER
                    );
                    if (change) { amount = change.amount; from = change.from || from; }
                } else if (
                    (r.type === 'payment' || r.type === 'path_payment_strict_receive') &&
                    r.to === treasury && r.asset_code === 'USDC' && r.asset_issuer === USDC_ISSUER
                ) {
                    amount = r.amount; from = r.from || from;
                }

                if (!amount) return acc;

                const val = parseFloat(amount);
                let routeName: string;
                if (val <= 0.01)       routeName = CYCLE_ROUTES[acc.length % CYCLE_ROUTES.length];
                else if (val <= 0.02)  routeName = '/x402/arbitrage';
                else if (val <= 0.05)  routeName = '/x402/premium';
                else if (val <= 0.10)  routeName = '/mpp/market';
                else                   routeName = '/mpp/subscribe';

                acc.push({
                    id: r.id,
                    txHash: r.transaction_hash || r.transaction_id || r.id,
                    message: `from=${from} | amount=${amount} USDC | route=${routeName}`,
                    created_at: r.created_at,
                    from,
                    route: routeName,
                    amount,
                });
                return acc;
            }, []);

            const total  = parsed.reduce((s: number, e: any) => s + parseFloat(e.amount || '0'), 0);
            const cutoff = new Date(Date.now() - 86_400_000).toISOString();
            const last24 = parsed
                .filter((e: any) => e.created_at > cutoff)
                .reduce((s: number, e: any) => s + parseFloat(e.amount || '0'), 0);

            setEvents(parsed);
            setStats(prev => ({
                ...prev,
                totalUsdc:    Math.round(total * 100) / 100,
                last24h:      Math.round(last24 * 100) / 100,
                requestCount: parsed.length,
                lastPayment:  parsed[0]?.created_at || null,
            }));
        } catch {
            // silent
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
        <div className={`rounded-2xl border border-stellar-teal/20 bg-black/60 backdrop-blur-md shadow-2xl ${compact ? 'p-3' : 'p-4 mt-4'}`}>
            <div className={`flex items-center justify-between ${compact ? 'mb-2' : 'mb-4'}`}>
                <div className="flex items-center gap-2">
                    <Zap size={compact ? 12 : 16} className="text-stellar-yellow" />
                    <span className={`font-mono ${compact ? 'text-[10px]' : 'text-sm'} text-white/80`}>Settlement Hub Analytics</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-stellar-yellow/20 text-stellar-yellow border border-stellar-yellow/30 uppercase tracking-tighter">x402 + MPP</span>
                </div>
                {!compact && (
                    <button onClick={fetchRevenue} className="text-white/40 hover:text-stellar-teal transition-colors">
                        <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                    </button>
                )}
            </div>

            <div className={`grid ${compact ? 'grid-cols-2' : 'grid-cols-4'} gap-3 ${compact ? 'mb-3' : 'mb-4'}`}>
                <div className="bg-stellar-teal/5 border border-stellar-teal/10 rounded-lg p-3">
                    <div className="flex items-center gap-1 mb-1">
                        <DollarSign size={10} className="text-stellar-teal" />
                        <span className="text-[9px] font-mono text-white/40 uppercase">REVENUE</span>
                    </div>
                    <div className="font-mono text-sm text-stellar-teal font-bold leading-none">
                        ${stats.totalUsdc.toFixed(2)}
                    </div>
                </div>

                <div className="bg-stellar-yellow/5 border border-stellar-yellow/10 rounded-lg p-3">
                    <div className="flex items-center gap-1 mb-1">
                        <TrendingUp size={10} className="text-stellar-yellow" />
                        <span className="text-[9px] font-mono text-white/40 uppercase">24H</span>
                    </div>
                    <div className="font-mono text-sm text-stellar-yellow font-bold leading-none">
                        ${stats.last24h.toFixed(2)}
                    </div>
                </div>

                {!compact && (
                    <>
                    <div className="bg-white/5 border border-white/5 rounded-lg p-3">
                        <div className="flex items-center gap-1 mb-1">
                            <Zap size={10} className="text-white/40" />
                            <span className="text-[10px] font-mono text-white/40">Settlements</span>
                        </div>
                        <div className="font-mono text-sm text-white/70 font-bold">
                            {stats.requestCount}
                        </div>
                    </div>

                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
                        <div className="flex items-center gap-1 mb-1">
                            <Zap size={10} className="text-purple-400" />
                            <span className="text-[10px] font-mono text-purple-400/60 font-bold uppercase tracking-widest">ELO</span>
                        </div>
                        <div className="font-mono text-sm text-purple-300 font-bold">
                            {stats.eloHealth}
                        </div>
                    </div>
                    </>
                )}
            </div>

            <div className="mb-2 flex items-center justify-between">
                <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Neural Settlement Feed</span>
                <span className="text-[9px] font-mono text-stellar-teal/60 animate-pulse">LIVE SEED</span>
            </div>

            <div className={`space-y-1.5 ${compact ? 'max-h-[120px]' : 'max-h-[220px]'} overflow-y-auto pr-1 custom-scrollbar`}>
                {events.length === 0 && !loading && (
                    <div className="py-8 text-center border font-mono border-dashed border-white/5 rounded-lg">
                        <span className="text-[10px] text-white/20 italic">Awaiting first neural settlement...</span>
                    </div>
                )}
                {events.map((e, idx) => (
                    <a 
                        key={e.id} 
                        href={`https://stellar.expert/explorer/testnet/tx/${e.txHash}`}
                        target="_blank"
                        className="group flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/5 hover:border-stellar-teal/30 hover:bg-stellar-teal/[0.02] transition-all duration-300"
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w-1.5 h-1.5 rounded-full ${idx === 0 ? 'bg-stellar-teal shadow-[0_0_8px_rgba(45,212,191,0.6)]' : 'bg-white/10'}`} />
                            <div className="flex flex-col">
                                <span className="text-[11px] font-mono text-white/90 group-hover:text-stellar-teal transition-colors">
                                    {e.route}
                                </span>
                                <span className="text-[9px] font-mono text-white/30 truncate w-32 md:w-48">
                                    {e.from}
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-0.5">
                            <span className="text-[11px] font-mono font-bold text-stellar-teal">
                                +${parseFloat(e.amount || '0').toFixed(2)}
                            </span>
                            <span className="text-[9px] font-mono text-white/20 whitespace-nowrap">
                                {timeAgo(e.created_at)}
                            </span>
                        </div>
                    </a>
                ))}
            </div>

            {!compact && (
                <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[9px] font-mono text-white/20">
                    <span>Powered by x402 & MPP</span>
                    <span>Last: {stats.lastPayment ? timeAgo(stats.lastPayment) : 'now'}</span>
                </div>
            )}
        </div>
    );
}
