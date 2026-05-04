"use client";

import { ShieldCheck, AlertCircle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function SecurityDisclaimer() {
    const { language } = useLanguage();
    const lang = (en: string, es: string, zh: string) =>
        language === "zh" ? zh : language === "es" ? es : en;

    return (
        <div className="w-full max-w-5xl mx-auto px-6 py-8">
            <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start md:items-center">
                <div className="p-3 rounded-xl bg-stellar-teal/10 border border-stellar-teal/20 shrink-0">
                    <ShieldCheck className="w-6 h-6 text-stellar-teal" />
                </div>
                <div className="flex-1">
                    <h3 className="text-sm font-black uppercase tracking-widest text-white mb-2 flex items-center gap-2">
                        JARGUS Security Disclosure
                        <span className="text-[10px] text-stellar-teal border border-stellar-teal/20 px-2 py-0.5 rounded-full">
                            VERIFIED
                        </span>
                    </h3>
                    <p className="text-white/50 text-xs leading-relaxed max-w-3xl">
                        {lang(
                            "This platform has undergone internal security verification using the JARGUS Automated Framework (78/78 security vectors passed). Formal external smart contract audit is scheduled for Q3 2026 as part of the SCF Build Award roadmap. Use only on Stellar Testnet.",
                            "Esta plataforma ha sido sometida a una verificación de seguridad interna utilizando el JARGUS Automated Framework (78/78 vectores de seguridad aprobados). La auditoría externa formal de los contratos inteligentes está programada para el tercer trimestre de 2026 como parte del roadmap del SCF Build Award. Úselo solo en Stellar Testnet.",
                            "该平台已使用 JARGUS 自动框架进行了内部安全验证（78/78 个安全向量已通过）。作为 SCF Build Award 路线图的一部分，正式的外部智能合约审计计划于 2026 年第三季度进行。仅在 Stellar 测试网上使用。"
                        )}
                    </p>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono text-white/30 whitespace-nowrap">
                    <AlertCircle className="w-3 h-3" />
                    {lang("TESTNET ONLY", "SOLO TESTNET", "仅限测试网")}
                </div>
            </div>
        </div>
    );
}
