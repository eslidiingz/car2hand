"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    X,
    CarProfile,
    FacebookLogo,
    ChatCircleDots,
    Phone,
    LockKey,
    Eye,
    EyeSlash,
    CircleNotch,
    WarningCircle
} from '@phosphor-icons/react';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSwitchToRegister: () => void;
    redirectTo?: string;
}

interface LoginFormData {
    phoneNumber: string;
    password: string;
}

export default function LoginModal({ isOpen, onClose, onSwitchToRegister, redirectTo }: LoginModalProps) {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [rememberMe, setRememberMe] = useState(false);
    const [formData, setFormData] = useState<LoginFormData>({
        phoneNumber: '',
        password: ''
    });

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            setError(null);
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (!formData.phoneNumber.trim()) {
            setError('กรุณากรอกเบอร์โทรศัพท์');
            return;
        }
        if (!formData.password) {
            setError('กรุณากรอกรหัสผ่าน');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:8000/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
            }

            // Include token in user data for API calls
            const userWithToken = {
                ...data.user,
                token: data.accessToken
            };

            // Store user data (you can use localStorage, context, or state management)
            if (rememberMe) {
                localStorage.setItem('user', JSON.stringify(userWithToken));
            } else {
                sessionStorage.setItem('user', JSON.stringify(userWithToken));
            }

            // Dispatch custom event to notify other components (like WishlistContext)
            window.dispatchEvent(new CustomEvent('userLogin', { detail: userWithToken }));

            onClose();
            router.push(redirectTo || '/profile/dashboard');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
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
            <div className={`bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative transform transition-transform duration-300 z-10 mx-4 ${isOpen ? 'scale-100' : 'scale-95'}`}>

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-500 transition"
                >
                    <X weight="bold" />
                </button>

                {/* Content */}
                <div className="w-full p-8 md:p-12 bg-white">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-800">ยินดีต้อนรับ 👋</h2>
                        <p className="text-gray-500 text-sm mt-1">เข้าสู่ระบบเพื่อดำเนินการต่อ</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Error Message */}
                        {error && (
                            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                                <WarningCircle weight="bold" className="text-lg flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1 ml-1">เบอร์โทรศัพท์</label>
                            <div className="relative">
                                <Phone weight="bold" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="tel"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleInputChange}
                                    placeholder="08x-xxx-xxxx"
                                    className="form-input-icon-sm"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1 ml-1">รหัสผ่าน</label>
                            <div className="relative">
                                <LockKey weight="bold" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    placeholder="••••••••"
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
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary accent-primary"
                                    disabled={isLoading}
                                />
                                <span className="text-xs text-gray-500">จดจำฉันไว้</span>
                            </label>
                            <Link href="#" className="text-xs font-bold text-primary hover:underline">ลืมรหัสผ่าน?</Link>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-opacity-90 transition shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <CircleNotch weight="bold" className="animate-spin" />
                                    <span>กำลังเข้าสู่ระบบ...</span>
                                </>
                            ) : (
                                <span>เข้าสู่ระบบ</span>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-500">
                            ยังไม่มีบัญชีใช่ไหม?
                            <button onClick={onSwitchToRegister} className="font-bold text-accent hover:underline ml-1">สมัครสมาชิกฟรี</button>
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}
