"use client";

import { Bell, Search, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Navbar() {
    const { admin } = useAuth();

    return (
        <header className="h-16 border-b border-slate-200 bg-white px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm">
            <div className="flex-1 max-w-md">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-brand-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="ค้นหาข้อมูล..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 transition-all"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button className="btn btn-secondary p-2.5 relative">
                    <Bell className="h-5 w-5 text-slate-600" />
                    <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-brand-accent rounded-full border-2 border-white"></span>
                </button>

                <div className="h-8 w-[1px] bg-slate-200 mx-2"></div>

                <div className="flex items-center gap-3 pl-2 pr-1 py-1 group cursor-pointer">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-slate-700 leading-tight group-hover:text-brand-primary transition-colors">{admin?.fullName || 'Admin'}</p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">{admin?.email || 'Administrator'}</p>
                    </div>
                    <div className="h-10 w-10 bg-brand-primary rounded-xl flex items-center justify-center text-white shadow-md shadow-brand-primary/20 group-hover:scale-105 transition-transform">
                        <User className="h-5 w-5" />
                    </div>
                </div>
            </div>
        </header>
    );
}
