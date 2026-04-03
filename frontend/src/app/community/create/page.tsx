"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, PencilSimple, X, SpinnerGap, LinkSimple } from '@phosphor-icons/react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

function getAuthToken(): string | null {
    const stored = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (!stored) return null;
    try { return JSON.parse(stored).token || null; } catch { return null; }
}

interface Category {
    id: string;
    name: string;
    slug: string;
    color: string;
    icon: string;
}

export default function CreateTopicPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const linkedListingId = searchParams.get('listingId');
    const linkedBrand = searchParams.get('brand');
    const linkedModel = searchParams.get('model');
    const linkedYear = searchParams.get('year');

    const [userId, setUserId] = useState<string | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [tagInput, setTagInput] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
        if (!storedUser) {
            router.push('/login?redirect=/community/create');
            return;
        }
        const userData = JSON.parse(storedUser);
        setUserId(userData.id);
    }, [router]);

    useEffect(() => {
        fetch(`${API_BASE}/forum/categories`)
            .then((r) => r.json())
            .then((data) => {
                setCategories(data.categories ?? []);
                if (data.categories?.length > 0) setCategoryId(data.categories[0].id);
            });
    }, []);

    // Pre-fill title/tags when coming from a listing page
    useEffect(() => {
        if (linkedBrand && linkedModel) {
            setTitle(`ขอความเห็น ${linkedBrand} ${linkedModel}${linkedYear ? ` ปี ${linkedYear}` : ''}`);
            const brandTag = linkedBrand.replace(/\s+/g, '');
            const modelTag = `${linkedBrand}${linkedModel}`.replace(/\s+/g, '');
            setTags([brandTag, modelTag].filter((t, i, arr) => arr.indexOf(t) === i).slice(0, 2));
        }
    }, [linkedBrand, linkedModel, linkedYear]);

    const addTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
            e.preventDefault();
            const newTag = tagInput.trim().replace(/^#/, '');
            if (newTag && !tags.includes(newTag) && tags.length < 5) {
                setTags([...tags, newTag]);
            }
            setTagInput('');
        }
    };

    const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId) return;
        if (!title.trim() || !content.trim() || !categoryId) {
            setError('กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }
        setSubmitting(true);
        setError('');
        try {
            const token = getAuthToken();
            const res = await fetch(`${API_BASE}/forum/posts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ categoryId, title, content, tags, ...(linkedListingId && { listingId: linkedListingId }) }),
            });
            if (!res.ok) {
                const data = await res.json();
                setError(data.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่');
                return;
            }
            const data = await res.json();
            router.push(`/community/topic/${data.post.id}`);
        } catch {
            setError('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-surface min-h-screen">
            <div className="max-w-3xl mx-auto px-4 py-8">
                <Link href="/community" className="flex items-center gap-2 text-gray-500 hover:text-primary transition mb-6 w-fit">
                    <ArrowLeft size={18} /> กลับหน้าชุมชน
                </Link>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <PencilSimple weight="fill" className="text-accent" />
                        ตั้งกระทู้ใหม่
                    </h1>

                    {/* Linked listing badge */}
                    {linkedListingId && linkedBrand && linkedModel && (
                        <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-primary text-sm px-4 py-3 rounded-xl mb-5">
                            <LinkSimple weight="bold" size={16} className="flex-shrink-0" />
                            <span>กระทู้นี้เชื่อมกับประกาศ <strong>{linkedBrand} {linkedModel}{linkedYear ? ` ปี ${linkedYear}` : ''}</strong></span>
                            <Link href={`/buy/${linkedListingId}`} className="ml-auto text-xs underline hover:text-accent whitespace-nowrap">ดูประกาศ</Link>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Category */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                หมวดหมู่ <span className="text-red-500">*</span>
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {categories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => setCategoryId(cat.id)}
                                        className={`text-sm px-3 py-2 rounded-xl border transition text-left ${
                                            categoryId === cat.id
                                                ? 'border-primary bg-blue-50 text-primary font-bold'
                                                : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                        }`}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Title */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                หัวข้อกระทู้ <span className="text-red-500">*</span>
                            </label>
                            <input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                maxLength={200}
                                placeholder="เช่น: Honda Civic FE มีเสียงดังจากล้อหน้า เกิดจากอะไรครับ?"
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition"
                            />
                            <span className="text-xs text-gray-400 mt-1 block text-right">{title.length}/200</span>
                        </div>

                        {/* Content */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                รายละเอียด <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                rows={8}
                                placeholder="อธิบายปัญหาหรือเรื่องที่อยากแบ่งปัน ยิ่งละเอียดยิ่งได้คำตอบที่ดีกว่า..."
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition resize-none"
                            />
                        </div>

                        {/* Tags */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                แท็ก <span className="text-gray-400 font-normal">(สูงสุด 5 แท็ก)</span>
                            </label>
                            <div className="border border-gray-200 rounded-xl px-3 py-2 flex flex-wrap gap-2 focus-within:border-primary transition min-h-[44px]">
                                {tags.map((tag) => (
                                    <span key={tag} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                        #{tag}
                                        <button type="button" onClick={() => removeTag(tag)}>
                                            <X size={12} className="hover:text-red-500" />
                                        </button>
                                    </span>
                                ))}
                                {tags.length < 5 && (
                                    <input
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyDown={addTag}
                                        placeholder={tags.length === 0 ? 'พิมพ์แท็ก แล้วกด Enter เช่น HRV2024' : ''}
                                        className="flex-1 min-w-[120px] text-sm outline-none bg-transparent"
                                    />
                                )}
                            </div>
                            <p className="text-xs text-gray-400 mt-1">กด Enter หรือ comma (,) เพื่อเพิ่มแท็ก</p>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                                {error}
                            </div>
                        )}

                        <div className="flex gap-3 pt-2">
                            <Link
                                href="/community"
                                className="flex-1 text-center py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition font-medium text-sm"
                            >
                                ยกเลิก
                            </Link>
                            <button
                                type="submit"
                                disabled={submitting || !userId}
                                className="flex-1 bg-accent text-white py-3 rounded-xl font-bold hover:bg-orange-600 transition disabled:opacity-60 flex items-center justify-center gap-2 text-sm"
                            >
                                {submitting ? (
                                    <><SpinnerGap className="animate-spin" size={18} /> กำลังโพสต์...</>
                                ) : (
                                    <><PencilSimple weight="bold" size={18} /> ตั้งกระทู้</>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
