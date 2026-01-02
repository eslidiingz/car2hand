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
    Package
} from "lucide-react";

const navigation = [
    { name: "สรุปภาพรวม", href: "/", icon: LayoutDashboard },
    { name: "ผู้ใช้งาน", href: "/users", icon: Users },
    { name: "ประกาศขาย", href: "/listings", icon: Car },
    { name: "จัดการความรู้", href: "/knowledge", icon: BookOpen },
    { name: "แพ็กเกจ", href: "/packages", icon: Package },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="flex h-full w-64 flex-col bg-primary text-white shadow-xl">
            <div className="flex h-16 items-center px-6">
                <span className="text-xl font-bold tracking-tight">
                    Car<span className="text-accent">2</span>Hand <span className="text-xs font-normal opacity-70 ml-1">Admin</span>
                </span>
            </div>

            <nav className="flex-1 space-y-1 px-3 py-4">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`group flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${isActive
                                    ? "bg-accent text-white shadow-lg shadow-accent/20"
                                    : "text-blue-100 hover:bg-white/10 hover:text-white"
                                }`}
                        >
                            <item.icon className="mr-3 h-5 w-5 flex-shrink-0" aria-hidden="true" />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="border-t border-white/10 p-4">
                <Link
                    href="/settings"
                    className="group flex items-center rounded-xl px-3 py-2.5 text-sm font-medium text-blue-100 hover:bg-white/10 hover:text-white transition-all"
                >
                    <Settings className="mr-3 h-5 w-5 flex-shrink-0" />
                    ตั้งค่าระบบ
                </Link>
                <button className="mt-1 flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-medium text-red-300 hover:bg-red-500/10 hover:text-red-200 transition-all">
                    <LogOut className="mr-3 h-5 w-5 flex-shrink-0" />
                    ออกจากระบบ
                </button>
            </div>
        </div>
    );
}
