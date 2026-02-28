'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import {
    LucideIcon, Plus, Play, Save, Box, Activity, Zap, ArrowRight, Trash2,
    Settings, Search, ZoomIn, ZoomOut, Undo, Redo,
    LayoutGrid, Cpu, History, Clock, Landmark, Coins, Shield, Database,
    Twitter, MessageSquare, Bell, Share2, BarChart3, Fingerprint, Lock, Repeat, RefreshCw,
    Layers, MousePointer2, Info, ChevronRight, Download, Bolt, KeyRound, TrendingUp, FlaskConical
} from 'lucide-react';

const ICON_MAP: any = {
    Plus, Play, Save, Box, Activity, Zap, ArrowRight, Trash2,
    Settings, Search, ZoomIn, ZoomOut, Undo, Redo,
    LayoutGrid, Cpu, History, Clock, Landmark, Coins, Shield, Database,
    Twitter, MessageSquare, Bell, Share2, BarChart3, Fingerprint, Lock, Repeat, RefreshCw,
    Layers, MousePointer2, Info, ChevronRight, Download,
    // Atomic Engine icons
    Bolt, KeyRound, TrendingUp, FlaskConical
};

export interface CustomNodeData {
    label: string;
    icon: LucideIcon;
    type: string;
    sublabel?: string;
    color?: string;
}

const CustomNode = ({ data, selected }: NodeProps) => {
    const Icon = typeof data.icon === 'string' ? ICON_MAP[data.icon] || Box : (data.icon as LucideIcon || Box);
    const gradColor = (data.color as string) || 'from-gray-500 to-gray-700';

    return (
        <div className={`
            w-44 sm:w-56 md:w-64
            rounded-2xl backdrop-blur-md border transition-all duration-300
            ${selected
                ? 'border-stellar-teal bg-[#121212]/90 shadow-[0_0_25px_rgba(45,235,232,0.4)] scale-105 z-50'
                : 'border-white/5 bg-[#121212]/80 hover:border-white/20 shadow-xl'
            }
        `}>
            {/* Accent Bar */}
            <div className={`h-1 w-[80%] mx-auto mt-2 rounded-full bg-gradient-to-r ${gradColor} opacity-50 group-hover:opacity-100 transition-opacity`} />

            {/* Input Port */}
            <Handle
                type="target"
                position={Position.Left}
                className="!w-4 !h-4 !border-[3px] !border-[#030303] !bg-stellar-teal !shadow-[0_0_10px_rgba(45,235,232,0.5)] transition-transform hover:scale-125"
                style={{ left: '-8px' }}
            />

            <div className="p-3 sm:p-4 md:p-5">
                <div className="flex items-center gap-3 sm:gap-4">
                    <div className={`p-2 rounded-xl bg-white/5 border border-white/5 shrink-0 transition-colors ${selected ? 'text-stellar-teal bg-stellar-teal/10 border-stellar-teal/20' : 'text-gray-400'
                        }`}>
                        <Icon size={18} />
                    </div>
                    <div className="flex-1 overflow-hidden min-w-0">
                        <h4 className="text-[10px] sm:text-xs font-bold text-white truncate leading-tight mb-1 uppercase tracking-wider font-mono italic">
                            {String(data.label)}
                        </h4>
                        <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                            <span className="text-[8px] sm:text-[9px] text-gray-500 font-mono uppercase bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                                {data.type as string}
                            </span>
                            {!!data.sublabel && (
                                <span className="text-[8px] sm:text-[9px] text-stellar-teal font-mono uppercase truncate opacity-80 font-bold">
                                    {data.sublabel as string}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Output Port */}
            <Handle
                type="source"
                position={Position.Right}
                className="!w-4 !h-4 !border-[3px] !border-[#030303] !bg-stellar-teal !shadow-[0_0_10px_rgba(45,235,232,0.5)] transition-transform hover:scale-125"
                style={{ right: '-8px' }}
            />

            {/* Selection Highlight */}
            {selected && (
                <div className="absolute inset-0 rounded-2xl border border-stellar-teal animate-pulse pointer-events-none opacity-20"></div>
            )}
        </div>
    );
};

export default memo(CustomNode);
