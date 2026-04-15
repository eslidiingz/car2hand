"use client";

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
    Lock,
    Eye,
    EyeOff,
    Loader2,
    AlertCircle,
    CheckCircle,
    KeyRound,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

function ResetPasswordContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token') || '';

    const [tokenStatus, setTokenStatus] = useState<'checking' | 'valid' | 'invalid'>('checking');
    const [tokenError, setTokenError] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Verify token on mount
    useEffect(() => {
        if (!token) {
            setTokenStatus('invalid');
            setTokenError('ไม่พบ token สำหรับรีเซ็ตรหัสผ่าน');
            return;
        }

        const verify = async () => {
            try {
                const res = await fetch(
                    `${API_URL}/auth/reset-password/verify?token=${encodeURIComponent(token)}`
                );
                const data = await res.json();
                if (res.ok && data.valid) {
                    setTokenStatus('valid');
                } else {
                    setTokenStatus('invalid');
                    setTokenError(data.message || 'ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้องหรือหมดอายุแล้ว');
                }
            } catch {
                setTokenStatus('invalid');
                setTokenError('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
            }
        };
        verify();
    }, [token]);

    const checkStrength = (pwd: string) => {
        let strength = 0;
        if (pwd.length > 5) strength++;
        if (pwd.length > 8) strength++;
        if (/[A-Z]/.test(pwd)) strength++;
        if (/[0-9]/.test(pwd)) strength++;
        setPasswordStrength(strength);
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
        checkStrength(e.target.value);
        setSubmitError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError(null);

        if (password.length < 8) {
            setSubmitError('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร');
            return;
        }
        if (password !== confirm) {
            setSubmitError('รหัสผ่านยืนยันไม่ตรงกัน');
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch(`${API_URL}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || data.error || 'เกิดข้อผิดพลาด');
            }

            setSuccess(true);
            setTimeout(() => {
                window.location.href = '/';
            }, 2500);
        } catch (err) {
            setSubmitError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-surface min-h-[calc(100vh-4rem)] flex items-center justify-center py-10 px-4">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12 max-w-md w-full">
                {tokenStatus === 'checking' && (
                    <div className="text-center py-8">
                        <Loader2 className="animate-spin text-primary mx-auto mb-4" size={40} />
                        <p className="text-gray-500">กำลังตรวจสอบลิงก์...</p>
                    </div>
                )}

                {tokenStatus === 'invalid' && (
                    <div className="text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="text-red-500" size={36} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">ลิงก์ไม่ถูกต้อง</h2>
                        <p className="text-sm text-gray-500 mb-6">{tokenError}</p>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-opacity-90 transition"
                        >
                            กลับหน้าแรก
                        </Link>
                    </div>
                )}

                {tokenStatus === 'valid' && !success && (
                    <>
                        <div className="text-center mb-6">
                            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <KeyRound className="text-primary" size={26} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800">ตั้งรหัสผ่านใหม่</h2>
                            <p className="text-gray-500 text-sm mt-1">
                                กรอกรหัสผ่านใหม่ที่คุณต้องการใช้
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {submitError && (
                                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                                    <AlertCircle className="flex-shrink-0" size={18} />
                                    <span>{submitError}</span>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1 ml-1">
                                    รหัสผ่านใหม่
                                </label>
                                <div className="relative">
                                    <Lock
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                        size={18}
                                    />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={handlePasswordChange}
                                        placeholder="อย่างน้อย 8 ตัวอักษร"
                                        className="form-input-icon-sm pr-10"
                                        disabled={isSubmitting}
                                        autoFocus
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((v) => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                                    </button>
                                </div>

                                <div className="flex gap-1 mt-2 h-1">
                                    <div
                                        className={`flex-1 rounded-full transition-colors duration-300 ${passwordStrength >= 1 ? 'bg-red-400' : 'bg-gray-200'}`}
                                    />
                                    <div
                                        className={`flex-1 rounded-full transition-colors duration-300 ${passwordStrength >= 2 ? 'bg-yellow-400' : 'bg-gray-200'}`}
                                    />
                                    <div
                                        className={`flex-1 rounded-full transition-colors duration-300 ${passwordStrength >= 3 ? 'bg-blue-400' : 'bg-gray-200'}`}
                                    />
                                    <div
                                        className={`flex-1 rounded-full transition-colors duration-300 ${passwordStrength >= 4 ? 'bg-green-500' : 'bg-gray-200'}`}
                                    />
                                </div>
                                <div className="text-[10px] text-gray-400 mt-1 text-right">
                                    {passwordStrength < 2 && 'ความปลอดภัย: ต่ำ'}
                                    {passwordStrength === 2 && 'ความปลอดภัย: ปานกลาง'}
                                    {passwordStrength === 3 && 'ความปลอดภัย: ดี'}
                                    {passwordStrength >= 4 && 'ความปลอดภัย: ดีเยี่ยม'}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1 ml-1">
                                    ยืนยันรหัสผ่านใหม่
                                </label>
                                <div className="relative">
                                    <Lock
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                        size={18}
                                    />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={confirm}
                                        onChange={(e) => setConfirm(e.target.value)}
                                        placeholder="พิมพ์รหัสผ่านอีกครั้ง"
                                        className="form-input-icon-sm"
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-opacity-90 transition shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="animate-spin" />
                                        <span>กำลังบันทึก...</span>
                                    </>
                                ) : (
                                    <span>ตั้งรหัสผ่านใหม่</span>
                                )}
                            </button>
                        </form>
                    </>
                )}

                {success && (
                    <div className="text-center py-4">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="text-green-500" size={36} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">สำเร็จ!</h2>
                        <p className="text-sm text-gray-500 mb-4">
                            ตั้งรหัสผ่านใหม่เรียบร้อยแล้ว
                            <br />
                            กำลังนำคุณไปหน้าแรกเพื่อเข้าสู่ระบบ...
                        </p>
                        <Loader2 className="animate-spin text-gray-300 mx-auto" size={24} />
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-[60vh] flex items-center justify-center">
                    <Loader2 className="animate-spin text-primary" size={40} />
                </div>
            }
        >
            <ResetPasswordContent />
        </Suspense>
    );
}
