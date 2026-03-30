"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Heart,
    Check,
    Warning,
    ArrowClockwise,
    Trash,
    X,
} from '@phosphor-icons/react';
import Toast from '@/components/Toast';
import { useWishlist } from '@/contexts/WishlistContext';
import ListingCard, { VehicleListing } from '@/components/ListingCard';

export default function WishlistPage() {
    const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
    const [toastMessage, setToastMessage] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [hasOldData, setHasOldData] = useState(false);
    const [showClearConfirm, setShowClearConfirm] = useState(false);

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
        setShowClearConfirm(true);
    };

    const confirmClearAll = () => {
        clearWishlist();
        setShowClearConfirm(false);
        setToastMessage('ลบรายการทั้งหมดแล้ว');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
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
                <h1 className="text-2xl font-bold text-gray-800">รายการที่บันทึกไว้</h1>
                <span className="text-sm text-gray-500">{wishlist.length} รายการ</span>
            </div>

            {/* Clear All Confirmation Modal */}
            {showClearConfirm && (
                <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4" onClick={() => setShowClearConfirm(false)}>
                    <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl" onClick={e => e.stopPropagation()}>
                        <div className="p-6 text-center">
                            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash size={28} className="text-red-500" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 mb-2">ลบรายการโปรดทั้งหมด?</h3>
                            <p className="text-sm text-gray-500">หลังจากลบแล้วสามารถเพิ่มใหม่เพื่อให้แสดงข้อมูลครบถ้วน</p>
                        </div>
                        <div className="flex border-t border-gray-100">
                            <button onClick={() => setShowClearConfirm(false)} className="flex-1 py-3.5 text-sm font-bold text-gray-600 hover:bg-gray-50 transition rounded-bl-2xl">
                                ยกเลิก
                            </button>
                            <button onClick={confirmClearAll} className="flex-1 py-3.5 text-sm font-bold text-red-600 hover:bg-red-50 transition border-l border-gray-100 rounded-br-2xl">
                                ลบทั้งหมด
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                <Toast message={toastMessage} type="success" />
            )}
        </div>
    );
}
