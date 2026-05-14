"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState, useCallback } from "react";
import {
    ArrowLeft,
    Mail,
    Phone,
    Calendar,
    Package,
    Store,
    ShieldCheck,
    ShieldAlert,
    User as UserIcon,
    Car,
    MessageSquare,
    Heart,
    Warehouse,
    Receipt,
    Loader2,
    UserX,
    UserCheck,
    MapPin,
    ExternalLink,
    Pencil,
    Save,
    X as XIcon,
    Trash2,
    LogIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";

const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";

interface RecentListing {
    id: string;
    title: string;
    brand: string;
    model: string;
    year: number;
    price: number;
    status: string;
    createdAt: string;
    images: { url: string }[];
}

interface SellerProfile {
    id: string;
    shopName: string;
    shopProvince: string | null;
    shopDistrict: string | null;
    showroomType: "INDIVIDUAL" | "CORPORATE";
    isVerified: boolean;
    verifiedAt: string | null;
    verificationLevel: string;
    totalSoldCount: number;
    shopLogo: string | null;
}

interface KycSubmission {
    id: string;
    type: string;
    status: string;
    submittedAt: string;
    reviewedAt: string | null;
    reviewNote: string | null;
}

interface UserDetail {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    profileImage: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    packageExpiresAt: string | null;
    currentPackage: { name: string; slug: string } | null;
    sellerProfile: SellerProfile | null;
    latestKyc: KycSubmission | null;
    linkedProviders: { line: boolean; google: boolean; facebook: boolean };
    recentListings: RecentListing[];
    _count: {
        listings: number;
        packageTransactions: number;
        forumPosts: number;
        forumComments: number;
        wishlists: number;
        garageVehicles: number;
    };
}

const SHOWROOM_LABEL: Record<string, string> = {
    INDIVIDUAL: "บุคคลธรรมดา",
    CORPORATE: "นิติบุคคล",
};

const KYC_STATUS: Record<string, { label: string; className: string }> = {
    PENDING: { label: "รอตรวจสอบ", className: "bg-amber-50 text-amber-700" },
    APPROVED: { label: "อนุมัติแล้ว", className: "bg-emerald-50 text-emerald-700" },
    REJECTED: { label: "ถูกปฏิเสธ", className: "bg-rose-50 text-rose-700" },
    CANCELLED: { label: "ยกเลิก", className: "bg-muted text-muted-foreground" },
};

const LISTING_STATUS: Record<string, { label: string; className: string }> = {
    PENDING: { label: "รอตรวจสอบ", className: "bg-amber-50 text-amber-700" },
    ACTIVE: { label: "อนุมัติแล้ว", className: "bg-emerald-50 text-emerald-700" },
    SUSPENDED: { label: "ถูกปฏิเสธ", className: "bg-rose-50 text-rose-700" },
    DRAFT: { label: "แบบร่าง", className: "bg-muted text-muted-foreground" },
    SOLD: { label: "ขายแล้ว", className: "bg-blue-50 text-blue-700" },
    EXPIRED: { label: "หมดอายุ", className: "bg-muted text-muted-foreground" },
};

function formatDate(dateStr: string | null | undefined) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("th-TH", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function formatDateTime(dateStr: string | null | undefined) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString("th-TH", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function StatCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: number | string }) {
    return (
        <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <Icon size={14} />
                {label}
            </div>
            <div className="text-2xl font-bold mt-1">{typeof value === "number" ? value.toLocaleString("th-TH") : value}</div>
        </div>
    );
}

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [user, setUser] = useState<UserDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [toggling, setToggling] = useState(false);

    // Edit state
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editForm, setEditForm] = useState({ fullName: "", email: "", phoneNumber: "" });

    // Delete state
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // Impersonate state — admin "login as user"
    const [impersonateOpen, setImpersonateOpen] = useState(false);
    const [impersonating, setImpersonating] = useState(false);

    const fetchUser = useCallback(async () => {
        setLoading(true);
        try {
            const data = await apiFetch(`/admin/users/${id}`);
            setUser(data);
        } catch (err: any) {
            if (err.message?.includes("ไม่พบ")) setNotFound(true);
            else toast.error(err.message || "โหลดข้อมูลไม่สำเร็จ");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    const handleToggleStatus = async () => {
        if (!user) return;
        setToggling(true);
        try {
            const res = await apiFetch(`/admin/users/${user.id}/toggle-status`, { method: "PUT" });
            setUser({ ...user, isActive: res.user.isActive });
            toast.success(res.message || "บันทึกสำเร็จ");
        } catch (err: any) {
            toast.error(err.message || "เกิดข้อผิดพลาด");
        } finally {
            setToggling(false);
        }
    };

    const startEdit = () => {
        if (!user) return;
        setEditForm({
            fullName: user.fullName,
            email: user.email,
            phoneNumber: user.phoneNumber,
        });
        setEditing(true);
    };

    const cancelEdit = () => {
        setEditing(false);
    };

    const handleSave = async () => {
        if (!user) return;
        if (!editForm.fullName.trim()) {
            toast.error("กรุณากรอกชื่อ");
            return;
        }
        setSaving(true);
        try {
            const res = await apiFetch(`/admin/users/${user.id}`, {
                method: "PUT",
                body: JSON.stringify(editForm),
            });
            setUser({ ...user, ...res.user });
            toast.success(res.message || "บันทึกสำเร็จ");
            setEditing(false);
        } catch (err: any) {
            toast.error(err.message || "เกิดข้อผิดพลาด");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!user) return;
        setDeleting(true);
        try {
            const res = await apiFetch(`/admin/users/${user.id}`, { method: "DELETE" });
            toast.success(res.message || "ลบบัญชีเรียบร้อย");
            setDeleteOpen(false);
            router.push("/users");
        } catch (err: any) {
            toast.error(err.message || "เกิดข้อผิดพลาด");
            setDeleting(false);
        }
    };

    const handleImpersonate = async () => {
        if (!user) return;
        setImpersonating(true);
        try {
            const res = await apiFetch(`/admin/users/${user.id}/impersonate`, { method: "POST" });
            const url = `${FRONTEND_URL}/admin-impersonate?token=${encodeURIComponent(res.token)}`;
            // window.open() with `noopener` always returns null even on success, so
            // can't reliably detect popup blocking here — just close optimistically.
            window.open(url, "_blank", "noopener,noreferrer");
            toast.success("เปิด session impersonate ใน tab ใหม่แล้ว");
            setImpersonateOpen(false);
        } catch (err: any) {
            toast.error(err.message || "ไม่สามารถสร้าง session impersonate ได้");
        } finally {
            setImpersonating(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center py-24">
                    <Loader2 className="animate-spin text-primary" />
                </div>
            </DashboardLayout>
        );
    }

    if (notFound || !user) {
        return (
            <DashboardLayout>
                <div className="max-w-md mx-auto text-center py-24">
                    <h2 className="text-xl font-bold mb-2">ไม่พบผู้ใช้งาน</h2>
                    <p className="text-muted-foreground mb-6">ผู้ใช้อาจถูกลบหรือ ID ไม่ถูกต้อง</p>
                    <Link href="/users">
                        <Button variant="outline"><ArrowLeft size={16} /> กลับไปหน้ารายชื่อ</Button>
                    </Link>
                </div>
            </DashboardLayout>
        );
    }

    const kycMeta = user.latestKyc ? KYC_STATUS[user.latestKyc.status] ?? KYC_STATUS.PENDING : null;

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <Link href="/users" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition">
                        <ArrowLeft size={16} /> กลับไปหน้ารายชื่อผู้ใช้
                    </Link>
                    <div className="flex items-center gap-2 flex-wrap">
                        {!editing ? (
                            <>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={startEdit}
                                >
                                    <Pencil size={14} /> แก้ไข
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={toggling}
                                    onClick={handleToggleStatus}
                                    className={user.isActive
                                        ? "text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
                                        : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200"
                                    }
                                >
                                    {toggling ? <Loader2 size={14} className="animate-spin" /> : user.isActive ? <UserX size={14} /> : <UserCheck size={14} />}
                                    {user.isActive ? "ปิดการใช้งาน" : "เปิดการใช้งาน"}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setImpersonateOpen(true)}
                                    disabled={!user.isActive}
                                    title={!user.isActive ? "ไม่สามารถ impersonate ผู้ใช้ที่ถูกปิดการใช้งาน" : undefined}
                                    className="text-amber-700 hover:text-amber-800 hover:bg-amber-50 border-amber-200 disabled:opacity-50"
                                >
                                    <LogIn size={14} /> เข้าใช้งานเป็นผู้ใช้นี้
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setDeleteOpen(true)}
                                    className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
                                >
                                    <Trash2 size={14} /> ลบบัญชี
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={cancelEdit}
                                    disabled={saving}
                                >
                                    <XIcon size={14} /> ยกเลิก
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleSave}
                                    disabled={saving}
                                >
                                    {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} บันทึก
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Identity Card */}
                <div className="bg-card border border-border rounded-2xl p-6">
                    <div className="flex items-start gap-4 flex-wrap">
                        <div className="h-16 w-16 rounded-full bg-muted overflow-hidden flex items-center justify-center text-2xl font-bold text-muted-foreground flex-shrink-0">
                            {user.profileImage ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={user.profileImage} alt={user.fullName} className="h-full w-full object-cover" />
                            ) : (
                                user.fullName.charAt(0)
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            {!editing ? (
                                <>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h1 className="text-2xl font-bold">{user.fullName}</h1>
                                        {user.isActive ? (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700">Active</span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-muted text-muted-foreground">Inactive</span>
                                        )}
                                    </div>
                                    <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
                                        <span className="inline-flex items-center gap-1.5"><Mail size={14} /> {user.email}</span>
                                        <span className="inline-flex items-center gap-1.5"><Phone size={14} /> {user.phoneNumber}</span>
                                        <span className="inline-flex items-center gap-1.5"><Calendar size={14} /> สมัครเมื่อ {formatDate(user.createdAt)}</span>
                                    </div>
                                </>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div className="space-y-1">
                                        <Label htmlFor="fullName" className="text-xs text-muted-foreground">ชื่อ-นามสกุล</Label>
                                        <Input
                                            id="fullName"
                                            value={editForm.fullName}
                                            onChange={(e) => setEditForm((f) => ({ ...f, fullName: e.target.value }))}
                                            disabled={saving}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="email" className="text-xs text-muted-foreground">อีเมล</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={editForm.email}
                                            onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                                            disabled={saving}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="phoneNumber" className="text-xs text-muted-foreground">เบอร์โทร</Label>
                                        <Input
                                            id="phoneNumber"
                                            value={editForm.phoneNumber}
                                            onChange={(e) => setEditForm((f) => ({ ...f, phoneNumber: e.target.value }))}
                                            disabled={saving}
                                        />
                                    </div>
                                </div>
                            )}
                            {(user.linkedProviders.line || user.linkedProviders.google || user.linkedProviders.facebook) && (
                                <div className="mt-3 flex flex-wrap gap-1.5">
                                    {user.linkedProviders.line && <span className="text-[11px] px-2 py-0.5 rounded-full bg-green-50 text-green-700">LINE</span>}
                                    {user.linkedProviders.google && <span className="text-[11px] px-2 py-0.5 rounded-full bg-red-50 text-red-700">Google</span>}
                                    {user.linkedProviders.facebook && <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">Facebook</span>}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    <StatCard icon={Car} label="ประกาศทั้งหมด" value={user._count.listings} />
                    <StatCard icon={Heart} label="รายการโปรด" value={user._count.wishlists} />
                    <StatCard icon={Warehouse} label="โรงรถ" value={user._count.garageVehicles} />
                    <StatCard icon={MessageSquare} label="กระทู้" value={user._count.forumPosts} />
                    <StatCard icon={MessageSquare} label="ความเห็น" value={user._count.forumComments} />
                    <StatCard icon={Receipt} label="ธุรกรรมแพ็กเกจ" value={user._count.packageTransactions} />
                </div>

                {/* Two-column details */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: main details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Recent Listings */}
                        <div className="bg-card border border-border rounded-2xl overflow-hidden">
                            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                                <h2 className="font-bold flex items-center gap-2"><Car size={16} className="text-primary" /> ประกาศล่าสุด</h2>
                                {user._count.listings > 5 && (
                                    <Link href={`/listings?userId=${user.id}`} className="text-xs text-primary hover:underline inline-flex items-center gap-1">
                                        ดูทั้งหมด <ExternalLink size={12} />
                                    </Link>
                                )}
                            </div>
                            {user.recentListings.length === 0 ? (
                                <div className="py-10 text-center text-sm text-muted-foreground">ยังไม่มีประกาศ</div>
                            ) : (
                                <ul className="divide-y divide-border">
                                    {user.recentListings.map((l) => {
                                        const meta = LISTING_STATUS[l.status] ?? LISTING_STATUS.DRAFT;
                                        return (
                                            <li key={l.id} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/50 transition">
                                                <div className="h-12 w-16 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                                                    {l.images[0] ? (
                                                        // eslint-disable-next-line @next/next/no-img-element
                                                        <img src={l.images[0].url} alt={l.title} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <div className="h-full w-full flex items-center justify-center text-muted-foreground"><Car size={16} /></div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">{l.title}</p>
                                                    <p className="text-xs text-muted-foreground">{l.brand} {l.model} · {l.year} · {l.price.toLocaleString("th-TH")} บาท</p>
                                                </div>
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${meta.className}`}>{meta.label}</span>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>

                        {/* Seller Profile */}
                        <div className="bg-card border border-border rounded-2xl overflow-hidden">
                            <div className="px-5 py-4 border-b border-border">
                                <h2 className="font-bold flex items-center gap-2"><Store size={16} className="text-primary" /> โปรไฟล์ผู้ขาย</h2>
                            </div>
                            {user.sellerProfile ? (
                                <div className="p-5 space-y-3 text-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-muted overflow-hidden flex items-center justify-center text-muted-foreground">
                                            {user.sellerProfile.shopLogo ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={user.sellerProfile.shopLogo} alt={user.sellerProfile.shopName} className="h-full w-full object-cover" />
                                            ) : (
                                                <Store size={18} />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <Link
                                                href={`/sellers/${user.sellerProfile.id}`}
                                                className="font-medium truncate hover:text-primary hover:underline inline-flex items-center gap-1"
                                            >
                                                {user.sellerProfile.shopName} <ExternalLink size={12} />
                                            </Link>
                                            <p className="text-xs text-muted-foreground">{SHOWROOM_LABEL[user.sellerProfile.showroomType]}</p>
                                        </div>
                                        {user.sellerProfile.isVerified ? (
                                            <span className="inline-flex items-center gap-1 text-xs text-emerald-600"><ShieldCheck size={14} /> Verified</span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><ShieldAlert size={14} /> ยังไม่ยืนยัน</span>
                                        )}
                                    </div>
                                    <dl className="grid grid-cols-2 gap-x-4 gap-y-2 pt-2 border-t border-border text-xs">
                                        <div>
                                            <dt className="text-muted-foreground">ระดับการยืนยัน</dt>
                                            <dd className="font-medium">{user.sellerProfile.verificationLevel}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-muted-foreground">ยอดขายรวม</dt>
                                            <dd className="font-medium">{user.sellerProfile.totalSoldCount.toLocaleString("th-TH")}</dd>
                                        </div>
                                        {(user.sellerProfile.shopProvince || user.sellerProfile.shopDistrict) && (
                                            <div className="col-span-2">
                                                <dt className="text-muted-foreground">ที่ตั้ง</dt>
                                                <dd className="font-medium inline-flex items-center gap-1"><MapPin size={12} /> {[user.sellerProfile.shopDistrict, user.sellerProfile.shopProvince].filter(Boolean).join(", ") || "—"}</dd>
                                            </div>
                                        )}
                                    </dl>
                                </div>
                            ) : (
                                <div className="py-10 text-center text-sm text-muted-foreground">ยังไม่ได้สร้างโปรไฟล์ผู้ขาย</div>
                            )}
                        </div>
                    </div>

                    {/* Right: side details */}
                    <div className="space-y-6">
                        {/* Package */}
                        <div className="bg-card border border-border rounded-2xl p-5">
                            <h2 className="font-bold flex items-center gap-2 mb-3"><Package size={16} className="text-primary" /> แพ็กเกจปัจจุบัน</h2>
                            {user.currentPackage ? (
                                <div className="space-y-1.5 text-sm">
                                    <p className="font-medium">{user.currentPackage.name}</p>
                                    {user.packageExpiresAt && (
                                        <p className="text-xs text-muted-foreground">หมดอายุ {formatDate(user.packageExpiresAt)}</p>
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">ไม่มีแพ็กเกจ</p>
                            )}
                        </div>

                        {/* KYC */}
                        <div className="bg-card border border-border rounded-2xl p-5">
                            <h2 className="font-bold flex items-center gap-2 mb-3"><ShieldCheck size={16} className="text-primary" /> KYC</h2>
                            {user.latestKyc && kycMeta ? (
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground text-xs">ประเภท</span>
                                        <span className="font-medium">{user.latestKyc.type}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground text-xs">สถานะ</span>
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${kycMeta.className}`}>{kycMeta.label}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground text-xs">ส่งเมื่อ</span>
                                        <span className="font-medium text-xs">{formatDateTime(user.latestKyc.submittedAt)}</span>
                                    </div>
                                    {user.latestKyc.reviewedAt && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground text-xs">ตรวจเมื่อ</span>
                                            <span className="font-medium text-xs">{formatDateTime(user.latestKyc.reviewedAt)}</span>
                                        </div>
                                    )}
                                    {user.latestKyc.reviewNote && (
                                        <div className="pt-2 border-t border-border">
                                            <p className="text-xs text-muted-foreground mb-1">หมายเหตุ</p>
                                            <p className="text-xs">{user.latestKyc.reviewNote}</p>
                                        </div>
                                    )}
                                    <Link href={`/kyc?userId=${user.id}`} className="text-xs text-primary hover:underline inline-flex items-center gap-1 pt-2">
                                        ดูใน KYC <ExternalLink size={12} />
                                    </Link>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">ยังไม่เคยยื่น KYC</p>
                            )}
                        </div>

                        {/* Meta */}
                        <div className="bg-card border border-border rounded-2xl p-5">
                            <h2 className="font-bold flex items-center gap-2 mb-3"><UserIcon size={16} className="text-primary" /> ข้อมูลระบบ</h2>
                            <dl className="space-y-2 text-sm">
                                <div className="flex items-center justify-between">
                                    <dt className="text-muted-foreground text-xs">User ID</dt>
                                    <dd className="font-mono text-xs">{user.id}</dd>
                                </div>
                                <div className="flex items-center justify-between">
                                    <dt className="text-muted-foreground text-xs">อัพเดตล่าสุด</dt>
                                    <dd className="text-xs">{formatDateTime(user.updatedAt)}</dd>
                                </div>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>

            <DeleteConfirmModal
                isOpen={deleteOpen}
                onClose={() => setDeleteOpen(false)}
                onConfirm={handleDelete}
                title="ลบบัญชีผู้ใช้"
                description={`คุณแน่ใจหรือไม่ที่จะลบบัญชี "${user.fullName}"? ข้อมูลส่วนตัวจะถูกลบและบัญชีจะถูกปิดการใช้งาน`}
                isLoading={deleting}
            />

            <Dialog open={impersonateOpen} onOpenChange={(open) => !impersonating && !open && setImpersonateOpen(false)}>
                <DialogContent className="sm:max-w-md rounded-xl p-0 overflow-hidden border-slate-200 shadow-lg">
                    <div className="p-6">
                        <div className="mb-5">
                            <div className="h-11 w-11 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600">
                                <ShieldAlert size={22} />
                            </div>
                        </div>

                        <DialogHeader className="text-left space-y-1.5">
                            <DialogTitle className="text-lg font-semibold text-slate-800">เข้าใช้งานเป็นผู้ใช้นี้?</DialogTitle>
                            <DialogDescription className="text-slate-500 text-sm leading-relaxed">
                                คุณจะเปิด tab ใหม่และเข้าสู่ระบบในนามของ <strong>{user.fullName}</strong> session นี้มีอายุ <strong>1 ชั่วโมง</strong> และจะถูกบันทึกใน audit log
                            </DialogDescription>
                        </DialogHeader>

                        <ul className="mt-4 space-y-1 text-xs text-slate-500 list-disc list-inside">
                            <li>ไม่สามารถเปลี่ยนรหัสผ่าน / อีเมลของผู้ใช้</li>
                            <li>ไม่สามารถลบบัญชีหรือซื้อแพ็กเกจ/slot แทนผู้ใช้</li>
                        </ul>

                        <div className="mt-6 flex items-center gap-3">
                            <Button
                                variant="secondary"
                                disabled={impersonating}
                                onClick={() => setImpersonateOpen(false)}
                                className="flex-1 h-10 font-medium rounded-lg"
                            >
                                ยกเลิก
                            </Button>
                            <Button
                                disabled={impersonating}
                                onClick={handleImpersonate}
                                className="flex-1 h-10 font-medium rounded-lg flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white"
                            >
                                {impersonating ? (
                                    <><Loader2 className="animate-spin" size={16} /> กำลังเปิด...</>
                                ) : (
                                    <><LogIn size={16} /> เปิด session</>
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
}
