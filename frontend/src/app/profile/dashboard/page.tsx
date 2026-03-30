"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Car,
    Eye,
    Heart,
    Warning,
    Plus,
    Megaphone,
    ListChecks,
    Phone,
    UserCircle,
    ClockCountdown,
    ArrowClockwise,
    CarProfile
} from '@phosphor-icons/react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface Listing {
    id: string;
    title: string;
    brand: string;
    model: string;
    year: number;
    status: string;
    viewCount: number;
    favoriteCount: number;
    expiredAt: string | null;
    images: Array<{ url: string; isPrimary: boolean }>;
}

export default function DashboardPage() {
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
        if (!storedUser) return;
        const userData = JSON.parse(storedUser);

        fetch(`${API_BASE}/listings/user/${userData.id}`)
            .then(r => r.json())
            .then(data => setListings(data.listings || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const activeListings = listings.filter(l => l.status === 'ACTIVE');
    const expiredListings = listings.filter(l => l.status === 'EXPIRED');
    const pendingListings = listings.filter(l => l.status === 'PENDING');

    const totalViews = listings.reduce((sum, l) => sum + l.viewCount, 0);
    const totalFavorites = listings.reduce((sum, l) => sum + l.favoriteCount, 0);

    const getDaysLeft = (expiredAt: string | null) => {
        if (!expiredAt) return null;
        const diff = Math.ceil((new Date(expiredAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return diff > 0 ? diff : 0;
    };

    const soonExpiring = activeListings.filter(l => {
        const days = getDaysLeft(l.expiredAt);
        return days !== null && days <= 7;
    });

    const getPrimaryImage = (images: Listing['images']) => {
        const primary = images.find(i => i.isPrimary);
        return primary?.url || images[0]?.url || '';
    };

    const stats = [
        { label: 'ประกาศกำลังขาย', value: activeListings.length.toString(), icon: <CarProfile weight="fill" className="text-blue-500" />, badge: null },
        { label: 'ยอดเข้าชมทั้งหมด', value: totalViews.toLocaleString(), icon: <Eye weight="fill" className="text-emerald-500" />, badge: null },
        { label: 'คนกดถูกใจ', value: totalFavorites.toLocaleString(), icon: <Heart weight="fill" className="text-red-500" />, badge: null },
        { label: 'ประกาศหมดอายุ', value: expiredListings.length.toString(), icon: <ClockCountdown weight="fill" className="text-orange-500" />, badge: expiredListings.length > 0 ? 'ต้องดำเนินการ' : null },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">ภาพรวมบัญชี (Dashboard)</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-gray-50 p-3 rounded-xl text-2xl">
                                {stat.icon}
                            </div>
                            {stat.badge && (
                                <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-full">{stat.badge}</span>
                            )}
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900 mb-1">{loading ? '-' : stat.value}</h3>
                        <p className="text-sm text-gray-500">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Expired Listings Alert */}
            {expiredListings.length > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-orange-100 p-2 rounded-xl">
                            <ClockCountdown weight="bold" className="text-xl text-orange-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-orange-800">ประกาศหมดอายุ ({expiredListings.length} รายการ)</h3>
                            <p className="text-xs text-orange-600">ประกาศเหล่านี้ไม่แสดงบนเว็บไซต์แล้ว กรุณาต่ออายุหรือลบเพื่อลงใหม่</p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        {expiredListings.slice(0, 5).map(listing => (
                            <div key={listing.id} className="flex items-center gap-3 bg-white rounded-xl p-3 border border-orange-100">
                                {getPrimaryImage(listing.images) ? (
                                    <img src={getPrimaryImage(listing.images)} alt="" className="w-14 h-10 rounded-lg object-cover flex-shrink-0" />
                                ) : (
                                    <div className="w-14 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                        <Car weight="bold" className="text-gray-300" />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-gray-800 truncate">
                                        {listing.year} {listing.brand} {listing.model}
                                    </p>
                                    <p className="text-xs text-orange-500 font-medium">
                                        หมดอายุเมื่อ {listing.expiredAt ? new Date(listing.expiredAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <Link
                        href="/profile/listings?status=EXPIRED"
                        className="flex items-center justify-center gap-2 mt-4 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition"
                    >
                        <ClockCountdown weight="bold" size={18} />
                        ดูรายการที่หมดอายุ ({expiredListings.length} รายการ)
                    </Link>
                </div>
            )}

            {/* Soon Expiring Alert */}
            {soonExpiring.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-amber-100 p-2 rounded-xl">
                            <Warning weight="bold" className="text-xl text-amber-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-amber-800">ประกาศใกล้หมดอายุ ({soonExpiring.length} รายการ)</h3>
                            <p className="text-xs text-amber-600">ประกาศเหล่านี้จะหมดอายุภายใน 7 วัน</p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        {soonExpiring.map(listing => {
                            const daysLeft = getDaysLeft(listing.expiredAt);
                            return (
                                <div key={listing.id} className="flex items-center gap-3 bg-white rounded-xl p-3 border border-amber-100">
                                    {getPrimaryImage(listing.images) ? (
                                        <img src={getPrimaryImage(listing.images)} alt="" className="w-14 h-10 rounded-lg object-cover flex-shrink-0" />
                                    ) : (
                                        <div className="w-14 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                            <Car weight="bold" className="text-gray-300" />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-gray-800 truncate">
                                            {listing.year} {listing.brand} {listing.model}
                                        </p>
                                        <p className="text-xs text-amber-600 font-bold">
                                            เหลืออีก {daysLeft} วัน
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/sell/create" className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-2xl transition shadow-sm group">
                    <div className="bg-white/20 p-2 rounded-xl group-hover:scale-110 transition">
                        <Plus weight="bold" className="text-xl" />
                    </div>
                    <div className="text-left">
                        <p className="font-bold">ลงขายรถรุ่นใหม่</p>
                        <p className="text-xs text-blue-100">เพิ่มโอกาสในการขาย</p>
                    </div>
                </Link>
                <Link href="/profile/listings" className="flex items-center gap-3 bg-white hover:bg-gray-50 text-gray-800 p-4 rounded-2xl border border-gray-100 transition shadow-sm group">
                    <div className="bg-orange-50 p-2 rounded-xl text-orange-500 group-hover:scale-110 transition">
                        <Megaphone weight="bold" className="text-xl" />
                    </div>
                    <div className="text-left">
                        <p className="font-bold text-gray-900">ดันประกาศ (Boost)</p>
                        <p className="text-xs text-gray-500">เพิ่มการมองเห็น 3 เท่า</p>
                    </div>
                </Link>
                <Link href="/profile/listings" className="flex items-center gap-3 bg-white hover:bg-gray-50 text-gray-800 p-4 rounded-2xl border border-gray-100 transition shadow-sm group">
                    <div className="bg-green-50 p-2 rounded-xl text-green-500 group-hover:scale-110 transition">
                        <ListChecks weight="bold" className="text-xl" />
                    </div>
                    <div className="text-left">
                        <p className="font-bold text-gray-900">จัดการประกาศ</p>
                        <p className="text-xs text-gray-500">แก้ไขหรือปิดการขาย</p>
                    </div>
                </Link>
            </div>

            {/* Listing Performance — real data */}
            {activeListings.length > 0 && (
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="font-bold text-lg text-gray-800">ประกาศของฉัน</h3>
                            <p className="text-xs text-gray-500">ประกาศที่กำลังขายอยู่</p>
                        </div>
                        <Link href="/profile/listings" className="text-blue-600 text-sm font-bold hover:underline">ดูทั้งหมด</Link>
                    </div>
                    <div className="space-y-4">
                        {activeListings.slice(0, 5).map(listing => {
                            const daysLeft = getDaysLeft(listing.expiredAt);
                            return (
                                <div key={listing.id} className="flex items-center gap-4">
                                    <div className="relative flex-shrink-0">
                                        {getPrimaryImage(listing.images) ? (
                                            <img src={getPrimaryImage(listing.images)} alt="" className="w-16 h-12 rounded-lg object-cover" />
                                        ) : (
                                            <div className="w-16 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                                                <Car weight="bold" className="text-gray-300" />
                                            </div>
                                        )}
                                        <span className="absolute -top-1.5 -right-1.5 bg-green-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">Active</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between mb-1">
                                            <span className="text-sm font-bold text-gray-800 truncate">{listing.year} {listing.brand} {listing.model}</span>
                                            <div className="flex gap-3 text-xs font-bold text-gray-500 flex-shrink-0 ml-2">
                                                <span className="flex items-center gap-1"><Eye className="text-blue-500" size={14} /> {listing.viewCount}</span>
                                                <span className="flex items-center gap-1"><Heart className="text-red-400" size={14} /> {listing.favoriteCount}</span>
                                            </div>
                                        </div>
                                        {daysLeft !== null && (
                                            <p className={`text-[11px] font-medium ${daysLeft <= 7 ? 'text-orange-500' : 'text-gray-400'}`}>
                                                เหลืออีก {daysLeft} วัน
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
