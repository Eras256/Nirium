import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/api/'],
            },
            {
                userAgent: ['GPTBot', 'ChatGPT-User', 'Google-Extended', 'Claude-Web', 'anthropic-ai', 'PerplexityBot', 'Omgili', 'OAI-SearchBot'],
                allow: ['/', '/docs', '/strategies'],
                disallow: ['/api/'],
            }
        ],
        sitemap: 'https://nirium.xyz/sitemap.xml',
    };
}
