/** Nirium Protocol — Autonomous Treasury for LatAm Fintechs (April 2026) **/
'use client';

import Link from "next/link";
import { useState, Suspense } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import {
    ArrowRight, Bot, FileCheck,
    Check, ExternalLink, Sparkles, TrendingUp, Lock,
    Building2, Workflow, ChevronRight, Zap, Layers
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import OpsConsole from "@/components/layout/OpsConsole";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/context/LanguageContext";
import LegalDisclaimer from "@/components/legal/LegalDisclaimer";

const TreasuryCanvas = dynamic(
    () => import('@/components/3d/TreasuryCanvas').then((m) => m.TreasuryCanvas),
    { ssr: false }
);

export default function Home() {
    const { language, t } = useLanguage();
    const lang = (en: string, es: string, zh: string) =>
        language === 'zh' ? zh : language === 'es' ? es : en;
    const [copied, setCopied] = useState(false);

    const codeSnippet = `import { NiriumAgent } from 'nirium';

const agent = new NiriumAgent({ apiKey: process.env.NIRIUM_KEY });

await agent.start({
    base: 'USDC',
    targetAssets: ['CETES'],
    strategy: 'spread_auto_rebalance',
    threshold: 1.5, // minimum % spread to trigger swap
});`;

    const handleCopy = () => {
        navigator.clipboard.writeText(codeSnippet);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <main className="min-h-screen bg-black text-white antialiased">
            <Navbar />
            
            <div className="w-full pt-[115px] sm:pt-[140px] px-0 sm:px-4 flex justify-center relative z-50">
                <LegalDisclaimer variant="banner" locale={language === 'es' ? 'es' : 'en'} className="w-full max-w-[1600px] sm:rounded-xl shadow-2xl" />
            </div>

            {/* HERO */}
            <section className="relative pt-8 sm:pt-12 pb-16 sm:pb-20 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(45,235,232,0.08),transparent_60%)]" />

                <div className="relative max-w-7xl mx-auto px-6">
                    <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-0">

                        {/* ── LEFT: text column ── */}
                        <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left lg:pr-12 pt-8 lg:pt-16">
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-stellar-teal/20 bg-stellar-teal/5 text-stellar-teal text-[10px] font-black uppercase tracking-widest mb-6"
                            >
                                <Sparkles className="w-3 h-3" />
                                {lang('Software B2B · Stellar Testnet · Mainnet Q3 2026', 'Software B2B · Stellar Testnet · Mainnet Q3 2026', '企业软件 · Stellar 测试网 · 主网 Q3 2026')}
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.05 }}
                                className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.05] tracking-tight"
                            >
                                {language === 'zh' ? (
                                    <>
                                        你的企业资金在睡觉。
                                        <br />
                                        <span className="bg-gradient-to-r from-stellar-teal to-stellar-yellow bg-clip-text text-transparent">
                                            我们来唤醒它。
                                        </span>
                                    </>
                                ) : language === 'es' ? (
                                    <>
                                        El dinero de tu empresa
                                        <br />
                                        <span className="bg-gradient-to-r from-stellar-teal to-stellar-yellow bg-clip-text text-transparent">
                                            está dormido. Lo activamos.
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        Your company's money
                                        <br />
                                        <span className="bg-gradient-to-r from-stellar-teal to-stellar-yellow bg-clip-text text-transparent">
                                            is sleeping. We wake it up.
                                        </span>
                                    </>
                                )}
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                                className="mt-5 text-base sm:text-lg text-white/60 max-w-xl leading-relaxed"
                            >
                                {lang(
                                    'Nirium is the software that moves your company\'s idle capital automatically — while you sleep, while you work, always. No spreadsheets. No manual transfers.',
                                    'Nirium es el software que mueve el capital inactivo de tu empresa de forma automática — mientras duermes, mientras trabajas, siempre. Sin Excel. Sin transferencias manuales.',
                                    'Nirium 是自动移动企业闲置资金的软件——无论你是否在工作，全天候运行。无需电子表格，无需手动转账。'
                                )}
                            </motion.p>

                            {/* 3 numbers */}
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.15 }}
                                className="mt-10 grid grid-cols-3 gap-6 w-full max-w-sm"
                            >
                                <div>
                                    <div className="text-2xl sm:text-3xl font-black text-white">24/7</div>
                                    <div className="text-[10px] uppercase tracking-widest text-white/40 mt-1">
                                        {lang('Runs by itself', 'Corre solo', '全天候运行')}
                                    </div>
                                </div>
                                <div className="border-x border-white/5 px-4">
                                    <div className="text-2xl sm:text-3xl font-black text-white">~4s</div>
                                    <div className="text-[10px] uppercase tracking-widest text-white/40 mt-1">
                                        {lang('Per transaction', 'Por transacción', '每笔交易')}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-2xl sm:text-3xl font-black text-white">$299</div>
                                    <div className="text-[10px] uppercase tracking-widest text-white/40 mt-1">
                                        {lang('Fixed / month', 'Fijo / mes', '固定月费')}
                                    </div>
                                </div>
                            </motion.div>

                            {/* CTAs */}
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="mt-8 flex flex-col sm:flex-row gap-3"
                            >
                                <Link href="/dashboard">
                                    <Button size="lg" variant="premium" className="w-full sm:w-auto">
                                        {lang('Try it free', 'Pruébalo gratis', '免费试用')}
                                        <ArrowRight className="ml-2 w-4 h-4" />
                                    </Button>
                                </Link>
                                <a href="mailto:hello@nirium.xyz">
                                    <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/20 hover:bg-white/5">
                                        {lang('Talk to us', 'Habla con nosotros', '联系我们')}
                                    </Button>
                                </a>
                            </motion.div>

                            {/* Status line */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.6, delay: 0.3 }}
                                className="mt-6 flex items-center gap-3 text-xs text-white/40"
                            >
                                <span className="inline-flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    {lang('Testnet live', 'Testnet en vivo', '测试网运行中')}
                                </span>
                                <span>·</span>
                                <span>{lang('Mainnet Q3 2026 after audit', 'Mainnet Q3 2026 tras auditoría', '主网 Q3 2026 审计后上线')}</span>
                            </motion.div>
                        </div>

                        {/* ── RIGHT: 3D vault orb + live terminal ── */}
                        <div className="w-full lg:w-[520px] xl:w-[580px] shrink-0 flex flex-col gap-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 1, delay: 0.2 }}
                                className="w-full h-[340px] sm:h-[420px] lg:h-[480px] relative"
                            >
                                {/* Orbit labels */}
                                <div className="absolute top-[8%] right-[6%] z-10 flex items-center gap-1.5 px-2 py-1 rounded-full border border-stellar-teal/20 bg-black/60 backdrop-blur-sm">
                                    <span className="w-1.5 h-1.5 rounded-full bg-stellar-teal animate-pulse" />
                                    <span className="text-[9px] font-mono text-stellar-teal/80">USDC</span>
                                </div>
                                <div className="absolute bottom-[18%] left-[4%] z-10 flex items-center gap-1.5 px-2 py-1 rounded-full border border-stellar-yellow/20 bg-black/60 backdrop-blur-sm">
                                    <span className="w-1.5 h-1.5 rounded-full bg-stellar-yellow animate-pulse" />
                                    <span className="text-[9px] font-mono text-stellar-yellow/80">CETES 5.57% (Banxico)</span>
                                </div>
                                <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-stellar-teal/40 font-mono text-xs animate-pulse">Loading vault...</div>}>
                                    <TreasuryCanvas />
                                </Suspense>
                            </motion.div>

                            {/* Live agent terminal */}
                            <motion.div
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.9 }}
                            >
                                <OpsConsole
                                    isExpanded={false}
                                    onToggleExpand={() => {}}
                                    heightClass="h-[200px]"
                                />
                            </motion.div>
                        </div>

                    </div>
                </div>
            </section>

            {/* THE PROBLEM */}
            <section className="py-20 border-t border-white/5">
                <div className="max-w-4xl mx-auto px-6">
                    <h2 className="text-2xl sm:text-3xl font-bold text-center text-white/90">
                        {lang('Sound familiar?', '¿Te suena familiar?', '你是否也有这些问题？')}
                    </h2>
                    <p className="mt-4 text-center text-white/50 max-w-lg mx-auto text-sm">
                        {lang(
                            'Every CFO we talk to has the same three problems.',
                            'Todos los CFO con los que hablamos tienen los mismos tres problemas.',
                            '我们交谈过的每位财务总监都有同样的三个问题。'
                        )}
                    </p>
                    <div className="mt-12 grid sm:grid-cols-3 gap-6">
                        <div className="text-center p-6 rounded-xl border border-red-500/10 bg-red-500/[0.03]">
                            <div className="text-5xl font-black text-red-400/80">$0</div>
                            <p className="mt-3 text-sm font-semibold text-white/80">
                                {lang('Your idle cash earns nothing', 'Tu caja genera cero', '闲置资金零收益')}
                            </p>
                            <p className="mt-1 text-xs text-white/40">
                                {lang('Inflation eats it while it sits in the bank.', 'La inflación lo reduce cada mes.', '资金在银行账户中被通胀侵蚀。')}
                            </p>
                        </div>
                        <div className="text-center p-6 rounded-xl border border-red-500/10 bg-red-500/[0.03]">
                            <div className="text-5xl font-black text-red-400/80">{lang('Hours', 'Horas', '数小时')}</div>
                            <p className="mt-3 text-sm font-semibold text-white/80">
                                {lang('Lost every week to manual transfers', 'Perdidas cada semana en transferencias manuales', '每周浪费在手动转账上')}
                            </p>
                            <p className="mt-1 text-xs text-white/40">
                                {lang('Your team moves money by hand. Every. Single. Day.', 'Tu equipo mueve dinero a mano todos los días.', '你的团队每天都在手动处理资金流动。')}
                            </p>
                        </div>
                        <div className="text-center p-6 rounded-xl border border-red-500/10 bg-red-500/[0.03]">
                            <div className="text-5xl font-black text-red-400/80">{lang('Months', 'Meses', '数月')}</div>
                            <p className="mt-3 text-sm font-semibold text-white/80">
                                {lang('To build a secure in-house solution', 'Para construir una solución propia segura', '构建安全内部解决方案所需时间')}
                            </p>
                            <p className="mt-1 text-xs text-white/40">
                                {lang('If you can build it at all.', 'Si es que puedes construirla.', '如果你能建成的话。')}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* HOW IT WORKS */}
            <section className="py-20 border-t border-white/5">
                <div className="max-w-5xl mx-auto px-6">
                    <h2 className="text-2xl sm:text-3xl font-bold text-center">
                        {lang('Three steps. That\'s it.', 'Tres pasos. Nada más.', '三步，就这么简单。')}
                    </h2>
                    <p className="mt-4 text-center text-white/60 max-w-xl mx-auto">
                        {lang(
                            'No complex setup. No dev team required. Your treasury runs itself.',
                            'Sin configuración compleja. Sin equipo de desarrollo. Tu tesorería se gestiona sola.',
                            '无需复杂配置，无需开发团队，你的资金库自动运转。'
                        )}
                    </p>

                    <div className="mt-14 grid md:grid-cols-3 gap-6">
                        {[
                            {
                                num: '01',
                                icon: Workflow,
                                title: lang('Connect once', 'Conéctate una vez', '一次接入'),
                                body: lang(
                                    'Link your company account in minutes. You keep full control — Nirium never holds your money.',
                                    'Conecta tu cuenta en minutos. Tú conservas el control total — Nirium nunca toca tu dinero.',
                                    '几分钟内连接您的企业账户。您保持完全控制——Nirium 从不持有您的资金。'
                                ),
                            },
                            {
                                num: '02',
                                icon: Bot,
                                title: lang('Set your rules', 'Define tus reglas', '设置你的规则'),
                                body: lang(
                                    'Tell Nirium when to act. "If idle cash exceeds $X, move it automatically." Simple as that.',
                                    'Dile a Nirium cuándo actuar. "Si el capital inactivo supera $X, muévelo automáticamente." Así de simple.',
                                    '告诉 Nirium 何时行动。"如果闲置资金超过 X，自动移动。"就这么简单。'
                                ),
                            },
                            {
                                num: '03',
                                icon: TrendingUp,
                                title: lang('It runs by itself', 'Se ejecuta solo', '自动运行'),
                                body: lang(
                                    'The software watches your treasury 24/7 and acts for you. Every move is logged automatically — ready for auditors.',
                                    'El software vigila tu tesorería 24/7 y actúa por ti. Cada movimiento queda registrado — listo para auditores.',
                                    '软件全天候监控您的资金库并自动行动。每次操作自动记录——随时可供审计。'
                                ),
                            },
                        ].map((step) => (
                            <div
                                key={step.num}
                                className="relative p-6 rounded-xl border border-white/10 bg-white/[0.02] hover:border-stellar-teal/30 transition-colors"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-2.5 rounded-lg bg-stellar-teal/10">
                                        <step.icon className="w-5 h-5 text-stellar-teal" />
                                    </div>
                                    <div className="text-xs font-mono text-white/30">{step.num}</div>
                                </div>
                                <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                                <p className="text-sm text-white/60 leading-relaxed">{step.body}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* SETTLEMENT RAILS: x402 & MPP */}
            <section className="py-20 border-t border-white/5 bg-gradient-to-b from-black to-stellar-teal/[0.03] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(circle_at_100%_0%,rgba(45,235,232,0.04),transparent_70%)] pointer-events-none" />
                <div className="max-w-5xl mx-auto px-6 relative z-10">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 bg-stellar-teal/10 border border-stellar-teal/20 rounded-full text-stellar-teal text-[10px] font-black uppercase tracking-widest">
                            <Zap className="w-3 h-3" />
                            {lang('For developers — payment rails', 'Para developers — rieles de pago', '开发者专区 — 支付通道')}
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold">
                            {lang('Software that pays itself', 'Software que se paga solo', '自动结算的软件')}
                        </h2>
                        <p className="mt-4 text-white/50 max-w-xl mx-auto text-sm">
                            {lang(
                                'If you build fintech apps, Nirium includes open payment standards that let your software bill and settle automatically — no manual invoices, no subscriptions.',
                                'Si construyes apps fintech, Nirium incluye estándares abiertos de pago que permiten que tu software facture y liquide automáticamente — sin facturas manuales, sin suscripciones.',
                                '如果你构建金融科技应用，Nirium 内置开放支付标准，让你的软件自动计费和结算——无需手动开票，无需订阅。'
                            )}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* x402 */}
                        <div className="group relative p-8 rounded-2xl bg-black/60 border border-white/10 hover:border-stellar-teal/40 transition-all duration-500">
                            <div className="absolute top-4 right-6 text-[36px] opacity-[0.07] font-black italic text-stellar-teal group-hover:opacity-[0.14] transition-opacity select-none">x402</div>
                            <div className="w-14 h-14 rounded-xl bg-stellar-teal/10 border border-stellar-teal/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Zap className="w-7 h-7 text-stellar-teal" />
                            </div>
                            <h3 className="text-xl font-black uppercase tracking-tight mb-3">
                                {lang('x402 — Pay per use', 'x402 — Pago por uso', 'x402 — 按使用付费')}
                            </h3>
                            <p className="text-sm text-white/55 leading-relaxed mb-6">
                                {lang(
                                    'Like a vending machine for software. Your app requests data → pays automatically → gets the data. No invoices, no subscriptions, no human in the loop.',
                                    'Como una máquina expendedora de software. Tu app solicita datos → paga automáticamente → recibe los datos. Sin facturas, sin suscripciones, sin humanos en el medio.',
                                    '就像软件自动售货机。你的应用请求数据 → 自动付款 → 获取数据。无需发票，无需订阅，无需人工介入。'
                                )}
                            </p>
                            <div className="flex items-center gap-3 pt-4 border-t border-white/[0.06]">
                                <div className="text-[9px] font-mono text-stellar-teal uppercase tracking-widest font-bold">Soroban Verified</div>
                                <div className="h-px flex-1 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        whileInView={{ width: '100%' }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 1.5, ease: 'easeOut' }}
                                        className="h-full bg-stellar-teal"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* MPP */}
                        <div className="group relative p-8 rounded-2xl bg-black/60 border border-white/10 hover:border-stellar-yellow/40 transition-all duration-500">
                            <div className="absolute top-4 right-6 text-[36px] opacity-[0.07] font-black italic text-stellar-yellow group-hover:opacity-[0.14] transition-opacity select-none">MPP</div>
                            <div className="w-14 h-14 rounded-xl bg-stellar-yellow/10 border border-stellar-yellow/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Layers className="w-7 h-7 text-stellar-yellow" />
                            </div>
                            <h3 className="text-xl font-black uppercase tracking-tight mb-3">
                                {lang('MPP — Budget per session', 'MPP — Presupuesto por sesión', 'MPP — 会话预算')}
                            </h3>
                            <p className="text-sm text-white/55 leading-relaxed mb-6">
                                {lang(
                                    'Like a prepaid card for your software. Deposit a budget, run operations, and close at the end. Perfect for payroll runs or bulk transfers — one final settlement, zero manual work.',
                                    'Como una tarjeta prepagada para tu software. Depositas un presupuesto, corres operaciones y cierras al final. Ideal para nóminas o transferencias masivas — una liquidación final, cero trabajo manual.',
                                    '就像软件的预付卡。存入预算，执行操作，最后结算。非常适合工资发放或批量转账——一次最终结算，零手动操作。'
                                )}
                            </p>
                            <div className="flex items-center gap-3 pt-4 border-t border-white/[0.06]">
                                <div className="text-[9px] font-mono text-stellar-yellow uppercase tracking-widest font-bold">Freighter Ready</div>
                                <div className="h-px flex-1 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        whileInView={{ width: '100%' }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 }}
                                        className="h-full bg-stellar-yellow"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* USE CASES */}
            <section className="py-20 border-t border-white/5">
                <div className="max-w-5xl mx-auto px-6">
                    <h2 className="text-2xl sm:text-3xl font-bold text-center">
                        {lang('Who is Nirium for?', '¿Para quién es Nirium?', 'Nirium 适合谁？')}
                    </h2>
                    <p className="mt-4 text-center text-white/50 max-w-xl mx-auto text-sm">
                        {lang(
                            'If your company moves money, Nirium saves you time and eliminates errors.',
                            'Si tu empresa mueve dinero, Nirium te ahorra tiempo y elimina errores.',
                            '如果你的企业需要移动资金，Nirium 能为你节省时间并消除错误。'
                        )}
                    </p>

                    <div className="mt-12 grid md:grid-cols-3 gap-6">
                        {[
                            {
                                num: '01',
                                color: 'border-stellar-teal/30 bg-stellar-teal/[0.04]',
                                accent: 'text-stellar-teal',
                                title: lang('Your treasury runs itself', 'Tu tesorería corre sola', '资金库自动运转'),
                                body: lang(
                                    'Your team moves capital by hand every day — hours lost, human errors, idle money. Nirium detects the right moment and acts alone.',
                                    'Tu equipo mueve capital a mano todos los días — horas perdidas, errores humanos, dinero parado. Nirium detecta el momento correcto y actúa solo.',
                                    '你的团队每天手动移动资金——浪费时间、人为错误、资金闲置。Nirium 自动检测最佳时机并独立行动。'
                                ),
                                tag: lang('Fintechs · PSPs · Mexico', 'Fintechs · PSPs · México', '金融科技 · PSP · 墨西哥'),
                            },
                            {
                                num: '02',
                                color: 'border-purple-500/20 bg-purple-500/[0.03]',
                                accent: 'text-purple-400',
                                title: lang('Your cash works when you don\'t', 'Tu caja trabaja cuando tú no', '你的资金从不休息'),
                                body: lang(
                                    'You have millions in accounts doing nothing. Inflation reduces them every month. Nirium moves your idle capital automatically, according to rules you define.',
                                    'Tienes millones en cuentas que no hacen nada. La inflación los reduce cada mes. Nirium mueve tu capital inactivo automáticamente, según reglas que tú defines.',
                                    '你的账户里有数百万闲置资金。通胀每月都在侵蚀它们。Nirium 根据你设定的规则自动移动闲置资金。'
                                ),
                                tag: lang('SaaS · SMBs $1M–$10M', 'SaaS · Empresas $1M–$10M', 'SaaS · 中小企业'),
                            },
                            {
                                num: '03',
                                color: 'border-stellar-yellow/20 bg-stellar-yellow/[0.03]',
                                accent: 'text-stellar-yellow',
                                title: lang('The infrastructure is already built', 'La infraestructura ya está lista', '基础设施已就绪'),
                                body: lang(
                                    'Building secure treasury infrastructure from scratch takes months and costs a lot. With Nirium, you integrate in days. Already built, already audited.',
                                    'Construir infraestructura de tesorería segura desde cero tarda meses y cuesta caro. Con Nirium, integras en días. Ya construida, ya auditada.',
                                    '从零开始构建安全的财库基础设施需要数月且成本高昂。使用 Nirium，数天内即可完成集成。已构建完毕，已完成审计。'
                                ),
                                tag: lang('Fintech builders · SDK on npm', 'Builders fintech · SDK en npm', '金融科技开发者 · npm SDK'),
                            },
                        ].map((item) => (
                            <div key={item.num} className={`p-6 rounded-xl border ${item.color} flex flex-col gap-4`}>
                                <div className="flex items-center justify-between">
                                    <span className={`text-[10px] font-mono font-bold ${item.accent}`}>{item.num}</span>
                                    <span className={`text-[9px] font-mono ${item.accent}/60 text-right leading-tight max-w-[160px]`}>{item.tag}</span>
                                </div>
                                <h3 className="text-base font-black text-white leading-tight">{item.title}</h3>
                                <p className="text-sm text-white/55 leading-relaxed">{item.body}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CODE SNIPPET */}
            <section className="py-20 border-t border-white/5">
                <div className="max-w-4xl mx-auto px-6">
                    <h2 className="text-2xl sm:text-3xl font-bold text-center">
                        {lang('Five lines of code', 'Cinco líneas de código', '五行代码')}
                    </h2>
                    <p className="mt-4 text-center text-white/60 max-w-xl mx-auto">
                        {lang(
                            'Connect your API key. Define your rules. The agent does the rest.',
                            'Conecta tu API key. Define tus reglas. El agente hace el resto.',
                            '连接您的 API 密钥。定义规则。智能体完成其余操作。'
                        )}
                    </p>

                    <div className="mt-10 relative rounded-xl border border-white/10 bg-black overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                                <span className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                                <span className="ml-3 text-xs text-white/40 font-mono">treasury.ts</span>
                            </div>
                            <button
                                onClick={handleCopy}
                                className="text-xs text-white/50 hover:text-stellar-teal transition-colors font-mono"
                            >
                                {copied
                                    ? lang('Copied!', '¡Copiado!', '已复制！')
                                    : lang('Copy', 'Copiar', '复制')}
                            </button>
                        </div>
                        <pre className="p-6 text-sm text-white/80 font-mono leading-relaxed overflow-x-auto">
                            <code>{codeSnippet}</code>
                        </pre>
                    </div>

                    <div className="mt-6 text-center">
                        <Link
                            href="/developers"
                            className="inline-flex items-center gap-2 text-sm text-stellar-teal hover:underline"
                        >
                            {lang('Full developer docs', 'Ver documentación completa', '完整开发者文档')}
                            <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* WHO USES NIRIUM */}
            <section className="py-24 border-t border-white/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_60%,rgba(45,235,232,0.04),transparent_55%)] pointer-events-none" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(255,200,0,0.03),transparent_55%)] pointer-events-none" />

                <div className="max-w-6xl mx-auto px-6 relative z-10">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-5 bg-white/[0.04] border border-white/10 rounded-full text-white/40 text-[10px] font-mono uppercase tracking-widest">
                            <span className="w-1 h-1 rounded-full bg-stellar-teal" />
                            {lang('Who is it for?', '¿Para quién es?', '适合哪些用户？')}
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
                            {lang('If your company moves money, Nirium is for you.', 'Si tu empresa mueve dinero, Nirium es para ti.', '只要你的企业需要移动资金，Nirium 就适合你。')}
                        </h2>
                        <p className="mt-4 text-white/45 max-w-lg mx-auto text-sm leading-relaxed">
                            {lang(
                                "You don't need to understand crypto. You just need the problem we solve.",
                                'No necesitas entender de cripto. Solo necesitas tener el problema que resolvemos.',
                                '你不需要了解加密货币，只需要有我们解决的问题。'
                            )}
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-5">

                        {/* Card 1 — LATAM Fintechs */}
                        <motion.div
                            whileHover={{ y: -4 }}
                            transition={{ duration: 0.2 }}
                            className="group relative rounded-2xl border border-white/10 bg-gradient-to-b from-stellar-teal/[0.06] to-black/40 overflow-hidden hover:border-stellar-teal/30 transition-colors duration-300"
                        >
                            <div className="absolute top-0 right-0 w-40 h-40 bg-stellar-teal/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative p-7 flex flex-col h-full">
                                <div className="flex items-center justify-between mb-6">
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-stellar-teal/70 font-mono">
                                        {lang('Fintechs · PSPs · Mexico', 'Fintechs · PSPs · México', 'LATAM 金融科技')}
                                    </span>
                                    <span className="text-[9px] font-mono text-white/20">01</span>
                                </div>
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="w-10 h-10 rounded-xl bg-stellar-teal/10 border border-stellar-teal/20 flex items-center justify-center shrink-0 group-hover:border-stellar-teal/40 transition-colors">
                                        <Building2 className="w-5 h-5 text-stellar-teal" />
                                    </div>
                                    <h3 className="text-base font-black text-white leading-tight">
                                        {lang('Your treasury runs itself', 'Tu tesorería corre sola', '资金库自动运转')}
                                    </h3>
                                </div>
                                <div className="space-y-2 mb-5">
                                    <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg bg-red-500/[0.06] border border-red-500/10">
                                        <span className="text-red-400/60 text-[9px] font-black uppercase tracking-widest shrink-0 pt-px">ANTES</span>
                                        <span className="text-[11px] text-white/50 leading-snug">
                                            {lang('Your team moves money by hand every day. Hours lost, human errors, idle cash.', 'Tu equipo mueve dinero a mano todos los días. Horas perdidas, errores humanos, dinero parado.', '你的团队每天手动转账，浪费大量时间，容易出错，资金闲置。')}
                                        </span>
                                    </div>
                                    <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg bg-stellar-teal/[0.06] border border-stellar-teal/10">
                                        <span className="text-stellar-teal text-[9px] font-black uppercase tracking-widest shrink-0 pt-px">AHORA</span>
                                        <span className="text-[11px] text-white/70 leading-snug">
                                            {lang('Nirium detects the right moment and acts automatically. Zero human intervention.', 'Nirium detecta el momento correcto y actúa solo. Cero intervención humana.', 'Nirium 自动检测最佳时机并独立行动。零人工干预。')}
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-auto pt-4 border-t border-white/[0.06] flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-stellar-teal animate-pulse" />
                                        <span className="text-[10px] font-mono text-stellar-teal">{lang('Zero manual decisions', 'Cero decisiones manuales', '零手动决策')}</span>
                                    </div>
                                    <ChevronRight className="w-3.5 h-3.5 text-white/20 group-hover:text-stellar-teal transition-colors" />
                                </div>
                            </div>
                        </motion.div>

                        {/* Card 2 — SMBs / No-CFO */}
                        <motion.div
                            whileHover={{ y: -4 }}
                            transition={{ duration: 0.2 }}
                            className="group relative rounded-2xl border border-white/10 bg-gradient-to-b from-stellar-yellow/[0.05] to-black/40 overflow-hidden hover:border-stellar-yellow/30 transition-colors duration-300"
                        >
                            <div className="absolute top-0 right-0 w-40 h-40 bg-stellar-yellow/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative p-7 flex flex-col h-full">
                                <div className="flex items-center justify-between mb-6">
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-stellar-yellow/70 font-mono">
                                        {lang('SaaS · Companies $1M–$10M', 'SaaS · Empresas $1M–$10M', 'SaaS · 中小企业')}
                                    </span>
                                    <span className="text-[9px] font-mono text-white/20">02</span>
                                </div>
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="w-10 h-10 rounded-xl bg-stellar-yellow/10 border border-stellar-yellow/20 flex items-center justify-center shrink-0 group-hover:border-stellar-yellow/40 transition-colors">
                                        <Bot className="w-5 h-5 text-stellar-yellow" />
                                    </div>
                                    <h3 className="text-base font-black text-white leading-tight">
                                        {lang('Your cash works when you don\'t', 'Tu caja trabaja cuando tú no', '你的资金从不休息')}
                                    </h3>
                                </div>
                                <div className="space-y-2 mb-5">
                                    <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg bg-red-500/[0.06] border border-red-500/10">
                                        <span className="text-red-400/60 text-[9px] font-black uppercase tracking-widest shrink-0 pt-px">ANTES</span>
                                        <span className="text-[11px] text-white/50 leading-snug">
                                            {lang('Millions sitting in accounts doing nothing. Inflation reduces them every month.', 'Millones en cuentas que no hacen nada. La inflación los reduce cada mes.', '数百万闲置在账户中毫无作为，通胀每月蚕食。')}
                                        </span>
                                    </div>
                                    <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg bg-stellar-yellow/[0.06] border border-stellar-yellow/10">
                                        <span className="text-stellar-yellow text-[9px] font-black uppercase tracking-widest shrink-0 pt-px">AHORA</span>
                                        <span className="text-[11px] text-white/70 leading-snug">
                                            {lang('Nirium moves idle capital automatically according to rules you define. 24/7.', 'Nirium mueve el capital inactivo automáticamente según reglas que tú defines. 24/7.', 'Nirium 根据你设定的规则自动移动闲置资金，全天候运行。')}
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-auto pt-4 border-t border-white/[0.06] flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-stellar-yellow animate-pulse" />
                                        <span className="text-[10px] font-mono text-stellar-yellow">{lang('0 manual decisions / week', '0 decisiones manuales / semana', '0 手动决策/周')}</span>
                                    </div>
                                    <ChevronRight className="w-3.5 h-3.5 text-white/20 group-hover:text-stellar-yellow transition-colors" />
                                </div>
                            </div>
                        </motion.div>

                        {/* Card 3 — DeFi Protocols */}
                        <motion.div
                            whileHover={{ y: -4 }}
                            transition={{ duration: 0.2 }}
                            className="group relative rounded-2xl border border-white/10 bg-gradient-to-b from-purple-500/[0.05] to-black/40 overflow-hidden hover:border-purple-500/30 transition-colors duration-300"
                        >
                            <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative p-7 flex flex-col h-full">
                                <div className="flex items-center justify-between mb-6">
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-purple-400/70 font-mono">
                                        {lang('Fintech builders · Developers', 'Builders fintech · Developers', '金融科技开发者')}
                                    </span>
                                    <span className="text-[9px] font-mono text-white/20">03</span>
                                </div>
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0 group-hover:border-purple-500/40 transition-colors">
                                        <Layers className="w-5 h-5 text-purple-400" />
                                    </div>
                                    <h3 className="text-base font-black text-white leading-tight">
                                        {lang('The infrastructure is already built', 'La infraestructura ya está lista', '基础设施已就绪')}
                                    </h3>
                                </div>
                                <div className="space-y-2 mb-5">
                                    <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg bg-red-500/[0.06] border border-red-500/10">
                                        <span className="text-red-400/60 text-[9px] font-black uppercase tracking-widest shrink-0 pt-px">ANTES</span>
                                        <span className="text-[11px] text-white/50 leading-snug">
                                            {lang('Building secure treasury infrastructure takes months and costs a lot.', 'Construir infraestructura de tesorería segura tarda meses y cuesta caro.', '构建安全的财库基础设施需要数月，成本高昂。')}
                                        </span>
                                    </div>
                                    <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg bg-purple-500/[0.06] border border-purple-500/10">
                                        <span className="text-purple-400 text-[9px] font-black uppercase tracking-widest shrink-0 pt-px">AHORA</span>
                                        <span className="text-[11px] text-white/70 leading-snug">
                                            {lang('Integrate in days. Already built, already audited. You just configure your rules.', 'Integras en días. Ya construida, ya auditada. Tú solo configuras tus reglas.', '数天内完成集成。已构建，已审计。你只需配置规则。')}
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-auto pt-4 border-t border-white/[0.06] flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                                        <span className="text-[10px] font-mono text-purple-400">{lang('SDK on npm · Claude/GPT ready', 'SDK en npm · Compatible Claude/GPT', 'npm SDK · 支持 Claude/GPT')}</span>
                                    </div>
                                    <ChevronRight className="w-3.5 h-3.5 text-white/20 group-hover:text-purple-400 transition-colors" />
                                </div>
                            </div>
                        </motion.div>

                    </div>
                </div>
            </section>

            {/* WHY NIRIUM */}
            <section className="py-20 border-t border-white/5">
                <div className="max-w-5xl mx-auto px-6">
                    <h2 className="text-2xl sm:text-3xl font-bold text-center">
                        {lang('Why trust Nirium with your money?', '¿Por qué confiar tu dinero a Nirium?', '为什么选择 Nirium？')}
                    </h2>

                    {/* Guarantee callout */}
                    <div className="mt-10 relative rounded-xl border border-stellar-yellow/20 bg-stellar-yellow/[0.04] px-6 py-5 text-center overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,200,0,0.06),transparent_70%)]" />
                        <p className="relative text-base sm:text-lg font-black text-white tracking-tight">
                            {lang(
                                '"The software suggests. The contract decides. Your money never moves without your authorization."',
                                '"El software propone. El contrato decide. Tu dinero nunca se mueve sin tu autorización."',
                                '"软件建议，合约决定。没有您的授权，资金永远不会移动。"'
                            )}
                        </p>
                        <p className="relative mt-2 text-xs text-stellar-yellow/60 font-mono uppercase tracking-widest">
                            {lang('Nirium Security Model — You always hold the keys', 'Modelo de seguridad Nirium — Tú siempre tienes las llaves', 'Nirium 安全模型 — 您始终掌握密钥')}
                        </p>
                    </div>

                    <div className="mt-10 grid md:grid-cols-3 gap-6">
                        {[
                            {
                                icon: Lock,
                                title: lang('Your money, your keys', 'Tu dinero, tus llaves', '你的资金，你的密钥'),
                                body:  lang(
                                    'Nirium never holds your funds. You control everything. We just run the automation on your behalf.',
                                    'Nirium nunca toca tu dinero. Tú controlas todo. Nosotros solo corremos la automatización por ti.',
                                    'Nirium 从不持有您的资金。您掌控一切，我们只是代您运行自动化。'
                                ),
                                link: '/security',
                            },
                            {
                                icon: FileCheck,
                                title: lang('Every move, recorded', 'Cada movimiento, registrado', '每次操作，全程记录'),
                                body:  lang(
                                    'Every action is signed and archived automatically. Export for auditors in one click. Always ready for regulators.',
                                    'Cada acción queda firmada y archivada automáticamente. Exporta para auditores en un clic. Siempre listo para reguladores.',
                                    '每次操作自动签署并归档。一键导出给审计人员。随时为监管机构准备好。'
                                ),
                                link: '/compliance',
                            },
                            {
                                icon: Building2,
                                title: lang('Fund with a bank transfer', 'Fondea con una transferencia', '通过银行转账充值'),
                                body:  lang(
                                    'Send MXN from your bank via SPEI to a CLABE. Etherfuse — a regulated operator — handles the rest. No crypto knowledge required.',
                                    'Envía MXN desde tu banco vía SPEI a una CLABE. Etherfuse — operador regulado — hace el resto. No necesitas saber de cripto.',
                                    '通过 SPEI 从您的银行发送 MXN 至 CLABE 账户。受监管运营商 Etherfuse 处理其余事项。无需加密货币知识。'
                                ),
                                link: '/ramp',
                            },
                        ].map((feature) => (
                            <Link
                                key={feature.title}
                                href={feature.link}
                                className="group p-6 rounded-xl border border-white/10 bg-white/[0.02] hover:border-stellar-teal/30 transition-colors"
                            >
                                <div className="p-2.5 rounded-lg bg-stellar-teal/10 w-fit mb-4">
                                    <feature.icon className="w-5 h-5 text-stellar-teal" />
                                </div>
                                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                                <p className="text-sm text-white/60 leading-relaxed mb-4">{feature.body}</p>
                                <div className="text-xs text-stellar-teal/80 group-hover:text-stellar-teal flex items-center gap-1.5">
                                    {lang('Learn more', 'Ver más', '了解更多')}
                                    <ChevronRight className="w-3 h-3" />
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* SPEI Legal Disclaimer */}
                    <div className="mt-8 border border-white/5 rounded-lg px-5 py-4 bg-white/[0.01]">
                        <p className="text-[10px] text-white/30 font-mono leading-relaxed">
                            <span className="text-white/45 font-semibold uppercase tracking-widest">
                                {lang('Legal notice', 'Aviso legal', '法律声明')} —{' '}
                            </span>
                            {lang(
                                'Nirium is treasury automation software, not a financial intermediary. SPEI onramp and CETES custody are operated exclusively by Etherfuse, an independent regulated entity subject to Mexican Fintech Law and Banxico/CNBV regulations. Nirium does not hold or custody funds at any time. The CETES rate shown is the Banxico official reference rate — not a guaranteed return by Nirium. SPEI funding requires KYC/KYB completion with Etherfuse. XLM is a volatile digital asset; SDF provides no guarantees on its value. Currently operating on Stellar Testnet — no real funds are moved.',
                                'Nirium es software de automatización de tesorería, no un intermediario financiero. El onramp SPEI y la custodia de CETES son operados exclusivamente por Etherfuse, entidad regulada independiente sujeta a la Ley Fintech y normativa Banxico/CNBV. Nirium no custodia fondos en ningún momento. La tasa CETES mostrada es la tasa de referencia oficial Banxico — no es un rendimiento garantizado por Nirium. El fondeo vía SPEI requiere completar KYC/KYB con Etherfuse. XLM es un activo digital volátil; SDF no garantiza su valor. Actualmente en Stellar Testnet — no se movilizan fondos reales.',
                                'Nirium 是财库自动化软件，并非金融中介机构。SPEI 入金通道及 CETES 托管服务由 Etherfuse（墨西哥金融科技法规下的独立受监管实体）专属运营。Nirium 不在任何时刻托管资金。所显示的 CETES 利率为 Banxico 官方参考利率，并非 Nirium 保证的收益。通过 SPEI 充值需完成 Etherfuse 的 KYC/KYB 流程。XLM 是波动性数字资产，SDF 不对其价值作任何保证。当前运行于 Stellar 测试网——不涉及真实资金。'
                            )}
                        </p>
                    </div>
                </div>
            </section>

            {/* PRICING */}
            <section className="py-20 border-t border-white/5">
                <div className="max-w-5xl mx-auto px-6">
                    <h2 className="text-2xl sm:text-3xl font-bold text-center">
                        {lang('B2B SDK Pricing', 'Precios del SDK B2B', 'B2B SDK 定价')}
                    </h2>
                    <p className="mt-4 text-center text-white/60">
                        {lang('Start free on testnet. Pay only when you go to mainnet.', 'Empieza gratis en testnet. Paga solo cuando vayas a mainnet.', '在测试网免费开始。仅在进入主网时付费。')}
                    </p>

                    <div className="mt-12 grid md:grid-cols-3 gap-6">
                        {/* Sandbox */}
                        <div className="p-6 rounded-xl border border-white/10 bg-white/[0.02]">
                            <div className="text-xs uppercase tracking-widest text-white/40 mb-2">Sandbox</div>
                            <div className="text-3xl font-black mb-1">$0</div>
                            <div className="text-sm text-white/40 mb-6">
                                {lang('Free forever on testnet', 'Gratis en testnet para siempre', '测试网永久免费')}
                            </div>
                            <ul className="space-y-2.5 text-sm text-white/70 mb-8">
                                <li className="flex gap-2"><Check className="w-4 h-4 text-stellar-teal shrink-0 mt-0.5" />{lang('Testnet vault (2-of-3 Soroban)', 'Vault testnet (2-de-3 Soroban)', '测试网金库（2-of-3 Soroban）')}</li>
                                <li className="flex gap-2"><Check className="w-4 h-4 text-stellar-teal shrink-0 mt-0.5" />{lang('Audit trail (HMAC-SHA256)', 'Audit trail (HMAC-SHA256)', '审计追踪（HMAC-SHA256）')}</li>
                                <li className="flex gap-2"><Check className="w-4 h-4 text-stellar-teal shrink-0 mt-0.5" />{lang('SDK access (npm: nirium)', 'Acceso SDK (npm: nirium)', 'SDK 访问（npm: nirium）')}</li>
                                <li className="flex gap-2"><Check className="w-4 h-4 text-stellar-teal shrink-0 mt-0.5" />{lang('MCP server (Claude/Cursor)', 'Servidor MCP (Claude/Cursor)', 'MCP 服务器（Claude/Cursor）')}</li>
                            </ul>
                            <Link href="/dashboard">
                                <Button variant="outline" className="w-full border-white/20 hover:bg-white/5">
                                    {lang('Start free', 'Empezar gratis', '免费开始')}
                                </Button>
                            </Link>
                        </div>

                        {/* Growth */}
                        <div className="relative p-6 rounded-xl border border-stellar-teal/40 bg-stellar-teal/[0.05]">
                            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-stellar-teal text-black text-[10px] font-black uppercase tracking-widest">
                                {lang('Most popular', 'Más popular', '最受欢迎')}
                            </div>
                            <div className="text-xs uppercase tracking-widest text-stellar-teal mb-2">Growth</div>
                            <div className="text-3xl font-black mb-1">$299<span className="text-base text-white/50">/mo</span></div>
                            <div className="text-sm text-white/40 mb-1">
                                {lang('+ $0.01–0.05 per API call', '+ $0.01–0.05 por llamada API', '+ 每次 API 调用 $0.01–0.05')}
                            </div>
                            <div className="text-[10px] text-stellar-teal/70 font-mono mb-6">
                                {lang('Software license — no % of capital', 'Licencia de software — sin % del capital', '软件许可证 — 不收取资本百分比')}
                            </div>
                            <ul className="space-y-2.5 text-sm text-white/80 mb-8">
                                <li className="flex gap-2"><Check className="w-4 h-4 text-stellar-teal shrink-0 mt-0.5" />{lang('Mainnet vault (once audited)', 'Vault mainnet (tras auditoría)', '主网金库（审计后）')}</li>
                                <li className="flex gap-2"><Check className="w-4 h-4 text-stellar-teal shrink-0 mt-0.5" />{lang('CNBV compliance export', 'Exportación compliance CNBV', 'CNBV 合规导出')}</li>
                                <li className="flex gap-2"><Check className="w-4 h-4 text-stellar-teal shrink-0 mt-0.5" />{lang('IPFS anchoring (Pinata)', 'Anclaje IPFS (Pinata)', 'IPFS 锚定（Pinata）')}</li>
                                <li className="flex gap-2"><Check className="w-4 h-4 text-stellar-teal shrink-0 mt-0.5" />{lang('x402 + MPP agentic payments', 'Pagos agénticos x402 + MPP', 'x402 + MPP 代理支付')}</li>
                                <li className="flex gap-2"><Check className="w-4 h-4 text-stellar-teal shrink-0 mt-0.5" />{lang('CETES ↔ USDC signal generation', 'Señales CETES ↔ USDC', 'CETES ↔ USDC 信号生成')}</li>
                                <li className="flex gap-2"><Check className="w-4 h-4 text-stellar-teal shrink-0 mt-0.5" />{lang('Priority support (48h SLA)', 'Soporte prioritario (SLA 48h)', '优先支持（48 小时 SLA）')}</li>
                            </ul>
                            <Link href="/dashboard">
                                <Button variant="premium" className="w-full">
                                    {lang('Try on testnet →', 'Probar en testnet →', '在测试网试用 →')}
                                </Button>
                            </Link>
                        </div>

                        {/* Enterprise */}
                        <div className="p-6 rounded-xl border border-white/10 bg-white/[0.02]">
                            <div className="text-xs uppercase tracking-widest text-white/40 mb-2">Enterprise</div>
                            <div className="text-3xl font-black mb-1">Custom</div>
                            <div className="text-sm text-white/40 mb-6">
                                {lang('For regulated fintechs, banks and DAOs', 'Para fintechs reguladas, bancos y DAOs', '适用于受监管金融科技、银行和 DAO')}
                            </div>
                            <ul className="space-y-2.5 text-sm text-white/70 mb-8">
                                <li className="flex gap-2"><Check className="w-4 h-4 text-stellar-teal shrink-0 mt-0.5" />{lang('White-label option', 'Opción white-label', '白标选项')}</li>
                                <li className="flex gap-2"><Check className="w-4 h-4 text-stellar-teal shrink-0 mt-0.5" />{lang('Custom Soroban vault logic', 'Lógica Soroban personalizada', '自定义 Soroban 金库逻辑')}</li>
                                <li className="flex gap-2"><Check className="w-4 h-4 text-stellar-teal shrink-0 mt-0.5" />{lang('CNBV audit support', 'Soporte auditoría CNBV', 'CNBV 审计支持')}</li>
                                <li className="flex gap-2"><Check className="w-4 h-4 text-stellar-teal shrink-0 mt-0.5" />{lang('On-premise deployment', 'Despliegue on-premise', '本地部署')}</li>
                                <li className="flex gap-2"><Check className="w-4 h-4 text-stellar-teal shrink-0 mt-0.5" />{lang('Joint go-to-market', 'Go-to-market conjunto', '联合市场推广')}</li>
                            </ul>
                            <a href="mailto:hello@nirium.xyz">
                                <Button variant="outline" className="w-full border-white/20 hover:bg-white/5">
                                    {lang('Talk to the team', 'Hablar con el equipo', '联系团队')}
                                </Button>
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* CREDIBILITY STRIP */}
            <section className="py-16 border-t border-white/5">
                <div className="max-w-5xl mx-auto px-6">
                    <p className="text-center text-xs uppercase tracking-widest text-white/40 mb-8">
                        {lang('Verified by', 'Verificado por', '认证机构')}
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
                        {[
                            lang('SCF Stellar Community Fund ✓', 'SCF Stellar Community Fund ✓', 'SCF Stellar 社区基金 ✓'),
                            lang('Security Audit — 78/78 vectors PASS', 'Auditoría de seguridad — 78/78 vectores PASS', '安全审计 — 78/78 向量通过'),
                            lang('External Audit — Q3 2026', 'Auditoría externa — Q3 2026', '外部审计 — Q3 2026'),
                            lang('Etherfuse Integration ✓', 'Integración Etherfuse ✓', 'Etherfuse 集成 ✓'),
                            lang('Stellar Testnet — Live', 'Stellar Testnet — En vivo', 'Stellar 测试网 — 运行中'),
                        ].map((item) => (
                            <div key={item} className="text-[10px] text-white/40 font-mono uppercase tracking-[0.2em]">
                                {item}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* DASHBOARD PREVIEW */}
            <section className="py-24 border-t border-white/5 overflow-hidden">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-stellar-teal/10 border border-stellar-teal/20 rounded-full text-stellar-teal text-[10px] font-black uppercase tracking-widest mb-4">
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-stellar-teal opacity-75" />
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-stellar-teal" />
                            </span>
                            {lang('Live on Testnet', 'En vivo en Testnet', '测试网实时运行')}
                        </div>
                        <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
                            {lang('The full product.', 'El producto completo.', '完整产品。')}{' '}
                            <span className="text-stellar-teal">{lang('Behind one click.', 'Detrás de un clic.', '一键即达。')}</span>
                        </h2>
                        <p className="mt-4 text-white/50 max-w-xl mx-auto text-sm">
                            {lang(
                                'Connect your Freighter wallet and access the full institutional dashboard — agents, analytics, vault, x402, MPP, and IPFS audit trail.',
                                'Conecta tu wallet Freighter y accede al dashboard institucional completo — agentes, analytics, vault, x402, MPP y rastro de auditoría IPFS.',
                                '连接 Freighter 钱包，访问完整的机构级仪表板 — 代理、分析、金库、x402、MPP 和 IPFS 审计追踪。'
                            )}
                        </p>
                    </div>

                    {/* Dashboard mockup */}
                    <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(45,235,232,0.08)]">
                        {/* Browser chrome */}
                        <div className="flex items-center gap-2 px-4 py-3 bg-[#0A0A0A] border-b border-white/[0.06]">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-500/40" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/40" />
                                <div className="w-3 h-3 rounded-full bg-green-500/40" />
                            </div>
                            <div className="flex-1 mx-4">
                                <div className="max-w-xs mx-auto bg-white/5 border border-white/[0.08] rounded-md px-3 py-1 text-[10px] font-mono text-white/30">
                                    app.nirium.xyz/dashboard
                                </div>
                            </div>
                        </div>

                        {/* Fake dashboard UI */}
                        <div className="bg-[#050505] flex min-h-[420px]">
                            {/* Sidebar */}
                            <div className="w-44 shrink-0 border-r border-white/[0.05] p-3 space-y-1 hidden sm:block">
                                {[
                                    { category: 'CORE' },
                                    { label: t.nav.dashboard,     active: true,  color: '#2DEBE8' },
                                    { label: t.nav.agents,        active: false, color: '#FFD700' },
                                    { label: t.nav.analytics,     active: false, color: '#34D399' },
                                    { label: t.nav.compliance,    active: false, color: '#2DEBE8' },
                                    { category: 'TREASURY', mt: true },
                                    { label: t.nav.marketplace,   active: false, color: '#A78BFA' },
                                    { label: t.nav.builder,       active: false, color: '#F97316' },
                                    { label: t.nav.payroll,       active: false, color: '#EF4444' },
                                    { label: t.nav.ramp,          active: false, color: '#34D399' },
                                    { category: 'DEVELOPER', mt: true },
                                    { label: t.nav.docs,          active: false, color: '#FFFFFF' },
                                    { label: t.nav.developers,    active: false, color: '#FFFFFF' },
                                ].map((item, i) => (
                                    item.category ? (
                                        <div key={item.category} className={`text-[9px] font-black text-white/20 uppercase tracking-[0.2em] px-3 pb-1 ${item.mt ? 'pt-4' : 'pt-2'}`}>
                                            {item.category}
                                        </div>
                                    ) : (
                                        <div
                                            key={item.label}
                                            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-medium ${
                                                item.active ? 'bg-white/[0.08] text-white' : 'text-white/30'
                                            }`}
                                        >
                                            {item.active && (
                                                <span className="w-0.5 h-3.5 rounded-full absolute left-3" style={{ background: item.color }} />
                                            )}
                                            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: item.active ? item.color : 'rgba(255,255,255,0.1)' }} />
                                            {item.label}
                                        </div>
                                    )
                                ))}
                            </div>

                            {/* Main content */}
                            <div className="flex-1 p-5 space-y-4 overflow-hidden">
                                {/* Stats row */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {[
                                        { label: 'Treasury Balance', value: '$127,430', sub: 'CETES 5.57% (gov. rate)', color: 'text-stellar-teal' },
                                        { label: 'Active Agents',    value: '1 / 10',  sub: '24/7 Autonomous', color: 'text-stellar-yellow' },
                                        { label: 'USDC → CETES',     value: '82%',     sub: 'Auto-rebalanced', color: 'text-purple-400' },
                                        { label: 'Audit Entries',    value: '1,847',   sub: 'IPFS Immutable',  color: 'text-green-400' },
                                    ].map(({ label, value, sub, color }) => (
                                        <div key={label} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
                                            <div className="text-[9px] font-mono text-white/30 uppercase mb-1">{label}</div>
                                            <div className={`text-lg font-black ${color}`}>{value}</div>
                                            <div className="text-[9px] text-white/30 mt-0.5">{sub}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Agent feed */}
                                <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Agent Activity</span>
                                        <span className="flex items-center gap-1 text-[9px] text-green-400 font-mono">
                                            <span className="w-1 h-1 rounded-full bg-green-400 animate-pulse" />
                                            LIVE
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        {[
                                            { time: '23:41:02', msg: '[AGENT-01] Rebalanced 2,400 USDC -> CETES via Etherfuse', type: 'success' },
                                            { time: '23:40:47', msg: '[AGENT-02] x402 micropayment: 0.05 USDC - API call billed', type: 'info' },
                                            { time: '23:40:31', msg: '[SENTINEL] Vault health check passed - all systems nominal', type: 'success' },
                                        ].map(({ time, msg, type }) => (
                                            <div key={time} className="flex items-start gap-2 text-[10px] font-mono">
                                                <span className="text-white/20 shrink-0">{time}</span>
                                                <span className={type === 'success' ? 'text-green-400/80' : 'text-stellar-teal/80'}>{msg}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Launch CTA overlay */}
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/80 via-transparent to-transparent">
                            <div className="absolute bottom-8 flex flex-col items-center gap-3">
                                <Link href="/dashboard">
                                    <Button size="lg" variant="premium" className="shadow-[0_0_40px_rgba(255,215,0,0.3)]">
                                        {lang('Launch App — Free Testnet', 'Lanzar App — Testnet Gratis', '启动应用 — 免费测试网')}
                                        <ArrowRight className="ml-2 w-4 h-4" />
                                    </Button>
                                </Link>
                                <p className="text-[10px] text-white/30 font-mono">
                                    {lang('No funds at risk · Non-custodial · Freighter wallet', 'Sin fondos en riesgo · No custodial · Freighter', '无资金风险 · 非托管 · Freighter 钱包')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FINAL CTA */}
            <section className="py-24 border-t border-white/5">
                <div className="max-w-3xl mx-auto px-6 text-center">
                    <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
                        {lang(
                            'Your money shouldn\'t sleep.',
                            'Tu dinero no debería estar durmiendo.',
                            '你的资金不该继续沉睡。'
                        )}
                    </h2>
                    <p className="mt-4 text-white/60 max-w-xl mx-auto">
                        {lang(
                            'Try free on testnet. Talk to us if you want a pilot. No commitments.',
                            'Prueba gratis en testnet. Habla con nosotros si quieres un piloto. Sin compromisos.',
                            '测试网免费试用。有意向可联系我们。无任何承诺。'
                        )}
                    </p>
                    <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
                        <Link href="/dashboard">
                            <Button size="lg" variant="premium" className="w-full sm:w-auto">
                                {lang('Get started free', 'Comenzar gratis', '免费开始')}
                                <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </Link>
                        <a href="https://github.com/Eras256/Nirium" target="_blank" rel="noopener noreferrer">
                            <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/20 hover:bg-white/5">
                                GitHub
                                <ExternalLink className="ml-2 w-4 h-4" />
                            </Button>
                        </a>
                    </div>
                </div>
            </section>

            {/* BUILT ON OPEN STANDARDS */}
            <section className="py-12 border-t border-white/5 bg-black/50 text-center">
                <div className="max-w-3xl mx-auto px-6">
                    <h3 className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-4">Built on Open Standards</h3>
                    <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-white/60 mb-6">
                        <span className="font-mono">x402</span>
                        <span className="text-white/20">•</span>
                        <span className="font-mono">MPP</span>
                        <span className="text-white/20">•</span>
                        <span className="font-mono">Apache 2.0</span>
                        <span className="text-white/20">•</span>
                        <span className="font-mono text-stellar-teal">Stellar Testnet</span>
                    </div>
                    <div className="flex items-center justify-center gap-6 text-sm mb-6">
                        <a href="https://github.com/Eras256/Nirium" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors underline underline-offset-4">GitHub Repository</a>
                        <Link href="/disclaimers" className="text-white/60 hover:text-white transition-colors underline underline-offset-4">Legal Disclaimers</Link>
                    </div>
                    <p className="text-[10px] text-zinc-500 font-mono">
                        All rate data shown is protocol reference information only — not a return projection or guarantee.
                    </p>
                </div>
            </section>

            <Footer />
        </main>
    );
}

