"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
    Bell,
    Check,
    Circle,
    CaretLeft,
    CaretRight,
    CheckCircle,
    Megaphone,
    Package,
    CarProfile,
    Warning,
} from '@phosphor-icons/react';

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
    if (diffHour < 24) return `${diffHour} ชม.ที่แล้ว`;
    if (diffDay < 7) return `${diffDay} วันที่แล้ว`;
    return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
}

// Notification type → icon + color
function getTypeStyle(type: string) {
    switch (type) {
        case 'LISTING_APPROVED':
            return { icon: <CheckCircle weight="fill" size={20} />, color: 'text-green-500', bg: 'bg-green-50' };
        case 'LISTING_REJECTED':
            return { icon: <Warning weight="fill" size={20} />, color: 'text-red-500', bg: 'bg-red-50' };
        case 'PACKAGE_APPROVED':
        case 'PACKAGE_REJECTED':
            return { icon: <Package weight="fill" size={20} />, color: 'text-blue-500', bg: 'bg-blue-50' };
        case 'LISTING_EXPIRING':
        case 'LISTING_EXPIRED':
            return { icon: <Warning weight="fill" size={20} />, color: 'text-amber-500', bg: 'bg-amber-50' };
        case 'PROMOTION':
            return { icon: <Megaphone weight="fill" size={20} />, color: 'text-purple-500', bg: 'bg-purple-50' };
        default:
            return { icon: <Bell weight="fill" size={20} />, color: 'text-primary', bg: 'bg-blue-50' };
    }
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
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-gray-800">การแจ้งเตือน</h1>
                {unreadCount > 0 && (
                    <button
                        onClick={markAllAsRead}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-primary bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                    >
                        <Check weight="bold" size={14} />
                        อ่านทั้งหมด
                    </button>
                )}
            </div>

            {/* Unread count badge */}
            {unreadCount > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-xl">
                    <Circle weight="fill" size={8} className="text-blue-500" />
                    <span className="text-xs text-blue-700 font-medium">ยังไม่ได้อ่าน {unreadCount} รายการ</span>
                </div>
            )}

            {/* Notification List */}
            {isLoading ? (
                <div className="py-16 text-center text-gray-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
                    <p className="text-sm">กำลังโหลด...</p>
                </div>
            ) : notifications.length === 0 ? (
                <div className="py-16 text-center">
                    <Bell weight="thin" size={56} className="text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-400 font-bold">ไม่มีการแจ้งเตือน</p>
                    <p className="text-gray-300 text-sm mt-1">เมื่อมีการแจ้งเตือนใหม่จะแสดงที่นี่</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {notifications.map(n => {
                        const typeStyle = getTypeStyle(n.type);
                        return (
                            <button
                                key={n.id}
                                onClick={() => handleNotificationClick(n)}
                                className={`w-full text-left rounded-xl p-4 transition ${
                                    !n.isRead
                                        ? 'bg-white border-l-4 border-l-blue-500 border border-gray-100 shadow-sm'
                                        : 'bg-white border border-gray-100 opacity-70'
                                }`}
                            >
                                <div className="flex gap-3">
                                    {/* Icon */}
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${typeStyle.bg} ${typeStyle.color}`}>
                                        {typeStyle.icon}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className={`text-sm leading-snug ${!n.isRead ? 'font-bold text-gray-800' : 'font-medium text-gray-500'}`}>
                                                {n.title}
                                            </p>
                                            {!n.isRead && (
                                                <Circle weight="fill" size={8} className="text-blue-500 flex-shrink-0 mt-1.5" />
                                            )}
                                        </div>
                                        <p className={`text-xs mt-1 leading-relaxed ${!n.isRead ? 'text-gray-600' : 'text-gray-400'}`}>
                                            {n.message}
                                        </p>
                                        <p className="text-[11px] text-gray-400 mt-2">
                                            {timeAgo(n.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 py-4">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page <= 1}
                        className="p-2 rounded-lg hover:bg-gray-100 transition disabled:opacity-30"
                    >
                        <CaretLeft weight="bold" size={16} />
                    </button>
                    <span className="text-sm text-gray-600 font-medium">
                        {page} / {totalPages}
                    </span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page >= totalPages}
                        className="p-2 rounded-lg hover:bg-gray-100 transition disabled:opacity-30"
                    >
                        <CaretRight weight="bold" size={16} />
                    </button>
                </div>
            )}
        </div>
    );
}
