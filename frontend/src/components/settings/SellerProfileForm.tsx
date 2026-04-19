"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
    Store,
    MapPin,
    Phone,
    Globe,
    Facebook,
    MessageCircle,
    Instagram,
    Tag,
    Camera,
    ImageIcon,
    Loader2,
    Save,
    X,
    Plus,
    Clock,
} from "lucide-react";
import Toast from "@/components/Toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

/* ---------- types ---------- */

interface SellerProfile {
    shopName: string;
    showroomType: string;
    shopEstablishedYear: number | null;
    shopDescription: string;
    shopProvince: string;
    shopDistrict: string;
    shopAddress: string;
    shopMapUrl: string;
    shopPhone: string;
    shopOpenHours: string;
    socialWebsite: string;
    socialFacebook: string;
    socialLine: string;
    socialInstagram: string;
    specializations: string[];
    logoUrl: string;
    coverUrl: string;
}

interface SellerProfileFormProps {
    onSaved?: () => void;
}

const EMPTY_PROFILE: SellerProfile = {
    shopName: "",
    showroomType: "",
    shopEstablishedYear: null,
    shopDescription: "",
    shopProvince: "",
    shopDistrict: "",
    shopAddress: "",
    shopMapUrl: "",
    shopPhone: "",
    shopOpenHours: "",
    socialWebsite: "",
    socialFacebook: "",
    socialLine: "",
    socialInstagram: "",
    specializations: [],
    logoUrl: "",
    coverUrl: "",
};

const SHOWROOM_OPTIONS = [
    { value: "", label: "-- เลือกประเภท --" },
    { value: "INDIVIDUAL", label: "ส่วนตัว" },
    { value: "TENT", label: "เต๊นท์" },
    { value: "DEALER", label: "ตัวแทนจำหน่าย" },
];

const SUGGESTED_TAGS = [
    "รถยุโรป",
    "รถญี่ปุ่น",
    "รถเกาหลี",
    "Big Bike",
    "รถบ้าน",
    "รถเต๊นท์",
    "รถนำเข้า",
    "รถไฟฟ้า EV",
];

const MAX_TAGS = 10;
const MAX_DESCRIPTION = 2000;

/* ---------- helpers ---------- */

function getAuthToken(): string | null {
    const stored =
        localStorage.getItem("user") || sessionStorage.getItem("user");
    if (!stored) return null;
    try {
        return JSON.parse(stored).token || null;
    } catch {
        return null;
    }
}

function authHeaders(): Record<string, string> {
    const token = getAuthToken();
    return token
        ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
        : { "Content-Type": "application/json" };
}

function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

/* ---------- sub-components ---------- */

function SectionHeader({
    icon,
    title,
}: {
    icon: React.ReactNode;
    title: string;
}) {
    return (
        <div className="flex items-center gap-2 mb-4">
            <span className="text-primary">{icon}</span>
            <h3 className="text-lg font-bold text-gray-800">{title}</h3>
        </div>
    );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
    return (
        <label className="text-sm font-bold text-gray-700">{children}</label>
    );
}

const INPUT_CLS =
    "w-full h-12 rounded-xl border border-gray-200 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition";

/* ---------- component ---------- */

export default function SellerProfileForm({ onSaved }: SellerProfileFormProps) {
    const [profile, setProfile] = useState<SellerProfile>(EMPTY_PROFILE);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [uploadingCover, setUploadingCover] = useState(false);

    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);

    const [tagInput, setTagInput] = useState("");
    const [coverDragOver, setCoverDragOver] = useState(false);

    const [toast, setToast] = useState<{
        message: string;
        type: string;
    } | null>(null);

    const logoInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);

    const showToast = (message: string, type: "success" | "error") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    /* --- fetch --- */

    const fetchProfile = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/users/me/seller-profile`, {
                headers: authHeaders(),
            });
            if (res.status === 404) {
                // no profile yet, start fresh
                setProfile(EMPTY_PROFILE);
                return;
            }
            if (!res.ok) throw new Error("fetch failed");
            const data = await res.json();
            // Backend returns { profile }; earlier shape was { sellerProfile } — support both.
            const p = data.profile || data.sellerProfile || data;
            if (!p || typeof p !== 'object') {
                setProfile(EMPTY_PROFILE);
                return;
            }
            // Prisma fields: shopLogo / shopCoverImage — keep legacy logoUrl/coverUrl as fallback
            const logoUrl = p.shopLogo ?? p.logoUrl ?? "";
            const coverUrl = p.shopCoverImage ?? p.coverUrl ?? "";
            setProfile({
                shopName: p.shopName ?? "",
                showroomType: p.showroomType ?? "",
                shopEstablishedYear: p.shopEstablishedYear ?? null,
                shopDescription: p.shopDescription ?? "",
                shopProvince: p.shopProvince ?? "",
                shopDistrict: p.shopDistrict ?? "",
                shopAddress: p.shopAddress ?? "",
                shopMapUrl: p.shopMapUrl ?? "",
                shopPhone: p.shopPhone ?? "",
                shopOpenHours: p.shopOpenHours ?? "",
                socialWebsite: p.socialWebsite ?? "",
                socialFacebook: p.socialFacebook ?? "",
                socialLine: p.socialLine ?? "",
                socialInstagram: p.socialInstagram ?? "",
                specializations: p.specializations ?? [],
                logoUrl,
                coverUrl,
            });
            if (logoUrl) setLogoPreview(logoUrl);
            if (coverUrl) setCoverPreview(coverUrl);
        } catch {
            showToast("ไม่สามารถโหลดข้อมูลร้านได้", "error");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    /* --- field updater --- */

    const set = <K extends keyof SellerProfile>(
        key: K,
        value: SellerProfile[K]
    ) => {
        setProfile((prev) => ({ ...prev, [key]: value }));
    };

    /* --- image upload --- */

    const handleImageUpload = async (
        file: File,
        endpoint: "logo" | "cover"
    ) => {
        if (!file.type.startsWith("image/")) {
            showToast("กรุณาเลือกไฟล์รูปภาพ", "error");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            showToast("ขนาดไฟล์ต้องไม่เกิน 5MB", "error");
            return;
        }

        const setter =
            endpoint === "logo" ? setUploadingLogo : setUploadingCover;
        const previewSetter =
            endpoint === "logo" ? setLogoPreview : setCoverPreview;

        setter(true);
        try {
            const dataUrl = await fileToBase64(file);
            previewSetter(dataUrl);

            // Extract raw base64 (strip data:image/xxx;base64, prefix)
            const base64Buffer = dataUrl.split(",")[1] || dataUrl;

            const res = await fetch(
                `${API_URL}/users/me/seller-profile/${endpoint}`,
                {
                    method: "POST",
                    headers: authHeaders(),
                    body: JSON.stringify({
                        image: {
                            buffer: base64Buffer,
                            filename: file.name,
                            mimetype: file.type,
                        },
                    }),
                }
            );
            if (!res.ok) throw new Error("upload failed");
            const data = await res.json();
            const url = endpoint === "logo" ? data.logoUrl : data.coverUrl;
            if (endpoint === "logo") {
                set("logoUrl", url || dataUrl);
            } else {
                set("coverUrl", url || dataUrl);
            }
            showToast(
                endpoint === "logo"
                    ? "อัปโหลดโลโก้สำเร็จ"
                    : "อัปโหลดภาพหน้าปกสำเร็จ",
                "success"
            );
        } catch {
            showToast("อัปโหลดรูปภาพไม่สำเร็จ", "error");
            previewSetter(
                endpoint === "logo" ? profile.logoUrl || null : profile.coverUrl || null
            );
        } finally {
            setter(false);
        }
    };

    const handleCoverFile = (file: File) => handleImageUpload(file, "cover");
    const handleLogoFile = (file: File) => handleImageUpload(file, "logo");

    /* --- tags --- */

    const addTag = (tag: string) => {
        const trimmed = tag.trim();
        if (
            !trimmed ||
            profile.specializations.length >= MAX_TAGS ||
            profile.specializations.includes(trimmed)
        )
            return;
        set("specializations", [...profile.specializations, trimmed]);
        setTagInput("");
    };

    const removeTag = (tag: string) => {
        set(
            "specializations",
            profile.specializations.filter((t) => t !== tag)
        );
    };

    /* --- save --- */

    const handleSave = async () => {
        if (!profile.shopName.trim()) {
            showToast("กรุณากรอกชื่อร้าน", "error");
            return;
        }

        setSaving(true);
        try {
            const { logoUrl, coverUrl, ...raw } = profile;
            // Clean payload: remove empty strings and nulls for optional fields
            const payload: Record<string, unknown> = { shopName: raw.shopName };
            if (raw.showroomType) payload.showroomType = raw.showroomType;
            if (raw.shopDescription) payload.shopDescription = raw.shopDescription;
            if (raw.shopProvince) payload.shopProvince = raw.shopProvince;
            if (raw.shopDistrict) payload.shopDistrict = raw.shopDistrict;
            if (raw.shopAddress) payload.shopAddress = raw.shopAddress;
            if (raw.shopMapUrl) payload.shopMapUrl = raw.shopMapUrl;
            if (raw.shopPhone) payload.shopPhone = raw.shopPhone;
            if (raw.shopOpenHours) payload.shopOpenHours = raw.shopOpenHours;
            if (raw.shopEstablishedYear) payload.shopEstablishedYear = raw.shopEstablishedYear;
            if (raw.socialWebsite) payload.socialWebsite = raw.socialWebsite;
            if (raw.socialFacebook) payload.socialFacebook = raw.socialFacebook;
            if (raw.socialLine) payload.socialLine = raw.socialLine;
            if (raw.socialInstagram) payload.socialInstagram = raw.socialInstagram;
            if (raw.specializations.length > 0) payload.specializations = raw.specializations;
            const res = await fetch(`${API_URL}/users/me/seller-profile`, {
                method: "PUT",
                headers: authHeaders(),
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(
                    (data as Record<string, string>).error || "save failed"
                );
            }
            showToast("บันทึกโปรไฟล์ร้านสำเร็จ", "success");
            onSaved?.();
        } catch (err) {
            showToast(
                err instanceof Error
                    ? err.message
                    : "ไม่สามารถบันทึกข้อมูลได้",
                "error"
            );
        } finally {
            setSaving(false);
        }
    };

    /* --- render --- */

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Loader2
                    size={32}
                    className="animate-spin text-primary"
                />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* ===== Cover + Logo ===== */}
            <div className="relative">
                {/* Cover */}
                <div
                    className={`relative w-full rounded-2xl overflow-hidden bg-gray-100 cursor-pointer group transition ${
                        coverDragOver
                            ? "ring-4 ring-primary/40"
                            : "hover:ring-2 hover:ring-primary/20"
                    }`}
                    style={{ aspectRatio: "3 / 1" }}
                    onClick={() => coverInputRef.current?.click()}
                    onDragOver={(e) => {
                        e.preventDefault();
                        setCoverDragOver(true);
                    }}
                    onDragLeave={() => setCoverDragOver(false)}
                    onDrop={(e) => {
                        e.preventDefault();
                        setCoverDragOver(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) handleCoverFile(file);
                    }}
                >
                    {coverPreview ? (
                        <img
                            src={coverPreview}
                            alt="Cover"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <ImageIcon size={48} />
                            <span className="text-sm mt-2">
                                คลิกหรือลากรูปภาพเพื่ออัปโหลดภาพหน้าปก
                            </span>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition">
                            {uploadingCover ? (
                                <Loader2
                                    size={32}
                                    className="animate-spin text-white"
                                />
                            ) : (
                                <Camera
                                    size={32}
                                    className="text-white drop-shadow"
                                />
                            )}
                        </div>
                    </div>
                    <input
                        ref={coverInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleCoverFile(file);
                            e.target.value = "";
                        }}
                    />
                </div>

                {/* Logo */}
                <div
                    className="absolute -bottom-10 left-6 w-[128px] h-[128px] rounded-full border-4 border-white bg-gray-100 shadow-lg cursor-pointer group overflow-hidden"
                    onClick={(e) => {
                        e.stopPropagation();
                        logoInputRef.current?.click();
                    }}
                >
                    {logoPreview ? (
                        <img
                            src={logoPreview}
                            alt="Logo"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <Store size={36} />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 rounded-full transition flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition">
                            {uploadingLogo ? (
                                <Loader2
                                    size={24}
                                    className="animate-spin text-white"
                                />
                            ) : (
                                <Camera
                                    size={24}
                                    className="text-white drop-shadow"
                                />
                            )}
                        </div>
                    </div>
                    <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleLogoFile(file);
                            e.target.value = "";
                        }}
                    />
                </div>
            </div>

            {/* spacer for the overlapping logo */}
            <div className="h-8" />

            {/* ===== Basic Info ===== */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm">
                <SectionHeader
                    icon={<Store size={22} />}
                    title="ข้อมูลร้าน"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <FieldLabel>
                            ชื่อร้าน/ธุรกิจ <span className="text-red-500">*</span>
                        </FieldLabel>
                        <input
                            type="text"
                            value={profile.shopName}
                            onChange={(e) => set("shopName", e.target.value)}
                            className={INPUT_CLS}
                            placeholder="ชื่อร้านค้าหรือธุรกิจของคุณ"
                        />
                    </div>

                    <div className="space-y-2">
                        <FieldLabel>ประเภทร้าน</FieldLabel>
                        <select
                            value={profile.showroomType}
                            onChange={(e) =>
                                set("showroomType", e.target.value)
                            }
                            className="form-select"
                        >
                            {SHOWROOM_OPTIONS.map((o) => (
                                <option key={o.value} value={o.value}>
                                    {o.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <FieldLabel>ปีที่เปิดกิจการ (พ.ศ.)</FieldLabel>
                        <input
                            type="number"
                            value={profile.shopEstablishedYear ?? ""}
                            onChange={(e) =>
                                set(
                                    "shopEstablishedYear",
                                    e.target.value
                                        ? Number(e.target.value)
                                        : null
                                )
                            }
                            className={INPUT_CLS}
                            placeholder="เช่น 2560"
                            min={2400}
                            max={2600}
                        />
                    </div>

                    <div className="md:col-span-2 space-y-2">
                        <FieldLabel>
                            รายละเอียดร้าน
                            <span className="text-gray-400 font-normal ml-2 text-xs">
                                {profile.shopDescription.length}/{MAX_DESCRIPTION}
                            </span>
                        </FieldLabel>
                        <textarea
                            value={profile.shopDescription}
                            onChange={(e) => {
                                if (e.target.value.length <= MAX_DESCRIPTION) {
                                    set("shopDescription", e.target.value);
                                }
                            }}
                            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition resize-none"
                            rows={4}
                            placeholder="บอกเล่าเรื่องราวของร้านคุณ..."
                        />
                    </div>
                </div>
            </div>

            {/* ===== Location ===== */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm">
                <SectionHeader
                    icon={<MapPin size={22} />}
                    title="ที่ตั้งร้าน"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <FieldLabel>จังหวัด</FieldLabel>
                        <input
                            type="text"
                            value={profile.shopProvince}
                            onChange={(e) =>
                                set("shopProvince", e.target.value)
                            }
                            className={INPUT_CLS}
                            placeholder="เช่น กรุงเทพมหานคร"
                        />
                    </div>

                    <div className="space-y-2">
                        <FieldLabel>อำเภอ/เขต</FieldLabel>
                        <input
                            type="text"
                            value={profile.shopDistrict}
                            onChange={(e) =>
                                set("shopDistrict", e.target.value)
                            }
                            className={INPUT_CLS}
                            placeholder="เช่น จตุจักร"
                        />
                    </div>

                    <div className="md:col-span-2 space-y-2">
                        <FieldLabel>ที่อยู่</FieldLabel>
                        <textarea
                            value={profile.shopAddress}
                            onChange={(e) =>
                                set("shopAddress", e.target.value)
                            }
                            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition resize-none"
                            rows={3}
                            placeholder="ที่อยู่ร้านค้าของคุณ"
                        />
                    </div>

                    <div className="md:col-span-2 space-y-2">
                        <FieldLabel>ลิงก์ Google Maps</FieldLabel>
                        <div className="relative">
                            <MapPin
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                size={18}
                            />
                            <input
                                type="url"
                                value={profile.shopMapUrl}
                                onChange={(e) =>
                                    set("shopMapUrl", e.target.value)
                                }
                                className={`${INPUT_CLS} pl-10`}
                                placeholder="https://maps.google.com/..."
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* ===== Contact ===== */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm">
                <SectionHeader
                    icon={<Phone size={22} />}
                    title="ช่องทางติดต่อ"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <FieldLabel>เบอร์โทรร้าน</FieldLabel>
                        <div className="relative">
                            <Phone
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                size={18}
                            />
                            <input
                                type="tel"
                                value={profile.shopPhone}
                                onChange={(e) => {
                                    const v = e.target.value
                                        .replace(/\D/g, "")
                                        .slice(0, 10);
                                    set("shopPhone", v);
                                }}
                                className={`${INPUT_CLS} pl-10`}
                                placeholder="0812345678"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <FieldLabel>เวลาเปิด-ปิด</FieldLabel>
                        <div className="relative">
                            <Clock
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                size={18}
                            />
                            <input
                                type="text"
                                value={profile.shopOpenHours}
                                onChange={(e) =>
                                    set("shopOpenHours", e.target.value)
                                }
                                className={`${INPUT_CLS} pl-10`}
                                placeholder="จ-ส 09:00-18:00"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* ===== Social Links ===== */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm">
                <SectionHeader
                    icon={<Globe size={22} />}
                    title="ช่องทางออนไลน์"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <FieldLabel>เว็บไซต์</FieldLabel>
                        <div className="relative">
                            <Globe
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                size={18}
                            />
                            <input
                                type="url"
                                value={profile.socialWebsite}
                                onChange={(e) =>
                                    set("socialWebsite", e.target.value)
                                }
                                className={`${INPUT_CLS} pl-10`}
                                placeholder="https://www.example.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <FieldLabel>Facebook</FieldLabel>
                        <div className="relative">
                            <Facebook
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                size={18}
                            />
                            <input
                                type="text"
                                value={profile.socialFacebook}
                                onChange={(e) =>
                                    set("socialFacebook", e.target.value)
                                }
                                className={`${INPUT_CLS} pl-10`}
                                placeholder="Facebook page URL หรือชื่อเพจ"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <FieldLabel>LINE</FieldLabel>
                        <div className="relative">
                            <MessageCircle
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                size={18}
                            />
                            <input
                                type="text"
                                value={profile.socialLine}
                                onChange={(e) =>
                                    set("socialLine", e.target.value)
                                }
                                className={`${INPUT_CLS} pl-10`}
                                placeholder="LINE ID หรือลิงก์ LINE OA"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <FieldLabel>Instagram</FieldLabel>
                        <div className="relative">
                            <Instagram
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                size={18}
                            />
                            <input
                                type="text"
                                value={profile.socialInstagram}
                                onChange={(e) =>
                                    set("socialInstagram", e.target.value)
                                }
                                className={`${INPUT_CLS} pl-10`}
                                placeholder="@username"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* ===== Specializations ===== */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm">
                <SectionHeader
                    icon={<Tag size={22} />}
                    title="ความเชี่ยวชาญ"
                />

                {/* Tag input */}
                <div className="flex gap-2 mb-4">
                    <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                addTag(tagInput);
                            }
                        }}
                        className={`${INPUT_CLS} flex-1`}
                        placeholder="พิมพ์แล้วกด Enter หรือกดปุ่มเพิ่ม"
                        disabled={profile.specializations.length >= MAX_TAGS}
                    />
                    <button
                        type="button"
                        onClick={() => addTag(tagInput)}
                        disabled={
                            !tagInput.trim() ||
                            profile.specializations.length >= MAX_TAGS
                        }
                        className="h-12 px-5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-opacity-90 transition flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                    >
                        <Plus size={16} />
                        เพิ่ม
                    </button>
                </div>

                {/* Current tags */}
                {profile.specializations.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {profile.specializations.map((tag) => (
                            <span
                                key={tag}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium"
                            >
                                {tag}
                                <button
                                    type="button"
                                    onClick={() => removeTag(tag)}
                                    className="hover:bg-primary/20 rounded-full p-0.5 transition"
                                >
                                    <X size={14} />
                                </button>
                            </span>
                        ))}
                    </div>
                )}

                {/* Tag count */}
                <p className="text-xs text-gray-400 mb-3">
                    {profile.specializations.length}/{MAX_TAGS} แท็ก
                </p>

                {/* Suggestions */}
                <div>
                    <p className="text-xs text-gray-500 mb-2">แนะนำ:</p>
                    <div className="flex flex-wrap gap-2">
                        {SUGGESTED_TAGS.filter(
                            (t) => !profile.specializations.includes(t)
                        ).map((tag) => (
                            <button
                                key={tag}
                                type="button"
                                onClick={() => addTag(tag)}
                                disabled={
                                    profile.specializations.length >= MAX_TAGS
                                }
                                className="px-3 py-1.5 rounded-full border border-gray-200 text-sm text-gray-600 hover:border-primary hover:text-primary transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                + {tag}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ===== Save Button ===== */}
            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-primary text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-900/10 hover:bg-opacity-90 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {saving ? (
                        <Loader2 size={20} className="animate-spin" />
                    ) : (
                        <Save />
                    )}
                    บันทึกโปรไฟล์ร้าน
                </button>
            </div>

            {toast && <Toast message={toast.message} type={toast.type} />}
        </div>
    );
}
