import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// ═══ Jurisdicciones prohibidas — Tier A de la política ═══
//
// Política completa: /legal/restricted-jurisdictions-v1.md
//
// Sanciones comprensivas (OFAC, espejadas por UE/ONU) + FATF call-for-action +
// China continental, que va por una razón distinta: el aviso del PBoC del
// 15-sep-2021 declara ilegal que un proveedor OFFSHORE atienda a residentes de
// China continental. Esa es la única de la lista con alcance extraterritorial
// explícito sobre nosotros. HK/MO/TW no están incluidos, a propósito.
//
// Esto NO pretende ser infalible: una VPN lo salta. El valor es doble — evitar
// la operación por accidente, y demostrar diligencia. La protección jurídica
// real la da la declaración del usuario (§6 de la política); esto es el letrero
// en la puerta, no la cerradura.
const BLOCKED_COUNTRIES = new Set([
    'CU', 'IR', 'KP', 'SY',        // sanciones comprensivas OFAC
    'AF', 'MM',                     // FATF call-for-action / alto riesgo
    'RU', 'BY',                     // restricción prudencial, en revisión
    'CN',                           // PBoC 2021 — alcance extraterritorial
])

// Rutas que siguen abiertas desde cualquier lugar: nadie queda sin poder LEER
// las reglas que lo excluyen, ni sin poder verificar la evidencia pública.
const ALWAYS_ALLOWED = /^\/(legal|terms|privacy|disclaimers|risk-disclosure|coc|compliance|_next|favicon|robots|sitemap|blocked)/

export function middleware(request: NextRequest) {
    const country = request.headers.get('x-vercel-ip-country') || ''
    const path = request.nextUrl.pathname

    if (BLOCKED_COUNTRIES.has(country) && !ALWAYS_ALLOWED.test(path)) {
        // Las rutas /api son la operación de verdad: construir una corrida de
        // payouts o desplegar una bóveda pasa por aquí, no por la UI. Bloquear
        // la pantalla y dejar el API abierto es poner reja en la puerta y
        // ninguna en la ventana. Devuelven JSON — un rewrite a HTML rompería
        // al cliente sin decirle por qué.
        if (path.startsWith('/api')) {
            return NextResponse.json(
                {
                    error: 'unavailable_for_legal_reasons',
                    message: 'Nirium does not offer its services in your jurisdiction.',
                    jurisdiction: country,
                    policy: 'https://nirium.xyz/legal/restricted-jurisdictions-v1.md',
                    contact: 'niriumprotocol@gmail.com',
                },
                { status: 451, headers: { 'X-Restricted-Jurisdiction': country } },
            )
        }

        const url = request.nextUrl.clone()
        url.pathname = '/blocked'
        url.search = `?c=${encodeURIComponent(country)}`
        const blocked = NextResponse.rewrite(url, { status: 451 })
        blocked.headers.set('X-Restricted-Jurisdiction', country)
        blocked.headers.set('Link', '</legal/restricted-jurisdictions-v1.md>; rel="terms-of-service"')
        return blocked
    }

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
            // stellar.creit.tech / herewallet / onekey-asset: iconos de las wallets
            // del modal de Stellar Wallets Kit. sdk.api.pollar.xyz + pollar.xyz:
            // el logo de nuestra app y el de Pollar dentro de SU modal de login.
            // Sin estos hosts, los tres modales salen con imágenes rotas.
            "img-src 'self' data: blob: https://*.nirium.xyz https://gateway.pinata.cloud https://stellar.expert https://horizon-testnet.stellar.org https://fonts.gstatic.com https://grainy-gradients.vercel.app https://api.web3modal.org https://api.sand.etherfuse.com https://stellar.creit.tech https://storage.herewallet.app https://uni.onekey-asset.com https://sdk.api.pollar.xyz https://pollar.xyz https://*.pollar.xyz",
            // OJO: vercel.json también emite un CSP — el browser aplica la INTERSECCIÓN
            // de ambos. Mantener las dos listas de connect-src idénticas.
            "connect-src 'self' https://*.nirium.xyz https://nirium-agent.fly.dev wss://nirium-agent.fly.dev https://nirium-agent-mainnet.fly.dev https://horizon-testnet.stellar.org https://soroban-testnet.stellar.org https://horizon.stellar.org https://soroban-rpc.mainnet.stellar.gateway.fm wss://relay.walletconnect.com wss://relay.walletconnect.org https://rpc.walletconnect.com https://api.web3modal.com https://api.web3modal.org https://api.coingecko.com https://vercel.live https://va.vercel-scripts.com https://*.supabase.co wss://*.supabase.co https://api.sand.etherfuse.com https://pulse.walletconnect.org https://sdk.api.pollar.xyz",
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
         * Vercel Edge optimization: skip Next.js static files, image
         * optimization, and anything with a static extension.
         *
         * `api` ya NO se excluye. Se excluía por costo de edge, y mientras el
         * middleware solo ponía headers eso daba igual (los headers los pone
         * vercel.json de todas formas). Ahora decide jurisdicción, y las rutas
         * operativas —construir una corrida de payouts, desplegar una bóveda—
         * viven justamente en /api. Excluirlas dejaba la restricción como
         * cosmética: bastaba con llamar al endpoint sin abrir la página.
         */
        '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|csv|txt|woff|woff2|css|js)$).*)',
    ],
}
