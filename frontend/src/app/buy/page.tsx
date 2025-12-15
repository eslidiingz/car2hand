"use client";

import React, { useState, useEffect } from 'react';
import {
    Faders,
    X,
    CircleNotch,
    MagnifyingGlass,
    Car,
    Motorcycle
} from '@phosphor-icons/react';
import ListingCard, { VehicleListing } from '@/components/ListingCard';

interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

// Constants
const CAR_BRANDS = ['Toyota', 'Honda', 'Mazda', 'Nissan', 'Mitsubishi', 'Isuzu', 'Ford', 'BMW', 'Mercedes-Benz', 'MG', 'Chevrolet', 'Suzuki', 'Hyundai', 'Kia'];

export default function BuyPage() {
    const [listings, setListings] = useState<VehicleListing[]>([]);
    const [pagination, setPagination] = useState<PaginationInfo | null>(null);
    const [loading, setLoading] = useState(true);

    // Filters
    const [vehicleType, setVehicleType] = useState<'CAR' | 'MOTORCYCLE' | ''>('');
    const [brand, setBrand] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [page, setPage] = useState(1);

    const fetchListings = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('status', 'ACTIVE');
            params.append('page', page.toString());
            params.append('limit', '12');

            if (vehicleType) params.append('vehicleType', vehicleType);
            if (brand) params.append('brand', brand);
            if (minPrice) params.append('minPrice', minPrice);
            if (maxPrice) params.append('maxPrice', maxPrice);

            const response = await fetch(`http://localhost:8000/listings?${params.toString()}`);
            const data = await response.json();

            setListings(data.listings || []);
            setPagination(data.pagination);
        } catch (error) {
            console.error('Error fetching listings:', error);
            setListings([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchListings();
    }, [page, vehicleType, brand, minPrice, maxPrice]);

    const clearFilters = () => {
        setVehicleType('');
        setBrand('');
        setMinPrice('');
        setMaxPrice('');
        setPage(1);
    };

    const hasActiveFilters = vehicleType || brand || minPrice || maxPrice;

    return (
        <div className="bg-surface text-gray-800 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 pt-8 pb-12 flex gap-6">

                {/* Sidebar Filters */}
                <aside className="hidden lg:block w-1/4 min-w-[280px]">
                    <div className="bg-white p-5 rounded-2xl shadow-sm sticky top-24 border border-gray-100">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg text-primary flex items-center gap-2">
                                <Faders size={20} /> ตัวกรอง
                            </h3>
                            {hasActiveFilters && (
                                <button onClick={clearFilters} className="text-xs text-accent hover:underline">ล้างค่า</button>
                            )}
                        </div>

                        {/* Vehicle Type */}
                        <div className="mb-6">
                            <label className="text-sm font-semibold mb-3 block">ประเภทยานพาหนะ</label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setVehicleType(vehicleType === 'CAR' ? '' : 'CAR')}
                                    className={`flex-1 p-3 rounded-xl flex flex-col items-center gap-1 transition border-2 ${vehicleType === 'CAR' ? 'border-primary bg-blue-50 text-primary' : 'border-gray-200 text-gray-500 hover:border-primary'
                                        }`}
                                >
                                    <Car weight="bold" size={24} />
                                    <span className="text-xs font-medium">รถยนต์</span>
                                </button>
                                <button
                                    onClick={() => setVehicleType(vehicleType === 'MOTORCYCLE' ? '' : 'MOTORCYCLE')}
                                    className={`flex-1 p-3 rounded-xl flex flex-col items-center gap-1 transition border-2 ${vehicleType === 'MOTORCYCLE' ? 'border-primary bg-blue-50 text-primary' : 'border-gray-200 text-gray-500 hover:border-primary'
                                        }`}
                                >
                                    <Motorcycle weight="bold" size={24} />
                                    <span className="text-xs font-medium">มอเตอร์ไซค์</span>
                                </button>
                            </div>
                        </div>

                        <hr className="border-gray-100 mb-6" />

                        {/* Budget */}
                        <div className="mb-6">
                            <label className="text-sm font-semibold mb-2 block">งบประมาณ (บาท)</label>
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="number"
                                    placeholder="ต่ำสุด"
                                    value={minPrice}
                                    onChange={(e) => setMinPrice(e.target.value)}
                                    className="w-1/2 p-2 border border-gray-200 rounded-lg text-sm bg-gray-50 outline-none focus:border-primary"
                                />
                                <input
                                    type="number"
                                    placeholder="สูงสุด"
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(e.target.value)}
                                    className="w-1/2 p-2 border border-gray-200 rounded-lg text-sm bg-gray-50 outline-none focus:border-primary"
                                />
                            </div>
                        </div>

                        <hr className="border-gray-100 mb-6" />

                        {/* Brand */}
                        <div className="mb-6">
                            <label className="text-sm font-semibold mb-3 block">ยี่ห้อ</label>
                            <div className="space-y-1 max-h-48 overflow-y-auto">
                                {CAR_BRANDS.map(b => (
                                    <label key={b} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition duration-200">
                                        <input
                                            type="radio"
                                            name="brand"
                                            checked={brand === b}
                                            onChange={() => setBrand(brand === b ? '' : b)}
                                            className="accent-primary w-4 h-4"
                                        />
                                        <span className="text-sm">{b}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={() => setPage(1)}
                            className="w-full bg-primary text-white py-3 rounded-xl font-bold shadow-lg hover:bg-opacity-90 transition duration-300"
                        >
                            ค้นหา ({pagination?.total || 0} คัน)
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-50">
                            <div>
                                <h1 className="text-2xl font-bold text-primary">
                                    {vehicleType === 'CAR' ? 'รถยนต์' : vehicleType === 'MOTORCYCLE' ? 'มอเตอร์ไซค์' : 'รถทั้งหมด'}
                                    {brand && ` ${brand}`}
                                    <span className="text-gray-400 text-lg font-normal ml-2">({pagination?.total || 0} รายการ)</span>
                                </h1>
                                {hasActiveFilters && (
                                    <div className="flex gap-2 mt-3 flex-wrap">
                                        {vehicleType && (
                                            <span className="bg-gray-50 border border-gray-200 px-3 py-1 rounded-full text-xs cursor-pointer flex items-center gap-1 hover:border-accent hover:text-accent transition group"
                                                onClick={() => setVehicleType('')}>
                                                {vehicleType === 'CAR' ? 'รถยนต์' : 'มอเตอร์ไซค์'} <X className="group-hover:text-accent text-gray-400" size={12} />
                                            </span>
                                        )}
                                        {brand && (
                                            <span className="bg-gray-50 border border-gray-200 px-3 py-1 rounded-full text-xs cursor-pointer flex items-center gap-1 hover:border-accent hover:text-accent transition group"
                                                onClick={() => setBrand('')}>
                                                {brand} <X className="group-hover:text-accent text-gray-400" size={12} />
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Loading State */}
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="text-center">
                                <CircleNotch size={48} className="animate-spin text-primary mx-auto mb-4" />
                                <p className="text-gray-500">กำลังโหลด...</p>
                            </div>
                        </div>
                    ) : listings.length === 0 ? (
                        /* Empty State */
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                            <MagnifyingGlass size={64} className="text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-700 mb-2">ไม่พบรายการ</h3>
                            <p className="text-gray-500 mb-4">ลองเปลี่ยนตัวกรองหรือค้นหาใหม่</p>
                            {hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="bg-primary text-white px-6 py-2 rounded-xl font-bold hover:bg-opacity-90 transition"
                                >
                                    ล้างตัวกรอง
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* Listings Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {listings.map((listing) => (
                                    <ListingCard key={listing.id} listing={listing} />
                                ))}
                            </div>

                            {/* Pagination */}
                            {pagination && pagination.totalPages > 1 && (
                                <div className="mt-12 flex justify-center gap-2">
                                    <button
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="w-10 h-10 rounded-xl bg-white border border-gray-200 text-gray-500 hover:border-primary hover:text-primary hover:bg-gray-50 transition flex items-center justify-center shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        &lt;
                                    </button>
                                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                        let pageNum = i + 1;
                                        if (pagination.totalPages > 5 && page > 3) {
                                            pageNum = Math.min(page - 2 + i, pagination.totalPages - 4 + i);
                                        }
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setPage(pageNum)}
                                                className={`w-10 h-10 rounded-xl font-bold transition flex items-center justify-center shadow-sm ${page === pageNum
                                                    ? 'bg-primary text-white shadow-primary/30'
                                                    : 'bg-white border border-gray-200 text-gray-500 hover:border-primary hover:text-primary hover:bg-gray-50'
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                    <button
                                        onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                                        disabled={page === pagination.totalPages}
                                        className="w-10 h-10 rounded-xl bg-white border border-gray-200 text-gray-500 hover:border-primary hover:text-primary hover:bg-gray-50 transition flex items-center justify-center shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        &gt;
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}
