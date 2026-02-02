'use client';

import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { GlassNavbar } from '@/components/ui/GlassNavbar';
import { GlassCard, GlassCardHeader, GlassCardContent } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { LiquidityChart, VolumeChart } from '@/components/charts/LiquidityChart';
import { NIRIUM_CONTRACTS } from '@/lib/contracts';

const NeuralCanvas = dynamic(
    () => import('@/components/3d/NeuralCanvas').then((mod) => mod.NeuralCanvas),
    { ssr: false }
);

// Mock wallet data
const walletData = {
    address: 'GDQP2K...X4VJ',
    xlmBalance: 15420.5,
    usdcBalance: 8750.0,
    aquaBalance: 125000,
};

const channelStatus = [
    { id: 'x402-compute', name: 'Neural Compute', status: 'active', usage: 78 },
    { id: 'x402-data', name: 'Data Access', status: 'active', usage: 45 },
    { id: 'x402-storage', name: 'Distributed Storage', status: 'pending', usage: 0 },
];

const validatorMetrics = [
    { name: 'Node Health', value: 99.8, unit: '%', status: 'healthy' },
    { name: 'Consensus Rounds', value: 12450, unit: '', status: 'healthy' },
    { name: 'Avg Latency', value: 245, unit: 'ms', status: 'warning' },
    { name: 'Connections', value: 48, unit: 'peers', status: 'healthy' },
];

export default function DashboardPage() {
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
                            Panel de Control <span className="gradient-text">Nirium</span>
                        </h1>
                        <p className="text-white/50">
                            Monitor your assets, channels, and network health in real-time
                        </p>
                    </motion.div>

                    {/* Grid Layout */}
                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* Main Chart - Takes 2 columns */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="lg:col-span-2"
                        >
                            <GlassCard variant="elevated" size="lg">
                                <LiquidityChart title="Total Value Locked" height={320} />
                            </GlassCard>
                        </motion.div>

                        {/* Wallet Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <GlassCard variant="glow" size="lg" className="h-full">
                                <GlassCardHeader
                                    title="Wallet"
                                    subtitle={walletData.address}
                                    icon={<span className="text-cyan-400">◈</span>}
                                />
                                <GlassCardContent>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center py-3 border-b border-white/10">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center text-xs font-bold">
                                                    XLM
                                                </div>
                                                <span className="text-white">Stellar Lumens</span>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-white font-medium">
                                                    {walletData.xlmBalance.toLocaleString()}
                                                </div>
                                                <div className="text-white/40 text-sm">
                                                    ${(walletData.xlmBalance * 0.35).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center py-3 border-b border-white/10">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center text-xs font-bold">
                                                    USDC
                                                </div>
                                                <span className="text-white">USD Coin</span>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-white font-medium">
                                                    {walletData.usdcBalance.toLocaleString()}
                                                </div>
                                                <div className="text-white/40 text-sm">
                                                    ${walletData.usdcBalance.toLocaleString()}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-purple-600 flex items-center justify-center text-xs font-bold">
                                                    AQUA
                                                </div>
                                                <span className="text-white">Aquarius</span>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-white font-medium">
                                                    {walletData.aquaBalance.toLocaleString()}
                                                </div>
                                                <div className="text-white/40 text-sm">
                                                    ${(walletData.aquaBalance * 0.008).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6">
                                        <GlassButton variant="primary" fullWidth>
                                            Deposit
                                        </GlassButton>
                                    </div>
                                </GlassCardContent>
                            </GlassCard>
                        </motion.div>

                        {/* Volume Chart */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <GlassCard variant="default" size="lg" className="h-full">
                                <VolumeChart />
                            </GlassCard>
                        </motion.div>

                        {/* x402 Channels */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <GlassCard variant="default" size="lg" className="h-full">
                                <GlassCardHeader
                                    title="x402 Channels"
                                    subtitle="Payment channel status"
                                    icon={<span className="text-purple-400">⌬</span>}
                                />
                                <GlassCardContent>
                                    <div className="space-y-4">
                                        {channelStatus.map((channel) => (
                                            <div key={channel.id} className="space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-white/80">{channel.name}</span>
                                                    <span
                                                        className={`
                              px-2 py-1 rounded-full text-xs font-medium
                              ${channel.status === 'active'
                                                                ? 'bg-green-500/20 text-green-400'
                                                                : 'bg-yellow-500/20 text-yellow-400'
                                                            }
                            `}
                                                    >
                                                        {channel.status}
                                                    </span>
                                                </div>
                                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${channel.usage}%` }}
                                                        transition={{ duration: 1, delay: 0.5 }}
                                                        className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </GlassCardContent>
                            </GlassCard>
                        </motion.div>

                        {/* Contracts Infrastructure */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <GlassCard variant="default" size="lg" className="h-full">
                                <GlassCardHeader
                                    title="Smart Infrastructure"
                                    subtitle="Protocol 25 Contracts"
                                    icon={<span className="text-cyan-400">⚡</span>}
                                />
                                <GlassCardContent>
                                    <div className="space-y-4">
                                        {[
                                            { name: 'Verifier (ZK)', id: NIRIUM_CONTRACTS.VERIFIER, status: 'Active' },
                                            { name: 'Identity Pool', id: NIRIUM_CONTRACTS.IDENTITY_POOL, status: 'Active' },
                                            { name: 'Payment Gate', id: NIRIUM_CONTRACTS.PAYMENT_GATE, status: 'Active' },
                                        ].map((contract) => (
                                            <div key={contract.name} className="flex flex-col space-y-1 p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-white/80 font-medium">{contract.name}</span>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
                                                        <span className="text-green-400 text-xs">{contract.status}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-white/40 font-mono">
                                                    <span className="truncate">{contract.id}</span>
                                                    <a
                                                        href={`https://stellar.expert/explorer/${NIRIUM_CONTRACTS.NETWORK}/contract/${contract.id}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-cyan-500 hover:text-cyan-300 ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        View ↗
                                                    </a>
                                                </div>
                                            </div>
                                        ))}
                                        <div className="pt-2 border-t border-white/10 flex justify-between text-xs text-white/50">
                                            <span>Network</span>
                                            <span className="uppercase text-cyan-400">{NIRIUM_CONTRACTS.NETWORK}</span>
                                        </div>
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
