"use client";

import { AlertTriangle, Check, X, Radio } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

// Confirmación al pasar a mainnet. Solo se muestra en esa dirección: volver a
// testnet no arriesga nada y pedir confirmación para lo seguro entrena a la
// gente a aceptar sin leer.
//
// La tabla NO es decorativa — cada fila corresponde a una diferencia real de
// configuración entre Box A (nirium-agent) y Box B (nirium-agent-mainnet),
// no a un flag de UI. Ver `fly.mainnet.toml`.

type Props = {
    open: boolean;
    onConfirm: () => void;
    onCancel: () => void;
};

export default function NetworkSwitchModal({ open, onConfirm, onCancel }: Props) {
    const { language } = useLanguage();
    const lang = (en: string, es: string) =>
        language === "es" ? es : en;

    if (!open) return null;

    const yes = <Check className="w-3.5 h-3.5 text-emerald-400 mx-auto" aria-hidden />;
    const no = <X className="w-3.5 h-3.5 text-white/25 mx-auto" aria-hidden />;

    const rows: { label: string; testnet: React.ReactNode; mainnet: React.ReactNode }[] = [
        {
            label: lang("Settlement — x402 + MPP Charge", "Liquidación — x402 + MPP Charge"),
            testnet: yes,
            mainnet: (
                <span className="text-[10px] font-bold text-emerald-400">
                    {lang("real USDC", "USDC real")}
                </span>
            ),
        },
        {
            label: lang("Audit anchoring (IPFS)", "Anclaje de auditoría (IPFS)"),
            testnet: yes,
            mainnet: yes,
        },
        {
            label: lang("Reporting", "Reportería"),
            testnet: yes,
            mainnet: yes,
        },
        {
            label: lang("Payouts — self-custody batch", "Payouts — lote self-custody"),
            testnet: (
                <span className="text-[10px] font-bold text-white/50">
                    {lang("open", "abierto")}
                </span>
            ),
            mainnet: (
                <span className="text-[10px] font-bold text-amber-400">
                    {lang("invite-only", "por invitación")}
                </span>
            ),
        },
        {
            label: lang(
                "Treasury vault + autonomous rebalance",
                "Vault de tesorería + rebalanceo autónomo"),
            testnet: (
                <span className="text-[10px] font-bold text-emerald-400">
                    {lang("live 24/7", "vivo 24/7")}
                </span>
            ),
            // Dejó de ser "espera auditoría" el 5-ago: la tesorería autónoma
            // corre en mainnet sobre una bóveda DeFindex del cliente —contrato
            // ajeno ya auditado— y lo que sigue esperando auditoría es
            // NiriumVault, que es otra cosa. Confundirlas subvalora lo único
            // que de verdad está corriendo con dinero real.
            mainnet: (
                <span className="text-[10px] font-bold text-amber-400">
                    {lang("live · invite-only", "vivo · por invitación")}
                </span>
            ),
        },
        {
            label: lang("Agent signing key in the box", "Llave firmante del agente en el box"),
            testnet: (
                <span className="text-[10px] font-bold text-white/50">
                    {lang("yes", "sí")}
                </span>
            ),
            mainnet: (
                <span className="text-[10px] font-bold text-emerald-400">
                    {lang("none", "ninguna")}
                </span>
            ),
        },
    ];

    return (
        <div
            className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="network-switch-title"
        >
            <div className="w-full max-w-lg my-auto rounded-2xl border border-amber-400/30 bg-[#0A0A0A] shadow-2xl">
                <div className="flex items-center gap-4 p-6 border-b border-amber-400/20">
                    <div className="p-2.5 rounded-full bg-amber-400/10 border border-amber-400/30 shrink-0">
                        <AlertTriangle className="w-5 h-5 text-amber-400" aria-hidden />
                    </div>
                    <h2 id="network-switch-title" className="text-lg font-black tracking-tight text-white">
                        {lang("Switch to Mainnet?", "¿Cambiar a Mainnet?")}
                    </h2>
                </div>

                <div className="p-6 space-y-5">
                    <p className="text-sm text-white/60 leading-relaxed">
                        {lang(
                            "You're about to point the console at real Stellar mainnet data. Settlement and audit anchoring there move real USDC, signed by your own wallet — Nirium never holds it. The autonomous treasury runs on mainnet over a DeFindex vault you own — invite-only while a legal review closes. Nirium's own NiriumVault stays on testnet until an external audit.",
                            "Estás por apuntar la consola a datos reales de Stellar mainnet. La liquidación y el anclaje de auditoría ahí mueven USDC real, firmado por tu propia wallet — Nirium nunca lo custodia. La tesorería autónoma corre en mainnet sobre una bóveda DeFindex que tú posees — por invitación mientras cierra la revisión legal. NiriumVault, el contrato propio de Nirium, se queda en testnet hasta una auditoría externa.")}
                    </p>

                    <div className="rounded-xl border border-white/10 overflow-hidden">
                        <div className="grid grid-cols-[1fr_auto_auto] text-[9px] font-mono uppercase tracking-widest bg-white/[0.03] border-b border-white/10">
                            <div className="px-3 py-2 text-white/40">{lang("Node", "Nodo")}</div>
                            <div className="px-3 py-2 text-amber-400/70 text-center w-20">Testnet</div>
                            <div className="px-3 py-2 text-emerald-400/70 text-center w-24">Mainnet</div>
                        </div>
                        {rows.map((r) => (
                            <div
                                key={r.label}
                                className="grid grid-cols-[1fr_auto_auto] items-center border-b border-white/5 last:border-0"
                            >
                                <div className="px-3 py-2.5 text-[11px] text-white/70 leading-snug">{r.label}</div>
                                <div className="px-3 py-2.5 text-center w-20">{r.testnet}</div>
                                <div className="px-3 py-2.5 text-center w-24">{r.mainnet}</div>
                            </div>
                        ))}
                    </div>

                    {/* El feed sale de una tabla de Supabase compartida por los dos
                        boxes, así que no se filtra por red — decirlo evita que un
                        hash de testnet en mainnet se lea como error. */}
                    <div className="flex gap-3 items-start rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
                        <Radio className="w-3.5 h-3.5 text-stellar-teal shrink-0 mt-0.5" aria-hidden />
                        <p className="text-[11px] text-white/50 leading-relaxed">
                            {lang(
                                "The audit feed is shared across both networks — you'll see entries from each, and every transaction hash resolves on the explorer for the network it was written on.",
                                "El feed de auditoría se comparte entre las dos redes — verás entradas de ambas, y cada hash de transacción resuelve en el explorador de la red en la que se escribió.")}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end p-6 border-t border-white/10">
                    <button
                        onClick={onCancel}
                        className="px-5 py-2.5 rounded-xl border border-white/15 text-sm font-bold text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                    >
                        {lang("Stay on Testnet", "Quedarme en Testnet")}
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-5 py-2.5 rounded-xl border border-amber-400/40 bg-amber-400/10 text-sm font-bold text-amber-400 hover:bg-amber-400/20 transition-colors"
                    >
                        {lang("Switch to Mainnet", "Cambiar a Mainnet")}
                    </button>
                </div>
            </div>
        </div>
    );
}
