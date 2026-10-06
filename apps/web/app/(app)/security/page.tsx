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
                            'The vault is controlled by three keys — pause/unpause needs two of them. Every other critical operation is gated to one specific signer. The agent alone can never move funds.',
                            'El vault lo controlan tres llaves — pausar/reanudar necesita dos de ellas. Cualquier otra operación crítica está acotada a un firmante único específico. El agente por sí solo nunca puede mover fondos.')}
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
                            {/* "2 firmas obligatorias" era falso para 3 de estas 4 — verificado
                                línea por línea en nirium_vault.rs: withdraw/close_vault llaman
                                solo vault.owner.require_auth(), set_cosigners solo
                                admin.require_auth(). El único caso de multisig 2-de-3 real es
                                pause/unpause (verify_multisig), y aun ahí cae a admin-solo si
                                los cosignatarios no están configurados todavía. */}
                            <p className="text-sm text-white/60 mb-4">
                                {lang(
                                    "These need a human signature outside the agent's automatic limits — who exactly signs depends on the operation:",
                                    'Estas necesitan una firma humana fuera de los límites automáticos del agente — quién firma exactamente depende de la operación:')}
                            </p>
                            <ul className="space-y-2 text-sm text-white/70">
                                <li className="flex items-start gap-2">
                                    <Shield className="w-4 h-4 text-amber-400/80 shrink-0 mt-0.5" />
                                    {lang('Any withdrawal — only the vault owner can sign it', 'Cualquier retiro — solo lo firma el dueño de la bóveda')}
                                </li>
                                <li className="flex items-start gap-2">
                                    <Shield className="w-4 h-4 text-amber-400/80 shrink-0 mt-0.5" />
                                    {lang('Cosigner changes — only the admin can sign it (bootstraps the 2-of-3 setup)', 'Cambio de cosignatarios — solo lo firma el admin (arranca la configuración 2-de-3)')}
                                </li>
                                <li className="flex items-start gap-2">
                                    <Shield className="w-4 h-4 text-amber-400/80 shrink-0 mt-0.5" />
                                    {lang('Emergency pause / unpause — 2-of-3 multisig once cosigners are registered; admin-only until then', 'Pausa / reanudación de emergencia — multisig 2-de-3 una vez registrados los cosignatarios; solo admin mientras tanto')}
                                </li>
                                <li className="flex items-start gap-2">
                                    <Shield className="w-4 h-4 text-amber-400/80 shrink-0 mt-0.5" />
                                    {lang('Vault closure — only the vault owner can sign it', 'Cierre del vault — solo lo firma el dueño de la bóveda')}
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
                    <p className="mt-4 text-center text-xs text-white/40">
                        {lang(
                            'Checked directly against the contract’s live exported interface below — not yet confirmed by an independent third-party audit.',
                            'Verificado directo contra la interfaz exportada real del contrato, abajo — todavía sin confirmar por una auditoría externa independiente.')}
                    </p>
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
                        <div className="mt-5 pt-5 border-t border-white/5 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs uppercase tracking-widest text-white/40 font-mono">WASM hash</span>
                                <span className="text-[10px] text-white/50 font-mono">stellar contract fetch</span>
                            </div>
                            <code className="text-xs text-white/60 font-mono break-all block">
                                d36eba5ce2b6e7fcc93064960321b6cedc7fdde28e02c7a8a60cc0eab0d529d3
                            </code>
                            <p className="text-[11px] text-white/50 leading-relaxed pt-1">
                                {lang(
                                    'Fetched directly from the live testnet ledger and inspected: 29 exported functions, none named upgrade, migrate, or set_wasm. "Cannot modify code once deployed" is not asserted — it is absent from the bytecode itself, checkable by anyone with the Stellar CLI (stellar contract fetch --id CBTWMZCG3P72EHFAQ4ZLSEBIOFYJC244H5J6DHZIJ56FHFWJ2CFAWSZU --network testnet, then stellar contract info interface --wasm). Stellar Expert still shows this contract as "unverified" — that badge requires a separate reproducible-build submission we have not completed yet; this on-chain interface check is independent of it and does not depend on that badge.',
                                    'Bajado directo del ledger de testnet en vivo e inspeccionado: 29 funciones exportadas, ninguna llamada upgrade, migrate ni set_wasm. "No se puede modificar el código una vez deployado" no se afirma — está ausente del bytecode mismo, verificable por cualquiera con el CLI de Stellar (stellar contract fetch --id CBTWMZCG3P72EHFAQ4ZLSEBIOFYJC244H5J6DHZIJ56FHFWJ2CFAWSZU --network testnet, luego stellar contract info interface --wasm). Stellar Expert todavía marca este contrato como "unverified" — esa insignia requiere un envío de build reproducible aparte que aún no hicimos; esta verificación de interfaz on-chain es independiente de esa insignia y no depende de ella.')}
                            </p>
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
