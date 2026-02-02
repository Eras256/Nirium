import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "Nirium | Sovereign Decentralized Infrastructure",
  description:
    "Experience the convergence of Neural UI and zero-knowledge cryptography on Stellar Protocol 25. Institutional-grade privacy with mathematical certainty.",
  keywords: [
    "Stellar",
    "ZK-SNARKs",
    "Soroban",
    "DeFi",
    "Privacy",
    "x402",
    "Protocol 25",
  ],
  authors: [{ name: "Nirium Team" }],
  openGraph: {
    title: "Nirium",
    description: "Sovereign Decentralized Infrastructure with ZK Privacy",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased bg-[#0b0c15] text-white min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
