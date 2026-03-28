"use client";

import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api";

const POLL_INTERVAL = 60_000; // refresh ทุก 60 วินาที

export function usePendingUpgrades() {
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchCount = useCallback(async () => {
        try {
            const data = await apiFetch("/admin/packages/transactions?status=PENDING&limit=1");
            setCount(data.pagination?.total ?? data.transactions?.length ?? 0);
        } catch {
            // ไม่ทำให้ UI พัง ถ้า fetch ไม่สำเร็จ
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCount();
        const id = setInterval(fetchCount, POLL_INTERVAL);
        return () => clearInterval(id);
    }, [fetchCount]);

    return { count, loading, refresh: fetchCount };
}

export function usePendingListings() {
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchCount = useCallback(async () => {
        try {
            const data = await apiFetch("/admin/listings?status=PENDING&limit=1");
            setCount(data.pagination?.total ?? 0);
        } catch {
            // ไม่ทำให้ UI พัง ถ้า fetch ไม่สำเร็จ
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCount();
        const id = setInterval(fetchCount, POLL_INTERVAL);
        return () => clearInterval(id);
    }, [fetchCount]);

    return { count, loading, refresh: fetchCount };
}
