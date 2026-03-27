import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

/**
 * GET /api/sandbox/status
 *
 * Returns the status of a sandbox account including quotas and usage.
 * Requires x-api-key header for authentication.
 */
export async function GET(request: Request) {
    try {
        // 1. Extract API key from header
        const apiKey = request.headers.get('x-api-key');

        if (!apiKey) {
            return NextResponse.json(
                { error: 'Missing API key. Use x-api-key header.' },
                { status: 401 }
            );
        }

        // 2. Hash the provided API key
        const apiKeyHash = crypto.createHash('sha256').update(apiKey).digest('hex');

        // 3. Initialize Supabase
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            return NextResponse.json(
                { error: 'Service configuration error' },
                { status: 500 }
            );
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // 4. Find account by API key hash
        const { data: account, error } = await supabase
            .from('sandbox_accounts')
            .select('*')
            .eq('api_key_hash', apiKeyHash)
            .single();

        if (error || !account) {
            console.log('[SECURITY] Invalid API key attempt');
            return NextResponse.json(
                { error: 'Invalid API key' },
                { status: 401 }
            );
        }

        // 5. Check if account is active
        if (!account.is_active) {
            return NextResponse.json(
                { error: 'Account is inactive' },
                { status: 403 }
            );
        }

        // 6. Check if account is expired
        const now = new Date();
        const expiresAt = new Date(account.expires_at);
        if (now > expiresAt) {
            return NextResponse.json(
                {
                    error: 'Account has expired',
                    expiresAt: account.expires_at
                },
                { status: 403 }
            );
        }

        // 7. Get usage statistics (if you have a usage tracking table)
        // For now, returning mock data - implement actual tracking
        const usage = {
            totalRequests: 0,
            dailyRequests: 0,
            lastReset: new Date().toISOString(),
            remainingToday: account.quotas?.requestsPerDay || 1000
        };

        // 8. Return status
        return NextResponse.json({
            success: true,
            account: {
                id: account.id,
                tier: account.tier,
                companyName: account.company_name,
                walletAddress: account.wallet_address,
                isActive: account.is_active,
                createdAt: account.created_at,
                expiresAt: account.expires_at,
                daysRemaining: Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
            },
            quotas: account.quotas,
            usage
        });

    } catch (error) {
        console.error('[Sandbox Status] Error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
