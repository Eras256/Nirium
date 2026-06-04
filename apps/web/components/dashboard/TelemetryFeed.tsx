import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, ShieldCheck, Zap, Globe, Lock, Cpu } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function TelemetryFeed({ thoughts = [] }: { thoughts?: any[] }) {
    const { t } = useLanguage();

    return (
        <div className="bg-[#050505] border border-white/10 rounded-xl flex flex-col max-h-[480px] overflow-hidden shadow-2xl">
            <div className="px-5 py-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-stellar-teal/10 flex items-center justify-center border border-stellar-teal/20">
                        <Activity className="w-4 h-4 text-stellar-teal" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest">{t.dashboard.telemetry_feed.title}</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-[10px] text-green-500/80 font-mono font-medium tracking-wide">ACTIVE_TELEMETRY_v0.5.2</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest hidden sm:inline">{t.dashboard.telemetry_feed.uplink}</span>
                    <div className="h-4 w-[1px] bg-white/10 hidden sm:block"></div>
                    <Cpu className="w-3.5 h-3.5 text-white/20" />
                </div>
            </div>

            <div className="overflow-y-auto p-5 space-y-4 custom-scrollbar">
                <AnimatePresence mode="popLayout">
                    {thoughts.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="h-full flex flex-col items-center justify-center text-center space-y-3 py-10"
                        >
                            <div className="w-12 h-12 rounded-full border border-dashed border-white/20 flex items-center justify-center">
                                <Activity className="w-5 h-5 text-white/40" />
                            </div>
                            <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/60 px-4 leading-relaxed max-w-[200px]">
                                {t.dashboard.telemetry_feed.waiting}
                            </p>
                        </motion.div>
                    ) : (
                        thoughts.map((thought, idx) => {
                            const text = thought.content ?? thought.thought ?? thought.message ?? '';
                            return (
                                <motion.div
                                    key={thought.id ?? idx}
                                    initial={{ opacity: 0, x: -10, y: 10 }}
                                    animate={{ opacity: 1, x: 0, y: 0 }}
                                    className="group relative flex gap-4"
                                >
                                    <div className="flex flex-col items-center">
                                        <div className={`w-2.5 h-2.5 rounded-full mt-1.5 border-2 border-black z-10 ${
                                            thought.type === 'execution' ? 'bg-stellar-teal shadow-[0_0_8px_rgba(45,212,191,0.5)]' :
                                            thought.type === 'security' ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]' :
                                            'bg-white/40'
                                        }`} />
                                        <div className="flex-1 w-[1px] bg-white/10 my-1 group-last:hidden" />
                                    </div>

                                    <div className="flex-1 pb-4">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <span suppressHydrationWarning className="text-[10px] font-mono text-white/40 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                                                {new Date(thought.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                            </span>
                                            <span className={`text-[9px] font-bold uppercase tracking-wider ${
                                                thought.type === 'execution' ? 'text-stellar-teal' :
                                                thought.type === 'security' ? 'text-amber-400' :
                                                'text-white/40'
                                            }`}>
                                                {thought.agent}
                                            </span>
                                        </div>
                                        <p className="text-[12px] leading-relaxed text-gray-300 font-medium">
                                            {text}
                                        </p>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
