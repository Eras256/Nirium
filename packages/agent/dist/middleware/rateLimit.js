// ═══════════════════════════════════════════════════════════════
// Nirium — Token Bucket Rate Limiter
// ═══════════════════════════════════════════════════════════════
const buckets = new Map();
const RATE_LIMITS = {
    standard: {
        maxTokens: 30,
        refillRate: 0.5, // 30 per minute
    },
    aggressive: {
        maxTokens: 5,
        refillRate: 5 / 60, // 5 per minute
    },
    admin: {
        maxTokens: 100,
        refillRate: 100 / 60, // 100 per minute
    },
};
function getClientKey(req) {
    const authReq = req;
    if (authReq.user?.userId) {
        return `user:${authReq.user.userId}`;
    }
    const forwarded = req.headers['x-forwarded-for'];
    const ip = typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : req.ip || 'unknown';
    return `ip:${ip}`;
}
function getBucket(key, config) {
    let bucket = buckets.get(key);
    const now = Date.now();
    if (!bucket) {
        bucket = {
            tokens: config.maxTokens,
            lastRefill: now,
            maxTokens: config.maxTokens,
            refillRate: config.refillRate,
        };
        buckets.set(key, bucket);
        return bucket;
    }
    // Refill tokens based on elapsed time
    const elapsed = (now - bucket.lastRefill) / 1000;
    const refill = elapsed * config.refillRate;
    bucket.tokens = Math.min(bucket.maxTokens, bucket.tokens + refill);
    bucket.lastRefill = now;
    return bucket;
}
function consumeToken(bucket) {
    if (bucket.tokens >= 1) {
        bucket.tokens -= 1;
        return true;
    }
    return false;
}
/**
 * Create a rate limiter middleware with the specified tier.
 */
export function createRateLimiter(tier = 'standard') {
    return (req, res, next) => {
        const authReq = req;
        // Determine the appropriate rate limit tier
        let effectiveTier = tier;
        if (authReq.user?.permissions.includes('admin')) {
            effectiveTier = 'admin';
        }
        const config = RATE_LIMITS[effectiveTier];
        const key = `${effectiveTier}:${getClientKey(req)}`;
        const bucket = getBucket(key, config);
        if (consumeToken(bucket)) {
            // Set rate limit headers
            res.set({
                'X-RateLimit-Limit': String(config.maxTokens),
                'X-RateLimit-Remaining': String(Math.floor(bucket.tokens)),
                'X-RateLimit-Reset': String(Math.ceil(Date.now() / 1000 + (config.maxTokens - bucket.tokens) / config.refillRate)),
            });
            next();
        }
        else {
            const retryAfter = Math.ceil((1 - bucket.tokens) / config.refillRate);
            res.set({
                'X-RateLimit-Limit': String(config.maxTokens),
                'X-RateLimit-Remaining': '0',
                'Retry-After': String(retryAfter),
            });
            res.status(429).json({
                error: 'Too Many Requests',
                message: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
                retryAfter,
            });
        }
    };
}
/**
 * Clean up expired buckets periodically (every 5 minutes).
 */
setInterval(() => {
    const now = Date.now();
    const staleThreshold = 10 * 60 * 1000; // 10 minutes
    for (const [key, bucket] of buckets) {
        if (now - bucket.lastRefill > staleThreshold) {
            buckets.delete(key);
        }
    }
}, 5 * 60 * 1000);
//# sourceMappingURL=rateLimit.js.map