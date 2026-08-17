/** Nirium Compliance — Audit trail + IPFS + audit-ready **/
'use client';

import Link from "next/link";
import {
    FileCheck, FileText, ArrowRight, CheckCircle2, Database,
    Sparkles, Layers, Building2, AlertTriangle, Hash, ShieldCheck, 
    Download, ExternalLink, Fingerprint
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/context/LanguageContext";
import { motion } from "framer-motion";
import { ComplianceBanner } from "@/components/ui/ComplianceBanner";

export default function CompliancePage() {
    const { t } = useLanguage();

    return (
        <main className="min-h-screen bg-black text-white antialiased selection:bg-stellar-teal/30">
            {/* Background FX */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,_rgba(45,235,232,0.08),transparent_70%)]" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black,transparent)]" />
            </div>

            <div className="relative z-10">
                {/* HERO */}
                <section className="relative pt-12 pb-20">
                    <div className="max-w-5xl mx-auto px-6">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex justify-center mb-10"
                        >
                            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-stellar-teal/30 bg-stellar-teal/10 text-stellar-teal text-xs font-black uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(45,235,232,0.15)]">
                                <ShieldCheck className="w-4 h-4" />
                                {t.compliance_page.badge}
                            </div>
                        </motion.div>

                        <motion.h1 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-center text-5xl sm:text-7xl lg:text-8xl font-black leading-[0.95] tracking-tight uppercase italic"
                        >
                            {t.compliance_page.hero.title}
                            <br />
                            <span className="bg-gradient-to-r from-stellar-teal via-white to-stellar-yellow bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(45,235,232,0.3)]">
                                Audit-Ready
                            </span>
                        </motion.h1>
                        <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="mt-8 text-center text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed font-mono uppercase tracking-tighter"
                        >
                            {t.compliance_page.hero.subtitle}
                        </motion.p>
                    </div>
                </section>

                <div className="max-w-5xl mx-auto px-6 mb-12">
                    <ComplianceBanner />
                </div>

                {/* THE 4 LAYERS */}
                <section className="py-24 relative overflow-hidden">
                    <div className="max-w-6xl mx-auto px-6">
                        <div className="flex flex-col items-center mb-16">
                            <h2 className="text-3xl sm:text-5xl font-black uppercase italic tracking-tighter text-white mb-4">
                                {t.compliance_page.layers.title}
                            </h2>
                            <div className="h-1 w-20 bg-stellar-teal rounded-full" />
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {[
                                {
                                    num: '01',
                                    icon: Fingerprint,
                                    title: t.compliance_page.layers.hmac.title,
                                    body: t.compliance_page.layers.hmac.desc,
                                    accent: 'from-blue-500/20'
                                },
                                {
                                    num: '02',
                                    icon: Layers,
                                    title: t.compliance_page.layers.chain.title,
                                    body: t.compliance_page.layers.chain.desc,
                                    accent: 'from-purple-500/20'
                                },
                                {
                                    num: '03',
                                    icon: Database,
                                    title: t.compliance_page.layers.ipfs.title,
                                    body: t.compliance_page.layers.ipfs.desc,
                                    accent: 'from-stellar-teal/20'
                                },
                                {
                                    num: '04',
                                    icon: Download,
                                    title: t.compliance_page.layers.cnbv.title,
                                    body: t.compliance_page.layers.cnbv.desc,
                                    accent: 'from-stellar-yellow/20'
                                },
                                {
                                    num: '05',
                                    icon: FileCheck,
                                    title: t.compliance_page.layers.lcp.title,
                                    body: t.compliance_page.layers.lcp.desc,
                                    accent: 'from-emerald-500/20',
                                    span: 'md:col-span-2',
                                },
                            ].map((item: any, idx) => (
                                <motion.div
                                    key={item.num}
                                    initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    className={`group relative p-8 rounded-3xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-500 ${item.span || ''}`}
                                >
                                    <div className={`absolute inset-0 bg-gradient-to-br ${item.accent} to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl`} />
                                    <div className="relative z-10">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 group-hover:border-stellar-teal/50 transition-colors">
                                                <item.icon className="w-6 h-6 text-stellar-teal" />
                                            </div>
                                            <span className="text-4xl font-black text-white/5 group-hover:text-stellar-teal/20 transition-colors italic font-mono">{item.num}</span>
                                        </div>
                                        <h3 className="text-2xl font-black uppercase italic mb-3 text-white tracking-tight">{item.title}</h3>
                                        <p className="text-gray-400 leading-relaxed font-mono text-sm">{item.body}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* THE TARGET MARKET */}
                <section className="py-24 border-t border-white/5 bg-white/[0.01]">
                    <div className="max-w-4xl mx-auto px-6">
                        <h2 className="text-3xl sm:text-5xl font-black text-center uppercase italic tracking-tighter mb-6">
                            {t.compliance_page.fintech_law.title}
                        </h2>
                        <p className="text-center text-gray-400 max-w-2xl mx-auto mb-12 text-lg">
                            {t.compliance_page.fintech_law.subtitle}
                        </p>

                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <div className="p-8 rounded-3xl border border-white/10 bg-black/50 backdrop-blur-xl relative group">
                                <div className="absolute inset-0 bg-stellar-teal/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="relative z-10">
                                    <h3 className="text-xl font-black uppercase italic mb-6 flex items-center gap-3">
                                        <Building2 className="w-6 h-6 text-stellar-teal" />
                                        {t.compliance_page.fintech_law.requirements.title}
                                    </h3>
                                    <ul className="space-y-4">
                                        {t.compliance_page.fintech_law.requirements.items.map((req, i) => (
                                            <li key={i} className="flex items-center gap-3 text-sm text-gray-300">
                                                <div className="w-1.5 h-1.5 rounded-full bg-stellar-teal shadow-[0_0_10px_rgba(45,235,232,0.8)]" />
                                                {req}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] text-center">
                                    <div className="text-3xl font-black text-stellar-teal mb-1">86</div>
                                    <div className="text-[10px] text-gray-500 uppercase tracking-widest font-black leading-tight">
                                        {t.compliance_page.fintech_law.stats.fintechs}
                                    </div>
                                </div>
                                <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] text-center">
                                    <div className="text-3xl font-black text-stellar-teal mb-1">5 min</div>
                                    <div className="text-[10px] text-gray-500 uppercase tracking-widest font-black leading-tight">
                                        {t.compliance_page.fintech_law.stats.integration}
                                    </div>
                                </div>
                                <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] text-center">
                                    <div className="text-3xl font-black text-white mb-1">$0</div>
                                    <div className="text-[10px] text-gray-500 uppercase tracking-widest font-black leading-tight">
                                        {t.compliance_page.fintech_law.stats.cost}
                                    </div>
                                </div>
                                <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] text-center">
                                    <div className="text-3xl font-black text-stellar-yellow mb-1">100%</div>
                                    <div className="text-[10px] text-gray-500 uppercase tracking-widest font-black leading-tight">
                                        {t.compliance_page.fintech_law.stats.automated}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SAMPLE REPORT */}
                <section className="py-24 border-t border-white/5">
                    <div className="max-w-5xl mx-auto px-6">
                        <div className="flex flex-col items-center mb-12">
                            <h2 className="text-3xl sm:text-5xl font-black uppercase italic tracking-tighter mb-4">
                                {t.compliance_page.preview.title}
                            </h2>
                            <p className="text-gray-500 font-mono text-sm uppercase tracking-widest">audit-report-2026-07.json</p>
                        </div>

                        <div className="rounded-3xl border border-white/10 bg-[#080808] shadow-2xl overflow-hidden group">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.02]">
                                <div className="flex items-center gap-3">
                                    <div className="flex gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                                        <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                                    </div>
                                    <span className="text-[10px] text-gray-500 font-mono uppercase ml-4">Regulatory Data Stream // Secure</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] uppercase font-black tracking-widest text-emerald-400 flex items-center gap-1.5">
                                        <CheckCircle2 size={12} />
                                        {t.compliance_page.preview.integrity}
                                    </span>
                                </div>
                            </div>
                            <div className="p-8 font-mono text-xs sm:text-sm text-black dark:text-gray-400 overflow-x-auto leading-relaxed bg-[radial-gradient(circle_at_top_right,_rgba(45,235,232,0.03),transparent)]">
<pre className="text-teal-950 dark:text-stellar-teal/80">
{`{
  "_comment": "EJEMPLO DE FORMATO — no son datos reales de ningún cliente",
  "institution_id": "<tu-id>",
  "report_type": "AGENT_TRANSACTIONS",
  "period_start": "2026-07-01T00:00:00Z",
  "period_end": "2026-07-31T23:59:59Z",
  "record_count": "<n>",
  "total_volume_usdc": "<suma del periodo>",
  "chain_integrity": "VERIFIED",
  "ipfs_cid": "ipfs://<cid>",
  "lcp_bound": false,
  "records": [`}
</pre>
<pre className="text-black dark:text-white">
{`    {
      "folio": "<folio>",
      "fecha_hora": "2026-07-05T14:30:00Z",
      "tipo_operacion": "REBALANCE_USDC_TO_CETES",
      "agente": "<agent-id>",
      "monto_usdc": "<monto>",
      "red_blockchain": "Stellar",
      "hash_transaccion": "8bfca5c5a7909d75817a7ede963...",
      "firma_hmac": "f4e2d9c1b8a7...",
      "content_sha256": "a03d9cdd0d239e48e28e3b6978...",
      "legal_context": {
        "standard": "lcp",
        "atr_hash": "sha-256:a03d9cdd0d239e48...9643ab1",
        "terms": "nirium.xyz/legal/payroll-terms-v1.md",
        "dispute_resolution": "AAA-ICDR"
      },
      "integridad": "VALIDA"
    }`}
</pre>
<pre className="text-zinc-500 dark:text-gray-600">
{`    // ...1246 items more
  ]
}`}
</pre>
                            </div>
                        </div>
                    </div>
                </section>

                {/* DISCLAIMER */}
                <section className="py-12 border-t border-white/5">
                    <div className="max-w-3xl mx-auto px-6">
                        <div className="p-6 rounded-3xl border border-amber-500/20 bg-amber-500/[0.02] flex items-start gap-4">
                            <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-1" />
                            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed uppercase tracking-tight">
                                {t.compliance_page.disclaimer}
                            </p>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="py-32 relative overflow-hidden">
                    <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                        <h2 className="text-4xl sm:text-7xl font-black uppercase italic tracking-tighter mb-8 leading-none">
                            {t.compliance_page.cta.title}
                        </h2>
                        <p className="text-xl text-gray-400 font-mono uppercase tracking-widest mb-12">
                            {t.compliance_page.cta.subtitle}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/sandbox">
                                <Button size="lg" variant="premium" className="px-10 py-8 text-lg rounded-2xl">
                                    {t.compliance_page.cta.try_testnet}
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            </Link>
                            <Link href="/docs">
                                <Button size="lg" variant="outline" className="px-10 py-8 text-lg rounded-2xl border-white/10 hover:bg-white/5">
                                    <FileText className="mr-2 w-5 h-5" />
                                    {t.compliance_page.cta.docs}
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}
