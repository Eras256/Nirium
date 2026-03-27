'use client';

import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { 
    Key, Shield, Zap, Send, Building2, Mail, Wallet, 
    Copy, CheckCircle2, Server, Activity, Lock, Terminal, ChevronRight
} from 'lucide-react';
import { useFreighter } from '@/hooks/useFreighter';

export default function SandboxPage() {
    const { address, isConnected } = useFreighter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [copied, setCopied] = useState(false);

    const [formData, setFormData] = useState({
        companyName: '',
        contactEmail: '',
        walletAddress: '',
        tier: 'institutional'
    });

    // Auto-fill wallet address if connected
    if (isConnected && address && !formData.walletAddress) {
        setFormData(prev => ({ ...prev, walletAddress: address }));
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success("API Key copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.companyName || !formData.contactEmail || !formData.walletAddress) {
            toast.error("Please fill all required fields");
            return;
        }

        setIsSubmitting(true);
        const loadingToast = toast.loading("Provisioning institutional sandbox...");

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const response = await fetch(`${API_URL}/api/sandbox/request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to request sandbox');
            }

            setResult(data);
            toast.dismiss(loadingToast);
            toast.success("Sandbox environment provisioned successfully!");
            
        } catch (error: any) {
            toast.dismiss(loadingToast);
            toast.error(error.message || "An error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen pt-56 pb-20 relative">
            <Navbar />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Hero Section */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-[#00f0ff] text-sm font-medium mb-6">
                            <Shield className="w-4 h-4" />
                            <span>Institutional API Access</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
                            Nirium <span className="text-gradient">Sandbox Program</span>
                        </h1>
                        <p className="text-xl text-gray-400">
                            Enterprise-grade autonomous infrastructure for trading firms and fintechs. 
                            Request your API keys to evaluate our dual-layer intelligence protocol.
                        </p>
                    </motion.div>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 items-start">
                    
                    {/* Left Column: Tiers & Info */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="space-y-8"
                    >
                        <div className="glass-panel rounded-2xl p-8 hover:border-[#00f0ff]/30 transition-all duration-300">
                            <div className="flex items-center gap-4 mb-6">
                                <Server className="w-8 h-8 text-[#00f0ff]" />
                                <div>
                                    <h3 className="text-2xl font-bold">Institutional Tier</h3>
                                    <p className="text-gray-400">Default Sandbox Profile</p>
                                </div>
                            </div>
                            
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-[#39ff14] mt-0.5 shrink-0" />
                                    <span className="text-gray-300"><strong>10,000 requests/day</strong> for comprehensive integration testing</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-[#39ff14] mt-0.5 shrink-0" />
                                    <span className="text-gray-300"><strong>500 max strategies/day</strong> across multiple assets</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-[#39ff14] mt-0.5 shrink-0" />
                                    <span className="text-gray-300">90-day active duration with extension available upon request</span>
                                </li>
                            </ul>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-black/50 border border-white/5 rounded-xl p-4 text-center">
                                    <Activity className="w-6 h-6 text-[#8a2be2] mx-auto mb-2" />
                                    <div className="text-sm text-gray-400">Rate Limit</div>
                                    <div className="font-mono text-lg font-bold">300 req/min</div>
                                </div>
                                <div className="bg-black/50 border border-white/5 rounded-xl p-4 text-center">
                                    <Zap className="w-6 h-6 text-[#FFC800] mx-auto mb-2" />
                                    <div className="text-sm text-gray-400">SLA Priority</div>
                                    <div className="font-mono text-lg font-bold">High</div>
                                </div>
                            </div>
                        </div>

                        <div className="glass-panel border-white/5 rounded-2xl p-6">
                            <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                <Lock className="w-5 h-5 text-gray-400" />
                                Security Architecture
                            </h4>
                            <p className="text-sm text-gray-400 leading-relaxed">
                                Our API utilizes SHA-256 hashed keys and JWT tokens with role-based access control (RBAC). 
                                Webhook events are secured with HMAC cryptographic signatures to ensure payload integrity. 
                                By moving forward, you acknowledge that all executions in the sandbox run on Stellar Testnet.
                            </p>
                        </div>
                    </motion.div>

                    {/* Right Column: Dynamic Form / Result Card */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <AnimatePresence mode="wait">
                            {!result ? (
                                <motion.div 
                                    key="form"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="glass-panel p-8 rounded-2xl border-[#00f0ff]/20 relative overflow-hidden"
                                >
                                    {/* Subtly animated glow behind the form */}
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#00f0ff] opacity-5 rounded-full blur-[100px] pointer-events-none" />
                                    
                                    <h3 className="text-2xl font-bold mb-2">Request Access</h3>
                                    <p className="text-gray-400 text-sm mb-6 pb-6 border-b border-white/10">
                                        Fill out this form to instantly provision your endpoints.
                                    </p>

                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-300">Company Name</label>
                                            <div className="relative">
                                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                                <input 
                                                    type="text"
                                                    required
                                                    value={formData.companyName}
                                                    onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                                                    className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[#00f0ff]/50 focus:ring-1 focus:ring-[#00f0ff]/50 transition-all"
                                                    placeholder="Nexus Global Solutions S.A."
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-300">Contact Email</label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                                <input 
                                                    type="email"
                                                    required
                                                    value={formData.contactEmail}
                                                    onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
                                                    className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[#00f0ff]/50 focus:ring-1 focus:ring-[#00f0ff]/50 transition-all"
                                                    placeholder="technical@company.com"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-300 flex justify-between">
                                                <span>Stellar Wallet Address</span>
                                                {isConnected && <span className="text-[#00f0ff] text-xs">Auto-filled via Freighter</span>}
                                            </label>
                                            <div className="relative">
                                                <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                                <input 
                                                    type="text"
                                                    required
                                                    value={formData.walletAddress}
                                                    onChange={(e) => setFormData({...formData, walletAddress: e.target.value})}
                                                    className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[#00f0ff]/50 focus:ring-1 focus:ring-[#00f0ff]/50 transition-all font-mono text-sm"
                                                    placeholder="G..."
                                                />
                                            </div>
                                        </div>

                                        <button 
                                            type="submit" 
                                            disabled={isSubmitting}
                                            className="w-full py-4 mt-4 bg-white text-black font-semibold rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2 group"
                                        >
                                            {isSubmitting ? 'Provisioning Environment...' : 'Initialize Sandbox'}
                                            {!isSubmitting && <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                                        </button>
                                    </form>
                                </motion.div>
                            ) : (
                                <motion.div 
                                    key="result"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="glass-panel p-8 rounded-2xl border-[#39ff14]/30 bg-[#39ff14]/5 relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#39ff14] opacity-20 rounded-full blur-[80px]" />
                                    
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 rounded-full bg-[#39ff14]/20 text-[#39ff14]">
                                            <Key className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-2xl font-bold">API Access Granted</h3>
                                    </div>
                                    
                                    <p className="text-red-400 text-sm font-medium mb-4 flex items-center gap-2">
                                        ⚠️ Save this key now. It will not be shown again.
                                    </p>

                                    <div className="bg-black border border-white/10 rounded-xl p-4 mb-6 relative group">
                                        <code className="text-[#39ff14] font-mono whitespace-pre-wrap break-all text-sm">
                                            {result.account.apiKey}
                                        </code>
                                        <button 
                                            onClick={() => copyToClipboard(result.account.apiKey)}
                                            className="absolute top-1/2 -translate-y-1/2 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur text-white opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            {copied ? <CheckCircle2 className="w-4 h-4 text-[#39ff14]" /> : <Copy className="w-4 h-4" />}
                                        </button>
                                    </div>

                                    <div className="space-y-3 mb-8">
                                        <div className="flex justify-between text-sm py-2 border-b border-white/5">
                                            <span className="text-gray-400">Environment</span>
                                            <span className="text-white font-medium">Testnet</span>
                                        </div>
                                        <div className="flex justify-between text-sm py-2 border-b border-white/5">
                                            <span className="text-gray-400">Tier</span>
                                            <span className="text-[#00f0ff] font-medium capitalize">{result.account.tier}</span>
                                        </div>
                                        <div className="flex justify-between text-sm py-2 border-b border-white/5">
                                            <span className="text-gray-400">Valid Until</span>
                                            <span className="text-white font-medium">
                                                {new Date(result.account.expiresAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="bg-black/50 border border-white/5 rounded-xl p-5 mb-6">
                                        <h4 className="flex items-center gap-2 text-sm font-semibold mb-3">
                                            <Terminal className="w-4 h-4 text-gray-400" />
                                            Quick Test
                                        </h4>
                                        <pre className="text-xs text-gray-300 overflow-x-auto whitespace-pre-wrap font-mono relative">
                                            curl -H "x-api-key: {result.account.apiKey}" https://api.nirium.xyz/api/sandbox/status
                                        </pre>
                                    </div>

                                    <a 
                                        href="/docs" 
                                        className="inline-flex w-full items-center justify-center gap-2 text-sm font-medium text-white bg-white/5 hover:bg-white/10 border border-white/10 py-3 rounded-xl transition-all"
                                    >
                                        Read API Documentation
                                        <ChevronRight className="w-4 h-4" />
                                    </a>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                </div>
            </div>
        </main>
    );
}
