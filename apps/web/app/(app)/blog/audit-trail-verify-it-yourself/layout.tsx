import type { Metadata } from 'next';

// page.tsx is 'use client', so metadata has to come from this layout, not
// from there (same reason as app/pitch/layout.tsx). Without this the post
// inherited the root layout's title/og:title: "Nirium | Live on Stellar
// Mainnet" on every share, including the card Twitter/X shows.
const TITLE = 'Anchor a receipt signed with your own Stellar key';
const DESCRIPTION =
    'Hash it, sign it with a Stellar key, POST it, and get a CID that anyone can check. Free during the beta.';

export const metadata: Metadata = {
    title: TITLE,
    description: DESCRIPTION,
    openGraph: {
        title: TITLE,
        description: DESCRIPTION,
    },
    twitter: {
        title: TITLE,
        description: DESCRIPTION,
    },
};

export default function AuditTrailVerifyItYourselfLayout({ children }: { children: React.ReactNode }) {
    return children;
}
