"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation"; // Added
import { Suspense, useState, useEffect, useRef } from "react"; // Restored useEffect & added useRef
import {
    ArrowLeft, Book, Code, Shield, Layers, Cpu, Database, Zap,
    GitBranch, FileCode, Rocket, CheckCircle, AlertTriangle,
    Terminal, Globe, Lock, TrendingUp, ChevronRight, ChevronLeft, ExternalLink,
    Play, Settings, Users, Workflow, Key, Lightbulb, HardDrive, FileCheck, BookOpen, Activity, Heart, Clock,
    Handshake
} from "lucide-react";
import { SectionBrandLogo } from "@/components/ui/SectionBrandLogo";
import { useLanguage } from "../../context/LanguageContext";
import Navbar from "@/components/layout/Navbar";
import ApiKeyManager from "@/components/docs/ApiKeyManager";

type TabId = 'overview' | 'architecture' | 'contracts' | 'agent' | 'frontend' | 'api' | 'security' | 'blueprints' | 'builder';

function DocsContent() {
    const { t } = useLanguage();
    const searchParams = useSearchParams();
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const tabs = [
        { id: 'overview' as TabId, label: t.docs.nav.overview, icon: Book },
        { id: 'api' as TabId, label: t.docs.nav.api_sandbox, icon: Terminal },
        { id: 'blueprints' as TabId, label: "BLUEPRINTS", icon: Lightbulb },
        { id: 'architecture' as TabId, label: t.docs.nav.architecture, icon: Layers },
        { id: 'contracts' as TabId, label: t.docs.nav.contracts, icon: Code },
        { id: 'agent' as TabId, label: t.docs.nav.agent, icon: Cpu },
        { id: 'builder' as TabId, label: t.docs.nav.builder, icon: Workflow },
        { id: 'frontend' as TabId, label: t.docs.nav.frontend, icon: Globe },
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

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 300;
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <main className="min-h-screen bg-black text-white font-sans selection:bg-stellar-teal/30">
            <Navbar />

            <div className="fixed inset-0 z-0">
                <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-stellar-yellow/20 to-transparent opacity-50" />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-stellar-teal/10 blur-[120px] rounded-full" />
            </div>

            <div className="relative z-10 pt-32 sm:pt-40 md:pt-48 lg:pt-56">
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
                                        <h1 className="text-3xl sm:text-5xl md:text-7xl font-black font-mono tracking-tighter uppercase leading-none">{t.docs.overview.title}</h1>
                                        <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-mono rounded-full border border-green-500/30 animate-pulse">
                                            v0.5.0
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

                <div className="sticky top-16 z-20 bg-black/80 backdrop-blur-xl border-b border-white/10 group/nav">
                    {/* Navigation Arrows */}
                    <button 
                        onClick={() => scroll('left')}
                        className="absolute left-0 top-0 bottom-0 z-30 w-10 bg-gradient-to-r from-black via-black/80 to-transparent items-center justify-start pl-2 opacity-0 group-hover/nav:opacity-100 transition-opacity hidden md:flex"
                    >
                        <ChevronLeft className="w-5 h-5 text-stellar-teal" />
                    </button>
                    <button 
                        onClick={() => scroll('right')}
                        className="absolute right-0 top-0 bottom-0 z-30 w-10 bg-gradient-to-l from-black via-black/80 to-transparent items-center justify-end pr-2 opacity-0 group-hover/nav:opacity-100 transition-opacity hidden md:flex"
                    >
                        <ChevronRight className="w-5 h-5 text-stellar-teal" />
                    </button>

                    <div
                        ref={scrollContainerRef}
                        className="overflow-x-auto scrollbar-none"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
                    >
                        <div className="flex gap-1 py-2 px-10 min-w-max">
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
                        {activeTab === 'blueprints' && <IdeasSection />}
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

function LocalizedLoading() {
    const { t } = useLanguage();
    return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="animate-pulse text-stellar-teal font-mono">{t.docs.nav.loading}</div>
        </div>
    );
}

export default function DocsPage() {
    return (
        // @ts-ignore - React 19 type mismatch in Next.js
        <Suspense fallback={<LocalizedLoading />}>
            <DocsContent />
        </Suspense>
    );
}

function OverviewSection() {
    const { t } = useLanguage();
    return (
        <div className="space-y-12">
            {/* Hero Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                {[
                    { label: t.docs.overview.hero.version, value: 'v0.5.0', color: 'text-stellar-teal' },
                    { label: t.docs.overview.hero.contracts, value: '6 Testnet', color: 'text-green-400' },
                    { label: t.docs.overview.hero.helpers, value: '30+', color: 'text-purple-400' },
                    { label: t.docs.overview.hero.fee, value: '0.5%', color: 'text-amber-400' },
                    { label: t.docs.overview.hero.coins, value: 'XLM · USDC · CETES', color: 'text-blue-400' },
                ].map((stat) => (
                    <div key={stat.label} className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">{stat.label}</div>
                        <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                    </div>
                ))}
            </div>

            {/* Testnet Notice — PDD compliance */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-5 py-3 flex items-center gap-3 text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-amber-200">
                    {t.docs.overview.testnet_notice}
                </span>
            </div>

            {/* Executive Summary */}
            <section className="bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-2xl p-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <Shield className="text-stellar-yellow" />
                    {t.docs.overview.summary_title}
                </h2>
                <div className="prose prose-invert max-w-none text-gray-300 space-y-4">
                    <p className="text-lg leading-relaxed">
                        {t.docs.overview.summary_p1}
                    </p>
                    <p>
                        {t.docs.overview.summary_p2}
                    </p>
                    <p className="text-sm text-stellar-teal bg-stellar-teal/5 border border-stellar-teal/20 rounded-lg p-4 not-prose">
                        {t.docs.overview.summary_who}
                    </p>
                    <p className="text-xs text-gray-500">
                        {t.docs.overview.summary_warning}
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
                    {t.docs.overview.progressive_subtitle}
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-black/40 p-6 rounded-xl border border-stellar-yellow/30 hover:border-stellar-yellow/50 transition-colors">
                        <h3 className="text-xl font-bold text-stellar-yellow mb-4 flex items-center gap-2">
                            <Shield className="w-5 h-5" />
                            {t.docs.overview.control_approve.title}
                        </h3>
                        <ul className="space-y-3 text-gray-300">
                            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> {t.docs.overview.control_approve.item1}</li>
                            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> {t.docs.overview.control_approve.item2}</li>
                            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> {t.docs.overview.control_approve.item3}</li>
                            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> {t.docs.overview.control_approve.item4}</li>
                        </ul>
                    </div>
                    <div className="bg-black/40 p-6 rounded-xl border border-stellar-teal/30 hover:border-stellar-teal/50 transition-colors">
                        <h3 className="text-xl font-bold text-stellar-teal mb-4 flex items-center gap-2">
                            <Zap className="w-5 h-5" />
                            {t.docs.overview.control_auto.title}
                        </h3>
                        <ul className="space-y-3 text-gray-300">
                            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> {t.docs.overview.control_auto.item1}</li>
                            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> {t.docs.overview.control_auto.item2}</li>
                            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> {t.docs.overview.control_auto.item3}</li>
                            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> {t.docs.overview.control_auto.item4}</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Key Features */}
            <section>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <Rocket className="text-amber-400" />
                    {t.docs.overview.features_title}
                </h2>
                <div className="grid md:grid-cols-3 gap-4">
                    {[
                        { icon: Workflow, title: t.docs.overview.features.builder.title, desc: t.docs.overview.features.builder.desc, color: 'text-purple-400' },
                        { icon: BookOpen, title: t.docs.overview.features.guides.title, desc: t.docs.overview.features.guides.desc, color: 'text-stellar-teal' },
                        { icon: Layers, title: t.docs.overview.features.marketplace.title, desc: t.docs.overview.features.marketplace.desc, color: 'text-blue-400' },
                        { icon: TrendingUp, title: t.docs.overview.features.dashboard.title, desc: t.docs.overview.features.dashboard.desc, color: 'text-green-400' },
                        { icon: Lock, title: t.docs.overview.features.wallets.title, desc: t.docs.overview.features.wallets.desc, color: 'text-amber-400' },
                        { icon: HardDrive, title: t.docs.overview.features.ipfs.title, desc: t.docs.overview.features.ipfs.desc, color: 'text-pink-400' },
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
                    {t.docs.overview.transactions_title}
                </h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/10 text-gray-400 text-sm">
                                <th className="py-3 px-4">{t.docs.overview.tx_table.tx}</th>
                                <th className="py-3 px-4">{t.docs.overview.tx_table.amount}</th>
                                <th className="py-3 px-4">{t.docs.overview.tx_table.fee}</th>
                                <th className="py-3 px-4">{t.docs.overview.tx_table.status}</th>
                                <th className="py-3 px-4">{t.docs.overview.tx_table.link}</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {[
                                { hash: '7389da0b46ff7437…5328158', label: 'revoke_agent(1218)', amount: 'Soroban', fee: '0.0009446 XLM', link: 'https://stellar.expert/explorer/testnet/tx/7389da0b46ff743702847a0e15d1829ed84c4e6a621c36193d5c95d6e5328158' },
                                { hash: '5X6TDFkYvjvCb2LS…NanG', label: 'create_vault()', amount: 'Soroban', fee: '0.0003 XLM', link: 'https://stellar.expert/explorer/testnet/tx/5X6TDFkYvjvCb2LSE37DC7qNFs7UDgNy9izTs7amNanG' },
                                { hash: 'ExYe8kirfrUVkehc…VESP', label: 'deposit()', amount: '0.05 XLM', fee: '0.0001 XLM', link: 'https://stellar.expert/explorer/testnet/tx/ExYe8kirfrUVkehcz63NvDzSzZPz2gAoLoVyCpUcVESP' },
                            ].map((tx) => (
                                <tr key={tx.hash} className="border-b border-white/5">
                                    <td className="py-3 px-4 font-mono text-stellar-teal text-xs">{tx.hash}</td>
                                    <td className="py-3 px-4 text-gray-300 text-xs font-mono">{tx.label}</td>
                                    <td className="py-3 px-4 text-gray-400 text-xs">{tx.fee}</td>
                                    <td className="py-3 px-4"><span className="text-green-400">✓ {t.docs.overview.tx_table.success}</span></td>
                                    <td className="py-3 px-4">
                                        <a href={tx.link} target="_blank" className="text-stellar-teal hover:underline flex items-center gap-1">
                                            {t.docs.overview.tx_table.view} <ExternalLink className="w-3 h-3" />
                                        </a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="mt-4 text-sm text-gray-400">
                    <strong>Operator Wallet:</strong> <code className="text-stellar-teal">GC7FWETCRCBY4UC4XNLE3WD5X25EPHUKRKUJZ2XHVBJN7RGHTHZDTJ5Y</code>
                    <span className="ml-3 text-xs text-amber-400">⚠ Testnet — no real funds at risk</span>
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
│  │ Dashboard │  │Marketplace│  │ Analytics │  │ Treasury  │  │ Sandbox│ │
│  │ XLM/USDC  │  │  Skills   │  │ (Charts)  │  │ Rules     │  │  API   │ │
│  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘  └────┬───┘ │
└────────┼──────────────┼──────────────┼──────────────┼──────────────┼────┘
         │              │              │              │              │
         ▼              ▼              ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        @stellar/freighter-api                           │
│       (Wallet Connection, Auto-Reconnect, Transaction Signing)          │
└───────────────────────────────┬─────────────────────────┬───────────────┘
                                │                         │
         ┌──────────────────────┼─────────────────────────┼───────┐
         ▼                      ▼                         ▼       ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐ ┌─────────┐
│    SUPABASE      │  │ SETTLEMENT LAYER │  │  AGENT SWARMS    │ │ STELLAR │
│  (Database)      │  │  (x402 & MPP)    │  │ (Brain/Reasoner) │ │ SOROBAN │
│  - profiles      │  │  microbilling    │  │ - mcp servers    │ │ SDK     │
│  - agent_logs    │  │  streams         │  │ - NLP parsing    │ │         │
└────────┬─────────┘  └─────────┬────────┘  └─────────┬────────┘ └─────────┘
         │                      │                     │
         ▼                      ▼                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  NEURAL ARCHIVE (Decentralized IPFS Audit Logs & Strategy Schemas)      │
└─────────────────────────────────────────────────────────────────────────┘`}
                    </pre>
                </div>
            </section>

            <section>
                <h2 className="text-2xl font-bold mb-6">{t.docs.architecture.layers_title}</h2>
                <div className="space-y-4">
                    {[
                        {
                            title: t.docs.architecture.layers.stellar.title,
                            icon: Database,
                            color: 'border-stellar-teal',
                            items: t.docs.architecture.layers.stellar.items
                        },
                        {
                            title: t.docs.architecture.layers.helper.title,
                            icon: Cpu,
                            color: 'border-stellar-yellow',
                            items: t.docs.architecture.layers.helper.items
                        },
                        {
                            title: t.docs.architecture.layers.storage.title,
                            icon: Layers,
                            color: 'border-amber-500',
                            items: t.docs.architecture.layers.storage.items
                        },
                        {
                            title: t.docs.architecture.layers.app.title,
                            icon: Globe,
                            color: 'border-green-500',
                            items: t.docs.architecture.layers.app.items
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

            <section className="bg-white/5 border border-white/10 rounded-2xl p-8">
                <h2 className="text-2xl font-bold mb-6">{t.docs.architecture.launch_title}</h2>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {[
                        { step: '01', title: t.docs.architecture.steps.step1.title, desc: t.docs.architecture.steps.step1.desc },
                        { step: '02', title: t.docs.architecture.steps.step2.title, desc: t.docs.architecture.steps.step2.desc },
                        { step: '03', title: t.docs.architecture.steps.step3.title, desc: t.docs.architecture.steps.step3.desc },
                        { step: '04', title: t.docs.architecture.steps.step4.title, desc: t.docs.architecture.steps.step4.desc },
                        { step: '05', title: t.docs.architecture.steps.step5.title, desc: t.docs.architecture.steps.step5.desc },
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

            {/* SCF Roadmap */}
            <section className="bg-gradient-to-br from-stellar-teal/10 to-transparent border border-stellar-teal/20 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-8">
                    <TrendingUp className="text-stellar-teal w-6 h-6" />
                    <h2 className="text-2xl font-bold">{t.docs.contracts.milestones_title}</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.entries(t.docs.contracts.milestones).map(([key, value]) => (
                        <div key={key} className="bg-black/40 border border-white/5 p-4 rounded-xl flex items-start gap-3">
                            <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${key === 'm2' ? 'bg-stellar-teal shadow-[0_0_10px_#00ffcc] animate-pulse' : 'bg-gray-600'}`} />
                            <p className={`text-sm ${key === 'm2' ? 'text-white font-bold' : 'text-gray-400'}`}>{value as string}</p>
                        </div>
                    ))}
                </div>
                <div className="mt-8 pt-6 border-t border-white/5">
                    <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                        <Heart className="text-pink-400 w-5 h-5" />
                        {t.docs.contracts.instaward_title}
                    </h3>
                    <p className="text-sm text-gray-400 leading-relaxed">
                        {t.docs.contracts.instaward_desc}
                    </p>
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
                <h2 className="text-2xl font-bold mb-6">{t.docs.api.contracts_title} (Testnet v0.5.0)</h2>
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
                            {[
                                { name: 'NiriumVault', id: 'CAU2XBJTQUBTMPAUFRX7GMZ337I5WLBI4GYPWHZEVXTMJ66D3CP6DEL4', color: 'text-stellar-teal', desc: t.docs.contracts.items.vault },
                                { name: 'ELO Registry', id: 'CC6Z3WJWRKVEAXEKIQ5S3LFEMKRF4L2FTN5YZDQU27MQRQAWA5QBJWF2', color: 'text-purple-400', desc: t.docs.contracts.items.elo },
                                { name: 'Marketplace', id: 'CB6Q3LKBJ7CAAZY4MK7EG5R6FDDTJHB52ZEENI6BQLBJNFKBQRIAUABC', color: 'text-blue-400', desc: t.docs.contracts.items.marketplace },
                                { name: 'Neural Sentinel', id: 'CCP5OY3TTDVIREQYGOUZUXS2MZJO3LLJD6Z22Z3VROWFCPJAON22WPY2', color: 'text-amber-400', desc: t.docs.contracts.items.sentinel },
                                { name: 'Settlement Hub', id: 'CANZP2OJUS2Y5VXE4YHRR75LE2WKE7QTJOCCWENR7X65DWE6QEJZV6KS', color: 'text-green-400', desc: t.docs.contracts.items.settlement },
                                { name: 'Skill Vault', id: 'CB4JM3PP7GWKJUAYIZ7ZULWFTFJ57FTTUFZTFIDF4JCAPF664OJCXIEI', color: 'text-pink-400', desc: t.docs.contracts.items.skill },
                            ].map((c) => (
                                <tr key={c.name} className="border-b border-white/5 hover:bg-white/5">
                                    <td className="py-4 px-4 text-white font-bold font-sans">{c.name}</td>
                                    <td className={`py-4 px-4 ${c.color} break-all text-xs`}>
                                        <a href={`https://stellar.expert/explorer/testnet/contract/${c.id}`} target="_blank" className="hover:underline flex items-center gap-1">
                                            {c.id.slice(0, 8)}…{c.id.slice(-6)} <ExternalLink className="w-3 h-3 inline" />
                                        </a>
                                    </td>
                                    <td className="py-4 px-4 text-gray-400 font-sans">{c.desc}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            <section>
                <h2 className="text-2xl font-bold mb-6">{t.docs.contracts.state_title}</h2>
                <div className="space-y-6">
                    <div className="bg-[#0A0A0A] border border-white/10 rounded-xl overflow-hidden">
                        <div className="px-4 py-2 bg-white/5 border-b border-white/10 flex items-center gap-2">
                            <FileCode className="w-4 h-4 text-stellar-teal" />
                            <span className="text-sm font-mono text-gray-400">VaultRecord</span>
                        </div>
                        <pre className="p-4 text-sm font-mono text-gray-300 overflow-x-auto">
                            {`#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct VaultRecord {
    pub owner: Address,
    pub asset: Address,
    pub balance: i128,
}`}
                        </pre>
                    </div>

                    <div className="bg-[#0A0A0A] border border-white/10 rounded-xl overflow-hidden">
                        <div className="px-4 py-2 bg-white/5 border-b border-white/10 flex items-center gap-2">
                            <FileCode className="w-4 h-4 text-purple-500" />
                            <span className="text-sm font-mono text-gray-400">EloScore</span>
                        </div>
                        <pre className="p-4 text-sm font-mono text-gray-300 overflow-x-auto">
                            {`#[contracttype]
pub struct EloScore {
    pub agent_id: BytesN<32>,
    pub wins: u32,
    pub matches: u32,
    pub rating: u32,
}`}
                        </pre>
                    </div>
                </div>
            </section>

            <section>
                <h2 className="text-2xl font-bold mb-6">{t.docs.contracts.functions_title}</h2>
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
                                { fn: 'create_vault', sig: 'pub fn create_vault(env, owner, token, name, xlm_asset) → Vault', desc: t.docs.contracts.functions.create_vault },
                                { fn: 'deposit', sig: 'pub fn deposit(env, vault_id: u64, amount: i128)', desc: t.docs.contracts.functions.deposit },
                                { fn: 'withdraw', sig: 'pub fn withdraw(env, vault_id: u64, amount: i128)', desc: t.docs.contracts.functions.withdraw },
                                { fn: 'delegate_agent', sig: 'pub fn delegate_agent(env, vault_id: u64, agent: Address, max: i128)', desc: t.docs.contracts.functions.delegate_agent },
                                { fn: 'revoke_agent', sig: 'pub fn revoke_agent(env, vault_id: u64, agent: Address)', desc: t.docs.contracts.functions.revoke_agent },
                                { fn: 'close_vault', sig: 'pub fn close_vault(env, vault_id: u64)', desc: t.docs.contracts.functions.close_vault },
                                { fn: 'publish_strategy', sig: 'pub fn publish_strategy(env, creator, name, ipfs_cid, fee: i128)', desc: t.docs.contracts.functions.publish_strategy },
                                { fn: 'open_session', sig: 'pub fn open_session(env, caller, agent, budget: i128, duration: u64)', desc: t.docs.contracts.functions.open_session },
                                { fn: 'unlock_skill', sig: 'pub fn unlock_skill(env, caller, skill_id: String)', desc: t.docs.contracts.functions.unlock_skill },
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
                        'test_vault_deposit_withdraw',
                        'test_marketplace_register',
                        'test_elo_rating_update',
                        'test_sentinel_emergency_pause',
                        'test_hub_authorization'
                    ].map((test) => (
                        <div key={test} className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-2 py-1 border-b border-white/5 xs:border-0">
                            <span className="text-green-400 font-bold shrink-0">[PASS]</span>
                            <span className="text-gray-400 break-all md:break-normal">test::{test}</span>
                        </div>
                    ))}
                    <div className="mt-4 pt-4 border-t border-white/10 text-green-400">
                        Test result: OK. Total tests: 32; passed: 32; failed: 0
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
                <h2 className="text-2xl font-bold mb-6">Helpers (x402 & MPP)</h2>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <h3 className="font-bold text-white mb-4">{t.docs.agent.use_title}</h3>
                        <ul className="space-y-2 text-gray-400 text-sm">
                            {t.docs.agent.use_items.map((item: string, i: number) => (
                                <li key={i}>• {item}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <h3 className="font-bold text-white mb-4">{t.docs.agent.status_title}</h3>
                        <div className="flex items-center gap-2 text-green-400">
                            <CheckCircle className="w-5 h-5" />
                            <span className="font-bold">{t.docs.agent.status_live}</span>
                        </div>
                        <p className="text-sm text-gray-400 mt-2">
                            x402 service: <code className="text-stellar-teal">{t.docs.agent.status_running}</code><br/>
                            Payment streams: <code className="text-amber-500">{t.docs.agent.status_running}</code>
                        </p>
                    </div>
                </div>
            </section>

            <section>
                <h2 className="text-2xl font-bold mb-6">{t.docs.agent.layout_title}</h2>
                <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-4 font-mono text-[10px] xs:text-xs sm:text-sm overflow-x-auto scrollbar-thin scrollbar-thumb-white/10">
                    <pre className="text-gray-400 whitespace-pre">
                        {`packages/
├── mcp/                      # Model Context Protocol service
├── memory-mcp/               # Persistent AI memory context
└── agent/                    # Base ElizaOS implementation

scripts/
├── x402_server.ts            # Microbilling REST/Webhook layer
├── x402_agent_bot.ts         # Autonomous X402 client swarm
├── mpp_server.ts             # Money streaming protocol core
├── mpp_agent_bot.ts          # Continuous streaming worker
└── neural_reasoner_bot.ts    # Central coordinator & parser`}
                    </pre>
                </div>
            </section>

            <section>
                <h2 className="text-2xl font-bold mb-6">{t.docs.agent.flow_title}</h2>
                <div className="space-y-4">
                    {t.docs.agent.flow_steps.map((item: any, i: number) => (
                        <div key={i} className="flex items-start gap-4 bg-white/5 rounded-lg p-4">
                            <div className="w-8 h-8 rounded-full bg-stellar-teal/20 text-stellar-teal flex items-center justify-center font-bold shrink-0">
                                {i + 1}
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
                    {`# Run Settlement Subsystems
pnpm run start:x402-server
pnpm run start:mpp-server

# Deploy Agent Swarms
pnpm run start:neural-reasoner
pnpm run start:x402-agent
pnpm run start:mpp-agent

# Expected output (X402 Agent):
[X402 Agent] Starting X402 payment flow...
[X402 Agent] Found Token in storage!
[X402 Agent] Requesting premium resource...
✅ Transaction Successful
[X402 Agent] Content: "CONFIDENTIAL REASONING..."`}
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
                    {t.docs.builder.title}
                </h2>
                <p className="text-gray-400 mb-8 leading-relaxed">
                    {t.docs.builder.subtitle}
                </p>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors">
                        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                            <Layers className="w-5 h-5 text-stellar-teal" />
                            {t.docs.builder.boxes_title}
                        </h3>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li>• {t.docs.builder.categories.money_in}</li>
                            <li>• {t.docs.builder.categories.timing}</li>
                            <li>• {t.docs.builder.categories.brain}</li>
                            <li>• {t.docs.builder.categories.work}</li>
                            <li>• {t.docs.builder.categories.storage}</li>
                            <li>• {t.docs.builder.categories.checks}</li>
                        </ul>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors">
                        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                            <Zap className="w-5 h-5 text-amber-500" />
                            What "Run" Actually Does
                        </h3>
                        <p className="text-sm text-gray-400 mb-3">
                            Click <strong className="text-white">Run</strong> and your boxes get turned into real Stellar transactions. Everything happens as one unit — if one step fails, nothing moves. No half-sent money.
                        </p>
                        <ul className="space-y-1 text-sm text-gray-400">
                            <li className="flex items-center gap-2"><span className="text-stellar-teal">⬆</span> Your strategy gets saved to <strong className="text-white">IPFS</strong> — permanent audit trail</li>
                            <li className="flex items-center gap-2"><span className="text-[#4ca2ff]">💾</span> <strong className="text-white">Export</strong> downloads the JSON if you want to inspect or share it</li>
                            <li className="flex items-center gap-2"><span className="text-stellar-yellow">🏦</span> <strong className="text-white">SPEI / Crypto</strong> toggle picks the payment rail</li>
                        </ul>
                    </div>
                </div>

                {/* Node category color reference */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                    {[
                        { label: 'MONEY IN', color: 'from-cyan-400 to-blue-500' },
                        { label: 'WHEN TO ACT', color: 'from-amber-400 to-orange-500' },
                        { label: 'AI BRAIN', color: 'from-purple-500 to-indigo-600' },
                        { label: 'PUT TO WORK', color: 'from-blue-400 to-cyan-500' },
                        { label: 'SAFE STORAGE', color: 'from-emerald-500 to-green-600' },
                        { label: 'CHECKS', color: 'from-pink-500 to-rose-600' },
                    ].map(c => (
                        <div key={c.label} className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2">
                            <div className={`w-1 h-8 rounded-full bg-gradient-to-b ${c.color} shrink-0`} />
                            <span className="text-[9px] font-mono text-gray-400 uppercase leading-tight">{c.label}</span>
                        </div>
                    ))}
                </div>
            </section>

            <section className="bg-stellar-yellow/5 border border-stellar-yellow/20 rounded-2xl p-8">
                <h3 className="text-xl font-bold mb-4">Why This Matters</h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                    <div>
                        <div className="text-stellar-yellow font-bold mb-1">No Code</div>
                        <p className="text-xs text-gray-500">Build without writing a single line. Drag, connect, run.</p>
                    </div>
                    <div>
                        <div className="text-stellar-yellow font-bold mb-1">Real Transactions</div>
                        <p className="text-xs text-gray-500">Your boxes become real Stellar operations behind the scenes.</p>
                    </div>
                    <div>
                        <div className="text-stellar-yellow font-bold mb-1">Always Auditable</div>
                        <p className="text-xs text-gray-500">Every run saved on IPFS — forever, tamper-proof.</p>
                    </div>
                    <div>
                        <div className="text-stellar-yellow font-bold mb-1">Multi-Coin</div>
                        <p className="text-xs text-gray-500">XLM, USDC, and Mexican pesos via SPEI.</p>
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
            <section>
                <h2 className="text-2xl font-bold mb-6">{t.docs.frontend.stack_title}</h2>
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

            <section>
                <h2 className="text-2xl font-bold mb-6">{t.docs.frontend.pages_title}</h2>
                <div className="space-y-4">
                    {[
                        { path: '/', name: t.docs.frontend.pages.home.name, desc: t.docs.frontend.pages.home.desc, lines: 330 },
                        { path: '/how-to-use', name: t.docs.frontend.pages.how_to_use.name, desc: t.docs.frontend.pages.how_to_use.desc, lines: 180 },
                        { path: '/dashboard', name: t.docs.frontend.pages.dashboard.name, desc: t.docs.frontend.pages.dashboard.desc, lines: 2384 },
                        { path: '/treasury', name: t.docs.frontend.pages.treasury.name, desc: t.docs.frontend.pages.treasury.desc, lines: 572 },
                        { path: '/marketplace', name: t.docs.frontend.pages.marketplace.name, desc: t.docs.frontend.pages.marketplace.desc, lines: 835 },
                        { path: '/agents', name: t.docs.frontend.pages.agents.name, desc: t.docs.frontend.pages.agents.desc, lines: 280 },
                        { path: '/sandbox', name: t.docs.frontend.pages.sandbox.name, desc: t.docs.frontend.pages.sandbox.desc, lines: 310 },
                        { path: '/analytics', name: t.docs.frontend.pages.analytics.name, desc: t.docs.frontend.pages.analytics.desc, lines: 200 },
                        { path: '/docs', name: t.docs.frontend.pages.docs.name, desc: t.docs.frontend.pages.docs.desc, lines: 1173 },
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

            <section>
                <h2 className="text-2xl font-bold mb-6">{t.docs.frontend.blocks_title}</h2>
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
                            {t.docs.frontend.wallet_desc}
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
                            {t.docs.frontend.strategy_desc}
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
                        <h2 className="text-4xl font-black tracking-tight">NIRIUM API</h2>
                    </div>
                    <p className="text-gray-400 text-lg max-w-3xl leading-relaxed mb-8">
                        {t.docs.api.subtitle}
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
                    <h3 className="text-2xl font-bold">{t.docs.api.auth_title}</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6">
                            <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                                <Shield className="w-4 h-4 text-stellar-teal" /> API Key (x-api-key header)
                            </h4>
                            <p className="text-sm text-gray-400 mb-4">Use this for servers, bots, or any app that needs steady access. Send the key in a header on every request.</p>
                            <div className="bg-black/50 p-4 rounded-lg font-mono text-xs text-stellar-teal border border-stellar-teal/20 mb-4">
                                curl -H "x-api-key: sk_inst_[TU_KEY]" \ <br />
                                &nbsp;&nbsp;https://api.nirium.xyz/api/market
                            </div>
                            <p className="text-[10px] text-gray-500">Your key starts with one of these: <span className="text-gray-400 font-mono">sk_free_</span> · <span className="text-gray-400 font-mono">sk_sbox_</span> · <span className="text-gray-400 font-mono">sk_inst_</span> · <span className="text-gray-400 font-mono">sk_ent_</span></p>
                        </div>

                        <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6">
                            <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                                <Lock className="w-4 h-4 text-stellar-yellow" /> Short-Lived Token (JWT)
                            </h4>
                            <p className="text-sm text-gray-400 mb-4">Use this for browser apps. Sign in with your wallet once and get a 24-hour token you send on every request.</p>
                            <div className="bg-black/50 p-4 rounded-lg font-mono text-xs text-stellar-yellow border border-stellar-yellow/20">
                                Authorization: Bearer eyJhbGciOi...
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-stellar-teal/5 to-transparent border border-white/10 rounded-2xl p-8">
                        <h4 className="text-white font-bold mb-6">{t.docs.api.pricing_title}</h4>
                        <div className="space-y-4">
                            {[
                                { tier: 'Free', req: '100 calls/day', speed: '10 per min', prefix: 'sk_free_' },
                                { tier: 'Sandbox', req: '1,000 calls/day', speed: '60 per min', prefix: 'sk_sbox_' },
                                { tier: 'Pro', req: '10,000 calls/day', speed: '300 per min', prefix: 'sk_inst_' },
                                { tier: 'Enterprise', req: '100,000+ calls/day', speed: '1,000+ per min', prefix: 'sk_ent_' },
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
                                🔒 {t.docs.api.pricing_warning}
                            </p>
                            <p className="text-[10px] text-gray-500 mt-1">
                                {t.docs.api.pricing_desc}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Smart Contracts Directory */}
            <section>
                <div className="flex items-center gap-3 mb-8">
                    <Database className="text-purple-400 w-6 h-6" />
                    <h3 className="text-2xl font-bold">{t.docs.api.contracts_title} (Testnet)</h3>
                </div>
                <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/10 text-xs font-mono text-gray-500">
                                <th className="py-4 px-6 uppercase tracking-widest">Contract / Asset</th>
                                <th className="py-4 px-6 uppercase tracking-widest">On-Chain Address</th>
                                <th className="py-4 px-6 text-right uppercase tracking-widest">Network</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {[
                                { name: 'Main Vault (holds money)', id: 'CAU2XBJTQUBTMPAUFRX7GMZ337I5WLBI4GYPWHZEVXTMJ66D3CP6DEL4', short: 'CAU2XBJ...EL4', type: 'Nirium Core' },
                                { name: 'Reputation System', id: 'CC6Z3WJWRKVEAXEKIQ5S3LFEMKRF4L2FTN5YZDQU27MQRQAWA5QBJWF2', short: 'CC6Z3W...JWF2', type: 'Scores' },
                                { name: 'Marketplace', id: 'CB6Q3LKBJ7CAAZY4MK7EG5R6FDDTJHB52ZEENI6BQLBJNFKBQRIAUABC', short: 'CB6Q3L...UABC', type: 'Listings' },
                                { name: 'CETES (Mexican bonds)', id: 'CC72F57YTPX76HAA64JQOEGHQAPSADQWSY5DWVBR66JINPFDLNCQYHIC', short: 'CC72F5...CQYHIC', type: 'Asset' },
                            ].map((c) => (
                                <tr key={c.name} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                    <td className="py-4 px-6">
                                        <div className="text-white font-bold">{c.name}</div>
                                        <div className="text-[10px] text-gray-500 uppercase">{c.type}</div>
                                    </td>
                                    <td className="py-2 px-6">
                                        <a 
                                            href={`https://stellar.expert/explorer/testnet/contract/${c.id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 font-mono text-xs text-stellar-teal hover:bg-stellar-teal/10 hover:border-stellar-teal/30 transition-all items-center gap-2"
                                        >
                                            {c.short}
                                            <ExternalLink size={10} className="text-gray-600 group-hover:text-stellar-teal transition-colors" />
                                        </a>
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
                        <h3 className="text-2xl font-bold">{t.docs.api.examples_title}</h3>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* REST API Python */}
                    <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden flex flex-col">
                        <div className="px-5 py-3 bg-white/5 border-b border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-6 bg-stellar-teal rounded-full" />
                                <span className="text-xs font-mono text-gray-400">PYTHON — CHECK YOUR STATUS</span>
                                <a href="https://pypi.org/project/nirium/" target="_blank" rel="noreferrer" className="bg-black/40 px-2 py-0.5 rounded text-[10px] font-mono text-stellar-teal border border-stellar-teal/20 hover:bg-stellar-teal/10 transition-colors">
                                    pip install nirium
                                </a>
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
                                <span className="text-xs font-mono text-gray-400">NODE.JS — LISTEN FOR LIVE SIGNALS</span>
                                <a href="https://www.npmjs.com/package/nirium" target="_blank" rel="noreferrer" className="bg-black/40 px-2 py-0.5 rounded text-[10px] font-mono text-purple-400 border border-purple-500/20 hover:bg-purple-500/10 transition-colors">
                                    npm install nirium
                                </a>
                            </div>
                        </div>
                        <pre className="p-6 text-xs font-mono text-gray-300 overflow-x-auto leading-relaxed bg-black/40 flex-grow">
                            {`const WebSocket = require('ws');
const API_KEY = process.env.NIRIUM_API_KEY;

const ws = new WebSocket('wss://api.nirium.xyz/ws/signals', {
  headers: { 'x-api-key': API_KEY }
});

ws.on('open', () => {
  console.log('📡 Connected to Nirium live feed');
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
                        t.docs.api.sla_items.uptime,
                        t.docs.api.sla_items.speed,
                        t.docs.api.sla_items.support,
                    ].map((item: any, idx: number) => {
                        const icons = [Globe, Zap, Heart];
                        const Icon = icons[idx];
                        return (
                        <div key={item.title} className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Icon className="w-4 h-4 text-stellar-teal" />
                                <span className="text-sm text-gray-400 font-bold uppercase tracking-widest">{item.title}</span>
                            </div>
                            <div className="text-4xl font-black text-white">{item.target}</div>
                            <p className="text-xs text-gray-500 leading-relaxed">{item.detail}</p>
                        </div>
                        );
                    })}
                </div>

                {/* Health Checklist Final */}
                <div className="mt-12 bg-white/5 border border-white/5 rounded-2xl p-6 flex flex-wrap gap-x-12 gap-y-4">
                    <div className="flex items-center gap-2">
                        <CheckCircle size={14} className="text-stellar-teal" />
                        <span className="text-xs text-gray-400">{t.docs.api.security_checklist.ssl}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CheckCircle size={14} className="text-stellar-teal" />
                        <span className="text-xs text-gray-400">{t.docs.api.security_checklist.encryption}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CheckCircle size={14} className="text-stellar-teal" />
                        <span className="text-xs text-gray-400">{t.docs.api.security_checklist.ipfs}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CheckCircle size={14} className="text-stellar-teal" />
                        <span className="text-xs text-gray-400">{t.docs.api.security_checklist.soc2}</span>
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
        { id: 'skills', label: t.docs.api.categories.skills, icon: Layers },
        { id: 'events', label: t.docs.api.categories.events, icon: Zap },
    ];

    const endpoints: Record<string, any[]> = {
        auth: t.docs.api.endpoints.auth.map((e: any, i: number) => ({
            method: ['GET', 'GET', 'GET', 'GET', 'GET', 'POST', 'POST', 'POST', 'POST', 'GET', 'DELETE'][i],
            path: ['/health', '/api/info', '/api/public/market-snapshot', '/api/public/quickstart', '/api/public/examples', '/api/public/authenticate', '/api/public/demo-auth', '/api/auth/token', '/api/auth/keys', '/api/auth/keys', '/api/auth/keys/:id'][i],
            desc: e.desc
        })),
        market: t.docs.api.endpoints.market.map((e: any, i: number) => ({
            method: ['GET', 'GET', 'GET', 'GET'][i],
            path: ['/api/market', '/api/signals/recent', '/api/tickers', '/api/stats/global'][i],
            desc: e.desc
        })),
        exec: t.docs.api.endpoints.exec.map((e: any, i: number) => ({
            method: ['POST', 'POST', 'POST', 'POST', 'GET', 'POST'][i],
            path: ['/api/execute', '/api/execute-demo', '/api/loop/start', '/api/loop/stop', '/api/loop/status', '/api/loop/scan'][i],
            desc: e.desc
        })),
        sandbox: t.docs.api.endpoints.sandbox.map((e: any, i: number) => ({
            method: ['POST', 'GET', 'GET', 'GET', 'DELETE'][i],
            path: ['/api/sandbox/request', '/api/sandbox/info', '/api/sandbox/status', '/api/sandbox/accounts', '/api/sandbox/accounts/:id'][i],
            desc: e.desc
        })),
        skills: t.docs.api.endpoints.skills.map((e: any, i: number) => ({
            method: ['GET', 'GET', 'POST', 'DELETE', 'POST', 'GET'][i],
            path: ['/api/skills', '/api/skills/marketplace', '/api/skills/install', '/api/skills/:slug', '/api/skills/:slug/actions/:action', '/api/strategies'][i],
            desc: e.desc
        })),
        events: t.docs.api.endpoints.events.map((e: any, i: number) => ({
            method: ['POST', 'GET', 'POST', 'DELETE', 'POST', 'GET', 'DELETE', 'GET', 'WS'][i],
            path: ['/api/webhooks', '/api/webhooks', '/api/webhooks/:id/test', '/api/webhooks/:id', '/api/subscriptions', '/api/subscriptions', '/api/subscriptions/:id', '/api/subscriptions/stats', 'wss://api.nirium.xyz/ws/signals'][i],
            desc: e.desc
        }))
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
                        {t.docs.security.atomic_subtitle}
                    </p>
                    <ul className="space-y-3">
                        {t.docs.security.atomic_items.map((item: any) => (
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
                                <th className="py-3 px-4">{t.common.threat || 'Threat'}</th>
                                <th className="py-3 px-4">{t.common.protection || 'How We Stop It'}</th>
                                <th className="py-3 px-4">{t.common.status || 'Status'}</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {t.docs.security.threats.map((item: any) => (
                                <tr key={item.attack} className="border-b border-white/5 hover:bg-white/5">
                                    <td className="py-3 px-4 text-red-400">{item.attack}</td>
                                    <td className="py-3 px-4 text-gray-300">{item.protection}</td>
                                    <td className="py-3 px-4 text-green-400 font-bold">✓</td>
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
                    {t.docs.security.data_privacy.title}
                </h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-white/10 text-gray-400">
                                <th className="py-2 px-3">{t.common.component || 'What'}</th>
                                <th className="py-2 px-3">{t.common.protection || 'Who Can See It'}</th>
                            </tr>
                        </thead>
                        <tbody className="font-mono">
                            <tr className="border-b border-white/5">
                                <td className="py-2 px-3 text-stellar-teal">{t.docs.security.data_privacy.profile.label}</td>
                                <td className="py-2 px-3 text-gray-400">{t.docs.security.data_privacy.profile.desc}</td>
                            </tr>
                            <tr className="border-b border-white/5">
                                <td className="py-2 px-3 text-stellar-teal">{t.docs.security.data_privacy.strategies.label}</td>
                                <td className="py-2 px-3 text-gray-400">{t.docs.security.data_privacy.strategies.desc}</td>
                            </tr>
                            <tr className="border-b border-white/5">
                                <td className="py-2 px-3 text-stellar-teal">{t.docs.security.data_privacy.logs.label}</td>
                                <td className="py-2 px-3 text-gray-400">{t.docs.security.data_privacy.logs.desc}</td>
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
                        {t.docs.security.recording.title}
                    </h2>
                    <div className="space-y-4 text-sm text-gray-300">
                        <p>
                            {t.docs.security.recording.desc}
                        </p>
                        <div className="bg-black/40 p-3 rounded font-mono text-xs text-green-300 border border-green-500/10">
                            verify_tx(agent_id, tx_hash) {'{'}<br />
                            &nbsp;&nbsp;return stellar::verify_sig(id.pubkey, tx.hash);<br />
                            {'}'}
                        </div>
                        <div className="flex items-center gap-2 text-green-400 font-bold">
                            <CheckCircle size={16} /> {t.docs.security.recording.proof}
                        </div>
                    </div>
                </div>

                <div className="bg-pink-500/5 border border-pink-500/20 rounded-xl p-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <HardDrive className="text-pink-400" />
                        {t.docs.security.ipfs.title}
                    </h2>
                    <div className="space-y-4 text-sm text-gray-300">
                        <p>
                            {t.docs.security.ipfs.desc}
                        </p>
                        <ul className="space-y-2">
                            {t.docs.security.ipfs.items.map((item: string) => (
                                <li key={item} className="flex items-center gap-2 op-70"><CheckCircle size={14} /> {item}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            {/* Stellar Code of Conduct */}
            <section className="bg-gradient-to-br from-stellar-teal/5 to-stellar-yellow/5 border border-white/10 rounded-2xl p-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <Activity className="text-stellar-teal" />
                    {t.docs.security.stellar_coc.title}
                </h2>
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        {t.docs.security.stellar_coc.principles.map((p: string, i: number) => (
                            <div key={i} className="flex items-start gap-3 bg-black/40 p-4 rounded-xl border border-white/5">
                                <CheckCircle className="w-5 h-5 text-stellar-teal shrink-0 mt-0.5" />
                                <p className="text-sm text-gray-300 leading-relaxed">{p}</p>
                            </div>
                        ))}
                    </div>
                    <div className="bg-stellar-teal/10 p-6 rounded-2xl border border-stellar-teal/20 flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-stellar-teal/20 rounded-full flex items-center justify-center">
                                <Shield className="w-5 h-5 text-stellar-teal" />
                            </div>
                            <h3 className="font-bold text-white">Compliance Standard</h3>
                        </div>
                        <p className="text-sm text-gray-400 mb-6">
                            {t.docs.security.stellar_coc.compliance}
                        </p>
                        <div className="flex items-center gap-2 px-3 py-2 bg-black/40 rounded-lg border border-white/5">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span className="text-[10px] font-mono text-gray-500 uppercase">Last Verification: April 26, 2026</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Institutional Compliance & Code of Conduct Footer */}
            <section className="bg-stellar-teal/5 border border-stellar-teal/20 rounded-2xl p-8">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                            <Shield className="text-stellar-teal" />
                            Institutional Integrity & Governance
                        </h2>
                        <p className="text-gray-400 leading-relaxed mb-6">
                            Nirium Protocol operates under the highest integrity standards of the Stellar ecosystem. Our architecture is designed to satisfy institutional audits and international regulatory frameworks (KYC/AML/SEP-12) within the April 2026 compliance landscape.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                                <div className="text-stellar-teal font-bold text-xs uppercase mb-1">Stellar Foundation Standards</div>
                                <p className="text-[11px] text-gray-500 text-balance">Full alignment with SDF guidelines for transparency, security, and professional conduct across the public network.</p>
                            </div>
                            <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                                <div className="text-stellar-teal font-bold text-xs uppercase mb-1">SEP-12 / SEP-24 Readiness</div>
                                <p className="text-[11px] text-gray-500 text-balance">Infrastructure prepared for regulated identity provider integration and 'Know Your Customer' strict compliance.</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-stellar-teal/10 p-6 rounded-2xl border border-stellar-teal/30 flex flex-col items-center justify-center text-center max-w-xs w-full">
                        <div className="w-16 h-16 bg-stellar-teal/20 rounded-full flex items-center justify-center mb-4">
                            <Shield className="w-8 h-8 text-stellar-teal" />
                        </div>
                        <div className="text-white font-bold mb-1">Audit-Ready v0.5</div>
                        <p className="text-[10px] text-gray-400 leading-tight">Every byte of telemetry is cryptographically signed and independently verifiable.</p>
                        <div className="mt-4 px-3 py-1 bg-stellar-teal text-black text-[10px] font-black rounded-full uppercase tracking-tighter">
                            ALINEADO A SCF 7.0 & INSTAWARD
                        </div>
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
                {t.docs.ideas.items.map((idea: any, idx: number) => {
                    const icons = [Shield, Zap, Globe, Users, TrendingUp, Zap, Globe, Shield, Code, Database, Handshake, Cpu];
                    const borders = [
                        'hover:border-yellow-500/50',
                        'hover:border-stellar-teal/50',
                        'hover:border-purple-500/50',
                        'hover:border-green-500/50',
                        'hover:border-blue-500/50',
                        'hover:border-rose-500/50',
                        'hover:border-amber-500/50',
                        'hover:border-violet-500/50',
                        'hover:border-teal-500/50',
                        'hover:border-cyan-500/50',
                        'hover:border-indigo-500/50',
                        'hover:border-emerald-500/50'
                    ];
                    const bgIcons = [
                        'bg-yellow-500/10 text-yellow-500',
                        'bg-stellar-teal/10 text-stellar-teal',
                        'bg-purple-500/10 text-purple-500',
                        'bg-green-500/10 text-green-500',
                        'bg-blue-500/10 text-blue-400',
                        'bg-rose-500/10 text-rose-400',
                        'bg-amber-500/10 text-amber-400',
                        'bg-violet-500/10 text-violet-400',
                        'bg-teal-500/10 text-teal-400',
                        'bg-cyan-500/10 text-stellar-teal',
                        'bg-indigo-500/10 text-indigo-400',
                        'bg-emerald-500/10 text-emerald-400'
                    ];
                    const Icon = icons[idx] || Code;

                    return (
                        <div key={idea.name} className={`bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 sm:p-8 transition-colors group ${borders[idx]}`}>
                            <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-4 mb-6">
                                <div className={`p-3 rounded-xl shrink-0 ${bgIcons[idx]}`}>
                                    <Icon size={32} />
                                </div>
                                <span className="px-3 py-1 rounded-full bg-white/5 text-[10px] sm:text-xs font-mono text-gray-400 self-start xs:self-center">
                                    {t.docs.ideas.difficulty}: {idea.diff === 'Easy' ? t.docs.ideas.easy : idea.diff === 'Medium' ? t.docs.ideas.medium : t.docs.ideas.hard}
                                </span>
                            </div>
                            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">{idea.name}</h3>
                            <p className="text-gray-400 mb-6 sm:min-h-[60px] text-sm sm:text-base leading-relaxed">
                                {idea.desc}
                            </p>
                            <div className="bg-black/50 rounded-lg p-4 font-mono text-[10px] sm:text-sm text-stellar-teal/80 overflow-x-auto scrollbar-thin">
                                {idea.code.split('\n').map((line: string, lIdx: number) => (
                                    <div key={lIdx}>
                                        {line.startsWith('#') || line.startsWith('//') ? (
                                            <span className="text-gray-500">{line}</span>
                                        ) : (
                                            line
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
