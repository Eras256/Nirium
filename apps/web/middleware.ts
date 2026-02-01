import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const response = NextResponse.next()

    // Security Headers - Esenciales para la seguridad de la dApp
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

    return response
}

export const config = {
    matcher: [
        /*
         * Optimización para Vercel Edge:
         * Ignora rutas de la API, archivos estáticos de Next.js, 
         * optimización de imágenes y cualquier archivo con extensión (imágenes, fuentes, etc.)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|csv|txt|woff|woff2|css|js)$).*)',
    ],
}
