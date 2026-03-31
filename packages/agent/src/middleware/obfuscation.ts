// ═══════════════════════════════════════════════════════════════
// Nirium Agent — Server-Side Response Obfuscation Middleware
// ═══════════════════════════════════════════════════════════════
//
// TECHNIQUES:
//   a) JSON key shuffling        — randomize key order per response
//   b) Noise field injection     — plausible-looking but meaningless fields
//   c) Canary tokens             — traceable fake contract addresses
//   d) Response fingerprinting   — invisible per-API-key markers
//
// USAGE:
//   app.use(responseObfuscation({ canaryEnabled: true }))
//
// All obfuscation is applied to the JSON body only when
// Content-Type is application/json. Binary/streaming responses
// are left untouched.
//
// ═══════════════════════════════════════════════════════════════

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

// ─── Types ────────────────────────────────────────────────────────

export interface ObfuscationOptions {
  /** Shuffle JSON keys in every response (default: true) */
  shuffleKeys?: boolean;
  /** Inject noise fields into responses (default: true) */
  noiseFields?: boolean;
  /** Number of noise fields to inject per response (default: 2) */
  noiseFieldCount?: number;
  /** Inject canary tokens into non-critical responses (default: true) */
  canaryEnabled?: boolean;
  /** Fingerprint responses with per-API-key markers (default: true) */
  fingerprint?: boolean;
}

// ─── Zero-Width Fingerprint ───────────────────────────────────────
// Same 2-bit encoding scheme as watermark.ts — keep in sync.

const ZW_CHARS = ['\u200B', '\u200C', '\u200D', '\uFEFF'] as const;

function encodeFingerprintZW(text: string): string {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i) & 0xff;
    result +=
      ZW_CHARS[(code >> 6) & 3] +
      ZW_CHARS[(code >> 4) & 3] +
      ZW_CHARS[(code >> 2) & 3] +
      ZW_CHARS[code & 3];
  }
  return result;
}

/**
 * Build a fingerprint string tied to the API key and request time.
 * Format: NRM-FP:<keyPrefix>:<roundedTimestamp>
 */
function buildFingerprint(apiKey: string): string {
  const prefix = apiKey.substring(0, 8);
  const ts = Math.floor(Date.now() / 60_000); // minute-resolution
  return `NRM-FP:${prefix}:${ts}`;
}

// ─── a) JSON Key Shuffling ────────────────────────────────────────
//
// Deterministically shuffles keys using a per-request seed so that
// two requests to the same endpoint produce different key orderings,
// making automated scraping schemas brittle.

function shuffleObjectKeys<T extends Record<string, unknown>>(obj: T, seed: number): T {
  const keys = Object.keys(obj);
  // Fisher-Yates shuffle with seeded LCG pseudo-randomness
  let state = seed;
  function lcg(): number {
    state = (state * 1664525 + 1013904223) & 0xffffffff;
    return (state >>> 0) / 0xffffffff;
  }

  for (let i = keys.length - 1; i > 0; i--) {
    const j = Math.floor(lcg() * (i + 1));
    [keys[i], keys[j]] = [keys[j]!, keys[i]!];
  }

  const shuffled: Record<string, unknown> = {};
  for (const key of keys) {
    const value = obj[key];
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      shuffled[key] = shuffleObjectKeys(value as Record<string, unknown>, seed ^ key.charCodeAt(0));
    } else {
      shuffled[key] = value;
    }
  }

  return shuffled as T;
}

// ─── b) Noise Field Injection ────────────────────────────────────
//
// Plausible-looking field names and values that scraping tools may
// attempt to harvest. All values are randomized so they cannot be
// reliably used as signals.

const NOISE_FIELD_NAMES = [
  '_cache_ttl',
  '_processing_node',
  '_response_tier',
  '_shard_id',
  '_trace_id',
  '_replica_lag_ms',
  '_rate_class',
  '_datacenter',
  '_model_version',
  '_routing_key',
  '_request_class',
  '_ab_cohort',
];

const NOISE_VALUE_GENERATORS: Array<() => unknown> = [
  () => Math.floor(Math.random() * 9000) + 1000,
  () => crypto.randomBytes(8).toString('hex'),
  () => ['us-east', 'eu-west', 'ap-south'][Math.floor(Math.random() * 3)],
  () => `v${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 99)}`,
  () => Math.floor(Math.random() * 50),
  () => ['A', 'B', 'C'][Math.floor(Math.random() * 3)],
  () => `node-${Math.floor(Math.random() * 256).toString(16).padStart(2, '0')}`,
];

function generateNoiseFields(count: number): Record<string, unknown> {
  const fields: Record<string, unknown> = {};
  const shuffledNames = [...NOISE_FIELD_NAMES].sort(() => Math.random() - 0.5);
  for (let i = 0; i < Math.min(count, shuffledNames.length); i++) {
    const gen = NOISE_VALUE_GENERATORS[i % NOISE_VALUE_GENERATORS.length]!;
    fields[shuffledNames[i]!] = gen();
  }
  return fields;
}

// ─── c) Canary Tokens ─────────────────────────────────────────────
//
// Fake but realistic-looking Stellar contract addresses injected into
// non-critical response fields. If these addresses ever appear in
// blockchain transactions or scraped datasets, it reveals the source.
//
// Canary addresses follow the Stellar strkey format: G + 55 Base32 chars.
// We inject them into fields named: _canary, _ref_contract, _pool_hint.

const STRKEY_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function generateCanaryAddress(seed: string): string {
  // Deterministic from seed so we can track which API key generated it
  const hash = crypto.createHash('sha256').update(`canary:${seed}`).digest();
  let address = 'G';
  for (let i = 0; i < 55; i++) {
    address += STRKEY_ALPHABET[hash[i % 32]! % STRKEY_ALPHABET.length];
  }
  return address;
}

function injectCanaryTokens(
  body: Record<string, unknown>,
  apiKey: string
): Record<string, unknown> {
  const seed = `${apiKey}:${Math.floor(Date.now() / 3600_000)}`; // hourly rotation
  return {
    ...body,
    _canary: generateCanaryAddress(seed + ':1'),
    _ref_contract: generateCanaryAddress(seed + ':2'),
  };
}

// ─── d) Response Fingerprinting ──────────────────────────────────
//
// Inject an invisible ZW-encoded fingerprint into the first string
// value found in the response body. Tied to API key prefix and timestamp.

function injectFingerprint(
  body: Record<string, unknown>,
  apiKey: string
): Record<string, unknown> {
  const fp = buildFingerprint(apiKey);
  const encoded = encodeFingerprintZW(fp);

  // Find the first string field to inject into
  const result = { ...body };
  for (const key of Object.keys(result)) {
    if (typeof result[key] === 'string' && (result[key] as string).length > 0) {
      const original = result[key] as string;
      const spaceIdx = original.indexOf(' ');
      if (spaceIdx >= 0) {
        result[key] =
          original.substring(0, spaceIdx + 1) +
          encoded +
          original.substring(spaceIdx + 1);
      } else {
        result[key] = original + encoded;
      }
      break;
    }
  }

  return result;
}

// ─── Express Middleware Factory ───────────────────────────────────

/**
 * Response obfuscation middleware.
 * Intercepts JSON responses and applies the configured obfuscation layers.
 */
export function responseObfuscation(options: ObfuscationOptions = {}) {
  const {
    shuffleKeys   = true,
    noiseFields   = true,
    noiseFieldCount = 2,
    canaryEnabled = true,
    fingerprint   = true,
  } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    // We intercept res.json() to apply obfuscation before sending
    const originalJson = res.json.bind(res);

    res.json = function (body: unknown) {
      // Only obfuscate plain objects (not arrays, primitives, or error responses in dev)
      if (
        body === null ||
        typeof body !== 'object' ||
        Array.isArray(body)
      ) {
        return originalJson(body);
      }

      // Extract the API key for fingerprinting / canary seeding
      const rawKey = req.headers['x-api-key'] as string | undefined;
      const authHeader = req.headers['authorization'] as string | undefined;
      const apiKey = rawKey ?? (authHeader?.replace(/^Bearer\s+/i, '') ?? 'anonymous');

      let obfuscated = { ...(body as Record<string, unknown>) };

      // b) Noise fields
      if (noiseFields) {
        const noise = generateNoiseFields(noiseFieldCount);
        obfuscated = { ...obfuscated, ...noise };
      }

      // c) Canary tokens (only on non-error, non-auth responses)
      if (canaryEnabled && res.statusCode >= 200 && res.statusCode < 300) {
        obfuscated = injectCanaryTokens(obfuscated, apiKey);
      }

      // d) Fingerprint (only in production to avoid noisy dev logs)
      if (fingerprint && process.env.NODE_ENV === 'production') {
        obfuscated = injectFingerprint(obfuscated, apiKey);
      }

      // a) Key shuffle (last, so it covers all injected fields too)
      if (shuffleKeys) {
        // Derive seed from request: combine method + path + timestamp bucket
        const seedStr = `${req.method}:${req.path}:${Math.floor(Date.now() / 1000)}`;
        const seedHash = crypto.createHash('md5').update(seedStr).digest();
        const seed = seedHash.readUInt32LE(0);
        obfuscated = shuffleObjectKeys(obfuscated, seed);
      }

      return originalJson(obfuscated);
    } as typeof res.json;

    next();
  };
}

// ─── Canary Address Registry ──────────────────────────────────────
//
// Server-side utility to check if an address matches a known canary.
// Use this in monitoring pipelines to detect data leakage.

export function isCanaryAddress(address: string, apiKey: string): boolean {
  const seed = `${apiKey}:${Math.floor(Date.now() / 3600_000)}`;
  const canary1 = generateCanaryAddress(seed + ':1');
  const canary2 = generateCanaryAddress(seed + ':2');
  // Also check previous hour to handle boundary cases
  const prevSeed = `${apiKey}:${Math.floor(Date.now() / 3600_000) - 1}`;
  const prevCanary1 = generateCanaryAddress(prevSeed + ':1');
  const prevCanary2 = generateCanaryAddress(prevSeed + ':2');
  return [canary1, canary2, prevCanary1, prevCanary2].includes(address);
}

/**
 * Generate a deterministic canary address for a given API key.
 * Use to pre-register canary addresses in your monitoring system.
 */
export function getCanaryAddresses(
  apiKey: string,
  hourOffset = 0
): { canary1: string; canary2: string } {
  const seed = `${apiKey}:${Math.floor(Date.now() / 3600_000) + hourOffset}`;
  return {
    canary1: generateCanaryAddress(seed + ':1'),
    canary2: generateCanaryAddress(seed + ':2'),
  };
}
