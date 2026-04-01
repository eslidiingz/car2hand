"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    X,
    Tag,
    MagicWand,
    ChatsCircle,
    FacebookLogo,
    Envelope,
    LockKey,
    Eye,
    EyeSlash,
    CircleNotch,
    CheckCircle,
    WarningCircle,
    Phone,
    User
} from '@phosphor-icons/react';

interface RegisterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSwitchToLogin: () => void;
    redirectTo?: string;
}

interface FormData {
    fullName: string;
    phoneNumber: string;
    email: string;
    password: string;
}

export default function RegisterModal({ isOpen, onClose, onSwitchToLogin, redirectTo }: RegisterModalProps) {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        fullName: '',
        phoneNumber: '',
        email: '',
        password: ''
    });

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const checkStrength = (password: string) => {
        let strength = 0;
        if (password.length > 5) strength++;
        if (password.length > 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        setPasswordStrength(strength);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let { name, value } = e.target;
        
        if (name === 'phoneNumber') {
            value = value.replace(/\D/g, '').slice(0, 10);
        }
        
        setFormData(prev => ({ ...prev, [name]: value }));
        if (name === 'password') {
            checkStrength(value);
        }
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (!formData.fullName.trim()) {
            setError('กรุณากรอกชื่อ-นามสกุล');
            return;
        }
        if (!formData.phoneNumber.trim()) {
            setError('กรุณากรอกเบอร์โทรศัพท์');
            return;
        }
        if (!formData.email.trim()) {
            setError('กรุณากรอกอีเมล');
            return;
        }
        if (!formData.password || formData.password.length < 8) {
            setError('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร');
            return;
        }
        if (!acceptTerms) {
            setError('กรุณายอมรับเงื่อนไขการให้บริการ');
            return;
        }

        setIsLoading(true);

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก');
            }

            // Include token in user data for API calls
            if (data.user && data.accessToken) {
                const userWithToken = {
                    ...data.user,
                    token: data.accessToken
                };
                localStorage.setItem('user', JSON.stringify(userWithToken));

                // Dispatch custom event to notify other components
                window.dispatchEvent(new CustomEvent('userLogin', { detail: userWithToken }));
            }

            setSuccess(true);
            setTimeout(() => {
                onClose();
                router.push(redirectTo || '/profile/dashboard');
            }, 1500);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการสมัครสมาชิก');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen && !isVisible) return null;

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>

            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className={`bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative transform transition-transform duration-300 z-10 h-auto overflow-y-auto mx-4 ${isOpen ? 'scale-100' : 'scale-95'}`}>

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-500 transition"
                >
                    <X weight="bold" />
                </button>

                {/* Content */}
                <div className="w-full p-8 md:p-10 bg-white">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">สร้างบัญชีใหม่</h2>
                        <p className="text-gray-500 text-sm mt-1">ใช้เวลาไม่ถึง 1 นาที</p>
                    </div>
                    
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        {/* Error Message */}
                        {error && (
                            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                                <WarningCircle weight="bold" className="text-lg flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Success Message */}
                        {success && (
                            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-green-600 text-sm">
                                <CheckCircle weight="bold" className="text-lg flex-shrink-0" />
                                <span>สมัครสมาชิกสำเร็จ! กำลังนำคุณไปหน้าเข้าสู่ระบบ...</span>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1 ml-1">ชื่อ-นามสกุล <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <User weight="bold" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        placeholder="สมชาย รักรถ"
                                        className="form-input-icon-sm"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1 ml-1">เบอร์โทรศัพท์ <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <Phone weight="bold" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="tel"
                                        inputMode="numeric"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleInputChange}
                                        placeholder="08XXXXXXXX"
                                        className="form-input-icon-sm"
                                        maxLength={10}
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1 ml-1">อีเมล <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <Envelope weight="bold" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="name@example.com"
                                    className="form-input-icon-sm"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1 ml-1">รหัสผ่าน <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <LockKey weight="bold" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    placeholder="อย่างน้อย 8 ตัวอักษร"
                                    className="form-input-icon-sm pr-10"
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <Eye weight="bold" /> : <EyeSlash weight="bold" />}
                                </button>
                            </div>

                            <div className="flex gap-1 mt-2 h-1">
                                <div className={`flex-1 rounded-full transition-colors duration-300 ${passwordStrength >= 1 ? 'bg-red-400' : 'bg-gray-200'}`}></div>
                                <div className={`flex-1 rounded-full transition-colors duration-300 ${passwordStrength >= 2 ? 'bg-yellow-400' : 'bg-gray-200'}`}></div>
                                <div className={`flex-1 rounded-full transition-colors duration-300 ${passwordStrength >= 3 ? 'bg-blue-400' : 'bg-gray-200'}`}></div>
                                <div className={`flex-1 rounded-full transition-colors duration-300 ${passwordStrength >= 4 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                            </div>
                            <div className="text-[10px] text-gray-400 mt-1 text-right">
                                {passwordStrength < 2 && 'ความปลอดภัย: ต่ำ'}
                                {passwordStrength === 2 && 'ความปลอดภัย: ปานกลาง'}
                                {passwordStrength === 3 && 'ความปลอดภัย: ดี'}
                                {passwordStrength >= 4 && 'ความปลอดภัย: ดีเยี่ยม'}
                            </div>
                        </div>

                        <label className="flex items-start gap-2 cursor-pointer mt-4">
                            <input
                                type="checkbox"
                                checked={acceptTerms}
                                onChange={(e) => setAcceptTerms(e.target.checked)}
                                className="mt-1 w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary accent-primary"
                                disabled={isLoading}
                            />
                            <span className="text-xs text-gray-500 leading-snug">
                                ฉันยอมรับ <a href="#" className="text-primary hover:underline">เงื่อนไขการให้บริการ</a> และ <a href="#" className="text-primary hover:underline">นโยบายความเป็นส่วนตัว</a> ของ Car2Hand
                            </span>
                        </label>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-opacity-90 transition shadow-lg mt-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <CircleNotch weight="bold" className="animate-spin" />
                                    <span>กำลังสมัครสมาชิก...</span>
                                </>
                            ) : (
                                <span>สมัครสมาชิก</span>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-500">
                            มีบัญชีอยู่แล้ว?
                            <button onClick={onSwitchToLogin} className="font-bold text-accent hover:underline ml-1">เข้าสู่ระบบ</button>
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}
