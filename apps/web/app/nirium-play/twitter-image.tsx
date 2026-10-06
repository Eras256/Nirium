import { renderOgImage, OG_SIZE } from "./og-content";

export const runtime = "edge";
export const alt = "Nirium Play — pay-per-action inside a real Unity game, x402 on Stellar";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function TwitterImage() {
    return renderOgImage();
}
