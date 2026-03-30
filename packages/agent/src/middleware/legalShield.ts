import { Request, Response, NextFunction } from 'express';
import { supabase } from '../providers/database.js';

const SUPABASE_AVAILABLE = !!(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY);
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

/**
 * Legal Shield Middleware
 * Verifies that the user has signed the legal consent terms on-chain.
 * Required for critical operations on Soroban/Mainnet.
 *
 * Behavior by environment:
 *  - production  + Supabase configured : strict — fails closed on any DB error
 *  - production  + no Supabase         : blocks with 503 (misconfigured deploy)
 *  - development + no Supabase         : warns and passes through (dev ergonomics)
 *  - development + Supabase configured : always validates against DB
 */
export async function legalShieldMiddleware(req: Request, res: Response, next: NextFunction) {
    const stellarAddress = req.headers['x-stellar-account'];

    if (!stellarAddress || typeof stellarAddress !== 'string') {
        return res.status(403).json({
            error: 'Forbidden: Legal Consent Required (Missing x-stellar-account header)',
            code: 'LEGAL_CONSENT_MISSING',
            hint: 'Add the header x-stellar-account: G... to your request',
        });
    }

    // Dev bypass: if Supabase is not configured and we're not in production,
    // allow the request through with a warning rather than hard-blocking.
    if (!SUPABASE_AVAILABLE) {
        if (!IS_PRODUCTION) {
            console.warn(
                `[LegalShield] DEVELOPMENT BYPASS — Supabase not configured. ` +
                `Skipping TOS check for ${stellarAddress}. ` +
                `Set SUPABASE_URL + SUPABASE_ANON_KEY to enable enforcement.`
            );
            return next();
        }
        // In production with no Supabase: misconfiguration, block explicitly
        return res.status(503).json({
            error: 'Service Unavailable: Legal consent system not configured',
            code: 'LEGAL_SHIELD_UNAVAILABLE',
        });
    }

    try {
        // Query user_signatures table for a valid signature from this address
        const { data, error } = await supabase
            .from('user_signatures')
            .select('signature_hash, accepted_at')
            .eq('wallet_address', stellarAddress)
            .eq('network', 'stellar:testnet')
            .single();

        if (error || !data) {
            console.warn(`[Security Alert] Unauthorized access attempt by ${stellarAddress} - No legal signature found.`);
            return res.status(403).json({
                error: 'Forbidden: Legal Consent Required. Please sign the Terms of Service in the Dashboard.',
                address: stellarAddress,
                code: 'LEGAL_CONSENT_REQUIRED',
                hint: 'Sign the TOS at https://nirium.xyz/docs → Dashboard before calling /api/execute',
            });
        }

        // Signature found, proceed
        next();
    } catch (err) {
        console.error('[Security Error] Database failure during legal shield check:', err);
        if (IS_PRODUCTION) {
            // Fail closed in production — never allow execution if we can't verify consent
            res.status(500).json({ error: 'Internal Server Error: Security validation failed' });
        } else {
            // In development, a transient DB error should not block the entire workflow
            console.warn('[LegalShield] DB error in development — passing through. Fix your Supabase connection.');
            next();
        }
    }
}
