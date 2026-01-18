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

export default function HomePage() {
  const stats = [
    { name: "ผู้ใช้งานทั้งหมด", value: "1,284", change: "+12.5%", trending: "up", icon: Users, color: "bg-blue-500" },
    { name: "รถประกาศขายใหม่", value: "156", change: "+8.2%", trending: "up", icon: Car, color: "bg-orange-500" },
    { name: "การเยี่ยมชมวันนี้", value: "8,432", change: "-2.4%", trending: "down", icon: Eye, color: "bg-purple-500" },
    { name: "รายได้รวม (เดือนนี้)", value: "฿142,500", change: "+14.8%", trending: "up", icon: TrendingUp, color: "bg-emerald-500" },
  ];

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">ยินดีต้อนรับกลับ, คุณสมชาย</h1>
        <p className="text-slate-500 mt-1">นี่คือภาพรวมของระบบ Car2Hand ในวันนี้</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} bg-opacity-10 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className={`h-6 w-6 ${stat.color.replace('bg-', 'text-')}`} />
              </div>
              <div className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${stat.trending === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                }`}>
                {stat.change}
                {stat.trending === 'up' ? <ArrowUpRight className="ml-1 h-3 w-3" /> : <ArrowDownRight className="ml-1 h-3 w-3" />}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.name}</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Listings */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-800">ประกาศขายล่าสุด</h2>
            <button className="btn btn-ghost btn-sm text-primary">ดูทั้งหมด</button>
          </div>

          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100 group">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-16 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={`https://picsum.photos/seed/${i + 10}/200/150`} alt="Car" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Honda Civic 1.5 Turbo RS</h3>
                    <p className="text-xs text-slate-500 mt-0.5">โดย สมหมาย ขายรถ • 2 นาทีที่แล้ว</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-primary">฿890,000</p>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 mt-1 uppercase tracking-wider">รอตรวจสอบ</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Insights */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-6">ความเคลื่อนไหวระบบ</h2>
          <div className="flow-root">
            <ul className="-mb-8">
              {[
                { type: 'user', text: 'ธีรเดช บูทิก สมัครสมาชิกใหม่', time: '10 นาทีที่แล้ว', icon: Users, color: 'bg-blue-500' },
                { type: 'listing', text: 'Toyota Camry บรอนซ์เงิน ลงขายสำเร็จ', time: '25 นาทีที่แล้ว', icon: Car, color: 'bg-orange-500' },
                { type: 'package', text: 'คุณรสริน อัปเกรดเป็น Gold Package', time: '1 ชั่วโมงที่แล้ว', icon: TrendingUp, color: 'bg-emerald-500' },
                { type: 'system', text: 'สำรองข้อมูลระบบประจำวันเสร็จสมบูรณ์', time: '3 ชั่วโมงที่แล้ว', icon: Clock, color: 'bg-slate-500' },
              ].map((event, eventIdx) => (
                <li key={eventIdx}>
                  <div className="relative pb-8">
                    {eventIdx !== 3 ? (
                      <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-slate-100" aria-hidden="true"></span>
                    ) : null}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className={`h-8 w-8 rounded-lg ${event.color} flex items-center justify-center ring-4 ring-white`}>
                          <event.icon className="h-4 w-4 text-white" aria-hidden="true" />
                        </span>
                      </div>
                      <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                        <div>
                          <p className="text-xs text-slate-600 font-medium">{event.text}</p>
                        </div>
                        <div className="whitespace-nowrap text-right text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                          {event.time}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <button className="btn btn-ghost btn-md w-full mt-4 text-slate-400 border-t border-slate-50 pt-4 rounded-none">แสดงกิจกรรมทั้งหมด</button>
        </div>
      </div>
    </DashboardLayout>
  );
}
