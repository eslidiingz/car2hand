"use client";

/**
 * Car2Hand shared confirmation dialog — the canonical pattern for
 * "are you sure?" prompts on the buyer/seller frontend.
 *
 * USE THIS for any destructive action confirmation (delete, cancel, remove,
 * logout, etc). Do NOT roll a new inline modal — visual consistency matters
 * more than the 20 lines you'd save.
 *
 * Pattern (chosen from majority usage in the app):
 *   - Backdrop: black/60 + backdrop-blur-sm, clickable to dismiss unless loading
 *   - Container: rounded-3xl (per design-system ladder in CLAUDE.md), shadow-2xl
 *   - Icon: 14x14 circle, red-100 bg + red-500 icon for destructive; amber for warning
 *   - Title: text-lg font-bold, centered
 *   - Description: text-sm text-gray-500, centered, optional
 *   - Buttons: footer row below border-t, 50/50 split, NOT filled — text-red for destructive
 *   - z-[100] per CLAUDE.md z-index ladder
 *
 * Usage:
 *   const [confirming, setConfirming] = useState(false);
 *   const [loading, setLoading] = useState(false);
 *
 *   <ConfirmDialog
 *       open={confirming}
 *       onClose={() => setConfirming(false)}
 *       onConfirm={async () => { ...; setConfirming(false); }}
 *       title="ลบประกาศ"
 *       description="แน่ใจหรือไม่ว่าต้องการลบประกาศนี้?"
 *       confirmLabel="ลบประกาศ"
 *       loading={loading}
 *   />
 */

import { AlertTriangle, Loader2 } from "lucide-react";
import React, { useEffect } from "react";

export type ConfirmDialogVariant = "danger" | "warning";

interface ConfirmDialogProps {
    /** Controls visibility. Keep the modal mounted when false — it renders nothing. */
    open: boolean;
    /** Called when backdrop is clicked, Esc pressed, or "cancel" button clicked. */
    onClose: () => void;
    /** Called when the confirm button is clicked. May be async. */
    onConfirm: () => void | Promise<void>;
    /** Short title — e.g. "ลบประกาศ", "ยืนยันการยกเลิก". */
    title: string;
    /** Optional longer description under the title. Accepts ReactNode for inline spans. */
    description?: React.ReactNode;
    /** Label for the destructive button. Defaults to "ยืนยัน". */
    confirmLabel?: string;
    /** Label for the dismiss button. Defaults to "ยกเลิก". */
    cancelLabel?: string;
    /** Visual treatment. "danger" = red, "warning" = amber. Defaults to "danger". */
    variant?: ConfirmDialogVariant;
    /** Optional custom icon to replace the default AlertTriangle. */
    icon?: React.ReactNode;
    /** When true, disables both buttons and shows a spinner on confirm. */
    loading?: boolean;
}

const VARIANT_STYLES: Record<ConfirmDialogVariant, {
    iconBg: string;
    iconText: string;
    confirmText: string;
    confirmHoverBg: string;
}> = {
    danger: {
        iconBg: "bg-red-100",
        iconText: "text-red-500",
        confirmText: "text-red-600",
        confirmHoverBg: "hover:bg-red-50",
    },
    warning: {
        iconBg: "bg-amber-100",
        iconText: "text-amber-500",
        confirmText: "text-amber-600",
        confirmHoverBg: "hover:bg-amber-50",
    },
};

export default function ConfirmDialog({
    open,
    onClose,
    onConfirm,
    title,
    description,
    confirmLabel = "ยืนยัน",
    cancelLabel = "ยกเลิก",
    variant = "danger",
    icon,
    loading = false,
}: ConfirmDialogProps) {
    // Dismiss on Escape key press (unless loading)
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape" && !loading) onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, loading, onClose]);

    if (!open) return null;

    const v = VARIANT_STYLES[variant];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => !loading && onClose()}
            />
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm relative z-10 overflow-hidden">
                <div className="p-6 text-center">
                    <div className={`w-14 h-14 ${v.iconBg} rounded-full flex items-center justify-center mx-auto mb-4`}>
                        <span className={v.iconText}>
                            {icon || <AlertTriangle size={28} />}
                        </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-1">{title}</h3>
                    {description && (
                        <p className="text-sm text-gray-500 leading-relaxed">
                            {description}
                        </p>
                    )}
                </div>
                <div className="flex border-t border-gray-100">
                    <button
                        type="button"
                        disabled={loading}
                        onClick={onClose}
                        className="flex-1 py-3.5 text-sm font-bold text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        type="button"
                        disabled={loading}
                        onClick={onConfirm}
                        className={`flex-1 py-3.5 text-sm font-bold ${v.confirmText} ${v.confirmHoverBg} transition border-l border-gray-100 flex items-center justify-center gap-1.5 disabled:opacity-50`}
                    >
                        {loading && <Loader2 size={14} className="animate-spin" />}
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
