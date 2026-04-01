"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
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
    ImageOff,
    ExternalLink,
    ImagePlus,
    Heart,
    Star,
    Crown,
    Sparkles
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { usePendingCounts } from "@/contexts/PendingContext";
import { RefreshCw, CreditCard, ArrowRight } from "lucide-react";

interface ListingImage {
    id: string;
    url: string;
    order: number;
}

interface Listing {
    id: string;
    title: string;
    description: string | null;
    vehicleType: string;
    brand: string;
    model: string;
    subModel: string | null;
    year: number;
    price: number;
    color: string;
    fuelType: string;
    transmission: string | null;
    engineSize: number | null;
    seats: number | null;
    mileage: number;
    bodyType: string;
    province: string;
    district: string | null;
    contactName: string | null;
    contactPhone: string | null;
    lineId: string | null;
    condition: string;
    hasAccident: boolean;
    hasModified: boolean;
    registrationBookStatus: string;
    gasType: string;
    hasSpareKey: boolean;
    status: string;
    adminNote: string | null;
    viewCount: number;
    favoriteCount: number;
    isFeatured: boolean;
    isPremium: boolean;
    createdAt: string;
    publishedAt: string | null;
    expiredAt: string | null;
    user: {
        id: string;
        fullName: string;
        email: string;
        phoneNumber?: string;
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
    DRAFT: { label: 'แบบร่าง', color: 'bg-muted text-muted-foreground', icon: <Clock size={13} /> },
    SOLD: { label: 'ขายแล้ว', color: 'bg-blue-50 text-blue-700', icon: <Check size={13} /> },
    EXPIRED: { label: 'หมดอายุ', color: 'bg-muted text-muted-foreground', icon: <Clock size={13} /> },
};

interface Renewal {
    id: string;
    amount: string;
    slipImage: string;
    status: string;
    adminNote: string | null;
    createdAt: string;
    user: { id: string; fullName: string; email: string };
    listing: { id: string; title: string; brand: string; model: string; year: number };
}

export default function ListingModerationPage() {
    const { refreshListings: refreshPendingBadge } = usePendingCounts();
    const [mainTab, setMainTab] = useState<'listings' | 'renewals'>('listings');
    const [filterStatus, setFilterStatus] = useState("");
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
    const [carouselIdx, setCarouselIdx] = useState(0);

    // Renewal state
    const [renewals, setRenewals] = useState<Renewal[]>([]);
    const [renewalLoading, setRenewalLoading] = useState(false);
    const [renewalCount, setRenewalCount] = useState(0);
    const [viewRenewalSlip, setViewRenewalSlip] = useState<string | null>(null);
    const [renewalApproveId, setRenewalApproveId] = useState<string | null>(null);
    const [renewalRejectId, setRenewalRejectId] = useState<string | null>(null);
    const [renewalRejectNote, setRenewalRejectNote] = useState('');

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
            const totalCount = counts.reduce((sum, c) => sum + c.count, 0);
            setStatusCounts([
                { status: '', label: 'ทั้งหมด', count: totalCount },
                ...counts
            ]);
        } catch (error) {
            console.error(error);
        }
    }, []);

    useEffect(() => {
        fetchListings();
    }, [fetchListings]);

    useEffect(() => {
        fetchStatusCounts();
        // Also fetch renewal count for the tab badge
        apiFetch('/admin/listings/renewals?status=PENDING&limit=1')
            .then(data => setRenewalCount(data.pagination?.total || 0))
            .catch(() => {});
    }, [fetchStatusCounts]);

    const handleApprove = async () => {
        if (!approveId) return;
        setActionLoading(approveId);
        try {
            await apiFetch(`/admin/listings/${approveId}/approve`, { method: 'POST' });
            setApproveId(null);
            fetchListings();
            fetchStatusCounts();
            refreshPendingBadge();
        } catch (error: any) {
            toast.error(error.message || 'เกิดข้อผิดพลาด');
        } finally {
            setActionLoading(null);
        }
    };

    const handleToggleFeatured = async (id: string) => {
        try {
            await apiFetch(`/admin/listings/${id}/featured`, { method: 'PUT' });
            fetchListings();
            if (viewSlip?.id === id) {
                setViewSlip(prev => prev ? { ...prev, isFeatured: !prev.isFeatured } : null);
            }
        } catch (error: any) {
            toast.error(error.message || 'เกิดข้อผิดพลาด');
        }
    };

    const handleTogglePremium = async (id: string) => {
        try {
            await apiFetch(`/admin/listings/${id}/premium`, { method: 'PUT' });
            fetchListings();
            if (viewSlip?.id === id) {
                setViewSlip(prev => prev ? { ...prev, isPremium: !prev.isPremium } : null);
            }
        } catch (error: any) {
            toast.error(error.message || 'เกิดข้อผิดพลาด');
        }
    };

    // === Renewal functions ===
    const fetchRenewals = useCallback(async () => {
        setRenewalLoading(true);
        try {
            const data = await apiFetch('/admin/listings/renewals?status=PENDING&limit=50');
            setRenewals(data.renewals || []);
            setRenewalCount(data.pagination?.total || 0);
        } catch (e) { console.error(e); }
        finally { setRenewalLoading(false); }
    }, []);

    const handleApproveRenewal = async (id: string) => {
        try {
            await apiFetch(`/admin/listings/renewals/${id}/approve`, { method: 'POST' });
            toast.success('อนุมัติต่ออายุเรียบร้อย');
            fetchRenewals();
        } catch (e: any) { toast.error(e.message || 'เกิดข้อผิดพลาด'); }
    };

    const handleRejectRenewal = async () => {
        if (!renewalRejectId) return;
        try {
            await apiFetch(`/admin/listings/renewals/${renewalRejectId}/reject`, {
                method: 'POST',
                body: JSON.stringify({ reason: renewalRejectNote }),
            });
            toast.success('ปฏิเสธคำขอต่ออายุเรียบร้อย');
            setRenewalRejectId(null);
            setRenewalRejectNote('');
            fetchRenewals();
        } catch (e: any) { toast.error(e.message || 'เกิดข้อผิดพลาด'); }
    };

    useEffect(() => {
        if (mainTab === 'renewals') fetchRenewals();
    }, [mainTab, fetchRenewals]);

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
            refreshPendingBadge();
        } catch (error: any) {
            toast.error(error.message || 'เกิดข้อผิดพลาด');
        } finally {
            setActionLoading(null);
        }
    };

    const pendingCount = statusCounts.find(s => s.status === 'PENDING')?.count || 0;

    return (
        <DashboardLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
                        <Car className="text-primary" /> ตรวจสอบประกาศขาย
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">ตรวจสอบและอนุมัติประกาศขายรถยนต์และจักรยานยนต์</p>
                </div>
            </div>

            {/* Main Tabs: ประกาศ / คำขอต่ออายุ */}
            <Tabs defaultValue="listings" className="mb-6" onValueChange={(v) => setMainTab(v as 'listings' | 'renewals')}>
                <TabsList>
                    <TabsTrigger value="listings">
                        <Car size={16} className="mr-1.5" /> ประกาศขาย
                        {pendingCount > 0 && <span className="ml-1.5 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{pendingCount}</span>}
                    </TabsTrigger>
                    <TabsTrigger value="renewals">
                        <RefreshCw size={16} className="mr-1.5" /> คำขอต่ออายุ
                        {renewalCount > 0 && <span className="ml-1.5 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{renewalCount}</span>}
                    </TabsTrigger>
                </TabsList>

            {/* ===== Tab: Renewals ===== */}
            <TabsContent value="renewals">
                <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                    {renewalLoading ? (
                        <div className="p-12 text-center text-muted-foreground">
                            <RefreshCw className="mx-auto mb-3 animate-spin opacity-30" size={32} />
                            <p className="text-sm">กำลังโหลด...</p>
                        </div>
                    ) : renewals.length === 0 ? (
                        <div className="p-12 text-center text-muted-foreground">
                            <CheckCircle className="mx-auto mb-3 opacity-30" size={32} />
                            <p className="text-sm font-medium">ไม่มีคำขอต่ออายุที่รอตรวจสอบ</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {renewals.map(r => (
                                <div key={r.id} className="p-5 hover:bg-accent transition-colors">
                                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                        {/* User */}
                                        <div className="flex items-center gap-3 min-w-[180px]">
                                            <div className="w-9 h-9 bg-accent rounded-lg flex items-center justify-center text-muted-foreground">
                                                <User size={18} />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm text-foreground">{r.user.fullName}</p>
                                                <p className="text-xs text-muted-foreground">{r.user.email}</p>
                                            </div>
                                        </div>

                                        {/* Listing */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-foreground truncate">{r.listing.title}</p>
                                            <p className="text-xs text-muted-foreground">{r.listing.brand} {r.listing.model} ({r.listing.year})</p>
                                        </div>

                                        {/* Amount */}
                                        <div className="flex items-center gap-1.5 min-w-[80px]">
                                            <CreditCard size={14} className="text-muted-foreground" />
                                            <span className="text-sm font-semibold text-foreground">฿{Number(r.amount).toLocaleString()}</span>
                                        </div>

                                        {/* Date */}
                                        <div className="text-xs text-muted-foreground min-w-[100px]">
                                            {new Date(r.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2 flex-shrink-0">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => setViewRenewalSlip(r.slipImage)}
                                                className="h-8 w-8"
                                            >
                                                <Eye size={15} />
                                            </Button>
                                            <Button
                                                onClick={() => handleApproveRenewal(r.id)}
                                                size="sm"
                                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                                            >
                                                <Check size={14} /> อนุมัติ
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => { setRenewalRejectId(r.id); setRenewalRejectNote(''); }}
                                                className="font-medium"
                                            >
                                                <X size={14} /> ปฏิเสธ
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Renewal Slip Modal */}
                {viewRenewalSlip && (
                    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setViewRenewalSlip(null)}>
                        <div className="bg-card rounded-xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-4" onClick={e => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="font-semibold text-foreground">สลิปการโอนเงิน</h3>
                                <Button variant="ghost" size="icon" onClick={() => setViewRenewalSlip(null)}><X size={18} /></Button>
                            </div>
                            <img src={viewRenewalSlip} alt="Slip" className="w-full rounded-lg" />
                        </div>
                    </div>
                )}

                {/* Renewal Reject Modal */}
                {renewalRejectId && (
                    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setRenewalRejectId(null)}>
                        <div className="bg-card rounded-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
                            <h3 className="font-semibold text-foreground mb-4">ปฏิเสธคำขอต่ออายุ</h3>
                            <textarea
                                value={renewalRejectNote}
                                onChange={e => setRenewalRejectNote(e.target.value)}
                                placeholder="เหตุผลในการปฏิเสธ (ไม่บังคับ)"
                                className="w-full border border-border rounded-lg p-3 text-sm min-h-[80px] mb-4 outline-none focus:border-border"
                            />
                            <div className="flex gap-3">
                                <Button variant="outline" className="flex-1" onClick={() => setRenewalRejectId(null)}>ยกเลิก</Button>
                                <Button variant="destructive" className="flex-1" onClick={handleRejectRenewal}>
                                    <XCircle size={16} /> ปฏิเสธ
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </TabsContent>

            {/* ===== Tab: Listings ===== */}
            <TabsContent value="listings">

            {/* Search */}
            <div className="mb-4 max-w-sm">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="ค้นหาชื่อประกาศ, ผู้ขาย..."
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                        className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-lg text-sm outline-none focus:border-border transition-colors"
                    />
                </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="" className="mb-6" onValueChange={(v) => { setFilterStatus(v); setPage(1); }}>
                <TabsList>
                    {statusCounts.map((tab) => (
                        <TabsTrigger key={tab.status} value={tab.status}>
                            {tab.label} <span className="ml-1.5 text-xs opacity-70">{tab.count}</span>
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>

            {/* Listings */}
            {isLoading ? (
                <div className="bg-card rounded-xl border border-border p-12 text-center text-muted-foreground">
                    <Car className="mx-auto mb-3 animate-pulse opacity-30" size={32} />
                    <p className="text-sm">กำลังโหลด...</p>
                </div>
            ) : listings.length === 0 ? (
                <div className="bg-card rounded-xl border border-border p-12 text-center text-muted-foreground">
                    <Car className="mx-auto mb-3 opacity-30" size={32} />
                    <p className="text-sm">ไม่พบรายการ</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {listings.map((listing) => {
                        const status = statusConfig[listing.status] || statusConfig.PENDING;
                        const thumbnail = listing.images?.[0]?.url;
                        return (
                            <div key={listing.id} className="bg-card rounded-xl shadow-sm border border-border overflow-hidden flex flex-col md:flex-row">
                                {/* Thumbnail */}
                                <div className="w-full md:w-56 aspect-[4/3] bg-accent relative overflow-hidden flex-shrink-0">
                                    {thumbnail ? (
                                        <img src={thumbnail} alt={listing.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <ImageOff className="text-muted-foreground" size={32} />
                                        </div>
                                    )}
                                    <div className="absolute top-3 left-3 flex gap-2">
                                        <span className="bg-black/50 backdrop-blur-md text-white px-2 py-0.5 rounded-md text-xs font-medium flex items-center gap-1">
                                            {listing.vehicleType === "CAR" ? <Car size={12} /> : <Bike size={12} />}
                                            {listing.vehicleType === "CAR" ? "รถยนต์" : "จักรยานยนต์"}
                                        </span>
                                    </div>
                                    <div className="absolute bottom-3 right-3">
                                        <span className="bg-black/50 backdrop-blur-md text-white px-2 py-0.5 rounded-md text-xs font-medium flex items-center gap-1">
                                            <ImagePlus size={12} /> {listing.images.length}
                                        </span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 p-5 flex flex-col">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h2 className="text-base font-semibold text-foreground">{listing.title}</h2>
                                            <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Clock size={13} />
                                                    {new Date(listing.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                {listing.province && (
                                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <MapPin size={13} /> {listing.province}
                                                    </span>
                                                )}
                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Eye size={13} /> {listing.viewCount} ครั้ง
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right flex-shrink-0 ml-4">
                                            <p className="text-lg font-semibold text-primary">฿{Number(listing.price).toLocaleString()}</p>
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${status.color}`}>
                                                {status.icon} {status.label}
                                            </span>
                                            <div className="flex gap-1 mt-1 justify-end">
                                                {listing.isFeatured && (
                                                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700">
                                                        <Star size={10} /> แนะนำ
                                                    </span>
                                                )}
                                                {listing.isPremium && (
                                                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-50 text-purple-700">
                                                        <Crown size={10} /> พรีเมียม
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Seller Info */}
                                    <div className="mt-3 p-3 bg-muted rounded-lg flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 bg-card rounded-lg flex items-center justify-center border border-border text-muted-foreground font-medium text-sm">
                                                <User size={16} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-foreground">{listing.user.fullName}</p>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-xs text-muted-foreground">{listing.user.email}</p>
                                                    {listing.user.currentPackage && (
                                                        <span className="text-[10px] font-medium bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">
                                                            {listing.user.currentPackage.name}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 flex-shrink-0 flex-wrap">
                                            {listing.status === 'ACTIVE' && (
                                                <>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleToggleFeatured(listing.id)}
                                                        className={`font-medium ${listing.isFeatured ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' : ''}`}
                                                    >
                                                        <Star size={14} className={listing.isFeatured ? 'fill-amber-500' : ''} /> {listing.isFeatured ? 'แนะนำ' : 'ตั้งแนะนำ'}
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleTogglePremium(listing.id)}
                                                        className={`font-medium ${listing.isPremium ? 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100' : ''}`}
                                                    >
                                                        <Crown size={14} className={listing.isPremium ? 'fill-purple-500' : ''} /> {listing.isPremium ? 'พรีเมียม' : 'ตั้งพรีเมียม'}
                                                    </Button>
                                                </>
                                            )}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => { setCarouselIdx(0); setViewSlip(listing); }}
                                                className="font-medium"
                                            >
                                                <Eye size={14} /> ดูรายละเอียด
                                            </Button>
                                            <a
                                                href={`${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'}/buy/${listing.id}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <Button variant="outline" size="sm" className="font-medium">
                                                    <ExternalLink size={14} /> เปิดประกาศ
                                                </Button>
                                            </a>
                                        </div>
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
                    <span className="text-sm font-medium text-muted-foreground">
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

            </TabsContent>
            </Tabs>

            {/* Approve Confirmation Modal */}
            {approveId && (() => {
                const listing = listings.find(l => l.id === approveId);
                if (!listing) return null;
                return (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setApproveId(null)} />
                        <div className="relative z-10 bg-card rounded-xl shadow-lg max-w-md w-full overflow-hidden">
                            <div className="p-6">
                                <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle className="text-emerald-500" size={24} />
                                </div>
                                <h3 className="text-lg font-semibold text-center text-foreground mb-1">ยืนยันอนุมัติประกาศ</h3>
                                <p className="text-sm text-center text-muted-foreground mb-5">ประกาศจะแสดงบนเว็บไซต์ทันที</p>

                                <div className="bg-muted rounded-xl p-4 space-y-3 mb-5">
                                    <p className="text-sm font-semibold text-foreground">{listing.title}</p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="h-7 w-7 bg-card rounded-md border border-border flex items-center justify-center">
                                                <User size={14} className="text-muted-foreground" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-foreground">{listing.user.fullName}</p>
                                                <p className="text-[10px] text-muted-foreground">{listing.user.currentPackage?.name || 'Basic (Free)'}</p>
                                            </div>
                                        </div>
                                        <p className="text-base font-bold text-foreground">฿{Number(listing.price).toLocaleString()}</p>
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
                    <div className="relative z-10 bg-card rounded-xl shadow-lg max-w-md w-full overflow-hidden">
                        <div className="p-6">
                            <div className="w-12 h-12 bg-rose-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <XCircle className="text-rose-500" size={24} />
                            </div>
                            <h3 className="text-lg font-semibold text-center text-foreground mb-1.5">ปฏิเสธประกาศนี้?</h3>
                            <p className="text-sm text-center text-muted-foreground mb-5">ระบุเหตุผลในการปฏิเสธ (ไม่บังคับ)</p>
                            <textarea
                                value={rejectNote}
                                onChange={e => setRejectNote(e.target.value)}
                                placeholder="เหตุผลในการปฏิเสธ เช่น ข้อมูลไม่ครบ, รูปไม่ชัด..."
                                className="w-full p-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-border focus:border-border resize-none transition-colors"
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
                    <div className="relative z-10 bg-card rounded-xl shadow-lg max-w-3xl w-full overflow-hidden max-h-[90vh] overflow-y-auto">
                        <div className="p-4 border-b border-border flex justify-between items-center sticky top-0 bg-card z-10">
                            <h3 className="font-semibold text-foreground">รายละเอียดประกาศ</h3>
                            <Button variant="ghost" size="icon" onClick={() => setViewSlip(null)} className="h-8 w-8">
                                <X size={18} />
                            </Button>
                        </div>
                        <div className="p-5 space-y-5">
                            {/* Image Carousel */}
                            {viewSlip.images.length > 0 ? (
                                <div className="space-y-2">
                                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-accent">
                                        <img src={viewSlip.images[carouselIdx]?.url} alt="" className="w-full h-full object-cover" />
                                        {viewSlip.images.length > 1 && (
                                            <>
                                                <button onClick={() => setCarouselIdx(i => i > 0 ? i - 1 : viewSlip.images.length - 1)} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 transition">
                                                    <ChevronLeft size={18} />
                                                </button>
                                                <button onClick={() => setCarouselIdx(i => i < viewSlip.images.length - 1 ? i + 1 : 0)} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 transition">
                                                    <ChevronRight size={18} />
                                                </button>
                                                <span className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-md">{carouselIdx + 1}/{viewSlip.images.length}</span>
                                            </>
                                        )}
                                    </div>
                                    {viewSlip.images.length > 1 && (
                                        <div className="flex gap-1.5 overflow-x-auto pb-1">
                                            {viewSlip.images.map((img, i) => (
                                                <button key={img.id || i} onClick={() => setCarouselIdx(i)} className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition ${carouselIdx === i ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                                                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="h-48 bg-accent rounded-xl flex items-center justify-center">
                                    <ImageOff className="text-muted-foreground" size={32} />
                                </div>
                            )}

                            {/* Title & Price */}
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h2 className="text-lg font-bold text-foreground">{viewSlip.title}</h2>
                                    <p className="text-sm text-muted-foreground">{viewSlip.brand} {viewSlip.model}{viewSlip.subModel ? ` ${viewSlip.subModel}` : ''}</p>
                                </div>
                                <p className="text-xl font-bold text-primary whitespace-nowrap">฿{Number(viewSlip.price).toLocaleString()}</p>
                            </div>

                            {/* Vehicle Info Grid */}
                            <div className="grid grid-cols-3 md:grid-cols-4 gap-2 text-sm">
                                <div className="bg-muted p-2.5 rounded-lg"><p className="text-[10px] text-muted-foreground">ปี</p><p className="font-medium text-foreground">{viewSlip.year}</p></div>
                                <div className="bg-muted p-2.5 rounded-lg"><p className="text-[10px] text-muted-foreground">สี</p><p className="font-medium text-foreground">{viewSlip.color || '-'}</p></div>
                                <div className="bg-muted p-2.5 rounded-lg"><p className="text-[10px] text-muted-foreground">เชื้อเพลิง</p><p className="font-medium text-foreground">{viewSlip.fuelType || '-'}</p></div>
                                <div className="bg-muted p-2.5 rounded-lg"><p className="text-[10px] text-muted-foreground">เกียร์</p><p className="font-medium text-foreground">{viewSlip.transmission || '-'}</p></div>
                                <div className="bg-muted p-2.5 rounded-lg"><p className="text-[10px] text-muted-foreground">เลขไมล์</p><p className="font-medium text-foreground">{viewSlip.mileage?.toLocaleString() || '-'} กม.</p></div>
                                <div className="bg-muted p-2.5 rounded-lg"><p className="text-[10px] text-muted-foreground">ประเภท</p><p className="font-medium text-foreground">{viewSlip.bodyType || '-'}</p></div>
                                <div className="bg-muted p-2.5 rounded-lg"><p className="text-[10px] text-muted-foreground">จังหวัด</p><p className="font-medium text-foreground">{viewSlip.province || '-'}</p></div>
                                {viewSlip.engineSize && <div className="bg-muted p-2.5 rounded-lg"><p className="text-[10px] text-muted-foreground">เครื่องยนต์</p><p className="font-medium text-foreground">{viewSlip.engineSize} cc</p></div>}
                            </div>

                            {/* Condition Info */}
                            <div className="flex flex-wrap gap-2 text-xs">
                                <span className={`px-2 py-1 rounded ${viewSlip.registrationBookStatus === 'READY' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                                    {viewSlip.registrationBookStatus === 'READY' ? '✅ พร้อมโอน' : '🏦 ติดไฟแนนซ์'}
                                </span>
                                {viewSlip.hasAccident && <span className="bg-rose-50 text-rose-600 px-2 py-1 rounded">เคยมีอุบัติเหตุ</span>}
                                {viewSlip.hasModified && <span className="bg-amber-50 text-amber-700 px-2 py-1 rounded">มีการโมดิฟาย</span>}
                                {viewSlip.hasSpareKey && <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded">มีกุญแจสำรอง</span>}
                                {viewSlip.gasType && viewSlip.gasType !== 'NONE' && <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">ติดแก๊ส {viewSlip.gasType}</span>}
                            </div>

                            {/* Description */}
                            {viewSlip.description && (
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground mb-1">รายละเอียด</p>
                                    <p className="text-sm text-muted-foreground whitespace-pre-line bg-muted p-3 rounded-lg max-h-40 overflow-y-auto">{viewSlip.description}</p>
                                </div>
                            )}

                            {/* Contact & Seller */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="p-3 bg-muted rounded-lg">
                                    <p className="text-[10px] text-muted-foreground mb-1.5">ข้อมูลผู้ขาย</p>
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 bg-card rounded-lg flex items-center justify-center border border-border text-muted-foreground"><User size={16} /></div>
                                        <div>
                                            <p className="text-sm font-medium text-foreground">{viewSlip.user.fullName}</p>
                                            <p className="text-xs text-muted-foreground">{viewSlip.user.email} · {viewSlip.user.currentPackage?.name || 'Basic (Free)'}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-3 bg-muted rounded-lg">
                                    <p className="text-[10px] text-muted-foreground mb-1.5">ข้อมูลติดต่อ</p>
                                    <p className="text-sm text-foreground">{viewSlip.contactName || viewSlip.user.fullName}</p>
                                    <p className="text-xs text-muted-foreground">{viewSlip.contactPhone || '-'}{viewSlip.lineId ? ` · LINE: ${viewSlip.lineId}` : ''}</p>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="flex gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1"><Eye size={13} className="text-blue-500" /> {viewSlip.viewCount} วิว</span>
                                <span className="flex items-center gap-1"><Heart size={13} className="text-red-400" /> {viewSlip.favoriteCount || 0} ถูกใจ</span>
                                <span>ลงเมื่อ {new Date(viewSlip.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                {viewSlip.expiredAt && <span>หมดอายุ {new Date(viewSlip.expiredAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
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
                                    <Button onClick={() => { setViewSlip(null); setApproveId(viewSlip.id); }} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium">
                                        <CheckCircle size={16} /> อนุมัติประกาศ
                                    </Button>
                                    <Button variant="destructive" onClick={() => { setViewSlip(null); setRejectId(viewSlip.id); }} className="flex-1 font-medium">
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
