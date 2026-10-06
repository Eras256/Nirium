import type { Metadata } from 'next';

// /pitch es un dossier fechado - snapshot, no la fuente viva de versiones.
// Sin esto se indexaría igual que /build y competiría con él en resultados
// de búsqueda con números ya viejos. page.tsx es 'use client', así que el
// metadata tiene que venir de este layout, no de ahí.
export const metadata: Metadata = {
    robots: { index: false, follow: false },
};

export default function PitchLayout({ children }: { children: React.ReactNode }) {
    return children;
}
