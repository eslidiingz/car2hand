import { describe, test, expect, beforeEach } from "bun:test";
import {
    generateAccessToken,
    generateRefreshToken,
    isTokenBlacklisted,
    blacklistToken,
    verifyAuthToken,
} from "../jwt";

// ─── generateAccessToken ────────────────────────────────────────────────────

describe("generateAccessToken", () => {
    test("calls jwtSign with correct payload", async () => {
        let capturedPayload: any = null;
        const mockSign = async (payload: any) => {
            capturedPayload = payload;
            return "mock-token";
        };

        const token = await generateAccessToken(mockSign, "user-123", "test@test.com");
        expect(token).toBe("mock-token");
        expect(capturedPayload.userId).toBe("user-123");
        expect(capturedPayload.email).toBe("test@test.com");
        expect(capturedPayload.type).toBe("access");
    });

    test("returns string token", async () => {
        const mockSign = async () => "jwt-abc-123";
        const token = await generateAccessToken(mockSign, "id", "email");
        expect(typeof token).toBe("string");
    });
});

// ─── generateRefreshToken ───────────────────────────────────────────────────

describe("generateRefreshToken", () => {
    test("calls jwtSign with refresh type", async () => {
        let capturedPayload: any = null;
        const mockSign = async (payload: any) => {
            capturedPayload = payload;
            return "refresh-token";
        };

        const token = await generateRefreshToken(mockSign, "user-456");
        expect(token).toBe("refresh-token");
        expect(capturedPayload.userId).toBe("user-456");
        expect(capturedPayload.type).toBe("refresh");
    });
});

// ─── blacklistToken / isTokenBlacklisted ────────────────────────────────────

describe("token blacklist", () => {
    test("token is not blacklisted initially", () => {
        expect(isTokenBlacklisted("fresh-token-" + Date.now())).toBe(false);
    });

    test("blacklisted token is detected", () => {
        const token = "test-blacklist-" + Date.now();
        blacklistToken(token);
        expect(isTokenBlacklisted(token)).toBe(true);
    });

    test("non-blacklisted token returns false", () => {
        blacklistToken("token-A");
        expect(isTokenBlacklisted("token-B-" + Date.now())).toBe(false);
    });
});

// ─── verifyAuthToken ────────────────────────────────────────────────────────

describe("verifyAuthToken", () => {
    const mockPayload = { userId: "user-1", email: "test@test.com", iat: 0, exp: 0 };

    function makeRequest(authHeader?: string): Request {
        const headers: Record<string, string> = {};
        if (authHeader) headers["Authorization"] = authHeader;
        return new Request("http://localhost/test", { headers });
    }

    test("extracts token from Authorization Bearer header", async () => {
        const mockVerify = async () => mockPayload;
        const result = await verifyAuthToken(mockVerify as any, makeRequest("Bearer valid-token"), {});
        expect(result).not.toBeNull();
        expect(result!.userId).toBe("user-1");
        expect(result!.email).toBe("test@test.com");
        expect(result!.token).toBe("valid-token");
    });

    test("returns null when no token provided", async () => {
        const mockVerify = async () => mockPayload;
        const result = await verifyAuthToken(mockVerify as any, makeRequest(), {});
        expect(result).toBeNull();
    });

    test("returns null for blacklisted token", async () => {
        const blacklistedToken = "blacklisted-verify-" + Date.now();
        blacklistToken(blacklistedToken);
        const mockVerify = async () => mockPayload;
        const result = await verifyAuthToken(mockVerify as any, makeRequest(`Bearer ${blacklistedToken}`), {});
        expect(result).toBeNull();
    });

    test("returns null when jwt.verify returns false", async () => {
        const mockVerify = async () => false;
        const result = await verifyAuthToken(mockVerify as any, makeRequest("Bearer expired-token"), {});
        expect(result).toBeNull();
    });

    test("returns null when jwt.verify throws", async () => {
        const mockVerify = async () => { throw new Error("invalid"); };
        const result = await verifyAuthToken(mockVerify as any, makeRequest("Bearer bad-token"), {});
        expect(result).toBeNull();
    });

    test("extracts token from cookie fallback", async () => {
        const mockVerify = async () => mockPayload;
        const cookie = { accessToken: { value: "cookie-token" } };
        const result = await verifyAuthToken(mockVerify as any, makeRequest(), cookie);
        expect(result).not.toBeNull();
        expect(result!.token).toBe("cookie-token");
    });

    test("prefers Authorization header over cookie", async () => {
        const mockVerify = async () => mockPayload;
        const cookie = { accessToken: { value: "cookie-token" } };
        const result = await verifyAuthToken(mockVerify as any, makeRequest("Bearer header-token"), cookie);
        expect(result!.token).toBe("header-token");
    });
});
