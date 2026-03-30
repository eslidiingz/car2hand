"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Bell, Check, Circle, CaretLeft, CaretRight } from '@phosphor-icons/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: string;
}

function timeAgo(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHour = Math.floor(diffMs / 3600000);
    const diffDay = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return 'เมื่อสักครู่';
    if (diffMin < 60) return `${diffMin} นาทีที่แล้ว`;
    if (diffHour < 24) return `${diffHour} ชั่วโมงที่แล้ว`;
    if (diffDay < 7) return `${diffDay} วันที่แล้ว`;
    return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 20;

    const getToken = useCallback(() => {
        const stored = localStorage.getItem('user') || sessionStorage.getItem('user');
        if (stored) {
            try {
                return JSON.parse(stored).token;
            } catch {
                return null;
            }
        }
        return null;
    }, []);

    const fetchNotifications = useCallback(async (p: number) => {
        const token = getToken();
        if (!token) return;
        setIsLoading(true);
        try {
            const res = await fetch(`${API_URL}/notifications?page=${p}&limit=${limit}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications ?? []);
                setTotalPages(data.totalPages ?? 1);
            }
        } catch {
            // silently fail
        } finally {
            setIsLoading(false);
        }
    }, [getToken]);

    useEffect(() => {
        fetchNotifications(page);
    }, [page, fetchNotifications]);

    const markAsRead = async (id: string) => {
        const token = getToken();
        if (!token) return;
        try {
            await fetch(`${API_URL}/notifications/${id}/read`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` },
            });
            setNotifications(prev =>
                prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
            );
        } catch {
            // silently fail
        }
    };

    const markAllAsRead = async () => {
        const token = getToken();
        if (!token) return;
        try {
            await fetch(`${API_URL}/notifications/read-all`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` },
            });
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch {
            // silently fail
        }
    };

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.isRead) {
            markAsRead(notification.id);
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-blue-50">
                            <Bell weight="fill" size={24} className="text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">การแจ้งเตือน</h1>
                            <p className="text-sm text-gray-500">
                                {unreadCount > 0 ? `มี ${unreadCount} รายการที่ยังไม่ได้อ่าน` : 'อ่านทั้งหมดแล้ว'}
                            </p>
                        </div>
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-primary hover:bg-blue-50 rounded-xl transition"
                        >
                            <Check weight="bold" size={16} />
                            อ่านทั้งหมด
                        </button>
                    )}
                </div>
            </div>

            {/* Notification List */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="p-12 text-center text-gray-400">
                        <div className="animate-spin text-3xl mb-2">&#9697;</div>
                        <p className="text-sm">กำลังโหลด...</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="p-12 text-center">
                        <Bell weight="thin" size={56} className="text-gray-200 mx-auto mb-3" />
                        <p className="text-gray-400 font-bold">ไม่มีการแจ้งเตือน</p>
                        <p className="text-gray-300 text-sm mt-1">เมื่อมีการแจ้งเตือนใหม่จะแสดงที่นี่</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {notifications.map(n => (
                            <button
                                key={n.id}
                                onClick={() => handleNotificationClick(n)}
                                className={`w-full text-left px-6 py-4 hover:bg-gray-50 transition flex gap-4 items-start ${
                                    !n.isRead ? 'bg-blue-50/30' : ''
                                }`}
                            >
                                {/* Unread indicator */}
                                <div className="pt-2 flex-shrink-0">
                                    {!n.isRead ? (
                                        <Circle weight="fill" size={10} className="text-blue-500" />
                                    ) : (
                                        <div className="w-2.5" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-4">
                                        <p className={`text-sm ${!n.isRead ? 'font-bold text-gray-800' : 'font-medium text-gray-600'}`}>
                                            {n.title}
                                        </p>
                                        <span className="text-[11px] text-gray-400 whitespace-nowrap flex-shrink-0">
                                            {timeAgo(n.createdAt)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {n.message}
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-3 px-6 py-4 border-t border-gray-100">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page <= 1}
                            className="p-2 rounded-lg hover:bg-gray-100 transition disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <CaretLeft weight="bold" size={16} />
                        </button>
                        <span className="text-sm text-gray-600 font-medium">
                            หน้า {page} / {totalPages}
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page >= totalPages}
                            className="p-2 rounded-lg hover:bg-gray-100 transition disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <CaretRight weight="bold" size={16} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
