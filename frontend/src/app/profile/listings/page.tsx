"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    Eye,
    Heart,
    PencilSimple,
    Megaphone,
    CurrencyCircleDollar,
    Trash,
    CircleNotch,
    DotsThreeVertical,
    Lightning,
    CarProfile,
    WarningCircle,
    Crown,
    ArrowRight
} from '@phosphor-icons/react';
import ProfileListingCard, { VehicleListing, STATUS_CONFIG } from '@/components/profile/ProfileListingCard';
import Toast from '@/components/Toast';

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
    const initialStatus = (['ALL', 'ACTIVE', 'PENDING', 'EXPIRED'] as const).includes(searchParams.get('status') as any)
        ? (searchParams.get('status') as 'ALL' | 'ACTIVE' | 'PENDING' | 'EXPIRED')
        : 'ALL';
    const [listings, setListings] = useState<VehicleListing[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<{ id: string } | null>(null);
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'PENDING' | 'EXPIRED'>(initialStatus);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const [packageInfo, setPackageInfo] = useState<PackageInfo | null>(null);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    const [renewId, setRenewId] = useState<string | null>(null);
    const [renewLoading, setRenewLoading] = useState(false);
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
    }, [router]);

    const fetchPackageInfo = async (userId: string) => {
        try {
            const response = await fetch(`${API_BASE}/packages/my?userId=${userId}`);
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
            const response = await fetch(`${API_BASE}/listings/${listingId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id })
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
            const res = await fetch(`${API_BASE}/listings/bump-slots?userId=${user.id}`);
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
            const response = await fetch(`${API_BASE}/listings/${listingId}/bump-slot`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, slot })
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
            const response = await fetch(`${API_BASE}/listings/${listingId}/bump`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id })
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
                const response = await fetch(`${API_BASE}/listings/${listingId}/renew`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: user.id })
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
            // Basic user → แสดง modal ต่ออายุ (จ่าย 50 บาท)
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
            const response = await fetch(`${API_BASE}/listings/${renewId}/renew`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, paymentSlip: slipBase64 })
            });
            const data = await response.json();
            if (response.ok) {
                setRenewId(null);
                showToast('ส่งคำขอต่ออายุแล้ว รอ admin ตรวจสอบ', 'success');
                fetchListings(user.id);
            } else {
                showToast(data.message || 'เกิดข้อผิดพลาด', 'error');
            }
        } catch {
            showToast('เกิดข้อผิดพลาด', 'error');
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
                <CircleNotch weight="bold" className="text-4xl text-primary animate-spin" />
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
                        ? 'bg-gradient-to-r from-red-50 to-orange-50 border-red-200'
                        : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
                }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <Crown weight="fill" className={`text-lg ${isAtLimit ? 'text-orange-500' : 'text-blue-500'}`} />
                                <span className="font-bold text-gray-700 text-sm">
                                    {packageInfo.currentPackage?.nameTh || 'แพ็กเกจพื้นฐาน'}
                                </span>
                            </div>
                            <div className="flex items-baseline gap-1.5 mb-2">
                                <span className={`text-2xl font-bold ${isAtLimit ? 'text-red-600' : 'text-gray-800'}`}>
                                    {packageInfo.usage.activeListings}
                                </span>
                                <span className="text-gray-400 text-sm">/</span>
                                <span className="text-gray-500 text-sm font-semibold">
                                    {isUnlimited ? 'ไม่จำกัด' : `${packageInfo.usage.maxListings} รายการ`}
                                </span>
                            </div>
                            {!isUnlimited && (
                                <div className="w-full bg-white/70 rounded-full h-2 overflow-hidden">
                                    <div
                                        className={`h-2 rounded-full transition-all duration-500 ${isAtLimit ? 'bg-gradient-to-r from-red-400 to-orange-500' : 'bg-gradient-to-r from-blue-400 to-indigo-500'}`}
                                        style={{ width: `${usagePercent}%` }}
                                    />
                                </div>
                            )}
                        </div>
                        {isAtLimit && (
                            <Link
                                href="/profile/packages"
                                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold text-sm hover:from-orange-600 hover:to-red-600 transition-all shadow-lg shadow-orange-200 whitespace-nowrap"
                            >
                                อัพเกรดแพ็กเกจ
                                <ArrowRight weight="bold" className="text-sm" />
                            </Link>
                        )}
                    </div>
                    {isAtLimit && (
                        <p className="text-xs text-red-500 mt-2 font-medium">
                            สิทธิการลงประกาศเต็มแล้ว อัพเกรดแพ็กเกจเพื่อลงประกาศเพิ่มเติม
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
                    <WarningCircle weight="bold" className="text-xl flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {listings.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CarProfile weight="duotone" className="text-4xl text-gray-400" />
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
                                <Trash weight="bold" className="text-3xl text-red-500" />
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
                                        <CircleNotch weight="bold" className="animate-spin" />
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
                            <Crown weight="fill" className="text-4xl text-white" />
                        </div>

                        <h3 className="text-xl font-bold text-gray-800 mb-2">สิทธิการลงประกาศเต็มแล้ว</h3>
                        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                            คุณใช้สิทธิลงประกาศครบ {packageInfo?.usage.maxListings} รายการตามแพ็กเกจปัจจุบันแล้ว อัพเกรดแพ็กเกจเพื่อลงประกาศเพิ่มเติม
                        </p>

                        <div className="flex flex-col gap-3">
                            <Link
                                href="/profile/packages"
                                className="w-full py-3.5 px-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold hover:from-orange-600 hover:to-red-600 transition-all shadow-lg shadow-orange-200 flex items-center justify-center gap-2"
                            >
                                ดูแพ็กเกจ
                                <ArrowRight weight="bold" className="text-sm" />
                            </Link>
                            <button
                                onClick={() => setShowUpgradeModal(false)}
                                className="w-full py-3 px-4 border border-gray-200 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition"
                            >
                                ยกเลิก
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Renewal Modal (Basic user — จ่าย 50 บาท) */}
            {renewId && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setRenewId(null)}
                    ></div>
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 relative z-10">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ArrowRight weight="bold" className="text-3xl text-emerald-500 rotate-[-45deg]" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">ต่ออายุประกาศ</h3>
                            <p className="text-gray-500 text-sm mb-4">
                                ต่ออายุประกาศ 30 วัน ในราคา <span className="font-bold text-orange-500">50 บาท</span>
                            </p>

                            {paymentInfo && (
                                <div className="bg-gray-50 rounded-xl p-4 mb-4 text-left text-sm">
                                    <p className="font-bold text-gray-700 mb-2">ข้อมูลการชำระเงิน:</p>
                                    {paymentInfo.bankName && <p className="text-gray-600">ธนาคาร: {paymentInfo.bankName}</p>}
                                    {paymentInfo.accountName && <p className="text-gray-600">ชื่อบัญชี: {paymentInfo.accountName}</p>}
                                    {paymentInfo.accountNumber && <p className="text-gray-600">เลขบัญชี: {paymentInfo.accountNumber}</p>}
                                </div>
                            )}

                            <label className="block mb-4">
                                <span className="block text-sm font-bold text-gray-700 mb-2 text-left">อัพโหลดสลิปการโอนเงิน</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:font-bold file:bg-emerald-50 file:text-emerald-600 hover:file:bg-emerald-100"
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                            handleBasicRenew(reader.result as string);
                                        };
                                        reader.readAsDataURL(file);
                                    }}
                                    disabled={renewLoading}
                                />
                            </label>

                            {renewLoading && (
                                <div className="flex items-center justify-center gap-2 text-emerald-600 font-medium mb-4">
                                    <CircleNotch weight="bold" className="animate-spin" />
                                    กำลังส่งคำขอ...
                                </div>
                            )}

                            <div className="flex gap-3 mt-2">
                                <button
                                    onClick={() => setRenewId(null)}
                                    disabled={renewLoading}
                                    className="flex-1 py-3 px-4 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition"
                                >
                                    ยกเลิก
                                </button>
                            </div>

                            <p className="text-xs text-gray-400 mt-4">
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
        </div>
    );
}
