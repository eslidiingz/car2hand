"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    X,
    Facebook,
    MessageCircleMore,
    Phone,
    Lock,
    Eye,
    EyeOff,
    Loader2,
    AlertCircle
} from 'lucide-react';
import ForgotPasswordModal from './ForgotPasswordModal';

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
    const [isLineLoading, setIsLineLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [isFacebookLoading, setIsFacebookLoading] = useState(false);
    const [showForgotModal, setShowForgotModal] = useState(false);
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
        let { name, value } = e.target;

        if (name === 'phoneNumber') {
            value = value.replace(/\D/g, '').slice(0, 10);
        }

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
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
            const response = await fetch(`${API_URL}/auth/login`, {
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

            // Store user data
            if (rememberMe) {
                localStorage.setItem('user', JSON.stringify(userWithToken));
            } else {
                sessionStorage.setItem('user', JSON.stringify(userWithToken));
            }
            // Set session cookie for middleware route protection
            document.cookie = 'has_session=1; path=/; SameSite=Strict; max-age=604800';

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

    const handleGoogleLogin = async () => {
        setIsGoogleLoading(true);
        setError(null);
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
            const redirectUri = `${window.location.origin}/auth/google-login-callback`;
            const res = await fetch(`${API_URL}/auth/google/login-url?redirectUri=${encodeURIComponent(redirectUri)}`);
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'ไม่สามารถเชื่อมต่อ Google ได้');
            }

            window.location.href = data.url;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'ไม่สามารถเชื่อมต่อ Google ได้');
            setIsGoogleLoading(false);
        }
    };

    const handleFacebookLogin = async () => {
        setIsFacebookLoading(true);
        setError(null);
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
            const redirectUri = `${window.location.origin}/auth/facebook-login-callback`;
            const res = await fetch(`${API_URL}/auth/facebook/login-url?redirectUri=${encodeURIComponent(redirectUri)}`);
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'ไม่สามารถเชื่อมต่อ Facebook ได้');
            }

            window.location.href = data.url;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'ไม่สามารถเชื่อมต่อ Facebook ได้');
            setIsFacebookLoading(false);
        }
    };

    const handleLineLogin = async () => {
        setIsLineLoading(true);
        setError(null);
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
            const redirectUri = `${window.location.origin}/auth/line-login-callback`;
            const res = await fetch(`${API_URL}/auth/line/login-url?redirectUri=${encodeURIComponent(redirectUri)}`);
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'ไม่สามารถเชื่อมต่อ LINE ได้');
            }

            window.location.href = data.url;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'ไม่สามารถเชื่อมต่อ LINE ได้');
            setIsLineLoading(false);
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
                    <X />
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
                                <AlertCircle className="text-lg flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1 ml-1">เบอร์โทรศัพท์</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
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

                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1 ml-1">รหัสผ่าน</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
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
                                    {showPassword ? <Eye /> : <EyeOff />}
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
                            <button
                                type="button"
                                onClick={() => setShowForgotModal(true)}
                                disabled={isLoading || isLineLoading || isGoogleLoading || isFacebookLoading}
                                className="text-xs font-bold text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                ลืมรหัสผ่าน?
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || isLineLoading || isGoogleLoading || isFacebookLoading}
                            className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-opacity-90 transition shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="animate-spin" />
                                    <span>กำลังเข้าสู่ระบบ...</span>
                                </>
                            ) : (
                                <span>เข้าสู่ระบบ</span>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-6">
                        <div className="flex-1 h-px bg-gray-200"></div>
                        <span className="text-xs text-gray-400 font-medium">หรือ</span>
                        <div className="flex-1 h-px bg-gray-200"></div>
                    </div>

                    {/* Social Login Buttons */}
                    <div className="space-y-3">
                        {/* LINE Login Button */}
                        <button
                            type="button"
                            onClick={handleLineLogin}
                            disabled={isLoading || isLineLoading || isGoogleLoading || isFacebookLoading}
                            className="w-full bg-[#06C755] text-white py-3 rounded-xl font-bold hover:bg-[#05b34c] transition shadow-lg shadow-green-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLineLoading ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    <span>กำลังเชื่อมต่อ LINE...</span>
                                </>
                            ) : (
                                <>
                                    <MessageCircleMore size={20} />
                                    <span>เข้าสู่ระบบด้วย LINE</span>
                                </>
                            )}
                        </button>

                        {/* Google Login Button */}
                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={isLoading || isLineLoading || isGoogleLoading || isFacebookLoading}
                            className="w-full bg-white text-gray-700 py-3 rounded-xl font-bold border border-gray-200 hover:bg-gray-50 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isGoogleLoading ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    <span>กำลังเชื่อมต่อ Google...</span>
                                </>
                            ) : (
                                <>
                                    <svg width="20" height="20" viewBox="0 0 24 24">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    </svg>
                                    <span>เข้าสู่ระบบด้วย Google</span>
                                </>
                            )}
                        </button>

                        {/* Facebook Login Button */}
                        <button
                            type="button"
                            onClick={handleFacebookLogin}
                            disabled={isLoading || isLineLoading || isGoogleLoading || isFacebookLoading}
                            className="w-full bg-[#1877F2] text-white py-3 rounded-xl font-bold hover:bg-[#166fe5] transition shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isFacebookLoading ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    <span>กำลังเชื่อมต่อ Facebook...</span>
                                </>
                            ) : (
                                <>
                                    <Facebook size={20} />
                                    <span>เข้าสู่ระบบด้วย Facebook</span>
                                </>
                            )}
                        </button>
                    </div>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-500">
                            ยังไม่มีบัญชีใช่ไหม?
                            <button onClick={onSwitchToRegister} className="font-bold text-accent hover:underline ml-1">สมัครสมาชิกฟรี</button>
                        </p>
                    </div>
                </div>

            </div>

            {/* Forgot Password Modal */}
            <ForgotPasswordModal
                isOpen={showForgotModal}
                onClose={() => setShowForgotModal(false)}
            />
        </div>
    );
}
