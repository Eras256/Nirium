// HTTP 451 — Unavailable For Legal Reasons.
//
// Se sirve por rewrite desde middleware.ts cuando la petición viene de una
// jurisdicción Tier A. Vive FUERA de (app) a propósito: el layout de la app
// monta wallet, red y contextos que no deben ejecutarse para alguien a quien
// no le ofrecemos servicio.
//
// Deliberadamente no es un muro: dice cuál es la lista, por qué, y deja
// abiertos los documentos legales y el correo. Una restricción que no se puede
// leer ni cuestionar se parece más a una falla que a una política.

export const metadata = {
    title: 'Not available in your jurisdiction — Nirium',
    robots: { index: false, follow: false },
};

export default async function BlockedPage({
    searchParams,
}: {
    searchParams: Promise<{ c?: string }>;
}) {
    const { c } = await searchParams;
    const country = (c || '').toUpperCase().slice(0, 2);

    return (
        <main
            style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                background: '#05060a',
                color: '#e6e8ee',
                fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
            }}
        >
            <div style={{ maxWidth: '38rem', lineHeight: 1.65 }}>
                <p
                    style={{
                        fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                        fontSize: '0.75rem',
                        letterSpacing: '0.18em',
                        color: '#f5a524',
                        marginBottom: '1.25rem',
                    }}
                >
                    HTTP 451 · UNAVAILABLE FOR LEGAL REASONS
                </p>

                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1.25rem' }}>
                    Nirium is not available in your jurisdiction
                </h1>

                <p style={{ color: '#a6adbb', marginBottom: '1rem' }}>
                    Access from {country ? <strong>{country}</strong> : 'your location'} is restricted
                    under our Restricted Jurisdictions &amp; Sanctions Policy. Nirium is a software
                    provider established in Mexico and does not offer its services into
                    comprehensively sanctioned jurisdictions, jurisdictions subject to a Financial
                    Action Task Force call for action, or mainland China.
                </p>

                <p style={{ color: '#a6adbb', marginBottom: '1rem' }}>
                    This is a restriction on who we serve, not a judgement about you, and it is not a
                    statement that you have done anything wrong. If you believe it applies to you in
                    error — geolocation is imperfect — write to us and we will look at it.
                </p>

                <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '2rem' }}>
                    Nirium never holds user funds. If you already hold a Stellar account, a DeFindex
                    vault or any asset, it is entirely outside our control and remains fully usable
                    without us. Nothing here strands anything of yours.
                </p>

                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.875rem' }}>
                    <a href="/legal/restricted-jurisdictions-v1.md" style={{ color: '#2dd4bf' }}>
                        Read the full policy →
                    </a>
                    <a href="mailto:niriumprotocol@gmail.com" style={{ color: '#2dd4bf' }}>
                        niriumprotocol@gmail.com
                    </a>
                </div>
            </div>
        </main>
    );
}
