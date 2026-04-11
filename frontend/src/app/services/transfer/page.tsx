"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeft,
    FileStack,
    Check,
    CheckCircle,
    Loader2,
    Phone,
    User,
    PenLine,
    IdCard,
    Home,
    Car,
    Stamp,
    Receipt,
    AlertTriangle,
    Clock,
    ArrowRight
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface FormData {
    name: string;
    phone: string;
    note: string;
}

interface FormErrors {
    name?: string;
    phone?: string;
}

const documents = [
    { icon: IdCard, text: 'สำเนาบัตรประชาชน (ผู้ซื้อและผู้ขาย)' },
    { icon: Home, text: 'สำเนาทะเบียนบ้าน' },
    { icon: Car, text: 'เล่มทะเบียนรถ (ตัวจริง)' },
    { icon: Stamp, text: 'หนังสือมอบอำนาจ (ถ้ามี)' },
    { icon: Receipt, text: 'ใบเสร็จรับเงิน/สัญญาซื้อขาย' },
];

const steps = [
    { step: 1, title: 'ส่งเอกสารให้เจ้าหน้าที่', description: 'เตรียมเอกสารและส่งให้ทีมงาน' },
    { step: 2, title: 'ตรวจสอบเอกสาร', description: '1 วันทำการ' },
    { step: 3, title: 'ดำเนินการโอนที่กรมขนส่ง', description: '3-5 วันทำการ' },
    { step: 4, title: 'ส่งเล่มทะเบียนคืน', description: 'จัดส่งถึงมือคุณอย่างปลอดภัย' },
];

export default function TransferPage() {
    const [formData, setFormData] = useState<FormData>({
        name: '',
        phone: '',
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
                    type: 'TRANSFER',
                    name: formData.name,
                    phone: formData.phone,
                    details: {
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
                        <Link href="/services" className="text-gray-500 hover:text-primary"><ArrowLeft className="text-xl" /></Link>
                        <span className="font-bold text-xl text-primary">บริการโอนเล่มทะเบียน</span>
                    </div>
                </nav>
                <div className="pt-32 pb-20 flex flex-col items-center justify-center px-4">
                    <div className="bg-white rounded-3xl p-10 shadow-lg border border-gray-100 max-w-md w-full text-center">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle fill="currentColor" className="text-green-500 text-5xl" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-3">ส่งข้อมูลสำเร็จ!</h2>
                        <p className="text-gray-500 mb-8">เจ้าหน้าที่จะติดต่อกลับเพื่อแนะนำขั้นตอนและนัดรับเอกสาร</p>
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
                    <Link href="/services" className="text-gray-500 hover:text-primary"><ArrowLeft className="text-xl" /></Link>
                    <span className="font-bold text-xl text-primary">บริการโอนเล่มทะเบียน</span>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="pt-24 pb-16 text-center px-4 bg-gradient-to-br from-gray-600 to-gray-800 relative text-white overflow-hidden" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.05' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E")`
            }}>
                <div className="relative z-10">
                    <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <FileStack fill="currentColor" className="text-5xl text-white" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-4">บริการโอนเล่มทะเบียน</h1>
                    <p className="text-gray-200 text-lg max-w-2xl mx-auto mb-8">
                        ไม่ต้องไปขนส่งเอง เราดำเนินการโอนเล่มทะเบียนให้จบครบในที่เดียว
                    </p>
                </div>
                <div className="absolute top-10 left-10 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
                <div className="absolute bottom-10 right-10 w-64 h-64 bg-gray-400/20 rounded-full blur-3xl"></div>
            </header>

            <div className="max-w-7xl mx-auto px-4 py-12">

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Documents Checklist */}
                        <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <span className="bg-gray-700 text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm">1</span>
                                เอกสารที่ต้องเตรียม
                            </h2>

                            <div className="space-y-3">
                                {documents.map((doc, i) => (
                                    <div key={i} className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-gray-600 shadow-sm shrink-0">
                                            <doc.icon fill="currentColor" className="text-xl" />
                                        </div>
                                        <span className="text-sm text-gray-700 font-medium">{doc.text}</span>
                                        <Check className="text-gray-300 ml-auto text-lg" />
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Process Timeline */}
                        <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <span className="bg-gray-700 text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm">2</span>
                                ขั้นตอนการดำเนินการ
                            </h2>

                            <div className="space-y-0">
                                {steps.map((item, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                                                {item.step}
                                            </div>
                                            {i < steps.length - 1 && (
                                                <div className="w-0.5 h-12 bg-gray-200 my-1"></div>
                                            )}
                                        </div>
                                        <div className="pb-6">
                                            <h4 className="font-bold text-gray-800">{item.title}</h4>
                                            <p className="text-sm text-gray-500 flex items-center gap-1">
                                                <Clock className="text-xs" /> {item.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Contact Form */}
                        <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <span className="bg-gray-700 text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm">3</span>
                                ติดต่อสอบถาม
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">
                                            <User className="inline mr-1" />ชื่อ
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
                                            <Phone className="inline mr-1" />เบอร์โทร
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
                                        <PenLine className="inline mr-1" />หมายเหตุ
                                    </label>
                                    <textarea
                                        name="note"
                                        value={formData.note}
                                        onChange={handleChange}
                                        rows={3}
                                        placeholder="ข้อมูลเพิ่มเติม เช่น ยี่ห้อรถ, จังหวัดที่จดทะเบียน (ไม่บังคับ)"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 outline-none focus:border-primary resize-none"
                                    />
                                </div>

                                {submitError && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-red-600 text-sm">
                                        <AlertTriangle fill="currentColor" /> {submitError}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-gray-700 text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <><Loader2 className="animate-spin" /> กำลังส่ง...</>
                                    ) : (
                                        <>ส่งข้อมูล <ArrowRight /></>
                                    )}
                                </button>
                            </form>
                        </section>
                    </div>

                    {/* Right Column: Pricing */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-6">
                            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                                <h3 className="font-bold text-gray-800 mb-4 text-lg border-b border-gray-100 pb-3">ค่าบริการ</h3>

                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="text-sm text-gray-600">ค่าบริการโอนเล่ม</span>
                                            <p className="text-xs text-gray-400">ไม่รวมค่าธรรมเนียมกรมขนส่ง</p>
                                        </div>
                                        <span className="font-bold text-primary text-lg whitespace-nowrap">3,500 ฿</span>
                                    </div>
                                    <div className="h-px bg-gray-100"></div>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="text-sm text-gray-600">ค่าธรรมเนียมกรมขนส่ง</span>
                                            <p className="text-xs text-gray-400">ตามจริง</p>
                                        </div>
                                        <span className="font-bold text-gray-600 text-sm whitespace-nowrap">~500-1,000 ฿</span>
                                    </div>
                                </div>

                                <div className="bg-primary rounded-xl p-4 text-white text-center">
                                    <p className="text-blue-200 text-xs mb-1">รวมค่าบริการโดยประมาณ</p>
                                    <p className="text-2xl font-bold">4,000-4,500 ฿</p>
                                </div>
                            </div>

                            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
                                <h4 className="font-bold text-gray-700 text-sm mb-3">ทำไมต้องใช้บริการกับเรา?</h4>
                                <ul className="space-y-2 text-sm text-gray-600">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle fill="currentColor" className="text-green-500 mt-0.5 shrink-0" />
                                        <span>ไม่ต้องลางาน ไม่ต้องไปขนส่งเอง</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle fill="currentColor" className="text-green-500 mt-0.5 shrink-0" />
                                        <span>ดำเนินการโดยทีมงานมืออาชีพ</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle fill="currentColor" className="text-green-500 mt-0.5 shrink-0" />
                                        <span>อัปเดตสถานะให้ทราบทุกขั้นตอน</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle fill="currentColor" className="text-green-500 mt-0.5 shrink-0" />
                                        <span>จัดส่งเล่มคืนถึงมือคุณ</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-gray-700 text-white p-6 rounded-2xl">
                                <h4 className="font-bold mb-2">ต้องการความช่วยเหลือ?</h4>
                                <p className="text-gray-300 text-sm mb-4">โทรหาเราได้เลย เจ้าหน้าที่พร้อมให้คำปรึกษา</p>
                                <a href="tel:021234567" className="bg-white text-gray-700 px-4 py-2 rounded-lg font-bold text-sm inline-flex items-center gap-2 hover:bg-gray-100 transition">
                                    <Phone fill="currentColor" /> 02-123-4567
                                </a>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
