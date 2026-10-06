import { renderOgImage, OG_SIZE } from "./og-content";

export const runtime = "edge";
export const alt = "Mainnet x402 was down for 32 days — don't trust us, verify the fix";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function TwitterImage() {
    return renderOgImage();
}
