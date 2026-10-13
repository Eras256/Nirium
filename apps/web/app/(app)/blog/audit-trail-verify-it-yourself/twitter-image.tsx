import { renderOgImage, OG_SIZE } from "./og-content";

export const runtime = "edge";
export const alt = "Anchor a receipt signed with your own Stellar key";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function TwitterImage() {
    return renderOgImage();
}
