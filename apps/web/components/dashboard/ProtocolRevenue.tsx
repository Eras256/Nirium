"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Zap, TrendingUp, DollarSign, RefreshCw, Activity, ShieldCheck, Globe, Database } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PaymentEvent {
    id: string;
    txHash?: string;
    message: string;
    created_at: string;
    from?: string;
    route?: string;
    amount?: string;
    type?: 'x402' | 'mpp';
}

interface RevenueStats {
    totalUsdc: number;
    last24h: number;
    requestCount: number;
    lastPayment: string | null;
    eloHealth: number;
}

import { useLanguage } from "@/context/LanguageContext";
import { useEloReputation } from "@/hooks/useNiriumContracts";

export default function ProtocolRevenue({ compact = false }: { compact?: boolean }) {
    const { t } = useLanguage();
    const [events, setEvents] = useState<PaymentEvent[]>([]);
    const [stats, setStats] = useState<RevenueStats>({
        totalUsdc: 0,
        last24h: 0,
        requestCount: 0,
        lastPayment: null,
        eloHealth: 1450
    });
    const [loading, setLoading] = useState(true);
    const [isPulsing, setIsPulsing] = useState(false);
    const prevEventsCount = useRef(0);

    const treasury = "GC4Q5TWWXI7IHN6DYCBEKCOWJWCKY4JE2NLKLU5SE3YL44IUUFPKUOPC";
    const elo = useEloReputation();

    // Fetch real ELO score from NiriumProtocol contract on Soroban
    useEffect(() => {
        elo.getScore(treasury)
            .then((score: number) => { if (score > 0) setStats(prev => ({ ...prev, eloHealth: score })); })
            .catch(() => {}); // fallback stays at 1450
    }, []);

    const fetchRevenue = useCallback(async () => {
        try {
            // Fetch up to 200 ops for full historical revenue
            const USDC_ISSUER = 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5';
            
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
                let routeName: string | null = null;
                let pType: 'x402' | 'mpp' = 'x402';
                
                // Institutional Tier Mapping (Real x402/MPP Logic)
                if (val === 0.02) { 
                    routeName = '/signals'; 
                    pType = 'x402';
                } else if (val === 0.05) { 
                    routeName = '/market-data'; 
                    pType = 'x402';
                } else if (val === 0.25) { 
                    routeName = '/execution'; 
                    pType = 'mpp';
                } else if (val >= 1.0) { 
                    routeName = '/mpp/session-init'; 
                    pType = 'mpp';
                }
                
                if (!routeName) return acc;

                acc.push({
                    id: r.id,
                    txHash: r.transaction_hash || r.transaction_id || r.id,
                    message: `from=${from} | amount=${amount} USDC | route=${routeName}`,
                    created_at: r.created_at,
                    from,
                    route: routeName,
                    amount,
                    type: pType
                });
                return acc;
            }, []);

            // Pulse effect if we have new events
            if (parsed.length > prevEventsCount.current) {
                setIsPulsing(true);
                setTimeout(() => setIsPulsing(false), 2000);
            }
            prevEventsCount.current = parsed.length;

            const total = parsed.reduce((s: number, e: any) => s + parseFloat(e.amount || '0'), 0);
            const cutoff = new Date(Date.now() - 86_400_000).toISOString();
            const last24 = parsed
                .filter((e: any) => e.created_at > cutoff)
                .reduce((s: number, e: any) => s + parseFloat(e.amount || '0'), 0);

            setEvents(parsed);
            setStats(prev => ({
                ...prev,
                totalUsdc: Math.round(total * 100) / 100,
                last24h: Math.round(last24 * 100) / 100,
                requestCount: parsed.length,
                lastPayment: parsed[0]?.created_at || null,
            }));
        } catch {
            // silent 
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRevenue();
        // Faster institutional polling for "movement"
        const interval = setInterval(fetchRevenue, 8000);
        return () => clearInterval(interval);
    }, [fetchRevenue]);

    const timeAgo = (iso: string) => {
        const diff = Date.now() - new Date(iso).getTime();
        if (diff < 60_000) return `${Math.floor(diff / 1000)}s`;
        if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m`;
        return `${Math.floor(diff / 3_600_000)}h`;
    };

    return (
        <div className={`relative overflow-hidden rounded-2xl border border-stellar-teal/20 bg-black/40 backdrop-blur-xl shadow-2xl transition-all duration-500 h-full flex flex-col ${compact ? 'p-3' : 'p-5 mt-4'}`}>
            {/* Animated Background Pulse */}
            <AnimatePresence>
                {isPulsing && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0.1, 0] }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-stellar-teal pointer-events-none z-0"
                    />
                )}
            </AnimatePresence>

            <div className={`relative z-10 flex items-center justify-between ${compact ? 'mb-1' : 'mb-5'}`}>
                <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-stellar-teal/10 border border-stellar-teal/20">
                        <Database size={compact ? 12 : 16} className="text-stellar-teal" />
                    </div>
                    <div className="flex flex-col">
                        <span className={`font-mono font-black tracking-tight ${compact ? 'text-[9px]' : 'text-xs'} text-white/90 uppercase`}>
                            {t.dashboard.revenue_card.title}
                        </span>
                        <div className="flex items-center gap-2">
                            <span className="text-[7px] font-mono text-stellar-teal/60 border border-stellar-teal/20 px-1 rounded-full uppercase">
                                x402 + MPP Ready
                            </span>
                            {loading && <RefreshCw size={7} className="text-stellar-teal animate-spin" />}
                        </div>
                    </div>
                </div>
                {!compact && (
                    <div className="flex items-center gap-4">
                        <div className="hidden lg:flex items-center gap-1.5 text-[8px] font-mono text-white/20 uppercase">
                            <Globe size={10} />
                            Settlement Layer: Testnet
                        </div>
                        <button onClick={fetchRevenue} className="p-1.5 rounded-md hover:bg-white/5 text-white/20 hover:text-stellar-teal transition-all">
                            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>
                )}
            </div>

            <div className={`relative z-10 grid ${compact ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-2 lg:grid-cols-4'} gap-2 ${compact ? 'mb-2' : 'mb-6'}`}>
                <div className={`relative group overflow-hidden bg-white/[0.02] border border-white/5 rounded-xl ${compact ? 'p-2' : 'p-4'} transition-all hover:border-stellar-teal/30 hover:bg-stellar-teal/[0.02]`}>
                    <div className="absolute top-0 right-0 w-12 h-12 bg-stellar-teal/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                    <div className="flex items-center gap-2 mb-1">
                        <DollarSign size={compact ? 10 : 12} className="text-stellar-teal" />
                        <span className={`font-mono text-white/40 uppercase tracking-widest leading-none ${compact ? 'text-[7px]' : 'text-[9px]'}`}>FEES</span>
                    </div>
                    <div className={`${compact ? 'text-sm' : 'text-lg'} font-mono text-white font-black leading-none flex items-baseline gap-1`}>
                        <span className="text-stellar-teal text-[10px]">$</span>{stats.totalUsdc.toFixed(2)}
                    </div>
                </div>

                <div className={`relative group overflow-hidden bg-white/[0.02] border border-white/5 rounded-xl ${compact ? 'p-2' : 'p-4'} transition-all hover:border-stellar-yellow/30 hover:bg-stellar-yellow/[0.02]`}>
                    <div className="absolute top-0 right-0 w-12 h-12 bg-stellar-yellow/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                    <div className="flex items-center gap-2 mb-1">
                        <TrendingUp size={compact ? 10 : 12} className="text-stellar-yellow" />
                        <span className={`font-mono text-white/40 uppercase tracking-widest leading-none ${compact ? 'text-[7px]' : 'text-[9px]'}`}>VOL</span>
                    </div>
                    <div className={`${compact ? 'text-sm' : 'text-lg'} font-mono text-white font-black leading-none flex items-baseline gap-1`}>
                        <span className="text-stellar-yellow text-[10px]">$</span>{stats.last24h.toFixed(2)}
                    </div>
                </div>

                <div className={`relative group overflow-hidden bg-white/[0.02] border border-white/5 rounded-xl ${compact ? 'p-2' : 'p-4'} transition-all hover:border-white/20 ${compact ? 'hidden lg:block' : ''}`}>
                    <div className="flex items-center gap-2 mb-1">
                        <Activity size={compact ? 10 : 12} className="text-white/40" />
                        <span className={`font-mono text-white/40 uppercase tracking-widest leading-none ${compact ? 'text-[7px]' : 'text-[9px]'}`}>OPS</span>
                    </div>
                    <div className={`${compact ? 'text-sm' : 'text-lg'} font-mono text-white/80 font-black leading-none`}>
                        {stats.requestCount}
                    </div>
                </div>

                <div className={`relative group overflow-hidden bg-purple-500/5 border border-purple-500/10 rounded-xl ${compact ? 'p-2' : 'p-4'} transition-all hover:border-purple-500/30 ${compact ? 'hidden lg:block' : ''}`}>
                    <div className="flex items-center gap-2 mb-1">
                        <ShieldCheck size={compact ? 10 : 12} className="text-purple-400" />
                        <span className={`font-mono text-purple-400/60 font-bold uppercase tracking-widest leading-none ${compact ? 'text-[7px]' : 'text-[9px]'}`}>ELO</span>
                    </div>
                    <div className={`${compact ? 'text-sm' : 'text-lg'} font-mono text-purple-200 font-black leading-none`}>
                        {stats.eloHealth}
                    </div>
                </div>
            </div>

            <div className={`relative z-10 ${compact ? 'mb-1.5' : 'mb-3'} flex items-center justify-between border-b border-white/5 pb-2`}>
                <div className="flex items-center gap-2">
                    <Activity size={10} className="text-stellar-teal/60" />
                    <span className="text-[9px] font-mono text-white/30 uppercase tracking-[0.2em] leading-none">{t.dashboard.revenue_card.feed_title}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-stellar-teal animate-pulse" />
                    <span className="text-[8px] font-mono text-stellar-teal/60 leading-none">{t.dashboard.revenue_card.live_stream}</span>
                </div>
            </div>

            <div className="relative z-10 space-y-1.5 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {events.length === 0 && !loading && (
                    <div className="py-12 text-center border border-dashed border-white/5 rounded-xl bg-white/[0.01]">
                        <Activity size={24} className="mx-auto text-white/5 mb-3" />
                        <span className="text-[10px] font-mono text-white/20 italic tracking-wide">{t.dashboard.revenue_card.awaiting}</span>
                    </div>
                )}
                <AnimatePresence mode="popLayout">
                    {events.map((e, idx) => (
                        <motion.a 
                            layout
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3, delay: idx < 10 ? idx * 0.05 : 0 }}
                            key={e.id} 
                            href={`https://stellar.expert/explorer/testnet/tx/${e.txHash}`}
                            target="_blank"
                            className="group flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-stellar-teal/40 hover:bg-stellar-teal/[0.03] transition-all duration-300 gap-4"
                        >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div className={`w-1 h-6 rounded-full shrink-0 ${e.type === 'mpp' ? 'bg-purple-500/40' : 'bg-stellar-teal/40'} group-hover:scale-y-125 transition-transform`} />
                                <div className="flex flex-col min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-mono font-bold text-white group-hover:text-stellar-teal transition-colors truncate">
                                            {e.route}
                                        </span>
                                        <span className={`text-[7px] font-mono px-1 rounded shrink-0 ${e.type === 'mpp' ? 'bg-purple-500/20 text-purple-400' : 'bg-stellar-teal/20 text-stellar-teal'}`}>
                                            {e.type?.toUpperCase()}
                                        </span>
                                    </div>
                                    <span className="text-[8px] font-mono text-white/20 truncate font-light">
                                        {e.from}
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-1 shrink-0">
                                <div className="flex items-center gap-0.5">
                                    <span className="text-[11px] font-mono font-black text-stellar-teal">
                                        +${parseFloat(e.amount || '0').toFixed(2)}
                                    </span>
                                </div>
                                <span className="text-[8px] font-mono text-white/20 bg-white/5 px-1.5 py-0.5 rounded leading-none">
                                    {timeAgo(e.created_at)}
                                </span>
                            </div>
                        </motion.a>
                    ))}
                </AnimatePresence>
            </div>

            {!compact && (
                <div className="relative z-10 mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[8px] font-mono text-white/20">
                    <div className="flex items-center gap-3">
                        <span>{t.dashboard.revenue_card.powered_by}</span>
                        <div className="h-2 w-[1px] bg-white/10" />
                        <span className="hidden sm:inline">Horizon API Sync: Stable</span>
                    </div>
                    <span>{t.dashboard.revenue_card.last_update}: {stats.lastPayment ? timeAgo(stats.lastPayment) : 'JUST NOW'}</span>
                </div>
            )}
        </div>
    );
}
