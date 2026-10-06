import { NextResponse } from 'next/server';
import crypto from 'crypto';

const API_KEY = process.env.ETHERFUSE_API_KEY || '';
const BASE_URL = process.env.ETHERFUSE_API_URL || 'https://api.sand.etherfuse.com';
const headers = {
    'Authorization': API_KEY,
    'Content-Type': 'application/json'
};

// Per Etherfuse docs: customerId in quotes = org's own UUID (not a customer UUID)
let ORG_ID: string | null = null;
async function getOrgId(): Promise<string> {
    if (ORG_ID) return ORG_ID;
    const res = await fetch(`${BASE_URL}/ramp/me`, { headers });
    const data = await res.json();
    ORG_ID = data.id;
    return ORG_ID as string;
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': '*',
        },
    });
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { action } = body;

        // ── ONBOARDING ─────────────────────────────────────────────────────
        if (action === 'onboarding') {
            const { walletAddress } = body;
            const customerId = body.customerId || crypto.randomUUID();
            const bankAccountId = body.bankAccountId || crypto.randomUUID();

            const res = await fetch(`${BASE_URL}/ramp/onboarding-url`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ customerId, bankAccountId, publicKey: walletAddress, blockchain: 'stellar' })
            });

            const text = await res.text();
            let data: any;
            try { data = JSON.parse(text); } catch { data = text; }

            if (res.status === 409) {
                return NextResponse.json({
                    customerId,
                    bankAccountId,
                    alreadyRegistered: true,
                    presigned_url: data?.presigned_url || null,
                    kycDashboard: 'https://devnet.etherfuse.com'
                });
            }

            if (!res.ok) {
                console.error('[etherfuse] onboarding failed:', res.status, data);
                return NextResponse.json({ error: 'Onboarding failed', details: data }, { status: res.status });
            }

            return NextResponse.json({ ...data, customerId, bankAccountId });
        }

        // ── QUOTE ──────────────────────────────────────────────────────────
        if (action === 'quote') {
            const { amount, walletAddress, bondId = 'CETES', fiat = 'MXN' } = body;
            const quoteId = crypto.randomUUID();
            // Per Etherfuse docs: customerId = org UUID
            const customerId = await getOrgId();

            const quoteBody = {
                quoteId,
                customerId,
                blockchain: 'stellar',
                quoteAssets: {
                    type: 'onramp',
                    sourceAsset: fiat,
                    targetAsset: bondId === 'CETES' 
                        ? 'CETES:GC3CW7EDYRTWQ635VDIGY6S4ZUF5L6TQ7AA4MWS7LEQDBLUSZXV7UPS4' 
                        : bondId
                },
                sourceAmount: String(amount),
                walletAddress,
            };

            const res = await fetch(`${BASE_URL}/ramp/quote`, {
                method: 'POST',
                headers,
                body: JSON.stringify(quoteBody)
            });

            const text = await res.text();
            let data: any;
            try { data = JSON.parse(text); } catch { data = text; }

            if (!res.ok) {
                console.error('[etherfuse] quote failed:', res.status, data);
                return NextResponse.json({ error: 'Quote failed', details: data, status: res.status }, { status: res.status });
            }

            return NextResponse.json({ ...data, quoteId, customerId });
        }

        // ── ORDER ──────────────────────────────────────────────────────────
        if (action === 'order') {
            const { quoteId, walletAddress } = body;
            const orgId = await getOrgId();
            const orderId = crypto.randomUUID();

            // Register wallet under org → get walletId (409 = already exists, fetch from list)
            const walletRes = await fetch(`${BASE_URL}/ramp/wallet`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ customerId: orgId, publicKey: walletAddress, blockchain: 'stellar' })
            });
            const walletData = await walletRes.json().catch(() => ({})) as any;
            let cryptoWalletId = walletData?.walletId || walletData?.id || walletData?.cryptoWalletId;

            if (!cryptoWalletId) {
                // 409 or missing id — fetch existing wallets and match by publicKey
                const listRes = await fetch(`${BASE_URL}/ramp/wallets?customerId=${orgId}&limit=50`, { headers });
                const listData = await listRes.json().catch(() => ({})) as any;
                const wallets = listData?.items || listData?.wallets || [];
                const found = wallets.find((w: any) =>
                    w.publicKey === walletAddress || w.address === walletAddress || w.walletAddress === walletAddress
                );
                cryptoWalletId = found?.walletId || found?.id || found?.cryptoWalletId;
                console.log('[etherfuse] wallet lookup:', { found, cryptoWalletId });
            }

            // Get first active bank account for the org
            const bankRes = await fetch(`${BASE_URL}/ramp/bank-accounts?limit=1`, { headers });
            const bankData = await bankRes.json().catch(() => ({})) as any;
            const bankAccountId = bankData?.items?.[0]?.bankAccountId || bankData?.items?.[0]?.id;

            if (!cryptoWalletId) {
                return NextResponse.json({ error: 'Could not resolve walletId for this address' }, { status: 400 });
            }

            console.log('[etherfuse] order payload:', { orderId, quoteId, cryptoWalletId, bankAccountId });

            const res = await fetch(`${BASE_URL}/ramp/order`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ orderId, quoteId, cryptoWalletId, bankAccountId })
            });

            const text = await res.text();
            let data: any;
            try { data = JSON.parse(text); } catch { data = text; }

            if (!res.ok) {
                console.error('[etherfuse] order failed:', res.status, JSON.stringify(data));
                // 409 = quoteId already used — tell the client to re-quote
                if (res.status === 409) {
                    return NextResponse.json({ error: 'Quote expired or already used. Please generate a new quote.', code: 'QUOTE_EXPIRED' }, { status: 409 });
                }
                return NextResponse.json({ error: typeof data?.message === 'string' ? data.message : 'Order failed', details: data }, { status: res.status });
            }

            return NextResponse.json({ ...data, orderId });
        }

        // ── SIMULATE FIAT ──────────────────────────────────────────────────
        if (action === 'simulate_fiat') {
            const { orderId } = body;
            const res = await fetch(`${BASE_URL}/ramp/order/fiat_received`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ orderId })
            });
            if (!res.ok) {
                const err = await res.text();
                return NextResponse.json({ error: err }, { status: res.status });
            }
            return NextResponse.json({ success: true });
        }

        // ── DEBUG: LIST ORDERS ─────────────────────────────────────────────
        if (action === 'list_orders') {
            const res = await fetch(`${BASE_URL}/ramp/orders?limit=10`, { headers });
            const data = await res.json().catch(() => ({}));
            return NextResponse.json(data);
        }

        // Live price/TVL for the reference card on /ramp. Public endpoint, no
        // auth needed — but it MUST hit the same BASE_URL (sandbox today) the
        // rest of this route uses, not the production API: sandbox and
        // production report genuinely different numbers (verified live,
        // 26-ago-2026 — sandbox CETES price 1.142034 / TVL ~734M vs.
        // production 1.178212 / TVL ~87.9M), and quoting production while
        // orders execute against sandbox would just trade one mismatch for
        // another. Replaces a hardcoded snapshot that had drifted from both.
        if (action === 'lookup') {
            const { bondId = 'CETES' } = body;
            const res = await fetch(`${BASE_URL}/lookup/stablebonds`);
            const data = await res.json().catch(() => ({}));
            const bond = (data.stablebonds || []).find((b: any) => b.symbol === bondId);
            if (!bond) return NextResponse.json({ error: 'Bond not found in lookup response' }, { status: 502 });
            return NextResponse.json({
                symbol: bond.symbol,
                tokenPriceDecimal: bond.tokenPriceDecimal,
                netValueDecimal: bond.netValueDecimal,
                bondCurrency: bond.bondCurrency,
                calculatedAt: data.calculatedAt,
            });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
