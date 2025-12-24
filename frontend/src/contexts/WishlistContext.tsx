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
    engineSize?: number | null;
    seats?: number | null;
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
    // Wishlist (requires login, stored in database)
    wishlist: WishlistItem[];
    isInWishlist: (id: string) => boolean;
    addToWishlist: (item: WishlistItem) => Promise<{ success: boolean; message: string; requiresLogin?: boolean }>;
    removeFromWishlist: (id: string) => Promise<void>;
    toggleWishlist: (item: WishlistItem) => Promise<{ success: boolean; message: string; added: boolean; requiresLogin?: boolean }>;
    clearWishlist: () => Promise<void>;
    loadWishlist: () => Promise<void>;

    // Compare (no login required, stored in localStorage)
    compareList: WishlistItem[];
    isInCompare: (id: string) => boolean;
    addToCompare: (item: WishlistItem) => { success: boolean; message: string };
    removeFromCompare: (id: string) => void;
    toggleCompare: (item: WishlistItem) => { success: boolean; message: string; added: boolean };
    clearCompare: () => void;
    maxCompareItems: number;

    // Auth status
    isLoggedIn: boolean;
    isLoading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const COMPARE_STORAGE_KEY = 'car2hand_compare';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Helper to get auth token
const getAuthToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (!userData) return null;
    try {
        const user = JSON.parse(userData);
        return user.token || null;
    } catch {
        return null;
    }
};

export function WishlistProvider({ children }: { children: React.ReactNode }) {
    const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
    const [compareList, setCompareList] = useState<WishlistItem[]>([]);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Load compare list from localStorage on mount
    useEffect(() => {
        try {
            const storedCompare = localStorage.getItem(COMPARE_STORAGE_KEY);
            if (storedCompare) {
                setCompareList(JSON.parse(storedCompare));
            }
        } catch (error) {
            console.error('Error loading compare list:', error);
        }

        // Check login status
        const user = localStorage.getItem('user') || sessionStorage.getItem('user');
        setIsLoggedIn(!!user);
        setIsLoading(false);
    }, []);

    // Save compare to localStorage
    useEffect(() => {
        localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(compareList));
    }, [compareList]);

    // Load wishlist from API when logged in
    const loadWishlist = useCallback(async () => {
        const token = getAuthToken();
        if (!token) {
            setWishlist([]);
            return;
        }

        try {
            const response = await fetch(`${API_URL}/wishlists`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setWishlist(data.wishlists || []);
            }
        } catch (error) {
            console.error('Error loading wishlist:', error);
        }
    }, []);

    // Listen for login/logout changes
    useEffect(() => {
        const handleStorageChange = () => {
            const user = localStorage.getItem('user') || sessionStorage.getItem('user');
            const wasLoggedIn = isLoggedIn;
            const nowLoggedIn = !!user;
            setIsLoggedIn(nowLoggedIn);

            // If user just logged in, load wishlist from server
            if (nowLoggedIn && !wasLoggedIn) {
                loadWishlist();
            }
            // If user logged out, clear wishlist
            if (!nowLoggedIn && wasLoggedIn) {
                setWishlist([]);
            }
        };

        // Handle custom login event (dispatched from LoginModal)
        const handleUserLogin = () => {
            setIsLoggedIn(true);
            loadWishlist();
        };

        // Handle custom logout event
        const handleUserLogout = () => {
            setIsLoggedIn(false);
            setWishlist([]);
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('userLogin', handleUserLogin);
        window.addEventListener('userLogout', handleUserLogout);
        const interval = setInterval(handleStorageChange, 1000);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('userLogin', handleUserLogin);
            window.removeEventListener('userLogout', handleUserLogout);
            clearInterval(interval);
        };
    }, [isLoggedIn, loadWishlist]);

    // Load wishlist on mount if logged in
    useEffect(() => {
        if (isLoggedIn) {
            loadWishlist();
        }
    }, [isLoggedIn, loadWishlist]);

    // Max compare items based on login status (3 without login, 5 with login)
    const maxCompareItems = isLoggedIn ? 5 : 3;

    // ============ WISHLIST FUNCTIONS (Requires Login, stored in DB) ============

    const isInWishlist = useCallback((id: string) => {
        return wishlist.some(item => item.id === id);
    }, [wishlist]);

    const addToWishlist = useCallback(async (item: WishlistItem): Promise<{ success: boolean; message: string; requiresLogin?: boolean }> => {
        const token = getAuthToken();

        // Must be logged in to use wishlist
        if (!token) {
            return {
                success: false,
                message: 'กรุณาเข้าสู่ระบบเพื่อบันทึกรายการโปรด',
                requiresLogin: true
            };
        }

        // Check if already in wishlist
        if (isInWishlist(item.id)) {
            return { success: false, message: 'รายการนี้อยู่ในรายการโปรดแล้ว' };
        }

        try {
            const response = await fetch(`${API_URL}/wishlists/${item.id}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (data.success) {
                // Add to local state
                const newItem = {
                    ...item,
                    addedAt: new Date().toISOString()
                };
                setWishlist(prev => [...prev, newItem]);
            }

            return { success: data.success, message: data.message };
        } catch (error) {
            console.error('Error adding to wishlist:', error);
            return { success: false, message: 'เกิดข้อผิดพลาด กรุณาลองใหม่' };
        }
    }, [isInWishlist]);

    const removeFromWishlist = useCallback(async (id: string) => {
        const token = getAuthToken();
        if (!token) return;

        // Optimistic update - remove from state immediately
        const previousWishlist = wishlist;
        setWishlist(prev => prev.filter(item => item.id !== id));

        try {
            const response = await fetch(`${API_URL}/wishlists/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                // Revert on error
                setWishlist(previousWishlist);
            }
        } catch (error) {
            console.error('Error removing from wishlist:', error);
            // Revert on error
            setWishlist(previousWishlist);
        }
    }, [wishlist]);

    const toggleWishlist = useCallback(async (item: WishlistItem): Promise<{ success: boolean; message: string; added: boolean; requiresLogin?: boolean }> => {
        const token = getAuthToken();

        // Must be logged in
        if (!token) {
            return {
                success: false,
                message: 'กรุณาเข้าสู่ระบบเพื่อบันทึกรายการโปรด',
                added: false,
                requiresLogin: true
            };
        }

        if (isInWishlist(item.id)) {
            await removeFromWishlist(item.id);
            return { success: true, message: 'ลบออกจากรายการโปรดแล้ว', added: false };
        } else {
            const result = await addToWishlist(item);
            return { ...result, added: result.success };
        }
    }, [isInWishlist, addToWishlist, removeFromWishlist]);

    const clearWishlist = useCallback(async () => {
        const token = getAuthToken();
        if (!token) return;

        try {
            const response = await fetch(`${API_URL}/wishlists`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                setWishlist([]);
            }
        } catch (error) {
            console.error('Error clearing wishlist:', error);
        }
    }, []);

    // ============ COMPARE FUNCTIONS (No Login Required, stored in localStorage) ============

    const isInCompare = useCallback((id: string) => {
        return compareList.some(item => item.id === id);
    }, [compareList]);

    const addToCompare = useCallback((item: WishlistItem): { success: boolean; message: string } => {
        // Check if already in compare
        if (isInCompare(item.id)) {
            return { success: false, message: 'รายการนี้อยู่ในรายการเปรียบเทียบแล้ว' };
        }

        // Check limit
        if (compareList.length >= maxCompareItems) {
            if (!isLoggedIn) {
                return {
                    success: false,
                    message: `เปรียบเทียบได้สูงสุด ${maxCompareItems} รายการ เข้าสู่ระบบเพื่อเปรียบเทียบได้ 5 รายการ`
                };
            }
            return {
                success: false,
                message: `เปรียบเทียบได้สูงสุด ${maxCompareItems} รายการ`
            };
        }

        const newItem = {
            ...item,
            addedAt: new Date().toISOString()
        };

        setCompareList(prev => [...prev, newItem]);
        return { success: true, message: 'เพิ่มในรายการเปรียบเทียบแล้ว' };
    }, [isInCompare, compareList.length, maxCompareItems, isLoggedIn]);

    const removeFromCompare = useCallback((id: string) => {
        setCompareList(prev => prev.filter(item => item.id !== id));
    }, []);

    const toggleCompare = useCallback((item: WishlistItem): { success: boolean; message: string; added: boolean } => {
        if (isInCompare(item.id)) {
            removeFromCompare(item.id);
            return { success: true, message: 'ลบออกจากรายการเปรียบเทียบแล้ว', added: false };
        } else {
            const result = addToCompare(item);
            return { ...result, added: result.success };
        }
    }, [isInCompare, addToCompare, removeFromCompare]);

    const clearCompare = useCallback(() => {
        setCompareList([]);
    }, []);

    const contextValue = React.useMemo(() => ({
        // Wishlist
        wishlist,
        isInWishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        clearWishlist,
        loadWishlist,

        // Compare
        compareList,
        isInCompare,
        addToCompare,
        removeFromCompare,
        toggleCompare,
        clearCompare,
        maxCompareItems,

        // Auth & Status
        isLoggedIn,
        isLoading
    }), [
        wishlist, isInWishlist, addToWishlist, removeFromWishlist, toggleWishlist, clearWishlist, loadWishlist,
        compareList, isInCompare, addToCompare, removeFromCompare, toggleCompare, clearCompare, maxCompareItems,
        isLoggedIn, isLoading
    ]);

    return (
        <WishlistContext.Provider value={contextValue}>
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
