"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { apiFetch } from "@/lib/api";
import {
    Car,
    Search,
    CheckCircle,
    XCircle,
    Eye,
    Clock,
    MapPin,
    ChevronLeft,
    ChevronRight,
    Bike,
    User,
    AlertTriangle,
    Check,
    X,
    Package,
    ImageOff
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";

interface ListingImage {
    id: string;
    url: string;
    order: number;
}

interface Listing {
    id: string;
    title: string;
    vehicleType: string;
    brand: string;
    model: string;
    year: number;
    price: number;
    province: string;
    status: string;
    adminNote: string | null;
    viewCount: number;
    createdAt: string;
    user: {
        id: string;
        fullName: string;
        email: string;
        currentPackage: { name: string; slug: string } | null;
    };
    images: ListingImage[];
}

interface StatusCount {
    status: string;
    label: string;
    count: number;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    PENDING: { label: 'รอตรวจสอบ', color: 'bg-amber-50 text-amber-700', icon: <Clock size={13} /> },
    ACTIVE: { label: 'อนุมัติแล้ว', color: 'bg-emerald-50 text-emerald-700', icon: <CheckCircle size={13} /> },
    SUSPENDED: { label: 'ถูกปฏิเสธ', color: 'bg-rose-50 text-rose-700', icon: <XCircle size={13} /> },
    DRAFT: { label: 'แบบร่าง', color: 'bg-slate-50 text-slate-500', icon: <Clock size={13} /> },
    SOLD: { label: 'ขายแล้ว', color: 'bg-blue-50 text-blue-700', icon: <Check size={13} /> },
    EXPIRED: { label: 'หมดอายุ', color: 'bg-slate-50 text-slate-500', icon: <Clock size={13} /> },
};

export default function ListingModerationPage() {
    const [filterStatus, setFilterStatus] = useState("PENDING");
    const [searchQuery, setSearchQuery] = useState("");
    const [listings, setListings] = useState<Listing[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [statusCounts, setStatusCounts] = useState<StatusCount[]>([]);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [approveId, setApproveId] = useState<string | null>(null);
    const [rejectId, setRejectId] = useState<string | null>(null);
    const [rejectNote, setRejectNote] = useState("");
    const [viewSlip, setViewSlip] = useState<Listing | null>(null);

    const fetchListings = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({ page: String(page), limit: '20' });
            if (filterStatus) params.set('status', filterStatus);
            if (searchQuery) params.set('search', searchQuery);
            const data = await apiFetch(`/admin/listings?${params}`);
            setListings(data.listings || []);
            setTotalPages(data.pagination?.totalPages || 1);
            setTotal(data.pagination?.total || 0);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [page, filterStatus, searchQuery]);

    // Fetch counts for each status tab
    const fetchStatusCounts = useCallback(async () => {
        try {
            const statuses = ['PENDING', 'ACTIVE', 'SUSPENDED'];
            const counts = await Promise.all(
                statuses.map(async (s) => {
                    const data = await apiFetch(`/admin/listings?status=${s}&limit=1`);
                    return {
                        status: s,
                        label: statusConfig[s]?.label || s,
                        count: data.pagination?.total || 0,
                    };
                })
            );
            setStatusCounts(counts);
        } catch (error) {
            console.error(error);
        }
    }, []);

    useEffect(() => {
        fetchListings();
    }, [fetchListings]);

    useEffect(() => {
        fetchStatusCounts();
    }, [fetchStatusCounts]);

    const handleApprove = async () => {
        if (!approveId) return;
        setActionLoading(approveId);
        try {
            await apiFetch(`/admin/listings/${approveId}/approve`, { method: 'POST' });
            setApproveId(null);
            fetchListings();
            fetchStatusCounts();
        } catch (error: any) {
            alert(error.message || 'เกิดข้อผิดพลาด');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async () => {
        if (!rejectId) return;
        setActionLoading(rejectId);
        try {
            await apiFetch(`/admin/listings/${rejectId}/reject`, {
                method: 'POST',
                body: JSON.stringify({ reason: rejectNote }),
            });
            setRejectId(null);
            setRejectNote('');
            fetchListings();
            fetchStatusCounts();
        } catch (error: any) {
            alert(error.message || 'เกิดข้อผิดพลาด');
        } finally {
            setActionLoading(null);
        }
    };

    const pendingCount = statusCounts.find(s => s.status === 'PENDING')?.count || 0;

    return (
        <DashboardLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-800 flex items-center gap-2">
                        <Car className="text-primary" /> ตรวจสอบประกาศขาย
                    </h1>
                    <p className="text-slate-500 mt-1 text-sm">ตรวจสอบและอนุมัติประกาศขายรถยนต์และจักรยานยนต์</p>
                </div>
                {pendingCount > 0 && (
                    <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg text-sm font-medium border border-amber-200">
                        <AlertTriangle size={16} />
                        {pendingCount} รายการรอตรวจสอบ
                    </div>
                )}
            </div>

            {/* Search */}
            <div className="mb-4 max-w-sm">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="ค้นหาชื่อประกาศ, ผู้ขาย..."
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                        className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-slate-400 transition-colors"
                    />
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 mb-6 gap-6">
                {statusCounts.map((tab) => (
                    <button
                        key={tab.status}
                        onClick={() => { setFilterStatus(tab.status); setPage(1); }}
                        className={`pb-3 px-1 text-sm font-medium transition-colors relative ${filterStatus === tab.status ? "text-slate-900" : "text-slate-400 hover:text-slate-600"}`}
                    >
                        {tab.label}
                        <span className={`ml-2 px-1.5 py-0.5 rounded-md text-xs ${filterStatus === tab.status ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-500"}`}>
                            {tab.count}
                        </span>
                        {filterStatus === tab.status && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-slate-800 rounded-t-full" />}
                    </button>
                ))}
            </div>

            {/* Listings */}
            {isLoading ? (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
                    <Car className="mx-auto mb-3 animate-pulse opacity-30" size={32} />
                    <p className="text-sm">กำลังโหลด...</p>
                </div>
            ) : listings.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
                    <Car className="mx-auto mb-3 opacity-30" size={32} />
                    <p className="text-sm">ไม่พบรายการ</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {listings.map((listing) => {
                        const status = statusConfig[listing.status] || statusConfig.PENDING;
                        const thumbnail = listing.images?.[0]?.url;
                        return (
                            <div key={listing.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row">
                                {/* Thumbnail */}
                                <div className="w-full md:w-56 aspect-[4/3] bg-slate-100 relative overflow-hidden flex-shrink-0">
                                    {thumbnail ? (
                                        <img src={thumbnail} alt={listing.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <ImageOff className="text-slate-300" size={32} />
                                        </div>
                                    )}
                                    <div className="absolute top-3 left-3 flex gap-2">
                                        <span className="bg-black/50 backdrop-blur-md text-white px-2 py-0.5 rounded-md text-xs font-medium flex items-center gap-1">
                                            {listing.vehicleType === "CAR" ? <Car size={12} /> : <Bike size={12} />}
                                            {listing.vehicleType === "CAR" ? "รถยนต์" : "จักรยานยนต์"}
                                        </span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 p-5 flex flex-col">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h2 className="text-base font-semibold text-slate-800">{listing.title}</h2>
                                            <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                                                <span className="text-xs text-slate-500 flex items-center gap-1">
                                                    <Clock size={13} />
                                                    {new Date(listing.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                {listing.province && (
                                                    <span className="text-xs text-slate-500 flex items-center gap-1">
                                                        <MapPin size={13} /> {listing.province}
                                                    </span>
                                                )}
                                                <span className="text-xs text-slate-500 flex items-center gap-1">
                                                    <Eye size={13} /> {listing.viewCount} ครั้ง
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right flex-shrink-0 ml-4">
                                            <p className="text-lg font-semibold text-primary">฿{Number(listing.price).toLocaleString()}</p>
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${status.color}`}>
                                                {status.icon} {status.label}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Seller Info */}
                                    <div className="mt-3 p-3 bg-slate-50 rounded-lg flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 bg-white rounded-lg flex items-center justify-center border border-slate-200 text-slate-600 font-medium text-sm">
                                                <User size={16} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-700">{listing.user.fullName}</p>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-xs text-slate-400">{listing.user.email}</p>
                                                    {listing.user.currentPackage && (
                                                        <span className="text-[10px] font-medium bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">
                                                            {listing.user.currentPackage.name}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setViewSlip(listing)}
                                            className="font-medium"
                                        >
                                            <Eye size={14} /> ดูรายละเอียด
                                        </Button>
                                    </div>

                                    {/* Admin Note */}
                                    {listing.adminNote && (
                                        <div className="mt-2 text-xs text-rose-500 bg-rose-50 px-3 py-2 rounded-lg">
                                            <span className="font-medium">หมายเหตุ:</span> {listing.adminNote}
                                        </div>
                                    )}

                                    {/* Actions for PENDING */}
                                    {listing.status === 'PENDING' && (
                                        <div className="mt-auto pt-4 flex gap-2">
                                            <Button
                                                onClick={() => setApproveId(listing.id)}
                                                disabled={actionLoading === listing.id}
                                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                                            >
                                                <CheckCircle size={16} /> อนุมัติประกาศ
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                onClick={() => setRejectId(listing.id)}
                                                disabled={actionLoading === listing.id}
                                                className="flex-1 font-medium"
                                            >
                                                <XCircle size={16} /> ไม่อนุมัติ
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-center gap-3">
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9"
                        disabled={page <= 1}
                        onClick={() => setPage(p => p - 1)}
                    >
                        <ChevronLeft size={18} />
                    </Button>
                    <span className="text-sm font-medium text-slate-600">
                        หน้า {page} จาก {totalPages} ({total} รายการ)
                    </span>
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9"
                        disabled={page >= totalPages}
                        onClick={() => setPage(p => p + 1)}
                    >
                        <ChevronRight size={18} />
                    </Button>
                </div>
            )}

            {/* Approve Confirmation Modal */}
            {approveId && (() => {
                const listing = listings.find(l => l.id === approveId);
                if (!listing) return null;
                return (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setApproveId(null)} />
                        <div className="relative z-10 bg-white rounded-xl shadow-lg max-w-md w-full overflow-hidden">
                            <div className="p-6">
                                <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle className="text-emerald-500" size={24} />
                                </div>
                                <h3 className="text-lg font-semibold text-center text-slate-800 mb-1">ยืนยันอนุมัติประกาศ</h3>
                                <p className="text-sm text-center text-slate-400 mb-5">ประกาศจะแสดงบนเว็บไซต์ทันที</p>

                                <div className="bg-slate-50 rounded-xl p-4 space-y-3 mb-5">
                                    <p className="text-sm font-semibold text-slate-800">{listing.title}</p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="h-7 w-7 bg-white rounded-md border border-slate-200 flex items-center justify-center">
                                                <User size={14} className="text-slate-500" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-slate-700">{listing.user.fullName}</p>
                                                <p className="text-[10px] text-slate-400">{listing.user.currentPackage?.name || 'Basic (Free)'}</p>
                                            </div>
                                        </div>
                                        <p className="text-base font-bold text-slate-800">฿{Number(listing.price).toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        variant="secondary"
                                        onClick={() => setApproveId(null)}
                                        className="flex-1 font-medium"
                                        disabled={actionLoading === approveId}
                                    >
                                        ยกเลิก
                                    </Button>
                                    <Button
                                        onClick={handleApprove}
                                        disabled={actionLoading === approveId}
                                        className="flex-1 font-medium bg-emerald-600 hover:bg-emerald-700 text-white"
                                    >
                                        <Check size={15} />
                                        {actionLoading === approveId ? 'กำลังอนุมัติ...' : 'ยืนยันอนุมัติ'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* Reject Modal */}
            {rejectId && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setRejectId(null)} />
                    <div className="relative z-10 bg-white rounded-xl shadow-lg max-w-md w-full overflow-hidden">
                        <div className="p-6">
                            <div className="w-12 h-12 bg-rose-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <XCircle className="text-rose-500" size={24} />
                            </div>
                            <h3 className="text-lg font-semibold text-center text-slate-800 mb-1.5">ปฏิเสธประกาศนี้?</h3>
                            <p className="text-sm text-center text-slate-500 mb-5">ระบุเหตุผลในการปฏิเสธ (ไม่บังคับ)</p>
                            <textarea
                                value={rejectNote}
                                onChange={e => setRejectNote(e.target.value)}
                                placeholder="เหตุผลในการปฏิเสธ เช่น ข้อมูลไม่ครบ, รูปไม่ชัด..."
                                className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400 resize-none transition-colors"
                                rows={3}
                            />
                            <div className="flex gap-3 mt-4">
                                <Button
                                    variant="secondary"
                                    onClick={() => { setRejectId(null); setRejectNote(''); }}
                                    className="flex-1 font-medium"
                                >
                                    ยกเลิก
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={handleReject}
                                    disabled={actionLoading === rejectId}
                                    className="flex-1 font-medium"
                                >
                                    {actionLoading === rejectId ? 'กำลังดำเนินการ...' : 'ยืนยันปฏิเสธ'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Listing Detail Modal */}
            {viewSlip && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setViewSlip(null)} />
                    <div className="relative z-10 bg-white rounded-xl shadow-lg max-w-2xl w-full overflow-hidden max-h-[90vh] overflow-y-auto">
                        <div className="p-4 border-b border-slate-200 flex justify-between items-center sticky top-0 bg-white z-10">
                            <h3 className="font-semibold text-slate-800">รายละเอียดประกาศ</h3>
                            <Button variant="ghost" size="icon" onClick={() => setViewSlip(null)} className="h-8 w-8">
                                <X size={18} />
                            </Button>
                        </div>
                        <div className="p-5 space-y-4">
                            {/* Images */}
                            {viewSlip.images.length > 0 ? (
                                <div className="grid grid-cols-2 gap-2">
                                    {viewSlip.images.map((img, i) => (
                                        <img key={img.id || i} src={img.url} alt={`รูปที่ ${i + 1}`} className="w-full rounded-lg object-cover aspect-video" />
                                    ))}
                                </div>
                            ) : (
                                <div className="h-48 bg-slate-100 rounded-lg flex items-center justify-center">
                                    <ImageOff className="text-slate-300" size={32} />
                                </div>
                            )}

                            {/* Info */}
                            <div className="space-y-2">
                                <h2 className="text-lg font-semibold text-slate-800">{viewSlip.title}</h2>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="bg-slate-50 p-3 rounded-lg">
                                        <p className="text-xs text-slate-400">ยี่ห้อ/รุ่น</p>
                                        <p className="font-medium text-slate-700">{viewSlip.brand} {viewSlip.model}</p>
                                    </div>
                                    <div className="bg-slate-50 p-3 rounded-lg">
                                        <p className="text-xs text-slate-400">ปี</p>
                                        <p className="font-medium text-slate-700">{viewSlip.year}</p>
                                    </div>
                                    <div className="bg-slate-50 p-3 rounded-lg">
                                        <p className="text-xs text-slate-400">ราคา</p>
                                        <p className="font-semibold text-primary">฿{Number(viewSlip.price).toLocaleString()}</p>
                                    </div>
                                    <div className="bg-slate-50 p-3 rounded-lg">
                                        <p className="text-xs text-slate-400">จังหวัด</p>
                                        <p className="font-medium text-slate-700">{viewSlip.province || '-'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Seller */}
                            <div className="p-3 bg-slate-50 rounded-lg flex items-center gap-3">
                                <div className="h-9 w-9 bg-white rounded-lg flex items-center justify-center border border-slate-200 text-slate-600">
                                    <User size={16} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-700">{viewSlip.user.fullName}</p>
                                    <p className="text-xs text-slate-400">{viewSlip.user.email} · {viewSlip.user.currentPackage?.name || 'Basic (Free)'}</p>
                                </div>
                            </div>

                            {/* Admin Note */}
                            {viewSlip.adminNote && (
                                <div className="text-xs text-rose-500 bg-rose-50 px-3 py-2 rounded-lg">
                                    <span className="font-medium">หมายเหตุ:</span> {viewSlip.adminNote}
                                </div>
                            )}

                            {/* Actions */}
                            {viewSlip.status === 'PENDING' && (
                                <div className="flex gap-3 pt-2">
                                    <Button
                                        onClick={() => { setViewSlip(null); setApproveId(viewSlip.id); }}
                                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                                    >
                                        <CheckCircle size={16} /> อนุมัติประกาศ
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={() => { setViewSlip(null); setRejectId(viewSlip.id); }}
                                        className="flex-1 font-medium"
                                    >
                                        <XCircle size={16} /> ไม่อนุมัติ
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
