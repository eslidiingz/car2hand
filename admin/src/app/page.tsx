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
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">ยินดีต้อนรับกลับ, แอดมิน</h1>
        <p className="text-slate-500 mt-1 font-medium">นี่คือภาพรวมของระบบ Car2Hand ในวันนี้</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-10">
        {stats.map((stat) => (
          <Card key={stat.name} className="rounded-[32px] border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 group overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.bg} p-4 rounded-2xl group-hover:scale-110 transition-transform duration-500`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <Badge variant="secondary" className={`border-none font-black italic text-[10px] px-2.5 py-1 rounded-lg ${stat.trending === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                  }`}>
                  {stat.change}
                  {stat.trending === 'up' ? <ArrowUpRight className="ml-1 h-3 w-3" /> : <ArrowDownRight className="ml-1 h-3 w-3" />}
                </Badge>
              </div>
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{stat.name}</p>
                <p className="text-3xl font-bold text-slate-800 mt-2">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Recent Listings */}
        <Card className="lg:col-span-2 rounded-[40px] border-slate-100 shadow-sm bg-white overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between p-8 pb-4">
            <CardTitle className="text-xl font-bold text-slate-800">ประกาศขายล่าสุด</CardTitle>
            <Button variant="ghost" className="text-primary font-bold rounded-xl h-10 px-4">ดูทั้งหมด</Button>
          </CardHeader>
          <CardContent className="p-8 pt-0">
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-[24px] transition-all group border border-transparent hover:border-slate-100">
                  <div className="flex items-center gap-5">
                    <div className="h-16 w-20 bg-slate-100 rounded-2xl overflow-hidden flex-shrink-0 shadow-sm">
                      <img
                        src={`https://picsum.photos/seed/${i + 10}/200/150`}
                        alt="Car"
                        className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-800">Honda Civic 1.5 Turbo RS</h3>
                      <p className="text-xs text-slate-500 mt-1 font-medium">โดย สมหมาย ขายรถ • 2 นาทีที่แล้ว</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">฿890,000</p>
                    <Badge className="bg-blue-50 text-blue-600 hover:bg-blue-50 border-none rounded-lg text-[10px] font-black italic px-2 py-0.5 mt-1">PENDING</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Insights */}
        <Card className="rounded-[40px] border-slate-100 shadow-sm bg-white overflow-hidden">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="text-xl font-bold text-slate-800">ความเคลื่อนไวระบบ</CardTitle>
          </CardHeader>
          <CardContent className="p-8 pt-4">
            <div className="flow-root">
              <ul className="-mb-8">
                {[
                  { type: 'user', text: 'ธีรเดช บูทิก สมัครสมาชิกใหม่', time: '10 นาทีที่แล้ว', icon: Users, bg: 'bg-blue-500', shadow: 'shadow-blue-200' },
                  { type: 'listing', text: 'Toyota Camry บรอนซ์เงิน ลงขายสำเร็จ', time: '25 นาทีที่แล้ว', icon: Car, bg: 'bg-orange-500', shadow: 'shadow-orange-200' },
                  { type: 'package', text: 'คุณรสริน อัปเกรดเป็น Gold Package', time: '1 ชั่วโมงที่แล้ว', icon: TrendingUp, bg: 'bg-emerald-500', shadow: 'shadow-emerald-200' },
                  { type: 'system', text: 'สำรองข้อมูลระบบประจำวันเสร็จสมบูรณ์', time: '3 ชั่วโมงที่แล้ว', icon: Clock, bg: 'bg-slate-500', shadow: 'shadow-slate-200' },
                ].map((event, eventIdx) => (
                  <li key={eventIdx}>
                    <div className="relative pb-10">
                      {eventIdx !== 3 ? (
                        <span className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-slate-50" aria-hidden="true"></span>
                      ) : null}
                      <div className="relative flex space-x-4">
                        <div>
                          <span className={`h-10 w-10 rounded-xl ${event.bg} flex items-center justify-center ring-4 ring-white shadow-lg ${event.shadow}`}>
                            <event.icon className="h-5 w-5 text-white" aria-hidden="true" />
                          </span>
                        </div>
                        <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1">
                          <div>
                            <p className="text-sm text-slate-700 font-bold leading-tight">{event.text}</p>
                            <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-widest">{event.time}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <Button variant="ghost" className="w-full mt-2 text-slate-400 font-bold border-t border-slate-50 pt-8 rounded-none hover:bg-transparent hover:text-primary">
              แสดงกิจกรรมทั้งหมด
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
