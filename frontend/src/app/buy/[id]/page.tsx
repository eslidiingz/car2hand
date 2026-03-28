import React from 'react';
import type { Metadata } from 'next';
import ListingDetailClient, { VehicleListing } from './ListingDetailClient';
import { ArrowLeft, WarningCircle, ClockCountdown } from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface ListingResponse {
    listing: VehicleListing | null;
    expired?: boolean;
    message?: string;
}

async function getListing(id: string): Promise<ListingResponse> {
    try {
        const response = await fetch(`${API_BASE}/listings/${id}`, {
            next: { revalidate: 60 }
        });

        if (!response.ok) return { listing: null };

        const data = await response.json();
        return { listing: data.listing, expired: data.expired };
    } catch (error) {
        console.error('Error fetching listing:', error);
        return { listing: null };
    }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const { listing, expired } = await getListing(id);

    if (expired) return { title: 'ประกาศหมดอายุ | CAR2Hand' };
    if (!listing) return { title: 'ไม่พบประกาศ | CAR2Hand' };

    return {
        title: `${listing.year} ${listing.brand} ${listing.model} | CAR2Hand`,
        description: listing.description || `ขาย ${listing.title} ราคา ฿${listing.price.toLocaleString()} ที่ CAR2Hand`,
        openGraph: {
            images: listing.images[0]?.url ? [listing.images[0].url] : [],
        }
    };
}

export default async function CarDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { listing, expired } = await getListing(id);

    // ประกาศหมดอายุ — ไม่แสดงข้อมูลรถ
    if (expired) {
        return (
            <div className="bg-surface min-h-screen pt-8 pb-12">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                        <ClockCountdown size={64} weight="duotone" className="text-orange-400 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-700 mb-2">ประกาศนี้หมดอายุแล้ว</h2>
                        <p className="text-gray-500 mb-6">ประกาศนี้ไม่สามารถแสดงผลได้ในขณะนี้ เนื่องจากหมดอายุแล้ว</p>
                        <Link href="/buy" className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-opacity-90 transition inline-flex items-center gap-2">
                            <ArrowLeft weight="bold" /> กลับไปหน้ารายการ
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // ไม่พบประกาศ
    if (!listing) {
        return (
            <div className="bg-surface min-h-screen pt-8 pb-12">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                        <WarningCircle size={64} className="text-red-400 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-700 mb-2">ไม่พบประกาศ</h2>
                        <p className="text-gray-500 mb-6">ประกาศนี้อาจถูกลบหรือไม่มีอยู่</p>
                        <Link href="/buy" className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-opacity-90 transition inline-flex items-center gap-2">
                            <ArrowLeft weight="bold" /> กลับไปหน้ารายการ
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return <ListingDetailClient listing={listing} />;
}
