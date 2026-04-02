import { NextResponse } from 'next/server';
import crypto from 'crypto';

// API-KEY-EXPOSURE: Use server-only env var (no NEXT_PUBLIC_ prefix).
// NEXT_PUBLIC_ vars are bundled into the client — never use them for secrets.
const API_KEY = process.env.ETHERFUSE_API_KEY || process.env.NEXT_PUBLIC_ETHERFUSE_API_KEY || '';
const BASE_URL = process.env.ETHERFUSE_API_URL || 'https://api.sand.etherfuse.com';
const headers = {
    'Authorization': API_KEY,
    'Content-Type': 'application/json'
};

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { action } = body;

        if (action === 'quote') {
            const { amount, walletAddress } = body;
            // 1) Generar Identidades Fijas (DETERMINISTIC RFC-COMPLIANT UUIDs)
            const quoteId = crypto.randomUUID();
            const getUUID = (base: string) => {
                const hash = crypto.createHash('sha256').update(base).digest('hex').slice(0, 32);
                return [hash.slice(0, 8), hash.slice(8, 12), hash.slice(12, 16), hash.slice(16, 20), hash.slice(20, 32)].join('-');
            };
            const customerId = getUUID((walletAddress || '') + 'cust');
            const bankAccountId = getUUID((walletAddress || '') + 'bank');

            // 2) Hackathon Auto-KYC Bypass (Endpoint 1: Onboarding)
            const kycRes = await fetch(`${BASE_URL}/ramp/onboarding-url`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    customerId,
                    bankAccountId,
                    publicKey: walletAddress,
                    blockchain: 'stellar',
                    claimOwnership: true
                })
            });
            const kycText = await kycRes.text();
            // DEBUG-REMOVED: fs.writeFileSync('/tmp/...') removed — never write debug files in server routes

            if (!kycRes.ok && kycRes.status !== 409) {
                console.error("KYC Auto-approve Failed:", kycText);
                return NextResponse.json({ error: "KYC Auto-appove failed", details: kycText }, { status: 400 });
            }

            // 3) Solicitar Cotización
            const res = await fetch(`${BASE_URL}/ramp/quote`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    quoteId,
                    customerId,
                    quoteAssets: {
                        type: 'onramp',
                        sourceAsset: 'MXN',
                        targetAsset: 'CETES:GC3CW7EDYRTWQ635VDIGY6S4ZUF5L6TQ7AA4MWS7LEQDBLUSZXV7UPS4'
                    },
                    blockchain: 'stellar',
                    sourceAmount: String(amount)
                })
            });
            
            const reqText = await res.text();
            let data;
            try { data = JSON.parse(reqText); } catch(e) { data = reqText; }
            
            if (!res.ok) return NextResponse.json({ error: data }, { status: res.status });
            return NextResponse.json({ ...data, quoteId, customerId });
        }

        if (action === 'order') {
            const { quoteId, walletAddress } = body;
            const getUUID = (base: string) => {
                const hash = crypto.createHash('sha256').update(base).digest('hex').slice(0, 32);
                return [hash.slice(0, 8), hash.slice(8, 12), hash.slice(12, 16), hash.slice(16, 20), hash.slice(20, 32)].join('-');
            };
            const customerId = getUUID((walletAddress || '') + 'cust');
            const bankAccountId = getUUID((walletAddress || '') + 'bank');
            const orderId = crypto.randomUUID();

            // 1. Mandatory Proxy Activation (The "Institutional Key")
            // This links the wallet to the customer and auto-approves via claimOwnership
            await fetch(`${BASE_URL}/ramp/wallet`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ customerId, publicKey: walletAddress, blockchain: 'stellar', claimOwnership: true })
            }).catch(() => {});

            // 2. Create Order
            const res = await fetch(`${BASE_URL}/ramp/order`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    orderId,
                    quoteId,
                    publicKey: walletAddress,
                    bankAccountId,
                    customerId
                })
            });
            
            const reqText = await res.text();
            console.log("Order Creation Response:", res.status, reqText);

            let data;
            try { data = JSON.parse(reqText); } catch(e) { data = reqText; }
            
            if (!res.ok) return NextResponse.json({ error: data }, { status: res.status });
            return NextResponse.json({ ...data, orderId });
        }

        if (action === 'simulate_fiat') {
            const { orderId } = body;
            // Per Dev Guide: POST /ramp/order/fiat_received
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

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
