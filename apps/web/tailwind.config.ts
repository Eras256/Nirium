import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#050505",
                "stellar-teal": "#2DEBE8",
                "stellar-yellow": "#FFC800",
                "nirium-obsidian": "#020202",
                "stellar-blue": "#00aaff",
                "pulse-violet": "#7000ff",
            },
            fontFamily: {
                sans: ['var(--font-inter)'],
                mono: ['var(--font-inconsolata)'],
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
            },
            keyframes: {
                scanline: {
                    '0%': { transform: 'translateY(-100%)' },
                    '100%': { transform: 'translateY(100%)' },
                },
                glow: {
                    '0%, 100%': { opacity: '1', filter: 'brightness(1.2) blur(2px)' },
                    '50%': { opacity: '0.6', filter: 'brightness(0.8) blur(1px)' },
                },
                'pulse-fast': {
                    '0%, 100%': { transform: 'scale(1)', opacity: '1' },
                    '50%': { transform: 'scale(1.1)', opacity: '0.7' },
                }
            },
            animation: {
                scanline: 'scanline 4s linear infinite',
                glow: 'glow 2s ease-in-out infinite',
                'pulse-fast': 'pulse-fast 1s ease-in-out infinite',
            }
        },
    },
    plugins: [],
};
export default config;
