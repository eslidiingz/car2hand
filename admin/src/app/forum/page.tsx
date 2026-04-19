"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    MessageSquare,
    Pin,
    CheckCircle,
    EyeOff,
    Trash2,
    Loader2,
    Search,
    ExternalLink,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useDebounce } from "@/hooks/useDebounce";

interface ForumPost {
    id: string;
    title: string;
    content: string;
    status: "PUBLISHED" | "HIDDEN" | "DELETED";
    isPinned: boolean;
    isSolved: boolean;
    viewCount: number;
    createdAt: string;
    author: { id: string; fullName: string; email: string };
    category: { name: string; slug: string };
    _count: { comments: number; votes: number };
}

interface ForumComment {
    id: string;
    content: string;
    createdAt: string;
    author: { id: string; fullName: string };
    post: { id: string; title: string };
}

export default function AdminForumPage() {
    const [tab, setTab] = useState<"posts" | "comments">("posts");
    const [statusFilter, setStatusFilter] = useState<"PUBLISHED" | "HIDDEN" | "DELETED" | "ALL">("PUBLISHED");
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 500);
    const [posts, setPosts] = useState<ForumPost[]>([]);
    const [comments, setComments] = useState<ForumComment[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPosts = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ status: statusFilter });
            if (debouncedSearch) params.set("search", debouncedSearch);
            const data = await apiFetch(`/admin/forum/posts?${params}`);
            setPosts(data.posts || []);
        } catch {
            toast.error("โหลดกระทู้ไม่สำเร็จ");
        } finally {
            setLoading(false);
        }
    }, [statusFilter, debouncedSearch]);

    const fetchComments = useCallback(async () => {
        setLoading(true);
        try {
            const data = await apiFetch(`/admin/forum/comments`);
            setComments(data.comments || []);
        } catch {
            toast.error("โหลดความเห็นไม่สำเร็จ");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (tab === "posts") fetchPosts();
        else fetchComments();
    }, [tab, fetchPosts, fetchComments]);

    const togglePin = async (p: ForumPost) => {
        try {
            await apiFetch(`/admin/forum/posts/${p.id}`, { method: "PUT", body: JSON.stringify({ isPinned: !p.isPinned }) });
            toast.success(p.isPinned ? "ยกเลิกปักหมุด" : "ปักหมุดแล้ว");
            fetchPosts();
        } catch { toast.error("บันทึกไม่สำเร็จ"); }
    };
    const toggleSolved = async (p: ForumPost) => {
        try {
            await apiFetch(`/admin/forum/posts/${p.id}`, { method: "PUT", body: JSON.stringify({ isSolved: !p.isSolved }) });
            toast.success("บันทึกสถานะ");
            fetchPosts();
        } catch { toast.error("บันทึกไม่สำเร็จ"); }
    };
    const toggleHidden = async (p: ForumPost) => {
        const newStatus = p.status === "HIDDEN" ? "PUBLISHED" : "HIDDEN";
        try {
            await apiFetch(`/admin/forum/posts/${p.id}`, { method: "PUT", body: JSON.stringify({ status: newStatus }) });
            toast.success(newStatus === "HIDDEN" ? "ซ่อนกระทู้แล้ว" : "แสดงกระทู้แล้ว");
            fetchPosts();
        } catch { toast.error("บันทึกไม่สำเร็จ"); }
    };
    const softDelete = async (p: ForumPost) => {
        if (!confirm("ต้องการลบกระทู้นี้?")) return;
        try {
            await apiFetch(`/admin/forum/posts/${p.id}`, { method: "PUT", body: JSON.stringify({ status: "DELETED" }) });
            toast.success("ลบกระทู้แล้ว");
            fetchPosts();
        } catch { toast.error("ลบไม่สำเร็จ"); }
    };
    const deleteComment = async (id: string) => {
        if (!confirm("ลบความเห็นนี้?")) return;
        try {
            await apiFetch(`/admin/forum/comments/${id}`, { method: "DELETE" });
            toast.success("ลบแล้ว");
            fetchComments();
        } catch { toast.error("ลบไม่สำเร็จ"); }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <MessageSquare className="text-primary" /> ดูแลชุมชน
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">จัดการกระทู้และความเห็นในชุมชน</p>
                </div>

                <Tabs value={tab} onValueChange={(v) => setTab(v as "posts" | "comments")}>
                    <TabsList>
                        <TabsTrigger value="posts"><MessageSquare size={14} className="mr-1.5" /> กระทู้</TabsTrigger>
                        <TabsTrigger value="comments">ความเห็นล่าสุด</TabsTrigger>
                    </TabsList>

                    <TabsContent value="posts" className="space-y-4 mt-4">
                        <div className="flex items-center gap-3 flex-wrap">
                            <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as "PUBLISHED" | "HIDDEN" | "DELETED" | "ALL")}>
                                <TabsList>
                                    <TabsTrigger value="ALL">ทั้งหมด</TabsTrigger>
                                    <TabsTrigger value="PUBLISHED">แสดง</TabsTrigger>
                                    <TabsTrigger value="HIDDEN">ซ่อน</TabsTrigger>
                                    <TabsTrigger value="DELETED">ลบแล้ว</TabsTrigger>
                                </TabsList>
                            </Tabs>
                            <div className="relative flex-1 max-w-md">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="ค้นหากระทู้..."
                                    className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-background text-sm"
                                />
                            </div>
                        </div>

                        <div className="bg-card border border-border rounded-2xl overflow-hidden">
                            {loading ? (
                                <div className="flex items-center justify-center py-16"><Loader2 className="animate-spin text-primary" /></div>
                            ) : posts.length === 0 ? (
                                <div className="text-center py-16 text-muted-foreground text-sm">ไม่มีกระทู้</div>
                            ) : (
                                <div className="divide-y divide-border">
                                    {posts.map((p) => (
                                        <div key={p.id} className="p-4 hover:bg-muted/30 transition">
                                            <div className="flex items-start gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{p.category?.name}</span>
                                                        {p.isPinned && <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 inline-flex items-center gap-1"><Pin size={10} /> ปักหมุด</span>}
                                                        {p.isSolved && <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 inline-flex items-center gap-1"><CheckCircle size={10} /> แก้ไขแล้ว</span>}
                                                        {p.status === "HIDDEN" && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">ซ่อน</span>}
                                                        {p.status === "DELETED" && <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">ลบแล้ว</span>}
                                                    </div>
                                                    <div className="font-bold text-sm truncate">{p.title}</div>
                                                    <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.content}</div>
                                                    <div className="text-xs text-muted-foreground mt-2 flex items-center gap-3 flex-wrap">
                                                        <span>โดย {p.author.fullName}</span>
                                                        <span>{new Date(p.createdAt).toLocaleDateString("th-TH")}</span>
                                                        <span>{p._count.comments} ตอบ · {p._count.votes} โหวต · {p.viewCount} views</span>
                                                    </div>
                                                </div>
                                                <a href={`http://localhost:3000/community/topic/${p.id}`} target="_blank" rel="noopener" className="text-muted-foreground hover:text-primary p-1">
                                                    <ExternalLink size={16} />
                                                </a>
                                            </div>
                                            <div className="flex items-center gap-2 mt-3 flex-wrap">
                                                <Button size="sm" variant="outline" onClick={() => togglePin(p)}>
                                                    <Pin size={14} /> {p.isPinned ? "ยกเลิกปักหมุด" : "ปักหมุด"}
                                                </Button>
                                                <Button size="sm" variant="outline" onClick={() => toggleSolved(p)}>
                                                    <CheckCircle size={14} /> {p.isSolved ? "ยกเลิกแก้ไขแล้ว" : "ทำเครื่องหมายแก้ไข"}
                                                </Button>
                                                <Button size="sm" variant="outline" onClick={() => toggleHidden(p)}>
                                                    <EyeOff size={14} /> {p.status === "HIDDEN" ? "แสดง" : "ซ่อน"}
                                                </Button>
                                                {p.status !== "DELETED" && (
                                                    <Button size="sm" variant="outline" className="text-red-600" onClick={() => softDelete(p)}>
                                                        <Trash2 size={14} /> ลบ
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="comments" className="mt-4">
                        <div className="bg-card border border-border rounded-2xl overflow-hidden">
                            {loading ? (
                                <div className="flex items-center justify-center py-16"><Loader2 className="animate-spin text-primary" /></div>
                            ) : comments.length === 0 ? (
                                <div className="text-center py-16 text-muted-foreground text-sm">ไม่มีความเห็น</div>
                            ) : (
                                <div className="divide-y divide-border">
                                    {comments.map((c) => (
                                        <div key={c.id} className="p-4 flex items-start gap-3 hover:bg-muted/30">
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm"><strong>{c.author.fullName}</strong> <span className="text-muted-foreground">ใน</span> <span className="text-primary">{c.post.title}</span></div>
                                                <div className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap line-clamp-3">{c.content}</div>
                                                <div className="text-xs text-muted-foreground mt-1">{new Date(c.createdAt).toLocaleString("th-TH")}</div>
                                            </div>
                                            <Button size="sm" variant="outline" className="text-red-600" onClick={() => deleteComment(c.id)}>
                                                <Trash2 size={14} /> ลบ
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}
