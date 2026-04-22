"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Bike, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import ListingCard, { VehicleListing } from './ListingCard';

/**
 * มอเตอร์ไซค์ — homepage section for MOTORCYCLE listings.
 * Backend: GET /api/listings/motorcycles (already filters vehicleType=MOTORCYCLE).
 *
 * Business rule: hide the entire section when the site has fewer than 4
 * motorcycle listings — we don't want a sparse row of 1–3 cards to imply
 * motorcycles are a first-class category yet.
 */
const MIN_MOTORCYCLES_TO_SHOW = 4;

export default function MotorcycleListings() {
    const [listings, setListings] = useState<VehicleListing[]>([]);
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchMotorcycles = async () => {
            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
                const response = await fetch(`${API_URL}/listings/motorcycles`);
                const data = await response.json();
                setListings(data.listings || []);
            } catch (error) {
                console.error('Error fetching motorcycle listings:', error);
                setListings([]);
            } finally {
                setLoading(false);
            }
        };
        fetchMotorcycles();
    }, []);

    const scroll = (direction: 'left' | 'right') => {
        if (!scrollRef.current) return;
        scrollRef.current.scrollBy({
            left: direction === 'left' ? -320 : 320,
            behavior: 'smooth',
        });
    };

    // Hide section entirely when under threshold — motorcycles are de-emphasised
    if (!loading && listings.length < MIN_MOTORCYCLES_TO_SHOW) return null;

    return (
        <section className="max-w-7xl mx-auto px-4 mt-12">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
                    <Bike className="text-emerald-500" />
                    มอเตอร์ไซค์
                    <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full font-bold">Motorcycle</span>
                </h2>
                <Link
                    href="/buy?vehicleType=MOTORCYCLE"
                    className="text-accent font-bold text-sm flex items-center gap-1 hover:underline"
                >
                    ดูทั้งหมด <ChevronRight />
                </Link>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 size={36} className="animate-spin text-primary" />
                </div>
            ) : (
                <div className="relative group">
                    {listings.length > 3 && (
                        <>
                            <button
                                onClick={() => scroll('left')}
                                className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-primary opacity-0 group-hover:opacity-100 transition"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <button
                                onClick={() => scroll('right')}
                                className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-primary opacity-0 group-hover:opacity-100 transition"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </>
                    )}

                    <div
                        ref={scrollRef}
                        className="flex gap-6 overflow-x-auto scrollbar-hide pb-6 snap-x snap-mandatory"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {listings.map((listing) => (
                            <div key={listing.id} className="flex-shrink-0 w-[280px] sm:w-[300px] snap-start">
                                <ListingCard listing={listing} />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
}
