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
    CarProfile,
    Motorcycle,
    WarningCircle,
    CheckCircle
} from '@phosphor-icons/react';

interface VehicleListing {
    id: string;
    vehicleType: 'CAR' | 'MOTORCYCLE';
    title: string;
    brand: string;
    model: string;
    year: number;
    price: string;
    mileage: number;
    province: string;
    status: 'DRAFT' | 'PENDING' | 'ACTIVE' | 'INACTIVE' | 'SOLD' | 'EXPIRED' | 'SUSPENDED';
    viewCount: number;
    favoriteCount: number;
    createdAt: string;
    expiredAt: string | null;
    images: Array<{
        id: string;
        url: string;
        isPrimary: boolean;
    }>;
}

interface ApiResponse {
    listings: VehicleListing[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

const API_BASE = 'http://localhost:8000';

// Status mapping
const STATUS_CONFIG: Record<string, { label: string; bgColor: string; textColor: string; dotColor: string }> = {
    'ACTIVE': { label: 'กำลังขาย', bgColor: 'bg-green-100', textColor: 'text-green-700', dotColor: 'bg-green-500' },
    'PENDING': { label: 'รอตรวจสอบ', bgColor: 'bg-yellow-100', textColor: 'text-yellow-700', dotColor: 'bg-yellow-500' },
    'DRAFT': { label: 'แบบร่าง', bgColor: 'bg-gray-100', textColor: 'text-gray-500', dotColor: 'bg-gray-400' },
    'SOLD': { label: 'ขายแล้ว', bgColor: 'bg-blue-100', textColor: 'text-blue-700', dotColor: 'bg-blue-500' },
    'EXPIRED': { label: 'หมดอายุ', bgColor: 'bg-red-100', textColor: 'text-red-700', dotColor: 'bg-red-500' },
    'INACTIVE': { label: 'ไม่ใช้งาน', bgColor: 'bg-gray-100', textColor: 'text-gray-500', dotColor: 'bg-gray-400' },
    'SUSPENDED': { label: 'ถูกระงับ', bgColor: 'bg-red-100', textColor: 'text-red-700', dotColor: 'bg-red-500' },
};

export default function MyListingsPage() {
    const router = useRouter();
    const [listings, setListings] = useState<VehicleListing[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<{ id: string } | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

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
        const primary = images.find(img => img.isPrimary);
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
                    + ลงขายรถใหม่
                </Link>
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
                        ลงขายรถใหม่
                    </Link>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    {/* Header (Desktop) */}
                    <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wide">
                        <div className="col-span-5">รายละเอียดรถ</div>
                        <div className="col-span-2 text-center">สถานะ</div>
                        <div className="col-span-2 text-center">สถิติ</div>
                        <div className="col-span-3 text-right">ดำเนินการ</div>
                    </div>

                    {listings.map((item) => {
                        const status = STATUS_CONFIG[item.status] || STATUS_CONFIG['DRAFT'];
                        const daysLeft = getDaysLeft(item.expiredAt);

                        return (
                            <div key={item.id} className="p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition">
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">

                                    {/* Car Info */}
                                    <div className="col-span-5 flex gap-4">
                                        <div className="relative">
                                            <img
                                                src={getPrimaryImage(item.images)}
                                                className="w-24 h-16 object-cover rounded-lg bg-gray-100"
                                                alt={item.title}
                                            />
                                            {item.vehicleType === 'MOTORCYCLE' && (
                                                <div className="absolute -top-1 -right-1 bg-primary text-white p-1 rounded-full">
                                                    <Motorcycle weight="bold" size={10} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-gray-900 text-sm md:text-base truncate">{item.title}</h3>
                                            <div className="text-primary font-bold mt-1">{formatPrice(item.price)} บาท</div>
                                            {daysLeft !== null && item.status === 'ACTIVE' && (
                                                <span className="text-xs text-gray-400">เหลือ {daysLeft} วัน</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Status */}
                                    <div className="col-span-2 flex justify-center">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${status.bgColor} ${status.textColor}`}>
                                            <span className={`w-2 h-2 rounded-full ${status.dotColor}`}></span>
                                            {status.label}
                                        </span>
                                    </div>

                                    {/* Stats */}
                                    <div className="col-span-2 text-center">
                                        <div className="flex items-center justify-center gap-3 text-xs text-gray-500">
                                            <span className="flex items-center gap-1" title="ยอดดู">
                                                <Eye weight="bold" /> {item.viewCount}
                                            </span>
                                            <span className="flex items-center gap-1" title="บันทึก">
                                                <Heart weight="bold" /> {item.favoriteCount}
                                            </span>
                                        </div>
                                        <div className="text-[10px] text-gray-400 mt-1">
                                            ลงเมื่อ {formatDate(item.createdAt)}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="col-span-3 flex justify-end gap-2">
                                        <Link
                                            href={`/sell/edit/${item.id}`}
                                            className="tooltip p-2 text-gray-400 hover:text-primary hover:bg-white rounded-lg transition border border-transparent hover:border-gray-200"
                                            data-tooltip="แก้ไข"
                                        >
                                            <PencilSimple weight="bold" size={18} />
                                        </Link>
                                        <button
                                            className="tooltip p-2 text-gray-400 hover:text-accent hover:bg-white rounded-lg transition border border-transparent hover:border-gray-200"
                                            data-tooltip="ดันประกาศ"
                                        >
                                            <Megaphone weight="bold" size={18} />
                                        </button>
                                        {item.status === 'ACTIVE' && (
                                            <button
                                                className="tooltip p-2 text-gray-400 hover:text-green-600 hover:bg-white rounded-lg transition border border-transparent hover:border-gray-200"
                                                data-tooltip="ขายแล้ว"
                                            >
                                                <CurrencyCircleDollar weight="bold" size={18} />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => setDeleteConfirm(item.id)}
                                            className="tooltip p-2 text-gray-400 hover:text-red-500 hover:bg-white rounded-lg transition border border-transparent hover:border-gray-200"
                                            data-tooltip="ลบประกาศ"
                                        >
                                            <Trash weight="bold" size={18} />
                                        </button>
                                    </div>

                                </div>
                            </div>
                        );
                    })}
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
                                    className="flex-1 py-3 px-4 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    onClick={() => handleDelete(deleteConfirm)}
                                    disabled={deleting}
                                    className="flex-1 py-3 px-4 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {deleting ? (
                                        <>
                                            <CircleNotch weight="bold" className="animate-spin" />
                                            กำลังลบ...
                                        </>
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
