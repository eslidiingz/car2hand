"use client";

import React, { useEffect, useState, useCallback } from 'react';
import {
    Plus,
    CarProfile,
    Wrench,
    Warning,
    Trash,
    PencilSimple,
    Clock,
    CurrencyDollar,
    MapPin,
    CalendarBlank,
    GasPump,
    CheckCircle,
    X,
    DotsThreeVertical,
    Speedometer,
} from '@phosphor-icons/react';
import Toast from '@/components/Toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

function getUserId(): string | null {
    try {
        const raw = localStorage.getItem('user') || sessionStorage.getItem('user');
        if (!raw) return null;
        return JSON.parse(raw)?.id || null;
    } catch { return null; }
}

function getAuthToken(): string | null {
    const stored = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (!stored) return null;
    try { return JSON.parse(stored).token || null; } catch { return null; }
}

interface Reminder {
    id: string;
    title: string;
    type: string;
    dueDate: string | null;
    dueMileage: number | null;
    isCompleted: boolean;
    createdAt: string;
}

interface ServiceRecord {
    id: string;
    title: string;
    description: string | null;
    mileage: number | null;
    cost: number | null;
    serviceDate: string;
    shopName: string | null;
    createdAt: string;
}

interface Vehicle {
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
    reminders: Reminder[];
    _count: { serviceRecords: number };
    serviceRecords?: ServiceRecord[];
}

function isReminderUrgent(r: Reminder, currentMileage: number): boolean {
    if (r.isCompleted) return false;
    if (r.type === 'DATE' && r.dueDate) {
        const due = new Date(r.dueDate);
        const now = new Date();
        const diffDays = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        return diffDays <= 7;
    }
    if (r.type === 'MILEAGE' && r.dueMileage != null) {
        return r.dueMileage <= currentMileage + 5000;
    }
    return false;
}

function formatDate(iso: string): string {
    try {
        return new Date(iso).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' });
    } catch { return iso; }
}

function formatCurrency(n: number | null): string {
    if (n == null) return '-';
    return n.toLocaleString('th-TH', { minimumFractionDigits: 0 });
}

const emptyAddForm = { nickname: '', brand: '', model: '', year: '', color: '', licensePlate: '', currentMileage: '' };
const emptyServiceForm = { title: '', description: '', mileage: '', cost: '', serviceDate: '', shopName: '' };
const emptyReminderForm = { title: '', type: 'DATE', dueDate: '', dueMileage: '' };

export default function GaragePage() {
    const [userId, setUserId] = useState<string | null>(null);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState<{ message: string; type: string } | null>(null);

    // Modals
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
    const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
    const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

    // Detail modal tabs
    const [detailTab, setDetailTab] = useState<'services' | 'reminders'>('services');
    const [detailServices, setDetailServices] = useState<ServiceRecord[]>([]);
    const [detailReminders, setDetailReminders] = useState<Reminder[]>([]);
    const [detailLoading, setDetailLoading] = useState(false);

    // Forms
    const [addForm, setAddForm] = useState(emptyAddForm);
    const [serviceForm, setServiceForm] = useState(emptyServiceForm);
    const [reminderForm, setReminderForm] = useState(emptyReminderForm);
    const [showServiceForm, setShowServiceForm] = useState(false);
    const [showReminderForm, setShowReminderForm] = useState(false);
    const [editForm, setEditForm] = useState(emptyAddForm);

    // Inline mileage edit
    const [editingMileageId, setEditingMileageId] = useState<string | null>(null);
    const [mileageValue, setMileageValue] = useState('');

    // Delete confirmation modal
    const [deleteConfirm, setDeleteConfirm] = useState<{
        type: 'vehicle' | 'service' | 'reminder';
        id: string;
        title: string;
    } | null>(null);

    const showToast = (message: string, type: string = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchVehicles = useCallback(async () => {
        if (!userId) return;
        try {
            const token = getAuthToken();
            const res = await fetch(`${API_URL}/garage`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            const data = await res.json();
            setVehicles(data.vehicles || []);
        } catch { showToast('โหลดข้อมูลรถไม่สำเร็จ', 'error'); }
        finally { setLoading(false); }
    }, [userId]);

    useEffect(() => { setUserId(getUserId()); }, []);
    useEffect(() => { if (userId) fetchVehicles(); }, [userId, fetchVehicles]);

    // Close menu when clicking outside
    useEffect(() => {
        const handler = () => setMenuOpenId(null);
        if (menuOpenId) document.addEventListener('click', handler);
        return () => document.removeEventListener('click', handler);
    }, [menuOpenId]);

    // === Vehicle CRUD ===
    const handleAddVehicle = async () => {
        if (!userId || !addForm.nickname || !addForm.brand || !addForm.model) {
            showToast('กรุณากรอกชื่อรถ ยี่ห้อ และรุ่น', 'error');
            return;
        }
        try {
            const token = getAuthToken();
            const res = await fetch(`${API_URL}/garage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    nickname: addForm.nickname,
                    brand: addForm.brand,
                    model: addForm.model,
                    year: addForm.year ? parseInt(addForm.year) : undefined,
                    color: addForm.color || undefined,
                    licensePlate: addForm.licensePlate || undefined,
                    currentMileage: addForm.currentMileage ? parseInt(addForm.currentMileage) : undefined,
                }),
            });
            if (!res.ok) throw new Error();
            showToast('เพิ่มรถสำเร็จ');
            setShowAddModal(false);
            setAddForm(emptyAddForm);
            fetchVehicles();
        } catch { showToast('เพิ่มรถไม่สำเร็จ', 'error'); }
    };

    const handleUpdateVehicle = async () => {
        if (!editingVehicle) return;
        try {
            const token = getAuthToken();
            const res = await fetch(`${API_URL}/garage/${editingVehicle.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    nickname: editForm.nickname,
                    brand: editForm.brand,
                    model: editForm.model,
                    year: editForm.year ? parseInt(editForm.year) : undefined,
                    color: editForm.color || undefined,
                    licensePlate: editForm.licensePlate || undefined,
                    currentMileage: editForm.currentMileage ? parseInt(editForm.currentMileage) : undefined,
                }),
            });
            if (!res.ok) throw new Error();
            showToast('อัปเดตสำเร็จ');
            setEditingVehicle(null);
            fetchVehicles();
        } catch { showToast('อัปเดตไม่สำเร็จ', 'error'); }
    };

    const handleDeleteVehicle = async (id: string) => {
        try {
            const token = getAuthToken();
            await fetch(`${API_URL}/garage/${id}`, {
                method: 'DELETE',
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            showToast('ลบรถสำเร็จ');
            fetchVehicles();
            if (selectedVehicle?.id === id) setSelectedVehicle(null);
        } catch { showToast('ลบไม่สำเร็จ', 'error'); }
    };

    const confirmDelete = () => {
        if (!deleteConfirm) return;
        const { type, id } = deleteConfirm;
        setDeleteConfirm(null);
        if (type === 'vehicle') handleDeleteVehicle(id);
        else if (type === 'service') handleDeleteService(id);
        else if (type === 'reminder') handleDeleteReminder(id);
    };

    const handleUpdateMileage = async (id: string) => {
        const val = parseInt(mileageValue);
        if (isNaN(val) || val < 0) { showToast('กรุณากรอกเลขไมล์ที่ถูกต้อง', 'error'); return; }
        try {
            const token = getAuthToken();
            await fetch(`${API_URL}/garage/${id}/mileage`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ mileage: val }),
            });
            showToast('อัปเดตเลขไมล์สำเร็จ');
            setEditingMileageId(null);
            fetchVehicles();
        } catch { showToast('อัปเดตไม่สำเร็จ', 'error'); }
    };

    // === Open detail modal ===
    const openDetailModal = async (vehicle: Vehicle) => {
        setSelectedVehicle(vehicle);
        setDetailTab('services');
        setDetailLoading(true);
        setShowServiceForm(false);
        setShowReminderForm(false);
        try {
            const token = getAuthToken();
            const authHeaders = token ? { 'Authorization': `Bearer ${token}` } : {};
            const [sRes, rRes] = await Promise.all([
                fetch(`${API_URL}/garage/${vehicle.id}/services`, { headers: authHeaders }),
                fetch(`${API_URL}/garage/${vehicle.id}/reminders`, { headers: authHeaders }),
            ]);
            const sData = await sRes.json();
            const rData = await rRes.json();
            setDetailServices(sData.records || []);
            setDetailReminders(rData.reminders || []);
        } catch { showToast('โหลดข้อมูลไม่สำเร็จ', 'error'); }
        finally { setDetailLoading(false); }
    };

    // === Service Records ===
    const handleAddService = async () => {
        if (!selectedVehicle || !serviceForm.title || !serviceForm.serviceDate) {
            showToast('กรุณากรอกชื่อรายการและวันที่', 'error');
            return;
        }
        try {
            const token = getAuthToken();
            const res = await fetch(`${API_URL}/garage/${selectedVehicle.id}/services`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    title: serviceForm.title,
                    description: serviceForm.description || undefined,
                    mileage: serviceForm.mileage ? parseInt(serviceForm.mileage) : undefined,
                    cost: serviceForm.cost ? parseFloat(serviceForm.cost) : undefined,
                    serviceDate: serviceForm.serviceDate,
                    shopName: serviceForm.shopName || undefined,
                }),
            });
            if (!res.ok) throw new Error();
            showToast('บันทึกซ่อมสำเร็จ');
            setServiceForm(emptyServiceForm);
            setShowServiceForm(false);
            // Refresh
            const refreshToken = getAuthToken();
            const sRes = await fetch(`${API_URL}/garage/${selectedVehicle.id}/services`, {
                headers: refreshToken ? { 'Authorization': `Bearer ${refreshToken}` } : {}
            });
            const sData = await sRes.json();
            setDetailServices(sData.records || []);
            fetchVehicles();
        } catch { showToast('บันทึกไม่สำเร็จ', 'error'); }
    };

    const handleDeleteService = async (id: string) => {
        if (!selectedVehicle) return;
        try {
            const token = getAuthToken();
            await fetch(`${API_URL}/garage/services/${id}`, {
                method: 'DELETE',
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            setDetailServices(prev => prev.filter(s => s.id !== id));
            fetchVehicles();
        } catch { showToast('ลบไม่สำเร็จ', 'error'); }
    };

    // === Reminders ===
    const handleAddReminder = async () => {
        if (!selectedVehicle || !reminderForm.title) {
            showToast('กรุณากรอกชื่อรายการ', 'error');
            return;
        }
        try {
            const token = getAuthToken();
            const res = await fetch(`${API_URL}/garage/${selectedVehicle.id}/reminders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    title: reminderForm.title,
                    type: reminderForm.type,
                    dueDate: reminderForm.type === 'DATE' && reminderForm.dueDate ? reminderForm.dueDate : undefined,
                    dueMileage: reminderForm.type === 'MILEAGE' && reminderForm.dueMileage ? parseInt(reminderForm.dueMileage) : undefined,
                }),
            });
            if (!res.ok) throw new Error();
            showToast('เพิ่มแจ้งเตือนสำเร็จ');
            setReminderForm(emptyReminderForm);
            setShowReminderForm(false);
            const refreshToken = getAuthToken();
            const rRes = await fetch(`${API_URL}/garage/${selectedVehicle.id}/reminders`, {
                headers: refreshToken ? { 'Authorization': `Bearer ${refreshToken}` } : {}
            });
            const rData = await rRes.json();
            setDetailReminders(rData.reminders || []);
            fetchVehicles();
        } catch { showToast('เพิ่มไม่สำเร็จ', 'error'); }
    };

    const handleToggleReminder = async (r: Reminder) => {
        try {
            const token = getAuthToken();
            await fetch(`${API_URL}/garage/reminders/${r.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ isCompleted: !r.isCompleted }),
            });
            setDetailReminders(prev => prev.map(rem => rem.id === r.id ? { ...rem, isCompleted: !rem.isCompleted } : rem));
            fetchVehicles();
        } catch { showToast('อัปเดตไม่สำเร็จ', 'error'); }
    };

    const handleDeleteReminder = async (id: string) => {
        try {
            const token = getAuthToken();
            await fetch(`${API_URL}/garage/reminders/${id}`, {
                method: 'DELETE',
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            setDetailReminders(prev => prev.filter(r => r.id !== id));
            fetchVehicles();
        } catch { showToast('ลบไม่สำเร็จ', 'error'); }
    };

    // === Start edit vehicle ===
    const startEdit = (v: Vehicle) => {
        setEditingVehicle(v);
        setEditForm({
            nickname: v.nickname,
            brand: v.brand,
            model: v.model,
            year: v.year?.toString() || '',
            color: v.color || '',
            licensePlate: v.licensePlate || '',
            currentMileage: v.currentMileage.toString(),
        });
        setMenuOpenId(null);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {toast && <Toast message={toast.message} type={toast.type} />}

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
                    <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl" onClick={e => e.stopPropagation()}>
                        <div className="p-6 text-center">
                            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash size={28} className="text-red-500" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 mb-2">
                                {deleteConfirm.type === 'vehicle' ? 'ลบรถคันนี้?' : deleteConfirm.type === 'service' ? 'ลบประวัติซ่อมนี้?' : 'ลบแจ้งเตือนนี้?'}
                            </h3>
                            <p className="text-sm text-gray-500 mb-1">
                                &quot;{deleteConfirm.title}&quot;
                            </p>
                            <p className="text-xs text-gray-400">
                                {deleteConfirm.type === 'vehicle'
                                    ? 'ข้อมูลรถ ประวัติซ่อม และแจ้งเตือนทั้งหมดจะถูกลบ'
                                    : 'การดำเนินการนี้ไม่สามารถย้อนกลับได้'}
                            </p>
                        </div>
                        <div className="flex border-t border-gray-100">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="flex-1 py-3.5 text-sm font-bold text-gray-600 hover:bg-gray-50 transition rounded-bl-2xl"
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 py-3.5 text-sm font-bold text-red-600 hover:bg-red-50 transition border-l border-gray-100 rounded-br-2xl"
                            >
                                ลบ
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">
                    <span className="sm:inline">โรงรถของฉัน</span>
                </h1>
                <button
                    onClick={() => { setAddForm(emptyAddForm); setShowAddModal(true); }}
                    className="bg-primary text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-opacity-90 transition shadow-sm"
                >
                    <Plus weight="bold" /> เพิ่มรถ
                </button>
            </div>

            {/* Vehicle Grid */}
            {vehicles.length === 0 && !loading ? (
                <div className="text-center py-16">
                    <CarProfile size={64} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-400 font-medium">ยังไม่มีรถในโรงรถ</p>
                    <button
                        onClick={() => { setAddForm(emptyAddForm); setShowAddModal(true); }}
                        className="mt-4 bg-primary text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-opacity-90 transition"
                    >
                        เพิ่มรถคันแรก
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {vehicles.map((car) => {
                        const urgentReminders = car.reminders.filter(r => isReminderUrgent(r, car.currentMileage));
                        return (
                            <div
                                key={car.id}
                                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group cursor-pointer hover:shadow-md transition-shadow"
                            >
                                {/* Image */}
                                <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200" onClick={() => openDetailModal(car)}>
                                    {car.imageUrl ? (
                                        <img src={car.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" alt={car.nickname} />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <CarProfile size={80} className="text-gray-300" />
                                        </div>
                                    )}
                                    {car.licensePlate && (
                                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-bold shadow-sm">
                                            {car.licensePlate}
                                        </div>
                                    )}
                                    {urgentReminders.length > 0 && (
                                        <div className="absolute top-4 left-4 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm">
                                            <Warning weight="fill" size={14} /> {urgentReminders.length} แจ้งเตือน
                                        </div>
                                    )}
                                </div>

                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-3">
                                        <div onClick={() => openDetailModal(car)} className="flex-1">
                                            <h3 className="font-bold text-lg text-gray-900">{car.nickname}</h3>
                                            <p className="text-sm text-gray-500">{car.brand} {car.model} {car.year ? `(${car.year})` : ''}</p>
                                        </div>
                                        {/* 3-dot menu */}
                                        <div className="relative">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === car.id ? null : car.id); }}
                                                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition"
                                            >
                                                <DotsThreeVertical weight="bold" size={20} />
                                            </button>
                                            {menuOpenId === car.id && (
                                                <div className="absolute right-0 top-10 bg-white border border-gray-100 rounded-xl shadow-lg z-20 w-36 overflow-hidden">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); startEdit(car); }}
                                                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                                                    >
                                                        <PencilSimple size={16} /> แก้ไข
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setMenuOpenId(null); setDeleteConfirm({ type: 'vehicle', id: car.id, title: car.nickname }); }}
                                                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-red-50 flex items-center gap-2 text-red-600"
                                                    >
                                                        <Trash size={16} /> ลบ
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Mileage - inline edit */}
                                    <div className="flex items-center gap-2 mb-4">
                                        <GasPump size={16} className="text-gray-400" />
                                        {editingMileageId === car.id ? (
                                            <div className="flex items-center gap-2 flex-1">
                                                <input
                                                    type="number"
                                                    value={mileageValue}
                                                    onChange={e => setMileageValue(e.target.value)}
                                                    className="w-28 px-2 py-1 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                                                    autoFocus
                                                    onKeyDown={e => { if (e.key === 'Enter') handleUpdateMileage(car.id); if (e.key === 'Escape') setEditingMileageId(null); }}
                                                />
                                                <span className="text-xs text-gray-400">กม.</span>
                                                <button onClick={() => handleUpdateMileage(car.id)} className="text-primary text-xs font-bold">บันทึก</button>
                                                <button onClick={() => setEditingMileageId(null)} className="text-gray-400 text-xs">ยกเลิก</button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setEditingMileageId(car.id); setMileageValue(car.currentMileage.toString()); }}
                                                className="text-sm text-gray-600 hover:text-primary transition flex items-center gap-1"
                                            >
                                                {car.currentMileage.toLocaleString()} กม.
                                                <PencilSimple size={12} className="text-gray-400" />
                                            </button>
                                        )}
                                    </div>

                                    {/* Service count */}
                                    <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
                                        <Wrench size={16} className="text-gray-400" />
                                        ประวัติซ่อม {car._count.serviceRecords} รายการ
                                    </div>

                                    {/* Urgent reminders */}
                                    {urgentReminders.length > 0 && (
                                        <div className="space-y-2 mb-4">
                                            {urgentReminders.slice(0, 2).map(r => (
                                                <div key={r.id} className="flex items-center justify-between p-2.5 rounded-xl bg-red-50 border border-red-100 text-red-700">
                                                    <div className="flex items-center gap-2">
                                                        <Warning weight="fill" size={16} />
                                                        <span className="text-xs font-medium">{r.title}</span>
                                                    </div>
                                                    <span className="text-xs font-bold">
                                                        {r.type === 'DATE' && r.dueDate ? formatDate(r.dueDate) : r.dueMileage ? `${r.dueMileage.toLocaleString()} กม.` : ''}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Non-urgent reminders preview */}
                                    {car.reminders.filter(r => !isReminderUrgent(r, car.currentMileage)).slice(0, 1).map(r => (
                                        <div key={r.id} className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-gray-600 mb-4">
                                            <div className="flex items-center gap-2">
                                                <Clock size={16} className="text-gray-400" />
                                                <span className="text-xs font-medium">{r.title}</span>
                                            </div>
                                            <span className="text-xs">
                                                {r.type === 'DATE' && r.dueDate ? formatDate(r.dueDate) : r.dueMileage ? `${r.dueMileage.toLocaleString()} กม.` : ''}
                                            </span>
                                        </div>
                                    ))}

                                    <button
                                        onClick={() => openDetailModal(car)}
                                        className="w-full bg-primary text-white py-2.5 rounded-xl text-sm font-bold hover:bg-opacity-90 transition"
                                    >
                                        ดูรายละเอียด
                                    </button>
                                </div>
                            </div>
                        );
                    })}

                    {/* Add New Car Placeholder */}
                    <button
                        onClick={() => { setAddForm(emptyAddForm); setShowAddModal(true); }}
                        className="border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center p-12 text-gray-400 hover:bg-gray-50 hover:border-gray-300 transition gap-4 min-h-[300px]"
                    >
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-primary">
                            <Plus weight="bold" size={32} />
                        </div>
                        <span className="font-bold">เพิ่มรถคันใหม่</span>
                    </button>
                </div>
            )}

            {/* ==================== ADD VEHICLE MODAL ==================== */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
                    <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center p-5 border-b border-gray-100">
                            <h2 className="text-lg font-bold text-gray-800">เพิ่มรถใหม่</h2>
                            <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
                        </div>
                        <div className="p-5 space-y-4">
                            <FormField label="ชื่อรถ *" value={addForm.nickname} onChange={v => setAddForm(f => ({ ...f, nickname: v }))} placeholder="เช่น รถคันโปรด" />
                            <div className="grid grid-cols-2 gap-3">
                                <FormField label="ยี่ห้อ *" value={addForm.brand} onChange={v => setAddForm(f => ({ ...f, brand: v }))} placeholder="Toyota" />
                                <FormField label="รุ่น *" value={addForm.model} onChange={v => setAddForm(f => ({ ...f, model: v }))} placeholder="Camry" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <FormField label="ปี" value={addForm.year} onChange={v => setAddForm(f => ({ ...f, year: v }))} placeholder="2024" type="number" />
                                <FormField label="สี" value={addForm.color} onChange={v => setAddForm(f => ({ ...f, color: v }))} placeholder="ขาว" />
                            </div>
                            <FormField label="ทะเบียน" value={addForm.licensePlate} onChange={v => setAddForm(f => ({ ...f, licensePlate: v }))} placeholder="กก 1234" />
                            <FormField label="เลขไมล์ปัจจุบัน" value={addForm.currentMileage} onChange={v => setAddForm(f => ({ ...f, currentMileage: v }))} placeholder="50000" type="number" />
                        </div>
                        <div className="p-5 border-t border-gray-100 flex gap-3">
                            <button onClick={() => setShowAddModal(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition">ยกเลิก</button>
                            <button onClick={handleAddVehicle} className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-opacity-90 transition">เพิ่มรถ</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ==================== EDIT VEHICLE MODAL ==================== */}
            {editingVehicle && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setEditingVehicle(null)}>
                    <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center p-5 border-b border-gray-100">
                            <h2 className="text-lg font-bold text-gray-800">แก้ไขรถ</h2>
                            <button onClick={() => setEditingVehicle(null)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
                        </div>
                        <div className="p-5 space-y-4">
                            <FormField label="ชื่อรถ" value={editForm.nickname} onChange={v => setEditForm(f => ({ ...f, nickname: v }))} />
                            <div className="grid grid-cols-2 gap-3">
                                <FormField label="ยี่ห้อ" value={editForm.brand} onChange={v => setEditForm(f => ({ ...f, brand: v }))} />
                                <FormField label="รุ่น" value={editForm.model} onChange={v => setEditForm(f => ({ ...f, model: v }))} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <FormField label="ปี" value={editForm.year} onChange={v => setEditForm(f => ({ ...f, year: v }))} type="number" />
                                <FormField label="สี" value={editForm.color} onChange={v => setEditForm(f => ({ ...f, color: v }))} />
                            </div>
                            <FormField label="ทะเบียน" value={editForm.licensePlate} onChange={v => setEditForm(f => ({ ...f, licensePlate: v }))} />
                            <FormField label="เลขไมล์ปัจจุบัน" value={editForm.currentMileage} onChange={v => setEditForm(f => ({ ...f, currentMileage: v }))} type="number" />
                        </div>
                        <div className="p-5 border-t border-gray-100 flex gap-3">
                            <button onClick={() => setEditingVehicle(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition">ยกเลิก</button>
                            <button onClick={handleUpdateVehicle} className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-opacity-90 transition">บันทึก</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ==================== VEHICLE DETAIL MODAL ==================== */}
            {selectedVehicle && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center" onClick={() => setSelectedVehicle(null)}>
                    <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] overflow-hidden shadow-xl flex flex-col" onClick={e => e.stopPropagation()}>
                        {/* Header */}
                        <div className="flex justify-between items-center p-5 border-b border-gray-100 shrink-0">
                            <div>
                                <h2 className="text-lg font-bold text-gray-800">{selectedVehicle.nickname}</h2>
                                <p className="text-sm text-gray-500">{selectedVehicle.brand} {selectedVehicle.model} {selectedVehicle.licensePlate ? `| ${selectedVehicle.licensePlate}` : ''}</p>
                            </div>
                            <button onClick={() => setSelectedVehicle(null)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-gray-100 shrink-0">
                            <button
                                onClick={() => setDetailTab('services')}
                                className={`flex-1 py-3 text-sm font-bold transition ${detailTab === 'services' ? 'text-primary border-b-2 border-primary' : 'text-gray-400'}`}
                            >
                                <Wrench size={16} className="inline mr-1.5" />
                                ประวัติซ่อม ({detailServices.length})
                            </button>
                            <button
                                onClick={() => setDetailTab('reminders')}
                                className={`flex-1 py-3 text-sm font-bold transition ${detailTab === 'reminders' ? 'text-primary border-b-2 border-primary' : 'text-gray-400'}`}
                            >
                                <Clock size={16} className="inline mr-1.5" />
                                แจ้งเตือน ({detailReminders.filter(r => !r.isCompleted).length})
                            </button>
                        </div>

                        {/* Tab Content */}
                        <div className="flex-1 overflow-y-auto p-5">
                            {detailLoading ? (
                                <div className="flex justify-center py-10">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                </div>
                            ) : detailTab === 'services' ? (
                                <div className="space-y-4">
                                    {/* Add service button */}
                                    <button
                                        onClick={() => { setServiceForm(emptyServiceForm); setShowServiceForm(!showServiceForm); }}
                                        className="w-full py-2.5 rounded-xl border-2 border-dashed border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition flex items-center justify-center gap-2"
                                    >
                                        <Plus size={16} weight="bold" /> เพิ่มประวัติซ่อม
                                    </button>

                                    {/* Add service form */}
                                    {showServiceForm && (
                                        <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-100">
                                            <FormField label="รายการ *" value={serviceForm.title} onChange={v => setServiceForm(f => ({ ...f, title: v }))} placeholder="เปลี่ยนน้ำมันเครื่อง" />
                                            <FormField label="รายละเอียด" value={serviceForm.description} onChange={v => setServiceForm(f => ({ ...f, description: v }))} placeholder="รายละเอียดเพิ่มเติม" />
                                            <div className="grid grid-cols-2 gap-3">
                                                <FormField label="เลขไมล์" value={serviceForm.mileage} onChange={v => setServiceForm(f => ({ ...f, mileage: v }))} type="number" placeholder="50000" />
                                                <FormField label="ค่าใช้จ่าย (บาท)" value={serviceForm.cost} onChange={v => setServiceForm(f => ({ ...f, cost: v }))} type="number" placeholder="1500" />
                                            </div>
                                            <FormField label="วันที่ซ่อม *" value={serviceForm.serviceDate} onChange={v => setServiceForm(f => ({ ...f, serviceDate: v }))} type="date" />
                                            <FormField label="ร้าน/ศูนย์" value={serviceForm.shopName} onChange={v => setServiceForm(f => ({ ...f, shopName: v }))} placeholder="ศูนย์ Toyota สาขา..." />
                                            <div className="flex gap-2">
                                                <button onClick={() => setShowServiceForm(false)} className="flex-1 py-2 rounded-lg border border-gray-200 text-sm font-bold text-gray-600">ยกเลิก</button>
                                                <button onClick={handleAddService} className="flex-1 py-2 rounded-lg bg-primary text-white text-sm font-bold">บันทึก</button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Service list */}
                                    {detailServices.length === 0 ? (
                                        <p className="text-center text-gray-400 text-sm py-6">ยังไม่มีประวัติซ่อม</p>
                                    ) : detailServices.map(s => (
                                        <div key={s.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-gray-800 text-sm">{s.title}</h4>
                                                    {s.description && <p className="text-xs text-gray-500 mt-1">{s.description}</p>}
                                                </div>
                                                <button onClick={() => setDeleteConfirm({ type: 'service', id: s.id, title: s.title })} className="p-1 text-gray-300 hover:text-red-500 transition">
                                                    <Trash size={16} />
                                                </button>
                                            </div>
                                            <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-500">
                                                <span className="flex items-center gap-1"><CalendarBlank size={14} /> {formatDate(s.serviceDate)}</span>
                                                {s.mileage != null && <span className="flex items-center gap-1"><Speedometer size={14} /> {s.mileage.toLocaleString()} กม.</span>}
                                                {s.cost != null && <span className="flex items-center gap-1"><CurrencyDollar size={14} /> {formatCurrency(Number(s.cost))} บาท</span>}
                                                {s.shopName && <span className="flex items-center gap-1"><MapPin size={14} /> {s.shopName}</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Add reminder button */}
                                    <button
                                        onClick={() => { setReminderForm(emptyReminderForm); setShowReminderForm(!showReminderForm); }}
                                        className="w-full py-2.5 rounded-xl border-2 border-dashed border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition flex items-center justify-center gap-2"
                                    >
                                        <Plus size={16} weight="bold" /> เพิ่มแจ้งเตือน
                                    </button>

                                    {/* Add reminder form */}
                                    {showReminderForm && (
                                        <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-100">
                                            <FormField label="รายการ *" value={reminderForm.title} onChange={v => setReminderForm(f => ({ ...f, title: v }))} placeholder="เปลี่ยนน้ำมันเครื่อง" />
                                            <div>
                                                <label className="block text-xs font-bold text-gray-600 mb-1">ประเภท</label>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => setReminderForm(f => ({ ...f, type: 'DATE' }))}
                                                        className={`flex-1 py-2 rounded-lg text-sm font-bold border transition ${reminderForm.type === 'DATE' ? 'bg-primary text-white border-primary' : 'border-gray-200 text-gray-600'}`}
                                                    >
                                                        <CalendarBlank size={14} className="inline mr-1" /> ตามวันที่
                                                    </button>
                                                    <button
                                                        onClick={() => setReminderForm(f => ({ ...f, type: 'MILEAGE' }))}
                                                        className={`flex-1 py-2 rounded-lg text-sm font-bold border transition ${reminderForm.type === 'MILEAGE' ? 'bg-primary text-white border-primary' : 'border-gray-200 text-gray-600'}`}
                                                    >
                                                        <Speedometer size={14} className="inline mr-1" /> ตามไมล์
                                                    </button>
                                                </div>
                                            </div>
                                            {reminderForm.type === 'DATE' ? (
                                                <FormField label="วันครบกำหนด" value={reminderForm.dueDate} onChange={v => setReminderForm(f => ({ ...f, dueDate: v }))} type="date" />
                                            ) : (
                                                <FormField label="เลขไมล์ครบกำหนด" value={reminderForm.dueMileage} onChange={v => setReminderForm(f => ({ ...f, dueMileage: v }))} type="number" placeholder="60000" />
                                            )}
                                            <div className="flex gap-2">
                                                <button onClick={() => setShowReminderForm(false)} className="flex-1 py-2 rounded-lg border border-gray-200 text-sm font-bold text-gray-600">ยกเลิก</button>
                                                <button onClick={handleAddReminder} className="flex-1 py-2 rounded-lg bg-primary text-white text-sm font-bold">เพิ่ม</button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Reminder list */}
                                    {detailReminders.length === 0 ? (
                                        <p className="text-center text-gray-400 text-sm py-6">ยังไม่มีแจ้งเตือน</p>
                                    ) : detailReminders.map(r => {
                                        const urgent = isReminderUrgent(r, selectedVehicle.currentMileage);
                                        return (
                                            <div key={r.id} className={`rounded-xl border p-4 shadow-sm ${r.isCompleted ? 'bg-gray-50 border-gray-100 opacity-60' : urgent ? 'bg-red-50 border-red-100' : 'bg-white border-gray-100'}`}>
                                                <div className="flex justify-between items-start">
                                                    <div className="flex items-center gap-3 flex-1">
                                                        <button onClick={() => handleToggleReminder(r)} className={`shrink-0 ${r.isCompleted ? 'text-green-500' : 'text-gray-300 hover:text-primary'} transition`}>
                                                            <CheckCircle size={24} weight={r.isCompleted ? 'fill' : 'regular'} />
                                                        </button>
                                                        <div>
                                                            <h4 className={`font-bold text-sm ${r.isCompleted ? 'line-through text-gray-400' : urgent ? 'text-red-700' : 'text-gray-800'}`}>{r.title}</h4>
                                                            <p className="text-xs text-gray-500 mt-0.5">
                                                                {r.type === 'DATE' ? (
                                                                    <span className="flex items-center gap-1"><CalendarBlank size={12} /> {r.dueDate ? formatDate(r.dueDate) : 'ไม่ระบุ'}</span>
                                                                ) : (
                                                                    <span className="flex items-center gap-1"><Speedometer size={12} /> {r.dueMileage ? `${r.dueMileage.toLocaleString()} กม.` : 'ไม่ระบุ'}</span>
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        {urgent && !r.isCompleted && <Warning weight="fill" size={18} className="text-red-500" />}
                                                        <button onClick={() => setDeleteConfirm({ type: 'reminder', id: r.id, title: r.title })} className="p-1 text-gray-300 hover:text-red-500 transition">
                                                            <Trash size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// === Reusable form field component ===
function FormField({ label, value, onChange, placeholder, type = 'text' }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    type?: string;
}) {
    return (
        <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">{label}</label>
            <input
                type={type}
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
        </div>
    );
}
