import React from 'react';
import Link from 'next/link';
import { Trash2, Mail, AlertCircle, CheckSquare, Clock } from 'lucide-react';

export const metadata = {
    title: 'ขอลบข้อมูลบัญชีผู้ใช้ | Car2Hand',
    description: 'วิธีขอลบข้อมูลบัญชีและข้อมูลส่วนบุคคลของคุณจาก Car2Hand',
};

export default function DataDeletionPage() {
    return (
        <div className="bg-surface min-h-screen py-10">
            <div className="container mx-auto max-w-4xl px-4">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center">
                            <Trash2 className="text-red-500" size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                                ขอลบข้อมูลบัญชีผู้ใช้
                            </h1>
                            <p className="text-sm text-gray-500">User Data Deletion Request</p>
                        </div>
                    </div>

                    <p className="text-sm text-gray-500 mb-8">
                        ปรับปรุงล่าสุด: 14 เมษายน 2569
                    </p>

                    <div className="prose prose-sm max-w-none text-gray-700 space-y-6">
                        <section>
                            <p className="leading-relaxed">
                                Car2Hand เคารพสิทธิ์ของคุณในการควบคุมข้อมูลส่วนบุคคล
                                คุณสามารถขอให้ลบข้อมูลบัญชีและข้อมูลที่เกี่ยวข้องทั้งหมดจากระบบของเราได้ตลอดเวลา
                                หน้านี้อธิบายขั้นตอนและข้อมูลที่จะถูกลบ
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <CheckSquare size={20} className="text-primary" />
                                ข้อมูลที่จะถูกลบ
                            </h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>ข้อมูลบัญชีผู้ใช้ (ชื่อ อีเมล เบอร์โทรศัพท์ รหัสผ่าน)</li>
                                <li>ข้อมูลเชื่อมต่อกับ LINE, Google และ Facebook</li>
                                <li>ประกาศขายรถที่คุณลงไว้ทั้งหมด</li>
                                <li>รายการโปรด (Wishlist) และรายการในโรงรถ (Garage)</li>
                                <li>ข้อความและกระทู้ในชุมชน (Community)</li>
                                <li>โปรไฟล์ผู้ขาย (Seller Profile) หากมี</li>
                                <li>ประวัติการทำธุรกรรมและประวัติการใช้งาน</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-gray-800 mb-3">
                                วิธีที่ 1: ลบบัญชีผ่านหน้าการตั้งค่า
                            </h2>
                            <ol className="list-decimal pl-6 space-y-2">
                                <li>เข้าสู่ระบบบัญชี Car2Hand ของคุณ</li>
                                <li>ไปที่{' '}
                                    <Link href="/profile/settings" className="text-primary font-semibold hover:underline">
                                        โปรไฟล์ &gt; ตั้งค่า
                                    </Link>
                                </li>
                                <li>เลือกเมนู &quot;ลบบัญชี&quot; และยืนยันตัวตน</li>
                                <li>ข้อมูลของคุณจะถูกลบออกจากระบบภายใน 30 วัน</li>
                            </ol>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-gray-800 mb-3">
                                วิธีที่ 2: ส่งคำขอทางอีเมล
                            </h2>
                            <p className="leading-relaxed mb-3">
                                หากไม่สามารถเข้าสู่ระบบได้ หรือเข้าสู่ระบบด้วย Facebook/Google/LINE และต้องการลบข้อมูล
                                โปรดส่งอีเมลมาที่{' '}
                                <a href="mailto:support@car2hand.app" className="text-primary font-semibold hover:underline">
                                    support@car2hand.app
                                </a>{' '}
                                พร้อมรายละเอียดต่อไปนี้:
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>หัวข้ออีเมล: &quot;ขอลบข้อมูลบัญชี Car2Hand&quot;</li>
                                <li>ชื่อ-นามสกุลที่ใช้ลงทะเบียน</li>
                                <li>อีเมลหรือเบอร์โทรศัพท์ที่ใช้สมัคร</li>
                                <li>วิธีการเข้าสู่ระบบ (Email, LINE, Google หรือ Facebook)</li>
                                <li>เหตุผลที่ต้องการลบข้อมูล (ไม่บังคับ)</li>
                            </ul>
                        </section>

                        <section className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
                            <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <Clock size={20} className="text-yellow-600" />
                                ระยะเวลาดำเนินการ
                            </h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>เราจะตอบกลับภายใน <strong>3 วันทำการ</strong> หลังได้รับคำขอ</li>
                                <li>ข้อมูลจะถูกลบออกจากระบบภายใน <strong>30 วัน</strong></li>
                                <li>
                                    ข้อมูลสำรอง (Backup) จะถูกลบภายใน <strong>90 วัน</strong>{' '}
                                    ตามรอบการลบ Backup ปกติ
                                </li>
                            </ul>
                        </section>

                        <section className="bg-red-50 border border-red-200 rounded-2xl p-6">
                            <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <AlertCircle size={20} className="text-red-600" />
                                ข้อควรทราบ
                            </h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>
                                    การลบข้อมูลเป็นการกระทำที่<strong>ไม่สามารถย้อนกลับได้</strong>
                                </li>
                                <li>
                                    ประกาศและข้อความที่ถูกแสดงในพื้นที่สาธารณะอาจถูกแคชโดยเครื่องมือค้นหา
                                    (Search Engine) ซึ่งอยู่นอกเหนือการควบคุมของเรา
                                </li>
                                <li>
                                    เราอาจเก็บข้อมูลบางส่วนไว้ตามกฎหมาย เช่น
                                    ข้อมูลการทำธุรกรรมที่ต้องเก็บตามกฎหมายภาษีอากร (ไม่เกิน 5 ปี)
                                </li>
                                <li>
                                    หลังการลบบัญชี คุณจะไม่สามารถเข้าสู่ระบบหรือกู้คืนข้อมูลเดิมได้
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-gray-800 mb-3">
                                การลบข้อมูลสำหรับผู้ใช้ที่เข้าสู่ระบบผ่าน Facebook
                            </h2>
                            <p className="leading-relaxed">
                                หากคุณเข้าสู่ระบบ Car2Hand ด้วย Facebook และต้องการยกเลิกการเชื่อมต่อหรือลบข้อมูล คุณสามารถ:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 mt-2">
                                <li>
                                    ไปที่ Facebook &gt; Settings &amp; Privacy &gt; Settings &gt; Apps and Websites
                                    แล้วนำ Car2Hand ออกจากรายการ
                                </li>
                                <li>
                                    หรือส่งคำขอลบข้อมูลตามวิธีที่ 1 หรือวิธีที่ 2 ข้างต้น
                                </li>
                            </ul>
                        </section>

                        <section className="bg-primary/5 rounded-2xl p-6 mt-8">
                            <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <Mail size={20} className="text-primary" />
                                ติดต่อเจ้าหน้าที่
                            </h2>
                            <p className="leading-relaxed mb-2">
                                มีคำถามเกี่ยวกับการลบข้อมูลหรือต้องการความช่วยเหลือ:
                            </p>
                            <p className="font-semibold text-gray-800">
                                อีเมล:{' '}
                                <a
                                    href="mailto:support@car2hand.app"
                                    className="text-primary hover:underline"
                                >
                                    support@car2hand.app
                                </a>
                            </p>
                        </section>

                        <section className="border-t border-gray-100 pt-6 mt-8 flex flex-wrap gap-3">
                            <Link
                                href="/privacy"
                                className="inline-flex items-center gap-2 px-5 py-3 bg-gray-50 text-gray-700 border border-gray-200 rounded-xl font-semibold hover:bg-gray-100 transition"
                            >
                                นโยบายความเป็นส่วนตัว
                            </Link>
                            <Link
                                href="/terms"
                                className="inline-flex items-center gap-2 px-5 py-3 bg-gray-50 text-gray-700 border border-gray-200 rounded-xl font-semibold hover:bg-gray-100 transition"
                            >
                                เงื่อนไขการให้บริการ
                            </Link>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
