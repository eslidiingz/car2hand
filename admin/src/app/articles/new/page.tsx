"use client";

import DashboardLayout from "@/components/DashboardLayout";
import {
    Save,
    Send,
    Image as ImageIcon,
    Type,
    Tag,
    AlignLeft,
    ChevronLeft,
    Loader2,
    Upload,
    X,
    AlertCircle
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

// shadcn/ui components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function NewPostPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
    const [formData, setFormData] = useState({
        title: "",
        content: "",
        excerpt: "",
        categoryId: "",
        featuredImage: "",
        status: "DRAFT"
    });

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await apiFetch('/admin/categories');
                setCategories(data);
                if (data.length > 0) {
                    setFormData(prev => ({ ...prev, categoryId: data[0].id }));
                }
            } catch (err) {
                console.error("Fetch categories error:", err);
            }
        };
        fetchCategories();
    }, []);

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent, statusOverride?: "DRAFT" | "PUBLISHED") => {
        if (e) e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        const finalStatus = statusOverride || formData.status;

        const payload = new FormData();
        payload.append('title', formData.title);
        payload.append('content', formData.content);
        payload.append('excerpt', formData.excerpt);
        payload.append('categoryId', formData.categoryId);
        payload.append('status', finalStatus);

        if (imageFile) {
            payload.append('imageFile', imageFile);
        } else if (formData.featuredImage) {
            payload.append('featuredImage', formData.featuredImage);
        }

        try {
            await apiFetch('/admin/posts', {
                method: 'POST',
                body: payload
            });

            router.push('/articles');
        } catch (err: any) {
            setError(err.message || "เกิดข้อผิดพลาดในการบันทึกบทความ");
            setIsSubmitting(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="w-full">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" asChild className="h-9 w-9">
                            <Link href="/articles">
                                <ChevronLeft size={20} />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">เขียนบทความใหม่</h1>
                            <p className="text-slate-500 text-sm">สร้างคอนเทนต์คุณภาพเพื่อผู้ใช้งาน Car2Hand</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 pb-20">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Editor */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Title */}
                            <Card className="rounded-xl border-slate-200 shadow-sm">
                                <CardContent className="p-6">
                                    <Label className="text-sm font-medium text-slate-700 mb-3 block">หัวข้อบทความ</Label>
                                    <div className="relative group">
                                        <Type className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                                        <Input
                                            required
                                            placeholder="เช่น 10 จุดที่ต้องเช็ค เมื่อไปดูรถมือสอง..."
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="h-12 pl-12 pr-4 bg-slate-50 border-slate-200 rounded-lg focus:bg-white transition-colors font-semibold text-lg"
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Content */}
                            <Card className="rounded-xl border-slate-200 shadow-sm">
                                <CardContent className="p-6">
                                    <Label className="text-sm font-medium text-slate-700 mb-3 block">เนื้อหาบทความ</Label>
                                    <Textarea
                                        required
                                        placeholder="เริ่มเขียนเนื้อหาบทความของคุณที่นี่..."
                                        value={formData.content}
                                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                        className="p-4 bg-slate-50 border-slate-200 rounded-lg focus:bg-white transition-colors text-base leading-relaxed min-h-[500px] resize-none"
                                    />
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar Options */}
                        <div className="space-y-6">
                            {/* Category & Status Actions */}
                            <Card className="rounded-xl border-slate-200 shadow-sm">
                                <CardContent className="p-6 space-y-5">
                                    <div>
                                        <Label className="text-sm font-medium text-slate-700 mb-2 block flex items-center gap-2">
                                            <Tag size={14} className="text-primary" /> เลือกหมวดหมู่
                                        </Label>
                                        <Select
                                            value={formData.categoryId}
                                            onValueChange={(val) => setFormData({ ...formData, categoryId: val })}
                                        >
                                            <SelectTrigger className="h-10 rounded-lg bg-slate-50 border-slate-200 font-medium">
                                                <SelectValue placeholder="เลือกหมวดหมู่" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-lg">
                                                {categories.map(cat => (
                                                    <SelectItem key={cat.id} value={cat.id} className="font-medium py-2">{cat.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="pt-4 border-t border-slate-100 space-y-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => handleSubmit(new Event('submit') as any, "DRAFT")}
                                            disabled={isSubmitting}
                                            className="w-full h-10 rounded-lg font-medium"
                                        >
                                            <Save size={16} className="mr-2" /> บันทึกแบบร่าง
                                        </Button>
                                        <Button
                                            type="button"
                                            onClick={() => handleSubmit(new Event('submit') as any, "PUBLISHED")}
                                            disabled={isSubmitting}
                                            className="w-full h-11 rounded-lg font-semibold bg-brand-primary hover:bg-brand-primary/90 text-white"
                                        >
                                            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={16} className="mr-2" />}
                                            เผยแพร่บทความ
                                        </Button>
                                    </div>

                                    {error && (
                                        <div className="p-3 rounded-lg bg-rose-50 border border-rose-100 text-rose-600 text-sm font-medium flex gap-2">
                                            <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                            {error}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Excerpt */}
                            <Card className="rounded-xl border-slate-200 shadow-sm">
                                <CardContent className="p-6">
                                    <Label className="text-sm font-medium text-slate-700 mb-2 block flex items-center gap-2">
                                        <AlignLeft size={14} className="text-primary" /> คำโปรย (Excerpt)
                                    </Label>
                                    <Textarea
                                        rows={4}
                                        placeholder="สรุปเนื้อหาสั้นๆ เพื่อแสดงในหน้าแรก..."
                                        value={formData.excerpt}
                                        onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                        className="p-4 bg-slate-50 border-slate-200 rounded-lg focus:bg-white transition-colors text-sm resize-none"
                                    />
                                </CardContent>
                            </Card>

                            {/* Featured Image */}
                            <Card className="rounded-xl border-slate-200 shadow-sm">
                                <CardContent className="p-6">
                                    <Label className="text-sm font-medium text-slate-700 mb-3 block flex items-center gap-2">
                                        <ImageIcon size={14} className="text-primary" /> รูปหน้าปกบทความ
                                    </Label>

                                    <div className="space-y-4">
                                        {/* Upload Area */}
                                        {!imagePreview && !formData.featuredImage ? (
                                            <div className="relative group">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageFileChange}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                />
                                                <div className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center transition-colors bg-slate-50 border-slate-200 group-hover:border-primary/40 group-hover:bg-primary/5">
                                                    <div className="h-12 w-12 bg-white rounded-lg flex items-center justify-center shadow-sm mb-3">
                                                        <Upload className="h-6 w-6 text-primary" />
                                                    </div>
                                                    <p className="text-sm font-medium text-slate-600">อัปโหลดรูปภาพ</p>
                                                    <p className="text-xs text-slate-400 mt-1">WebP, JPG, PNG (1200x800px)</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="relative rounded-lg overflow-hidden aspect-video bg-slate-100 border border-slate-200 group">
                                                <img
                                                    src={imagePreview || formData.featuredImage}
                                                    alt="Preview"
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <Button
                                                        variant="destructive"
                                                        onClick={() => {
                                                            setImageFile(null);
                                                            setImagePreview(null);
                                                            setFormData(p => ({ ...p, featuredImage: "" }));
                                                        }}
                                                        className="rounded-lg font-medium"
                                                    >
                                                        <X className="mr-2" size={16} /> ลบรูปภาพ
                                                    </Button>
                                                </div>
                                            </div>
                                        )}

                                        <div className="space-y-1.5">
                                            <Label className="text-xs text-slate-400">หรือระบุ URL รูปภาพ</Label>
                                            <Input
                                                type="url"
                                                placeholder="https://example.com/image.jpg"
                                                value={formData.featuredImage}
                                                onChange={(e) => setFormData({ ...formData, featuredImage: e.target.value })}
                                                className="h-9 rounded-lg bg-slate-50 border-slate-200 text-xs"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
