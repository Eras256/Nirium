import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { z } from 'zod';

// ========================================
// VALIDATION SCHEMA
// ========================================
const SandboxRequestSchema = z.object({
    companyName: z.string()
        .min(2, 'Company name must be at least 2 characters')
        .max(100, 'Company name must be less than 100 characters')
        .regex(/^[a-zA-Z0-9\s\.\-,&]+$/, 'Invalid company name format'),
    contactEmail: z.string()
        .email('Invalid email format')
        .toLowerCase(),
    walletAddress: z.string()
        .regex(/^G[A-Z0-9]{55}$/, 'Invalid Stellar wallet address'),
    tier: z.enum(['sandbox']).default('sandbox'),
    message: z.string().optional()
});

// ========================================
// RATE LIMITING (Simple in-memory)
// For production, use Redis/Upstash
// ========================================
const requestCounts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(identifier: string, limit: number = 5, windowMs: number = 15 * 60 * 1000): boolean {
    const now = Date.now();
    const record = requestCounts.get(identifier);

    if (!record || now > record.resetAt) {
        requestCounts.set(identifier, { count: 1, resetAt: now + windowMs });
        return true;
    }

    if (record.count >= limit) {
        return false;
    }

    record.count++;
    return true;
}

// ========================================
// MAIN HANDLER
// ========================================
export async function POST(request: Request) {
    try {
        // 1. Parse and validate input
        const body = await request.json();
        const validatedData = SandboxRequestSchema.parse(body);

        // 2. Rate limiting by email (5 requests per 15 minutes)
        const rateLimitKey = validatedData.contactEmail;
        if (!checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000)) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Rate limit exceeded',
                    message: 'Too many sandbox requests. Please try again in 15 minutes.'
                },
                { status: 429 }
            );
        }

        // 3. Initialize Supabase
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            console.error('[Sandbox] Supabase not configured');
            return NextResponse.json(
                { success: false, error: 'Service configuration error' },
                { status: 500 }
            );
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // 4. Check if wallet already has active sandbox
        const { data: existingAccount } = await supabase
            .from('sandbox_accounts')
            .select('id, is_active, expires_at')
            .eq('wallet_address', validatedData.walletAddress)
            .eq('is_active', true)
            .single();

        if (existingAccount) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Account already exists',
                    message: 'This wallet already has an active sandbox account.',
                    existingAccount: {
                        expiresAt: existingAccount.expires_at
                    }
                },
                { status: 409 }
            );
        }

        // 5. Generate API Key — sandbox tier only (institutional/enterprise require manual provisioning)
        const apiKey = `sk_sbox_${crypto.randomBytes(32).toString('hex')}`;
        const apiKeyHash = crypto.createHash('sha256').update(apiKey).digest('hex');

        // 6. Sandbox tier quotas
        const quotas = {
            requestsPerMinute: 60,
            requestsPerDay: 1000,
            maxStrategiesPerDay: 100
        };

        // 7. Set expiration (90 days)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 90);

        // 8. Create sandbox account
        const accountId = crypto.randomUUID();
        const { error: insertError } = await supabase
            .from('sandbox_accounts')
            .insert({
                id: accountId,
                company_name: validatedData.companyName,
                contact_email: validatedData.contactEmail,
                wallet_address: validatedData.walletAddress,
                api_key_hash: apiKeyHash,
                tier: validatedData.tier,
                quotas: quotas,
                is_active: true,
                expires_at: expiresAt.toISOString(),
                created_at: new Date().toISOString()
            });

        if (insertError) {
            console.error('[Sandbox] Database insert error:', insertError);
            return NextResponse.json(
                { success: false, error: 'Failed to create account' },
                { status: 500 }
            );
        }

        // 9. Log security event
        console.log('[SECURITY] Sandbox account created', {
            accountId,
            email: validatedData.contactEmail,
            wallet: validatedData.walletAddress,
            tier: validatedData.tier,
            timestamp: new Date().toISOString()
        });

        // 10. Return response (API key shown only once)
        return NextResponse.json(
            {
                success: true,
                message: 'Sandbox account provisioned successfully',
                account: {
                    id: accountId,
                    apiKey: apiKey, // ⚠️ ONLY SHOWN ONCE
                    tier: validatedData.tier,
                    quotas,
                    expiresAt: expiresAt.toISOString(),
                    companyName: validatedData.companyName,
                    contactEmail: validatedData.contactEmail,
                    walletAddress: validatedData.walletAddress,
                    createdAt: new Date().toISOString()
                },
                warning: '⚠️ Save your API key now. It will not be shown again.'
            },
            { status: 200 }
        );

    } catch (error: any) {
        // Zod validation errors
        if (error.name === 'ZodError') {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Validation error',
                    details: error.errors
                },
                { status: 400 }
            );
        }

        console.error('[Sandbox] Unexpected error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// ========================================
// INFO ENDPOINT (Public)
// ========================================
export async function GET() {
    return NextResponse.json({
        name: 'Nirium Sandbox Program',
        description: 'Testnet sandbox accounts for developers. Institutional/enterprise access requires manual approval — contact niriumprotocol@gmail.com.',
        tiers: {
            sandbox: {
                requestsPerMinute: 60,
                requestsPerDay: 1000,
                maxStrategiesPerDay: 100,
                duration: '90 days',
                provisioning: 'self-serve'
            },
            institutional: {
                requestsPerMinute: 300,
                requestsPerDay: 10000,
                maxStrategiesPerDay: 500,
                provisioning: 'manual — contact niriumprotocol@gmail.com'
            },
            enterprise: {
                requestsPerMinute: 1000,
                requestsPerDay: 'unlimited',
                provisioning: 'manual — contact niriumprotocol@gmail.com'
            }
        },
        features: [
            'Full API access on Stellar Testnet',
            'Real-time market data',
            'Strategy execution',
            'WebSocket subscriptions',
            'Webhook integrations'
        ],
        network: 'testnet',
        documentation: 'https://docs.nirium.xyz'
    });
}
