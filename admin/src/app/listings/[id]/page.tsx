"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState, useCallback } from "react";
import {
    ArrowLeft,
    Car,
    Loader2,
    Pencil,
    Save,
    X as XIcon,
    Trash2,
    Star,
    Crown,
    User as UserIcon,
    Store,
    MapPin,
    Eye,
    Heart,
    Calendar,
    RefreshCw,
    TrendingUp,
    ChevronLeft,
    ChevronRight,
    ImageOff,
    ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";

interface ListingImage {
    id: string;
    url: string;
    order: number;
}

interface ListingUser {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string | null;
    profileImage: string | null;
    isActive: boolean;
    createdAt: string;
    currentPackage: { id: string; name: string; nameTh?: string | null; slug: string } | null;
    sellerProfile: {
        id: string;
        shopName: string;
        showroomType: "INDIVIDUAL" | "TENT" | "DEALER";
        isVerified: boolean;
        verificationLevel: string;
        totalSoldCount: number;
        shopProvince: string | null;
        shopDistrict: string | null;
        shopLogo: string | null;
    } | null;
}

interface BumpLog {
    id: string;
    createdAt: string;
    triggeredBy?: string;
    note?: string | null;
}

interface Renewal {
    id: string;
    amount: string | number;
    status: string;
    adminNote: string | null;
    reviewedAt: string | null;
    createdAt: string;
}

interface ListingDetail {
    id: string;
    title: string;
    description: string | null;
    vehicleType: string;
    brand: string;
    model: string;
    subModel: string | null;
    year: number;
    price: number;
    color: string | null;
    fuelType: string | null;
    transmission: string | null;
    engineSize: number | null;
    seats: number | null;
    mileage: number;
    bodyType: string | null;
    province: string | null;
    district: string | null;
    contactName: string | null;
    contactPhone: string | null;
    lineId: string | null;
    condition: string | null;
    hasAccident: boolean;
    hasModified: boolean;
    registrationBookStatus: string;
    gasType: string | null;
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
    user: ListingUser;
    images: ListingImage[];
    bumpLogs: BumpLog[];
    renewals: Renewal[];
}

const STATUS_META: Record<string, { label: string; className: string }> = {
    PENDING: { label: "รอตรวจสอบ", className: "bg-amber-50 text-amber-700" },
    ACTIVE: { label: "อนุมัติแล้ว", className: "bg-emerald-50 text-emerald-700" },
    SUSPENDED: { label: "ถูกปฏิเสธ", className: "bg-rose-50 text-rose-700" },
    DRAFT: { label: "แบบร่าง", className: "bg-muted text-muted-foreground" },
    SOLD: { label: "ขายแล้ว", className: "bg-blue-50 text-blue-700" },
    EXPIRED: { label: "หมดอายุ", className: "bg-muted text-muted-foreground" },
};

const SHOWROOM_LABEL: Record<string, string> = {
    INDIVIDUAL: "ผู้ขายส่วนตัว",
    TENT: "เต๊นท์",
    DEALER: "ตัวแทนจำหน่าย",
};

const RENEWAL_STATUS: Record<string, { label: string; className: string }> = {
    PENDING: { label: "รอตรวจสอบ", className: "bg-amber-50 text-amber-700" },
    APPROVED: { label: "อนุมัติ", className: "bg-emerald-50 text-emerald-700" },
    REJECTED: { label: "ปฏิเสธ", className: "bg-rose-50 text-rose-700" },
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

type EditForm = {
    title: string;
    description: string;
    price: string;
    mileage: string;
    province: string;
    district: string;
    color: string;
    condition: string;
    adminNote: string;
    isFeatured: boolean;
    isPremium: boolean;
};

export default function AdminListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();

    const [listing, setListing] = useState<ListingDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState<EditForm>({
        title: "",
        description: "",
        price: "",
        mileage: "",
        province: "",
        district: "",
        color: "",
        condition: "",
        adminNote: "",
        isFeatured: false,
        isPremium: false,
    });

    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [carouselIdx, setCarouselIdx] = useState(0);

    const fetchListing = useCallback(async () => {
        setLoading(true);
        try {
            const data = await apiFetch(`/admin/listings/${id}`);
            setListing(data.listing);
        } catch (err: any) {
            if (err.message?.includes("ไม่พบ")) setNotFound(true);
            else toast.error(err.message || "โหลดข้อมูลไม่สำเร็จ");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchListing();
    }, [fetchListing]);

    const startEdit = () => {
        if (!listing) return;
        setForm({
            title: listing.title,
            description: listing.description ?? "",
            price: String(listing.price ?? ""),
            mileage: String(listing.mileage ?? ""),
            province: listing.province ?? "",
            district: listing.district ?? "",
            color: listing.color ?? "",
            condition: listing.condition ?? "",
            adminNote: listing.adminNote ?? "",
            isFeatured: listing.isFeatured,
            isPremium: listing.isPremium,
        });
        setEditing(true);
    };

    const cancelEdit = () => {
        setEditing(false);
    };

    const handleSave = async () => {
        if (!listing) return;
        if (!form.title.trim()) {
            toast.error("กรุณากรอกชื่อประกาศ");
            return;
        }
        const priceNum = Number(form.price);
        const mileageNum = Number(form.mileage);
        if (!isFinite(priceNum) || priceNum < 0) {
            toast.error("ราคาไม่ถูกต้อง");
            return;
        }
        if (!isFinite(mileageNum) || mileageNum < 0) {
            toast.error("เลขไมล์ไม่ถูกต้อง");
            return;
        }

        setSaving(true);
        try {
            const body = {
                title: form.title,
                description: form.description,
                price: priceNum,
                mileage: mileageNum,
                province: form.province,
                district: form.district,
                color: form.color,
                condition: form.condition,
                adminNote: form.adminNote,
                isFeatured: form.isFeatured,
                isPremium: form.isPremium,
            };
            const res = await apiFetch(`/admin/listings/${listing.id}`, {
                method: "PUT",
                body: JSON.stringify(body),
            });
            toast.success(res.message || "บันทึกสำเร็จ");
            setEditing(false);
            await fetchListing();
        } catch (err: any) {
            toast.error(err.message || "เกิดข้อผิดพลาด");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!listing) return;
        setDeleting(true);
        try {
            const res = await apiFetch(`/admin/listings/${listing.id}`, { method: "DELETE" });
            toast.success(res.message || "ลบประกาศเรียบร้อย");
            setDeleteOpen(false);
            router.push("/listings");
        } catch (err: any) {
            toast.error(err.message || "เกิดข้อผิดพลาด");
            setDeleting(false);
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

    if (notFound || !listing) {
        return (
            <DashboardLayout>
                <div className="max-w-md mx-auto text-center py-24">
                    <h2 className="text-xl font-bold mb-2">ไม่พบประกาศ</h2>
                    <p className="text-muted-foreground mb-6">ประกาศอาจถูกลบหรือ ID ไม่ถูกต้อง</p>
                    <Link href="/listings">
                        <Button variant="outline"><ArrowLeft size={16} /> กลับไปหน้ารายการประกาศ</Button>
                    </Link>
                </div>
            </DashboardLayout>
        );
    }

    const statusMeta = STATUS_META[listing.status] ?? STATUS_META.DRAFT;

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <Link href="/listings" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition">
                        <ArrowLeft size={16} /> กลับไปหน้ารายการประกาศ
                    </Link>
                    <div className="flex items-center gap-2 flex-wrap">
                        {!editing ? (
                            <>
                                <a
                                    href={`${process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000"}/buy/${listing.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Button variant="outline" size="sm">
                                        <ExternalLink size={14} /> เปิดประกาศ
                                    </Button>
                                </a>
                                <Button variant="outline" size="sm" onClick={startEdit}>
                                    <Pencil size={14} /> แก้ไข
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setDeleteOpen(true)}
                                    className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
                                >
                                    <Trash2 size={14} /> ลบประกาศ
                                </Button>
                            </>
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

                {/* Two-column layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: main details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Images Carousel */}
                        <div className="bg-card border border-border rounded-2xl overflow-hidden">
                            {listing.images.length > 0 ? (
                                <div className="space-y-2">
                                    <div className="relative aspect-[4/3] bg-muted">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={listing.images[carouselIdx]?.url}
                                            alt={listing.title}
                                            className="w-full h-full object-cover"
                                        />
                                        {listing.images.length > 1 && (
                                            <>
                                                <button
                                                    onClick={() => setCarouselIdx((i) => (i > 0 ? i - 1 : listing.images.length - 1))}
                                                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 transition"
                                                >
                                                    <ChevronLeft size={18} />
                                                </button>
                                                <button
                                                    onClick={() => setCarouselIdx((i) => (i < listing.images.length - 1 ? i + 1 : 0))}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 transition"
                                                >
                                                    <ChevronRight size={18} />
                                                </button>
                                                <span className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-md">
                                                    {carouselIdx + 1}/{listing.images.length}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                    {listing.images.length > 1 && (
                                        <div className="flex gap-1.5 overflow-x-auto p-3">
                                            {listing.images.map((img, i) => (
                                                <button
                                                    key={img.id || i}
                                                    onClick={() => setCarouselIdx(i)}
                                                    className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition ${carouselIdx === i ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"}`}
                                                >
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="aspect-[4/3] bg-muted flex items-center justify-center">
                                    <ImageOff className="text-muted-foreground" size={32} />
                                </div>
                            )}
                        </div>

                        {/* Main info & Edit form */}
                        <div className="bg-card border border-border rounded-2xl p-6">
                            {!editing ? (
                                <div className="space-y-4">
                                    <div className="flex items-start justify-between gap-4 flex-wrap">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h1 className="text-xl font-bold">{listing.title}</h1>
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${statusMeta.className}`}>
                                                    {statusMeta.label}
                                                </span>
                                                {listing.isFeatured && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-amber-50 text-amber-700">
                                                        <Star size={11} /> แนะนำ
                                                    </span>
                                                )}
                                                {listing.isPremium && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-purple-50 text-purple-700">
                                                        <Crown size={11} /> พรีเมียม
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {listing.brand} {listing.model}{listing.subModel ? ` ${listing.subModel}` : ""} · ปี {listing.year}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-primary">฿{Number(listing.price).toLocaleString("th-TH")}</p>
                                        </div>
                                    </div>

                                    <dl className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-3 border-t border-border text-sm">
                                        <div>
                                            <dt className="text-muted-foreground text-xs">เลขไมล์</dt>
                                            <dd className="font-medium">{listing.mileage.toLocaleString("th-TH")} กม.</dd>
                                        </div>
                                        <div>
                                            <dt className="text-muted-foreground text-xs">สี</dt>
                                            <dd className="font-medium">{listing.color || "—"}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-muted-foreground text-xs">สภาพ</dt>
                                            <dd className="font-medium">{listing.condition || "—"}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-muted-foreground text-xs">เกียร์</dt>
                                            <dd className="font-medium">{listing.transmission || "—"}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-muted-foreground text-xs">เชื้อเพลิง</dt>
                                            <dd className="font-medium">{listing.fuelType || "—"}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-muted-foreground text-xs">ที่ตั้ง</dt>
                                            <dd className="font-medium inline-flex items-center gap-1">
                                                <MapPin size={12} />
                                                {[listing.district, listing.province].filter(Boolean).join(", ") || "—"}
                                            </dd>
                                        </div>
                                    </dl>

                                    {listing.description && (
                                        <div className="pt-3 border-t border-border">
                                            <p className="text-xs text-muted-foreground mb-1">รายละเอียด</p>
                                            <p className="text-sm whitespace-pre-line bg-muted p-3 rounded-lg max-h-56 overflow-y-auto">
                                                {listing.description}
                                            </p>
                                        </div>
                                    )}

                                    {listing.adminNote && (
                                        <div className="text-xs text-rose-500 bg-rose-50 px-3 py-2 rounded-lg">
                                            <span className="font-medium">หมายเหตุ:</span> {listing.adminNote}
                                        </div>
                                    )}

                                    <div className="flex flex-wrap gap-4 pt-3 border-t border-border text-xs text-muted-foreground">
                                        <span className="inline-flex items-center gap-1"><Eye size={13} /> {listing.viewCount.toLocaleString("th-TH")} วิว</span>
                                        <span className="inline-flex items-center gap-1"><Heart size={13} /> {listing.favoriteCount.toLocaleString("th-TH")} ถูกใจ</span>
                                        <span className="inline-flex items-center gap-1"><Calendar size={13} /> ลงเมื่อ {formatDate(listing.createdAt)}</span>
                                        {listing.expiredAt && (
                                            <span className="inline-flex items-center gap-1"><Calendar size={13} /> หมดอายุ {formatDate(listing.expiredAt)}</span>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <h2 className="text-base font-semibold">แก้ไขข้อมูลประกาศ</h2>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="title">ชื่อประกาศ</Label>
                                        <Input
                                            id="title"
                                            value={form.title}
                                            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                                            disabled={saving}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="price">ราคา (บาท)</Label>
                                            <Input
                                                id="price"
                                                type="number"
                                                min={0}
                                                value={form.price}
                                                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                                                disabled={saving}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="mileage">เลขไมล์ (กม.)</Label>
                                            <Input
                                                id="mileage"
                                                type="number"
                                                min={0}
                                                value={form.mileage}
                                                onChange={(e) => setForm((f) => ({ ...f, mileage: e.target.value }))}
                                                disabled={saving}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="province">จังหวัด</Label>
                                            <Input
                                                id="province"
                                                value={form.province}
                                                onChange={(e) => setForm((f) => ({ ...f, province: e.target.value }))}
                                                disabled={saving}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="district">อำเภอ/เขต</Label>
                                            <Input
                                                id="district"
                                                value={form.district}
                                                onChange={(e) => setForm((f) => ({ ...f, district: e.target.value }))}
                                                disabled={saving}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="color">สี</Label>
                                            <Input
                                                id="color"
                                                value={form.color}
                                                onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                                                disabled={saving}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="condition">สภาพ</Label>
                                            <Input
                                                id="condition"
                                                value={form.condition}
                                                onChange={(e) => setForm((f) => ({ ...f, condition: e.target.value }))}
                                                disabled={saving}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="description">รายละเอียด</Label>
                                        <Textarea
                                            id="description"
                                            rows={5}
                                            value={form.description}
                                            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                                            disabled={saving}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="adminNote">หมายเหตุจากแอดมิน</Label>
                                        <Textarea
                                            id="adminNote"
                                            rows={2}
                                            value={form.adminNote}
                                            onChange={(e) => setForm((f) => ({ ...f, adminNote: e.target.value }))}
                                            disabled={saving}
                                        />
                                    </div>

                                    <div className="flex items-center gap-6 pt-2">
                                        <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={form.isFeatured}
                                                onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))}
                                                disabled={saving}
                                                className="h-4 w-4 rounded border-border"
                                            />
                                            <Star size={14} className="text-amber-500" /> ตั้งเป็นประกาศแนะนำ
                                        </label>
                                        <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={form.isPremium}
                                                onChange={(e) => setForm((f) => ({ ...f, isPremium: e.target.checked }))}
                                                disabled={saving}
                                                className="h-4 w-4 rounded border-border"
                                            />
                                            <Crown size={14} className="text-purple-500" /> ตั้งเป็นประกาศพรีเมียม
                                        </label>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Bump history */}
                        <div className="bg-card border border-border rounded-2xl overflow-hidden">
                            <div className="px-5 py-4 border-b border-border">
                                <h2 className="font-bold flex items-center gap-2">
                                    <TrendingUp size={16} className="text-primary" /> ประวัติการ Bump ({listing.bumpLogs.length})
                                </h2>
                            </div>
                            {listing.bumpLogs.length === 0 ? (
                                <div className="py-8 text-center text-sm text-muted-foreground">ยังไม่มีประวัติการ bump</div>
                            ) : (
                                <ul className="divide-y divide-border">
                                    {listing.bumpLogs.map((b) => (
                                        <li key={b.id} className="flex items-center justify-between px-5 py-3 text-sm">
                                            <span className="text-muted-foreground">
                                                {formatDateTime(b.createdAt)}
                                                {b.triggeredBy ? ` · ${b.triggeredBy}` : ""}
                                            </span>
                                            {b.note && <span className="text-xs text-muted-foreground">{b.note}</span>}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Renewal history */}
                        <div className="bg-card border border-border rounded-2xl overflow-hidden">
                            <div className="px-5 py-4 border-b border-border">
                                <h2 className="font-bold flex items-center gap-2">
                                    <RefreshCw size={16} className="text-primary" /> ประวัติการต่ออายุ ({listing.renewals.length})
                                </h2>
                            </div>
                            {listing.renewals.length === 0 ? (
                                <div className="py-8 text-center text-sm text-muted-foreground">ยังไม่มีคำขอต่ออายุ</div>
                            ) : (
                                <ul className="divide-y divide-border">
                                    {listing.renewals.map((r) => {
                                        const meta = RENEWAL_STATUS[r.status] ?? RENEWAL_STATUS.PENDING;
                                        return (
                                            <li key={r.id} className="flex items-center justify-between px-5 py-3 text-sm gap-3 flex-wrap">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <span className="text-muted-foreground text-xs whitespace-nowrap">
                                                        {formatDateTime(r.createdAt)}
                                                    </span>
                                                    <span className="font-medium">฿{Number(r.amount).toLocaleString("th-TH")}</span>
                                                </div>
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${meta.className}`}>
                                                    {meta.label}
                                                </span>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>
                    </div>

                    {/* Right: user + seller sidebar */}
                    <div className="space-y-6">
                        {/* Owner user */}
                        <div className="bg-card border border-border rounded-2xl p-5">
                            <h2 className="font-bold flex items-center gap-2 mb-3">
                                <UserIcon size={16} className="text-primary" /> เจ้าของประกาศ
                            </h2>
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-muted overflow-hidden flex items-center justify-center text-muted-foreground font-medium">
                                    {listing.user.profileImage ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={listing.user.profileImage} alt={listing.user.fullName} className="h-full w-full object-cover" />
                                    ) : (
                                        listing.user.fullName.charAt(0)
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <Link href={`/users/${listing.user.id}`} className="font-medium text-sm hover:text-primary hover:underline inline-flex items-center gap-1">
                                        {listing.user.fullName} <ExternalLink size={12} />
                                    </Link>
                                    <p className="text-xs text-muted-foreground truncate">{listing.user.email}</p>
                                </div>
                            </div>
                            <dl className="mt-3 pt-3 border-t border-border space-y-2 text-xs">
                                {listing.user.phoneNumber && (
                                    <div className="flex justify-between">
                                        <dt className="text-muted-foreground">เบอร์โทร</dt>
                                        <dd className="font-medium">{listing.user.phoneNumber}</dd>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <dt className="text-muted-foreground">แพ็กเกจ</dt>
                                    <dd className="font-medium">{listing.user.currentPackage?.name || "ไม่มี"}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-muted-foreground">สถานะบัญชี</dt>
                                    <dd className="font-medium">{listing.user.isActive ? "Active" : "Inactive"}</dd>
                                </div>
                            </dl>
                        </div>

                        {/* Seller profile */}
                        {listing.user.sellerProfile && (
                            <div className="bg-card border border-border rounded-2xl p-5">
                                <h2 className="font-bold flex items-center gap-2 mb-3">
                                    <Store size={16} className="text-primary" /> โปรไฟล์ผู้ขาย
                                </h2>
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-muted overflow-hidden flex items-center justify-center text-muted-foreground">
                                        {listing.user.sellerProfile.shopLogo ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={listing.user.sellerProfile.shopLogo} alt={listing.user.sellerProfile.shopName} className="h-full w-full object-cover" />
                                        ) : (
                                            <Store size={18} />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <Link
                                            href={`/sellers/${listing.user.sellerProfile.id}`}
                                            className="font-medium text-sm truncate hover:text-primary hover:underline inline-flex items-center gap-1"
                                        >
                                            {listing.user.sellerProfile.shopName} <ExternalLink size={12} />
                                        </Link>
                                        <p className="text-xs text-muted-foreground">
                                            {SHOWROOM_LABEL[listing.user.sellerProfile.showroomType]}
                                        </p>
                                    </div>
                                </div>
                                <dl className="mt-3 pt-3 border-t border-border space-y-2 text-xs">
                                    <div className="flex justify-between">
                                        <dt className="text-muted-foreground">ระดับการยืนยัน</dt>
                                        <dd className="font-medium">{listing.user.sellerProfile.verificationLevel}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-muted-foreground">ยืนยันตัวตน</dt>
                                        <dd className="font-medium">{listing.user.sellerProfile.isVerified ? "ยืนยันแล้ว" : "ยังไม่ยืนยัน"}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-muted-foreground">ยอดขายรวม</dt>
                                        <dd className="font-medium">{listing.user.sellerProfile.totalSoldCount.toLocaleString("th-TH")}</dd>
                                    </div>
                                </dl>
                            </div>
                        )}

                        {/* Meta */}
                        <div className="bg-card border border-border rounded-2xl p-5">
                            <h2 className="font-bold flex items-center gap-2 mb-3">
                                <Car size={16} className="text-primary" /> ข้อมูลระบบ
                            </h2>
                            <dl className="space-y-2 text-xs">
                                <div className="flex justify-between">
                                    <dt className="text-muted-foreground">Listing ID</dt>
                                    <dd className="font-mono">{listing.id}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-muted-foreground">สร้างเมื่อ</dt>
                                    <dd>{formatDateTime(listing.createdAt)}</dd>
                                </div>
                                {listing.publishedAt && (
                                    <div className="flex justify-between">
                                        <dt className="text-muted-foreground">เผยแพร่เมื่อ</dt>
                                        <dd>{formatDateTime(listing.publishedAt)}</dd>
                                    </div>
                                )}
                            </dl>
                        </div>
                    </div>
                </div>
            </div>

            <DeleteConfirmModal
                isOpen={deleteOpen}
                onClose={() => setDeleteOpen(false)}
                onConfirm={handleDelete}
                title="ลบประกาศ"
                description={`คุณแน่ใจหรือไม่ที่จะลบประกาศ "${listing.title}"? ข้อมูลและรูปภาพจะถูกลบออกอย่างถาวร`}
                isLoading={deleting}
            />
        </DashboardLayout>
    );
}
