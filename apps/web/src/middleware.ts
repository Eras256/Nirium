import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Configuration for x402 protected routes
const PROTECTED_ROUTES = ['/api/neural-compute', '/api/data-access'];
const MIN_PAYMENT_AMOUNT = '5.0';
const PAYMENT_TOKEN = 'USDC'; // In a real app, this would be the Contract ID
const RECEIVER_ADDRESS = 'G-NIRIUM-VAULT-EXAMPLE-ADDRESS'; // Placeholder

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check if the route requires x402 payment
    if (PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
        const authHeader = request.headers.get('Authorization');

        // Scenario 1: No Payment Proof provided
        if (!authHeader || !authHeader.startsWith('x402 ')) {
            return new NextResponse(
                JSON.stringify({ error: 'Payment Required' }),
                {
                    status: 402,
                    headers: {
                        'Content-Type': 'application/json',
                        'WWW-Authenticate': 'x402',
                        'x402-chain': 'stellar',
                        'x402-token': PAYMENT_TOKEN,
                        'x402-amount': MIN_PAYMENT_AMOUNT,
                        'x402-destination': RECEIVER_ADDRESS,
                        'x402-memo': 'service-access-' + Date.now(), // Unique memo for tracking
                    },
                }
            );
        }

        // Scenario 2: Payment Proof provided (Validation)
        const proof = authHeader.split(' ')[1];

        // In a real production environment, you would:
        // 1. Verify the transaction hash on-chain (using Horizon/Soroban RPC)
        // 2. Check if the payment amount and destination match
        // 3. Verify the transaction exists and is successful

        // For this demo/development, we'll accept a mock proof format or any long string
        if (proof === 'mock-proof' || proof.length > 20) {
            // Valid payment - Allow request to proceed
            const response = NextResponse.next();
            response.headers.set('x-payment-verified', 'true');
            return response;
        } else {
            // Invalid proof
            return new NextResponse(
                JSON.stringify({ error: 'Invalid Payment Proof' }),
                { status: 403, headers: { 'Content-Type': 'application/json' } }
            );
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/api/:path*',
};
