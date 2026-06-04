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
          <p className="text-sm font-mono text-zinc-500">Last updated: May 13, 2026</p>
        </div>

        <LegalDisclaimer variant="inline" locale="en" className="mb-12" />
        <LegalDisclaimer variant="inline" locale="es" className="mb-12" />

        <div className="prose prose-invert prose-zinc max-w-none">
          <h2 className="text-white font-bold text-2xl mt-12 mb-4 border-b border-white/10 pb-2">Testnet Status</h2>
          <p>Nirium Protocol is currently deployed exclusively on the Stellar Testnet. All transactions, assets, and operations shown within the dashboard or executed via the API use test network tokens. These tokens hold absolutely no real-world monetary value. The software is in a testing phase and must not be used with real funds until officially launched on the Stellar Mainnet following comprehensive security audits.</p>

          <h2 className="text-white font-bold text-2xl mt-12 mb-4 border-b border-white/10 pb-2">Rate Data and Displays</h2>
          <p>All Annual Percentage Yield (APY) and interest rate figures displayed within the Nirium dashboard are <strong>protocol reference data only</strong>. They do not constitute return projections, guarantees, or financial promises of any kind.</p>
          <ul>
            <li><strong>Blend Protocol Rate:</strong> The ~5.12% reference rate represents the current algorithmic rate dictated by the Blend Protocol's public smart contracts.</li>
            <li><strong>Etherfuse CETES Rate:</strong> The ~5.78% reference rate represents public data sourced via the Etherfuse integration, reflecting the underlying Mexican government bond rate.</li>
          </ul>
          <p>These figures are provided strictly for informational and UI demonstration purposes.</p>

          <h2 className="text-white font-bold text-2xl mt-12 mb-4 border-b border-white/10 pb-2">Non-Custodial Architecture</h2>
          <p>Nirium is purely a software infrastructure provider. <strong>We do not custody user funds.</strong> All operations utilize a non-custodial architecture where the Soroban smart contract acts as the immutable arbiter. User private keys never leave the client's device, and all cryptographic signing is performed client-side via the Freighter Wallet extension. Nirium cannot access, freeze, or move user funds autonomously without a valid signed transaction from the user.</p>

          <h2 className="text-white font-bold text-2xl mt-12 mb-4 border-b border-white/10 pb-2">Open Source Licensing</h2>
          <p>The core components of the Nirium ecosystem are open-sourced to ensure transparency:</p>
          <ul>
            <li><strong>Smart Contracts, SDK, MCP, and Agent API:</strong> Licensed under the Apache License 2.0.</li>
            <li><strong>Dashboard Interface:</strong> Licensed under the Apache 2.0 License.</li>
          </ul>

          <h2 className="text-white font-bold text-2xl mt-12 mb-4 border-b border-white/10 pb-2">SCF Compliance</h2>
          <p>This project operates under the <strong>Stellar Community Fund (SCF) v7.0 framework</strong>. The project has received a $5,000 SCF Kickstart Award (following full KYC procedures) for technical validation. The project is currently awaiting review for the Build Award. We strictly adhere to the guidelines set forth by the SCF program.</p>

          <h2 className="text-white font-bold text-2xl mt-12 mb-4 border-b border-white/10 pb-2">Stellar Code of Conduct</h2>
          <p>We are fully committed to fostering a safe, inclusive, and professional environment. By interacting with the Nirium project, community, or software, you agree to abide by the <a href="https://stellar.org/foundation/code-of-conduct" target="_blank" rel="noopener noreferrer">Stellar Code of Conduct</a> (updated May 2026).</p>

          <h2 className="text-white font-bold text-2xl mt-12 mb-4 border-b border-white/10 pb-2">Security Audits</h2>
          <p>The Nirium software has undergone an internal security evaluation using the JARGUS v3.0 framework, achieving an 83/83 PASS score across evaluated vectors. However, the smart contracts <strong>have not yet been formally audited by an independent third party</strong>. A full external audit is planned for Month 3 via the SCF Audit Bank.</p>

          <h2 className="text-white font-bold text-2xl mt-12 mb-4 border-b border-white/10 pb-2">Mexico Legal & Regulatory Position</h2>
          <p>Nirium provides software-only infrastructure. We are <strong>not</strong> a Financial Technology Institution (Institución de Tecnología Financiera - ITF), we are <strong>not</strong> a Virtual Asset Service Provider (VASP), and we are <strong>not</strong> an Obligated Subject (Sujeto Obligado) under Mexican financial regulations. We do not provide financial advice, broker services, or custody of fiat or digital assets.</p>
        </div>
      </div>
    </div>
  );
}
