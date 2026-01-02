"use client";

import DashboardLayout from "@/components/DashboardLayout";
import {
    BookOpen,
    Search,
    Plus,
    Edit,
    Trash2,
    Eye,
    Calendar,
    User,
    Tag,
    ChevronLeft,
    ChevronRight,
    MoreVertical
} from "lucide-react";
import { useState } from "react";

const mockPosts = [
    { id: 1, title: "10 จุดที่ต้องเช็ค เมื่อไปดูรถมือสองด้วยตัวเอง", author: "GURU Somchai", category: "เทคนิคการซื้อ", status: "PUBLISHED", views: "12,402", date: "15 ธ.ค. 2025", image: "https://picsum.photos/seed/k1/300/200" },
    { id: 2, title: "วิธีอ่านเล่มทะเบียนรถเบื้องต้น ไม่ให้โดนย้อมแมว", author: "Admin Nan", category: "ความรู้กฎหมาย", status: "PUBLISHED", views: "8,245", date: "20 ธ.ค. 2025", image: "https://picsum.photos/seed/k2/300/200" },
    { id: 3, title: "สรุปขั้นตอนการโอนรถยนต์ที่กรมขนส่ง ปี 2567", author: "GURU Somchai", category: "ขั้นตอนการโอน", status: "DRAFT", views: "0", date: "02 ม.ค. 2026", image: "https://picsum.photos/seed/k3/300/200" },
    { id: 4, title: "รีวิว All New Honda Civic FE มือสองยังน่าเล่นไหม?", author: "Admin Nan", category: "รีวิวรถ", status: "PUBLISHED", views: "4,120", date: "03 ม.ค. 2026", image: "https://picsum.photos/seed/k4/300/200" },
];

export default function KnowledgeBasePage() {
    const [searchTerm, setSearchTerm] = useState("");

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "PUBLISHED": return <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-black bg-emerald-100 text-emerald-700">PUBLISHED</span>;
            case "DRAFT": return <span className="inline-flex items-center px-2 py-1 rounded-lg text-[10px] font-black bg-slate-100 text-slate-500">DRAFT</span>;
            default: return null;
        }
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <BookOpen className="text-primary" /> จัดการความรู้เรื่องรถ
                    </h1>
                    <p className="text-slate-500 mt-1 text-sm">เขียนบทความ ให้ความรู้ และเทคนิคเรื่องรถยนต์เพื่อชุมชน</p>
                </div>
                <button className="bg-primary hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-95">
                    <Plus size={20} /> เขียนบทความใหม่
                </button>
            </div>

            {/* Grid of Posts */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {mockPosts.map((post) => (
                    <div key={post.id} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col sm:flex-row group hover:shadow-md transition-all duration-300">
                        <div className="w-full sm:w-48 h-48 sm:h-auto bg-slate-100 relative overflow-hidden flex-shrink-0">
                            <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            <div className="absolute top-3 left-3">
                                {getStatusBadge(post.status)}
                            </div>
                        </div>

                        <div className="flex-1 p-6 flex flex-col">
                            <div className="mb-2">
                                <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/5 px-2 py-1 rounded-md mb-2 inline-block italic">
                                    {post.category}
                                </span>
                                <h2 className="text-lg font-bold text-slate-800 leading-snug group-hover:text-primary transition-colors line-clamp-2">{post.title}</h2>
                            </div>

                            <div className="flex items-center gap-4 mt-2">
                                <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1 uppercase"><User size={12} /> {post.author}</span>
                                <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1 uppercase"><Calendar size={12} /> {post.date}</span>
                                <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1 uppercase"><Eye size={12} /> {post.views}</span>
                            </div>

                            <div className="mt-auto pt-6 flex items-center justify-between border-t border-slate-50">
                                <div className="flex gap-2">
                                    <button className="p-2 text-slate-400 hover:text-primary hover:bg-slate-50 rounded-lg transition-all border border-transparent hover:border-slate-100">
                                        <Edit size={16} />
                                    </button>
                                    <button className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all border border-transparent hover:border-slate-100">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <button className="text-sm font-bold text-primary hover:text-accent flex items-center gap-1 transition-all">
                                    อ่านตัวอย่าง <Eye size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-12 flex items-center justify-between p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary">
                        <BookOpen size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-800">มีบทความร่างอยู่ 3 รายการ</p>
                        <p className="text-xs text-slate-500 font-medium">ทำต่อให้เสร็จเพื่อเพิ่มจำนวนผู้เข้าชมเว็บไซต์</p>
                    </div>
                </div>
                <button className="text-sm font-bold text-primary hover:bg-primary/5 px-4 py-2 rounded-xl transition-all">ดูบทความร่างทั้งหมด</button>
            </div>
        </DashboardLayout>
    );
}
