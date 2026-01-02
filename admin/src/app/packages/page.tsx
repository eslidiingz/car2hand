"use client";

import DashboardLayout from "@/components/DashboardLayout";
import {
    Package,
    Check,
    Plus,
    Settings,
    Search,
    Edit3,
    Star,
    Zap,
    Crown,
    Trash2
} from "lucide-react";

const mockPackages = [
    { id: 1, name: "FREE", price: "0", duration: "30 วัน", features: ["ลงขายรถยนต์ 1 คัน", "รูปภาพไม่เกิน 5 รูป", "ไม่มีบริการดันประกาศ"], icon: Zap, color: "text-slate-400", bg: "bg-slate-50", recommended: false },
    { id: 2, name: "SILVER", price: "290", duration: "60 วัน", features: ["ลงขายรถยนต์ 3 คัน", "รูปภาพไม่เกิน 15 รูป", "ดันประกาศ 1 ครั้ง/สัปดาห์", "มีสัญลักษณ์ยืนยันตัวตน"], icon: Star, color: "text-blue-500", bg: "bg-blue-50", recommended: false },
    { id: 3, name: "GOLD", price: "590", duration: "90 วัน", features: ["ลงขายรถยนต์ 10 คัน", "รูปภาพไม่เกิน 30 รูป", "ดันประกาศทุกวัน", "มีระบุในหน้าแรก", "ใบรับรองการตรวจจากกูรู"], icon: Crown, color: "text-accent", bg: "bg-orange-50", recommended: true },
];

export default function PackageManagementPage() {
    return (
        <DashboardLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                        <Package className="text-primary h-8 w-8" /> จัดการแพ็กเกจ
                    </h1>
                    <p className="text-slate-500 mt-1 text-sm">กำหนดราคาและสิทธิพิเศษสำหรับผู้ลงโฆษณาขายรถ</p>
                </div>
                <button className="bg-primary hover:bg-slate-800 text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-primary/20 transition-all active:scale-95">
                    <Plus size={20} /> สร้างแพ็กเกจเพิ่ม
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {mockPackages.map((pkg) => (
                    <div key={pkg.id} className={`bg-white rounded-[32px] p-8 shadow-sm border-2 transition-all duration-500 relative group overflow-hidden ${pkg.recommended ? "border-accent ring-8 ring-accent/5" : "border-slate-50 hover:border-slate-200"
                        }`}>
                        {pkg.recommended && (
                            <div className="absolute top-0 right-0 bg-accent text-white px-6 py-1.5 rounded-bl-3xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg">
                                Popular
                            </div>
                        )}

                        <div className={`${pkg.bg} h-16 w-16 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                            <pkg.icon className={`h-8 w-8 ${pkg.color}`} />
                        </div>

                        <h2 className="text-sm font-black text-slate-400 tracking-widest mb-1 italic uppercase">{pkg.name}</h2>
                        <div className="flex items-baseline gap-1 mb-8">
                            <span className="text-4xl font-black text-slate-800 italic">฿{pkg.price}</span>
                            <span className="text-sm font-bold text-slate-400">/{pkg.duration}</span>
                        </div>

                        <div className="space-y-4 mb-10">
                            {pkg.features.map((feature, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <div className={`h-5 w-5 rounded-full ${pkg.recommended ? "bg-accent/10 text-accent" : "bg-emerald-50 text-emerald-500"} flex items-center justify-center flex-shrink-0`}>
                                        <Check size={12} strokeWidth={4} />
                                    </div>
                                    <span className="text-sm font-bold text-slate-600">{feature}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-2 pt-6 border-t border-slate-50">
                            <button className="flex-1 bg-white border border-slate-200 hover:border-slate-300 text-slate-600 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-sm hover:shadow-md">
                                <Edit3 size={16} /> แก้ไข
                            </button>
                            <button className="p-3 bg-rose-50 text-rose-400 hover:text-rose-600 hover:bg-rose-100 rounded-xl transition-all border border-rose-100">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-12 bg-primary rounded-[32px] p-10 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 h-full w-1/3 bg-white/5 skew-x-12 translate-x-1/2"></div>
                <div className="relative z-10">
                    <h3 className="text-2xl font-black italic mb-4">ตั้งค่าการชำระเงินอัตโนมัติ</h3>
                    <p className="text-blue-100/70 mb-8 max-w-xl text-sm font-medium">ระบบรองรับการชำระเงินผ่าน QR Code (PromptPay) และบัตรเครดิต โดยจะเปิดใช้งานแพ็กเกจให้ผู้ใช้งานทันทีที่การทำรายการเสร็จสมบูรณ์</p>
                    <div className="flex gap-4">
                        <button className="bg-accent hover:bg-orange-600 text-white px-8 py-3 rounded-2xl font-bold italic transition-all shadow-lg shadow-accent/20">ไปที่ตั้งค่าการจ่ายเงิน</button>
                        <button className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-2xl font-bold transition-all border border-white/10">ดูประวัติรายการ</button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
