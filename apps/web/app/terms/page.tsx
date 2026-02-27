'use client';

import Navbar from "@/components/layout/Navbar";

export default function TermsPage() {
    return (
        <div className="min-h-screen pt-32 pb-12 px-4 md:px-8 relative bg-[#050505]">
            <Navbar />
            <div className="max-w-3xl mx-auto relative z-10 glass-panel p-8 md:p-12 rounded-2xl border border-white/10 text-gray-300 space-y-6">
                <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-8">Terms of Service</h1>
                <p className="font-mono text-xs uppercase text-stellar-teal">Last Updated: February 2026</p>

                <section className="space-y-4">
                    <h2 className="text-xl font-bold text-white uppercase tracking-tight">1. Open Source Framework</h2>
                    <p className="text-sm leading-relaxed">
                        Nirium is a set of open-source Soroban smart contracts deployed on the Stellar network.
                        The interface provided here is merely a client explicitly interacting with decentralized
                        protocols. By using this interface, you understand you are interacting with public
                        blockchain infrastructure.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-bold text-white uppercase tracking-tight">2. No Financial Guarantees</h2>
                    <p className="text-sm leading-relaxed">
                        The strategies, plugins, and autonomous agents available via Nirium are created by the community
                        and rank entirely via the Sentinel ELO system. ELO rankings are historical data only and do not
                        predict or guarantee future performance or financial outcomes.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-bold text-white uppercase tracking-tight">3. Network Fees & Matrix Fee</h2>
                    <p className="text-sm leading-relaxed">
                        Users are responsible for all Stellar network operation fees. Additionally, by executing strategies
                        through Nirium's algorithmic smart contracts, you agree to the 1% Protocol Matrix Fee. This fee is
                        deducted atomically only from realized gross profit, not principal, as enforced by the smart contract code.
                    </p>
                </section>
            </div>
        </div>
    );
}
