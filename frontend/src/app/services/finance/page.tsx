"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    ArrowLeft,
    CheckCircle,
    Calculator,
    Money,
    Check,
    X,
    Info
} from '@phosphor-icons/react';

export default function FinancePage() {
    const [carPrice, setCarPrice] = useState(500000);
    const [downPayment, setDownPayment] = useState(100000);
    const [interestRate, setInterestRate] = useState(3.5);
    const [years, setYears] = useState(5);
    const [monthlyPayment, setMonthlyPayment] = useState(0);

    useEffect(() => {
        // Logic: Max down payment shouldn't exceed price
        if (downPayment > carPrice) {
            setDownPayment(carPrice);
        }

        // Calculations
        const principal = carPrice - downPayment; // ยอดจัดไฟแนนซ์
        const interestTotal = principal * (interestRate / 100) * years; // ดอกเบี้ยรวมทั้งหมด (Flat Rate)
        const totalToPay = principal + interestTotal; // ยอดรวมที่ต้องจ่าย
        const monthly = totalToPay / (years * 12); // ค่างวดต่อเดือน

        setMonthlyPayment(Math.round(monthly));
    }, [carPrice, downPayment, interestRate, years]);

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCarPrice(parseFloat(e.target.value));
    };

    const handleDownChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDownPayment(parseFloat(e.target.value));
    };

    const handleInterestChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInterestRate(parseFloat(e.target.value));
    };

    const handleYearsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setYears(parseInt(e.target.value));
    };

    return (
        <div className="bg-surface text-gray-800 min-h-screen">

            {/* Custom Nav */}
            <nav className="bg-white shadow-sm fixed w-full z-50 top-0 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Link href="/services" className="text-gray-500 hover:text-primary"><ArrowLeft weight="bold" className="text-xl" /></Link>
                        <span className="font-bold text-xl text-primary">ไฟแนนซ์ & ประกันภัย</span>
                    </div>
                    <div className="hidden md:flex space-x-8 text-sm">
                        <Link href="#finance" className="text-primary font-bold hover:text-accent">คำนวณสินเชื่อ</Link>
                        <Link href="#insurance" className="text-gray-500 hover:text-accent">เปรียบเทียบประกัน</Link>
                    </div>
                    <Link href="#" className="text-sm font-medium text-gray-500">ติดต่อเจ้าหน้าที่</Link>
                </div>
            </nav>

            <header className="pt-24 pb-12 bg-white relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
                    <div>
                        <span className="bg-blue-50 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 inline-block">One-Stop Service</span>
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                            เป็นเจ้าของรถในฝัน<br />
                            ด้วย<span className="text-accent">ข้อเสนอที่ดีที่สุด</span>
                        </h1>
                        <p className="text-gray-500 text-lg mb-8">
                            เราจับมือกับธนาคารและบริษัทประกันชั้นนำ เพื่อให้คุณได้ดอกเบี้ยต่ำสุด และความคุ้มครองที่คุ้มค่าที่สุด จบครบในที่เดียว
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
                                <CheckCircle weight="fill" className="text-green-500 text-xl" /> ดอกเบี้ยเริ่ม 2.79%
                            </div>
                            <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
                                <CheckCircle weight="fill" className="text-green-500 text-xl" /> รู้ผลไว 24 ชม.
                            </div>
                            <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
                                <CheckCircle weight="fill" className="text-green-500 text-xl" /> ไม่ต้องค้ำ*
                            </div>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="bg-gradient-to-tr from-primary to-blue-400 rounded-3xl p-1 shadow-2xl rotate-3 hover:rotate-0 transition duration-500">
                            <img src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=800&auto=format&fit=crop" className="rounded-[20px] w-full object-cover h-64 md:h-80" alt="Car Finance" />
                        </div>
                        <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl flex items-center gap-3 animate-bounce">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-2xl">
                                <Money weight="fill" />
                            </div>
                            <div>
                                <div className="font-bold text-gray-800">อนุมัติไว</div>
                                <div className="text-xs text-gray-500">ภายใน 1 วันทำการ</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="absolute top-0 right-0 w-1/3 h-full bg-gray-50 -z-0 rounded-l-[50px]"></div>
            </header>

            <section id="finance" className="py-16 max-w-7xl mx-auto px-4">

                <div className="flex flex-col md:flex-row gap-12">
                    <div className="flex-1 bg-white p-6 md:p-8 rounded-3xl shadow-lg border border-gray-100">
                        <h2 className="text-2xl font-bold text-primary mb-6 flex items-center gap-2">
                            <Calculator weight="fill" className="text-accent" /> คำนวณค่างวด (Car Loan)
                        </h2>

                        <div className="space-y-8">
                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="text-sm font-bold text-gray-600">ราคารถยนต์</label>
                                    <span className="text-primary font-bold">{carPrice.toLocaleString()}</span>
                                </div>
                                <input
                                    type="range"
                                    min="100000"
                                    max="3000000"
                                    step="10000"
                                    value={carPrice}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-accent"
                                    onChange={handlePriceChange}
                                />
                                <div className="flex justify-between text-xs text-gray-400 mt-1">
                                    <span>1 แสน</span>
                                    <span>3 ล้าน</span>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="text-sm font-bold text-gray-600">เงินดาวน์ <span className="text-xs font-normal text-gray-400">(แนะนำ 20% ขึ้นไป)</span></label>
                                    <span className="text-primary font-bold">{downPayment.toLocaleString()} ({Math.round((downPayment / carPrice) * 100)}%)</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max={carPrice}
                                    step="5000"
                                    value={downPayment}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-accent"
                                    onChange={handleDownChange}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-bold text-gray-600 block mb-2">ดอกเบี้ย (%)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={interestRate}
                                            step="0.1"
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-primary font-bold text-center"
                                            onChange={handleInterestChange}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-gray-600 block mb-2">ผ่อนนาน (ปี)</label>
                                    <select
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-primary font-bold text-center"
                                        value={years}
                                        onChange={handleYearsChange}
                                    >
                                        <option value="4">4 ปี (48 งวด)</option>
                                        <option value="5">5 ปี (60 งวด)</option>
                                        <option value="6">6 ปี (72 งวด)</option>
                                        <option value="7">7 ปี (84 งวด)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 bg-primary rounded-2xl p-6 text-white text-center relative overflow-hidden">
                            <div className="relative z-10">
                                <p className="text-blue-200 text-sm mb-1">ค่างวดต่อเดือน (โดยประมาณ)</p>
                                <h3 className="text-4xl font-bold mb-4">{monthlyPayment.toLocaleString()} <span className="text-lg font-normal">บาท</span></h3>

                                <div className="flex gap-2 justify-center">
                                    <button className="bg-accent text-white px-6 py-2 rounded-lg font-bold hover:bg-orange-600 transition shadow-lg">
                                        ขอสินเชื่อ
                                    </button>
                                    <button className="bg-white/10 text-white px-6 py-2 rounded-lg font-bold hover:bg-white/20 transition">
                                        ปรึกษาเจ้าหน้าที่
                                    </button>
                                </div>
                            </div>
                            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-accent/20 rounded-full blur-2xl"></div>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col justify-center">
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">พันธมิตรสินเชื่อที่ไว้ใจได้</h2>
                        <p className="text-gray-500 mb-8 leading-relaxed">
                            Car2Hand ทำงานร่วมกับสถาบันการเงินชั้นนำ เพื่อให้ลูกค้าของเราได้รับเงื่อนไขพิเศษ ไม่ว่าอาชีพไหนก็ออกรถได้
                        </p>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center gap-3 shadow-sm">
                                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 text-xl font-bold">S</div>
                                <div>
                                    <div className="font-bold text-gray-800 text-sm">SCB</div>
                                    <div className="text-[10px] text-gray-500">อนุมัติไว 1 วัน</div>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center gap-3 shadow-sm">
                                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-xl font-bold">K</div>
                                <div>
                                    <div className="font-bold text-gray-800 text-sm">Kasikorn</div>
                                    <div className="text-[10px] text-gray-500">ดอกเบี้ยพิเศษ</div>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center gap-3 shadow-sm">
                                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 text-xl font-bold">T</div>
                                <div>
                                    <div className="font-bold text-gray-800 text-sm">Thanachart</div>
                                    <div className="text-[10px] text-gray-500">รับทุกอาชีพ</div>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center gap-3 shadow-sm">
                                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-700 text-xl font-bold">K</div>
                                <div>
                                    <div className="font-bold text-gray-800 text-sm">Krungsri</div>
                                    <div className="text-[10px] text-gray-500">ผ่อนนาน 84 งวด</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm text-blue-800 flex items-center gap-2">
                            <Info weight="fill" />
                            <span>**เงื่อนไขเป็นไปตามที่ธนาคารกำหนด และขึ้นอยู่กับเครดิตของผู้เช่าซื้อ</span>
                        </div>
                    </div>
                </div>
            </section>

            <div className="w-full h-px bg-gray-200 my-8"></div>

            <section id="insurance" className="py-16 max-w-7xl mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-primary mb-2">เลือกประกันภัยที่ใช่สำหรับคุณ</h2>
                    <p className="text-gray-500">เปรียบเทียบความคุ้มครองชัดเจน ไม่ต้องกลัวเลือกผิด</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition group">
                        <div className="text-center mb-6">
                            <h3 className="font-bold text-gray-800 text-lg">ประกันชั้น 3+</h3>
                            <div className="text-4xl font-bold text-gray-400 my-2">5,500 <span className="text-sm font-normal">/ปี</span></div>
                            <p className="text-xs text-gray-400">เหมาะกับรถเก่า ขับน้อย เน้นประหยัด</p>
                        </div>
                        <ul className="space-y-3 text-sm text-gray-600 mb-8">
                            <li className="flex items-center gap-2"><Check weight="bold" className="text-green-500" /> ซ่อมเขา + ซ่อมเรา</li>
                            <li className="flex items-center gap-2"><Check weight="bold" className="text-green-500" /> กรณีรถชนรถเท่านั้น</li>
                            <li className="flex items-center gap-2"><X weight="bold" className="text-red-400" /> ไม่คุ้มครองรถหาย/ไฟไหม้</li>
                        </ul>
                        <button className="w-full border border-gray-300 text-gray-600 py-2 rounded-xl font-bold hover:bg-gray-50 transition">เลือกแผนนี้</button>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border-2 border-accent relative shadow-xl transform md:-translate-y-4">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white px-3 py-1 rounded-full text-xs font-bold uppercase">
                            ขายดีที่สุด
                        </div>
                        <div className="text-center mb-6">
                            <h3 className="font-bold text-primary text-xl">ประกันชั้น 2+</h3>
                            <div className="text-5xl font-bold text-accent my-2">7,900 <span className="text-sm font-normal text-gray-500">/ปี</span></div>
                            <p className="text-xs text-gray-500">คุ้มค่าที่สุด สำหรับรถมือสอง</p>
                        </div>
                        <ul className="space-y-3 text-sm text-gray-600 mb-8">
                            <li className="flex items-center gap-2"><Check weight="bold" className="text-green-500" /> ซ่อมเขา + ซ่อมเรา</li>
                            <li className="flex items-center gap-2"><Check weight="bold" className="text-green-500" /> กรณีรถชนรถเท่านั้น</li>
                            <li className="flex items-center gap-2"><Check weight="bold" className="text-green-500" /> <span className="font-bold text-primary">คุ้มครองรถหาย/ไฟไหม้</span></li>
                            <li className="flex items-center gap-2"><Check weight="bold" className="text-green-500" /> บริการช่วยเหลือ 24 ชม.</li>
                        </ul>
                        <button className="w-full bg-accent text-white py-3 rounded-xl font-bold hover:bg-orange-600 transition shadow-lg">สนใจแผนนี้</button>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition group">
                        <div className="text-center mb-6">
                            <h3 className="font-bold text-gray-800 text-lg">ประกันชั้น 1</h3>
                            <div className="text-4xl font-bold text-primary my-2">15,000+ <span className="text-sm font-normal text-gray-500">/ปี</span></div>
                            <p className="text-xs text-gray-400">ดูแลครบ จบทุกกรณี</p>
                        </div>
                        <ul className="space-y-3 text-sm text-gray-600 mb-8">
                            <li className="flex items-center gap-2"><Check weight="bold" className="text-green-500" /> ซ่อมเขา + ซ่อมเรา</li>
                            <li className="flex items-center gap-2"><Check weight="bold" className="text-green-500" /> <span className="font-bold">ชนไม่มีคู่กรณีก็เคลมได้</span></li>
                            <li className="flex items-center gap-2"><Check weight="bold" className="text-green-500" /> คุ้มครองรถหาย/ไฟไหม้</li>
                            <li className="flex items-center gap-2"><Check weight="bold" className="text-green-500" /> คุ้มครองน้ำท่วม</li>
                        </ul>
                        <button className="w-full border border-gray-300 text-gray-600 py-2 rounded-xl font-bold hover:bg-gray-50 transition">เลือกแผนนี้</button>
                    </div>

                </div>
            </section>

            <section className="bg-gray-100 py-16">
                <div className="max-w-3xl mx-auto px-4">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                        <h2 className="text-2xl font-bold text-center text-primary mb-6">ให้เจ้าหน้าที่ติดต่อกลับ</h2>
                        <form className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input type="text" placeholder="ชื่อ-นามสกุล" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary" />
                                <input type="tel" placeholder="เบอร์โทรศัพท์" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary" />
                            </div>
                            <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary">
                                <option>สนใจเรื่องสินเชื่อ</option>
                                <option>สนใจเรื่องประกันภัย</option>
                                <option>สนใจทั้งคู่</option>
                            </select>
                            <button className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-blue-900 transition">ส่งข้อมูล</button>
                        </form>
                    </div>
                </div>
            </section>

        </div>
    );
}
