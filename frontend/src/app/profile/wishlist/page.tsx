"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Heart,
    Check,
    Warning,
    ArrowClockwise
} from '@phosphor-icons/react';
import { useWishlist } from '@/contexts/WishlistContext';
import ListingCard, { VehicleListing } from '@/components/ListingCard';

export default function WishlistPage() {
    const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
    const [toastMessage, setToastMessage] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [hasOldData, setHasOldData] = useState(false);

    // Check if wishlist has items with missing data (old format)
    useEffect(() => {
        const hasIncomplete = wishlist.some(item => !item.mileage || !item.user?.fullName || item.user?.fullName === 'ไม่ระบุ');
        setHasOldData(hasIncomplete && wishlist.length > 0);
    }, [wishlist]);

    const handleRemove = (id: string) => {
        const item = wishlist.find(w => w.id === id);
        removeFromWishlist(id);

        setToastMessage(`ลบ "${item?.title || 'รายการ'}" ออกจากรายการโปรดแล้ว`);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
    };

    const handleClearAll = () => {
        if (confirm('คุณต้องการลบรายการทั้งหมดหรือไม่? หลังจากลบแล้วสามารถเพิ่มใหม่เพื่อให้แสดงข้อมูลครบถ้วน')) {
            clearWishlist();
            setToastMessage('ลบรายการทั้งหมดแล้ว');
            setShowToast(true);
            setTimeout(() => setShowToast(false), 2000);
        }
    };

    // Convert WishlistItem to VehicleListing format
    const convertToListing = (item: typeof wishlist[0]): VehicleListing => ({
        id: item.id,
        title: item.title,
        price: item.price,
        vehicleType: item.vehicleType || 'CAR',
        brand: item.brand,
        model: item.model,
        year: item.year,
        mileage: item.mileage || null,
        fuelType: item.fuelType || 'PETROL',
        transmission: item.transmission || null,
        province: item.province || 'กรุงเทพมหานคร',
        viewCount: 0,
        images: item.images || (item.imageUrl ? [{ url: item.imageUrl, isPrimary: true }] : []),
        user: item.user || { id: '', fullName: '' },
        createdAt: item.addedAt
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">รายการที่บันทึกไว้ (Wishlist)</h1>
                <span className="text-sm text-gray-500">{wishlist.length} รายการ</span>
            </div>

            {/* Warning for old data */}
            {hasOldData && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                    <Warning size={24} className="text-amber-500 flex-shrink-0 mt-0.5" weight="fill" />
                    <div className="flex-1">
                        <p className="text-amber-800 text-sm font-medium">บางรายการมีข้อมูลไม่ครบ</p>
                        <p className="text-amber-600 text-xs mt-1">
                            กรุณาลบรายการเก่าแล้วกดหัวใจเพิ่มใหม่ในหน้าซื้อรถ เพื่อให้แสดงข้อมูลครบถ้วน
                        </p>
                    </div>
                    <button
                        onClick={handleClearAll}
                        className="flex items-center gap-1.5 text-xs bg-amber-500 text-white px-3 py-1.5 rounded-lg hover:bg-amber-600 transition font-medium"
                    >
                        <ArrowClockwise size={14} weight="bold" />
                        ล้างทั้งหมด
                    </button>
                </div>
            )}

            {wishlist.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wishlist.map((item) => (
                        <ListingCard
                            key={item.id}
                            listing={convertToListing(item)}
                            showRemoveButton={true}
                            onRemove={handleRemove}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 border-dashed">
                    <Heart weight="duotone" className="text-gray-300 text-6xl mx-auto mb-4" />
                    <h3 className="font-bold text-gray-800 text-lg">ยังไม่มีรายการที่บันทึก</h3>
                    <p className="text-gray-500 text-sm mb-6">คุณยังไม่ได้กดหัวใจให้รถคันไหนเลย</p>
                    <Link href="/buy" className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-opacity-90 transition shadow-lg shadow-primary/20">
                        <Heart weight="bold" />
                        ค้นหารถถูกใจ
                    </Link>
                </div>
            )}

            {/* Toast Notification */}
            {showToast && (
                <div className="fixed bottom-24 inset-x-0 w-fit mx-auto px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in flex items-center gap-2 bg-green-500 text-white">
                    <Check size={16} weight="bold" />
                    <span className="text-sm font-medium">{toastMessage}</span>
                </div>
            )}
        </div>
    );
}
