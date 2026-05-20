"use client";

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    ArrowLeft,
    Car as CarIcon,
    Settings,
    GitCommit,
    Gauge,
    Bot,
    Wand2,
    ArrowRight,
    ChevronLeft,
    ChevronRight,
    Lightbulb,
    CheckCircle,
    ImageIcon,
    Plus,
    X,
    CircleDollarSign,
    MapPin,
    Loader2,
    Check,
    Bike,
    Car,
    Droplet,
    Palette,
    FileText,
    AlertCircle,
    BookUser,
    ShoppingBag,
} from 'lucide-react';
import PreviewCard from '@/components/PreviewCard';
import SlotPurchaseModal from '@/components/SlotPurchaseModal';
import SearchableSelect, { SelectOption } from '@/components/SearchableSelect';
import BrandSelectionModal from '@/components/BrandSelectionModal';
import { ListingProvider, useListingForm, createListing, uploadListingImages, uploadServiceHistoryImage, uploadRegistrationBookImage, publishListing, UpgradeRequiredError, type ListingFormData } from '@/contexts/ListingContext';
import { MOTORCYCLE_ENABLED, PACKAGES_ENABLED, LISTING_EXTRA_SECTIONS_ENABLED } from '@/lib/featureFlags';
import LoginModal from '@/components/LoginModal';
import RegisterModal from '@/components/RegisterModal';
import {
    saveTextDraft,
    saveImageDraft,
    setResumeFlag,
    getResumeFlag,
    clearResumeFlag,
    clearListingDraft,
} from '@/lib/listingDraft';

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

// Auth helper
function getAuthToken(): string | null {
    const stored = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (!stored) return null;
    try { return JSON.parse(stored).token || null; } catch { return null; }
}

/**
 * Re-materialize a File so its bytes live in JS memory instead of being a
 * snapshot reference to a file on disk.
 *
 * Why this matters: on iOS Safari, a File from <input type="file"> (or
 * restored from IndexedDB) is a *snapshot reference* — not the bytes. The
 * OS can invalidate that snapshot any time (memory pressure, app-switch,
 * BFCache restore, or just elapsed time), after which `file.arrayBuffer()`
 * throws `DOMException: NotFoundError: The object can not be found here.`
 * surfacing as a confusing English error at publish time.
 *
 * Eager-copying the bytes at selection time produces a memory-backed Blob
 * that can't be evicted, eliminating the root cause.
 */
async function materializeFile(file: File): Promise<File> {
    const buf = await file.arrayBuffer();
    return new File([buf], file.name, {
        type: file.type,
        lastModified: file.lastModified,
    });
}

// ListingProvider lives here (not a /sell/layout) so it scopes ONLY to the
// create form — /sell/estimate and /sell/edit/[id] must not inherit the
// draft auto-save / rehydrate side-effects.
export default function CreateListingPageWrapper() {
    return (
        <ListingProvider>
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                <CreateListingPage />
            </Suspense>
        </ListingProvider>
    );
}

/**
 * Full-screen image viewer for the step-2 photo grid.
 *  - Swipe horizontally to navigate (touch threshold 50px) — hard cut, no animation
 *  - Buttons + arrow keys for navigation, X / backdrop tap / Escape to close
 *  - Locks body scroll while open; respects iOS safe-area at the top
 *  - Pure presentational; index state lives in the parent.
 */
function ImageLightbox({
    images,
    index,
    onClose,
    onIndexChange,
}: {
    images: string[];
    index: number;
    onClose: () => void;
    onIndexChange: (i: number) => void;
}) {
    const touchStartX = useRef<number | null>(null);
    const touchEndX = useRef<number | null>(null);

    const goPrev = useCallback(() => {
        onIndexChange(index === 0 ? images.length - 1 : index - 1);
    }, [index, images.length, onIndexChange]);

    const goNext = useCallback(() => {
        onIndexChange(index === images.length - 1 ? 0 : index + 1);
    }, [index, images.length, onIndexChange]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            else if (e.key === 'ArrowLeft') goPrev();
            else if (e.key === 'ArrowRight') goNext();
        };
        window.addEventListener('keydown', handler);
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', handler);
            document.body.style.overflow = prevOverflow;
        };
    }, [onClose, goPrev, goNext]);

    const hasMany = images.length > 1;

    return (
        <div className="fixed inset-0 z-[110] bg-black/95 flex items-center justify-center">
            {/* Tap on the backdrop (anything that isn't the image / buttons) closes */}
            <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

            {/* Counter */}
            <div
                className="absolute left-1/2 -translate-x-1/2 text-white/85 text-sm font-medium z-10 pointer-events-none"
                style={{ top: 'calc(1rem + env(safe-area-inset-top))' }}
            >
                {index + 1} / {images.length}
            </div>

            {/* Close */}
            <button
                type="button"
                onClick={onClose}
                aria-label="ปิด"
                className="absolute right-3 w-11 h-11 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center backdrop-blur transition z-10 active:scale-95"
                style={{ top: 'calc(0.75rem + env(safe-area-inset-top))' }}
            >
                <X size={22} />
            </button>

            {/* Prev (only when multiple images) */}
            {hasMany && (
                <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); goPrev(); }}
                    aria-label="รูปก่อนหน้า"
                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center backdrop-blur transition z-10 active:scale-95"
                >
                    <ChevronLeft size={26} />
                </button>
            )}

            {/* Image */}
            <img
                src={images[index]}
                alt={`รูปที่ ${index + 1}`}
                draggable={false}
                onClick={(e) => e.stopPropagation()}
                onTouchStart={(e) => {
                    touchStartX.current = e.changedTouches[0].clientX;
                    touchEndX.current = e.changedTouches[0].clientX;
                }}
                onTouchMove={(e) => {
                    touchEndX.current = e.changedTouches[0].clientX;
                }}
                onTouchEnd={() => {
                    if (touchStartX.current === null || touchEndX.current === null) return;
                    const delta = touchEndX.current - touchStartX.current;
                    if (Math.abs(delta) > 50 && hasMany) {
                        if (delta > 0) goPrev();
                        else goNext();
                    }
                    touchStartX.current = null;
                    touchEndX.current = null;
                }}
                className="relative max-w-[92vw] max-h-[80vh] object-contain select-none touch-pan-y"
            />

            {/* Next */}
            {hasMany && (
                <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); goNext(); }}
                    aria-label="รูปถัดไป"
                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center backdrop-blur transition z-10 active:scale-95"
                >
                    <ChevronRight size={26} />
                </button>
            )}
        </div>
    );
}

function CreateListingPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { formData, updateFormData, currentStep, setCurrentStep, listingId, setListingId, isSubmitting, setIsSubmitting } = useListingForm();
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [showSlotModal, setShowSlotModal] = useState(false);
    const [upgradeMessage, setUpgradeMessage] = useState('');
    const [user, setUser] = useState<{ id: string; fullName?: string } | null>(null);

    // Latest formData without making auth effects re-subscribe.
    const formDataRef = useRef(formData);
    formDataRef.current = formData;

    // Guest-friendly publish flow: login modal + post-login confirm overlay
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [showResumeConfirm, setShowResumeConfirm] = useState(false);
    // Step-2 image lightbox (null = closed)
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    // Refs for scroll-to-error
    const brandRef = useRef<HTMLDivElement>(null);
    const modelRef = useRef<HTMLDivElement>(null);
    const colorRef = useRef<HTMLDivElement>(null);
    const mileageRef = useRef<HTMLDivElement>(null);
    const imagesRef = useRef<HTMLDivElement>(null);
    const priceRef = useRef<HTMLDivElement>(null);
    const provinceRef = useRef<HTMLDivElement>(null);
    const bodyTypeRef = useRef<HTMLDivElement>(null);
    const fuelTypeRef = useRef<HTMLDivElement>(null);
    const yearRef = useRef<HTMLDivElement>(null);
    const contactNameRef = useRef<HTMLDivElement>(null);
    const contactPhoneRef = useRef<HTMLDivElement>(null);

    // Master data states
    const [brands, setBrands] = useState<Brand[]>([]);
    const [models, setModels] = useState<VehicleModel[]>([]);
    const [subModels, setSubModels] = useState<SubModel[]>([]);
    const [loadingBrands, setLoadingBrands] = useState(false);
    const [loadingModels, setLoadingModels] = useState(false);
    const [loadingSubModels, setLoadingSubModels] = useState(false);
    const [selectedBrandId, setSelectedBrandId] = useState<string>('');
    const [selectedModelId, setSelectedModelId] = useState<string>('');
    const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
    const [bodyStyleOptions, setBodyStyleOptions] = useState<{ value: string; label: string }[]>([]);
    const [motorcycleBodyOptions, setMotorcycleBodyOptions] = useState<{ value: string; label: string }[]>([]);
    const [maxPhotos, setMaxPhotos] = useState(16);
    const [isBasicPackage, setIsBasicPackage] = useState(true);
    const [limitReached, setLimitReached] = useState(false);

    const errorRef = useRef<HTMLDivElement>(null);

    // Drag & drop states
    const [dragOverPhotos, setDragOverPhotos] = useState(false);
    const [dragOverServiceHistory, setDragOverServiceHistory] = useState(false);
    const [dragOverRegBook, setDragOverRegBook] = useState(false);

    // Scroll to error when it appears
    useEffect(() => {
        if (error && errorRef.current) {
            errorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [error]);

    // Load logged-in user (if any). Guests are allowed to fill the ENTIRE
    // form — login is only required at the publish step. Re-runs on the
    // `userLogin` event so an in-page (email) login resumes seamlessly.
    useEffect(() => {
        const loadUser = () => {
            const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
            if (!storedUser) {
                setUser(null);
                return;
            }
            let userData: { id: string; fullName?: string; phoneNumber?: string };
            try {
                userData = JSON.parse(storedUser);
            } catch {
                setUser(null);
                return;
            }
            setUser(userData);

            // Pre-fill contact from account — never overwrite guest input
            // (read latest formData via ref to avoid stale-closure bugs).
            const fillUpdates: Partial<ListingFormData> = {};
            if (!formDataRef.current.contactName && userData.fullName) {
                fillUpdates.contactName = userData.fullName;
            }
            if (!formDataRef.current.contactPhone && userData.phoneNumber) {
                fillUpdates.contactPhone = userData.phoneNumber;
            }
            if (Object.keys(fillUpdates).length > 0) updateFormData(fillUpdates);

            // Fetch package info & check listing limit (logged-in only)
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
            const token = getAuthToken();
            Promise.all([
                fetch(`${API_URL}/packages/my`, {
                    headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
                }).then(r => r.json()),
                fetch(`${API_URL}/listings/user/${userData.id}`).then(r => r.json()),
            ]).then(([pkgData, listingsData]) => {
                const pkg = pkgData.currentPackage;
                setMaxPhotos(pkg?.maxPhotosPerListing ?? 16);
                setIsBasicPackage(!pkg || pkg.slug === 'basic');

                // Check listing limit — ใช้ effective max (package + bonus slot) จาก usage
                const packageMax = pkg?.maxListings ?? -1;
                const bonusSlots = pkgData.usage?.bonusListingSlots ?? 0;
                const effectiveMax = pkgData.usage?.maxListings ?? (packageMax === -1 ? -1 : packageMax + bonusSlots);
                const activeCount = pkgData.usage?.activeListings ?? (listingsData.listings || []).filter(
                    (l: any) => ['ACTIVE', 'DRAFT', 'PENDING'].includes(l.status)
                ).length;
                if (effectiveMax !== -1 && activeCount >= effectiveMax) {
                    setLimitReached(true);
                    const bonusText = bonusSlots > 0 ? ` (แพ็กเกจ ${packageMax} + slot ${bonusSlots})` : '';
                    setUpgradeMessage(PACKAGES_ENABLED
                        ? `แพ็กเกจ ${pkg?.name || 'Basic'} ลงประกาศได้สูงสุด ${effectiveMax} รายการ${bonusText} กรุณาอัพเกรดแพ็กเกจหรือซื้อ slot เพิ่มเพื่อลงประกาศเพิ่มเติม`
                        : `คุณลงประกาศครบ ${effectiveMax} รายการแล้ว กรุณาลบหรือปิดประกาศเดิมก่อนจึงจะลงประกาศใหม่ได้`);
                    setShowUpgradeModal(true);
                }
            }).catch(() => {});
        };

        loadUser();
        window.addEventListener('userLogin', loadUser);
        return () => window.removeEventListener('userLogin', loadUser);
    }, []);

    // After login (email in-page OR returning from a full-page OAuth
    // redirect) auto-open the one-click publish confirmation — but only if
    // the guest had actually pressed "ลงประกาศ" (resume flag / ?resume).
    useEffect(() => {
        if (!user || isSubmitting || limitReached) return;
        const wantsResume = searchParams.get('resume') === 'publish' || getResumeFlag();
        if (wantsResume) setShowResumeConfirm(true);
    }, [user, searchParams, isSubmitting, limitReached]);

    // Pre-fill from estimate page query params
    useEffect(() => {
        const brand = searchParams.get('brand');
        const model = searchParams.get('model');
        const year = searchParams.get('year');
        const price = searchParams.get('price');
        const mileageParam = searchParams.get('mileage');

        const updates: Partial<ListingFormData> = {};
        if (brand && !formData.brand) updates.brand = brand;
        if (model && !formData.model) updates.model = model;
        if (year && !formData.year) updates.year = parseInt(year);
        if (price && !formData.price) updates.price = parseInt(price);
        if (mileageParam && !formData.mileage) updates.mileage = parseInt(mileageParam);

        if (Object.keys(updates).length > 0) {
            updateFormData(updates);
        }
    }, [searchParams]);

    useEffect(() => {
        const fetchBrands = async () => {
            setLoadingBrands(true);
            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
                const response = await fetch(`${API_URL}/master-data/brands?vehicleType=${formData.vehicleType}`);
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

        fetchBrands();
        fetchOptions();

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
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
                const response = await fetch(`${API_URL}/master-data/brands/${selectedBrandId}/models`);
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
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
                const response = await fetch(`${API_URL}/master-data/models/${selectedModelId}/sub-models`);
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

    // Handle image upload (from input or drop). Async because we eager-copy
    // each File into an in-memory Blob right now — see materializeFile().
    const handleImageFiles = async (files: File[]) => {
        const currentTotal = formData.images.length;
        const remainingSlots = maxPhotos - currentTotal;

        if (remainingSlots <= 0) {
            setError(`คุณสามารถอัพโหลดรูปภาพได้สูงสุด ${maxPhotos} รูป`);
            return;
        }

        let fileArray = files.filter(f => f.type.startsWith('image/'));
        if (fileArray.length > remainingSlots) {
            setError(`เพิ่มรูปภาพได้อีกเพียง ${remainingSlots} รูป (ครบจำนวนสูงสุด ${maxPhotos} รูปแล้ว)`);
            fileArray = fileArray.slice(0, remainingSlots);
        } else {
            setError(null);
        }

        // Eager-copy to memory NOW so iOS Safari can't invalidate the
        // snapshot before publish. arrayBuffer() at this moment (right after
        // user picked the file) is the safest time to do it.
        let materialized: File[];
        try {
            materialized = await Promise.all(fileArray.map(materializeFile));
        } catch {
            setError('ไม่สามารถอ่านไฟล์รูปได้ กรุณาเลือกใหม่อีกครั้ง');
            return;
        }

        const newPreviews = materialized.map(file => URL.createObjectURL(file));

        updateFormData({
            images: [...formData.images, ...materialized],
            imagesPreviews: [...formData.imagesPreviews, ...newPreviews]
        });
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;
        handleImageFiles(Array.from(files));
        e.target.value = '';
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
            if (!formData.year || formData.year === 0) {
                errors.year = true;
                missingFields.push('ปีที่ผลิต');
            }
            if (!formData.mileage) {
                errors.mileage = true;
                missingFields.push('เลขไมล์');
            }
            if (!formData.bodyType) {
                errors.bodyType = true;
                missingFields.push('รูปแบบรถ');
            }

            if (Object.keys(errors).length > 0) {
                setFieldErrors(errors);
                setError(`กรุณากรอกข้อมูลให้ครบ: ${missingFields.join(', ')}`);

                // Scroll to first error field
                const firstErrorRef = errors.brand ? brandRef
                    : errors.model ? modelRef
                        : errors.color ? colorRef
                            : errors.year ? yearRef
                                : errors.mileage ? mileageRef
                                    : errors.bodyType ? bodyTypeRef
                                        : null;

                if (firstErrorRef?.current) {
                    firstErrorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                return;
            }
            setCurrentStep(2);
        } else if (currentStep === 2) {
            // Validate step 2 - images + registration book
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

    // Scroll to top whenever step changes (reliable across mobile browsers)
    useEffect(() => {
        if (typeof window === 'undefined') return;
        requestAnimationFrame(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
        });
    }, [currentStep]);

    // Handle form submission
    const handleSubmit = async () => {
        setFieldErrors({});

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

        if (!formData.contactName) {
            errors.contactName = true;
            missingFields.push('ชื่อผู้ติดต่อ');
        }

        if (!formData.contactPhone) {
            errors.contactPhone = true;
            missingFields.push('เบอร์โทรติดต่อ');
        }

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            setError(`กรุณากรอกข้อมูลให้ครบ: ${missingFields.join(', ')}`);

            // Scroll to first error field
            const firstErrorRef = errors.price ? priceRef
                : errors.province ? provinceRef
                    : errors.contactName ? contactNameRef
                        : errors.contactPhone ? contactPhoneRef
                            : null;

            if (firstErrorRef?.current) {
                firstErrorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        // Guest reached publish with a valid form → require login here.
        // Force-flush the draft (context auto-save is debounced) so it
        // survives a full-page OAuth redirect, then open the login modal.
        if (!user) {
            saveTextDraft(formData);
            await saveImageDraft({
                images: formData.images,
                serviceHistoryFile: formData.serviceHistoryFile,
                registrationBookFile: formData.registrationBookFile,
            });
            setResumeFlag();
            setShowResumeConfirm(false);
            setShowLoginModal(true);
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            // Step 1: Create listing
            const placeholderTitle = [formData.year, formData.brand, formData.model, formData.subModel]
                .filter(Boolean)
                .join(' ');
            const title = formData.title || placeholderTitle;
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

            // Step 2.6: Upload registration book image (if any)
            if (formData.registrationBookFile) {
                await uploadRegistrationBookImage(user.id, newListingId, formData.registrationBookFile);
            }

            // Step 3: Publish
            await publishListing(user.id, newListingId, formData.price);

            // Success — clear the persisted draft so it can't resurrect
            clearResumeFlag();
            setShowResumeConfirm(false);
            await clearListingDraft();
            router.push(`/profile/listings`);
        } catch (err) {
            if (err instanceof UpgradeRequiredError) {
                setUpgradeMessage(err.message);
                setShowUpgradeModal(true);
            } else {
                setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
            }
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
                                        {currentStep > step.num ? <Check size={20} /> : step.num}
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
                    <div ref={errorRef} className="mb-6 flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
                        <AlertCircle className="text-xl flex-shrink-0" />
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
                                        <Car size={24} className="text-accent" /> ระบุข้อมูลรถของคุณ
                                    </h2>

                                    {/* Vehicle Type Toggle — hidden while MOTORCYCLE_ENABLED=false */}
                                    {MOTORCYCLE_ENABLED && (
                                        <div className="mb-6">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">ประเภทยานพาหนะ</label>
                                            <div className="grid grid-cols-2 gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => updateFormData({ vehicleType: 'CAR', brand: '', model: '', bodyType: '' })}
                                                    className={`form-button ${formData.vehicleType === 'CAR' ? 'form-button-active' : 'form-button-inactive'}`}
                                                >
                                                    <Car size={20} /> รถยนต์
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => updateFormData({ vehicleType: 'MOTORCYCLE', brand: '', model: '', bodyType: '' })}
                                                    className={`form-button ${formData.vehicleType === 'MOTORCYCLE' ? 'form-button-active' : 'form-button-inactive'}`}
                                                >
                                                    <Bike size={20} /> มอเตอร์ไซค์
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                                        <div className="md:col-span-2" ref={brandRef}>
                                            <label className={`block text-sm font-medium mb-1.5 ${fieldErrors.brand ? 'text-red-600' : 'text-gray-700'}`}>ยี่ห้อ <span className="text-red-500">*</span></label>

                                            {/* Brand Selection Trigger */}
                                            <button
                                                type="button"
                                                onClick={() => setIsBrandModalOpen(true)}
                                                className={`w-full h-14 px-4 border rounded-2xl flex items-center justify-between transition-all bg-white hover:border-primary group ${fieldErrors.brand ? 'border-red-500 bg-red-50' : 'border-gray-200 shadow-sm'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    {formData.brand ? (
                                                        <>
                                                            <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden">
                                                                {brands.find(b => b.name === formData.brand)?.logo ? (
                                                                    <img
                                                                        src={brands.find(b => b.name === formData.brand)?.logo || ''}
                                                                        alt={formData.brand}
                                                                        className="w-8 h-8 object-contain"
                                                                    />
                                                                ) : (
                                                                    <span className="font-bold text-gray-400">{formData.brand[0]}</span>
                                                                )}
                                                            </div>
                                                            <div className="text-left">
                                                                <div className="font-bold text-gray-800">{formData.brand}</div>
                                                                <div className="text-xs text-gray-400">{brands.find(b => b.name === formData.brand)?.nameTh}</div>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                                                <Car size={24} className="text-gray-300" />
                                                            </div>
                                                            <span className="text-gray-400 text-lg">เลือกยี่ห้อรถ</span>
                                                        </>
                                                    )}
                                                </div>
                                                <div className={`p-2 rounded-xl group-hover:bg-blue-50 transition-colors ${formData.brand ? 'text-primary' : 'text-gray-300'}`}>
                                                    <ArrowRight size={20} />
                                                </div>
                                            </button>

                                            {/* Brand Selection Modal */}
                                            <BrandSelectionModal
                                                isOpen={isBrandModalOpen}
                                                onClose={() => setIsBrandModalOpen(false)}
                                                brands={brands}
                                                selectedBrandId={selectedBrandId}
                                                loading={loadingBrands}
                                                onSelect={(brand) => {
                                                    setSelectedBrandId(brand.id);
                                                    setSelectedModelId('');
                                                    setFieldErrors(prev => ({ ...prev, brand: false }));
                                                    updateFormData({
                                                        brand: brand.name,
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
                                                    setIsBrandModalOpen(false);
                                                }}
                                            />

                                            {fieldErrors.brand && <p className="text-red-500 text-xs mt-1 ml-1 font-medium">กรุณาเลือกยี่ห้อ</p>}
                                        </div>

                                        <div ref={modelRef}>
                                            <label className={`block text-sm font-medium mb-1.5 ${fieldErrors.model ? 'text-red-600' : 'text-gray-700'}`}>รุ่น <span className="text-red-500">*</span></label>
                                            <div className={fieldErrors.model ? 'ring-2 ring-red-500 rounded-xl' : ''}>
                                                <SearchableSelect
                                                    options={models.map(m => ({
                                                        id: m.id,
                                                        label: m.name,
                                                        subLabel: m.bodyType || undefined,
                                                        isPopular: m.isPopular
                                                    }))}
                                                    value={selectedModelId || formData.model}
                                                    onChange={(id, option) => {
                                                        setSelectedModelId(id);
                                                        setFieldErrors(prev => ({ ...prev, model: false }));
                                                        const model = models.find(m => m.id === id);
                                                        updateFormData({
                                                            model: option?.label || id,
                                                            subModel: '',
                                                            bodyType: model?.bodyType || formData.bodyType
                                                        });
                                                    }}
                                                    placeholder={!selectedBrandId ? "เลือกยี่ห้อก่อน" : "เลือกรุ่น"}
                                                    searchPlaceholder="พิมพ์ชื่อรุ่น..."
                                                    loading={loadingModels}
                                                    disabled={!selectedBrandId && !formData.brand}
                                                    emptyMessage="ไม่พบรุ่นที่ค้นหา (สามารถพิมพ์เพื่อใช้ชื่อที่ต้องการได้)"
                                                    allowCustom={true}
                                                    customLabel="ใช้ชื่อรุ่น '{search}'"
                                                />
                                            </div>
                                            {fieldErrors.model && <p className="text-red-500 text-xs mt-1">กรุณาเลือกรุ่น</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">รุ่นย่อย (ถ้ามี)</label>
                                            <SearchableSelect
                                                options={subModels.map(s => ({
                                                    id: s.id,
                                                    label: s.name,
                                                    subLabel: s.engineSize ? `${s.engineSize}cc` : undefined
                                                }))}
                                                value={subModels.find(s => s.name === formData.subModel)?.id || formData.subModel || ''}
                                                onChange={(id, option) => {
                                                    const subModel = subModels.find(s => s.id === id);
                                                    updateFormData({
                                                        subModel: option?.label || id,
                                                        ...(subModel?.engineSize && { engineSize: subModel.engineSize }),
                                                        ...(subModel?.fuelType && { fuelType: subModel.fuelType as 'PETROL' | 'DIESEL' | 'HYBRID' | 'PLUGIN_HYBRID' | 'EV' | 'LPG' | 'NGV' }),
                                                        ...(subModel?.transmission && { transmission: subModel.transmission as 'AUTOMATIC' | 'MANUAL' | 'CVT' | 'DCT' | 'SEMI_AUTO' })
                                                    });
                                                }}
                                                placeholder="เลือกรุ่นย่อย (ไม่บังคับ)"
                                                searchPlaceholder="พิมพ์ชื่อรุ่นย่อย..."
                                                loading={loadingSubModels}
                                                disabled={!selectedModelId && !formData.model}
                                                emptyMessage="ไม่พบรุ่นย่อย (สามารถพิมพ์เพื่อใช้ชื่อที่ต้องการได้)"
                                                allowCustom={true}
                                                customLabel="ใช้ชื่อรุ่นย่อย '{search}'"
                                            />
                                        </div>

                                        <div ref={bodyTypeRef}>
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

                                        <div ref={colorRef}>
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

                                        <div ref={yearRef}>
                                            <label className={`block text-sm font-medium mb-1.5 ${fieldErrors.year ? 'text-red-600' : 'text-gray-700'}`}>ปีที่ผลิต <span className="text-red-500">*</span></label>
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

                                        <div ref={fuelTypeRef}>
                                            <label className="block text-sm font-medium mb-1.5 text-gray-700">เชื้อเพลิง</label>
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
                                                onChange={(value) => updateFormData({ fuelType: value as any })}
                                                placeholder="เลือกประเภทเชื้อเพลิง"
                                                searchPlaceholder="ค้นหาเชื้อเพลิง..."
                                                emptyMessage="ไม่พบประเภทเชื้อเพลิง"
                                            />
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
                                            <div className={`absolute left-3 top-1/2 -translate-y-1/2 ${fieldErrors.mileage ? 'text-red-500' : 'text-gray-400'}`}>
                                                <Gauge size={20} />
                                            </div>
                                        </div>
                                        {fieldErrors.mileage && <p className="text-red-500 text-xs mt-1">กรุณากรอกเลขไมล์</p>}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">ขนาดเครื่องยนต์ (CC)</label>
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                placeholder="เช่น 1500"
                                                className="form-input font-medium"
                                                value={formData.engineSize || ''}
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                                                    updateFormData({ engineSize: parseInt(value) || undefined });
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">จำนวนที่นั่ง</label>
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                placeholder="เช่น 5"
                                                className="form-input font-medium"
                                                value={formData.seats || ''}
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/\D/g, '').slice(0, 2);
                                                    updateFormData({ seats: parseInt(value) || undefined });
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Vehicle Extras — hidden via LISTING_EXTRA_SECTIONS_ENABLED to shorten the flow */}
                                    {LISTING_EXTRA_SECTIONS_ENABLED && (<>
                                    <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                                        <Lightbulb size={24} className="text-accent" /> ข้อมูลเพิ่มเติม
                                    </h3>
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
                                                <label
                                                    className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition ${dragOverServiceHistory ? 'border-primary bg-blue-50' : 'border-gray-300 hover:border-primary'}`}
                                                    onDragOver={(e) => { e.preventDefault(); setDragOverServiceHistory(true); }}
                                                    onDragLeave={() => setDragOverServiceHistory(false)}
                                                    onDrop={(e) => {
                                                        e.preventDefault(); setDragOverServiceHistory(false);
                                                        const file = Array.from(e.dataTransfer.files).find(f => f.type.startsWith('image/'));
                                                        if (file) { updateFormData({ serviceHistoryFile: file, serviceHistoryPreview: URL.createObjectURL(file) }); }
                                                    }}
                                                >
                                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                        <svg className="w-8 h-8 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        <p className="text-xs text-gray-500">{dragOverServiceHistory ? 'วางรูปที่นี่' : 'คลิกหรือลากรูปมาวาง'}</p>
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
                                    </>)}
                                </>
                            )}

                            {/* Step 2: Images */}
                            {currentStep === 2 && (
                                <>
                                    <h2 ref={imagesRef} className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
                                        <ImageIcon size={24} className="text-accent" /> อัพโหลดรูปภาพ
                                        <span className="ml-auto text-sm font-medium text-gray-400">
                                            {formData.images.length}/{maxPhotos} รูป
                                        </span>
                                    </h2>

                                    <p className="text-gray-500 mb-6">
                                        อัพโหลดรูปภาพรถของคุณ (อย่างน้อย 1 รูป, สูงสุด {maxPhotos} รูป) รูปแรกจะเป็นรูปหลักในการแสดงผล
                                    </p>

                                    {/* Image Upload Area */}
                                    <div
                                        className={`grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 -m-4 rounded-2xl transition-colors ${dragOverPhotos ? 'bg-blue-50 ring-2 ring-primary ring-dashed' : ''}`}
                                        onDragOver={(e) => { e.preventDefault(); setDragOverPhotos(true); }}
                                        onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOverPhotos(false); }}
                                        onDrop={(e) => { e.preventDefault(); setDragOverPhotos(false); handleImageFiles(Array.from(e.dataTransfer.files)); }}
                                    >
                                        {formData.imagesPreviews.map((preview, index) => (
                                            <div key={index} className="relative aspect-[4/3] rounded-xl overflow-hidden border-2 border-gray-200">
                                                <img
                                                    src={preview}
                                                    alt={`Preview ${index + 1}`}
                                                    onClick={() => setLightboxIndex(index)}
                                                    className="w-full h-full object-cover cursor-pointer"
                                                />
                                                {index === 0 && (
                                                    <span className="absolute top-2 left-2 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded pointer-events-none">
                                                        รูปหลัก
                                                    </span>
                                                )}
                                                {/* Always visible (no hover-gating) so mobile users can
                                                    actually tap it; sized 32px with a 4px corner offset for
                                                    a comfortable tap target without crowding the image. */}
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(index)}
                                                    aria-label={`ลบรูปที่ ${index + 1}`}
                                                    className="absolute top-1.5 right-1.5 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md active:scale-95 transition"
                                                >
                                                    <X size={14} strokeWidth={2.5} />
                                                </button>
                                            </div>
                                        ))}

                                        {formData.images.length < maxPhotos && (
                                            <label className={`aspect-[4/3] rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition ${dragOverPhotos ? 'border-primary bg-blue-100' : 'border-gray-300 hover:border-primary hover:bg-blue-50'}`}>
                                                <Plus size={32} className="text-gray-400 mb-2" />
                                                <span className="text-xs text-gray-500">{dragOverPhotos ? 'วางรูปที่นี่' : 'เพิ่มรูป'}</span>
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
                                            <Lightbulb className="text-yellow-500" /> เคล็ดลับถ่ายรูปให้ขายได้เร็ว
                                        </h4>
                                        <ul className="text-sm text-gray-600 space-y-1">
                                            <li>• ถ่ายรูปด้านหน้า, หลัง, ข้างซ้าย, ข้างขวา</li>
                                            <li>• ถ่ายภายในรถ, แผงหน้าปัด, เบาะ</li>
                                            <li>• ถ่ายเลขไมล์บนหน้าปัด</li>
                                            <li>• ใช้แสงธรรมชาติให้เพียงพอ</li>
                                        </ul>
                                    </div>

                                    {/* Registration Book — hidden via LISTING_EXTRA_SECTIONS_ENABLED */}
                                    {LISTING_EXTRA_SECTIONS_ENABLED && (
                                    <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
                                        <h3 className="font-bold text-gray-800 mb-1 flex items-center gap-2">
                                            📄 สำเนาเล่มทะเบียนรถ (หน้าที่มีชื่อเจ้าของ)
                                            <span className="text-xs font-normal text-gray-400">(ไม่บังคับ)</span>
                                        </h3>
                                        <p className="text-sm text-gray-500 mb-4">
                                            อัพโหลดเพิ่มเติมเพื่อช่วยยืนยันความเป็นเจ้าของรถและเพิ่มความน่าเชื่อถือให้ประกาศ
                                        </p>
                                        {formData.registrationBookPreview ? (
                                            <div className="relative inline-block">
                                                <img
                                                    src={formData.registrationBookPreview}
                                                    alt="สำเนาเล่มทะเบียน"
                                                    className="w-48 h-36 object-cover rounded-lg border border-gray-200"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (formData.registrationBookPreview) {
                                                            URL.revokeObjectURL(formData.registrationBookPreview);
                                                        }
                                                        updateFormData({
                                                            registrationBookFile: undefined,
                                                            registrationBookPreview: ''
                                                        });
                                                    }}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ) : (
                                            <label
                                                className={`flex items-center gap-3 px-5 py-4 bg-white border-2 border-dashed rounded-xl cursor-pointer transition text-gray-500 ${dragOverRegBook ? 'border-primary bg-blue-50' : 'border-gray-300 hover:border-primary hover:bg-blue-50'}`}
                                                onDragOver={(e) => { e.preventDefault(); setDragOverRegBook(true); }}
                                                onDragLeave={() => setDragOverRegBook(false)}
                                                onDrop={(e) => {
                                                    e.preventDefault(); setDragOverRegBook(false);
                                                    const file = Array.from(e.dataTransfer.files).find(f => f.type.startsWith('image/'));
                                                    if (file) { updateFormData({ registrationBookFile: file, registrationBookPreview: URL.createObjectURL(file) }); }
                                                }}
                                            >
                                                <span className="text-2xl">📄</span>
                                                <div>
                                                    <span className="font-medium text-gray-700 block">{dragOverRegBook ? 'วางรูปที่นี่' : 'คลิกหรือลากรูปมาวาง'}</span>
                                                    <span className="text-xs text-gray-400">รองรับ JPG, PNG</span>
                                                </div>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            const preview = URL.createObjectURL(file);
                                                            updateFormData({
                                                                registrationBookFile: file,
                                                                registrationBookPreview: preview
                                                            });
                                                        }
                                                    }}
                                                />
                                            </label>
                                        )}
                                    </div>
                                    )}
                                </>
                            )}

                            {/* Step 3: Price & Contact */}
                            {currentStep === 3 && (
                                <>
                                    <h2 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
                                        <CircleDollarSign size={24} className="text-accent" /> หัวข้อและราคา
                                    </h2>

                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">หัวข้อประกาศ</label>
                                        <input
                                            type="text"
                                            placeholder={[formData.year, formData.brand, formData.model, formData.subModel].filter(Boolean).join(' ')}
                                            className="form-input"
                                            value={formData.title}
                                            onChange={(e) => updateFormData({ title: e.target.value })}
                                        />
                                        <p className="text-xs text-gray-400 mt-1">หากไม่กรอก ระบบจะใช้ "{[formData.year, formData.brand, formData.model, formData.subModel].filter(Boolean).join(' ')}"</p>
                                    </div>

                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">รายละเอียดเพิ่มเติม</label>
                                        <textarea
                                            rows={4}
                                            placeholder="อธิบายสภาพรถ, ประวัติการซ่อมบำรุง, อุปกรณ์เพิ่มเติม..."
                                            className="form-textarea"
                                            value={formData.description}
                                            onChange={(e) => updateFormData({ description: e.target.value })}
                                        />
                                    </div>

                                    <div className="gap-5 mb-6">
                                        <div ref={priceRef}>
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
                                                <div className={`absolute left-3 top-1/2 -translate-y-1/2 font-bold ${fieldErrors.price ? 'text-red-500' : 'text-gray-400'}`}>฿</div>
                                            </div>
                                            {fieldErrors.price && <p className="text-red-500 text-xs mt-1">กรุณาระบุราคา</p>}
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-bold text-primary mb-1 flex items-center gap-2">
                                        <MapPin size={22} className="text-accent" /> สถานที่นัดดูรถ
                                    </h3>
                                    <p className="text-xs text-gray-500 mb-4">ผู้ซื้อที่สนใจจะใช้ข้อมูลนี้ในการนัดหมายเข้าชมรถ</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                                        <div ref={provinceRef}>
                                            <label className={`block text-sm font-medium mb-1.5 ${fieldErrors.province ? 'text-red-600' : 'text-gray-700'}`}>จังหวัด<span className="text-red-500">*</span></label>
                                            <div className={fieldErrors.province ? 'ring-2 ring-red-500 rounded-xl' : ''}>
                                                <SearchableSelect
                                                    options={PROVINCES.map(p => ({ id: p, label: p }))}
                                                    value={formData.province}
                                                    onChange={(value) => {
                                                        setFieldErrors(prev => ({ ...prev, province: false }));
                                                        updateFormData({ province: value });
                                                    }}
                                                    placeholder="เลือกจังหวัด"
                                                    searchPlaceholder="ค้นหาจังหวัด..."
                                                    emptyMessage="ไม่พบจังหวัด"
                                                    icon={<MapPin size={20} />}
                                                />
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
                                    <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                                        <BookUser size={24} className="text-accent" /> ข้อมูลติดต่อ
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                                        <div ref={contactNameRef}>
                                            <label className={`block text-sm font-medium mb-1.5 ${fieldErrors.contactName ? 'text-red-600' : 'text-gray-700'}`}>ชื่อผู้ติดต่อ <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                placeholder="ชื่อที่ต้องการให้แสดง"
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
                                                placeholder="เช่น 0812345678"
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
                                                value={formData.lineId || ''}
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
                                                    value={formData.facebookUrl || ''}
                                                    onChange={(e) => updateFormData({ facebookUrl: e.target.value })}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}

                            {/* Navigation Buttons */}
                            <div className="flex gap-4 pt-8 border-t border-gray-100 mt-6">
                                {currentStep > 1 && (
                                    <button
                                        type="button"
                                        onClick={goToPrevStep}
                                        className="flex-1 h-14 border-2 border-gray-100 rounded-2xl font-bold text-gray-400 hover:text-primary hover:border-primary hover:bg-blue-50 transition-all flex items-center justify-center gap-2 group"
                                    >
                                        <ArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                                        <span>ย้อนกลับ</span>
                                    </button>
                                )}

                                {currentStep < 3 ? (
                                    <button
                                        type="button"
                                        onClick={goToNextStep}
                                        className={`flex-1 h-14 bg-accent text-white rounded-2xl font-bold shadow-lg shadow-orange-100 hover:bg-orange-600 transition-all flex items-center justify-center gap-2 group transform active:scale-[0.98] ${currentStep === 1 ? 'w-full' : ''}`}
                                    >
                                        <span>ไปต่อ</span>
                                        <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleSubmit}
                                        disabled={isSubmitting}
                                        className="flex-1 h-14 bg-primary text-white rounded-2xl font-bold shadow-xl shadow-blue-900/10 hover:bg-opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="animate-spin" />
                                                <span>กำลังลงประกาศ...</span>
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle size={22} />
                                                <span>ลงประกาศ</span>
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
                                imageUrl={formData.imagesPreviews[0]}
                                sellerName={user?.fullName || 'ผู้ขาย'}
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

            {/* Upgrade Package Modal */}
            {showUpgradeModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => limitReached ? router.push('/profile/dashboard') : setShowUpgradeModal(false)}
                    ></div>
                    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4 relative z-10 text-center">
                        {/* Gradient icon background */}
                        <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg shadow-orange-200">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-white" viewBox="0 0 256 256" fill="currentColor">
                                <path d="M243.84,76.19a12.08,12.08,0,0,0-13.34-1.7L178.83,100.3,138.33,42.08a12.11,12.11,0,0,0-20.66,0L77.17,100.3,25.5,74.49a12.1,12.1,0,0,0-17.15,13.65L36.1,198.55A16,16,0,0,0,51.55,212H204.45a16,16,0,0,0,15.45-13.46l27.75-110.4A12.06,12.06,0,0,0,243.84,76.19ZM204.45,196H51.55L26.42,92l45.25,22.63a12,12,0,0,0,15.18-4.39L128,46.67l41.15,63.58a12,12,0,0,0,15.18,4.39L229.58,92ZM172,160a12,12,0,0,1-12,12H96a12,12,0,0,1,0-24h64A12,12,0,0,1,172,160Z"/>
                            </svg>
                        </div>

                        <h3 className="text-xl font-bold text-gray-800 mb-2">สิทธิการลงประกาศเต็มแล้ว</h3>
                        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                            {upgradeMessage || (PACKAGES_ENABLED
                                ? 'คุณใช้สิทธิลงประกาศครบตามแพ็กเกจปัจจุบันแล้ว อัพเกรดแพ็กเกจเพื่อลงประกาศเพิ่มเติม'
                                : 'คุณลงประกาศครบตามสิทธิ์แล้ว กรุณาลบหรือปิดประกาศเดิมก่อนจึงจะลงประกาศใหม่ได้')}
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
                                        ดูแพ็กเกจ
                                    </button>
                                </>
                            )}
                            <button
                                onClick={() => limitReached ? router.push('/profile/dashboard') : setShowUpgradeModal(false)}
                                className={PACKAGES_ENABLED
                                    ? "w-full py-2 text-sm text-gray-400 hover:text-gray-600 transition"
                                    : "w-full py-3.5 px-4 bg-primary text-white rounded-xl font-bold hover:bg-opacity-90 transition"}
                            >
                                {limitReached ? 'กลับหน้าหลัก' : (PACKAGES_ENABLED ? 'ปิด' : 'รับทราบ')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {PACKAGES_ENABLED && (
                <SlotPurchaseModal
                    open={showSlotModal}
                    onClose={() => setShowSlotModal(false)}
                    onSuccess={() => {
                        setLimitReached(false);
                        setShowUpgradeModal(false);
                    }}
                />
            )}

            {/* Login / Register — sellResume keeps the form alive after auth */}
            <LoginModal
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                onSwitchToRegister={() => { setShowLoginModal(false); setShowRegisterModal(true); }}
                sellResume
            />
            <RegisterModal
                isOpen={showRegisterModal}
                onClose={() => setShowRegisterModal(false)}
                onSwitchToLogin={() => { setShowRegisterModal(false); setShowLoginModal(true); }}
                sellResume
            />

            {/* Post-login: one-click publish confirmation */}
            {showResumeConfirm && user && !limitReached && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-auto relative z-10 overflow-hidden">
                        <div className="bg-gradient-to-r from-primary to-blue-600 text-white px-6 py-5 text-center">
                            <CheckCircle size={40} className="mx-auto mb-2" />
                            <h3 className="text-lg font-bold">เข้าสู่ระบบสำเร็จ</h3>
                            <p className="text-blue-100 text-sm mt-0.5">ตรวจสอบข้อมูลก่อนลงประกาศ</p>
                        </div>

                        <div className="p-6">
                            <div className="bg-surface rounded-2xl p-4 space-y-2.5 text-sm">
                                <div className="flex justify-between gap-3">
                                    <span className="text-gray-500 flex-shrink-0">รถ</span>
                                    <span className="font-bold text-gray-800 text-right line-clamp-2">
                                        {formData.title ||
                                            [formData.year, formData.brand, formData.model, formData.subModel]
                                                .filter(Boolean).join(' ') || '-'}
                                    </span>
                                </div>
                                <div className="flex justify-between gap-3">
                                    <span className="text-gray-500">ราคา</span>
                                    <span className="font-bold text-accent">
                                        {formData.price > 0 ? `฿${formData.price.toLocaleString('th-TH')}` : '-'}
                                    </span>
                                </div>
                                <div className="flex justify-between gap-3">
                                    <span className="text-gray-500">จังหวัด</span>
                                    <span className="font-medium text-gray-800">{formData.province || '-'}</span>
                                </div>
                                <div className="flex justify-between gap-3">
                                    <span className="text-gray-500">รูปภาพ</span>
                                    <span className="font-medium text-gray-800">{formData.images.length} รูป</span>
                                </div>
                            </div>

                            {formData.images.length === 0 ? (
                                <>
                                    <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-xl p-3 mt-4 flex items-start gap-2">
                                        <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                                        ไม่พบรูปภาพที่บันทึกไว้ (เบราว์เซอร์อาจจำกัดพื้นที่) กรุณาเพิ่มรูปภาพอีกครั้งก่อนลงประกาศ
                                    </p>
                                    <button
                                        onClick={() => {
                                            clearResumeFlag();
                                            setShowResumeConfirm(false);
                                            router.replace('/sell');
                                            setCurrentStep(2);
                                        }}
                                        className="w-full h-12 mt-4 bg-accent text-white rounded-2xl font-bold hover:bg-orange-600 transition flex items-center justify-center gap-2"
                                    >
                                        <ImageIcon size={18} /> เพิ่มรูปภาพ
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => { clearResumeFlag(); handleSubmit(); }}
                                    disabled={isSubmitting}
                                    className="w-full h-12 mt-5 bg-accent text-white rounded-2xl font-bold shadow-lg shadow-orange-100 hover:bg-orange-600 transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <><Loader2 size={20} className="animate-spin" /> กำลังลงประกาศ...</>
                                    ) : (
                                        <><CheckCircle size={20} /> ยืนยันลงประกาศ</>
                                    )}
                                </button>
                            )}

                            <button
                                onClick={() => {
                                    clearResumeFlag();
                                    setShowResumeConfirm(false);
                                    router.replace('/sell');
                                    setCurrentStep(3);
                                }}
                                disabled={isSubmitting}
                                className="w-full h-11 mt-3 text-gray-500 font-medium hover:text-gray-700 transition disabled:opacity-50"
                            >
                                แก้ไขข้อมูลก่อน
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Full-screen image viewer (step-2 grid tap) */}
            {lightboxIndex !== null && formData.imagesPreviews[lightboxIndex] && (
                <ImageLightbox
                    images={formData.imagesPreviews}
                    index={lightboxIndex}
                    onClose={() => setLightboxIndex(null)}
                    onIndexChange={setLightboxIndex}
                />
            )}
        </div>
    );
}
