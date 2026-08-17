import type { Metadata } from "next";
import { AlertTriangle } from "lucide-react";
import LegalDisclaimer from "@/components/legal/LegalDisclaimer";

export const metadata: Metadata = {
  title: "Legal Disclaimers — Nirium Protocol",
  description: "Mandatory legal disclaimers and risk disclosures for the Nirium Protocol software.",
};

export default function DisclaimersPage() {
  return (
    <div className="min-h-screen pt-28 pb-24 px-4 md:px-8 bg-black text-zinc-300">
      <div className="max-w-3xl mx-auto">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-[10px] font-mono text-amber-500 mb-6 uppercase tracking-widest">
            <AlertTriangle className="w-3 h-3" /> Mandatory Reading
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-4">
            Legal Disclaimers
          </h1>
          <p className="text-sm font-mono text-zinc-500">Last updated: August 15, 2026</p>
        </div>

        <LegalDisclaimer variant="inline" locale="en" className="mb-12" />
        <LegalDisclaimer variant="inline" locale="es" className="mb-12" />

        <div className="prose prose-invert prose-zinc max-w-none">
          <h2 className="text-white font-bold text-2xl mt-12 mb-4 border-b border-white/10 pb-2">Network Status</h2>
          <p>Nirium runs across two Stellar networks. The <strong>non-custodial nodes — settlement (x402/MPP), audit anchoring and reporting — operate on Stellar Mainnet</strong>; these never hold or move client funds. The <strong>autonomous treasury vault operates on Stellar Testnet, audit-gated</strong>, and will only reach mainnet after a formal external security audit. Testnet operations use test tokens with no real-world monetary value.</p>

          <h2 className="text-white font-bold text-2xl mt-12 mb-4 border-b border-white/10 pb-2">Rate Data and Displays</h2>
          <p>All rate figures displayed within Nirium — the Blend supply rate, the Etherfuse CETES reference rate, network fees — are <strong>public protocol reference data, attributed to their source</strong>. They are not return projections, guarantees, financial promises, or a recommendation to buy, sell or hold anything.</p>
          <ul>
            <li><strong>Blend Protocol Rate:</strong> The ~5.12% reference rate represents the current algorithmic rate dictated by the Blend Protocol's public smart contracts.</li>
            <li><strong>Etherfuse CETES Rate:</strong> The ~5.57% reference rate represents public data sourced via the Etherfuse integration, reflecting the underlying Mexican government bond rate.</li>
          </ul>
          <p>These figures are provided strictly for informational and UI demonstration purposes.</p>

          <h2 className="text-white font-bold text-2xl mt-12 mb-4 border-b border-white/10 pb-2">Non-Custodial Architecture</h2>
          <p>Nirium is purely a software infrastructure provider. <strong>We do not custody user funds.</strong> All operations utilize a non-custodial architecture where the Soroban smart contract acts as the immutable arbiter. User private keys never leave the client's device, and all cryptographic signing is performed client-side via the Freighter Wallet extension. Nirium cannot access, freeze, or move user funds autonomously without a valid signed transaction from the user.</p>

          <h2 className="text-white font-bold text-2xl mt-12 mb-4 border-b border-white/10 pb-2">Restricted Jurisdictions and Sanctions</h2>
          <p>Nirium is established in Mexico and <strong>does not offer its services into jurisdictions where those services would constitute regulated activity</strong>, regardless of how the software is built. Access is prohibited from comprehensively sanctioned jurisdictions, jurisdictions subject to a Financial Action Task Force call for action, and mainland China. Payouts and the Treasury node are additionally not offered in the European Economic Area, the United Kingdom or the United States pending written legal opinion.</p>
          <p>By using any Nirium service you represent, on every occasion of use, that you are not located in or resident of a prohibited jurisdiction and are not a sanctioned person or acting for one. Nirium may block access by technical means, including IP geolocation, and may refuse or terminate service without notice. Because Nirium never holds funds, <strong>termination never strands assets</strong>: your keys, accounts and vaults remain fully usable without us.</p>
          <p>The full policy governs: <a href="/legal/restricted-jurisdictions-v1.md" className="text-stellar-teal underline">Restricted Jurisdictions &amp; Sanctions Policy</a>.</p>

          <h2 className="text-white font-bold text-2xl mt-12 mb-4 border-b border-white/10 pb-2">Open Source Licensing</h2>
          <p>The core components of the Nirium ecosystem are open-sourced to ensure transparency:</p>
          <ul>
            <li><strong>Smart Contracts, SDK, MCP, and Agent API:</strong> Licensed under the Apache License 2.0.</li>
            <li><strong>Dashboard Interface:</strong> Licensed under the Apache 2.0 License.</li>
          </ul>

          <h2 className="text-white font-bold text-2xl mt-12 mb-4 border-b border-white/10 pb-2">Ecosystem Participation</h2>
          <p>Nirium is an independent project in the Stellar developer ecosystem. It has received SCF Kickstart (Instaward) grants for technical validation, completed under full KYC procedures. Amounts are not disclosed here. Nirium adheres to the Stellar Code of Conduct and builds transparently, with on-chain activity verifiable by anyone.</p>

          <h2 className="text-white font-bold text-2xl mt-12 mb-4 border-b border-white/10 pb-2">Stellar Code of Conduct</h2>
          <p>We are fully committed to fostering a safe, inclusive, and professional environment. By interacting with the Nirium project, community, or software, you agree to abide by the <a href="https://stellar.org/foundation/code-of-conduct" target="_blank" rel="noopener noreferrer">Stellar Code of Conduct</a>.</p>

          <h2 className="text-white font-bold text-2xl mt-12 mb-4 border-b border-white/10 pb-2">Security Audits</h2>
          <p>The smart contracts <strong>have not yet been formally audited by an independent third party</strong>. A full external audit is required before the autonomous treasury vault operates on mainnet. Until then, the vault runs on testnet only; the non-custodial settlement, audit and reporting nodes — which never touch client funds — run on mainnet.</p>

          <h2 className="text-white font-bold text-2xl mt-12 mb-4 border-b border-white/10 pb-2">Mexico Legal & Regulatory Position</h2>
          <p>Nirium provides software-only infrastructure. We are <strong>not</strong> a Financial Technology Institution (Institución de Tecnología Financiera - ITF), we are <strong>not</strong> a Virtual Asset Service Provider (VASP), and we are <strong>not</strong> an Obligated Subject (Sujeto Obligado) under Mexican financial regulations. We do not provide financial advice, broker services, or custody of fiat or digital assets.</p>
        </div>
      </div>
    </div>
  );
}
