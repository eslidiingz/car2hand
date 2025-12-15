"use client";

import React from 'react';
import Link from 'next/link';
import {
    MagnifyingGlass,
    BookOpen,
    Wrench,
    BookmarkSimple,
    FacebookLogo,
    ShareNetwork,
    Clock,
    SealCheck,
    Eye,
    Lightbulb,
    CarProfile,
    ArrowRight,
    ThumbsUp,
    CaretRight,
    User,
    Chats, // Replaced LineLogo with Chats as fallback
    Link as LinkIcon
} from '@phosphor-icons/react';

export default function ArticlePage() {
    return (
        <div className="bg-surface text-gray-800 min-h-screen">
            {/* Global Navbar is assumed to be present from layout.tsx but the design requires customized reading progress bar.
           Since layout is fixed, we might not inject the progress bar there easily without context.
           For now, we will add the progress bar fixed here, which will overlay or sit below the navbar. 
           The design says "fixed top-16" which means it assumes a 64px (16 * 4) height navbar.
        */}

            <div className="pt-24 pb-12 max-w-7xl mx-auto px-4">

                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                    <Link href="/" className="hover:text-primary">หน้าแรก</Link>
                    <CaretRight weight="bold" className="text-xs" />
                    <Link href="/knowledge" className="hover:text-primary">คลังความรู้</Link>
                    <CaretRight weight="bold" className="text-xs" />
                    <Link href="/knowledge/maintenance" className="hover:text-primary">การดูแลรักษา (Maintenance)</Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">

                    {/* Social Share (Desktop Sticky) */}
                    <div className="hidden lg:block lg:col-span-1">
                        <div className="sticky top-24 flex flex-col gap-4 items-center">
                            <button className="w-10 h-10 rounded-full bg-white text-blue-600 shadow-sm flex items-center justify-center hover:scale-110 transition"><FacebookLogo weight="fill" className="text-xl" /></button>
                            <button className="w-10 h-10 rounded-full bg-white text-green-500 shadow-sm flex items-center justify-center hover:scale-110 transition"><Chats weight="fill" className="text-xl" /></button>
                            <button className="w-10 h-10 rounded-full bg-white text-gray-400 shadow-sm flex items-center justify-center hover:scale-110 transition"><LinkIcon weight="bold" className="text-xl" /></button>
                            <div className="w-8 h-[1px] bg-gray-300 my-2"></div>
                            <button className="w-10 h-10 rounded-full bg-white text-gray-400 shadow-sm flex items-center justify-center hover:text-red-500 transition" title="บันทึกไว้อ่าน"><BookmarkSimple weight="bold" className="text-xl" /></button>
                        </div>
                    </div>

                    {/* Main Article Content */}
                    <main className="lg:col-span-8 bg-white p-6 md:p-10 rounded-3xl shadow-sm border border-gray-100">

                        <header className="mb-8">
                            <div className="flex gap-2 mb-4">
                                <span className="bg-blue-50 text-primary text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide">Maintenance</span>
                                <span className="bg-gray-100 text-gray-500 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1"><Clock weight="bold" /> 5 นาทีอ่าน</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                                5 สัญญาณเตือน! แอร์รถเริ่มพัง รีบซ่อมก่อนเสียเงินหมื่น (ฉบับมือใหม่)
                            </h1>

                            <div className="flex items-center justify-between border-y border-gray-100 py-4">
                                <div className="flex items-center gap-3">
                                    <img src="https://i.pravatar.cc/150?img=59" className="w-10 h-10 rounded-full border border-gray-200" alt="Author" />
                                    <div>
                                        <div className="font-bold text-gray-800 text-sm flex items-center gap-1">พี่ช่างแมว <SealCheck weight="fill" className="text-blue-500" /></div>
                                        <div className="text-xs text-gray-500">Guru ช่างยนต์ • อัปเดตเมื่อ 2 วันที่แล้ว</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 text-gray-400 text-sm">
                                    <Eye weight="fill" /> 15.2k Views
                                </div>
                            </div>
                        </header>

                        <div className="rounded-2xl overflow-hidden mb-10 shadow-lg">
                            <img src="https://images.unsplash.com/photo-1621905252507-b35492cc74b4?q=80&w=1000&auto=format&fit=crop" className="w-full object-cover" alt="Article Cover" />
                            <p className="text-xs text-gray-400 text-right mt-2 italic">ภาพประกอบ: การตรวจเช็คระบบแอร์</p>
                        </div>

                        <article className="prose prose-lg text-gray-700 max-w-none">
                            <p className="mb-6 leading-relaxed text-lg">
                                เข้าหน้าร้อนทีไร ปัญหาโลกแตกของคนใช้รถคงหนีไม่พ้นเรื่อง <strong>&quot;แอร์ไม่เย็น&quot;</strong> ใช่ไหมครับ? บางทีขับๆ อยู่มีแต่ลมร้อนออกมา หรือบางทีก็ได้กลิ่นอับชวนเวียนหัว วันนี้พี่ช่างแมวจะมาบอก 5 สัญญาณเตือนภัย ที่บอกว่าคอมเพรสเซอร์แอร์ของคุณกำลังจะกลับบ้านเก่าครับ
                            </p>

                            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-8 rounded-r-lg">
                                <h4 className="font-bold text-yellow-800 flex items-center gap-2 mb-1">
                                    <Lightbulb weight="fill" /> Guru Tip:
                                </h4>
                                <p className="text-sm text-yellow-900 mb-0 leading-relaxed">
                                    ควรล้างตู้แอร์ทุกๆ 1 ปี หรือ 20,000 กิโลเมตร เพื่อยืดอายุการใช้งาน และป้องกันเชื้อโรคสะสมในห้องโดยสารนะครับ
                                </p>
                            </div>

                            <h2 className="text-2xl font-bold text-primary mt-8 mb-4">1. มีเสียงดังผิดปกติเวลาเปิดแอร์</h2>
                            <p className="mb-6 leading-relaxed text-lg">
                                ถ้าเปิดแอร์แล้วได้ยินเสียงดัง "ครืดๆ" หรือ "แกรกๆ" มาจากห้องเครื่อง ให้สันนิษฐานไว้ก่อนเลยครับว่าลูกปืนคอมเพรสเซอร์อาจจะแตก หรือหน้าคลัตช์คอมแอร์เริ่มมีปัญหา อาการนี้ควรรีบเช็คทันทีครับ
                            </p>

                            <h2 className="text-2xl font-bold text-primary mt-8 mb-4">2. แอร์เย็นบ้าง ไม่เย็นบ้าง</h2>
                            <p className="mb-6 leading-relaxed text-lg">
                                ขับรถอยู่ดีๆ แอร์ก็ตัดเป็นลมร้อน พอขับไปสักพักก็กลับมาเย็นใหม่ อาการนี้มักเกิดจาก "รีเลย์แอร์" เสื่อมสภาพ หรือน้ำยาแอร์เริ่มขาดครับ
                            </p>

                            <div className="my-10 bg-surface rounded-2xl p-5 border border-blue-100 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition">
                                    <CarProfile weight="fill" className="text-9xl text-primary" />
                                </div>
                                <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                                    <div className="flex-1">
                                        <span className="text-xs font-bold text-accent uppercase mb-1 block">Car2Hand Market</span>
                                        <h3 className="font-bold text-primary text-xl mb-2">มองหารถมือสอง แอร์เย็นฉ่ำ?</h3>
                                        <p className="text-sm text-gray-600 mb-4">
                                            เรามีรถตรวจสภาพแล้วกว่า 200 จุด มั่นใจได้ว่าระบบแอร์และเครื่องยนต์สมบูรณ์พร้อมใช้
                                        </p>
                                        <button className="bg-primary text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-opacity-90 transition flex items-center gap-2">
                                            ดูรถมือสองสภาพนางฟ้า <ArrowRight weight="bold" />
                                        </button>
                                    </div>
                                    <div className="w-32 h-24 bg-white rounded-lg shadow-md p-2 rotate-3 group-hover:rotate-6 transition">
                                        <img src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=300" className="w-full h-full object-cover rounded" alt="Ad" />
                                    </div>
                                </div>
                            </div>

                            <h2 className="text-2xl font-bold text-primary mt-8 mb-4">3. มีกลิ่นเหม็นอับ หรือกลิ่นไหม้</h2>
                            <p className="mb-6 leading-relaxed text-lg">
                                กลิ่นอับมักเกิดจากเชื้อราในตู้แอร์ แต่ถ้าได้กลิ่นไหม้! ให้รีบปิดแอร์ทันทีครับ เพราะสายพานแอร์อาจจะกำลังไหม้ หรือคอมแอร์น็อค
                            </p>
                        </article>

                        <div className="flex flex-wrap gap-2 mt-10 pt-6 border-t border-gray-100">
                            <span className="text-gray-500 text-sm font-bold mr-2">Tags:</span>
                            <Link href="#" className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1 rounded-full text-sm transition">#แอร์รถยนต์</Link>
                            <Link href="#" className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1 rounded-full text-sm transition">#ซ่อมรถ</Link>
                            <Link href="#" className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1 rounded-full text-sm transition">#ดูแลรถหน้าร้อน</Link>
                        </div>

                        <div className="bg-blue-50 rounded-2xl p-6 mt-10 flex flex-col md:flex-row gap-6 items-center md:items-start">
                            <img src="https://i.pravatar.cc/150?img=59" className="w-20 h-20 rounded-full border-4 border-white shadow-sm" alt="Author" />
                            <div className="text-center md:text-left">
                                <h3 className="font-bold text-lg text-gray-900">พี่ช่างแมว (Guru)</h3>
                                <p className="text-sm text-gray-600 mb-4">ช่างซ่อมบำรุงประสบการณ์ 15 ปี เชี่ยวชาญเรื่องระบบไฟและแอร์รถยนต์ ชอบแบ่งปันความรู้ให้คนใช้รถดูแลรถเป็น</p>
                                <button className="text-accent text-sm font-bold border border-accent px-4 py-2 rounded-full hover:bg-accent hover:text-white transition">
                                    ติดตาม +
                                </button>
                            </div>
                        </div>

                    </main>

                    {/* Sidebar */}
                    <aside className="lg:col-span-3 space-y-6">

                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
                            <h3 className="font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">สารบัญบทความ</h3>
                            <ul className="space-y-3 text-sm text-gray-500">
                                <li><a href="#" className="text-primary font-bold border-l-2 border-primary pl-2 block">1. เสียงดังผิดปกติ</a></li>
                                <li><a href="#" className="hover:text-primary pl-2.5 block transition">2. แอร์เย็นบ้าง ไม่เย็นบ้าง</a></li>
                                <li><a href="#" className="hover:text-primary pl-2.5 block transition">3. กลิ่นเหม็นอับ/ไหม้</a></li>
                                <li><a href="#" className="hover:text-primary pl-2.5 block transition">4. สรุปและการดูแล</a></li>
                            </ul>
                        </div>

                        <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-2xl p-6 text-white text-center relative overflow-hidden group cursor-pointer">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-white/20 rounded-full blur-xl group-hover:scale-150 transition duration-700"></div>
                            <Wrench weight="fill" className="text-4xl mb-3 inline-block" />
                            <h3 className="font-bold text-lg mb-2">รถมีปัญหา? หาอู่ใกล้บ้าน</h3>
                            <p className="text-sm text-green-100 mb-4">ค้นหาอู่ซ่อมรถมาตรฐาน ที่ผ่านการรับรองจาก Car2Hand</p>
                            <button className="bg-white text-green-700 w-full py-2 rounded-xl font-bold text-sm hover:bg-green-50 transition">ค้นหาอู่ซ่อม</button>
                        </div>

                        <div>
                            <h3 className="font-bold text-gray-800 mb-4">บทความน่าอ่าน</h3>
                            <div className="space-y-4">
                                <Link href="#" className="flex gap-3 group">
                                    <div className="w-20 h-16 bg-gray-200 rounded-lg overflow-hidden shrink-0">
                                        <img src="https://images.unsplash.com/photo-1565514020176-db7020819777?q=80&w=200&auto=format&fit=crop" className="w-full h-full object-cover group-hover:scale-110 transition" alt="Recommend 1" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-800 leading-tight group-hover:text-primary transition line-clamp-2">เปลี่ยนยางรถยนต์ ต้องดูอะไรบ้าง? (ปีผลิต, ดอกยาง)</h4>
                                        <span className="text-xs text-gray-400 mt-1 block">3 วันที่แล้ว</span>
                                    </div>
                                </Link>
                                <Link href="#" className="flex gap-3 group">
                                    <div className="w-20 h-16 bg-gray-200 rounded-lg overflow-hidden shrink-0">
                                        <img src="https://images.unsplash.com/photo-1489824904134-891ab64532f1?q=80&w=200&auto=format&fit=crop" className="w-full h-full object-cover group-hover:scale-110 transition" alt="Recommend 2" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-800 leading-tight group-hover:text-primary transition line-clamp-2">น้ำมันเครื่องสังเคราะห์ vs ธรรมดา ต่างกันยังไง</h4>
                                        <span className="text-xs text-gray-400 mt-1 block">1 สัปดาห์ที่แล้ว</span>
                                    </div>
                                </Link>
                            </div>
                        </div>

                    </aside>
                </div>

                {/* Comments Section */}
                <div className="max-w-4xl mt-12 pt-10 border-t border-gray-200">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6">ความคิดเห็น (12)</h3>

                    <div className="flex gap-4 mb-10">
                        <div className="w-10 h-10 bg-gray-200 rounded-full shrink-0 flex items-center justify-center text-gray-500">
                            <User weight="bold" />
                        </div>
                        <div className="flex-1">
                            <textarea className="w-full border border-gray-200 rounded-xl p-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition resize-none" rows={3} placeholder="ร่วมแสดงความคิดเห็น..."></textarea>
                            <div className="flex justify-end mt-2">
                                <button className="bg-primary text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-opacity-90">ส่งความเห็น</button>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <img src="https://i.pravatar.cc/150?img=12" className="w-10 h-10 rounded-full border border-gray-100" alt="Commenter" />
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-gray-800 text-sm">Boy_CityZone</span>
                                    <span className="text-xs text-gray-400">2 ชั่วโมงที่แล้ว</span>
                                </div>
                                <p className="text-sm text-gray-600">ขอบคุณมากครับพี่ช่างแมว รถผมมีเสียงดังแก๊กๆ พอดีเลย เดี๋ยวต้องรีบไปเช็คแล้ว</p>
                                <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                                    <button className="hover:text-primary flex items-center gap-1"><ThumbsUp weight="bold" /> 5</button>
                                    <button className="hover:text-primary">ตอบกลับ</button>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}
