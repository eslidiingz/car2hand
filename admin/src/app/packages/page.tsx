"use client";

import { useState, useEffect } from "react";
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
    Trash2
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
    adminNote: string | null;
    reviewedAt: string | null;
    createdAt: string;
    user: TransactionUser;
    package: { id: string; name: string; nameTh: string; slug: string; price: number };
}

const slugIcons: Record<string, React.ReactNode> = {
    basic: <Zap className="text-slate-400" size={16} />,
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
    const { refreshUpgrades: refreshUpgradeBadge } = usePendingCounts();
    const [activeTab, setActiveTab] = useState<'packages' | 'transactions'>('transactions');
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
                    <h1 className="text-2xl font-semibold text-slate-800 flex items-center gap-2">
                        <Package className="text-primary" /> จัดการแพ็กเกจ
                    </h1>
                    <p className="text-slate-500 mt-1 text-sm">จัดการ Master Data แพ็กเกจ และตรวจสอบคำขออัพเกรด</p>
                </div>
                {pendingCount > 0 && (
                    <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg text-sm font-medium border border-amber-200">
                        <AlertTriangle size={16} />
                        {pendingCount} รายการรอตรวจสอบ
                    </div>
                )}
            </div>

            <Tabs defaultValue="transactions" className="space-y-6" onValueChange={(v) => setActiveTab(v as any)}>
                <TabsList>
                    <TabsTrigger value="transactions">
                        <Package size={16} className="mr-1.5" /> คำขออัพเกรด
                    </TabsTrigger>
                    <TabsTrigger value="packages">
                        <Star size={16} className="mr-1.5" /> จัดการแพ็กเกจ
                    </TabsTrigger>
                </TabsList>

            <TabsContent value="packages">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="divide-y divide-slate-100">
                        {packages.map(pkg => (
                            <div key={pkg.id} className={`p-5 ${!pkg.isActive ? 'opacity-50' : ''}`}>
                                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                    <div className="flex items-center gap-3 min-w-[200px]">
                                        <div className="w-9 h-9 bg-slate-50 rounded-lg flex items-center justify-center">
                                            {getSlugIcon(pkg.slug)}
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm text-slate-800">{pkg.name}</p>
                                            <p className="text-xs text-slate-400">{pkg.nameTh}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                                        <span className="bg-slate-50 px-2 py-1 rounded">฿{Number(pkg.price).toLocaleString()}/เดือน</span>
                                        <span className="bg-slate-50 px-2 py-1 rounded">{pkg.maxListings === -1 ? '∞' : pkg.maxListings} ประกาศ</span>
                                        <span className="bg-slate-50 px-2 py-1 rounded">{pkg.maxPhotosPerListing} รูป</span>
                                        <span className="bg-slate-50 px-2 py-1 rounded">{pkg.listingDurationDays === -1 ? 'ไม่หมดอายุ' : `${pkg.listingDurationDays} วัน`}</span>
                                    </div>
                                    <div className="flex gap-3 ml-auto text-xs text-slate-400">
                                        <span>{pkg._count?.users || 0} ผู้ใช้</span>
                                        <span>{pkg._count?.transactions || 0} รายการ</span>
                                    </div>
                                    <div className="flex gap-2 items-center">
                                        {!pkg.isActive && (
                                            <span className="text-xs text-rose-500 font-medium">ปิดใช้งาน</span>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setDeletePackageId(pkg.id)}
                                            className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                                        >
                                            <Trash2 size={14} />
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
                    <Tabs defaultValue="" className="space-y-4" onValueChange={(v) => { setFilterStatus(v); setPage(1); }}>
                        <TabsList>
                            <TabsTrigger value="">ทั้งหมด</TabsTrigger>
                            <TabsTrigger value="PENDING">รอตรวจสอบ</TabsTrigger>
                            <TabsTrigger value="APPROVED">อนุมัติแล้ว</TabsTrigger>
                            <TabsTrigger value="REJECTED">ถูกปฏิเสธ</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        {isLoading ? (
                            <div className="p-12 text-center text-slate-400">
                                <Package className="mx-auto mb-3 animate-pulse opacity-30" size={32} />
                                <p className="text-sm">กำลังโหลด...</p>
                            </div>
                        ) : transactions.length === 0 ? (
                            <div className="p-12 text-center text-slate-400">
                                <Package className="mx-auto mb-3 opacity-30" size={32} />
                                <p className="text-sm">ไม่พบรายการ</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {transactions.map(tx => {
                                    const status = statusConfig[tx.status] || statusConfig.PENDING;
                                    return (
                                        <div key={tx.id} className="p-5 hover:bg-slate-50 transition-colors">
                                            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                                {/* User Info */}
                                                <div className="flex items-center gap-3 min-w-[200px]">
                                                    <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500">
                                                        <User size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-sm text-slate-800">{tx.user.fullName}</p>
                                                        <p className="text-xs text-slate-400">{tx.user.email}</p>
                                                    </div>
                                                </div>

                                                {/* Package Info */}
                                                <div className="flex items-center gap-2 min-w-[160px]">
                                                    <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md text-xs font-medium text-slate-500">
                                                        {getSlugIcon(tx.user.currentPackage?.slug || 'basic')}
                                                        {tx.user.currentPackage?.name || 'Basic'}
                                                    </div>
                                                    <span className="text-slate-300">→</span>
                                                    <div className="flex items-center gap-1.5 bg-blue-50 px-2.5 py-1 rounded-md text-xs font-medium text-blue-700">
                                                        {getSlugIcon(tx.package.slug)}
                                                        {tx.package.name}
                                                    </div>
                                                </div>

                                                {/* Amount */}
                                                <div className="min-w-[100px]">
                                                    <p className="text-base font-semibold text-slate-800">฿{Number(tx.amount).toLocaleString()}</p>
                                                </div>

                                                {/* Date */}
                                                <div className="min-w-[120px] text-xs text-slate-400">
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
            </Tabs>

            {/* Slip Viewer Modal */}
            {viewSlip && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setViewSlip(null)} />
                    <div className="relative z-10 bg-white rounded-xl shadow-lg max-w-lg w-full overflow-hidden">
                        <div className="p-4 border-b border-slate-200 flex justify-between items-center">
                            <h3 className="font-semibold text-slate-800">สลิปการโอนเงิน</h3>
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
                        <div className="relative z-10 bg-white rounded-xl shadow-lg max-w-md w-full overflow-hidden">
                            <div className="p-6">
                                {/* Icon */}
                                <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle className="text-emerald-500" size={24} />
                                </div>
                                <h3 className="text-lg font-semibold text-center text-slate-800 mb-1">ยืนยันการอนุมัติ</h3>
                                <p className="text-sm text-center text-slate-400 mb-5">ตรวจสอบรายละเอียดก่อนอนุมัติ</p>

                                {/* Transaction Detail Card */}
                                <div className="bg-slate-50 rounded-xl p-4 space-y-3 mb-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 bg-white rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 flex-shrink-0">
                                            <User size={16} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800">{tx.user.fullName}</p>
                                            <p className="text-xs text-slate-400">{tx.user.email}</p>
                                        </div>
                                    </div>
                                    <div className="border-t border-slate-200 pt-3 flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1 rounded-md text-xs font-medium text-slate-500">
                                                {getSlugIcon(tx.user.currentPackage?.slug || 'basic')}
                                                {tx.user.currentPackage?.name || 'Basic'}
                                            </div>
                                            <span className="text-slate-300 text-xs">→</span>
                                            <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md text-xs font-semibold text-emerald-700">
                                                {getSlugIcon(tx.package.slug)}
                                                {tx.package.name}
                                            </div>
                                        </div>
                                        <p className="text-base font-bold text-slate-800">฿{Number(tx.amount).toLocaleString()}</p>
                                    </div>
                                </div>

                                <p className="text-xs text-center text-slate-400 mb-5">
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

            {/* Delete Package Confirmation Modal */}
            {deletePackageId && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeletePackageId(null)} />
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 relative z-10">
                        <div className="text-center">
                            <div className="w-14 h-14 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="text-rose-500" size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 mb-1">ยืนยันการลบแพ็กเกจ</h3>
                            <p className="text-sm text-slate-500 mb-5">คุณต้องการลบแพ็กเกจนี้ใช่หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้</p>
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
                    <div className="relative z-10 bg-white rounded-xl shadow-lg max-w-md w-full overflow-hidden">
                        <div className="p-6">
                            <div className="w-12 h-12 bg-rose-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <XCircle className="text-rose-500" size={24} />
                            </div>
                            <h3 className="text-lg font-semibold text-center text-slate-800 mb-1.5">ปฏิเสธรายการนี้?</h3>
                            <p className="text-sm text-center text-slate-500 mb-5">ระบุเหตุผลในการปฏิเสธ (ไม่บังคับ)</p>
                            <textarea
                                value={rejectNote}
                                onChange={e => setRejectNote(e.target.value)}
                                placeholder="เหตุผลในการปฏิเสธ..."
                                className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400 resize-none transition-colors"
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
