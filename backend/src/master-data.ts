/**
 * Master Data Routes - API สำหรับข้อมูลหลัก ยี่ห้อ รุ่น รุ่นย่อย
 */

import { Elysia, t } from 'elysia';
import prisma from './db';

export const masterDataRoutes = new Elysia({ prefix: '/master-data' })

    // =============================================
    // GET /master-data/brands - ดึงรายการยี่ห้อทั้งหมด
    // =============================================
    .get('/brands', async ({ query }) => {
        const { vehicleType, popular } = query;

        const brands = await prisma.brand.findMany({
            where: {
                isActive: true,
                ...(vehicleType && { vehicleType: vehicleType as 'CAR' | 'MOTORCYCLE' }),
                ...(popular === 'true' && { isPopular: true })
            },
            orderBy: [
                { isPopular: 'desc' },
                { order: 'asc' },
                { name: 'asc' }
            ],
            select: {
                id: true,
                name: true,
                nameTh: true,
                logo: true,
                vehicleType: true,
                country: true,
                isPopular: true,
                _count: {
                    select: { models: true }
                }
            }
        });

        return {
            success: true,
            brands: brands.map(b => ({
                ...b,
                modelCount: b._count.models,
                _count: undefined
            }))
        };
    }, {
        query: t.Object({
            vehicleType: t.Optional(t.String()),
            popular: t.Optional(t.String())
        })
    })

    // =============================================
    // GET /master-data/brands/:brandId/models - ดึงรายการรุ่นตามยี่ห้อ
    // =============================================
    .get('/brands/:brandId/models', async ({ params, query }) => {
        const { brandId } = params;
        const { popular } = query;

        // Verify brand exists
        const brand = await prisma.brand.findUnique({
            where: { id: brandId },
            select: { id: true, name: true, vehicleType: true }
        });

        if (!brand) {
            return { success: false, error: 'ไม่พบยี่ห้อนี้' };
        }

        const models = await prisma.vehicleModel.findMany({
            where: {
                brandId,
                isActive: true,
                ...(popular === 'true' && { isPopular: true })
            },
            orderBy: [
                { isPopular: 'desc' },
                { order: 'asc' },
                { name: 'asc' }
            ],
            select: {
                id: true,
                name: true,
                nameTh: true,
                bodyType: true,
                yearStart: true,
                yearEnd: true,
                isPopular: true,
                _count: {
                    select: { subModels: true }
                }
            }
        });

        return {
            success: true,
            brand: {
                id: brand.id,
                name: brand.name,
                vehicleType: brand.vehicleType
            },
            models: models.map(m => ({
                ...m,
                subModelCount: m._count.subModels,
                _count: undefined
            }))
        };
    }, {
        params: t.Object({
            brandId: t.String()
        }),
        query: t.Object({
            popular: t.Optional(t.String())
        })
    })

    // =============================================
    // GET /master-data/models/:modelId/sub-models - ดึงรายการรุ่นย่อยตามรุ่น
    // =============================================
    .get('/models/:modelId/sub-models', async ({ params }) => {
        const { modelId } = params;

        // Verify model exists
        const model = await prisma.vehicleModel.findUnique({
            where: { id: modelId },
            include: {
                brand: {
                    select: { id: true, name: true, vehicleType: true }
                }
            }
        });

        if (!model) {
            return { success: false, error: 'ไม่พบรุ่นนี้' };
        }

        const subModels = await prisma.vehicleSubModel.findMany({
            where: {
                modelId,
                isActive: true
            },
            orderBy: [
                { order: 'asc' },
                { name: 'asc' }
            ],
            select: {
                id: true,
                name: true,
                engineSize: true,
                fuelType: true,
                transmission: true,
                yearStart: true,
                yearEnd: true
            }
        });

        return {
            success: true,
            brand: model.brand,
            model: {
                id: model.id,
                name: model.name,
                bodyType: model.bodyType
            },
            subModels
        };
    }, {
        params: t.Object({
            modelId: t.String()
        })
    })

    // =============================================
    // GET /master-data/search - ค้นหายี่ห้อ/รุ่น
    // =============================================
    .get('/search', async ({ query }) => {
        const { q, vehicleType, limit = '10' } = query;

        if (!q || q.length < 2) {
            return { success: false, error: 'กรุณากรอกคำค้นหาอย่างน้อย 2 ตัวอักษร' };
        }

        const searchLimit = Math.min(parseInt(limit), 20);

        // Search brands
        const brands = await prisma.brand.findMany({
            where: {
                isActive: true,
                ...(vehicleType && { vehicleType: vehicleType as 'CAR' | 'MOTORCYCLE' }),
                OR: [
                    { name: { contains: q, mode: 'insensitive' } },
                    { nameTh: { contains: q, mode: 'insensitive' } }
                ]
            },
            take: searchLimit,
            select: {
                id: true,
                name: true,
                nameTh: true,
                vehicleType: true,
                isPopular: true
            }
        });

        // Search models
        const models = await prisma.vehicleModel.findMany({
            where: {
                isActive: true,
                ...(vehicleType && { brand: { vehicleType: vehicleType as 'CAR' | 'MOTORCYCLE' } }),
                OR: [
                    { name: { contains: q, mode: 'insensitive' } },
                    { nameTh: { contains: q, mode: 'insensitive' } }
                ]
            },
            take: searchLimit,
            include: {
                brand: {
                    select: { id: true, name: true, vehicleType: true }
                }
            }
        });

        return {
            success: true,
            query: q,
            results: {
                brands: brands.map(b => ({ type: 'brand', ...b })),
                models: models.map(m => ({
                    type: 'model',
                    id: m.id,
                    name: m.name,
                    nameTh: m.nameTh,
                    bodyType: m.bodyType,
                    brand: m.brand
                }))
            }
        };
    }, {
        query: t.Object({
            q: t.String(),
            vehicleType: t.Optional(t.String()),
            limit: t.Optional(t.String())
        })
    })

    // =============================================
    // GET /master-data/car-options - ดึงข้อมูลตัวเลือกเฉพาะรถยนต์และมอเตอร์ไซค์
    // =============================================
    .get('/car-options', async () => {
        const bodyStyles = [
            { value: 'SEDAN', label: 'รถเก๋ง', icon: 'sedan' },
            { value: 'HATCHBACK', label: 'แฮทช์แบ็ก', icon: 'hatchback' },
            { value: 'SUV', label: 'SUV', icon: 'suv' },
            { value: 'CROSSOVER', label: 'ครอสโอเวอร์', icon: 'crossover' },
            { value: 'MPV', label: 'MPV/รถครอบครัว', icon: 'mpv' },
            { value: 'PICKUP', label: 'รถกระบะ', icon: 'pickup' },
            { value: 'COUPE', icon: 'coupe', label: 'คูเป้' },
            { value: 'CONVERTIBLE', label: 'เปิดประทุน', icon: 'convertible' },
            { value: 'WAGON', label: 'แวกอน', icon: 'wagon' },
            { value: 'VAN', label: 'รถตู้', icon: 'van' },
        ];

        const motorcycleBodyStyles = [
            { value: 'STANDARD', label: 'สแตนดาร์ด' },
            { value: 'SCOOTER', label: 'สกู๊ตเตอร์' },
            { value: 'SPORT', label: 'สปอร์ต' },
            { value: 'NAKED', label: 'เน็กเก็ต' },
            { value: 'CRUISER', label: 'ครูเซอร์' },
            { value: 'TOURING', label: 'ทัวร์ริ่ง' },
            { value: 'ADVENTURE', label: 'แอดเวนเจอร์' },
            { value: 'DIRT', label: 'วิบาก' },
            { value: 'CAFE_RACER', label: 'คาเฟ่ เรเซอร์' },
            { value: 'UNDERBONE', label: 'รถครอบครัว' },
            { value: 'CUB', label: 'รถคลาสสิก' },
        ];

        const seatOptions = [
            { value: 2, label: '2 ที่นั่ง' },
            { value: 4, label: '4 ที่นั่ง' },
            { value: 5, label: '5 ที่นั่ง' },
            { value: 7, label: '7 ที่นั่ง ขึ้นไป' },
        ];

        return {
            success: true,
            bodyStyles,
            motorcycleBodyStyles,
            seatOptions
        };
    })

    // =============================================
    // GET /master-data/popular - ดึงยี่ห้อ/รุ่นยอดนิยม
    // =============================================
    .get('/popular', async ({ query }) => {
        const { vehicleType } = query;

        const brands = await prisma.brand.findMany({
            where: {
                isActive: true,
                isPopular: true,
                ...(vehicleType && { vehicleType: vehicleType as 'CAR' | 'MOTORCYCLE' })
            },
            orderBy: { order: 'asc' },
            take: 10,
            select: {
                id: true,
                name: true,
                nameTh: true,
                logo: true,
                vehicleType: true
            }
        });

        const models = await prisma.vehicleModel.findMany({
            where: {
                isActive: true,
                isPopular: true,
                ...(vehicleType && { brand: { vehicleType: vehicleType as 'CAR' | 'MOTORCYCLE' } })
            },
            orderBy: { order: 'asc' },
            take: 20,
            include: {
                brand: {
                    select: { id: true, name: true }
                }
            }
        });

        return {
            success: true,
            popular: {
                brands,
                models: models.map(m => ({
                    id: m.id,
                    name: m.name,
                    bodyType: m.bodyType,
                    brand: m.brand
                }))
            }
        };
    }, {
        query: t.Object({
            vehicleType: t.Optional(t.String())
        })
    });
