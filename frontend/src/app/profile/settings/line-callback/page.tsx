"use client";

import React, { Suspense, useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export default function LineCallbackPage() {
    return (
        <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={32} /></div>}>
            <LineCallbackContent />
        </Suspense>
    );
}

function LineCallbackContent() {
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
            setErrorMessage('ไม่พบข้อมูลที่จำเป็นสำหรับการเชื่อมต่อ LINE');
            return;
        }

        const processCallback = async () => {
            try {
                const redirectUri = `${window.location.origin}/profile/settings/line-callback`;

                const res = await fetch(`${API_URL}/auth/line/callback`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code, state, redirectUri }),
                });

                if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    throw new Error(data.message || 'การเชื่อมต่อ LINE ล้มเหลว');
                }

                setStatus('success');

                // Redirect back to settings after short delay
                setTimeout(() => {
                    window.location.href = '/profile/settings?line=connected';
                }, 2000);
            } catch (err) {
                setStatus('error');
                setErrorMessage(
                    err instanceof Error
                        ? err.message
                        : 'เกิดข้อผิดพลาดในการเชื่อมต่อ LINE กรุณาลองใหม่อีกครั้ง'
                );
            }
        };

        processCallback();
    }, [searchParams]);

    return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 max-w-md w-full mx-4 text-center">
                {status === 'loading' && (
                    <>
                        <Loader2
                                                       className="animate-spin text-5xl text-[#06C755] mx-auto mb-4"
                        />
                        <h2 className="text-xl font-bold text-gray-800 mb-2">
                            กำลังเชื่อมต่อ LINE...
                        </h2>
                        <p className="text-sm text-gray-500">
                            กรุณารอสักครู่ ระบบกำลังเชื่อมต่อบัญชี LINE ของคุณ
                        </p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="text-4xl text-green-500" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">
                            เชื่อมต่อ LINE สำเร็จ
                        </h2>
                        <p className="text-sm text-gray-500 mb-4">
                            บัญชี LINE ของคุณถูกเชื่อมต่อเรียบร้อยแล้ว กำลังกลับไปหน้าตั้งค่า...
                        </p>
                        <Loader2
                                                       className="animate-spin text-xl text-gray-300 mx-auto"
                        />
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="text-4xl text-red-500" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">
                            การเชื่อมต่อล้มเหลว
                        </h2>
                        <p className="text-sm text-gray-500 mb-6">
                            {errorMessage}
                        </p>
                        <Link
                            href="/profile/settings"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-opacity-90 transition"
                        >
                            กลับไปหน้าตั้งค่า
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}
