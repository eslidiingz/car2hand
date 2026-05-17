"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Car,
    Eye,
    Heart,
    AlertTriangle,
    Plus,
    Megaphone,
    ListChecks,
    Phone,
    UserCircle,
    Clock,
    RotateCcw,
    Crown,
    ShoppingBag,
    ShieldAlert,
    ArrowRight,
} from 'lucide-react';
import SlotPurchaseModal from '@/components/SlotPurchaseModal';
import { PACKAGES_ENABLED } from '@/lib/featureFlags';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

function getAuthToken(): string | null {
    const stored = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (!stored) return null;
    try { return JSON.parse(stored).token || null; } catch { return null; }
}

interface Listing {
    id: string;
    title: string;
    brand: string;
    model: string;
    year: number;
    status: string;
    viewCount: number;
    favoriteCount: number;
    expiredAt: string | null;
    images: Array<{ url: string; isPrimary: boolean }>;
}

export default function DashboardPage() {
    const router = useRouter();
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [maxListings, setMaxListings] = useState<number>(3);
    const [packageMaxListings, setPackageMaxListings] = useState<number>(3);
    const [bonusListingSlots, setBonusListingSlots] = useState<number>(0);
    const [packageName, setPackageName] = useState<string>('Basic');
    const [packageSlug, setPackageSlug] = useState<string>('basic');
    const [isKycVerified, setIsKycVerified] = useState<boolean | null>(null);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [showSlotModal, setShowSlotModal] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
        if (!storedUser) return;
        const userData = JSON.parse(storedUser);

        fetch(`${API_BASE}/listings/user/${userData.id}`)
            .then(r => r.json())
            .then(data => setListings(data.listings || []))
            .catch(() => {})
            .finally(() => setLoading(false));

        // Fetch package limits
        const token = getAuthToken();
        fetch(`${API_BASE}/packages/my`, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        })
            .then(r => r.json())
            .then(data => {
                if (data.currentPackage) {
                    setPackageName(data.currentPackage.name ?? 'Basic');
                    setPackageSlug(data.currentPackage.slug ?? 'basic');
                }
                // usage.maxListings is the EFFECTIVE max (packageMax + bonusListingSlots).
                // usage.packageMaxListings is the package-only value for display.
                const pkgMax = data.usage?.packageMaxListings ?? data.currentPackage?.maxListings ?? -1;
                const bonus = data.usage?.bonusListingSlots ?? 0;
                const effective = data.usage?.maxListings ?? (pkgMax === -1 ? -1 : pkgMax + bonus);
                setPackageMaxListings(pkgMax);
                setBonusListingSlots(bonus);
                setMaxListings(effective);
            })
            .catch(() => {});

        // Check KYC status to decide whether to show the "complete KYC" banner.
        // Paid-package users who haven't done KYC only get the card border, not
        // the full badge — banner urges them to finish KYC to unlock it.
        if (token) {
            fetch(`${API_BASE}/kyc/me`, { headers: { Authorization: `Bearer ${token}` } })
                .then(r => r.ok ? r.json() : null)
                .then(data => {
                    if (data) {
                        setIsKycVerified(
                            !!data.isVerified
                            && data.verificationLevel
                            && data.verificationLevel !== 'NONE'
                        );
                    }
                })
                .catch(() => {});
        }
    }, []);

    const activeListings = listings.filter(l => l.status === 'ACTIVE');
    const expiredListings = listings.filter(l => l.status === 'EXPIRED');
    const pendingListings = listings.filter(l => l.status === 'PENDING');

    const totalViews = listings.reduce((sum, l) => sum + l.viewCount, 0);
    const totalFavorites = listings.reduce((sum, l) => sum + l.favoriteCount, 0);

    const getDaysLeft = (expiredAt: string | null) => {
        if (!expiredAt) return null;
        const diff = Math.ceil((new Date(expiredAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return diff > 0 ? diff : 0;
    };

    const soonExpiring = activeListings.filter(l => {
        const days = getDaysLeft(l.expiredAt);
        return days !== null && days <= 7;
    });

    const getPrimaryImage = (images: Listing['images']) => {
        const primary = images.find(i => i.isPrimary);
        return primary?.url || images[0]?.url || '';
    };

    const stats = [
        { label: 'ประกาศกำลังขาย', value: activeListings.length.toString(), icon: <Car className="text-blue-500" />, badge: null },
        { label: 'ยอดเข้าชมทั้งหมด', value: totalViews.toLocaleString(), icon: <Eye className="text-emerald-500" />, badge: null },
        { label: 'คนกดถูกใจ', value: totalFavorites.toLocaleString(), icon: <Heart className="text-red-500" />, badge: null },
        { label: 'ประกาศหมดอายุ', value: expiredListings.length.toString(), icon: <Clock className="text-orange-500" />, badge: expiredListings.length > 0 ? 'ต้องดำเนินการ' : null },
    ];

    // Banner condition: Pro/Dealer tier users who paid but haven't completed KYC.
    // They already get the card border from package, but miss the full badge
    // (Hot Deal / Premium Choice) until KYC is approved.
    const paidTierNeedingKyc = (packageSlug === 'professional' || packageSlug === 'premium') && isKycVerified === false;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">ภาพรวมบัญชี (Dashboard)</h1>

            {/* KYC nudge — only for paid Pro/Dealer users who haven't verified yet */}
            {paidTierNeedingKyc && (
                <Link
                    href="/profile/settings?tab=verify"
                    className="flex items-start gap-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 hover:shadow-md transition group"
                >
                    <div className="w-11 h-11 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0">
                        <ShieldAlert size={22} />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-amber-900">ยืนยัน KYC เพื่อปลดล็อก badge เต็ม</h3>
                        <p className="text-sm text-amber-700/90 mt-0.5">
                            แพ็กเกจ <strong>{packageName}</strong> ของคุณแสดงขอบการ์ดแล้ว — ทำ KYC ให้เสร็จเพื่อรับ
                            badge <strong>{packageSlug === 'premium' ? 'Premium Choice' : 'Hot Deal'}</strong> บนประกาศทุกรายการของคุณ
                        </p>
                    </div>
                    <ArrowRight size={20} className="text-amber-700 flex-shrink-0 mt-1 group-hover:translate-x-1 transition" />
                </Link>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-gray-50 p-3 rounded-xl text-2xl">
                                {stat.icon}
                            </div>
                            {stat.badge && (
                                <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-full">{stat.badge}</span>
                            )}
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900 mb-1">{loading ? '-' : stat.value}</h3>
                        <p className="text-sm text-gray-500">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Expired Listings Alert */}
            {expiredListings.length > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-orange-100 p-2 rounded-xl">
                            <Clock className="text-xl text-orange-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-orange-800">ประกาศหมดอายุ ({expiredListings.length} รายการ)</h3>
                            <p className="text-xs text-orange-600">ประกาศเหล่านี้ไม่แสดงบนเว็บไซต์แล้ว กรุณาต่ออายุหรือลบเพื่อลงใหม่</p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        {expiredListings.slice(0, 5).map(listing => (
                            <div key={listing.id} className="flex items-center gap-3 bg-white rounded-xl p-3 border border-orange-100">
                                {getPrimaryImage(listing.images) ? (
                                    <img src={getPrimaryImage(listing.images)} alt="" className="w-14 h-10 rounded-lg object-cover flex-shrink-0" />
                                ) : (
                                    <div className="w-14 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                        <Car className="text-gray-300" />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-gray-800 truncate">
                                        {listing.year} {listing.brand} {listing.model}
                                    </p>
                                    <p className="text-xs text-orange-500 font-medium">
                                        หมดอายุเมื่อ {listing.expiredAt ? new Date(listing.expiredAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <Link
                        href="/profile/listings?status=EXPIRED"
                        className="flex items-center justify-center gap-2 mt-4 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition"
                    >
                        <Clock size={18} />
                        ดูรายการที่หมดอายุ ({expiredListings.length} รายการ)
                    </Link>
                </div>
            )}

            {/* Soon Expiring Alert */}
            {soonExpiring.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-amber-100 p-2 rounded-xl">
                            <AlertTriangle className="text-xl text-amber-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-amber-800">ประกาศใกล้หมดอายุ ({soonExpiring.length} รายการ)</h3>
                            <p className="text-xs text-amber-600">ประกาศเหล่านี้จะหมดอายุภายใน 7 วัน</p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        {soonExpiring.map(listing => {
                            const daysLeft = getDaysLeft(listing.expiredAt);
                            return (
                                <div key={listing.id} className="flex items-center gap-3 bg-white rounded-xl p-3 border border-amber-100">
                                    {getPrimaryImage(listing.images) ? (
                                        <img src={getPrimaryImage(listing.images)} alt="" className="w-14 h-10 rounded-lg object-cover flex-shrink-0" />
                                    ) : (
                                        <div className="w-14 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                            <Car className="text-gray-300" />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-gray-800 truncate">
                                            {listing.year} {listing.brand} {listing.model}
                                        </p>
                                        <p className="text-xs text-amber-600 font-bold">
                                            เหลืออีก {daysLeft} วัน
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                    onClick={() => {
                        const usedSlots = listings.filter(l => ['ACTIVE', 'DRAFT', 'PENDING'].includes(l.status)).length;
                        if (maxListings !== -1 && usedSlots >= maxListings) {
                            setShowUpgradeModal(true);
                        } else {
                            router.push('/sell');
                        }
                    }}
                    className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-2xl transition shadow-sm group text-left"
                >
                    <div className="bg-white/20 p-2 rounded-xl group-hover:scale-110 transition">
                        <Plus className="text-xl" />
                    </div>
                    <div>
                        <p className="font-bold">ลงขายรถ</p>
                        <p className="text-xs text-blue-100">เพิ่มโอกาสในการขาย</p>
                    </div>
                </button>
                <Link href="/profile/listings" className="flex items-center gap-3 bg-white hover:bg-gray-50 text-gray-800 p-4 rounded-2xl border border-gray-100 transition shadow-sm group">
                    <div className="bg-orange-50 p-2 rounded-xl text-orange-500 group-hover:scale-110 transition">
                        <Megaphone className="text-xl" />
                    </div>
                    <div className="text-left">
                        <p className="font-bold text-gray-900">ดันประกาศ (Boost)</p>
                        <p className="text-xs text-gray-500">เพิ่มการมองเห็น 3 เท่า</p>
                    </div>
                </Link>
                <Link href="/profile/listings" className="flex items-center gap-3 bg-white hover:bg-gray-50 text-gray-800 p-4 rounded-2xl border border-gray-100 transition shadow-sm group">
                    <div className="bg-green-50 p-2 rounded-xl text-green-500 group-hover:scale-110 transition">
                        <ListChecks className="text-xl" />
                    </div>
                    <div className="text-left">
                        <p className="font-bold text-gray-900">จัดการประกาศ</p>
                        <p className="text-xs text-gray-500">แก้ไขหรือปิดการขาย</p>
                    </div>
                </Link>
            </div>

            {/* Listing Performance — real data */}
            {activeListings.length > 0 && (
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="font-bold text-lg text-gray-800">ประกาศของฉัน</h3>
                            <p className="text-xs text-gray-500">ประกาศที่กำลังขายอยู่</p>
                        </div>
                        <Link href="/profile/listings" className="text-blue-600 text-sm font-bold hover:underline">ดูทั้งหมด</Link>
                    </div>
                    <div className="space-y-4">
                        {activeListings.slice(0, 5).map(listing => {
                            const daysLeft = getDaysLeft(listing.expiredAt);
                            return (
                                <div key={listing.id} className="flex items-center gap-4">
                                    <div className="relative flex-shrink-0">
                                        {getPrimaryImage(listing.images) ? (
                                            <img src={getPrimaryImage(listing.images)} alt="" className="w-16 h-12 rounded-lg object-cover" />
                                        ) : (
                                            <div className="w-16 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                                                <Car className="text-gray-300" />
                                            </div>
                                        )}
                                        <span className="absolute -top-1.5 -right-1.5 bg-green-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">Active</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between mb-1">
                                            <span className="text-sm font-bold text-gray-800 truncate">{listing.year} {listing.brand} {listing.model}</span>
                                            <div className="flex gap-3 text-xs font-bold text-gray-500 flex-shrink-0 ml-2">
                                                <span className="flex items-center gap-1"><Eye className="text-blue-500" size={14} /> {listing.viewCount}</span>
                                                <span className="flex items-center gap-1"><Heart className="text-red-400" size={14} /> {listing.favoriteCount}</span>
                                            </div>
                                        </div>
                                        {daysLeft !== null && (
                                            <p className={`text-[11px] font-medium ${daysLeft <= 7 ? 'text-orange-500' : 'text-gray-400'}`}>
                                                เหลืออีก {daysLeft} วัน
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
            {/* Upgrade Package Modal */}
            {showUpgradeModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setShowUpgradeModal(false)}
                    ></div>
                    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4 relative z-10 text-center">
                        <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg shadow-orange-200">
                            <Crown size={40} className="text-white" />
                        </div>

                        <h3 className="text-xl font-bold text-gray-800 mb-2">สิทธิการลงประกาศเต็มแล้ว</h3>
                        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                            {PACKAGES_ENABLED
                                ? <>แพ็กเกจ {packageName} ลงประกาศได้สูงสุด {maxListings} รายการ{bonusListingSlots > 0 ? ` (แพ็กเกจ ${packageMaxListings} + slot ${bonusListingSlots})` : ''} เลือกซื้อ slot เพิ่ม (฿99/slot) หรืออัพเกรดแพ็กเกจ</>
                                : <>คุณลงประกาศครบ {maxListings} รายการแล้ว กรุณาลบหรือปิดประกาศเดิมก่อนจึงจะลงประกาศใหม่ได้</>}
                        </p>

                        <div className="flex flex-col gap-3">
                            {PACKAGES_ENABLED && (
                                <>
                                    <button
                                        onClick={() => { setShowUpgradeModal(false); setShowSlotModal(true); }}
                                        className="w-full py-3.5 px-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold hover:from-orange-600 hover:to-red-600 transition-all shadow-lg shadow-orange-200 flex items-center justify-center gap-2"
                                    >
                                        <ShoppingBag size={18} /> ซื้อ slot เพิ่ม ฿99/slot
                                    </button>
                                    <button
                                        onClick={() => router.push('/profile/packages')}
                                        className="w-full py-3 px-4 border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition flex items-center justify-center gap-2"
                                    >
                                        <Crown size={18} />
                                        ดูแพ็กเกจ
                                    </button>
                                </>
                            )}
                            <button
                                onClick={() => setShowUpgradeModal(false)}
                                className={PACKAGES_ENABLED
                                    ? "w-full py-2 text-sm text-gray-400 hover:text-gray-600 transition"
                                    : "w-full py-3.5 px-4 bg-primary text-white rounded-xl font-bold hover:bg-opacity-90 transition"}
                            >
                                {PACKAGES_ENABLED ? 'ปิด' : 'รับทราบ'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {PACKAGES_ENABLED && (
                <SlotPurchaseModal
                    open={showSlotModal}
                    onClose={() => setShowSlotModal(false)}
                    onSuccess={() => setShowUpgradeModal(false)}
                />
            )}
        </div>
    );
}
