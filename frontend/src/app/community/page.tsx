"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
    Pencil,
    MessageCircle,
    Wrench,
    Star,
    Zap,
    ShoppingCart,
    ShieldCheck,
    Tag,
    FileText,
    Bike,
    MapPin,
    ChevronUp,
    ChevronDown,
    Check,
    Eye,
    BadgeCheck,
    Trophy,
    Medal,
    Users,
    Search,
    Loader2,
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Category {
    id: string;
    name: string;
    slug: string;
    icon: string;
    color: string;
    _count: { posts: number };
}

interface Post {
    id: string;
    title: string;
    content: string;
    imageUrl?: string;
    isPinned: boolean;
    isSolved: boolean;
    viewCount: number;
    createdAt: string;
    score: number;
    commentCount: number;
    tags: string[];
    author: { id: string; fullName: string };
    category: { id: string; name: string; slug: string; color: string; icon: string };
}

interface GuruEntry {
    rank: number;
    userId: string;
    fullName: string;
    points: number;
    totalAnswers: number;
}

interface Stats {
    memberCount: number;
    postsToday: number;
    totalPosts: number;
}

interface TagEntry {
    name: string;
    count: number;
}

// ─── Icon map ─────────────────────────────────────────────────────────────────

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
    ChatsCircle: <MessageCircle fill="currentColor" className="text-2xl" />,
    Wrench: <Wrench fill="currentColor" className="text-2xl" />,
    Star: <Star fill="currentColor" className="text-2xl" />,
    Lightning: <Zap fill="currentColor" className="text-2xl" />,
    ShoppingCart: <ShoppingCart fill="currentColor" className="text-2xl" />,
    ShieldCheck: <ShieldCheck fill="currentColor" className="text-2xl" />,
    Tag: <Tag fill="currentColor" className="text-2xl" />,
    FileText: <FileText fill="currentColor" className="text-2xl" />,
    Motorcycle: <Bike fill="currentColor" className="text-2xl" />,
    MapPin: <MapPin fill="currentColor" className="text-2xl" />,
};

const COLOR_MAP: Record<string, { bg: string; hover: string; border: string; text: string }> = {
    blue:   { bg: 'bg-blue-50',   hover: 'hover:bg-blue-100',   border: 'border-blue-100',   text: 'text-primary' },
    orange: { bg: 'bg-orange-50', hover: 'hover:bg-orange-100', border: 'border-orange-100', text: 'text-accent' },
    green:  { bg: 'bg-green-50',  hover: 'hover:bg-green-100',  border: 'border-green-100',  text: 'text-green-600' },
    yellow: { bg: 'bg-yellow-50', hover: 'hover:bg-yellow-100', border: 'border-yellow-100', text: 'text-yellow-500' },
    purple: { bg: 'bg-purple-50', hover: 'hover:bg-purple-100', border: 'border-purple-100', text: 'text-purple-500' },
    red:    { bg: 'bg-red-50',    hover: 'hover:bg-red-100',    border: 'border-red-100',    text: 'text-red-500' },
    teal:   { bg: 'bg-teal-50',   hover: 'hover:bg-teal-100',   border: 'border-teal-100',   text: 'text-teal-600' },
    indigo: { bg: 'bg-indigo-50', hover: 'hover:bg-indigo-100', border: 'border-indigo-100', text: 'text-indigo-600' },
    gray:   { bg: 'bg-gray-50',   hover: 'hover:bg-gray-100',   border: 'border-gray-200',   text: 'text-gray-600' },
    pink:   { bg: 'bg-pink-50',   hover: 'hover:bg-pink-100',   border: 'border-pink-100',   text: 'text-pink-500' },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function PostCard({ post }: { post: Post }) {
    const colors = COLOR_MAP[post.category.color] ?? COLOR_MAP.gray;
    return (
        <Link href={`/community/topic/${post.id}`}>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer group">
                <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center gap-1 min-w-[40px]">
                        <ChevronUp className="text-xl text-gray-300" />
                        <span className={`font-bold ${post.score > 0 ? 'text-primary' : 'text-gray-500'}`}>
                            {post.score}
                        </span>
                        <ChevronDown className="text-xl text-gray-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className={`${colors.bg} ${colors.text} text-[10px] font-bold px-2 py-0.5 rounded-full border ${colors.border}`}>
                                {post.category.name}
                            </span>
                            {post.isSolved && (
                                <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <Check /> แก้ไขแล้ว
                                </span>
                            )}
                            {post.isPinned && (
                                <span className="bg-yellow-100 text-yellow-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                    ปักหมุด
                                </span>
                            )}
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <h3 className="font-bold text-lg text-gray-800 mb-1 group-hover:text-primary transition line-clamp-2">
                                    {post.title}
                                </h3>
                                <p className="text-sm text-gray-500 line-clamp-2 mb-3">{post.content}</p>
                            </div>
                            {post.imageUrl && (
                                <div className="w-24 h-24 rounded-lg bg-gray-200 overflow-hidden hidden sm:block flex-shrink-0">
                                    <img src={post.imageUrl} className="w-full h-full object-cover" alt="" />
                                </div>
                            )}
                        </div>
                        {post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                                {post.tags.slice(0, 4).map((tag) => (
                                    <span key={tag} className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}
                        <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-100 pt-3">
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[8px] font-bold flex-shrink-0">
                                    {post.author.fullName.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-gray-600 truncate max-w-[120px]">{post.author.fullName}</span>
                                <span>• {new Date(post.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <div className="flex items-center gap-4 flex-shrink-0">
                                <span className="flex items-center gap-1"><MessageCircle /> {post.commentCount}</span>
                                <span className="flex items-center gap-1"><Eye /> {post.viewCount >= 1000 ? `${(post.viewCount / 1000).toFixed(1)}k` : post.viewCount}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CommunityPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [posts, setPosts] = useState<Post[]>([]);
    const [gurus, setGurus] = useState<GuruEntry[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [popularTags, setPopularTags] = useState<TagEntry[]>([]);

    const [activeTab, setActiveTab] = useState<'trending' | 'latest' | 'unanswered'>('trending');
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);

    // fetch sidebar data once
    useEffect(() => {
        Promise.all([
            fetch(`${API_BASE}/forum/categories`).then((r) => r.json()),
            fetch(`${API_BASE}/forum/leaderboard?limit=5`).then((r) => r.json()),
            fetch(`${API_BASE}/forum/stats`).then((r) => r.json()),
            fetch(`${API_BASE}/forum/tags/popular?limit=10`).then((r) => r.json()),
        ]).then(([catData, guruData, statsData, tagsData]) => {
            setCategories(catData.categories ?? []);
            setGurus(guruData.leaderboard ?? []);
            setStats(statsData);
            setPopularTags(tagsData.tags ?? []);
        });
    }, []);

    const fetchPosts = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                tab: activeTab,
                page: String(page),
                limit: '10',
            });
            if (activeCategory) params.set('category', activeCategory);

            const res = await fetch(`${API_BASE}/forum/posts?${params}`);
            const data = await res.json();
            setPosts(data.posts ?? []);
            setTotalPages(data.pagination?.totalPages ?? 1);
        } finally {
            setLoading(false);
        }
    }, [activeTab, activeCategory, page]);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    // reset page when tab/category changes
    const handleTabChange = (tab: typeof activeTab) => {
        setActiveTab(tab);
        setPage(1);
    };

    const handleCategoryClick = (slug: string) => {
        setActiveCategory(activeCategory === slug ? null : slug);
        setPage(1);
    };

    // local search filter (client-side on loaded posts)
    const filtered = search.trim()
        ? posts.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()) || p.content.toLowerCase().includes(search.toLowerCase()))
        : posts;

    return (
        <div className="bg-surface text-gray-800 min-h-screen">
            {/* Header */}
            <div className="bg-white pt-8 pb-8 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-primary mb-1">ชุมชน Car2Hand</h1>
                            <p className="text-gray-500">พื้นที่แลกเปลี่ยนประสบการณ์ ปรึกษาปัญหาเรื่องรถ และรีวิวจากผู้ใช้จริง</p>
                        </div>
                        <div className="flex gap-3 w-full md:w-auto">
                            <div className="relative flex-1 md:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="ค้นหากระทู้..."
                                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary"
                                />
                            </div>
                            <Link
                                href="/community/create"
                                className="bg-accent text-white px-5 py-2.5 rounded-xl font-bold hover:bg-orange-600 transition shadow-lg shadow-orange-100 flex items-center gap-2 whitespace-nowrap"
                            >
                                <Pencil size={18} /> ตั้งกระทู้
                            </Link>
                        </div>
                    </div>

                    {/* Category Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-10 gap-2 mt-6">
                        {categories.map((cat) => {
                            const colors = COLOR_MAP[cat.color] ?? COLOR_MAP.gray;
                            const isActive = activeCategory === cat.slug;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => handleCategoryClick(cat.slug)}
                                    className={`${isActive ? `${colors.bg} ring-2 ring-primary` : `bg-white ${colors.hover}`} border ${colors.border} p-3 rounded-xl cursor-pointer transition flex flex-col items-center gap-1.5 text-center group`}
                                >
                                    <span className={colors.text}>{CATEGORY_ICONS[cat.icon] ?? <MessageCircle fill="currentColor" className="text-2xl" />}</span>
                                    <span className="text-[11px] font-bold text-gray-700 leading-tight">{cat.name}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">

                {/* Main Feed */}
                <div className="lg:col-span-3">
                    {/* Tabs */}
                    <div className="flex items-center gap-6 border-b border-gray-200 mb-6 overflow-x-auto no-scrollbar">
                        {([
                            { key: 'trending', label: '🔥 กำลังเป็นกระแส' },
                            { key: 'latest',   label: 'มาใหม่ล่าสุด' },
                            { key: 'unanswered', label: 'รอคำตอบ' },
                        ] as const).map(({ key, label }) => (
                            <button
                                key={key}
                                onClick={() => handleTabChange(key)}
                                className={`pb-3 border-b-2 whitespace-nowrap transition ${
                                    activeTab === key
                                        ? 'border-primary text-primary font-bold'
                                        : 'border-transparent text-gray-500 hover:text-primary'
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Posts */}
                    {loading ? (
                        <div className="flex justify-center py-16">
                            <Loader2 className="animate-spin text-primary text-4xl" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-16 text-gray-400">
                            <MessageCircle size={48} className="mx-auto mb-3 opacity-30" />
                            <p className="font-medium">ยังไม่มีกระทู้ในหมวดนี้</p>
                            <p className="text-sm">เป็นคนแรกที่ตั้งกระทู้!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filtered.map((post) => <PostCard key={post.id} post={post} />)}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && !loading && (
                        <div className="flex items-center justify-center gap-2 mt-6">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage((p) => p - 1)}
                                className="px-4 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 transition"
                            >
                                ← ก่อนหน้า
                            </button>
                            <span className="text-sm text-gray-500">{page} / {totalPages}</span>
                            <button
                                disabled={page === totalPages}
                                onClick={() => setPage((p) => p + 1)}
                                className="px-4 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 transition"
                            >
                                ถัดไป →
                            </button>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <aside className="space-y-6">

                    {/* Top Gurus */}
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-primary flex items-center gap-2">
                                <Trophy fill="currentColor" className="text-yellow-500 text-xl" /> Top Gurus
                            </h3>
                            <Link href="/community/leaderboard" className="text-xs text-accent hover:underline">ดูทั้งหมด</Link>
                        </div>
                        {gurus.length === 0 ? (
                            <p className="text-xs text-gray-400 text-center py-4">ยังไม่มีข้อมูล</p>
                        ) : (
                            <div className="space-y-3">
                                {gurus.map((g) => (
                                    <div key={g.userId} className="flex items-center gap-3">
                                        <span className={`font-bold w-4 text-center text-sm ${g.rank === 1 ? 'text-yellow-500' : g.rank === 2 ? 'text-gray-400' : g.rank === 3 ? 'text-orange-700' : 'text-gray-400'}`}>
                                            {g.rank}
                                        </span>
                                        <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                                            {g.fullName.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-bold text-gray-800 truncate flex items-center gap-1">
                                                {g.fullName}
                                                {g.rank <= 3 && <BadgeCheck fill="currentColor" className="text-blue-500 text-xs flex-shrink-0" />}
                                            </h4>
                                            <span className="text-[10px] text-gray-500">{g.points.toLocaleString()} คะแนน</span>
                                        </div>
                                        {g.rank === 1 && <Medal fill="currentColor" className="text-yellow-400 text-lg flex-shrink-0" />}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="bg-primary text-white p-5 rounded-2xl shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Users fill="currentColor" className="text-8xl" />
                        </div>
                        <h3 className="font-bold text-lg mb-4 relative z-10">สถิติชุมชน</h3>
                        <div className="grid grid-cols-2 gap-4 relative z-10">
                            <div>
                                <span className="text-2xl font-bold block text-accent">
                                    {stats ? (stats.memberCount >= 1000 ? `${(stats.memberCount / 1000).toFixed(1)}k` : stats.memberCount) : '—'}
                                </span>
                                <span className="text-xs text-blue-200">สมาชิก</span>
                            </div>
                            <div>
                                <span className="text-2xl font-bold block text-accent">
                                    {stats ? stats.postsToday : '—'}
                                </span>
                                <span className="text-xs text-blue-200">กระทู้วันนี้</span>
                            </div>
                            <div className="col-span-2">
                                <span className="text-2xl font-bold block text-accent">
                                    {stats ? stats.totalPosts.toLocaleString() : '—'}
                                </span>
                                <span className="text-xs text-blue-200">กระทู้ทั้งหมด</span>
                            </div>
                        </div>
                    </div>

                    {/* Popular Tags */}
                    {popularTags.length > 0 && (
                        <div>
                            <h3 className="font-bold text-gray-800 mb-3 text-sm">Tags ยอดนิยม</h3>
                            <div className="flex flex-wrap gap-2">
                                {popularTags.map((tag) => (
                                    <button
                                        key={tag.name}
                                        onClick={() => {
                                            setSearch(`#${tag.name}`);
                                        }}
                                        className="bg-white border border-gray-200 px-3 py-1 rounded-full text-xs text-gray-600 hover:border-primary hover:text-primary cursor-pointer transition shadow-sm"
                                    >
                                        #{tag.name} <span className="text-gray-400">({tag.count})</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                </aside>
            </div>
        </div>
    );
}
