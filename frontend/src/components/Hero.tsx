"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MagnifyingGlass } from '@phosphor-icons/react';

export default function Hero() {
    const router = useRouter();
    const [keyword, setKeyword] = useState('');
    const [budget, setBudget] = useState('all');
    const [type, setType] = useState('all');

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (keyword) params.append('q', keyword);

        if (budget === 'below-500k') {
            params.append('maxPrice', '500000');
        } else if (budget === '500k-1m') {
            params.append('minPrice', '500000');
            params.append('maxPrice', '1000000');
        } else if (budget === '1m-2m') {
            params.append('minPrice', '1000000');
            params.append('maxPrice', '2000000');
        } else if (budget === 'above-2m') {
            params.append('minPrice', '2000000');
        }

        if (type === 'sedan') {
            params.append('vehicleType', 'CAR');
            params.append('bodyType', 'SEDAN');
        } else if (type === 'suv') {
            params.append('vehicleType', 'CAR');
            params.append('bodyType', 'SUV');
        } else if (type === 'pickup') {
            params.append('vehicleType', 'CAR');
            params.append('bodyType', 'PICKUP');
        } else if (type === 'motorcycle') {
            params.append('vehicleType', 'MOTORCYCLE');
        }

        router.push(`/buy?${params.toString()}`);
    };

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
                    <label className="text-xs text-gray-400 block text-left mb-1">ยี่ห้อ / รุ่น</label>
                    <input
                        type="text"
                        placeholder="เช่น Honda Civic"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        className="w-full outline-none font-medium text-gray-700 placeholder:text-gray-300"
                    />
                </div>
                <div className="flex-1 w-full px-4 py-2 border-b md:border-b-0 md:border-r border-gray-100">
                    <label className="text-xs text-gray-400 block text-left mb-1">งบประมาณ</label>
                    <select
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        className="w-full outline-none font-medium text-gray-700 bg-white cursor-pointer"
                    >
                        <option value="all">ทุกราคา</option>
                        <option value="below-500k">ไม่เกิน 500,000</option>
                        <option value="500k-1m">500,000 - 1 ล้าน</option>
                        <option value="1m-2m">1 ล้าน - 2 ล้าน</option>
                        <option value="above-2m">มากกว่า 2 ล้าน</option>
                    </select>
                </div>
                <div className="flex-1 w-full px-4 py-2">
                    <label className="text-xs text-gray-400 block text-left mb-1">ประเภทรถ</label>
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="w-full outline-none font-medium text-gray-700 bg-white cursor-pointer"
                    >
                        <option value="all">ทุกประเภท</option>
                        <option value="sedan">รถเก๋ง (Sedan)</option>
                        <option value="suv">รถครอบครัว (SUV)</option>
                        <option value="pickup">รถกระบะ (Pickup)</option>
                        <option value="motorcycle">มอเตอร์ไซค์</option>
                    </select>
                </div>
                <button
                    onClick={handleSearch}
                    className="bg-accent text-white rounded-xl px-10 py-4 font-bold hover:bg-orange-600 transition w-full md:w-auto shadow-lg shadow-orange-200 cursor-pointer active:scale-95"
                >
                    <MagnifyingGlass className="inline-block mr-2" size={20} />
                    ค้นหา
                </button>
            </div>
        </header>
    );
}
