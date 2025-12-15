"use client";

import React from 'react';
import Link from 'next/link';
import {
    Bell,
    PencilSimple,
    ChatsCircle,
    Wrench,
    Star,
    Lightning,
    ShoppingCart,
    ShieldCheck,
    CaretUp,
    CaretDown,
    Check,
    ChatCircle,
    Eye,
    SealCheck,
    Trophy,
    Medal,
    UsersThree
} from '@phosphor-icons/react';

export default function CommunityPage() {
    return (
        <div className="bg-surface text-gray-800 min-h-screen">
            {/* Navbar is handled by Global Layout (frontend/src/app/layout.tsx). 
          However, the design shows extra user profile/notification icons in the navbar.
          For this task, we'll focus on the page content primarily, as modifying global navbar for specific page might require state/context.
          We will assume the logged-in state simulation in the global navbar or just render the content below the standard navbar. 
          The provided HTML has a "fixed" navbar with specific user icons. 
          The Global Navbar in Layout is also fixed. 
          I will implement the content part starting from where the body content starts below the navbar.
      */}

            {/* Header / Welcome Section */}
            <div className="bg-white pt-8 pb-8 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-primary mb-2">👋 สวัสดีครับ, คุณมีเรื่องอะไรให้ช่วยไหม?</h1>
                            <p className="text-gray-500">พื้นที่แลกเปลี่ยนประสบการณ์ ปรึกษาปัญหาเรื่องรถ และรีวิวจากผู้ใช้จริง</p>
                        </div>
                        <div className="flex gap-3 w-full md:w-auto">
                            <button className="flex-1 md:flex-none bg-accent text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-600 transition shadow-lg shadow-orange-100 flex items-center justify-center gap-2 transform active:scale-95">
                                <PencilSimple weight="bold" size={20} /> ตั้งกระทู้ใหม่
                            </button>
                        </div>
                    </div>

                    {/* Categories Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mt-8">
                        <div className="bg-blue-50 hover:bg-blue-100 border border-blue-100 p-4 rounded-xl cursor-pointer transition flex flex-col items-center gap-2 text-center group">
                            <ChatsCircle weight="fill" className="text-2xl text-primary group-hover:scale-110 transition" />
                            <span className="text-sm font-bold text-gray-700">พูดคุยทั่วไป</span>
                        </div>
                        <div className="bg-orange-50 hover:bg-orange-100 border border-orange-100 p-4 rounded-xl cursor-pointer transition flex flex-col items-center gap-2 text-center group">
                            <Wrench weight="fill" className="text-2xl text-accent group-hover:scale-110 transition" />
                            <span className="text-sm font-bold text-gray-700">ปัญหาช่าง & ซ่อม</span>
                        </div>
                        <div className="bg-green-50 hover:bg-green-100 border border-green-100 p-4 rounded-xl cursor-pointer transition flex flex-col items-center gap-2 text-center group">
                            <Star weight="fill" className="text-2xl text-green-600 group-hover:scale-110 transition" />
                            <span className="text-sm font-bold text-gray-700">User Reviews</span>
                        </div>
                        <div className="bg-white hover:bg-gray-50 border border-gray-200 p-4 rounded-xl cursor-pointer transition flex flex-col items-center gap-2 text-center group">
                            <Lightning weight="fill" className="text-2xl text-yellow-500 group-hover:scale-110 transition" />
                            <span className="text-sm font-bold text-gray-700">โซนรถ EV</span>
                        </div>
                        <div className="bg-white hover:bg-gray-50 border border-gray-200 p-4 rounded-xl cursor-pointer transition flex flex-col items-center gap-2 text-center group">
                            <ShoppingCart weight="fill" className="text-2xl text-purple-500 group-hover:scale-110 transition" />
                            <span className="text-sm font-bold text-gray-700">ชี้เป้าของแต่ง</span>
                        </div>
                        <div className="bg-white hover:bg-gray-50 border border-gray-200 p-4 rounded-xl cursor-pointer transition flex flex-col items-center gap-2 text-center group">
                            <ShieldCheck weight="fill" className="text-2xl text-blue-400 group-hover:scale-110 transition" />
                            <span className="text-sm font-bold text-gray-700">เตือนภัย/Blacklist</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">

                {/* Main Feed */}
                <div className="lg:col-span-3">

                    {/* Tabs */}
                    <div className="flex items-center gap-6 border-b border-gray-200 mb-6 overflow-x-auto no-scrollbar">
                        <button className="pb-3 border-b-2 border-primary text-primary font-bold whitespace-nowrap">🔥 กำลังเป็นกระแส</button>
                        <button className="pb-3 text-gray-500 hover:text-primary transition whitespace-nowrap">มาใหม่ล่าสุด</button>
                        <button className="pb-3 text-gray-500 hover:text-primary transition whitespace-nowrap">รอคำตอบ</button>
                    </div>

                    <div className="space-y-4">

                        {/* Post 1 */}
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer group">
                            <div className="flex items-start gap-4">
                                <div className="flex flex-col items-center gap-1 min-w-[40px]">
                                    <button className="text-gray-400 hover:text-accent"><CaretUp weight="bold" className="text-xl" /></button>
                                    <span className="font-bold text-primary">128</span>
                                    <button className="text-gray-400 hover:text-accent"><CaretDown weight="bold" className="text-xl" /></button>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded-full">ปัญหาช่าง</span>
                                        <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><Check weight="bold" /> แก้ไขแล้ว</span>
                                    </div>
                                    <h3 className="font-bold text-lg text-gray-800 mb-2 group-hover:text-primary transition">รถ City Hatchback มีเสียงกึกๆ เวลาเลี้ยวสุด เกิดจากอะไรครับ?</h3>
                                    <p className="text-sm text-gray-500 line-clamp-2 mb-3">เพิ่งออกรถมาได้ 3 เดือนครับ เวลาเลี้ยวพวงมาลัยสุดตอนถอยจอด จะมีเสียงดัง กึก! บริเวณล้อหน้าซ้าย เข้าศูนย์แล้วช่างบอกปกติ แต่ผมไม่สบายใจ...</p>

                                    <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-100 pt-3">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1">
                                                <img src="https://i.pravatar.cc/150?img=12" className="w-5 h-5 rounded-full" alt="User" />
                                                <span className="text-gray-600">Boy_CityZone</span>
                                            </div>
                                            <span>• 2 ชม. ที่แล้ว</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="flex items-center gap-1"><ChatCircle weight="bold" /> 24 ความเห็น</span>
                                            <span className="flex items-center gap-1"><Eye weight="bold" /> 1.2k</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Post 2 */}
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer group">
                            <div className="flex items-start gap-4">
                                <div className="flex flex-col items-center gap-1 min-w-[40px]">
                                    <button className="text-gray-400 hover:text-accent"><CaretUp weight="bold" className="text-xl" /></button>
                                    <span className="font-bold text-gray-600">56</span>
                                    <button className="text-gray-400 hover:text-accent"><CaretDown weight="bold" className="text-xl" /></button>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">User Review</span>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg text-gray-800 mb-2 group-hover:text-primary transition">รีวิว Civic FE (e:HEV) หลังใช้ครบ 1 ปี ประหยัดจริงไหม?</h3>
                                            <p className="text-sm text-gray-500 line-clamp-2 mb-3">สวัสดีครับ วันนี้มารีวิวเจ้า Civic FE ไฮบริด หลังจากใช้งานมาครบ 1 ปี วิ่งไป 30,000 โล ข้อดีที่ชอบคือ...</p>
                                        </div>
                                        <div className="w-24 h-24 rounded-lg bg-gray-200 overflow-hidden hidden sm:block">
                                            <img src="https://images.unsplash.com/photo-1605218427368-35b820a40234?auto=format&fit=crop&q=80&w=200" className="w-full h-full object-cover" alt="Car" />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-100 pt-3">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1">
                                                <img src="https://i.pravatar.cc/150?img=3" className="w-5 h-5 rounded-full" alt="Guru" />
                                                <span className="text-gray-600 font-bold">Guru_Keng</span>
                                                <SealCheck weight="fill" className="text-blue-500 text-sm" />
                                            </div>
                                            <span>• 5 ชม. ที่แล้ว</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="flex items-center gap-1"><ChatCircle weight="bold" /> 45 ความเห็น</span>
                                            <span className="flex items-center gap-1"><Eye weight="bold" /> 3.5k</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Post 3 */}
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer group">
                            <div className="flex items-start gap-4">
                                <div className="flex flex-col items-center gap-1 min-w-[40px]">
                                    <button className="text-gray-400 hover:text-accent"><CaretUp weight="bold" className="text-xl" /></button>
                                    <span className="font-bold text-gray-600">12</span>
                                    <button className="text-gray-400 hover:text-accent"><CaretDown weight="bold" className="text-xl" /></button>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="bg-gray-100 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded-full">พูดคุยทั่วไป</span>
                                    </div>
                                    <h3 className="font-bold text-lg text-gray-800 mb-2 group-hover:text-primary transition">งบ 4 แสน เล่น Mazda 2 หรือ Yaris ดีครับ?</h3>
                                    <p className="text-sm text-gray-500 line-clamp-2 mb-3">เน้นขับในเมืองเป็นหลักครับ ไม่ค่อยมีความรู้เรื่องรถ อยากได้ที่ซ่อมง่ายๆ ไม่จุกจิก...</p>

                                    <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-100 pt-3">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1">
                                                <div className="w-5 h-5 rounded-full bg-pink-500 text-white flex items-center justify-center text-[8px]">N</div>
                                                <span className="text-gray-600">NewUser001</span>
                                            </div>
                                            <span>• 10 นาทีที่แล้ว</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="flex items-center gap-1"><ChatCircle weight="bold" /> 3 ความเห็น</span>
                                            <span className="flex items-center gap-1"><Eye weight="bold" /> 50</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    <button className="w-full py-3 mt-6 text-sm text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition">
                        โหลดเพิ่มเติม...
                    </button>
                </div>

                {/* Sidebar */}
                <aside className="space-y-6">

                    {/* Top Gurus */}
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-primary flex items-center gap-2">
                                <Trophy weight="fill" className="text-yellow-500 text-xl" /> Top Gurus
                            </h3>
                            <Link href="#" className="text-xs text-accent hover:underline">ดูทั้งหมด</Link>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="font-bold text-yellow-500 w-4 text-center">1</span>
                                <img src="https://i.pravatar.cc/150?img=3" className="w-10 h-10 rounded-full border-2 border-yellow-400 p-[1px]" alt="Guru 1" />
                                <div className="flex-1">
                                    <h4 className="text-sm font-bold text-gray-800 flex items-center gap-1">Guru_Keng <SealCheck weight="fill" className="text-blue-500 text-xs" /></h4>
                                    <span className="text-[10px] text-gray-500">1,540 คะแนน</span>
                                </div>
                                <Medal weight="fill" className="text-yellow-400 text-xl" />
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="font-bold text-gray-400 w-4 text-center">2</span>
                                <img src="https://i.pravatar.cc/150?img=59" className="w-10 h-10 rounded-full" alt="Guru 2" />
                                <div className="flex-1">
                                    <h4 className="text-sm font-bold text-gray-800">พี่ช่างแมว</h4>
                                    <span className="text-[10px] text-gray-500">1,200 คะแนน</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="font-bold text-orange-700 w-4 text-center">3</span>
                                <img src="https://i.pravatar.cc/150?img=11" className="w-10 h-10 rounded-full" alt="Guru 3" />
                                <div className="flex-1">
                                    <h4 className="text-sm font-bold text-gray-800">Jojo_Garage</h4>
                                    <span className="text-[10px] text-gray-500">980 คะแนน</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="bg-primary text-white p-5 rounded-2xl shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <UsersThree weight="fill" className="text-8xl" />
                        </div>
                        <h3 className="font-bold text-lg mb-4 relative z-10">สถิติชุมชน</h3>
                        <div className="grid grid-cols-2 gap-4 relative z-10">
                            <div>
                                <span className="text-2xl font-bold block text-accent">15k+</span>
                                <span className="text-xs text-blue-200">สมาชิก</span>
                            </div>
                            <div>
                                <span className="text-2xl font-bold block text-accent">500+</span>
                                <span className="text-xs text-blue-200">กระทู้ใหม่วันนี้</span>
                            </div>
                        </div>
                    </div>

                    {/* Popular Tags */}
                    <div>
                        <h3 className="font-bold text-gray-800 mb-3 text-sm">Tags ยอดนิยม</h3>
                        <div className="flex flex-wrap gap-2">
                            {['#HRV2023', '#อู่ซ่อมสี', '#BYD', '#โอนลอย', '#Civic2024'].map((tag) => (
                                <span key={tag} className="bg-white border border-gray-200 px-3 py-1 rounded-full text-xs text-gray-600 hover:border-primary hover:text-primary cursor-pointer transition shadow-sm">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>

                </aside>

            </div>

        </div>
    );
}
