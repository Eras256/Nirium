/** Nirium — Brand Assets Pack (nirium.xyz/branding-nirium)
 * Standalone download page, same shape as kumply.xyz/branding-kumply:
 * a ZIP with everything, plus every individual SVG/PNG variant browsable
 * and downloadable on its own. Built with the `branding-pack` skill
 * (audit -> concept -> real headless-browser screenshot QA -> pack).
 *
 * Concept: the N reduced to a single continuous stroke (one pen motion —
 * up, diagonal, up) with 3 accent dots marking payment / audit / agent
 * rails as waypoints on one gesture, not three competing texture zones.
 * Chosen over an earlier textured rail-tie monogram after that concept
 * was rejected twice; verified against 4 real >$100M-TVL protocol marks
 * (Aave, Lido, Sky, Hyperliquid, checked live via api.llama.fi) which all
 * share the same pattern this follows: 1-3 simple shapes, zero fine
 * linework, gradient allowed only on a simple silhouette.
 */
'use client';

import MinimalNav from "@/components/layout/MinimalNav";

const BASE = "/branding-nirium";

function SvgCard({ src, label, sub, dark, wide }: { src: string; label: string; sub: string; dark?: boolean; wide?: boolean }) {
    return (
        <div className={`rounded-xl border p-5 flex flex-col items-center gap-3 text-center ${dark ? "bg-[#0A0A0C] border-white/10" : "bg-white border-black/10"}`}>
            <div className="h-[90px] flex items-center justify-center">
                <img src={`${BASE}/svg/${src}`} alt={label} className={wide ? "max-w-full h-auto" : "max-h-[90px] max-w-full"} style={wide ? { width: "100%" } : { height: 70 }} />
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

export default function BrandingNiriumPage() {
    return (
        <main className="min-h-screen bg-[#F5F3EF] text-black antialiased">
            <style>{`.checker-bg{background-image:linear-gradient(45deg,#e6e6e6 25%,transparent 25%),linear-gradient(-45deg,#e6e6e6 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#e6e6e6 75%),linear-gradient(-45deg,transparent 75%,#e6e6e6 75%);background-size:12px 12px;background-position:0 0,0 6px,6px -6px,-6px 0}`}</style>
            <div className="bg-black">
                <MinimalNav />
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-24 pt-10">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-1">NIRIUM — Brand Assets Pack</h1>
                <p className="text-black/60 text-sm max-w-2xl mb-8">
                    Todo lo necesario para redes, eventos y prensa: vectorial (SVG) y PNG a máxima
                    resolución. Arrastra el ZIP completo a Drive o descarga solo lo que necesites.
                </p>

                <div className="flex items-center justify-between gap-4 flex-wrap bg-black text-white rounded-2xl px-7 py-6 mb-10">
                    <div>
                        <b className="block text-[17px] mb-1">Pack completo (21 archivos)</b>
                        <span className="text-white/60 text-[13px]">SVG + PNG en todas las resoluciones, más el README y el ZIP, listo para subir tal cual a una carpeta de branding en Drive</span>
                    </div>
                    <a href={`${BASE}/nirium-branding-pack.zip`} download className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-black font-bold text-sm rounded-lg px-5 py-3 whitespace-nowrap transition-colors">
                        Descargar todo (.zip)
                    </a>
                </div>

                <h2 className="text-xs uppercase tracking-widest text-black/50 mt-11 mb-4 pt-6 border-t border-black/10">
                    Vector (SVG) — usar siempre que se pueda, escala sin perder calidad
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                    <SvgCard src="icon.svg" label="Ícono" sub="fondo claro" />
                    <SvgCard src="icon-on-dark.svg" label="Ícono" sub="fondo oscuro" dark />
                    <SvgCard src="icon-mono-dark.svg" label="Un color" sub="para imprenta" />
                    <SvgCard src="icon-mono-light.svg" label="Un color" sub="fondo oscuro" dark />
                    <SvgCard src="lockup-light.svg" label="Lockup" sub="ícono + wordmark, claro" wide />
                    <SvgCard src="lockup-dark.svg" label="Lockup" sub="ícono + wordmark, oscuro" dark wide />
                    <SvgCard src="favicon.svg" label="Favicon" sub="simplificado, 16-32px" />
                </div>

                <h2 className="text-xs uppercase tracking-widest text-black/50 mt-11 mb-4 pt-6 border-t border-black/10">
                    Avatar para redes sociales (PNG, fondo sólido)
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                    <PngCard src="avatar-800.png" label="Avatar 800×800" sub="Twitter/X, Discord, LinkedIn" size={80} dark />
                    <PngCard src="avatar-1600.png" label="Avatar 1600×1600" sub="máxima resolución" size={80} dark />
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
                    Logo completo y banner social (PNG, fondo sólido)
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                    <div className="rounded-xl border border-black/10 bg-white p-5 flex flex-col items-center gap-3 text-center">
                        <img src={`${BASE}/png/lockup-light-2000.png`} alt="Lockup 2000px, fondo claro" className="w-full h-auto" />
                        <div><b className="block text-[13.5px]">Lockup 2000px</b><span className="text-xs text-black/50">fondo claro</span></div>
                        <a href={`${BASE}/png/lockup-light-2000.png`} download className="w-full text-center text-xs font-semibold rounded-md border border-black/10 text-amber-700 hover:bg-amber-50 px-3 py-2">Descargar .png</a>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-[#0A0A0C] p-5 flex flex-col items-center gap-3 text-center">
                        <img src={`${BASE}/png/lockup-dark-2000.png`} alt="Lockup 2000px, fondo oscuro" className="w-full h-auto" />
                        <div><b className="block text-[13.5px] text-white">Lockup 2000px</b><span className="text-xs text-white/50">fondo oscuro</span></div>
                        <a href={`${BASE}/png/lockup-dark-2000.png`} download className="w-full text-center text-xs font-semibold rounded-md border border-white/15 text-amber-300 hover:bg-white/5 px-3 py-2">Descargar .png</a>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-[#0A0A0C] p-5 flex flex-col items-center gap-3 text-center">
                        <img src={`${BASE}/png/social-banner-1200x630.png`} alt="Banner social 1200x630" className="w-full h-auto rounded" />
                        <div><b className="block text-[13.5px] text-white">Banner social 1200×630</b><span className="text-xs text-white/50">preview de link (Twitter/LinkedIn/Slack)</span></div>
                        <a href={`${BASE}/png/social-banner-1200x630.png`} download className="w-full text-center text-xs font-semibold rounded-md border border-white/15 text-amber-300 hover:bg-white/5 px-3 py-2">Descargar .png</a>
                    </div>
                </div>

                <h2 className="text-xs uppercase tracking-widest text-black/50 mt-11 mb-4 pt-6 border-t border-black/10">
                    Notas
                </h2>
                <p className="text-black/60 text-[13.5px] leading-relaxed max-w-2xl">
                    El README.txt dentro del ZIP explica qué archivo usar en cada caso, pensado para
                    cualquiera sin contexto técnico. Pendiente honesto: la tipografía de la palabra
                    &quot;NIRIUM&quot; en los lockups sigue en Arial de sistema (placeholder, no una
                    versión final de imprenta), y este pack no se probó todavía contra el ancho real
                    de la barra de navegación de nirium.xyz — se validó la legibilidad del ícono a
                    16px de forma aislada, en su propio lienzo.
                </p>
            </div>
        </main>
    );
}
