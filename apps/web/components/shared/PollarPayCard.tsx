"use client";

// ───────────────────────────────────────────────────────────────
// PollarPayCard — pagar un endpoint x402 con la wallet de Pollar.
//
// Es la contraparte de PollarDoor en /keys: allá la firma sirve para ENTRAR,
// aquí la misma wallet sirve para PAGAR. Dos usos de una llave que el usuario
// nunca custodió.
//
// POR QUÉ VÍA EL PAQUETE PUBLICADO y no un fetch a mano: x402 v2 tiene tres
// detalles que no se adivinan — los términos llegan en el header
// `payment-required` (el body va vacío), el header de respuesta se llama
// `PAYMENT-SIGNATURE` (mandar el `X-PAYMENT` de v1 hace que el servidor ignore
// el pago sin decir nada), y hay que RE-SIMULAR después de firmar porque la
// firma agrega bytes y el resource fee calculado antes se queda corto. Todo eso
// vive en `nirium-pollar-adapter`, que además es lo que le pedimos a terceros
// que instalen: si no lo usamos nosotros, no sabemos si funciona.
//
// El import es DINÁMICO: el adapter arrastra @x402/* y stellar-sdk, y no hay
// razón de meterlos en el bundle de quien solo viene a sacar una API key.
// ───────────────────────────────────────────────────────────────

import { useCallback, useEffect, useState } from "react";
import { Zap, ExternalLink } from "lucide-react";
import { usePollarBridge } from "@/context/PollarBridge";
import { useNetwork } from "@/context/NetworkContext";

type Result = { ok: true; body: string } | { ok: false; message: string };

// Circle. En mainnet ignoramos cualquier otro emisor a propósito: cobrar
// contra un USDC que no es el de Circle no es cobrar.
const USDC_ISSUER = {
    mainnet: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",
    testnet: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
} as const;

export function PollarPayCard({
    lang,
}: {
    lang: (en: string, es: string) => string;
}) {
    const { available, isAuthenticated, address, openLogin, getClient } = usePollarBridge();
    const { network } = useNetwork();
    const [busy, setBusy] = useState(false);
    const [result, setResult] = useState<Result | null>(null);
    const [balance, setBalance] = useState<number | null>(null);

    const caip = network === "mainnet" ? "stellar:pubnet" : "stellar:testnet";
    const real = network === "mainnet";

    // La wallet de un usuario recién onboardado nace VACÍA. Sin este aviso, su
    // primer clic choca contra un fallo del contrato del token que no dice
    // "no tienes saldo" — dice cualquier otra cosa. Decirlo ANTES de firmar.
    const loadBalance = useCallback(async () => {
        if (!address) { setBalance(null); return; }
        const horizon = real ? "https://horizon.stellar.org" : "https://horizon-testnet.stellar.org";
        try {
            const r = await fetch(`${horizon}/accounts/${address}`, { cache: "no-store" });
            if (!r.ok) { setBalance(0); return; }
            const d = await r.json();
            const usdc = (d.balances ?? []).find(
                (b: { asset_code?: string; asset_issuer?: string }) =>
                    b.asset_code === "USDC" && b.asset_issuer === USDC_ISSUER[real ? "mainnet" : "testnet"],
            );
            setBalance(usdc ? Number(usdc.balance) : 0);
        } catch {
            setBalance(null); // no sabemos: mejor callar que asustar de más
        }
    }, [address, real]);

    useEffect(() => { void loadBalance(); }, [loadBalance]);

    if (!available) return null;

    const broke = balance !== null && balance < 0.02;

    async function pay() {
        const client = getClient();
        if (!client) return;
        setResult(null);
        setBusy(true);
        try {
            const { createPollarSigner, createNiriumAdapter } = await import("nirium-pollar-adapter");
            const nirium = createNiriumAdapter({
                // La dirección va explícita: el puente ya la tiene resuelta de la
                // sesión y es más fiable que hurgar en la forma del cliente, que
                // Pollar todavía mueve entre versiones.
                signer: createPollarSigner(client as never, { network: caip, address: address ?? undefined }),
                network: caip,
            });
            const signals = await nirium.getPremiumSignals();
            setResult({ ok: true, body: JSON.stringify(signals, null, 2).slice(0, 600) });
            void loadBalance();
        } catch (e) {
            setResult({ ok: false, message: e instanceof Error ? e.message : String(e) });
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="mt-5 pt-5 border-t border-white/8">
            <p className="text-[11px] uppercase tracking-widest text-white/40 mb-1">
                {lang("Pay per request", "Pago por petición")}
            </p>
            <p className="text-xs text-white/50 mb-3 leading-relaxed">
                {lang(
                    "The same wallet that signed you in can pay for an API call. $0.02 USDC, no card, no subscription — and no XLM: Pollar sponsors the account reserve and the x402 facilitator sponsors the network fee.",
                    "La misma wallet con la que entraste puede pagar una llamada a la API. $0.02 USDC, sin tarjeta ni suscripción — y sin XLM: Pollar patrocina la reserva de la cuenta y el facilitador de x402 patrocina el fee de red.",
                )}
            </p>

            {!isAuthenticated ? (
                <button
                    onClick={openLogin}
                    className="h-10 px-5 rounded-full bg-white text-black font-bold text-xs hover:bg-stellar-yellow transition-all uppercase tracking-tight"
                >
                    {lang("Sign in to pay", "Entra para pagar")}
                </button>
            ) : (
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <button
                        onClick={pay}
                        disabled={busy || !address || broke}
                        className="h-10 px-5 rounded-full bg-stellar-teal text-[#0b0b0b] font-bold text-xs hover:bg-stellar-yellow transition-all uppercase tracking-tight disabled:opacity-50 inline-flex items-center justify-center gap-2"
                    >
                        <Zap className="w-3.5 h-3.5" />
                        {busy
                            ? lang("Paying…", "Pagando…")
                            : lang("Pay $0.02 for signals", "Pagar $0.02 por señales")}
                    </button>
                    <span className={`text-[10px] uppercase tracking-widest font-bold ${real ? "text-emerald-400" : "text-amber-400"}`}>
                        {real
                            ? lang("Mainnet · real USDC", "Mainnet · USDC real")
                            : lang("Testnet", "Testnet")}
                        {balance !== null && ` · ${balance.toFixed(2)} USDC`}
                    </span>
                </div>
            )}

            {isAuthenticated && broke && (
                <p className="mt-3 text-xs text-amber-400/90 leading-relaxed">
                    {lang(
                        `This wallet holds ${balance?.toFixed(2)} USDC — a payment needs 0.02. Send USDC to ${address} to try it.`,
                        `Esta wallet tiene ${balance?.toFixed(2)} USDC y un pago necesita 0.02. Mándale USDC a ${address} para probarlo.`,
                    )}
                </p>
            )}

            {result?.ok === true && (
                <div className="mt-3">
                    <p className="text-xs text-emerald-400 font-bold mb-2 inline-flex items-center gap-1.5">
                        {lang("Paid — response below", "Pagado — respuesta abajo")}
                    </p>
                    <pre className="text-[10px] font-mono text-white/60 bg-black/40 border border-white/8 rounded-lg p-3 overflow-x-auto">
                        {result.body}
                    </pre>
                    <a
                        href={`https://stellar.expert/explorer/${real ? "public" : "testnet"}/account/${address}`}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-white/40 hover:text-stellar-teal transition-colors"
                    >
                        {lang("View wallet on explorer", "Ver wallet en el explorador")}
                        <ExternalLink className="w-3 h-3" />
                    </a>
                </div>
            )}

            {result?.ok === false && (
                <pre className="mt-3 text-[10px] text-red-400 font-mono whitespace-pre-wrap break-all bg-red-500/5 border border-red-500/20 rounded-lg p-3">
                    {result.message}
                </pre>
            )}
        </div>
    );
}
