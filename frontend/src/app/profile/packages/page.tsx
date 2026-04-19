"use client";

import React, { useState, useEffect } from 'react';
import {
    Crown,
    Star,
    Zap,
    Rocket,
    Check,
    ArrowRight,
    CreditCard,
    Upload,
    Clock,
    AlertTriangle,
    X,
    ImageIcon,
    RotateCcw,
    ArrowUp,
    Plus,
    ShoppingBag,
} from 'lucide-react';
import SlotPurchaseModal from '@/components/SlotPurchaseModal';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

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
}

interface Transaction {
    id: string;
    amount: string;
    slipImage: string;
    status: string;
    adminNote: string | null;
    createdAt: string;
    type?: string;
    proratedCredit?: number;
    package: {
        id: string;
        name: string;
        nameTh: string;
        slug: string;
    };
}

interface ProrateInfo {
    originalPrice: number;
    proratedCredit: number;
    daysRemaining: number;
    finalPrice: number;
}

interface CurrentPackage {
    id: string;
    name: string;
    nameTh: string;
    slug: string;
    maxListings: number;
    maxPhotosPerListing: number;
    listingDurationDays: number;
    expiresAt?: string;
}

// Icon/color maps by slug
const packageIcons: Record<string, React.ReactNode> = {
    basic: <Zap className="text-gray-400" size={28} />,
    standard: <Star className="text-blue-500" size={28} />,
    professional: <Rocket className="text-orange-500" size={28} />,
    premium: <Crown className="text-yellow-500" size={28} />,
};

const packageColors: Record<string, { bg: string; btn: string }> = {
    basic: { bg: 'bg-gray-50', btn: 'bg-gray-200 text-gray-600 cursor-default' },
    standard: { bg: 'bg-blue-50', btn: 'bg-blue-600 hover:bg-blue-700 text-white' },
    professional: { bg: 'bg-orange-50', btn: 'bg-orange-500 hover:bg-orange-600 text-white' },
    premium: { bg: 'bg-yellow-50', btn: 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white' },
};

function getIcon(slug: string) {
    return packageIcons[slug] || <Zap className="text-gray-400" size={28} />;
}
function getColor(slug: string) {
    return packageColors[slug] || packageColors.basic;
}

export default function PackagesPage() {
    const [packages, setPackages] = useState<PackageData[]>([]);
    const [currentPkg, setCurrentPkg] = useState<CurrentPackage | null>(null);
    const [usage, setUsage] = useState({ activeListings: 0, maxListings: 3, packageMaxListings: 3, bonusListingSlots: 0 });
    const [showSlotModal, setShowSlotModal] = useState(false);
    const [slotRefreshKey, setSlotRefreshKey] = useState(0);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState<PackageData | null>(null);
    const [slipFile, setSlipFile] = useState<File | null>(null);
    const [slipPreview, setSlipPreview] = useState<string | null>(null);
    const [dragOverSlip, setDragOverSlip] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [paymentInfo, setPaymentInfo] = useState<Record<string, string>>({});
    const [isRenewal, setIsRenewal] = useState(false);
    const [prorateInfo, setProrateInfo] = useState<ProrateInfo | null>(null);
    const [prorateLoading, setProrateLoading] = useState(false);
    const [showAllTx, setShowAllTx] = useState(false);
    const [slotPurchases, setSlotPurchases] = useState<any[]>([]);
    const [showAllSlotTx, setShowAllSlotTx] = useState(false);

    const getUserId = () => {
        const stored = localStorage.getItem('user') || sessionStorage.getItem('user');
        if (stored) {
            try { return JSON.parse(stored).id; } catch { return null; }
        }
        return null;
    };

    const getAuthToken = (): string | null => {
        const stored = localStorage.getItem('user') || sessionStorage.getItem('user');
        if (!stored) return null;
        try { return JSON.parse(stored).token || null; } catch { return null; }
    };

    const getDaysRemaining = (expiresAt?: string) => {
        if (!expiresAt) return null;
        const now = new Date();
        const exp = new Date(expiresAt);
        const diff = exp.getTime() - now.getTime();
        return Math.ceil(diff / 86400000);
    };

    const fetchProrateInfo = async (targetPackageId: string) => {
        const userId = getUserId();
        if (!userId) return;
        setProrateLoading(true);
        try {
            const token = getAuthToken();
            const res = await fetch(`${API_URL}/packages/upgrade-price?targetPackageId=${targetPackageId}`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            if (res.ok) {
                const data = await res.json();
                setProrateInfo(data);
            } else {
                setProrateInfo(null);
            }
        } catch {
            setProrateInfo(null);
        } finally {
            setProrateLoading(false);
        }
    };

    const hasPendingTransaction = transactions.some(tx => tx.status === 'PENDING');

    const openUpgradeModal = (pkg: PackageData, renewal: boolean) => {
        if (hasPendingTransaction) {
            setErrorMsg('คุณมีรายการรอตรวจสอบอยู่แล้ว กรุณารอผลการตรวจสอบ');
            setTimeout(() => setErrorMsg(''), 5000);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        setSelectedPackage(pkg);
        setIsRenewal(renewal);
        setProrateInfo(null);
        setSlipFile(null);
        setSlipPreview(null);
        setShowUpgradeModal(true);
        if (!renewal) {
            fetchProrateInfo(pkg.id);
        }
    };

    useEffect(() => {
        const userId = getUserId();
        if (!userId) return;

        const token = getAuthToken();

        fetch(`${API_URL}/packages`)
            .then(r => r.json())
            .then(data => setPackages(data.packages || []))
            .catch(console.error);

        fetch(`${API_URL}/packages/my`, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        })
            .then(r => r.json())
            .then(data => {
                setCurrentPkg(data.currentPackage || null);
                setUsage(data.usage || { activeListings: 0, maxListings: 3, packageMaxListings: 3, bonusListingSlots: 0 });
            })
            .catch(console.error);

        fetch(`${API_URL}/slots/purchases`, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        })
            .then(r => r.json())
            .then(data => setSlotPurchases(data.purchases || []))
            .catch(console.error);
    // slotRefreshKey triggers refetch when slot purchase succeeds
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [slotRefreshKey]);

    useEffect(() => {
        const userId = getUserId();
        if (!userId) return;

        const token = getAuthToken();

        fetch(`${API_URL}/packages/transactions`, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        })
            .then(r => r.json())
            .then(data => setTransactions(data.transactions || []))
            .catch(console.error);

        fetch(`${API_URL}/packages/payment-info`)
            .then(r => r.json())
            .then(data => setPaymentInfo(data || {}))
            .catch(console.error);
    }, []);

    const handleSlipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSlipFile(file);
            const reader = new FileReader();
            reader.onload = () => setSlipPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmitUpgrade = async () => {
        if (!selectedPackage || !slipFile) return;
        const userId = getUserId();
        if (!userId) return;

        setIsSubmitting(true);
        try {
            const buffer = await slipFile.arrayBuffer();
            const bytes = new Uint8Array(buffer);
            let binary = '';
            const chunkSize = 8192;
            for (let i = 0; i < bytes.length; i += chunkSize) {
                binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
            }
            const base64 = btoa(binary);

            const token = getAuthToken();
            const res = await fetch(`${API_URL}/packages/upgrade`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    packageId: selectedPackage.id,
                    slipImage: {
                        buffer: base64,
                        filename: slipFile.name,
                        mimetype: slipFile.type
                    }
                })
            });

            const data = await res.json();
            if (res.ok) {
                setSuccessMsg(data.message);
                setShowUpgradeModal(false);
                setSlipFile(null);
                setSlipPreview(null);
                setSelectedPackage(null);
                window.scrollTo({ top: 0, behavior: 'smooth' });
                const txToken = getAuthToken();
                const txRes = await fetch(`${API_URL}/packages/transactions`, {
                    headers: txToken ? { 'Authorization': `Bearer ${txToken}` } : {}
                });
                const txData = await txRes.json();
                setTransactions(txData.transactions || []);
            } else {
                setErrorMsg(data.message || 'เกิดข้อผิดพลาด');
                setTimeout(() => setErrorMsg(''), 5000);
            }
        } catch (err) {
            console.error(err);
            setErrorMsg('เกิดข้อผิดพลาดในการส่งคำขอ');
            setTimeout(() => setErrorMsg(''), 5000);
        } finally {
            setIsSubmitting(false);
        }
    };

    const currentSortOrder = currentPkg
        ? packages.find(p => p.id === currentPkg.id || p.slug === currentPkg.slug)?.sortOrder ?? -1
        : packages.find(p => p.slug === 'basic' || p.price === 0)?.sortOrder ?? -1;

    const featureRows: { label: string; key: keyof PackageData; format?: (v: any) => React.ReactNode }[] = [
        { label: 'เหมาะสำหรับ', key: 'targetAudience' },
        { label: 'จำนวนประกาศ', key: 'maxListings', format: (v: number) => v === -1 ? 'ไม่จำกัด' : `${v} รายการ` },
        { label: 'จำนวนรูปสูงสุด', key: 'maxPhotosPerListing', format: (v: number) => `${v} รูป` },
        { label: 'ระยะเวลาประกาศ', key: 'listingDurationDays', format: (v: number) => v === -1 ? 'จนกว่าจะขายได้' : `${v} วัน` },
        { label: 'ระบบดันโพสต์', key: 'autoBumpPerDay', format: (v: number) => v === 0 ? 'ทำเอง (Manual)' : `อัตโนมัติ ${v} ครั้ง/วัน` },
        { label: 'ป้ายพิเศษ (Badge)', key: 'badge', format: (v: string | null) => v || 'ไม่มี' },
        { label: 'อันดับการค้นหา', key: 'searchPriority', format: (v: string) => ({ normal: 'ปกติ', higher: 'ดีกว่าทั่วไป', top: 'ลำดับต้นๆ', priority: 'บนสุด (Priority)' }[v] || v) },
    ];

    return (
        <div className="space-y-6">
            {/* Success Banner */}
            {successMsg && (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
                    <Check className="text-green-600 text-xl flex-shrink-0" />
                    <p className="text-green-800 font-bold text-sm">{successMsg}</p>
                    <button onClick={() => setSuccessMsg('')} className="ml-auto text-green-500 hover:text-green-700"><X /></button>
                </div>
            )}

            {/* Error Banner */}
            {errorMsg && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
                    <AlertTriangle className="text-red-600 text-xl flex-shrink-0" />
                    <p className="text-red-800 font-bold text-sm">{errorMsg}</p>
                    <button onClick={() => setErrorMsg('')} className="ml-auto text-red-500 hover:text-red-700"><X /></button>
                </div>
            )}

            {/* Pending Transaction Banner */}
            {hasPendingTransaction && !successMsg && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
                    <Clock className="text-amber-500 text-xl flex-shrink-0" />
                    <div>
                        <p className="text-amber-800 font-bold text-sm">มีคำขออัพเกรดรอตรวจสอบ</p>
                        <p className="text-amber-600 text-xs mt-0.5">ทีมงานจะตรวจสอบและอนุมัติภายใน 24 ชั่วโมง</p>
                    </div>
                </div>
            )}

            <h1 className="text-2xl font-bold text-gray-800">แพ็กเกจของฉัน</h1>

            {/* Current Package Status */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-3 mb-4">
                    <div className={`p-3 rounded-xl ${getColor(currentPkg?.slug || 'basic').bg}`}>
                        {getIcon(currentPkg?.slug || 'basic')}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-base font-bold text-gray-800 truncate">
                            {currentPkg?.name || 'Basic (Free)'}
                        </h2>
                        <p className="text-sm text-gray-500">
                            {!currentPkg ? 'แพ็กเกจฟรี' : `฿${Number(packages.find(p => p.id === currentPkg.id)?.price || 0).toLocaleString()}/เดือน`}
                        </p>
                    </div>
                </div>
                {/* Stats row */}
                <div className={`grid gap-3 mb-4 ${currentPkg?.expiresAt ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    <div className="bg-gray-50 px-3 py-2.5 rounded-xl">
                        <p className="text-[10px] text-gray-400">ประกาศที่ใช้งาน</p>
                        <p className="text-lg font-bold text-gray-800">
                            {usage.activeListings}/{usage.maxListings === -1 ? '∞' : usage.maxListings}
                            {usage.bonusListingSlots > 0 && (
                                <span className="text-xs text-emerald-600 font-bold ml-2">+{usage.bonusListingSlots} slot</span>
                            )}
                        </p>
                    </div>
                    {currentPkg && currentPkg.expiresAt && (() => {
                        const daysLeft = getDaysRemaining(currentPkg.expiresAt);
                        const expDate = new Date(currentPkg.expiresAt);
                        const expFormatted = expDate.toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' });
                        return (
                            <div className="bg-gray-50 px-3 py-2.5 rounded-xl">
                                <p className="text-[10px] text-gray-400">หมดอายุ {expFormatted}</p>
                                {daysLeft !== null && daysLeft > 0 ? (
                                    <p className={`text-lg font-bold ${daysLeft <= 3 ? 'text-red-500' : daysLeft <= 7 ? 'text-yellow-600' : 'text-gray-700'}`}>
                                        เหลือ {daysLeft} วัน
                                    </p>
                                ) : (
                                    <p className="text-lg font-bold text-red-500">หมดอายุแล้ว</p>
                                )}
                            </div>
                        );
                    })()}
                </div>
                {/* Slot purchase — ซื้อ slot ประกาศเพิ่ม (99 บาท/slot, ถาวร) */}
                {usage.maxListings !== -1 && (
                    <div className="mb-3 p-3 rounded-xl border border-orange-100 bg-gradient-to-r from-orange-50 to-amber-50 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-orange-500 shrink-0">
                            <ShoppingBag size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-800">ซื้อ slot ประกาศเพิ่ม</p>
                            <p className="text-[11px] text-gray-500">฿99/slot · ใช้ได้ถาวร · สะสมข้ามแพ็กเกจ</p>
                        </div>
                        <button
                            onClick={() => setShowSlotModal(true)}
                            className="flex items-center gap-1 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-bold transition shadow-sm shrink-0"
                        >
                            <Plus size={14} /> ซื้อเพิ่ม
                        </button>
                    </div>
                )}

                {/* Renewal button — แสดงเฉพาะเมื่อเหลือ ≤ 7 วัน */}
                {currentPkg && currentPkg.slug !== 'basic' && (() => {
                    const currentFullPkg = packages.find(p => p.id === currentPkg.id || p.slug === currentPkg.slug);
                    const daysLeft = getDaysRemaining(currentPkg.expiresAt);
                    if (!currentFullPkg || daysLeft === null || daysLeft <= 0 || daysLeft > 7) return null;
                    return (
                        <button
                            onClick={() => openUpgradeModal(currentFullPkg, true)}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-bold transition shadow-sm"
                        >
                            <RotateCcw size={16} />
                            ต่ออายุแพ็กเกจ
                        </button>
                    );
                })()}

                {/* Slot Purchase History */}
                {slotPurchases.length > 0 && (() => {
                    const latest = slotPurchases[0];
                    return (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
                                    <ShoppingBag size={12} className="text-orange-500" /> ประวัติซื้อ slot
                                </p>
                                {slotPurchases.length > 1 && (
                                    <button
                                        onClick={() => setShowAllSlotTx(!showAllSlotTx)}
                                        className="text-xs font-bold text-primary hover:underline"
                                    >
                                        {showAllSlotTx ? 'ซ่อน' : `ดูทั้งหมด (${slotPurchases.length})`}
                                    </button>
                                )}
                            </div>
                            {(showAllSlotTx ? slotPurchases : [latest]).map((sp: any) => (
                                <div key={sp.id} className="flex items-center justify-between p-2.5 rounded-lg bg-orange-50/50 mb-2 last:mb-0">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <div className="p-1 rounded-md bg-white">
                                            <ShoppingBag size={14} className="text-orange-500" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-gray-700 truncate flex items-center gap-1.5">
                                                +{sp.quantity} slot
                                                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-orange-100 text-orange-700">
                                                    ซื้อเพิ่ม
                                                </span>
                                            </p>
                                            <p className="text-[10px] text-gray-400">
                                                {new Date(sp.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                {sp.adminNote && sp.status === 'REJECTED' && (
                                                    <span className="text-rose-500 ml-2">· {sp.adminNote}</span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <span className="text-xs font-medium text-gray-600">฿{Number(sp.totalAmount).toLocaleString()}</span>
                                        <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                                            sp.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                            sp.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                            'bg-red-100 text-red-700'
                                        }`}>
                                            {sp.status === 'PENDING' ? 'รอ' : sp.status === 'APPROVED' ? '✓' : '✗'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    );
                })()}

                {/* Latest Transaction inside current package card */}
                {transactions.length > 0 && (() => {
                    const latest = transactions[0];
                    return (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-xs font-bold text-gray-500">ประวัติล่าสุด</p>
                                {transactions.length > 1 && (
                                    <button
                                        onClick={() => setShowAllTx(!showAllTx)}
                                        className="text-xs font-bold text-primary hover:underline"
                                    >
                                        {showAllTx ? 'ซ่อน' : `ดูทั้งหมด (${transactions.length})`}
                                    </button>
                                )}
                            </div>
                            {(showAllTx ? transactions : [latest]).map(tx => (
                                <div key={tx.id} className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 mb-2 last:mb-0">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <div className={`p-1 rounded-md ${getColor(tx.package.slug).bg}`}>
                                            {React.cloneElement(getIcon(tx.package.slug) as React.ReactElement<any>, { size: 16 })}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-gray-700 truncate flex items-center gap-1.5">
                                                {tx.package.name}
                                                <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${tx.type === 'RENEWAL' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                                                    {tx.type === 'RENEWAL' ? 'ต่ออายุ' : 'อัพเกรด'}
                                                </span>
                                            </p>
                                            <p className="text-[10px] text-gray-400">
                                                {new Date(tx.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <span className="text-xs font-medium text-gray-600">฿{Number(tx.amount).toLocaleString()}</span>
                                        <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                                            tx.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                            tx.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                            'bg-red-100 text-red-700'
                                        }`}>
                                            {tx.status === 'PENDING' ? 'รอ' : tx.status === 'APPROVED' ? '✓' : '✗'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    );
                })()}
            </div>

            {/* Package Cards — Mobile First */}
            <div>
                <h2 className="text-lg font-bold text-gray-800 mb-1">เปรียบเทียบแพ็กเกจ</h2>
                <p className="text-sm text-gray-500 mb-4">เลือกแพ็กเกจที่เหมาะกับธุรกิจของคุณ</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {packages.map(pkg => {
                        const isCurrent = currentPkg
                            ? (currentPkg.id === pkg.id || currentPkg.slug === pkg.slug)
                            : (pkg.slug === 'basic' || pkg.price === 0);
                        const isLower = pkg.sortOrder <= currentSortOrder;
                        const color = getColor(pkg.slug);

                        return (
                            <div key={pkg.id} className={`bg-white rounded-2xl border-2 shadow-sm overflow-hidden ${isCurrent ? 'border-primary' : 'border-gray-100'}`}>
                                {/* Card Header */}
                                <div className={`p-4 ${color.bg} flex items-center justify-between`}>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-xl bg-white shadow-sm dark:bg-background/60 dark:backdrop-blur">{getIcon(pkg.slug)}</div>
                                        <div>
                                            <p className="font-bold text-gray-800 text-sm">{pkg.name}</p>
                                            <p className="text-xs text-gray-500">{pkg.nameTh}</p>
                                        </div>
                                    </div>
                                    {isCurrent && (
                                        <span className="text-[10px] font-bold bg-primary text-white px-2.5 py-1 rounded-full dark:bg-blue-500">ปัจจุบัน</span>
                                    )}
                                </div>

                                {/* Price */}
                                <div className="px-4 pt-4 pb-2">
                                    <span className="text-2xl font-bold text-gray-800">
                                        {Number(pkg.price) === 0 ? 'ฟรี' : `฿${Number(pkg.price).toLocaleString()}`}
                                    </span>
                                    {Number(pkg.price) > 0 && <span className="text-sm text-gray-400"> /เดือน</span>}
                                </div>

                                {/* Features List */}
                                <div className="px-4 pb-4 space-y-2">
                                    {featureRows.map(row => {
                                        const val = (pkg as any)[row.key];
                                        return (
                                            <div key={row.key} className="flex items-center justify-between text-xs">
                                                <span className="text-gray-500">{row.label}</span>
                                                <span className="font-medium text-gray-700">{row.format ? row.format(val) : val}</span>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Action */}
                                <div className="px-4 pb-4">
                                    {isCurrent ? (
                                        <div className="w-full py-2.5 text-center text-sm font-bold text-gray-400 bg-gray-100 rounded-xl">
                                            แพ็กเกจปัจจุบัน
                                        </div>
                                    ) : isLower ? (
                                        <div className="w-full py-2.5 text-center text-xs text-gray-400 rounded-xl bg-gray-50/60 dark:bg-muted/30">
                                            แพ็กเกจต่ำกว่าปัจจุบัน
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => openUpgradeModal(pkg, false)}
                                            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition shadow-sm ${color.btn}`}
                                        >
                                            อัพเกรด <ArrowRight size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>


            {/* Upgrade Modal */}
            {showUpgradeModal && selectedPackage && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowUpgradeModal(false)} />
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className={`p-6 ${getColor(selectedPackage.slug).bg} border-b border-gray-100`}>
                            <button onClick={() => setShowUpgradeModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-white shadow-sm">
                                    {getIcon(selectedPackage.slug)}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800">
                                        {isRenewal ? `ต่ออายุ ${selectedPackage.name}` : `อัพเกรดเป็น ${selectedPackage.name}`}
                                    </h3>
                                    <p className="text-sm text-gray-500">฿{Number(selectedPackage.price).toLocaleString()}/เดือน</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Prorate Breakdown (upgrade only) */}
                            {!isRenewal && (
                                <div>
                                    <h4 className="font-bold text-gray-800 mb-3">สรุปค่าใช้จ่าย</h4>
                                    {prorateLoading ? (
                                        <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-500 text-center">กำลังคำนวณ...</div>
                                    ) : prorateInfo ? (
                                        <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                                            <div className="flex justify-between text-gray-700">
                                                <span>ราคาแพ็กเกจใหม่</span>
                                                <span>฿{Number(prorateInfo.originalPrice).toLocaleString()}</span>
                                            </div>
                                            {prorateInfo.proratedCredit > 0 && (
                                                <div className="flex justify-between text-green-600">
                                                    <span>เครดิตวันเหลือ ({prorateInfo.daysRemaining} วัน)</span>
                                                    <span>-฿{Number(prorateInfo.proratedCredit).toLocaleString()}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between font-bold text-gray-800 border-t border-gray-200 pt-2">
                                                <span>ยอดชำระสุทธิ</span>
                                                <span className="text-lg">฿{Number(prorateInfo.finalPrice).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-gray-50 rounded-xl p-4 text-sm">
                                            <div className="flex justify-between font-bold text-gray-800">
                                                <span>ยอดชำระ</span>
                                                <span className="text-lg">฿{Number(selectedPackage.price).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Renewal summary */}
                            {isRenewal && (
                                <div>
                                    <h4 className="font-bold text-gray-800 mb-3">สรุปค่าใช้จ่าย</h4>
                                    <div className="bg-gray-50 rounded-xl p-4 text-sm">
                                        <div className="flex justify-between font-bold text-gray-800">
                                            <span>ค่าต่ออายุ {selectedPackage.name}</span>
                                            <span className="text-lg">฿{Number(selectedPackage.price).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Payment Info */}
                            <div>
                                <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                    <CreditCard className="text-primary" /> ข้อมูลการชำระเงิน
                                </h4>
                                <div className="bg-blue-50 rounded-xl p-4 space-y-3 text-sm">
                                    <p className="font-bold text-blue-800">โอนเงินผ่านบัญชีธนาคาร</p>
                                    <div className="space-y-1 text-blue-700">
                                        {paymentInfo.bankName && (
                                            <p>ธนาคาร: <span className="font-bold">{paymentInfo.bankName}</span></p>
                                        )}
                                        {paymentInfo.accountName && (
                                            <p>ชื่อบัญชี: <span className="font-bold">{paymentInfo.accountName}</span></p>
                                        )}
                                        {paymentInfo.accountNumber && (
                                            <p>เลขบัญชี: <span className="font-bold font-mono">{paymentInfo.accountNumber}</span></p>
                                        )}
                                        {paymentInfo.promptPayNumber && (
                                            <p>พร้อมเพย์: <span className="font-bold font-mono">{paymentInfo.promptPayNumber}</span></p>
                                        )}
                                        <p>จำนวน: <span className="font-bold text-lg">฿{(!isRenewal && prorateInfo ? Number(prorateInfo.finalPrice) : Number(selectedPackage.price)).toLocaleString()}</span></p>
                                    </div>
                                    {paymentInfo.note && (
                                        <p className="text-xs text-blue-600 border-t border-blue-100 pt-2">{paymentInfo.note}</p>
                                    )}
                                    {paymentInfo.qrCodeImage && (
                                        <div className="border-t border-blue-100 pt-3">
                                            <p className="font-bold text-blue-800 mb-2 text-center">สแกน QR Code เพื่อชำระเงิน</p>
                                            <div className="flex justify-center">
                                                <img
                                                    src={paymentInfo.qrCodeImage}
                                                    alt="QR Code สำหรับชำระเงิน"
                                                    className="w-48 h-48 object-contain rounded-lg border border-blue-200 bg-white p-1"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {!paymentInfo.bankName && !paymentInfo.qrCodeImage && (
                                    <p className="text-xs text-gray-400 mt-2">กรุณาติดต่อผู้ดูแลระบบเพื่อสอบถามข้อมูลการชำระเงิน</p>
                                )}
                            </div>

                            {/* Slip Upload */}
                            <div>
                                <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                    <Upload className="text-primary" /> แนบหลักฐานการโอนเงิน
                                </h4>
                                {slipPreview ? (
                                    <div className="relative">
                                        <img src={slipPreview} alt="Slip" className="w-full rounded-xl border border-gray-200 max-h-80 object-contain bg-gray-50" />
                                        <button
                                            onClick={() => { setSlipFile(null); setSlipPreview(null); }}
                                            className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <label
                                        className={`flex flex-col items-center gap-3 p-8 border-2 border-dashed rounded-xl cursor-pointer transition group ${dragOverSlip ? 'border-primary bg-blue-50/50' : 'border-gray-200 hover:border-primary hover:bg-blue-50/50'}`}
                                        onDragOver={(e) => { e.preventDefault(); setDragOverSlip(true); }}
                                        onDragLeave={() => setDragOverSlip(false)}
                                        onDrop={(e) => {
                                            e.preventDefault(); setDragOverSlip(false);
                                            const file = Array.from(e.dataTransfer.files).find(f => f.type.startsWith('image/'));
                                            if (file) {
                                                setSlipFile(file);
                                                const reader = new FileReader();
                                                reader.onload = () => setSlipPreview(reader.result as string);
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                    >
                                        <ImageIcon strokeWidth={1} className={`text-4xl transition ${dragOverSlip ? 'text-primary' : 'text-gray-300 group-hover:text-primary'}`} />
                                        <span className={`text-sm font-bold transition ${dragOverSlip ? 'text-primary' : 'text-gray-500 group-hover:text-primary'}`}>{dragOverSlip ? 'วางรูปที่นี่' : 'คลิกหรือลากสลิปมาวาง'}</span>
                                        <span className="text-xs text-gray-400">รองรับไฟล์ JPG, PNG, WebP</span>
                                        <input type="file" accept="image/*" onChange={handleSlipChange} className="hidden" />
                                    </label>
                                )}
                            </div>

                            {/* AlertTriangle */}
                            <div className="flex items-start gap-3 bg-yellow-50 rounded-xl p-4">
                                <AlertTriangle className="text-yellow-500 text-xl flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-yellow-700">
                                    หลังจากส่งหลักฐานการโอนเงิน ทีมงานจะตรวจสอบและอนุมัติภายใน 24 ชั่วโมง
                                    แพ็กเกจจะเริ่มใช้งานได้ทันทีหลังอนุมัติ
                                </p>
                            </div>

                            {/* Submit */}
                            <button
                                onClick={handleSubmitUpgrade}
                                disabled={!slipFile || isSubmitting}
                                className={`w-full py-3.5 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 ${
                                    slipFile && !isSubmitting
                                        ? getColor(selectedPackage.slug).btn + ' shadow-lg'
                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="animate-spin">⏳</span> กำลังส่งคำขอ...
                                    </>
                                ) : (
                                    <>
                                        {isRenewal ? 'ส่งคำขอต่ออายุ' : 'ส่งคำขออัพเกรด'} <ArrowRight />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Slot Purchase Modal */}
            <SlotPurchaseModal
                open={showSlotModal}
                onClose={() => setShowSlotModal(false)}
                onSuccess={() => {
                    setSuccessMsg('ส่งคำขอซื้อ slot สำเร็จ รอ admin ตรวจสอบ');
                    setSlotRefreshKey(k => k + 1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
            />
        </div>
    );
}
