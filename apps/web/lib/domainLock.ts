// ═══════════════════════════════════════════════════════════════
// Nirium — Domain Lock Utility
// ═══════════════════════════════════════════════════════════════
//
// Checks if the application is running on an approved domain.
// If not nirium.xyz or localhost, critical features are disabled
// and suspicious access attempts are logged.
//
// ═══════════════════════════════════════════════════════════════

/** Domains on which Nirium is authorised to operate */
const APPROVED_DOMAINS: ReadonlySet<string> = new Set([
    'nirium.xyz',
    'www.nirium.xyz',
    'app.nirium.xyz',
    'localhost',
    '127.0.0.1',
]);

/** Features that are disabled when running on an unapproved domain */
export type CriticalFeature =
    | 'stellar_transactions'
    | 'wallet_connect'
    | 'api_keys'
    | 'autonomous_loop'
    | 'webhooks'
    | 'strategy_execution';

// ─── Helpers ────────────────────────────────────────────────────

/**
 * Returns the effective hostname for the current environment.
 * Works in both browser and Next.js server-side contexts.
 */
function getCurrentHostname(): string | null {
    if (typeof window !== 'undefined') {
        return window.location.hostname;
    }
    // Server-side: read from environment variable set by Vercel / Next.js
    const vercelUrl = process.env.VERCEL_URL;
    if (vercelUrl) {
        try {
            return new URL(`https://${vercelUrl}`).hostname;
        } catch {
            return vercelUrl.split('/')[0];
        }
    }
    const nextPublicUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (nextPublicUrl) {
        try {
            return new URL(nextPublicUrl).hostname;
        } catch {
            return null;
        }
    }
    return null;
}

/**
 * Returns true if the given hostname is approved.
 * Handles subdomains: any *.nirium.xyz is approved.
 */
function isApprovedHostname(hostname: string): boolean {
    if (APPROVED_DOMAINS.has(hostname)) return true;
    // Allow any *.nirium.xyz subdomain
    if (hostname.endsWith('.nirium.xyz')) return true;
    // Allow localhost with any port (hostname only, port stripped by browser)
    if (hostname === 'localhost') return true;
    return false;
}

// ─── Logging ────────────────────────────────────────────────────

interface DomainViolationEvent {
    hostname: string;
    timestamp: string;
    userAgent?: string;
    referrer?: string;
}

/**
 * Logs a suspicious domain access attempt.
 * In production, this would forward to a SIEM or monitoring service.
 */
function logSuspiciousDomainAccess(event: DomainViolationEvent): void {
    // Structured log — picked up by Vercel / Railway log drains
    const entry = {
        level: 'WARN',
        event: 'DOMAIN_LOCK_VIOLATION',
        ...event,
    };

    // Use console.warn so removeConsole in next.config.mjs (production)
    // strips this in bundles, but it still fires on the server/edge.
    console.warn('[nirium:domain-lock]', JSON.stringify(entry));

    // Browser-side: also push to a telemetry endpoint if available
    if (typeof window !== 'undefined' && typeof fetch !== 'undefined') {
        // Fire-and-forget — do not await or handle errors to avoid
        // disrupting the UI rendering path.
        try {
            fetch('/api/telemetry/domain-violation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(entry),
                keepalive: true,
            }).catch(() => {
                // Intentionally swallowed — telemetry must never crash the app
            });
        } catch {
            // Intentionally swallowed
        }
    }
}

// ─── Public API ──────────────────────────────────────────────────

export interface DomainLockStatus {
    /** Whether the app is running on an approved domain */
    approved: boolean;
    /** The hostname that was evaluated */
    hostname: string | null;
    /** Features that are currently disabled */
    disabledFeatures: CriticalFeature[];
}

const ALL_CRITICAL_FEATURES: CriticalFeature[] = [
    'stellar_transactions',
    'wallet_connect',
    'api_keys',
    'autonomous_loop',
    'webhooks',
    'strategy_execution',
];

let _cachedStatus: DomainLockStatus | null = null;

/**
 * Evaluates the domain lock and returns the current status.
 * The result is cached for the lifetime of the module.
 */
export function getDomainLockStatus(): DomainLockStatus {
    if (_cachedStatus) return _cachedStatus;

    const hostname = getCurrentHostname();

    if (hostname === null) {
        // Cannot determine hostname — allow in SSR/build contexts
        _cachedStatus = {
            approved: true,
            hostname: null,
            disabledFeatures: [],
        };
        return _cachedStatus;
    }

    const approved = isApprovedHostname(hostname);

    if (!approved) {
        logSuspiciousDomainAccess({
            hostname,
            timestamp: new Date().toISOString(),
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
            referrer: typeof document !== 'undefined' ? document.referrer : undefined,
        });
    }

    _cachedStatus = {
        approved,
        hostname,
        disabledFeatures: approved ? [] : [...ALL_CRITICAL_FEATURES],
    };

    return _cachedStatus;
}

/**
 * Returns true if a specific critical feature is enabled on the
 * current domain.
 *
 * @example
 *   if (!isFeatureEnabled('wallet_connect')) {
 *     throw new Error('Feature not available on this domain');
 *   }
 */
export function isFeatureEnabled(feature: CriticalFeature): boolean {
    const { disabledFeatures } = getDomainLockStatus();
    return !disabledFeatures.includes(feature);
}

/**
 * Throws if the current domain is not approved.
 * Use this as a guard at the start of critical operations.
 */
export function assertApprovedDomain(): void {
    const status = getDomainLockStatus();
    if (!status.approved) {
        throw new Error(
            `[nirium:domain-lock] Critical features are disabled on '${status.hostname}'. ` +
            'This application must run on nirium.xyz.'
        );
    }
}

/**
 * Resets the cached domain lock status.
 * Useful for testing or when the URL changes dynamically (rare).
 */
export function resetDomainLockCache(): void {
    _cachedStatus = null;
}
