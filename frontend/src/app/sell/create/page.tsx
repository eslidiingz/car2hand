"use client";

import React, { useState, useEffect, useRef } from 'react';
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
import SearchableSelect, { SelectOption } from '@/components/SearchableSelect';
import { useListingForm, createListing, uploadListingImages, uploadServiceHistoryImage, publishListing } from '@/contexts/ListingContext';

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

const COLORS = ['ขาว', 'ดำ', 'เงิน', 'เทา', 'แดง', 'น้ำเงิน', 'เขียว', 'ส้ม', 'น้ำตาล', 'ทอง', 'ชมพู', 'ม่วง', 'เหลือง', 'ฟ้า'];

// Types for master data
interface Brand {
    id: string;
    name: string;
    nameTh: string | null;
    logo?: string | null;
    isPopular: boolean;
    modelCount: number;
}

interface VehicleModel {
    id: string;
    name: string;
    nameTh: string | null;
    bodyType: string | null;
    isPopular: boolean;
    subModelCount: number;
}

interface SubModel {
    id: string;
    name: string;
    engineSize: number | null;
    fuelType: string | null;
    transmission: string | null;
}

export default function CreateListingPage() {
    const router = useRouter();
    const { formData, updateFormData, currentStep, setCurrentStep, listingId, setListingId, isSubmitting, setIsSubmitting } = useListingForm();
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});
    const [user, setUser] = useState<{ id: string; fullName?: string } | null>(null);

    // Refs for scroll-to-error
    const brandRef = useRef<HTMLDivElement>(null);
    const modelRef = useRef<HTMLDivElement>(null);
    const colorRef = useRef<HTMLDivElement>(null);
    const mileageRef = useRef<HTMLDivElement>(null);
    const imagesRef = useRef<HTMLDivElement>(null);
    const priceRef = useRef<HTMLDivElement>(null);
    const provinceRef = useRef<HTMLDivElement>(null);

    // Master data states
    const [brands, setBrands] = useState<Brand[]>([]);
    const [models, setModels] = useState<VehicleModel[]>([]);
    const [subModels, setSubModels] = useState<SubModel[]>([]);
    const [loadingBrands, setLoadingBrands] = useState(false);
    const [loadingModels, setLoadingModels] = useState(false);
    const [loadingSubModels, setLoadingSubModels] = useState(false);
    const [selectedBrandId, setSelectedBrandId] = useState<string>('');
    const [selectedModelId, setSelectedModelId] = useState<string>('');

    // Check if user is logged in
    useEffect(() => {
        const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
        if (!storedUser) {
            router.push('/');
            return;
        }
        const userData = JSON.parse(storedUser);
        setUser(userData);

        // Pre-fill contact info from user data
        if (!formData.contactName && userData.fullName) {
            updateFormData({ contactName: userData.fullName });
        }
        if (!formData.contactPhone && userData.phoneNumber) {
            updateFormData({ contactPhone: userData.phoneNumber });
        }
    }, [router]);

    // Fetch brands when vehicle type changes
    useEffect(() => {
        const fetchBrands = async () => {
            setLoadingBrands(true);
            try {
                const response = await fetch(`http://localhost:8000/master-data/brands?vehicleType=${formData.vehicleType}`);
                const data = await response.json();
                if (data.success) {
                    setBrands(data.brands);
                }
            } catch (err) {
                console.error('Error fetching brands:', err);
            } finally {
                setLoadingBrands(false);
            }
        };
        fetchBrands();
        // Reset selections when vehicle type changes
        setSelectedBrandId('');
        setSelectedModelId('');
        setModels([]);
        setSubModels([]);
    }, [formData.vehicleType]);

    // Fetch models when brand changes
    useEffect(() => {
        if (!selectedBrandId) {
            setModels([]);
            return;
        }

        const fetchModels = async () => {
            setLoadingModels(true);
            try {
                const response = await fetch(`http://localhost:8000/master-data/brands/${selectedBrandId}/models`);
                const data = await response.json();
                if (data.success) {
                    setModels(data.models);
                }
            } catch (err) {
                console.error('Error fetching models:', err);
            } finally {
                setLoadingModels(false);
            }
        };
        fetchModels();
        // Reset model selection
        setSelectedModelId('');
        setSubModels([]);
    }, [selectedBrandId]);

    // Fetch sub-models when model changes
    useEffect(() => {
        if (!selectedModelId) {
            setSubModels([]);
            return;
        }

        const fetchSubModels = async () => {
            setLoadingSubModels(true);
            try {
                const response = await fetch(`http://localhost:8000/master-data/models/${selectedModelId}/sub-models`);
                const data = await response.json();
                if (data.success) {
                    setSubModels(data.subModels);
                }
            } catch (err) {
                console.error('Error fetching sub-models:', err);
            } finally {
                setLoadingSubModels(false);
            }
        };
        fetchSubModels();
    }, [selectedModelId]);

    // Generate years (current year - 30 years)
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 31 }, (_, i) => currentYear - i);

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
        setFieldErrors({});

        if (currentStep === 1) {
            // Validate step 1
            const errors: Record<string, boolean> = {};
            const missingFields: string[] = [];

            if (!formData.brand) {
                errors.brand = true;
                missingFields.push('ยี่ห้อ');
            }
            if (!formData.model) {
                errors.model = true;
                missingFields.push('รุ่น');
            }
            if (!formData.color) {
                errors.color = true;
                missingFields.push('สี');
            }
            if (!formData.mileage) {
                errors.mileage = true;
                missingFields.push('เลขไมล์');
            }

            if (Object.keys(errors).length > 0) {
                setFieldErrors(errors);
                setError(`กรุณากรอกข้อมูลให้ครบ: ${missingFields.join(', ')}`);

                // Scroll to first error field
                const firstErrorRef = errors.brand ? brandRef
                    : errors.model ? modelRef
                        : errors.color ? colorRef
                            : errors.mileage ? mileageRef
                                : null;

                if (firstErrorRef?.current) {
                    firstErrorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                return;
            }
            setCurrentStep(2);
        } else if (currentStep === 2) {
            // Validate step 2 - images
            if (formData.images.length === 0) {
                setFieldErrors({ images: true });
                setError('กรุณาอัพโหลดรูปภาพอย่างน้อย 1 รูป');

                // Scroll to images section
                if (imagesRef?.current) {
                    imagesRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
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
        setFieldErrors({});

        if (!user) {
            setError('กรุณาเข้าสู่ระบบ');
            return;
        }

        const errors: Record<string, boolean> = {};
        const missingFields: string[] = [];

        if (!formData.price || formData.price <= 0) {
            errors.price = true;
            missingFields.push('ราคา');
        }

        if (!formData.province) {
            errors.province = true;
            missingFields.push('จังหวัด');
        }

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            setError(`กรุณากรอกข้อมูลให้ครบ: ${missingFields.join(', ')}`);

            // Scroll to first error field
            const firstErrorRef = errors.price ? priceRef
                : errors.province ? provinceRef
                    : null;

            if (firstErrorRef?.current) {
                firstErrorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
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

            // Step 2.5: Upload service history image (if any)
            if (formData.serviceHistoryFile) {
                await uploadServiceHistoryImage(user.id, newListingId, formData.serviceHistoryFile);
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
                                        <div ref={brandRef}>
                                            <label className={`block text-sm font-medium mb-1.5 ${fieldErrors.brand ? 'text-red-600' : 'text-gray-700'}`}>ยี่ห้อ *</label>
                                            <div className={fieldErrors.brand ? 'ring-2 ring-red-500 rounded-xl' : ''}>
                                                <SearchableSelect
                                                    options={brands.map(b => ({
                                                        id: b.id,
                                                        label: b.name,
                                                        subLabel: b.nameTh || undefined,
                                                        image: b.logo || undefined,
                                                        isPopular: b.isPopular
                                                    }))}
                                                    value={selectedBrandId}
                                                    onChange={(id, option) => {
                                                        setSelectedBrandId(id);
                                                        setFieldErrors(prev => ({ ...prev, brand: false }));
                                                        updateFormData({ brand: option?.label || '', model: '', subModel: '' });
                                                    }}
                                                    placeholder="เลือกยี่ห้อ"
                                                    searchPlaceholder="พิมพ์ชื่อยี่ห้อ..."
                                                    loading={loadingBrands}
                                                    emptyMessage="ไม่พบยี่ห้อที่ค้นหา"
                                                />
                                            </div>
                                            {fieldErrors.brand && <p className="text-red-500 text-xs mt-1">กรุณาเลือกยี่ห้อ</p>}
                                        </div>

                                        <div ref={modelRef}>
                                            <label className={`block text-sm font-medium mb-1.5 ${fieldErrors.model ? 'text-red-600' : 'text-gray-700'}`}>รุ่น *</label>
                                            <div className={fieldErrors.model ? 'ring-2 ring-red-500 rounded-xl' : ''}>
                                                {models.length > 0 || loadingModels ? (
                                                    <SearchableSelect
                                                        options={models.map(m => ({
                                                            id: m.id,
                                                            label: m.name,
                                                            subLabel: m.bodyType || undefined,
                                                            isPopular: m.isPopular
                                                        }))}
                                                        value={selectedModelId}
                                                        onChange={(id, option) => {
                                                            setSelectedModelId(id);
                                                            setFieldErrors(prev => ({ ...prev, model: false }));
                                                            const model = models.find(m => m.id === id);
                                                            updateFormData({
                                                                model: option?.label || '',
                                                                subModel: '',
                                                                bodyType: model?.bodyType || formData.bodyType
                                                            });
                                                        }}
                                                        placeholder={!selectedBrandId ? "เลือกยี่ห้อก่อน" : "เลือกรุ่น"}
                                                        searchPlaceholder="พิมพ์ชื่อรุ่น..."
                                                        loading={loadingModels}
                                                        disabled={!selectedBrandId}
                                                        emptyMessage="ไม่พบรุ่นที่ค้นหา"
                                                    />
                                                ) : (
                                                    <input
                                                        type="text"
                                                        placeholder={!selectedBrandId ? 'เลือกยี่ห้อก่อน' : 'พิมพ์ชื่อรุ่น'}
                                                        className={`form-input ${fieldErrors.model ? 'border-red-500' : ''}`}
                                                        value={formData.model}
                                                        onChange={(e) => {
                                                            setFieldErrors(prev => ({ ...prev, model: false }));
                                                            updateFormData({ model: e.target.value });
                                                        }}
                                                        disabled={!selectedBrandId && !formData.brand}
                                                    />
                                                )}
                                            </div>
                                            {fieldErrors.model && <p className="text-red-500 text-xs mt-1">กรุณาเลือกรุ่น</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">ปีที่จดทะเบียน *</label>
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
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">รุ่นย่อย (ถ้ามี)</label>
                                            {subModels.length > 0 || loadingSubModels ? (
                                                <SearchableSelect
                                                    options={subModels.map(s => ({
                                                        id: s.id,
                                                        label: s.name,
                                                        subLabel: s.engineSize ? `${s.engineSize}cc` : undefined
                                                    }))}
                                                    value={subModels.find(s => s.name === formData.subModel)?.id || ''}
                                                    onChange={(id, option) => {
                                                        const subModel = subModels.find(s => s.id === id);
                                                        updateFormData({
                                                            subModel: option?.label || '',
                                                            ...(subModel?.engineSize && { engineSize: subModel.engineSize }),
                                                            ...(subModel?.fuelType && { fuelType: subModel.fuelType as 'PETROL' | 'DIESEL' | 'HYBRID' | 'PLUGIN_HYBRID' | 'EV' | 'LPG' | 'NGV' }),
                                                            ...(subModel?.transmission && { transmission: subModel.transmission as 'AUTOMATIC' | 'MANUAL' | 'CVT' | 'DCT' | 'SEMI_AUTO' })
                                                        });
                                                    }}
                                                    placeholder="เลือกรุ่นย่อย (ไม่บังคับ)"
                                                    searchPlaceholder="พิมพ์ชื่อรุ่นย่อย..."
                                                    loading={loadingSubModels}
                                                    disabled={!selectedModelId}
                                                    emptyMessage="ไม่พบรุ่นย่อย"
                                                />
                                            ) : (
                                                <input
                                                    type="text"
                                                    placeholder="เช่น 1.5 Turbo RS, ABS Edition"
                                                    className="form-input"
                                                    value={formData.subModel}
                                                    onChange={(e) => updateFormData({ subModel: e.target.value })}
                                                />
                                            )}
                                        </div>

                                        <div ref={colorRef}>
                                            <label className={`block text-sm font-medium mb-1.5 ${fieldErrors.color ? 'text-red-600' : 'text-gray-700'}`}>สี *</label>
                                            <select
                                                className={`form-select ${fieldErrors.color ? 'border-red-500 ring-2 ring-red-500' : ''}`}
                                                value={formData.color}
                                                onChange={(e) => {
                                                    setFieldErrors(prev => ({ ...prev, color: false }));
                                                    updateFormData({ color: e.target.value });
                                                }}
                                            >
                                                <option value="">เลือกสี</option>
                                                {COLORS.map(c => (
                                                    <option key={c} value={c}>{c}</option>
                                                ))}
                                            </select>
                                            {fieldErrors.color && <p className="text-red-500 text-xs mt-1">กรุณาเลือกสี</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">เชื้อเพลิง *</label>
                                            <select
                                                className="form-select"
                                                value={formData.fuelType}
                                                onChange={(e) => updateFormData({ fuelType: e.target.value as typeof formData.fuelType })}
                                            >
                                                <option value="PETROL">Petrol (เบนซิน)</option>
                                                <option value="DIESEL">Diesel (ดีเซล)</option>
                                                <option value="HYBRID">Hybrid (ไฮบริด)</option>
                                                <option value="PLUGIN_HYBRID">Plug-in Hybrid (ปลั๊กอินไฮบริด)</option>
                                                <option value="EV">EV (ไฟฟ้า)</option>
                                                <option value="LPG">LPG (แก๊ส)</option>
                                                <option value="NGV">NGV (แก๊ส)</option>
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

                                    <div className="mb-8" ref={mileageRef}>
                                        <label className={`block text-sm font-medium mb-1.5 ${fieldErrors.mileage ? 'text-red-600' : 'text-gray-700'}`}>เลขไมล์ (กม.) *</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                value={formData.mileage ? formData.mileage.toLocaleString('en-US') : ''}
                                                onChange={(e) => {
                                                    setFieldErrors(prev => ({ ...prev, mileage: false }));
                                                    const value = e.target.value.replace(/,/g, '');
                                                    updateFormData({ mileage: parseInt(value) || 0 });
                                                }}
                                                placeholder="เช่น 45,000"
                                                className={`form-input-icon font-medium ${fieldErrors.mileage ? 'border-red-500 ring-2 ring-red-500' : ''}`}
                                            />
                                            <div className={`absolute left-3 top-1/2 -translate-y-1/2 ${fieldErrors.mileage ? 'text-red-500' : 'text-gray-400'}`}>
                                                <Gauge size={20} />
                                            </div>
                                        </div>
                                        {fieldErrors.mileage && <p className="text-red-500 text-xs mt-1">กรุณากรอกเลขไมล์</p>}
                                    </div>

                                    {/* Vehicle Extras */}
                                    <h3 className="text-lg font-bold text-primary mb-4 mt-8">ข้อมูลเพิ่มเติม (ช่วยให้ขายได้เร็วขึ้น)</h3>
                                    <p className="text-sm text-gray-500 mb-4">ข้อมูลเหล่านี้ช่วยให้ผู้ซื้อตัดสินใจได้ง่ายขึ้น</p>

                                    <div className="space-y-4">
                                        {/* Tax & Registration */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.taxPaid}
                                                    onChange={(e) => updateFormData({ taxPaid: e.target.checked })}
                                                    className="w-5 h-5 rounded accent-primary"
                                                />
                                                <div>
                                                    <p className="font-medium text-gray-800">พ.ร.บ. และภาษีครบ</p>
                                                    <p className="text-xs text-gray-500">ต่อทะเบียนล่าสุดแล้ว</p>
                                                </div>
                                            </label>

                                            <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.hasSpareKey}
                                                    onChange={(e) => updateFormData({ hasSpareKey: e.target.checked })}
                                                    className="w-5 h-5 rounded accent-primary"
                                                />
                                                <div>
                                                    <p className="font-medium text-gray-800">มีกุญแจสำรอง</p>
                                                    <p className="text-xs text-gray-500">กุญแจครบชุด</p>
                                                </div>
                                            </label>
                                        </div>

                                        {/* Registration Book Status */}
                                        <div className="p-4 bg-gray-50 rounded-xl">
                                            <p className="font-medium text-gray-800 mb-3">สถานะเล่มทะเบียน</p>
                                            <div className="flex flex-wrap gap-2">
                                                {[
                                                    { value: 'READY', label: 'พร้อมโอน', emoji: '✅' },
                                                    { value: 'FINANCED', label: 'ติดไฟแนนซ์', emoji: '🏦' }
                                                ].map(opt => (
                                                    <button
                                                        key={opt.value}
                                                        type="button"
                                                        onClick={() => updateFormData({ registrationBookStatus: opt.value as typeof formData.registrationBookStatus })}
                                                        className={`px-4 py-2 rounded-full text-sm font-medium transition ${formData.registrationBookStatus === opt.value
                                                            ? 'bg-primary text-white'
                                                            : 'bg-white border border-gray-200 text-gray-600 hover:border-primary'
                                                            }`}
                                                    >
                                                        {opt.emoji} {opt.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Gas Type - ย้ายมาอยู่ต่อจากสถานะเล่มทะเบียน */}
                                        <div className="p-4 bg-gray-50 rounded-xl">
                                            <p className="font-medium text-gray-800 mb-3">ติดแก๊ส</p>
                                            <div className="flex flex-wrap gap-2">
                                                {[
                                                    { value: 'NONE', label: 'ไม่ติดแก๊ส', emoji: '⛽' },
                                                    { value: 'LPG', label: 'LPG', emoji: '🟢' },
                                                    { value: 'NGV', label: 'NGV/CNG', emoji: '🔵' }
                                                ].map(opt => (
                                                    <button
                                                        key={opt.value}
                                                        type="button"
                                                        onClick={() => updateFormData({ gasType: opt.value as typeof formData.gasType })}
                                                        className={`px-4 py-2 rounded-full text-sm font-medium transition ${formData.gasType === opt.value
                                                            ? 'bg-primary text-white'
                                                            : 'bg-white border border-gray-200 text-gray-600 hover:border-primary'
                                                            }`}
                                                    >
                                                        {opt.emoji} {opt.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Insurance */}
                                        <div className="p-4 bg-gray-50 rounded-xl">
                                            <p className="font-medium text-gray-800 mb-2">ประกันรถ</p>
                                            <input
                                                type="text"
                                                className="w-full px-4 py-3 text-sm bg-white border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none transition"
                                                placeholder="เช่น ชั้น 1 หมดอายุ ธ.ค. 2568 (เว้นว่างถ้าไม่มี)"
                                                value={formData.insuranceDetails || ''}
                                                onChange={(e) => updateFormData({ insuranceDetails: e.target.value })}
                                            />
                                        </div>

                                        {/* Warranty */}
                                        <div className="p-4 bg-gray-50 rounded-xl">
                                            <p className="font-medium text-gray-800 mb-2">Warranty ศูนย์</p>
                                            <input
                                                type="text"
                                                className="w-full px-4 py-3 text-sm bg-white border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none transition"
                                                placeholder="เช่น หมด ธ.ค. 2568 หรือ 100,000 กม. (เว้นว่างถ้าไม่มี)"
                                                value={formData.warrantyDetails || ''}
                                                onChange={(e) => updateFormData({ warrantyDetails: e.target.value })}
                                            />
                                        </div>

                                        {/* BSI Package */}
                                        <div className="p-4 bg-gray-50 rounded-xl">
                                            <p className="font-medium text-gray-800 mb-2">BSI / แพ็กเกจบริการ</p>
                                            <p className="text-xs text-gray-500 mb-2">เช่น BMW Service Inclusive, Toyota Care</p>
                                            <input
                                                type="text"
                                                className="w-full px-4 py-3 text-sm bg-white border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none transition"
                                                placeholder="เช่น เหลือ 2 ครั้ง หมด ธ.ค. 2568 (เว้นว่างถ้าไม่มี)"
                                                value={formData.bsiDetails || ''}
                                                onChange={(e) => updateFormData({ bsiDetails: e.target.value })}
                                            />
                                        </div>

                                        {/* Service History Image Upload */}
                                        <div className="p-4 bg-gray-50 rounded-xl">
                                            <p className="font-medium text-gray-800 mb-2">ประวัติบริการ</p>
                                            <p className="text-xs text-gray-500 mb-3">อัพโหลดรูปสมุดบริการ / ใบเสร็จซ่อมบำรุง (ถ้ามี)</p>

                                            {formData.serviceHistoryPreview ? (
                                                <div className="relative">
                                                    <img
                                                        src={formData.serviceHistoryPreview}
                                                        alt="Service History"
                                                        className="w-full max-w-xs h-32 object-cover rounded-lg border"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            if (formData.serviceHistoryPreview) {
                                                                URL.revokeObjectURL(formData.serviceHistoryPreview);
                                                            }
                                                            updateFormData({
                                                                serviceHistoryFile: undefined,
                                                                serviceHistoryPreview: ''
                                                            });
                                                        }}
                                                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ) : (
                                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary transition">
                                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                        <svg className="w-8 h-8 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        <p className="text-xs text-gray-500">คลิกเพื่ออัพโหลด</p>
                                                    </div>
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        accept="image/*"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                const preview = URL.createObjectURL(file);
                                                                updateFormData({
                                                                    serviceHistoryFile: file,
                                                                    serviceHistoryPreview: preview
                                                                });
                                                            }
                                                        }}
                                                    />
                                                </label>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Step 2: Images */}
                            {currentStep === 2 && (
                                <>
                                    <h2 ref={imagesRef} className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
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
                                        <div ref={priceRef}>
                                            <label className={`block text-sm font-medium mb-1.5 ${fieldErrors.price ? 'text-red-600' : 'text-gray-700'}`}>ราคา (บาท) *</label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    placeholder="เช่น 650,000"
                                                    className={`form-input-icon font-bold text-lg ${fieldErrors.price ? 'border-red-500 ring-2 ring-red-500' : ''}`}
                                                    value={formData.price ? formData.price.toLocaleString('en-US') : ''}
                                                    onChange={(e) => {
                                                        setFieldErrors(prev => ({ ...prev, price: false }));
                                                        const value = e.target.value.replace(/,/g, '');
                                                        const numValue = parseInt(value) || 0;
                                                        updateFormData({ price: numValue });
                                                    }}
                                                />
                                                <div className={`absolute left-3 top-1/2 -translate-y-1/2 font-bold ${fieldErrors.price ? 'text-red-500' : 'text-gray-400'}`}>฿</div>
                                            </div>
                                            {fieldErrors.price && <p className="text-red-500 text-xs mt-1">กรุณาระบุราคา</p>}
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
                                        <div ref={provinceRef}>
                                            <label className={`block text-sm font-medium mb-1.5 ${fieldErrors.province ? 'text-red-600' : 'text-gray-700'}`}>จังหวัด *</label>
                                            <div className="relative">
                                                <MapPin className={`absolute left-3 top-1/2 -translate-y-1/2 z-10 ${fieldErrors.province ? 'text-red-500' : 'text-gray-400'}`} size={20} />
                                                <select
                                                    className={`form-select-icon ${fieldErrors.province ? 'border-red-500 ring-2 ring-red-500' : ''}`}
                                                    value={formData.province}
                                                    onChange={(e) => {
                                                        setFieldErrors(prev => ({ ...prev, province: false }));
                                                        updateFormData({ province: e.target.value });
                                                    }}
                                                >
                                                    <option value="">เลือกจังหวัด</option>
                                                    {PROVINCES.map(p => (
                                                        <option key={p} value={p}>{p}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            {fieldErrors.province && <p className="text-red-500 text-xs mt-1">กรุณาเลือกจังหวัด</p>}
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

                                    {/* Contact Information */}
                                    <h3 className="text-lg font-bold text-primary mb-4">ข้อมูลติดต่อ</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">ชื่อผู้ติดต่อ *</label>
                                            <input
                                                type="text"
                                                placeholder="ชื่อที่ต้องการให้แสดง"
                                                className="form-input"
                                                value={formData.contactName}
                                                onChange={(e) => updateFormData({ contactName: e.target.value })}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">เบอร์โทรติดต่อ *</label>
                                            <input
                                                type="tel"
                                                placeholder="เช่น 0812345678"
                                                className="form-input"
                                                value={formData.contactPhone}
                                                onChange={(e) => updateFormData({ contactPhone: e.target.value })}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">LINE ID</label>
                                            <input
                                                type="text"
                                                placeholder="LINE ID สำหรับติดต่อ"
                                                className="form-input"
                                                value={formData.lineId || ''}
                                                onChange={(e) => updateFormData({ lineId: e.target.value })}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Facebook</label>
                                            <input
                                                type="text"
                                                placeholder="URL หรือ Username"
                                                className="form-input"
                                                value={formData.facebookUrl || ''}
                                                onChange={(e) => updateFormData({ facebookUrl: e.target.value })}
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
