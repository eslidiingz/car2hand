"use client";

import React from 'react';
import Link from 'next/link';
import {
    MagnifyingGlass,
    BookOpen,
    Wrench,
    Money,
    ChargingStation,
    Star,
    ArrowRight,
    Books,
    DotsThree,
    Calculator,
    X
} from '@phosphor-icons/react';
import { useState, useEffect } from 'react';

interface Brand {
    id: string;
    name: string;
    nameTh: string;
    logo: string | null;
    vehicleType: 'CAR' | 'MOTORCYCLE';
}

export default function ArticlesPage() {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [allBrands, setAllBrands] = useState<Brand[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAllBrandsModal, setShowAllBrandsModal] = useState(false);

    useEffect(() => {
        const fetchBrands = async () => {
            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
                const res = await fetch(`${API_URL}/master-data/brands`);
                const data = await res.json();
                if (data.success) {
                    setAllBrands(data.brands);
                    // Filter popular or just take first 6
                    const popular = data.brands.filter((b: any) => b.isPopular).slice(0, 6);
                    setBrands(popular.length > 0 ? popular : data.brands.slice(0, 6));
                }
            } catch (error) {
                console.error('Fetch brands error:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBrands();
    }, []);

    const BrandsModal = () => {
        const carBrands = allBrands.filter(b => b.vehicleType === 'CAR');
        const bikeBrands = allBrands.filter(b => b.vehicleType === 'MOTORCYCLE');

        const BrandGrid = ({ items }: { items: Brand[] }) => (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {items.map((brand) => (
                    <div key={brand.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:text-primary hover:shadow-md transition gap-2 group">
                        {brand.logo ? (
                            <img src={brand.logo} alt={brand.name} className="w-12 h-12 object-contain group-hover:scale-110 transition" />
                        ) : (
                            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center font-bold text-gray-400 group-hover:bg-primary/5 group-hover:text-primary transition">
                                {brand.name[0]}
                            </div>
                        )}
                        <span className="text-xs font-bold text-gray-600 group-hover:text-primary text-center">{brand.name}</span>
                    </div>
                ))}
            </div>
        );

        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAllBrandsModal(false)}></div>
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden relative z-10 flex flex-col">
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="text-xl font-bold text-primary flex items-center gap-2">
                            <Books weight="fill" className="text-blue-500" /> ยี่ห้อรถทั้งหมด
                        </h3>
                        <button onClick={() => setShowAllBrandsModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition">
                            <X size={24} />
                        </button>
                    </div>
                    <div className="p-8 overflow-y-auto space-y-10">
                        {carBrands.length > 0 && (
                            <section>
                                <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-3">
                                    <div className="h-px bg-slate-100 flex-1"></div>
                                    รถยนต์ (Cars)
                                    <div className="h-px bg-slate-100 flex-1"></div>
                                </h4>
                                <BrandGrid items={carBrands} />
                            </section>
                        )}

                        {bikeBrands.length > 0 && (
                            <section>
                                <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-3">
                                    <div className="h-px bg-slate-100 flex-1"></div>
                                    รถมอเตอร์ไซค์ (Motorcycles)
                                    <div className="h-px bg-slate-100 flex-1"></div>
                                </h4>
                                <BrandGrid items={bikeBrands} />
                            </section>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-surface text-gray-800 min-h-screen">
            {/* 
        The global layout (frontend/src/app/layout.tsx) already provides the Navbar. 
        However, based on HTML provided, there is a specific hero section with pattern below the navbar.
        We will rely on the global navbar but implement the hero section.
        Since global navbar is fixed, we need to add padding-top to the content, which Layout does (pt-16).
        But the design requested has a specific "hero-pattern" header that starts after navbar. 
      */}

            {/* Hero Section */}
            <header className="relative bg-primary px-4 pt-16 pb-20 text-center overflow-hidden">
                {/* Hero Pattern Background Overlay */}
                <div className="absolute inset-0 opacity-5" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }}></div>

                <div className="max-w-3xl mx-auto relative z-10 pt-10">
                    <span className="bg-accent/20 text-accent border border-accent/20 px-3 py-1 rounded-full text-xs font-bold mb-4 inline-block backdrop-blur-sm">Car2Hand Academy</span>
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-6">
                        คู่มือสามัญประจำ <span className="text-accent">รถ</span>
                    </h1>
                    <p className="text-blue-100 mb-8 max-w-xl mx-auto">ค้นหาข้อมูลรถ วิธีดูแลรักษา และเทคนิคการดูรถมือสองจากผู้เชี่ยวชาญ</p>

                    <div className="bg-white p-2 rounded-2xl shadow-xl flex items-center max-w-2xl mx-auto transform hover:scale-[1.01] transition duration-300">
                        <MagnifyingGlass size={24} className="text-gray-400 ml-3" />
                        <input
                            type="text"
                            placeholder="ค้นหาปัญหา เช่น แอร์ไม่เย็น, เสียงดัง, เอกสารโอนรถ..."
                            className="w-full p-3 outline-none text-gray-700 bg-transparent placeholder-gray-400"
                        />
                        <button className="bg-primary text-white px-6 py-2 rounded-xl font-bold hover:bg-opacity-90 transition shadow-md">
                            ค้นหา
                        </button>
                    </div>

                    <div className="flex flex-wrap justify-center gap-4 mt-10">
                        <Link href="#" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg backdrop-blur-sm transition border border-white/10">
                            <BookOpen weight="fill" /> มือใหม่หัดซื้อ
                        </Link>
                        <Link href="#" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg backdrop-blur-sm transition border border-white/10">
                            <Wrench weight="fill" /> การซ่อมบำรุง
                        </Link>
                        <Link href="#" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg backdrop-blur-sm transition border border-white/10">
                            <Money weight="fill" /> ไฟแนนซ์ & ประกัน
                        </Link>
                        <Link href="#" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg backdrop-blur-sm transition border border-white/10">
                            <ChargingStation weight="fill" /> รถ EV
                        </Link>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main Content */}
                    <div className="lg:col-span-2">

                        {/* Featured Article */}
                        <div className="mb-12">
                            <h2 className="text-2xl font-bold text-primary mb-6 flex items-center gap-2">
                                <Star weight="fill" className="text-yellow-500" /> บทความแนะนำ
                            </h2>
                            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 group cursor-pointer hover:shadow-lg transition duration-300">
                                <div className="h-64 md:h-80 overflow-hidden relative">
                                    <img src="https://images.unsplash.com/photo-1600712242805-5f78671b24da?q=80&w=1000&auto=format&fit=crop" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" alt="Featured" />
                                    <span className="absolute top-4 left-4 bg-accent text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">Must Read</span>
                                </div>
                                <div className="p-6">
                                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-2 font-medium">
                                        <span className="uppercase tracking-wider">Buying Guide</span> • <span>5 นาทีอ่าน</span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-primary transition">5 จุดตายที่ต้องเช็ค! ก่อนตัดสินใจซื้อรถมือสอง (ฉบับมือใหม่ดูเองได้)</h3>
                                    <p className="text-gray-500 mb-4 line-clamp-2 leading-relaxed">สอนวิธีดูรถย้อมแมว ดูรอยชนหนัก ดูสีเพี้ยน และฟังเสียงเครื่องยนต์แบบง่ายๆ ที่ใครๆ ก็ทำได้โดยไม่ต้องจ้างช่าง...</p>
                                    <span className="text-primary font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">อ่านต่อ <ArrowRight weight="bold" /></span>
                                </div>
                            </div>
                        </div>

                        {/* Car Encyclopedia */}
                        <div className="mb-12">
                            <div className="flex justify-between items-end mb-6">
                                <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
                                    <Books weight="fill" className="text-blue-500" /> สารานุกรมรุ่นรถ
                                </h2>
                                <button
                                    onClick={() => setShowAllBrandsModal(true)}
                                    className="text-sm text-gray-500 hover:text-accent font-medium"
                                >
                                    ดูยี่ห้อทั้งหมด &gt;
                                </button>
                            </div>

                            <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-6">
                                {brands.map((brand) => (
                                    <div key={brand.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:text-primary hover:shadow-md transition gap-2 group">
                                        {brand.logo ? (
                                            <img src={brand.logo} alt={brand.name} className="w-10 h-10 object-contain group-hover:scale-110 transition" />
                                        ) : (
                                            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-gray-400 group-hover:bg-primary/5 group-hover:text-primary transition">
                                                {brand.name[0]}
                                            </div>
                                        )}
                                        <span className="text-xs font-bold text-gray-600 group-hover:text-primary truncate w-full text-center">{brand.name}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4 hover:shadow-md hover:border-primary/30 transition cursor-pointer group">
                                    <div className="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden relative">
                                        <img src="https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=200" className="w-full h-full object-cover transform group-hover:scale-110 transition duration-500" alt="Civic" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-gray-800 group-hover:text-primary truncate">เจาะลึก Honda Civic FC</h4>
                                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">รุ่นยอดฮิตวัยรุ่นสร้างตัว ข้อดีคือแต่งสวย อะไหล่หาง่าย แต่ระวังเรื่องสนิม...</p>
                                        <div className="mt-2 flex items-center gap-2">
                                            <span className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded border border-red-100 font-medium">โรคประจำตัว</span>
                                            <span className="text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded border border-green-100 font-medium">อัตราประหยัด</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4 hover:shadow-md hover:border-primary/30 transition cursor-pointer group">
                                    <div className="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden relative">
                                        <img src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=200" className="w-full h-full object-cover transform group-hover:scale-110 transition duration-500" alt="Mazda 2" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-gray-800 group-hover:text-primary truncate">เจาะลึก Mazda 2 SkyActiv</h4>
                                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">ประหยัดน้ำมันยืนหนึ่ง ช่วงล่างดี แต่ค่าอะไหล่ศูนย์อาจสูงกว่าตลาด...</p>
                                        <div className="mt-2 flex items-center gap-2">
                                            <span className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded border border-red-100 font-medium">ปั๊มติ๊ก</span>
                                            <span className="text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded border border-green-100 font-medium">ช่วงล่าง</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <h2 className="text-xl font-bold text-primary mb-4">บทความล่าสุด</h2>
                        <div className="space-y-4">
                            <div className="bg-white p-4 rounded-xl border border-gray-100 flex gap-4 hover:bg-gray-50 hover:border-primary/20 transition cursor-pointer group">
                                <div className="w-32 h-24 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                                    <img src="https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&q=80&w=300" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" alt="Tires" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] font-bold text-accent uppercase tracking-wide bg-orange-50 px-2 py-0.5 rounded">Maintenance</span>
                                    </div>
                                    <h4 className="font-bold text-gray-800 mb-1 leading-snug group-hover:text-primary">ถึงเวลาเปลี่ยนยางหรือยัง? ดูยังไงว่าดอกยางหมดสภาพ</h4>
                                    <p className="text-xs text-gray-500 line-clamp-2">ยางรถยนต์คือส่วนเดียวที่สัมผัสพื้นถนน อย่าละเลยความปลอดภัย มาดูวิธีเช็คสภาพยางง่ายๆ...</p>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-100 flex gap-4 hover:bg-gray-50 hover:border-primary/20 transition cursor-pointer group">
                                <div className="w-32 h-24 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                                    <img src="https://images.unsplash.com/photo-1565514020176-db7020819777?auto=format&fit=crop&q=80&w=300" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" alt="Finance" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] font-bold text-accent uppercase tracking-wide bg-orange-50 px-2 py-0.5 rounded">Finance</span>
                                    </div>
                                    <h4 className="font-bold text-gray-800 mb-1 leading-snug group-hover:text-primary">เครดิตบูโรคืออะไร? ติดแบล็คลิสต์ออกรถได้ไหม</h4>
                                    <p className="text-xs text-gray-500 line-clamp-2">ไขข้อข้องใจเรื่องไฟแนนซ์ สำหรับคนที่เคยมีประวัติผ่อนชำระล่าช้า...</p>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Sidebar */}
                    <aside className="space-y-8">

                        {/* Calculator Widget */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
                            <h3 className="font-bold text-primary mb-4 flex items-center gap-2">
                                <Calculator weight="fill" className="text-accent" size={24} /> คำนวณค่างวด
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-gray-500 font-bold block mb-1.5">ราคารถ (บาท)</label>
                                    <input type="number" defaultValue="500000" className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition" />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 font-bold block mb-1.5">เงินดาวน์ (20%)</label>
                                    <input type="number" defaultValue="100000" className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition" />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 font-bold block mb-1.5">ระยะเวลาผ่อน (งวด)</label>
                                    <div className="flex gap-2">
                                        <button className="flex-1 py-2 border border-gray-200 rounded-lg text-xs font-medium hover:bg-primary hover:text-white transition">48</button>
                                        <button className="flex-1 py-2 border border-primary rounded-lg text-xs font-bold bg-primary text-white shadow-md">60</button>
                                        <button className="flex-1 py-2 border border-gray-200 rounded-lg text-xs font-medium hover:bg-primary hover:text-white transition">72</button>
                                    </div>
                                </div>
                                <div className="bg-blue-50 p-4 rounded-xl mt-2 text-center border border-blue-100">
                                    <span className="text-xs text-gray-500 block mb-1">ค่างวดต่อเดือน (โดยประมาณ)</span>
                                    <span className="text-2xl font-bold text-primary">8,xxx <span className="text-sm font-normal text-gray-500">บาท</span></span>
                                </div>
                            </div>
                        </div>

                        {/* CTA Box */}
                        <div className="bg-gradient-to-br from-gray-900 to-primary text-white p-6 rounded-2xl relative overflow-hidden text-center shadow-lg">
                            <div className="relative z-10">
                                <h3 className="font-bold text-xl mb-2">มีความรู้แล้ว...<br />พร้อมดูรถหรือยัง?</h3>
                                <p className="text-xs text-gray-300 mb-6">ค้นหารถมือสองคุณภาพดี ที่ผ่านการตรวจสอบแล้วกว่า 200 จุด</p>
                                <Link href="/buy" className="bg-accent text-white w-full py-3 rounded-xl font-bold hover:bg-orange-600 transition shadow-lg block">
                                    ไปตลาดซื้อขายรถ
                                </Link>
                            </div>
                            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                        </div>

                        {/* Popular Tags */}
                        <div>
                            <h3 className="font-bold text-gray-800 mb-3 text-sm">คำค้นยอดนิยม</h3>
                            <div className="flex flex-wrap gap-2">
                                {['น้ำท่วม', 'เปลี่ยนถ่ายน้ำมันเครื่อง', 'ประกันชั้น1', 'ยางรถยนต์', 'สีรถ', 'โอนรถ'].map((tag) => (
                                    <span key={tag} className="bg-white border border-gray-200 px-3 py-1 rounded-full text-xs text-gray-600 hover:border-primary hover:text-primary cursor-pointer transition shadow-sm">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                    </aside>
                </div>
            </div>
            {showAllBrandsModal && <BrandsModal />}
        </div>
    );
}
