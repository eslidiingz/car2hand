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
import { cn } from "@/lib/utils";

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
            case "PUBLISHED": return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none rounded-lg px-2 py-0.5 text-[10px] font-black italic">PUBLISHED</Badge>;
            case "DRAFT": return <Badge variant="secondary" className="bg-slate-100 text-slate-500 hover:bg-slate-100 border-none rounded-lg px-2 py-0.5 text-[10px] font-black italic">DRAFT</Badge>;
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
                <Button asChild className="rounded-xl h-12 px-6 font-bold shadow-lg shadow-primary/20">
                    <Link href="/articles/new">
                        <Plus className="mr-2 h-5 w-5" /> เขียนบทความใหม่
                    </Link>
                </Button>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                    <p className="text-slate-500 font-bold">กำลังโหลดบทความ...</p>
                </div>
            ) : posts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                    {posts.map((post) => (
                        <Card key={post.id} className="rounded-[32px] overflow-hidden border-slate-100 group hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500">
                            <CardContent className="p-0 flex flex-col sm:flex-row">
                                <div className="w-full sm:w-48 h-48 sm:h-auto bg-slate-100 relative overflow-hidden flex-shrink-0">
                                    <img
                                        src={post.featuredImage || `https://picsum.photos/seed/${post.slug}/400/300`}
                                        alt={post.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute top-4 left-4">
                                        {getStatusBadge(post.status)}
                                    </div>
                                </div>

                                <div className="flex-1 p-6 flex flex-col">
                                    <div className="mb-4">
                                        <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/5 px-2.5 py-1 rounded-lg mb-3 inline-block italic">
                                            {post.category?.name || "ไม่มีหมวดหมู่"}
                                        </span>
                                        <h2 className="text-lg font-bold text-slate-800 leading-snug group-hover:text-primary transition-colors line-clamp-2 min-h-[3.5rem]">{post.title}</h2>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-4 text-slate-400">
                                        <span className="text-[10px] font-bold flex items-center gap-1.5 uppercase tracking-wider"><User size={12} className="text-slate-300" /> {post.author.fullName}</span>
                                        <span className="text-[10px] font-bold flex items-center gap-1.5 uppercase tracking-wider"><Calendar size={12} className="text-slate-300" /> {formatDate(post.createdAt)}</span>
                                        <span className="text-[10px] font-bold flex items-center gap-1.5 uppercase tracking-wider"><Eye size={12} className="text-slate-300" /> {post.viewCount.toLocaleString()}</span>
                                    </div>

                                    <div className="mt-8 pt-6 flex items-center justify-between border-t border-slate-50">
                                        <div className="flex gap-2">
                                            <Button variant="secondary" size="icon" asChild className="rounded-xl h-9 w-9">
                                                <Link href={`/articles/${post.id}`}>
                                                    <Edit size={16} />
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeleteClick(post.id)}
                                                className="rounded-xl h-9 w-9 text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
                                        <Button variant="ghost" asChild className="text-primary hover:text-primary/80 font-bold text-sm">
                                            <Link href={`/articles/${post.slug}`}>
                                                อ่านตัวอย่าง <Eye size={18} className="ml-2" />
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="rounded-[40px] p-20 text-center border-slate-100 border-dashed border-2 bg-slate-50/50">
                    <div className="h-24 w-24 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <BookOpen size={48} className="text-slate-300" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800">ยังไม่มีบทความ</h3>
                    <p className="text-slate-500 mt-2 mb-8 max-w-sm mx-auto">เริ่มต้นเขียนบทความแรกเพื่อให้ความรู้และเทคนิคดีๆ กับผู้ใช้งาน Car2Hand</p>
                    <Button asChild size="lg" className="rounded-2xl h-14 px-10 font-bold shadow-xl shadow-primary/20">
                        <Link href="/articles/new">
                            <Plus size={24} className="mr-2" /> เขียนบทความใหม่
                        </Link>
                    </Button>
                </Card>
            )}

            {!isLoading && posts.length > 0 && (
                <div className="mt-12 flex items-center justify-between p-8 bg-white rounded-[40px] border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-5">
                        <div className="h-14 w-14 bg-primary/5 rounded-2xl flex items-center justify-center text-primary">
                            <BookOpen size={28} />
                        </div>
                        <div>
                            <p className="text-base font-bold text-slate-800">จัดการคอนเทนต์ของคุณ</p>
                            <p className="text-sm text-slate-500 font-medium">คุณมีบทความทั้งหมด {posts.length} รายการในระบบ</p>
                        </div>
                    </div>
                    <Button variant="ghost" asChild className="text-primary font-bold hover:bg-primary/5 rounded-2xl px-6 h-12">
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
