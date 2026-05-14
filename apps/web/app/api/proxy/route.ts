// ═══════════════════════════════════════════════════════════════
// Nirium — RPC Proxy Edge Function
// ═══════════════════════════════════════════════════════════════
//
// Transparent proxy between the frontend and nirium-agent.fly.dev.
// Provides:
//  - Domain lock: only accept requests from nirium.xyz origins
//  - Per-IP rate limiting (sliding window via KV-style Map)
//  - Request validation: block known malicious patterns
//  - Hides the real Railway backend URL from the browser
//  - Adds X-Nirium-Request-ID for distributed tracing
//  - Strips sensitive response headers before forwarding
//
// ═══════════════════════════════════════════════════════════════

export const runtime = 'edge';

// ─── Configuration ──────────────────────────────────────────────

const UPSTREAM_URL = process.env.AGENT_INTERNAL_URL ?? 'https://nirium-agent.fly.dev';

const ALLOWED_ORIGINS = new Set([
    'https://nirium.xyz',
    'https://www.nirium.xyz',
    'https://app.nirium.xyz',
    'http://localhost:3000',
    'http://localhost:3001',
]);

/** Rate limit: max requests per window per IP */
const RATE_LIMIT_MAX = 60;
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute

/** Headers that must never be forwarded back to clients */
const SENSITIVE_RESPONSE_HEADERS = new Set([
    'x-powered-by',
    'server',
    'via',
    'x-railway-edge',
    'x-railway-request-id',
    'x-render-origin-server',
    'x-envoy-upstream-service-time',
    'fly-request-id',
    'cf-cache-status',
    'cf-ray',
]);

/** Allowed Host values — prevents Host Header Injection / cache poisoning */
const ALLOWED_HOSTS = new Set([
    'nirium.xyz',
    'www.nirium.xyz',
    'app.nirium.xyz',
    'localhost:3000',
    'localhost:3001',
]);

/** Patterns that indicate malicious or scanning traffic */
const MALICIOUS_PATTERNS = [
    /(\.\.|\/etc\/passwd|\/proc\/self|\/var\/log)/i,
    /<script[\s>]/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /union\s+select/i,
    /\bexec\s*\(/i,
    /\beval\s*\(/i,
    /\$\{.*\}/,                    // template injection
    /%00/,                          // null byte
    /\bprompt\s*\(/i,
    /\balert\s*\(/i,
];

// ─── In-edge rate limit store ────────────────────────────────────
// Edge functions are stateless; this Map lives per-isolate.
// For production multi-replica rate limiting, replace with Vercel KV.

interface RateBucket {
    count: number;
    resetAt: number;
}

const rateBuckets = new Map<string, RateBucket>();

function isRateLimited(ip: string): { limited: boolean; remaining: number; resetAt: number } {
    const now = Date.now();
    let bucket = rateBuckets.get(ip);

    if (!bucket || now >= bucket.resetAt) {
        bucket = { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS };
        rateBuckets.set(ip, bucket);
        return { limited: false, remaining: RATE_LIMIT_MAX - 1, resetAt: bucket.resetAt };
    }

    bucket.count++;
    const limited = bucket.count > RATE_LIMIT_MAX;
    return {
        limited,
        remaining: Math.max(0, RATE_LIMIT_MAX - bucket.count),
        resetAt: bucket.resetAt,
    };
}

// ─── Helpers ────────────────────────────────────────────────────

function generateRequestId(): string {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return Array.from(bytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

function getClientIp(request: Request): string {
    return (
        request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
        request.headers.get('x-real-ip') ??
        'unknown'
    );
}

function containsMaliciousPattern(value: string): boolean {
    return MALICIOUS_PATTERNS.some(re => re.test(value));
}

function validateRequest(request: Request, url: URL): { valid: boolean; reason?: string } {
    // Check URL path for malicious patterns
    const fullPath = url.pathname + url.search;
    if (containsMaliciousPattern(decodeURIComponent(fullPath))) {
        return { valid: false, reason: 'malicious_pattern_in_url' };
    }

    // Block requests to anything outside /api/* (only proxy API calls)
    if (!url.pathname.startsWith('/api/')) {
        return { valid: false, reason: 'non_api_path' };
    }

    // Validate Content-Type on mutation methods
    const method = request.method.toUpperCase();
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
        const ct = request.headers.get('content-type') ?? '';
        if (!ct.includes('application/json') && !ct.includes('multipart/form-data') && !ct.includes('application/x-www-form-urlencoded')) {
            return { valid: false, reason: 'invalid_content_type' };
        }
    }

    return { valid: true };
}

// ─── CORS preflight ─────────────────────────────────────────────

function handleCors(origin: string | null): Headers {
    const headers = new Headers();
    if (origin && ALLOWED_ORIGINS.has(origin)) {
        headers.set('Access-Control-Allow-Origin', origin);
        headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key');
        headers.set('Access-Control-Allow-Credentials', 'true');
        headers.set('Access-Control-Max-Age', '86400');
        headers.set('Vary', 'Origin');
    }
    return headers;
}

// ─── Main handler ────────────────────────────────────────────────

export async function GET(request: Request): Promise<Response> {
    return proxyRequest(request);
}

export async function POST(request: Request): Promise<Response> {
    return proxyRequest(request);
}

export async function PUT(request: Request): Promise<Response> {
    return proxyRequest(request);
}

export async function DELETE(request: Request): Promise<Response> {
    return proxyRequest(request);
}

export async function OPTIONS(request: Request): Promise<Response> {
    const origin = request.headers.get('origin');
    const corsHeaders = handleCors(origin);
    return new Response(null, { status: 204, headers: corsHeaders });
}

async function proxyRequest(request: Request): Promise<Response> {
    const requestId = generateRequestId();
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');
    const ip = getClientIp(request);

    // ── 1. Domain lock ──────────────────────────────────────────
    // Browser requests always carry an Origin; reject anything not
    // on the allowlist. Server-to-server calls (no Origin) are also
    // blocked here to prevent blind SSRF abuse.
    const effectiveOrigin = origin ?? (referer ? new URL(referer).origin : null);
    if (!effectiveOrigin || !ALLOWED_ORIGINS.has(effectiveOrigin)) {
        return new Response(
            JSON.stringify({ error: 'Forbidden', code: 'DOMAIN_LOCK' }),
            {
                status: 403,
                headers: {
                    'Content-Type': 'application/json',
                    'X-Nirium-Request-ID': requestId,
                },
            }
        );
    }

    // ── 1b. Host Header Injection guard ────────────────────────
    // An attacker can forge the Host header to poison HTTP caches,
    // trigger password-reset links pointing to evil.com, or bypass
    // virtual-host routing. Reject any Host not on the allowlist.
    const hostHeader = request.headers.get('host') ?? '';
    if (hostHeader && !ALLOWED_HOSTS.has(hostHeader)) {
        return new Response(
            JSON.stringify({ error: 'Forbidden', code: 'HOST_HEADER_REJECTED' }),
            {
                status: 403,
                headers: {
                    'Content-Type': 'application/json',
                    'X-Nirium-Request-ID': requestId,
                },
            }
        );
    }

    // ── 2. Rate limiting ────────────────────────────────────────
    const rl = isRateLimited(ip);
    const corsHeaders = handleCors(origin);

    if (rl.limited) {
        const headers = new Headers(corsHeaders);
        headers.set('Content-Type', 'application/json');
        headers.set('X-RateLimit-Limit', String(RATE_LIMIT_MAX));
        headers.set('X-RateLimit-Remaining', '0');
        headers.set('X-RateLimit-Reset', String(Math.ceil(rl.resetAt / 1000)));
        headers.set('Retry-After', String(Math.ceil(RATE_LIMIT_WINDOW_MS / 1000)));
        headers.set('X-Nirium-Request-ID', requestId);
        return new Response(
            JSON.stringify({ error: 'Too Many Requests', code: 'RATE_LIMITED' }),
            { status: 429, headers }
        );
    }

    // ── 3. Request validation ───────────────────────────────────
    const incomingUrl = new URL(request.url);
    const validation = validateRequest(request, incomingUrl);
    if (!validation.valid) {
        return new Response(
            JSON.stringify({ error: 'Bad Request', code: validation.reason }),
            {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'X-Nirium-Request-ID': requestId,
                },
            }
        );
    }

    // ── 4. Build upstream request ───────────────────────────────
    // Strip the /api/proxy prefix so /api/proxy/api/health → /api/health
    const upstreamPath = incomingUrl.pathname.replace(/^\/api\/proxy/, '') || '/';
    const upstreamUrl = new URL(upstreamPath + incomingUrl.search, UPSTREAM_URL);

    const upstreamHeaders = new Headers();
    // Forward safe headers only
    for (const [key, value] of request.headers.entries()) {
        const lower = key.toLowerCase();
        if (
            lower === 'content-type' ||
            lower === 'authorization' ||
            lower === 'x-api-key' ||
            lower === 'accept' ||
            lower === 'accept-language' ||
            lower === 'accept-encoding'
        ) {
            upstreamHeaders.set(key, value);
        }
    }
    upstreamHeaders.set('X-Forwarded-For', ip);
    upstreamHeaders.set('X-Nirium-Request-ID', requestId);
    upstreamHeaders.set('X-Forwarded-Host', incomingUrl.host);
    upstreamHeaders.set('X-Proxy-Origin', effectiveOrigin);

    let body: BodyInit | null = null;
    if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method.toUpperCase())) {
        body = await request.arrayBuffer();
        // Validate body content for malicious patterns (text payloads only)
        const ct = request.headers.get('content-type') ?? '';
        if (ct.includes('application/json') || ct.includes('text/')) {
            const text = new TextDecoder().decode(body as ArrayBuffer);
            if (containsMaliciousPattern(text)) {
                return new Response(
                    JSON.stringify({ error: 'Bad Request', code: 'malicious_pattern_in_body' }),
                    {
                        status: 400,
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Nirium-Request-ID': requestId,
                        },
                    }
                );
            }
        }
    }

    // ── 5. Forward to upstream ──────────────────────────────────
    let upstreamResponse: Response;
    try {
        upstreamResponse = await fetch(upstreamUrl.toString(), {
            method: request.method,
            headers: upstreamHeaders,
            body: body ?? undefined,
        });
    } catch (err) {
        return new Response(
            JSON.stringify({ error: 'Bad Gateway', code: 'UPSTREAM_UNREACHABLE' }),
            {
                status: 502,
                headers: {
                    'Content-Type': 'application/json',
                    'X-Nirium-Request-ID': requestId,
                },
            }
        );
    }

    // ── 6. Strip sensitive response headers ─────────────────────
    const responseHeaders = new Headers(corsHeaders);
    for (const [key, value] of upstreamResponse.headers.entries()) {
        if (!SENSITIVE_RESPONSE_HEADERS.has(key.toLowerCase())) {
            responseHeaders.set(key, value);
        }
    }
    responseHeaders.set('X-Nirium-Request-ID', requestId);
    responseHeaders.set('X-RateLimit-Limit', String(RATE_LIMIT_MAX));
    responseHeaders.set('X-RateLimit-Remaining', String(rl.remaining));
    responseHeaders.set('X-RateLimit-Reset', String(Math.ceil(rl.resetAt / 1000)));

    return new Response(upstreamResponse.body, {
        status: upstreamResponse.status,
        statusText: upstreamResponse.statusText,
        headers: responseHeaders,
    });
}
