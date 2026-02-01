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
    Tags
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const navigation = [
    { name: "สรุปภาพรวม", href: "/", icon: LayoutDashboard },
    { name: "ผู้ใช้งาน", href: "/users", icon: Users },
    { name: "ประกาศขาย", href: "/listings", icon: Car },
    { name: "จัดการบทความ", href: "/articles", icon: BookOpen },
    { name: "หมวดหมู่บทความ", href: "/categories", icon: Tags },
    { name: "แพ็กเกจ", href: "/packages", icon: Package },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { logout } = useAuth();

    return (
        <div className="flex h-full w-64 flex-col bg-brand-primary text-white shadow-xl">

            <div className="flex h-16 items-center px-6">
                <span className="text-xl font-bold tracking-tight">
                    Car<span className="text-brand-accent">2</span>Hand <span className="text-xs font-normal opacity-70 ml-1">Admin</span>
                </span>
            </div>

            <nav className="flex-1 space-y-1 px-3 py-4">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`group flex items-center rounded-xl px-4 py-3 text-sm font-bold transition-all duration-300 ${isActive
                                ? "bg-brand-accent text-white shadow-lg shadow-brand-accent/30 translate-x-1"
                                : "text-slate-300 hover:bg-white/10 hover:text-white hover:translate-x-1"
                                }`}
                        >
                            <item.icon className={cn(
                                "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                                isActive ? "text-white" : "text-slate-400 group-hover:text-white"
                            )} aria-hidden="true" />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="border-t border-white/10 p-4">
                <Link
                    href="/settings"
                    className="group flex items-center rounded-xl px-4 py-3 text-sm font-bold text-slate-300 hover:bg-white/10 hover:text-white transition-all duration-300"
                >
                    <Settings className="mr-3 h-5 w-5 flex-shrink-0" />
                    ตั้งค่าระบบ
                </Link>
                <button
                    onClick={logout}
                    className="flex items-center w-full px-4 py-3 text-sm font-bold text-rose-300 hover:bg-rose-500/10 hover:text-rose-200 rounded-xl transition-all duration-300 group mt-2"
                >
                    <LogOut className="mr-3 h-5 w-5 flex-shrink-0 transition-colors group-hover:text-rose-200" />
                    ออกจากระบบ
                </button>
            </div>
        </div>
    );
}
