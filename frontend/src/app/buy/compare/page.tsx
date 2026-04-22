"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Scale,
    Trash2,
    Plus,
    Calendar,
    Gauge,
    Fuel,
    MapPin,
    ImageIcon,
    ArrowLeft,
    Zap,
    Users,
    Settings,
    X,
} from 'lucide-react';
import { useWishlist, WishlistItem } from '@/contexts/WishlistContext';
import ConfirmDialog from '@/components/ConfirmDialog';

interface CompareItem extends WishlistItem {
    mileage?: number | null;
    fuelType?: string;
    transmission?: string | null;
    engineSize?: number | null;
    seats?: number | null;
    province?: string;
    vehicleType?: 'CAR' | 'MOTORCYCLE';
}

const formatPrice = (price: number) => price.toLocaleString('th-TH');

const getFuelTypeLabel = (fuelType?: string) => {
    const labels: Record<string, string> = {
        'PETROL': 'เบนซิน', 'DIESEL': 'ดีเซล', 'HYBRID': 'Hybrid',
        'PLUGIN_HYBRID': 'Plug-in', 'EV': 'ไฟฟ้า (EV)', 'LPG': 'LPG', 'NGV': 'NGV'
    };
    return fuelType ? labels[fuelType] || fuelType : '-';
};

const getTransmissionLabel = (t?: string | null) => {
    const labels: Record<string, string> = { 'AUTOMATIC': 'ออโต้', 'MANUAL': 'ธรรมดา', 'CVT': 'CVT', 'DCT': 'DCT' };
    return t ? labels[t] || t : '-';
};

// Spec row definition
const specRows = [
    { label: 'ราคา', icon: <span className="text-accent font-bold text-sm">฿</span>, getValue: (item: CompareItem) => `฿${formatPrice(item.price)}`, highlight: true },
    { label: 'ปี', icon: <Calendar size={16} className="text-primary" />, getValue: (item: CompareItem) => String(item.year || '-') },
    { label: 'เลขไมล์', icon: <Gauge size={16} className="text-primary" />, getValue: (item: CompareItem) => item.mileage ? `${item.mileage.toLocaleString()} กม.` : '-' },
    { label: 'เชื้อเพลิง', icon: <Fuel size={16} className="text-primary" />, getValue: (item: CompareItem) => getFuelTypeLabel(item.fuelType) },
    { label: 'เกียร์', icon: <Settings size={16} className="text-primary" />, getValue: (item: CompareItem) => getTransmissionLabel(item.transmission) },
    { label: 'เครื่องยนต์', icon: <Zap size={16} className="text-primary" />, getValue: (item: CompareItem) => item.engineSize ? `${item.engineSize.toLocaleString()} CC` : '-' },
    { label: 'ที่นั่ง', icon: <Users size={16} className="text-primary" />, getValue: (item: CompareItem) => item.seats ? `${item.seats} ที่นั่ง` : '-' },
    { label: 'จังหวัด', icon: <MapPin size={16} className="text-primary" />, getValue: (item: CompareItem) => item.province === 'กรุงเทพมหานคร' ? 'กรุงเทพฯ' : item.province || '-' },
];

export default function ComparePage() {
    const { compareList, removeFromCompare, maxCompareItems, clearCompare, isLoggedIn } = useWishlist();
    const [compareItems, setCompareItems] = useState<CompareItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showClearConfirm, setShowClearConfirm] = useState(false);

    useEffect(() => {
        const fetchCompareData = async () => {
            setLoading(true);
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
            const enrichedItems: CompareItem[] = await Promise.all(
                compareList.map(async (item) => {
                    try {
                        const response = await fetch(`${API_URL}/listings/${item.id}`);
                        if (response.ok) {
                            const data = await response.json();
                            const listing = data.listing;
                            return {
                                ...item,
                                mileage: listing.mileage, fuelType: listing.fuelType,
                                transmission: listing.transmission, engineSize: listing.engineSize,
                                seats: listing.seats, province: listing.province,
                                vehicleType: listing.vehicleType
                            };
                        }
                    } catch (error) { console.error('Error fetching listing:', error); }
                    return item;
                })
            );
            setCompareItems(enrichedItems);
            setLoading(false);
        };
        fetchCompareData();
    }, [compareList]);

    // Empty state
    if (!loading && compareItems.length === 0) {
        return (
            <div className="bg-surface min-h-screen flex items-center justify-center px-4">
                <div className="text-center max-w-sm">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
                        <Scale size={40} strokeWidth={1} className="text-gray-300" />
                    </div>
                    <h1 className="text-xl font-bold text-gray-700 mb-2">ยังไม่มีรายการเปรียบเทียบ</h1>
                    <p className="text-gray-500 text-sm mb-6">กดปุ่ม ⚖️ บนรายการรถที่สนใจเพื่อเพิ่มในรายการเปรียบเทียบ</p>
                    <Link href="/buy" className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-opacity-90 transition text-sm">
                        <ArrowLeft size={18} /> ไปหน้าซื้อรถ
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-surface min-h-screen">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-white border-b border-gray-100 shadow-sm">
                <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/buy" className="p-2 hover:bg-gray-100 rounded-lg transition">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-lg font-bold text-gray-800">เปรียบเทียบรถ</h1>
                            <p className="text-xs text-gray-500">{compareItems.length}/{maxCompareItems} คัน</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href="/buy" className="text-xs font-bold text-primary bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition flex items-center gap-1">
                            <Plus size={14} /> เพิ่ม
                        </Link>
                        {compareItems.length > 0 && (
                            <button onClick={() => setShowClearConfirm(true)} className="text-xs text-red-500 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-lg transition">
                                <Trash2 size={16} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <ConfirmDialog
                open={showClearConfirm}
                onClose={() => setShowClearConfirm(false)}
                onConfirm={() => { clearCompare(); setShowClearConfirm(false); }}
                icon={<Trash2 size={28} />}
                title="ล้างรายการเปรียบเทียบ?"
                description="รายการเปรียบเทียบทั้งหมดจะถูกลบ"
                confirmLabel="ล้างทั้งหมด"
            />

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                </div>
            ) : (
                <div className="max-w-5xl mx-auto px-4 py-6">

                    {/* === MOBILE: Single scroll table === */}
                    <div className="lg:hidden">
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                            <table className="w-full" style={{ minWidth: `${Math.max(compareItems.length * 130 + 80, 320)}px` }}>
                                {/* Sticky car header */}
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        <th className="w-16 p-2 bg-white sticky top-0 z-10"></th>
                                        {compareItems.map((item) => (
                                            <th key={item.id} className="p-2 text-center bg-white sticky top-0 z-10 min-w-[110px]">
                                                <div className="relative">
                                                    <div className="aspect-4/3 rounded-lg overflow-hidden bg-gray-100">
                                                        {item.imageUrl ? (
                                                            <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <ImageIcon size={20} strokeWidth={1} className="text-gray-300" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <button onClick={() => removeFromCompare(item.id)} className="absolute -top-1 -right-1 bg-red-500 text-white p-0.5 rounded-full">
                                                        <X size={10} />
                                                    </button>
                                                </div>
                                                <p className="text-[10px] font-bold text-gray-700 mt-1 line-clamp-2 leading-tight">{item.title}</p>
                                                <Link href={`/buy/${item.id}`} className="text-[10px] text-primary font-bold">ดูเพิ่ม →</Link>
                                            </th>
                                        ))}
                                        {compareItems.length < maxCompareItems && (
                                            <th className="p-2 min-w-[80px] bg-white sticky top-0 z-10">
                                                <Link href="/buy" className="flex flex-col items-center justify-center h-16 border-2 border-dashed border-gray-200 rounded-lg hover:border-primary transition">
                                                    <Plus size={16} className="text-gray-300" />
                                                    <span className="text-[9px] font-bold text-gray-400 mt-0.5">เพิ่ม</span>
                                                </Link>
                                            </th>
                                        )}
                                    </tr>
                                </thead>
                                {/* Spec rows */}
                                <tbody>
                                    {specRows.map((spec, idx) => (
                                        <tr key={spec.label} className={idx % 2 === 0 ? 'bg-gray-50/50 dark:bg-muted/20' : ''}>
                                            <td className="px-2 py-2.5 text-center">
                                                <div className="flex flex-col items-center gap-0.5">
                                                    <span className="w-5 h-5 flex items-center justify-center">{spec.icon}</span>
                                                    <span className="text-[9px] text-gray-400 font-medium leading-tight">{spec.label}</span>
                                                </div>
                                            </td>
                                            {compareItems.map((item) => (
                                                <td key={item.id} className={`px-2 py-2.5 text-center text-xs font-bold ${spec.highlight ? 'text-accent' : 'text-gray-800'}`}>
                                                    {spec.getValue(item)}
                                                </td>
                                            ))}
                                            {compareItems.length < maxCompareItems && <td></td>}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* === DESKTOP: Table layout === */}
                    <div className="hidden lg:block">
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
                            <table className="w-full" style={{ minWidth: `${Math.max(compareItems.length * 180 + 140, 600)}px` }}>
                                {/* Header row with car images */}
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        <th className="w-36 p-4 text-left text-sm font-bold text-gray-500 bg-gray-50 sticky left-0 z-10 align-bottom">รายการ</th>
                                        {compareItems.map((item) => (
                                            <th key={item.id} className="p-4 text-center min-w-[180px] align-top">
                                                <div className="relative">
                                                    <div className="aspect-4/3 rounded-xl overflow-hidden bg-gray-100">
                                                        {item.imageUrl ? (
                                                            <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <ImageIcon size={40} strokeWidth={1} className="text-gray-300" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <button onClick={() => removeFromCompare(item.id)} className="absolute top-1 right-1 bg-white/80 p-1 rounded-full text-gray-400 hover:text-red-500 transition">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                                <p className="text-sm font-bold text-gray-800 mt-2 line-clamp-2 h-[40px]">{item.title}</p>
                                                <Link href={`/buy/${item.id}`} className="text-xs text-primary font-bold hover:underline inline-block">
                                                    ดูรายละเอียด →
                                                </Link>
                                            </th>
                                        ))}
                                        {compareItems.length < maxCompareItems && (
                                            <th className="p-4 text-center min-w-[180px] align-top">
                                                <Link href="/buy" className="flex flex-col items-center justify-center aspect-4/3 border-2 border-dashed border-gray-200 rounded-xl hover:border-primary hover:bg-blue-50 transition group">
                                                    <Plus size={24} className="text-gray-300 group-hover:text-primary" />
                                                    <span className="text-xs font-bold text-gray-400 group-hover:text-primary mt-2">เพิ่มรถอีกคัน</span>
                                                </Link>
                                            </th>
                                        )}
                                    </tr>
                                </thead>
                                {/* Spec rows */}
                                <tbody>
                                    {specRows.map((spec, idx) => (
                                        <tr key={spec.label} className={idx % 2 === 0 ? 'bg-gray-50/50 dark:bg-muted/20' : ''}>
                                            <td className="px-4 py-3 text-sm text-gray-500 font-medium sticky left-0 bg-white z-10">
                                                <span className="flex items-center gap-2 whitespace-nowrap">
                                                    {spec.icon} {spec.label}
                                                </span>
                                            </td>
                                            {compareItems.map((item) => (
                                                <td key={item.id} className={`px-4 py-3 text-center text-sm font-bold ${spec.highlight ? 'text-accent text-base' : 'text-gray-800'}`}>
                                                    {spec.getValue(item)}
                                                </td>
                                            ))}
                                            {compareItems.length < maxCompareItems && <td></td>}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
