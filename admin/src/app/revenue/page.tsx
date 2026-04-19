"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { BarChart3, Loader2, Download } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

interface Summary {
    totalRevenue: number;
    totalTransactions: number;
    byMonth: Array<{ month: string; revenue: number; count: number }>;
    byPackage: Array<{ name: string; revenue: number; count: number }>;
}

function fmtBaht(n: number): string {
    return "฿" + n.toLocaleString("th-TH");
}

export default function AdminRevenuePage() {
    const [summary, setSummary] = useState<Summary | null>(null);
    const [loading, setLoading] = useState(true);
    const [months, setMonths] = useState(12);
    const [exportFrom, setExportFrom] = useState(() => {
        const d = new Date();
        d.setMonth(d.getMonth() - 1);
        return d.toISOString().slice(0, 10);
    });
    const [exportTo, setExportTo] = useState(() => new Date().toISOString().slice(0, 10));

    const fetch = useCallback(async () => {
        setLoading(true);
        try {
            const data = await apiFetch(`/admin/revenue/summary?months=${months}`);
            setSummary(data);
        } catch {
            toast.error("โหลดข้อมูลไม่สำเร็จ");
        } finally {
            setLoading(false);
        }
    }, [months]);

    useEffect(() => { fetch(); }, [fetch]);

    const handleExport = async () => {
        try {
            // Build URL with auth token (since browser download can't easily set headers)
            const token = (() => {
                try {
                    const raw = localStorage.getItem("admin") || sessionStorage.getItem("admin");
                    return raw ? JSON.parse(raw).token : null;
                } catch { return null; }
            })();

            const res = await window.fetch(
                `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/admin/revenue/export?from=${exportFrom}&to=${exportTo}`,
                { headers: token ? { Authorization: `Bearer ${token}` } : {} },
            );
            if (!res.ok) { toast.error("ดาวน์โหลดไม่สำเร็จ"); return; }
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `transactions_${exportFrom}_${exportTo}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        } catch {
            toast.error("ดาวน์โหลดไม่สำเร็จ");
        }
    };

    const maxMonthRevenue = summary?.byMonth.length ? Math.max(...summary.byMonth.map((m) => m.revenue)) : 0;

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <BarChart3 className="text-primary" /> รายงานรายรับ
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">สรุปยอดขายแพ็กเกจและส่งออกข้อมูลเป็น CSV</p>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-card border border-border rounded-2xl p-5">
                        <div className="text-xs text-muted-foreground">รายรับรวม ({months} เดือนล่าสุด)</div>
                        <div className="text-3xl font-bold text-primary mt-1">{summary ? fmtBaht(summary.totalRevenue) : "—"}</div>
                    </div>
                    <div className="bg-card border border-border rounded-2xl p-5">
                        <div className="text-xs text-muted-foreground">จำนวนรายการที่อนุมัติ</div>
                        <div className="text-3xl font-bold mt-1">{summary?.totalTransactions.toLocaleString() || "—"}</div>
                    </div>
                </div>

                {/* By month */}
                <div className="bg-card border border-border rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold">รายได้รายเดือน</h3>
                        <select
                            value={months}
                            onChange={(e) => setMonths(Number(e.target.value))}
                            className="h-9 px-3 rounded-xl border border-border bg-background text-sm"
                        >
                            <option value={6}>6 เดือน</option>
                            <option value={12}>12 เดือน</option>
                            <option value={24}>24 เดือน</option>
                        </select>
                    </div>
                    {loading ? (
                        <div className="flex items-center justify-center py-12"><Loader2 className="animate-spin text-primary" /></div>
                    ) : !summary?.byMonth.length ? (
                        <div className="text-center py-12 text-muted-foreground text-sm">ยังไม่มีข้อมูลในช่วงนี้</div>
                    ) : (
                        <div className="space-y-2">
                            {summary.byMonth.map((m) => (
                                <div key={m.month} className="flex items-center gap-3">
                                    <div className="w-20 text-xs text-muted-foreground font-mono">{m.month}</div>
                                    <div className="flex-1 h-6 bg-muted rounded-md overflow-hidden relative">
                                        <div
                                            className="h-full bg-primary transition-all"
                                            style={{ width: `${maxMonthRevenue > 0 ? (m.revenue / maxMonthRevenue) * 100 : 0}%` }}
                                        />
                                    </div>
                                    <div className="w-32 text-right text-sm font-medium">{fmtBaht(m.revenue)}</div>
                                    <div className="w-16 text-right text-xs text-muted-foreground">{m.count} rx</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* By package */}
                <div className="bg-card border border-border rounded-2xl p-5">
                    <h3 className="font-bold mb-4">แบ่งตามแพ็กเกจ</h3>
                    {!summary?.byPackage.length ? (
                        <div className="text-center py-8 text-muted-foreground text-sm">ไม่มีข้อมูล</div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {summary.byPackage.map((p) => (
                                <div key={p.name} className="border border-border rounded-xl p-3">
                                    <div className="text-xs text-muted-foreground">{p.name}</div>
                                    <div className="text-lg font-bold mt-1">{fmtBaht(p.revenue)}</div>
                                    <div className="text-xs text-muted-foreground">{p.count} รายการ</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* CSV export */}
                <div className="bg-card border border-border rounded-2xl p-5">
                    <h3 className="font-bold mb-1">ส่งออก CSV</h3>
                    <p className="text-sm text-muted-foreground mb-4">ดาวน์โหลดรายการ transactions ในช่วงที่กำหนด (รวม Thai characters)</p>
                    <div className="flex items-end gap-3 flex-wrap">
                        <div>
                            <label className="text-xs font-medium block mb-1">จากวันที่</label>
                            <input type="date" value={exportFrom} onChange={(e) => setExportFrom(e.target.value)} className="h-9 px-3 rounded-xl border border-border bg-background text-sm" />
                        </div>
                        <div>
                            <label className="text-xs font-medium block mb-1">ถึงวันที่</label>
                            <input type="date" value={exportTo} onChange={(e) => setExportTo(e.target.value)} className="h-9 px-3 rounded-xl border border-border bg-background text-sm" />
                        </div>
                        <Button onClick={handleExport} className="gap-2">
                            <Download size={16} /> ดาวน์โหลด CSV
                        </Button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
