"use client";

import DashboardLayout from "@/components/DashboardLayout";
import {
    BookOpen,
    Search,
    Plus,
    Edit,
    Trash2,
    Eye,
    Calendar,
    User,
    Tag,
    ChevronLeft,
    ChevronRight,
    MoreVertical,
    Loader2
} from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";

interface Post {
    id: string;
    title: string;
    slug: string;
    category: {
        name: string;
    };
    status: "DRAFT" | "PUBLISHED";
    createdAt: string;
    featuredImage?: string;
    viewCount: number;
    author: {
        fullName: string;
    }
}



export default function ArticlesManagementPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [postToDelete, setPostToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchPosts = async () => {
        setIsLoading(true);
        try {
            const data = await apiFetch('/admin/posts');
            setPosts(data.posts);
        } catch (error) {
            console.error('Fetch posts error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleDeleteClick = (id: string) => {
        setPostToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!postToDelete) return;

        setIsDeleting(true);
        try {
            await apiFetch(`/admin/posts/${postToDelete}`, { method: 'DELETE' });
            setIsDeleteModalOpen(false);
            setPostToDelete(null);
            fetchPosts();
        } catch (error) {
            console.error('Delete post error:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "PUBLISHED": return <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-black bg-emerald-100 text-emerald-700">PUBLISHED</span>;
            case "DRAFT": return <span className="inline-flex items-center px-2 py-1 rounded-lg text-[10px] font-black bg-slate-100 text-slate-500">DRAFT</span>;
            default: return null;
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('th-TH', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        < BookOpen className="text-primary" /> จัดการบทความ
                    </h1>
                    <p className="text-slate-500 mt-1 text-sm">เขียนบทความ ให้ความรู้ และเทคนิคเรื่องรถยนต์เพื่อชุมชน</p>
                </div>
                <Link
                    href="/articles/new"
                    className="btn btn-primary btn-md"
                >
                    <Plus size={20} /> เขียนบทความใหม่
                </Link>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                    <p className="text-slate-500 font-bold">กำลังโหลดบทความ...</p>
                </div>
            ) : posts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                    {posts.map((post) => (
                        <div key={post.id} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col sm:flex-row group hover:shadow-md transition-all duration-300">
                            <div className="w-full sm:w-48 h-48 sm:h-auto bg-slate-100 relative overflow-hidden flex-shrink-0">
                                <img src={post.featuredImage || "https://picsum.photos/seed/k1/300/200"} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                <div className="absolute top-3 left-3">
                                    {getStatusBadge(post.status)}
                                </div>
                            </div>

                            <div className="flex-1 p-6 flex flex-col">
                                <div className="mb-2">
                                    <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/5 px-2 py-1 rounded-md mb-2 inline-block italic">
                                        {post.category?.name || "ไม่มีหมวดหมู่"}
                                    </span>
                                    <h2 className="text-lg font-bold text-slate-800 leading-snug group-hover:text-primary transition-colors line-clamp-2">{post.title}</h2>
                                </div>

                                <div className="flex items-center gap-4 mt-2">
                                    <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1 uppercase"><User size={12} /> {post.author.fullName}</span>
                                    <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1 uppercase"><Calendar size={12} /> {formatDate(post.createdAt)}</span>
                                    <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1 uppercase"><Eye size={12} /> {post.viewCount}</span>
                                </div>

                                <div className="mt-auto pt-6 flex items-center justify-between border-t border-slate-50">
                                    <div className="flex gap-2">
                                        <Link href={`/articles/${post.id}`} className="btn btn-secondary p-2 rounded-lg">
                                            <Edit size={16} />
                                        </Link>
                                        <button
                                            onClick={() => handleDeleteClick(post.id)}
                                            className="btn btn-danger p-2 rounded-lg"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <Link
                                        href={`/articles/${post.slug}`}
                                        className="btn btn-ghost btn-sm text-primary"
                                    >
                                        อ่านตัวอย่าง <Eye size={16} />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-3xl p-20 text-center border border-slate-100 border-dashed">
                    <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BookOpen size={40} className="text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">ยังไม่มีบทความ</h3>
                    <p className="text-slate-500 mt-2 mb-6">เริ่มต้นเขียนบทความแรกเพื่อให้ความรู้กับผู้ใช้งาน</p>
                    <Link
                        href="/articles/new"
                        className="btn btn-primary btn-lg"
                    >
                        <Plus size={20} /> เขียนบทความใหม่
                    </Link>
                </div>
            )}

            {!isLoading && posts.length > 0 && (
                <div className="mt-12 flex items-center justify-between p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary">
                            <BookOpen size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-800">จัดการคอนเทนต์ของคุณ</p>
                            <p className="text-xs text-slate-500 font-medium">คุณมีบทความทั้งหมด {posts.length} รายการในระบบ</p>
                        </div>
                    </div>
                    <Link href="/articles/new" className="text-sm font-bold text-primary hover:bg-primary/5 px-4 py-2 rounded-xl transition-all">เขียนบทความเพิ่ม</Link>
                </div>
            )}

            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                isLoading={isDeleting}
                title="ยืนยันการลบบทความ"
                description="คุณต้องการลบบทความนี้ใช่หรือไม่? การลบนี้จะทำให้ข้อมูลหายไปจากระบบทันที"
            />
        </DashboardLayout>
    );
}
