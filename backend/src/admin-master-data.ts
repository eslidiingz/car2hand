/**
 * Admin Master Data CRUD — manage Brand / VehicleModel / VehicleSubModel.
 *
 * Read endpoints under `/api/master-data/*` are public (used by sell form + buy
 * filters). Admin write endpoints live here under `/api/admin/master-data/*`
 * so admins can curate the data that sellers auto-create via listings.
 *
 * Workflow:
 *   - Sellers auto-create new models/sub-models via ensureModelAndSubModel().
 *   - Admin reviews them here, can mark isPopular, disable, rename, or delete.
 *
 * Hard delete cascades to child rows (per Prisma schema onDelete: Cascade).
 * Prefer soft-delete via isActive=false unless the row was clearly spam.
 */
import { Elysia, t } from "elysia";
import prisma from "./db";
import { jwtPlugin } from "./jwt";

const adminAuth = (app: Elysia) =>
    app.use(jwtPlugin()).derive(async ({ jwt, headers, set }) => {
        const authHeader = headers["authorization"];
        if (!authHeader?.startsWith("Bearer ")) {
            set.status = 401;
            return { authError: "Unauthorized" as const, adminId: null as string | null };
        }
        const token = authHeader.slice(7).trim();
        const payload = await jwt.verify(token);
        if (!payload) {
            set.status = 401;
            return { authError: "Invalid Token" as const, adminId: null as string | null };
        }
        return { authError: null as string | null, adminId: (payload as { userId: string }).userId };
    });

const VEHICLE_TYPES = ["CAR", "MOTORCYCLE"] as const;
const BODY_TYPES = [
    "SEDAN", "HATCHBACK", "SUV", "CROSSOVER", "MPV", "PICKUP",
    "COUPE", "CONVERTIBLE", "WAGON", "VAN",
    "STANDARD", "SPORT", "TOURING", "CRUISER", "NAKED", "SCOOTER", "ADVENTURE", "CAFE_RACER", "CHOPPER", "DIRT_BIKE", "SUPERBIKE",
] as const;

export const adminMasterDataRoutes = new Elysia({ prefix: "/admin/master-data" })
    .use(adminAuth)

    /* ─── Brands ─────────────────────────────────────────────────────── */

    .get("/brands", async ({ authError, query, set }) => {
        if (authError) { set.status = 401; return { error: authError }; }
        const vehicleType = String(query.vehicleType || "").toUpperCase();
        const search = String(query.search || "").trim();

        const where: Record<string, unknown> = {};
        if (vehicleType && VEHICLE_TYPES.includes(vehicleType as typeof VEHICLE_TYPES[number])) {
            where.vehicleType = vehicleType;
        }
        if (search) {
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { nameTh: { contains: search, mode: "insensitive" } },
            ];
        }

        const brands = await prisma.brand.findMany({
            where,
            orderBy: [{ isPopular: "desc" }, { order: "asc" }, { name: "asc" }],
            include: { _count: { select: { models: true } } },
        });

        return {
            brands: brands.map(b => ({
                id: b.id,
                name: b.name,
                nameTh: b.nameTh,
                logo: b.logo,
                vehicleType: b.vehicleType,
                country: b.country,
                isPopular: b.isPopular,
                isActive: b.isActive,
                order: b.order,
                modelCount: b._count.models,
                createdAt: b.createdAt,
                updatedAt: b.updatedAt,
            })),
        };
    })

    .post("/brands", async ({ authError, body, set }) => {
        if (authError) { set.status = 401; return { error: authError }; }
        const b = body as {
            name: string; nameTh?: string; logo?: string;
            vehicleType: "CAR" | "MOTORCYCLE";
            country?: string; isPopular?: boolean; order?: number;
        };
        try {
            const created = await prisma.brand.create({
                data: {
                    name: b.name.trim(),
                    nameTh: b.nameTh?.trim() || null,
                    logo: b.logo?.trim() || null,
                    vehicleType: b.vehicleType,
                    country: b.country?.trim() || null,
                    isPopular: !!b.isPopular,
                    order: b.order ?? 0,
                },
            });
            return { message: "สร้างยี่ห้อสำเร็จ", brand: created };
        } catch (err: unknown) {
            const code = (err as { code?: string })?.code;
            if (code === "P2002") {
                set.status = 409;
                return { error: "DUPLICATE", message: "มียี่ห้อนี้อยู่แล้ว" };
            }
            set.status = 500;
            return { error: "Server Error" };
        }
    }, {
        body: t.Object({
            name: t.String({ minLength: 1, maxLength: 100 }),
            nameTh: t.Optional(t.String({ maxLength: 100 })),
            logo: t.Optional(t.String()),
            vehicleType: t.Union([t.Literal("CAR"), t.Literal("MOTORCYCLE")]),
            country: t.Optional(t.String({ maxLength: 100 })),
            isPopular: t.Optional(t.Boolean()),
            order: t.Optional(t.Number()),
        }),
    })

    .put("/brands/:id", async ({ authError, params, body, set }) => {
        if (authError) { set.status = 401; return { error: authError }; }
        const b = body as {
            name?: string; nameTh?: string | null; logo?: string | null;
            country?: string | null; isPopular?: boolean; isActive?: boolean; order?: number;
        };
        const data: Record<string, unknown> = {};
        if (b.name !== undefined) data.name = b.name.trim();
        if (b.nameTh !== undefined) data.nameTh = b.nameTh?.trim() || null;
        if (b.logo !== undefined) data.logo = b.logo?.trim() || null;
        if (b.country !== undefined) data.country = b.country?.trim() || null;
        if (b.isPopular !== undefined) data.isPopular = b.isPopular;
        if (b.isActive !== undefined) data.isActive = b.isActive;
        if (b.order !== undefined) data.order = b.order;
        try {
            const updated = await prisma.brand.update({ where: { id: params.id }, data });
            return { message: "อัปเดตยี่ห้อสำเร็จ", brand: updated };
        } catch (err: unknown) {
            const code = (err as { code?: string })?.code;
            if (code === "P2025") { set.status = 404; return { error: "Not Found", message: "ไม่พบยี่ห้อ" }; }
            if (code === "P2002") { set.status = 409; return { error: "DUPLICATE", message: "ชื่อนี้ซ้ำกับยี่ห้ออื่น" }; }
            set.status = 500;
            return { error: "Server Error" };
        }
    }, {
        body: t.Object({
            name: t.Optional(t.String({ minLength: 1, maxLength: 100 })),
            nameTh: t.Optional(t.Union([t.String(), t.Null()])),
            logo: t.Optional(t.Union([t.String(), t.Null()])),
            country: t.Optional(t.Union([t.String(), t.Null()])),
            isPopular: t.Optional(t.Boolean()),
            isActive: t.Optional(t.Boolean()),
            order: t.Optional(t.Number()),
        }),
    })

    .delete("/brands/:id", async ({ authError, params, set }) => {
        if (authError) { set.status = 401; return { error: authError }; }
        try {
            // Cascade deletes all models + sub-models. Dangerous — admin should know.
            await prisma.brand.delete({ where: { id: params.id } });
            return { message: "ลบยี่ห้อเรียบร้อย (รวมทุกรุ่นและรุ่นย่อย)" };
        } catch (err: unknown) {
            const code = (err as { code?: string })?.code;
            if (code === "P2025") { set.status = 404; return { error: "Not Found", message: "ไม่พบยี่ห้อ" }; }
            set.status = 500;
            return { error: "Server Error" };
        }
    })

    /* ─── Vehicle Models ─────────────────────────────────────────────── */

    .get("/brands/:brandId/models", async ({ authError, params, query, set }) => {
        if (authError) { set.status = 401; return { error: authError }; }
        const search = String(query.search || "").trim();

        const where: Record<string, unknown> = { brandId: params.brandId };
        if (search) {
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { nameTh: { contains: search, mode: "insensitive" } },
            ];
        }

        const models = await prisma.vehicleModel.findMany({
            where,
            orderBy: [{ isPopular: "desc" }, { order: "asc" }, { name: "asc" }],
            include: { _count: { select: { subModels: true } } },
        });

        return {
            models: models.map(m => ({
                id: m.id,
                name: m.name,
                nameTh: m.nameTh,
                bodyType: m.bodyType,
                yearStart: m.yearStart,
                yearEnd: m.yearEnd,
                isPopular: m.isPopular,
                isActive: m.isActive,
                order: m.order,
                subModelCount: m._count.subModels,
                createdAt: m.createdAt,
                updatedAt: m.updatedAt,
            })),
        };
    })

    .post("/models", async ({ authError, body, set }) => {
        if (authError) { set.status = 401; return { error: authError }; }
        const b = body as {
            brandId: string; name: string; nameTh?: string; bodyType?: string;
            yearStart?: number; yearEnd?: number; isPopular?: boolean; order?: number;
        };
        try {
            const created = await prisma.vehicleModel.create({
                data: {
                    brandId: b.brandId,
                    name: b.name.trim(),
                    nameTh: b.nameTh?.trim() || null,
                    bodyType: (b.bodyType || null) as never,
                    yearStart: b.yearStart ?? null,
                    yearEnd: b.yearEnd ?? null,
                    isPopular: !!b.isPopular,
                    order: b.order ?? 0,
                },
            });
            return { message: "สร้างรุ่นสำเร็จ", model: created };
        } catch (err: unknown) {
            const code = (err as { code?: string })?.code;
            if (code === "P2002") { set.status = 409; return { error: "DUPLICATE", message: "มีรุ่นนี้ในยี่ห้อนี้อยู่แล้ว" }; }
            if (code === "P2003") { set.status = 400; return { error: "INVALID_BRAND", message: "ไม่พบยี่ห้อที่ระบุ" }; }
            set.status = 500;
            return { error: "Server Error" };
        }
    }, {
        body: t.Object({
            brandId: t.String(),
            name: t.String({ minLength: 1, maxLength: 100 }),
            nameTh: t.Optional(t.String({ maxLength: 100 })),
            bodyType: t.Optional(t.String()),
            yearStart: t.Optional(t.Number()),
            yearEnd: t.Optional(t.Number()),
            isPopular: t.Optional(t.Boolean()),
            order: t.Optional(t.Number()),
        }),
    })

    .put("/models/:id", async ({ authError, params, body, set }) => {
        if (authError) { set.status = 401; return { error: authError }; }
        const b = body as {
            name?: string; nameTh?: string | null; bodyType?: string | null;
            yearStart?: number | null; yearEnd?: number | null;
            isPopular?: boolean; isActive?: boolean; order?: number;
        };
        const data: Record<string, unknown> = {};
        if (b.name !== undefined) data.name = b.name.trim();
        if (b.nameTh !== undefined) data.nameTh = b.nameTh?.trim() || null;
        if (b.bodyType !== undefined) data.bodyType = (b.bodyType?.trim() || null) as never;
        if (b.yearStart !== undefined) data.yearStart = b.yearStart;
        if (b.yearEnd !== undefined) data.yearEnd = b.yearEnd;
        if (b.isPopular !== undefined) data.isPopular = b.isPopular;
        if (b.isActive !== undefined) data.isActive = b.isActive;
        if (b.order !== undefined) data.order = b.order;
        try {
            const updated = await prisma.vehicleModel.update({ where: { id: params.id }, data });
            return { message: "อัปเดตรุ่นสำเร็จ", model: updated };
        } catch (err: unknown) {
            const code = (err as { code?: string })?.code;
            if (code === "P2025") { set.status = 404; return { error: "Not Found", message: "ไม่พบรุ่น" }; }
            if (code === "P2002") { set.status = 409; return { error: "DUPLICATE", message: "ชื่อรุ่นซ้ำในยี่ห้อนี้" }; }
            set.status = 500;
            return { error: "Server Error" };
        }
    }, {
        body: t.Object({
            name: t.Optional(t.String({ minLength: 1, maxLength: 100 })),
            nameTh: t.Optional(t.Union([t.String(), t.Null()])),
            bodyType: t.Optional(t.Union([t.String(), t.Null()])),
            yearStart: t.Optional(t.Union([t.Number(), t.Null()])),
            yearEnd: t.Optional(t.Union([t.Number(), t.Null()])),
            isPopular: t.Optional(t.Boolean()),
            isActive: t.Optional(t.Boolean()),
            order: t.Optional(t.Number()),
        }),
    })

    .delete("/models/:id", async ({ authError, params, set }) => {
        if (authError) { set.status = 401; return { error: authError }; }
        try {
            await prisma.vehicleModel.delete({ where: { id: params.id } });
            return { message: "ลบรุ่นเรียบร้อย (รวมรุ่นย่อยทั้งหมด)" };
        } catch (err: unknown) {
            const code = (err as { code?: string })?.code;
            if (code === "P2025") { set.status = 404; return { error: "Not Found", message: "ไม่พบรุ่น" }; }
            set.status = 500;
            return { error: "Server Error" };
        }
    })

    /* ─── Sub-Models ─────────────────────────────────────────────────── */

    .get("/models/:modelId/sub-models", async ({ authError, params, query, set }) => {
        if (authError) { set.status = 401; return { error: authError }; }
        const search = String(query.search || "").trim();

        const where: Record<string, unknown> = { modelId: params.modelId };
        if (search) {
            where.name = { contains: search, mode: "insensitive" };
        }

        const subModels = await prisma.vehicleSubModel.findMany({
            where,
            orderBy: [{ order: "asc" }, { name: "asc" }],
        });

        return { subModels };
    })

    .post("/sub-models", async ({ authError, body, set }) => {
        if (authError) { set.status = 401; return { error: authError }; }
        const b = body as {
            modelId: string; name: string;
            engineSize?: number; fuelType?: string; transmission?: string;
            yearStart?: number; yearEnd?: number; order?: number;
        };
        try {
            const created = await prisma.vehicleSubModel.create({
                data: {
                    modelId: b.modelId,
                    name: b.name.trim(),
                    engineSize: b.engineSize ?? null,
                    fuelType: (b.fuelType || null) as never,
                    transmission: (b.transmission || null) as never,
                    yearStart: b.yearStart ?? null,
                    yearEnd: b.yearEnd ?? null,
                    order: b.order ?? 0,
                },
            });
            return { message: "สร้างรุ่นย่อยสำเร็จ", subModel: created };
        } catch (err: unknown) {
            const code = (err as { code?: string })?.code;
            if (code === "P2002") { set.status = 409; return { error: "DUPLICATE", message: "มีรุ่นย่อยนี้อยู่แล้ว" }; }
            if (code === "P2003") { set.status = 400; return { error: "INVALID_MODEL", message: "ไม่พบรุ่นที่ระบุ" }; }
            set.status = 500;
            return { error: "Server Error" };
        }
    }, {
        body: t.Object({
            modelId: t.String(),
            name: t.String({ minLength: 1, maxLength: 100 }),
            engineSize: t.Optional(t.Number()),
            fuelType: t.Optional(t.String()),
            transmission: t.Optional(t.String()),
            yearStart: t.Optional(t.Number()),
            yearEnd: t.Optional(t.Number()),
            order: t.Optional(t.Number()),
        }),
    })

    .put("/sub-models/:id", async ({ authError, params, body, set }) => {
        if (authError) { set.status = 401; return { error: authError }; }
        const b = body as {
            name?: string; engineSize?: number | null;
            fuelType?: string | null; transmission?: string | null;
            yearStart?: number | null; yearEnd?: number | null;
            isActive?: boolean; order?: number;
        };
        const data: Record<string, unknown> = {};
        if (b.name !== undefined) data.name = b.name.trim();
        if (b.engineSize !== undefined) data.engineSize = b.engineSize;
        if (b.fuelType !== undefined) data.fuelType = (b.fuelType?.trim() || null) as never;
        if (b.transmission !== undefined) data.transmission = (b.transmission?.trim() || null) as never;
        if (b.yearStart !== undefined) data.yearStart = b.yearStart;
        if (b.yearEnd !== undefined) data.yearEnd = b.yearEnd;
        if (b.isActive !== undefined) data.isActive = b.isActive;
        if (b.order !== undefined) data.order = b.order;
        try {
            const updated = await prisma.vehicleSubModel.update({ where: { id: params.id }, data });
            return { message: "อัปเดตรุ่นย่อยสำเร็จ", subModel: updated };
        } catch (err: unknown) {
            const code = (err as { code?: string })?.code;
            if (code === "P2025") { set.status = 404; return { error: "Not Found", message: "ไม่พบรุ่นย่อย" }; }
            if (code === "P2002") { set.status = 409; return { error: "DUPLICATE", message: "ชื่อรุ่นย่อยซ้ำ" }; }
            set.status = 500;
            return { error: "Server Error" };
        }
    }, {
        body: t.Object({
            name: t.Optional(t.String({ minLength: 1, maxLength: 100 })),
            engineSize: t.Optional(t.Union([t.Number(), t.Null()])),
            fuelType: t.Optional(t.Union([t.String(), t.Null()])),
            transmission: t.Optional(t.Union([t.String(), t.Null()])),
            yearStart: t.Optional(t.Union([t.Number(), t.Null()])),
            yearEnd: t.Optional(t.Union([t.Number(), t.Null()])),
            isActive: t.Optional(t.Boolean()),
            order: t.Optional(t.Number()),
        }),
    })

    .delete("/sub-models/:id", async ({ authError, params, set }) => {
        if (authError) { set.status = 401; return { error: authError }; }
        try {
            await prisma.vehicleSubModel.delete({ where: { id: params.id } });
            return { message: "ลบรุ่นย่อยเรียบร้อย" };
        } catch (err: unknown) {
            const code = (err as { code?: string })?.code;
            if (code === "P2025") { set.status = 404; return { error: "Not Found", message: "ไม่พบรุ่นย่อย" }; }
            set.status = 500;
            return { error: "Server Error" };
        }
    })

    /* ─── Bulk reorder (drag & drop) ───────────────────────────────── */
    //
    // All three endpoints take an ordered list of IDs and write the position
    // as `order = index` inside a single transaction — so a half-applied
    // reorder can never leave the table in a mixed state.
    //
    // Client flow:
    //   1. user drags handle → local array reordered
    //   2. client POSTs the new ID order here
    //   3. server rewrites `order` = array index for each row

    .put("/brands/reorder", async ({ authError, body, set }) => {
        if (authError) { set.status = 401; return { error: authError }; }
        const { ids } = body as { ids: string[] };
        if (!Array.isArray(ids) || ids.length === 0) {
            set.status = 400;
            return { error: "Validation", message: "ต้องมี ids" };
        }
        try {
            await prisma.$transaction(
                ids.map((id, index) =>
                    prisma.brand.update({ where: { id }, data: { order: index } })
                )
            );
            return { message: "จัดลำดับยี่ห้อสำเร็จ", count: ids.length };
        } catch {
            set.status = 500;
            return { error: "Server Error" };
        }
    }, {
        body: t.Object({ ids: t.Array(t.String()) }),
    })

    .put("/models/reorder", async ({ authError, body, set }) => {
        if (authError) { set.status = 401; return { error: authError }; }
        const { ids } = body as { ids: string[] };
        if (!Array.isArray(ids) || ids.length === 0) {
            set.status = 400;
            return { error: "Validation", message: "ต้องมี ids" };
        }
        try {
            await prisma.$transaction(
                ids.map((id, index) =>
                    prisma.vehicleModel.update({ where: { id }, data: { order: index } })
                )
            );
            return { message: "จัดลำดับรุ่นสำเร็จ", count: ids.length };
        } catch {
            set.status = 500;
            return { error: "Server Error" };
        }
    }, {
        body: t.Object({ ids: t.Array(t.String()) }),
    })

    .put("/sub-models/reorder", async ({ authError, body, set }) => {
        if (authError) { set.status = 401; return { error: authError }; }
        const { ids } = body as { ids: string[] };
        if (!Array.isArray(ids) || ids.length === 0) {
            set.status = 400;
            return { error: "Validation", message: "ต้องมี ids" };
        }
        try {
            await prisma.$transaction(
                ids.map((id, index) =>
                    prisma.vehicleSubModel.update({ where: { id }, data: { order: index } })
                )
            );
            return { message: "จัดลำดับรุ่นย่อยสำเร็จ", count: ids.length };
        } catch {
            set.status = 500;
            return { error: "Server Error" };
        }
    }, {
        body: t.Object({ ids: t.Array(t.String()) }),
    })

    /* ─── Body-type reference (for dropdowns) ──────────────────────── */

    .get("/body-types", async ({ authError, set }) => {
        if (authError) { set.status = 401; return { error: authError }; }
        return { bodyTypes: BODY_TYPES };
    });
