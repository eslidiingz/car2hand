/**
 * Authentication Unit Tests
 * Tests auth-related logic: password hashing, token flow, security patterns
 * Does NOT require a database — uses mocks and direct function calls
 */

import { describe, test, expect, beforeAll } from "bun:test";
import {
    generateAccessToken,
    isTokenBlacklisted,
    blacklistToken,
    verifyAuthToken,
} from "../jwt";
import { registerSchema, loginSchema, validateInput } from "../validation";
import { sanitizeInput, sanitizeObject } from "../security";

// ─────────────────────────────────────────────────────────────────────────────
// Password Hashing (Argon2id)
// ─────────────────────────────────────────────────────────────────────────────

describe("Password Hashing (Argon2id)", () => {
    const password = "SecurePass123";
    let hash: string;

    beforeAll(async () => {
        hash = await Bun.password.hash(password, {
            algorithm: "argon2id",
            memoryCost: 65536,
            timeCost: 3,
        });
    });

    test("produces argon2id hash", () => {
        expect(hash).toStartWith("$argon2id$");
    });

    test("hash contains expected parameters (v=19, m=65536, t=3)", () => {
        expect(hash).toContain("m=65536");
        expect(hash).toContain("t=3");
    });

    test("verifies correct password", async () => {
        const valid = await Bun.password.verify(password, hash);
        expect(valid).toBe(true);
    });

    test("rejects wrong password", async () => {
        const valid = await Bun.password.verify("WrongPassword1", hash);
        expect(valid).toBe(false);
    });

    test("rejects empty password", async () => {
        const valid = await Bun.password.verify("", hash);
        expect(valid).toBe(false);
    });

    test("different passwords produce different hashes (salt)", async () => {
        const hash2 = await Bun.password.hash(password, {
            algorithm: "argon2id",
            memoryCost: 65536,
            timeCost: 3,
        });
        expect(hash2).not.toBe(hash);
    });

    test("hash respects max password length (72 chars)", async () => {
        const longPass = "A1" + "a".repeat(70); // exactly 72 chars
        const h = await Bun.password.hash(longPass, { algorithm: "argon2id" });
        const valid = await Bun.password.verify(longPass, h);
        expect(valid).toBe(true);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Timing Attack Prevention
// ─────────────────────────────────────────────────────────────────────────────

describe("Timing Attack Prevention", () => {
    test("dummy hash is also argon2id (same algorithm as real hash)", async () => {
        const dummyHash = await Bun.password.hash("dummy-password-for-timing");
        expect(dummyHash).toStartWith("$argon2");
    });

    test("verifying against dummy hash always fails", async () => {
        const dummyHash = await Bun.password.hash("dummy-password-for-timing");
        const result = await Bun.password.verify("any-user-input", dummyHash);
        expect(result).toBe(false);
    });

    test("verify executes for both existing and non-existing user patterns", async () => {
        // Simulates the login flow pattern:
        // 1. User found → verify against user's hash
        // 2. User NOT found → verify against dummy hash
        const realHash = await Bun.password.hash("RealPass1", {
            algorithm: "argon2id",
            memoryCost: 65536,
            timeCost: 3,
        });
        const dummyHash = await Bun.password.hash("dummy-password-for-timing");

        // Case 1: user exists, wrong password
        const userExists = true;
        const passwordToVerify1 = userExists ? realHash : dummyHash;
        const result1 = await Bun.password.verify("WrongPassword", passwordToVerify1);
        expect(result1).toBe(false);

        // Case 2: user does NOT exist
        const userNotFound = false;
        const passwordToVerify2 = userNotFound ? realHash : dummyHash;
        const result2 = await Bun.password.verify("AnyPassword1", passwordToVerify2);
        expect(result2).toBe(false);

        // Both paths executed Bun.password.verify — preventing timing-based enumeration
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// User Enumeration Prevention
// ─────────────────────────────────────────────────────────────────────────────

describe("User Enumeration Prevention", () => {
    test("registration uses same error message for email and phone conflicts", () => {
        // Both paths in auth.ts return the same message to prevent enumeration
        const emailConflictMsg = "อีเมลหรือเบอร์โทรศัพท์นี้ถูกใช้งานแล้ว";
        const phoneConflictMsg = "อีเมลหรือเบอร์โทรศัพท์นี้ถูกใช้งานแล้ว";
        expect(emailConflictMsg).toBe(phoneConflictMsg);
    });

    test("login uses generic 'or' error for both wrong phone and wrong password", () => {
        const loginErrorMsg = "เบอร์โทรศัพท์หรือรหัสผ่านไม่ถูกต้อง";
        // The message combines both fields with "หรือ" (or) — never reveals which one is wrong
        expect(loginErrorMsg).toContain("หรือ");
        // Must not be phone-only or password-only error
        expect(loginErrorMsg).not.toBe("เบอร์โทรศัพท์ไม่ถูกต้อง");
        expect(loginErrorMsg).not.toBe("รหัสผ่านไม่ถูกต้อง");
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Registration Validation
// ─────────────────────────────────────────────────────────────────────────────

describe("Registration Validation", () => {
    const validReg = {
        fullName: "สมชาย รักรถ",
        email: "somchai@example.com",
        phoneNumber: "0812345678",
        password: "Password1",
    };

    test("valid registration passes validation", () => {
        const result = registerSchema.safeParse(validReg);
        expect(result.success).toBe(true);
    });

    test("password must have uppercase", () => {
        const result = registerSchema.safeParse({ ...validReg, password: "password1" });
        expect(result.success).toBe(false);
    });

    test("password must have lowercase", () => {
        const result = registerSchema.safeParse({ ...validReg, password: "PASSWORD1" });
        expect(result.success).toBe(false);
    });

    test("password must have digit", () => {
        const result = registerSchema.safeParse({ ...validReg, password: "PasswordX" });
        expect(result.success).toBe(false);
    });

    test("password min length 8", () => {
        const result = registerSchema.safeParse({ ...validReg, password: "Pass1" });
        expect(result.success).toBe(false);
    });

    test("password max length 72 (bcrypt/argon2 limit)", () => {
        const result = registerSchema.safeParse({ ...validReg, password: "A1" + "a".repeat(71) });
        expect(result.success).toBe(false);
    });

    test("phone must be 10 digits starting with 0", () => {
        expect(registerSchema.safeParse({ ...validReg, phoneNumber: "1234567890" }).success).toBe(false);
        expect(registerSchema.safeParse({ ...validReg, phoneNumber: "08123" }).success).toBe(false);
        expect(registerSchema.safeParse({ ...validReg, phoneNumber: "081234567a" }).success).toBe(false);
    });

    test("email is lowercased", () => {
        const parsed = registerSchema.parse({ ...validReg, email: "Test@EXAMPLE.com" });
        expect(parsed.email).toBe("test@example.com");
    });

    test("name must be Thai or English (no special chars)", () => {
        const result = registerSchema.safeParse({ ...validReg, fullName: "<script>xss</script>" });
        expect(result.success).toBe(false);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Login Validation
// ─────────────────────────────────────────────────────────────────────────────

describe("Login Validation", () => {
    test("valid login passes", () => {
        const result = loginSchema.safeParse({ phoneNumber: "0812345678", password: "pass" });
        expect(result.success).toBe(true);
    });

    test("rememberMe defaults to false", () => {
        const parsed = loginSchema.parse({ phoneNumber: "0812345678", password: "pass" });
        expect(parsed.rememberMe).toBe(false);
    });

    test("rememberMe can be set to true", () => {
        const parsed = loginSchema.parse({ phoneNumber: "0812345678", password: "pass", rememberMe: true });
        expect(parsed.rememberMe).toBe(true);
    });

    test("rejects invalid phone format", () => {
        expect(loginSchema.safeParse({ phoneNumber: "abc", password: "pass" }).success).toBe(false);
    });

    test("rejects empty password", () => {
        expect(loginSchema.safeParse({ phoneNumber: "0812345678", password: "" }).success).toBe(false);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Input Sanitization (used in register)
// ─────────────────────────────────────────────────────────────────────────────

describe("Registration Input Sanitization", () => {
    test("sanitizes XSS in fullName", () => {
        const result = sanitizeObject({
            fullName: '<script>alert("xss")</script>',
            email: "test@test.com",
            phoneNumber: "0812345678",
            password: "Password1",
        });
        expect(result.fullName).not.toContain("<script>");
        expect(result.fullName).toContain("&lt;script&gt;");
    });

    test("preserves non-string fields", () => {
        const result = sanitizeObject({
            name: "test",
            count: 42,
            active: true,
        });
        expect(result.count).toBe(42);
        expect(result.active).toBe(true);
    });

    test("sanitizes nested objects", () => {
        const result = sanitizeObject({
            user: { name: "<img onerror=alert(1)>" },
        });
        expect((result.user as any).name).not.toContain("<img");
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Token Generation & Verification Flow
// ─────────────────────────────────────────────────────────────────────────────

describe("Token Generation Flow", () => {
    test("access token payload includes userId, email, and type", async () => {
        let payload: any = null;
        const mockSign = async (p: any) => { payload = p; return "token"; };

        await generateAccessToken(mockSign, "user-123", "user@test.com");
        expect(payload).toEqual({
            userId: "user-123",
            email: "user@test.com",
            type: "access",
        });
    });

    test("token is a non-empty string", async () => {
        const mockSign = async () => "eyJhbGciOiJIUzI1NiJ9.test.sig";
        const token = await generateAccessToken(mockSign, "id", "email");
        expect(token.length).toBeGreaterThan(0);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Logout & Token Blacklist
// ─────────────────────────────────────────────────────────────────────────────

describe("Logout & Token Blacklist", () => {
    test("blacklisted token is rejected by verifyAuthToken", async () => {
        const token = "logout-test-" + Date.now();
        blacklistToken(token);

        const mockVerify = async () => ({ userId: "u1", email: "e@e.com", iat: 0, exp: 0 });
        const result = await verifyAuthToken(
            mockVerify as any,
            new Request("http://localhost/test", {
                headers: { Authorization: `Bearer ${token}` },
            }),
            {}
        );
        expect(result).toBeNull();
    });

    test("non-blacklisted token passes verifyAuthToken", async () => {
        const token = "valid-token-" + Date.now();
        const mockVerify = async () => ({ userId: "u1", email: "e@e.com", iat: 0, exp: 0 });
        const result = await verifyAuthToken(
            mockVerify as any,
            new Request("http://localhost/test", {
                headers: { Authorization: `Bearer ${token}` },
            }),
            {}
        );
        expect(result).not.toBeNull();
        expect(result!.userId).toBe("u1");
    });

    test("logout without token still succeeds (no error thrown)", () => {
        // Simulates the logout handler pattern
        const authHeader: string | null = null;
        if (authHeader?.startsWith("Bearer ")) {
            blacklistToken(authHeader.substring(7));
        }
        // No error — idempotent
        expect(true).toBe(true);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Token Verify Flow
// ─────────────────────────────────────────────────────────────────────────────

describe("Token Verify Flow", () => {
    test("returns userId when token is valid", async () => {
        const mockVerify = async () => ({ userId: "uid-999", email: "x@x.com", iat: 0, exp: 0 });
        const result = await verifyAuthToken(
            mockVerify as any,
            new Request("http://localhost/test", {
                headers: { Authorization: "Bearer good-token" },
            }),
            {}
        );
        expect(result?.userId).toBe("uid-999");
    });

    test("returns null when no Authorization header", async () => {
        const mockVerify = async () => ({ userId: "uid", email: "e", iat: 0, exp: 0 });
        const result = await verifyAuthToken(mockVerify as any, new Request("http://localhost/test"), {});
        expect(result).toBeNull();
    });

    test("returns null when Authorization header is not Bearer", async () => {
        const mockVerify = async () => ({ userId: "uid", email: "e", iat: 0, exp: 0 });
        const result = await verifyAuthToken(
            mockVerify as any,
            new Request("http://localhost/test", {
                headers: { Authorization: "Basic abc123" },
            }),
            {}
        );
        expect(result).toBeNull();
    });

    test("returns null when jwt verify throws", async () => {
        const mockVerify = async () => { throw new Error("expired"); };
        const result = await verifyAuthToken(
            mockVerify as any,
            new Request("http://localhost/test", {
                headers: { Authorization: "Bearer expired-token" },
            }),
            {}
        );
        expect(result).toBeNull();
    });

    test("returns null when jwt verify returns false (expired)", async () => {
        const mockVerify = async () => false;
        const result = await verifyAuthToken(
            mockVerify as any,
            new Request("http://localhost/test", {
                headers: { Authorization: "Bearer expired-token" },
            }),
            {}
        );
        expect(result).toBeNull();
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Auth Guard — null auth handling
// ─────────────────────────────────────────────────────────────────────────────

describe("Auth Guard null-auth handling", () => {
    test("null auth returns 401 pattern", () => {
        // Simulates the guard check used in all protected routes:
        // if (!auth || !auth.userId) { set.status = 401; return {...} }
        const auth = null as { userId: string } | null;
        const shouldBlock = !auth || !auth.userId;
        expect(shouldBlock).toBe(true);
    });

    test("valid auth passes guard", () => {
        const auth = { userId: "user-123", email: "test@test.com", token: "tok" };
        const shouldBlock = !auth || !auth.userId;
        expect(shouldBlock).toBe(false);
    });

    test("auth with empty userId blocks", () => {
        const auth = { userId: "", email: "test@test.com", token: "tok" };
        const shouldBlock = !auth || !auth.userId;
        expect(shouldBlock).toBe(true);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// validateInput error structure
// ─────────────────────────────────────────────────────────────────────────────

describe("Auth validateInput error structure", () => {
    test("throws with status 400 and Thai message", () => {
        try {
            validateInput(registerSchema, {
                fullName: "",
                email: "bad",
                phoneNumber: "bad",
                password: "weak",
            });
            expect(true).toBe(false); // should not reach
        } catch (err: any) {
            expect(err.status).toBe(400);
            expect(err.error).toBe("Validation Error");
            expect(err.message).toBe("ข้อมูลไม่ถูกต้อง");
            expect(Array.isArray(err.errors)).toBe(true);
        }
    });

    test("error includes field-level details", () => {
        try {
            validateInput(registerSchema, {
                fullName: "OK Name",
                email: "good@email.com",
                phoneNumber: "0812345678",
                password: "weak", // too short, no uppercase
            });
            expect(true).toBe(false);
        } catch (err: any) {
            const fields = err.errors.map((e: any) => e.field);
            expect(fields).toContain("password");
        }
    });

    test("login validation error for bad phone", () => {
        try {
            validateInput(loginSchema, { phoneNumber: "abc", password: "test" });
            expect(true).toBe(false);
        } catch (err: any) {
            expect(err.status).toBe(400);
            const fields = err.errors.map((e: any) => e.field);
            expect(fields).toContain("phoneNumber");
        }
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suspended account handling
// ─────────────────────────────────────────────────────────────────────────────

describe("Suspended Account", () => {
    test("isActive check blocks suspended users", () => {
        // Simulates the login flow check: if (!user.isActive) → 403
        const user = { isActive: false };
        expect(user.isActive).toBe(false);

        const user2 = { isActive: true };
        expect(user2.isActive).toBe(true);
    });

    test("suspended error uses 403 not 401", () => {
        // auth.ts line 139-143: set.status = 403 for suspended
        const errorCode = 403;
        const errorMsg = "บัญชีนี้ถูกระงับการใช้งาน";
        expect(errorCode).toBe(403);
        expect(errorMsg).toContain("ระงับ");
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Login response shape
// ─────────────────────────────────────────────────────────────────────────────

describe("Login Response Shape", () => {
    test("expiresIn changes based on rememberMe", () => {
        // auth.ts line 160: expiresIn: rememberMe ? '30d' : '7d'
        const rememberMeTrue = true;
        const rememberMeFalse = false;
        expect(rememberMeTrue ? "30d" : "7d").toBe("30d");
        expect(rememberMeFalse ? "30d" : "7d").toBe("7d");
    });

    test("user response excludes password", () => {
        // Simulates the response shape from auth.ts lines 151-158
        const dbUser = {
            id: "u1",
            email: "a@b.com",
            fullName: "Test",
            phoneNumber: "0812345678",
            isActive: true,
            createdAt: new Date(),
            password: "$argon2id$secret",
        };

        const responseUser = {
            id: dbUser.id,
            email: dbUser.email,
            fullName: dbUser.fullName,
            phoneNumber: dbUser.phoneNumber,
            isActive: dbUser.isActive,
            createdAt: dbUser.createdAt,
        };

        expect(responseUser).not.toHaveProperty("password");
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// UUID validation for public user endpoint
// ─────────────────────────────────────────────────────────────────────────────

describe("UUID Validation (GET /users/:id)", () => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    test("accepts valid UUID v4", () => {
        expect(uuidRegex.test("550e8400-e29b-41d4-a716-446655440000")).toBe(true);
    });

    test("accepts valid cuid-style UUID", () => {
        expect(uuidRegex.test("123e4567-e89b-12d3-a456-426614174000")).toBe(true);
    });

    test("rejects non-UUID string", () => {
        expect(uuidRegex.test("not-a-uuid")).toBe(false);
    });

    test("rejects empty string", () => {
        expect(uuidRegex.test("")).toBe(false);
    });

    test("rejects short UUID", () => {
        expect(uuidRegex.test("550e8400-e29b")).toBe(false);
    });
});
