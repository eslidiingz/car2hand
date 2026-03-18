"use client";

import React from 'react';
import {
    Car,
    Eye,
    ChatCircleDots,
    Heart,
    TrendUp,
    Warning
} from '@phosphor-icons/react';

export default function DashboardPage() {
    const stats = [
        { label: 'รถที่ลงขาย', value: '3', icon: <Car weight="fill" className="text-blue-500" />, change: '+1 เดือนนี้' },
        { label: 'ยอดเข้าชมรวม', value: '1,240', icon: <Eye weight="fill" className="text-green-500" />, change: '+12% จากเดือนก่อน' },
        // { label: 'ข้อความใหม่', value: '5', icon: <ChatCircleDots weight="fill" className="text-accent" />, change: 'ตอบกลับเร็ว' },
        { label: 'คนกดถูกใจ', value: '28', icon: <Heart weight="fill" className="text-red-500" />, change: '+4 สัปดาห์นี้' },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">ภาพรวมบัญชี (Dashboard)</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-gray-50 p-3 rounded-xl text-2xl">
                                {stat.icon}
                            </div>
                            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">{stat.change}</span>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                        <p className="text-sm text-gray-500">{stat.label}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Recent Activity */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-lg text-gray-800 mb-4">กิจกรรมล่าสุด</h3>
                    <div className="space-y-4">
                        <div className="flex items-start gap-3 pb-4 border-b border-gray-50">
                            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 flex-shrink-0">
                                <Eye weight="bold" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-800">มีคนดูรถ <span className="font-bold">Honda City 2020</span> ของคุณเพิ่มขึ้น 50 คน</p>
                                <span className="text-xs text-gray-400">2 ชั่วโมงที่แล้ว</span>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 pb-4 border-b border-gray-50">
                            <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center text-red-500 flex-shrink-0">
                                <Heart weight="bold" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-800">คุณ Somchai_K กดถูกใจรถ <span className="font-bold">Toyota Camry</span> ของคุณ</p>
                                <span className="text-xs text-gray-400">5 ชั่วโมงที่แล้ว</span>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center text-accent flex-shrink-0">
                                <Warning weight="bold" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-800">ถึงเวลาต่อภาษีรถ <span className="font-bold">Mazda 2</span> ทะเบียน กก 1234</p>
                                <span className="text-xs text-red-500 font-bold">หมดอายุใน 3 วัน</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Listing Performance */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg text-gray-800">ประสิทธิภาพประกาศ</h3>
                        <button className="text-accent text-sm font-bold hover:underline">ดูทั้งหมด</button>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <img src="https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=100" className="w-16 h-12 rounded-lg object-cover" />
                            <div className="flex-1">
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm font-bold text-gray-800">Honda City 1.0 SV</span>
                                    <span className="text-xs font-bold text-gray-500">1,204 views</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2">
                                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '70%' }}></div>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <img src="https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=100" className="w-16 h-12 rounded-lg object-cover" />
                            <div className="flex-1">
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm font-bold text-gray-800">Toyota Camry 2.5 G</span>
                                    <span className="text-xs font-bold text-gray-500">856 views</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2">
                                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-xl mt-4 flex items-center gap-3">
                            <TrendUp weight="fill" className="text-blue-500 text-2xl flex-shrink-0" />
                            <div>
                                <p className="text-sm text-gray-800 font-bold">เคล็ดลับเพิ่มยอดขาย!</p>
                                <p className="text-xs text-gray-500">การเพิ่มรูปภาพห้องเครื่องที่ชัดเจน ช่วยเพิ่มความน่าเชื่อถือได้ 30%</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
