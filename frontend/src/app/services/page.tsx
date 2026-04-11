"use client";

import React from 'react';
import Link from 'next/link';
import {
    Search,
    Calculator,
    ShieldCheck,
    Check,
    Coins,
    Umbrella,
    Car,
    Droplet,
    Landmark,
    Truck,
    FileStack,
    MessageCircleMore
} from 'lucide-react';

export default function ServicesPage() {
    return (
        <div className="bg-surface text-gray-800 min-h-screen">
            {/* 
          Navbar is provided by global layout but HTML includes a specific transparent/integrated header.
          We will assume global navbar is fixed and we just need to account for spacing if needed.
          However, the provided HTML uses a custom nav style. We will stick to global layout and just implement the content.
       */}

            <header className="bg-gradient-to-br from-primary to-[#294D7D] pt-28 pb-32 px-4 relative overflow-hidden">
                <div className="max-w-7xl mx-auto text-center relative z-10 text-white">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">มากกว่าแค่ซื้อขาย...<br />เราดูแลคุณ <span className="text-accent">ครบทุกขั้นตอน</span></h1>
                    <p className="text-blue-100 text-lg max-w-2xl mx-auto mb-10">
                        มั่นใจทุกการขับขี่ด้วยบริการตรวจสภาพรถมืออาชีพ สินเชื่อดอกเบี้ยต่ำ และประกันภัยที่คัดสรรมาเพื่อคุณ
                    </p>

                    <div className="flex flex-wrap justify-center gap-4">
                        <Link href="/services/inspection" className="bg-white text-primary px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-gray-100 transition flex items-center gap-2">
                            <Search /> จองตรวจสภาพรถ
                        </Link>
                        <Link href="/services/finance" className="bg-accent text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-orange-600 transition flex items-center gap-2">
                            <Calculator /> ขอสินเชื่อ
                        </Link>
                    </div>
                </div>

                <div className="absolute top-10 left-10 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
                <div className="absolute bottom-10 right-10 w-64 h-64 bg-accent/20 rounded-full blur-3xl"></div>
            </header>

            <div className="max-w-7xl mx-auto px-4 -mt-20 relative z-20 pb-20">

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">

                    <div className="bg-white rounded-2xl p-8 shadow-lg border-b-4 border-green-500 group hover:-translate-y-2 transition duration-300">
                        <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center text-green-500 text-3xl mb-6 group-hover:scale-110 transition">
                            <ShieldCheck fill="currentColor" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">ตรวจสภาพรถ (Car Inspection)</h3>
                        <p className="text-gray-500 mb-6 line-clamp-2">
                            เช็คละเอียด 200 จุด โดยช่างผู้เชี่ยวชาญ พร้อมใบรับรองเกรดรถ (A, B, C) มั่นใจก่อนจ่ายเงิน ไม่มีย้อมแมว
                        </p>
                        <ul className="space-y-2 mb-8 text-sm text-gray-600">
                            <li className="flex items-center gap-2"><Check className="text-green-500" /> ตรวจโครงสร้างตัวถัง</li>
                            <li className="flex items-center gap-2"><Check className="text-green-500" /> ตรวจเครื่องยนต์ & เกียร์</li>
                            <li className="flex items-center gap-2"><Check className="text-green-500" /> ตรวจระบบไฟ & แอร์</li>
                        </ul>
                        <button className="w-full border border-green-500 text-green-500 py-2 rounded-xl font-bold hover:bg-green-500 hover:text-white transition">
                            ดูแพ็กเกจราคา
                        </button>
                    </div>

                    <div className="bg-white rounded-2xl p-8 shadow-lg border-b-4 border-yellow-400 group hover:-translate-y-2 transition duration-300">
                        <div className="w-16 h-16 bg-yellow-50 rounded-2xl flex items-center justify-center text-yellow-500 text-3xl mb-6 group-hover:scale-110 transition">
                            <Coins fill="currentColor" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">สินเชื่อรถยนต์ (Car Finance)</h3>
                        <p className="text-gray-500 mb-6 line-clamp-2">
                            เปรียบเทียบข้อเสนอจากธนาคารชั้นนำ ดอกเบี้ยเริ่มต้น 2.79% รู้ผลอนุมัติไวภายใน 24 ชม.
                        </p>
                        <ul className="space-y-2 mb-8 text-sm text-gray-600">
                            <li className="flex items-center gap-2"><Check className="text-yellow-500" /> ไม่ต้องมีคนค้ำ*</li>
                            <li className="flex items-center gap-2"><Check className="text-yellow-500" /> ผ่อนนานสูงสุด 84 เดือน</li>
                            <li className="flex items-center gap-2"><Check className="text-yellow-500" /> จัดไฟแนนซ์ถึงบ้าน</li>
                        </ul>
                        <Link href="/services/finance" className="w-full block text-center border border-yellow-400 text-yellow-600 py-2 rounded-xl font-bold hover:bg-yellow-400 hover:text-white transition">
                            ประเมินวงเงินฟรี
                        </Link>
                    </div>

                    <div className="bg-white rounded-2xl p-8 shadow-lg border-b-4 border-blue-400 group hover:-translate-y-2 transition duration-300">
                        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 text-3xl mb-6 group-hover:scale-110 transition">
                            <Umbrella fill="currentColor" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">ประกันภัย & รับประกัน (Insurance)</h3>
                        <p className="text-gray-500 mb-6 line-clamp-2">
                            ประกันชั้น 1, 2+ ราคาพิเศษ และบริการขยายเวลารับประกันอะไหล่รถมือสอง (Extended Warranty)
                        </p>
                        <ul className="space-y-2 mb-8 text-sm text-gray-600">
                            <li className="flex items-center gap-2"><Check className="text-blue-500" /> คุ้มครองทันที</li>
                            <li className="flex items-center gap-2"><Check className="text-blue-500" /> ประกันเครื่องเกียร์ 1 ปี</li>
                            <li className="flex items-center gap-2"><Check className="text-blue-500" /> ช่วยเหลือฉุกเฉิน 24 ชม.</li>
                        </ul>
                        <Link href="/services/finance#insurance" className="w-full block text-center border border-blue-400 text-blue-500 py-2 rounded-xl font-bold hover:bg-blue-400 hover:text-white transition">
                            เช็คเบี้ยประกัน
                        </Link>
                    </div>

                </div>

                <section className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-12 mb-16 relative overflow-hidden">
                    <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-green-50 rounded-full blur-3xl opacity-50"></div>

                    <div className="flex-1 relative z-10">
                        <span className="bg-green-100 text-green-700 font-bold px-3 py-1 rounded-full text-xs mb-4 inline-block">บริการยอดนิยม</span>
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">Car2Hand Certified Check ✅</h2>
                        <p className="text-gray-600 mb-6 leading-relaxed">
                            อย่าเสี่ยงซื้อรถย้อมแมว! ให้ช่างมืออาชีพของเราช่วยดูแทนคุณ เราตรวจละเอียดทั้งภายนอก ภายใน ห้องเครื่อง และช่วงล่าง พร้อมรายงานผลผ่านแอปฯ ทันทีที่ตรวจเสร็จ
                        </p>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="flex items-start gap-3">
                                <Car fill="currentColor" className="text-2xl text-primary" />
                                <div>
                                    <h4 className="font-bold text-gray-800">ตรวจโครงสร้าง</h4>
                                    <p className="text-xs text-gray-500">ดูรอยตัดต่อ ชนหนัก พลิกคว่ำ</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Droplet fill="currentColor" className="text-2xl text-blue-500" />
                                <div>
                                    <h4 className="font-bold text-gray-800">ตรวจน้ำท่วม</h4>
                                    <p className="text-xs text-gray-500">คราบสนิม กลิ่นอับ ความชื้น</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex justify-between items-center">
                            <div>
                                <span className="text-xs text-gray-500 block">ราคาเริ่มต้นเพียง</span>
                                <span className="text-2xl font-bold text-accent">1,500 <span className="text-sm font-normal text-gray-500">บาท/คัน</span></span>
                            </div>
                            <Link href="/services/inspection" className="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-opacity-90 transition shadow-lg">
                                จองคิวตรวจเลย
                            </Link>
                        </div>
                    </div>

                    <div className="flex-1 w-full relative">
                        <img src="https://images.unsplash.com/photo-1487754180451-c456f719a1fc?q=80&w=800&auto=format&fit=crop" className="rounded-2xl shadow-2xl relative z-10 w-full object-cover h-80" alt="Car Inspection" />
                        <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl z-20 flex items-center gap-3 animate-bounce">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600"><Check fill="currentColor" className="text-xl" /></div>
                            <div>
                                <div className="font-bold text-gray-800 text-sm">ผ่านการตรวจสอบ</div>
                                <div className="text-xs text-gray-500">เกรด A (สภาพนางฟ้า)</div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="text-center mb-16">
                    <h3 className="text-gray-500 font-bold mb-8">พันธมิตรทางการเงินและประกันภัยชั้นนำ</h3>
                    <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition duration-500">
                        <div className="flex items-center gap-2 text-xl font-bold text-blue-800"><Landmark fill="currentColor" /> SCB</div>
                        <div className="flex items-center gap-2 text-xl font-bold text-green-700"><Landmark fill="currentColor" /> KBank</div>
                        <div className="flex items-center gap-2 text-xl font-bold text-orange-600"><Landmark fill="currentColor" /> Thanachart</div>
                        <div className="flex items-center gap-2 text-xl font-bold text-blue-600"><ShieldCheck fill="currentColor" /> Viriyah</div>
                        <div className="flex items-center gap-2 text-xl font-bold text-red-600"><ShieldCheck fill="currentColor" /> Muang Thai</div>
                    </div>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 flex items-center gap-6 hover:shadow-md transition">
                        <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center text-purple-600 text-2xl shrink-0">
                            <Truck fill="currentColor" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800 text-lg">บริการรถสไลด์/ส่งมอบ</h3>
                            <p className="text-sm text-gray-500 mb-2">ส่งรถถึงหน้าบ้านทั่วไทย ปลอดภัย 100%</p>
                            <Link href="/services/delivery" className="text-purple-600 text-sm font-bold hover:underline">เช็คค่าส่ง &gt;</Link>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 flex items-center gap-6 hover:shadow-md transition">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 text-2xl shrink-0">
                            <FileStack fill="currentColor" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800 text-lg">บริการโอนเล่มทะเบียน</h3>
                            <p className="text-sm text-gray-500 mb-2">ไม่ต้องไปขนส่งเอง เราดำเนินการให้จบ</p>
                            <Link href="/services/transfer" className="text-gray-600 text-sm font-bold hover:underline">ดูเอกสารที่ต้องใช้ &gt;</Link>
                        </div>
                    </div>
                </div>

            </div>

            <div className="bg-gray-900 text-white py-12">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-2xl md:text-3xl font-bold mb-4">ไม่แน่ใจว่าต้องเริ่มตรงไหน?</h2>
                    <p className="text-gray-400 mb-8">ปรึกษาผู้เชี่ยวชาญของเราได้ฟรี เราพร้อมช่วยคุณวางแผนการซื้อ-ขายรถให้คุ้มค่าที่สุด</p>
                    <button className="bg-white text-gray-900 px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition flex items-center gap-2 mx-auto">
                        <MessageCircleMore fill="currentColor" /> แชทกับเจ้าหน้าที่
                    </button>
                </div>
            </div>

        </div>
    );
}
