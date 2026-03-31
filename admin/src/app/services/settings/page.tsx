"use client";

import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
    Settings,
    Plus,
    Pencil,
    Trash2,
    Star,
    Check,
    X,
    Loader2,
    Building2,
    ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

// ─── Interfaces ───
interface InspectionPackage {
    id: string;
    name: string;
    price: number;
    features: string[];
    isRecommended: boolean;
    isActive: boolean;
}

interface ServicePartner {
    id: string;
    name: string;
    type: string;
    highlight: string;
    logoUrl?: string;
    isActive: boolean;
}

// ─── Package Form State ───
interface PackageForm {
    name: string;
    price: string;
    features: string;
    isRecommended: boolean;
    isActive: boolean;
}

const emptyPackageForm: PackageForm = {
    name: "",
    price: "",
    features: "",
    isRecommended: false,
    isActive: true,
};

// ─── Partner Form State ───
interface PartnerForm {
    name: string;
    type: string;
    highlight: string;
    logoUrl: string;
    isActive: boolean;
}

const emptyPartnerForm: PartnerForm = {
    name: "",
    type: "BANK",
    highlight: "",
    logoUrl: "",
    isActive: true,
};

const PARTNER_TYPE_COLORS: Record<string, string> = {
    BANK: "bg-blue-100 text-blue-800 border-blue-200",
    INSURANCE: "bg-green-100 text-green-800 border-green-200",
};

const PARTNER_TYPE_LABELS: Record<string, string> = {
    BANK: "ธนาคาร",
    INSURANCE: "ประกัน",
};

export default function AdminServiceSettingsPage() {
    // ─── Packages State ───
    const [packages, setPackages] = useState<InspectionPackage[]>([]);
    const [packagesLoading, setPackagesLoading] = useState(true);
    const [packageDialogOpen, setPackageDialogOpen] = useState(false);
    const [editingPackage, setEditingPackage] = useState<InspectionPackage | null>(null);
    const [packageForm, setPackageForm] = useState<PackageForm>(emptyPackageForm);
    const [savingPackage, setSavingPackage] = useState(false);
    const [deletingPackageId, setDeletingPackageId] = useState<string | null>(null);

    // ─── Partners State ───
    const [partners, setPartners] = useState<ServicePartner[]>([]);
    const [partnersLoading, setPartnersLoading] = useState(true);
    const [partnerDialogOpen, setPartnerDialogOpen] = useState(false);
    const [editingPartner, setEditingPartner] = useState<ServicePartner | null>(null);
    const [partnerForm, setPartnerForm] = useState<PartnerForm>(emptyPartnerForm);
    const [savingPartner, setSavingPartner] = useState(false);
    const [deletingPartnerId, setDeletingPartnerId] = useState<string | null>(null);

    // ─── Fetch Packages ───
    const fetchPackages = useCallback(async () => {
        try {
            setPackagesLoading(true);
            const res = await apiFetch("/admin/services/packages");
            if (res.ok) {
                const data = await res.json();
                setPackages(data.data || data.packages || []);
            } else {
                toast.error("ไม่สามารถโหลดข้อมูลแพ็กเกจได้");
            }
        } catch {
            toast.error("เกิดข้อผิดพลาดในการโหลดแพ็กเกจ");
        } finally {
            setPackagesLoading(false);
        }
    }, []);

    // ─── Fetch Partners ───
    const fetchPartners = useCallback(async () => {
        try {
            setPartnersLoading(true);
            const res = await apiFetch("/admin/services/partners");
            if (res.ok) {
                const data = await res.json();
                setPartners(data.data || data.partners || []);
            } else {
                toast.error("ไม่สามารถโหลดข้อมูลพาร์ทเนอร์ได้");
            }
        } catch {
            toast.error("เกิดข้อผิดพลาดในการโหลดพาร์ทเนอร์");
        } finally {
            setPartnersLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPackages();
        fetchPartners();
    }, [fetchPackages, fetchPartners]);

    // ─── Package CRUD ───
    const openAddPackage = () => {
        setEditingPackage(null);
        setPackageForm(emptyPackageForm);
        setPackageDialogOpen(true);
    };

    const openEditPackage = (pkg: InspectionPackage) => {
        setEditingPackage(pkg);
        setPackageForm({
            name: pkg.name,
            price: String(pkg.price),
            features: pkg.features.join("\n"),
            isRecommended: pkg.isRecommended,
            isActive: pkg.isActive,
        });
        setPackageDialogOpen(true);
    };

    const savePackage = async () => {
        if (!packageForm.name.trim() || !packageForm.price) {
            toast.error("กรุณากรอกชื่อและราคา");
            return;
        }
        try {
            setSavingPackage(true);
            const body = {
                name: packageForm.name.trim(),
                price: Number(packageForm.price),
                features: packageForm.features
                    .split("\n")
                    .map((f) => f.trim())
                    .filter(Boolean),
                isRecommended: packageForm.isRecommended,
                isActive: packageForm.isActive,
            };

            const url = editingPackage
                ? `/admin/services/packages/${editingPackage.id}`
                : "/admin/services/packages";
            const method = editingPackage ? "PUT" : "POST";

            const res = await apiFetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                toast.success(editingPackage ? "อัปเดตแพ็กเกจสำเร็จ" : "เพิ่มแพ็กเกจสำเร็จ");
                setPackageDialogOpen(false);
                fetchPackages();
            } else {
                toast.error("ไม่สามารถบันทึกแพ็กเกจได้");
            }
        } catch {
            toast.error("เกิดข้อผิดพลาด");
        } finally {
            setSavingPackage(false);
        }
    };

    const deletePackage = async (id: string) => {
        if (!confirm("ต้องการลบแพ็กเกจนี้หรือไม่?")) return;
        try {
            setDeletingPackageId(id);
            const res = await apiFetch(`/admin/services/packages/${id}`, { method: "DELETE" });
            if (res.ok) {
                toast.success("ลบแพ็กเกจสำเร็จ");
                fetchPackages();
            } else {
                toast.error("ไม่สามารถลบแพ็กเกจได้");
            }
        } catch {
            toast.error("เกิดข้อผิดพลาด");
        } finally {
            setDeletingPackageId(null);
        }
    };

    // ─── Partner CRUD ───
    const openAddPartner = () => {
        setEditingPartner(null);
        setPartnerForm(emptyPartnerForm);
        setPartnerDialogOpen(true);
    };

    const openEditPartner = (partner: ServicePartner) => {
        setEditingPartner(partner);
        setPartnerForm({
            name: partner.name,
            type: partner.type,
            highlight: partner.highlight,
            logoUrl: partner.logoUrl || "",
            isActive: partner.isActive,
        });
        setPartnerDialogOpen(true);
    };

    const savePartner = async () => {
        if (!partnerForm.name.trim()) {
            toast.error("กรุณากรอกชื่อพาร์ทเนอร์");
            return;
        }
        try {
            setSavingPartner(true);
            const body = {
                name: partnerForm.name.trim(),
                type: partnerForm.type,
                highlight: partnerForm.highlight.trim(),
                logoUrl: partnerForm.logoUrl.trim() || undefined,
                isActive: partnerForm.isActive,
            };

            const url = editingPartner
                ? `/admin/services/partners/${editingPartner.id}`
                : "/admin/services/partners";
            const method = editingPartner ? "PUT" : "POST";

            const res = await apiFetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                toast.success(editingPartner ? "อัปเดตพาร์ทเนอร์สำเร็จ" : "เพิ่มพาร์ทเนอร์สำเร็จ");
                setPartnerDialogOpen(false);
                fetchPartners();
            } else {
                toast.error("ไม่สามารถบันทึกพาร์ทเนอร์ได้");
            }
        } catch {
            toast.error("เกิดข้อผิดพลาด");
        } finally {
            setSavingPartner(false);
        }
    };

    const deletePartner = async (id: string) => {
        if (!confirm("ต้องการลบพาร์ทเนอร์นี้หรือไม่?")) return;
        try {
            setDeletingPartnerId(id);
            const res = await apiFetch(`/admin/services/partners/${id}`, { method: "DELETE" });
            if (res.ok) {
                toast.success("ลบพาร์ทเนอร์สำเร็จ");
                fetchPartners();
            } else {
                toast.error("ไม่สามารถลบพาร์ทเนอร์ได้");
            }
        } catch {
            toast.error("เกิดข้อผิดพลาด");
        } finally {
            setDeletingPartnerId(null);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("th-TH", {
            style: "currency",
            currency: "THB",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    // Group partners by type
    const bankPartners = partners.filter((p) => p.type === "BANK");
    const insurancePartners = partners.filter((p) => p.type === "INSURANCE");

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <Settings className="h-6 w-6 text-slate-700" />
                    <h1 className="text-2xl font-bold text-slate-900">ตั้งค่าบริการ</h1>
                </div>

                <Tabs defaultValue="packages" className="w-full">
                    <TabsList>
                        <TabsTrigger value="packages">แพ็กเกจตรวจสภาพ</TabsTrigger>
                        <TabsTrigger value="partners">พาร์ทเนอร์</TabsTrigger>
                    </TabsList>

                    {/* ─── Tab 1: Inspection Packages ─── */}
                    <TabsContent value="packages" className="space-y-4">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-slate-500">
                                จัดการแพ็กเกจตรวจสภาพรถสำหรับบริการจอง
                            </p>
                            <Button size="sm" onClick={openAddPackage}>
                                <Plus className="mr-2 h-4 w-4" />
                                เพิ่มแพ็กเกจ
                            </Button>
                        </div>

                        {packagesLoading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                            </div>
                        ) : packages.length === 0 ? (
                            <div className="py-12 text-center text-sm text-slate-500">
                                ยังไม่มีแพ็กเกจ กดปุ่ม &quot;เพิ่มแพ็กเกจ&quot; เพื่อเริ่มต้น
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {packages.map((pkg) => (
                                    <Card
                                        key={pkg.id}
                                        className={cn(
                                            "relative",
                                            !pkg.isActive && "opacity-60"
                                        )}
                                    >
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <CardTitle className="text-base">
                                                        {pkg.name}
                                                    </CardTitle>
                                                    <p className="mt-1 text-lg font-bold text-slate-900">
                                                        {formatCurrency(pkg.price)}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    {pkg.isRecommended && (
                                                        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                                                            <Star className="mr-1 h-3 w-3" />
                                                            แนะนำ
                                                        </Badge>
                                                    )}
                                                    <Badge
                                                        variant="outline"
                                                        className={cn(
                                                            "text-xs",
                                                            pkg.isActive
                                                                ? "bg-green-50 text-green-700 border-green-200"
                                                                : "bg-slate-50 text-slate-500 border-slate-200"
                                                        )}
                                                    >
                                                        {pkg.isActive ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            {pkg.features.length > 0 && (
                                                <ul className="mb-4 space-y-1.5 text-sm text-slate-600">
                                                    {pkg.features.map((f, i) => (
                                                        <li key={i} className="flex items-start gap-2">
                                                            <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-green-500" />
                                                            {f}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => openEditPackage(pkg)}
                                                >
                                                    <Pencil className="mr-1 h-3.5 w-3.5" />
                                                    แก้ไข
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-red-600 hover:text-red-700"
                                                    onClick={() => deletePackage(pkg.id)}
                                                    disabled={deletingPackageId === pkg.id}
                                                >
                                                    {deletingPackageId === pkg.id ? (
                                                        <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="mr-1 h-3.5 w-3.5" />
                                                    )}
                                                    ลบ
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* ─── Tab 2: Service Partners ─── */}
                    <TabsContent value="partners" className="space-y-6">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-slate-500">
                                จัดการพาร์ทเนอร์สำหรับบริการสินเชื่อและประกัน
                            </p>
                            <Button size="sm" onClick={openAddPartner}>
                                <Plus className="mr-2 h-4 w-4" />
                                เพิ่มพาร์ทเนอร์
                            </Button>
                        </div>

                        {partnersLoading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                            </div>
                        ) : partners.length === 0 ? (
                            <div className="py-12 text-center text-sm text-slate-500">
                                ยังไม่มีพาร์ทเนอร์ กดปุ่ม &quot;เพิ่มพาร์ทเนอร์&quot; เพื่อเริ่มต้น
                            </div>
                        ) : (
                            <>
                                {/* Bank Partners */}
                                {bankPartners.length > 0 && (
                                    <div className="space-y-3">
                                        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                            <Building2 className="h-4 w-4" />
                                            ธนาคาร ({bankPartners.length})
                                        </h3>
                                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                                            {bankPartners.map((partner) => (
                                                <PartnerCard
                                                    key={partner.id}
                                                    partner={partner}
                                                    onEdit={openEditPartner}
                                                    onDelete={deletePartner}
                                                    deleting={deletingPartnerId === partner.id}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Insurance Partners */}
                                {insurancePartners.length > 0 && (
                                    <div className="space-y-3">
                                        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                            <ShieldCheck className="h-4 w-4" />
                                            ประกัน ({insurancePartners.length})
                                        </h3>
                                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                                            {insurancePartners.map((partner) => (
                                                <PartnerCard
                                                    key={partner.id}
                                                    partner={partner}
                                                    onEdit={openEditPartner}
                                                    onDelete={deletePartner}
                                                    deleting={deletingPartnerId === partner.id}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </TabsContent>
                </Tabs>

                {/* ─── Package Dialog ─── */}
                <Dialog open={packageDialogOpen} onOpenChange={setPackageDialogOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>
                                {editingPackage ? "แก้ไขแพ็กเกจ" : "เพิ่มแพ็กเกจใหม่"}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="pkgName">ชื่อแพ็กเกจ</Label>
                                <Input
                                    id="pkgName"
                                    value={packageForm.name}
                                    onChange={(e) =>
                                        setPackageForm((f) => ({ ...f, name: e.target.value }))
                                    }
                                    placeholder="เช่น ตรวจสภาพพื้นฐาน"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="pkgPrice">ราคา (บาท)</Label>
                                <Input
                                    id="pkgPrice"
                                    type="number"
                                    value={packageForm.price}
                                    onChange={(e) =>
                                        setPackageForm((f) => ({ ...f, price: e.target.value }))
                                    }
                                    placeholder="0"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="pkgFeatures">คุณสมบัติ (บรรทัดละ 1 รายการ)</Label>
                                <Textarea
                                    id="pkgFeatures"
                                    value={packageForm.features}
                                    onChange={(e) =>
                                        setPackageForm((f) => ({ ...f, features: e.target.value }))
                                    }
                                    placeholder={"ตรวจเครื่องยนต์\nตรวจช่วงล่าง\nตรวจระบบไฟฟ้า"}
                                    rows={4}
                                />
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="pkgRecommended"
                                        checked={packageForm.isRecommended}
                                        onCheckedChange={(v) =>
                                            setPackageForm((f) => ({ ...f, isRecommended: !!v }))
                                        }
                                    />
                                    <Label htmlFor="pkgRecommended" className="text-sm">
                                        แนะนำ
                                    </Label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="pkgActive"
                                        checked={packageForm.isActive}
                                        onCheckedChange={(v) =>
                                            setPackageForm((f) => ({ ...f, isActive: !!v }))
                                        }
                                    />
                                    <Label htmlFor="pkgActive" className="text-sm">
                                        เปิดใช้งาน
                                    </Label>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setPackageDialogOpen(false)}
                            >
                                ยกเลิก
                            </Button>
                            <Button onClick={savePackage} disabled={savingPackage}>
                                {savingPackage && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                {editingPackage ? "บันทึก" : "เพิ่ม"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* ─── Partner Dialog ─── */}
                <Dialog open={partnerDialogOpen} onOpenChange={setPartnerDialogOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>
                                {editingPartner ? "แก้ไขพาร์ทเนอร์" : "เพิ่มพาร์ทเนอร์ใหม่"}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="partnerName">ชื่อพาร์ทเนอร์</Label>
                                <Input
                                    id="partnerName"
                                    value={partnerForm.name}
                                    onChange={(e) =>
                                        setPartnerForm((f) => ({ ...f, name: e.target.value }))
                                    }
                                    placeholder="เช่น ธนาคารกรุงเทพ"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="partnerType">ประเภท</Label>
                                <Select
                                    value={partnerForm.type}
                                    onValueChange={(v) =>
                                        setPartnerForm((f) => ({ ...f, type: v }))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="BANK">ธนาคาร</SelectItem>
                                        <SelectItem value="INSURANCE">ประกัน</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="partnerHighlight">จุดเด่น</Label>
                                <Input
                                    id="partnerHighlight"
                                    value={partnerForm.highlight}
                                    onChange={(e) =>
                                        setPartnerForm((f) => ({ ...f, highlight: e.target.value }))
                                    }
                                    placeholder="เช่น ดอกเบี้ยต่ำสุด 2.79%"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="partnerLogo">URL โลโก้ (ไม่บังคับ)</Label>
                                <Input
                                    id="partnerLogo"
                                    value={partnerForm.logoUrl}
                                    onChange={(e) =>
                                        setPartnerForm((f) => ({ ...f, logoUrl: e.target.value }))
                                    }
                                    placeholder="https://..."
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="partnerActive"
                                    checked={partnerForm.isActive}
                                    onCheckedChange={(v) =>
                                        setPartnerForm((f) => ({ ...f, isActive: !!v }))
                                    }
                                />
                                <Label htmlFor="partnerActive" className="text-sm">
                                    เปิดใช้งาน
                                </Label>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setPartnerDialogOpen(false)}
                            >
                                ยกเลิก
                            </Button>
                            <Button onClick={savePartner} disabled={savingPartner}>
                                {savingPartner && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                {editingPartner ? "บันทึก" : "เพิ่ม"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    );
}

// ─── Partner Card Component ───
function PartnerCard({
    partner,
    onEdit,
    onDelete,
    deleting,
}: {
    partner: ServicePartner;
    onEdit: (p: ServicePartner) => void;
    onDelete: (id: string) => void;
    deleting: boolean;
}) {
    return (
        <Card className={cn(!partner.isActive && "opacity-60")}>
            <CardContent className="p-4">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-500">
                            {partner.logoUrl ? (
                                <img
                                    src={partner.logoUrl}
                                    alt={partner.name}
                                    className="h-8 w-8 rounded object-contain"
                                />
                            ) : (
                                partner.name.slice(0, 2)
                            )}
                        </div>
                        <div>
                            <p className="font-medium text-slate-900">{partner.name}</p>
                            <p className="text-xs text-slate-500">{partner.highlight}</p>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <Badge
                            variant="outline"
                            className={cn(
                                "text-xs",
                                PARTNER_TYPE_COLORS[partner.type]
                            )}
                        >
                            {PARTNER_TYPE_LABELS[partner.type] || partner.type}
                        </Badge>
                        <Badge
                            variant="outline"
                            className={cn(
                                "text-xs",
                                partner.isActive
                                    ? "bg-green-50 text-green-700 border-green-200"
                                    : "bg-slate-50 text-slate-500 border-slate-200"
                            )}
                        >
                            {partner.isActive ? "เปิด" : "ปิด"}
                        </Badge>
                    </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(partner)}
                    >
                        <Pencil className="mr-1 h-3.5 w-3.5" />
                        แก้ไข
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => onDelete(partner.id)}
                        disabled={deleting}
                    >
                        {deleting ? (
                            <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                        ) : (
                            <Trash2 className="mr-1 h-3.5 w-3.5" />
                        )}
                        ลบ
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
