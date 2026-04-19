"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    Inbox,
    Mail,
    Phone,
    Loader2,
    Check,
    Clock,
    ShieldAlert,
    CircleDot,
    X,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Status = "NEW" | "IN_PROGRESS" | "RESOLVED" | "SPAM";

interface Message {
    id: string;
    name: string;
    email: string;
    phoneNumber: string | null;
    subject: string;
    message: string;
    status: Status;
    isRead: boolean;
    adminNote: string | null;
    createdAt: string;
    readAt: string | null;
    resolvedAt: string | null;
}

const STATUS_META: Record<Status, { label: string; color: string; icon: React.ReactNode }> = {
    NEW: { label: "ใหม่", color: "bg-blue-100 text-blue-700", icon: <CircleDot size={12} /> },
    IN_PROGRESS: { label: "กำลังดำเนินการ", color: "bg-yellow-100 text-yellow-700", icon: <Clock size={12} /> },
    RESOLVED: { label: "แก้ไขแล้ว", color: "bg-green-100 text-green-700", icon: <Check size={12} /> },
    SPAM: { label: "สแปม", color: "bg-gray-100 text-gray-500", icon: <ShieldAlert size={12} /> },
};

export default function AdminContactPage() {
    const [statusFilter, setStatusFilter] = useState<Status | "ALL">("NEW");
    const [messages, setMessages] = useState<Message[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<Message | null>(null);
    const [note, setNote] = useState("");

    const fetchList = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (statusFilter !== "ALL") params.set("status", statusFilter);
            const data = await apiFetch(`/admin/contact?${params}`);
            setMessages(data.messages || []);
            setUnreadCount(data.unreadCount || 0);
        } catch {
            toast.error("โหลดรายการไม่สำเร็จ");
        } finally {
            setLoading(false);
        }
    }, [statusFilter]);

    useEffect(() => { fetchList(); }, [fetchList]);

    const openDetail = async (id: string) => {
        try {
            const data = await apiFetch(`/admin/contact/${id}`);
            setSelected(data.message);
            setNote(data.message.adminNote || "");
        } catch {
            toast.error("โหลดรายละเอียดไม่สำเร็จ");
        }
    };

    const updateStatus = async (newStatus: Status) => {
        if (!selected) return;
        try {
            await apiFetch(`/admin/contact/${selected.id}`, {
                method: "PUT",
                body: JSON.stringify({ status: newStatus, adminNote: note || undefined }),
            });
            toast.success("บันทึกสถานะเรียบร้อย");
            setSelected(null);
            fetchList();
        } catch {
            toast.error("บันทึกไม่สำเร็จ");
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Inbox className="text-primary" /> กล่องข้อความ
                            {unreadCount > 0 && (
                                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-500 text-white">{unreadCount} ยังไม่อ่าน</span>
                            )}
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">ข้อความจากฟอร์มติดต่อ /contact</p>
                    </div>
                </div>

                <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as Status | "ALL")}>
                    <TabsList>
                        <TabsTrigger value="ALL">ทั้งหมด</TabsTrigger>
                        <TabsTrigger value="NEW">
                            ใหม่
                            {unreadCount > 0 && <span className="ml-1.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unreadCount}</span>}
                        </TabsTrigger>
                        <TabsTrigger value="IN_PROGRESS">กำลังดำเนินการ</TabsTrigger>
                        <TabsTrigger value="RESOLVED">แก้ไขแล้ว</TabsTrigger>
                        <TabsTrigger value="SPAM">สแปม</TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="bg-card border border-border rounded-2xl overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-16"><Loader2 className="animate-spin text-primary" /></div>
                    ) : messages.length === 0 ? (
                        <div className="text-center py-16 text-muted-foreground">
                            <Inbox className="mx-auto mb-2 opacity-40" size={32} />
                            <p className="text-sm">ไม่มีข้อความ</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {messages.map((m) => (
                                <button
                                    key={m.id}
                                    onClick={() => openDetail(m.id)}
                                    className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-muted/40 transition ${!m.isRead ? "bg-blue-50/40" : ""}`}
                                >
                                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${!m.isRead ? "bg-blue-500" : "bg-transparent"}`} />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className={`${!m.isRead ? "font-bold" : "font-medium"} text-sm`}>{m.name}</span>
                                            <span className="text-xs text-muted-foreground">{m.email}</span>
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${STATUS_META[m.status].color}`}>
                                                {STATUS_META[m.status].icon} {STATUS_META[m.status].label}
                                            </span>
                                        </div>
                                        <div className={`${!m.isRead ? "font-semibold" : ""} text-sm mt-0.5 truncate`}>{m.subject}</div>
                                        <div className="text-xs text-muted-foreground truncate mt-0.5">{m.message}</div>
                                    </div>
                                    <div className="text-xs text-muted-foreground whitespace-nowrap">
                                        {new Date(m.createdAt).toLocaleDateString("th-TH", { day: "numeric", month: "short" })}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {selected && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && setSelected(null)}>
                    <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
                            <h2 className="font-bold text-lg truncate">{selected.subject}</h2>
                            <button onClick={() => setSelected(null)} className="w-9 h-9 rounded-full hover:bg-muted flex items-center justify-center"><X size={18} /></button>
                        </div>
                        <div className="p-5 space-y-4">
                            <div className="bg-muted/30 rounded-xl p-4 space-y-2 text-sm">
                                <div className="flex items-center gap-2"><strong>{selected.name}</strong></div>
                                <div className="flex items-center gap-2 text-muted-foreground"><Mail size={14} /> <a href={`mailto:${selected.email}`} className="text-primary hover:underline">{selected.email}</a></div>
                                {selected.phoneNumber && (
                                    <div className="flex items-center gap-2 text-muted-foreground"><Phone size={14} /> <a href={`tel:${selected.phoneNumber}`} className="text-primary hover:underline">{selected.phoneNumber}</a></div>
                                )}
                                <div className="text-xs text-muted-foreground">
                                    ส่งเมื่อ {new Date(selected.createdAt).toLocaleString("th-TH")}
                                </div>
                            </div>

                            <div className="whitespace-pre-wrap text-sm leading-relaxed bg-background border border-border rounded-xl p-4">
                                {selected.message}
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-1.5 block">บันทึกภายใน (admin note)</label>
                                <textarea
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    rows={3}
                                    className="w-full p-3 border border-border rounded-xl text-sm bg-background resize-none focus:outline-none focus:border-primary"
                                    placeholder="เช่น ได้โทรกลับเมื่อ 12:30 น."
                                />
                            </div>
                        </div>
                        <div className="sticky bottom-0 bg-card border-t border-border p-4 flex gap-2 flex-wrap">
                            <Button variant="outline" onClick={() => updateStatus("IN_PROGRESS")} disabled={selected.status === "IN_PROGRESS"}>กำลังดำเนินการ</Button>
                            <Button variant="outline" onClick={() => updateStatus("RESOLVED")} disabled={selected.status === "RESOLVED"}>แก้ไขแล้ว</Button>
                            <Button variant="outline" className="text-red-600" onClick={() => updateStatus("SPAM")} disabled={selected.status === "SPAM"}>สแปม</Button>
                            <div className="flex-1" />
                            <a href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject)}`} target="_blank" rel="noopener">
                                <Button>ตอบกลับทางอีเมล</Button>
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
