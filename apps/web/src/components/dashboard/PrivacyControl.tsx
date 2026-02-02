'use client';

import React, { useState } from 'react';
import { generateWithdrawProof, getValidMockInputs } from "@/lib/zk/zkProofWorker";
import { GlassCard } from '@/components/ui/GlassCard';

interface PrivacyControlProps {
    onGeneratingChange?: (isGenerating: boolean) => void;
}

export const PrivacyControl = ({ onGeneratingChange }: PrivacyControlProps) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [proofStatus, setProofStatus] = useState<'idle' | 'computing' | 'ready' | 'error'>('idle');

    const handleAnonymize = async () => {
        setIsGenerating(true);
        setProofStatus('computing');
        onGeneratingChange?.(true);

        try {
            // Get standard valid inputs that pass the circuit assertion
            const inputs = await getValidMockInputs();

            const { proof, publicSignals } = await generateWithdrawProof(inputs);

            console.log("Proof Generated:", proof);
            setProofStatus('ready');
            // Trigger callback to parent or submit transaction logic here

        } catch (e) {
            console.error(e);
            setProofStatus('error');
        } finally {
            setIsGenerating(false);
            onGeneratingChange?.(false);

            // Reset status after a delay
            setTimeout(() => setProofStatus('idle'), 3000);
        }
    };

    return (
        <GlassCard variant="default" className="p-4 border-l-2 border-purple-500 bg-purple-500/5 backdrop-blur-md">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
                        ZK Privacy Layer
                        {proofStatus === 'computing' && <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />}
                    </h4>
                    <p className="text-[10px] text-gray-400 mt-1">
                        Generate zero-knowledge proof (Groth16) for anonymous withdrawal.
                    </p>
                </div>
                <div className="text-2xl text-purple-500/20">
                    👁️‍🗨️
                </div>
            </div>

            <button
                onClick={handleAnonymize}
                disabled={isGenerating}
                className={`w-full py-3 rounded-lg font-mono text-xs font-medium transition-all duration-300 relative overflow-hidden group ${isGenerating
                    ? "bg-purple-900/50 text-purple-200 cursor-wait"
                    : "bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 hover:text-purple-300 border border-purple-500/30 hover:shadow-[0_0_20px_rgba(168,85,247,0.2)]"
                    }`}
            >
                <span className="relative z-10 flex items-center justify-center gap-2">
                    {isGenerating ? (
                        <>
                            <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            COMPUTING PROOF...
                        </>
                    ) : (
                        proofStatus === 'ready' ? "PROOF READY ✓" : "GENERATE ANONYMOUS PROOF"
                    )}
                </span>
                {/* Progress Bar Background */}
                {isGenerating && (
                    <div className="absolute inset-0 bg-purple-600/20 w-full animate-pulse origin-left" />
                )}
            </button>

            {/* Circuit Info */}
            <div className="mt-3 flex justify-between items-center text-[9px] text-gray-500 font-mono">
                <span>Circuit: WithdrawProof.circom</span>
                <span>Depth: 20</span>
            </div>
        </GlassCard>
    );
};
