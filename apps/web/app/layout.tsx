import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { Providers } from "./providers";
import Footer from "@/components/layout/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Nirium | Institutional AI Intelligence Protocol",
    description: "The first Atomic Intelligence Protocol on Stellar. Orchestrate mission-critical DeFi operations with autonomous agents powered by ElizaOS and DeepBook V3 flash vectors.",
    openGraph: {
        images: [{ url: "/logo-seo.jpg" }],
    },
    twitter: {
        card: "summary_large_image",
        images: ["/logo-seo.jpg"],
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${inter.className} bg-[#030014] text-white min-h-screen selection:bg-neon-cyan/30`}>
                <Providers>
                    {/* Neural Grid Background Overlay */}
                    <div className="fixed inset-0 z-[-1] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                    <div className="fixed inset-0 z-[-2] bg-gradient-radial from-indigo-900/20 to-black"></div>
                    <div className="bg-noise" />

                    {children}
                    <Footer />
                    <Toaster position="bottom-right" theme="dark" />
                </Providers>
            </body>
        </html>
    );
}
