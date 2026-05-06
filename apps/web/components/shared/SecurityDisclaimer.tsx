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
                        JARGUS Internal Security Audit
                        <span className="text-[10px] text-amber-400 border border-amber-400/20 px-2 py-0.5 rounded-full">
                            INTERNAL ONLY
                        </span>
                    </h3>
                    <p className="text-white/50 text-xs leading-relaxed max-w-3xl">
                        {lang(
                            "This platform has undergone internal security verification using the JARGUS Automated Framework (78/78 vectors passed). JARGUS is a proprietary self-assessment tool — it does not replace professional third-party audits from firms such as OpenZeppelin, Trail of Bits, Halborn, or CertiK. A formal external audit is required before mainnet. Testnet only.",
                            "Esta plataforma ha sido sometida a una verificación de seguridad interna mediante el JARGUS Automated Framework (78/78 vectores aprobados). JARGUS es una herramienta propietaria de autoevaluación — no reemplaza las auditorías profesionales de terceros de firmas como OpenZeppelin, Trail of Bits, Halborn o CertiK. Se requiere una auditoría externa formal antes del mainnet. Solo Testnet.",
                            "该平台已使用 JARGUS 自动框架进行内部安全验证（78/78 个向量通过）。JARGUS 是专有内部自评估工具，不能替代 OpenZeppelin、Trail of Bits、Halborn 或 CertiK 等机构的专业第三方审计。主网部署前须进行外部审计。仅限测试网。"
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
