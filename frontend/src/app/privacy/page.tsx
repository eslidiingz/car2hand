import React from 'react';
import Link from 'next/link';
import { Shield, Mail } from 'lucide-react';

export const metadata = {
    title: 'นโยบายความเป็นส่วนตัว | Car2Hand',
    description: 'นโยบายความเป็นส่วนตัวของ Car2Hand แพลตฟอร์มซื้อขายรถมือสอง',
};

export default function PrivacyPage() {
    return (
        <div className="bg-surface min-h-screen py-10">
            <div className="container mx-auto max-w-4xl px-4">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                            <Shield className="text-primary" size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                                นโยบายความเป็นส่วนตัว
                            </h1>
                            <p className="text-sm text-gray-500">Privacy Policy</p>
                        </div>
                    </div>

                    <p className="text-sm text-gray-500 mb-8">
                        ปรับปรุงล่าสุด: 14 เมษายน 2569
                    </p>

                    <div className="prose prose-sm max-w-none text-gray-700 space-y-6">
                        <section>
                            <p className="leading-relaxed">
                                Car2Hand เราให้ความสำคัญกับความเป็นส่วนตัวของผู้ใช้งาน
                                นโยบายนี้อธิบายวิธีที่เรารวบรวม ใช้งาน จัดเก็บ และคุ้มครองข้อมูลส่วนบุคคลของคุณ
                                เมื่อใช้งานเว็บไซต์และบริการของ Car2Hand
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-gray-800 mb-3">
                                1. ข้อมูลที่เรารวบรวม
                            </h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>
                                    <strong>ข้อมูลบัญชีผู้ใช้</strong>: ชื่อ-นามสกุล อีเมล เบอร์โทรศัพท์ รหัสผ่าน (เข้ารหัสตามมาตรฐานความปลอดภัย)
                                </li>
                                <li>
                                    <strong>ข้อมูลจากการเข้าสู่ระบบด้วยโซเชียลมีเดีย</strong>: เมื่อคุณเข้าสู่ระบบผ่าน LINE, Google
                                    หรือ Facebook เราจะรับข้อมูลพื้นฐาน เช่น ชื่อ อีเมล และ User ID เฉพาะจากผู้ให้บริการนั้น ๆ
                                </li>
                                <li>
                                    <strong>ข้อมูลประกาศขายรถ</strong>: รายละเอียดรถยนต์ รูปภาพ ราคา ตำแหน่ง และข้อมูลติดต่อ
                                </li>
                                <li>
                                    <strong>ข้อมูลการใช้งาน</strong>: IP Address, ประเภทอุปกรณ์, เบราว์เซอร์, หน้าที่เข้าชม, เวลาที่เข้าใช้งาน
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-gray-800 mb-3">
                                2. วัตถุประสงค์ในการใช้ข้อมูล
                            </h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>เพื่อสร้างและจัดการบัญชีผู้ใช้งาน</li>
                                <li>เพื่อให้บริการซื้อขาย ลงประกาศ และฟีเจอร์ต่าง ๆ บนแพลตฟอร์ม</li>
                                <li>เพื่อยืนยันตัวตน ป้องกันการปลอมแปลง และรักษาความปลอดภัยของระบบ</li>
                                <li>เพื่อปรับปรุงการบริการและสร้างประสบการณ์ที่ดีขึ้น</li>
                                <li>เพื่อติดต่อสื่อสารกับผู้ใช้งาน เช่น แจ้งเตือน การยืนยัน และการสนับสนุน</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-gray-800 mb-3">
                                3. การแชร์ข้อมูลกับบุคคลที่สาม
                            </h2>
                            <p className="leading-relaxed mb-2">
                                เราจะไม่ขายหรือให้เช่าข้อมูลส่วนบุคคลของคุณแก่บุคคลที่สาม ยกเว้นในกรณีต่อไปนี้:
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>ผู้ให้บริการที่ช่วยเราดำเนินการ เช่น Cloud hosting, การชำระเงิน</li>
                                <li>เมื่อได้รับความยินยอมจากคุณ</li>
                                <li>เมื่อกฎหมายกำหนดหรือเพื่อปฏิบัติตามคำสั่งศาล</li>
                                <li>เพื่อปกป้องสิทธิ์ ทรัพย์สิน และความปลอดภัยของ Car2Hand และผู้ใช้งานรายอื่น</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-gray-800 mb-3">
                                4. การจัดเก็บและความปลอดภัย
                            </h2>
                            <p className="leading-relaxed">
                                เราจัดเก็บข้อมูลในเซิร์ฟเวอร์ที่มีการเข้ารหัสและมีมาตรการรักษาความปลอดภัยตามมาตรฐาน OWASP
                                รหัสผ่านถูกเข้ารหัสตามมาตรฐานความปลอดภัย และข้อมูลระหว่างการส่งถูกเข้ารหัสผ่าน HTTPS
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-gray-800 mb-3">
                                5. สิทธิ์ของเจ้าของข้อมูล
                            </h2>
                            <p className="leading-relaxed mb-2">ภายใต้ PDPA คุณมีสิทธิ์ดังนี้:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>สิทธิ์ในการเข้าถึงและขอสำเนาข้อมูลของคุณ</li>
                                <li>สิทธิ์ในการแก้ไขข้อมูลให้ถูกต้อง</li>
                                <li>สิทธิ์ในการลบข้อมูล (ดูรายละเอียดที่{' '}
                                    <Link href="/data-deletion" className="text-primary font-semibold hover:underline">
                                        หน้าขอลบข้อมูลผู้ใช้
                                    </Link>)
                                </li>
                                <li>สิทธิ์ในการคัดค้านหรือระงับการประมวลผลข้อมูล</li>
                                <li>สิทธิ์ในการถอนความยินยอม</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-gray-800 mb-3">
                                6. คุกกี้ (Cookies)
                            </h2>
                            <p className="leading-relaxed">
                                เราใช้คุกกี้เพื่อจดจำการเข้าสู่ระบบและปรับปรุงประสบการณ์การใช้งาน
                                คุณสามารถตั้งค่าเบราว์เซอร์ให้ปิดการใช้งานคุกกี้ได้ แต่อาจส่งผลต่อการใช้งานบางฟีเจอร์
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-gray-800 mb-3">
                                7. การเปลี่ยนแปลงนโยบาย
                            </h2>
                            <p className="leading-relaxed">
                                เราอาจปรับปรุงนโยบายนี้เป็นครั้งคราว โดยจะแจ้งให้ทราบผ่านเว็บไซต์
                                การใช้งานบริการต่อไปหลังการปรับปรุงถือว่าคุณยอมรับนโยบายฉบับใหม่
                            </p>
                        </section>

                        <section className="bg-primary/5 rounded-2xl p-6 mt-8">
                            <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <Mail size={20} className="text-primary" />
                                ติดต่อเรา
                            </h2>
                            <p className="leading-relaxed mb-2">
                                หากมีคำถามเกี่ยวกับนโยบายความเป็นส่วนตัวหรือการใช้ข้อมูล กรุณาติดต่อ:
                            </p>
                            <p className="font-semibold text-gray-800">
                                อีเมล: <a href="mailto:support@car2hand.app" className="text-primary hover:underline">support@car2hand.app</a>
                            </p>
                        </section>

                        <section className="border-t border-gray-100 pt-6 mt-8 flex flex-wrap gap-3">
                            <Link
                                href="/data-deletion"
                                className="inline-flex items-center gap-2 px-5 py-3 bg-gray-50 text-gray-700 border border-gray-200 rounded-xl font-semibold hover:bg-gray-100 transition"
                            >
                                ขอลบข้อมูลบัญชีของคุณ
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
