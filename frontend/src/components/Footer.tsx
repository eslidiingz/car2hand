"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
    const pathname = usePathname();
    
    // Use minimal footer on profile pages and sell sub-pages (forms),
    // but show full footer on the /sell landing page itself.
    const isMinimalFooter =
        pathname?.startsWith('/profile') || pathname?.startsWith('/sell/');

    return (
        <footer className="bg-gray-800 text-white py-10 mt-auto">
            {!isMinimalFooter && (
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="text-xl font-bold mb-4">Car2Hand</h3>
                        <p className="text-gray-400">แพลตฟอร์มซื้อ-ขายมือสอง ที่คุณไว้วางใจได้มากที่สุด เราเปลี่ยนการซื้อขายให้เป็นเรื่องง่ายและโปร่งใส ด้วยระบบประเมินราคาที่เป็นกลาง แม่นยำ และยุติธรรม ให้คุณดีลจบได้อย่างมั่นใจ ไม่ว่าจะมองหารถสภาพนางฟ้าหรืออยากขายให้ได้ราคาดีที่สุด ครบจบในที่เดียว</p>
                    </div>
                    <div>
                        <h4 className="font-bold mb-4">Quick Links</h4>
                        <ul className="space-y-2">
                            <li><Link href="/buy" className="text-gray-400 hover:text-white">ซื้อรถยนต์</Link></li>
                            <li><Link href="/sellLandingPage" className="text-gray-400 hover:text-white">ขายรถยนต์</Link></li>
                            {/* <li><Link href="/articles" className="text-gray-400 hover:text-white">บทความ</Link></li>
                            <li><Link href="/community" className="text-gray-400 hover:text-white">ชุมชน</Link></li> */}
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-4">Support</h4>
                        <ul className="space-y-2">
                            <li><Link href="/help" className="text-gray-400 hover:text-white">ช่วยเหลือ</Link></li>
                            <li><Link href="/contact" className="text-gray-400 hover:text-white">ติดต่อเรา</Link></li>
                            <li><Link href="/privacy" className="text-gray-400 hover:text-white">นโยบายความเป็นส่วนตัว</Link></li>
                            <li><Link href="/terms" className="text-gray-400 hover:text-white">เงื่อนไขการใช้บริการ</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-4">เกี่ยวกับเรา</h4>
                        <ul className="space-y-2">
                            <li><Link href="/about" className="text-gray-400 hover:text-white">เกี่ยวกับ Car2Hand</Link></li>
                            {/* TODO: Phase 2 — บริการ */}
                            {/* <li><Link href="/services/inspection" className="text-gray-400 hover:text-white">การตรวจสอบรถยนต์</Link></li> */}
                            {/* <li><Link href="/services/finance" className="text-gray-400 hover:text-white">การเงินและประกัน</Link></li> */}
                        </ul>
                    </div>
                </div>
            )}
            <div className={`max-w-7xl mx-auto px-4 ${!isMinimalFooter ? 'mt-8 pt-8 border-t border-gray-700' : ''} text-center text-gray-400`}>
                <p>&copy; {new Date().getFullYear()} Car2Hand. All rights reserved.</p>
            </div>
        </footer>
    );
}
