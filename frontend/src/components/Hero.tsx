"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MagnifyingGlass } from '@phosphor-icons/react';
import QuickCategories from './QuickCategories';

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

            <div className="bg-white p-6 rounded-3xl shadow-2xl max-w-4xl mx-auto flex flex-col gap-4 relative z-10 border border-slate-100">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 px-4 py-3 rounded-2xl border border-slate-200">
                        <label className="text-[10px] uppercase font-bold text-slate-400 block text-left mb-1 tracking-wider">ยี่ห้อ / รุ่น</label>
                        <select
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            className="w-full outline-none font-bold text-slate-700 bg-white cursor-pointer text-lg"
                        >
                            <option value="">ทุกยี่ห้อ</option>
                            <option value="honda">Honda</option>
                            <option value="toyota">Toyota</option>
                        </select>
                    </div>
                    <div className="flex-1 px-4 py-3 rounded-2xl border border-slate-200">
                        <label className="text-[10px] uppercase font-bold text-slate-400 block text-left mb-1 tracking-wider">งบประมาณ</label>
                        <select
                            value={budget}
                            onChange={(e) => setBudget(e.target.value)}
                            className="w-full outline-none font-bold text-slate-700 bg-white cursor-pointer text-lg"
                        >
                            <option value="all">ทุกราคา</option>
                            <option value="below-500k">ไม่เกิน 500,000</option>
                            <option value="500k-1m">500,000 - 1 ล้าน</option>
                        </select>
                    </div>
                </div>
                
                <button
                    onClick={handleSearch}
                    className="bg-[#ED6B33] text-white rounded-2xl py-5 font-black text-xl hover:bg-[#D45A28] transition w-full shadow-lg shadow-orange-100 flex items-center justify-center gap-3 cursor-pointer active:scale-[0.98]"
                >
                    <MagnifyingGlass size={24} weight="bold" />
                    ค้นหา
                </button>
            </div>
        </header>
    );
}
