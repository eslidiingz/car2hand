"use client";

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import {
    saveTextDraft,
    loadTextDraft,
    saveImageDraft,
    loadImageDraft,
    clearListingDraft,
} from '@/lib/listingDraft';

// Types
export interface ListingFormData {
    // Step 1: Vehicle Info
    vehicleType: 'CAR' | 'MOTORCYCLE';
    year: number;
    brand: string;
    model: string;
    subModel?: string;
    transmission?: 'AUTOMATIC' | 'MANUAL' | 'CVT' | 'DCT' | 'SEMI_AUTO';
    mileage: number;
    color: string;
    fuelType: 'PETROL' | 'DIESEL' | 'HYBRID' | 'PLUGIN_HYBRID' | 'EV' | 'LPG' | 'NGV';
    bodyType: string;
    engineSize?: number;
    seats?: number;

    // Step 1.5: Condition
    condition: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
    hasAccident: boolean;
    hasModified: boolean;
    hasWarranty: boolean;
    plateProvince?: string;
    registrationType: 'PERSONAL' | 'COMPANY';

    // Step 2: Images
    images: File[];
    imagesPreviews: string[];

    // Step 3: Price & Contact
    title: string;
    description?: string;
    price: number;
    province: string;
    district?: string;

    // Contact Info
    contactName: string;
    contactPhone: string;
    lineId?: string;
    facebookUrl?: string;

    // Vehicle Extras (ข้อมูลเพิ่มเติมช่วยตัดสินใจ)
    taxPaid: boolean; // พรบ และ ภาษีครบ
    registrationBookStatus: 'READY' | 'FINANCED'; // สถานะเล่มทะเบียน
    insuranceDetails?: string; // รายละเอียดประกัน
    warrantyDetails?: string; // รายละเอียด warranty
    bsiDetails?: string; // รายละเอียด BSI
    gasType: 'NONE' | 'LPG' | 'NGV'; // ติดแก๊สหรือไม่
    hasSpareKey: boolean; // มีกุญแจสำรอง
    serviceHistoryFile?: File; // ไฟล์รูปประวัติบริการ
    serviceHistoryPreview?: string; // Preview URL
    registrationBookFile?: File; // ไฟล์สำเนาเล่มทะเบียนรถ
    registrationBookPreview?: string; // Preview URL
}

interface ListingContextType {
    formData: ListingFormData;
    updateFormData: (data: Partial<ListingFormData>) => void;
    resetFormData: () => void;
    currentStep: number;
    setCurrentStep: (step: number) => void;
    listingId: string | null;
    setListingId: (id: string | null) => void;
    isSubmitting: boolean;
    setIsSubmitting: (value: boolean) => void;
}

const defaultFormData: ListingFormData = {
    vehicleType: 'CAR',
    year: 0,
    brand: '',
    model: '',
    subModel: '',
    transmission: 'AUTOMATIC',
    mileage: 0,
    color: '',
    fuelType: '' as any,
    bodyType: '',
    engineSize: undefined,
    seats: undefined,
    condition: 'GOOD',
    hasAccident: false,
    hasModified: false,
    hasWarranty: false,
    plateProvince: '',
    registrationType: 'PERSONAL',
    images: [],
    imagesPreviews: [],
    title: '',
    description: '',
    price: 0,
    province: '',
    district: '',
    contactName: '',
    contactPhone: '',
    lineId: '',
    facebookUrl: '',
    // Vehicle Extras
    taxPaid: false,
    registrationBookStatus: 'READY',
    insuranceDetails: '',
    warrantyDetails: '',
    bsiDetails: '',
    gasType: 'NONE',
    hasSpareKey: false,
    serviceHistoryFile: undefined,
    serviceHistoryPreview: '',
    registrationBookFile: undefined,
    registrationBookPreview: '',
};

const ListingContext = createContext<ListingContextType | undefined>(undefined);

export function ListingProvider({ children }: { children: ReactNode }) {
    // Lazy-init text fields from a persisted draft so a guest who logged in
    // (incl. via full-page OAuth redirect) gets their form back instantly.
    const [formData, setFormData] = useState<ListingFormData>(() => {
        const draft = loadTextDraft();
        return draft ? { ...defaultFormData, ...draft } : defaultFormData;
    });
    const [currentStep, setCurrentStep] = useState(1);
    const [listingId, setListingId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Until image rehydration finishes, don't let the image auto-save effect
    // overwrite the stored draft with the empty initial state.
    const hydratedRef = useRef(false);
    const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const updateFormData = (data: Partial<ListingFormData>) => {
        setFormData(prev => ({ ...prev, ...data }));
    };

    const resetFormData = () => {
        setFormData(defaultFormData);
        setCurrentStep(1);
        setListingId(null);
        void clearListingDraft();
    };

    // Rehydrate photos / doc files from IndexedDB once on mount.
    useEffect(() => {
        let createdPreviews: string[] = [];
        (async () => {
            try {
                const img = await loadImageDraft();
                if (img && img.images.length > 0) {
                    const previews = img.images.map((f) => URL.createObjectURL(f));
                    const update: Partial<ListingFormData> = {
                        images: img.images,
                        imagesPreviews: previews,
                    };
                    if (img.serviceHistoryFile) {
                        update.serviceHistoryFile = img.serviceHistoryFile;
                        update.serviceHistoryPreview = URL.createObjectURL(img.serviceHistoryFile);
                    }
                    if (img.registrationBookFile) {
                        update.registrationBookFile = img.registrationBookFile;
                        update.registrationBookPreview = URL.createObjectURL(img.registrationBookFile);
                    }
                    createdPreviews = previews;
                    setFormData((prev) => ({ ...prev, ...update }));
                }
            } finally {
                hydratedRef.current = true;
            }
        })();
        return () => {
            createdPreviews.forEach((u) => URL.revokeObjectURL(u));
        };
    }, []);

    // Debounced auto-save of text fields to sessionStorage.
    useEffect(() => {
        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => saveTextDraft(formData), 400);
        return () => {
            if (saveTimer.current) clearTimeout(saveTimer.current);
        };
    }, [formData]);

    // Persist photos / doc files to IndexedDB (only after rehydration so we
    // never clobber a stored draft with the empty initial state).
    useEffect(() => {
        if (!hydratedRef.current) return;
        void saveImageDraft({
            images: formData.images,
            serviceHistoryFile: formData.serviceHistoryFile,
            registrationBookFile: formData.registrationBookFile,
        });
    }, [formData.images, formData.serviceHistoryFile, formData.registrationBookFile]);

    return (
        <ListingContext.Provider value={{
            formData,
            updateFormData,
            resetFormData,
            currentStep,
            setCurrentStep,
            listingId,
            setListingId,
            isSubmitting,
            setIsSubmitting
        }}>
            {children}
        </ListingContext.Provider>
    );
}

export function useListingForm() {
    const context = useContext(ListingContext);
    if (!context) {
        throw new Error('useListingForm must be used within a ListingProvider');
    }
    return context;
}

// Custom error for upgrade prompts
export class UpgradeRequiredError extends Error {
    upgradeRequired = true;
    constructor(message: string) {
        super(message);
        this.name = 'UpgradeRequiredError';
    }
}

// Auth helper
function getAuthToken(): string | null {
    const stored = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (!stored) return null;
    try { return JSON.parse(stored).token || null; } catch { return null; }
}

// API Functions
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export async function createListing(userId: string, data: ListingFormData): Promise<{ listing: { id: string } }> {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/listings`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
            userId,
            vehicleType: data.vehicleType,
            title: data.title || `${data.brand} ${data.model} ${data.year}`,
            description: data.description,
            price: data.price,
            brand: data.brand,
            model: data.model,
            subModel: data.subModel,
            year: data.year,
            color: data.color,
            fuelType: data.fuelType || undefined,
            transmission: data.transmission,
            engineSize: data.engineSize,
            seats: data.seats,
            mileage: data.mileage,
            bodyType: data.bodyType,
            plateProvince: data.plateProvince,
            registrationType: data.registrationType,
            condition: data.condition,
            hasAccident: data.hasAccident,
            hasModified: data.hasModified,
            hasWarranty: data.hasWarranty,
            province: data.province,
            district: data.district,
            contactName: data.contactName,
            contactPhone: data.contactPhone,
            lineId: data.lineId,
            facebookUrl: data.facebookUrl,
            // Vehicle Extras
            taxPaid: data.taxPaid,
            registrationBookStatus: data.registrationBookStatus,
            insuranceDetails: data.insuranceDetails,
            warrantyDetails: data.warrantyDetails,
            bsiDetails: data.bsiDetails,
            gasType: data.gasType,
            hasSpareKey: data.hasSpareKey,
            // serviceHistoryImage will be uploaded separately
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        if (errorData.upgradeRequired) {
            throw new UpgradeRequiredError(errorData.message || 'กรุณาอัพเกรดแพ็กเกจ');
        }
        throw new Error(errorData.message || 'Failed to create listing');
    }

    return response.json();
}

export async function uploadListingImages(
    userId: string,
    listingId: string,
    files: File[]
): Promise<void> {
    // Convert files to base64
    const images = await Promise.all(
        files.map(async (file) => {
            const buffer = await file.arrayBuffer();
            const base64 = Buffer.from(buffer).toString('base64');
            return {
                buffer: base64,
                filename: file.name,
                mimetype: file.type
            };
        })
    );

    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/listings/${listingId}/images`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ userId, images })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload images');
    }
}

export async function uploadServiceHistoryImage(
    userId: string,
    listingId: string,
    file: File
): Promise<void> {
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');

    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/listings/${listingId}/service-history`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
            userId,
            image: {
                buffer: base64,
                filename: file.name,
                mimetype: file.type
            }
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload service history image');
    }
}

export async function uploadRegistrationBookImage(
    userId: string,
    listingId: string,
    file: File
): Promise<void> {
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');

    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/listings/${listingId}/registration-book`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
            userId,
            image: {
                buffer: base64,
                filename: file.name,
                mimetype: file.type
            }
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload registration book image');
    }
}

export async function publishListing(
    userId: string,
    listingId: string,
    price: number
): Promise<void> {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/listings/${listingId}/publish`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ userId, price })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to publish listing');
    }
}
