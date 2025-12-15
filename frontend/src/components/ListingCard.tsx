"use client";

import React from 'react';
import Link from 'next/link';
import {
    Heart,
    Gauge,
    GasPump,
    Motorcycle,
    MapPin,
    CalendarBlank,
    Image as ImageIcon
} from '@phosphor-icons/react';

// Types
export interface VehicleListing {
    id: string;
    title: string;
    price: number;
    negotiable: boolean;
    vehicleType: 'CAR' | 'MOTORCYCLE';
    brand: string;
    model: string;
    year: number;
    mileage: number | null;
    fuelType: string;
    transmission: string | null;
    province: string;
    viewCount: number;
    images: { url: string; isPrimary: boolean }[];
    user: {
        id: string;
        fullName: string;
    };
    createdAt: string;
}

interface ListingCardProps {
    listing: VehicleListing;
    onFavoriteClick?: (id: string) => void;
}

// Fuel type labels
const getFuelTypeLabel = (fuelType: string) => {
    const labels: Record<string, string> = {
        'PETROL': 'เบนซิน',
        'DIESEL': 'ดีเซล',
        'HYBRID': 'ไฮบริด',
        'PLUGIN_HYBRID': 'ปลั๊กอิน',
        'ELECTRIC': 'ไฟฟ้า',
        'LPG': 'LPG',
        'NGV': 'NGV'
    };
    return labels[fuelType] || fuelType;
};

// Format price with thousand separator
const formatPrice = (price: number | string) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return numPrice.toLocaleString('th-TH');
};

export default function ListingCard({ listing, onFavoriteClick }: ListingCardProps) {
    return (
        <Link
            href={`/buy/${listing.id}`}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition duration-300 group cursor-pointer relative flex flex-col h-full"
        >
            {/* Image */}
            <div className="relative aspect-[4/3] overflow-hidden">
                {listing.images[0] ? (
                    <img
                        src={listing.images[0].url}
                        alt={listing.title}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition duration-500"
                    />
                ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                        <ImageIcon size={48} weight="thin" />
                    </div>
                )}

                {/* Vehicle Type Badge */}
                {listing.vehicleType === 'MOTORCYCLE' && (
                    <div className="absolute top-3 left-3 bg-primary text-white p-1.5 rounded-full">
                        <Motorcycle weight="bold" size={14} />
                    </div>
                )}

                {/* Favorite Button */}
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        onFavoriteClick?.(listing.id);
                    }}
                    className="absolute top-3 right-3 w-8 h-8 bg-white/80 backdrop-blur rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-white transition duration-200"
                >
                    <Heart size={18} />
                </button>

                {/* Province Badge */}
                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/60 to-transparent p-4 pt-10">
                    <span className="text-white text-[10px] font-medium bg-black/40 px-2 py-1 rounded backdrop-blur-md flex items-center gap-1 w-fit">
                        <MapPin size={10} weight="fill" />
                        {listing.province === 'กรุงเทพมหานคร' ? 'กรุงเทพฯ' : listing.province}
                    </span>
                </div>
            </div>

            {/* Details */}
            <div className="p-4 flex flex-col flex-grow">
                <h3 className="font-bold text-lg text-gray-800 leading-snug group-hover:text-primary transition line-clamp-2 mb-2">
                    {listing.title}
                </h3>

                {/* Specs */}
                <div className="grid grid-cols-3 gap-2 text-xs text-gray-500 mb-4 bg-gray-50 p-2.5 rounded-xl border border-gray-50">
                    <div className="flex flex-col items-center justify-center gap-1 border-r border-gray-200">
                        <CalendarBlank size={16} className="text-primary" />
                        <span>{listing.year}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center gap-1 border-r border-gray-200">
                        <Gauge size={16} className="text-primary" />
                        <span>{listing.mileage ? `${(listing.mileage / 1000).toFixed(0)}k กม.` : '-'}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center gap-1">
                        <GasPump size={16} className="text-primary" />
                        <span>{getFuelTypeLabel(listing.fuelType)}</span>
                    </div>
                </div>

                {/* Price */}
                <div className="mt-auto mb-3">
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-accent">฿{formatPrice(listing.price)}</span>
                        {listing.negotiable && (
                            <span className="text-xs text-gray-400">ต่อรองได้</span>
                        )}
                    </div>
                </div>

                <hr className="border-gray-100 mb-3" />

                {/* Seller */}
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-bold">
                        {listing.user.fullName.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs text-gray-600 truncate max-w-[120px]">{listing.user.fullName}</span>
                    <span className="ml-auto text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-500 font-medium">
                        {listing.vehicleType === 'CAR' ? 'รถยนต์' : 'มอเตอร์ไซค์'}
                    </span>
                </div>
            </div>
        </Link>
    );
}
