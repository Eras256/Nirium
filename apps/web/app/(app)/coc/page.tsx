import type { Metadata } from "next";
import { CheckCircle, ExternalLink, HeartHandshake } from "lucide-react";

export const metadata: Metadata = {
  title: "Code of Conduct — Nirium Protocol",
  description: "Community guidelines and Code of Conduct aligned with the Stellar Ecosystem.",
};

export default function CocPage() {
  return (
    <div className="min-h-screen pt-28 pb-24 px-4 md:px-8 bg-black text-zinc-300">
      <div className="max-w-3xl mx-auto">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-stellar-teal/10 border border-stellar-teal/20 rounded-full text-[10px] font-mono text-stellar-teal mb-6 uppercase tracking-widest">
            <CheckCircle className="w-3 h-3" /> Compliance Verification
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-4">
            Code of Conduct
          </h1>
          <p className="text-sm font-mono text-zinc-500">Last updated: May 13, 2026</p>
        </div>

        <div className="prose prose-invert prose-zinc max-w-none">
          <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl mb-12">
            <h2 className="text-white font-bold text-xl mb-3 flex items-center gap-2 mt-0">
              <HeartHandshake className="w-5 h-5 text-stellar-teal" />
              Stellar Code of Conduct Alignment
            </h2>
            <p className="text-sm m-0">
              The Nirium Protocol community, developers, and ecosystem operate in strict alignment with the <strong>Stellar Code of Conduct (updated May 2026)</strong>. We believe in building a welcoming, professional, and transparent environment for everyone.
            </p>
            <a 
              href="https://stellar.org/foundation/code-of-conduct" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-stellar-teal mt-4 hover:underline underline-offset-4"
            >
              Read the official Stellar Code of Conduct <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          <h2 className="text-white font-bold text-2xl mt-12 mb-6 border-b border-white/10 pb-2">The 5 Principles in Practice</h2>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-white font-bold text-lg mb-2">1. Transparency</h3>
              <p className="text-sm text-zinc-400">
                We build in the open. Every action executed by the Nirium agent infrastructure is fully auditable on-chain. Users can independently verify our testnet transactions via <a href="https://stellar.expert/explorer/testnet" target="_blank" rel="noopener noreferrer" className="text-stellar-teal hover:underline">Stellar Expert</a>.
              </p>
            </div>

            <div>
              <h3 className="text-white font-bold text-lg mb-2">2. Integrity</h3>
              <p className="text-sm text-zinc-400">
                We do not employ deceptive practices, hype marketing, or front-running. The Soroban contract enforces best execution cryptographically. As our architecture dictates: <em>"The LLM suggests, the contract decides."</em>
              </p>
            </div>

            <div>
              <h3 className="text-white font-bold text-lg mb-2">3. Safety</h3>
              <p className="text-sm text-zinc-400">
                User protection is paramount. Our architecture is strictly non-custodial. All operations require client-side signing via Freighter. We empower users by ensuring they always hold their own keys.
              </p>
            </div>

            <div>
              <h3 className="text-white font-bold text-lg mb-2">4. Professionalism</h3>
              <p className="text-sm text-zinc-400">
                We maintain high standards of communication across all platforms. We do not use speculative language or make yield promises. Official communication is restricted to Discord, GitHub, and Mirror.
              </p>
            </div>

            <div>
              <h3 className="text-white font-bold text-lg mb-2">5. Open Source</h3>
              <p className="text-sm text-zinc-400">
                We contribute back to the ecosystem. Our core smart contracts, SDK, MCP (Model Context Protocol), and Agent API are published under the permissive Apache 2.0 license.
              </p>
            </div>
          </div>

          <h2 className="text-white font-bold text-2xl mt-16 mb-4 border-b border-white/10 pb-2">Nirium Community Standards</h2>
          <p>When interacting in our Discord, GitHub issues, or social channels, participants must:</p>
          <ul>
            <li>Use welcoming and inclusive language.</li>
            <li>Be respectful of differing viewpoints and experiences.</li>
            <li>Gracefully accept constructive criticism.</li>
            <li>Focus on what is best for the community.</li>
            <li>Show empathy towards other community members.</li>
          </ul>

          <h2 className="text-white font-bold text-2xl mt-12 mb-4 border-b border-white/10 pb-2">Reporting Violations</h2>
          <p>We take code of conduct violations seriously. If you experience or witness unacceptable behavior, please report it immediately through the appropriate channel:</p>
          
          <div className="grid sm:grid-cols-2 gap-4 mt-6">
            <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-xl">
              <div className="font-bold text-white mb-1">SCF & Ecosystem Violations</div>
              <p className="text-sm text-zinc-400 mb-3">For issues concerning the broader Stellar ecosystem guidelines.</p>
              <a href="mailto:community@stellar.org" className="text-stellar-teal text-sm font-mono hover:underline">community@stellar.org</a>
            </div>
            <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-xl">
              <div className="font-bold text-white mb-1">Nirium-Specific Violations</div>
              <p className="text-sm text-zinc-400 mb-3">For issues specifically within Nirium's repositories or Discord.</p>
              <a href="mailto:xvaiosx7@gmail.com" className="text-stellar-teal text-sm font-mono hover:underline">xvaiosx7@gmail.com</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
