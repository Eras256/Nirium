"use client";

import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const EVIDENCE_TX = "e4fa3df9cb225a4d7f64dd0082eb38218ada4b4af3378f288989a5d4b1116ed9";

const USE_CASES = [
    {
        title: "APIs pagadas por llamada para desarrolladores de Pollar",
        body: "Un desarrollador que ya construye sobre Pollar podría cobrar por su propia API sin salir del flujo de login social que sus usuarios ya conocen.",
    },
    {
        title: "Recibos de auditoría verificables",
        body: "Cada pago puede anclar evidencia inmutable en IPFS, útil para cualquier socio de Pollar que necesite mostrar cumplimiento sin construir esa pieza desde cero.",
    },
    {
        title: "Liquidación entre agentes, dentro de apps de consumo",
        body: "El caso que más interés generó en la llamada. El detalle está más abajo.",
    },
];

const SCENE = [
    { actor: "Usuario", text: <>Abre una app de viajes y pide <em className="not-italic font-semibold text-white">"encuéntrame el vuelo más barato a Bogotá este fin de semana".</em></> },
    { actor: "Agente A", text: "Necesita datos de tres proveedores de tarifas distintos. En vez de tres cuentas de API precontratadas, paga cada consulta al momento, por Pollar, con la wallet que el usuario nunca vio." },
    { actor: "Agentes B, C, D", text: "Cobran su respuesta por request, liquidado on-chain, sin facturas ni contratos entre las partes." },
    { actor: "Usuario", text: "Ve tres opciones de vuelo en su pantalla. Nunca supo que hubo pagos, ni cuántos, ni entre quién y quién." },
];

export default function PollarAdapterDocumentationPage() {
    return (
        <main className="min-h-screen bg-black text-white selection:bg-stellar-teal/30">
            <div className="max-w-3xl mx-auto px-6 pt-16 pb-32">

                {/* Masthead */}
                <motion.header
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-16 pb-10 border-b border-white/10"
                >
                    <p className="text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-4">
                        Documento interno para el equipo de Pollar, 18 de agosto de 2026
                    </p>
                    <div className="flex items-baseline gap-3 flex-wrap mb-4">
                        <span className="text-3xl sm:text-5xl font-black tracking-tight">Nirium</span>
                        <span className="text-2xl sm:text-3xl font-mono text-stellar-teal">⇄</span>
                        <span className="text-3xl sm:text-5xl font-black tracking-tight">Pollar</span>
                    </div>
                    <p className="text-lg text-gray-400 max-w-xl leading-relaxed">
                        Cómo el adaptador de Nirium para el SDK de Pollar deja pagar con dinero real a alguien que nunca instaló una wallet, en qué punto está hoy, y qué vimos en la llamada de esta semana que vale la pena explorar juntos.
                    </p>
                </motion.header>

                {/* 01 · Qué es */}
                <section className="mb-16 pb-16 border-b border-white/5">
                    <p className="text-[11px] font-mono uppercase tracking-widest text-stellar-teal mb-3">01 · Qué es y por qué existe</p>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-5">Traducir un dialecto a otro</h2>
                    <p className="text-gray-400 leading-relaxed mb-4">
                        Un usuario que entra a una app con Pollar nunca ve una wallet. Entra con Google, firma con lo que Pollar llama <code className="text-stellar-teal font-mono text-sm bg-white/5 px-1.5 py-0.5 rounded">signAuthEntry</code>, y su sesión maneja parámetros como <code className="text-stellar-teal font-mono text-sm bg-white/5 px-1.5 py-0.5 rounded">validUntilLedger</code> y <code className="text-stellar-teal font-mono text-sm bg-white/5 px-1.5 py-0.5 rounded">status</code>. El protocolo de pago por request de Stellar, x402, habla otro idioma: espera <code className="text-stellar-teal font-mono text-sm bg-white/5 px-1.5 py-0.5 rounded">networkPassphrase</code> y un <code className="text-stellar-teal font-mono text-sm bg-white/5 px-1.5 py-0.5 rounded">signedAuthEntry</code> en formato SEP-43.
                    </p>
                    <p className="text-gray-400 leading-relaxed mb-6">
                        El adaptador es esa traducción. Toma la firma que produce el login social de Pollar y la reempaqueta exactamente como x402 la espera, para que una API pueda cobrar por cada llamada sin que el usuario final sepa que existe una blockchain de por medio.
                    </p>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white/[0.03] border border-white/10 rounded-xl p-5 font-mono text-xs">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] uppercase tracking-widest text-gray-500">Pollar entrega</span>
                            <span className="text-gray-200">validUntilLedger, status</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-stellar-teal shrink-0 rotate-90 sm:rotate-0" />
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] uppercase tracking-widest text-gray-500">nirium-pollar-adapter</span>
                            <span className="text-gray-200">createPollarSigner()</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-stellar-teal shrink-0 rotate-90 sm:rotate-0" />
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] uppercase tracking-widest text-gray-500">x402 espera</span>
                            <span className="text-gray-200">networkPassphrase, signedAuthEntry</span>
                        </div>
                    </div>
                    <p className="text-gray-400 leading-relaxed mt-6">
                        Nada se deposita por adelantado. Cada request paga su propia llamada, liquidado on-chain antes de responder.
                    </p>
                </section>

                {/* 02 · Estado actual */}
                <section className="mb-16 pb-16 border-b border-white/5">
                    <p className="text-[11px] font-mono uppercase tracking-widest text-stellar-teal mb-3">02 · Dónde está hoy</p>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-6">Publicado, probado por nuestro lado</h2>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/10 border border-white/10 rounded-xl overflow-hidden mb-6">
                        <div className="bg-black p-4">
                            <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1.5">npm</p>
                            <p className="font-mono text-sm">nirium-pollar-adapter@0.4.0</p>
                        </div>
                        <div className="bg-black p-4">
                            <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1.5">Peer requerido</p>
                            <p className="font-mono text-sm">@pollar/core &gt;=0.11.0</p>
                        </div>
                        <div className="bg-black p-4">
                            <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1.5">Login social Pollar</p>
                            <div className="inline-flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 uppercase tracking-widest font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                en vivo
                            </div>
                        </div>
                        <div className="bg-black p-4">
                            <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1.5">Probado por Pollar</p>
                            <div className="inline-flex items-center gap-1.5 text-[11px] font-mono text-amber-400 uppercase tracking-widest font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                aún no
                            </div>
                        </div>
                    </div>

                    <div className="border-l-2 border-amber-400/50 bg-white/[0.02] rounded-r-xl p-5 mb-6">
                        <p className="text-sm font-semibold text-white mb-2">Para ser exactos sobre quién probó qué.</p>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            Nirium construyó el adaptador y lo probó de punta a punta contra la API real de Pollar, incluyendo una liquidación real en mainnet. Pollar todavía no lo ha corrido ni validado de su lado, y eso quedó claro en la llamada de esta semana. Todo lo que sigue en esta página describe lo que nosotros verificamos, no un acuerdo ya cerrado entre las dos partes.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white/[0.03] border border-white/10 rounded-xl p-5">
                        <div>
                            <p className="text-sm font-semibold text-white">Pago real desde login social de Pollar</p>
                            <p className="text-xs text-gray-500 mt-1">5 de agosto de 2026 · 0.02 USDC · el usuario sostuvo cero XLM en todo el camino</p>
                        </div>
                        <a
                            href={`https://stellar.expert/explorer/public/tx/${EVIDENCE_TX}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-xs text-stellar-teal hover:underline shrink-0"
                        >
                            e4fa3df9…16ed9 ↗
                        </a>
                    </div>

                    <p className="text-gray-400 leading-relaxed mt-6">
                        El adaptador ya corre en la propia app de Nirium: el login social de Pollar está integrado en el navbar y en la consola de API keys, y cualquier persona puede probarlo hoy sin instalar nada.
                    </p>
                </section>

                {/* 03 · Lo que cambió */}
                <section className="mb-16 pb-16 border-b border-white/5">
                    <p className="text-[11px] font-mono uppercase tracking-widest text-stellar-teal mb-3">03 · Lo que cambió esta semana</p>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-6">El endpoint de fondeo diferido ya está vivo del lado de ustedes</h2>
                    <div className="grid sm:grid-cols-[1fr_auto_1fr] gap-4 items-center mb-6">
                        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5">
                            <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-2">Antes de esta semana</p>
                            <p className="font-semibold text-white mb-1.5">Modo inmediato, obligatorio</p>
                            <p className="text-sm text-gray-400">Cada wallet nueva necesitaba un fondeo inicial de unos 2 XLM para poder operar, sin alternativa.</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-stellar-teal shrink-0 mx-auto rotate-90 sm:rotate-0" />
                        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5">
                            <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-2">Confirmado en la llamada</p>
                            <p className="font-semibold text-white mb-1.5">Fondeo diferido disponible</p>
                            <p className="text-sm text-gray-400">
                                Con <code className="text-stellar-teal font-mono text-xs bg-white/5 px-1 py-0.5 rounded">POST /v1/wallets/activate</code> ya vivo del lado de Pollar, ese costo por usuario deja de ser obligatorio en cuanto alguien lo conecte.
                            </p>
                        </div>
                    </div>
                    <p className="text-gray-400 leading-relaxed">
                        Esto no es algo que Nirium construyó. Es una novedad del lado de Pollar que cambia el cálculo de costos para cualquiera que use el adaptador a volumen, y vale la pena que quede registrado antes de seguir la conversación.
                    </p>
                </section>

                {/* 04 · Casos de uso */}
                <section className="mb-16 pb-16 border-b border-white/5">
                    <p className="text-[11px] font-mono uppercase tracking-widest text-stellar-teal mb-3">04 · Para explorar, no para adoptar</p>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-3">Formas de usar esto, si les hace sentido</h2>
                    <p className="text-gray-400 leading-relaxed mb-6">
                        Nada de esto es una integración que haya que decidir hoy. Son puntos de partida concretos para revisar cuando el equipo tenga espacio.
                    </p>
                    <div className="flex flex-col divide-y divide-white/10 border border-white/10 rounded-xl overflow-hidden">
                        {USE_CASES.map((uc) => (
                            <div key={uc.title} className="flex gap-4 p-5 bg-white/[0.02]">
                                <ArrowRight className="w-4 h-4 text-stellar-teal shrink-0 mt-1" />
                                <div>
                                    <p className="font-semibold text-white text-sm mb-1">{uc.title}</p>
                                    <p className="text-sm text-gray-400">{uc.body}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 05 · Visión */}
                <section className="mb-16">
                    <div className="bg-gradient-to-br from-stellar-teal/10 to-transparent border border-stellar-teal/20 rounded-2xl p-8 sm:p-10">
                        <p className="text-[11px] font-mono uppercase tracking-widest text-stellar-teal mb-3">05 · La idea que sí generó chispa en la llamada</p>
                        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-5">Agentes que se pagan entre sí, sin que nadie lo vea</h2>
                        <p className="text-gray-300 leading-relaxed mb-8">
                            Lo que más interés real despertó fue lo que el adaptador habilita: apps de consumo pequeñas donde el agente de una hace una llamada al agente de otra, se paga solo, y la persona del otro lado solo ve el resultado.
                        </p>
                        <div className="border-l-2 border-stellar-teal/30 pl-6 flex flex-col gap-5 mb-8">
                            {SCENE.map((s, i) => (
                                <div key={i} className="flex flex-col sm:flex-row gap-1.5 sm:gap-4">
                                    <span className="text-[10px] font-mono uppercase tracking-widest text-stellar-teal/70 shrink-0 sm:w-24">{s.actor}</span>
                                    <span className="text-sm text-gray-300 leading-relaxed">{s.text}</span>
                                </div>
                            ))}
                        </div>
                        <p className="text-gray-300 leading-relaxed mb-6">
                            Pollar ya resuelve la parte difícil de esto para el usuario final: identidad sin fricción, wallet sin que se note. Nirium resuelve la parte difícil para el agente: pagar y cobrar por llamada, con evidencia verificable de cada una. Juntas, esas dos piezas son lo que hace posible una economía de agentes que la gente use sin darse cuenta de que la está usando.
                        </p>
                        <p className="text-lg font-semibold text-white leading-snug">
                            Ninguna app hoy necesita que su usuario entienda x402. Necesita que su producto funcione mejor porque los agentes detrás pueden pagarse entre ellos.
                        </p>
                    </div>
                </section>

                {/* 06 · Oferta */}
                <section className="mb-16">
                    <p className="text-[11px] font-mono uppercase tracking-widest text-stellar-teal mb-3">06 · Una oferta abierta</p>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-3">Acceso ampliado, cuando les sirva</h2>
                    <p className="text-gray-400 leading-relaxed mb-6">
                        Dos piezas de infraestructura de Nirium hoy son invite-only en mainnet mientras cerramos una revisión legal. Si a Pollar le resulta útil para evaluar la integración con más profundidad, podemos abrir acceso anticipado.
                    </p>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="bg-white/[0.02] border border-white/10 rounded-xl p-6 hover:border-white/20 transition-colors">
                            <div className="w-9 h-9 rounded-lg bg-stellar-teal/10 text-stellar-teal flex items-center justify-center font-mono text-sm mb-4">◆</div>
                            <h3 className="font-bold text-white mb-2">Audit trail ampliado</h3>
                            <p className="text-sm text-gray-400">Acceso de lectura a más anclajes de auditoría de los que hoy son públicos, para evaluar el formato de evidencia con datos reales, no solo con ejemplos.</p>
                        </div>
                        <div className="bg-white/[0.02] border border-white/10 rounded-xl p-6 hover:border-white/20 transition-colors">
                            <div className="w-9 h-9 rounded-lg bg-stellar-teal/10 text-stellar-teal flex items-center justify-center font-mono text-sm mb-4">▤</div>
                            <h3 className="font-bold text-white mb-2">Reportería institucional</h3>
                            <p className="text-sm text-gray-400">Exportes en formato institucional (CSV/JSON) sobre actividad liquidada, útiles si alguien del lado de Pollar necesita mostrar números hacia adentro antes de comprometerse a nada.</p>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="pt-10 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-sm">
                    <div className="flex gap-5 text-gray-400">
                        <a href="https://www.npmjs.com/package/nirium-pollar-adapter" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">npm</a>
                        <a href="https://github.com/Eras256/Nirium" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a>
                        <a href="/" className="hover:text-white transition-colors">nirium.xyz</a>
                    </div>
                    <span className="text-xs font-mono text-gray-600">nirium-pollar-adapter v0.4.0 · Stellar Mainnet</span>
                </footer>

            </div>
        </main>
    );
}
