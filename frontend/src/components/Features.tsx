export default function Features() {
    return (
        <section className="max-w-7xl mx-auto px-4 mt-12 mb-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg text-2xl">🛡️</div>
                    <div>
                        <h3 className="font-bold text-primary">ตรวจสภาพ 200 จุด</h3>
                        <p className="text-xs text-gray-500 mt-1">มีใบรับรองเกรดรถ A, B, C โปร่งใสทุกจุด</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4">
                    <div className="bg-orange-50 p-3 rounded-lg text-2xl">💰</div>
                    <div>
                        <h3 className="font-bold text-primary">ราคาทำนายโดย AI</h3>
                        <p className="text-xs text-gray-500 mt-1">เปรียบเทียบราคากลางให้ทันที ไม่โดนฟัน</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4">
                    <div className="bg-green-50 p-3 rounded-lg text-2xl">👨‍🔧</div>
                    <div>
                        <h3 className="font-bold text-primary">Community กูรู</h3>
                        <p className="text-xs text-gray-500 mt-1">ถามปัญหาช่าง หรือขอรีวิวจากคนใช้จริง</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
