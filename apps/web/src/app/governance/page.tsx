'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { GlassNavbar } from '@/components/ui/GlassNavbar';
import { GlassCard, GlassCardHeader, GlassCardContent } from '@/components/ui/GlassCard';
import { GlassButton, GlassIconButton } from '@/components/ui/GlassButton';
import { GlassModal } from '@/components/ui/GlassModal';
import { GlassInput, GlassTextarea, GlassSelect } from '@/components/ui/GlassInput';

const NeuralCanvas = dynamic(
    () => import('@/components/3d/NeuralCanvas').then((mod) => mod.NeuralCanvas),
    { ssr: false }
);

const ProposalOrbs = dynamic(
    () => import('@/components/charts/ProposalOrbs').then((mod) => mod.ProposalOrbs),
    { ssr: false }
);

interface Proposal {
    id: string;
    title: string;
    description: string;
    author: string;
    forVotes: number;
    againstVotes: number;
    quorum: number;
    endTime: Date;
    status: 'active' | 'passed' | 'rejected' | 'pending';
    category: string;
}

const proposals: Proposal[] = [
    {
        id: 'NIP-42',
        title: 'Upgrade to Protocol 26 with Enhanced ZK Primitives',
        description:
            'Implement new BLS12-381 precompiles and recursive SNARK support for next-generation privacy applications.',
        author: 'Core Team',
        forVotes: 7500000,
        againstVotes: 2500000,
        quorum: 10000000,
        endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        status: 'active',
        category: 'Protocol',
    },
    {
        id: 'NIP-43',
        title: 'Treasury Allocation Q1 2026',
        description:
            'Allocate 5M XLM from treasury for ecosystem development grants and security audits.',
        author: 'Treasury Council',
        forVotes: 8200000,
        againstVotes: 1800000,
        quorum: 10000000,
        endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        status: 'active',
        category: 'Treasury',
    },
    {
        id: 'NIP-44',
        title: 'Aquarius DEX Integration',
        description:
            'Integrate the Aquarius decentralized exchange for enhanced liquidity and trading options.',
        author: 'Partnerships WG',
        forVotes: 4500000,
        againstVotes: 3500000,
        quorum: 10000000,
        endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: 'active',
        category: 'Integration',
    },
    {
        id: 'NIP-41',
        title: 'Community Grant Program Launch',
        description:
            'Fund ecosystem builders with micro-grants ranging from 1,000 to 50,000 XLM.',
        author: 'Community WG',
        forVotes: 9000000,
        againstVotes: 1000000,
        quorum: 10000000,
        endTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        status: 'passed',
        category: 'Community',
    },
];

function formatTimeRemaining(endTime: Date): string {
    const now = Date.now();
    const diff = endTime.getTime() - now;

    if (diff <= 0) return 'Ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h remaining`;
    return `${hours}h remaining`;
}

export default function GovernancePage() {
    const [isNewProposalOpen, setIsNewProposalOpen] = useState(false);
    const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
    const [voteAmount, setVoteAmount] = useState('');

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
                        className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                    >
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                                Salón de <span className="gradient-text">Gobernanza</span>
                            </h1>
                            <p className="text-white/50">
                                Quadratic voting with ZK-proof identity verification
                            </p>
                        </div>
                        <GlassButton
                            variant="primary"
                            onClick={() => setIsNewProposalOpen(true)}
                            icon={<span>+</span>}
                        >
                            New Proposal
                        </GlassButton>
                    </motion.div>

                    {/* Stats Row */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
                    >
                        <GlassCard variant="subtle" size="md">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-cyan-400">4</div>
                                <div className="text-white/50 text-sm">Active Proposals</div>
                            </div>
                        </GlassCard>
                        <GlassCard variant="subtle" size="md">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-purple-400">127</div>
                                <div className="text-white/50 text-sm">Total Proposals</div>
                            </div>
                        </GlassCard>
                        <GlassCard variant="subtle" size="md">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-400">89%</div>
                                <div className="text-white/50 text-sm">Participation Rate</div>
                            </div>
                        </GlassCard>
                        <GlassCard variant="subtle" size="md">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-white">10M</div>
                                <div className="text-white/50 text-sm">Quorum Threshold</div>
                            </div>
                        </GlassCard>
                    </motion.div>

                    <div className="grid lg:grid-cols-2 gap-6">
                        {/* 3D Proposal Orbs Visualization */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <GlassCard variant="elevated" size="lg">
                                <GlassCardHeader
                                    title="Ágora Digital"
                                    subtitle="Active proposals visualized • Size = Quorum"
                                    icon={<span className="text-cyan-400">⬡</span>}
                                />
                                <div className="relative -mx-6 -mb-6 mt-4">
                                    <ProposalOrbs height={380} />
                                </div>
                            </GlassCard>
                        </motion.div>

                        {/* Voting Power Info */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <GlassCard variant="glow" size="lg" className="h-full">
                                <GlassCardHeader
                                    title="Your Voting Power"
                                    subtitle="ZK-verified identity"
                                    icon={<span className="text-purple-400">⌬</span>}
                                />
                                <GlassCardContent>
                                    <div className="space-y-6">
                                        {/* ZK Identity Status */}
                                        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                                                    <span className="text-green-400 text-lg">✓</span>
                                                </div>
                                                <div>
                                                    <div className="text-white font-medium">ZK Identity Verified</div>
                                                    <div className="text-white/50 text-sm">
                                                        Poseidon commitment: 0x8a3f...c91e
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Voting Power Breakdown */}
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-white/60">Base Voting Power</span>
                                                <span className="text-white font-medium">15,420 XLM</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-white/60">Quadratic Weight</span>
                                                <span className="text-cyan-400 font-medium">√15,420 = 124.17</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-white/60">Delegation Received</span>
                                                <span className="text-purple-400 font-medium">+12.5</span>
                                            </div>
                                            <div className="h-px bg-white/10" />
                                            <div className="flex justify-between items-center">
                                                <span className="text-white font-medium">Total Voting Power</span>
                                                <span className="text-2xl font-bold text-cyan-400">136.67</span>
                                            </div>
                                        </div>

                                        {/* Delegate Button */}
                                        <GlassButton variant="secondary" fullWidth>
                                            Delegate Voting Power
                                        </GlassButton>
                                    </div>
                                </GlassCardContent>
                            </GlassCard>
                        </motion.div>

                        {/* Active Proposals List */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="lg:col-span-2"
                        >
                            <GlassCard variant="default" size="lg">
                                <GlassCardHeader
                                    title="Active Proposals"
                                    subtitle="Click to vote on proposals"
                                    icon={<span className="text-cyan-400">◈</span>}
                                />
                                <GlassCardContent>
                                    <div className="space-y-4">
                                        {proposals.map((proposal, index) => {
                                            const totalVotes = proposal.forVotes + proposal.againstVotes;
                                            const forPercent = (proposal.forVotes / totalVotes) * 100;
                                            const quorumPercent = (totalVotes / proposal.quorum) * 100;

                                            return (
                                                <motion.div
                                                    key={proposal.id}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.5 + index * 0.05 }}
                                                    onClick={() => setSelectedProposal(proposal)}
                                                    className="
                            p-5 rounded-xl
                            bg-white/5 border border-white/10
                            hover:bg-white/10 hover:border-cyan-400/30
                            transition-all duration-300 cursor-pointer
                            group
                          "
                                                >
                                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                                        <div className="flex items-start gap-4">
                                                            <div
                                                                className={`
                                  px-2 py-1 rounded text-xs font-medium
                                  ${proposal.status === 'active'
                                                                        ? 'bg-cyan-500/20 text-cyan-400'
                                                                        : proposal.status === 'passed'
                                                                            ? 'bg-green-500/20 text-green-400'
                                                                            : 'bg-red-500/20 text-red-400'
                                                                    }
                                `}
                                                            >
                                                                {proposal.id}
                                                            </div>
                                                            <div>
                                                                <h3 className="text-white font-medium group-hover:text-cyan-300 transition-colors">
                                                                    {proposal.title}
                                                                </h3>
                                                                <p className="text-white/40 text-sm mt-1">
                                                                    by {proposal.author} • {proposal.category}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <span
                                                                className={`
                                  text-sm
                                  ${proposal.status === 'active' ? 'text-yellow-400' : 'text-white/40'}
                                `}
                                                            >
                                                                {formatTimeRemaining(proposal.endTime)}
                                                            </span>
                                                            <GlassButton
                                                                variant="ghost"
                                                                size="sm"
                                                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                Vote
                                                            </GlassButton>
                                                        </div>
                                                    </div>

                                                    {/* Vote Progress */}
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-green-400">
                                                                For: {forPercent.toFixed(1)}%
                                                            </span>
                                                            <span className="text-red-400">
                                                                Against: {(100 - forPercent).toFixed(1)}%
                                                            </span>
                                                        </div>
                                                        <div className="h-2 bg-white/10 rounded-full overflow-hidden flex">
                                                            <div
                                                                className="h-full bg-gradient-to-r from-green-400 to-green-500"
                                                                style={{ width: `${forPercent}%` }}
                                                            />
                                                            <div
                                                                className="h-full bg-gradient-to-r from-red-500 to-red-400"
                                                                style={{ width: `${100 - forPercent}%` }}
                                                            />
                                                        </div>
                                                        <div className="flex justify-between text-xs text-white/40">
                                                            <span>
                                                                {(proposal.forVotes / 1000000).toFixed(1)}M votes
                                                            </span>
                                                            <span>
                                                                Quorum: {quorumPercent.toFixed(0)}%
                                                            </span>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </GlassCardContent>
                            </GlassCard>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* New Proposal Modal */}
            <GlassModal
                isOpen={isNewProposalOpen}
                onClose={() => setIsNewProposalOpen(false)}
                title="Create New Proposal"
                size="lg"
            >
                <div className="space-y-6">
                    <GlassInput
                        label="Proposal Title"
                        placeholder="Enter a clear, descriptive title"
                        fullWidth
                    />
                    <GlassTextarea
                        label="Description"
                        placeholder="Describe the proposal in detail..."
                        fullWidth
                    />
                    <GlassSelect
                        label="Category"
                        options={[
                            { value: 'protocol', label: 'Protocol Upgrade' },
                            { value: 'treasury', label: 'Treasury' },
                            { value: 'community', label: 'Community' },
                            { value: 'integration', label: 'Integration' },
                        ]}
                        fullWidth
                    />
                    <div className="flex gap-4 justify-end pt-4">
                        <GlassButton
                            variant="ghost"
                            onClick={() => setIsNewProposalOpen(false)}
                        >
                            Cancel
                        </GlassButton>
                        <GlassButton variant="primary">Submit Proposal</GlassButton>
                    </div>
                </div>
            </GlassModal>

            {/* Vote Modal */}
            {selectedProposal && (
                <GlassModal
                    isOpen={!!selectedProposal}
                    onClose={() => setSelectedProposal(null)}
                    title={`Vote on ${selectedProposal.id}`}
                    size="md"
                >
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-white font-medium mb-2">{selectedProposal.title}</h3>
                            <p className="text-white/50 text-sm">{selectedProposal.description}</p>
                        </div>

                        <GlassInput
                            label="Vote Weight (Quadratic)"
                            placeholder="Enter amount"
                            hint="Your vote weight will be the square root of your XLM"
                            value={voteAmount}
                            onChange={(e) => setVoteAmount(e.target.value)}
                            fullWidth
                        />

                        <div className="flex gap-4">
                            <GlassButton variant="success" fullWidth icon={<span>✓</span>}>
                                Vote For
                            </GlassButton>
                            <GlassButton variant="danger" fullWidth icon={<span>✕</span>}>
                                Vote Against
                            </GlassButton>
                        </div>

                        <p className="text-white/40 text-xs text-center">
                            Your identity is protected by ZK-proof. Only your vote weight is public.
                        </p>
                    </div>
                </GlassModal>
            )}
        </main>
    );
}
