"use client";

import React from 'react';
import {
    Heart,
    Gauge,
    Fuel,
    Bike,
    MapPin,
    Calendar,
    ImageIcon,
    Scale,
    Eye,
} from 'lucide-react';

interface PreviewCardProps {
    title?: string;
    price?: number | string;
    vehicleType?: 'CAR' | 'MOTORCYCLE';
    year?: number;
    mileage?: number | string;
    fuelType?: string;
    province?: string;
    imageUrl?: string;
    sellerName?: string;
    sellerLogo?: string | null;
    viewCount?: number;
}

// Fuel type labels — match ListingCard
const getFuelTypeLabel = (fuelType?: string) => {
    if (!fuelType) return '-';
    const labels: Record<string, string> = {
        'PETROL': 'เบนซิน',
        'DIESEL': 'ดีเซล',
        'HYBRID': 'Hybrid',
        'PLUGIN_HYBRID': 'Plug-in',
        'EV': 'ไฟฟ้า (EV)',
        'LPG': 'LPG',
        'NGV': 'NGV'
    };
    return labels[fuelType] || fuelType;
};

// Format price with thousand separator
const formatPrice = (price?: number | string) => {
    if (!price) return '0';
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return numPrice.toLocaleString('th-TH');
};

export default function PreviewCard({
    title = 'ชื่อรถของคุณ',
    price = 0,
    vehicleType = 'CAR',
    year = new Date().getFullYear(),
    mileage = 0,
    fuelType = 'PETROL',
    province = 'กรุงเทพมหานคร',
    imageUrl,
    sellerName = 'ผู้ขาย',
    sellerLogo,
    viewCount = 0,
}: PreviewCardProps) {
    const mileageNum = typeof mileage === 'string' ? parseFloat(mileage) || 0 : mileage;

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            {/* Image */}
            <div className="relative aspect-3/2 overflow-hidden">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                        <ImageIcon size={48} strokeWidth={1} />
                    </div>
                )}

                {/* Vehicle Type Badge */}
                {vehicleType === 'MOTORCYCLE' && (
                    <div className="absolute top-3 left-3 bg-primary text-white p-1.5 rounded-full">
                        <Bike size={14} />
                    </div>
                )}

                {/* Compare Button (decorative) */}
                <div className="absolute top-3 right-12 w-8 h-8 bg-white/80 backdrop-blur rounded-full flex items-center justify-center text-gray-400">
                    <Scale size={18} />
                </div>

                {/* Favorite Button (decorative) */}
                <div className="absolute top-3 right-3 w-8 h-8 bg-white/80 backdrop-blur rounded-full flex items-center justify-center text-gray-400">
                    <Heart size={18} />
                </div>

                {/* Province Badge */}
                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/60 to-transparent p-4 pt-10">
                    <span className="text-white text-[10px] font-medium bg-black/40 px-2 py-1 rounded backdrop-blur-md flex items-center gap-1 w-fit">
                        <MapPin size={10} fill="currentColor" />
                        {province === 'กรุงเทพมหานคร' ? 'กรุงเทพฯ' : province}
                    </span>
                </div>
            </div>

            {/* Details */}
            <div className="p-4 flex flex-col flex-grow">
                <h3 className="font-bold text-lg text-gray-800 leading-snug line-clamp-2 mb-2">
                    {title || 'ชื่อรถของคุณ'}
                </h3>

                {/* Specs — 2x2 grid (matching ListingCard) */}
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-gray-500 mb-3">
                    <span className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-gray-400" />
                        <span className="font-medium">{year}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Gauge size={14} className="text-gray-400" />
                        <span className="font-medium">{mileageNum ? `${(mileageNum / 1000).toFixed(0)}k กม.` : '-'}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Fuel size={14} className="text-gray-400" />
                        <span className="font-medium">{getFuelTypeLabel(fuelType)}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Eye size={14} className="text-gray-400" />
                        <span className="font-medium">{viewCount > 0 ? viewCount.toLocaleString() : '0'}</span>
                    </span>
                </div>

                {/* Price & Seller (matching ListingCard) */}
                <div className="flex items-center justify-between mt-auto">
                    <span className="text-2xl font-bold text-accent">฿{formatPrice(price)}</span>
                    <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {sellerLogo ? (
                                <img src={sellerLogo} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-[11px] font-bold text-primary">{sellerName.charAt(0).toUpperCase()}</span>
                            )}
                        </div>
                        <span className="text-xs font-medium text-gray-500 truncate max-w-[100px]">{sellerName}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
