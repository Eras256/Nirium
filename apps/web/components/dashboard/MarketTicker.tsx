"use client";

import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

const API_URL = process.env.NEXT_PUBLIC_AGENT_API_URL || 'https://nirium-agent.fly.dev';
const POLL_INTERVAL = 4_000;

interface TickerItem {
    label: string;
    value: string;
    change: string;
    trend: 'up' | 'down' | 'neutral';
}

import { useLanguage } from '@/context/LanguageContext';

function buildTickers(market: any, prev: any, t: any): TickerItem[] {
    const fmt = (n: number | null, decimals = 4) =>
        n != null ? n.toFixed(decimals) : '—';

    const trend = (curr: number | null, old: number | null): 'up' | 'down' | 'neutral' => {
        if (curr == null || old == null) return 'neutral';
        const diff = curr - old;
        if (Math.abs(diff) < 0.000001) return 'neutral';
        return diff > 0 ? 'up' : 'down';
    };

    const xlm = market?.xlmPrice ?? null;
    const prevXlm = prev?.xlmPrice ?? null;
    const spread = market?.sdexSpread ?? null;
    const prevSpread = prev?.sdexSpread ?? null;
    const baseFee = market?.baseFee ?? null;
    const blendApy = market?.blendSupplyApy ?? null;
    const prevBlend = prev?.blendSupplyApy ?? null;
    // Sin `?? 5.57`: ese default hacía que la tasa apareciera aunque la fuente
    // no hubiera respondido nunca. La tasa se muestra cuando el agente la
    // manda, y si no, em-dash.
    const cetesApy = market?.cetesRate ?? market?.cetesApy ?? null;

    // Sin dato no se inventa uno. Los fallbacks anteriores ('$0.1732', '5.57%',
    // '0.81bps', '+0.01%') hacían que el ticker siguiera mostrando cifras
    // creíbles cuando el agente no respondía — o sea, precisamente cuando el
    // usuario más necesita saber que no hay dato. Ahora dice em-dash.
    return [
        {
            label: "XLM/USDC",
            value: xlm != null ? `$${fmt(xlm)}` : '—',
            change: prevXlm != null && xlm != null
                ? `${xlm >= prevXlm ? '+' : ''}${((xlm - prevXlm) / prevXlm * 100).toFixed(3)}%`
                : '—',
            trend: trend(xlm, prevXlm),
        },
        {
            // La tasa está FIJA en 5.57 (stellarProvider.fetchEtherfuseApy la
            // devuelve constante, verificada contra Etherfuse en jun-2026), así
            // que no tiene variación que reportar. El código anterior forzaba
            // `trend` a 'up' cuando el cálculo daba 'neutral' — o sea, pintaba
            // flecha verde de subida sobre un número que nunca se mueve. En un
            // indicador de tasa eso no es un detalle de estilo.
            label: "🇲🇽 CETES rate",
            value: cetesApy != null && cetesApy > 0 ? `${cetesApy.toFixed(2)}%` : '—',
            change: 'Banxico ref · Etherfuse',
            trend: 'neutral',
        },
        {
            label: t.common.tickers.sdex_spread,
            value: spread != null ? `${spread.toFixed(2)}bps` : '—',
            change: prevSpread != null && spread != null
                ? `${spread >= prevSpread ? '+' : ''}${(spread - prevSpread).toFixed(2)}bps`
                : '—',
            trend: spread != null ? trend(spread, prevSpread) : 'neutral',
        },
        {
            // "LCP v1.0" leía como capa activa. LCP está APAGADO
            // (LCP_ENABLED !== 'true') esperando revisión legal de los términos
            // que referencia, y el resto del sitio lo dice así. Un badge de
            // versión junto a la palabra COMPLIANCE es justo lo que alguien lee
            // como "esto ya cumple".
            label: "COMPLIANCE",
            value: "NON-FINANCIAL ADVICE // REFERENCE DATA",
            change: "LCP · in legal review",
            trend: 'neutral',
        }
    ];
}

const MarketTicker = () => {
    const { t } = useLanguage();
    const [tickers, setTickers] = useState<TickerItem[]>([]);
    const prevMarket = useRef<any>(null);

    // Estado inicial, antes de que llegue el primer dato. El comentario anterior
    // decía, literalmente, "placeholder tickers localized with real-looking data"
    // — y eso era exactamente el problema: precios, variaciones y flechas de
    // tendencia inventadas que se ven idénticas a las reales durante el primer
    // segundo de cada carga, y para siempre si el agente no responde.
    useEffect(() => {
        setTickers([
            { label: "XLM/USDC", value: '—', change: '—', trend: 'neutral' },
            { label: "🇲🇽 CETES rate", value: '—', change: 'Banxico ref · Etherfuse', trend: 'neutral' },
            { label: t.common.tickers.sdex_spread, value: '—', change: '—', trend: 'neutral' },
            { label: "COMPLIANCE", value: "NON-FINANCIAL ADVICE // REFERENCE DATA", change: "LCP · in legal review", trend: 'neutral' },
        ]);
    }, [t]);

    useEffect(() => {
        const fetchTickers = async () => {
            try {
                const res = await fetch(`${API_URL}/api/tickers`, {
                    signal: AbortSignal.timeout(5000),
                });
                
                let data;
                if (res.ok) {
                    data = await res.json();
                }

                // SIN CAPA DE SIMULACIÓN.
                //
                // Aquí vivía algo llamado "Institutional Simulation Layer" que,
                // cuando el API no respondía, generaba precios con Math.random()
                // partiendo de una base fija. Su propio comentario decía para qué:
                // "Enhanced volatility (0.1% range) to ensure colors are always
                // active" — o sea, existía para que las flechas parpadearan.
                //
                // Fabricaba también movimiento de la TASA DE CETES
                // (cetesApy + random), que es el número más sensible del sitio:
                // una tasa de referencia de deuda gubernamental, inventada con un
                // generador aleatorio y pintada como dato en vivo en la barra
                // superior de todas las páginas. El bloque catch hacía lo mismo,
                // comentado como "keep it alive".
                //
                // Un ticker que sigue moviéndose cuando la fuente está caída no
                // es una degradación elegante: es dato falso presentado como real,
                // y en una barra rotulada COMPLIANCE es lo peor que puede haber.
                // Si no hay dato, no hay dato.
                if (!data?.market || data.market.xlmPrice === null) {
                    setTickers(buildTickers(null, null, t));
                    return;
                }

                const built = buildTickers(data.market, prevMarket.current, t);
                prevMarket.current = data.market;
                setTickers(built);
            } catch {
                // La fuente no respondió. Se dice, no se simula.
                setTickers(buildTickers(null, null, t));
            }
        };

        fetchTickers();
        const interval = setInterval(fetchTickers, POLL_INTERVAL);
        return () => clearInterval(interval);
    }, [t]);

    return (
        <div className="fixed top-0 left-0 right-0 z-[110] w-full bg-background/80 border-b border-black/10 backdrop-blur-md h-9 flex items-center overflow-hidden">
            {/* Live Status Label (More Compact) */}
            <div className="flex items-center gap-2 px-4 h-full bg-white/[0.02] border-r border-black/10 dark:border-white/10 min-w-[100px] justify-center shrink-0">
                <div className="relative">
                    <div className="w-2 h-2 rounded-full bg-stellar-yellow shadow-[0_0_10px_#FFC800]"></div>
                    <div className="absolute inset-0 w-2 h-2 rounded-full bg-stellar-yellow animate-ping opacity-40"></div>
                </div>
                <span className="text-[9px] font-black tracking-[0.2em] text-zinc-800 dark:text-white/90">
                    {t.common.tickers.live_feed}
                </span>
            </div>

            {/* Scrolling Ticker Container */}
            <div className="relative flex-1 flex items-center overflow-hidden h-full">
                <motion.div
                    className="flex whitespace-nowrap items-center gap-16 px-16"
                    animate={{ x: [0, -2000] }}
                    transition={{ 
                        repeat: Infinity, 
                        duration: 60, 
                        ease: "linear" 
                    }}
                    style={{ willChange: "transform" }}
                >
                    {[...tickers, ...tickers, ...tickers, ...tickers].map((item, i) => (
                        <div key={i} className="flex items-center gap-5 group">
                            {/* Asset Tag */}
                            <div className="flex flex-col">
                                <span className="text-[8px] font-bold text-zinc-500 tracking-widest uppercase leading-none mb-1">
                                    {item.label}
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className={`text-[14px] font-mono font-black tracking-tight ${
                                        item.trend === 'up' ? 'text-green-600 dark:text-green-400' :
                                        item.trend === 'down' ? 'text-red-600 dark:text-red-400' :
                                        'text-zinc-900 dark:text-white'
                                    }`}>
                                        {item.value}
                                    </span>
                                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                                        item.trend === 'up' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                        item.trend === 'down' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                                        'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
                                    }`}>
                                        {item.change}
                                    </span>
                                </div>
                            </div>
                            
                            {/* Visual Separator */}
                            <div className="w-[1px] h-6 bg-gradient-to-b from-transparent via-white/10 to-transparent mx-2" />
                        </div>
                    ))}
                </motion.div>

                {/* Left/Right Overlays for smooth fading */}
                <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
                <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
            </div>
        </div>
    );
};

export default MarketTicker;
