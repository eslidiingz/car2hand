"use client";

import DashboardLayout from "@/components/DashboardLayout";
import {
    Settings,
    CreditCard,
    Upload,
    Save,
    Loader2,
    QrCode,
    Building2,
    X,
    CheckCircle
} from "lucide-react";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const THAI_BANKS = [
    { value: "kbank", label: "ธนาคารกสิกรไทย (KBank)" },
    { value: "scb", label: "ธนาคารไทยพาณิชย์ (SCB)" },
    { value: "bbl", label: "ธนาคารกรุงเทพ (BBL)" },
    { value: "ktb", label: "ธนาคารกรุงไทย (KTB)" },
    { value: "bay", label: "ธนาคารกรุงศรีอยุธยา (BAY)" },
    { value: "ttb", label: "ธนาคารทหารไทยธนชาต (TTB)" },
    { value: "gsb", label: "ธนาคารออมสิน (GSB)" },
    { value: "promptpay", label: "พร้อมเพย์ (PromptPay)" },
];

interface PaymentSettings {
    "payment.bankCode": string;
    "payment.bankName": string;
    "payment.accountNumber": string;
    "payment.accountName": string;
    "payment.promptPayNumber": string;
    "payment.qrCodeImage": string;
    "payment.note": string;
}

const DEFAULT_SETTINGS: PaymentSettings = {
    "payment.bankCode": "",
    "payment.bankName": "",
    "payment.accountNumber": "",
    "payment.accountName": "",
    "payment.promptPayNumber": "",
    "payment.qrCodeImage": "",
    "payment.note": "",
};

export default function SettingsPage() {
    const [settings, setSettings] = useState<PaymentSettings>(DEFAULT_SETTINGS);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setIsLoading(true);
        try {
            const data = await apiFetch('/admin/settings?prefix=payment.');
            setSettings({ ...DEFAULT_SETTINGS, ...data });
        } catch (error) {
            console.error('Fetch settings error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const updateSetting = (key: keyof PaymentSettings, value: string) => {
        setSettings(prev => ({ ...prev, [key]: value }));
        setHasChanges(true);
    };

    const handleBankChange = (bankCode: string) => {
        const bank = THAI_BANKS.find(b => b.value === bankCode);
        setSettings(prev => ({
            ...prev,
            "payment.bankCode": bankCode,
            "payment.bankName": bank?.label || "",
        }));
        setHasChanges(true);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await apiFetch('/admin/settings', {
                method: 'PUT',
                body: JSON.stringify(settings),
            });
            toast.success("บันทึกการตั้งค่าเรียบร้อยแล้ว");
            setHasChanges(false);
        } catch (error: any) {
            toast.error(error.message || "ไม่สามารถบันทึกการตั้งค่าได้");
        } finally {
            setIsSaving(false);
        }
    };

    const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const result = await apiFetch('/admin/settings/upload-qr', {
                method: 'POST',
                body: formData,
            });

            setSettings(prev => ({ ...prev, "payment.qrCodeImage": result.url }));
            setHasChanges(true);
            toast.success("อัพโหลด QR Code สำเร็จ");
        } catch (error: any) {
            toast.error(error.message || "ไม่สามารถอัพโหลด QR Code ได้");
        } finally {
            setIsUploading(false);
        }
    };

    const removeQrCode = () => {
        setSettings(prev => ({ ...prev, "payment.qrCodeImage": "" }));
        setHasChanges(true);
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center py-32">
                    <Loader2 className="h-8 w-8 text-primary animate-spin mb-3" />
                    <p className="text-slate-400 text-sm">กำลังโหลดการตั้งค่า...</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-800 flex items-center gap-2">
                        <Settings className="text-primary" /> ตั้งค่าระบบ
                    </h1>
                    <p className="text-slate-500 mt-1 text-sm">จัดการข้อมูลบัญชีรับโอนเงินสำหรับการอัพเกรดแพ็กเกจ</p>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={isSaving || !hasChanges}
                    className="bg-brand-primary hover:bg-brand-primary/90 text-white font-medium"
                >
                    {isSaving ? (
                        <><Loader2 className="animate-spin mr-2" size={16} /> กำลังบันทึก...</>
                    ) : (
                        <><Save size={16} className="mr-2" /> บันทึกการตั้งค่า</>
                    )}
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Bank Account Info */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="rounded-xl border-slate-200 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <Building2 size={18} className="text-primary" />
                                บัญชีธนาคารรับโอนเงิน
                            </CardTitle>
                            <CardDescription>
                                ข้อมูลบัญชีที่ผู้ใช้จะใช้โอนเงินเพื่ออัพเกรดแพ็กเกจ
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label>ธนาคาร</Label>
                                    <Select
                                        value={settings["payment.bankCode"]}
                                        onValueChange={handleBankChange}
                                    >
                                        <SelectTrigger className="h-10 rounded-lg bg-slate-50 border-slate-200">
                                            <SelectValue placeholder="เลือกธนาคาร" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-lg">
                                            {THAI_BANKS.map(bank => (
                                                <SelectItem key={bank.value} value={bank.value} className="py-2">
                                                    {bank.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label>เลขที่บัญชี</Label>
                                    <Input
                                        value={settings["payment.accountNumber"]}
                                        onChange={(e) => updateSetting("payment.accountNumber", e.target.value)}
                                        placeholder="เช่น 123-4-56789-0"
                                        className="h-10 rounded-lg bg-slate-50 border-slate-200"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label>ชื่อบัญชี</Label>
                                <Input
                                    value={settings["payment.accountName"]}
                                    onChange={(e) => updateSetting("payment.accountName", e.target.value)}
                                    placeholder="เช่น บริษัท คาร์ทูแฮนด์ จำกัด"
                                    className="h-10 rounded-lg bg-slate-50 border-slate-200"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-xl border-slate-200 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <CreditCard size={18} className="text-primary" />
                                พร้อมเพย์ (PromptPay)
                            </CardTitle>
                            <CardDescription>
                                ตั้งค่าพร้อมเพย์สำหรับให้ผู้ใช้สแกนจ่ายเงิน
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1.5">
                                <Label>หมายเลขพร้อมเพย์ (เบอร์โทรหรือเลขบัตรประชาชน)</Label>
                                <Input
                                    value={settings["payment.promptPayNumber"]}
                                    onChange={(e) => updateSetting("payment.promptPayNumber", e.target.value)}
                                    placeholder="เช่น 08x-xxx-xxxx"
                                    className="h-10 rounded-lg bg-slate-50 border-slate-200"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label>หมายเหตุเพิ่มเติม (แสดงให้ผู้ใช้เห็น)</Label>
                                <Input
                                    value={settings["payment.note"]}
                                    onChange={(e) => updateSetting("payment.note", e.target.value)}
                                    placeholder="เช่น กรุณาโอนเงินตามจำนวนที่แสดง แล้วแนบสลิป"
                                    className="h-10 rounded-lg bg-slate-50 border-slate-200"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* QR Code */}
                <div>
                    <Card className="rounded-xl border-slate-200 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <QrCode size={18} className="text-primary" />
                                QR Code ชำระเงิน
                            </CardTitle>
                            <CardDescription>
                                อัพโหลดรูป QR Code สำหรับให้ผู้ใช้สแกนจ่าย
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {settings["payment.qrCodeImage"] ? (
                                <div className="space-y-3">
                                    <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-white">
                                        <img
                                            src={settings["payment.qrCodeImage"]}
                                            alt="Payment QR Code"
                                            className="w-full aspect-square object-contain p-2"
                                        />
                                        <button
                                            onClick={removeQrCode}
                                            className="absolute top-2 right-2 h-7 w-7 bg-white/90 rounded-md flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors shadow-sm border border-slate-200"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-emerald-600">
                                        <CheckCircle size={14} />
                                        <span>QR Code พร้อมใช้งาน</span>
                                    </div>
                                    <div className="relative">
                                        <Button
                                            variant="outline"
                                            className="w-full font-medium relative overflow-hidden"
                                            disabled={isUploading}
                                        >
                                            {isUploading ? (
                                                <><Loader2 className="animate-spin mr-2" size={16} /> กำลังอัพโหลด...</>
                                            ) : (
                                                <><Upload size={16} className="mr-2" /> เปลี่ยน QR Code</>
                                            )}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleQrUpload}
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                                disabled={isUploading}
                                            />
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="relative group">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleQrUpload}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        disabled={isUploading}
                                    />
                                    <div className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center transition-colors bg-slate-50 border-slate-200 group-hover:border-primary/40 group-hover:bg-primary/5 aspect-square">
                                        {isUploading ? (
                                            <>
                                                <Loader2 className="h-8 w-8 text-primary animate-spin mb-3" />
                                                <p className="text-sm font-medium text-slate-600">กำลังอัพโหลด...</p>
                                            </>
                                        ) : (
                                            <>
                                                <div className="h-14 w-14 bg-white rounded-lg flex items-center justify-center shadow-sm mb-3">
                                                    <QrCode className="h-7 w-7 text-primary" />
                                                </div>
                                                <p className="text-sm font-medium text-slate-600">อัพโหลด QR Code</p>
                                                <p className="text-xs text-slate-400 mt-1 text-center">PNG, JPG (แนะนำ 500x500px)</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
