"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
    ArrowLeft,
    CheckCircle,
    SpinnerGap,
    Phone,
    MapPin,
    Calendar,
    Clock,
    Receipt,
    Warning,
    CarProfile,
    ChatCircleDots,
    Storefront
} from '@phosphor-icons/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface BookingDetails {
    id: string;
    referenceId: string;
    packageName: string;
    date: string;
    time: string;
    location: string;
    contactName: string;
    contactPhone: string;
    carBrand: string;
    carModel: string;
    basePrice: number;
    vat: number;
    total: number;
    status: string;
}

const nextSteps = [
    { step: 1, title: 'เจ้าหน้าที่จะโทรยืนยันภายใน 2 ชั่วโมง', icon: Phone },
    { step: 2, title: 'ชำระเงินผ่าน QR Code หรือโอนเงิน', icon: Receipt },
    { step: 3, title: 'ช่างจะไปตรวจรถตามนัดหมาย', icon: CarProfile },
    { step: 4, title: 'รับรายงานผลผ่านแอปภายใน 60 นาที', icon: ChatCircleDots },
];

function ConfirmationContent() {
    const searchParams = useSearchParams();
    const bookingId = searchParams.get('bookingId');

    const [booking, setBooking] = useState<BookingDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!bookingId) {
            setError('ไม่พบหมายเลขการจอง');
            setIsLoading(false);
            return;
        }

        const fetchBooking = async () => {
            try {
                const res = await fetch(`${API_URL}/services/bookings/${bookingId}`);
                if (!res.ok) throw new Error('Booking not found');
                const data = await res.json();
                setBooking(data);
            } catch {
                setError('ไม่พบข้อมูลการจอง กรุณาตรวจสอบหมายเลขอีกครั้ง');
            } finally {
                setIsLoading(false);
            }
        };

        fetchBooking();
    }, [bookingId]);

    // Loading state
    if (isLoading) {
        return (
            <div className="pt-32 pb-20 flex flex-col items-center justify-center px-4">
                <SpinnerGap weight="bold" className="text-primary text-5xl animate-spin mb-4" />
                <p className="text-gray-500">กำลังโหลดข้อมูลการจอง...</p>
            </div>
        );
    }

    // Error state
    if (error || !booking) {
        return (
            <div className="pt-32 pb-20 flex flex-col items-center justify-center px-4">
                <div className="bg-white rounded-3xl p-10 shadow-lg border border-gray-100 max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Warning weight="fill" className="text-red-500 text-5xl" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">ไม่พบข้อมูลการจอง</h2>
                    <p className="text-gray-500 mb-8">{error || 'เกิดข้อผิดพลาดบางอย่าง กรุณาลองใหม่อีกครั้ง'}</p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link href="/services" className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-900 transition">
                            กลับหน้าบริการ
                        </Link>
                        <Link href="/services/inspection" className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition">
                            จองคิวใหม่
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Success state
    return (
        <div className="pt-24 pb-20 px-4">
            <div className="max-w-2xl mx-auto">

                {/* Success Header */}
                <div className="text-center mb-8">
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                        <CheckCircle weight="fill" className="text-green-500 text-6xl" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">จองคิวตรวจสภาพสำเร็จ!</h1>
                    <p className="text-gray-500">หมายเลขอ้างอิง: <span className="font-bold text-primary">{booking.referenceId}</span></p>
                </div>

                {/* Booking Summary Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-8">
                    <div className="bg-primary p-4 text-white">
                        <h3 className="font-bold text-lg">รายละเอียดการจอง</h3>
                    </div>

                    <div className="p-6 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-primary shrink-0">
                                <CarProfile weight="fill" className="text-xl" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">แพ็กเกจ</p>
                                <p className="font-bold text-gray-800">{booking.packageName}</p>
                            </div>
                        </div>

                        <div className="h-px bg-gray-100"></div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-primary shrink-0">
                                    <Calendar weight="fill" className="text-xl" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400">วันที่</p>
                                    <p className="font-bold text-gray-800 text-sm">{booking.date}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-primary shrink-0">
                                    <Clock weight="fill" className="text-xl" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400">เวลา</p>
                                    <p className="font-bold text-gray-800 text-sm">{booking.time}</p>
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-gray-100"></div>

                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-primary shrink-0">
                                <MapPin weight="fill" className="text-xl" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">สถานที่</p>
                                <p className="font-bold text-gray-800 text-sm">{booking.location}</p>
                            </div>
                        </div>

                        <div className="h-px bg-gray-100"></div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-primary shrink-0">
                                    <Phone weight="fill" className="text-xl" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400">ผู้ติดต่อ</p>
                                    <p className="font-bold text-gray-800 text-sm">{booking.contactName}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">เบอร์โทร</p>
                                <p className="font-bold text-gray-800 text-sm">{booking.contactPhone}</p>
                            </div>
                        </div>

                        <div className="h-px bg-gray-100"></div>

                        {/* Price Breakdown */}
                        <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">ค่าบริการตรวจสภาพ</span>
                                <span className="font-bold text-gray-800">{booking.basePrice.toLocaleString()} ฿</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">ภาษีมูลค่าเพิ่ม (7%)</span>
                                <span className="font-bold text-gray-800">{booking.vat.toLocaleString()} ฿</span>
                            </div>
                            <div className="h-px bg-gray-200"></div>
                            <div className="flex justify-between">
                                <span className="font-bold text-gray-600">ยอดรวมทั้งสิ้น</span>
                                <span className="font-bold text-primary text-xl">{booking.total.toLocaleString()} ฿</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Next Steps */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
                    <h3 className="font-bold text-gray-800 text-lg mb-6">ขั้นตอนถัดไป</h3>

                    <div className="space-y-0">
                        {nextSteps.map((item, i) => (
                            <div key={i} className="flex gap-4">
                                <div className="flex flex-col items-center">
                                    <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center shrink-0">
                                        <item.icon weight="fill" className="text-xl" />
                                    </div>
                                    {i < nextSteps.length - 1 && (
                                        <div className="w-0.5 h-8 bg-green-200 my-1"></div>
                                    )}
                                </div>
                                <div className="pb-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs bg-green-50 text-green-600 font-bold px-2 py-0.5 rounded-full">ขั้นตอนที่ {item.step}</span>
                                    </div>
                                    <p className="font-medium text-gray-700 mt-1">{item.title}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                        href="/services"
                        className="flex-1 bg-primary text-white py-3 rounded-xl font-bold hover:bg-blue-900 transition text-center flex items-center justify-center gap-2"
                    >
                        <ArrowLeft weight="bold" /> กลับหน้าบริการ
                    </Link>
                    <Link
                        href="/buy"
                        className="flex-1 bg-accent text-white py-3 rounded-xl font-bold hover:bg-orange-600 transition text-center flex items-center justify-center gap-2"
                    >
                        <Storefront weight="fill" /> ดูประกาศขายรถ
                    </Link>
                </div>

            </div>
        </div>
    );
}

export default function InspectionConfirmationPage() {
    return (
        <div className="bg-surface text-gray-800 min-h-screen">

            {/* Nav */}
            <nav className="bg-white shadow-sm fixed w-full z-50 top-0 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-2">
                    <Link href="/services" className="text-gray-500 hover:text-primary"><ArrowLeft weight="bold" className="text-xl" /></Link>
                    <span className="font-bold text-xl text-primary">ยืนยันการจอง</span>
                </div>
            </nav>

            <Suspense fallback={
                <div className="pt-32 pb-20 flex flex-col items-center justify-center px-4">
                    <SpinnerGap weight="bold" className="text-primary text-5xl animate-spin mb-4" />
                    <p className="text-gray-500">กำลังโหลด...</p>
                </div>
            }>
                <ConfirmationContent />
            </Suspense>
        </div>
    );
}
