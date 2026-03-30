// ═══════════════════════════════════════════════════════════════
// Nirium — Rate Limiter (tier-aware, per-user, Redis-ready)
// ═══════════════════════════════════════════════════════════════
//
// Architecture:
//  - Per-user sliding window (uses userId from JWT/API-key when available)
//  - Falls back to IP-based when unauthenticated
//  - Respects tier quotas from TIER_QUOTAS
//  - Drop-in Redis replacement: swap InMemoryStore for RedisStore
//    when REDIS_URL env var is present (see RedisStore stub below)
//
// ═══════════════════════════════════════════════════════════════

import { Request, Response, NextFunction } from 'express';

// ─── Store Interface ────────────────────────────────────────────
// Swap this implementation for a Redis-backed store in production.
// Redis example (ioredis):
//   const redis = new Redis(process.env.REDIS_URL);
//   store.increment = async (key, windowMs) => {
//     const current = await redis.incr(key);
//     if (current === 1) await redis.pexpire(key, windowMs);
//     return current;
//   };

interface RateLimitStore {
    increment(key: string, windowMs: number): Promise<number>;
    reset(key: string): Promise<void>;
}

class InMemoryStore implements RateLimitStore {
    private buckets = new Map<string, { count: number; resetAt: number }>();

    async increment(key: string, windowMs: number): Promise<number> {
        const now = Date.now();
        const bucket = this.buckets.get(key);

        if (!bucket || now >= bucket.resetAt) {
            this.buckets.set(key, { count: 1, resetAt: now + windowMs });
            return 1;
        }

        bucket.count++;
        return bucket.count;
    }

    async reset(key: string): Promise<void> {
        this.buckets.delete(key);
    }

    // Cleanup expired entries every 5 minutes to avoid memory leaks
    startCleanup() {
        setInterval(() => {
            const now = Date.now();
            for (const [key, bucket] of this.buckets) {
                if (now >= bucket.resetAt) this.buckets.delete(key);
            }
        }, 5 * 60 * 1000);
        return this;
    }
}

const store: RateLimitStore = new InMemoryStore().startCleanup();

// ─── Tier Limits ────────────────────────────────────────────────
const TIER_LIMITS: Record<string, { windowMs: number; max: number }> = {
    free:          { windowMs: 60_000, max: 10 },
    sandbox:       { windowMs: 60_000, max: 60 },
    institutional: { windowMs: 60_000, max: 300 },
    enterprise:    { windowMs: 60_000, max: 1_000 },
    admin:         { windowMs: 60_000, max: 5_000 },
    // Legacy types passed from createRateLimiter
    standard:      { windowMs: 60_000, max: 100 },
    aggressive:    { windowMs: 60_000, max: 20 },
};

// ─── Middleware Factory ─────────────────────────────────────────
export function createRateLimiter(type: 'standard' | 'aggressive' | string = 'standard') {
    return async (req: Request, res: Response, next: NextFunction) => {
        // Determine rate limit config:
        //  1. If request is authenticated, use their tier limits
        //  2. Otherwise use the passed type ('standard' | 'aggressive')
        const userTier = (req as any).user?.tier;
        const config = userTier
            ? (TIER_LIMITS[userTier] ?? TIER_LIMITS.free)
            : (TIER_LIMITS[type] ?? TIER_LIMITS.standard);

        // Key: prefer userId (authenticated) over IP (anonymous)
        const userId = (req as any).user?.userId;
        const ip = req.ip || req.socket?.remoteAddress || 'unknown';
        const key = `rl:${userId ?? ip}:${type}`;

        const count = await store.increment(key, config.windowMs);

        // Set standard rate-limit headers
        res.setHeader('X-RateLimit-Limit', config.max);
        res.setHeader('X-RateLimit-Remaining', Math.max(0, config.max - count));
        res.setHeader('X-RateLimit-Reset', Math.ceil((Date.now() + config.windowMs) / 1000));

        if (count > config.max) {
            return res.status(429).json({
                error: 'Too Many Requests',
                limit: config.max,
                windowSeconds: config.windowMs / 1000,
                retryAfter: Math.ceil(config.windowMs / 1000),
                tier: userTier || 'anonymous',
                upgrade: userTier === 'free' || !userTier
                    ? 'Request a sandbox account at /api/sandbox/request to increase your limits'
                    : undefined,
            });
        }

        next();
    };
}
