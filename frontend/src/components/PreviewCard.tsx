"use client";

import React from 'react';
import {
    Heart,
    Gauge,
    GasPump,
    Motorcycle,
    MapPin,
    CalendarBlank,
    Image as ImageIcon,
    Scales
} from '@phosphor-icons/react';

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
    sellerName = 'ผู้ขาย'
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
                        <ImageIcon size={48} weight="thin" />
                    </div>
                )}

                {/* Vehicle Type Badge */}
                {vehicleType === 'MOTORCYCLE' && (
                    <div className="absolute top-3 left-3 bg-primary text-white p-1.5 rounded-full">
                        <Motorcycle weight="bold" size={14} />
                    </div>
                )}

                {/* Compare Button (decorative) */}
                <div className="absolute top-3 right-12 w-8 h-8 bg-white/80 backdrop-blur rounded-full flex items-center justify-center text-gray-400">
                    <Scales size={18} />
                </div>

                {/* Favorite Button (decorative) */}
                <div className="absolute top-3 right-3 w-8 h-8 bg-white/80 backdrop-blur rounded-full flex items-center justify-center text-gray-400">
                    <Heart size={18} />
                </div>

                {/* Province Badge */}
                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/60 to-transparent p-4 pt-10">
                    <span className="text-white text-[10px] font-medium bg-black/40 px-2 py-1 rounded backdrop-blur-md flex items-center gap-1 w-fit">
                        <MapPin size={10} weight="fill" />
                        {province === 'กรุงเทพมหานคร' ? 'กรุงเทพฯ' : province}
                    </span>
                </div>
            </div>

            {/* Details */}
            <div className="p-4 flex flex-col flex-grow">
                <h3 className="font-bold text-lg text-gray-800 leading-snug line-clamp-2 mb-2">
                    {title || 'ชื่อรถของคุณ'}
                </h3>

                {/* Specs */}
                <div className="grid grid-cols-3 gap-1 text-xs text-gray-500 mb-4 bg-gray-50 p-2 rounded-xl border border-gray-50">
                    <div className="flex flex-col items-center justify-center gap-1 border-r border-gray-200 py-1">
                        <CalendarBlank size={16} className="text-primary" />
                        <span className="font-medium">{year}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center gap-1 border-r border-gray-200 py-1">
                        <Gauge size={16} className="text-primary" />
                        <span className="font-medium whitespace-nowrap">{mileageNum ? `${(mileageNum / 1000).toFixed(0)}k กม.` : '-'}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center gap-1 py-1 px-1">
                        <GasPump size={16} className="text-primary" />
                        <span className="font-medium text-center leading-tight">{getFuelTypeLabel(fuelType)}</span>
                    </div>
                </div>

                {/* Price & Seller */}
                <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-accent">฿{formatPrice(price)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-500">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-[12px] font-bold text-primary">{sellerName.charAt(0).toUpperCase()}</span>
                        </div>
                        <span className="text-sm font-semibold">{sellerName}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
