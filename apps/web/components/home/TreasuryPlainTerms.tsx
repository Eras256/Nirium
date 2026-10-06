// Secciones para decisores no técnicos (CFO / tesorería). Vivían en la home
// hasta el 4-oct-2026; la home pasó a ser x402-first y este contenido se movió
// aquí, sin cambiar el texto, porque habla de tesorería y no de cobrar por API.
'use client';

import Link from "next/link";
import { ArrowRight, Building2, ChevronRight, FileCheck, Lock, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/context/LanguageContext";

export default function TreasuryPlainTerms() {
    const { language } = useLanguage();
    const lang = (en: string, es: string) => (language === 'es' ? es : en);

    return (
        <>
            {/* THE PROBLEM */}
            <section className="py-20 border-t border-white/5">
                <div className="max-w-4xl mx-auto px-6">
                    <h2 className="text-2xl sm:text-3xl font-bold text-center text-white/90">
                        {lang('Sound familiar?', '¿Te suena familiar?')}
                    </h2>
                    <p className="mt-4 text-center text-white/50 max-w-lg mx-auto text-sm">
                        {lang(
                            'Every CFO we talk to has the same three problems.',
                            'Todos los CFO con los que hablamos tienen los mismos tres problemas.')}
                    </p>
                    {/* md y no sm: a 640px (el breakpoint sm) las 3 columnas dejan
                        133px útiles y el número en text-5xl pide 184 — desbordaba
                        la página 4px. Desde 768px sí cabe sin encoger la tipografía. */}
                    <div className="mt-12 grid md:grid-cols-3 gap-6">
                        <div className="text-center p-6 rounded-xl border border-red-500/10 bg-red-500/[0.03]">
                            <div className="text-5xl font-black text-red-400/80">$0</div>
                            <p className="mt-3 text-sm font-semibold text-white/80">
                                {lang('Your idle cash earns nothing', 'Tu caja genera cero')}
                            </p>
                            <p className="mt-1 text-xs text-white/40">
                                {lang('Inflation eats it while it sits in the bank.', 'La inflación lo reduce cada mes.')}
                            </p>
                        </div>
                        <div className="text-center p-6 rounded-xl border border-red-500/10 bg-red-500/[0.03]">
                            <div className="text-5xl font-black text-red-400/80">{lang('Hours', 'Horas')}</div>
                            <p className="mt-3 text-sm font-semibold text-white/80">
                                {lang('Lost every week to manual transfers', 'Perdidas cada semana en transferencias manuales')}
                            </p>
                            <p className="mt-1 text-xs text-white/40">
                                {lang('Your team moves money by hand. Every. Single. Day.', 'Tu equipo mueve dinero a mano todos los días.')}
                            </p>
                        </div>
                        <div className="text-center p-6 rounded-xl border border-red-500/10 bg-red-500/[0.03]">
                            <div className="text-5xl font-black text-red-400/80">{lang('Months', 'Meses')}</div>
                            <p className="mt-3 text-sm font-semibold text-white/80">
                                {lang('To build a secure in-house solution', 'Para construir una solución propia segura')}
                            </p>
                            <p className="mt-1 text-xs text-white/40">
                                {lang('If you can build it at all.', 'Si es que puedes construirla.')}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* BRIDGE FOR NON-CRYPTO DECISION-MAKERS — sección aparte, no reemplaza
                el lenguaje técnico de abajo (ese sigue sirviendo a devs y perfiles
                cripto-nativos). Traduce las mismas garantías reales a lenguaje de
                negocio, sin nombrar protocolos ni pedir que el lector sepa qué es
                blockchain. Nada aquí puede prometer más de lo que el resto del
                sitio ya sostiene (invite-only en tesorería/payouts sigue siendo
                invite-only). */}
            <section className="py-20 border-t border-white/5 bg-white/[0.015]">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-white/50 text-[10px] font-black uppercase tracking-widest mb-4">
                            {lang("Don't speak crypto? Here's the version for you", '¿No hablas cripto? Esta versión es para ti')}
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold">
                            {lang('Same guarantees. In plain business terms.', 'Las mismas garantías. En español de negocio.')}
                        </h2>
                        <p className="mt-4 text-white/50 max-w-xl mx-auto text-sm">
                            {lang(
                                "You don't need to understand blockchain to know if this is safe for your company. Three questions any CFO asks, answered without the jargon.",
                                'No necesitas entender blockchain para saber si esto es seguro para tu empresa. Tres preguntas que hace cualquier CFO, respondidas sin la jerga.')}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="p-6 rounded-xl border border-white/10 bg-black/40">
                            <div className="p-2.5 rounded-lg bg-stellar-teal/10 w-fit mb-4">
                                <Lock className="w-5 h-5 text-stellar-teal" />
                            </div>
                            <h3 className="text-base font-bold mb-2">
                                {lang('"Can Nirium walk away with our money?"', '"¿Nirium se puede quedar con nuestro dinero?"')}
                            </h3>
                            <p className="text-sm text-white/55 leading-relaxed">
                                {lang(
                                    "No. Your money stays in an account only your company controls — like hiring an accountant who can prepare the transfer but never has the authority to sign it. We automate the decision; you (or your bank-grade contract) always hold the keys.",
                                    'No. Tu dinero se queda en una cuenta que solo controla tu empresa — como contratar a un contador que puede preparar la transferencia pero nunca tiene la firma para autorizarla. Nosotros automatizamos la decisión; tú (o tu contrato de grado bancario) siempre tienes las llaves.')}
                            </p>
                        </div>
                        <div className="p-6 rounded-xl border border-white/10 bg-black/40">
                            <div className="p-2.5 rounded-lg bg-stellar-teal/10 w-fit mb-4">
                                <TrendingUp className="w-5 h-5 text-stellar-teal" />
                            </div>
                            <h3 className="text-base font-bold mb-2">
                                {lang('"Does someone have to push the button every day?"', '"¿Alguien tiene que apretar el botón todos los días?"')}
                            </h3>
                            <p className="text-sm text-white/55 leading-relaxed">
                                {lang(
                                    'No. It runs like a standing order at your bank — "if X happens, do Y" — except the rule runs in public, every day, and anyone can check it actually followed the rule. No employee has to remember, and no employee can quietly skip it either.',
                                    'No. Corre como una regla permanente de tu banco — "si pasa X, haz Y" — solo que la regla corre en público, todos los días, y cualquiera puede revisar que sí se cumplió. Ningún empleado tiene que acordarse, y tampoco ninguno la puede saltar en silencio.')}
                            </p>
                        </div>
                        <div className="p-6 rounded-xl border border-white/10 bg-black/40">
                            <div className="p-2.5 rounded-lg bg-stellar-teal/10 w-fit mb-4">
                                <FileCheck className="w-5 h-5 text-stellar-teal" />
                            </div>
                            <h3 className="text-base font-bold mb-2">
                                {lang('"How do we prove this to an auditor?"', '"¿Cómo le probamos esto a un auditor?"')}
                            </h3>
                            <p className="text-sm text-white/55 leading-relaxed">
                                {lang(
                                    "Every movement gets a timestamped receipt that anyone can check independently, forever — not a PDF we could edit, not a database we could quietly change. It's closer to a public bank statement than to an internal spreadsheet.",
                                    'Cada movimiento obtiene un recibo con fecha y hora que cualquiera puede revisar de forma independiente, para siempre — no un PDF que pudiéramos editar, no una base de datos que pudiéramos cambiar en silencio. Se parece más a un estado de cuenta público que a un Excel interno.')}
                            </p>
                        </div>
                    </div>

                    <div className="mt-10 text-center">
                        <p className="text-sm text-white/40 max-w-lg mx-auto mb-5">
                            {lang(
                                "Curious what this looks like for your specific case? We'll walk you through it in plain language — no blockchain knowledge required on your end.",
                                '¿Quieres ver cómo aplica esto a tu caso? Te lo explicamos en español llano — no necesitas saber nada de blockchain de tu lado.')}
                        </p>
                        <a href="mailto:niriumprotocol@gmail.com">
                            <Button size="lg" variant="outline" className="border-white/20 hover:bg-white/5">
                                {lang('Talk to us in plain terms', 'Habla con nosotros, sin jerga')}
                                <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </a>
                    </div>
                </div>
            </section>

            {/* WHY NIRIUM */}
            <section className="py-20 border-t border-white/5">
                <div className="max-w-5xl mx-auto px-6">
                    <h2 className="text-2xl sm:text-3xl font-bold text-center">
                        {lang('Why trust Nirium with your money?', '¿Por qué confiar tu dinero a Nirium?')}
                    </h2>

                    {/* Guarantee callout */}
                    <div className="mt-10 relative rounded-xl border border-stellar-yellow/20 bg-stellar-yellow/[0.04] px-6 py-5 text-center overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,200,0,0.06),transparent_70%)]" />
                        <p className="relative text-base sm:text-lg font-black text-white tracking-tight">
                            {lang(
                                '"The software suggests. The contract decides. Your money never moves without your authorization."',
                                '"El software propone. El contrato decide. Tu dinero nunca se mueve sin tu autorización."')}
                        </p>
                        <p className="relative mt-2 text-xs text-stellar-yellow/60 font-mono uppercase tracking-widest">
                            {lang('Nirium Security Model — You always hold the keys', 'Modelo de seguridad Nirium — Tú siempre tienes las llaves')}
                        </p>
                    </div>

                    <div className="mt-10 grid md:grid-cols-3 gap-6">
                        {[
                            {
                                icon: Lock,
                                title: lang('Your money, your keys', 'Tu dinero, tus llaves'),
                                body:  lang(
                                    'Nirium never holds your funds. You control everything. We just run the automation on your behalf.',
                                    'Nirium nunca toca tu dinero. Tú controlas todo. Nosotros solo corremos la automatización por ti.'),
                                link: '/security',
                            },
                            {
                                icon: FileCheck,
                                title: lang('Every move, recorded', 'Cada movimiento, registrado'),
                                body:  lang(
                                    'Every action is signed and archived automatically. Export for auditors in one click. Always ready for regulators.',
                                    'Cada acción queda firmada y archivada automáticamente. Exporta para auditores en un clic. Siempre listo para reguladores.'),
                                link: '/compliance',
                            },
                            {
                                icon: Building2,
                                title: lang('Etherfuse converts your MXN — we never touch it', 'Etherfuse convierte tus MXN — nosotros nunca los tocamos'),
                                body:  lang(
                                    'To get tokenized CETES you contract directly with Etherfuse, a regulated operator: you send MXN to their CLABE and they issue the token to your wallet. Nirium never receives, holds or converts fiat — we only show you the instructions and read the resulting balance. Sandbox today.',
                                    'Para tener CETES tokenizados contratas directamente con Etherfuse, operador regulado: tú envías MXN a su CLABE y ellos emiten el token a tu wallet. Nirium nunca recibe, sostiene ni convierte fiat — solo te muestra las instrucciones y lee el saldo resultante. Hoy en sandbox.'),
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
                                    {lang('Learn more', 'Ver más')}
                                    <ChevronRight className="w-3 h-3" />
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Aviso legal — puntero corto, no una tercera versión redactada aparte.
                        El texto completo vive en un solo lugar canónico: /disclaimers
                        (que ya renderiza LegalDisclaimer variant="inline"). Repetirlo aquí
                        con otras palabras es lo que los desalinea con el tiempo. */}
                    <p className="mt-8 text-[10px] text-white/30 font-mono leading-relaxed border border-white/5 rounded-lg px-5 py-3 bg-white/[0.01]">
                        <span className="text-white/45 font-semibold uppercase tracking-widest">
                            {lang('Legal notice', 'Aviso legal')} —{' '}
                        </span>
                        {lang(
                            'Nirium is B2B software-only infrastructure and never custodies funds; financial services (SPEI onramp, CETES custody) are operated by regulated partners.',
                            'Nirium es infraestructura de software B2B y nunca custodia fondos; los servicios financieros (onramp SPEI, custodia de CETES) los operan partners regulados.')}
                        {' '}
                        <Link href="/disclaimers" className="text-stellar-teal/80 hover:text-stellar-teal underline underline-offset-2 font-bold">
                            {lang('Read full legal notice →', 'Ver aviso legal completo →')}
                        </Link>
                    </p>
                </div>
            </section>
        </>
    );
}
