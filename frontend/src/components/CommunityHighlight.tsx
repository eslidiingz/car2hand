"use client";

import Link from 'next/link';
import {
    ArrowRight,
    Wrench,
    MessageCircle,
    Eye,
    Star,
    ImageIcon,
    BadgeCheck,
    Heart,
    MessagesSquare,
    Flame
} from 'lucide-react';

export default function CommunityHighlight() {
    return (
        <section className="max-w-7xl mx-auto px-4 mb-20">
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
                        Community ฮอตประจำสัปดาห์ <span className="text-2xl">🔥</span>
                    </h2>
                    <p className="text-gray-500 mt-1">พื้นที่พูดคุย ปรึกษาปัญหา และรีวิวจากผู้ใช้งานจริงกว่า 50,000 คน</p>
                </div>
                <Link href="/community" className="text-accent font-bold hover:text-orange-600 transition flex items-center gap-1 group">
                    ไปหน้าบอร์ดรวม <ArrowRight className="group-hover:translate-x-1 transition" />
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Topic 1: Mechanic Problem */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition duration-300 cursor-pointer flex flex-col h-full">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="bg-orange-50 text-orange-600 text-[10px] font-bold px-2 py-1 rounded-full border border-orange-100 flex items-center gap-1">
                            <Wrench /> ปัญหาช่าง
                        </span>
                        <span className="text-[10px] text-gray-400">2 ชม. ที่แล้ว</span>
                    </div>
                    <h3 className="font-bold text-lg text-gray-800 mb-2 leading-snug hover:text-primary transition">
                        City Hatchback มีเสียงกึกๆ เวลาเลี้ยวสุดตอนถอยเข้าซอง เกิดจากอะไรครับ?
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">
                        เพิ่งออกรถมาได้ 3 เดือนครับ เวลาเลี้ยวพวงมาลัยสุดตอนถอยจอด จะมีเสียงดัง กึก! บริเวณล้อหน้าซ้าย เข้าศูนย์แล้วช่างบอกปกติ...
                    </p>

                    <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-auto">
                        <div className="flex items-center gap-2">
                            <img src="https://i.pravatar.cc/150?img=12" className="w-8 h-8 rounded-full border border-white shadow-sm" alt="User" />
                            <div className="text-xs">
                                <div className="font-bold text-gray-700">Boy_CityZone</div>
                                <div className="text-gray-400">สมาชิกทั่วไป</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                            <span className="flex items-center gap-1 hover:text-primary"><MessageCircle /> 24</span>
                            <span className="flex items-center gap-1"><Eye /> 1.2k</span>
                        </div>
                    </div>
                </div>

                {/* Topic 2: User Review */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition duration-300 cursor-pointer flex flex-col h-full">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="bg-green-50 text-green-600 text-[10px] font-bold px-2 py-1 rounded-full border border-green-100 flex items-center gap-1">
                            <Star /> User Review
                        </span>
                        <span className="text-[10px] text-gray-400">เมื่อวานนี้</span>
                    </div>

                    <div className="h-32 bg-gray-200 rounded-xl mb-3 overflow-hidden relative group">
                        <img src="https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" alt="Car" />
                        <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] px-2 py-1 rounded backdrop-blur-sm flex items-center gap-1">
                            <ImageIcon /> +4 รูป
                        </div>
                    </div>

                    <h3 className="font-bold text-lg text-gray-800 mb-2 leading-snug hover:text-primary transition">
                        รีวิว Honda Civic FE (e:HEV) หลังใช้ครบ 1 ปี ประหยัดจริงไหม? มีปัญหาจุกจิกหรือเปล่า
                    </h3>

                    <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-auto">
                        <div className="flex items-center gap-2">
                            <img src="https://i.pravatar.cc/150?img=3" className="w-8 h-8 rounded-full border border-white shadow-sm ring-2 ring-blue-100" alt="Guru" />
                            <div className="text-xs">
                                <div className="font-bold text-gray-700 flex items-center gap-1">Guru_Keng <BadgeCheck className="text-blue-500" /></div>
                                <div className="text-accent font-bold">Top Contributor</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                            <span className="flex items-center gap-1 hover:text-primary"><MessageCircle /> 56</span>
                            <span className="flex items-center gap-1"><Heart /> 128</span>
                        </div>
                    </div>
                </div>

                {/* Topic 3: General Discussion Poll */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition duration-300 cursor-pointer flex flex-col h-full relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 z-0"></div>

                    <div className="relative z-10 flex flex-col h-full">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="bg-blue-50 text-primary text-[10px] font-bold px-2 py-1 rounded-full border border-blue-100 flex items-center gap-1">
                                <MessagesSquare /> พูดคุยทั่วไป
                            </span>
                            <span className="bg-red-50 text-red-500 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 animate-pulse">
                                <Flame /> Hot Topic
                            </span>
                        </div>
                        <h3 className="font-bold text-lg text-gray-800 mb-2 leading-snug hover:text-primary transition">
                            มีงบ 5 แสน ระหว่าง "City มือหนึ่งตัวล่าง" กับ "Civic FC มือสองตัวท็อป" เลือกอะไรดีครับ?
                        </h3>
                        <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">
                            ลังเลมากครับ ใจอยากได้ความกว้างและความแรงของ Civic แต่ก็กลัวค่าซ่อมบำรุง ส่วน City ได้ความสบายใจรถใหม่...
                        </p>

                        <div className="bg-gray-50 rounded-xl p-3 mb-4 border border-gray-100">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span>Civic FC มือสอง</span>
                                <span className="font-bold text-primary">65%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                                <div className="bg-primary h-1.5 rounded-full" style={{ width: '65%' }}></div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span>City มือหนึ่ง</span>
                                <span className="font-bold text-gray-400">35%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div className="bg-gray-400 h-1.5 rounded-full" style={{ width: '35%' }}></div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-auto">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center font-bold text-xs">N</div>
                                <div className="text-xs">
                                    <div className="font-bold text-gray-700">NewUser99</div>
                                    <div className="text-gray-400">สมาชิกใหม่</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-400">
                                <span className="flex items-center gap-1 hover:text-primary"><MessageCircle /> 89</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}
