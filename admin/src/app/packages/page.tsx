"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import {
    Package,
    Check,
    X,
    Clock,
    Eye,
    AlertTriangle,
    CheckCircle,
    XCircle,
    User,
    Star,
    Zap,
    Crown,
    Rocket,
    Trash2,
    CreditCard,
    Car,
    ImagePlus,
    Search,
    Award,
    Users,
    FileText,
    Pencil
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePendingCounts } from "@/contexts/PendingContext";

interface PackageData {
    id: string;
    name: string;
    nameTh: string;
    slug: string;
    description: string | null;
    targetAudience: string | null;
    price: number;
    maxListings: number;
    maxPhotosPerListing: number;
    listingDurationDays: number;
    autoBumpPerDay: number;
    badge: string | null;
    searchPriority: string;
    features: string[];
    sortOrder: number;
    isActive: boolean;
    _count?: { users: number; transactions: number };
}

interface TransactionUser {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    currentPackageId: string | null;
    currentPackage: { name: string; slug: string } | null;
}

interface Transaction {
    id: string;
    amount: string;
    slipImage: string;
    status: string;
    transactionType: string;
    proratedCredit: string | null;
    fromPackageName: string | null;
    fromPackageSlug: string | null;
    adminNote: string | null;
    reviewedAt: string | null;
    createdAt: string;
    user: TransactionUser;
    package: { id: string; name: string; nameTh: string; slug: string; price: number };
}

const slugIcons: Record<string, React.ReactNode> = {
    basic: <Zap className="text-muted-foreground" size={16} />,
    standard: <Star className="text-blue-500" size={16} />,
    professional: <Rocket className="text-orange-500" size={16} />,
    premium: <Crown className="text-yellow-500" size={16} />,
};

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    PENDING: { label: 'รอตรวจสอบ', color: 'bg-amber-50 text-amber-700', icon: <Clock size={13} /> },
    APPROVED: { label: 'อนุมัติแล้ว', color: 'bg-emerald-50 text-emerald-700', icon: <CheckCircle size={13} /> },
    REJECTED: { label: 'ถูกปฏิเสธ', color: 'bg-rose-50 text-rose-700', icon: <XCircle size={13} /> },
};

function getSlugIcon(slug: string) {
    return slugIcons[slug] || <Package size={16} />;
}

export default function AdminPackagesPage() {
    const pendingCounts = usePendingCounts();
    const refreshUpgradeBadge = pendingCounts.refreshUpgrades;
    const refreshSlotBadge = pendingCounts.refreshSlotPurchases;
    const pendingSlotPurchaseCount = pendingCounts.pendingSlotPurchaseCount;
    const [activeTab, setActiveTab] = useState<'packages' | 'transactions' | 'slots'>('transactions');
    const [slotPurchases, setSlotPurchases] = useState<any[]>([]);
    const [slotFilterStatus, setSlotFilterStatus] = useState<string>('');
    const [slotPage, setSlotPage] = useState(1);
    const [slotTotalPages, setSlotTotalPages] = useState(1);
    const [slotIsLoading, setSlotIsLoading] = useState(true);
    const [slotApproveId, setSlotApproveId] = useState<string | null>(null);
    const [slotRejectId, setSlotRejectId] = useState<string | null>(null);
    const [slotRejectNote, setSlotRejectNote] = useState('');
    const [viewSlotSlip, setViewSlotSlip] = useState<string | null>(null);
    const [packages, setPackages] = useState<PackageData[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [page, setPage] = useState(1);
    const [filterStatus, setFilterStatus] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [viewSlip, setViewSlip] = useState<string | null>(null);
    const [rejectId, setRejectId] = useState<string | null>(null);
    const [rejectNote, setRejectNote] = useState('');
    const [approveId, setApproveId] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [deletePackageId, setDeletePackageId] = useState<string | null>(null);
    const [editingPkg, setEditingPkg] = useState<PackageData | null>(null);
    const [editForm, setEditForm] = useState<any>({});
    const [editSaving, setEditSaving] = useState(false);

    const fetchPackages = async () => {
        try {
            const data = await apiFetch('/admin/packages');
            setPackages(data.packages || []);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchTransactions = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({ page: String(page), limit: '20' });
            if (filterStatus) params.set('status', filterStatus);
            const data = await apiFetch(`/admin/packages/transactions?${params}`);
            setTransactions(data.transactions || []);
            setTotalPages(data.pagination?.totalPages || 1);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPackages();
    }, []);

    useEffect(() => {
        if (activeTab === 'transactions') fetchTransactions();
    }, [page, filterStatus, activeTab]);

    const fetchSlotPurchases = async () => {
        setSlotIsLoading(true);
        try {
            const params = new URLSearchParams({ page: String(slotPage), limit: '20' });
            if (slotFilterStatus) params.set('status', slotFilterStatus);
            const data = await apiFetch(`/admin/slot-purchases?${params}`);
            setSlotPurchases(data.purchases || []);
            setSlotTotalPages(data.pagination?.totalPages || 1);
        } catch (error) {
            console.error(error);
        } finally {
            setSlotIsLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'slots') fetchSlotPurchases();
    }, [slotPage, slotFilterStatus, activeTab]);

    const handleSlotApprove = async () => {
        if (!slotApproveId) return;
        setActionLoading(slotApproveId);
        try {
            await apiFetch(`/admin/slot-purchases/${slotApproveId}/approve`, { method: 'POST' });
            toast.success('อนุมัติคำขอซื้อ slot สำเร็จ');
            setSlotApproveId(null);
            fetchSlotPurchases();
            refreshSlotBadge();
        } catch (error: any) {
            toast.error(error.message || 'เกิดข้อผิดพลาด');
        } finally {
            setActionLoading(null);
        }
    };

    const handleSlotReject = async () => {
        if (!slotRejectId) return;
        setActionLoading(slotRejectId);
        try {
            await apiFetch(`/admin/slot-purchases/${slotRejectId}/reject`, {
                method: 'POST',
                body: JSON.stringify({ adminNote: slotRejectNote }),
            });
            toast.success('ปฏิเสธคำขอเรียบร้อย');
            setSlotRejectId(null);
            setSlotRejectNote('');
            fetchSlotPurchases();
            refreshSlotBadge();
        } catch (error: any) {
            toast.error(error.message || 'เกิดข้อผิดพลาด');
        } finally {
            setActionLoading(null);
        }
    };

    const handleApprove = async () => {
        if (!approveId) return;
        setActionLoading(approveId);
        try {
            await apiFetch(`/admin/packages/transactions/${approveId}/approve`, { method: 'POST' });
            setApproveId(null);
            fetchTransactions();
            refreshUpgradeBadge();
        } catch (error: any) {
            toast.error(error.message || 'เกิดข้อผิดพลาด');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async () => {
        if (!rejectId) return;
        setActionLoading(rejectId);
        try {
            await apiFetch(`/admin/packages/transactions/${rejectId}/reject`, {
                method: 'POST',
                body: JSON.stringify({ adminNote: rejectNote }),
            });
            setRejectId(null);
            setRejectNote('');
            fetchTransactions();
            refreshUpgradeBadge();
        } catch (error: any) {
            toast.error(error.message || 'เกิดข้อผิดพลาด');
        } finally {
            setActionLoading(null);
        }
    };

    const openEditModal = (pkg: PackageData) => {
        setEditingPkg(pkg);
        setEditForm({
            name: pkg.name,
            nameTh: pkg.nameTh,
            slug: pkg.slug,
            description: pkg.description || '',
            targetAudience: pkg.targetAudience || '',
            price: Number(pkg.price),
            maxListings: pkg.maxListings,
            maxPhotosPerListing: pkg.maxPhotosPerListing,
            listingDurationDays: pkg.listingDurationDays,
            autoBumpPerDay: pkg.autoBumpPerDay,
            manualBumpPerDay: pkg.manualBumpPerDay || 0,
            badge: pkg.badge || '',
            searchPriority: pkg.searchPriority,
            sortOrder: pkg.sortOrder,
            isActive: pkg.isActive,
        });
    };

    const handleSaveEdit = async () => {
        if (!editingPkg) return;
        setEditSaving(true);
        try {
            await apiFetch(`/admin/packages/${editingPkg.id}`, {
                method: 'PUT',
                body: JSON.stringify(editForm),
            });
            toast.success('อัพเดทแพ็กเกจสำเร็จ');
            setEditingPkg(null);
            fetchPackages();
        } catch (error: any) {
            toast.error(error.message || 'ไม่สามารถอัพเดทแพ็กเกจได้');
        } finally {
            setEditSaving(false);
        }
    };

    const handleDeletePackage = async () => {
        if (!deletePackageId) return;
        try {
            const result = await apiFetch(`/admin/packages/${deletePackageId}`, { method: 'DELETE' });
            toast.success(result.message || 'ลบแพ็กเกจเรียบร้อยแล้ว');
            setDeletePackageId(null);
            fetchPackages();
        } catch (error: any) {
            toast.error(error.message || 'เกิดข้อผิดพลาด');
        }
    };

    const pendingCount = transactions.filter(t => t.status === 'PENDING').length;

    return (
        <DashboardLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
                        <Package className="text-primary" /> จัดการแพ็กเกจ
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">จัดการ Master Data แพ็กเกจ และตรวจสอบคำขออัพเกรด</p>
                </div>
                {pendingCount > 0 && (
                    <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg text-sm font-medium border border-amber-200">
                        <AlertTriangle size={16} />
                        {pendingCount} รายการรอตรวจสอบ
                    </div>
                )}
            </div>

            <Tabs defaultValue="transactions" className="mb-6" onValueChange={(v) => setActiveTab(v as any)}>
                <TabsList>
                    <TabsTrigger value="transactions">
                        <Package size={16} className="mr-1.5" /> คำขออัพเกรด
                    </TabsTrigger>
                    <TabsTrigger value="slots">
                        <CreditCard size={16} className="mr-1.5" /> ซื้อ slot เพิ่ม
                        {pendingSlotPurchaseCount > 0 && (
                            <span className="ml-1.5 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                {pendingSlotPurchaseCount}
                            </span>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="packages">
                        <Star size={16} className="mr-1.5" /> จัดการแพ็กเกจ
                    </TabsTrigger>
                </TabsList>

            <TabsContent value="packages">
                <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                    <div className="divide-y divide-border">
                        {packages.map(pkg => (
                            <div key={pkg.id} className={`p-5 ${!pkg.isActive ? 'opacity-50' : ''}`}>
                                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                    <div className="flex items-center gap-3 min-w-[200px]">
                                        <div className="w-9 h-9 bg-muted rounded-lg flex items-center justify-center">
                                            {getSlugIcon(pkg.slug)}
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm text-foreground">{pkg.name}</p>
                                            <p className="text-xs text-muted-foreground">{pkg.nameTh}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded font-medium flex items-center gap-1"><CreditCard size={12} /> ฿{Number(pkg.price).toLocaleString()}{Number(pkg.price) > 0 ? '/เดือน' : ' ฟรี'}</span>
                                        <span className="bg-muted px-2 py-1 rounded flex items-center gap-1"><Car size={12} className="text-muted-foreground" /> {pkg.maxListings === -1 ? '∞' : pkg.maxListings} ประกาศ</span>
                                        <span className="bg-muted px-2 py-1 rounded flex items-center gap-1"><ImagePlus size={12} className="text-muted-foreground" /> {pkg.maxPhotosPerListing} รูป</span>
                                        <span className="bg-muted px-2 py-1 rounded flex items-center gap-1"><Clock size={12} className="text-muted-foreground" /> {pkg.listingDurationDays === -1 ? 'ไม่หมดอายุ' : `${pkg.listingDurationDays} วัน`}</span>
                                        <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded flex items-center gap-1"><Zap size={12} /> ดันอัตโนมัติ {pkg.autoBumpPerDay || 0}/วัน</span>
                                        <span className="bg-sky-50 text-sky-700 px-2 py-1 rounded flex items-center gap-1"><Zap size={12} /> ดันเอง {pkg.manualBumpPerDay || 0}/คัน/วัน</span>
                                        <span className="bg-amber-50 text-amber-700 px-2 py-1 rounded flex items-center gap-1"><Search size={12} /> {pkg.searchPriority === 'priority' ? 'บนสุด' : pkg.searchPriority === 'top' ? 'ลำดับต้น' : pkg.searchPriority === 'higher' ? 'ดีกว่าปกติ' : 'ปกติ'}</span>
                                        {pkg.badge && <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded flex items-center gap-1"><Award size={12} /> {pkg.badge}</span>}
                                    </div>
                                    <div className="flex gap-3 ml-auto text-xs text-muted-foreground flex-shrink-0">
                                        <span>{pkg._count?.users || 0} ผู้ใช้</span>
                                        <span>{pkg._count?.transactions || 0} รายการ</span>
                                    </div>
                                    <div className="flex gap-2 items-center flex-shrink-0">
                                        {!pkg.isActive && (
                                            <span className="text-xs text-rose-500 font-medium">ปิดใช้งาน</span>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => openEditModal(pkg)}
                                            className="h-8 w-8 text-muted-foreground hover:text-blue-600 hover:bg-blue-50"
                                        >
                                            <Pencil size={14} />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </TabsContent>

            <TabsContent value="transactions">
                    {/* Filter Tabs */}
                    <Tabs defaultValue="" className="mb-6" onValueChange={(v) => { setFilterStatus(v); setPage(1); }}>
                        <TabsList>
                            <TabsTrigger value="">ทั้งหมด</TabsTrigger>
                            <TabsTrigger value="PENDING">รอตรวจสอบ</TabsTrigger>
                            <TabsTrigger value="APPROVED">อนุมัติแล้ว</TabsTrigger>
                            <TabsTrigger value="REJECTED">ถูกปฏิเสธ</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                        {isLoading ? (
                            <div className="p-12 text-center text-muted-foreground">
                                <Package className="mx-auto mb-3 animate-pulse opacity-30" size={32} />
                                <p className="text-sm">กำลังโหลด...</p>
                            </div>
                        ) : transactions.length === 0 ? (
                            <div className="p-12 text-center text-muted-foreground">
                                <Package className="mx-auto mb-3 opacity-30" size={32} />
                                <p className="text-sm">ไม่พบรายการ</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border">
                                {transactions.map(tx => {
                                    const status = statusConfig[tx.status] || statusConfig.PENDING;
                                    return (
                                        <div key={tx.id} className="p-5 hover:bg-accent transition-colors">
                                            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                                {/* User Info */}
                                                <Link href={`/users/${tx.user.id}`} className="flex items-center gap-3 min-w-[200px] group/user">
                                                    <div className="w-9 h-9 bg-accent rounded-lg flex items-center justify-center text-muted-foreground">
                                                        <User size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-sm text-foreground group-hover/user:text-primary group-hover/user:underline transition-colors">{tx.user.fullName}</p>
                                                        <p className="text-xs text-muted-foreground">{tx.user.email}</p>
                                                    </div>
                                                </Link>

                                                {/* Package Info */}
                                                <div className="flex items-center gap-2 min-w-[200px]">
                                                    <div className="flex items-center gap-1.5 bg-muted px-2.5 py-1 rounded-md text-xs font-medium text-muted-foreground">
                                                        {getSlugIcon(tx.fromPackageSlug || tx.user.currentPackage?.slug || 'basic')}
                                                        {tx.fromPackageName || tx.user.currentPackage?.name || 'Basic'}
                                                    </div>
                                                    <span className="text-muted-foreground text-xs">{tx.transactionType === 'RENEWAL' ? '🔄' : '→'}</span>
                                                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${tx.transactionType === 'RENEWAL' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}`}>
                                                        {getSlugIcon(tx.package.slug)}
                                                        {tx.package.name}
                                                    </div>
                                                    {tx.transactionType === 'RENEWAL' && (
                                                        <span className="text-[10px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded font-medium">ต่ออายุ</span>
                                                    )}
                                                </div>

                                                {/* Amount */}
                                                <div className="min-w-[100px]">
                                                    <p className="text-base font-semibold text-foreground">฿{Number(tx.amount).toLocaleString()}</p>
                                                </div>

                                                {/* Date */}
                                                <div className="min-w-[120px] text-xs text-muted-foreground">
                                                    {new Date(tx.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </div>

                                                {/* Status */}
                                                <div className="min-w-[100px]">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${status.color}`}>
                                                        {status.icon} {status.label}
                                                    </span>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex gap-2 ml-auto">
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => setViewSlip(tx.slipImage)}
                                                        className="h-8 w-8"
                                                    >
                                                        <Eye size={15} />
                                                    </Button>
                                                    {tx.status === 'PENDING' && (
                                                        <>
                                                            <Button
                                                                onClick={() => setApproveId(tx.id)}
                                                                disabled={actionLoading === tx.id}
                                                                size="sm"
                                                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                                                            >
                                                                <Check size={14} /> อนุมัติ
                                                            </Button>
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                onClick={() => setRejectId(tx.id)}
                                                                disabled={actionLoading === tx.id}
                                                                className="font-medium"
                                                            >
                                                                <X size={14} /> ปฏิเสธ
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>

                                                {/* Admin Note */}
                                                {tx.adminNote && (
                                                    <div className="w-full mt-2">
                                                        <p className="text-xs text-rose-500 bg-rose-50 px-3 py-2 rounded-lg">
                                                            <span className="font-medium">หมายเหตุ:</span> {tx.adminNote}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center gap-1.5 mt-6">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                <Button
                                    key={p}
                                    variant={page === p ? "default" : "outline"}
                                    size="icon"
                                    onClick={() => setPage(p)}
                                    className="h-9 w-9 font-medium"
                                >
                                    {p}
                                </Button>
                            ))}
                        </div>
                    )}
            </TabsContent>

            <TabsContent value="slots">
                <Tabs defaultValue="" className="mb-6" onValueChange={(v) => { setSlotFilterStatus(v); setSlotPage(1); }}>
                    <TabsList>
                        <TabsTrigger value="">ทั้งหมด</TabsTrigger>
                        <TabsTrigger value="PENDING">รอตรวจสอบ</TabsTrigger>
                        <TabsTrigger value="APPROVED">อนุมัติแล้ว</TabsTrigger>
                        <TabsTrigger value="REJECTED">ถูกปฏิเสธ</TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                    {slotIsLoading ? (
                        <div className="p-12 text-center text-muted-foreground">
                            <CreditCard className="mx-auto mb-3 animate-pulse opacity-30" size={32} />
                            <p className="text-sm">กำลังโหลด...</p>
                        </div>
                    ) : slotPurchases.length === 0 ? (
                        <div className="p-12 text-center text-muted-foreground">
                            <CreditCard className="mx-auto mb-3 opacity-30" size={32} />
                            <p className="text-sm">ไม่พบรายการ</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {slotPurchases.map((sp: any) => {
                                const status = statusConfig[sp.status] || statusConfig.PENDING;
                                return (
                                    <div key={sp.id} className="p-5 hover:bg-accent transition-colors">
                                        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                            <Link href={`/users/${sp.user.id}`} className="flex items-center gap-3 min-w-[200px] group/user">
                                                <div className="w-9 h-9 bg-accent rounded-lg flex items-center justify-center text-muted-foreground">
                                                    <User size={18} />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm text-foreground group-hover/user:text-primary group-hover/user:underline transition-colors">{sp.user.fullName}</p>
                                                    <p className="text-xs text-muted-foreground">{sp.user.email}</p>
                                                </div>
                                            </Link>

                                            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground flex-1">
                                                <span className="bg-orange-50 text-orange-700 px-2 py-1 rounded font-medium flex items-center gap-1">
                                                    <Car size={12} /> +{sp.quantity} slot
                                                </span>
                                                <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded font-medium flex items-center gap-1">
                                                    <CreditCard size={12} /> ฿{Number(sp.totalAmount).toLocaleString()}
                                                </span>
                                                <span className="bg-muted px-2 py-1 rounded">
                                                    ปัจจุบันมี {sp.user.bonusListingSlots} slot
                                                </span>
                                                {sp.user.currentPackage && (
                                                    <span className="bg-muted px-2 py-1 rounded flex items-center gap-1">
                                                        {getSlugIcon(sp.user.currentPackage.slug)} {sp.user.currentPackage.name}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                                <span className={`text-xs px-2 py-1 rounded font-medium flex items-center gap-1 ${status.color}`}>
                                                    {status.icon} {status.label}
                                                </span>
                                                <p className="text-[11px] text-muted-foreground">
                                                    {new Date(sp.createdAt).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>

                                            <div className="flex gap-2 flex-shrink-0">
                                                <Button variant="outline" size="sm" onClick={() => setViewSlotSlip(sp.slipImage)} className="h-8">
                                                    <Eye size={14} className="mr-1" /> สลิป
                                                </Button>
                                                {sp.status === 'PENDING' && (
                                                    <>
                                                        <Button size="sm" onClick={() => setSlotApproveId(sp.id)} className="h-8 font-medium bg-emerald-600 hover:bg-emerald-700 text-white">
                                                            <Check size={14} className="mr-1" /> อนุมัติ
                                                        </Button>
                                                        <Button variant="destructive" size="sm" onClick={() => setSlotRejectId(sp.id)} className="h-8 font-medium">
                                                            <X size={14} className="mr-1" /> ปฏิเสธ
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        {sp.adminNote && (
                                            <p className="text-xs text-rose-600 mt-2 ml-12">หมายเหตุ: {sp.adminNote}</p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {slotTotalPages > 1 && (
                    <div className="flex justify-center gap-1 mt-4">
                        {Array.from({ length: slotTotalPages }, (_, i) => i + 1).map(p => (
                            <Button key={p} variant={p === slotPage ? 'default' : 'outline'} size="sm" onClick={() => setSlotPage(p)} className="h-8 w-8 p-0">
                                {p}
                            </Button>
                        ))}
                    </div>
                )}
            </TabsContent>
            </Tabs>

            {/* Slot slip viewer */}
            {viewSlotSlip && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setViewSlotSlip(null)} />
                    <div className="relative max-w-2xl w-full bg-white rounded-xl overflow-hidden">
                        <button onClick={() => setViewSlotSlip(null)} className="absolute top-3 right-3 z-10 bg-white/90 rounded-full p-1.5 shadow"><X size={16} /></button>
                        <img src={viewSlotSlip} alt="Slip" className="w-full" />
                    </div>
                </div>
            )}

            {/* Slot approve confirm */}
            {slotApproveId && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60" onClick={() => setSlotApproveId(null)} />
                    <div className="relative bg-white rounded-xl p-6 max-w-sm w-full">
                        <h3 className="font-bold mb-2">ยืนยันการอนุมัติ?</h3>
                        <p className="text-sm text-muted-foreground mb-4">ระบบจะเพิ่ม slot ให้ user ทันที</p>
                        <div className="flex gap-2 justify-end">
                            <Button variant="outline" size="sm" onClick={() => setSlotApproveId(null)}>ยกเลิก</Button>
                            <Button size="sm" onClick={handleSlotApprove} disabled={actionLoading === slotApproveId} className="bg-emerald-600 hover:bg-emerald-700">
                                {actionLoading === slotApproveId ? 'กำลังอนุมัติ...' : 'อนุมัติ'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Slot reject with note */}
            {slotRejectId && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60" onClick={() => { setSlotRejectId(null); setSlotRejectNote(''); }} />
                    <div className="relative bg-white rounded-xl p-6 max-w-sm w-full">
                        <h3 className="font-bold mb-2">เหตุผลที่ปฏิเสธ</h3>
                        <textarea
                            value={slotRejectNote}
                            onChange={(e) => setSlotRejectNote(e.target.value)}
                            placeholder="เช่น สลิปไม่ชัด / ยอดไม่ตรง"
                            className="w-full h-24 p-3 border border-border rounded-lg text-sm mb-3"
                        />
                        <div className="flex gap-2 justify-end">
                            <Button variant="outline" size="sm" onClick={() => { setSlotRejectId(null); setSlotRejectNote(''); }}>ยกเลิก</Button>
                            <Button size="sm" variant="destructive" onClick={handleSlotReject} disabled={actionLoading === slotRejectId}>
                                {actionLoading === slotRejectId ? 'กำลังปฏิเสธ...' : 'ปฏิเสธ'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Slip Viewer Modal */}
            {viewSlip && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setViewSlip(null)} />
                    <div className="relative z-10 bg-card rounded-xl shadow-lg max-w-lg w-full overflow-hidden">
                        <div className="p-4 border-b border-border flex justify-between items-center">
                            <h3 className="font-semibold text-foreground">สลิปการโอนเงิน</h3>
                            <Button variant="ghost" size="icon" onClick={() => setViewSlip(null)} className="h-8 w-8">
                                <X size={18} />
                            </Button>
                        </div>
                        <div className="p-4">
                            <img src={viewSlip} alt="Payment Slip" className="w-full rounded-lg" />
                        </div>
                    </div>
                </div>
            )}

            {/* Approve Confirmation Modal */}
            {approveId && (() => {
                const tx = transactions.find(t => t.id === approveId);
                if (!tx) return null;
                return (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setApproveId(null)} />
                        <div className="relative z-10 bg-card rounded-xl shadow-lg max-w-md w-full overflow-hidden">
                            <div className="p-6">
                                {/* Icon */}
                                <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle className="text-emerald-500" size={24} />
                                </div>
                                <h3 className="text-lg font-semibold text-center text-foreground mb-1">ยืนยันการอนุมัติ</h3>
                                <p className="text-sm text-center text-muted-foreground mb-5">ตรวจสอบรายละเอียดก่อนอนุมัติ</p>

                                {/* Transaction Detail Card */}
                                <div className="bg-muted rounded-xl p-4 space-y-3 mb-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 bg-card rounded-lg border border-border flex items-center justify-center text-muted-foreground flex-shrink-0">
                                            <User size={16} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-foreground">{tx.user.fullName}</p>
                                            <p className="text-xs text-muted-foreground">{tx.user.email}</p>
                                        </div>
                                    </div>
                                    <div className="border-t border-border pt-3 flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-1.5 bg-card border border-border px-2.5 py-1 rounded-md text-xs font-medium text-muted-foreground">
                                                {getSlugIcon(tx.user.currentPackage?.slug || 'basic')}
                                                {tx.user.currentPackage?.name || 'Basic'}
                                            </div>
                                            <span className="text-muted-foreground text-xs">→</span>
                                            <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md text-xs font-semibold text-emerald-700">
                                                {getSlugIcon(tx.package.slug)}
                                                {tx.package.name}
                                            </div>
                                        </div>
                                        <p className="text-base font-bold text-foreground">฿{Number(tx.amount).toLocaleString()}</p>
                                    </div>
                                </div>

                                <p className="text-xs text-center text-muted-foreground mb-5">
                                    เมื่ออนุมัติแล้ว ผู้ใช้จะได้รับสิทธิ์แพ็กเกจ <span className="font-semibold text-emerald-600">{tx.package.name}</span> ทันที
                                </p>

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

            {/* Edit Package Modal */}
            {editingPkg && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditingPkg(null)} />
                    <div className="bg-card rounded-2xl shadow-2xl w-full max-w-lg mx-4 relative z-10 max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-border">
                            <h3 className="text-lg font-bold text-foreground">แก้ไขแพ็กเกจ: {editingPkg.name}</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1">ชื่อ (EN)</label>
                                    <input className="w-full border rounded-lg px-3 py-2 text-sm" value={editForm.name || ''} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1">ชื่อ (TH)</label>
                                    <input className="w-full border rounded-lg px-3 py-2 text-sm" value={editForm.nameTh || ''} onChange={e => setEditForm({...editForm, nameTh: e.target.value})} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1">Slug</label>
                                    <input className="w-full border rounded-lg px-3 py-2 text-sm bg-muted" value={editForm.slug || ''} onChange={e => setEditForm({...editForm, slug: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1">ราคา (บาท/เดือน)</label>
                                    <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm" value={editForm.price ?? 0} onChange={e => setEditForm({...editForm, price: Number(e.target.value)})} />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1">จำนวนประกาศ</label>
                                    <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm" value={editForm.maxListings ?? 0} onChange={e => setEditForm({...editForm, maxListings: Number(e.target.value)})} />
                                    <p className="text-[10px] text-muted-foreground mt-0.5">-1 = ไม่จำกัด</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1">รูป/ประกาศ</label>
                                    <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm" value={editForm.maxPhotosPerListing ?? 0} onChange={e => setEditForm({...editForm, maxPhotosPerListing: Number(e.target.value)})} />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1">ระยะเวลา (วัน)</label>
                                    <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm" value={editForm.listingDurationDays ?? 0} onChange={e => setEditForm({...editForm, listingDurationDays: Number(e.target.value)})} />
                                    <p className="text-[10px] text-muted-foreground mt-0.5">-1 = ไม่หมดอายุ</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1">ดันอัตโนมัติ (ครั้ง/วัน)</label>
                                    <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm" value={editForm.autoBumpPerDay ?? 0} onChange={e => setEditForm({...editForm, autoBumpPerDay: Number(e.target.value)})} />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1">ดันเอง (ครั้ง/คัน/วัน)</label>
                                    <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm" value={editForm.manualBumpPerDay ?? 0} onChange={e => setEditForm({...editForm, manualBumpPerDay: Number(e.target.value)})} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1">ลำดับการค้นหา</label>
                                    <select className="w-full border rounded-lg px-3 py-2 text-sm" value={editForm.searchPriority || 'normal'} onChange={e => setEditForm({...editForm, searchPriority: e.target.value})}>
                                        <option value="normal">ปกติ</option>
                                        <option value="higher">ดีกว่าปกติ</option>
                                        <option value="top">ลำดับต้น</option>
                                        <option value="priority">บนสุด</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1">Badge</label>
                                    <input className="w-full border rounded-lg px-3 py-2 text-sm" value={editForm.badge || ''} onChange={e => setEditForm({...editForm, badge: e.target.value || null})} placeholder="เช่น Verified Seller" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1">ลำดับแสดง</label>
                                    <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm" value={editForm.sortOrder ?? 0} onChange={e => setEditForm({...editForm, sortOrder: Number(e.target.value)})} />
                                </div>
                                <div className="flex items-end pb-1">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={editForm.isActive ?? true} onChange={e => setEditForm({...editForm, isActive: e.target.checked})} className="rounded" />
                                        <span className="text-sm text-foreground">เปิดใช้งาน</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-border flex gap-3">
                            <Button variant="outline" className="flex-1" onClick={() => setEditingPkg(null)}>ยกเลิก</Button>
                            <Button className="flex-1 bg-brand-primary hover:bg-brand-primary/90 text-white" onClick={handleSaveEdit} disabled={editSaving}>
                                {editSaving ? 'กำลังบันทึก...' : 'บันทึก'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Package Confirmation Modal */}
            {deletePackageId && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeletePackageId(null)} />
                    <div className="bg-card rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 relative z-10">
                        <div className="text-center">
                            <div className="w-14 h-14 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="text-rose-500" size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-foreground mb-1">ยืนยันการลบแพ็กเกจ</h3>
                            <p className="text-sm text-muted-foreground mb-5">คุณต้องการลบแพ็กเกจนี้ใช่หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้</p>
                            <div className="flex gap-3">
                                <Button variant="outline" className="flex-1" onClick={() => setDeletePackageId(null)}>
                                    ยกเลิก
                                </Button>
                                <Button variant="destructive" className="flex-1" onClick={() => handleDeletePackage()}>
                                    ยืนยันลบ
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {rejectId && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setRejectId(null)} />
                    <div className="relative z-10 bg-card rounded-xl shadow-lg max-w-md w-full overflow-hidden">
                        <div className="p-6">
                            <div className="w-12 h-12 bg-rose-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <XCircle className="text-rose-500" size={24} />
                            </div>
                            <h3 className="text-lg font-semibold text-center text-foreground mb-1.5">ปฏิเสธรายการนี้?</h3>
                            <p className="text-sm text-center text-muted-foreground mb-5">ระบุเหตุผลในการปฏิเสธ (ไม่บังคับ)</p>
                            <textarea
                                value={rejectNote}
                                onChange={e => setRejectNote(e.target.value)}
                                placeholder="เหตุผลในการปฏิเสธ..."
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
                                    ยืนยันปฏิเสธ
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
