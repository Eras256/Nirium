'use client';

// Hides the sitewide chrome (testnet banner, live market ticker, chatbot
// launcher) on standalone pages that are meant to render clean — e.g.
// /pitch, a readiness dossier meant for external reviewers, not the app
// shell. Add a path here only for pages that are deliberately standalone;
// everything else keeps the normal chrome.
import { usePathname } from "next/navigation";

const CHROME_FREE_PATHS = ["/pitch", "/pitch-pro", "/branding-nirium"];

export default function ChromeGate({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    if (CHROME_FREE_PATHS.includes(pathname)) return null;
    return <>{children}</>;
}
