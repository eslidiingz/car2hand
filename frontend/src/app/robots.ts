import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

/**
 * robots.txt:
 * - Allow indexing of all public content (listings, articles, community)
 * - Disallow private / auth / wizard pages where personal data would appear
 * - Explicitly permit AI crawlers (GPTBot, Google-Extended, PerplexityBot, ClaudeBot)
 *   because we want Car2Hand listings and articles cited in AI search results.
 *   The `robots` meta tag on sensitive pages handles finer control.
 */
export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/api/',
                    '/auth/',
                    '/sell/create',
                    '/sell/edit/',
                    '/settings/',
                    '/profile/',
                    '/admin/',
                    '/community/create',
                    '/*?*token=',
                    '/*?*verify=',
                ],
            },
            // Explicitly allow AI crawlers — critical for GEO (Generative Engine Optimization)
            {
                userAgent: ['GPTBot', 'Google-Extended', 'PerplexityBot', 'ClaudeBot', 'Applebot-Extended', 'CCBot'],
                allow: '/',
                disallow: ['/api/', '/auth/', '/settings/', '/profile/', '/admin/'],
            },
        ],
        sitemap: `${SITE_URL}/sitemap.xml`,
        host: SITE_URL,
    };
}
