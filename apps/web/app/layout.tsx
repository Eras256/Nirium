import type { Metadata } from "next";
import { Inter, Inconsolata } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { Providers } from "./providers";
import Footer from "@/components/layout/Footer";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const inconsolata = Inconsolata({ subsets: ["latin"], variable: "--font-inconsolata" });

export const metadata: Metadata = {
    metadataBase: new URL('https://nirium.xyz'),
    title: {
        default: "Nirium Protocol | Autonomous Treasury Infrastructure on Stellar (Testnet)",
        template: "%s | Nirium Protocol"
    },
    description: "Institutional DeFi infrastructure powered by autonomous agents on Stellar/Soroban. x402 micropayments, MPP session budgets, cross-border FX (MXN-USDC), multi-asset vaults. SDK v0.5.0. Testnet — not financial advice.",
    keywords: ["Stellar ecosystem", "AI Agents", "DeFi infrastructure", "Soroban", "Smart Contracts", "Nirium", "Treasury Automation", "x402", "MPP", "Stellar Testnet", "cross-border FX", "MXN USDC"],
    authors: [{ name: "Nirium Core" }],
    creator: "Nirium",
    publisher: "Nirium Protocol",
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    icons: {
        icon: "/brand/logo.png",
        shortcut: "/brand/logo.png",
        apple: "/brand/logo.png",
    },
    openGraph: {
        title: "Nirium Protocol | Treasury Automation on Stellar Testnet",
        description: "Experimental infrastructure for automated treasury operations and cross-border FX on Stellar Testnet. Powered by autonomous AI agents and Soroban Smart Contracts. Not financial advice.",
        url: "https://nirium.xyz",
        siteName: "Nirium Protocol",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "Nirium Protocol Platform Capabilities Overview",
            }
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Nirium Protocol | Treasury Infrastructure on Stellar Testnet",
        description: "Experimental DeFi infrastructure on Stellar Testnet. Autonomous AI agents for treasury automation and cross-border FX. Not financial advice.",
        creator: "@NiriumXYZ",
        images: ["/og-image.png"],
    },
};

import MarketTicker from "@/components/dashboard/MarketTicker";
import TestnetBanner from "@/components/layout/TestnetBanner";
import ChatBot from "@/components/ui/ChatBot";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Nirium Protocol",
        "applicationCategory": "FinanceApplication",
        "operatingSystem": "Web",
        "url": "https://nirium.xyz",
        "description": "Nirium is an experimental autonomous infrastructure protocol on the Stellar Testnet. It provides agentic workflows via Soroban smart contracts. Currently in development — not financial advice.",
        "creator": {
            "@type": "Organization",
            "name": "Nirium Core"
        },
        "potentialAction": {
            "@type": "InteractAction",
            "target": {
                "@type": "EntryPoint",
                "urlTemplate": "https://nirium.xyz/dashboard",
                "actionPlatform": [
                    "http://schema.org/DesktopWebPlatform",
                    "http://schema.org/MobileWebPlatform"
                ]
            },
            "name": "Explore Nirium Dashboard on Stellar Testnet"
        }
    };

    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${inter.variable} ${inconsolata.variable} font-sans bg-[#050505] text-white min-h-screen selection:bg-stellar-teal/30 scroll-smooth overflow-x-hidden`}>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
                <Providers>
                    <TestnetBanner />
                    <MarketTicker />
                    {/* Background Layers */}
                    <div className="fixed inset-0 z-[-1] bg-[url('/noise.svg')] opacity-[0.03] pointer-events-none"></div>
                    <div className="fixed inset-0 z-[-2] bg-gradient-to-br from-[#050505] via-[#0A0A0A] to-[#050505] pointer-events-none"></div>
                    <div className="fixed inset-0 z-[-3] bg-[radial-gradient(circle_at_50%_50%,rgba(138,43,226,0.05),transparent_50%)] pointer-events-none"></div>

                    {children}
                    <Footer />
                    <ChatBot />
                    <Toaster position="bottom-right" theme="dark" />
                </Providers>
                <Analytics />
            </body>
        </html>
    );
}
