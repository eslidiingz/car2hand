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
    Lightbulb,
    AddressBook,
    Star,
    X,
    ArrowUp,
    ArrowDown,
    Camera
} from '@phosphor-icons/react';
import PreviewCard from '@/components/PreviewCard';

// Types
interface VehicleImage {
    id: string;
    url: string;
    isPrimary: boolean;
    order: number;
}

interface DisplayImage {
    id: string;
    url: string;
    isPrimary: boolean;
    isNew: boolean;
    file?: File;
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
    fuelType: 'PETROL' | 'DIESEL' | 'HYBRID' | 'PLUGIN_HYBRID' | 'EV' | 'LPG' | 'NGV';
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
    // Vehicle Extras (ข้อมูลเพิ่มเติมช่วยตัดสินใจ)
    taxPaid: boolean;
    registrationBookStatus: 'READY' | 'FINANCED';
    insuranceDetails: string;
    warrantyDetails: string;
    bsiDetails: string;
    gasType: 'NONE' | 'LPG' | 'NGV';
    hasSpareKey: boolean;
    serviceHistoryImage?: string;
    // Contact Info
    contactName: string;
    contactPhone: string;
    lineId: string;
    facebookUrl: string;
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
        district: '',
        // Vehicle Extras
        taxPaid: false,
        registrationBookStatus: 'READY',
        insuranceDetails: '',
        warrantyDetails: '',
        bsiDetails: '',
        gasType: 'NONE',
        hasSpareKey: false,

        serviceHistoryImage: '',
        // Contact Info
        contactName: '',
        contactPhone: '',
        lineId: '',
        facebookUrl: ''
    });

    const brands = formData.vehicleType === 'CAR' ? CAR_BRANDS : MOTORCYCLE_BRANDS;

    // Image management state
    const [displayImages, setDisplayImages] = useState<DisplayImage[]>([]);
    const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]);
    const [draggedImageId, setDraggedImageId] = useState<string | null>(null);
    const [dragOverImageId, setDragOverImageId] = useState<string | null>(null);

    // Image management functions
    const handleDeleteImage = (imageId: string) => {
        const imageToDelete = displayImages.find(img => img.id === imageId);
        if (!imageToDelete) return;

        // If it's an existing image (not new), mark for deletion
        if (!imageToDelete.isNew) {
            setDeletedImageIds(prev => [...prev, imageId]);
        }

        // Remove from display
        setDisplayImages(prev => prev.filter(img => img.id !== imageId));
    };

    const handleDragStart = (e: React.DragEvent, imageId: string) => {
        setDraggedImageId(imageId);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', imageId);
        // Add dragging style
        if (e.currentTarget instanceof HTMLElement) {
            e.currentTarget.style.opacity = '0.5';
        }
    };

    const handleDragEnd = (e: React.DragEvent) => {
        setDraggedImageId(null);
        setDragOverImageId(null);
        // Remove dragging style
        if (e.currentTarget instanceof HTMLElement) {
            e.currentTarget.style.opacity = '1';
        }
    };

    const handleDragOver = (e: React.DragEvent, imageId: string) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (imageId !== draggedImageId) {
            setDragOverImageId(imageId);
        }
    };

    const handleDragLeave = () => {
        setDragOverImageId(null);
    };

    const handleDrop = (e: React.DragEvent, targetImageId: string) => {
        e.preventDefault();
        setDragOverImageId(null);

        if (!draggedImageId || draggedImageId === targetImageId) return;

        const draggedIndex = displayImages.findIndex(img => img.id === draggedImageId);
        const targetIndex = displayImages.findIndex(img => img.id === targetImageId);

        if (draggedIndex === -1 || targetIndex === -1) return;

        // Reorder images locally
        const newOrder = [...displayImages];
        const [draggedItem] = newOrder.splice(draggedIndex, 1);
        newOrder.splice(targetIndex, 0, draggedItem);
        setDisplayImages(newOrder);

        setDraggedImageId(null);
    };

    const handleNewImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const currentTotal = displayImages.length;
        const remainingSlots = 24 - currentTotal;

        if (remainingSlots <= 0) {
            setError('คุณสามารถอัพโหลดรูปภาพได้สูงสุด 24 รูป');
            return;
        }

        let fileArray = Array.from(files);
        if (fileArray.length > remainingSlots) {
            setError('คุณสามารถอัพโหลดรูปภาพได้สูงสุด 24 รูปเท่านั้น');
            fileArray = fileArray.slice(0, remainingSlots);
        } else {
            setError(null);
        }

        // Convert to DisplayImage
        const newDisplayImages: DisplayImage[] = fileArray.map(file => ({
            id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            url: URL.createObjectURL(file), // Create local preview URL
            isPrimary: false,
            isNew: true,
            file: file
        }));

        setDisplayImages(prev => [...prev, ...newDisplayImages]);
        e.target.value = '';
    };

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
                setListing(listingData);
                if (listingData.images) {
                    setDisplayImages(listingData.images.map(img => ({
                        id: img.id,
                        url: img.url,
                        isPrimary: img.isPrimary,
                        isNew: false
                    })));
                } else {
                    setDisplayImages([]);
                }

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
                    district: listingData.district || '',
                    // Vehicle Extras
                    taxPaid: (listingData as any).taxPaid || false,
                    registrationBookStatus: (listingData as any).registrationBookStatus || 'READY',
                    insuranceDetails: (listingData as any).insuranceDetails || '',
                    warrantyDetails: (listingData as any).warrantyDetails || '',
                    bsiDetails: (listingData as any).bsiDetails || '',
                    gasType: (listingData as any).gasType || 'NONE',
                    hasSpareKey: (listingData as any).hasSpareKey || false,

                    serviceHistoryImage: (listingData as any).serviceHistoryImage || '',
                    // Contact Info
                    contactName: (listingData as any).contactName || (listingData.user?.fullName) || '',
                    contactPhone: (listingData as any).contactPhone || (listingData.user as any)?.phoneNumber || '',
                    lineId: (listingData as any).lineId || '',
                    facebookUrl: (listingData as any).facebookUrl || ''
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
            // 1. Process deletions
            if (deletedImageIds.length > 0) {
                await Promise.all(deletedImageIds.map(id =>
                    fetch(`http://localhost:8000/listings/${listingId}/images/${id}?userId=${userId}`, { method: 'DELETE' })
                ));
            }

            // 2. Process uploads and ID mapping
            const imagesToUpload = displayImages.filter(img => img.isNew && img.file);
            let finalImageOrder: string[] = [];

            if (imagesToUpload.length > 0) {
                const imagePromises = imagesToUpload.map(img =>
                    new Promise<{ buffer: string; filename: string; mimetype: string }>((resolve) => {
                        const reader = new FileReader();
                        reader.onload = () => {
                            const base64 = (reader.result as string).split(',')[1];
                            resolve({ buffer: base64, filename: img.file!.name, mimetype: img.file!.type });
                        };
                        reader.readAsDataURL(img.file!);
                    })
                );

                const imageData = await Promise.all(imagePromises);

                const uploadRes = await fetch(`http://localhost:8000/listings/${listingId}/images`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId, images: imageData })
                });

                if (!uploadRes.ok) throw new Error('Failed to upload images');

                const uploadData = await uploadRes.json();
                const serverImages = uploadData.images as VehicleImage[];

                // Map local new images to server images (assuming append order)
                const newServerImages = serverImages.slice(-imagesToUpload.length);
                const newImageIdMap = new Map<string, string>();
                imagesToUpload.forEach((img, index) => {
                    if (newServerImages[index]) {
                        newImageIdMap.set(img.id, newServerImages[index].id);
                    }
                });

                finalImageOrder = displayImages.map(img => {
                    if (img.isNew) {
                        return newImageIdMap.get(img.id) || img.id;
                    }
                    return img.id;
                }).filter(id => !id.startsWith('temp-'));

            } else {
                finalImageOrder = displayImages
                    .filter(img => !img.isNew)
                    .map(img => img.id);
            }

            // 3. Reorder
            if (finalImageOrder.length > 0) {
                await fetch(`http://localhost:8000/listings/${listingId}/images/reorder`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId,
                        imageIds: finalImageOrder
                    })
                });
            }

            // 4. Update listing data
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
                <div className="max-w-7xl mx-auto px-4 mt-4">
                    <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700">
                        <CheckCircle size={24} weight="bold" />
                        <span className="font-medium">บันทึกการเปลี่ยนแปลงสำเร็จ! กำลังกลับไปหน้ารายการ...</span>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && listing && (
                <div className="max-w-7xl mx-auto px-4 mt-4">
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
                            {/* Image Management Section */}
                            <div className="mb-8">
                                <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                                    <Camera size={24} weight="fill" className="text-accent" /> จัดการรูปภาพ
                                </h3>

                                {/* Existing Images */}
                                {/* Images Grid */}
                                {displayImages.length > 0 && (
                                    <div className="mb-6">
                                        <p className="text-sm text-gray-600 mb-3">
                                            รูปภาพทั้งหมด ({displayImages.length} รูป) - ลากเพื่อจัดลำดับ (รูปแรกจะเป็นรูปหลัก)
                                        </p>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {displayImages.map((img, index) => (
                                                <div
                                                    key={img.id}
                                                    draggable
                                                    onDragStart={(e) => handleDragStart(e, img.id)}
                                                    onDragEnd={handleDragEnd}
                                                    onDragOver={(e) => handleDragOver(e, img.id)}
                                                    onDragLeave={handleDragLeave}
                                                    onDrop={(e) => handleDrop(e, img.id)}
                                                    className={`relative group rounded-xl overflow-hidden border-2 cursor-grab active:cursor-grabbing transition-all duration-200
                                                        ${index === 0 ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200'}
                                                        ${draggedImageId === img.id ? 'opacity-50 scale-95' : ''}
                                                        ${dragOverImageId === img.id ? 'ring-4 ring-blue-400 border-blue-400 scale-105' : ''}
                                                        ${deletedImageIds.includes(img.id) ? 'opacity-30 grayscale' : ''}
                                                    `}
                                                >
                                                    <div className="aspect-[4/3]">
                                                        <img
                                                            src={img.url}
                                                            alt={`Image ${index + 1}`}
                                                            className="w-full h-full object-cover pointer-events-none"
                                                        />
                                                    </div>

                                                    {/* Primary Badge - show on first image only */}
                                                    {index === 0 && (
                                                        <div className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded-full font-bold">
                                                            รูปหลัก
                                                        </div>
                                                    )}

                                                    {/* New Badge */}
                                                    {img.isNew && index !== 0 && (
                                                        <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                                                            ใหม่
                                                        </div>
                                                    )}

                                                    {/* Delete Button - Top Right */}
                                                    <button
                                                        type="button"
                                                        onClick={(e) => { e.stopPropagation(); handleDeleteImage(img.id); }}
                                                        className="absolute top-2 right-2 w-8 h-8 bg-white/90 hover:bg-white text-red-500 hover:text-red-600 rounded-full flex items-center justify-center shadow-md transition-all opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
                                                        title="ลบรูปภาพ"
                                                    >
                                                        <Trash size={16} weight="bold" />
                                                    </button>

                                                    {/* Order Number */}
                                                    <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                                                        {index + 1}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Add New Image Button */}
                                {displayImages.length < 24 ? (
                                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-primary transition cursor-pointer">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleNewImageSelect}
                                            className="hidden"
                                            id="new-image-input"
                                        />
                                        <label htmlFor="new-image-input" className="cursor-pointer">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                                                    <Plus size={24} className="text-gray-400" />
                                                </div>
                                                <p className="text-sm font-medium text-gray-600">คลิกเพื่อเพิ่มรูปภาพ</p>
                                                <p className="text-xs text-gray-400">รองรับ JPG, PNG, WebP (สูงสุด 10MB ต่อรูป)</p>
                                            </div>
                                        </label>
                                    </div>
                                ) : (
                                    <div className="border-2 border-dashed border-gray-200 bg-gray-50 rounded-xl p-6 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                                                <CheckCircle size={24} className="text-gray-400" />
                                            </div>
                                            <p className="text-sm font-medium text-gray-500">คุณอัพโหลดรูปภาพครบ 24 รูปแล้ว</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Vehicle Info Section */}
                            <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                                <Car size={24} weight="fill" className="text-accent" /> ข้อมูลรถของคุณ
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

                                <div>
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
                                        <option value="PETROL">Petrol (เบนซิน)</option>
                                        <option value="DIESEL">Diesel (ดีเซล)</option>
                                        <option value="HYBRID">Hybrid (ไฮบริด)</option>
                                        <option value="PLUGIN_HYBRID">Plug-in Hybrid (ปลั๊กอินไฮบริด)</option>
                                        <option value="EV">EV (ไฟฟ้า)</option>
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



                            {/* Price Section */}
                            <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                                <CurrencyDollar size={24} weight="fill" className="text-accent" /> หัวข้อและราคา
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
                            <div className="mb-6">
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

                            {/* Contact Info Section */}
                            <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                                <AddressBook size={24} weight="fill" className="text-accent" /> ข้อมูลติดต่อ
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">ชื่อผู้ติดต่อ *</label>
                                    <input
                                        type="text"
                                        placeholder="ชื่อ-นามสกุล หรือชื่อเล่น"
                                        className="form-input"
                                        value={formData.contactName}
                                        onChange={(e) => updateFormData({ contactName: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">เบอร์โทรติดต่อ *</label>
                                    <input
                                        type="tel"
                                        placeholder="08xxxxxxxx"
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
                                        value={formData.lineId}
                                        onChange={(e) => updateFormData({ lineId: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Facebook</label>
                                    <input
                                        type="text"
                                        placeholder="URL หรือ Username"
                                        className="form-input"
                                        value={formData.facebookUrl}
                                        onChange={(e) => updateFormData({ facebookUrl: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Vehicle Extras Section */}
                            <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                                <Lightbulb size={24} weight="fill" className="text-accent" /> ข้อมูลเพิ่มเติม
                            </h3>

                            <div className="space-y-4 mb-8">
                                {/* Tax & Spare Key */}
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
                                            <p className="text-xs text-gray-500">พ.ร.บ. และภาษีรถยนต์ประจำปียังไม่หมดอายุ</p>
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
                                                onClick={() => updateFormData({ registrationBookStatus: opt.value as FormData['registrationBookStatus'] })}
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

                                {/* Gas Type */}
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
                                                onClick={() => updateFormData({ gasType: opt.value as FormData['gasType'] })}
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
                                        value={formData.insuranceDetails}
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
                                        value={formData.warrantyDetails}
                                        onChange={(e) => updateFormData({ warrantyDetails: e.target.value })}
                                    />
                                </div>

                                {/* BSI */}
                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <p className="font-medium text-gray-800 mb-2">BSI / แพ็กเกจบริการ</p>
                                    <p className="text-xs text-gray-500 mb-2">เช่น BMW Service Inclusive, Toyota Care</p>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 text-sm bg-white border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none transition"
                                        placeholder="เช่น เหลือ 2 ครั้ง หมด ธ.ค. 2568 (เว้นว่างถ้าไม่มี)"
                                        value={formData.bsiDetails}
                                        onChange={(e) => updateFormData({ bsiDetails: e.target.value })}
                                    />
                                </div>

                                {/* Service History Image */}
                                {formData.serviceHistoryImage && (
                                    <div className="p-4 bg-gray-50 rounded-xl">
                                        <p className="font-medium text-gray-800 mb-2">รูปประวัติบริการ</p>
                                        <img
                                            src={formData.serviceHistoryImage}
                                            alt="Service History"
                                            className="w-full max-w-xs h-32 object-cover rounded-lg border"
                                        />
                                    </div>
                                )}
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
