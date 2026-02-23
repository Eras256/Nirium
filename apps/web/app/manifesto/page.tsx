"use client";

import Navbar from "@/components/layout/Navbar";
import Link from "next/link";
import { ArrowRight, Zap, Layers, Cpu, Database, Network } from "lucide-react";
import { motion } from "framer-motion";

export default function ManifestoPage() {
    return (
        <main className="min-h-screen bg-black text-white selection:bg-neon-cyan/30">
            <Navbar />

            <div className="max-w-4xl mx-auto px-6 pt-40 pb-24 relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-neon-purple/5 rounded-full blur-[100px] pointer-events-none -z-10" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-neon-cyan/5 rounded-full blur-[100px] pointer-events-none -z-10" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="inline-block px-3 py-1 mb-6 border border-white/20 rounded-full text-xs font-mono text-gray-400 uppercase tracking-widest">
                        THE INTELLIGENCE SUPREMACY THESIS
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight mb-8">
                        THE <span className="text-neon-cyan">SWARM</span> IS COMING. <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-500 to-white">ADAPT OR LIQUIDATE.</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-400 font-light leading-relaxed mb-16 max-w-2xl">
                        Why the Autonomous Economy requires a fundamental shift in blockchain architecture, and why Stellar is the only viable substrate for High-Frequency Agentic Finance.
                    </p>
                </motion.div>

                <div className="space-y-24">
                    {/* SECTION 1: The Base vs Stellar Dichotomy */}
                    <section className="prose prose-invert prose-lg max-w-none">
                        <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                            <span className="text-neon-purple">01.</span> THE SEQUENTIAL BOTTLENECK
                        </h2>
                        <p className="text-gray-300">
                            We are witnessing the cambrian explosion of AI Agents on-chain. Currently, most of this activity is happening on EVM L2s like Base.
                            These agents are primarily <strong className="text-white">Social Agents</strong> (chatbots, artists, influencers).
                        </p>
                        <p className="text-gray-300">
                            However, as agents evolve from "talking" to "doing business", they face the <strong className="text-white">EVM Latency Wall</strong>.
                            The Sequential Execution model of Ethereum is a single-lane highway. When 100,000 agents try to arbitrate a price discrepancy simultaneously, the network stalls, gas spikes, and execution fails.
                        </p>

                        <div className="my-12 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                                <div className="text-lg font-bold text-red-400 mb-2">EVM (Legacy)</div>
                                <div className="text-sm text-gray-400 mb-4">Sequential Execution</div>
                                <div className="space-y-2 font-mono text-xs">
                                    <div className="p-2 bg-red-500/10 rounded border border-red-500/20 text-red-300">Tx 1: Agent A (Pending...)</div>
                                    <div className="p-2 bg-red-500/10 rounded border border-red-500/20 text-red-300 opacity-75">Tx 2: Agent B (Queue)</div>
                                    <div className="p-2 bg-red-500/10 rounded border border-red-500/20 text-red-300 opacity-50">Tx 3: Agent C (Queue)</div>
                                </div>
                            </div>
                            <div className="bg-white/5 p-6 rounded-xl border border-green-500/20">
                                <div className="text-lg font-bold text-green-400 mb-2">Stellar (Move)</div>
                                <div className="text-sm text-gray-400 mb-4">Parallel Execution</div>
                                <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                                    <div className="p-2 bg-green-500/10 rounded border border-green-500/20 text-green-300 text-center">Unit A<br />✅</div>
                                    <div className="p-2 bg-green-500/10 rounded border border-green-500/20 text-green-300 text-center">Unit B<br />✅</div>
                                    <div className="p-2 bg-green-500/10 rounded border border-green-500/20 text-green-300 text-center">Unit C<br />✅</div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 2: Objects as Agents */}
                    <section className="prose prose-invert prose-lg max-w-none">
                        <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                            <span className="text-neon-purple">02.</span> OBJECT-BASED SOVEREIGNTY
                        </h2>
                        <p className="text-gray-300">
                            In EVM, an agent is just a private key (EOA) or a clumsy smart contract. It has no native concept of "ownership" beyond a ledger balance.
                        </p>
                        <p className="text-gray-300">
                            In <strong className="text-white">Stellar Move</strong>, everything is an Object. An Agent is an Object. It can own other Objects (NFTs, Coins, Access Passes).
                            This Object-Oriented nature maps 1:1 with how AI models perceive the world.
                        </p>
                        <p className="text-gray-300">
                            Nirium takes this further with the <strong className="text-neon-cyan">Secure Enclave Pattern</strong>: Your capital lives in a non-custodial Vault.
                            The user holds the <strong className="text-white">OwnerCap</strong> (Full Withdrawal Rights), while the Agent only receives an <strong className="text-white">AgentCap</strong> (Execution Actions Only).
                            This is the first time in history that an AI can trade with institutional capital without the risk of the model going rogue and stealing the funds.
                        </p>
                    </section>

                    {/* SECTION 3: The Nirium Solution */}
                    <section>
                        <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                            <span className="text-neon-purple">03.</span> XLMLOOP: THE AUTONOMOUS OS
                        </h2>
                        <div className="bg-gradient-to-r from-[#0f0f13] to-[#0A0A0A] border border-white/10 rounded-2xl p-8 md:p-12 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-neon-cyan/10 rounded-full blur-[80px] group-hover:bg-neon-cyan/20 transition-colors" />

                            <h3 className="text-2xl font-bold text-white mb-4">The Execution Layer</h3>
                            <p className="text-gray-400 mb-8 leading-relaxed">
                                If Base is the "Social Network" for Agents, Nirium is the <strong className="text-white">High-Frequency Trading Desk</strong>. <br />
                                We provide the critical infrastructure that allows an AI
                                to safely, atomically, and profitably interact with DeFi protocols.
                            </p>

                            <ul className="space-y-4 mb-8">
                                <li className="flex items-start gap-3">
                                    <Zap className="text-yellow-400 mt-1" />
                                    <div>
                                        <strong className="text-white block">Atomic Flash Vectors</strong>
                                        <span className="text-gray-500 text-sm">Agents can borrow millions without collateral, executing trades in a single PTB.</span>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Layers className="text-blue-400 mt-1" />
                                    <div>
                                        <strong className="text-white block">Programmable Transaction Blocks (PTBs)</strong>
                                        <span className="text-gray-500 text-sm">Chain 100+ actions (Swap → Lend → Borrow → Stake) in one discrete unit of logic.</span>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Cpu className="text-neon-cyan mt-1" />
                                    <div>
                                        <strong className="text-white block">Visual Strategy Builder</strong>
                                        <span className="text-gray-500 text-sm">6 node categories (Atomic Engine · AI Intelligence · Swaps · Security · Social · Signals). Full XLM &amp; USDC vault targeting with Export Schema.</span>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Network className="text-neon-cyan mt-1" />
                                    <div>
                                        <strong className="text-white block">Nirium SDK</strong>
                                        <span className="text-gray-500 text-sm">Combat-tested safety rails. Pre-built risk guards so your agent operates with institutional certainty.</span>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Database className="text-violet-400 mt-1" />
                                    <div>
                                        <strong className="text-white block">USDC Vault Manager</strong>
                                        <span className="text-gray-500 text-sm">Full lifecycle management for USDC vaults — deposit, yield routing, and auto-rotation across Navi and Scallop USDC lending pools.</span>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Database className="text-pink-500 mt-1" />
                                    <div>
                                        <strong className="text-white block">Walrus Black Box</strong>
                                        <span className="text-gray-500 text-sm">Decentralized forensic auditing. Every agent signature and decision is permanently logged to Walrus for post-mortem analysis.</span>
                                    </div>
                                </li>
                            </ul>

                            <Link href="/agents" className="inline-flex items-center gap-2 bg-white text-black font-bold px-8 py-4 rounded-full hover:bg-neon-cyan transition-colors font-mono uppercase tracking-tight">
                                INITIALIZE VECTOR <ArrowRight size={18} />
                            </Link>
                        </div>
                    </section>
                </div>

                <div className="mt-32 pt-12 border-t border-white/10 text-center">
                    <p className="text-gray-500 text-sm font-mono mb-4">JOIN THE REVOLUTION</p>
                    <h2 className="text-4xl font-black text-white mb-8 tracking-tighter">BUILD THE HIVEMIND.</h2>
                    <div className="flex justify-center gap-4">
                        <Link href="https://github.com/Eras256/Stellar-Loop" className="text-gray-400 hover:text-white transition-colors underline underline-offset-4 decoration-neon-cyan/50">GitHub</Link>
                        <Link href="/docs" className="text-gray-400 hover:text-white transition-colors underline underline-offset-4 decoration-neon-cyan/50">Documentation</Link>
                        <Link href="https://x.com/Vaiosx" className="text-gray-400 hover:text-white transition-colors underline underline-offset-4 decoration-neon-cyan/50">Twitter</Link>
                    </div>
                </div>

            </div>
        </main>
    );
}
