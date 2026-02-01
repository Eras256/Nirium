"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Brain, Cpu, Key, Globe, Check, AlertCircle, Loader2 } from 'lucide-react';
import { aiService, LLMConfig } from '@/lib/aiService';
import { toast } from 'sonner';

interface AISettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PROVIDERS = [
    { id: 'nirium', name: 'Nirium Cloud', icon: Globe, description: 'Proprietary institutional matrix' },
    { id: 'openai', name: 'OpenAI', icon: Cpu, description: 'GPT-4o / GPT-4 Turbo' },
    { id: 'anthropic', name: 'Anthropic', icon: Brain, description: 'Claude 3.5 Sonnet' },
    { id: 'minimax', name: 'MiniMax', icon: Cpu, description: 'Abab 6.5 / Video-01' },
    { id: 'gemini', name: 'Gemini', icon: Globe, description: 'Google Flash 1.5' },
    { id: 'grok', name: 'Grok', icon: Cpu, description: 'xAI Grok-1' },
    { id: 'bedrock', name: 'AWS Bedrock', icon: Key, description: 'Amazon Institutional LLMs' },
    { id: 'openrouter', name: 'OpenRouter', icon: Globe, description: 'Unified API Gateway' },
    { id: 'ollama', name: 'Ollama (Local)', icon: Key, description: 'Privacy-focused local inference' },
];

const MODELS: Record<string, string[]> = {
    nirium: ['nirium-matrix-v1', 'stellar-quantum-alpha'],
    openai: ['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    anthropic: ['claude-3-5-sonnet-20240620', 'claude-3-opus-20240229'],
    minimax: ['abab6.5-chat', 'abab6.5s-chat'],
    gemini: ['gemini-1.5-pro', 'gemini-1.5-flash'],
    grok: ['grok-1', 'grok-beta'],
    bedrock: ['anthropic.claude-3-sonnet-20240229-v1:0', 'amazon.titan-text-express-v1'],
    openrouter: ['meta-llama/llama-3-70b-instruct', 'mistralai/mistral-7b-instruct'],
    ollama: ['llama3', 'mistral', 'codellama', 'phi3'],
};

export default function AISettingsModal({ isOpen, onClose }: AISettingsModalProps) {
    const [config, setConfig] = useState<LLMConfig>({ provider: 'nirium', model: 'nirium-matrix-v1' });
    const [isTesting, setIsTesting] = useState(false);
    const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setConfig(aiService.getConfig());
            setTestResult(null);
        }
    }, [isOpen]);

    const handleSave = async () => {
        setIsSaving(true);
        const result = await aiService.saveConfig(config);
        setIsSaving(false);

        if (result.success) {
            toast.success('AI Matrix Updated', { description: result.message });
            onClose();
        } else {
            toast.warning('Configuration Saved Locally', { description: result.message });
            onClose();
        }
    };

    const handleTestOllama = async () => {
        if (!config.ollamaUrl) return;
        setIsTesting(true);
        setTestResult(null);
        const ok = await aiService.testOllama(config.ollamaUrl);
        setIsTesting(false);
        setTestResult(ok ? 'success' : 'error');

        if (ok) {
            toast.success('Ollama Connected', { description: 'Local neural host is online.' });
        } else {
            toast.error('Connection Failed', { description: 'Ensure Ollama is running with OLLAMA_ORIGINS="*"' });
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex justify-center p-4 pt-20 pb-4 overflow-y-auto">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 10 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 10 }}
                        className="bg-nirium-obsidian border border-white/10 rounded-2xl w-[95vw] sm:w-full max-w-md shadow-[0_0_50px_rgba(112,0,255,0.2)] relative z-10 flex flex-col mx-auto my-auto h-fit"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-pulse-violet/10 to-transparent">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-pulse-violet/20 border border-pulse-violet/30 flex items-center justify-center">
                                    <Brain className="text-pulse-violet w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-white tracking-tight">AI Sovereignty</h2>
                                    <p className="text-[9px] text-gray-500 uppercase tracking-widest">Neural Link Paradigms</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-4 space-y-5 overflow-y-auto max-h-[45vh] custom-scrollbar">
                            {/* Provider Selector */}
                            <div className="space-y-2">
                                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest ml-1">Select Neural Provider</label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {PROVIDERS.map((p) => {
                                        const Icon = p.icon;
                                        const isActive = config.provider === p.id;
                                        return (
                                            <button
                                                key={p.id}
                                                onClick={() => setConfig({ ...config, provider: p.id as any, model: MODELS[p.id][0] })}
                                                className={`p-2 rounded-xl border text-left transition-all group flex items-center gap-2 ${isActive
                                                    ? 'bg-pulse-violet/10 border-pulse-violet/50 shadow-[0_0_10px_rgba(112,0,255,0.1)]'
                                                    : 'bg-white/5 border-white/10 hover:border-white/20'
                                                    }`}
                                            >
                                                <div className={`p-1.5 rounded-lg shrink-0 ${isActive ? 'bg-pulse-violet/20' : 'bg-white/5'}`}>
                                                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-pulse-violet' : 'text-gray-400 group-hover:text-white'}`} />
                                                </div>
                                                <span className={`text-[10px] sm:text-[11px] font-bold truncate ${isActive ? 'text-white' : 'text-gray-400'}`}>{p.name}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Dynamic Fields */}
                            <div className="space-y-3 animate-in fade-in slide-in-from-top-1">
                                {/* Model Selector */}
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest ml-1">Model Architecture</label>
                                    <div className="relative">
                                        {config.provider === 'ollama' ? (
                                            <input
                                                type="text"
                                                value={config.model}
                                                onChange={(e) => setConfig({ ...config, model: e.target.value })}
                                                placeholder="e.g. llama3.2, deepseek-r1"
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-pulse-violet transition-all"
                                            />
                                        ) : (
                                            <select
                                                value={config.model}
                                                onChange={(e) => setConfig({ ...config, model: e.target.value })}
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-pulse-violet transition-all appearance-none cursor-pointer"
                                            >
                                                {MODELS[config.provider].map((m) => (
                                                    <option key={m} value={m}>{m}</option>
                                                ))}
                                            </select>
                                        )}
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                            <Cpu size={12} />
                                        </div>
                                    </div>
                                </div>

                                {/* API Key (for Cloud Providers) */}
                                {(config.provider !== 'nirium' && config.provider !== 'ollama') && (
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest ml-1">Private API Key</label>
                                        <div className="relative">
                                            <input
                                                type="password"
                                                value={config.apiKey || ''}
                                                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                                                placeholder={`sk-...${config.provider === 'openai' ? 'keys' : 'sec'}`}
                                                className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white font-mono outline-none focus:border-pulse-violet transition-all"
                                            />
                                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-3.5 h-3.5" />
                                        </div>
                                    </div>
                                )}

                                {/* Ollama Endpoint */}
                                {config.provider === 'ollama' && (
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest ml-1">Local Host</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={config.ollamaUrl || 'http://localhost:11434'}
                                                onChange={(e) => setConfig({ ...config, ollamaUrl: e.target.value })}
                                                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-pulse-violet transition-all"
                                            />
                                            <button
                                                onClick={handleTestOllama}
                                                disabled={isTesting}
                                                className="px-3 bg-white/5 border border-white/10 rounded-xl text-[9px] font-bold text-white hover:bg-white/10 transition-all flex items-center gap-1.5"
                                            >
                                                {isTesting ? <Loader2 size={10} className="animate-spin" /> : testResult === 'success' ? <Check size={10} className="text-green-400" /> : <Globe size={10} />}
                                                TEST
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-white/5 bg-black/20 flex gap-2">
                            <button
                                onClick={onClose}
                                className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold text-gray-400 hover:text-white transition-all uppercase tracking-widest"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex-1 py-2.5 rounded-xl bg-pulse-violet border border-pulse-violet/50 text-[10px] font-bold text-white shadow-[0_0_15px_rgba(112,0,255,0.3)] hover:brightness-110 transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                            >
                                {isSaving && <Loader2 size={12} className="animate-spin" />}
                                Sync Matrix
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
