"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Scales,
    Trash,
    Heart,
    Plus,
    ArrowsLeftRight,
    CalendarBlank,
    Gauge,
    GasPump,
    MapPin,
    Image as ImageIcon,
    ArrowLeft,
    Warning
} from '@phosphor-icons/react';
import { useWishlist, WishlistItem } from '@/contexts/WishlistContext';

// Extended listing data for comparison
interface CompareItem extends WishlistItem {
    mileage?: number | null;
    fuelType?: string;
    transmission?: string | null;
    province?: string;
    vehicleType?: 'CAR' | 'MOTORCYCLE';
    negotiable?: boolean;
}

export default function ComparePage() {
    const { compareList, removeFromCompare, maxCompareItems, clearCompare, isLoggedIn } = useWishlist();
    const [compareItems, setCompareItems] = useState<CompareItem[]>([]);
    const [loading, setLoading] = useState(true);

    // Get items for comparison based on login status
    useEffect(() => {
        const fetchCompareData = async () => {
            setLoading(true);

            // Fetch full data for each item
            const enrichedItems: CompareItem[] = await Promise.all(
                compareList.map(async (item) => {
                    try {
                        const response = await fetch(`http://localhost:8000/listings/${item.id}`);
                        if (response.ok) {
                            const data = await response.json();
                            const listing = data.listing;
                            return {
                                ...item,
                                mileage: listing.mileage,
                                fuelType: listing.fuelType,
                                transmission: listing.transmission,
                                province: listing.province,
                                vehicleType: listing.vehicleType,
                                negotiable: listing.negotiable
                            };
                        }
                    } catch (error) {
                        console.error('Error fetching listing:', error);
                    }
                    return item;
                })
            );

            setCompareItems(enrichedItems);
            setLoading(false);
        };

        fetchCompareData();
    }, [compareList]);

    // Format price
    const formatPrice = (price: number) => {
        return price.toLocaleString('th-TH');
    };

    // Get fuel type label
    const getFuelTypeLabel = (fuelType?: string) => {
        const labels: Record<string, string> = {
            'PETROL': 'Petrol (เบนซิน)',
            'DIESEL': 'Diesel (ดีเซล)',
            'HYBRID': 'Hybrid (ไฮบริด)',
            'PLUGIN_HYBRID': 'Plug-in Hybrid (ปลั๊กอินไฮบริด)',
            'EV': 'EV (ไฟฟ้า)',
            'LPG': 'LPG (แก๊ส)',
            'NGV': 'NGV (แก๊ส)'
        };
        return fuelType ? labels[fuelType] || fuelType : '-';
    };

    // Get transmission label
    const getTransmissionLabel = (transmission?: string | null) => {
        const labels: Record<string, string> = {
            'AUTOMATIC': 'ออโต้',
            'MANUAL': 'ธรรมดา',
            'CVT': 'CVT',
            'DCT': 'DCT'
        };
        return transmission ? labels[transmission] || transmission : '-';
    };

    // Remove item from comparison
    const handleRemove = (id: string) => {
        removeFromCompare(id);
    };

    // Empty state
    if (!loading && compareItems.length === 0) {
        return (
            <div className="bg-surface text-gray-800 min-h-screen">
                <div className="max-w-3xl mx-auto px-4 py-16 text-center">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Scales size={48} weight="thin" className="text-gray-300" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-700 mb-3">ยังไม่มีรายการเปรียบเทียบ</h1>
                    <p className="text-gray-500 mb-8">
                        กดปุ่ม ⚖️ บนรายการรถที่สนใจเพื่อเพิ่มในรายการเปรียบเทียบ
                    </p>
                    <Link
                        href="/buy"
                        className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-opacity-90 transition"
                    >
                        <ArrowLeft size={20} />
                        ไปหน้าซื้อรถ
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-surface text-gray-800 min-h-screen">
            {/* Header */}
            <div className="pt-8 pb-4 bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
                            <Scales weight="fill" className="text-accent" /> เปรียบเทียบรถ
                        </h1>
                        <p className="text-sm text-gray-500">
                            เปรียบเทียบรถ {compareItems.length} คัน
                            {!isLoggedIn && compareList.length >= 3 && (
                                <span className="text-amber-600 ml-2">
                                    (เข้าสู่ระบบเพื่อเปรียบเทียบได้สูงสุด 5 คัน)
                                </span>
                            )}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Limit Info */}
                        <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg">
                            {compareItems.length}/{maxCompareItems} รายการ
                        </div>

                        {compareItems.length > 0 && (
                            <button
                                onClick={clearCompare}
                                className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1"
                            >
                                <Trash size={16} />
                                ล้างทั้งหมด
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Login Prompt for non-logged in users */}
            {!isLoggedIn && compareList.length >= 3 && (
                <div className="bg-amber-50 border-b border-amber-200">
                    <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
                        <Warning weight="fill" className="text-amber-500" size={20} />
                        <span className="text-sm text-amber-700">
                            กำลังเปรียบเทียบ {compareList.length} รายการ (สูงสุด {maxCompareItems})
                        </span>
                        <Link href="/buy" className="text-sm text-primary font-bold hover:underline ml-auto">
                            เข้าสู่ระบบเพื่อเปรียบเทียบเพิ่ม
                        </Link>
                    </div>
                </div>
            )}

            {/* Loading State */}
            {loading ? (
                <div className="max-w-7xl mx-auto px-4 py-16 text-center">
                    <div className="animate-pulse">
                        <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
                        <div className="h-6 bg-gray-200 rounded w-48 mx-auto"></div>
                    </div>
                </div>
            ) : (
                <div className="max-w-7xl mx-auto px-4 py-8 overflow-x-auto">
                    {/* Compare Grid */}
                    <div className={`grid gap-4 ${compareItems.length === 0 ? 'grid-cols-1 max-w-md mx-auto' :
                        compareItems.length === 1 && compareItems.length < maxCompareItems ? 'grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto' :
                            compareItems.length === 1 ? 'grid-cols-1 max-w-md mx-auto' :
                                compareItems.length === 2 && compareItems.length < maxCompareItems ? 'grid-cols-1 md:grid-cols-3' :
                                    compareItems.length === 2 ? 'grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto' :
                                        compareItems.length === 3 && compareItems.length < maxCompareItems ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' :
                                            compareItems.length === 3 ? 'grid-cols-1 md:grid-cols-3' :
                                                compareItems.length === 4 && compareItems.length < maxCompareItems ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-5' :
                                                    compareItems.length === 4 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' :
                                                        'grid-cols-1 md:grid-cols-2 lg:grid-cols-5'
                        }`}>
                        {compareItems.map((item, index) => (
                            <div key={item.id} className="flex flex-col gap-4">
                                {/* Car Header Card */}
                                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 relative h-[360px] flex flex-col">

                                    {/* Image */}
                                    <div className="relative mb-3">
                                        {item.imageUrl ? (
                                            <img
                                                src={item.imageUrl}
                                                className="w-full h-40 object-cover rounded-xl"
                                                alt={item.title}
                                            />
                                        ) : (
                                            <div className="w-full h-40 bg-gray-100 rounded-xl flex items-center justify-center">
                                                <ImageIcon size={48} weight="thin" className="text-gray-300" />
                                            </div>
                                        )}
                                        <button
                                            onClick={() => handleRemove(item.id)}
                                            className="absolute top-2 right-2 bg-white/80 p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-white transition"
                                        >
                                            <Trash weight="bold" size={16} />
                                        </button>
                                    </div>

                                    {/* Title - Fixed height */}
                                    <h3 className="font-bold text-gray-800 text-base leading-snug mb-2 line-clamp-2 h-[48px]">
                                        {item.title}
                                    </h3>

                                    {/* Price - Fixed height */}
                                    <div className="text-xl font-bold text-accent mb-3 h-[28px] flex items-center">
                                        ฿{formatPrice(item.price)}
                                        {item.negotiable && (
                                            <span className="text-xs font-normal text-gray-400 ml-1">ต่อรองได้</span>
                                        )}
                                    </div>

                                    {/* View Button - at bottom */}
                                    <Link
                                        href={`/buy/${item.id}`}
                                        className="block w-full py-2.5 rounded-xl font-bold text-sm text-center transition mt-auto bg-primary text-white hover:bg-opacity-90"
                                    >
                                        ดูรายละเอียด
                                    </Link>
                                </div>

                                {/* Specs */}
                                <div className="space-y-3">
                                    {/* Year */}
                                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3 h-[64px]">
                                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <CalendarBlank size={18} className="text-primary" />
                                        </div>
                                        <div>
                                            <div className="text-[10px] text-gray-400 uppercase tracking-wide">ปี</div>
                                            <div className="font-bold text-gray-800">{item.year}</div>
                                        </div>
                                    </div>

                                    {/* Mileage */}
                                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3 h-[64px]">
                                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <Gauge size={18} className="text-primary" />
                                        </div>
                                        <div>
                                            <div className="text-[10px] text-gray-400 uppercase tracking-wide">เลขไมล์</div>
                                            <div className="font-bold text-gray-800">
                                                {item.mileage
                                                    ? `${item.mileage.toLocaleString()} กม.`
                                                    : '-'
                                                }
                                            </div>
                                        </div>
                                    </div>

                                    {/* Fuel Type */}
                                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3 h-[64px]">
                                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <GasPump size={18} className="text-primary" />
                                        </div>
                                        <div>
                                            <div className="text-[10px] text-gray-400 uppercase tracking-wide">เชื้อเพลิง</div>
                                            <div className="font-bold text-gray-800">
                                                {getFuelTypeLabel(item.fuelType)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Transmission */}
                                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3 h-[64px]">
                                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <span className="text-primary font-bold text-sm">A</span>
                                        </div>
                                        <div>
                                            <div className="text-[10px] text-gray-400 uppercase tracking-wide">เกียร์</div>
                                            <div className="font-bold text-gray-800">
                                                {getTransmissionLabel(item.transmission)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Province */}
                                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3 h-[64px]">
                                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <MapPin size={18} className="text-primary" />
                                        </div>
                                        <div>
                                            <div className="text-[10px] text-gray-400 uppercase tracking-wide">จังหวัด</div>
                                            <div className="font-bold text-gray-800">
                                                {item.province === 'กรุงเทพมหานคร' ? 'กรุงเทพฯ' : item.province || '-'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Add More Card */}
                        {compareItems.length < maxCompareItems && (
                            <Link
                                href="/buy"
                                className="flex flex-col gap-4"
                            >
                                <div className="bg-gray-50 p-4 rounded-2xl border-2 border-dashed border-gray-300 h-[360px] flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary hover:bg-blue-50 transition group">
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition">
                                        <Plus weight="bold" className="text-2xl text-primary" />
                                    </div>
                                    <h3 className="font-bold text-gray-600 group-hover:text-primary">เพิ่มรถอีกคัน</h3>
                                    <p className="text-xs text-gray-400 mt-2">
                                        เหลืออีก {maxCompareItems - compareItems.length} รายการ
                                    </p>
                                </div>

                                {/* Placeholder specs */}
                                <div className="space-y-3 opacity-30 pointer-events-none">
                                    <div className="bg-gray-200 rounded-xl h-[64px]"></div>
                                    <div className="bg-gray-200 rounded-xl h-[64px]"></div>
                                    <div className="bg-gray-200 rounded-xl h-[64px]"></div>
                                    <div className="bg-gray-200 rounded-xl h-[64px]"></div>
                                    <div className="bg-gray-200 rounded-xl h-[64px]"></div>
                                </div>
                            </Link>
                        )}
                    </div>
                </div>
            )}

            {/* Mobile Hint */}
            <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900/80 text-white px-4 py-2 rounded-full text-xs backdrop-blur-sm pointer-events-none z-50 flex items-center gap-2">
                <ArrowsLeftRight weight="bold" /> ปัดซ้ายขวาเพื่อดูข้อมูล
            </div>
        </div>
    );
}
