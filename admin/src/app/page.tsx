import DashboardLayout from "@/components/DashboardLayout";
import {
  Users,
  Car,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Eye
} from "lucide-react";

// shadcn/ui components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function HomePage() {
  const stats = [
    { name: "ผู้ใช้งานทั้งหมด", value: "1,284", change: "+12.5%", trending: "up", icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
    { name: "รถประกาศขายใหม่", value: "156", change: "+8.2%", trending: "up", icon: Car, color: "text-orange-500", bg: "bg-orange-50" },
    { name: "การเยี่ยมชมวันนี้", value: "8,432", change: "-2.4%", trending: "down", icon: Eye, color: "text-purple-500", bg: "bg-purple-50" },
    { name: "รายได้รวม (เดือนนี้)", value: "฿142,500", change: "+14.8%", trending: "up", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-50" },
  ];

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">ยินดีต้อนรับกลับ, แอดมิน</h1>
        <p className="text-slate-500 mt-1 text-sm">นี่คือภาพรวมของระบบ Car2Hand ในวันนี้</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.name} className="rounded-xl border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.bg} p-3 rounded-lg`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <Badge variant="secondary" className={`border-none font-semibold text-xs px-2 py-0.5 rounded-md ${stat.trending === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                  }`}>
                  {stat.change}
                  {stat.trending === 'up' ? <ArrowUpRight className="ml-1 h-3 w-3" /> : <ArrowDownRight className="ml-1 h-3 w-3" />}
                </Badge>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">{stat.name}</p>
                <p className="text-2xl font-semibold text-slate-800 mt-1">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Listings */}
        <Card className="lg:col-span-2 rounded-xl border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between p-6 pb-4">
            <CardTitle className="text-lg font-semibold text-slate-800">ประกาศขายล่าสุด</CardTitle>
            <Button variant="ghost" className="text-primary font-medium rounded-lg h-9 px-3 text-sm">ดูทั้งหมด</Button>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="space-y-1">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-18 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={`https://picsum.photos/seed/${i + 10}/200/150`}
                        alt="Car"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-800">Honda Civic 1.5 Turbo RS</h3>
                      <p className="text-xs text-slate-500 mt-0.5">โดย สมหมาย ขายรถ • 2 นาทีที่แล้ว</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-primary">฿890,000</p>
                    <Badge className="bg-amber-50 text-amber-600 hover:bg-amber-50 border-none rounded-md text-xs font-medium px-1.5 py-0.5 mt-1">Pending</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Insights */}
        <Card className="rounded-xl border-slate-200 shadow-sm">
          <CardHeader className="p-6 pb-4">
            <CardTitle className="text-lg font-semibold text-slate-800">ความเคลื่อนไหวระบบ</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="flow-root">
              <ul className="-mb-8">
                {[
                  { type: 'user', text: 'ธีรเดช บูทิก สมัครสมาชิกใหม่', time: '10 นาทีที่แล้ว', icon: Users, bg: 'bg-blue-500' },
                  { type: 'listing', text: 'Toyota Camry บรอนซ์เงิน ลงขายสำเร็จ', time: '25 นาทีที่แล้ว', icon: Car, bg: 'bg-orange-500' },
                  { type: 'package', text: 'คุณรสริน อัปเกรดเป็น Gold Package', time: '1 ชั่วโมงที่แล้ว', icon: TrendingUp, bg: 'bg-emerald-500' },
                  { type: 'system', text: 'สำรองข้อมูลระบบประจำวันเสร็จสมบูรณ์', time: '3 ชั่วโมงที่แล้ว', icon: Clock, bg: 'bg-slate-500' },
                ].map((event, eventIdx) => (
                  <li key={eventIdx}>
                    <div className="relative pb-8">
                      {eventIdx !== 3 ? (
                        <span className="absolute left-4 top-8 -ml-px h-full w-0.5 bg-slate-100" aria-hidden="true"></span>
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className={`h-8 w-8 rounded-lg ${event.bg} flex items-center justify-center`}>
                            <event.icon className="h-4 w-4 text-white" aria-hidden="true" />
                          </span>
                        </div>
                        <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-0.5">
                          <div>
                            <p className="text-sm text-slate-700 font-medium leading-tight">{event.text}</p>
                            <p className="text-xs text-slate-400 mt-1">{event.time}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <Button variant="ghost" className="w-full mt-2 text-slate-400 font-medium border-t border-slate-100 pt-4 rounded-none hover:bg-transparent hover:text-primary text-sm">
              แสดงกิจกรรมทั้งหมด
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
