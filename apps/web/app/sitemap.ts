import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://nirium.xyz';

    const staticRoutes = [
        '',
        '/dashboard',
        '/docs',
        '/strategies',
        '/marketplace',
        '/leaderboard',
        '/plugins',
        '/agents',
        '/analytics',
        '/sandbox',
        '/manifesto',
        '/privacy',
        '/terms',
        '/risk-disclosure',
        '/how-to-use'
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
