/**
 * Listing approval gate tests — PATCH /listings/:id/publish.
 *
 * Verifies the matrix:
 *
 *   basicListingRequiresApproval ON  + Basic user            → status PENDING (no publishedAt)
 *   basicListingRequiresApproval OFF + Basic user            → status ACTIVE  (publishedAt + expiredAt set per pkg)
 *   basicListingRequiresApproval ON  + Standard/Pro/Premium  → status ACTIVE  (setting irrelevant)
 *   basicListingRequiresApproval OFF + Standard/Pro/Premium  → status ACTIVE
 *   any setting + user with NO currentPackage                → treated as Basic
 *
 * Strategy: in-memory Prisma stub with just enough surface for the publish
 * handler — vehicleListing.findUnique/update, user.findUnique (with the
 * currentPackage select used by the gate), and a tiny adminSetting impl so
 * `getSetting('BASIC_LISTING_REQUIRES_APPROVAL')` reads our mock value.
 *
 * Sibling-route effects (admin-sse `count` calls for pending broadcast) are
 * stubbed out as no-ops so they don't pollute the test.
 */

import { describe, test, expect, beforeAll, beforeEach } from "bun:test";
import { mock } from "bun:test";
import jsonwebtoken from "jsonwebtoken";

type AdminSettingRow = { key: string; value: unknown };

type ListingRow = {
    id: string;
    userId: string;
    status: string;
    images: Array<{ id: string }>;
    publishedAt: Date | null;
    expiredAt: Date | null;
    price: number;
    [k: string]: unknown;
};

type UserRow = {
    id: string;
    currentPackageId: string | null;
    currentPackage: {
        slug: string;
        price: number;
        listingDurationDays: number;
    } | null;
};

type GateApp = { handle: (req: Request) => Promise<Response> };

// ─── In-memory stores ────────────────────────────────────────────────

const listings = new Map<string, ListingRow>();
const users = new Map<string, UserRow>();
const settings = new Map<string, AdminSettingRow>();

// Build a Prisma stub matching exactly the surface used by the publish
// handler + admin-settings.getSetting + admin-sse.getAndBroadcastPendingCounts.
const dbStub = {
    vehicleListing: {
        findUnique: async ({ where, include }: { where: { id: string }; include?: { images?: boolean } }) => {
            const row = listings.get(where.id);
            if (!row) return null;
            // The publish handler asks `include: { images: true }`. Always return images.
            void include;
            return { ...row };
        },
        update: async ({
            where,
            data,
            include,
        }: {
            where: { id: string };
            data: Record<string, unknown>;
            include?: unknown;
        }) => {
            void include;
            const row = listings.get(where.id);
            if (!row) throw new Error("not found");
            const next: ListingRow = { ...row, ...(data as Partial<ListingRow>) };
            listings.set(where.id, next);
            // Mimic an `include: { images, user }` projection by just merging the row.
            return { ...next, user: { id: row.userId, fullName: "T", phoneNumber: "0" } };
        },
        count: async () => 0, // for getAndBroadcastPendingCounts side-effect
        findMany: async () => [], // safety for autoBump init
        updateMany: async () => ({ count: 0 }), // safety for expireListings init
    },
    user: {
        findUnique: async ({ where, select }: { where: { id: string }; select?: Record<string, unknown> }) => {
            void select;
            const row = users.get(where.id);
            if (!row) return null;
            return { currentPackage: row.currentPackage };
        },
    },
    adminSetting: {
        findUnique: async ({ where }: { where: { key: string } }) => settings.get(where.key) ?? null,
        findMany: async () => [...settings.values()],
        upsert: async () => ({}),
    },
    // ── stubs for sibling broadcasts that fire in the publish handler ──
    packageTransaction: { count: async () => 0 },
    listingRenewal: { count: async () => 0 },
    slotPurchase: { count: async () => 0 },
};

mock.module("../db", () => ({ default: dbStub }));

let app: GateApp;
let token: string;

const USER_ID = "seller-gate";
const SECRET = process.env.JWT_SECRET || "test-secret";

function signToken(userId: string): string {
    return jsonwebtoken.sign({ userId, email: `${userId}@test.local` }, SECRET);
}

beforeAll(async () => {
    const mod = await import("../listings");
    app = mod.listingRoutes as unknown as GateApp;
    token = signToken(USER_ID);
});

beforeEach(() => {
    listings.clear();
    users.clear();
    settings.clear();
});

// ─── Helpers ────────────────────────────────────────────────────────

function seedListing(id: string, ownerId: string = USER_ID, extras: Partial<ListingRow> = {}) {
    listings.set(id, {
        id,
        userId: ownerId,
        status: "DRAFT",
        images: [{ id: "img-1" }],
        publishedAt: null,
        expiredAt: null,
        price: 100000,
        ...extras,
    });
}

function setSettingRow(key: string, value: unknown) {
    settings.set(key, { key, value });
}

function setUserPackage(
    userId: string,
    pkg: { slug: string; price: number; listingDurationDays: number } | null
) {
    users.set(userId, {
        id: userId,
        currentPackageId: pkg ? "pkg-id" : null,
        currentPackage: pkg,
    });
}

async function publish(listingId: string): Promise<{ res: Response; body: Record<string, unknown> | null }> {
    const res = await app.handle(
        new Request(`http://localhost/listings/${listingId}/publish`, {
            method: "PATCH",
            headers: {
                "content-type": "application/json",
                authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ price: 100000 }),
        })
    );
    const text = await res.text();
    let body: Record<string, unknown> | null = null;
    try {
        body = text ? (JSON.parse(text) as Record<string, unknown>) : null;
    } catch {
        body = null;
    }
    return { res, body };
}

// ─── Gate matrix ────────────────────────────────────────────────────

describe("listing publish gate — basicListingRequiresApproval", () => {
    test("setting ON + Basic user → PENDING, no publishedAt", async () => {
        setSettingRow("basicListingRequiresApproval", true);
        setUserPackage(USER_ID, { slug: "basic", price: 0, listingDurationDays: 45 });
        seedListing("l-on-basic");

        const { res, body } = await publish("l-on-basic");
        expect(res.status).toBe(200);
        expect(body!.requiresApproval).toBe(true);
        expect(body!.message).toBe("ส่งประกาศเพื่อรอการตรวจสอบจากผู้ดูแลระบบ");

        const stored = listings.get("l-on-basic")!;
        expect(stored.status).toBe("PENDING");
        expect(stored.publishedAt).toBeNull();
        expect(stored.expiredAt).toBeNull();
    });

    test("setting OFF + Basic user → ACTIVE, publishedAt + expiredAt set per package duration", async () => {
        setSettingRow("basicListingRequiresApproval", false);
        setUserPackage(USER_ID, { slug: "basic", price: 0, listingDurationDays: 45 });
        seedListing("l-off-basic");

        const before = Date.now();
        const { res, body } = await publish("l-off-basic");
        const after = Date.now();

        expect(res.status).toBe(200);
        expect(body!.requiresApproval).toBe(false);
        expect(body!.message).toBe("เผยแพร่ประกาศสำเร็จ");

        const stored = listings.get("l-off-basic")!;
        expect(stored.status).toBe("ACTIVE");
        expect(stored.publishedAt).toBeInstanceOf(Date);
        expect(stored.expiredAt).toBeInstanceOf(Date);

        const expiredMs = (stored.expiredAt as Date).getTime();
        const expectedMin = before + 45 * 24 * 60 * 60 * 1000;
        const expectedMax = after + 45 * 24 * 60 * 60 * 1000;
        expect(expiredMs).toBeGreaterThanOrEqual(expectedMin);
        expect(expiredMs).toBeLessThanOrEqual(expectedMax);
    });

    test("setting ON + Standard package → ACTIVE (setting irrelevant for paid)", async () => {
        setSettingRow("basicListingRequiresApproval", true);
        setUserPackage(USER_ID, { slug: "standard", price: 199, listingDurationDays: 30 });
        seedListing("l-on-std");

        const { res, body } = await publish("l-on-std");
        expect(res.status).toBe(200);
        expect(body!.requiresApproval).toBe(false);

        const stored = listings.get("l-on-std")!;
        expect(stored.status).toBe("ACTIVE");
        expect(stored.publishedAt).toBeInstanceOf(Date);
        expect(stored.expiredAt).toBeInstanceOf(Date);
    });

    test("setting ON + Pro (professional) package → ACTIVE", async () => {
        setSettingRow("basicListingRequiresApproval", true);
        setUserPackage(USER_ID, { slug: "professional", price: 499, listingDurationDays: 60 });
        seedListing("l-on-pro");

        const { res, body } = await publish("l-on-pro");
        expect(res.status).toBe(200);
        expect(body!.requiresApproval).toBe(false);
        expect(listings.get("l-on-pro")!.status).toBe("ACTIVE");
    });

    test("setting ON + Premium package → ACTIVE", async () => {
        setSettingRow("basicListingRequiresApproval", true);
        setUserPackage(USER_ID, { slug: "premium", price: 999, listingDurationDays: 90 });
        seedListing("l-on-prem");

        const { res, body } = await publish("l-on-prem");
        expect(res.status).toBe(200);
        expect(body!.requiresApproval).toBe(false);
        expect(listings.get("l-on-prem")!.status).toBe("ACTIVE");
    });

    test("setting OFF + Standard package → ACTIVE (unchanged from ON path)", async () => {
        setSettingRow("basicListingRequiresApproval", false);
        setUserPackage(USER_ID, { slug: "standard", price: 199, listingDurationDays: 30 });
        seedListing("l-off-std");

        const { res, body } = await publish("l-off-std");
        expect(res.status).toBe(200);
        expect(body!.requiresApproval).toBe(false);
        expect(listings.get("l-off-std")!.status).toBe("ACTIVE");
    });

    test("user with NO currentPackage is treated as Basic — setting applies", async () => {
        // Setting ON + no package → treated as Basic → PENDING
        setSettingRow("basicListingRequiresApproval", true);
        setUserPackage(USER_ID, null);
        seedListing("l-nopkg-on");

        const r1 = await publish("l-nopkg-on");
        expect(r1.res.status).toBe(200);
        expect(r1.body!.requiresApproval).toBe(true);
        expect(listings.get("l-nopkg-on")!.status).toBe("PENDING");

        // Setting OFF + no package → treated as Basic → ACTIVE auto-publish
        setSettingRow("basicListingRequiresApproval", false);
        seedListing("l-nopkg-off");

        const r2 = await publish("l-nopkg-off");
        expect(r2.res.status).toBe(200);
        expect(r2.body!.requiresApproval).toBe(false);
        const stored = listings.get("l-nopkg-off")!;
        expect(stored.status).toBe("ACTIVE");
        expect(stored.publishedAt).toBeInstanceOf(Date);
        expect(stored.expiredAt).toBeInstanceOf(Date);
    });

    test("setting absent in DB → defaults to true (gate ON for Basic)", async () => {
        // No setSettingRow call — registry default of `true` should apply.
        setUserPackage(USER_ID, { slug: "basic", price: 0, listingDurationDays: 45 });
        seedListing("l-default");

        const { res, body } = await publish("l-default");
        expect(res.status).toBe(200);
        expect(body!.requiresApproval).toBe(true);
        expect(listings.get("l-default")!.status).toBe("PENDING");
    });

    test("paid package with price=0 (edge) is also treated as Basic", async () => {
        // The gate also flips to Basic when currentPackage.price === 0,
        // regardless of slug. Verify with a hypothetical 'promo' free package.
        setSettingRow("basicListingRequiresApproval", true);
        setUserPackage(USER_ID, { slug: "promo", price: 0, listingDurationDays: 30 });
        seedListing("l-zero-price");

        const { res, body } = await publish("l-zero-price");
        expect(res.status).toBe(200);
        expect(body!.requiresApproval).toBe(true);
        expect(listings.get("l-zero-price")!.status).toBe("PENDING");
    });
});
