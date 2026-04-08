import { describe, test, expect } from "bun:test";
import { canCreateListing, canUploadPhotos, getListingExpiryDate } from "../config/packages";

// ─── canCreateListing ───────────────────────────────────────────────────────

describe("canCreateListing", () => {
    test("allows when under limit", () => {
        expect(canCreateListing(5, 3)).toBe(true);
    });

    test("allows when at 0 listings with limit > 0", () => {
        expect(canCreateListing(1, 0)).toBe(true);
    });

    test("blocks when at limit", () => {
        expect(canCreateListing(5, 5)).toBe(false);
    });

    test("blocks when over limit", () => {
        expect(canCreateListing(3, 10)).toBe(false);
    });

    test("always allows unlimited (-1)", () => {
        expect(canCreateListing(-1, 0)).toBe(true);
        expect(canCreateListing(-1, 100)).toBe(true);
        expect(canCreateListing(-1, 999999)).toBe(true);
    });

    test("blocks when limit is 0", () => {
        expect(canCreateListing(0, 0)).toBe(false);
    });
});

// ─── canUploadPhotos ────────────────────────────────────────────────────────

describe("canUploadPhotos", () => {
    test("allows when total is under limit", () => {
        expect(canUploadPhotos(10, 5, 3)).toBe(true);
    });

    test("allows when total equals limit", () => {
        expect(canUploadPhotos(10, 5, 5)).toBe(true);
    });

    test("blocks when total exceeds limit", () => {
        expect(canUploadPhotos(10, 5, 6)).toBe(false);
    });

    test("allows 0 new photos", () => {
        expect(canUploadPhotos(10, 10, 0)).toBe(true);
    });

    test("blocks when already at max", () => {
        expect(canUploadPhotos(10, 10, 1)).toBe(false);
    });

    test("allows upload from empty", () => {
        expect(canUploadPhotos(10, 0, 10)).toBe(true);
    });
});

// ─── getListingExpiryDate ───────────────────────────────────────────────────

describe("getListingExpiryDate", () => {
    test("returns null for unlimited (-1)", () => {
        expect(getListingExpiryDate(-1)).toBeNull();
    });

    test("returns date 30 days from now for 30-day duration", () => {
        const before = Date.now();
        const result = getListingExpiryDate(30);
        const after = Date.now();

        expect(result).not.toBeNull();
        const expected30days = 30 * 24 * 60 * 60 * 1000;
        expect(result!.getTime()).toBeGreaterThanOrEqual(before + expected30days);
        expect(result!.getTime()).toBeLessThanOrEqual(after + expected30days);
    });

    test("returns date 7 days from now for 7-day duration", () => {
        const result = getListingExpiryDate(7);
        expect(result).not.toBeNull();
        const diffMs = result!.getTime() - Date.now();
        const diffDays = diffMs / (24 * 60 * 60 * 1000);
        expect(diffDays).toBeGreaterThan(6.99);
        expect(diffDays).toBeLessThan(7.01);
    });

    test("returns date very close to now for 0-day duration", () => {
        const result = getListingExpiryDate(0);
        expect(result).not.toBeNull();
        const diffMs = Math.abs(result!.getTime() - Date.now());
        expect(diffMs).toBeLessThan(1000); // within 1 second
    });
});
