"use client";

import Link from 'next/link';
import { ArrowRight, ShieldCheck, CalendarPlus, Calculator, Coins } from 'lucide-react';

export default function ServiceShortcuts() {
    return (
        <section className="max-w-7xl mx-auto px-4 mb-20">
            <h2 className="text-2xl font-bold text-primary mb-6">บริการครบวงจรสำหรับคนรักรถ</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Car Inspection */}
                <Link href="/services/inspection" className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#00C851] to-[#007E33] text-white shadow-lg group cursor-pointer hover:shadow-xl transition duration-300 hover:-translate-y-1 block">
                    <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 translate-y-4 group-hover:rotate-12 transition duration-500">
                        <ShieldCheck className="text-9xl" />
                    </div>

                    <div className="p-8 relative z-10 flex flex-col h-full justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="bg-white/20 border border-white/20 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide">For Buyers</span>
                            </div>
                            <h3 className="text-2xl font-bold mb-2">จองคิวตรวจสภาพรถ</h3>
                            <p className="text-green-50 text-sm md:text-base max-w-xs opacity-90">
                                จะซื้อรถทั้งที ต้องเช็คให้ชัวร์! จองคิวช่างผู้เชี่ยวชาญไปตรวจให้ถึงที่ เช็คละเอียด 200 จุด พร้อมใบรับรอง
                            </p>
                        </div>
                        <div className="mt-6">
                            <div className="bg-white text-green-700 px-6 py-3 rounded-xl font-bold text-sm w-fit hover:bg-gray-100 transition flex items-center gap-2">
                                จองคิวตรวจ <CalendarPlus />
                            </div>
                        </div>
                    </div>
                </Link>

                {/* Finance & Insurance */}
                <Link href="/services/finance" className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0F3460] to-[#16213E] text-white shadow-lg group cursor-pointer hover:shadow-xl transition duration-300 hover:-translate-y-1 block">
                    <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-10 -translate-y-5 group-hover:scale-110 transition duration-500">
                        <Coins className="text-9xl" />
                    </div>

                    <div className="p-8 relative z-10 flex flex-col h-full justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="bg-blue-500/30 border border-blue-400/30 text-blue-200 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide">One-Stop Service</span>
                            </div>
                            <h3 className="text-2xl font-bold mb-2">สินเชื่อ & ประกันภัย</h3>
                            <p className="text-blue-100 text-sm md:text-base max-w-xs opacity-90">
                                คำนวณค่างวด เปรียบเทียบดอกเบี้ยจากธนาคารชั้นนำ พร้อมประกันภัยราคาพิเศษ จบครบในที่เดียว
                            </p>
                        </div>
                        <div className="mt-6">
                            <div className="bg-white text-primary px-6 py-3 rounded-xl font-bold text-sm w-fit hover:bg-gray-100 transition flex items-center gap-2">
                                คำนวณค่างวด <Calculator />
                            </div>
                        </div>
                    </div>
                </Link>

            </div>
        </section>
    );
}
