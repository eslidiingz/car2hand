"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';
import { User, CaretDown, SignOut, Garage, CarProfile, Heart, Gear } from '@phosphor-icons/react';

interface UserData {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
}

export default function Navbar() {
    const pathname = usePathname();
    const [user, setUser] = useState<UserData | null>(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    // Check for logged in user
    useEffect(() => {
        const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch {
                setUser(null);
            }
        }
    }, []);

    // Listen for storage changes (login/logout in other tabs)
    useEffect(() => {
        const handleStorageChange = () => {
            const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
            if (storedUser) {
                try {
                    setUser(JSON.parse(storedUser));
                } catch {
                    setUser(null);
                }
            } else {
                setUser(null);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const isActive = (path: string) => {
        if (path === '/') {
            return pathname === '/';
        }
        return pathname?.startsWith(path);
    };

    const getLinkClass = (path: string) => {
        const baseClass = "h-16 flex items-center px-1 border-b-2 transition font-medium";
        const activeClass = "border-accent text-primary font-bold";
        const inactiveClass = "border-transparent text-gray-500 hover:text-accent";

        return `${baseClass} ${isActive(path) ? activeClass : inactiveClass}`;
    };

    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

    const openRegisterModal = () => {
        setIsLoginModalOpen(false);
        setIsRegisterModalOpen(true);
    };

    const openLoginModal = () => {
        setIsRegisterModalOpen(false);
        setIsLoginModalOpen(true);
    };

    const handleLogout = () => {
        setShowDropdown(false);
        setShowLogoutConfirm(true);
    };

    const confirmLogout = () => {
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
        setUser(null);
        setShowLogoutConfirm(false);
        window.location.href = '/';
    };

    // Get initials from name
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <>
            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={() => {
                    setIsLoginModalOpen(false);
                    // Refresh user state after login modal closes
                    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
                    if (storedUser) {
                        try {
                            setUser(JSON.parse(storedUser));
                        } catch {
                            setUser(null);
                        }
                    }
                }}
                onSwitchToRegister={openRegisterModal}
            />
            <RegisterModal
                isOpen={isRegisterModalOpen}
                onClose={() => {
                    setIsRegisterModalOpen(false);
                    // Refresh user state after register modal closes
                    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
                    if (storedUser) {
                        try {
                            setUser(JSON.parse(storedUser));
                        } catch {
                            setUser(null);
                        }
                    }
                }}
                onSwitchToLogin={openLoginModal}
            />
            <nav className="bg-white shadow-sm fixed w-full z-50 top-0">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-2">
                            <Link href="/" className="flex items-center gap-2 group">
                                <img src="/logo-2tone.png" alt="Car2Hand" className="h-8 w-auto" />
                                <span className="font-bold text-2xl text-primary tracking-tight group-hover:text-accent transition">Car<span className="text-accent">2</span>Hand</span>
                            </Link>
                        </div>
                        <div className="hidden md:flex space-x-6 h-full">
                            <Link href="/buy" className={getLinkClass('/buy')}>ซื้อรถ</Link>
                            <Link href="/sell" className={getLinkClass('/sell')}>ลงขาย</Link>
                            <Link href="/services" className={getLinkClass('/services')}>บริการ</Link>
                            <Link href="/knowledge" className={getLinkClass('/knowledge')}>ความรู้เรื่องรถ</Link>
                            <Link href="/community" className={getLinkClass('/community')}>ชุมชน</Link>
                        </div>
                        <div className="flex items-center gap-3">
                            {user ? (
                                /* Logged In State */
                                <div className="relative">
                                    <button
                                        onClick={() => setShowDropdown(!showDropdown)}
                                        className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-100 transition"
                                    >
                                        {/* Avatar */}
                                        <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                                            {getInitials(user.fullName)}
                                        </div>
                                        <span className="hidden sm:block font-medium text-gray-700 max-w-[120px] truncate">
                                            {user.fullName}
                                        </span>
                                        <CaretDown weight="bold" className={`text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                                    </button>

                                    {/* Dropdown Menu */}
                                    {showDropdown && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-40"
                                                onClick={() => setShowDropdown(false)}
                                            ></div>
                                            <div className="absolute right-0 top-14 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                                                {/* User Info */}
                                                <div className="px-4 py-3 border-b border-gray-100">
                                                    <p className="font-bold text-gray-800">{user.fullName}</p>
                                                    <p className="text-sm text-gray-500 truncate">{user.email}</p>
                                                </div>

                                                {/* Menu Items */}
                                                <div className="py-2">
                                                    <Link
                                                        href="/profile/dashboard"
                                                        className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition"
                                                        onClick={() => setShowDropdown(false)}
                                                    >
                                                        <User weight="bold" className="text-lg" />
                                                        <span className="font-medium">บัญชีของฉัน</span>
                                                    </Link>
                                                    <Link
                                                        href="/profile/listings"
                                                        className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition"
                                                        onClick={() => setShowDropdown(false)}
                                                    >
                                                        <CarProfile weight="bold" className="text-lg" />
                                                        <span className="font-medium">รถที่ลงขาย</span>
                                                    </Link>
                                                    <Link
                                                        href="/profile/favorites"
                                                        className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition"
                                                        onClick={() => setShowDropdown(false)}
                                                    >
                                                        <Heart weight="bold" className="text-lg" />
                                                        <span className="font-medium">รายการที่บันทึก</span>
                                                    </Link>
                                                    <Link
                                                        href="/profile/settings"
                                                        className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition"
                                                        onClick={() => setShowDropdown(false)}
                                                    >
                                                        <Gear weight="bold" className="text-lg" />
                                                        <span className="font-medium">ตั้งค่า</span>
                                                    </Link>
                                                </div>

                                                {/* Logout */}
                                                <div className="border-t border-gray-100 pt-2">
                                                    <button
                                                        onClick={handleLogout}
                                                        className="flex items-center gap-3 px-4 py-2.5 text-red-500 hover:bg-red-50 transition w-full"
                                                    >
                                                        <SignOut weight="bold" className="text-lg" />
                                                        <span className="font-medium">ออกจากระบบ</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ) : (
                                /* Not Logged In State */
                                <>
                                    <button
                                        onClick={() => setIsLoginModalOpen(true)}
                                        className="text-gray-600 hover:text-primary font-medium transition hidden sm:block"
                                    >
                                        เข้าสู่ระบบ
                                    </button>
                                    <button
                                        onClick={() => setIsRegisterModalOpen(true)}
                                        className="bg-primary text-white text-sm px-4 py-2 rounded-full hover:bg-opacity-90 transition shadow-md shadow-blue-100"
                                    >
                                        ลงขายฟรี
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

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
        </>
    );
}
