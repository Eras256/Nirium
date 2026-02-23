import type { Metadata } from "next";
import { Inter, Inconsolata } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { Providers } from "./providers";
import Footer from "@/components/layout/Footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const inconsolata = Inconsolata({ subsets: ["latin"], variable: "--font-inconsolata" });

export const metadata: Metadata = {
    title: "Nirium | Institutional Autonomous Intelligence Protocol",
    description: "The first Atomic Intelligence Protocol on Stellar. Orchestrate mission-critical DeFi operations with autonomous agents powered by Soroban Smart Contracts and Stellar's native atomic primitives.",
    openGraph: {
        images: [{ url: "/og-image.png" }],
    },
    twitter: {
        card: "summary_large_image",
        images: ["/og-image.png"],
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${inter.variable} ${inconsolata.variable} font-sans bg-[#050505] text-white min-h-screen selection:bg-stellar-teal/30 scroll-smooth overflow-x-hidden`}>
                <Providers>
                    {/* Background Layers */}
                    <div className="fixed inset-0 z-[-1] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none"></div>
                    <div className="fixed inset-0 z-[-2] bg-gradient-to-br from-[#050505] via-[#0A0A0A] to-[#050505] pointer-events-none"></div>
                    <div className="fixed inset-0 z-[-3] bg-[radial-gradient(circle_at_50%_50%,rgba(138,43,226,0.05),transparent_50%)] pointer-events-none"></div>

                    {children}
                    <Footer />
                    <Toaster position="bottom-right" theme="dark" />
                </Providers>
            </body>
        </html>
    );
}
