'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { GlassCard, GlassCardHeader, GlassCardContent } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { useNiriumContracts } from '@/hooks/useNiriumContracts';
import { Asset, Networks, nativeToScVal, scValToBigInt } from '@stellar/stellar-sdk';

export const TreasuryView = () => {
    // State for treasury metrics
    const [workingCapital, setWorkingCapital] = useState<number>(0);
    const [totalYield, setTotalYield] = useState<number>(0);
    const [isAdmin, setIsAdmin] = useState<boolean>(true); // Default true for demo
    const [status, setStatus] = useState<'idle' | 'sweeping' | 'active'>('active');

    const { queryContract, contracts } = useNiriumContracts();

    // Fetch Real Data
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Native XLM Contract Address
                const tokenAddr = Asset.native().contractId(Networks.TESTNET);

                // Query Sentinel
                // get_working_capital(token)
                const capitalSc = await queryContract(contracts.SENTINEL, 'get_working_capital', [
                    nativeToScVal(tokenAddr, { type: 'address' })
                ]);

                // get_total_swept()
                const sweptSc = await queryContract(contracts.SENTINEL, 'get_total_swept');

                // Parse (XLM has 7 decimals)
                const capital = Number(scValToBigInt(capitalSc)) / 1e7;
                const swept = Number(scValToBigInt(sweptSc)) / 1e7;

                setWorkingCapital(capital);
                setTotalYield(swept);
            } catch (err) {
                console.warn("Failed to fetch Sentinel data (using mock):", err);
                // Fallback / Mock
                setWorkingCapital(1250);
                setTotalYield(45.2);
            }
        };

        if (contracts.SENTINEL) {
            fetchData();
            const interval = setInterval(fetchData, 10000); // 10s Poll
            return () => clearInterval(interval);
        }
    }, [queryContract, contracts]);

    const handleSweep = () => {
        setStatus('sweeping');
        // TODO: Implement actual sweep helper in hooks
        setTimeout(() => setStatus('active'), 2000);
    };

    return (
        <GlassCard variant="glow" size="lg" className="h-full relative overflow-hidden group">
            {/* Ambient Background Glow */}
            <div className={`absolute inset-0 bg-gradient-to-br transition-opacity duration-1000 opacity-20 pointer-events-none
                ${status === 'sweeping' ? 'from-purple-500/30 to-blue-500/30' : 'from-blue-500/10 to-transparent'}
            `} />

            <GlassCardHeader
                title="Sentinel Vault"
                subtitle="Active Treasury Management"
                icon={
                    <motion.span
                        animate={status === 'sweeping' ? { rotate: 360 } : {}}
                        transition={status === 'sweeping' ? { duration: 2, repeat: Infinity, ease: "linear" } : {}}
                        className="text-blue-400 inline-block"
                    >
                        💠
                    </motion.span>
                }
            />

            <GlassCardContent>
                <div className="flex flex-col h-full justify-between">
                    {/* Main Metrics */}
                    <div className="space-y-6">
                        <div>
                            <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Working Capital</p>
                            <div className="flex items-baseline gap-2">
                                <motion.span
                                    key={workingCapital}
                                    initial={{ opacity: 0.5 }}
                                    animate={{ opacity: 1 }}
                                    className="text-4xl lg:text-5xl font-bold text-white font-mono tracking-tighter"
                                >
                                    {workingCapital.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                </motion.span>
                                <span className="text-sm text-blue-400 font-medium">XLM</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                                <p className="text-[10px] text-white/40 uppercase">Total Yield Swept</p>
                                <p className="text-lg font-semibold text-green-400">
                                    +{totalYield.toLocaleString()} XLM
                                </p>
                            </div>
                            <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                                <p className="text-[10px] text-white/40 uppercase">APY (Est.)</p>
                                <p className="text-lg font-semibold text-purple-400">
                                    4.85%
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="mt-8 space-y-3">
                        {isAdmin && (
                            <GlassButton
                                variant={status === 'sweeping' ? 'secondary' : 'primary'}
                                fullWidth
                                onClick={handleSweep}
                                disabled={status === 'sweeping'}
                                className="relative overflow-hidden"
                            >
                                {status === 'sweeping' ? (
                                    <span className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                                        Sweeping via Soroswap...
                                    </span>
                                ) : (
                                    "Execute Yield Sweep"
                                )}
                            </GlassButton>
                        )}

                        <div className="flex justify-between items-center text-[10px] text-white/30 font-mono">
                            <span title={contracts.SENTINEL}>
                                Contract: {contracts.SENTINEL ? `${contracts.SENTINEL.substring(0, 6)}...${contracts.SENTINEL.slice(-4)}` : 'Loading'}
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                Testnet Active
                            </span>
                        </div>
                    </div>
                </div>
            </GlassCardContent>
        </GlassCard>
    );
};
