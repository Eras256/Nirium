"use client";

// ───────────────────────────────────────────────────────────────
// API Keys — self-service console
//
// 100% real y same-origin: la página habla SOLO con /api/devkeys (rutas Next).
// Identidad = UNA firma de wallet por sesión (SEP-53): el agente verifica la
// firma, emite un JWT wallet-verified y queda en cookie httpOnly. Sin esa
// prueba nadie puede crear/listar/revocar keys de una dirección ajena.
// La tabla auth_keys es compartida entre boxes → una key sirve en testnet y
// mainnet. La key cruda se muestra UNA sola vez.
// ───────────────────────────────────────────────────────────────

import { useCallback, useEffect, useState } from "react";
import { useFreighter } from "@/hooks/useFreighter";
import { useLanguage } from "@/context/LanguageContext";
import { usePollarBridge } from "@/context/PollarBridge";
import { KeyRound, Copy, CheckCircle, Trash2, Lock, RefreshCw, PenLine } from "lucide-react";

type KeyRow = { id: string; name: string; permissions: string[]; tier: string; created: string };

/** Prueba de propiedad que el agente verifica (SEP-53), venga de donde venga. */
type WalletProof = { walletAddress: string; message: string; signature: string };

const shorten = (s: string, n = 6) => (s.length > n * 2 ? `${s.slice(0, n)}…${s.slice(-n)}` : s);

function randomNonce(): string {
    const bytes = new Uint8Array(8);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Formato EXACTO que valida el agente (`walletProof.ts`): cualquier desvío
 * (espacios, orden, nombres) hace que rechace la firma como malformada.
 */
function buildAuthMessage(wallet: string): string {
    const ts = Math.floor(Date.now() / 1000);
    return `Nirium keys-console auth | wallet=${wallet} | ts=${ts} | nonce=${randomNonce()}`;
}

/**
 * Puerta 2 — Pollar (login social, sin instalar nada).
 *
 * Pollar firma el MISMO mensaje SEP-53 que Freighter: su
 * `stellar.sep53.signMessage` produce ed25519 sobre
 * sha256("Stellar Signed Message:\n" + msg), que es el primer candidato que
 * prueba `verifyWalletProof` en el agente. Cero cambios en el backend.
 *
 * OJO: las wallets con passkey (C-address) NO pueden firmar SEP-53 — no tienen
 * llave clásica — y el agente además solo acepta direcciones G. Por eso esta
 * puerta es para login social (wallet custodial G), no para smart wallets.
 */
function PollarDoor({
    onProof,
    lang,
}: {
    onProof: (proof: WalletProof) => Promise<void>;
    lang: (en: string, es: string) => string;
}) {
    const { isAuthenticated, address, openLogin, signMessage } = usePollarBridge();
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    async function proveOwnership() {
        if (!address) return;
        setErr(null);
        setBusy(true);
        try {
            const message = buildAuthMessage(address);
            const { signature, signerAddress } = await signMessage(message);
            await onProof({ walletAddress: signerAddress, message, signature });
        } catch (e) {
            setErr(e instanceof Error ? e.message : String(e));
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="mt-5 pt-5 border-t border-white/8">
            <p className="text-[11px] uppercase tracking-widest text-white/40 mb-3">
                {lang("No wallet? Sign in instead", "¿Sin wallet? Entra con tu cuenta")}
            </p>
            {!isAuthenticated ? (
                // El modal propio de Pollar: trae correo + OAuth y ya está branded
                // desde su dashboard. Mejor que botones sueltos, y nos da el login
                // por correo (que es multi-paso y no vale reimplementar).
                <button
                    onClick={openLogin}
                    className="h-10 px-5 rounded-full bg-white text-black font-bold text-xs hover:bg-stellar-yellow transition-all uppercase tracking-tight"
                >
                    {lang("Sign in with email or Google", "Entrar con correo o Google")}
                </button>
            ) : (
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <code className="font-mono text-xs text-white/60 truncate">
                        {address ? shorten(address, 7) : lang("Creating wallet…", "Creando wallet…")}
                    </code>
                    <button
                        onClick={proveOwnership}
                        disabled={busy || !address}
                        className="h-10 px-5 rounded-full bg-stellar-teal text-[#0b0b0b] font-bold text-xs hover:bg-stellar-yellow transition-all uppercase tracking-tight disabled:opacity-50 inline-flex items-center justify-center gap-2"
                    >
                        <PenLine className="w-3.5 h-3.5" />
                        {busy
                            ? lang("Signing…", "Firmando…")
                            : lang("Authenticate (1 signature)", "Autenticar (1 firma)")}
                    </button>
                </div>
            )}
            {err && <p className="mt-3 text-xs text-red-400 font-mono break-all">{err}</p>}
        </div>
    );
}

export default function KeysPage() {
    const { address, isConnected, connect, signMessage } = useFreighter();
    const pollarEnabled = usePollarBridge().available;
    const { language } = useLanguage();
    const lang = (en: string, es: string) =>
        language === "es" ? es : en;

    const [keys, setKeys] = useState<KeyRow[]>([]);
    const [keyName, setKeyName] = useState("");
    const [creating, setCreating] = useState(false);
    const [loadingList, setLoadingList] = useState(false);
    const [newKey, setNewKey] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [revoking, setRevoking] = useState<string | null>(null);
    // Wallet de la sesión firmada activa (cookie httpOnly del lado del server).
    const [sessionAddr, setSessionAddr] = useState<string | null>(null);
    const [authing, setAuthing] = useState(false);
    // Dirección probada por la puerta de Pollar (login social). Freighter y
    // Pollar son alternativas: la identidad es la dirección, no la wallet.
    const [pollarAddr, setPollarAddr] = useState<string | null>(null);

    const activeAddress = address ?? pollarAddr;
    const sessionActive = !!activeAddress && sessionAddr === activeAddress;

    const loadKeys = useCallback(async () => {
        try {
            setLoadingList(true);
            const r = await fetch("/api/devkeys", { cache: "no-store" });
            if (r.status === 401) { setSessionAddr(null); return; }
            const d = await r.json().catch(() => ({}));
            if (r.ok && Array.isArray(d.keys)) setKeys(d.keys);
        } finally {
            setLoadingList(false);
        }
    }, []);

    // Restaura la sesión firmada si la cookie sigue viva y corresponde a la
    // dirección activa (si el usuario cambió de cuenta, se pide nueva firma).
    useEffect(() => {
        if (!activeAddress) { setSessionAddr(null); return; }
        let cancelled = false;
        (async () => {
            try {
                const r = await fetch("/api/devkeys/session", { cache: "no-store" });
                const d = await r.json().catch(() => ({}));
                if (!cancelled && d?.authenticated && d?.address === activeAddress) setSessionAddr(activeAddress);
            } catch { /* sin sesión — se pedirá firma */ }
        })();
        return () => { cancelled = true; };
    }, [activeAddress]);

    useEffect(() => { if (sessionActive) loadKeys(); }, [sessionActive, loadKeys]);

    /** Canjea una prueba SEP-53 por la cookie de sesión. Común a ambas puertas. */
    const submitProof = useCallback(async ({ walletAddress, message, signature }: WalletProof) => {
        const r = await fetch("/api/devkeys/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ walletAddress, message, signature }),
        });
        const d = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(d.error || `auth failed (${r.status})`);
        setSessionAddr(walletAddress);
    }, []);

    /** Puerta 1 — Freighter (extensión de navegador). */
    async function authenticate() {
        if (!address) { await connect(); return; }
        setError(null);
        try {
            setAuthing(true);
            const message = buildAuthMessage(address);
            const signed: any = await signMessage(message, { address });
            const signature: string | undefined = signed?.signedMessage;
            if (!signature) throw new Error(lang("Wallet did not return a signature.", "La wallet no devolvió una firma."));
            if (signed?.signerAddress && signed.signerAddress !== address) {
                throw new Error(lang(
                    "The active wallet account doesn't match the connected address — switch accounts and retry.",
                    "La cuenta activa de la wallet no coincide con la dirección conectada — cambia de cuenta y reintenta."));
            }
            await submitProof({ walletAddress: address, message, signature });
        } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            setError(/not support|unsupported|does not exist/i.test(msg)
                ? lang(
                    "This wallet doesn't support message signing — use Freighter.",
                    "Esta wallet no soporta firma de mensajes — usa Freighter.")
                : msg);
        } finally {
            setAuthing(false);
        }
    }

    async function createKey() {
        if (!sessionActive) { await authenticate(); return; }
        setError(null); setNewKey(null);
        try {
            setCreating(true);
            const r = await fetch("/api/devkeys", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: keyName.trim() || `Key ${new Date().toISOString().slice(0, 10)}`,
                }),
            });
            if (r.status === 401) {
                setSessionAddr(null);
                throw new Error(lang("Session expired — sign again.", "Sesión expirada — firma de nuevo."));
            }
            const d = await r.json().catch(() => ({}));
            if (!r.ok || !d.apiKey) throw new Error(d.message || d.error || `server error (${r.status})`);
            setNewKey(d.apiKey);
            setKeyName("");
            await loadKeys();
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e));
        } finally {
            setCreating(false);
        }
    }

    async function revoke(id: string) {
        setError(null);
        try {
            setRevoking(id);
            const r = await fetch(`/api/devkeys/${encodeURIComponent(id)}`, { method: "DELETE" });
            if (r.status === 401) {
                setSessionAddr(null);
                throw new Error(lang("Session expired — sign again.", "Sesión expirada — firma de nuevo."));
            }
            if (!r.ok) { const d = await r.json().catch(() => ({})); throw new Error(d.error || `revoke failed (${r.status})`); }
            setKeys((ks) => ks.filter((k) => k.id !== id));
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e));
        } finally {
            setRevoking(null);
        }
    }

    function copyKey() {
        if (!newKey) return;
        navigator.clipboard.writeText(newKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <main className="min-h-screen bg-black text-white">
            <div className="max-w-3xl mx-auto px-6 py-14">
                <p className="font-mono text-xs tracking-[0.18em] text-stellar-teal uppercase mb-3">
                    {lang("Developer · Access", "Developer · Acceso")}
                </p>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">API Keys</h1>
                <p className="text-white/50 mb-6 max-w-xl">
                    {lang(
                        "Issue real API keys for the Nirium agent — audit anchoring, reporting and authenticated endpoints. One key works on both testnet and mainnet.",
                        "Emite API keys reales del agente Nirium — anclaje de auditoría, reportería y endpoints autenticados. Una misma key funciona en testnet y mainnet.")}
                </p>
                <div className="flex flex-wrap gap-2 mb-10 font-mono text-[11px]">
                    {[
                        lang("Free tier · 100 calls/day", "Tier free · 100 calls/día"),
                        "sk_free_…",
                        lang("Testnet + Mainnet", "Testnet + Mainnet"),
                    ].map((b) => (
                        <span key={b} className="px-2.5 py-1 rounded-full border border-white/10 text-white/60">{b}</span>
                    ))}
                </div>

                {/* Wallet + sesión firmada */}
                <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 mb-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <p className="text-[11px] uppercase tracking-widest text-white/40 mb-1">
                                {lang("Account", "Cuenta")}
                            </p>
                            <code className="text-sm font-mono text-white/80">
                                {activeAddress ? shorten(activeAddress, 7) : lang("Not connected", "No conectada")}
                            </code>
                            {sessionActive && (
                                <p className="mt-1 flex items-center gap-1.5 font-mono text-[11px] text-emerald-400/80">
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    {lang("Ownership verified (signed)", "Propiedad verificada (firmada)")}
                                </p>
                            )}
                        </div>
                        {!isConnected ? (
                            <button onClick={connect}
                                className="w-full sm:w-auto h-11 px-6 rounded-full bg-white text-black font-bold text-sm hover:bg-stellar-yellow transition-all uppercase tracking-tight">
                                {lang("Connect wallet", "Conectar wallet")}
                            </button>
                        ) : !sessionActive ? (
                            <button onClick={authenticate} disabled={authing}
                                className="w-full sm:w-auto h-11 px-6 rounded-full bg-white text-black font-bold text-sm hover:bg-stellar-yellow transition-all uppercase tracking-tight disabled:opacity-50 inline-flex items-center justify-center gap-2">
                                <PenLine className="w-4 h-4" />
                                {authing
                                    ? lang("Waiting for wallet…", "Esperando la wallet…")
                                    : lang("Authenticate (1 signature)", "Autenticar (1 firma)")}
                            </button>
                        ) : null}
                    </div>
                    {!!activeAddress && !sessionActive && (
                        <p className="mt-4 text-[12px] font-mono text-white/35">
                            {lang(
                                "Sign one message to prove you own this address — no transaction, no fees. The session lasts ~1 hour.",
                                "Firma un mensaje para demostrar que la dirección es tuya — sin transacción, sin fees. La sesión dura ~1 hora.")}
                        </p>
                    )}

                    {/* Puerta 2: solo mientras no haya sesión y sin Freighter conectado,
                        para no ofrecer dos identidades a la vez. */}
                    {pollarEnabled && !sessionActive && !isConnected && (
                        <PollarDoor
                            lang={lang}
                            onProof={async (proof) => {
                                setPollarAddr(proof.walletAddress);
                                await submitProof(proof);
                            }}
                        />
                    )}

                </section>

                {sessionActive && (
                    <>
                        {/* Crear key */}
                        <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 mb-8">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <KeyRound className="w-5 h-5 text-stellar-yellow" />
                                {lang("Create a new key", "Crear una key nueva")}
                            </h2>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <input value={keyName} onChange={(e) => setKeyName(e.target.value)} maxLength={60}
                                    placeholder={lang("Key name (e.g. my-agent-prod)", "Nombre de la key (ej. mi-agente-prod)")}
                                    className="flex-1 h-11 px-3 rounded-lg bg-black border border-white/10 font-mono text-sm text-white/90 placeholder:text-white/25 focus:border-stellar-teal/60 outline-none" />
                                <button onClick={createKey} disabled={creating}
                                    className="h-11 px-6 rounded-full bg-stellar-teal text-[#0b0b0b] font-bold text-sm hover:bg-stellar-yellow transition-all uppercase tracking-tight disabled:opacity-50">
                                    {creating ? lang("Creating…", "Creando…") : lang("Generate key", "Generar key")}
                                </button>
                            </div>

                            {newKey && (
                                <div className="mt-5 rounded-lg border border-stellar-yellow/30 bg-stellar-yellow/[0.05] p-4">
                                    <p className="text-xs font-mono text-stellar-yellow mb-2 uppercase tracking-widest">
                                        {lang("Copy it now — it is shown only once", "Cópiala ahora — se muestra una sola vez")}
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <code className="flex-1 min-w-0 font-mono text-sm text-white/90 break-all">{newKey}</code>
                                        <button onClick={copyKey}
                                            className="shrink-0 w-10 h-10 rounded-lg border border-white/15 flex items-center justify-center text-white/60 hover:text-white hover:border-white/40 transition-colors">
                                            {copied ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    <p className="mt-3 text-[11px] font-mono text-white/40 break-all">
                                        {lang(
                                            'Use it as header: curl -H "x-api-key: <key>" https://nirium-agent-mainnet.fly.dev/api/market',
                                            'Úsala como header: curl -H "x-api-key: <key>" https://nirium-agent-mainnet.fly.dev/api/market')}
                                    </p>
                                </div>
                            )}
                        </section>

                        {/* Listado + revocación */}
                        <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold">{lang("Your keys", "Tus keys")}</h2>
                                <button onClick={loadKeys}
                                    className="w-9 h-9 rounded-lg border border-white/10 flex items-center justify-center text-white/40 hover:text-white/80 transition-colors">
                                    <RefreshCw className={`w-4 h-4 ${loadingList ? "animate-spin" : ""}`} />
                                </button>
                            </div>
                            {keys.length === 0 ? (
                                <p className="text-white/30 text-sm font-mono">
                                    {loadingList
                                        ? lang("Loading…", "Cargando…")
                                        : lang("No active keys yet.", "Aún no hay keys activas.")}
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {keys.map((k) => (
                                        <div key={k.id} className="flex items-center justify-between rounded-xl border border-white/8 bg-white/[0.015] px-4 py-3">
                                            <div className="min-w-0">
                                                <p className="font-mono text-sm text-white/80 truncate">{k.name}</p>
                                                <p className="font-mono text-[11px] text-white/30">
                                                    {k.tier} · {new Date(k.created).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <button onClick={() => revoke(k.id)} disabled={revoking === k.id}
                                                className="shrink-0 inline-flex items-center gap-1.5 font-mono text-xs text-red-400/70 hover:text-red-400 transition-colors disabled:opacity-40">
                                                <Trash2 className="w-3.5 h-3.5" />
                                                {revoking === k.id ? lang("Revoking…", "Revocando…") : lang("Revoke", "Revocar")}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </>
                )}

                {error && <p className="mt-6 text-sm text-red-400 font-mono break-all">{error}</p>}
                <p className="mt-6 flex items-center gap-2 text-[11px] font-mono text-white/25">
                    <Lock className="w-3.5 h-3.5" />
                    {lang(
                        "Keys are issued server-side and tied to your wallet, proven by signature (SEP-53). Tier escalation is blocked server-side.",
                        "Las keys se emiten server-side y quedan ligadas a tu wallet, probada con firma (SEP-53). La escalación de tier está bloqueada en el servidor.")}
                </p>
            </div>
        </main>
    );
}

