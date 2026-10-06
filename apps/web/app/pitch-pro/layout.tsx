import type { Metadata } from 'next';

// Mismo motivo que app/pitch/layout.tsx: snapshot fechado, no indexar.
export const metadata: Metadata = {
    robots: { index: false, follow: false },
};

export default function PitchProLayout({ children }: { children: React.ReactNode }) {
    return children;
}
