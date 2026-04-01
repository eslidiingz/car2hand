"use client";

import React from 'react';
import Link from 'next/link';
import {
    Eye,
    Heart,
    PencilSimple,
    Megaphone,
    Trash,
    CheckCircle,
    DotsThreeVertical,
    Lightning,
    Phone,
    ArrowClockwise,
    Clock,
    ArrowSquareOut
} from '@phosphor-icons/react';

export interface VehicleListing {
    id: string;
    vehicleType: 'CAR' | 'MOTORCYCLE';
    title: string;
    brand: string;
    model: string;
    year: number;
    price: string;
    mileage: number;
    province: string;
    status: 'DRAFT' | 'PENDING' | 'ACTIVE' | 'INACTIVE' | 'SOLD' | 'EXPIRED' | 'SUSPENDED';
    viewCount: number;
    favoriteCount: number;
    createdAt: string;
    expiredAt: string | null;
    publishedAt: string | null;
    autoBumpSlot: number | null;
    images: Array<{
        id: string;
        url: string;
        isPrimary: boolean;
    }>;
}

export const STATUS_CONFIG: Record<string, { label: string; bgColor: string; textColor: string; dotColor: string }> = {
    'ACTIVE': { label: 'กำลังขาย', bgColor: 'bg-green-50', textColor: 'text-green-600', dotColor: 'bg-green-500' },
    'PENDING': { label: 'รอตรวจสอบ', bgColor: 'bg-yellow-50', textColor: 'text-yellow-600', dotColor: 'bg-yellow-500' },
    'DRAFT': { label: 'แบบร่าง', bgColor: 'bg-gray-50', textColor: 'text-gray-400', dotColor: 'bg-gray-400' },
    'SOLD': { label: 'ขายแล้ว', bgColor: 'bg-blue-50', textColor: 'text-blue-600', dotColor: 'bg-blue-500' },
    'EXPIRED': { label: 'หมดอายุ', bgColor: 'bg-red-50', textColor: 'text-red-600', dotColor: 'bg-red-500' },
    'INACTIVE': { label: 'ไม่ใช้งาน', bgColor: 'bg-gray-50', textColor: 'text-gray-400', dotColor: 'bg-gray-400' },
    'SUSPENDED': { label: 'ถูกระงับ', bgColor: 'bg-red-50', textColor: 'text-red-600', dotColor: 'bg-red-500' },
};

interface ProfileListingCardProps {
    listing: VehicleListing;
    isActive: boolean;
    onToggleMenu: (id: string | null) => void;
    onDelete: (id: string) => void;
    onRenew?: (id: string) => void;
    onBump?: (id: string) => void;
    onSetSlot?: (id: string) => void;
    slotSchedules?: string[]; // เวลาของแต่ละ slot เช่น ['08:30', '12:30', '21:00']
    hasPendingRenewal?: boolean;
    formatPrice: (price: string | number) => string;
    formatDate: (dateStr: string) => string;
    getDaysLeft: (expiredAt: string | null) => number | null;
    getPrimaryImage: (images: VehicleListing['images']) => string;
}

export default function ProfileListingCard({
    listing,
    isActive,
    onToggleMenu,
    onDelete,
    onRenew,
    onBump,
    onSetSlot,
    slotSchedules,
    hasPendingRenewal,
    formatPrice,
    formatDate,
    getDaysLeft,
    getPrimaryImage
}: ProfileListingCardProps) {
    const status = STATUS_CONFIG[listing.status] || STATUS_CONFIG['DRAFT'];
    const daysLeft = getDaysLeft(listing.expiredAt);
    const isBoosted = listing.viewCount > 1000;

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-4 relative">
            <div className="p-4">
                <div className="flex gap-4">
                    {/* Image Section */}
                    <div className="relative flex-shrink-0">
                        <img
                            src={getPrimaryImage(listing.images)}
                            className="aspect-4/3 w-32 md:w-40 object-cover rounded-xl bg-gray-100 shadow-sm"
                            alt={listing.title}
                        />
                        {isBoosted && (
                            <div className="absolute top-2 left-2 bg-[#FF7A50] text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm uppercase tracking-wider">
                                <Lightning weight="fill" size={10} />
                                Boosted
                            </div>
                        )}
                    </div>

                    {/* Info Section */}
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                            <h3 className="font-bold text-[#1E293B] text-sm md:text-lg leading-tight line-clamp-2 uppercase">
                                {listing.year} {listing.brand} {listing.model}
                            </h3>
                            <div className="relative">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onToggleMenu(isActive ? null : listing.id);
                                    }}
                                    className="text-gray-300 hover:text-gray-500 transition-colors p-1"
                                >
                                    <DotsThreeVertical weight="bold" size={24} />
                                </button>

                                {isActive && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-10"
                                            onClick={() => onToggleMenu(null)}
                                        ></div>
                                        <div className="absolute right-0 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-20 overflow-hidden text-[#1E293B]">
                                            {listing.status === 'EXPIRED' ? (
                                                <>
                                                    <Link
                                                        href={`/buy/${listing.id}`}
                                                        target="_blank"
                                                        onClick={() => onToggleMenu(null)}
                                                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 transition font-medium"
                                                    >
                                                        <ArrowSquareOut weight="bold" />
                                                        ดูประกาศ
                                                    </Link>
                                                    <button
                                                        onClick={() => {
                                                            onRenew?.(listing.id);
                                                            onToggleMenu(null);
                                                        }}
                                                        className="w-full text-left px-4 py-2 text-sm hover:bg-emerald-50 flex items-center gap-2 transition font-medium text-emerald-600"
                                                    >
                                                        <ArrowClockwise weight="bold" />
                                                        ต่ออายุ / รีประกาศ
                                                    </button>
                                                    <div className="border-t border-gray-50 my-1"></div>
                                                    <button
                                                        onClick={() => {
                                                            onDelete(listing.id);
                                                            onToggleMenu(null);
                                                        }}
                                                        className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2 transition font-medium"
                                                    >
                                                        <Trash weight="bold" />
                                                        ลบประกาศ
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <Link
                                                        href={`/buy/${listing.id}`}
                                                        target="_blank"
                                                        onClick={() => onToggleMenu(null)}
                                                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 transition font-medium"
                                                    >
                                                        <ArrowSquareOut weight="bold" />
                                                        ดูประกาศ
                                                    </Link>
                                                    <Link
                                                        href={`/sell/edit/${listing.id}`}
                                                        onClick={() => onToggleMenu(null)}
                                                        className="w-full text-left px-4 py-2 text-sm hover:bg-orange-50 flex items-center gap-2 transition font-medium text-orange-500"
                                                    >
                                                        <PencilSimple weight="bold" />
                                                        แก้ไขประกาศ
                                                    </Link>
                                                    <button
                                                        onClick={() => {
                                                            onBump?.(listing.id);
                                                            onToggleMenu(null);
                                                        }}
                                                        className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 flex items-center gap-2 transition font-medium text-blue-600"
                                                    >
                                                        <Lightning weight="bold" />
                                                        ดันโพส
                                                    </button>
                                                    {onSetSlot && (
                                                        <button
                                                            onClick={() => {
                                                                onSetSlot(listing.id);
                                                                onToggleMenu(null);
                                                            }}
                                                            className="w-full text-left px-4 py-2 text-sm hover:bg-purple-50 flex items-center gap-2 transition font-medium text-purple-600"
                                                        >
                                                            <Clock weight="bold" />
                                                            ตั้งเวลาดันอัตโนมัติ
                                                        </button>
                                                    )}
                                                    <div className="border-t border-gray-50 my-1"></div>
                                                    <button
                                                        onClick={() => {
                                                            onDelete(listing.id);
                                                            onToggleMenu(null);
                                                        }}
                                                        className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2 transition font-medium"
                                                    >
                                                        <Trash weight="bold" />
                                                        ลบประกาศ
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="text-[#FF7A50] font-bold text-2xl md:text-3xl mb-3">
                            ฿{formatPrice(listing.price)}
                        </div>

                        <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-[11px] md:text-xs text-gray-400 font-medium">
                            <span className="flex items-center gap-1">
                                <Eye weight="bold" size={14} className="text-blue-500" /> {listing.viewCount} วิว
                            </span>
                            <span className="flex items-center gap-1">
                                <Heart weight="bold" size={14} className="text-red-400" /> {listing.favoriteCount} ถูกใจ
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Action Bar */}
            <div className="border-t border-gray-50 px-4 py-2.5 bg-gray-50/30 space-y-1">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 ${status.bgColor} ${status.textColor}`}>
                            <CheckCircle weight="fill" size={12} />
                            {status.label}
                        </span>
                        {daysLeft !== null && (
                            <span className="text-[10px] text-gray-400 font-medium">เหลือ {daysLeft} วัน</span>
                        )}
                    </div>
                    <span className="text-[10px] text-gray-400">
                        {listing.publishedAt
                            ? `เผยแพร่เมื่อ ${formatDate(listing.publishedAt)}`
                            : `ลงเมื่อ ${formatDate(listing.createdAt)}`
                        }
                    </span>
                </div>
                {hasPendingRenewal && listing.status === 'EXPIRED' && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 rounded-lg border border-amber-100">
                        <Clock weight="fill" size={14} className="text-amber-500" />
                        <span className="text-xs font-bold text-amber-700">คำขอต่ออายุกำลังรอตรวจสอบ</span>
                    </div>
                )}
                {listing.status === 'ACTIVE' && slotSchedules && slotSchedules.length > 0 && (
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 bg-purple-50 text-purple-600 w-fit">
                        <Lightning weight="fill" size={12} />
                        {listing.autoBumpSlot !== null && listing.autoBumpSlot !== undefined
                            ? `ดันอัตโนมัติ ${slotSchedules[listing.autoBumpSlot] || ''} น.`
                            : 'ดันอัตโนมัติ (auto)'
                        }
                    </span>
                )}
            </div>
        </div>
    );
}
