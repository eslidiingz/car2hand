"use client";

import DashboardLayout from "@/components/DashboardLayout";
import {
    Car,
    Search,
    Filter,
    CheckCircle,
    XCircle,
    Eye,
    Clock,
    Tag,
    MapPin,
    ChevronLeft,
    ChevronRight,
    MoreHorizontal
} from "lucide-react";
import { useState } from "react";

const mockListings = [
    { id: 1, title: "Honda Civic 1.5 Turbo RS 2021", seller: "สมชาย รักรถ", price: "890,000", status: "PENDING", date: "2 นาทีที่แล้ว", type: "CAR", image: "https://picsum.photos/seed/car1/200/150" },
    { id: 2, title: "Toyota Corolla Altis 1.8 Hybrid 2022", seller: "วิภาวดี คาร์", price: "750,000", status: "ACTIVE", date: "1 ชม.ที่แล้ว", type: "CAR", image: "https://picsum.photos/seed/car2/200/150" },
    { id: 3, title: "Yamaha YZF-R15 2023", seller: "กฤษฎา มอเตอร์", price: "95,000", status: "PENDING", date: "3 ชม.ที่แล้ว", type: "MOTORCYCLE", image: "https://picsum.photos/seed/moto1/200/150" },
    { id: 4, title: "Mazda 2 1.3 Sports 2020", seller: "นานา รถสวย", price: "420,000", status: "REJECTED", date: "昨天", type: "CAR", image: "https://picsum.photos/seed/car3/200/150" },
    { id: 5, title: "BMW 320d M Sport 2019", seller: "Euro Cars", price: "1,590,000", status: "ACTIVE", date: "2 วันที่แล้ว", type: "CAR", image: "https://picsum.photos/seed/car4/200/150" },
];

export default function ListingModerationPage() {
    const [activeTab, setActiveTab] = useState("PENDING");

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "ACTIVE": return <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-black bg-emerald-100 text-emerald-700 uppercase">Approved</span>;
            case "PENDING": return <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-black bg-amber-100 text-amber-700 uppercase">Review Needed</span>;
            case "REJECTED": return <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-black bg-rose-100 text-rose-700 uppercase">Rejected</span>;
            default: return null;
        }
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Car className="text-primary" /> ตรวจสอบประกาศขาย
                    </h1>
                    <p className="text-slate-500 mt-1 text-sm">ตรวจสอบและอนุมัติประกาศขายรถยนต์และจักรยานยนต์ใหม่</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 mb-6 gap-8">
                {[
                    { id: "PENDING", label: "รอการตรวจสอบ", count: 24 },
                    { id: "ACTIVE", label: "อนุมัติแล้ว", count: 1542 },
                    { id: "REJECTED", label: "ไม่อนุมัติ", count: 86 },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`pb-4 px-2 text-sm font-bold transition-all relative ${activeTab === tab.id ? "text-primary" : "text-slate-400 hover:text-slate-600"
                            }`}
                    >
                        {tab.label}
                        <span className={`ml-2 px-1.5 py-0.5 rounded-md text-[10px] ${activeTab === tab.id ? "bg-primary text-white" : "bg-slate-100 text-slate-500"
                            }`}>
                            {tab.count}
                        </span>
                        {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full"></div>}
                    </button>
                ))}
            </div>

            {/* Grid of Listings for Review */}
            <div className="grid grid-cols-1 gap-6">
                {mockListings.filter(l => l.status === activeTab || activeTab === "ALL").map((listing) => (
                    <div key={listing.id} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col md:flex-row group hover:shadow-md transition-all duration-300">
                        <div className="w-full md:w-64 h-48 md:h-auto bg-slate-100 relative overflow-hidden flex-shrink-0">
                            <img src={listing.image} alt={listing.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            <div className="absolute top-3 left-3 flex gap-2">
                                <span className="bg-black/50 backdrop-blur-md text-white px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1">
                                    {listing.type === "CAR" ? <Car size={12} /> : <Tag size={12} />} {listing.type}
                                </span>
                            </div>
                        </div>

                        <div className="flex-1 p-6 flex flex-col">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800">{listing.title}</h2>
                                    <div className="flex items-center gap-4 mt-2">
                                        <span className="text-xs text-slate-500 flex items-center gap-1 font-medium"><Clock size={14} /> {listing.date}</span>
                                        <span className="text-xs text-slate-500 flex items-center gap-1 font-medium"><MapPin size={14} /> กรุงเทพฯ</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-black text-primary italic">฿{listing.price}</p>
                                </div>
                            </div>

                            <div className="mt-4 p-4 bg-slate-50 rounded-2xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center border border-slate-100 shadow-sm text-primary font-bold">
                                        {listing.seller.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-700">{listing.seller}</p>
                                        <p className="text-[10px] text-slate-400">ผู้ขายยืนยันตัวตนแล้ว</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2">
                                        <Eye size={14} /> ดูรายละเอียด
                                    </button>
                                </div>
                            </div>

                            <div className="mt-auto pt-6 flex flex-col sm:flex-row gap-3">
                                <button className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-2xl transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2">
                                    <CheckCircle size={20} /> อนุมัติประกาศ
                                </button>
                                <button className="flex-1 bg-white border border-rose-200 hover:border-rose-300 text-rose-500 font-bold py-3 rounded-2xl transition-all flex items-center justify-center gap-2">
                                    <XCircle size={20} /> ไม่อนุมัติ
                                </button>
                                <button className="p-3 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-2xl transition-all">
                                    <MoreHorizontal size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination Placeholder */}
            <div className="mt-8 flex items-center justify-center gap-4">
                <button className="p-2 border border-slate-200 rounded-xl text-slate-400 hover:text-primary transition-all">
                    <ChevronLeft size={20} />
                </button>
                <span className="text-sm font-bold text-slate-600">หน้า 1 จาก 12</span>
                <button className="p-2 border border-slate-200 rounded-xl text-slate-400 hover:text-primary transition-all">
                    <ChevronRight size={20} />
                </button>
            </div>
        </DashboardLayout>
    );
}
