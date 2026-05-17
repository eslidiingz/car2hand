"use client";

import React, { useRef } from 'react';
import Link from 'next/link';
import { Sparkles, ChevronRight, ChevronLeft } from 'lucide-react';
import ListingCard, { VehicleListing } from './ListingCard';

// `listings` is fetched server-side and streamed in via <Suspense> — this
// component is now purely presentational (carousel scroll only).
export default function FeaturedListings({ listings }: { listings: VehicleListing[] }) {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (!scrollRef.current) return;
        const scrollAmount = 320;
        scrollRef.current.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth'
        });
    };

    // Don't render section if no featured listings
    if (listings.length === 0) return null;

    return (
        <section className="max-w-7xl mx-auto px-4 mt-12">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
                    <Sparkles className="text-amber-500" />
                    ประกาศแนะนำ
                </h2>
                <Link
                    href="/buy"
                    className="text-accent font-bold text-sm flex items-center gap-1 hover:underline"
                >
                    ดูทั้งหมด <ChevronRight />
                </Link>
            </div>

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
        </section>
    );
}
