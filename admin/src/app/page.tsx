"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Users,
  Car,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Eye,
  AlertCircle,
  Package
} from "lucide-react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

// shadcn/ui components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DashboardData {
  stats: {
    totalUsers: number;
    activeListings: number;
    pendingListings: number;
    monthlyRevenue: number;
    usersChange: number;
    listingsChange: number;
    revenueChange: number;
  };
  recentListings: {
    id: string;
    title: string;
    price: number;
    status: string;
    createdAt: string;
    user: { fullName: string };
    images: { url: string }[];
  }[];
  recentActivity: {
    type: string;
    text: string;
    time: string;
  }[];
}

function formatRelativeTime(isoString: string): string {
  const now = new Date();
  const date = new Date(isoString);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "เมื่อสักครู่";
  if (diffMin < 60) return `${diffMin} นาทีที่แล้ว`;
  if (diffHr < 24) return `${diffHr} ชั่วโมงที่แล้ว`;
  return `${diffDay} วันที่แล้ว`;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  PENDING: { label: "รอตรวจสอบ", className: "bg-amber-50 text-amber-600 hover:bg-amber-50" },
  ACTIVE: { label: "เผยแพร่แล้ว", className: "bg-emerald-50 text-emerald-600 hover:bg-emerald-50" },
  REJECTED: { label: "ถูกปฏิเสธ", className: "bg-rose-50 text-rose-600 hover:bg-rose-50" },
  SOLD: { label: "ขายแล้ว", className: "bg-blue-50 text-blue-600 hover:bg-blue-50" },
  EXPIRED: { label: "หมดอายุ", className: "bg-accent text-muted-foreground hover:bg-accent" },
};

const activityIcons: Record<string, { icon: typeof Users; bg: string }> = {
  user: { icon: Users, bg: "bg-blue-500" },
  listing: { icon: Car, bg: "bg-orange-500" },
  package: { icon: Package, bg: "bg-emerald-500" },
};

function SkeletonCard() {
  return (
    <Card className="rounded-xl border-border shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="h-11 w-11 bg-accent rounded-lg animate-pulse" />
          <div className="h-5 w-16 bg-accent rounded-md animate-pulse" />
        </div>
        <div className="h-3 w-24 bg-accent rounded animate-pulse mb-2" />
        <div className="h-7 w-20 bg-accent rounded animate-pulse" />
      </CardContent>
    </Card>
  );
}

export default function HomePage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/admin/dashboard")
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const stats = data ? [
    {
      name: "ผู้ใช้งานทั้งหมด",
      value: data.stats.totalUsers.toLocaleString(),
      change: `${data.stats.usersChange >= 0 ? "+" : ""}${data.stats.usersChange}%`,
      trending: data.stats.usersChange >= 0 ? "up" : "down",
      icon: Users, color: "text-blue-500", bg: "bg-blue-50"
    },
    {
      name: "ประกาศที่เผยแพร่",
      value: data.stats.activeListings.toLocaleString(),
      change: `${data.stats.listingsChange >= 0 ? "+" : ""}${data.stats.listingsChange}%`,
      trending: data.stats.listingsChange >= 0 ? "up" : "down",
      icon: Car, color: "text-orange-500", bg: "bg-orange-50"
    },
    {
      name: "ประกาศรอตรวจสอบ",
      value: data.stats.pendingListings.toLocaleString(),
      change: "",
      trending: data.stats.pendingListings > 0 ? "up" : "down",
      icon: AlertCircle, color: "text-purple-500", bg: "bg-purple-50"
    },
    {
      name: "รายได้รวม (เดือนนี้)",
      value: `฿${data.stats.monthlyRevenue.toLocaleString()}`,
      change: `${data.stats.revenueChange >= 0 ? "+" : ""}${data.stats.revenueChange}%`,
      trending: data.stats.revenueChange >= 0 ? "up" : "down",
      icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-50"
    },
  ] : [];

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">ยินดีต้อนรับกลับ, แอดมิน</h1>
        <p className="text-muted-foreground mt-1 text-sm">นี่คือภาพรวมของระบบ Car2Hand ในวันนี้</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          stats.map((stat) => (
            <Card key={stat.name} className="rounded-xl border-border shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`${stat.bg} p-3 rounded-lg`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  {stat.change && (
                    <Badge variant="secondary" className={`border-none font-semibold text-xs px-2 py-0.5 rounded-md ${stat.trending === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                      {stat.change}
                      {stat.trending === 'up' ? <ArrowUpRight className="ml-1 h-3 w-3" /> : <ArrowDownRight className="ml-1 h-3 w-3" />}
                    </Badge>
                  )}
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">{stat.name}</p>
                  <p className="text-2xl font-semibold text-foreground mt-1">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Listings */}
        <Card className="lg:col-span-2 rounded-xl border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between p-6 pb-4">
            <CardTitle className="text-lg font-semibold text-foreground">ประกาศขายล่าสุด</CardTitle>
            <Link href="/listings">
              <Button variant="ghost" className="text-primary font-medium rounded-lg h-9 px-3 text-sm">ดูทั้งหมด</Button>
            </Link>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="space-y-1">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-18 bg-accent rounded-lg animate-pulse flex-shrink-0" style={{ width: 72 }} />
                      <div>
                        <div className="h-4 w-40 bg-accent rounded animate-pulse mb-2" />
                        <div className="h-3 w-28 bg-accent rounded animate-pulse" />
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="h-4 w-20 bg-accent rounded animate-pulse mb-2" />
                      <div className="h-5 w-16 bg-accent rounded animate-pulse" />
                    </div>
                  </div>
                ))
              ) : data?.recentListings.length ? (
                data.recentListings.map((listing) => {
                  const status = statusConfig[listing.status] || statusConfig.PENDING;
                  return (
                    <div key={listing.id} className="flex items-center justify-between p-3 hover:bg-accent rounded-lg transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-18 bg-accent rounded-lg overflow-hidden flex-shrink-0" style={{ width: 72 }}>
                          {listing.images[0] ? (
                            <img src={listing.images[0].url} alt={listing.title} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <Car className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-foreground">{listing.title}</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            โดย {listing.user.fullName || "ไม่ระบุชื่อ"} • {formatRelativeTime(listing.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-primary">฿{Number(listing.price).toLocaleString()}</p>
                        <Badge className={`${status.className} border-none rounded-md text-xs font-medium px-1.5 py-0.5 mt-1`}>
                          {status.label}
                        </Badge>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm">ยังไม่มีประกาศขาย</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Activity Timeline */}
        <Card className="rounded-xl border-border shadow-sm">
          <CardHeader className="p-6 pb-4">
            <CardTitle className="text-lg font-semibold text-foreground">ความเคลื่อนไหวระบบ</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="flow-root">
              <ul className="-mb-8">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <li key={i}>
                      <div className="relative pb-8">
                        {i !== 3 && <span className="absolute left-4 top-8 -ml-px h-full w-0.5 bg-accent" />}
                        <div className="relative flex space-x-3">
                          <div className="h-8 w-8 bg-accent rounded-lg animate-pulse" />
                          <div className="flex-1 pt-0.5">
                            <div className="h-4 w-full bg-accent rounded animate-pulse mb-2" />
                            <div className="h-3 w-20 bg-accent rounded animate-pulse" />
                          </div>
                        </div>
                      </div>
                    </li>
                  ))
                ) : data?.recentActivity.length ? (
                  data.recentActivity.map((event, eventIdx) => {
                    const config = activityIcons[event.type] || activityIcons.user;
                    const Icon = config.icon;
                    return (
                      <li key={eventIdx}>
                        <div className="relative pb-8">
                          {eventIdx !== data.recentActivity.length - 1 && (
                            <span className="absolute left-4 top-8 -ml-px h-full w-0.5 bg-accent" aria-hidden="true" />
                          )}
                          <div className="relative flex space-x-3">
                            <div>
                              <span className={`h-8 w-8 rounded-lg ${config.bg} flex items-center justify-center`}>
                                <Icon className="h-4 w-4 text-white" aria-hidden="true" />
                              </span>
                            </div>
                            <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-0.5">
                              <div>
                                <p className="text-sm text-foreground font-medium leading-tight">{event.text}</p>
                                <p className="text-xs text-muted-foreground mt-1">{formatRelativeTime(event.time)}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })
                ) : (
                  <li className="text-center py-8 text-muted-foreground text-sm">ยังไม่มีกิจกรรม</li>
                )}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
