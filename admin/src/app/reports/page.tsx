"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    Flag,
    Loader2,
    ExternalLink,
    X,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ReportStatus = "OPEN" | "REVIEWING" | "RESOLVED" | "DISMISSED";
type TargetType = "LISTING" | "FORUM_POST" | "FORUM_COMMENT" | "USER";

interface AbuseReport {
    id: string;
    reporterId: string | null;
    targetType: TargetType;
    targetId: string;
    reason: string;
    description: string | null;
    status: ReportStatus;
    adminNote: string | null;
    createdAt: string;
    reviewedAt: string | null;
    reporter: { id: string; fullName: string; email: string } | null;
}

const STATUS_META: Record<ReportStatus, { label: string; color: string }> = {
    OPEN: { label: "รอตรวจสอบ", color: "bg-red-100 text-red-700" },
    REVIEWING: { label: "กำลังตรวจสอบ", color: "bg-yellow-100 text-yellow-700" },
    RESOLVED: { label: "ดำเนินการแล้ว", color: "bg-green-100 text-green-700" },
    DISMISSED: { label: "ไม่เป็นความจริง", color: "bg-gray-100 text-gray-500" },
};

const TARGET_LABEL: Record<TargetType, string> = {
    LISTING: "ประกาศขายรถ",
    FORUM_POST: "กระทู้ชุมชน",
    FORUM_COMMENT: "ความเห็น",
    USER: "ผู้ใช้",
};

const REASON_LABEL: Record<string, string> = {
    SPAM: "สแปม/โฆษณา",
    FRAUD: "หลอกลวง/ฉ้อโกง",
    INAPPROPRIATE: "เนื้อหาไม่เหมาะสม",
    DUPLICATE: "ลงซ้ำ",
    OTHER: "อื่นๆ",
};

function targetUrl(r: AbuseReport): string | null {
    const frontend = "http://localhost:3000";
    switch (r.targetType) {
        case "LISTING": return `${frontend}/buy/${r.targetId}`;
        case "FORUM_POST": return `${frontend}/community/topic/${r.targetId}`;
        case "USER": return `${frontend}/sellers/${r.targetId}`;
        default: return null;
    }
}

export default function AdminReportsPage() {
    const [statusFilter, setStatusFilter] = useState<ReportStatus | "ALL">("OPEN");
    const [targetFilter, setTargetFilter] = useState<TargetType | "">("");
    const [reports, setReports] = useState<AbuseReport[]>([]);
    const [openCount, setOpenCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<AbuseReport | null>(null);
    const [note, setNote] = useState("");

    const fetchList = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ status: statusFilter });
            if (targetFilter) params.set("targetType", targetFilter);
            const data = await apiFetch(`/admin/reports?${params}`);
            setReports(data.reports || []);
            setOpenCount(data.openCount || 0);
        } catch {
            toast.error("โหลดรายงานไม่สำเร็จ");
        } finally {
            setLoading(false);
        }
    }, [statusFilter, targetFilter]);

    useEffect(() => { fetchList(); }, [fetchList]);

    const updateStatus = async (status: ReportStatus) => {
        if (!selected) return;
        try {
            await apiFetch(`/admin/reports/${selected.id}`, {
                method: "PUT",
                body: JSON.stringify({ status, adminNote: note || undefined }),
            });
            toast.success("บันทึกเรียบร้อย");
            setSelected(null);
            setNote("");
            fetchList();
        } catch {
            toast.error("บันทึกไม่สำเร็จ");
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Flag className="text-primary" /> รายงานการใช้ในทางผิด
                        {openCount > 0 && <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-500 text-white">{openCount}</span>}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">ข้อกังวลจากผู้ใช้เกี่ยวกับประกาศ กระทู้ หรือผู้ใช้รายอื่น</p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as ReportStatus | "ALL")}>
                        <TabsList>
                            <TabsTrigger value="ALL">ทั้งหมด</TabsTrigger>
                            <TabsTrigger value="OPEN">
                                รอตรวจสอบ
                                {openCount > 0 && <span className="ml-1.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{openCount}</span>}
                            </TabsTrigger>
                            <TabsTrigger value="REVIEWING">กำลังตรวจสอบ</TabsTrigger>
                            <TabsTrigger value="RESOLVED">ดำเนินการแล้ว</TabsTrigger>
                            <TabsTrigger value="DISMISSED">ไม่เป็นความจริง</TabsTrigger>
                        </TabsList>
                    </Tabs>
                    <select
                        value={targetFilter}
                        onChange={(e) => setTargetFilter(e.target.value as TargetType | "")}
                        className="h-9 px-3 rounded-lg border border-border bg-background text-sm"
                    >
                        <option value="">ทุกประเภท</option>
                        <option value="LISTING">ประกาศ</option>
                        <option value="FORUM_POST">กระทู้</option>
                        <option value="FORUM_COMMENT">ความเห็น</option>
                        <option value="USER">ผู้ใช้</option>
                    </select>
                </div>

                <div className="bg-card border border-border rounded-2xl overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-16"><Loader2 className="animate-spin text-primary" /></div>
                    ) : reports.length === 0 ? (
                        <div className="text-center py-16 text-muted-foreground text-sm">ไม่มีรายงาน</div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-muted/40 text-xs text-muted-foreground text-left">
                                <tr>
                                    <th className="px-4 py-3 font-medium">รายงานโดย</th>
                                    <th className="px-4 py-3 font-medium">ประเภท</th>
                                    <th className="px-4 py-3 font-medium">เหตุผล</th>
                                    <th className="px-4 py-3 font-medium">สถานะ</th>
                                    <th className="px-4 py-3 font-medium">วันที่</th>
                                    <th className="px-4 py-3 font-medium"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {reports.map((r) => (
                                    <tr key={r.id} className="hover:bg-muted/30">
                                        <td className="px-4 py-3 text-sm">
                                            {r.reporter ? (
                                                <>
                                                    <div className="font-medium">{r.reporter.fullName}</div>
                                                    <div className="text-xs text-muted-foreground">{r.reporter.email}</div>
                                                </>
                                            ) : (
                                                <span className="text-muted-foreground italic">ไม่ระบุตัวตน</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm">{TARGET_LABEL[r.targetType]}</td>
                                        <td className="px-4 py-3 text-sm">{REASON_LABEL[r.reason] || r.reason}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_META[r.status].color}`}>
                                                {STATUS_META[r.status].label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-muted-foreground">
                                            {new Date(r.createdAt).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Button size="sm" variant="outline" onClick={() => { setSelected(r); setNote(r.adminNote || ""); }}>
                                                ตรวจสอบ
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {selected && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && setSelected(null)}>
                    <div className="bg-card border border-border rounded-2xl w-full max-w-xl">
                        <div className="border-b border-border p-4 flex items-center justify-between">
                            <h2 className="font-bold">รายละเอียดรายงาน</h2>
                            <button onClick={() => setSelected(null)} className="w-9 h-9 rounded-full hover:bg-muted flex items-center justify-center"><X size={18} /></button>
                        </div>
                        <div className="p-5 space-y-4 text-sm">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <div className="text-xs text-muted-foreground mb-1">ประเภท</div>
                                    <div className="font-medium">{TARGET_LABEL[selected.targetType]}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground mb-1">เหตุผล</div>
                                    <div className="font-medium">{REASON_LABEL[selected.reason]}</div>
                                </div>
                            </div>
                            {selected.description && (
                                <div>
                                    <div className="text-xs text-muted-foreground mb-1">รายละเอียดจากผู้รายงาน</div>
                                    <div className="bg-muted/30 rounded-xl p-3 whitespace-pre-wrap">{selected.description}</div>
                                </div>
                            )}
                            {targetUrl(selected) && (
                                <a href={targetUrl(selected)!} target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-primary hover:underline text-sm">
                                    <ExternalLink size={14} /> ดูเนื้อหาที่ถูกรายงาน
                                </a>
                            )}
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">บันทึกภายใน</label>
                                <textarea
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    rows={3}
                                    className="w-full p-3 border border-border rounded-xl text-sm bg-background resize-none focus:outline-none focus:border-primary"
                                />
                            </div>
                        </div>
                        <div className="border-t border-border p-4 flex gap-2 flex-wrap">
                            <Button variant="outline" onClick={() => updateStatus("REVIEWING")} disabled={selected.status === "REVIEWING"}>กำลังตรวจสอบ</Button>
                            <Button variant="outline" className="text-green-600" onClick={() => updateStatus("RESOLVED")}>ดำเนินการแล้ว</Button>
                            <Button variant="outline" className="text-gray-600" onClick={() => updateStatus("DISMISSED")}>ไม่เป็นความจริง</Button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
