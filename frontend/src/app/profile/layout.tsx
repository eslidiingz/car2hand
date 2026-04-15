"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutGrid,
    Warehouse,
    Car,
    Heart,
    MessageCircleMore,
    Settings,
    LogOut,
    User,
    ChevronRight,
    Loader2,
    Package,
    Bell
} from 'lucide-react';
import ProfileSidebar from '@/components/ProfileSidebar';

interface UserData {
    id: string;
    email: string;
    fullName: string;
    phoneNumber: string;
    isActive: boolean;
    createdAt?: string;
    avatar?: string;
}

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<UserData | null>(null);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    // Format date helper
    const formatMemberDate = (dateString?: string) => {
        if (!dateString) return 'ไม่ทราบวันที่';
        const date = new Date(dateString);
        const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
        return `${months[date.getMonth()]} ${date.getFullYear() + 543}`;
    };

    // Get initials for avatar
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    useEffect(() => {
        // Check if user is logged in
        const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');

        if (!storedUser) {
            // Redirect to home page if not logged in
            router.push('/');
            return;
        }

        try {
            const userData = JSON.parse(storedUser) as UserData;

            // Fetch user data from API to get latest info including createdAt
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
            fetch(`${API_URL}/users/${userData.id}`)
                .then(res => res.json())
                .then(data => {
                    if (data.user) {
                        setUser({
                            ...userData,
                            createdAt: data.user.createdAt,
                            avatar: data.user.avatar
                        });
                    } else {
                        setUser(userData);
                    }
                })
                .catch(() => {
                    setUser(userData);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        } catch {
            // Invalid user data, redirect to home
            localStorage.removeItem('user');
            sessionStorage.removeItem('user');
            document.cookie = 'has_session=; path=/; max-age=0';
            router.push('/');
            return;
        }
    }, [router]);

    const handleLogout = () => {
        setShowLogoutConfirm(true);
    };

    const confirmLogout = () => {
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
        document.cookie = 'has_session=; path=/; max-age=0';
        router.push('/');
    };

    const menuItems = [
        { name: 'ภาพรวมบัญชี', href: '/profile/dashboard', icon: <LayoutGrid size={20} /> },
        { name: 'จัดการรถที่ลงขาย', href: '/profile/listings', icon: <Car size={20} /> },
        { name: 'โรงรถของฉัน', href: '/profile/garage', icon: <Warehouse size={20} /> },
        { name: 'รายการที่บันทึกไว้', href: '/profile/wishlist', icon: <Heart size={20} /> },
        // { name: 'กล่องข้อความ', href: '/profile/messages', icon: <MessageCircleMore size={20} /> , badge: 3 },
        { name: 'แพ็กเกจของฉัน', href: '/profile/packages', icon: <Package size={20} /> },
        { name: 'การแจ้งเตือน', href: '/profile/notifications', icon: <Bell size={20} /> },
        { name: 'ตั้งค่าบัญชี', href: '/profile/settings', icon: <Settings size={20} /> },
    ];

    // Show loading state while checking authentication
    if (isLoading) {
        return (
            <div className="bg-surface min-h-screen pt-20 pb-12 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="animate-spin text-4xl text-primary mx-auto mb-4" />
                    <p className="text-gray-500">กำลังโหลด...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-surface min-h-screen pt-8 pb-12">
            <div className="max-w-7xl mx-auto px-4">

                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <Link href="/" className="hover:text-primary">หน้าแรก</Link>
                    <ChevronRight className="text-xs" />
                    {(() => {
                        const currentPage = menuItems.find(item => pathname === item.href || pathname.startsWith(item.href + '/'));
                        if (currentPage) {
                            return (
                                <>
                                    <Link href="/profile/dashboard" className="hover:text-primary">บัญชีของฉัน</Link>
                                    <ChevronRight className="text-xs" />
                                    <span className="text-gray-800">{currentPage.name}</span>
                                </>
                            );
                        }
                        return <span className="text-gray-800">บัญชีของฉัน</span>;
                    })()}
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    <ProfileSidebar
                        user={user}
                        pathname={pathname}
                        menuItems={menuItems}
                        handleLogout={handleLogout}
                        getInitials={getInitials}
                        formatMemberDate={formatMemberDate}
                    />

                    {/* Main Content Area */}
                    <main className="flex-1 min-w-0">
                        {children}
                    </main>
                </div>
            </div>

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setShowLogoutConfirm(false)}
                    ></div>
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 relative z-10 transform transition-all">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <LogOut className="text-3xl text-red-500" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">ออกจากระบบ</h3>
                            <p className="text-gray-500 text-sm mb-6">คุณต้องการออกจากระบบใช่หรือไม่?</p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowLogoutConfirm(false)}
                                    className="flex-1 py-3 px-4 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    onClick={confirmLogout}
                                    className="flex-1 py-3 px-4 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition"
                                >
                                    ออกจากระบบ
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
