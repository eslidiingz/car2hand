"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
    Mail,
    Phone,
    MapPin,
    Clock,
    MessageCircle,
    Send,
    Loader2,
    CheckCircle,
    AlertCircle,
    HelpCircle,
    User,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const SUBJECTS = [
    { value: '', label: '-- เลือกหัวข้อ --' },
    { value: 'general', label: 'สอบถามทั่วไป' },
    { value: 'account', label: 'ปัญหาการใช้งานบัญชี' },
    { value: 'listing', label: 'ปัญหาประกาศขายรถ' },
    { value: 'payment', label: 'การชำระเงินและแพ็กเกจ' },
    { value: 'partner', label: 'เป็นพันธมิตรทางธุรกิจ' },
    { value: 'feedback', label: 'ข้อเสนอแนะ/รายงานปัญหา' },
    { value: 'other', label: 'อื่น ๆ' },
];

export default function ContactPage() {
    const [form, setForm] = useState({
        name: '',
        email: '',
        phoneNumber: '',
        subject: '',
        message: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        if (name === 'phoneNumber') {
            setForm((prev) => ({ ...prev, phoneNumber: value.replace(/\D/g, '').slice(0, 10) }));
        } else {
            setForm((prev) => ({ ...prev, [name]: value }));
        }
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Client-side checks
        if (form.name.trim().length < 2) {
            setError('กรุณากรอกชื่อของคุณ (อย่างน้อย 2 ตัวอักษร)');
            return;
        }
        if (!/\S+@\S+\.\S+/.test(form.email)) {
            setError('กรุณากรอกอีเมลที่ถูกต้อง');
            return;
        }
        if (!form.subject) {
            setError('กรุณาเลือกหัวข้อ');
            return;
        }
        if (form.message.trim().length < 10) {
            setError('กรุณากรอกข้อความอย่างน้อย 10 ตัวอักษร');
            return;
        }

        setIsLoading(true);
        try {
            const subjectLabel = SUBJECTS.find((s) => s.value === form.subject)?.label || form.subject;
            const res = await fetch(`${API_URL}/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: form.name.trim(),
                    email: form.email.trim(),
                    phoneNumber: form.phoneNumber,
                    subject: subjectLabel,
                    message: form.message.trim(),
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || data.error || 'ไม่สามารถส่งข้อความได้');
            }
            setSuccess(true);
            setForm({ name: '', email: '', phoneNumber: '', subject: '', message: '' });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด กรุณาลองใหม่');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-surface min-h-screen">
            {/* Hero */}
            <section className="bg-gradient-to-br from-primary to-primary/80 text-white py-14">
                <div className="container mx-auto max-w-4xl px-4 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur rounded-2xl mb-4">
                        <MessageCircle size={32} />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-3">ติดต่อเรา</h1>
                    <p className="text-white/80 text-sm md:text-base max-w-xl mx-auto">
                        มีคำถาม ข้อเสนอแนะ หรือต้องการความช่วยเหลือ?
                        ทีมงาน Car2Hand ยินดีให้บริการทุกวันทำการ
                    </p>
                </div>
            </section>

            {/* Info Cards */}
            <section className="container mx-auto max-w-6xl px-4 -mt-10 mb-12 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-3">
                            <Mail size={22} />
                        </div>
                        <h3 className="font-bold text-gray-800 mb-1">อีเมล</h3>
                        <a
                            href="mailto:support@car2hand.app"
                            className="text-sm text-primary hover:underline break-all"
                        >
                            support@car2hand.app
                        </a>
                        <p className="text-xs text-gray-500 mt-1">ตอบกลับภายใน 1-2 วันทำการ</p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-3">
                            <Phone size={22} />
                        </div>
                        <h3 className="font-bold text-gray-800 mb-1">โทรศัพท์</h3>
                        <a
                            href="tel:+6620000000"
                            className="text-sm text-primary hover:underline"
                        >
                            02-000-0000
                        </a>
                        <p className="text-xs text-gray-500 mt-1">จันทร์–เสาร์ 9:00–18:00</p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center mb-3">
                            <Clock size={22} />
                        </div>
                        <h3 className="font-bold text-gray-800 mb-1">เวลาทำการ</h3>
                        <p className="text-sm text-gray-700 font-medium">จันทร์–เสาร์</p>
                        <p className="text-xs text-gray-500 mt-1">9:00 – 18:00 น. (หยุดวันอาทิตย์)</p>
                    </div>
                </div>
            </section>

            {/* Main Grid: Form + Side */}
            <section className="container mx-auto max-w-6xl px-4 pb-16">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
                            <div className="mb-6">
                                <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-1">
                                    ส่งข้อความถึงเรา
                                </h2>
                                <p className="text-sm text-gray-500">
                                    กรอกแบบฟอร์มด้านล่าง ทีมงานจะติดต่อกลับโดยเร็วที่สุด
                                </p>
                            </div>

                            {success ? (
                                <div className="text-center py-10">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle className="text-green-500" size={36} />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                                        ส่งข้อความเรียบร้อย
                                    </h3>
                                    <p className="text-sm text-gray-500 mb-6">
                                        ขอบคุณที่ติดต่อ Car2Hand
                                        <br />
                                        ทีมงานจะตอบกลับไปยังอีเมลที่คุณให้ไว้ภายใน 1-2 วันทำการ
                                    </p>
                                    <button
                                        onClick={() => setSuccess(false)}
                                        className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-opacity-90 transition"
                                    >
                                        ส่งข้อความใหม่
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {error && (
                                        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                                            <AlertCircle className="flex-shrink-0" size={18} />
                                            <span>{error}</span>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-600 mb-1 ml-1">
                                                ชื่อ–นามสกุล <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <User
                                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                                    size={18}
                                                />
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={form.name}
                                                    onChange={handleChange}
                                                    placeholder="สมชาย รักรถ"
                                                    className="form-input-icon-sm"
                                                    disabled={isLoading}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-600 mb-1 ml-1">
                                                เบอร์โทร (ไม่บังคับ)
                                            </label>
                                            <div className="relative">
                                                <Phone
                                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                                    size={18}
                                                />
                                                <input
                                                    type="tel"
                                                    inputMode="numeric"
                                                    name="phoneNumber"
                                                    value={form.phoneNumber}
                                                    onChange={handleChange}
                                                    placeholder="08XXXXXXXX"
                                                    className="form-input-icon-sm"
                                                    maxLength={10}
                                                    disabled={isLoading}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1 ml-1">
                                            อีเมล <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <Mail
                                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                                size={18}
                                            />
                                            <input
                                                type="email"
                                                name="email"
                                                value={form.email}
                                                onChange={handleChange}
                                                placeholder="name@example.com"
                                                className="form-input-icon-sm"
                                                disabled={isLoading}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1 ml-1">
                                            หัวข้อ <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            name="subject"
                                            value={form.subject}
                                            onChange={handleChange}
                                            className="form-select"
                                            disabled={isLoading}
                                        >
                                            {SUBJECTS.map((s) => (
                                                <option key={s.value} value={s.value}>
                                                    {s.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1 ml-1">
                                            ข้อความ <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            name="message"
                                            value={form.message}
                                            onChange={handleChange}
                                            placeholder="บอกเล่ารายละเอียดที่คุณต้องการให้เราช่วย..."
                                            className="form-textarea min-h-[150px]"
                                            rows={6}
                                            disabled={isLoading}
                                            maxLength={5000}
                                        />
                                        <p className="text-xs text-gray-400 text-right mt-1">
                                            {form.message.length} / 5000
                                        </p>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-opacity-90 transition shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="animate-spin" size={18} />
                                                <span>กำลังส่ง...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Send size={18} />
                                                <span>ส่งข้อความ</span>
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>

                    {/* Side column */}
                    <div className="space-y-6">
                        {/* Office */}
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <MapPin size={18} className="text-primary" />
                                ออฟฟิศ Car2Hand
                            </h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                888 อาคารไอทีเซ็นเตอร์ ชั้น 12
                                <br />
                                ถนนพระราม 9 แขวงห้วยขวาง
                                <br />
                                เขตห้วยขวาง กรุงเทพฯ 10310
                            </p>
                        </div>

                        {/* Help Link */}
                        <div className="bg-gradient-to-br from-primary to-primary/90 text-white rounded-3xl p-6 shadow-xl">
                            <HelpCircle size={28} className="mb-3 opacity-80" />
                            <h3 className="font-bold mb-1">ลองดูคำถามที่พบบ่อย</h3>
                            <p className="text-sm text-white/80 mb-4 leading-relaxed">
                                คำตอบเรื่องการลงขาย การซื้อรถ แพ็กเกจ และอื่น ๆ
                                อาจอยู่ในศูนย์ช่วยเหลือแล้ว
                            </p>
                            <Link
                                href="/help"
                                className="inline-flex items-center gap-2 bg-white text-primary px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-100 transition"
                            >
                                ศูนย์ช่วยเหลือ
                            </Link>
                        </div>

                        {/* Social */}
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                            <h3 className="font-bold text-gray-800 mb-4">ติดตามเรา</h3>
                            <div className="space-y-2">
                                <a
                                    href="#"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition"
                                >
                                    <div className="w-10 h-10 bg-[#06C755] rounded-xl flex items-center justify-center text-white">
                                        <MessageCircle size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-800">LINE Official</p>
                                        <p className="text-xs text-gray-500">@car2hand</p>
                                    </div>
                                </a>
                                <a
                                    href="#"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition"
                                >
                                    <div className="w-10 h-10 bg-[#1877F2] rounded-xl flex items-center justify-center text-white font-bold text-lg">
                                        f
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-800">Facebook</p>
                                        <p className="text-xs text-gray-500">facebook.com/car2hand</p>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
