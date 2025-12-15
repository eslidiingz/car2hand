"use client";

import React from 'react';
import {
    Plus,
    CarProfile,
    Wrench,
    Drop,
    Warning
} from '@phosphor-icons/react';

export default function GaragePage() {
    const myCars = [
        {
            id: 1,
            name: 'Mazda 2 SkyActiv',
            plate: 'กก 1234',
            image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=300',
            km: 45000,
            status: 'Normal',
            maintenance: [
                { name: 'ต่อภาษี', date: '12 ธ.ค. 67', urgent: true },
                { name: 'เปลี่ยนน้ำมันเครื่อง', km: 50000, urgent: false }
            ]
        },
        {
            id: 2,
            name: 'Honda CR-V G4',
            plate: 'ฮฮ 9999',
            image: 'https://images.unsplash.com/photo-1568844293986-8d0400bd4745?auto=format&fit=crop&q=80&w=300',
            km: 120000,
            status: 'Warning',
            maintenance: [
                { name: 'เช็คระยะ 120,000 กม.', date: 'ทันที', urgent: true }
            ]
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">โรงรถของฉัน (My Garage)</h1>
                <button className="bg-primary text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-opacity-90 transition">
                    <Plus weight="bold" /> เพิ่มรถ
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {myCars.map((car) => (
                    <div key={car.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group">
                        <div className="relative h-48">
                            <img src={car.image} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" alt={car.name} />
                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-bold shadow-sm">
                                {car.plate}
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900">{car.name}</h3>
                                    <p className="text-sm text-gray-500 flex items-center gap-1">
                                        <CarProfile /> {car.km.toLocaleString()} กม.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">แจ้งเตือนการดูแล</p>
                                {car.maintenance.map((item, i) => (
                                    <div key={i} className={`flex items-center justify-between p-3 rounded-xl border ${item.urgent ? 'bg-red-50 border-red-100 text-red-700' : 'bg-gray-50 border-gray-100 text-gray-700'}`}>
                                        <div className="flex items-center gap-3">
                                            {item.urgent ? <Warning weight="fill" /> : <Wrench weight="fill" className="text-gray-400" />}
                                            <span className="text-sm font-medium">{item.name}</span>
                                        </div>
                                        <span className="text-xs font-bold">{item.date || `ที่ ${item.km?.toLocaleString()} กม.`}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-2 mt-6">
                                <button className="flex-1 border border-gray-200 py-2 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 transition">ประวัติซ่อม</button>
                                <button className="flex-1 bg-primary text-white py-2 rounded-lg text-sm font-bold hover:bg-opacity-90 transition">บันทึกซ่อม</button>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Add New Car Placeholder */}
                <button className="border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center p-12 text-gray-400 hover:bg-gray-50 hover:border-gray-300 transition gap-4 min-h-[300px]">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-primary">
                        <Plus weight="bold" size={32} />
                    </div>
                    <span className="font-bold">เพิ่มรถคันใหม่</span>
                </button>
            </div>
        </div>
    );
}
