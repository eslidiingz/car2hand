"use client";

import DashboardLayout from "@/components/DashboardLayout";
import {
    BookOpen,
    Save,
    Send,
    Image as ImageIcon,
    Type,
    Tag,
    AlignLeft,
    ChevronLeft,
    Loader2,
    Upload
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

const CATEGORIES = [
    { value: 'BUYING_GUIDE', label: 'มือใหม่หัดซื้อ' },
    { value: 'MAINTENANCE', label: 'การซ่อมบำรุง' },
    { value: 'FINANCE_INSURANCE', label: 'ไฟแนนซ์ & ประกัน' },
    { value: 'EV', label: 'รถ EV' },
    { value: 'ENCYCLOPEDIA', label: 'สารานุกรมรุ่นรถ' },
];

export default function NewPostPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: "",
        content: "",
        excerpt: "",
        category: "BUYING_GUIDE",
        featuredImage: "",
        status: "DRAFT"
    });
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

        // Use FormData for combined submission
        const payload = new FormData();
        payload.append('title', formData.title);
        payload.append('content', formData.content);
        payload.append('excerpt', formData.excerpt);
        payload.append('category', formData.category);
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
                        <Link
                            href="/articles"
                            className="btn btn-secondary h-10 w-10 p-0"
                        >
                            <ChevronLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">เขียนบทความใหม่</h1>
                            <p className="text-slate-500 text-sm">สร้างคอนเทนต์คุณภาพเพื่อผู้ใช้งาน Car2Hand</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 pb-20">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Editor */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Title */}
                            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                                <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">หัวข้อบทความ</label>
                                <div className="relative group">
                                    <Type className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                    <input
                                        required
                                        type="text"
                                        placeholder="เช่น 10 จุดที่ต้องเช็ค เมื่อไปดูรถมือสอง..."
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-bold text-lg"
                                    />
                                </div>
                            </div>

                            {/* Content */}
                            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                                <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">เนื้อหาบทความ</label>
                                <div className="relative group">
                                    <textarea
                                        required
                                        rows={15}
                                        placeholder="เขียนเนื้อหาบทความที่นี่..."
                                        value={formData.content}
                                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium min-h-[400px]"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Sidebar Options */}
                        <div className="space-y-6">
                            {/* Excerpt */}
                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                                <label className="block text-sm font-bold text-slate-700 mb-3 ml-1 flex items-center gap-2">
                                    <AlignLeft size={16} className="text-primary" /> คำโปรย (Excerpt)
                                </label>
                                <textarea
                                    rows={4}
                                    placeholder="สรุปเนื้อหาสั้นๆ เพื่อแสดงในหน้าแรก..."
                                    value={formData.excerpt}
                                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm font-medium"
                                />
                            </div>

                            {/* Category & Image */}
                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-3 ml-1 flex items-center gap-2">
                                        <Tag size={16} className="text-primary" /> หมวดหมู่
                                    </label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-primary transition-all text-sm font-bold cursor-pointer appearance-none"
                                    >
                                        {CATEGORIES.map(cat => (
                                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-3 ml-1 flex items-center gap-2">
                                        <ImageIcon size={16} className="text-primary" /> รูปหน้าปกบทความ
                                    </label>

                                    <div className="space-y-4">
                                        {/* Upload Area */}
                                        <div className="relative">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageFileChange}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            />
                                            <div className="border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center transition-all bg-primary/5 border-primary/20 hover:border-primary/40 hover:bg-primary/10">
                                                <Upload className="h-8 w-8 text-primary mb-2" />
                                                <p className="text-xs font-bold text-slate-600 italic">คลิกหรือลากรูปมาวางเพื่อเลือกรูป</p>
                                                <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tighter">แนะนำ 1200 x 800px (WebP, JPG, PNG)</p>
                                            </div>
                                        </div>

                                        {/* URL fallback (Small but still available) */}
                                        <div className="relative group">
                                            <input
                                                type="url"
                                                placeholder="หรือวาง URL รูปภาพที่นี่..."
                                                value={formData.featuredImage}
                                                onChange={(e) => setFormData({ ...formData, featuredImage: e.target.value })}
                                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-primary transition-all text-[11px] font-medium"
                                            />
                                        </div>
                                    </div>

                                    {(imagePreview || formData.featuredImage) && (
                                        <div className="mt-4 rounded-2xl overflow-hidden aspect-video bg-slate-100 border border-slate-200 relative group shadow-sm">
                                            <img
                                                src={imagePreview || formData.featuredImage}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setImageFile(null);
                                                        setImagePreview(null);
                                                        setFormData(p => ({ ...p, featuredImage: "" }));
                                                    }}
                                                    className="btn btn-danger btn-sm"
                                                >
                                                    ลบรูปภาพ
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Status & Actions */}
                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                                <label className="block text-sm font-bold text-slate-700 mb-4 ml-1">สถานะบทความ</label>
                                <div className="space-y-3">
                                    <button
                                        type="button"
                                        onClick={() => handleSubmit(new Event('submit') as any, "DRAFT")}
                                        disabled={isSubmitting}
                                        className="btn btn-secondary btn-md w-full"
                                    >
                                        <Save size={18} /> บันทึกแบบร่าง
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleSubmit(new Event('submit') as any, "PUBLISHED")}
                                        disabled={isSubmitting}
                                        className="btn btn-primary btn-lg w-full"
                                    >
                                        {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Send size={18} />}
                                        เผยแพร่บทความ
                                    </button>
                                </div>
                                {error && (
                                    <p className="mt-4 text-xs text-red-500 font-bold text-center bg-red-50 p-3 rounded-xl border border-red-100">
                                        {error}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
