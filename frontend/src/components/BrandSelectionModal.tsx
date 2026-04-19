"use client";

import React, { useState, useEffect, useRef } from 'react';
import { X, Search, Star, ArrowRight } from 'lucide-react';

interface Brand {
    id: string;
    name: string;
    nameTh: string | null;
    logo?: string | null;
    isPopular: boolean;
}

interface BrandSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    brands: Brand[];
    selectedBrandId: string;
    onSelect: (brand: Brand) => void;
    loading?: boolean;
}

interface BrandCardProps {
    brand: Brand;
    isSelected: boolean;
    onClick: () => void;
}

function BrandCard({ brand, isSelected, onClick }: BrandCardProps) {
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center gap-2 p-3 bg-white rounded-2xl transition-all border-2 shadow-sm ${isSelected
                ? 'bg-blue-50 border-primary shadow-md shadow-blue-100 scale-105'
                : 'bg-white border-gray-100 hover:border-blue-200 hover:shadow-md hover:scale-[1.02]'
                }`}
        >
            <div className="flex items-center justify-center bg-[#ffffff] dark:bg-[#f1f5f9] rounded-xl overflow-hidden">
                {brand.logo ? (
                    <img src={brand.logo} alt={brand.name} className="w-full h-full object-contain" />
                ) : (
                    <span className="text-xl font-bold text-gray-400">{brand.name[0]}</span>
                )}
            </div>
            <div className="text-center">
                <div className={`font-bold leading-tight ${isSelected ? 'text-primary' : 'text-gray-800'}`}>
                    {brand.name}
                </div>
                {brand.nameTh && (
                    <div className="text-sm text-gray-700 mt-0.5">{brand.nameTh}</div>
                )}
            </div>
        </button>
    );
}

export default function BrandSelectionModal({
    isOpen,
    onClose,
    brands,
    selectedBrandId,
    onSelect,
    loading = false
}: BrandSelectionModalProps) {
    const [search, setSearch] = useState('');
    const [isVisible, setIsVisible] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            setSearch(''); // Clear search on open
            // Lock background scroll
            document.body.style.overflow = 'hidden';
            // Auto focus search
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 300);
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300);
            document.body.style.overflow = 'unset';
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const filteredBrands = brands.filter(brand =>
        brand.name.toLowerCase().includes(search.toLowerCase()) ||
        (brand.nameTh && brand.nameTh.toLowerCase().includes(search.toLowerCase()))
    );

    const popularBrands = filteredBrands.filter(b => b.isPopular);
    const otherBrands = filteredBrands.filter(b => !b.isPopular);

    if (!isOpen && !isVisible) return null;

    return (
        <div className={`fixed inset-0 z-[110] flex items-end sm:items-center justify-center transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className={`bg-white rounded-t-[2rem] sm:rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] sm:max-h-[80vh] overflow-hidden flex flex-col relative transform transition-transform duration-300 z-10 ${isOpen ? 'translate-y-0 scale-100' : 'translate-y-full sm:translate-y-0 sm:scale-95'}`}>

                {/* Header */}
                <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-20">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">เลือกยี่ห้อรถ</h2>
                        <p className="text-sm text-gray-500">เลือกจากรายการด้านล่างหรือค้นหา</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-500 transition"
                    >
                        <X />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="p-4 bg-white sticky top-[72px] sm:top-[88px] z-20 shadow-sm border-b border-gray-50">
                    <div className="relative">
                        <Search
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                            size={20}
                           
                        />
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="ค้นหายี่ห้อรถ (เช่น Toyota, Honda...)"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl text-lg focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                        />
                    </div>
                </div>

                {/* Brands List */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50/50 dark:bg-background/40">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                            <p className="text-gray-500 font-medium">กำลังโหลดข้อมูลยี่ห้อ...</p>
                        </div>
                    ) : (filteredBrands.length === 0) ? (
                        <div className="text-center py-20 px-6">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search size={32} className="text-gray-300" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 mb-1">ไม่พบยี่ห้อ "{search}"</h3>
                            <p className="text-gray-500">ลองค้นด้วยชื่ออื่นหรือเลือดยี่ห้อที่มีอยู่ในรายการ</p>
                        </div>
                    ) : (
                        <div className="space-y-8 pb-10">
                            {/* Popular Brands Grid */}
                            {popularBrands.length > 0 && !search && (
                                <div>
                                    <div className="flex items-center gap-2 mb-4 px-2">
                                        <Star className="text-amber-400" size={18} />
                                        <h3 className="font-bold text-gray-900 uppercase tracking-wider text-xs">ยี่ห้อยอดนิยม</h3>
                                    </div>
                                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                        {popularBrands.map(brand => (
                                            <BrandCard
                                                key={brand.id}
                                                brand={brand}
                                                isSelected={selectedBrandId === brand.id}
                                                onClick={() => onSelect(brand)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* All Brands or Search Results Grid */}
                            <div>
                                {(popularBrands.length > 0 && !search) && (
                                    <div className="flex items-center gap-2 mb-4 px-2">
                                        <h3 className="font-bold text-gray-900 uppercase tracking-wider text-xs">ยี่ห้อทั้งหมด</h3>
                                    </div>
                                )}
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                    {(search ? filteredBrands : otherBrands).map(brand => (
                                        <BrandCard
                                            key={brand.id}
                                            brand={brand}
                                            isSelected={selectedBrandId === brand.id}
                                            onClick={() => onSelect(brand)}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Mobile Handle - Visual indicator */}
                <div className="sm:hidden w-12 h-1 bg-gray-200 rounded-full mx-auto my-3 flex-shrink-0"></div>
            </div>
        </div>
    );
}
