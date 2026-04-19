"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { Warehouse, Loader2, Search, Car, Pencil, Trash2, Save, X as XIcon } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";

interface GarageVehicle {
    id: string;
    nickname: string;
    brand: string;
    model: string;
    year: number | null;
    color: string | null;
    licensePlate: string | null;
    currentMileage: number;
    imageUrl: string | null;
    createdAt: string;
    user: { id: string; fullName: string; email: string };
    _count: { serviceRecords: number; reminders: number };
}

type EditForm = {
    nickname: string;
    licensePlate: string;
    color: string;
    currentMileage: string;
    imageUrl: string;
};

export default function AdminGaragePage() {
    const [vehicles, setVehicles] = useState<GarageVehicle[]>([]);
    const [stats, setStats] = useState({ totalVehicles: 0, totalUsers: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 500);

    // Edit state
    const [editVehicle, setEditVehicle] = useState<GarageVehicle | null>(null);
    const [form, setForm] = useState<EditForm>({
        nickname: "",
        licensePlate: "",
        color: "",
        currentMileage: "",
        imageUrl: "",
    });
    const [saving, setSaving] = useState(false);

    // Delete state
    const [deleteVehicle, setDeleteVehicle] = useState<GarageVehicle | null>(null);
    const [deleting, setDeleting] = useState(false);

    const fetchList = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (debouncedSearch) params.set("search", debouncedSearch);
            const data = await apiFetch(`/admin/garage?${params}`);
            setVehicles(data.vehicles || []);
            setStats(data.stats || { totalVehicles: 0, totalUsers: 0 });
        } catch {
            toast.error("โหลดข้อมูลไม่สำเร็จ");
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch]);

    useEffect(() => {
        fetchList();
    }, [fetchList]);

    const openEdit = (v: GarageVehicle) => {
        setEditVehicle(v);
        setForm({
            nickname: v.nickname ?? "",
            licensePlate: v.licensePlate ?? "",
            color: v.color ?? "",
            currentMileage: String(v.currentMileage ?? 0),
            imageUrl: v.imageUrl ?? "",
        });
    };

    const closeEdit = () => setEditVehicle(null);

    const handleSave = async () => {
        if (!editVehicle) return;
        if (!form.nickname.trim()) {
            toast.error("กรุณากรอกชื่อเล่น");
            return;
        }
        const mileageNum = Number(form.currentMileage);
        if (!isFinite(mileageNum) || mileageNum < 0) {
            toast.error("เลขไมล์ไม่ถูกต้อง");
            return;
        }

        setSaving(true);
        try {
            const body = {
                nickname: form.nickname,
                licensePlate: form.licensePlate,
                color: form.color,
                currentMileage: mileageNum,
                imageUrl: form.imageUrl,
            };
            const res = await apiFetch(`/admin/garage/${editVehicle.id}`, {
                method: "PUT",
                body: JSON.stringify(body),
            });
            toast.success(res?.message || "บันทึกสำเร็จ");
            setEditVehicle(null);
            fetchList();
        } catch (err: any) {
            toast.error(err?.message || "เกิดข้อผิดพลาด");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteVehicle) return;
        setDeleting(true);
        try {
            const res = await apiFetch(`/admin/garage/${deleteVehicle.id}`, {
                method: "DELETE",
            });
            toast.success(res?.message || "ลบรถเรียบร้อย");
            setDeleteVehicle(null);
            fetchList();
        } catch (err: any) {
            toast.error(err?.message || "ไม่สามารถลบรถได้");
            setDeleting(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Warehouse className="text-primary" /> โรงรถของผู้ใช้
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">จัดการข้อมูลรถในโรงรถส่วนตัวของผู้ใช้</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-card border border-border rounded-2xl p-4">
                        <div className="text-xs text-muted-foreground">รถทั้งหมดในระบบ</div>
                        <div className="text-3xl font-bold mt-1">{stats.totalVehicles.toLocaleString()}</div>
                    </div>
                    <div className="bg-card border border-border rounded-2xl p-4">
                        <div className="text-xs text-muted-foreground">ผู้ใช้ที่มีโรงรถ</div>
                        <div className="text-3xl font-bold mt-1">{stats.totalUsers.toLocaleString()}</div>
                    </div>
                </div>

                <div className="relative max-w-md">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="ค้นหา: ชื่อรถ / ยี่ห้อ / ทะเบียน / เจ้าของ..."
                        className="w-full h-10 pl-9 pr-3 rounded-xl border border-border bg-background text-sm"
                    />
                </div>

                <div className="bg-card border border-border rounded-2xl overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="animate-spin text-primary" />
                        </div>
                    ) : vehicles.length === 0 ? (
                        <div className="text-center py-16 text-muted-foreground text-sm">ไม่พบข้อมูล</div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-muted/40 text-left text-xs text-muted-foreground">
                                <tr>
                                    <th className="px-4 py-3 font-medium">รถ</th>
                                    <th className="px-4 py-3 font-medium">เจ้าของ</th>
                                    <th className="px-4 py-3 font-medium">ทะเบียน</th>
                                    <th className="px-4 py-3 font-medium">กิโลเมตร</th>
                                    <th className="px-4 py-3 font-medium">ประวัติ</th>
                                    <th className="px-4 py-3 font-medium text-right">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {vehicles.map((v) => (
                                    <tr key={v.id} className="hover:bg-muted/30">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                                                    {v.imageUrl ? (
                                                        // eslint-disable-next-line @next/next/no-img-element
                                                        <img src={v.imageUrl} alt={v.nickname} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Car size={20} className="text-muted-foreground" />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-medium text-sm truncate">{v.nickname}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {v.brand} {v.model} {v.year || ""}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            <div>{v.user.fullName}</div>
                                            <div className="text-xs text-muted-foreground">{v.user.email}</div>
                                        </td>
                                        <td className="px-4 py-3 font-mono text-sm">{v.licensePlate || "-"}</td>
                                        <td className="px-4 py-3 text-sm">{v.currentMileage.toLocaleString()} กม.</td>
                                        <td className="px-4 py-3 text-xs text-muted-foreground">
                                            {v._count.serviceRecords} service · {v._count.reminders} reminder
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => openEdit(v)}
                                                    title="แก้ไข"
                                                >
                                                    <Pencil size={14} />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setDeleteVehicle(v)}
                                                    className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                                                    title="ลบ"
                                                >
                                                    <Trash2 size={14} />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Edit Dialog */}
            <Dialog open={!!editVehicle} onOpenChange={(open) => !open && closeEdit()}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>แก้ไขข้อมูลรถ</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="g-nickname">ชื่อเล่น</Label>
                            <Input
                                id="g-nickname"
                                value={form.nickname}
                                onChange={(e) => setForm((f) => ({ ...f, nickname: e.target.value }))}
                                disabled={saving}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="g-licensePlate">ทะเบียน</Label>
                            <Input
                                id="g-licensePlate"
                                value={form.licensePlate}
                                onChange={(e) => setForm((f) => ({ ...f, licensePlate: e.target.value }))}
                                disabled={saving}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="g-color">สี</Label>
                                <Input
                                    id="g-color"
                                    value={form.color}
                                    onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                                    disabled={saving}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="g-mileage">เลขไมล์ (กม.)</Label>
                                <Input
                                    id="g-mileage"
                                    type="number"
                                    min={0}
                                    value={form.currentMileage}
                                    onChange={(e) => setForm((f) => ({ ...f, currentMileage: e.target.value }))}
                                    disabled={saving}
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="g-imageUrl">URL รูปภาพ</Label>
                            <Input
                                id="g-imageUrl"
                                value={form.imageUrl}
                                onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                                disabled={saving}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={closeEdit} disabled={saving}>
                            <XIcon size={14} /> ยกเลิก
                        </Button>
                        <Button onClick={handleSave} disabled={saving}>
                            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} บันทึก
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirm */}
            <DeleteConfirmModal
                isOpen={!!deleteVehicle}
                onClose={() => setDeleteVehicle(null)}
                onConfirm={handleDelete}
                title="ลบรถออกจากโรงรถ"
                description={`คุณแน่ใจหรือไม่ที่จะลบรถ "${deleteVehicle?.nickname ?? ""}"? ประวัติการบริการและ reminder ทั้งหมดจะถูกลบด้วย`}
                isLoading={deleting}
            />
        </DashboardLayout>
    );
}
