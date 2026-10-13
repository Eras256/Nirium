import type { Metadata } from 'next';

// page.tsx is 'use client', so metadata has to come from this layout, not
// from there (same reason as app/pitch/layout.tsx). Without this the post
// inherited the root layout's title/og:title: "Nirium | Live on Stellar
// Mainnet" on every share.
const TITLE = 'The Treasury Node on Mainnet: Don\'t Trust Us, Verify the Contract';
const DESCRIPTION =
    "Nirium's agent holds the RebalanceManager role on a real DeFindex vault on Stellar mainnet, and the vault's own contract code makes withdrawal structurally impossible for that role, not just against our policy. Here is the transaction, the exact line of source code that proves it, and what it means for everyone involved.";

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

export default function TreasuryNodeVerifyItYourselfLayout({ children }: { children: React.ReactNode }) {
    return children;
}
