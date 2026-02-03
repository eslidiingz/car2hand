"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
    Heart,
    Gauge,
    GasPump,
    Motorcycle,
    MapPin,
    CalendarBlank,
    Image as ImageIcon,
    Trash,
    Scales
} from '@phosphor-icons/react';
import { useWishlist, WishlistItem } from '@/contexts/WishlistContext';

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
    showRemoveButton?: boolean;  // Show trash button instead of heart
    onRemove?: (id: string) => void;  // Callback when remove button clicked
}

// Fuel type labels
const getFuelTypeLabel = (fuelType: string) => {
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
const formatPrice = (price: number | string) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return numPrice.toLocaleString('th-TH');
};

interface ListingCardFullProps extends ListingCardProps {
    onLoginRequired?: () => void;  // Callback when user needs to login for wishlist
}

export default function ListingCard({ listing, showRemoveButton = false, onRemove, onLoginRequired }: ListingCardFullProps) {
    const { isInWishlist, toggleWishlist, isLoggedIn, isInCompare, toggleCompare, maxCompareItems, compareList } = useWishlist();
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');

    const isFavorited = isInWishlist(listing.id);
    const isCompared = isInCompare(listing.id);

    const createWishlistItem = (): WishlistItem => ({
        id: listing.id,
        title: listing.title,
        price: typeof listing.price === 'string' ? parseFloat(listing.price) : listing.price,
        negotiable: listing.negotiable,
        vehicleType: listing.vehicleType,
        brand: listing.brand,
        model: listing.model,
        year: listing.year,
        mileage: listing.mileage,
        fuelType: listing.fuelType,
        transmission: listing.transmission,
        province: listing.province,
        imageUrl: listing.images[0]?.url,
        images: listing.images,
        user: listing.user,
        addedAt: new Date().toISOString()
    });

    const handleFavoriteClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const result = await toggleWishlist(createWishlistItem());

        // Check if login is required
        if (result.requiresLogin && onLoginRequired) {
            onLoginRequired();
            return;
        }

        setToastMessage(result.message);
        setToastType(result.success ? 'success' : 'error');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
    };

    const handleCompareClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const result = toggleCompare(createWishlistItem());

        setToastMessage(result.message);
        setToastType(result.success ? 'success' : 'error');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
    };

    return (
        <>
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

                    {/* Favorite/Remove Button */}
                    {showRemoveButton ? (
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onRemove?.(listing.id);
                            }}
                            className="absolute top-3 right-3 w-8 h-8 backdrop-blur rounded-full flex items-center justify-center transition duration-200 bg-red-500 text-white hover:bg-red-600"
                            title="ลบออกจากรายการโปรด"
                        >
                            <Trash size={18} weight="fill" />
                        </button>
                    ) : (
                        <button
                            onClick={handleFavoriteClick}
                            className={`absolute top-3 right-3 w-8 h-8 backdrop-blur rounded-full flex items-center justify-center transition duration-200 ${isFavorited
                                ? 'bg-red-500 text-white hover:bg-red-600'
                                : 'bg-white/80 text-gray-400 hover:text-red-500 hover:bg-white'
                                }`}
                            title={isFavorited ? 'ลบออกจากรายการโปรด' : 'เพิ่มในรายการโปรด'}
                        >
                            <Heart size={18} weight={isFavorited ? 'fill' : 'regular'} />
                        </button>
                    )}

                    {/* Compare Button */}
                    {!showRemoveButton && (
                        <button
                            onClick={handleCompareClick}
                            className={`absolute top-3 right-12 w-8 h-8 backdrop-blur rounded-full flex items-center justify-center transition duration-200 ${isCompared
                                ? 'bg-primary text-white hover:bg-primary/80'
                                : 'bg-white/80 text-gray-400 hover:text-primary hover:bg-white'
                                }`}
                            title={isCompared ? 'ลบออกจากรายการเปรียบเทียบ' : `เพิ่มในรายการเปรียบเทียบ (${compareList.length}/${maxCompareItems})`}
                        >
                            <Scales size={18} weight={isCompared ? 'fill' : 'regular'} />
                        </button>
                    )}

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
                    <div className="grid grid-cols-3 gap-1 text-xs text-gray-500 mb-4 bg-gray-50 p-2 rounded-xl border border-gray-50">
                        <div className="flex flex-col items-center justify-center gap-1 border-r border-gray-200 py-1">
                            <CalendarBlank size={16} className="text-primary" />
                            <span className="font-medium">{listing.year}</span>
                        </div>
                        <div className="flex flex-col items-center justify-center gap-1 border-r border-gray-200 py-1">
                            <Gauge size={16} className="text-primary" />
                            <span className="font-medium whitespace-nowrap">{listing.mileage ? `${(listing.mileage / 1000).toFixed(0)}k กม.` : '-'}</span>
                        </div>
                        <div className="flex flex-col items-center justify-center gap-1 py-1 px-1">
                            <GasPump size={16} className="text-primary" />
                            <span className="font-medium text-center leading-tight">{getFuelTypeLabel(listing.fuelType)}</span>
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
                        {listing.user?.fullName && listing.user.fullName !== 'ไม่ระบุ' ? (
                            <>
                                <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-bold">
                                    {listing.user.fullName.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-xs text-gray-600 truncate max-w-[120px]">{listing.user.fullName}</span>
                            </>
                        ) : (
                            <span className="text-xs text-gray-500 truncate max-w-[150px]">{listing.brand} {listing.model}</span>
                        )}
                        <span className="ml-auto text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-500 font-medium">
                            {listing.vehicleType === 'CAR' ? 'รถยนต์' : 'มอเตอร์ไซค์'}
                        </span>
                    </div>
                </div>
            </Link>

            {/* Toast Notification */}
            {showToast && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
                    <div
                        className={`px-6 py-3 rounded-2xl shadow-2xl animate-fade-in flex items-center gap-3 backdrop-blur-md border ${toastType === 'success'
                            ? 'bg-green-500/90 border-green-400 text-white'
                            : 'bg-red-500/90 border-red-400 text-white'
                            }`}
                    >
                        <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        <span className="text-base font-bold tracking-wide">{toastMessage}</span>
                    </div>
                </div>
            )}
        </>
    );
}
