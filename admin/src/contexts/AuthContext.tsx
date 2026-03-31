"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface AdminData {
    id: string;
    fullName: string;
    username: string;
}

interface AuthContextType {
    admin: AdminData | null;
    isLoading: boolean;
    login: (token: string, admin: AdminData, rememberMe: boolean) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [admin, setAdmin] = useState<AdminData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const checkAuth = () => {
            const storedAdmin = localStorage.getItem('admin_user');
            const token = localStorage.getItem('admin_token');

            if (storedAdmin && token) {
                try {
                    setAdmin(JSON.parse(storedAdmin));
                } catch {
                    localStorage.removeItem('admin_user');
                    localStorage.removeItem('admin_token');
                }
            }
            setIsLoading(false);
        };

        checkAuth();
    }, []);

    useEffect(() => {
        if (!isLoading) {
            if (!admin && pathname !== '/login') {
                router.push('/login');
            } else if (admin && pathname === '/login') {
                router.push('/');
            }
        }
    }, [admin, isLoading, pathname, router]);

    const login = (token: string, adminData: AdminData, rememberMe: boolean) => {
        setAdmin(adminData);
        localStorage.setItem('admin_token', token);
        localStorage.setItem('admin_user', JSON.stringify(adminData));
        router.push('/');
    };

    const logout = () => {
        setAdmin(null);
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ admin, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
