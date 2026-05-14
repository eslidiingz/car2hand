"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";

/**
 * MobileSellCTA — sticky "ลงขายรถฟรี" button for guest mobile visitors.
 *
 * Visibility rules
 * ────────────────
 * - มือถือเท่านั้น (`md:hidden`)
 * - แสดงเฉพาะ user ที่ยังไม่ได้เข้าสู่ระบบ (มี user ใน storage → ไม่แสดง)
 * - หลังเข้าเว็บ / เปลี่ยนหน้า: ซ่อน 5 วินาทีก่อน แล้วค่อย slide-up จากใต้จอ
 * - ซ่อนถาวรในหน้า flow ขาย / auth (เพื่อไม่ให้รบกวน intent ของหน้า)
 *
 * Reactivity
 * ──────────
 * Subscribe to `userLogin` / `userLogout` events (dispatched โดย LoginModal และ
 * logout flow) + `storage` event สำหรับ cross-tab login/logout — ปุ่มจะ
 * appear/disappear ทันทีโดยไม่ต้อง reload หน้า
 *
 * Click action (เหมือนปุ่ม "ลงขายรถฟรี" ใน Navbar)
 * ─────────────────────────────────────────────
 * - dispatch `open-login-modal` event → LoginModal เดิมของ Navbar เปิดขึ้นมา
 */

const SHOW_DELAY_MS = 5_000;

const HIDDEN_PATH_PATTERNS: RegExp[] = [
  /^\/sell(\/|$)/,
  /^\/login(\/|$)/,
  /^\/register(\/|$)/,
  /^\/auth(\/|$)/,
];

function readAuthFromStorage(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return !!(localStorage.getItem("user") || sessionStorage.getItem("user"));
  } catch {
    return false;
  }
}

export default function MobileSellCTA() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);

  const shouldRender =
    !isAuthed && !HIDDEN_PATH_PATTERNS.some((re) => re.test(pathname || ""));

  // Sync auth state from storage + react to login/logout/cross-tab changes
  useEffect(() => {
    setIsAuthed(readAuthFromStorage());

    const syncFromStorage = () => setIsAuthed(readAuthFromStorage());
    const onLogin = () => setIsAuthed(true);
    const onLogout = () => setIsAuthed(false);

    window.addEventListener("userLogin", onLogin);
    window.addEventListener("userLogout", onLogout);
    window.addEventListener("storage", syncFromStorage);
    return () => {
      window.removeEventListener("userLogin", onLogin);
      window.removeEventListener("userLogout", onLogout);
      window.removeEventListener("storage", syncFromStorage);
    };
  }, []);

  // Reset on every path change → wait → show (only if eligible)
  useEffect(() => {
    setVisible(false);
    if (!shouldRender) return;
    const t = setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    return () => clearTimeout(t);
  }, [pathname, shouldRender]);

  if (!shouldRender || !visible) return null;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Always guest at this point (component returns null when authed)
    window.dispatchEvent(new CustomEvent("open-login-modal"));
  };

  return (
    <div
      key={pathname /* re-mount on nav so animation replays */}
      className="md:hidden fixed inset-x-0 z-40 flex justify-center pointer-events-none animate-cta-slide-up"
      style={{ bottom: "calc(1rem + env(safe-area-inset-bottom))" }}
    >
      <button
        type="button"
        onClick={handleClick}
        className="
          pointer-events-auto inline-flex items-center gap-2
          bg-accent hover:bg-accent/90 active:bg-accent/80
          text-white font-bold text-sm
          rounded-full pl-4 pr-5 py-3
          shadow-xl shadow-accent/30
          transition-colors
        "
      >
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/20">
          <Plus size={16} strokeWidth={3} />
        </span>
        ลงขายรถฟรี
      </button>
    </div>
  );
}
