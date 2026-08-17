"use client";

// ───────────────────────────────────────────────────────────────
// Nirium × Pollar — página de diagnóstico
//
// Comprueba de un vistazo que la integración está viva: si hay llave para la
// red activa, si el SDK levantó, y qué dirección entregó Pollar. El login real
// vive en el navbar y en /keys; esto es solo para verificar.
//
// Usa el puente (PollarBridge) en vez de montar su propio PollarProvider: hay
// un único cliente a nivel de app, así que la sesión que abras aquí es la misma
// que verás en /keys.
// ───────────────────────────────────────────────────────────────

import { usePollarBridge } from "@/context/PollarBridge";
import { useNetwork } from "@/context/NetworkContext";

export default function PollarTestPage() {
  const { network } = useNetwork();
  const { available, isAuthenticated, address, openLogin, logout } = usePollarBridge();

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-xl mx-auto px-6 py-16 text-center">
        <p className="font-mono text-xs tracking-[0.18em] text-stellar-teal uppercase mb-3">
          Nirium × Pollar · Diagnóstico
        </p>
        <h1 className="text-3xl font-black tracking-tight mb-2">Onboarding sin fricción</h1>
        <p className="text-white/50 mb-10">
          Crea tu wallet de Stellar con tu correo o Google — sin instalar nada.
        </p>

        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 mb-8 text-left font-mono text-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-white/40">red activa</span>
            <span className={network === "mainnet" ? "text-emerald-400" : "text-amber-400"}>{network}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/40">llave configurada</span>
            <span className={available ? "text-emerald-400" : "text-red-400"}>{available ? "sí" : "no"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/40">sesión</span>
            <span className={isAuthenticated ? "text-emerald-400" : "text-white/40"}>
              {isAuthenticated ? "autenticada" : "sin iniciar"}
            </span>
          </div>
        </div>

        {!available ? (
          <p className="text-amber-400 text-sm">
            Falta la llave publishable de Pollar para <code>{network}</code> en el entorno.
          </p>
        ) : isAuthenticated && address ? (
          <div className="rounded-2xl border border-stellar-teal/30 bg-stellar-teal/[0.05] p-6">
            <p className="text-stellar-teal font-semibold mb-2">✅ Wallet creada vía Pollar</p>
            <code className="block text-xs font-mono text-white/70 break-all mb-4">{address}</code>
            <button
              onClick={logout}
              className="h-9 px-4 rounded-full border border-white/15 text-white/70 text-xs font-semibold hover:bg-white/5 transition-all"
            >
              Cerrar sesión
            </button>
          </div>
        ) : (
          <button
            onClick={openLogin}
            className="h-12 px-8 rounded-full bg-white text-black font-bold hover:bg-stellar-yellow transition-all uppercase tracking-tight"
          >
            Entrar con correo o Google
          </button>
        )}

        <p className="mt-10 font-mono text-[11px] text-white/30">
          {network === "mainnet" ? "Mainnet" : "Testnet"} · Embedded wallet (G-account) · Protected by Pollar
        </p>
      </div>
    </main>
  );
}
