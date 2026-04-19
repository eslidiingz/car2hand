"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import {
    BadgeCheck,
    Building2,
    Clock,
    Loader2,
    Search,
    Shield,
    User as UserIcon,
    X,
    Check,
    XCircle,
    Eye,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type KycType = "ID" | "BUSINESS" | "DEALER";
type KycStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

interface Submission {
    id: string;
    userId: string;
    type: KycType;
    status: KycStatus;
    fullName: string | null;
    idNumber: string | null;
    idCardImage: string | null;
    selfieImage: string | null;
    businessName: string | null;
    taxId: string | null;
    businessCertImage: string | null;
    addressProofImage: string | null;
    dealerAppointmentDoc: string | null;
    requestedShowroom: "INDIVIDUAL" | "TENT" | "DEALER" | null;
    submittedAt: string;
    reviewedAt: string | null;
    reviewNote: string | null;
    user: {
        id: string;
        fullName: string;
        email: string;
        phoneNumber: string;
        profileImage: string | null;
    };
}

const TYPE_META: Record<KycType, { label: string; icon: React.ReactNode; color: string }> = {
    ID: { label: "ยืนยันบุคคล", icon: <UserIcon size={14} />, color: "bg-blue-100 text-blue-700" },
    BUSINESS: { label: "ร้านรับรอง", icon: <Building2 size={14} />, color: "bg-emerald-100 text-emerald-700" },
    DEALER: { label: "ดีลเลอร์รับรอง", icon: <Shield size={14} />, color: "bg-amber-100 text-amber-700" },
};

const STATUS_META: Record<KycStatus, { label: string; color: string; icon: React.ReactNode }> = {
    PENDING: { label: "รอตรวจสอบ", color: "bg-yellow-100 text-yellow-700", icon: <Clock size={12} /> },
    APPROVED: { label: "อนุมัติแล้ว", color: "bg-green-100 text-green-700", icon: <Check size={12} /> },
    REJECTED: { label: "ไม่ผ่าน", color: "bg-red-100 text-red-700", icon: <XCircle size={12} /> },
    CANCELLED: { label: "ยกเลิก", color: "bg-gray-100 text-gray-500", icon: <X size={12} /> },
};

function DocImage({ label, url }: { label: string; url: string | null }) {
    const [expanded, setExpanded] = useState(false);
    if (!url) {
        return (
            <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                <div className="text-xs font-medium text-gray-500">{label}</div>
                <div className="text-xs text-gray-400 mt-1">ไม่ได้อัปโหลด</div>
            </div>
        );
    }
    return (
        <>
            <button
                onClick={() => setExpanded(true)}
                className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50 hover:shadow-md transition text-left w-full"
            >
                <div className="aspect-[4/3] relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={label} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition flex items-center justify-center opacity-0 hover:opacity-100">
                        <Eye className="text-white" size={24} />
                    </div>
                </div>
                <div className="p-2 text-xs font-medium text-gray-700 border-t border-gray-200">{label}</div>
            </button>
            {expanded && (
                <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4" onClick={() => setExpanded(false)}>
                    <button className="absolute top-4 right-4 text-white" onClick={() => setExpanded(false)}>
                        <X size={32} />
                    </button>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={label} className="max-w-full max-h-full object-contain" />
                </div>
            )}
        </>
    );
}

export default function AdminKycPage() {
    const [statusFilter, setStatusFilter] = useState<KycStatus | "ALL">("PENDING");
    const [typeFilter, setTypeFilter] = useState<KycType | "">("");
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [pendingByType, setPendingByType] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<Submission | null>(null);
    const [reviewNote, setReviewNote] = useState("");
    const [actionLoading, setActionLoading] = useState(false);

    const fetchList = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ status: statusFilter });
            if (typeFilter) params.set("type", typeFilter);
            const data = await apiFetch(`/admin/kyc?${params}`);
            setSubmissions(data.submissions || []);
            setPendingByType(data.pendingByType || {});
        } catch (err) {
            console.error(err);
            toast.error("โหลดรายการไม่สำเร็จ");
        } finally {
            setLoading(false);
        }
    }, [statusFilter, typeFilter]);

    useEffect(() => { fetchList(); }, [fetchList]);

    const openReview = async (sub: Submission) => {
        // Re-fetch full detail — /admin/kyc/:id returns the same shape plus history
        try {
            const data = await apiFetch(`/admin/kyc/${sub.id}`);
            setSelected(data.submission);
            setReviewNote("");
        } catch {
            toast.error("โหลดรายละเอียดไม่สำเร็จ");
        }
    };

    const handleApprove = async () => {
        if (!selected) return;
        setActionLoading(true);
        try {
            await apiFetch(`/admin/kyc/${selected.id}/approve`, {
                method: "POST",
                body: JSON.stringify({ note: reviewNote || undefined }),
            });
            toast.success("อนุมัติเรียบร้อย");
            setSelected(null);
            fetchList();
        } catch {
            toast.error("อนุมัติไม่สำเร็จ");
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        if (!selected) return;
        if (!reviewNote.trim()) {
            toast.error("กรุณาระบุเหตุผลของการปฏิเสธ");
            return;
        }
        setActionLoading(true);
        try {
            await apiFetch(`/admin/kyc/${selected.id}/reject`, {
                method: "POST",
                body: JSON.stringify({ reason: reviewNote.trim() }),
            });
            toast.success("ปฏิเสธเรียบร้อย");
            setSelected(null);
            fetchList();
        } catch {
            toast.error("ปฏิเสธไม่สำเร็จ");
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                        <BadgeCheck className="text-primary" /> ยืนยันตัวตน (KYC)
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">ตรวจสอบและอนุมัติคำขอยืนยันตัวตนของผู้ขาย</p>
                </div>

                {/* Pending summary */}
                <div className="grid grid-cols-3 gap-4">
                    {(["ID", "BUSINESS", "DEALER"] as KycType[]).map((t) => (
                        <div key={t} className="bg-card border border-border rounded-2xl p-4">
                            <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                {TYPE_META[t].icon}
                                <span className="text-xs font-medium">{TYPE_META[t].label}</span>
                            </div>
                            <div className="text-2xl font-bold">{pendingByType[t] || 0}</div>
                            <div className="text-xs text-muted-foreground">รอตรวจสอบ</div>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="flex items-center gap-3 flex-wrap">
                    <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as KycStatus | "ALL")}>
                        <TabsList>
                            <TabsTrigger value="ALL">ทั้งหมด</TabsTrigger>
                            <TabsTrigger value="PENDING">
                                รอตรวจสอบ
                                {pendingByType && Object.values(pendingByType).reduce((a, b) => a + b, 0) > 0 && (
                                    <span className="ml-1.5 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                        {Object.values(pendingByType).reduce((a, b) => a + b, 0)}
                                    </span>
                                )}
                            </TabsTrigger>
                            <TabsTrigger value="APPROVED">อนุมัติแล้ว</TabsTrigger>
                            <TabsTrigger value="REJECTED">ปฏิเสธแล้ว</TabsTrigger>
                        </TabsList>
                    </Tabs>
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value as KycType | "")}
                        className="h-9 px-3 rounded-lg border border-border bg-background text-sm"
                    >
                        <option value="">ทุกประเภท</option>
                        <option value="ID">ยืนยันบุคคล</option>
                        <option value="BUSINESS">ร้านรับรอง</option>
                        <option value="DEALER">ดีลเลอร์รับรอง</option>
                    </select>
                </div>

                {/* Table */}
                <div className="bg-card border border-border rounded-2xl overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-16"><Loader2 className="animate-spin text-primary" /></div>
                    ) : submissions.length === 0 ? (
                        <div className="text-center py-16 text-muted-foreground">
                            <Search className="mx-auto mb-2 opacity-40" size={32} />
                            <p className="text-sm">ไม่มีรายการ</p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-muted/40">
                                <tr className="text-left text-xs text-muted-foreground">
                                    <th className="px-4 py-3 font-medium">ผู้ใช้</th>
                                    <th className="px-4 py-3 font-medium">ประเภท</th>
                                    <th className="px-4 py-3 font-medium">สถานะ</th>
                                    <th className="px-4 py-3 font-medium">วันที่ยื่น</th>
                                    <th className="px-4 py-3 font-medium"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {submissions.map((s) => (
                                    <tr key={s.id} className="hover:bg-muted/30 transition">
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-foreground text-sm">{s.user.fullName}</div>
                                            <div className="text-xs text-muted-foreground">{s.user.email}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_META[s.type].color}`}>
                                                {TYPE_META[s.type].icon} {TYPE_META[s.type].label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_META[s.status].color}`}>
                                                {STATUS_META[s.status].icon} {STATUS_META[s.status].label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-muted-foreground">
                                            {new Date(s.submittedAt).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Button size="sm" variant="outline" onClick={() => openReview(s)}>
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

            {/* Review modal */}
            {selected && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={(e) => e.target === e.currentTarget && !actionLoading && setSelected(null)}>
                    <div className="bg-card border border-border rounded-t-3xl sm:rounded-3xl w-full max-w-3xl max-h-[92vh] overflow-y-auto">
                        <div className="sticky top-0 bg-card border-b border-border p-4 sm:p-5 flex items-center justify-between z-10">
                            <div>
                                <h2 className="font-bold text-lg">ตรวจสอบคำขอ</h2>
                                <p className="text-xs text-muted-foreground">{TYPE_META[selected.type].label}</p>
                            </div>
                            <button onClick={() => setSelected(null)} className="w-9 h-9 rounded-full hover:bg-muted flex items-center justify-center"><X size={18} /></button>
                        </div>

                        <div className="p-4 sm:p-5 space-y-5">
                            {/* User info */}
                            <div className="bg-muted/30 rounded-xl p-4 flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                                    {selected.user.fullName.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-bold text-sm">{selected.user.fullName}</div>
                                    <div className="text-xs text-muted-foreground">{selected.user.email} · {selected.user.phoneNumber}</div>
                                </div>
                            </div>

                            {/* Identity section */}
                            <section>
                                <h3 className="font-bold text-sm mb-3">ข้อมูลบุคคล</h3>
                                <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                                    <div>
                                        <div className="text-xs text-muted-foreground">ชื่อ-นามสกุล</div>
                                        <div className="font-medium">{selected.fullName || "-"}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-muted-foreground">เลขบัตรประชาชน</div>
                                        <div className="font-mono">{selected.idNumber || "-"}</div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <DocImage label="รูปบัตรประชาชน" url={selected.idCardImage} />
                                    <DocImage label="รูปเซลฟี่ถือบัตร" url={selected.selfieImage} />
                                </div>
                            </section>

                            {/* Business section */}
                            {selected.type !== "ID" && (
                                <section>
                                    <h3 className="font-bold text-sm mb-3">ข้อมูลธุรกิจ</h3>
                                    <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                                        <div>
                                            <div className="text-xs text-muted-foreground">ชื่อร้าน/บริษัท</div>
                                            <div className="font-medium">{selected.businessName || "-"}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-muted-foreground">เลขทะเบียน/ผู้เสียภาษี</div>
                                            <div className="font-mono">{selected.taxId || "-"}</div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <DocImage label="หนังสือรับรอง/ทะเบียนพาณิชย์" url={selected.businessCertImage} />
                                        <DocImage label="หลักฐานที่อยู่ร้าน" url={selected.addressProofImage} />
                                    </div>
                                </section>
                            )}

                            {selected.type === "DEALER" && (
                                <section>
                                    <h3 className="font-bold text-sm mb-3">หนังสือแต่งตั้ง</h3>
                                    <div className="grid grid-cols-1 gap-3">
                                        <DocImage label="หนังสือแต่งตั้งจากค่ายรถ" url={selected.dealerAppointmentDoc} />
                                    </div>
                                </section>
                            )}

                            {selected.requestedShowroom && (
                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-800">
                                    ขอเปลี่ยนประเภทร้านเป็น: <strong>
                                        {selected.requestedShowroom === "INDIVIDUAL" ? "บุคคล" : selected.requestedShowroom === "TENT" ? "เต็นท์" : "ดีลเลอร์"}
                                    </strong>
                                </div>
                            )}

                            {/* Review note */}
                            {selected.status === "PENDING" ? (
                                <section>
                                    <h3 className="font-bold text-sm mb-2">หมายเหตุ / เหตุผล</h3>
                                    <textarea
                                        value={reviewNote}
                                        onChange={(e) => setReviewNote(e.target.value)}
                                        placeholder="เหตุผลกรณีปฏิเสธ (จำเป็น) หรือหมายเหตุกรณีอนุมัติ (ไม่บังคับ)"
                                        rows={3}
                                        className="w-full p-3 border border-border rounded-xl text-sm bg-background resize-none focus:outline-none focus:border-primary"
                                    />
                                </section>
                            ) : selected.reviewNote ? (
                                <div className="bg-muted/40 rounded-xl p-3 text-sm">
                                    <div className="text-xs text-muted-foreground mb-1">หมายเหตุจากผู้ตรวจสอบ</div>
                                    <div>{selected.reviewNote}</div>
                                </div>
                            ) : null}
                        </div>

                        {selected.status === "PENDING" && (
                            <div className="sticky bottom-0 bg-card border-t border-border p-4 flex gap-3">
                                <Button variant="outline" className="flex-1" onClick={handleReject} disabled={actionLoading}>
                                    {actionLoading ? <Loader2 className="animate-spin" size={16} /> : <XCircle size={16} />}
                                    ปฏิเสธ
                                </Button>
                                <Button className="flex-1" onClick={handleApprove} disabled={actionLoading}>
                                    {actionLoading ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
                                    อนุมัติ
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
