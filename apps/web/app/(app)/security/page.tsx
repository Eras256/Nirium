/** Nirium Security — Non-custodial 2-of-3 Soroban vault **/
'use client';

import Link from "next/link";
import {
    Lock, Key, Shield, AlertTriangle, CheckCircle2, ArrowRight,
    Users, FileSearch, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/context/LanguageContext";
import SecurityDisclaimer from "@/components/shared/SecurityDisclaimer";

export default function SecurityPage() {
    const { language } = useLanguage();
    const lang = (en: string, es: string, zh: string) =>
        language === 'zh' ? zh : language === 'es' ? es : en;

    return (
        <main className="min-h-screen bg-black text-white antialiased">
{/* HERO */}
            <section className="relative pt-8 pb-16 sm:pt-8 sm:pb-20">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(45,235,232,0.06),transparent_60%)]" />
                <div className="relative max-w-5xl mx-auto px-6">
                    <div className="flex justify-center mb-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-stellar-teal/20 bg-stellar-teal/5 text-stellar-teal text-xs font-mono">
                            <Sparkles className="w-3 h-3" />
                            {lang('Custody layer', 'Capa de custodia', '托管层')}
                        </div>
                    </div>

                    <h1 className="text-center text-4xl sm:text-6xl font-black leading-[1.05] tracking-tight">
                        {lang('100% non-custodial', '100% non-custodial', '100% 非托管')}
                    </h1>
                    <p className="mt-6 text-center text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
                        {lang(
                            'Soroban 2-of-3 vault. The client holds the keys. Nirium can never move your funds. Period.',
                            'Vault Soroban 2-de-3. El cliente controla las llaves. Nirium nunca puede mover tus fondos. Punto.',
                            'Soroban 2-of-3 保险库。客户持有密钥。Nirium 永远无法移动您的资金。'
                        )}
                    </p>
                </div>
            </section>

            {/* THE 3-KEY STRUCTURE */}
            <section className="py-16 border-t border-white/5">
                <div className="max-w-5xl mx-auto px-6">
                    <h2 className="text-2xl sm:text-3xl font-bold text-center">
                        {lang('Three keys. Two signatures.', 'Tres llaves. Dos firmas.', '三把密钥。两个签名。')}
                    </h2>
                    <p className="mt-4 text-center text-white/60 max-w-2xl mx-auto">
                        {lang(
                            'Any critical vault operation requires 2 of 3 signatures. No one can move funds alone.',
                            'Para cualquier operación crítica del vault se necesitan 2 de 3 firmas. Nadie puede mover los fondos solo.',
                            '任何关键保险库操作都需要 3 个签名中的 2 个。任何人都无法单独转移资金。'
                        )}
                    </p>

                    <div className="mt-12 grid md:grid-cols-3 gap-6">
                        {[
                            {
                                role: 'Owner',
                                desc: lang('Founder, CEO or primary decider', 'Founder, CEO o decisor principal', '创始人、CEO 或主要决策者'),
                            },
                            {
                                role: 'Cosigner 1',
                                desc: lang('CTO, Operations or Admin', 'CTO, Operations o Admin', 'CTO、运营或管理员'),
                            },
                            {
                                role: 'Cosigner 2',
                                desc: lang('Legal, Board or external advisor', 'Legal, Board o asesor externo', '法务、董事会或外部顾问'),
                            },
                        ].map((key) => (
                            <div
                                key={key.role}
                                className="p-6 rounded-xl border border-white/10 bg-white/[0.02] text-center"
                            >
                                <div className="w-14 h-14 rounded-full bg-stellar-teal/10 flex items-center justify-center mx-auto mb-4">
                                    <Key className="w-7 h-7 text-stellar-teal" />
                                </div>
                                <div className="text-lg font-bold mb-2">{key.role}</div>
                                <p className="text-sm text-white/60">{key.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* WHAT REQUIRES MULTISIG */}
            <section className="py-16 border-t border-white/5">
                <div className="max-w-5xl mx-auto px-6">
                    <h2 className="text-2xl sm:text-3xl font-bold text-center">
                        {lang('What requires 2-of-3 multisig', 'Qué requiere multisig 2-de-3', '哪些操作需要 2-of-3 多签')}
                    </h2>

                    <div className="mt-12 grid md:grid-cols-2 gap-6">
                        <div className="p-6 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.03]">
                            <div className="flex items-center gap-2 mb-4">
                                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                <h3 className="text-lg font-bold">{lang('Automatic operations', 'Operaciones automáticas', '自动操作')}</h3>
                            </div>
                            <p className="text-sm text-white/60 mb-4">
                                {lang(
                                    'The agent can execute without additional signature under preconfigured limits:',
                                    'El agente puede ejecutar sin firma adicional bajo límites preconfigurados:',
                                    '在预配置限额内，智能体无需额外签名即可执行：'
                                )}
                            </p>
                            <ul className="space-y-2 text-sm text-white/70">
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400/80 shrink-0 mt-0.5" />
                                    {lang('USDC ↔ CETES rebalancing under daily threshold', 'Rebalanceo USDC ↔ CETES bajo umbral diario', 'USDC ↔ CETES 再平衡（低于日限额）')}
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400/80 shrink-0 mt-0.5" />
                                    {lang('Routine operations < $10K USDC', 'Operaciones rutinarias < $10K USDC', '常规操作 < $10K USDC')}
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400/80 shrink-0 mt-0.5" />
                                    {lang('Reports and queries (read-only)', 'Reportes y consultas (read-only)', '报告和查询（只读）')}
                                </li>
                            </ul>
                        </div>

                        <div className="p-6 rounded-xl border border-amber-500/20 bg-amber-500/[0.03]">
                            <div className="flex items-center gap-2 mb-4">
                                <Shield className="w-5 h-5 text-amber-400" />
                                <h3 className="text-lg font-bold">{lang('Critical operations', 'Operaciones críticas', '关键操作')}</h3>
                            </div>
                            <p className="text-sm text-white/60 mb-4">
                                {lang(
                                    'These require 2 human signatures, no exceptions:',
                                    'Estas requieren 2 firmas humanas obligatoriamente:',
                                    '以下操作必须有 2 个人工签名，无例外：'
                                )}
                            </p>
                            <ul className="space-y-2 text-sm text-white/70">
                                <li className="flex items-start gap-2">
                                    <Shield className="w-4 h-4 text-amber-400/80 shrink-0 mt-0.5" />
                                    {lang('Withdrawals > $10K USDC', 'Retiros > $10K USDC', '提款 > $10K USDC')}
                                </li>
                                <li className="flex items-start gap-2">
                                    <Shield className="w-4 h-4 text-amber-400/80 shrink-0 mt-0.5" />
                                    {lang('Cosigner changes', 'Cambio de cosignatarios', '更换共签人')}
                                </li>
                                <li className="flex items-start gap-2">
                                    <Shield className="w-4 h-4 text-amber-400/80 shrink-0 mt-0.5" />
                                    {lang('Emergency vault pause', 'Pausa de emergencia del vault', '紧急暂停保险库')}
                                </li>
                                <li className="flex items-start gap-2">
                                    <Shield className="w-4 h-4 text-amber-400/80 shrink-0 mt-0.5" />
                                    {lang('Vault closure', 'Cierre del vault', '关闭保险库')}
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* WHAT NIRIUM CANNOT DO */}
            <section className="py-16 border-t border-white/5">
                <div className="max-w-3xl mx-auto px-6">
                    <h2 className="text-2xl sm:text-3xl font-bold text-center">
                        {lang('What Nirium CANNOT do', 'Lo que Nirium NO puede hacer', 'Nirium 无法做的事')}
                    </h2>
                    <p className="mt-4 text-center text-white/60">
                        {lang(
                            'Not a legal disclaimer — a technical impossibility at the Soroban contract level.',
                            'No es un disclaimer legal — es una imposibilidad técnica al nivel del contrato Soroban.',
                            '这不是法律免责声明——而是 Soroban 合约层面的技术性不可能。'
                        )}
                    </p>

                    <div className="mt-10 space-y-3">
                        {[
                            lang('Move your funds without your signature', 'Mover tus fondos sin tu firma', '在没有您签名的情况下转移资金'),
                            lang('Change your cosigners', 'Cambiar tus cosignatarios', '更改您的共签人'),
                            lang('Withdraw funds to a Nirium wallet', 'Retirar fondos a una wallet de Nirium', '将资金提取至 Nirium 钱包'),
                            lang('Access your private keys', 'Acceder a tus llaves privadas', '访问您的私钥'),
                            lang('Unilaterally pause your vault', 'Pausar tu vault unilateralmente', '单方面暂停您的保险库'),
                            lang('Modify vault code once deployed', 'Modificar el código del vault una vez deployado', '合约部署后修改保险库代码'),
                        ].map((item) => (
                            <div
                                key={item}
                                className="flex items-center gap-3 p-4 rounded-lg border border-red-500/10 bg-red-500/[0.02]"
                            >
                                <Lock className="w-4 h-4 text-red-400/80 shrink-0" />
                                <span className="text-sm text-white/70">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* THE CONTRACT */}
            <section className="py-16 border-t border-white/5">
                <div className="max-w-4xl mx-auto px-6">
                    <h2 className="text-2xl sm:text-3xl font-bold text-center">
                        {lang('The real contract', 'El contrato real', '真实合约')}
                    </h2>
                    <p className="mt-4 text-center text-white/60">
                        {lang(
                            'NiriumVault is deployed on Stellar Testnet and is verifiable.',
                            'NiriumVault está deployado en Stellar Testnet y es verificable.',
                            'NiriumVault 已部署在 Stellar 测试网上，可公开验证。'
                        )}
                    </p>

                    <div className="mt-8 p-5 rounded-xl border border-white/10 bg-white/[0.02]">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs uppercase tracking-widest text-white/40 font-mono">Contract ID</span>
                            <span className="text-xs text-stellar-teal/80 font-mono">Stellar Testnet</span>
                        </div>
                        <code className="text-sm text-white/80 font-mono break-all block">
                            CBTWMZCG3P72EHFAQ4ZLSEBIOFYJC244H5J6DHZIJ56FHFWJ2CFAWSZU
                        </code>
                        <div className="mt-4 flex flex-wrap gap-3">
                            <a
                                href="https://stellar.expert/explorer/testnet/contract/CBTWMZCG3P72EHFAQ4ZLSEBIOFYJC244H5J6DHZIJ56FHFWJ2CFAWSZU"
                                target="_blank"
                                rel="noopener"
                                className="inline-flex items-center gap-2 text-xs text-stellar-teal hover:underline"
                            >
                                <FileSearch className="w-3.5 h-3.5" />
                                {lang('View on Stellar Expert', 'Ver en Stellar Expert', '在 Stellar Expert 上查看')}
                            </a>
                            <Link
                                href="https://github.com/Eras256/Nirium"
                                target="_blank"
                                rel="noopener"
                                className="inline-flex items-center gap-2 text-xs text-stellar-teal hover:underline"
                            >
                                <FileSearch className="w-3.5 h-3.5" />
                                {lang('View source code', 'Ver código fuente', '查看源代码')}
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* AUDIT */}
            <section className="py-16 border-t border-white/5">
                <div className="max-w-3xl mx-auto px-6">
                    <h2 className="text-2xl sm:text-3xl font-bold text-center">
                        {lang('Audit', 'Auditoría', '审计')}
                    </h2>
                    <div className="mt-10 grid sm:grid-cols-2 gap-4">
                        <div className="p-5 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.03]">
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 mb-3" />
                            <div className="text-sm font-bold mb-2">{lang('JARGUS Audit v2 (internal)', 'JARGUS Audit v2 (interno)', 'JARGUS 审计 v2（内部）')}</div>
                            <div className="text-2xl font-black text-emerald-400 mb-1">78/78</div>
                            <p className="text-xs text-white/50">
                                {lang('Vectors PASS · 0 critical · proprietary framework', 'Vectores PASS · 0 críticos · framework propio', '向量全通过 · 0 高危 · 自研框架')}
                            </p>
                        </div>
                        <div className="p-5 rounded-xl border border-amber-500/20 bg-amber-500/[0.03]">
                            <AlertTriangle className="w-5 h-5 text-amber-400 mb-3" />
                            <div className="text-sm font-bold mb-2">{lang('External audit', 'Auditoría externa', '外部审计')}</div>
                            <div className="text-2xl font-black text-amber-400 mb-1">{lang('Pending', 'Pendiente', '待进行')}</div>
                            <p className="text-xs text-white/50">
                                {lang('Mainnet blocker · funded by SCF Build', 'Bloquea mainnet · financiada por SCF Build', '主网上线前提 · SCF Build 资助')}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <SecurityDisclaimer />

            {/* CTA */}
            <section className="py-24 border-t border-white/5">
                <div className="max-w-3xl mx-auto px-6 text-center">
                    <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
                        {lang('Your keys, your funds', 'Tus llaves, tus fondos', '您的密钥，您的资金')}
                    </h2>
                    <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
                        <Link href="/sandbox">
                            <Button size="lg" variant="premium">
                                {lang('Create testnet vault', 'Crear vault en testnet', '创建测试网保险库')}
                                <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </Link>
                        <Link href="/treasury">
                            <Button size="lg" variant="outline" className="border-white/20 hover:bg-white/5">
                                {lang('View the product', 'Ver el producto', '查看产品')}
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
