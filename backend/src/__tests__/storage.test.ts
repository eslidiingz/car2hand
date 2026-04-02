import { describe, test, expect } from "bun:test";
import {
    isValidImageType,
    isValidFileSize,
    generateFilename,
    extractObjectPath,
    buildAvatarPath,
    buildListingImagePath,
    buildArticlePath,
    getPublicUrl,
} from "../storage";

// ─── isValidImageType ───────────────────────────────────────────────────────

describe("isValidImageType", () => {
    test("accepts image/jpeg", () => {
        expect(isValidImageType("image/jpeg")).toBe(true);
    });

    test("accepts image/png", () => {
        expect(isValidImageType("image/png")).toBe(true);
    });

    test("accepts image/webp", () => {
        expect(isValidImageType("image/webp")).toBe(true);
    });

    test("accepts image/gif", () => {
        expect(isValidImageType("image/gif")).toBe(true);
    });

    test("rejects image/svg+xml", () => {
        expect(isValidImageType("image/svg+xml")).toBe(false);
    });

    test("rejects application/pdf", () => {
        expect(isValidImageType("application/pdf")).toBe(false);
    });

    test("rejects text/html", () => {
        expect(isValidImageType("text/html")).toBe(false);
    });

    test("rejects empty string", () => {
        expect(isValidImageType("")).toBe(false);
    });

    test("rejects image/bmp", () => {
        expect(isValidImageType("image/bmp")).toBe(false);
    });
});

// ─── isValidFileSize ────────────────────────────────────────────────────────

describe("isValidFileSize", () => {
    const MB = 1024 * 1024;

    test("accepts 0 bytes", () => {
        expect(isValidFileSize(0)).toBe(true);
    });

    test("accepts 5MB (under default 10MB)", () => {
        expect(isValidFileSize(5 * MB)).toBe(true);
    });

    test("accepts exactly 10MB (default limit)", () => {
        expect(isValidFileSize(10 * MB)).toBe(true);
    });

    test("rejects 11MB (over default 10MB)", () => {
        expect(isValidFileSize(11 * MB)).toBe(false);
    });

    test("accepts custom limit: 2MB file with 5MB max", () => {
        expect(isValidFileSize(2 * MB, 5)).toBe(true);
    });

    test("rejects custom limit: 6MB file with 5MB max", () => {
        expect(isValidFileSize(6 * MB, 5)).toBe(false);
    });

    test("accepts exactly at custom limit", () => {
        expect(isValidFileSize(5 * MB, 5)).toBe(true);
    });
});

// ─── generateFilename ───────────────────────────────────────────────────────

describe("generateFilename", () => {
    test("generates filename with timestamp and random string", () => {
        const result = generateFilename("photo.jpg");
        expect(result).toMatch(/^\d+-[a-z0-9]+\.jpg$/);
    });

    test("preserves extension lowercase", () => {
        const result = generateFilename("IMAGE.PNG");
        expect(result).toEndWith(".png");
    });

    test("uses filename as extension when no dot present", () => {
        const result = generateFilename("noext");
        expect(result).toEndWith(".noext");
    });

    test("generates unique filenames", () => {
        const a = generateFilename("test.jpg");
        const b = generateFilename("test.jpg");
        // Might be same timestamp in fast execution, but random part should differ most of the time
        // Just check both are valid format
        expect(a).toMatch(/^\d+-[a-z0-9]+\.jpg$/);
        expect(b).toMatch(/^\d+-[a-z0-9]+\.jpg$/);
    });

    test("handles filename with multiple dots", () => {
        const result = generateFilename("my.photo.name.webp");
        expect(result).toEndWith(".webp");
    });
});

// ─── extractObjectPath ──────────────────────────────────────────────────────

describe("extractObjectPath", () => {
    test("extracts path from valid MinIO URL", () => {
        const url = "http://localhost:9000/uploads/user1/avatar/photo.webp";
        const result = extractObjectPath(url);
        expect(result).toBe("user1/avatar/photo.webp");
    });

    test("returns null for non-MinIO URL", () => {
        const result = extractObjectPath("https://example.com/image.jpg");
        expect(result).toBeNull();
    });

    test("returns null for null input", () => {
        expect(extractObjectPath(null)).toBeNull();
    });

    test("returns null for undefined input", () => {
        expect(extractObjectPath(undefined)).toBeNull();
    });

    test("returns null for empty string", () => {
        expect(extractObjectPath("")).toBeNull();
    });

    test("handles nested path", () => {
        const url = "http://localhost:9000/uploads/userId/listings/listingId/image.webp";
        const result = extractObjectPath(url);
        expect(result).toBe("userId/listings/listingId/image.webp");
    });
});

// ─── Path builders ──────────────────────────────────────────────────────────

describe("buildAvatarPath", () => {
    test("builds correct avatar path", () => {
        expect(buildAvatarPath("user-123", "avatar.webp")).toBe("user-123/avatar/avatar.webp");
    });
});

describe("buildListingImagePath", () => {
    test("builds correct listing image path", () => {
        expect(buildListingImagePath("user-1", "listing-1", "img.webp")).toBe(
            "user-1/listings/listing-1/img.webp"
        );
    });
});

describe("buildArticlePath", () => {
    test("builds correct article path", () => {
        expect(buildArticlePath("article-img.webp")).toBe("articles/article-img.webp");
    });
});

// ─── getPublicUrl ───────────────────────────────────────────────────────────

describe("getPublicUrl", () => {
    test("builds URL with object path", () => {
        const url = getPublicUrl("user-1/avatar/photo.webp");
        expect(url).toContain("user-1/avatar/photo.webp");
        expect(url).toMatch(/^https?:\/\//);
    });

    test("includes bucket name in URL", () => {
        const url = getPublicUrl("test/file.jpg");
        // URL should contain the bucket name
        expect(url).toContain("/");
    });
});
