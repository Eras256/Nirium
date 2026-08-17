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
                greeting = "¡Hola! Soy la IA de Nirium. Estoy aquí para ayudarte con dudas técnicas. Recuerda: no proporciono asesoría financiera y sigo el Código de Conducta de Stellar.";
            } else {
                greeting = "Hello! I am Nirium AI. I'm here for technical help. Remember: I do not provide financial advice and I follow the Stellar Code of Conduct.";
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
        
        // Comprehensive Expert Knowledge Base (July 2026)
        const kb: Record<string, any> = {
            es: {
                home: "**Nirium** es la primera capa de automatización de tesorería institucional sobre Stellar.\n\nNo custodial — el usuario controla las llaves. Impulsado por **x402 + MPP + Soroban**.\n\n→ [Inicio](/) · [Treasury](/treasury) · [Docs](/docs)",
                dashboard: "El [Dashboard](/dashboard) centraliza el control de tus agentes.\n\nMonitorea actividad de protocolo, nodos en ejecución y flujos de CETES en tiempo real.",
                marketplace: "El [Marketplace](/marketplace) ofrece kernels pre-configurados para optimización de ruteo FX y gestión de liquidez institucional.\n\nCada kernel corre en Soroban — atómico, auditable, no custodial.",
                treasury: "La sección de [Tesorería](/treasury) gestiona tus bóvedas Soroban **2-de-3 multisig** y reglas de flujo de caja.\n\nActivos soportados: **XLM · USDC · CETES**\nProveedor: Etherfuse (0.2% all-in)",
                analytics: "La sección de [Analytics](/analytics) proporciona una vista forense de cada transacción — criptográficamente firmada, anclada en IPFS.",
                fiat: "Para obtener CETES tokenizados contratas directamente con **Etherfuse**, operador regulado: tú le transfieres a su CLABE y ellos emiten el token a tu wallet.\n\n**Nirium nunca recibe, sostiene ni convierte fiat** — solo muestra la instrucción y lee el saldo. El KYC lo hace Etherfuse. Hoy en sandbox: [ver flujo](/ramp).",
                devs: "La sección de [Developers](/developers) expone **86 endpoints REST**, SDK TypeScript/Python, servidor MCP para Claude/Cursor, y soporte nativo para **x402 + MPP**.",
                docs: {
                    overview: "Visión general de Nirium v0.10.2: [Ver Documentación](/docs?tab=overview).",
                    api: "API Sandbox: Gestiona tus llaves y explora endpoints en [Docs > API](/docs?tab=api).",
                    blueprints: "Casos técnicos listos para clonar en [Docs > Blueprints](/docs?tab=blueprints).",
                    architecture: "Arquitectura del protocolo: [Docs > Architecture](/docs?tab=architecture).",
                    contracts: "Contratos Soroban: Direcciones verificadas en [Docs > Contracts](/docs?tab=contracts).",
                    agent: "Lógica de Nodos: Sistema ELO y autonomía en [Docs > Agent](/docs?tab=agent).",
                    builder: "Visual Builder: Crea reglas sin código en [Docs > Builder](/docs?tab=builder).",
                    frontend: "Integración UI: Componentes React en [Docs > Frontend](/docs?tab=frontend).",
                    security: "Auditoría forense + HMAC-SHA256: [Docs > Security](/docs?tab=security)."
                },
                scf: "Nirium es beneficiario de SCF Kickstart y sigue:\n\n**· Código de Conducta Stellar**\n**· Estándares del Ecosistema SDF** — sin garantías de rendimiento\n\nMás info en [Docs > Security](/docs?tab=security).",
                compliance: "La página de [Compliance](/compliance) genera reportes auditables en formato **audit-ready**.\n\nCada acción del agente: firmada HMAC-SHA256 → encadenada → anclada IPFS → exportable JSON.",
                default: "Soy el asistente técnico de Nirium. Puedo guiarte a:\n\n[Dashboard](/dashboard) · [Treasury](/treasury) · [Developers](/developers) · [Docs](/docs) · [Compliance](/compliance)\n\n¿Qué necesitas?"
            },
            en: {
                home: "**Nirium** is the first institutional treasury automation layer on Stellar.\n\nNon-custodial — users control keys. Powered by **x402 + MPP + Soroban**.\n\n→ [Home](/) · [Treasury](/treasury) · [Docs](/docs)",
                dashboard: "The [Dashboard](/dashboard) centralizes agent control.\n\nMonitor protocol activity, running nodes, and CETES flows in real-time.",
                marketplace: "The [Marketplace](/marketplace) offers pre-built kernels for liquidity routing optimization and institutional treasury management.\n\nEach kernel runs on Soroban — atomic, auditable, non-custodial.",
                treasury: "The [Treasury](/treasury) section manages your Soroban **2-of-3 multisig** vaults and automated cash-flow rules.\n\nSupported assets: **XLM · USDC · CETES**\nProvider: Etherfuse (0.2% all-in)",
                analytics: "The [Analytics](/analytics) section provides a forensic view of every transaction — cryptographically signed and IPFS-anchored.",
                fiat: "To get tokenized CETES you contract directly with **Etherfuse**, a regulated operator: you transfer to their CLABE and they issue the token to your wallet.\n\n**Nirium never receives, holds or converts fiat** — we only show the instruction and read the balance. KYC is done by Etherfuse. Sandbox today: [see the flow](/ramp).",
                devs: "The [Developers](/developers) section exposes **86 REST endpoints**, TypeScript/Python SDK, MCP server for Claude/Cursor, and native **x402 + MPP** support.",
                docs: {
                    overview: "Nirium v0.10.2 overview: [View Documentation](/docs?tab=overview).",
                    api: "API Sandbox: Manage keys and explore endpoints at [Docs > API](/docs?tab=api).",
                    blueprints: "Technical use cases ready to clone at [Docs > Blueprints](/docs?tab=blueprints).",
                    architecture: "Protocol architecture: [Docs > Architecture](/docs?tab=architecture).",
                    contracts: "Soroban contract addresses: [Docs > Contracts](/docs?tab=contracts).",
                    agent: "Node logic + ELO system: [Docs > Agent](/docs?tab=agent).",
                    builder: "Visual drag-and-drop builder: [Docs > Builder](/docs?tab=builder).",
                    frontend: "React component integration: [Docs > Frontend](/docs?tab=frontend).",
                    security: "Forensic audit + HMAC-SHA256: [Docs > Security](/docs?tab=security)."
                },
                scf: "Nirium is an SCF Kickstart grantee and follows:\n\n**· Stellar Code of Conduct**\n**· SDF Ecosystem Standards** — no yield guarantees\n\nRead more at [Docs > Security](/docs?tab=security).",
                compliance: "The [Compliance](/compliance) page generates auditable reports in **audit-ready** format.\n\nEvery agent action: HMAC-SHA256 signed → cryptographically chained → IPFS-anchored → JSON export.",
                default: "I'm Nirium's technical assistant. I can guide you to:\n\n[Dashboard](/dashboard) · [Treasury](/treasury) · [Developers](/developers) · [Docs](/docs) · [Compliance](/compliance)\n\nWhat do you need?"
            }
        };

        const currentKB = kb[lang as keyof typeof kb] || kb.en;

        if (q.includes('qué es') || q.includes('que es') || q.includes('what is')) return currentKB.home;

        // Documentation sub-topics
        if (q.includes('doc') || q.includes('guía') || q.includes('guide')) {
            if (q.includes('api') || q.includes('key') || q.includes('sand') || q.includes('sandbox')) return currentKB.docs.api;
            if (q.includes('arch') || q.includes('fleet') || q.includes('kernel')) return currentKB.docs.architecture;
            if (q.includes('contrat') || q.includes('soroban') || q.includes('direcc')) return currentKB.docs.contracts;
            if (q.includes('agent') || q.includes('elo') || q.includes('skill')) return currentKB.docs.agent;
            if (q.includes('build') || q.includes('regla') || q.includes('visual')) return currentKB.docs.builder;
            if (q.includes('secur') || q.includes('segur') || q.includes('audit')) return currentKB.docs.security;
            if (q.includes('front') || q.includes('react') || q.includes('ui')) return currentKB.docs.frontend;
            return currentKB.docs.overview;
        }

        if (q.includes('dash') || q.includes('panel')) return currentKB.dashboard;
        if (q.includes('market') || q.includes('estrat') || q.includes('strat') || q.includes('kernel')) return currentKB.marketplace;
        if (q.includes('treas') || q.includes('tesor') || q.includes('vault') || q.includes('bóveda')) return currentKB.treasury;
        if (q.includes('analyt') || q.includes('analit') || q.includes('data')) return currentKB.analytics;
        if (q.includes('fiat') || q.includes('ramp') || q.includes('hub') || q.includes('cetes') || q.includes('spei') || q.includes('mxn')) return currentKB.fiat;
        if (q.includes('compli') || q.includes('cnbv') || q.includes('audit') || q.includes('hmac')) return currentKB.compliance;
        if (q.includes('dev') || q.includes('sdk') || q.includes('endpoint')) return currentKB.devs;
        if (q.includes('api') || q.includes('sand') || q.includes('sandbox') || q.includes('prueb')) return currentKB.docs.api;
        if (q.includes('build') || q.includes('blueprint') || q.includes('construir') || q.includes('visual')) return currentKB.docs.builder;
        if (q.includes('scf') || q.includes('award') || q.includes('conducta') || q.includes('norma') || q.includes('rule') || q.includes('conduct')) return currentKB.scf;

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
                className="fixed bottom-4 right-4 z-[100] w-12 h-12 sm:w-10 sm:h-10 rounded-full bg-stellar-yellow text-[#0b0b0b] shadow-lg flex items-center justify-center border border-white/10"
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
                                    <img src="/brand/logo.png" alt="Nirium Logo" className="w-full h-full object-contain" />
                                </div>
                                <h3 className="text-[11px] font-bold uppercase text-white tracking-tighter">Nirium AI</h3>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="flex items-center bg-white/5 border border-white/10 rounded p-0.5">
                                    {(['en', 'es'] as const).map((lang) => (
                                        <button
                                            key={lang}
                                            onClick={() => setLanguage(lang)}
                                            className={`px-1.5 py-0.5 text-[8px] font-black rounded uppercase ${
                                                language === lang ? 'bg-stellar-yellow text-[#0b0b0b]' : 'text-zinc-600'
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
                                            : 'bg-stellar-yellow text-[#0b0b0b] font-bold'
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
                                    className="w-7 h-7 rounded-md bg-stellar-yellow text-[#0b0b0b] flex items-center justify-center"
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
