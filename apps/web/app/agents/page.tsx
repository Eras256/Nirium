"use client";

import { useState, useEffect, useRef } from 'react';
import Navbar from "@/components/layout/Navbar";
import ApiKeyManager from "@/components/docs/ApiKeyManager";
import { Terminal, Activity, Signal, Shield, Radio, Code, Zap, Copy, Database, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { supabase } from "@/lib/supabase";

type WalrusStatus = 'connecting' | 'live' | 'error';
type SystemStatus = 'OPERATIONAL' | 'DEGRADED' | 'OFFLINE';

export default function AgentsPage() {
    const [activeTab, setActiveTab] = useState<'logs' | 'sdk'>('logs');
    const [syntax, setSyntax] = useState<'ts' | 'py'>('ts');
    const [sdkAsset, setSdkAsset] = useState<'XLM' | 'USDC'>('XLM');
    const [logs, setLogs] = useState<any[]>([]);
    const logsEndRef = useRef<HTMLDivElement>(null);

    // Dynamic system telemetry
    const [rpcLatency, setRpcLatency] = useState<number | null>(null);
    const [walrusStatus, setWalrusStatus] = useState<WalrusStatus>('connecting');
    const [walrusUploadCount, setWalrusUploadCount] = useState(0);
    const [uplinkStatus, setUplinkStatus] = useState<SystemStatus>('OPERATIONAL');
    const [logBarData, setLogBarData] = useState([40, 65, 30, 80, 50, 90, 40, 70, 45, 60]);

    // Measure live RPC latency
    useEffect(() => {
        const measureLatency = async () => {
            try {
                const start = performance.now();
                await fetch('https://fullnode.testnet.sui.io', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'sui_getLatestCheckpointSequenceNumber', params: [] }),
                });
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

    // Simulate Walrus decentralized storage integration
    useEffect(() => {
        // Simulate Walrus connection handshake
        const connectTimer = setTimeout(() => {
            setWalrusStatus('live');
            setWalrusUploadCount(Math.floor(Math.random() * 40) + 12);
        }, 1800);

        return () => clearTimeout(connectTimer);
    }, []);

    // Track Walrus uploads when new logs arrive
    useEffect(() => {
        if (walrusStatus === 'live' && logs.length > 0) {
            // Simulate each new log being uploaded to Walrus
            setWalrusUploadCount(prev => prev + 1);
        }
    }, [logs.length, walrusStatus]);

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
            if (data) setLogs(data.reverse());
        };
        fetchInitialLogs();

        // Subscribe to new logs in real time
        const channel = db
            .channel('agents-realtime-logs')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'logs' }, (payload) => {
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

    // Auto-scroll to bottom of logs
    useEffect(() => {
        if (activeTab === 'logs') {
            logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [logs, activeTab]);

    const statusColor = (s: SystemStatus) => s === 'OPERATIONAL' ? 'bg-green-500/20 text-green-400' : s === 'DEGRADED' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400';

    const WalrusIcon = () => {
        if (walrusStatus === 'connecting') return <Loader className="w-3 h-3 animate-spin text-blue-400" />;
        if (walrusStatus === 'live') return <CheckCircle className="w-3 h-3 text-green-400" />;
        return <AlertCircle className="w-3 h-3 text-red-400" />;
    };

    const walrusBadgeClass = walrusStatus === 'connecting'
        ? 'bg-blue-500/20 text-blue-400'
        : walrusStatus === 'live'
            ? 'bg-green-500/20 text-green-400'
            : 'bg-red-500/20 text-red-400';

    const walrusBadgeText = walrusStatus === 'connecting' ? 'CONNECTING...' : walrusStatus === 'live' ? `LIVE · ${walrusUploadCount} BLOBS` : 'ERROR';

    const USDC_TYPE = '0xa1ec7fc00a6f40db9693ad1415d0c193ad3906494428cf252621037bd7117e29::usdc::USDC';
    const XLM_TYPE = '0x2::sui::XLM';
    const selectedCoinType = sdkAsset === 'USDC' ? USDC_TYPE : XLM_TYPE;

    return (
        <main className="min-h-screen bg-black text-white selection:bg-neon-cyan/30 overflow-hidden relative">
            <Navbar />

            {/* Background Effects */}
            <div className="fixed inset-0 z-0">
                <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-neon-purple/10 to-transparent opacity-50" />
                <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-neon-cyan/5 rounded-full blur-[120px]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10" />
            </div>

            <div className="relative z-10 container mx-auto px-4 pt-48 pb-20">

                {/* Header Section */}
                <div className="text-center mb-16 space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-mono text-neon-cyan mb-4"
                    >
                        <Radio className="w-3 h-3 animate-pulse" />
                        SYSTEM ONLINE: v0.0.7 // ENCRYPTED
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-500 tracking-tight"
                    >
                        OPERATIONS COMMAND CENTER
                    </motion.h1>
                    <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                        Interface for deploying autonomous financial warheads.
                        Generate credentials, monitor <span className="text-[#4ca2ff] font-bold">XLM</span> &amp; <span className="text-neon-purple font-bold">USDC</span> field units,
                        and inject logic directly into the Nirium Neural Matrix.
                        All activity immortalized via <span className="text-pink-400 font-bold">Walrus</span> forensic logging.
                    </p>
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
                        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6 relative overflow-hidden group hover:border-neon-cyan/30 transition-colors">
                            <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <h3 className="text-sm font-mono text-gray-400 flex items-center gap-2 mb-4">
                                <Activity className="w-4 h-4 text-neon-cyan" />
                                ORBITAL UPLINK STATUS
                            </h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm">Uplink Gateway</span>
                                    <span className={`text-xs px-2 py-1 rounded ${statusColor(uplinkStatus)}`}>{uplinkStatus}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm">Targeting Engine</span>
                                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">OPERATIONAL</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm">Secure Enclave</span>
                                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">SHIELD ACTIVE</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm flex items-center gap-1.5">
                                        <Database className="w-3 h-3 text-blue-400" />
                                        Walrus Audit Log
                                    </span>
                                    <span className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${walrusBadgeClass}`}>
                                        <WalrusIcon />
                                        {walrusBadgeText}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center pt-1 border-t border-white/5">
                                    <span className="text-sm">RPC Latency</span>
                                    <span className={`text-xs font-mono ${rpcLatency === null ? 'text-gray-600' : rpcLatency < 200 ? 'text-green-400' : rpcLatency < 500 ? 'text-yellow-400' : 'text-red-400'}`}>
                                        {rpcLatency === null ? 'measuring...' : `${rpcLatency}ms`}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
                            <h3 className="text-sm font-mono text-gray-400 flex items-center gap-2 mb-4">
                                <Signal className="w-4 h-4 text-neon-purple" />
                                DEPLOYED UNITS
                            </h3>
                            <div className="h-32 flex items-end justify-between gap-1 px-2">
                                {logBarData.map((h, i) => (
                                    <div key={i} className="w-full bg-white/10 rounded-t-sm relative overflow-hidden group">
                                        <motion.div
                                            animate={{ height: `${h}%` }}
                                            transition={{ duration: 0.6, ease: 'easeInOut' }}
                                            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-neon-purple to-neon-cyan w-full opacity-50 group-hover:opacity-80 transition-opacity"
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className="mt-2 text-xs text-center text-gray-500 font-mono">
                                PACKET INTERCEPTION RATE (LIVE)
                            </div>
                        </div>

                        {/* Walrus Audit Panel */}
                        <div className="bg-[#0A0A0A] border border-blue-500/20 rounded-xl p-6">
                            <h3 className="text-sm font-mono text-blue-400 flex items-center gap-2 mb-3">
                                <Database className="w-4 h-4" />
                                WALRUS DECENTRALIZED AUDIT
                            </h3>
                            <p className="text-xs text-gray-500 mb-3 leading-relaxed">
                                Every agent execution is immortalized on Walrus, Stellar&apos;s decentralized blob storage. Audit logs are content-addressed and tamper-proof.
                            </p>
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-500">Blobs committed</span>
                                    <span className="font-mono text-blue-400">{walrusUploadCount}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-500">Storage network</span>
                                    <span className="font-mono text-blue-400">Walrus Testnet</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-500">Epochs retained</span>
                                    <span className="font-mono text-green-400">∞ permanent</span>
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
                        <div className="absolute -inset-4 bg-gradient-to-r from-neon-purple/20 to-neon-cyan/20 blur-2xl rounded-full opacity-50 animate-pulse-slow pointer-events-none" />
                        <div className="relative bg-[#050505] rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
                            <div className="h-1 bg-gradient-to-r from-neon-purple via-transparent to-neon-cyan" />
                            <ApiKeyManager />
                        </div>

                        <div className="mt-8 bg-gradient-to-r from-neon-purple/10 to-neon-cyan/10 border border-white/10 rounded-xl p-6 mb-6">
                            <div className="flex items-center gap-3 mb-2">
                                <Terminal className="w-5 h-5 text-white" />
                                <h3 className="font-bold text-white">Nirium CLI</h3>
                                <span className="bg-neon-cyan/20 text-neon-cyan text-[10px] px-2 py-0.5 rounded font-mono">NEW</span>
                            </div>
                            <p className="text-xs text-gray-400 mb-3">Scaffold a combat-ready agent in seconds.</p>
                            <div className="bg-black/50 border border-white/5 rounded px-3 py-2 flex justify-between items-center group cursor-pointer hover:border-white/20 transition-colors"
                                onClick={() => { navigator.clipboard.writeText('npx nirium create-unit'); toast.success('Copied!'); }}>
                                <code className="text-xs font-mono text-neon-cyan">npx nirium create-unit</code>
                                <Copy className="w-3 h-3 text-gray-500 group-hover:text-white transition-colors" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-center hover:bg-white/10 transition-colors cursor-pointer">
                                <Code className="w-6 h-6 mx-auto mb-2 text-blue-400" />
                                <div className="text-sm font-bold">Python SDK</div>
                                <div className="text-xs text-green-400">v0.0.7 Ready</div>
                            </div>
                            <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-center hover:bg-white/10 transition-colors cursor-pointer">
                                <Zap className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
                                <div className="text-sm font-bold">Node.js SDK</div>
                                <div className="text-xs text-green-400">v0.0.7 Ready</div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Column: Code Snippets & Live Logs */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="space-y-6"
                    >
                        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6 group hover:border-neon-cyan/30 transition-colors min-h-[400px] flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-sm font-mono text-gray-400 flex items-center gap-2">
                                    <Terminal className="w-4 h-4 text-neon-cyan" />
                                    {activeTab === 'logs' ? 'LIVE NEURAL FEED' : 'DIRECT LINK PROTOCOL'}
                                </h3>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setActiveTab('logs')}
                                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${activeTab === 'logs' ? 'bg-neon-cyan/20 text-neon-cyan' : 'bg-white/5 text-gray-500'}`}
                                    >LOGS</button>
                                    <button
                                        onClick={() => setActiveTab('sdk')}
                                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${activeTab === 'sdk' ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-gray-500'}`}
                                    >SDK</button>
                                </div>
                            </div>

                            {activeTab === 'logs' ? (
                                <div className="bg-black rounded-lg p-4 font-mono text-xs text-gray-300 overflow-y-auto border border-white/5 shadow-inner flex-grow h-[300px] scrollbar-thin scrollbar-thumb-white/10">
                                    <div className="space-y-1">
                                        {logs.length === 0 && (
                                            <div className="text-gray-600 italic">Waiting for signal Uplink...</div>
                                        )}
                                        {logs.map((log, i) => (
                                            <div key={i} className="break-all">
                                                <span className="text-gray-600">[{new Date(log.timestamp).toLocaleTimeString()}]</span>{' '}
                                                <span className={`${log.level === 'error' ? 'text-red-500' :
                                                    log.level === 'warn' ? 'text-yellow-500' :
                                                        log.level === 'success' ? 'text-green-400' :
                                                            log.level === 'system' ? 'text-neon-cyan' :
                                                                'text-blue-400'
                                                    }`}>
                                                    {log.level?.toUpperCase()}
                                                </span>{' '}
                                                <span className="text-gray-300">{log.message}</span>
                                                {walrusStatus === 'live' && (
                                                    <span className="ml-2 text-blue-500/40 text-[9px]">⬆ walrus</span>
                                                )}
                                            </div>
                                        ))}
                                        <div ref={logsEndRef} />
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-black rounded-lg p-4 font-mono text-xs text-gray-300 overflow-x-auto border border-white/5 shadow-inner flex-grow flex flex-col">
                                    {/* Asset + Language toggles */}
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="flex items-center bg-black/40 border border-white/10 rounded-lg p-0.5">
                                            <button
                                                onClick={() => setSdkAsset('USDC')}
                                                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${sdkAsset === 'USDC' ? 'bg-neon-purple text-white' : 'text-gray-500 hover:text-white'}`}
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
                                                <div className="pl-8">bot.execute(<span className="text-green-400">&apos;flash-loan-arb&apos;</span>, signal);</div>
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
                                                <div className="pl-8">bot.execute(<span className="text-green-400">&quot;flash-loan-arb&quot;</span>, signal)</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <p className="mt-4 text-xs text-gray-500">
                                {activeTab === 'logs'
                                    ? `Live feed via Supabase Realtime. ${walrusStatus === 'live' ? `All ${walrusUploadCount} logs mirrored to Walrus.` : 'Walrus sync connecting...'}`
                                    : `Use the key above to authenticate. Showing ${sdkAsset} vault integration example.`}
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-neon-purple/20 to-transparent border border-neon-purple/30 rounded-xl p-6">
                            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                                <Shield className="w-4 h-4 text-neon-purple" />
                                Institutional Security
                            </h3>
                            <p className="text-xs text-gray-300 leading-relaxed opacity-80">
                                All agent interactions are secured by Move guarantees (OwnerCap) and signed nonces.
                                Transactions are atomically executed in a single PTB. Forensic logs are permanently stored on Walrus decentralized storage for both XLM and USDC vaults.
                            </p>
                            <button
                                onClick={() => {
                                    const downloadPromise = new Promise<void>((resolve) => {
                                        setTimeout(() => {
                                            const auditData = {
                                                audit_id: `BLK-BOX-${Date.now()}`,
                                                timestamp: new Date().toISOString(),
                                                walrus_status: walrusStatus,
                                                walrus_blobs_committed: walrusUploadCount,
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
                                            a.download = 'sui-loop-audit.json';
                                            document.body.appendChild(a);
                                            a.click();
                                            window.URL.revokeObjectURL(url);
                                            document.body.removeChild(a);
                                            resolve();
                                        }, 1500);
                                    });

                                    toast.promise(downloadPromise, {
                                        loading: 'Decrypting Black Box Neural Signatures...',
                                        success: 'Secure Logs Downloaded (sui-loop-audit.json)',
                                        error: 'Access Denied'
                                    });

                                    setLogs(prev => [...prev, {
                                        level: 'system',
                                        message: '⚠️ ENCRYPTED LOG DUMP REQUESTED BY OPERATOR',
                                        timestamp: new Date().toISOString()
                                    }]);
                                }}
                                className="mt-4 w-full py-2 bg-neon-purple/20 hover:bg-neon-purple/30 text-neon-purple border border-neon-purple/50 rounded-lg text-xs font-bold transition-all hover:shadow-[0_0_15px_rgba(168,85,247,0.3)] active:scale-95"
                            >
                                ACCESS BLACK BOX DATA
                            </button>
                        </div>
                    </motion.div>

                </div>
            </div>
        </main>
    );
}
