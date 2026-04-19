/**
 * Listing pause/unpause logic
 *
 * เมื่อ user downgrade จากแพ็กเกจจ่ายเงิน → Basic และมี active listings เกิน 3:
 *   - เก็บ 3 ล่าสุด (bumped/published/created) ไว้ active — แต่ cap expiredAt ให้ไม่เกิน
 *     publishedAt + basicDurationDays (45 วัน) เพื่อไม่ให้ Dealer-era expiredAt ยาวเกินจริง
 *   - ที่เหลือถูก PAUSED, remainingDays = days ที่เหลือจาก expiredAt เดิม (freeze ไว้)
 *
 * เมื่อ unpause (upgrade package หรือลบ active listing จนมีที่ว่าง):
 *   - expiredAt = now + remainingDays (timer เริ่มนับต่อจากที่ freeze ไว้)
 */

import prisma from "../db";

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const BASIC_MAX_LISTINGS = 3;
const BASIC_DURATION_DAYS = 45;

function diffDaysCeil(future: Date, past: Date): number {
    return Math.max(0, Math.ceil((future.getTime() - past.getTime()) / MS_PER_DAY));
}

/**
 * เรียงลำดับ active listings → เก็บ N อันดับแรก, pause ที่เหลือ
 * เรียง: bumpedAt desc → publishedAt desc → createdAt desc (ใหม่/ดันล่าสุดได้อยู่ต่อ)
 *
 * @param userId owner
 * @param keepCount จำนวนที่ให้ active ต่อ (เช่น 3 + bonusSlots)
 * @param capDurationDays ถ้ามี — cap kept listings' expiredAt ไว้ที่ publishedAt + capDurationDays
 */
export async function pauseExcessListings(userId: string, keepCount: number, capDurationDays?: number) {
    const activeListings = await prisma.vehicleListing.findMany({
        where: { userId, status: 'ACTIVE' },
        orderBy: [
            { bumpedAt: 'desc' },
            { publishedAt: 'desc' },
            { createdAt: 'desc' },
        ],
    });

    if (activeListings.length <= keepCount) {
        // ไม่เกิน limit ใหม่ — แค่ cap duration ถ้ามี
        if (capDurationDays !== undefined) {
            await capExpiry(activeListings, capDurationDays);
        }
        return { pausedCount: 0, keptCount: activeListings.length };
    }

    const keep = activeListings.slice(0, keepCount);
    const pause = activeListings.slice(keepCount);
    const now = new Date();

    // Pause excess listings
    for (const l of pause) {
        const remaining = l.expiredAt ? diffDaysCeil(l.expiredAt, now) : 0;
        await prisma.vehicleListing.update({
            where: { id: l.id },
            data: {
                status: 'PAUSED',
                pausedAt: now,
                remainingDays: remaining,
            },
        });
    }

    // Cap kept listings' expiredAt if downgrading to shorter-duration plan
    if (capDurationDays !== undefined) {
        await capExpiry(keep, capDurationDays);
    }

    return { pausedCount: pause.length, keptCount: keep.length };
}

async function capExpiry(
    listings: Array<{ id: string; expiredAt: Date | null; publishedAt: Date | null }>,
    capDurationDays: number,
) {
    for (const l of listings) {
        const anchor = l.publishedAt ?? l.expiredAt; // fallback
        if (!anchor) continue;
        const capDate = new Date(anchor.getTime() + capDurationDays * MS_PER_DAY);
        if (!l.expiredAt || capDate.getTime() < l.expiredAt.getTime()) {
            await prisma.vehicleListing.update({
                where: { id: l.id },
                data: { expiredAt: capDate },
            });
        }
    }
}

/**
 * ปลุก paused listings กลับมา active — FIFO จาก pausedAt เก่าสุด
 * expiredAt = now + remainingDays (timer นับต่อ)
 *
 * @param userId owner
 * @param availableSlots จำนวน slot ว่าง (effectiveMax - currentActive)
 * @returns จำนวน listing ที่ถูก reactivate
 */
export async function reactivatePausedListings(userId: string, availableSlots: number): Promise<number> {
    if (availableSlots <= 0) return 0;

    const paused = await prisma.vehicleListing.findMany({
        where: { userId, status: 'PAUSED' },
        orderBy: [
            { pausedAt: 'asc' },
            { createdAt: 'asc' },
        ],
        take: availableSlots,
    });

    if (paused.length === 0) return 0;

    const now = new Date();
    for (const l of paused) {
        const remaining = Math.max(0, l.remainingDays ?? 0);
        const newExpiry = new Date(now.getTime() + remaining * MS_PER_DAY);
        await prisma.vehicleListing.update({
            where: { id: l.id },
            data: {
                status: 'ACTIVE',
                pausedAt: null,
                remainingDays: null,
                expiredAt: newExpiry,
            },
        });
    }
    return paused.length;
}

/**
 * Downgrade user → Basic + pause excess listings
 * — เรียกเมื่อ package หมดอายุและไม่ต่อ
 */
export async function downgradeUserToBasic(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { bonusListingSlots: true, currentPackageId: true },
    });
    if (!user) return null;

    // ถ้า Basic อยู่แล้ว ไม่ต้องทำ
    if (!user.currentPackageId) return { pausedCount: 0, keptCount: 0, alreadyBasic: true };

    // Clear package
    await prisma.user.update({
        where: { id: userId },
        data: { currentPackageId: null, packageExpiresAt: null },
    });

    const basicMax = BASIC_MAX_LISTINGS + (user.bonusListingSlots ?? 0);
    const result = await pauseExcessListings(userId, basicMax, BASIC_DURATION_DAYS);
    return { ...result, alreadyBasic: false };
}

/**
 * คำนวณ effective max listings จาก package slug + bonus
 */
export function getEffectiveMaxListings(packageMaxListings: number | undefined | null, bonusSlots: number): number {
    const pkgMax = packageMaxListings ?? BASIC_MAX_LISTINGS;
    if (pkgMax === -1) return -1; // unlimited
    return pkgMax + (bonusSlots ?? 0);
}

export { BASIC_MAX_LISTINGS, BASIC_DURATION_DAYS, MS_PER_DAY };
