"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation"; // Added
import { Suspense, useState, useEffect } from "react"; // Restored useEffect
import {
    ArrowLeft, Book, Code, Shield, Layers, Cpu, Database, Zap,
    GitBranch, FileCode, Rocket, CheckCircle, AlertTriangle,
    Terminal, Globe, Lock, TrendingUp, ChevronRight, ChevronLeft, ExternalLink,
    Play, Settings, Users, Workflow, Key, Lightbulb, HardDrive, FileCheck, BookOpen, Activity, Heart, Clock
} from "lucide-react";
import { SectionBrandLogo } from "@/components/ui/SectionBrandLogo";
import { useLanguage } from "../../context/LanguageContext";
import Navbar from "@/components/layout/Navbar";
import ApiKeyManager from "@/components/docs/ApiKeyManager";

type TabId = 'overview' | 'architecture' | 'contracts' | 'agent' | 'frontend' | 'api' | 'security' | 'ideas' | 'builder';

function DocsContent() {
    const { t } = useLanguage();
    const searchParams = useSearchParams();

    const tabs = [
        { id: 'overview' as TabId, label: t.docs.nav.overview, icon: Book },
        { id: 'api' as TabId, label: 'API & SANDBOX', icon: Terminal },
        { id: 'ideas' as TabId, label: t.docs.nav.ideas, icon: Lightbulb },
        { id: 'architecture' as TabId, label: t.docs.nav.architecture, icon: Layers },
        { id: 'contracts' as TabId, label: t.docs.nav.security, icon: Code },
        { id: 'agent' as TabId, label: 'UNIDADES AUTÓNOMAS', icon: Cpu },
        { id: 'builder' as TabId, label: 'ARQUITECTO DE ESTRATEGIAS', icon: Workflow },
        { id: 'frontend' as TabId, label: 'INTERFAZ DE COMANDO', icon: Globe },
        { id: 'security' as TabId, label: t.docs.nav.security, icon: Shield },
    ];
    const initialTabParam = searchParams.get('tab');
    const isValidTab = (t: string | null): t is TabId => tabs.some(tab => tab.id === t);
    const initialTab = isValidTab(initialTabParam) ? initialTabParam : 'overview';

    const [activeTab, setActiveTab] = useState<TabId>(initialTab);

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (isValidTab(tab)) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    return (
        <main className="min-h-screen bg-black text-white font-sans selection:bg-stellar-teal/30">
            <Navbar />

            <div className="fixed inset-0 z-0">
                <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-stellar-yellow/20 to-transparent opacity-50" />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-stellar-teal/10 blur-[120px] rounded-full" />
            </div>

            <div className="relative z-10 pt-36">
                <div className="max-w-[1600px] w-full mx-auto px-6 pb-8 border-b border-white/10">
                    <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        {t.docs.overview.back}
                    </Link>

                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-12">
                        <div className="flex flex-col lg:flex-row items-center lg:items-center gap-8">
                            <SectionBrandLogo className="!justify-start mb-0" size="w-32 lg:w-48" />
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="bg-gradient-to-r from-stellar-teal to-stellar-yellow p-2 rounded-lg">
                                        <Book className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <h1 className="text-4xl md:text-7xl font-black font-mono tracking-tighter uppercase leading-none">{t.docs.overview.title}</h1>
                                        <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-mono rounded-full border border-green-500/30 animate-pulse">
                                            v0.0.7
                                        </span>
                                    </div>
                                </div>
                                <p className="text-xl text-gray-400 max-w-2xl leading-relaxed">
                                    {t.docs.overview.subtitle}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <a href="https://stellar.expert/explorer/testnet" target="_blank" className="px-4 py-2 bg-stellar-teal/10 border border-stellar-teal/30 rounded-lg text-sm font-medium text-stellar-teal hover:bg-stellar-teal/20 transition-colors flex items-center gap-2">
                                <ExternalLink className="w-4 h-4" />
                                StellarExpert
                            </a>
                        </div>
                    </div>
                </div>

                <div className="sticky top-16 z-20 bg-black/80 backdrop-blur-xl border-b border-white/10">
                    <div className="max-w-[1600px] w-full mx-auto px-6">
                        <div className="flex overflow-x-auto scrollbar-hide gap-1 py-2">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab.id
                                        ? 'bg-stellar-teal/20 text-stellar-teal border border-stellar-teal/30'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="max-w-[1600px] w-full mx-auto px-6 py-12">
                    <div className="min-h-[60vh]">
                        {activeTab === 'overview' && <OverviewSection />}
                        {activeTab === 'ideas' && <IdeasSection />}
                        {activeTab === 'architecture' && <ArchitectureSection />}
                        {activeTab === 'contracts' && <ContractsSection />}
                        {activeTab === 'agent' && <AgentSection />}
                        {activeTab === 'builder' && <BuilderSection />}
                        {activeTab === 'frontend' && <FrontendSection />}
                        {activeTab === 'api' && <ApiSection />}
                        {activeTab === 'security' && <SecuritySection />}
                    </div>

                    {/* Sequential Navigation Footer */}
                    <div className="mt-24 pt-12 border-t border-white/10 flex justify-between items-center gap-8">
                        {(() => {
                            const currentIndex = tabs.findIndex(t => t.id === activeTab);
                            const prevTab = currentIndex > 0 ? tabs[currentIndex - 1] : null;
                            const nextTab = currentIndex < tabs.length - 1 ? tabs[currentIndex + 1] : null;

                            const handleTabChange = (id: TabId) => {
                                setActiveTab(id);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            };

                            return (
                                <>
                                    <div className="flex-1">
                                        {prevTab ? (
                                            <button
                                                onClick={() => handleTabChange(prevTab.id)}
                                                className="group flex flex-col items-start gap-2 max-w-[280px]"
                                            >                                                <div className="flex items-center gap-2 text-xs font-mono text-gray-500 group-hover:text-stellar-teal transition-colors text-left">
                                                    <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                                                    {t.docs.nav.previous}
                                                </div>
                                                <div className="text-lg font-bold text-gray-400 group-hover:text-white transition-colors text-left uppercase tracking-tight">
                                                    {prevTab.label}
                                                </div>
                                            </button>
                                        ) : <div />}
                                    </div>

                                    <div className="hidden sm:block w-px h-12 bg-white/5" />

                                    <div className="flex-1 flex justify-end">
                                        {nextTab ? (
                                            <button
                                                onClick={() => handleTabChange(nextTab.id)}
                                                className="group flex flex-col items-end gap-2 max-w-[280px]"
                                            >
                                                <div className="flex items-center gap-2 text-xs font-mono text-gray-500 group-hover:text-stellar-teal transition-colors text-right">
                                                    {t.docs.nav.next}
                                                    <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                                </div>
                                                <div className="text-lg font-bold text-gray-400 group-hover:text-white transition-colors text-right uppercase tracking-tight">
                                                    {nextTab.label}
                                                </div>

                                            </button>
                                        ) : (
                                            <div className="h-1" />
                                        )}
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                </div>
            </div>
        </main>
    );
}

export default function DocsPage() {
    return (
        // @ts-ignore - React 19 type mismatch in Next.js
        <Suspense fallback={
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-pulse text-stellar-teal font-mono">LOADING FIELD MANUAL...</div>
            </div>
        }>
            <DocsContent />
        </Suspense>
    );
}

function OverviewSection() {
    const { t } = useLanguage();
    return (
        <div className="space-y-12">
            {/* Hero Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                    { label: t.docs.overview.stats.version, value: 'v0.0.7', color: 'text-stellar-teal' },
                    { label: t.docs.overview.stats.tests, value: '12/12 ✓', color: 'text-green-400' },
                    { label: t.docs.overview.stats.plugins, value: '13+ Active', color: 'text-purple-400' },
                    { label: t.docs.overview.stats.fee, value: '0.3%', color: 'text-amber-400' },
                    { label: t.docs.overview.stats.assets, value: 'XLM + USDC', color: 'text-blue-400' },
                ].map((stat) => (
                    <div key={stat.label} className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">{stat.label}</div>
                        <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                    </div>
                ))}
            </div>

            {/* Executive Summary */}
            <section className="bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-2xl p-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <Shield className="text-stellar-yellow" />
                    {t.docs.overview.summary_title}
                </h2>
                <div className="prose prose-invert max-w-none text-gray-300 space-y-4">
                    <p className="text-lg leading-relaxed">
                        <strong>Nirium</strong> is an institutional-grade DeFi protocol on the Stellar Network that integrates
                        <strong className="text-stellar-teal"> atomic path execution</strong> with
                        <strong className="text-stellar-yellow"> autonomous AI agents</strong>.
                    </p>
                    <p>
                        The protocol leverages <strong>Soroban Smart Contracts</strong> to guarantee
                        transaction safety at the protocol level, while <strong>ElizaOS</strong> powers intelligent off-chain
                        agents that analyze market conditions and orchestrate transactions via Multi-Operation Transactions.
                    </p>
                </div>
            </section>

            {/* Progressive Automation */}
            <section>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <Cpu className="text-stellar-teal" />
                    {t.docs.overview.progressive_title}
                </h2>
                <p className="text-gray-400 mb-6">
                    Nirium solves the biggest AI-Crypto dilemma: <strong className="text-white">Security vs. Autonomy</strong>
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-black/40 p-6 rounded-xl border border-stellar-yellow/30 hover:border-stellar-yellow/50 transition-colors">
                        <h3 className="text-xl font-bold text-stellar-yellow mb-4 flex items-center gap-2">
                            <Shield className="w-5 h-5" />
                            Copilot Mode
                        </h3>
                        <ul className="space-y-3 text-gray-300">
                            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> User signs every transaction</li>
                            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Human-speed execution</li>
                            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Non-custodial & Trustless</li>
                            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Best for security-focused users</li>
                        </ul>
                    </div>
                    <div className="bg-black/40 p-6 rounded-xl border border-stellar-teal/30 hover:border-stellar-teal/50 transition-colors">
                        <h3 className="text-xl font-bold text-stellar-teal mb-4 flex items-center gap-2">
                            <Zap className="w-5 h-5" />
                            Autonomous Mode
                        </h3>
                        <ul className="space-y-3 text-gray-300">
                            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Agent signs with Private Key</li>
                            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Superhuman speed (milliseconds)</li>
                            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Fully Agentic Loop</li>
                            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Best for HFT & MEV searchers</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Key Features */}
            <section>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <Rocket className="text-amber-400" />
                    Key Features (v0.0.7)
                </h2>
                <div className="grid md:grid-cols-3 gap-4">
                    {[
                        { icon: Workflow, title: 'Visual Strategy Builder', desc: 'Drag-and-drop node editor for custom strategies', color: 'text-purple-400' },
                        { icon: BookOpen, title: 'Operations Manual', desc: 'Step-by-step guide for protocol operators', color: 'text-stellar-teal' },
                        { icon: Layers, title: 'Strategy Marketplace', desc: '16+ pre-built strategies. XLM & USDC asset selector on each card.', color: 'text-blue-400' },
                        { icon: TrendingUp, title: 'Dashboard Command Center', desc: 'Real-time metrics, Active Fleet, execution logs', color: 'text-green-400' },
                        { icon: Lock, title: 'Multi-Asset Vaults', desc: 'Deploy XLM or USDC vaults — per-strategy asset selection', color: 'text-amber-400' },
                        { icon: HardDrive, title: 'Neural Archive & Supabase', desc: 'Hybrid decentralized storage for forensic logs via IPFS', color: 'text-pink-400' },
                    ].map((feature) => (
                        <div key={feature.title} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-colors">
                            <feature.icon className={`w-6 h-6 ${feature.color} mb-3`} />
                            <h3 className="font-bold text-white mb-1">{feature.title}</h3>
                            <p className="text-sm text-gray-400">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Verified Transactions */}
            <section className="bg-green-500/5 border border-green-500/20 rounded-2xl p-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <CheckCircle className="text-green-400" />
                    Verified On-Chain Execution
                </h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/10 text-gray-400 text-sm">
                                <th className="py-3 px-4">Transaction</th>
                                <th className="py-3 px-4">Amount</th>
                                <th className="py-3 px-4">Fee</th>
                                <th className="py-3 px-4">Status</th>
                                <th className="py-3 px-4">Link</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            <tr className="border-b border-white/5">
                                <td className="py-3 px-4 font-mono text-stellar-teal">5X6TDFkYvjvCb2LS...</td>
                                <td className="py-3 px-4">0.1 XLM</td>
                                <td className="py-3 px-4 text-gray-400">0.0003 XLM</td>
                                <td className="py-3 px-4"><span className="text-green-400">✓ Success</span></td>
                                <td className="py-3 px-4">
                                    <a href="https://stellar.expert/explorer/testnet/tx/5X6TDFkYvjvCb2LSE37DC7qNFs7UDgNy9izTs7amNanG" target="_blank" className="text-stellar-teal hover:underline flex items-center gap-1">
                                        View <ExternalLink className="w-3 h-3" />
                                    </a>
                                </td>
                            </tr>
                            <tr className="border-b border-white/5">
                                <td className="py-3 px-4 font-mono text-stellar-teal">ExYe8kirfrUVkehc...</td>
                                <td className="py-3 px-4">0.05 XLM</td>
                                <td className="py-3 px-4 text-gray-400">0.0001 XLM</td>
                                <td className="py-3 px-4"><span className="text-green-400">✓ Success</span></td>
                                <td className="py-3 px-4">
                                    <a href="https://stellar.expert/explorer/testnet/tx/ExYe8kirfrUVkehcz63NvDzSzZPz2gAoLoVyCpUcVESP" target="_blank" className="text-stellar-teal hover:underline flex items-center gap-1">
                                        View <ExternalLink className="w-3 h-3" />
                                    </a>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className="mt-4 text-sm text-gray-400">
                    <strong>Agent Wallet:</strong> <code className="text-stellar-teal">G...stellar_address</code>
                </div>
            </section>
        </div>
    );
}

function ArchitectureSection() {
    const { t } = useLanguage();
    return (
        <div className="space-y-12">
            {/* System Diagram */}
            <section>
                <h2 className="text-2xl font-bold mb-6">{t.docs.nav.architecture}</h2>
                <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 font-mono text-sm overflow-x-auto">
                    <pre className="text-gray-300 whitespace-pre">
                        {`┌─────────────────────────────────────────────────────────────────────────┐
│                           USER INTERFACE                                 │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌────────┐ │
│  │ Dashboard │  │ Strategies│  │ Analytics │  │  Builder  │  │ Agents │ │
│  │ XLM/USDC  │  │ Arsenal   │  │ (Charts)  │  │ Drag/Drop │  │  CMD   │ │
│  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘  └────┬───┘ │
└────────┼──────────────┼──────────────┼──────────────┼──────────────┼────┘
         │              │              │              │              │
         ▼              ▼              ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        @stellar/freighter-api                           │
│       (Wallet Connection, Auto-Reconnect, Transaction Signing)          │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │
          ┌─────────────────────┼──────────────────────────┐
          ▼                     ▼                          ▼
┌──────────────────┐  ┌──────────────────┐  ┌─────────────────────────┐
│    SUPABASE      │  │   LOCALSTORAGE   │  │     STELLAR TESTNET     │
│  (Persistence)   │  │    (Cache)       │  │  (Blockchain)           │
│  - strategies    │  │  - drafts        │  │  - soroban_contracts    │
│  - profiles      │  │  - fleet         │  │  - SDEX_Liquidity       │
│  - agent_logs    │  │                  │  │  - Vault<XLM|USDC>      │
└──────────────────┘  └──────────────────┘  └─────────────────────────┘
         │
         ▼
┌──────────────────┐
│  NEURAL ARCHIVE  │
│  (Decentralized) │
│  - audit logs    │
│  - content-addr  │
│  - tamper-proof  │
└──────────────────┘`}
                    </pre>
                </div>
            </section>

            {/* Layers */}
            <section>
                <h2 className="text-2xl font-bold mb-6">Architecture Layers</h2>
                <div className="space-y-4">
                    {[
                        {
                            title: 'On-Chain (Stellar Network)',
                            icon: Database,
                            color: 'border-stellar-teal',
                            items: ['Blend Protocol (Lending)', 'SDEX / Phoenix (Execution)', 'Enforces Soroban safety guarantees']
                        },
                        {
                            title: 'Off-Chain (Agent Runtime)',
                            icon: Cpu,
                            color: 'border-stellar-yellow',
                            items: ['Runs ElizaOS logic with Stellar SDK', 'Constructs Multi-Op transactions', 'Analyzes market opportunities']
                        },
                        {
                            title: 'Persistence Layer',
                            icon: Layers,
                            color: 'border-amber-500',
                            items: ['Supabase for cloud strategy & log storage', 'LocalStorage for client-side cache', 'IPFS / Neural Archive for immutable audit logs', 'Hybrid sync with deduplication across all layers']
                        },
                        {
                            title: 'User Interface (Web)',
                            icon: Globe,
                            color: 'border-green-500',
                            items: ['Visual strategy builder', 'Transaction signing via Freighter', 'Auto-connect wallet persistence']
                        },
                    ].map((layer) => (
                        <div key={layer.title} className={`bg-white/5 border-l-4 ${layer.color} rounded-r-xl p-6`}>
                            <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                                <layer.icon className="w-5 h-5" />
                                {layer.title}
                            </h3>
                            <ul className="space-y-2 text-gray-400 text-sm">
                                {layer.items.map((item, i) => (
                                    <li key={i} className="flex items-center gap-2">
                                        <ChevronRight className="w-3 h-3 text-gray-600" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </section>

            {/* Data Flow */}
            <section className="bg-white/5 border border-white/10 rounded-2xl p-8">
                <h2 className="text-2xl font-bold mb-6">Strategy Deployment Flow</h2>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {[
                        { step: '01', title: 'Select', desc: 'Choose strategy from Marketplace or Builder' },
                        { step: '02', title: 'Configure', desc: 'Set parameters and risk limits' },
                        { step: '03', title: 'Sign', desc: 'Approve with wallet signature' },
                        { step: '04', title: 'Execute', desc: '5-step atomic transaction' },
                        { step: '05', title: 'Monitor', desc: 'Track in Active Fleet' },
                    ].map((item, i) => (
                        <div key={item.step} className="relative">
                            <div className="text-center">
                                <div className="text-4xl font-black text-white/10 mb-2">{item.step}</div>
                                <div className="w-3 h-3 rounded-full bg-stellar-teal mx-auto mb-3" />
                                <h3 className="font-bold text-white mb-1">{item.title}</h3>
                                <p className="text-xs text-gray-400">{item.desc}</p>
                            </div>
                            {i < 4 && (
                                <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-gradient-to-r from-stellar-teal/50 to-transparent" />
                            )}
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}

function ContractsSection() {
    const { t } = useLanguage();
    return (
        <div className="space-y-12">
            {/* Deployed Contracts */}
            <section>
                <h2 className="text-2xl font-bold mb-6">{t.docs.api.contracts_title} (Testnet v0.0.7)</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 text-gray-400 text-sm">
                                <th className="py-3 px-4">{t.common.component}</th>
                                <th className="py-3 px-4">{t.common.address}</th>
                                <th className="py-3 px-4">{t.common.description}</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm font-mono">
                            <tr className="border-b border-white/5 hover:bg-white/5">
                                <td className="py-4 px-4 text-white font-bold">Protocol</td>
                                <td className="py-4 px-4 text-stellar-teal break-all">
                                    <a href="https://stellar.expert/explorer/testnet/contract/C..." target="_blank" className="hover:underline">
                                        C...contract_id
                                    </a>
                                </td>
                                <td className="py-4 px-4 text-gray-400">Soroban Contract Logic</td>
                            </tr>
                            <tr className="border-b border-white/5 hover:bg-white/5">
                                <td className="py-4 px-4 text-white font-bold">Liquidity Pool</td>
                                <td className="py-4 px-4 text-amber-500 break-all">
                                    <a href="https://stellar.expert/explorer/testnet/contract/C..." target="_blank" className="hover:underline">
                                        C...pool_id
                                    </a>
                                </td>
                                <td className="py-4 px-4 text-gray-400">Stellar Native Atomic Primitive</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Soroban Structs */}
            <section>
                <h2 className="text-2xl font-bold mb-6">Soroban Contract State</h2>
                <div className="space-y-6">
                    <div className="bg-[#0A0A0A] border border-white/10 rounded-xl overflow-hidden">
                        <div className="px-4 py-2 bg-white/5 border-b border-white/10 flex items-center gap-2">
                            <FileCode className="w-4 h-4 text-stellar-teal" />
                            <span className="text-sm font-mono text-gray-400">AgentLicense</span>
                        </div>
                        <pre className="p-4 text-sm font-mono text-gray-300 overflow-x-auto">
                            {`#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct AgentLicense {
    pub owner: Address,
    pub agent_id: BytesN<32>,
    pub expires_at: u64,
}

#[contracttype]
pub enum DataKey {
    License(Address),
}`}
                        </pre>
                    </div>

                    <div className="bg-[#0A0A0A] border border-white/10 rounded-xl overflow-hidden">
                        <div className="px-4 py-2 bg-white/5 border-b border-white/10 flex items-center gap-2">
                            <FileCode className="w-4 h-4 text-amber-500" />
                            <span className="text-sm font-mono text-gray-400">NiriumAgent Implementation</span>
                        </div>
                        <pre className="p-4 text-sm font-mono text-gray-300 overflow-x-auto">
                            {`#[contractimpl]
impl NiriumAgent {
    pub fn authorize_agent(env: Env, owner: Address, agent_id: BytesN<32>) {
        owner.require_auth();
        // Storage logic...
    }
}`}
                        </pre>
                    </div>
                </div>
            </section>

            {/* Functions */}
            <section>
                <h2 className="text-2xl font-bold mb-6">Key Functions</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-white/10 text-gray-400">
                                <th className="py-3 px-4">Function</th>
                                <th className="py-3 px-4">Signature</th>
                                <th className="py-3 px-4">Description</th>
                            </tr>
                        </thead>
                        <tbody className="font-mono">
                            {[
                                { fn: 'authorize_agent', sig: 'pub fn authorize_agent(e, owner, id)', desc: 'Registers agent ID for owner' },
                                { fn: 'revoke_agent', sig: 'pub fn revoke_agent(e, owner)', desc: 'Revokes agent authorization' },
                                { fn: 'execute_path', sig: 'pub fn execute_path(e, path, amount)', desc: 'Atomic path payment execution' },
                                { fn: 'harvest_yield', sig: 'pub fn harvest_yield(e, vault)', desc: 'Compounding yield harvest' },
                            ].map((item) => (
                                <tr key={item.fn} className="border-b border-white/5 hover:bg-white/5">
                                    <td className="py-3 px-4 text-stellar-teal">{item.fn}</td>
                                    <td className="py-3 px-4 text-gray-400 text-xs">{item.sig}</td>
                                    <td className="py-3 px-4 text-gray-400 font-sans">{item.desc}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Test Results */}
            <section className="bg-green-500/5 border border-green-500/20 rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <CheckCircle className="text-green-400" />
                    Integration Tests
                </h2>
                <div className="font-mono text-[10px] sm:text-sm space-y-2 overflow-x-hidden">
                    {[
                        'test_authorize_agent',
                        'test_revoke_agent',
                        'test_atomic_path_payment',
                        'test_flash_loan_callback',
                    ].map((test) => (
                        <div key={test} className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-2 py-1 border-b border-white/5 xs:border-0">
                            <span className="text-green-400 font-bold shrink-0">[PASS]</span>
                            <span className="text-gray-400 break-all md:break-normal">nirium::contracts::{test}</span>
                        </div>
                    ))}
                    <div className="mt-4 pt-4 border-t border-white/10 text-green-400">
                        Test result: OK. Total tests: 24; passed: 24; failed: 0
                    </div>
                </div>
            </section>
        </div>
    );
}

function AgentSection() {
    const { t } = useLanguage();
    return (
        <div className="space-y-12">
            {/* Overview */}
            <section>
                <h2 className="text-2xl font-bold mb-6">AI Agent (ElizaOS)</h2>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <h3 className="font-bold text-white mb-4">Framework</h3>
                        <ul className="space-y-2 text-gray-400 text-sm">
                            <li>• ElizaOS v1.x with custom Stellar Plugin</li>
                            <li>• Real transaction signing (Ed25519)</li>
                            <li>• Bech32 (S-address) support</li>
                            <li>• Multi-Op construction & execution</li>
                        </ul>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <h3 className="font-bold text-white mb-4">Status</h3>
                        <div className="flex items-center gap-2 text-green-400">
                            <CheckCircle className="w-5 h-5" />
                            <span className="font-bold">REAL SIGNING - Verified On-Chain</span>
                        </div>
                        <p className="text-sm text-gray-400 mt-2">
                            Agent Wallet: <code className="text-stellar-teal">G...stellar_address</code>
                        </p>
                    </div>
                </div>
            </section>

            {/* File Structure */}
            <section>
                <h2 className="text-2xl font-bold mb-6">File Structure</h2>
                <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-4 font-mono text-[10px] xs:text-xs sm:text-sm overflow-x-auto scrollbar-thin scrollbar-thumb-white/10">
                    <pre className="text-gray-400 whitespace-pre">
                        {`packages/agent/src/
├── actions/
│   ├── executeAtomicPath.ts        # Path payment builder (XLM + USDC)
│   ├── executeMainnetStrategy.ts   # Per-vault strategy executor
│   └── executeBuilderStrategy.ts   # Custom kernel executor (Builder)
├── services/
│   ├── matrixHub.ts                # Central agent orchestration
│   ├── skillManager.ts             # Dynamic capability loader
│   ├── archiveService.ts           # IPFS audit log uploader
│   ├── llmService.ts               # Neural brain integration
│   ├── browserService.ts           # Web scraping & deep research
│   ├── xService.ts                 # Social sentiment analysis (X)
│   └── knowledgeService.ts         # Market context engine
├── providers/
│   └── stellarProvider.ts          # Blockchain interface
├── server.ts                       # Express REST API + Webhooks
└── run.ts                          # Autonomous loop runner`}
                    </pre>
                </div>
            </section>

            {/* Action Flow */}
            <section>
                <h2 className="text-2xl font-bold mb-6">EXECUTE_ATOMIC_PATH Action</h2>
                <div className="space-y-4">
                    {[
                        { step: 1, title: 'Parse Intent', desc: 'Extract amount from user message' },
                        { step: 2, title: 'Load Keypair', desc: 'Load Ed25519 keypair from environment' },
                        { step: 3, title: 'Build Transaction', desc: 'Construct Stellar Transaction with operations' },
                        { step: 4, title: 'Sign & Execute', desc: 'Sign Envelope and submit to Horizon' },
                        { step: 5, title: 'Return Result', desc: 'Return hash and StellarExpert link' },
                    ].map((item) => (
                        <div key={item.step} className="flex items-start gap-4 bg-white/5 rounded-lg p-4">
                            <div className="w-8 h-8 rounded-full bg-stellar-teal/20 text-stellar-teal flex items-center justify-center font-bold shrink-0">
                                {item.step}
                            </div>
                            <div>
                                <h4 className="font-bold text-white">{item.title}</h4>
                                <p className="text-sm text-gray-400">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Usage */}
            <section className="bg-[#0A0A0A] border border-white/10 rounded-xl overflow-hidden">
                <div className="px-4 py-2 bg-white/5 border-b border-white/10 flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-mono text-gray-400">Usage</span>
                </div>
                <pre className="p-4 text-sm font-mono text-gray-300">
                    {`# Run agent (XLM vault — default 0.1 XLM)
pnpm --filter @nirium/agent dev

# Run with custom XLM amount
pnpm --filter @nirium/agent dev "Loop 0.5 XLM please"

# Run agent on USDC vault
pnpm --filter @nirium/agent dev "Loop 10 USDC"

# Expected output (any asset):
🚀 NIRIUM AGENT v0.0.7
🤖 Agent Wallet: G...stellar_address
🔍 Scanning pools for liquidity...
🧱 Constructing Atomic Loop Transaction...
📝 Signing transaction...
✅ Transaction Successful: 5X6TDFkYvjvCb2LS...
🔗 View on StellarExpert: https://stellar.expert/explorer/testnet/tx/...
⬆  Forensic log archived to Pinata IPFS (hash: Qm3x...)`}
                </pre>
            </section>
        </div>
    );
}

function BuilderSection() {
    const { t } = useLanguage();
    return (
        <div className="space-y-12">
            <section>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <Workflow className="text-stellar-yellow" />
                    Strategy Architect (Builder)
                </h2>
                <p className="text-gray-400 mb-8 leading-relaxed">
                    The Architect is a visual, node-based programming environment that allows you to construct complex financial logic without writing Soroban code.
                    It compiles your visual nodes into a <strong className="text-white">Strategy Kernel</strong> that can be deployed atomically against a XLM or USDC vault.
                </p>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors">
                        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                            <Layers className="w-5 h-5 text-stellar-teal" />
                            6 Node Categories
                        </h3>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li>• <strong className="text-stellar-teal">Atomic Engine</strong>: PATH_PAYMENT, EXECUTE_TX, CREATE_AGENT_AUTH, REPAY_BALANCE</li>
                            <li>• <strong>Signal Inputs</strong>: Price thresholds, CRON ticks, Horizon events, Whale alerts</li>
                            <li>• <strong>AI Intelligence</strong>: Eliza sentiment, Kelly Criterion, Market Regime</li>
                            <li>• <strong>Trading & Swaps</strong>: SDEX, Phoenix, Soroswap AMM</li>
                            <li>• <strong>Security & Vault</strong>: Vault deposit/withdraw, Enclave Guard, Neural Archive</li>
                            <li>• <strong>Social Messaging</strong>: Twitter relay, Discord alarm, Telegram push</li>
                        </ul>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors">
                        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                            <Zap className="w-5 h-5 text-amber-500" />
                            Atomic Compilation
                        </h3>
                        <p className="text-sm text-gray-400 mb-3">
                            When you click <strong className="text-white">"Compile Kernel"</strong>, your logic is validated and bundled into a single Stellar Transaction with multiple operations.
                            Either all actions succeed, or the entire transaction fails — protecting your capital with Stellar&apos;s atomic primitives.
                        </p>
                        <ul className="space-y-1 text-sm text-gray-400">
                            <li className="flex items-center gap-2"><span className="text-stellar-teal">⬆</span> Kernel schema archived to <strong className="text-white">Pinata IPFS</strong> after deploy</li>
                            <li className="flex items-center gap-2"><span className="text-[#4ca2ff]">💾</span> <strong className="text-white">Export Schema</strong> button downloads the flow as JSON</li>
                            <li className="flex items-center gap-2"><span className="text-stellar-yellow">🪙</span> <strong className="text-white">XLM / USDC</strong> asset selector sets vault type before deploy</li>
                        </ul>
                    </div>
                </div>

                {/* Node category color reference */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                    {[
                        { label: 'ATOMIC ENGINE', color: 'from-cyan-400 to-blue-500' },
                        { label: 'SIGNAL INPUTS', color: 'from-amber-400 to-orange-500' },
                        { label: 'AI INTELLIGENCE', color: 'from-purple-500 to-indigo-600' },
                        { label: 'TRADING & SWAPS', color: 'from-blue-400 to-cyan-500' },
                        { label: 'SECURITY & VAULT', color: 'from-emerald-500 to-green-600' },
                        { label: 'SOCIAL ALERTS', color: 'from-pink-500 to-rose-600' },
                    ].map(c => (
                        <div key={c.label} className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2">
                            <div className={`w-1 h-8 rounded-full bg-gradient-to-b ${c.color} shrink-0`} />
                            <span className="text-[9px] font-mono text-gray-400 uppercase leading-tight">{c.label}</span>
                        </div>
                    ))}
                </div>
            </section>

            <section className="bg-stellar-yellow/5 border border-stellar-yellow/20 rounded-2xl p-8">
                <h3 className="text-xl font-bold mb-4">Tactical Advantages</h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                    <div>
                        <div className="text-stellar-yellow font-bold mb-1">0% Code</div>
                        <p className="text-xs text-gray-500">Pure visual architecture for rapid prototyping.</p>
                    </div>
                    <div>
                        <div className="text-stellar-yellow font-bold mb-1">100% Soroban</div>
                        <p className="text-xs text-gray-500">Under the hood, it generates optimized Stellar Operations.</p>
                    </div>
                    <div>
                        <div className="text-stellar-yellow font-bold mb-1">Live Simulation</div>
                        <p className="text-xs text-gray-500">Verify logic integrity before mainnet release.</p>
                    </div>
                    <div>
                        <div className="text-stellar-yellow font-bold mb-1">XLM + USDC</div>
                        <p className="text-xs text-gray-500">Select vault asset before compiling the kernel.</p>
                    </div>
                </div>
            </section>
        </div>
    );
}

function FrontendSection() {
    const { t } = useLanguage();
    return (
        <div className="space-y-12">
            {/* Overview */}
            <section>
                <h2 className="text-2xl font-bold mb-6">Frontend Stack</h2>
                <div className="grid md:grid-cols-4 gap-4">
                    {[
                        { label: 'Framework', value: 'Next.js 15' },
                        { label: 'React', value: 'v19' },
                        { label: 'Styling', value: 'Tailwind CSS' },
                        { label: 'Wallet', value: '@stellar/freighter-api' },
                    ].map((item) => (
                        <div key={item.label} className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
                            <div className="text-xs text-gray-500 uppercase">{item.label}</div>
                            <div className="text-lg font-bold text-white">{item.value}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Pages */}
            <section>
                <h2 className="text-2xl font-bold mb-6">Application Pages</h2>
                <div className="space-y-4">
                    {[
                        { path: '/', name: 'Landing Page', desc: 'Hero, features, live terminal, Builder highlight', lines: 330 },
                        { path: '/how-to-use', name: 'Operations Manual', desc: 'Step-by-step guide for new operators', lines: 180 },
                        { path: '/dashboard', name: 'Dashboard', desc: 'Multi-asset Command Center (XLM/USDC), Active Fleet, execution logs', lines: 2384 },
                        { path: '/strategies', name: 'Protocol Arsenal', desc: '15 institutional kernels, per-strategy asset selector (XLM/USDC)', lines: 400 },
                        { path: '/strategies/builder', name: 'Visual Builder', desc: 'Drag-and-drop node editor for custom kernel strategies', lines: 572 },
                        { path: '/marketplace', name: 'Marketplace', desc: 'Pre-built strategies with multi-agent deploy', lines: 835 },
                        { path: '/agents', name: 'Operations Command Center', desc: 'API keys, live IPFS audit feed, dynamic Horizon telemetry', lines: 280 },
                        { path: '/plugins', name: 'Neural Extensions', desc: 'Core plugins: Research, Sentiment, Knowledge', lines: 272 },
                        { path: '/analytics', name: 'Analytics', desc: 'Performance charts and metrics', lines: 200 },
                        { path: '/docs', name: 'Documentation', desc: 'Technical documentation (this page)', lines: 1173 },
                    ].map((page) => (
                        <div key={page.path} className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <code className="text-stellar-teal text-sm">{page.path}</code>
                                <span className="text-white font-medium">{page.name}</span>
                                <span className="text-gray-500 text-sm hidden md:block">{page.desc}</span>
                            </div>
                            <span className="text-xs text-gray-500 font-mono">{page.lines} lines</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Key Components */}
            <section>
                <h2 className="text-2xl font-bold mb-6">Key Components</h2>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                            <Settings className="w-5 h-5 text-stellar-yellow" />
                            Wallet Provider
                        </h3>
                        <pre className="text-xs font-mono text-gray-400 bg-black/40 p-3 rounded-lg overflow-x-auto">
                            {`<WalletProvider autoConnect>
  {children}
</WalletProvider>`}
                        </pre>
                        <p className="text-sm text-gray-400 mt-3">
                            Auto-reconnect enabled for persistent sessions across page reloads.
                        </p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                            <Database className="w-5 h-5 text-amber-500" />
                            Strategy Service
                        </h3>
                        <pre className="text-xs font-mono text-gray-400 bg-black/40 p-3 rounded-lg overflow-x-auto">
                            {`StrategyService.deployStrategy(
  walletAddress: string,
  strategy: ActiveStrategy
) // Upsert pattern`}
                        </pre>
                        <p className="text-sm text-gray-400 mt-3">
                            Prevents duplicates by updating existing or inserting new.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}

function ApiSection() {
    const { t } = useLanguage();
    return (
        <div className="space-y-16">
            {/* Header / Intro */}
            <section className="bg-gradient-to-br from-stellar-teal/10 via-[#0A0A0A] to-transparent border border-stellar-teal/20 rounded-3xl p-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-stellar-teal/5 blur-[120px] rounded-full pointer-events-none group-hover:bg-stellar-teal/10 transition-colors duration-700" />
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-stellar-teal/20 rounded-lg">
                            <Terminal className="text-stellar-teal w-6 h-6" />
                        </div>
                        <h2 className="text-4xl font-black tracking-tight">NIRIUM NEXUS API</h2>
                    </div>
                    <p className="text-gray-400 text-lg max-w-3xl leading-relaxed mb-8">
                        Infraestructura de alto rendimiento diseñada para la integración de agentes autónomos y sistemas fintech.
                        Proporcionamos el rastro forense inmutable y los protocolos de seguridad necesarios para la experimentación con activos financieros en entornos controlados (Art. 80 Ley Fintech).
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                            { label: 'Uptime SLA', val: '99.5%', icon: Activity, color: 'text-stellar-teal' },
                            { label: 'Latencia P95', val: '< 500ms', icon: Clock, color: 'text-stellar-yellow' },
                            { label: 'Endpoints', val: '41', icon: Layers, color: 'text-purple-400' },
                            { label: 'Security', val: 'AES-256', icon: Shield, color: 'text-green-400' },
                        ].map((stat) => (
                            <div key={stat.label} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-white/20 transition-colors">
                                <div className="flex items-center gap-2 mb-1">
                                    <stat.icon className={`w-3 h-3 ${stat.color}`} />
                                    <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">{stat.label}</span>
                                </div>
                                <div className="text-xl font-black text-white">{stat.val}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Authentication & Access */}
            <section>
                <div className="flex items-center gap-3 mb-8">
                    <Key className="text-stellar-yellow w-6 h-6" />
                    <h3 className="text-2xl font-bold">Autenticación y Acceso</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6">
                            <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                                <Shield className="w-4 h-4 text-stellar-teal" /> x-api-key Authentication
                            </h4>
                            <p className="text-sm text-gray-400 mb-4">Recomendado para servidores, bots y sistemas institucionales que requieren acceso persistente.</p>
                            <div className="bg-black/50 p-4 rounded-lg font-mono text-xs text-stellar-teal border border-stellar-teal/20 mb-4">
                                curl -H "x-api-key: sk_inst_[TU_KEY]" \ <br />
                                &nbsp;&nbsp;https://api.nirium.xyz/api/market
                            </div>
                            <p className="text-[10px] text-gray-500">Prefijos: <span className="text-gray-400 font-mono">sk_free_</span> · <span className="text-gray-400 font-mono">sk_sbox_</span> · <span className="text-gray-400 font-mono">sk_inst_</span> · <span className="text-gray-400 font-mono">sk_ent_</span></p>
                        </div>

                        <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6">
                            <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                                <Lock className="w-4 h-4 text-stellar-yellow" /> JWT Bearer Token
                            </h4>
                            <p className="text-sm text-gray-400 mb-4">Tokens efímeros de corta duración (24h) generados mediante firma criptográfica de wallet.</p>
                            <div className="bg-black/50 p-4 rounded-lg font-mono text-xs text-stellar-yellow border border-stellar-yellow/20">
                                Authorization: Bearer eyJhbGciOi...
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-stellar-teal/5 to-transparent border border-white/10 rounded-2xl p-8">
                        <h4 className="text-white font-bold mb-6">Matriz de Cuotas de Sandbox</h4>
                        <div className="space-y-4">
                            {[
                                { tier: 'Free', req: '100 req/día', speed: '10 rpm', prefix: 'sk_free_' },
                                { tier: 'Sandbox', req: '1,000 req/día', speed: '60 rpm', prefix: 'sk_sbox_' },
                                { tier: 'Institucional', req: '10,000 req/día', speed: '300 rpm', prefix: 'sk_inst_' },
                                { tier: 'Enterprise', req: '100,000+ req/día', speed: '1,000+ rpm', prefix: 'sk_ent_' },
                            ].map((tier, idx) => (
                                <div key={tier.tier} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                                    <div>
                                        <div className="text-sm font-bold text-white">{tier.tier}</div>
                                        <div className="text-xs text-gray-500">{tier.speed} · <span className="font-mono text-gray-600">{(tier as any).prefix}</span></div>
                                    </div>
                                    <div className="text-stellar-teal font-mono text-sm">{tier.req}</div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 p-3 bg-stellar-yellow/5 border border-stellar-yellow/20 rounded-lg">
                            <p className="text-[10px] text-stellar-yellow/80 font-mono">
                                🔒 SANDBOX INSTITUCIONAL — ACCESO PRIVADO
                            </p>
                            <p className="text-[10px] text-gray-500 mt-1">
                                El tier Institucional y Enterprise se asignan por invitación durante el período de evaluación NBO. Para solicitar acceso: <span className="text-gray-400">institutional@nirium.xyz</span>
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Smart Contracts Directory */}
            <section>
                <div className="flex items-center gap-3 mb-8">
                    <Database className="text-purple-400 w-6 h-6" />
                    <h3 className="text-2xl font-bold">Directorio de Contratos (Soroban Testnet)</h3>
                </div>
                <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/10 text-xs font-mono text-gray-500">
                                <th className="py-4 px-6 uppercase tracking-widest">Contrato / Asset</th>
                                <th className="py-4 px-6 uppercase tracking-widest">Identificador on-chain</th>
                                <th className="py-4 px-6 text-right uppercase tracking-widest">Network</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {[
                                { name: 'Vault Principal (Treasury)', id: 'CDYVJU7...J3EE', type: 'Nirium Protocol' },
                                { name: 'Reputation System (ELO)', id: 'CB4RCN4...TFCU6XW4H', type: 'Reputation' },
                                { name: 'Marketplace Strategist', id: 'CCUDDIF...BCZF6KV6', type: 'Logic' },
                                { name: 'CETES RWA (Soroban SAC)', id: 'CC72F57...PFDLNCQY', type: 'Asset' },
                            ].map((c) => (
                                <tr key={c.name} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                    <td className="py-4 px-6">
                                        <div className="text-white font-bold">{c.name}</div>
                                        <div className="text-[10px] text-gray-500 uppercase">{c.type}</div>
                                    </td>
                                    <td className="py-2 px-6">
                                        <div className="bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 font-mono text-xs text-stellar-teal group-hover:border-stellar-teal/30 flex items-center gap-2">
                                            {c.id}
                                            <ExternalLink size={10} className="text-gray-600" />
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-right text-gray-400 font-mono text-xs">Soroban Testnet</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Integration Examples Hub */}
            <section className="space-y-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Code className="text-stellar-teal w-6 h-6" />
                        <h3 className="text-2xl font-bold">Protocolos de Integración (SDK)</h3>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* REST API Python */}
                    <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden flex flex-col">
                        <div className="px-5 py-3 bg-white/5 border-b border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-6 bg-stellar-teal rounded-full" />
                                <span className="text-xs font-mono text-gray-400">PYTHON SDK — AUDIT STATUS</span>
                                <div className="bg-black/40 px-2 py-0.5 rounded text-[10px] font-mono text-stellar-teal border border-stellar-teal/20">
                                    pip install nirium
                                </div>
                            </div>
                        </div>
                        <pre className="p-6 text-xs font-mono text-gray-300 overflow-x-auto leading-relaxed bg-black/40 flex-grow">
                            {`import os
import requests

# Inicialización institucional
API_KEY = os.getenv("NIRIUM_API_KEY")
URL = "https://api.nirium.xyz/api/sandbox/status"

headers = {
    "x-api-key": API_KEY,
    "Content-Type": "application/json"
}

def get_compliance_status():
    res = requests.get(URL, headers=headers)
    if res.status_code == 200:
        data = res.json()
        tier = data['account']['tier']
        used = data['usage']['dailyRequests']
        limit = data['quotas']['requestsPerDay']
        remaining = data['usage']['remainingToday']
        print(f"✅ Tier: {tier}")
        print(f"📊 Daily: {used}/{limit} ({remaining} remaining)")

get_compliance_status()`}
                        </pre>
                    </div>

                    {/* WebSocket Node.js */}
                    <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden flex flex-col">
                        <div className="px-5 py-3 bg-white/5 border-b border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-6 bg-purple-500 rounded-full" />
                                <span className="text-xs font-mono text-gray-400">NODE.JS — REAL-TIME SWARM TELEMETRY</span>
                                <div className="bg-black/40 px-2 py-0.5 rounded text-[10px] font-mono text-purple-400 border border-purple-500/20">
                                    npm install nirium
                                </div>
                            </div>
                        </div>
                        <pre className="p-6 text-xs font-mono text-gray-300 overflow-x-auto leading-relaxed bg-black/40 flex-grow">
                            {`const WebSocket = require('ws');
const API_KEY = process.env.NIRIUM_API_KEY;

const ws = new WebSocket('wss://api.nirium.xyz/ws/signals', {
  headers: { 'x-api-key': API_KEY }
});

ws.on('open', () => {
  console.log('📡 Connected to Nirium Swarm Telemetry');
});

ws.on('message', (payload) => {
  const msg = JSON.parse(payload);
  if (msg.type === 'signal') {
    const confidence = msg.data?.confidence ?? 0;
    if (confidence > 0.90) {
      console.log('🔥 SIGNAL:', msg.signal_type);
      console.log('   Pair:', msg.pair);
      console.log('   Profit:', msg.data.profitPercentage + '%');
    }
  }
});`}
                        </pre>
                    </div>
                </div>
            </section>

            {/* Full Endpoint Directory */}
            <section id="endpoints-directory">
                <div className="flex items-center gap-3 mb-8">
                    <Workflow className="text-stellar-teal w-6 h-6" />
                    <h3 className="text-2xl font-bold uppercase tracking-tighter">{t.docs.api.explorer_title} (41)</h3>
                </div>

                <EndpointExplorer />
            </section>

            {/* SLA & Reliability Section */}
            <section className="bg-gradient-to-r from-stellar-teal/5 to-stellar-yellow/5 border border-white/10 rounded-3xl p-8">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h3 className="text-3xl font-black text-white mb-2">{t.docs.api.sla_title}</h3>
                        <p className="text-gray-400">{t.docs.api.sla_subtitle}</p>
                    </div>
                    <Link href="/status" className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all group">
                        <Activity className="w-4 h-4 text-stellar-teal group-hover:animate-pulse" />
                        <span className="text-sm font-bold text-white">{t.docs.api.status_button}</span>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { title: 'Disponibilidad API', target: '99.5%', detail: 'Indisponibilidad máx. 3.6h/mes', icon: Globe },
                        { title: 'Latencia P95', target: '< 500ms', detail: 'Medido en corredores MXN/USD', icon: Zap },
                        { title: 'Soporte Premium', target: '24 / 7', detail: 'Respuesta < 30m para críticos', icon: Heart },
                    ].map((item) => (
                        <div key={item.title} className="space-y-3">
                            <div className="flex items-center gap-2">
                                <item.icon className="w-4 h-4 text-stellar-teal" />
                                <span className="text-sm text-gray-400 font-bold uppercase tracking-widest">{item.title}</span>
                            </div>
                            <div className="text-4xl font-black text-white">{item.target}</div>
                            <p className="text-xs text-gray-500 leading-relaxed">{item.detail}</p>
                        </div>
                    ))}
                </div>

                {/* Health Checklist Final */}
                <div className="mt-12 bg-white/5 border border-white/5 rounded-2xl p-6 flex flex-wrap gap-x-12 gap-y-4">
                    <div className="flex items-center gap-2">
                        <CheckCircle size={14} className="text-stellar-teal" />
                        <span className="text-xs text-gray-400">Certificación SSL TLS 1.3</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CheckCircle size={14} className="text-stellar-teal" />
                        <span className="text-xs text-gray-400">Cifrado AES-256 at Rest</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CheckCircle size={14} className="text-stellar-teal" />
                        <span className="text-xs text-gray-400">IPFS Immutable Audit Trail</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CheckCircle size={14} className="text-stellar-teal" />
                        <span className="text-xs text-gray-400">SOC2 Type II Compliant Layer</span>
                    </div>
                </div>
            </section>
        </div>
    );
}

function EndpointExplorer() {
    const { t } = useLanguage();
    const [activeCat, setActiveCat] = useState('auth');

    const categories = [
        { id: 'auth', label: t.docs.api.categories.auth, icon: Lock },
        { id: 'market', label: t.docs.api.categories.market, icon: TrendingUp },
        { id: 'exec', label: t.docs.api.categories.exec, icon: Cpu },
        { id: 'sandbox', label: t.docs.api.categories.sandbox, icon: Shield },
        { id: 'skills', label: 'SKILLS', icon: Layers },
        { id: 'events', label: t.docs.api.categories.events, icon: Zap },
    ];

    const endpoints: Record<string, any[]> = {
        auth: [
            { method: 'GET', path: '/health', desc: 'Estado operativo del cluster API (versión, uptime, network).' },
            { method: 'GET', path: '/api/info', desc: 'Metadatos del protocolo: versión, red, directorio de endpoints y LLM activo.' },
            { method: 'GET', path: '/api/public/market-snapshot', desc: 'Snapshot público de mercado sin autenticación (para frontends).' },
            { method: 'GET', path: '/api/public/quickstart', desc: 'Guía de inicio rápido con pasos numerados y referencias.' },
            { method: 'GET', path: '/api/public/examples', desc: 'Ejemplos de código listos en curl, JavaScript y Python.' },
            { method: 'POST', path: '/api/public/authenticate', desc: 'Autenticación con verificación Ed25519 real. Requiere Timestamp en mensaje (anti-replay 5 min).' },
            { method: 'POST', path: '/api/public/demo-auth', desc: 'Token JWT de prueba 24h sin verificación de firma. Solo testnet.' },
            { method: 'POST', path: '/api/auth/token', desc: 'JWT desde wallet address. Siempre tier free — usar /api/auth/keys para tiers superiores.' },
            { method: 'POST', path: '/api/auth/keys', desc: '🔐 [auth] Crea API Key de larga duración. Especificar tier: free | sandbox | institutional | enterprise.' },
            { method: 'GET', path: '/api/auth/keys', desc: '🔐 [auth] Lista llaves activas de la cuenta (sin mostrar valor completo).' },
            { method: 'DELETE', path: '/api/auth/keys/:id', desc: '🔐 [auth] Revoca una API Key por ID. Registra revoked_at.' },
        ],
        market: [
            { method: 'GET', path: '/api/market', desc: '🔐 [auth] Snapshot SDEX en vivo: precio XLM, fee, orderbook XLM/USDC, spread, rutas path payment.' },
            { method: 'GET', path: '/api/signals/recent', desc: 'Feed de señales del swarm. Campos: signal_type, pair, data.confidence, data.profitPercentage. Max 100.' },
            { method: 'GET', path: '/api/tickers', desc: 'Precios de activos listados en el protocolo (XLM, USDC).' },
            { method: 'GET', path: '/api/stats/global', desc: 'Uptime, scans totales, clientes WebSocket activos y plugins cargados.' },
        ],
        exec: [
            { method: 'POST', path: '/api/execute', desc: '🔐 [auth+legal] Ejecución real en Testnet. Requiere x-stellar-account header y TOS firmado.' },
            { method: 'POST', path: '/api/execute-demo', desc: 'Simulación sin riesgo. Requiere CONTRACT_ID configurado para modo Soroban completo.' },
            { method: 'POST', path: '/api/loop/start', desc: '🔐 [auth+legal] Inicia ciclo autónomo. Body: config { interval, strategies[], minProfitPercentage }.' },
            { method: 'POST', path: '/api/loop/stop', desc: '🔐 [auth] Detiene el loop autónomo de forma inmediata.' },
            { method: 'GET', path: '/api/loop/status', desc: 'Estado del loop: isRunning, scanCount, uptime, marketState actual.' },
            { method: 'POST', path: '/api/loop/scan', desc: '🔐 [auth] Dispara un escaneo único sin iniciar el loop continuo.' },
        ],
        sandbox: [
            { method: 'POST', path: '/api/sandbox/request', desc: '🔒 Solicitud de acceso sandbox institucional. Genera API Key con tier y cuotas asignados (90 días).' },
            { method: 'GET', path: '/api/sandbox/info', desc: 'Especificaciones públicas de tiers, límites y capacidades del sandbox.' },
            { method: 'GET', path: '/api/sandbox/status', desc: '🔐 [sandbox+] Uso de cuotas en tiempo real, remaining today y tier activo.' },
            { method: 'GET', path: '/api/sandbox/accounts', desc: '🛡️ [admin] Gestión de todas las cuentas sandbox activas.' },
            { method: 'DELETE', path: '/api/sandbox/accounts/:id', desc: '🛡️ [admin] Revoca una cuenta sandbox por ID.' },
        ],
        skills: [
            { method: 'GET', path: '/api/skills', desc: 'Lista todos los plugins instalados y activos en el agente.' },
            { method: 'GET', path: '/api/skills/marketplace', desc: 'Catálogo de plugins disponibles con metadatos de instalación.' },
            { method: 'POST', path: '/api/skills/install', desc: '🔐 [auth] Instala un plugin desde GitHub URL o NiriumHub slug.' },
            { method: 'DELETE', path: '/api/skills/:slug', desc: '🔐 [auth] Desinstala un plugin por su identificador.' },
            { method: 'POST', path: '/api/skills/:slug/actions/:action', desc: '🔐 [auth] Ejecuta una acción específica de un plugin (ej: path-arbitrage/scan).' },
            { method: 'GET', path: '/api/strategies', desc: 'Lista estrategias con metadatos de riesgo, activos compatibles y estado.' },
        ],
        events: [
            { method: 'POST', path: '/api/webhooks', desc: '🔐 [auth] Registra endpoint HTTPS para notificaciones HMAC-SHA256 firmadas.' },
            { method: 'GET', path: '/api/webhooks', desc: '🔐 [auth] Lista webhooks configurados en la cuenta.' },
            { method: 'POST', path: '/api/webhooks/:id/test', desc: '🔐 [auth] Envía evento test al webhook para validar entrega.' },
            { method: 'DELETE', path: '/api/webhooks/:id', desc: '🔐 [auth] Elimina un webhook registrado.' },
            { method: 'POST', path: '/api/subscriptions', desc: '🔐 [auth] Crea suscripción REST con filtros (asset, minConfidence).' },
            { method: 'GET', path: '/api/subscriptions', desc: '🔐 [auth] Lista suscripciones activas de la cuenta.' },
            { method: 'DELETE', path: '/api/subscriptions/:id', desc: '🔐 [auth] Cancela una suscripción.' },
            { method: 'GET', path: '/api/subscriptions/stats', desc: 'Stats globales: clientes WS conectados, suscripciones activas.' },
            { method: 'WS', path: 'wss://api.nirium.xyz/ws/signals', desc: 'Stream en tiempo real. Mensajes: type=signal (signal_type, pair, data), type=log, type=ping.' },
        ]
    };

    return (
        <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl overflow-hidden">
            <div className="flex overflow-x-auto border-b border-white/10 bg-white/5 scrollbar-hide">
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCat(cat.id)}
                        className={`flex items-center gap-2 px-6 py-4 text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border-b-2 ${activeCat === cat.id
                                ? 'border-stellar-teal text-stellar-teal bg-stellar-teal/5'
                                : 'border-transparent text-gray-500 hover:text-white'
                            }`}
                    >
                        <cat.icon size={14} />
                        {cat.label}
                    </button>
                ))}
            </div>

            <div className="p-2 sm:p-6 space-y-2">
                {endpoints[activeCat].map((ep, idx) => (
                    <div key={idx} className="group flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-all border border-transparent hover:border-white/10">
                        <div className={`px-2 py-1 rounded font-mono text-[10px] font-black w-14 text-center shrink-0 ${ep.method === 'GET' ? 'bg-blue-500/20 text-blue-400' :
                                ep.method === 'POST' ? 'bg-green-500/20 text-green-400' :
                                    ep.method === 'WS' ? 'bg-purple-500/20 text-purple-400' :
                                        'bg-red-500/20 text-red-400'
                            }`}>
                            {ep.method}
                        </div>
                        <div className="font-mono text-xs text-stellar-teal tracking-tighter">
                            {ep.path}
                        </div>
                        <div className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">
                            {ep.desc}
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white/5 px-6 py-4 flex items-center justify-between">
                <span className="text-[10px] text-gray-500 font-mono italic">
                    Referencia completa: <a href="/nirium-api.yaml" className="underline hover:text-stellar-teal transition-colors">nirium-api.yaml</a> (OpenAPI 3.1.0)
                </span>
                <a
                    href="/nirium-api.yaml"
                    download="nirium-api-spec.yaml"
                    className="text-[10px] text-stellar-teal font-black hover:underline uppercase tracking-widest flex items-center gap-2 group"
                >
                    <FileCode size={12} className="group-hover:rotate-12 transition-transform" />
                    {t.docs.api.download_postman} →
                </a>
            </div>
        </div>
    );
}

function SecuritySection() {
    const { t } = useLanguage();
    return (
        <div className="space-y-12">
            {/* Atomic Operations */}
            <section>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-white">
                    <Lock className="text-stellar-teal" />
                    {t.docs.security.atomic_enforcement}
                </h2>
                <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6">
                    <p className="text-gray-300 mb-4">
                        Stellar Transactions provide <strong>protocol-level security</strong>:
                    </p>
                    <ul className="space-y-3">
                        {[
                            { icon: '🚫', text: 'All-or-nothing execution' },
                            { icon: '✅', text: 'Sequential operation processing' },
                            { icon: '🔒', text: 'Source account auth verification' },
                            { icon: '⚡', text: 'Atomic Path Payments' },
                        ].map((item) => (
                            <li key={item.text} className="flex items-center gap-3 text-gray-300">
                                <span className="text-xl">{item.icon}</span>
                                {item.text}
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* Attack Prevention */}
            <section>
                <h2 className="text-2xl font-bold mb-6 text-white">{t.docs.security.matrix_title}</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/10 text-gray-400 text-sm">
                                <th className="py-3 px-4">Attack Vector</th>
                                <th className="py-3 px-4">Protection</th>
                                <th className="py-3 px-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {[
                                { attack: 'Reentrancy', protection: 'Single transaction = atomic', status: '✓' },
                                { attack: 'Flash Loan Default', protection: 'Atomic validation = must repay', status: '✓' },
                                { attack: 'Oracle Manipulation', protection: 'On-chain solvency check', status: '✓' },
                                { attack: 'Sandwich Attack', protection: 'User sets min_profit', status: '✓' },
                                { attack: 'Duplicate Strategies', protection: 'Upsert pattern in Supabase', status: '✓' },
                                { attack: 'Session Hijacking', protection: 'Wallet signature required', status: '✓' },
                            ].map((item) => (
                                <tr key={item.attack} className="border-b border-white/5 hover:bg-white/5">
                                    <td className="py-3 px-4 text-red-400">{item.attack}</td>
                                    <td className="py-3 px-4 text-gray-300">{item.protection}</td>
                                    <td className="py-3 px-4 text-green-400 font-bold">{item.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* RLS */}
            <section className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Users className="text-stellar-yellow" />
                    Row Level Security (Supabase)
                </h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-white/10 text-gray-400">
                                <th className="py-2 px-3">Table</th>
                                <th className="py-2 px-3">Policy</th>
                            </tr>
                        </thead>
                        <tbody className="font-mono">
                            <tr className="border-b border-white/5">
                                <td className="py-2 px-3 text-stellar-teal">profiles</td>
                                <td className="py-2 px-3 text-gray-400">Users can only update their own profile</td>
                            </tr>
                            <tr className="border-b border-white/5">
                                <td className="py-2 px-3 text-stellar-teal">strategies</td>
                                <td className="py-2 px-3 text-gray-400">Private - creator only</td>
                            </tr>
                            <tr className="border-b border-white/5">
                                <td className="py-2 px-3 text-stellar-teal">agent_logs</td>
                                <td className="py-2 px-3 text-gray-400">Insert for Agent, Read for Owner</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Verification & Compliance */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <FileCheck className="text-green-400" />
                        Audit Trails
                    </h2>
                    <div className="space-y-4 text-sm text-gray-300">
                        <p>
                            Nirium transactions are audited using public ledger data and off-chain verified logs.
                        </p>
                        <div className="bg-black/40 p-3 rounded font-mono text-xs text-green-300 border border-green-500/10">
                            verify_tx(agent_id, tx_hash) {'{'}<br />
                            &nbsp;&nbsp;return stellar::verify_sig(id.pubkey, tx.hash);<br />
                            {'}'}
                        </div>
                        <div className="flex items-center gap-2 text-green-400 font-bold">
                            <CheckCircle size={16} /> Cryptographically Secure
                        </div>
                    </div>
                </div>

                <div className="bg-pink-500/5 border border-pink-500/20 rounded-xl p-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <HardDrive className="text-pink-400" />
                        Neural Archive (IPFS)
                    </h2>
                    <div className="space-y-4 text-sm text-gray-300">
                        <p>
                            Agent decisions are not black boxes. Every "thought" and action is serialized and stored on <strong>IPFS</strong>.
                        </p>
                        <ul className="space-y-2">
                            <li className="flex items-center gap-2 op-70"><CheckCircle size={14} /> Immutable Forensic Trail</li>
                            <li className="flex items-center gap-2 op-70"><CheckCircle size={14} /> Blobs Signed by Agent Key</li>
                            <li className="flex items-center gap-2 op-70"><CheckCircle size={14} /> Publicly Verifiable</li>
                        </ul>
                    </div>
                </div>
            </section>
        </div>
    );
}

function IdeasSection() {
    const { t } = useLanguage();
    return (
        <div className="space-y-12">
            <section className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-4xl font-black mb-6 text-white">{t.docs.ideas.title}</h2>
                <p className="text-xl text-gray-400">
                    {t.docs.ideas.subtitle}
                </p>
            </section>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Idea 1 */}
                <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 sm:p-8 hover:border-yellow-500/50 transition-colors group">
                    <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-4 mb-6">
                        <div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-500 shrink-0">
                            <Shield size={32} />
                        </div>
                        <span className="px-3 py-1 rounded-full bg-white/5 text-[10px] sm:text-xs font-mono text-gray-400 self-start xs:self-center">{t.docs.ideas.difficulty}: Medium</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">PortfolioGuard Bot</h3>
                    <p className="text-gray-400 mb-6 sm:min-h-[60px] text-sm sm:text-base leading-relaxed">
                        A Telegram bot that monitors user portfolios 24/7. If collateral health drops below 1.1, it automatically rebalances via Nirium to repay debt and prevent liquidation.
                    </p>
                    <div className="bg-black/50 rounded-lg p-4 font-mono text-[10px] sm:text-sm text-yellow-500/80 overflow-x-auto scrollbar-thin">
                        <span className="text-gray-500"># Use Python SDK</span><br />
                        agent.listen(portfolio_health, (health) =&gt; {'{'}<br />
                        &nbsp;&nbsp;if health &lt; 1.1: agent.execute("Repay")<br />
                        {'}'})
                    </div>
                </div>

                {/* Idea 2 */}
                <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 sm:p-8 hover:border-stellar-teal/50 transition-colors group">
                    <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-4 mb-6">
                        <div className="p-3 bg-stellar-teal/10 rounded-xl text-stellar-teal shrink-0">
                            <Zap size={32} />
                        </div>
                        <span className="px-3 py-1 rounded-full bg-white/5 text-[10px] sm:text-xs font-mono text-gray-400 self-start xs:self-center">Difficulty: Hard</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">ArbSwarm DAO</h3>
                    <p className="text-gray-400 mb-6 sm:min-h-[60px] text-sm sm:text-base leading-relaxed">
                        A DAO where users pool XLM. Thousands of micro-agents scan DEXs for 0.5% discrepancies and execute atomic path payments. Profits are split 80/20 between Agent and DAO.
                    </p>
                    <div className="bg-black/50 rounded-lg p-4 font-mono text-[10px] sm:text-sm text-stellar-teal/80 overflow-x-auto scrollbar-thin">
                        <span className="text-gray-500"># Use TypeScript SDK</span><br />
                        const profit = await calculateArb(poolA, poolB);<br />
                        if (profit &gt; gas) await loop.execute(flashLoan);
                    </div>
                </div>

                {/* Idea 3 */}
                <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 sm:p-8 hover:border-purple-500/50 transition-colors group">
                    <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-4 mb-6">
                        <div className="p-3 bg-purple-500/10 rounded-xl text-purple-500 shrink-0">
                            <Globe size={32} />
                        </div>
                        <span className="px-3 py-1 rounded-full bg-white/5 text-[10px] sm:text-xs font-mono text-gray-400 self-start xs:self-center">Difficulty: Easy</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">NewsTrader Oracle</h3>
                    <p className="text-gray-400 mb-6 sm:min-h-[60px] text-sm sm:text-base leading-relaxed">
                        Connect standard Web2 news APIs (Bloomberg, X) to Stellar. When "Regulatory Approval" is detected, buy the related token via Nirium Swaps instantly.
                    </p>
                    <div className="bg-black/50 rounded-lg p-4 font-mono text-[10px] sm:text-sm text-purple-500/80 overflow-x-auto scrollbar-thin">
                        <span className="text-gray-500"># Use JS SDK + Vercel</span><br />
                        onNewsReceived(async (headline) =&gt; {'{'}<br />
                        &nbsp;&nbsp;if (isBullish(headline)) loop.buy("XLM")<br />
                        {'}'})
                    </div>
                </div>

                {/* Idea 4 */}
                <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 sm:p-8 hover:border-green-500/50 transition-colors group">
                    <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-4 mb-6">
                        <div className="p-3 bg-green-500/10 rounded-xl text-green-500 shrink-0">
                            <Users size={32} />
                        </div>
                        <span className="px-3 py-1 rounded-full bg-white/5 text-[10px] sm:text-xs font-mono text-gray-400 self-start xs:self-center">Difficulty: Hard</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">GameFi NPC Economy</h3>
                    <p className="text-gray-400 mb-6 sm:min-h-[60px] text-sm sm:text-base leading-relaxed">
                        Fully autonomous NPCs in a Stellar game that manage their own inventory shops. They buy items low from players and sell high, managing their own capital via Nirium.
                    </p>
                    <div className="bg-black/50 rounded-lg p-4 font-mono text-[10px] sm:text-sm text-green-500/80 overflow-x-auto scrollbar-thin">
                        <span className="text-gray-500"># Use Unity + C# (API)</span><br />
                        npc.OnTradeOffer((item) =&gt; {'{'}<br />
                        &nbsp;&nbsp;if (market.val(item) &gt; offer) npc.pay(offer)<br />
                        {'}'})
                    </div>
                </div>
            </div>

            {/* Idea 5 */}
            <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-8 hover:border-blue-500/50 transition-colors group">
                <div className="flex items-start justify-between mb-6">
                    <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                        <TrendingUp size={32} />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-white/5 text-xs font-mono text-gray-400">Difficulty: Medium</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">USDC Yield Maximizer</h3>
                <p className="text-gray-400 mb-6 min-h-[60px]">
                    Deploy USDC into a Nirium vault, then use the agent to auto-rotate capital between Blend, Phoenix, and SDEX — always chasing the highest lending rate. Earn delta-neutral stablecoin yield automatically.
                </p>
                <div className="bg-black/50 rounded-lg p-4 font-mono text-sm text-blue-400/80">
                    <span className="text-gray-500"># Use TypeScript SDK — USDC vault</span><br />
                    const best = await findBestRate(['blend', 'phoenix', 'sdex']);<br />
                    await loop.deposit(vault, &apos;USDC&apos;, 100);<br />
                    await loop.supply(best.protocol, amount);
                </div>
            </div>

            {/* Idea 6 */}
            <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-8 hover:border-rose-500/50 transition-colors group">
                <div className="flex items-start justify-between mb-6">
                    <div className="p-3 bg-rose-500/10 rounded-xl text-rose-400">
                        <Zap size={32} />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-white/5 text-xs font-mono text-gray-400">Difficulty: Hard</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Liquidation Sniper Bot</h3>
                <p className="text-gray-400 mb-6 min-h-[60px]">
                    Monitor every undercollateralized position on Blend. The moment health factor drops below 1.0, execute a liquidation via Nirium and claim the bonus — all in a single atomic transaction.
                </p>
                <div className="bg-black/50 rounded-lg p-4 font-mono text-sm text-rose-400/80">
                    <span className="text-gray-500">// Monitor + strike in one block</span><br />
                    onHealthAlert(async (pos) =&gt; {'{'}<br />
                    &nbsp;&nbsp;const loan = await loop.flashLoan(pos.debt);<br />
                    &nbsp;&nbsp;await blend.liquidate(pos.id, loan);<br />
                    {'}'})
                </div>
            </div>

            {/* Idea 7 */}
            <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-8 hover:border-amber-500/50 transition-colors group">
                <div className="flex items-start justify-between mb-6">
                    <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400">
                        <Globe size={32} />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-white/5 text-xs font-mono text-gray-400">Difficulty: Easy</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Onchain Payroll Protocol</h3>
                <p className="text-gray-400 mb-6 min-h-[60px]">
                    A DAO treasury deploys USDC into a Nirium vault. The yield generated weekly is automatically streamed as payroll to contributors&apos; wallets on a schedule — the treasury principal remains untouched forever.
                </p>
                <div className="bg-black/50 rounded-lg p-4 font-mono text-sm text-amber-400/80">
                    <span className="text-gray-500"># Cron via Vercel + Nirium API</span><br />
                    every_friday = vault.yield_since(last_week)<br />
                    for member in dao.members:<br />
                    &nbsp;&nbsp;loop.transfer(member.wallet, share)
                </div>
            </div>

            {/* Idea 8 */}
            <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-8 hover:border-violet-500/50 transition-colors group">
                <div className="flex items-start justify-between mb-6">
                    <div className="p-3 bg-violet-500/10 rounded-xl text-violet-400">
                        <Shield size={32} />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-white/5 text-xs font-mono text-gray-400">Difficulty: Hard</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">On-Chain Insurance Fund</h3>
                <p className="text-gray-400 mb-6 min-h-[60px]">
                    Users pay a small USDC premium weekly. The pool sits in a Nirium vault generating yield. When a covered protocol is exploited (detected via oracle), the agent autonomously pays out claims from the yield reserve first, then principal if needed.
                </p>
                <div className="bg-black/50 rounded-lg p-4 font-mono text-sm text-violet-400/80">
                    <span className="text-gray-500">// Oracle-triggered payout</span><br />
                    onExploitDetected(async (protocol) =&gt; {'{'}<br />
                    &nbsp;&nbsp;const reserve = await vault.yieldBalance();<br />
                    &nbsp;&nbsp;await loop.payout(claimants, reserve);<br />
                    {'}'})
                </div>
            </div>

            {/* Idea 9 */}
            <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-8 hover:border-teal-500/50 transition-colors group">
                <div className="flex items-start justify-between mb-6">
                    <div className="p-3 bg-teal-500/10 rounded-xl text-teal-400">
                        <Code size={32} />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-white/5 text-xs font-mono text-gray-400">Difficulty: Medium</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Eliza Social Sentiment Trader</h3>
                <p className="text-gray-400 mb-6 min-h-[60px]">
                    An ElizaOS agent scans X/Twitter, Telegram, and Discord 24/7 for Stellar ecosystem project mentions. When a verified influencer posts bullish content, the agent opens a position via Nirium swap within the same block.
                </p>
                <div className="bg-black/50 rounded-lg p-4 font-mono text-sm text-teal-400/80">
                    <span className="text-gray-500">// Eliza plugin integration</span><br />
                    agent.on(&apos;BULLISH_SIGNAL&apos;, async (signal) =&gt; {'{'}<br />
                    &nbsp;&nbsp;if (signal.confidence &gt; 0.85) {'{'}<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;await loop.execute(&apos;momentum-buy&apos;, signal);<br />
                    &nbsp;&nbsp;{'}'}<br />
                    {'}'})
                </div>
            </div>

            {/* Idea 10 */}
            <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-8 hover:border-cyan-500/50 transition-colors group">
                <div className="flex items-start justify-between mb-6">
                    <div className="p-3 bg-cyan-500/10 rounded-xl text-stellar-teal">
                        <Database size={32} />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-white/5 text-xs font-mono text-gray-400">Difficulty: Easy</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Proof-of-Transparency Hedge Fund</h3>
                <p className="text-gray-400 mb-6 min-h-[60px]">
                    A fund where every trade decision is signed by the agent and uploaded immutably to the Neural Archive. Investors can verify the entire decision history on-chain at any time. Zero black boxes — full cryptographic accountability.
                </p>
                <div className="bg-black/50 rounded-lg p-4 font-mono text-sm text-stellar-teal/80">
                    <span className="text-gray-500">// Every decision = IPFS archive</span><br />
                    const cid = await ipfs.upload(tradeDecision);<br />
                    await stellar.tx.emitEvent({'{'} cid, hash {'}'});<br />
                    <span className="text-gray-500">// Investors verify anytime</span>
                </div>

            </div>
        </div>
    );
}
