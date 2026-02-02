'use client';

import { useMemo } from 'react';

interface OrderLevel {
    price: number;
    amount: number;
    total: number;
}

// Generate deterministic mock data
const generateDepthData = () => {
    const bids: OrderLevel[] = [];
    const asks: OrderLevel[] = [];
    const midPrice = 0.350;

    let bidTotal = 0;
    for (let i = 0; i < 20; i++) {
        const amount = 10000 + Math.random() * 50000;
        bidTotal += amount;
        bids.push({
            price: midPrice - (i * 0.0005),
            amount,
            total: bidTotal
        });
    }

    let askTotal = 0;
    for (let i = 0; i < 20; i++) {
        const amount = 10000 + Math.random() * 50000;
        askTotal += amount;
        asks.push({
            price: midPrice + (i * 0.0005),
            amount,
            total: askTotal
        });
    }

    return { bids, asks, maxTotal: Math.max(bidTotal, askTotal) };
};

export function VolumetricOrderBook({ height = 400 }: { className?: string, height?: number }) {
    const { bids, asks, maxTotal } = useMemo(() => generateDepthData(), []);

    // SVG scaling helpers
    const width = 100; // viewBox width units
    const chartHeight = 80;

    // Create SVG paths for filling areas
    const createPath = (data: OrderLevel[], isBid: boolean) => {
        const startX = isBid ? 0 : 50;
        const xStep = 50 / data.length;

        // Start point (bottom)
        let d = `M ${isBid ? 50 : 50} ${chartHeight}`;

        data.forEach((level, i) => {
            const x = isBid
                ? 50 - ((i + 1) * xStep)
                : 50 + ((i + 1) * xStep);
            const y = chartHeight - ((level.total / maxTotal) * (chartHeight * 0.8)); // Leave 20% top margin
            d += ` L ${x} ${y}`;

            // Create stepped look
            if (i < data.length - 1) {
                const nextX = isBid
                    ? 50 - ((i + 2) * xStep)
                    : 50 + ((i + 2) * xStep);
                d += ` L ${nextX} ${y}`;
            }
        });

        // Close path
        d += ` L ${isBid ? 0 : 100} ${chartHeight} Z`;
        return d;
    };

    return (
        <div className="w-full bg-[#05060a] rounded-xl overflow-hidden border border-white/10 flex flex-col" style={{ height }}>
            {/* Header / Stats */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#0A0B14]">
                <div className="flex gap-8">
                    <div>
                        <div className="text-white/40 text-xs uppercase tracking-wider mb-1">Mark Price</div>
                        <div className="text-2xl font-mono font-medium text-white">$0.3502</div>
                    </div>
                    <div>
                        <div className="text-white/40 text-xs uppercase tracking-wider mb-1">24h Vol</div>
                        <div className="text-base font-mono text-[#D4AF37]">$14.2M</div>
                    </div>
                    <div className="hidden sm:block">
                        <div className="text-white/40 text-xs uppercase tracking-wider mb-1">Spread</div>
                        <div className="text-base font-mono text-white/70">0.02%</div>
                    </div>
                </div>

                <div className="flex gap-2 text-xs font-mono">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400">
                        <span>BIDS</span>
                        <span className="font-bold">49.2%</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
                        <span>ASKS</span>
                        <span className="font-bold">50.8%</span>
                    </div>
                </div>
            </div>

            {/* Main Chart Area */}
            <div className="relative flex-1 bg-[url('/grid.svg')]">
                <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                    <div className="w-full h-px bg-white"></div>
                    <div className="h-full w-px bg-white absolute"></div>
                </div>

                <svg
                    viewBox={`0 0 ${width} ${chartHeight}`}
                    className="w-full h-full preserve-3d"
                    preserveAspectRatio="none"
                >
                    <defs>
                        <linearGradient id="bidGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#00ff88" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#00ff88" stopOpacity="0.05" />
                        </linearGradient>
                        <linearGradient id="askGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#ff4466" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#ff4466" stopOpacity="0.05" />
                        </linearGradient>
                    </defs>

                    {/* Bid Side */}
                    <path
                        d={createPath(bids, true)}
                        fill="url(#bidGradient)"
                        stroke="#00ff88"
                        strokeWidth="0.2"
                        className="transition-all duration-300 ease-out hover:opacity-80"
                    />

                    {/* Ask Side */}
                    <path
                        d={createPath(asks, false)}
                        fill="url(#askGradient)"
                        stroke="#ff4466"
                        strokeWidth="0.2"
                        className="transition-all duration-300 ease-out hover:opacity-80"
                    />
                </svg>

                {/* Central Price Label */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                    <div className="bg-[#0A0B14] border border-[#D4AF37]/30 px-3 py-1 rounded-full shadow-[0_0_20px_rgba(212,175,55,0.2)]">
                        <span className="text-[#D4AF37] text-sm font-bold tracking-wider">0.3500</span>
                    </div>
                    <div className="h-20 w-px bg-gradient-to-b from-[#D4AF37] to-transparent"></div>
                </div>
            </div>

            {/* Axis Labels */}
            <div className="flex justify-between px-4 py-2 text-[10px] text-white/30 font-mono bg-[#0A0B14] border-t border-white/5">
                <span>0.3400</span>
                <span>0.3450</span>
                <span>0.3500</span>
                <span>0.3550</span>
                <span>0.3600</span>
            </div>
        </div>
    );
}

export default VolumetricOrderBook;
