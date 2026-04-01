"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useEffect, useState, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import {
    Bell,
    Plus,
    Loader2,
    Send,
    History,
    FileText,
    Pencil,
    Trash2,
    Search,
    Eye,
    ChevronLeft,
    ChevronRight,
    Users,
    User,
    Package,
    Clock,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

// --- Types ---

interface NotificationTemplate {
    _id: string;
    name: string;
    label: string;
    type: string;
    content: string;
    isActive: boolean;
    createdAt: string;
}

interface LogEntry {
    _id: string;
    createdAt: string;
    templateName: string;
    recipientCount: number;
    successCount: number;
    failureCount: number;
}

const TEMPLATE_TYPES: Record<string, string> = {
    LISTING_EXPIRED: "ประกาศหมดอายุ",
    LISTING_APPROVED: "อนุมัติประกาศ",
    LISTING_REJECTED: "ปฏิเสธประกาศ",
    RENEWAL_APPROVED: "อนุมัติต่ออายุ",
    SYSTEM_ANNOUNCEMENT: "ประกาศจากระบบ",
};

const TEMPLATE_VARIABLES = [
    { key: "{{userName}}", label: "ชื่อผู้ใช้" },
    { key: "{{listingTitle}}", label: "ชื่อประกาศ" },
    { key: "{{expiryDate}}", label: "วันหมดอายุ" },
    { key: "{{siteName}}", label: "ชื่อเว็บไซต์" },
];

type RecipientType = "individual" | "all" | "package" | "expired";

const RECIPIENT_TYPE_MAP: Record<RecipientType, string> = {
    individual: "INDIVIDUAL",
    all: "ALL_USERS",
    package: "BY_PACKAGE",
    expired: "EXPIRED_LISTINGS",
};

// --- Templates Tab ---

function TemplatesTab() {
    const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [deleteTemplateId, setDeleteTemplateId] = useState<string | null>(null);
    const [form, setForm] = useState({
        name: "",
        label: "",
        type: "",
        content: "",
        isActive: true,
    });

    const fetchTemplates = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await apiFetch("/admin/notifications/templates");
            setTemplates(Array.isArray(data) ? data : data.templates || []);
        } catch (error) {
            console.error("Fetch templates error:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTemplates();
    }, [fetchTemplates]);

    const openCreateDialog = () => {
        setEditingTemplate(null);
        setForm({ name: "", label: "", type: "", content: "", isActive: true });
        setDialogOpen(true);
    };

    const openEditDialog = (template: NotificationTemplate) => {
        setEditingTemplate(template);
        setForm({
            name: template.name,
            label: template.label,
            type: template.type,
            content: template.content,
            isActive: template.isActive,
        });
        setDialogOpen(true);
    };

    const handleSave = async () => {
        if (!form.name || !form.type || !form.content) {
            toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
            return;
        }
        setIsSaving(true);
        try {
            if (editingTemplate) {
                await apiFetch(`/admin/notifications/templates/${editingTemplate.id}`, {
                    method: "PUT",
                    body: JSON.stringify(form),
                });
                toast.success("แก้ไขเทมเพลตเรียบร้อยแล้ว");
            } else {
                await apiFetch("/admin/notifications/templates", {
                    method: "POST",
                    body: JSON.stringify(form),
                });
                toast.success("สร้างเทมเพลตเรียบร้อยแล้ว");
            }
            setDialogOpen(false);
            fetchTemplates();
        } catch (error: any) {
            toast.error(error.message || "ไม่สามารถบันทึกเทมเพลตได้");
        } finally {
            setIsSaving(false);
        }
    };

    const handleConfirmedDelete = async () => {
        if (!deleteTemplateId) return;
        try {
            await apiFetch(`/admin/notifications/templates/${deleteTemplateId}`, { method: "DELETE" });
            toast.success("ลบเทมเพลตเรียบร้อยแล้ว");
            setDeleteTemplateId(null);
            fetchTemplates();
        } catch (error: any) {
            toast.error(error.message || "ไม่สามารถลบเทมเพลตได้");
        }
    };

    const insertVariable = (variable: string) => {
        setForm((prev) => ({ ...prev, content: prev.content + variable }));
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-8 w-8 text-primary animate-spin mb-3" />
                <p className="text-muted-foreground text-sm">กำลังโหลดเทมเพลต...</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button
                    onClick={openCreateDialog}
                    className="bg-brand-primary hover:bg-brand-primary/90 text-white font-medium"
                >
                    <Plus size={16} className="mr-2" /> สร้างเทมเพลต
                </Button>
            </div>

            <Card className="rounded-xl border-border shadow-sm">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ชื่อ</TableHead>
                                <TableHead>ประเภท</TableHead>
                                <TableHead>สถานะ</TableHead>
                                <TableHead>วันที่สร้าง</TableHead>
                                <TableHead className="text-right">จัดการ</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {templates.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                        ยังไม่มีเทมเพลต
                                    </TableCell>
                                </TableRow>
                            ) : (
                                templates.map((t) => (
                                    <TableRow key={t.id}>
                                        <TableCell className="font-medium">{t.name}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="text-xs">
                                                {TEMPLATE_TYPES[t.type] || t.type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {t.isActive ? (
                                                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                                                    Active
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-muted-foreground">
                                                    Inactive
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {new Date(t.createdAt).toLocaleDateString("th-TH")}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => openEditDialog(t)}
                                                    className="h-8 w-8"
                                                >
                                                    <Pencil size={14} />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setDeleteTemplateId(t.id)}
                                                    className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                                                >
                                                    <Trash2 size={14} />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Create/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            {editingTemplate ? "แก้ไขเทมเพลต" : "สร้างเทมเพลตใหม่"}
                        </DialogTitle>
                        <DialogDescription>
                            กำหนดเนื้อหาข้อความที่จะส่งแจ้งเตือนผ่าน LINE
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label>ชื่อเทมเพลต</Label>
                            <Input
                                value={form.name}
                                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                                placeholder="เช่น แจ้งเตือนประกาศหมดอายุ"
                                className="h-10 rounded-lg bg-muted border-border"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Label</Label>
                            <Input
                                value={form.label}
                                onChange={(e) => setForm((prev) => ({ ...prev, label: e.target.value }))}
                                placeholder="เช่น listing-expired"
                                className="h-10 rounded-lg bg-muted border-border"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label>ประเภท</Label>
                            <Select
                                value={form.type}
                                onValueChange={(val) => setForm((prev) => ({ ...prev, type: val }))}
                            >
                                <SelectTrigger className="h-10 rounded-lg bg-muted border-border">
                                    <SelectValue placeholder="เลือกประเภท" />
                                </SelectTrigger>
                                <SelectContent className="rounded-lg">
                                    {Object.entries(TEMPLATE_TYPES).map(([value, label]) => (
                                        <SelectItem key={value} value={value} className="py-2">
                                            {label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label>เนื้อหาข้อความ</Label>
                            <div className="flex flex-wrap gap-1.5 mb-2">
                                {TEMPLATE_VARIABLES.map((v) => (
                                    <Button
                                        key={v.key}
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => insertVariable(v.key)}
                                        className="text-xs h-7 px-2"
                                    >
                                        {v.label} <code className="ml-1 text-[10px] text-muted-foreground">{v.key}</code>
                                    </Button>
                                ))}
                            </div>
                            <Textarea
                                value={form.content}
                                onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
                                placeholder="เช่น สวัสดีคุณ {{userName}} ประกาศ {{listingTitle}} ของคุณจะหมดอายุในวันที่ {{expiryDate}}"
                                className="rounded-lg bg-muted border-border min-h-[120px]"
                                rows={5}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={form.isActive}
                                    onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                                    className="rounded border-border"
                                />
                                เปิดใช้งาน (Active)
                            </Label>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>
                            ยกเลิก
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="bg-brand-primary hover:bg-brand-primary/90 text-white font-medium"
                        >
                            {isSaving ? (
                                <><Loader2 className="animate-spin mr-2" size={16} /> กำลังบันทึก...</>
                            ) : (
                                "บันทึก"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Template Confirmation Modal */}
            {deleteTemplateId && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteTemplateId(null)} />
                    <div className="bg-card rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 relative z-10">
                        <div className="text-center">
                            <div className="w-14 h-14 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="text-rose-500" size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-foreground mb-1">ยืนยันการลบ</h3>
                            <p className="text-sm text-muted-foreground mb-5">ต้องการลบเทมเพลตนี้หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้</p>
                            <div className="flex gap-3">
                                <Button variant="outline" className="flex-1" onClick={() => setDeleteTemplateId(null)}>
                                    ยกเลิก
                                </Button>
                                <Button variant="destructive" className="flex-1" onClick={() => handleConfirmedDelete()}>
                                    ยืนยันลบ
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// --- Send Tab ---

function SendTab() {
    const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
    const [selectedTemplateId, setSelectedTemplateId] = useState("");
    const [recipientType, setRecipientType] = useState<RecipientType>("all");
    const [searchUser, setSearchUser] = useState("");
    const [selectedUserId, setSelectedUserId] = useState("");
    const [userResults, setUserResults] = useState<any[]>([]);
    const [selectedPackage, setSelectedPackage] = useState("");
    const [packages, setPackages] = useState<any[]>([]);
    const [recipientCount, setRecipientCount] = useState<number | null>(null);
    const [previewMessage, setPreviewMessage] = useState("");
    const [isLoadingPreview, setIsLoadingPreview] = useState(false);
    const [isLoadingCount, setIsLoadingCount] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showSendConfirm, setShowSendConfirm] = useState(false);

    useEffect(() => {
        const init = async () => {
            setIsLoading(true);
            try {
                const [tmplData, pkgData] = await Promise.all([
                    apiFetch("/admin/notifications/templates"),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/packages`).then(r => r.json()).catch(() => ({ packages: [] })),
                ]);
                const tmplList = Array.isArray(tmplData) ? tmplData : tmplData.templates || [];
                setTemplates(tmplList.filter((t: NotificationTemplate) => t.isActive));
                const pkgList = Array.isArray(pkgData) ? pkgData : pkgData.packages || [];
                setPackages(pkgList);
            } catch (error) {
                console.error("Init send tab error:", error);
            } finally {
                setIsLoading(false);
            }
        };
        init();
    }, []);

    const fetchRecipientCount = useCallback(async () => {
        setIsLoadingCount(true);
        setRecipientCount(null);
        try {
            const body: any = { recipientType: RECIPIENT_TYPE_MAP[recipientType] };
            if (recipientType === "individual" && selectedUserId) body.userId = selectedUserId;
            if (recipientType === "package" && selectedPackage) body.packageSlug = selectedPackage;
            const result = await apiFetch("/admin/notifications/recipient-count", {
                method: "POST",
                body: JSON.stringify(body),
            });
            setRecipientCount(result.count ?? 0);
        } catch (error) {
            console.error("Recipient count error:", error);
        } finally {
            setIsLoadingCount(false);
        }
    }, [recipientType, selectedUserId, selectedPackage]);

    useEffect(() => {
        fetchRecipientCount();
    }, [fetchRecipientCount]);

    const handleSearchUser = async () => {
        if (!searchUser.trim()) return;
        try {
            const data = await apiFetch(`/admin/users?search=${encodeURIComponent(searchUser)}&limit=10`);
            const users = Array.isArray(data) ? data : data.users || [];
            setUserResults(users);
        } catch (error) {
            console.error("Search user error:", error);
        }
    };

    const handlePreview = async () => {
        if (!selectedTemplateId) {
            toast.error("กรุณาเลือกเทมเพลตก่อน");
            return;
        }
        setIsLoadingPreview(true);
        try {
            const result = await apiFetch("/admin/notifications/preview", {
                method: "POST",
                body: JSON.stringify({ templateId: selectedTemplateId }),
            });
            setPreviewMessage(result.message || result.preview || "");
        } catch (error: any) {
            toast.error(error.message || "ไม่สามารถแสดงตัวอย่างได้");
        } finally {
            setIsLoadingPreview(false);
        }
    };

    const handleSendClick = () => {
        if (!selectedTemplateId) {
            toast.error("กรุณาเลือกเทมเพลตก่อน");
            return;
        }
        setShowSendConfirm(true);
    };

    const handleConfirmedSend = async () => {
        setShowSendConfirm(false);
        setIsSending(true);
        try {
            const body: any = { templateId: selectedTemplateId, recipientType: RECIPIENT_TYPE_MAP[recipientType] };
            if (recipientType === "individual" && selectedUserId) body.userId = selectedUserId;
            if (recipientType === "package" && selectedPackage) body.packageSlug = selectedPackage;

            await apiFetch("/admin/notifications/send", {
                method: "POST",
                body: JSON.stringify(body),
            });
            toast.success("ส่งแจ้งเตือนเรียบร้อยแล้ว");
        } catch (error: any) {
            toast.error(error.message || "ไม่สามารถส่งแจ้งเตือนได้");
        } finally {
            setIsSending(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-8 w-8 text-primary animate-spin mb-3" />
                <p className="text-muted-foreground text-sm">กำลังโหลด...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Step 1: Select Template */}
            <Card className="rounded-xl border-border shadow-sm">
                <CardHeader>
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <span className="flex items-center justify-center h-6 w-6 rounded-full bg-brand-primary text-white text-xs font-bold">1</span>
                        เลือกเทมเพลต
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                        <SelectTrigger className="h-10 rounded-lg bg-muted border-border">
                            <SelectValue placeholder="เลือกเทมเพลตข้อความ" />
                        </SelectTrigger>
                        <SelectContent className="rounded-lg">
                            {templates.map((t) => (
                                <SelectItem key={t.id} value={t.id} className="py-2">
                                    {t.name} ({TEMPLATE_TYPES[t.type] || t.type})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            {/* Step 2: Select Recipients */}
            <Card className="rounded-xl border-border shadow-sm">
                <CardHeader>
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <span className="flex items-center justify-center h-6 w-6 rounded-full bg-brand-primary text-white text-xs font-bold">2</span>
                        เลือกผู้รับ
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {[
                            { value: "individual" as RecipientType, label: "บุคคล", icon: User },
                            { value: "all" as RecipientType, label: "ผู้ใช้ทั้งหมด", icon: Users },
                            { value: "package" as RecipientType, label: "ตามแพ็กเกจ", icon: Package },
                            { value: "expired" as RecipientType, label: "ผู้ที่ประกาศหมดอายุ", icon: Clock },
                        ].map((opt) => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => setRecipientType(opt.value)}
                                className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-colors text-sm ${
                                    recipientType === opt.value
                                        ? "border-brand-primary bg-brand-primary/5 text-brand-primary"
                                        : "border-border bg-muted text-muted-foreground hover:border-border"
                                }`}
                            >
                                <opt.icon size={18} />
                                <span className="font-medium">{opt.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Individual user search */}
                    {recipientType === "individual" && (
                        <div className="space-y-2">
                            <div className="flex gap-2">
                                <Input
                                    value={searchUser}
                                    onChange={(e) => setSearchUser(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSearchUser()}
                                    placeholder="ค้นหาด้วยชื่อ, อีเมล หรือเบอร์โทร"
                                    className="h-10 rounded-lg bg-muted border-border"
                                />
                                <Button variant="outline" onClick={handleSearchUser}>
                                    <Search size={16} />
                                </Button>
                            </div>
                            {userResults.length > 0 && (
                                <div className="border rounded-lg divide-y max-h-40 overflow-y-auto">
                                    {userResults.map((u: any) => (
                                        <button
                                            key={u.id}
                                            type="button"
                                            onClick={() => {
                                                setSelectedUserId(u.id);
                                                setUserResults([]);
                                                setSearchUser(u.fullName || u.email || u.id);
                                            }}
                                            className={`w-full text-left px-3 py-2 text-sm hover:bg-muted ${
                                                selectedUserId === u.id ? "bg-brand-primary/5" : ""
                                            }`}
                                        >
                                            <span className="font-medium">{u.fullName || u.email}</span>
                                            {u.email && <span className="text-muted-foreground ml-2">{u.email}</span>}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Package select */}
                    {recipientType === "package" && (
                        <Select value={selectedPackage} onValueChange={setSelectedPackage}>
                            <SelectTrigger className="h-10 rounded-lg bg-muted border-border">
                                <SelectValue placeholder="เลือกแพ็กเกจ" />
                            </SelectTrigger>
                            <SelectContent className="rounded-lg">
                                {packages.map((p: any) => (
                                    <SelectItem key={p.id || p.slug} value={p.slug} className="py-2">
                                        {p.nameTh || p.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}

                    {/* Recipient count */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {isLoadingCount ? (
                            <Loader2 size={14} className="animate-spin" />
                        ) : (
                            <Users size={14} />
                        )}
                        <span>
                            จำนวนผู้รับ:{" "}
                            <strong className="text-foreground">
                                {recipientCount !== null ? recipientCount.toLocaleString() : "..."}
                            </strong>{" "}
                            คน
                        </span>
                    </div>
                </CardContent>
            </Card>

            {/* Step 3: Preview */}
            <Card className="rounded-xl border-border shadow-sm">
                <CardHeader>
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <span className="flex items-center justify-center h-6 w-6 rounded-full bg-brand-primary text-white text-xs font-bold">3</span>
                        ตัวอย่างข้อความ
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Button
                        variant="outline"
                        onClick={handlePreview}
                        disabled={isLoadingPreview || !selectedTemplateId}
                    >
                        {isLoadingPreview ? (
                            <><Loader2 className="animate-spin mr-2" size={16} /> กำลังโหลด...</>
                        ) : (
                            <><Eye size={16} className="mr-2" /> แสดงตัวอย่าง</>
                        )}
                    </Button>
                    {previewMessage && (
                        <div className="p-4 bg-muted rounded-lg border border-border text-sm whitespace-pre-wrap">
                            {previewMessage}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Step 4: Send */}
            <div className="flex justify-end">
                <Button
                    onClick={handleSendClick}
                    disabled={isSending || !selectedTemplateId}
                    className="bg-brand-primary hover:bg-brand-primary/90 text-white font-medium px-8"
                >
                    {isSending ? (
                        <><Loader2 className="animate-spin mr-2" size={16} /> กำลังส่ง...</>
                    ) : (
                        <><Send size={16} className="mr-2" /> ยืนยันส่งแจ้งเตือน</>
                    )}
                </Button>
            </div>

            {/* Send Confirmation Modal */}
            {showSendConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSendConfirm(false)} />
                    <div className="bg-card rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 relative z-10">
                        <div className="text-center">
                            <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Send className="text-emerald-500" size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-foreground mb-1">ยืนยันการส่งแจ้งเตือน</h3>
                            <p className="text-sm text-muted-foreground mb-5">คุณต้องการส่งแจ้งเตือนไปยังผู้รับที่เลือกใช่หรือไม่?</p>
                            <div className="flex gap-3">
                                <Button variant="outline" className="flex-1" onClick={() => setShowSendConfirm(false)}>
                                    ยกเลิก
                                </Button>
                                <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleConfirmedSend()}>
                                    ยืนยันส่ง
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// --- History Tab ---

function HistoryTab() {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchLogs = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await apiFetch(`/admin/notifications/logs?page=${page}&limit=20`);
            setLogs(Array.isArray(data) ? data : data.logs || []);
            setTotalPages(data.totalPages || 1);
        } catch (error) {
            console.error("Fetch logs error:", error);
        } finally {
            setIsLoading(false);
        }
    }, [page]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-8 w-8 text-primary animate-spin mb-3" />
                <p className="text-muted-foreground text-sm">กำลังโหลดประวัติ...</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <Card className="rounded-xl border-border shadow-sm">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>วันที่</TableHead>
                                <TableHead>เทมเพลต</TableHead>
                                <TableHead className="text-center">ผู้รับ</TableHead>
                                <TableHead className="text-center">สำเร็จ</TableHead>
                                <TableHead className="text-center">ล้มเหลว</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                        ยังไม่มีประวัติการส่งแจ้งเตือน
                                    </TableCell>
                                </TableRow>
                            ) : (
                                logs.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {new Date(log.createdAt).toLocaleString("th-TH")}
                                        </TableCell>
                                        <TableCell className="font-medium">{log.template?.label || '-'}</TableCell>
                                        <TableCell className="text-center">{log.recipientType === 'INDIVIDUAL' ? 'บุคคล' : log.recipientType === 'ALL_USERS' ? 'ทั้งหมด' : log.recipientType === 'BY_PACKAGE' ? 'ตามแพ็กเกจ' : 'ประกาศหมดอายุ'}</TableCell>
                                        <TableCell className="text-center">
                                            <span className="text-emerald-600 font-medium">{log.totalSent}</span>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <span className={log.totalFailed > 0 ? "text-rose-500 font-medium" : "text-muted-foreground"}>
                                                {log.totalFailed}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page <= 1}
                        className="h-8 w-8"
                    >
                        <ChevronLeft size={16} />
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        หน้า {page} / {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page >= totalPages}
                        className="h-8 w-8"
                    >
                        <ChevronRight size={16} />
                    </Button>
                </div>
            )}
        </div>
    );
}

// --- Main Page ---

export default function NotificationsPage() {
    return (
        <DashboardLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
                        <Bell className="text-primary" /> การแจ้งเตือน
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">จัดการเทมเพลตและส่งแจ้งเตือนผ่าน LINE OA</p>
                </div>
            </div>

            <Tabs defaultValue="templates" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="templates">
                        <FileText size={14} className="mr-1.5" /> เทมเพลต
                    </TabsTrigger>
                    <TabsTrigger value="send">
                        <Send size={14} className="mr-1.5" /> ส่งแจ้งเตือน
                    </TabsTrigger>
                    <TabsTrigger value="history">
                        <History size={14} className="mr-1.5" /> ประวัติ
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="templates">
                    <TemplatesTab />
                </TabsContent>

                <TabsContent value="send">
                    <SendTab />
                </TabsContent>

                <TabsContent value="history">
                    <HistoryTab />
                </TabsContent>
            </Tabs>
        </DashboardLayout>
    );
}
