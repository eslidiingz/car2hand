"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { apiFetch } from "@/lib/api";

const POLL_INTERVAL = 60_000;

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
        refreshListings();
        refreshUpgrades();
        refreshRenewals();
        const id = setInterval(() => {
            refreshListings();
            refreshUpgrades();
            refreshRenewals();
        }, POLL_INTERVAL);
        return () => clearInterval(id);
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
