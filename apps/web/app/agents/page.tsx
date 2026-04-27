"use client";

import { useState, useEffect, useRef } from 'react';
import { SectionBrandLogo } from "@/components/ui/SectionBrandLogo";
import Navbar from "@/components/layout/Navbar";
import ApiKeyManager from "@/components/docs/ApiKeyManager";
import { Terminal, Activity, Signal, Shield, Radio, Code, Zap, Copy, Database, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { supabase } from "@/lib/supabase";

import { useLanguage } from '@/context/LanguageContext';

type NeuralArchiveStatus = 'connecting' | 'live' | 'error';
type SystemStatus = 'OPERATIONAL' | 'DEGRADED' | 'OFFLINE';

export default function AgentsPage() {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<'logs' | 'sdk'>('logs');
    const [syntax, setSyntax] = useState<'ts' | 'py'>('ts');
    const [sdkAsset, setSdkAsset] = useState<'XLM' | 'USDC'>('XLM');
    const [logs, setLogs] = useState<any[]>([]);
    const logContainerRef = useRef<HTMLDivElement>(null);

    // Dynamic system telemetry
    const [rpcLatency, setRpcLatency] = useState<number | null>(null);
    const [archiveStatus, setArchiveStatus] = useState<NeuralArchiveStatus>('connecting');
    const [archiveCount, setArchiveCount] = useState(0);
    const [uplinkStatus, setUplinkStatus] = useState<SystemStatus>('OPERATIONAL');
    const [logBarData, setLogBarData] = useState([40, 65, 30, 80, 50, 90, 40, 70, 45, 60]);

    // Measure live RPC latency
    useEffect(() => {
        const measureLatency = async () => {
            try {
                const start = performance.now();
                await fetch('https://horizon-testnet.stellar.org');
                const latency = Math.round(performance.now() - start);
                setRpcLatency(latency);
                setUplinkStatus(latency < 300 ? 'OPERATIONAL' : latency < 800 ? 'DEGRADED' : 'OFFLINE');
            } catch {
                setUplinkStatus('OFFLINE');
                setRpcLatency(null);
            }
        };
        measureLatency();
        const interval = setInterval(measureLatency, 15000);
        return () => clearInterval(interval);
    }, []);

    // Simulate Neural Archive decentralized storage integration
    useEffect(() => {
        // Simulate Archive connection handshake
        const connectTimer = setTimeout(() => {
            setArchiveStatus('live');
            setArchiveCount(Math.floor(Math.random() * 40) + 12);
        }, 1800);

        return () => clearTimeout(connectTimer);
    }, []);

    // Track Archive uploads when new logs arrive
    useEffect(() => {
        if (archiveStatus === 'live' && logs.length > 0) {
            // Simulate each new log being uploaded to IPFS/Archive
            setArchiveCount(prev => prev + 1);
            
            // Randomly update activity bars
            setLogBarData(prev => {
                const newData = [...prev];
                const index = Math.floor(Math.random() * newData.length);
                newData[index] = Math.floor(Math.random() * 60) + 30;
                return newData;
            });
        }
    }, [logs.length, archiveStatus]);

    // Interval to keep activity looking alive even without new logs
    useEffect(() => {
        const interval = setInterval(() => {
            setLogBarData(prev => {
                const newData = [...prev];
                // Shift left and add new random value
                const [first, ...rest] = newData;
                return [...rest, Math.floor(Math.random() * 70) + 20];
            });
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    // Supabase Realtime for Live Logs
    useEffect(() => {
        if (!supabase) return; // Guard: no Supabase config
        const db = supabase;

        // Fetch recent logs on mount
        const fetchInitialLogs = async () => {
            const { data } = await db
                .from('logs')
                .select('*')
                .order('timestamp', { ascending: false })
                .limit(30);

            if (data) {
                setLogs(data.reverse());
            }
        };
        fetchInitialLogs();

        // Subscribe to new logs in real time
        const channel = db
            .channel('agents-realtime-logs')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'logs'
            }, (payload) => {
                setLogs(prev => {
                    const exists = prev.some(l => l.id === payload.new.id);
                    if (exists) return prev;
                    return [...prev, payload.new].slice(-100);
                });
            })
            .subscribe();

        return () => {
            db.removeChannel(channel);
        };
    }, []);

    // Dynamic bar chart: update bars based on log volume
    useEffect(() => {
        const interval = setInterval(() => {
            setLogBarData(prev => {
                const shifted = [...prev.slice(1), Math.floor(Math.random() * 80 + 20)];
                return shifted;
            });
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    // Auto-scroll to bottom of logs (without scrolling the window)
    useEffect(() => {
        if (activeTab === 'logs' && logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [logs, activeTab]);

    const statusColor = (s: SystemStatus) => s === 'OPERATIONAL' ? 'bg-green-500/20 text-green-400' : s === 'DEGRADED' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400';

    const ArchiveIcon = () => {
        if (archiveStatus === 'connecting') return <Loader className="w-3 h-3 animate-spin text-blue-400" />;
        if (archiveStatus === 'live') return <CheckCircle className="w-3 h-3 text-green-400" />;
        return <AlertCircle className="w-3 h-3 text-red-400" />;
    };

    const archiveBadgeClass = archiveStatus === 'connecting'
        ? 'bg-blue-500/20 text-blue-400'
        : archiveStatus === 'live'
            ? 'bg-green-500/20 text-green-400'
            : 'bg-red-500/20 text-red-400';

    const archiveBadgeText = archiveStatus === 'connecting' 
        ? t.agents.status.connecting 
        : archiveStatus === 'live' 
            ? t.agents.status.live.replace('{n}', archiveCount.toString()) 
            : t.agents.status.error;

    const USDC_TYPE = 'USDC';
    const XLM_TYPE = 'XLM';
    const selectedCoinType = sdkAsset === 'USDC' ? USDC_TYPE : XLM_TYPE;

    return (
        <main className="min-h-screen bg-black text-white selection:bg-stellar-teal/30 overflow-hidden relative">
            <Navbar />

            {/* Background Effects */}
            <div className="fixed inset-0 z-0">
                <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-stellar-yellow/10 to-transparent opacity-50" />
                <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-stellar-teal/5 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 container mx-auto px-4 pt-32 sm:pt-40 md:pt-48 lg:pt-56 pb-20">

                {/* Header Section */}
                <div className="flex flex-col lg:flex-row items-center lg:items-center justify-between gap-12 mb-20 px-4">
                    <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-mono text-stellar-teal mb-8 self-center lg:self-start"
                        >
                            <Radio className="w-3 h-3 animate-pulse" />
                            {t.agents.status_online.replace('{v}', 'v0.5.0')}
                        </motion.div>

                        <div className="flex flex-col lg:flex-row items-center lg:items-center gap-6 mb-6">
                            <SectionBrandLogo className="!justify-start mb-0" size="w-32 lg:w-40" />
                            <motion.h1
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-3xl sm:text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-500 tracking-tight leading-none"
                            >
                                {t.agents.title}
                            </motion.h1>
                        </div>

                        <p className="text-gray-400 max-w-2xl text-lg mt-4">
                            {t.agents.subtitle.split('{strong}').map((part, i, arr) => (
                                <span key={i}>
                                    {part}
                                    {i < arr.length - 1 && <span className="text-pink-400 font-bold">{t.agents.permanent_record_strong}</span>}
                                </span>
                            ))}
                        </p>
                    </div>

                    {/* Uplink Status Card */}
                    <div className="hidden lg:block p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md min-w-[300px]">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">{t.agents.stellar_connection}</span>
                            <div className="flex gap-2">
                                <div className="w-2 h-2 rounded-full bg-stellar-teal animate-pulse" />
                                <div className="w-2 h-2 rounded-full bg-stellar-yellow animate-pulse" />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-[11px] font-mono border-b border-white/5 pb-2">
                                <span className="text-gray-500">{t.agents.latency}:</span>
                                <span className="text-stellar-teal font-bold">12ms</span>
                            </div>
                            <div className="flex justify-between items-center text-[11px] font-mono">
                                <span className="text-gray-500">{t.agents.node}:</span>
                                <span className="text-white font-bold uppercase">HORIZON-PUB1</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dashboard Grid */}
                <div className="grid lg:grid-cols-3 gap-8">

                    {/* Left Column: Telemetry */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-6"
                    >
                        <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-5 sm:p-6 relative overflow-hidden group hover:border-stellar-teal/30 transition-colors">
                            <div className="absolute inset-0 bg-gradient-to-br from-stellar-teal/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <h3 className="text-sm font-mono text-gray-400 flex items-center gap-2 mb-4">
                                <Activity className="w-4 h-4 text-stellar-teal" />
                                {t.agents.health.title}
                            </h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm">{t.agents.health.connection}</span>
                                    <span className={`text-xs px-2 py-1 rounded ${statusColor(uplinkStatus)}`}>{uplinkStatus}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm">{t.agents.health.engine}</span>
                                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">{t.agents.health.running}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm">{t.agents.health.storage}</span>
                                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">{t.agents.health.protected}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm flex items-center gap-1.5">
                                        <Database className="w-3 h-3 text-blue-400" />
                                        {t.agents.health.record}
                                    </span>
                                    <span className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${archiveBadgeClass}`}>
                                        <ArchiveIcon />
                                        {archiveBadgeText}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center pt-1 border-t border-white/5">
                                    <span className="text-sm">{t.agents.health.response_time}</span>
                                    <span className={`text-xs font-mono ${rpcLatency === null ? 'text-gray-600' : rpcLatency < 200 ? 'text-green-400' : rpcLatency < 500 ? 'text-yellow-400' : 'text-red-400'}`}>
                                        {rpcLatency === null ? t.agents.health.measuring : `${rpcLatency}ms`}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-5 sm:p-6">
                            <h3 className="text-sm font-mono text-gray-400 flex items-center gap-2 mb-4">
                                <Signal className="w-4 h-4 text-stellar-yellow" />
                                {t.agents.activity.title}
                            </h3>
                            <div className="h-32 flex items-end justify-between gap-1 px-2">
                                {logBarData.map((h, i) => (
                                    <div key={i} className="flex-1 h-full bg-white/5 rounded-t-sm relative overflow-hidden group min-w-[2px]">
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: `${h}%` }}
                                            transition={{ duration: 0.8, ease: 'easeOut' }}
                                            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-stellar-yellow to-stellar-teal w-full opacity-60 group-hover:opacity-100 transition-opacity"
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className="mt-2 text-xs text-center text-gray-500 font-mono">
                                {t.agents.activity.moves_per_minute}
                            </div>
                        </div>

                        {/* Neural Archive Panel */}
                        <div className="bg-[#0A0A0A] border border-blue-500/20 rounded-2xl p-5 sm:p-6">
                            <h3 className="text-sm font-mono text-blue-400 flex items-center gap-2 mb-3">
                                <Database className="w-4 h-4" />
                                {t.agents.record_panel.title}
                            </h3>
                            <p className="text-xs text-gray-500 mb-3 leading-relaxed">
                                {t.agents.record_panel.desc}
                            </p>
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-500">{t.agents.record_panel.saved}</span>
                                    <span className="font-mono text-blue-400">{archiveCount}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-500">{t.agents.record_panel.lives}</span>
                                    <span className="font-mono text-blue-400">Stellar</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-500">{t.agents.record_panel.how_long}</span>
                                    <span className="font-mono text-green-400">{t.agents.record_panel.forever}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Center Column: The Reactor (Key Generator) */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="relative z-20 font-sans"
                    >
                        <div className="absolute -inset-4 bg-gradient-to-r from-stellar-yellow/20 to-stellar-teal/20 blur-2xl rounded-full opacity-50 animate-pulse-slow pointer-events-none" />
                        <div className="relative bg-[#050505] rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
                            <div className="h-1 bg-gradient-to-r from-stellar-yellow via-transparent to-stellar-teal" />
                            <ApiKeyManager />
                        </div>

                        <div className="mt-8 bg-gradient-to-r from-stellar-yellow/10 to-stellar-teal/10 border border-white/10 rounded-2xl p-5 sm:p-6 mb-6">
                            <div className="flex items-center gap-3 mb-2">
                                <Terminal className="w-5 h-5 text-white" />
                                <h3 className="font-bold text-white">{t.agents.cli.title}</h3>
                                <span className="bg-stellar-teal/20 text-stellar-teal text-[10px] px-2 py-0.5 rounded font-mono">{t.agents.cli.new}</span>
                            </div>
                            <p className="text-xs text-gray-400 mb-3">{t.agents.cli.subtitle}</p>
                            <div className="bg-black/50 border border-white/5 rounded px-3 py-2 flex justify-between items-center group cursor-pointer hover:border-white/20 transition-colors"
                                onClick={() => { navigator.clipboard.writeText('npx nirium create-unit'); toast.success('Copied!'); }}>
                                <code className="text-xs font-mono text-stellar-teal">npx nirium create-unit</code>
                                <Copy className="w-3 h-3 text-gray-500 group-hover:text-white transition-colors" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <a href="https://pypi.org/project/nirium/" target="_blank" rel="noreferrer" className="p-4 bg-white/5 rounded-xl border border-white/10 text-center hover:bg-white/10 hover:border-blue-400/50 transition-colors cursor-pointer group">
                                <Code className="w-6 h-6 mx-auto mb-2 text-blue-400 group-hover:scale-110 transition-transform" />
                                <div className="text-sm font-bold">{t.agents.sdk.py}</div>
                                <div className="text-xs text-green-400">{t.agents.sdk.ready.replace('{v}', 'v0.5.0')}</div>
                            </a>
                            <a href="https://www.npmjs.com/package/nirium" target="_blank" rel="noreferrer" className="p-4 bg-white/5 rounded-xl border border-white/10 text-center hover:bg-white/10 hover:border-yellow-400/50 transition-colors cursor-pointer group">
                                <Zap className="w-6 h-6 mx-auto mb-2 text-yellow-400 group-hover:scale-110 transition-transform" />
                                <div className="text-sm font-bold">{t.agents.sdk.js}</div>
                                <div className="text-xs text-green-400">{t.agents.sdk.ready.replace('{v}', 'v0.5.0')}</div>
                            </a>
                        </div>
                    </motion.div>

                    {/* Right Column: Code Snippets & Live Logs */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="space-y-6"
                    >
                        <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-5 sm:p-6 group hover:border-stellar-teal/30 transition-colors min-h-[400px] flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-sm font-mono text-gray-400 flex items-center gap-2">
                                    <Terminal className="w-4 h-4 text-stellar-teal" />
                                    {activeTab === 'logs' ? t.agents.tabs.activity_title : t.agents.tabs.starter_title}
                                </h3>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setActiveTab('logs')}
                                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${activeTab === 'logs' ? 'bg-stellar-teal/20 text-stellar-teal' : 'bg-white/5 text-gray-500'}`}
                                    >{t.agents.tabs.logs}</button>
                                    <button
                                        onClick={() => setActiveTab('sdk')}
                                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${activeTab === 'sdk' ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-gray-500'}`}
                                    >{t.agents.tabs.sdk}</button>
                                </div>
                            </div>

                            {activeTab === 'logs' ? (
                                <div 
                                    ref={logContainerRef}
                                    className="bg-black rounded-lg p-4 font-mono text-xs text-gray-300 overflow-y-auto border border-white/5 shadow-inner flex-grow h-[300px] scrollbar-thin scrollbar-thumb-white/10"
                                >
                                    <div className="space-y-1">
                                        {logs.length === 0 && (
                                            <div className="text-gray-600 italic">{t.agents.tabs.waiting}</div>
                                        )}
                                        {logs.map((log, i) => {
                                            const parts = log.message.split('|');
                                            const mainMsg = parts[0];
                                            const hashPart = parts[1];
                                            
                                            return (
                                                <div key={i} className="break-all flex flex-wrap gap-x-1">
                                                    <span className="text-gray-600">[{new Date(log.timestamp).toLocaleTimeString()}]</span>{' '}
                                                    <span className={`${log.level === 'error' ? 'text-red-500' :
                                                        log.level === 'warn' ? 'text-yellow-500' :
                                                            log.level === 'success' ? 'text-green-400' :
                                                                log.level === 'system' ? 'text-stellar-teal' :
                                                                    'text-blue-400'
                                                        }`}>
                                                        {log.level?.toUpperCase()}
                                                    </span>{' '}
                                                    <span className="text-gray-300">{mainMsg}</span>
                                                    {hashPart && (
                                                        <span className="text-stellar-yellow/80 font-bold bg-white/5 px-1 rounded">
                                                            {hashPart.trim()}
                                                        </span>
                                                    )}
                                                    {archiveStatus === 'live' && (
                                                        <span className="text-blue-500/40 text-[9px] flex items-center">⬆ {t.agents.tabs.archive}</span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-black rounded-lg p-4 font-mono text-xs text-gray-300 overflow-x-auto border border-white/5 shadow-inner flex-grow flex flex-col">
                                    {/* Asset + Language toggles */}
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="flex items-center bg-black/40 border border-white/10 rounded-lg p-0.5">
                                            <button
                                                onClick={() => setSdkAsset('USDC')}
                                                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${sdkAsset === 'USDC' ? 'bg-stellar-yellow text-white' : 'text-gray-500 hover:text-white'}`}
                                            >USDC</button>
                                            <button
                                                onClick={() => setSdkAsset('XLM')}
                                                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${sdkAsset === 'XLM' ? 'bg-[#4ca2ff] text-white' : 'text-gray-500 hover:text-white'}`}
                                            >XLM</button>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => setSyntax('ts')} className={`text-[10px] font-bold ${syntax === 'ts' ? 'text-blue-400' : 'text-gray-600'}`}>TS</button>
                                            <button onClick={() => setSyntax('py')} className={`text-[10px] font-bold ${syntax === 'py' ? 'text-yellow-400' : 'text-gray-600'}`}>PY</button>
                                        </div>
                                    </div>

                                    {/* Code preview */}
                                    <div className="h-[260px] overflow-y-auto">
                                        {syntax === 'ts' ? (
                                            <div className="space-y-1">
                                                <div><span className="text-purple-400">import</span> {"{"} Agent {"}"} <span className="text-purple-400">from</span> <span className="text-green-400">&apos;@nirium/sdk&apos;</span>;</div>
                                                <div className="h-2" />
                                                <div className="text-gray-500">{'// Coin type for vault'}</div>
                                                <div><span className="text-blue-400">const</span> COIN_TYPE = <span className="text-yellow-300">&apos;{selectedCoinType.slice(0, 30)}...&apos;</span>;</div>
                                                <div className="h-2" />
                                                <div className="text-gray-500">{'// Initialize Unit'}</div>
                                                <div><span className="text-blue-400">const</span> bot = <span className="text-blue-400">new</span> Agent({"{"}</div>
                                                <div className="pl-4">apiKey: <span className="text-yellow-300">&apos;sk_live_...&apos;</span>,</div>
                                                <div className="pl-4">asset: <span className="text-yellow-300">&apos;{sdkAsset}&apos;</span>,</div>
                                                <div className="pl-4">coinType: COIN_TYPE,</div>
                                                <div>{"}"});</div>
                                                <div className="h-2" />
                                                <div className="text-gray-500">{'// Subscribe to signals'}</div>
                                                <div>bot.subscribe((<span className="text-orange-300">signal</span>) ={">"} {"{"}</div>
                                                <div className="pl-4"><span className="text-blue-400">if</span> (signal.asset === <span className="text-yellow-300">&apos;{sdkAsset}&apos;</span>) {"{"}</div>
                                                <div className="pl-8">bot.execute(<span className="text-green-400">&apos;liquidity-rebalance&apos;</span>, signal);</div>
                                                <div className="pl-4">{"}"}</div>
                                                <div>{"}"});</div>
                                            </div>
                                        ) : (
                                            <div className="space-y-1">
                                                <div><span className="text-purple-400">from</span> nirium <span className="text-purple-400">import</span> Agent</div>
                                                <div className="h-2" />
                                                <div className="text-gray-500"># Coin type for vault</div>
                                                <div>COIN_TYPE = <span className="text-yellow-300">&quot;{selectedCoinType.slice(0, 24)}...&quot;</span></div>
                                                <div className="h-2" />
                                                <div className="text-gray-500"># Initialize Unit</div>
                                                <div>bot = Agent(</div>
                                                <div className="pl-4">api_key=<span className="text-yellow-300">&quot;sk_live_...&quot;</span>,</div>
                                                <div className="pl-4">asset=<span className="text-yellow-300">&quot;{sdkAsset}&quot;</span>,</div>
                                                <div className="pl-4">coin_type=COIN_TYPE</div>
                                                <div>)</div>
                                                <div className="h-2" />
                                                <div className="text-gray-500"># Exec strategy</div>
                                                <div><span className="text-purple-400">async for</span> signal <span className="text-purple-400">in</span> bot.listen():</div>
                                                <div className="pl-4"><span className="text-blue-400">if</span> signal[<span className="text-green-400">&apos;asset&apos;</span>] == <span className="text-yellow-300">&quot;{sdkAsset}&quot;</span>:</div>
                                                <div className="pl-8">bot.execute(<span className="text-green-400">&quot;liquidity-rebalance&quot;</span>, signal)</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <p className="mt-4 text-xs text-gray-500">
                                {activeTab === 'logs'
                                    ? t.agents.tabs.live_updates.replace('{n}', archiveCount.toString())
                                    : t.agents.tabs.starter_desc.replace('{asset}', sdkAsset)}
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-stellar-yellow/20 to-transparent border border-stellar-yellow/30 rounded-2xl p-5 sm:p-8">
                            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                                <Shield className="w-4 h-4 text-stellar-yellow" />
                                {t.agents.built_safe.title}
                            </h3>
                            <p className="text-xs text-gray-300 leading-relaxed opacity-80">
                                {t.agents.built_safe.desc}
                            </p>
                            <button
                                onClick={() => {
                                    const downloadPromise = new Promise<void>((resolve) => {
                                        setTimeout(() => {
                                            const auditData = {
                                                audit_id: `BLK-BOX-${Date.now()}`,
                                                timestamp: new Date().toISOString(),
                                                archive_status: archiveStatus,
                                                archive_blobs_committed: archiveCount,
                                                rpc_latency_ms: rpcLatency,
                                                agent_integrity: "100%",
                                                enclave_signature: "0x8a2f...3b1c",
                                                supported_assets: ['XLM', 'USDC'],
                                                system_events: logs.length > 0 ? logs : [
                                                    { level: "system", message: "System initialization sequence started", timestamp: new Date(Date.now() - 1000000).toISOString() },
                                                    { level: "success", message: "Neural Uplink established", timestamp: new Date(Date.now() - 900000).toISOString() }
                                                ]
                                            };

                                            const blob = new Blob([JSON.stringify(auditData, null, 2)], { type: 'application/json' });
                                            const url = window.URL.createObjectURL(blob);
                                            const a = document.createElement('a');
                                            a.style.display = 'none';
                                            a.href = url;
                                            a.download = 'nirium-audit.json';
                                            document.body.appendChild(a);
                                            a.click();
                                            window.URL.revokeObjectURL(url);
                                            document.body.removeChild(a);
                                            resolve();
                                        }, 1500);
                                    });

                                    toast.promise(downloadPromise, {
                                        loading: t.agents.audit.preparing,
                                        success: t.agents.audit.success,
                                        error: t.agents.audit.error
                                    });

                                    setLogs(prev => [...prev, {
                                        level: 'system',
                                        message: t.agents.audit.requested,
                                        timestamp: new Date().toISOString()
                                    }]);
                                }}
                                className="mt-4 w-full py-2 bg-stellar-yellow/20 hover:bg-stellar-yellow/30 text-stellar-yellow border border-stellar-yellow/50 rounded-lg text-xs font-bold transition-all hover:shadow-[0_0_15px_rgba(168,85,247,0.3)] active:scale-95"
                            >
                                {t.agents.audit.button}
                            </button>
                        </div>
                    </motion.div>

                </div>
            </div>
        </main>
    );
}
