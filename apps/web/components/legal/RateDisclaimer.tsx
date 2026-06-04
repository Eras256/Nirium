"use client";

import { Info } from "lucide-react";

interface RateDisclaimerProps {
  rate: string;
  source: string;
  mode?: "inline" | "compact";
  className?: string;
}

const DISCLAIMER_TEXT =
  "Protocol reference rate only. Not a return projection or guarantee. Source data is public protocol information.";

export default function RateDisclaimer({
  rate,
  source,
  mode = "inline",
  className = "",
}: RateDisclaimerProps) {
  if (mode === "compact") {
    return (
      <span className={`inline-flex items-baseline gap-0.5 ${className}`}>
        <span className="font-mono font-black">{rate}</span>
        <sup className="group relative cursor-default">
          <span className="text-amber-400/70 text-[9px] font-mono ml-0.5">*</span>
          <span
            role="tooltip"
            className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-56 rounded-lg bg-zinc-900 border border-white/10 px-3 py-2 text-[10px] text-zinc-300 leading-relaxed shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50"
          >
            <span className="font-bold text-amber-400 block mb-0.5">{source}</span>
            {DISCLAIMER_TEXT}
          </span>
        </sup>
      </span>
    );
  }

  // inline mode
  return (
    <span className={`inline-flex items-center gap-1.5 flex-wrap ${className}`}>
      <span className="font-mono font-black">{rate}</span>
      <span className="group relative cursor-default inline-flex items-center gap-1 text-[10px] text-amber-400/80 font-mono border border-amber-500/20 bg-amber-950/30 rounded px-1.5 py-0.5 hover:border-amber-500/40 transition-colors">
        <Info className="w-2.5 h-2.5 shrink-0" />
        <span className="hidden sm:inline">reference rate · {source}</span>
        <span className="sm:hidden">ref.</span>
        <span
          role="tooltip"
          className="pointer-events-none absolute bottom-full left-0 mb-1.5 w-64 rounded-lg bg-zinc-900 border border-white/10 px-3 py-2 text-[10px] text-zinc-300 leading-relaxed shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50"
        >
          <span className="font-bold text-amber-400 block mb-0.5">{source}</span>
          {DISCLAIMER_TEXT}
        </span>
      </span>
    </span>
  );
}

// Standalone footnote to render below a section containing rate data
export function RateFootnote({ sources }: { sources: string[] }) {
  return (
    <p className="text-[10px] font-mono text-zinc-500 mt-2 leading-relaxed">
      * {sources.join(", ")}: protocol reference rates only — not return projections or guarantees.
      All rate data is public information sourced directly from the respective protocols.
    </p>
  );
}
