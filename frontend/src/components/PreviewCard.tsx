"use client";

import React from 'react';
import {
    Heart,
    Gauge,
    GasPump,
    Motorcycle,
    MapPin,
    CalendarBlank,
    Image as ImageIcon
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

// Fuel type labels
const getFuelTypeLabel = (fuelType?: string) => {
    if (!fuelType) return '-';
    const labels: Record<string, string> = {
        'PETROL': 'Petrol (เบนซิน)',
        'DIESEL': 'Diesel (ดีเซล)',
        'HYBRID': 'Hybrid (ไฮบริด)',
        'PLUGIN_HYBRID': 'Plug-in Hybrid (ปลั๊กอินไฮบริด)',
        'EV': 'EV (ไฟฟ้า)',
        'LPG': 'LPG (แก๊ส)',
        'NGV': 'NGV (แก๊ส)'
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
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            {/* Image */}
            <div className="relative aspect-[4/3] overflow-hidden">
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

                {/* Favorite Button */}
                <button className="absolute top-3 right-3 w-8 h-8 bg-white/80 backdrop-blur rounded-full flex items-center justify-center text-gray-400">
                    <Heart size={18} />
                </button>

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
                <div className="grid grid-cols-3 gap-2 text-xs text-gray-500 mb-4 bg-gray-50 p-2.5 rounded-xl border border-gray-50">
                    <div className="flex flex-col items-center justify-center gap-1 border-r border-gray-200">
                        <CalendarBlank size={16} className="text-primary" />
                        <span>{year}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center gap-1 border-r border-gray-200">
                        <Gauge size={16} className="text-primary" />
                        <span>{mileageNum ? `${(mileageNum / 1000).toFixed(0)}k กม.` : '-'}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center gap-1">
                        <GasPump size={16} className="text-primary" />
                        <span>{getFuelTypeLabel(fuelType)}</span>
                    </div>
                </div>

                {/* Price */}
                <div className="mt-auto mb-3">
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-accent">฿{formatPrice(price)}</span>
                    </div>
                </div>

                <hr className="border-gray-100 mb-3" />

                {/* Seller */}
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-bold">
                        {sellerName.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs text-gray-600 truncate max-w-[120px]">{sellerName}</span>
                    <span className="ml-auto text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-500 font-medium">
                        {vehicleType === 'CAR' ? 'รถยนต์' : 'มอเตอร์ไซค์'}
                    </span>
                </div>
            </div>
        </div>
    );
}
