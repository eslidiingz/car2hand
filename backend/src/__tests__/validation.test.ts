import { describe, test, expect } from "bun:test";
import {
    registerSchema,
    loginSchema,
    adminLoginSchema,
    vehicleListingSchema,
    updateListingSchema,
    paginationSchema,
    idParamSchema,
    articleSchema,
    categorySchema,
    validateInput,
} from "../validation";

// ─── registerSchema ─────────────────────────────────────────────────────────

describe("registerSchema", () => {
    const validInput = {
        fullName: "สมชาย รักรถ",
        email: "somchai@example.com",
        phoneNumber: "0812345678",
        password: "Password1",
    };

    test("accepts valid input", () => {
        const result = registerSchema.safeParse(validInput);
        expect(result.success).toBe(true);
    });

    test("lowercases email", () => {
        const result = registerSchema.parse({ ...validInput, email: "Test@Example.COM" });
        expect(result.email).toBe("test@example.com");
    });

    test("rejects short name", () => {
        const result = registerSchema.safeParse({ ...validInput, fullName: "A" });
        expect(result.success).toBe(false);
    });

    test("rejects invalid email", () => {
        const result = registerSchema.safeParse({ ...validInput, email: "not-an-email" });
        expect(result.success).toBe(false);
    });

    test("rejects phone not starting with 0", () => {
        const result = registerSchema.safeParse({ ...validInput, phoneNumber: "1234567890" });
        expect(result.success).toBe(false);
    });

    test("rejects phone with wrong length", () => {
        const result = registerSchema.safeParse({ ...validInput, phoneNumber: "08123" });
        expect(result.success).toBe(false);
    });

    test("rejects password without uppercase", () => {
        const result = registerSchema.safeParse({ ...validInput, password: "password1" });
        expect(result.success).toBe(false);
    });

    test("rejects password without lowercase", () => {
        const result = registerSchema.safeParse({ ...validInput, password: "PASSWORD1" });
        expect(result.success).toBe(false);
    });

    test("rejects password without number", () => {
        const result = registerSchema.safeParse({ ...validInput, password: "Password" });
        expect(result.success).toBe(false);
    });

    test("rejects password shorter than 8 chars", () => {
        const result = registerSchema.safeParse({ ...validInput, password: "Pass1" });
        expect(result.success).toBe(false);
    });

    test("rejects password longer than 72 chars", () => {
        const result = registerSchema.safeParse({ ...validInput, password: "A1" + "a".repeat(71) });
        expect(result.success).toBe(false);
    });
});

// ─── loginSchema ────────────────────────────────────────────────────────────

describe("loginSchema", () => {
    test("accepts valid login", () => {
        const result = loginSchema.safeParse({ phoneNumber: "0812345678", password: "pass" });
        expect(result.success).toBe(true);
    });

    test("defaults rememberMe to false", () => {
        const result = loginSchema.parse({ phoneNumber: "0812345678", password: "pass" });
        expect(result.rememberMe).toBe(false);
    });

    test("rejects invalid phone", () => {
        const result = loginSchema.safeParse({ phoneNumber: "abc", password: "pass" });
        expect(result.success).toBe(false);
    });

    test("rejects empty password", () => {
        const result = loginSchema.safeParse({ phoneNumber: "0812345678", password: "" });
        expect(result.success).toBe(false);
    });
});

// ─── adminLoginSchema ───────────────────────────────────────────────────────

describe("adminLoginSchema", () => {
    test("accepts valid admin login", () => {
        const result = adminLoginSchema.safeParse({ username: "admin", password: "pass" });
        expect(result.success).toBe(true);
    });

    test("rejects empty username", () => {
        const result = adminLoginSchema.safeParse({ username: "", password: "pass" });
        expect(result.success).toBe(false);
    });

    test("rejects empty password", () => {
        const result = adminLoginSchema.safeParse({ username: "admin", password: "" });
        expect(result.success).toBe(false);
    });
});

// ─── vehicleListingSchema ───────────────────────────────────────────────────

describe("vehicleListingSchema", () => {
    const validCar = {
        vehicleType: "CAR" as const,
        title: "Honda Civic 2024 สภาพดี",
        price: 599000,
        brand: "Honda",
        model: "Civic",
        year: 2024,
        color: "ขาว",
        fuelType: "PETROL" as const,
        mileage: 10000,
        bodyType: "SEDAN" as const,
        condition: "GOOD" as const,
        province: "กรุงเทพมหานคร",
    };

    test("accepts valid car listing", () => {
        const result = vehicleListingSchema.safeParse(validCar);
        expect(result.success).toBe(true);
    });

    test("accepts valid motorcycle listing", () => {
        const result = vehicleListingSchema.safeParse({
            ...validCar,
            vehicleType: "MOTORCYCLE",
            bodyType: "SPORT",
        });
        expect(result.success).toBe(true);
    });

    test("rejects title shorter than 10 chars", () => {
        const result = vehicleListingSchema.safeParse({ ...validCar, title: "short" });
        expect(result.success).toBe(false);
    });

    test("rejects negative price", () => {
        const result = vehicleListingSchema.safeParse({ ...validCar, price: -100 });
        expect(result.success).toBe(false);
    });

    test("rejects price over 100 million", () => {
        const result = vehicleListingSchema.safeParse({ ...validCar, price: 200000000 });
        expect(result.success).toBe(false);
    });

    test("rejects invalid vehicle type", () => {
        const result = vehicleListingSchema.safeParse({ ...validCar, vehicleType: "TRUCK" });
        expect(result.success).toBe(false);
    });

    test("rejects year before 1900", () => {
        const result = vehicleListingSchema.safeParse({ ...validCar, year: 1800 });
        expect(result.success).toBe(false);
    });

    test("accepts optional fields as null", () => {
        const result = vehicleListingSchema.safeParse({
            ...validCar,
            description: null,
            subModel: null,
            transmission: null,
        });
        expect(result.success).toBe(true);
    });
});

// ─── updateListingSchema ────────────────────────────────────────────────────

describe("updateListingSchema", () => {
    test("accepts partial update", () => {
        const result = updateListingSchema.safeParse({ price: 500000 });
        expect(result.success).toBe(true);
    });

    test("accepts empty update", () => {
        const result = updateListingSchema.safeParse({});
        expect(result.success).toBe(true);
    });
});

// ─── paginationSchema ───────────────────────────────────────────────────────

describe("paginationSchema", () => {
    test("applies defaults", () => {
        const result = paginationSchema.parse({});
        expect(result.page).toBe(1);
        expect(result.limit).toBe(12);
    });

    test("coerces string to number", () => {
        const result = paginationSchema.parse({ page: "3", limit: "20" });
        expect(result.page).toBe(3);
        expect(result.limit).toBe(20);
    });

    test("rejects limit over 100", () => {
        const result = paginationSchema.safeParse({ limit: 200 });
        expect(result.success).toBe(false);
    });

    test("rejects page 0", () => {
        const result = paginationSchema.safeParse({ page: 0 });
        expect(result.success).toBe(false);
    });
});

// ─── idParamSchema ──────────────────────────────────────────────────────────

describe("idParamSchema", () => {
    test("accepts valid UUID", () => {
        const result = idParamSchema.safeParse({ id: "550e8400-e29b-41d4-a716-446655440000" });
        expect(result.success).toBe(true);
    });

    test("rejects invalid UUID", () => {
        const result = idParamSchema.safeParse({ id: "not-a-uuid" });
        expect(result.success).toBe(false);
    });

    test("rejects empty string", () => {
        const result = idParamSchema.safeParse({ id: "" });
        expect(result.success).toBe(false);
    });
});

// ─── articleSchema ──────────────────────────────────────────────────────────

describe("articleSchema", () => {
    test("accepts valid article", () => {
        const result = articleSchema.safeParse({
            title: "บทความทดสอบ",
            content: "เนื้อหาบทความยาวพอสมควร สำหรับทดสอบ",
            categoryId: "cat-1",
        });
        expect(result.success).toBe(true);
    });

    test("rejects short content", () => {
        const result = articleSchema.safeParse({
            title: "Test",
            content: "สั้นไป",
            categoryId: "cat-1",
        });
        expect(result.success).toBe(false);
    });

    test("defaults status to DRAFT", () => {
        const result = articleSchema.parse({
            title: "บทความทดสอบ",
            content: "เนื้อหาบทความยาวพอสมควร สำหรับทดสอบ",
            categoryId: "cat-1",
        });
        expect(result.status).toBe("DRAFT");
    });
});

// ─── categorySchema ─────────────────────────────────────────────────────────

describe("categorySchema", () => {
    test("accepts valid category", () => {
        const result = categorySchema.safeParse({ name: "รถยนต์", slug: "cars" });
        expect(result.success).toBe(true);
    });

    test("rejects slug with Thai chars", () => {
        const result = categorySchema.safeParse({ name: "รถ", slug: "รถยนต์" });
        expect(result.success).toBe(false);
    });

    test("accepts slug with dashes and numbers", () => {
        const result = categorySchema.safeParse({ name: "Test", slug: "test-123" });
        expect(result.success).toBe(true);
    });
});

// ─── validateInput ──────────────────────────────────────────────────────────

describe("validateInput", () => {
    test("returns parsed data on success", () => {
        const data = validateInput(loginSchema, {
            phoneNumber: "0812345678",
            password: "test",
        });
        expect(data.phoneNumber).toBe("0812345678");
        expect(data.rememberMe).toBe(false);
    });

    test("throws structured error on failure", () => {
        try {
            validateInput(loginSchema, { phoneNumber: "bad", password: "" });
            expect(true).toBe(false); // should not reach
        } catch (error: any) {
            expect(error.status).toBe(400);
            expect(error.error).toBe("Validation Error");
            expect(error.message).toBe("ข้อมูลไม่ถูกต้อง");
            expect(Array.isArray(error.errors)).toBe(true);
            expect(error.errors.length).toBeGreaterThan(0);
            expect(error.errors[0]).toHaveProperty("field");
            expect(error.errors[0]).toHaveProperty("message");
        }
    });
});
