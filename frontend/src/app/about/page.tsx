import React from 'react';
import Link from 'next/link';
import {
    Car,
    ShieldCheck,
    Handshake,
    Users,
    TrendingUp,
    Award,
    Target,
    Sparkles,
    Wrench,
    Heart,
    MessageCircle,
    Eye,
    CheckCircle,
    Quote,
} from 'lucide-react';

export const metadata = {
    title: 'เกี่ยวกับเรา | Car2Hand',
    description:
        'Car2Hand คือแพลตฟอร์มซื้อขายรถมือสองที่โปร่งใส ปลอดภัย และยุติธรรม ด้วยระบบประเมินราคาที่เป็นกลางและบริการตรวจสภาพรถโดยทีมช่างมืออาชีพ',
};

const STATS = [
    { value: '50,000+', label: 'ประกาศบนแพลตฟอร์ม' },
    { value: '20,000+', label: 'ผู้ใช้งานจริง' },
    { value: '5,000+', label: 'เต๊นท์ร้านค้าที่ไว้วางใจ' },
    { value: '98%', label: 'ความพึงพอใจของลูกค้า' },
];

const VALUES = [
    {
        icon: ShieldCheck,
        color: 'bg-blue-50 text-blue-600',
        title: 'โปร่งใส (Transparent)',
        desc: 'ทุกประกาศผ่านการคัดกรอง ผู้ขายได้รับการยืนยันตัวตน ข้อมูลรถถูกแสดงอย่างครบถ้วน ไม่มีค่าใช้จ่ายแอบแฝง',
    },
    {
        icon: Target,
        color: 'bg-orange-50 text-orange-600',
        title: 'แม่นยำ (Accurate)',
        desc: 'ระบบประเมินราคากลางช่วยให้ทั้งผู้ซื้อและผู้ขายตั้งราคาได้ยุติธรรม ลดการต่อรองที่ไม่จำเป็น',
    },
    {
        icon: Handshake,
        color: 'bg-green-50 text-green-600',
        title: 'ยุติธรรม (Fair)',
        desc: 'เราไม่เข้าข้างฝ่ายใด แต่เป็นตัวกลางที่ช่วยให้การซื้อขายเป็นไปอย่างราบรื่น ปลอดภัยทั้งสองฝ่าย',
    },
    {
        icon: Wrench,
        color: 'bg-purple-50 text-purple-600',
        title: 'มืออาชีพ (Professional)',
        desc: 'ทีมช่างและผู้เชี่ยวชาญด้านรถยนต์คอยให้บริการตรวจสภาพและให้คำปรึกษา',
    },
    {
        icon: Heart,
        color: 'bg-rose-50 text-rose-600',
        title: 'ใส่ใจ (Caring)',
        desc: 'เราใส่ใจในทุกขั้นตอนการซื้อขาย จากประกาศแรกจนถึงวันส่งมอบรถ พร้อมบริการหลังการขายที่ครบวงจร',
    },
    {
        icon: Sparkles,
        color: 'bg-amber-50 text-amber-600',
        title: 'พัฒนา (Evolving)',
        desc: 'เรามุ่งมั่นพัฒนาแพลตฟอร์มอย่างต่อเนื่อง เพื่อมอบประสบการณ์การซื้อขายรถที่ดียิ่งขึ้น',
    },
];

const FEATURES = [
    {
        icon: Car,
        title: 'ค้นหารถที่ใช่',
        desc: 'กรองตามยี่ห้อ รุ่น ปี ระยะทาง งบประมาณ และพื้นที่ เพื่อเจอคันที่ใช่ได้เร็วที่สุด',
    },
    {
        icon: TrendingUp,
        title: 'ประเมินราคากลาง',
        desc: 'ระบบคำนวณราคาเหมาะสมอัตโนมัติจากข้อมูลตลาดจริง ใช้ตัดสินใจได้ทันที',
    },
    {
        icon: ShieldCheck,
        title: 'ตรวจสภาพก่อนซื้อ',
        desc: 'บริการตรวจสภาพรถโดยทีมช่างมืออาชีพ พร้อมรายงานละเอียดหลายรายการ',
    },
    {
        icon: Users,
        title: 'ชุมชนกูรูรถยนต์',
        desc: 'ถามตอบกับกูรูและเพื่อนสมาชิกที่มีประสบการณ์ในการซื้อขายและดูแลรถยนต์',
    },
    {
        icon: Award,
        title: 'เต๊นท์และดีลเลอร์ที่เชื่อถือได้',
        desc: 'ผู้ขายรถจำนวนมากผ่านการคัดเลือกและยืนยันตัวตน เพิ่มความมั่นใจก่อนซื้อ',
    },
    {
        icon: MessageCircle,
        title: 'แจ้งเตือนผ่าน LINE',
        desc: 'รับการแจ้งเตือนสถานะประกาศ ผู้สนใจ และข้อเสนอพิเศษผ่าน LINE Official',
    },
];

const TIMELINE = [
    {
        year: '2566',
        title: 'จุดเริ่มต้นของ Car2Hand',
        desc: 'ก่อตั้งด้วยความตั้งใจที่จะเปลี่ยนวงการซื้อขายรถมือสองในไทยให้โปร่งใสและน่าเชื่อถือ',
    },
    {
        year: '2567',
        title: 'เปิดบริการตรวจสภาพ',
        desc: 'ร่วมมือกับทีมช่างมืออาชีพ ให้บริการตรวจสภาพรถพร้อมรายงานก่อนตัดสินใจซื้อ',
    },
    {
        year: '2568',
        title: 'ขยายเครือข่ายพันธมิตร',
        desc: 'เชื่อมโยงกับสถาบันการเงินและบริษัทประกันชั้นนำ ให้บริการสินเชื่อและประกันครบวงจร',
    },
    {
        year: '2569',
        title: 'ชุมชนและฟีเจอร์ใหม่',
        desc: 'เปิดตัวระบบชุมชนกูรู พร้อมฟีเจอร์เปรียบเทียบรถ โรงรถส่วนตัว และแพ็กเกจประกาศแบบใหม่',
    },
];

export default function AboutPage() {
    return (
        <div className="bg-surface min-h-screen">
            {/* Hero */}
            <section className="bg-gradient-to-br from-primary via-primary to-[#16213E] text-white py-16 md:py-20 mb-16">
                <div className="container mx-auto max-w-5xl px-4 text-center">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-1.5 rounded-full text-xs font-semibold mb-5">
                        <Sparkles size={14} className="text-accent" />
                        แพลตฟอร์มซื้อขายรถมือสองอันดับหนึ่งของไทย
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
                        เราอยู่ที่นี่เพื่อเปลี่ยน<br className="hidden md:block" />
                        <span className="text-accent">วงการรถมือสอง</span>ของไทย
                    </h1>
                    <p className="text-white/80 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                        Car2Hand คือแพลตฟอร์มที่เชื่อมต่อผู้ซื้อและผู้ขายรถมือสอง
                        ด้วยหัวใจของความโปร่งใส ยุติธรรม และน่าเชื่อถือ
                    </p>
                </div>
            </section>

            {/* Stats */}
            {/* <section className="container mx-auto max-w-5xl px-4 -mt-10 mb-16 relative z-10">
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 md:p-8 grid grid-cols-2 md:grid-cols-4 gap-6">
                    {STATS.map((s) => (
                        <div key={s.label} className="text-center">
                            <p className="text-2xl md:text-3xl font-bold text-primary">{s.value}</p>
                            <p className="text-xs md:text-sm text-gray-500 mt-1">{s.label}</p>
                        </div>
                    ))}
                </div>
            </section> */}

            {/* Mission / Vision */}
            <section className="container mx-auto max-w-5xl px-4 mb-16">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                            <Target className="text-primary" size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 mb-3">พันธกิจ (Mission)</h2>
                        <p className="text-gray-600 leading-relaxed">
                            สร้างแพลตฟอร์มซื้อขายรถมือสองที่คนไทยไว้วางใจที่สุด
                            ด้วยระบบที่โปร่งใส ปลอดภัย และเป็นธรรม
                            ช่วยให้ทั้งผู้ซื้อและผู้ขายทำธุรกรรมได้อย่างมั่นใจ
                        </p>
                    </div>
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                        <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center mb-4">
                            <Eye className="text-accent" size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 mb-3">วิสัยทัศน์ (Vision)</h2>
                        <p className="text-gray-600 leading-relaxed">
                            เป็นแพลตฟอร์มซื้อขายรถมือสองอันดับ 1
                            ของเอเชียตะวันออกเฉียงใต้ที่ขับเคลื่อนด้วยเทคโนโลยีและความเข้าใจในตลาดท้องถิ่น
                            เปลี่ยนประสบการณ์การซื้อขายให้ง่ายเหมือนช้อปปิ้งออนไลน์
                        </p>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="container mx-auto max-w-6xl px-4 mb-16">
                <div className="text-center mb-10">
                    <p className="text-xs font-bold text-accent uppercase tracking-widest mb-2">
                        Our Values
                    </p>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                        คุณค่าที่เรายึดถือ
                    </h2>
                    <p className="text-sm text-gray-500 mt-2 max-w-xl mx-auto">
                        6 คุณค่าที่เป็นหัวใจในการดำเนินธุรกิจของ Car2Hand
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {VALUES.map((v) => {
                        const Icon = v.icon;
                        return (
                            <div
                                key={v.title}
                                className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 hover:shadow-xl hover:-translate-y-1 transition duration-300"
                            >
                                <div className={`w-12 h-12 ${v.color} rounded-xl flex items-center justify-center mb-4`}>
                                    <Icon size={22} />
                                </div>
                                <h3 className="font-bold text-gray-800 mb-2">{v.title}</h3>
                                <p className="text-sm text-gray-600 leading-relaxed">{v.desc}</p>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Features */}
            <section className="bg-white py-16">
                <div className="container mx-auto max-w-6xl px-4">
                    <div className="text-center mb-10">
                        <p className="text-xs font-bold text-accent uppercase tracking-widest mb-2">
                            Why Car2Hand
                        </p>
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                            ทำไมต้องเลือกเรา
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {FEATURES.map((f) => {
                            const Icon = f.icon;
                            return (
                                <div
                                    key={f.title}
                                    className="bg-surface rounded-2xl p-5 flex items-start gap-4"
                                >
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary flex-shrink-0 shadow-sm">
                                        <Icon size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800 mb-1">{f.title}</h3>
                                        <p className="text-sm text-gray-600 leading-relaxed">{f.desc}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Timeline */}
            {/* <section className="container mx-auto max-w-4xl px-4 py-16">
                <div className="text-center mb-10">
                    <p className="text-xs font-bold text-accent uppercase tracking-widest mb-2">
                        Our Journey
                    </p>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                        เส้นทางของ Car2Hand
                    </h2>
                </div>
                <div className="relative">
                    <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 md:-translate-x-1/2" />
                    <div className="space-y-8">
                        {TIMELINE.map((t, i) => (
                            <div
                                key={t.year}
                                className={`relative flex flex-col md:flex-row items-start gap-4 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                            >
                                <div className="absolute left-4 md:left-1/2 top-2 w-4 h-4 bg-accent rounded-full md:-translate-x-1/2 z-10 ring-4 ring-white" />

                                <div className={`ml-12 md:ml-0 md:w-[calc(50%-2rem)] bg-white rounded-2xl border border-gray-100 shadow-sm p-5 ${i % 2 === 0 ? 'md:mr-auto' : 'md:ml-auto'}`}>
                                    <p className="text-xs font-bold text-accent mb-1">พ.ศ. {t.year}</p>
                                    <h3 className="font-bold text-gray-800 mb-1">{t.title}</h3>
                                    <p className="text-sm text-gray-600 leading-relaxed">{t.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section> */}

            {/* Testimonial */}
            <section className="bg-gradient-to-br from-primary to-[#16213E] text-white py-16">
                <div className="container mx-auto max-w-3xl px-4 text-center">
                    <Quote size={48} className="mx-auto mb-6 text-accent opacity-80" />
                    <blockquote className="text-lg md:text-2xl leading-relaxed font-semibold mb-6">
                        &ldquo;Car2Hand ทำให้การขายรถของผมง่ายขึ้นมาก ภายใน 2 สัปดาห์
                        ก็มีผู้สนใจติดต่อมา และได้ราคาที่พอใจ ระบบใช้งานง่าย
                        มีทีมงานคอยดูแลตลอด&rdquo;
                    </blockquote>
                    <div className="flex items-center justify-center gap-3">
                        <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center font-bold text-white">
                            ส
                        </div>
                        <div className="text-left">
                            <p className="font-bold">คุณสมชาย รักรถ</p>
                            <p className="text-sm text-white/70">ผู้ใช้งาน Car2Hand</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="container mx-auto max-w-4xl px-4 py-16">
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-12 text-center">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
                        พร้อมเริ่มต้นแล้วหรือยัง?
                    </h2>
                    <p className="text-sm md:text-base text-gray-600 mb-8 max-w-xl mx-auto">
                        ไม่ว่าคุณกำลังมองหารถคันใหม่
                        หรืออยากลงขายรถของคุณให้ได้ราคาที่ดีที่สุด Car2Hand พร้อมช่วยคุณ
                    </p>
                    <div className="flex flex-wrap justify-center gap-3">
                        <Link
                            href="/buy"
                            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-opacity-90 transition shadow-lg shadow-blue-900/20"
                        >
                            <Car size={18} />
                            เริ่มหารถ
                        </Link>
                        <Link
                            href="/sellLandingPage"
                            className="inline-flex items-center gap-2 bg-accent text-white px-6 py-3 rounded-xl font-bold hover:bg-opacity-90 transition shadow-lg shadow-orange-200"
                        >
                            <Sparkles size={18} />
                            ลงขายรถฟรี
                        </Link>
                        <Link
                            href="/contact"
                            className="inline-flex items-center gap-2 bg-gray-50 text-gray-700 border border-gray-200 px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition"
                        >
                            <MessageCircle size={18} />
                            ติดต่อเรา
                        </Link>
                    </div>

                    <div className="mt-10 pt-8 border-t border-gray-100 flex flex-wrap items-center justify-center gap-6 text-xs text-gray-400">
                        <span className="inline-flex items-center gap-1.5">
                            <CheckCircle size={14} className="text-green-500" />
                            ใช้งานฟรี
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <CheckCircle size={14} className="text-green-500" />
                            ไม่มีค่าธรรมเนียมแฝง
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <CheckCircle size={14} className="text-green-500" />
                            ทีมงานดูแลตลอด
                        </span>
                    </div>
                </div>
            </section>
        </div>
    );
}
