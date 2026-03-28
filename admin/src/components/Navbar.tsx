"use client";

import { Bell, Search, User, Package, Car } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usePendingUpgrades, usePendingListings } from "@/hooks/usePendingUpgrades";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";

export default function Navbar() {
    const { admin } = useAuth();
    const { count: pendingUpgradeCount } = usePendingUpgrades();
    const { count: pendingListingCount } = usePendingListings();
    const totalPending = pendingUpgradeCount + pendingListingCount;
    const [showNotif, setShowNotif] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // ปิด dropdown เมื่อคลิกนอก
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setShowNotif(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <header className="h-14 border-b border-slate-200 bg-white px-6 flex items-center justify-between sticky top-0 z-30">
            <div className="flex-1 max-w-sm">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="ค้นหาข้อมูล..."
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:bg-white focus:border-slate-400 transition-colors"
                    />
                </div>
            </div>

            <div className="flex items-center gap-3">
                {/* Bell + Notification Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="relative h-9 w-9"
                        onClick={() => setShowNotif(v => !v)}
                    >
                        <Bell className="h-4 w-4 text-slate-500" />
                        {totalPending > 0 ? (
                            <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold bg-orange-500 text-white leading-none">
                                {totalPending > 99 ? '99+' : totalPending}
                            </span>
                        ) : (
                            <span className="absolute top-2 right-2 h-1.5 w-1.5 bg-slate-300 rounded-full" />
                        )}
                    </Button>

                    {showNotif && (
                        <div className="absolute right-0 top-11 w-80 bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden z-50">
                            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                                <p className="text-sm font-semibold text-slate-800">การแจ้งเตือน</p>
                                {totalPending > 0 && (
                                    <span className="text-xs font-bold text-orange-500">{totalPending} รายการรอ</span>
                                )}
                            </div>

                            {totalPending > 0 ? (
                                <div className="divide-y divide-slate-100">
                                    {pendingListingCount > 0 && (
                                        <Link
                                            href="/listings"
                                            onClick={() => setShowNotif(false)}
                                            className="px-4 py-3.5 flex items-start gap-3 hover:bg-amber-50 transition-colors"
                                        >
                                            <div className="mt-0.5 p-1.5 rounded-lg bg-amber-100 flex-shrink-0">
                                                <Car className="h-4 w-4 text-amber-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-slate-800">
                                                    ประกาศรอตรวจสอบ
                                                </p>
                                                <p className="text-xs text-slate-500 mt-0.5">
                                                    มี <span className="font-bold text-amber-600">{pendingListingCount} ประกาศ</span> รออนุมัติ
                                                </p>
                                            </div>
                                        </Link>
                                    )}
                                    {pendingUpgradeCount > 0 && (
                                        <Link
                                            href="/packages"
                                            onClick={() => setShowNotif(false)}
                                            className="px-4 py-3.5 flex items-start gap-3 hover:bg-orange-50 transition-colors"
                                        >
                                            <div className="mt-0.5 p-1.5 rounded-lg bg-orange-100 flex-shrink-0">
                                                <Package className="h-4 w-4 text-orange-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-slate-800">
                                                    คำขออัพเกรดแพ็กเกจ
                                                </p>
                                                <p className="text-xs text-slate-500 mt-0.5">
                                                    มี <span className="font-bold text-orange-600">{pendingUpgradeCount} รายการ</span> รอพิจารณา
                                                </p>
                                            </div>
                                        </Link>
                                    )}
                                </div>
                            ) : (
                                <div className="px-4 py-8 text-center">
                                    <Bell className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                                    <p className="text-sm text-slate-400">ไม่มีการแจ้งเตือนใหม่</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="h-6 w-px bg-slate-200"></div>

                <div className="flex items-center gap-2.5 pl-1">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium text-slate-700 leading-tight">{admin?.fullName || 'Admin'}</p>
                        <p className="text-xs text-slate-400">{admin?.email || 'Administrator'}</p>
                    </div>
                    <div className="h-8 w-8 bg-slate-200 rounded-lg flex items-center justify-center text-slate-600">
                        <User className="h-4 w-4" />
                    </div>
                </div>
            </div>
        </header>
    );
}
