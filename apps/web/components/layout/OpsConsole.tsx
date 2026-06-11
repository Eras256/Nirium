"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Terminal, Maximize2, Brain, CreditCard, Shield, Cpu, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';

// Render a feed message, turning verifiable identifiers into clickable links:
// 64-char Stellar tx hashes → stellar.expert testnet, IPFS CIDs (Qm…) → Pinata gateway.
function renderMessageWithTxLink(text: string) {
    const re = /\b([a-f0-9]{64})\b|\b(Qm[1-9A-HJ-NP-Za-km-z]{44})\b/g;
    const parts: React.ReactNode[] = [];
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
        const token = m[0];
        const href = m[1]
            ? `https://stellar.expert/explorer/testnet/tx/${token}`
            : `https://gateway.pinata.cloud/ipfs/${token}`;
        parts.push(text.slice(last, m.index));
        parts.push(
            <a
                key={`${token}-${m.index}`}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-stellar-teal underline decoration-stellar-teal/40 hover:decoration-stellar-teal break-all"
            >
                {token}
            </a>
        );
        last = m.index + token.length;
    }
    if (parts.length === 0) return text;
    parts.push(text.slice(last));
    return <>{parts}</>;
}

const DEMO_LOGS = [
    { agent_id: 'Protocol', message: 'System connection established. Execution network broadcasting on-chain...', level: 'system', created_at: new Date().toISOString() },
    { agent_id: 'Titan', message: 'Vault architecture synchronized — 3 asset classes active', level: 'info', created_at: new Date().toISOString() },
    { agent_id: 'Astra', message: 'Liquidity route optimized for USDC — Spread minimized', level: 'success', created_at: new Date().toISOString() },
];

function formatTime(ts: string) {
    const d = new Date(ts);
    return `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}:${d.getSeconds().toString().padStart(2,'0')}`;
}

export default function OpsConsole({ isExpanded, onToggleExpand, walletAddress, heightClass }: { isExpanded: boolean, onToggleExpand: () => void, walletAddress?: string, heightClass?: string }) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    
    const [logs, setLogs] = useState<any[]>(DEMO_LOGS);
    const [status, setStatus] = useState<'connecting' | 'online' | 'unavailable'>('connecting');
    const logContainerRef = useRef<HTMLDivElement>(null);
    const lastIdRef = useRef<string | null>(null);

    const fetchLogs = useCallback(async () => {
        try {
            const res = await fetch('/api/logs');
            if (!res.ok) {
                setStatus('unavailable');
                return;
            }
            const rows: any[] = await res.json();
            setStatus('online');
            
            if (rows) {
                const newestId = rows[0]?.id;
                if (newestId !== lastIdRef.current) {
                    lastIdRef.current = newestId;
                    setLogs(rows.length > 0 ? rows.reverse() : []);
                } else if (rows.length === 0 && logs.length !== 0) {
                    setLogs([]);
                }
            }
        } catch (e) {
            console.warn('[Telemetry Feed] Fetch error:', e);
            setStatus('unavailable');
        }
    }, [logs.length]);

    useEffect(() => {
        fetchLogs();
        const poll = setInterval(fetchLogs, 4000);
        return () => clearInterval(poll);
    }, [fetchLogs]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setStatus(prev => prev === 'connecting' ? 'unavailable' : prev);
        }, 12000);
        return () => clearTimeout(timeout);
    }, []);

    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [logs]);

    const statusColors = {
        connecting: { dot: 'bg-yellow-400', text: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20', label: 'CONNECTING' },
        online: { dot: 'bg-green-400', text: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20', label: 'ONLINE' },
        unavailable: { dot: 'bg-gray-500', text: 'text-gray-400', bg: 'bg-gray-500/10 border-gray-500/20', label: 'UNAVAILABLE' },
    };
    const s = statusColors[status];

    const { t } = useLanguage();
    
    return (
        <motion.div
            layout
            className={`bg-[#050505] border border-white/10 rounded-xl overflow-hidden flex flex-col transition-all duration-300 ${isExpanded ? 'fixed inset-4 z-[100] h-auto shadow-2xl' : (heightClass || 'h-full')}`}
        >
            <div className="bg-white/5 border-b border-white/5 px-4 py-3 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-stellar-teal" />
                    <span className="text-xs font-mono font-bold text-gray-300 uppercase tracking-widest">{t.dashboard.telemetry_feed.uplink}</span>
                    <span className={`flex items-center gap-1.5 ml-2 px-1.5 py-0.5 rounded ${s.bg} text-[10px] ${s.text} border`}>
                        <span className={`w-1 h-1 rounded-full ${s.dot} ${status === 'online' ? 'animate-pulse' : ''}`}></span>
                        {s.label}
                    </span>
                </div>
                <button onClick={onToggleExpand} className="text-gray-500 hover:text-white transition-colors">
                    {isExpanded ? <Maximize2 size={16} /> : <Maximize2 size={16} />}
                </button>
            </div>

            <div ref={logContainerRef} className="flex-1 bg-black/50 p-4 font-mono text-[10px] overflow-y-auto custom-scrollbar min-h-0">
                <div className="space-y-1.5">
                    {status === 'unavailable' && (
                        <div className="text-yellow-600 italic">No database connection.</div>
                    )}
                    <AnimatePresence mode="popLayout">
                    {logs.map((log, i) => {
                        const rawMsg = (log.message || '');
                        let mainMsg = (rawMsg.split('|')[0] || '').replace(/IPFS:\s*\S+/gi, '').replace(/\s{2,}/g, ' ').trim();
                        // El recorte en '|' oculta el CID de los batches IPFS — re-adjuntarlo para que salga clickeable.
                        const cidMatch = rawMsg.match(/\b(Qm[1-9A-HJ-NP-Za-km-z]{44})\b/);
                        if (cidMatch && !mainMsg.includes(cidMatch[1])) mainMsg += ` — CID: ${cidMatch[1]}`;
                        // Igual para el TX hash: la línea "✅ On-chain execution confirmed" lo lleva tras un '|'.
                        const txMatch = rawMsg.match(/\b([a-f0-9]{64})\b/);
                        if (txMatch && !mainMsg.includes(txMatch[1])) mainMsg += ` — TX: ${txMatch[1]}`;

                        // Detect agent type for branding
                        const isIntelligence = log.agent_id === 'INTELLIGENCE';
                        const isSettlement = log.agent_id === 'x402' || log.agent_id === 'MPP' || log.agent_id === 'SETTLEMENT' || log.source === 'horizon';
                        const isX402 = log.agent_id === 'x402';
                        const isMPP = log.agent_id === 'MPP';
                        const isSystem = log.level === 'system' || log.agent_id === 'Protocol';
                        const isPayment = log.agent_id?.includes('GATEWAY') || log.level === 'payment';
                        
                        return (
                            <motion.div 
                                initial={{ opacity: 0, x: -10 }} 
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                key={log.id || i} 
                                className={`group relative flex flex-col gap-1.5 py-2 px-3 rounded-lg border-l-2 mb-1 transition-all ${
                                    isSettlement ? 'bg-stellar-teal/5 border-stellar-teal/30 hover:bg-stellar-teal/10' :
                                    isIntelligence ? 'bg-pink-500/5 border-pink-500/30 hover:bg-pink-500/10' :
                                    'bg-white/[0.02] border-white/10 hover:bg-white/[0.04]'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[8px] text-gray-500 font-mono">
                                            [{mounted ? formatTime(log.created_at || log.timestamp) : '--:--:--'}]
                                        </span>
                                        
                                        <div className="flex items-center gap-1.5">
                                            {isIntelligence && <Brain className="w-3 h-3 text-pink-400" />}
                                            {(isSettlement || isX402) && <Zap className="w-3 h-3 text-stellar-yellow" />}
                                            {isMPP && <Shield className="w-3 h-3 text-purple-400" />}
                                            {isSystem && <Cpu className="w-3 h-3 text-stellar-teal" />}
                                            {isPayment && <CreditCard className="w-3 h-3 text-blue-400" />}
                                            
                                            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter ${
                                                isIntelligence ? 'bg-pink-500/20 text-pink-400' :
                                                isSettlement ? 'bg-stellar-yellow/20 text-stellar-yellow' :
                                                'bg-white/10 text-gray-400'
                                            }`}>
                                                {log.agent_id}
                                            </span>
                                        </div>
                                    </div>

                                    <span className={`${
                                        log.level === 'error' ? 'text-red-500' :
                                        log.level === 'warn' ? 'text-yellow-500' :
                                        log.level === 'success' ? 'text-green-400' :
                                        log.level === 'system' ? 'text-stellar-teal' :
                                        'text-blue-400/50'
                                    } font-mono text-[8px] tracking-widest uppercase`}>
                                        {log.level}
                                    </span>
                                </div>

                                <div className="pl-1">
                                    <span className={`leading-relaxed text-[10px] ${
                                        isSettlement ? 'text-stellar-teal font-medium' : 'text-gray-300'
                                    }`}>
                                        {renderMessageWithTxLink(mainMsg.replace(/Soroban Intelligence: /i, ''))}
                                    </span>
                                </div>
                            </motion.div>
                        );
                    })}
                    </AnimatePresence>
                </div>
            </div>
            {/* Deployed Contracts Footer */}
            <div className="shrink-0 border-t border-white/5 bg-black/30 px-4 py-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="text-[7px] font-mono text-white/20 uppercase tracking-[0.2em]">Soroban Testnet</span>
                <div className="h-2 w-px bg-white/10 hidden sm:block" />
                <a
                    href="https://stellar.expert/explorer/testnet/contract/CBTWMZCG3P72EHFAQ4ZLSEBIOFYJC244H5J6DHZIJ56FHFWJ2CFAWSZU"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 group"
                >
                    <span className="text-[7px] font-mono text-white/20 group-hover:text-stellar-teal/60 transition-colors">NiriumVault</span>
                    <span className="text-[7px] font-mono text-stellar-teal/40 group-hover:text-stellar-teal transition-colors tracking-wider">CBTWMZ…AWSZU</span>
                </a>
                <div className="h-2 w-px bg-white/10 hidden sm:block" />
                <a
                    href="https://stellar.expert/explorer/testnet/contract/CC2TU5BDTKTPRRRQPEF77I54XYHFQ25XGIRO2TCWKSR7NRJDFR5L5NR5"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 group"
                >
                    <span className="text-[7px] font-mono text-white/20 group-hover:text-stellar-teal/60 transition-colors">NiriumProtocol</span>
                    <span className="text-[7px] font-mono text-stellar-teal/40 group-hover:text-stellar-teal transition-colors tracking-wider">CC2TU5…L5NR5</span>
                </a>
            </div>
        </motion.div>
    );
}
