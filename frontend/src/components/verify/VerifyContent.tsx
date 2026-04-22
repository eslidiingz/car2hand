"use client";

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    BadgeCheck,
    Building2,
    Loader2,
    Shield,
    Upload,
    User as UserIcon,
    X,
    Check,
    Clock,
    XCircle,
    CircleCheckBig,
    Crown,
    Flame,
} from 'lucide-react';
import ConfirmDialog from '@/components/ConfirmDialog';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

type KycType = 'INDIVIDUAL' | 'CORPORATE';
type KycStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

interface Submission {
    id: string;
    type: KycType;
    status: KycStatus;
    submittedAt: string;
    reviewedAt: string | null;
    reviewNote: string | null;
    requestedShowroom: 'INDIVIDUAL' | 'CORPORATE' | null;
}

interface KycState {
    verificationLevel: 'NONE' | 'INDIVIDUAL' | 'CORPORATE';
    isVerified: boolean;
    verifiedAt: string | null;
    showroomType: 'INDIVIDUAL' | 'CORPORATE';
    submissions: Submission[];
    hasPending: boolean;
}

const LEVEL_META: Record<KycType, { label: string; icon: React.ReactNode; description: string }> = {
    INDIVIDUAL: {
        label: 'บุคคลธรรมดา',
        icon: <UserIcon size={20} />,
        description: 'สำหรับบุคคลทั่วไป ต้องใช้บัตรประชาชนและเซลฟี่ถือบัตร',
    },
    CORPORATE: {
        label: 'นิติบุคคล',
        icon: <Building2 size={20} />,
        description: 'สำหรับร้านค้า/เต๊นท์/บริษัท ใช้ใบทะเบียนพาณิชย์หรือหนังสือรับรองบริษัทและเลขผู้เสียภาษี',
    },
};

/**
 * Badge ที่ปรากฏจริงบนประกาศขับเคลื่อนด้วย "แพกเก็จ × KYC"
 * (ดู frontend/src/components/ListingCard.tsx -> getBadgeForTier)
 * — แสดงเฉพาะเมื่อ KYC ผ่านเท่านั้น
 */
const PACKAGE_BADGE_PREVIEWS: {
    pkg: string;
    pkgLabel: string;
    borderClass: string;
    badgeClass: string;
    badgeIcon: React.ReactNode;
    badgeLabel: string;
}[] = [
    {
        pkg: 'basic',
        pkgLabel: 'Basic',
        borderClass: 'border border-gray-200',
        badgeClass: 'bg-emerald-500 text-white',
        badgeIcon: <CircleCheckBig size={10} />,
        badgeLabel: 'ยืนยันตัวตนแล้ว',
    },
    {
        pkg: 'standard',
        pkgLabel: 'Standard',
        borderClass: 'border border-blue-300',
        badgeClass: 'bg-blue-500 text-white',
        badgeIcon: <CircleCheckBig size={10} />,
        badgeLabel: 'Verified Seller',
    },
    {
        pkg: 'professional',
        pkgLabel: 'Professional',
        borderClass: 'border border-orange-300',
        badgeClass: 'bg-orange-500 text-white',
        badgeIcon: <Flame size={10} />,
        badgeLabel: 'Hot Deal',
    },
    {
        pkg: 'premium',
        pkgLabel: 'Premium (Dealer)',
        borderClass: 'border-2 border-yellow-400 shadow-md shadow-yellow-100',
        badgeClass: 'bg-gradient-to-r from-yellow-500 to-amber-600 text-white',
        badgeIcon: <Crown size={10} />,
        badgeLabel: 'Premium Choice',
    },
];

function getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (!raw) return null;
    try {
        return JSON.parse(raw).token || null;
    } catch {
        return null;
    }
}

function StatusBadge({ status }: { status: KycStatus }) {
    const map: Record<KycStatus, { label: string; className: string; icon: React.ReactNode }> = {
        PENDING: { label: 'รอตรวจสอบ', className: 'bg-yellow-100 text-yellow-700', icon: <Clock size={12} /> },
        APPROVED: { label: 'อนุมัติแล้ว', className: 'bg-green-100 text-green-700', icon: <Check size={12} /> },
        REJECTED: { label: 'ไม่ผ่าน', className: 'bg-red-100 text-red-700', icon: <XCircle size={12} /> },
        CANCELLED: { label: 'ยกเลิก', className: 'bg-gray-100 text-gray-500', icon: <X size={12} /> },
    };
    const m = map[status];
    return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${m.className}`}>{m.icon} {m.label}</span>;
}

function FileField({
    label,
    file,
    setFile,
    required,
    hint,
    disabled,
}: {
    label: string;
    file: File | null;
    setFile: (f: File | null) => void;
    required?: boolean;
    hint?: string;
    disabled?: boolean;
}) {
    const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
    useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

    return (
        <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            {file ? (
                <div className="relative border border-gray-200 rounded-xl overflow-hidden bg-gray-50 aspect-[4/3] flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={preview!} alt={label} className="max-w-full max-h-full object-contain" />
                    {!disabled && (
                        <button
                            type="button"
                            onClick={() => setFile(null)}
                            className="absolute top-2 right-2 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-sm"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
            ) : (
                <label
                    className={`border-2 border-dashed border-gray-200 rounded-xl aspect-[4/3] flex flex-col items-center justify-center transition ${
                        disabled
                            ? 'bg-gray-50 cursor-not-allowed opacity-60'
                            : 'cursor-pointer hover:border-primary hover:bg-blue-50/30'
                    }`}
                >
                    <Upload size={24} className="text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500 font-medium">แตะเพื่ออัปโหลด</span>
                    {hint && <span className="text-[11px] text-gray-400 mt-1 px-3 text-center">{hint}</span>}
                    <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        disabled={disabled}
                        onChange={(e) => {
                            const f = e.target.files?.[0] || null;
                            if (f && f.size > 8 * 1024 * 1024) {
                                alert('ไฟล์ต้องไม่เกิน 8MB');
                                return;
                            }
                            setFile(f);
                        }}
                    />
                </label>
            )}
        </div>
    );
}

export function VerifyContent() {
    const [loading, setLoading] = useState(true);
    const [state, setState] = useState<KycState | null>(null);
    const [selectedType, setSelectedType] = useState<KycType>('INDIVIDUAL');
    const [showUpgradeForm, setShowUpgradeForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    // Cancel-confirm modal state: id of submission being cancelled, or null
    const [cancelTargetId, setCancelTargetId] = useState<string | null>(null);
    const [cancelling, setCancelling] = useState(false);

    // Form fields
    const [fullName, setFullName] = useState('');
    const [idNumber, setIdNumber] = useState('');
    const [businessName, setBusinessName] = useState('');
    const [taxId, setTaxId] = useState('');

    const [idCardImage, setIdCardImage] = useState<File | null>(null);
    const [selfieImage, setSelfieImage] = useState<File | null>(null);
    const [businessCertImage, setBusinessCertImage] = useState<File | null>(null);

    const fetchState = useCallback(async () => {
        const token = getAuthToken();
        if (!token) { setLoading(false); return; }
        try {
            const res = await fetch(`${API_URL}/kyc/me`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) setState(await res.json());
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchState(); }, [fetchState]);

    const resetForm = () => {
        setFullName(''); setIdNumber(''); setBusinessName(''); setTaxId('');
        setIdCardImage(null); setSelfieImage(null); setBusinessCertImage(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null); setSuccess(null);
        const token = getAuthToken();
        if (!token) { setError('กรุณาเข้าสู่ระบบ'); return; }

        // Auto-map showroom type from KYC tier (no separate selector needed)
        const showroom: 'INDIVIDUAL' | 'CORPORATE' = selectedType === 'INDIVIDUAL' ? 'INDIVIDUAL' : 'CORPORATE';

        const form = new FormData();
        form.set('type', selectedType);
        form.set('fullName', fullName);
        form.set('idNumber', idNumber);
        form.set('requestedShowroom', showroom);
        if (idCardImage) form.set('idCardImage', idCardImage);
        // Selfie only required/sent for personal verification
        if (selectedType === 'INDIVIDUAL' && selfieImage) form.set('selfieImage', selfieImage);

        if (selectedType === 'CORPORATE') {
            form.set('businessName', businessName);
            form.set('taxId', taxId);
            if (businessCertImage) form.set('businessCertImage', businessCertImage);
        }

        setSubmitting(true);
        try {
            const res = await fetch(`${API_URL}/kyc/submit`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: form,
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.message || data.error || 'ยื่นคำขอไม่สำเร็จ');
                return;
            }
            setSuccess(data.message || 'ยื่นคำขอเรียบร้อย');
            resetForm();
            await fetchState();
        } catch {
            setError('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้');
        } finally {
            setSubmitting(false);
        }
    };

    const confirmCancel = async () => {
        if (!cancelTargetId) return;
        const token = getAuthToken();
        if (!token) return;
        setCancelling(true);
        try {
            await fetch(`${API_URL}/kyc/cancel/${cancelTargetId}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
            await fetchState();
            setCancelTargetId(null);
        } finally {
            setCancelling(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    if (!state) {
        return (
            <div className="text-center py-16">
                <p className="text-gray-500">กรุณาเข้าสู่ระบบเพื่อยืนยันตัวตน</p>
            </div>
        );
    }

    const verifiedBadge = state.verificationLevel !== 'NONE' ? LEVEL_META[state.verificationLevel as KycType] : null;
    const canSubmit = !state.hasPending;

    // Available upgrade tiers: only levels strictly above current verification.
    // NONE → INDIVIDUAL / CORPORATE, INDIVIDUAL → CORPORATE, CORPORATE → (none)
    const LEVEL_ORDER: Record<'NONE' | KycType, number> = { NONE: 0, INDIVIDUAL: 1, CORPORATE: 2 };
    const availableTypes = (['INDIVIDUAL', 'CORPORATE'] as KycType[]).filter(
        (t) => LEVEL_ORDER[t] > LEVEL_ORDER[state.verificationLevel]
    );
    const atMaxLevel = availableTypes.length === 0;

    return (
        <div className="space-y-6">
            {/* Current level */}
            {verifiedBadge ? (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-5 flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl bg-green-500 text-white flex items-center justify-center flex-shrink-0">
                        <BadgeCheck size={24} />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-green-800">บัญชีของคุณได้รับการยืนยัน</h3>
                        <p className="text-sm text-green-700/80 mt-0.5">
                            ระดับ: <strong>{verifiedBadge.label}</strong>
                            {state.verifiedAt && <span className="text-xs ml-2">• {new Date(state.verifiedAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}</span>}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl bg-yellow-400 text-white flex items-center justify-center flex-shrink-0">
                        <Shield size={22} />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-yellow-800">ยังไม่ได้ยืนยันตัวตน</h3>
                        <p className="text-sm text-yellow-700/80 mt-0.5">
                            ผู้ซื้อจะไม่เห็น badge รับรองบนประกาศของคุณจนกว่าจะยืนยันสำเร็จ
                        </p>
                    </div>
                </div>
            )}

            {/* Badge preview — Package × KYC matrix (actual badge rendered on listings) */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6">
                <div className="flex items-center gap-2 mb-1">
                    <BadgeCheck size={18} className="text-primary" />
                    <h3 className="font-bold text-gray-800">ตัวอย่าง badge ตามแพกเก็จ</h3>
                </div>
                <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                    Badge บนประกาศขึ้นอยู่กับ <strong>แพกเก็จที่ใช้</strong> × <strong>สถานะการยืนยันตัวตน</strong> —
                    ยืนยันตัวตนแล้วเท่านั้นจึงจะแสดง badge บนประกาศของคุณ
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {PACKAGE_BADGE_PREVIEWS.map((p) => (
                        <div
                            key={p.pkg}
                            className={`relative rounded-xl bg-white p-3 ${p.borderClass}`}
                        >
                            <div className="absolute top-2 left-2">
                                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold shadow-sm ${p.badgeClass}`}>
                                    {p.badgeIcon}
                                    {p.badgeLabel}
                                </span>
                            </div>
                            <div className="aspect-[4/3] rounded-lg bg-gray-100 mb-2 flex items-center justify-center text-gray-300 text-[10px]">
                                รูปประกาศ
                            </div>
                            <p className="text-[11px] font-bold text-gray-800">{p.pkgLabel}</p>
                            <p className="text-[10px] text-gray-400">+ ยืนยันตัวตน</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* History */}
            {state.submissions.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-2xl p-5">
                    <h3 className="font-bold text-gray-800 mb-3">ประวัติการยื่นคำขอ</h3>
                    <div className="divide-y divide-gray-100">
                        {state.submissions.map((s) => (
                            <div key={s.id} className="py-3 flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-medium text-sm text-gray-800">{LEVEL_META[s.type].label}</span>
                                        <StatusBadge status={s.status} />
                                    </div>
                                    <div className="text-xs text-gray-400 mt-0.5">
                                        ยื่นเมื่อ {new Date(s.submittedAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </div>
                                    {s.status === 'REJECTED' && s.reviewNote && (
                                        <p className="text-xs text-red-600 mt-1 bg-red-50 px-2 py-1 rounded-md inline-block">
                                            เหตุผล: {s.reviewNote}
                                        </p>
                                    )}
                                </div>
                                {s.status === 'PENDING' && (
                                    <button
                                        onClick={() => setCancelTargetId(s.id)}
                                        className="text-xs text-gray-500 hover:text-red-500 font-medium whitespace-nowrap"
                                    >
                                        ยกเลิก
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Already at max level — no more upgrades available */}
            {atMaxLevel && (
                <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 text-center">
                    <BadgeCheck size={40} className="mx-auto text-amber-500 mb-2" />
                    <h3 className="font-bold text-gray-800">คุณได้รับการยืนยันระดับสูงสุดแล้ว</h3>
                    <p className="text-sm text-gray-500 mt-1">ไม่มีระดับการยืนยันที่สูงกว่านี้</p>
                </div>
            )}

            {/* Verified but has upgrade path — collapsed behind a button so the empty form
             * doesn't mislead users into thinking their previously submitted data was lost. */}
            {!atMaxLevel && verifiedBadge && !showUpgradeForm && canSubmit && (
                <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6">
                    <div className="flex items-start sm:items-center gap-3 flex-col sm:flex-row">
                        <div className="flex-1">
                            <h3 className="font-bold text-gray-800">ต้องการอัพเกรดระดับการยืนยัน?</h3>
                            <p className="text-sm text-gray-500 mt-0.5">
                                ส่งเอกสารเพิ่มเพื่อเพิ่มระดับรับรอง — ได้ badge ที่สูงขึ้นบนประกาศ
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                setShowUpgradeForm(true);
                                setSelectedType(availableTypes[0]);
                            }}
                            className="px-4 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 whitespace-nowrap"
                        >
                            อัพเกรดระดับการยืนยัน
                        </button>
                    </div>
                </div>
            )}

            {/* New submission form (NONE user, or verified user who chose to upgrade) */}
            {!atMaxLevel && (!verifiedBadge || showUpgradeForm) && (
            <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3 mb-4">
                    <h3 className="font-bold text-gray-800">
                        {verifiedBadge ? 'อัพเกรดระดับการยืนยัน' : 'ยื่นคำขอยืนยันตัวตน'}
                    </h3>
                    {verifiedBadge && (
                        <button
                            type="button"
                            onClick={() => setShowUpgradeForm(false)}
                            className="text-xs text-gray-500 hover:text-gray-700"
                        >
                            ยกเลิก
                        </button>
                    )}
                </div>

                {!canSubmit && (
                    <div className="bg-blue-50 text-blue-700 text-sm p-3 rounded-xl mb-4">
                        คุณมีคำขอรอตรวจสอบอยู่ หากต้องการส่งใหม่ กรุณายกเลิกคำขอเดิมก่อน
                    </div>
                )}

                {/* Type selector — only tiers above current verification */}
                <div className={`grid grid-cols-1 gap-3 mb-5 ${availableTypes.length === 2 ? 'sm:grid-cols-2' : ''}`}>
                    {availableTypes.map((t) => (
                        <button
                            key={t}
                            type="button"
                            disabled={!canSubmit}
                            onClick={() => setSelectedType(t)}
                            className={`text-left p-4 rounded-xl border-2 transition disabled:opacity-50 disabled:cursor-not-allowed ${
                                selectedType === t
                                    ? 'border-primary bg-blue-50'
                                    : 'border-gray-200 hover:border-primary/40'
                            }`}
                        >
                            <div className="flex items-center gap-2 mb-1 text-primary">
                                {LEVEL_META[t].icon}
                                <span className="font-bold text-sm text-gray-800">{LEVEL_META[t].label}</span>
                            </div>
                            <p className="text-xs text-gray-500 leading-snug">{LEVEL_META[t].description}</p>
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Identity — required for all tiers */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1.5 text-gray-700">ชื่อ-นามสกุล <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                disabled={!canSubmit}
                                required
                                className="form-input-sm"
                                placeholder="ตามบัตรประชาชน"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5 text-gray-700">เลขบัตรประชาชน <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                inputMode="numeric"
                                maxLength={13}
                                value={idNumber}
                                onChange={(e) => setIdNumber(e.target.value.replace(/\D/g, ''))}
                                disabled={!canSubmit}
                                required
                                className="form-input-sm font-mono"
                                placeholder="1234567890123"
                            />
                        </div>
                    </div>

                    <div className={`grid grid-cols-1 ${selectedType === 'INDIVIDUAL' ? 'sm:grid-cols-2' : ''} gap-4`}>
                        <FileField
                            label="รูปบัตรประชาชน"
                            file={idCardImage}
                            setFile={setIdCardImage}
                            required
                            disabled={!canSubmit}
                            hint="ถ่ายให้เห็นข้อความชัดเจน ไม่เบลอ"
                        />
                        {selectedType === 'INDIVIDUAL' && (
                            <FileField
                                label="รูปเซลฟี่ถือบัตร"
                                file={selfieImage}
                                setFile={setSelfieImage}
                                required
                                disabled={!canSubmit}
                                hint="ถือบัตร ปชช. ให้เห็นใบหน้าและหมายเลขบัตร"
                            />
                        )}
                    </div>

                    {/* Corporate fields */}
                    {selectedType === 'CORPORATE' && (
                        <>
                            <div className="pt-3 border-t border-gray-100">
                                <h4 className="font-bold text-sm text-gray-700 mb-3">ข้อมูลร้าน/บริษัท</h4>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1.5 text-gray-700">
                                        ชื่อร้าน/บริษัท <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={businessName}
                                        onChange={(e) => setBusinessName(e.target.value)}
                                        disabled={!canSubmit}
                                        required
                                        className="form-input-sm"
                                        placeholder="เช่น เต็นท์เฮียชัย นนทบุรี / บริษัท คาร์ทูแฮนด์ จำกัด"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5 text-gray-700">
                                        เลขผู้เสียภาษี <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={13}
                                        value={taxId}
                                        onChange={(e) => setTaxId(e.target.value.replace(/\D/g, ''))}
                                        disabled={!canSubmit}
                                        required
                                        className="form-input-sm font-mono"
                                        placeholder="0123456789012"
                                    />
                                </div>
                            </div>
                            <FileField
                                label="ใบทะเบียนพาณิชย์ / หนังสือรับรองบริษัท"
                                file={businessCertImage}
                                setFile={setBusinessCertImage}
                                required
                                disabled={!canSubmit}
                                hint="ใบทะเบียนพาณิชย์ หรือหนังสือรับรองนิติบุคคลอายุไม่เกิน 6 เดือน"
                            />
                        </>
                    )}

                    {/* Feedback */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-xl">{error}</div>
                    )}
                    {success && (
                        <div className="bg-green-50 border border-green-200 text-green-700 text-sm p-3 rounded-xl">{success}</div>
                    )}

                    <div className="pt-3 border-t border-gray-100 flex justify-end">
                        <button
                            type="submit"
                            disabled={submitting || !canSubmit}
                            className="bg-primary text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-900/10 hover:bg-opacity-90 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? <Loader2 size={18} className="animate-spin" /> : <BadgeCheck size={18} />}
                            {submitting ? 'กำลังส่ง...' : 'ส่งคำขอยืนยัน'}
                        </button>
                    </div>
                </form>

                <p className="text-xs text-gray-400 mt-4 leading-relaxed">
                    หมายเหตุ: ข้อมูลบัตรประชาชนและเอกสารทั้งหมดถูกจัดเก็บอย่างปลอดภัย ใช้เพื่อการยืนยันตัวตนเท่านั้น
                    ตรวจสอบใช้เวลา 1–3 วันทำการ
                </p>
            </div>
            )}

            <ConfirmDialog
                open={!!cancelTargetId}
                onClose={() => setCancelTargetId(null)}
                onConfirm={confirmCancel}
                title="ยืนยันการยกเลิก"
                description={
                    <>
                        คุณแน่ใจหรือไม่ว่าต้องการยกเลิกคำขอยืนยันตัวตนนี้?
                        <br />
                        <span className="text-xs text-gray-400">หากยกเลิกแล้วจะต้องเริ่มยื่นคำขอใหม่</span>
                    </>
                }
                cancelLabel="ไม่ยกเลิก"
                confirmLabel={cancelling ? 'กำลังยกเลิก...' : 'ยืนยันยกเลิก'}
                loading={cancelling}
            />
        </div>
    );
}

