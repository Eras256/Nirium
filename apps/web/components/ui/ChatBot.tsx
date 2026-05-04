"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import Link from 'next/link';

interface Message {
    id: string;
    role: 'assistant' | 'user';
    content: string;
    timestamp: Date;
}

const ChatBot = () => {
    const { language, setLanguage } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Initial greeting with SCF compliance disclaimer
    useEffect(() => {
        if (messages.length === 0) {
            let greeting = "";
            if (language === 'es') {
                greeting = "¡Hola! Soy la IA de Nirium. Estoy aquí para ayudarte con dudas técnicas. Recuerda: no proporciono asesoría financiera y estoy alineado a SCF 7.0.";
            } else if (language === 'zh') {
                greeting = "你好！我是 Nirium AI。我在这里协助解决技术问题。请记住：我不提供财务建议，所有信息均符合 SCF 7.0 标准。";
            } else {
                greeting = "Hello! I am Nirium AI. I'm here for technical help. Remember: I do not provide financial advice and I am SCF 7.0 aligned.";
            }
            
            setMessages([
                {
                    id: '1',
                    role: 'assistant',
                    content: greeting,
                    timestamp: new Date()
                }
            ]);
        }
    }, [language, messages.length]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSend = async (overrideText?: string) => {
        const textToSend = overrideText || input;
        if (!textToSend.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: textToSend,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        if (!overrideText) setInput('');
        setIsTyping(true);

        // Institutional AI Response Simulation
        setTimeout(() => {
            const aiContent = getAIResponse(textToSend, language);
            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: aiContent,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMsg]);
            setIsTyping(false);
        }, 1000);
    };

    const getAIResponse = (query: string, lang: string) => {
        const q = query.toLowerCase();
        
        // Comprehensive Expert Knowledge Base (April 2026)
        const kb: Record<string, any> = {
            es: {
                home: "**Nirium** es la primera capa de automatización de tesorería institucional sobre Stellar.\n\nNo custodial — el usuario controla las llaves. Impulsado por **x402 + MPP + Soroban**.\n\n→ [Inicio](/) · [Treasury](/treasury) · [Docs](/docs)",
                dashboard: "El [Dashboard](/dashboard) centraliza el control de tus agentes.\n\nMonitorea actividad de protocolo, nodos en ejecución y flujos de CETES en tiempo real.",
                marketplace: "El [Marketplace](/marketplace) ofrece kernels pre-configurados para optimización de ruteo FX y gestión de liquidez institucional.\n\nCada kernel corre en Soroban — atómico, auditable, no custodial.",
                treasury: "La sección de [Tesorería](/treasury) gestiona tus bóvedas Soroban **2-de-3 multisig** y reglas de flujo de caja.\n\nActivos soportados: **XLM · USDC · CETES**\nProveedor: Etherfuse (0.2% all-in)",
                analytics: "La sección de [Analytics](/analytics) proporciona una vista forense de cada transacción — criptográficamente firmada, anclada en IPFS.",
                fiat: "El [Fiat Hub](/ramp) conecta directamente con la API de **Etherfuse** para emitir CETES vía depósito SPEI (MXN).\n\nFlujo: SPEI → KYC → cotización → CLABE → CETES on-chain.",
                devs: "La sección de [Developers](/developers) expone **44+ endpoints REST**, SDK TypeScript/Python, servidor MCP para Claude/Cursor, y soporte nativo para **x402 + MPP**.",
                docs: {
                    overview: "Visión general de Nirium v0.5.0: [Ver Documentación](/docs?tab=overview).",
                    api: "API Sandbox: Gestiona tus llaves y explora endpoints en [Docs > API](/docs?tab=api).",
                    blueprints: "Casos técnicos listos para clonar en [Docs > Blueprints](/docs?tab=blueprints).",
                    architecture: "Arquitectura del protocolo: [Docs > Architecture](/docs?tab=architecture).",
                    contracts: "Contratos Soroban: Direcciones verificadas en [Docs > Contracts](/docs?tab=contracts).",
                    agent: "Lógica de Nodos: Sistema ELO y autonomía en [Docs > Agent](/docs?tab=agent).",
                    builder: "Visual Builder: Crea reglas sin código en [Docs > Builder](/docs?tab=builder).",
                    frontend: "Integración UI: Componentes React en [Docs > Frontend](/docs?tab=frontend).",
                    security: "Auditoría CNBV + HMAC-SHA256: [Docs > Security](/docs?tab=security)."
                },
                scf: "Nirium cumple estrictamente con:\n\n**· SCF 7.0** — hitos 10/20/30/40\n**· Estándares del Ecosistema SDF** — sin garantías de rendimiento\n**· Código de Conducta Stellar** (30 abril 2026)\n\nMás info en [Docs > Security](/docs?tab=security).",
                compliance: "La página de [Compliance](/compliance) genera reportes auditables en formato **CNBV-ready**.\n\nCada acción del agente: firmada HMAC-SHA256 → encadenada → anclada IPFS → exportable JSON.",
                default: "Soy el asistente técnico de Nirium. Puedo guiarte a:\n\n[Dashboard](/dashboard) · [Treasury](/treasury) · [Developers](/developers) · [Docs](/docs) · [Compliance](/compliance)\n\n¿Qué necesitas?"
            },
            zh: {
                home: "**Nirium** 是 Stellar 上的机构级资金自动化层。\n\n非托管 — 用户控制密钥。由 **x402 + MPP + Soroban** 驱动。\n\n→ [首页](/) · [资金管理](/treasury) · [文档](/docs)",
                dashboard: "[控制面板](/dashboard) 集中管理您的代理。\n\n实时监控协议活动、运行中的节点和 CETES 流动。",
                marketplace: "[协议市场](/marketplace) 提供外汇路由优化和机构级流动性管理的预配置内核。\n\n每个内核在 Soroban 上运行 — 原子化、可审计、非托管。",
                treasury: "[资金管理](/treasury) 管理您的 Soroban **2/3 多签** 金库和现金流规则。\n\n支持资产：**XLM · USDC · CETES**\n提供商：Etherfuse（0.2% 全包）",
                analytics: "[分析](/analytics) 提供每笔交易的法证视图 — 加密签名，IPFS 锚定。",
                fiat: "[Fiat Hub](/ramp) 直连 **Etherfuse** API，通过 SPEI（MXN）存款发行 CETES。\n\n流程：SPEI → KYC → 报价 → CLABE → 链上 CETES。",
                devs: "[开发者](/developers) 提供 **44+ REST 端点**、TypeScript/Python SDK、Claude/Cursor MCP 服务器，以及原生 **x402 + MPP** 支持。",
                docs: {
                    overview: "Nirium v0.5.0 概览：[查看文档](/docs?tab=overview)。",
                    api: "API 沙盒：在 [文档 > API](/docs?tab=api) 管理密钥。",
                    blueprints: "技术案例：[文档 > Blueprints](/docs?tab=blueprints)。",
                    architecture: "系统架构：[文档 > Architecture](/docs?tab=architecture)。",
                    contracts: "Soroban 合约地址：[文档 > Contracts](/docs?tab=contracts)。",
                    agent: "节点逻辑 + ELO：[文档 > Agent](/docs?tab=agent)。",
                    builder: "可视化构建器：[文档 > Builder](/docs?tab=builder)。",
                    frontend: "前端集成：[文档 > Frontend](/docs?tab=frontend)。",
                    security: "CNBV 审计 + HMAC-SHA256：[文档 > Security](/docs?tab=security)。"
                },
                scf: "Nirium 完全符合：\n\n**· SCF 7.0** — 里程碑 10/20/30/40\n**· Stellar 生态系统标准** — 无收益保证\n**· Stellar 行为准则**（2026年4月30日）\n\n详见 [文档 > Security](/docs?tab=security)。",
                compliance: "[合规](/compliance) 页面生成 **CNBV 格式**审计报告。\n\n每个代理操作：HMAC-SHA256 签名 → 链式哈希 → IPFS 锚定 → JSON 导出。",
                default: "我是 Nirium 技术助手。我可以引导您前往：\n\n[控制面板](/dashboard) · [资金管理](/treasury) · [开发者](/developers) · [文档](/docs) · [合规](/compliance)\n\n需要什么帮助？"
            },
            en: {
                home: "**Nirium** is the first institutional treasury automation layer on Stellar.\n\nNon-custodial — users control keys. Powered by **x402 + MPP + Soroban**.\n\n→ [Home](/) · [Treasury](/treasury) · [Docs](/docs)",
                dashboard: "The [Dashboard](/dashboard) centralizes agent control.\n\nMonitor protocol activity, running nodes, and CETES flows in real-time.",
                marketplace: "The [Marketplace](/marketplace) offers pre-built kernels for liquidity routing optimization and institutional treasury management.\n\nEach kernel runs on Soroban — atomic, auditable, non-custodial.",
                treasury: "The [Treasury](/treasury) section manages your Soroban **2-of-3 multisig** vaults and automated cash-flow rules.\n\nSupported assets: **XLM · USDC · CETES**\nProvider: Etherfuse (0.2% all-in)",
                analytics: "The [Analytics](/analytics) section provides a forensic view of every transaction — cryptographically signed and IPFS-anchored.",
                fiat: "The [Fiat Hub](/ramp) connects directly to the **Etherfuse** API to issue CETES via SPEI deposit (MXN).\n\nFlow: SPEI → KYC → quote → CLABE → CETES on-chain.",
                devs: "The [Developers](/developers) section exposes **44+ REST endpoints**, TypeScript/Python SDK, MCP server for Claude/Cursor, and native **x402 + MPP** support.",
                docs: {
                    overview: "Nirium v0.5.0 overview: [View Documentation](/docs?tab=overview).",
                    api: "API Sandbox: Manage keys and explore endpoints at [Docs > API](/docs?tab=api).",
                    blueprints: "Technical use cases ready to clone at [Docs > Blueprints](/docs?tab=blueprints).",
                    architecture: "Protocol architecture: [Docs > Architecture](/docs?tab=architecture).",
                    contracts: "Soroban contract addresses: [Docs > Contracts](/docs?tab=contracts).",
                    agent: "Node logic + ELO system: [Docs > Agent](/docs?tab=agent).",
                    builder: "Visual drag-and-drop builder: [Docs > Builder](/docs?tab=builder).",
                    frontend: "React component integration: [Docs > Frontend](/docs?tab=frontend).",
                    security: "CNBV audit + HMAC-SHA256: [Docs > Security](/docs?tab=security)."
                },
                scf: "Nirium is 100% aligned with:\n\n**· SCF 7.0** — milestones 10/20/30/40\n**· SDF Ecosystem Standards** — no yield guarantees\n**· Stellar Code of Conduct** (April 30, 2026)\n\nRead more at [Docs > Security](/docs?tab=security).",
                compliance: "The [Compliance](/compliance) page generates auditable reports in **CNBV-ready** format.\n\nEvery agent action: HMAC-SHA256 signed → cryptographically chained → IPFS-anchored → JSON export.",
                default: "I'm Nirium's technical assistant. I can guide you to:\n\n[Dashboard](/dashboard) · [Treasury](/treasury) · [Developers](/developers) · [Docs](/docs) · [Compliance](/compliance)\n\nWhat do you need?"
            }
        };

        const currentKB = kb[lang as keyof typeof kb] || kb.en;

        if (q.includes('qué es') || q.includes('que es') || q.includes('what is') || q.includes('什么是')) return currentKB.home;

        // Documentation sub-topics
        if (q.includes('doc') || q.includes('guía') || q.includes('guide') || q.includes('文档')) {
            if (q.includes('api') || q.includes('key') || q.includes('sand') || q.includes('sandbox')) return currentKB.docs.api;
            if (q.includes('arch') || q.includes('fleet') || q.includes('kernel')) return currentKB.docs.architecture;
            if (q.includes('contrat') || q.includes('soroban') || q.includes('direcc') || q.includes('地址')) return currentKB.docs.contracts;
            if (q.includes('agent') || q.includes('elo') || q.includes('skill')) return currentKB.docs.agent;
            if (q.includes('build') || q.includes('regla') || q.includes('visual') || q.includes('构建')) return currentKB.docs.builder;
            if (q.includes('secur') || q.includes('segur') || q.includes('audit') || q.includes('安全')) return currentKB.docs.security;
            if (q.includes('front') || q.includes('react') || q.includes('ui')) return currentKB.docs.frontend;
            return currentKB.docs.overview;
        }

        if (q.includes('dash') || q.includes('panel') || q.includes('控制面板')) return currentKB.dashboard;
        if (q.includes('market') || q.includes('estrat') || q.includes('strat') || q.includes('市场') || q.includes('kernel')) return currentKB.marketplace;
        if (q.includes('treas') || q.includes('tesor') || q.includes('vault') || q.includes('bóveda') || q.includes('资金') || q.includes('保险库')) return currentKB.treasury;
        if (q.includes('analyt') || q.includes('analit') || q.includes('data') || q.includes('分析')) return currentKB.analytics;
        if (q.includes('fiat') || q.includes('ramp') || q.includes('hub') || q.includes('法币') || q.includes('cetes') || q.includes('spei') || q.includes('mxn')) return currentKB.fiat;
        if (q.includes('compli') || q.includes('cnbv') || q.includes('audit') || q.includes('hmac') || q.includes('合规')) return currentKB.compliance;
        if (q.includes('dev') || q.includes('sdk') || q.includes('endpoint') || q.includes('开发')) return currentKB.devs;
        if (q.includes('api') || q.includes('sand') || q.includes('sandbox') || q.includes('prueb')) return currentKB.docs.api;
        if (q.includes('build') || q.includes('blueprint') || q.includes('construir') || q.includes('构建') || q.includes('visual')) return currentKB.docs.builder;
        if (q.includes('scf') || q.includes('award') || q.includes('conducta') || q.includes('norma') || q.includes('rule') || q.includes('conduct') || q.includes('奖')) return currentKB.scf;

        return currentKB.default;
    };

    const renderMessage = (content: string) => {
        const lines = content.split('\n');
        return lines.map((line, lineIdx) => {
            const segments: React.ReactNode[] = [];
            const pattern = /(\*\*.*?\*\*|\[.*?\]\(.*?\))/g;
            let lastIndex = 0;
            let segIdx = 0;
            let match;

            while ((match = pattern.exec(line)) !== null) {
                if (match.index > lastIndex) {
                    segments.push(line.slice(lastIndex, match.index));
                }
                const seg = match[0];
                if (seg.startsWith('**')) {
                    segments.push(
                        <strong key={`b-${segIdx++}`} className="text-white font-bold">
                            {seg.slice(2, -2)}
                        </strong>
                    );
                } else {
                    const lm = seg.match(/\[(.*?)\]\((.*?)\)/);
                    if (lm) {
                        segments.push(
                            <Link
                                key={`l-${segIdx++}`}
                                href={lm[2]}
                                className="text-stellar-teal underline font-semibold hover:opacity-70 transition-opacity"
                                onClick={() => setIsOpen(false)}
                            >
                                {lm[1]}
                            </Link>
                        );
                    }
                }
                lastIndex = match.index + seg.length;
            }

            if (lastIndex < line.length) segments.push(line.slice(lastIndex));

            return (
                <React.Fragment key={`ln-${lineIdx}`}>
                    {segments.length > 0 ? segments : line}
                    {lineIdx < lines.length - 1 && <br />}
                </React.Fragment>
            );
        });
    };

    return (
        <>
            {/* Floating Trigger Button (Nano) */}
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-4 right-4 z-[100] w-12 h-12 sm:w-10 sm:h-10 rounded-full bg-stellar-yellow text-black shadow-lg flex items-center justify-center border border-white/10"
            >
                {isOpen ? <X size={18} /> : <MessageSquare size={18} />}
            </motion.button>

            {/* Chat Window (Nano & Minimalist) */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="fixed bottom-20 sm:bottom-16 right-4 z-[100] w-[88vw] max-w-[280px] sm:w-[260px] h-[380px] sm:h-[320px] bg-[#0A0A0A]/98 backdrop-blur-2xl border border-white/10 rounded-xl shadow-2xl flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-3 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 flex items-center justify-center">
                                    <img src="/brand/NiLo.png" alt="Nirium Logo" className="w-full h-full object-contain" />
                                </div>
                                <h3 className="text-[11px] font-bold uppercase text-white tracking-tighter">Nirium AI</h3>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="flex items-center bg-white/5 border border-white/10 rounded p-0.5">
                                    {(['en', 'es', 'zh'] as const).map((lang) => (
                                        <button
                                            key={lang}
                                            onClick={() => setLanguage(lang)}
                                            className={`px-1.5 py-0.5 text-[8px] font-black rounded uppercase ${
                                                language === lang ? 'bg-stellar-yellow text-black' : 'text-zinc-600'
                                            }`}
                                        >
                                            {lang}
                                        </button>
                                    ))}
                                </div>
                                <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
                                    <X size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar"
                        >
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
                                    <div className={`max-w-[92%] p-2 rounded-lg text-[11px] leading-[1.4] ${
                                        msg.role === 'assistant'
                                            ? 'bg-white/5 border border-white/10 text-gray-300'
                                            : 'bg-stellar-yellow text-black font-bold'
                                    }`}>
                                        {renderMessage(msg.content)}
                                    </div>
                                </div>
                            ))}
                            {isTyping && <div className="w-2 h-2 bg-stellar-yellow/40 rounded-full animate-pulse ml-2" />}
                        </div>

                        {/* Input Area */}
                        <div className="p-2.5 bg-black/80 border-t border-white/5">
                            <div className="flex items-center gap-1.5">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="..."
                                    className="flex-1 bg-white/5 border border-white/10 rounded-md px-2 py-1.5 text-[11px] focus:outline-none text-white"
                                />
                                <button
                                    onClick={() => handleSend()}
                                    className="w-7 h-7 rounded-md bg-stellar-yellow text-black flex items-center justify-center"
                                >
                                    <Send size={12} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 20px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </>
    );
};

export default ChatBot;
