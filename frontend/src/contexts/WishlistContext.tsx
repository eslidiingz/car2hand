"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Types
export interface WishlistItem {
    id: string;
    title: string;
    price: number;
    negotiable?: boolean;
    vehicleType?: 'CAR' | 'MOTORCYCLE';
    brand: string;
    model: string;
    year: number;
    mileage?: number | null;
    fuelType?: string;
    transmission?: string | null;
    province?: string;
    imageUrl?: string;
    images?: { url: string; isPrimary: boolean }[];
    user?: {
        id: string;
        fullName: string;
    };
    addedAt: string;
}

interface WishlistContextType {
    wishlist: WishlistItem[];
    isInWishlist: (id: string) => boolean;
    addToWishlist: (item: WishlistItem) => { success: boolean; message: string };
    removeFromWishlist: (id: string) => void;
    toggleWishlist: (item: WishlistItem) => { success: boolean; message: string; added: boolean };
    clearWishlist: () => void;
    getCompareItems: () => WishlistItem[];
    canAddMore: () => boolean;
    maxItems: number;
    maxCompareItems: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const STORAGE_KEY = 'car2hand_wishlist';

export function WishlistProvider({ children }: { children: React.ReactNode }) {
    const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Load wishlist from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                setWishlist(parsed);
            }
        } catch (error) {
            console.error('Error loading wishlist:', error);
        }

        // Check login status
        const user = localStorage.getItem('user') || sessionStorage.getItem('user');
        setIsLoggedIn(!!user);
    }, []);

    // Save to localStorage whenever wishlist changes
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlist));
    }, [wishlist]);

    // Listen for login/logout changes
    useEffect(() => {
        const handleStorageChange = () => {
            const user = localStorage.getItem('user') || sessionStorage.getItem('user');
            setIsLoggedIn(!!user);
        };

        window.addEventListener('storage', handleStorageChange);

        // Also check periodically
        const interval = setInterval(handleStorageChange, 1000);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(interval);
        };
    }, []);

    // Max items based on login status
    const maxItems = isLoggedIn ? Infinity : 3;
    const maxCompareItems = isLoggedIn ? 5 : 3;

    const isInWishlist = useCallback((id: string) => {
        return wishlist.some(item => item.id === id);
    }, [wishlist]);

    const canAddMore = useCallback(() => {
        if (isLoggedIn) return true;
        return wishlist.length < 3;
    }, [isLoggedIn, wishlist.length]);

    const addToWishlist = useCallback((item: WishlistItem): { success: boolean; message: string } => {
        // Check if already in wishlist
        if (isInWishlist(item.id)) {
            return { success: false, message: 'รายการนี้อยู่ในรายการโปรดแล้ว' };
        }

        // Check limit for non-logged in users
        if (!isLoggedIn && wishlist.length >= 3) {
            return {
                success: false,
                message: 'กรุณาเข้าสู่ระบบเพื่อเพิ่มรายการโปรดได้ไม่จำกัด (ขณะนี้ครบ 3 รายการแล้ว)'
            };
        }

        const newItem = {
            ...item,
            addedAt: new Date().toISOString()
        };

        setWishlist(prev => [...prev, newItem]);
        return { success: true, message: 'เพิ่มในรายการโปรดแล้ว' };
    }, [isLoggedIn, wishlist.length, isInWishlist]);

    const removeFromWishlist = useCallback((id: string) => {
        setWishlist(prev => prev.filter(item => item.id !== id));
    }, []);

    const toggleWishlist = useCallback((item: WishlistItem): { success: boolean; message: string; added: boolean } => {
        if (isInWishlist(item.id)) {
            removeFromWishlist(item.id);
            return { success: true, message: 'ลบออกจากรายการโปรดแล้ว', added: false };
        } else {
            const result = addToWishlist(item);
            return { ...result, added: result.success };
        }
    }, [isInWishlist, addToWishlist, removeFromWishlist]);

    const clearWishlist = useCallback(() => {
        setWishlist([]);
    }, []);

    const getCompareItems = useCallback(() => {
        // Return first N items for comparison based on login status
        const limit = isLoggedIn ? 5 : 3;
        return wishlist.slice(0, limit);
    }, [wishlist, isLoggedIn]);

    return (
        <WishlistContext.Provider
            value={{
                wishlist,
                isInWishlist,
                addToWishlist,
                removeFromWishlist,
                toggleWishlist,
                clearWishlist,
                getCompareItems,
                canAddMore,
                maxItems,
                maxCompareItems
            }}
        >
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    const context = useContext(WishlistContext);
    if (context === undefined) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
}
