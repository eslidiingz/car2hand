import { Elysia, t } from 'elysia';
import prisma from './db';
import { jwtPlugin, isTokenBlacklisted, JWTPayload } from './jwt';

// Type for wishlist with listing
interface WishlistWithListing {
    id: string;
    userId: string;
    listingId: string;
    createdAt: Date;
    listing: {
        id: string;
        title: string;
        price: { toString(): string };
        vehicleType: string;
        brand: string;
        model: string;
        year: number;
        mileage: number;
        fuelType: string;
        transmission: string | null;
        province: string;
        user: {
            id: string;
            fullName: string;
        };
        images: Array<{
            url: string;
            isPrimary: boolean;
        }>;
    };
}

export const wishlistRoutes = new Elysia({ prefix: '/wishlists' })
    .use(jwtPlugin())

    // Get user's wishlist
    .get('/', async ({ jwt, request, set }) => {
        // Get token from header
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            set.status = 401;
            return { error: 'Unauthorized', message: 'กรุณาเข้าสู่ระบบ' };
        }

        const token = authHeader.substring(7);
        if (isTokenBlacklisted(token)) {
            set.status = 401;
            return { error: 'Unauthorized', message: 'Token ถูกยกเลิกแล้ว' };
        }

        const payload = await jwt.verify(token) as JWTPayload | false;
        if (!payload) {
            set.status = 401;
            return { error: 'Unauthorized', message: 'Token ไม่ถูกต้อง' };
        }

        const wishlists = await prisma.wishlist.findMany({
            where: { userId: payload.userId },
            include: {
                listing: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                fullName: true
                            }
                        },
                        images: {
                            orderBy: { order: 'asc' }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        }) as WishlistWithListing[];

        // Transform to frontend format
        const items = wishlists.map((w: WishlistWithListing) => ({
            id: w.listing.id,
            title: w.listing.title,
            price: Number(w.listing.price),
            vehicleType: w.listing.vehicleType,
            brand: w.listing.brand,
            model: w.listing.model,
            year: w.listing.year,
            mileage: w.listing.mileage,
            fuelType: w.listing.fuelType,
            transmission: w.listing.transmission,
            province: w.listing.province,
            imageUrl: w.listing.images[0]?.url,
            images: w.listing.images.map((img: { url: string; isPrimary: boolean }) => ({
                url: img.url,
                isPrimary: img.isPrimary
            })),
            user: w.listing.user,
            addedAt: w.createdAt.toISOString()
        }));

        return { wishlists: items };
    })

    // Add to wishlist
    .post('/:listingId', async ({ params, jwt, request, set }) => {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            set.status = 401;
            return { error: 'Unauthorized', message: 'กรุณาเข้าสู่ระบบ' };
        }

        const token = authHeader.substring(7);
        if (isTokenBlacklisted(token)) {
            set.status = 401;
            return { error: 'Unauthorized', message: 'Token ถูกยกเลิกแล้ว' };
        }

        const payload = await jwt.verify(token) as JWTPayload | false;
        if (!payload) {
            set.status = 401;
            return { error: 'Unauthorized', message: 'Token ไม่ถูกต้อง' };
        }

        const { listingId } = params;

        // Check if listing exists
        const listing = await prisma.vehicleListing.findUnique({
            where: { id: listingId }
        });

        if (!listing) {
            return { success: false, message: 'ไม่พบรายการนี้' };
        }

        // ห้ามถูกใจรถของตนเอง
        if (listing.userId === payload.userId) {
            set.status = 400;
            return { success: false, message: 'ไม่สามารถบันทึกรายการของตัวเองได้' };
        }

        // Check if already in wishlist
        const existing = await prisma.wishlist.findUnique({
            where: {
                userId_listingId: {
                    userId: payload.userId,
                    listingId
                }
            }
        });

        if (existing) {
            return { success: false, message: 'รายการนี้อยู่ในรายการโปรดแล้ว' };
        }

        // Create wishlist entry
        await prisma.wishlist.create({
            data: {
                userId: payload.userId,
                listingId
            }
        });

        // Increment favorite count
        await prisma.vehicleListing.update({
            where: { id: listingId },
            data: { favoriteCount: { increment: 1 } }
        });

        return { success: true, message: 'เพิ่มในรายการโปรดแล้ว' };
    }, {
        params: t.Object({
            listingId: t.String()
        })
    })

    // Remove from wishlist
    .delete('/:listingId', async ({ params, jwt, request, set }) => {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            set.status = 401;
            return { error: 'Unauthorized', message: 'กรุณาเข้าสู่ระบบ' };
        }

        const token = authHeader.substring(7);
        if (isTokenBlacklisted(token)) {
            set.status = 401;
            return { error: 'Unauthorized', message: 'Token ถูกยกเลิกแล้ว' };
        }

        const payload = await jwt.verify(token) as JWTPayload | false;
        if (!payload) {
            set.status = 401;
            return { error: 'Unauthorized', message: 'Token ไม่ถูกต้อง' };
        }

        const { listingId } = params;

        // Delete wishlist entry
        const deleted = await prisma.wishlist.deleteMany({
            where: {
                userId: payload.userId,
                listingId
            }
        });

        if (deleted.count > 0) {
            // Decrement favorite count
            await prisma.vehicleListing.update({
                where: { id: listingId },
                data: { favoriteCount: { decrement: 1 } }
            });

            return { success: true, message: 'ลบออกจากรายการโปรดแล้ว' };
        }

        return { success: false, message: 'ไม่พบรายการนี้ในรายการโปรด' };
    }, {
        params: t.Object({
            listingId: t.String()
        })
    })

    // Check if listing is in wishlist
    .get('/check/:listingId', async ({ params, jwt, request }) => {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return { isInWishlist: false };
        }

        const token = authHeader.substring(7);
        if (isTokenBlacklisted(token)) {
            return { isInWishlist: false };
        }

        const payload = await jwt.verify(token) as JWTPayload | false;
        if (!payload) {
            return { isInWishlist: false };
        }

        const wishlist = await prisma.wishlist.findUnique({
            where: {
                userId_listingId: {
                    userId: payload.userId,
                    listingId: params.listingId
                }
            }
        });

        return { isInWishlist: !!wishlist };
    }, {
        params: t.Object({
            listingId: t.String()
        })
    })

    // Clear all wishlist
    .delete('/', async ({ jwt, request, set }) => {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            set.status = 401;
            return { error: 'Unauthorized', message: 'กรุณาเข้าสู่ระบบ' };
        }

        const token = authHeader.substring(7);
        if (isTokenBlacklisted(token)) {
            set.status = 401;
            return { error: 'Unauthorized', message: 'Token ถูกยกเลิกแล้ว' };
        }

        const payload = await jwt.verify(token) as JWTPayload | false;
        if (!payload) {
            set.status = 401;
            return { error: 'Unauthorized', message: 'Token ไม่ถูกต้อง' };
        }

        // Get all wishlist items for decrementing counts
        const wishlists = await prisma.wishlist.findMany({
            where: { userId: payload.userId },
            select: { listingId: true }
        });

        // Delete all wishlist entries
        await prisma.wishlist.deleteMany({
            where: { userId: payload.userId }
        });

        // Decrement favorite counts for all listings
        for (const w of wishlists) {
            await prisma.vehicleListing.update({
                where: { id: w.listingId },
                data: { favoriteCount: { decrement: 1 } }
            }).catch(() => { }); // Ignore if listing doesn't exist
        }

        return { success: true, message: 'ล้างรายการโปรดทั้งหมดแล้ว' };
    });
