"use client";

import { useState, useEffect } from "react";
import { useFreighter } from "@/hooks/useFreighter";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Search, Download, Shield, Cpu, Zap, ChevronDown } from "lucide-react";

interface Agent {
    id: string;
    name: string;
    type: string;
    status: string;
}

interface InstallSkillModalProps {
    skill: any;
    isOpen: boolean;
    onClose: () => void;
    onInstall: (agentId: string) => void;
    isInstalling?: boolean;
}

// Default Global Agent
const GLOBAL_AGENT: Agent = { id: "global", name: "Neural Matrix (Global)", type: "System Wide", status: "System" };

export default function InstallSkillModal({ skill, isOpen, onClose, onInstall, isInstalling = false }: InstallSkillModalProps) {
    const { address: accountStr, isConnected } = useFreighter();
    const account = isConnected ? { address: accountStr, chains: ['stellar:testnet'] } : null;
    const [activeAgents, setActiveAgents] = useState<Agent[]>([GLOBAL_AGENT]);
    const [selectedAgent, setSelectedAgent] = useState<string>("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Load Real Agents from LocalStorage (synced with Dashboard)
    useEffect(() => {
        if (isOpen && account?.address) {
            try {
                const localKey = `sui-loop-fleet-${account.address}`;
                const raw = localStorage.getItem(localKey);
                if (raw) {
                    const parsed = JSON.parse(raw);
                    // Map local storage format to Agent interface
                    const agents: Agent[] = parsed.map((s: any) => ({
                        id: s.id,
                        name: s.name,
                        type: s.strategy_id || "Custom Strategy", // fallback type
                        status: s.status || "Unknown"
                    }));

                    // Combine Global + Real Agents
                    setActiveAgents([GLOBAL_AGENT, ...agents]);

                    // Default to first real agent if available, otherwise global
                    if (agents.length > 0) {
                        setSelectedAgent(agents[0].id);
                    } else {
                        setSelectedAgent(GLOBAL_AGENT.id);
                    }
                } else {
                    setSelectedAgent(GLOBAL_AGENT.id);
                }
            } catch (e) {
                console.error("Failed to load active agents", e);
                setSelectedAgent(GLOBAL_AGENT.id);
            }
        }
    }, [isOpen, account]);

    if (!isOpen || !skill) return null;

    const currentAgent = activeAgents.find(a => a.id === selectedAgent) || activeAgents[0];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => !isInstalling && onClose()}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-md bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/5 bg-gradient-to-r from-purple-500/10 to-transparent rounded-t-2xl">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                                        <Zap className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">{skill.name}</h3>
                                        <p className="text-xs text-purple-300">v{skill.version}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => !isInstalling && onClose()}
                                    className={`text-gray-500 hover:text-white transition-colors ${isInstalling ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    disabled={isInstalling}
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs text-gray-400 font-mono uppercase tracking-wider">Select Target Unit</label>
                                <div className="relative">
                                    <button
                                        onClick={() => !isInstalling && setIsDropdownOpen(!isDropdownOpen)}
                                        className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center justify-between hover:border-purple-500/50 transition-colors ${isInstalling ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        disabled={isInstalling}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${currentAgent.id === 'global' ? 'bg-neon-cyan/20 text-neon-cyan' : 'bg-purple-500/20 text-purple-400'}`}>
                                                {currentAgent.id === 'global' ? <Cpu size={16} /> : <Shield size={16} />}
                                            </div>
                                            <div className="text-left">
                                                <div className="text-sm font-bold text-white">{currentAgent.name}</div>
                                                <div className="text-[10px] text-gray-500 font-mono">{currentAgent.id}</div>
                                            </div>
                                        </div>
                                        <ChevronDown size={16} className={`text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {/* Dropdown Menu */}
                                    <AnimatePresence>
                                        {isDropdownOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="absolute top-full left-0 right-0 mt-2 bg-[#111] border border-white/10 rounded-xl overflow-hidden z-50 shadow-xl max-h-60 overflow-y-auto custom-scrollbar"
                                            >
                                                {activeAgents.map(agent => (
                                                    <button
                                                        key={agent.id}
                                                        onClick={() => {
                                                            setSelectedAgent(agent.id);
                                                            setIsDropdownOpen(false);
                                                        }}
                                                        className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors group"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${agent.id === 'global' ? 'bg-neon-cyan/10 text-neon-cyan' : 'bg-purple-500/10 text-purple-400'}`}>
                                                                {agent.id === 'global' ? <Cpu size={16} /> : <Shield size={16} />}
                                                            </div>
                                                            <div className="text-left">
                                                                <div className="text-sm text-gray-300 group-hover:text-white">{agent.name}</div>
                                                                <div className="text-[10px] text-gray-600 font-mono">{agent.type}</div>
                                                            </div>
                                                        </div>
                                                        {selectedAgent === agent.id && <Check size={16} className="text-green-400" />}
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4 flex gap-3">
                                <Shield className="w-5 h-5 text-blue-400 shrink-0" />
                                <div className="space-y-1">
                                    <h4 className="text-xs font-bold text-blue-300">Security Check</h4>
                                    <p className="text-[10px] text-blue-200/60 leading-relaxed">
                                        Installing {skill.name} grants this unit capability to execute transactions related to {skill.tags?.[0] || skill.category || 'DeFi'}.
                                        {selectedAgent === 'global' ? ' This will apply to ALL active agents.' : ' This applies only to the selected agent.'}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => onInstall(selectedAgent)}
                                disabled={isInstalling}
                                className={`w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-500/20 active:scale-[0.98] flex items-center justify-center gap-2 ${isInstalling ? 'opacity-70 cursor-wait' : 'hover:from-purple-500 hover:to-blue-500'}`}
                            >
                                {isInstalling ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Installing...</span>
                                    </>
                                ) : (
                                    <>
                                        <Download size={18} />
                                        <span>Install Capability</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
