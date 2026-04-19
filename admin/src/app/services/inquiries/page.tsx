"use client";

import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
    Search,
    Filter,
    MessageSquare,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Phone,
    User,
    Send,
    Trash2,
    Eye,
} from "lucide-react";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface Inquiry {
    id: string;
    type: string;
    customerName: string;
    customerPhone: string;
    details: string;
    status: string;
    adminNote?: string;
    createdAt: string;
}

const TYPE_OPTIONS = [
    { value: "ALL", label: "ทุกประเภท" },
    { value: "FINANCE", label: "สินเชื่อ" },
    { value: "INSURANCE", label: "ประกัน" },
    { value: "DELIVERY", label: "จัดส่ง" },
    { value: "TRANSFER", label: "โอนเปลี่ยน" },
    { value: "GENERAL", label: "ทั่วไป" },
];

const STATUS_OPTIONS = [
    { value: "ALL", label: "ทุกสถานะ" },
    { value: "NEW", label: "ใหม่" },
    { value: "IN_PROGRESS", label: "กำลังดำเนินการ" },
    { value: "RESOLVED", label: "แก้ไขแล้ว" },
    { value: "CLOSED", label: "ปิด" },
];

const TYPE_COLORS: Record<string, string> = {
    FINANCE: "bg-yellow-100 text-yellow-800 border-yellow-200",
    INSURANCE: "bg-blue-100 text-blue-800 border-blue-200",
    DELIVERY: "bg-purple-100 text-purple-800 border-purple-200",
    TRANSFER: "bg-gray-100 text-gray-800 border-gray-200",
    GENERAL: "bg-slate-100 text-slate-800 border-slate-200",
};

const TYPE_LABELS: Record<string, string> = {
    FINANCE: "สินเชื่อ",
    INSURANCE: "ประกัน",
    DELIVERY: "จัดส่ง",
    TRANSFER: "โอนเปลี่ยน",
    GENERAL: "ทั่วไป",
};

const STATUS_COLORS: Record<string, string> = {
    NEW: "bg-green-100 text-green-800 border-green-200",
    IN_PROGRESS: "bg-orange-100 text-orange-800 border-orange-200",
    RESOLVED: "bg-blue-100 text-blue-800 border-blue-200",
    CLOSED: "bg-slate-100 text-slate-800 border-slate-200",
};

const STATUS_LABELS: Record<string, string> = {
    NEW: "ใหม่",
    IN_PROGRESS: "กำลังดำเนินการ",
    RESOLVED: "แก้ไขแล้ว",
    CLOSED: "ปิด",
};

export default function AdminInquiriesPage() {
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [loading, setLoading] = useState(true);
    const [typeFilter, setTypeFilter] = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [adminNote, setAdminNote] = useState("");
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [savingNote, setSavingNote] = useState(false);
    const [deleteInquiry, setDeleteInquiry] = useState<Inquiry | null>(null);
    const [deleting, setDeleting] = useState(false);

    const fetchInquiries = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({ page: String(page) });
            if (typeFilter !== "ALL") params.set("type", typeFilter);
            if (statusFilter !== "ALL") params.set("status", statusFilter);

            const res = await apiFetch(`/admin/services/inquiries?${params}`);
            if (res.ok) {
                const data = await res.json();
                setInquiries(data.data || data.inquiries || []);
                setTotalPages(data.totalPages || data.pagination?.totalPages || 1);
            } else {
                toast.error("ไม่สามารถโหลดข้อมูลการสอบถามได้");
            }
        } catch {
            toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
        } finally {
            setLoading(false);
        }
    }, [page, typeFilter, statusFilter]);

    useEffect(() => {
        fetchInquiries();
    }, [fetchInquiries]);

    const updateStatus = async (inquiryId: string, newStatus: string) => {
        try {
            setUpdatingId(inquiryId);
            const res = await apiFetch(`/admin/services/inquiries/${inquiryId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                toast.success("อัปเดตสถานะสำเร็จ");
                fetchInquiries();
            } else {
                toast.error("ไม่สามารถอัปเดตสถานะได้");
            }
        } catch {
            toast.error("เกิดข้อผิดพลาด");
        } finally {
            setUpdatingId(null);
        }
    };

    const saveAdminNote = async () => {
        if (!selectedInquiry) return;
        try {
            setSavingNote(true);
            const res = await apiFetch(`/admin/services/inquiries/${selectedInquiry.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ adminNote }),
            });
            if (res.ok) {
                toast.success("บันทึกหมายเหตุสำเร็จ");
                fetchInquiries();
                setDetailOpen(false);
            } else {
                toast.error("ไม่สามารถบันทึกหมายเหตุได้");
            }
        } catch {
            toast.error("เกิดข้อผิดพลาด");
        } finally {
            setSavingNote(false);
        }
    };

    const openDetail = (inquiry: Inquiry) => {
        setSelectedInquiry(inquiry);
        setAdminNote(inquiry.adminNote || "");
        setDetailOpen(true);
    };

    const handleDelete = async () => {
        if (!deleteInquiry) return;
        setDeleting(true);
        try {
            const res = await apiFetch(`/admin/services/inquiries/${deleteInquiry.id}`, {
                method: "DELETE",
            });
            toast.success(res?.message || "ลบการสอบถามเรียบร้อย");
            setDeleteInquiry(null);
            fetchInquiries();
        } catch (err: any) {
            toast.error(err?.message || "ไม่สามารถลบการสอบถามได้");
        } finally {
            setDeleting(false);
        }
    };

    const formatDate = (dateStr: string) => {
        try {
            return new Date(dateStr).toLocaleDateString("th-TH", {
                year: "numeric",
                month: "short",
                day: "numeric",
            });
        } catch {
            return dateStr;
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <MessageSquare className="h-6 w-6 text-foreground" />
                    <h1 className="text-2xl font-bold text-foreground">จัดการการสอบถาม</h1>
                </div>

                {/* Filter Bar */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="ประเภท" />
                            </SelectTrigger>
                            <SelectContent>
                                {TYPE_OPTIONS.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="สถานะ" />
                            </SelectTrigger>
                            <SelectContent>
                                {STATUS_OPTIONS.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Table */}
                <div className="rounded-lg border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">ID</TableHead>
                                <TableHead>ประเภท</TableHead>
                                <TableHead>ลูกค้า</TableHead>
                                <TableHead>เบอร์โทร</TableHead>
                                <TableHead>รายละเอียด</TableHead>
                                <TableHead>สถานะ</TableHead>
                                <TableHead>วันที่</TableHead>
                                <TableHead className="text-right">จัดการ</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="py-12 text-center">
                                        <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                                        <p className="mt-2 text-sm text-muted-foreground">กำลังโหลด...</p>
                                    </TableCell>
                                </TableRow>
                            ) : inquiries.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="py-12 text-center">
                                        <MessageSquare className="mx-auto h-10 w-10 text-muted-foreground" />
                                        <p className="mt-2 text-sm text-muted-foreground">ไม่พบรายการสอบถาม</p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                inquiries.map((inquiry) => (
                                    <TableRow key={inquiry.id}>
                                        <TableCell className="font-mono text-xs text-muted-foreground">
                                            {inquiry.id.slice(0, 8)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={cn("text-xs font-medium", TYPE_COLORS[inquiry.type])}
                                            >
                                                {TYPE_LABELS[inquiry.type] || inquiry.type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-medium">{inquiry.customerName}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {inquiry.customerPhone}
                                        </TableCell>
                                        <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                                            {inquiry.details}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={cn("text-xs font-medium", STATUS_COLORS[inquiry.status])}
                                            >
                                                {STATUS_LABELS[inquiry.status] || inquiry.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {formatDate(inquiry.createdAt)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => openDetail(inquiry)}
                                                    title="ดูรายละเอียด"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Select
                                                    value={inquiry.status}
                                                    onValueChange={(v) => updateStatus(inquiry.id, v)}
                                                    disabled={updatingId === inquiry.id}
                                                >
                                                    <SelectTrigger className="h-8 w-[130px] text-xs">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {STATUS_OPTIONS.filter((o) => o.value !== "ALL").map((opt) => (
                                                            <SelectItem key={opt.value} value={opt.value}>
                                                                {opt.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setDeleteInquiry(inquiry)}
                                                    className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                                                    title="ลบ"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            หน้า {page} จาก {totalPages}
                        </p>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page <= 1}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page >= totalPages}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* Inquiry Detail Dialog */}
                <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>รายละเอียดการสอบถาม</DialogTitle>
                        </DialogHeader>
                        {selectedInquiry && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-muted-foreground">รหัส</p>
                                        <p className="font-mono font-medium">{selectedInquiry.id.slice(0, 12)}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">ประเภท</p>
                                        <Badge
                                            variant="outline"
                                            className={cn("text-xs", TYPE_COLORS[selectedInquiry.type])}
                                        >
                                            {TYPE_LABELS[selectedInquiry.type] || selectedInquiry.type}
                                        </Badge>
                                    </div>
                                    <div>
                                        <p className="flex items-center gap-1 text-muted-foreground">
                                            <User className="h-3.5 w-3.5" /> ลูกค้า
                                        </p>
                                        <p className="font-medium">{selectedInquiry.customerName}</p>
                                    </div>
                                    <div>
                                        <p className="flex items-center gap-1 text-muted-foreground">
                                            <Phone className="h-3.5 w-3.5" /> เบอร์โทร
                                        </p>
                                        <p className="font-medium">{selectedInquiry.customerPhone}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-muted-foreground">รายละเอียด</p>
                                        <p className="mt-1 rounded-md bg-muted p-3 text-foreground">
                                            {selectedInquiry.details}
                                        </p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-muted-foreground">สถานะ</p>
                                        <Badge
                                            variant="outline"
                                            className={cn("text-xs", STATUS_COLORS[selectedInquiry.status])}
                                        >
                                            {STATUS_LABELS[selectedInquiry.status] || selectedInquiry.status}
                                        </Badge>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-muted-foreground">วันที่สร้าง</p>
                                        <p className="text-foreground">{formatDate(selectedInquiry.createdAt)}</p>
                                    </div>
                                </div>

                                {/* Admin Note */}
                                <div className="space-y-2 border-t pt-4">
                                    <Label htmlFor="adminNote">หมายเหตุจากแอดมิน</Label>
                                    <Textarea
                                        id="adminNote"
                                        value={adminNote}
                                        onChange={(e) => setAdminNote(e.target.value)}
                                        placeholder="เพิ่มหมายเหตุ..."
                                        rows={3}
                                    />
                                    <Button
                                        size="sm"
                                        onClick={saveAdminNote}
                                        disabled={savingNote}
                                    >
                                        {savingNote ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <Send className="mr-2 h-4 w-4" />
                                        )}
                                        บันทึกหมายเหตุ
                                    </Button>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                <DeleteConfirmModal
                    isOpen={!!deleteInquiry}
                    onClose={() => setDeleteInquiry(null)}
                    onConfirm={handleDelete}
                    title="ลบการสอบถาม"
                    description={`คุณแน่ใจหรือไม่ที่จะลบการสอบถามของ "${deleteInquiry?.customerName ?? ""}"?`}
                    isLoading={deleting}
                />
            </div>
        </DashboardLayout>
    );
}
