"use client";

import DashboardLayout from "@/components/DashboardLayout";
import {
    BookOpen,
    Plus,
    Edit,
    Trash2,
    Eye,
    Calendar,
    User,
    Loader2
} from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";

// shadcn/ui components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

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
            case "PUBLISHED": return <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-none rounded-md px-2 py-0.5 text-xs font-medium">Published</Badge>;
            case "DRAFT": return <Badge variant="secondary" className="bg-slate-100 text-slate-500 hover:bg-slate-100 border-none rounded-md px-2 py-0.5 text-xs font-medium">Draft</Badge>;
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
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-800 flex items-center gap-2">
                        <BookOpen className="text-primary" /> จัดการบทความ
                    </h1>
                    <p className="text-slate-500 mt-1 text-sm">เขียนบทความ ให้ความรู้ และเทคนิคเรื่องรถยนต์เพื่อชุมชน</p>
                </div>
                <Button asChild className="bg-brand-primary hover:bg-brand-primary/90 text-white font-medium">
                    <Link href="/articles/new">
                        <Plus className="mr-2 h-4 w-4" /> เขียนบทความใหม่
                    </Link>
                </Button>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 text-primary animate-spin mb-3" />
                    <p className="text-slate-400 text-sm">กำลังโหลดบทความ...</p>
                </div>
            ) : posts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {posts.map((post) => (
                        <Card key={post.id} className="rounded-xl overflow-hidden border-slate-200 shadow-sm">
                            <CardContent className="p-0 flex flex-col sm:flex-row">
                                <div className="w-full sm:w-44 h-44 sm:h-auto bg-slate-100 relative overflow-hidden flex-shrink-0">
                                    <img
                                        src={post.featuredImage || `https://picsum.photos/seed/${post.slug}/400/300`}
                                        alt={post.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-3 left-3">
                                        {getStatusBadge(post.status)}
                                    </div>
                                </div>

                                <div className="flex-1 p-5 flex flex-col">
                                    <div className="mb-3">
                                        <span className="text-xs font-medium text-primary bg-primary/5 px-2 py-0.5 rounded-md mb-2 inline-block">
                                            {post.category?.name || "ไม่มีหมวดหมู่"}
                                        </span>
                                        <h2 className="text-base font-semibold text-slate-800 leading-snug line-clamp-2 min-h-[3rem]">{post.title}</h2>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3 text-slate-400 text-xs">
                                        <span className="flex items-center gap-1"><User size={12} /> {post.author.fullName}</span>
                                        <span className="flex items-center gap-1"><Calendar size={12} /> {formatDate(post.createdAt)}</span>
                                        <span className="flex items-center gap-1"><Eye size={12} /> {post.viewCount.toLocaleString()}</span>
                                    </div>

                                    <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100">
                                        <div className="flex gap-1">
                                            <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                                                <Link href={`/articles/${post.id}`}>
                                                    <Edit size={15} />
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeleteClick(post.id)}
                                                className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                                            >
                                                <Trash2 size={15} />
                                            </Button>
                                        </div>
                                        <Button variant="ghost" asChild className="text-primary hover:text-primary/80 font-medium text-sm h-8">
                                            <Link href={`/articles/${post.slug}`}>
                                                อ่านตัวอย่าง <Eye size={15} className="ml-1" />
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="rounded-xl p-16 text-center border-slate-200 border-dashed border-2 bg-slate-50/50">
                    <div className="h-16 w-16 bg-white rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <BookOpen size={32} className="text-slate-300" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800">ยังไม่มีบทความ</h3>
                    <p className="text-slate-500 mt-1.5 mb-6 text-sm max-w-sm mx-auto">เริ่มต้นเขียนบทความแรกเพื่อให้ความรู้และเทคนิคดีๆ กับผู้ใช้งาน Car2Hand</p>
                    <Button asChild className="bg-brand-primary hover:bg-brand-primary/90 text-white font-medium">
                        <Link href="/articles/new">
                            <Plus size={18} className="mr-2" /> เขียนบทความใหม่
                        </Link>
                    </Button>
                </Card>
            )}

            {!isLoading && posts.length > 0 && (
                <div className="mt-6 flex items-center justify-between p-5 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-primary/5 rounded-lg flex items-center justify-center text-primary">
                            <BookOpen size={20} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-800">จัดการคอนเทนต์ของคุณ</p>
                            <p className="text-xs text-slate-500">คุณมีบทความทั้งหมด {posts.length} รายการในระบบ</p>
                        </div>
                    </div>
                    <Button variant="ghost" asChild className="text-primary font-medium text-sm">
                        <Link href="/articles/new">เขียนบทความเพิ่ม</Link>
                    </Button>
                </div>
            )}

            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                isLoading={isDeleting}
                title="ยืนยันการลบบทความ"
                description="คุณต้องการลบบทความนี้ใช่หรือไม่? การลบนี้จะทำให้ข้อมูลหายไปจากระบบทันทีและไม่สามารถกู้คืนได้"
            />
        </DashboardLayout>
    );
}
