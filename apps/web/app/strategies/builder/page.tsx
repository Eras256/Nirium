'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    Panel,
    Connection,
    Edge,
    ReactFlowProvider,
    Node,
    BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import Navbar from "@/components/layout/Navbar";
import { useLanguage } from "@/context/LanguageContext";
import {
    Plus, Play, Save, Box, Activity, Zap, ArrowRight, Trash2,
    Settings, Search, ZoomIn, ZoomOut, Undo, Redo,
    LayoutGrid, Cpu, History, Clock, Landmark, Coins, Shield, Database,
    Twitter, MessageSquare, Bell, Share2, BarChart3, Fingerprint, Lock, Repeat, RefreshCw,
    Layers, MousePointer2, Info, ChevronRight, Download, X, Menu, Bolt,
    FlaskConical, KeyRound, TrendingUp, Terminal
} from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';
import { useFreighter } from "@/hooks/useFreighter";
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useMarketplace } from '@/hooks/useNiriumContracts';

import CustomNode from './CustomNode';

const nodeTypes: any = { niriumNode: CustomNode };

const ICON_MAP: any = {
    Plus, Play, Save, Box, Activity, Zap, ArrowRight, Trash2,
    Settings, Search, ZoomIn, ZoomOut, Undo, Redo,
    LayoutGrid, Cpu, History, Clock, Landmark, Coins, Shield, Database,
    Twitter, MessageSquare, Bell, Share2, BarChart3, Fingerprint, Lock, Repeat, RefreshCw,
    Layers, MousePointer2, Info, ChevronRight, Download, Bolt, FlaskConical, KeyRound, TrendingUp
};

const initialNodes: Node[] = [
    {
        id: 'start-0',
        type: 'niriumNode',
        data: { label: 'INIT_KERNEL', icon: 'Play', type: 'trigger', color: 'from-stellar-teal to-blue-500' },
        position: { x: 100, y: 100 },
    },
];

const initialEdges: Edge[] = [];

let id = 0;
const getId = () => `node_${Date.now()}_${id++}`;

function StrategyBuilderInner() {
    const { t } = useLanguage();
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
    const [strategyName, setStrategyName] = useState('UNNAMED_KERNEL');
    const [strategyId, setStrategyId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [mounted, setMounted] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [history, setHistory] = useState<any[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [selectedAsset, setSelectedAsset] = useState<'XLM' | 'USDC'>('XLM');

    const { address: accountStr, isConnected } = useFreighter();
    const account = isConnected ? { address: accountStr, chains: ['stellar:testnet'] } : null;
    const marketplace = useMarketplace();
    const router = useRouter();

    const NODE_TEMPLATES = [
        {
            category: t.builder.categories.atomic_engine,
            color: 'from-stellar-teal to-blue-500',
            items: [
                { type: 'action', label: 'FLASH_LOAN', icon: 'Bolt', desc: 'Borrow capital atomically (Multi-Op)' },
                { type: 'action', label: 'EXECUTE_LOOP', icon: 'RefreshCw', desc: 'Full borrow-trade-repay cycle' },
                { type: 'action', label: 'CREATE_AGENT_AUTH', icon: 'KeyRound', desc: 'Mint agent auth (0.1 XLM fee)' },
                { type: 'action', label: 'REPAY_LOAN', icon: 'TrendingUp', desc: 'Satisfy Multi-Op receipt + profit' },
            ]
        },
        {
            category: t.builder.categories.signal_inputs,
            color: 'from-amber-400 to-orange-500',
            items: [
                { type: 'trigger', label: 'PRICE_THRESHOLD', icon: 'Activity', desc: 'Triggers on target price hit' },
                { type: 'trigger', label: 'CRON_TICK', icon: 'Zap', desc: 'Execution on time intervals' },
                { type: 'trigger', label: 'MEMPOOL_SCAN', icon: 'Box', desc: 'Real-time transaction tracking' },
                { type: 'trigger', label: 'WHALE_ALERT', icon: 'Bell', desc: 'Tracks large wallet movements' },
            ]
        },
        {
            category: t.builder.categories.ai_intelligence,
            color: 'from-purple-500 to-indigo-600',
            items: [
                { type: 'action', label: 'ELIZA_SENTIMENT', icon: 'Cpu', desc: 'Analyzes social sentiment (NLP)' },
                { type: 'action', label: 'KELLY_CRITERION', icon: 'BarChart3', desc: 'Optimal position sizing logic' },
                { type: 'condition', label: 'MARKET_REGIME', icon: 'Activity', desc: 'Detects Bull/Bear transitions' },
            ]
        },
        {
            category: t.builder.categories.trading_swaps,
            color: 'from-blue-400 to-cyan-500',
            items: [
                { type: 'action', label: 'SOROSWAP_SWAP', icon: 'RefreshCw', desc: 'Atomic swap on Soroswap AMM' },
                { type: 'action', label: 'PHOENIX_SWAP', icon: 'Repeat', desc: 'Liquidity pool swap on Phoenix' },
                { type: 'action', label: 'SDEX_LIMIT', icon: 'ArrowRight', desc: 'SDEX Orderbook placement' },
            ]
        }
    ];

    useEffect(() => { setMounted(true); }, []);

    // Auto-collapse sidebar on small screens
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) setSidebarOpen(false);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#2DEBE8' } }, eds)),
        [setEdges]
    );

    const onDragStart = (event: React.DragEvent, nodeData: any) => {
        event.dataTransfer.setData('application/reactflow', JSON.stringify(nodeData));
        event.dataTransfer.effectAllowed = 'move';
    };

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onAddNode = useCallback((template: any) => {
        let position = { x: 300, y: 300 };
        if (reactFlowInstance) {
            const { x, y, zoom } = reactFlowInstance.getViewport();
            const wrapper = reactFlowWrapper.current?.getBoundingClientRect();
            if (wrapper) {
                position = {
                    x: (wrapper.width / 2 - x) / zoom,
                    y: (wrapper.height / 2 - y) / zoom,
                };
            }
        }
        const newId = getId();
        const newNode: Node = {
            id: newId,
            type: 'niriumNode',
            position,
            data: {
                label: template.label,
                icon: template.icon,
                type: template.type,
                color: NODE_TEMPLATES.find(c => c.items.some(i => i.label === template.label))?.color
            },
        };
        setNodes((nds) => [...nds, newNode]);
        toast.success(`Matrix Enhanced: ${template.label}`);
    }, [reactFlowInstance, setNodes]);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();
            const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
            const rawData = event.dataTransfer.getData('application/reactflow');
            if (!rawData || !reactFlowBounds) return;
            const template = JSON.parse(rawData);
            const position = reactFlowInstance.screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });
            const newId = getId();
            const newNode: Node = {
                id: newId,
                type: 'niriumNode',
                position,
                data: {
                    label: template.label,
                    icon: template.icon,
                    type: template.type,
                    color: NODE_TEMPLATES.find(c => c.items.some(i => i.label === template.label))?.color
                },
            };
            setNodes((nds) => [...nds, newNode]);
        },
        [reactFlowInstance, setNodes]
    );

    const handleSave = async (deploy = false) => {
        if (!account?.address) {
            toast.error("Connect Wallet to Architect Protocol");
            return;
        }
        setIsSaving(true);
        const toastId = toast.loading(deploy ? t.toasts.compiling : "Committing Draft...");
        try {
            const flow = reactFlowInstance.toObject();
            const sid = strategyId || `custom-${Date.now()}`;
            if (!strategyId) setStrategyId(sid);

            const { StrategyService } = await import("@/lib/strategyService");
            const newStrat = {
                strategy_id: sid,
                name: strategyName,
                emoji: '🏗️',
                status: deploy ? 'RUNNING' : 'DRAFT',
                yield: '0.00%',
                asset: selectedAsset,
                created_at: new Date().toISOString(),
                config: flow
            };

            // Local Persistence
            const localKey = `nirium-fleet-${account.address}`;
            const existing = JSON.parse(localStorage.getItem(localKey) || "[]");
            const filtered = existing.filter((s: any) => s.id !== sid && s.strategy_id !== sid);
            localStorage.setItem(localKey, JSON.stringify([{ ...newStrat, id: sid }, ...filtered]));

            // Cloud Sync
            try {
                await StrategyService.deployStrategy(account.address, newStrat);
            } catch (dbError: any) {
                console.warn("Cloud sync error", dbError);
            }

            if (deploy) {
                toast.success(t.toasts.broadcast_success);
                router.push(`/dashboard?autostart=true&strategy=${sid}&name=${encodeURIComponent(strategyName)}&asset=${selectedAsset}`);
            } else {
                toast.success("Draft Persisted Locally");
                fetchHistory();
            }
        } catch (e: any) {
            toast.error(t.toasts.broadcast_failed);
        } finally {
            setIsSaving(false);
            toast.dismiss(toastId);
        }
    };

    const fetchHistory = async () => {
        if (!account?.address) return;
        setIsLoadingHistory(true);
        try {
            const { StrategyService } = await import("@/lib/strategyService");
            const dbStrategies = await StrategyService.getStrategies(account.address);
            setHistory(dbStrategies);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoadingHistory(false);
        }
    };

    const handleExport = () => {
        if (!reactFlowInstance) return;
        const flow = reactFlowInstance.toObject();
        const schema = {
            version: '0.0.7',
            exported_at: new Date().toISOString(),
            kernel_name: strategyName,
            kernel_id: strategyId || `custom-${Date.now()}`,
            asset: selectedAsset,
            node_count: flow.nodes?.length || 0,
            edge_count: flow.edges?.length || 0,
            flow,
        };
        const blob = new Blob([JSON.stringify(schema, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${strategyName.toLowerCase().replace(/\s+/g, '_')}_kernel.json`;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Schema exported as .json');
    };

    const handlePublishOnChain = async () => {
        if (!account?.address) {
            toast.error("Connect Wallet to Authorize Protocol Registration");
            return;
        }

        const toastId = toast.loading("Publishing Strategy to Soroban Registry via IPFS...");
        try {
            if (!reactFlowInstance) {
                toast.error("No valid flow to publish");
                return;
            }

            const flow = reactFlowInstance.toObject();
            const schema = {
                version: '0.0.7',
                exported_at: new Date().toISOString(),
                kernel_name: strategyName,
                kernel_id: strategyId || `custom-${Date.now()}`,
                asset: selectedAsset,
                node_count: flow.nodes?.length || 0,
                edge_count: flow.edges?.length || 0,
                flow,
            };

            // 1. Upload to Pinata IPFS
            toast.loading("Uploading Kernel Schema to IPFS...", { id: toastId });
            const ipfsResponse = await fetch('/api/pinata', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(schema)
            });

            if (!ipfsResponse.ok) {
                throw new Error("Failed to upload to IPFS (Pinata)");
            }

            const { IpfsHash } = await ipfsResponse.json();

            if (!IpfsHash) {
                throw new Error("Did not receive a valid IPFS Hash from Pinata");
            }

            toast.loading(`IPFS Uploaded: ${IpfsHash}. Registering on-chain...`, { id: toastId });

            // 2. Publish to Soroban Registry with Real CID 
            const subscriptionFee = BigInt(10000000); // 1.0 XLM default fee

            const result = await marketplace.publishStrategy(
                account.address,
                strategyName,
                IpfsHash, // Use Real CID instead of Dummy!
                subscriptionFee
            );

            if (result.success) {
                toast.success("Strategy Published On-Chain!", {
                    description: `Registry ID updated. Tx: ${result.txHash?.slice(0, 10)}...`
                });
            } else {
                toast.error(`Publication Failed: ${result.error}`);
            }
        } catch (e: any) {
            toast.error(`Soroban Error: ${e.message}`);
        } finally {
            toast.dismiss(toastId);
        }
    };

    const loadKernel = (strat: any) => {
        if (strat.config && strat.config.nodes) {
            setNodes(strat.config.nodes || []);
            setEdges(strat.config.edges || []);
            setStrategyName(strat.name);
            setStrategyId(strat.strategy_id || strat.id);
            if (strat.asset === 'XLM' || strat.asset === 'USDC') setSelectedAsset(strat.asset);
            setShowHistory(false);
            toast.success(`Kernel Reconstructed: ${strat.name}`);
            setTimeout(() => { reactFlowInstance?.fitView({ duration: 800 }); }, 100);
        }
    };

    if (!mounted) return null;

    const filteredTemplates = NODE_TEMPLATES.map(cat => ({
        ...cat,
        items: cat.items.filter(i => i.label.toLowerCase().includes(searchQuery.toLowerCase()))
    })).filter(cat => cat.items.length > 0);

    return (
        <div className="flex-1 flex overflow-hidden relative">
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSidebarOpen(false)}
                        className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm"
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {!sidebarOpen && (
                    <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        onClick={() => setSidebarOpen(true)}
                        className="absolute top-6 left-6 z-50 bg-[#121212] border border-white/10 p-4 rounded-2xl text-stellar-teal hover:border-stellar-teal/50 shadow-[0_0_20px_rgba(45,235,232,0.2)] transition-all"
                    >
                        <Menu size={20} />
                    </motion.button>
                )}
            </AnimatePresence>

            <aside className={`
                ${sidebarOpen ? 'translate-x-0 shadow-[0_0_40px_rgba(0,0,0,0.8)]' : '-translate-x-full'}
                fixed lg:relative lg:translate-x-0
                w-80 h-full bg-[#0d0d0d] border-r border-white/5 flex flex-col z-40
                transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
            `}>
                <div className="p-6 border-b border-white/5 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Terminal size={14} className="text-stellar-teal" />
                            <h2 className="text-[10px] font-black tracking-[0.3em] text-gray-500 uppercase font-mono">NEURAL_LAB</h2>
                        </div>
                        <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-500 hover:text-white">
                            <X size={18} />
                        </button>
                    </div>

                    {/* NEON ASSET SELECTOR */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{t.builder.asset_selector}</label>
                        <div className="grid grid-cols-2 gap-2 bg-black/40 p-1 rounded-xl border border-white/5">
                            <button
                                onClick={() => setSelectedAsset('XLM')}
                                className={`py-2.5 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all duration-300 ${selectedAsset === 'XLM'
                                    ? 'bg-[#00F3FF]/10 text-[#00F3FF] border border-[#00F3FF]/30 shadow-[0_0_15px_rgba(0,243,255,0.2)]'
                                    : 'text-gray-500 hover:text-gray-300'
                                    }`}
                            >
                                XLM NATIVE
                            </button>
                            <button
                                onClick={() => setSelectedAsset('USDC')}
                                className={`py-2.5 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all duration-300 ${selectedAsset === 'USDC'
                                    ? 'bg-[#A855F7]/10 text-[#A855F7] border border-[#A855F7]/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                                    : 'text-gray-500 hover:text-gray-300'
                                    }`}
                            >
                                USDC TOKEN
                            </button>
                        </div>
                    </div>

                    {/* TERMINAL SEARCH */}
                    <div className="relative group">
                        <div className="absolute inset-0 bg-stellar-teal/5 blur-md rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                        <Search className="absolute left-3.5 top-3 text-gray-600 group-focus-within:text-stellar-teal transition-colors" size={14} />
                        <input
                            type="text"
                            placeholder={t.builder.search_placeholder}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#151515] border border-white/5 rounded-xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:border-stellar-teal/30 focus:ring-1 focus:ring-stellar-teal/20 transition-all font-mono placeholder:text-gray-700"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
                    {filteredTemplates.map((category, idx) => (
                        <div key={idx} className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{category.category}</h3>
                                <div className={`h-px flex-1 ml-4 bg-gradient-to-r from-white/5 to-transparent`}></div>
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                                {category.items.map((item, i) => (
                                    <div
                                        key={i}
                                        draggable
                                        onDragStart={(e) => onDragStart(e, item)}
                                        className="relative group p-4 bg-[#121212] border border-white/5 rounded-2xl cursor-grab active:cursor-grabbing hover:border-white/20 hover:bg-[#161616] transition-all overflow-hidden"
                                    >
                                        <div className={`absolute left-0 top-0 w-1 h-full bg-gradient-to-b ${category.color} opacity-30 group-hover:opacity-100 transition-opacity`}></div>
                                        <div className="flex items-center gap-4">
                                            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-gray-400 group-hover:text-white transition-colors">
                                                {ICON_MAP[item.icon] ? React.createElement(ICON_MAP[item.icon], { size: 16 }) : <Box size={16} />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-[11px] font-black text-white uppercase tracking-tight font-mono mb-0.5">{item.label}</div>
                                                <div className="text-[9px] text-gray-600 truncate uppercase font-mono">{item.desc}</div>
                                            </div>
                                            <button
                                                onClick={() => onAddNode(item)}
                                                className="p-2 rounded-lg bg-white/5 text-gray-500 hover:text-stellar-teal hover:bg-stellar-teal/10 transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-6 text-[10px] font-black text-gray-600 uppercase tracking-widest hover:text-white transition-colors border-t border-white/5 flex items-center justify-center gap-2 group"
                >
                    {t.builder.collapse} <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
            </aside>

            <div className="flex-1 relative bg-[#080808]" ref={reactFlowWrapper}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onInit={setReactFlowInstance}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    nodeTypes={nodeTypes}
                    fitView
                    colorMode="dark"
                    snapToGrid
                    snapGrid={[20, 20]}
                >
                    <Background variant={BackgroundVariant.Lines} color="#151515" gap={40} size={1} />

                    <Controls className="!bg-[#121212] !border-white/10 !rounded-xl !shadow-2xl overflow-hidden" showInteractive={false} />

                    <Panel position="top-left" className={`
                        transition-all duration-500 pt-4
                        ${sidebarOpen ? 'ml-4' : 'ml-20'}
                    `}>
                        <div className="bg-[#121212]/90 backdrop-blur-xl border border-white/10 p-5 rounded-3xl shadow-2xl flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-stellar-teal/10 border border-stellar-teal/20 flex items-center justify-center text-stellar-teal">
                                <Cpu size={24} />
                            </div>
                            <div>
                                <input
                                    value={strategyName}
                                    onChange={(e) => setStrategyName(e.target.value)}
                                    className="bg-transparent border-none focus:outline-none font-black text-xl tracking-tighter text-white uppercase font-mono"
                                />
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="w-2 h-2 rounded-full bg-stellar-teal animate-pulse"></span>
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Neural Kernel Linked</span>
                                </div>
                            </div>
                        </div>
                    </Panel>

                    <Panel position="top-right" className="pt-4 flex gap-3">
                        <button
                            onClick={() => handleSave(false)}
                            disabled={isSaving}
                            className="bg-[#121212]/90 backdrop-blur-xl border border-white/10 px-6 py-3.5 rounded-2xl font-mono text-[10px] font-black tracking-[0.2em] text-gray-400 hover:text-white hover:border-white/20 transition-all flex items-center gap-3 shadow-2xl"
                        >
                            <Save size={16} /> COMMIT_DRAFT
                        </button>
                        <button
                            onClick={() => handleSave(true)}
                            disabled={isSaving}
                            className="bg-stellar-teal px-4 md:px-8 py-3.5 rounded-2xl font-mono text-[10px] font-black tracking-[0.2em] text-black hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(45,235,232,0.4)] transition-all flex items-center gap-2 md:gap-3"
                        >
                            <Play size={16} fill="currentColor" /> COMPILE_KERNEL
                        </button>
                        <button
                            onClick={handlePublishOnChain}
                            className="bg-purple-500/20 text-purple-400 border border-purple-500/50 px-4 md:px-8 py-3.5 rounded-2xl font-mono text-[10px] font-black tracking-[0.2em] hover:bg-purple-500 hover:text-white shadow-[0_0_30px_rgba(168,85,247,0.2)] hover:shadow-[0_0_40px_rgba(168,85,247,0.6)] transition-all flex items-center gap-2 md:gap-3"
                        >
                            <Database size={16} /> PUBLISH_CHAIN
                        </button>
                    </Panel>

                    <Panel position="bottom-right" className="flex flex-col gap-3">
                        <button onClick={() => setShowHistory(true)} className="w-14 h-14 bg-[#121212] border border-white/10 rounded-2xl flex items-center justify-center text-gray-400 hover:text-stellar-teal hover:border-stellar-teal/30 shadow-2xl transition-all">
                            <History size={20} />
                        </button>
                        <button onClick={handleExport} className="w-14 h-14 bg-[#121212] border border-white/10 rounded-2xl flex items-center justify-center text-gray-400 hover:text-white shadow-2xl transition-all">
                            <Download size={20} />
                        </button>
                    </Panel>
                </ReactFlow>
            </div>

            <AnimatePresence>
                {showHistory && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowHistory(false)}
                            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100]"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            className="fixed top-0 right-0 h-full w-full max-w-md bg-[#0d0d0d] border-l border-white/5 z-[101] flex flex-col shadow-[0_0_100px_rgba(0,0,0,1)]"
                        >
                            <div className="p-8 border-b border-white/5 flex items-center justify-between">
                                <h2 className="text-xl font-black italic tracking-tighter text-white">NEURAL_ARCHIVE</h2>
                                <button onClick={() => setShowHistory(false)} className="text-gray-500 hover:text-white"><X size={24} /></button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                {history.map((strat, i) => (
                                    <button
                                        key={strat.id || i}
                                        onClick={() => loadKernel(strat)}
                                        className="w-full p-5 bg-[#121212] border border-white/5 rounded-3xl hover:border-stellar-teal/30 hover:bg-[#161616] transition-all flex items-center gap-4 group"
                                    >
                                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                            {strat.emoji || '🤖'}
                                        </div>
                                        <div className="flex-1 text-left min-w-0">
                                            <div className="text-sm font-black text-white truncate uppercase mb-1">{strat.name}</div>
                                            <div className="flex items-center gap-3 text-[10px] font-mono text-gray-500 uppercase">
                                                <span>{strat.asset}</span>
                                                <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
                                                <span className="text-stellar-teal font-bold">{strat.yield} APIA</span>
                                            </div>
                                        </div>
                                        <ChevronRight size={20} className="text-gray-700 group-hover:text-stellar-teal" />
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function StrategyBuilderPro() {
    return (
        <main className="h-screen w-screen bg-[#080808] text-white flex flex-col font-sans selection:bg-stellar-teal/30 overflow-hidden">
            <Navbar />
            <div className="h-[90px] w-full shrink-0"></div>
            <div className="flex-1 flex overflow-hidden">
                <ReactFlowProvider>
                    <StrategyBuilderInner />
                </ReactFlowProvider>
            </div>

            <style jsx global>{`
                .react-flow__handle {
                    width: 12px; height: 12px;
                    background: #2DEBE8 !important;
                    border: 3px solid #080808 !important;
                    box-shadow: 0 0 10px rgba(45,235,232,0.4);
                }
                .react-flow__attribution { display: none; }
                .react-flow__controls {
                    background: #121212 !important;
                    border: 1px solid rgba(255,255,255,0.05) !important;
                    border-radius: 12px !important;
                    overflow: hidden;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                }
                .react-flow__controls-button {
                    background: transparent !important;
                    border-bottom: 1px solid rgba(255,255,255,0.05) !important;
                    color: #555 !important;
                    fill: #555 !important;
                    transition: all 0.2s;
                }
                .react-flow__controls-button:hover {
                    background: rgba(45,235,232,0.1) !important;
                    color: #2DEBE8 !important;
                    fill: #2DEBE8 !important;
                }
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 2px; }
            `}</style>
        </main>
    );
}
