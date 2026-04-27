
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Brain, Terminal } from "lucide-react";
import { useEffect, useState } from "react";

interface Thought {
    id: string;
    agent: string;
    thought: string;
    protocol: string;
    timestamp: string;
}

import { useLanguage } from "@/context/LanguageContext";

export default function NeuralFeed() {
    const { t } = useLanguage();
    const [thoughts, setThoughts] = useState<Thought[]>([]);

    useEffect(() => {
        const fetchThoughts = async () => {
            try {
                const res = await fetch('/api/agent/thoughts');
                const data = await res.json();
                setThoughts(data);
            } catch (e) { /* silent */ }
        };

        fetchThoughts();
        const interval = setInterval(fetchThoughts, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-[#050505] border border-stellar-teal/30 rounded-2xl p-6 font-mono overflow-hidden h-[400px] flex flex-col">
            <div className="flex items-center gap-2 mb-4 border-b border-stellar-teal/20 pb-3">
                <Brain className="w-5 h-5 text-stellar-teal animate-pulse" />
                <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-stellar-teal">{t.dashboard.neural_feed.title}</h2>
                <div className="ml-auto flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
                    <span className="text-[10px] text-green-500/70">DEEPSEEK_R1_ACTIVE</span>
                </div>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto scrollbar-none">
                <AnimatePresence initial={false}>
                    {thoughts.map((t) => (
                        <motion.div
                            key={t.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-[10px] leading-relaxed border-l-2 border-stellar-teal/10 pl-3 py-1"
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-stellar-teal/50">[{new Date(t.timestamp).toLocaleTimeString()}]</span>
                                <span className="bg-stellar-teal/10 px-1 text-[8px] text-stellar-teal rounded">AGENT_{t.agent}</span>
                                <span className="text-white/20">/</span>
                                <span className="text-purple-400/50 uppercase">{t.protocol}</span>
                            </div>
                            <p className="text-white/70 italic">"{t.thought}..."</p>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {thoughts.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center opacity-20">
                        <Terminal className="w-8 h-8 mb-2" />
                        <p className="text-[10px]">{t.dashboard.neural_feed.waiting}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
