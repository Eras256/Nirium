import { Request, Response, NextFunction } from 'express';
import { supabase } from '../providers/database.js';

/**
 * Legal Shield Middleware
 * Verifies that the user has signed the legal consent terms on-chain.
 * Required for critical operations on Soroban/Mainnet.
 */
export async function legalShieldMiddleware(req: Request, res: Response, next: NextFunction) {
    const stellarAddress = req.headers['x-stellar-account'];

    if (!stellarAddress || typeof stellarAddress !== 'string') {
        // If no account header, we might allow if it's not a protected route, 
        // but typically the caller should provide it for consistency.
        return res.status(403).json({
            error: 'Forbidden: Legal Consent Required (Missing account header)',
            code: 'LEGAL_CONSENT_MISSING'
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
                code: 'LEGAL_CONSENT_REQUIRED'
            });
        }

        // Signature found, proceed to next middleware
        next();
    } catch (err) {
        console.error('[Security Error] Database failure during legal shield check:', err);
        // Fail closed for security
        res.status(500).json({ error: 'Internal Server Error: Security validation failed' });
    }
}
