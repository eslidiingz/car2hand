"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
    ArrowLeft,
    Certificate,
    ClipboardText,
    Clock,
    Check,
    MapPin,
    NavigationArrow,
    LockKey,
    Question,
    CaretDown,
    SpinnerGap,
    CheckCircle,
    WarningCircle,
} from '@phosphor-icons/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// ─── Types ───────────────────────────────────────────────────────────────────

interface InspectionPackage {
    id: string;
    name: string;
    nameEn: string | null;
    price: number;
    description: string | null;
    features: string[];
    isRecommended: boolean;
}

interface Brand {
    id: string;
    name: string;
    nameTh: string | null;
}

interface VehicleModel {
    id: string;
    name: string;
    nameTh: string | null;
}

interface FormErrors {
    contactName?: string;
    contactPhone?: string;
    location?: string;
    date?: string;
    brandId?: string;
}

interface BookingResult {
    id: string;
    packageName: string;
    date: string;
    timeSlot: string;
    location: string;
    contactName: string;
    total: number;
}

const TIME_SLOTS = [
    '09:00 - 10:00',
    '10:00 - 11:00',
    '11:00 - 12:00',
    '14:00 - 15:00',
    '15:00 - 16:00',
    '16:00 - 17:00',
];

function getTomorrowDate(): string {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
}

// ─── FAQ Accordion ───────────────────────────────────────────────────────────

function FAQItem({ q, a }: { q: string; a: string }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border-b border-gray-100 last:border-0">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between py-4 text-left gap-3"
            >
                <span className="font-bold text-sm text-gray-800">{q}</span>
                <CaretDown
                    weight="bold"
                    className={`text-gray-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
                />
            </button>
            {open && <p className="text-sm text-gray-500 pb-4 leading-relaxed">{a}</p>}
        </div>
    );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function InspectionPage() {
    // ── Data fetched from API ────────────────────────────────────────────────
    const [packages, setPackages] = useState<InspectionPackage[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [models, setModels] = useState<VehicleModel[]>([]);
    const [loadingPackages, setLoadingPackages] = useState(true);
    const [loadingBrands, setLoadingBrands] = useState(true);
    const [loadingModels, setLoadingModels] = useState(false);

    // ── Form state ───────────────────────────────────────────────────────────
    const [selectedPackageId, setSelectedPackageId] = useState<string>('');
    const [brandId, setBrandId] = useState('');
    const [modelId, setModelId] = useState('');
    const [location, setLocation] = useState('');
    const [date, setDate] = useState('');
    const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[0]);
    const [contactName, setContactName] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [note, setNote] = useState('');

    // ── Submission state ─────────────────────────────────────────────────────
    const [errors, setErrors] = useState<FormErrors>({});
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [bookingResult, setBookingResult] = useState<BookingResult | null>(null);

    // ── Derived values ───────────────────────────────────────────────────────
    const selectedPkg = packages.find((p) => p.id === selectedPackageId);
    const basePrice = selectedPkg?.price ?? 0;
    const vat = Math.round(basePrice * 0.07);
    const total = basePrice + vat;
    const minDate = getTomorrowDate();

    // ── Fetch packages on mount ──────────────────────────────────────────────
    useEffect(() => {
        (async () => {
            try {
                const res = await fetch(`${API_URL}/services/inspection/packages`);
                if (!res.ok) throw new Error('Failed to fetch packages');
                const data: InspectionPackage[] = await res.json();
                setPackages(data);
                // Auto-select recommended, or first
                const recommended = data.find((p) => p.isRecommended);
                setSelectedPackageId(recommended?.id ?? data[0]?.id ?? '');
            } catch {
                // Fallback so the page isn't completely broken
                setPackages([]);
            } finally {
                setLoadingPackages(false);
            }
        })();
    }, []);

    // ── Fetch brands on mount ────────────────────────────────────────────────
    useEffect(() => {
        (async () => {
            try {
                const res = await fetch(`${API_URL}/master-data/brands?vehicleType=CAR`);
                if (!res.ok) throw new Error('Failed to fetch brands');
                const data = await res.json();
                setBrands(Array.isArray(data) ? data : data.brands || []);
            } catch {
                setBrands([]);
            } finally {
                setLoadingBrands(false);
            }
        })();
    }, []);

    // ── Fetch models when brand changes ──────────────────────────────────────
    useEffect(() => {
        if (!brandId) {
            setModels([]);
            setModelId('');
            return;
        }
        let cancelled = false;
        (async () => {
            setLoadingModels(true);
            try {
                const res = await fetch(`${API_URL}/master-data/brands/${brandId}/models`);
                if (!res.ok) throw new Error('Failed to fetch models');
                const data = await res.json();
                if (!cancelled) {
                    setModels(Array.isArray(data) ? data : data.models || []);
                    setModelId('');
                }
            } catch {
                if (!cancelled) setModels([]);
            } finally {
                if (!cancelled) setLoadingModels(false);
            }
        })();
        return () => { cancelled = true; };
    }, [brandId]);

    // ── Validation ───────────────────────────────────────────────────────────
    const validate = useCallback((): FormErrors => {
        const e: FormErrors = {};
        if (!contactName.trim()) e.contactName = 'กรุณากรอกชื่อ-นามสกุล';
        if (!contactPhone.trim()) {
            e.contactPhone = 'กรุณากรอกเบอร์โทรศัพท์';
        } else if (!/^0[0-9]{8,9}$/.test(contactPhone.replace(/[-\s]/g, ''))) {
            e.contactPhone = 'เบอร์โทรไม่ถูกต้อง (เช่น 0812345678)';
        }
        if (!location.trim()) e.location = 'กรุณาระบุสถานที่ตรวจรถ';
        if (!date) {
            e.date = 'กรุณาเลือกวันที่';
        } else if (date < minDate) {
            e.date = 'กรุณาเลือกวันที่ในอนาคต (ตั้งแต่พรุ่งนี้เป็นต้นไป)';
        }
        if (!brandId) e.brandId = 'กรุณาเลือกยี่ห้อรถ';
        return e;
    }, [contactName, contactPhone, location, date, minDate, brandId]);

    // ── Submit ───────────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        const formErrors = validate();
        setErrors(formErrors);
        if (Object.keys(formErrors).length > 0) return;

        setSubmitting(true);
        setSubmitError('');
        try {
            const body = {
                packageId: selectedPackageId,
                brandId,
                modelId: modelId || undefined,
                location,
                date,
                timeSlot,
                contactName: contactName.trim(),
                contactPhone: contactPhone.replace(/[-\s]/g, ''),
                note: note.trim() || undefined,
            };
            const res = await fetch(`${API_URL}/services/inspection/bookings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (!res.ok) {
                const errData = await res.json().catch(() => null);
                throw new Error(errData?.message || 'การจองล้มเหลว กรุณาลองใหม่อีกครั้ง');
            }
            const result = await res.json();
            setBookingResult({
                id: result.id ?? result.bookingId ?? '-',
                packageName: selectedPkg?.name ?? '',
                date,
                timeSlot,
                location,
                contactName: contactName.trim(),
                total,
            });
        } catch (err: unknown) {
            setSubmitError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด กรุณาลองใหม่');
        } finally {
            setSubmitting(false);
        }
    };

    // ── Success state ────────────────────────────────────────────────────────
    if (bookingResult) {
        return (
            <div className="bg-surface text-gray-800 min-h-screen">
                <nav className="bg-white shadow-sm fixed w-full z-50 top-0 border-b border-gray-100">
                    <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-2">
                        <Link href="/services" className="text-gray-500 hover:text-primary"><ArrowLeft weight="bold" className="text-xl" /></Link>
                        <span className="font-bold text-xl text-primary">จองคิวตรวจสภาพ</span>
                    </div>
                </nav>

                <div className="pt-28 pb-16 max-w-lg mx-auto px-4 text-center">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                        <CheckCircle weight="fill" className="text-green-500 text-6xl mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">จองสำเร็จ!</h1>
                        <p className="text-gray-500 mb-6">ทีมงานจะติดต่อกลับเพื่อยืนยันนัดหมาย</p>

                        <div className="bg-gray-50 rounded-xl p-5 text-left space-y-3 mb-6">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">หมายเลขจอง</span>
                                <span className="font-bold text-primary">{bookingResult.id}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">แพ็กเกจ</span>
                                <span className="font-bold">{bookingResult.packageName}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">วันที่</span>
                                <span className="font-bold">{bookingResult.date}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">เวลา</span>
                                <span className="font-bold">{bookingResult.timeSlot}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">สถานที่</span>
                                <span className="font-bold">{bookingResult.location}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">ผู้ติดต่อ</span>
                                <span className="font-bold">{bookingResult.contactName}</span>
                            </div>
                            <div className="flex justify-between text-sm border-t border-gray-200 pt-3">
                                <span className="text-gray-500">ยอดรวม</span>
                                <span className="font-bold text-primary text-lg">{bookingResult.total.toLocaleString()} ฿</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <Link
                                href="/services"
                                className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition text-center"
                            >
                                กลับหน้าบริการ
                            </Link>
                            <button
                                onClick={() => {
                                    setBookingResult(null);
                                    setContactName('');
                                    setContactPhone('');
                                    setLocation('');
                                    setDate('');
                                    setNote('');
                                    setBrandId('');
                                    setModelId('');
                                    setErrors({});
                                }}
                                className="w-full border border-gray-200 text-gray-600 py-3 rounded-xl font-bold hover:bg-gray-50 transition"
                            >
                                จองคิวใหม่
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ── Helper: field error message ──────────────────────────────────────────
    const FieldError = ({ msg }: { msg?: string }) =>
        msg ? (
            <p className="flex items-center gap-1 text-xs text-red-500 mt-1">
                <WarningCircle weight="fill" className="shrink-0" /> {msg}
            </p>
        ) : null;

    // ── Main render ──────────────────────────────────────────────────────────
    return (
        <div className="bg-surface text-gray-800 min-h-screen">

            {/* ── Nav ─────────────────────────────────────────────────────── */}
            <nav className="bg-white shadow-sm fixed w-full z-50 top-0 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Link href="/services" className="text-gray-500 hover:text-primary"><ArrowLeft weight="bold" className="text-xl" /></Link>
                        <span className="font-bold text-xl text-primary">จองคิวตรวจสภาพ</span>
                    </div>
                    <div className="hidden md:flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1 text-primary font-bold">
                            <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs">1</span>
                            เลือกแพ็กเกจ
                        </div>
                        <div className="w-8 h-px bg-gray-300"></div>
                        <div className="flex items-center gap-1 text-gray-400">
                            <span className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs">2</span>
                            ข้อมูลรถ & นัดหมาย
                        </div>
                        <div className="w-8 h-px bg-gray-300"></div>
                        <div className="flex items-center gap-1 text-gray-400">
                            <span className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs">3</span>
                            ข้อมูลผู้ติดต่อ
                        </div>
                    </div>
                </div>
            </nav>

            {/* ── Hero ────────────────────────────────────────────────────── */}
            <header className="pt-24 pb-12 text-center px-4 bg-primary relative text-white" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.05' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E")`
            }}>
                <h1 className="text-3xl md:text-4xl font-bold mb-4">อย่าเสี่ยงซื้อรถย้อมแมว</h1>
                <p className="text-blue-100 text-lg max-w-2xl mx-auto mb-8">
                    ให้ผู้เชี่ยวชาญจาก Car2Hand ช่วยดูรถแทนคุณ ตรวจละเอียด 200 จุด รู้ผลทันทีผ่านมือถือ
                </p>
                <div className="flex flex-wrap justify-center gap-4 md:gap-12 opacity-90">
                    <div className="flex items-center gap-2">
                        <Certificate weight="fill" className="text-accent text-2xl" />
                        <span className="text-sm font-bold">ช่างรับรองมาตรฐาน</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <ClipboardText weight="fill" className="text-accent text-2xl" />
                        <span className="text-sm font-bold">รายงานผล Digital</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock weight="fill" className="text-accent text-2xl" />
                        <span className="text-sm font-bold">รู้ผลใน 60 นาที</span>
                    </div>
                </div>
            </header>

            {/* ── Main grid ───────────────────────────────────────────────── */}
            <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* ── Left column (form) ──────────────────────────────────── */}
                <div className="lg:col-span-2 space-y-8">

                    {/* ── Step 1: Package selection ───────────────────────── */}
                    <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <span className="bg-primary text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm">1</span>
                            เลือกแพ็กเกจตรวจสภาพ
                        </h2>

                        {loadingPackages ? (
                            <div className="flex items-center justify-center py-12 text-gray-400 gap-2">
                                <SpinnerGap weight="bold" className="animate-spin text-2xl" />
                                <span className="text-sm">กำลังโหลดแพ็กเกจ...</span>
                            </div>
                        ) : packages.length === 0 ? (
                            <p className="text-center text-gray-400 py-12 text-sm">ไม่สามารถโหลดแพ็กเกจได้ กรุณารีเฟรชหน้า</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {packages.map((pkg) => {
                                    const isSelected = selectedPackageId === pkg.id;
                                    const accentColor = pkg.isRecommended ? 'accent' : 'primary';
                                    const borderActive = pkg.isRecommended ? 'border-accent bg-orange-50/10' : 'border-primary bg-blue-50/10';
                                    const borderHover = pkg.isRecommended ? 'hover:border-orange-500' : 'hover:border-blue-300';
                                    return (
                                        <label
                                            key={pkg.id}
                                            className={`relative border-2 rounded-xl p-5 cursor-pointer transition group ${isSelected ? borderActive : `border-gray-200 ${borderHover}`}`}
                                            onClick={() => setSelectedPackageId(pkg.id)}
                                        >
                                            <input type="radio" name="package" className="peer sr-only" checked={isSelected} readOnly />
                                            {pkg.isRecommended && (
                                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white px-3 py-0.5 rounded-full text-xs font-bold shadow-sm">
                                                    แนะนำ (ขายดีสุด)
                                                </div>
                                            )}
                                            <div className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 transition flex items-center justify-center ${isSelected ? `border-${accentColor} bg-${accentColor}` : 'border-gray-300'}`}>
                                                <Check weight="bold" className={`text-white text-xs ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
                                            </div>

                                            <h3 className="font-bold text-lg text-gray-800 mb-1">{pkg.name}</h3>
                                            <div className={`font-bold text-2xl mb-4 ${pkg.isRecommended ? 'text-accent' : 'text-primary'}`}>
                                                {pkg.price.toLocaleString()} ฿
                                            </div>
                                            {pkg.description && (
                                                <p className="text-xs text-gray-400 mb-3">{pkg.description}</p>
                                            )}
                                            <ul className="text-sm text-gray-500 space-y-2 mb-4">
                                                {pkg.features.map((f, i) => (
                                                    <li key={i} className="flex items-start gap-3">
                                                        <Check weight="bold" className="text-green-500 mt-0.5 shrink-0" /> {f}
                                                    </li>
                                                ))}
                                            </ul>
                                        </label>
                                    );
                                })}
                            </div>
                        )}
                    </section>

                    {/* ── Step 2: Vehicle & appointment ───────────────────── */}
                    <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <span className="bg-gray-200 text-gray-600 w-8 h-8 rounded-lg flex items-center justify-center text-sm">2</span>
                            ข้อมูลรถและสถานที่นัดหมาย
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            {/* Brand */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">ยี่ห้อรถ <span className="text-red-500">*</span></label>
                                {loadingBrands ? (
                                    <div className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-400 text-sm flex items-center gap-2">
                                        <SpinnerGap weight="bold" className="animate-spin" /> กำลังโหลด...
                                    </div>
                                ) : (
                                    <select
                                        value={brandId}
                                        onChange={(e) => setBrandId(e.target.value)}
                                        className={`w-full bg-gray-50 border rounded-lg p-3 outline-none focus:border-primary ${errors.brandId ? 'border-red-400' : 'border-gray-200'}`}
                                    >
                                        <option value="">เลือกยี่ห้อ...</option>
                                        {brands.map((b) => (
                                            <option key={b.id} value={b.id}>{b.nameTh || b.name}</option>
                                        ))}
                                    </select>
                                )}
                                <FieldError msg={errors.brandId} />
                            </div>

                            {/* Model */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">รุ่นรถ</label>
                                {loadingModels ? (
                                    <div className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-400 text-sm flex items-center gap-2">
                                        <SpinnerGap weight="bold" className="animate-spin" /> กำลังโหลด...
                                    </div>
                                ) : (
                                    <select
                                        value={modelId}
                                        onChange={(e) => setModelId(e.target.value)}
                                        disabled={!brandId}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 outline-none focus:border-primary disabled:opacity-50"
                                    >
                                        <option value="">{brandId ? 'เลือกรุ่น...' : 'เลือกยี่ห้อก่อน'}</option>
                                        {models.map((m) => (
                                            <option key={m.id} value={m.id}>{m.nameTh || m.name}</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        </div>

                        {/* Location */}
                        <div className="mb-6">
                            <label className="block text-sm font-bold text-gray-700 mb-1">สถานที่ตรวจรถ <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <MapPin weight="bold" className="absolute left-3 top-3.5 text-gray-400" />
                                <input
                                    type="text"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="ระบุสถานที่นัดพบ หรือ ลิงก์ Google Maps"
                                    className={`w-full bg-gray-50 border rounded-lg p-3 pl-10 outline-none focus:border-primary ${errors.location ? 'border-red-400' : 'border-gray-200'}`}
                                />
                            </div>
                            <FieldError msg={errors.location} />
                            <div className="mt-2 flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (navigator.geolocation) {
                                            navigator.geolocation.getCurrentPosition(
                                                (pos) => setLocation(`${pos.coords.latitude}, ${pos.coords.longitude}`),
                                                () => alert('ไม่สามารถเข้าถึงตำแหน่งได้'),
                                            );
                                        }
                                    }}
                                    className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded border border-blue-100 hover:bg-blue-100 flex items-center gap-1"
                                >
                                    <NavigationArrow weight="bold" /> ใช้ตำแหน่งปัจจุบัน
                                </button>
                            </div>
                        </div>

                        {/* Date & Time */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">วันที่สะดวก <span className="text-red-500">*</span></label>
                                <input
                                    type="date"
                                    value={date}
                                    min={minDate}
                                    onChange={(e) => setDate(e.target.value)}
                                    className={`w-full bg-gray-50 border rounded-lg p-3 outline-none focus:border-primary ${errors.date ? 'border-red-400' : 'border-gray-200'}`}
                                />
                                <FieldError msg={errors.date} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">เวลา</label>
                                <select
                                    value={timeSlot}
                                    onChange={(e) => setTimeSlot(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 outline-none focus:border-primary"
                                >
                                    {TIME_SLOTS.map((t) => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </section>

                    {/* ── Step 3: Contact info ────────────────────────────── */}
                    <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <span className="bg-gray-200 text-gray-600 w-8 h-8 rounded-lg flex items-center justify-center text-sm">3</span>
                            ข้อมูลผู้ติดต่อ
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">ชื่อ-นามสกุล <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={contactName}
                                    onChange={(e) => setContactName(e.target.value)}
                                    placeholder="ชื่อ นามสกุล"
                                    className={`w-full bg-gray-50 border rounded-lg p-3 outline-none focus:border-primary ${errors.contactName ? 'border-red-400' : 'border-gray-200'}`}
                                />
                                <FieldError msg={errors.contactName} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">เบอร์โทรศัพท์ <span className="text-red-500">*</span></label>
                                <input
                                    type="tel"
                                    value={contactPhone}
                                    onChange={(e) => setContactPhone(e.target.value)}
                                    placeholder="0812345678"
                                    className={`w-full bg-gray-50 border rounded-lg p-3 outline-none focus:border-primary ${errors.contactPhone ? 'border-red-400' : 'border-gray-200'}`}
                                />
                                <FieldError msg={errors.contactPhone} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">หมายเหตุ (ไม่จำเป็น)</label>
                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                rows={3}
                                placeholder="เช่น รถจอดอยู่หน้าบ้านเลขที่..."
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 outline-none focus:border-primary resize-none"
                            />
                        </div>
                    </section>

                    {/* ── FAQ Section ─────────────────────────────────────── */}
                    <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Question weight="fill" className="text-blue-400 text-2xl" />
                            คำถามที่พบบ่อย
                        </h2>
                        <div className="divide-y divide-gray-100">
                            <FAQItem
                                q="ต้องไปดูรถด้วยตัวเองไหม?"
                                a="ไม่จำเป็นครับ ช่างจะวิดีโอคอลหาคุณขณะตรวจ และส่งรายงานให้ทันทีหลังตรวจเสร็จ คุณสามารถดูผ่านมือถือได้เลย"
                            />
                            <FAQItem
                                q="ใช้เวลาตรวจนานแค่ไหน?"
                                a="แพ็กเกจ Standard ใช้เวลาประมาณ 45-60 นาที ส่วน Premium Full Option ใช้เวลาประมาณ 60-90 นาทีรวมทดลองขับ"
                            />
                            <FAQItem
                                q="ตรวจแล้วรถมีปัญหา สามารถต่อรองราคาได้ไหม?"
                                a="ได้ครับ รายงานจาก Car2Hand สามารถใช้เป็นหลักฐานในการต่อรองราคากับผู้ขายได้ ทำให้คุณมีข้อมูลประกอบการตัดสินใจ"
                            />
                            <FAQItem
                                q="ถ้าฝนตกตรวจได้ไหม?"
                                a="หากฝนตกหนักจนไม่สามารถตรวจภายนอกได้ ช่างจะประสานงานเลื่อนนัดให้โดยไม่มีค่าใช้จ่ายเพิ่ม"
                            />
                            <FAQItem
                                q="ยกเลิกการจองได้ไหม?"
                                a="สามารถยกเลิกได้ฟรีก่อนวันนัดตรวจ 24 ชั่วโมง หากยกเลิกหลังจากนั้นอาจมีค่าธรรมเนียม"
                            />
                        </div>
                    </section>
                </div>

                {/* ── Right column (sticky sidebar) ───────────────────────── */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24 space-y-6">

                        {/* Order summary */}
                        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 relative overflow-hidden">
                            <h3 className="font-bold text-gray-800 mb-4 border-b border-gray-100 pb-3">สรุปรายการจอง</h3>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">แพ็กเกจ</span>
                                    <span className="font-bold text-gray-800">{selectedPkg?.name ?? '-'}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">ราคา</span>
                                    <span className="font-bold text-gray-800">{basePrice.toLocaleString()} ฿</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">ค่าเดินทางช่าง</span>
                                    <span className="font-bold text-green-600">ฟรี! (โปรโมชั่น)</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">ภาษีมูลค่าเพิ่ม (7%)</span>
                                    <span className="font-bold text-gray-800">{vat.toLocaleString()} ฿</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-end border-t border-gray-100 pt-4 mb-6">
                                <span className="text-sm font-bold text-gray-500">ยอดชำระรวม</span>
                                <span className="text-3xl font-bold text-primary">{total.toLocaleString()} ฿</span>
                            </div>

                            {submitError && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-sm text-red-600 flex items-start gap-2">
                                    <WarningCircle weight="fill" className="shrink-0 mt-0.5" />
                                    {submitError}
                                </div>
                            )}

                            <button
                                onClick={handleSubmit}
                                disabled={submitting || loadingPackages}
                                className="w-full bg-accent text-white py-3 rounded-xl font-bold shadow-lg shadow-orange-100 hover:bg-orange-600 transition flex items-center justify-center gap-2 mb-3 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {submitting ? (
                                    <>
                                        <SpinnerGap weight="bold" className="animate-spin" />
                                        กำลังจอง...
                                    </>
                                ) : (
                                    <>
                                        ยืนยันการจอง <ArrowLeft weight="bold" className="rotate-180" />
                                    </>
                                )}
                            </button>

                            <div className="text-center">
                                <span className="text-[10px] text-gray-400 flex items-center justify-center gap-1">
                                    <LockKey weight="fill" /> ชำระเงินปลอดภัยผ่าน QR / บัตรเครดิต
                                </span>
                            </div>
                        </div>

                        {/* Report preview */}
                        <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 text-center">
                            <h4 className="font-bold text-primary mb-2 text-sm">ตัวอย่างรายงานที่คุณจะได้รับ</h4>
                            <div className="relative bg-white rounded-xl shadow-md p-2 mb-3 transform rotate-2 hover:rotate-0 transition duration-300 cursor-pointer border border-gray-200">
                                <div className="flex justify-between items-center border-b border-gray-100 pb-2 mb-2">
                                    <div className="flex items-center gap-1">
                                        <div className="w-4 h-4 bg-primary rounded"></div>
                                        <span className="text-[8px] font-bold">Car2Hand Report</span>
                                    </div>
                                    <span className="text-[8px] bg-green-100 text-green-700 px-1 rounded font-bold">GRADE A</span>
                                </div>
                                <div className="space-y-1">
                                    <div className="h-2 bg-gray-100 rounded w-3/4"></div>
                                    <div className="h-2 bg-gray-100 rounded w-1/2"></div>
                                    <div className="h-10 bg-gray-200 rounded w-full mt-2"></div>
                                </div>
                            </div>
                            <Link href="#" className="text-xs text-accent font-bold hover:underline">ดูตัวอย่างไฟล์เต็ม PDF &gt;</Link>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}
