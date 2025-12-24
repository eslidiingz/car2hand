"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
    Faders,
    X,
    CircleNotch,
    MagnifyingGlass,
    Car,
    Motorcycle
} from '@phosphor-icons/react';
import ListingCard, { VehicleListing } from '@/components/ListingCard';
import LoginModal from '@/components/LoginModal';
import RegisterModal from '@/components/RegisterModal';

interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

// Types
interface Brand {
    id: string;
    name: string;
    nameTh: string | null;
    logo: string | null;
    vehicleType: 'CAR' | 'MOTORCYCLE';
}


function BuyContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [listings, setListings] = useState<VehicleListing[]>([]);
    const [pagination, setPagination] = useState<PaginationInfo | null>(null);
    const [brandStats, setBrandStats] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);

    // Filters - Initialize directly from searchParams to avoid double-fetch/race condition
    const [brands, setBrands] = useState<Brand[]>([]);
    const [vehicleType, setVehicleType] = useState<'CAR' | 'MOTORCYCLE' | ''>((searchParams.get('vehicleType') as any) || '');
    const [selectedBrands, setSelectedBrands] = useState<string[]>(searchParams.get('brand')?.split(',').filter(Boolean) || []);
    const [brandSearch, setBrandSearch] = useState('');
    const [bodyType, setBodyType] = useState(searchParams.get('bodyType') || '');
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
    const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
    const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
    const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));

    // Synchronize filters when searchParams change (e.g. user navigates back/forward)
    useEffect(() => {
        const vType = searchParams.get('vehicleType');
        const bType = searchParams.get('bodyType');
        const brands = searchParams.get('brand');
        const minP = searchParams.get('minPrice');
        const maxP = searchParams.get('maxPrice');
        const q = searchParams.get('q');
        const p = searchParams.get('page');

        if (vType === 'CAR' || vType === 'MOTORCYCLE' || vType === '') setVehicleType(vType as any || '');
        if (bType !== null) setBodyType(bType);
        if (brands !== null) setSelectedBrands(brands.split(',').filter(Boolean));
        if (minP !== null) setMinPrice(minP);
        if (maxP !== null) setMaxPrice(maxP);
        if (q !== null) setSearchQuery(q);
        if (p !== null) setPage(parseInt(p));
    }, [searchParams]);

    // Login modal
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);

    const handleSwitchToRegister = () => {
        setShowLoginModal(false);
        setShowRegisterModal(true);
    };

    const handleSwitchToLogin = () => {
        setShowRegisterModal(false);
        setShowLoginModal(true);
    };

    const fetchListings = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('status', 'ACTIVE');
            params.append('page', page.toString());
            params.append('limit', '12');

            if (vehicleType) params.append('vehicleType', vehicleType);
            if (bodyType) params.append('bodyType', bodyType);
            if (searchQuery) params.append('q', searchQuery);
            if (selectedBrands.length > 0) params.append('brand', selectedBrands.join(','));
            if (minPrice) params.append('minPrice', minPrice);
            if (maxPrice) params.append('maxPrice', maxPrice);

            console.log('Fetching listings with params:', params.toString());
            const response = await fetch(`http://localhost:8000/listings?${params.toString()}`);
            const data = await response.json();

            setListings(data.listings || []);
            setPagination(data.pagination);
            setBrandStats(data.brandStats || {});
        } catch (error) {
            console.error('Error fetching listings:', error);
            setListings([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchBrands = async () => {
        try {
            const params = new URLSearchParams();
            if (vehicleType) params.append('vehicleType', vehicleType);

            const response = await fetch(`http://localhost:8000/master-data/brands?${params.toString()}`);
            const data = await response.json();
            if (data.success) {
                setBrands(data.brands);
            }
        } catch (error) {
            console.error('Error fetching brands:', error);
        }
    };

    useEffect(() => {
        fetchBrands();
    }, [vehicleType]);

    useEffect(() => {
        fetchListings();
    }, [page, vehicleType, bodyType, searchQuery, selectedBrands, minPrice, maxPrice]);

    const clearFilters = () => {
        setVehicleType('');
        setBodyType('');
        setSearchQuery('');
        setSelectedBrands([]);
        setMinPrice('');
        setMaxPrice('');
        setPage(1);
        router.push('/buy');
    };

    const hasActiveFilters = vehicleType || bodyType || searchQuery || selectedBrands.length > 0 || minPrice || maxPrice;

    return (
        <div className="bg-surface text-gray-800 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 pt-8 pb-12 flex gap-6">

                {/* Sidebar Filters */}
                <aside className="hidden lg:block w-1/4 min-w-[280px]">
                    <div className="bg-white p-5 rounded-2xl shadow-sm sticky top-24 border border-gray-100 h-[calc(100vh-120px)] flex flex-col">
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
                        <div className="mb-6 flex-1 flex flex-col min-h-0">
                            <label className="text-sm font-semibold mb-3 block">ยี่ห้อ</label>

                            {/* Brand Search Input */}
                            <div className="relative mb-3">
                                <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="ค้นหายี่ห้อ..."
                                    value={brandSearch}
                                    onChange={(e) => setBrandSearch(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary transition"
                                />
                            </div>

                            <div className="relative flex-1 min-h-0">
                                <div className="space-y-1 pr-2 h-full overflow-y-auto custom-scrollbar pb-6">
                                    {brands.filter(b =>
                                        b.name.toLowerCase().includes(brandSearch.toLowerCase()) ||
                                        (b.nameTh && b.nameTh.toLowerCase().includes(brandSearch.toLowerCase()))
                                    ).map(b => (
                                        <label key={b.id} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition duration-200 group">
                                            <div className="relative flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedBrands.includes(b.name)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedBrands([...selectedBrands, b.name]);
                                                        } else {
                                                            setSelectedBrands(selectedBrands.filter(s => s !== b.name));
                                                        }
                                                        setPage(1);
                                                    }}
                                                    className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded-md checked:bg-primary checked:border-primary transition-all duration-200 cursor-pointer"
                                                />
                                                <svg className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200 pointer-events-none left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                                                    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="20 6 9 17 4 12"></polyline>
                                                </svg>
                                            </div>
                                            <span className={`text-sm transition-colors duration-200 ${selectedBrands.includes(b.name) ? 'text-primary font-bold' : 'text-gray-600 group-hover:text-primary'}`}>
                                                {b.name} <span className="text-xs text-gray-400 font-normal ml-1">({brandStats[b.name] || 0})</span>
                                            </span>
                                        </label>
                                    ))}
                                    {brands.filter(b =>
                                        b.name.toLowerCase().includes(brandSearch.toLowerCase()) ||
                                        (b.nameTh && b.nameTh.toLowerCase().includes(brandSearch.toLowerCase()))
                                    ).length === 0 && (
                                            <p className="text-xs text-center text-gray-400 py-4">ไม่พบยี่ห้อนี้</p>
                                        )}
                                </div>
                                {/* Visual cue: Bottom shadow/gradient for scrollable content */}
                                <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none"></div>
                            </div>
                        </div>


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
                                    {selectedBrands.length === 1 && ` ${selectedBrands[0]}`}
                                    {selectedBrands.length > 1 && ` (เลือกรายยี่ห้อ)`}
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
                                        {searchQuery && (
                                            <span className="bg-accent/10 text-accent border border-accent/20 px-3 py-1 rounded-full text-xs cursor-pointer flex items-center gap-1 hover:bg-accent/20 transition group"
                                                onClick={() => setSearchQuery('')}>
                                                ค้นหา: "{searchQuery}" <X className="group-hover:text-primary" size={12} />
                                            </span>
                                        )}
                                        {bodyType && (
                                            <span className="bg-blue-50 text-primary border border-primary/20 px-3 py-1 rounded-full text-xs cursor-pointer flex items-center gap-1 hover:bg-blue-100 transition group"
                                                onClick={() => setBodyType('')}>
                                                ประเภท: {bodyType} <X className="group-hover:text-accent" size={12} />
                                            </span>
                                        )}
                                        {selectedBrands.map(b => (
                                            <span key={b} className="bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full text-xs cursor-pointer flex items-center gap-1 hover:bg-primary/20 transition group"
                                                onClick={() => setSelectedBrands(selectedBrands.filter(brand => brand !== b))}>
                                                {b} <X className="group-hover:text-accent" size={12} />
                                            </span>
                                        ))}
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
                                    <ListingCard
                                        key={listing.id}
                                        listing={listing}
                                        onLoginRequired={() => setShowLoginModal(true)}
                                    />
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

            {/* Login Modal */}
            <LoginModal
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                onSwitchToRegister={handleSwitchToRegister}
            />

            {/* Register Modal */}
            <RegisterModal
                isOpen={showRegisterModal}
                onClose={() => setShowRegisterModal(false)}
                onSwitchToLogin={handleSwitchToLogin}
            />
        </div>
    );
}

export default function BuyPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <CircleNotch size={48} className="animate-spin text-primary" />
            </div>
        }>
            <BuyContent />
        </Suspense>
    );
}
