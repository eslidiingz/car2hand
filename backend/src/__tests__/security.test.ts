import { describe, test, expect } from "bun:test";
import { sanitizeInput, sanitizeObject } from "../security";

describe("sanitizeInput", () => {
    test("escapes < and > tags", () => {
        expect(sanitizeInput("<script>alert('xss')</script>")).toBe(
            "&lt;script&gt;alert(&#x27;xss&#x27;)&lt;&#x2F;script&gt;"
        );
    });

    test("escapes double quotes", () => {
        expect(sanitizeInput('" onmouseover="alert(1)"')).toBe(
            '&quot; onmouseover=&quot;alert(1)&quot;'
        );
    });

    test("escapes single quotes", () => {
        expect(sanitizeInput("it's a test")).toBe("it&#x27;s a test");
    });

    test("escapes forward slashes", () => {
        expect(sanitizeInput("path/to/file")).toBe("path&#x2F;to&#x2F;file");
    });

    test("trims whitespace", () => {
        expect(sanitizeInput("  hello  ")).toBe("hello");
    });

    test("handles empty string", () => {
        expect(sanitizeInput("")).toBe("");
    });

    test("preserves normal text", () => {
        expect(sanitizeInput("สวัสดีครับ Hello 123")).toBe("สวัสดีครับ Hello 123");
    });

    test("handles combined XSS vector", () => {
        const input = '<img src="x" onerror="alert(\'xss\')">';
        const result = sanitizeInput(input);
        expect(result).not.toContain("<");
        expect(result).not.toContain(">");
    });

    test("returns non-string input as-is", () => {
        // @ts-expect-error testing runtime behavior with wrong type
        expect(sanitizeInput(123)).toBe(123);
    });
});

describe("sanitizeObject", () => {
    test("sanitizes string values", () => {
        const result = sanitizeObject({ name: "<b>bold</b>", age: 25 });
        expect(result.name).toBe("&lt;b&gt;bold&lt;&#x2F;b&gt;");
        expect(result.age).toBe(25);
    });

    test("preserves non-string values", () => {
        const obj = { count: 42, active: true, data: null };
        const result = sanitizeObject(obj);
        expect(result.count).toBe(42);
        expect(result.active).toBe(true);
        expect(result.data).toBeNull();
    });

    test("recursively sanitizes nested objects", () => {
        const obj = { user: { name: "<script>", email: "test@test.com" } };
        const result = sanitizeObject(obj);
        expect((result.user as any).name).toBe("&lt;script&gt;");
        expect((result.user as any).email).toBe("test@test.com");
    });

    test("preserves arrays as-is", () => {
        const obj = { tags: ["<b>", "safe"] };
        const result = sanitizeObject(obj);
        expect(result.tags).toEqual(["<b>", "safe"]);
    });

    test("handles empty object", () => {
        const result = sanitizeObject({});
        expect(result).toEqual({});
    });

    test("sanitizes Thai text with XSS", () => {
        const result = sanitizeObject({ title: "รถยนต์<script>" });
        expect(result.title).toBe("รถยนต์&lt;script&gt;");
    });
});
