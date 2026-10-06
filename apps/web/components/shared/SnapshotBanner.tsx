/** Banner fijo para páginas de pitch congeladas en una fecha. No reemplaza
 * al banner legal (LegalDisclaimer) - este dice que el contenido ES viejo,
 * no que sea riesgoso; ambos pueden convivir en la misma página. */
export default function SnapshotBanner({ date }: { date: string }) {
    return (
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 pt-6">
            <div className="rounded-xl border border-amber-400/25 bg-amber-400/[0.06] px-4 py-3 text-xs text-amber-200/80 leading-relaxed">
                Snapshot from {date}; current versions at{' '}
                <a href="/build" className="underline decoration-dotted underline-offset-2 hover:text-amber-100">
                    /build
                </a>.
            </div>
        </div>
    );
}
