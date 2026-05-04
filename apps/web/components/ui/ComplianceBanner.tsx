'use client';
import { Shield, Lock, Info, CheckCircle, Heart } from 'lucide-react';
import { useLanguage } from "@/context/LanguageContext";
import { motion } from "framer-motion";

export function ComplianceBanner() {
    const { t } = useLanguage();

    return (
        <div className="space-y-4 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: t.common.non_custodial, icon: Shield, color: 'text-stellar-teal' },
                    { label: t.common.institutional_grade, icon: Lock, color: 'text-stellar-yellow' },
                    { label: t.common.scf_7, icon: Heart, color: 'text-pink-400' },
                    { label: t.common.coc_compliant, icon: CheckCircle, color: 'text-green-400' },
                ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                        <item.icon size={12} className={item.color} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{item.label}</span>
                    </div>
                ))}
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-stellar-teal/5 border border-stellar-teal/20 rounded-xl p-4"
            >
                <div className="flex items-start gap-3">
                    <Info size={16} className="text-stellar-teal mt-0.5 shrink-0" />
                    <div className="space-y-1">
                        <p className="text-[10px] font-bold text-stellar-teal uppercase tracking-widest">
                            {t.compliance.regulatory_awareness}
                        </p>
                        <p className="text-[11px] text-gray-400 leading-relaxed font-medium">
                            {t.compliance.disclosure_text}
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

export function AtomicProofBadge({ txHash }: { txHash?: string }) {
    const { t } = useLanguage();
    if (!txHash) return null;

    return (
        <a 
            href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-green-500/10 border border-green-500/20 text-green-400 text-[8px] font-black uppercase tracking-widest hover:bg-green-500/20 transition-all"
        >
            <CheckCircle size={8} />
            Atomic Proof
        </a>
    );
}
