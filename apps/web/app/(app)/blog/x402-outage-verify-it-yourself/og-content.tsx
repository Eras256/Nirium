import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };

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
                    backgroundColor: "#000000",
                    backgroundImage:
                        "radial-gradient(circle at 85% 12%, rgba(45,235,232,0.20), transparent 45%), radial-gradient(circle at 8% 92%, rgba(255,200,0,0.10), transparent 40%)",
                    padding: "64px 72px",
                    fontFamily: "sans-serif",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div
                            style={{
                                width: 16,
                                height: 16,
                                borderRadius: 999,
                                backgroundColor: "#2DEBE8",
                            }}
                        />
                        <div
                            style={{
                                fontSize: 30,
                                fontWeight: 800,
                                color: "#ffffff",
                                letterSpacing: "-0.5px",
                            }}
                        >
                            NIRIUM
                        </div>
                    </div>
                    <div
                        style={{
                            display: "flex",
                            padding: "9px 20px",
                            borderRadius: 999,
                            border: "1px solid rgba(45,235,232,0.4)",
                            color: "#2DEBE8",
                            fontSize: 20,
                            fontWeight: 600,
                            letterSpacing: "3px",
                            textTransform: "uppercase",
                        }}
                    >
                        Settlement
                    </div>
                </div>

                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 22,
                        maxWidth: 1000,
                    }}
                >
                    <div
                        style={{
                            fontSize: 62,
                            fontWeight: 900,
                            color: "#ffffff",
                            lineHeight: 1.08,
                            letterSpacing: "-2px",
                        }}
                    >
                        Mainnet x402 was down for 32 days.
                    </div>
                    <div
                        style={{
                            fontSize: 34,
                            fontWeight: 500,
                            color: "#2DEBE8",
                        }}
                    >
                        Don&apos;t trust us — verify the fix.
                    </div>
                </div>

                <div
                    style={{
                        display: "flex",
                        gap: 32,
                        fontSize: 22,
                        color: "rgba(255,255,255,0.55)",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div
                            style={{
                                width: 9,
                                height: 9,
                                borderRadius: 999,
                                backgroundColor: "#2DEBE8",
                            }}
                        />
                        <div style={{ display: "flex" }}>Sep 11, 2026</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div
                            style={{
                                width: 9,
                                height: 9,
                                borderRadius: 999,
                                backgroundColor: "#2DEBE8",
                            }}
                        />
                        <div style={{ display: "flex" }}>Stellar mainnet</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div
                            style={{
                                width: 9,
                                height: 9,
                                borderRadius: 999,
                                backgroundColor: "#FFC800",
                            }}
                        />
                        <div style={{ display: "flex" }}>32 days down</div>
                    </div>
                </div>
            </div>
        ),
        { ...OG_SIZE }
    );
}
