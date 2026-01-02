"use client";

import React from 'react';
import Link from 'next/link';
import {
    ArrowLeft,
    Sparkle,
    TrendUp,
    Lightning,
    Lightbulb,
    ArrowRight
} from '@phosphor-icons/react';

export default function EstimatePricePage() {
    return (
        <div className="bg-surface text-gray-800 min-h-screen">
            {/* Custom Navbar for Estimate Flow */}
            <nav className="bg-white border-b border-gray-200 py-4 sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Link href="/sell" className="text-gray-500 hover:text-primary"><ArrowLeft weight="bold" className="text-xl" /></Link>
                        <span className="font-bold text-xl text-primary">ผลการประเมินราคา</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Powered by Car2Hand</span>
                    </div>
                </div>
            </nav>

            <div className="max-w-4xl mx-auto px-4 py-8">

                {/* Car Info */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-gray-200 rounded-xl overflow-hidden shadow-sm">
                        <img src="https://images.unsplash.com/photo-1619682817481-e994891cd1f5?q=80&w=200&auto=format&fit=crop" className="w-full h-full object-cover" alt="Car" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Honda Civic 1.5 Turbo RS</h1>
                        <p className="text-gray-500 text-sm">ปี 2020 • 45,000 กม. • สีขาว</p>
                    </div>
                </div>

                {/* Price Card with Gradient */}
                <div className="bg-gradient-to-br from-primary to-[#16213E] rounded-3xl p-1 relative overflow-hidden shadow-2xl mb-8">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl transform translate-x-20 -translate-y-20 animate-pulse"></div>

                    <div className="bg-white/5 backdrop-blur-sm rounded-[20px] p-6 md:p-10 text-center text-white relative z-10 border border-white/10">

                        <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-bold text-blue-200 mb-6 border border-white/20">
                            <Sparkle weight="fill" className="text-yellow-400" /> AI Confidence: 95%
                        </div>

                        <h2 className="text-gray-300 text-sm md:text-base mb-2">ราคาขายแนะนำ (Market Value)</h2>

                        <div className="flex items-baseline justify-center gap-2 mb-4">
                            <span className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-white">720,000</span>
                            <span className="text-xl md:text-2xl text-gray-400">-</span>
                            <span className="text-4xl md:text-6xl font-bold text-white">750,000</span>
                            <span className="text-lg text-gray-400 font-medium">บาท</span>
                        </div>

                        <p className="text-sm text-blue-200 mb-8 max-w-lg mx-auto">
                            *ราคานี้ประเมินจากการขายรถรุ่นเดียวกันจำนวน 142 คัน ในช่วง 3 เดือนที่ผ่านมา
                        </p>

                        <div className="bg-white/10 rounded-xl p-4 max-w-lg mx-auto border border-white/10">
                            <label className="block text-xs text-gray-300 mb-3 text-left">สภาพรถของคุณส่งผลต่อราคา:</label>
                            <div className="flex gap-2">
                                <button className="flex-1 py-2 rounded-lg text-xs font-bold border border-white/10 text-gray-400 hover:bg-white/10 transition">พอใช้</button>
                                <button className="flex-1 py-2 rounded-lg text-xs font-bold bg-white text-primary shadow-lg scale-105 transition">ดีมาก (แนะนำ)</button>
                                <button className="flex-1 py-2 rounded-lg text-xs font-bold border border-white/10 text-gray-400 hover:bg-white/10 transition">นางฟ้า</button>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Analytics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

                    {/* Trend */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-primary flex items-center gap-2">
                                <TrendUp weight="fill" className="text-green-500" /> แนวโน้มราคา
                            </h3>
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">ความต้องการสูง</span>
                        </div>

                        <div className="h-32 flex items-end justify-between gap-2 px-2">
                            <div className="w-full bg-blue-50 rounded-t-sm h-[40%] relative group">
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] bg-gray-800 text-white px-1 rounded opacity-0 group-hover:opacity-100 transition">6M ago</div>
                            </div>
                            <div className="w-full bg-blue-50 rounded-t-sm h-[50%]"></div>
                            <div className="w-full bg-blue-100 rounded-t-sm h-[45%]"></div>
                            <div className="w-full bg-blue-100 rounded-t-sm h-[60%]"></div>
                            <div className="w-full bg-blue-200 rounded-t-sm h-[75%]"></div>
                            <div className="w-full bg-primary rounded-t-sm h-[85%] relative">
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-accent text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap">
                                    ตอนนี้
                                </div>
                            </div>
                        </div>
                        <p className="text-xs text-gray-400 mt-3 text-center">ราคารถรุ่นนี้กำลังแข็งตัว รีบขายก่อนรุ่นใหม่เปิดตัว</p>
                    </div>

                    {/* Velocity */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                        <div>
                            <h3 className="font-bold text-primary flex items-center gap-2 mb-2">
                                <Lightning weight="fill" className="text-yellow-500" /> ความไวในการขาย
                            </h3>
                            <p className="text-gray-500 text-sm">จากสถิติของ Car2Hand รถรุ่นนี้ขายออกไวมาก</p>
                        </div>

                        <div className="flex items-center justify-center my-4">
                            <div className="text-center">
                                <span className="text-4xl font-bold text-gray-800">5 <span className="text-sm text-gray-400 font-normal">วัน</span></span>
                                <span className="block text-xs text-gray-400">เวลาเฉลี่ยในการขาย</span>
                            </div>
                        </div>

                        <div className="bg-yellow-50 text-yellow-800 text-xs p-3 rounded-lg border border-yellow-100 flex gap-2 items-start">
                            <Lightbulb weight="fill" className="mt-0.5" />
                            <span>สีขาวเป็นสีที่ตลาดต้องการมากที่สุด ขายง่ายกว่าสีอื่น 20%</span>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="bg-white p-4 border-t border-gray-100 md:border-none md:bg-transparent fixed bottom-0 left-0 w-full md:relative md:p-0 z-40">
                    <div className="max-w-4xl mx-auto flex gap-4">
                        <Link href="/sell/create" className="flex-[2] bg-accent text-white py-3 rounded-xl font-bold shadow-lg shadow-orange-200 hover:bg-orange-600 transition flex items-center justify-center gap-2 text-lg">
                            ลงขายที่ราคานี้ <ArrowRight weight="bold" />
                        </Link>
                    </div>
                </div>
                <div className="h-20 md:hidden"></div>

            </div>
        </div>
    );
}
