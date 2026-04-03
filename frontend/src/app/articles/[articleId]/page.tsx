"use client";

import React from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
    FacebookLogo,
    Clock,
    SealCheck,
    Eye,
    CaretRight,
    Chats,
    Link as LinkIcon
} from '@phosphor-icons/react';

import { useState, useEffect, use as useReact } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface Article {
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

export default function ArticlePage({ params }: { params: Promise<{ articleId: string }> }) {
    const { articleId: slug } = useReact(params);
    const [article, setArticle] = useState<Article | null>(null);
    const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
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

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                const response = await fetch(`${API_URL}/articles/${slug}`);
                const data = await response.json();

                if (data.success) {
                    setArticle(data.article);
                } else {
                    setError(data.message || 'ไม่พบบทความ');
                }
            } catch (err) {
                console.error('Fetch article error:', err);
                setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
            } finally {
                setIsLoading(false);
            }
        };

        const fetchRelated = async () => {
            try {
                const response = await fetch(`${API_URL}/articles/${slug}/related?limit=5`);
                const data = await response.json();
                if (data.success) {
                    setRelatedArticles(data.articles || []);
                }
            } catch (err) {
                console.error('Fetch related articles error:', err);
            }
        };

        fetchArticle();
        fetchRelated();
    }, [slug]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-surface">
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-500 font-bold">กำลังโหลดบทความ...</p>
                </div>
            </div>
        );
    }

    if (error || !article) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-surface">
                <div className="text-center px-4">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">อ๊ะ! เกิดข้อผิดพลาด</h2>
                    <p className="text-gray-500 mb-6">{error || 'ไม่พบเนื้อหาที่คุณต้องการ'}</p>
                    <Link href="/articles" className="btn btn-primary">กลับไปหน้าคลังความรู้</Link>
                </div>
            </div>
        );
    }

    const readTime = Math.ceil((article.content?.length || 0) / 500) || 1;
    const categoryName = article.category?.name || 'ทั่วไป';
    const tags = article.tags && article.tags.length > 0 ? article.tags : [categoryName];

    return (
        <div className="bg-surface text-gray-800 min-h-screen">
            <div className="pt-24 pb-12 max-w-7xl mx-auto px-4">

                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                    <Link href="/" className="hover:text-primary">หน้าแรก</Link>
                    <CaretRight weight="bold" className="text-xs" />
                    <Link href="/articles" className="hover:text-primary">คลังความรู้</Link>
                    <CaretRight weight="bold" className="text-xs" />
                    {article.category?.slug && (
                        <>
                            <Link href={`/articles?category=${article.category.slug}`} className="hover:text-primary">{categoryName}</Link>
                            <CaretRight weight="bold" className="text-xs" />
                        </>
                    )}
                    <span className="text-gray-400 line-clamp-1">{article.title}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">

                    {/* Social Share (Desktop Sticky) */}
                    <div className="hidden lg:block lg:col-span-1">
                        <div className="sticky top-24 flex flex-col gap-4 items-center">
                            <button onClick={handleShareFacebook} title="แชร์ไปยัง Facebook" className="w-10 h-10 rounded-full bg-white text-blue-600 shadow-sm flex items-center justify-center hover:scale-110 transition"><FacebookLogo weight="fill" className="text-xl" /></button>
                            <button onClick={handleShareLine} title="แชร์ไปยัง LINE" className="w-10 h-10 rounded-full bg-white text-green-500 shadow-sm flex items-center justify-center hover:scale-110 transition"><Chats weight="fill" className="text-xl" /></button>
                            <button onClick={handleCopyLink} title={copied ? 'คัดลอกแล้ว!' : 'คัดลอกลิงก์'} className={`w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center hover:scale-110 transition ${copied ? 'text-green-500' : 'text-gray-400'}`}><LinkIcon weight="bold" className="text-xl" /></button>
                        </div>
                    </div>

                    {/* Main Article Content */}
                    <main className="lg:col-span-8 bg-white p-6 md:p-10 rounded-3xl shadow-sm border border-gray-100">

                        <header className="mb-8">
                            <div className="flex gap-2 mb-4">
                                <span className="bg-blue-50 text-primary text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide">{categoryName}</span>
                                <span className="bg-gray-100 text-gray-500 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1"><Clock weight="bold" /> {readTime} นาทีอ่าน</span>
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
                                        <div className="font-bold text-gray-800 text-sm flex items-center gap-1">{article.author?.fullName || 'ทีมงาน Car2Hand'} <SealCheck weight="fill" className="text-blue-500" /></div>
                                        <div className="text-xs text-gray-500">Guru ช่างยนต์ &bull; {new Date(article.updatedAt || article.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 text-gray-400 text-sm">
                                    <Eye weight="fill" /> {article.viewCount?.toLocaleString()} Views
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

                        {/* Author Bio */}
                        <div className="bg-blue-50 rounded-2xl p-6 mt-10 flex flex-col md:flex-row gap-6 items-center md:items-start">
                            <div className="w-20 h-20 rounded-full bg-white shadow-sm flex items-center justify-center text-primary text-2xl font-bold border-4 border-white">
                                {article.author?.fullName?.charAt(0) || 'A'}
                            </div>
                            <div className="text-center md:text-left">
                                <h3 className="font-bold text-lg text-gray-900">{article.author?.fullName || 'ทีมงาน Car2Hand'}</h3>
                                <p className="text-sm text-gray-600 mb-4">ผู้เชี่ยวชาญด้านรถมือสอง มอบความรู้และเทคนิคการเลือกซื้อรถยนต์ให้คุ้มค่าที่สุด</p>
                                <button className="text-accent text-sm font-bold border border-accent px-4 py-2 rounded-full hover:bg-accent hover:text-white transition">
                                    ติดตาม +
                                </button>
                            </div>
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
                                                        <Eye weight="fill" size={10} /> {related.viewCount?.toLocaleString() || 0}
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
