"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";
import { use, useEffect, useState, useCallback } from "react";
import {
    ArrowLeft,
    Store,
    Loader2,
    Pencil,
    Save,
    X as XIcon,
    ShieldCheck,
    ShieldAlert,
    MapPin,
    Phone,
    Mail,
    User as UserIcon,
    Car,
    ExternalLink,
    Facebook,
    Instagram,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface SellerUser {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string | null;
    profileImage: string | null;
    isActive: boolean;
    createdAt: string;
    currentPackage: { name: string; nameTh?: string | null; slug: string } | null;
}

interface SellerDetail {
    id: string;
    userId: string;
    shopName: string;
    shopDescription: string | null;
    shopLogo: string | null;
    shopCover: string | null;
    shopAddress: string | null;
    shopProvince: string | null;
    shopDistrict: string | null;
    shopPhone: string | null;
    showroomType: "INDIVIDUAL" | "CORPORATE";
    shopOpenHours: string | null;
    socialFacebook: string | null;
    socialLine: string | null;
    socialInstagram: string | null;
    specializations: unknown;
    verificationLevel: "NONE" | "INDIVIDUAL" | "CORPORATE";
    isVerified: boolean;
    verifiedAt: string | null;
    totalSoldCount: number;
    createdAt: string;
    updatedAt: string;
    user: SellerUser;
}

interface Stats {
    listingCount: number;
    totalSoldCount: number;
    soldListingCount: number;
}

const SHOWROOM_LABEL: Record<string, string> = {
    INDIVIDUAL: "บุคคลธรรมดา",
    CORPORATE: "นิติบุคคล",
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

function StatCard({ label, value }: { label: string; value: number }) {
    return (
        <div className="bg-card border border-border rounded-xl p-4">
            <div className="text-muted-foreground text-xs">{label}</div>
            <div className="text-2xl font-bold mt-1">{value.toLocaleString("th-TH")}</div>
        </div>
    );
}

type EditForm = {
    shopName: string;
    shopDescription: string;
    shopAddress: string;
    shopProvince: string;
    shopDistrict: string;
    shopPhone: string;
    showroomType: "INDIVIDUAL" | "CORPORATE";
    shopOpenHours: string;
    socialFacebook: string;
    socialLine: string;
    socialInstagram: string;
    verificationLevel: "NONE" | "INDIVIDUAL" | "CORPORATE";
};

export default function SellerDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);

    const [seller, setSeller] = useState<SellerDetail | null>(null);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState<EditForm>({
        shopName: "",
        shopDescription: "",
        shopAddress: "",
        shopProvince: "",
        shopDistrict: "",
        shopPhone: "",
        showroomType: "INDIVIDUAL",
        shopOpenHours: "",
        socialFacebook: "",
        socialLine: "",
        socialInstagram: "",
        verificationLevel: "NONE",
    });

    const [verifying, setVerifying] = useState(false);
    const [verifyLevel, setVerifyLevel] = useState<"INDIVIDUAL" | "CORPORATE">("INDIVIDUAL");

    const fetchSeller = useCallback(async () => {
        setLoading(true);
        try {
            const data = await apiFetch(`/admin/seller-profiles/${id}`);
            setSeller(data.seller);
            setStats(data.stats);
        } catch (err: any) {
            if (err.message?.includes("ไม่พบ")) setNotFound(true);
            else toast.error(err.message || "โหลดข้อมูลไม่สำเร็จ");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchSeller();
    }, [fetchSeller]);

    const startEdit = () => {
        if (!seller) return;
        setForm({
            shopName: seller.shopName ?? "",
            shopDescription: seller.shopDescription ?? "",
            shopAddress: seller.shopAddress ?? "",
            shopProvince: seller.shopProvince ?? "",
            shopDistrict: seller.shopDistrict ?? "",
            shopPhone: seller.shopPhone ?? "",
            showroomType: seller.showroomType,
            shopOpenHours: seller.shopOpenHours ?? "",
            socialFacebook: seller.socialFacebook ?? "",
            socialLine: seller.socialLine ?? "",
            socialInstagram: seller.socialInstagram ?? "",
            verificationLevel: seller.verificationLevel,
        });
        setEditing(true);
    };

    const cancelEdit = () => setEditing(false);

    const handleSave = async () => {
        if (!seller) return;
        if (!form.shopName.trim()) {
            toast.error("กรุณากรอกชื่อร้าน");
            return;
        }
        setSaving(true);
        try {
            const res = await apiFetch(`/admin/seller-profiles/${seller.id}`, {
                method: "PUT",
                body: JSON.stringify(form),
            });
            toast.success(res.message || "บันทึกสำเร็จ");
            setEditing(false);
            await fetchSeller();
        } catch (err: any) {
            toast.error(err.message || "เกิดข้อผิดพลาด");
        } finally {
            setSaving(false);
        }
    };

    const handleVerify = async () => {
        if (!seller) return;
        setVerifying(true);
        try {
            const res = await apiFetch(`/admin/seller-profiles/${seller.id}/verify`, {
                method: "POST",
                body: JSON.stringify({ verificationLevel: verifyLevel }),
            });
            toast.success(res.message || "ยืนยันเรียบร้อย");
            await fetchSeller();
        } catch (err: any) {
            toast.error(err.message || "เกิดข้อผิดพลาด");
        } finally {
            setVerifying(false);
        }
    };

    const handleUnverify = async () => {
        if (!seller) return;
        setVerifying(true);
        try {
            const res = await apiFetch(`/admin/seller-profiles/${seller.id}/unverify`, {
                method: "POST",
            });
            toast.success(res.message || "ยกเลิกการยืนยันเรียบร้อย");
            await fetchSeller();
        } catch (err: any) {
            toast.error(err.message || "เกิดข้อผิดพลาด");
        } finally {
            setVerifying(false);
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

    if (notFound || !seller) {
        return (
            <DashboardLayout>
                <div className="max-w-md mx-auto text-center py-24">
                    <h2 className="text-xl font-bold mb-2">ไม่พบโปรไฟล์ผู้ขาย</h2>
                    <p className="text-muted-foreground mb-6">โปรไฟล์อาจถูกลบหรือ ID ไม่ถูกต้อง</p>
                    <Link href="/sellers">
                        <Button variant="outline">
                            <ArrowLeft size={16} /> กลับไปหน้ารายการร้านค้า
                        </Button>
                    </Link>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <Link
                        href="/sellers"
                        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition"
                    >
                        <ArrowLeft size={16} /> กลับไปหน้ารายการร้านค้า
                    </Link>
                    <div className="flex items-center gap-2 flex-wrap">
                        {!editing ? (
                            <Button variant="outline" size="sm" onClick={startEdit}>
                                <Pencil size={14} /> แก้ไข
                            </Button>
                        ) : (
                            <>
                                <Button variant="outline" size="sm" onClick={cancelEdit} disabled={saving}>
                                    <XIcon size={14} /> ยกเลิก
                                </Button>
                                <Button size="sm" onClick={handleSave} disabled={saving}>
                                    {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} บันทึก
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Shop header card */}
                <div className="bg-card border border-border rounded-2xl p-6">
                    <div className="flex items-start gap-4 flex-wrap">
                        <div className="h-16 w-16 rounded-2xl bg-muted overflow-hidden flex items-center justify-center text-muted-foreground flex-shrink-0">
                            {seller.shopLogo ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={seller.shopLogo} alt={seller.shopName} className="h-full w-full object-cover" />
                            ) : (
                                <Store size={28} />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-2xl font-bold">{seller.shopName}</h1>
                                {seller.isVerified ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700">
                                        <ShieldCheck size={12} /> ยืนยันแล้ว ({seller.verificationLevel})
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-muted text-muted-foreground">
                                        <ShieldAlert size={12} /> ยังไม่ยืนยัน
                                    </span>
                                )}
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700">
                                    {SHOWROOM_LABEL[seller.showroomType]}
                                </span>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
                                {(seller.shopProvince || seller.shopDistrict) && (
                                    <span className="inline-flex items-center gap-1.5">
                                        <MapPin size={14} /> {[seller.shopDistrict, seller.shopProvince].filter(Boolean).join(", ")}
                                    </span>
                                )}
                                {seller.shopPhone && (
                                    <span className="inline-flex items-center gap-1.5">
                                        <Phone size={14} /> {seller.shopPhone}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                {stats && (
                    <div className="grid grid-cols-3 gap-3">
                        <StatCard label="ประกาศทั้งหมด" value={stats.listingCount} />
                        <StatCard label="ประกาศที่ขายแล้ว" value={stats.soldListingCount} />
                        <StatCard label="ยอดขายรวม (totalSoldCount)" value={stats.totalSoldCount} />
                    </div>
                )}

                {/* Two-column */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: main info / edit form */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-card border border-border rounded-2xl p-6">
                            {!editing ? (
                                <div className="space-y-4">
                                    <h2 className="font-bold">ข้อมูลร้านค้า</h2>

                                    {seller.shopDescription && (
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-1">รายละเอียดร้าน</p>
                                            <p className="text-sm whitespace-pre-line bg-muted p-3 rounded-lg">{seller.shopDescription}</p>
                                        </div>
                                    )}

                                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm pt-2 border-t border-border">
                                        <div>
                                            <dt className="text-muted-foreground text-xs">ที่อยู่</dt>
                                            <dd className="font-medium">{seller.shopAddress || "—"}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-muted-foreground text-xs">จังหวัด / อำเภอ</dt>
                                            <dd className="font-medium">
                                                {[seller.shopDistrict, seller.shopProvince].filter(Boolean).join(", ") || "—"}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-muted-foreground text-xs">เวลาเปิดทำการ</dt>
                                            <dd className="font-medium">{seller.shopOpenHours || "—"}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-muted-foreground text-xs">เบอร์ร้าน</dt>
                                            <dd className="font-medium">{seller.shopPhone || "—"}</dd>
                                        </div>
                                    </dl>

                                    <div className="pt-3 border-t border-border">
                                        <p className="text-xs text-muted-foreground mb-2">Social</p>
                                        <div className="flex flex-wrap gap-2 text-sm">
                                            {seller.socialFacebook && (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-muted">
                                                    <Facebook size={13} /> {seller.socialFacebook}
                                                </span>
                                            )}
                                            {seller.socialLine && (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-muted">
                                                    LINE: {seller.socialLine}
                                                </span>
                                            )}
                                            {seller.socialInstagram && (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-muted">
                                                    <Instagram size={13} /> {seller.socialInstagram}
                                                </span>
                                            )}
                                            {!seller.socialFacebook && !seller.socialLine && !seller.socialInstagram && (
                                                <span className="text-xs text-muted-foreground">—</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <h2 className="font-bold">แก้ไขข้อมูลร้านค้า</h2>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="shopName">ชื่อร้าน</Label>
                                        <Input
                                            id="shopName"
                                            value={form.shopName}
                                            onChange={(e) => setForm((f) => ({ ...f, shopName: e.target.value }))}
                                            disabled={saving}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="shopDescription">รายละเอียดร้าน</Label>
                                        <Textarea
                                            id="shopDescription"
                                            rows={4}
                                            value={form.shopDescription}
                                            onChange={(e) => setForm((f) => ({ ...f, shopDescription: e.target.value }))}
                                            disabled={saving}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="shopAddress">ที่อยู่</Label>
                                        <Input
                                            id="shopAddress"
                                            value={form.shopAddress}
                                            onChange={(e) => setForm((f) => ({ ...f, shopAddress: e.target.value }))}
                                            disabled={saving}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="shopProvince">จังหวัด</Label>
                                            <Input
                                                id="shopProvince"
                                                value={form.shopProvince}
                                                onChange={(e) => setForm((f) => ({ ...f, shopProvince: e.target.value }))}
                                                disabled={saving}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="shopDistrict">อำเภอ / เขต</Label>
                                            <Input
                                                id="shopDistrict"
                                                value={form.shopDistrict}
                                                onChange={(e) => setForm((f) => ({ ...f, shopDistrict: e.target.value }))}
                                                disabled={saving}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="shopPhone">เบอร์ร้าน</Label>
                                            <Input
                                                id="shopPhone"
                                                value={form.shopPhone}
                                                onChange={(e) => setForm((f) => ({ ...f, shopPhone: e.target.value }))}
                                                disabled={saving}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="shopOpenHours">เวลาเปิดทำการ</Label>
                                            <Input
                                                id="shopOpenHours"
                                                value={form.shopOpenHours}
                                                onChange={(e) => setForm((f) => ({ ...f, shopOpenHours: e.target.value }))}
                                                disabled={saving}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="showroomType">ประเภทร้าน</Label>
                                            <select
                                                id="showroomType"
                                                value={form.showroomType}
                                                onChange={(e) =>
                                                    setForm((f) => ({
                                                        ...f,
                                                        showroomType: e.target.value as EditForm["showroomType"],
                                                    }))
                                                }
                                                disabled={saving}
                                                className="h-9 w-full px-3 rounded-md border border-border bg-background text-sm"
                                            >
                                                <option value="INDIVIDUAL">บุคคลธรรมดา</option>
                                                <option value="CORPORATE">นิติบุคคล</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="verificationLevel">ระดับการยืนยัน</Label>
                                            <select
                                                id="verificationLevel"
                                                value={form.verificationLevel}
                                                onChange={(e) =>
                                                    setForm((f) => ({
                                                        ...f,
                                                        verificationLevel: e.target.value as EditForm["verificationLevel"],
                                                    }))
                                                }
                                                disabled={saving}
                                                className="h-9 w-full px-3 rounded-md border border-border bg-background text-sm"
                                            >
                                                <option value="NONE">ยังไม่ยืนยัน</option>
                                                <option value="INDIVIDUAL">บุคคลธรรมดา</option>
                                                <option value="CORPORATE">นิติบุคคล</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="socialFacebook">Facebook</Label>
                                            <Input
                                                id="socialFacebook"
                                                value={form.socialFacebook}
                                                onChange={(e) => setForm((f) => ({ ...f, socialFacebook: e.target.value }))}
                                                disabled={saving}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="socialLine">LINE</Label>
                                            <Input
                                                id="socialLine"
                                                value={form.socialLine}
                                                onChange={(e) => setForm((f) => ({ ...f, socialLine: e.target.value }))}
                                                disabled={saving}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="socialInstagram">Instagram</Label>
                                            <Input
                                                id="socialInstagram"
                                                value={form.socialInstagram}
                                                onChange={(e) => setForm((f) => ({ ...f, socialInstagram: e.target.value }))}
                                                disabled={saving}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: owner + verify + meta */}
                    <div className="space-y-6">
                        {/* Owner user */}
                        <div className="bg-card border border-border rounded-2xl p-5">
                            <h2 className="font-bold flex items-center gap-2 mb-3">
                                <UserIcon size={16} className="text-primary" /> เจ้าของร้าน
                            </h2>
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-muted overflow-hidden flex items-center justify-center text-muted-foreground font-medium">
                                    {seller.user.profileImage ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={seller.user.profileImage} alt={seller.user.fullName} className="h-full w-full object-cover" />
                                    ) : (
                                        seller.user.fullName.charAt(0)
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <Link
                                        href={`/users/${seller.user.id}`}
                                        className="text-sm font-medium hover:text-primary hover:underline inline-flex items-center gap-1"
                                    >
                                        {seller.user.fullName} <ExternalLink size={12} />
                                    </Link>
                                    <p className="text-xs text-muted-foreground truncate inline-flex items-center gap-1">
                                        <Mail size={11} /> {seller.user.email}
                                    </p>
                                </div>
                            </div>
                            <dl className="mt-3 pt-3 border-t border-border space-y-2 text-xs">
                                {seller.user.phoneNumber && (
                                    <div className="flex justify-between">
                                        <dt className="text-muted-foreground">เบอร์โทร</dt>
                                        <dd className="font-medium">{seller.user.phoneNumber}</dd>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <dt className="text-muted-foreground">แพ็กเกจ</dt>
                                    <dd className="font-medium">{seller.user.currentPackage?.name || "ไม่มี"}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-muted-foreground">สถานะบัญชี</dt>
                                    <dd className="font-medium">{seller.user.isActive ? "Active" : "Inactive"}</dd>
                                </div>
                            </dl>
                        </div>

                        {/* Verify actions */}
                        {!editing && (
                            <div className="bg-card border border-border rounded-2xl p-5">
                                <h2 className="font-bold flex items-center gap-2 mb-3">
                                    <ShieldCheck size={16} className="text-primary" /> การยืนยันตัวตน
                                </h2>
                                {seller.isVerified ? (
                                    <div className="space-y-3">
                                        <div className="text-sm">
                                            <p className="text-muted-foreground text-xs">ระดับการยืนยันปัจจุบัน</p>
                                            <p className="font-semibold">{seller.verificationLevel}</p>
                                            {seller.verifiedAt && (
                                                <p className="text-xs text-muted-foreground mt-1">ยืนยันเมื่อ {formatDateTime(seller.verifiedAt)}</p>
                                            )}
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
                                            onClick={handleUnverify}
                                            disabled={verifying}
                                        >
                                            {verifying ? <Loader2 size={14} className="animate-spin" /> : <ShieldAlert size={14} />}
                                            ยกเลิกการยืนยัน
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="verifyLevel" className="text-xs">เลือกระดับการยืนยัน</Label>
                                            <select
                                                id="verifyLevel"
                                                value={verifyLevel}
                                                onChange={(e) => setVerifyLevel(e.target.value as "INDIVIDUAL" | "CORPORATE")}
                                                disabled={verifying}
                                                className="h-9 w-full px-3 rounded-md border border-border bg-background text-sm"
                                            >
                                                <option value="INDIVIDUAL">บุคคลธรรมดา</option>
                                                <option value="CORPORATE">นิติบุคคล</option>
                                            </select>
                                        </div>
                                        <Button
                                            size="sm"
                                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                                            onClick={handleVerify}
                                            disabled={verifying}
                                        >
                                            {verifying ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                                            ยืนยันตัวตนผู้ขาย
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Listings link */}
                        <div className="bg-card border border-border rounded-2xl p-5">
                            <h2 className="font-bold flex items-center gap-2 mb-3">
                                <Car size={16} className="text-primary" /> ประกาศของผู้ขาย
                            </h2>
                            <Link
                                href={`/listings?userId=${seller.userId}`}
                                className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                            >
                                ดูประกาศทั้งหมด <ExternalLink size={12} />
                            </Link>
                        </div>

                        {/* Meta */}
                        <div className="bg-card border border-border rounded-2xl p-5">
                            <h2 className="font-bold flex items-center gap-2 mb-3">
                                <Store size={16} className="text-primary" /> ข้อมูลระบบ
                            </h2>
                            <dl className="space-y-2 text-xs">
                                <div className="flex justify-between">
                                    <dt className="text-muted-foreground">Seller ID</dt>
                                    <dd className="font-mono">{seller.id}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-muted-foreground">สร้างเมื่อ</dt>
                                    <dd>{formatDate(seller.createdAt)}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-muted-foreground">อัปเดตล่าสุด</dt>
                                    <dd>{formatDateTime(seller.updatedAt)}</dd>
                                </div>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
