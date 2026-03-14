"use client";

import { 
    Car, 
    Lightning, 
    ShieldCheck,
    UserCircle,
    Wallet
} from '@phosphor-icons/react';
import { Gem, LandPlot, Layers, Mountain, Truck } from 'lucide-react';
import { useRouter } from 'next/navigation';

const categories = [
    { id: 'sedan', label: 'Sedan', icon: Car, bodyType: 'SEDAN' },
    { id: 'suv', label: 'SUV', icon: LandPlot, bodyType: 'SUV' },
    { id: 'ev', label: 'EV / Hybrid', icon: Lightning, fuelType: 'EV' },
    { id: 'ppv', label: 'PPV', icon: Mountain, bodyType: 'PPV' },
    { id: 'hatchback', label: 'Hatchback', icon: Layers, bodyType: 'HATCHBACK' },
    { id: 'pickup', label: 'Pickup', icon: Truck, bodyType: 'PICKUP' },
    { id: 'luxury', label: 'Luxury', icon: Gem, bodyType: 'LUXURY' },
    { id: 'budget', label: 'งบประหยัด', icon: Wallet, maxPrice: 500000 },
];

export default function QuickCategories() {
    const router = useRouter();

    const handleCategoryClick = (cat: typeof categories[0]) => {
        const params = new URLSearchParams();
        params.append('vehicleType', 'CAR');
        
        if ('bodyType' in cat && cat.bodyType) {
            params.append('bodyType', cat.bodyType);
        }
        
        if ('fuelType' in cat && cat.fuelType) {
            params.append('fuelType', cat.fuelType);
        }

        if ('maxPrice' in cat && cat.maxPrice) {
            params.append('maxPrice', cat.maxPrice.toString());
        }

        router.push(`/buy?${params.toString()}`);
    };

    return (
        <div className="w-full max-w-4xl mx-auto mt-[-40px] relative z-20 px-4">
            <div className="bg-white rounded-3xl shadow-xl p-8 flex justify-between items-center gap-2 overflow-x-auto no-scrollbar snap-x scroll-smooth">
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => handleCategoryClick(cat)}
                        className="flex flex-col items-center justify-center min-w-[100px] transition group cursor-pointer snap-start"
                    >
                        <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center mb-3 group-hover:bg-slate-100 transition group-active:scale-95">
                            <cat.icon size={32} className="text-slate-700" weight="bold" />
                        </div>
                        <span className="text-slate-700 text-sm font-bold whitespace-nowrap">
                            {cat.label}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}
