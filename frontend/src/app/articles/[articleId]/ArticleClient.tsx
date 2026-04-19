"use client";

import React from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
    Facebook,
    Clock,
    BadgeCheck,
    Eye,
    ChevronRight,
    MessagesSquare,
    Link as LinkIcon
} from 'lucide-react';

import { useState } from 'react';

export interface Article {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    featuredImage: string;
    viewCount: number;
    isFeatured: boolean;
    tags: string[];
    createdAt: string;
    updatedAt?: string;
    category: { id: string; name: string; slug: string };
    author: { fullName: string };
}

interface ArticleClientProps {
    article: Article;
    relatedArticles: Article[];
}

export default function ArticleClient({ article, relatedArticles }: ArticleClientProps) {
    const [copied, setCopied] = useState(false);

    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

    const handleShareFacebook = () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank', 'width=600,height=400');
    };

    const handleShareLine = () => {
        window.open(`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}`, '_blank', 'width=600,height=400');
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // fallback
            const input = document.createElement('input');
            input.value = shareUrl;
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            document.body.removeChild(input);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const readTime = Math.ceil((article.content?.length || 0) / 500) || 1;
    const categoryName = article.category?.name || 'ทั่วไป';
    const tags = article.tags && article.tags.length > 0 ? article.tags : [categoryName];

    return (
        <div className="bg-surface text-gray-800 min-h-screen">
            <div className="pt-6 md:pt-12 pb-12 max-w-7xl mx-auto px-4">

                {/* Breadcrumb */}
                <nav className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 mb-6 overflow-x-auto no-scrollbar whitespace-nowrap">
                    <Link href="/" className="hover:text-primary flex-shrink-0">หน้าแรก</Link>
                    <ChevronRight size={14} className="text-gray-300 flex-shrink-0" />
                    <Link href="/articles" className="hover:text-primary flex-shrink-0">คลังความรู้</Link>
                    {article.category?.slug && (
                        <>
                            <ChevronRight size={14} className="text-gray-300 flex-shrink-0" />
                            <Link href={`/articles?category=${article.category.slug}`} className="hover:text-primary flex-shrink-0">{categoryName}</Link>
                        </>
                    )}
                    <ChevronRight size={14} className="text-gray-300 flex-shrink-0" />
                    <span className="text-gray-400 truncate max-w-[180px] sm:max-w-none">{article.title}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">

                    {/* Social Share (Desktop Sticky) */}
                    <div className="hidden lg:block lg:col-span-1">
                        <div className="sticky top-24 flex flex-col gap-4 items-center">
                            <button onClick={handleShareFacebook} title="แชร์ไปยัง Facebook" className="w-10 h-10 rounded-full bg-white text-blue-600 shadow-sm flex items-center justify-center hover:scale-110 transition"><Facebook className="text-xl" /></button>
                            <button onClick={handleShareLine} title="แชร์ไปยัง LINE" className="w-10 h-10 rounded-full bg-white text-green-500 shadow-sm flex items-center justify-center hover:scale-110 transition"><MessagesSquare className="text-xl" /></button>
                            <button onClick={handleCopyLink} title={copied ? 'คัดลอกแล้ว!' : 'คัดลอกลิงก์'} className={`w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center hover:scale-110 transition ${copied ? 'text-green-500' : 'text-gray-400'}`}><LinkIcon className="text-xl" /></button>
                        </div>
                    </div>

                    {/* Main Article Content */}
                    <main className="lg:col-span-8 bg-white p-6 md:p-10 rounded-3xl shadow-sm border border-gray-100">

                        <header className="mb-8">
                            <div className="flex gap-2 mb-4">
                                <span className="bg-blue-50 text-primary text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide inline-flex items-center">{categoryName}</span>
                                <span className="bg-gray-100 text-gray-500 text-xs font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1"><Clock size={12} /> {readTime} นาทีอ่าน</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                                {article.title}
                            </h1>

                            <div className="flex items-center justify-between border-y border-gray-100 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20">
                                        {article.author?.fullName?.charAt(0) || 'A'}
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-800 text-sm flex items-center gap-1">{article.author?.fullName || 'ทีมงาน Car2Hand'} <BadgeCheck className="text-blue-500" /></div>
                                        <div className="text-xs text-gray-500">
                                            Guru ช่างยนต์ &bull;{' '}
                                            <time dateTime={article.updatedAt || article.createdAt}>
                                                {new Date(article.updatedAt || article.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </time>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 text-gray-400 text-sm">
                                    <Eye /> {article.viewCount?.toLocaleString()} Views
                                </div>
                            </div>
                        </header>

                        {article.featuredImage && (
                            <div className="rounded-2xl overflow-hidden mb-10 shadow-lg">
                                <img src={article.featuredImage} className="w-full object-cover" alt={article.title} />
                            </div>
                        )}

                        {article.excerpt && (
                            <p className="text-lg text-gray-500 italic border-l-4 border-primary/30 pl-4 mb-8">{article.excerpt}</p>
                        )}

                        {/* Article Content with Markdown */}
                        <article className="prose prose-lg max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{article.content}</ReactMarkdown>
                        </article>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mt-10 pt-6 border-t border-gray-100">
                            <span className="text-gray-500 text-sm font-bold mr-2">Tags:</span>
                            {tags.map((tag, idx) => (
                                <Link key={idx} href={`/articles?tag=${encodeURIComponent(tag)}`} className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1 rounded-full text-sm transition">
                                    #{tag}
                                </Link>
                            ))}
                        </div>

                    </main>

                    {/* Sidebar - Related Articles */}
                    <aside className="lg:col-span-3 space-y-6">
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
                            <h3 className="font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">แนะนำสำหรับคุณ</h3>
                            {relatedArticles.length > 0 ? (
                                <div className="space-y-4">
                                    {relatedArticles.map((related) => (
                                        <Link
                                            key={related.id}
                                            href={`/articles/${related.slug}`}
                                            className="flex gap-3 group"
                                        >
                                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                                                {related.featuredImage ? (
                                                    <img
                                                        src={related.featuredImage}
                                                        alt={related.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No img</div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-semibold text-gray-800 line-clamp-2 group-hover:text-primary transition-colors leading-tight">
                                                    {related.title}
                                                </h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-xs bg-blue-50 text-primary px-1.5 py-0.5 rounded-full font-medium">
                                                        {related.category?.name || 'ทั่วไป'}
                                                    </span>
                                                    <span className="text-xs text-gray-400 flex items-center gap-0.5">
                                                        <Eye size={10} /> {related.viewCount?.toLocaleString() || 0}
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">ยังไม่มีบทความที่เกี่ยวข้อง</p>
                            )}
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}
