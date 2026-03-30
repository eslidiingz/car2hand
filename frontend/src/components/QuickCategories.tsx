"use client";

import {
    Car,
    CarFront,
    Truck,
    Zap,
    Crown,
    Wallet,
    type LucideIcon,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// SVG icons for car types not available in lucide
function SUVIcon({ size = 32, className = '' }: { size?: number; className?: string }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M5 17h14M5 17a2 2 0 01-2-2v-3l2.5-5h11L19 12v3a2 2 0 01-2 17" />
            <path d="M3 12h18" />
            <circle cx="7.5" cy="17" r="1.5" />
            <circle cx="16.5" cy="17" r="1.5" />
            <path d="M5 7h14" />
        </svg>
    );
}

function HatchbackIcon({ size = 32, className = '' }: { size?: number; className?: string }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M4 15l2-6h8l4 6" />
            <path d="M2 15h20v2H2z" />
            <circle cx="7" cy="17" r="1.5" />
            <circle cx="17" cy="17" r="1.5" />
        </svg>
    );
}

function PPVIcon({ size = 32, className = '' }: { size?: number; className?: string }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M3 14l3-7h12l3 7" />
            <path d="M1 14h22v3H1z" />
            <circle cx="7" cy="17" r="1.5" />
            <circle cx="17" cy="17" r="1.5" />
            <path d="M6 7l1-3h10l1 3" />
        </svg>
    );
}

interface Category {
    id: string;
    label: string;
    icon: LucideIcon | (({ size, className }: { size?: number; className?: string }) => JSX.Element);
    bodyType?: string;
    fuelType?: string;
    maxPrice?: number;
}

const categories: Category[] = [
    { id: 'sedan', label: 'Sedan', icon: CarFront, bodyType: 'SEDAN' },
    { id: 'suv', label: 'SUV', icon: SUVIcon, bodyType: 'SUV' },
    { id: 'ev', label: 'EV / Hybrid', icon: Zap, fuelType: 'EV' },
    { id: 'ppv', label: 'PPV', icon: PPVIcon, bodyType: 'PPV' },
    { id: 'hatchback', label: 'Hatchback', icon: HatchbackIcon, bodyType: 'HATCHBACK' },
    { id: 'pickup', label: 'Pickup', icon: Truck, bodyType: 'PICKUP' },
    { id: 'luxury', label: 'Luxury', icon: Crown, bodyType: 'LUXURY' },
    { id: 'budget', label: 'งบประหยัด', icon: Wallet, maxPrice: 500000 },
];

export default function QuickCategories() {
    const router = useRouter();

    const handleCategoryClick = (cat: Category) => {
        const params = new URLSearchParams();
        params.append('vehicleType', 'CAR');

        if (cat.bodyType) params.append('bodyType', cat.bodyType);
        if (cat.fuelType) params.append('fuelType', cat.fuelType);
        if (cat.maxPrice) params.append('maxPrice', cat.maxPrice.toString());

        router.push(`/buy?${params.toString()}`);
    };

    return (
        <div className="w-full max-w-4xl mx-auto mt-[-40px] relative z-20 px-4">
            <div className="bg-white rounded-3xl shadow-xl p-8 flex justify-between items-center gap-2 overflow-x-auto no-scrollbar snap-x scroll-smooth">
                {categories.map((cat) => {
                    const IconComponent = cat.icon;
                    return (
                        <button
                            key={cat.id}
                            onClick={() => handleCategoryClick(cat)}
                            className="flex flex-col items-center justify-center min-w-[100px] transition group cursor-pointer snap-start"
                        >
                            <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center mb-3 group-hover:bg-primary/5 group-hover:text-primary transition group-active:scale-95">
                                <IconComponent size={32} className="text-slate-600 group-hover:text-primary transition" />
                            </div>
                            <span className="text-slate-700 text-sm font-bold whitespace-nowrap group-hover:text-primary transition">
                                {cat.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
