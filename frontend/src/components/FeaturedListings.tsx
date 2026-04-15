"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Sparkles, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import ListingCard, { VehicleListing } from './ListingCard';

export default function FeaturedListings() {
    const [listings, setListings] = useState<VehicleListing[]>([]);
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchFeatured = async () => {
            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
                const response = await fetch(`${API_URL}/listings/featured`);
                const data = await response.json();
                setListings(data.listings || []);
            } catch (error) {
                console.error('Error fetching featured listings:', error);
                setListings([]);
            } finally {
                setLoading(false);
            }
        };

        fetchFeatured();
    }, []);

    const scroll = (direction: 'left' | 'right') => {
        if (!scrollRef.current) return;
        const scrollAmount = 320;
        scrollRef.current.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth'
        });
    };

    // Don't render section if no featured listings
    if (!loading && listings.length === 0) return null;

    return (
        <section className="max-w-7xl mx-auto px-4 mt-12">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
                    <Sparkles className="text-amber-500" />
                    ประกาศแนะนำ
                    <span className="text-xs bg-amber-50 text-amber-600 px-2 py-1 rounded-full font-bold">Featured</span>
                </h2>
                <Link
                    href="/buy"
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
                    {/* Scroll buttons */}
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
