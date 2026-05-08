"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { apiFetch } from "@/lib/api";
import {
    Users,
    Search,
    Mail,
    Phone,
    ShieldAlert,
    ChevronLeft,
    ChevronRight,
    Package,
    Car,
    Eye,
    BadgeCheck,
    Building2,
    Plus,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/useDebounce";

type KycLevel = "NONE" | "INDIVIDUAL" | "CORPORATE" | string;

interface UserItem {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    isActive: boolean;
    createdAt: string;
    currentPackage: { name: string; slug: string; maxListings: number } | null;
    bonusListingSlots: number;
    effectiveMaxListings: number; // -1 = unlimited
    lineUserId: string | null;
    googleUserId: string | null;
    facebookUserId: string | null;
    sellerProfile: {
        isVerified: boolean;
        verificationLevel: KycLevel;
        verifiedAt: string | null;
    } | null;
    _count: { listings: number };
}

// Social login badges — แสดงเฉพาะ provider ที่ผู้ใช้ผูกบัญชีไว้
function SocialBadges({ user }: { user: UserItem }) {
    const providers: { key: string; label: string; className: string }[] = [];
    if (user.lineUserId) {
        providers.push({ key: 'line', label: 'LINE', className: 'bg-[#06C755]/10 text-[#06C755] border-[#06C755]/30' });
    }
    if (user.googleUserId) {
        providers.push({ key: 'google', label: 'Google', className: 'bg-[#EA4335]/10 text-[#EA4335] border-[#EA4335]/30' });
    }
    if (user.facebookUserId) {
        providers.push({ key: 'facebook', label: 'Facebook', className: 'bg-[#1877F2]/10 text-[#1877F2] border-[#1877F2]/30' });
    }
    if (providers.length === 0) return null;
    return (
        <span className="inline-flex flex-wrap items-center gap-1 mt-1">
            {providers.map((p) => (
                <span
                    key={p.key}
                    className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border ${p.className}`}
                    title={`เข้าสู่ระบบด้วย ${p.label}`}
                >
                    {p.label}
                </span>
            ))}
        </span>
    );
}

const KYC_BADGE: Record<string, { label: string; className: string; Icon: React.ElementType }> = {
    INDIVIDUAL: {
        label: "บุคคลธรรมดา",
        className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
        Icon: BadgeCheck,
    },
    CORPORATE: {
        label: "นิติบุคคล",
        className: "bg-blue-50 text-blue-700 border border-blue-200",
        Icon: Building2,
    },
};

function getKycBadge(profile: UserItem["sellerProfile"]) {
    if (!profile) return null;
    if (!profile.isVerified || !profile.verificationLevel || profile.verificationLevel === "NONE") return null;
    return KYC_BADGE[profile.verificationLevel] ?? null;
}

export default function UserManagementPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 500);
    const [users, setUsers] = useState<UserItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({ page: String(page), limit: '20' });
            if (debouncedSearch) params.set('search', debouncedSearch);
            const data = await apiFetch(`/admin/users?${params}`);
            setUsers(data.users || []);
            setTotalPages(data.pagination?.totalPages || 1);
            setTotal(data.pagination?.total || 0);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setIsLoading(false);
        }
    }, [page, debouncedSearch]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('th-TH', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const startItem = (page - 1) * 20 + 1;
    const endItem = Math.min(page * 20, total);

    return (
        <DashboardLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
                        <Users className="text-primary" /> จัดการผู้ใช้งาน
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">ตรวจสอบและบริหารจัดการข้อมูลผู้ใช้งานทั้งหมดในระบบ</p>
                </div>
                <div className="text-sm text-muted-foreground font-medium">
                    ผู้ใช้งานทั้งหมด {total.toLocaleString('th-TH')} คน
                </div>
            </div>

            {/* Search */}
            <div className="mb-4 max-w-sm">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="ค้นหาด้วยชื่อ, อีเมล หรือเบอร์โทร..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                        className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-lg text-sm outline-none focus:border-border transition-colors"
                    />
                </div>
            </div>

            {/* User Table */}
            <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-muted border-b border-border">
                                <th className="px-6 py-3 text-xs font-medium text-muted-foreground">ข้อมูลผู้ใช้งาน</th>
                                <th className="px-6 py-3 text-xs font-medium text-muted-foreground">เบอร์โทร</th>
                                <th className="px-6 py-3 text-xs font-medium text-muted-foreground">แพ็กเกจ</th>
                                <th className="px-6 py-3 text-xs font-medium text-muted-foreground text-center">ยืนยันตัวตน</th>
                                <th className="px-6 py-3 text-xs font-medium text-muted-foreground text-center">ประกาศ</th>
                                <th className="px-6 py-3 text-xs font-medium text-muted-foreground text-center">Bonus Slots</th>
                                <th className="px-6 py-3 text-xs font-medium text-muted-foreground text-center">สถานะ</th>
                                <th className="px-6 py-3 text-xs font-medium text-muted-foreground">วันที่สมัคร</th>
                                <th className="px-6 py-3 text-xs font-medium text-muted-foreground text-right">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan={9} className="px-6 py-4">
                                            <div className="animate-pulse flex items-center gap-3">
                                                <div className="h-9 w-9 bg-accent rounded-lg" />
                                                <div className="flex-1 space-y-2">
                                                    <div className="h-3 bg-accent rounded w-32" />
                                                    <div className="h-2.5 bg-accent rounded w-48" />
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-6 py-12 text-center text-muted-foreground text-sm">
                                        ไม่พบผู้ใช้งาน
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="hover:bg-accent transition-colors group">
                                        <td className="px-6 py-4">
                                            <Link href={`/users/${user.id}`} className="flex items-center gap-3 group/link">
                                                <div className="h-9 w-9 bg-accent rounded-lg flex items-center justify-center text-muted-foreground font-medium text-sm">
                                                    {user.fullName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-foreground group-hover/link:text-primary group-hover/link:underline transition-colors">{user.fullName}</p>
                                                    <span className="text-xs text-muted-foreground flex items-center gap-1"><Mail size={11} /> {user.email}</span>
                                                    <SocialBadges user={user} />
                                                </div>
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-muted-foreground flex items-center gap-1"><Phone size={13} /> {user.phoneNumber}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.currentPackage ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700">
                                                    <Package size={12} className="mr-1" />
                                                    {user.currentPackage.name}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">ไม่มีแพ็กเกจ</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {(() => {
                                                const badge = getKycBadge(user.sellerProfile);
                                                if (badge) {
                                                    const { Icon, label, className } = badge;
                                                    return (
                                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium ${className}`}>
                                                            <Icon size={12} />
                                                            {label}
                                                        </span>
                                                    );
                                                }
                                                return (
                                                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                                        <ShieldAlert size={12} />
                                                        ยังไม่ยืนยัน
                                                    </span>
                                                );
                                            })()}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center gap-1 text-sm text-muted-foreground font-medium" title="ประกาศที่ใช้ slot / โควตาสูงสุดของแพ็กเกจ">
                                                <Car size={14} className="text-muted-foreground" />
                                                {user._count.listings}
                                                <span className="text-muted-foreground/60">/</span>
                                                {user.effectiveMaxListings === -1 ? '∞' : user.effectiveMaxListings}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {user.bonusListingSlots > 0 ? (
                                                <span
                                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200"
                                                    title="Slot โบนัสที่ admin เคยให้ผู้ใช้นี้ (รวมเข้าโควตาแล้ว)"
                                                >
                                                    <Plus size={12} />
                                                    {user.bonusListingSlots}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-muted-foreground/60">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {user.isActive ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700">Active</span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-accent text-muted-foreground">Inactive</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-muted-foreground">
                                            {formatDate(user.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link href={`/users/${user.id}`}>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-primary hover:text-primary hover:bg-blue-50 text-xs"
                                                >
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
                            แสดงผล {startItem} - {endItem} จากทั้งหมด {total.toLocaleString('th-TH')} รายการ
                        </p>
                        <div className="flex gap-1">
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                disabled={page <= 1}
                                onClick={() => setPage(p => p - 1)}
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
                                onClick={() => setPage(p => p + 1)}
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
