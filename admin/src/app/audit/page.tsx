"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { ScrollText, Loader2, ChevronDown } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useDebounce } from "@/hooks/useDebounce";

interface AuditLog {
    id: string;
    adminId: string;
    action: string;
    targetType: string;
    targetId: string;
    note: string | null;
    metadata: unknown;
    ipAddress: string | null;
    createdAt: string;
    admin: { id: string; fullName: string; username: string } | null;
}

const ACTION_COLORS: Record<string, string> = {
    APPROVE: "text-green-700 bg-green-100",
    REJECT: "text-red-700 bg-red-100",
    BAN: "text-red-700 bg-red-100",
    DELETE: "text-red-700 bg-red-100",
    UPDATE: "text-blue-700 bg-blue-100",
    VERIFY: "text-emerald-700 bg-emerald-100",
    UNVERIFY: "text-amber-700 bg-amber-100",
    BULK: "text-purple-700 bg-purple-100",
};

function actionColor(action: string): string {
    for (const key of Object.keys(ACTION_COLORS)) {
        if (action.includes(key)) return ACTION_COLORS[key];
    }
    return "text-blue-700 bg-blue-100";
}

// Thai labels for common field names shown in audit diffs
const FIELD_LABELS: Record<string, string> = {
    // Listing
    title: "หัวข้อประกาศ",
    description: "รายละเอียด",
    price: "ราคา",
    mileage: "เลขไมล์",
    province: "จังหวัด",
    district: "อำเภอ",
    color: "สี",
    condition: "สภาพ",
    adminNote: "หมายเหตุแอดมิน",
    isFeatured: "แนะนำ",
    isPremium: "พรีเมียม",
    // User
    fullName: "ชื่อ",
    email: "อีเมล",
    phoneNumber: "เบอร์โทร",
    isActive: "สถานะใช้งาน",
    // SellerProfile
    shopName: "ชื่อร้าน",
    shopDescription: "คำอธิบายร้าน",
    shopAddress: "ที่อยู่",
    shopProvince: "จังหวัดร้าน",
    shopDistrict: "อำเภอร้าน",
    shopPhone: "เบอร์ร้าน",
    showroomType: "ประเภทร้าน",
    shopOpenHours: "เวลาทำการ",
    socialFacebook: "Facebook",
    socialLine: "LINE",
    socialInstagram: "Instagram",
    specializations: "ความเชี่ยวชาญ",
    verificationLevel: "ระดับยืนยัน",
    // GarageVehicle
    nickname: "ชื่อเล่น",
    licensePlate: "ทะเบียน",
    currentMileage: "เลขไมล์ปัจจุบัน",
    imageUrl: "รูปรถ",
};

function labelFor(field: string): string {
    return FIELD_LABELS[field] || field;
}

function formatValue(v: unknown): string {
    if (v === null || v === undefined || v === "") return "—";
    if (typeof v === "boolean") return v ? "เปิด" : "ปิด";
    if (typeof v === "number") return v.toLocaleString("th-TH");
    if (Array.isArray(v)) return v.length === 0 ? "—" : v.map(formatValue).join(", ");
    if (typeof v === "object") {
        try { return JSON.stringify(v); } catch { return String(v); }
    }
    const s = String(v);
    return s.length > 120 ? s.slice(0, 120) + "…" : s;
}

interface ChangeEntry { before: unknown; after: unknown }

function parseMetadata(raw: unknown): {
    changes?: Record<string, ChangeEntry>;
    other?: Record<string, unknown>;
} {
    if (!raw || typeof raw !== "object") return {};
    const obj = raw as Record<string, unknown>;
    const result: { changes?: Record<string, ChangeEntry>; other?: Record<string, unknown> } = {};

    if (obj.changes && typeof obj.changes === "object") {
        result.changes = obj.changes as Record<string, ChangeEntry>;
    }
    const rest: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
        if (k === "changes") continue;
        rest[k] = v;
    }
    if (Object.keys(rest).length > 0) result.other = rest;
    return result;
}

function MetadataViewer({ metadata }: { metadata: unknown }) {
    const [open, setOpen] = useState(false);
    const parsed = parseMetadata(metadata);
    const hasChanges = parsed.changes && Object.keys(parsed.changes).length > 0;
    const hasOther = parsed.other && Object.keys(parsed.other).length > 0;

    if (!hasChanges && !hasOther) return null;

    const changeCount = parsed.changes ? Object.keys(parsed.changes).length : 0;

    return (
        <div className="mt-2">
            <button
                onClick={() => setOpen((v) => !v)}
                className="text-xs text-primary hover:underline inline-flex items-center gap-1 font-medium"
            >
                <ChevronDown size={12} className={`transition-transform ${open ? "rotate-180" : ""}`} />
                {hasChanges
                    ? `รายละเอียดการแก้ไข (${changeCount} field)`
                    : "ข้อมูลเพิ่มเติม"}
            </button>

            {open && (
                <div className="mt-2 space-y-2">
                    {hasChanges && parsed.changes && (
                        <div className="bg-muted/50 border border-border rounded-lg overflow-hidden">
                            <table className="w-full text-xs">
                                <thead className="bg-muted">
                                    <tr className="text-left text-muted-foreground">
                                        <th className="px-3 py-2 font-medium">Field</th>
                                        <th className="px-3 py-2 font-medium">ก่อน</th>
                                        <th className="px-3 py-2 font-medium">หลัง</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {Object.entries(parsed.changes).map(([field, { before, after }]) => (
                                        <tr key={field}>
                                            <td className="px-3 py-2 font-medium text-foreground whitespace-nowrap">{labelFor(field)}</td>
                                            <td className="px-3 py-2 text-rose-600 break-words max-w-[240px]">{formatValue(before)}</td>
                                            <td className="px-3 py-2 text-emerald-600 break-words max-w-[240px]">{formatValue(after)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {hasOther && parsed.other && (
                        <div className="bg-muted/50 border border-border rounded-lg p-3">
                            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
                                {Object.entries(parsed.other).map(([k, v]) => (
                                    <div key={k} className="contents">
                                        <dt className="text-muted-foreground font-medium whitespace-nowrap">{labelFor(k)}:</dt>
                                        <dd className="text-foreground break-words">{formatValue(v)}</dd>
                                    </div>
                                ))}
                            </dl>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default function AdminAuditPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionFilter, setActionFilter] = useState("");
    const [targetFilter, setTargetFilter] = useState("");
    const debouncedActionFilter = useDebounce(actionFilter, 500);

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ limit: "100" });
            if (debouncedActionFilter) params.set("action", debouncedActionFilter);
            if (targetFilter) params.set("targetType", targetFilter);
            const data = await apiFetch(`/admin/audit?${params}`);
            setLogs(data.logs || []);
        } catch {
            toast.error("โหลดประวัติไม่สำเร็จ");
        } finally {
            setLoading(false);
        }
    }, [debouncedActionFilter, targetFilter]);

    useEffect(() => { fetchLogs(); }, [fetchLogs]);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <ScrollText className="text-primary" /> ประวัติการทำงาน (Audit Log)
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">บันทึกทุกการกระทำของแอดมิน — อนุมัติ, ปฏิเสธ, แก้ไข, ลบ</p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    <select
                        value={targetFilter}
                        onChange={(e) => setTargetFilter(e.target.value)}
                        className="h-9 px-3 rounded-xl border border-border bg-background text-sm"
                    >
                        <option value="">ทุกประเภท</option>
                        <option value="KYC">KYC</option>
                        <option value="LISTING">ประกาศ</option>
                        <option value="USER">ผู้ใช้</option>
                        <option value="SELLER_PROFILE">ร้านค้า</option>
                        <option value="GARAGE_VEHICLE">โรงรถ</option>
                        <option value="TRANSACTION">Transaction</option>
                        <option value="FORUM_POST">กระทู้</option>
                        <option value="CONTACT">กล่องข้อความ</option>
                        <option value="REPORT">รายงาน</option>
                    </select>
                    <input
                        type="text"
                        value={actionFilter}
                        onChange={(e) => setActionFilter(e.target.value)}
                        placeholder="ค้นหา action เช่น APPROVE, UPDATE, DELETE"
                        className="h-9 px-3 rounded-xl border border-border bg-background text-sm flex-1 max-w-sm"
                    />
                </div>

                <div className="bg-card border border-border rounded-2xl overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-16"><Loader2 className="animate-spin text-primary" /></div>
                    ) : logs.length === 0 ? (
                        <div className="text-center py-16 text-muted-foreground text-sm">ยังไม่มีประวัติ</div>
                    ) : (
                        <div className="divide-y divide-border">
                            {logs.map((l) => (
                                <div key={l.id} className="p-4 flex items-start gap-3 hover:bg-muted/30">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${actionColor(l.action)}`}>{l.action}</span>
                                            <span className="text-xs text-muted-foreground">→ {l.targetType} · <code className="text-[11px]">{l.targetId.slice(0, 16)}{l.targetId.length > 16 ? "…" : ""}</code></span>
                                        </div>
                                        <div className="text-sm mt-1">
                                            <strong>{l.admin?.fullName || l.adminId.slice(0, 8)}</strong>
                                            <span className="text-muted-foreground"> ({l.admin?.username || "unknown"})</span>
                                        </div>
                                        {l.note && <div className="text-xs text-muted-foreground mt-1 italic">&ldquo;{l.note}&rdquo;</div>}
                                        <MetadataViewer metadata={l.metadata} />
                                    </div>
                                    <div className="text-xs text-muted-foreground whitespace-nowrap text-right">
                                        <div>{new Date(l.createdAt).toLocaleString("th-TH")}</div>
                                        {l.ipAddress && <div className="font-mono mt-0.5">{l.ipAddress}</div>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
