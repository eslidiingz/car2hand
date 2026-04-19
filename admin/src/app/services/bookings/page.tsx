"use client";

import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import { useDebounce } from "@/hooks/useDebounce";
import DashboardLayout from "@/components/DashboardLayout";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
    Search,
    Filter,
    Eye,
    ChevronLeft,
    ChevronRight,
    CalendarCheck,
    Loader2,
    MapPin,
    Phone,
    User,
    X,
    Trash2,
} from "lucide-react";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

interface Booking {
    id: string;
    packageName: string;
    customerName: string;
    customerPhone: string;
    bookingDate: string;
    bookingTime: string;
    location: string;
    totalPrice: number;
    status: string;
    note?: string;
    createdAt: string;
}

const STATUS_OPTIONS = [
    { value: "ALL", label: "ทั้งหมด" },
    { value: "PENDING", label: "รอดำเนินการ" },
    { value: "CONFIRMED", label: "ยืนยันแล้ว" },
    { value: "IN_PROGRESS", label: "กำลังดำเนินการ" },
    { value: "COMPLETED", label: "เสร็จสิ้น" },
    { value: "CANCELLED", label: "ยกเลิก" },
];

const STATUS_COLORS: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
    CONFIRMED: "bg-blue-100 text-blue-800 border-blue-200",
    IN_PROGRESS: "bg-orange-100 text-orange-800 border-orange-200",
    COMPLETED: "bg-green-100 text-green-800 border-green-200",
    CANCELLED: "bg-red-100 text-red-800 border-red-200",
};

const STATUS_LABELS: Record<string, string> = {
    PENDING: "รอดำเนินการ",
    CONFIRMED: "ยืนยันแล้ว",
    IN_PROGRESS: "กำลังดำเนินการ",
    COMPLETED: "เสร็จสิ้น",
    CANCELLED: "ยกเลิก",
};

export default function AdminBookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 500);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [deleteBooking, setDeleteBooking] = useState<Booking | null>(null);
    const [deleting, setDeleting] = useState(false);

    const fetchBookings = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({ page: String(page) });
            if (statusFilter !== "ALL") params.set("status", statusFilter);
            if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim());

            const res = await apiFetch(`/admin/services/bookings?${params}`);
            if (res.ok) {
                const data = await res.json();
                setBookings(data.data || data.bookings || []);
                setTotalPages(data.totalPages || data.pagination?.totalPages || 1);
            } else {
                toast.error("ไม่สามารถโหลดข้อมูลการจองได้");
            }
        } catch {
            toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
        } finally {
            setLoading(false);
        }
    }, [page, statusFilter, debouncedSearch]);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    const updateStatus = async (bookingId: string, newStatus: string) => {
        try {
            setUpdatingId(bookingId);
            const res = await apiFetch(`/admin/services/bookings/${bookingId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                toast.success("อัปเดตสถานะสำเร็จ");
                fetchBookings();
            } else {
                toast.error("ไม่สามารถอัปเดตสถานะได้");
            }
        } catch {
            toast.error("เกิดข้อผิดพลาด");
        } finally {
            setUpdatingId(null);
        }
    };

    const openDetail = (booking: Booking) => {
        setSelectedBooking(booking);
        setDetailOpen(true);
    };

    const handleDelete = async () => {
        if (!deleteBooking) return;
        setDeleting(true);
        try {
            const res = await apiFetch(`/admin/services/bookings/${deleteBooking.id}`, {
                method: "DELETE",
            });
            toast.success(res?.message || "ลบการจองเรียบร้อย");
            setDeleteBooking(null);
            fetchBookings();
        } catch (err: any) {
            toast.error(err?.message || "ไม่สามารถลบการจองได้");
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

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("th-TH", {
            style: "currency",
            currency: "THB",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <CalendarCheck className="h-6 w-6 text-foreground" />
                    <h1 className="text-2xl font-bold text-foreground">จัดการการจอง</h1>
                </div>

                {/* Filter Bar */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                            <SelectTrigger className="w-[180px]">
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
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="ค้นหาชื่อลูกค้า, เบอร์โทร..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            className="pl-9"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="rounded-lg border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">ID</TableHead>
                                <TableHead>แพ็กเกจ</TableHead>
                                <TableHead>ลูกค้า</TableHead>
                                <TableHead>เบอร์โทร</TableHead>
                                <TableHead>วัน/เวลา</TableHead>
                                <TableHead>สถานที่</TableHead>
                                <TableHead className="text-right">ราคา</TableHead>
                                <TableHead>สถานะ</TableHead>
                                <TableHead className="text-right">จัดการ</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={9} className="py-12 text-center">
                                        <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                                        <p className="mt-2 text-sm text-muted-foreground">กำลังโหลด...</p>
                                    </TableCell>
                                </TableRow>
                            ) : bookings.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} className="py-12 text-center">
                                        <CalendarCheck className="mx-auto h-10 w-10 text-muted-foreground" />
                                        <p className="mt-2 text-sm text-muted-foreground">ไม่พบรายการจอง</p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                bookings.map((booking) => (
                                    <TableRow key={booking.id}>
                                        <TableCell className="font-mono text-xs text-muted-foreground">
                                            {booking.id.slice(0, 8)}
                                        </TableCell>
                                        <TableCell className="font-medium">{booking.packageName}</TableCell>
                                        <TableCell>{booking.customerName}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {booking.customerPhone}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            <div>{formatDate(booking.bookingDate)}</div>
                                            <div className="text-muted-foreground">{booking.bookingTime}</div>
                                        </TableCell>
                                        <TableCell className="max-w-[150px] truncate text-sm text-muted-foreground">
                                            {booking.location}
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {formatCurrency(booking.totalPrice)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    "text-xs font-medium",
                                                    STATUS_COLORS[booking.status]
                                                )}
                                            >
                                                {STATUS_LABELS[booking.status] || booking.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => openDetail(booking)}
                                                    title="ดูรายละเอียด"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Select
                                                    value={booking.status}
                                                    onValueChange={(v) => updateStatus(booking.id, v)}
                                                    disabled={updatingId === booking.id}
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
                                                    onClick={() => setDeleteBooking(booking)}
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

                {/* Booking Detail Dialog */}
                <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>รายละเอียดการจอง</DialogTitle>
                        </DialogHeader>
                        {selectedBooking && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-muted-foreground">รหัสการจอง</p>
                                        <p className="font-mono font-medium">{selectedBooking.id.slice(0, 12)}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">สถานะ</p>
                                        <Badge
                                            variant="outline"
                                            className={cn("text-xs", STATUS_COLORS[selectedBooking.status])}
                                        >
                                            {STATUS_LABELS[selectedBooking.status] || selectedBooking.status}
                                        </Badge>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">แพ็กเกจ</p>
                                        <p className="font-medium">{selectedBooking.packageName}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">ราคา</p>
                                        <p className="font-medium">{formatCurrency(selectedBooking.totalPrice)}</p>
                                    </div>
                                    <div>
                                        <p className="flex items-center gap-1 text-muted-foreground">
                                            <User className="h-3.5 w-3.5" /> ลูกค้า
                                        </p>
                                        <p className="font-medium">{selectedBooking.customerName}</p>
                                    </div>
                                    <div>
                                        <p className="flex items-center gap-1 text-muted-foreground">
                                            <Phone className="h-3.5 w-3.5" /> เบอร์โทร
                                        </p>
                                        <p className="font-medium">{selectedBooking.customerPhone}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">วันที่</p>
                                        <p className="font-medium">{formatDate(selectedBooking.bookingDate)}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">เวลา</p>
                                        <p className="font-medium">{selectedBooking.bookingTime}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="flex items-center gap-1 text-muted-foreground">
                                            <MapPin className="h-3.5 w-3.5" /> สถานที่
                                        </p>
                                        <p className="font-medium">{selectedBooking.location}</p>
                                    </div>
                                    {selectedBooking.note && (
                                        <div className="col-span-2">
                                            <p className="text-muted-foreground">หมายเหตุ</p>
                                            <p className="text-foreground">{selectedBooking.note}</p>
                                        </div>
                                    )}
                                    <div className="col-span-2">
                                        <p className="text-muted-foreground">วันที่สร้าง</p>
                                        <p className="text-foreground">{formatDate(selectedBooking.createdAt)}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                <DeleteConfirmModal
                    isOpen={!!deleteBooking}
                    onClose={() => setDeleteBooking(null)}
                    onConfirm={handleDelete}
                    title="ลบการจอง"
                    description={`คุณแน่ใจหรือไม่ที่จะลบการจองของ "${deleteBooking?.customerName ?? ""}"?`}
                    isLoading={deleting}
                />
            </div>
        </DashboardLayout>
    );
}
