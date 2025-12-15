"use client";

import React from 'react';
import Link from 'next/link';
import {
    Heart,
    MapPin,
    CalendarBlank,
    Gauge,
    Trash
} from '@phosphor-icons/react';

export default function FavoritesPage() {
    const favorites = [
        {
            id: 1,
            title: 'Mercedes-Benz C220d AMG Dynamic',
            year: '2021',
            price: '2,190,000',
            image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=300',
            mileage: '45,000',
            location: 'กรุงเทพฯ',
            badge: 'Premium'
        },
        {
            id: 2,
            title: 'Ford Ranger Raptor 2.0 Bi-Turbo',
            year: '2022',
            price: '1,450,000',
            image: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&q=80&w=300',
            mileage: '12,000',
            location: 'เชียงใหม่',
            badge: null
        },
        {
            id: 3,
            title: 'Honda Civic FE 1.5 Turbo EL+',
            year: '2022',
            price: '920,000',
            image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=300',
            mileage: '28,000',
            location: 'นนทบุรี',
            badge: 'Hot'
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">รายการที่บันทึกไว้ (Favorites)</h1>
                <span className="text-sm text-gray-500">{favorites.length} รายการ</span>
            </div>

            {favorites.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favorites.map((car) => (
                        <div key={car.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-lg transition duration-300 relative">
                            {/* Remove Button */}
                            <button className="absolute top-3 right-3 z-10 bg-white/80 p-2 rounded-full text-red-500 hover:bg-red-500 hover:text-white transition shadow-sm backdrop-blur-sm">
                                <Trash weight="fill" size={16} />
                            </button>

                            <div className="relative h-48 overflow-hidden">
                                <img src={car.image} alt={car.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                                {car.badge && (
                                    <span className="absolute top-3 left-3 bg-accent text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                                        {car.badge}
                                    </span>
                                )}
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 pt-10">
                                    <h3 className="text-white font-bold truncate">{car.title}</h3>
                                </div>
                            </div>

                            <div className="p-4">
                                <div className="flex justify-between items-end mb-3">
                                    <div>
                                        <span className="text-xs text-gray-400 block mb-1">{car.year}</span>
                                        <span className="text-lg font-bold text-primary">{car.price}.-</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 text-xs text-gray-500 pt-3 border-t border-gray-100">
                                    <span className="flex items-center gap-1"><Gauge weight="bold" /> {car.mileage} กม.</span>
                                    <span className="flex items-center gap-1"><MapPin weight="bold" /> {car.location}</span>
                                </div>

                                <Link href={`/buy/${car.id}`} className="block w-full text-center mt-4 bg-gray-50 text-gray-600 py-2 rounded-lg font-bold text-sm hover:bg-primary hover:text-white transition">
                                    ดูรายละเอียด
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 border-dashed">
                    <Heart weight="duotone" className="text-gray-300 text-6xl mx-auto mb-4" />
                    <h3 className="font-bold text-gray-800">ยังไม่มีรายการที่บันทึก</h3>
                    <p className="text-gray-500 text-sm mb-6">คุณยังไม่ได้กดหัวใจให้รถคันไหนเลย</p>
                    <Link href="/buy" className="bg-primary text-white px-6 py-2 rounded-xl font-bold hover:bg-opacity-90 transition">
                        ค้นหารถถูกใจ
                    </Link>
                </div>
            )}
        </div>
    );
}
