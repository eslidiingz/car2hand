"use client";

import React, { useState, useEffect } from 'react';
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
    Certificate
} from '@phosphor-icons/react';

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
    negotiable: boolean;
    brand: string;
    model: string;
    subModel: string | null;
    year: number;
    color: string;
    fuelType: string;
    transmission: string | null;
    engineSize: number | null;
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
    const [isFavorite, setIsFavorite] = useState(false);

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
            'PETROL': 'เบนซิน',
            'DIESEL': 'ดีเซล',
            'HYBRID': 'ไฮบริด',
            'PLUGIN_HYBRID': 'ปลั๊กอินไฮบริด',
            'ELECTRIC': 'ไฟฟ้า',
            'LPG': 'LPG',
            'NGV': 'NGV'
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
            const userId = getCurrentUserId();
            const url = userId
                ? `http://localhost:8000/listings/${listingId}?viewerId=${userId}`
                : `http://localhost:8000/listings/${listingId}`;

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
                            <div className="relative aspect-[16/10] bg-gray-100">
                                {listing.images.length > 0 ? (
                                    <img
                                        src={listing.images[currentImageIndex]?.url}
                                        alt={listing.title}
                                        className="w-full h-full object-cover"
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
                                            onClick={prevImage}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center text-gray-700 hover:bg-white transition shadow-lg"
                                        >
                                            <CaretLeft weight="bold" size={20} />
                                        </button>
                                        <button
                                            onClick={nextImage}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center text-gray-700 hover:bg-white transition shadow-lg"
                                        >
                                            <CaretRight weight="bold" size={20} />
                                        </button>
                                    </>
                                )}

                                {/* Image Counter */}
                                {listing.images.length > 0 && (
                                    <div className="absolute bottom-4 right-4 bg-black/60 text-white text-sm px-3 py-1.5 rounded-lg backdrop-blur-sm">
                                        {currentImageIndex + 1} / {listing.images.length}
                                    </div>
                                )}

                                {/* Province Badge */}
                                <div className="absolute bottom-4 left-4 bg-black/60 text-white text-sm px-3 py-1.5 rounded-lg backdrop-blur-sm flex items-center gap-1.5">
                                    <MapPin size={14} weight="fill" />
                                    {listing.province === 'กรุงเทพมหานคร' ? 'กรุงเทพฯ' : listing.province}
                                </div>
                            </div>

                            {/* Thumbnail Strip */}
                            {listing.images.length > 1 && (
                                <div className="p-3 flex gap-2 overflow-x-auto">
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
                                {listing.negotiable && (
                                    <span className="text-sm text-gray-400">ต่อรองได้</span>
                                )}
                            </div>
                        </div>

                        {/* Specifications */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-primary mb-4">ข้อมูลจำเพาะ</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-gray-50 rounded-xl p-4 text-center">
                                    <CalendarBlank size={24} className="text-primary mx-auto mb-2" />
                                    <p className="text-xs text-gray-500">ปี</p>
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
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                    <Palette size={20} className="text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-500">สี</p>
                                        <p className="font-medium text-gray-800">{listing.color}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                    <Car size={20} className="text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-500">ประเภทตัวถัง</p>
                                        <p className="font-medium text-gray-800">{getBodyTypeLabel(listing.bodyType)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                    <User size={20} className="text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-500">เจ้าของ</p>
                                        <p className="font-medium text-gray-800">มือที่ {listing.ownerCount}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Vehicle Condition */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-primary mb-4">สภาพรถ</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className={`flex items-center gap-3 p-3 rounded-xl ${listing.hasAccident ? 'bg-red-50' : 'bg-green-50'}`}>
                                    {listing.hasAccident ? (
                                        <XCircle size={24} className="text-red-500" weight="fill" />
                                    ) : (
                                        <CheckCircle size={24} className="text-green-500" weight="fill" />
                                    )}
                                    <div>
                                        <p className="text-xs text-gray-500">เคยชน</p>
                                        <p className={`font-medium ${listing.hasAccident ? 'text-red-600' : 'text-green-600'}`}>
                                            {listing.hasAccident ? 'เคยชน' : 'ไม่เคยชน'}
                                        </p>
                                    </div>
                                </div>
                                <div className={`flex items-center gap-3 p-3 rounded-xl ${listing.hasModified ? 'bg-orange-50' : 'bg-green-50'}`}>
                                    <Wrench size={24} className={listing.hasModified ? 'text-orange-500' : 'text-green-500'} />
                                    <div>
                                        <p className="text-xs text-gray-500">แต่งรถ</p>
                                        <p className={`font-medium ${listing.hasModified ? 'text-orange-600' : 'text-green-600'}`}>
                                            {listing.hasModified ? 'มีการแต่ง' : 'ไม่แต่ง'}
                                        </p>
                                    </div>
                                </div>
                                <div className={`flex items-center gap-3 p-3 rounded-xl ${listing.hasWarranty ? 'bg-blue-50' : 'bg-gray-50'}`}>
                                    <Certificate size={24} className={listing.hasWarranty ? 'text-blue-500' : 'text-gray-400'} />
                                    <div>
                                        <p className="text-xs text-gray-500">ประกัน</p>
                                        <p className={`font-medium ${listing.hasWarranty ? 'text-blue-600' : 'text-gray-500'}`}>
                                            {listing.hasWarranty ? 'มีประกัน' : 'ไม่มี'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                    <ShieldCheck size={24} className="text-primary" />
                                    <div>
                                        <p className="text-xs text-gray-500">สภาพ</p>
                                        <p className="font-medium text-gray-800">{getConditionLabel(listing.condition)}</p>
                                    </div>
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
                                {listing.negotiable && (
                                    <span className="text-sm text-gray-400">ต่อรองได้</span>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="space-y-3 mb-6">
                                <a
                                    href={`tel:${listing.user.phoneNumber || ''}`}
                                    className="w-full bg-accent text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-orange-600 transition shadow-lg shadow-orange-100"
                                >
                                    <Phone weight="bold" size={20} /> โทรติดต่อ
                                </a>
                                <button className="w-full bg-primary text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-opacity-90 transition">
                                    <ChatCircle weight="bold" size={20} /> ส่งข้อความ
                                </button>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => setIsFavorite(!isFavorite)}
                                    className={`flex-1 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition border-2 ${isFavorite
                                        ? 'border-red-200 bg-red-50 text-red-500'
                                        : 'border-gray-200 text-gray-500 hover:border-red-200 hover:text-red-500'
                                        }`}
                                >
                                    <Heart weight={isFavorite ? 'fill' : 'regular'} size={18} />
                                    บันทึก
                                </button>
                                <button className="flex-1 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-500 hover:border-primary hover:text-primary transition">
                                    <Share size={18} />
                                    แชร์
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
                        onClick={() => setIsFavorite(!isFavorite)}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 transition ${isFavorite ? 'border-red-200 bg-red-50 text-red-500' : 'border-gray-200 text-gray-400'
                            }`}
                    >
                        <Heart weight={isFavorite ? 'fill' : 'regular'} size={22} />
                    </button>
                    <a
                        href={`tel:${listing.user.phoneNumber || ''}`}
                        className="flex-1 bg-accent text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                    >
                        <Phone weight="bold" size={20} /> โทร
                    </a>
                    <button className="flex-1 bg-primary text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                        <ChatCircle weight="bold" size={20} /> แชท
                    </button>
                </div>
            </div>
        </div>
    );
}
