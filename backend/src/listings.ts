import { Elysia, t } from "elysia";
import prisma from "./db";
import { uploadListingImages, deleteListingImages, deleteFile, deleteOldFile, isValidImageType, isValidFileSize, ensureBucket, uploadFile, processImage, generateFilename, buildListingImagePath, getPublicUrl } from "./storage";
import { getUserPackage, canCreateListing, canUploadPhotos, getListingExpiryDate } from "./config/packages";
import { reactivatePausedListings, getEffectiveMaxListings } from "./config/pause";
import { getAndBroadcastPendingCounts } from "./admin-sse";
import { authGuard } from "./jwt";
import { sanitizeObject } from "./security";
import { getSetting } from "./admin-settings";
import { ensureModelAndSubModel } from "./master-data";

// Ensure bucket exists on startup
ensureBucket().catch(console.error);

// Shared include for homepage tier endpoints (featured/recommended/new)
const featuredInclude = {
    images: { where: { isPrimary: true }, take: 1 },
    user: {
        select: {
            id: true,
            fullName: true,
            packageExpiresAt: true,
            currentPackage: { select: { slug: true, badge: true, searchPriority: true } },
            sellerProfile: {
                select: { shopName: true, shopLogo: true, showroomType: true, isVerified: true, verificationLevel: true },
            },
        },
    },
} as const;

// Shape the homepage listing payload.
// - `packageSlug` drives card border color (always, even without KYC)
// - `badge` is gated by KYC — only non-null when the seller has passed KYC.
//   Frontend renders different badge copy per (packageSlug × hasKyc) combination.
function enrichFeatured(
    listings: Array<{ isFeatured: boolean; isPremium: boolean; user: { id: string; fullName: string; packageExpiresAt: Date | null; currentPackage: { slug: string; badge: string | null } | null; sellerProfile: { isVerified?: boolean; verificationLevel?: string | null } | null } } & Record<string, unknown>>,
    now: Date,
) {
    return listings.map((l) => {
        const pkgActive = l.user.currentPackage
            ? (l.user.packageExpiresAt ? new Date(l.user.packageExpiresAt) > now : true)
            : false;
        const hasKyc = !!(l.user.sellerProfile?.isVerified
            && l.user.sellerProfile.verificationLevel
            && l.user.sellerProfile.verificationLevel !== 'NONE');
        const packageSlug = pkgActive ? (l.user.currentPackage?.slug || 'basic') : 'basic';
        return {
            ...l,
            packageSlug,
            badge: pkgActive && hasKyc ? (l.user.currentPackage?.badge || null) : null,
            isFeatured: l.isFeatured,
            isPremium: l.isPremium,
            user: {
                id: l.user.id,
                fullName: l.user.fullName,
                sellerProfile: l.user.sellerProfile || null,
            },
        };
    });
}

// Auto-expire: อัปเดตสถานะประกาศที่หมดอายุเป็น EXPIRED อัตโนมัติ
async function expireListings() {
    try {
        const result = await prisma.vehicleListing.updateMany({
            where: {
                status: 'ACTIVE',
                expiredAt: { lt: new Date() }
            },
            data: { status: 'EXPIRED' }
        });
        if (result.count > 0) {
            console.log(`[Auto-Expire] อัปเดต ${result.count} ประกาศเป็น EXPIRED`);
        }
    } catch (error) {
        console.error('[Auto-Expire] Error:', error);
    }
}

// เรียกตอน startup + ทุก 1 ชม.
expireListings();
setInterval(expireListings, 60 * 60 * 1000);

// Auto-bump: ดันโพสอัตโนมัติ ทยอยดันทีละคัน + สุ่มเวลา
const AUTO_BUMP_SCHEDULES: Record<string, string[]> = {
    standard: ['20:00'],
    professional: ['08:30', '12:30', '21:00'],
    premium: ['08:00', '11:30', '15:00', '19:00', '22:00'],
};

const processedBumpSlots = new Set<string>(); // ป้องกันดันซ้ำ "slug:slotIndex:date"

async function autoBumpListings() {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const today = now.toISOString().slice(0, 10); // YYYY-MM-DD

    for (const [slug, times] of Object.entries(AUTO_BUMP_SCHEDULES)) {
        if (!times.includes(currentTime)) continue;

        const slotIndex = times.indexOf(currentTime);
        const totalSlots = times.length;
        const slotKey = `${slug}:${slotIndex}:${today}`;

        // ป้องกันรันซ้ำ slot เดิมในวันเดียวกัน
        if (processedBumpSlots.has(slotKey)) continue;
        processedBumpSlots.add(slotKey);

        try {
            // หา ACTIVE listings ของ users ที่มี package นี้
            const listings = await prisma.vehicleListing.findMany({
                where: {
                    status: 'ACTIVE',
                    user: { currentPackage: { slug } },
                    OR: [
                        { expiredAt: null },
                        { expiredAt: { gt: new Date() } }
                    ]
                },
                select: { id: true, userId: true, autoBumpSlot: true },
                orderBy: { createdAt: 'asc' }
            });

            if (listings.length === 0) continue;

            // แบ่ง listings ตาม slot
            const slotListings = listings.filter((l, idx) => {
                if (l.autoBumpSlot !== null) return l.autoBumpSlot === slotIndex;
                // ถ้าไม่ได้กำหนด → กระจายตาม index
                return idx % totalSlots === slotIndex;
            });

            if (slotListings.length === 0) continue;

            // ทยอยดันทีละคัน สุ่ม delay 0-10 นาที (600,000 ms)
            for (const listing of slotListings) {
                const delayMs = Math.floor(Math.random() * 10 * 60 * 1000);
                setTimeout(async () => {
                    try {
                        const bumpTime = new Date();
                        await prisma.vehicleListing.update({
                            where: { id: listing.id },
                            data: { bumpedAt: bumpTime }
                        });
                        await prisma.listingBumpLog.create({
                            data: { listingId: listing.id, userId: listing.userId, type: 'AUTO' }
                        });
                    } catch (err) {
                        console.error(`[Auto-Bump] Error bumping ${listing.id}:`, err);
                    }
                }, delayMs);
            }

            console.log(`[Auto-Bump] จัดคิว ${slotListings.length}/${listings.length} ประกาศ (${slug} slot ${slotIndex + 1}/${totalSlots}) เวลา ${currentTime}`);
        } catch (error) {
            console.error(`[Auto-Bump] Error (${slug}):`, error);
        }
    }
}

// เรียกทุก 1 นาที
setInterval(autoBumpListings, 60 * 1000);

// ===== Public GET routes (no auth required) =====
const publicListingRoutes = new Elysia({ prefix: "/listings" })

    // ── Homepage listing tiers ─────────────────────────────────────────
    //
    //   /featured     — CAR only, Dealer package
    //   /recommended  — CAR only, Pro + Standard packages
    //   /new          — CAR only, all ACTIVE ordered by createdAt desc
    //   /motorcycles  — MOTORCYCLE only, all ACTIVE ordered by createdAt desc
    //
    // Cars and motorcycles are kept in separate sections — motorcycles never
    // appear in the car-focused Featured/Recommended/New tiers, matching the
    // business decision that motorcycles are a secondary category.

    // ประกาศแนะนำ — Dealer only (CAR)
    .get("/featured", async () => {
        const now = new Date();
        const listings = await prisma.vehicleListing.findMany({
            where: {
                status: 'ACTIVE',
                vehicleType: 'CAR',
                user: {
                    OR: [
                        { packageExpiresAt: null, currentPackage: { searchPriority: 'priority' } },
                        { packageExpiresAt: { gt: now }, currentPackage: { searchPriority: 'priority' } },
                    ],
                },
            },
            take: 12,
            orderBy: [
                { bumpedAt: { sort: 'desc', nulls: 'last' } },
                { createdAt: 'desc' },
            ],
            include: featuredInclude,
        });

        return { listings: enrichFeatured(listings, now) };
    })

    // ดีลเด่นวันนี้ — Pro only (CAR). Standard tier listings appear in /new
    // alongside Basic so the "featured" label stays tight to the Pro promise.
    .get("/recommended", async () => {
        const now = new Date();
        const listings = await prisma.vehicleListing.findMany({
            where: {
                status: 'ACTIVE',
                vehicleType: 'CAR',
                user: {
                    OR: [
                        { packageExpiresAt: null, currentPackage: { searchPriority: 'top' } },
                        { packageExpiresAt: { gt: now }, currentPackage: { searchPriority: 'top' } },
                    ],
                },
            },
            take: 12,
            orderBy: [
                { bumpedAt: { sort: 'desc', nulls: 'last' } },
                { createdAt: 'desc' },
            ],
            include: featuredInclude,
        });

        return { listings: enrichFeatured(listings, now) };
    })

    // รถมาใหม่วันนี้ — CAR only, latest first
    .get("/new", async () => {
        const now = new Date();
        const listings = await prisma.vehicleListing.findMany({
            where: { status: 'ACTIVE', vehicleType: 'CAR' },
            take: 12,
            orderBy: [{ createdAt: 'desc' }],
            include: featuredInclude,
        });

        return { listings: enrichFeatured(listings, now) };
    })

    // มอเตอร์ไซค์ — MOTORCYCLE only, latest first.
    // Frontend component hides the section entirely when result count < 4
    // (business rule: motorcycles are de-emphasised vs cars on the homepage).
    .get("/motorcycles", async () => {
        const now = new Date();
        const listings = await prisma.vehicleListing.findMany({
            where: { status: 'ACTIVE', vehicleType: 'MOTORCYCLE' },
            take: 12,
            orderBy: [{ createdAt: 'desc' }],
            include: featuredInclude,
        });

        return { listings: enrichFeatured(listings, now) };
    })

    // สถิติสาธารณะสำหรับ landing page
    .get("/stats/public", async () => {
        const [activeListings, soldListings, totalSellers] = await Promise.all([
            prisma.vehicleListing.count({ where: { status: 'ACTIVE' } }),
            prisma.vehicleListing.count({ where: { status: 'SOLD' } }),
            prisma.user.count({ where: { isActive: true, listings: { some: {} } } })
        ]);
        return { activeListings, soldListings, totalSellers };
    })

    // ดึงประกาศทั้งหมด (พร้อม filter)
    .get("/", async ({ query }) => {
        const {
            vehicleType,
            brand,
            minPrice,
            maxPrice,
            province,
            bodyType,
            fuelType,
            transmission,
            minEngineSize,
            maxEngineSize,
            q,
            status = "ACTIVE",
            page = "1",
            limit = "20"
        } = query as any;

        console.log('Backend received query:', query);

        const where: Record<string, any> = {
            status: status,
            // ซ่อนประกาศที่หมดอายุจากการค้นหา (เฉพาะ status ACTIVE)
            ...(status === "ACTIVE" ? {
                OR: [
                    { expiredAt: null },
                    { expiredAt: { gt: new Date() } }
                ]
            } : {})
        };

        if (vehicleType) where.vehicleType = vehicleType;

        if (bodyType) {
            const bodyList = Array.isArray(bodyType) ? bodyType : bodyType.toString().split(',');
            if (bodyList.length > 1) {
                where.bodyType = { in: bodyList };
            } else {
                where.bodyType = bodyList[0];
            }
        }

        if (fuelType) {
            const fuelList = Array.isArray(fuelType) ? fuelType : fuelType.toString().split(',');
            const orConditions: any[] = [];

            fuelList.forEach((fuel: string) => {
                const conditions: any[] = [{ fuelType: fuel }];
                // If filtering for LPG or NGV, also check the gasType field
                if (fuel === 'LPG' || fuel === 'NGV') {
                    conditions.push({ gasType: fuel });
                }
                orConditions.push(...conditions);
            });

            if (orConditions.length > 0) {
                where.OR = where.OR ? [...where.OR, ...orConditions] : orConditions;
            }
        }

        if (transmission) {
            const transList = Array.isArray(transmission) ? transmission : transmission.toString().split(',');
            const expandedTransList = [...transList];

            // If filtering for AUTOMATIC, also include CVT, DCT, and SEMI_AUTO
            if (transList.includes('AUTOMATIC')) {
                expandedTransList.push('CVT', 'DCT', 'SEMI_AUTO');
            }

            if (expandedTransList.length > 1) {
                where.transmission = { in: Array.from(new Set(expandedTransList)) };
            } else {
                where.transmission = expandedTransList[0];
            }
        }

        if (brand) {
            const brandList = Array.isArray(brand) ? brand : brand.toString().split(',');
            if (brandList.length > 1) {
                where.brand = { in: brandList };
            } else {
                where.brand = brandList[0];
            }
        }
        if (province) where.province = province;

        if (query.seats) {
            const seatCount = parseInt(query.seats.toString());
            if (!isNaN(seatCount)) {
                if (seatCount === 7) {
                    where.seats = { gte: 7 };
                } else {
                    where.seats = seatCount;
                }
            }
        }

        if (query.maxMileage) {
            const mileage = parseInt(query.maxMileage.toString());
            if (!isNaN(mileage)) {
                where.mileage = { lte: mileage };
            }
        }

        // Price filtering
        const minNum = minPrice ? parseFloat(minPrice.toString()) : null;
        const maxNum = maxPrice ? parseFloat(maxPrice.toString()) : null;

        if (minNum !== null || maxNum !== null) {
            where.price = {};
            if (minNum !== null && !isNaN(minNum)) where.price.gte = minNum;
            if (maxNum !== null && !isNaN(maxNum)) where.price.lte = maxNum;
        }

        // Year filtering
        const minYearNum = query.minYear ? parseInt(query.minYear.toString()) : null;
        const maxYearNum = query.maxYear ? parseInt(query.maxYear.toString()) : null;

        if (minYearNum !== null || maxYearNum !== null) {
            where.year = {};
            if (minYearNum !== null && !isNaN(minYearNum)) where.year.gte = minYearNum;
            if (maxYearNum !== null && !isNaN(maxYearNum)) where.year.lte = maxYearNum;
        }

        // Engine Size filtering
        const minEngineNum = minEngineSize ? parseInt(minEngineSize.toString()) : null;
        const maxEngineNum = maxEngineSize ? parseInt(maxEngineSize.toString()) : null;

        if (minEngineNum !== null || maxEngineNum !== null) {
            where.engineSize = {};
            if (minEngineNum !== null && !isNaN(minEngineNum)) where.engineSize.gte = minEngineNum;
            if (maxEngineNum !== null && !isNaN(maxEngineNum)) where.engineSize.lte = maxEngineNum;
        }

        if (q) {
            const searchTerm = q.toString();
            where.OR = [
                { title: { contains: searchTerm, mode: 'insensitive' } },
                { brand: { contains: searchTerm, mode: 'insensitive' } },
                { model: { contains: searchTerm, mode: 'insensitive' } },
                { description: { contains: searchTerm, mode: 'insensitive' } }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Calculate brand stats based on other active filters (excluding the brand filter itself)
        const brandWhere = { ...where };
        delete brandWhere.brand;

        const PRIORITY_WEIGHT: Record<string, number> = { priority: 4, top: 3, higher: 2, normal: 1 };
        const BUCKET_HOURS = 6;
        const now = new Date();

        // Fetch more than needed for interleaving, then slice for pagination
        const fetchLimit = parseInt(limit) * 3; // fetch extra for re-sorting within buckets
        const fetchSkip = Math.max(0, skip - parseInt(limit)); // start earlier to account for reorder

        const [rawListings, total, brandStats] = await Promise.all([
            prisma.vehicleListing.findMany({
                where,
                include: {
                    images: {
                        where: { isPrimary: true },
                        take: 1
                    },
                    user: {
                        select: {
                            id: true,
                            fullName: true,
                            packageExpiresAt: true,
                            currentPackage: {
                                select: { slug: true, badge: true, searchPriority: true }
                            },
                            sellerProfile: {
                                select: { shopName: true, shopLogo: true, showroomType: true, isVerified: true, verificationLevel: true }
                            }
                        }
                    }
                },
                orderBy: [
                    { isFeatured: 'desc' },
                    { bumpedAt: { sort: 'desc', nulls: 'last' } },
                    { createdAt: 'desc' }
                ],
                skip: fetchSkip,
                take: fetchLimit
            }),
            prisma.vehicleListing.count({ where }),
            prisma.vehicleListing.groupBy({
                by: ['brand'],
                where: brandWhere,
                _count: {
                    brand: true
                }
            })
        ]);

        // Interleave by search priority within time buckets
        const featured = rawListings.filter(l => l.isFeatured);
        const nonFeatured = rawListings.filter(l => !l.isFeatured);

        // Group non-featured into time buckets
        const buckets = new Map<number, typeof nonFeatured>();
        for (const listing of nonFeatured) {
            const sortTime = listing.bumpedAt || listing.createdAt;
            const bucketKey = Math.floor((now.getTime() - new Date(sortTime).getTime()) / (BUCKET_HOURS * 3600000));
            if (!buckets.has(bucketKey)) buckets.set(bucketKey, []);
            buckets.get(bucketKey)!.push(listing);
        }

        // Sort within each bucket by searchPriority
        const interleaved: typeof rawListings = [...featured]; // featured first
        const sortedBucketKeys = [...buckets.keys()].sort((a, b) => a - b);
        for (const key of sortedBucketKeys) {
            const bucket = buckets.get(key)!;
            bucket.sort((a, b) => {
                const aPriority = PRIORITY_WEIGHT[a.user?.currentPackage?.searchPriority || 'normal'] || 1;
                const bPriority = PRIORITY_WEIGHT[b.user?.currentPackage?.searchPriority || 'normal'] || 1;
                if (aPriority !== bPriority) return bPriority - aPriority;
                const aTime = new Date(a.bumpedAt || a.createdAt).getTime();
                const bTime = new Date(b.bumpedAt || b.createdAt).getTime();
                return bTime - aTime;
            });
            interleaved.push(...bucket);
        }

        // Apply correct pagination offset within the interleaved results
        const adjustedSkip = skip - fetchSkip;
        const pageListings = interleaved.slice(adjustedSkip, adjustedSkip + parseInt(limit));

        // Enrich with packageSlug (for border) + KYC-gated badge — same contract
        // as enrichFeatured() so ListingCard behaves consistently on every page.
        const listings = pageListings.map(l => {
            const pkgActive = l.user.currentPackage ? (l.user.packageExpiresAt ? new Date(l.user.packageExpiresAt) > now : true) : false;
            const sp = (l.user as { sellerProfile?: { isVerified?: boolean; verificationLevel?: string | null } | null }).sellerProfile;
            const hasKyc = !!(sp?.isVerified && sp.verificationLevel && sp.verificationLevel !== 'NONE');
            const packageSlug = pkgActive ? (l.user.currentPackage?.slug || 'basic') : 'basic';
            return {
                ...l,
                packageSlug,
                badge: pkgActive && hasKyc ? (l.user.currentPackage?.badge || null) : null,
                user: { id: l.user.id, fullName: l.user.fullName, sellerProfile: sp || null }
            };
        });

        return {
            listings,
            brandStats: brandStats.reduce((acc: any, curr) => {
                acc[curr.brand] = curr._count.brand;
                return acc;
            }, {}),
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit))
            }
        };
    })

    // ดึงประกาศตาม ID
    .get("/:id", async ({ params, query, set }) => {
        const { id } = params;
        const { viewerId } = query; // Optional: userId ของคนที่กำลังดู

        const listing = await prisma.vehicleListing.findUnique({
            where: { id },
            include: {
                images: {
                    orderBy: { order: 'asc' }
                },
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        phoneNumber: true,
                        packageExpiresAt: true,
                        currentPackage: {
                            select: { badge: true }
                        },
                        sellerProfile: {
                            select: { shopName: true, shopLogo: true, showroomType: true, isVerified: true, verificationLevel: true, shopProvince: true }
                        }
                    }
                }
            }
        });

        if (!listing) {
            set.status = 404;
            return { message: "ไม่พบประกาศนี้" };
        }

        const isOwner = viewerId && viewerId === listing.userId;

        // เช็คว่าประกาศหมดอายุหรือไม่
        const isExpired = listing.status === 'EXPIRED'
            || (listing.expiredAt && new Date(listing.expiredAt) < new Date());

        if (!isOwner) {
            // ถ้าหมดอายุ → return expired flag (ไม่แสดงข้อมูลรถ)
            if (isExpired) {
                return { listing: null, expired: true, message: "ประกาศนี้หมดอายุแล้ว" };
            }
            // ซ่อน draft/pending/paused/suspended/inactive/sold จาก public
            if (listing.status !== 'ACTIVE') {
                set.status = 404;
                return { message: "ไม่พบประกาศนี้" };
            }
        }

        // เพิ่ม view count เฉพาะเมื่อคนดูไม่ใช่เจ้าของประกาศ และยังไม่หมดอายุ
        if (!isExpired && !isOwner) {
            await prisma.vehicleListing.update({
                where: { id },
                data: { viewCount: { increment: 1 } }
            });
        }

        // Enrich with badge (check package expiry)
        const now = new Date();
        const pkgActive = listing.user.currentPackage ? (listing.user.packageExpiresAt ? new Date(listing.user.packageExpiresAt) > now : true) : false;
        const enrichedListing = {
            ...listing,
            badge: pkgActive ? (listing.user.currentPackage?.badge || null) : null,
            user: {
                id: listing.user.id,
                fullName: listing.user.fullName,
                phoneNumber: listing.user.phoneNumber,
                sellerProfile: (listing.user as any).sellerProfile || null,
            }
        };

        return { listing: enrichedListing, expired: isExpired };
    })

    // ดึงประกาศของ user
    .get("/user/:userId", async ({ params, query }) => {
        const { userId } = params;
        const { status, page = "1", limit = "20" } = query;

        const where: Record<string, unknown> = { userId };
        if (status) where.status = status;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [listings, total] = await Promise.all([
            prisma.vehicleListing.findMany({
                where,
                include: {
                    images: {
                        where: { isPrimary: true },
                        take: 1
                    },
                    user: {
                        select: {
                            id: true,
                            fullName: true,
                            packageExpiresAt: true,
                            currentPackage: { select: { badge: true } },
                            sellerProfile: {
                                select: { shopName: true, shopLogo: true, showroomType: true, isVerified: true, verificationLevel: true }
                            }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: parseInt(limit)
            }),
            prisma.vehicleListing.count({ where })
        ]);

        const now = new Date();
        const enrichedListings = listings.map((l: any) => {
            const pkgActive = l.user?.currentPackage ? (l.user.packageExpiresAt ? new Date(l.user.packageExpiresAt) > now : true) : false;
            return {
                ...l,
                badge: pkgActive ? (l.user?.currentPackage?.badge || null) : null,
                user: {
                    id: l.user?.id,
                    fullName: l.user?.fullName,
                    sellerProfile: l.user?.sellerProfile || null,
                }
            };
        });

        return {
            listings: enrichedListings,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit))
            }
        };
    })

    // ดึง pending renewals ของ user
    .get("/renewals/pending", async ({ query }) => {
        const { userId } = query;
        if (!userId) return { renewals: [] };
        const renewals = await prisma.listingRenewal.findMany({
            where: { userId: userId as string, status: 'PENDING' },
            select: { id: true, listingId: true, createdAt: true, amount: true }
        });
        return { renewals };
    })

    // ดึงข้อมูล slots ของ user (จำนวนต่อ slot + ความจุ)
    .get("/bump-slots", async ({ query }) => {
        const { userId } = query;
        if (!userId) return { slots: [] };

        const userPkg = await getUserPackage(userId as string);
        const autoBump = (userPkg as any).autoBumpPerDay ?? 0;
        const maxListings = userPkg.maxListings;

        if (autoBump <= 0) return { slots: [], maxPerSlot: 0, autoBump: 0 };

        const maxPerSlot = Math.ceil(maxListings / autoBump);

        // ดึง package slug เพื่อหาตาราง slots
        const pkg = await prisma.package.findFirst({ where: { id: userPkg.id }, select: { slug: true } });
        const schedules = AUTO_BUMP_SCHEDULES[pkg?.slug || ''] || [];

        // นับ listing ในแต่ละ slot
        const slots = await Promise.all(
            schedules.map(async (time, idx) => {
                const count = await prisma.vehicleListing.count({
                    where: { userId: userId as string, autoBumpSlot: idx, status: 'ACTIVE' }
                });
                return { index: idx, time, count, maxPerSlot };
            })
        );

        // นับ listing ที่ไม่ได้กำหนด slot (null = ระบบจัดให้)
        const unassigned = await prisma.vehicleListing.count({
            where: { userId: userId as string, autoBumpSlot: null, status: 'ACTIVE' }
        });

        return { slots, maxPerSlot, autoBump, unassigned };
    })

    // ===== Price Estimation =====
    .post("/estimate", async ({ body }) => {
        const { brand, model, subModel, year, mileage, condition, vehicleType, fuelType, transmission } = body as any;

        if (!brand || !model || !year) {
            return { error: "brand, model, year are required" };
        }

        const inputYear = Number(year);
        const inputMileage = mileage ? Number(mileage) : null;

        // Step 1: Find matching listings with progressive fallback
        const baseWhere = {
            status: { in: ['ACTIVE', 'SOLD'] as any },
            ...(vehicleType ? { vehicleType } : {}),
        };

        // Try exact match first: brand + model + year ±2
        let matchedListings = await prisma.vehicleListing.findMany({
            where: {
                ...baseWhere,
                brand: { equals: brand, mode: 'insensitive' as any },
                model: { equals: model, mode: 'insensitive' as any },
                year: { gte: inputYear - 2, lte: inputYear + 2 },
            },
            select: {
                id: true, title: true, price: true, year: true, mileage: true,
                brand: true, model: true, subModel: true, status: true,
                condition: true, fuelType: true, transmission: true, color: true,
                viewCount: true, createdAt: true, updatedAt: true, publishedAt: true,
                images: { where: { isPrimary: true }, take: 1 },
            },
            orderBy: { createdAt: 'desc' },
            take: 200,
        });

        let matchLevel: 'exact' | 'model' | 'brand' = 'exact';

        // Fallback 1: brand + model (any year)
        if (matchedListings.length < 5) {
            matchedListings = await prisma.vehicleListing.findMany({
                where: {
                    ...baseWhere,
                    brand: { equals: brand, mode: 'insensitive' as any },
                    model: { equals: model, mode: 'insensitive' as any },
                },
                select: {
                    id: true, title: true, price: true, year: true, mileage: true,
                    brand: true, model: true, subModel: true, status: true,
                    condition: true, fuelType: true, transmission: true, color: true,
                    viewCount: true, createdAt: true, updatedAt: true, publishedAt: true,
                    images: { where: { isPrimary: true }, take: 1 },
                },
                orderBy: { createdAt: 'desc' },
                take: 200,
            });
            matchLevel = 'model';
        }

        // Fallback 2: brand only
        if (matchedListings.length < 3) {
            matchedListings = await prisma.vehicleListing.findMany({
                where: {
                    ...baseWhere,
                    brand: { equals: brand, mode: 'insensitive' as any },
                },
                select: {
                    id: true, title: true, price: true, year: true, mileage: true,
                    brand: true, model: true, subModel: true, status: true,
                    condition: true, fuelType: true, transmission: true, color: true,
                    viewCount: true, createdAt: true, updatedAt: true, publishedAt: true,
                    images: { where: { isPrimary: true }, take: 1 },
                },
                orderBy: { createdAt: 'desc' },
                take: 200,
            });
            matchLevel = 'brand';
        }

        // Not enough data
        if (matchedListings.length < 1) {
            return {
                estimatedPrice: null,
                sampleSize: 0,
                confidence: 0,
                message: "ข้อมูลไม่เพียงพอสำหรับการประเมินราคา",
                vehicleInfo: { brand, model, year: inputYear },
            };
        }

        // Filter out listings with invalid data (Buddhist year, zero price, etc.)
        matchedListings = matchedListings.filter(l => {
            const price = Number(l.price);
            if (price <= 0) return false;
            if (l.year > 2100 || l.year < 1970) return false; // filter Buddhist year entries
            return true;
        });

        if (matchedListings.length < 1) {
            return {
                estimatedPrice: null,
                sampleSize: 0,
                confidence: 0,
                message: "ข้อมูลไม่เพียงพอสำหรับการประเมินราคา",
                vehicleInfo: { brand, model, year: inputYear },
            };
        }

        // Step 2: Calculate price statistics
        const prices = matchedListings.map(l => Number(l.price)).sort((a, b) => a - b);
        const sampleSize = prices.length;

        const median = (arr: number[]) => {
            const mid = Math.floor(arr.length / 2);
            return arr.length % 2 !== 0 ? arr[mid] : (arr[mid - 1] + arr[mid]) / 2;
        };

        const medianPrice = median(prices);
        const p25 = median(prices.slice(0, Math.floor(prices.length / 2)));
        const p75 = median(prices.slice(Math.ceil(prices.length / 2)));
        const avgPrice = prices.reduce((a, b) => a + b, 0) / sampleSize;

        // Step 3: Mileage adjustment
        let mileageAdjustment = 0;
        if (inputMileage !== null) {
            const mileages = matchedListings.filter(l => l.mileage > 0).map(l => l.mileage);
            if (mileages.length > 0) {
                const avgMileage = mileages.reduce((a, b) => a + b, 0) / mileages.length;
                const diff = avgMileage - inputMileage; // positive = lower mileage = higher price
                // ~0.5 baht per km difference (approximate)
                const depreciationPerKm = medianPrice * 0.000005;
                mileageAdjustment = diff * depreciationPerKm;
            }
        }

        // Step 4: Year adjustment (for fallback matches with wider year range)
        let yearAdjustment = 0;
        if (matchLevel !== 'exact') {
            const avgYear = matchedListings.reduce((a, l) => a + l.year, 0) / sampleSize;
            const yearDiff = inputYear - avgYear;
            // ~3-5% per year difference
            yearAdjustment = medianPrice * yearDiff * 0.04;
        }

        // Cap total adjustments to ±20% of median price
        const maxAdjustment = medianPrice * 0.2;
        const totalAdjustment = Math.max(-maxAdjustment, Math.min(maxAdjustment, mileageAdjustment + yearAdjustment));
        mileageAdjustment = totalAdjustment * (mileageAdjustment / (Math.abs(mileageAdjustment) + Math.abs(yearAdjustment) || 1));
        yearAdjustment = totalAdjustment - mileageAdjustment;

        const basePrice = medianPrice + totalAdjustment;

        // Step 5: Condition factors
        const conditionFactors: Record<string, number> = {
            EXCELLENT: 1.05,
            GOOD: 1.0,
            FAIR: 0.95,
            POOR: 0.90,
        };

        const inputCondition = condition || 'GOOD';
        const condFactor = conditionFactors[inputCondition] || 1.0;
        const adjustedPrice = Math.round(basePrice * condFactor);

        // Price range: p25 to p75 adjusted (ensure positive)
        const priceLow = Math.max(10000, Math.round((p25 + totalAdjustment) * condFactor / 10000) * 10000);
        const priceHigh = Math.max(10000, Math.round((p75 + totalAdjustment) * condFactor / 10000) * 10000);
        const priceMedian = Math.max(10000, Math.round(adjustedPrice / 10000) * 10000);

        // priceByCondition
        const priceByCondition: Record<string, { low: number; high: number }> = {};
        for (const [cond, factor] of Object.entries(conditionFactors)) {
            if (cond === 'POOR') continue;
            priceByCondition[cond] = {
                low: Math.max(10000, Math.round((p25 + totalAdjustment) * factor / 10000) * 10000),
                high: Math.max(10000, Math.round((p75 + totalAdjustment) * factor / 10000) * 10000),
            };
        }

        // Step 6: Demand level
        const activeCount = matchedListings.filter(l => l.status === 'ACTIVE').length;
        const soldCount = matchedListings.filter(l => l.status === 'SOLD').length;
        let demandLevel: 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM';
        if (sampleSize >= 3) {
            const soldRatio = soldCount / sampleSize;
            if (soldRatio > 0.5) demandLevel = 'HIGH';
            else if (soldRatio < 0.2) demandLevel = 'LOW';
        }

        // Step 7: Avg days to sell
        const soldListings = matchedListings.filter(l => l.status === 'SOLD' && l.publishedAt);
        let avgDaysToSell = 0;
        if (soldListings.length > 0) {
            const totalDays = soldListings.reduce((sum, l) => {
                const pub = new Date(l.publishedAt!).getTime();
                const upd = new Date(l.updatedAt).getTime();
                return sum + Math.max(1, Math.round((upd - pub) / (1000 * 60 * 60 * 24)));
            }, 0);
            avgDaysToSell = Math.round(totalDays / soldListings.length);
        }

        // Step 8: Market trend
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
        const recentPrices = matchedListings.filter(l => new Date(l.createdAt) > thirtyDaysAgo).map(l => Number(l.price));
        const olderPrices = matchedListings.filter(l => new Date(l.createdAt) > sixtyDaysAgo && new Date(l.createdAt) <= thirtyDaysAgo).map(l => Number(l.price));

        let marketTrend: 'RISING' | 'STABLE' | 'FALLING' = 'STABLE';
        if (recentPrices.length >= 2 && olderPrices.length >= 2) {
            const recentAvg = recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length;
            const olderAvg = olderPrices.reduce((a, b) => a + b, 0) / olderPrices.length;
            const changePercent = ((recentAvg - olderAvg) / olderAvg) * 100;
            if (changePercent > 3) marketTrend = 'RISING';
            else if (changePercent < -3) marketTrend = 'FALLING';
        }

        // Step 9: Confidence
        let confidence = Math.min(0.95, 0.3 + sampleSize * 0.013);
        if (matchLevel === 'brand') confidence *= 0.6;
        else if (matchLevel === 'model') confidence *= 0.8;
        confidence = Math.round(confidence * 100) / 100;

        // Step 10: Similar active listings (top 5)
        const similarListings = matchedListings
            .filter(l => l.status === 'ACTIVE')
            .sort((a, b) => Math.abs(a.year - inputYear) - Math.abs(b.year - inputYear))
            .slice(0, 5)
            .map(l => ({
                id: l.id,
                title: l.title,
                price: Number(l.price),
                year: l.year,
                mileage: l.mileage,
                brand: l.brand,
                model: l.model,
                subModel: l.subModel,
                fuelType: l.fuelType,
                transmission: l.transmission,
                image: l.images[0]?.url || null,
            }));

        return {
            estimatedPrice: { low: priceLow, high: priceHigh, median: priceMedian },
            sampleSize,
            demandLevel,
            avgDaysToSell: avgDaysToSell || null,
            priceByCondition,
            similarListings,
            marketTrend,
            confidence,
            matchLevel,
            vehicleInfo: { brand, model, subModel: subModel || null, year: inputYear },
        };
    });

// ===== Protected write routes (authGuard required) =====
const protectedListingRoutes = new Elysia({ prefix: "/listings" })
    .use(authGuard)

    // สร้างประกาศขายใหม่
    .post("/", async ({ body, set, auth }) => {
        if (!auth || !auth.userId) { set.status = 401; return { error: "Unauthorized", message: "กรุณาเข้าสู่ระบบ" }; }
        const userId = auth.userId;
        const { ...listingData } = body;

        // ตรวจสอบว่า user มีอยู่จริง
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            set.status = 401;
            return { message: "กรุณาเข้าสู่ระบบ" };
        }

        // ตรวจสอบ limit จำนวนประกาศตาม package
        const activeListings = await prisma.vehicleListing.count({
            where: {
                userId,
                status: { in: ['ACTIVE', 'DRAFT', 'PENDING'] }
            }
        });
        const userPkg = await getUserPackage(userId);
        if (!canCreateListing(userPkg.maxListings, activeListings)) {
            set.status = 403;
            return {
                message: `แพ็กเกจ ${userPkg.name} ลงประกาศได้สูงสุด ${userPkg.maxListings} รายการ กรุณาอัพเกรดแพ็กเกจเพื่อลงประกาศเพิ่มเติม`,
                upgradeRequired: true,
            };
        }


        // Basic (free) package ไม่อนุญาตให้ใส่ facebookUrl
        const isFreePkg = !userPkg.id;
        const allowedFacebookUrl = isFreePkg ? null : (listingData.facebookUrl || null);

        // Sanitize listing data before database operation
        const sanitizedData = sanitizeObject(listingData as Record<string, unknown>);

        try {
            const listing = await prisma.vehicleListing.create({
                data: {
                    userId,
                    vehicleType: sanitizedData.vehicleType as any,
                    title: sanitizedData.title as string,
                    description: sanitizedData.description as string | undefined,
                    price: sanitizedData.price as number,
                    brand: sanitizedData.brand as string,
                    model: sanitizedData.model as string,
                    subModel: sanitizedData.subModel as string | undefined,
                    year: sanitizedData.year as number,
                    color: sanitizedData.color as string,
                    fuelType: sanitizedData.fuelType as any,
                    transmission: sanitizedData.transmission as any,
                    engineSize: sanitizedData.engineSize as number | undefined,
                    seats: sanitizedData.seats as number | undefined,
                    mileage: (sanitizedData.mileage as number | null | undefined) ?? null,
                    bodyType: sanitizedData.bodyType as any,
                    plateProvince: sanitizedData.plateProvince as string | undefined,
                    registrationType: (sanitizedData.registrationType as any) ?? "PERSONAL",
                    condition: sanitizedData.condition as any,
                    hasAccident: (sanitizedData.hasAccident as boolean) ?? false,
                    hasModified: (sanitizedData.hasModified as boolean) ?? false,
                    hasWarranty: (sanitizedData.hasWarranty as boolean) ?? false,
                    province: (sanitizedData.province as string | null | undefined) || null,
                    district: sanitizedData.district as string | undefined,
                    contactName: sanitizedData.contactName as string | undefined,
                    contactPhone: sanitizedData.contactPhone as string | undefined,
                    lineId: sanitizedData.lineId as string | undefined,
                    facebookUrl: allowedFacebookUrl,
                    // Vehicle Extras
                    taxPaid: (sanitizedData.taxPaid as boolean) ?? false,
                    registrationBookStatus: (sanitizedData.registrationBookStatus as any) ?? "READY",
                    insuranceDetails: sanitizedData.insuranceDetails as string | undefined,
                    warrantyDetails: sanitizedData.warrantyDetails as string | undefined,
                    bsiDetails: sanitizedData.bsiDetails as string | undefined,
                    gasType: (sanitizedData.gasType as any) ?? "NONE",
                    hasSpareKey: (sanitizedData.hasSpareKey as boolean) ?? false,
                    // serviceHistoryImage will be uploaded separately
                    status: "DRAFT", // เริ่มต้นเป็น draft
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            fullName: true,
                            phoneNumber: true,
                        }
                    }
                }
            });

            // Auto-enrich master data with any new model / sub-model the seller typed
            // so future sellers can autocomplete them instead of retyping. Non-blocking:
            // if this fails we don't want to break the listing create flow.
            ensureModelAndSubModel({
                vehicleType: sanitizedData.vehicleType as 'CAR' | 'MOTORCYCLE',
                brand: sanitizedData.brand as string,
                model: sanitizedData.model as string,
                subModel: sanitizedData.subModel as string | undefined,
                bodyType: sanitizedData.bodyType as string | undefined,
                engineSize: sanitizedData.engineSize as number | undefined,
                fuelType: sanitizedData.fuelType as string | undefined,
                transmission: sanitizedData.transmission as string | undefined,
                seats: sanitizedData.seats as number | undefined,
            }).catch(err => console.error('ensureModelAndSubModel failed (create):', err));

            return {
                message: "สร้างประกาศสำเร็จ",
                listing
            };
        } catch (error) {
            console.error(error);
            set.status = 500;
            return { message: "เกิดข้อผิดพลาดในการสร้างประกาศ" };
        }
    }, {
        body: t.Object({
            vehicleType: t.Union([t.Literal("CAR"), t.Literal("MOTORCYCLE")]),
            title: t.String(),
            description: t.Optional(t.String()),
            price: t.Number(),
            brand: t.String(),
            model: t.String(),
            subModel: t.Optional(t.String()),
            year: t.Number(),
            color: t.String(),
            fuelType: t.Optional(t.Union([
                t.Literal("PETROL"),
                t.Literal("DIESEL"),
                t.Literal("HYBRID"),
                t.Literal("PLUGIN_HYBRID"),
                t.Literal("EV"),
                t.Literal("LPG"),
                t.Literal("NGV")
            ])),
            transmission: t.Optional(t.Union([
                t.Literal("AUTOMATIC"),
                t.Literal("MANUAL"),
                t.Literal("CVT"),
                t.Literal("DCT"),
                t.Literal("SEMI_AUTO")
            ])),
            engineSize: t.Optional(t.Number()),
            seats: t.Optional(t.Number()),
            mileage: t.Optional(t.Union([t.Number(), t.Null()])),
            bodyType: t.Union([
                // รถยนต์
                t.Literal("SEDAN"),
                t.Literal("HATCHBACK"),
                t.Literal("SUV"),
                t.Literal("PPV"),
                t.Literal("CROSSOVER"),
                t.Literal("MPV"),
                t.Literal("PICKUP"),
                t.Literal("COUPE"),
                t.Literal("CONVERTIBLE"),
                t.Literal("WAGON"),
                t.Literal("VAN"),
                // มอเตอร์ไซค์
                t.Literal("STANDARD"),
                t.Literal("SCOOTER"),
                t.Literal("SPORT"),
                t.Literal("NAKED"),
                t.Literal("CRUISER"),
                t.Literal("TOURING"),
                t.Literal("ADVENTURE"),
                t.Literal("DIRT"),
                t.Literal("CAFE_RACER"),
                t.Literal("UNDERBONE"),
                t.Literal("CUB")
            ]),
            plateProvince: t.Optional(t.String()),
            registrationType: t.Optional(t.Union([
                t.Literal("PERSONAL"),
                t.Literal("COMPANY")
            ])),
            condition: t.Union([
                t.Literal("EXCELLENT"),
                t.Literal("GOOD"),
                t.Literal("FAIR"),
                t.Literal("POOR")
            ]),
            hasAccident: t.Optional(t.Boolean()),
            hasModified: t.Optional(t.Boolean()),
            hasWarranty: t.Optional(t.Boolean()),
            province: t.Optional(t.String()),
            district: t.Optional(t.String()),
            contactName: t.Optional(t.String()),
            contactPhone: t.Optional(t.String()),
            lineId: t.Optional(t.String()),
            facebookUrl: t.Optional(t.String()),
            // Vehicle Extras
            taxPaid: t.Optional(t.Boolean()),
            registrationBookStatus: t.Optional(t.Union([
                t.Literal("READY"),
                t.Literal("FINANCED")
            ])),
            insuranceDetails: t.Optional(t.String()),
            warrantyDetails: t.Optional(t.String()),
            bsiDetails: t.Optional(t.String()),
            gasType: t.Optional(t.Union([
                t.Literal("NONE"),
                t.Literal("LPG"),
                t.Literal("NGV")
            ])),
            hasSpareKey: t.Optional(t.Boolean())
        })
    })

    // อัพโหลดรูปภาพสำหรับประกาศ
    .post("/:id/images", async ({ params, body, set, auth }) => {
        if (!auth || !auth.userId) { set.status = 401; return { error: "Unauthorized", message: "กรุณาเข้าสู่ระบบ" }; }
        const userId = auth.userId;
        const { id } = params;
        const { images } = body;

        // Validate each image
        for (const img of images) {
            if (!isValidImageType(img.mimetype)) {
                set.status = 400;
                return { message: "รองรับเฉพาะไฟล์ JPEG, PNG, WebP และ GIF" };
            }
            const buffer = Buffer.from(img.buffer, 'base64');
            if (!isValidFileSize(buffer.length)) {
                set.status = 400;
                return { message: "ขนาดไฟล์ต้องไม่เกิน 10 MB" };
            }
        }

        // ตรวจสอบ listing
        const listing = await prisma.vehicleListing.findUnique({
            where: { id }
        });

        if (!listing) {
            set.status = 404;
            return { message: "ไม่พบประกาศนี้" };
        }

        if (listing.userId !== userId) {
            set.status = 403;
            return { message: "คุณไม่มีสิทธิ์แก้ไขประกาศนี้" };
        }

        // ดึงรูปที่มีอยู่เดิม
        const existingImages = await prisma.vehicleImage.findMany({
            where: { listingId: id },
            orderBy: { order: 'asc' }
        });

        // ตรวจสอบจำนวนรูปตาม package limit
        const userPkgForPhotos = await getUserPackage(userId);
        if (!canUploadPhotos(userPkgForPhotos.maxPhotosPerListing, existingImages.length, images.length)) {
            set.status = 400;
            return {
                message: `แพ็กเกจ ${userPkgForPhotos.name} อัพโหลดได้สูงสุด ${userPkgForPhotos.maxPhotosPerListing} รูป/ประกาศ (ปัจจุบันมี ${existingImages.length} รูป)`,
                upgradeRequired: true,
            };
        }


        try {
            // อัพโหลดรูปไปยัง MinIO
            const uploadedImages = await uploadListingImages(
                userId,
                id,
                images.map((img: { buffer: string; filename: string; mimetype: string }) => ({
                    buffer: Buffer.from(img.buffer, 'base64'),
                    originalname: img.filename,
                    mimetype: img.mimetype
                }))
            );

            // คำนวณ order เริ่มต้น (ต่อจากรูปสุดท้าย)
            const startOrder = existingImages.length > 0
                ? Math.max(...existingImages.map(img => img.order)) + 1
                : 0;

            // ตรวจสอบว่ามีรูปหลักอยู่แล้วหรือไม่
            const hasPrimary = existingImages.some(img => img.isPrimary);

            // บันทึกข้อมูลรูปลง database
            await prisma.vehicleImage.createMany({
                data: uploadedImages.map((img, index) => ({
                    listingId: id,
                    url: img.url,
                    isPrimary: !hasPrimary && index === 0, // ถ้ายังไม่มีรูปหลัก ให้รูปแรกใหม่เป็นรูปหลัก
                    order: startOrder + index
                }))
            });

            // ดึงรูปทั้งหมดกลับมา
            const allImages = await prisma.vehicleImage.findMany({
                where: { listingId: id },
                orderBy: { order: 'asc' }
            });

            return {
                message: "อัพโหลดรูปภาพสำเร็จ",
                images: allImages
            };
        } catch (error) {
            console.error(error);
            set.status = 500;
            return { message: "เกิดข้อผิดพลาดในการอัพโหลดรูปภาพ" };
        }
    }, {
        body: t.Object({
            images: t.Array(t.Object({
                buffer: t.String(), // base64 encoded
                filename: t.String(),
                mimetype: t.String()
            }))
        })
    })

    // อัพโหลดรูปประวัติบริการ
    .post("/:id/service-history", async ({ params, body, set, auth }) => {
        if (!auth || !auth.userId) { set.status = 401; return { error: "Unauthorized", message: "กรุณาเข้าสู่ระบบ" }; }
        const userId = auth.userId;
        const { id } = params;
        const { image } = body;

        // Validate image type and size
        if (!isValidImageType(image.mimetype)) {
            set.status = 400;
            return { message: "รองรับเฉพาะไฟล์ JPEG, PNG, WebP และ GIF" };
        }
        const imageBuffer = Buffer.from(image.buffer, 'base64');
        if (!isValidFileSize(imageBuffer.length)) {
            set.status = 400;
            return { message: "ขนาดไฟล์ต้องไม่เกิน 10 MB" };
        }

        // ตรวจสอบ listing
        const listing = await prisma.vehicleListing.findUnique({
            where: { id }
        });

        if (!listing) {
            set.status = 404;
            return { message: "ไม่พบประกาศนี้" };
        }

        if (listing.userId !== userId) {
            set.status = 403;
            return { message: "คุณไม่มีสิทธิ์แก้ไขประกาศนี้" };
        }

        try {
            // เก็บ URL เดิมไว้ลบหลังสำเร็จ
            const oldServiceHistoryImage = listing.serviceHistoryImage;

            // Process image to WebP
            const webpBuffer = await processImage(imageBuffer, {
                maxWidth: 1920,
                maxHeight: 1440,
                quality: 85
            });

            // Generate filename and path
            const baseFilename = generateFilename(image.filename);
            const webpFilename = baseFilename.replace(/\.[^.]+$/, '.webp');
            const objectPath = `${listing.userId}/listings/${id}/service-history-${webpFilename}`;

            // Upload to MinIO
            const imageUrl = await uploadFile(objectPath, webpBuffer, 'image/webp');

            // Update listing with service history image URL
            await prisma.vehicleListing.update({
                where: { id },
                data: { serviceHistoryImage: imageUrl }
            });

            // ลบรูปเดิมหลังอัพโหลดและบันทึก DB สำเร็จแล้ว
            await deleteOldFile(oldServiceHistoryImage);

            return {
                message: "อัพโหลดรูปประวัติบริการสำเร็จ",
                imageUrl
            };
        } catch (error) {
            console.error(error);
            set.status = 500;
            return { message: "เกิดข้อผิดพลาดในการอัพโหลดรูป" };
        }
    }, {
        body: t.Object({
            image: t.Object({
                buffer: t.String(),
                filename: t.String(),
                mimetype: t.String()
            })
        })
    })

    // อัปโหลดสำเนาเล่มทะเบียนรถ
    .post("/:id/registration-book", async ({ params, body, set, auth }) => {
        if (!auth || !auth.userId) { set.status = 401; return { error: "Unauthorized", message: "กรุณาเข้าสู่ระบบ" }; }
        const userId = auth.userId;
        const { id } = params;
        const { image } = body;

        // Validate image type and size
        if (!isValidImageType(image.mimetype)) {
            set.status = 400;
            return { message: "รองรับเฉพาะไฟล์ JPEG, PNG, WebP และ GIF" };
        }
        const imageBuffer = Buffer.from(image.buffer, 'base64');
        if (!isValidFileSize(imageBuffer.length)) {
            set.status = 400;
            return { message: "ขนาดไฟล์ต้องไม่เกิน 10 MB" };
        }

        const listing = await prisma.vehicleListing.findUnique({
            where: { id }
        });

        if (!listing) {
            set.status = 404;
            return { message: "ไม่พบประกาศนี้" };
        }

        if (listing.userId !== userId) {
            set.status = 403;
            return { message: "คุณไม่มีสิทธิ์แก้ไขประกาศนี้" };
        }

        try {
            // เก็บ URL เดิมไว้ลบหลังสำเร็จ
            const oldRegistrationBookImage = listing.registrationBookImage;

            const webpBuffer = await processImage(imageBuffer, {
                maxWidth: 1280,
                maxHeight: 960,
                quality: 85
            });

            const baseFilename = generateFilename(image.filename);
            const webpFilename = baseFilename.replace(/\.[^.]+$/, '.webp');
            const objectPath = `${listing.userId}/listings/${id}/registration-book-${webpFilename}`;

            const imageUrl = await uploadFile(objectPath, webpBuffer, 'image/webp');

            await prisma.vehicleListing.update({
                where: { id },
                data: { registrationBookImage: imageUrl }
            });

            // ลบรูปเดิมหลังอัพโหลดและบันทึก DB สำเร็จแล้ว
            await deleteOldFile(oldRegistrationBookImage);

            return {
                message: "อัปโหลดสำเนาเล่มทะเบียนสำเร็จ",
                imageUrl
            };
        } catch (error) {
            console.error(error);
            set.status = 500;
            return { message: "เกิดข้อผิดพลาดในการอัปโหลดรูป" };
        }
    }, {
        body: t.Object({
            image: t.Object({
                buffer: t.String(),
                filename: t.String(),
                mimetype: t.String()
            })
        })
    })

    // ลบรูปภาพเดี่ยว
    .delete("/:id/images/:imageId", async ({ params, set, auth }) => {
        if (!auth || !auth.userId) { set.status = 401; return { error: "Unauthorized", message: "กรุณาเข้าสู่ระบบ" }; }
        const userId = auth.userId;
        const { id, imageId } = params;

        // ตรวจสอบ listing
        const listing = await prisma.vehicleListing.findUnique({
            where: { id },
            include: { images: true }
        });

        if (!listing) {
            set.status = 404;
            return { message: "ไม่พบประกาศนี้" };
        }

        if (listing.userId !== userId) {
            set.status = 403;
            return { message: "คุณไม่มีสิทธิ์แก้ไขประกาศนี้" };
        }

        // หา image ที่ต้องการลบ
        const imageToDelete = listing.images.find(img => img.id === imageId);
        if (!imageToDelete) {
            set.status = 404;
            return { message: "ไม่พบรูปภาพนี้" };
        }

        try {
            // ลบจาก MinIO โดยดึง path จาก URL
            const url = new URL(imageToDelete.url);
            const objectPath = url.pathname.replace(/^\/car2hand\//, '');
            await deleteFile(objectPath);

            // ลบจาก database
            await prisma.vehicleImage.delete({
                where: { id: imageId }
            });

            // ถ้าเป็นรูปหลักและยังมีรูปอื่น ให้ตั้งรูปแรกเป็นหลักแทน
            if (imageToDelete.isPrimary && listing.images.length > 1) {
                const remainingImages = listing.images.filter(img => img.id !== imageId);
                if (remainingImages.length > 0) {
                    await prisma.vehicleImage.update({
                        where: { id: remainingImages[0].id },
                        data: { isPrimary: true }
                    });
                }
            }

            // ดึงรูปที่เหลือกลับมา
            const remainingImages = await prisma.vehicleImage.findMany({
                where: { listingId: id },
                orderBy: { order: 'asc' }
            });

            return {
                message: "ลบรูปภาพสำเร็จ",
                images: remainingImages
            };
        } catch (error) {
            console.error(error);
            set.status = 500;
            return { message: "เกิดข้อผิดพลาดในการลบรูปภาพ" };
        }
    })

    // เรียงลำดับรูปภาพใหม่
    .put("/:id/images/reorder", async ({ params, body, set, auth }) => {
        if (!auth || !auth.userId) { set.status = 401; return { error: "Unauthorized", message: "กรุณาเข้าสู่ระบบ" }; }
        const userId = auth.userId;
        const { id } = params;
        const { imageIds } = body;

        // ตรวจสอบ listing
        const listing = await prisma.vehicleListing.findUnique({
            where: { id }
        });

        if (!listing) {
            set.status = 404;
            return { message: "ไม่พบประกาศนี้" };
        }

        if (listing.userId !== userId) {
            set.status = 403;
            return { message: "คุณไม่มีสิทธิ์แก้ไขประกาศนี้" };
        }

        try {
            // อัพเดท order และ isPrimary
            await Promise.all(imageIds.map((imageId: string, index: number) =>
                prisma.vehicleImage.update({
                    where: { id: imageId },
                    data: {
                        order: index,
                        isPrimary: index === 0
                    }
                })
            ));

            // ดึงรูปที่อัพเดทแล้วกลับมา
            const updatedImages = await prisma.vehicleImage.findMany({
                where: { listingId: id },
                orderBy: { order: 'asc' }
            });

            return {
                message: "เรียงลำดับรูปภาพสำเร็จ",
                images: updatedImages
            };
        } catch (error) {
            console.error(error);
            set.status = 500;
            return { message: "เกิดข้อผิดพลาดในการเรียงลำดับรูปภาพ" };
        }
    }, {
        body: t.Object({
            imageIds: t.Array(t.String())
        })
    })

    // ตั้งรูปหลัก
    .put("/:id/images/:imageId/primary", async ({ params, set, auth }) => {
        if (!auth || !auth.userId) { set.status = 401; return { error: "Unauthorized", message: "กรุณาเข้าสู่ระบบ" }; }
        const userId = auth.userId;
        const { id, imageId } = params;

        // ตรวจสอบ listing
        const listing = await prisma.vehicleListing.findUnique({
            where: { id },
            include: { images: true }
        });

        if (!listing) {
            set.status = 404;
            return { message: "ไม่พบประกาศนี้" };
        }

        if (listing.userId !== userId) {
            set.status = 403;
            return { message: "คุณไม่มีสิทธิ์แก้ไขประกาศนี้" };
        }

        // หา image ที่ต้องการตั้งเป็นหลัก
        const targetImage = listing.images.find(img => img.id === imageId);
        if (!targetImage) {
            set.status = 404;
            return { message: "ไม่พบรูปภาพนี้" };
        }

        try {
            // ยกเลิกรูปหลักเดิม
            await prisma.vehicleImage.updateMany({
                where: { listingId: id, isPrimary: true },
                data: { isPrimary: false }
            });

            // ตั้งรูปใหม่เป็นหลัก
            await prisma.vehicleImage.update({
                where: { id: imageId },
                data: { isPrimary: true, order: 0 }
            });

            // ดึงรูปที่อัพเดทแล้วกลับมา
            const updatedImages = await prisma.vehicleImage.findMany({
                where: { listingId: id },
                orderBy: { order: 'asc' }
            });

            return {
                message: "ตั้งรูปหลักสำเร็จ",
                images: updatedImages
            };
        } catch (error) {
            console.error(error);
            set.status = 500;
            return { message: "เกิดข้อผิดพลาดในการตั้งรูปหลัก" };
        }
    })

    // อัพเดทราคาและเผยแพร่ประกาศ
    .patch("/:id/publish", async ({ params, body, set, auth }) => {
        if (!auth || !auth.userId) { set.status = 401; return { error: "Unauthorized", message: "กรุณาเข้าสู่ระบบ" }; }
        const userId = auth.userId;
        const { id } = params;
        const { price } = body;

        // ตรวจสอบ listing
        const listing = await prisma.vehicleListing.findUnique({
            where: { id },
            include: { images: true }
        });

        if (!listing) {
            set.status = 404;
            return { message: "ไม่พบประกาศนี้" };
        }

        if (listing.userId !== userId) {
            set.status = 403;
            return { message: "คุณไม่มีสิทธิ์แก้ไขประกาศนี้" };
        }

        // ตรวจสอบว่ามีรูปภาพหรือยัง
        if (listing.images.length === 0) {
            set.status = 400;
            return { message: "กรุณาอัพโหลดรูปภาพอย่างน้อย 1 รูป" };
        }

        try {
            // ตรวจสอบแพ็กเกจผู้ใช้ — Basic (Free) อาจต้องรอ admin อนุมัติ
            // ขึ้นกับการตั้งค่า BASIC_LISTING_REQUIRES_APPROVAL (เปิดอยู่ตามค่าเริ่มต้น)
            const userWithPkg = await prisma.user.findUnique({
                where: { id: userId },
                select: { currentPackage: { select: { slug: true, price: true, listingDurationDays: true } } }
            });

            const isBasicFree = !userWithPkg?.currentPackage
                || userWithPkg.currentPackage.slug === 'basic'
                || Number(userWithPkg.currentPackage.price) === 0;

            // Admin global flag — when false, Basic listings auto-publish like paid packages.
            const basicRequiresApproval = await getSetting('BASIC_LISTING_REQUIRES_APPROVAL');

            const requiresApproval = isBasicFree && basicRequiresApproval;
            const newStatus = requiresApproval ? "PENDING" : "ACTIVE";
            const durationDays = userWithPkg?.currentPackage?.listingDurationDays ?? 30;

            const updatedListing = await prisma.vehicleListing.update({
                where: { id },
                data: {
                    price,
                    status: newStatus,
                    // ตั้ง publishedAt + expiredAt เฉพาะเมื่อ ACTIVE ทันที (แพ็กเกจที่ไม่ใช่ Basic)
                    ...(newStatus === "ACTIVE" ? {
                        publishedAt: new Date(),
                        expiredAt: getListingExpiryDate(durationDays)
                    } : {})
                },
                include: {
                    images: true,
                    user: {
                        select: {
                            id: true,
                            fullName: true,
                            phoneNumber: true,
                        }
                    }
                }
            });

            // Notify admin SSE clients if listing is pending approval
            if (newStatus === "PENDING") {
                getAndBroadcastPendingCounts();
            }

            return {
                message: requiresApproval
                    ? "ส่งประกาศเพื่อรอการตรวจสอบจากผู้ดูแลระบบ"
                    : "เผยแพร่ประกาศสำเร็จ",
                listing: updatedListing,
                requiresApproval
            };
        } catch (error) {
            console.error(error);
            set.status = 500;
            return { message: "เกิดข้อผิดพลาดในการเผยแพร่ประกาศ" };
        }
    }, {
        body: t.Object({
            price: t.Number()
        })
    })

    // อัพเดทข้อมูลประกาศ
    .put("/:id", async ({ params, body, set, auth }) => {
        if (!auth || !auth.userId) { set.status = 401; return { error: "Unauthorized", message: "กรุณาเข้าสู่ระบบ" }; }
        const userId = auth.userId;
        const { id } = params;
        const { ...updateData } = body;

        // ตรวจสอบ listing
        const listing = await prisma.vehicleListing.findUnique({
            where: { id }
        });

        if (!listing) {
            set.status = 404;
            return { message: "ไม่พบประกาศนี้" };
        }

        if (listing.userId !== userId) {
            set.status = 403;
            return { message: "คุณไม่มีสิทธิ์แก้ไขประกาศนี้" };
        }

        // Basic (free) package ไม่อนุญาตให้ใส่ facebookUrl
        const updatePkg = await getUserPackage(userId);
        const allowedFbUrl = !updatePkg.id ? null : (updateData.facebookUrl || null);

        // Sanitize update data before database operation
        const sanitizedUpdate = sanitizeObject(updateData as Record<string, unknown>);

        try {
            const updatedListing = await prisma.vehicleListing.update({
                where: { id },
                data: {
                    vehicleType: sanitizedUpdate.vehicleType as any,
                    title: sanitizedUpdate.title as string,
                    description: sanitizedUpdate.description as string | undefined,
                    price: sanitizedUpdate.price as number,
                    brand: sanitizedUpdate.brand as string,
                    model: sanitizedUpdate.model as string,
                    subModel: sanitizedUpdate.subModel as string | undefined,
                    year: sanitizedUpdate.year as number,
                    color: sanitizedUpdate.color as string,
                    fuelType: sanitizedUpdate.fuelType as any,
                    transmission: sanitizedUpdate.transmission as any,
                    engineSize: sanitizedUpdate.engineSize as number | undefined,
                    seats: sanitizedUpdate.seats as number | undefined,
                    mileage: (sanitizedUpdate.mileage as number | null | undefined) ?? null,
                    bodyType: sanitizedUpdate.bodyType as any,
                    plateProvince: sanitizedUpdate.plateProvince as string | undefined,
                    registrationType: (sanitizedUpdate.registrationType as any) ?? "PERSONAL",
                    condition: sanitizedUpdate.condition as any,
                    hasAccident: (sanitizedUpdate.hasAccident as boolean) ?? false,
                    hasModified: (sanitizedUpdate.hasModified as boolean) ?? false,
                    hasWarranty: (sanitizedUpdate.hasWarranty as boolean) ?? false,
                    province: (sanitizedUpdate.province as string | null | undefined) || null,
                    district: sanitizedUpdate.district as string | undefined,
                    contactName: sanitizedUpdate.contactName as string | undefined,
                    contactPhone: sanitizedUpdate.contactPhone as string | undefined,
                    lineId: sanitizedUpdate.lineId as string | undefined,
                    facebookUrl: allowedFbUrl,
                    // Vehicle Extras
                    taxPaid: (sanitizedUpdate.taxPaid as boolean) ?? false,
                    registrationBookStatus: (sanitizedUpdate.registrationBookStatus as any) ?? "READY",
                    insuranceDetails: sanitizedUpdate.insuranceDetails as string | undefined,
                    warrantyDetails: sanitizedUpdate.warrantyDetails as string | undefined,
                    bsiDetails: sanitizedUpdate.bsiDetails as string | undefined,
                    gasType: (sanitizedUpdate.gasType as any) ?? "NONE",
                    hasSpareKey: (sanitizedUpdate.hasSpareKey as boolean) ?? false,
                },
                include: {
                    images: {
                        orderBy: { order: 'asc' }
                    },
                    user: {
                        select: {
                            id: true,
                            fullName: true,
                            phoneNumber: true,
                        }
                    }
                }
            });

            // Auto-enrich master data with any new model / sub-model the seller typed
            // (user may have edited model/subModel). Non-blocking.
            if (sanitizedUpdate.brand && sanitizedUpdate.model) {
                ensureModelAndSubModel({
                    vehicleType: sanitizedUpdate.vehicleType as 'CAR' | 'MOTORCYCLE',
                    brand: sanitizedUpdate.brand as string,
                    model: sanitizedUpdate.model as string,
                    subModel: sanitizedUpdate.subModel as string | undefined,
                    bodyType: sanitizedUpdate.bodyType as string | undefined,
                    engineSize: sanitizedUpdate.engineSize as number | undefined,
                    fuelType: sanitizedUpdate.fuelType as string | undefined,
                    transmission: sanitizedUpdate.transmission as string | undefined,
                    seats: sanitizedUpdate.seats as number | undefined,
                }).catch(err => console.error('ensureModelAndSubModel failed (update):', err));
            }

            return {
                message: "อัพเดทประกาศสำเร็จ",
                listing: updatedListing
            };
        } catch (error) {
            console.error(error);
            set.status = 500;
            return { message: "เกิดข้อผิดพลาดในการอัพเดทประกาศ" };
        }
    }, {
        body: t.Object({
            vehicleType: t.Union([t.Literal("CAR"), t.Literal("MOTORCYCLE")]),
            title: t.String(),
            description: t.Optional(t.String()),
            price: t.Number(),
            brand: t.String(),
            model: t.String(),
            subModel: t.Optional(t.String()),
            year: t.Number(),
            color: t.String(),
            fuelType: t.Optional(t.Union([
                t.Literal("PETROL"),
                t.Literal("DIESEL"),
                t.Literal("HYBRID"),
                t.Literal("PLUGIN_HYBRID"),
                t.Literal("EV"),
                t.Literal("LPG"),
                t.Literal("NGV")
            ])),
            transmission: t.Optional(t.Union([
                t.Literal("AUTOMATIC"),
                t.Literal("MANUAL"),
                t.Literal("CVT"),
                t.Literal("DCT"),
                t.Literal("SEMI_AUTO")
            ])),
            engineSize: t.Optional(t.Number()),
            seats: t.Optional(t.Number()),
            mileage: t.Optional(t.Union([t.Number(), t.Null()])),
            bodyType: t.Optional(t.Union([
                t.Literal("SEDAN"),
                t.Literal("HATCHBACK"),
                t.Literal("SUV"),
                t.Literal("PPV"),
                t.Literal("CROSSOVER"),
                t.Literal("MPV"),
                t.Literal("PICKUP"),
                t.Literal("COUPE"),
                t.Literal("CONVERTIBLE"),
                t.Literal("WAGON"),
                t.Literal("VAN"),
                t.Literal("STANDARD"),
                t.Literal("SCOOTER"),
                t.Literal("SPORT"),
                t.Literal("NAKED"),
                t.Literal("CRUISER"),
                t.Literal("TOURING"),
                t.Literal("ADVENTURE"),
                t.Literal("DIRT"),
                t.Literal("CAFE_RACER"),
                t.Literal("UNDERBONE"),
                t.Literal("CUB")
            ])),
            plateProvince: t.Optional(t.String()),
            registrationType: t.Optional(t.Union([
                t.Literal("PERSONAL"),
                t.Literal("COMPANY")
            ])),
            condition: t.Optional(t.Union([
                t.Literal("EXCELLENT"),
                t.Literal("GOOD"),
                t.Literal("FAIR"),
                t.Literal("POOR")
            ])),
            hasAccident: t.Optional(t.Boolean()),
            hasModified: t.Optional(t.Boolean()),
            hasWarranty: t.Optional(t.Boolean()),
            province: t.Optional(t.String()),
            district: t.Optional(t.String()),
            contactName: t.Optional(t.String()),
            contactPhone: t.Optional(t.String()),
            lineId: t.Optional(t.String()),
            facebookUrl: t.Optional(t.String()),
            // Vehicle Extras
            taxPaid: t.Optional(t.Boolean()),
            registrationBookStatus: t.Optional(t.Union([
                t.Literal("READY"),
                t.Literal("FINANCED")
            ])),
            insuranceDetails: t.Optional(t.String()),
            warrantyDetails: t.Optional(t.String()),
            bsiDetails: t.Optional(t.String()),
            gasType: t.Optional(t.Union([
                t.Literal("NONE"),
                t.Literal("LPG"),
                t.Literal("NGV")
            ])),
            hasSpareKey: t.Optional(t.Boolean())
        })
    })

    // ลบประกาศ
    .delete("/:id", async ({ params, set, auth }) => {
        if (!auth || !auth.userId) { set.status = 401; return { error: "Unauthorized", message: "กรุณาเข้าสู่ระบบ" }; }
        const userId = auth.userId;
        const { id } = params;

        const listing = await prisma.vehicleListing.findUnique({
            where: { id }
        });

        if (!listing) {
            set.status = 404;
            return { message: "ไม่พบประกาศนี้" };
        }

        if (listing.userId !== userId) {
            set.status = 403;
            return { message: "คุณไม่มีสิทธิ์ลบประกาศนี้" };
        }

        try {
            // ลบรูปจาก MinIO
            await deleteListingImages(userId, id);

            // ลบจาก database (cascade จะลบ images ด้วย)
            await prisma.vehicleListing.delete({
                where: { id }
            });

            // ถ้ามี paused listings และยังมี slot ว่างใน effective max → ปลุก FIFO 1 อัน
            const userPkg = await getUserPackage(userId);
            const effectiveMax = userPkg.maxListings; // already includes bonus
            let reactivatedCount = 0;
            if (effectiveMax === -1) {
                const pausedCount = await prisma.vehicleListing.count({
                    where: { userId, status: 'PAUSED' }
                });
                if (pausedCount > 0) reactivatedCount = await reactivatePausedListings(userId, pausedCount);
            } else {
                const currentActive = await prisma.vehicleListing.count({
                    where: { userId, status: { in: ['ACTIVE', 'PENDING', 'DRAFT'] } }
                });
                const available = Math.max(0, effectiveMax - currentActive);
                if (available > 0) reactivatedCount = await reactivatePausedListings(userId, available);
            }

            return {
                message: reactivatedCount > 0
                    ? `ลบประกาศสำเร็จ พร้อมปลุกประกาศที่หยุดชั่วคราว ${reactivatedCount} รายการ`
                    : "ลบประกาศสำเร็จ",
                reactivatedCount,
            };
        } catch (error) {
            console.error(error);
            set.status = 500;
            return { message: "เกิดข้อผิดพลาดในการลบประกาศ" };
        }
    })

    // ต่ออายุ / รีประกาศ
    .post("/:id/renew", async ({ params, body, set, auth }) => {
        if (!auth || !auth.userId) { set.status = 401; return { error: "Unauthorized", message: "กรุณาเข้าสู่ระบบ" }; }
        const userId = auth.userId;
        const { id } = params;
        const { paymentSlip } = body;

        // ตรวจสอบว่าเป็นเจ้าของ + สถานะ EXPIRED
        const listing = await prisma.vehicleListing.findFirst({
            where: { id, userId, status: 'EXPIRED' }
        });

        if (!listing) {
            set.status = 404;
            return { message: "ไม่พบประกาศที่หมดอายุ" };
        }

        const userPkg = await getUserPackage(userId);
        const isBasicFree = !userPkg.id || userPkg.name === 'Basic (Free)';

        if (isBasicFree) {
            // Basic user ต้องจ่าย 49 บาท เพื่อต่ออายุ 45 วัน
            if (!paymentSlip) {
                set.status = 400;
                return {
                    message: "ผู้ใช้แพ็กเกจ Basic ต้องชำระ 49 บาทเพื่อต่ออายุ หรือลบประกาศเดิมแล้วลงใหม่",
                    renewalPrice: 49,
                    renewalDays: 45,
                    requiresPayment: true,
                };
            }

            // ตรวจสอบว่ามี pending renewal อยู่แล้วไหม
            const existingRenewal = await prisma.listingRenewal.findFirst({
                where: { listingId: id, status: 'PENDING' }
            });
            if (existingRenewal) {
                set.status = 400;
                return { message: "มีคำขอต่ออายุรออนุมัติอยู่แล้ว" };
            }

            // สร้าง renewal record → admin ตรวจ → อนุมัติแล้วถึงต่ออายุ
            await prisma.listingRenewal.create({
                data: {
                    listingId: id,
                    userId,
                    amount: 49,
                    slipImage: paymentSlip,
                    status: 'PENDING',
                }
            });

            getAndBroadcastPendingCounts();
            return {
                message: "ส่งคำขอต่ออายุประกาศแล้ว รอการตรวจสอบจาก admin",
                requiresApproval: true,
            };
        } else {
            // Paid package → repost ทันที
            const newExpiry = getListingExpiryDate(userPkg.listingDurationDays);
            await prisma.vehicleListing.update({
                where: { id },
                data: { status: 'ACTIVE', publishedAt: new Date(), expiredAt: newExpiry }
            });

            return {
                message: "รีประกาศสำเร็จ",
                listing: { status: 'ACTIVE', expiredAt: newExpiry },
            };
        }
    }, {
        body: t.Object({
            paymentSlip: t.Optional(t.String()),
        })
    })

    // ดันโพส (manual bump)
    .post("/:id/bump", async ({ params, set, auth }) => {
        if (!auth || !auth.userId) { set.status = 401; return { error: "Unauthorized", message: "กรุณาเข้าสู่ระบบ" }; }
        const userId = auth.userId;
        const { id } = params;

        // ตรวจสอบ listing
        const listing = await prisma.vehicleListing.findFirst({
            where: { id, userId, status: 'ACTIVE' }
        });

        if (!listing) {
            set.status = 404;
            return { message: "ไม่พบประกาศที่กำลังขาย" };
        }

        // ดึง user package → manualBumpPerDay
        const userPkg = await getUserPackage(userId);
        const manualLimit = (userPkg as any).manualBumpPerDay ?? 0;

        if (manualLimit <= 0) {
            set.status = 400;
            return { message: "แพ็กเกจของคุณไม่รองรับการดันโพส" };
        }

        // นับ manual bumps วันนี้ ต่อคัน (per-listing)
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const todayBumps = await prisma.listingBumpLog.count({
            where: {
                listingId: id,
                type: 'MANUAL',
                createdAt: { gte: todayStart }
            }
        });

        if (todayBumps >= manualLimit) {
            set.status = 400;
            return {
                message: `ประกาศนี้ถูกดันโพสต์ครบ ${manualLimit} ครั้งแล้ววันนี้`,
                used: todayBumps,
                limit: manualLimit,
            };
        }

        // ดันโพส
        const now = new Date();
        await prisma.$transaction([
            prisma.vehicleListing.update({
                where: { id },
                data: { bumpedAt: now }
            }),
            prisma.listingBumpLog.create({
                data: { listingId: id, userId, type: 'MANUAL' }
            })
        ]);

        return {
            message: "ดันโพสสำเร็จ",
            bumpedAt: now,
            remaining: manualLimit - todayBumps - 1,
        };
    })

    // กำหนด slot ดันโพสอัตโนมัติ
    .put("/:id/bump-slot", async ({ params, body, set, auth }) => {
        if (!auth || !auth.userId) { set.status = 401; return { error: "Unauthorized", message: "กรุณาเข้าสู่ระบบ" }; }
        const userId = auth.userId;
        const { id } = params;
        const { slot } = body as any;

        const listing = await prisma.vehicleListing.findFirst({
            where: { id, userId }
        });

        if (!listing) {
            set.status = 404;
            return { message: "ไม่พบประกาศ" };
        }

        // ดึง package เพื่อเช็คจำนวน slots และ maxListings
        const userPkg = await getUserPackage(userId);
        const autoBump = (userPkg as any).autoBumpPerDay ?? 0;
        const maxListings = userPkg.maxListings;

        if (autoBump <= 0) {
            set.status = 400;
            return { message: "แพ็กเกจของคุณไม่มีระบบดันโพสอัตโนมัติ" };
        }

        // ตรวจสอบว่า slot อยู่ในช่วงที่ถูกต้อง
        if (slot !== null && (slot < 0 || slot >= autoBump)) {
            set.status = 400;
            return { message: `slot ต้องอยู่ระหว่าง 0 ถึง ${autoBump - 1} หรือ null (ให้ระบบจัดให้)` };
        }

        // ตรวจสอบ slot capacity — จำกัดจำนวน listing ต่อ slot
        if (slot !== null) {
            const maxPerSlot = Math.ceil(maxListings / autoBump);

            // นับ listings ที่กำหนด slot นี้แล้ว (ไม่รวมตัวเอง)
            const currentSlotCount = await prisma.vehicleListing.count({
                where: {
                    userId,
                    autoBumpSlot: slot,
                    status: 'ACTIVE',
                    id: { not: id },
                }
            });

            if (currentSlotCount >= maxPerSlot) {
                const pkg = await prisma.package.findFirst({ where: { id: userPkg.id }, select: { slug: true } });
                const schedules = AUTO_BUMP_SCHEDULES[pkg?.slug || ''] || [];
                set.status = 400;
                return {
                    message: `Slot ${slot + 1} (${schedules[slot] || ''}) เต็มแล้ว (สูงสุด ${maxPerSlot} คัน/slot)`,
                    maxPerSlot,
                    currentCount: currentSlotCount,
                };
            }
        }

        await prisma.vehicleListing.update({
            where: { id },
            data: { autoBumpSlot: slot }
        });

        // หาเวลาของ slot + slot info
        const pkg = await prisma.package.findFirst({ where: { id: userPkg.id }, select: { slug: true } });
        const schedules = AUTO_BUMP_SCHEDULES[pkg?.slug || ''] || [];
        const slotTime = slot !== null && schedules[slot] ? schedules[slot] : 'ระบบจัดให้อัตโนมัติ';
        const maxPerSlot = Math.ceil(maxListings / autoBump);

        return {
            message: "กำหนด slot สำเร็จ",
            slot,
            scheduledTime: slotTime,
            maxPerSlot,
        };
    }, {
        body: t.Object({
            slot: t.Union([t.Number(), t.Null()]),
        })
    });

// ===== Combined export =====
export const listingRoutes = new Elysia()
    .use(publicListingRoutes)
    .use(protectedListingRoutes);
