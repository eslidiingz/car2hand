export default function Features() {
    return (
        <section className="max-w-7xl mx-auto px-4 mt-12 mb-6 hidden md:block">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4 hover:-translate-y-1 transition duration-300">
                    <div className="bg-blue-50 p-3 rounded-lg text-2xl">🛡️</div>
                    <div>
                        <h3 className="font-bold text-primary">ตรวจสภาพ 200 จุด</h3>
                        <p className="text-xs text-gray-500 mt-1">มีใบรับรองเกรดรถ A, B, C โปร่งใสทุกจุด</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4 hover:-translate-y-1 transition duration-300">
                    <div className="bg-orange-50 p-3 rounded-lg text-2xl">💰</div>
                    <div>
                        <h3 className="font-bold text-primary">ราคาทำนายโดย AI</h3>
                        <p className="text-xs text-gray-500 mt-1">เปรียบเทียบราคากลางให้ทันที ไม่โดนฟัน</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4 hover:-translate-y-1 transition duration-300">
                    <div className="bg-green-50 p-3 rounded-lg text-2xl">👨‍🔧</div>
                    <div>
                        <h3 className="font-bold text-primary">Community กูรู</h3>
                        <p className="text-xs text-gray-500 mt-1">ถามปัญหาช่าง หรือขอรีวิวจากคนใช้จริง</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4 hover:-translate-y-1 transition duration-300">
                    <div className="bg-red-50 p-3 rounded-lg text-2xl">🛒</div>
                    <div>
                        <h3 className="font-bold text-primary">ตลาดรถคัดเกรด</h3>
                        <p className="text-xs text-gray-500 mt-1">รถทุกคันผ่านการตรวจสภาพ 200 จุด พร้อมใบรับรอง มั่นใจได้ ไม่มีย้อมแมว</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4 hover:-translate-y-1 transition duration-300">
                    <div className="bg-purple-50 p-3 rounded-lg text-2xl">📚</div>
                    <div>
                        <h3 className="font-bold text-primary">คลังความรู้</h3>
                        <p className="text-xs text-gray-500 mt-1">มือใหม่ก็ดูรถเป็น ด้วยบทความสอนดูรถ และเทคนิคการดูแลรักษาจากช่างตัวจริง</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4 hover:-translate-y-1 transition duration-300">
                    <div className="bg-gray-50 p-3 rounded-lg text-2xl">💬</div>
                    <div>
                        <h3 className="font-bold text-primary">ชุมชนคนรักรถ</h3>
                        <p className="text-xs text-gray-500 mt-1">พูดคุย ปรึกษาปัญหา และรีวิวรถจากผู้ใช้งานจริง เพื่อการตัดสินใจที่แม่นยำ</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
