"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Phone, Mail, Loader2, AlertCircle, UserCheck } from 'lucide-react';
import { apiFetch } from '@/lib/api';

export default function CompleteProfilePage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isChecking, setIsChecking] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userName, setUserName] = useState('');
    const [formData, setFormData] = useState({
        phoneNumber: '',
        email: '',
    });
    const [fieldErrors, setFieldErrors] = useState<{ phoneNumber?: string; email?: string }>({});

    // Check if user already has complete profile
    useEffect(() => {
        const checkProfile = async () => {
            try {
                const data = await apiFetch<{ user: { phoneNumber: string; email: string; fullName: string } }>('/users/me');
                const user = data.user;
                setUserName(user.fullName);

                // If user already has real phone and email, redirect to dashboard
                const hasRealEmail = user.email && !user.email.endsWith('@car2hand.placeholder');
                const hasRealPhone = user.phoneNumber && user.phoneNumber.length > 0;

                if (hasRealEmail && hasRealPhone) {
                    router.replace('/profile/dashboard');
                    return;
                }

                // Pre-fill if partial data exists
                if (hasRealEmail) setFormData(prev => ({ ...prev, email: user.email }));
                if (hasRealPhone) setFormData(prev => ({ ...prev, phoneNumber: user.phoneNumber }));
            } catch {
                // Not logged in, redirect to home
                router.replace('/');
                return;
            } finally {
                setIsChecking(false);
            }
        };

        checkProfile();
    }, [router]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let { name, value } = e.target;

        if (name === 'phoneNumber') {
            value = value.replace(/\D/g, '').slice(0, 10);
        }

        setFormData(prev => ({ ...prev, [name]: value }));
        setError(null);
        setFieldErrors(prev => ({ ...prev, [name]: undefined }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setFieldErrors({});

        // Validation
        const errors: { phoneNumber?: string; email?: string } = {};
        if (!formData.phoneNumber.trim() || formData.phoneNumber.length < 9) {
            errors.phoneNumber = 'กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง (9-10 หลัก)';
        }
        if (!formData.email.trim() || !formData.email.includes('@')) {
            errors.email = 'กรุณากรอกอีเมลให้ถูกต้อง';
        }
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        setIsLoading(true);

        try {
            await apiFetch('/users/me', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phoneNumber: formData.phoneNumber,
                    email: formData.email,
                }),
            });

            // Update stored user data with new info
            const stored = localStorage.getItem('user') || sessionStorage.getItem('user');
            if (stored) {
                const userData = JSON.parse(stored);
                userData.phoneNumber = formData.phoneNumber;
                userData.email = formData.email;
                localStorage.setItem('user', JSON.stringify(userData));
            }

            router.push('/profile/dashboard');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่';

            // Map backend error to specific field
            if (message.includes('เบอร์โทรศัพท์')) {
                setFieldErrors(prev => ({ ...prev, phoneNumber: message }));
            } else if (message.includes('อีเมล')) {
                setFieldErrors(prev => ({ ...prev, email: message }));
            } else {
                setError(message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (isChecking) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={40} />
            </div>
        );
    }

    return (
        <div className="min-h-[60vh] flex items-center justify-center px-4">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-10 max-w-md w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <UserCheck className="text-[#06C755]" size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">
                        ยินดีต้อนรับ{userName ? `, ${userName}` : ''}!
                    </h2>
                    <p className="text-gray-500 text-sm mt-2">
                        กรุณากรอกข้อมูลเพิ่มเติมเพื่อเริ่มต้นใช้งาน
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Error */}
                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                            <AlertCircle className="flex-shrink-0" size={18} />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Phone */}
                    <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1 ml-1">
                            เบอร์โทรศัพท์ <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Phone className={`absolute left-3 top-1/2 -translate-y-1/2 ${fieldErrors.phoneNumber ? 'text-red-400' : 'text-gray-400'}`} size={18} />
                            <input
                                type="tel"
                                inputMode="numeric"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleInputChange}
                                placeholder="08XXXXXXXX"
                                className={`form-input-icon-sm ${fieldErrors.phoneNumber ? '!border-red-400 !ring-red-100' : ''}`}
                                maxLength={10}
                                disabled={isLoading}
                            />
                        </div>
                        {fieldErrors.phoneNumber && (
                            <p className="text-red-500 text-xs mt-1 ml-1 flex items-center gap-1">
                                <AlertCircle size={12} />
                                {fieldErrors.phoneNumber}
                            </p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1 ml-1">
                            อีเมล <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 ${fieldErrors.email ? 'text-red-400' : 'text-gray-400'}`} size={18} />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="name@example.com"
                                className={`form-input-icon-sm ${fieldErrors.email ? '!border-red-400 !ring-red-100' : ''}`}
                                disabled={isLoading}
                            />
                        </div>
                        {fieldErrors.email && (
                            <p className="text-red-500 text-xs mt-1 ml-1 flex items-center gap-1">
                                <AlertCircle size={12} />
                                {fieldErrors.email}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-opacity-90 transition shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                <span>กำลังบันทึก...</span>
                            </>
                        ) : (
                            <span>บันทึกและเริ่มใช้งาน</span>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
