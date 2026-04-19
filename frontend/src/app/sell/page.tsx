"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import SearchableSelect, { type SelectOption } from '@/components/SearchableSelect';
import {
    Car,
    Wand2,
    CheckCircle,
    ShieldCheck,
    Camera,
    Handshake,
    Star,
    ChevronDown,
    Zap,
    Rocket,
    Crown,
    Check,
    TrendingUp,
    Eye,
    Images,
    Timer,
    CircleDollarSign,
    Megaphone,
} from 'lucide-react';
import LoginModal from '@/components/LoginModal';
import RegisterModal from '@/components/RegisterModal';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface PackageData {
    id: string;
    name: string;
    nameTh: string;
    slug: string;
    description: string | null;
    targetAudience: string | null;
    price: number;
    maxListings: number;
    maxPhotosPerListing: number;
    listingDurationDays: number;
    autoBumpPerDay: number;
    badge: string | null;
    searchPriority: string;
    features: string[];
    sortOrder: number;
}

const packageStyles: Record<string, { icon: React.ReactNode; bg: string; iconColor: string; border: string }> = {
    basic: { icon: <Zap size={28} fill="currentColor" />, bg: 'bg-gray-50', iconColor: 'text-gray-400', border: 'border-gray-200' },
    standard: { icon: <Star size={28} fill="currentColor" />, bg: 'bg-blue-50', iconColor: 'text-blue-500', border: 'border-blue-200' },
    professional: { icon: <Rocket size={28} fill="currentColor" />, bg: 'bg-orange-50', iconColor: 'text-orange-500', border: 'border-orange-400' },
    premium: { icon: <Crown size={28} fill="currentColor" />, bg: 'bg-yellow-50', iconColor: 'text-yellow-500', border: 'border-yellow-400' },
};

function getStyle(slug: string) {
    return packageStyles[slug] || packageStyles.basic;
}

function formatSearchPriority(p: string) {
    const map: Record<string, string> = { normal: 'ปกติ', higher: 'ดีกว่าทั่วไป', top: 'สูง', priority: 'สูงสุด' };
    return map[p] || p;
}

interface Brand {
    id: string;
    name: string;
    nameTh: string | null;
    logo?: string | null;
    isPopular?: boolean;
}

interface VehicleModel {
    id: string;
    name: string;
    nameTh?: string | null;
}

export default function SellPage() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [stats, setStats] = useState({ activeListings: 0, soldListings: 0, totalSellers: 0 });
    const [packages, setPackages] = useState<PackageData[]>([]);
    const [pendingRedirect, setPendingRedirect] = useState<string>('/sell/create');

    // Brand/Model selection for estimate
    const [brands, setBrands] = useState<Brand[]>([]);
    const [models, setModels] = useState<VehicleModel[]>([]);
    const [selectedBrandId, setSelectedBrandId] = useState('');
    const [selectedBrandName, setSelectedBrandName] = useState('');
    const [selectedModelId, setSelectedModelId] = useState('');
    const [selectedModelName, setSelectedModelName] = useState('');

    useEffect(() => {
        const user = localStorage.getItem('user') || sessionStorage.getItem('user');
        setIsLoggedIn(!!user);

        // Fetch stats + packages + brands
        fetch(`${API_URL}/listings/stats/public`)
            .then(r => r.json())
            .then(d => setStats(d))
            .catch(() => {});

        fetch(`${API_URL}/packages`)
            .then(r => r.json())
            .then(d => setPackages(d.packages || []))
            .catch(() => {});

        fetch(`${API_URL}/master-data/brands?vehicleType=CAR`)
            .then(r => r.json())
            .then(d => { if (d.success) setBrands(d.brands); })
            .catch(() => {});
    }, []);

    // Fetch models when brand changes
    useEffect(() => {
        if (!selectedBrandId) { setModels([]); return; }
        fetch(`${API_URL}/master-data/brands/${selectedBrandId}/models`)
            .then(r => r.json())
            .then(d => { if (d.success) setModels(d.models); })
            .catch(() => {});
        setSelectedModelId('');
        setSelectedModelName('');
    }, [selectedBrandId]);

    const estimateUrl = selectedBrandName && selectedModelName
        ? `/sell/estimate?brandId=${selectedBrandId}&brand=${encodeURIComponent(selectedBrandName)}&modelId=${selectedModelId}&model=${encodeURIComponent(selectedModelName)}`
        : '/sell/estimate';

    const handleSellClick = (e: React.MouseEvent) => {
        if (!isLoggedIn) {
            e.preventDefault();
            setPendingRedirect('/sell/create');
            setShowLoginModal(true);
        }
    };

    const handlePackageClick = (slug: string) => {
        const redirect = slug === 'basic' ? '/sell/create' : '/profile/packages';
        if (isLoggedIn) {
            window.location.href = redirect;
        } else {
            setPendingRedirect(redirect);
            setShowRegisterModal(true);
        }
    };

    return (
        <div className="bg-surface text-gray-800 min-h-screen overflow-x-hidden">
            {/* Hero Section */}
            <header
                className="relative min-h-[600px] flex items-center justify-center pt-20 px-4 overflow-visible"
                style={{
                    backgroundImage: `linear-gradient(rgba(15, 52, 96, 0.9), rgba(15, 52, 96, 0.8)), url('https://images.unsplash.com/photo-1560252829-804f1aedf1be?q=80&w=2000&auto=format&fit=crop')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <div className="max-w-4xl w-full text-center relative z-10">
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                        เปลี่ยนรถให้เป็นเงิน<br />
                        <span className="text-accent">ง่ายกว่า</span> และ <span className="text-accent">ได้ราคาดีกว่า</span>
                    </h1>
                    <p className="text-blue-100 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
                        อย่าเพิ่งขายเต็นท์ถ้ายังไม่ได้เช็คราคาที่นี่! ลงขายฟรี ระบบช่วยดันประกาศ และช่วยแนะนำราคากลางที่ยุติธรรมที่สุด
                    </p>

                    <div className="bg-white p-4 rounded-2xl shadow-2xl max-w-3xl mx-auto flex flex-col md:flex-row gap-3 relative z-20">
                        <div className="flex-1 text-left">
                            <label className="text-xs text-gray-500 ml-1 mb-1 block">ยี่ห้อ</label>
                            <SearchableSelect
                                options={brands.map(b => ({
                                    id: b.id,
                                    label: b.name,
                                    subLabel: b.nameTh || undefined,
                                    image: b.logo || `/brands/cars/${b.name}-300x300.png`,
                                    isPopular: b.isPopular || false,
                                }))}
                                value={selectedBrandId}
                                onChange={(val, opt) => {
                                    setSelectedBrandId(val);
                                    setSelectedBrandName(opt?.label || '');
                                }}
                                placeholder="เลือกยี่ห้อ"
                                searchPlaceholder="ค้นหายี่ห้อ..."
                            />
                        </div>
                        <div className="flex-1 text-left">
                            <label className="text-xs text-gray-500 ml-1 mb-1 block">รุ่น</label>
                            <SearchableSelect
                                options={models.map(m => ({
                                    id: m.id,
                                    label: m.name,
                                    subLabel: m.nameTh || undefined,
                                }))}
                                value={selectedModelId}
                                onChange={(val, opt) => {
                                    setSelectedModelId(val);
                                    setSelectedModelName(opt?.label || '');
                                }}
                                placeholder="เลือกรุ่น"
                                searchPlaceholder="ค้นหารุ่น..."
                                disabled={!selectedBrandId}
                            />
                        </div>
                        <Link
                            href={estimateUrl}
                            className="bg-accent text-white px-8 py-3 rounded-xl font-bold text-lg hover:bg-orange-600 transition shadow-lg shadow-orange-200 flex items-center justify-center gap-2 md:mt-5"
                        >
                            เช็คราคาขาย <Wand2 />
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
                        <span className="block text-3xl font-bold text-primary">{stats.activeListings.toLocaleString()}+</span>
                        <span className="text-sm text-gray-500">ประกาศขายอยู่ตอนนี้</span>
                    </div>
                    <div>
                        <span className="block text-3xl font-bold text-primary">{stats.totalSellers.toLocaleString()}+</span>
                        <span className="text-sm text-gray-500">ผู้ขายที่ลงทะเบียน</span>
                    </div>
                </div>
            </div>

            {/* Comparison Table */}
            <section className="max-w-6xl mx-auto px-4 py-20">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">ทำไมต้องขายกับ Car<span className='text-accent'>2</span>Hand?</h2>
                    <p className="text-gray-500 max-w-2xl mx-auto">เราแก้ทุกปัญหาของการขายรถมือสอง ให้คุณได้รับประสบการณ์การค้าที่พรีเมียมและคุ้มค่าที่สุด</p>
                </div>

                <div className="overflow-x-auto pb-8">
                    <div className="grid grid-cols-4 min-w-[800px] bg-white dark:bg-card rounded-3xl overflow-hidden shadow-sm border border-gray-100 dark:border-border">
                        {/* Table Header */}
                        <div className="col-span-1 p-8"></div>
                        <div className="col-span-1 bg-primary text-white p-8 text-center relative flex flex-col items-center justify-center gap-2 shadow-2xl z-10">
                            <h3 className="font-bold text-2xl">Car<span className='text-accent'>2</span>Hand</h3>
                            <div className="w-8 h-1 bg-accent/50 rounded-full mt-1"></div>
                        </div>
                        <div className="col-span-1 bg-gray-50/50 dark:bg-muted/30 p-8 text-center flex flex-col items-center justify-center">
                            <h3 className="font-bold text-gray-500 dark:text-muted-foreground text-lg">เต็นท์รถทั่วไป</h3>
                        </div>
                        <div className="col-span-1 bg-gray-50/50 dark:bg-muted/30 p-8 text-center flex flex-col items-center justify-center">
                            <h3 className="font-bold text-gray-500 dark:text-muted-foreground text-lg whitespace-nowrap">โพสต์เอง (FB/Web)</h3>
                        </div>

                        {/* Rows */}
                        {[
                            {
                                label: 'ราคาขาย',
                                c2h: 'สูง (ตามราคาตลาด)',
                                c2hIcon: <TrendingUp size={20} className="text-primary" />,
                                others1: 'ต่ำ (มักโดนกดราคา)',
                                others1Color: 'text-red-400',
                                others2: 'สูง (ตั้งเองได้)',
                                others2Color: 'text-gray-600'
                            },
                            {
                                label: 'ความรวดเร็ว',
                                c2h: 'ปานกลาง - เร็วมาก',
                                c2hIcon: <Zap size={20} className="text-primary" />,
                                others1: 'เร็วมาก (รับเงินทันที)',
                                others1Color: 'text-green-600',
                                others2: 'ช้ามาก (ขึ้นอยู่กับดวง)',
                                others2Color: 'text-red-400'
                            },
                            {
                                label: 'ความปลอดภัย',
                                c2h: 'ปลอดภัยสูงสุด',
                                c2hIcon: <ShieldCheck size={20} className="text-primary" />,
                                others1: 'ปานกลาง',
                                others1Color: 'text-gray-500',
                                others2: 'ต่ำ (เสี่ยงมิจฉาชีพ)',
                                others2Color: 'text-red-500'
                            },
                            {
                                label: 'ค่าใช้จ่าย',
                                c2h: 'ลงฟรี (มีแพ็กเกจเสริม)',
                                c2hIcon: <CircleDollarSign size={20} className="text-primary" />,
                                others1: 'หักค่าคอม 5-15%',
                                others1Color: 'text-red-400',
                                others2: 'ฟรี แต่ต้องทำเอง',
                                others2Color: 'text-gray-500'
                            },
                            {
                                label: 'ระบบดันประกาศ',
                                c2h: 'ดันอัตโนมัติ',
                                c2hIcon: <Rocket size={20} className="text-primary" />,
                                others1: 'ไม่มี',
                                others1Color: 'text-gray-400',
                                others2: 'ต้องโพสต์ซ้ำเอง',
                                others2Color: 'text-red-400'
                            },
                            {
                                label: 'จำนวนรูปภาพ',
                                c2h: 'สูงสุด 40 รูป',
                                c2hIcon: <Camera size={20} className="text-primary" />,
                                others1: 'จำกัด 5-10 รูป',
                                others1Color: 'text-gray-400',
                                others2: 'ไม่จำกัด',
                                others2Color: 'text-gray-600'
                            },
                        ].map((row, idx) => (
                            <React.Fragment key={idx}>
                                <div className={`col-span-1 py-6 px-8 flex items-center font-bold text-gray-700 dark:text-foreground border-t border-gray-50 dark:border-border/50 ${idx % 2 === 0 ? 'bg-white dark:bg-card' : 'bg-gray-50/20 dark:bg-muted/20'}`}>
                                    {row.label}
                                </div>
                                <div className={`col-span-1 py-6 px-6 bg-blue-900/5 dark:bg-primary/15 flex items-center justify-center gap-2 font-bold text-primary text-center border-x-4 border-primary/5 dark:border-primary/20 border-t border-primary/5 dark:border-t-primary/20`}>
                                    {row.c2hIcon}
                                    <span className="text-sm md:text-base">{row.c2h}</span>
                                </div>
                                <div className={`col-span-1 py-6 px-6 flex items-center justify-center text-center text-sm font-medium border-t border-gray-50 dark:border-border/50 ${row.others1Color} ${idx % 2 === 0 ? 'bg-white dark:bg-card' : 'bg-gray-50/20 dark:bg-muted/20'}`}>
                                    {row.others1}
                                </div>
                                <div className={`col-span-1 py-6 px-6 flex items-center justify-center text-center text-sm font-medium border-t border-gray-50 dark:border-border/50 ${row.others2Color} ${idx % 2 === 0 ? 'bg-white dark:bg-card' : 'bg-gray-50/20 dark:bg-muted/20'}`}>
                                    {row.others2}
                                </div>
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </section>

            {/* Steps Section */}
            <section className="bg-white dark:bg-card py-20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-gray-50 dark:bg-primary/10 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-3xl opacity-70"></div>

                <div className="max-w-7xl mx-auto px-4 relative z-10">
                    <h2 className="text-3xl font-bold text-primary text-center mb-16">ขายง่ายๆ ใน 3 ขั้นตอน</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        <div className="flex flex-col items-center text-center group">
                            <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition duration-300">
                                <Camera className="text-4xl text-primary" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-3">1. ถ่ายรูปและลงข้อมูล</h3>
                            <p className="text-gray-500">กรอกข้อมูลรถของคุณ และอัปโหลดรูปภาพ</p>
                        </div>
                        <div className="flex flex-col items-center text-center group relative">
                            <div className="hidden md:block absolute top-10 -left-1/2 w-full h-[2px] bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-border -z-10"></div>
                            <div className="w-20 h-20 bg-orange-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition duration-300">
                                <Wand2 className="text-4xl text-accent" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-3">2. ตั้งราคา</h3>
                            <p className="text-gray-500">ระบบช่วยประเมินราคากลางให้ เพื่อให้คุณตั้งราคาได้เหมาะสม</p>
                        </div>
                        <div className="flex flex-col items-center text-center group relative">
                            <div className="hidden md:block absolute top-10 -left-1/2 w-full h-[2px] bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-border -z-10"></div>
                            <div className="w-20 h-20 bg-green-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition duration-300">
                                <Handshake className="text-4xl text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-3">3. ปิดการขายรับเงิน</h3>
                            <p className="text-gray-500">นัดดูรถ และปิดการขายได้เลย เรามีสัญญาซื้อขายให้โหลดฟรี</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Package Pricing Section */}
            {packages.length > 0 && (
                <section className="bg-gray-50 py-20">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">เลือกแพ็กเกจที่เหมาะกับคุณ</h2>
                            <p className="text-gray-500 max-w-2xl mx-auto">เริ่มต้นลงขายฟรี! หรืออัพเกรดเพื่อเพิ่มโอกาสขายได้เร็วขึ้น</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {packages.map((pkg) => {
                                const style = getStyle(pkg.slug);
                                const isRecommended = pkg.slug === 'professional';
                                const price = Number(pkg.price);

                                return (
                                    <div
                                        key={pkg.id}
                                        className={`bg-white rounded-2xl border-2 ${isRecommended ? style.border : 'border-gray-100'} overflow-hidden shadow-sm hover:shadow-lg transition relative flex flex-col`}
                                    >
                                        {isRecommended && (
                                            <div className="absolute -top-0 right-4 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-b-lg">
                                                แนะนำ
                                            </div>
                                        )}

                                        {/* Header */}
                                        <div className={`${style.bg} p-6 text-center`}>
                                            <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${style.bg} ${style.iconColor} mb-3`}>
                                                {style.icon}
                                            </div>
                                            <h3 className="font-bold text-lg text-gray-800">{pkg.name}</h3>
                                            <p className="text-xs text-gray-500">{pkg.nameTh}</p>
                                        </div>

                                        {/* Price */}
                                        <div className="px-6 py-4 text-center border-b border-gray-100">
                                            {price === 0 ? (
                                                <span className="text-3xl font-bold text-gray-800">ฟรี</span>
                                            ) : (
                                                <>
                                                    <span className="text-3xl font-bold text-gray-800">฿{price.toLocaleString()}</span>
                                                    <span className="text-gray-500 text-sm">/เดือน</span>
                                                </>
                                            )}
                                        </div>

                                        {/* Features */}
                                        <div className="px-6 py-4 flex-1 space-y-3 text-sm">
                                            <div className="flex items-center gap-2">
                                                <Check className="text-green-500 flex-shrink-0" size={16} />
                                                <span>{pkg.maxListings === -1 ? 'ไม่จำกัดประกาศ' : `${pkg.maxListings} ประกาศ`}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Images className="text-green-500 flex-shrink-0" size={16} />
                                                <span>สูงสุด {pkg.maxPhotosPerListing} รูป/ประกาศ</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Timer className="text-green-500 flex-shrink-0" size={16} />
                                                <span>{pkg.listingDurationDays === -1 ? 'ไม่มีหมดอายุ' : `${pkg.listingDurationDays} วัน/ประกาศ`}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <TrendingUp className={`flex-shrink-0 ${pkg.autoBumpPerDay > 0 ? 'text-green-500' : 'text-gray-300'}`} size={16} />
                                                <span className={pkg.autoBumpPerDay > 0 ? '' : 'text-gray-400'}>
                                                    {pkg.autoBumpPerDay > 0 ? `ดันอัตโนมัติ ${pkg.autoBumpPerDay} ครั้ง/วัน` : 'ดันเอง (Manual)'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Eye className={`flex-shrink-0 ${pkg.badge ? 'text-green-500' : 'text-gray-300'}`} size={16} />
                                                <span className={pkg.badge ? '' : 'text-gray-400'}>
                                                    {pkg.badge ? `ป้าย "${pkg.badge}"` : 'ไม่มีป้ายพิเศษ'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Megaphone className={`flex-shrink-0 ${pkg.searchPriority !== 'normal' ? 'text-green-500' : 'text-gray-300'}`} size={16} />
                                                <span className={pkg.searchPriority !== 'normal' ? '' : 'text-gray-400'}>
                                                    ลำดับค้นหา: {formatSearchPriority(pkg.searchPriority)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* CTA */}
                                        <div className="px-6 pb-6">
                                            <button
                                                onClick={() => handlePackageClick(pkg.slug)}
                                                className={`w-full py-3 rounded-xl font-bold text-sm transition ${
                                                    isRecommended
                                                        ? 'bg-orange-500 text-white hover:bg-orange-600'
                                                        : price === 0
                                                            ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                            : 'bg-primary text-white hover:bg-blue-800'
                                                }`}
                                            >
                                                {price === 0 ? 'เริ่มต้นฟรี' : 'เลือกแพ็กเกจนี้'}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>
            )}

            {/* Testimonials */}
            <section className="max-w-7xl mx-auto px-4 py-20">
                <h2 className="text-3xl font-bold text-primary text-center mb-12">เรื่องจริงจากคนขาย</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        {
                            name: 'คุณนนท์',
                            initial: 'น',
                            color: 'bg-primary',
                            car: 'ขาย Honda City 2018',
                            review: '"ตอนแรกจะไปขายเต็นท์ เขาตีราคาให้ 3.5 แสน เลยลองมาลงขายที่นี่ แนะนำให้ตั้ง 4.2 แสน สรุปขายได้จริงใน 5 วัน ได้เงินเพิ่มมาตั้งหลายหมื่น"'
                        },
                        {
                            name: 'คุณเมย์',
                            initial: 'เ',
                            color: 'bg-accent',
                            car: 'ขาย Mazda 2 SkyActiv',
                            review: '"ชอบตรงที่ไม่ยุ่งยาก ลงข้อมูลแป๊บเดียวเสร็จ ที่สำคัญคือคนซื้อดูน่าเชื่อถือ เพราะมีการยืนยันตัวตน ไม่เจอพวกมิจฉาชีพเหมือนในเฟสบุ๊ค"'
                        },
                        {
                            name: 'คุณเอก',
                            initial: 'อ',
                            color: 'bg-green-600',
                            car: 'ขาย Toyota Fortuner',
                            review: '"ฟีเจอร์แนะนำราคาดีมาก ช่วยให้ตั้งราคาได้เหมาะสม เพราะมีราคากลางอ้างอิง วิน-วินทั้งสองฝ่าย"'
                        },
                    ].map((t, i) => (
                        <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition">
                            <div className="flex text-yellow-400 mb-4 gap-1">
                                {[1, 2, 3, 4, 5].map((s) => <Star key={s} fill="currentColor" />)}
                            </div>
                            <p className="text-gray-600 mb-6">{t.review}</p>
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 ${t.color} rounded-full flex items-center justify-center text-white font-bold text-sm`}>
                                    {t.initial}
                                </div>
                                <div>
                                    <div className="font-bold text-gray-800">{t.name}</div>
                                    <div className="text-xs text-gray-400">{t.car}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <p className="text-center text-xs text-gray-400 mt-6">*รีวิวจากผู้ใช้งานจริงบนแพลตฟอร์ม</p>
            </section>

            {/* FAQ */}
            <section className="bg-gray-50 py-20">
                <div className="max-w-3xl mx-auto px-4">
                    <h2 className="text-3xl font-bold text-primary text-center mb-10">คำถามที่พบบ่อย</h2>

                    <div className="space-y-4">
                        <details className="bg-white p-5 rounded-2xl shadow-sm cursor-pointer group">
                            <summary className="font-bold text-gray-800 flex justify-between items-center list-none">
                                ลงขายมีค่าใช้จ่ายไหม?
                                <ChevronDown className="group-open:rotate-180 transition" />
                            </summary>
                            <p className="text-gray-600 mt-3 pt-3 border-t border-gray-100">
                                สำหรับรถคันแรก ลงขายฟรีไม่มีค่าใช้จ่าย! หากต้องการลงขายมากกว่า 1 คัน หรือต้องการโปรโมทให้เห็นมากขึ้น เรามีแพ็กเกจให้เลือกเริ่มต้นเพียง 299 บาท/เดือน
                            </p>
                        </details>
                        <details className="bg-white p-5 rounded-2xl shadow-sm cursor-pointer group">
                            <summary className="font-bold text-gray-800 flex justify-between items-center list-none">
                                ต้องเตรียมเอกสารอะไรบ้าง?
                                <ChevronDown className="group-open:rotate-180 transition" />
                            </summary>
                            <p className="text-gray-600 mt-3 pt-3 border-t border-gray-100">
                                เบื้องต้นใช้เพียงรูปถ่ายรถที่ชัดเจน และสำเนาเล่มทะเบียนรถ (หน้าที่มีชื่อเจ้าของ) เพื่อยืนยันว่าเป็นเจ้าของรถจริง
                            </p>
                        </details>
                        <details className="bg-white p-5 rounded-2xl shadow-sm cursor-pointer group">
                            <summary className="font-bold text-gray-800 flex justify-between items-center list-none">
                                ระบบแนะนำราคากลางทำงานอย่างไร?
                                <ChevronDown className="group-open:rotate-180 transition" />
                            </summary>
                            <p className="text-gray-600 mt-3 pt-3 border-t border-gray-100">
                                ระบบของเราใช้ข้อมูลราคากลางจากตลาดรถมือสองเพื่อแนะนำราคาที่เหมาะสม โดยอ้างอิงจากยี่ห้อ รุ่น ปี และเลขไมล์ เพื่อช่วยให้คุณตั้งราคาได้ยุติธรรม
                            </p>
                        </details>
                        <details className="bg-white p-5 rounded-2xl shadow-sm cursor-pointer group">
                            <summary className="font-bold text-gray-800 flex justify-between items-center list-none">
                                แพ็กเกจต่างกันอย่างไร?
                                <ChevronDown className="group-open:rotate-180 transition" />
                            </summary>
                            <p className="text-gray-600 mt-3 pt-3 border-t border-gray-100">
                                แพ็กเกจ Basic ลงขายฟรี 1 รายการ เหมาะกับคนขายรถส่วนตัว แพ็กเกจที่สูงขึ้นจะได้จำนวนประกาศมากขึ้น ระบบดันโพสต์อัตโนมัติ ป้ายพิเศษบนประกาศ และลำดับการค้นหาที่ดีกว่า
                            </p>
                        </details>
                        <details className="bg-white p-5 rounded-2xl shadow-sm cursor-pointer group">
                            <summary className="font-bold text-gray-800 flex justify-between items-center list-none">
                                ลงขายแล้วจะมีคนเห็นไหม?
                                <ChevronDown className="group-open:rotate-180 transition" />
                            </summary>
                            <p className="text-gray-600 mt-3 pt-3 border-t border-gray-100">
                                ทุกประกาศจะแสดงในหน้าซื้อรถทันที (ยกเว้น Basic ต้องรออนุมัติ) และสามารถค้นหาได้จากยี่ห้อ รุ่น หรือจังหวัด สำหรับแพ็กเกจที่สูงขึ้นจะมีระบบดันโพสต์อัตโนมัติ ทำให้ประกาศของคุณอยู่ด้านบนและมีคนเห็นมากขึ้น
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
                redirectTo={pendingRedirect}
            />

            {/* Register Modal */}
            <RegisterModal
                isOpen={showRegisterModal}
                onClose={() => setShowRegisterModal(false)}
                onSwitchToLogin={() => {
                    setShowRegisterModal(false);
                    setShowLoginModal(true);
                }}
                redirectTo={pendingRedirect}
            />
        </div>
    );
}
