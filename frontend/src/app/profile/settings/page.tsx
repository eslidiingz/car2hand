"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
    User,
    Mail,
    Phone,
    Lock,
    Bell,
    Save,
    Eye,
    EyeOff,
    Loader2,
    Camera,
    Trash2,
    AlertTriangle,
} from 'lucide-react';
import LineConnection from '@/components/settings/LineConnection';
import SellerProfileForm from '@/components/settings/SellerProfileForm';
import Toast from '@/components/Toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface UserProfile {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    isActive: boolean;
    lineUserId: string | null;
    profileImage: string | null;
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

function updateStoredUser(updates: Partial<{ fullName: string; phoneNumber: string; profileImage: string | null }>) {
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

    // Avatar state
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [removingAvatar, setRemovingAvatar] = useState(false);
    const [showRemoveAvatarConfirm, setShowRemoveAvatarConfirm] = useState(false);

    // Delete account state
    const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
    const [deleteStep, setDeleteStep] = useState<'intro' | 'code'>('intro');
    const [requestingDeleteCode, setRequestingDeleteCode] = useState(false);
    const [deleteCodeInput, setDeleteCodeInput] = useState('');
    const [deleteAccountError, setDeleteAccountError] = useState<string | null>(null);
    const [deletingAccount, setDeletingAccount] = useState(false);
    const [deleteCodeSentEmail, setDeleteCodeSentEmail] = useState<string | null>(null);
    const [deleteCodeExpiryMinutes, setDeleteCodeExpiryMinutes] = useState(15);

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

    const handleUploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        // Reset input so picking the same file again still triggers change
        e.target.value = '';
        if (!file) return;

        const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!ALLOWED.includes(file.type)) {
            showToast('รองรับเฉพาะไฟล์ JPG, PNG, WebP, GIF', 'error');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            showToast('ขนาดไฟล์ต้องไม่เกิน 5MB', 'error');
            return;
        }

        setUploadingAvatar(true);
        try {
            const token = getAuthToken();
            const formData = new FormData();
            formData.append('file', file);
            const res = await fetch(`${API_URL}/users/me/avatar`, {
                method: 'POST',
                headers: token ? { 'Authorization': `Bearer ${token}` } : {},
                body: formData,
            });
            const data = await res.json();
            if (!res.ok) {
                showToast(data.message || data.error || 'อัปโหลดไม่สำเร็จ', 'error');
                return;
            }
            setProfile(prev => prev ? { ...prev, profileImage: data.profileImage } : prev);
            updateStoredUser({ profileImage: data.profileImage });
            window.dispatchEvent(new CustomEvent('userProfileUpdate', { detail: { profileImage: data.profileImage } }));
            showToast(data.message || 'อัปโหลดรูปโปรไฟล์สำเร็จ', 'success');
        } catch {
            showToast('ไม่สามารถอัปโหลดรูปได้', 'error');
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleRemoveAvatar = async () => {
        if (!profile?.profileImage) return;

        setShowRemoveAvatarConfirm(false);
        setRemovingAvatar(true);
        try {
            const token = getAuthToken();
            const res = await fetch(`${API_URL}/users/me/avatar`, {
                method: 'DELETE',
                headers: token ? { 'Authorization': `Bearer ${token}` } : {},
            });
            const data = await res.json();
            if (!res.ok) {
                showToast(data.message || data.error || 'ลบไม่สำเร็จ', 'error');
                return;
            }
            setProfile(prev => prev ? { ...prev, profileImage: null } : prev);
            updateStoredUser({ profileImage: null });
            window.dispatchEvent(new CustomEvent('userProfileUpdate', { detail: { profileImage: null } }));
            showToast(data.message || 'ลบรูปโปรไฟล์สำเร็จ', 'success');
        } catch {
            showToast('ไม่สามารถลบรูปได้', 'error');
        } finally {
            setRemovingAvatar(false);
        }
    };

    const openDeleteAccountModal = () => {
        setDeleteStep('intro');
        setDeleteCodeInput('');
        setDeleteAccountError(null);
        setDeleteCodeSentEmail(null);
        setShowDeleteAccountModal(true);
    };

    const closeDeleteAccountModal = () => {
        if (deletingAccount || requestingDeleteCode) return;
        setShowDeleteAccountModal(false);
    };

    const handleRequestDeleteCode = async () => {
        setRequestingDeleteCode(true);
        setDeleteAccountError(null);
        try {
            const token = getAuthToken();
            const res = await fetch(`${API_URL}/users/me/delete-account/request`, {
                method: 'POST',
                headers: token ? { 'Authorization': `Bearer ${token}` } : {},
            });
            const data = await res.json();
            if (!res.ok) {
                setDeleteAccountError(data.message || data.error || 'ไม่สามารถส่งรหัสได้');
                return;
            }
            setDeleteCodeSentEmail(data.email || profile?.email || null);
            setDeleteCodeExpiryMinutes(data.expiresInMinutes || 15);
            setDeleteStep('code');
        } catch {
            setDeleteAccountError('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
        } finally {
            setRequestingDeleteCode(false);
        }
    };

    const handleConfirmDeleteAccount = async () => {
        const code = deleteCodeInput.trim();
        if (!/^\d{6}$/.test(code)) {
            setDeleteAccountError('กรุณากรอกรหัสยืนยัน 6 หลัก');
            return;
        }

        setDeletingAccount(true);
        setDeleteAccountError(null);
        try {
            const token = getAuthToken();
            const res = await fetch(`${API_URL}/users/me`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ code }),
            });
            const data = await res.json();
            if (!res.ok) {
                setDeleteAccountError(data.message || data.error || 'ไม่สามารถลบบัญชีได้');
                return;
            }

            // Wipe local session and redirect home
            localStorage.removeItem('user');
            sessionStorage.removeItem('user');
            document.cookie = 'has_session=; path=/; max-age=0';
            window.dispatchEvent(new CustomEvent('userLogout'));

            showToast(data.message || 'ลบบัญชีของคุณเรียบร้อยแล้ว', 'success');
            setTimeout(() => {
                window.location.href = '/';
            }, 1200);
        } catch {
            setDeleteAccountError('เกิดข้อผิดพลาด กรุณาลองใหม่');
        } finally {
            setDeletingAccount(false);
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
                {profile?.currentPackage && profile.currentPackage.slug !== 'basic' && (
                    <button
                        onClick={() => setActiveTab('shop')}
                        className={`px-4 sm:px-6 py-3 text-sm font-bold border-b-2 transition whitespace-nowrap ${activeTab === 'shop' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        ร้านค้า/ธุรกิจ
                    </button>
                )}
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm">
                {/* ===== PROFILE TAB ===== */}
                {activeTab === 'profile' && (
                    <>
                        {loading ? (
                            <div className="flex items-center justify-center py-16">
                                <Loader2 size={32} className="animate-spin text-primary" />
                            </div>
                        ) : !profile ? (
                            <div className="text-center py-10 text-gray-500">
                                <User size={48} className="mx-auto mb-4 text-gray-300" />
                                <p>ไม่สามารถโหลดข้อมูลผู้ใช้ได้ กรุณาเข้าสู่ระบบใหม่</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Profile Image */}
                                <div className="flex flex-col sm:flex-row items-center gap-4 pb-4">
                                    <div className="relative">
                                        <div className="w-24 h-24 rounded-full overflow-hidden bg-primary text-white flex items-center justify-center text-2xl font-bold shadow-md ring-4 ring-white">
                                            {profile.profileImage ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={profile.profileImage}
                                                    alt={profile.fullName}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span>
                                                    {profile.fullName
                                                        .split(' ')
                                                        .map(s => s[0])
                                                        .join('')
                                                        .toUpperCase()
                                                        .slice(0, 2) || 'U'}
                                                </span>
                                            )}
                                        </div>
                                        <label
                                            htmlFor="avatar-upload"
                                            className={`absolute -bottom-1 -right-1 w-9 h-9 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-md transition ${uploadingAvatar ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-gray-50 hover:scale-105'}`}
                                            title="เปลี่ยนรูปโปรไฟล์"
                                        >
                                            {uploadingAvatar ? (
                                                <Loader2 size={16} className="animate-spin text-primary" />
                                            ) : (
                                                <Camera size={16} className="text-primary" />
                                            )}
                                            <input
                                                id="avatar-upload"
                                                type="file"
                                                accept="image/jpeg,image/png,image/webp,image/gif"
                                                className="hidden"
                                                onChange={handleUploadAvatar}
                                                disabled={uploadingAvatar || removingAvatar}
                                            />
                                        </label>
                                    </div>

                                    <div className="flex-1 text-center sm:text-left">
                                        <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-3">
                                            {profile.profileImage && (
                                                <button
                                                    type="button"
                                                    onClick={() => setShowRemoveAvatarConfirm(true)}
                                                    disabled={removingAvatar || uploadingAvatar}
                                                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {removingAvatar ? (
                                                        <Loader2 size={14} className="animate-spin" />
                                                    ) : (
                                                        <Trash2 size={14} />
                                                    )}
                                                    ลบรูป
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-6">
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
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">อีเมล</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={18} />
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
                                            <Loader2 size={20} className="animate-spin" />
                                        ) : (
                                            <Save />
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
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 mb-1">เปลี่ยนรหัสผ่าน</h3>
                            <p className="text-sm text-gray-500">กรอกรหัสผ่านปัจจุบันและรหัสผ่านใหม่ที่ต้องการ</p>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">รหัสผ่านปัจจุบัน</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={18} />
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
                                        {showCurrentPw ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">รหัสผ่านใหม่</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={18} />
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
                                        {showNewPw ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">ยืนยันรหัสผ่านใหม่</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={18} />
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
                                        {showConfirmPw ? <EyeOff size={18} /> : <Eye size={18} />}
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
                                    <Loader2 size={20} className="animate-spin" />
                                ) : (
                                    <Lock />
                                )}
                                เปลี่ยนรหัสผ่าน
                            </button>
                        </div>

                        {/* Danger Zone — Delete Account */}
                        <div className="mt-10 pt-6 border-t border-red-100">
                            <div className="rounded-2xl border border-red-200 bg-red-50/50 p-5 sm:p-6">
                                <div className="flex items-start gap-3 mb-3">
                                    <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <AlertTriangle className="text-red-500" size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-base font-bold text-red-700">ลบบัญชีของฉัน</h3>
                                        <p className="text-sm text-red-600/80 mt-1 leading-relaxed">
                                            เมื่อลบบัญชี ข้อมูลทั้งหมดของคุณจะถูกลบอย่างถาวร
                                            รวมถึงประกาศ รถในโรงรถ ข้อความในชุมชน และไม่สามารถกู้คืนได้
                                        </p>
                                    </div>
                                </div>
                                <div className="flex justify-end mt-3">
                                    <button
                                        type="button"
                                        onClick={openDeleteAccountModal}
                                        className="inline-flex items-center gap-2 bg-white border border-red-300 text-red-600 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-red-100 transition"
                                    >
                                        <Trash2 size={16} />
                                        ลบบัญชีของฉัน
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ===== NOTIFICATIONS TAB ===== */}
                {activeTab === 'notifications' && (
                    <LineConnection />
                )}

                {activeTab === 'shop' && (
                    <SellerProfileForm />
                )}
            </div>

            {toast && <Toast message={toast.message} type={toast.type} />}

            {/* Delete Account Modal — 2-step (intro -> code) */}
            {showDeleteAccountModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={closeDeleteAccountModal}
                    />
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden">
                        {deleteStep === 'intro' && (
                            <div className="p-8">
                                <div className="text-center mb-6">
                                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <AlertTriangle className="text-red-500" size={32} />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-2">ลบบัญชีถาวร</h2>
                                    <p className="text-sm text-gray-500 leading-relaxed">
                                        การลบบัญชีจะทำให้ข้อมูลทั้งหมดของคุณถูกลบอย่างถาวร
                                        และไม่สามารถกู้คืนได้
                                    </p>
                                </div>

                                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 mb-6">
                                    <p className="font-bold mb-2">ข้อมูลที่จะถูกลบ:</p>
                                    <ul className="list-disc list-inside space-y-1 text-xs leading-relaxed">
                                        <li>โปรไฟล์และรูปโปรไฟล์</li>
                                        <li>ประกาศขายรถทั้งหมด</li>
                                        <li>รถในโรงรถ (Garage) และรายการโปรด</li>
                                        <li>กระทู้ ข้อความ และความคิดเห็นในชุมชน</li>
                                        <li>ประวัติการทำธุรกรรมและการเชื่อมต่อโซเชียล</li>
                                    </ul>
                                </div>

                                <p className="text-xs text-gray-500 text-center mb-5">
                                    เพื่อยืนยันการลบบัญชี เราจะส่งรหัส 6 หลักไปที่อีเมล{' '}
                                    <strong className="text-gray-800">{profile?.email}</strong>
                                </p>

                                {deleteAccountError && (
                                    <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2 text-center mb-3">
                                        {deleteAccountError}
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <button
                                        onClick={closeDeleteAccountModal}
                                        disabled={requestingDeleteCode}
                                        className="flex-1 py-3 px-4 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
                                    >
                                        ยกเลิก
                                    </button>
                                    <button
                                        onClick={handleRequestDeleteCode}
                                        disabled={requestingDeleteCode}
                                        className="flex-1 py-3 px-4 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {requestingDeleteCode ? (
                                            <>
                                                <Loader2 size={16} className="animate-spin" />
                                                กำลังส่ง...
                                            </>
                                        ) : (
                                            <>
                                                <Mail size={16} />
                                                ส่งรหัสยืนยัน
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}

                        {deleteStep === 'code' && (
                            <div className="p-8">
                                <div className="text-center mb-6">
                                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Mail className="text-red-500" size={28} />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-2">กรอกรหัสยืนยัน</h2>
                                    <p className="text-sm text-gray-500 leading-relaxed">
                                        เราได้ส่งรหัส 6 หลักไปที่
                                        <br />
                                        <strong className="text-gray-800">{deleteCodeSentEmail}</strong>
                                        <br />
                                        รหัสจะหมดอายุภายใน {deleteCodeExpiryMinutes} นาที
                                    </p>
                                </div>

                                <input
                                    type="text"
                                    inputMode="numeric"
                                    autoComplete="one-time-code"
                                    maxLength={6}
                                    value={deleteCodeInput}
                                    onChange={(e) => {
                                        setDeleteCodeInput(e.target.value.replace(/\D/g, '').slice(0, 6));
                                        setDeleteAccountError(null);
                                    }}
                                    placeholder="000000"
                                    className="w-full text-center text-3xl font-mono tracking-[0.5em] py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-red-400 focus:ring-4 focus:ring-red-100"
                                    autoFocus
                                />

                                {deleteAccountError && (
                                    <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2 text-center mt-3">
                                        {deleteAccountError}
                                    </div>
                                )}

                                <button
                                    type="button"
                                    onClick={() => {
                                        setDeleteStep('intro');
                                        setDeleteCodeInput('');
                                        setDeleteAccountError(null);
                                    }}
                                    disabled={deletingAccount}
                                    className="text-xs text-gray-500 hover:text-primary mt-3 block w-full text-center transition disabled:opacity-50"
                                >
                                    ขอรหัสใหม่อีกครั้ง
                                </button>

                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={closeDeleteAccountModal}
                                        disabled={deletingAccount}
                                        className="flex-1 py-3 px-4 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
                                    >
                                        ยกเลิก
                                    </button>
                                    <button
                                        onClick={handleConfirmDeleteAccount}
                                        disabled={deletingAccount || deleteCodeInput.length !== 6}
                                        className="flex-1 py-3 px-4 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {deletingAccount ? (
                                            <>
                                                <Loader2 size={16} className="animate-spin" />
                                                กำลังลบ...
                                            </>
                                        ) : (
                                            <>
                                                <Trash2 size={16} />
                                                ลบบัญชีถาวร
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Remove Avatar Confirmation Modal */}
            {showRemoveAvatarConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => !removingAvatar && setShowRemoveAvatarConfirm(false)}
                    />
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 relative z-10 transform transition-all">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="text-red-500" size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">ลบรูปโปรไฟล์</h3>
                            <p className="text-gray-500 text-sm mb-6">
                                ต้องการลบรูปโปรไฟล์ของคุณใช่หรือไม่?<br />
                                การกระทำนี้ไม่สามารถย้อนกลับได้
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowRemoveAvatarConfirm(false)}
                                    disabled={removingAvatar}
                                    className="flex-1 py-3 px-4 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    onClick={handleRemoveAvatar}
                                    disabled={removingAvatar}
                                    className="flex-1 py-3 px-4 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {removingAvatar ? (
                                        <Loader2 size={18} className="animate-spin" />
                                    ) : (
                                        <Trash2 size={18} />
                                    )}
                                    ลบรูป
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
