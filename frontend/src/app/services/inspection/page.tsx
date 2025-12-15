"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeft,
    Certificate,
    ClipboardText,
    Clock,
    Check,
    MapPin,
    NavigationArrow,
    LockKey,
    Question
} from '@phosphor-icons/react';

export default function InspectionPage() {
    const [packageType, setPackageType] = useState<'standard' | 'premium'>('premium');

    const basePrice = packageType === 'standard' ? 1500 : 2500;
    const vat = basePrice * 0.07;
    const total = basePrice + vat;

    return (
        <div className="bg-surface text-gray-800 min-h-screen">

            {/* Custom Nav for Inspection Flow */}
            <nav className="bg-white shadow-sm fixed w-full z-50 top-0 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Link href="/services" className="text-gray-500 hover:text-primary"><ArrowLeft weight="bold" className="text-xl" /></Link>
                        <span className="font-bold text-xl text-primary">จองคิวตรวจสภาพ</span>
                    </div>
                    <div className="hidden md:flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1 text-primary font-bold">
                            <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs">1</span>
                            เลือกแพ็กเกจ
                        </div>
                        <div className="w-8 h-px bg-gray-300"></div>
                        <div className="flex items-center gap-1 text-gray-400">
                            <span className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs">2</span>
                            ข้อมูลรถ & นัดหมาย
                        </div>
                        <div className="w-8 h-px bg-gray-300"></div>
                        <div className="flex items-center gap-1 text-gray-400">
                            <span className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs">3</span>
                            ชำระเงิน
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section with Pattern */}
            <header className="pt-24 pb-12 text-center px-4 bg-primary relative text-white" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.05' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E")`
            }}>
                <h1 className="text-3xl md:text-4xl font-bold mb-4">อย่าเสี่ยงซื้อรถย้อมแมว 🐱❌</h1>
                <p className="text-blue-100 text-lg max-w-2xl mx-auto mb-8">
                    ให้ผู้เชี่ยวชาญจาก Car2Hand ช่วยดูรถแทนคุณ ตรวจละเอียด 200 จุด รู้ผลทันทีผ่านมือถือ
                </p>

                <div className="flex flex-wrap justify-center gap-4 md:gap-12 opacity-90">
                    <div className="flex items-center gap-2">
                        <Certificate weight="fill" className="text-accent text-2xl" />
                        <span className="text-sm font-bold">ช่างรับรองมาตรฐาน</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <ClipboardText weight="fill" className="text-accent text-2xl" />
                        <span className="text-sm font-bold">รายงานผล Digital</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock weight="fill" className="text-accent text-2xl" />
                        <span className="text-sm font-bold">รู้ผลใน 60 นาที</span>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

                <div className="lg:col-span-2 space-y-8">

                    <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <span className="bg-primary text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm">1</span>
                            เลือกแพ็กเกจตรวจสภาพ
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <label
                                className={`relative border-2 rounded-xl p-5 cursor-pointer transition group ${packageType === 'standard' ? 'border-primary bg-blue-50/10' : 'border-gray-200 hover:border-blue-300'}`}
                                onClick={() => setPackageType('standard')}
                            >
                                <input type="radio" name="package" className="peer sr-only" checked={packageType === 'standard'} readOnly />
                                <div className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 transition flex items-center justify-center ${packageType === 'standard' ? 'border-primary bg-primary' : 'border-gray-300'}`}>
                                    <Check weight="bold" className={`text-white text-xs ${packageType === 'standard' ? 'opacity-100' : 'opacity-0'}`} />
                                </div>

                                <h3 className="font-bold text-lg text-gray-800 mb-1">Standard Check</h3>
                                <div className="text-accent font-bold text-2xl mb-4">1,500 ฿</div>
                                <ul className="text-sm text-gray-500 space-y-2 mb-4">
                                    <li className="flex items-start gap-3"><Check weight="bold" className="text-green-500 mt-0.5" /> ตรวจโครงสร้างตัวถัง (ชนหนัก/ตัดต่อ)</li>
                                    <li className="flex items-start gap-3"><Check weight="bold" className="text-green-500 mt-0.5" /> ตรวจสภาพสีรอบคัน</li>
                                    <li className="flex items-start gap-3"><Check weight="bold" className="text-green-500 mt-0.5" /> ตรวจห้องเครื่อง & ของเหลว</li>
                                    <li className="flex items-start gap-3"><Check weight="bold" className="text-green-500 mt-0.5" /> ตรวจภายในห้องโดยสาร</li>
                                </ul>
                            </label>

                            <label
                                className={`relative border-2 rounded-xl p-5 cursor-pointer transition group ${packageType === 'premium' ? 'border-accent bg-orange-50/10' : 'border-gray-200 hover:border-orange-500'}`}
                                onClick={() => setPackageType('premium')}
                            >
                                <input type="radio" name="package" className="peer sr-only" checked={packageType === 'premium'} readOnly />
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white px-3 py-0.5 rounded-full text-xs font-bold shadow-sm">
                                    แนะนำ (ขายดีสุด)
                                </div>
                                <div className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 transition flex items-center justify-center ${packageType === 'premium' ? 'border-accent bg-accent' : 'border-gray-300'}`}>
                                    <Check weight="bold" className={`text-white text-xs ${packageType === 'premium' ? 'opacity-100' : 'opacity-0'}`} />
                                </div>

                                <h3 className="font-bold text-lg text-gray-800 mb-1">Premium Full Option</h3>
                                <div className="text-accent font-bold text-2xl mb-4">2,500 ฿</div>
                                <ul className="text-sm text-gray-500 space-y-2 mb-4">
                                    <li className="flex items-start gap-3"><Check weight="bold" className="text-green-500 mt-0.5" /> <strong>รวมทุกอย่างใน Standard</strong></li>
                                    <li className="flex items-start gap-3"><Check weight="bold" className="text-green-500 mt-0.5" /> ตรวจใต้ท้องรถ (ช่วงล่าง/สนิม)</li>
                                    <li className="flex items-start gap-3"><Check weight="bold" className="text-green-500 mt-0.5" /> สแกนระบบไฟด้วยคอมพิวเตอร์ (OBD2)</li>
                                    <li className="flex items-start gap-3"><Check weight="bold" className="text-green-500 mt-0.5" /> ทดลองขับจริง (Test Drive)</li>
                                </ul>
                            </label>
                        </div>
                    </section>

                    <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <span className="bg-gray-200 text-gray-600 w-8 h-8 rounded-lg flex items-center justify-center text-sm">2</span>
                            ข้อมูลรถและสถานที่นัดหมาย
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">ยี่ห้อรถ</label>
                                <select className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 outline-none focus:border-primary">
                                    <option>เลือกยี่ห้อ...</option>
                                    <option>Toyota</option>
                                    <option>Honda</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">รุ่นรถ</label>
                                <input type="text" placeholder="เช่น Civic FC 2020" className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 outline-none focus:border-primary" />
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-bold text-gray-700 mb-1">สถานที่ตรวจรถ (Location)</label>
                            <div className="relative">
                                <MapPin weight="bold" className="absolute left-3 top-3.5 text-gray-400" />
                                <input type="text" placeholder="ระบุสถานที่นัดพบ หรือ ลิงก์ Google Maps" className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 pl-10 outline-none focus:border-primary" />
                            </div>
                            <div className="mt-2 flex gap-2">
                                <button className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded border border-blue-100 hover:bg-blue-100 flex items-center gap-1"><NavigationArrow weight="bold" /> ใช้ตำแหน่งปัจจุบัน</button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">วันที่สะดวก</label>
                                <input type="date" className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 outline-none focus:border-primary" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">เวลา</label>
                                <select className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 outline-none focus:border-primary">
                                    <option>09:00 - 10:00</option>
                                    <option>10:00 - 11:00</option>
                                    <option>13:00 - 14:00</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <span className="bg-gray-200 text-gray-600 w-8 h-8 rounded-lg flex items-center justify-center text-sm">3</span>
                            ข้อมูลผู้ติดต่อ
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">ชื่อ-นามสกุล</label>
                                <input type="text" defaultValue="คุณนนท์ คนรักรถ" className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 outline-none focus:border-primary" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">เบอร์โทรศัพท์</label>
                                <input type="tel" defaultValue="081-234-5678" className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 outline-none focus:border-primary" />
                            </div>
                        </div>
                    </section>

                </div>

                <div className="lg:col-span-1">
                    <div className="sticky top-24 space-y-6">

                        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 relative overflow-hidden">
                            <h3 className="font-bold text-gray-800 mb-4 border-b border-gray-100 pb-3">สรุปรายการจอง</h3>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">แพ็กเกจ</span>
                                    <span className="font-bold text-gray-800">{packageType === 'standard' ? 'Standard Check' : 'Premium Full Option'}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">ค่าเดินทางช่าง</span>
                                    <span className="font-bold text-green-600">ฟรี! (โปรโมชั่น)</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">ภาษีมูลค่าเพิ่ม (7%)</span>
                                    <span className="font-bold text-gray-800">{vat.toLocaleString()} ฿</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-end border-t border-gray-100 pt-4 mb-6">
                                <span className="text-sm font-bold text-gray-500">ยอดชำระรวม</span>
                                <span className="text-3xl font-bold text-primary">{total.toLocaleString()} ฿</span>
                            </div>

                            <button className="w-full bg-accent text-white py-3 rounded-xl font-bold shadow-lg shadow-orange-100 hover:bg-orange-600 transition flex items-center justify-center gap-2 mb-3">
                                ยืนยันการจอง <ArrowLeft weight="bold" className="rotate-180" />
                            </button>

                            <div className="text-center">
                                <span className="text-[10px] text-gray-400 flex items-center justify-center gap-1">
                                    <LockKey weight="fill" /> ชำระเงินปลอดภัยผ่าน QR / บัตรเครดิต
                                </span>
                            </div>
                        </div>

                        <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 text-center">
                            <h4 className="font-bold text-primary mb-2 text-sm">ตัวอย่างรายงานที่คุณจะได้รับ 📄</h4>
                            <div className="relative bg-white rounded-xl shadow-md p-2 mb-3 transform rotate-2 hover:rotate-0 transition duration-300 cursor-pointer border border-gray-200">
                                <div className="flex justify-between items-center border-b border-gray-100 pb-2 mb-2">
                                    <div className="flex items-center gap-1">
                                        <div className="w-4 h-4 bg-primary rounded"></div>
                                        <span className="text-[8px] font-bold">Car2Hand Report</span>
                                    </div>
                                    <span className="text-[8px] bg-green-100 text-green-700 px-1 rounded font-bold">GRADE A</span>
                                </div>
                                <div className="space-y-1">
                                    <div className="h-2 bg-gray-100 rounded w-3/4"></div>
                                    <div className="h-2 bg-gray-100 rounded w-1/2"></div>
                                    <div className="h-10 bg-gray-200 rounded w-full mt-2"></div>
                                </div>
                            </div>
                            <Link href="#" className="text-xs text-accent font-bold hover:underline">ดูตัวอย่างไฟล์เต็ม PDF &gt;</Link>
                        </div>

                        <div className="bg-white rounded-2xl p-4 border border-gray-100">
                            <div className="flex gap-3">
                                <Question weight="fill" className="text-2xl text-blue-400" />
                                <div>
                                    <h4 className="font-bold text-sm text-gray-800">ต้องไปดูรถด้วยไหม?</h4>
                                    <p className="text-xs text-gray-500 mt-1">ไม่จำเป็นครับ ช่างจะวิดีโอคอลหาคุณขณะตรวจ และส่งรายงานให้ทันที</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}
