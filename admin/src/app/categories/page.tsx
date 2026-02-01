"use client";

import DashboardLayout from "@/components/DashboardLayout";
import {
    Tag,
    Plus,
    Edit,
    Trash2,
    Loader2,
    X,
    AlertCircle
} from "lucide-react";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";

// shadcn/ui components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

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
            toast.success("บันทึกหมวดหมู่เรียบร้อยแล้ว");
            fetchCategories();
        } catch (err: any) {
            setError(err.message || "ไม่สามารถสร้างหมวดหมู่ได้");
            toast.error(err.message || "ไม่สามารถสร้างหมวดหมู่ได้");
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
            toast.success("อัปเดตหมวดหมู่เรียบร้อยแล้ว");
            fetchCategories();
        } catch (err: any) {
            setError(err.message || "ไม่สามารถแก้ไขหมวดหมู่ได้");
            toast.error(err.message || "ไม่สามารถแก้ไขหมวดหมู่ได้");
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
            toast.success("ลบหมวดหมู่เรียบร้อยแล้ว");
            fetchCategories();
        } catch (err: any) {
            setError(err.message || "ไม่สามารถลบหมวดหมู่ได้");
            toast.error(err.message || "ไม่สามารถลบหมวดหมู่ได้");
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
                    <Button
                        onClick={() => {
                            setShowNewForm(true);
                            setFormData({ name: "", slug: "" });
                        }}
                        className="rounded-xl h-12 px-6 font-bold"
                    >
                        <Plus className="mr-2 h-5 w-5" /> เพิ่มหมวดหมู่ใหม่
                    </Button>
                )}
            </div>

            {error && (
                <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-2xl flex items-center gap-3 text-destructive animate-in fade-in slide-in-from-top-4">
                    <AlertCircle size={20} />
                    <p className="text-sm font-medium">{error}</p>
                    <Button variant="ghost" size="icon" onClick={() => setError(null)} className="ml-auto h-8 w-8 text-destructive/60 hover:text-destructive">
                        <X size={18} />
                    </Button>
                </div>
            )}

            {/* Create / Edit Form */}
            {(showNewForm || isEditing) && (
                <Card className="rounded-[32px] border-primary/10 mb-8 overflow-hidden animate-in zoom-in-95 duration-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            {showNewForm ? <Plus className="text-primary" size={20} /> : <Edit className="text-primary" size={20} />}
                            {showNewForm ? "เพิ่มหมวดหมู่ใหม่" : "แก้ไขหมวดหมู่"}
                        </CardTitle>
                        <CardDescription>กรอกข้อมูลชื่อหมวดหมู่และ Slug สำหรับ URL</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={showNewForm ? handleCreate : (e) => { e.preventDefault(); handleUpdate(isEditing!); }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="category-name">ชื่อหมวดหมู่</Label>
                                <Input
                                    id="category-name"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="เช่น การซ่อมบำรุง"
                                    className="h-11 rounded-xl"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="category-slug">Slug (URL)</Label>
                                <Input
                                    id="category-slug"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    placeholder="เช่น maintenance"
                                    className="h-11 rounded-xl"
                                    required
                                />
                            </div>
                            <div className="md:col-span-2 flex justify-end gap-3 mt-2">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={showNewForm ? () => setShowNewForm(false) : cancelEdit}
                                    disabled={isSubmitting}
                                    className="rounded-xl px-6"
                                >
                                    ยกเลิก
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="rounded-xl px-10 font-bold"
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : (showNewForm ? "บันทึก" : "อัปเดต")}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* List */}
            <Card className="rounded-[32px] border-slate-100 overflow-hidden shadow-sm">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow>
                            <TableHead className="px-6 py-4 font-bold text-slate-600">ชื่อหมวดหมู่</TableHead>
                            <TableHead className="px-6 py-4 font-bold text-slate-600">Slug</TableHead>
                            <TableHead className="px-6 py-4 font-bold text-slate-600 text-right">จัดการ</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={3} className="px-6 py-20 text-center">
                                    <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto mb-2" />
                                    <p className="text-slate-400 font-bold">กำลังโหลด...</p>
                                </TableCell>
                            </TableRow>
                        ) : categories.length > 0 ? (
                            categories.map((category) => (
                                <TableRow key={category.id} className="group hover:bg-slate-50/50 transition-colors">
                                    <TableCell className="px-6 py-4">
                                        <span className="font-bold text-slate-800">{category.name}</span>
                                    </TableCell>
                                    <TableCell className="px-6 py-4">
                                        <code className="text-[11px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg font-mono">
                                            {category.slug}
                                        </code>
                                    </TableCell>
                                    <TableCell className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => startEdit(category)}
                                                className="h-9 w-9 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl"
                                            >
                                                <Edit size={18} />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeleteClick(category)}
                                                className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl"
                                            >
                                                <Trash2 size={18} />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={3} className="px-6 py-20 text-center">
                                    <p className="text-slate-400 font-bold italic">ยังไม่มีหมวดหมู่บทความ</p>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Card>

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
