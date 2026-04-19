import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ArticleClient, { type Article } from './ArticleClient';
import JsonLd from '@/components/JsonLd';
import {
    absoluteUrl,
    articleSchema,
    breadcrumbSchema,
    DEFAULT_OG_IMAGE,
    SITE_NAME,
    truncateDescription,
} from '@/lib/seo';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface ArticleResponse {
    success: boolean;
    article?: Article;
    message?: string;
}

interface RelatedResponse {
    success: boolean;
    articles?: Article[];
}

async function getArticle(slug: string): Promise<Article | null> {
    try {
        const res = await fetch(`${API_URL}/articles/${slug}`, {
            next: { revalidate: 300 },
        });
        if (!res.ok) return null;
        const data: ArticleResponse = await res.json();
        return data.success && data.article ? data.article : null;
    } catch (err) {
        console.error('Fetch article error:', err);
        return null;
    }
}

async function getRelated(slug: string): Promise<Article[]> {
    try {
        const res = await fetch(`${API_URL}/articles/${slug}/related?limit=5`, {
            next: { revalidate: 300 },
        });
        if (!res.ok) return [];
        const data: RelatedResponse = await res.json();
        return data.success && data.articles ? data.articles : [];
    } catch (err) {
        console.error('Fetch related error:', err);
        return [];
    }
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ articleId: string }>;
}): Promise<Metadata> {
    const { articleId: slug } = await params;
    const article = await getArticle(slug);
    const canonicalPath = `/articles/${slug}`;

    if (!article) {
        return {
            title: 'ไม่พบบทความ',
            robots: { index: false, follow: true },
            alternates: { canonical: canonicalPath },
        };
    }

    const description = truncateDescription(article.excerpt || article.content, 200);
    const images = article.featuredImage
        ? [{ url: article.featuredImage, alt: article.title }]
        : [{ url: DEFAULT_OG_IMAGE, alt: SITE_NAME }];

    const keywords = [
        ...(article.tags || []),
        article.category?.name,
        'รถมือสอง',
        'Car2Hand',
    ].filter(Boolean) as string[];

    return {
        title: article.title,
        description,
        keywords,
        authors: article.author?.fullName ? [{ name: article.author.fullName }] : undefined,
        alternates: { canonical: canonicalPath },
        openGraph: {
            type: 'article',
            locale: 'th_TH',
            url: absoluteUrl(canonicalPath),
            title: article.title,
            description,
            images,
            publishedTime: article.createdAt,
            modifiedTime: article.updatedAt || article.createdAt,
            authors: article.author?.fullName ? [article.author.fullName] : undefined,
            section: article.category?.name,
            tags: article.tags,
        },
        twitter: {
            card: 'summary_large_image',
            title: article.title,
            description,
            images: images.map((i) => i.url),
        },
    };
}

export default async function ArticlePage({
    params,
}: {
    params: Promise<{ articleId: string }>;
}) {
    const { articleId: slug } = await params;
    const [article, relatedArticles] = await Promise.all([
        getArticle(slug),
        getRelated(slug),
    ]);

    if (!article) {
        notFound();
    }

    // Schema.org: Article + Breadcrumb — for Google rich results + GEO (AI citations)
    const articleLd = articleSchema(
        {
            title: article.title,
            slug: article.slug,
            excerpt: article.excerpt,
            content: article.content,
            featuredImage: article.featuredImage,
            author: article.author,
            category: article.category,
            tags: article.tags,
            viewCount: article.viewCount,
            createdAt: article.createdAt,
            updatedAt: article.updatedAt,
        },
        `/articles/${slug}`,
    );

    const breadcrumb = breadcrumbSchema([
        { name: 'หน้าแรก', url: '/' },
        { name: 'คลังความรู้', url: '/articles' },
        ...(article.category
            ? [{ name: article.category.name, url: `/articles?category=${article.category.slug}` }]
            : []),
        { name: article.title, url: `/articles/${slug}` },
    ]);

    return (
        <>
            <JsonLd data={[articleLd, breadcrumb]} />
            <ArticleClient article={article} relatedArticles={relatedArticles} />
        </>
    );
}

/**
 * Custom 404 fallback that matches the existing design.
 * Next's notFound() will still trigger the nearest not-found.tsx if defined,
 * but we also export a minimal inline fallback for clarity.
 */
export function NotFoundFallback() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-surface">
            <div className="text-center px-4">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">ไม่พบบทความ</h2>
                <p className="text-gray-500 mb-6">บทความนี้อาจถูกลบหรือไม่มีอยู่</p>
                <Link href="/articles" className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-opacity-90 transition">
                    กลับไปหน้าคลังความรู้
                </Link>
            </div>
        </div>
    );
}
