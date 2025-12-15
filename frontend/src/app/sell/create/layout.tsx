"use client";

import { ListingProvider } from '@/contexts/ListingContext';

export default function SellLayout({ children }: { children: React.ReactNode }) {
    return (
        <ListingProvider>
            {children}
        </ListingProvider>
    );
}
