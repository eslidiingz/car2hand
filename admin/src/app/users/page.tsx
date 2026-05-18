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
    UserPlus,
    Loader2,
    RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useDebounce } from "@/hooks/useDebounce";

const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";

/** Random 10-char temp password (admin can copy/share, user resets later). */
function genPassword() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
    return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

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

    // Register-user dialog
    const [registerOpen, setRegisterOpen] = useState(false);
    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState({ fullName: "", phoneNumber: "", email: "", password: "" });
    // Per-row "ลงประกาศแทน" loading
    const [sellAsId, setSellAsId] = useState<string | null>(null);

    const resetForm = () => setForm({ fullName: "", phoneNumber: "", email: "", password: "" });

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

    const handleCreateUser = async () => {
        const fullName = form.fullName.trim();
        const phoneNumber = form.phoneNumber.trim();
        const email = form.email.trim();
        const password = form.password;
        if (!fullName || !phoneNumber || !password) {
            toast.error("กรุณากรอกชื่อ เบอร์โทร และรหัสผ่าน");
            return;
        }
        if (password.length < 8) {
            toast.error("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร");
            return;
        }
        setCreating(true);
        try {
            await apiFetch(`/admin/users`, {
                method: "POST",
                body: JSON.stringify({ fullName, phoneNumber, password, email: email || undefined }),
            });
            toast.success("สร้างผู้ใช้สำเร็จ");
            setRegisterOpen(false);
            resetForm();
            setPage(1);
            fetchUsers();
        } catch (err: any) {
            toast.error(err.message || "ไม่สามารถสร้างผู้ใช้ได้");
        } finally {
            setCreating(false);
        }
    };

    // Impersonate the user and deep-link straight to the public sell form.
    const handleSellAs = async (userId: string, isActive: boolean) => {
        if (!isActive) {
            toast.error("ผู้ใช้นี้ถูกปิดการใช้งาน");
            return;
        }
        setSellAsId(userId);
        try {
            const res = await apiFetch(`/admin/users/${userId}/impersonate`, { method: "POST" });
            const url = `${FRONTEND_URL}/admin-impersonate?token=${encodeURIComponent(res.token)}&next=${encodeURIComponent("/sell")}`;
            window.open(url, "_blank", "noopener,noreferrer");
            toast.success("เปิดหน้าลงประกาศแทนผู้ใช้ใน tab ใหม่แล้ว");
        } catch (err: any) {
            toast.error(err.message || "ไม่สามารถเปิดหน้าลงประกาศแทนได้");
        } finally {
            setSellAsId(null);
        }
    };

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
                <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground font-medium">
                        ผู้ใช้งานทั้งหมด {total.toLocaleString('th-TH')} คน
                    </span>
                    <Button
                        size="sm"
                        onClick={() => { resetForm(); setRegisterOpen(true); }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                    >
                        <UserPlus size={16} /> เพิ่มผู้ใช้
                    </Button>
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
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleSellAs(user.id, user.isActive)}
                                                    disabled={!user.isActive || sellAsId === user.id}
                                                    title={!user.isActive ? "ผู้ใช้นี้ถูกปิดการใช้งาน" : "ลงประกาศในนามผู้ใช้นี้"}
                                                    className="text-primary hover:text-primary hover:bg-blue-50 text-xs disabled:opacity-50"
                                                >
                                                    {sellAsId === user.id
                                                        ? <Loader2 size={14} className="animate-spin" />
                                                        : <Car size={14} />} ลงประกาศแทน
                                                </Button>
                                                <Link href={`/users/${user.id}`}>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-primary hover:text-primary hover:bg-blue-50 text-xs"
                                                    >
                                                        <Eye size={14} /> ดูรายละเอียด
                                                    </Button>
                                                </Link>
                                            </div>
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

            {/* Register-user dialog */}
            <Dialog open={registerOpen} onOpenChange={(o) => !creating && setRegisterOpen(o)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <UserPlus size={18} className="text-emerald-600" /> เพิ่มผู้ใช้ใหม่
                        </DialogTitle>
                        <DialogDescription>
                            สร้างบัญชีผู้ใช้โดยตรง — อีเมลไม่บังคับ (ผู้ใช้ตั้งภายหลังได้)
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="ru-name">ชื่อ-นามสกุล *</Label>
                            <Input
                                id="ru-name"
                                value={form.fullName}
                                onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                                placeholder="เช่น สมชาย ใจดี"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="ru-phone">เบอร์โทรศัพท์ *</Label>
                            <Input
                                id="ru-phone"
                                value={form.phoneNumber}
                                onChange={(e) => setForm((f) => ({ ...f, phoneNumber: e.target.value.replace(/\D/g, "").slice(0, 10) }))}
                                placeholder="08XXXXXXXX"
                                inputMode="numeric"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="ru-email">อีเมล <span className="text-muted-foreground font-normal">(ไม่บังคับ)</span></Label>
                            <Input
                                id="ru-email"
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                                placeholder="เว้นว่างได้"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="ru-pass">รหัสผ่าน * <span className="text-muted-foreground font-normal">(อย่างน้อย 8 ตัว)</span></Label>
                            <div className="flex gap-2">
                                <Input
                                    id="ru-pass"
                                    value={form.password}
                                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                                    placeholder="ตั้งรหัสผ่าน"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setForm((f) => ({ ...f, password: genPassword() }))}
                                    title="สุ่มรหัสผ่าน"
                                >
                                    <RefreshCw size={14} /> สุ่ม
                                </Button>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setRegisterOpen(false)}
                            disabled={creating}
                        >
                            ยกเลิก
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleCreateUser}
                            disabled={creating}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                        >
                            {creating ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
                            สร้างผู้ใช้
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
}
