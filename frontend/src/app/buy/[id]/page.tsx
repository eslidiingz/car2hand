"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    Heart,
    Share,
    Phone,
    ChatCircle,
    MapPin,
    CalendarBlank,
    Gauge,
    GasPump,
    GearFine,
    Car,
    Motorcycle,
    Palette,
    User,
    ShieldCheck,
    Eye,
    Clock,
    CaretLeft,
    CaretRight,
    CircleNotch,
    WarningCircle,
    CheckCircle,
    XCircle,
    Wrench,
    Certificate,
    Scales,
    Check,
    AddressBook,
    Lightning,
    Users
} from '@phosphor-icons/react';
import { useWishlist, WishlistItem } from '@/contexts/WishlistContext';
import LoginModal from '@/components/LoginModal';
import RegisterModal from '@/components/RegisterModal';
import Toast from '@/components/Toast';

// Types
interface VehicleImage {
    id: string;
    url: string;
    isPrimary: boolean;
    order: number;
}

interface VehicleListing {
    id: string;
    userId: string;
    vehicleType: 'CAR' | 'MOTORCYCLE';
    title: string;
    description: string | null;
    price: number;
    brand: string;
    model: string;
    subModel: string | null;
    year: number;
    color: string;
    fuelType: string;
    transmission: string | null;
    engineSize: number | null;
    seats: number | null;
    mileage: number | null;
    bodyType: string | null;
    plateProvince: string | null;
    registrationType: string | null;
    condition: string | null;
    ownerCount: number;
    hasAccident: boolean;
    hasModified: boolean;
    hasWarranty: boolean;
    province: string;
    district: string | null;
    contactName: string | null;
    contactPhone: string | null;
    lineId: string | null;
    facebookUrl: string | null;
    status: string;
    viewCount: number;
    createdAt: string;
    images: VehicleImage[];
    user: {
        id: string;
        fullName: string;
        phoneNumber?: string;
    };
}

export default function CarDetailPage() {
    const params = useParams();
    const router = useRouter();
    const listingId = params.id as string;

    const [listing, setListing] = useState<VehicleListing | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Wishlist
    const { isInWishlist, toggleWishlist, isLoggedIn, isInCompare, toggleCompare, maxCompareItems, compareList } = useWishlist();
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [showContactModal, setShowContactModal] = useState(false);
    const [showFullscreenGallery, setShowFullscreenGallery] = useState(false);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);
    const [toastType, setToastType] = useState<'success' | 'error'>('success');
    const thumbnailRef = useRef<HTMLDivElement>(null);
    const thumbnailFullscreenRef = useRef<HTMLDivElement>(null);

    // Get current user
    const getCurrentUserId = () => {
        const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
        if (userData) {
            try {
                return JSON.parse(userData).id;
            } catch {
                return null;
            }
        }
        return null;
    };

    const formatPrice = (price: number | string) => {
        const numPrice = typeof price === 'string' ? parseFloat(price) : Number(price);
        return numPrice.toLocaleString('th-TH');
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getFuelTypeLabel = (fuelType: string) => {
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

    const getTransmissionLabel = (transmission: string | null) => {
        if (!transmission) return '-';
        const labels: Record<string, string> = {
            'AUTOMATIC': 'อัตโนมัติ',
            'MANUAL': 'ธรรมดา',
            'CVT': 'CVT',
            'DCT': 'DCT',
            'SEMI_AUTO': 'กึ่งอัตโนมัติ'
        };
        return labels[transmission] || transmission;
    };

    const getConditionLabel = (condition: string | null) => {
        if (!condition) return '-';
        const labels: Record<string, string> = {
            'EXCELLENT': 'ดีเยี่ยม',
            'GOOD': 'ดี',
            'FAIR': 'พอใช้',
            'POOR': 'ต้องปรับปรุง'
        };
        return labels[condition] || condition;
    };

    const getBodyTypeLabel = (bodyType: string | null) => {
        if (!bodyType) return '-';
        const labels: Record<string, string> = {
            'SEDAN': 'ซีดาน',
            'HATCHBACK': 'แฮทช์แบ็ก',
            'SUV': 'SUV',
            'MPV': 'MPV',
            'PICKUP': 'กระบะ',
            'COUPE': 'คูเป้',
            'CONVERTIBLE': 'เปิดประทุน',
            'WAGON': 'แวกอน',
            'VAN': 'รถตู้',
            'STANDARD': 'มาตรฐาน',
            'SPORT': 'สปอร์ต',
            'CRUISER': 'ครุยเซอร์',
            'TOURING': 'ทัวริ่ง',
            'SCOOTER': 'สกู๊ตเตอร์',
            'OFF_ROAD': 'ออฟโรด',
            'NAKED': 'เนคเก็ด'
        };
        return labels[bodyType] || bodyType;
    };

    const fetchListing = async () => {
        setLoading(true);
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
            const userId = getCurrentUserId();
            const url = userId
                ? `${API_URL}/listings/${listingId}?viewerId=${userId}`
                : `${API_URL}/listings/${listingId}`;

            const response = await fetch(url);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'ไม่พบประกาศนี้');
            }

            setListing(data.listing);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (listingId) {
            fetchListing();
        }
    }, [listingId]);

    // Scroll active thumbnail into view
    useEffect(() => {
        const scrollToActiveThumb = (containerRef: React.RefObject<HTMLDivElement | null>) => {
            if (containerRef.current) {
                const activeThumb = containerRef.current.children[currentImageIndex] as HTMLElement;
                if (activeThumb) {
                    activeThumb.scrollIntoView({
                        behavior: 'smooth',
                        block: 'nearest',
                        inline: 'center'
                    });
                }
            }
        };

        if (showFullscreenGallery) {
            scrollToActiveThumb(thumbnailFullscreenRef);
        } else {
            scrollToActiveThumb(thumbnailRef);
        }
    }, [currentImageIndex, showFullscreenGallery]);

    const nextImage = () => {
        if (listing && listing.images.length > 0) {
            setCurrentImageIndex((prev) => (prev + 1) % listing.images.length);
        }
    };

    const prevImage = () => {
        if (listing && listing.images.length > 0) {
            setCurrentImageIndex((prev) => (prev - 1 + listing.images.length) % listing.images.length);
        }
    };

    // Create wishlist item from listing
    const createWishlistItem = (): WishlistItem | null => {
        if (!listing) return null;
        return {
            id: listing.id,
            title: listing.title,
            price: typeof listing.price === 'string' ? parseFloat(listing.price) : Number(listing.price),
            vehicleType: listing.vehicleType,
            brand: listing.brand,
            model: listing.model,
            year: listing.year,
            mileage: listing.mileage,
            fuelType: listing.fuelType,
            transmission: listing.transmission,
            engineSize: listing.engineSize,
            seats: (listing as any).seats,
            province: listing.province,
            imageUrl: listing.images[0]?.url,
            images: listing.images.map(img => ({ url: img.url, isPrimary: img.isPrimary })),
            user: listing.user,
            addedAt: new Date().toISOString()
        };
    };

    // Handle wishlist toggle
    const handleWishlistClick = async () => {
        const item = createWishlistItem();
        if (!item) return;

        const result = await toggleWishlist(item);

        // Check if login is required
        if (result.requiresLogin) {
            setShowLoginModal(true);
            return;
        }

        setToastMessage(result.message);
        setToastType(result.success ? 'success' : 'error');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
    };

    // Handle compare toggle
    const handleCompareClick = () => {
        const item = createWishlistItem();
        if (!item) return;

        const result = toggleCompare(item);

        setToastMessage(result.message);
        setToastType(result.success ? 'success' : 'error');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
    };

    // Modal handlers
    const handleSwitchToRegister = () => {
        setShowLoginModal(false);
        setShowRegisterModal(true);
    };

    const handleSwitchToLogin = () => {
        setShowRegisterModal(false);
        setShowLoginModal(true);
    };

    // Get favorite state from context
    const isFavorite = listing ? isInWishlist(listing.id) : false;
    const isCompared = listing ? isInCompare(listing.id) : false;

    // Loading State
    if (loading) {
        return (
            <div className="bg-surface min-h-screen pt-8 pb-12 flex items-center justify-center">
                <div className="text-center">
                    <CircleNotch size={48} className="animate-spin text-primary mx-auto mb-4" />
                    <p className="text-gray-500">กำลังโหลด...</p>
                </div>
            </div>
        );
    }

    // Error State
    if (error || !listing) {
        return (
            <div className="bg-surface min-h-screen pt-8 pb-12">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                        <WarningCircle size={64} className="text-red-400 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-700 mb-2">ไม่พบประกาศ</h2>
                        <p className="text-gray-500 mb-6">{error || 'ประกาศนี้อาจถูกลบหรือไม่มีอยู่'}</p>
                        <Link href="/buy" className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-opacity-90 transition inline-flex items-center gap-2">
                            <ArrowLeft weight="bold" /> กลับไปหน้ารายการ
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-surface min-h-screen pt-8 pb-12">
            <div className="max-w-7xl mx-auto px-4">
                {/* Back Button */}
                <div className="mb-6">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-500 hover:text-primary transition"
                    >
                        <ArrowLeft weight="bold" size={20} />
                        <span className="font-medium">ย้อนกลับ</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Images & Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Image Gallery */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            {/* Main Image */}
                            <div
                                className="relative aspect-[16/10] bg-gray-100 cursor-pointer"
                                onClick={() => setShowFullscreenGallery(true)}
                                onTouchStart={(e) => setTouchStart(e.targetTouches[0].clientX)}
                                onTouchMove={(e) => setTouchEnd(e.targetTouches[0].clientX)}
                                onTouchEnd={() => {
                                    if (!touchStart || !touchEnd) return;
                                    const distance = touchStart - touchEnd;
                                    const minSwipeDistance = 50;
                                    if (distance > minSwipeDistance) {
                                        nextImage();
                                    } else if (distance < -minSwipeDistance) {
                                        prevImage();
                                    }
                                    setTouchStart(null);
                                    setTouchEnd(null);
                                }}
                            >
                                {listing.images.length > 0 ? (
                                    <img
                                        key={`main-${currentImageIndex}`}
                                        src={listing.images[currentImageIndex]?.url}
                                        alt={listing.title}
                                        className="w-full h-full object-cover animate-image-change"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        {listing.vehicleType === 'CAR' ? (
                                            <Car size={80} weight="thin" />
                                        ) : (
                                            <Motorcycle size={80} weight="thin" />
                                        )}
                                    </div>
                                )}

                                {/* Navigation Arrows */}
                                {listing.images.length > 1 && (
                                    <>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); prevImage(); }}
                                            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center text-gray-700 hover:bg-white transition shadow-lg"
                                        >
                                            <CaretLeft weight="bold" className="w-[16px] h-[16px] md:w-[20px] md:h-[20px]" />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); nextImage(); }}
                                            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center text-gray-700 hover:bg-white transition shadow-lg"
                                        >
                                            <CaretRight weight="bold" className="w-[16px] h-[16px] md:w-[20px] md:h-[20px]" />
                                        </button>
                                    </>
                                )}

                                {/* Image Counter */}
                                {listing.images.length > 0 && (
                                    <div className="absolute bottom-2 md:bottom-4 right-2 md:right-4 bg-black/60 text-white text-sm px-3 py-1.5 rounded-lg backdrop-blur-sm">
                                        {currentImageIndex + 1} / {listing.images.length}
                                    </div>
                                )}

                                {/* Province Badge */}
                                <div className="absolute bottom-2 md:bottom-4 left-2 md:left-4 bg-black/60 text-white text-sm px-3 py-1.5 rounded-lg backdrop-blur-sm flex items-center gap-1.5">
                                    <MapPin size={14} weight="fill" />
                                    {listing.province === 'กรุงเทพมหานคร' ? 'กรุงเทพฯ' : listing.province}
                                </div>
                            </div>

                            {/* Thumbnail Strip */}
                            {listing.images.length > 1 && (
                                <div ref={thumbnailRef} className="p-3 flex gap-2 overflow-x-auto no-scrollbar scroll-smooth">
                                    {listing.images.map((img, index) => (
                                        <button
                                            key={img.id}
                                            onClick={() => setCurrentImageIndex(index)}
                                            className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition ${index === currentImageIndex ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'
                                                }`}
                                        >
                                            <img src={img.url} alt="" className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Title & Price (Mobile) */}
                        <div className="lg:hidden bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h1 className="text-2xl font-bold text-gray-800 mb-3">{listing.title}</h1>
                            <div className="flex items-baseline gap-2 mb-4">
                                <span className="text-3xl font-bold text-accent">฿{formatPrice(listing.price)}</span>
                            </div>
                        </div>

                        {/* Specifications */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-primary mb-4">ข้อมูลจำเพาะ</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                                <div className="bg-gray-50 rounded-xl p-4 text-center">
                                    <CalendarBlank size={24} className="text-primary mx-auto mb-2" />
                                    <p className="text-xs text-gray-500">ปีที่ผลิต</p>
                                    <p className="font-bold text-gray-800">{listing.year}</p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-4 text-center">
                                    <Gauge size={24} className="text-primary mx-auto mb-2" />
                                    <p className="text-xs text-gray-500">เลขไมล์</p>
                                    <p className="font-bold text-gray-800">{listing.mileage ? `${formatPrice(listing.mileage)} กม.` : '-'}</p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-4 text-center">
                                    <GasPump size={24} className="text-primary mx-auto mb-2" />
                                    <p className="text-xs text-gray-500">เชื้อเพลิง</p>
                                    <p className="font-bold text-gray-800">{getFuelTypeLabel(listing.fuelType)}</p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-4 text-center">
                                    <GearFine size={24} className="text-primary mx-auto mb-2" />
                                    <p className="text-xs text-gray-500">เกียร์</p>
                                    <p className="font-bold text-gray-800">{getTransmissionLabel(listing.transmission)}</p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-4 text-center">
                                    <Palette size={24} className="text-primary mx-auto mb-2" />
                                    <p className="text-xs text-gray-500">สี</p>
                                    <p className="font-bold text-gray-800">{listing.color}</p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-4 text-center">
                                    <Lightning size={24} className="text-primary mx-auto mb-2" />
                                    <p className="text-xs text-gray-500">ขนาดเครื่องยนต์</p>
                                    <p className="font-bold text-gray-800">{listing.engineSize ? `${formatPrice(listing.engineSize)} CC` : '-'}</p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-4 text-center">
                                    <Users size={24} className="text-primary mx-auto mb-2" />
                                    <p className="text-xs text-gray-500">จำนวนที่นั่ง</p>
                                    <p className="font-bold text-gray-800">{(listing as any).seats ? `${(listing as any).seats} ที่นั่ง` : '-'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        {listing.description && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h2 className="text-lg font-bold text-primary mb-4">รายละเอียดเพิ่มเติม</h2>
                                <p className="text-gray-600 whitespace-pre-line leading-relaxed">{listing.description}</p>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Price & Contact */}
                    <div className="space-y-6">
                        {/* Price Card (Desktop) */}
                        <div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
                            <h1 className="text-xl font-bold text-gray-800 mb-3">{listing.title}</h1>
                            <div className="flex items-baseline gap-2 mb-6">
                                <span className="text-3xl font-bold text-accent">฿{formatPrice(listing.price)}</span>
                            </div>

                            {/* Actions */}
                            <div className="space-y-3 mb-6">
                                <button
                                    onClick={() => setShowContactModal(true)}
                                    className="w-full bg-accent text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-orange-600 transition shadow-lg shadow-orange-100"
                                >
                                    <AddressBook weight="bold" size={20} /> ข้อมูลการติดต่อ
                                </button>

                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={handleWishlistClick}
                                    className={`flex-1 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition border-2 ${isFavorite
                                        ? 'border-red-200 bg-red-50 text-red-500'
                                        : 'border-gray-200 text-gray-500 hover:border-red-200 hover:text-red-500'
                                        }`}
                                >
                                    <Heart weight={isFavorite ? 'fill' : 'regular'} size={18} />
                                    บันทึก
                                </button>
                                <button
                                    onClick={handleCompareClick}
                                    className={`flex-1 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition border-2 ${isCompared
                                        ? 'border-primary bg-blue-50 text-primary'
                                        : 'border-gray-200 text-gray-500 hover:border-primary hover:text-primary'
                                        }`}
                                >
                                    <Scales weight={isCompared ? 'fill' : 'regular'} size={18} />
                                    เปรียบเทียบ
                                </button>
                            </div>

                            {/* Stats */}
                            <div className="mt-6 pt-6 border-t border-gray-100 flex justify-between text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                    <Eye size={16} />
                                    <span>{listing.viewCount} เข้าชม</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Clock size={16} />
                                    <span>{formatDate(listing.createdAt)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Seller Info */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-bold text-primary mb-4">ข้อมูลผู้ขาย</h3>
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold">
                                    {listing.user.fullName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-800">{listing.user.fullName}</p>
                                    <p className="text-sm text-gray-500 flex items-center gap-1">
                                        <MapPin size={12} />
                                        {listing.province}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Fixed Bottom Bar */}
                <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex gap-3 z-40">
                    <button
                        onClick={handleWishlistClick}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 transition ${isFavorite ? 'border-red-200 bg-red-50 text-red-500' : 'border-gray-200 text-gray-400'
                            }`}
                    >
                        <Heart weight={isFavorite ? 'fill' : 'regular'} size={22} />
                    </button>
                    <button
                        onClick={handleCompareClick}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 transition ${isCompared ? 'border-primary bg-blue-50 text-primary' : 'border-gray-200 text-gray-400'
                            }`}
                    >
                        <Scales weight={isCompared ? 'fill' : 'regular'} size={22} />
                    </button>
                    <button
                        onClick={() => setShowContactModal(true)}
                        className="flex-1 bg-accent text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-100"
                    >
                        <AddressBook weight="bold" size={20} /> ข้อมูลการติดต่อ
                    </button>

                </div>
            </div>

            {/* Toast Notification */}
            {showToast && (
                <Toast type={toastType} message={toastMessage} />
            )}


            {/* Login Modal */}
            <LoginModal
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                onSwitchToRegister={handleSwitchToRegister}
                redirectTo={`/buy/${listingId}`}
            />

            {/* Register Modal */}
            <RegisterModal
                isOpen={showRegisterModal}
                onClose={() => setShowRegisterModal(false)}
                onSwitchToLogin={handleSwitchToLogin}
            />

            {/* Contact Info Modal */}
            {showContactModal && listing && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowContactModal(false)}>
                    <div
                        className="bg-white rounded-2xl max-w-md w-full p-6 animate-scale-in"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-primary">ข้อมูลการติดต่อ</h3>
                            <button
                                onClick={() => setShowContactModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition"
                            >
                                <XCircle size={28} weight="fill" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Seller Name */}
                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                                    <User size={24} className="text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">ผู้ขาย</p>
                                    <p className="font-bold text-gray-800">{listing.contactName || listing.user.fullName}</p>
                                </div>
                            </div>

                            {/* Phone */}
                            <a
                                href={`tel:${listing.contactPhone || listing.user.phoneNumber || ''}`}
                                className="flex items-center gap-4 p-4 bg-green-50 rounded-xl hover:bg-green-100 transition group"
                            >
                                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                                    <Phone size={24} className="text-white" weight="fill" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-500">เบอร์โทรศัพท์</p>
                                    <p className="font-bold text-gray-800">{listing.contactPhone || listing.user.phoneNumber || '-'}</p>
                                </div>
                                <span className="text-green-500 font-medium group-hover:underline">โทร</span>
                            </a>

                            {/* LINE */}
                            {listing.lineId && (
                                <a
                                    href={`https://line.me/ti/p/~${listing.lineId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-4 p-4 bg-[#06C755]/10 rounded-xl hover:bg-[#06C755]/20 transition group"
                                >
                                    <div className="w-12 h-12 bg-[#06C755] rounded-full flex items-center justify-center">
                                        <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-500">LINE ID</p>
                                        <p className="font-bold text-gray-800">{listing.lineId}</p>
                                    </div>
                                    <span className="text-[#06C755] font-medium group-hover:underline">เปิด</span>
                                </a>
                            )}

                            {/* Facebook */}
                            {listing.facebookUrl && (
                                <a
                                    href={listing.facebookUrl.startsWith('http') ? listing.facebookUrl : `https://facebook.com/${listing.facebookUrl}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-4 p-4 bg-[#1877F2]/10 rounded-xl hover:bg-[#1877F2]/20 transition group"
                                >
                                    <div className="w-12 h-12 bg-[#1877F2] rounded-full flex items-center justify-center">
                                        <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-500">Facebook</p>
                                        <p className="font-bold text-gray-800 truncate">{listing.facebookUrl}</p>
                                    </div>
                                    <span className="text-[#1877F2] font-medium group-hover:underline">เปิด</span>
                                </a>
                            )}
                        </div>

                        <button
                            onClick={() => setShowContactModal(false)}
                            className="w-full mt-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition"
                        >
                            ปิด
                        </button>
                    </div>
                </div>
            )}

            {/* Fullscreen Gallery Modal */}
            {showFullscreenGallery && listing && listing.images.length > 0 && (
                <div
                    className="fixed inset-0 bg-black z-50 flex flex-col h-[100dvh]"
                    onTouchStart={(e) => setTouchStart(e.targetTouches[0].clientX)}
                    onTouchMove={(e) => setTouchEnd(e.targetTouches[0].clientX)}
                    onTouchEnd={() => {
                        if (!touchStart || !touchEnd) return;
                        const distance = touchStart - touchEnd;
                        const minSwipeDistance = 50;
                        if (distance > minSwipeDistance) {
                            nextImage();
                        } else if (distance < -minSwipeDistance) {
                            prevImage();
                        }
                        setTouchStart(null);
                        setTouchEnd(null);
                    }}
                >
                    {/* Header */}
                    <div className="flex-shrink-0 flex items-center justify-between p-4 text-white bg-gradient-to-b from-black/50 to-transparent">
                        <div className="text-sm font-medium">
                            {currentImageIndex + 1} / {listing.images.length}
                        </div>
                        <button
                            onClick={() => setShowFullscreenGallery(false)}
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition backdrop-blur-sm"
                        >
                            <XCircle size={28} weight="fill" />
                        </button>
                    </div>

                    {/* Main Image Container */}
                    <div className="flex-1 min-h-0 flex items-center justify-center px-4 relative group">
                        <img
                            key={`full-${currentImageIndex}`}
                            src={listing.images[currentImageIndex]?.url}
                            alt={listing.title}
                            className="max-w-full max-h-full object-contain animate-image-change shadow-2xl"
                        />

                        {/* Navigation Arrows - Hidden on mobile, visible on desktop */}
                        {listing.images.length > 1 && (
                            <>
                                <button
                                    onClick={prevImage}
                                    className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/30 hover:bg-black/50 backdrop-blur rounded-full items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <CaretLeft weight="bold" size={24} />
                                </button>
                                <button
                                    onClick={nextImage}
                                    className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/30 hover:bg-black/50 backdrop-blur rounded-full items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <CaretRight weight="bold" size={24} />
                                </button>
                            </>
                        )}
                    </div>

                    {/* Footer Section: Thumbnails + Swipe Hint */}
                    <div className="flex-shrink-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-4">
                        {/* Thumbnail Strip */}
                        {listing.images.length > 1 && (
                            <div
                                ref={thumbnailFullscreenRef}
                                className="px-4 py-2 flex gap-2 justify-start md:justify-center overflow-x-auto no-scrollbar scroll-smooth"
                                style={{ maxHeight: '80px' }}
                            >
                                {listing.images.map((img, index) => (
                                    <button
                                        key={img.id}
                                        onClick={() => setCurrentImageIndex(index)}
                                        className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all duration-200 ${index === currentImageIndex
                                                ? 'border-white scale-110 shadow-lg z-10'
                                                : 'border-transparent opacity-40 hover:opacity-100 hover:scale-105'
                                            }`}
                                    >
                                        <img src={img.url} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Swipe Hint for Mobile */}
                        <div className="md:hidden text-center py-3 text-white/40 text-[10px] tracking-widest font-light uppercase">
                            ← เลื่อนเพื่อดูรูป →
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
