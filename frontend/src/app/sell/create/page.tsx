"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    CarProfile,
    GearFine,
    GitCommit,
    Gauge,
    Robot,
    MagicWand,
    ArrowRight,
    Lightbulb,
    CheckCircle,
    Image as ImageIcon,
    Plus,
    X,
    CurrencyCircleDollar,
    MapPin,
    CircleNotch,
    Check,
    Motorcycle,
    Car,
    Drop,
    Palette,
    FileText,
    WarningCircle
} from '@phosphor-icons/react';
import PreviewCard from '@/components/PreviewCard';
import { useListingForm, createListing, uploadListingImages, publishListing } from '@/contexts/ListingContext';

// Thai provinces list
const PROVINCES = [
    'กรุงเทพมหานคร', 'กระบี่', 'กาญจนบุรี', 'กาฬสินธุ์', 'กำแพงเพชร',
    'ขอนแก่น', 'จันทบุรี', 'ฉะเชิงเทรา', 'ชลบุรี', 'ชัยนาท',
    'ชัยภูมิ', 'ชุมพร', 'เชียงราย', 'เชียงใหม่', 'ตรัง',
    'ตราด', 'ตาก', 'นครนายก', 'นครปฐม', 'นครพนม',
    'นครราชสีมา', 'นครศรีธรรมราช', 'นครสวรรค์', 'นนทบุรี', 'นราธิวาส',
    'น่าน', 'บึงกาฬ', 'บุรีรัมย์', 'ปทุมธานี', 'ประจวบคีรีขันธ์',
    'ปราจีนบุรี', 'ปัตตานี', 'พระนครศรีอยุธยา', 'พังงา', 'พัทลุง',
    'พิจิตร', 'พิษณุโลก', 'เพชรบุรี', 'เพชรบูรณ์', 'แพร่',
    'พะเยา', 'ภูเก็ต', 'มหาสารคาม', 'มุกดาหาร', 'แม่ฮ่องสอน',
    'ยะลา', 'ยโสธร', 'ร้อยเอ็ด', 'ระนอง', 'ระยอง',
    'ราชบุรี', 'ลพบุรี', 'ลำปาง', 'ลำพูน', 'เลย',
    'ศรีสะเกษ', 'สกลนคร', 'สงขลา', 'สตูล', 'สมุทรปราการ',
    'สมุทรสงคราม', 'สมุทรสาคร', 'สระแก้ว', 'สระบุรี', 'สิงห์บุรี',
    'สุโขทัย', 'สุพรรณบุรี', 'สุราษฎร์ธานี', 'สุรินทร์', 'หนองคาย',
    'หนองบัวลำภู', 'อ่างทอง', 'อุดรธานี', 'อุทัยธานี', 'อุตรดิตถ์',
    'อุบลราชธานี', 'อำนาจเจริญ'
];

// Car brands
const CAR_BRANDS = ['Toyota', 'Honda', 'Mazda', 'Nissan', 'Mitsubishi', 'Isuzu', 'Ford', 'Chevrolet', 'BMW', 'Mercedes-Benz', 'Audi', 'Lexus', 'Subaru', 'Suzuki', 'Hyundai', 'Kia', 'MG', 'Volvo', 'Porsche', 'Ferrari'];
const MOTORCYCLE_BRANDS = ['Honda', 'Yamaha', 'Kawasaki', 'Suzuki', 'Ducati', 'BMW', 'Harley-Davidson', 'KTM', 'Vespa', 'Royal Enfield', 'Triumph', 'Aprilia', 'GPX', 'Benelli'];

const COLORS = ['ขาว', 'ดำ', 'เงิน', 'เทา', 'แดง', 'น้ำเงิน', 'เขียว', 'ส้ม', 'น้ำตาล', 'ทอง', 'ชมพู', 'ม่วง', 'เหลือง', 'ฟ้า'];

export default function CreateListingPage() {
    const router = useRouter();
    const { formData, updateFormData, currentStep, setCurrentStep, listingId, setListingId, isSubmitting, setIsSubmitting } = useListingForm();
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<{ id: string; fullName?: string } | null>(null);

    // Check if user is logged in
    useEffect(() => {
        const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
        if (!storedUser) {
            router.push('/');
            return;
        }
        setUser(JSON.parse(storedUser));
    }, [router]);

    // Generate years (current year - 30 years)
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 31 }, (_, i) => currentYear - i);

    // Get brands based on vehicle type
    const brands = formData.vehicleType === 'CAR' ? CAR_BRANDS : MOTORCYCLE_BRANDS;

    // Handle image upload
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const newFiles = Array.from(files);
        const newPreviews = newFiles.map(file => URL.createObjectURL(file));

        updateFormData({
            images: [...formData.images, ...newFiles],
            imagesPreviews: [...formData.imagesPreviews, ...newPreviews]
        });
    };

    const removeImage = (index: number) => {
        const newImages = [...formData.images];
        const newPreviews = [...formData.imagesPreviews];

        // Revoke object URL to prevent memory leaks
        URL.revokeObjectURL(newPreviews[index]);

        newImages.splice(index, 1);
        newPreviews.splice(index, 1);

        updateFormData({
            images: newImages,
            imagesPreviews: newPreviews
        });
    };

    // Handle step navigation
    const goToNextStep = async () => {
        setError(null);

        if (currentStep === 1) {
            // Validate step 1
            if (!formData.brand || !formData.model || !formData.color || !formData.mileage) {
                setError('กรุณากรอกข้อมูลให้ครบถ้วน');
                return;
            }
            setCurrentStep(2);
        } else if (currentStep === 2) {
            // Validate step 2 - images
            if (formData.images.length === 0) {
                setError('กรุณาอัพโหลดรูปภาพอย่างน้อย 1 รูป');
                return;
            }
            setCurrentStep(3);
        }
    };

    const goToPrevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    // Handle form submission
    const handleSubmit = async () => {
        if (!user) {
            setError('กรุณาเข้าสู่ระบบ');
            return;
        }

        if (!formData.price || formData.price <= 0) {
            setError('กรุณาระบุราคา');
            return;
        }

        if (!formData.province) {
            setError('กรุณาเลือกจังหวัด');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            // Step 1: Create listing
            const title = formData.title || `${formData.brand} ${formData.model} ${formData.year}`;
            const listingResponse = await createListing(user.id, { ...formData, title });
            const newListingId = listingResponse.listing.id;
            setListingId(newListingId);

            // Step 2: Upload images
            if (formData.images.length > 0) {
                await uploadListingImages(user.id, newListingId, formData.images);
            }

            // Step 3: Publish
            await publishListing(user.id, newListingId, formData.price, formData.negotiable);

            // Success - redirect to listing page
            router.push(`/profile/listings`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Progress bar width
    const progressWidth = `${(currentStep / 3) * 100}%`;

    return (
        <div className="bg-surface min-h-screen text-gray-800 pb-12">
            {/* Top Navigation */}
            <div className="bg-white border-b border-gray-200 py-4 mb-8">
                <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
                    <Link href="/profile/listings" className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition">
                        <ArrowLeft size={24} className="text-gray-500" />
                        <span className="font-bold text-xl text-primary">ลงขายรถ</span>
                    </Link>
                    <div className="text-sm text-gray-500 hidden sm:block">
                        ขั้นตอนที่ {currentStep} จาก 3
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4">
                {/* Progress Bar */}
                <div className="mb-12 max-w-2xl mx-auto md:max-w-full">
                    <div className="flex items-start justify-between">
                        {[
                            { num: 1, label: 'ข้อมูลรถ' },
                            { num: 2, label: 'รูปภาพ' },
                            { num: 3, label: 'ราคา & ติดต่อ' }
                        ].map((step, index) => (
                            <React.Fragment key={step.num}>
                                {/* Step Circle */}
                                <div className="flex flex-col items-center gap-2 relative z-10">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold shadow-sm transition-all duration-300 ${currentStep > step.num
                                        ? 'bg-primary text-white shadow-lg shadow-blue-200'
                                        : currentStep === step.num
                                            ? 'bg-primary text-white shadow-lg shadow-blue-200 ring-4 ring-blue-100'
                                            : 'bg-white border-2 border-gray-300 text-gray-400'
                                        }`}>
                                        {currentStep > step.num ? <Check weight="bold" size={20} /> : step.num}
                                    </div>
                                    <span className={`text-xs font-bold transition-colors ${currentStep >= step.num ? 'text-primary' : 'text-gray-400'
                                        }`}>
                                        {step.label}
                                    </span>
                                </div>

                                {/* Connecting Line (except after last step) */}
                                {index < 2 && (
                                    <div className="flex-1 mx-3 relative" style={{ marginTop: '22px' }}>
                                        {/* Background Line */}
                                        <div className="h-1 bg-gray-200 rounded-full"></div>
                                        {/* Active Line */}
                                        <div
                                            className={`absolute top-0 left-0 h-1 rounded-full transition-all duration-500 ease-out ${currentStep > step.num ? 'bg-primary' : 'bg-gray-200'
                                                }`}
                                            style={{
                                                width: currentStep > step.num ? '100%' : '0%'
                                            }}
                                        ></div>
                                    </div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
                        <WarningCircle weight="bold" className="text-xl flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2">
                        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">

                            {/* Step 1: Vehicle Info */}
                            {currentStep === 1 && (
                                <>
                                    <h2 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
                                        <CarProfile size={24} weight="fill" className="text-accent" /> ระบุข้อมูลรถของคุณ
                                    </h2>

                                    {/* Vehicle Type Toggle */}
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
                                                onChange={(e) => updateFormData({ fuelType: e.target.value as typeof formData.fuelType })}
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
                                                onClick={() => updateFormData({ condition: cond.value as typeof formData.condition })}
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
                                </>
                            )}

                            {/* Step 2: Images */}
                            {currentStep === 2 && (
                                <>
                                    <h2 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
                                        <ImageIcon size={24} weight="fill" className="text-accent" /> อัพโหลดรูปภาพ
                                    </h2>

                                    <p className="text-gray-500 mb-6">
                                        อัพโหลดรูปภาพรถของคุณ (อย่างน้อย 1 รูป, สูงสุด 20 รูป) รูปแรกจะเป็นรูปหลักในการแสดงผล
                                    </p>

                                    {/* Image Upload Area */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                        {formData.imagesPreviews.map((preview, index) => (
                                            <div key={index} className="relative aspect-[4/3] rounded-xl overflow-hidden border-2 border-gray-200 group">
                                                <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                                                {index === 0 && (
                                                    <span className="absolute top-2 left-2 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded">
                                                        รูปหลัก
                                                    </span>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(index)}
                                                    className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                                                >
                                                    <X weight="bold" size={14} />
                                                </button>
                                            </div>
                                        ))}

                                        {formData.images.length < 20 && (
                                            <label className="aspect-[4/3] rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-blue-50 transition">
                                                <Plus size={32} className="text-gray-400 mb-2" />
                                                <span className="text-xs text-gray-500">เพิ่มรูป</span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    multiple
                                                    className="hidden"
                                                    onChange={handleImageUpload}
                                                />
                                            </label>
                                        )}
                                    </div>

                                    <div className="bg-blue-50 p-4 rounded-xl mb-8">
                                        <h4 className="font-bold text-primary mb-2 flex items-center gap-2">
                                            <Lightbulb weight="fill" className="text-yellow-500" /> เคล็ดลับถ่ายรูปให้ขายได้เร็ว
                                        </h4>
                                        <ul className="text-sm text-gray-600 space-y-1">
                                            <li>• ถ่ายรูปด้านหน้า, หลัง, ข้างซ้าย, ข้างขวา</li>
                                            <li>• ถ่ายภายในรถ, แผงหน้าปัด, เบาะ</li>
                                            <li>• ถ่ายเลขไมล์บนหน้าปัด</li>
                                            <li>• ใช้แสงธรรมชาติให้เพียงพอ</li>
                                        </ul>
                                    </div>
                                </>
                            )}

                            {/* Step 3: Price & Contact */}
                            {currentStep === 3 && (
                                <>
                                    <h2 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
                                        <CurrencyCircleDollar size={24} weight="fill" className="text-accent" /> ราคาและข้อมูลติดต่อ
                                    </h2>

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
                                            placeholder="อธิบายสภาพรถ, ประวัติการซ่อมบำรุง, อุปกรณ์เพิ่มเติม..."
                                            className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition resize-none"
                                            value={formData.description}
                                            onChange={(e) => updateFormData({ description: e.target.value })}
                                        />
                                    </div>

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

                                    {/* Summary */}
                                    <div className="bg-gray-50 p-4 rounded-xl mb-8">
                                        <h4 className="font-bold text-gray-800 mb-3">สรุปข้อมูลรถ</h4>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div className="text-gray-500">ยี่ห้อ/รุ่น:</div>
                                            <div className="font-medium">{formData.brand} {formData.model}</div>
                                            <div className="text-gray-500">ปี:</div>
                                            <div className="font-medium">{formData.year}</div>
                                            <div className="text-gray-500">ไมล์:</div>
                                            <div className="font-medium">{formData.mileage?.toLocaleString()} กม.</div>
                                            <div className="text-gray-500">รูปภาพ:</div>
                                            <div className="font-medium">{formData.images.length} รูป</div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Navigation Buttons */}
                            <div className="flex justify-between pt-4 border-t border-gray-100">
                                {currentStep > 1 ? (
                                    <button
                                        type="button"
                                        onClick={goToPrevStep}
                                        className="px-6 py-3 border border-gray-300 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition flex items-center gap-2"
                                    >
                                        <ArrowLeft weight="bold" /> ย้อนกลับ
                                    </button>
                                ) : (
                                    <div></div>
                                )}

                                {currentStep < 3 ? (
                                    <button
                                        type="button"
                                        onClick={goToNextStep}
                                        className="bg-accent text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-orange-100 hover:bg-orange-600 transition flex items-center gap-2 group transform active:scale-[0.98]"
                                    >
                                        ไปต่อ <ArrowRight weight="bold" className="group-hover:translate-x-1 transition" />
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleSubmit}
                                        disabled={isSubmitting}
                                        className="bg-primary text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-900/20 hover:bg-opacity-90 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <CircleNotch weight="bold" className="animate-spin" />
                                                กำลังลงประกาศ...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle weight="bold" />
                                                ลงประกาศ
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>

                        </div>
                    </div>

                    {/* Preview Card Sidebar */}
                    <div className="hidden md:block">
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
                                imageUrl={formData.imagesPreviews[0]}
                                sellerName={user?.fullName || 'ผู้ขาย'}
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
