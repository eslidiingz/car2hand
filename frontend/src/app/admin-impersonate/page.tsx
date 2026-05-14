"use client";

/**
 * Landing page for the admin "login as user" flow.
 *
 * Receives a short-lived impersonation JWT via `?token=...`, validates it by
 * fetching `/users/me`, then stores the session like a normal login — except:
 *   - sessionStorage only (never localStorage) so it dies when the tab closes
 *   - sets `impersonation` flag in sessionStorage so the banner shows on every page
 *
 * The issued token has `impersonatedBy: <adminId>` claim, and the backend rejects
 * dangerous mutations (password / email / delete / payments) for impersonation tokens.
 */

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, AlertTriangle, ShieldAlert } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

function ImpersonateLanding() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [error, setError] = useState<string | null>(null);
    // React 18 strict-mode mounts effects twice; ignore the second invocation.
    const ranRef = useRef(false);

    useEffect(() => {
        if (ranRef.current) return;
        ranRef.current = true;

        const token = searchParams.get("token");
        if (!token) {
            setError("ไม่พบ token สำหรับการ impersonate");
            return;
        }

        (async () => {
            try {
                const res = await fetch(`${API_URL}/users/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) {
                    const body = await res.json().catch(() => ({}));
                    throw new Error(body.message || "Token ไม่ถูกต้องหรือหมดอายุ");
                }
                const { user } = await res.json();

                // Wipe any pre-existing user session in this tab so we don't leak
                // the admin's own session into the impersonated context.
                localStorage.removeItem("user");
                sessionStorage.removeItem("user");

                const userWithToken = { ...user, token };
                sessionStorage.setItem("user", JSON.stringify(userWithToken));
                sessionStorage.setItem(
                    "impersonation",
                    JSON.stringify({
                        active: true,
                        startedAt: new Date().toISOString(),
                        userId: user.id,
                        userName: user.fullName || user.email,
                    })
                );

                // Cookie unlocks middleware-protected routes (/profile, /sell)
                document.cookie = "has_session=1; path=/; SameSite=Strict; max-age=3600";

                window.dispatchEvent(new CustomEvent("userLogin", { detail: userWithToken }));

                router.replace("/profile/dashboard");
            } catch (err) {
                setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
            }
        })();
    }, [searchParams, router]);

    if (error) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center px-4">
                <div className="bg-card border border-border rounded-2xl p-8 max-w-md w-full text-center">
                    <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
                        <AlertTriangle size={28} />
                    </div>
                    <h1 className="text-xl font-bold mb-2">เริ่ม session impersonate ไม่สำเร็จ</h1>
                    <p className="text-sm text-muted-foreground">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[60vh] flex items-center justify-center px-4">
            <div className="bg-card border border-border rounded-2xl p-8 max-w-md w-full text-center">
                <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                    <ShieldAlert size={28} />
                </div>
                <h1 className="text-lg font-bold mb-2">กำลังเข้าใช้งานในนามผู้ใช้...</h1>
                <p className="text-sm text-muted-foreground inline-flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin" /> โปรดรอสักครู่
                </p>
            </div>
        </div>
    );
}

export default function AdminImpersonatePage() {
    return (
        <Suspense fallback={
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="animate-spin text-primary" />
            </div>
        }>
            <ImpersonateLanding />
        </Suspense>
    );
}
