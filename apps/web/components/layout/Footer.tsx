"use client";

import Link from "next/link";
import { ExternalLink, ShieldCheck, Github } from "lucide-react";
import LegalDisclaimer from "@/components/legal/LegalDisclaimer";

export default function Footer() {
  return (
    <footer className="w-full bg-[#050505] border-t border-white/10 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8">
          
          {/* Brand Column */}
          <div className="md:col-span-3 flex flex-col space-y-4">
            <Link href="/" className="inline-block w-fit">
              <span className="text-xl font-black tracking-tighter text-white">NIRIUM</span>
            </Link>
            <p className="text-sm text-zinc-400 max-w-xs leading-relaxed">
              Open-source AI treasury agent SDK on Stellar.
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
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-widest mb-2">Navigation</h4>
            <ul className="space-y-3">
              <li><Link href="/dashboard" className="text-sm text-zinc-400 hover:text-white transition-colors">Product Dashboard</Link></li>
              <li><Link href="/developers" className="text-sm text-zinc-400 hover:text-white transition-colors">Developers</Link></li>
              <li><Link href="/docs" className="text-sm text-zinc-400 hover:text-white transition-colors">Documentation</Link></li>
              <li>
                <a href="https://github.com/Eras256/Nirium" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors">
                  GitHub <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Ecosystem Column */}
          <div className="md:col-span-3 flex flex-col space-y-4">
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-widest mb-2">Ecosystem</h4>
            <ul className="space-y-3">
              <li><a href="https://communityfund.stellar.org/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors">Stellar Community Fund <ExternalLink className="w-3 h-3" /></a></li>
              <li><a href="https://developers.stellar.org/docs" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors">Developer Docs <ExternalLink className="w-3 h-3" /></a></li>
              <li><a href="http://discord.gg/stellardev" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors">Stellar Discord <ExternalLink className="w-3 h-3" /></a></li>
              <li><a href="https://stellar.gitbook.io/scf-handbook/scf-awards/build-award/integration-track" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors">SCF Integration Track <ExternalLink className="w-3 h-3" /></a></li>
            </ul>
          </div>

          {/* Legal Links Right Column */}
          <div className="md:col-span-3 flex flex-col space-y-4">
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-widest mb-2">Legal & Compliance</h4>
            <ul className="space-y-3">
              <li><Link href="/disclaimers" className="text-sm text-zinc-400 hover:text-amber-400 transition-colors">Mandatory Disclaimers</Link></li>
              <li><Link href="/privacy" className="text-sm text-zinc-400 hover:text-white transition-colors">Privacy Policy (LFPDPPP)</Link></li>
              <li><Link href="/terms" className="text-sm text-zinc-400 hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/coc" className="text-sm text-zinc-400 hover:text-white transition-colors">Code of Conduct</Link></li>
              <li><Link href="/compliance" className="text-sm text-zinc-400 hover:text-white transition-colors">Compliance Hub</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-black border-t border-white/5 py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-8">
            <LegalDisclaimer variant="footer" locale="en" />
          </div>
          
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 text-[10px] font-mono text-zinc-500">
              <span className="px-2 py-1 rounded bg-white/5 border border-white/10 uppercase tracking-wider text-zinc-300">
                Apache 2.0 (Protocol & Interface)
              </span>
              <span className="px-2 py-1 rounded bg-stellar-teal/10 border border-stellar-teal/20 text-stellar-teal uppercase tracking-wider">
                Non-custodial · Stellar Testnet
              </span>
              <a 
                href="https://communityfund.stellar.org" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-2 py-1 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400 uppercase tracking-wider hover:bg-purple-500/20 transition-colors"
              >
                <ShieldCheck className="w-3 h-3" />
                SCF Kickstart Verified
              </a>
            </div>

            <div className="text-[10px] text-zinc-500 font-mono text-center lg:text-right uppercase tracking-widest">
              &copy; 2026 Nirium Protocol<br />
              Not financial advice.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
