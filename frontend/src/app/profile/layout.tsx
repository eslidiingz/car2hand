"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    SquaresFour,
    Garage,
    CarProfile,
    Heart,
    ChatCircleDots,
    Gear,
    SignOut,
    User,
    CaretRight,
    CircleNotch
} from '@phosphor-icons/react';

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
            fetch(`http://localhost:8000/users/${userData.id}`)
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
        router.push('/');
    };

    const menuItems = [
        { name: 'ภาพรวมบัญชี', href: '/profile/dashboard', icon: <SquaresFour weight={pathname === '/profile/dashboard' ? 'fill' : 'bold'} /> },
        { name: 'จัดการรถที่ลงขาย', href: '/profile/listings', icon: <CarProfile weight={pathname === '/profile/listings' ? 'fill' : 'bold'} /> },
        { name: 'โรงรถของฉัน', href: '/profile/garage', icon: <Garage weight={pathname === '/profile/garage' ? 'fill' : 'bold'} /> },
        { name: 'รายการที่บันทึกไว้', href: '/profile/wishlist', icon: <Heart weight={pathname === '/profile/wishlist' ? 'fill' : 'bold'} /> },
        { name: 'กล่องข้อความ', href: '/profile/messages', icon: <ChatCircleDots weight={pathname === '/profile/messages' ? 'fill' : 'bold'} />, badge: 3 },
        { name: 'ตั้งค่าบัญชี', href: '/profile/settings', icon: <Gear weight={pathname === '/profile/settings' ? 'fill' : 'bold'} /> },
    ];

    // Show loading state while checking authentication
    if (isLoading) {
        return (
            <div className="bg-surface min-h-screen pt-20 pb-12 flex items-center justify-center">
                <div className="text-center">
                    <CircleNotch weight="bold" className="animate-spin text-4xl text-primary mx-auto mb-4" />
                    <p className="text-gray-500">กำลังโหลด...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-surface min-h-screen pt-8 pb-12">
            <div className="max-w-7xl mx-auto px-4">

                {/* Breadcrumb (Optional) */}
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <Link href="/" className="hover:text-primary">หน้าแรก</Link>
                    <CaretRight weight="bold" className="text-xs" />
                    <span className="text-gray-800">บัญชีของฉัน</span>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <aside className="w-full lg:w-72 flex-shrink-0">
                        <div className="rounded-2xl shadow-xl overflow-hidden sticky top-24">

                            {/* User Profile Summary - Dark Gradient */}
                            <div className="p-6 text-center bg-gradient-to-br from-[#0F3460] via-[#16213E] to-[#1A3A5C]">
                                <div className="w-24 h-24 bg-white p-1 rounded-full mx-auto mb-4 shadow-lg ring-4 ring-white/20 relative group cursor-pointer overflow-hidden">
                                    {user?.avatar ? (
                                        <img src={user.avatar} className="w-full h-full rounded-full object-cover" alt="Profile" />
                                    ) : (
                                        <div className="w-full h-full rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                                            {user?.fullName ? getInitials(user.fullName) : 'U'}
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-white">
                                        <User weight="bold" size={24} />
                                    </div>
                                </div>
                                <h3 className="font-bold text-lg text-white">{user?.fullName || 'ผู้ใช้'}</h3>
                                <p className="text-sm text-blue-200">สมาชิกตั้งแต่ {formatMemberDate(user?.createdAt)}</p>
                                <div className="mt-3 inline-flex items-center gap-1 bg-green-400 text-green-900 px-3 py-1 rounded-full text-[10px] font-bold shadow-sm">
                                    ✓ USER VERIFIED
                                </div>
                            </div>

                            {/* Menu Items - White Background */}
                            <div className="bg-white">
                                <nav className="p-4 space-y-1">
                                    {menuItems.map((item) => {
                                        const isActive = pathname === item.href;
                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                className={`flex items-center justify-between px-4 py-3 rounded-xl transition ${isActive
                                                    ? 'bg-primary text-white shadow-md shadow-blue-900/10'
                                                    : 'text-gray-600 hover:bg-gray-50 hover:text-primary'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xl">{item.icon}</span>
                                                    <span className="font-bold text-sm">{item.name}</span>
                                                </div>
                                                {item.badge && (
                                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white text-primary' : 'bg-red-500 text-white'}`}>
                                                        {item.badge}
                                                    </span>
                                                )}
                                            </Link>
                                        );
                                    })}
                                </nav>

                                <div className="p-4 border-t border-gray-100 mt-2">
                                    <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition font-bold text-sm">
                                        <SignOut weight="bold" className="text-xl" /> ออกจากระบบ
                                    </button>
                                </div>
                            </div>

                        </div>
                    </aside>

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
                                <SignOut weight="bold" className="text-3xl text-red-500" />
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
