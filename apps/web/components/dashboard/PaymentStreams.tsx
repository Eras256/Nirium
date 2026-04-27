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

import { useLanguage } from "@/context/LanguageContext";

export default function PaymentStreams() {
    const { t } = useLanguage();
    const [streams, setStreams] = useState<PaymentStream[]>([]);
    const treasury = "GC4Q5TWWXI7IHN6DYCBEKCOWJWCKY4JE2NLKLU5SE3YL44IUUFPKUOPC";

    useEffect(() => {
        const fetchRealStreams = async () => {
            try {
                const res = await fetch(`https://horizon-testnet.stellar.org/accounts/${treasury}/operations?order=desc&limit=20&ts=${Date.now()}`);
                const data = await res.json();
                
                if (data?._embedded?.records) {
                    const realStreams: PaymentStream[] = data._embedded.records
                        .filter((tx: any) => tx.type === 'payment' || tx.type === 'invoke_host_function')
                        .map((tx: any) => {
                            let amountStr = tx.amount;
                            let fromAddr = tx.from || 'Contract';

                            if (tx.type === 'invoke_host_function' && tx.asset_balance_changes) {
                                const change = tx.asset_balance_changes.find((c: any) => c.to === treasury);
                                if (change) {
                                    amountStr = change.amount;
                                    fromAddr = change.from || fromAddr;
                                }
                            }

                            if (!amountStr) return null;

                            const val = parseFloat(amountStr);
                            const isUsdc = (tx.asset_type === 'credit_alphanum4' && tx.asset_code === 'USDC') || tx.type === 'invoke_host_function'; 
                            
                            // Institutional tiers: 0.02 (Signals), 0.05 (Market Data), 0.25 (Execution)
                            // We use small ranges to avoid floating point strictness issues
                            const isSignals = val > 0.015 && val < 0.025;
                            const isMarketData = val > 0.045 && val < 0.055;
                            const isExecution = val > 0.24 && val < 0.26;
                            const isMppSettlement = val > 0.9 && val < 1.1; 
                            
                            const isProtocol = isSignals || isMarketData || isExecution || isMppSettlement;
                            
                            if (!isProtocol) return null;

                            return {
                                id: tx.transaction_hash,
                                from: `${fromAddr.substring(0, 6)}...${fromAddr.slice(-4)}`,
                                amount: val.toFixed(isUsdc ? 2 : 3),
                                asset: isUsdc ? 'USDC' : 'XLM',
                                timestamp: new Date(tx.created_at),
                                type: isMppSettlement ? 'mpp' : 'x402'
                            };
                        })
                        .filter(Boolean) as PaymentStream[];
                    
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
                    <h2 className="text-sm font-bold uppercase tracking-widest text-white">{t.dashboard.payment_streams.title}</h2>
                </div>
                <div className="px-2 py-0.5 rounded bg-stellar-teal/10 text-stellar-teal text-[10px] font-mono border border-stellar-teal/20">
                    REAL-TIME
                </div>
            </div>

            <div className="space-y-4">
                <AnimatePresence initial={false}>
                    {streams.map((stream) => (
                        <motion.a
                            key={stream.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            href={`https://stellar.expert/explorer/testnet/tx/${stream.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:border-stellar-teal/30 hover:bg-white/10 transition-all cursor-pointer group"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    stream.type === 'x402' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                                }`}>
                                    <DollarSign size={14} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-mono text-gray-400 group-hover:text-white transition-colors">{stream.from}</span>
                                    <span className="text-[10px] text-gray-600 uppercase tracking-tighter">
                                        via {stream.type.toUpperCase()} Protocol
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-sm font-black text-stellar-teal">+{stream.amount} {stream.asset}</span>
                                <ArrowUpRight size={10} className="text-stellar-teal group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            </div>
                        </motion.a>
                    ))}
                </AnimatePresence>

                {streams.length === 0 && (
                    <div className="py-12 text-center">
                        <p className="text-xs text-gray-500 italic">{t.dashboard.payment_streams.waiting}</p>
                    </div>
                )}
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 flex justify-center">
                <span className="text-[10px] text-gray-600 uppercase tracking-[0.2em]">{t.dashboard.payment_streams.engine_active}</span>
            </div>
        </div>
    );
}
