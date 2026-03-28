"use client";

import React, { useState, useEffect } from 'react';
import {
    Crown,
    Star,
    Lightning,
    Rocket,
    Check,
    ArrowRight,
    CreditCard,
    Upload,
    Clock,
    Warning,
    X,
    Image as ImageIcon,
} from '@phosphor-icons/react';

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
    package: {
        id: string;
        name: string;
        nameTh: string;
        slug: string;
    };
}

interface CurrentPackage {
    id: string;
    name: string;
    nameTh: string;
    slug: string;
    maxListings: number;
    maxPhotosPerListing: number;
    listingDurationDays: number;
}

// Icon/color maps by slug
const packageIcons: Record<string, React.ReactNode> = {
    basic: <Lightning weight="fill" className="text-gray-400" size={28} />,
    standard: <Star weight="fill" className="text-blue-500" size={28} />,
    professional: <Rocket weight="fill" className="text-orange-500" size={28} />,
    premium: <Crown weight="fill" className="text-yellow-500" size={28} />,
};

const packageColors: Record<string, { bg: string; btn: string }> = {
    basic: { bg: 'bg-gray-50', btn: 'bg-gray-200 text-gray-600 cursor-default' },
    standard: { bg: 'bg-blue-50', btn: 'bg-blue-600 hover:bg-blue-700 text-white' },
    professional: { bg: 'bg-orange-50', btn: 'bg-orange-500 hover:bg-orange-600 text-white' },
    premium: { bg: 'bg-yellow-50', btn: 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white' },
};

function getIcon(slug: string) {
    return packageIcons[slug] || <Lightning weight="fill" className="text-gray-400" size={28} />;
}
function getColor(slug: string) {
    return packageColors[slug] || packageColors.basic;
}

export default function PackagesPage() {
    const [packages, setPackages] = useState<PackageData[]>([]);
    const [currentPkg, setCurrentPkg] = useState<CurrentPackage | null>(null);
    const [usage, setUsage] = useState({ activeListings: 0, maxListings: 1 });
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState<PackageData | null>(null);
    const [slipFile, setSlipFile] = useState<File | null>(null);
    const [slipPreview, setSlipPreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [paymentInfo, setPaymentInfo] = useState<Record<string, string>>({});

    const getUserId = () => {
        const stored = localStorage.getItem('user') || sessionStorage.getItem('user');
        if (stored) {
            try { return JSON.parse(stored).id; } catch { return null; }
        }
        return null;
    };

    useEffect(() => {
        const userId = getUserId();
        if (!userId) return;

        fetch(`${API_URL}/packages`)
            .then(r => r.json())
            .then(data => setPackages(data.packages || []))
            .catch(console.error);

        fetch(`${API_URL}/packages/my?userId=${userId}`)
            .then(r => r.json())
            .then(data => {
                setCurrentPkg(data.currentPackage || null);
                setUsage(data.usage || { activeListings: 0, maxListings: 1 });
            })
            .catch(console.error);

        fetch(`${API_URL}/packages/transactions?userId=${userId}`)
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

            const res = await fetch(`${API_URL}/packages/upgrade`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
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
                const txRes = await fetch(`${API_URL}/packages/transactions?userId=${userId}`);
                const txData = await txRes.json();
                setTransactions(txData.transactions || []);
            } else {
                alert(data.message || 'เกิดข้อผิดพลาด');
            }
        } catch (err) {
            console.error(err);
            alert('เกิดข้อผิดพลาดในการส่งคำขอ');
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
                    <Check weight="bold" className="text-green-600 text-xl flex-shrink-0" />
                    <p className="text-green-800 font-bold text-sm">{successMsg}</p>
                    <button onClick={() => setSuccessMsg('')} className="ml-auto text-green-500 hover:text-green-700"><X weight="bold" /></button>
                </div>
            )}

            {/* Current Package Status */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">แพ็กเกจของฉัน</h1>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className={`p-4 rounded-2xl ${getColor(currentPkg?.slug || 'basic').bg}`}>
                        {getIcon(currentPkg?.slug || 'basic')}
                    </div>
                    <div className="flex-1">
                        <h2 className="text-lg font-bold text-gray-800">
                            {currentPkg?.name || 'Basic (Free)'}
                        </h2>
                        <p className="text-sm text-gray-500">
                            {!currentPkg ? 'แพ็กเกจฟรี' : `฿${Number(packages.find(p => p.id === currentPkg.id)?.price || 0).toLocaleString()}/เดือน`}
                        </p>
                    </div>
                    <div className="bg-gray-50 px-4 py-2 rounded-xl">
                        <p className="text-xs text-gray-500">ประกาศที่ใช้งาน</p>
                        <p className="text-lg font-bold text-gray-800">
                            {usage.activeListings}/{usage.maxListings === -1 ? '∞' : usage.maxListings}
                        </p>
                    </div>
                </div>
            </div>

            {/* Package Comparison Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800">เปรียบเทียบแพ็กเกจ</h2>
                    <p className="text-sm text-gray-500">เลือกแพ็กเกจที่เหมาะกับธุรกิจของคุณ</p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="text-left p-4 text-sm font-bold text-gray-500 w-44">ฟีเจอร์ / ระดับ</th>
                                {packages.map(pkg => (
                                    <th key={pkg.id} className="p-4 text-center min-w-[160px]">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className={`p-2.5 rounded-xl ${getColor(pkg.slug).bg}`}>
                                                {getIcon(pkg.slug)}
                                            </div>
                                            <span className="font-bold text-sm text-gray-800">{pkg.name}</span>
                                            {(currentPkg
                                                ? (currentPkg.id === pkg.id || currentPkg.slug === pkg.slug)
                                                : (pkg.slug === 'basic' || pkg.price === 0)) && (
                                                <span className="text-[10px] font-bold bg-primary text-white px-2 py-0.5 rounded-full">ปัจจุบัน</span>
                                            )}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {featureRows.map((row, i) => (
                                <tr key={row.key} className={i % 2 === 0 ? 'bg-gray-50/50' : ''}>
                                    <td className="p-4 text-sm font-bold text-gray-600">{row.label}</td>
                                    {packages.map(pkg => {
                                        const val = (pkg as any)[row.key];
                                        return (
                                            <td key={pkg.id} className="p-4 text-center text-sm text-gray-700 font-medium">
                                                {row.format ? row.format(val) : val}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                            {/* Price Row */}
                            <tr className="border-t-2 border-gray-100 bg-gray-50">
                                <td className="p-4 text-sm font-bold text-gray-600">ค่าบริการ</td>
                                {packages.map(pkg => (
                                    <td key={pkg.id} className="p-4 text-center">
                                        <span className="text-xl font-bold text-gray-800">
                                            {Number(pkg.price) === 0 ? 'ฟรี' : `฿${Number(pkg.price).toLocaleString()}`}
                                        </span>
                                        {Number(pkg.price) > 0 && <span className="text-xs text-gray-500 block">/ เดือน</span>}
                                    </td>
                                ))}
                            </tr>
                            {/* Action Row */}
                            <tr>
                                <td className="p-4"></td>
                                {packages.map(pkg => {
                                    const isCurrent = currentPkg
                                        ? (currentPkg.id === pkg.id || currentPkg.slug === pkg.slug)
                                        : (pkg.slug === 'basic' || pkg.price === 0);
                                    const isLower = pkg.sortOrder <= currentSortOrder;

                                    return (
                                        <td key={pkg.id} className="p-4 text-center">
                                            {isCurrent ? (
                                                <span className="inline-block px-4 py-2 text-sm font-bold text-gray-500 bg-gray-100 rounded-xl">
                                                    แพ็กเกจปัจจุบัน
                                                </span>
                                            ) : isLower ? (
                                                <span className="inline-block px-4 py-2 text-sm text-gray-400">—</span>
                                            ) : (
                                                <button
                                                    onClick={() => {
                                                        setSelectedPackage(pkg);
                                                        setShowUpgradeModal(true);
                                                    }}
                                                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition shadow-sm ${getColor(pkg.slug).btn}`}
                                                >
                                                    อัพเกรด <ArrowRight weight="bold" size={14} />
                                                </button>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Transaction History */}
            {transactions.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Clock weight="bold" className="text-primary" /> ประวัติการอัพเกรด
                    </h2>
                    <div className="space-y-3">
                        {transactions.map(tx => (
                            <div key={tx.id} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                                <div className={`p-2 rounded-lg ${getColor(tx.package.slug).bg}`}>
                                    {getIcon(tx.package.slug)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-sm text-gray-800">
                                        อัพเกรดเป็น {tx.package.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {new Date(tx.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                    {tx.adminNote && (
                                        <p className="text-xs text-red-500 mt-1">หมายเหตุ: {tx.adminNote}</p>
                                    )}
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                    tx.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                    tx.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                    'bg-red-100 text-red-700'
                                }`}>
                                    {tx.status === 'PENDING' ? 'รอตรวจสอบ' : tx.status === 'APPROVED' ? 'อนุมัติแล้ว' : 'ถูกปฏิเสธ'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Upgrade Modal */}
            {showUpgradeModal && selectedPackage && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowUpgradeModal(false)} />
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className={`p-6 ${getColor(selectedPackage.slug).bg} border-b border-gray-100`}>
                            <button onClick={() => setShowUpgradeModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                                <X weight="bold" size={24} />
                            </button>
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-white shadow-sm">
                                    {getIcon(selectedPackage.slug)}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800">อัพเกรดเป็น {selectedPackage.name}</h3>
                                    <p className="text-sm text-gray-500">฿{Number(selectedPackage.price).toLocaleString()}/เดือน</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Payment Info */}
                            <div>
                                <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                    <CreditCard weight="bold" className="text-primary" /> ข้อมูลการชำระเงิน
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
                                        <p>จำนวน: <span className="font-bold text-lg">฿{Number(selectedPackage.price).toLocaleString()}</span></p>
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
                                    <Upload weight="bold" className="text-primary" /> แนบหลักฐานการโอนเงิน
                                </h4>
                                {slipPreview ? (
                                    <div className="relative">
                                        <img src={slipPreview} alt="Slip" className="w-full rounded-xl border border-gray-200 max-h-80 object-contain bg-gray-50" />
                                        <button
                                            onClick={() => { setSlipFile(null); setSlipPreview(null); }}
                                            className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition"
                                        >
                                            <X weight="bold" size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center gap-3 p-8 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-primary hover:bg-blue-50/50 transition group">
                                        <ImageIcon weight="thin" className="text-4xl text-gray-300 group-hover:text-primary transition" />
                                        <span className="text-sm text-gray-500 group-hover:text-primary font-bold">คลิกเพื่ออัพโหลดสลิปการโอนเงิน</span>
                                        <span className="text-xs text-gray-400">รองรับไฟล์ JPG, PNG, WebP</span>
                                        <input type="file" accept="image/*" onChange={handleSlipChange} className="hidden" />
                                    </label>
                                )}
                            </div>

                            {/* Warning */}
                            <div className="flex items-start gap-3 bg-yellow-50 rounded-xl p-4">
                                <Warning weight="fill" className="text-yellow-500 text-xl flex-shrink-0 mt-0.5" />
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
                                        ส่งคำขออัพเกรด <ArrowRight weight="bold" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
