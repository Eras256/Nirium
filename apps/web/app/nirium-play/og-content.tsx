import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };

const GOLD_1 = "#F5D57A";
const GOLD_2 = "#D4AF37";
const GOLD_3 = "#8B6F2E";
const INK = "#0A0A0C";

function GamepadMark({ size }: { size: number }) {
    // Same shape/paths as app/branding-nirium-play — the controller
    // silhouette with the official Nirium N as the D-pad and a Stellar
    // 4-point star as one face button.
    return (
        <svg width={size} height={size} viewBox="0 0 100 100">
            <defs>
                <linearGradient id="ogGold" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                    <stop offset="0" stopColor={GOLD_1} />
                    <stop offset="0.5" stopColor={GOLD_2} />
                    <stop offset="1" stopColor={GOLD_3} />
                </linearGradient>
            </defs>
            <rect x="18" y="24" width="16" height="10" rx="4" fill="none" stroke="url(#ogGold)" strokeWidth="5" />
            <rect x="66" y="24" width="16" height="10" rx="4" fill="none" stroke="url(#ogGold)" strokeWidth="5" />
            <path
                d="M22,32 H78 a12,12 0 0 1 12,12 v10 a16,16 0 0 1 -16,16 a10,10 0 0 1 -9,-5.5 L58,58 H42 l-7,6.5 a10,10 0 0 1 -9,5.5 a16,16 0 0 1 -16,-16 v-10 a12,12 0 0 1 12,-12 Z"
                fill="none"
                stroke="url(#ogGold)"
                strokeWidth="5.5"
                strokeLinejoin="round"
            />
            <path
                d="M25,52 L25,38 L37,52 L37,38"
                fill="none"
                stroke="url(#ogGold)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <circle cx="66" cy="41" r="3.4" fill="url(#ogGold)" />
            <circle cx="66" cy="53" r="3.4" fill="url(#ogGold)" />
            <path d="M78,39 L80.1,44.9 L86,47 L80.1,49.1 L78,55 L75.9,49.1 L70,47 L75.9,44.9 Z" fill="url(#ogGold)" />
        </svg>
    );
}

export function renderOgImage() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    backgroundColor: INK,
                    backgroundImage:
                        `radial-gradient(circle at 88% 15%, rgba(212,175,55,0.22), transparent 45%), radial-gradient(circle at 6% 90%, rgba(212,175,55,0.10), transparent 40%)`,
                    padding: "64px 72px",
                    fontFamily: "sans-serif",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <GamepadMark size={56} />
                        <div style={{ fontSize: 30, fontWeight: 800, color: "#F5F3EF", letterSpacing: "-0.5px" }}>
                            NIRIUM PLAY
                        </div>
                    </div>
                    <div
                        style={{
                            display: "flex",
                            padding: "9px 20px",
                            borderRadius: 999,
                            border: `1px solid ${GOLD_2}66`,
                            color: GOLD_1,
                            fontSize: 20,
                            fontWeight: 600,
                            letterSpacing: "3px",
                            textTransform: "uppercase",
                        }}
                    >
                        HackMeridian
                    </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 22, maxWidth: 1020 }}>
                    <div style={{ fontSize: 58, fontWeight: 900, color: "#F5F3EF", lineHeight: 1.08, letterSpacing: "-2px" }}>
                        Pay-per-action, inside the game.
                    </div>
                    <div style={{ fontSize: 30, fontWeight: 500, color: GOLD_1 }}>
                        x402 on Stellar, running for real inside Unity.
                    </div>
                </div>

                <div style={{ display: "flex", gap: 32, fontSize: 22, color: "rgba(245,243,239,0.55)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 9, height: 9, borderRadius: 999, backgroundColor: "#34D399" }} />
                        <div style={{ display: "flex" }}>Settled on Stellar testnet</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 9, height: 9, borderRadius: 999, backgroundColor: GOLD_2 }} />
                        <div style={{ display: "flex" }}>Unity 6 + Soroban</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 9, height: 9, borderRadius: 999, backgroundColor: GOLD_2 }} />
                        <div style={{ display: "flex" }}>nirium.xyz</div>
                    </div>
                </div>
            </div>
        ),
        { ...OG_SIZE }
    );
}
