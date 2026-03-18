"use client";

import React from 'react';
import Link from 'next/link';
import { User, SignOut } from '@phosphor-icons/react';

interface ProfileSidebarProps {
    user: {
        avatar?: string;
        fullName?: string;
        createdAt?: string;
    } | null;
    pathname: string;
    menuItems: {
        name: string;
        href: string;
        icon: React.ReactNode;
        badge?: number;
    }[];
    handleLogout: () => void;
    getInitials: (name: string) => string;
    formatMemberDate: (date?: string) => string;
}

export default function ProfileSidebar({
    user,
    pathname,
    menuItems,
    handleLogout,
    getInitials,
    formatMemberDate
}: ProfileSidebarProps) {
    return (
        <aside className="hidden lg:block w-full lg:w-72 flex-shrink-0">
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
    );
}
