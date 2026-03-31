'use client';
// ═══════════════════════════════════════════════════════════════
// Nirium — Client-Side Anti-Debug & Anti-Tamper Protection
// ═══════════════════════════════════════════════════════════════
//
// DESIGN PHILOSOPHY:
//   Graceful degradation only — NEVER crash the app.
//   If tampering is detected, disable sensitive features
//   and notify telemetry, then continue silently.
//
// DETECTION METHODS:
//   a) Debug timing attack — devtools open detection
//   b) Domain lock — disable features off nirium.xyz
//   c) Function integrity — detect monkey-patched critical fns
//   d) Console override — mute console in production
//   e) Key function hash — alert if hashes change at runtime
//
// ═══════════════════════════════════════════════════════════════

// ─── Types ───────────────────────────────────────────────────────

export type TamperReason =
  | 'devtools_open'
  | 'domain_unauthorized'
  | 'function_monkey_patched'
  | 'critical_fn_hash_mismatch';

export interface TamperEvent {
  reason: TamperReason;
  detail?: string;
  timestamp: string;
}

export interface AntiDebugStatus {
  tampered: boolean;
  reasons: TamperReason[];
  featuresDisabled: boolean;
}

// ─── Internal State ───────────────────────────────────────────────

const _detectedReasons = new Set<TamperReason>();
let _initialized = false;

// ─── Approved Domains ─────────────────────────────────────────────

const APPROVED_HOSTNAMES = new Set([
  'nirium.xyz',
  'www.nirium.xyz',
  'app.nirium.xyz',
  'localhost',
  '127.0.0.1',
]);

function isApprovedHostname(hostname: string): boolean {
  if (APPROVED_HOSTNAMES.has(hostname)) return true;
  if (hostname.endsWith('.nirium.xyz')) return true;
  return false;
}

// ─── a) Devtools Detection via Timing ─────────────────────────────
//
// When devtools is open, the `debugger` statement causes a measurable
// pause (typically hundreds of ms vs <1 ms when closed). We also
// measure the time taken to iterate over a large object via toString,
// which devtools formats slowly when the panel is active.

const DEBUGGER_TIMING_THRESHOLD_MS = 100;
const OBJECT_TIMING_THRESHOLD_MS = 20;
let _devtoolsDetected = false;

function detectDevtools(): boolean {
  if (typeof window === 'undefined') return false;

  // Method 1: Debugger statement timing
  const t0 = performance.now();
  // eslint-disable-next-line no-debugger
  debugger;
  const t1 = performance.now();
  if (t1 - t0 > DEBUGGER_TIMING_THRESHOLD_MS) {
    _devtoolsDetected = true;
    return true;
  }

  // Method 2: Object toString expansion timing (devtools formats objects eagerly)
  const start = performance.now();
  const sentinel = Object.create(null);
  Object.defineProperty(sentinel, 'devtools', {
    get() {
      _devtoolsDetected = true;
      return true;
    },
  });
  // When devtools is open, accessing the getter via console triggers the side-effect
  void sentinel.toString();
  const elapsed = performance.now() - start;
  if (elapsed > OBJECT_TIMING_THRESHOLD_MS) {
    _devtoolsDetected = true;
  }

  // Method 3: window.outerWidth / outerHeight vs innerWidth / innerHeight
  // A detached devtools window causes a large discrepancy
  if (
    typeof window.outerWidth === 'number' &&
    typeof window.innerWidth === 'number' &&
    window.outerWidth - window.innerWidth > 200
  ) {
    _devtoolsDetected = true;
  }

  return _devtoolsDetected;
}

// ─── b) Domain Lock ──────────────────────────────────────────────

function checkDomainLock(): boolean {
  if (typeof window === 'undefined') return true;
  const hostname = window.location.hostname;
  return isApprovedHostname(hostname);
}

// ─── c) Anti-Tamper — Monkey Patch Detection ─────────────────────
//
// We snapshot the .toString() of native functions at module load time.
// If a function has been monkey-patched, its toString() will differ from
// the native form, which always contains "native code".

const NATIVE_CODE_PATTERN = /\[native code\]/;

const NATIVE_FN_CHECKS: Array<[string, () => Function | undefined]> = [
  ['fetch',          () => (typeof window !== 'undefined' ? window.fetch : undefined)],
  ['XMLHttpRequest', () => (typeof window !== 'undefined' ? window.XMLHttpRequest?.prototype?.open : undefined)],
  ['JSON.stringify', () => JSON.stringify],
  ['JSON.parse',     () => JSON.parse],
  ['Object.keys',    () => Object.keys],
  ['Array.prototype.map', () => Array.prototype.map],
];

function isNativeFunction(fn: Function): boolean {
  try {
    const src = Function.prototype.toString.call(fn);
    return NATIVE_CODE_PATTERN.test(src);
  } catch {
    return false;
  }
}

function detectMonkeyPatching(): string[] {
  const patched: string[] = [];
  for (const [name, getter] of NATIVE_FN_CHECKS) {
    const fn = getter();
    if (fn && typeof fn === 'function' && !isNativeFunction(fn)) {
      patched.push(name);
    }
  }
  return patched;
}

// ─── d) Console Override (Production) ────────────────────────────
//
// In production, replace console.log/debug/info/warn with no-ops to
// prevent information leakage. console.error is preserved for critical
// errors that need to surface to error-monitoring tools.

const _originalConsole = {
  log:   console.log.bind(console),
  debug: console.debug.bind(console),
  info:  console.info.bind(console),
  warn:  console.warn.bind(console),
  error: console.error.bind(console),
};

function overrideConsoleInProduction(): void {
  if (typeof window === 'undefined') return;
  if (process.env.NODE_ENV !== 'production') return;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const noop = () => {};

  try {
    console.log   = noop;
    console.debug = noop;
    console.info  = noop;
    // Preserve warn/error — needed by error monitoring (Sentry etc.)
    // but strip verbose data by intercepting
    const originalWarn = _originalConsole.warn;
    console.warn = (...args: unknown[]) => {
      // Only forward structured error objects, not raw strings
      if (args.length > 0 && typeof args[0] === 'object') {
        originalWarn('[nirium]', args[0]);
      }
    };
  } catch {
    // Intentionally swallowed — console override must never crash the app
  }
}

// ─── e) Key Function Integrity (Hash-Based) ──────────────────────
//
// We compute a djb2 hash of critical function source strings at
// initialization time and re-check them periodically. If any hash
// changes, a patch has been applied at runtime.
//
// Note: only works for non-native (JS-defined) functions. Native fns
// are covered by the monkey-patch detection above.

function djb2Hash(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    // djb2: hash = hash * 33 ^ char
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
    // Keep within 32-bit signed integer range
    hash = hash | 0;
  }
  return hash >>> 0; // unsigned
}

function getFunctionSource(fn: Function): string | null {
  try {
    return Function.prototype.toString.call(fn);
  } catch {
    return null;
  }
}

// Registry: name → expected hash (populated on first run)
const _fnHashRegistry = new Map<string, number>();

/**
 * Register a function for integrity monitoring.
 * Call this once at startup with the authoritative version of each
 * critical function.
 */
export function registerCriticalFunction(name: string, fn: Function): void {
  const src = getFunctionSource(fn);
  if (src === null) return;
  _fnHashRegistry.set(name, djb2Hash(src));
}

/**
 * Verify all registered functions still match their expected hashes.
 * Returns names of any functions that have been tampered with.
 */
export function verifyCriticalFunctions(fns: Record<string, Function>): string[] {
  const mismatched: string[] = [];
  for (const [name, fn] of Object.entries(fns)) {
    const expected = _fnHashRegistry.get(name);
    if (expected === undefined) continue; // not registered — skip
    const src = getFunctionSource(fn);
    if (src === null) continue;
    const actual = djb2Hash(src);
    if (actual !== expected) {
      mismatched.push(name);
    }
  }
  return mismatched;
}

// ─── Telemetry ───────────────────────────────────────────────────

function reportTamperEvent(event: TamperEvent): void {
  // Use the preserved original console.warn (not the overridden one)
  _originalConsole.warn('[nirium:anti-debug]', JSON.stringify(event));

  if (typeof window !== 'undefined' && typeof fetch !== 'undefined') {
    try {
      // Use the original fetch in case it has been patched
      const originalFetch: typeof fetch =
        (window as unknown as Record<string, unknown>).__niriumOriginalFetch as typeof fetch ??
        fetch;
      originalFetch('/api/telemetry/tamper-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
        keepalive: true,
      }).catch(() => {
        // Intentionally swallowed
      });
    } catch {
      // Intentionally swallowed
    }
  }
}

// ─── Public API ───────────────────────────────────────────────────

/**
 * Initialize all anti-debug / anti-tamper protections.
 * Must be called once, client-side, typically in a top-level layout.
 * Safe to call multiple times — only initializes once.
 */
export function initAntiDebug(): AntiDebugStatus {
  if (_initialized) return getAntiDebugStatus();
  _initialized = true;

  // Save original fetch before any potential patching
  if (typeof window !== 'undefined') {
    (window as unknown as Record<string, unknown>).__niriumOriginalFetch = window.fetch;
  }

  // d) Override console first, before any potential leakage
  overrideConsoleInProduction();

  // b) Domain check
  if (!checkDomainLock()) {
    _detectedReasons.add('domain_unauthorized');
    reportTamperEvent({
      reason: 'domain_unauthorized',
      detail: typeof window !== 'undefined' ? window.location.hostname : 'unknown',
      timestamp: new Date().toISOString(),
    });
  }

  // c) Monkey-patch detection
  const patched = detectMonkeyPatching();
  if (patched.length > 0) {
    _detectedReasons.add('function_monkey_patched');
    reportTamperEvent({
      reason: 'function_monkey_patched',
      detail: patched.join(', '),
      timestamp: new Date().toISOString(),
    });
  }

  // a) Devtools detection (run once, then periodically)
  if (detectDevtools()) {
    _detectedReasons.add('devtools_open');
    reportTamperEvent({
      reason: 'devtools_open',
      detail: 'Initial detection',
      timestamp: new Date().toISOString(),
    });
  }

  // Schedule periodic devtools check (every 3 seconds)
  if (typeof window !== 'undefined') {
    const intervalId = setInterval(() => {
      if (detectDevtools() && !_detectedReasons.has('devtools_open')) {
        _detectedReasons.add('devtools_open');
        reportTamperEvent({
          reason: 'devtools_open',
          detail: 'Periodic detection',
          timestamp: new Date().toISOString(),
        });
      }
    }, 3000);
    // Unref-equivalent: don't prevent page unload
    if (typeof (intervalId as unknown as NodeJS.Timer)?.unref === 'function') {
      (intervalId as unknown as NodeJS.Timer).unref();
    }
  }

  return getAntiDebugStatus();
}

/**
 * Returns the current anti-debug status.
 */
export function getAntiDebugStatus(): AntiDebugStatus {
  const reasons = Array.from(_detectedReasons);
  return {
    tampered: reasons.length > 0,
    reasons,
    featuresDisabled: reasons.some(
      r => r === 'domain_unauthorized' || r === 'function_monkey_patched' || r === 'critical_fn_hash_mismatch'
    ),
  };
}

/**
 * Returns true if all features are safe to use.
 * Use this as a guard before executing sensitive operations.
 */
export function isSafeToExecute(): boolean {
  return !getAntiDebugStatus().featuresDisabled;
}

/**
 * Manually signal a tamper event from application code.
 */
export function signalTamper(reason: TamperReason, detail?: string): void {
  _detectedReasons.add(reason);
  reportTamperEvent({
    reason,
    detail,
    timestamp: new Date().toISOString(),
  });
}
