"use client";

import { useState, useEffect } from "react";
import { useFreighter } from "@/hooks/useFreighter";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Search, Download, Shield, Cpu, Zap, ChevronDown } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

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

export default function InstallSkillModal({ skill, isOpen, onClose, onInstall, isInstalling = false }: InstallSkillModalProps) {
    const { t } = useLanguage();
    const { address: accountStr, isConnected } = useFreighter();
    const account = isConnected ? { address: accountStr, chains: ['stellar:testnet'] } : null;
    
    // Localized Global Agent
    const GLOBAL_AGENT: Agent = { 
        id: "global", 
        name: t.marketplace.modal.global_agent, 
        type: t.marketplace.modal.system_wide, 
        status: t.marketplace.modal.system 
    };

    const [activeAgents, setActiveAgents] = useState<Agent[]>([GLOBAL_AGENT]);
    const [selectedAgent, setSelectedAgent] = useState<string>("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    useEffect(() => {
        if (isOpen && account?.address) {
            try {
                const localKey = `nirium-fleet-${account.address}`;
                const raw = localStorage.getItem(localKey);
                if (raw) {
                    const parsed = JSON.parse(raw);
                    const activeOnly = parsed.filter((s: any) => {
                        const state = (s.status || 'UNKNOWN').toUpperCase();
                        return !['DRAFT', 'STOPPED', 'TERMINATED', 'INACTIVE'].includes(state);
                    });

                    const dedupedMap = new Map();
                    activeOnly.forEach((item: any) => {
                        const name = item.name || item.strategy_id || item.id;
                        if (name && !dedupedMap.has(name)) {
                            dedupedMap.set(name, item);
                        }
                    });

                    const deduped = Array.from(dedupedMap.values());
                    const agents: Agent[] = deduped.map((s: any) => ({
                        id: s.id,
                        name: s.name,
                        type: s.strategy_id || "Custom Strategy",
                        status: s.status || "Unknown"
                    }));

                    setActiveAgents((prev) => {
                        const newAgents = [GLOBAL_AGENT, ...agents];
                        if (JSON.stringify(prev) !== JSON.stringify(newAgents)) {
                            return newAgents;
                        }
                        return prev;
                    });

                    if (agents.length > 0) {
                        setSelectedAgent(agents[0].id);
                    } else {
                        setSelectedAgent(GLOBAL_AGENT.id);
                    }
                } else {
                    setActiveAgents([GLOBAL_AGENT]);
                    setSelectedAgent(GLOBAL_AGENT.id);
                }
            } catch (e) {
                console.error("Failed to load active agents", e);
                setSelectedAgent(GLOBAL_AGENT.id);
            }
        }
    }, [isOpen, account?.address, t.marketplace.modal.global_agent]);

    if (!isOpen || !skill) return null;

    const currentAgent = activeAgents.find(a => a.id === selectedAgent) || activeAgents[0];
    const localizedSkill = t.marketplace.plugins.items[skill.id as keyof typeof t.marketplace.plugins.items] || { name: skill.id };

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
                        className="relative w-full max-w-md bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                    >
                        <div className="p-6 border-b border-white/5 bg-gradient-to-r from-stellar-teal/10 to-transparent">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-stellar-teal to-blue-600 flex items-center justify-center shadow-lg shadow-stellar-teal/20">
                                        <Zap className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-white tracking-tight">{localizedSkill.name}</h3>
                                        <p className="text-[10px] font-mono text-stellar-teal uppercase tracking-widest">v0.5.0</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => !isInstalling && onClose()}
                                    className={`text-gray-500 hover:text-white transition-colors p-1 hover:bg-white/5 rounded-lg ${isInstalling ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    disabled={isInstalling}
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] ml-1">{t.marketplace.modal.select_unit}</label>
                                <div className="relative">
                                    <button
                                        onClick={() => !isInstalling && setIsDropdownOpen(!isDropdownOpen)}
                                        className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 flex items-center justify-between hover:border-stellar-teal/50 transition-all ${isInstalling ? 'opacity-50 cursor-not-allowed' : ''} shadow-inner group`}
                                        disabled={isInstalling}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${currentAgent.id === 'global' ? 'bg-stellar-teal/20 text-stellar-teal' : 'bg-white/10 text-white group-hover:bg-stellar-teal/20 group-hover:text-stellar-teal'}`}>
                                                {currentAgent.id === 'global' ? <Cpu size={20} /> : <Shield size={20} />}
                                            </div>
                                            <div className="text-left">
                                                <div className="text-sm font-bold text-white group-hover:text-stellar-teal transition-colors">{currentAgent.name}</div>
                                                <div className="text-[10px] text-gray-500 font-mono tracking-tighter">{currentAgent.id}</div>
                                            </div>
                                        </div>
                                        <ChevronDown size={18} className={`text-gray-600 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180 text-stellar-teal' : ''}`} />
                                    </button>

                                    <AnimatePresence>
                                        {isDropdownOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="absolute top-full left-0 right-0 mt-3 bg-[#111] border border-white/10 rounded-2xl overflow-hidden z-50 shadow-2xl max-h-60 overflow-y-auto custom-scrollbar"
                                            >
                                                {activeAgents.map(agent => (
                                                    <button
                                                        key={agent.id}
                                                        onClick={() => {
                                                            setSelectedAgent(agent.id);
                                                            setIsDropdownOpen(false);
                                                        }}
                                                        className="w-full px-5 py-4 flex items-center justify-between hover:bg-white/[0.03] transition-colors group relative"
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${agent.id === 'global' ? 'bg-stellar-teal/10 text-stellar-teal' : 'bg-white/5 text-gray-400 group-hover:text-white'}`}>
                                                                {agent.id === 'global' ? <Cpu size={18} /> : <Shield size={18} />}
                                                            </div>
                                                            <div className="text-left">
                                                                <div className="text-sm font-bold text-gray-400 group-hover:text-white transition-colors">{agent.name}</div>
                                                                <div className="text-[10px] text-gray-600 font-mono uppercase tracking-widest">{agent.type}</div>
                                                            </div>
                                                        </div>
                                                        {selectedAgent === agent.id && (
                                                            <div className="bg-stellar-teal/20 p-1 rounded-full border border-stellar-teal/30">
                                                                <Check size={14} className="text-stellar-teal" />
                                                            </div>
                                                        )}
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            <div className="bg-stellar-teal/5 border border-stellar-teal/10 rounded-2xl p-5 flex gap-4">
                                <Shield className="w-6 h-6 text-stellar-teal shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <h4 className="text-xs font-black text-stellar-teal uppercase tracking-widest">{t.marketplace.modal.security_check}</h4>
                                    <p className="text-[11px] text-gray-400 leading-relaxed font-medium">
                                        {t.marketplace.modal.security_desc_prefix} <span className="text-white font-bold">{localizedSkill.name}</span> {t.marketplace.modal.security_desc_mid} <span className="text-stellar-teal font-bold">{skill.tags?.[0] || skill.category || 'DeFi'}</span>.
                                        <br />
                                        <span className="text-[10px] mt-1 block italic opacity-80">
                                            {selectedAgent === 'global' ? t.marketplace.modal.security_desc_global : t.marketplace.modal.security_desc_specific}
                                        </span>
                                        <span className="text-[9px] mt-2 block text-gray-600 font-mono uppercase tracking-tighter italic">
                                            // Verified under Stellar Code of Conduct (April 2026)
                                        </span>
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => onInstall(selectedAgent)}
                                disabled={isInstalling}
                                className={`w-full py-5 bg-gradient-to-r from-stellar-teal to-blue-600 text-black font-black uppercase tracking-[0.2em] text-xs rounded-2xl transition-all shadow-xl active:scale-[0.98] flex items-center justify-center gap-3 ${isInstalling ? 'opacity-70 cursor-wait' : 'hover:from-white hover:to-white hover:text-black hover:shadow-stellar-teal/20'}`}
                            >
                                {isInstalling ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                        <span>{t.marketplace.modal.installing}</span>
                                    </>
                                ) : (
                                    <>
                                        <Download size={18} />
                                        <span>{t.marketplace.modal.install_button}</span>
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
