/**
 * Etherfuse client — thin wrapper around our server-side proxy at /api/etherfuse.
 *
 * The Etherfuse API key is server-only (ETHERFUSE_API_KEY). This file runs in the
 * browser and must NEVER hold the key directly. All requests go through the proxy.
 *
 * CETES on Stellar issuer: GC3CW7EDYRTWQ635VDIGY6S4ZUF5L6TQ7AA4MWS7LEQDBLUSZXV7UPS4
 */

export const CETES_ASSET = {
    code: 'CETES',
    name: 'Etherfuse CETES',
    issuer: 'GC3CW7EDYRTWQ635VDIGY6S4ZUF5L6TQ7AA4MWS7LEQDBLUSZXV7UPS4',
    description: 'Mexican Federal Treasury Certificates — short-term government bonds tokenized by Etherfuse.',
} as const;

interface GenerateOnboardingUrlParams {
    customerId: string;
    bankAccountId: string;
    publicKey: string;
    blockchain: 'stellar' | 'solana' | 'base' | 'polygon' | 'monad';
}

interface EtherfuseApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

export async function generateOnboardingUrl(
    params: GenerateOnboardingUrlParams
): Promise<EtherfuseApiResponse<{ url: string; expiresAt: string }>> {
    try {
        const response = await fetch('/api/etherfuse', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'onboarding',
                walletAddress: params.publicKey,
                customerId: params.customerId,
                bankAccountId: params.bankAccountId,
            }),
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            return { success: false, error: data?.error || `HTTP ${response.status}` };
        }

        return {
            success: true,
            data: {
                url: data.presigned_url || data.url,
                expiresAt: data.expires_at || new Date(Date.now() + 15 * 60 * 1000).toISOString(),
            },
        };
    } catch (err) {
        return {
            success: false,
            error: err instanceof Error ? err.message : 'Failed to generate onboarding URL',
        };
    }
}

export function getOrCreateCustomerIds(walletAddress: string): {
    customerId: string;
    bankAccountId: string;
} {
    const storageKey = `nirium-etherfuse-customer-${walletAddress}`;

    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch { /* regenerate */ }
        }
    }

    const ids = {
        customerId: crypto.randomUUID(),
        bankAccountId: crypto.randomUUID(),
    };

    if (typeof window !== 'undefined') {
        localStorage.setItem(storageKey, JSON.stringify(ids));
    }

    return ids;
}
