"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    Car,
    BookOpen,
    Settings,
    LogOut,
    Package,
    Tags,
    Bell,
    Wrench,
    BadgeCheck,
    Inbox,
    MessageSquare,
    Flag,
    Warehouse,
    ScrollText,
    BarChart3,
    Store,
    HardDrive
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usePendingCounts } from "@/contexts/PendingContext";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ThemeToggle";

/**
 * ⚠️  SINGLE SOURCE OF TRUTH for the admin navigation.
 * ─────────────────────────────────────────────────────────────
 * Used by:
 *   1. `Sidebar.tsx`  (this file — desktop vertical rail)
 *   2. `MobileNav.tsx` (mobile drawer opened from Navbar hamburger)
 *
 * 🚨 When adding a new admin page, add it HERE only.
 *    Never hardcode links in Navbar.tsx, DashboardLayout.tsx, or page.tsx.
 *    The mobile and desktop menus MUST stay in sync automatically.
 */
export const navigation = [
    { name: "สรุปภาพรวม", href: "/", icon: LayoutDashboard },
    { name: "ผู้ใช้งาน", href: "/users", icon: Users },
    { name: "ร้านค้า/ผู้ขาย", href: "/sellers", icon: Store },
    { name: "ยืนยันตัวตน (KYC)", href: "/kyc", icon: BadgeCheck },
    { name: "ประกาศขาย", href: "/listings", icon: Car },
    { name: "จัดการบริการ", href: "/services", icon: Wrench },
    { name: "จัดการบทความ", href: "/articles", icon: BookOpen },
    { name: "หมวดหมู่บทความ", href: "/categories", icon: Tags },
    { name: "แพ็กเกจ", href: "/packages", icon: Package },
    { name: "ชุมชน", href: "/forum", icon: MessageSquare },
    { name: "กล่องข้อความ", href: "/contact", icon: Inbox },
    { name: "รายงานการใช้ในทางผิด", href: "/reports", icon: Flag },
    { name: "โรงรถผู้ใช้", href: "/garage", icon: Warehouse },
    { name: "รายได้ & CSV", href: "/revenue", icon: BarChart3 },
    { name: "ประวัติการทำงาน", href: "/audit", icon: ScrollText },
    { name: "การแจ้งเตือน", href: "/notifications", icon: Bell },
    { name: "ที่เก็บไฟล์", href: "/settings/storage", icon: HardDrive },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { logout } = useAuth();
    const { pendingUpgradeCount, pendingListingCount, pendingRenewalCount } = usePendingCounts();

    return (
        <div className="flex h-full w-60 flex-col bg-card border-r border-border">

            <div className="flex h-16 items-center px-5 border-b border-border">
                <span className="text-lg font-semibold tracking-tight text-foreground">
                    Car<span className="text-brand-accent">2</span>Hand <span className="text-xs font-normal text-muted-foreground ml-1">Admin</span>
                </span>
            </div>

            <nav className="flex-1 space-y-0.5 px-3 py-4">
                {navigation.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href + '/'));
                    const isPackages = item.href === '/packages';
                    const isListings = item.href === '/listings';
                    const badgeCount = isPackages ? pendingUpgradeCount : isListings ? (pendingListingCount + pendingRenewalCount) : 0;
                    const showBadge = badgeCount > 0;

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-accent text-foreground font-semibold"
                                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                            )}
                        >
                            <item.icon className={cn(
                                "mr-3 h-[18px] w-[18px] flex-shrink-0",
                                isActive ? "text-foreground" : "text-muted-foreground"
                            )} aria-hidden="true" />
                            <span className="flex-1">{item.name}</span>
                            {showBadge && (
                                <span className="ml-auto inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-bold bg-orange-500 text-white leading-none">
                                    {badgeCount > 99 ? '99+' : badgeCount}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="border-t border-border p-3 space-y-1">
                <div className="flex items-center justify-between px-3 py-1">
                    <span className="text-xs text-muted-foreground">ธีม</span>
                    <ThemeToggle />
                </div>
                <Link
                    href="/settings"
                    className="flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                >
                    <Settings className="mr-3 h-[18px] w-[18px] flex-shrink-0" />
                    ตั้งค่าระบบ
                </Link>
                <button
                    onClick={logout}
                    className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 rounded-lg transition-colors"
                >
                    <LogOut className="mr-3 h-[18px] w-[18px] flex-shrink-0" />
                    ออกจากระบบ
                </button>
            </div>
        </div>
    );
}
