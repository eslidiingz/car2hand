"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LogOut,
    ChevronRight,
    Loader2,
} from 'lucide-react';
import ProfileSidebar from '@/components/ProfileSidebar';
import ConfirmDialog from '@/components/ConfirmDialog';
import { profileMenuItems } from '@/lib/profileMenu';

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

    // Profile menu lives in src/lib/profileMenu.tsx — do not hardcode here.
    const menuItems = profileMenuItems;

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

            <ConfirmDialog
                open={showLogoutConfirm}
                onClose={() => setShowLogoutConfirm(false)}
                onConfirm={confirmLogout}
                icon={<LogOut size={28} />}
                title="ออกจากระบบ"
                description="คุณต้องการออกจากระบบใช่หรือไม่?"
                confirmLabel="ออกจากระบบ"
            />
        </div>
    );
}
