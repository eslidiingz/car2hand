"use client";

import React, { useState } from 'react';
import {
    User,
    EnvelopeSimple,
    Phone,
    LockKey,
    Bell,
    FloppyDisk
} from '@phosphor-icons/react';
import LineConnection from '@/components/settings/LineConnection';

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('profile');
    const [displayName, setDisplayName] = useState('Boy_CityZone');
    const [phoneNumber, setPhoneNumber] = useState('0812345678');

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 10);
        setPhoneNumber(value);
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">ตั้งค่าบัญชี (Settings)</h1>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('profile')}
                    className={`px-6 py-3 text-sm font-bold border-b-2 transition ${activeTab === 'profile' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    ข้อมูลส่วนตัว
                </button>
                <button
                    onClick={() => setActiveTab('security')}
                    className={`px-6 py-3 text-sm font-bold border-b-2 transition ${activeTab === 'security' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    รหัสผ่านและความปลอดภัย
                </button>
                <button
                    onClick={() => setActiveTab('notifications')}
                    className={`px-6 py-3 text-sm font-bold border-b-2 transition ${activeTab === 'notifications' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    การแจ้งเตือน
                </button>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                {activeTab === 'profile' && (
                    <div className="space-y-6 max-w-2xl">
                        <div className="flex items-center gap-6">
                            <div className="relative group cursor-pointer">
                                <img src="https://i.pravatar.cc/150?img=12" className="w-24 h-24 rounded-full object-cover border-4 border-gray-50" alt="Profile" />
                                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-white font-bold text-xs">
                                    เปลี่ยนรูป
                                </div>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800 text-lg">รูปโปรไฟล์</h3>
                                <p className="text-sm text-gray-500">รองรับไฟล์ JPG, PNG ขนาดไม่เกิน 2MB</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">ชื่อผู้ใช้ (Display Name)</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={18} />
                                    <input 
                                        type="text" 
                                        value={displayName} 
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        className="form-input-icon-sm font-medium" 
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">เบอร์โทรศัพท์</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={18} />
                                    <input 
                                        type="tel" 
                                        value={phoneNumber} 
                                        onChange={handlePhoneChange}
                                        className="form-input-icon-sm font-medium" 
                                        placeholder="08xxxxxxxx"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-bold text-gray-700">อีเมล</label>
                                <div className="relative">
                                    <EnvelopeSimple className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={18} />
                                    <input type="email" defaultValue="boy.cityzone@example.com" className="form-input-icon-sm font-medium text-gray-500" disabled />
                                </div>
                                <p className="text-xs text-gray-400">*อีเมลไม่สามารถเปลี่ยนได้ หากต้องการเปลี่ยนกรุณาติดต่อเจ้าหน้าที่</p>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-bold text-gray-700">เกี่ยวกับฉัน (Bio)</label>
                                <textarea rows={3} className="w-full p-4 border border-gray-200 rounded-xl bg-gray-50 focus:border-primary focus:bg-white outline-none transition text-sm" placeholder="เขียนแนะนำตัวสั้นๆ..."></textarea>
                            </div>
                        </div>
                    </div>
                )}

                {/* Other tabs would go here */}
                {activeTab === 'security' && (
                    <div className="text-center py-10 text-gray-500">
                        <LockKey size={48} className="mx-auto mb-4 text-gray-300" />
                        <p>ส่วนการตั้งค่ารหัสผ่าน (Mockup)</p>
                    </div>
                )}

                {activeTab === 'notifications' && (
                    <LineConnection />
                )}

                <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                    <button className="bg-primary text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-900/10 hover:bg-opacity-90 transition flex items-center gap-2">
                        <FloppyDisk weight="bold" /> บันทึกการเปลี่ยนแปลง
                    </button>
                </div>
            </div>
        </div>
    );
}
