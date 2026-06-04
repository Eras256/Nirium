"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X, AlertTriangle } from "lucide-react";

type Variant = "banner" | "footer" | "inline";
type Locale = "en" | "es";

interface LegalDisclaimerProps {
  variant: Variant;
  locale?: Locale;
  className?: string;
}

const SHORT: Record<Locale, string> = {
  en: "Nirium is experimental B2B infrastructure on Stellar Testnet. It is an enterprise SDK, not a financial product. No yields or returns guaranteed. Use at your own risk.",
  es: "Nirium es infraestructura B2B experimental en Stellar Testnet. Es un SDK para empresas, no un producto financiero. No garantiza rendimientos. Úselo bajo su propio riesgo.",
};

const FULL: Record<Locale, string> = {
  en: "Nirium is experimental B2B software infrastructure on Stellar Testnet. It is an enterprise SDK, not a consumer financial product or investment advice. All operations use test tokens with zero monetary value. Our smart contracts are unaudited (audit scheduled for Month 3). Nirium does not guarantee yields, dividends, or returns. Any APY/rate data shown (e.g., Etherfuse CETES) is public protocol information, not a promise of return. Crypto assets are volatile. Built strictly for developers and independent operators under the Stellar Community Fund v7.0 and the Stellar Code of Conduct (updated May 2026).",
  es: "Nirium es infraestructura de software B2B experimental en Stellar Testnet. Es un SDK para empresas, no un producto financiero para consumidores ni asesoría de inversión. Todas las operaciones usan tokens de prueba sin valor. Nuestros smart contracts aún no están auditados (auditoría programada para el Mes 3). Nirium no garantiza rendimientos, dividendos ni retornos de ningún tipo. Las tasas mostradas (ej. CETES vía Etherfuse) son información pública del protocolo, no promesas de ganancia. Los criptoactivos son volátiles. Construido estrictamente para desarrolladores y operadores independientes bajo el Stellar Community Fund v7.0 y el Código de Conducta de Stellar (mayo de 2026).",
};

const COC_URL = "https://stellar.org/foundation/code-of-conduct";
const STORAGE_KEY = "nirium-disclaimer-dismissed";

export default function LegalDisclaimer({
  variant,
  locale = "en",
  className = "",
}: LegalDisclaimerProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (variant === "banner") {
      const dismissed = sessionStorage.getItem(STORAGE_KEY);
      setVisible(!dismissed);
    }
  }, [variant]);

  const dismiss = () => {
    sessionStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  };

  if (variant === "banner") {
    if (!visible) return null;
    return (
      <div
        role="alert"
        className={`relative w-full bg-amber-950/80 border-b border-amber-500/30 text-amber-200 px-4 py-3 ${className}`}
      >
        <div className="max-w-5xl mx-auto flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-400" />
          <p className="text-[11px] sm:text-xs leading-relaxed flex-1">
            {SHORT[locale]}{" "}
            <Link
              href="/disclaimers"
              className="underline underline-offset-2 hover:text-white transition-colors font-medium"
            >
              {locale === "es" ? "Leer aviso completo" : "Read full disclaimer"}
            </Link>
            {" · "}
            <a
              href={COC_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-white transition-colors"
            >
              Stellar CoC ↗
            </a>
          </p>
          <button
            onClick={dismiss}
            aria-label="Dismiss disclaimer"
            className="shrink-0 p-1 rounded hover:bg-amber-500/20 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  if (variant === "footer") {
    return (
      <p
        className={`text-[10px] leading-relaxed text-zinc-500 font-mono italic ${className}`}
      >
        {FULL[locale]}{" "}
        <a
          href={COC_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-zinc-300 transition-colors"
        >
          Stellar Code of Conduct ↗
        </a>
      </p>
    );
  }

  // inline — full block for /disclaimers page
  return (
    <div
      className={`rounded-2xl border border-amber-500/20 bg-amber-950/20 p-6 ${className}`}
    >
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400">
          {locale === "es" ? "Aviso Legal Obligatorio" : "Mandatory Legal Disclaimer"}
        </span>
      </div>
      <p className="text-sm text-zinc-300 leading-relaxed mb-4">
        {FULL[locale]}
      </p>
      <a
        href={COC_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 underline underline-offset-2 transition-colors"
      >
        Stellar Code of Conduct (May 2026) ↗
      </a>
    </div>
  );
}
