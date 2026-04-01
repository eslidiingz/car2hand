"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";
import { toast } from "sonner";
import {
    Wrench,
    CalendarCheck,
    MessageSquare,
    Settings,
    ArrowRight,
    Clock,
    Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface DashboardStats {
    totalBookings: number;
    pendingBookings: number;
    totalInquiries: number;
    newInquiries: number;
}

export default function AdminServicesPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            const res = await apiFetch("/admin/services/dashboard");
            if (res.ok) {
                const data = await res.json();
                setStats(data.data || data);
            } else {
                toast.error("ไม่สามารถโหลดข้อมูลแดชบอร์ดได้");
            }
        } catch {
            toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        {
            title: "การจองทั้งหมด",
            value: stats?.totalBookings ?? 0,
            icon: CalendarCheck,
            color: "text-blue-600",
            bg: "bg-blue-50",
        },
        {
            title: "รอดำเนินการ",
            value: stats?.pendingBookings ?? 0,
            icon: Clock,
            color: "text-yellow-600",
            bg: "bg-yellow-50",
        },
        {
            title: "สอบถามทั้งหมด",
            value: stats?.totalInquiries ?? 0,
            icon: MessageSquare,
            color: "text-purple-600",
            bg: "bg-purple-50",
        },
        {
            title: "สอบถามใหม่",
            value: stats?.newInquiries ?? 0,
            icon: MessageSquare,
            color: "text-green-600",
            bg: "bg-green-50",
        },
    ];

    const quickLinks = [
        {
            title: "จัดการการจอง",
            description: "ดูและจัดการการจองบริการตรวจสภาพรถ",
            href: "/services/bookings",
            icon: CalendarCheck,
            color: "text-blue-600",
        },
        {
            title: "จัดการการสอบถาม",
            description: "ดูและตอบกลับการสอบถามจากลูกค้า",
            href: "/services/inquiries",
            icon: MessageSquare,
            color: "text-purple-600",
        },
        {
            title: "ตั้งค่าบริการ",
            description: "จัดการแพ็กเกจตรวจสภาพและพาร์ทเนอร์",
            href: "/services/settings",
            icon: Settings,
            color: "text-muted-foreground",
        },
    ];

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <Wrench className="h-6 w-6 text-foreground" />
                    <h1 className="text-2xl font-bold text-foreground">จัดการบริการ</h1>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {statCards.map((card) => (
                        <Card key={card.title}>
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">{card.title}</p>
                                        <p className="mt-1 text-2xl font-bold text-foreground">
                                            {loading ? (
                                                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                            ) : (
                                                card.value.toLocaleString()
                                            )}
                                        </p>
                                    </div>
                                    <div className={`rounded-lg p-3 ${card.bg}`}>
                                        <card.icon className={`h-5 w-5 ${card.color}`} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Quick Action Cards */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {quickLinks.map((link) => (
                        <Link key={link.href} href={link.href}>
                            <Card className="cursor-pointer transition-shadow hover:shadow-md h-full">
                                <CardContent className="flex items-center gap-4 p-5">
                                    <div className="rounded-lg bg-muted p-3">
                                        <link.icon className={`h-6 w-6 ${link.color}`} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-foreground">{link.title}</h3>
                                        <p className="mt-0.5 text-sm text-muted-foreground">
                                            {link.description}
                                        </p>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}
