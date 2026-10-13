import type { Metadata } from 'next';

// page.tsx is 'use client', so metadata has to come from this layout, not
// from there (same reason as app/pitch/layout.tsx). Without this the post
// inherited the root layout's title/og:title: "Nirium | Live on Stellar
// Mainnet" on every share.
const TITLE = "Mainnet x402 Was Down for 32 Days: Don't Trust Us, Verify the Fix";
const DESCRIPTION =
    "Every paid mainnet request against Nirium's x402 endpoints failed for 32 days - not from our code, but from a stale RPC URL inside a facilitator we don't operate. Here's the root cause, the two independent real payments that prove it's fixed, and the permanent logging hook we shipped so the next one doesn't take a month to notice.";

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

export default function X402OutageVerifyItYourselfLayout({ children }: { children: React.ReactNode }) {
    return children;
}
