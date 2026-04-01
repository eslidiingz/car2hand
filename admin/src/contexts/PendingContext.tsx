"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react";
import { apiFetch } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

interface PendingState {
    pendingListingCount: number;
    pendingUpgradeCount: number;
    pendingRenewalCount: number;
    refreshListings: () => Promise<void>;
    refreshUpgrades: () => Promise<void>;
    refreshRenewals: () => Promise<void>;
}

const PendingContext = createContext<PendingState>({
    pendingListingCount: 0,
    pendingUpgradeCount: 0,
    pendingRenewalCount: 0,
    refreshListings: async () => {},
    refreshUpgrades: async () => {},
    refreshRenewals: async () => {},
});

export function PendingProvider({ children }: { children: ReactNode }) {
    const [pendingListingCount, setPendingListingCount] = useState(0);
    const [pendingUpgradeCount, setPendingUpgradeCount] = useState(0);
    const [pendingRenewalCount, setPendingRenewalCount] = useState(0);
    const esRef = useRef<EventSource | null>(null);

    const refreshListings = useCallback(async () => {
        try {
            const data = await apiFetch("/admin/listings?status=PENDING&limit=1");
            setPendingListingCount(data.pagination?.total ?? 0);
        } catch {
            // silent
        }
    }, []);

    const refreshUpgrades = useCallback(async () => {
        try {
            const data = await apiFetch("/admin/packages/transactions?status=PENDING&limit=1");
            setPendingUpgradeCount(data.pagination?.total ?? data.transactions?.length ?? 0);
        } catch {
            // silent
        }
    }, []);

    const refreshRenewals = useCallback(async () => {
        try {
            const data = await apiFetch("/admin/listings/renewals?status=PENDING&limit=1");
            setPendingRenewalCount(data.pagination?.total ?? 0);
        } catch {
            // silent
        }
    }, []);

    useEffect(() => {
        // Initial fetch
        refreshListings();
        refreshUpgrades();
        refreshRenewals();

        // Connect SSE
        const token = localStorage.getItem("admin_token");
        if (!token) return;

        const es = new EventSource(`${API_URL}/admin/sse?token=${encodeURIComponent(token)}`);
        esRef.current = es;

        es.addEventListener("pending-update", (e) => {
            try {
                const data = JSON.parse(e.data);
                setPendingListingCount(data.pendingListings ?? 0);
                setPendingUpgradeCount(data.pendingUpgrades ?? 0);
                setPendingRenewalCount(data.pendingRenewals ?? 0);
            } catch {
                // invalid data
            }
        });

        es.onerror = () => {
            // EventSource auto-reconnects; on reconnect it will get fresh counts
        };

        return () => {
            es.close();
            esRef.current = null;
        };
    }, [refreshListings, refreshUpgrades, refreshRenewals]);

    return (
        <PendingContext.Provider value={{ pendingListingCount, pendingUpgradeCount, pendingRenewalCount, refreshListings, refreshUpgrades, refreshRenewals }}>
            {children}
        </PendingContext.Provider>
    );
}

export function usePendingCounts() {
    return useContext(PendingContext);
}
