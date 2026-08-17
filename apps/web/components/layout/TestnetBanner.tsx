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
            aria-label="Network notice: Nirium settlement and audit run on Stellar mainnet; the treasury vault is audit-gated on testnet"
            className="relative z-[100] w-full bg-gradient-to-r from-emerald-500/10 via-emerald-500/15 to-emerald-500/10 border-b border-emerald-500/25 backdrop-blur-sm"
        >
            <div className="max-w-[1600px] mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex items-center gap-2 shrink-0">
                        <span className="relative flex h-2 w-2" aria-hidden="true">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                        </span>
                    </div>
                    <p className="text-[11px] sm:text-xs font-mono text-emerald-700 dark:text-emerald-200/90 leading-relaxed truncate sm:whitespace-normal">
                        <span className="font-bold text-emerald-800 dark:text-emerald-300">Live on Stellar mainnet — settlement, audit & reporting.</span>
                        {' '}
                        <span className="hidden sm:inline text-amber-600 dark:text-amber-300/80">The treasury vault stays on testnet until external audit. Non-custodial · not financial advice.</span>
                    </p>
                </div>
                <button
                    onClick={handleDismiss}
                    className="shrink-0 p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors group"
                    aria-label="Dismiss testnet notice"
                >
                    <X className="w-3.5 h-3.5 text-amber-700/70 dark:text-amber-400/70 group-hover:text-amber-900 dark:group-hover:text-white transition-colors" />
                </button>
            </div>
        </div>
    );
}
