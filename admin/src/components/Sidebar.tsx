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
    Wrench
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usePendingCounts } from "@/contexts/PendingContext";
import { cn } from "@/lib/utils";

const navigation = [
    { name: "สรุปภาพรวม", href: "/", icon: LayoutDashboard },
    { name: "ผู้ใช้งาน", href: "/users", icon: Users },
    { name: "ประกาศขาย", href: "/listings", icon: Car },
    { name: "จัดการบริการ", href: "/services", icon: Wrench },
    { name: "จัดการบทความ", href: "/articles", icon: BookOpen },
    { name: "หมวดหมู่บทความ", href: "/categories", icon: Tags },
    { name: "แพ็กเกจ", href: "/packages", icon: Package },
    { name: "การแจ้งเตือน", href: "/notifications", icon: Bell },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { logout } = useAuth();
    const { pendingUpgradeCount, pendingListingCount, pendingRenewalCount } = usePendingCounts();

    return (
        <div className="flex h-full w-60 flex-col bg-white border-r border-slate-200">

            <div className="flex h-16 items-center px-5 border-b border-slate-100">
                <span className="text-lg font-semibold tracking-tight text-slate-800">
                    Car<span className="text-brand-accent">2</span>Hand <span className="text-xs font-normal text-slate-400 ml-1">Admin</span>
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
                                    ? "bg-slate-100 text-slate-900 font-semibold"
                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                            )}
                        >
                            <item.icon className={cn(
                                "mr-3 h-[18px] w-[18px] flex-shrink-0",
                                isActive ? "text-slate-700" : "text-slate-400"
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

            <div className="border-t border-slate-100 p-3">
                <Link
                    href="/settings"
                    className="flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
                >
                    <Settings className="mr-3 h-[18px] w-[18px] flex-shrink-0" />
                    ตั้งค่าระบบ
                </Link>
                <button
                    onClick={logout}
                    className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-rose-500 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors mt-0.5"
                >
                    <LogOut className="mr-3 h-[18px] w-[18px] flex-shrink-0" />
                    ออกจากระบบ
                </button>
            </div>
        </div>
    );
}
