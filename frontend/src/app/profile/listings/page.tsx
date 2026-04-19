"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    Eye,
    Heart,
    Pencil,
    Megaphone,
    CircleDollarSign,
    Trash,
    Loader2,
    MoreVertical,
    Zap,
    Car,
    AlertCircle,
    Crown,
    ArrowRight,
    Upload,
    ImageIcon,
    X,
    AlertTriangle,
    ShoppingBag,
} from 'lucide-react';
import ProfileListingCard, { VehicleListing, STATUS_CONFIG } from '@/components/profile/ProfileListingCard';
import Toast from '@/components/Toast';
import SlotPurchaseModal from '@/components/SlotPurchaseModal';

interface ApiResponse {
    listings: VehicleListing[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

function getAuthToken(): string | null {
    const stored = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (!stored) return null;
    try { return JSON.parse(stored).token || null; } catch { return null; }
}

interface PackageInfo {
    currentPackage: {
        name: string;
        nameTh: string;
        slug: string;
        maxListings: number;
    } | null;
    usage: {
        activeListings: number;
        maxListings: number;
    };
}

export default function MyListingsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialStatus = (['ALL', 'ACTIVE', 'PENDING', 'EXPIRED', 'PAUSED'] as const).includes(searchParams.get('status') as any)
        ? (searchParams.get('status') as 'ALL' | 'ACTIVE' | 'PENDING' | 'EXPIRED' | 'PAUSED')
        : 'ALL';
    const [listings, setListings] = useState<VehicleListing[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<{ id: string } | null>(null);
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'PENDING' | 'EXPIRED' | 'PAUSED'>(initialStatus);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const [packageInfo, setPackageInfo] = useState<PackageInfo | null>(null);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [showSlotModal, setShowSlotModal] = useState(false);

    const [renewId, setRenewId] = useState<string | null>(null);
    const [renewLoading, setRenewLoading] = useState(false);
    const [renewSlipPreview, setRenewSlipPreview] = useState<string | null>(null);
    const [renewSlipData, setRenewSlipData] = useState<string | null>(null);
    const [dragOverSlip, setDragOverSlip] = useState(false);
    const [renewError, setRenewError] = useState<string | null>(null);
    const [pendingRenewalIds, setPendingRenewalIds] = useState<Set<string>>(new Set());
    const [toastMsg, setToastMsg] = useState<{ message: string; type: string } | null>(null);
    const [slotListingId, setSlotListingId] = useState<string | null>(null);
    const [slotSaving, setSlotSaving] = useState(false);
    const [slotInfo, setSlotInfo] = useState<{ slots: Array<{ index: number; time: string; count: number; maxPerSlot: number }>; unassigned: number } | null>(null);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToastMsg({ message, type });
        setTimeout(() => setToastMsg(null), 3000);
    };
    const [paymentInfo, setPaymentInfo] = useState<any>(null);

    const statuses = [
        { key: 'ALL', label: 'ทั้งหมด', count: listings.length },
        { key: 'ACTIVE', label: 'กำลังขาย', count: listings.filter(l => l.status === 'ACTIVE').length },
        { key: 'PAUSED', label: 'หยุดชั่วคราว', count: listings.filter(l => l.status === 'PAUSED').length },
        { key: 'EXPIRED', label: 'หมดอายุ', count: listings.filter(l => l.status === 'EXPIRED').length },
        { key: 'PENDING', label: 'รอตรวจ', count: listings.filter(l => l.status === 'PENDING').length },
    ];

    // Check authentication and fetch listings
    useEffect(() => {
        const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
        if (!storedUser) {
            router.push('/');
            return;
        }

        const userData = JSON.parse(storedUser);
        setUser(userData);
        fetchListings(userData.id);
        fetchPackageInfo(userData.id);
        fetchPendingRenewals(userData.id);
    }, [router]);

    const fetchPendingRenewals = async (userId: string) => {
        try {
            const res = await fetch(`${API_BASE}/listings/renewals/pending?userId=${userId}`);
            if (res.ok) {
                const data = await res.json();
                const ids = new Set<string>((data.renewals || []).map((r: { listingId: string }) => r.listingId));
                setPendingRenewalIds(ids);
            }
        } catch { /* silently fail */ }
    };

    const fetchPackageInfo = async (_userId: string) => {
        try {
            const token = getAuthToken();
            const response = await fetch(`${API_BASE}/packages/my`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            if (response.ok) {
                const data = await response.json();
                setPackageInfo(data);
            }
        } catch (err) {
            console.error('Failed to fetch package info:', err);
        }
    };

    const fetchListings = async (userId: string) => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE}/listings/user/${userId}`);

            if (!response.ok) {
                throw new Error('Failed to fetch listings');
            }

            const data: ApiResponse = await response.json();
            setListings(data.listings);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (listingId: string) => {
        if (!user) return;

        setDeleting(true);
        try {
            const token = getAuthToken();
            const response = await fetch(`${API_BASE}/listings/${listingId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
            });

            if (!response.ok) {
                throw new Error('Failed to delete listing');
            }

            // Remove from local state and refresh package info
            setListings(prev => prev.filter(l => l.id !== listingId));
            setDeleteConfirm(null);
            fetchPackageInfo(user.id);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการลบประกาศ');
        } finally {
            setDeleting(false);
        }
    };

    // ต่ออายุ / รีประกาศ
    const openSlotModal = async (listingId: string) => {
        if (!user) return;
        setSlotListingId(listingId);
        try {
            const token = getAuthToken();
            const res = await fetch(`${API_BASE}/listings/bump-slots`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            const data = await res.json();
            setSlotInfo(data);
        } catch {
            setSlotInfo(null);
        }
    };

    const SLOT_SCHEDULES: Record<string, string[]> = {
        standard: ['20:00'],
        professional: ['08:30', '12:30', '21:00'],
        premium: ['08:00', '11:30', '15:00', '19:00', '22:00'],
    };

    const currentSlots = packageInfo?.currentPackage?.slug
        ? SLOT_SCHEDULES[packageInfo.currentPackage.slug] || []
        : [];

    const handleSetSlot = async (listingId: string, slot: number | null) => {
        if (!user) return;
        setSlotSaving(true);
        try {
            const token = getAuthToken();
            const response = await fetch(`${API_BASE}/listings/${listingId}/bump-slot`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ slot })
            });
            const data = await response.json();
            if (response.ok) {
                showToast(`ตั้งเวลาดันอัตโนมัติสำเร็จ: ${data.scheduledTime}`, 'success');
                setSlotListingId(null);
                fetchListings(user.id);
            } else {
                showToast(data.message || 'เกิดข้อผิดพลาด', 'error');
            }
        } catch {
            showToast('เกิดข้อผิดพลาด', 'error');
        } finally {
            setSlotSaving(false);
        }
    };

    const handleBump = async (listingId: string) => {
        if (!user) return;
        try {
            const token = getAuthToken();
            const response = await fetch(`${API_BASE}/listings/${listingId}/bump`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
            });
            const data = await response.json();
            if (response.ok) {
                showToast(`ดันโพสสำเร็จ เหลือสิทธิ์อีก ${data.remaining} ครั้ง/คัน วันนี้`, 'success');
                fetchListings(user.id);
            } else {
                showToast(data.message || 'ไม่สามารถดันโพสได้', 'error');
            }
        } catch {
            showToast('เกิดข้อผิดพลาดในการดันโพส', 'error');
        }
    };

    const handleRenewClick = async (listingId: string) => {
        if (!user) return;

        // เช็คว่าเป็น paid user หรือไม่ → ถ้าใช่ repost ทันที
        const isBasicFree = !packageInfo?.currentPackage || packageInfo.currentPackage.slug === 'basic';

        if (!isBasicFree) {
            // Paid user → repost ทันที
            setRenewLoading(true);
            try {
                const token = getAuthToken();
                const response = await fetch(`${API_BASE}/listings/${listingId}/renew`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                    },
                });
                const data = await response.json();
                if (response.ok) {
                    showToast('รีประกาศสำเร็จ ประกาศของคุณกลับมาแสดงบนเว็บไซต์แล้ว', 'success');
                    fetchListings(user.id);
                    fetchPackageInfo(user.id);
                } else {
                    showToast(data.message || 'เกิดข้อผิดพลาด', 'error');
                }
            } catch {
                showToast('เกิดข้อผิดพลาดในการรีประกาศ', 'error');
            } finally {
                setRenewLoading(false);
            }
        } else {
            // Basic user → แสดง modal ต่ออายุ (จ่าย 49 บาท / 45 วัน)
            setRenewSlipPreview(null);
            setRenewSlipData(null);
            setRenewError(null);
            setRenewId(listingId);
            // Fetch payment info
            try {
                const res = await fetch(`${API_BASE}/packages/payment-info`);
                const data = await res.json();
                setPaymentInfo(data);
            } catch { /* silent */ }
        }
    };

    const handleBasicRenew = async (slipBase64: string) => {
        if (!user || !renewId) return;
        setRenewLoading(true);
        try {
            const token = getAuthToken();
            const response = await fetch(`${API_BASE}/listings/${renewId}/renew`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ paymentSlip: slipBase64 })
            });
            const data = await response.json();
            if (response.ok) {
                setRenewId(null);
                setRenewSlipPreview(null);
                setRenewSlipData(null);
                setRenewError(null);
                showToast('ส่งคำขอต่ออายุแล้ว รอ admin ตรวจสอบ', 'success');
                fetchListings(user.id);
                fetchPendingRenewals(user.id);
            } else {
                setRenewError(data.message || 'เกิดข้อผิดพลาด');
            }
        } catch {
            setRenewError('เกิดข้อผิดพลาดในการส่งคำขอ');
        } finally {
            setRenewLoading(false);
        }
    };

    const formatPrice = (price: string | number) => {
        const num = typeof price === 'string' ? parseFloat(price) : price;
        return num.toLocaleString('th-TH');
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('th-TH', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const getDaysLeft = (expiredAt: string | null) => {
        if (!expiredAt) return null;
        const now = new Date();
        const expired = new Date(expiredAt);
        const diff = Math.ceil((expired.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return diff > 0 ? diff : 0;
    };

    const getPrimaryImage = (images: VehicleListing['images']) => {
        const primary = images.find((img: any) => img.isPrimary);
        return primary?.url || images[0]?.url || '/placeholder-car.jpg';
    };

    const handleCreateListingClick = () => {
        if (isAtLimit) {
            setShowUpgradeModal(true);
        } else {
            router.push('/sell/create');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="text-4xl text-primary animate-spin" />
            </div>
        );
    }

    // Calculate usage percentage for progress bar
    const usagePercent = packageInfo
        ? packageInfo.usage.maxListings === -1
            ? 0
            : Math.min((packageInfo.usage.activeListings / packageInfo.usage.maxListings) * 100, 100)
        : 0;
    const isAtLimit = packageInfo
        ? packageInfo.usage.maxListings !== -1 && packageInfo.usage.activeListings >= packageInfo.usage.maxListings
        : false;
    const isUnlimited = packageInfo?.usage.maxListings === -1;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">จัดการรถที่ลงขาย</h1>
                <button
                    onClick={handleCreateListingClick}
                    className="bg-accent text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-orange-600 transition shadow-lg shadow-orange-100"
                >
                    + ลงขายรถ
                </button>
            </div>

            {/* Package Usage Quota Banner */}
            {packageInfo && (
                <div className={`rounded-2xl border p-4 sm:p-5 ${
                    isAtLimit
                        ? 'bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-500/10 dark:to-orange-500/10 border-red-200'
                        : 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-500/10 dark:to-indigo-500/10 border-blue-200'
                }`}>
                    <div className="flex flex-col gap-3">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <Crown className={`text-lg ${isAtLimit ? 'text-orange-500' : 'text-blue-500'}`} />
                                <span className="font-bold text-gray-700 text-sm">
                                    {packageInfo.currentPackage?.nameTh || 'แพ็กเกจพื้นฐาน'}
                                </span>
                            </div>
                            <div className="flex items-baseline gap-1.5 mb-2 flex-wrap">
                                <span className={`text-2xl font-bold ${isAtLimit ? 'text-red-600' : 'text-gray-800'}`}>
                                    {packageInfo.usage.activeListings}
                                </span>
                                <span className="text-gray-400 text-sm">/</span>
                                <span className="text-gray-500 text-sm font-semibold">
                                    {isUnlimited ? 'ไม่จำกัด' : `${packageInfo.usage.maxListings} รายการ`}
                                </span>
                                {!isUnlimited && (packageInfo.usage as any).bonusListingSlots > 0 && (
                                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                        แพ็กเกจ {(packageInfo.usage as any).packageMaxListings} + slot {(packageInfo.usage as any).bonusListingSlots}
                                    </span>
                                )}
                            </div>
                            {!isUnlimited && (
                                <div className="w-full bg-white/70 dark:bg-white/10 rounded-full h-2 overflow-hidden">
                                    <div
                                        className={`h-2 rounded-full transition-all duration-500 ${isAtLimit ? 'bg-gradient-to-r from-red-400 to-orange-500' : 'bg-gradient-to-r from-blue-400 to-indigo-500'}`}
                                        style={{ width: `${usagePercent}%` }}
                                    />
                                </div>
                            )}
                        </div>
                        {isAtLimit && (
                            <div className="flex flex-row gap-2 shrink-0">
                                <button
                                    onClick={() => setShowSlotModal(true)}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold text-sm hover:from-orange-600 hover:to-red-600 transition-all shadow-lg shadow-orange-200 whitespace-nowrap"
                                >
                                    <ShoppingBag size={14} /> ซื้อ slot ฿99
                                </button>
                                <Link
                                    href="/profile/packages"
                                    className="flex items-center gap-2 px-4 py-2.5 bg-white border border-orange-200 text-orange-600 rounded-xl font-bold text-sm hover:bg-orange-50 transition whitespace-nowrap"
                                >
                                    อัพเกรด <ArrowRight size={14} />
                                </Link>
                            </div>
                        )}
                    </div>
                    {isAtLimit && (
                        <p className="text-xs text-red-500 mt-2 font-medium">
                            สิทธิการลงประกาศเต็มแล้ว ซื้อ slot เพิ่ม (ถาวร) หรืออัพเกรดแพ็กเกจ
                        </p>
                    )}
                </div>
            )}

            {/* Status Filters */}
            <div className="flex overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0 no-scrollbar">
                <div className="flex gap-2">
                    {statuses.map((s) => (
                        <button
                            key={s.key}
                            onClick={() => setStatusFilter(s.key as any)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${statusFilter === s.key
                                ? 'bg-primary text-white shadow-lg shadow-blue-100 scale-[1.02]'
                                : 'bg-white text-gray-500 border border-gray-100 hover:border-primary/30 hover:text-primary'
                                }`}
                        >
                            {s.label}
                            {s.count > 0 && (
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${statusFilter === s.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                    {s.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {error && (
                <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
                    <AlertCircle className="text-xl flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {listings.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Car className="text-4xl text-gray-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">ยังไม่มีรถที่ลงขาย</h3>
                    <p className="text-gray-500 mb-6">เริ่มลงขายรถของคุณได้เลย!</p>
                    <button
                        onClick={handleCreateListingClick}
                        className="inline-block bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-opacity-90 transition"
                    >
                        ลงขายรถ
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {(() => {
                        const filteredItems = listings.filter(item => statusFilter === 'ALL' || item.status === statusFilter);
                        if (filteredItems.length === 0) {
                            return (
                                <div className="p-12 text-center text-gray-500 text-sm">
                                    ไม่พบรายการในสถานะนี้
                                </div>
                            );
                        }
                        return filteredItems.map((item) => (
                            <ProfileListingCard
                                key={item.id}
                                listing={item}
                                isActive={activeMenu === item.id}
                                onToggleMenu={setActiveMenu}
                                onDelete={setDeleteConfirm}
                                onRenew={handleRenewClick}
                                hasPendingRenewal={pendingRenewalIds.has(item.id)}
                                onBump={handleBump}
                                onSetSlot={currentSlots.length > 0 ? openSlotModal : undefined}
                                slotSchedules={currentSlots}
                                formatPrice={formatPrice}
                                formatDate={formatDate}
                                getDaysLeft={getDaysLeft}
                                getPrimaryImage={getPrimaryImage}
                            />
                        ));
                    })()}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setDeleteConfirm(null)}
                    ></div>
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 relative z-10">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash className="text-3xl text-red-500" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">ลบประกาศ</h3>
                            <p className="text-gray-500 text-sm mb-6">คุณต้องการลบประกาศนี้ใช่หรือไม่?</p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeleteConfirm(null)}
                                    disabled={deleting}
                                    className="flex-1 py-3 px-4 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    onClick={() => handleDelete(deleteConfirm)}
                                    disabled={deleting}
                                    className="flex-1 py-3 px-4 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition flex items-center justify-center gap-2"
                                >
                                    {deleting ? (
                                        <Loader2 className="animate-spin" />
                                    ) : (
                                        'ลบประกาศ'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Upgrade Package Modal */}
            {showUpgradeModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setShowUpgradeModal(false)}
                    ></div>
                    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4 relative z-10 text-center">
                        <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg shadow-orange-200">
                            <Crown className="text-4xl text-white" />
                        </div>

                        <h3 className="text-xl font-bold text-gray-800 mb-2">สิทธิการลงประกาศเต็มแล้ว</h3>
                        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                            คุณใช้สิทธิลงประกาศครบ {packageInfo?.usage.maxListings} รายการตามแพ็กเกจปัจจุบันแล้ว เลือกซื้อ slot เพิ่ม (฿99/slot) หรืออัพเกรดแพ็กเกจ
                        </p>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => { setShowUpgradeModal(false); setShowSlotModal(true); }}
                                className="w-full py-3.5 px-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold hover:from-orange-600 hover:to-red-600 transition-all shadow-lg shadow-orange-200 flex items-center justify-center gap-2"
                            >
                                <ShoppingBag size={18} /> ซื้อ slot เพิ่ม ฿99/slot
                            </button>
                            <Link
                                href="/profile/packages"
                                className="w-full py-3 px-4 border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition flex items-center justify-center gap-2"
                            >
                                ดูแพ็กเกจ
                                <ArrowRight size={16} />
                            </Link>
                            <button
                                onClick={() => setShowUpgradeModal(false)}
                                className="w-full py-2 text-sm text-gray-400 hover:text-gray-600 transition"
                            >
                                ปิด
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Renewal Modal (Basic user — จ่าย 49 บาท / 45 วัน) */}
            {renewId && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => { if (!renewLoading) { setRenewId(null); setRenewSlipPreview(null); setRenewSlipData(null); } }}
                    ></div>
                    <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto relative z-10">
                        {/* Header */}
                        <div className="sticky top-0 bg-white border-b border-gray-100 p-5 flex items-center justify-between rounded-t-2xl">
                            <h3 className="text-lg font-bold text-gray-800">ต่ออายุประกาศ</h3>
                            <button
                                onClick={() => { if (!renewLoading) { setRenewId(null); setRenewSlipPreview(null); setRenewSlipData(null); } }}
                                className="p-1.5 hover:bg-gray-100 rounded-lg transition"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-5 space-y-4">
                            {/* Price info */}
                            <div className="text-center py-3 bg-emerald-50 rounded-xl">
                                <p className="text-sm text-gray-600">ต่ออายุประกาศ 45 วัน</p>
                                <p className="text-2xl font-bold text-emerald-600 mt-1">฿49</p>
                            </div>

                            {/* Payment info */}
                            {paymentInfo && (
                                <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-1">
                                    <p className="font-bold text-gray-700 mb-2">ข้อมูลการชำระเงิน:</p>
                                    {paymentInfo.bankName && <p className="text-gray-600">ธนาคาร: <span className="font-bold">{paymentInfo.bankName}</span></p>}
                                    {paymentInfo.accountName && <p className="text-gray-600">ชื่อบัญชี: <span className="font-bold">{paymentInfo.accountName}</span></p>}
                                    {paymentInfo.accountNumber && <p className="text-gray-600">เลขบัญชี: <span className="font-bold font-mono">{paymentInfo.accountNumber}</span></p>}
                                    <p className="text-gray-600">จำนวน: <span className="font-bold text-lg">฿49</span></p>
                                </div>
                            )}

                            {paymentInfo?.qrCodeImage && (
                                <div className="text-center">
                                    <p className="text-xs text-gray-500 mb-2 font-bold">สแกน QR Code เพื่อชำระเงิน</p>
                                    <img src={paymentInfo.qrCodeImage} alt="QR Code" className="w-48 h-48 mx-auto rounded-xl border border-gray-200" />
                                </div>
                            )}

                            {/* Slip Upload */}
                            <div>
                                <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-sm">
                                    <Upload className="text-emerald-600" /> แนบหลักฐานการโอนเงิน
                                </h4>
                                {renewSlipPreview ? (
                                    <div className="relative">
                                        <img src={renewSlipPreview} alt="Slip" className="w-full rounded-xl border border-gray-200 max-h-64 object-contain bg-gray-50" />
                                        <button
                                            onClick={() => { setRenewSlipPreview(null); setRenewSlipData(null); }}
                                            className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <label
                                        className={`flex flex-col items-center gap-3 p-6 border-2 border-dashed rounded-xl cursor-pointer transition group ${dragOverSlip ? 'border-emerald-400 bg-emerald-50/50' : 'border-gray-200 hover:border-emerald-400 hover:bg-emerald-50/50'}`}
                                        onDragOver={(e) => { e.preventDefault(); setDragOverSlip(true); }}
                                        onDragLeave={() => setDragOverSlip(false)}
                                        onDrop={(e) => {
                                            e.preventDefault(); setDragOverSlip(false);
                                            const file = Array.from(e.dataTransfer.files).find(f => f.type.startsWith('image/'));
                                            if (!file) return;
                                            const reader = new FileReader();
                                            reader.onload = () => { setRenewSlipPreview(reader.result as string); setRenewSlipData(reader.result as string); };
                                            reader.readAsDataURL(file);
                                        }}
                                    >
                                        <ImageIcon strokeWidth={1} size={40} className={`transition ${dragOverSlip ? 'text-emerald-500' : 'text-gray-300 group-hover:text-emerald-500'}`} />
                                        <span className={`text-sm font-bold transition ${dragOverSlip ? 'text-emerald-600' : 'text-gray-500 group-hover:text-emerald-600'}`}>{dragOverSlip ? 'วางรูปที่นี่' : 'คลิกหรือลากสลิปมาวาง'}</span>
                                        <span className="text-xs text-gray-400">รองรับไฟล์ JPG, PNG, WebP</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;
                                                const reader = new FileReader();
                                                reader.onload = () => {
                                                    setRenewSlipPreview(reader.result as string);
                                                    setRenewSlipData(reader.result as string);
                                                };
                                                reader.readAsDataURL(file);
                                            }}
                                        />
                                    </label>
                                )}
                            </div>

                            {/* AlertTriangle */}
                            <div className="flex items-start gap-3 bg-yellow-50 rounded-xl p-3">
                                <AlertTriangle className="text-yellow-500 flex-shrink-0 mt-0.5" size={18} />
                                <p className="text-xs text-yellow-700">
                                    หลังจากส่งหลักฐาน ทีมงานจะตรวจสอบและอนุมัติภายใน 24 ชั่วโมง
                                </p>
                            </div>

                            {/* Error */}
                            {renewError && (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2">
                                    <AlertTriangle className="text-red-500 flex-shrink-0" size={18} />
                                    <p className="text-sm text-red-700 font-medium">{renewError}</p>
                                </div>
                            )}

                            {/* Submit */}
                            <button
                                onClick={() => { setRenewError(null); if (renewSlipData) handleBasicRenew(renewSlipData); }}
                                disabled={!renewSlipData || renewLoading}
                                className={`w-full py-3.5 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 ${
                                    renewSlipData && !renewLoading
                                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg'
                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                            >
                                {renewLoading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={16} />
                                        กำลังส่งคำขอ...
                                    </>
                                ) : (
                                    <>
                                        ส่งคำขอต่ออายุ <ArrowRight size={14} />
                                    </>
                                )}
                            </button>

                            <p className="text-xs text-gray-400 text-center">
                                หรือลบประกาศเดิมแล้วลงประกาศใหม่ได้ฟรี
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Slot Selection Modal */}
            {slotListingId && currentSlots.length > 0 && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSlotListingId(null)} />
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 relative z-10">
                        <div className="text-center mb-5">
                            <h3 className="text-lg font-bold text-gray-800 mb-1">ตั้งเวลาดันอัตโนมัติ</h3>
                            <p className="text-sm text-gray-500">เลือกช่วงเวลาที่ต้องการให้ระบบดันโพสอัตโนมัติ</p>
                        </div>
                        <div className="space-y-2 mb-4">
                            {(slotInfo?.slots || currentSlots.map((t, i) => ({ index: i, time: t, count: 0, maxPerSlot: 99 }))).map((s: any) => {
                                const isFull = s.count >= s.maxPerSlot;
                                return (
                                    <button
                                        key={s.index}
                                        onClick={() => !isFull && handleSetSlot(slotListingId, s.index)}
                                        disabled={slotSaving || isFull}
                                        className={`w-full flex items-center justify-between p-3 rounded-xl border transition text-left ${
                                            isFull
                                                ? 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
                                                : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50'
                                        }`}
                                    >
                                        <div>
                                            <span className="font-medium text-gray-800">Slot {s.index + 1}: {s.time} น.</span>
                                            <span className="text-[11px] text-gray-400 ml-2">+สุ่ม 0-10 นาที</span>
                                        </div>
                                        <span className={`text-xs font-bold ${isFull ? 'text-red-400' : 'text-gray-400'}`}>
                                            {s.count}/{s.maxPerSlot} คัน
                                        </span>
                                    </button>
                                );
                            })}
                            <button
                                onClick={() => handleSetSlot(slotListingId, null)}
                                disabled={slotSaving}
                                className="w-full flex items-center justify-between p-3 rounded-xl border border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition text-gray-500 text-sm font-medium"
                            >
                                <span>ให้ระบบจัดให้อัตโนมัติ</span>
                                {slotInfo && <span className="text-xs text-gray-400">{slotInfo.unassigned} คัน</span>}
                            </button>
                        </div>
                        <button
                            onClick={() => { setSlotListingId(null); setSlotInfo(null); }}
                            className="w-full py-2.5 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition"
                        >
                            ยกเลิก
                        </button>
                    </div>
                </div>
            )}

            {toastMsg && <Toast message={toastMsg.message} type={toastMsg.type} />}

            <SlotPurchaseModal
                open={showSlotModal}
                onClose={() => setShowSlotModal(false)}
                onSuccess={() => {
                    showToast('ส่งคำขอซื้อ slot สำเร็จ รอ admin ตรวจสอบ', 'success');
                    if (user) fetchPackageInfo(user.id);
                }}
            />
        </div>
    );
}
