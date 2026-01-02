"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Car,
    MagicWand,
    CheckCircle,
    ShieldCheck,
    Camera,
    Handshake,
    Star,
    CaretDown
} from '@phosphor-icons/react';
import LoginModal from '@/components/LoginModal';
import RegisterModal from '@/components/RegisterModal';

export default function SellPage() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);

    useEffect(() => {
        const user = localStorage.getItem('user') || sessionStorage.getItem('user');
        setIsLoggedIn(!!user);
    }, []);

    const handleSellClick = (e: React.MouseEvent) => {
        if (!isLoggedIn) {
            e.preventDefault();
            setShowLoginModal(true);
        }
    };

    return (
        <div className="bg-surface text-gray-800 min-h-screen">
            {/* Navbar is handled by Global Layout */}

            {/* Hero Section */}
            <header
                className="relative min-h-[600px] flex items-center justify-center pt-20 px-4 overflow-hidden"
                style={{
                    backgroundImage: `linear-gradient(rgba(15, 52, 96, 0.9), rgba(15, 52, 96, 0.8)), url('https://images.unsplash.com/photo-1560252829-804f1aedf1be?q=80&w=2000&auto=format&fit=crop')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <div className="max-w-4xl w-full text-center relative z-10">
                    {/* <div className="inline-block bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-1 rounded-full text-accent font-bold text-sm mb-6 animate-bounce">
                        🚀 ขายออกไวใน 3 วัน* ด้วยระบบ AI
                    </div> */}
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                        เปลี่ยนรถให้เป็นเงิน<br />
                        <span className="text-accent">ง่ายกว่า</span> และ <span className="text-accent">ได้ราคาดีกว่า</span>
                    </h1>
                    <p className="text-blue-100 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
                        อย่าเพิ่งขายเต็นท์ถ้ายังไม่ได้เช็คราคาที่นี่! ลงขายฟรี ระบบช่วยดันประกาศ และช่วยแนะนำราคากลางที่ยุติธรรมที่สุด
                    </p>

                    <div className="bg-white p-4 rounded-2xl shadow-2xl max-w-3xl mx-auto flex flex-col md:flex-row gap-3">
                        <div className="flex-1 text-left relative">
                            <label className="text-xs text-gray-500 ml-1 mb-1 block">ยี่ห้อ / รุ่นรถของคุณ</label>
                            <input type="text" placeholder="เช่น Honda Civic 2020" className="w-full bg-white p-3 rounded-xl outline-none border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary transition font-medium" />
                            <Car className="ph ph-car absolute right-4 top-9 text-gray-400" size={24} />
                        </div>
                        <Link href="/sell/estimate" className="bg-accent text-white px-8 py-3 rounded-xl font-bold text-lg hover:bg-orange-600 transition shadow-lg shadow-orange-200 flex items-center justify-center gap-2 md:mt-5">
                            เช็คราคาขาย <MagicWand weight="bold" />
                        </Link>
                    </div>
                    <p className="text-gray-400 text-xs mt-4">*ประเมินราคาฟรี ไม่มีค่าใช้จ่ายแอบแฝง</p>
                </div>

                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-accent/20 rounded-full blur-3xl"></div>
                <div className="absolute top-20 -right-20 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"></div>
            </header>

            {/* Stats Section */}
            <div className="bg-white py-8 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center gap-8 md:gap-20 text-center">
                    <div>
                        <span className="block text-3xl font-bold text-primary">50,000+</span>
                        <span className="text-sm text-gray-500">คันที่ขายได้แล้ว</span>
                    </div>
                    <div>
                        <span className="block text-3xl font-bold text-primary">3 วัน</span>
                        <span className="text-sm text-gray-500">ระยะเวลาขายเฉลี่ย</span>
                    </div>
                    <div>
                        <span className="block text-3xl font-bold text-primary">100%</span>
                        <span className="text-sm text-gray-500">Verified Seller</span>
                    </div>
                </div>
            </div>

            {/* Comparison Table */}
            <section className="max-w-6xl mx-auto px-4 py-20">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">ทำไมต้องขายกับ Car<span className='text-accent'>2</span>Hand?</h2>
                    <p className="text-gray-500 max-w-2xl mx-auto">เราแก้ทุกปัญหาของการขายรถมือสอง ให้คุณได้รับประสบการณ์การค้ายที่พรีเมียมและคุ้มค่าที่สุด</p>
                </div>

                <div className="overflow-x-auto pb-8">
                    <div className="grid grid-cols-4 min-w-[800px] bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
                        {/* Table Header */}
                        <div className="col-span-1 p-8"></div>
                        <div className="col-span-1 bg-primary text-white p-8 text-center relative flex flex-col items-center justify-center gap-2 shadow-2xl z-10">
                            <h3 className="font-bold text-2xl">Car<span className='text-accent'>2</span>Hand</h3>
                            <div className="w-8 h-1 bg-accent/50 rounded-full mt-1"></div>
                        </div>
                        <div className="col-span-1 bg-gray-50/50 p-8 text-center flex flex-col items-center justify-center">
                            <h3 className="font-bold text-gray-500 text-lg">เต็นท์รถทั่วไป</h3>
                        </div>
                        <div className="col-span-1 bg-gray-50/50 p-8 text-center flex flex-col items-center justify-center">
                            <h3 className="font-bold text-gray-500 text-lg whitespace-nowrap">โพสต์เอง (FB/Web)</h3>
                        </div>

                        {/* Rows */}
                        {[
                            {
                                label: 'ราคาขาย',
                                c2h: 'สูง (ตามราคาตลาด)',
                                c2hIcon: <CheckCircle weight="fill" className="text-green-400 text-xl" />,
                                others1: 'ต่ำ (มักโดนกดราคา)',
                                others1Color: 'text-red-400',
                                others2: 'สูง (ตั้งเองได้)',
                                others2Color: 'text-gray-600'
                            },
                            {
                                label: 'ความรวดเร็ว',
                                c2h: 'ปานกลาง - เร็วมาก',
                                c2hIcon: <CheckCircle weight="fill" className="text-green-400 text-xl" />,
                                others1: 'เร็วมาก (รับเงินทันที)',
                                others1Color: 'text-green-600',
                                others2: 'ช้ามาก (ขึ้นอยู่กับดวง)',
                                others2Color: 'text-red-400'
                            },
                            {
                                label: 'ความปลอดภัย',
                                c2h: 'ปลอดภัยสูงสุด',
                                c2hIcon: <ShieldCheck weight="fill" className="text-green-400 text-xl" />,
                                others1: 'ปานกลาง',
                                others1Color: 'text-gray-500',
                                others2: 'ต่ำ (เสี่ยงมิจฉาชีพ)',
                                others2Color: 'text-red-500'
                            },
                            {
                                label: 'AI ช่วยประเมิน',
                                c2h: 'มีชุดข้อมูลรองรับ',
                                c2hIcon: <CheckCircle weight="fill" className="text-green-400 text-xl" />,
                                others1: 'ไม่มี',
                                others1Color: 'text-gray-400',
                                others2: 'ไม่มี',
                                others2Color: 'text-gray-400'
                            },
                        ].map((row, idx) => (
                            <React.Fragment key={idx}>
                                {/* Feature Label */}
                                <div className={`col-span-1 py-6 px-8 flex items-center font-bold text-gray-700 border-t border-gray-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/20'}`}>
                                    {row.label}
                                </div>

                                {/* Car2Hand Feature */}
                                <div className={`col-span-1 py-8 px-6 bg-blue-900/5 flex items-center justify-center gap-3 font-bold text-primary text-center border-x-4 border-primary/5 border-t border-primary/5 relative ${idx === 3 ? 'rounded-b-none' : ''}`}>
                                    <div className="flex flex-col items-center gap-2">
                                        {row.c2hIcon}
                                        <span className="text-sm md:text-base">{row.c2h}</span>
                                    </div>
                                </div>

                                {/* Others 1 */}
                                <div className={`col-span-1 py-8 px-6 flex items-center justify-center text-center text-sm font-medium border-t border-gray-50 ${row.others1Color} ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/20'}`}>
                                    {row.others1}
                                </div>

                                {/* Others 2 */}
                                <div className={`col-span-1 py-8 px-6 flex items-center justify-center text-center text-sm font-medium border-t border-gray-50 ${row.others2Color} ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/20'}`}>
                                    {row.others2}
                                </div>
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </section>

            {/* Steps Section */}
            <section className="bg-white py-20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-gray-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>

                <div className="max-w-7xl mx-auto px-4 relative z-10">
                    <h2 className="text-3xl font-bold text-primary text-center mb-16">ขายง่ายๆ ใน 3 ขั้นตอน</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        <div className="flex flex-col items-center text-center group">
                            <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition duration-300">
                                <Camera weight="duotone" className="text-4xl text-primary" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-3">1. ถ่ายรูปและลงข้อมูล</h3>
                            <p className="text-gray-500">กรอกข้อมูลรถของคุณ และอัปโหลดรูปภาพ</p>
                        </div>
                        <div className="flex flex-col items-center text-center group relative">
                            <div className="hidden md:block absolute top-10 -left-1/2 w-full h-[2px] bg-gray-200 -z-10"></div>

                            <div className="w-20 h-20 bg-orange-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition duration-300">
                                <MagicWand weight="duotone" className="text-4xl text-accent" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-3">2. ตั้งราคา</h3>
                            <p className="text-gray-500">ระบบช่วยเมินราคากลางให้ เพื่อให้คุณตั้งราคาได้เหมาะสม</p>
                        </div>
                        <div className="flex flex-col items-center text-center group relative">
                            <div className="hidden md:block absolute top-10 -left-1/2 w-full h-[2px] bg-gray-200 -z-10"></div>

                            <div className="w-20 h-20 bg-green-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition duration-300">
                                <Handshake weight="duotone" className="text-4xl text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-3">3. ปิดการขายรับเงิน</h3>
                            <p className="text-gray-500">นัดดูรถ และปิดการขายได้เลย เรามีสัญญาซื้อขายให้โหลดฟรี</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="max-w-7xl mx-auto px-4 py-20">
                <h2 className="text-3xl font-bold text-primary text-center mb-12">เรื่องจริงจากคนขาย</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition">
                        <div className="flex text-yellow-400 mb-4 gap-1">
                            {[1, 2, 3, 4, 5].map((i) => <Star key={i} weight="fill" />)}
                        </div>
                        <p className="text-gray-600 mb-6">"ตอนแรกจะไปขายเต็นท์ เขาตีราคาให้ 3.5 แสน เลยลองมาลงขายที่นี่ แนะนำให้ตั้ง 4.2 แสน สรุปขายได้จริงใน 5 วัน ได้เงินเพิ่มมาตั้งหลายหมื่น"</p>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
                                <img src="https://i.pravatar.cc/150?img=12" className="w-full h-full object-cover" alt="User" />
                            </div>
                            <div>
                                <div className="font-bold text-gray-800">คุณนนท์</div>
                                <div className="text-xs text-gray-400">ขาย Honda City 2018</div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition">
                        <div className="flex text-yellow-400 mb-4 gap-1">
                            {[1, 2, 3, 4, 5].map((i) => <Star key={i} weight="fill" />)}
                        </div>
                        <p className="text-gray-600 mb-6">"ชอบตรงที่ไม่ยุ่งยาก ลงข้อมูลแป๊บเดียวเสร็จ ที่สำคัญคือคนซื้อดูน่าเชื่อถือ เพราะมีการยืนยันตัวตน ไม่เจอพวกมิจฉาชีพเหมือนในเฟสบุ๊ค"</p>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
                                <img src="https://i.pravatar.cc/150?img=5" className="w-full h-full object-cover" alt="User" />
                            </div>
                            <div>
                                <div className="font-bold text-gray-800">คุณเมย์</div>
                                <div className="text-xs text-gray-400">ขาย Mazda 2 SkyActiv</div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition">
                        <div className="flex text-yellow-400 mb-4 gap-1">
                            {[1, 2, 3, 4, 5].map((i) => <Star key={i} weight="fill" />)}
                        </div>
                        <p className="text-gray-600 mb-6">"ฟีเจอร์ประเมินราคาดีมากครับ ช่วยให้เราตั้งราคาได้เหมาะสม เพราะมีราคากลางอ้างอิง วิน-วินทั้งสองฝ่าย"</p>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
                                <img src="https://i.pravatar.cc/150?img=68" className="w-full h-full object-cover" alt="User" />
                            </div>
                            <div>
                                <div className="font-bold text-gray-800">คุณเอก</div>
                                <div className="text-xs text-gray-400">ขาย Toyota Fortuner</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="bg-gray-50 py-20">
                <div className="max-w-3xl mx-auto px-4">
                    <h2 className="text-3xl font-bold text-primary text-center mb-10">คำถามที่พบบ่อย</h2>

                    <div className="space-y-4">
                        <details className="bg-white p-5 rounded-2xl shadow-sm cursor-pointer group">
                            <summary className="font-bold text-gray-800 flex justify-between items-center list-none">
                                ลงขายมีค่าใช้จ่ายไหม?
                                <CaretDown weight="bold" className="group-open:rotate-180 transition" />
                            </summary>
                            <p className="text-gray-600 mt-3 pt-3 border-t border-gray-100">
                                สำหรับรถคันแรก ลงขายฟรีไม่มีค่าใช้จ่ายครับ! หากต้องการลงขายมากกว่า 1 คัน หรือต้องการโปรโมทให้เห็นมากขึ้น เรามีแพ็กเกจให้เลือกเริ่มต้นเพียง 199 บาท
                            </p>
                        </details>
                        <details className="bg-white p-5 rounded-2xl shadow-sm cursor-pointer group">
                            <summary className="font-bold text-gray-800 flex justify-between items-center list-none">
                                ต้องเตรียมเอกสารอะไรบ้าง?
                                <CaretDown weight="bold" className="group-open:rotate-180 transition" />
                            </summary>
                            <p className="text-gray-600 mt-3 pt-3 border-t border-gray-100">
                                เบื้องต้นใช้เพียงรูปถ่ายรถที่ชัดเจน และสำเนาเล่มทะเบียนรถ (หน้าที่มีชื่อเจ้าของ) เพื่อยืนยันว่าเป็นเจ้าของรถจริงครับ
                            </p>
                        </details>
                        <details className="bg-white p-5 rounded-2xl shadow-sm cursor-pointer group">
                            <summary className="font-bold text-gray-800 flex justify-between items-center list-none">
                                ระบบ AI ประเมินราคาเชื่อถือได้แค่ไหน?
                                <CaretDown weight="bold" className="group-open:rotate-180 transition" />
                            </summary>
                            <p className="text-gray-600 mt-3 pt-3 border-t border-gray-100">
                                AI ของเราประเมินจากฐานข้อมูลราคากลางในตลาดกว่า 100,000 รายการ โดยคำนวณจาก ปี รุ่น เลขไมล์ และสภาพรถ จึงมีความแม่นยำสูงและยุติธรรมครับ
                            </p>
                        </details>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="max-w-7xl mx-auto px-4 py-20">
                <div className="bg-gradient-to-r from-primary to-blue-900 rounded-3xl p-8 md:p-16 text-center text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">พร้อมเปลี่ยนรถเป็นเงินก้อนหรือยัง?</h2>
                        <p className="text-blue-200 text-lg mb-8 max-w-2xl mx-auto">ลงขายวันนี้ รับสิทธิ์ดันประกาศฟรี 24 ชม. ให้คนเห็นเป็นพันคน</p>
                        <Link href="/sell/create" onClick={handleSellClick} className="bg-accent text-white px-10 py-4 rounded-xl font-bold text-xl hover:bg-orange-600 transition shadow-lg shadow-orange-900/20 transform hover:-translate-y-1 inline-block">
                            เริ่มลงขายเลย (ฟรี!)
                        </Link>
                    </div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-20 -translate-y-20"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl transform -translate-x-20 translate-y-20"></div>
                </div>
            </section>

            {/* Login Modal */}
            <LoginModal
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                onSwitchToRegister={() => {
                    setShowLoginModal(false);
                    setShowRegisterModal(true);
                }}
                redirectTo="/sell/create"
            />

            {/* Register Modal */}
            <RegisterModal
                isOpen={showRegisterModal}
                onClose={() => setShowRegisterModal(false)}
                onSwitchToLogin={() => {
                    setShowRegisterModal(false);
                    setShowLoginModal(true);
                }}
            />
        </div>
    );
}
