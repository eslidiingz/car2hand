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
import { Button } from "@/components/ui/button";

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
            case "ADMIN": return <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-800 text-white"><Shield size={12} className="mr-1" /> Admin</span>;
            case "SELLER": return <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-orange-50 text-orange-700">Seller</span>;
            default: return <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700">Member</span>;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "ACTIVE": return <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700">Active</span>;
            case "PENDING": return <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-amber-50 text-amber-700">Pending</span>;
            case "INACTIVE": return <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-500">Inactive</span>;
            default: return null;
        }
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-800 flex items-center gap-2">
                        <Users className="text-primary" /> จัดการผู้ใช้งาน
                    </h1>
                    <p className="text-slate-500 mt-1 text-sm">ตรวจสอบและบริหารจัดการข้อมูลผู้ใช้งานทั้งหมดในระบบ</p>
                </div>
                <Button className="bg-brand-primary hover:bg-brand-primary/90 text-white font-medium">
                    <Plus size={18} /> เพิ่มผู้ใช้งานใหม่
                </Button>
            </div>

            {/* Filters & Search */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row gap-3">
                <div className="relative flex-1 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="ค้นหาด้วยชื่อ, อีเมล หรือเบอร์โทร..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:bg-white focus:border-slate-400 focus:ring-2 focus:ring-slate-200 transition-colors"
                    />
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="font-medium">
                        <Filter size={16} /> ตัวกรอง
                    </Button>
                    <Button variant="outline" size="sm" className="font-medium">
                        ส่งออกข้อมูล (CSV)
                    </Button>
                </div>
            </div>

            {/* User Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-3 text-xs font-medium text-slate-500 text-center w-16">ID</th>
                                <th className="px-6 py-3 text-xs font-medium text-slate-500">ข้อมูลผู้ใช้งาน</th>
                                <th className="px-6 py-3 text-xs font-medium text-slate-500">บทบาท</th>
                                <th className="px-6 py-3 text-xs font-medium text-slate-500 text-center">สถานะ</th>
                                <th className="px-6 py-3 text-xs font-medium text-slate-500">วันที่สมัคร</th>
                                <th className="px-6 py-3 text-xs font-medium text-slate-500 text-right">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {mockUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-6 py-4 text-sm font-medium text-slate-400 text-center">{user.id}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600 font-medium text-sm">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-800">{user.name}</p>
                                                <div className="flex items-center gap-3 mt-0.5">
                                                    <span className="text-xs text-slate-400 flex items-center gap-1"><Mail size={11} /> {user.email}</span>
                                                    <span className="text-xs text-slate-400 flex items-center gap-1"><Phone size={11} /> {user.phone}</span>
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
                                    <td className="px-6 py-4 text-sm text-slate-500">
                                        {user.joined}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <Edit2 size={15} />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50">
                                                <Trash2 size={15} />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreVertical size={15} />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                    <p className="text-xs text-slate-500">แสดงผล 1 - 5 จากทั้งหมด 1,284 รายการ</p>
                    <div className="flex gap-1">
                        <Button variant="outline" size="icon" className="h-8 w-8" disabled>
                            <ChevronLeft size={16} />
                        </Button>
                        <Button variant="outline" size="icon" className="h-8 w-8">
                            <ChevronRight size={16} />
                        </Button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
