"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    MessageSquare, X, Send, Bot, 
    ShieldCheck, Sparkles, Zap
} from 'lucide-react';
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
                home: "Nirium es la primera capa de automatización de tesorería institucional sobre Stellar. Visita la página de [Inicio](/) para más detalles.",
                dashboard: "El [Dashboard](/dashboard) centraliza el control de tus agentes y monitorea el 'Protocol Revenue' en tiempo real.",
                marketplace: "El [Marketplace](/strategies) ofrece estrategias pre-configuradas de trading, ruteo FX y Yield optimizado.",
                treasury: "La sección de [Tesorería](/treasury) gestiona tus Bóvedas no custodiales (2-de-3) y reglas de flujo de caja automatizado.",
                sandbox: "El [Sandbox](/sandbox) es tu entorno de pruebas para obtener API Keys institucionales y simular ejecuciones on-chain.",
                leaderboard: "El [Leaderboard](/leaderboard) clasifica a los agentes por su puntuación ELO, promoviendo la transparencia exigida por SCF 7.0.",
                analytics: "La sección de [Analytics](/analytics) proporciona una vista forense de cada transacción, asegurando trazabilidad total.",
                fiat: "El [Fiat Hub](/ramp) permite liquidar stablecoins a moneda local mediante rieles SEP-24 y liquidación MPP.",
                devs: "En la sección de [Developers](/agents) puedes acceder a las APIs de x402 y descargar nuestros SDKs oficiales.",
                build: "En [/build](/build) encontrarás 12 'Blueprints' listos para producción, desde nóminas globales hasta mercados M2M.",
                docs: {
                    overview: "Visión general de Nirium: [Ver Documentación](/docs?tab=overview).",
                    api: "API Sandbox: Gestiona tus llaves y explora endpoints en [Docs > API](/docs?tab=api).",
                    blueprints: "Revisa los 12 casos técnicos listos para clonar en [Docs > Blueprints](/docs?tab=blueprints).",
                    architecture: "Diseño Swarm-Kernel: Entiende cómo operan los agentes en [Docs > Arquitectura](/docs?tab=architecture).",
                    contracts: "Contratos Soroban: Direcciones auditadas y lógica de bóvedas en [Docs > Contratos](/docs?tab=contracts).",
                    agent: "Lógica de Agentes: Sistema ELO y autonomía de ejecución en [Docs > Agentes](/docs?tab=agent).",
                    builder: "Visual Builder: Crea reglas de tesorería sin código en [Docs > Constructor](/docs?tab=builder).",
                    frontend: "Integración UI: Componentes React y estados globales en [Docs > Frontend](/docs?tab=frontend).",
                    security: "Seguridad Jargus: 78 vectores de auditoría y cumplimiento normativo en [Docs > Seguridad](/docs?tab=security)."
                },
                scf: "Nirium cumple estrictamente con las reglas de **SCF 7.0**, el programa **Instaward** y el **Código de Conducta de Stellar** (actualizado al 26 de abril de 2026). Operamos bajo un modelo de hitos (10/20/30/40) y promovemos un ecosistema profesional y transparente. Puedes leer más en [Docs > Seguridad](/docs?tab=security).",
                default: "Soy un experto en el protocolo. Puedo guiarte a: [Dashboard](/dashboard), [Tesorería](/treasury), [Docs](/docs) o explicarte nuestras [Reglas de Cumplimiento](/docs?tab=security). ¿En qué sección puedo ayudarte?"
            },
            zh: {
                home: "Nirium 是 Stellar 上的机构级资金自动化层。访问 [首页](/) 了解更多信息。",
                dashboard: " [控制面板](/dashboard) 集中管理您的代理并监控“协议收入”。",
                marketplace: " [市场](/strategies) 提供预配置的交易和外汇路由策略。",
                treasury: " [资金管理](/treasury) 部分管理您的非托管保险库和现金流规则。",
                sandbox: " [沙盒](/sandbox) 是您获取 API 密钥并模拟执行的测试环境。",
                leaderboard: " [排行榜](/leaderboard) 根据 ELO 评分对代理进行排名。",
                analytics: " [分析](/analytics) 部分提供每笔交易的法证视图。",
                fiat: " [Fiat Hub](/ramp) 允许通过 SEP-24 轨道将稳定币兑换为本地货币。",
                devs: "在 [开发者](/agents) 部分，您可以访问 x402 和 MPP 的 API。",
                build: "在 [/build](/build) 中，您将找到 12 个生产就绪的“蓝图”。",
                docs: {
                    overview: "Nirium 概览： [查看文档](/docs?tab=overview)。",
                    api: "API 沙盒：在 [文档 > API](/docs?tab=api) 管理您的密钥。",
                    blueprints: "在 [文档 > 蓝图](/docs?tab=blueprints) 查看 12 个技术案例。",
                    architecture: "Swarm-Kernel 架构： [文档 > 架构](/docs?tab=architecture)。",
                    contracts: "Soroban 合约： [文档 > 合约](/docs?tab=contracts)。",
                    agent: "代理逻辑： [文档 > 代理](/docs?tab=agent)。",
                    builder: "可视化构建器： [文档 > 构建器](/docs?tab=builder)。",
                    frontend: "前端集成： [文档 > 前端](/docs?tab=frontend)。",
                    security: "Jargus 安全： [文档 > 安全](/docs?tab=security)。"
                },
                scf: "符合 SCF 7.0 标准。查看我们的 [愿景](/docs?tab=overview)。",
                default: "我可以引导您前往： [控制面板](/dashboard), [资金管理](/treasury), [文档](/docs) 或 [构建](/build)。您想了解哪个？"
            },
            en: {
                home: "Nirium is the first institutional treasury automation layer on Stellar. Visit the [Home](/) page for more details.",
                dashboard: "The [Dashboard](/dashboard) centralizes agent control. Monitor 'Protocol Revenue' and Swarm health in real-time.",
                marketplace: "The [Marketplace](/strategies) offers pre-configured strategies for trading, FX routing, and Yield.",
                treasury: "The [Treasury](/treasury) section manages your non-custodial Vaults (2-of-3) and automated cash-flow rules.",
                sandbox: "The [Sandbox](/sandbox) is your testing environment. Get institutional API Keys and simulate executions on Stellar Testnet.",
                leaderboard: "The [Leaderboard](/leaderboard) ranks agents by ELO score, ensuring transparency as required by SCF 7.0.",
                analytics: "The [Analytics](/analytics) section provides a forensic view of every transaction directly from the Indexer.",
                fiat: "The [Fiat Hub](/ramp) allows settling stablecoins to local fiat (MXN/BRL) via SEP-24 and MPP rails.",
                devs: "In the [Developers](/agents) section, you can access x402/MPP APIs and download our official SDKs.",
                build: "In [/build](/build) you will find 12 production-ready 'Blueprints', from global payroll to M2M markets.",
                docs: {
                    overview: "Nirium v0.5.0 Overview: Non-custodial infra aligned with [SCF 7.0](/docs?tab=overview).",
                    api: "API Sandbox: Manage API Keys and explore endpoints in [Docs > API](/docs?tab=api).",
                    blueprints: "12 technical business models ready to clone in [Docs > Blueprints](/docs?tab=blueprints).",
                    architecture: "Swarm-Kernel Architecture: [Docs > Architecture](/docs?tab=architecture).",
                    contracts: "Soroban Contracts: Audited addresses and Vault logic in [Docs > Contracts](/docs?tab=contracts).",
                    agent: "Agent Logic: ELO system and execution autonomy in [Docs > Agents](/docs?tab=agent).",
                    builder: "Visual Builder: Drag & drop no-code rules in [Docs > Builder](/docs?tab=builder).",
                    frontend: "Frontend Integration: React components and states in [Docs > Frontend](/docs?tab=frontend).",
                    security: "Jargus Security: 78 audit vectors and [Stellar Code of Conduct](/docs?tab=security) compliance."
                },
                scf: "Nirium is 100% aligned with **SCF 7.0** milestones, **Instaward** guidelines, and the **Stellar Code of Conduct** (updated April 26, 2026). We promote professional and transparent behavior. Read more in [Docs > Security](/docs?tab=security).",
                default: "I'm a protocol expert. I can guide you to: [Dashboard](/dashboard), [Treasury](/treasury), [Docs](/docs), or explain our [Compliance Rules](/docs?tab=security). How can I help?"
            }
        };

        const currentKB = kb[lang as keyof typeof kb] || kb.en;

        // Exhaustive Section & Documentation Sub-topic Matching
        if (q.includes('qué es') || q.includes('que es') || q.includes('what is') || q.includes('什么是')) return currentKB.home;
        
        // Documentation Deep Dive
        if (q.includes('doc') || q.includes('guía') || q.includes('guide') || q.includes('文档')) {
            if (q.includes('api') || q.includes('key') || q.includes('sand')) return currentKB.docs.api;
            if (q.includes('arch') || q.includes('swarm') || q.includes('kernel')) return currentKB.docs.architecture;
            if (q.includes('contrat') || q.includes('soroban') || q.includes('direcc') || q.includes('地址')) return currentKB.docs.contracts;
            if (q.includes('agent') || q.includes('elo') || q.includes('skill')) return currentKB.docs.agent;
            if (q.includes('build') || q.includes('regla') || q.includes('visual') || q.includes('构建')) return currentKB.docs.builder;
            if (q.includes('secur') || q.includes('segur') || q.includes('jargus') || q.includes('audit') || q.includes('安全')) return currentKB.docs.security;
            if (q.includes('front') || q.includes('react') || q.includes('ui')) return currentKB.docs.frontend;
            return currentKB.docs.overview;
        }

        if (q.includes('dash') || q.includes('panel') || q.includes('控制面板')) return currentKB.dashboard;
        if (q.includes('market') || q.includes('estrat') || q.includes('strat') || q.includes('市场')) return currentKB.marketplace;
        if (q.includes('treas') || q.includes('tesor') || q.includes('vault') || q.includes('bóveda') || q.includes('资金') || q.includes('保险库')) return currentKB.treasury;
        if (q.includes('sand') || q.includes('prueb') || q.includes('test') || q.includes('沙盒')) return currentKB.sandbox;
        if (q.includes('lead') || q.includes('rank') || q.includes('elo') || q.includes('排行')) return currentKB.leaderboard;
        if (q.includes('analyt') || q.includes('analit') || q.includes('data') || q.includes('分析')) return currentKB.analytics;
        if (q.includes('fiat') || q.includes('ramp') || q.includes('hub') || q.includes('法币')) return currentKB.fiat;
        if (q.includes('dev') || q.includes('api') || q.includes('sdk') || q.includes('开发')) return currentKB.devs;
        if (q.includes('build') || q.includes('blueprint') || q.includes('construir') || q.includes('构建')) return currentKB.build;
        if (q.includes('doc') || q.includes('guía') || q.includes('guide') || q.includes('文档')) return currentKB.docs;
        if (q.includes('scf') || q.includes('award') || q.includes('instaward') || q.includes('regla') || q.includes('conducta') || q.includes('norma') || q.includes('rule') || q.includes('conduct') || q.includes('奖')) return currentKB.scf;
        
        return currentKB.default;
    };

    const renderMessage = (content: string) => {
        const parts = content.split(/(\[.*?\]\(.*?\))/g);
        return parts.map((part, i) => {
            const match = part.match(/\[(.*?)\]\((.*?)\)/);
            if (match) {
                return (
                    <Link 
                        key={i} 
                        href={match[2]} 
                        className="text-black underline font-black hover:opacity-70 transition-opacity"
                        onClick={() => setIsOpen(false)}
                    >
                        {match[1]}
                    </Link>
                );
            }
            return part;
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
                className="fixed bottom-4 right-4 z-[100] w-14 h-14 sm:w-12 sm:h-12 rounded-full bg-stellar-yellow text-black shadow-lg flex items-center justify-center border border-white/10"
            >
                {isOpen ? <X size={20} /> : <MessageSquare size={20} />}
            </motion.button>

            {/* Chat Window (Nano & Minimalist) */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="fixed bottom-24 right-4 z-[100] w-[92vw] max-w-[340px] sm:w-[300px] h-[460px] sm:h-[380px] bg-[#0A0A0A]/98 backdrop-blur-2xl border border-white/10 rounded-xl shadow-2xl flex flex-col overflow-hidden"
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
                                    <div className={`max-w-[92%] p-2.5 rounded-lg text-[12px] leading-[1.4] ${
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
                                    className="flex-1 bg-white/5 border border-white/10 rounded-md px-2 py-1.5 text-[12px] focus:outline-none text-white"
                                />
                                <button
                                    onClick={() => handleSend()}
                                    className="w-8 h-8 rounded-md bg-stellar-yellow text-black flex items-center justify-center"
                                >
                                    <Send size={14} />
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
