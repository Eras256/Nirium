'use client';

import Navbar from "@/components/layout/Navbar";
import { AlertTriangle } from "lucide-react";

export default function RiskDisclosurePage() {
    return (
        <div className="min-h-screen pt-32 pb-12 px-4 md:px-8 relative bg-[#050505]">
            <Navbar />
            <div className="max-w-3xl mx-auto relative z-10 glass-panel p-8 md:p-12 rounded-2xl border border-red-500/20 text-gray-300 space-y-6 bg-red-900/5">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center border border-red-500/30">
                        <AlertTriangle className="text-red-500" />
                    </div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Algorithmic Risk Disclosure</h1>
                </div>

                <p className="font-mono text-sm uppercase text-red-500 font-bold border-l-2 border-red-500 pl-4 py-2 bg-red-500/5">
                    MANDATORY ACKNOWLEDGEMENT: You are using algorithmic, highly experimental open-source software.
                </p>

                <section className="space-y-4 pt-4">
                    <h2 className="text-xl font-bold text-white uppercase tracking-tight">1. Autonomous Execution Risks</h2>
                    <p className="text-sm leading-relaxed">
                        By delegating vault operations to AI agents or community-published strategy logic, you are authorizing
                        code to execute autonomous financial transactions on the Stellar network. While the Soroban smart
                        contracts utilize atomic, single-invocation wrappers ("Panic on loss" protection), systemic failures,
                        oracle manipulation, or extreme lack of liquidity can result in total loss of funds.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-bold text-white uppercase tracking-tight">2. Use At Your Own Risk</h2>
                    <p className="text-sm leading-relaxed">
                        Nirium does NOT take custody of your funds. All capital is stored in non-custodial Vault smart contracts
                        controlled by your cryptographic keys. As such, the developers, maintainers, and creators of Nirium
                        bear absolutely NO LIABILITY for any losses incurred.
                    </p>
                </section>

                <div className="mt-8 p-4 bg-white/5 border border-white/10 rounded-lg text-center">
                    <p className="text-xs uppercase tracking-widest text-gray-400">By connecting your wallet, you accept all risks outlined above.</p>
                </div>
            </div>
        </div>
    );
}
