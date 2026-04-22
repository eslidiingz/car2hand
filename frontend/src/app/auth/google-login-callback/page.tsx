"use client";

import React, { Suspense, useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export default function GoogleLoginCallbackPage() {
    return (
        <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={32} /></div>}>
            <GoogleLoginCallbackContent />
        </Suspense>
    );
}

function GoogleLoginCallbackContent() {
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [errorMessage, setErrorMessage] = useState('');
    const hasProcessed = useRef(false);

    useEffect(() => {
        if (hasProcessed.current) return;
        hasProcessed.current = true;

        const code = searchParams.get('code');
        const state = searchParams.get('state');

        if (!code || !state) {
            setStatus('error');
            setErrorMessage('ไม่พบข้อมูลที่จำเป็นสำหรับการเข้าสู่ระบบด้วย Google');
            return;
        }

        const processLogin = async () => {
            try {
                const redirectUri = `${window.location.origin}/auth/google-login-callback`;

                const res = await fetch(`${API_URL}/auth/google/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code, state, redirectUri }),
                });

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.message || 'การเข้าสู่ระบบด้วย Google ล้มเหลว');
                }

                // Store user data with token (same pattern as LoginModal)
                const userWithToken = {
                    ...data.user,
                    token: data.accessToken,
                };
                localStorage.setItem('user', JSON.stringify(userWithToken));

                // Set session cookie for middleware route protection
                document.cookie = 'has_session=1; path=/; SameSite=Strict; max-age=604800';

                // Dispatch custom event to notify other components
                window.dispatchEvent(new CustomEvent('userLogin', { detail: userWithToken }));

                setStatus('success');

                // Redirect based on whether user is new
                setTimeout(() => {
                    if (data.isNewUser) {
                        // New user — must complete profile (phone)
                        window.location.href = '/auth/complete-profile';
                    } else {
                        window.location.href = '/profile/dashboard';
                    }
                }, 1500);
            } catch (err) {
                setStatus('error');
                setErrorMessage(
                    err instanceof Error
                        ? err.message
                        : 'เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วย Google กรุณาลองใหม่อีกครั้ง'
                );
            }
        };

        processLogin();
    }, [searchParams]);

    return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 max-w-md w-full mx-4 text-center">
                {status === 'loading' && (
                    <>
                        <Loader2 className="animate-spin text-5xl text-blue-500 mx-auto mb-4" size={48} />
                        <h2 className="text-xl font-bold text-gray-800 mb-2">
                            กำลังเข้าสู่ระบบด้วย Google...
                        </h2>
                        <p className="text-sm text-gray-500">
                            กรุณารอสักครู่ ระบบกำลังตรวจสอบข้อมูลของคุณ
                        </p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="text-green-500" size={40} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">
                            เข้าสู่ระบบสำเร็จ
                        </h2>
                        <p className="text-sm text-gray-500 mb-4">
                            ยินดีต้อนรับ! กำลังนำคุณไปหน้าถัดไป...
                        </p>
                        <Loader2 className="animate-spin text-gray-300 mx-auto" size={24} />
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="text-red-500" size={40} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">
                            เข้าสู่ระบบล้มเหลว
                        </h2>
                        <p className="text-sm text-gray-500 mb-6">
                            {errorMessage}
                        </p>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-opacity-90 transition"
                        >
                            กลับหน้าแรก
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}
