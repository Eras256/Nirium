import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://nirium.xyz';

    // 21-ago-2026: barrido de páginas huérfanas. /strategies, /leaderboard y
    // /plugins ya no existen (404 real, verificado en vivo) -- quedaron de una
    // versión anterior del sitio. /pollar-adapter-documentation (link directo
    // para el equipo de Pollar, no para indexar) y /labs/experimental
    // (experimental, vive detrás del CTA de /agents) se dejan fuera a propósito.
    const staticRoutes = [
        '',
        '/dashboard',
        '/docs',
        '/marketplace',
        '/agents',
        '/analytics',
        '/sandbox',
        '/manifesto',
        '/privacy',
        '/terms',
        '/risk-disclosure',
        '/how-to-use',
        '/build',
        '/blog',
        '/compliance',
        '/coc',
        '/developers',
        '/disclaimers',
        '/keys',
        '/payouts',
        '/pricing',
        '/ramp',
        '/security',
        '/treasury',
        '/treasury/builder',
        '/treasury/vault',
    ].map((route) => {
        const changeFrequency: "daily" | "weekly" = route === '' || route === '/dashboard' || route === '/docs' ? 'daily' : 'weekly';
        return {
            url: `${baseUrl}${route}`,
            lastModified: new Date(),
            changeFrequency,
            priority: route === '' ? 1 : 0.8,
        };
    });

    return [...staticRoutes];
}
