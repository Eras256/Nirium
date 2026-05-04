import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const response = NextResponse.next()

    // ═══ Security Headers — OWASP API8:2023 Compliance ═══

    // Clickjacking protection
    response.headers.set('X-Frame-Options', 'DENY')

    // MIME sniffing prevention
    response.headers.set('X-Content-Type-Options', 'nosniff')

    // Referrer leakage prevention
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

    // HSTS — Force HTTPS for 1 year, include subdomains, enable preload
    response.headers.set(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains; preload'
    )

    // Content Security Policy — Strict policy with necessary exceptions
    response.headers.set(
        'Content-Security-Policy',
        [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://va.vercel-scripts.com",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com data:",
            "img-src 'self' data: blob: https://*.nirium.xyz https://gateway.pinata.cloud https://stellar.expert https://horizon-testnet.stellar.org https://fonts.gstatic.com https://grainy-gradients.vercel.app https://api.web3modal.org https://api.sand.etherfuse.com",
            "connect-src 'self' https://*.nirium.xyz https://horizon-testnet.stellar.org https://soroban-testnet.stellar.org wss://relay.walletconnect.com wss://relay.walletconnect.org https://rpc.walletconnect.com https://api.web3modal.com https://api.web3modal.org https://api.coingecko.com https://vercel.live https://va.vercel-scripts.com https://*.supabase.co wss://*.supabase.co https://api.sand.etherfuse.com https://pulse.walletconnect.org",
            "frame-src 'self' https://verify.walletconnect.com https://verify.walletconnect.org",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "frame-ancestors 'none'",
        ].join('; ')
    )

    // Permissions Policy — Restrict browser features
    response.headers.set(
        'Permissions-Policy',
        'camera=(), microphone=(), geolocation=(), interest-cohort=()'
    )

    return response
}

export const config = {
    matcher: [
        /*
         * Vercel Edge optimization:
         * Skip API routes, Next.js static files,
         * image optimization routes, and any file with a static extension (images, fonts, etc.)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|csv|txt|woff|woff2|css|js)$).*)',
    ],
}
