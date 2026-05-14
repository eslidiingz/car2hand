"use client";

/**
 * Persistent banner shown on every page when the current tab is in
 * admin "login as user" mode. Provides an explicit exit button.
 *
 * Activation signal: `sessionStorage['impersonation']` set by `/admin-impersonate`.
 */

import { useEffect, useState } from "react";
import { ShieldAlert, LogOut } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

interface ImpersonationState {
    active: boolean;
    startedAt: string;
    userId: string;
    userName: string;
}

function readImpersonation(): ImpersonationState | null {
    if (typeof window === "undefined") return null;
    const raw = sessionStorage.getItem("impersonation");
    if (!raw) return null;
    try {
        const parsed = JSON.parse(raw) as ImpersonationState;
        return parsed.active ? parsed : null;
    } catch {
        return null;
    }
}

export default function ImpersonationBanner() {
    const [state, setState] = useState<ImpersonationState | null>(null);
    const [exiting, setExiting] = useState(false);

    useEffect(() => {
        setState(readImpersonation());
        const sync = () => setState(readImpersonation());
        window.addEventListener("userLogin", sync);
        window.addEventListener("userLogout", sync);
        // Cross-tab safety — if another tab clears storage, reflect it here.
        window.addEventListener("storage", sync);
        return () => {
            window.removeEventListener("userLogin", sync);
            window.removeEventListener("userLogout", sync);
            window.removeEventListener("storage", sync);
        };
    }, []);

    // Toggle body class — paired with globals.css rules that push the fixed
    // navbar + main padding down to clear the banner.
    useEffect(() => {
        if (state) {
            document.body.classList.add("is-impersonating");
            return () => document.body.classList.remove("is-impersonating");
        }
    }, [state]);

    if (!state) return null;

    const handleExit = async () => {
        setExiting(true);
        const stored = sessionStorage.getItem("user");
        let token: string | null = null;
        if (stored) {
            try {
                token = JSON.parse(stored)?.token ?? null;
            } catch { /* noop */ }
        }

        // Best-effort blacklist of the impersonation token. Don't block exit if it fails.
        if (token) {
            try {
                await fetch(`${API_URL}/auth/logout`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                });
            } catch { /* noop */ }
        }

        sessionStorage.removeItem("user");
        sessionStorage.removeItem("impersonation");
        document.cookie = "has_session=; path=/; max-age=0";
        window.dispatchEvent(new Event("userLogout"));

        // Try to close the tab (it was opened by the admin app via window.open).
        // Browsers block close() on tabs not opened via script — fall back to redirect.
        window.close();
        setTimeout(() => {
            window.location.href = "/";
        }, 200);
    };

    return (
        <div className="fixed top-0 left-0 right-0 z-[110] h-10 bg-amber-500 text-amber-950 border-b border-amber-600 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0 text-sm">
                    <ShieldAlert size={16} className="flex-shrink-0" />
                    <span className="truncate">
                        <strong className="hidden sm:inline">Admin Impersonate</strong>
                        <span className="hidden sm:inline"> — </span>
                        ใช้งานในนาม <strong>{state.userName}</strong>
                    </span>
                </div>
                <button
                    type="button"
                    onClick={handleExit}
                    disabled={exiting}
                    className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-950 text-amber-50 text-xs font-medium hover:bg-black transition disabled:opacity-50"
                >
                    <LogOut size={14} />
                    {exiting ? "กำลังออก..." : "ออก"}
                </button>
            </div>
        </div>
    );
}
