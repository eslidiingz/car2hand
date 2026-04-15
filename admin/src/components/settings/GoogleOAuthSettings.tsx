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

interface GoogleSettings {
    "google.clientId": string;
    "google.clientSecret": string;
}

const DEFAULT_GOOGLE_SETTINGS: GoogleSettings = {
    "google.clientId": "",
    "google.clientSecret": "",
};

export default function GoogleOAuthSettings() {
    const [settings, setSettings] = useState<GoogleSettings>(DEFAULT_GOOGLE_SETTINGS);
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
            const data = await apiFetch("/admin/settings?prefix=google.");
            setSettings({ ...DEFAULT_GOOGLE_SETTINGS, ...data });
        } catch (error) {
            console.error("Fetch Google settings error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const updateSetting = (key: keyof GoogleSettings, value: string) => {
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
            toast.success("บันทึกการตั้งค่า Google OAuth เรียบร้อยแล้ว");
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
            ? `${window.location.origin.replace(":3001", ":3000")}/auth/google-login-callback`
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
                <p className="text-slate-400 text-sm">กำลังโหลดการตั้งค่า Google OAuth...</p>
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
                {/* Google OAuth Credentials */}
                <Card className="rounded-xl border-slate-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <KeyRound size={18} className="text-primary" />
                            Google OAuth 2.0 Credentials
                        </CardTitle>
                        <CardDescription>
                            ตั้งค่า Client ID และ Client Secret จาก Google Cloud Console
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-1.5">
                            <Label>Client ID</Label>
                            <Input
                                value={settings["google.clientId"]}
                                onChange={(e) => updateSetting("google.clientId", e.target.value)}
                                placeholder="เช่น 123456789-abc.apps.googleusercontent.com"
                                className="h-10 rounded-lg bg-slate-50 border-slate-200 font-mono text-sm"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Client Secret</Label>
                            <Input
                                type="password"
                                value={settings["google.clientSecret"]}
                                onChange={(e) => updateSetting("google.clientSecret", e.target.value)}
                                placeholder="Client Secret จาก Google Cloud Console"
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
                            ขั้นตอนการตั้งค่า Google OAuth ใน Google Cloud Console
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ol className="space-y-2.5 text-sm text-slate-600 list-decimal list-inside">
                            <li>
                                ไปที่{" "}
                                <a
                                    href="https://console.cloud.google.com/apis/credentials"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline font-medium"
                                >
                                    Google Cloud Console → Credentials
                                </a>
                            </li>
                            <li>คลิก &quot;Create Credentials&quot; → &quot;OAuth client ID&quot;</li>
                            <li>เลือก Application type: &quot;Web application&quot;</li>
                            <li>เพิ่ม Authorized redirect URI (ตาม Callback URL ด้านล่าง)</li>
                            <li>คัดลอก Client ID และ Client Secret มาวางด้านซ้าย</li>
                            <li>
                                ตั้งค่า{" "}
                                <a
                                    href="https://console.cloud.google.com/apis/credentials/consent"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline font-medium"
                                >
                                    OAuth Consent Screen
                                </a>
                                {" "}ให้เรียบร้อย
                            </li>
                        </ol>
                    </CardContent>
                </Card>
            </div>

            {/* Callback URL */}
            <Card className="rounded-xl border-slate-200 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <Link2 size={18} className="text-primary" />
                        Authorized Redirect URI (Callback URL)
                    </CardTitle>
                    <CardDescription>
                        คัดลอก URL นี้ไปเพิ่มใน Google Cloud Console → Credentials → OAuth 2.0 Client IDs → Authorized redirect URIs
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
