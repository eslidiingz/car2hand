"use client";

import React from 'react';
import Link from 'next/link';
import {
    Scales,
    Trash,
    CheckCircle,
    X,
    Check,
    Plus,
    ArrowsLeftRight
} from '@phosphor-icons/react';

export default function ComparePage() {
    return (
        <div className="bg-surface text-gray-800 min-h-screen">
            {/* Navbar handled by Global Layout */}

            {/* Header */}
            <div className="pt-8 pb-4 bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
                            <Scales weight="fill" className="text-accent" /> เปรียบเทียบรถ
                        </h1>
                        <p className="text-sm text-gray-500">เลือกดูสเปกเทียบกันหมัดต่อหมัด เพื่อความคุ้มค่าที่สุด</p>
                    </div>

                    <div className="flex items-center gap-3 bg-gray-100 p-1 rounded-lg">
                        <label className="flex items-center gap-2 px-3 py-1.5 rounded-md cursor-pointer bg-white shadow-sm transition">
                            <input type="checkbox" className="accent-primary" defaultChecked />
                            <span className="text-sm font-bold text-gray-700">ไฮไลท์จุดต่าง</span>
                        </label>
                        <label className="flex items-center gap-2 px-3 py-1.5 rounded-md cursor-pointer hover:bg-white/50 transition">
                            <input type="checkbox" className="accent-primary" />
                            <span className="text-sm text-gray-500">ซ่อนจุดที่เหมือนกัน</span>
                        </label>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8 overflow-x-auto no-scrollbar">

                <div className="grid grid-cols-[140px_minmax(280px,1fr)_minmax(280px,1fr)_minmax(280px,1fr)] gap-4 min-w-[1000px]">

                    {/* Labels Column */}
                    <div className="flex flex-col gap-0 pt-[340px]">
                        {/* This column is empty in HTML structure but used for grid align, maybe? 
                     Ah, the labels are absolute positioned inside the first car card. 
                     Wait, looking at HTML: 
                     <span class="absolute -left-[156px] ..."> 
                     So the labels are visually pulled out from the first card content. 
                     The grid defines 140px for the first col, but content is in cols 2, 3, 4. 
                     Actually, the HTML structure puts content in cols 2,3,4. 
                     Col 1 is just spacer? 
                     Let's check the HTML grid: grid-cols-[140px...].
                     Div 1 is empty spacer.
                     Div 2 is Car 1.
                     Div 3 is Car 2.
                     Div 4 is 'Add Car'.
                     And labels in Car 1 are absolute positioned negatively to float into Col 1.
                     This is an interesting technique. I will follow it.
                 */}
                    </div>

                    {/* Car 1 (Key Spec) */}
                    <div className="flex flex-col gap-4">
                        <div className="bg-white p-4 rounded-2xl shadow-lg border-2 border-primary relative sticky top-20 z-10">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm">
                                ตัวเลือกที่ 1
                            </div>
                            <div className="relative mb-3">
                                <img src="https://images.unsplash.com/photo-1619682817481-e994891cd1f5?q=80&w=400&auto=format&fit=crop" className="w-full h-40 object-cover rounded-xl" alt="Honda Civic" />
                                <button className="absolute top-2 right-2 bg-white/80 p-1 rounded-full text-gray-400 hover:text-red-500"><Trash weight="bold" /></button>
                            </div>
                            <h3 className="font-bold text-gray-800 text-lg leading-tight mb-1">Honda Civic 1.5 Turbo RS</h3>
                            <div className="text-2xl font-bold text-accent mb-1">859,000.-</div>
                            <div className="text-xs text-blue-600 bg-blue-50 inline-block px-2 py-1 rounded mb-3">ผ่อน 13,xxx /ด.</div>
                            <button className="w-full bg-primary text-white py-2 rounded-lg font-bold text-sm hover:bg-opacity-90 transition">สนใจคันนี้</button>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-white p-4 rounded-xl border border-gray-100 relative group hover:border-primary/30 transition">
                                <span className="absolute -left-[156px] top-4 w-[140px] text-right text-sm font-bold text-gray-500 pr-4">ปีจดทะเบียน</span>
                                <span className="text-gray-800 font-medium">2020</span>
                            </div>
                            <div className="bg-green-50 p-4 rounded-xl border border-green-200 relative group hover:border-green-400 transition">
                                <span className="absolute -left-[156px] top-4 w-[140px] text-right text-sm font-bold text-gray-500 pr-4">เลขไมล์</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-green-700 font-bold">45,000 กม.</span>
                                    <CheckCircle weight="fill" className="text-green-500" />
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-100 relative group hover:border-primary/30 transition">
                                <span className="absolute -left-[156px] top-4 w-[140px] text-right text-sm font-bold text-gray-500 pr-4">เกรดสภาพรถ</span>
                                <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">Verified Grade A</span>
                            </div>

                            <div className="pt-4"><h4 className="font-bold text-gray-400 text-sm uppercase tracking-wider text-center">สมรรถนะ</h4></div>

                            <div className="bg-green-50 p-4 rounded-xl border border-green-200 relative">
                                <span className="absolute -left-[156px] top-4 w-[140px] text-right text-sm font-bold text-gray-500 pr-4">เครื่องยนต์</span>
                                <span className="text-gray-800 font-bold">1.5 Turbo (173 แรงม้า)</span>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-100 relative">
                                <span className="absolute -left-[156px] top-4 w-[140px] text-right text-sm font-bold text-gray-500 pr-4">อัตราสิ้นเปลือง</span>
                                <span className="text-gray-800">17 กม./ลิตร</span>
                            </div>

                            <div className="pt-4"><h4 className="font-bold text-gray-400 text-sm uppercase tracking-wider text-center">ออปชั่น</h4></div>

                            <div className="bg-white p-4 rounded-xl border border-gray-100 relative">
                                <span className="absolute -left-[156px] top-4 w-[140px] text-right text-sm font-bold text-gray-500 pr-4">Sunroof</span>
                                <span className="text-gray-400 flex items-center gap-1"><X weight="bold" className="text-red-400" /> ไม่มี</span>
                            </div>
                            <div className="bg-green-50 p-4 rounded-xl border border-green-200 relative">
                                <span className="absolute -left-[156px] top-4 w-[140px] text-right text-sm font-bold text-gray-500 pr-4">กล้องมองหลัง</span>
                                <span className="text-green-700 font-bold flex items-center gap-1"><Check weight="bold" className="text-green-600" /> ปรับมุมมอง 3 ระดับ</span>
                            </div>
                        </div>
                    </div>

                    {/* Car 2 */}
                    <div className="flex flex-col gap-4">
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 sticky top-20 z-10">
                            <div className="relative mb-3">
                                <img src="https://images.unsplash.com/photo-1550355291-bbee04a92027?q=80&w=400&auto=format&fit=crop" className="w-full h-40 object-cover rounded-xl grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition" alt="Mazda 3" />
                                <button className="absolute top-2 right-2 bg-white/80 p-1 rounded-full text-gray-400 hover:text-red-500"><Trash weight="bold" /></button>
                            </div>
                            <h3 className="font-bold text-gray-800 text-lg leading-tight mb-1">Mazda 3 2.0 SP</h3>
                            <div className="text-2xl font-bold text-gray-700 mb-1">799,000.-</div>
                            <div className="text-xs text-gray-500 bg-gray-100 inline-block px-2 py-1 rounded mb-3">ผ่อน 12,xxx /ด.</div>
                            <button className="w-full bg-white border border-primary text-primary py-2 rounded-lg font-bold text-sm hover:bg-blue-50 transition">สนใจคันนี้</button>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-white p-4 rounded-xl border border-gray-100"><span className="text-gray-800 font-medium">2019</span></div>
                            <div className="bg-white p-4 rounded-xl border border-gray-100"><span className="text-gray-800">65,000 กม.</span></div>
                            <div className="bg-white p-4 rounded-xl border border-gray-100"><span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-1 rounded">Verified Grade B+</span></div>

                            <div className="pt-4 opacity-0"><h4>Space</h4></div>
                            <div className="bg-white p-4 rounded-xl border border-gray-100"><span className="text-gray-800">2.0 SkyActiv (165 แรงม้า)</span></div>
                            <div className="bg-white p-4 rounded-xl border border-gray-100"><span className="text-gray-800">14 กม./ลิตร</span></div>

                            <div className="pt-4 opacity-0"><h4>Space</h4></div>
                            <div className="bg-green-50 p-4 rounded-xl border border-green-200"><span className="text-green-700 font-bold flex items-center gap-1"><Check weight="bold" className="text-green-600" /> มี</span></div>
                            <div className="bg-white p-4 rounded-xl border border-gray-100"><span className="text-gray-800 flex items-center gap-1"><Check weight="bold" className="text-green-600" /> มี</span></div>
                        </div>
                    </div>

                    {/* Add Car */}
                    <div className="flex flex-col gap-4">
                        <div className="bg-gray-50 p-4 rounded-2xl border-2 border-dashed border-gray-300 sticky top-20 z-10 h-[340px] flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary hover:bg-blue-50 transition group">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition">
                                <Plus weight="bold" className="text-2xl text-primary" />
                            </div>
                            <h3 className="font-bold text-gray-600 group-hover:text-primary">เพิ่มรถอีกคัน</h3>
                            <p className="text-xs text-gray-400 mt-2">เพื่อเปรียบเทียบให้ชัดเจนขึ้น</p>
                        </div>

                        <div className="space-y-4 opacity-30 pointer-events-none">
                            <div className="bg-gray-100 p-4 rounded-xl h-[58px]"></div>
                            <div className="bg-gray-100 p-4 rounded-xl h-[58px]"></div>
                            <div className="bg-gray-100 p-4 rounded-xl h-[58px]"></div>
                            <div className="pt-4 h-[20px]"></div>
                            <div className="bg-gray-100 p-4 rounded-xl h-[58px]"></div>
                            <div className="bg-gray-100 p-4 rounded-xl h-[58px]"></div>
                        </div>
                    </div>

                </div>
            </div>

            <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900/80 text-white px-4 py-2 rounded-full text-xs backdrop-blur-sm pointer-events-none z-50 flex items-center gap-2">
                <ArrowsLeftRight weight="bold" /> ปัดซ้ายขวาเพื่อดูข้อมูล
            </div>
        </div>
    );
}
