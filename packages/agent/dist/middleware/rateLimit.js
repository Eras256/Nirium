const rates = {};
export function createRateLimiter(type) {
    const limit = type === 'standard' ? 100 : 20;
    const windowMs = 60 * 1000;
    return (req, res, next) => {
        const ip = req.ip || 'unknown';
        const now = Date.now();
        if (!rates[ip] || now > rates[ip].reset) {
            rates[ip] = { requests: 1, reset: now + windowMs };
            return next();
        }
        if (rates[ip].requests >= limit) {
            return res.status(429).json({
                error: 'Too Many Requests',
                retryAfter: Math.ceil((rates[ip].reset - now) / 1000)
            });
        }
        rates[ip].requests++;
        next();
    };
}
//# sourceMappingURL=rateLimit.js.map