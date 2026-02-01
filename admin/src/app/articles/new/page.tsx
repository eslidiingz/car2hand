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
    X
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
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-5">
                        <Button variant="secondary" size="icon" asChild className="h-12 w-12 rounded-2xl shadow-sm border-slate-100">
                            <Link href="/articles">
                                <ChevronLeft size={24} />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">เขียนบทความใหม่</h1>
                            <p className="text-slate-500 font-medium">สร้างคอนเทนต์คุณภาพเพื่อผู้ใช้งาน Car2Hand</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8 pb-24">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {/* Main Editor */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Title */}
                            <Card className="rounded-[40px] p-2 border-slate-100 shadow-sm overflow-hidden bg-white">
                                <CardContent className="p-8">
                                    <Label className="text-base font-bold text-slate-700 mb-4 block ml-1">หัวข้อบทความ</Label>
                                    <div className="relative group">
                                        <Type className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-300 group-focus-within:text-primary transition-colors" />
                                        <Input
                                            required
                                            placeholder="เช่น 10 จุดที่ต้องเช็ค เมื่อไปดูรถมือสอง..."
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="h-16 pl-14 pr-6 bg-slate-50/50 border-slate-200 rounded-[20px] focus:bg-white focus:ring-primary/5 transition-all font-bold text-xl md:text-2xl"
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Content */}
                            <Card className="rounded-[40px] p-2 border-slate-100 shadow-sm overflow-hidden bg-white">
                                <CardContent className="p-8">
                                    <Label className="text-base font-bold text-slate-700 mb-4 block ml-1">เนื้อหาบทความ</Label>
                                    <Textarea
                                        required
                                        placeholder="เริ่มเขียนเนื้อหาบทความของคุณที่นี่..."
                                        value={formData.content}
                                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                        className="p-6 bg-slate-50/50 border-slate-200 rounded-[24px] focus:bg-white focus:ring-primary/5 transition-all font-medium text-lg leading-relaxed min-h-[500px] resize-none"
                                    />
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar Options */}
                        <div className="space-y-8">
                            {/* Category & Status Actions */}
                            <Card className="rounded-[40px] p-2 border-slate-100 shadow-sm overflow-hidden bg-white">
                                <CardContent className="p-8 space-y-6">
                                    <div>
                                        <Label className="text-sm font-bold text-slate-700 mb-3 block ml-1 flex items-center gap-2">
                                            <Tag size={16} className="text-primary" /> เลือกหมวดหมู่
                                        </Label>
                                        <Select
                                            value={formData.categoryId}
                                            onValueChange={(val) => setFormData({ ...formData, categoryId: val })}
                                        >
                                            <SelectTrigger className="h-12 rounded-2xl bg-slate-50 border-slate-200 font-bold">
                                                <SelectValue placeholder="เลือกหมวดหมู่" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl">
                                                {categories.map(cat => (
                                                    <SelectItem key={cat.id} value={cat.id} className="font-bold py-3 rounded-xl">{cat.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="pt-6 border-t border-slate-100 space-y-3">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => handleSubmit(new Event('submit') as any, "DRAFT")}
                                            disabled={isSubmitting}
                                            className="w-full h-14 rounded-2xl font-bold border-2 hover:bg-slate-50"
                                        >
                                            <Save size={20} className="mr-2" /> บันทึกแบบร่าง
                                        </Button>
                                        <Button
                                            type="button"
                                            onClick={() => handleSubmit(new Event('submit') as any, "PUBLISHED")}
                                            disabled={isSubmitting}
                                            className="w-full h-16 rounded-2xl font-black text-lg shadow-xl shadow-primary/20"
                                        >
                                            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} className="mr-2" />}
                                            เผยแพร่บทความ
                                        </Button>
                                    </div>

                                    {error && (
                                        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold leading-relaxed flex gap-2">
                                            <AlertCircle size={16} className="shrink-0" />
                                            {error}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Excerpt */}
                            <Card className="rounded-[40px] p-2 border-slate-100 shadow-sm overflow-hidden bg-white">
                                <CardContent className="p-8">
                                    <Label className="text-sm font-bold text-slate-700 mb-3 block ml-1 flex items-center gap-2">
                                        <AlignLeft size={16} className="text-primary" /> คำโปรย (Excerpt)
                                    </Label>
                                    <Textarea
                                        rows={4}
                                        placeholder="สรุปเนื้อหาสั้นๆ เพื่อแสดงในหน้าแรก..."
                                        value={formData.excerpt}
                                        onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                        className="p-5 bg-slate-50/50 border-slate-200 rounded-2xl focus:bg-white transition-all text-sm font-medium resize-none"
                                    />
                                </CardContent>
                            </Card>

                            {/* Featured Image */}
                            <Card className="rounded-[40px] p-2 border-slate-100 shadow-sm overflow-hidden bg-white">
                                <CardContent className="p-8">
                                    <Label className="text-sm font-bold text-slate-700 mb-4 block ml-1 flex items-center gap-2">
                                        <ImageIcon size={16} className="text-primary" /> รูปหน้าปกบทความ
                                    </Label>

                                    <div className="space-y-5">
                                        {/* Upload Area */}
                                        {!imagePreview && !formData.featuredImage ? (
                                            <div className="relative group">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageFileChange}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                />
                                                <div className="border-2 border-dashed rounded-[32px] p-10 flex flex-col items-center justify-center transition-all bg-primary/5 border-primary/20 group-hover:border-primary/40 group-hover:bg-primary/10">
                                                    <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4">
                                                        <Upload className="h-8 w-8 text-primary" />
                                                    </div>
                                                    <p className="text-sm font-bold text-slate-600">อัปโหลดรูปภาพ</p>
                                                    <p className="text-[10px] text-slate-400 mt-2 uppercase font-black tracking-widest">WebP, JPG, PNG (1200x800px)</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="relative rounded-[32px] overflow-hidden aspect-video bg-slate-100 border border-slate-200 shadow-inner group">
                                                <img
                                                    src={imagePreview || formData.featuredImage}
                                                    alt="Preview"
                                                    className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
                                                />
                                                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <Button
                                                        variant="destructive"
                                                        onClick={() => {
                                                            setImageFile(null);
                                                            setImagePreview(null);
                                                            setFormData(p => ({ ...p, featuredImage: "" }));
                                                        }}
                                                        className="rounded-xl h-12 px-6 font-bold"
                                                    >
                                                        <X className="mr-2" /> ลบรูปภาพ
                                                    </Button>
                                                </div>
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black text-slate-400 uppercase ml-1">หรือระบุ URL รูปภาพ</Label>
                                            <Input
                                                type="url"
                                                placeholder="https://example.com/image.jpg"
                                                value={formData.featuredImage}
                                                onChange={(e) => setFormData({ ...formData, featuredImage: e.target.value })}
                                                className="h-10 rounded-xl bg-slate-50 border-slate-200 text-xs"
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

function AlertCircle(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
    )
}
