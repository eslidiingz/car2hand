"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { apiFetch } from "@/lib/api";
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
    Plus,
    Pencil,
    Trash2
} from "lucide-react";

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
    basic: <Zap className="text-slate-400" size={18} />,
    standard: <Star className="text-blue-500" size={18} />,
    professional: <Rocket className="text-orange-500" size={18} />,
    premium: <Crown className="text-yellow-500" size={18} />,
};

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    PENDING: { label: 'รอตรวจสอบ', color: 'bg-yellow-100 text-yellow-700', icon: <Clock size={14} /> },
    APPROVED: { label: 'อนุมัติแล้ว', color: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle size={14} /> },
    REJECTED: { label: 'ถูกปฏิเสธ', color: 'bg-red-100 text-red-700', icon: <XCircle size={14} /> },
};

function getSlugIcon(slug: string) {
    return slugIcons[slug] || <Package size={18} />;
}

export default function AdminPackagesPage() {
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
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // --- Fetch Data ---
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

    // --- Transaction Actions ---
    const handleApprove = async (id: string) => {
        if (!confirm('ยืนยันการอนุมัติรายการนี้?')) return;
        setActionLoading(id);
        try {
            await apiFetch(`/admin/packages/transactions/${id}/approve`, { method: 'POST' });
            fetchTransactions();
        } catch (error: any) {
            alert(error.message || 'เกิดข้อผิดพลาด');
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
        } catch (error: any) {
            alert(error.message || 'เกิดข้อผิดพลาด');
        } finally {
            setActionLoading(null);
        }
    };

    // --- Package Actions ---
    const handleDeletePackage = async (id: string) => {
        if (!confirm('ยืนยันการลบแพ็กเกจนี้?')) return;
        try {
            const result = await apiFetch(`/admin/packages/${id}`, { method: 'DELETE' });
            alert(result.message);
            fetchPackages();
        } catch (error: any) {
            alert(error.message || 'เกิดข้อผิดพลาด');
        }
    };

    const pendingCount = transactions.filter(t => t.status === 'PENDING').length;

    return (
        <DashboardLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                        <Package className="text-primary h-8 w-8" /> จัดการแพ็กเกจ
                    </h1>
                    <p className="text-slate-500 mt-1 text-sm">จัดการ Master Data แพ็กเกจ และตรวจสอบคำขออัพเกรด</p>
                </div>
                {pendingCount > 0 && (
                    <div className="flex items-center gap-2 bg-yellow-50 text-yellow-700 px-4 py-2 rounded-xl text-sm font-bold border border-yellow-200">
                        <AlertTriangle size={18} />
                        {pendingCount} รายการรอตรวจสอบ
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-slate-200 pb-3">
                <button
                    onClick={() => setActiveTab('transactions')}
                    className={`px-5 py-2 rounded-t-xl text-sm font-bold transition ${activeTab === 'transactions' ? 'bg-primary text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    คำขออัพเกรด
                </button>
                <button
                    onClick={() => setActiveTab('packages')}
                    className={`px-5 py-2 rounded-t-xl text-sm font-bold transition ${activeTab === 'packages' ? 'bg-primary text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    จัดการแพ็กเกจ
                </button>
            </div>

            {/* ====== PACKAGES TAB ====== */}
            {activeTab === 'packages' && (
                <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden">
                    <div className="divide-y divide-slate-50">
                        {packages.map(pkg => (
                            <div key={pkg.id} className={`p-5 ${!pkg.isActive ? 'opacity-50' : ''}`}>
                                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                    <div className="flex items-center gap-3 min-w-[200px]">
                                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center">
                                            {getSlugIcon(pkg.slug)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-slate-800">{pkg.name}</p>
                                            <p className="text-xs text-slate-400">{pkg.nameTh}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-3 text-xs text-slate-600">
                                        <span className="bg-slate-50 px-2 py-1 rounded">฿{Number(pkg.price).toLocaleString()}/เดือน</span>
                                        <span className="bg-slate-50 px-2 py-1 rounded">{pkg.maxListings === -1 ? '∞' : pkg.maxListings} ประกาศ</span>
                                        <span className="bg-slate-50 px-2 py-1 rounded">{pkg.maxPhotosPerListing} รูป</span>
                                        <span className="bg-slate-50 px-2 py-1 rounded">{pkg.listingDurationDays === -1 ? 'ไม่หมดอายุ' : `${pkg.listingDurationDays} วัน`}</span>
                                    </div>
                                    <div className="flex gap-3 ml-auto text-xs text-slate-400">
                                        <span>{pkg._count?.users || 0} ผู้ใช้</span>
                                        <span>{pkg._count?.transactions || 0} รายการ</span>
                                    </div>
                                    <div className="flex gap-2">
                                        {!pkg.isActive && (
                                            <span className="text-xs text-red-500 font-bold">ปิดใช้งาน</span>
                                        )}
                                        <button
                                            onClick={() => handleDeletePackage(pkg.id)}
                                            className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition"
                                            title="ลบ"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ====== TRANSACTIONS TAB ====== */}
            {activeTab === 'transactions' && (
                <>
                    {/* Filter Tabs */}
                    <div className="flex gap-2 mb-6">
                        {[
                            { value: '', label: 'ทั้งหมด' },
                            { value: 'PENDING', label: 'รอตรวจสอบ' },
                            { value: 'APPROVED', label: 'อนุมัติแล้ว' },
                            { value: 'REJECTED', label: 'ถูกปฏิเสธ' },
                        ].map(tab => (
                            <button
                                key={tab.value}
                                onClick={() => { setFilterStatus(tab.value); setPage(1); }}
                                className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
                                    filterStatus === tab.value
                                        ? 'bg-primary text-white shadow-md'
                                        : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden">
                        {isLoading ? (
                            <div className="p-12 text-center text-slate-400">
                                <div className="animate-spin text-3xl mb-3">⏳</div>
                                <p className="text-sm font-bold">กำลังโหลด...</p>
                            </div>
                        ) : transactions.length === 0 ? (
                            <div className="p-12 text-center text-slate-400">
                                <Package className="mx-auto mb-3 opacity-30" size={48} />
                                <p className="text-sm font-bold">ไม่พบรายการ</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-50">
                                {transactions.map(tx => {
                                    const status = statusConfig[tx.status] || statusConfig.PENDING;
                                    return (
                                        <div key={tx.id} className="p-5 hover:bg-slate-50/50 transition">
                                            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                                {/* User Info */}
                                                <div className="flex items-center gap-3 min-w-[200px]">
                                                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                                                        <User size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm text-slate-800">{tx.user.fullName}</p>
                                                        <p className="text-xs text-slate-400">{tx.user.email}</p>
                                                    </div>
                                                </div>

                                                {/* Package Info */}
                                                <div className="flex items-center gap-2 min-w-[160px]">
                                                    <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-500">
                                                        {getSlugIcon(tx.user.currentPackage?.slug || 'basic')}
                                                        {tx.user.currentPackage?.name || 'Basic'}
                                                    </div>
                                                    <span className="text-slate-300">→</span>
                                                    <div className="flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-lg text-xs font-bold text-blue-700">
                                                        {getSlugIcon(tx.package.slug)}
                                                        {tx.package.name}
                                                    </div>
                                                </div>

                                                {/* Amount */}
                                                <div className="min-w-[100px]">
                                                    <p className="text-lg font-bold text-slate-800">฿{Number(tx.amount).toLocaleString()}</p>
                                                </div>

                                                {/* Date */}
                                                <div className="min-w-[120px] text-xs text-slate-400">
                                                    {new Date(tx.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </div>

                                                {/* Status */}
                                                <div className="min-w-[100px]">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${status.color}`}>
                                                        {status.icon} {status.label}
                                                    </span>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex gap-2 ml-auto">
                                                    <button
                                                        onClick={() => setViewSlip(tx.slipImage)}
                                                        className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 transition"
                                                        title="ดูสลิป"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    {tx.status === 'PENDING' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleApprove(tx.id)}
                                                                disabled={actionLoading === tx.id}
                                                                className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition flex items-center gap-1 disabled:opacity-50"
                                                            >
                                                                <Check size={14} /> อนุมัติ
                                                            </button>
                                                            <button
                                                                onClick={() => setRejectId(tx.id)}
                                                                disabled={actionLoading === tx.id}
                                                                className="px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition flex items-center gap-1 disabled:opacity-50"
                                                            >
                                                                <X size={14} /> ปฏิเสธ
                                                            </button>
                                                        </>
                                                    )}
                                                </div>

                                                {/* Admin Note */}
                                                {tx.adminNote && (
                                                    <div className="w-full mt-2">
                                                        <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">
                                                            <span className="font-bold">หมายเหตุ:</span> {tx.adminNote}
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
                        <div className="flex justify-center gap-2 mt-6">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                <button
                                    key={p}
                                    onClick={() => setPage(p)}
                                    className={`w-10 h-10 rounded-xl text-sm font-bold transition ${
                                        page === p ? 'bg-primary text-white' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'
                                    }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Slip Viewer Modal */}
            {viewSlip && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setViewSlip(null)} />
                    <div className="relative z-10 bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
                        <div className="p-4 border-b flex justify-between items-center">
                            <h3 className="font-bold text-slate-800">สลิปการโอนเงิน</h3>
                            <button onClick={() => setViewSlip(null)} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-4">
                            <img src={viewSlip} alt="Payment Slip" className="w-full rounded-xl" />
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {rejectId && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setRejectId(null)} />
                    <div className="relative z-10 bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
                        <div className="p-6">
                            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <XCircle className="text-red-500" size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-center text-slate-800 mb-2">ปฏิเสธรายการนี้?</h3>
                            <p className="text-sm text-center text-slate-500 mb-6">ระบุเหตุผลในการปฏิเสธ (ไม่บังคับ)</p>
                            <textarea
                                value={rejectNote}
                                onChange={e => setRejectNote(e.target.value)}
                                placeholder="เหตุผลในการปฏิเสธ..."
                                className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-200 resize-none"
                                rows={3}
                            />
                            <div className="flex gap-3 mt-4">
                                <button
                                    onClick={() => { setRejectId(null); setRejectNote(''); }}
                                    className="flex-1 py-3 rounded-xl font-bold text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    onClick={handleReject}
                                    disabled={actionLoading === rejectId}
                                    className="flex-1 py-3 rounded-xl font-bold text-sm text-white bg-red-500 hover:bg-red-600 transition disabled:opacity-50"
                                >
                                    ยืนยันปฏิเสธ
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
