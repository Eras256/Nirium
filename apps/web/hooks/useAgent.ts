"use client";
import React, { useState, useEffect } from 'react';

// Mock hook to connect to Agent Runtime
export function useAgent() {
    const [status, setStatus] = useState<'IDLE' | 'ANALYZING' | 'EXECUTING'>('IDLE');
    const [logs, setLogs] = useState<string[]>([]);

    useEffect(() => {
        const interval = setInterval(() => {
            const thoughts = [
                "Scanning SUI/USDC spread...",
                "Calculating flash loan fees...",
                "DeepBook depth adequate.",
                "Waiting for opportunity...",
                "Opportunity found: 2.1% APY delta",
            ];
            const randomThought = thoughts[Math.floor(Math.random() * thoughts.length)];
            setLogs(prev => [randomThought, ...prev].slice(0, 5));

            // Simulate status changes
            if (Math.random() > 0.7) setStatus('ANALYZING');
            else if (Math.random() > 0.9) setStatus('EXECUTING');
            else setStatus('IDLE');
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    return { status, logs };
}
