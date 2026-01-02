"use client";

import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            {/* Sidebar - Desktop */}
            <div className="hidden md:flex md:flex-shrink-0">
                <Sidebar />
            </div>

            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                <Navbar />

                {/* Main Content Area */}
                <main className="flex-1 relative overflow-y-auto focus:outline-none custom-scrollbar p-8">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
