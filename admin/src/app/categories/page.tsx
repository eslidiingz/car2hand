"use client";

import DashboardLayout from "@/components/DashboardLayout";
import {
    Tag,
    Plus,
    Edit,
    Trash2,
    Loader2,
    Check,
    X,
    AlertCircle
} from "lucide-react";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";

interface Category {
    id: string;
    name: string;
    slug: string;
    createdAt: string;
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [isEditing, setIsEditing] = useState<string | null>(null); // category ID being edited
    const [formData, setFormData] = useState({ name: "", slug: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showNewForm, setShowNewForm] = useState(false);

    // Delete state
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchCategories = async () => {
        setIsLoading(true);
        try {
            const data = await apiFetch('/admin/categories');
            setCategories(data);
        } catch (err: any) {
            setError(err.message || "ไม่สามารถโหลดข้อมูลหมวดหมู่ได้");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        try {
            await apiFetch('/admin/categories', {
                method: 'POST',
                body: JSON.stringify(formData)
            });
            setFormData({ name: "", slug: "" });
            setShowNewForm(false);
            fetchCategories();
        } catch (err: any) {
            setError(err.message || "ไม่สามารถสร้างหมวดหมู่ได้");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdate = async (id: string) => {
        setIsSubmitting(true);
        setError(null);
        try {
            await apiFetch(`/admin/categories/${id}`, {
                method: 'PATCH',
                body: JSON.stringify(formData)
            });
            setIsEditing(null);
            fetchCategories();
        } catch (err: any) {
            setError(err.message || "ไม่สามารถแก้ไขหมวดหมู่ได้");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteClick = (category: Category) => {
        setCategoryToDelete(category);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!categoryToDelete) return;

        setIsDeleting(true);
        setError(null);
        try {
            await apiFetch(`/admin/categories/${categoryToDelete.id}`, { method: 'DELETE' });
            setIsDeleteModalOpen(false);
            setCategoryToDelete(null);
            fetchCategories();
        } catch (err: any) {
            setError(err.message || "ไม่สามารถลบหมวดหมู่ได้");
            setIsDeleteModalOpen(false);
        } finally {
            setIsDeleting(false);
        }
    };

    const startEdit = (category: Category) => {
        setIsEditing(category.id);
        setFormData({ name: category.name, slug: category.slug });
        setShowNewForm(false);
    };

    const cancelEdit = () => {
        setIsEditing(null);
        setFormData({ name: "", slug: "" });
    };

    const autoGenerateSlug = (name: string) => {
        const slug = name
            .toLowerCase()
            .replace(/[^a-z0-9\u0E00-\u0E7F]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
        setFormData(prev => ({ ...prev, name, slug }));
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Tag className="text-primary" /> จัดการหมวดหมู่บทความ
                    </h1>
                    <p className="text-slate-500 mt-1 text-sm">จัดการหัวข้อบทความเพื่อให้ผู้ใช้อ่านข้อมูลได้ตรงตามความสนใจ</p>
                </div>
                {!showNewForm && !isEditing && (
                    <button
                        onClick={() => {
                            setShowNewForm(true);
                            setFormData({ name: "", slug: "" });
                        }}
                        className="btn btn-primary btn-md"
                    >
                        <Plus size={20} /> เพิ่มหมวดหมู่ใหม่
                    </button>
                )}
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 animate-in fade-in slide-in-from-top-4">
                    <AlertCircle size={20} />
                    <p className="text-sm font-medium">{error}</p>
                    <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">
                        <X size={18} />
                    </button>
                </div>
            )}

            {/* Create / Edit Form */}
            {(showNewForm || isEditing) && (
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-primary/10 mb-8 animate-in zoom-in-95 duration-200">
                    <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        {showNewForm ? <Plus className="text-primary" size={20} /> : <Edit className="text-primary" size={20} />}
                        {showNewForm ? "เพิ่มหมวดหมู่ใหม่" : "แก้ไขหมวดหมู่"}
                    </h2>
                    <form onSubmit={showNewForm ? handleCreate : (e) => { e.preventDefault(); handleUpdate(isEditing!); }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">ชื่อหมวดหมู่</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => autoGenerateSlug(e.target.value)}
                                className="input-field w-full"
                                placeholder="เช่น การซ่อมบำรุง"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Slug (URL)</label>
                            <input
                                type="text"
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                className="input-field w-full"
                                placeholder="เช่น maintenance"
                                required
                            />
                        </div>
                        <div className="md:col-span-2 flex justify-end gap-3 mt-2">
                            <button
                                type="button"
                                onClick={showNewForm ? () => setShowNewForm(false) : cancelEdit}
                                className="btn btn-secondary"
                                disabled={isSubmitting}
                            >
                                ยกเลิก
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary min-w-[120px]"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : (showNewForm ? "บันทึก" : "อัปเดต")}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* List */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-4 text-sm font-bold text-slate-600">ชื่อหมวดหมู่</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-600">Slug</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-600 text-right">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-20 text-center">
                                        <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto mb-2" />
                                        <p className="text-slate-400 font-bold">กำลังโหลด...</p>
                                    </td>
                                </tr>
                            ) : categories.length > 0 ? (
                                categories.map((category) => (
                                    <tr key={category.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-slate-800">{category.name}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <code className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-lg">
                                                {category.slug}
                                            </code>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => startEdit(category)}
                                                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(category)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={3} className="px-6 py-20 text-center">
                                        <p className="text-slate-400 font-bold">ยังไม่มีหมวดหมู่บทความ</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                isLoading={isDeleting}
                title="ยืนยันการลบหมวดหมู่"
                description={`คุณต้องการลบหมวดหมู่ "${categoryToDelete?.name}" ใช่หรือไม่? หากมีบทความอยู่ในหมวดหมู่นี้ คุณจะไม่สามารถลบได้`}
            />
        </DashboardLayout>
    );
}
