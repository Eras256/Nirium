/** Nirium Play — Brand Assets Pack (nirium.xyz/branding-nirium-play)
 * Same pattern as /branding-nirium: standalone download page, ZIP with
 * everything, every SVG/PNG variant browsable and downloadable on its own.
 * Built with the `branding-pack` skill.
 *
 * Concept, v2 (revised after a first pass that was just a generic capsule):
 * a real gamepad silhouette — curved grips, the notch between them, two
 * shoulder triggers on top — not an abstract pill. The D-pad position holds
 * the exact official Nirium N stroke (same path as branding-nirium/svg/
 * icon.svg, diffed byte-for-byte against the live production copy before
 * shipping this). The face-button position holds the two payment/audit dots
 * from the core mark plus a third accent: a 4-point Stellar star.
 *
 * Two tiers, verified with real headless-browser screenshots down to 16px
 * (not eyeballed): the hero icon (stroke, with the trigger/notch detail)
 * reads well to ~48px; below that a separate filled-silhouette favicon
 * variant (detail dropped, N and star knocked out in negative space) takes
 * over — the same technique the core Nirium favicon.svg does not need,
 * because this mark carries more fine detail than a bare N.
 */
'use client';

import MinimalNav from "@/components/layout/MinimalNav";

const BASE = "/branding-nirium-play";

function SvgCard({ src, label, sub, dark }: { src: string; label: string; sub: string; dark?: boolean }) {
    return (
        <div className={`rounded-xl border p-5 flex flex-col items-center gap-3 text-center ${dark ? "bg-[#0A0A0C] border-white/10" : "bg-white border-black/10"}`}>
            <div className="h-[90px] flex items-center justify-center">
                <img src={`${BASE}/svg/${src}`} alt={label} style={{ height: 70 }} />
            </div>
            <div>
                <b className={`block text-[13.5px] ${dark ? "text-white" : "text-black"}`}>{label}</b>
                <span className={`text-xs ${dark ? "text-white/50" : "text-black/50"}`}>{sub}</span>
            </div>
            <a href={`${BASE}/svg/${src}`} download className={`w-full text-center text-xs font-semibold rounded-md border px-3 py-2 ${dark ? "border-white/15 text-amber-300 hover:bg-white/5" : "border-black/10 text-amber-700 hover:bg-amber-50"}`}>
                Descargar .svg
            </a>
        </div>
    );
}

function PngCard({ src, label, sub, size, checker, dark }: { src: string; label: string; sub?: string; size: number; checker?: boolean; dark?: boolean }) {
    return (
        <div className={`rounded-xl border p-5 flex flex-col items-center gap-3 text-center ${checker ? "checker-bg border-black/10" : dark ? "bg-[#0A0A0C] border-white/10" : "bg-white border-black/10"}`}>
            <div className="h-[90px] flex items-center justify-center">
                <img src={`${BASE}/png/${src}`} alt={label} style={{ width: Math.min(size, 70) }} />
            </div>
            <div>
                <b className={`block text-[13.5px] ${dark && !checker ? "text-white" : "text-black"}`}>{label}</b>
                {sub && <span className={`text-xs ${dark && !checker ? "text-white/50" : "text-black/50"}`}>{sub}</span>}
            </div>
            <a href={`${BASE}/png/${src}`} download className={`w-full text-center text-xs font-semibold rounded-md border px-3 py-2 border-black/10 text-amber-700 hover:bg-amber-50`}>
                Descargar .png
            </a>
        </div>
    );
}

export default function BrandingNiriumPlayPage() {
    return (
        <main className="min-h-screen bg-[#F5F3EF] text-black antialiased">
            <style>{`.checker-bg{background-image:linear-gradient(45deg,#e6e6e6 25%,transparent 25%),linear-gradient(-45deg,#e6e6e6 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#e6e6e6 75%),linear-gradient(-45deg,transparent 75%,#e6e6e6 75%);background-size:12px 12px;background-position:0 0,0 6px,6px -6px,-6px 0}`}</style>
            <div className="bg-black">
                <MinimalNav />
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-24 pt-10">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-1">NIRIUM PLAY — Logo Pack</h1>
                <p className="text-black/60 text-sm max-w-2xl mb-3">
                    Variante del mark de Nirium para el sub-brand &quot;Play&quot;: silueta real de
                    control de videojuegos, con la N oficial de Nirium y un acento de Stellar.
                    Vectorial (SVG) y PNG a máxima resolución.
                </p>
                <p className="text-black/45 text-xs max-w-2xl mb-8 leading-relaxed">
                    Cuerpo con las dos empuñaduras curvas, el corte central entre ellas y los
                    gatillos L/R arriba — reconocible como control de inmediato. A la izquierda,
                    en el lugar del D-pad, el trazo de la N es exactamente el mismo path que{" "}
                    <code className="bg-black/5 px-1 rounded">branding-nirium/svg/icon.svg</code>{" "}
                    — diff byte a byte contra la copia real en producción antes de publicar esto.
                    A la derecha, los dos puntos de pago/auditoría del mark original se completan
                    con una estrella de 4 puntas — Stellar, en el lugar de un botón de acción.
                </p>

                <div className="flex items-center justify-between gap-4 flex-wrap bg-black text-white rounded-2xl px-7 py-6 mb-10">
                    <div>
                        <b className="block text-[17px] mb-1">Pack completo (15 archivos)</b>
                        <span className="text-white/60 text-[13px]">SVG + PNG en todas las resoluciones, más el README y el ZIP</span>
                    </div>
                    <a href={`${BASE}/nirium-play-branding-pack.zip`} download className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-black font-bold text-sm rounded-lg px-5 py-3 whitespace-nowrap transition-colors">
                        Descargar todo (.zip)
                    </a>
                </div>

                <h2 className="text-xs uppercase tracking-widest text-black/50 mt-11 mb-4 pt-6 border-t border-black/10">
                    Vector (SVG)
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                    <SvgCard src="icon.svg" label="Ícono hero" sub="trazo, detalle completo" />
                    <SvgCard src="favicon.svg" label="Favicon" sub="silueta rellena, 16-48px" />
                </div>

                <h2 className="text-xs uppercase tracking-widest text-black/50 mt-11 mb-4 pt-6 border-t border-black/10">
                    Avatar para redes sociales (PNG, fondo sólido)
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                    <PngCard src="avatar-dark-800.png" label="800×800" sub="fondo oscuro" size={80} dark />
                    <PngCard src="avatar-dark-1600.png" label="1600×1600" sub="fondo oscuro, máx. res." size={80} dark />
                    <PngCard src="avatar-light-800.png" label="800×800" sub="fondo claro" size={80} />
                    <PngCard src="avatar-light-1600.png" label="1600×1600" sub="fondo claro, máx. res." size={80} />
                </div>

                <h2 className="text-xs uppercase tracking-widest text-black/50 mt-11 mb-4 pt-6 border-t border-black/10">
                    Ícono transparente (PNG)
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                    <PngCard src="icon-transparent-512.png" label="512×512" size={70} checker />
                    <PngCard src="icon-transparent-1024.png" label="1024×1024" size={70} checker />
                    <PngCard src="icon-transparent-2048.png" label="2048×2048" sub="máxima resolución" size={70} checker />
                </div>

                <h2 className="text-xs uppercase tracking-widest text-black/50 mt-11 mb-4 pt-6 border-t border-black/10">
                    Favicon / ícono de app (PNG, fondo transparente)
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
                    <PngCard src="favicon-16.png" label="16×16" size={16} checker />
                    <PngCard src="favicon-32.png" label="32×32" size={32} checker />
                    <PngCard src="favicon-48.png" label="48×48" size={48} checker />
                    <PngCard src="favicon-180.png" label="180×180" sub="apple touch icon" size={64} checker />
                    <PngCard src="favicon-512.png" label="512×512" sub="PWA / app icon" size={70} checker />
                </div>

                <h2 className="text-xs uppercase tracking-widest text-black/50 mt-11 mb-4 pt-6 border-t border-black/10">
                    Notas
                </h2>
                <p className="text-black/60 text-[13.5px] leading-relaxed max-w-2xl">
                    El README.txt dentro del ZIP explica qué archivo usar en cada caso. Pendientes
                    honestos: no hay wordmark (&quot;NIRIUM PLAY&quot; en texto) ni lockup todavía,
                    tampoco variantes mono de un solo color. No se corrió una búsqueda formal de
                    marca registrada contra este ícono — es una variante interna para HackMeridian,
                    no un mark que se vaya a registrar. Tampoco se probó contra el ancho real de
                    ningún navbar. Verificado sí, con captura de navegador real: la legibilidad del
                    ícono hero hasta ~48px y de la silueta de favicon hasta 16px, en fondo oscuro y
                    claro.
                </p>
            </div>
        </main>
    );
}
