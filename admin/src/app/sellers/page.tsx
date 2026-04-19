"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import {
    Store,
    Search,
    Eye,
    ShieldCheck,
    ShieldAlert,
    ChevronLeft,
    ChevronRight,
    MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/useDebounce";

interface SellerItem {
    id: string;
    shopName: string;
    shopLogo: string | null;
    shopProvince: string | null;
    shopDistrict: string | null;
    showroomType: "INDIVIDUAL" | "TENT" | "DEALER";
    isVerified: boolean;
    verificationLevel: "NONE" | "ID" | "BUSINESS" | "DEALER";
    totalSoldCount: number;
    createdAt: string;
    user: {
        id: string;
        fullName: string;
        email: string;
        phoneNumber: string | null;
        profileImage: string | null;
        isActive: boolean;
    };
}

const SHOWROOM_LABEL: Record<string, string> = {
    INDIVIDUAL: "ส่วนตัว",
    TENT: "เต๊นท์",
    DEALER: "ดีลเลอร์",
};

const VERIFICATION_LEVEL_LABEL: Record<string, string> = {
    NONE: "ยังไม่ยืนยัน",
    ID: "ID",
    BUSINESS: "Business",
    DEALER: "Dealer",
};

export default function SellerProfilesPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 500);
    const [sellers, setSellers] = useState<SellerItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    // Filters
    const [verificationLevel, setVerificationLevel] = useState<string>("");
    const [showroomType, setShowroomType] = useState<string>("");
    const [isVerifiedFilter, setIsVerifiedFilter] = useState<string>("");

    const fetchSellers = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({ page: String(page), limit: "20" });
            if (debouncedSearch) params.set("search", debouncedSearch);
            if (verificationLevel) params.set("verificationLevel", verificationLevel);
            if (showroomType) params.set("showroomType", showroomType);
            if (isVerifiedFilter) params.set("isVerified", isVerifiedFilter);
            const data = await apiFetch(`/admin/seller-profiles?${params}`);
            setSellers(data.sellers || []);
            setTotalPages(data.pagination?.totalPages || 1);
            setTotal(data.pagination?.total || 0);
        } catch (err: any) {
            toast.error(err.message || "โหลดข้อมูลไม่สำเร็จ");
        } finally {
            setIsLoading(false);
        }
    }, [page, debouncedSearch, verificationLevel, showroomType, isVerifiedFilter]);

    useEffect(() => {
        fetchSellers();
    }, [fetchSellers]);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("th-TH", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const startItem = (page - 1) * 20 + 1;
    const endItem = Math.min(page * 20, total);

    return (
        <DashboardLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
                        <Store className="text-primary" /> ร้านค้า / ผู้ขาย
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        จัดการโปรไฟล์ร้านค้าและการยืนยันตัวตนของผู้ขาย
                    </p>
                </div>
                <div className="text-sm text-muted-foreground font-medium">
                    ทั้งหมด {total.toLocaleString("th-TH")} ร้าน
                </div>
            </div>

            {/* Search + Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative max-w-sm flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="ค้นหาชื่อร้าน, ชื่อผู้ขาย, อีเมล..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setPage(1);
                        }}
                        className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-lg text-sm outline-none focus:border-border transition-colors"
                    />
                </div>
                <select
                    value={verificationLevel}
                    onChange={(e) => {
                        setVerificationLevel(e.target.value);
                        setPage(1);
                    }}
                    className="h-9 px-3 rounded-lg border border-border bg-background text-sm"
                >
                    <option value="">ระดับยืนยัน: ทั้งหมด</option>
                    <option value="NONE">ยังไม่ยืนยัน</option>
                    <option value="ID">ID</option>
                    <option value="BUSINESS">Business</option>
                    <option value="DEALER">Dealer</option>
                </select>
                <select
                    value={showroomType}
                    onChange={(e) => {
                        setShowroomType(e.target.value);
                        setPage(1);
                    }}
                    className="h-9 px-3 rounded-lg border border-border bg-background text-sm"
                >
                    <option value="">ประเภทร้าน: ทั้งหมด</option>
                    <option value="INDIVIDUAL">ส่วนตัว</option>
                    <option value="TENT">เต๊นท์</option>
                    <option value="DEALER">ดีลเลอร์</option>
                </select>
                <select
                    value={isVerifiedFilter}
                    onChange={(e) => {
                        setIsVerifiedFilter(e.target.value);
                        setPage(1);
                    }}
                    className="h-9 px-3 rounded-lg border border-border bg-background text-sm"
                >
                    <option value="">สถานะ: ทั้งหมด</option>
                    <option value="true">ยืนยันแล้ว</option>
                    <option value="false">ยังไม่ยืนยัน</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-muted border-b border-border">
                                <th className="px-6 py-3 text-xs font-medium text-muted-foreground">ร้านค้า</th>
                                <th className="px-6 py-3 text-xs font-medium text-muted-foreground">ผู้ขาย</th>
                                <th className="px-6 py-3 text-xs font-medium text-muted-foreground">ประเภท</th>
                                <th className="px-6 py-3 text-xs font-medium text-muted-foreground">ระดับยืนยัน</th>
                                <th className="px-6 py-3 text-xs font-medium text-muted-foreground text-center">ยอดขาย</th>
                                <th className="px-6 py-3 text-xs font-medium text-muted-foreground text-center">สถานะ</th>
                                <th className="px-6 py-3 text-xs font-medium text-muted-foreground">สร้างเมื่อ</th>
                                <th className="px-6 py-3 text-xs font-medium text-muted-foreground text-right">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan={8} className="px-6 py-4">
                                            <div className="animate-pulse flex items-center gap-3">
                                                <div className="h-9 w-9 bg-accent rounded-lg" />
                                                <div className="flex-1 space-y-2">
                                                    <div className="h-3 bg-accent rounded w-40" />
                                                    <div className="h-2.5 bg-accent rounded w-56" />
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : sellers.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-muted-foreground text-sm">
                                        ไม่พบร้านค้า
                                    </td>
                                </tr>
                            ) : (
                                sellers.map((seller) => (
                                    <tr key={seller.id} className="hover:bg-accent transition-colors group">
                                        <td className="px-6 py-4">
                                            <Link href={`/sellers/${seller.id}`} className="flex items-center gap-3 group/link">
                                                <div className="h-10 w-10 bg-muted rounded-lg overflow-hidden flex items-center justify-center text-muted-foreground flex-shrink-0">
                                                    {seller.shopLogo ? (
                                                        // eslint-disable-next-line @next/next/no-img-element
                                                        <img src={seller.shopLogo} alt={seller.shopName} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <Store size={16} />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-foreground truncate group-hover/link:text-primary group-hover/link:underline transition-colors">{seller.shopName}</p>
                                                    {(seller.shopProvince || seller.shopDistrict) && (
                                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                            <MapPin size={11} />{" "}
                                                            {[seller.shopDistrict, seller.shopProvince].filter(Boolean).join(", ")}
                                                        </span>
                                                    )}
                                                </div>
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-foreground">{seller.user.fullName}</p>
                                            <p className="text-xs text-muted-foreground">{seller.user.email}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-muted text-muted-foreground">
                                                {SHOWROOM_LABEL[seller.showroomType]}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-medium text-foreground">
                                                {VERIFICATION_LEVEL_LABEL[seller.verificationLevel] || seller.verificationLevel}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center text-sm font-medium">
                                            {seller.totalSoldCount.toLocaleString("th-TH")}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {seller.isVerified ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700">
                                                    <ShieldCheck size={12} /> ยืนยันแล้ว
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-muted text-muted-foreground">
                                                    <ShieldAlert size={12} /> ยังไม่ยืนยัน
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-muted-foreground">{formatDate(seller.createdAt)}</td>
                                        <td className="px-6 py-4 text-right">
                                            <Link href={`/sellers/${seller.id}`}>
                                                <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-blue-50 text-xs">
                                                    <Eye size={14} /> ดูรายละเอียด
                                                </Button>
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {total > 0 && (
                    <div className="px-6 py-3 bg-muted border-t border-border flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                            แสดงผล {startItem} - {endItem} จากทั้งหมด {total.toLocaleString("th-TH")} รายการ
                        </p>
                        <div className="flex gap-1">
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                disabled={page <= 1}
                                onClick={() => setPage((p) => p - 1)}
                            >
                                <ChevronLeft size={16} />
                            </Button>
                            <span className="flex items-center px-3 text-xs text-muted-foreground font-medium">
                                {page} / {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                disabled={page >= totalPages}
                                onClick={() => setPage((p) => p + 1)}
                            >
                                <ChevronRight size={16} />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
