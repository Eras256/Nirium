"use client";

import { ShieldCheck, AlertCircle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function SecurityDisclaimer() {
    const { language } = useLanguage();
    const lang = (en: string, es: string) =>
        language === "es" ? es : en;

    return (
        <div className="w-full max-w-5xl mx-auto px-6 py-8">
            <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start md:items-center">
                <div className="p-3 rounded-xl bg-stellar-teal/10 border border-stellar-teal/20 shrink-0">
                    <ShieldCheck className="w-6 h-6 text-stellar-teal" />
                </div>
                <div className="flex-1">
                    <h3 className="text-sm font-black uppercase tracking-widest text-white mb-2 flex items-center gap-2">
                        {lang("Security Status", "Estado de Seguridad")}
                    </h3>
                    <p className="text-white/50 text-xs leading-relaxed max-w-3xl">
                        {lang(
                            "Non-custodial nodes (settlement, payouts, audit, reporting) run on mainnet without holding funds. The treasury vault has not yet undergone a formal third-party audit and remains testnet-only until one is completed.",
                            "Los nodos non-custodial (liquidación, payouts, auditoría, reportería) corren en mainnet sin custodiar fondos. El vault de tesorería todavía no ha sido sometido a una auditoría formal de un tercero y permanece solo-testnet hasta que se complete una."
                        )}
                    </p>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono text-white/30 whitespace-nowrap">
                    <AlertCircle className="w-3 h-3" />
                    {lang("VAULT: TESTNET ONLY", "VAULT: SOLO TESTNET")}
                </div>
            </div>
        </div>
    );
}
