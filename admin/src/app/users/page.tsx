"use client";

import DashboardLayout from "@/components/DashboardLayout";
import {
    Users,
    Search,
    Plus,
    MoreVertical,
    Mail,
    Phone,
    Shield,
    Edit2,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Filter
} from "lucide-react";
import { useState } from "react";

const mockUsers = [
    { id: 1, name: "สมเจตน์ ใจดี", email: "somjet@gmail.com", phone: "081-234-5678", role: "MEMBER", status: "ACTIVE", joined: "12 ธ.ค. 2025" },
    { id: 2, name: "วรรณพร ดาวรุ่ง", email: "wannaporn.d@yahoo.com", phone: "089-876-5432", role: "SELLER", status: "ACTIVE", joined: "15 ธ.ค. 2025" },
    { id: 3, name: "กฤษฎา มาแรง", email: "kritsada.fast@outlook.com", phone: "085-555-4433", role: "MEMBER", status: "PENDING", joined: "20 ธ.ค. 2025" },
    { id: 4, name: "นภัสสร สวยงาม", email: "napassorn.s@gmail.com", phone: "082-111-2233", role: "ADMIN", status: "ACTIVE", joined: "01 ม.ค. 2026" },
    { id: 5, name: "อภิชาติ ค้าขาย", email: "apichart.k@market.com", phone: "083-333-7788", role: "SELLER", status: "INACTIVE", joined: "02 ม.ค. 2026" },
];

export default function UserManagementPage() {
    const [searchTerm, setSearchTerm] = useState("");

    const getRoleBadge = (role: string) => {
        switch (role) {
            case "ADMIN": return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary text-white tracking-wider uppercase"><Shield size={12} className="mr-1" /> Admin</span>;
            case "SELLER": return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-700 tracking-wider uppercase">Seller</span>;
            default: return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 tracking-wider uppercase">Member</span>;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "ACTIVE": return <span className="inline-flex items-center px-2 py-1 rounded-lg text-[10px] font-black bg-emerald-100 text-emerald-700">ACTIVE</span>;
            case "PENDING": return <span className="inline-flex items-center px-2 py-1 rounded-lg text-[10px] font-black bg-amber-100 text-amber-700">PENDING</span>;
            case "INACTIVE": return <span className="inline-flex items-center px-2 py-1 rounded-lg text-[10px] font-black bg-slate-100 text-slate-500">INACTIVE</span>;
            default: return null;
        }
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Users className="text-primary" /> จัดการผู้ใช้งาน
                    </h1>
                    <p className="text-slate-500 mt-1 text-sm">ตรวจสอบและบริหารจัดการข้อมูลผู้ใช้งานทั้งหมดในระบบ</p>
                </div>
                <button className="bg-primary hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-95">
                    <Plus size={20} /> เพิ่มผู้ใช้งานใหม่
                </button>
            </div>

            {/* Filters & Search */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="ค้นหาด้วยชื่อ, อีเมล หรือเบอร์โทร..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                    />
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2 transition-all">
                        <Filter size={18} /> ตัวกรอง
                    </button>
                    <button className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
                        ส่งออกข้อมูล (CSV)
                    </button>
                </div>
            </div>

            {/* User Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center w-16">ID</th>
                                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">ข้อมูลผู้ใช้งาน</th>
                                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">บทบาท</th>
                                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">สถานะ</th>
                                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">วันที่สมัคร</th>
                                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {mockUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50/50 transition-all group">
                                    <td className="px-6 py-4 text-sm font-bold text-slate-400 text-center">{user.id}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 bg-slate-100 rounded-xl flex items-center justify-center text-primary font-bold group-hover:scale-105 transition-transform">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800">{user.name}</p>
                                                <div className="flex items-center gap-3 mt-0.5">
                                                    <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium"><Mail size={12} /> {user.email}</span>
                                                    <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium"><Phone size={12} /> {user.phone}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {getRoleBadge(user.role)}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {getStatusBadge(user.status)}
                                    </td>
                                    <td className="px-6 py-4 text-[12px] text-slate-500 font-medium italic">
                                        {user.joined}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 text-slate-400 hover:text-primary hover:bg-white rounded-lg transition-all shadow-sm border border-transparent hover:border-slate-100">
                                                <Edit2 size={16} />
                                            </button>
                                            <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-white rounded-lg transition-all shadow-sm border border-transparent hover:border-slate-100">
                                                <Trash2 size={16} />
                                            </button>
                                            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-lg transition-all shadow-sm border border-transparent hover:border-slate-100">
                                                <MoreVertical size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 bg-slate-50/30 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-xs text-slate-500 font-medium">แสดงผล 1 - 5 จากทั้งหมด 1,284 รายการ</p>
                    <div className="flex gap-2">
                        <button className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-primary transition-all disabled:opacity-30" disabled>
                            <ChevronLeft size={18} />
                        </button>
                        <button className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-primary transition-all">
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
