"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Bell, Check, Circle } from '@phosphor-icons/react';

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
    return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
}

export default function NotificationBell() {
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

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

    const fetchUnreadCount = useCallback(async () => {
        const token = getToken();
        if (!token) return;
        try {
            const res = await fetch(`${API_URL}/notifications/unread-count`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setUnreadCount(data.count ?? 0);
            }
        } catch {
            // silently fail
        }
    }, [getToken]);

    const fetchNotifications = useCallback(async () => {
        const token = getToken();
        if (!token) return;
        setIsLoading(true);
        try {
            const res = await fetch(`${API_URL}/notifications?limit=5`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications ?? []);
            }
        } catch {
            // silently fail
        } finally {
            setIsLoading(false);
        }
    }, [getToken]);

    // Poll unread count every 60 seconds
    useEffect(() => {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 60000);
        return () => clearInterval(interval);
    }, [fetchUnreadCount]);

    // Close on outside click
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const handleToggle = () => {
        const next = !isOpen;
        setIsOpen(next);
        if (next) {
            fetchNotifications();
        }
    };

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
            setUnreadCount(prev => Math.max(0, prev - 1));
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
            setUnreadCount(0);
        } catch {
            // silently fail
        }
    };

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.isRead) {
            markAsRead(notification.id);
        }
    };

    const displayCount = unreadCount > 9 ? '9+' : `${unreadCount}`;

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={handleToggle}
                className="relative p-2 rounded-full transition group hover:bg-gray-100"
                title="การแจ้งเตือน"
            >
                <Bell
                    size={22}
                    weight={unreadCount > 0 ? 'fill' : 'regular'}
                    className={unreadCount > 0 ? 'text-primary' : 'text-gray-500 group-hover:text-primary'}
                />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white translate-x-1/4 -translate-y-1/4 shadow-sm px-0.5">
                        {displayCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="fixed inset-x-3 top-16 sm:absolute sm:inset-x-auto sm:right-0 sm:top-12 sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                        <h3 className="font-bold text-gray-800 text-sm">การแจ้งเตือน</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-xs text-primary font-bold hover:underline flex items-center gap-1"
                            >
                                <Check weight="bold" size={12} />
                                อ่านทั้งหมด
                            </button>
                        )}
                    </div>

                    {/* Notification List */}
                    <div className="max-h-80 overflow-y-auto">
                        {isLoading ? (
                            <div className="p-6 text-center text-gray-400 text-sm">
                                กำลังโหลด...
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-6 text-center">
                                <Bell weight="thin" size={40} className="text-gray-200 mx-auto mb-2" />
                                <p className="text-gray-400 text-sm">ไม่มีการแจ้งเตือน</p>
                            </div>
                        ) : (
                            notifications.map(n => (
                                <button
                                    key={n.id}
                                    onClick={() => handleNotificationClick(n)}
                                    className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition flex gap-3 items-start ${
                                        !n.isRead ? 'bg-blue-50/40' : ''
                                    }`}
                                >
                                    {/* Unread dot */}
                                    <div className="pt-1.5 flex-shrink-0">
                                        {!n.isRead ? (
                                            <Circle weight="fill" size={8} className="text-blue-500" />
                                        ) : (
                                            <div className="w-2" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm ${!n.isRead ? 'font-bold text-gray-800' : 'font-medium text-gray-600'}`}>
                                            {n.title}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                                            {n.message}
                                        </p>
                                        <p className="text-[10px] text-gray-400 mt-1">
                                            {timeAgo(n.createdAt)}
                                        </p>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-100 px-4 py-2.5">
                        <Link
                            href="/profile/notifications"
                            onClick={() => setIsOpen(false)}
                            className="block text-center text-sm font-bold text-primary hover:underline"
                        >
                            ดูทั้งหมด
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
