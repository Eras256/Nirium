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
    const lang = (en: string, es: string) =>
        language === 'es' ? es : en;

    return (
        <main className="min-h-screen bg-black text-white antialiased">
{/* HERO */}
            <section className="relative pt-8 pb-16 sm:pt-8 sm:pb-20">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(45,235,232,0.06),transparent_60%)]" />
                <div className="relative max-w-5xl mx-auto px-6">
                    <div className="flex justify-center mb-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-stellar-teal/20 bg-stellar-teal/5 text-stellar-teal text-xs font-mono">
                            <Sparkles className="w-3 h-3" />
                            {lang('Custody layer', 'Capa de custodia')}
                        </div>
                    </div>

                    <h1 className="text-center text-4xl sm:text-6xl font-black leading-[1.05] tracking-tight">
                        {lang('100% non-custodial', '100% non-custodial')}
                    </h1>
                    <p className="mt-6 text-center text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
                        {lang(
                            'Soroban 2-of-3 vault. The client holds the keys. Nirium can never move your funds. Period.',
                            'Vault Soroban 2-de-3. El cliente controla las llaves. Nirium nunca puede mover tus fondos. Punto.')}
                    </p>
                </div>
            </section>

            {/* THE 3-KEY STRUCTURE */}
            <section className="py-16 border-t border-white/5">
                <div className="max-w-5xl mx-auto px-6">
                    <h2 className="text-2xl sm:text-3xl font-bold text-center">
                        {lang('Three keys. Two signatures.', 'Tres llaves. Dos firmas.')}
                    </h2>
                    <p className="mt-4 text-center text-white/60 max-w-2xl mx-auto">
                        {lang(
                            'Any critical vault operation requires 2 of 3 signatures. No one can move funds alone.',
                            'Para cualquier operación crítica del vault se necesitan 2 de 3 firmas. Nadie puede mover los fondos solo.')}
                    </p>

                    <div className="mt-12 grid md:grid-cols-3 gap-6">
                        {[
                            {
                                role: 'Owner',
                                desc: lang('Founder, CEO or primary decider', 'Founder, CEO o decisor principal'),
                            },
                            {
                                role: 'Cosigner 1',
                                desc: lang('CTO, Operations or Admin', 'CTO, Operations o Admin'),
                            },
                            {
                                role: 'Cosigner 2',
                                desc: lang('Legal, Board or external advisor', 'Legal, Board o asesor externo'),
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
                        {lang('What requires 2-of-3 multisig', 'Qué requiere multisig 2-de-3')}
                    </h2>

                    <div className="mt-12 grid md:grid-cols-2 gap-6">
                        <div className="p-6 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.03]">
                            <div className="flex items-center gap-2 mb-4">
                                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                <h3 className="text-lg font-bold">{lang('Automatic operations', 'Operaciones automáticas')}</h3>
                            </div>
                            <p className="text-sm text-white/60 mb-4">
                                {lang(
                                    'The agent can execute without additional signature under preconfigured limits:',
                                    'El agente puede ejecutar sin firma adicional bajo límites preconfigurados:')}
                            </p>
                            <ul className="space-y-2 text-sm text-white/70">
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400/80 shrink-0 mt-0.5" />
                                    {lang('Move idle capital in and out of the strategy, inside your own vault', 'Mover capital ocioso hacia la estrategia y de regreso, dentro de tu propia bóveda')}
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400/80 shrink-0 mt-0.5" />
                                    {lang('Up to the max_execution_amount the owner set when delegating', 'Hasta el max_execution_amount que el dueño fijó al delegar')}
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400/80 shrink-0 mt-0.5" />
                                    {lang('Reports and queries (read-only)', 'Reportes y consultas (read-only)')}
                                </li>
                            </ul>
                        </div>

                        <div className="p-6 rounded-xl border border-amber-500/20 bg-amber-500/[0.03]">
                            <div className="flex items-center gap-2 mb-4">
                                <Shield className="w-5 h-5 text-amber-400" />
                                <h3 className="text-lg font-bold">{lang('Critical operations', 'Operaciones críticas')}</h3>
                            </div>
                            <p className="text-sm text-white/60 mb-4">
                                {lang(
                                    'These require 2 human signatures, no exceptions:',
                                    'Estas requieren 2 firmas humanas obligatoriamente:')}
                            </p>
                            <ul className="space-y-2 text-sm text-white/70">
                                <li className="flex items-start gap-2">
                                    <Shield className="w-4 h-4 text-amber-400/80 shrink-0 mt-0.5" />
                                    {lang('Any withdrawal — only the vault owner can sign it', 'Cualquier retiro — solo lo firma el dueño de la bóveda')}
                                </li>
                                <li className="flex items-start gap-2">
                                    <Shield className="w-4 h-4 text-amber-400/80 shrink-0 mt-0.5" />
                                    {lang('Cosigner changes', 'Cambio de cosignatarios')}
                                </li>
                                <li className="flex items-start gap-2">
                                    <Shield className="w-4 h-4 text-amber-400/80 shrink-0 mt-0.5" />
                                    {lang('Emergency vault pause', 'Pausa de emergencia del vault')}
                                </li>
                                <li className="flex items-start gap-2">
                                    <Shield className="w-4 h-4 text-amber-400/80 shrink-0 mt-0.5" />
                                    {lang('Vault closure', 'Cierre del vault')}
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
                        {lang('What Nirium CANNOT do', 'Lo que Nirium NO puede hacer')}
                    </h2>
                    <p className="mt-4 text-center text-white/60">
                        {lang(
                            'Not a legal disclaimer — a technical impossibility at the Soroban contract level.',
                            'No es un disclaimer legal — es una imposibilidad técnica al nivel del contrato Soroban.')}
                    </p>

                    <div className="mt-10 space-y-3">
                        {[
                            lang('Move your funds without your signature', 'Mover tus fondos sin tu firma'),
                            lang('Change your cosigners', 'Cambiar tus cosignatarios'),
                            lang('Withdraw funds to a Nirium wallet', 'Retirar fondos a una wallet de Nirium'),
                            lang('Access your private keys', 'Acceder a tus llaves privadas'),
                            lang('Unilaterally pause your vault', 'Pausar tu vault unilateralmente'),
                            lang('Modify vault code once deployed', 'Modificar el código del vault una vez deployado'),
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
                        {lang('The real contract', 'El contrato real')}
                    </h2>
                    <p className="mt-4 text-center text-white/60">
                        {lang(
                            'NiriumVault is deployed on Stellar Testnet and is verifiable.',
                            'NiriumVault está deployado en Stellar Testnet y es verificable.')}
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
                                {lang('View on Stellar Expert', 'Ver en Stellar Expert')}
                            </a>
                            <Link
                                href="https://github.com/Eras256/Nirium"
                                target="_blank"
                                rel="noopener"
                                className="inline-flex items-center gap-2 text-xs text-stellar-teal hover:underline"
                            >
                                <FileSearch className="w-3.5 h-3.5" />
                                {lang('View source code', 'Ver código fuente')}
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* AUDIT */}
            <section className="py-16 border-t border-white/5">
                <div className="max-w-3xl mx-auto px-6">
                    <h2 className="text-2xl sm:text-3xl font-bold text-center">
                        {lang('Audit', 'Auditoría')}
                    </h2>
                    <div className="mt-10 max-w-sm mx-auto">
                        <div className="p-5 rounded-xl border border-amber-500/20 bg-amber-500/[0.03]">
                            <AlertTriangle className="w-5 h-5 text-amber-400 mb-3" />
                            <div className="text-sm font-bold mb-2">{lang('External audit', 'Auditoría externa')}</div>
                            <div className="text-2xl font-black text-amber-400 mb-1">{lang('Pending', 'Pendiente')}</div>
                            <p className="text-xs text-white/50">
                                {lang('Mainnet gate for the vault', 'Bloquea el mainnet del vault')}
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
                        {lang('Your keys, your funds', 'Tus llaves, tus fondos')}
                    </h2>
                    <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
                        <Link href="/sandbox">
                            <Button size="lg" variant="premium">
                                {lang('Create testnet vault', 'Crear vault en testnet')}
                                <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </Link>
                        <Link href="/treasury">
                            <Button size="lg" variant="outline" className="border-white/20 hover:bg-white/5">
                                {lang('View the product', 'Ver el producto')}
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
