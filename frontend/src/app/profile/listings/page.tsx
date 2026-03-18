"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
    WarningCircle
} from '@phosphor-icons/react';
import ProfileListingCard, { VehicleListing, STATUS_CONFIG } from '@/components/profile/ProfileListingCard';

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

export default function MyListingsPage() {
    const router = useRouter();
    const [listings, setListings] = useState<VehicleListing[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<{ id: string } | null>(null);
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'PENDING' | 'DRAFT' | 'SOLD' | 'INACTIVE'>('ALL');
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [activeMenu, setActiveMenu] = useState<string | null>(null);

    const statuses = [
        { key: 'ALL', label: 'ทั้งหมด', count: listings.length },
        { key: 'ACTIVE', label: 'กำลังขาย', count: listings.filter(l => l.status === 'ACTIVE').length },
        { key: 'PENDING', label: 'รอตรวจ', count: listings.filter(l => l.status === 'PENDING').length },
        { key: 'SOLD', label: 'ขายแล้ว', count: listings.filter(l => l.status === 'SOLD').length },
        { key: 'DRAFT', label: 'แบบร่าง', count: listings.filter(l => l.status === 'DRAFT').length },
        { key: 'INACTIVE', label: 'ปิดการขาย', count: listings.filter(l => l.status === 'INACTIVE').length },
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
    }, [router]);

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

            // Remove from local state
            setListings(prev => prev.filter(l => l.id !== listingId));
            setDeleteConfirm(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการลบประกาศ');
        } finally {
            setDeleting(false);
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

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <CircleNotch weight="bold" className="text-4xl text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">จัดการรถที่ลงขาย</h1>
                <Link href="/sell/create" className="bg-accent text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-orange-600 transition shadow-lg shadow-orange-100">
                    + ลงขายรถ
                </Link>
            </div>

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
                    <Link
                        href="/sell/create"
                        className="inline-block bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-opacity-90 transition"
                    >
                        ลงขายรถ
                    </Link>
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
        </div>
    );
}
