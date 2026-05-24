"use client";

/**
 * Admin Master Data page — Brand / VehicleModel / VehicleSubModel CRUD.
 *
 * UI pattern: 3-column drill-down
 *   [Brand list]  →  [Model list]  →  [SubModel list]
 *
 * Clicking a brand fetches its models. Clicking a model fetches its sub-models.
 * Each column has inline Search + "เพิ่ม" + per-row edit/toggle/delete.
 *
 * Sellers auto-populate new models via ensureModelAndSubModel() in the listing
 * create/update flow. This page lets admins curate (rename / mark popular /
 * disable / delete) the resulting data.
 */

import DashboardLayout from "@/components/DashboardLayout";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import {
    Database, Plus, Search, Edit, Trash2, Loader2, Star, ChevronRight, Car, Bike, Tag, Eye, EyeOff, GripVertical,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
    DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors,
    type DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove, SortableContext, useSortable, verticalListSortingStrategy,
    sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type VehicleType = "CAR" | "MOTORCYCLE";

interface Brand {
    id: string;
    name: string;
    nameTh: string | null;
    logo: string | null;
    vehicleType: VehicleType;
    country: string | null;
    isPopular: boolean;
    isActive: boolean;
    order: number;
    modelCount: number;
}

interface VehicleModel {
    id: string;
    name: string;
    nameTh: string | null;
    bodyType: string | null;
    yearStart: number | null;
    yearEnd: number | null;
    isPopular: boolean;
    isActive: boolean;
    order: number;
    subModelCount: number;
}

interface VehicleSubModel {
    id: string;
    name: string;
    engineSize: number | null;
    fuelType: string | null;
    transmission: string | null;
    yearStart: number | null;
    yearEnd: number | null;
    isActive: boolean;
    order: number;
}

type EditTarget =
    | { kind: "brand"; data?: Partial<Brand> }
    | { kind: "model"; data?: Partial<VehicleModel> }
    | { kind: "subModel"; data?: Partial<VehicleSubModel> };

type DeleteTarget =
    | { kind: "brand"; id: string; name: string }
    | { kind: "model"; id: string; name: string }
    | { kind: "subModel"; id: string; name: string };

export default function MasterDataPage() {
    /* ─── Filter + selection state ──────────────────────── */
    const [vehicleType, setVehicleType] = useState<VehicleType>("CAR");
    const [brandSearch, setBrandSearch] = useState("");
    const [modelSearch, setModelSearch] = useState("");
    const [subModelSearch, setSubModelSearch] = useState("");
    const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
    const [selectedModel, setSelectedModel] = useState<VehicleModel | null>(null);

    /* ─── Data state ───────────────────────────────────── */
    const [brands, setBrands] = useState<Brand[]>([]);
    const [models, setModels] = useState<VehicleModel[]>([]);
    const [subModels, setSubModels] = useState<VehicleSubModel[]>([]);
    const [brandsLoading, setBrandsLoading] = useState(false);
    const [modelsLoading, setModelsLoading] = useState(false);
    const [subModelsLoading, setSubModelsLoading] = useState(false);

    /* ─── Edit/delete modals ───────────────────────────── */
    const [editTarget, setEditTarget] = useState<EditTarget | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [saving, setSaving] = useState(false);

    /* ─── Drag-and-drop sensors ─────────────────────────── */
    // PointerSensor with a small activation distance prevents accidental drags
    // when the user meant to click a row. KeyboardSensor gives accessibility.
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    const makeDragEndHandler = <T extends { id: string }>(
        items: T[],
        setItems: (items: T[]) => void,
        endpoint: string,
    ) => async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oldIdx = items.findIndex((i) => i.id === active.id);
        const newIdx = items.findIndex((i) => i.id === over.id);
        if (oldIdx === -1 || newIdx === -1) return;
        const reordered = arrayMove(items, oldIdx, newIdx);
        setItems(reordered); // optimistic
        try {
            await apiFetch(endpoint, {
                method: "PUT",
                body: JSON.stringify({ ids: reordered.map((i) => i.id) }),
            });
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "จัดลำดับไม่สำเร็จ");
            setItems(items); // rollback
        }
    };

    const handleBrandsDragEnd = makeDragEndHandler(brands, setBrands, "/admin/master-data/brands/reorder");
    const handleModelsDragEnd = makeDragEndHandler(models, setModels, "/admin/master-data/models/reorder");
    const handleSubModelsDragEnd = makeDragEndHandler(subModels, setSubModels, "/admin/master-data/sub-models/reorder");

    /* ─── Fetchers ─────────────────────────────────────── */
    const fetchBrands = useCallback(async () => {
        setBrandsLoading(true);
        try {
            const params = new URLSearchParams({ vehicleType });
            if (brandSearch) params.set("search", brandSearch);
            const data = await apiFetch(`/admin/master-data/brands?${params}`);
            setBrands(data.brands || []);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "โหลดยี่ห้อไม่สำเร็จ");
        } finally {
            setBrandsLoading(false);
        }
    }, [vehicleType, brandSearch]);

    const fetchModels = useCallback(async (brandId: string) => {
        setModelsLoading(true);
        try {
            const params = new URLSearchParams();
            if (modelSearch) params.set("search", modelSearch);
            const data = await apiFetch(`/admin/master-data/brands/${brandId}/models?${params}`);
            setModels(data.models || []);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "โหลดรุ่นไม่สำเร็จ");
        } finally {
            setModelsLoading(false);
        }
    }, [modelSearch]);

    const fetchSubModels = useCallback(async (modelId: string) => {
        setSubModelsLoading(true);
        try {
            const params = new URLSearchParams();
            if (subModelSearch) params.set("search", subModelSearch);
            const data = await apiFetch(`/admin/master-data/models/${modelId}/sub-models?${params}`);
            setSubModels(data.subModels || []);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "โหลดรุ่นย่อยไม่สำเร็จ");
        } finally {
            setSubModelsLoading(false);
        }
    }, [subModelSearch]);

    /* ─── Effects: debounced refetch on search/filter change ───── */
    useEffect(() => {
        const t = setTimeout(() => { fetchBrands(); }, 300);
        return () => clearTimeout(t);
    }, [fetchBrands]);

    useEffect(() => {
        if (!selectedBrand) { setModels([]); return; }
        const t = setTimeout(() => { fetchModels(selectedBrand.id); }, 300);
        return () => clearTimeout(t);
    }, [selectedBrand, fetchModels]);

    useEffect(() => {
        if (!selectedModel) { setSubModels([]); return; }
        const t = setTimeout(() => { fetchSubModels(selectedModel.id); }, 300);
        return () => clearTimeout(t);
    }, [selectedModel, fetchSubModels]);

    // Reset model/sub-model selection when switching vehicle type
    useEffect(() => {
        setSelectedBrand(null);
        setSelectedModel(null);
    }, [vehicleType]);

    /* ─── Handlers ─────────────────────────────────────── */
    const handleSelectBrand = (b: Brand) => {
        setSelectedBrand(b);
        setSelectedModel(null);
    };

    const handleToggleBrandActive = async (b: Brand) => {
        try {
            await apiFetch(`/admin/master-data/brands/${b.id}`, {
                method: "PUT",
                body: JSON.stringify({ isActive: !b.isActive }),
            });
            toast.success(b.isActive ? "ปิดใช้งานยี่ห้อแล้ว" : "เปิดใช้งานยี่ห้อแล้ว");
            fetchBrands();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "ไม่สำเร็จ");
        }
    };
    const handleToggleBrandPopular = async (b: Brand) => {
        try {
            await apiFetch(`/admin/master-data/brands/${b.id}`, {
                method: "PUT",
                body: JSON.stringify({ isPopular: !b.isPopular }),
            });
            fetchBrands();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "ไม่สำเร็จ");
        }
    };
    const handleToggleModelActive = async (m: VehicleModel) => {
        try {
            await apiFetch(`/admin/master-data/models/${m.id}`, {
                method: "PUT",
                body: JSON.stringify({ isActive: !m.isActive }),
            });
            toast.success(m.isActive ? "ปิดใช้งานรุ่นแล้ว" : "เปิดใช้งานรุ่นแล้ว");
            if (selectedBrand) fetchModels(selectedBrand.id);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "ไม่สำเร็จ");
        }
    };
    const handleToggleModelPopular = async (m: VehicleModel) => {
        try {
            await apiFetch(`/admin/master-data/models/${m.id}`, {
                method: "PUT",
                body: JSON.stringify({ isPopular: !m.isPopular }),
            });
            if (selectedBrand) fetchModels(selectedBrand.id);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "ไม่สำเร็จ");
        }
    };
    const handleToggleSubModelActive = async (s: VehicleSubModel) => {
        try {
            await apiFetch(`/admin/master-data/sub-models/${s.id}`, {
                method: "PUT",
                body: JSON.stringify({ isActive: !s.isActive }),
            });
            if (selectedModel) fetchSubModels(selectedModel.id);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "ไม่สำเร็จ");
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            if (deleteTarget.kind === "brand") {
                await apiFetch(`/admin/master-data/brands/${deleteTarget.id}`, { method: "DELETE" });
                toast.success("ลบยี่ห้อเรียบร้อย");
                if (selectedBrand?.id === deleteTarget.id) {
                    setSelectedBrand(null);
                    setSelectedModel(null);
                }
                fetchBrands();
            } else if (deleteTarget.kind === "model") {
                await apiFetch(`/admin/master-data/models/${deleteTarget.id}`, { method: "DELETE" });
                toast.success("ลบรุ่นเรียบร้อย");
                if (selectedModel?.id === deleteTarget.id) setSelectedModel(null);
                if (selectedBrand) fetchModels(selectedBrand.id);
            } else {
                await apiFetch(`/admin/master-data/sub-models/${deleteTarget.id}`, { method: "DELETE" });
                toast.success("ลบรุ่นย่อยเรียบร้อย");
                if (selectedModel) fetchSubModels(selectedModel.id);
            }
            setDeleteTarget(null);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "ลบไม่สำเร็จ");
        } finally {
            setDeleting(false);
        }
    };

    const refreshAfterEdit = () => {
        if (!editTarget) return;
        if (editTarget.kind === "brand") fetchBrands();
        else if (editTarget.kind === "model" && selectedBrand) fetchModels(selectedBrand.id);
        else if (editTarget.kind === "subModel" && selectedModel) fetchSubModels(selectedModel.id);
    };

    /* ─── Render ───────────────────────────────────────── */
    return (
        <DashboardLayout>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
                        <Database className="text-primary" /> ยี่ห้อ / รุ่น / รุ่นย่อย
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        จัดการข้อมูลหลักของยานพาหนะ — ผู้ขายเพิ่มรุ่นใหม่อัตโนมัติเมื่อลงประกาศ admin จัดการต่อได้ที่นี่
                    </p>
                </div>
            </div>

            {/* Vehicle type tabs */}
            <Tabs value={vehicleType} onValueChange={(v) => setVehicleType(v as VehicleType)} className="mb-6">
                <TabsList>
                    <TabsTrigger value="CAR">
                        <Car size={14} className="mr-1.5" /> รถยนต์
                    </TabsTrigger>
                    <TabsTrigger value="MOTORCYCLE">
                        <Bike size={14} className="mr-1.5" /> มอเตอร์ไซค์
                    </TabsTrigger>
                </TabsList>
            </Tabs>

            {/* 3-column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Brands column */}
                <div className="bg-card rounded-xl shadow-sm border border-border flex flex-col overflow-hidden min-h-[500px]">
                    <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                        <h3 className="font-semibold text-sm">ยี่ห้อ ({brands.length})</h3>
                        <Button size="sm" onClick={() => setEditTarget({ kind: "brand", data: { vehicleType } })}>
                            <Plus size={14} /> เพิ่ม
                        </Button>
                    </div>
                    <div className="px-4 py-3 border-b border-border">
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={brandSearch}
                                onChange={(e) => setBrandSearch(e.target.value)}
                                placeholder="ค้นหา..."
                                className="pl-9 h-9 text-sm"
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {brandsLoading ? (
                            <div className="flex items-center justify-center py-10">
                                <Loader2 className="animate-spin text-primary" />
                            </div>
                        ) : brands.length === 0 ? (
                            <div className="text-center py-10 text-sm text-muted-foreground">ไม่พบข้อมูล</div>
                        ) : (
                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleBrandsDragEnd}>
                                <SortableContext items={brands.map((b) => b.id)} strategy={verticalListSortingStrategy}>
                                    <ul className="divide-y divide-border">
                                        {brands.map((b) => (
                                            <SortableItem key={b.id} id={b.id}>
                                                {(handleProps) => (
                                                    <div
                                                        className={`px-3 py-2.5 flex items-center gap-2 cursor-pointer hover:bg-accent transition ${
                                                            selectedBrand?.id === b.id ? "bg-accent" : ""
                                                        } ${!b.isActive ? "opacity-60" : ""}`}
                                                        onClick={() => handleSelectBrand(b)}
                                                    >
                                                        <button
                                                            {...handleProps}
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="p-1 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing touch-none"
                                                            title="ลากเพื่อจัดลำดับ"
                                                            aria-label="drag"
                                                        >
                                                            <GripVertical size={14} />
                                                        </button>
                                                        <div className="w-8 h-8 rounded-md bg-muted border border-border flex items-center justify-center overflow-hidden flex-shrink-0">
                                                            {b.logo ? (
                                                                // eslint-disable-next-line @next/next/no-img-element
                                                                <img src={b.logo} alt={b.name} className="w-full h-full object-contain" onError={(e) => { (e.target as HTMLImageElement).style.visibility = "hidden"; }} />
                                                            ) : (
                                                                <span className="text-[9px] text-muted-foreground font-semibold">{b.name.charAt(0)}</span>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="font-medium text-sm truncate">{b.name}</span>
                                                                {b.isPopular && <Star size={12} className="text-amber-500 fill-amber-500 flex-shrink-0" />}
                                                                {!b.isActive && <span className="text-[10px] px-1.5 rounded bg-muted text-muted-foreground">ปิด</span>}
                                                            </div>
                                                            <div className="text-xs text-muted-foreground flex items-center gap-2">
                                                                {b.nameTh && <span>{b.nameTh}</span>}
                                                                <span>· {b.modelCount} รุ่น</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                                                            <button className="p-1.5 rounded hover:bg-background text-muted-foreground hover:text-amber-500 transition" title={b.isPopular ? "เอาออกจากยอดนิยม" : "ตั้งเป็นยอดนิยม"} onClick={() => handleToggleBrandPopular(b)}>
                                                                <Star size={13} className={b.isPopular ? "fill-amber-500 text-amber-500" : ""} />
                                                            </button>
                                                            <button className="p-1.5 rounded hover:bg-background text-muted-foreground hover:text-foreground transition" title={b.isActive ? "ปิดใช้งาน" : "เปิดใช้งาน"} onClick={() => handleToggleBrandActive(b)}>
                                                                {b.isActive ? <Eye size={13} /> : <EyeOff size={13} />}
                                                            </button>
                                                            <button className="p-1.5 rounded hover:bg-background text-muted-foreground hover:text-primary transition" title="แก้ไข" onClick={() => setEditTarget({ kind: "brand", data: b })}>
                                                                <Edit size={13} />
                                                            </button>
                                                            <button className="p-1.5 rounded hover:bg-background text-muted-foreground hover:text-rose-500 transition" title="ลบ" onClick={() => setDeleteTarget({ kind: "brand", id: b.id, name: b.name })}>
                                                                <Trash2 size={13} />
                                                            </button>
                                                            <ChevronRight size={14} className="text-muted-foreground ml-1" />
                                                        </div>
                                                    </div>
                                                )}
                                            </SortableItem>
                                        ))}
                                    </ul>
                                </SortableContext>
                            </DndContext>
                        )}
                    </div>
                </div>

                {/* Models column */}
                <div className="bg-card rounded-xl shadow-sm border border-border flex flex-col overflow-hidden min-h-[500px]">
                    <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                        <h3 className="font-semibold text-sm truncate">
                            {selectedBrand ? `รุ่น ${selectedBrand.name} (${models.length})` : "รุ่น"}
                        </h3>
                        <Button size="sm" disabled={!selectedBrand} onClick={() => selectedBrand && setEditTarget({ kind: "model", data: { } })}>
                            <Plus size={14} /> เพิ่ม
                        </Button>
                    </div>
                    <div className="px-4 py-3 border-b border-border">
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={modelSearch}
                                onChange={(e) => setModelSearch(e.target.value)}
                                placeholder="ค้นหา..."
                                disabled={!selectedBrand}
                                className="pl-9 h-9 text-sm"
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {!selectedBrand ? (
                            <div className="text-center py-10 text-sm text-muted-foreground">เลือกยี่ห้อก่อน</div>
                        ) : modelsLoading ? (
                            <div className="flex items-center justify-center py-10"><Loader2 className="animate-spin text-primary" /></div>
                        ) : models.length === 0 ? (
                            <div className="text-center py-10 text-sm text-muted-foreground">ไม่พบรุ่น</div>
                        ) : (
                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleModelsDragEnd}>
                                <SortableContext items={models.map((m) => m.id)} strategy={verticalListSortingStrategy}>
                                    <ul className="divide-y divide-border">
                                        {models.map((m) => (
                                            <SortableItem key={m.id} id={m.id}>
                                                {(handleProps) => (
                                                    <div
                                                        className={`px-3 py-2.5 flex items-center gap-2 cursor-pointer hover:bg-accent transition ${
                                                            selectedModel?.id === m.id ? "bg-accent" : ""
                                                        } ${!m.isActive ? "opacity-60" : ""}`}
                                                        onClick={() => setSelectedModel(m)}
                                                    >
                                                        <button
                                                            {...handleProps}
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="p-1 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing touch-none"
                                                            title="ลากเพื่อจัดลำดับ"
                                                            aria-label="drag"
                                                        >
                                                            <GripVertical size={14} />
                                                        </button>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="font-medium text-sm truncate">{m.name}</span>
                                                                {m.isPopular && <Star size={12} className="text-amber-500 fill-amber-500 flex-shrink-0" />}
                                                                {!m.isActive && <span className="text-[10px] px-1.5 rounded bg-muted text-muted-foreground">ปิด</span>}
                                                            </div>
                                                            <div className="text-xs text-muted-foreground flex items-center gap-2">
                                                                {m.bodyType && <span className="inline-flex items-center gap-0.5"><Tag size={10} /> {m.bodyType}</span>}
                                                                <span>· {m.subModelCount} รุ่นย่อย</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                                                            <button className="p-1.5 rounded hover:bg-background text-muted-foreground hover:text-amber-500 transition" title={m.isPopular ? "เอาออก" : "ตั้งเป็นยอดนิยม"} onClick={() => handleToggleModelPopular(m)}>
                                                                <Star size={13} className={m.isPopular ? "fill-amber-500 text-amber-500" : ""} />
                                                            </button>
                                                            <button className="p-1.5 rounded hover:bg-background text-muted-foreground hover:text-foreground transition" title={m.isActive ? "ปิดใช้งาน" : "เปิดใช้งาน"} onClick={() => handleToggleModelActive(m)}>
                                                                {m.isActive ? <Eye size={13} /> : <EyeOff size={13} />}
                                                            </button>
                                                            <button className="p-1.5 rounded hover:bg-background text-muted-foreground hover:text-primary transition" title="แก้ไข" onClick={() => setEditTarget({ kind: "model", data: m })}>
                                                                <Edit size={13} />
                                                            </button>
                                                            <button className="p-1.5 rounded hover:bg-background text-muted-foreground hover:text-rose-500 transition" title="ลบ" onClick={() => setDeleteTarget({ kind: "model", id: m.id, name: m.name })}>
                                                                <Trash2 size={13} />
                                                            </button>
                                                            <ChevronRight size={14} className="text-muted-foreground ml-1" />
                                                        </div>
                                                    </div>
                                                )}
                                            </SortableItem>
                                        ))}
                                    </ul>
                                </SortableContext>
                            </DndContext>
                        )}
                    </div>
                </div>

                {/* SubModels column */}
                <div className="bg-card rounded-xl shadow-sm border border-border flex flex-col overflow-hidden min-h-[500px]">
                    <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                        <h3 className="font-semibold text-sm truncate">
                            {selectedModel ? `รุ่นย่อย ${selectedModel.name} (${subModels.length})` : "รุ่นย่อย"}
                        </h3>
                        <Button size="sm" disabled={!selectedModel} onClick={() => selectedModel && setEditTarget({ kind: "subModel", data: { } })}>
                            <Plus size={14} /> เพิ่ม
                        </Button>
                    </div>
                    <div className="px-4 py-3 border-b border-border">
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={subModelSearch}
                                onChange={(e) => setSubModelSearch(e.target.value)}
                                placeholder="ค้นหา..."
                                disabled={!selectedModel}
                                className="pl-9 h-9 text-sm"
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {!selectedModel ? (
                            <div className="text-center py-10 text-sm text-muted-foreground">เลือกรุ่นก่อน</div>
                        ) : subModelsLoading ? (
                            <div className="flex items-center justify-center py-10"><Loader2 className="animate-spin text-primary" /></div>
                        ) : subModels.length === 0 ? (
                            <div className="text-center py-10 text-sm text-muted-foreground">ไม่พบรุ่นย่อย</div>
                        ) : (
                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSubModelsDragEnd}>
                                <SortableContext items={subModels.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                                    <ul className="divide-y divide-border">
                                        {subModels.map((s) => (
                                            <SortableItem key={s.id} id={s.id}>
                                                {(handleProps) => (
                                                    <div className={`px-3 py-2.5 flex items-center gap-2 ${!s.isActive ? "opacity-60" : ""}`}>
                                                        <button
                                                            {...handleProps}
                                                            className="p-1 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing touch-none"
                                                            title="ลากเพื่อจัดลำดับ"
                                                            aria-label="drag"
                                                        >
                                                            <GripVertical size={14} />
                                                        </button>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="font-medium text-sm truncate">{s.name}</span>
                                                                {!s.isActive && <span className="text-[10px] px-1.5 rounded bg-muted text-muted-foreground">ปิด</span>}
                                                            </div>
                                                            <div className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
                                                                {s.engineSize && <span>{s.engineSize} cc</span>}
                                                                {s.fuelType && <span>· {s.fuelType}</span>}
                                                                {s.transmission && <span>· {s.transmission}</span>}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-0.5">
                                                            <button className="p-1.5 rounded hover:bg-background text-muted-foreground hover:text-foreground transition" title={s.isActive ? "ปิดใช้งาน" : "เปิดใช้งาน"} onClick={() => handleToggleSubModelActive(s)}>
                                                                {s.isActive ? <Eye size={13} /> : <EyeOff size={13} />}
                                                            </button>
                                                            <button className="p-1.5 rounded hover:bg-background text-muted-foreground hover:text-primary transition" title="แก้ไข" onClick={() => setEditTarget({ kind: "subModel", data: s })}>
                                                                <Edit size={13} />
                                                            </button>
                                                            <button className="p-1.5 rounded hover:bg-background text-muted-foreground hover:text-rose-500 transition" title="ลบ" onClick={() => setDeleteTarget({ kind: "subModel", id: s.id, name: s.name })}>
                                                                <Trash2 size={13} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </SortableItem>
                                        ))}
                                    </ul>
                                </SortableContext>
                            </DndContext>
                        )}
                    </div>
                </div>
            </div>

            {/* Edit/create modal */}
            <EditDialog
                target={editTarget}
                onClose={() => setEditTarget(null)}
                onSaved={() => { setEditTarget(null); refreshAfterEdit(); }}
                saving={saving}
                setSaving={setSaving}
                vehicleType={vehicleType}
                selectedBrand={selectedBrand}
                selectedModel={selectedModel}
            />

            {/* Delete confirm */}
            <DeleteConfirmModal
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                title={
                    deleteTarget?.kind === "brand" ? "ลบยี่ห้อ?"
                        : deleteTarget?.kind === "model" ? "ลบรุ่น?"
                            : "ลบรุ่นย่อย?"
                }
                description={
                    deleteTarget
                        ? `"${deleteTarget.name}"${deleteTarget.kind !== "subModel" ? " — ข้อมูลลูกทั้งหมดจะถูกลบด้วย" : ""}`
                        : ""
                }
                isLoading={deleting}
            />
        </DashboardLayout>
    );
}

/* ═══ Sortable row wrapper ══════════════════════════════════════════════════
 *
 * Wraps a list item with @dnd-kit's useSortable hook. The `children` render
 * prop receives `handleProps` — spread those onto the GripVertical button
 * only, so clicks anywhere else in the row still work normally.
 */
function SortableItem({ id, children }: {
    id: string;
    children: (handleProps: Record<string, unknown>) => React.ReactNode;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : undefined,
    } as React.CSSProperties;
    return (
        <li ref={setNodeRef} style={style} className={isDragging ? "opacity-60 bg-background shadow-md relative" : ""}>
            {children({ ...attributes, ...listeners })}
        </li>
    );
}

/* ═══ Edit dialog (create + update) ══════════════════════════════════════════ */

interface EditDialogProps {
    target: EditTarget | null;
    onClose: () => void;
    onSaved: () => void;
    saving: boolean;
    setSaving: (v: boolean) => void;
    vehicleType: VehicleType;
    selectedBrand: Brand | null;
    selectedModel: VehicleModel | null;
}

function EditDialog({ target, onClose, onSaved, saving, setSaving, vehicleType, selectedBrand, selectedModel }: EditDialogProps) {
    const open = !!target;
    const isCreate = target?.data && !("id" in target.data);

    /* Local form state — fresh every time dialog opens */
    const [form, setForm] = useState<Record<string, unknown>>({});
    useEffect(() => {
        if (target?.data) setForm({ ...target.data });
        else setForm({});
    }, [target]);

    const titleMap: Record<string, string> = {
        brand: isCreate ? "เพิ่มยี่ห้อใหม่" : "แก้ไขยี่ห้อ",
        model: isCreate ? "เพิ่มรุ่นใหม่" : "แก้ไขรุ่น",
        subModel: isCreate ? "เพิ่มรุ่นย่อยใหม่" : "แก้ไขรุ่นย่อย",
    };

    const handleSubmit = async () => {
        if (!target) return;
        setSaving(true);
        try {
            if (target.kind === "brand") {
                const payload = {
                    name: form.name,
                    nameTh: form.nameTh || null,
                    logo: form.logo || null,
                    country: form.country || null,
                    isPopular: !!form.isPopular,
                    ...(isCreate ? { vehicleType: form.vehicleType || vehicleType } : { isActive: form.isActive !== false }),
                    // `order` intentionally omitted — managed via drag-and-drop in the list view
                };
                if (isCreate) {
                    await apiFetch(`/admin/master-data/brands`, { method: "POST", body: JSON.stringify(payload) });
                } else {
                    await apiFetch(`/admin/master-data/brands/${(target.data as Brand).id}`, { method: "PUT", body: JSON.stringify(payload) });
                }
            } else if (target.kind === "model") {
                const payload = {
                    ...(isCreate ? { brandId: selectedBrand?.id } : {}),
                    name: form.name,
                    nameTh: form.nameTh || null,
                    bodyType: form.bodyType || null,
                    yearStart: form.yearStart ? Number(form.yearStart) : null,
                    yearEnd: form.yearEnd ? Number(form.yearEnd) : null,
                    isPopular: !!form.isPopular,
                    ...(isCreate ? {} : { isActive: form.isActive !== false }),
                    // `order` intentionally omitted — managed via drag-and-drop in the list view
                };
                if (isCreate) {
                    await apiFetch(`/admin/master-data/models`, { method: "POST", body: JSON.stringify(payload) });
                } else {
                    await apiFetch(`/admin/master-data/models/${(target.data as VehicleModel).id}`, { method: "PUT", body: JSON.stringify(payload) });
                }
            } else {
                const payload = {
                    ...(isCreate ? { modelId: selectedModel?.id } : {}),
                    name: form.name,
                    engineSize: form.engineSize ? Number(form.engineSize) : null,
                    fuelType: form.fuelType || null,
                    transmission: form.transmission || null,
                    yearStart: form.yearStart ? Number(form.yearStart) : null,
                    yearEnd: form.yearEnd ? Number(form.yearEnd) : null,
                    ...(isCreate ? {} : { isActive: form.isActive !== false }),
                    // `order` intentionally omitted — managed via drag-and-drop in the list view
                };
                if (isCreate) {
                    await apiFetch(`/admin/master-data/sub-models`, { method: "POST", body: JSON.stringify(payload) });
                } else {
                    await apiFetch(`/admin/master-data/sub-models/${(target.data as VehicleSubModel).id}`, { method: "PUT", body: JSON.stringify(payload) });
                }
            }
            toast.success("บันทึกสำเร็จ");
            onSaved();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "บันทึกไม่สำเร็จ");
        } finally {
            setSaving(false);
        }
    };

    const setField = (key: string, val: unknown) => setForm((f) => ({ ...f, [key]: val }));

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{target ? titleMap[target.kind] : ""}</DialogTitle>
                    <DialogDescription>
                        {target?.kind === "brand" && "ยี่ห้อคือแบรนด์รถ เช่น Toyota, Honda, BMW"}
                        {target?.kind === "model" && `กำลังอยู่ภายใต้ยี่ห้อ: ${selectedBrand?.name || "-"}`}
                        {target?.kind === "subModel" && `กำลังอยู่ภายใต้รุ่น: ${selectedModel?.name || "-"}`}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 py-2">
                    {/* Common: name */}
                    <div>
                        <Label className="text-xs">ชื่อ <span className="text-rose-500">*</span></Label>
                        <Input value={(form.name as string) || ""} onChange={(e) => setField("name", e.target.value)} placeholder="ตัวอย่าง: Camry, X8, 2.0 Turbo" />
                    </div>

                    {target?.kind === "brand" && (
                        <>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label className="text-xs">ชื่อภาษาไทย</Label>
                                    <Input value={(form.nameTh as string) || ""} onChange={(e) => setField("nameTh", e.target.value)} />
                                </div>
                                <div>
                                    <Label className="text-xs">ประเทศ</Label>
                                    <Input value={(form.country as string) || ""} onChange={(e) => setField("country", e.target.value)} />
                                </div>
                            </div>
                            <div>
                                <Label className="text-xs">URL โลโก้</Label>
                                <div className="flex items-center gap-3">
                                    <div className="w-14 h-14 rounded-lg border border-border bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                                        {form.logo ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={form.logo as string}
                                                alt="logo"
                                                className="w-full h-full object-contain"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).style.display = "none";
                                                    const parent = (e.target as HTMLImageElement).parentElement;
                                                    if (parent && !parent.querySelector(".logo-fallback")) {
                                                        const span = document.createElement("span");
                                                        span.className = "logo-fallback text-[10px] text-muted-foreground";
                                                        span.textContent = "โหลดไม่ได้";
                                                        parent.appendChild(span);
                                                    }
                                                }}
                                                onLoad={(e) => {
                                                    (e.target as HTMLImageElement).style.display = "block";
                                                    const fallback = (e.target as HTMLImageElement).parentElement?.querySelector(".logo-fallback");
                                                    if (fallback) fallback.remove();
                                                }}
                                            />
                                        ) : (
                                            <span className="text-[10px] text-muted-foreground">ไม่มีโลโก้</span>
                                        )}
                                    </div>
                                    <Input
                                        value={(form.logo as string) || ""}
                                        onChange={(e) => setField("logo", e.target.value)}
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>
                            {isCreate && (
                                <div>
                                    <Label className="text-xs">ประเภท</Label>
                                    <select value={(form.vehicleType as string) || vehicleType} onChange={(e) => setField("vehicleType", e.target.value)} className="h-9 w-full px-3 rounded-md border border-border bg-background text-sm">
                                        <option value="CAR">รถยนต์</option>
                                        <option value="MOTORCYCLE">มอเตอร์ไซค์</option>
                                    </select>
                                </div>
                            )}
                        </>
                    )}

                    {target?.kind === "model" && (
                        <>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label className="text-xs">ชื่อภาษาไทย</Label>
                                    <Input value={(form.nameTh as string) || ""} onChange={(e) => setField("nameTh", e.target.value)} />
                                </div>
                                <div>
                                    <Label className="text-xs">ประเภทตัวถัง</Label>
                                    <Input value={(form.bodyType as string) || ""} onChange={(e) => setField("bodyType", e.target.value)} placeholder="SEDAN, SUV, STANDARD..." />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label className="text-xs">ปีเริ่มผลิต</Label>
                                    <Input type="number" value={(form.yearStart as number | string) || ""} onChange={(e) => setField("yearStart", e.target.value)} />
                                </div>
                                <div>
                                    <Label className="text-xs">ปีสิ้นสุด</Label>
                                    <Input type="number" value={(form.yearEnd as number | string) || ""} onChange={(e) => setField("yearEnd", e.target.value)} />
                                </div>
                            </div>
                        </>
                    )}

                    {target?.kind === "subModel" && (
                        <>
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <Label className="text-xs">ขนาดเครื่อง (cc)</Label>
                                    <Input type="number" value={(form.engineSize as number | string) || ""} onChange={(e) => setField("engineSize", e.target.value)} />
                                </div>
                                <div>
                                    <Label className="text-xs">เชื้อเพลิง</Label>
                                    <select
                                        value={(form.fuelType as string) || ""}
                                        onChange={(e) => setField("fuelType", e.target.value)}
                                        className="h-9 w-full px-3 rounded-md border border-border bg-background text-sm"
                                    >
                                        <option value="">— ไม่ระบุ —</option>
                                        <option value="PETROL">เบนซิน (PETROL)</option>
                                        <option value="DIESEL">ดีเซล (DIESEL)</option>
                                        <option value="HYBRID">ไฮบริด (HYBRID)</option>
                                        <option value="PLUGIN_HYBRID">ปลั๊กอินไฮบริด (PLUGIN_HYBRID)</option>
                                        <option value="EV">ไฟฟ้า (EV)</option>
                                        <option value="LPG">LPG</option>
                                        <option value="NGV">NGV</option>
                                    </select>
                                </div>
                                <div>
                                    <Label className="text-xs">เกียร์</Label>
                                    <select
                                        value={(form.transmission as string) || ""}
                                        onChange={(e) => setField("transmission", e.target.value)}
                                        className="h-9 w-full px-3 rounded-md border border-border bg-background text-sm"
                                    >
                                        <option value="">— ไม่ระบุ —</option>
                                        <option value="AUTOMATIC">อัตโนมัติ (AUTOMATIC)</option>
                                        <option value="MANUAL">ธรรมดา (MANUAL)</option>
                                        <option value="CVT">CVT</option>
                                        <option value="DCT">DCT</option>
                                        <option value="SEMI_AUTO">กึ่งอัตโนมัติ (SEMI_AUTO)</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label className="text-xs">ปีเริ่มผลิต</Label>
                                    <Input type="number" value={(form.yearStart as number | string) || ""} onChange={(e) => setField("yearStart", e.target.value)} />
                                </div>
                                <div>
                                    <Label className="text-xs">ปีสิ้นสุด</Label>
                                    <Input type="number" value={(form.yearEnd as number | string) || ""} onChange={(e) => setField("yearEnd", e.target.value)} />
                                </div>
                            </div>
                        </>
                    )}

                    {/* Common: popular + active. Order is managed via drag-drop in the list view. */}
                    <div className="flex items-center gap-4 pt-2 border-t border-border">
                        {target?.kind !== "subModel" && (
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <input type="checkbox" checked={!!form.isPopular} onChange={(e) => setField("isPopular", e.target.checked)} className="rounded" />
                                ยอดนิยม
                            </label>
                        )}
                        {!isCreate && (
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <input type="checkbox" checked={form.isActive !== false} onChange={(e) => setField("isActive", e.target.checked)} className="rounded" />
                                เปิดใช้งาน
                            </label>
                        )}
                    </div>
                    <p className="text-[11px] text-muted-foreground -mt-1">
                        💡 ลำดับการแสดงจัดการด้วย drag & drop ในรายการ (ไอคอน <GripVertical size={12} className="inline align-middle" />)
                    </p>
                </div>

                <DialogFooter>
                    <Button variant="secondary" onClick={onClose} disabled={saving}>ยกเลิก</Button>
                    <Button onClick={handleSubmit} disabled={saving || !form.name}>
                        {saving && <Loader2 size={14} className="animate-spin" />}
                        บันทึก
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
