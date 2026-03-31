'use client';
// ═══════════════════════════════════════════════════════════════
// Nirium — Invisible Unicode Watermarking (Zero-Width Steganography)
// ═══════════════════════════════════════════════════════════════
//
// TECHNIQUE: Zero-width character steganography
//   Uses four invisible Unicode characters to encode binary data:
//     U+200B  ZERO WIDTH SPACE         → bit pair "00"
//     U+200C  ZERO WIDTH NON-JOINER    → bit pair "01"
//     U+200D  ZERO WIDTH JOINER        → bit pair "10"
//     U+FEFF  ZERO WIDTH NO-BREAK SPACE → bit pair "11"
//
//   Each byte of the message requires 4 ZW characters (8 bits ÷ 2 per char).
//   The watermark is injected into a "carrier" string (e.g. an API response
//   field) after a designated injection point, invisible to casual readers.
//
// API KEY TIERS:
//   sk_inst_ → institutional tier
//   sk_sbox_ → sandbox tier
//   sk_ent_  → enterprise tier
//   sk_free_ → free tier
//
// ═══════════════════════════════════════════════════════════════

// ─── Zero-Width Character Alphabet ───────────────────────────────

const ZW_00 = '\u200B'; // ZERO WIDTH SPACE
const ZW_01 = '\u200C'; // ZERO WIDTH NON-JOINER
const ZW_10 = '\u200D'; // ZERO WIDTH JOINER
const ZW_11 = '\uFEFF'; // ZERO WIDTH NO-BREAK SPACE (BOM)

const BITS_TO_ZW: Record<string, string> = {
  '00': ZW_00,
  '01': ZW_01,
  '10': ZW_10,
  '11': ZW_11,
};

const ZW_TO_BITS: Record<string, string> = {
  [ZW_00]: '00',
  [ZW_01]: '01',
  [ZW_10]: '10',
  [ZW_11]: '11',
};

const ZW_CHARS = new Set([ZW_00, ZW_01, ZW_10, ZW_11]);

// ─── Tier Codes ───────────────────────────────────────────────────

type ApiTier = 'institutional' | 'sandbox' | 'enterprise' | 'free' | 'unknown';

const API_KEY_TIER_MAP: Record<string, ApiTier> = {
  'sk_inst_': 'institutional',
  'sk_sbox_': 'sandbox',
  'sk_ent_':  'enterprise',
  'sk_free_': 'free',
};

const TIER_CODE_MAP: Record<ApiTier, string> = {
  institutional: 'I',
  sandbox:       'S',
  enterprise:    'E',
  free:          'F',
  unknown:       'U',
};

// ─── Core Encoding / Decoding ─────────────────────────────────────

/**
 * Encode a string to its zero-width character representation.
 * Each character's UTF-8 byte is encoded as 4 ZW characters (2 bits each).
 */
function encodeToZeroWidth(message: string): string {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(message);
  let result = '';
  for (const byte of bytes) {
    // Split byte into 4 groups of 2 bits, MSB first
    const b3 = (byte >> 6) & 0x03;
    const b2 = (byte >> 4) & 0x03;
    const b1 = (byte >> 2) & 0x03;
    const b0 = byte & 0x03;
    result +=
      BITS_TO_ZW[b3.toString(2).padStart(2, '0')] +
      BITS_TO_ZW[b2.toString(2).padStart(2, '0')] +
      BITS_TO_ZW[b1.toString(2).padStart(2, '0')] +
      BITS_TO_ZW[b0.toString(2).padStart(2, '0')];
  }
  return result;
}

/**
 * Decode zero-width characters back to the original string.
 * Returns null if the ZW sequence is invalid or not a multiple of 4 chars.
 */
function decodeFromZeroWidth(encoded: string): string | null {
  // Extract only ZW chars
  const zwChars = Array.from(encoded).filter(c => ZW_CHARS.has(c));
  if (zwChars.length === 0) return null;
  if (zwChars.length % 4 !== 0) return null; // incomplete encoding

  const bytes: number[] = [];
  for (let i = 0; i < zwChars.length; i += 4) {
    const b3 = ZW_TO_BITS[zwChars[i]!];
    const b2 = ZW_TO_BITS[zwChars[i + 1]!];
    const b1 = ZW_TO_BITS[zwChars[i + 2]!];
    const b0 = ZW_TO_BITS[zwChars[i + 3]!];
    if (!b3 || !b2 || !b1 || !b0) return null;
    const byte = (parseInt(b3, 2) << 6) | (parseInt(b2, 2) << 4) | (parseInt(b1, 2) << 2) | parseInt(b0, 2);
    bytes.push(byte);
  }

  try {
    const decoder = new TextDecoder('utf-8', { fatal: true });
    return decoder.decode(new Uint8Array(bytes));
  } catch {
    return null;
  }
}

// ─── Watermark Payload ───────────────────────────────────────────

export interface WatermarkPayload {
  /** Protocol identifier */
  p: 'NRM';
  /** Tier code: I/S/E/F/U */
  t: string;
  /** API key prefix (first 8 chars only, not the secret part) */
  k: string;
  /** Unix timestamp (seconds) truncated to reduce payload size */
  ts: number;
}

/**
 * Build the watermark string for a given API key and timestamp.
 * Format: NRM|<tier>|<key_prefix>|<ts>
 */
function buildWatermarkPayload(apiKey: string, nowSeconds?: number): string {
  const tier = detectTier(apiKey);
  const tierCode = TIER_CODE_MAP[tier];
  // Only embed the key prefix (sk_xxxx_ portion), never the secret part
  const keyPrefix = apiKey.substring(0, Math.min(8, apiKey.length));
  const ts = nowSeconds ?? Math.floor(Date.now() / 1000);
  return `NRM|${tierCode}|${keyPrefix}|${ts}`;
}

/**
 * Detect API tier from key prefix.
 */
function detectTier(apiKey: string): ApiTier {
  for (const [prefix, tier] of Object.entries(API_KEY_TIER_MAP)) {
    if (apiKey.startsWith(prefix)) return tier;
  }
  return 'unknown';
}

// ─── Public API ───────────────────────────────────────────────────

/**
 * Embed an invisible watermark into a carrier string.
 * The ZW characters are injected after the first word boundary to
 * minimize disruption to text rendering engines.
 *
 * @param carrier   The visible string to watermark (e.g. API response field)
 * @param apiKey    The API key used to make the request
 * @param timestamp Optional override for the timestamp (Unix seconds)
 * @returns         The carrier string with invisible watermark embedded
 */
export function embedWatermark(
  carrier: string,
  apiKey: string,
  timestamp?: number
): string {
  const payload = buildWatermarkPayload(apiKey, timestamp);
  const zwEncoded = encodeToZeroWidth(payload);

  // Inject after the first word boundary (space or end-of-string)
  const spaceIndex = carrier.indexOf(' ');
  if (spaceIndex === -1) {
    // No space — inject at end
    return carrier + zwEncoded;
  }
  return (
    carrier.substring(0, spaceIndex + 1) +
    zwEncoded +
    carrier.substring(spaceIndex + 1)
  );
}

/**
 * Extract and decode the watermark from a watermarked string.
 * Returns the decoded payload or null if no valid watermark is found.
 */
export function extractWatermark(watermarked: string): WatermarkPayload | null {
  const decoded = decodeFromZeroWidth(watermarked);
  if (!decoded) return null;

  const parts = decoded.split('|');
  if (parts.length !== 4) return null;
  const [p, t, k, tsStr] = parts;
  if (p !== 'NRM') return null;

  const ts = parseInt(tsStr!, 10);
  if (isNaN(ts)) return null;

  return {
    p: 'NRM',
    t: t!,
    k: k!,
    ts,
  };
}

/**
 * Verify that a string contains a valid Nirium watermark.
 * Optionally checks that the watermark is not older than maxAgeSeconds.
 */
export function verifyWatermark(
  text: string,
  options?: {
    expectedTier?: ApiTier;
    expectedKeyPrefix?: string;
    maxAgeSeconds?: number;
  }
): { valid: boolean; payload: WatermarkPayload | null; reason?: string } {
  const payload = extractWatermark(text);

  if (!payload) {
    return { valid: false, payload: null, reason: 'no_watermark_found' };
  }

  if (options?.expectedTier) {
    const expected = TIER_CODE_MAP[options.expectedTier];
    if (payload.t !== expected) {
      return {
        valid: false,
        payload,
        reason: `tier_mismatch: expected=${expected} got=${payload.t}`,
      };
    }
  }

  if (options?.expectedKeyPrefix) {
    if (!payload.k.startsWith(options.expectedKeyPrefix.substring(0, 8))) {
      return {
        valid: false,
        payload,
        reason: 'key_prefix_mismatch',
      };
    }
  }

  if (options?.maxAgeSeconds !== undefined) {
    const ageSeconds = Math.floor(Date.now() / 1000) - payload.ts;
    if (ageSeconds > options.maxAgeSeconds) {
      return {
        valid: false,
        payload,
        reason: `watermark_expired: age=${ageSeconds}s max=${options.maxAgeSeconds}s`,
      };
    }
  }

  return { valid: true, payload };
}

/**
 * Strip all zero-width characters from a string (for display or logging).
 */
export function stripWatermark(text: string): string {
  return Array.from(text)
    .filter(c => !ZW_CHARS.has(c))
    .join('');
}

/**
 * Watermark an entire API response object by embedding watermarks
 * into designated string fields.
 *
 * @param response  The response object to watermark
 * @param apiKey    The API key that made the request
 * @param fields    List of top-level field names to watermark (default: ['message', 'result', 'data'])
 */
export function watermarkResponse<T extends Record<string, unknown>>(
  response: T,
  apiKey: string,
  fields: string[] = ['message', 'result', 'data'],
): T {
  const now = Math.floor(Date.now() / 1000);
  const watermarked = { ...response };

  for (const field of fields) {
    const value = watermarked[field];
    if (typeof value === 'string' && value.length > 0) {
      (watermarked as Record<string, unknown>)[field] = embedWatermark(value, apiKey, now);
    }
  }

  return watermarked;
}
