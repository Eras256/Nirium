'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { GlassNavbar } from '@/components/ui/GlassNavbar';
import { GlassCard, GlassCardHeader, GlassCardContent } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassInput, GlassSelect } from '@/components/ui/GlassInput';

const NeuralCanvas = dynamic(
    () => import('@/components/3d/NeuralCanvas').then((mod) => mod.NeuralCanvas),
    { ssr: false }
);

const VolumetricOrderBook = dynamic(
    () => import('@/components/charts/VolumetricOrderBook').then((mod) => mod.VolumetricOrderBook),
    { ssr: false }
);

const tokens = [
    { value: 'XLM', label: 'Stellar Lumens (XLM)' },
    { value: 'USDC', label: 'USD Coin (USDC)' },
    { value: 'AQUA', label: 'Aquarius (AQUA)' },
    { value: 'yXLM', label: 'Yield XLM (yXLM)' },
];

const recentTrades = [
    { pair: 'XLM/USDC', side: 'buy', amount: 5000, price: 0.3502, time: '2m ago' },
    { pair: 'XLM/USDC', side: 'sell', amount: 12500, price: 0.3498, time: '5m ago' },
    { pair: 'AQUA/XLM', side: 'buy', amount: 85000, price: 0.0245, time: '8m ago' },
    { pair: 'XLM/USDC', side: 'buy', amount: 3200, price: 0.3505, time: '12m ago' },
    { pair: 'USDC/XLM', side: 'sell', amount: 1500, price: 2.856, time: '15m ago' },
];

export default function MarketsPage() {
    const [fromToken, setFromToken] = useState('XLM');
    const [toToken, setToToken] = useState('USDC');
    const [amount, setAmount] = useState('');
    const [slippage, setSlippage] = useState(0.5);

    const estimatedOutput = parseFloat(amount || '0') * 0.35;

    return (
        <main className="relative min-h-screen">
            <NeuralCanvas />
            <GlassNavbar />

            <div className="content-layer pt-28 pb-12 px-4">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                            Neural <span className="gradient-text">Markets</span>
                        </h1>
                        <p className="text-white/50">
                            Trade Stellar assets with Real-time Institutional Depth Chart
                        </p>
                    </motion.div>

                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* 3D Order Book Visualization */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="lg:col-span-2"
                        >
                            <GlassCard variant="elevated" size="lg">
                                <GlassCardHeader
                                    title="Volumetric Order Book"
                                    subtitle="XLM/USDC • Real-time liquidity depth"
                                    icon={<span className="text-[#D4AF37]">◊</span>}
                                    action={
                                        <div className="flex gap-2">
                                            <button className="px-3 py-1 rounded-lg text-sm bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30">
                                                XLM/USDC
                                            </button>
                                            <button className="px-3 py-1 rounded-lg text-sm text-white/50 hover:bg-white/10 transition-colors">
                                                AQUA/XLM
                                            </button>
                                        </div>
                                    }
                                />
                                <div className="relative -mx-6 -mb-6 mt-4">
                                    <VolumetricOrderBook height={400} />
                                </div>
                            </GlassCard>
                        </motion.div>

                        {/* Swap Interface */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <GlassCard variant="glow" size="lg">
                                <GlassCardHeader
                                    title="Swap"
                                    subtitle="Exchange assets instantly"
                                    icon={<span className="text-[#D4AF37]">⇄</span>}
                                />
                                <GlassCardContent>
                                    <div className="space-y-4">
                                        {/* From Token */}
                                        <div>
                                            <label className="text-white/50 text-sm mb-2 block">From</label>
                                            <div className="flex flex-col sm:flex-row gap-3">
                                                <GlassSelect
                                                    options={tokens}
                                                    value={fromToken}
                                                    onChange={(e) => setFromToken(e.target.value)}
                                                    className="w-full sm:w-1/2"
                                                />
                                                <GlassInput
                                                    type="number"
                                                    placeholder="0.00"
                                                    value={amount}
                                                    onChange={(e) => setAmount(e.target.value)}
                                                    className="w-full sm:flex-1"
                                                />
                                            </div>
                                            <div className="text-right text-white/40 text-sm mt-1">
                                                Balance: 15,420.50 XLM
                                            </div>
                                        </div>

                                        {/* Swap Arrow */}
                                        <div className="flex justify-center">
                                            <button
                                                onClick={() => {
                                                    const temp = fromToken;
                                                    setFromToken(toToken);
                                                    setToToken(temp);
                                                }}
                                                className="
                          w-10 h-10 rounded-full
                          bg-gradient-to-br from-[#D4AF37]/20 to-[#A08020]/20
                          border border-white/20
                          flex items-center justify-center
                          hover:border-[#D4AF37]/50 transition-colors
                          text-white/60 hover:text-white
                        "
                                            >
                                                ↕
                                            </button>
                                        </div>

                                        {/* To Token */}
                                        <div>
                                            <label className="text-white/50 text-sm mb-2 block">To</label>
                                            <div className="flex flex-col sm:flex-row gap-3">
                                                <GlassSelect
                                                    options={tokens}
                                                    value={toToken}
                                                    onChange={(e) => setToToken(e.target.value)}
                                                    className="w-full sm:w-1/2"
                                                />
                                                <div className="w-full sm:flex-1 h-12 rounded-xl bg-black/30 border border-white/10 px-4 flex items-center text-white">
                                                    {estimatedOutput.toFixed(4)}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Slippage */}
                                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-white/50 text-sm">Slippage Tolerance</span>
                                                <div className="flex gap-2">
                                                    {[0.1, 0.5, 1.0].map((val) => (
                                                        <button
                                                            key={val}
                                                            onClick={() => setSlippage(val)}
                                                            className={`
                                px-2 py-1 rounded text-xs font-medium
                                ${slippage === val
                                                                    ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30'
                                                                    : 'text-white/50 hover:text-white transition-colors'
                                                                }
                              `}
                                                        >
                                                            {val}%
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-white/40">Rate</span>
                                                <span className="text-white">1 XLM = 0.3502 USDC</span>
                                            </div>
                                            <div className="flex justify-between text-sm mt-1">
                                                <span className="text-white/40">Fee</span>
                                                <span className="text-white">0.0001 XLM</span>
                                            </div>
                                        </div>

                                        <GlassButton variant="primary" fullWidth size="lg">
                                            Swap
                                        </GlassButton>
                                    </div>
                                </GlassCardContent>
                            </GlassCard>
                        </motion.div>

                        {/* Recent Trades */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="lg:col-span-3"
                        >
                            <GlassCard variant="default" size="lg">
                                <GlassCardHeader
                                    title="Recent Trades"
                                    subtitle="Latest market activity"
                                    icon={<span className="text-[#D4AF37]">◈</span>}
                                />
                                <GlassCardContent>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="text-white/40 text-sm border-b border-white/10">
                                                    <th className="text-left py-3 pr-4">Pair</th>
                                                    <th className="text-left py-3 pr-4">Side</th>
                                                    <th className="text-right py-3 pr-4">Amount</th>
                                                    <th className="text-right py-3 pr-4">Price</th>
                                                    <th className="text-right py-3">Time</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {recentTrades.map((trade, index) => (
                                                    <motion.tr
                                                        key={index}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: 0.4 + index * 0.05 }}
                                                        className="border-b border-white/5 last:border-0"
                                                    >
                                                        <td className="py-3 pr-4 text-white font-medium">
                                                            {trade.pair}
                                                        </td>
                                                        <td className="py-3 pr-4">
                                                            <span
                                                                className={`
                                  px-2 py-1 rounded text-xs font-medium
                                  ${trade.side === 'buy'
                                                                        ? 'bg-green-500/20 text-green-400'
                                                                        : 'bg-red-500/20 text-red-400'
                                                                    }
                                `}
                                                            >
                                                                {trade.side.toUpperCase()}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 pr-4 text-right text-white/80">
                                                            {trade.amount.toLocaleString()}
                                                        </td>
                                                        <td className="py-3 pr-4 text-right text-[#D4AF37] font-mono">
                                                            {trade.price.toFixed(4)}
                                                        </td>
                                                        <td className="py-3 text-right text-white/40">
                                                            {trade.time}
                                                        </td>
                                                    </motion.tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </GlassCardContent>
                            </GlassCard>
                        </motion.div>
                    </div>
                </div>
            </div>
        </main>
    );
}
