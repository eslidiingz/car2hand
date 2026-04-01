"use client";

import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { PendingProvider } from "@/contexts/PendingContext";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isLoading, admin } = useAuth();

    if (isLoading) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-background">
                <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                <p className="text-muted-foreground font-medium">กำลังเตรียมข้อมูล...</p>
            </div>
        );
    }

    if (!admin) {
        return null; // AuthContext handles redirect
    }

    return (
        <PendingProvider>
            <div className="flex h-screen bg-background overflow-hidden">
                {/* Sidebar - Desktop */}
                <div className="hidden md:flex md:flex-shrink-0">
                    <Sidebar />
                </div>

                <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                    <Navbar />

                    {/* Main Content Area */}
                    <main className="flex-1 relative overflow-y-auto focus:outline-none custom-scrollbar p-6">
                        <div className="max-w-7xl mx-auto">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </PendingProvider>
    );
}
