import React from 'react';
import Link from 'next/link';
import { FileText, Mail } from 'lucide-react';

export const metadata = {
    title: 'เงื่อนไขการให้บริการ | Car2Hand',
    description: 'เงื่อนไขการให้บริการของ Car2Hand แพลตฟอร์มซื้อขายรถมือสอง',
};

export default function TermsPage() {
    return (
        <div className="bg-surface min-h-screen py-10">
            <div className="container mx-auto max-w-4xl px-4">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                            <FileText className="text-primary" size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                                เงื่อนไขการให้บริการ
                            </h1>
                            <p className="text-sm text-gray-500">Terms of Service</p>
                        </div>
                    </div>

                    <p className="text-sm text-gray-500 mb-8">
                        ปรับปรุงล่าสุด: 14 เมษายน 2569
                    </p>

                    <div className="prose prose-sm max-w-none text-gray-700 space-y-6">
                        <section>
                            <p className="leading-relaxed">
                                ยินดีต้อนรับสู่ Car2Hand (&quot;เรา&quot;, &quot;ของเรา&quot;, &quot;บริการ&quot;)
                                การใช้งานเว็บไซต์และบริการของเราถือว่าคุณยอมรับและตกลงปฏิบัติตามเงื่อนไขฉบับนี้
                                หากไม่ยอมรับ กรุณาหยุดใช้งานบริการ
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-gray-800 mb-3">
                                1. คำนิยาม
                            </h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>ผู้ใช้งาน</strong>: บุคคลที่สมัครสมาชิกหรือเข้าใช้งานบริการของ Car2Hand</li>
                                <li><strong>ผู้ขาย</strong>: ผู้ใช้งานที่ลงประกาศขายรถยนต์บนแพลตฟอร์ม</li>
                                <li><strong>ผู้ซื้อ</strong>: ผู้ใช้งานที่ติดต่อหรือซื้อรถจากประกาศของผู้ขาย</li>
                                <li><strong>ประกาศ</strong>: ข้อมูลรถยนต์ที่ผู้ขายลงบนแพลตฟอร์ม</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-gray-800 mb-3">
                                2. การใช้บริการ
                            </h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>ผู้ใช้งานต้องมีอายุ 18 ปีบริบูรณ์ขึ้นไป หรือได้รับความยินยอมจากผู้ปกครอง</li>
                                <li>ผู้ใช้งานต้องให้ข้อมูลที่ถูกต้องและเป็นปัจจุบันในการสมัครสมาชิก</li>
                                <li>ผู้ใช้งานต้องรักษารหัสผ่านและข้อมูลการเข้าสู่ระบบไว้เป็นความลับ</li>
                                <li>ห้ามใช้งานบัญชีของผู้อื่น หรืออนุญาตให้ผู้อื่นใช้งานบัญชีของตน</li>
                                <li>ผู้ใช้งานต้องรับผิดชอบต่อกิจกรรมทั้งหมดที่เกิดขึ้นภายใต้บัญชีของตน</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-gray-800 mb-3">
                                3. การลงประกาศขายรถ
                            </h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>ผู้ขายต้องลงประกาศเฉพาะรถที่ตนเป็นเจ้าของหรือมีสิทธิ์ในการขายเท่านั้น</li>
                                <li>ข้อมูลประกาศต้องถูกต้อง ตรงตามความเป็นจริง รวมถึงสภาพรถ เลขไมล์ ประวัติการใช้งาน และราคา</li>
                                <li>รูปภาพต้องเป็นรูปของรถคันจริง ไม่คัดลอกหรือใช้รูปของบุคคลอื่นโดยไม่ได้รับอนุญาต</li>
                                <li>ห้ามลงประกาศรถที่มีการดัดแปลงผิดกฎหมาย รถที่ถูกโจรกรรม หรือรถที่มีภาระผูกพันโดยไม่แจ้ง</li>
                                <li>Car2Hand สงวนสิทธิ์ในการลบประกาศที่ไม่เป็นไปตามเงื่อนไขโดยไม่ต้องแจ้งล่วงหน้า</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-gray-800 mb-3">
                                4. การห้ามกระทำ
                            </h2>
                            <p className="leading-relaxed mb-2">ห้ามผู้ใช้งานกระทำการดังนี้:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>ให้ข้อมูลเท็จ หลอกลวง หรือปลอมแปลงเอกสาร</li>
                                <li>ละเมิดทรัพย์สินทางปัญญาของผู้อื่น</li>
                                <li>ส่งข้อความสแปม โฆษณา หรือเนื้อหาที่ไม่เกี่ยวข้อง</li>
                                <li>โพสต์เนื้อหาที่ผิดกฎหมาย ลามก อนาจาร หรือสร้างความเกลียดชัง</li>
                                <li>พยายามเจาะระบบ เข้าถึงข้อมูลโดยไม่ได้รับอนุญาต หรือรบกวนการทำงานของระบบ</li>
                                <li>ใช้บอท สคริปต์ หรือเครื่องมืออัตโนมัติในการดึงข้อมูลจากแพลตฟอร์ม</li>
                                <li>หลีกเลี่ยงการชำระค่าบริการ หรือใช้วิธีการไม่สุจริตใด ๆ</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-gray-800 mb-3">
                                5. ค่าบริการและการชำระเงิน
                            </h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>การลงประกาศขั้นพื้นฐานไม่มีค่าใช้จ่าย</li>
                                <li>แพ็กเกจพิเศษและฟีเจอร์เสริม (เช่น Featured, Hot Deal, Bump) มีค่าบริการตามที่แสดงในหน้าแพ็กเกจ</li>
                                <li>การชำระเงินดำเนินการผ่านช่องทางที่ Car2Hand กำหนด และผู้ใช้งานต้องรับผิดชอบค่าธรรมเนียมที่อาจเกิดขึ้น</li>
                                <li>ค่าบริการที่ชำระแล้วไม่สามารถขอคืนได้ ยกเว้นกรณีที่เราไม่สามารถให้บริการได้จากข้อผิดพลาดของระบบ</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-gray-800 mb-3">
                                6. บทบาทของ Car2Hand
                            </h2>
                            <p className="leading-relaxed">
                                Car2Hand เป็นแพลตฟอร์มกลางที่เชื่อมโยงผู้ซื้อและผู้ขายเท่านั้น
                                เราไม่ได้เป็นคู่สัญญาในการซื้อขาย ไม่ได้เป็นเจ้าของรถ
                                และไม่รับผิดชอบต่อข้อพิพาท ความเสียหาย หรือการกระทำใด ๆ
                                ที่เกิดขึ้นระหว่างผู้ซื้อและผู้ขายโดยตรง
                                ผู้ใช้งานควรตรวจสอบและเจรจาด้วยตนเองก่อนการซื้อขาย
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-gray-800 mb-3">
                                7. ทรัพย์สินทางปัญญา
                            </h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>โลโก้ ชื่อ การออกแบบ และเนื้อหาของ Car2Hand เป็นทรัพย์สินของเรา</li>
                                <li>เนื้อหาที่ผู้ใช้งานอัปโหลด (รูปภาพ ข้อความ) ยังคงเป็นของผู้ใช้งาน
                                    แต่คุณให้สิทธิ์ Car2Hand ในการใช้งาน แสดง และเผยแพร่เพื่อให้บริการแพลตฟอร์ม</li>
                                <li>ห้ามคัดลอก ดัดแปลง หรือนำเนื้อหาของเราหรือของผู้อื่นไปใช้โดยไม่ได้รับอนุญาต</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-gray-800 mb-3">
                                8. ข้อจำกัดความรับผิด
                            </h2>
                            <p className="leading-relaxed">
                                บริการของเราให้ตามสภาพ (&quot;AS IS&quot;) โดยไม่มีการรับประกันใด ๆ
                                Car2Hand ไม่รับผิดชอบต่อความเสียหายทั้งทางตรงและทางอ้อมที่เกิดจาก
                                การใช้บริการ การหยุดชะงักของระบบ การสูญหายของข้อมูล หรือข้อมูลที่ไม่ถูกต้องจากผู้ใช้งานรายอื่น
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-gray-800 mb-3">
                                9. การระงับและยกเลิกบัญชี
                            </h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Car2Hand สงวนสิทธิ์ในการระงับหรือยกเลิกบัญชีผู้ใช้งานที่ละเมิดเงื่อนไขฉบับนี้</li>
                                <li>ผู้ใช้งานสามารถขอยกเลิกบัญชีได้ทุกเมื่อผ่าน{' '}
                                    <Link href="/data-deletion" className="text-primary font-semibold hover:underline">
                                        หน้าขอลบข้อมูลบัญชี
                                    </Link>
                                </li>
                                <li>หลังยกเลิกบัญชี ข้อมูลจะถูกลบตามนโยบายความเป็นส่วนตัว</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-gray-800 mb-3">
                                10. การเปลี่ยนแปลงเงื่อนไข
                            </h2>
                            <p className="leading-relaxed">
                                เราอาจปรับปรุงเงื่อนไขนี้เป็นครั้งคราว โดยจะแจ้งให้ทราบผ่านเว็บไซต์
                                การใช้งานบริการต่อไปหลังการปรับปรุงถือว่าคุณยอมรับเงื่อนไขฉบับใหม่
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-gray-800 mb-3">
                                11. กฎหมายที่ใช้บังคับ
                            </h2>
                            <p className="leading-relaxed">
                                เงื่อนไขฉบับนี้อยู่ภายใต้กฎหมายแห่งราชอาณาจักรไทย
                                ข้อพิพาทที่ไม่สามารถตกลงกันได้ให้นำเข้าสู่การพิจารณาของศาลไทย
                            </p>
                        </section>

                        <section className="bg-primary/5 rounded-2xl p-6 mt-8">
                            <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <Mail size={20} className="text-primary" />
                                ติดต่อเรา
                            </h2>
                            <p className="leading-relaxed mb-2">
                                หากมีคำถามเกี่ยวกับเงื่อนไขการให้บริการ กรุณาติดต่อ:
                            </p>
                            <p className="font-semibold text-gray-800">
                                อีเมล:{' '}
                                <a href="mailto:support@car2hand.com" className="text-primary hover:underline">
                                    support@car2hand.com
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
                                href="/data-deletion"
                                className="inline-flex items-center gap-2 px-5 py-3 bg-gray-50 text-gray-700 border border-gray-200 rounded-xl font-semibold hover:bg-gray-100 transition"
                            >
                                ขอลบข้อมูลบัญชีของคุณ
                            </Link>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
