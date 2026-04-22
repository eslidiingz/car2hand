"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { X } from "lucide-react";
import { navigation } from "./Sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { usePendingCounts } from "@/contexts/PendingContext";
import { cn } from "@/lib/utils";

interface MobileNavProps {
    open: boolean;
    onClose: () => void;
}

/**
 * Mobile drawer that mirrors the desktop Sidebar. Uses the same `navigation`
 * array — so adding a page in one place shows up on both layouts.
 */
export default function MobileNav({ open, onClose }: MobileNavProps) {
    const pathname = usePathname();
    const { logout, admin } = useAuth();
    const { pendingUpgradeCount, pendingListingCount, pendingRenewalCount, pendingSlotPurchaseCount, pendingKycCount } = usePendingCounts();

    // Close on route change
    useEffect(() => { onClose(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [pathname]);

    // Lock body scroll while open
    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = prev; };
    }, [open]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[70] md:hidden">
            {/* Backdrop */}
            <button
                aria-label="Close menu"
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Drawer */}
            <aside
                className="absolute left-0 top-0 h-full w-72 max-w-[85vw] bg-card border-r border-border shadow-2xl flex flex-col animate-in slide-in-from-left duration-200"
                role="dialog"
                aria-modal="true"
            >
                {/* Header */}
                <div className="flex h-16 items-center justify-between px-5 border-b border-border">
                    <span className="text-lg font-semibold tracking-tight text-foreground">
                        Car<span className="text-brand-accent">2</span>Hand <span className="text-xs font-normal text-muted-foreground ml-1">Admin</span>
                    </span>
                    <button
                        onClick={onClose}
                        className="h-9 w-9 rounded-lg hover:bg-accent flex items-center justify-center"
                        aria-label="Close menu"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Admin identity */}
                {admin && (
                    <div className="px-5 py-4 border-b border-border">
                        <p className="text-sm font-semibold text-foreground">{admin.fullName || "Admin"}</p>
                        <p className="text-xs text-muted-foreground">@{admin.username || "admin"}</p>
                    </div>
                )}

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto space-y-0.5 px-3 py-4">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href + "/"));
                        const isPackages = item.href === "/packages";
                        const isListings = item.href === "/listings";
                        const isKyc = item.href === "/kyc";
                        const badgeCount = isPackages ? (pendingUpgradeCount + pendingSlotPurchaseCount) : isListings ? (pendingListingCount + pendingRenewalCount) : isKyc ? pendingKycCount : 0;
                        const showBadge = badgeCount > 0;

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={onClose}
                                className={cn(
                                    "flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                                    isActive ? "bg-accent text-foreground font-semibold" : "text-muted-foreground hover:bg-accent hover:text-foreground",
                                )}
                            >
                                <item.icon className="mr-3 h-[18px] w-[18px] flex-shrink-0" aria-hidden="true" />
                                <span className="flex-1">{item.name}</span>
                                {showBadge && (
                                    <span className="ml-auto inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-bold bg-orange-500 text-white leading-none">
                                        {badgeCount > 99 ? "99+" : badgeCount}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout */}
                <div className="border-t border-border p-4">
                    <button
                        onClick={() => { logout(); onClose(); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-500/10 transition"
                    >
                        ออกจากระบบ
                    </button>
                </div>
            </aside>
        </div>
    );
}
