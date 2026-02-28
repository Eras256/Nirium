"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface StatusBadgeProps {
    status: 'active' | 'inactive' | 'error' | 'syncing';
    label?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label }) => {
    const config = {
        active: { color: 'bg-green-500', glow: 'shadow-[0_0_15px_rgba(34,197,94,0.6)]', ping: true },
        inactive: { color: 'bg-zinc-500', glow: '', ping: false },
        error: { color: 'bg-red-500', glow: 'shadow-[0_0_15px_rgba(239,68,68,0.6)]', ping: true },
        syncing: { color: 'bg-stellar-blue', glow: 'shadow-[0_0_15px_rgba(0,170,255,0.6)]', ping: true },
    };

    const { color, glow, ping } = config[status];

    return (
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-nirium-obsidian border border-white/10 backdrop-blur-md">
            <div className="relative flex h-2.5 w-2.5">
                {ping && (
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${color} opacity-75`}></span>
                )}
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${color} ${glow}`}></span>
            </div>
            <span className="text-[10px] font-mono tracking-widest uppercase text-white/70">
                {label || status}
            </span>
        </div>
    );
};

export default StatusBadge;
