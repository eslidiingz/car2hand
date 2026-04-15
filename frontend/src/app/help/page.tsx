"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
    HelpCircle,
    Search,
    UserPlus,
    Car,
    ShoppingCart,
    CreditCard,
    Shield,
    Users,
    Mail,
    MessageCircle,
    ChevronDown,
    Wrench,
    Sparkles,
} from 'lucide-react';

interface FaqItem {
    q: string;
    a: React.ReactNode;
}

interface FaqCategory {
    id: string;
    title: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    color: string;
    items: FaqItem[];
}

const CATEGORIES: FaqCategory[] = [
    {
        id: 'account',
        title: 'บัญชีผู้ใช้',
        icon: UserPlus,
        color: 'bg-blue-50 text-blue-600',
        items: [
            {
                q: 'สมัครสมาชิก Car2Hand อย่างไร?',
                a: (
                    <>
                        กดปุ่ม &quot;สมัครสมาชิก&quot; ที่มุมขวาบนของเว็บไซต์
                        คุณสามารถเลือกสมัครด้วยอีเมล+เบอร์โทร
                        หรือใช้บัญชี LINE, Google, Facebook ก็ได้ — ใช้เวลาไม่ถึง 1 นาที
                    </>
                ),
            },
            {
                q: 'ลืมรหัสผ่านทำอย่างไร?',
                a: (
                    <>
                        คลิก &quot;ลืมรหัสผ่าน?&quot; ในหน้าเข้าสู่ระบบ
                        ระบบจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ไปยังอีเมลที่ลงทะเบียนไว้
                        หากเข้าสู่ระบบผ่านโซเชียลมีเดีย ไม่จำเป็นต้องใช้รหัสผ่าน
                    </>
                ),
            },
            {
                q: 'เปลี่ยนข้อมูลส่วนตัวหรือเบอร์โทรได้ที่ไหน?',
                a: (
                    <>
                        เข้าไปที่{' '}
                        <Link href="/profile/settings" className="text-primary font-semibold hover:underline">
                            โปรไฟล์ &gt; ตั้งค่า
                        </Link>{' '}
                        คุณสามารถแก้ไขชื่อ เบอร์โทร อีเมล และรูปโปรไฟล์ได้
                    </>
                ),
            },
            {
                q: 'ต้องการลบบัญชีทำอย่างไร?',
                a: (
                    <>
                        ดูขั้นตอนที่{' '}
                        <Link href="/data-deletion" className="text-primary font-semibold hover:underline">
                            หน้าขอลบข้อมูลบัญชี
                        </Link>{' '}
                        หรือส่งคำขอมาที่ support@car2hand.com
                    </>
                ),
            },
        ],
    },
    {
        id: 'sell',
        title: 'การลงขายรถ',
        icon: Car,
        color: 'bg-orange-50 text-orange-600',
        items: [
            {
                q: 'ลงประกาศขายรถฟรีได้ไหม?',
                a: 'การลงประกาศขั้นพื้นฐานไม่มีค่าใช้จ่าย สามารถลงได้ฟรีตามจำนวนที่กำหนดในแต่ละแพ็กเกจ',
            },
            {
                q: 'ประกาศแสดงอยู่นานเท่าไหร่?',
                a: 'ประกาศฟรีแสดงได้ 30 วัน สามารถต่ออายุได้ทุกเมื่อ หรือเลือกซื้อแพ็กเกจเพื่อให้ประกาศอยู่นานขึ้นและเพิ่มการมองเห็น',
            },
            {
                q: 'รูปภาพต้องเป็นแบบไหน?',
                a: 'ใช้รูปรถคันจริง ถ่ายชัดในสภาพแสงที่ดี แนะนำให้ถ่ายทั้งภายนอก ภายใน ห้องเครื่อง และเลขไมล์ เพื่อสร้างความน่าเชื่อถือ',
            },
            {
                q: 'แพ็กเกจแต่ละแบบต่างกันอย่างไร?',
                a: (
                    <>
                        ดูรายละเอียดแพ็กเกจได้ที่{' '}
                        <Link href="/profile/packages" className="text-primary font-semibold hover:underline">
                            หน้าแพ็กเกจ
                        </Link>{' '}
                        มีแพ็กเกจ Standard, Professional และ Premium ให้เลือกตามความต้องการ
                    </>
                ),
            },
            {
                q: 'ขายรถสำเร็จแล้วต้องทำอย่างไร?',
                a: 'กดปิดประกาศในหน้าจัดการประกาศของคุณ หรือลบประกาศออกจากระบบเพื่อไม่ให้มีผู้ติดต่อเพิ่มเติม',
            },
        ],
    },
    {
        id: 'buy',
        title: 'การซื้อรถ',
        icon: ShoppingCart,
        color: 'bg-green-50 text-green-600',
        items: [
            {
                q: 'ติดต่อผู้ขายได้อย่างไร?',
                a: 'กดที่ปุ่ม "ติดต่อผู้ขาย" ในหน้าประกาศ คุณสามารถโทร แชทผ่าน LINE หรือการติดต่อที่ผู้ขายลงข้อมูลไว้',
            },
            {
                q: 'จะรู้ได้อย่างไรว่าผู้ขายน่าเชื่อถือ?',
                a: 'ดูป้าย Verified บนโปรไฟล์ จำนวนประกาศที่ขายสำเร็จ และรูปภาพรถที่ชัดเจน แนะนำให้ตรวจสอบรถด้วยตัวเองก่อนตัดสินใจเสมอ',
            },
            // {
            //     q: 'มีบริการตรวจสภาพรถก่อนซื้อไหม?',
            //     a: (
            //         <>
            //             ดูรายละเอียดได้ที่{' '}
            //             <Link href="/services/inspection" className="text-primary font-semibold hover:underline">
            //                 บริการตรวจสภาพรถ
            //             </Link>{' '}
            //             ทีมช่างมืออาชีพจะประเมินสภาพรถให้คุณก่อนตัดสินใจซื้อ
            //         </>
            //     ),
            // },
            {
                q: 'เปรียบเทียบรถหลายคันได้ไหม?',
                a: 'สามารถกดปุ่ม "เปรียบเทียบ" บนการ์ดประกาศ คุณสามารถเปรียบเทียบได้สูงสุด 5 คันพร้อมกัน',
            },
            // {
            //     q: 'ต้องการบริการสินเชื่อ/ประกันรถ?',
            //     a: (
            //         <>
            //             Car2Hand ร่วมมือกับพาร์ทเนอร์ชั้นนำ ดูรายละเอียดที่{' '}
            //             <Link href="/services/finance" className="text-primary font-semibold hover:underline">
            //                 บริการสินเชื่อและประกัน
            //             </Link>
            //         </>
            //     ),
            // },
        ],
    },
    {
        id: 'payment',
        title: 'การชำระเงิน',
        icon: CreditCard,
        color: 'bg-purple-50 text-purple-600',
        items: [
            {
                q: 'รับชำระเงินช่องทางใดบ้าง?',
                a: 'รับชำระผ่านการโอนธนาคารและ PromptPay หลังซื้อแพ็กเกจ ระบบจะแสดงข้อมูลบัญชีและ QR Code ให้สแกนจ่าย',
            },
            {
                q: 'ชำระเงินแล้วกี่วันประกาศจะอัพเกรด?',
                a: 'หลังแนบสลิปการชำระเงินเรียบร้อย ทีมงานจะตรวจสอบและอัพเกรดประกาศภายใน 24 ชั่วโมง (วันทำการ)',
            },
            {
                q: 'ขอคืนเงินได้ไหม?',
                a: 'ค่าบริการที่ชำระแล้วไม่สามารถขอคืนได้ ยกเว้นกรณีที่ระบบมีข้อผิดพลาด กรุณาติดต่อ support@car2hand.com เพื่อตรวจสอบ',
            },
            // {
            //     q: 'ออกใบเสร็จ/ใบกำกับภาษีได้ไหม?',
            //     a: 'ได้ครับ กรุณาส่งข้อมูลบริษัทและเลขประจำตัวผู้เสียภาษีมาที่ support@car2hand.com พร้อมแนบหลักฐานการชำระเงิน',
            // },
        ],
    },
    {
        id: 'safety',
        title: 'ความปลอดภัย',
        icon: Shield,
        color: 'bg-red-50 text-red-600',
        items: [
            {
                q: 'จะหลีกเลี่ยงการถูกหลอกได้อย่างไร?',
                a: 'ตรวจสอบรถและเอกสารด้วยตัวเองเสมอ พบกันในที่สาธารณะ อย่าโอนเงินก่อนเห็นรถจริง และระมัดระวังราคาที่ต่ำผิดปกติ',
            },
            {
                q: 'พบประกาศต้องสงสัยรายงานได้ที่ไหน?',
                a: 'กดปุ่ม "รายงาน" บนประกาศที่สงสัย หรือส่งอีเมลมาที่ support@car2hand.com ทีมงานจะตรวจสอบภายใน 24 ชั่วโมง',
            },
            {
                q: 'ข้อมูลส่วนตัวของฉันปลอดภัยไหม?',
                a: (
                    <>
                        เราใช้มาตรฐาน OWASP ในการรักษาความปลอดภัย ข้อมูลเข้ารหัสผ่าน HTTPS อ่านเพิ่มเติมที่{' '}
                        <Link href="/privacy" className="text-primary font-semibold hover:underline">
                            นโยบายความเป็นส่วนตัว
                        </Link>
                    </>
                ),
            },
        ],
    },
    {
        id: 'community',
        title: 'ชุมชนและกูรู',
        icon: Users,
        color: 'bg-amber-50 text-amber-600',
        items: [
            {
                q: 'กูรู (Guru) คือใคร?',
                a: 'กูรูคือสมาชิกที่มีความเชี่ยวชาญด้านรถยนต์และช่วยตอบคำถามในชุมชน มี reputation score จากการช่วยเหลือผู้อื่นที่วัดได้',
            },
            {
                q: 'ถามคำถามในชุมชนอย่างไร?',
                a: (
                    <>
                        ไปที่{' '}
                        <Link href="/community" className="text-primary font-semibold hover:underline">
                            หน้าชุมชน
                        </Link>{' '}
                        แล้วกดปุ่ม &quot;สร้างกระทู้ใหม่&quot; เลือกหมวดที่ตรงกับคำถามเพื่อให้ได้คำตอบรวดเร็ว
                    </>
                ),
            },
            {
                q: 'สะสมคะแนน reputation อย่างไร?',
                a: 'ตอบคำถามที่เป็นประโยชน์ ได้รับ upvote จากสมาชิกคนอื่น เข้าร่วมกิจกรรมของชุมชน และมีคำตอบที่ถูกเลือกเป็น "คำตอบดีที่สุด"',
            },
        ],
    },
];

export default function HelpPage() {
    const [query, setQuery] = useState('');
    const [openItem, setOpenItem] = useState<string | null>(null);

    const normalized = query.trim().toLowerCase();
    const filtered = CATEGORIES.map((cat) => ({
        ...cat,
        items: normalized
            ? cat.items.filter(
                  (it) =>
                      it.q.toLowerCase().includes(normalized) ||
                      (typeof it.a === 'string' && it.a.toLowerCase().includes(normalized))
              )
            : cat.items,
    })).filter((cat) => cat.items.length > 0);

    return (
        <div className="bg-surface min-h-screen">
            {/* Hero */}
            <section className="bg-gradient-to-br from-primary to-primary/80 text-white py-14">
                <div className="container mx-auto max-w-4xl px-4 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur rounded-2xl mb-4">
                        <HelpCircle size={32} />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-3">ศูนย์ช่วยเหลือ</h1>
                    <p className="text-white/80 text-sm md:text-base mb-6">
                        เรารวบรวมคำถามที่พบบ่อยไว้ให้คุณ — หาคำตอบได้รวดเร็ว
                    </p>

                    {/* Search */}
                    <div className="relative max-w-xl mx-auto">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="ค้นหาคำถาม เช่น ลงประกาศ, แพ็กเกจ, ตรวจสภาพ..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 rounded-2xl text-gray-800 bg-white border-0 shadow-lg focus:outline-none focus:ring-4 focus:ring-white/30 text-sm"
                        />
                    </div>
                </div>
            </section>

            {/* Quick Links */}
            <section className="container mx-auto max-w-4xl px-4 -mt-8 mb-10 relative z-10">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Link
                        href="/sell"
                        className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition border border-gray-100 text-center"
                    >
                        <Sparkles className="text-accent mx-auto mb-2" size={22} />
                        <p className="text-sm font-semibold text-gray-800">ลงขายรถ</p>
                    </Link>
                    <Link
                        href="/services/inspection"
                        className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition border border-gray-100 text-center"
                    >
                        <Wrench className="text-blue-600 mx-auto mb-2" size={22} />
                        <p className="text-sm font-semibold text-gray-800">ตรวจสภาพรถ</p>
                    </Link>
                    <Link
                        href="/community"
                        className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition border border-gray-100 text-center"
                    >
                        <Users className="text-amber-600 mx-auto mb-2" size={22} />
                        <p className="text-sm font-semibold text-gray-800">ชุมชนกูรู</p>
                    </Link>
                    <Link
                        href="/contact"
                        className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition border border-gray-100 text-center"
                    >
                        <MessageCircle className="text-green-600 mx-auto mb-2" size={22} />
                        <p className="text-sm font-semibold text-gray-800">ติดต่อเรา</p>
                    </Link>
                </div>
            </section>

            {/* FAQ */}
            <section className="container mx-auto max-w-4xl px-4 pb-12">
                {filtered.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100">
                        <HelpCircle className="text-gray-300 mx-auto mb-3" size={48} />
                        <p className="text-gray-500">ไม่พบคำถามที่ตรงกับ &quot;{query}&quot;</p>
                        <p className="text-sm text-gray-400 mt-1">
                            ลองใช้คำอื่น หรือติดต่อทีมงานที่ support@car2hand.com
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {filtered.map((cat) => {
                            const Icon = cat.icon;
                            return (
                                <div
                                    key={cat.id}
                                    className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
                                >
                                    <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cat.color}`}>
                                            <Icon size={20} />
                                        </div>
                                        <h2 className="text-lg font-bold text-gray-800">{cat.title}</h2>
                                    </div>
                                    <div className="divide-y divide-gray-100">
                                        {cat.items.map((item, idx) => {
                                            const key = `${cat.id}-${idx}`;
                                            const isOpen = openItem === key;
                                            return (
                                                <div key={key}>
                                                    <button
                                                        onClick={() => setOpenItem(isOpen ? null : key)}
                                                        className="w-full p-5 flex items-center justify-between gap-3 text-left hover:bg-gray-50 transition"
                                                    >
                                                        <span className="font-semibold text-gray-800 text-sm md:text-base">
                                                            {item.q}
                                                        </span>
                                                        <ChevronDown
                                                            className={`flex-shrink-0 text-gray-400 transition-transform ${
                                                                isOpen ? 'rotate-180' : ''
                                                            }`}
                                                            size={20}
                                                        />
                                                    </button>
                                                    {isOpen && (
                                                        <div className="px-5 pb-5 text-sm text-gray-600 leading-relaxed">
                                                            {item.a}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* Contact CTA */}
            <section className="container mx-auto max-w-4xl px-4 pb-16">
                <div className="bg-gradient-to-br from-primary to-primary/90 text-white rounded-3xl p-8 md:p-10 shadow-xl text-center">
                    <Mail size={36} className="mx-auto mb-3 opacity-80" />
                    <h3 className="text-xl md:text-2xl font-bold mb-2">ยังไม่พบคำตอบที่ต้องการ?</h3>
                    <p className="text-white/80 text-sm mb-6">
                        ทีมงาน Car2Hand พร้อมช่วยเหลือคุณทุกวันทำการ จันทร์–เสาร์ 9:00–18:00
                    </p>
                    <div className="flex flex-wrap justify-center gap-3">
                        <Link
                            href="/contact"
                            className="inline-flex items-center gap-2 bg-white text-primary px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition shadow-lg"
                        >
                            <MessageCircle size={18} />
                            ติดต่อทีมงาน
                        </Link>
                        <a
                            href="mailto:support@car2hand.com"
                            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/30 text-white px-6 py-3 rounded-xl font-bold hover:bg-white/20 transition"
                        >
                            <Mail size={18} />
                            support@car2hand.com
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}
