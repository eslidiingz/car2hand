"use client";

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeft,
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
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

type KycType = 'ID' | 'BUSINESS' | 'DEALER';
type KycStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

interface Submission {
    id: string;
    type: KycType;
    status: KycStatus;
    submittedAt: string;
    reviewedAt: string | null;
    reviewNote: string | null;
    requestedShowroom: 'INDIVIDUAL' | 'TENT' | 'DEALER' | null;
}

interface KycState {
    verificationLevel: 'NONE' | 'ID' | 'BUSINESS' | 'DEALER';
    isVerified: boolean;
    verifiedAt: string | null;
    showroomType: 'INDIVIDUAL' | 'TENT' | 'DEALER';
    submissions: Submission[];
    hasPending: boolean;
}

const LEVEL_META: Record<KycType, { label: string; icon: React.ReactNode; description: string }> = {
    ID: {
        label: 'ยืนยันบุคคล',
        icon: <UserIcon size={20} />,
        description: 'สำหรับบุคคลทั่วไป ต้องใช้บัตรประชาชนและเซลฟี่ถือบัตร',
    },
    BUSINESS: {
        label: 'ร้านรับรอง',
        icon: <Building2 size={20} />,
        description: 'สำหรับเต็นท์รถ/ร้านค้า ต้องมีทะเบียนพาณิชย์',
    },
    DEALER: {
        label: 'ดีลเลอร์รับรอง',
        icon: <Shield size={20} />,
        description: 'สำหรับตัวแทนจำหน่าย ต้องมีหนังสือแต่งตั้งจากค่ายรถ',
    },
};

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
}: {
    label: string;
    file: File | null;
    setFile: (f: File | null) => void;
    required?: boolean;
    hint?: string;
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
                    <button
                        type="button"
                        onClick={() => setFile(null)}
                        className="absolute top-2 right-2 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-sm"
                    >
                        <X size={14} />
                    </button>
                </div>
            ) : (
                <label className="border-2 border-dashed border-gray-200 rounded-xl aspect-[4/3] flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-blue-50/30 transition">
                    <Upload size={24} className="text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500 font-medium">แตะเพื่ออัปโหลด</span>
                    {hint && <span className="text-[11px] text-gray-400 mt-1 px-3 text-center">{hint}</span>}
                    <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
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

export default function VerifyPage() {
    const [loading, setLoading] = useState(true);
    const [state, setState] = useState<KycState | null>(null);
    const [selectedType, setSelectedType] = useState<KycType>('ID');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Form fields
    const [fullName, setFullName] = useState('');
    const [idNumber, setIdNumber] = useState('');
    const [businessName, setBusinessName] = useState('');
    const [taxId, setTaxId] = useState('');
    const [requestedShowroom, setRequestedShowroom] = useState<'INDIVIDUAL' | 'TENT' | 'DEALER'>('INDIVIDUAL');

    const [idCardImage, setIdCardImage] = useState<File | null>(null);
    const [selfieImage, setSelfieImage] = useState<File | null>(null);
    const [businessCertImage, setBusinessCertImage] = useState<File | null>(null);
    const [addressProofImage, setAddressProofImage] = useState<File | null>(null);
    const [dealerAppointmentDoc, setDealerAppointmentDoc] = useState<File | null>(null);

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
        setRequestedShowroom('INDIVIDUAL');
        setIdCardImage(null); setSelfieImage(null); setBusinessCertImage(null);
        setAddressProofImage(null); setDealerAppointmentDoc(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null); setSuccess(null);
        const token = getAuthToken();
        if (!token) { setError('กรุณาเข้าสู่ระบบ'); return; }

        // Showroom default per type
        let showroom: 'INDIVIDUAL' | 'TENT' | 'DEALER' = requestedShowroom;
        if (selectedType === 'ID' && showroom !== 'INDIVIDUAL') showroom = 'INDIVIDUAL';
        if (selectedType === 'DEALER' && showroom === 'INDIVIDUAL') showroom = 'DEALER';

        const form = new FormData();
        form.set('type', selectedType);
        form.set('fullName', fullName);
        form.set('idNumber', idNumber);
        form.set('requestedShowroom', showroom);
        if (idCardImage) form.set('idCardImage', idCardImage);
        if (selfieImage) form.set('selfieImage', selfieImage);

        if (selectedType !== 'ID') {
            form.set('businessName', businessName);
            form.set('taxId', taxId);
            if (businessCertImage) form.set('businessCertImage', businessCertImage);
            if (addressProofImage) form.set('addressProofImage', addressProofImage);
        }
        if (selectedType === 'DEALER' && dealerAppointmentDoc) {
            form.set('dealerAppointmentDoc', dealerAppointmentDoc);
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

    const handleCancel = async (id: string) => {
        const token = getAuthToken();
        if (!token) return;
        await fetch(`${API_URL}/kyc/cancel/${id}`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
        });
        await fetchState();
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-2">
                <Link href="/profile/settings" className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition">
                    <ArrowLeft size={18} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">ยืนยันตัวตน</h1>
                    <p className="text-sm text-gray-500">เพิ่มความน่าเชื่อถือให้ประกาศของคุณ</p>
                </div>
            </div>

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
                                        onClick={() => handleCancel(s.id)}
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

            {/* New submission form */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6">
                <h3 className="font-bold text-gray-800 mb-4">ยื่นคำขอยืนยันตัวตน</h3>

                {!canSubmit && (
                    <div className="bg-blue-50 text-blue-700 text-sm p-3 rounded-xl mb-4">
                        คุณมีคำขอรอตรวจสอบอยู่ หากต้องการส่งใหม่ กรุณายกเลิกคำขอเดิมก่อน
                    </div>
                )}

                {/* Type selector */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                    {(['ID', 'BUSINESS', 'DEALER'] as KycType[]).map((t) => (
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FileField
                            label="รูปบัตรประชาชน"
                            file={idCardImage}
                            setFile={setIdCardImage}
                            required
                            hint="ถ่ายให้เห็นข้อความชัดเจน ไม่เบลอ"
                        />
                        <FileField
                            label="รูปเซลฟี่ถือบัตร"
                            file={selfieImage}
                            setFile={setSelfieImage}
                            required
                            hint="ถือบัตร ปชช. ให้เห็นใบหน้าและหมายเลขบัตร"
                        />
                    </div>

                    {/* Business fields */}
                    {selectedType !== 'ID' && (
                        <>
                            <div className="pt-3 border-t border-gray-100">
                                <h4 className="font-bold text-sm text-gray-700 mb-3">ข้อมูลธุรกิจ</h4>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1.5 text-gray-700">ชื่อร้าน/บริษัท <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        value={businessName}
                                        onChange={(e) => setBusinessName(e.target.value)}
                                        disabled={!canSubmit}
                                        required
                                        className="form-input-sm"
                                        placeholder="เช่น เต็นท์เฮียชัย นนทบุรี"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5 text-gray-700">เลขทะเบียนพาณิชย์/ผู้เสียภาษี <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        value={taxId}
                                        onChange={(e) => setTaxId(e.target.value)}
                                        disabled={!canSubmit}
                                        required
                                        className="form-input-sm font-mono"
                                        placeholder="0123456789012"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FileField
                                    label="หนังสือรับรอง/ทะเบียนพาณิชย์"
                                    file={businessCertImage}
                                    setFile={setBusinessCertImage}
                                    required
                                />
                                <FileField
                                    label="หลักฐานที่อยู่ร้าน"
                                    file={addressProofImage}
                                    setFile={setAddressProofImage}
                                    required
                                    hint="เช่น ใบเสร็จค่าไฟ/ค่าน้ำ 3 เดือนล่าสุด"
                                />
                            </div>
                        </>
                    )}

                    {/* Dealer only */}
                    {selectedType === 'DEALER' && (
                        <FileField
                            label="หนังสือแต่งตั้งจากค่ายรถ"
                            file={dealerAppointmentDoc}
                            setFile={setDealerAppointmentDoc}
                            required
                            hint="เอกสารยืนยันการเป็นตัวแทนจำหน่าย"
                        />
                    )}

                    {/* Showroom type (BUSINESS & DEALER only) */}
                    {selectedType !== 'ID' && (
                        <div>
                            <label className="block text-sm font-medium mb-1.5 text-gray-700">ประเภทร้าน</label>
                            <div className="flex gap-2 flex-wrap">
                                {(selectedType === 'BUSINESS' ? ['INDIVIDUAL', 'TENT'] : ['INDIVIDUAL', 'TENT', 'DEALER']).map((v) => (
                                    <button
                                        key={v}
                                        type="button"
                                        disabled={!canSubmit}
                                        onClick={() => setRequestedShowroom(v as 'INDIVIDUAL' | 'TENT' | 'DEALER')}
                                        className={`px-4 py-2 rounded-xl border text-sm font-medium transition ${
                                            requestedShowroom === v
                                                ? 'border-primary bg-primary text-white'
                                                : 'border-gray-200 text-gray-600 hover:border-primary'
                                        }`}
                                    >
                                        {v === 'INDIVIDUAL' ? 'บุคคล' : v === 'TENT' ? 'เต็นท์รถ' : 'ดีลเลอร์'}
                                    </button>
                                ))}
                            </div>
                        </div>
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
        </div>
    );
}
