"use client";

import { useState, useEffect } from "react";
import { signMessage } from "@stellar/freighter-api";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, ChevronRight, Scale, AlertTriangle, ExternalLink, Globe } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";

interface NiriumTermsProps {
    walletAddress: string | null;
}

export default function NiriumTermsModal({ walletAddress }: NiriumTermsProps) {
    const [hasSigned, setHasSigned] = useState<boolean>(true);
    const [isSigning, setIsSigning] = useState<boolean>(false);
    const { t, language, setLanguage } = useLanguage();

    useEffect(() => {
        if (!walletAddress) return;

        // Check localStorage first (fast, no server required)
        const localKey = `nirium-terms-signed-${walletAddress}`;
        const localSigned = localStorage.getItem(localKey);
        if (localSigned) {
            setHasSigned(true);
            return;
        }

        // Optionally try the server as a secondary check (but don't block on failure)
        fetch(`/api/legal/sign?wallet=${walletAddress}`)
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data?.hasSigned) {
                    setHasSigned(true);
                } else {
                    setHasSigned(false);
                }
            })
            .catch(() => {
                // Server unavailable \u2014 localStorage is authoritative
                setHasSigned(false);
            });
    }, [walletAddress]);

    const handleSignTerms = async () => {
        if (!walletAddress) return;
        setIsSigning(true);

        try {
            const message = "I accept Nirium Terms of Service & Risk Disclosure. Authorization ID: " + Date.now();
            const signed = await signMessage(message);

            if (!signed) throw new Error("Signature failed or was rejected");

            // Freighter devuelve string u objeto según versión — normalizamos a texto para la columna TEXT.
            const signatureHash = typeof signed === 'string' ? signed : JSON.stringify(signed);

            const signatureData = {
                wallet_address: walletAddress,
                signature_hash: signatureHash,
                message_signed: message,
                // FIJO a propósito, no lo cambies al selector de red: el legal shield
                // del agente consulta `network = 'stellar:testnet'` literal
                // (packages/agent/src/middleware/legalShield.ts). Escribir
                // 'stellar:pubnet' para usuarios de mainnet dejaría su firma
                // invisible para el agente → 403 LEGAL_CONSENT_REQUIRED. Si algún día
                // el consentimiento debe ser por red, hay que cambiar AMBOS lados.
                network: 'stellar:testnet',
                accepted_at: new Date().toISOString()
            };

            // El agente valida el consentimiento server-side contra la tabla user_signatures.
            // La persistencia en el backend es la fuente de verdad — el localStorage es solo cache.
            const res = await fetch('/api/legal/sign', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(signatureData)
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || `Consent could not be saved (HTTP ${res.status})`);
            }

            // Cache local para verificaciones de UI sin latencia en cargas posteriores.
            try {
                localStorage.setItem(`nirium-terms-signed-${walletAddress}`, JSON.stringify(signatureData));
            } catch (e) {
                console.warn('[Terms] Failed to cache signature in localStorage:', e);
            }

            setHasSigned(true);
        } catch (err: any) {
            console.error("Sign Error:", err);
            // We should notify the user why it failed
            if (typeof window !== 'undefined') {
                alert("Authorization Failed: " + (err.message || "Unknown error"));
            }
        } finally {
            setIsSigning(false);
        }
    };

    if (hasSigned || !walletAddress) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl overflow-y-auto">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="relative w-full max-w-lg bg-[#050505] border border-stellar-teal/30 rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(45,235,232,0.1)] my-auto"
                >
                    {/* Language Selector Overlay */}
                    <div className="absolute top-4 right-4 z-20 flex gap-2">
                        {['en', 'es'].map((lang) => (
                            <button
                                key={lang}
                                onClick={() => setLanguage(lang as any)}
                                className={`w-7 h-7 flex items-center justify-center rounded-lg text-[10px] font-black transition-all border ${language === lang
                                    ? 'bg-stellar-teal border-stellar-teal text-black'
                                    : 'bg-white/5 border-white/10 text-gray-500 hover:border-stellar-teal/50'
                                    }`}
                            >
                                {lang.toUpperCase()}
                            </button>
                        ))}
                    </div>

                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-stellar-teal to-transparent opacity-30" />

                    <div className="p-6 md:p-8">
                        {/* Header */}
                        <div className="mb-6 pr-20">
                            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-stellar-teal/10 border border-stellar-teal/20 text-stellar-teal text-[9px] font-black tracking-widest uppercase mb-3">
                                <Shield className="w-3 h-3" />
                                {t.legal_modal.consent_required}
                            </div>
                            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tighter leading-[0.9] italic uppercase">
                                {t.legal_modal.title.replace(':', '').split(' ').map((word, i) => (
                                    <span key={i} className={i > 1 ? "text-stellar-teal block" : "mr-2"}>
                                        {word}
                                    </span>
                                ))}
                            </h2>
                        </div>

                        {/* Content Box */}
                        <div className="bg-[#080808] border border-white/5 rounded-2xl p-5 mb-6">
                            <p className="text-[11px] text-gray-500 font-mono mb-5 leading-relaxed border-l-2 border-stellar-teal/30 pl-3">
                                {t.legal_modal.acknowledge_prefix}
                            </p>

                            <ul className="space-y-3.5">
                                {[
                                    { icon: Scale, text: t.legal_modal.item_non_custodial },
                                    { icon: AlertTriangle, text: t.legal_modal.item_elo_historical },
                                    { icon: Shield, text: t.legal_modal.item_systemic_risk },
                                    { icon: ExternalLink, text: t.legal_modal.item_liability },
                                    { icon: Globe, text: t.legal_modal.item_scf_coc }
                                ].map((item, idx) => (
                                    <li key={idx} className="flex items-start gap-3.5 group">
                                        <div className="mt-0.5 w-4 h-4 rounded bg-white/5 flex items-center justify-center text-stellar-teal shrink-0 group-hover:bg-stellar-teal group-hover:text-black transition-all">
                                            <item.icon size={10} />
                                        </div>
                                        <p className="text-[11px] md:text-xs text-gray-400 font-medium leading-relaxed group-hover:text-white transition-colors">
                                            {item.text}
                                        </p>
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-5 pt-5 border-t border-white/5 flex items-center justify-between">
                                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                                    {t.legal_modal.terms_link} & {t.legal_modal.risk_link}
                                </div>
                                <div className="flex gap-3">
                                    <Link href="/terms" target="_blank" className="text-stellar-teal hover:text-white transition-colors">
                                        <ExternalLink size={12} />
                                    </Link>
                                    <Link href="/risk-disclosure" target="_blank" className="text-stellar-teal hover:text-white transition-colors">
                                        <Scale size={12} />
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Action Area */}
                        <div className="space-y-4">
                            <button
                                onClick={handleSignTerms}
                                disabled={isSigning}
                                className="w-full py-4 bg-stellar-teal text-[#0b0b0b] font-black text-xs tracking-widest rounded-xl hover:translate-y-[-2px] active:translate-y-[0px] shadow-[0_4px_20px_rgba(45,235,232,0.2)] transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase flex items-center justify-center gap-2 group"
                            >
                                {isSigning ? (
                                    <>
                                        <div className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                        {t.legal_modal.button_signing}
                                    </>
                                ) : (
                                    <>
                                        {t.legal_modal.button_sign}
                                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>

                            <p className="text-[9px] text-center text-gray-600 font-black tracking-[0.2em] uppercase">
                                {t.legal_modal.governing_law}
                            </p>
                        </div>
                    </div>

                    {/* Decorative Background Icon */}
                    <div className="absolute -bottom-6 -right-6 opacity-[0.03] pointer-events-none">
                        <Shield size={200} className="text-white" />
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
