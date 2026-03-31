"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeft,
    Truck,
    ShieldCheck,
    MapPin,
    Path,
    CheckCircle,
    SpinnerGap,
    Phone,
    User,
    NotePencil,
    NavigationArrow,
    Warning
} from '@phosphor-icons/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface FormData {
    name: string;
    phone: string;
    origin: string;
    destination: string;
    note: string;
}

interface FormErrors {
    name?: string;
    phone?: string;
    origin?: string;
    destination?: string;
}

const pricingData = [
    { zone: 'กรุงเทพฯ-ปริมณฑล', price: '1,500-3,000 บาท' },
    { zone: 'ต่างจังหวัด (ภาคกลาง)', price: '3,000-5,000 บาท' },
    { zone: 'ต่างจังหวัด (ภาคเหนือ/ใต้/อีสาน)', price: '5,000-8,000 บาท' },
];

const features = [
    { icon: ShieldCheck, title: 'ปลอดภัย 100%', description: 'ทีมงานมืออาชีพ พร้อมอุปกรณ์ครบครัน' },
    { icon: ShieldCheck, title: 'ประกันความเสียหาย', description: 'คุ้มครองระหว่างการขนส่งทุกกรณี' },
    { icon: NavigationArrow, title: 'ส่งทั่วไทย', description: 'ครอบคลุมทุกจังหวัดทั่วประเทศ' },
    { icon: Path, title: 'ติดตามสถานะได้', description: 'อัปเดตตำแหน่งรถแบบ Real-time' },
];

export default function DeliveryPage() {
    const [formData, setFormData] = useState<FormData>({
        name: '',
        phone: '',
        origin: '',
        destination: '',
        note: '',
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [submitError, setSubmitError] = useState('');

    const validate = (): boolean => {
        const newErrors: FormErrors = {};
        if (!formData.name.trim()) newErrors.name = 'กรุณากรอกชื่อ';
        if (!formData.phone.trim()) {
            newErrors.phone = 'กรุณากรอกเบอร์โทร';
        } else if (!/^[0-9]{9,10}$/.test(formData.phone.replace(/[-\s]/g, ''))) {
            newErrors.phone = 'เบอร์โทรไม่ถูกต้อง';
        }
        if (!formData.origin.trim()) newErrors.origin = 'กรุณากรอกต้นทาง';
        if (!formData.destination.trim()) newErrors.destination = 'กรุณากรอกปลายทาง';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name as keyof FormErrors]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError('');
        if (!validate()) return;

        setIsSubmitting(true);
        try {
            const res = await fetch(`${API_URL}/services/inquiries`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'DELIVERY',
                    name: formData.name,
                    phone: formData.phone,
                    details: {
                        origin: formData.origin,
                        destination: formData.destination,
                        note: formData.note,
                    },
                }),
            });
            if (!res.ok) throw new Error('Failed to submit inquiry');
            setIsSuccess(true);
        } catch {
            setSubmitError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="bg-surface text-gray-800 min-h-screen">
                <nav className="bg-white shadow-sm fixed w-full z-50 top-0 border-b border-gray-100">
                    <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-2">
                        <Link href="/services" className="text-gray-500 hover:text-primary"><ArrowLeft weight="bold" className="text-xl" /></Link>
                        <span className="font-bold text-xl text-primary">บริการรถสไลด์/ส่งมอบ</span>
                    </div>
                </nav>
                <div className="pt-32 pb-20 flex flex-col items-center justify-center px-4">
                    <div className="bg-white rounded-3xl p-10 shadow-lg border border-gray-100 max-w-md w-full text-center">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle weight="fill" className="text-green-500 text-5xl" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-3">ส่งข้อมูลสำเร็จ!</h2>
                        <p className="text-gray-500 mb-8">เจ้าหน้าที่จะติดต่อกลับภายใน 30 นาที เพื่อแจ้งรายละเอียดและราคาค่าบริการ</p>
                        <Link href="/services" className="inline-block bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-900 transition">
                            กลับหน้าบริการ
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-surface text-gray-800 min-h-screen">

            {/* Nav */}
            <nav className="bg-white shadow-sm fixed w-full z-50 top-0 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-2">
                    <Link href="/services" className="text-gray-500 hover:text-primary"><ArrowLeft weight="bold" className="text-xl" /></Link>
                    <span className="font-bold text-xl text-primary">บริการรถสไลด์/ส่งมอบ</span>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="pt-24 pb-16 text-center px-4 bg-gradient-to-br from-purple-600 to-purple-800 relative text-white overflow-hidden" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.05' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E")`
            }}>
                <div className="relative z-10">
                    <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Truck weight="fill" className="text-5xl text-white" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-4">บริการรถสไลด์/ส่งมอบรถ</h1>
                    <p className="text-purple-100 text-lg max-w-2xl mx-auto mb-8">
                        ส่งรถถึงหน้าบ้านทั่วไทย ปลอดภัย 100% พร้อมประกันความเสียหายระหว่างขนส่ง
                    </p>
                </div>
                <div className="absolute top-10 left-10 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
                <div className="absolute bottom-10 right-10 w-64 h-64 bg-purple-400/20 rounded-full blur-3xl"></div>
            </header>

            <div className="max-w-7xl mx-auto px-4 py-12">

                {/* Features */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 -mt-20 relative z-20">
                    {features.map((feat, i) => (
                        <div key={i} className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100 text-center group hover:-translate-y-1 transition">
                            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mx-auto mb-3 text-purple-600 group-hover:scale-110 transition">
                                <feat.icon weight="fill" className="text-2xl" />
                            </div>
                            <h3 className="font-bold text-gray-800 text-sm mb-1">{feat.title}</h3>
                            <p className="text-xs text-gray-500">{feat.description}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left: Form */}
                    <div className="lg:col-span-2">
                        <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800 mb-6">สอบถามค่าบริการ / จองรถสไลด์</h2>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">
                                            <User weight="bold" className="inline mr-1" />ชื่อ
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="ชื่อ-นามสกุล"
                                            className={`w-full bg-gray-50 border rounded-lg p-3 outline-none focus:border-primary ${errors.name ? 'border-red-400' : 'border-gray-200'}`}
                                        />
                                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">
                                            <Phone weight="bold" className="inline mr-1" />เบอร์โทร
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="08x-xxx-xxxx"
                                            className={`w-full bg-gray-50 border rounded-lg p-3 outline-none focus:border-primary ${errors.phone ? 'border-red-400' : 'border-gray-200'}`}
                                        />
                                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">
                                        <MapPin weight="bold" className="inline mr-1" />ต้นทาง
                                    </label>
                                    <input
                                        type="text"
                                        name="origin"
                                        value={formData.origin}
                                        onChange={handleChange}
                                        placeholder="สถานที่รับรถ เช่น กรุงเทพฯ, เชียงใหม่"
                                        className={`w-full bg-gray-50 border rounded-lg p-3 outline-none focus:border-primary ${errors.origin ? 'border-red-400' : 'border-gray-200'}`}
                                    />
                                    {errors.origin && <p className="text-red-500 text-xs mt-1">{errors.origin}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">
                                        <MapPin weight="bold" className="inline mr-1" />ปลายทาง
                                    </label>
                                    <input
                                        type="text"
                                        name="destination"
                                        value={formData.destination}
                                        onChange={handleChange}
                                        placeholder="สถานที่ส่งรถ เช่น ขอนแก่น, สงขลา"
                                        className={`w-full bg-gray-50 border rounded-lg p-3 outline-none focus:border-primary ${errors.destination ? 'border-red-400' : 'border-gray-200'}`}
                                    />
                                    {errors.destination && <p className="text-red-500 text-xs mt-1">{errors.destination}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">
                                        <NotePencil weight="bold" className="inline mr-1" />หมายเหตุ
                                    </label>
                                    <textarea
                                        name="note"
                                        value={formData.note}
                                        onChange={handleChange}
                                        rows={3}
                                        placeholder="ข้อมูลเพิ่มเติม เช่น ยี่ห้อรถ, รุ่น, ขนาด (ไม่บังคับ)"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 outline-none focus:border-primary resize-none"
                                    />
                                </div>

                                {submitError && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-red-600 text-sm">
                                        <Warning weight="fill" /> {submitError}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 transition shadow-lg shadow-purple-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <><SpinnerGap weight="bold" className="animate-spin" /> กำลังส่ง...</>
                                    ) : (
                                        <>ส่งข้อมูล</>
                                    )}
                                </button>
                            </form>
                        </section>
                    </div>

                    {/* Right: Pricing */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-6">
                            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                                <h3 className="font-bold text-gray-800 mb-4 text-lg">ค่าบริการโดยประมาณ</h3>

                                <div className="space-y-3 mb-4">
                                    {pricingData.map((item, i) => (
                                        <div key={i} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
                                            <span className="text-sm text-gray-600">{item.zone}</span>
                                            <span className="font-bold text-purple-600 text-sm whitespace-nowrap ml-2">{item.price}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="bg-purple-50 border border-purple-100 rounded-xl p-3 text-xs text-purple-700">
                                    <strong>หมายเหตุ:</strong> ราคาขึ้นอยู่กับระยะทางและขนาดรถ กรุณาสอบถามราคาจริงกับเจ้าหน้าที่
                                </div>
                            </div>

                            <div className="bg-purple-600 text-white p-6 rounded-2xl">
                                <h4 className="font-bold mb-2">ต้องการความช่วยเหลือ?</h4>
                                <p className="text-purple-100 text-sm mb-4">โทรหาเราได้เลย เจ้าหน้าที่พร้อมให้คำปรึกษา</p>
                                <a href="tel:021234567" className="bg-white text-purple-600 px-4 py-2 rounded-lg font-bold text-sm inline-flex items-center gap-2 hover:bg-purple-50 transition">
                                    <Phone weight="fill" /> 02-123-4567
                                </a>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
