'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { GlassNavbar } from '@/components/ui/GlassNavbar';
import { GlassCard, GlassCardHeader, GlassCardContent } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassInput } from '@/components/ui/GlassInput';

const NeuralCanvas = dynamic(
    () => import('@/components/3d/NeuralCanvas').then((mod) => mod.NeuralCanvas),
    { ssr: false }
);

// Dynamic import for Monaco Editor
const MonacoEditor = dynamic(
    () => import('@monaco-editor/react').then((mod) => mod.default),
    { ssr: false }
);

interface APIKey {
    id: string;
    name: string;
    key: string;
    created: Date;
    lastUsed: Date | null;
    credits: number;
    status: 'active' | 'revoked' | 'expired';
}

interface Transaction {
    id: string;
    timestamp: Date;
    type: 'payment' | 'refund';
    amount: number;
    asset: string;
    destination: string;
    memo: string;
    status: 'success' | 'pending' | 'failed';
}

const mockAPIKeys: APIKey[] = [
    {
        id: 'key_1',
        name: 'Production Agent',
        key: 'x402_prod_8f3a2b1c4d5e6f7g8h9i0j',
        created: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000),
        credits: 847.5,
        status: 'active',
    },
    {
        id: 'key_2',
        name: 'Development Agent',
        key: 'x402_dev_1a2b3c4d5e6f7g8h9i0j1k',
        created: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        lastUsed: new Date(Date.now() - 24 * 60 * 60 * 1000),
        credits: 245.0,
        status: 'active',
    },
    {
        id: 'key_3',
        name: 'Test Agent (Expired)',
        key: 'x402_test_xyz123abc456def789',
        created: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        lastUsed: null,
        credits: 0,
        status: 'expired',
    },
];

const mockTransactions: Transaction[] = [
    {
        id: 'tx_1',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        type: 'payment',
        amount: 5.0,
        asset: 'USDC',
        destination: 'GDQP2K...X4VJ',
        memo: 'neural-compute-v1',
        status: 'success',
    },
    {
        id: 'tx_2',
        timestamp: new Date(Date.now() - 25 * 60 * 1000),
        type: 'payment',
        amount: 12.5,
        asset: 'USDC',
        destination: 'GDQP2K...X4VJ',
        memo: 'data-access-batch',
        status: 'success',
    },
    {
        id: 'tx_3',
        timestamp: new Date(Date.now() - 60 * 60 * 1000),
        type: 'payment',
        amount: 3.25,
        asset: 'USDC',
        destination: 'GDQP2K...X4VJ',
        memo: 'api-request-7821',
        status: 'pending',
    },
    {
        id: 'tx_4',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        type: 'refund',
        amount: 1.0,
        asset: 'USDC',
        destination: 'GBX8H9...R2QK',
        memo: 'failed-request-refund',
        status: 'success',
    },
];

const sampleCode = `// Example x402 Payment Flow with Stellar SDK
import { StellarPaymentAdapter } from '@nirium/stellar';

async function handlePaymentRequired(response: Response) {
  // Extract x402 headers
  const chain = response.headers.get('x402-chain');
  const amount = parseFloat(response.headers.get('x402-amount') || '0');
  const destination = response.headers.get('x402-destination');
  const token = response.headers.get('x402-token');
  
  if (chain !== 'stellar') {
    throw new Error('Unsupported chain');
  }
  
  // Build and sign the payment transaction
  const adapter = new StellarPaymentAdapter({
    sourceSecretKey: process.env.STELLAR_SECRET_KEY,
    networkPassphrase: 'Public Global Stellar Network ; September 2015',
  });
  
  const txHash = await adapter.pay({
    destination,
    amount,
    asset: token,
    memo: 'x402-payment',
  });
  
  // Retry original request with payment proof
  const retryResponse = await fetch(response.url, {
    headers: {
      'Authorization': \`x402 \${txHash}\`,
    },
  });
  
  return retryResponse;
}

// Usage in your AI agent
const response = await fetch('/api/neural-compute', {
  method: 'POST',
  body: JSON.stringify({ prompt: 'Analyze market data...' }),
});

if (response.status === 402) {
  const paidResponse = await handlePaymentRequired(response);
  const result = await paidResponse.json();
  console.log('Compute result:', result);
}`;

export default function LabPage() {
    const [code, setCode] = useState(sampleCode);
    const [consoleOutput, setConsoleOutput] = useState<string[]>([
        '[INFO] x402 Development Console initialized',
        '[INFO] Connected to Stellar Testnet',
        '[INFO] Monitoring 3 active API keys',
    ]);
    const [isRunning, setIsRunning] = useState(false);

    const runCode = async () => {
        setIsRunning(true);
        setConsoleOutput((prev) => [
            ...prev,
            '',
            '[RUN] Executing code...',
        ]);

        // Simulate execution
        await new Promise((resolve) => setTimeout(resolve, 500));
        setConsoleOutput((prev) => [
            ...prev,
            '[402] Payment Required - Amount: 5.0 USDC',
        ]);

        await new Promise((resolve) => setTimeout(resolve, 800));
        setConsoleOutput((prev) => [
            ...prev,
            '[TX] Building transaction: GDQP2K...X4VJ ← 5.0 USDC',
        ]);

        await new Promise((resolve) => setTimeout(resolve, 1000));
        setConsoleOutput((prev) => [
            ...prev,
            '[TX] Transaction signed: 8a3f...c91e',
            '[TX] Submitted to horizon.stellar.org',
        ]);

        await new Promise((resolve) => setTimeout(resolve, 600));
        setConsoleOutput((prev) => [
            ...prev,
            '[OK] Payment confirmed in ledger #52847291',
            '[OK] API access granted - Token valid for 3600s',
            '[RESULT] Neural compute response received',
            '',
        ]);

        setIsRunning(false);
    };

    const [now, setNow] = useState<number | null>(null);
    useEffect(() => {
        // eslint-disable-next-line
        setNow(Date.now());
    }, []);

    const formatTime = (date: Date) => {
        if (!now) return '...';
        const diff = (now - date.getTime()) / 1000 / 60;
        if (diff < 60) return `${Math.round(diff)}m ago`;
        if (diff < 1440) return `${Math.round(diff / 60)}h ago`;
        return `${Math.round(diff / 1440)}d ago`;
    };

    return (
        <main className="relative min-h-screen">
            <NeuralCanvas />
            <GlassNavbar />

            <div className="content-layer pt-28 pb-12 px-4">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                            Neural <span className="gradient-text">Lab</span>
                        </h1>
                        <p className="text-white/50">
                            x402 Development Environment • Debug agent transactions and manage API keys
                        </p>
                    </motion.div>

                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* Code Editor */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="lg:col-span-2"
                        >
                            <GlassCard variant="elevated" size="lg">
                                <GlassCardHeader
                                    title="x402 Transaction Debugger"
                                    subtitle="Test payment flows in sandbox mode"
                                    icon={<span className="text-cyan-400">⌬</span>}
                                    action={
                                        <div className="flex gap-2">
                                            <GlassButton
                                                variant="primary"
                                                size="sm"
                                                onClick={runCode}
                                                loading={isRunning}
                                            >
                                                Run Code
                                            </GlassButton>
                                            <GlassButton variant="ghost" size="sm">
                                                Format
                                            </GlassButton>
                                        </div>
                                    }
                                />
                                <div className="mt-4 rounded-xl overflow-hidden border border-white/10">
                                    <MonacoEditor
                                        height="350px"
                                        language="typescript"
                                        theme="vs-dark"
                                        value={code}
                                        onChange={(value) => setCode(value || '')}
                                        options={{
                                            minimap: { enabled: false },
                                            fontSize: 13,
                                            fontFamily: 'JetBrains Mono, monospace',
                                            padding: { top: 16 },
                                            scrollBeyondLastLine: false,
                                            lineNumbers: 'on',
                                            renderLineHighlight: 'gutter',
                                            cursorBlinking: 'smooth',
                                            automaticLayout: true,
                                        }}
                                    />
                                </div>

                                {/* Console Output */}
                                <div className="mt-4 rounded-xl bg-black/60 border border-white/10 p-4 font-mono text-sm h-40 overflow-y-auto">
                                    {consoleOutput.map((line, index) => (
                                        <div
                                            key={index}
                                            className={`
                        ${line.includes('[ERROR]') ? 'text-red-400' : ''}
                        ${line.includes('[OK]') || line.includes('[RESULT]') ? 'text-green-400' : ''}
                        ${line.includes('[TX]') ? 'text-purple-400' : ''}
                        ${line.includes('[402]') ? 'text-yellow-400' : ''}
                        ${line.includes('[INFO]') || line.includes('[RUN]') ? 'text-cyan-400' : ''}
                        ${!line ? 'h-4' : ''}
                      `}
                                        >
                                            {line}
                                        </div>
                                    ))}
                                </div>
                            </GlassCard>
                        </motion.div>

                        {/* API Keys */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <GlassCard variant="glow" size="lg" className="h-full">
                                <GlassCardHeader
                                    title="API Keys"
                                    subtitle="Manage x402 credentials"
                                    icon={<span className="text-purple-400">🔑</span>}
                                    action={
                                        <GlassButton variant="ghost" size="sm">
                                            + New
                                        </GlassButton>
                                    }
                                />
                                <GlassCardContent>
                                    <div className="space-y-4">
                                        {mockAPIKeys.map((apiKey) => (
                                            <div
                                                key={apiKey.id}
                                                className="p-4 rounded-xl bg-white/5 border border-white/10"
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-white font-medium">{apiKey.name}</span>
                                                    <span
                                                        className={`
                              px-2 py-0.5 rounded text-xs font-medium
                              ${apiKey.status === 'active'
                                                                ? 'bg-green-500/20 text-green-400'
                                                                : apiKey.status === 'revoked'
                                                                    ? 'bg-red-500/20 text-red-400'
                                                                    : 'bg-gray-500/20 text-gray-400'
                                                            }
                            `}
                                                    >
                                                        {apiKey.status}
                                                    </span>
                                                </div>
                                                <div className="font-mono text-xs text-white/40 mb-2 truncate">
                                                    {apiKey.key.slice(0, 15)}...{apiKey.key.slice(-8)}
                                                </div>
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-white/40">
                                                        {apiKey.lastUsed ? `Used ${formatTime(apiKey.lastUsed)}` : 'Never used'}
                                                    </span>
                                                    <span className="text-cyan-400">{apiKey.credits} USDC</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </GlassCardContent>
                            </GlassCard>
                        </motion.div>

                        {/* Transaction History */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="lg:col-span-3"
                        >
                            <GlassCard variant="default" size="lg">
                                <GlassCardHeader
                                    title="x402 Transaction History"
                                    subtitle="Recent agent payment activity"
                                    icon={<span className="text-cyan-400">◈</span>}
                                    action={
                                        <GlassInput
                                            placeholder="Search transactions..."
                                            size="sm"
                                            className="w-64"
                                        />
                                    }
                                />
                                <GlassCardContent>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="text-white/40 text-sm border-b border-white/10">
                                                    <th className="text-left py-3 pr-4">Time</th>
                                                    <th className="text-left py-3 pr-4">Type</th>
                                                    <th className="text-right py-3 pr-4">Amount</th>
                                                    <th className="text-left py-3 pr-4">Destination</th>
                                                    <th className="text-left py-3 pr-4">Memo</th>
                                                    <th className="text-right py-3">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {mockTransactions.map((tx, index) => (
                                                    <motion.tr
                                                        key={tx.id}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: 0.4 + index * 0.05 }}
                                                        className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors cursor-pointer"
                                                    >
                                                        <td className="py-3 pr-4 text-white/60 text-sm">
                                                            {formatTime(tx.timestamp)}
                                                        </td>
                                                        <td className="py-3 pr-4">
                                                            <span
                                                                className={`
                                  px-2 py-1 rounded text-xs font-medium
                                  ${tx.type === 'payment'
                                                                        ? 'bg-cyan-500/20 text-cyan-400'
                                                                        : 'bg-purple-500/20 text-purple-400'
                                                                    }
                                `}
                                                            >
                                                                {tx.type}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 pr-4 text-right">
                                                            <span
                                                                className={`font-mono ${tx.type === 'payment' ? 'text-white' : 'text-green-400'
                                                                    }`}
                                                            >
                                                                {tx.type === 'payment' ? '-' : '+'}
                                                                {tx.amount.toFixed(2)} {tx.asset}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 pr-4 font-mono text-white/60 text-sm">
                                                            {tx.destination}
                                                        </td>
                                                        <td className="py-3 pr-4 text-white/50 text-sm">
                                                            {tx.memo}
                                                        </td>
                                                        <td className="py-3 text-right">
                                                            <span
                                                                className={`
                                  px-2 py-1 rounded text-xs font-medium
                                  ${tx.status === 'success'
                                                                        ? 'bg-green-500/20 text-green-400'
                                                                        : tx.status === 'pending'
                                                                            ? 'bg-yellow-500/20 text-yellow-400'
                                                                            : 'bg-red-500/20 text-red-400'
                                                                    }
                                `}
                                                            >
                                                                {tx.status}
                                                            </span>
                                                        </td>
                                                    </motion.tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </GlassCardContent>
                            </GlassCard>
                        </motion.div>
                    </div>
                </div>
            </div>
        </main>
    );
}
