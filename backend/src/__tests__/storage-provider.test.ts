/**
 * Unit tests for the pluggable StorageProvider adapters.
 *
 * We mock the underlying SDKs (`minio` + `@aws-sdk/client-s3`) with
 * `mock.module(...)` so no real object-storage is touched.
 */

import { describe, test, expect, beforeAll, mock } from "bun:test";

// ─── Mocks for the minio SDK ───────────────────────────────────────────

type MinioCall = { method: string; args: unknown[] };
const minioCalls: MinioCall[] = [];

// Configurable stream emitter for listObjects
type StreamEvent = { type: "data" | "end" | "error"; payload?: unknown };
let listObjectsEvents: StreamEvent[] = [];
// Toggle for bucketExists
let bucketExistsResult = true;

function makeListStream() {
    type Handler = (arg: unknown) => void;
    const handlers: Record<string, Handler[]> = { data: [], end: [], error: [] };
    const stream = {
        on(event: string, cb: Handler) {
            handlers[event] = handlers[event] ?? [];
            handlers[event].push(cb);
            return stream;
        },
    };
    // Drain async so listeners can attach first
    queueMicrotask(() => {
        for (const ev of listObjectsEvents) {
            const list = handlers[ev.type] ?? [];
            for (const h of list) h(ev.payload);
        }
    });
    return stream;
}

mock.module("minio", () => {
    return {
        Client: class {
            constructor(_config: unknown) {
                minioCalls.push({ method: "constructor", args: [_config] });
            }
            async putObject(...args: unknown[]) {
                minioCalls.push({ method: "putObject", args });
                return { etag: "abc" };
            }
            async removeObject(...args: unknown[]) {
                minioCalls.push({ method: "removeObject", args });
            }
            async removeObjects(...args: unknown[]) {
                minioCalls.push({ method: "removeObjects", args });
            }
            listObjects(...args: unknown[]) {
                minioCalls.push({ method: "listObjects", args });
                return makeListStream();
            }
            async bucketExists(...args: unknown[]) {
                minioCalls.push({ method: "bucketExists", args });
                return bucketExistsResult;
            }
            async makeBucket(...args: unknown[]) {
                minioCalls.push({ method: "makeBucket", args });
            }
            async setBucketPolicy(...args: unknown[]) {
                minioCalls.push({ method: "setBucketPolicy", args });
            }
        },
    };
});

// ─── Mocks for @aws-sdk/client-s3 ───────────────────────────────────────

const s3Calls: { kind: string; input: unknown }[] = [];
let listObjectsV2Result: { Contents?: Array<{ Key?: string; Size?: number }> } = { Contents: [] };
let headBucketBehavior: "ok" | "not-found" | "already-owned" = "ok";

class PutObjectCommand { constructor(public input: unknown) { } }
class DeleteObjectCommand { constructor(public input: unknown) { } }
class DeleteObjectsCommand { constructor(public input: unknown) { } }
class ListObjectsV2Command { constructor(public input: unknown) { } }
class CreateBucketCommand { constructor(public input: unknown) { } }
class HeadBucketCommand { constructor(public input: unknown) { } }

class S3Client {
    constructor(public config: unknown) {
        s3Calls.push({ kind: "constructor", input: config });
    }
    async send(command: { constructor: { name: string }; input: unknown }) {
        const kind = command.constructor.name;
        s3Calls.push({ kind, input: command.input });
        if (kind === "ListObjectsV2Command") return listObjectsV2Result;
        if (kind === "HeadBucketCommand") {
            if (headBucketBehavior === "ok") return {};
            const e: Error & { name?: string } = new Error("not found");
            e.name = headBucketBehavior === "already-owned" ? "BucketAlreadyOwnedByYou" : "NotFound";
            throw e;
        }
        return {};
    }
}

mock.module("@aws-sdk/client-s3", () => ({
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand,
    DeleteObjectsCommand,
    ListObjectsV2Command,
    CreateBucketCommand,
    HeadBucketCommand,
}));

// ─── Imports (must come AFTER the mocks) ───────────────────────────────

import type { StorageProvider } from "../storage/provider";

let createMinioProvider: (c: {
    endpoint: string; port: number; useSSL: boolean;
    accessKey: string; secretKey: string; bucket: string;
}) => StorageProvider;
let createCloudflareProvider: (c: {
    accountId: string; accessKeyId: string; secretAccessKey: string;
    bucket: string; publicUrl: string; region?: string;
}) => StorageProvider;

beforeAll(async () => {
    ({ createMinioProvider } = await import("../storage/minio-provider"));
    ({ createCloudflareProvider } = await import("../storage/cloudflare-provider"));
});

const minioConfig = {
    endpoint: "localhost",
    port: 9000,
    useSSL: false,
    accessKey: "ak",
    secretKey: "sk",
    bucket: "uploads",
};

const r2Config = {
    accountId: "acc",
    accessKeyId: "aki",
    secretAccessKey: "sak",
    bucket: "car2hand",
    publicUrl: "https://cdn.example.com",
};

// ─── MinIO provider ─────────────────────────────────────────────────────

describe("minio-provider — upload", () => {
    test("calls putObject with (bucket, path, buffer, length, contentType) and returns public URL", async () => {
        minioCalls.length = 0;
        const p = createMinioProvider(minioConfig);
        const buf = Buffer.from("hello");
        const url = await p.upload("user1/avatar/x.webp", buf, "image/webp");

        const put = minioCalls.find((c) => c.method === "putObject");
        expect(put).toBeDefined();
        expect(put!.args[0]).toBe("uploads");
        expect(put!.args[1]).toBe("user1/avatar/x.webp");
        expect((put!.args[2] as Buffer).equals(buf)).toBe(true);
        expect(put!.args[3]).toBe(buf.length);
        expect(put!.args[4]).toEqual({ "Content-Type": "image/webp" });

        expect(url).toBe("http://localhost:9000/uploads/user1/avatar/x.webp");
    });
});

describe("minio-provider — getPublicUrl", () => {
    test("builds {protocol}://{endpoint}:{port}/{bucket}/{path}", () => {
        const p = createMinioProvider(minioConfig);
        expect(p.getPublicUrl("a/b.webp")).toBe("http://localhost:9000/uploads/a/b.webp");
    });

    test("uses https when useSSL is true", () => {
        const p = createMinioProvider({ ...minioConfig, useSSL: true, port: 443 });
        expect(p.getPublicUrl("x.webp")).toBe("https://localhost:443/uploads/x.webp");
    });
});

describe("minio-provider — extractObjectPath", () => {
    test("returns path when URL matches bucket", () => {
        const p = createMinioProvider(minioConfig);
        expect(p.extractObjectPath("http://localhost:9000/uploads/u1/avatar/x.webp"))
            .toBe("u1/avatar/x.webp");
    });

    test("returns null for non-matching URL", () => {
        const p = createMinioProvider(minioConfig);
        expect(p.extractObjectPath("https://somewhere-else.com/image.jpg")).toBeNull();
    });

    test("returns null for empty string", () => {
        const p = createMinioProvider(minioConfig);
        expect(p.extractObjectPath("")).toBeNull();
    });
});

describe("minio-provider — delete", () => {
    test("calls removeObject with bucket + path", async () => {
        minioCalls.length = 0;
        const p = createMinioProvider(minioConfig);
        await p.delete("u1/avatar/x.webp");
        const rm = minioCalls.find((c) => c.method === "removeObject");
        expect(rm).toBeDefined();
        expect(rm!.args[0]).toBe("uploads");
        expect(rm!.args[1]).toBe("u1/avatar/x.webp");
    });
});

describe("minio-provider — deleteByPrefix", () => {
    test("streams list then bulk-removes; returns count", async () => {
        minioCalls.length = 0;
        listObjectsEvents = [
            { type: "data", payload: { name: "u1/a.webp", size: 1 } },
            { type: "data", payload: { name: "u1/b.webp", size: 2 } },
            { type: "end" },
        ];
        const p = createMinioProvider(minioConfig);
        const n = await p.deleteByPrefix("u1/");
        expect(n).toBe(2);

        const rmBulk = minioCalls.find((c) => c.method === "removeObjects");
        expect(rmBulk).toBeDefined();
        expect(rmBulk!.args[0]).toBe("uploads");
        expect(rmBulk!.args[1]).toEqual(["u1/a.webp", "u1/b.webp"]);
    });

    test("returns 0 and does NOT call removeObjects on empty prefix", async () => {
        minioCalls.length = 0;
        listObjectsEvents = [{ type: "end" }];
        const p = createMinioProvider(minioConfig);
        const n = await p.deleteByPrefix("u2/");
        expect(n).toBe(0);
        expect(minioCalls.some((c) => c.method === "removeObjects")).toBe(false);
    });
});

describe("minio-provider — list", () => {
    test("returns {name, url, size}[] shape", async () => {
        listObjectsEvents = [
            { type: "data", payload: { name: "a.webp", size: 100 } },
            { type: "data", payload: { name: "b.webp", size: 250 } },
            { type: "end" },
        ];
        const p = createMinioProvider(minioConfig);
        const files = await p.list("");
        expect(files.length).toBe(2);
        expect(files[0]).toEqual({
            name: "a.webp",
            url: "http://localhost:9000/uploads/a.webp",
            size: 100,
        });
        expect(files[1].size).toBe(250);
    });
});

describe("minio-provider — ensureBucket", () => {
    test("does nothing when bucket already exists", async () => {
        minioCalls.length = 0;
        bucketExistsResult = true;
        const p = createMinioProvider(minioConfig);
        await p.ensureBucket();
        expect(minioCalls.some((c) => c.method === "bucketExists")).toBe(true);
        expect(minioCalls.some((c) => c.method === "makeBucket")).toBe(false);
        expect(minioCalls.some((c) => c.method === "setBucketPolicy")).toBe(false);
    });

    test("creates bucket and sets public-read policy when missing", async () => {
        minioCalls.length = 0;
        bucketExistsResult = false;
        const p = createMinioProvider(minioConfig);
        await p.ensureBucket();
        const make = minioCalls.find((c) => c.method === "makeBucket");
        const policy = minioCalls.find((c) => c.method === "setBucketPolicy");
        expect(make).toBeDefined();
        expect(make!.args[0]).toBe("uploads");
        expect(policy).toBeDefined();
        expect(policy!.args[0]).toBe("uploads");
        const parsed = JSON.parse(policy!.args[1] as string);
        expect(parsed.Statement[0].Action).toContain("s3:GetObject");
    });
});

// ─── Cloudflare R2 provider ────────────────────────────────────────────

describe("cloudflare-provider — upload", () => {
    test("sends PutObjectCommand with (Bucket, Key, Body, ContentType)", async () => {
        s3Calls.length = 0;
        const p = createCloudflareProvider(r2Config);
        const buf = Buffer.from("world");
        const url = await p.upload("a/b.webp", buf, "image/webp");

        const put = s3Calls.find((c) => c.kind === "PutObjectCommand");
        expect(put).toBeDefined();
        const input = put!.input as {
            Bucket: string; Key: string; Body: Buffer; ContentType: string;
        };
        expect(input.Bucket).toBe("car2hand");
        expect(input.Key).toBe("a/b.webp");
        expect(input.ContentType).toBe("image/webp");
        expect((input.Body as Buffer).equals(buf)).toBe(true);

        // Upload returns publicUrl-based URL, NOT the S3 endpoint.
        expect(url).toBe("https://cdn.example.com/a/b.webp");
    });
});

describe("cloudflare-provider — getPublicUrl", () => {
    test("uses configured publicUrl base, not the S3 endpoint", () => {
        const p = createCloudflareProvider(r2Config);
        expect(p.getPublicUrl("foo/bar.webp")).toBe("https://cdn.example.com/foo/bar.webp");
    });

    test("strips trailing slash on publicUrl", () => {
        const p = createCloudflareProvider({ ...r2Config, publicUrl: "https://cdn.example.com/" });
        expect(p.getPublicUrl("x.webp")).toBe("https://cdn.example.com/x.webp");
    });
});

describe("cloudflare-provider — extractObjectPath", () => {
    test("matches against publicUrl", () => {
        const p = createCloudflareProvider(r2Config);
        expect(p.extractObjectPath("https://cdn.example.com/u1/avatar/x.webp"))
            .toBe("u1/avatar/x.webp");
    });

    test("returns null when URL is from another host", () => {
        const p = createCloudflareProvider(r2Config);
        expect(p.extractObjectPath("https://somewhere.else/a.webp")).toBeNull();
    });
});

describe("cloudflare-provider — delete", () => {
    test("sends DeleteObjectCommand with Bucket + Key", async () => {
        s3Calls.length = 0;
        const p = createCloudflareProvider(r2Config);
        await p.delete("u1/x.webp");
        const del = s3Calls.find((c) => c.kind === "DeleteObjectCommand");
        expect(del).toBeDefined();
        const input = del!.input as { Bucket: string; Key: string };
        expect(input.Bucket).toBe("car2hand");
        expect(input.Key).toBe("u1/x.webp");
    });
});

describe("cloudflare-provider — deleteByPrefix", () => {
    test("lists then bulk-deletes; returns count", async () => {
        s3Calls.length = 0;
        listObjectsV2Result = { Contents: [{ Key: "u1/a" }, { Key: "u1/b" }] };
        const p = createCloudflareProvider(r2Config);
        const n = await p.deleteByPrefix("u1/");
        expect(n).toBe(2);

        const list = s3Calls.find((c) => c.kind === "ListObjectsV2Command");
        expect(list).toBeDefined();
        expect((list!.input as { Prefix: string }).Prefix).toBe("u1/");

        const del = s3Calls.find((c) => c.kind === "DeleteObjectsCommand");
        expect(del).toBeDefined();
        const input = del!.input as { Bucket: string; Delete: { Objects: Array<{ Key: string }> } };
        expect(input.Bucket).toBe("car2hand");
        expect(input.Delete.Objects.map((o) => o.Key)).toEqual(["u1/a", "u1/b"]);
    });

    test("returns 0 when list is empty and does NOT issue a delete", async () => {
        s3Calls.length = 0;
        listObjectsV2Result = { Contents: [] };
        const p = createCloudflareProvider(r2Config);
        const n = await p.deleteByPrefix("nothing/");
        expect(n).toBe(0);
        expect(s3Calls.some((c) => c.kind === "DeleteObjectsCommand")).toBe(false);
    });
});

describe("cloudflare-provider — list", () => {
    test("returns {name, url, size}[] using publicUrl base", async () => {
        listObjectsV2Result = {
            Contents: [
                { Key: "a.webp", Size: 11 },
                { Key: "b.webp", Size: 22 },
            ],
        };
        const p = createCloudflareProvider(r2Config);
        const out = await p.list("");
        expect(out.length).toBe(2);
        expect(out[0]).toEqual({
            name: "a.webp",
            url: "https://cdn.example.com/a.webp",
            size: 11,
        });
    });
});

describe("cloudflare-provider — ensureBucket", () => {
    test("no-op when HeadBucket succeeds", async () => {
        s3Calls.length = 0;
        headBucketBehavior = "ok";
        const p = createCloudflareProvider(r2Config);
        await p.ensureBucket();
        expect(s3Calls.some((c) => c.kind === "HeadBucketCommand")).toBe(true);
        expect(s3Calls.some((c) => c.kind === "CreateBucketCommand")).toBe(false);
    });

    test("handles BucketAlreadyOwnedByYou gracefully", async () => {
        s3Calls.length = 0;
        headBucketBehavior = "already-owned";
        const p = createCloudflareProvider(r2Config);
        // Should not throw even though HeadBucket threw.
        await p.ensureBucket();
        expect(s3Calls.some((c) => c.kind === "HeadBucketCommand")).toBe(true);
    });
});
