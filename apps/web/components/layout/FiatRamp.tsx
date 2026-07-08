'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, DollarSign, Wallet, CheckCircle, Loader2, ArrowDown, ExternalLink, Shield } from 'lucide-react';
import { useLanguage } from "@/context/LanguageContext";

export default function FiatRamp() {
    const { t } = useLanguage();
    const [amount, setAmount] = useState<string>('500');
    const [walletAddress, setWalletAddress] = useState<string>('');
    const [selectedBond, setSelectedBond] = useState<string>('CETES');
    const [status, setStatus] = useState<'idle' | 'onboarding' | 'kyc_pending' | 'quoting' | 'quoted' | 'ordering' | 'wiring' | 'success'>('idle');

    const BONDS = [
        { id: 'CETES', name: 'CETES', ref_rate: '5.57%', tvl: 'MX$476,145,215', cost: 'MX$1.13224', fiat: 'MXN' }
    ];
    const [quote, setQuote] = useState<any>(null);
    const [order, setOrder] = useState<any>(null);
    const [error, setError] = useState<string>('');
    const [kycUrl, setKycUrl] = useState<string>('');
    const [kycCustomerId, setKycCustomerId] = useState<string>('');
    const [depositClabe, setDepositClabe] = useState<string>('');
    const [depositBankName, setDepositBankName] = useState<string>('');
    const [depositAccountHolder, setDepositAccountHolder] = useState<string>('');

    const handleGetQuote = async (_overrideCustomerId?: string) => {
        if (!amount || isNaN(Number(amount)) || Number(amount) > 10000) {
            setError(t.ramp.component.errors.amount);
            return;
        }
        if (!walletAddress) {
            setError(t.ramp.component.errors.wallet);
            return;
        }

        setError('');
        setStatus('quoting');
        try {
            const bond = BONDS.find(b => b.id === selectedBond);
            const res = await fetch('/api/etherfuse', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'quote', amount, walletAddress, bondId: bond?.id, fiat: bond?.fiat })
            });
            const data = await res.json();

            if (res.status === 403) {
                setStatus('onboarding');
                const onbRes = await fetch('/api/etherfuse', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'onboarding', walletAddress })
                });
                const onbData = await onbRes.json();
                const url = onbData.presigned_url || onbData.kycDashboard || '';
                if (url) {
                    setKycUrl(url);
                    setKycCustomerId(onbData.customerId || '');
                    setStatus('kyc_pending');
                } else {
                    throw new Error(onbData.error || 'Onboarding failed');
                }
                return;
            }

            if (data.error) throw new Error(typeof data.error === 'string' ? data.error : JSON.stringify(data.error));

            setQuote(data);
            setStatus('quoted');
        } catch (e: any) {
            setError(e.message);
            setStatus('idle');
        }
    };

    const handleConfirmOrder = async () => {
        setError('');
        setStatus('ordering');
        try {
            const res = await fetch('/api/etherfuse', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'order', quoteId: quote.quoteId, walletAddress })
            });
            const data = await res.json();
            if (data.error) {
                const msg = typeof data.error === 'string' ? data.error : (data.error.message || JSON.stringify(data.error));
                if (data.code === 'QUOTE_EXPIRED' || res.status === 409) {
                    setError(msg);
                    setQuote(null);
                    setStatus('idle');
                    return;
                }
                throw new Error(msg);
            }

            setOrder(data);
            const onramp = data.onramp || data;
            setDepositClabe(onramp.depositClabe || onramp.clabe || '');
            setDepositBankName(onramp.depositBankName || onramp.bankName || '');
            setDepositAccountHolder(onramp.depositAccountHolder || onramp.accountHolder || '');
            setStatus('wiring');

            setTimeout(async () => {
                try {
                    await fetch('/api/etherfuse', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'simulate_fiat', orderId: data.orderId || data.id || data.order_id })
                    });
                    setStatus('success');
                } catch (simErr) {
                    setStatus('success');
                }
            }, 3000);

        } catch (e: any) {
            setError(e.message);
            setStatus('quoted');
        }
    };

    return (
        <>
            <div className="bg-black/40 backdrop-blur-md rounded-2xl sm:rounded-xl border border-white/10 p-5 sm:p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />

                <div className="flex items-center mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mr-4 shrink-0">
                        <DollarSign className="text-emerald-400 w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent uppercase italic tracking-tighter">{t.ramp.component.title}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">{t.ramp.component.powered_by}</p>
                            <div className="pl-2 border-l border-white/10 flex items-center gap-1.5">
                                <Shield size={10} className="text-emerald-500/50" />
                                <span className="text-[8px] font-mono text-emerald-500/50 uppercase tracking-widest">{t.ramp.component.legal.ethics_aligned}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-3 py-2 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                <AnimatePresence mode="wait">
                    {status === 'idle' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                            <div className="mb-6">
                                <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2 block">{t.ramp.component.select_bond}</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {BONDS.map(b => (
                                        <button
                                            key={b.id}
                                            onClick={() => setSelectedBond(b.id)}
                                            className={`p-3 rounded-xl border text-left transition-all ${selectedBond === b.id ? 'bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]' : 'bg-white/5 border-white/10 hover:border-white/30'}`}
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <span className={`font-black text-sm ${selectedBond === b.id ? 'text-emerald-400' : 'text-white'}`}>{b.name}</span>
                                                <span className="text-[10px] font-mono text-gray-400 bg-white/5 px-1.5 py-0.5 rounded">{b.ref_rate} Banxico</span>
                                            </div>
                                            <div className="text-[10px] text-gray-500 font-mono mb-1">TVL: {b.tvl}</div>
                                            <div className="text-[10px] text-gray-400 font-mono">Cost: {b.cost}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1 block">
                                    {t.ramp.component.form.amount_label} ({BONDS.find(b => b.id === selectedBond)?.fiat})
                                </label>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white font-mono text-lg focus:outline-none focus:border-emerald-500/50 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1 block">{t.ramp.component.form.wallet_label}</label>
                                <div className="relative">
                                    <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                                    <input
                                        type="text"
                                        value={walletAddress}
                                        onChange={e => setWalletAddress(e.target.value)}
                                        placeholder={t.ramp.component.form.wallet_placeholder}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white font-mono text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={() => handleGetQuote()}
                                className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-semibold rounded-lg py-3 mt-2 transition-all flex items-center justify-center space-x-2 group"
                            >
                                <span>{t.ramp.component.form.button}</span>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </motion.div>
                    )}

                    {(status === 'quoting' || status === 'onboarding') && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-8">
                            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-4" />
                            <p className="text-sm text-gray-400 animate-pulse">
                                {status === 'onboarding' ? t.ramp.component.status.registering : t.ramp.component.status.requesting}
                            </p>
                        </motion.div>
                    )}

                    {status === 'kyc_pending' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-6 text-center space-y-4">
                            <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                                <Wallet className="w-6 h-6 text-amber-400" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-white mb-1">{t.ramp.component.status.kyc_title}</h3>
                                <p className="text-xs text-gray-400">{t.ramp.component.status.kyc_desc}</p>
                            </div>
                            <a
                                href={kycUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="w-full flex items-center justify-center space-x-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 font-semibold rounded-lg py-3 transition-all"
                            >
                                <span>{t.ramp.component.status.kyc_button}</span>
                                <ExternalLink className="w-4 h-4" />
                            </a>
                            <button
                                onClick={() => { setStatus('idle'); setKycUrl(''); handleGetQuote(kycCustomerId || undefined); }}
                                className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                            >
                                {t.ramp.component.status.kyc_retry}
                            </button>
                        </motion.div>
                    )}

                    {status === 'quoted' && quote && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                            <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400 text-sm">{t.ramp.component.quote.source}</span>
                                    <span className="text-white font-mono font-medium">{quote.sourceAmount || quote.fromAmount || amount} {BONDS.find(b => b.id === selectedBond)?.fiat}</span>
                                </div>
                                <div className="flex justify-center -my-1">
                                    <ArrowDown className="w-4 h-4 text-emerald-500/50" />
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400 text-sm">{t.ramp.component.quote.target}</span>
                                    <span className="text-emerald-400 font-mono font-bold text-lg">{(quote.destinationAmount || quote.toAmount || quote.targetAmount || 0)} {selectedBond}</span>
                                </div>
                                <div className="pt-2 mt-2 border-t border-white/10 flex justify-between">
                                    <span className="text-xs text-gray-500">{t.ramp.component.quote.rate}: 1 {selectedBond} = {(parseFloat(quote.exchangeRate) || 1).toFixed(4)} {BONDS.find(b => b.id === selectedBond)?.fiat}</span>
                                    <span className="text-xs text-gray-500">{t.ramp.component.quote.expires}</span>
                                </div>
                            </div>

                            <div className="flex space-x-3">
                                <button onClick={() => setStatus('idle')} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg text-sm transition-colors">
                                    {t.ramp.component.quote.cancel}
                                </button>
                                <button onClick={handleConfirmOrder} className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-lg py-2 transition-colors">
                                    {t.ramp.component.quote.confirm}
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {status === 'ordering' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-8">
                            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-4" />
                            <p className="text-sm text-emerald-400 font-medium">{t.ramp.component.status.securing}</p>
                        </motion.div>
                    )}

                    {status === 'wiring' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                            <div className="flex items-center space-x-3 mb-2">
                                <Loader2 className="w-5 h-5 text-emerald-500 animate-spin flex-shrink-0" />
                                <p className="text-sm text-emerald-400 font-medium">{t.ramp.component.status.awaiting}</p>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3">
                                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">{t.ramp.component.wiring.title}</p>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-500">{t.ramp.component.wiring.clabe}</span>
                                        <span className="font-mono text-sm text-white font-bold tracking-wider">{depositClabe || '—'}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-500">{t.ramp.component.wiring.bank}</span>
                                        <span className="text-sm text-gray-300">{depositBankName || '—'}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-500">{t.ramp.component.wiring.beneficiary}</span>
                                        <span className="text-sm text-gray-300">{depositAccountHolder || '—'}</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2 border-t border-white/10">
                                        <span className="text-xs text-gray-500">{t.ramp.component.wiring.amount}</span>
                                        <span className="text-sm text-white font-mono font-medium">{amount} {BONDS.find(b => b.id === selectedBond)?.fiat}</span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 text-center">{t.ramp.component.status.simulating}</p>
                        </motion.div>
                    )}

                    {status === 'success' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-6 text-center space-y-3">
                            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-2">
                                <CheckCircle className="w-8 h-8 text-emerald-400" />
                            </div>
                            <h3 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">{t.ramp.component.success.title}</h3>
                            <p className="text-sm text-gray-400">
                                {t.ramp.component.success.desc}
                            </p>
                            <button onClick={() => setStatus('idle')} className="px-6 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg text-sm border border-white/10 mt-4 transition-colors">
                                {t.ramp.component.success.button}
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Institutional Compliance & Legal Footer */}
            <div className="mt-12 pt-8 border-t border-white/5 grid grid-cols-2 lg:grid-cols-4 gap-8 text-[10px] text-gray-500 max-w-3xl mx-auto px-4">
                <div className="flex flex-col space-y-2.5">
                    <span className="font-black text-gray-400 mb-2 uppercase tracking-widest">{t.ramp.component.legal.infrastructure}</span>
                    <a href="https://devnet.etherfuse.com/legal/stablebonds-overview" target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition-colors uppercase font-mono">Stablebonds Overview</a>
                    <a href="https://devnet.etherfuse.com/legal/dev-docs" target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition-colors uppercase font-mono">Developer Docs</a>
                </div>
                <div className="flex flex-col space-y-2.5">
                    <span className="font-black text-gray-400 mb-2 uppercase tracking-widest">{t.ramp.component.legal.compliance}</span>
                    <a href="https://devnet.etherfuse.com/legal/compliance-and-audits" target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition-colors uppercase font-mono">Audits & KYC</a>
                    <a href="https://devnet.etherfuse.com/legal/proof-of-reserves" target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition-colors uppercase font-mono">Proof of Reserves</a>
                </div>
                <div className="flex flex-col space-y-2.5">
                    <span className="font-black text-gray-400 mb-2 uppercase tracking-widest">{t.ramp.component.legal.security}</span>
                    <a href="https://devnet.etherfuse.com/legal/asset-security" target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition-colors uppercase font-mono">Asset Security</a>
                    <a href="https://devnet.etherfuse.com/legal/legal-qa" target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition-colors uppercase font-mono">Legal Support (QA)</a>
                </div>
                <div className="flex flex-col space-y-2.5">
                    <span className="font-black text-gray-400 mb-2 uppercase tracking-widest">{t.ramp.component.legal.agreements}</span>
                    <a href="https://devnet.etherfuse.com/legal/terms-and-conditions" target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition-colors uppercase font-mono">Terms & Conditions</a>
                </div>
            </div>
        </>
    );
}
