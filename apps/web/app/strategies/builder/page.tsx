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
import {
    Plus, Play, Save, Box, Activity, Zap, ArrowRight, Trash2,
    Settings, Search, ZoomIn, ZoomOut, Undo, Redo,
    LayoutGrid, Cpu, History, Clock, Landmark, Coins, Shield, Database,
    Twitter, MessageSquare, Bell, Share2, BarChart3, Fingerprint, Lock, Repeat, RefreshCw,
    Layers, MousePointer2, Info, ChevronRight, Download, X, Menu, Bolt,
    FlaskConical, KeyRound, TrendingUp
} from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';
import { useFreighter } from "@/hooks/useFreighter";
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import CustomNode from './CustomNode';

// --- Icon Registry ---
const ICON_MAP: any = {
    Plus, Play, Save, Box, Activity, Zap, ArrowRight, Trash2,
    Settings, Search, ZoomIn, ZoomOut, Undo, Redo,
    LayoutGrid, Cpu, History, Clock, Landmark, Coins, Shield, Database,
    Twitter, MessageSquare, Bell, Share2, BarChart3, Fingerprint, Lock, Repeat, RefreshCw,
    Layers, MousePointer2, Info, ChevronRight, Download, Bolt, FlaskConical, KeyRound, TrendingUp
};

const nodeTypes: any = { niriumNode: CustomNode };

const NODE_TEMPLATES = [
    {
        category: 'ATOMIC ENGINE',
        color: 'from-stellar-teal to-blue-500',
        items: [
            { type: 'action', label: 'FLASH_LOAN', icon: 'Bolt', desc: 'Borrow capital atomically (Multi-Op)' },
            { type: 'action', label: 'EXECUTE_LOOP', icon: 'RefreshCw', desc: 'Full borrow-trade-repay cycle' },
            { type: 'action', label: 'CREATE_AGENT_AUTH', icon: 'KeyRound', desc: 'Mint agent auth (0.1 XLM fee)' },
            { type: 'action', label: 'REPAY_LOAN', icon: 'TrendingUp', desc: 'Satisfy Multi-Op receipt + profit' },
        ]
    },
    {
        category: 'SIGNAL INPUTS',
        color: 'from-amber-400 to-orange-500',
        items: [
            { type: 'trigger', label: 'PRICE_THRESHOLD', icon: 'Activity', desc: 'Triggers on target price hit' },
            { type: 'trigger', label: 'CRON_TICK', icon: 'Zap', desc: 'Execution on time intervals' },
            { type: 'trigger', label: 'MEMPOOL_SCAN', icon: 'Box', desc: 'Real-time transaction tracking' },
            { type: 'trigger', label: 'WHALE_ALERT', icon: 'Bell', desc: 'Tracks large wallet movements' },
        ]
    },
    {
        category: 'AI INTELLIGENCE',
        color: 'from-purple-500 to-indigo-600',
        items: [
            { type: 'action', label: 'ELIZA_SENTIMENT', icon: 'Cpu', desc: 'Analyzes social sentiment (NLP)' },
            { type: 'action', label: 'KELLY_CRITERION', icon: 'BarChart3', desc: 'Optimal position sizing logic' },
            { type: 'condition', label: 'MARKET_REGIME', icon: 'Activity', desc: 'Detects Bull/Bear transitions' },
        ]
    },
    {
        category: 'TRADING & SWAPS',
        color: 'from-blue-400 to-cyan-500',
        items: [
            { type: 'action', label: 'SOROSWAP_SWAP', icon: 'RefreshCw', desc: 'Atomic swap on Soroswap AMM' },
            { type: 'action', label: 'PHOENIX_SWAP', icon: 'Repeat', desc: 'Liquidity pool swap on Phoenix' },
            { type: 'action', label: 'SDEX_LIMIT', icon: 'ArrowRight', desc: 'SDEX Orderbook placement' },
        ]
    },
    {
        category: 'SECURITY & VAULT',
        color: 'from-emerald-500 to-green-600',
        items: [
            { type: 'action', label: 'VAULT_DEPOSIT', icon: 'Lock', desc: 'Secure Enclave capital locking' },
            { type: 'action', label: 'VAULT_WITHDRAW', icon: 'Fingerprint', desc: 'Auth-verified liquidation' },
            { type: 'condition', label: 'ENCLAVE_GUARD', icon: 'Shield', desc: 'Soroban-native safety filter' },
            { type: 'action', label: 'NEURAL_BLACKBOX', icon: 'Database', desc: 'Decentralized forensic logging' },
        ]
    },
    {
        category: 'SOCIAL MESSAGING',
        color: 'from-pink-500 to-rose-600',
        items: [
            { type: 'action', label: 'TWITTER_RELAY', icon: 'Twitter', desc: 'Automated status reporting' },
            { type: 'action', label: 'DISCORD_ALARM', icon: 'MessageSquare', desc: 'Urgent critical notifications' },
            { type: 'action', label: 'TELEGRAM_PUSH', icon: 'Share2', desc: 'Async execution logs' },
        ]
    }
];

const initialNodes: Node[] = [
    {
        id: 'start-0',
        type: 'niriumNode',
        data: { label: 'INIT_KERNEL', icon: 'Play', type: 'trigger', color: 'from-green-400 to-emerald-500' },
        position: { x: 100, y: 100 },
    },
];

const initialEdges: Edge[] = [];

let id = 0;
const getId = () => `node_${Date.now()}_${id++}`;

function StrategyBuilderInner() {
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
    const router = useRouter();

    useEffect(() => { setMounted(true); }, []);

    // Auto-collapse sidebar on small screens
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) setSidebarOpen(false);
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
        setNodes((nds) => {
            const lastNode = nds[nds.length - 1];
            if (lastNode) {
                const newEdge: Edge = {
                    id: `e-${lastNode.id}-${newId}`,
                    source: lastNode.id,
                    target: newId,
                    animated: true,
                    style: { stroke: '#2DEBE8' }
                };
                setEdges((eds) => addEdge(newEdge, eds));
            }
            return [...nds, newNode];
        });
        toast.success(`Matrix Enhanced: ${template.label} connected`);
    }, [reactFlowInstance, setNodes, setEdges]);

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
            setNodes((nds) => {
                const lastNode = nds[nds.length - 1];
                if (lastNode) {
                    const newEdge: Edge = {
                        id: `e-${lastNode.id}-${newId}`,
                        source: lastNode.id,
                        target: newId,
                        animated: true,
                        style: { stroke: '#2DEBE8' }
                    };
                    setEdges((eds) => addEdge(newEdge, eds));
                }
                return [...nds, newNode];
            });
        },
        [reactFlowInstance, setNodes, setEdges]
    );

    // Export Schema as downloadable JSON
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

    const handleSave = async (deploy = false) => {
        if (!account?.address) {
            toast.error("Connect Wallet to Architect Protocol");
            return;
        }
        setIsSaving(true);
        const toastId = toast.loading(deploy ? "Compiling Neural Kernel..." : "Committing Draft...");
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

            // 1. Local Persistence
            try {
                const localKey = `nirium-fleet-${account.address}`;
                const existing = JSON.parse(localStorage.getItem(localKey) || "[]");
                const filtered = existing.filter((s: any) => s.id !== sid && s.strategy_id !== sid);
                localStorage.setItem(localKey, JSON.stringify([{ ...newStrat, id: sid }, ...filtered]));
            } catch (le) {
                console.warn("Local cache failed", le);
            }

            // 2. Cloud Sync (Supabase)
            try {
                await StrategyService.deployStrategy(account.address, newStrat);
            } catch (dbError: any) {
                toast.error(`Cloud Sync Offline: ${dbError.message || 'Persistence Error'}`, {
                    description: "Kernel saved locally. Archive may be incomplete."
                });
            }

            // 3. Neural Archive simulation on deploy
            if (deploy) {
                setTimeout(() => {
                    toast.success(`⬆ Schema archived to Neural Archive (blob: ${sid.slice(0, 12)}...)`, { duration: 3000 });
                }, 1000);
            }

            toast.dismiss(toastId);
            if (deploy) {
                toast.success("Kernel Compiled and Uplinked!");
                router.push(`/dashboard?autostart=true&strategy=${sid}&name=${encodeURIComponent(strategyName)}&asset=${selectedAsset}`);
            } else {
                toast.success("Draft Persisted (Local + Cloud Sync Attempted)");
                fetchHistory();
            }
        } catch (e: any) {
            console.error(e);
            toast.error(`Transmission Error: ${e.message || 'Unknown Failure'}`);
        } finally {
            setIsSaving(false);
        }
    };

    const fetchHistory = async () => {
        if (!account?.address) return;
        setIsLoadingHistory(true);
        try {
            const { StrategyService } = await import("@/lib/strategyService");
            const dbStrategies = await StrategyService.getStrategies(account.address);
            const localKey = `nirium-fleet-${account.address}`;
            const localRaw = localStorage.getItem(localKey);
            let merged = [...dbStrategies];
            if (localRaw) {
                const local = JSON.parse(localRaw) as any[];
                const uniqueLocals = local.filter((l: any) =>
                    !dbStrategies.some(dbS => (dbS.strategy_id === l.strategy_id) || (dbS.id === l.id))
                );
                merged = [...merged, ...uniqueLocals];
            }
            setHistory(merged);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoadingHistory(false);
        }
    };

    useEffect(() => {
        if (showHistory && account?.address) fetchHistory();
    }, [showHistory, account?.address]);

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

            {/* Mobile overlay when sidebar is open */}
            {sidebarOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 bg-black/60 z-30 md:hidden"
                />
            )}

            {/* Sidebar toggle button (mobile/tablet) — only shows when sidebar is closed */}
            <AnimatePresence>
                {!sidebarOpen && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={() => setSidebarOpen(true)}
                        className="absolute top-3 left-3 z-50 md:hidden bg-[#0F0F0F]/90 backdrop-blur-md border border-white/20 p-2.5 rounded-xl text-stellar-teal hover:bg-white/10 shadow-xl"
                    >
                        <Menu size={18} />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Component Library Sidebar */}
            <aside className={`
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                fixed md:relative md:translate-x-0
                w-72 md:w-80 h-full bg-[#0F0F0F] border-r border-white/10 flex flex-col z-40
                transition-transform duration-300 ease-in-out
            `}>
                <div className="p-4 border-b border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xs font-black tracking-[0.2em] text-gray-500 uppercase">Component Lab</h2>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-stellar-teal/50">v0.0.7</span>
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="md:hidden p-1 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Asset Selector */}
                    <div className="flex items-center justify-between bg-black/40 border border-white/10 rounded-xl p-1">
                        <span className="text-[10px] text-gray-500 uppercase tracking-wider pl-2">Vault Asset</span>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setSelectedAsset('USDC')}
                                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${selectedAsset === 'USDC' ? 'bg-stellar-yellow text-white shadow-[0_0_10px_rgba(168,85,247,0.4)]' : 'text-gray-500 hover:text-white'}`}
                            >
                                USDC
                            </button>
                            <button
                                onClick={() => setSelectedAsset('XLM')}
                                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${selectedAsset === 'XLM' ? 'bg-[#4ca2ff] text-white shadow-[0_0_10px_rgba(76,162,255,0.4)]' : 'text-gray-500 hover:text-white'}`}
                            >
                                XLM
                            </button>
                        </div>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-gray-500" size={14} />
                        <input
                            type="text"
                            placeholder="Find Kernel Core..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-stellar-teal/50 transition-all font-mono"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
                    {filteredTemplates.map((category, idx) => (
                        <div key={idx} className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className={`w-1 h-3 rounded-full bg-gradient-to-b ${category.color}`}></div>
                                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{category.category}</h3>
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                                {category.items.map((item, i) => (
                                    <div
                                        key={i}
                                        draggable
                                        onDragStart={(e) => onDragStart(e, item)}
                                        className="flex items-center gap-3 p-3 bg-[#1A1A1A] border border-white/5 rounded-xl hover:border-white/20 hover:bg-[#222] transition-all group cursor-grab active:cursor-grabbing"
                                    >
                                        <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors shrink-0">
                                            {ICON_MAP[item.icon] ? (
                                                React.createElement(ICON_MAP[item.icon], { size: 15, className: "text-gray-400 group-hover:text-stellar-teal" })
                                            ) : (
                                                <Box size={15} />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-[11px] font-bold text-gray-200 group-hover:text-white truncate font-mono uppercase">
                                                {item.label}
                                            </div>
                                            <div className="text-[9px] text-gray-500 truncate">{item.desc}</div>
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onAddNode(item); if (window.innerWidth < 768) setSidebarOpen(false); }}
                                            className="p-1.5 rounded-lg hover:bg-stellar-teal/20 text-white/20 hover:text-stellar-teal transition-all opacity-0 group-hover:opacity-100 shrink-0"
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-3 bg-black/40 border-t border-white/5">
                    <div className="flex items-center gap-2 p-2.5 bg-stellar-teal/5 rounded-xl border border-stellar-teal/10">
                        <Info size={13} className="text-stellar-teal shrink-0" />
                        <p className="text-[10px] text-gray-400 leading-tight">
                            Drag nodes onto the matrix. Asset: <span className={selectedAsset === 'USDC' ? 'text-stellar-yellow font-bold' : 'text-[#4ca2ff] font-bold'}>{selectedAsset}</span>
                        </p>
                    </div>
                </div>
            </aside>

            {/* Main Canvas */}
            <div className="flex-1 relative bg-[#0A0A0A] min-w-0" ref={reactFlowWrapper}>
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
                    panOnDrag
                    zoomOnPinch
                    zoomOnScroll
                    panOnScroll={false}
                    minZoom={0.2}
                    maxZoom={2}
                >
                    <Background variant={BackgroundVariant.Dots} color="#222" gap={20} size={1} />

                    <Controls
                        className="!bg-[#0F0F0F] !border-white/10 !rounded-xl overflow-hidden"
                        showInteractive={false}
                    />

                    <MiniMap
                        className="!bg-[#0F0F0F] !border-white/10 !rounded-xl hidden sm:block"
                        maskColor="rgba(0, 0, 0, 0.7)"
                        nodeColor={(n: any) => n.data?.color ? '#2DEBE8' : '#333'}
                        nodeStrokeWidth={3}
                        zoomable
                        pannable
                    />

                    {/* Top-left: Kernel name + status — offset on mobile to avoid hamburger */}
                    <Panel position="top-left" className={`
                        bg-[#0F0F0F]/90 backdrop-blur-md border border-white/10
                        p-2.5 sm:p-3 md:p-4 rounded-2xl shadow-2xl
                        flex items-center gap-2 sm:gap-3
                        transition-all duration-300
                        ${!sidebarOpen ? 'ml-14 md:ml-4' : 'ml-3 md:ml-4'}
                        mt-3 md:mt-4
                        max-w-[calc(100vw-5rem)] sm:max-w-xs md:max-w-none
                    `}>
                        <div className="bg-stellar-teal/20 p-1.5 sm:p-2 rounded-xl border border-stellar-teal/30 hidden sm:flex shrink-0">
                            <Layers className="text-stellar-teal" size={16} />
                        </div>
                        <div className="min-w-0 flex-1">
                            <input
                                value={strategyName}
                                onChange={(e) => setStrategyName(e.target.value)}
                                className="bg-transparent border-none focus:outline-none font-black text-sm sm:text-base md:text-xl tracking-tighter text-white w-28 sm:w-36 md:w-48 uppercase font-mono truncate block"
                            />
                            <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`w-1.5 h-1.5 rounded-full ${account ? 'bg-green-500' : 'bg-red-500'} animate-pulse shrink-0`}></span>
                                <span className="text-[9px] sm:text-[10px] font-mono text-gray-500">{account ? 'ACTIVE' : 'OFFLINE'}</span>
                                <span className={`text-[9px] sm:text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${selectedAsset === 'USDC' ? 'bg-stellar-yellow/20 text-stellar-yellow' : 'bg-blue-500/20 text-[#4ca2ff]'}`}>
                                    {selectedAsset}
                                </span>
                            </div>
                        </div>
                    </Panel>

                    {/* Top-right: Action buttons */}
                    <Panel position="top-right" className="m-3 md:m-4 flex gap-2">
                        <button
                            onClick={() => handleSave(false)}
                            disabled={isSaving}
                            className="bg-[#0F0F0F]/90 backdrop-blur-md border border-white/10 px-3 md:px-6 py-2.5 rounded-xl font-mono text-[11px] font-bold tracking-widest text-gray-400 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            <Save size={14} />
                            <span className="hidden sm:inline">COMMIT DRAFT</span>
                        </button>
                        <button
                            onClick={() => handleSave(true)}
                            disabled={isSaving}
                            className="bg-stellar-teal px-4 md:px-8 py-2.5 rounded-xl font-mono text-[11px] font-black tracking-widest text-black hover:bg-cyan-400 shadow-[0_0_20px_rgba(0,243,255,0.3)] transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            <Play size={14} fill="currentColor" />
                            <span className="hidden sm:inline">COMPILE KERNEL</span>
                            <span className="sm:hidden">RUN</span>
                        </button>
                    </Panel>

                    {/* Bottom-right: history + export */}
                    <Panel position="bottom-right" className="m-3 md:m-4">
                        <div className="flex flex-col gap-2">
                            <button
                                onClick={() => setShowHistory(true)}
                                className="bg-[#0F0F0F]/90 backdrop-blur-md border border-white/10 p-3 rounded-xl text-gray-400 hover:text-white transition-all shadow-xl group relative"
                            >
                                <History size={18} />
                                <span className="absolute right-full mr-2 px-2 py-1 bg-black text-[10px] text-stellar-teal border border-white/10 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap hidden md:block">VIEW KERNEL LOGS</span>
                            </button>
                            <button
                                onClick={handleExport}
                                className="bg-[#0F0F0F]/90 backdrop-blur-md border border-white/10 p-3 rounded-xl text-gray-400 hover:text-white transition-all shadow-xl group relative"
                            >
                                <Download size={18} />
                                <span className="absolute right-full mr-2 px-2 py-1 bg-black text-[10px] text-gray-400 border border-white/10 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap hidden md:block">EXPORT SCHEMA</span>
                            </button>
                        </div>
                    </Panel>
                </ReactFlow>
            </div>

            {/* Kernel History Panel */}
            <AnimatePresence>
                {showHistory && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowHistory(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 h-full w-full max-w-[400px] bg-[#0A0A0A] border-l border-white/10 z-[101] shadow-2xl flex flex-col"
                        >
                            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-black/40">
                                <div>
                                    <h2 className="text-sm font-black tracking-[0.2em] text-white uppercase font-mono">Kernel Archives</h2>
                                    <p className="text-[10px] text-gray-500 font-mono mt-1 uppercase tracking-wider">Neural storage uplink active</p>
                                </div>
                                <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white transition-all">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                                {isLoadingHistory ? (
                                    <div className="flex flex-col items-center justify-center h-64 space-y-4">
                                        <div className="w-8 h-8 border-2 border-stellar-teal border-t-transparent rounded-full animate-spin"></div>
                                        <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Scanning Uplink...</p>
                                    </div>
                                ) : history.length === 0 ? (
                                    <div className="text-center p-12 space-y-3">
                                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mx-auto border border-white/5">
                                            <Database size={20} className="text-gray-600" />
                                        </div>
                                        <p className="text-[11px] font-mono text-gray-500 uppercase">Archive Empty</p>
                                    </div>
                                ) : (
                                    history.map((strat, i) => (
                                        <motion.button
                                            key={strat.id || i}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            onClick={() => loadKernel(strat)}
                                            className="w-full text-left p-4 bg-[#111] border border-white/5 rounded-2xl hover:border-stellar-teal/30 hover:bg-[#161616] transition-all group flex gap-4"
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-stellar-teal/5 border border-stellar-teal/10 flex items-center justify-center shrink-0 group-hover:bg-stellar-teal/20 transition-colors">
                                                <span className="text-lg">{strat.emoji || '🤖'}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1 gap-2">
                                                    <h3 className="text-xs font-bold text-gray-200 group-hover:text-white truncate font-mono uppercase tracking-tight">
                                                        {strat.name}
                                                    </h3>
                                                    <div className="flex items-center gap-1 shrink-0">
                                                        {strat.asset && (
                                                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${strat.asset === 'USDC' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                                                {strat.asset}
                                                            </span>
                                                        )}
                                                        <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold tracking-tighter ${strat.status === 'RUNNING' ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                                            {strat.status}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 text-[9px] text-gray-500 font-mono">
                                                    <span className="flex items-center gap-1"><Clock size={10} /> {new Date(strat.created_at).toLocaleDateString()}</span>
                                                    <span className="flex items-center gap-1 font-bold text-stellar-teal/60">{strat.yield} APIA</span>
                                                </div>
                                            </div>
                                            <div className="self-center">
                                                <ChevronRight size={14} className="text-gray-700 group-hover:text-stellar-teal transition-colors" />
                                            </div>
                                        </motion.button>
                                    ))
                                )}
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
        <main className="h-screen w-screen bg-[#0A0A0A] text-white flex flex-col font-sans selection:bg-stellar-teal/30 overflow-hidden">
            <Navbar />

            {/* Mobile banner for touch hint */}
            <div className="md:hidden flex items-center gap-2 bg-stellar-teal/5 border-b border-stellar-teal/10 px-4 py-2 text-[11px] text-stellar-teal/70 font-mono shrink-0">
                <MousePointer2 size={12} />
                Tap the ☰ button to open the Component Lab. Pinch to zoom the canvas.
            </div>

            <div className="h-[64px] md:h-[90px] w-full shrink-0"></div>

            <div className="flex-1 flex overflow-hidden border-t border-white/5 bg-[radial-gradient(circle_at_top,rgba(0,243,255,0.05),transparent_40%)]">
                <ReactFlowProvider>
                    <StrategyBuilderInner />
                </ReactFlowProvider>
            </div>

            <style jsx global>{`
                .react-flow__handle {
                    width: 8px; height: 8px;
                    background: #2DEBE8 !important;
                    border: 2px solid #000 !important;
                }
                .react-flow__attribution { display: none; }
                .react-flow__controls-button {
                    background: #1A1A1A !important;
                    border-bottom: 1px solid #333 !important;
                    color: #666 !important; fill: #666 !important;
                }
                .react-flow__controls-button:hover {
                    background: #222 !important;
                    color: #fff !important; fill: #fff !important;
                }
                .react-flow__edge-path { stroke-width: 2.5; }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #2DEBE8; }
            `}</style>
        </main>
    );
}
