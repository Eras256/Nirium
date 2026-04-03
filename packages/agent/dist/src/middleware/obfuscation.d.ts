import { Request, Response, NextFunction } from 'express';
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
/**
 * Response obfuscation middleware.
 * Intercepts JSON responses and applies the configured obfuscation layers.
 */
export declare function responseObfuscation(options?: ObfuscationOptions): (req: Request, res: Response, next: NextFunction) => void;
export declare function isCanaryAddress(address: string, apiKey: string): boolean;
/**
 * Generate a deterministic canary address for a given API key.
 * Use to pre-register canary addresses in your monitoring system.
 */
export declare function getCanaryAddresses(apiKey: string, hourOffset?: number): {
    canary1: string;
    canary2: string;
};
//# sourceMappingURL=obfuscation.d.ts.map