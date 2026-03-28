"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { apiFetch } from "@/lib/api";
import {
    Users,
    Search,
    Mail,
    Phone,
    Shield,
    ChevronLeft,
    ChevronRight,
    Package,
    Car,
    UserCheck,
    UserX
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";

interface UserItem {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    isActive: boolean;
    createdAt: string;
    currentPackage: { name: string; slug: string } | null;
    _count: { listings: number };
}

export default function UserManagementPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [users, setUsers] = useState<UserItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [togglingId, setTogglingId] = useState<string | null>(null);

    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({ page: String(page), limit: '20' });
            if (searchTerm) params.set('search', searchTerm);
            const data = await apiFetch(`/admin/users?${params}`);
            setUsers(data.users || []);
            setTotalPages(data.pagination?.totalPages || 1);
            setTotal(data.pagination?.total || 0);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setIsLoading(false);
        }
    }, [page, searchTerm]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleToggleStatus = async (userId: string) => {
        setTogglingId(userId);
        try {
            await apiFetch(`/admin/users/${userId}/toggle-status`, { method: 'PUT' });
            fetchUsers();
        } catch (error: any) {
            alert(error.message || 'เกิดข้อผิดพลาด');
        } finally {
            setTogglingId(null);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('th-TH', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const startItem = (page - 1) * 20 + 1;
    const endItem = Math.min(page * 20, total);

    return (
        <DashboardLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-800 flex items-center gap-2">
                        <Users className="text-primary" /> จัดการผู้ใช้งาน
                    </h1>
                    <p className="text-slate-500 mt-1 text-sm">ตรวจสอบและบริหารจัดการข้อมูลผู้ใช้งานทั้งหมดในระบบ</p>
                </div>
                <div className="text-sm text-slate-500 font-medium">
                    ผู้ใช้งานทั้งหมด {total.toLocaleString('th-TH')} คน
                </div>
            </div>

            {/* Search */}
            <div className="mb-4 max-w-sm">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="ค้นหาด้วยชื่อ, อีเมล หรือเบอร์โทร..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                        className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-slate-400 transition-colors"
                    />
                </div>
            </div>

            {/* User Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-3 text-xs font-medium text-slate-500">ข้อมูลผู้ใช้งาน</th>
                                <th className="px-6 py-3 text-xs font-medium text-slate-500">เบอร์โทร</th>
                                <th className="px-6 py-3 text-xs font-medium text-slate-500">แพ็กเกจ</th>
                                <th className="px-6 py-3 text-xs font-medium text-slate-500 text-center">ประกาศ</th>
                                <th className="px-6 py-3 text-xs font-medium text-slate-500 text-center">สถานะ</th>
                                <th className="px-6 py-3 text-xs font-medium text-slate-500">วันที่สมัคร</th>
                                <th className="px-6 py-3 text-xs font-medium text-slate-500 text-right">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan={7} className="px-6 py-4">
                                            <div className="animate-pulse flex items-center gap-3">
                                                <div className="h-9 w-9 bg-slate-200 rounded-lg" />
                                                <div className="flex-1 space-y-2">
                                                    <div className="h-3 bg-slate-200 rounded w-32" />
                                                    <div className="h-2.5 bg-slate-100 rounded w-48" />
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400 text-sm">
                                        ไม่พบผู้ใช้งาน
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600 font-medium text-sm">
                                                    {user.fullName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-800">{user.fullName}</p>
                                                    <span className="text-xs text-slate-400 flex items-center gap-1"><Mail size={11} /> {user.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-slate-500 flex items-center gap-1"><Phone size={13} /> {user.phoneNumber}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.currentPackage ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700">
                                                    <Package size={12} className="mr-1" />
                                                    {user.currentPackage.name}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-slate-400">ไม่มีแพ็กเกจ</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center gap-1 text-sm text-slate-600 font-medium">
                                                <Car size={14} className="text-slate-400" />
                                                {user._count.listings}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {user.isActive ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700">Active</span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-500">Inactive</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            {formatDate(user.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                disabled={togglingId === user.id}
                                                onClick={() => handleToggleStatus(user.id)}
                                                className={user.isActive
                                                    ? "text-rose-500 hover:text-rose-600 hover:bg-rose-50 text-xs"
                                                    : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 text-xs"
                                                }
                                            >
                                                {user.isActive ? (
                                                    <><UserX size={14} /> ปิดการใช้งาน</>
                                                ) : (
                                                    <><UserCheck size={14} /> เปิดการใช้งาน</>
                                                )}
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {total > 0 && (
                    <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                        <p className="text-xs text-slate-500">
                            แสดงผล {startItem} - {endItem} จากทั้งหมด {total.toLocaleString('th-TH')} รายการ
                        </p>
                        <div className="flex gap-1">
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                disabled={page <= 1}
                                onClick={() => setPage(p => p - 1)}
                            >
                                <ChevronLeft size={16} />
                            </Button>
                            <span className="flex items-center px-3 text-xs text-slate-500 font-medium">
                                {page} / {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                disabled={page >= totalPages}
                                onClick={() => setPage(p => p + 1)}
                            >
                                <ChevronRight size={16} />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
