"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
    ChevronRight, ChevronUp, ChevronDown, Eye, MessageCircle,
    CheckCircle, BadgeCheck, Send, ArrowLeft,
    Loader2, Check, Share2, Bookmark,
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

function getAuthToken(): string | null {
    const stored = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (!stored) return null;
    try { return JSON.parse(stored).token || null; } catch { return null; }
}

interface Author { id: string; fullName: string; }
interface CommentVote { type: string; }
interface Reply {
    id: string; content: string; createdAt: string;
    author: Author; score: number; votes: CommentVote[];
}
interface Comment {
    id: string; content: string; createdAt: string; isBestAnswer: boolean;
    author: Author; score: number; votes: CommentVote[]; replies: Reply[];
}
interface Post {
    id: string; title: string; content: string; imageUrl?: string;
    isSolved: boolean; isPinned: boolean; viewCount: number; createdAt: string;
    score: number; tags: string[];
    author: Author;
    category: { id: string; name: string; slug: string; color: string };
    comments: Comment[];
    votes: { type: string }[];
}

function timeAgo(dateStr: string) {
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
    if (diff < 60) return 'เมื่อกี้';
    if (diff < 3600) return `${Math.floor(diff / 60)} นาทีที่แล้ว`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} ชม. ที่แล้ว`;
    return new Date(dateStr).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' });
}

function Avatar({ name, size = 10 }: { name: string; size?: number }) {
    return (
        <div className={`w-${size} h-${size} rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm flex-shrink-0`}>
            {name.charAt(0).toUpperCase()}
        </div>
    );
}

export default function TopicDetailPage() {
    const params = useParams();
    const router = useRouter();
    const topicId = params.topicId as string;

    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);
    const [myVote, setMyVote] = useState<'UP' | 'DOWN' | null>(null);
    const [score, setScore] = useState(0);
    const [replyContent, setReplyContent] = useState('');
    const [sending, setSending] = useState(false);
    const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
        if (storedUser) setUserId(JSON.parse(storedUser).id);
    }, []);

    const fetchPost = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/forum/posts/${topicId}`);
            if (!res.ok) { router.push('/community'); return; }
            const data = await res.json();
            setPost(data.post);
            setScore(data.post.score);
            if (userId) {
                const v = data.post.votes.find((v: any) => v.userId === userId);
                setMyVote(v?.type ?? null);
            }
        } finally {
            setLoading(false);
        }
    }, [topicId, userId, router]);

    useEffect(() => { fetchPost(); }, [fetchPost]);

    const handleVote = async (type: 'UP' | 'DOWN') => {
        if (!userId) { router.push('/login'); return; }
        const token = getAuthToken();
        const res = await fetch(`${API_BASE}/forum/posts/${topicId}/vote`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ type }),
        });
        const data = await res.json();
        if (data.voted === null) {
            setScore((s) => s + (myVote === 'UP' ? -1 : 1));
            setMyVote(null);
        } else if (myVote === null) {
            setScore((s) => s + (type === 'UP' ? 1 : -1));
            setMyVote(type);
        } else {
            setScore((s) => s + (type === 'UP' ? 2 : -2));
            setMyVote(type);
        }
    };

    const handleReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId || !replyContent.trim()) return;
        setSending(true);
        try {
            const token = getAuthToken();
            await fetch(`${API_BASE}/forum/posts/${topicId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    content: replyContent,
                    parentId: replyTo?.id ?? undefined,
                }),
            });
            setReplyContent('');
            setReplyTo(null);
            fetchPost();
        } finally {
            setSending(false);
        }
    };

    const handleBestAnswer = async (commentId: string) => {
        if (!userId) return;
        const token = getAuthToken();
        await fetch(`${API_BASE}/forum/comments/${commentId}/best-answer`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            },
        });
        fetchPost();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-primary text-4xl" />
            </div>
        );
    }

    if (!post) return null;

    const isAuthor = userId === post.author.id;

    return (
        <div className="bg-surface text-gray-800 min-h-screen pb-20 md:pb-0">
            <div className="pt-6 pb-4 max-w-7xl mx-auto px-4">
                <div className="flex items-center gap-2 text-sm text-gray-500 overflow-x-auto whitespace-nowrap">
                    <Link href="/community" className="hover:text-primary flex items-center gap-1"><ArrowLeft size={14} /> ชุมชน</Link>
                    <ChevronRight className="text-xs" />
                    <Link href={`/community?category=${post.category.slug}`} className="bg-orange-50 text-orange-700 px-2 py-0.5 rounded hover:bg-orange-100 transition font-bold">
                        {post.category.name}
                    </Link>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-4 gap-8">
                <main className="lg:col-span-3 space-y-6">

                    {/* Post */}
                    <article className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-start gap-4">
                            {/* Vote column */}
                            <div className="flex flex-col items-center gap-1 min-w-[40px]">
                                <button
                                    onClick={() => handleVote('UP')}
                                    className={`p-1 rounded-lg transition ${myVote === 'UP' ? 'text-accent bg-orange-50' : 'text-gray-400 hover:text-accent'}`}
                                >
                                    <ChevronUp className="text-xl" />
                                </button>
                                <span className={`font-bold text-lg ${score > 0 ? 'text-primary' : score < 0 ? 'text-red-500' : 'text-gray-500'}`}>{score}</span>
                                <button
                                    onClick={() => handleVote('DOWN')}
                                    className={`p-1 rounded-lg transition ${myVote === 'DOWN' ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-red-400'}`}
                                >
                                    <ChevronDown className="text-xl" />
                                </button>
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <Avatar name={post.author.fullName} />
                                        <div>
                                            <h3 className="font-bold text-gray-800">{post.author.fullName}</h3>
                                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                                <span>{timeAgo(post.createdAt)}</span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1"><Eye fill="currentColor" /> {post.viewCount.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {post.isSolved && (
                                            <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                                <Check /> แก้ไขแล้ว
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 leading-snug">{post.title}</h1>

                                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">{post.content}</div>

                                {post.imageUrl && (
                                    <img src={post.imageUrl} alt="" className="rounded-xl w-full max-h-[400px] object-cover mt-4" />
                                )}

                                {post.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-4">
                                        {post.tags.map((tag) => (
                                            <span key={tag} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">#{tag}</span>
                                        ))}
                                    </div>
                                )}

                                <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-4">
                                    <span className="flex items-center gap-2 text-sm text-gray-500">
                                        <MessageCircle /> {post.comments.length} ความเห็น
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <button className="text-gray-400 hover:text-blue-500 p-2 rounded-full hover:bg-blue-50 transition">
                                            <Share2 />
                                        </button>
                                        <button className="text-gray-400 hover:text-yellow-500 p-2 rounded-full hover:bg-yellow-50 transition">
                                            <Bookmark />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </article>

                    {/* Comments */}
                    {post.comments.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="font-bold text-gray-700 text-lg">{post.comments.length} ความเห็น</h3>

                            {post.comments.map((comment) => (
                                <div
                                    key={comment.id}
                                    className={comment.isBestAnswer
                                        ? 'border-2 border-green-400 bg-green-50/50 rounded-2xl p-1 relative shadow-sm'
                                        : 'bg-white rounded-2xl border border-gray-100'
                                    }
                                >
                                    {comment.isBestAnswer && (
                                        <div className="absolute -top-3 left-6 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                                            <CheckCircle fill="currentColor" /> คำตอบที่ดีที่สุด
                                        </div>
                                    )}
                                    <div className={comment.isBestAnswer ? 'bg-white rounded-xl p-5' : 'p-5'}>
                                        <div className="flex items-start gap-3 mb-3">
                                            <Avatar name={comment.author.fullName} size={9} />
                                            <div>
                                                <span className="font-bold text-gray-800 text-sm flex items-center gap-1">
                                                    {comment.author.fullName}
                                                    {comment.isBestAnswer && <BadgeCheck fill="currentColor" className="text-blue-500 text-xs" />}
                                                </span>
                                                <span className="text-xs text-gray-400">{timeAgo(comment.createdAt)}</span>
                                            </div>
                                        </div>

                                        <p className="text-gray-700 text-sm whitespace-pre-wrap mb-3">{comment.content}</p>

                                        <div className="flex items-center gap-4 text-xs text-gray-500">
                                            <span className="font-medium">{comment.score > 0 ? `+${comment.score}` : comment.score}</span>
                                            <button
                                                onClick={() => setReplyTo({ id: comment.id, name: comment.author.fullName })}
                                                className="hover:text-primary"
                                            >
                                                ตอบกลับ
                                            </button>
                                            {isAuthor && !post.isSolved && (
                                                <button
                                                    onClick={() => handleBestAnswer(comment.id)}
                                                    className="text-green-600 hover:text-green-700 font-bold"
                                                >
                                                    เลือกเป็น Best Answer
                                                </button>
                                            )}
                                        </div>

                                        {/* Replies */}
                                        {comment.replies.length > 0 && (
                                            <div className="mt-4 pl-4 border-l-2 border-gray-100 space-y-3">
                                                {comment.replies.map((reply) => (
                                                    <div key={reply.id} className="flex items-start gap-3">
                                                        <Avatar name={reply.author.fullName} size={7} />
                                                        <div className="bg-gray-50 rounded-xl p-3 flex-1">
                                                            <span className="font-bold text-xs text-gray-800">{reply.author.fullName}</span>
                                                            <span className="text-xs text-gray-400 ml-2">{timeAgo(reply.createdAt)}</span>
                                                            <p className="text-gray-600 text-xs mt-1">{reply.content}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Reply box */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100" id="reply-box">
                        <h3 className="font-bold text-gray-700 mb-4">
                            {replyTo ? (
                                <span className="flex items-center gap-2">
                                    ตอบกลับ <span className="text-primary">{replyTo.name}</span>
                                    <button onClick={() => setReplyTo(null)} className="text-xs text-gray-400 hover:text-red-500 font-normal">ยกเลิก</button>
                                </span>
                            ) : 'เขียนคำตอบของคุณ'}
                        </h3>
                        {!userId ? (
                            <div className="text-center py-6 text-gray-500">
                                <p className="mb-3">กรุณาเข้าสู่ระบบเพื่อตอบกระทู้</p>
                                <Link href="/login" className="bg-primary text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-opacity-90 transition">
                                    เข้าสู่ระบบ
                                </Link>
                            </div>
                        ) : (
                            <form onSubmit={handleReply}>
                                <textarea
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    className="w-full border border-gray-200 rounded-xl p-4 text-sm min-h-[120px] resize-none focus:outline-none focus:border-primary transition"
                                    placeholder="แชร์ประสบการณ์หรือคำแนะนำของคุณ..."
                                />
                                <div className="flex justify-end mt-3">
                                    <button
                                        type="submit"
                                        disabled={sending || !replyContent.trim()}
                                        className="bg-primary text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-900/10 hover:bg-opacity-90 transition disabled:opacity-60 flex items-center gap-2"
                                    >
                                        {sending ? <Loader2 className="animate-spin" size={16} /> : null}
                                        ส่งคำตอบ
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                </main>

                {/* Sidebar */}
                <aside className="hidden lg:block space-y-6">
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 text-center">
                        <Avatar name={post.author.fullName} size={16} />
                        <h3 className="font-bold text-gray-800 mt-3">{post.author.fullName}</h3>
                        <p className="text-xs text-gray-400 mt-1 mb-3">
                            {new Date(post.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                    </div>

                    <div className="bg-gradient-to-br from-gray-900 to-primary text-white p-5 rounded-2xl relative overflow-hidden">
                        <div className="relative z-10">
                            <p className="text-xs text-gray-300 mb-1">Car2Hand Market</p>
                            <h3 className="font-bold text-base mb-2">ดูรถที่เกี่ยวข้อง</h3>
                            <p className="text-sm text-gray-300 mb-4">ประกาศขายรถในหมวด {post.category.name}</p>
                            <Link
                                href="/buy"
                                className="bg-accent text-white w-full py-2 rounded-lg font-bold text-sm hover:bg-orange-600 transition block text-center"
                            >
                                ดูประกาศขายรถ
                            </Link>
                        </div>
                        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl" />
                    </div>
                </aside>
            </div>

            {/* Mobile reply bar */}
            <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-3 md:hidden z-40 flex items-center gap-3">
                <div
                    className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-gray-400 text-sm cursor-text"
                    onClick={() => document.getElementById('reply-box')?.scrollIntoView({ behavior: 'smooth' })}
                >
                    เขียนคำตอบ...
                </div>
                <button
                    className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-lg"
                    onClick={() => document.getElementById('reply-box')?.scrollIntoView({ behavior: 'smooth' })}
                >
                    <Send />
                </button>
            </div>
        </div>
    );
}
