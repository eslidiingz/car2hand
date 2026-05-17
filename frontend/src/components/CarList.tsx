"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Loader2, ChevronRight, ChevronDown, Clock } from 'lucide-react';
import ListingCard, { VehicleListing } from './ListingCard';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

/**
 * รถมาใหม่วันนี้ — all ACTIVE listings ordered by createdAt desc (no package filter).
 * Backend: GET /api/listings/new — returns up to 12 items.
 * Shows 8 initially, "ดูเพิ่มเติม" expands to 12, then "ดูรถทั้งหมด" → /buy.
 */
export default function CarList() {
    const [allListings, setAllListings] = useState<VehicleListing[]>([]);
    const [displayCount, setDisplayCount] = useState(8);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchListings = async () => {
            try {
                const res = await fetch(`${API_URL}/listings/new`);
                const data = await res.json();
                setAllListings((data.listings || []).slice(0, 12));
            } catch (error) {
                console.error('Error fetching new listings:', error);
                setAllListings([]);
            } finally {
                setLoading(false);
            }
        };

        fetchListings();
    }, []);

    const visibleListings = allListings.slice(0, displayCount);
    const hasMore = allListings.length > displayCount;

    return (
        <section className="max-w-7xl mx-auto px-4 pt-12 pb-16">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
                    <Clock className="text-accent" />
                    รถมาใหม่วันนี้
                </h2>
                <Link
                    href="/buy"
                    className="text-accent font-bold text-sm flex items-center gap-1 hover:underline"
                >
                    ดูทั้งหมด <ChevronRight />
                </Link>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                        <Loader2 size={48} className="animate-spin text-primary mx-auto mb-4" />
                        <p className="text-gray-500">กำลังโหลด...</p>
                    </div>
                </div>
            ) : visibleListings.length === 0 ? (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center">
                    <p className="text-gray-500">ยังไม่มีรถลงขายในขณะนี้</p>
                    <Link href="/sellLandingPage" className="mt-4 inline-block bg-accent text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-600 transition">
                        ลงขายรถของคุณ
                    </Link>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {visibleListings.map((listing) => (
                            <ListingCard key={`${listing.id}`} listing={listing} />
                        ))}
                    </div>
                    <div className="text-center mt-6">
                        {hasMore ? (
                            <button
                                onClick={() => setDisplayCount(12)}
                                className="text-accent font-bold hover:underline inline-flex items-center gap-1"
                            >
                                ดูเพิ่มเติม <ChevronDown size={16} />
                            </button>
                        ) : (
                            <Link
                                href="/buy"
                                className="text-accent font-bold hover:underline inline-flex items-center gap-1"
                            >
                                ดูรถทั้งหมด <ChevronRight size={16} />
                            </Link>
                        )}
                    </div>
                </>
            )}
        </section>
    );
}
