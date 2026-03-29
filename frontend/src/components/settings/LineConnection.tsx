"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { CheckCircle, CircleNotch, LinkBreak, ChatCircleDots } from '@phosphor-icons/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface LineStatus {
    connected: boolean;
    lineDisplayName?: string;
    linePictureUrl?: string;
}

export default function LineConnection() {
    const [status, setStatus] = useState<LineStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [disconnecting, setDisconnecting] = useState(false);
    const [error, setError] = useState('');

    const getUserId = (): string | null => {
        try {
            const stored = localStorage.getItem('user') || sessionStorage.getItem('user');
            if (!stored) return null;
            const parsed = JSON.parse(stored);
            return parsed.id || null;
        } catch {
            return null;
        }
    };

    const fetchStatus = useCallback(async () => {
        const userId = getUserId();
        if (!userId) {
            setLoading(false);
            setError('ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่');
            return;
        }

        try {
            setLoading(true);
            setError('');
            const res = await fetch(`${API_URL}/auth/line/status?userId=${userId}`);
            if (!res.ok) throw new Error('Failed to fetch LINE status');
            const data = await res.json();
            setStatus(data);
        } catch {
            setError('ไม่สามารถตรวจสอบสถานะ LINE ได้ กรุณาลองใหม่อีกครั้ง');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStatus();
    }, [fetchStatus]);

    const handleConnect = async () => {
        const userId = getUserId();
        if (!userId) return;

        try {
            const redirectUri = `${window.location.origin}/profile/settings/line-callback`;
            const res = await fetch(
                `${API_URL}/auth/line/connect-url?userId=${userId}&redirectUri=${encodeURIComponent(redirectUri)}`
            );
            if (!res.ok) throw new Error('Failed to get LINE connect URL');
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            }
        } catch {
            setError('ไม่สามารถเชื่อมต่อ LINE ได้ กรุณาลองใหม่อีกครั้ง');
        }
    };

    const handleDisconnect = async () => {
        const userId = getUserId();
        if (!userId) return;

        try {
            setDisconnecting(true);
            setError('');
            const res = await fetch(`${API_URL}/auth/line/disconnect?userId=${userId}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error('Failed to disconnect LINE');
            await fetchStatus();
        } catch {
            setError('ไม่สามารถยกเลิกการเชื่อมต่อได้ กรุณาลองใหม่อีกครั้ง');
        } finally {
            setDisconnecting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <CircleNotch weight="bold" className="animate-spin text-3xl text-primary" />
                <span className="ml-3 text-gray-500">กำลังตรวจสอบสถานะ LINE...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-2xl">
            {/* LINE Connection Card */}
            <div className="border border-gray-100 rounded-xl p-6">
                <div className="flex items-start gap-4">
                    {/* LINE Icon */}
                    <div className="w-12 h-12 bg-[#06C755] rounded-xl flex items-center justify-center flex-shrink-0">
                        <ChatCircleDots weight="fill" className="text-white text-2xl" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-gray-800 text-lg">LINE</h3>
                            {status?.connected && (
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                    <CheckCircle weight="fill" size={14} />
                                    เชื่อมต่อแล้ว
                                </span>
                            )}
                        </div>

                        {status?.connected ? (
                            <>
                                <p className="text-sm text-gray-500 mb-4">
                                    เชื่อมต่อกับบัญชี LINE
                                    {status.lineDisplayName && (
                                        <span className="font-bold text-gray-700"> {status.lineDisplayName}</span>
                                    )}
                                    {' '}เรียบร้อยแล้ว คุณจะได้รับการแจ้งเตือนผ่าน LINE
                                </p>

                                {status.linePictureUrl && (
                                    <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                                        <img
                                            src={status.linePictureUrl}
                                            alt="LINE Profile"
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                        <span className="text-sm font-medium text-gray-700">
                                            {status.lineDisplayName}
                                        </span>
                                    </div>
                                )}

                                <button
                                    onClick={handleDisconnect}
                                    disabled={disconnecting}
                                    className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-bold hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {disconnecting ? (
                                        <CircleNotch weight="bold" className="animate-spin" size={16} />
                                    ) : (
                                        <LinkBreak weight="bold" size={16} />
                                    )}
                                    {disconnecting ? 'กำลังยกเลิก...' : 'ยกเลิกการเชื่อมต่อ'}
                                </button>
                            </>
                        ) : (
                            <>
                                <p className="text-sm text-gray-500 mb-1">
                                    เชื่อมต่อ LINE เพื่อรับการแจ้งเตือน
                                </p>
                                <p className="text-xs text-gray-400 mb-4">
                                    เชื่อมต่อบัญชี LINE ของคุณเพื่อรับการแจ้งเตือนจากระบบ เช่น สถานะประกาศ, การอนุมัติ, และข่าวสารต่างๆ ผ่าน LINE
                                </p>

                                <button
                                    onClick={handleConnect}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#06C755] text-white rounded-lg text-sm font-bold hover:bg-[#05b34c] transition shadow-sm"
                                >
                                    <ChatCircleDots weight="fill" size={18} />
                                    เชื่อมต่อ LINE
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3">
                    {error}
                </div>
            )}

            {/* Info Section */}
            <div className="bg-gray-50 rounded-xl p-5">
                <h4 className="font-bold text-gray-700 text-sm mb-3">การแจ้งเตือนที่คุณจะได้รับผ่าน LINE</h4>
                <ul className="space-y-2 text-sm text-gray-500">
                    <li className="flex items-center gap-2">
                        <CheckCircle weight="fill" size={16} className="text-green-500 flex-shrink-0" />
                        สถานะประกาศขายรถ (อนุมัติ / ไม่อนุมัติ / หมดอายุ)
                    </li>
                    <li className="flex items-center gap-2">
                        <CheckCircle weight="fill" size={16} className="text-green-500 flex-shrink-0" />
                        แจ้งเตือนเมื่อมีผู้สนใจรถของคุณ
                    </li>
                    <li className="flex items-center gap-2">
                        <CheckCircle weight="fill" size={16} className="text-green-500 flex-shrink-0" />
                        ข่าวสารและโปรโมชั่นจาก Car2Hand
                    </li>
                </ul>
            </div>
        </div>
    );
}
