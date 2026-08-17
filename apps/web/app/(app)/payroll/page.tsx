"use client";

// ───────────────────────────────────────────────────────────────
// Payroll / Disbursement Node — operator console
//
// Fan-out one treasury to many employees in a single signed batch payment.
// Non-custodial: the agent builds the unsigned XDR from the CONNECTED wallet
// (the treasury/source), the company signs it in Freighter, and every settled
// run gets an IPFS receipt bound to LCP legal terms. Dual-network: testnet
// (Box A) por default; MAINNET early access (Box B) mueve fondos reales y
// exige aceptación explícita de los términos de payouts (gate 403 del agente).
// i18n via the shared dictionaries (en/es).
// ───────────────────────────────────────────────────────────────

import { useCallback, useEffect, useState } from "react";
import { useFreighter } from "@/hooks/useFreighter";
import { useLanguage } from "@/context/LanguageContext";

const PASSPHRASES = {
    testnet: "Test SDF Network ; September 2015",
    mainnet: "Public Global Stellar Network ; September 2015",
} as const;
type Net = keyof typeof PASSPHRASES;

type Recipient = { wallet: string; amount: string };
type ClientInfo = { legalName: string; taxId: string; repName: string };
type RecipientResult = { wallet: string; amount: string; status: "ok" | "skipped"; reason?: string };
type Receipt = { txHash?: string; explorer?: string; cid?: string; totalAmount?: string; recipientCount?: number };
type Run = {
    runId: string; asset: string; totalAmount: string; recipientCount: number;
    txHash?: string; explorer?: string; cid?: string;
};
type LegalDoc = {
    terms: string; atrHash?: string;
    disputeResolution?: { source?: string; clauseId?: string };
};

const shorten = (s: string, n = 6) => (s.length > n * 2 ? `${s.slice(0, n)}…${s.slice(-n)}` : s);
const ipfsUrl = (cid: string) => `https://gateway.pinata.cloud/ipfs/${cid}`;

async function signXdr(
    signTransaction: (xdr: string, opts?: any) => Promise<any>,
    xdr: string,
    address: string,
    passphrase: string,
): Promise<string> {
    // Pin the signer to the CONNECTED address: without this the wallet may sign
    // with whatever account is currently active, which won't match the tx source
    // (the treasury) → tx_bad_auth.
    const res = await signTransaction(xdr, { networkPassphrase: passphrase, address });
    const signed = typeof res === "string" ? res : (res as any).signedTxXdr;
    if (!signed) throw new Error("wallet returned no signed transaction");
    return signed;
}

export default function PayrollPage() {
    const { address, isConnected, connect, signTransaction, getAddress } = useFreighter();
    const { t, language } = useLanguage();
    const lang = (en: string, es: string) => (language === 'es' ? es : en);
    const p = t.payroll;

    const [asset, setAsset] = useState<"USDC" | "XLM">("USDC");
    const [network, setNetwork] = useState<Net>("testnet");
    // Blindaje legal: la corrida exige aceptación explícita de los términos
    // (el agente responde 403 sin acknowledgeTerms — en AMBAS redes).
    const [ackTerms, setAckTerms] = useState(false);
    // Identificación de cliente — solo mainnet, adelantada a LFPIORPI fracc. XVI
    // (vigente 17-ene-2027). El agente responde 403 sin ella en mainnet.
    const [clientInfo, setClientInfo] = useState<ClientInfo>({ legalName: "", taxId: "", repName: "" });
    const [memo, setMemo] = useState("");
    const [recipients, setRecipients] = useState<Recipient[]>([{ wallet: "", amount: "" }]);
    const [phase, setPhase] = useState<"idle" | "building" | "signing" | "submitting">("idle");
    const [error, setError] = useState<string | null>(null);
    const [skipped, setSkipped] = useState<RecipientResult[]>([]);
    const [receipt, setReceipt] = useState<Receipt | null>(null);

    const [onboardPhase, setOnboardPhase] = useState<"idle" | "working">("idle");
    const [onboardMsg, setOnboardMsg] = useState<string | null>(null);

    const [runs, setRuns] = useState<Run[]>([]);
    const [legal, setLegal] = useState<LegalDoc | null>(null);

    // LCP discovery — read our own published .well-known file (same origin).
    useEffect(() => {
        fetch("/.well-known/legal-context.json", { cache: "no-store" })
            .then((r) => (r.ok ? r.json() : null))
            .then((d) => setLegal(d))
            .catch(() => { /* not published yet — banner hidden */ });
    }, []);

    const loadRuns = useCallback(async () => {
        try {
            const r = await fetch(`/api/payroll/runs?network=${network}`, { cache: "no-store" });
            const d = await r.json();
            setRuns(Array.isArray(d.runs) ? d.runs : []);
        } catch { /* agent offline — leave list as-is */ }
    }, [network]);

    useEffect(() => { loadRuns(); }, [loadRuns]);

    const busy = phase !== "idle";
    const clientInfoComplete = Boolean(clientInfo.legalName.trim() && clientInfo.taxId.trim() && clientInfo.repName.trim());
    const total = recipients.reduce((s, r) => s + (Number(r.amount) || 0), 0);
    const filledCount = recipients.filter((r) => r.wallet && r.amount).length;

    const setRow = (i: number, key: keyof Recipient, val: string) =>
        setRecipients((rs) => rs.map((r, j) => (j === i ? { ...r, [key]: val } : r)));
    const addRow = () => setRecipients((rs) => [...rs, { wallet: "", amount: "" }]);
    const removeRow = (i: number) => setRecipients((rs) => rs.length > 1 ? rs.filter((_, j) => j !== i) : rs);

    const actionLabel =
        phase === "building" ? p.actions.building
            : phase === "signing" ? p.actions.signing
                : phase === "submitting" ? p.actions.settling
                    : p.actions.buildSign;

    async function runPayroll() {
        setError(null); setSkipped([]); setReceipt(null);
        if (!isConnected || !address) { await connect(); return; }
        const clean = recipients
            .map((r) => ({ wallet: r.wallet.trim(), amount: r.amount.trim() }))
            .filter((r) => r.wallet && r.amount);
        if (clean.length === 0) { setError(p.errors.needRecipient); return; }
        if (!ackTerms) { setError(p.errors.needTerms); return; }
        if (network === "mainnet" && !clientInfoComplete) { setError(p.errors.needClientInfo); return; }

        try {
            setPhase("building");
            // The treasury (tx source) is the connected account. If the wallet has
            // since switched to a different active account, signing would use that
            // account → tx_bad_auth. Guard explicitly instead of failing cryptically.
            const active = await getAddress();
            if (active && active !== address) { setPhase("idle"); setError(p.errors.accountMismatch); return; }
            const built = await fetch("/api/payroll/run", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    walletAddress: address, recipients: clean, asset, memo: memo || undefined, network, acknowledgeTerms: ackTerms,
                    clientInfo: network === "mainnet" ? clientInfo : undefined,
                }),
            }).then((r) => r.json());
            if (built.error) throw new Error(built.error);

            const dropped: RecipientResult[] = (built.recipients || []).filter((r: RecipientResult) => r.status === "skipped");
            setSkipped(dropped);
            if (!built.xdr) { setPhase("idle"); setError(p.errors.noPayable); return; }

            setPhase("signing");
            const signedXdr = await signXdr(signTransaction, built.xdr, address, PASSPHRASES[network]);

            setPhase("submitting");
            const settled = await fetch("/api/payroll/submit", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ walletAddress: address, runId: built.runId, signedXdr, network }),
            }).then((r) => r.json());
            if (settled.error) throw new Error(settled.error);

            setReceipt({
                txHash: settled.txHash, explorer: settled.explorer, cid: settled.cid,
                totalAmount: settled.totalAmount, recipientCount: settled.recipientCount,
            });
            loadRuns();
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e));
        } finally {
            setPhase("idle");
        }
    }

    async function onboardWorker() {
        setOnboardMsg(null);
        if (!isConnected || !address) { await connect(); return; }
        try {
            setOnboardPhase("working");
            // Self-service: add the USDC trustline to the CONNECTED account (it signs
            // its own changeTrust — one signature). Guard against a wallet account
            // switch so we don't sign with the wrong account (tx_bad_auth).
            const active = await getAddress();
            if (active && active !== address) { setOnboardMsg(p.errors.accountMismatch); return; }
            const built = await fetch("/api/payroll/onboard", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ walletAddress: address, employee: address, network }),
            }).then((r) => r.json());
            if (built.error) throw new Error(built.error);
            if (built.status === "skipped") { setOnboardMsg(`${built.reason}`); return; }
            if (!built.xdr) throw new Error("agent did not return a transaction to sign");

            const signedXdr = await signXdr(signTransaction, built.xdr, address, PASSPHRASES[network]);
            const settled = await fetch("/api/payroll/onboard/submit", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ walletAddress: address, signedXdr, network }),
            }).then((r) => r.json());
            if (settled.error) throw new Error(settled.error);
            setOnboardMsg(`✅ TX ${shorten(settled.txHash || "", 5)}`);
        } catch (e) {
            setOnboardMsg(e instanceof Error ? e.message : String(e));
        } finally {
            setOnboardPhase("idle");
        }
    }

    return (
        <main className="min-h-screen bg-black text-white">
            <div className="max-w-3xl mx-auto px-6 py-14">
                {/* Header */}
                <p className="font-mono text-xs tracking-[0.18em] text-stellar-teal uppercase mb-3">
                    {p.eyebrow}
                </p>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">{p.title}</h1>
                <p className="text-white/50 mb-6 max-w-xl">{p.subtitle}</p>
                <div className="flex flex-wrap gap-2 mb-5 font-mono text-[11px]">
                    {[p.badges.nonCustodial, p.badges.batch, p.badges.ipfs, p.badges.lcp, network === "mainnet" ? p.badges.mainnet : p.badges.testnet].map((b) => (
                        <span key={b} className="px-2.5 py-1 rounded-full border border-white/10 text-white/60">{b}</span>
                    ))}
                </div>

                {/* Precio — LICENCIA MENSUAL POR CAPACIDAD, $0 durante la Beta.
                    Era "por destinatario" y contradecía los propios términos que
                    el cliente acepta dos recuadros más abajo (§9: nunca un cargo
                    por pago). Cobrar por pago procesado es como cobra un
                    procesador de pagos, y la tesis entera es que no lo somos. */}
                <div className="mb-6 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
                    <p className="text-[11px] font-mono uppercase tracking-widest text-white/40 mb-2">{p.pricing.label}</p>
                    <div className="flex flex-wrap gap-x-6 gap-y-1 font-mono text-[11px] text-white/60">
                        <span><span className="text-stellar-teal font-bold">$99</span>{p.pricing.tier1}</span>
                        <span><span className="text-stellar-teal font-bold">$249</span>{p.pricing.tier2}</span>
                    </div>
                    <p className="text-[11px] text-white/35 mt-2 leading-relaxed">{p.pricing.note}</p>
                </div>

                {/* LCP legal context — published discovery file */}
                {legal && (
                    <div className="mb-10 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px] text-white/50">
                        <span className="text-stellar-teal">{p.legal.label}</span>
                        <a href={legal.terms} target="_blank" rel="noreferrer"
                            className="underline decoration-white/20 hover:text-white/85">{p.legal.terms}</a>
                        {legal.atrHash && (
                            <span title={legal.atrHash}>atrHash&nbsp;{legal.atrHash.replace("sha-256:", "").slice(0, 10)}…</span>
                        )}
                        {legal.disputeResolution?.source && <span>{p.legal.dispute}&nbsp;·&nbsp;{legal.disputeResolution.source}</span>}
                    </div>
                )}

                {/* Wallet */}
                <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-4">
                    <div>
                        <p className="text-[11px] uppercase tracking-widest text-white/40 mb-1">{p.wallet.signer}</p>
                        <code className="text-sm font-mono text-white/80">
                            {isConnected && address ? shorten(address, 7) : p.wallet.notConnected}
                        </code>
                    </div>
                    {!isConnected && (
                        <button onClick={connect}
                            className="w-full sm:w-auto h-10 px-5 rounded-full bg-white text-black font-bold text-sm hover:bg-stellar-yellow transition-all uppercase tracking-tight">
                            {p.wallet.connect}
                        </button>
                    )}
                </div>

                {/* Batch payout */}
                <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 mb-8">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-lg font-bold">{p.batch.title}</h2>
                        <div className="flex items-center gap-2">
                        <div className="flex rounded-full border border-white/10 p-0.5 font-mono text-xs">
                            {(["testnet", "mainnet"] as const).map((n) => (
                                <button key={n} onClick={() => { setNetwork(n); setReceipt(null); setError(null); }}
                                    className={`px-3 py-1 rounded-full transition-colors uppercase ${network === n ? (n === "mainnet" ? "bg-emerald-400 text-[#0b0b0b] font-bold" : "bg-amber-400 text-[#0b0b0b] font-bold") : "text-white/50"}`}>
                                    {n === "mainnet" ? p.network.mainnet : p.network.testnet}
                                </button>
                            ))}
                        </div>
                        <div className="flex rounded-full border border-white/10 p-0.5 font-mono text-xs">
                            {(["USDC", "XLM"] as const).map((a) => (
                                <button key={a} onClick={() => setAsset(a)}
                                    className={`px-3 py-1 rounded-full transition-colors ${asset === a ? "bg-stellar-teal text-[#0b0b0b] font-bold" : "text-white/50"}`}>
                                    {a}
                                </button>
                            ))}
                        </div>
                        </div>
                    </div>

                    {network === "mainnet" && (
                        <>
                        <p className="mb-4 rounded-lg border border-emerald-400/20 bg-emerald-400/[0.05] px-3 py-2 font-mono text-[11px] text-emerald-300/90">
                            {p.badges.mainnet} · {p.network.freighterHint}
                        </p>
                        <p className="mb-4 rounded-lg border border-amber-400/20 bg-amber-400/[0.05] px-3 py-2 font-mono text-[11px] text-amber-300/90">
                            {p.network.privateAccessNote}
                        </p>
                        <div className="mb-5 rounded-lg border border-white/10 bg-white/[0.02] p-4">
                            <p className="text-xs font-mono text-white/60 mb-3">{p.clientInfo.title}</p>
                            <p className="text-[11px] text-white/40 mb-3 leading-relaxed">{p.clientInfo.note}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <input value={clientInfo.legalName} onChange={(e) => setClientInfo((c) => ({ ...c, legalName: e.target.value }))}
                                    placeholder={p.clientInfo.legalNamePlaceholder}
                                    className="h-10 px-3 rounded-lg bg-black border border-white/10 font-mono text-sm text-white/90 placeholder:text-white/25 focus:border-stellar-teal/60 outline-none" />
                                <input value={clientInfo.taxId} onChange={(e) => setClientInfo((c) => ({ ...c, taxId: e.target.value }))}
                                    placeholder={p.clientInfo.taxIdPlaceholder}
                                    className="h-10 px-3 rounded-lg bg-black border border-white/10 font-mono text-sm text-white/90 placeholder:text-white/25 focus:border-stellar-teal/60 outline-none" />
                                <input value={clientInfo.repName} onChange={(e) => setClientInfo((c) => ({ ...c, repName: e.target.value }))}
                                    placeholder={p.clientInfo.repNamePlaceholder}
                                    className="h-10 px-3 rounded-lg bg-black border border-white/10 font-mono text-sm text-white/90 placeholder:text-white/25 focus:border-stellar-teal/60 outline-none" />
                            </div>
                        </div>
                        </>
                    )}

                    <div className="space-y-2 mb-3">
                        {recipients.map((r, i) => (
                            <div key={i} className="flex flex-col sm:flex-row gap-2">
                                <div className="flex-1 flex gap-2">
                                    <input value={r.wallet} onChange={(e) => setRow(i, "wallet", e.target.value)}
                                        placeholder={p.batch.walletPlaceholder}
                                        className="flex-1 min-w-0 h-11 px-3 rounded-lg bg-black border border-white/10 font-mono text-sm text-white/90 placeholder:text-white/25 focus:border-stellar-teal/60 outline-none" />
                                </div>
                                <div className="flex gap-2">
                                    <input value={r.amount} onChange={(e) => setRow(i, "amount", e.target.value)}
                                        inputMode="decimal" placeholder="0.00"
                                        className="flex-1 sm:w-28 sm:flex-none h-11 px-3 rounded-lg bg-black border border-white/10 font-mono text-sm text-right text-white/90 placeholder:text-white/25 focus:border-stellar-teal/60 outline-none" />
                                    <button onClick={() => removeRow(i)} disabled={recipients.length === 1}
                                        className="w-11 h-11 shrink-0 rounded-lg border border-white/10 text-white/40 hover:text-white/80 hover:border-white/25 disabled:opacity-30 transition-colors">
                                        ✕
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button onClick={addRow}
                        className="text-xs font-mono text-stellar-teal/80 hover:text-stellar-teal transition-colors mb-5">
                        {p.batch.add}
                    </button>

                    <input value={memo} onChange={(e) => setMemo(e.target.value)} maxLength={28}
                        placeholder={p.batch.memoPlaceholder}
                        className="w-full h-11 px-3 mb-5 rounded-lg bg-black border border-white/10 font-mono text-sm text-white/90 placeholder:text-white/25 focus:border-stellar-teal/60 outline-none" />

                    <label className="flex items-start gap-2.5 mb-5 cursor-pointer select-none">
                        <input type="checkbox" checked={ackTerms} onChange={(e) => setAckTerms(e.target.checked)}
                            className="mt-0.5 h-4 w-4 shrink-0 accent-[#00d4aa]" />
                        <span className="text-xs text-white/55 leading-relaxed">
                            {p.terms.accept}{" "}
                            <a href="/legal/payouts-terms-v1.md" target="_blank" rel="noreferrer"
                                className="underline decoration-white/25 text-white/70 hover:text-stellar-teal">{p.terms.link} ↗</a>
                            {" · "}
                            <a href="/legal/restricted-jurisdictions-v1.md" target="_blank" rel="noreferrer"
                                className="underline decoration-white/25 text-white/70 hover:text-stellar-teal">
                                {lang('Restricted Jurisdictions & Sanctions Policy', 'Política de Jurisdicciones Restringidas y Sanciones')} ↗
                            </a>
                        </span>
                    </label>

                    {/* La representación del usuario es la protección jurídica REAL — el
                        bloqueo por IP se salta con una VPN, una declaración no. Va junto al
                        botón que construye la corrida, no enterrada en un PDF, porque una
                        declaración que nadie leyó no declara nada. */}
                    <p className="text-[11px] text-white/35 leading-relaxed mb-5 -mt-3">
                        {lang(
                            'By continuing you represent, on this and every occasion of use, that you are not located in or a resident of a prohibited jurisdiction, that you are not a sanctioned person or acting for one, and that Payouts is not offered where you are (today this excludes the EEA, the UK and the US). Nirium relies on this.',
                            'Al continuar declaras, en esta y en cada ocasión de uso, que no te encuentras ni resides en una jurisdicción prohibida, que no eres una persona sancionada ni actúas por cuenta de una, y que Payouts no se ofrece donde estás (hoy quedan fuera el EEE, el Reino Unido y Estados Unidos). Nirium confía en esta declaración.')}
                    </p>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <p className="font-mono text-sm text-white/50">
                            {p.batch.total} <span className="text-white font-bold">{total.toFixed(4)}</span> {asset}
                            <span className="text-white/30 block sm:inline"> · {filledCount} {p.batch.recipients}</span>
                        </p>
                        <button onClick={runPayroll} disabled={busy || !ackTerms || (network === "mainnet" && !clientInfoComplete)}
                            className="w-full sm:w-auto h-11 px-6 rounded-full bg-stellar-teal text-[#0b0b0b] font-bold text-sm hover:bg-stellar-yellow transition-all uppercase tracking-tight disabled:opacity-50">
                            {actionLabel}
                        </button>
                    </div>

                    {error && <p className="mt-4 text-sm text-red-400 font-mono">{error}</p>}

                    {skipped.length > 0 && (
                        <div className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/[0.05] p-3">
                            <p className="text-xs font-mono text-amber-400 mb-2">{skipped.length} {p.skipped}</p>
                            <ul className="space-y-1">
                                {skipped.map((s, i) => (
                                    <li key={i} className="text-xs font-mono text-white/60">
                                        {shorten(s.wallet, 5)} — <span className="text-amber-400/80">{s.reason}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {receipt && (
                        <div className="mt-4 rounded-lg border border-stellar-teal/30 bg-stellar-teal/[0.05] p-4">
                            <p className="text-sm text-stellar-teal font-semibold mb-2">
                                ✅ {p.receipt.settled} · {receipt.recipientCount} {p.receipt.paid} · {receipt.totalAmount} {asset}
                            </p>
                            <div className="space-y-1 font-mono text-xs">
                                {receipt.explorer && (
                                    <a href={receipt.explorer} target="_blank" rel="noreferrer"
                                        className="block text-white/70 hover:text-stellar-teal break-all">
                                        {p.receipt.tx} · {shorten(receipt.txHash || "", 8)} ↗
                                    </a>
                                )}
                                {receipt.cid && (
                                    <a href={ipfsUrl(receipt.cid)} target="_blank" rel="noreferrer"
                                        className="block text-white/70 hover:text-stellar-teal break-all">
                                        {p.receipt.ipfs} · {shorten(receipt.cid, 8)} ↗
                                    </a>
                                )}
                                {legal && (
                                    <p className="text-white/40 pt-1">
                                        {p.receipt.boundPre}{" "}
                                        <a href={legal.terms} target="_blank" rel="noreferrer" className="underline decoration-white/20 hover:text-white/70">{p.receipt.boundLink}</a>
                                        {" "}· {p.receipt.boundPost}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </section>

                {/* Onboarding */}
                <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 mb-8">
                    <h2 className="text-lg font-bold mb-1">{p.onboard.title}</h2>
                    <p className="text-white/45 text-sm mb-4">{p.onboard.desc}</p>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <code className="w-full sm:flex-1 min-w-0 h-11 px-3 flex items-center rounded-lg bg-black border border-white/10 font-mono text-sm text-white/70 truncate">
                            {isConnected && address ? address : p.wallet.notConnected}
                        </code>
                        <button onClick={onboardWorker} disabled={onboardPhase === "working" || !isConnected}
                            className="w-full sm:w-auto h-11 px-5 rounded-full border border-stellar-teal/40 text-stellar-teal font-bold text-sm hover:bg-stellar-teal/10 transition-all uppercase tracking-tight disabled:opacity-50 whitespace-nowrap">
                            {onboardPhase === "working" ? p.onboard.working : p.onboard.button}
                        </button>
                    </div>
                    {onboardMsg && <p className="mt-3 text-sm font-mono text-white/70 break-all">{onboardMsg}</p>}
                </section>

                {/* Recent runs */}
                <section>
                    <h2 className="text-sm font-mono uppercase tracking-widest text-white/40 mb-3">{p.runs.title}</h2>
                    {runs.length === 0 ? (
                        <p className="text-white/30 text-sm font-mono">{p.runs.empty}</p>
                    ) : (
                        <div className="space-y-2">
                            {runs.map((run) => (
                                <div key={run.runId}
                                    className="flex items-center justify-between rounded-xl border border-white/8 bg-white/[0.015] px-4 py-3">
                                    <div className="min-w-0">
                                        <p className="font-mono text-sm text-white/80">
                                            {run.totalAmount} {run.asset}
                                            <span className="text-white/30"> · {run.recipientCount} {p.runs.recipients}</span>
                                        </p>
                                        <p className="font-mono text-[11px] text-white/30 truncate">{run.runId}</p>
                                    </div>
                                    <div className="flex gap-3 font-mono text-xs shrink-0">
                                        {run.explorer && <a href={run.explorer} target="_blank" rel="noreferrer" className="text-white/50 hover:text-stellar-teal">{p.receipt.tx} ↗</a>}
                                        {run.cid && <a href={ipfsUrl(run.cid)} target="_blank" rel="noreferrer" className="text-white/50 hover:text-stellar-teal">IPFS ↗</a>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <p className="mt-12 font-mono text-[11px] text-white/25 text-center">
                    {network === "mainnet" ? p.network.mainnet : p.network.testnet} · {p.footerSuffix}
                </p>
            </div>
        </main>
    );
}
