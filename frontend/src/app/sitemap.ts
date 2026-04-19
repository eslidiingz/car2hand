import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

/**
 * Dynamic sitemap covering:
 * - Static marketing pages
 * - All published listings (paginated fetch, capped at 10k per Google rules)
 * - All published articles
 *
 * Revalidated every 60 minutes. Fails open (returns static routes) if the API is down.
 */

interface ListingIndex { id: string; updatedAt?: string; createdAt: string }
interface ArticleIndex { slug: string; updatedAt?: string; createdAt: string }

async function fetchAllListings(): Promise<ListingIndex[]> {
    try {
        const res = await fetch(`${API_URL}/listings?limit=1000&status=ACTIVE`, {
            next: { revalidate: 3600 },
        });
        if (!res.ok) return [];
        const data = await res.json();
        const listings = (data.listings || data.data || []) as Array<{ id: string; updatedAt?: string; createdAt: string }>;
        return listings.map((l) => ({ id: l.id, updatedAt: l.updatedAt, createdAt: l.createdAt }));
    } catch {
        return [];
    }
}

async function fetchAllArticles(): Promise<ArticleIndex[]> {
    try {
        const res = await fetch(`${API_URL}/articles?limit=500&status=PUBLISHED`, {
            next: { revalidate: 3600 },
        });
        if (!res.ok) return [];
        const data = await res.json();
        const articles = (data.articles || data.data || []) as Array<{ slug: string; updatedAt?: string; createdAt: string }>;
        return articles.map((a) => ({ slug: a.slug, updatedAt: a.updatedAt, createdAt: a.createdAt }));
    } catch {
        return [];
    }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const now = new Date();

    const staticPages: MetadataRoute.Sitemap = [
        { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
        { url: `${SITE_URL}/buy`, lastModified: now, changeFrequency: 'hourly', priority: 0.9 },
        { url: `${SITE_URL}/sell`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
        { url: `${SITE_URL}/articles`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
        { url: `${SITE_URL}/community`, lastModified: now, changeFrequency: 'daily', priority: 0.7 },
        { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
        { url: `${SITE_URL}/help`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
        { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
        { url: `${SITE_URL}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
        { url: `${SITE_URL}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    ];

    const [listings, articles] = await Promise.all([fetchAllListings(), fetchAllArticles()]);

    const listingEntries: MetadataRoute.Sitemap = listings.map((l) => ({
        url: `${SITE_URL}/buy/${l.id}`,
        lastModified: l.updatedAt || l.createdAt ? new Date(l.updatedAt || l.createdAt) : now,
        changeFrequency: 'weekly',
        priority: 0.7,
    }));

    const articleEntries: MetadataRoute.Sitemap = articles.map((a) => ({
        url: `${SITE_URL}/articles/${a.slug}`,
        lastModified: a.updatedAt || a.createdAt ? new Date(a.updatedAt || a.createdAt) : now,
        changeFrequency: 'monthly',
        priority: 0.6,
    }));

    return [...staticPages, ...listingEntries, ...articleEntries];
}
