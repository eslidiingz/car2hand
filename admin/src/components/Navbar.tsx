"use client";

import { Bell, Search, User, Package, Car, Menu, RefreshCw, CreditCard } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usePendingCounts } from "@/contexts/PendingContext";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import MobileNav from "./MobileNav";

export default function Navbar() {
    const { admin } = useAuth();
    const { pendingUpgradeCount, pendingListingCount, pendingRenewalCount, pendingSlotPurchaseCount } = usePendingCounts();
    const totalPending = pendingUpgradeCount + pendingListingCount + pendingRenewalCount + pendingSlotPurchaseCount;
    const [showNotif, setShowNotif] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
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
        <header className="h-14 border-b border-border bg-card px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 gap-3">
            {/* Mobile hamburger */}
            <button
                onClick={() => setMobileOpen(true)}
                className="md:hidden h-9 w-9 rounded-lg hover:bg-accent flex items-center justify-center flex-shrink-0"
                aria-label="เปิดเมนู"
            >
                <Menu size={20} />
            </button>
            <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />

            <div className="flex-1 max-w-sm hidden md:block">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="ค้นหาข้อมูล..."
                        className="w-full pl-9 pr-4 py-2 bg-muted border border-border rounded-lg text-sm outline-none focus:bg-card focus:border-ring transition-colors"
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
                        <Bell className="h-4 w-4 text-muted-foreground" />
                        {totalPending > 0 ? (
                            <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold bg-orange-500 text-white leading-none">
                                {totalPending > 99 ? '99+' : totalPending}
                            </span>
                        ) : (
                            <span className="absolute top-2 right-2 h-1.5 w-1.5 bg-muted-foreground/30 rounded-full" />
                        )}
                    </Button>

                    {showNotif && (
                        <div className="absolute right-0 top-11 w-80 bg-card rounded-xl border border-border shadow-lg overflow-hidden z-50">
                            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                                <p className="text-sm font-semibold text-foreground">การแจ้งเตือน</p>
                                {totalPending > 0 && (
                                    <span className="text-xs font-bold text-orange-500">{totalPending} รายการรอ</span>
                                )}
                            </div>

                            {totalPending > 0 ? (
                                <div className="divide-y divide-border">
                                    {pendingListingCount > 0 && (
                                        <Link
                                            href="/listings"
                                            onClick={() => setShowNotif(false)}
                                            className="px-4 py-3.5 flex items-start gap-3 hover:bg-accent transition-colors"
                                        >
                                            <div className="mt-0.5 p-1.5 rounded-lg bg-amber-100 dark:bg-amber-500/20 flex-shrink-0">
                                                <Car className="h-4 w-4 text-amber-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-foreground">
                                                    ประกาศรอตรวจสอบ
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    มี <span className="font-bold text-amber-600">{pendingListingCount} ประกาศ</span> รออนุมัติ
                                                </p>
                                            </div>
                                        </Link>
                                    )}
                                    {pendingRenewalCount > 0 && (
                                        <Link
                                            href="/listings"
                                            onClick={() => setShowNotif(false)}
                                            className="px-4 py-3.5 flex items-start gap-3 hover:bg-accent transition-colors"
                                        >
                                            <div className="mt-0.5 p-1.5 rounded-lg bg-sky-100 dark:bg-sky-500/20 flex-shrink-0">
                                                <RefreshCw className="h-4 w-4 text-sky-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-foreground">
                                                    คำขอต่ออายุประกาศ
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    มี <span className="font-bold text-sky-600">{pendingRenewalCount} รายการ</span> รอพิจารณา
                                                </p>
                                            </div>
                                        </Link>
                                    )}
                                    {pendingUpgradeCount > 0 && (
                                        <Link
                                            href="/packages"
                                            onClick={() => setShowNotif(false)}
                                            className="px-4 py-3.5 flex items-start gap-3 hover:bg-accent transition-colors"
                                        >
                                            <div className="mt-0.5 p-1.5 rounded-lg bg-orange-100 dark:bg-orange-500/20 flex-shrink-0">
                                                <Package className="h-4 w-4 text-orange-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-foreground">
                                                    คำขออัพเกรดแพ็กเกจ
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    มี <span className="font-bold text-orange-600">{pendingUpgradeCount} รายการ</span> รอพิจารณา
                                                </p>
                                            </div>
                                        </Link>
                                    )}
                                    {pendingSlotPurchaseCount > 0 && (
                                        <Link
                                            href="/packages"
                                            onClick={() => setShowNotif(false)}
                                            className="px-4 py-3.5 flex items-start gap-3 hover:bg-accent transition-colors"
                                        >
                                            <div className="mt-0.5 p-1.5 rounded-lg bg-violet-100 dark:bg-violet-500/20 flex-shrink-0">
                                                <CreditCard className="h-4 w-4 text-violet-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-foreground">
                                                    คำขอซื้อ slot ประกาศเพิ่ม
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    มี <span className="font-bold text-violet-600">{pendingSlotPurchaseCount} รายการ</span> รอพิจารณา
                                                </p>
                                            </div>
                                        </Link>
                                    )}
                                </div>
                            ) : (
                                <div className="px-4 py-8 text-center">
                                    <Bell className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                                    <p className="text-sm text-muted-foreground">ไม่มีการแจ้งเตือนใหม่</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="h-6 w-px bg-border"></div>

                <div className="flex items-center gap-2.5 pl-1">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium text-foreground leading-tight">{admin?.fullName || 'Admin'}</p>
                        <p className="text-xs text-muted-foreground">@{admin?.username || 'admin'}</p>
                    </div>
                    <div className="h-8 w-8 bg-accent rounded-lg flex items-center justify-center text-muted-foreground">
                        <User className="h-4 w-4" />
                    </div>
                </div>
            </div>
        </header>
    );
}
