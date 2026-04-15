"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import {
    Save,
    Loader2,
    KeyRound,
    Link2,
    Copy,
    CheckCircle,
    Info,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface FacebookSettings {
    "facebook.appId": string;
    "facebook.appSecret": string;
}

const DEFAULT_FACEBOOK_SETTINGS: FacebookSettings = {
    "facebook.appId": "",
    "facebook.appSecret": "",
};

export default function FacebookOAuthSettings() {
    const [settings, setSettings] = useState<FacebookSettings>(DEFAULT_FACEBOOK_SETTINGS);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [copiedCallback, setCopiedCallback] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setIsLoading(true);
        try {
            const data = await apiFetch("/admin/settings?prefix=facebook.");
            setSettings({ ...DEFAULT_FACEBOOK_SETTINGS, ...data });
        } catch (error) {
            console.error("Fetch Facebook settings error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const updateSetting = (key: keyof FacebookSettings, value: string) => {
        setSettings((prev) => ({ ...prev, [key]: value }));
        setHasChanges(true);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await apiFetch("/admin/settings", {
                method: "PUT",
                body: JSON.stringify(settings),
            });
            toast.success("บันทึกการตั้งค่า Facebook OAuth เรียบร้อยแล้ว");
            setHasChanges(false);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "ไม่สามารถบันทึกการตั้งค่าได้";
            toast.error(message);
        } finally {
            setIsSaving(false);
        }
    };

    const callbackUrl =
        typeof window !== "undefined"
            ? `${window.location.origin.replace(":3001", ":3000")}/auth/facebook-login-callback`
            : "";

    const handleCopyCallback = async () => {
        try {
            await navigator.clipboard.writeText(callbackUrl);
            setCopiedCallback(true);
            toast.success("คัดลอก Callback URL แล้ว");
            setTimeout(() => setCopiedCallback(false), 2000);
        } catch {
            toast.error("ไม่สามารถคัดลอกได้");
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-32">
                <Loader2 className="h-8 w-8 text-primary animate-spin mb-3" />
                <p className="text-slate-400 text-sm">กำลังโหลดการตั้งค่า Facebook OAuth...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <Button
                    onClick={handleSave}
                    disabled={isSaving || !hasChanges}
                    className="bg-brand-primary hover:bg-brand-primary/90 text-white font-medium"
                >
                    {isSaving ? (
                        <><Loader2 className="animate-spin mr-2" size={16} /> กำลังบันทึก...</>
                    ) : (
                        <><Save size={16} className="mr-2" /> บันทึก</>
                    )}
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Facebook OAuth Credentials */}
                <Card className="rounded-xl border-slate-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <KeyRound size={18} className="text-primary" />
                            Facebook Login Credentials
                        </CardTitle>
                        <CardDescription>
                            ตั้งค่า App ID และ App Secret จาก Meta for Developers
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-1.5">
                            <Label>App ID</Label>
                            <Input
                                value={settings["facebook.appId"]}
                                onChange={(e) => updateSetting("facebook.appId", e.target.value)}
                                placeholder="เช่น 1234567890123456"
                                className="h-10 rounded-lg bg-slate-50 border-slate-200 font-mono text-sm"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label>App Secret</Label>
                            <Input
                                type="password"
                                value={settings["facebook.appSecret"]}
                                onChange={(e) => updateSetting("facebook.appSecret", e.target.value)}
                                placeholder="App Secret จาก Meta for Developers"
                                className="h-10 rounded-lg bg-slate-50 border-slate-200"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Setup Guide */}
                <Card className="rounded-xl border-slate-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <Info size={18} className="text-primary" />
                            วิธีตั้งค่า
                        </CardTitle>
                        <CardDescription>
                            ขั้นตอนการตั้งค่า Facebook Login ใน Meta for Developers
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ol className="space-y-2.5 text-sm text-slate-600 list-decimal list-inside">
                            <li>
                                ไปที่{" "}
                                <a
                                    href="https://developers.facebook.com/apps/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline font-medium"
                                >
                                    Meta for Developers → My Apps
                                </a>
                            </li>
                            <li>สร้างแอปใหม่ (Use case: &quot;Authenticate and request data from users with Facebook Login&quot;)</li>
                            <li>เพิ่ม Product &quot;Facebook Login&quot; → &quot;Settings&quot;</li>
                            <li>เพิ่ม Valid OAuth Redirect URIs (ตาม Callback URL ด้านล่าง)</li>
                            <li>คัดลอก App ID และ App Secret จาก &quot;Settings → Basic&quot; มาวางด้านซ้าย</li>
                            <li>เปลี่ยน App Mode เป็น &quot;Live&quot; เมื่อพร้อมใช้งานจริง</li>
                        </ol>
                    </CardContent>
                </Card>
            </div>

            {/* Callback URL */}
            <Card className="rounded-xl border-slate-200 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <Link2 size={18} className="text-primary" />
                        Valid OAuth Redirect URI (Callback URL)
                    </CardTitle>
                    <CardDescription>
                        คัดลอก URL นี้ไปเพิ่มใน Meta for Developers → Facebook Login → Settings → Valid OAuth Redirect URIs
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2">
                        <Input
                            value={callbackUrl}
                            readOnly
                            className="h-10 rounded-lg bg-slate-50 border-slate-200 font-mono text-sm"
                        />
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleCopyCallback}
                            className="h-10 w-10 flex-shrink-0"
                        >
                            {copiedCallback ? (
                                <CheckCircle size={16} className="text-emerald-500" />
                            ) : (
                                <Copy size={16} />
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
