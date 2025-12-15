export default function Hero() {
    return (
        <header className="bg-linear-to-br from-[#0F3460] to-[#16213E] pt-28 pb-24 rounded-b-[40px] px-4 text-center relative shadow-xl">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
                หารถมือสอง <span className="text-accent">สภาพนางฟ้า</span> <br className="hidden md:block" />
                พร้อมกูรูช่วยดูรถ
            </h1>
            <p className="text-blue-200 mb-8 max-w-xl mx-auto text-sm md:text-base">
                Car2Hand แหล่งรวมรถคัดเกรด A+ พร้อมใบตรวจสภาพ 200 จุด มั่นใจเหมือนพาช่างไปดูเอง
            </p>

            <div className="bg-white p-2 rounded-2xl shadow-2xl max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-2 relative z-10">
                <div className="flex-1 w-full px-4 py-2 border-b md:border-b-0 md:border-r border-gray-100">
                    <label className="text-xs text-gray-400 block text-left">ยี่ห้อ / รุ่น</label>
                    <input type="text" placeholder="เช่น Honda Civic" className="w-full outline-none font-medium text-gray-700 placeholder:text-gray-300" />
                </div>
                <div className="flex-1 w-full px-4 py-2 border-b md:border-b-0 md:border-r border-gray-100">
                    <label className="text-xs text-gray-400 block text-left">งบประมาณ</label>
                    <select className="w-full outline-none font-medium text-gray-700 bg-white">
                        <option>ไม่เกิน 500,000</option>
                        <option>500,000 - 1 ล้าน</option>
                    </select>
                </div>
                <div className="flex-1 w-full px-4 py-2">
                    <label className="text-xs text-gray-400 block text-left">ประเภทรถ</label>
                    <select className="w-full outline-none font-medium text-gray-700 bg-white">
                        <option>รถเก๋ง (Sedan)</option>
                        <option>รถครอบครัว (SUV)</option>
                    </select>
                </div>
                <button className="bg-accent text-white rounded-xl px-8 py-4 font-bold hover:bg-orange-600 transition w-full md:w-auto shadow-lg shadow-orange-200 cursor-pointer">
                    ค้นหา
                </button>
            </div>
        </header>
    );
}
