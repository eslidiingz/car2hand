"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Car,
    Bike,
    Settings,
    GitCommit,
    Gauge,
    ImageIcon,
    DollarSign,
    MapPin,
    ArrowLeft,
    Save,
    Loader2,
    AlertCircle,
    CheckCircle,
    Trash2,
    Plus,
    Droplet,
    Palette,
    Lightbulb,
    BookUser,
    Star,
    X,
    ArrowUp,
    ArrowDown,
    Camera
} from 'lucide-react';
import PreviewCard from '@/components/PreviewCard';
import SearchableSelect from '@/components/SearchableSelect';

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
    brand: string;
    model: string;
    subModel: string;
    year: number;
    color: string;
    fuelType: 'PETROL' | 'DIESEL' | 'HYBRID' | 'PLUGIN_HYBRID' | 'EV' | 'LPG' | 'NGV';
    transmission: 'AUTOMATIC' | 'MANUAL' | 'CVT' | 'DCT' | 'SEMI_AUTO';
    mileage: number;
    engineSize: number;
    seats: number;
    bodyType: string;
    condition: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
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
    registrationBookImage?: string;
    // Contact Info
    contactName: string;
    contactPhone: string;
    lineId: string;
    facebookUrl: string;
}

// Constants
const COLORS: Array<{ name: string; hex: string; border?: boolean }> = [
    { name: 'ขาว', hex: '#FFFFFF', border: true },
    { name: 'ดำ', hex: '#1A1A1A' },
    { name: 'เงิน', hex: '#C0C0C0' },
    { name: 'เทา', hex: '#808080' },
    { name: 'แดง', hex: '#DC2626' },
    { name: 'น้ำเงิน', hex: '#1D4ED8' },
    { name: 'เขียว', hex: '#16A34A' },
    { name: 'ส้ม', hex: '#EA580C' },
    { name: 'น้ำตาล', hex: '#78350F' },
    { name: 'ทอง', hex: '#CA8A04' },
    { name: 'ชมพู', hex: '#EC4899' },
    { name: 'ม่วง', hex: '#7C3AED' },
    { name: 'เหลือง', hex: '#EAB308' },
    { name: 'ฟ้า', hex: '#38BDF8' },
    { name: 'เบจ/ครีม', hex: '#D2B48C' },
    { name: 'อื่นๆ', hex: 'linear-gradient(135deg, #f00, #0f0, #00f)', border: true },
];
const CAR_BRANDS = ['Toyota', 'Honda', 'Mazda', 'Nissan', 'Mitsubishi', 'Isuzu', 'Ford', 'Chevrolet', 'MG', 'BMW', 'Mercedes-Benz', 'Audi', 'Lexus', 'Hyundai', 'Kia', 'Suzuki', 'Subaru', 'Volvo', 'Porsche', 'Mini', 'Jaguar', 'Land Rover', 'Tesla', 'BYD', 'Haval', 'Changan', 'Neta', 'ORA', 'อื่นๆ'];
const MOTORCYCLE_BRANDS = ['Honda', 'Yamaha', 'Kawasaki', 'Suzuki', 'BMW', 'Ducati', 'Triumph', 'KTM', 'Harley-Davidson', 'Royal Enfield', 'Vespa', 'GPX', 'Benelli', 'CF Moto', 'Zontes', 'อื่นๆ'];
const PROVINCES = ['กรุงเทพมหานคร', 'กระบี่', 'กาญจนบุรี', 'กาฬสินธุ์', 'กำแพงเพชร', 'ขอนแก่น', 'จันทบุรี', 'ฉะเชิงเทรา', 'ชลบุรี', 'ชัยนาท', 'ชัยภูมิ', 'ชุมพร', 'เชียงราย', 'เชียงใหม่', 'ตรัง', 'ตราด', 'ตาก', 'นครนายก', 'นครปฐม', 'นครพนม', 'นครราชสีมา', 'นครศรีธรรมราช', 'นครสวรรค์', 'นนทบุรี', 'นราธิวาส', 'น่าน', 'บึงกาฬ', 'บุรีรัมย์', 'ปทุมธานี', 'ประจวบคีรีขันธ์', 'ปราจีนบุรี', 'ปัตตานี', 'พระนครศรีอยุธยา', 'พังงา', 'พัทลุง', 'พิจิตร', 'พิษณุโลก', 'เพชรบุรี', 'เพชรบูรณ์', 'แพร่', 'ภูเก็ต', 'มหาสารคาม', 'มุกดาหาร', 'แม่ฮ่องสอน', 'ยโสธร', 'ยะลา', 'ร้อยเอ็ด', 'ระนอง', 'ระยอง', 'ราชบุรี', 'ลพบุรี', 'ลำปาง', 'ลำพูน', 'เลย', 'ศรีสะเกษ', 'สกลนคร', 'สงขลา', 'สตูล', 'สมุทรปราการ', 'สมุทรสงคราม', 'สมุทรสาคร', 'สระแก้ว', 'สระบุรี', 'สิงห์บุรี', 'สุโขทัย', 'สุพรรณบุรี', 'สุราษฎร์ธานี', 'สุรินทร์', 'หนองคาย', 'หนองบัวลำภู', 'อ่างทอง', 'อำนาจเจริญ', 'อุดรธานี', 'อุตรดิตถ์', 'อุทัยธานี', 'อุบลราชธานี'];

const years = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() + 1 - i);

// Auth helper
function getAuthToken(): string | null {
    const stored = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (!stored) return null;
    try { return JSON.parse(stored).token || null; } catch { return null; }
}

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
    const [bodyStyleOptions, setBodyStyleOptions] = useState<{ value: string; label: string }[]>([]);
    const [motorcycleBodyOptions, setMotorcycleBodyOptions] = useState<{ value: string; label: string }[]>([]);
    const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});

    // Refs for scrolling to errors
    const brandRef = useRef<HTMLDivElement>(null);
    const modelRef = useRef<HTMLDivElement>(null);
    const bodyTypeRef = useRef<HTMLDivElement>(null);
    const colorRef = useRef<HTMLDivElement>(null);
    const fuelTypeRef = useRef<HTMLDivElement>(null);
    const yearRef = useRef<HTMLDivElement>(null);
    const mileageRef = useRef<HTMLDivElement>(null);
    const priceRef = useRef<HTMLDivElement>(null);
    const provinceRef = useRef<HTMLDivElement>(null);
    const contactNameRef = useRef<HTMLDivElement>(null);
    const contactPhoneRef = useRef<HTMLDivElement>(null);

    // Master Data State
    const [brandsList, setBrandsList] = useState<any[]>([]);
    const [modelsList, setModelsList] = useState<any[]>([]);
    const [subModelsList, setSubModelsList] = useState<any[]>([]);
    const [selectedBrandId, setSelectedBrandId] = useState<string>('');
    const [selectedModelId, setSelectedModelId] = useState<string>('');
    const [loadingBrands, setLoadingBrands] = useState(false);
    const [loadingModels, setLoadingModels] = useState(false);
    const [loadingSubModels, setLoadingSubModels] = useState(false);

    const [formData, setFormData] = useState<FormData>({
        vehicleType: 'CAR',
        title: '',
        description: '',
        price: 0,
        brand: '',
        model: '',
        subModel: '',
        year: new Date().getFullYear(),
        color: '',
        fuelType: 'PETROL',
        transmission: 'AUTOMATIC',
        mileage: 0,
        engineSize: 0,
        seats: 0,
        bodyType: 'SEDAN',
        condition: 'GOOD',
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
        registrationBookImage: '',
        // Contact Info
        contactName: '',
        contactPhone: '',
        lineId: '',
        facebookUrl: ''
    });

    // Scroll to error when it appears
    useEffect(() => {
        if (error && errorRef.current) {
            errorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [error]);

    const brands = formData.vehicleType === 'CAR' ? CAR_BRANDS : MOTORCYCLE_BRANDS;

    // Image management state
    const [displayImages, setDisplayImages] = useState<DisplayImage[]>([]);
    const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]);
    const [draggedImageId, setDraggedImageId] = useState<string | null>(null);
    const [dragOverImageId, setDragOverImageId] = useState<string | null>(null);
    const [maxPhotos, setMaxPhotos] = useState(15);
    const [isBasicPackage, setIsBasicPackage] = useState(true);

    // Registration book state
    const [regBookFile, setRegBookFile] = useState<File | null>(null);
    const [regBookPreview, setRegBookPreview] = useState<string>('');

    // Drag & drop states
    const [dragOverPhotos, setDragOverPhotos] = useState(false);
    const [dragOverRegBook, setDragOverRegBook] = useState(false);
    const errorRef = useRef<HTMLDivElement>(null);

    // Lightbox state
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const [lightboxRegBook, setLightboxRegBook] = useState(false);

    const openLightbox = (index: number) => { setLightboxIndex(index); setLightboxOpen(true); setLightboxRegBook(false); };
    const openRegBookLightbox = () => { setLightboxRegBook(true); setLightboxOpen(true); };
    const closeLightbox = () => setLightboxOpen(false);
    const prevImage = () => setLightboxIndex(i => (i - 1 + displayImages.length) % displayImages.length);
    const nextImage = () => setLightboxIndex(i => (i + 1) % displayImages.length);

    useEffect(() => {
        if (!lightboxOpen) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeLightbox();
            if (!lightboxRegBook) {
                if (e.key === 'ArrowLeft') prevImage();
                if (e.key === 'ArrowRight') nextImage();
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [lightboxOpen, lightboxRegBook, displayImages.length]);

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
        const remainingSlots = maxPhotos - currentTotal;

        if (remainingSlots <= 0) {
            setError(`คุณสามารถอัพโหลดรูปภาพได้สูงสุด ${maxPhotos} รูป`);
            return;
        }

        let fileArray = Array.from(files);
        if (fileArray.length > remainingSlots) {
            setError(`เพิ่มรูปภาพได้อีกเพียง ${remainingSlots} รูป (ครบจำนวนสูงสุด ${maxPhotos} รูปแล้ว)`);
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

        // Fetch package image limit
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
        const token = getAuthToken();
        fetch(`${API_URL}/packages/my`, {
            headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
        })
            .then(r => r.json())
            .then(data => {
                setMaxPhotos(data.currentPackage?.maxPhotosPerListing ?? 15);
                setIsBasicPackage(!data.currentPackage || data.currentPackage.slug === 'basic');
            })
            .catch(() => {});
    }, [router]);

    // Load listing data
    useEffect(() => {
        if (!listingId || !userId) return;

        const fetchListing = async () => {
            try {
                setLoading(true);
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
                // ส่ง viewerId เพื่อไม่นับ view เมื่อเจ้าของดูเอง
                const response = await fetch(`${API_URL}/listings/${listingId}?viewerId=${userId}`);
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
                    brand: listingData.brand,
                    model: listingData.model,
                    subModel: listingData.subModel || '',
                    year: listingData.year,
                    color: listingData.color,
                    fuelType: listingData.fuelType as FormData['fuelType'],
                    transmission: (listingData.transmission as FormData['transmission']) || 'AUTOMATIC',
                    mileage: listingData.mileage || 0,
                    engineSize: listingData.engineSize || 0,
                    seats: (listingData as any).seats || 0,
                    bodyType: listingData.bodyType || 'SEDAN',
                    condition: (listingData.condition as FormData['condition']) || 'GOOD',
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
                    registrationBookImage: (listingData as any).registrationBookImage || '',
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

        const fetchBrands = async () => {
            setLoadingBrands(true);
            try {
                const params = new URLSearchParams();
                params.append('vehicleType', formData.vehicleType);
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
                const response = await fetch(`${API_URL}/master-data/brands?${params.toString()}`);
                const data = await response.json();
                if (data.success) {
                    setBrandsList(data.brands);
                }
            } catch (err) {
                console.error('Error fetching brands:', err);
            } finally {
                setLoadingBrands(false);
            }
        };

        const fetchOptions = async () => {
            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
                const response = await fetch(`${API_URL}/master-data/car-options`);
                const data = await response.json();
                if (data.success) {
                    setBodyStyleOptions(data.bodyStyles);
                    setMotorcycleBodyOptions(data.motorcycleBodyStyles);
                }
            } catch (err) {
                console.error('Error fetching options:', err);
            }
        };

        if (listingId && userId) {
            fetchListing();
        }
        fetchBrands();
        fetchOptions();
    }, [listingId, userId, formData.vehicleType]);

    // Update selected brand ID when brands list or form data changes
    useEffect(() => {
        if (brandsList.length > 0 && formData.brand && !selectedBrandId) {
            const match = brandsList.find(b => b.name === formData.brand);
            if (match) setSelectedBrandId(match.id);
        }
    }, [brandsList, formData.brand]);

    // Fetch models when brand changes
    useEffect(() => {
        if (!selectedBrandId) {
            setModelsList([]);
            return;
        }

        const fetchModels = async () => {
            setLoadingModels(true);
            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
                const response = await fetch(`${API_URL}/master-data/brands/${selectedBrandId}/models`);
                const data = await response.json();
                if (data.success) {
                    setModelsList(data.models);
                }
            } catch (err) {
                console.error('Error fetching models:', err);
            } finally {
                setLoadingModels(false);
            }
        };
        fetchModels();
    }, [selectedBrandId]);

    // Update selected model ID when models list or form data changes
    useEffect(() => {
        if (modelsList.length > 0 && formData.model && !selectedModelId) {
            const match = modelsList.find(m => m.name === formData.model);
            if (match) setSelectedModelId(match.id);
        }
    }, [modelsList, formData.model]);

    // Fetch sub-models when model changes
    useEffect(() => {
        if (!selectedModelId) {
            setSubModelsList([]);
            return;
        }

        const fetchSubModels = async () => {
            setLoadingSubModels(true);
            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
                const response = await fetch(`${API_URL}/master-data/models/${selectedModelId}/sub-models`);
                const data = await response.json();
                if (data.success) {
                    setSubModelsList(data.subModels);
                }
            } catch (err) {
                console.error('Error fetching sub-models:', err);
            } finally {
                setLoadingSubModels(false);
            }
        };
        fetchSubModels();
    }, [selectedModelId]);

    const updateFormData = (updates: Partial<FormData>) => {
        setFormData(prev => ({ ...prev, ...updates }));
    };

    const handleSubmit = async () => {
        if (!userId || !listingId) return;

        // Validation
        // Validation
        const errors: Record<string, boolean> = {};
        if (!formData.brand) errors.brand = true;
        if (!formData.model) errors.model = true;
        if (!formData.bodyType) errors.bodyType = true;
        if (!formData.color) errors.color = true;
        if (!formData.fuelType) errors.fuelType = true;
        if (!formData.year) errors.year = true;
        if (!formData.mileage) errors.mileage = true;
        if (!formData.price) errors.price = true;
        if (!formData.province) errors.province = true;
        if (!formData.contactName) errors.contactName = true;
        if (!formData.contactPhone) errors.contactPhone = true;

        if (displayImages.length === 0) {
            setError('กรุณาอัพโหลดรูปภาพอย่างน้อย 1 รูป');
            return;
        }

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            setError('กรุณากรอกข้อมูลให้ครบถ้วน');

            // Scroll to first error
            const firstErrorRef = errors.brand ? brandRef
                : errors.model ? modelRef
                    : errors.bodyType ? bodyTypeRef
                        : errors.color ? colorRef
                            : errors.fuelType ? fuelTypeRef
                                : errors.year ? yearRef
                                    : errors.mileage ? mileageRef
                                        : errors.price ? priceRef
                                            : errors.province ? provinceRef
                                                : errors.contactName ? contactNameRef
                                                    : errors.contactPhone ? contactPhoneRef
                                                        : null;

            if (firstErrorRef?.current) {
                firstErrorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        setFieldErrors({});

        setSaving(true);
        setError(null);

        try {
            // 1. Process deletions
            if (deletedImageIds.length > 0) {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
                const token = getAuthToken();
                await Promise.all(deletedImageIds.map(id =>
                    fetch(`${API_URL}/listings/${listingId}/images/${id}?userId=${userId}`, {
                        method: 'DELETE',
                        headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
                    })
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

                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
                const token = getAuthToken();
                const uploadRes = await fetch(`${API_URL}/listings/${listingId}/images`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                    },
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
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
                const token = getAuthToken();
                await fetch(`${API_URL}/listings/${listingId}/images/reorder`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                    },
                    body: JSON.stringify({
                        userId,
                        imageIds: finalImageOrder
                    })
                });
            }

            // 4. Update listing data
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
            const token4 = getAuthToken();
            const response = await fetch(`${API_URL}/listings/${listingId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token4 ? { 'Authorization': `Bearer ${token4}` } : {})
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

            // 5. Upload new registration book image if selected
            if (regBookFile) {
                const regBookBase64 = await new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve((reader.result as string).split(',')[1]);
                    reader.readAsDataURL(regBookFile);
                });
                const tokenReg = getAuthToken();
                await fetch(`${API_URL}/listings/${listingId}/registration-book`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(tokenReg ? { 'Authorization': `Bearer ${tokenReg}` } : {})
                    },
                    body: JSON.stringify({
                        userId,
                        image: { buffer: regBookBase64, filename: regBookFile.name, mimetype: regBookFile.type }
                    })
                });
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
                    <Loader2 size={48} className="animate-spin text-primary" />
                    <p className="text-gray-500">กำลังโหลดข้อมูล...</p>
                </div>
            </div>
        );
    }

    if (error && !listing) {
        return (
            <div className="min-h-screen bg-surface flex items-center justify-center">
                <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
                    <AlertCircle size={64} className="text-red-500 mx-auto mb-4" />
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
            {/* Lightbox */}
            {lightboxOpen && (
                <div
                    className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center"
                    onClick={closeLightbox}
                >
                    <button
                        onClick={closeLightbox}
                        className="absolute top-4 right-4 text-white bg-white/20 hover:bg-white/30 rounded-full w-10 h-10 flex items-center justify-center text-xl font-bold transition z-10"
                    >✕</button>

                    {lightboxRegBook ? (
                        <img
                            src={regBookPreview || formData.registrationBookImage}
                            alt="สำเนาเล่มทะเบียน"
                            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
                            onClick={(e) => e.stopPropagation()}
                        />
                    ) : (
                        <>
                            <img
                                src={displayImages[lightboxIndex]?.url}
                                alt={`รูปที่ ${lightboxIndex + 1}`}
                                className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
                                onClick={(e) => e.stopPropagation()}
                            />
                            {displayImages.length > 1 && (
                                <>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); prevImage(); }}
                                        className="absolute left-4 text-white bg-white/20 hover:bg-white/30 rounded-full w-11 h-11 flex items-center justify-center text-xl font-bold transition"
                                    >‹</button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); nextImage(); }}
                                        className="absolute right-4 text-white bg-white/20 hover:bg-white/30 rounded-full w-11 h-11 flex items-center justify-center text-xl font-bold transition"
                                    >›</button>
                                    <div className="absolute bottom-4 text-white/70 text-sm font-medium">
                                        {lightboxIndex + 1} / {displayImages.length}
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>
            )}

            {/* Header */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/profile/listings" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition">
                                <ArrowLeft size={20} />
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
                                    <Loader2 size={20} className="animate-spin" />
                                    กำลังบันทึก...
                                </>
                            ) : (
                                <>
                                    <Save size={20} />
                                    บันทึก
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
                        <CheckCircle size={24} />
                        <span className="font-medium">บันทึกการเปลี่ยนแปลงสำเร็จ! กำลังกลับไปหน้ารายการ...</span>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && listing && (
                <div ref={errorRef} className="max-w-7xl mx-auto px-4 mt-4">
                    <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                        <AlertCircle size={24} />
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
                                    <Camera size={24} className="text-accent" /> จัดการรูปภาพ
                                    <span className="ml-auto text-sm font-medium text-gray-400">
                                        {displayImages.length}/{maxPhotos} รูป
                                    </span>
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
                                                    <div
                                                        className="aspect-[4/3] cursor-zoom-in"
                                                        onClick={(e) => { e.stopPropagation(); openLightbox(index); }}
                                                    >
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
                                                        <Trash2 size={16} />
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
                                {displayImages.length < maxPhotos ? (
                                    <div
                                        className={`border-2 border-dashed rounded-xl p-6 text-center transition cursor-pointer ${dragOverPhotos ? 'border-primary bg-blue-50 ring-2 ring-primary/30' : 'border-gray-300 hover:border-primary'}`}
                                        onDragOver={(e) => { e.preventDefault(); setDragOverPhotos(true); }}
                                        onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOverPhotos(false); }}
                                        onDrop={(e) => {
                                            e.preventDefault(); setDragOverPhotos(false);
                                            const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
                                            if (files.length === 0) return;
                                            const remaining = maxPhotos - displayImages.length;
                                            const accepted = files.slice(0, remaining);
                                            const newDisplayImages = accepted.map(file => ({
                                                id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                                                url: URL.createObjectURL(file),
                                                isPrimary: false,
                                                isNew: true,
                                                file: file
                                            }));
                                            setDisplayImages(prev => [...prev, ...newDisplayImages]);
                                        }}
                                    >
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
                                                <p className="text-sm font-medium text-gray-600">{dragOverPhotos ? 'วางรูปที่นี่' : 'คลิกหรือลากรูปมาวาง'}</p>
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
                                            <p className="text-sm font-medium text-gray-500">คุณอัพโหลดรูปภาพครบ {maxPhotos} รูปแล้ว</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Vehicle Info Section */}
                            <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                                <Car size={24} className="text-accent" /> ข้อมูลรถของคุณ
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
                                        <Car size={20} /> รถยนต์
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => updateFormData({ vehicleType: 'MOTORCYCLE', brand: '', model: '', bodyType: 'STANDARD' })}
                                        className={`form-button ${formData.vehicleType === 'MOTORCYCLE' ? 'form-button-active' : 'form-button-inactive'}`}
                                    >
                                        <Bike size={20} /> มอเตอร์ไซค์
                                    </button>
                                </div>
                            </div>

                            {/* Year, Brand, Model */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                                <div className="md:col-span-2" ref={brandRef}>
                                    <label className={`block text-sm font-medium mb-1.5 ${fieldErrors.brand ? 'text-red-600' : 'text-gray-700'}`}>ยี่ห้อ <span className="text-red-500">*</span></label>
                                    <div className={fieldErrors.brand ? 'ring-2 ring-red-500 rounded-xl' : ''}>
                                        <SearchableSelect
                                            options={brandsList.map(b => ({
                                                id: b.id,
                                                label: b.name,
                                                subLabel: b.nameTh || undefined,
                                                image: b.logo || undefined
                                            }))}
                                            value={selectedBrandId}
                                            onChange={(id, option) => {
                                                setFieldErrors(prev => ({ ...prev, brand: false }));
                                                setSelectedBrandId(id);
                                                setSelectedModelId('');
                                                updateFormData({
                                                    brand: option?.label || '',
                                                    model: '',
                                                    subModel: '',
                                                    bodyType: '',
                                                    color: '',
                                                    fuelType: '' as any,
                                                    year: 0,
                                                    transmission: 'AUTOMATIC',
                                                    mileage: 0,
                                                    engineSize: undefined,
                                                    seats: undefined
                                                });
                                            }}
                                            placeholder="เลือกยี่ห้อ"
                                            searchPlaceholder="ค้นหายี่ห้อ..."
                                            loading={loadingBrands}
                                            emptyMessage="ไม่พบยี่ห้อ"
                                        />
                                    </div>
                                    {fieldErrors.brand && <p className="text-red-500 text-xs mt-1">กรุณาเลือกยี่ห้อ</p>}
                                </div>

                                <div>
                                    <label className={`block text-sm font-medium mb-1.5 ${fieldErrors.model ? 'text-red-600' : 'text-gray-700'}`}>รุ่น <span className="text-red-500">*</span></label>
                                    <div className={fieldErrors.model ? 'ring-2 ring-red-500 rounded-xl' : ''}>
                                        {modelsList.length > 0 || loadingModels ? (
                                            <SearchableSelect
                                                options={modelsList.map(m => ({
                                                    id: m.id,
                                                    label: m.name,
                                                    subLabel: m.nameTh || undefined
                                                }))}
                                                value={selectedModelId}
                                                onChange={(id, option) => {
                                                    setSelectedModelId(id);
                                                    updateFormData({ model: option?.label || '', subModel: '' });
                                                    setFieldErrors(prev => ({ ...prev, model: false }));
                                                }}
                                                placeholder={!selectedBrandId ? "เลือกยี่ห้อก่อน" : "เลือกรุ่น"}
                                                searchPlaceholder="พิมพ์ชื่อรุ่น..."
                                                loading={loadingModels}
                                                disabled={!selectedBrandId}
                                                emptyMessage="ไม่พบรุ่น"
                                            />
                                        ) : (
                                            <input
                                                type="text"
                                                placeholder={!selectedBrandId ? 'เลือกยี่ห้อก่อน' : 'พิมพ์ชื่อรุ่น'}
                                                className={`form-input ${fieldErrors.model ? 'border-red-500 ring-2 ring-red-500' : ''}`}
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">รุ่นย่อย (ถ้ามี)</label>
                                    {subModelsList.length > 0 || loadingSubModels ? (
                                        <SearchableSelect
                                            options={subModelsList.map(s => ({
                                                id: s.id,
                                                label: s.name
                                            }))}
                                            value={subModelsList.find(s => s.name === formData.subModel)?.id || ''}
                                            onChange={(id, option) => {
                                                updateFormData({ subModel: option?.label || '' });
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
                                            value={formData.subModel || ''}
                                            onChange={(e) => updateFormData({ subModel: e.target.value })}
                                            disabled={!selectedModelId && !formData.model}
                                        />
                                    )}
                                </div>

                                <div className="md:col-span-1">
                                    <label className={`block text-sm font-medium mb-1.5 ${fieldErrors.bodyType ? 'text-red-600' : 'text-gray-700'}`}>รูปแบบรถ <span className="text-red-500">*</span></label>
                                    <div className={fieldErrors.bodyType ? 'ring-2 ring-red-500 rounded-xl' : ''}>
                                        <SearchableSelect
                                            options={(formData.vehicleType === 'CAR' ? bodyStyleOptions : motorcycleBodyOptions).map((style) => ({
                                                id: style.value,
                                                label: style.label
                                            }))}
                                            value={formData.bodyType}
                                            onChange={(value) => {
                                                setFieldErrors(prev => ({ ...prev, bodyType: false }));
                                                updateFormData({ bodyType: value });
                                            }}
                                            placeholder="เลือกรูปแบบรถ"
                                            searchPlaceholder="ค้นหารูปแบบรถ..."
                                            emptyMessage="ไม่พบรูปแบบรถ"
                                        />
                                    </div>
                                    {fieldErrors.bodyType && <p className="text-red-500 text-xs mt-1">กรุณาเลือกรูปแบบรถ</p>}
                                </div>

                                <div className="md:col-span-1">
                                    <label className={`block text-sm font-medium mb-1.5 ${fieldErrors.color ? 'text-red-600' : 'text-gray-700'}`}>สี <span className="text-red-500">*</span></label>
                                    <div className={fieldErrors.color ? 'ring-2 ring-red-500 rounded-xl' : ''}>
                                        <SearchableSelect
                                            options={COLORS.map(c => ({ id: c.name, label: c.name, color: c.hex, colorBorder: c.border }))}
                                            value={formData.color}
                                            onChange={(value) => {
                                                setFieldErrors(prev => ({ ...prev, color: false }));
                                                updateFormData({ color: value });
                                            }}
                                            placeholder="เลือกสี"
                                            searchPlaceholder="ค้นหาสี..."
                                            emptyMessage="ไม่พบสี"
                                        />
                                    </div>
                                    {fieldErrors.color && <p className="text-red-500 text-xs mt-1">กรุณาเลือกสี</p>}
                                </div>

                                <div ref={fuelTypeRef}>
                                    <label className={`block text-sm font-medium mb-1.5 ${fieldErrors.fuelType ? 'text-red-600' : 'text-gray-700'}`}>เชื้อเพลิง <span className="text-red-500">*</span></label>
                                    <div className={fieldErrors.fuelType ? 'ring-2 ring-red-500 rounded-xl' : ''}>
                                        <SearchableSelect
                                            options={[
                                                { id: 'PETROL', label: 'Petrol (เบนซิน)' },
                                                { id: 'DIESEL', label: 'Diesel (ดีเซล)' },
                                                { id: 'HYBRID', label: 'Hybrid (ไฮบริด)' },
                                                { id: 'PLUGIN_HYBRID', label: 'Plug-in Hybrid (ปลั๊กอินไฮบริด)' },
                                                { id: 'EV', label: 'EV (ไฟฟ้า)' },
                                                { id: 'LPG', label: 'LPG' },
                                                { id: 'NGV', label: 'NGV' }
                                            ]}
                                            value={formData.fuelType}
                                            onChange={(value) => {
                                                setFieldErrors(prev => ({ ...prev, fuelType: false }));
                                                updateFormData({ fuelType: value as any });
                                            }}
                                            placeholder="เลือกประเภทเชื้อเพลิง"
                                            searchPlaceholder="ค้นหาเชื้อเพลิง..."
                                            emptyMessage="ไม่พบประเภทเชื้อเพลิง"
                                        />
                                    </div>
                                    {fieldErrors.fuelType && <p className="text-red-500 text-xs mt-1">กรุณาเลือกประเภทเชื้อเพลิง</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">ปีที่ผลิต <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={4}
                                        placeholder="เช่น 2020"
                                        className={`form-input ${fieldErrors.year ? 'border-red-500 ring-2 ring-red-500' : ''}`}
                                        value={formData.year || ''}
                                        onChange={(e) => {
                                            setFieldErrors(prev => ({ ...prev, year: false }));
                                            const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
                                            updateFormData({ year: parseInt(value) || 0 });
                                        }}
                                    />
                                    {fieldErrors.year && <p className="text-red-500 text-xs mt-1">กรุณากรอกปีที่ผลิต</p>}
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
                                        <Settings size={20} /> อัตโนมัติ
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
                            <div className="mb-8" ref={mileageRef}>
                                <label className={`block text-sm font-medium mb-1.5 ${fieldErrors.mileage ? 'text-red-600' : 'text-gray-700'}`}>เลขไมล์ (กม.) <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={formData.mileage ? formData.mileage.toLocaleString('en-US') : ''}
                                        onChange={(e) => {
                                            setFieldErrors(prev => ({ ...prev, mileage: false }));
                                            const value = e.target.value.replace(/,/g, '');
                                            if (value.length <= 6) {
                                                updateFormData({ mileage: parseInt(value) || 0 });
                                            }
                                        }}
                                        placeholder="เช่น 45,000"
                                        className={`form-input-icon font-medium ${fieldErrors.mileage ? 'border-red-500 ring-2 ring-red-500' : ''}`}
                                    />
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                        <Gauge size={20} />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">ขนาดเครื่องยนต์ (CC) (ไม่บังคับ)</label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        placeholder="เช่น 1500"
                                        className="form-input font-medium"
                                        value={formData.engineSize || ''}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                                            updateFormData({ engineSize: parseInt(value) || 0 });
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">จำนวนที่นั่ง (ไม่บังคับ)</label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        placeholder="เช่น 5"
                                        className="form-input font-medium"
                                        value={formData.seats || ''}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/\D/g, '').slice(0, 2);
                                            updateFormData({ seats: parseInt(value) || 0 });
                                        }}
                                    />
                                </div>
                            </div>



                            {/* Price Section */}
                            <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                                <DollarSign size={24} className="text-accent" /> หัวข้อและราคา
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
                                    className="form-textarea"
                                    value={formData.description}
                                    onChange={(e) => updateFormData({ description: e.target.value })}
                                />
                            </div>

                            {/* Price */}
                            <div className="mb-6" ref={priceRef}>
                                <label className={`block text-sm font-medium mb-1.5 ${fieldErrors.price ? 'text-red-600' : 'text-gray-700'}`}>ราคา (บาท) <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        placeholder="เช่น 650,000"
                                        className={`form-input-icon font-bold text-lg ${fieldErrors.price ? 'border-red-500 ring-2 ring-red-500' : ''}`}
                                        value={formData.price ? formData.price.toLocaleString('en-US') : ''}
                                        maxLength={14}
                                        onChange={(e) => {
                                            setFieldErrors(prev => ({ ...prev, price: false }));
                                            const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                                            const numValue = parseInt(value) || 0;
                                            updateFormData({ price: numValue });
                                        }}
                                    />
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">฿</div>
                                </div>
                                {fieldErrors.price && <p className="text-red-500 text-xs mt-1">กรุณาระบุราคา</p>}
                            </div>

                            {/* Location */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">จังหวัด <span className="text-red-500">*</span></label>
                                    <SearchableSelect
                                        options={PROVINCES.map(p => ({ id: p, label: p }))}
                                        value={formData.province}
                                        onChange={(value) => updateFormData({ province: value })}
                                        placeholder="เลือกจังหวัด"
                                        searchPlaceholder="ค้นหาจังหวัด..."
                                        emptyMessage="ไม่พบจังหวัด"
                                        icon={<MapPin size={20} />}
                                    />
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
                                <BookUser size={24} className="text-accent" /> ข้อมูลติดต่อ
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div ref={contactNameRef}>
                                    <label className={`block text-sm font-medium mb-1.5 ${fieldErrors.contactName ? 'text-red-600' : 'text-gray-700'}`}>ชื่อผู้ติดต่อ <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        placeholder="ชื่อ-นามสกุล หรือชื่อเล่น"
                                        className={`form-input ${fieldErrors.contactName ? 'border-red-500 ring-2 ring-red-500' : ''}`}
                                        value={formData.contactName}
                                        onChange={(e) => {
                                            setFieldErrors(prev => ({ ...prev, contactName: false }));
                                            updateFormData({ contactName: e.target.value });
                                        }}
                                    />
                                    {fieldErrors.contactName && <p className="text-red-500 text-xs mt-1">กรุณากรอกชื่อผู้ติดต่อ</p>}
                                </div>
                                <div ref={contactPhoneRef}>
                                    <label className={`block text-sm font-medium mb-1.5 ${fieldErrors.contactPhone ? 'text-red-600' : 'text-gray-700'}`}>เบอร์โทรติดต่อ <span className="text-red-500">*</span></label>
                                    <input
                                        type="tel"
                                        placeholder="08xxxxxxxx"
                                        className={`form-input ${fieldErrors.contactPhone ? 'border-red-500 ring-2 ring-red-500' : ''}`}
                                        value={formData.contactPhone}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                                            setFieldErrors(prev => ({ ...prev, contactPhone: false }));
                                            updateFormData({ contactPhone: value });
                                        }}
                                    />
                                    {fieldErrors.contactPhone && <p className="text-red-500 text-xs mt-1">กรุณากรอกเบอร์โทรติดต่อ</p>}
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
                                {!isBasicPackage && (
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
                                )}
                            </div>

                            {/* Vehicle Extras Section */}
                            <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                                <Lightbulb size={24} className="text-accent" /> ข้อมูลเพิ่มเติม
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

                                {/* Registration Book Image */}
                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <p className="font-medium text-gray-800 mb-1">📄 สำเนาเล่มทะเบียนรถ</p>
                                    <p className="text-xs text-gray-500 mb-3">หน้าที่มีชื่อเจ้าของรถ — ใช้ยืนยันความเป็นเจ้าของ</p>
                                    {regBookPreview ? (
                                        <div className="relative inline-block">
                                            <img
                                                src={regBookPreview}
                                                alt="สำเนาเล่มทะเบียน"
                                                className="w-48 h-36 object-cover rounded-lg border border-gray-200 cursor-zoom-in"
                                                onClick={openRegBookLightbox}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => { URL.revokeObjectURL(regBookPreview); setRegBookFile(null); setRegBookPreview(''); }}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                                            >✕</button>
                                        </div>
                                    ) : formData.registrationBookImage ? (
                                        <img
                                            src={formData.registrationBookImage}
                                            alt="สำเนาเล่มทะเบียน"
                                            className="w-48 h-36 object-cover rounded-lg border border-gray-200 cursor-zoom-in"
                                            onClick={openRegBookLightbox}
                                        />
                                    ) : (
                                        <label
                                            className={`flex items-center gap-3 px-5 py-4 bg-white border-2 border-dashed rounded-xl cursor-pointer transition text-gray-500 ${dragOverRegBook ? 'border-primary bg-blue-50' : 'border-gray-300 hover:border-primary hover:bg-blue-50'}`}
                                            onDragOver={(e) => { e.preventDefault(); setDragOverRegBook(true); }}
                                            onDragLeave={() => setDragOverRegBook(false)}
                                            onDrop={(e) => {
                                                e.preventDefault(); setDragOverRegBook(false);
                                                const file = Array.from(e.dataTransfer.files).find(f => f.type.startsWith('image/'));
                                                if (file) { setRegBookFile(file); setRegBookPreview(URL.createObjectURL(file)); }
                                            }}
                                        >
                                            <span className="text-2xl">📄</span>
                                            <div>
                                                <span className="font-medium text-gray-700 block">{dragOverRegBook ? 'วางรูปที่นี่' : 'คลิกหรือลากรูปมาวาง'}</span>
                                                <span className="text-xs text-gray-400">รองรับ JPG, PNG</span>
                                            </div>
                                            <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) { setRegBookFile(file); setRegBookPreview(URL.createObjectURL(file)); }
                                            }} />
                                        </label>
                                    )}
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
                                            <Loader2 size={20} className="animate-spin" />
                                            กำลังบันทึก...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={20} />
                                            บันทึก
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
                                    <ImageIcon size={18} />
                                    <span className="font-bold text-sm">ตัวอย่างประกาศ</span>
                                </div>
                            </div>

                            {/* Preview Card */}
                            <PreviewCard
                                title={formData.title || (formData.brand && formData.model ? `${formData.brand} ${formData.model}` : undefined)}
                                price={formData.price}
                                vehicleType={formData.vehicleType}
                                year={formData.year || new Date().getFullYear()}
                                mileage={formData.mileage}
                                fuelType={formData.fuelType}
                                province={formData.province}
                                imageUrl={displayImages[0]?.url}
                                sellerName={(listing as any)?.user?.sellerProfile?.shopName || listing?.user?.fullName || 'ผู้ขาย'}
                                sellerLogo={(listing as any)?.user?.sellerProfile?.shopLogo}
                                viewCount={(listing as any)?.viewCount || 0}
                            />

                            {/* Tips */}
                            <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100">
                                <h3 className="font-bold text-primary mb-3 flex items-center gap-2 text-sm">
                                    <Lightbulb className="text-yellow-500" size={18} /> Tips ขายไว
                                </h3>
                                <ul className="space-y-3 text-xs text-gray-600">
                                    <li className="flex gap-2 items-start">
                                        <CheckCircle className="text-green-500 mt-0.5 min-w-[14px]" size={14} />
                                        <span className="leading-snug">ระบุเลขไมล์ตามจริง</span>
                                    </li>
                                    <li className="flex gap-2 items-start">
                                        <CheckCircle className="text-green-500 mt-0.5 min-w-[14px]" size={14} />
                                        <span className="leading-snug">อัพโหลดรูปภาพคุณภาพดี</span>
                                    </li>
                                    <li className="flex gap-2 items-start">
                                        <CheckCircle className="text-green-500 mt-0.5 min-w-[14px]" size={14} />
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
