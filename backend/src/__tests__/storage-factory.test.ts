/**
 * Unit tests for the storage provider factory (DB-backed + cache).
 *
 * Mocks the Prisma client (`../db`) so we can control which row the factory
 * sees, and the two provider factories so we can assert which was chosen.
 */

import { describe, test, expect, beforeAll, mock } from "bun:test";

// ─── Mocks ──────────────────────────────────────────────────────────────

type Row = { provider: "MINIO" | "CLOUDFLARE_R2"; config: Record<string, unknown> };

const dbState: { current: Row | null } = { current: null };
let findFirstCalls = 0;

mock.module("../db", () => ({
    default: {
        storageSetting: {
            findFirst: async () => {
                findFirstCalls++;
                return dbState.current;
            },
        },
    },
}));

// Brand the fakes so we can identify which factory got called
const minioBrand = { __brand: "minio" };
const r2Brand = { __brand: "r2" };

mock.module("../storage/minio-provider", () => ({
    createMinioProvider: (_c: unknown) => minioBrand,
}));

mock.module("../storage/cloudflare-provider", () => ({
    createCloudflareProvider: (_c: unknown) => r2Brand,
}));

// Imports after mocks
let getActiveProvider: () => Promise<unknown>;
let getProviderByType: (t: "MINIO" | "CLOUDFLARE_R2", c: Record<string, unknown>) => unknown;
let invalidateProviderCache: () => void;

beforeAll(async () => {
    const mod = await import("../storage/factory");
    getActiveProvider = mod.getActiveProvider;
    getProviderByType = mod.getProviderByType;
    invalidateProviderCache = mod.invalidateProviderCache;
});

// ─── getProviderByType ─────────────────────────────────────────────────

describe("getProviderByType", () => {
    test("returns MinIO provider for 'MINIO'", () => {
        expect(getProviderByType("MINIO", {})).toBe(minioBrand);
    });

    test("returns Cloudflare provider for 'CLOUDFLARE_R2'", () => {
        expect(getProviderByType("CLOUDFLARE_R2", {})).toBe(r2Brand);
    });

    test("throws on invalid provider type", () => {
        expect(() =>
            getProviderByType("NOPE" as unknown as "MINIO", {}),
        ).toThrow();
    });
});

// ─── getActiveProvider ─────────────────────────────────────────────────

describe("getActiveProvider", () => {
    test("reads from DB and returns MinIO provider when row is MINIO", async () => {
        invalidateProviderCache();
        findFirstCalls = 0;
        dbState.current = { provider: "MINIO", config: { bucket: "u" } };
        const p = await getActiveProvider();
        expect(p).toBe(minioBrand);
        expect(findFirstCalls).toBe(1);
    });

    test("reads from DB and returns R2 provider when row is CLOUDFLARE_R2", async () => {
        invalidateProviderCache();
        findFirstCalls = 0;
        dbState.current = {
            provider: "CLOUDFLARE_R2",
            config: { bucket: "c", accountId: "a", publicUrl: "https://x" },
        };
        const p = await getActiveProvider();
        expect(p).toBe(r2Brand);
        expect(findFirstCalls).toBe(1);
    });

    test("caches after first call (no extra findFirst)", async () => {
        invalidateProviderCache();
        findFirstCalls = 0;
        dbState.current = { provider: "MINIO", config: {} };
        await getActiveProvider();
        await getActiveProvider();
        await getActiveProvider();
        expect(findFirstCalls).toBe(1);
    });

    test("invalidateProviderCache forces a fresh DB read on next call", async () => {
        invalidateProviderCache();
        findFirstCalls = 0;
        dbState.current = { provider: "MINIO", config: {} };
        const first = await getActiveProvider();
        expect(first).toBe(minioBrand);

        // Now flip the DB + cache and read again
        dbState.current = {
            provider: "CLOUDFLARE_R2",
            config: { bucket: "c", accountId: "a", publicUrl: "https://x" },
        };
        invalidateProviderCache();
        const second = await getActiveProvider();
        expect(second).toBe(r2Brand);
        expect(findFirstCalls).toBe(2);
    });

    test("falls back to MinIO env when no DB row exists", async () => {
        invalidateProviderCache();
        dbState.current = null;
        const p = await getActiveProvider();
        expect(p).toBe(minioBrand);
    });
});
