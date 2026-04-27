'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

const BANNER_STORAGE_KEY = 'nirium-testnet-banner-dismissed';

export default function TestnetBanner() {
    const [dismissed, setDismissed] = useState(true); // Start dismissed to avoid flash

    useEffect(() => {
        // Check sessionStorage (reset per session)
        const isDismissed = sessionStorage.getItem(BANNER_STORAGE_KEY) === 'true';
        setDismissed(isDismissed);
    }, []);

    const handleDismiss = () => {
        sessionStorage.setItem(BANNER_STORAGE_KEY, 'true');
        setDismissed(true);
    };

    if (dismissed) return null;

    return (
        <div
            role="banner"
            aria-label="Testnet Notice: Nirium is currently deployed on Stellar Testnet with no real monetary value"
            className="relative z-[100] w-full bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-amber-500/10 border-b border-amber-500/30 backdrop-blur-sm"
        >
            <div className="max-w-[1600px] mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex items-center gap-2 shrink-0">
                        <span className="text-lg" aria-hidden="true">🧪</span>
                        <AlertTriangle className="w-4 h-4 text-amber-400 hidden sm:block" />
                    </div>
                    <p className="text-[11px] sm:text-xs font-mono text-amber-200/90 leading-relaxed truncate sm:whitespace-normal">
                        <span className="font-bold text-amber-300">Nirium is currently deployed on Stellar Testnet.</span>
                        {' '}
                        <span className="hidden xs:inline">All operations use test tokens. </span>
                        <span className="hidden sm:inline">SCF 7.0 Verified & CoC Compliant (April 2026).</span>
                    </p>
                </div>
                <button
                    onClick={handleDismiss}
                    className="shrink-0 p-1.5 rounded-lg hover:bg-white/10 transition-colors group"
                    aria-label="Dismiss testnet notice"
                >
                    <X className="w-3.5 h-3.5 text-amber-400/70 group-hover:text-white transition-colors" />
                </button>
            </div>
        </div>
    );
}
