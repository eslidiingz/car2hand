"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Car,
    Motorcycle,
    GearFine,
    GitCommit,
    Gauge,
    Image as ImageIcon,
    CurrencyDollar,
    MapPin,
    ArrowLeft,
    FloppyDisk,
    CircleNotch,
    WarningCircle,
    CheckCircle,
    Trash,
    Plus,
    Drop,
    Palette,
    Lightbulb
} from '@phosphor-icons/react';
import PreviewCard from '@/components/PreviewCard';

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
    images: VehicleImage[];
    user?: {
        id: string;
        fullName: string;
    };
}

interface FormData {
    vehicleType: 'CAR' | 'MOTORCYCLE';
    title: string;
    description: string;
    price: number;
    negotiable: boolean;
    brand: string;
    model: string;
    subModel: string;
    year: number;
    color: string;
    fuelType: 'PETROL' | 'DIESEL' | 'HYBRID' | 'PLUGIN_HYBRID' | 'ELECTRIC' | 'LPG' | 'NGV';
    transmission: 'AUTOMATIC' | 'MANUAL' | 'CVT' | 'DCT' | 'SEMI_AUTO';
    mileage: number;
    bodyType: string;
    condition: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
    ownerCount: number;
    hasAccident: boolean;
    hasModified: boolean;
    hasWarranty: boolean;
    province: string;
    district: string;
}

// Constants
const COLORS = ['ดำ', 'ขาว', 'เงิน', 'เทา', 'แดง', 'น้ำเงิน', 'เขียว', 'ทอง', 'ส้ม', 'ม่วง', 'น้ำตาล', 'ชมพู', 'เหลือง', 'อื่นๆ'];
const CAR_BRANDS = ['Toyota', 'Honda', 'Mazda', 'Nissan', 'Mitsubishi', 'Isuzu', 'Ford', 'Chevrolet', 'MG', 'BMW', 'Mercedes-Benz', 'Audi', 'Lexus', 'Hyundai', 'Kia', 'Suzuki', 'Subaru', 'Volvo', 'Porsche', 'Mini', 'Jaguar', 'Land Rover', 'Tesla', 'BYD', 'Haval', 'Changan', 'Neta', 'ORA', 'อื่นๆ'];
const MOTORCYCLE_BRANDS = ['Honda', 'Yamaha', 'Kawasaki', 'Suzuki', 'BMW', 'Ducati', 'Triumph', 'KTM', 'Harley-Davidson', 'Royal Enfield', 'Vespa', 'GPX', 'Benelli', 'CF Moto', 'Zontes', 'อื่นๆ'];
const PROVINCES = ['กรุงเทพมหานคร', 'กระบี่', 'กาญจนบุรี', 'กาฬสินธุ์', 'กำแพงเพชร', 'ขอนแก่น', 'จันทบุรี', 'ฉะเชิงเทรา', 'ชลบุรี', 'ชัยนาท', 'ชัยภูมิ', 'ชุมพร', 'เชียงราย', 'เชียงใหม่', 'ตรัง', 'ตราด', 'ตาก', 'นครนายก', 'นครปฐม', 'นครพนม', 'นครราชสีมา', 'นครศรีธรรมราช', 'นครสวรรค์', 'นนทบุรี', 'นราธิวาส', 'น่าน', 'บึงกาฬ', 'บุรีรัมย์', 'ปทุมธานี', 'ประจวบคีรีขันธ์', 'ปราจีนบุรี', 'ปัตตานี', 'พระนครศรีอยุธยา', 'พังงา', 'พัทลุง', 'พิจิตร', 'พิษณุโลก', 'เพชรบุรี', 'เพชรบูรณ์', 'แพร่', 'ภูเก็ต', 'มหาสารคาม', 'มุกดาหาร', 'แม่ฮ่องสอน', 'ยโสธร', 'ยะลา', 'ร้อยเอ็ด', 'ระนอง', 'ระยอง', 'ราชบุรี', 'ลพบุรี', 'ลำปาง', 'ลำพูน', 'เลย', 'ศรีสะเกษ', 'สกลนคร', 'สงขลา', 'สตูล', 'สมุทรปราการ', 'สมุทรสงคราม', 'สมุทรสาคร', 'สระแก้ว', 'สระบุรี', 'สิงห์บุรี', 'สุโขทัย', 'สุพรรณบุรี', 'สุราษฎร์ธานี', 'สุรินทร์', 'หนองคาย', 'หนองบัวลำภู', 'อ่างทอง', 'อำนาจเจริญ', 'อุดรธานี', 'อุตรดิตถ์', 'อุทัยธานี', 'อุบลราชธานี'];

const years = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() + 1 - i);

export default function EditListingPage() {
    const params = useParams();
    const router = useRouter();
    const listingId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [listing, setListing] = useState<VehicleListing | null>(null);

    const [formData, setFormData] = useState<FormData>({
        vehicleType: 'CAR',
        title: '',
        description: '',
        price: 0,
        negotiable: true,
        brand: '',
        model: '',
        subModel: '',
        year: new Date().getFullYear(),
        color: '',
        fuelType: 'PETROL',
        transmission: 'AUTOMATIC',
        mileage: 0,
        bodyType: 'SEDAN',
        condition: 'GOOD',
        ownerCount: 1,
        hasAccident: false,
        hasModified: false,
        hasWarranty: false,
        province: '',
        district: ''
    });

    const brands = formData.vehicleType === 'CAR' ? CAR_BRANDS : MOTORCYCLE_BRANDS;

    // Check user auth
    useEffect(() => {
        const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
        if (!userData) {
            router.push('/');
            return;
        }
        const user = JSON.parse(userData);
        setUserId(user.id);
    }, [router]);

    // Load listing data
    useEffect(() => {
        if (!listingId || !userId) return;

        const fetchListing = async () => {
            try {
                setLoading(true);
                // ส่ง viewerId เพื่อไม่นับ view เมื่อเจ้าของดูเอง
                const response = await fetch(`http://localhost:8000/listings/${listingId}?viewerId=${userId}`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'ไม่พบประกาศนี้');
                }

                const listingData = data.listing as VehicleListing;

                // Check ownership
                if (listingData.userId !== userId) {
                    setError('คุณไม่มีสิทธิ์แก้ไขประกาศนี้');
                    return;
                }

                setListing(listingData);

                // Populate form
                setFormData({
                    vehicleType: listingData.vehicleType,
                    title: listingData.title,
                    description: listingData.description || '',
                    price: Number(listingData.price),
                    negotiable: listingData.negotiable,
                    brand: listingData.brand,
                    model: listingData.model,
                    subModel: listingData.subModel || '',
                    year: listingData.year,
                    color: listingData.color,
                    fuelType: listingData.fuelType as FormData['fuelType'],
                    transmission: (listingData.transmission as FormData['transmission']) || 'AUTOMATIC',
                    mileage: listingData.mileage || 0,
                    bodyType: listingData.bodyType || 'SEDAN',
                    condition: (listingData.condition as FormData['condition']) || 'GOOD',
                    ownerCount: listingData.ownerCount,
                    hasAccident: listingData.hasAccident,
                    hasModified: listingData.hasModified,
                    hasWarranty: listingData.hasWarranty,
                    province: listingData.province,
                    district: listingData.district || ''
                });
            } catch (err) {
                setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
            } finally {
                setLoading(false);
            }
        };

        fetchListing();
    }, [listingId, userId]);

    const updateFormData = (updates: Partial<FormData>) => {
        setFormData(prev => ({ ...prev, ...updates }));
    };

    const handleSubmit = async () => {
        if (!userId || !listingId) return;

        // Validation
        if (!formData.brand || !formData.model || !formData.color || !formData.province) {
            setError('กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }

        setSaving(true);
        setError(null);

        try {
            const response = await fetch(`http://localhost:8000/listings/${listingId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId,
                    ...formData,
                    title: formData.title || `${formData.brand} ${formData.model} ${formData.year}`
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'เกิดข้อผิดพลาดในการอัพเดทประกาศ');
            }

            setSuccess(true);
            setTimeout(() => {
                router.push('/profile/listings');
            }, 1500);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-surface flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <CircleNotch size={48} className="animate-spin text-primary" />
                    <p className="text-gray-500">กำลังโหลดข้อมูล...</p>
                </div>
            </div>
        );
    }

    if (error && !listing) {
        return (
            <div className="min-h-screen bg-surface flex items-center justify-center">
                <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
                    <WarningCircle size={64} className="text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-800 mb-2">เกิดข้อผิดพลาด</h2>
                    <p className="text-gray-500 mb-6">{error}</p>
                    <Link href="/profile/listings" className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-opacity-90 transition">
                        กลับไปหน้ารายการ
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-surface pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/profile/listings" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition">
                                <ArrowLeft size={20} weight="bold" />
                            </Link>
                            <div>
                                <h1 className="text-xl font-bold text-gray-800">แก้ไขประกาศ</h1>
                                <p className="text-sm text-gray-500">อัพเดทข้อมูลรถของคุณ</p>
                            </div>
                        </div>
                        <button
                            onClick={handleSubmit}
                            disabled={saving}
                            className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold hover:bg-opacity-90 transition flex items-center gap-2 disabled:opacity-50"
                        >
                            {saving ? (
                                <>
                                    <CircleNotch size={20} className="animate-spin" />
                                    กำลังบันทึก...
                                </>
                            ) : (
                                <>
                                    <FloppyDisk size={20} weight="bold" />
                                    บันทึกการเปลี่ยนแปลง
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Success Message */}
            {success && (
                <div className="max-w-4xl mx-auto px-4 mt-4">
                    <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700">
                        <CheckCircle size={24} weight="bold" />
                        <span className="font-medium">บันทึกการเปลี่ยนแปลงสำเร็จ! กำลังกลับไปหน้ารายการ...</span>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && listing && (
                <div className="max-w-4xl mx-auto px-4 mt-4">
                    <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                        <WarningCircle size={24} weight="bold" />
                        <span className="font-medium">{error}</span>
                    </div>
                </div>
            )}

            {/* Form Content */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                            {/* Current Images */}
                            {listing && listing.images.length > 0 && (
                                <div className="mb-8">
                                    <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                                        <ImageIcon size={24} weight="fill" className="text-accent" /> รูปภาพปัจจุบัน
                                    </h3>
                                    <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                                        {listing.images.map((img, index) => (
                                            <div key={img.id} className="relative aspect-[4/3] rounded-xl overflow-hidden border-2 border-gray-200">
                                                <img src={img.url} alt={`Image ${index + 1}`} className="w-full h-full object-cover" />
                                                {img.isPrimary && (
                                                    <div className="absolute top-1 left-1 bg-primary text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                                                        หลัก
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-sm text-gray-400 mt-2">* การจัดการรูปภาพจะพัฒนาในเวอร์ชันถัดไป</p>
                                </div>
                            )}

                            {/* Vehicle Info Section */}
                            <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                                <Car size={24} weight="fill" className="text-accent" /> ข้อมูลยานพาหนะ
                            </h3>

                            {/* Vehicle Type */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">ประเภทยานพาหนะ</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => updateFormData({ vehicleType: 'CAR', brand: '', model: '', bodyType: 'SEDAN' })}
                                        className={`form-button ${formData.vehicleType === 'CAR' ? 'form-button-active' : 'form-button-inactive'}`}
                                    >
                                        <Car size={20} weight="fill" /> รถยนต์
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => updateFormData({ vehicleType: 'MOTORCYCLE', brand: '', model: '', bodyType: 'STANDARD' })}
                                        className={`form-button ${formData.vehicleType === 'MOTORCYCLE' ? 'form-button-active' : 'form-button-inactive'}`}
                                    >
                                        <Motorcycle size={20} weight="fill" /> มอเตอร์ไซค์
                                    </button>
                                </div>
                            </div>

                            {/* Year, Brand, Model */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">ปีที่ผลิต *</label>
                                    <select
                                        className="form-select"
                                        value={formData.year}
                                        onChange={(e) => updateFormData({ year: parseInt(e.target.value) })}
                                    >
                                        {years.map(y => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">ยี่ห้อ *</label>
                                    <select
                                        className="form-select"
                                        value={formData.brand}
                                        onChange={(e) => updateFormData({ brand: e.target.value })}
                                    >
                                        <option value="">เลือกยี่ห้อ</option>
                                        {brands.map(b => (
                                            <option key={b} value={b}>{b}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">รุ่น *</label>
                                    <input
                                        type="text"
                                        placeholder="เช่น Civic, CBR150R"
                                        className="form-input"
                                        value={formData.model}
                                        onChange={(e) => updateFormData({ model: e.target.value })}
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">รุ่นย่อย (ถ้ามี)</label>
                                    <input
                                        type="text"
                                        placeholder="เช่น 1.5 Turbo RS, ABS Edition"
                                        className="form-input"
                                        value={formData.subModel}
                                        onChange={(e) => updateFormData({ subModel: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">สี *</label>
                                    <select
                                        className="form-select"
                                        value={formData.color}
                                        onChange={(e) => updateFormData({ color: e.target.value })}
                                    >
                                        <option value="">เลือกสี</option>
                                        {COLORS.map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">เชื้อเพลิง *</label>
                                    <select
                                        className="form-select"
                                        value={formData.fuelType}
                                        onChange={(e) => updateFormData({ fuelType: e.target.value as FormData['fuelType'] })}
                                    >
                                        <option value="PETROL">เบนซิน</option>
                                        <option value="DIESEL">ดีเซล</option>
                                        <option value="HYBRID">ไฮบริด</option>
                                        <option value="PLUGIN_HYBRID">ปลั๊กอินไฮบริด</option>
                                        <option value="ELECTRIC">ไฟฟ้า</option>
                                        <option value="LPG">LPG</option>
                                        <option value="NGV">NGV</option>
                                    </select>
                                </div>
                            </div>

                            {/* Transmission */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">ระบบเกียร์</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => updateFormData({ transmission: 'AUTOMATIC' })}
                                        className={`form-button ${formData.transmission === 'AUTOMATIC' ? 'form-button-active' : 'form-button-inactive'}`}
                                    >
                                        <GearFine size={20} /> อัตโนมัติ
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => updateFormData({ transmission: 'MANUAL' })}
                                        className={`form-button ${formData.transmission === 'MANUAL' ? 'form-button-active' : 'form-button-inactive'}`}
                                    >
                                        <GitCommit size={20} /> ธรรมดา
                                    </button>
                                </div>
                            </div>

                            {/* Mileage */}
                            <div className="mb-8">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">เลขไมล์ (กม.) *</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={formData.mileage ? formData.mileage.toLocaleString('en-US') : ''}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/,/g, '');
                                            updateFormData({ mileage: parseInt(value) || 0 });
                                        }}
                                        placeholder="เช่น 45,000"
                                        className="form-input-icon font-medium"
                                    />
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                        <Gauge size={20} />
                                    </div>
                                </div>
                            </div>

                            {/* Condition Section */}
                            <h3 className="text-lg font-bold text-primary mb-4">สภาพรถ</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                                {[
                                    { value: 'EXCELLENT', label: 'ดีเยี่ยม' },
                                    { value: 'GOOD', label: 'ดี' },
                                    { value: 'FAIR', label: 'พอใช้' },
                                    { value: 'POOR', label: 'ต้องซ่อม' }
                                ].map(cond => (
                                    <button
                                        key={cond.value}
                                        type="button"
                                        onClick={() => updateFormData({ condition: cond.value as FormData['condition'] })}
                                        className={`form-button ${formData.condition === cond.value ? 'form-button-active' : 'form-button-inactive'}`}
                                    >
                                        {cond.label}
                                    </button>
                                ))}
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <label className="form-checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={formData.hasAccident}
                                        onChange={(e) => updateFormData({ hasAccident: e.target.checked })}
                                        className="w-5 h-5 rounded accent-primary"
                                    />
                                    <span className="text-sm font-medium text-gray-700">เคยมีอุบัติเหตุ</span>
                                </label>
                                <label className="form-checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={formData.hasModified}
                                        onChange={(e) => updateFormData({ hasModified: e.target.checked })}
                                        className="w-5 h-5 rounded accent-primary"
                                    />
                                    <span className="text-sm font-medium text-gray-700">มีการโมดิฟาย</span>
                                </label>
                                <label className="form-checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={formData.hasWarranty}
                                        onChange={(e) => updateFormData({ hasWarranty: e.target.checked })}
                                        className="w-5 h-5 rounded accent-primary"
                                    />
                                    <span className="text-sm font-medium text-gray-700">มีประกันเหลือ</span>
                                </label>
                                <div>
                                    <select
                                        className="form-select text-sm"
                                        value={formData.ownerCount}
                                        onChange={(e) => updateFormData({ ownerCount: parseInt(e.target.value) })}
                                    >
                                        <option value={1}>มือ 1 (เจ้าของคนแรก)</option>
                                        <option value={2}>มือ 2</option>
                                        <option value={3}>มือ 3</option>
                                        <option value={4}>มือ 4 ขึ้นไป</option>
                                    </select>
                                </div>
                            </div>

                            {/* Price Section */}
                            <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                                <CurrencyDollar size={24} weight="fill" className="text-accent" /> ราคาและข้อมูลติดต่อ
                            </h3>

                            {/* Title & Description */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">หัวข้อประกาศ</label>
                                <input
                                    type="text"
                                    placeholder={`${formData.brand} ${formData.model} ${formData.year} สภาพดี`}
                                    className="form-input"
                                    value={formData.title}
                                    onChange={(e) => updateFormData({ title: e.target.value })}
                                />
                                <p className="text-xs text-gray-400 mt-1">หากไม่กรอก ระบบจะใช้ "{formData.brand} {formData.model} {formData.year}"</p>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">รายละเอียดเพิ่มเติม</label>
                                <textarea
                                    rows={4}
                                    placeholder="ใส่รายละเอียดเกี่ยวกับรถของคุณ เช่น สภาพ ข้อดี ประวัติการดูแลรักษา..."
                                    className="w-full p-4 border border-gray-200 rounded-xl bg-gray-50 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition resize-none"
                                    value={formData.description}
                                    onChange={(e) => updateFormData({ description: e.target.value })}
                                />
                            </div>

                            {/* Price */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">ราคา (บาท) *</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            placeholder="เช่น 650,000"
                                            className="form-input-icon font-bold text-lg"
                                            value={formData.price ? formData.price.toLocaleString('en-US') : ''}
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/,/g, '');
                                                const numValue = parseInt(value) || 0;
                                                updateFormData({ price: numValue });
                                            }}
                                        />
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">฿</div>
                                    </div>
                                </div>

                                <div className="flex items-end">
                                    <label className="form-checkbox-label w-full">
                                        <input
                                            type="checkbox"
                                            checked={formData.negotiable}
                                            onChange={(e) => updateFormData({ negotiable: e.target.checked })}
                                            className="w-5 h-5 rounded accent-primary"
                                        />
                                        <span className="font-medium text-gray-700">ต่อรองราคาได้</span>
                                    </label>
                                </div>
                            </div>

                            {/* Location */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">จังหวัด *</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={20} />
                                        <select
                                            className="form-select-icon"
                                            value={formData.province}
                                            onChange={(e) => updateFormData({ province: e.target.value })}
                                        >
                                            <option value="">เลือกจังหวัด</option>
                                            {PROVINCES.map(p => (
                                                <option key={p} value={p}>{p}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">เขต/อำเภอ</label>
                                    <input
                                        type="text"
                                        placeholder="เช่น จตุจักร, เมือง"
                                        className="form-input"
                                        value={formData.district}
                                        onChange={(e) => updateFormData({ district: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Bottom Actions */}
                            <div className="border-t border-gray-100 pt-6 flex justify-end gap-4">
                                <Link
                                    href="/profile/listings"
                                    className="px-6 py-3 border-2 border-gray-200 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition"
                                >
                                    ยกเลิก
                                </Link>
                                <button
                                    onClick={handleSubmit}
                                    disabled={saving}
                                    className="bg-primary text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-900/10 hover:bg-opacity-90 transition flex items-center gap-2 disabled:opacity-50"
                                >
                                    {saving ? (
                                        <>
                                            <CircleNotch size={20} className="animate-spin" />
                                            กำลังบันทึก...
                                        </>
                                    ) : (
                                        <>
                                            <FloppyDisk size={20} weight="bold" />
                                            บันทึกการเปลี่ยนแปลง
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Preview Card Sidebar */}
                    <div className="hidden lg:block">
                        <div className="sticky top-24 space-y-6">
                            {/* Preview Card Header */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="bg-gradient-to-r from-primary to-blue-600 text-white px-4 py-3 flex items-center gap-2">
                                    <ImageIcon size={18} weight="fill" />
                                    <span className="font-bold text-sm">ตัวอย่างประกาศ</span>
                                </div>
                            </div>

                            {/* Preview Card */}
                            <PreviewCard
                                title={formData.title || (formData.brand && formData.model ? `${formData.brand} ${formData.model}` : undefined)}
                                price={formData.price}
                                negotiable={formData.negotiable}
                                vehicleType={formData.vehicleType}
                                year={formData.year || new Date().getFullYear()}
                                mileage={formData.mileage}
                                fuelType={formData.fuelType}
                                province={formData.province}
                                imageUrl={listing?.images[0]?.url}
                                sellerName={listing?.user?.fullName || 'ผู้ขาย'}
                            />

                            {/* Tips */}
                            <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100">
                                <h3 className="font-bold text-primary mb-3 flex items-center gap-2 text-sm">
                                    <Lightbulb weight="fill" className="text-yellow-500" size={18} /> Tips ขายไว
                                </h3>
                                <ul className="space-y-3 text-xs text-gray-600">
                                    <li className="flex gap-2 items-start">
                                        <CheckCircle weight="fill" className="text-green-500 mt-0.5 min-w-[14px]" size={14} />
                                        <span className="leading-snug">ระบุเลขไมล์ตามจริง</span>
                                    </li>
                                    <li className="flex gap-2 items-start">
                                        <CheckCircle weight="fill" className="text-green-500 mt-0.5 min-w-[14px]" size={14} />
                                        <span className="leading-snug">อัพโหลดรูปภาพคุณภาพดี</span>
                                    </li>
                                    <li className="flex gap-2 items-start">
                                        <CheckCircle weight="fill" className="text-green-500 mt-0.5 min-w-[14px]" size={14} />
                                        <span className="leading-snug">ตั้งราคาที่เหมาะสม</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
