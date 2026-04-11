"use client";

import { motion, AnimatePresence } from "framer-motion";
import { DollarSign, Zap, ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";

interface PaymentStream {
    id: string;
    from: string;
    amount: string;
    asset: string;
    timestamp: Date;
    type: 'x402' | 'mpp';
}

export default function PaymentStreams() {
    const [streams, setStreams] = useState<PaymentStream[]>([]);
    const treasury = "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";

    useEffect(() => {
        const fetchRealStreams = async () => {
            try {
                // Fetch the latest 10 payments from Horizon for the treasury address
                const res = await fetch(`https://horizon-testnet.stellar.org/accounts/${treasury}/payments?order=desc&limit=10`);
                const data = await res.json();
                
                if (data?._embedded?.records) {
                    const realStreams: PaymentStream[] = data._embedded.records
                        .filter((tx: any) => tx.type === 'payment')
                        .map((tx: any) => {
                            // MORE ROBUST LOGIC: Check range to avoid precision issues
                            const val = parseFloat(tx.amount);
                            const isMpp = val > 0.04 && val < 0.06; 
                            
                            return {
                                id: tx.transaction_hash,
                                from: `${tx.from.substring(0, 6)}...${tx.from.slice(-4)}`,
                                amount: val.toFixed(3),
                                asset: tx.asset_type === 'native' ? 'XLM' : 'USDC',
                                timestamp: new Date(tx.created_at),
                                type: isMpp ? 'mpp' : 'x402'
                            };
                        });
                    
                    setStreams(realStreams.slice(0, 5));
                }
            } catch (error) {
                console.error("Error fetching real payment streams:", error);
            }
        };

        fetchRealStreams();
        const interval = setInterval(fetchRealStreams, 8000); // Pool every 8s

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-[#080808] border border-white/5 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-stellar-teal" />
                    <h2 className="text-sm font-bold uppercase tracking-widest text-white">Live Payment Streams</h2>
                </div>
                <div className="px-2 py-0.5 rounded bg-stellar-teal/10 text-stellar-teal text-[10px] font-mono border border-stellar-teal/20">
                    REAL-TIME
                </div>
            </div>

            <div className="space-y-4">
                <AnimatePresence initial={false}>
                    {streams.map((stream) => (
                        <motion.div
                            key={stream.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:border-stellar-teal/30 transition-all"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    stream.type === 'x402' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                                }`}>
                                    <DollarSign size={14} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-mono text-gray-400">{stream.from}</span>
                                    <span className="text-[10px] text-gray-600 uppercase tracking-tighter">
                                        via {stream.type.toUpperCase()} Protocol
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-sm font-black text-stellar-teal">+{stream.amount} {stream.asset}</span>
                                <ArrowUpRight size={10} className="text-stellar-teal" />
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {streams.length === 0 && (
                    <div className="py-12 text-center">
                        <p className="text-xs text-gray-500 italic">Waiting for agents to initiate transactions...</p>
                    </div>
                )}
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 flex justify-center">
                <span className="text-[10px] text-gray-600 uppercase tracking-[0.2em]">Matrix Settlement Engine Active</span>
            </div>
        </div>
    );
}
