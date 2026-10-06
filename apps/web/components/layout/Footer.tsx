"use client";

import Link from "next/link";
import { ExternalLink, ShieldCheck, Github } from "lucide-react";
import LegalDisclaimer from "@/components/legal/LegalDisclaimer";
import { useLanguage } from "@/context/LanguageContext";

export default function Footer() {
  const { language } = useLanguage();
  const lang = (en: string, es: string) => (language === "es" ? es : en);

  return (
    <footer className="w-full bg-background border-t border-white/10 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8">
          
          {/* Brand Column */}
          <div className="md:col-span-3 flex flex-col space-y-4">
            <Link href="/" className="inline-block w-fit">
              <span className="text-xl font-black tracking-tighter text-white">NIRIUM</span>
            </Link>
            <p className="text-sm text-zinc-400 max-w-xs leading-relaxed">
              {lang("Open-source AI treasury agent infrastructure on Stellar.", "Infraestructura open-source de agentes de tesorería IA en Stellar.")}
            </p>
            <div className="pt-4">
              <a
                href="https://github.com/Eras256/Nirium"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="GitHub Repository"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links Middle Column */}
          <div className="md:col-span-3 flex flex-col space-y-4">
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-widest mb-2">{lang("Navigation", "Navegación")}</h4>
            <ul className="space-y-3">
              <li><Link href="/dashboard" className="text-sm text-zinc-400 hover:text-white transition-colors">{lang("Product Dashboard", "Dashboard del producto")}</Link></li>
              <li><Link href="/developers" className="text-sm text-zinc-400 hover:text-white transition-colors">Developers</Link></li>
              <li><Link href="/docs" className="text-sm text-zinc-400 hover:text-white transition-colors">{lang("Documentation", "Documentación")}</Link></li>
              <li>
                <a href="https://github.com/Eras256/Nirium" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors">
                  GitHub <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a href="https://nirium-protocol.github.io/status/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors">
                  Status <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li><Link href="/stats" className="text-sm text-zinc-400 hover:text-white transition-colors">{lang("Usage Stats", "Estadísticas de uso")}</Link></li>
            </ul>
          </div>

          {/* Ecosystem Column */}
          <div className="md:col-span-3 flex flex-col space-y-4">
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-widest mb-2">{lang("Ecosystem", "Ecosistema")}</h4>
            <ul className="space-y-3">
              <li><a href="https://communityfund.stellar.org/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors">Stellar Community Fund <ExternalLink className="w-3 h-3" /></a></li>
              <li><a href="https://developers.stellar.org/docs" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors">{lang("Developer Docs", "Docs para desarrolladores")} <ExternalLink className="w-3 h-3" /></a></li>
              <li><a href="http://discord.gg/stellardev" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors">Stellar Discord <ExternalLink className="w-3 h-3" /></a></li>
              <li><a href="https://stellarcommunityfund.gitbook.io/scf-handbook" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors">SCF Handbook <ExternalLink className="w-3 h-3" /></a></li>
            </ul>
          </div>

          {/* Legal Links Right Column */}
          <div className="md:col-span-3 flex flex-col space-y-4">
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-widest mb-2">{lang("Legal & Compliance", "Legal y Compliance")}</h4>
            <ul className="space-y-3">
              <li><Link href="/disclaimers" className="text-sm text-zinc-400 hover:text-amber-400 transition-colors">{lang("Mandatory Disclaimers", "Avisos obligatorios")}</Link></li>
              <li><Link href="/risk-disclosure" className="text-sm text-zinc-400 hover:text-amber-400 transition-colors">{lang("Risk Disclosure (CETES)", "Aviso de riesgo (CETES)")}</Link></li>
              <li><Link href="/privacy" className="text-sm text-zinc-400 hover:text-white transition-colors">{lang("Privacy Policy (LFPDPPP)", "Aviso de privacidad (LFPDPPP)")}</Link></li>
              <li><Link href="/terms" className="text-sm text-zinc-400 hover:text-white transition-colors">{lang("Terms of Service", "Términos de servicio")}</Link></li>
              <li><Link href="/coc" className="text-sm text-zinc-400 hover:text-white transition-colors">{lang("Code of Conduct", "Código de conducta")}</Link></li>
              <li><Link href="/compliance" className="text-sm text-zinc-400 hover:text-white transition-colors">Compliance Hub</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-black border-t border-white/5 py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-8">
            <LegalDisclaimer variant="footer" locale={language} />
          </div>
          
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 text-[10px] font-mono text-zinc-500">
              <span className="px-2 py-1 rounded bg-white/5 border border-white/10 uppercase tracking-wider text-zinc-300">
                {lang("Apache 2.0 (Protocol & Interface)", "Apache 2.0 (Protocolo e Interfaz)")}
              </span>
              <span className="px-2 py-1 rounded bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 uppercase tracking-wider">
                {lang("Non-custodial · Stellar Mainnet + Testnet", "No custodial · Stellar Mainnet + Testnet")}
              </span>
              <a 
                href="https://communityfund.stellar.org" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-2 py-1 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400 uppercase tracking-wider hover:bg-purple-500/20 transition-colors"
              >
                <ShieldCheck className="w-3 h-3" />
                SCF Instaward Verified
              </a>
            </div>

            <div className="text-[10px] text-zinc-500 font-mono text-center lg:text-right uppercase tracking-widest">
              &copy; 2026 Nirium Protocol<br />
              {lang("Not financial advice.", "No es asesoría financiera.")}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
