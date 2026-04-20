"use client";

import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

const API_URL = process.env.NEXT_PUBLIC_AGENT_API_URL || 'https://api.nirium.xyz';
const POLL_INTERVAL = 15_000;

interface TickerItem {
    label: string;
    value: string;
    change: string;
    trend: 'up' | 'down' | 'neutral';
}

function buildTickers(market: any, prev: any): TickerItem[] {
    const fmt = (n: number | null, decimals = 4) =>
        n != null ? n.toFixed(decimals) : '—';

    const trend = (curr: number | null, old: number | null): 'up' | 'down' | 'neutral' => {
        if (curr == null || old == null) return 'neutral';
        return curr > old ? 'up' : curr < old ? 'down' : 'neutral';
    };

    const xlm = market?.xlmPrice ?? null;
    const prevXlm = prev?.xlmPrice ?? null;
    const spread = market?.sdexSpread ?? null;
    const prevSpread = prev?.sdexSpread ?? null;
    const baseFee = market?.baseFee ?? null;
    const blendApy = market?.blendSupplyApy ?? null;
    const prevBlend = prev?.blendSupplyApy ?? null;

    return [
        {
            label: 'XLM/USDC',
            value: xlm != null ? `$${fmt(xlm)}` : '$—',
            change: prevXlm != null && xlm != null
                ? `${xlm >= prevXlm ? '+' : ''}${((xlm - prevXlm) / prevXlm * 100).toFixed(2)}%`
                : '—',
            trend: trend(xlm, prevXlm),
        },
        {
            label: 'SDEX SPREAD',
            value: spread != null ? `${spread.toFixed(1)}bps` : 'thin',
            change: prevSpread != null && spread != null
                ? `${spread >= prevSpread ? '+' : ''}${(spread - prevSpread).toFixed(1)}bps`
                : '—',
            trend: spread != null ? trend(prevSpread, spread) : 'neutral',
        },
        {
            label: 'BLEND APY',
            value: blendApy != null && blendApy > 0 ? `${blendApy.toFixed(2)}%` : '—%',
            change: prevBlend != null && blendApy != null && blendApy > 0
                ? `${blendApy >= prevBlend ? '+' : ''}${(blendApy - prevBlend).toFixed(2)}%`
                : '—',
            trend: trend(blendApy, prevBlend),
        },
        {
            label: 'BASE FEE',
            value: baseFee != null ? String(baseFee) : '100',
            change: '0',
            trend: 'neutral',
        },
    ];
}

const MarketTicker = () => {
    const [tickers, setTickers] = useState<TickerItem[]>([
        { label: 'XLM/USDC', value: '$0.1245', change: '+1.2%', trend: 'up' },
        { label: 'SOROSWAP SPREAD', value: '12bps', change: '-2bps', trend: 'down' },
        { label: 'BLEND APY', value: '14.2%', change: '+0.5%', trend: 'up' },
        { label: 'BASE FEE', value: '100', change: '0', trend: 'neutral' },
    ]);
    const prevMarket = useRef<any>(null);

    useEffect(() => {
        const fetchTickers = async () => {
            try {
                const res = await fetch(`${API_URL}/api/tickers`, {
                    signal: AbortSignal.timeout(8000),
                });
                if (!res.ok) return;
                const data = await res.json();
                if (!data?.market) return;
                const built = buildTickers(data.market, prevMarket.current);
                prevMarket.current = data.market;
                setTickers(built);
            } catch {
                // keep last values on error
            }
        };

        fetchTickers();
        const interval = setInterval(fetchTickers, POLL_INTERVAL);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed top-0 left-0 right-0 z-[110] w-full bg-nirium-obsidian/80 border-b border-white/5 backdrop-blur-xl h-10 flex items-center overflow-hidden">
            <div className="flex items-center gap-2 px-4 border-r border-white/10 bg-black z-10 h-full">
                <div className="w-2 h-2 rounded-full bg-stellar-blue animate-pulse"></div>
                <span className="text-[10px] font-bold tracking-tighter text-stellar-blue whitespace-nowrap">LIVE NEURAL FEED</span>
            </div>

            <motion.div
                className="flex whitespace-nowrap items-center gap-12 px-12"
                animate={{ x: [0, -1000] }}
                transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
            >
                {[...tickers, ...tickers, ...tickers].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <span className="text-[10px] font-medium text-white/40">{item.label}</span>
                        <span className="text-[11px] font-mono font-bold text-white">{item.value}</span>
                        <span className={`text-[9px] font-bold ${
                            item.trend === 'up' ? 'text-green-400' :
                            item.trend === 'down' ? 'text-red-400' : 'text-zinc-400'
                        }`}>
                            {item.change}
                        </span>
                    </div>
                ))}
            </motion.div>
        </div>
    );
};

export default MarketTicker;
