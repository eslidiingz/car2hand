"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import {
    Save,
    Loader2,
    MessageSquare,
    LogIn,
    Link2,
    Copy,
    CheckCircle,
    AlertCircle,
    Plug,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface LineSettings {
    "line.channelId": string;
    "line.channelSecret": string;
    "line.channelAccessToken": string;
    "line.loginChannelId": string;
    "line.loginChannelSecret": string;
}

const DEFAULT_LINE_SETTINGS: LineSettings = {
    "line.channelId": "",
    "line.channelSecret": "",
    "line.channelAccessToken": "",
    "line.loginChannelId": "",
    "line.loginChannelSecret": "",
};

export default function LineOASettings() {
    const [settings, setSettings] = useState<LineSettings>(DEFAULT_LINE_SETTINGS);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setIsLoading(true);
        try {
            const data = await apiFetch("/admin/settings?prefix=line.");
            setSettings({ ...DEFAULT_LINE_SETTINGS, ...data });
        } catch (error) {
            console.error("Fetch LINE settings error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const updateSetting = (key: keyof LineSettings, value: string) => {
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
            toast.success("บันทึกการตั้งค่า LINE OA เรียบร้อยแล้ว");
            setHasChanges(false);
        } catch (error: any) {
            toast.error(error.message || "ไม่สามารถบันทึกการตั้งค่าได้");
        } finally {
            setIsSaving(false);
        }
    };

    const handleTestConnection = async () => {
        setIsTesting(true);
        try {
            const result = await apiFetch("/admin/settings/line/test", {
                method: "POST",
            });
            toast.success(`เชื่อมต่อสำเร็จ! Bot: ${result.botName || result.displayName || "OK"}`);
        } catch (error: any) {
            toast.error(error.message || "ไม่สามารถเชื่อมต่อ LINE OA ได้");
        } finally {
            setIsTesting(false);
        }
    };

    const webhookUrl =
        typeof window !== "undefined"
            ? `${window.location.origin.replace(":3001", ":8000")}/api/line/webhook`
            : "";

    const handleCopyWebhook = async () => {
        try {
            await navigator.clipboard.writeText(webhookUrl);
            setCopied(true);
            toast.success("คัดลอก Webhook URL แล้ว");
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error("ไม่สามารถคัดลอกได้");
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-32">
                <Loader2 className="h-8 w-8 text-primary animate-spin mb-3" />
                <p className="text-slate-400 text-sm">กำลังโหลดการตั้งค่า LINE OA...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={handleTestConnection}
                        disabled={isTesting || !settings["line.channelAccessToken"]}
                    >
                        {isTesting ? (
                            <><Loader2 className="animate-spin mr-2" size={16} /> กำลังทดสอบ...</>
                        ) : (
                            <><Plug size={16} className="mr-2" /> ทดสอบการเชื่อมต่อ</>
                        )}
                    </Button>
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
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Messaging API */}
                <Card className="rounded-xl border-border shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <MessageSquare size={18} className="text-primary" />
                            Messaging API
                        </CardTitle>
                        <CardDescription>
                            ตั้งค่า Channel สำหรับส่งข้อความผ่าน LINE OA
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-1.5">
                            <Label>Channel ID</Label>
                            <Input
                                value={settings["line.channelId"]}
                                onChange={(e) => updateSetting("line.channelId", e.target.value)}
                                placeholder="เช่น 1234567890"
                                className="h-10 rounded-lg bg-muted border-border"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Channel Secret</Label>
                            <Input
                                type="password"
                                value={settings["line.channelSecret"]}
                                onChange={(e) => updateSetting("line.channelSecret", e.target.value)}
                                placeholder="Channel Secret จาก LINE Developers Console"
                                className="h-10 rounded-lg bg-muted border-border"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Channel Access Token (Long-lived)</Label>
                            <Textarea
                                value={settings["line.channelAccessToken"]}
                                onChange={(e) => updateSetting("line.channelAccessToken", e.target.value)}
                                placeholder="Channel Access Token จาก LINE Developers Console"
                                className="rounded-lg bg-muted border-border min-h-[80px]"
                                rows={3}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* LINE Login */}
                <Card className="rounded-xl border-border shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <LogIn size={18} className="text-primary" />
                            LINE Login
                        </CardTitle>
                        <CardDescription>
                            ตั้งค่า Channel สำหรับเข้าสู่ระบบด้วย LINE
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-1.5">
                            <Label>Login Channel ID</Label>
                            <Input
                                value={settings["line.loginChannelId"]}
                                onChange={(e) => updateSetting("line.loginChannelId", e.target.value)}
                                placeholder="เช่น 1234567890"
                                className="h-10 rounded-lg bg-muted border-border"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Login Channel Secret</Label>
                            <Input
                                type="password"
                                value={settings["line.loginChannelSecret"]}
                                onChange={(e) => updateSetting("line.loginChannelSecret", e.target.value)}
                                placeholder="Channel Secret จาก LINE Developers Console"
                                className="h-10 rounded-lg bg-muted border-border"
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Webhook URL */}
            <Card className="rounded-xl border-border shadow-sm">
                <CardHeader>
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <Link2 size={18} className="text-primary" />
                        Webhook URL
                    </CardTitle>
                    <CardDescription>
                        คัดลอก URL นี้ไปตั้งค่าใน LINE Developers Console &gt; Messaging API &gt; Webhook URL
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2">
                        <Input
                            value={webhookUrl}
                            readOnly
                            className="h-10 rounded-lg bg-muted border-border font-mono text-sm"
                        />
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleCopyWebhook}
                            className="h-10 w-10 flex-shrink-0"
                        >
                            {copied ? (
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
