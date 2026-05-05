"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';
import NotificationBell from './NotificationBell';
import { User, ChevronDown, LogOut, Scale, Menu, X } from 'lucide-react'; // icons shared across navbar UI
import { useWishlist } from '@/contexts/WishlistContext';
import { profileMenuItems } from '@/lib/profileMenu';
import ThemeToggle from './ThemeToggle';
import ConfirmDialog from './ConfirmDialog';

interface UserData {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    profileImage?: string | null;
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
        if (!storedUser) return;

        let parsed: UserData & { token?: string };
        try {
            parsed = JSON.parse(storedUser);
            setUser(parsed);
        } catch {
            setUser(null);
            return;
        }

        // Refresh from server so profileImage / fullName stays in sync
        const token = parsed.token;
        if (!token) return;
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
        fetch(`${API_URL}/users/me`, { headers: { Authorization: `Bearer ${token}` } })
            .then((r) => (r.ok ? r.json() : null))
            .then((data) => {
                if (!data?.user) return;
                setUser((prev) => (prev ? { ...prev, ...data.user } : prev));
                // Persist updated profileImage to whichever storage holds the user
                for (const storage of [localStorage, sessionStorage]) {
                    const raw = storage.getItem('user');
                    if (raw) {
                        try {
                            const obj = JSON.parse(raw);
                            storage.setItem(
                                'user',
                                JSON.stringify({ ...obj, profileImage: data.user.profileImage })
                            );
                        } catch { /* ignore */ }
                    }
                }
            })
            .catch(() => { /* ignore network errors */ });
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
        // Custom event for in-app updates (avatar change, profile edit, etc.)
        const handleProfileUpdate = (e: Event) => {
            const detail = (e as CustomEvent).detail || {};
            setUser((prev) => (prev ? { ...prev, ...detail } : prev));
        };
        window.addEventListener('userProfileUpdate', handleProfileUpdate);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('userProfileUpdate', handleProfileUpdate);
        };
    }, []);

    const isActive = (path: string) => {
        if (path === '/') {
            return pathname === '/';
        }
        return pathname?.startsWith(path);
    };

    const getLinkClass = (path: string) => {
        const baseClass = "h-16 flex items-center px-1 border-b-2 transition font-medium";
        const activeClass = "border-accent text-primary dark:text-white font-bold";
        const inactiveClass = "border-transparent text-gray-500 dark:text-gray-300 hover:text-accent";

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

    // Listen for global login modal trigger from other components
    useEffect(() => {
        const handler = () => openLoginModal();
        window.addEventListener('open-login-modal', handler);
        return () => window.removeEventListener('open-login-modal', handler);
    });

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
                className="relative inline-flex items-center justify-center p-2 rounded-full transition group"
                title={`เปรียบเทียบ (${count}/${maxCompareItems} รายการ)`}
            >
                <Scale
                    size={22}
                    {...(count > 0 ? { fill: 'currentColor' } : {})}
                    className={count > 0 ? 'text-primary' : 'text-gray-500 group-hover:text-primary'}
                />
                {count > 0 && (
                    <span className="absolute top-0 right-0 min-w-[18px] h-[18px] px-1 bg-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white translate-x-1/4 -translate-y-1/4 shadow-sm">
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
            <nav className="bg-card shadow-sm fixed w-full z-50 top-0 border-b border-border">
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
                            {/* TODO: Phase 2 — บริการ */}
                            {/* <Link href="/services" className={getLinkClass('/services')}>บริการ</Link> */}
                            {/* <Link href="/articles" className={getLinkClass('/articles')}>ความรู้เรื่องรถ</Link>
                            <Link href="/community" className={getLinkClass('/community')}>ชุมชน</Link> */}
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-1 sm:gap-2">
                            {/* Compare Tool */}
                            <div className="hidden sm:block">
                                <CompareButton />
                            </div>

                            {/* Theme Toggle (desktop) */}
                            <div className="hidden sm:block">
                                <ThemeToggle />
                            </div>

                            {user ? (
                                /* Logged In State */
                                <>
                                <NotificationBell
                                    onOpen={() => {
                                        setShowAccountMenu(false);
                                        setShowMobileMenu(false);
                                    }}
                                />
                                <div className="relative">
                                    <button
                                        onClick={() => {
                                            setShowAccountMenu(!showAccountMenu);
                                            setShowMobileMenu(false); // Close nav menu if open
                                        }}
                                        className="flex items-center gap-1.5 sm:gap-2 px-1.5 sm:px-3 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                                    >
                                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs sm:text-sm shadow-sm overflow-hidden">
                                            {user.profileImage ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={user.profileImage}
                                                    alt={user.fullName}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                getInitials(user.fullName)
                                            )}
                                        </div>
                                        <span className="hidden md:block font-medium text-gray-700 dark:text-gray-200 max-w-[120px] truncate">
                                            {user.fullName}
                                        </span>
                                        <ChevronDown className={`text-gray-400 dark:text-gray-500 text-xs sm:text-sm transition-transform ${showAccountMenu ? 'rotate-180' : ''}`} />
                                    </button>

                                    {/* Account Menu - Desktop Dropdown */}
                                    {showAccountMenu && (
                                        <>
                                            <div className="fixed inset-0 z-40 hidden md:block" onClick={() => setShowAccountMenu(false)}></div>
                                            <div className="absolute right-0 top-14 w-64 bg-card text-card-foreground rounded-xl shadow-xl border border-border py-2 z-50 hidden md:block">
                                                <div className="px-4 py-3 border-b border-border">
                                                    <p className="font-bold text-gray-800 dark:text-gray-100">{user.fullName}</p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                                                </div>
                                                {/* Menu items from single source: src/lib/profileMenu.tsx */}
                                                <div className="py-2">
                                                    {profileMenuItems.map((item) => (
                                                        <Link
                                                            key={item.href}
                                                            href={item.href}
                                                            className="flex items-center gap-3 px-4 py-2.5 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                                                            onClick={() => setShowAccountMenu(false)}
                                                        >
                                                            {item.icon}
                                                            <span className="font-medium">{item.name}</span>
                                                        </Link>
                                                    ))}
                                                </div>
                                                <div className="border-t border-border pt-2">
                                                    <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition w-full text-left">
                                                        <LogOut className="text-lg" />
                                                        <span className="font-medium">ออกจากระบบ</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {/* Account Menu - Mobile Drawer */}
                                    {showAccountMenu && (
                                        <div className="md:hidden fixed inset-x-0 top-16 bg-card text-card-foreground z-[60] border-t border-border shadow-2xl overflow-y-auto h-[calc(100vh-64px)]">
                                            <div className="p-4 space-y-2">
                                                <div className="px-4 py-4 mb-4 bg-muted rounded-2xl">
                                                    <p className="font-bold text-gray-800 dark:text-gray-100 text-lg">{user.fullName}</p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                                                </div>
                                                {/* Menu items from single source: src/lib/profileMenu.tsx */}
                                                {profileMenuItems.map((item) => (
                                                    <Link
                                                        key={item.href}
                                                        href={item.href}
                                                        className="flex items-center gap-4 p-4 text-gray-700 dark:text-gray-200 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                                                        onClick={() => setShowAccountMenu(false)}
                                                    >
                                                        <div className="w-10 h-10 bg-blue-50 dark:bg-primary/20 text-primary rounded-full flex items-center justify-center">
                                                            {item.icon}
                                                        </div>
                                                        <span>{item.name}</span>
                                                    </Link>
                                                ))}
                                                <div className="pt-4 border-t border-border">
                                                    <button onClick={handleLogout} className="flex items-center gap-4 p-4 text-red-500 font-bold w-full text-left rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 transition-all">
                                                        <div className="w-10 h-10 bg-red-50 dark:bg-red-500/15 text-red-500 rounded-full flex items-center justify-center">
                                                            <LogOut size={20} />
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
                                className="p-2 -mr-2 text-gray-600 dark:text-gray-300 hover:text-primary transition lg:hidden"
                            >
                                {showMobileMenu ? <X size={26} /> : <Menu size={26} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Drawer */}
                {showMobileMenu && (
                    <div className="lg:hidden fixed inset-x-0 top-16 bg-card text-card-foreground z-[60] border-t border-border shadow-2xl overflow-y-auto h-[calc(100vh-64px)]">
                        <div className="p-4 pb-20 space-y-2">
                            {/* Comparison Tool in Mobile Menu */}
                            <Link
                                href="/buy/compare"
                                className="flex items-center justify-between p-4 bg-blue-50/50 dark:bg-blue-500/10 rounded-2xl text-primary font-bold mb-4 border border-blue-100"
                                onClick={() => setShowMobileMenu(false)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <Scale
                                            size={24}
                                            {...(compareCount > 0 ? { fill: 'currentColor' } : {})}
                                            className="text-primary"
                                        />
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
                            <Link href="/buy" className={`flex items-center p-4 rounded-xl font-bold transition-all ${isActive('/buy') ? 'bg-primary text-white' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'}`} onClick={() => setShowMobileMenu(false)}>ซื้อรถ</Link>
                            <Link href="/sell" className={`flex items-center p-4 rounded-xl font-bold transition-all ${isActive('/sell') ? 'bg-primary text-white' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'}`} onClick={() => setShowMobileMenu(false)}>ลงขายกับเรา</Link>
                            {/* TODO: Phase 2 — บริการ */}
                            {/* <Link href="/services" className={`flex items-center p-4 rounded-xl font-bold transition-all ${isActive('/services') ? 'bg-primary text-white' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'}`} onClick={() => setShowMobileMenu(false)}>บริการ</Link> */}
                            {/* <Link href="/articles" className={`flex items-center p-4 rounded-xl font-bold transition-all ${isActive('/articles') ? 'bg-primary text-white' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'}`} onClick={() => setShowMobileMenu(false)}>ความรู้เรื่องรถ</Link>
                            <Link href="/community" className={`flex items-center p-4 rounded-xl font-bold transition-all ${isActive('/community') ? 'bg-primary text-white' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'}`} onClick={() => setShowMobileMenu(false)}>ชุมชน</Link> */}

                            {!user && (
                                <button
                                    onClick={() => { setIsLoginModalOpen(true); setShowMobileMenu(false); }}
                                    className="w-full flex items-center justify-center gap-2 p-4 mt-6 bg-accent text-white rounded-2xl font-bold shadow-lg shadow-orange-100"
                                >
                                    <User size={20} />
                                    เข้าสู่ระบบ / ลงทะเบียน
                                </button>
                            )}

                            <div className="pt-4 mt-4 border-t border-border flex items-center justify-between px-4">
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">โหมดธีม</span>
                                <ThemeToggle />
                            </div>
                        </div>
                    </div>
                )}
            </nav>

            <ConfirmDialog
                open={showLogoutConfirm}
                onClose={() => setShowLogoutConfirm(false)}
                onConfirm={confirmLogout}
                icon={<LogOut size={28} />}
                title="ออกจากระบบ"
                description="คุณต้องการออกจากระบบใช่หรือไม่?"
                confirmLabel="ออกจากระบบ"
            />
        </>
    );
}
