"use client";

import React from 'react';
import Link from 'next/link';
import {
    CaretRight,
    MagnifyingGlass,
    DotsThree,
    Eye,
    ThumbsUp,
    ChatCircle,
    ShareNetwork,
    BookmarkSimple,
    CheckCircle,
    SealCheck,
    TextB,
    TextItalic,
    Link as LinkIcon,
    Image as ImageIcon,
    PaperPlaneRight
} from '@phosphor-icons/react';

export default function TopicDetailPage() {
    const scrollToReply = () => {
        const replyBox = document.getElementById('reply-box');
        if (replyBox) {
            replyBox.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="bg-surface text-gray-800 min-h-screen pb-20 md:pb-0">
            {/* Navbar assumes global layout, but we need search bar here as per design? 
          Actually the design shows a navbar similar to global but with search. 
          We'll assume global navbar is there. If we need extra controls, we might need a custom header or modification.
          The design shows a community specific secondary nav/breadcrumb.
      */}

            <div className="pt-24 pb-6 max-w-7xl mx-auto px-4">
                <div className="flex items-center gap-2 text-sm text-gray-500 overflow-x-auto whitespace-nowrap">
                    <Link href="/" className="hover:text-primary">หน้าแรก</Link>
                    <CaretRight weight="bold" className="text-xs" />
                    <Link href="/community" className="hover:text-primary">ชุมชน</Link>
                    <CaretRight weight="bold" className="text-xs" />
                    <Link href="#" className="bg-orange-50 text-orange-700 px-2 py-0.5 rounded hover:bg-orange-100 transition font-bold">ปัญหาช่าง & ซ่อมบำรุง</Link>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-4 gap-8">

                <main className="lg:col-span-3 space-y-6">

                    <article className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <img src="https://i.pravatar.cc/150?img=12" className="w-12 h-12 rounded-full border border-gray-100" alt="Avatar" />
                                    <div className="absolute -bottom-1 -right-1 bg-gray-200 text-[10px] px-1.5 py-0.5 rounded font-bold border border-white">Newbie</div>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800">Boy_CityZone</h3>
                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                        <span>2 ชั่วโมงที่แล้ว</span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1"><Eye weight="fill" /> 1,240</span>
                                    </div>
                                </div>
                            </div>

                            <button className="text-gray-400 hover:text-gray-600"><DotsThree weight="bold" className="text-2xl" /></button>
                        </div>

                        <h1 className="text-2xl font-bold text-gray-900 mb-4 leading-snug">
                            <span className="text-accent text-xl mr-2">Q:</span>
                            รถ City Hatchback มีเสียงกึกๆ เวลาเลี้ยวสุดตอนถอยเข้าซอง เกิดจากอะไรครับ?
                        </h1>

                        <div className="markdown-body prose prose-gray max-w-none text-gray-700">
                            <p className="mb-4">สอบถามพี่ๆ กูรูหน่อยครับ เพิ่งออกรถมาได้ 3 เดือน (วิ่งไป 5,000 โล) เวลาเลี้ยวพวงมาลัยสุดตอนถอยจอด จะมีเสียงดัง <strong>"กึก!"</strong> บริเวณล้อหน้าซ้ายครับ</p>
                            <p className="mb-4">ลองเข้าศูนย์เช็คระยะ 1,000 โล ช่างบอกว่าเป็นเสียงการทำงานปกติของระบบเบรก ABS แต่มันดังน่ารำคาญมากครับ กลัวจะมีปัญหาระยะยาว</p>
                            <p className="mb-4">มีใครใช้รุ่นนี้แล้วเจอปัญหาเดียวกันบ้างไหมครับ? แล้วแก้ยังไงหาย?</p>
                            <img src="https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&q=80&w=1000" alt="Car Wheel" className="rounded-xl w-full max-h-[400px] object-cover my-4" />
                        </div>

                        <div className="flex flex-wrap gap-2 mt-6">
                            <Link href="#" className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm hover:bg-gray-200 transition">#HondaCity</Link>
                            <Link href="#" className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm hover:bg-gray-200 transition">#ช่วงล่าง</Link>
                            <Link href="#" className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm hover:bg-gray-200 transition">#เสียงดังห้องเครื่อง</Link>
                        </div>

                        <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-6">
                            <div className="flex items-center gap-4">
                                <button className="flex items-center gap-2 text-gray-500 hover:text-accent transition font-bold group">
                                    <ThumbsUp weight="bold" className="text-xl group-hover:scale-110 transition" />
                                    <span>12</span>
                                </button>
                                <button className="flex items-center gap-2 text-gray-500 hover:text-primary transition font-bold group">
                                    <ChatCircle weight="bold" className="text-xl group-hover:scale-110 transition" />
                                    <span>5 ความเห็น</span>
                                </button>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="text-gray-400 hover:text-blue-500 p-2 rounded-full hover:bg-blue-50 transition"><ShareNetwork weight="bold" className="text-xl" /></button>
                                <button className="text-gray-400 hover:text-yellow-500 p-2 rounded-full hover:bg-yellow-50 transition"><BookmarkSimple weight="bold" className="text-xl" /></button>
                            </div>
                        </div>
                    </article>

                    <div className="border-2 border-green-400 bg-green-50/50 rounded-2xl p-1 relative shadow-sm">
                        <div className="absolute -top-3 left-6 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                            <CheckCircle weight="fill" /> คำตอบที่ดีที่สุด (Best Answer)
                        </div>

                        <div className="bg-white rounded-xl p-6 md:p-8">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <img src="https://i.pravatar.cc/150?img=59" className="w-10 h-10 rounded-full border-2 border-green-100" alt="Guru" />
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-gray-800">พี่ช่างแมว</h3>
                                            <SealCheck weight="fill" className="text-blue-500" />
                                        </div>
                                        <div className="text-xs text-gray-500">Guru ช่างยนต์ • 1 ชั่วโมงที่แล้ว</div>
                                    </div>
                                </div>
                            </div>

                            <div className="text-gray-700 leading-relaxed mb-4">
                                <p>อาการนี้ใน City Hatchback เจอกันบ่อยครับ สาเหตุหลักไม่ได้มาจาก ABS แต่มาจาก <strong>"ยอยพวงมาลัย"</strong> (Steering Joint) หรือไม่ก็ <strong>"แร็คพวงมาลัย"</strong> หลวมนิดหน่อยครับ</p>
                                <p className="mt-2">ถ้าศูนย์บอกปกติ ลองขอให้เขาขันน็อตยึดแพล่างกับน็อตแร็คพวงมาลัยให้แน่นขึ้นอีกนิด (Retorque) หายกันหลายคันแล้วครับ หรือถ้าไม่หายจริงๆ อาจต้องทำเรื่องเคลมแร็คพวงมาลัยใหม่ครับ (อยู่ในประกัน 3 ปี เคลมฟรี)</p>
                            </div>

                            <div className="flex items-center gap-4 border-t border-gray-100 pt-3">
                                <button className="flex items-center gap-2 text-green-600 font-bold bg-green-50 px-3 py-1.5 rounded-lg hover:bg-green-100 transition">
                                    <ThumbsUp weight="fill" /> เห็นด้วย 45
                                </button>
                                <button className="text-gray-500 text-sm hover:underline">ตอบกลับ</button>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-bold text-gray-700 text-lg">ความคิดเห็นอื่นๆ (4)</h3>

                        <div className="bg-white p-6 rounded-2xl border border-gray-100">
                            <div className="flex items-start gap-4">
                                <img src="https://i.pravatar.cc/150?img=11" className="w-10 h-10 rounded-full bg-gray-100" alt="User 1" />
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <span className="font-bold text-gray-800 text-sm">Jojo_Garage</span>
                                            <span className="text-xs text-gray-400 ml-2">50 นาทีที่แล้ว</span>
                                        </div>
                                    </div>
                                    <p className="text-gray-600 text-sm mb-3">ของผมก็ดังครับ ดังตั้งแต่ป้ายแดงเลย ชินแล้วครับ 555 เปิดเพลงกลบเอา</p>

                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                        <button className="hover:text-primary flex items-center gap-1"><ThumbsUp weight="bold" /> 2</button>
                                        <button className="hover:text-primary">ตอบกลับ</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-gray-100">
                            <div className="flex items-start gap-4">
                                <img src="https://i.pravatar.cc/150?img=33" className="w-10 h-10 rounded-full bg-gray-100" alt="User 2" />
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <span className="font-bold text-gray-800 text-sm">User9981</span>
                                            <span className="text-xs text-gray-400 ml-2">30 นาทีที่แล้ว</span>
                                        </div>
                                    </div>
                                    <p className="text-gray-600 text-sm mb-3">ลองเช็คซุ้มล้อพลาสติกด้วยนะครับ บางทีมันเผยอออกมาสีกับล้อตอนเลี้ยวสุด</p>
                                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                                        <button className="hover:text-primary flex items-center gap-1"><ThumbsUp weight="bold" /> 5</button>
                                        <button className="hover:text-primary">ตอบกลับ</button>
                                    </div>

                                    <div className="bg-gray-50 p-3 rounded-xl flex items-start gap-3">
                                        <img src="https://i.pravatar.cc/150?img=12" className="w-6 h-6 rounded-full" alt="OP" />
                                        <div>
                                            <div className="font-bold text-gray-800 text-xs">Boy_CityZone <span className="text-primary font-normal">(จขกท.)</span></div>
                                            <p className="text-gray-600 text-xs mt-1">ขอบคุณครับ เดี๋ยวลองก้มดูครับ</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100" id="reply-box">
                        <h3 className="font-bold text-gray-700 mb-4">เขียนคำตอบของคุณ</h3>

                        <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition">
                            <div className="bg-gray-50 px-3 py-2 border-b border-gray-200 flex gap-3 text-gray-500">
                                <button className="hover:text-gray-800"><TextB weight="bold" /></button>
                                <button className="hover:text-gray-800"><TextItalic weight="bold" /></button>
                                <div className="w-px h-4 bg-gray-300 my-auto"></div>
                                <button className="hover:text-gray-800"><LinkIcon weight="bold" /></button>
                                <button className="hover:text-gray-800"><ImageIcon weight="bold" /></button>
                            </div>
                            <textarea className="w-full p-4 outline-none text-sm min-h-[150px]" placeholder="แชร์ประสบการณ์ หรือคำแนะนำของคุณ..."></textarea>
                        </div>

                        <div className="flex justify-end mt-4">
                            <button className="bg-primary text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-900/10 hover:bg-opacity-90 transition">
                                ส่งคำตอบ
                            </button>
                        </div>
                    </div>

                </main>

                <aside className="hidden lg:block space-y-6">

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
                        <img src="https://i.pravatar.cc/150?img=12" className="w-20 h-20 rounded-full border-4 border-gray-50 mx-auto mb-3" alt="User Profile" />
                        <h3 className="font-bold text-lg text-gray-800">Boy_CityZone</h3>
                        <p className="text-xs text-gray-500 mb-4">สมาชิกเมื่อ ม.ค. 2023</p>

                        <div className="grid grid-cols-3 gap-2 border-t border-b border-gray-100 py-3 mb-4">
                            <div>
                                <span className="block font-bold text-primary">5</span>
                                <span className="text-[10px] text-gray-400">กระทู้</span>
                            </div>
                            <div>
                                <span className="block font-bold text-primary">12</span>
                                <span className="text-[10px] text-gray-400">ตอบ</span>
                            </div>
                            <div>
                                <span className="block font-bold text-primary">0</span>
                                <span className="text-[10px] text-gray-400">ถูกใจ</span>
                            </div>
                        </div>

                        <button className="w-full border border-gray-200 text-gray-600 py-2 rounded-lg text-sm font-bold hover:bg-gray-50 transition">
                            ดูโปรไฟล์
                        </button>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-800 mb-4 text-sm">กระทู้ที่เกี่ยวข้อง</h3>
                        <div className="space-y-4">
                            <Link href="#" className="block group">
                                <span className="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded mb-1 inline-block">Honda City</span>
                                <h4 className="text-sm text-gray-600 group-hover:text-primary transition leading-snug">City 1.0 Turbo ต้องเปลี่ยนสายพานไทม์มิ่งตอนกี่โลครับ?</h4>
                            </Link>
                            <Link href="#" className="block group">
                                <span className="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded mb-1 inline-block">ช่วงล่าง</span>
                                <h4 className="text-sm text-gray-600 group-hover:text-primary transition leading-snug">โช๊คเดิม City ย้วยมาก เปลี่ยนยี่ห้อไหนดี งบ 2 หมื่น</h4>
                            </Link>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-gray-900 to-primary text-white p-6 rounded-2xl relative overflow-hidden">
                        <div className="relative z-10">
                            <p className="text-xs text-gray-300 mb-1">Car2Hand Market</p>
                            <h3 className="font-bold text-lg mb-2">เบื่อซ่อมแล้ว?</h3>
                            <p className="text-sm text-gray-300 mb-4">ลองดู Honda City มือสองสภาพนางฟ้า ผ่านการตรวจสภาพแล้ว</p>
                            <Link href="/buy" className="bg-accent text-white w-full py-2 rounded-lg font-bold text-sm hover:bg-orange-600 transition block text-center">
                                ดูรถ Honda City
                            </Link>
                        </div>
                        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                    </div>

                </aside>

            </div>

            <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-3 md:hidden z-40 flex items-center gap-3">
                <div className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-gray-400 text-sm cursor-text" onClick={scrollToReply}>
                    เขียนคำตอบ...
                </div>
                <button className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-lg">
                    <PaperPlaneRight weight="bold" />
                </button>
            </div>
        </div>
    );
}
