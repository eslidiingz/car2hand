"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
    User,
    EnvelopeSimple,
    Phone,
    LockKey,
    Bell,
    FloppyDisk,
    Eye,
    EyeSlash,
    SpinnerGap,
} from '@phosphor-icons/react';
import LineConnection from '@/components/settings/LineConnection';
import Toast from '@/components/Toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface UserProfile {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    isActive: boolean;
    lineUserId: string | null;
    createdAt: string;
    currentPackage: { name: string; slug: string } | null;
    packageExpiresAt: string | null;
}

function getUserId(): string | null {
    try {
        const raw = localStorage.getItem('user') || sessionStorage.getItem('user');
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return parsed?.id || null;
    } catch {
        return null;
    }
}

function getAuthToken(): string | null {
    const stored = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (!stored) return null;
    try { return JSON.parse(stored).token || null; } catch { return null; }
}

function updateStoredUser(updates: Partial<{ fullName: string; phoneNumber: string }>) {
    for (const storage of [localStorage, sessionStorage]) {
        const raw = storage.getItem('user');
        if (raw) {
            try {
                const parsed = JSON.parse(raw);
                storage.setItem('user', JSON.stringify({ ...parsed, ...updates }));
            } catch { /* ignore */ }
        }
    }
}

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('profile');

    // Profile state
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [fullName, setFullName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');

    // Security state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPw, setShowCurrentPw] = useState(false);
    const [showNewPw, setShowNewPw] = useState(false);
    const [showConfirmPw, setShowConfirmPw] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);

    // Toast
    const [toast, setToast] = useState<{ message: string; type: string } | null>(null);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchProfile = useCallback(async () => {
        const userId = getUserId();
        if (!userId) {
            setLoading(false);
            return;
        }

        try {
            const token = getAuthToken();
            const res = await fetch(`${API_URL}/users/me`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setProfile(data.user);
            setFullName(data.user.fullName || '');
            setPhoneNumber(data.user.phoneNumber || '');
        } catch {
            showToast('ไม่สามารถโหลดข้อมูลได้', 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 10);
        setPhoneNumber(value);
    };

    const handleSaveProfile = async () => {
        const userId = getUserId();
        if (!userId) return;

        setSaving(true);
        try {
            const token = getAuthToken();
            const res = await fetch(`${API_URL}/users/me`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ fullName }),
            });
            const data = await res.json();
            if (!res.ok) {
                showToast(data.error || 'เกิดข้อผิดพลาด', 'error');
                return;
            }
            // Update stored user so navbar reflects changes
            updateStoredUser({ fullName });
            showToast(data.message || 'บันทึกสำเร็จ', 'success');
        } catch {
            showToast('ไม่สามารถบันทึกได้', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async () => {
        if (!newPassword || !currentPassword) {
            showToast('กรุณากรอกข้อมูลให้ครบ', 'error');
            return;
        }
        if (newPassword.length < 6) {
            showToast('รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร', 'error');
            return;
        }
        if (newPassword !== confirmPassword) {
            showToast('รหัสผ่านใหม่ไม่ตรงกัน', 'error');
            return;
        }

        const userId = getUserId();
        if (!userId) return;

        setChangingPassword(true);
        try {
            const token = getAuthToken();
            const res = await fetch(`${API_URL}/users/me/password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ currentPassword, newPassword }),
            });
            const data = await res.json();
            if (!res.ok) {
                showToast(data.error || 'เกิดข้อผิดพลาด', 'error');
                return;
            }
            showToast(data.message || 'เปลี่ยนรหัสผ่านสำเร็จ', 'success');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch {
            showToast('ไม่สามารถเปลี่ยนรหัสผ่านได้', 'error');
        } finally {
            setChangingPassword(false);
        }
    };

    const profileDirty = profile && fullName !== profile.fullName;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">ตั้งค่าบัญชี</h1>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 overflow-x-auto">
                <button
                    onClick={() => setActiveTab('profile')}
                    className={`px-4 sm:px-6 py-3 text-sm font-bold border-b-2 transition whitespace-nowrap ${activeTab === 'profile' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    ข้อมูลส่วนตัว
                </button>
                <button
                    onClick={() => setActiveTab('security')}
                    className={`px-4 sm:px-6 py-3 text-sm font-bold border-b-2 transition whitespace-nowrap ${activeTab === 'security' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    รหัสผ่านและความปลอดภัย
                </button>
                <button
                    onClick={() => setActiveTab('notifications')}
                    className={`px-4 sm:px-6 py-3 text-sm font-bold border-b-2 transition whitespace-nowrap ${activeTab === 'notifications' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    การแจ้งเตือน
                </button>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm">
                {/* ===== PROFILE TAB ===== */}
                {activeTab === 'profile' && (
                    <>
                        {loading ? (
                            <div className="flex items-center justify-center py-16">
                                <SpinnerGap size={32} className="animate-spin text-primary" />
                            </div>
                        ) : !profile ? (
                            <div className="text-center py-10 text-gray-500">
                                <User size={48} className="mx-auto mb-4 text-gray-300" />
                                <p>ไม่สามารถโหลดข้อมูลผู้ใช้ได้ กรุณาเข้าสู่ระบบใหม่</p>
                            </div>
                        ) : (
                            <div className="space-y-6 max-w-2xl">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">ชื่อ-นามสกุล</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={18} />
                                            <input
                                                type="text"
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                className="form-input-icon-sm font-medium"
                                                placeholder="ชื่อ-นามสกุล"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">เบอร์โทรศัพท์</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={18} />
                                            <input
                                                type="tel"
                                                value={phoneNumber}
                                                className="form-input-icon-sm font-medium text-gray-500"
                                                disabled
                                            />
                                        </div>
                                        <p className="text-xs text-gray-400">*เบอร์โทรใช้สำหรับเข้าสู่ระบบ ไม่สามารถเปลี่ยนได้ หากต้องการเปลี่ยนกรุณาติดต่อเจ้าหน้าที่</p>
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-sm font-bold text-gray-700">อีเมล</label>
                                        <div className="relative">
                                            <EnvelopeSimple className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={18} />
                                            <input
                                                type="email"
                                                value={profile.email}
                                                className="form-input-icon-sm font-medium text-gray-500 bg-gray-50"
                                                disabled
                                            />
                                        </div>
                                        <p className="text-xs text-gray-400">*อีเมลไม่สามารถเปลี่ยนได้ หากต้องการเปลี่ยนกรุณาติดต่อเจ้าหน้าที่</p>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-gray-100 flex justify-end">
                                    <button
                                        onClick={handleSaveProfile}
                                        disabled={saving || !profileDirty}
                                        className="bg-primary text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-900/10 hover:bg-opacity-90 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {saving ? (
                                            <SpinnerGap size={20} className="animate-spin" />
                                        ) : (
                                            <FloppyDisk weight="bold" />
                                        )}
                                        บันทึกการเปลี่ยนแปลง
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* ===== SECURITY TAB ===== */}
                {activeTab === 'security' && (
                    <div className="space-y-6 max-w-2xl">
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 mb-1">เปลี่ยนรหัสผ่าน</h3>
                            <p className="text-sm text-gray-500">กรอกรหัสผ่านปัจจุบันและรหัสผ่านใหม่ที่ต้องการ</p>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">รหัสผ่านปัจจุบัน</label>
                                <div className="relative">
                                    <LockKey className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={18} />
                                    <input
                                        type={showCurrentPw ? 'text' : 'password'}
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        className="form-input-icon-sm font-medium pr-10"
                                        placeholder="รหัสผ่านปัจจุบัน"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPw(!showCurrentPw)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showCurrentPw ? <EyeSlash size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">รหัสผ่านใหม่</label>
                                <div className="relative">
                                    <LockKey className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={18} />
                                    <input
                                        type={showNewPw ? 'text' : 'password'}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="form-input-icon-sm font-medium pr-10"
                                        placeholder="รหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPw(!showNewPw)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showNewPw ? <EyeSlash size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">ยืนยันรหัสผ่านใหม่</label>
                                <div className="relative">
                                    <LockKey className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={18} />
                                    <input
                                        type={showConfirmPw ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="form-input-icon-sm font-medium pr-10"
                                        placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPw(!showConfirmPw)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showConfirmPw ? <EyeSlash size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {confirmPassword && newPassword !== confirmPassword && (
                                    <p className="text-xs text-red-500">รหัสผ่านไม่ตรงกัน</p>
                                )}
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-100 flex justify-end">
                            <button
                                onClick={handleChangePassword}
                                disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword}
                                className="bg-primary text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-900/10 hover:bg-opacity-90 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {changingPassword ? (
                                    <SpinnerGap size={20} className="animate-spin" />
                                ) : (
                                    <LockKey weight="bold" />
                                )}
                                เปลี่ยนรหัสผ่าน
                            </button>
                        </div>
                    </div>
                )}

                {/* ===== NOTIFICATIONS TAB ===== */}
                {activeTab === 'notifications' && (
                    <LineConnection />
                )}
            </div>

            {toast && <Toast message={toast.message} type={toast.type} />}
        </div>
    );
}
