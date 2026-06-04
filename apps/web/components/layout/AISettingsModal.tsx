"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Brain, Cpu, Key, Globe, Check, AlertCircle, Loader2, Shield, Unplug } from 'lucide-react';
import { aiService, LLMConfig } from '@/lib/aiService';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';

interface AISettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PROVIDERS = [
    { id: 'nirium', name: 'Nirium Cloud', icon: Globe, description: 'Proprietary institutional core' },
    { id: 'openai', name: 'OpenAI', icon: Cpu, description: 'GPT-5.5 / GPT-5.4 / o3-mini' },
    { id: 'anthropic', name: 'Anthropic', icon: Brain, description: 'Claude Opus 4.7 / Sonnet 4.6' },
    { id: 'minimax', name: 'MiniMax', icon: Cpu, description: 'Abab 6.5 / Video-01' },
    { id: 'gemini', name: 'Gemini', icon: Globe, description: 'Gemini 2.5 Pro / 3.1 Pro' },
    { id: 'grok', name: 'Grok', icon: Cpu, description: 'xAI Grok-4.3 / Grok-4 Heavy' },
    { id: 'bedrock', name: 'AWS Bedrock', icon: Key, description: 'Amazon Institutional LLMs' },
    { id: 'openrouter', name: 'OpenRouter', icon: Globe, description: 'Unified API Gateway' },
    { id: 'ollama', name: 'Ollama (Local)', icon: Key, description: 'Privacy-focused local inference' },
];

const MODELS: Record<string, string[]> = {
    nirium: ['nirium-core-v1', 'stellar-quantum-alpha'],
    openai: ['gpt-5.5', 'gpt-5.4', 'gpt-5.4-mini', 'o3-mini'],
    anthropic: ['claude-opus-4-7', 'claude-sonnet-4-6', 'claude-haiku-4-5-20251001'],
    minimax: ['abab6.5-chat', 'abab6.5s-chat'],
    gemini: ['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-3.1-pro', 'gemini-3.1-pro-preview', 'gemini-3-flash'],
    grok: ['grok-4.3', 'grok-4', 'grok-4.1-fast', 'grok-3'],
    bedrock: ['anthropic.claude-opus-4-7-v1:0', 'anthropic.claude-sonnet-4-6-v1:0', 'amazon.titan-text-premier-v1:0'],
    openrouter: ['meta-llama/llama-4-maverick', 'mistralai/mistral-large-2', 'deepseek/deepseek-r2'],
    ollama: ['llama3.3', 'phi4', 'mistral', 'codellama', 'deepseek-r2'],
};

export default function AISettingsModal({ isOpen, onClose }: AISettingsModalProps) {
    const { t } = useLanguage();
    const [config, setConfig] = useState<LLMConfig>({ provider: 'nirium', model: 'nirium-core-v1' });
    const [savedProvider, setSavedProvider] = useState<string>('nirium');
    const [isTesting, setIsTesting] = useState(false);
    const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
    const [mounted, setMounted] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDisconnecting, setIsDisconnecting] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (isOpen) {
            const cfg = aiService.getConfig();
            setConfig(cfg);
            setSavedProvider(cfg.provider);
            setTestResult(null);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleSave = async () => {
        setIsSaving(true);
        const result = await aiService.saveConfig(config);
        setIsSaving(false);

        if (result.success) {
            toast.success(t.ai_modal.hub_updated, { description: result.message });
            onClose();
        } else {
            toast.warning(t.ai_modal.config_saved_local, { description: result.message });
            onClose();
        }
    };

    const handleDisconnect = async () => {
        setIsDisconnecting(true);
        const result = await aiService.disconnect();
        setIsDisconnecting(false);

        if (result.success) {
            toast.success('Protocol disconnected', { description: 'Reverted to Nirium Cloud' });
            const defaultCfg: LLMConfig = { provider: 'nirium', model: 'nirium-core-v1' };
            setConfig(defaultCfg);
            setSavedProvider('nirium');
            onClose();
        } else {
            toast.error('Disconnect failed', { description: result.message });
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
            toast.success(t.ai_modal.ollama_connected, { description: t.ai_modal.ollama_online });
        } else {
            toast.error(t.ai_modal.connection_failed, { description: t.ai_modal.ollama_error_hint });
        }
    };

    if (!mounted) return null;

    const isExternalConnected = savedProvider !== 'nirium';

    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/90 backdrop-blur-xl"
                    />

                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="bg-nirium-obsidian border border-white/10 rounded-2xl w-full max-w-[95vw] sm:max-w-md md:max-w-lg shadow-[0_0_80px_rgba(112,0,255,0.3)] relative z-50 flex flex-col overflow-hidden max-h-[90vh] sm:max-h-[85vh]"
                    >
                        {/* Header */}
                        <div className="p-4 sm:p-5 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-pulse-violet/10 to-transparent shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-pulse-violet/20 border border-pulse-violet/30 flex items-center justify-center text-pulse-violet">
                                    <Brain className="w-5 h-5 sm:w-6 sm:h-6" />
                                </div>
                                <div>
                                    <h2 className="text-base sm:text-lg font-bold text-white tracking-tighter">{t.ai_modal.title}</h2>
                                    <p className="text-[9px] text-gray-500 uppercase tracking-widest font-black opacity-60">{t.ai_modal.subtitle}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {isExternalConnected && (
                                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-green-500/10 border border-green-500/20">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                        <span className="text-[8px] font-black text-green-400 uppercase tracking-widest">Live</span>
                                    </div>
                                )}
                                <button onClick={onClose} className="p-2 text-gray-500 hover:text-white transition-all rounded-lg hover:bg-white/5">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Content area with internal scroll */}
                        <div className="flex-1 p-5 sm:p-6 space-y-6 overflow-y-auto custom-scrollbar bg-black/20">
                            {/* Provider Selector */}
                            <div className="space-y-3">
                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">{t.ai_modal.connect_host}</label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                                    {PROVIDERS.map((p) => {
                                        const Icon = p.icon;
                                        const isActive = config.provider === p.id;
                                        const isSynced = savedProvider === p.id && p.id !== 'nirium';
                                        return (
                                            <button
                                                key={p.id}
                                                onClick={() => setConfig({ ...config, provider: p.id as LLMConfig['provider'], model: MODELS[p.id][0] })}
                                                className={`p-2.5 rounded-xl border text-left transition-all group flex flex-col gap-2 relative ${isActive
                                                    ? 'bg-pulse-violet/15 border-pulse-violet/50 shadow-[0_0_15px_rgba(112,0,255,0.2)]'
                                                    : 'bg-white/[0.02] border-white/5 hover:border-white/15'
                                                    }`}
                                            >
                                                {isSynced && (
                                                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                                )}
                                                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-colors ${isActive ? 'bg-pulse-violet/20' : 'bg-white/5 group-hover:bg-white/10'}`}>
                                                    <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isActive ? 'text-pulse-violet' : 'text-gray-500 group-hover:text-white'}`} />
                                                </div>
                                                <span className={`text-[10px] sm:text-xs font-bold leading-tight ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>{p.name}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Dynamic Fields */}
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-1">
                                {/* Model Selector */}
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">{t.ai_modal.model_architecture}</label>
                                    <div className="relative">
                                        {config.provider === 'ollama' ? (
                                            <input
                                                type="text"
                                                value={config.model}
                                                onChange={(e) => setConfig({ ...config, model: e.target.value })}
                                                placeholder="e.g. llama3.2, deepseek-r1"
                                                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono outline-none focus:border-pulse-violet transition-all focus:ring-1 focus:ring-pulse-violet/50"
                                            />
                                        ) : (
                                            <select
                                                value={config.model}
                                                onChange={(e) => setConfig({ ...config, model: e.target.value })}
                                                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono outline-none focus:border-pulse-violet transition-all focus:ring-1 focus:ring-pulse-violet/50 appearance-none cursor-pointer"
                                            >
                                                {MODELS[config.provider].map((m) => (
                                                    <option key={m} value={m} className="bg-nirium-obsidian">{m}</option>
                                                ))}
                                            </select>
                                        )}
                                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                            <Cpu size={14} />
                                        </div>
                                    </div>
                                </div>

                                {/* API Key (for Cloud Providers) */}
                                {(config.provider !== 'nirium' && config.provider !== 'ollama') && (
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">{t.ai_modal.private_api_key}</label>
                                        <div className="relative">
                                            <input
                                                type="password"
                                                value={config.apiKey || ''}
                                                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                                                placeholder={`sk-...${config.provider === 'openai' ? 'keys' : 'sec'}`}
                                                className="w-full bg-black/60 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white font-mono outline-none focus:border-pulse-violet transition-all focus:ring-1 focus:ring-pulse-violet/50"
                                            />
                                            <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        </div>
                                    </div>
                                )}

                                {/* Ollama Endpoint */}
                                {config.provider === 'ollama' && (
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">{t.ai_modal.local_host}</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={config.ollamaUrl || 'http://localhost:11434'}
                                                onChange={(e) => setConfig({ ...config, ollamaUrl: e.target.value })}
                                                className="flex-1 bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono outline-none focus:border-pulse-violet transition-all focus:ring-1 focus:ring-pulse-violet/50"
                                            />
                                            <button
                                                onClick={handleTestOllama}
                                                disabled={isTesting}
                                                className="px-4 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black text-white hover:bg-white/10 transition-all flex items-center gap-1.5 tracking-wider"
                                            >
                                                {isTesting ? <Loader2 size={10} className="animate-spin" /> : testResult === 'success' ? <Check size={10} className="text-green-400" /> : <Globe size={10} />}
                                                {t.ai_modal.test}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Stellar Conduct Alignment */}
                                <div className="mt-6 p-4 bg-pulse-violet/5 border border-pulse-violet/10 rounded-xl space-y-2 group transition-all hover:bg-pulse-violet/10">
                                    <div className="flex items-center gap-2 text-pulse-violet">
                                        <Shield size={14} className="shrink-0" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Stellar Compliance Alignment</span>
                                    </div>
                                    <p className="text-[10px] text-gray-400 leading-relaxed italic">
                                        {t.ai_modal.conduct_agreement}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 sm:p-5 border-t border-white/5 bg-black/60 flex gap-2 shrink-0">
                            {isExternalConnected ? (
                                <button
                                    onClick={handleDisconnect}
                                    disabled={isDisconnecting}
                                    className="flex-1 py-2.5 rounded-xl bg-red-950/30 border border-red-500/30 text-[9px] sm:text-[10px] font-bold text-red-400 hover:bg-red-950/50 hover:border-red-500/50 transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                                >
                                    {isDisconnecting
                                        ? <Loader2 size={12} className="animate-spin" />
                                        : <Unplug size={12} />
                                    }
                                    Disconnect
                                </button>
                            ) : (
                                <button
                                    onClick={onClose}
                                    className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[9px] sm:text-[10px] font-bold text-gray-400 hover:text-white transition-all uppercase tracking-widest"
                                >
                                    {t.ai_modal.cancel}
                                </button>
                            )}
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex-1 py-2.5 rounded-xl bg-pulse-violet border border-pulse-violet/50 text-[9px] sm:text-[10px] font-bold text-white shadow-[0_0_15px_rgba(112,0,255,0.4)] hover:brightness-110 transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                            >
                                {isSaving && <Loader2 size={12} className="animate-spin" />}
                                {t.ai_modal.sync_protocol}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    return createPortal(modalContent, document.body);
}
