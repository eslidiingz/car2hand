"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ChevronDown } from 'lucide-react';
import SearchableSelect, { SelectOption } from './SearchableSelect';
import QuickCategories from './QuickCategories';

interface Brand {
    id: string;
    name: string;
    nameTh?: string | null;
    logo?: string | null;
    isPopular?: boolean;
}

export default function Hero() {
    const router = useRouter();
    const [keyword, setKeyword] = useState('');
    const [brand, setBrand] = useState('');
    const [budget, setBudget] = useState('all');
    const [brands, setBrands] = useState<Brand[]>([]);
    const [brandOptions, setBrandOptions] = useState<SelectOption[]>([]);

    useEffect(() => {
        const fetchBrands = async () => {
            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
                const response = await fetch(`${API_URL}/master-data/brands?vehicleType=CAR`);
                if (response.ok) {
                    const data = await response.json();
                    const fetched: Brand[] = data.brands || [];
                    setBrands(fetched);

                    // Map to SearchableSelect options with logos
                    const options: SelectOption[] = fetched.map((b) => ({
                        id: b.name,
                        label: b.name,
                        subLabel: b.nameTh || undefined,
                        image: b.logo || `/brands/cars/${b.name}-300x300.png`,
                        isPopular: b.isPopular || false,
                    }));
                    setBrandOptions(options);
                }
            } catch (error) {
                console.error('Error fetching brands:', error);
            }
        };

        fetchBrands();
    }, []);

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (keyword) params.append('q', keyword);
        if (brand) params.append('brand', brand);

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

        router.push(`/buy?${params.toString()}`);
    };

    return (
        <header className="bg-linear-to-br from-[#0F3460] to-[#16213E] pt-28 pb-24 rounded-b-[40px] px-4 text-center relative shadow-xl">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
                หารถมือสอง <span className="text-accent">สภาพนางฟ้า</span>
            </h1>
            <p className="text-blue-200 mb-8 max-w-xl mx-auto text-sm md:text-base">
                Car2Hand แพลตฟอร์มซื้อขายรถมือสองคุณภาพที่คุณวางใจได้ พร้อมระบบการประเมินราคาที่ดีที่สุด
            </p>

            <div className="bg-white p-6 rounded-3xl shadow-2xl max-w-4xl mx-auto flex flex-col gap-4 relative z-30 border border-slate-100">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Keyword search */}
                    <div className="flex-1 px-4 py-3 rounded-xl border border-gray-200 group focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all duration-300 bg-white">
                        <label className="text-sm font-semibold text-gray-700 block text-left mb-1">ค้นหารถ</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                placeholder="เช่น civic, toyota..."
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                                className="w-full outline-none font-bold text-slate-700 bg-transparent text-base placeholder:text-slate-300"
                            />
                        </div>
                    </div>

                    {/* Brand search with logo */}
                    <div className="flex-1 px-4 py-3 rounded-xl border border-gray-200 group focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all duration-300 bg-white">
                        <label className="text-sm font-semibold text-gray-700 block text-left mb-1">ยี่ห้อ / รุ่น</label>
                        <SearchableSelect
                            options={brandOptions}
                            value={brand}
                            onChange={(val) => setBrand(val)}
                            placeholder="ทุกยี่ห้อ"
                            searchPlaceholder="ค้นหายี่ห้อ..."
                            compact
                        />
                    </div>

                    {/* Budget */}
                    <div className="flex-1 px-4 py-3 rounded-xl border border-gray-200 group focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all duration-300 bg-white relative">
                        <label className="text-sm font-semibold text-gray-700 block text-left mb-1">งบประมาณ</label>
                        <div className="relative flex items-center">
                            <select
                                value={budget}
                                onChange={(e) => setBudget(e.target.value)}
                                className="w-full outline-none font-bold text-slate-700 bg-transparent cursor-pointer text-base appearance-none relative z-10 pr-8"
                            >
                                <option value="all">ทุกราคา</option>
                                <option value="below-500k">ไม่เกิน 500,000</option>
                                <option value="500k-1m">500,000 - 1 ล้าน</option>
                                <option value="1m-2m">1 ล้าน - 2 ล้าน</option>
                                <option value="above-2m">2 ล้านขึ้นไป</option>
                            </select>
                            <ChevronDown size={16} className="absolute right-0 text-slate-400 pointer-events-none group-focus-within:text-primary transition-colors" />
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleSearch}
                    className="bg-[#ED6B33] text-white rounded-2xl py-5 font-black text-xl hover:bg-[#D45A28] transition w-full shadow-lg shadow-orange-100 flex items-center justify-center gap-3 cursor-pointer active:scale-[0.98]"
                >
                    <Search size={24} />
                    ค้นหา
                </button>
            </div>
        </header>
    );
}
