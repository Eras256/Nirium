"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const MarketTicker = () => {
    const [data, setData] = useState([
        { label: 'XLM/USDC', value: '$0.1245', change: '+1.2%', trend: 'up' },
        { label: 'SOROSWAP SPREAD', value: '12bps', change: '-2bps', trend: 'down' },
        { label: 'BLEND APY', value: '14.2%', change: '+0.5%', trend: 'up' },
        { label: 'BASE FEE', value: '100', change: '0', trend: 'neutral' },
        { label: 'YBX/XLM', value: '8.45', change: '+2.1%', trend: 'up' },
    ]);

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
                {[...data, ...data, ...data].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <span className="text-[10px] font-medium text-white/40">{item.label}</span>
                        <span className="text-[11px] font-mono font-bold text-white">{item.value}</span>
                        <span className={`text-[9px] font-bold ${item.trend === 'up' ? 'text-green-400' :
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
