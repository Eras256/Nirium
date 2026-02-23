"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation"; // Added
import { Suspense, useState, useEffect } from "react"; // Restored useEffect
import {
    ArrowLeft, Book, Code, Shield, Layers, Cpu, Database, Zap,
    GitBranch, FileCode, Rocket, CheckCircle, AlertTriangle,
    Terminal, Globe, Lock, TrendingUp, ChevronRight, ExternalLink,
    Play, Settings, Users, Workflow, Key, Lightbulb, HardDrive, FileCheck, BookOpen
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import ApiKeyManager from "@/components/docs/ApiKeyManager";

type TabId = 'overview' | 'architecture' | 'contracts' | 'agent' | 'frontend' | 'api' | 'security' | 'ideas' | 'builder';

const tabs = [
    { id: 'overview' as TabId, label: 'MISSION BRIEF', icon: Book },
    { id: 'ideas' as TabId, label: 'TACTICAL SCENARIOS', icon: Lightbulb },
    { id: 'architecture' as TabId, label: 'SYSTEM SCHEMATICS', icon: Layers },
    { id: 'contracts' as TabId, label: 'ON-CHAIN KERNEL', icon: Code },
    { id: 'agent' as TabId, label: 'AUTONOMOUS UNITS', icon: Cpu },
    { id: 'builder' as TabId, label: 'STRATEGY ARCHITECT', icon: Workflow },
    { id: 'frontend' as TabId, label: 'COMMAND INTERFACE', icon: Globe },
    { id: 'api' as TabId, label: 'AGENTS API', icon: Terminal },
    { id: 'security' as TabId, label: 'DEFENSE PROTOCOLS', icon: Shield },
];

function DocsContent() {
    const searchParams = useSearchParams();
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
        <main className="min-h-screen bg-black text-white font-sans selection:bg-neon-cyan/30">
            <Navbar />

            <div className="fixed inset-0 z-0">
                <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-neon-purple/20 to-transparent opacity-50" />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-neon-cyan/10 blur-[120px] rounded-full" />
            </div>

            <div className="relative z-10 pt-36">
                <div className="max-w-7xl mx-auto px-6 pb-8 border-b border-white/10">
                    <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Protocol
                    </Link>

                    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-gradient-to-r from-neon-cyan to-neon-purple p-2 rounded-lg">
                                    <Book className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-4xl md:text-5xl font-bold font-mono tracking-tight">DOCUMENTATION</h1>
                                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-mono rounded-full border border-green-500/30">
                                        v0.0.7
                                    </span>
                                </div>
                            </div>
                            <p className="text-xl text-gray-400 max-w-2xl">
                                Field Manual for Autonomous Financial Operations on the Stellar Network.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <a href="https://github.com/Eras256/Stellar-Loop" target="_blank" className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors flex items-center gap-2">
                                <GitBranch className="w-4 h-4" />
                                GitHub
                            </a>
                            <a href="https://suiscan.xyz/testnet/object/0x673686ac6a1a259b1d39553e6cdb2fb2478a13db4bccd83ea6f7c079af89a7fb" target="_blank" className="px-4 py-2 bg-neon-cyan/10 border border-neon-cyan/30 rounded-lg text-sm font-medium text-neon-cyan hover:bg-neon-cyan/20 transition-colors flex items-center gap-2">
                                <ExternalLink className="w-4 h-4" />
                                Stellarscan
                            </a>
                        </div>
                    </div>
                </div>

                <div className="sticky top-16 z-20 bg-black/80 backdrop-blur-xl border-b border-white/10">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="flex overflow-x-auto scrollbar-hide gap-1 py-2">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab.id
                                        ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30'
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

                <div className="max-w-7xl mx-auto px-6 py-12">
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
            </div>
        </main>
    );
}

export default function DocsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-pulse text-neon-cyan font-mono">LOADING FIELD MANUAL...</div>
            </div>
        }>
            <DocsContent />
        </Suspense>
    );
}

function OverviewSection() {
    return (
        <div className="space-y-12">
            {/* Hero Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                    { label: 'Testnet Version', value: 'v0.0.7', color: 'text-neon-cyan' },
                    { label: 'Unit Tests', value: '12/12 ✓', color: 'text-green-400' },
                    { label: 'Neural Plugins', value: '13+ Active', color: 'text-purple-400' },
                    { label: 'Flash Loan Fee', value: '0.3%', color: 'text-amber-400' },
                    { label: 'Assets', value: 'XLM + USDC', color: 'text-blue-400' },
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
                    <Shield className="text-neon-purple" />
                    Executive Summary
                </h2>
                <div className="prose prose-invert max-w-none text-gray-300 space-y-4">
                    <p className="text-lg leading-relaxed">
                        <strong>Nirium</strong> is an institutional-grade DeFi protocol on the Stellar blockchain that integrates
                        <strong className="text-neon-cyan"> atomic leverage execution</strong> with
                        <strong className="text-neon-purple"> autonomous AI agents</strong>.
                    </p>
                    <p>
                        The protocol leverages <strong>Move 2024's linear type system</strong> (Hot Potato Pattern) to guarantee
                        flash loan repayment at the compiler level, while <strong>ElizaOS</strong> powers intelligent off-chain
                        agents that analyze market conditions and orchestrate transactions via Programmable Transaction Blocks (PTB).
                    </p>
                </div>
            </section>

            {/* Progressive Automation */}
            <section>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <Cpu className="text-neon-cyan" />
                    Progressive Automation
                </h2>
                <p className="text-gray-400 mb-6">
                    Nirium solves the biggest AI-Crypto dilemma: <strong className="text-white">Security vs. Autonomy</strong>
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-black/40 p-6 rounded-xl border border-neon-purple/30 hover:border-neon-purple/50 transition-colors">
                        <h3 className="text-xl font-bold text-neon-purple mb-4 flex items-center gap-2">
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
                    <div className="bg-black/40 p-6 rounded-xl border border-neon-cyan/30 hover:border-neon-cyan/50 transition-colors">
                        <h3 className="text-xl font-bold text-neon-cyan mb-4 flex items-center gap-2">
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
                        { icon: BookOpen, title: 'Operations Manual', desc: 'Step-by-step guide for protocol operators', color: 'text-neon-cyan' },
                        { icon: Layers, title: 'Strategy Marketplace', desc: '16+ pre-built strategies. XLM & USDC asset selector on each card.', color: 'text-blue-400' },
                        { icon: TrendingUp, title: 'Dashboard Command Center', desc: 'Real-time metrics, Active Fleet, execution logs', color: 'text-green-400' },
                        { icon: Lock, title: 'Multi-Asset Vaults', desc: 'Deploy XLM or USDC vaults — per-strategy asset selection', color: 'text-amber-400' },
                        { icon: HardDrive, title: 'Walrus & Supabase', desc: 'Hybrid decentralized storage for forensic logs', color: 'text-pink-400' },
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
                                <td className="py-3 px-4 font-mono text-neon-cyan">5X6TDFkYvjvCb2LS...</td>
                                <td className="py-3 px-4">0.1 XLM</td>
                                <td className="py-3 px-4 text-gray-400">0.0003 XLM</td>
                                <td className="py-3 px-4"><span className="text-green-400">✓ Success</span></td>
                                <td className="py-3 px-4">
                                    <a href="https://suiscan.xyz/testnet/tx/5X6TDFkYvjvCb2LSE37DC7qNFs7UDgNy9izTs7amNanG" target="_blank" className="text-neon-cyan hover:underline flex items-center gap-1">
                                        View <ExternalLink className="w-3 h-3" />
                                    </a>
                                </td>
                            </tr>
                            <tr className="border-b border-white/5">
                                <td className="py-3 px-4 font-mono text-neon-cyan">ExYe8kirfrUVkehc...</td>
                                <td className="py-3 px-4">0.05 XLM</td>
                                <td className="py-3 px-4 text-gray-400">0.0001 XLM</td>
                                <td className="py-3 px-4"><span className="text-green-400">✓ Success</span></td>
                                <td className="py-3 px-4">
                                    <a href="https://suiscan.xyz/testnet/tx/ExYe8kirfrUVkehcz63NvDzSzZPz2gAoLoVyCpUcVESP" target="_blank" className="text-neon-cyan hover:underline flex items-center gap-1">
                                        View <ExternalLink className="w-3 h-3" />
                                    </a>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className="mt-4 text-sm text-gray-400">
                    <strong>Agent Wallet:</strong> <code className="text-neon-cyan">0x673686ac6a1a259b1d39553e6cdb2fb2478a13db4bccd83ea6f7c079af89a7fb</code>
                </div>
            </section>
        </div>
    );
}

function ArchitectureSection() {
    return (
        <div className="space-y-12">
            {/* System Diagram */}
            <section>
                <h2 className="text-2xl font-bold mb-6">System Architecture</h2>
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
│                        @mysten/dapp-kit                                 │
│       (Wallet Connection, Auto-Reconnect, Transaction Signing)          │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │
          ┌─────────────────────┼──────────────────────────┐
          ▼                     ▼                          ▼
┌──────────────────┐  ┌──────────────────┐  ┌─────────────────────────┐
│    SUPABASE      │  │   LOCALSTORAGE   │  │     XLM TESTNET         │
│  (Persistence)   │  │    (Cache)       │  │  (Blockchain)           │
│  - strategies    │  │  - drafts        │  │  - atomic_engine        │
│  - profiles      │  │  - fleet         │  │  - MockPool<XLM,XLM>    │
│  - agent_logs    │  │                  │  │  - Vault<XLM|USDC>      │
└──────────────────┘  └──────────────────┘  └─────────────────────────┘
         │
         ▼
┌──────────────────┐
│  WALRUS NETWORK  │
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
                            color: 'border-neon-cyan',
                            items: ['Navi Protocol (Flash Loans & Lending)', 'DeepBook V3 (CLOB Execution)', 'Enforces Hot Potato safety guarantees']
                        },
                        {
                            title: 'Off-Chain (Agent Runtime)',
                            icon: Cpu,
                            color: 'border-neon-purple',
                            items: ['Runs ElizaOS logic with @naviprotocol/lending', 'Constructs optimistic PTBs', 'Analyzes market opportunities']
                        },
                        {
                            title: 'Persistence Layer',
                            icon: Layers,
                            color: 'border-amber-500',
                            items: ['Supabase for cloud strategy & log storage', 'LocalStorage for client-side cache', 'Walrus Decentralized Blob Storage for immutable audit logs', 'Hybrid sync with deduplication across all layers']
                        },
                        {
                            title: 'User Interface (Web)',
                            icon: Globe,
                            color: 'border-green-500',
                            items: ['Visual strategy builder', 'Transaction signing via dApp Kit', 'Auto-connect wallet persistence']
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
                                <div className="w-3 h-3 rounded-full bg-neon-cyan mx-auto mb-3" />
                                <h3 className="font-bold text-white mb-1">{item.title}</h3>
                                <p className="text-xs text-gray-400">{item.desc}</p>
                            </div>
                            {i < 4 && (
                                <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-gradient-to-r from-neon-cyan/50 to-transparent" />
                            )}
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}

function ContractsSection() {
    return (
        <div className="space-y-12">
            {/* Deployed Contracts */}
            <section>
                <h2 className="text-2xl font-bold mb-6">Deployed Contracts (Testnet v0.0.7)</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 text-gray-400 text-sm">
                                <th className="py-3 px-4">Component</th>
                                <th className="py-3 px-4">Address</th>
                                <th className="py-3 px-4">Description</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm font-mono">
                            <tr className="border-b border-white/5 hover:bg-white/5">
                                <td className="py-4 px-4 text-white font-bold">Package</td>
                                <td className="py-4 px-4 text-neon-cyan break-all">
                                    <a href="https://suiscan.xyz/testnet/object/0x673686ac6a1a259b1d39553e6cdb2fb2478a13db4bccd83ea6f7c079af89a7fb" target="_blank" className="hover:underline">
                                        0x673686ac6a1a259b1d39553e6cdb2fb2478a13db4bccd83ea6f7c079af89a7fb
                                    </a>
                                </td>
                                <td className="py-4 px-4 text-gray-400">Immutable Move Logic (Hot Potato)</td>
                            </tr>
                            <tr className="border-b border-white/5 hover:bg-white/5">
                                <td className="py-4 px-4 text-white font-bold">MockPool</td>
                                <td className="py-4 px-4 text-amber-500 break-all">
                                    <a href="https://suiscan.xyz/testnet/object/0xb10cc9e5da0af57c94651bb5396cf76c62c2cef0fec05b5bfe7f07b7ecfa6165" target="_blank" className="hover:underline">
                                        0xb10cc9e5da0af57c94651bb5396cf76c62c2cef0fec05b5bfe7f07b7ecfa6165
                                    </a>
                                </td>
                                <td className="py-4 px-4 text-gray-400">Shared Liquidity Object (XLM/XLM)</td>
                            </tr>
                            <tr className="border-b border-white/5 hover:bg-white/5">
                                <td className="py-4 px-4 text-white font-bold">UpgradeCap</td>
                                <td className="py-4 px-4 text-gray-500 break-all">0xd1656b27c68378a5b7de29e20eadbf870ab31f12539a818fb3fb3e0b24a41f39</td>
                                <td className="py-4 px-4 text-gray-400">Admin Upgrade Capability</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Core Structs */}
            <section>
                <h2 className="text-2xl font-bold mb-6">Core Move Structs</h2>
                <div className="space-y-6">
                    <div className="bg-[#0A0A0A] border border-white/10 rounded-xl overflow-hidden">
                        <div className="px-4 py-2 bg-white/5 border-b border-white/10 flex items-center gap-2">
                            <FileCode className="w-4 h-4 text-neon-cyan" />
                            <span className="text-sm font-mono text-gray-400">LoopReceipt (Hot Potato)</span>
                        </div>
                        <pre className="p-4 text-sm font-mono text-gray-300 overflow-x-auto">
                            {`/// The "Hot Potato" - NO 'drop' ability!
/// Move GUARANTEES this must be consumed by repay_flash_loan()
public struct LoopReceipt {
    pool_id: address,
    borrowed_amount: u64,
    min_repay_amount: u64,
    borrower: address
}`}
                        </pre>
                    </div>

                    <div className="bg-[#0A0A0A] border border-white/10 rounded-xl overflow-hidden">
                        <div className="px-4 py-2 bg-white/5 border-b border-white/10 flex items-center gap-2">
                            <FileCode className="w-4 h-4 text-amber-500" />
                            <span className="text-sm font-mono text-gray-400">MockPool</span>
                        </div>
                        <pre className="p-4 text-sm font-mono text-gray-300 overflow-x-auto">
                            {`/// Generic liquidity pool with 0.3% flash loan fee
public struct MockPool<phantom Base, phantom Quote> has key, store {
    id: UID,
    base_balance: Balance<Base>,
    quote_balance: Balance<Quote>,
    flash_loan_fee_bps: u64 // 30 = 0.3%
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
                                { fn: 'create_pool', sig: 'entry fun create_pool<B,Q>(ctx)', desc: 'Creates and shares a new MockPool' },
                                { fn: 'add_liquidity', sig: 'entry fun add_liquidity<B,Q>(pool, coin, ctx)', desc: 'Adds liquidity to pool' },
                                { fn: 'borrow_flash_loan', sig: 'fun borrow_flash_loan<B,Q>(pool, amount, ctx): (Coin<B>, LoopReceipt)', desc: 'Returns loan + Hot Potato' },
                                { fn: 'repay_flash_loan', sig: 'fun repay_flash_loan<B,Q>(pool, payment, receipt, ctx)', desc: 'Destroys receipt, verifies payment' },
                                { fn: 'execute_loop', sig: 'entry fun execute_loop<B,Q>(pool, user_funds, borrow_amt, min_profit, ctx)', desc: 'Full atomic cycle' },
                            ].map((item) => (
                                <tr key={item.fn} className="border-b border-white/5 hover:bg-white/5">
                                    <td className="py-3 px-4 text-neon-cyan">{item.fn}</td>
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
                    Test Results
                </h2>
                <div className="font-mono text-sm space-y-1">
                    {[
                        'test_add_liquidity',
                        'test_create_pool',
                        'test_flash_loan_cycle',
                        'test_flash_loan_insufficient_profit',
                        'test_flash_loan_no_liquidity',
                    ].map((test) => (
                        <div key={test} className="flex items-center gap-2">
                            <span className="text-green-400">[PASS]</span>
                            <span className="text-gray-400">nirium::atomic_tests::{test}</span>
                        </div>
                    ))}
                    <div className="mt-4 pt-4 border-t border-white/10 text-green-400">
                        Test result: OK. Total tests: 12; passed: 12; failed: 0
                    </div>
                </div>
            </section>
        </div>
    );
}

function AgentSection() {
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
                            <li>• Bech32 private key support</li>
                            <li>• PTB construction & execution</li>
                        </ul>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <h3 className="font-bold text-white mb-4">Status</h3>
                        <div className="flex items-center gap-2 text-green-400">
                            <CheckCircle className="w-5 h-5" />
                            <span className="font-bold">REAL SIGNING - Verified On-Chain</span>
                        </div>
                        <p className="text-sm text-gray-400 mt-2">
                            Agent Wallet: <code className="text-neon-cyan">0x673686ac6a...f7c079</code>
                        </p>
                    </div>
                </div>
            </section>

            {/* File Structure */}
            <section>
                <h2 className="text-2xl font-bold mb-6">File Structure</h2>
                <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-4 font-mono text-sm">
                    <pre className="text-gray-400">
                        {`packages/agent/src/
├── actions/
│   ├── executeAtomicLeverage.ts    # Flash loan PTB builder (XLM + USDC)
│   ├── executeMainnetStrategy.ts   # Per-vault strategy executor
│   └── executeBuilderStrategy.ts   # Custom kernel executor (Builder)
├── services/
│   ├── loopHub.ts                  # Central agent orchestration
│   ├── skillManager.ts             # Dynamic capability loader
│   ├── subscriptionService.ts      # Walrus audit log uploader
│   ├── llmService.ts               # Titan Champion brain integration
│   ├── browserService.ts           # Web scraping & deep research
│   ├── twitterService.ts           # Social sentiment analysis
│   └── knowledgeService.ts         # Market context engine
├── providers/
│   └── suiProvider.ts              # Blockchain interface
├── server.ts                       # Express REST API + Webhooks
└── run.ts                          # Autonomous loop runner`}
                    </pre>
                </div>
            </section>

            {/* Action Flow */}
            <section>
                <h2 className="text-2xl font-bold mb-6">EXECUTE_ATOMIC_LEVERAGE Action</h2>
                <div className="space-y-4">
                    {[
                        { step: 1, title: 'Parse Intent', desc: 'Extract amount from user message' },
                        { step: 2, title: 'Load Keypair', desc: 'Load Ed25519 keypair from environment' },
                        { step: 3, title: 'Build PTB', desc: 'Construct Programmable Transaction Block' },
                        { step: 4, title: 'Sign & Execute', desc: 'Sign transaction and submit to Stellar' },
                        { step: 5, title: 'Return Result', desc: 'Return digest and Stellarscan link' },
                    ].map((item) => (
                        <div key={item.step} className="flex items-start gap-4 bg-white/5 rounded-lg p-4">
                            <div className="w-8 h-8 rounded-full bg-neon-cyan/20 text-neon-cyan flex items-center justify-center font-bold shrink-0">
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
🚀 XLMLOOP AGENT v0.0.7
🤖 Agent Wallet: 0x673686ac6a1a...
🔍 Scanning pools for liquidity...
🧱 Constructing Atomic Loop Transaction...
📝 Signing transaction...
✅ Transaction Successful: 5X6TDFkYvjvCb2LS...
🔗 View on Stellarscan: https://suiscan.xyz/testnet/tx/...
⬆  Forensic log uploaded to Walrus (blob: Qm3x...)`}
                </pre>
            </section>
        </div>
    );
}

function BuilderSection() {
    return (
        <div className="space-y-12">
            <section>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <Workflow className="text-neon-purple" />
                    Strategy Architect (Builder)
                </h2>
                <p className="text-gray-400 mb-8 leading-relaxed">
                    The Architect is a visual, node-based programming environment that allows you to construct complex financial logic without writing Move code.
                    It compiles your visual nodes into a <strong className="text-white">Strategy Kernel</strong> that can be deployed atomically against a XLM or USDC vault.
                </p>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors">
                        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                            <Layers className="w-5 h-5 text-neon-cyan" />
                            6 Node Categories
                        </h3>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li>• <strong className="text-neon-cyan">Atomic Engine</strong>: FLASH_LOAN, EXECUTE_LOOP, CREATE_AGENT_CAP, REPAY_LOAN</li>
                            <li>• <strong>Signal Inputs</strong>: Price thresholds, CRON ticks, Mempool scans, Whale alerts</li>
                            <li>• <strong>AI Intelligence</strong>: Eliza sentiment, Kelly Criterion, Market Regime</li>
                            <li>• <strong>Trading & Swaps</strong>: Cetus CLMM, Turbos, DeepBook limit orders</li>
                            <li>• <strong>Security & Vault</strong>: Vault deposit/withdraw, Enclave Guard, Walrus Blackbox</li>
                            <li>• <strong>Social Messaging</strong>: Twitter relay, Discord alarm, Telegram push</li>
                        </ul>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors">
                        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                            <Zap className="w-5 h-5 text-amber-500" />
                            Atomic Compilation
                        </h3>
                        <p className="text-sm text-gray-400 mb-3">
                            When you click <strong className="text-white">"Compile Kernel"</strong>, your logic is validated and bundled into a single Programmable Transaction Block (PTB).
                            Either all actions succeed, or the entire transaction fails — protecting your capital with Move&apos;s Hot Potato pattern.
                        </p>
                        <ul className="space-y-1 text-sm text-gray-400">
                            <li className="flex items-center gap-2"><span className="text-neon-cyan">⬆</span> Kernel schema archived to <strong className="text-white">Walrus</strong> after deploy</li>
                            <li className="flex items-center gap-2"><span className="text-[#4ca2ff]">💾</span> <strong className="text-white">Export Schema</strong> button downloads the flow as JSON</li>
                            <li className="flex items-center gap-2"><span className="text-neon-purple">🪙</span> <strong className="text-white">XLM / USDC</strong> asset selector sets vault type before deploy</li>
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

            <section className="bg-neon-purple/5 border border-neon-purple/20 rounded-2xl p-8">
                <h3 className="text-xl font-bold mb-4">Tactical Advantages</h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                    <div>
                        <div className="text-neon-purple font-bold mb-1">0% Code</div>
                        <p className="text-xs text-gray-500">Pure visual architecture for rapid prototyping.</p>
                    </div>
                    <div>
                        <div className="text-neon-purple font-bold mb-1">100% Move</div>
                        <p className="text-xs text-gray-500">Under the hood, it generates optimized Move PTB vectors.</p>
                    </div>
                    <div>
                        <div className="text-neon-purple font-bold mb-1">Live Simulation</div>
                        <p className="text-xs text-gray-500">Verify logic integrity before mainnet release.</p>
                    </div>
                    <div>
                        <div className="text-neon-purple font-bold mb-1">XLM + USDC</div>
                        <p className="text-xs text-gray-500">Select vault asset before compiling the kernel.</p>
                    </div>
                </div>
            </section>
        </div>
    );
}

function FrontendSection() {
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
                        { label: 'Wallet', value: '@mysten/dapp-kit' },
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
                        { path: '/agents', name: 'Operations Command Center', desc: 'API keys, live Walrus audit feed, dynamic RPC telemetry', lines: 280 },
                        { path: '/plugins', name: 'Neural Extensions', desc: 'Core plugins: Research, Sentiment, Knowledge', lines: 272 },
                        { path: '/analytics', name: 'Analytics', desc: 'Performance charts and metrics', lines: 200 },
                        { path: '/docs', name: 'Documentation', desc: 'Technical documentation (this page)', lines: 1173 },
                    ].map((page) => (
                        <div key={page.path} className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <code className="text-neon-cyan text-sm">{page.path}</code>
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
                            <Settings className="w-5 h-5 text-neon-purple" />
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
    return (
        <div className="space-y-12">
            {/* API Key Generation Tool */}
            <section className="bg-gradient-to-br from-neon-purple/5 to-transparent border border-neon-purple/20 rounded-2xl p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-neon-purple/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 relative z-10">
                    <Key className="text-neon-purple" />
                    Authentication & Keys
                </h2>

                <div className="grid md:grid-cols-2 gap-12 relative z-10">
                    <div className="space-y-6">
                        <p className="text-gray-300 leading-relaxed">
                            To use the autonomous agent API (`http://localhost:3001`), you must authenticate using an
                            <strong> API Key</strong> or a short-lived <strong>JWT Token</strong>.
                        </p>

                        <div className="space-y-4">
                            <h3 className="font-bold text-white">Authentication Methods</h3>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3">
                                    <div className="mt-1 bg-neon-cyan/20 p-1 rounded">
                                        <Code className="w-3 h-3 text-neon-cyan" />
                                    </div>
                                    <div>
                                        <div className="text-white font-medium">x-api-key Header</div>
                                        <div className="text-sm text-gray-500">Best for backend scripts and long-running bots.</div>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="mt-1 bg-neon-purple/20 p-1 rounded">
                                        <Shield className="w-3 h-3 text-neon-purple" />
                                    </div>
                                    <div>
                                        <div className="text-white font-medium">Bearer Token (JWT)</div>
                                        <div className="text-sm text-gray-500">Best for frontend applications (expires in 24h).</div>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-neon-purple to-neon-cyan opacity-20 blur-lg rounded-xl pointer-events-none transition-opacity group-hover:opacity-30" />
                        <Link href="/agents" className="block relative z-20 bg-[#0A0A0A] border border-white/10 rounded-xl p-8 text-center hover:bg-white/5 transition-colors group">
                            <div className="w-16 h-16 bg-neon-purple/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                <Terminal className="w-8 h-8 text-neon-purple" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Launch Agent Console</h3>
                            <p className="text-gray-400 mb-6">Generate keys, manage bots, and view live telemetry in the dedicated command center.</p>
                            <span className="inline-flex items-center gap-2 text-neon-cyan font-bold">
                                Open Console <img src="/icons/arrow-right.svg" className="w-4 h-4 hidden" alt="" /> →
                            </span>
                        </Link>
                    </div>
                </div>
            </section>
            {/* Environment Variables */}
            <section>
                <h2 className="text-2xl font-bold mb-6">Environment Variables</h2>
                <div className="space-y-6">
                    <div className="bg-[#0A0A0A] border border-white/10 rounded-xl overflow-hidden">
                        <div className="px-4 py-2 bg-white/5 border-b border-white/10">
                            <span className="text-sm font-mono text-gray-400">packages/web/.env.local</span>
                        </div>
                        <pre className="p-4 text-sm font-mono text-gray-300">
                            {`NEXT_PUBLIC_PACKAGE_ID=0x673686ac6a1a259b1d39553e6cdb2fb2478a13db4bccd83ea6f7c079af89a7fb
NEXT_PUBLIC_POOL_ID=0xb10cc9e5da0af57c94651bb5396cf76c62c2cef0fec05b5bfe7f07b7ecfa6165
NEXT_PUBLIC_XLM_NETWORK=testnet
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key`}
                        </pre>
                    </div>

                    <div className="bg-[#0A0A0A] border border-white/10 rounded-xl overflow-hidden">
                        <div className="px-4 py-2 bg-white/5 border-b border-white/10">
                            <span className="text-sm font-mono text-gray-400">packages/agent/.env</span>
                        </div>
                        <pre className="p-4 text-sm font-mono text-gray-300">
                            {`XLM_PRIVATE_KEY=suiprivkey1...
XLM_PACKAGE_ID=0x673686ac6...
XLM_POOL_ID=0xb10cc9e5d...
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_role_key`}
                        </pre>
                    </div>
                </div>
            </section>

            {/* CLI Commands */}
            <section>
                <h2 className="text-2xl font-bold mb-6">CLI Commands</h2>
                <div className="bg-[#0A0A0A] border border-white/10 rounded-xl overflow-hidden">
                    <pre className="p-4 text-sm font-mono text-gray-300">
                        {`# Install dependencies
pnpm install

# Run development server
pnpm dev

# Run tests
pnpm test

# Run agent
pnpm --filter @nirium/agent dev "Loop 0.1 XLM"

# Build for production
pnpm build`}
                    </pre>
                </div>
            </section>

            {/* Contract Interaction */}
            <section>
                <h2 className="text-2xl font-bold mb-6">Contract Interaction (CLI)</h2>
                <p className="text-sm text-gray-500 mb-4">
                    ⚠️ The deployed testnet <code className="text-amber-400">POOL_ID</code> (<code className="text-amber-400">0xb10cc9e5...</code>) is typed as <code className="text-white">MockPool&lt;XLM, XLM&gt;</code>.
                    Use <code className="text-[#4ca2ff]">0x2::sui::XLM</code> type-args for the testnet pool. Deploy a new pool for USDC.
                </p>
                <div className="space-y-4">
                    <div className="bg-[#0A0A0A] border border-white/10 rounded-xl overflow-hidden">
                        <div className="px-4 py-2 bg-white/5 border-b border-white/10 flex items-center justify-between">
                            <span className="text-sm font-mono text-gray-400">Add Liquidity (XLM Pool — Testnet)</span>
                            <span className="text-xs text-[#4ca2ff] font-mono">XLM</span>
                        </div>
                        <pre className="p-4 text-xs font-mono text-gray-300 overflow-x-auto">
                            {`sui client call \\
  --package 0x673686ac6a1a259b1d39553e6cdb2fb2478a13db4bccd83ea6f7c079af89a7fb \\
  --module atomic_engine \\
  --function add_liquidity \\
  --type-args 0x2::sui::XLM 0x2::sui::XLM \\
  --args 0xb10cc9e5da0af57c94651bb5396cf76c62c2cef0fec05b5bfe7f07b7ecfa6165 <XLM_COIN_ID> \\
  --gas-budget 50000000`}
                        </pre>
                    </div>

                    <div className="bg-[#0A0A0A] border border-white/10 rounded-xl overflow-hidden">
                        <div className="px-4 py-2 bg-white/5 border-b border-white/10 flex items-center justify-between">
                            <span className="text-sm font-mono text-gray-400">Add Liquidity (USDC Pool — Custom Deployment)</span>
                            <span className="text-xs text-neon-purple font-mono">USDC</span>
                        </div>
                        <pre className="p-4 text-xs font-mono text-gray-300 overflow-x-auto">
                            {`sui client call \\
  --package 0x673686ac6a1a259b1d39553e6cdb2fb2478a13db4bccd83ea6f7c079af89a7fb \\
  --module atomic_engine \\
  --function add_liquidity \\
  --type-args 0xa1ec7fc00a6f40db9693ad1415d0c193ad3906494428cf252621037bd7117e29::usdc::USDC \\
              0xa1ec7fc00a6f40db9693ad1415d0c193ad3906494428cf252621037bd7117e29::usdc::USDC \\
  --args <USDC_POOL_ID> <USDC_COIN_ID> \\
  --gas-budget 50000000`}
                        </pre>
                    </div>

                    <div className="bg-[#0A0A0A] border border-white/10 rounded-xl overflow-hidden">
                        <div className="px-4 py-2 bg-white/5 border-b border-white/10 flex items-center justify-between">
                            <span className="text-sm font-mono text-gray-400">Execute Flash Loan Loop (XLM Testnet Pool)</span>
                            <span className="text-xs text-[#4ca2ff] font-mono">XLM</span>
                        </div>
                        <pre className="p-4 text-xs font-mono text-gray-300 overflow-x-auto">
                            {`sui client ptb --gas-budget 50000000 \\
  --split-coins gas "[10000000]" \\
  --assign user_funds \\
  --move-call 0x673686ac6a1a259b1d39553e6cdb2fb2478a13db4bccd83ea6f7c079af89a7fb::atomic_engine::execute_loop \\
    "<0x2::sui::XLM, 0x2::sui::XLM>" \\
    @0xb10cc9e5da0af57c94651bb5396cf76c62c2cef0fec05b5bfe7f07b7ecfa6165 \\
    user_funds \\
    100000000 \\
    0`}
                        </pre>
                    </div>
                </div>
            </section>
        </div>
    );
}

function SecuritySection() {
    return (
        <div className="space-y-12">
            {/* Hot Potato */}
            <section>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <Lock className="text-neon-cyan" />
                    Hot Potato Pattern Enforcement
                </h2>
                <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6">
                    <p className="text-gray-300 mb-4">
                        The <code className="text-neon-cyan">LoopReceipt</code> struct provides <strong>compiler-level security</strong>:
                    </p>
                    <ul className="space-y-3">
                        {[
                            { icon: '🚫', text: 'NO drop ability - cannot be discarded' },
                            { icon: '✅', text: 'Must be consumed by repay_flash_loan()' },
                            { icon: '🔒', text: 'Verified against correct pool' },
                            { icon: '⚡', text: 'All in single atomic transaction' },
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
                <h2 className="text-2xl font-bold mb-6">Attack Prevention Matrix</h2>
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
                                { attack: 'Flash Loan Default', protection: 'Hot Potato = must repay', status: '✓' },
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
                    <Users className="text-neon-purple" />
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
                                <td className="py-2 px-3 text-neon-cyan">profiles</td>
                                <td className="py-2 px-3 text-gray-400">Users can only update their own profile</td>
                            </tr>
                            <tr className="border-b border-white/5">
                                <td className="py-2 px-3 text-neon-cyan">strategies</td>
                                <td className="py-2 px-3 text-gray-400">Private - creator only</td>
                            </tr>
                            <tr className="border-b border-white/5">
                                <td className="py-2 px-3 text-neon-cyan">agent_logs</td>
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
                        Formal Verification
                    </h2>
                    <div className="space-y-4 text-sm text-gray-300">
                        <p>
                            The <code className="text-white">atomic_engine</code> module is mathematically proven using the <strong>Move Prover</strong>.
                        </p>
                        <div className="bg-black/40 p-3 rounded font-mono text-xs text-green-300 border border-green-500/10">
                            spec borrow_flash_loan {'{'}<br />
                            &nbsp;&nbsp;ensures balance::value(pool) == old(balance) - amount;<br />
                            {'}'}
                        </div>
                        <div className="flex items-center gap-2 text-green-400 font-bold">
                            <CheckCircle size={16} /> Solvency Proven
                        </div>
                    </div>
                </div>

                <div className="bg-pink-500/5 border border-pink-500/20 rounded-xl p-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <HardDrive className="text-pink-400" />
                        Walrus Decentralized Log
                    </h2>
                    <div className="space-y-4 text-sm text-gray-300">
                        <p>
                            Agent decisions are not black boxes. Every "thought" and action is serialized and stored on <strong>Stellar Walrus</strong>.
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
    return (
        <div className="space-y-12">
            <section className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-4xl font-black mb-6">What to Build? 🏗️</h2>
                <p className="text-xl text-gray-400">
                    Nirium provides the financial rails. You build the vehicles. <br />
                    Here are some "Request for Startups" using our SDK.
                </p>
            </section>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Idea 1 */}
                <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-8 hover:border-yellow-500/50 transition-colors group">
                    <div className="flex items-start justify-between mb-6">
                        <div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-500">
                            <Shield size={32} />
                        </div>
                        <span className="px-3 py-1 rounded-full bg-white/5 text-xs font-mono text-gray-400">Difficulty: Medium</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">PortfolioGuard Bot</h3>
                    <p className="text-gray-400 mb-6 min-h-[60px]">
                        A Telegram bot that monitors user portfolios 24/7. If collateral health drops below 1.1, it automatically borrows stablecoins via Nirium to repay debt and prevent liquidation.
                    </p>
                    <div className="bg-black/50 rounded-lg p-4 font-mono text-sm text-yellow-500/80">
                        <span className="text-gray-500"># Use Python SDK</span><br />
                        agent.listen(portfolio_health, (health) =&gt; {'{'}<br />
                        &nbsp;&nbsp;if health &lt; 1.1: agent.execute("Repay")<br />
                        {'}'})
                    </div>
                </div>

                {/* Idea 2 */}
                <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-8 hover:border-neon-cyan/50 transition-colors group">
                    <div className="flex items-start justify-between mb-6">
                        <div className="p-3 bg-neon-cyan/10 rounded-xl text-neon-cyan">
                            <Zap size={32} />
                        </div>
                        <span className="px-3 py-1 rounded-full bg-white/5 text-xs font-mono text-gray-400">Difficulty: Hard</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">ArbSwarm DAO</h3>
                    <p className="text-gray-400 mb-6 min-h-[60px]">
                        A DAO where users pool XLM. Thousands of micro-agents scan DEXs for 0.5% discrepancies and execute atomic flash loans. Profits are split 80/20 between Agent and DAO.
                    </p>
                    <div className="bg-black/50 rounded-lg p-4 font-mono text-sm text-neon-cyan/80">
                        <span className="text-gray-500"># Use TypeScript SDK</span><br />
                        const profit = await calculateArb(poolA, poolB);<br />
                        if (profit &gt; gas) await loop.execute(flashLoan);
                    </div>
                </div>

                {/* Idea 3 */}
                <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-8 hover:border-purple-500/50 transition-colors group">
                    <div className="flex items-start justify-between mb-6">
                        <div className="p-3 bg-purple-500/10 rounded-xl text-purple-500">
                            <Globe size={32} />
                        </div>
                        <span className="px-3 py-1 rounded-full bg-white/5 text-xs font-mono text-gray-400">Difficulty: Easy</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">NewsTrader Oracle</h3>
                    <p className="text-gray-400 mb-6 min-h-[60px]">
                        Connect standard Web2 news APIs (Bloomberg, Twitter) to Stellar. When "Regulatory Approval" is detected, buy the related token via Nirium Swaps instantly.
                    </p>
                    <div className="bg-black/50 rounded-lg p-4 font-mono text-sm text-purple-500/80">
                        <span className="text-gray-500"># Use JS SDK + Vercel</span><br />
                        onNewsReceived(async (headline) =&gt; {'{'}<br />
                        &nbsp;&nbsp;if (isBullish(headline)) loop.buy("XLM")<br />
                        {'}'})
                    </div>
                </div>

                {/* Idea 4 */}
                <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-8 hover:border-green-500/50 transition-colors group">
                    <div className="flex items-start justify-between mb-6">
                        <div className="p-3 bg-green-500/10 rounded-xl text-green-500">
                            <Users size={32} />
                        </div>
                        <span className="px-3 py-1 rounded-full bg-white/5 text-xs font-mono text-gray-400">Difficulty: Hard</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">GameFi NPC Economy</h3>
                    <p className="text-gray-400 mb-6 min-h-[60px]">
                        Fully autonomous NPCs in a Stellar game that manage their own inventory shops. They buy items low from players and sell high, managing their own capital via Nirium.
                    </p>
                    <div className="bg-black/50 rounded-lg p-4 font-mono text-sm text-green-500/80">
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
                    Deploy USDC into a Nirium vault, then use the agent to auto-rotate capital between Scallop, Navi, and Cetus — always chasing the highest lending rate. Earn delta-neutral stablecoin yield automatically.
                </p>
                <div className="bg-black/50 rounded-lg p-4 font-mono text-sm text-blue-400/80">
                    <span className="text-gray-500"># Use TypeScript SDK — USDC vault</span><br />
                    const best = await findBestRate(['scallop', 'navi', 'cetus']);<br />
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
                    Monitor every undercollateralized position on Navi and Scallop. The moment health factor drops below 1.0, flash-loan the repayment from Nirium and claim the liquidation bonus — all in a single atomic PTB.
                </p>
                <div className="bg-black/50 rounded-lg p-4 font-mono text-sm text-rose-400/80">
                    <span className="text-gray-500">// Monitor + strike in one block</span><br />
                    onHealthAlert(async (pos) =&gt; {'{'}<br />
                    &nbsp;&nbsp;const loan = await loop.flashLoan(pos.debt);<br />
                    &nbsp;&nbsp;await navi.liquidate(pos.id, loan);<br />
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
                    An ElizaOS agent scans X/Twitter, Telegram, and Discord 24/7 for Stellar ecosystem project mentions. When a verified influencer posts bullish content, the agent opens a position via Nirium flash loan within the same block.
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
                    <div className="p-3 bg-cyan-500/10 rounded-xl text-neon-cyan">
                        <Database size={32} />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-white/5 text-xs font-mono text-gray-400">Difficulty: Easy</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Proof-of-Transparency Hedge Fund</h3>
                <p className="text-gray-400 mb-6 min-h-[60px]">
                    A fund where every trade decision is signed by the agent and uploaded immutably to Walrus. Investors can verify the entire decision history on-chain at any time. Zero black boxes — full cryptographic accountability.
                </p>
                <div className="bg-black/50 rounded-lg p-4 font-mono text-sm text-neon-cyan/80">
                    <span className="text-gray-500">// Every decision = Walrus blob</span><br />
                    const blobId = await walrus.upload(tradeDecision);<br />
                    await sui.tx.emitEvent({'{'} blobId, digest {'}'});<br />
                    <span className="text-gray-500">// Investors verify anytime</span>
                </div>

            </div>
        </div>
    );
}
