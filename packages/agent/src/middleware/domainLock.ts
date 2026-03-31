// ═══════════════════════════════════════════════════════════════
// Nirium Agent — Server-Side Domain Lock Middleware
// ═══════════════════════════════════════════════════════════════
//
// RESPONSIBILITIES:
//   a) Validate Origin/Referer headers against the approved allowlist
//   b) Detect origin spoofing (inconsistent headers)
//   c) Apply extra-aggressive rate limiting to unknown origins
//   d) Log all cross-origin attempts to telemetry + structured log
//
// The client-side domain lock (apps/web/lib/domainLock.ts) is a
// UX layer. This middleware is the authoritative enforcement point
// for server-to-server and API requests.
//
// ═══════════════════════════════════════════════════════════════

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

// ─── Types ────────────────────────────────────────────────────────

export interface DomainLockOptions {
  /** Origins allowed without penalty (default: nirium.xyz + localhost) */
  approvedOrigins?: string[];
  /** Block entirely unknown origins in production (default: false — just rate-limit) */
  blockUnknownOrigins?: boolean;
  /** Max requests/minute from unknown origins before hard-block (default: 5) */
  unknownOriginBurstLimit?: number;
  /** Custom logger — defaults to console.warn */
  logger?: (event: CrossOriginEvent) => void;
}

export interface CrossOriginEvent {
  type: 'unknown_origin' | 'spoofed_origin' | 'rate_limited' | 'blocked';
  origin: string | null;
  referer: string | null;
  ip: string;
  userAgent: string;
  path: string;
  method: string;
  timestamp: string;
  requestId: string;
}

// ─── Approved Origins ─────────────────────────────────────────────

const DEFAULT_APPROVED_ORIGINS = new Set([
  'https://nirium.xyz',
  'https://www.nirium.xyz',
  'https://app.nirium.xyz',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
]);

function isApprovedOrigin(origin: string, approved: Set<string>): boolean {
  if (approved.has(origin)) return true;
  // Allow any *.nirium.xyz over HTTPS
  try {
    const url = new URL(origin);
    if (url.protocol === 'https:' && (url.hostname === 'nirium.xyz' || url.hostname.endsWith('.nirium.xyz'))) {
      return true;
    }
  } catch {
    // Not a valid URL — not approved
  }
  return false;
}

// ─── Origin Spoofing Detection ────────────────────────────────────
//
// Spoofing indicators:
//   1. Origin and Referer headers both present but their hostnames differ
//   2. Origin claims a nirium.xyz host but User-Agent looks like a bot/scraper
//   3. Origin is set to "null" (sandboxed iframe / data: URI — suspicious for an API)

const SCRAPER_UA_PATTERNS = [
  /python-requests/i,
  /go-http-client/i,
  /java\//i,
  /curl\//i,
  /wget\//i,
  /scrapy/i,
  /httpie/i,
  /libwww-perl/i,
  /okhttp/i,
  /axios\//i,
  /node-fetch/i,
  /got\//i,
  /undici/i,
];

function isSuspiciousUserAgent(ua: string): boolean {
  return SCRAPER_UA_PATTERNS.some(re => re.test(ua));
}

function extractHostname(headerValue: string): string | null {
  try {
    return new URL(headerValue).hostname;
  } catch {
    return null;
  }
}

interface SpoofCheckResult {
  spoofed: boolean;
  reason?: string;
}

function detectOriginSpoofing(
  origin: string | undefined,
  referer: string | undefined,
  userAgent: string,
): SpoofCheckResult {
  // "null" origin is a red flag for API calls (data: URI, sandboxed frame, etc.)
  if (origin === 'null') {
    return { spoofed: true, reason: 'null_origin' };
  }

  if (origin && referer) {
    const originHost = extractHostname(origin);
    const refererHost = extractHostname(referer);
    if (originHost && refererHost && originHost !== refererHost) {
      return {
        spoofed: true,
        reason: `origin_referer_mismatch: origin=${originHost} referer=${refererHost}`,
      };
    }
  }

  // Suspicious: claims to be a nirium.xyz origin but UA is a scraper library
  if (origin && origin.includes('nirium.xyz') && isSuspiciousUserAgent(userAgent)) {
    return {
      spoofed: true,
      reason: `nirium_origin_with_scraper_ua: ua="${userAgent.substring(0, 80)}"`,
    };
  }

  return { spoofed: false };
}

// ─── Extra Rate Limiting for Unknown Origins ──────────────────────
//
// Simple in-memory per-IP sliding window, stricter than the main
// rate limiter in rateLimit.ts. Tracks only requests from unknown origins.

interface SlidingWindow {
  timestamps: number[];
}

const unknownOriginWindows = new Map<string, SlidingWindow>();

const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
const _cleanupInterval = setInterval(() => {
  const cutoff = Date.now() - 60_000;
  for (const [key, window] of unknownOriginWindows) {
    window.timestamps = window.timestamps.filter(t => t > cutoff);
    if (window.timestamps.length === 0) unknownOriginWindows.delete(key);
  }
}, CLEANUP_INTERVAL_MS);

if (typeof _cleanupInterval?.unref === 'function') {
  _cleanupInterval.unref();
}

function checkUnknownOriginRateLimit(ip: string, limit: number): boolean {
  const now = Date.now();
  const cutoff = now - 60_000;
  const key = `unknown_origin:${ip}`;

  let window = unknownOriginWindows.get(key);
  if (!window) {
    window = { timestamps: [] };
    unknownOriginWindows.set(key, window);
  }

  window.timestamps = window.timestamps.filter(t => t > cutoff);
  window.timestamps.push(now);

  return window.timestamps.length > limit;
}

// ─── Structured Logging ───────────────────────────────────────────

function defaultLogger(event: CrossOriginEvent): void {
  const entry = {
    level: 'WARN',
    event: 'CROSS_ORIGIN_ATTEMPT',
    ...event,
  };
  console.warn('[nirium:domain-lock]', JSON.stringify(entry));
}

function sendTelemetry(event: CrossOriginEvent): void {
  // Fire-and-forget to internal telemetry endpoint
  // In production this would go to a SIEM or log aggregator
  if (process.env.NODE_ENV !== 'production') return;
  try {
    // Dynamic import to avoid bundling issues in test environments
    import('../providers/database.js').then(({ supabase }) => {
      if (!supabase) return;
      supabase.from('security_events').insert([event]).then(() => {
        /* intentionally swallowed */
      });
    }).catch(() => { /* intentionally swallowed */ });
  } catch {
    // Intentionally swallowed
  }
}

// ─── Middleware Factory ───────────────────────────────────────────

/**
 * Server-side domain lock and origin validation middleware.
 *
 * Apply before route handlers. For maximum security, apply after
 * helmetConfig() and corsStrictPolicy() from security.ts.
 */
export function domainLockMiddleware(options: DomainLockOptions = {}) {
  const {
    approvedOrigins,
    blockUnknownOrigins = false,
    unknownOriginBurstLimit = 5,
    logger = defaultLogger,
  } = options;

  const approved = approvedOrigins
    ? new Set(approvedOrigins)
    : DEFAULT_APPROVED_ORIGINS;

  return (req: Request, res: Response, next: NextFunction): void => {
    const origin = req.headers['origin'] as string | undefined;
    const referer = req.headers['referer'] as string | undefined;
    const userAgent = (req.headers['user-agent'] as string | undefined) ?? '';
    const ip = req.ip ?? req.socket?.remoteAddress ?? 'unknown';
    const requestId = crypto.randomBytes(8).toString('hex');

    // Allow server-to-server requests (no Origin header)
    // but only if the UA doesn't look like a browser pretending not to have one
    if (!origin) {
      const browserUA = /Mozilla|Chrome|Safari|Firefox|Edge/i.test(userAgent);
      if (!browserUA) {
        // Genuine server-to-server — pass through
        return next();
      }
      // Browser with no Origin header — suspicious
      const event: CrossOriginEvent = {
        type: 'unknown_origin',
        origin: null,
        referer: referer ?? null,
        ip,
        userAgent,
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString(),
        requestId,
      };
      logger(event);
      sendTelemetry(event);

      if (blockUnknownOrigins && process.env.NODE_ENV === 'production') {
        res.status(403).json({
          error: 'Forbidden',
          code: 'DOMAIN_LOCK_NO_ORIGIN',
          message: 'Origin header required for browser requests',
        });
        return;
      }
      return next();
    }

    // Check for spoofing
    const spoofCheck = detectOriginSpoofing(origin, referer, userAgent);
    if (spoofCheck.spoofed) {
      const event: CrossOriginEvent = {
        type: 'spoofed_origin',
        origin,
        referer: referer ?? null,
        ip,
        userAgent,
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString(),
        requestId,
      };
      logger(event);
      sendTelemetry(event);

      res.status(403).json({
        error: 'Forbidden',
        code: 'DOMAIN_LOCK_SPOOFED_ORIGIN',
        message: 'Inconsistent or suspicious origin headers detected',
        detail: spoofCheck.reason,
      });
      return;
    }

    // Check if origin is approved
    if (isApprovedOrigin(origin, approved)) {
      // Approved origin — add CORS header and proceed
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
      return next();
    }

    // Unknown origin — log it
    const event: CrossOriginEvent = {
      type: 'unknown_origin',
      origin,
      referer: referer ?? null,
      ip,
      userAgent,
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString(),
      requestId,
    };
    logger(event);
    sendTelemetry(event);

    // Hard block in production if configured
    if (blockUnknownOrigins && process.env.NODE_ENV === 'production') {
      const blockedEvent: CrossOriginEvent = { ...event, type: 'blocked' };
      logger(blockedEvent);
      res.status(403).json({
        error: 'Forbidden',
        code: 'DOMAIN_LOCK_UNKNOWN_ORIGIN',
        origin,
      });
      return;
    }

    // Extra rate limiting for unknown origins
    const rateLimited = checkUnknownOriginRateLimit(ip, unknownOriginBurstLimit);
    if (rateLimited) {
      const rlEvent: CrossOriginEvent = { ...event, type: 'rate_limited' };
      logger(rlEvent);
      res.status(429).json({
        error: 'Too Many Requests',
        code: 'DOMAIN_LOCK_RATE_LIMITED',
        message: `Unknown origin rate limit of ${unknownOriginBurstLimit} req/min exceeded`,
        retryAfter: 60,
      });
      return;
    }

    // Unknown but not rate-limited — allow with reduced trust
    res.setHeader('X-Nirium-Origin-Trust', 'low');
    next();
  };
}

// ─── Utility: Check if a request originates from Nirium infra ─────

/**
 * Returns true if the request carries a valid internal service token.
 * Used for service-to-service calls (e.g. cron jobs, webhooks) that
 * don't have a browser Origin header.
 */
export function isInternalRequest(req: Request): boolean {
  const serviceToken = req.headers['x-nirium-service-token'] as string | undefined;
  if (!serviceToken) return false;

  const expectedToken = process.env.INTERNAL_SERVICE_TOKEN;
  if (!expectedToken || expectedToken.length < 32) return false;

  const a = Buffer.from(serviceToken, 'utf8');
  const b = Buffer.from(expectedToken, 'utf8');
  if (a.length !== b.length) return false;

  try {
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
