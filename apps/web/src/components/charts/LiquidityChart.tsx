'use client';

import { useMemo } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    TooltipProps,
} from 'recharts';
import { motion } from 'framer-motion';

// Mock data for TVL visualization
// Deterministic mock data for TVL visualization
const generateTVLData = () => {
    const data = [];
    let tvl = 45000000;
    // Fixed reference date to avoid hydration mismatch (Date.now() differs between server/client)
    const now = new Date('2026-02-01T12:00:00Z').getTime();

    // Simple seeded random function
    let seed = 1234;
    const random = () => {
        const x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    };

    for (let i = 30; i >= 0; i--) {
        // Use deterministic random
        const change = (random() - 0.4) * 2000000;
        tvl += change;

        // Ensure TVL stays within realistic bounds
        tvl = Math.max(tvl, 40000000);

        data.push({
            date: new Date(now - i * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
            }),
            tvl: Math.round(tvl),
            volume: Math.round(random() * 5000000 + 1000000),
            yield: +(random() * 5 + 3).toFixed(2),
        });
    }
    return data;
};

interface CustomTooltipProps extends TooltipProps<number, string> {
    active?: boolean;
    payload?: Array<{
        value: number;
        name: string;
        dataKey: string;
        color: string;
    }>;
    label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
    if (!active || !payload) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="
        px-4 py-3 rounded-xl
        backdrop-blur-xl bg-black/80
        border border-cyan-400/30
        shadow-lg
      "
        >
            <p className="text-white/60 text-sm mb-2">{label}</p>
            {payload.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                    <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-white text-sm font-medium">
                        {entry.name}:{' '}
                        {entry.dataKey === 'tvl'
                            ? `$${(entry.value / 1000000).toFixed(2)}M`
                            : entry.dataKey === 'volume'
                                ? `$${(entry.value / 1000000).toFixed(2)}M`
                                : `${entry.value}%`}
                    </span>
                </div>
            ))}
        </motion.div>
    );
}

interface LiquidityChartProps {
    title?: string;
    className?: string;
    height?: number;
    showGrid?: boolean;
    animate?: boolean;
}

export function LiquidityChart({
    title = 'Total Value Locked',
    className = '',
    height = 300,
    showGrid = true,
    animate = true,
}: LiquidityChartProps) {
    const data = useMemo(() => generateTVLData(), []);

    const currentTVL = data[data.length - 1].tvl;
    const previousTVL = data[data.length - 2].tvl;
    const percentChange = ((currentTVL - previousTVL) / previousTVL) * 100;

    return (
        <motion.div
            initial={animate ? { opacity: 0, y: 20 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`w-full ${className}`}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-medium text-white/70">{title}</h3>
                    <div className="flex items-baseline gap-3 mt-1">
                        <span className="text-3xl font-bold text-white">
                            ${(currentTVL / 1000000).toFixed(2)}M
                        </span>
                        <span
                            className={`text-sm font-medium ${percentChange >= 0 ? 'text-green-400' : 'text-red-400'
                                }`}
                        >
                            {percentChange >= 0 ? '↑' : '↓'} {Math.abs(percentChange).toFixed(2)}%
                        </span>
                    </div>
                </div>
                <div className="flex gap-2">
                    {['1D', '1W', '1M', 'ALL'].map((period) => (
                        <button
                            key={period}
                            className="
                px-3 py-1.5 rounded-lg text-sm font-medium
                text-white/60 hover:text-white
                hover:bg-white/10
                transition-all duration-200
              "
                        >
                            {period}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chart */}
            <div style={{ height }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={data}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="tvlGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#00f3ff" stopOpacity={0.4} />
                                <stop offset="50%" stopColor="#9d4edd" stopOpacity={0.2} />
                                <stop offset="100%" stopColor="#9d4edd" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="#00f3ff" />
                                <stop offset="100%" stopColor="#9d4edd" />
                            </linearGradient>
                        </defs>

                        {showGrid && (
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="rgba(255,255,255,0.05)"
                                vertical={false}
                            />
                        )}

                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
                            dy={10}
                        />

                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
                            tickFormatter={(value) => `$${(value / 1000000).toFixed(0)}M`}
                            dx={-10}
                            width={60}
                        />

                        <Tooltip content={<CustomTooltip />} />

                        <Area
                            type="monotone"
                            dataKey="tvl"
                            name="TVL"
                            stroke="url(#lineGradient)"
                            strokeWidth={3}
                            fill="url(#tvlGradient)"
                            animationDuration={1500}
                            animationEasing="ease-out"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
}

/**
 * VolumeChart - 24h trading volume chart
 */
export function VolumeChart({ className = '' }: { className?: string }) {
    const data = useMemo(() => generateTVLData(), []);

    return (
        <div className={`w-full ${className}`}>
            <div className="mb-4">
                <h3 className="text-lg font-medium text-white/70">24h Volume</h3>
                <span className="text-2xl font-bold text-white">
                    ${(data[data.length - 1].volume / 1000000).toFixed(2)}M
                </span>
            </div>

            <div style={{ height: 150 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#9d4edd" stopOpacity={0.4} />
                                <stop offset="100%" stopColor="#9d4edd" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <Area
                            type="monotone"
                            dataKey="volume"
                            stroke="#9d4edd"
                            strokeWidth={2}
                            fill="url(#volumeGradient)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export default LiquidityChart;
