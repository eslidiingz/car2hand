"use client";

import React, { useState, useEffect } from 'react';
import {
    X,
    Phone,
    Loader2,
    AlertCircle,
    CheckCircle,
    KeyRound,
    ArrowLeft,
    ExternalLink,
} from 'lucide-react';

interface ForgotPasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onBackToLogin?: () => void;
}

export default function ForgotPasswordModal({
    isOpen,
    onClose,
    onBackToLogin,
}: ForgotPasswordModalProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [devResetUrl, setDevResetUrl] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            setError(null);
            setSuccess(false);
            setPhoneNumber('');
            setDevResetUrl(null);
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 10);
        setPhoneNumber(value);
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!phoneNumber.trim()) {
            setError('กรุณากรอกเบอร์โทรศัพท์');
            return;
        }
        if (phoneNumber.length < 9) {
            setError('เบอร์โทรศัพท์ไม่ถูกต้อง');
            return;
        }

        setIsLoading(true);
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
            const res = await fetch(`${API_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phoneNumber }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || data.error || 'เกิดข้อผิดพลาด');
            }

            setSuccess(true);
            if (data.devResetUrl) setDevResetUrl(data.devResetUrl);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด กรุณาลองใหม่');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen && !isVisible) return null;

    return (
        <div
            className={`fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div
                className={`bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative transform transition-transform duration-300 z-10 mx-4 ${isOpen ? 'scale-100' : 'scale-95'}`}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-500 transition"
                >
                    <X />
                </button>

                <div className="w-full p-8 md:p-12 bg-white">
                    {!success ? (
                        <>
                            <div className="text-center mb-6">
                                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <KeyRound className="text-primary" size={26} />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800">ลืมรหัสผ่าน?</h2>
                                <p className="text-gray-500 text-sm mt-1">
                                    กรอกเบอร์โทรศัพท์ที่ลงทะเบียนไว้
                                    เราจะส่งลิงก์รีเซ็ตรหัสผ่านให้คุณ
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {error && (
                                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                                        <AlertCircle className="flex-shrink-0" size={18} />
                                        <span>{error}</span>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1 ml-1">
                                        เบอร์โทรศัพท์
                                    </label>
                                    <div className="relative">
                                        <Phone
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                            size={18}
                                        />
                                        <input
                                            type="tel"
                                            inputMode="numeric"
                                            value={phoneNumber}
                                            onChange={handlePhoneChange}
                                            placeholder="08XXXXXXXX"
                                            className="form-input-icon-sm"
                                            maxLength={10}
                                            disabled={isLoading}
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-opacity-90 transition shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="animate-spin" />
                                            <span>กำลังส่งลิงก์...</span>
                                        </>
                                    ) : (
                                        <span>ส่งลิงก์รีเซ็ตรหัสผ่าน</span>
                                    )}
                                </button>
                            </form>

                            {onBackToLogin && (
                                <button
                                    onClick={onBackToLogin}
                                    disabled={isLoading}
                                    className="w-full mt-4 text-sm text-gray-500 hover:text-primary font-semibold flex items-center justify-center gap-1 transition"
                                >
                                    <ArrowLeft size={16} />
                                    กลับไปเข้าสู่ระบบ
                                </button>
                            )}
                        </>
                    ) : (
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="text-green-500" size={36} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                ส่งลิงก์เรียบร้อย
                            </h2>
                            <p className="text-sm text-gray-500 leading-relaxed mb-6">
                                หากเบอร์โทรศัพท์นี้มีอยู่ในระบบ
                                เราได้ส่งลิงก์รีเซ็ตรหัสผ่านให้คุณแล้ว
                                <br />
                                ลิงก์จะหมดอายุภายใน 1 ชั่วโมง
                            </p>

                            {devResetUrl && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4 text-left">
                                    <p className="text-xs font-bold text-yellow-700 mb-2">
                                        🔧 Development Mode
                                    </p>
                                    <a
                                        href={devResetUrl}
                                        className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline break-all"
                                    >
                                        <ExternalLink size={12} className="flex-shrink-0" />
                                        {devResetUrl}
                                    </a>
                                </div>
                            )}

                            <button
                                onClick={onClose}
                                className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-opacity-90 transition shadow-lg"
                            >
                                ปิด
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
