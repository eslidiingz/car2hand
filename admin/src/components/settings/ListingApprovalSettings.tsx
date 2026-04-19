"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, ShieldCheck, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

/**
 * Shape of all known admin-managed settings returned from
 * `GET /api/admin/settings`. The backend always responds with defaults — never
 * 404 — so the union here is exhaustive for the admin UI.
 *
 * To add a new setting card, extend this interface AND render another
 * <Card> below — the page is structured so additional settings drop in
 * without touching existing code.
 */
interface KnownSettings {
    basicListingRequiresApproval: boolean;
}

const SETTING_KEY = "basicListingRequiresApproval" as const;

export default function ListingApprovalSettings() {
    const [requiresApproval, setRequiresApproval] = useState<boolean>(true);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = (await apiFetch("/admin/settings")) as {
                    settings: KnownSettings;
                };
                if (!cancelled) {
                    setRequiresApproval(Boolean(res.settings?.basicListingRequiresApproval));
                }
            } catch (err) {
                console.error("Fetch listing approval setting error:", err);
                if (!cancelled) {
                    toast.error("ไม่สามารถโหลดการตั้งค่าได้");
                }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    const handleToggle = async () => {
        if (isSaving || isLoading) return;
        const previous = requiresApproval;
        const next = !previous;

        // Optimistic update — flip locally first
        setRequiresApproval(next);
        setIsSaving(true);

        try {
            await apiFetch(`/admin/settings/${SETTING_KEY}`, {
                method: "PUT",
                body: JSON.stringify({ value: next }),
            });
            toast.success(
                next
                    ? "เปิดการตรวจสอบประกาศ Basic แล้ว"
                    : "ปิดการตรวจสอบประกาศ Basic แล้ว (อนุมัติอัตโนมัติ)"
            );
        } catch (err) {
            // Revert on error
            setRequiresApproval(previous);
            const message = err instanceof Error ? err.message : "ไม่สามารถบันทึกการตั้งค่าได้";
            toast.error(message);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-24">
                <Loader2 className="h-7 w-7 text-primary animate-spin mb-3" />
                <p className="text-muted-foreground text-sm">กำลังโหลดการตั้งค่า...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Card className="rounded-xl border-border shadow-sm">
                <CardHeader>
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <ShieldCheck size={18} className="text-primary" />
                        การอนุมัติประกาศ
                    </CardTitle>
                    <CardDescription>
                        ตั้งค่าว่าประกาศจากผู้ใช้แพ็กเกจ Basic ต้องผ่านการตรวจสอบจากแอดมินก่อนหรือไม่
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                    {/* Toggle row */}
                    <div className="flex items-start justify-between gap-4 rounded-lg border border-border bg-muted/40 p-4">
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">
                                ต้องตรวจสอบประกาศจากผู้ใช้แพ็กเกจ Basic ก่อนเผยแพร่
                            </p>
                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                {requiresApproval
                                    ? "ปัจจุบัน: ประกาศจากแพ็กเกจ Basic ต้องรอแอดมินอนุมัติก่อนถึงจะแสดงบนเว็บ"
                                    : "ปัจจุบัน: ประกาศจากแพ็กเกจ Basic อนุมัติอัตโนมัติเหมือนแพ็กเกจอื่น"}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                {requiresApproval
                                    ? "หากปิด: ประกาศจะเผยแพร่ทันทีโดยไม่ต้องรอตรวจสอบ"
                                    : "หากเปิด: ประกาศจะค้างในสถานะรอตรวจสอบจนกว่าแอดมินจะอนุมัติ"}
                            </p>
                        </div>

                        <button
                            type="button"
                            role="switch"
                            aria-checked={requiresApproval}
                            aria-label="ต้องตรวจสอบประกาศจากผู้ใช้แพ็กเกจ Basic ก่อนเผยแพร่"
                            disabled={isSaving}
                            onClick={handleToggle}
                            className={cn(
                                "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer items-center rounded-full transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                                requiresApproval ? "bg-primary" : "bg-muted-foreground/30",
                                isSaving && "opacity-60 cursor-not-allowed"
                            )}
                        >
                            <span
                                className={cn(
                                    "inline-flex h-5 w-5 items-center justify-center transform rounded-full bg-white shadow-sm transition-transform",
                                    requiresApproval ? "translate-x-5" : "translate-x-0.5"
                                )}
                            >
                                {isSaving && (
                                    <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                                )}
                            </span>
                        </button>
                    </div>

                    {/* Note callout */}
                    <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/30 dark:bg-amber-500/10">
                        <Info
                            size={16}
                            className="text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0"
                        />
                        <div className="text-xs leading-relaxed text-amber-800 dark:text-amber-200">
                            <p className="font-medium">หมายเหตุ</p>
                            <p className="mt-0.5">
                                ฟีเจอร์นี้มีผลกับแพ็กเกจ <strong>Basic เท่านั้น</strong> —
                                แพ็กเกจอื่น (Standard / Pro / Premium) จะอนุมัติทันทีเสมอไม่ว่าตั้งค่าใด ๆ
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
