/**
 * Regression test — make sure `storage.ts` keeps its original public API
 * after being refactored to use the pluggable provider system underneath.
 *
 * Rather than hit real MinIO, we mock the `minio` SDK module so the file
 * imports cleanly and any exercised helpers resolve against the mock.
 */

import { describe, test, expect, mock } from "bun:test";

// ─── Mock minio SDK so `storage.ts` can be loaded without a real server ──

mock.module("minio", () => {
    return {
        Client: class {
            constructor(_cfg: unknown) { }
            async putObject() { return { etag: "x" }; }
            async removeObject() { }
            async removeObjects() { }
            listObjects() {
                const stream = {
                    on(event: string, cb: (v: unknown) => void) {
                        if (event === "end") queueMicrotask(() => cb(undefined));
                        return stream;
                    },
                };
                return stream;
            }
            async bucketExists() { return true; }
            async makeBucket() { }
            async setBucketPolicy() { }
        },
    };
});

import * as storage from "../storage";

// ─── Shape / surface regression ─────────────────────────────────────────

describe("storage.ts — public API shape", () => {
    test("exports uploadAvatar as a function", () => {
        expect(typeof storage.uploadAvatar).toBe("function");
    });

    test("exports uploadListingImage as a function", () => {
        expect(typeof storage.uploadListingImage).toBe("function");
    });

    test("exports deleteFile as a function", () => {
        expect(typeof storage.deleteFile).toBe("function");
    });

    test("exports deleteByPrefix as a function", () => {
        expect(typeof storage.deleteByPrefix).toBe("function");
    });

    test("exports listFiles as a function", () => {
        expect(typeof storage.listFiles).toBe("function");
    });

    test("exports extractObjectPath as a function", () => {
        expect(typeof storage.extractObjectPath).toBe("function");
    });

    test("exports getPublicUrl as a function", () => {
        expect(typeof storage.getPublicUrl).toBe("function");
    });
});

// ─── Pure helpers — must still work exactly as before ──────────────────

describe("storage.ts — pure helpers still behave", () => {
    test("extractObjectPath handles null/undefined/empty", () => {
        expect(storage.extractObjectPath(null)).toBeNull();
        expect(storage.extractObjectPath(undefined)).toBeNull();
        expect(storage.extractObjectPath("")).toBeNull();
    });

    test("extractObjectPath extracts path from a valid URL", () => {
        // The exact shape depends on BUCKET/env — just verify non-null + contains the tail.
        const url = `http://localhost:9000/${process.env.MINIO_BUCKET || "uploads"}/u1/avatar/x.webp`;
        const path = storage.extractObjectPath(url);
        expect(path).toBe("u1/avatar/x.webp");
    });

    test("getPublicUrl returns a URL-looking string containing the path", () => {
        const url = storage.getPublicUrl("abc/def.webp");
        expect(url).toMatch(/^https?:\/\//);
        expect(url).toContain("abc/def.webp");
    });
});

// ─── Mocked I/O — returns / shapes preserved ───────────────────────────

describe("storage.ts — I/O surface (with mocked SDK)", () => {
    test("deleteFile resolves (void) without throwing", async () => {
        await expect(storage.deleteFile("u1/x.webp")).resolves.toBeUndefined();
    });

    test("deleteByPrefix returns a number", async () => {
        const n = await storage.deleteByPrefix("u1/");
        expect(typeof n).toBe("number");
    });

    test("listFiles returns an array", async () => {
        const files = await storage.listFiles("u1/");
        expect(Array.isArray(files)).toBe(true);
    });
});
