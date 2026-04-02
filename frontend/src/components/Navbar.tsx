"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';
import NotificationBell from './NotificationBell';
import { User, CaretDown, SignOut, Garage, CarProfile, Heart, Gear, Scales, List, X, Package } from '@phosphor-icons/react';
import { useWishlist } from '@/contexts/WishlistContext';

interface UserData {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
}

export default function Navbar() {
    const pathname = usePathname();
    const [user, setUser] = useState<UserData | null>(null);
    const [showAccountMenu, setShowAccountMenu] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
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
        setShowAccountMenu(false);
        setShowLogoutConfirm(true);
    };

    const confirmLogout = () => {
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
        document.cookie = 'has_session=; path=/; max-age=0';
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

    // Compare Button Component
    const CompareButton = () => {
        const { compareList, maxCompareItems } = useWishlist();
        const count = compareList.length;

        return (
            <Link
                href="/buy/compare"
                className="relative p-2 rounded-full transition group"
                title={`เปรียบเทียบ (${count}/${maxCompareItems} รายการ)`}
            >
                <Scales
                    size={22}
                    weight={count > 0 ? 'fill' : 'regular'}
                    className={count > 0 ? 'text-primary' : 'text-gray-500 group-hover:text-primary'}
                />
                {count > 0 && (
                    <span className="absolute top-0 right-0 w-4.5 h-4.5 bg-accent text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white translate-x-1/4 -translate-y-1/4 shadow-sm">
                        {count}
                    </span>
                )}
            </Link>
        );
    };

    // Compare Button Logic for Mobile
    const { compareList } = useWishlist();
    const compareCount = compareList.length;

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
                        {/* Logo Component */}
                        <div className="flex-shrink-0">
                            <Link 
                                href="/" 
                                className="flex flex-col items-center"
                                onClick={() => {
                                    setShowAccountMenu(false);
                                    setShowMobileMenu(false);
                                }}
                            >
                                <img src="/logo-text.svg" alt="Car2Hand" className="h-11 w-auto" />
                            </Link>
                        </div>

                        {/* Desktop Menu */}
                        <div className="hidden lg:flex space-x-6 h-full">
                            <Link href="/buy" className={getLinkClass('/buy')}>ซื้อรถ</Link>
                            <Link href="/sell" className={getLinkClass('/sell')}>ลงขายกับเรา</Link>
                            <Link href="/services" className={getLinkClass('/services')}>บริการ</Link>
                            <Link href="/articles" className={getLinkClass('/articles')}>ความรู้เรื่องรถ</Link>
                            <Link href="/community" className={getLinkClass('/community')}>ชุมชน</Link>
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-1 sm:gap-2">
                            {/* Compare Tool */}
                            <div className="hidden sm:block">
                                <CompareButton />
                            </div>

                            {user ? (
                                /* Logged In State */
                                <>
                                <NotificationBell />
                                <div className="relative">
                                    <button
                                        onClick={() => {
                                            setShowAccountMenu(!showAccountMenu);
                                            setShowMobileMenu(false); // Close nav menu if open
                                        }}
                                        className="flex items-center gap-1.5 sm:gap-2 px-1.5 sm:px-3 py-2 rounded-full hover:bg-gray-100 transition"
                                    >
                                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs sm:text-sm shadow-sm">
                                            {getInitials(user.fullName)}
                                        </div>
                                        <span className="hidden md:block font-medium text-gray-700 max-w-[120px] truncate">
                                            {user.fullName}
                                        </span>
                                        <CaretDown weight="bold" className={`text-gray-400 text-xs sm:text-sm transition-transform ${showAccountMenu ? 'rotate-180' : ''}`} />
                                    </button>

                                    {/* Account Menu - Desktop Dropdown */}
                                    {showAccountMenu && (
                                        <>
                                            <div className="fixed inset-0 z-40 hidden md:block" onClick={() => setShowAccountMenu(false)}></div>
                                            <div className="absolute right-0 top-14 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 hidden md:block">
                                                <div className="px-4 py-3 border-b border-gray-100">
                                                    <p className="font-bold text-gray-800">{user.fullName}</p>
                                                    <p className="text-sm text-gray-500 truncate">{user.email}</p>
                                                </div>
                                                <div className="py-2">
                                                    <Link href="/profile/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition" onClick={() => setShowAccountMenu(false)}>
                                                        <User weight="bold" className="text-lg" />
                                                        <span className="font-medium">บัญชีของฉัน</span>
                                                    </Link>
                                                    <Link href="/profile/listings" className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition" onClick={() => setShowAccountMenu(false)}>
                                                        <CarProfile weight="bold" className="text-lg" />
                                                        <span className="font-medium">รถที่ลงขาย</span>
                                                    </Link>
                                                    <Link href="/profile/garage" className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition" onClick={() => setShowAccountMenu(false)}>
                                                        <Garage weight="bold" className="text-lg" />
                                                        <span className="font-medium">โรงรถของฉัน</span>
                                                    </Link>
                                                    <Link href="/profile/wishlist" className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition" onClick={() => setShowAccountMenu(false)}>
                                                        <Heart weight="bold" className="text-lg" />
                                                        <span className="font-medium">รายการที่บันทึก</span>
                                                    </Link>
                                                    <Link href="/profile/packages" className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition" onClick={() => setShowAccountMenu(false)}>
                                                        <Package weight="bold" className="text-lg" />
                                                        <span className="font-medium">แพ็กเกจของฉัน</span>
                                                    </Link>
                                                    <Link href="/profile/settings" className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition" onClick={() => setShowAccountMenu(false)}>
                                                        <Gear weight="bold" className="text-lg" />
                                                        <span className="font-medium">ตั้งค่า</span>
                                                    </Link>
                                                </div>
                                                <div className="border-t border-gray-100 pt-2">
                                                    <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 text-red-500 hover:bg-red-50 transition w-full text-left">
                                                        <SignOut weight="bold" className="text-lg" />
                                                        <span className="font-medium">ออกจากระบบ</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {/* Account Menu - Mobile Drawer */}
                                    {showAccountMenu && (
                                        <div className="md:hidden fixed inset-x-0 top-16 bg-white z-[60] border-t border-gray-100 shadow-2xl overflow-y-auto h-[calc(100vh-64px)]">
                                            <div className="p-4 space-y-2">
                                                <div className="px-4 py-4 mb-4 bg-gray-50 rounded-2xl">
                                                    <p className="font-bold text-gray-800 text-lg">{user.fullName}</p>
                                                    <p className="text-sm text-gray-500 truncate">{user.email}</p>
                                                </div>
                                                <Link href="/profile/dashboard" className="flex items-center gap-4 p-4 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all" onClick={() => setShowAccountMenu(false)}>
                                                    <div className="w-10 h-10 bg-blue-50 text-primary rounded-full flex items-center justify-center">
                                                        <User weight="bold" size={20} />
                                                    </div>
                                                    <span>ภาพรวมบัญชี</span>
                                                </Link>
                                                <Link href="/profile/listings" className="flex items-center gap-4 p-4 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all" onClick={() => setShowAccountMenu(false)}>
                                                    <div className="w-10 h-10 bg-blue-50 text-primary rounded-full flex items-center justify-center">
                                                        <CarProfile weight="bold" size={20} />
                                                    </div>
                                                    <span>รถที่ลงขาย</span>
                                                </Link>
                                                <Link href="/profile/garage" className="flex items-center gap-4 p-4 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all" onClick={() => setShowAccountMenu(false)}>
                                                    <div className="w-10 h-10 bg-blue-50 text-primary rounded-full flex items-center justify-center">
                                                        <Garage weight="bold" size={20} />
                                                    </div>
                                                    <span>โรงรถของฉัน</span>
                                                </Link>
                                                <Link href="/profile/wishlist" className="flex items-center gap-4 p-4 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all" onClick={() => setShowAccountMenu(false)}>
                                                    <div className="w-10 h-10 bg-blue-50 text-primary rounded-full flex items-center justify-center">
                                                        <Heart weight="bold" size={20} />
                                                    </div>
                                                    <span>รายการที่บันทึก</span>
                                                </Link>
                                                <Link href="/profile/packages" className="flex items-center gap-4 p-4 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all" onClick={() => setShowAccountMenu(false)}>
                                                    <div className="w-10 h-10 bg-blue-50 text-primary rounded-full flex items-center justify-center">
                                                        <Package weight="bold" size={20} />
                                                    </div>
                                                    <span>แพ็กเกจของฉัน</span>
                                                </Link>
                                                <Link href="/profile/settings" className="flex items-center gap-4 p-4 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all" onClick={() => setShowAccountMenu(false)}>
                                                    <div className="w-10 h-10 bg-blue-50 text-primary rounded-full flex items-center justify-center">
                                                        <Gear weight="bold" size={20} />
                                                    </div>
                                                    <span>ตั้งค่าบัญชี</span>
                                                </Link>
                                                <div className="pt-4 border-t border-gray-100">
                                                    <button onClick={handleLogout} className="flex items-center gap-4 p-4 text-red-500 font-bold w-full text-left rounded-xl hover:bg-red-50 transition-all">
                                                        <div className="w-10 h-10 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
                                                            <SignOut weight="bold" size={20} />
                                                        </div>
                                                        <span>ออกจากระบบ</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                </>
                            ) : (
                                <button
                                    onClick={() => setIsLoginModalOpen(true)}
                                    className="hidden sm:block bg-primary text-white text-sm px-5 py-2.5 rounded-full hover:bg-opacity-90 transition shadow-md font-bold"
                                >
                                    ลงขายฟรี
                                </button>
                            )}

                            {/* Mobile Hamburger Menu Toggle */}
                            <button
                                onClick={() => {
                                    setShowMobileMenu(!showMobileMenu);
                                    setShowAccountMenu(false); // Close account menu if open
                                }}
                                className="p-2 -mr-2 text-gray-600 hover:text-primary transition lg:hidden"
                            >
                                {showMobileMenu ? <X size={26} weight="bold" /> : <List size={26} weight="bold" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Drawer */}
                {showMobileMenu && (
                    <div className="lg:hidden fixed inset-x-0 top-16 bg-white z-[60] border-t border-gray-100 shadow-2xl overflow-y-auto h-[calc(100vh-64px)]">
                        <div className="p-4 pb-20 space-y-2">
                            {/* Comparison Tool in Mobile Menu */}
                            <Link
                                href="/buy/compare"
                                className="flex items-center justify-between p-4 bg-blue-50/50 rounded-2xl text-primary font-bold mb-4 border border-blue-100"
                                onClick={() => setShowMobileMenu(false)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <Scales size={24} weight="fill" className="text-primary" />
                                        {compareCount > 0 && (
                                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                                                {compareCount}
                                            </span>
                                        )}
                                    </div>
                                    <span>รายการเปรียบเทียบ</span>
                                </div>
                                <div className="bg-primary text-white py-1.5 px-4 rounded-xl text-xs font-bold">
                                    ดูรายการ
                                </div>
                            </Link>

                            <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 pt-2">เมนูหลัก</p>
                            <Link href="/buy" className={`flex items-center p-4 rounded-xl font-bold transition-all ${isActive('/buy') ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-50'}`} onClick={() => setShowMobileMenu(false)}>ซื้อรถ</Link>
                            <Link href="/sell" className={`flex items-center p-4 rounded-xl font-bold transition-all ${isActive('/sell') ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-50'}`} onClick={() => setShowMobileMenu(false)}>ลงขายกับเรา</Link>
                            <Link href="/services" className={`flex items-center p-4 rounded-xl font-bold transition-all ${isActive('/services') ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-50'}`} onClick={() => setShowMobileMenu(false)}>บริการ</Link>
                            <Link href="/articles" className={`flex items-center p-4 rounded-xl font-bold transition-all ${isActive('/articles') ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-50'}`} onClick={() => setShowMobileMenu(false)}>ความรู้เรื่องรถ</Link>
                            <Link href="/community" className={`flex items-center p-4 rounded-xl font-bold transition-all ${isActive('/community') ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-50'}`} onClick={() => setShowMobileMenu(false)}>ชุมชน</Link>

                            {!user && (
                                <button
                                    onClick={() => { setIsLoginModalOpen(true); setShowMobileMenu(false); }}
                                    className="w-full flex items-center justify-center gap-2 p-4 mt-6 bg-accent text-white rounded-2xl font-bold shadow-lg shadow-orange-100"
                                >
                                    <User size={20} weight="bold" />
                                    เข้าสู่ระบบ / ลงทะเบียน
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </nav>

            {/* Logout Confirmation Modal */}
            {
                showLogoutConfirm && (
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
                )
            }
        </>
    );
}
