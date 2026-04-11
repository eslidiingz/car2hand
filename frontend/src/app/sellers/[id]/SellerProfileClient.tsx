"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
    Phone,
    Clock,
    Globe,
    MapPin,
    Facebook,
    Instagram,
    MessageCircle,
    Store,
    ShieldCheck,
    ChevronLeft,
} from 'lucide-react';
import ListingCard, { VehicleListing } from '@/components/ListingCard';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// ---------- Types ----------

interface SellerProfile {
    shopName: string;
    shopLogo?: string | null;
    shopCover?: string | null;
    shopDescription?: string | null;
    shopPhone?: string | null;
    shopOpenHours?: string | null;
    shopProvince?: string | null;
    shopDistrict?: string | null;
    shopAddress?: string | null;
    shopMapUrl?: string | null;
    showroomType?: string | null;
    shopEstablishedYear?: number | null;
    packageName?: string | null;
    isVerified?: boolean;
    memberSince?: string | null;
    specializations?: string[];
    socialLinks?: {
        website?: string | null;
        facebook?: string | null;
        line?: string | null;
        instagram?: string | null;
    } | null;
}

interface SellerStats {
    activeListings: number;
    totalViews?: number;
}

interface SellerData {
    profile: SellerProfile;
    stats: SellerStats;
}

interface ListingsResponse {
    listings: VehicleListing[];
    total: number;
    page: number;
    totalPages: number;
}

// ---------- Helpers ----------

const SHOWROOM_BADGES: Record<string, { label: string; color: string }> = {
    PERSONAL: { label: 'ส่วนตัว', color: 'bg-gray-100 text-gray-600' },
    TENT: { label: 'เต๊นท์', color: 'bg-blue-100 text-blue-700' },
    DEALER: { label: 'ตัวแทนจำหน่าย', color: 'bg-orange-100 text-orange-700' },
};

// ---------- Skeleton ----------

function SkeletonBlock({ className }: { className?: string }) {
    return <div className={`bg-gray-200 animate-pulse rounded-xl ${className ?? ''}`} />;
}

function LoadingSkeleton() {
    return (
        <div className="min-h-screen bg-surface">
            {/* Cover */}
            <SkeletonBlock className="w-full h-[200px] md:h-[300px] !rounded-none" />

            <div className="max-w-5xl mx-auto px-4 -mt-10 relative z-10">
                {/* Logo */}
                <SkeletonBlock className="w-20 h-20 !rounded-full" />
                <SkeletonBlock className="mt-4 h-8 w-60" />
                <SkeletonBlock className="mt-2 h-5 w-40" />

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                    {[1, 2].map(i => (
                        <SkeletonBlock key={i} className="h-20" />
                    ))}
                </div>

                {/* Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <SkeletonBlock className="h-40" />
                    <SkeletonBlock className="h-40" />
                </div>

                {/* Listings */}
                <SkeletonBlock className="mt-8 h-8 w-48" />
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4 pb-10">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <SkeletonBlock key={i} className="h-64" />
                    ))}
                </div>
            </div>
        </div>
    );
}

// ---------- Not Found ----------

function NotFoundState() {
    return (
        <div className="min-h-screen bg-surface flex items-center justify-center">
            <div className="text-center space-y-4">
                <Store size={64} className="mx-auto text-gray-300" />
                <h1 className="text-2xl font-bold text-gray-700">ไม่พบโปรไฟล์ร้าน</h1>
                <p className="text-gray-500">ร้านค้าที่คุณกำลังมองหาอาจถูกลบหรือไม่มีอยู่</p>
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-semibold hover:opacity-90 transition"
                >
                    <ChevronLeft size={18} />
                    กลับหน้าแรก
                </Link>
            </div>
        </div>
    );
}

// ---------- Main Component ----------

export default function SellerProfileClient({ sellerId }: { sellerId: string }) {
    const [seller, setSeller] = useState<SellerData | null>(null);
    const [listings, setListings] = useState<VehicleListing[]>([]);
    const [listingsTotal, setListingsTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [notFound, setNotFound] = useState(false);

    // Fetch seller profile
    useEffect(() => {
        async function fetchSeller() {
            try {
                const res = await fetch(`${API_URL}/sellers/${sellerId}`);
                if (!res.ok) {
                    setNotFound(true);
                    setLoading(false);
                    return;
                }
                const data = await res.json();
                // API returns { profile: { ...fields, stats: {...}, user: {...} } }
                // Normalize to match frontend interface
                const raw = data.profile;
                const stats = raw?.stats || { activeListings: 0, totalSold: 0 };
                const normalized: SellerProfile = {
                    shopName: raw.shopName,
                    shopLogo: raw.shopLogo,
                    shopCover: raw.shopCoverImage,
                    shopDescription: raw.shopDescription,
                    shopPhone: raw.shopPhone,
                    shopOpenHours: raw.shopOpenHours,
                    shopProvince: raw.shopProvince,
                    shopDistrict: raw.shopDistrict,
                    shopAddress: raw.shopAddress,
                    shopMapUrl: raw.shopMapUrl,
                    showroomType: raw.showroomType,
                    shopEstablishedYear: raw.shopEstablishedYear,
                    packageName: raw.user?.badge,
                    isVerified: raw.isVerified,
                    memberSince: raw.user?.memberSince,
                    specializations: raw.specializations || [],
                    socialLinks: {
                        website: raw.socialWebsite,
                        facebook: raw.socialFacebook,
                        line: raw.socialLine,
                        instagram: raw.socialInstagram,
                    },
                };
                setSeller({ profile: normalized, stats });
            } catch {
                setNotFound(true);
            } finally {
                setLoading(false);
            }
        }
        fetchSeller();
    }, [sellerId]);

    // Fetch listings
    const fetchListings = useCallback(async (pageNum: number, append = false) => {
        try {
            if (append) setLoadingMore(true);
            const res = await fetch(`${API_URL}/sellers/${sellerId}/listings?page=${pageNum}&limit=12`);
            if (!res.ok) return;
            const data: ListingsResponse = await res.json();
            setListings(prev => append ? [...prev, ...data.listings] : data.listings);
            const pg = (data as any).pagination || data;
            setListingsTotal(pg.total);
            setTotalPages(pg.totalPages);
            setPage(pg.page);
        } catch {
            // silently fail
        } finally {
            setLoadingMore(false);
        }
    }, [sellerId]);

    useEffect(() => {
        if (!notFound) fetchListings(1);
    }, [notFound, fetchListings]);

    const handleLoadMore = () => {
        if (page < totalPages) fetchListings(page + 1, true);
    };

    // ---------- Render ----------

    if (loading) return <LoadingSkeleton />;
    if (notFound || !seller) return <NotFoundState />;

    const { profile, stats } = seller;
    const showroomBadge = profile.showroomType ? SHOWROOM_BADGES[profile.showroomType] : null;
    const social = profile.socialLinks;
    const hasSocial = social && (social.website || social.facebook || social.line || social.instagram);
    const hasContact = profile.shopPhone || profile.shopOpenHours || hasSocial;
    const hasLocation = profile.shopProvince || profile.shopAddress;

    return (
        <div className="min-h-screen bg-surface">
            {/* ===== Cover ===== */}
            <div className="relative w-full h-[200px] md:h-[300px] overflow-hidden">
                {profile.shopCover ? (
                    <img
                        src={profile.shopCover}
                        alt="Cover"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-r from-[#0F3460] to-[#16213E]" />
                )}
            </div>

            {/* ===== Content ===== */}
            <div className="max-w-5xl mx-auto px-4 pb-12">
                {/* --- Header Card --- */}
                <div className="bg-white rounded-3xl shadow-sm p-5 mt-4">
                    <div className="flex items-center gap-4">
                        {/* Logo — square rounded like cards */}
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl border-2 border-gray-100 bg-white flex items-center justify-center overflow-hidden shrink-0">
                            {profile.shopLogo ? (
                                <img src={profile.shopLogo} alt={profile.shopName} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-2xl md:text-3xl font-bold text-primary">
                                    {profile.shopName.charAt(0)}
                                </span>
                            )}
                        </div>

                        {/* Name & badges */}
                        <div className="min-w-0 flex-1">
                            <h1 className="text-xl md:text-2xl font-bold text-gray-900 truncate">
                                {profile.shopName}
                            </h1>
                            <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                {showroomBadge && (
                                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${showroomBadge.color}`}>
                                        {showroomBadge.label}
                                    </span>
                                )}
                                {profile.packageName && (
                                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-accent/10 text-accent">
                                        {profile.packageName}
                                    </span>
                                )}
                                {profile.isVerified && (
                                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700 flex items-center gap-1">
                                        <ShieldCheck size={12} fill="currentColor" />
                                        ยืนยันตัวตน
                                    </span>
                                )}
                            </div>
                            {profile.shopEstablishedYear && (
                                <p className="text-xs text-gray-400 mt-1">
                                    เปิดกิจการตั้งแต่ พ.ศ. {profile.shopEstablishedYear}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Stats — inside same card */}
                    <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-100">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-primary">{stats.activeListings}</p>
                            <p className="text-xs text-gray-500 mt-0.5">รถที่ขายอยู่</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-primary">{stats.totalViews?.toLocaleString() || '0'}</p>
                            <p className="text-xs text-gray-500 mt-0.5">ยอดเข้าชมทั้งหมด</p>
                        </div>
                    </div>
                </div>

                {/* --- About --- */}
                {profile.shopDescription && (
                    <div className="bg-white rounded-3xl shadow-sm p-6 mt-6">
                        <h2 className="font-bold text-lg text-gray-800 mb-2">เกี่ยวกับร้าน</h2>
                        <p className="text-gray-600 text-sm whitespace-pre-line leading-relaxed">
                            {profile.shopDescription}
                        </p>
                    </div>
                )}

                {/* --- Contact & Location --- */}
                {(hasContact || hasLocation) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        {/* Contact */}
                        {hasContact && (
                            <div className="bg-white rounded-3xl shadow-sm p-6 space-y-4">
                                <h2 className="font-bold text-lg text-gray-800">ติดต่อ</h2>

                                {profile.shopPhone && (
                                    <a
                                        href={`tel:${profile.shopPhone}`}
                                        className="flex items-center gap-3 text-sm text-gray-600 hover:text-primary transition"
                                    >
                                        <Phone size={20} className="text-primary shrink-0" />
                                        <span>{profile.shopPhone}</span>
                                    </a>
                                )}

                                {profile.shopOpenHours && (
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <Clock size={20} className="text-primary shrink-0" />
                                        <span>{profile.shopOpenHours}</span>
                                    </div>
                                )}

                                {hasSocial && (
                                    <div className="flex items-center gap-2 pt-2">
                                        {social?.website && (
                                            <a
                                                href={social.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-primary hover:text-white transition"
                                                title="เว็บไซต์"
                                            >
                                                <Globe size={20} />
                                            </a>
                                        )}
                                        {social?.facebook && (
                                            <a
                                                href={social.facebook}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-[#1877F2] hover:text-white transition"
                                                title="Facebook"
                                            >
                                                <Facebook size={20} />
                                            </a>
                                        )}
                                        {social?.line && (
                                            <a
                                                href={social.line}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-[#06C755] hover:text-white transition"
                                                title="LINE"
                                            >
                                                <MessageCircle size={20} />
                                            </a>
                                        )}
                                        {social?.instagram && (
                                            <a
                                                href={social.instagram}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-[#E4405F] hover:text-white transition"
                                                title="Instagram"
                                            >
                                                <Instagram size={20} />
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Location */}
                        {hasLocation && (
                            <div className="bg-white rounded-3xl shadow-sm p-6 space-y-4">
                                <h2 className="font-bold text-lg text-gray-800">ที่ตั้ง</h2>

                                {(profile.shopProvince || profile.shopDistrict) && (
                                    <div className="flex items-start gap-3 text-sm text-gray-600">
                                        <MapPin size={20} className="text-primary shrink-0 mt-0.5" />
                                        <span>
                                            {[profile.shopDistrict, profile.shopProvince].filter(Boolean).join(', ')}
                                        </span>
                                    </div>
                                )}

                                {profile.shopAddress && (
                                    <div className="flex items-start gap-3 text-sm text-gray-600">
                                        <Store size={20} className="text-primary shrink-0 mt-0.5" />
                                        <span>{profile.shopAddress}</span>
                                    </div>
                                )}

                                {profile.shopMapUrl && (
                                    <a
                                        href={profile.shopMapUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline mt-2"
                                    >
                                        <MapPin size={16} fill="currentColor" />
                                        ดูแผนที่ Google Maps
                                    </a>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* --- Specializations --- */}
                {profile.specializations && profile.specializations.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-6">
                        {profile.specializations.map(tag => (
                            <span
                                key={tag}
                                className="text-xs font-medium px-3 py-1.5 rounded-full bg-primary/10 text-primary"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* --- Listings --- */}
                <div className="mt-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">
                        รถที่กำลังขาย ({listingsTotal} คัน)
                    </h2>

                    {listings.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {listings.map(listing => (
                                <ListingCard key={listing.id} listing={listing} />
                            ))}
                        </div>
                    ) : (
                        !loading && (
                            <div className="bg-white rounded-3xl shadow-sm p-10 text-center">
                                <Store size={48} className="mx-auto text-gray-300 mb-3" />
                                <p className="text-gray-500">ยังไม่มีรถที่กำลังขายอยู่ตอนนี้</p>
                            </div>
                        )
                    )}

                    {/* Load More */}
                    {page < totalPages && (
                        <div className="text-center mt-6">
                            <button
                                onClick={handleLoadMore}
                                disabled={loadingMore}
                                className="bg-white border border-gray-200 text-primary font-semibold px-8 py-3 rounded-full hover:bg-primary hover:text-white transition disabled:opacity-50"
                            >
                                {loadingMore ? 'กำลังโหลด...' : 'โหลดเพิ่มเติม'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
