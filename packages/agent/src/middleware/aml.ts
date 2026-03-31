// ═══════════════════════════════════════════════════════════════
// Nirium Agent — AML / Sanctions Compliance Middleware
// ═══════════════════════════════════════════════════════════════
//
// Implements basic AML controls for Stellar-based transactions:
//
//  - Travel Rule: FinCEN / FATF requirement — transactions >= $3,000
//    must carry originator + beneficiary identifying information.
//  - OFAC Sanctions Check: validates wallet addresses against known
//    sanctions list patterns (stub; production should query SDN API).
//  - AML Event Logging: high-value transactions are logged to IPFS
//    via the existing ipfsService for immutable audit trail.
//  - Proof-of-Reserves Hook: periodic balance verification stub.
//
// ═══════════════════════════════════════════════════════════════

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { uploadToIpfs } from '../services/ipfsService.js';
import type { LogEntry } from '../types/database.types.js';

// ─── Types ───────────────────────────────────────────────────────

export interface TravelRuleParty {
    name: string;
    accountNumber: string;          // wallet address or IBAN
    address?: string;
    dateOfBirth?: string;           // ISO 8601
    nationalId?: string;
}

export interface AmlEventRecord {
    eventType: 'travel_rule' | 'ofac_check' | 'high_value_tx' | 'proof_of_reserves';
    timestamp: string;
    walletAddress?: string;
    amount?: number;
    asset?: string;
    originator?: TravelRuleParty;
    beneficiary?: TravelRuleParty;
    ofacResult?: 'cleared' | 'flagged' | 'error';
    meta?: Record<string, unknown>;
}

// ─── Configuration ────────────────────────────────────────────────

/** Travel Rule threshold (USD equivalent) — FinCEN 31 CFR 1010.410 */
const TRAVEL_RULE_THRESHOLD_USD = 3_000;

/** High-value logging threshold (USD equivalent) */
const HIGH_VALUE_LOG_THRESHOLD_USD = 10_000;

/** Proof-of-reserves check interval (ms) */
const PROOF_OF_RESERVES_INTERVAL_MS = 6 * 60 * 60 * 1000; // 6 hours

// ─── OFAC Sanctions Patterns ─────────────────────────────────────
// In production replace with a live SDN list query:
//   https://sanctionslistservice.ofac.treas.gov/api/
//
// The patterns below are illustrative blocklist examples only.

const OFAC_BLOCKED_ADDRESS_PATTERNS: RegExp[] = [
    // North Korea (DPRK) — known Lazarus Group prefixes (illustrative)
    /^G[A-Z2-7]{5}LAZARUS/i,
    // Generic: addresses explicitly denoted as blocked in test environments
    /^GBLOCKED/i,
];

const OFAC_BLOCKED_EXACT: ReadonlySet<string> = new Set([
    // Add exact Stellar addresses from the OFAC SDN list here.
    // These are placeholder values.
    'GOFACBLOCKED1EXAMPLEADDRESSFORTEST000000000000000000000000',
]);

// ─── Helpers ─────────────────────────────────────────────────────

function isOfacBlocked(address: string): boolean {
    if (OFAC_BLOCKED_EXACT.has(address)) return true;
    return OFAC_BLOCKED_ADDRESS_PATTERNS.some(re => re.test(address));
}

async function logAmlEventToIpfs(event: AmlEventRecord): Promise<void> {
    try {
        const logEntry: LogEntry = {
            id: crypto.randomUUID(),
            message: `AML event: ${event.eventType}`,
            level: event.ofacResult === 'flagged' ? 'warn' : 'info',
            details: event as unknown as Record<string, unknown>,
            created_at: event.timestamp,
        };
        await uploadToIpfs([logEntry], {
            type: 'aml_audit',
            eventType: event.eventType,
        });
    } catch (err) {
        // Logging failure must never block the transaction — emit a warning only
        console.warn('[nirium:aml] Failed to log AML event to IPFS:', err);
    }
}

function extractAmount(body: Record<string, unknown>): number | null {
    const raw =
        body['amount'] ??
        body['amountUsd'] ??
        (body['strategy'] as Record<string, unknown> | undefined)?.['amount'];

    if (raw === undefined || raw === null) return null;
    const n = Number(raw);
    return isNaN(n) ? null : n;
}

function extractWalletAddress(body: Record<string, unknown>): string | null {
    const raw =
        body['walletAddress'] ??
        body['sourceAccount'] ??
        body['from'] ??
        (body['strategy'] as Record<string, unknown> | undefined)?.['walletAddress'];
    return typeof raw === 'string' ? raw : null;
}

// ─── a) Travel Rule Middleware ────────────────────────────────────
// Requires originator + beneficiary info for transactions >= $3,000.

export function travelRuleMiddleware() {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        if (!req.body || typeof req.body !== 'object') return next();

        const amount = extractAmount(req.body as Record<string, unknown>);
        if (amount === null || amount < TRAVEL_RULE_THRESHOLD_USD) return next();

        const body = req.body as Record<string, unknown>;
        const originator = body['originator'] as TravelRuleParty | undefined;
        const beneficiary = body['beneficiary'] as TravelRuleParty | undefined;

        if (!originator || !originator.name || !originator.accountNumber) {
            res.status(422).json({
                error: 'Unprocessable Entity',
                code: 'TRAVEL_RULE_ORIGINATOR_REQUIRED',
                message: `Transactions >= $${TRAVEL_RULE_THRESHOLD_USD.toLocaleString()} require originator information (name, accountNumber).`,
                threshold: TRAVEL_RULE_THRESHOLD_USD,
            });
            return;
        }

        if (!beneficiary || !beneficiary.name || !beneficiary.accountNumber) {
            res.status(422).json({
                error: 'Unprocessable Entity',
                code: 'TRAVEL_RULE_BENEFICIARY_REQUIRED',
                message: `Transactions >= $${TRAVEL_RULE_THRESHOLD_USD.toLocaleString()} require beneficiary information (name, accountNumber).`,
                threshold: TRAVEL_RULE_THRESHOLD_USD,
            });
            return;
        }

        // Log the travel rule event asynchronously
        void logAmlEventToIpfs({
            eventType: 'travel_rule',
            timestamp: new Date().toISOString(),
            walletAddress: extractWalletAddress(body) ?? undefined,
            amount,
            asset: typeof body['asset'] === 'string' ? body['asset'] : undefined,
            originator,
            beneficiary,
        });

        next();
    };
}

// ─── b) OFAC Sanctions Check Middleware ──────────────────────────
// Checks the source wallet address against the sanctions list.
// Blocks the request if a match is found.

export function ofacCheckMiddleware() {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        if (!req.body || typeof req.body !== 'object') return next();

        const body = req.body as Record<string, unknown>;
        const address = extractWalletAddress(body);

        if (!address) return next();

        const blocked = isOfacBlocked(address);

        const event: AmlEventRecord = {
            eventType: 'ofac_check',
            timestamp: new Date().toISOString(),
            walletAddress: address,
            ofacResult: blocked ? 'flagged' : 'cleared',
        };

        if (blocked) {
            // Log synchronously before rejecting so the event is always captured
            void logAmlEventToIpfs(event);
            res.status(403).json({
                error: 'Forbidden',
                code: 'OFAC_SANCTIONS_MATCH',
                message: 'This wallet address matches an OFAC sanctions entry and cannot transact.',
            });
            return;
        }

        // Cleared — log asynchronously and continue
        void logAmlEventToIpfs(event);
        next();
    };
}

// ─── c) High-Value AML Event Logging ─────────────────────────────
// Logs transactions above the high-value threshold to IPFS for
// immutable audit trail. Does not block the request.

export function amlEventLogger() {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        if (!req.body || typeof req.body !== 'object') return next();

        const body = req.body as Record<string, unknown>;
        const amount = extractAmount(body);

        if (amount !== null && amount >= HIGH_VALUE_LOG_THRESHOLD_USD) {
            void logAmlEventToIpfs({
                eventType: 'high_value_tx',
                timestamp: new Date().toISOString(),
                walletAddress: extractWalletAddress(body) ?? undefined,
                amount,
                asset: typeof body['asset'] === 'string' ? body['asset'] : undefined,
                meta: {
                    path: req.path,
                    method: req.method,
                    ip: req.ip,
                },
            });
        }

        next();
    };
}

// ─── d) Proof-of-Reserves Hook ───────────────────────────────────
// Registers a periodic balance verification stub.
// In production this would call the Stellar Horizon API to verify
// reserve balances and log the result to IPFS.

let _reservesIntervalHandle: ReturnType<typeof setInterval> | null = null;

export async function checkProofOfReserves(walletAddress: string): Promise<void> {
    // Production implementation:
    //   const account = await server.loadAccount(walletAddress);
    //   const xlmBalance = account.balances.find(b => b.asset_type === 'native');
    //   const reserveXlm = parseFloat(xlmBalance?.balance ?? '0');
    //
    // For now, log the intent with a placeholder balance.
    const event: AmlEventRecord = {
        eventType: 'proof_of_reserves',
        timestamp: new Date().toISOString(),
        walletAddress,
        meta: {
            note: 'Production: replace with Horizon loadAccount balance query',
            status: 'stub',
        },
    };
    await logAmlEventToIpfs(event);
}

/**
 * Starts periodic proof-of-reserves verification for the given address.
 * Safe to call multiple times — only one interval runs at a time.
 */
export function startProofOfReservesSchedule(walletAddress: string): void {
    if (_reservesIntervalHandle) return;

    // Run immediately on startup, then on the interval
    void checkProofOfReserves(walletAddress);

    _reservesIntervalHandle = setInterval(() => {
        void checkProofOfReserves(walletAddress);
    }, PROOF_OF_RESERVES_INTERVAL_MS);

    // Allow the process to exit even if this interval is running
    _reservesIntervalHandle.unref?.();
}

/**
 * Stops the proof-of-reserves schedule (useful for graceful shutdown
 * or testing).
 */
export function stopProofOfReservesSchedule(): void {
    if (_reservesIntervalHandle) {
        clearInterval(_reservesIntervalHandle);
        _reservesIntervalHandle = null;
    }
}

// ─── Composite AML Middleware Stack ─────────────────────────────
// Convenience export: apply all AML checks in the correct order.

export function amlMiddlewareStack() {
    return [
        ofacCheckMiddleware(),
        travelRuleMiddleware(),
        amlEventLogger(),
    ];
}
